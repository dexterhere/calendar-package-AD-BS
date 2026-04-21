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
import {
  buildUnifiedReport,
  writeJsonArtifact,
  type ValidationCheckResult,
} from './validation/report-contract.js'

// ── Types ────────────────────────────────────────────────────────────────────
interface PanchangEntry {
  m: number
  d: number
  t: number
  n?: number
  y?: number
  k?: number
  tt?: 'k' | 'v'
}

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
const VALIDATION_REPORT_DIR = path.join(ROOT, 'validation', 'reports')
const MACHINE_REPORT_RELATIVE_PATH = path.join('validation', 'reports', 'validate-panchang-report.json')
const MACHINE_REPORT_PATH = path.join(VALIDATION_REPORT_DIR, 'validate-panchang-report.json')

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

function bsDateString(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

// ── Run validation ───────────────────────────────────────────────────────────
console.log('\nValidating panchang data against reference dates...\n')

let passed = 0
let failed = 0
const reportLines: string[] = []
const checks: ValidationCheckResult[] = []

// Cache loaded years to avoid re-reading files
const yearCache = new Map<number, Map<number, PanchangEntry> | null>()

for (const ref of REFERENCE_DATES) {
  if (!yearCache.has(ref.bsYear)) {
    yearCache.set(ref.bsYear, loadYear(ref.bsYear))
  }
  const index = yearCache.get(ref.bsYear)

  if (index === null || index === undefined) {
    const dateStr = bsDateString(ref.bsYear, ref.bsMonth, ref.bsDay)
    const line = `[SKIP] ${dateStr}  file not found — run generate:panchang first`
    console.log(line)
    reportLines.push(line)
    checks.push({
      id: `${dateStr}-reference-check`,
      category: 'reference-date',
      label: ref.label,
      status: 'fail',
      expected: 'Generated panchang year file and reference entry exist',
      actual: 'Panchang year file missing',
      details: ref.source,
      metadata: {
        bsDate: dateStr,
        expectedTithi: ref.tithi,
        expectedNakshatra: ref.nakshatra ?? null,
      },
    })
    failed++
    continue
  }

  const entry = index.get(ref.bsMonth * 100 + ref.bsDay)
  if (entry === undefined) {
    const dateStr = bsDateString(ref.bsYear, ref.bsMonth, ref.bsDay)
    const line = `[FAIL] ${dateStr}  entry missing in JSON`
    console.log(line)
    reportLines.push(line)
    checks.push({
      id: `${dateStr}-reference-check`,
      category: 'reference-date',
      label: ref.label,
      status: 'fail',
      expected: 'Reference date entry exists in generated panchang JSON',
      actual: 'Entry missing in generated panchang JSON',
      details: ref.source,
      metadata: {
        bsDate: dateStr,
        expectedTithi: ref.tithi,
        expectedNakshatra: ref.nakshatra ?? null,
      },
    })
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
  const dateStr = bsDateString(ref.bsYear, ref.bsMonth, ref.bsDay)
  const line = `${status} ${dateStr}  ${tithiStr}  ${nakshatraStr}  — ${ref.label}`

  console.log(line)
  reportLines.push(line)
  checks.push({
    id: `${dateStr}-reference-check`,
    category: 'reference-date',
    label: ref.label,
    status: ok ? 'pass' : 'fail',
    expected: ref.nakshatra === undefined
      ? `tithi=${ref.tithi}`
      : `tithi=${ref.tithi}, nakshatra=${ref.nakshatra}`,
    actual: ref.nakshatra === undefined
      ? `tithi=${entry.t}`
      : `tithi=${entry.t}, nakshatra=${entry.n ?? 'missing'}`,
    details: ref.source,
    metadata: {
      bsDate: dateStr,
      expectedTithi: ref.tithi,
      actualTithi: entry.t,
      expectedNakshatra: ref.nakshatra ?? null,
      actualNakshatra: entry.n ?? null,
    },
  })

  if (ok) passed++
  else failed++
}

// ── Summary ──────────────────────────────────────────────────────────────────
const summary = `\nSummary: ${passed} passed, ${failed} failed out of ${REFERENCE_DATES.length} reference dates`
console.log(summary)
reportLines.push(summary)
const generatedAt = new Date().toISOString()

// ── Write report file ────────────────────────────────────────────────────────
const reportPath = path.join(ROOT, 'validation-report.txt')
const reportContent = [
  `Panchang Validation Report — ${generatedAt}`,
  '='.repeat(60),
  '',
  ...reportLines,
  '',
]
fs.writeFileSync(reportPath, reportContent.join('\n'), 'utf8')
console.log(`\nReport written to: ${reportPath}`)

const machineReport = buildUnifiedReport({
  source: 'validate-panchang',
  script: 'scripts/validate-panchang.ts',
  command: 'pnpm run validate:panchang',
  generatedAt,
  artifactPath: MACHINE_REPORT_RELATIVE_PATH,
  checks,
  metadata: {
    referenceCount: REFERENCE_DATES.length,
    textReportPath: 'validation-report.txt',
  },
})

writeJsonArtifact(MACHINE_REPORT_PATH, machineReport)
console.log(`Machine report written to: ${MACHINE_REPORT_PATH}`)

if (failed > 0) {
  console.error('\n✗ Validation failed — do not commit panchang data until all references pass.')
  process.exit(1)
} else {
  console.log('\n✓ All reference dates passed.')
}
