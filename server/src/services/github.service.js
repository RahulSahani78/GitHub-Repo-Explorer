import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { TtlCache } from '../utils/cache.js';

const GITHUB_API = 'https://api.github.com';

/**
 * One cache instance per resource kind. Keyed by the normalised (lowercased)
 * username, both expire after the configured TTL (60s by default). This is
 * what makes "the same username requested within 60 seconds returns the cached
 * response" work — and equally shields us from GitHub's rate limit.
 */
const profileCache = new TtlCache(env.cacheTtlMs);
const reposCache = new TtlCache(env.cacheTtlMs);

function buildHeaders() {
  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'github-repo-explorer',
  };
  // The token lives only on the server and is never sent to the browser.
  if (env.githubToken) headers.Authorization = `Bearer ${env.githubToken}`;
  return headers;
}

/**
 * A single, defensive wrapper around fetch() that turns GitHub's various
 * failure modes into typed ApiErrors the rest of the app can rely on.
 */
async function githubFetch(path) {
  let response;
  try {
    response = await fetch(`${GITHUB_API}${path}`, { headers: buildHeaders() });
  } catch {
    // DNS failure, connection refused, offline, etc.
    throw ApiError.badGateway('Unable to reach GitHub. Please check your connection and try again.');
  }

  if (response.ok) return response;

  // Rate limiting: GitHub signals this with 403/429 and a remaining count of 0.
  const remaining = response.headers.get('x-ratelimit-remaining');
  if ((response.status === 403 || response.status === 429) && remaining === '0') {
    const resetHeader = response.headers.get('x-ratelimit-reset');
    const resetAt = resetHeader ? new Date(Number(resetHeader) * 1000).toISOString() : undefined;
    throw ApiError.rateLimited(
      'GitHub API rate limit exceeded. Please wait a moment and try again.',
      { resetAt },
    );
  }

  if (response.status === 404) {
    throw ApiError.notFound('Resource not found on GitHub.');
  }

  // Any other non-2xx (e.g. 5xx from GitHub) surfaces as a bad gateway.
  throw ApiError.badGateway(`GitHub responded with an unexpected status (${response.status}).`);
}

/* ----------------------------- Normalisers ----------------------------- */
/* Map GitHub's raw snake_case payloads onto our clean camelCase domain shapes. */

function normaliseProfile(raw) {
  return {
    login: raw.login,
    name: raw.name ?? null,
    avatarUrl: raw.avatar_url,
    bio: raw.bio ?? null,
    htmlUrl: raw.html_url,
    company: raw.company ?? null,
    location: raw.location ?? null,
    blog: raw.blog || null,
    followers: raw.followers ?? 0,
    following: raw.following ?? 0,
    publicRepos: raw.public_repos ?? 0,
    createdAt: raw.created_at,
  };
}

function normaliseRepo(raw) {
  return {
    id: raw.id,
    name: raw.name,
    fullName: raw.full_name,
    description: raw.description ?? null,
    htmlUrl: raw.html_url,
    language: raw.language ?? null,
    stars: raw.stargazers_count ?? 0,
    forks: raw.forks_count ?? 0,
    watchers: raw.watchers_count ?? 0,
    openIssues: raw.open_issues_count ?? 0,
    defaultBranch: raw.default_branch ?? 'main',
    topics: Array.isArray(raw.topics) ? raw.topics : [],
    isFork: Boolean(raw.fork),
    isArchived: Boolean(raw.archived),
    homepage: raw.homepage || null,
    license: raw.license?.spdx_id ?? raw.license?.name ?? null,
    updatedAt: raw.updated_at,
    pushedAt: raw.pushed_at,
    createdAt: raw.created_at,
  };
}

/* ------------------------------- Public API ------------------------------- */

export async function getProfile(username) {
  const key = username.toLowerCase();

  const cached = profileCache.get(key);
  if (cached) return { profile: cached, cached: true };

  const response = await githubFetch(`/users/${encodeURIComponent(username)}`);
  const profile = normaliseProfile(await response.json());

  profileCache.set(key, profile);
  return { profile, cached: false };
}

/**
 * Fetches *all* of a user's public repositories (up to MAX_REPOS), walking
 * GitHub's pagination at 100/page. We fetch the full set once and cache it so
 * sorting, paginating, and language aggregation can all be done server-side
 * without extra GitHub calls. `truncated` flags when a user has more repos
 * than our cap.
 */
export async function getRepos(username) {
  const key = username.toLowerCase();

  const cached = reposCache.get(key);
  if (cached) return { repos: cached.repos, cached: true, truncated: cached.truncated };

  const perPage = 100;
  const maxPages = Math.ceil(env.maxRepos / perPage);
  const repos = [];
  let truncated = false;

  for (let page = 1; page <= maxPages; page += 1) {
    const response = await githubFetch(
      `/users/${encodeURIComponent(username)}/repos?per_page=${perPage}&page=${page}&sort=pushed`,
    );
    const batch = await response.json();
    repos.push(...batch.map(normaliseRepo));

    // A short page means we've reached the end of the user's repos.
    if (batch.length < perPage) break;
    // We hit our cap but GitHub still had more to give.
    if (page === maxPages && batch.length === perPage) truncated = true;
  }

  reposCache.set(key, { repos, truncated });
  return { repos, cached: false, truncated };
}

/** Exposed for tests so cached state doesn't leak between cases. */
export function __clearCaches() {
  profileCache.clear();
  reposCache.clear();
}
