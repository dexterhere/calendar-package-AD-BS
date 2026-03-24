/**
 * scripts/generate-panchang-v2.ts
 *
 * Phase 7 Step 8 — New Panchang Generator.
 *
 * Replaces generate-panchang.ts (which used @ishubhamx/panchangam-js).
 * Uses computePanchang() from src/astro/compute.ts directly — the same
 * astronomy-engine based engine validated against NASA JPL Horizons in Steps 4–6.
 *
 * Output schema per entry:
 *   m  — BS month (1–12)
 *   d  — BS day (1–32)
 *   t  — tithi 1–30 at sunrise (1–15 Shukla, 16–30 Krishna)
 *   n  — nakshatra 1–27 at sunrise (1=Ashwini … 27=Revati)
 *   y  — yoga 1–27 at sunrise (1=Vishkambha … 27=Vaidhriti)
 *   k  — karana 1–11 at sunrise (1=Bava … 11=Kimstughna)
 *   tt — 'k' (Kshaya) | 'v' (Vriddhi), omitted for normal days
 *
 * Kshaya/Vriddhi detection uses a 3-day sliding window (yesterday, today, tomorrow)
 * via computeTithiType(). Boundary days borrow from the adjacent year.
 *
 * Usage:
 *   # Single year pilot
 *   pnpm exec tsx --tsconfig scripts/tsconfig.scripts.json \
 *     scripts/generate-panchang-v2.ts --year 2082
 *
 *   # Full range
 *   pnpm exec tsx --tsconfig scripts/tsconfig.scripts.json \
 *     scripts/generate-panchang-v2.ts --from 2080 --to 2090
 *
 *   # Dry run (print to stdout, don't write files)
 *   pnpm exec tsx --tsconfig scripts/tsconfig.scripts.json \
 *     scripts/generate-panchang-v2.ts --year 2082 --dry-run
 *
 *   # Compare new output against existing files (show differences)
 *   pnpm exec tsx --tsconfig scripts/tsconfig.scripts.json \
 *     scripts/generate-panchang-v2.ts --year 2082 --compare
 */

import fs   from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { computePanchang, computeTithiType } from '../src/astro/compute.js'
import { bsToAd }                            from '../src/converter/bs-to-ad.js'
import {
  getMonthDayCount,
  BS_DATA_YEAR_MIN,
  BS_DATA_YEAR_MAX,
} from '../src/data/bs-month-lengths.js'

// ── Paths ─────────────────────────────────────────────────────────────────────
const ROOT    = path.resolve(fileURLToPath(import.meta.url), '../..')
const OUT_DIR = path.join(ROOT, 'src', 'data', 'panchang')

// ── Output entry type ─────────────────────────────────────────────────────────

interface OutputEntry {
  m:   number          // BS month 1–12
  d:   number          // BS day
  t:   number          // tithi 1–30
  n:   number          // nakshatra 1–27
  y:   number          // yoga 1–27
  k:   number          // karana 1–11
  tt?: 'k' | 'v'      // kshaya | vriddhi (omitted when normal)
}

// ── BS day iterator ───────────────────────────────────────────────────────────

interface BSDayEntry {
  bsYear:  number
  bsMonth: number
  bsDay:   number
  adDate:  Date
}

function getAllDaysInYear(bsYear: number): BSDayEntry[] {
  const days: BSDayEntry[] = []
  for (let month = 1; month <= 12; month++) {
    const daysInMonth = getMonthDayCount(bsYear, month)
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        bsYear,
        bsMonth: month,
        bsDay:   day,
        adDate:  bsToAd({ year: bsYear, month, day }),
      })
    }
  }
  return days
}

function getLastDayOfYear(bsYear: number): Date {
  const lastMonth = 12
  const lastDay   = getMonthDayCount(bsYear, lastMonth)
  return bsToAd({ year: bsYear, month: lastMonth, day: lastDay })
}

function getFirstDayOfYear(bsYear: number): Date {
  return bsToAd({ year: bsYear, month: 1, day: 1 })
}

