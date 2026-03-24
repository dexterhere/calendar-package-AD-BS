/**
 * src/astro/compute.ts
 *
 * Core astronomical computation module — Phase 7 engine.
 *
 * Computes all five panchang elements (Vara, Tithi, Nakshatra, Yoga, Karana)
 * directly from planetary positions at sunrise using astronomy-engine
 * (MIT license, validated against NASA JPL Horizons data).
 *
 * This module is NOT exported from src/index.ts — it is used by:
 *   - scripts/generate-panchang-v2.ts  (data generation)
 *   - scripts/validation/              (cross-validation pipeline)
 *   - src/panchang/compute-fallback.ts (runtime fallback, Phase 7 Step 9)
 *
 * NOTE on swisseph: The swisseph native addon requires a C compiler and Visual
 * Studio Build Tools to compile on Windows. astronomy-engine provides equivalent
 * accuracy (sub-arcminute for Sun/Moon positions) as a pure JS library.
 * For CI and cross-platform builds, astronomy-engine is the primary engine.
 */

import { Observer, SearchRiseSet, Body, MoonPhase, EclipticGeoMoon } from './astronomy-adapter.js'
import {
  KTM_LAT,
  KTM_LON,
  KTM_ALT,
  NST_OFFSET_MINUTES,
  SUNRISE_SEARCH_OFFSET_MS,
  DEGREES_PER_TITHI,
  DEGREES_PER_NAKSHATRA,
  DEGREES_PER_YOGA,
  DEGREES_PER_KARANA,
  KARANA_CYCLE_LENGTH,
} from './constants.js'
import { karanaIndexToNumber } from './karana-names.js'

// ── Input / Output types ─────────────────────────────────────────────────────

export interface ComputeInput {
  /**
   * The AD Date returned by bsToAd() — UTC midnight of the Gregorian date
   * corresponding to the BS date in Nepal.
   */
  adDate: Date
  /** Observer latitude in degrees (default: Kathmandu 27.7172°N) */
  lat?: number
  /** Observer longitude in degrees (default: Kathmandu 85.3240°E) */
  lon?: number
  /** Observer altitude in metres (default: 1400m for Kathmandu) */
  alt?: number
  /** Timezone offset in minutes (default: 345 = NST UTC+5:45) */
  tzOffsetMinutes?: number
}

/** Classification of a tithi relative to the standard 30-tithi sequence */
export type TithiType =
  /** The tithi appears at sunrise — standard case */
  | 'normal'
  /**
   * Kshaya (lost/skipped) tithi: the tithi completes entirely within a single
   * solar day without being present at either sunrise. The day is traditionally
   * named after this tithi even though it does not appear at sunrise.
   * Detected by comparing tithi at today's sunrise with tithi at tomorrow's sunrise:
   * if they differ by more than 1, the intermediate tithi is Kshaya.
   * NOTE: populated only when the caller provides prevTithi and nextTithi
   * (see computeTithiType helper below).
   */
  | 'kshaya'
  /**
   * Vriddhi (extended/repeated) tithi: the same tithi appears at the sunrise of
   * two consecutive solar days.
   * Detected by comparing tithi at today's sunrise with yesterday's sunrise.
   */
  | 'vriddhi'

