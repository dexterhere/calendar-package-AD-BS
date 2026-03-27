/**
 * scripts/validation/cross-validate.ts
 *
 * Step 6 — 3-Way Cross-Validation Script.
 *
 * Runs three independent astronomical engines for every day in a BS year range
 * and compares their tithi results:
 *
 *   Engine 1 (astronomy-engine):  computePanchang() — queries at precise sunrise NST
 *   Engine 2 (NASA JPL Horizons): getHorizonsPositions() — queries at 00:00 UTC = 05:45 NST
 *   Engine 3 (astronomia):        getAstronomiaPositions_forDate() — queries at 00:00 UTC
 *
 * Engines 2 & 3 query at 00:00 UTC (~5 minutes after Engine 1's precise sunrise).
 * On most days all three agree. A YELLOW flag on Kshaya/Vriddhi days is expected
 * and correctly identifies tithi edge cases.
 *
 * Status classification:
 *   GREEN  — all three engines agree on tithi
 *   YELLOW — two of three agree (one outlier)
 *   RED    — no two engines agree (investigate immediately)
 *
 * Usage:
 *   # Single year (Horizons API calls included)
 *   pnpm exec tsx --tsconfig scripts/tsconfig.scripts.json \
 *     scripts/validation/cross-validate.ts --year 2082
 *
 *   # Year range, skip Horizons (fast local-only run)
 *   pnpm exec tsx --tsconfig scripts/tsconfig.scripts.json \
 *     scripts/validation/cross-validate.ts --from 2082 --to 2083 --no-horizons
 *
 *   # Custom output directory
 *   pnpm exec tsx --tsconfig scripts/tsconfig.scripts.json \
 *     scripts/validation/cross-validate.ts --year 2082 --output ./my-reports/
 */

import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { bsToAd }                              from '../../src/converter/bs-to-ad.js'
import { getMonthDayCount, BS_DATA_YEAR_MIN, BS_DATA_YEAR_MAX }
                                               from '../../src/data/bs-month-lengths.js'
import { computePanchang }                     from '../../src/astro/compute.js'
import { getHorizonsPositions }                from './horizons-fetch.js'
import { getAstronomiaPositions_forDate }      from './astronomia-compute.js'
import {
  buildUnifiedReport,
  writeJsonArtifact,
  type ValidationCheckResult,
} from './report-contract.js'

// ── Paths ─────────────────────────────────────────────────────────────────────
const ROOT        = path.resolve(fileURLToPath(import.meta.url), '../../..')
const DEFAULT_OUT = path.join(ROOT, 'validation', 'reports')

// ── Types ─────────────────────────────────────────────────────────────────────

export type ValidationStatus = 'GREEN' | 'YELLOW' | 'RED'

export interface ValidationEntry {
  /** BS date string YYYY-MM-DD */
  bsDate: string
  /** AD Gregorian date string YYYY-MM-DD */
  adDate: string
  /** Engine 1 tithi (astronomy-engine at precise sunrise) */
  t1: number
  /** Engine 2 tithi (NASA Horizons at 00:00 UTC). null if Horizons skipped. */
  t2: number | null
  /** Engine 3 tithi (astronomia at 00:00 UTC) */
  t3: number
  /** Consensus status */
  status: ValidationStatus
  /** Non-null when status is YELLOW or RED — describes which engine disagrees */
  note?: string
}

export interface ValidationReport {
  /** Primary BS year covered (first year in range for multi-year runs) */
  year: number
  /** ISO timestamp of report generation */
  generated: string
  /** Whether Horizons API was used */
  horizonsEnabled: boolean
  summary: {
    green:  number
    yellow: number
    red:    number
    total:  number
  }
  entries: ValidationEntry[]
}

// ── Status classification ─────────────────────────────────────────────────────

function classify(t1: number, t2: number | null, t3: number): { status: ValidationStatus; note?: string } {
  if (t2 === null) {
    // 2-engine comparison (no Horizons)
    if (t1 === t3) return { status: 'GREEN' }
    return {
      status: 'YELLOW',
      note:   `E1=${t1} E3=${t3} — engines disagree (Horizons skipped)`,
    }
  }

  // 3-engine comparison
  if (t1 === t2 && t2 === t3) return { status: 'GREEN' }

  const majority = (t1 === t2) ? t1 : (t1 === t3) ? t1 : (t2 === t3) ? t2 : null

  if (majority !== null) {
    const outlierEngine = t1 !== majority ? 'E1(astronomy-engine)' : t2 !== majority ? 'E2(Horizons)' : 'E3(astronomia)'
    const outlierValue  = t1 !== majority ? t1 : t2 !== majority ? t2 : t3
    return {
      status: 'YELLOW',
      note:   `${outlierEngine} disagrees: ${outlierValue} vs majority ${majority}`,
    }
  }

  return {
    status: 'RED',
    note:   `All three disagree: E1=${t1} E2=${t2} E3=${t3}`,
  }
}

