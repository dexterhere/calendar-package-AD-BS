/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  @meroevent/nepali-calendar-engine — Accuracy Comparison Engine
 *  Developed and Led by: Prince Bhagat — Call sign "Buggy Buck" 🦌
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 *  Compares our calendar data against established reference calendars
 *  (Hamro Patro, Drik Panchang, Nepal Rashtriya Panchang).
 *
 *  Test Categories:
 *    1. BS ↔ AD Date Conversion Accuracy
 *    2. Tithi Data Accuracy (per-day verification)
 *    3. Special Dates (Purnima, Amavasya, Ekadashi)
 *    4. Festival Date Accuracy
 *    5. Nakshatra Spot-Check
 */

import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import { toAD, toBS } from '../src/converter/index.js'
import { getPanchang, ensurePanchangYear, preloadAllPanchang } from '../src/panchang/panchang-lookup.js'
import { getEventsForDate } from '../src/events/event-engine.js'
import { getMonthDayCount } from '../src/data/bs-month-lengths.js'
import type { BSDate } from '../src/converter/types.js'

// ─── Types ───────────────────────────────────────────────────────────────────

interface TestResult {
  category: string
  testName: string
  status: 'PASS' | 'FAIL' | 'WARN'
  expected: string
  actual: string
  details?: string
}

interface CategorySummary {
  category: string
  total: number
  passed: number
  failed: number
  warned: number
  accuracy: number
}

interface ComparisonReport {
  timestamp: string
  engineVersion: string
  developer: string
  callsign: string
  bsYear: number
  results: TestResult[]
  categorySummaries: CategorySummary[]
  overallAccuracy: number
  bangOnItems: string[]
  needsEnhancement: string[]
}

