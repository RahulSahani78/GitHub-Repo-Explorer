import { useCallback, useRef, useState } from 'react';
import { api, ApiError } from '../api/client';

const PER_PAGE = 8;

const initialState = {
  status: 'idle', // 'idle' | 'loading' | 'success' | 'error'
  username: '',
  profile: null,
  repos: [],
  pagination: null,
  languages: [],
  truncated: false,
  sort: 'stars',
  pageLoading: false, // a page change / sort change is in flight
  error: null,
};

function toError(error) {
  if (error instanceof ApiError) {
    return { status: error.status, message: error.message, resetAt: error.details?.resetAt };
  }
  return { status: 0, message: 'Something went wrong. Please try again.' };
}

/**
 * Owns all of the explorer's async state: searching for a user, sorting their
 * repos, and paging through them. Stale requests are aborted so a slow earlier
 * request can never overwrite a newer one (a classic race-condition fix).
 */
export function useGithubExplorer() {
  const [state, setState] = useState(initialState);
  const controllerRef = useRef(null);

  const search = useCallback(async (rawUsername, sort) => {
    const username = rawUsername.trim();
    if (!username) return;

    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    const activeSort = sort ?? 'stars';
    setState({ ...initialState, sort: activeSort, username, status: 'loading' });

    try {
      const [profileRes, reposRes] = await Promise.all([
        api.getProfile(username, controller.signal),
        api.getRepos(username, { sort: activeSort, page: 1, perPage: PER_PAGE }, controller.signal),
      ]);

      if (controller.signal.aborted) return;
      setState({
        status: 'success',
        username,
        profile: profileRes.profile,
        repos: reposRes.items,
        pagination: reposRes.pagination,
        languages: reposRes.languages,
        truncated: reposRes.meta.truncated,
        sort: activeSort,
        pageLoading: false,
        error: null,
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      setState((prev) => ({ ...prev, status: 'error', error: toError(error), profile: null }));
    }
  }, []);

  /** Fetch a specific page (and/or sort), replacing the current page of repos. */
  const fetchPage = useCallback(
    async (page, sort) => {
      const activeSort = sort ?? state.sort;
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      setState((prev) => ({ ...prev, sort: activeSort, pageLoading: true }));
      try {
        const res = await api.getRepos(
          state.username,
          { sort: activeSort, page, perPage: PER_PAGE },
          controller.signal,
        );
        if (controller.signal.aborted) return;
        setState((prev) => ({
          ...prev,
          repos: res.items,
          pagination: res.pagination,
          languages: res.languages,
          pageLoading: false,
        }));
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setState((prev) => ({ ...prev, pageLoading: false, error: toError(error) }));
      }
    },
    [state.username, state.sort],
  );

  /** Switch sort order — always returns to the first page. */
  const changeSort = useCallback(
    (sort) => {
      if (!state.username || state.status !== 'success' || sort === state.sort) return;
      fetchPage(1, sort);
    },
    [state.username, state.status, state.sort, fetchPage],
  );

  /** Jump to a page number (1-based). */
  const goToPage = useCallback(
    (page) => {
      if (!state.pagination || state.status !== 'success') return;
      if (page < 1 || page > state.pagination.totalPages || page === state.pagination.page) return;
      fetchPage(page);
    },
    [state.pagination, state.status, fetchPage],
  );

  const reset = useCallback(() => {
    controllerRef.current?.abort();
    setState(initialState);
  }, []);

  return { state, search, changeSort, goToPage, reset };
}
