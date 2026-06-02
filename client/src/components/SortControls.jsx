const OPTIONS = [
  { value: 'stars', label: 'Stars' },
  { value: 'updated', label: 'Last updated' },
  { value: 'name', label: 'Name' },
];

export function SortControls({ sort, total, onChange }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h3 className="text-lg font-bold tracking-tight text-text">
        Repositories <span className="font-normal text-faint">({total})</span>
      </h3>

      <div className="flex items-center gap-2">
        <span className="hidden text-sm text-faint sm:inline">Sort by</span>
        <div
          role="group"
          aria-label="Sort repositories"
          className="inline-flex rounded-xl border border-border bg-surface p-0.5"
        >
          {OPTIONS.map((option) => {
            const active = option.value === sort;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={active}
                onClick={() => onChange(option.value)}
                className={`rounded-lg px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
                  active ? 'bg-accent text-on-accent shadow-sm' : 'text-muted hover:text-text'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
