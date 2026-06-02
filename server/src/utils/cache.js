/**
 * A tiny, dependency-free in-memory TTL cache.
 *
 * Used to satisfy the brief's caching requirement: identical GitHub requests
 * made within the TTL window are served from memory instead of hitting the
 * GitHub API again, which protects us from rate limits and speeds up repeated
 * searches. Expired entries are evicted lazily on read.
 */
export class TtlCache {
  constructor(ttlMs) {
    this.ttlMs = ttlMs;
    this.store = new Map();
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return undefined;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key, value) {
    this.store.set(key, { value, expiresAt: Date.now() + this.ttlMs });
  }

  has(key) {
    return this.get(key) !== undefined;
  }

  /** Number of live (non-expired) entries — primarily useful for tests. */
  get size() {
    return this.store.size;
  }

  clear() {
    this.store.clear();
  }
}
