/**
 * Shared time utilities for timetable features.
 *
 * Primary goal:
 * - Provide a robust normalizeToHHMM function that converts a variety of time inputs
 *   into a canonical "HH:MM" string for consistent display and keying.
 *
 * Examples that normalizeToHHMM will handle:
 * - "09:15:00"   -> "09:15"
 * - "9:15:00"    -> "09:15"
 * - "9:15"       -> "09:15"
 * - "0915"       -> "09:15"
 * - 915          -> "09:15"
 * - Date         -> "HH:MM" (local time)
 *
 * If parsing fails, the input is returned as-is.
 */

/**
 * Check if a string is already in "HH:MM" format.
 * Does not validate actual range (00-23 for HH, 00-59 for MM) to remain permissive
 * for custom timelines; use isValidHHMM if needed.
 */
export function isHHMM(str) {
  return typeof str === "string" && /^\d{2}:\d{2}$/.test(str);
}

/**
 * Validate "HH:MM" by range (00-23, 00-59).
 */
export function isValidHHMM(str) {
  if (!isHHMM(str)) return false;
  const [hh, mm] = str.split(":").map((n) => Number(n));
  return hh >= 0 && hh <= 23 && mm >= 0 && mm <= 59;
}

/**
 * Pad a number/string to at least 2 characters with leading zero.
 */
function pad2(n) {
  const s = String(n ?? "");
  return s.length === 1 ? `0${s}` : s;
}

/**
 * Normalize any supported time input to "HH:MM".
 *
 * Supported inputs:
 * - "09:15:00", "9:15:00", "9:15", "09:15"
 * - "0915", 915
 * - Date instance
 * - Any other value: returned as-is if no known pattern matches
 *
 * Note: This function is intentionally permissive and will not throw on invalid input.
 */
export function normalizeToHHMM(val) {
  if (val == null) return val;

  // If it's a Date, format local hours/minutes
  if (val instanceof Date) {
    const hh = pad2(val.getHours());
    const mm = pad2(val.getMinutes());
    return `${hh}:${mm}`;
  }

  let str = String(val).trim();
  if (str.length === 0) return str;

  // If already HH:MM, return as-is
  if (isHHMM(str)) return str;

  // If "H:MM" -> "0H:MM"
  if (/^\d:\d{2}$/.test(str)) {
    const [h, m] = str.split(":");
    return `${pad2(h)}:${m}`;
  }

  // If "HH:MM:SS" or "H:MM:SS" -> strip seconds, pad hour if needed
  if (/^\d{1,2}:\d{2}:\d{1,2}$/.test(str)) {
    const [h, m] = str.split(":");
    return `${pad2(h)}:${pad2(m)}`;
  }

  // If "HH:MM:SS.sss" (with milliseconds) -> strip to HH:MM
  if (/^\d{1,2}:\d{2}:\d{1,2}\.\d+$/.test(str)) {
    const [h, m] = str.split(":");
    return `${pad2(h)}:${pad2(m)}`;
  }

  // If "HHMM" or "HMM" -> "HH:MM"
  if (/^\d{3,4}$/.test(str)) {
    const n = Number(str);
    if (Number.isFinite(n)) {
      const hh = Math.floor(n / 100);
      const mm = n % 100;
      return `${pad2(hh)}:${pad2(mm)}`;
    }
  }

  // If "HH.MM" -> "HH:MM"
  if (/^\d{1,2}\.\d{2}$/.test(str)) {
    const [h, m] = str.split(".");
    return `${pad2(h)}:${pad2(m)}`;
  }

  // As a last resort, try to pick the first HH:MM or H:MM-like pattern
  const match = str.match(/(\d{1,2}):(\d{2})/);
  if (match) {
    return `${pad2(match[1])}:${pad2(match[2])}`;
  }

  // Unrecognized format; return original
  return str;
}

/**
 * Compare two time values (any supported by normalizeToHHMM).
 * Returns:
 * -1 if a < b
 *  0 if equal or unparsable
 *  1 if a > b
 */
export function compareTimes(a, b) {
  const A = normalizeToHHMM(a);
  const B = normalizeToHHMM(b);
  if (!isHHMM(A) || !isHHMM(B)) return 0;
  if (A === B) return 0;
  return A < B ? -1 : 1;
}

/**
 * Format a time range safely: "HH:MM-HH:MM".
 * If either side is missing, returns whatever is available.
 */
export function formatTimeRange(start, end) {
  const s = normalizeToHHMM(start);
  const e = normalizeToHHMM(end);
  if (s && e) return `${s}-${e}`;
  if (s) return s;
  if (e) return e;
  return "";
}

export default {
  isHHMM,
  isValidHHMM,
  normalizeToHHMM,
  compareTimes,
  formatTimeRange,
};
