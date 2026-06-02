import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'gre:recent-searches';
const MAX_ENTRIES = 6;

function read() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

/**
 * Keeps a most-recent-first list of searched usernames in localStorage,
 * de-duplicated case-insensitively and capped at MAX_ENTRIES.
 */
export function useRecentSearches() {
  const [searches, setSearches] = useState(read);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(searches));
    } catch {
      /* storage may be unavailable (private mode); fail silently */
    }
  }, [searches]);

  const add = useCallback((username) => {
    const trimmed = username.trim();
    if (!trimmed) return;
    setSearches((prev) => {
      const withoutDupes = prev.filter((u) => u.toLowerCase() !== trimmed.toLowerCase());
      return [trimmed, ...withoutDupes].slice(0, MAX_ENTRIES);
    });
  }, []);

  const remove = useCallback((username) => {
    setSearches((prev) => prev.filter((u) => u.toLowerCase() !== username.toLowerCase()));
  }, []);

  const clear = useCallback(() => setSearches([]), []);

  return { searches, add, remove, clear };
}
