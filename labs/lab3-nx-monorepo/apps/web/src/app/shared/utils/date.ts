const SECOND = 1_000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

const RELATIVE = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

/**
 * Human-readable relative time, e.g. "just now", "5 minutes ago",
 * "yesterday", "in 2 months".
 *
 * Accepts ISO strings (the API wire format), `Date` objects, or epoch ms.
 */
export function formatRelativeDate(
  input: string | Date | number,
  now: Date = new Date(),
): string {
  const target = input instanceof Date ? input : new Date(input);
  const diffMs = target.getTime() - now.getTime();
  const absMs = Math.abs(diffMs);

  if (absMs < 30 * SECOND) {
    return 'just now';
  }
  if (absMs < HOUR) {
    return RELATIVE.format(Math.round(diffMs / MINUTE), 'minute');
  }
  if (absMs < DAY) {
    return RELATIVE.format(Math.round(diffMs / HOUR), 'hour');
  }
  if (absMs < WEEK) {
    return RELATIVE.format(Math.round(diffMs / DAY), 'day');
  }
  if (absMs < MONTH) {
    return RELATIVE.format(Math.round(diffMs / WEEK), 'week');
  }
  if (absMs < YEAR) {
    return RELATIVE.format(Math.round(diffMs / MONTH), 'month');
  }
  return RELATIVE.format(Math.round(diffMs / YEAR), 'year');
}

/** Initials from a full name, e.g. "Ada Lovelace" → "AL". */
export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) {
    return '?';
  }
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}
