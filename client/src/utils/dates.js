/**
 * Shared date utilities — null-safe parsing & formatting.
 */

/** Safely parse any date-ish value; returns Date or null. */
export function safeParseDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Parse a date-only string (e.g. "2025-06-15") from the DB.
 * Appends T00:00:00 so it's interpreted as local time, not UTC.
 */
export function parseDateString(value) {
  if (!value) return null;
  const str = String(value);
  // Already has a time component — parse directly
  if (str.includes('T') || str.includes(' ')) return safeParseDate(str);
  return safeParseDate(str + 'T00:00:00');
}

/**
 * Format a date-only string for chart axis labels.
 * @param {string} value  e.g. "2025-06-15"
 * @param {Intl.DateTimeFormatOptions} options
 */
export function formatChartDate(value, options = { month: 'short', day: 'numeric' }) {
  const d = parseDateString(value);
  if (!d) return value ?? '';
  return d.toLocaleDateString('en-US', options);
}

/** Relative time string ("5m ago") with null safety. */
export function timeAgo(dateStr) {
  const d = safeParseDate(dateStr);
  if (!d) return '';
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