export interface PanchangComputed {
  /** Tithi number 1–30 (1–15 Shukla, 16–30 Krishna, 15=Purnima, 30=Amavasya) */
  tithi: number
  /** Nakshatra number 1–27 (1=Ashwini … 27=Revati) */
  nakshatra: number
  /**
   * Yoga number 1–27 (1=Vishkambha … 27=Vaidhriti).
   * Derived from (sun_lon + moon_lon) % 360.
   */
  yoga: number
  /**
   * Karana number 1–11.
   * Movable: 1=Bava, 2=Balava, 3=Kaulava, 4=Taitila, 5=Garaja, 6=Vanija, 7=Vishti.
   * Fixed:   8=Shakuni, 9=Chatushpada, 10=Nagava, 11=Kimstughna.
   */
  karana: number
  /**
   * Vara (weekday) 1–7. Sun=1, Mon=2, Tue=3, Wed=4, Thu=5, Fri=6, Sat=7.
   * Follows the Nepal/Hindu convention where Sunday is the first day of the week.
   */
  vara: number
  /** Exact UTC moment of sunrise used for all panchang computations */
  sunriseMoment: Date
  /** Sun ecliptic longitude at sunrise (degrees, 0–360) — for audit/validation */
  sunLon: number
  /** Moon ecliptic longitude at sunrise (degrees, 0–360) — for audit/validation */
  moonLon: number
  /** Tithi edge-case classification. 'normal' unless Kshaya or Vriddhi. */
  tithiType: TithiType
}

// ── Sunrise computation ──────────────────────────────────────────────────────

/**
 * Returns the UTC Date of sunrise for a given Nepal calendar day.
 *
 * adDateUTC must be the Date returned by bsToAd() — UTC midnight of the
 * corresponding Gregorian date. The search window starts 6 hours before
 * UTC midnight to correctly cover NST midnight of the target Nepal date
 * (UTC midnight = 05:45 NST, which is already after sunrise).
 */
export function getSunriseForNepaliDay(
  adDateUTC: Date,
  lat = KTM_LAT,
  lon = KTM_LON,
  alt = KTM_ALT
): Date {
  const observer = new Observer(lat, lon, alt)
  const searchStart = new Date(adDateUTC.getTime() - SUNRISE_SEARCH_OFFSET_MS)

  const result = SearchRiseSet(
    Body.Sun,
    observer,
    +1,   // +1 = rising (sunrise)
    searchStart,
    1,    // search up to 1 day ahead
    0     // atmospheric refraction: 0 = standard model off
  )

  if (!result) {
    throw new Error(
      `Sunrise not found for ${adDateUTC.toISOString()} ` +
      `at lat=${lat} lon=${lon} alt=${alt}`
    )
  }

  return result.date
}

// ── Planetary position ───────────────────────────────────────────────────────

interface SolarLunarPositions {
  sunLon: number    // ecliptic longitude 0–360
  moonLon: number   // ecliptic longitude 0–360
  moonPhase: number // (moonLon - sunLon + 360) % 360, i.e. elongation 0–360
}

function getPositionsAt(moment: Date): SolarLunarPositions {
  const moonLon = EclipticGeoMoon(moment).lon
  const moonPhase = MoonPhase(moment)                 // elongation = moon - sun

  // Derive sun longitude from moon phase and moon longitude
  // moonPhase = (moonLon - sunLon + 360) % 360
  // → sunLon = (moonLon - moonPhase + 360) % 360
  const sunLon = (moonLon - moonPhase + 360) % 360

  return { sunLon, moonLon, moonPhase }
}

// ── Individual element computations ─────────────────────────────────────────

/**
 * Tithi (1–30) from Moon phase angle.
 * Each tithi spans 12° of the Moon's elongation from the Sun.
 */
export function tithiFromPhase(moonPhase: number): number {
  return Math.floor(moonPhase / DEGREES_PER_TITHI) + 1
}

/**
 * Nakshatra (1–27) from Moon ecliptic longitude.
 * Each nakshatra spans 13.333° (360 / 27).
 */
export function nakshatraFromMoonLon(moonLon: number): number {
  return Math.floor(moonLon / DEGREES_PER_NAKSHATRA) + 1
}

/**
 * Yoga (1–27) from combined Sun + Moon ecliptic longitude.
 * Each yoga spans 13.333° of (sun_lon + moon_lon) % 360.
 */
export function yogaFromPositions(sunLon: number, moonLon: number): number {
  const combined = (sunLon + moonLon) % 360
  return Math.floor(combined / DEGREES_PER_YOGA) + 1
}

