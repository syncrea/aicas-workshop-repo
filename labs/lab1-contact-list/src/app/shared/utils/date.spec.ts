import { formatRelativeDate } from './date';

describe('formatRelativeDate', () => {
  const NOW = new Date('2026-04-20T12:00:00Z');
  const minus = (ms: number) => new Date(NOW.getTime() - ms);
  const plus = (ms: number) => new Date(NOW.getTime() + ms);

  describe('past', () => {
    it('returns "just now" for differences under one minute', () => {
      expect(formatRelativeDate(minus(30_000), NOW)).toBe('just now');
      expect(formatRelativeDate(minus(59_000), NOW)).toBe('just now');
    });

    it('formats minutes', () => {
      expect(formatRelativeDate(minus(5 * 60_000), NOW)).toBe('5 minutes ago');
    });

    it('formats hours', () => {
      expect(formatRelativeDate(minus(3 * 60 * 60_000), NOW)).toBe('3 hours ago');
    });

    it('uses "yesterday" for one day ago', () => {
      expect(formatRelativeDate(minus(24 * 60 * 60_000), NOW)).toBe('yesterday');
    });

    it('uses "last week" for seven days ago', () => {
      expect(formatRelativeDate(minus(7 * 24 * 60 * 60_000), NOW)).toBe('last week');
    });

    it('formats months', () => {
      expect(formatRelativeDate(minus(3 * 30 * 24 * 60 * 60_000), NOW)).toBe('3 months ago');
    });
  });

  describe('future', () => {
    it('uses "tomorrow" for one day from now', () => {
      expect(formatRelativeDate(plus(24 * 60 * 60_000), NOW)).toBe('tomorrow');
    });

    it('formats minutes ahead', () => {
      expect(formatRelativeDate(plus(10 * 60_000), NOW)).toBe('in 10 minutes');
    });
  });

  describe('input flexibility', () => {
    it('accepts ISO strings', () => {
      expect(formatRelativeDate('2026-04-20T11:00:00Z', NOW)).toBe('1 hour ago');
    });

    it('accepts epoch millis', () => {
      expect(formatRelativeDate(NOW.getTime() - 60 * 60_000, NOW)).toBe('1 hour ago');
    });
  });
});
