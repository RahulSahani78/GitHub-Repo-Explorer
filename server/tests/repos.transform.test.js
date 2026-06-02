import { describe, expect, it } from 'vitest';
import {
  aggregateLanguages,
  paginate,
  sortRepos,
} from '../src/services/repos.transform.js';

/** Minimal repo factory — only the fields the transforms touch matter here. */
function repo(overrides) {
  return {
    id: 1,
    name: 'repo',
    language: null,
    stars: 0,
    pushedAt: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('sortRepos', () => {
  const repos = [
    repo({ name: 'beta', stars: 5, pushedAt: '2024-03-01T00:00:00Z' }),
    repo({ name: 'alpha', stars: 50, pushedAt: '2024-01-01T00:00:00Z' }),
    repo({ name: 'gamma', stars: 10, pushedAt: '2024-06-01T00:00:00Z' }),
  ];

  it('sorts by stars descending by default', () => {
    expect(sortRepos(repos, 'stars').map((r) => r.stars)).toEqual([50, 10, 5]);
  });

  it('sorts by name ascending by default', () => {
    expect(sortRepos(repos, 'name').map((r) => r.name)).toEqual(['alpha', 'beta', 'gamma']);
  });

  it('sorts by last pushed date, newest first', () => {
    expect(sortRepos(repos, 'updated').map((r) => r.name)).toEqual(['gamma', 'beta', 'alpha']);
  });

  it('honours an explicit direction override', () => {
    expect(sortRepos(repos, 'stars', 'asc').map((r) => r.stars)).toEqual([5, 10, 50]);
  });

  it('does not mutate the input array', () => {
    const input = [...repos];
    sortRepos(input, 'stars');
    expect(input).toEqual(repos);
  });
});

describe('paginate', () => {
  const items = Array.from({ length: 25 }, (_, i) => i + 1);

  it('returns the requested slice with correct metadata', () => {
    const { items: page, pagination } = paginate(items, 2, 10);
    expect(page).toEqual([11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
    expect(pagination).toMatchObject({
      page: 2,
      perPage: 10,
      total: 25,
      totalPages: 3,
      hasNextPage: true,
      hasPrevPage: true,
    });
  });

  it('clamps an out-of-range page to the last page', () => {
    const { pagination } = paginate(items, 99, 10);
    expect(pagination.page).toBe(3);
    expect(pagination.hasNextPage).toBe(false);
  });
});

describe('aggregateLanguages', () => {
  it('counts languages and ignores nulls, most-used first', () => {
    const repos = [
      repo({ language: 'TypeScript' }),
      repo({ language: 'TypeScript' }),
      repo({ language: 'Go' }),
      repo({ language: null }),
    ];
    expect(aggregateLanguages(repos)).toEqual([
      { name: 'TypeScript', count: 2 },
      { name: 'Go', count: 1 },
    ]);
  });
});
