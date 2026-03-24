/**
 * tests/panchang/compute-fallback.test.ts
 *
 * Tests for the Phase 7 Step 9 runtime computation fallback.
 *
 * Covers:
 *   - Out-of-range BS years (outside precomputed 2080–2090) return valid panchang
 *   - Custom observer location (Pokhara) produces valid panchang
 *   - LRU cache returns same result on second call
 *   - Kathmandu location with in-range year uses fast path (precomputed data)
 *   - Completely unsupported BS year (outside bsToAd range) returns null via getPanchang
 */

import { describe, it, expect, beforeAll } from 'vitest'
import { computeFallback, _lruSize } from '../../src/panchang/compute-fallback.js'
import { getPanchang, ensurePanchangYear } from '../../src/panchang/panchang-lookup.js'

// Pokhara, Nepal (second largest city) — different sunrise than Kathmandu
const POKHARA_LAT = 28.2096
const POKHARA_LON = 83.9856

describe('computeFallback', () => {
  it('returns valid PanchangInfo for BS 2075 (below precomputed range)', () => {
    // BS 2075/01/01 = AD 2018-04-14
    const bsDate = { year: 2075, month: 1, day: 1 }
    const result = computeFallback(bsDate)

    expect(result).not.toBeNull()
    expect(result.tithi.number).toBeGreaterThanOrEqual(1)
    expect(result.tithi.number).toBeLessThanOrEqual(30)
    expect(result.tithi.name).toBeTruthy()
    expect(result.tithi.nameNe).toBeTruthy()
    expect(['shukla', 'krishna']).toContain(result.paksha)
    expect(result.pakshaName.en).toBeTruthy()
    expect(result.nakshatra).toBeDefined()
    expect(result.nakshatra!.name).toBeTruthy()
    expect(result.yoga).toBeDefined()
    expect(result.yoga!.number).toBeGreaterThanOrEqual(1)
    expect(result.yoga!.number).toBeLessThanOrEqual(27)
    expect(result.karana).toBeDefined()
    expect(result.karana!.number).toBeGreaterThanOrEqual(1)
    expect(result.karana!.number).toBeLessThanOrEqual(11)
    // Fallback always returns 'normal' — Kshaya/Vriddhi requires adjacent-day context
    expect(result.tithiType).toBe('normal')
  })

  it('returns valid PanchangInfo for Pokhara coordinates', () => {
    // Pokhara is ~1° further west than Kathmandu, so sunrise is ~4 minutes later
    const bsDate = { year: 2082, month: 1, day: 1 }
    const result = computeFallback(bsDate, { lat: POKHARA_LAT, lon: POKHARA_LON })

    expect(result).not.toBeNull()
    expect(result.tithi.number).toBeGreaterThanOrEqual(1)
    expect(result.tithi.number).toBeLessThanOrEqual(30)
    expect(['shukla', 'krishna']).toContain(result.paksha)
    expect(result.nakshatra).toBeDefined()
    expect(result.yoga).toBeDefined()
    expect(result.karana).toBeDefined()
    expect(result.tithiType).toBe('normal')
  })

  it('Pokhara result may differ from Kathmandu on edge-case dates', () => {
    // On most days tithi is the same for both cities (lunar cycle >> sunrise difference).
    // This test just confirms both return valid data for the same date.
    const bsDate = { year: 2082, month: 1, day: 14 } // Amavasya — boundary day

    const ktmResult = computeFallback(bsDate)
    const pokharaResult = computeFallback(bsDate, { lat: POKHARA_LAT, lon: POKHARA_LON })

    // Both must return valid panchang
    expect(ktmResult.tithi.number).toBeGreaterThanOrEqual(1)
    expect(pokharaResult.tithi.number).toBeGreaterThanOrEqual(1)

    // Sunrise times differ — either same or different tithi is astronomically valid
    expect([ktmResult.tithi.number, ktmResult.tithi.number - 1, ktmResult.tithi.number + 1])
      .toContain(pokharaResult.tithi.number)
  })

  it('caches results — LRU hit on second call', () => {
    const bsDate = { year: 2076, month: 6, day: 15 }
    const sizeBefore = _lruSize()

    const result1 = computeFallback(bsDate)
    const sizeAfter1 = _lruSize()
    expect(sizeAfter1).toBe(sizeBefore + 1)

    // Second call should hit cache (same object reference)
    const result2 = computeFallback(bsDate)
    const sizeAfter2 = _lruSize()
    expect(sizeAfter2).toBe(sizeAfter1) // no new entry

    // Values must be identical
    expect(result2.tithi.number).toBe(result1.tithi.number)
    expect(result2.paksha).toBe(result1.paksha)
  })

  it('different locations produce separate cache entries', () => {
    const bsDate = { year: 2076, month: 6, day: 20 }
    const sizeBefore = _lruSize()

    computeFallback(bsDate)                                              // Kathmandu (default)
    computeFallback(bsDate, { lat: POKHARA_LAT, lon: POKHARA_LON })    // Pokhara

    // Two distinct cache entries
    expect(_lruSize()).toBe(sizeBefore + 2)
  })
})

describe('getPanchang with fallback integration', () => {
  beforeAll(async () => {
    await ensurePanchangYear(2082)
  })

  it('returns valid panchang for BS 2075 via getPanchang (fallback path)', () => {
    const bsDate = { year: 2075, month: 1, day: 1 }
    const result = getPanchang(bsDate)

    expect(result).not.toBeNull()
    expect(result!.tithi.number).toBeGreaterThanOrEqual(1)
    expect(result!.tithi.number).toBeLessThanOrEqual(30)
    expect(result!.tithiType).toBe('normal')
  })

  it('returns valid panchang for Pokhara location via getPanchang', () => {
    const bsDate = { year: 2082, month: 1, day: 1 }
    const result = getPanchang(bsDate, { lat: POKHARA_LAT, lon: POKHARA_LON })

    expect(result).not.toBeNull()
    expect(result!.tithi.number).toBeGreaterThanOrEqual(1)
    expect(result!.tithi.number).toBeLessThanOrEqual(30)
  })

  it('precomputed path still used for Kathmandu in-range dates', () => {
    // BS 2082/01/01 is in precomputed range — should use cached data (tithi=16 from JSON)
    const bsDate = { year: 2082, month: 1, day: 1 }
    const result = getPanchang(bsDate)

    expect(result).not.toBeNull()
    expect(result!.tithi.number).toBe(16) // verified from precomputed data
  })

  it('returns null for BS year outside calendar data range', () => {
    // BS 2099 > BS_DATA_YEAR_MAX (2090) — bsToAd throws, getPanchang returns null
    const bsDate = { year: 2099, month: 1, day: 1 }
    expect(getPanchang(bsDate)).toBeNull()
  })
})
