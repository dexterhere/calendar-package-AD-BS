/**
 * tests/astro/compute.test.ts
 *
 * Unit tests for the Phase 7 core computation module.
 *
 * Reference values are cross-checked against:
 *  - Existing generated panchang data (src/data/panchang/2082.json)
 *  - Known astronomical events (Full Moon, New Moon dates are exact)
 *  - Spike script results (scripts/spike-astronomy-engine.ts)
 *
 * All tithi values use sunrise-at-Kathmandu convention.
 */

import { describe, it, expect } from 'vitest'
import {
  computePanchang,
  getSunriseForNepaliDay,
  tithiFromPhase,
  nakshatraFromMoonLon,
  yogaFromPositions,
  karanaFromPhase,
  varaFromDate,
  computeTithiType,
} from '../../src/astro/compute.js'
import { NST_OFFSET_MINUTES } from '../../src/astro/constants.js'

// Helper: UTC midnight Date for a Gregorian date (matches bsToAd output format)
function adDate(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day))
}

// ── Pure formula unit tests ───────────────────────────────────────────────────

describe('tithiFromPhase', () => {
  it('0° → tithi 1 (Shukla Pratipada, just after new moon)', () => {
    expect(tithiFromPhase(0)).toBe(1)
  })

  it('11.99° → tithi 1 (end of first tithi)', () => {
    expect(tithiFromPhase(11.99)).toBe(1)
  })

  it('12° → tithi 2 (Dwitiya)', () => {
    expect(tithiFromPhase(12)).toBe(2)
  })

  it('168° → tithi 15 (Purnima, Full Moon)', () => {
    // tithi 15 starts at 168° (14 × 12) and ends at 180°
    expect(tithiFromPhase(168)).toBe(15)
  })

  it('179.99° → tithi 15 (still Purnima)', () => {
    expect(tithiFromPhase(179.99)).toBe(15)
  })

  it('180° → tithi 16 (Krishna Pratipada, just after Full Moon)', () => {
    expect(tithiFromPhase(180)).toBe(16)
  })

  it('348° → tithi 30 (Amavasya, New Moon)', () => {
    // tithi 30 starts at 348° (29 × 12) and ends at 360°
    expect(tithiFromPhase(348)).toBe(30)
  })

  it('359.99° → tithi 30 (still Amavasya)', () => {
    expect(tithiFromPhase(359.99)).toBe(30)
  })
})

describe('nakshatraFromMoonLon', () => {
  it('0° → nakshatra 1 (Ashwini)', () => {
    expect(nakshatraFromMoonLon(0)).toBe(1)
  })

  it('13.33° → nakshatra 2 (Bharani)', () => {
    expect(nakshatraFromMoonLon(13.34)).toBe(2)
  })

  it('346.67° → nakshatra 27 (Revati)', () => {
    // Nakshatra 27 starts at 26 × (360/27) ≈ 346.67°
    expect(nakshatraFromMoonLon(347)).toBe(27)
  })

  it('359.99° → nakshatra 27 (Revati end)', () => {
    expect(nakshatraFromMoonLon(359.99)).toBe(27)
  })
})

describe('yogaFromPositions', () => {
  it('sun=0 moon=0 → yoga 1 (Vishkambha)', () => {
    expect(yogaFromPositions(0, 0)).toBe(1)
  })

  it('sun=180 moon=180 → (180+180)%360=0 → yoga 1', () => {
    expect(yogaFromPositions(180, 180)).toBe(1)
  })

  it('sum = 13.34° → yoga 2 (Priti)', () => {
    expect(yogaFromPositions(7, 6.34)).toBe(2)
  })

  it('sum = 346.67° → yoga 27 (Vaidhriti)', () => {
    expect(yogaFromPositions(200, 147)).toBe(27)
  })
})