// ── Tithi computation (cached) ────────────────────────────────────────────────

function getTithiForDate(adDate: Date): number {
  return computePanchang({ adDate }).tithi
}

// ── Year generation ───────────────────────────────────────────────────────────

function generateYear(bsYear: number): OutputEntry[] {
  const days = getAllDaysInYear(bsYear)

  // Compute all tithis in one pass (full computePanchang for each day)
  const results = days.map(day => computePanchang({ adDate: day.adDate }))

  // Boundary tithis for Kshaya/Vriddhi detection on first and last day
  const prevYearTithi = bsYear > BS_DATA_YEAR_MIN
    ? getTithiForDate(getLastDayOfYear(bsYear - 1))
    : null

  const nextYearTithi = bsYear < BS_DATA_YEAR_MAX
    ? getTithiForDate(getFirstDayOfYear(bsYear + 1))
    : null

  const entries: OutputEntry[] = []

  for (let i = 0; i < days.length; i++) {
    const day    = days[i]!
    const result = results[i]!

    const tithiYesterday = i === 0
      ? prevYearTithi
      : results[i - 1]!.tithi

    const tithiTomorrow = i === days.length - 1
      ? nextYearTithi
      : results[i + 1]!.tithi

    const tithiType = computeTithiType(result.tithi, tithiYesterday, tithiTomorrow)

    const entry: OutputEntry = {
      m: day.bsMonth,
      d: day.bsDay,
      t: result.tithi,
      n: result.nakshatra,
      y: result.yoga,
      k: result.karana,
    }

    if (tithiType === 'kshaya')  entry.tt = 'k'
    if (tithiType === 'vriddhi') entry.tt = 'v'

    entries.push(entry)
  }

  return entries
}

// ── Comparison helper ─────────────────────────────────────────────────────────

interface DiffEntry {
  bsDate:   string
  field:    'tithi' | 'nakshatra'
  oldValue: number
  newValue: number
}

function compareWithExisting(bsYear: number, newEntries: OutputEntry[]): DiffEntry[] {
  const existingPath = path.join(OUT_DIR, `${bsYear}.json`)
  if (!fs.existsSync(existingPath)) return []

  type OldEntry = { m: number; d: number; t: number; n?: number }
  const existing = JSON.parse(fs.readFileSync(existingPath, 'utf8')) as OldEntry[]
  const oldMap   = new Map(existing.map(e => [`${e.m}-${e.d}`, e]))

  const diffs: DiffEntry[] = []

  for (const entry of newEntries) {
    const key = `${entry.m}-${entry.d}`
    const old = oldMap.get(key)
    if (!old) continue

    if (old.t !== entry.t) {
      diffs.push({
        bsDate:   `${bsYear}-${String(entry.m).padStart(2,'0')}-${String(entry.d).padStart(2,'0')}`,
        field:    'tithi',
        oldValue: old.t,
        newValue: entry.t,
      })
    }
    if (old.n !== undefined && old.n !== entry.n) {
      diffs.push({
        bsDate:   `${bsYear}-${String(entry.m).padStart(2,'0')}-${String(entry.d).padStart(2,'0')}`,
        field:    'nakshatra',
        oldValue: old.n,
        newValue: entry.n,
      })
    }
  }

  return diffs
}

// ── CLI ───────────────────────────────────────────────────────────────────────

const argv    = process.argv.slice(2)
const get     = (flag: string) => { const i = argv.indexOf(flag); return i !== -1 ? argv[i+1] : undefined }
const hasFlag = (flag: string) => argv.includes(flag)

const singleYear = get('--year')
const fromYear   = get('--from')
const toYear     = get('--to')
const dryRun     = hasFlag('--dry-run')
const compare    = hasFlag('--compare')

const years: number[] = singleYear
  ? [parseInt(singleYear, 10)]
  : fromYear && toYear
    ? Array.from(
        { length: parseInt(toYear, 10) - parseInt(fromYear, 10) + 1 },
        (_, i) => parseInt(fromYear, 10) + i
      )
    : []

