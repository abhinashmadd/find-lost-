/**
 * Standardized Formatting Utilities.
 * Enforces uniform date, time, and text representation across all UI components.
 */

/**
 * Format an ISO date or timestamp into a consistent human-readable date.
 * Default format: "12 Nov 2026"
 * 
 * @param {string|Date} dateValue - Date representation
 * @param {Object} [options] - Optional Intl.DateTimeFormatOptions override
 * @returns {string} Formatted date string or empty string if invalid
 */
export function formatDate(dateValue, options = {}) {
  if (!dateValue) return "";

  const date = new Date(dateValue);
  if (isNaN(date.getTime())) return "";

  const defaultOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  };

  return date.toLocaleDateString("en-IN", { ...defaultOptions, ...options });
}

/**
 * Format an ISO date or timestamp into a full date with time.
 * Example: "12 Nov 2026, 02:30 PM"
 * 
 * @param {string|Date} dateValue - Date representation
 * @returns {string} Formatted date-time string
 */
export function formatDateTime(dateValue) {
  if (!dateValue) return "";

  const date = new Date(dateValue);
  if (isNaN(date.getTime())) return "";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Capitalize first letter of a string.
 * @param {string} str - Input string
 * @returns {string} Capitalized string
 */
export function capitalize(str) {
  if (!str || typeof str !== "string") return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}
