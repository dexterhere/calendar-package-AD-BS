/**
 * Astronomical constants for Nepal / Kathmandu.
 *
 * All panchang computations default to Kathmandu coordinates unless an
 * observer location is explicitly provided. The runtime fallback and the
 * data generator both import from this file so there is a single source
 * of truth for the reference location.
 */

/** Kathmandu latitude (degrees N) */
export const KTM_LAT = 27.7172

/** Kathmandu longitude (degrees E) */
export const KTM_LON = 85.3240

/** Kathmandu elevation above sea level (metres) */
export const KTM_ALT = 1400

/** Nepal Standard Time offset in minutes (UTC+5:45) */
export const NST_OFFSET_MINUTES = 345

/** Nepal Standard Time offset in milliseconds */
export const NST_OFFSET_MS = NST_OFFSET_MINUTES * 60 * 1000

/**
 * How far before UTC midnight to begin the sunrise search for a Nepal date.
 *
 * bsToAd() returns UTC midnight for the Gregorian date. UTC midnight = 05:45 NST,
 * which is already after Kathmandu sunrise (~05:20–05:50 NST depending on season).
 * Searching from UTC midnight would find the NEXT day's sunrise. Starting 6 hours
 * earlier (= ~23:45 NST the previous day) correctly brackets NST midnight.
 */
export const SUNRISE_SEARCH_OFFSET_MS = 6 * 60 * 60 * 1000

/** Number of tithis in a lunar month */
export const TITHI_COUNT = 30

/** Degrees per tithi (360 / 30) */
export const DEGREES_PER_TITHI = 12

/** Number of nakshatras */
export const NAKSHATRA_COUNT = 27

/** Degrees per nakshatra (360 / 27) */
export const DEGREES_PER_NAKSHATRA = 360 / 27

/** Number of yogas */
export const YOGA_COUNT = 27

/** Degrees per yoga (360 / 27) */
export const DEGREES_PER_YOGA = 360 / 27

/** Degrees per karana (half-tithi = 6°) */
export const DEGREES_PER_KARANA = 6

/** Total half-tithis in a lunar month (60 karanas per 360°) */
export const KARANA_CYCLE_LENGTH = 60
