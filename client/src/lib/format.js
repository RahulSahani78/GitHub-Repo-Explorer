/** Compact number formatting: 1500 -> "1.5K", 2_300_000 -> "2.3M". */
export function formatCount(value) {
  return new Intl.NumberFormat(undefined, {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

/** "3 days ago" style relative time. */
const RELATIVE = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
const DIVISIONS = [
  { amount: 60, unit: 'second' },
  { amount: 60, unit: 'minute' },
  { amount: 24, unit: 'hour' },
  { amount: 7, unit: 'day' },
  { amount: 4.34524, unit: 'week' },
  { amount: 12, unit: 'month' },
  { amount: Number.POSITIVE_INFINITY, unit: 'year' },
];

export function formatRelativeTime(isoDate) {
  let duration = (Date.parse(isoDate) - Date.now()) / 1000;
  for (const division of DIVISIONS) {
    if (Math.abs(duration) < division.amount) {
      return RELATIVE.format(Math.round(duration), division.unit);
    }
    duration /= division.amount;
  }
  return isoDate;
}

/** Absolute date, e.g. "Jan 2011" — used for the "joined" line. */
export function formatMonthYear(isoDate) {
  return new Date(isoDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
}
