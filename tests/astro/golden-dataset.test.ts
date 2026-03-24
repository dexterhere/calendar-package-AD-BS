/**
 * tests/astro/golden-dataset.test.ts
 *
 * Phase 7 Step 10 — CI regression guard for the panchang engine.
 *
 * Iterates GOLDEN_DATASET and asserts that getPanchang() returns the expected
 * tithi, nakshatra, and tithiType for every entry. This test must pass on every PR.
 *
 * If this test fails, it means:
 *   (a) panchang data was regenerated with a different engine — check generate-panchang-v2.ts
 *   (b) a code change in panchang-lookup.ts altered how data is mapped
 *   (c) a golden dataset entry has an incorrect expected value — fix the entry + add source
 */

import { describe, it, expect, beforeAll } from 'vitest'
import { GOLDEN_DATASET } from './golden-dataset.js'
import { getPanchang, ensurePanchangYear } from '../../src/panchang/panchang-lookup.js'
import { getNakshatraByNumber } from '../../src/i18n/nakshatra-names.js'

// Pre-load all years present in the golden dataset
const YEARS_IN_DATASET = [...new Set(GOLDEN_DATASET.map(e => e.bsDate.year))]

describe('Golden Dataset — panchang regression guard', () => {
  beforeAll(async () => {
    await Promise.all(YEARS_IN_DATASET.map(y => ensurePanchangYear(y)))
  })

  it(`covers at least 50 verified date-tithi-nakshatra triples`, () => {
    expect(GOLDEN_DATASET.length).toBeGreaterThanOrEqual(50)
  })

  for (const entry of GOLDEN_DATASET) {
    const { year, month, day } = entry.bsDate
    const dateStr = `BS ${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`

    it(`${dateStr} — ${entry.label}`, () => {
      const result = getPanchang(entry.bsDate)
      expect(result, `getPanchang returned null for ${dateStr}`).not.toBeNull()

      // Tithi
      expect(result!.tithi.number).toBe(entry.expectedTithi)

      // Nakshatra — PanchangInfo stores name, not number; look up expected name by number
      const expectedNakshatraName = getNakshatraByNumber(entry.expectedNakshatra).en
      expect(result!.nakshatra).toBeDefined()
      expect(result!.nakshatra!.name).toBe(expectedNakshatraName)

      // TithiType (only checked when expectedTithiType is specified)
      if (entry.expectedTithiType !== undefined) {
        expect(result!.tithiType).toBe(entry.expectedTithiType)
      }
    })
  }
})
