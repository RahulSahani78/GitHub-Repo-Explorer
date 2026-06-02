import { lazy, Suspense, useCallback, useEffect } from 'react';
import { useGithubExplorer } from '../hooks/useGithubExplorer';
import { useRecentSearches } from '../hooks/useRecentSearches';
import { SearchBar } from './SearchBar';
import { RecentSearches } from './RecentSearches';
import { ProfileCard } from './ProfileCard';
import { RepoSection } from './RepoSection';
import { ResultsSkeleton } from './Skeletons';
import { ErrorState, WelcomeState } from './StateViews';

// Recharts is heavy, so the chart is code-split: its bundle only loads once a
// search succeeds, keeping the initial page load lean.
const LanguageChart = lazy(() =>
  import('./LanguageChart').then((m) => ({ default: m.LanguageChart })),
);

export function Explorer() {
  const { state, search, changeSort, goToPage, reset } = useGithubExplorer();
  const recent = useRecentSearches();

  // Record a username in "recent" only once its profile resolves successfully.
  useEffect(() => {
    if (state.status === 'success' && state.profile) {
      recent.add(state.profile.login);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status, state.profile?.login]);

  const handleSearch = useCallback((username) => search(username), [search]);

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-6 sm:py-8">
      <div className="space-y-3">
        <SearchBar
          initialValue={state.username}
          loading={state.status === 'loading'}
          onSearch={handleSearch}
        />
        <RecentSearches
          searches={recent.searches}
          activeUsername={state.username}
          onSelect={handleSearch}
          onRemove={recent.remove}
          onClear={recent.clear}
        />
      </div>

      {state.status === 'idle' && <WelcomeState />}

      {state.status === 'loading' && <ResultsSkeleton />}

      {state.status === 'error' && state.error && (
        <ErrorState
          error={state.error}
          onRetry={state.username ? () => search(state.username) : reset}
        />
      )}

      {state.status === 'success' && state.profile && (
        <div className="space-y-6">
          <ProfileCard profile={state.profile} />
          {state.languages.length > 0 && (
            <Suspense fallback={null}>
              <LanguageChart languages={state.languages} />
            </Suspense>
          )}
          <RepoSection
            login={state.profile.login}
            repos={state.repos}
            pagination={state.pagination}
            sort={state.sort}
            pageLoading={state.pageLoading}
            truncated={state.truncated}
            onSort={changeSort}
            onPageChange={goToPage}
          />
        </div>
      )}
    </main>
  );
}