// ── BS date iterator ──────────────────────────────────────────────────────────

function* iterBsYear(bsYear: number): Generator<{ bsDate: string; adDate: Date }> {
  for (let month = 1; month <= 12; month++) {
    const daysInMonth = getMonthDayCount(bsYear, month)
    for (let day = 1; day <= daysInMonth; day++) {
      const adDate  = bsToAd({ year: bsYear, month, day })
      const mm      = String(month).padStart(2, '0')
      const dd      = String(day).padStart(2, '0')
      const bsDate  = `${bsYear}-${mm}-${dd}`
      yield { bsDate, adDate }
    }
  }
}

// ── Progress display ──────────────────────────────────────────────────────────

function progressLine(
  bsDate: string,
  entry: ValidationEntry,
  current: number,
  total: number,
): string {
  const pct    = ((current / total) * 100).toFixed(1).padStart(5)
  const status = entry.status === 'GREEN'  ? '✓' :
                 entry.status === 'YELLOW' ? '⚠' : '✗'
  const t2str  = entry.t2 !== null ? String(entry.t2).padStart(2) : ' -'
  return (
    `[${pct}%] ${bsDate}  E1=${String(entry.t1).padStart(2)} E2=${t2str} E3=${String(entry.t3).padStart(2)}` +
    `  ${status} ${entry.status}` +
    (entry.note ? `  ← ${entry.note}` : '')
  )
}

function mapStatusToCheck(status: ValidationStatus): 'pass' | 'warn' | 'fail' {
  if (status === 'GREEN') return 'pass'
  if (status === 'YELLOW') return 'warn'
  return 'fail'
}

// ── Main validation function ──────────────────────────────────────────────────

export async function crossValidateYear(
  bsYear: number,
  options: { skipHorizons?: boolean; verbose?: boolean } = {},
): Promise<ValidationReport> {
  const { skipHorizons = false, verbose = true } = options

  const entries:  ValidationEntry[] = []
  let   green = 0, yellow = 0, red = 0

  // Pre-count total days for progress display
  let totalDays = 0
  for (let m = 1; m <= 12; m++) totalDays += getMonthDayCount(bsYear, m)

  let current = 0

  for (const { bsDate, adDate } of iterBsYear(bsYear)) {
    current++

    // ── Engine 1: astronomy-engine (precise sunrise) ────────────────────────
    let t1: number
    try {
      t1 = computePanchang({ adDate }).tithi
    } catch (err) {
      console.error(`  E1 ERROR ${bsDate}: ${err instanceof Error ? err.message : String(err)}`)
      continue
    }

    // ── Engine 2: NASA JPL Horizons (00:00 UTC) ─────────────────────────────
    let t2: number | null = null
    if (!skipHorizons) {
      try {
        const adDateStr = adDate.toISOString().slice(0, 10)
        const pos = await getHorizonsPositions(adDateStr)
        t2 = pos.tithi
      } catch (err) {
        console.error(`  E2 ERROR ${bsDate}: ${err instanceof Error ? err.message : String(err)}`)
        // Treat Horizons failure as missing data (not RED)
      }
    }

    // ── Engine 3: astronomia (00:00 UTC) ────────────────────────────────────
    let t3: number
    try {
      const adDateStr = adDate.toISOString().slice(0, 10)
      t3 = getAstronomiaPositions_forDate(adDateStr).tithi
    } catch (err) {
      console.error(`  E3 ERROR ${bsDate}: ${err instanceof Error ? err.message : String(err)}`)
      continue
    }

    // ── Classify ─────────────────────────────────────────────────────────────
    const { status, note } = classify(t1, t2, t3)

    if      (status === 'GREEN')  green++
    else if (status === 'YELLOW') yellow++
    else                          red++

    const entry: ValidationEntry = {
      bsDate,
      adDate: adDate.toISOString().slice(0, 10),
      t1,
      t2,
      t3,
      status,
      ...(note ? { note } : {}),
    }

    entries.push(entry)

    if (verbose) {
      const line = progressLine(bsDate, entry, current, totalDays)
      // Always print non-GREEN entries; print GREEN only every 10 days to reduce noise
      if (status !== 'GREEN' || current % 10 === 0) {
        console.log(line)
      }
    }
  }

  return {
    year:            bsYear,
    generated:       new Date().toISOString(),
    horizonsEnabled: !skipHorizons,
    summary:         { green, yellow, red, total: entries.length },
    entries,
  }
}

// ── Report writer ─────────────────────────────────────────────────────────────