// ─── Reference Data Loading ──────────────────────────────────────────────────

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function loadReferenceData(): any {
  const refPath = path.join(__dirname, '..', 'tests', 'reference-data', 'hamropatro-2082.json')
  const raw = fs.readFileSync(refPath, 'utf-8')
  return JSON.parse(raw)
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function bsStr(bs: BSDate): string {
  return `${bs.year}/${bs.month}/${bs.day}`
}

// ─── Category 1: BS ↔ AD Conversion ─────────────────────────────────────────

function testDateConversions(ref: any): TestResult[] {
  const results: TestResult[] = []
  const category = '1. BS↔AD Conversion'

  // Test known date mappings from reference
  for (const entry of ref.dateConversions.entries) {
    const bs: BSDate = { year: entry.bsYear, month: entry.bsMonth, day: entry.bsDay }
    const expectedAD = entry.adDate

    try {
      const adResult = toAD(bs)
      const actualAD = formatDate(adResult)

      results.push({
        category,
        testName: `BS ${bsStr(bs)} → AD (${entry.note})`,
        status: actualAD === expectedAD ? 'PASS' : 'FAIL',
        expected: expectedAD,
        actual: actualAD,
        details: actualAD !== expectedAD
          ? `Off by ${Math.abs(adResult.getTime() - new Date(expectedAD).getTime()) / 86400000} day(s)`
          : undefined,
      })
    } catch (err: any) {
      results.push({
        category,
        testName: `BS ${bsStr(bs)} → AD (${entry.note})`,
        status: 'FAIL',
        expected: expectedAD,
        actual: `ERROR: ${err.message}`,
      })
    }
  }

  // Round-trip test: BS → AD → BS for all days of BS 2082
  let roundTripPass = 0
  let roundTripFail = 0
  const roundTripErrors: string[] = []

  for (let month = 1; month <= 12; month++) {
    let daysInMonth = 30
    try { daysInMonth = getMonthDayCount(2082, month) } catch { /* fallback */ }

    for (let day = 1; day <= daysInMonth; day++) {
      const bs: BSDate = { year: 2082, month, day }
      try {
        const ad = toAD(bs)
        const bsBack = toBS(ad)

        if (bsBack.year === bs.year && bsBack.month === bs.month && bsBack.day === bs.day) {
          roundTripPass++
        } else {
          roundTripFail++
          roundTripErrors.push(
            `BS ${bsStr(bs)} → AD ${formatDate(ad)} → BS ${bsStr(bsBack)}`
          )
        }
      } catch (err: any) {
        roundTripFail++
        roundTripErrors.push(`BS ${bsStr(bs)}: ${err.message}`)
      }
    }
  }

  const totalRoundTrip = roundTripPass + roundTripFail
  results.push({
    category,
    testName: `Round-trip consistency (${totalRoundTrip} days)`,
    status: roundTripFail === 0 ? 'PASS' : 'FAIL',
    expected: `${totalRoundTrip}/${totalRoundTrip} round-trips match`,
    actual: `${roundTripPass}/${totalRoundTrip} round-trips match`,
    details: roundTripErrors.length > 0
      ? `Errors:\n${roundTripErrors.slice(0, 10).join('\n')}${roundTripErrors.length > 10 ? `\n... and ${roundTripErrors.length - 10} more` : ''}`
      : undefined,
  })

  return results
}

// ─── Category 2: Tithi Data Accuracy ─────────────────────────────────────────

function testTithiAccuracy(ref: any): TestResult[] {
  const results: TestResult[] = []
  const category = '2. Tithi Accuracy'

  // Test specific tithi samples from reference data
  for (const entry of ref.tithiSampleData.entries) {
    const bs: BSDate = { year: 2082, month: entry.bsMonth, day: entry.bsDay }
    const panchang = getPanchang(bs)

    if (!panchang) {
      results.push({
        category,
        testName: `Tithi at BS ${bsStr(bs)} (${entry.note})`,
        status: 'FAIL',
        expected: `Tithi ${entry.tithiNumber}, ${entry.pakshaExpected}`,
        actual: 'No panchang data available',
      })
      continue
    }

    const tithiMatch = panchang.tithi.number === entry.tithiNumber
    const pakshaMatch = panchang.paksha === entry.pakshaExpected

    results.push({
      category,
      testName: `Tithi at BS ${bsStr(bs)} (${entry.note})`,
      status: tithiMatch && pakshaMatch ? 'PASS' : (tithiMatch || pakshaMatch ? 'WARN' : 'FAIL'),
      expected: `Tithi ${entry.tithiNumber}, ${entry.pakshaExpected}`,
      actual: `Tithi ${panchang.tithi.number}, ${panchang.paksha}`,
      details: !tithiMatch
        ? `Tithi off by ${Math.abs(panchang.tithi.number - entry.tithiNumber)}`
        : undefined,
    })
  }

  // Full year tithi continuity check
  let continuityErrors = 0
  let totalDays = 0

  for (let month = 1; month <= 12; month++) {
    let daysInMonth = 30
    try { daysInMonth = getMonthDayCount(2082, month) } catch { /* fallback */ }

    for (let day = 1; day <= daysInMonth; day++) {
      totalDays++
      const bs: BSDate = { year: 2082, month, day }
      const panchang = getPanchang(bs)

      if (!panchang) {
        continuityErrors++
        continue
      }

      // Tithi should be 1-30
      if (panchang.tithi.number < 1 || panchang.tithi.number > 30) {
        continuityErrors++
      }

      // Paksha should match tithi range
      if (panchang.tithi.number <= 15 && panchang.paksha !== 'shukla') {
        continuityErrors++
      }
      if (panchang.tithi.number > 15 && panchang.paksha !== 'krishna') {
        continuityErrors++
      }
    }
  }

  results.push({
    category,
    testName: `Tithi data coverage (${totalDays} days)`,
    status: continuityErrors === 0 ? 'PASS' : 'WARN',
    expected: `${totalDays} days with valid tithi data`,
    actual: `${totalDays - continuityErrors}/${totalDays} days valid`,
    details: continuityErrors > 0 ? `${continuityErrors} continuity errors found` : undefined,
  })

  return results
}

// ─── Category 3: Special Dates ───────────────────────────────────────────────

function testSpecialDates(ref: any): TestResult[] {
  const results: TestResult[] = []
  const category = '3. Special Dates'

  // Test Purnima dates
  for (const entry of ref.specialDates.purnima) {
    const bs: BSDate = { year: 2082, month: entry.bsMonth, day: entry.bsDay }
    const panchang = getPanchang(bs)

    results.push({
      category,
      testName: `Purnima — BS ${bsStr(bs)} (${entry.note})`,
      status: panchang && panchang.tithi.number === 15 ? 'PASS' : 'FAIL',
      expected: `Tithi 15 (Purnima), Shukla Paksha`,
      actual: panchang
        ? `Tithi ${panchang.tithi.number} (${panchang.tithi.name}), ${panchang.paksha}`
        : 'No data',
    })
  }

  // Test Amavasya dates
  for (const entry of ref.specialDates.amavasya) {
    const bs: BSDate = { year: 2082, month: entry.bsMonth, day: entry.bsDay }
    const panchang = getPanchang(bs)

    results.push({
      category,
      testName: `Amavasya — BS ${bsStr(bs)} (${entry.note})`,
      status: panchang && panchang.tithi.number === 30 ? 'PASS' : 'FAIL',
      expected: `Tithi 30 (Amavasya), Krishna Paksha`,
      actual: panchang
        ? `Tithi ${panchang.tithi.number} (${panchang.tithi.name}), ${panchang.paksha}`
        : 'No data',
    })
  }

  // Test Ekadashi dates (scan each month for tithi 11 Shukla and tithi 26 Krishna)
  let ekadashiFound = 0
  let ekadashiExpected = 0

  for (let month = 1; month <= 12; month++) {
    ekadashiExpected += 2 // One Shukla and one Krishna per month

    let daysInMonth = 30
    try { daysInMonth = getMonthDayCount(2082, month) } catch { /* fallback */ }

    let foundShukla = false
    let foundKrishna = false

    for (let day = 1; day <= daysInMonth; day++) {
      const panchang = getPanchang({ year: 2082, month, day })
      if (!panchang) continue

      if (panchang.tithi.number === 11 && panchang.paksha === 'shukla') foundShukla = true
      if (panchang.tithi.number === 26 && panchang.paksha === 'krishna') foundKrishna = true
    }

    if (foundShukla) ekadashiFound++
    if (foundKrishna) ekadashiFound++
  }

  results.push({
    category,
    testName: `Ekadashi detection (24 expected across 12 months)`,
    status: ekadashiFound >= 22 ? 'PASS' : (ekadashiFound >= 18 ? 'WARN' : 'FAIL'),
    expected: `${ekadashiExpected} Ekadashi dates found`,
    actual: `${ekadashiFound} Ekadashi dates found`,
  })

  return results
}

// ─── Category 4: Festival Accuracy ───────────────────────────────────────────

function testFestivalAccuracy(ref: any): TestResult[] {
  const results: TestResult[] = []
  const category = '4. Festival Accuracy'

  for (const entry of ref.festivals.entries) {
    const bs: BSDate = { year: 2082, month: entry.bsMonth, day: entry.bsDay }

    // Check if our engine returns this festival on this date
    const events = getEventsForDate(bs)
    const matchedEvent = events.find((e: any) => e.id === entry.id)

    // Also check tithi if expected
    let tithiStatus = ''
    if (entry.tithiExpected) {
      const panchang = getPanchang(bs)
      if (panchang) {
        const tithiMatch = panchang.tithi.number === entry.tithiExpected
        const pakshaMatch = entry.pakshaExpected ? panchang.paksha === entry.pakshaExpected : true
        tithiStatus = tithiMatch && pakshaMatch
          ? ' (tithi ✓)'
          : ` (tithi: expected ${entry.tithiExpected} ${entry.pakshaExpected || ''}, got ${panchang.tithi.number} ${panchang.paksha})`
      } else {
        tithiStatus = ' (no panchang data)'
      }
    }

    results.push({
      category,
      testName: `${entry.name} — BS ${bsStr(bs)}`,
      status: matchedEvent ? 'PASS' : 'FAIL',
      expected: `Event "${entry.id}" found on ${bsStr(bs)}`,
      actual: matchedEvent
        ? `Found: "${matchedEvent.name.en}"${tithiStatus}`
        : `NOT FOUND. Events on this date: [${events.map((e: any) => e.id).join(', ')}]`,
      details: entry.source ? `Source: ${entry.source}` : undefined,
    })
  }

  return results
}

// ─── Category 5: Nakshatra Spot-Check ────────────────────────────────────────

function testNakshatraData(): TestResult[] {
  const results: TestResult[] = []
  const category = '5. Nakshatra Data'

  // Check nakshatra data availability across the year
  let withNakshatra = 0
  let withoutNakshatra = 0
  let totalDays = 0

  for (let month = 1; month <= 12; month++) {
    let daysInMonth = 30
    try { daysInMonth = getMonthDayCount(2082, month) } catch { /* fallback */ }

    for (let day = 1; day <= daysInMonth; day++) {
      totalDays++
      const panchang = getPanchang({ year: 2082, month, day })

      if (!panchang) continue

      if (panchang.nakshatra) {
        withNakshatra++
      } else {
        withoutNakshatra++
      }
    }
  }

  results.push({
    category,
    testName: `Nakshatra data coverage`,
    status: withNakshatra > totalDays * 0.9 ? 'PASS' : (withNakshatra > totalDays * 0.5 ? 'WARN' : 'FAIL'),
    expected: `>90% days with nakshatra data`,
    actual: `${withNakshatra}/${totalDays} days (${((withNakshatra / totalDays) * 100).toFixed(1)}%)`,
  })

  // Verify nakshatra values are in valid range (1-27)
  let invalidNakshatra = 0
  for (let month = 1; month <= 12; month++) {
    let daysInMonth = 30
    try { daysInMonth = getMonthDayCount(2082, month) } catch { /* fallback */ }

    for (let day = 1; day <= daysInMonth; day++) {
      const panchang = getPanchang({ year: 2082, month, day })
      if (!panchang || !panchang.nakshatra) continue

      // Check if nakshatra name is non-empty
      if (!panchang.nakshatra.name || !panchang.nakshatra.nameNe) {
        invalidNakshatra++
      }
    }
  }

  results.push({
    category,
    testName: `Nakshatra value validity`,
    status: invalidNakshatra === 0 ? 'PASS' : 'WARN',
    expected: `All nakshatra entries have valid names`,
    actual: invalidNakshatra === 0
      ? `All ${withNakshatra} entries valid`
      : `${invalidNakshatra} invalid entries`,
  })

  return results
}

// ─── Report Generator ────────────────────────────────────────────────────────

function generateReport(report: ComparisonReport): string {
  const lines: string[] = []

  lines.push('# 📊 Calendar Accuracy Report — BS 2082')
  lines.push('')
  lines.push('> **Developed and Led by: Prince Bhagat — Call sign "Buggy Buck" 🦌**')
  lines.push('>')
  lines.push(`> **Package:** \`@meroevent/nepali-calendar-engine\` v${report.engineVersion}`)
  lines.push(`> **Generated:** ${report.timestamp}`)
  lines.push(`> **Reference:** Hamro Patro, Drik Panchang, Nepal Rashtriya Panchang`)
  lines.push('')
  lines.push('---')
  lines.push('')

  // Overall dashboard
  const overallEmoji = report.overallAccuracy >= 98 ? '🟢' : report.overallAccuracy >= 95 ? '🟡' : '🔴'
  lines.push('## 🎯 Overall Accuracy Dashboard')
  lines.push('')
  lines.push(`| Metric | Score |`)
  lines.push(`|--------|-------|`)
  lines.push(`| **Overall Accuracy** | ${overallEmoji} **${report.overallAccuracy.toFixed(1)}%** |`)

  for (const summary of report.categorySummaries) {
    const emoji = summary.accuracy >= 98 ? '🟢' : summary.accuracy >= 95 ? '🟡' : '🔴'
    lines.push(`| ${summary.category} | ${emoji} ${summary.accuracy.toFixed(1)}% (${summary.passed}/${summary.total}) |`)
  }
  lines.push('')

  // Category breakdowns
  for (const summary of report.categorySummaries) {
    lines.push(`## ${summary.category}`)
    lines.push('')
    lines.push(`| Test | Status | Expected | Actual |`)
    lines.push(`|------|--------|----------|--------|`)

    const catResults = report.results.filter(r => r.category === summary.category)
    for (const r of catResults) {
      const statusIcon = r.status === 'PASS' ? '✅' : r.status === 'WARN' ? '⚠️' : '❌'
      lines.push(`| ${r.testName} | ${statusIcon} ${r.status} | ${r.expected} | ${r.actual} |`)
    }
    lines.push('')
  }

  // Bang-on items
  lines.push('## 🎯 Bang-On Matches (Perfect Accuracy)')
  lines.push('')
  if (report.bangOnItems.length > 0) {
    for (const item of report.bangOnItems) {
      lines.push(`- ✅ ${item}`)
    }
  } else {
    lines.push('_No perfect matches found_')
  }
  lines.push('')

  // Needs enhancement
  lines.push('## 🔧 Needs Enhancement')
  lines.push('')
  if (report.needsEnhancement.length > 0) {
    for (const item of report.needsEnhancement) {
      lines.push(`- ❌ ${item}`)
    }
  } else {
    lines.push('_All tests passing — no enhancements needed!_')
  }
  lines.push('')

  // Detailed failures
  const failures = report.results.filter(r => r.status === 'FAIL')
  if (failures.length > 0) {
    lines.push('## 📋 Detailed Failure Analysis')
    lines.push('')
    for (const f of failures) {
      lines.push(`### ❌ ${f.testName}`)
      lines.push(`- **Category:** ${f.category}`)
      lines.push(`- **Expected:** ${f.expected}`)
      lines.push(`- **Actual:** ${f.actual}`)
      if (f.details) {
        lines.push(`- **Details:** ${f.details}`)
      }
      lines.push('')
    }
  }

  // Recommendations
  lines.push('## 💡 Recommendations')
  lines.push('')
  
  const hasConversionIssues = report.results.some(r => r.category.includes('Conversion') && r.status === 'FAIL')
  const hasTithiIssues = report.results.some(r => r.category.includes('Tithi') && r.status === 'FAIL')
  const hasFestivalIssues = report.results.some(r => r.category.includes('Festival') && r.status === 'FAIL')

  if (hasConversionIssues) {
    lines.push('1. **BS↔AD Conversion:** Review the `bs-month-lengths.ts` lookup table for year 2082. Cross-reference with Nepal Rashtriya Panchang.')
  }
  if (hasTithiIssues) {
    lines.push('2. **Tithi Data:** Re-generate panchang data for BS 2082 using verified astronomical calculations. Consider sourcing from Nepal Rashtriya Panchang directly.')
  }
  if (hasFestivalIssues) {
    lines.push('3. **Festival Dates:** Review festival resolution logic in `event-engine.ts`. Some tithi-based festivals may require multi-month search or adjusted tithi matching.')
  }
  if (!hasConversionIssues && !hasTithiIssues && !hasFestivalIssues) {
    lines.push('All core data is accurate! Consider:')
    lines.push('1. Extending panchang data to more years (2083-2090) with verified sources')
    lines.push('2. Adding government holidays for years beyond 2082')
    lines.push('3. Cross-referencing with additional panchang sources for redundancy')
  }
  lines.push('')

  lines.push('---')
  lines.push('')
  lines.push('*Report generated by `@meroevent/nepali-calendar-engine` accuracy comparison engine*')
  lines.push('*Developed and Led by Prince Bhagat — Call sign "Buggy Buck" 🦌*')

  return lines.join('\n')
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('═══════════════════════════════════════════════════════════════════')
  console.log('  📅 NEPALI CALENDAR ENGINE — ACCURACY COMPARISON ENGINE')
  console.log('  Developed & Led by: Prince Bhagat — Call sign "Buggy Buck" 🦌')
  console.log('═══════════════════════════════════════════════════════════════════')
  console.log('')

  // Load reference data
  console.log('📦 Loading reference data...')
  const refData = loadReferenceData()
  console.log(`   ✓ Loaded reference for BS ${refData._metadata.bsYear}`)

  // Pre-load panchang data
  console.log('🔮 Pre-loading panchang data...')
  await preloadAllPanchang()
  console.log('   ✓ All panchang years loaded')
  console.log('')

  // Run all test categories
  console.log('🧪 Running accuracy tests...')
  console.log('')

  const allResults: TestResult[] = []

  // Category 1
  console.log('  [1/5] BS↔AD Date Conversion...')
  const conversionResults = testDateConversions(refData)
  allResults.push(...conversionResults)
  const convPass = conversionResults.filter(r => r.status === 'PASS').length
  console.log(`        ${convPass}/${conversionResults.length} passed`)

  // Category 2
  console.log('  [2/5] Tithi Data Accuracy...')
  const tithiResults = testTithiAccuracy(refData)
  allResults.push(...tithiResults)
  const tithiPass = tithiResults.filter(r => r.status === 'PASS').length
  console.log(`        ${tithiPass}/${tithiResults.length} passed`)

  // Category 3
  console.log('  [3/5] Special Dates (Purnima/Amavasya/Ekadashi)...')
  const specialResults = testSpecialDates(refData)
  allResults.push(...specialResults)
  const specialPass = specialResults.filter(r => r.status === 'PASS').length
  console.log(`        ${specialPass}/${specialResults.length} passed`)

  // Category 4
  console.log('  [4/5] Festival Date Accuracy...')
  const festivalResults = testFestivalAccuracy(refData)
  allResults.push(...festivalResults)
  const festivalPass = festivalResults.filter(r => r.status === 'PASS').length
  console.log(`        ${festivalPass}/${festivalResults.length} passed`)

  // Category 5
  console.log('  [5/5] Nakshatra Data...')
  const nakshatraResults = testNakshatraData()
  allResults.push(...nakshatraResults)
  const nakshatraPass = nakshatraResults.filter(r => r.status === 'PASS').length
  console.log(`        ${nakshatraPass}/${nakshatraResults.length} passed`)

  console.log('')

  // Compute category summaries
  const categories = [...new Set(allResults.map(r => r.category))]
  const categorySummaries: CategorySummary[] = categories.map(cat => {
    const catResults = allResults.filter(r => r.category === cat)
    const passed = catResults.filter(r => r.status === 'PASS').length
    const warned = catResults.filter(r => r.status === 'WARN').length
    return {
      category: cat,
      total: catResults.length,
      passed,
      failed: catResults.filter(r => r.status === 'FAIL').length,
      warned,
      accuracy: (passed / catResults.length) * 100,
    }
  })

  // Overall accuracy
  const totalTests = allResults.length
  const totalPassed = allResults.filter(r => r.status === 'PASS').length
  const overallAccuracy = (totalPassed / totalTests) * 100

  // Bang-on and needs-enhancement
  const bangOnItems = categorySummaries
    .filter(s => s.accuracy === 100)
    .map(s => `${s.category}: ${s.passed}/${s.total} tests`)

  const needsEnhancement = allResults
    .filter(r => r.status === 'FAIL')
    .map(r => `${r.testName}: Expected ${r.expected}, Got ${r.actual}`)

  // Build report
  const report: ComparisonReport = {
    timestamp: new Date().toISOString(),
    engineVersion: '0.1.0',
    developer: 'Prince Bhagat',
    callsign: 'Buggy Buck',
    bsYear: 2082,
    results: allResults,
    categorySummaries,
    overallAccuracy,
    bangOnItems,
    needsEnhancement,
  }

  // Print summary to console
  console.log('═══════════════════════════════════════════════════════════════════')
  console.log('  📊 ACCURACY SUMMARY')
  console.log('═══════════════════════════════════════════════════════════════════')
  console.log('')

  const overallEmoji = overallAccuracy >= 98 ? '🟢' : overallAccuracy >= 95 ? '🟡' : '🔴'
  console.log(`  ${overallEmoji} Overall Accuracy:  ${overallAccuracy.toFixed(1)}%  (${totalPassed}/${totalTests} tests)`)
  console.log('')

  for (const summary of categorySummaries) {
    const emoji = summary.accuracy >= 98 ? '🟢' : summary.accuracy >= 95 ? '🟡' : '🔴'
    console.log(`  ${emoji} ${summary.category.padEnd(35)} ${summary.accuracy.toFixed(1).padStart(6)}%  (${summary.passed}/${summary.total})`)
  }

  console.log('')

  // Print failures
  const failures = allResults.filter(r => r.status === 'FAIL')
  if (failures.length > 0) {
    console.log('  ❌ FAILURES:')
    for (const f of failures) {
      console.log(`     • ${f.testName}`)
      console.log(`       Expected: ${f.expected}`)
      console.log(`       Actual:   ${f.actual}`)
      if (f.details) console.log(`       Details:  ${f.details}`)
    }
    console.log('')
  }

  // Generate markdown report
  const markdown = generateReport(report)
  const reportsDir = path.join(__dirname, '..', 'reports')
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true })
  }
  const reportPath = path.join(reportsDir, 'accuracy-report-2082.md')
  fs.writeFileSync(reportPath, markdown, 'utf-8')

  console.log(`  📝 Full report saved to: reports/accuracy-report-2082.md`)
  console.log('')
  console.log('═══════════════════════════════════════════════════════════════════')
  console.log('  🦌 Accuracy comparison complete — Buggy Buck out!')
  console.log('═══════════════════════════════════════════════════════════════════')
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
