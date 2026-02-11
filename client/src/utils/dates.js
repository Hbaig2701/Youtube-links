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
 * Parse a date-only string from the DB (e.g. "2025-02-11" or "2025-02-11T00:00:00.000Z").
 * Always extracts just the YYYY-MM-DD and interprets as local midnight
 * to avoid UTC timezone shifts showing the wrong day.
 */
export function parseDateString(value) {
  if (!value) return null;
  const str = String(value);
  const dateMatch = str.match(/^(\d{4}-\d{2}-\d{2})/);
  if (dateMatch) return safeParseDate(dateMatch[1] + 'T00:00:00');
  return safeParseDate(str);
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
