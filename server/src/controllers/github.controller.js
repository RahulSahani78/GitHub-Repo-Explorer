import { ApiError } from '../utils/ApiError.js';
import { getProfile, getRepos } from '../services/github.service.js';
import { aggregateLanguages, paginate, sortRepos } from '../services/repos.transform.js';

// GitHub usernames: alphanumeric and single hyphens, 1–39 chars.
const USERNAME_PATTERN = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;
const VALID_SORTS = ['stars', 'name', 'updated'];
const VALID_DIRECTIONS = ['asc', 'desc'];

function assertValidUsername(username) {
  if (!USERNAME_PATTERN.test(username)) {
    throw ApiError.badRequest(`"${username}" is not a valid GitHub username.`);
  }
}

/** GET /api/github/users/:username */
export async function getUserProfile(req, res) {
  const { username } = req.params;
  assertValidUsername(username);

  try {
    const { profile, cached } = await getProfile(username);
    res.json({ profile, meta: { cached } });
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) {
      throw ApiError.notFound(`GitHub user "${username}" was not found.`);
    }
    throw error;
  }
}

/**
 * GET /api/github/users/:username/repos
 * Query: sort=stars|name|updated, direction=asc|desc, page, perPage
 *
 * The full repo set is fetched (and cached) once, then sorted, paginated, and
 * language-aggregated server-side so the client gets exactly the page it needs.
 */
export async function getUserRepos(req, res) {
  const { username } = req.params;
  assertValidUsername(username);

  const sort = parseSort(req.query.sort);
  const direction = parseDirection(req.query.direction);
  const page = parsePositiveInt(req.query.page, 1);
  const perPage = Math.min(parsePositiveInt(req.query.perPage, 12), 100);

  try {
    const { repos, cached, truncated } = await getRepos(username);
    const sorted = sortRepos(repos, sort, direction);
    const { items, pagination } = paginate(sorted, page, perPage);

    res.json({
      items,
      pagination,
      languages: aggregateLanguages(repos),
      meta: { cached, truncated },
    });
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) {
      throw ApiError.notFound(`GitHub user "${username}" was not found.`);
    }
    throw error;
  }
}

/* ------------------------------ Query parsing ------------------------------ */

function parseSort(raw) {
  return VALID_SORTS.includes(raw) ? raw : 'stars';
}

function parseDirection(raw) {
  return VALID_DIRECTIONS.includes(raw) ? raw : undefined;
}

function parsePositiveInt(raw, fallback) {
  const value = Number(raw);
  return Number.isInteger(value) && value > 0 ? value : fallback;
}
