import { ClockIcon, CloseIcon } from './icons';

export function RecentSearches({ searches, activeUsername, onSelect, onRemove, onClear }) {
  if (searches.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-faint">
        <ClockIcon className="size-4" />
        Recent
      </span>

      {searches.map((username) => {
        const active = username.toLowerCase() === activeUsername?.toLowerCase();
        return (
          <span
            key={username}
            className={`group inline-flex items-center overflow-hidden rounded-full border text-[13px] transition-colors ${
              active
                ? 'border-accent bg-accent-soft text-accent'
                : 'border-border bg-surface text-muted hover:border-border-strong'
            }`}
          >
            <button
              type="button"
              onClick={() => onSelect(username)}
              className="py-1 pl-3 pr-1.5 font-medium"
            >
              {username}
            </button>
            <button
              type="button"
              onClick={() => onRemove(username)}
              aria-label={`Remove ${username} from recent searches`}
              className="py-1 pl-0.5 pr-2 text-faint transition-colors hover:text-text"
            >
              <CloseIcon className="size-3" />
            </button>
          </span>
        );
      })}

      <button
        type="button"
        onClick={onClear}
        className="text-[13px] text-faint underline-offset-2 hover:text-text hover:underline"
      >
        Clear all
      </button>
    </div>
  );
}
