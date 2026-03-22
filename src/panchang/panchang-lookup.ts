import type { BSDate } from '../converter/types.js'
import type { PanchangInfo } from './types.js'
import { adToBs } from '../converter/ad-to-bs.js'
import { PAKSHA_NAMES } from '../i18n/paksha-names.js'
import { getTithiByNumber } from '../i18n/tithi-names.js'
import { getNakshatraByNumber } from '../i18n/nakshatra-names.js'
import type { PanchangEntry } from '../data/panchang/schema.js'

/** Years for which a panchang JSON data file exists. */
const PANCHANG_YEARS = new Set([2082, 2083, 2084, 2085, 2086, 2087])

/**
 * Per-year panchang cache.
 * Key: BS year. Value: Map from date key (month * 100 + day) → PanchangEntry.
 * Populated lazily on first access for each year.
 */
const _cache = new Map<number, Map<number, PanchangEntry>>()

// Pre-built import map for vite/Rollup to statically analyze
// This avoids the "invalid import" warning for dynamic imports
const PANCHANG_IMPORTS: Record<number, () => Promise<{ default: PanchangEntry[] }>> = {
  2082: () => import('../data/panchang/2082.json', { with: { type: 'json' } }),
  2083: () => import('../data/panchang/2083.json', { with: { type: 'json' } }),
  2084: () => import('../data/panchang/2084.json', { with: { type: 'json' } }),
  2085: () => import('../data/panchang/2085.json', { with: { type: 'json' } }),
  2086: () => import('../data/panchang/2086.json', { with: { type: 'json' } }),
  2087: () => import('../data/panchang/2087.json', { with: { type: 'json' } }),
}

/**
 * Loads and indexes a year's panchang JSON file into the cache.
 * Returns false if the file does not exist or fails to load.
 */
async function loadYear(year: number): Promise<boolean> {
  if (_cache.has(year)) return true
  if (!PANCHANG_YEARS.has(year)) return false

  try {
    const importFn = PANCHANG_IMPORTS[year]
    if (!importFn) return false

    const module = await importFn()
    const entries = module.default as PanchangEntry[]

    const index = new Map<number, PanchangEntry>()
    for (const entry of entries) {
      index.set(entry.m * 100 + entry.d, entry)
    }
    _cache.set(year, index)
    return true
  } catch {
    return false
  }
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
 * Returns panchang data (tithi, paksha, nakshatra) for a given date.
 *
 * - Accepts either a Gregorian Date or a BSDate.
 * - Returns null if the date is outside the pre-computed data range, or if
 *   the year's data has not been loaded yet (call ensurePanchangYear first).
 * - This function is synchronous and non-blocking; use ensurePanchangYear()
 *   to pre-load data before calling getPanchang() in bulk.
 */
export function getPanchang(date: Date | BSDate): PanchangInfo | null {
  const bsDate: BSDate = date instanceof Date ? adToBs(date) : date
  return lookupSync(bsDate)
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

  const info: PanchangInfo = {
    tithi: {
      name: tithiDef.en,
      nameNe: tithiDef.ne,
      number: tithiNum,
    },
    paksha,
    pakshaName: PAKSHA_NAMES[paksha],
  }

  if (entry.n !== undefined) {
    const nDef = getNakshatraByNumber(entry.n)
    info.nakshatra = { name: nDef.en, nameNe: nDef.ne }
  }

  return info
}

// Re-export the lookup function used internally by the calendar grid
export { lookupSync as _getPanchangSync }
