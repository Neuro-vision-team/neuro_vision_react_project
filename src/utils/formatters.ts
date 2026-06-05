/**
 * Formatting utilities — pure functions, no side effects.
 */

/** Format ISO date string to locale date */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  }).format(date);
}

/** Format ISO date string with time */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(date);
}

/** Format relative time (e.g., "2 hours ago") */
export function formatRelative(iso: string | null | undefined): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1)  return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24)   return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7)     return `${days}d ago`;
  return formatDate(iso);
}

/** Format a decimal number to fixed places */
export function formatNum(value: number, decimals = 1): string {
  return Number.isFinite(value) ? value.toFixed(decimals) : '—';
}

/** Format a percentage (0–100) */
export function formatPercent(value: number, decimals = 1): string {
  return Number.isFinite(value) ? `${value.toFixed(decimals)}%` : '—';
}

/** Format mm measurement */
export function formatMm(value: number): string {
  return Number.isFinite(value) ? `${value.toFixed(2)} mm` : '—';
}

/** Format ms measurement */
export function formatMs(value: number): string {
  return Number.isFinite(value) ? `${value.toFixed(0)} ms` : '—';
}

/** Capitalize first letter */
export function capitalize(s: string | null | undefined): string {
  if (!s) return '—';
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ');
}
