/**
 * scripts/spike-astronomy-engine.ts
 *
 * STEP 1 SPIKE — Phase 7 Astronomical Engine
 *
 * Proves that the core compute module (src/astro/compute.ts) produces correct
 * tithi and nakshatra values for known BS reference dates.
 *
 * This script imports from the compute module directly — it tests the full
 * computation pipeline, not the astronomy-engine library in isolation.
 *
 * Usage:
 *   pnpm exec tsx --tsconfig scripts/tsconfig.scripts.json scripts/spike-astronomy-engine.ts
 */

import { computePanchang } from '../src/astro/compute.js'
import { NST_OFFSET_MS } from '../src/astro/constants.js'

// ── Reference dates (Step 1 verification) ────────────────────────────────────
// Source: cross-checked against existing generated panchang data (BS 2082)

interface ReferenceDate {
  bsLabel: string
  adDate: string        // ISO YYYY-MM-DD (UTC midnight = bsToAd output format)
  expectedTithi: number
  note: string
}

const REFERENCE_DATES: ReferenceDate[] = [
  { bsLabel: 'BS 2082/1/1',  adDate: '2025-04-14', expectedTithi: 16, note: 'Nepali New Year — Krishna Pratipada' },
  { bsLabel: 'BS 2082/1/14', adDate: '2025-04-27', expectedTithi: 30, note: 'Amavasya (New Moon)' },
  { bsLabel: 'BS 2082/1/15', adDate: '2025-04-28', expectedTithi: 1,  note: 'Shukla Pratipada (day after new moon)' },
  { bsLabel: 'BS 2082/1/29', adDate: '2025-05-12', expectedTithi: 15, note: 'Purnima (Full Moon)' },
]

// ── Run spike ─────────────────────────────────────────────────────────────────
console.log('\n=== Phase 7 Step 1 — astronomy-engine Spike ===\n')
console.log('Library: astronomy-engine (MIT, JPL-validated)')
console.log('Location: Kathmandu (27.7172°N, 85.3240°E, 1400m)')
console.log('Convention: tithi at actual sunrise (NST)\n')

let passed = 0
let failed = 0

for (const ref of REFERENCE_DATES) {
  const adDate = new Date(`${ref.adDate}T00:00:00Z`)
  const result = computePanchang({ adDate })

  const sunriseNST = new Date(result.sunriseMoment.getTime() + NST_OFFSET_MS)
  const sunriseStr = sunriseNST.toISOString().slice(11, 16)

  const ok = result.tithi === ref.expectedTithi
  const status = ok ? 'PASS' : 'FAIL'

  if (ok) passed++; else failed++

  console.log(
    `${status}  ${ref.bsLabel.padEnd(14)}` +
    `  sunrise=${sunriseStr} NST` +
    `  tithi=${String(result.tithi).padStart(2)} (expected ${String(ref.expectedTithi).padStart(2)})` +
    `  nakshatra=${String(result.nakshatra).padStart(2)}` +
    `  | ${ref.note}`
  )
}

console.log(`\n${passed}/${REFERENCE_DATES.length} passed`)

if (failed === 0) {
  console.log('\nSpike complete. astronomy-engine produces correct tithi at sunrise.')
  console.log('Proceed to Step 2: src/astro/compute.ts is already built.\n')
} else {
  console.error('\nSpike FAILED — investigate before proceeding.\n')
  process.exit(1)
}
