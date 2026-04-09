import { describe, it, expect } from 'vitest';
import { formatDate, formatDateTime, formatRelative, formatCurrency, formatNumber } from '../utils/formatters';

describe('formatDate', () => {
  it('formats a valid date string', () => {
    expect(formatDate('2026-04-07T10:00:00Z')).toBe('07 Apr 2026');
  });

  it('formats a Date object', () => {
    expect(formatDate(new Date(2025, 0, 15))).toBe('15 Jan 2025');
  });

  it('returns dash for null', () => {
    expect(formatDate(null)).toBe('—');
  });

  it('returns dash for undefined', () => {
    expect(formatDate(undefined)).toBe('—');
  });

  it('returns dash for invalid date string', () => {
    expect(formatDate('not-a-date')).toBe('—');
  });
});

describe('formatDateTime', () => {
  it('formats date with time', () => {
    const result = formatDateTime('2026-04-07T14:30:00Z');
    expect(result).toContain('07');
    expect(result).toContain('Apr');
    expect(result).toContain('2026');
  });

  it('returns dash for null', () => {
    expect(formatDateTime(null)).toBe('—');
  });
});

describe('formatRelative', () => {
  it('returns "just now" for very recent dates', () => {
    const now = new Date();
    expect(formatRelative(now)).toBe('just now');
  });

  it('returns minutes ago', () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    expect(formatRelative(fiveMinAgo)).toBe('5m ago');
  });

  it('returns hours ago', () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
    expect(formatRelative(threeHoursAgo)).toBe('3h ago');
  });

  it('returns days ago', () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    expect(formatRelative(twoDaysAgo)).toBe('2d ago');
  });

  it('falls back to formatDate for old dates', () => {
    const oldDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const result = formatRelative(oldDate);
    expect(result).not.toBe('—');
    expect(result).not.toContain('ago');
  });

  it('returns dash for null', () => {
    expect(formatRelative(null)).toBe('—');
  });
});

describe('formatCurrency', () => {
  it('formats a number with INR prefix', () => {
    const result = formatCurrency(50000);
    expect(result).toContain('INR');
    expect(result).toContain('50');
  });

  it('returns INR 0 for null', () => {
    expect(formatCurrency(null)).toBe('INR 0');
  });

  it('handles zero', () => {
    expect(formatCurrency(0)).toContain('INR');
  });
});

describe('formatNumber', () => {
  it('formats a number with locale separators', () => {
    const result = formatNumber(1234);
    expect(result).toBeTruthy();
    expect(result).not.toBe('0');
  });

  it('returns 0 for null', () => {
    expect(formatNumber(null)).toBe('0');
  });
});
