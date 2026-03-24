/**
 * scripts/validate-panchang.ts
 *
 * Cross-checks generated panchang JSON files against known-correct reference dates.
 *
 * Reference values sourced from:
 *   - Phase 7 Step 1 spike (drikpanchang.com spot-checks, 4 dates externally verified)
 *   - Phase 7 Step 6 3-engine cross-validation (astronomy-engine × NASA Horizons × astronomia)
 *
 * For the full CI regression suite, see tests/astro/golden-dataset.test.ts (50+ entries).
 * This script is a quick standalone CLI check — useful when regenerating panchang data.
 *
 * Usage:
 *   pnpm validate:panchang
 *
 * Exit code 0 = all references passed
 * Exit code 1 = one or more mismatches found
 *
 * To add more reference dates: edit the REFERENCE_DATES array below.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// ── Types ────────────────────────────────────────────────────────────────────
interface PanchangEntry { m: number; d: number; t: number; n: number }

interface ReferenceDate {
  bsYear:  number
  bsMonth: number
  bsDay:   number
  tithi:   number         // expected tithi 1–30
  nakshatra?: number      // expected nakshatra 1–27 (optional — harder to verify manually)
  label:   string         // human-readable description for the report
  source:  string         // where this reference value came from
}

// ── Reference dates (known-correct ground truth) ─────────────────────────────
//
// HOW TO ADD: look up the date on drikpanchang.com or hamropatro.com,
// confirm the tithi at sunrise, and add a row here.
//
// Tithi scale:
//   Shukla Pratipada=1, Dwitiya=2, ... Purnima=15
//   Krishna Pratipada=16, ... Amavasya=30
//
const REFERENCE_DATES: ReferenceDate[] = [
  // ── Tier 1 — Externally verified (drikpanchang.com) ──────────────────────
  // Phase 7 Step 1 spike: all 4/4 passed against external reference
  {
    bsYear: 2082, bsMonth: 1, bsDay: 1,
    tithi: 16, nakshatra: 17,
    label: 'BS 2082 Baishakh 1 (New Year) — Krishna Pratipada, Vishakha',
    source: 'Phase 7 Step 1 spike — verified vs drikpanchang.com 2025-04-14',
  },
  {
    bsYear: 2082, bsMonth: 1, bsDay: 14,
    tithi: 30, nakshatra: 2,
    label: 'BS 2082 Baishakh 14 — Amavasya, Bharani',
    source: 'Phase 7 Step 1 spike — verified vs drikpanchang.com 2025-04-27',
  },
  {
    bsYear: 2082, bsMonth: 1, bsDay: 15,
    tithi: 1, nakshatra: 4,
    label: 'BS 2082 Baishakh 15 — Shukla Pratipada, Rohini',
    source: 'Phase 7 Step 1 spike — verified vs drikpanchang.com 2025-04-28',
  },
  {
    bsYear: 2082, bsMonth: 1, bsDay: 29,
    tithi: 15, nakshatra: 17,
    label: 'BS 2082 Baishakh 29 — Purnima (Buddha Purnima), Vishakha',
    source: 'Phase 7 Step 1 spike — verified vs drikpanchang.com 2025-05-12',
  },
  // ── Tier 2 — 3-engine cross-validated (96.4% GREEN, Phase 7 Step 6) ──────
  {
    bsYear: 2082, bsMonth: 2,  bsDay: 13,
    tithi: 30,
    label: 'BS 2082 Jestha 13 — Amavasya',
    source: 'Phase 7 generate-panchang-v2.ts — 3-engine cross-validated Step 6',
  },
  {
    bsYear: 2082, bsMonth: 2,  bsDay: 28,
    tithi: 15,
    label: 'BS 2082 Jestha 28 — Purnima',
    source: 'Phase 7 generate-panchang-v2.ts — 3-engine cross-validated Step 6',
  },
  {
    bsYear: 2082, bsMonth: 3,  bsDay: 11,
    tithi: 30,
    label: 'BS 2082 Ashadh 11 — Amavasya',
    source: 'Phase 7 generate-panchang-v2.ts — 3-engine cross-validated Step 6',
  },
  {
    bsYear: 2082, bsMonth: 3,  bsDay: 26,
    tithi: 15,
    label: 'BS 2082 Ashadh 26 — Guru Purnima',
    source: 'Phase 7 generate-panchang-v2.ts — 3-engine cross-validated Step 6',
  },
  {
    bsYear: 2082, bsMonth: 4,  bsDay: 24,
    tithi: 15,
    label: 'BS 2082 Shrawan 24 — Janai Purnima',
    source: 'Phase 7 generate-panchang-v2.ts — 3-engine cross-validated Step 6',
  },
  // ── Add more reference dates below ───────────────────────────────────────
  // Format:
  // {
  //   bsYear: 2084, bsMonth: X, bsDay: Y,
  //   tithi: Z,
  //   nakshatra: N,  // optional — verify at drikpanchang.com
  //   label: 'description',
  //   source: 'drikpanchang.com spot-check YYYY-MM-DD',
  // },
  //
  // ⚠ BS 2084 dates to be added by Dexter once known problem dates are identified
]

// ── Load generated panchang file for a given year ───────────────────────────
const ROOT = path.resolve(fileURLToPath(import.meta.url), '../..')
const PANCHANG_DIR = path.join(ROOT, 'src/data/panchang')

function loadYear(year: number): Map<number, PanchangEntry> | null {
  const filePath = path.join(PANCHANG_DIR, `${year}.json`)
  if (!fs.existsSync(filePath)) return null
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf8')) as PanchangEntry[]
  const map = new Map<number, PanchangEntry>()
  for (const e of raw) {
    map.set(e.m * 100 + e.d, e)
  }
  return map
}

// ── Run validation ───────────────────────────────────────────────────────────
console.log('\nValidating panchang data against reference dates...\n')

let passed = 0
let failed = 0
const reportLines: string[] = []

// Cache loaded years to avoid re-reading files
const yearCache = new Map<number, Map<number, PanchangEntry> | null>()

for (const ref of REFERENCE_DATES) {
  if (!yearCache.has(ref.bsYear)) {
    yearCache.set(ref.bsYear, loadYear(ref.bsYear))
  }
  const index = yearCache.get(ref.bsYear)

  if (index === null || index === undefined) {
    const line = `[SKIP] ${ref.bsYear}-${String(ref.bsMonth).padStart(2,'0')}-${String(ref.bsDay).padStart(2,'0')}  file not found — run generate:panchang first`
    console.log(line)
    reportLines.push(line)
    failed++
    continue
  }

  const entry = index.get(ref.bsMonth * 100 + ref.bsDay)
  if (entry === undefined) {
    const line = `[FAIL] ${ref.bsYear}-${String(ref.bsMonth).padStart(2,'0')}-${String(ref.bsDay).padStart(2,'0')}  entry missing in JSON`
    console.log(line)
    reportLines.push(line)
    failed++
    continue
  }

  const tithiOk = entry.t === ref.tithi
  const nakshatraOk = ref.nakshatra === undefined || entry.n === ref.nakshatra

  const tithiStr = tithiOk
    ? `tithi=${entry.t} ✓`
    : `tithi=${entry.t} ✗ (expected ${ref.tithi})`

  const nakshatraStr = ref.nakshatra === undefined
    ? `nakshatra=${entry.n} (not checked)`
    : nakshatraOk
      ? `nakshatra=${entry.n} ✓`
      : `nakshatra=${entry.n} ✗ (expected ${ref.nakshatra})`

  const ok = tithiOk && nakshatraOk
  const status = ok ? '[PASS]' : '[FAIL]'
  const dateStr = `${ref.bsYear}-${String(ref.bsMonth).padStart(2,'0')}-${String(ref.bsDay).padStart(2,'0')}`
  const line = `${status} ${dateStr}  ${tithiStr}  ${nakshatraStr}  — ${ref.label}`

  console.log(line)
  reportLines.push(line)

  if (ok) passed++
  else failed++
}

// ── Summary ──────────────────────────────────────────────────────────────────
const summary = `\nSummary: ${passed} passed, ${failed} failed out of ${REFERENCE_DATES.length} reference dates`
console.log(summary)
reportLines.push(summary)

// ── Write report file ────────────────────────────────────────────────────────
const reportPath = path.join(ROOT, 'validation-report.txt')
const reportContent = [
  `Panchang Validation Report — ${new Date().toISOString()}`,
  '='.repeat(60),
  '',
  ...reportLines,
  '',
]
fs.writeFileSync(reportPath, reportContent.join('\n'), 'utf8')
console.log(`\nReport written to: ${reportPath}`)

if (failed > 0) {
  console.error('\n✗ Validation failed — do not commit panchang data until all references pass.')
  process.exit(1)
} else {
  console.log('\n✓ All reference dates passed.')
}
