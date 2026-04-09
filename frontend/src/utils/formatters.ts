/**
 * Centralized date formatting utilities.
 * All date display across the app should use these functions.
 */

/** "07 Apr 2026" */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '—';
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

/** "07 Apr 2026, 14:30" */
export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '—';
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  } catch {
    return '—';
  }
}

/** "2 hours ago", "3 days ago", "just now" */
export function formatRelative(date: string | Date | null | undefined): string {
  if (!date) return '—';
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '—';

    const now = Date.now();
    const diff = now - d.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return formatDate(d);
  } catch {
    return '—';
  }
}

/** "INR 50,000.00" */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) return 'INR 0';
  return `INR ${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

/** "1,234" */
export function formatNumber(n: number | null | undefined): string {
  if (n == null) return '0';
  return n.toLocaleString('en-IN');
}