/**
 * Karana number (1–11) from Moon phase angle.
 *
 * Each karana spans 6° (half a tithi). There are 60 karanas per lunar month.
 * The karana index (0–59) maps to 11 named types — see karanaIndexToNumber().
 */
export function karanaFromPhase(moonPhase: number): number {
  const rawIndex = Math.floor(moonPhase / DEGREES_PER_KARANA) % KARANA_CYCLE_LENGTH
  return karanaIndexToNumber(rawIndex)
}

/**
 * Vara (weekday) 1–7.
 * Sunday = 1, Monday = 2, … Saturday = 7.
 * Uses NST (Nepal Standard Time) local date to determine the weekday,
 * since the Nepal day may span two UTC dates.
 */
export function varaFromDate(sunriseMoment: Date, tzOffsetMinutes: number): number {
  const localMs = sunriseMoment.getTime() + tzOffsetMinutes * 60 * 1000
  const localDate = new Date(localMs)
  // getUTCDay(): 0=Sun, 1=Mon, ... 6=Sat
  // Convert to 1=Sun, 2=Mon, ... 7=Sat
  return localDate.getUTCDay() + 1
}

// ── Tithi edge-case classification ──────────────────────────────────────────

/**
 * Determines the TithiType for a given day by comparing with adjacent days.
 *
 * @param tithiToday    tithi at sunrise today
 * @param tithiYesterday tithi at sunrise yesterday (pass null if unavailable)
 * @param tithiTomorrow  tithi at sunrise tomorrow (pass null if unavailable)
 */
export function computeTithiType(
  tithiToday: number,
  tithiYesterday: number | null,
  tithiTomorrow: number | null
): TithiType {
  // Vriddhi: same tithi at yesterday's sunrise and today's sunrise
  if (tithiYesterday !== null && tithiYesterday === tithiToday) {
    return 'vriddhi'
  }

  // Kshaya: tomorrow's tithi skips over today's + 1
  // e.g. today=11, tomorrow=13 → tithi 12 is Kshaya today
  // Handle wrap-around (tithi 30 → 1)
  if (tithiTomorrow !== null) {
    const todayNext = (tithiToday % 30) + 1  // expected next tithi
    const actualNext = tithiTomorrow
    if (actualNext !== todayNext) {
      return 'kshaya'
    }
  }

  return 'normal'
}

// ── Main computation function ────────────────────────────────────────────────

/**
 * Computes all panchang elements for a single BS date.
 *
 * @param input.adDate           - UTC midnight Date returned by bsToAd()
 * @param input.lat              - Observer latitude (default: Kathmandu)
 * @param input.lon              - Observer longitude (default: Kathmandu)
 * @param input.alt              - Observer altitude in metres (default: 1400)
 * @param input.tzOffsetMinutes  - Timezone offset in minutes (default: 345 = NST)
 *
 * The tithiType is set to 'normal' by default. To detect Kshaya/Vriddhi,
 * call computeTithiType() with the results from adjacent days and update
 * the returned object — this is handled by the generator (Step 8) which
 * processes dates sequentially.
 */
export function computePanchang(input: ComputeInput): PanchangComputed {
  const lat = input.lat ?? KTM_LAT
  const lon = input.lon ?? KTM_LON
  const alt = input.alt ?? KTM_ALT
  const tz  = input.tzOffsetMinutes ?? NST_OFFSET_MINUTES

  const sunriseMoment = getSunriseForNepaliDay(input.adDate, lat, lon, alt)
  const { sunLon, moonLon, moonPhase } = getPositionsAt(sunriseMoment)

  return {
    tithi:         tithiFromPhase(moonPhase),
    nakshatra:     nakshatraFromMoonLon(moonLon),
    yoga:          yogaFromPositions(sunLon, moonLon),
    karana:        karanaFromPhase(moonPhase),
    vara:          varaFromDate(sunriseMoment, tz),
    sunriseMoment,
    sunLon,
    moonLon,
    tithiType:     'normal',
  }
}
