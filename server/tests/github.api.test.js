import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';

// The GitHub proxy routes are auth-gated. We replace the auth middleware with a
// pass-through so these tests can focus on the proxy/caching behaviour itself.
vi.mock('../src/middleware/auth.js', () => ({
  requireAuth: (req, _res, next) => {
    req.user = { id: 'usr_test', name: 'Test', email: 'test@example.com' };
    next();
  },
}));

const { createApp } = await import('../src/app.js');
const { __clearCaches } = await import('../src/services/github.service.js');

const app = createApp();
const AUTH = ['Authorization', 'Bearer test-token'];

function jsonResponse(status, body, headers = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: (k) => headers[k.toLowerCase()] ?? null },
    json: async () => body,
  };
}

const profileFixture = {
  login: 'octocat',
  name: 'The Octocat',
  avatar_url: 'https://avatars.githubusercontent.com/u/583231',
  bio: 'Hello',
  html_url: 'https://github.com/octocat',
  followers: 100,
  following: 5,
  public_repos: 2,
  created_at: '2011-01-25T18:44:36Z',
};

describe('GitHub API routes', () => {
  beforeEach(() => __clearCaches());
  afterEach(() => vi.restoreAllMocks());

  it('returns a normalised profile and caches the second request', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, profileFixture));
    vi.stubGlobal('fetch', fetchMock);

    const first = await request(app).get('/api/github/users/octocat').set(...AUTH);
    expect(first.status).toBe(200);
    expect(first.body.profile.name).toBe('The Octocat');
    expect(first.body.profile.avatarUrl).toBe(profileFixture.avatar_url);
    expect(first.body.meta.cached).toBe(false);

    const second = await request(app).get('/api/github/users/octocat').set(...AUTH);
    expect(second.body.meta.cached).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('returns 404 with a clear message for an unknown user', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(404, { message: 'Not Found' })));

    const res = await request(app).get('/api/github/users/definitely-not-a-real-user').set(...AUTH);
    expect(res.status).toBe(404);
    expect(res.body.error.message).toContain('was not found');
  });

  it('rejects an invalid username with 400 before calling GitHub', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const res = await request(app).get('/api/github/users/-invalid-').set(...AUTH);
    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('surfaces GitHub rate limiting as 429 with a reset time', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse(403, { message: 'rate limited' }, {
          'x-ratelimit-remaining': '0',
          'x-ratelimit-reset': '1700000000',
        }),
      ),
    );

    const res = await request(app).get('/api/github/users/octocat').set(...AUTH);
    expect(res.status).toBe(429);
    expect(res.body.error.message).toContain('rate limit');
    expect(res.body.error.resetAt).toBeTypeOf('string');
  });

  it('sorts and paginates repos server-side', async () => {
    const repos = [
      { id: 1, name: 'zeta', stargazers_count: 5, language: 'Go', default_branch: 'main', pushed_at: '2024-01-01T00:00:00Z' },
      { id: 2, name: 'alpha', stargazers_count: 99, language: 'TypeScript', default_branch: 'main', pushed_at: '2024-02-01T00:00:00Z' },
    ];
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(200, repos)));

    const res = await request(app)
      .get('/api/github/users/octocat/repos?sort=stars&perPage=1')
      .set(...AUTH);
    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0].name).toBe('alpha');
    expect(res.body.pagination.total).toBe(2);
    expect(res.body.pagination.hasNextPage).toBe(true);
    expect(res.body.languages).toContainEqual({ name: 'TypeScript', count: 1 });
  });
});