describe('karanaFromPhase', () => {
  it('0° (index 0) → karana 11 (Kimstughna, fixed)', () => {
    expect(karanaFromPhase(0)).toBe(11)
  })

  it('6° (index 1) → karana 1 (Bava, first movable)', () => {
    expect(karanaFromPhase(6)).toBe(1)
  })

  it('12° (index 2) → karana 2 (Balava)', () => {
    expect(karanaFromPhase(12)).toBe(2)
  })

  it('48° (index 8) → karana 1 (Bava, second cycle)', () => {
    // index 8: (8-1) % 7 = 0 → karana 1
    expect(karanaFromPhase(48)).toBe(1)
  })

  it('342° (index 57) → karana 8 (Shakuni, fixed)', () => {
    expect(karanaFromPhase(342)).toBe(8)
  })

  it('348° (index 58) → karana 9 (Chatushpada, fixed)', () => {
    expect(karanaFromPhase(348)).toBe(9)
  })

  it('354° (index 59) → karana 10 (Nagava, fixed)', () => {
    expect(karanaFromPhase(354)).toBe(10)
  })
})

describe('varaFromDate', () => {
  // 2025-04-14 is a Monday in NST
  it('2025-04-14 sunrise NST → vara 2 (Monday)', () => {
    // sunrise ~05:40 NST = ~2025-04-13T23:55Z
    const sunrise = new Date('2025-04-13T23:55:00Z')
    expect(varaFromDate(sunrise, NST_OFFSET_MINUTES)).toBe(2)
  })

  // 2025-04-27 is a Sunday
  it('2025-04-27 sunrise NST → vara 1 (Sunday)', () => {
    const sunrise = new Date('2025-04-26T23:43:00Z')
    expect(varaFromDate(sunrise, NST_OFFSET_MINUTES)).toBe(1)
  })
})

describe('computeTithiType', () => {
  it('normal: yesterday=10, today=11, tomorrow=12 → normal', () => {
    expect(computeTithiType(11, 10, 12)).toBe('normal')
  })

  it('vriddhi: yesterday=11, today=11 → vriddhi (same tithi two days)', () => {
    expect(computeTithiType(11, 11, 12)).toBe('vriddhi')
  })

  it('kshaya: today=11, tomorrow=13 → kshaya (tithi 12 skipped)', () => {
    expect(computeTithiType(11, 10, 13)).toBe('kshaya')
  })

  it('wrap-around kshaya: today=30, tomorrow=2 → kshaya (tithi 1 skipped)', () => {
    expect(computeTithiType(30, 29, 2)).toBe('kshaya')
  })

  it('no adjacent data: null yesterday and tomorrow → normal', () => {
    expect(computeTithiType(11, null, null)).toBe('normal')
  })

  it('vriddhi takes priority over kshaya check', () => {
    // yesterday=11 matches today=11 → vriddhi, regardless of tomorrow
    expect(computeTithiType(11, 11, 13)).toBe('vriddhi')
  })
})

// ── getSunriseForNepaliDay ───────────────────────────────────────────────────

describe('getSunriseForNepaliDay', () => {
  it('returns a Date within the expected NST sunrise window (05:00–07:00)', () => {
    const sunrise = getSunriseForNepaliDay(adDate(2025, 4, 14))
    const sunriseNST = new Date(sunrise.getTime() + NST_OFFSET_MINUTES * 60 * 1000)
    const hNST = sunriseNST.getUTCHours()
    const mNST = sunriseNST.getUTCMinutes()
    const minutesAfterMidnight = hNST * 60 + mNST
    // Kathmandu sunrise is always between 05:00 and 07:00 NST
    expect(minutesAfterMidnight).toBeGreaterThanOrEqual(5 * 60)
    expect(minutesAfterMidnight).toBeLessThanOrEqual(7 * 60)
  })

  it('returns a different sunrise for a winter vs summer date', () => {
    const summerSunrise = getSunriseForNepaliDay(adDate(2025, 6, 21))  // June solstice
    const winterSunrise = getSunriseForNepaliDay(adDate(2025, 12, 21)) // December solstice

    const summerNST = new Date(summerSunrise.getTime() + NST_OFFSET_MINUTES * 60 * 1000)
    const winterNST = new Date(winterSunrise.getTime() + NST_OFFSET_MINUTES * 60 * 1000)

    // Summer sunrise is earlier than winter sunrise in Kathmandu (Northern Hemisphere)
    const summerMins = summerNST.getUTCHours() * 60 + summerNST.getUTCMinutes()
    const winterMins = winterNST.getUTCHours() * 60 + winterNST.getUTCMinutes()
    expect(summerMins).toBeLessThan(winterMins)
  })
})

// ── computePanchang integration tests ────────────────────────────────────────

