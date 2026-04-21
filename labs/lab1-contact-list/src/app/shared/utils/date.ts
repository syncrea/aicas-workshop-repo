const SECOND_MS = 1_000;
const MINUTE_MS = 60 * SECOND_MS;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const WEEK_MS = 7 * DAY_MS;
const MONTH_MS = 30 * DAY_MS;
const YEAR_MS = 365 * DAY_MS;

const RELATIVE = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

/**
 * Human-readable relative time, e.g. "just now", "5 minutes ago",
 * "yesterday", "last week", "in 2 months".
 *
 * Uses `Intl.RelativeTimeFormat` so the wording is consistent with the
 * platform locale (and so we get nice "yesterday" / "tomorrow" /
 * "last week" wording for the ±1 case automatically).
 *
 * @param input Anything `new Date()` accepts (`Date`, ISO string,
 *              epoch millis).
 * @param now   Reference "now" — defaults to the current time. Pass an
 *              explicit value in tests for deterministic output.
 */
export function formatRelativeDate(
  input: Date | string | number,
  now: Date = new Date(),
): string {
  const target = input instanceof Date ? input : new Date(input);
  const diffMs = target.getTime() - now.getTime();
  const absMs = Math.abs(diffMs);

  if (absMs < MINUTE_MS) {
    return 'just now';
  }
  if (absMs < HOUR_MS) {
    return RELATIVE.format(Math.round(diffMs / MINUTE_MS), 'minute');
  }
  if (absMs < DAY_MS) {
    return RELATIVE.format(Math.round(diffMs / HOUR_MS), 'hour');
  }
  if (absMs < WEEK_MS) {
    return RELATIVE.format(Math.round(diffMs / DAY_MS), 'day');
  }
  if (absMs < MONTH_MS) {
    return RELATIVE.format(Math.round(diffMs / WEEK_MS), 'week');
  }
  if (absMs < YEAR_MS) {
    return RELATIVE.format(Math.round(diffMs / MONTH_MS), 'month');
  }
  return RELATIVE.format(Math.round(diffMs / YEAR_MS), 'year');
}
