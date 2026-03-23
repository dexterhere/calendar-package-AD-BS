/**
 * scripts/generate-panchang.ts
 *
 * Generates astronomically accurate panchang JSON files for a range of BS years.
 *
 * Uses @ishubhamx/panchangam-js (astronomy-engine / Swiss Ephemeris accuracy)
 * with Kathmandu coordinates and Nepal Standard Time (UTC+5:45).
 *
 * Output schema per entry: { m: number, d: number, t: number, n: number }
 *   m = BS month (1–12)
 *   d = BS day (1–32)
 *   t = tithi number at sunrise, 1–30  (1–15 = Shukla, 16–30 = Krishna)
 *   n = nakshatra number at sunrise, 1–27 (1 = Ashwini, ... 27 = Revati)
 *
 * Usage:
 *   pnpm generate:panchang
 *   pnpm generate:panchang -- --from 2084 --to 2084
 *   pnpm generate:panchang -- --from 2080 --to 2090 --out src/data/panchang
 *
 * Replaces existing JSON files — commit the results after manual validation.
 */

import { getPanchangam, Observer } from '@ishubhamx/panchangam-js'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { bsToAd } from '../src/converter/bs-to-ad.js'
import { getMonthDayCount } from '../src/data/bs-month-lengths.js'

// ── Kathmandu reference location ────────────────────────────────────────────
const OBSERVER   = new Observer(27.7172, 85.3240, 1400) // lat, lon, elevation(m)
const NST_OFFSET = 345                                   // UTC+5:45 in minutes

// ── Argument parsing ─────────────────────────────────────────────────────────
const argv = process.argv.slice(2)
function arg(flag: string, fallback: string): string {
  const i = argv.indexOf(flag)
  return i !== -1 && argv[i + 1] !== undefined ? (argv[i + 1] as string) : fallback
}

const FROM_YEAR = parseInt(arg('--from', '2080'), 10)
const TO_YEAR   = parseInt(arg('--to',   '2090'), 10)
const OUT_DIR   = arg('--out', 'src/data/panchang')

// Resolve output dir relative to project root (one level up from scripts/)
const ROOT     = path.resolve(fileURLToPath(import.meta.url), '../..')
const ABS_OUT  = path.resolve(ROOT, OUT_DIR)

// ── Entry type ───────────────────────────────────────────────────────────────
interface PanchangEntry {
  m: number   // BS month 1–12
  d: number   // BS day
  t: number   // tithi 1–30
  n: number   // nakshatra 1–27
}

// ── Main generation ──────────────────────────────────────────────────────────
console.log(`\nGenerating panchang for BS ${FROM_YEAR}–${TO_YEAR}`)
console.log(`Output: ${ABS_OUT}\n`)

let totalErrors = 0

for (let bsYear = FROM_YEAR; bsYear <= TO_YEAR; bsYear++) {
  const entries: PanchangEntry[] = []
  let yearErrors = 0

  for (let month = 1; month <= 12; month++) {
    const daysInMonth = getMonthDayCount(bsYear, month)

    for (let day = 1; day <= daysInMonth; day++) {
      // Convert BS date → AD Date (UTC midnight of that Gregorian date)
      const adDate = bsToAd({ year: bsYear, month, day })

      try {
        const p = getPanchangam(adDate, OBSERVER, { timezoneOffset: NST_OFFSET })

        // tithi: library is 0-based (0=Shukla Pratipada, 29=Amavasya)
        //        our schema is 1-based (1=Shukla Pratipada, 30=Amavasya)
        const tithi = (p.tithi as number) + 1

        // nakshatra: library is 0-based (Ashwini=0), our schema is 1-based (Ashwini=1)
        const nakshatra = (p.nakshatra as number) + 1

        if (tithi < 1 || tithi > 30) {
          console.error(`  ⚠ BS ${bsYear}-${month}-${day}: invalid tithi=${tithi}, skipping`)
          yearErrors++
          continue
        }
        if (nakshatra < 1 || nakshatra > 27) {
          console.error(`  ⚠ BS ${bsYear}-${month}-${day}: invalid nakshatra=${nakshatra}, skipping`)
          yearErrors++
          continue
        }

        entries.push({ m: month, d: day, t: tithi, n: nakshatra })
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        console.error(`  ✗ BS ${bsYear}-${month}-${day}: ${msg}`)
        yearErrors++
      }
    }
  }

  // Write output file
  const outPath = path.join(ABS_OUT, `${bsYear}.json`)
  fs.writeFileSync(outPath, JSON.stringify(entries), 'utf8')

  const status = yearErrors === 0 ? '✓' : `⚠ ${yearErrors} errors`
  console.log(`  ${status}  BS ${bsYear}  →  ${outPath}  (${entries.length} entries)`)
  totalErrors += yearErrors
}

console.log(`\nDone. Total entries written across ${TO_YEAR - FROM_YEAR + 1} years.`)
if (totalErrors > 0) {
  console.error(`\n⚠  ${totalErrors} errors encountered — review output before committing.`)
  process.exit(1)
} else {
  console.log('✓ No errors. Run validate:panchang next to verify accuracy.')
}