describe('computePanchang — reference date verification', () => {
  // These 4 dates are the Step 1 spike reference values, independently verified.

  it('BS 2082/1/1 (2025-04-14) → tithi 16 (Krishna Pratipada)', () => {
    const result = computePanchang({ adDate: adDate(2025, 4, 14) })
    expect(result.tithi).toBe(16)
  })

  it('BS 2082/1/14 (2025-04-27) → tithi 30 (Amavasya)', () => {
    const result = computePanchang({ adDate: adDate(2025, 4, 27) })
    expect(result.tithi).toBe(30)
  })

  it('BS 2082/1/15 (2025-04-28) → tithi 1 (Shukla Pratipada)', () => {
    const result = computePanchang({ adDate: adDate(2025, 4, 28) })
    expect(result.tithi).toBe(1)
  })

  it('BS 2082/1/29 (2025-05-12) → tithi 15 (Purnima)', () => {
    const result = computePanchang({ adDate: adDate(2025, 5, 12) })
    expect(result.tithi).toBe(15)
  })
})

describe('computePanchang — output shape and ranges', () => {
  let result: ReturnType<typeof computePanchang>

  // Use a single computed date to verify all output fields
  it('returns all required fields with values in valid ranges', () => {
    result = computePanchang({ adDate: adDate(2025, 4, 14) })

    expect(result.tithi).toBeGreaterThanOrEqual(1)
    expect(result.tithi).toBeLessThanOrEqual(30)

    expect(result.nakshatra).toBeGreaterThanOrEqual(1)
    expect(result.nakshatra).toBeLessThanOrEqual(27)

    expect(result.yoga).toBeGreaterThanOrEqual(1)
    expect(result.yoga).toBeLessThanOrEqual(27)

    expect(result.karana).toBeGreaterThanOrEqual(1)
    expect(result.karana).toBeLessThanOrEqual(11)

    expect(result.vara).toBeGreaterThanOrEqual(1)
    expect(result.vara).toBeLessThanOrEqual(7)

    expect(result.sunLon).toBeGreaterThanOrEqual(0)
    expect(result.sunLon).toBeLessThan(360)

    expect(result.moonLon).toBeGreaterThanOrEqual(0)
    expect(result.moonLon).toBeLessThan(360)

    expect(result.sunriseMoment).toBeInstanceOf(Date)
    expect(result.tithiType).toBe('normal')
  })
})

describe('computePanchang — Kathmandu vs other location', () => {
  it('Pokhara sunrise differs from Kathmandu (different lon → different sunrise)', () => {
    const ktm    = computePanchang({ adDate: adDate(2025, 4, 14) })
    const pokhara = computePanchang({ adDate: adDate(2025, 4, 14), lat: 28.2096, lon: 83.9856, alt: 827 })

    // Pokhara is west of Kathmandu → sunrise is later
    expect(pokhara.sunriseMoment.getTime()).toBeGreaterThan(ktm.sunriseMoment.getTime())
  })
})

describe('computePanchang — multiple consecutive dates', () => {
  it('tithi advances by 1 (or wraps) between consecutive days for non-edge dates', () => {
    // Use a stable period in the middle of a paksha (away from new/full moon)
    // BS 2082 Baishakh 17-20 (AD 2025-04-30 to 2025-05-03)
    const tithis: number[] = []
    for (let i = 0; i < 4; i++) {
      const d = new Date(Date.UTC(2025, 3, 30 + i)) // April 30 + i
      tithis.push(computePanchang({ adDate: d }).tithi)
    }

    // All values must be in valid range
    tithis.forEach(t => {
      expect(t).toBeGreaterThanOrEqual(1)
      expect(t).toBeLessThanOrEqual(30)
    })

    // No two adjacent days should have the same tithi during a stable period
    // (Vriddhi is rare — this date range is in the middle of Shukla Paksha)
    for (let i = 0; i < tithis.length - 1; i++) {
      const diff = ((tithis[i + 1]! - tithis[i]! + 30) % 30)
      // diff should be 1 (normal advance) or possibly 2 (Kshaya) — never 0 in this range
      expect(diff).toBeGreaterThanOrEqual(1)
      expect(diff).toBeLessThanOrEqual(2)
    }
  })
})
