/**
 * src/panchang/compute-fallback.ts
 *
 * Runtime computation fallback — Phase 7 Step 9.
 *
 * Called by getPanchang() when:
 *   (a) The requested BS year is outside the precomputed data range (2080–2090), or
 *   (b) A non-Kathmandu observer location is requested.
 *
 * Uses computePanchang() from src/astro/compute.ts (astronomy-engine, JPL-validated).
 * Results are LRU-cached (max 1000 entries) for the session lifetime to avoid
 * redundant astronomical computations on repeated queries.
 *
 * Note on tithiType: Runtime fallback always returns 'normal'. Kshaya/Vriddhi
 * detection requires adjacent-day tithis (3-day sliding window) which would triple
 * the computation cost per call. Precomputed data has correct tithiType for all
 * covered years (BS 2080–2090). For other years, 'normal' is correct for ~99% of days.
 */

import type { BSDate } from '../converter/types.js'
import type { PanchangInfo } from './types.js'
import { bsToAd } from '../converter/bs-to-ad.js'
import { computePanchang, type PanchangComputed } from '../astro/compute.js'
import { KTM_LAT, KTM_LON, NST_OFFSET_MINUTES } from '../astro/constants.js'
import { getTithiByNumber } from '../i18n/tithi-names.js'
import { getNakshatraByNumber } from '../i18n/nakshatra-names.js'
import { getYogaByNumber } from '../i18n/yoga-names.js'
import { getKaranaByNumber } from '../astro/karana-names.js'
import { PAKSHA_NAMES } from '../i18n/paksha-names.js'

// ── Observer options ──────────────────────────────────────────────────────────

export interface FallbackOptions {
  /** Observer latitude in degrees (default: 27.7172 = Kathmandu) */
  lat?: number
  /** Observer longitude in degrees (default: 85.3240 = Kathmandu) */
  lon?: number
  /** Timezone offset in minutes (default: 345 = NST UTC+5:45) */
  tzOffsetMinutes?: number
}

// ── LRU cache ─────────────────────────────────────────────────────────────────

const LRU_MAX = 1000
const _lru = new Map<string, PanchangInfo>()

function lruGet(key: string): PanchangInfo | undefined {
  const val = _lru.get(key)
  if (val === undefined) return undefined
  // Move to end (most recently used)
  _lru.delete(key)
  _lru.set(key, val)
  return val
}

function lruSet(key: string, val: PanchangInfo): void {
  if (_lru.has(key)) _lru.delete(key)
  _lru.set(key, val)
  if (_lru.size > LRU_MAX) {
    const oldest = _lru.keys().next().value
    if (oldest !== undefined) _lru.delete(oldest)
  }
}

// ── Conversion helper ─────────────────────────────────────────────────────────

function computedToPanchangInfo(result: PanchangComputed): PanchangInfo {
  const paksha: 'shukla' | 'krishna' = result.tithi <= 15 ? 'shukla' : 'krishna'
  const tithiDef = getTithiByNumber(result.tithi)
  const nDef     = getNakshatraByNumber(result.nakshatra)
  const yDef     = getYogaByNumber(result.yoga)
  const kDef     = getKaranaByNumber(result.karana)

  return {
    tithi: {
      name:   tithiDef.en,
      nameNe: tithiDef.ne,
      number: result.tithi,
    },
    paksha,
    pakshaName: PAKSHA_NAMES[paksha],
    nakshatra: { name: nDef.en, nameNe: nDef.ne },
    yoga:      { name: yDef.en, nameNe: yDef.ne, number: result.yoga },
    karana:    { name: kDef.en, nameNe: kDef.ne, number: result.karana, inauspicious: kDef.inauspicious },
    tithiType: 'normal',
  }
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Computes PanchangInfo live for any BS date and optional observer location.
 * Results are LRU-cached (max 1000 entries) within the current session.
 *
 * @throws if the BS date cannot be converted to AD (outside BS 2000–2090 range).
 *         Callers should catch and return null for unsupported dates.
 */
export function computeFallback(bsDate: BSDate, options?: FallbackOptions): PanchangInfo {
  const lat = options?.lat ?? KTM_LAT
  const lon = options?.lon ?? KTM_LON
  const tz  = options?.tzOffsetMinutes ?? NST_OFFSET_MINUTES

  const key = `${bsDate.year}-${bsDate.month}-${bsDate.day}-${lat}-${lon}`
  const cached = lruGet(key)
  if (cached !== undefined) return cached

  const adDate = bsToAd(bsDate)
  const result = computePanchang({ adDate, lat, lon, tzOffsetMinutes: tz })
  const info   = computedToPanchangInfo(result)

  lruSet(key, info)
  return info
}

// ── Cache inspection (for tests) ─────────────────────────────────────────────

/** Returns the current number of entries in the LRU cache. Exposed for testing. */
export function _lruSize(): number {
  return _lru.size
}
