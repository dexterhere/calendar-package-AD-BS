import type { BSDate } from '../converter/types.js'
import type { PanchangInfo } from './types.js'
import { adToBs } from '../converter/ad-to-bs.js'
import { BS_YEAR_MAX, BS_YEAR_MIN, validateBSDate } from '../converter/utils.js'
import { PAKSHA_NAMES } from '../i18n/paksha-names.js'
import { getTithiByNumber } from '../i18n/tithi-names.js'
import { getNakshatraByNumber } from '../i18n/nakshatra-names.js'
import { getYogaByNumber } from '../i18n/yoga-names.js'
import { getKaranaByNumber } from '../astro/karana-names.js'
import type { PanchangEntry } from '../data/panchang/schema.js'
import { PANCHANG_DATA } from '../data/panchang/all-years.js'
import { computeFallback, type FallbackOptions } from './compute-fallback.js'
import { KTM_LAT, KTM_LON } from '../astro/constants.js'

export type { FallbackOptions }

/** Years for which a panchang JSON data file exists. */
const PANCHANG_YEARS = new Set([2080, 2081, 2082, 2083, 2084, 2085, 2086, 2087, 2088, 2089, 2090])

/**
 * Per-year panchang cache.
 * Key: BS year. Value: Map from date key (month * 100 + day) → PanchangEntry.
 * Populated lazily on first access for each year.
 */
const _cache = new Map<number, Map<number, PanchangEntry>>()

/**
 * Loads and indexes a year's panchang JSON file into the cache.
 * Returns false if the file does not exist or fails to load.
 */
async function loadYear(year: number): Promise<boolean> {
  if (_cache.has(year)) return true
  if (!PANCHANG_YEARS.has(year)) return false

  // Use embedded data instead of dynamic imports
  const entries = PANCHANG_DATA[year]
  if (entries === undefined) {
    throw new Error(`Panchang data is missing for BS year ${year}.`)
  }

  const index = new Map<number, PanchangEntry>()
  for (const entry of entries) {
    assertPanchangEntry(entry, year)
    index.set(entry.m * 100 + entry.d, entry)
  }
  _cache.set(year, index)
  return true
}

/**
 * Synchronous lookup — works only after the year has been pre-loaded via ensurePanchangYear().
 * Used internally by getMonthCalendar() after pre-loading the year.
 */
function lookupSync(bsDate: BSDate): PanchangInfo | null {
  const index = _cache.get(bsDate.year)
  if (index === undefined) return null

  const entry = index.get(bsDate.month * 100 + bsDate.day)
  if (entry === undefined) return null

  return entryToPanchangInfo(entry)
}

/**
 * Pre-loads panchang data for a given BS year into the in-memory cache.
 * Call this once before rendering a calendar month to avoid async gaps.
 * Safe to call multiple times — subsequent calls for the same year are no-ops.
 */
export async function ensurePanchangYear(bsYear: number): Promise<void> {
  await loadYear(bsYear)
}

/**
 * Returns panchang data for a given date.
 *
 * - Accepts either a Gregorian Date or a BSDate.
 * - `options` can specify a custom observer location (lat/lon).
 *
 * Fast path (precomputed data): used when the year is in the precomputed range
 * (BS 2080–2090) and no custom location is provided. Call ensurePanchangYear()
 * before bulk queries to avoid async gaps.
 *
 * Fallback path (live computation): used when the year is outside the precomputed
 * range OR a non-Kathmandu location is requested. Falls back to computePanchang()
 * (astronomy-engine, JPL-validated). Results are LRU-cached per session.
 *
 * Returns null only if the date is entirely outside the supported BS calendar range
 * (BS 2000–2090) or if computation fails.
 */
export function getPanchang(date: Date | BSDate, options?: FallbackOptions): PanchangInfo | null {
  const bsDate = toSupportedBSDate(date)
  if (bsDate === null) return null

  const lat = options?.lat ?? KTM_LAT
  const lon = options?.lon ?? KTM_LON
  const isKathmandu = lat === KTM_LAT && lon === KTM_LON

  // Fast path: precomputed data available and no custom location
  if (isKathmandu && PANCHANG_YEARS.has(bsDate.year)) {
    return lookupSync(bsDate)
  }

  // Fallback: live computation for out-of-precomputed-range years or custom locations
  return computeFallback(bsDate, options)
}

/**
 * Eagerly loads panchang data for all available years.
 * Useful for server-side initialization (e.g., NestJS startup).
 */
export async function preloadAllPanchang(): Promise<void> {
  await Promise.all([...PANCHANG_YEARS].map(y => loadYear(y)))
}

// ─── Internal helpers ────────────────────────────────────────────────────────

function entryToPanchangInfo(entry: PanchangEntry): PanchangInfo {
  const tithiNum = entry.t
  const paksha: 'shukla' | 'krishna' = tithiNum <= 15 ? 'shukla' : 'krishna'
  const tithiDef = getTithiByNumber(tithiNum)

  const tithiType: PanchangInfo['tithiType'] =
    entry.tt === 'k' ? 'kshaya' :
    entry.tt === 'v' ? 'vriddhi' :
    'normal'

  const info: PanchangInfo = {
    tithi: {
      name: tithiDef.en,
      nameNe: tithiDef.ne,
      number: tithiNum,
    },
    paksha,
    pakshaName: PAKSHA_NAMES[paksha],
    tithiType,
  }

  if (entry.n !== undefined) {
    const nDef = getNakshatraByNumber(entry.n)
    info.nakshatra = { name: nDef.en, nameNe: nDef.ne }
  }

  if (entry.y !== undefined) {
    const yDef = getYogaByNumber(entry.y)
    info.yoga = { name: yDef.en, nameNe: yDef.ne, number: entry.y }
  }

  if (entry.k !== undefined) {
    const kDef = getKaranaByNumber(entry.k)
    info.karana = { name: kDef.en, nameNe: kDef.ne, number: entry.k, inauspicious: kDef.inauspicious }
  }

  return info
}

function assertPanchangEntry(entry: PanchangEntry, year: number): void {
  if (entry.tt !== undefined && entry.tt !== 'k' && entry.tt !== 'v') {
    throw new TypeError(
      `Invalid tithiType marker '${String(entry.tt)}' in embedded panchang data for BS year ${year}.`
    )
  }
}

function toSupportedBSDate(date: Date | BSDate): BSDate | null {
  if (date instanceof Date) {
    try {
      return adToBs(date)
    } catch (error) {
      if (error instanceof RangeError) return null
      throw error
    }
  }

  if (date.year < BS_YEAR_MIN || date.year > BS_YEAR_MAX) {
    return null
  }

  validateBSDate(date)
  return date
}

// Re-export the lookup function used internally by the calendar grid
export { lookupSync as _getPanchangSync }
