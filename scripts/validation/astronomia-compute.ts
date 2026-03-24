/**
 * scripts/validation/astronomia-compute.ts
 *
 * Step 5 — Third independent astronomical engine using `astronomia`.
 *
 * Computes Sun and Moon ecliptic longitudes using Jean Meeus algorithms
 * (as implemented in the MIT-licensed `astronomia` package) at 00:00 UTC
 * for a given Nepal date — matching the Horizons query time for consistent
 * 3-way comparison.
 *
 * Accuracy: ~arcminute for Sun, ~1–5 arcminutes for Moon (Meeus Ch. 25/47).
 * Suitable as an independent cross-check alongside astronomy-engine and
 * NASA Horizons.
 *
 * Usage (CLI):
 *   pnpm exec tsx --tsconfig scripts/tsconfig.scripts.json \
 *     scripts/validation/astronomia-compute.ts --date 2025-04-14
 *
 *   pnpm exec tsx --tsconfig scripts/tsconfig.scripts.json \
 *     scripts/validation/astronomia-compute.ts --from 2025-04-14 --to 2025-04-18
 */

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore — astronomia ships CJS without bundled type declarations
import * as solar from 'astronomia/solar'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as moonposition from 'astronomia/moonposition'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as base from 'astronomia/base'

// ── Constants ─────────────────────────────────────────────────────────────────

const RAD_TO_DEG = 180 / Math.PI
const DEGREES_PER_TITHI     = 12          // 360 / 30
const DEGREES_PER_NAKSHATRA = 360 / 27    // ≈ 13.333°

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AstronomiaPosition {
  /** Gregorian date (YYYY-MM-DD) — matches the Nepal solar day */
  date: string
  /** Sun ecliptic longitude at 00:00 UTC (degrees, 0–360) */
  sunLon: number
  /** Moon ecliptic longitude at 00:00 UTC (degrees, 0–360) */
  moonLon: number
  /** Moon phase angle = (moonLon - sunLon + 360) % 360 */
  moonPhase: number
  /** Tithi derived from moon phase: floor(moonPhase / 12) + 1 */
  tithi: number
  /** Nakshatra derived from moon longitude: floor(moonLon / (360/27)) + 1 */
  nakshatra: number
  /** UTC ISO timestamp used for the query (00:00 UTC = 05:45 NST) */
  queryTime: string
}

// ── Julian Day helpers ────────────────────────────────────────────────────────

/**
 * Converts a UTC Date to a Julian Day Number (JD).
 *
 * Uses astronomia's base.J2000 constant (JD of 2000 Jan 1.5 = 2451545.0)
 * plus the elapsed time from J2000 epoch in days.
 *
 * J2000 epoch in Unix time: Date.UTC(2000, 0, 1, 12, 0, 0) = 2000-01-01T12:00:00Z
 */
function dateToJD(date: Date): number {
  const J2000_UNIX_MS = Date.UTC(2000, 0, 1, 12, 0, 0)
  const elapsedDays = (date.getTime() - J2000_UNIX_MS) / 86_400_000
  return (base.J2000 as number) + elapsedDays
}

// ── Position computation ──────────────────────────────────────────────────────

/**
 * Computes Sun and Moon ecliptic longitudes using Jean Meeus algorithms.
 *
 * @param utcDate  The UTC Date to query (typically 00:00 UTC of the Nepal date)
 * @returns        Positions in degrees (0–360), ecliptic longitude only
 */
