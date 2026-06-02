import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TtlCache } from '../src/utils/cache.js';

describe('TtlCache', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('returns a stored value before it expires', () => {
    const cache = new TtlCache(60_000);
    cache.set('octocat', 'value');
    vi.advanceTimersByTime(59_000);
    expect(cache.get('octocat')).toBe('value');
  });

  it('evicts a value once the TTL has passed', () => {
    const cache = new TtlCache(60_000);
    cache.set('octocat', 'value');
    vi.advanceTimersByTime(61_000);
    expect(cache.get('octocat')).toBeUndefined();
    expect(cache.size).toBe(0);
  });

  it('reports membership correctly', () => {
    const cache = new TtlCache(1_000);
    expect(cache.has('x')).toBe(false);
    cache.set('x', 1);
    expect(cache.has('x')).toBe(true);
  });
});
