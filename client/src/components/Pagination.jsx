import { ChevronIcon } from './icons';

/**
 * Builds a compact page list with ellipses, always showing the first page, the
 * last page, and a small window around the current page. Example for 10 pages
 * on page 6: [1, …, 5, 6, 7, …, 10].
 */
function buildPageList(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = new Set([1, total, current, current - 1, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);

  const withGaps = [];
  let prev = 0;
  for (const page of sorted) {
    if (page - prev > 1) withGaps.push('…');
    withGaps.push(page);
    prev = page;
  }
  return withGaps;
}

export function Pagination({ pagination, busy, onChange }) {
  const { page, totalPages, total, perPage } = pagination;
  if (totalPages <= 1) return null;

  const pages = buildPageList(page, totalPages);
  const from = (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  return (
    <nav
      aria-label="Repository pagination"
      className="flex flex-col items-center gap-3 pt-2 sm:flex-row sm:justify-between"
    >
      <p className="text-[13px] text-faint">
        Showing <span className="font-medium text-muted">{from}–{to}</span> of{' '}
        <span className="font-medium text-muted">{total}</span>
      </p>

      <div className="flex items-center gap-1.5">
        <PageButton
          ariaLabel="Previous page"
          disabled={!pagination.hasPrevPage || busy}
          onClick={() => onChange(page - 1)}
        >
          <ChevronIcon className="size-4 rotate-90" />
        </PageButton>

        {pages.map((item, i) =>
          item === '…' ? (
            <span key={`gap-${i}`} className="px-1.5 text-sm text-faint">
              …
            </span>
          ) : (
            <PageButton
              key={item}
              active={item === page}
              ariaLabel={`Page ${item}`}
              ariaCurrent={item === page ? 'page' : undefined}
              disabled={busy}
              onClick={() => onChange(item)}
            >
              {item}
            </PageButton>
          ),
        )}

        <PageButton
          ariaLabel="Next page"
          disabled={!pagination.hasNextPage || busy}
          onClick={() => onChange(page + 1)}
        >
          <ChevronIcon className="size-4 -rotate-90" />
        </PageButton>
      </div>
    </nav>
  );
}

function PageButton({ children, active, disabled, ariaLabel, ariaCurrent, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-current={ariaCurrent}
      className={`grid h-9 min-w-9 place-items-center rounded-lg border px-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        active
          ? 'border-accent bg-accent text-on-accent'
          : 'border-border bg-surface text-muted hover:border-border-strong hover:text-text'
      }`}
    >
      {children}
    </button>
  );
}
