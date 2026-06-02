import { useEffect, useRef, useState } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import { SearchIcon, CloseIcon } from './icons';

// GitHub username rules, mirrored from the backend validator.
const USERNAME_PATTERN = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;

export function SearchBar({ initialValue = '', loading = false, onSearch }) {
  const [value, setValue] = useState(initialValue);
  const debounced = useDebounce(value.trim(), 600);
  const lastSearched = useRef(initialValue.trim());

  useEffect(() => {
    setValue(initialValue);
    lastSearched.current = initialValue.trim();
  }, [initialValue]);

  // Debounced search-as-you-type: only fire for valid usernames we haven't
  // already searched, and never while a request is in flight.
  useEffect(() => {
    if (!debounced || debounced === lastSearched.current) return;
    if (!USERNAME_PATTERN.test(debounced)) return;
    lastSearched.current = debounced;
    onSearch(debounced);
  }, [debounced, onSearch]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    lastSearched.current = trimmed;
    onSearch(trimmed);
  };

  return (
    <form onSubmit={handleSubmit} role="search" className="w-full">
      <label htmlFor="username" className="sr-only">
        GitHub username
      </label>
      <div className="flex items-center gap-2.5 rounded-2xl border border-border bg-surface px-4 py-2.5 shadow-[var(--shadow-card)] transition-colors focus-within:border-accent">
        <SearchIcon className="size-[22px] shrink-0 text-faint" aria-hidden />
        <input
          id="username"
          type="text"
          inputMode="text"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          placeholder="Search a GitHub username, e.g. torvalds"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full appearance-none border-0 bg-transparent text-lg text-text outline-none placeholder:text-faint focus:outline-none"
        />
        {value && (
          <button
            type="button"
            onClick={() => setValue('')}
            aria-label="Clear search"
            className="grid size-8 place-items-center rounded-lg text-faint transition-colors hover:bg-surface-2 hover:text-text"
          >
            <CloseIcon className="size-[18px]" />
          </button>
        )}
        <button
          type="submit"
          disabled={loading || !value.trim()}
          className="shrink-0 rounded-xl bg-accent px-5 py-2.5 text-[15px] font-semibold text-on-accent transition-colors hover:bg-accent-hover active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? 'Searching…' : 'Search'}
        </button>
      </div>
    </form>
  );
}
