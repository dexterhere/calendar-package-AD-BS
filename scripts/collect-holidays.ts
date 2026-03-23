/**
 * scripts/collect-holidays.ts
 *
 * Template generator for public holiday data files.
 *
 * This script prints a ready-to-fill TypeScript file for a given BS year.
 * Copy the output into src/data/public-holidays/<year>.ts, then fill in
 * the actual holiday list from Nepal government gazette publications.
 *
 * Sources for holiday data:
 *   - Nepal DHM / MoFAGA gazette: https://www.dhm.gov.np
 *   - Nepal government gazette:   https://nepalgazette.gov.np
 *   - Hamro Patro (spot-check):   https://www.hamropatro.com
 *
 * Usage:
 *   pnpm collect:holidays              → prints template for current BS year
 *   pnpm collect:holidays -- --year 2084
 *   pnpm collect:holidays -- --year 2084 --write   → writes file directly
 *
 * After generating, update event-engine.ts → getPublicHolidaysForYear()
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// ── Arg parsing ───────────────────────────────────────────────────────────────
const argv = process.argv.slice(2)
function arg(flag: string, fallback: string): string {
  const i = argv.indexOf(flag)
  return i !== -1 && argv[i + 1] !== undefined ? (argv[i + 1] as string) : fallback
}
const WRITE_FILE = argv.includes('--write')

// Default to current BS year (approximate: AD year + 56 or 57)
const approxBsYear = new Date().getFullYear() + 56
const YEAR = parseInt(arg('--year', String(approxBsYear)), 10)

// ── Template ──────────────────────────────────────────────────────────────────
//
// Government-declared holidays that do NOT appear in BASE_FESTIVALS.
// For example, dates where government offices are closed via special gazette notice.
// Festivals already in BASE_FESTIVALS (Dashain, Tihar, etc.) do NOT need to be
// repeated here — they are already resolved by the event engine.
//
const TEMPLATE = `/**
 * Government-declared public holidays for BS ${YEAR}
 *
 * Sources:
 *   - Nepal DHM Rashtriya Panchanga ${YEAR}
 *   - Nepal Government Gazette
 *
 * NOTE: Do NOT duplicate festivals already in src/data/festivals.ts
 *       (Dashain, Tihar, Shivaratri, etc. are handled automatically by the event engine).
 *       Only add dates explicitly declared by government gazette that are NOT
 *       already in the festival definitions.
 *
 * TODO: Fill in actual dates from the ${YEAR} gazette publication.
 */

import type { CalendarEvent } from '../events/types.js'

export const PUBLIC_HOLIDAYS_${YEAR}: readonly CalendarEvent[] = [
  // ── National holidays with fixed BS dates ──────────────────────────────────
  {
    id: '${YEAR}-new-year',
    name: { en: 'Nepali New Year (BS ${YEAR})', ne: 'नयाँ वर्ष ${YEAR}' },
    type: 'public_holiday',
    category: 'national',
    description: { en: 'First day of BS ${YEAR}', ne: '${YEAR} को पहिलो दिन' },
    isPublicHoliday: true,
  },
  // Add more holidays below.
  // Each entry needs: id, name { en, ne }, type, category, isPublicHoliday
  // Optionally: description { en, ne }
  //
  // Example:
  // {
  //   id: '${YEAR}-example-holiday',
  //   name: { en: 'Example Holiday', ne: 'उदाहरण बिदा' },
  //   type: 'public_holiday',
  //   category: 'national',
  //   isPublicHoliday: true,
  // },
]
`

// ── Output ───────────────────────────────────────────────────────────────────
const ROOT = path.resolve(fileURLToPath(import.meta.url), '../..')
const OUT_PATH = path.join(ROOT, 'src/data/public-holidays', `${YEAR}.ts`)

if (WRITE_FILE) {
  if (fs.existsSync(OUT_PATH)) {
    console.error(`✗ File already exists: ${OUT_PATH}`)
    console.error('  Delete it first or edit it directly.')
    process.exit(1)
  }
  fs.writeFileSync(OUT_PATH, TEMPLATE, 'utf8')
  console.log(`✓ Created: ${OUT_PATH}`)
  console.log('\nNext steps:')
  console.log(`  1. Fill in actual holidays from the BS ${YEAR} government gazette`)
  console.log(`  2. Update getPublicHolidaysForYear() in src/events/event-engine.ts`)
  console.log(`  3. Run: pnpm test`)
} else {
  console.log(`\n${'─'.repeat(60)}`)
  console.log(`Template for: src/data/public-holidays/${YEAR}.ts`)
  console.log(`${'─'.repeat(60)}\n`)
  console.log(TEMPLATE)
  console.log(`\nTo write this file directly, run:`)
  console.log(`  pnpm collect:holidays -- --year ${YEAR} --write`)
}

// ── Reminder: update event-engine ────────────────────────────────────────────
console.log('\n⚠ Remember to update getPublicHolidaysForYear() in src/events/event-engine.ts')
console.log('  to import and return the new year\'s holidays.')