function writeReport(report: ValidationReport, outputDir: string, command: string): string {
  const filename  = `validation-report-${report.year}.json`
  const filepath  = path.join(outputDir, filename)
  const relativeArtifactPath = path.relative(ROOT, filepath)

  const checks: ValidationCheckResult[] = report.entries.map(entry => ({
    id: `${entry.bsDate}-cross-validation`,
    category: 'cross-validation',
    label: `Cross-validation consensus for ${entry.bsDate}`,
    status: mapStatusToCheck(entry.status),
    expected: report.horizonsEnabled
      ? 'E1(astronomy-engine), E2(Horizons), E3(astronomia) agree on tithi'
      : 'E1(astronomy-engine) and E3(astronomia) agree on tithi',
    actual: `E1=${entry.t1}, E2=${entry.t2 ?? 'skipped'}, E3=${entry.t3}`,
    ...(entry.note ? { details: entry.note } : {}),
    metadata: {
      bsDate: entry.bsDate,
      adDate: entry.adDate,
      consensus: entry.status,
      t1: entry.t1,
      t2: entry.t2,
      t3: entry.t3,
    },
  }))

  const unified = buildUnifiedReport({
    source: 'cross-validate',
    script: 'scripts/validation/cross-validate.ts',
    command,
    generatedAt: report.generated,
    artifactPath: relativeArtifactPath,
    checks,
    metadata: {
      year: report.year,
      horizonsEnabled: report.horizonsEnabled,
    },
  })

  const payload = {
    ...unified,
    year: report.year,
    generated: report.generated,
    horizonsEnabled: report.horizonsEnabled,
    summary: report.summary,
    entries: report.entries,
  }

  writeJsonArtifact(filepath, payload)
  return filepath
}

function printSummary(report: ValidationReport): void {
  const { summary, year, horizonsEnabled } = report
  const enginesUsed = horizonsEnabled ? 'E1(astronomy-engine) + E2(Horizons) + E3(astronomia)' : 'E1(astronomy-engine) + E3(astronomia)'

  console.log('\n' + '═'.repeat(60))
  console.log(`  Cross-Validation Summary — BS ${year}`)
  console.log('═'.repeat(60))
  console.log(`  Engines : ${enginesUsed}`)
  console.log(`  Total   : ${summary.total} days`)
  console.log(`  GREEN   : ${summary.green}  (${((summary.green / summary.total) * 100).toFixed(1)}%)`)
  console.log(`  YELLOW  : ${summary.yellow}`)
  console.log(`  RED     : ${summary.red}`)
  console.log('═'.repeat(60))

  if (summary.yellow > 0) {
    console.log('\n  YELLOW entries (potential Kshaya/Vriddhi edge cases):')
    for (const e of report.entries.filter(e => e.status === 'YELLOW')) {
      console.log(`    ${e.bsDate} (AD ${e.adDate}) — ${e.note ?? ''}`)
    }
  }

  if (summary.red > 0) {
    console.log('\n  RED entries (INVESTIGATION REQUIRED):')
    for (const e of report.entries.filter(e => e.status === 'RED')) {
      console.log(`    ${e.bsDate} (AD ${e.adDate}) — ${e.note ?? ''}`)
    }
  }
}

// ── CLI entry point ───────────────────────────────────────────────────────────

const _cliArgv = process.argv.slice(2)

if (_cliArgv.includes('--year') || _cliArgv.includes('--from')) {
  const argv = _cliArgv[0] === '--' ? _cliArgv.slice(1) : _cliArgv
  const get  = (flag: string) => { const i = argv.indexOf(flag); return i !== -1 ? argv[i + 1] : undefined }

  const singleYear   = get('--year')
  const fromYear     = get('--from')
  const toYear       = get('--to')
  const outputDir    = get('--output') ?? DEFAULT_OUT
  const skipHorizons = argv.includes('--no-horizons')
  const command = argv.length > 0
    ? `pnpm run validate:cross -- ${argv.join(' ')}`
    : 'pnpm run validate:cross'

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
    console.error('  cross-validate.ts --year 2082')
    console.error('  cross-validate.ts --from 2082 --to 2083')
    console.error('  cross-validate.ts --year 2082 --no-horizons')
    console.error('  cross-validate.ts --year 2082 --output ./reports/')
    process.exit(1)
  }

  // Validate year range
  for (const y of years) {
    if (y < BS_DATA_YEAR_MIN || y > BS_DATA_YEAR_MAX) {
      console.error(`BS year ${y} out of supported range (${BS_DATA_YEAR_MIN}–${BS_DATA_YEAR_MAX})`)
      process.exit(1)
    }
  }

  console.log('\n' + '═'.repeat(60))
  console.log('  3-Way Astronomical Cross-Validation')
  console.log('═'.repeat(60))
  console.log(`  BS years     : ${years.join(', ')}`)
  console.log(`  Horizons API : ${skipHorizons ? 'DISABLED (--no-horizons)' : 'ENABLED (uses cache)'}`)
  console.log(`  Output dir   : ${outputDir}`)
  console.log('═'.repeat(60) + '\n')

  for (const bsYear of years) {
    console.log(`\n── BS ${bsYear} ─────────────────────────────────────────────\n`)

    const report   = await crossValidateYear(bsYear, { skipHorizons, verbose: true })
    const filepath = writeReport(report, outputDir, command)

    printSummary(report)
    console.log(`\n  Report written to: ${filepath}\n`)
  }
}