if (years.length === 0) {
  console.error('Usage:')
  console.error('  generate-panchang-v2.ts --year 2082')
  console.error('  generate-panchang-v2.ts --from 2080 --to 2090')
  console.error('  generate-panchang-v2.ts --year 2082 --dry-run')
  console.error('  generate-panchang-v2.ts --year 2082 --compare')
  process.exit(1)
}

for (const y of years) {
  if (y < BS_DATA_YEAR_MIN || y > BS_DATA_YEAR_MAX) {
    console.error(`BS year ${y} out of supported range (${BS_DATA_YEAR_MIN}–${BS_DATA_YEAR_MAX})`)
    process.exit(1)
  }
}

console.log(`\n${'═'.repeat(60)}`)
console.log(`  Panchang Generator v2 — astronomy-engine`)
console.log('═'.repeat(60))
console.log(`  Years   : ${years.join(', ')}`)
console.log(`  Engine  : astronomy-engine (JPL-validated)`)
console.log(`  Location: Kathmandu 27.7172°N 85.3240°E 1400m NST`)
console.log(`  Fields  : m d t n y k tt`)
if (dryRun) console.log('  Mode    : DRY RUN (no files written)')
if (compare) console.log('  Compare : will diff against existing files')
console.log('═'.repeat(60) + '\n')

let totalKshaya  = 0
let totalVriddhi = 0

for (const bsYear of years) {
  process.stdout.write(`  Generating BS ${bsYear} ...`)

  const entries = generateYear(bsYear)

  const kshayaDays  = entries.filter(e => e.tt === 'k')
  const vriddhiDays = entries.filter(e => e.tt === 'v')
  totalKshaya  += kshayaDays.length
  totalVriddhi += vriddhiDays.length

  if (compare) {
    const diffs = compareWithExisting(bsYear, entries)
    if (diffs.length > 0) {
      console.log(` ⚠ ${diffs.length} difference(s) vs existing:`)
      for (const d of diffs) {
        console.log(
          `    ${d.bsDate}  ${d.field}: old=${d.oldValue} new=${d.newValue}` +
          (d.field === 'tithi' ? '  ← check: new engine should be authoritative' : '')
        )
      }
    } else {
      console.log(' ✓ no differences vs existing')
    }
  } else {
    console.log(
      ` ✓  ${entries.length} days` +
      (kshayaDays.length  > 0 ? `  kshaya=${kshayaDays.length}`  : '') +
      (vriddhiDays.length > 0 ? `  vriddhi=${vriddhiDays.length}` : '')
    )
  }

  if (kshayaDays.length > 0 || vriddhiDays.length > 0) {
    for (const e of [...kshayaDays, ...vriddhiDays]) {
      const type = e.tt === 'k' ? 'KSHAYA ' : 'VRIDDHI'
      const mm = String(e.m).padStart(2,'0')
      const dd = String(e.d).padStart(2,'0')
      console.log(
        `    ${type}  BS ${bsYear}-${mm}-${dd}` +
        `  t=${String(e.t).padStart(2)}  n=${String(e.n).padStart(2)}` +
        (e.tt === 'k' ? `  (kshaya tithi = ${(e.t % 30) + 1})` : '')
      )
    }
  }

  if (!dryRun) {
    const outPath = path.join(OUT_DIR, `${bsYear}.json`)
    fs.writeFileSync(outPath, JSON.stringify(entries), 'utf8')
  }
}

console.log(`\n${'─'.repeat(60)}`)
console.log(`  Done: ${years.length} year(s)`)
console.log(`  Kshaya days detected : ${totalKshaya}`)
console.log(`  Vriddhi days detected: ${totalVriddhi}`)
if (dryRun) {
  console.log('  Files NOT written (dry run)')
} else {
  console.log(`  Output: ${OUT_DIR}`)
  console.log('  Next: run pnpm test to verify, then git add src/data/panchang/*.json')
}
console.log('─'.repeat(60) + '\n')
