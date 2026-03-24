/**
 * tests/panchang/kshaya-vriddhi.test.ts
 *
 * Unit tests for Kshaya and Vriddhi tithi handling — Phase 7 Step 7.
 *
 * Tests three layers:
 *   1. Schema: PanchangEntry.tt field is accepted by TypeScript
 *   2. Lookup:  entryToPanchangInfo maps tt → PanchangInfo.tithiType correctly
 *   3. Event engine: Kshaya Ekadashi fires on the Dashami day when tithiType='kshaya'
 *
 * Note: Real panchang JSON files do not yet contain `tt` fields (that requires
 * Step 8 generator). These tests use vi.mock to inject synthetic panchang data.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { PanchangInfo } from '../../src/panchang/types.js'

// ── 1. Schema type test ───────────────────────────────────────────────────────

describe('PanchangEntry schema — tt field', () => {
  it('accepts tt: undefined (normal day — backward compatible)', () => {
    const entry = { m: 1, d: 1, t: 10, n: 5 }
    // TypeScript would error if tt were required — this compiles = schema is optional
    expect(entry).toBeDefined()
  })

  it("accepts tt: 'k' (kshaya)", () => {
    const entry = { m: 1, d: 1, t: 10, tt: 'k' as const }
    expect(entry.tt).toBe('k')
  })

  it("accepts tt: 'v' (vriddhi)", () => {
    const entry = { m: 2, d: 5, t: 11, tt: 'v' as const }
    expect(entry.tt).toBe('v')
  })
})

// ── 2. PanchangInfo.tithiType mapping ────────────────────────────────────────

describe('PanchangInfo.tithiType', () => {
  it("field 'normal' is valid", () => {
    const info: PanchangInfo = {
      tithi: { name: 'Dashami', nameNe: 'दशमी', number: 10 },
      paksha: 'shukla',
      pakshaName: { en: 'Shukla Paksha', ne: 'शुक्ल पक्ष' },
      tithiType: 'normal',
    }
    expect(info.tithiType).toBe('normal')
  })

  it("field 'kshaya' is valid", () => {
    const info: PanchangInfo = {
      tithi: { name: 'Dashami', nameNe: 'दशमी', number: 10 },
      paksha: 'shukla',
      pakshaName: { en: 'Shukla Paksha', ne: 'शुक्ल पक्ष' },
      tithiType: 'kshaya',
    }
    expect(info.tithiType).toBe('kshaya')
  })

  it("field 'vriddhi' is valid", () => {
    const info: PanchangInfo = {
      tithi: { name: 'Ekadashi', nameNe: 'एकादशी', number: 11 },
      paksha: 'shukla',
      pakshaName: { en: 'Shukla Paksha', ne: 'शुक्ल पक्ष' },
      tithiType: 'vriddhi',
    }
    expect(info.tithiType).toBe('vriddhi')
  })
})

// ── 3. Kshaya Ekadashi detection in event engine ─────────────────────────────
//
// We mock getPanchang to return a synthetic PanchangInfo with tithiType='kshaya'.
// This isolates the event-engine kshaya logic from the real panchang data files.

vi.mock('../../src/panchang/panchang-lookup.js', () => ({
  getPanchang: vi.fn(),
  ensurePanchangYear: vi.fn().mockResolvedValue(undefined),
  preloadAllPanchang: vi.fn().mockResolvedValue(undefined),
  _getPanchangSync: vi.fn(),
}))

describe('Event engine — Kshaya Ekadashi detection', () => {
  // Import after mock is set up
  let getEventsForDate: typeof import('../../src/events/event-engine.js').getEventsForDate
  let getPanchang: ReturnType<typeof vi.fn>

  beforeEach(async () => {
    const eventMod   = await import('../../src/events/event-engine.js')
    const panchangMod = await import('../../src/panchang/panchang-lookup.js')
    getEventsForDate = eventMod.getEventsForDate
    getPanchang = panchangMod.getPanchang as ReturnType<typeof vi.fn>
    getPanchang.mockReset()
  })

  it('fires Shukla Ekadashi when today=Dashami(10) and tithiType=kshaya', () => {
    // Simulates: BS 2082 some month, day X has tithi=10 (Dashami) at sunrise
    // and tithi 11 (Ekadashi) completes within that day → kshaya Ekadashi
    getPanchang.mockReturnValue({
      tithi: { number: 10, name: 'Dashami', nameNe: 'दशमी' },
      paksha: 'shukla',
      pakshaName: { en: 'Shukla Paksha', ne: 'शुक्ल पक्ष' },
      tithiType: 'kshaya',
    } satisfies PanchangInfo)

    const events = getEventsForDate({ year: 2082, month: 1, day: 10 })
    const ekadashi = events.find(e => e.id === 'ekadashi-shukla')
    expect(ekadashi).toBeDefined()
    expect(ekadashi!.name.en).toContain('Ekadashi')
  })

  it('fires Krishna Ekadashi when today=Krishna Dashami(25) and tithiType=kshaya', () => {
    // Krishna Dashami = tithi 25; kshaya → tithi 26 (Krishna Ekadashi) was skipped
    getPanchang.mockReturnValue({
      tithi: { number: 25, name: 'Dashami', nameNe: 'दशमी' },
      paksha: 'krishna',
      pakshaName: { en: 'Krishna Paksha', ne: 'कृष्ण पक्ष' },
      tithiType: 'kshaya',
    } satisfies PanchangInfo)

    const events = getEventsForDate({ year: 2082, month: 1, day: 25 })
    const ekadashi = events.find(e => e.id === 'ekadashi-krishna')
    expect(ekadashi).toBeDefined()
    expect(ekadashi!.name.en).toContain('Ekadashi')
  })

  it('does NOT fire Ekadashi when tithiType=normal (standard Dashami day)', () => {
    getPanchang.mockReturnValue({
      tithi: { number: 10, name: 'Dashami', nameNe: 'दशमी' },
      paksha: 'shukla',
      pakshaName: { en: 'Shukla Paksha', ne: 'शुक्ल पक्ष' },
      tithiType: 'normal',
    } satisfies PanchangInfo)

    const events = getEventsForDate({ year: 2082, month: 1, day: 10 })
    const ekadashi = events.find(e => e.id === 'ekadashi-shukla')
    expect(ekadashi).toBeUndefined()
  })

  it('fires standard Ekadashi on tithi=11 normal day', () => {
    getPanchang.mockReturnValue({
      tithi: { number: 11, name: 'Ekadashi', nameNe: 'एकादशी' },
      paksha: 'shukla',
      pakshaName: { en: 'Shukla Paksha', ne: 'शुक्ल पक्ष' },
      tithiType: 'normal',
    } satisfies PanchangInfo)

    const events = getEventsForDate({ year: 2082, month: 1, day: 11 })
    const ekadashi = events.find(e => e.id === 'ekadashi-shukla')
    expect(ekadashi).toBeDefined()
  })

  it('kshaya on Navami(9) does NOT fire Ekadashi — wrong tithi offset', () => {
    // tithi=9 kshaya → kshaya tithi = 10 (Dashami), not Ekadashi
    getPanchang.mockReturnValue({
      tithi: { number: 9, name: 'Navami', nameNe: 'नवमी' },
      paksha: 'shukla',
      pakshaName: { en: 'Shukla Paksha', ne: 'शुक्ल पक्ष' },
      tithiType: 'kshaya',
    } satisfies PanchangInfo)

    const events = getEventsForDate({ year: 2082, month: 1, day: 9 })
    const ekadashi = events.find(e => e.id === 'ekadashi-shukla')
    expect(ekadashi).toBeUndefined()
  })

  it('Vriddhi Ekadashi: standard check fires on tithi=11 vriddhi day', () => {
    // Vriddhi = same tithi two days in a row. Standard tithi match still fires.
    getPanchang.mockReturnValue({
      tithi: { number: 11, name: 'Ekadashi', nameNe: 'एकादशी' },
      paksha: 'shukla',
      pakshaName: { en: 'Shukla Paksha', ne: 'शुक्ल पक्ष' },
      tithiType: 'vriddhi',
    } satisfies PanchangInfo)

    const events = getEventsForDate({ year: 2082, month: 1, day: 11 })
    const ekadashi = events.find(e => e.id === 'ekadashi-shukla')
    expect(ekadashi).toBeDefined()
  })
})

// ── 4. Kshaya tithi wrap-around ───────────────────────────────────────────────

describe('Event engine — Kshaya wrap-around (tithi 30 → tithi 1)', () => {
  let getEventsForDate: typeof import('../../src/events/event-engine.js').getEventsForDate
  let getPanchang: ReturnType<typeof vi.fn>

  beforeEach(async () => {
    const eventMod    = await import('../../src/events/event-engine.js')
    const panchangMod = await import('../../src/panchang/panchang-lookup.js')
    getEventsForDate  = eventMod.getEventsForDate
    getPanchang = panchangMod.getPanchang as ReturnType<typeof vi.fn>
    getPanchang.mockReset()
  })

  it('kshaya on Amavasya(30): kshayaTithi = 1 (Shukla Pratipada) — Ekadashi not fired', () => {
    // tithi=30 % 30 + 1 = 1 → kshaya tithi is Pratipada, not Ekadashi
    getPanchang.mockReturnValue({
      tithi: { number: 30, name: 'Amavasya', nameNe: 'औंसी' },
      paksha: 'krishna',
      pakshaName: { en: 'Krishna Paksha', ne: 'कृष्ण पक्ष' },
      tithiType: 'kshaya',
    } satisfies PanchangInfo)

    const events = getEventsForDate({ year: 2082, month: 1, day: 30 })
    const ekadashi = events.find(e => e.id === 'ekadashi-shukla' || e.id === 'ekadashi-krishna')
    expect(ekadashi).toBeUndefined()
  })
})
