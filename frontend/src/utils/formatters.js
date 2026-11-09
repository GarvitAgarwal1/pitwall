/**
 * PitWall Formatting Utilities
 * Standardized F1 timing formats, delta time math, speed conversions, and date formatters.
 */

/**
 * Formats lap time in seconds to standard F1 format: 'm:ss.SSS'
 * Example: 78.345 -> "1:18.345", 125.040 -> "2:05.040"
 * @param {number|string} seconds - Total lap time in seconds
 * @returns {string} Formatted lap time string
 */
export function formatLapTime(seconds) {
  if (seconds === null || seconds === undefined || seconds === '') {
    return '--:--.---';
  }

  const num = typeof seconds === 'number' ? seconds : parseFloat(seconds);
  if (isNaN(num) || num <= 0) {
    return '--:--.---';
  }

  const mins = Math.floor(num / 60);
  const secs = num % 60;
  const secsStr = secs.toFixed(3).padStart(6, '0');

  return mins > 0 ? `${mins}:${secsStr}` : `0:${secsStr}`;
}

/**
 * Formats time delta to leader or interval ahead
 * Example: 0 -> "LEADER", 0.452 -> "+0.452s", -0.12 -> "-0.120s"
 * @param {number|string} delta - Delta in seconds or string (e.g. "+1 LAP")
 * @returns {string} Formatted delta string
 */
export function formatDelta(delta) {
  if (delta === null || delta === undefined || delta === '') {
    return '-';
  }

  if (typeof delta === 'string') {
    const trimmed = delta.trim().toUpperCase();
    if (trimmed === 'LEADER' || trimmed.includes('LAP') || trimmed.includes('PIT') || trimmed.includes('OUT')) {
      return delta;
    }
    const parsed = parseFloat(delta);
    if (isNaN(parsed)) return delta;
    delta = parsed;
  }

  if (delta === 0) {
    return 'LEADER';
  }

  const sign = delta > 0 ? '+' : '-';
  const absVal = Math.abs(delta).toFixed(3);
  return `${sign}${absVal}s`;
}

/**
 * Formats sector time in seconds: 'ss.SSS'
 * Example: 28.452 -> "28.452"
 * @param {number|string} seconds - Sector time in seconds
 * @returns {string} Formatted sector string
 */
export function formatSectorTime(seconds) {
  if (seconds === null || seconds === undefined || seconds === '') {
    return '--.---';
  }
  const num = typeof seconds === 'number' ? seconds : parseFloat(seconds);
  if (isNaN(num) || num <= 0) {
    return '--.---';
  }
  return num.toFixed(3);
}

/**
 * Formats speed in km/h
 * Example: 334.8 -> "335 km/h"
 * @param {number|string} kmh - Speed in km/h
 * @param {boolean} includeUnit - Whether to append "km/h"
 * @returns {string}
 */
export function formatSpeed(kmh, includeUnit = true) {
  if (kmh === null || kmh === undefined || kmh === '') {
    return includeUnit ? '-- km/h' : '--';
  }
  const num = typeof kmh === 'number' ? kmh : parseFloat(kmh);
  if (isNaN(num)) {
    return includeUnit ? '-- km/h' : '--';
  }
  const rounded = Math.round(num);
  return includeUnit ? `${rounded} km/h` : `${rounded}`;
}

/**
 * Formats ISO or standard date string to readable race date
 * Example: "2024-11-23" -> "Nov 23, 2024"
 * @param {string|Date} dateInput - ISO string or Date
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string}
 */
export function formatDate(dateInput, options = {}) {
  if (!dateInput) return '-';
  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return String(dateInput);

    const defaultOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      ...options,
    };
    return new Intl.DateTimeFormat('en-US', defaultOptions).format(date);
  } catch (err) {
    return String(dateInput);
  }
}

/**
 * Formats remaining seconds to DD : HH : MM : SS countdown structure
 * @param {number} totalSeconds - Milliseconds or seconds until event
 * @returns {object} { days, hours, minutes, seconds }
 */
export function formatCountdown(totalSeconds) {
  if (!totalSeconds || totalSeconds <= 0) {
    return { days: '00', hours: '00', minutes: '00', seconds: '00' };
  }

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  return {
    days: String(days).padStart(2, '0'),
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0'),
  };
}