function getAstronomiaPositions(utcDate: Date): { sunLon: number; moonLon: number } {
  const jd = dateToJD(utcDate)
  const T  = base.J2000Century(jd) as number  // Julian centuries from J2000.0

  // Sun apparent longitude (Meeus Ch. 25) — returned in radians
  const sunLonRad  = solar.apparentLongitude(T) as number
  const sunLonDeg  = ((sunLonRad * RAD_TO_DEG) % 360 + 360) % 360

  // Moon longitude (Meeus Ch. 47) — returned in radians
  const moonLonRad = (moonposition.position(jd) as { lon: number }).lon
  const moonLonDeg = ((moonLonRad * RAD_TO_DEG) % 360 + 360) % 360

  return { sunLon: sunLonDeg, moonLon: moonLonDeg }
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Returns all computed panchang-relevant positions for a given Nepal date string.
 *
 * The date string is a Gregorian date (YYYY-MM-DD) that corresponds to the
 * Nepal solar day — the same string format used by the Horizons cache keys.
 * Queries at 00:00 UTC = 05:45 NST (just after sunrise) for consistency with
 * `horizons-fetch.ts`.
 */
export function getAstronomiaPositions_forDate(nepaliDate: string): AstronomiaPosition {
  const queryTime = `${nepaliDate}T00:00:00Z`
  const utcDate   = new Date(queryTime)

  const { sunLon, moonLon } = getAstronomiaPositions(utcDate)

  const moonPhase = ((moonLon - sunLon) + 360) % 360
  const tithi     = Math.floor(moonPhase / DEGREES_PER_TITHI) + 1
  const nakshatra = Math.floor(moonLon / DEGREES_PER_NAKSHATRA) + 1

  return { date: nepaliDate, sunLon, moonLon, moonPhase, tithi, nakshatra, queryTime }
}

/**
 * Returns the tithi computed by `astronomia` for a given UTC midnight Date.
 * Convenience function for use by the cross-validation script (Step 6).
 *
 * @param adDate  UTC midnight Date (output format of bsToAd())
 */
export function getAstronomiaTithi(adDate: Date): number {
  const dateStr = adDate.toISOString().slice(0, 10)
  return getAstronomiaPositions_forDate(dateStr).tithi
}

// ── CLI entry point ───────────────────────────────────────────────────────────

const _cliArgv = process.argv.slice(2)
if (_cliArgv.includes('--date') || _cliArgv.includes('--from')) {
  const argv = _cliArgv
  const get  = (flag: string) => { const i = argv.indexOf(flag); return i !== -1 ? argv[i + 1] : undefined }

  const single = get('--date')
  const from   = get('--from')
  const to     = get('--to')

  function addDays(dateStr: string, n: number): string {
    const d = new Date(`${dateStr}T00:00:00Z`)
    d.setUTCDate(d.getUTCDate() + n)
    return d.toISOString().slice(0, 10)
  }

  function dateRange(fromStr: string, toStr: string): string[] {
    const dates: string[] = []
    let cur = fromStr
    while (cur <= toStr) { dates.push(cur); cur = addDays(cur, 1) }
    return dates
  }

  const dates: string[] = single
    ? [single]
    : from && to
      ? dateRange(from, to)
      : []

  if (dates.length === 0) {
    console.error('Usage:')
    console.error('  astronomia-compute.ts --date 2025-04-14')
    console.error('  astronomia-compute.ts --from 2025-04-14 --to 2025-04-18')
    process.exit(1)
  }

  console.log(`\nComputing ${dates.length} date(s) via astronomia (Jean Meeus)...\n`)

  for (const date of dates) {
    try {
      const pos = getAstronomiaPositions_forDate(date)
      console.log(
        `${date}  sunLon=${pos.sunLon.toFixed(3).padStart(8)}°` +
        `  moonLon=${pos.moonLon.toFixed(3).padStart(8)}°` +
        `  phase=${pos.moonPhase.toFixed(2).padStart(7)}°` +
        `  tithi=${String(pos.tithi).padStart(2)}` +
        `  nakshatra=${String(pos.nakshatra).padStart(2)}`
      )
    } catch (err) {
      console.error(`  ERROR ${date}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  // ── Reference date verification ──────────────────────────────────────────────

  const REFERENCE_DATES = [
    { date: '2025-04-14', expectedTithi: 16, label: 'BS 2082/1/1  — Krishna Pratipada' },
    { date: '2025-04-27', expectedTithi: 30, label: 'BS 2082/1/14 — Amavasya'         },
    { date: '2025-04-28', expectedTithi:  1, label: 'BS 2082/1/15 — Shukla Pratipada' },
    { date: '2025-05-12', expectedTithi: 15, label: 'BS 2082/1/29 — Purnima'          },
  ]

  if (dates.some(d => REFERENCE_DATES.map(r => r.date).includes(d))) {
    console.log('\n── Reference date verification ─────────────────────────────\n')
    let passed = 0
    for (const ref of REFERENCE_DATES) {
      if (!dates.includes(ref.date)) continue
      const pos = getAstronomiaPositions_forDate(ref.date)
      const ok  = pos.tithi === ref.expectedTithi
      if (ok) passed++
      console.log(
        `${ok ? 'PASS' : 'FAIL'}  ${ref.date}  tithi=${String(pos.tithi).padStart(2)}` +
        ` (expected ${String(ref.expectedTithi).padStart(2)})  ${ref.label}`
      )
    }
    console.log(`\n${passed} / ${REFERENCE_DATES.filter(r => dates.includes(r.date)).length} reference dates match\n`)
  }
}
