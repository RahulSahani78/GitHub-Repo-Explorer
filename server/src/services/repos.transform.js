/**
 * Pure, side-effect-free helpers for shaping a repo list. Keeping these
 * separate from the network layer makes them trivial to unit-test and reason
 * about: same input, same output, every time.
 */

const DEFAULT_DIRECTION = {
  stars: 'desc',
  updated: 'desc',
  name: 'asc',
};

export function sortRepos(repos, sort, direction) {
  const dir = direction ?? DEFAULT_DIRECTION[sort] ?? 'desc';
  const factor = dir === 'asc' ? 1 : -1;

  // Copy first so we never mutate the cached array.
  return [...repos].sort((a, b) => {
    switch (sort) {
      case 'stars':
        return (a.stars - b.stars) * factor;
      case 'name':
        return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }) * factor;
      case 'updated':
        return (Date.parse(a.pushedAt) - Date.parse(b.pushedAt)) * factor;
      default:
        return 0;
    }
  });
}

export function paginate(items, page, perPage) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * perPage;

  return {
    items: items.slice(start, start + perPage),
    pagination: {
      page: safePage,
      perPage,
      total,
      totalPages,
      hasNextPage: safePage < totalPages,
      hasPrevPage: safePage > 1,
    },
  };
}

/**
 * Aggregates primary languages across the *entire* repo set (not just the
 * current page), sorted most-used first. Feeds the language chart on the client.
 */
export function aggregateLanguages(repos) {
  const counts = new Map();
  for (const repo of repos) {
    if (!repo.language) continue;
    counts.set(repo.language, (counts.get(repo.language) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}
