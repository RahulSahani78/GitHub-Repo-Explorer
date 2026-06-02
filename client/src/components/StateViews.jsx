import { ClockIcon, RepoIcon, SearchIcon } from './icons';

/** Friendly first-run state shown before any search. */
export function WelcomeState() {
  return (
    <div className="animate-in flex flex-col items-center rounded-2xl border border-dashed border-border bg-surface/60 px-6 py-20 text-center shadow-[var(--shadow-card)]">
      <div className="grid size-16 place-items-center rounded-2xl bg-accent-soft text-accent">
        <SearchIcon className="size-8" />
      </div>
      <h2 className="mt-5 text-2xl font-bold tracking-tight text-text">Explore any GitHub profile</h2>
      <p className="mt-2 max-w-md text-base leading-relaxed text-muted">
        Search for a username to see their profile and browse their public repositories — sortable by
        stars, recency, or name.
      </p>
    </div>
  );
}

/** Shown when a profile exists but has zero public repositories. */
export function EmptyRepos({ login }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-border px-6 py-12 text-center">
      <RepoIcon className="size-7 text-faint" />
      <p className="mt-3 text-sm text-muted">
        <span className="font-medium text-text">{login}</span> doesn&apos;t have any public
        repositories yet.
      </p>
    </div>
  );
}

/** Maps each error category to a clear, actionable message. */
export function ErrorState({ error, onRetry }) {
  const isNotFound = error.status === 404;
  const isRateLimited = error.status === 429;

  const title = isNotFound
    ? 'User not found'
    : isRateLimited
      ? 'Rate limit reached'
      : 'Something went wrong';

  return (
    <div
      role="alert"
      className="animate-in flex flex-col items-center rounded-2xl border border-border bg-surface px-6 py-12 text-center shadow-[var(--shadow-card)]"
    >
      <div
        className={`grid size-12 place-items-center rounded-2xl ${
          isRateLimited ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'
        }`}
      >
        {isRateLimited ? <ClockIcon className="size-6" /> : <SearchIcon className="size-6" />}
      </div>
      <h2 className="mt-4 text-lg font-semibold text-text">{title}</h2>
      <p className="mt-1.5 max-w-md text-sm text-muted">{error.message}</p>

      {isRateLimited && error.resetAt && (
        <p className="mt-1 text-xs text-faint">
          Try again {new Date(error.resetAt).toLocaleTimeString()}.
        </p>
      )}

      {!isNotFound && onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 rounded-xl border border-border px-4 py-1.5 text-sm font-medium text-text transition-colors hover:bg-surface-2"
        >
          Try again
        </button>
      )}
    </div>
  );
}
