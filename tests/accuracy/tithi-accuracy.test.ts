/**
 * Tithi Data Accuracy Tests
 * Validates tithi, paksha, Purnima, and Amavasya data against verified reference
 */
import { describe, it, expect, beforeAll } from 'vitest'
import { getPanchang, ensurePanchangYear } from '../../src/panchang/panchang-lookup.js'
import { getMonthDayCount } from '../../src/data/bs-month-lengths.js'

// Reference-verified tithi samples
const VERIFIED_TITHIS = [
  { m: 1, d: 1, tithi: 16, paksha: 'krishna' as const, note: 'Baishakh 1 — Krishna Pratipada' },
  { m: 1, d: 14, tithi: 30, paksha: 'krishna' as const, note: 'Baishakh Amavasya' },
  { m: 1, d: 15, tithi: 1, paksha: 'shukla' as const, note: 'Baishakh Shukla Pratipada' },
  { m: 1, d: 29, tithi: 15, paksha: 'shukla' as const, note: 'Baishakh Purnima' },
  { m: 7, d: 5, tithi: 1, paksha: 'shukla' as const, note: 'Ghatasthapana (Dashain)' },
  { m: 7, d: 15, tithi: 10, paksha: 'shukla' as const, note: 'Vijaya Dashami' },
  { m: 7, d: 19, tithi: 15, paksha: 'shukla' as const, note: 'Kojagrat Purnima' },
  { m: 8, d: 4, tithi: 30, paksha: 'krishna' as const, note: 'Laxmi Puja (Amavasya)' },
  { m: 8, d: 6, tithi: 2, paksha: 'shukla' as const, note: 'Bhai Tika' },
]

// Reference-verified Purnima dates for BS 2082
const PURNIMA_DATES = [
  { m: 1, d: 29, note: 'Baishakh Purnima / Buddha Jayanti' },
  { m: 2, d: 28, note: 'Jestha Purnima' },
  { m: 3, d: 26, note: 'Ashadh Purnima / Guru Purnima' },
  { m: 4, d: 24, note: 'Shrawan Purnima / Janai Purnima' },
  { m: 5, d: 22, note: 'Bhadra Purnima' },
  { m: 6, d: 21, note: 'Ashwin Purnima' },
  { m: 7, d: 19, note: 'Kartik Purnima / Kojagrat Purnima' },
  { m: 9, d: 19, note: 'Poush Purnima' },
  { m: 10, d: 18, note: 'Magh Purnima' },
  { m: 11, d: 19, note: 'Falgun Purnima / Holi' },
  { m: 12, d: 19, note: 'Chaitra Purnima' },
]

// Reference-verified Amavasya dates for BS 2082
const AMAVASYA_DATES = [
  { m: 1, d: 14, note: 'Baishakh Amavasya / Mata Tirtha Aunsi' },
  { m: 2, d: 13, note: 'Jestha Amavasya' },
  { m: 3, d: 11, note: 'Ashadh Amavasya' },
  { m: 4, d: 8, note: 'Shrawan Amavasya' },
  { m: 5, d: 7, note: 'Bhadra Amavasya / Kushe Aunsi' },
  { m: 6, d: 5, note: 'Ashwin Amavasya' },
  { m: 7, d: 4, note: 'Kartik Amavasya' },
  { m: 8, d: 4, note: 'Mangsir Amavasya' },
  { m: 9, d: 4, note: 'Poush Amavasya' },
  { m: 10, d: 4, note: 'Magh Amavasya' },
  { m: 11, d: 5, note: 'Falgun Amavasya' },
  { m: 12, d: 5, note: 'Chaitra Amavasya' },
]

describe('Tithi Data Accuracy (Reference Comparison)', () => {
  beforeAll(async () => {
    await ensurePanchangYear(2082)
  })

  describe('Verified tithi samples match reference', () => {
    for (const entry of VERIFIED_TITHIS) {
      it(`BS 2082/${entry.m}/${entry.d}: Tithi ${entry.tithi} ${entry.paksha} (${entry.note})`, () => {
        const panchang = getPanchang({ year: 2082, month: entry.m, day: entry.d })
        expect(panchang).not.toBeNull()
        expect(panchang!.tithi.number).toBe(entry.tithi)
        expect(panchang!.paksha).toBe(entry.paksha)
      })
    }
  })

  describe('All Purnima dates match reference', () => {
    for (const entry of PURNIMA_DATES) {
      it(`${entry.note}: BS 2082/${entry.m}/${entry.d} → Tithi 15 (Purnima)`, () => {
        const panchang = getPanchang({ year: 2082, month: entry.m, day: entry.d })
        expect(panchang).not.toBeNull()
        expect(panchang!.tithi.number).toBe(15)
        expect(panchang!.tithi.name).toBe('Purnima')
        expect(panchang!.paksha).toBe('shukla')
      })
    }
  })

  describe('All Amavasya dates match reference', () => {
    for (const entry of AMAVASYA_DATES) {
      it(`${entry.note}: BS 2082/${entry.m}/${entry.d} → Tithi 30 (Amavasya)`, () => {
        const panchang = getPanchang({ year: 2082, month: entry.m, day: entry.d })
        expect(panchang).not.toBeNull()
        expect(panchang!.tithi.number).toBe(30)
        expect(panchang!.tithi.name).toBe('Amavasya')
        expect(panchang!.paksha).toBe('krishna')
      })
    }
  })

  describe('Tithi continuity and validity', () => {
    it('all days in BS 2082 have panchang data', () => {
      let missing = 0
      let totalDays = 0

      for (let month = 1; month <= 12; month++) {
        let daysInMonth = 30
        try { daysInMonth = getMonthDayCount(2082, month) } catch { /* fallback */ }

        for (let day = 1; day <= daysInMonth; day++) {
          totalDays++
          const panchang = getPanchang({ year: 2082, month, day })
          if (!panchang) missing++
        }
      }

      expect(missing).toBe(0)
    })

    it('all tithi values are in range 1-30', () => {
      let outOfRange = 0

      for (let month = 1; month <= 12; month++) {
        let daysInMonth = 30
        try { daysInMonth = getMonthDayCount(2082, month) } catch { /* fallback */ }

        for (let day = 1; day <= daysInMonth; day++) {
          const panchang = getPanchang({ year: 2082, month, day })
          if (panchang && (panchang.tithi.number < 1 || panchang.tithi.number > 30)) {
            outOfRange++
          }
        }
      }

      expect(outOfRange).toBe(0)
    })

    it('paksha matches tithi range (1-15 = shukla, 16-30 = krishna)', () => {
      let mismatches = 0

      for (let month = 1; month <= 12; month++) {
        let daysInMonth = 30
        try { daysInMonth = getMonthDayCount(2082, month) } catch { /* fallback */ }

        for (let day = 1; day <= daysInMonth; day++) {
          const panchang = getPanchang({ year: 2082, month, day })
          if (!panchang) continue

          if (panchang.tithi.number <= 15 && panchang.paksha !== 'shukla') mismatches++
          if (panchang.tithi.number > 15 && panchang.paksha !== 'krishna') mismatches++
        }
      }

      expect(mismatches).toBe(0)
    })

    it('Ekadashi (Shukla tithi 11) exists in most months', () => {
      let foundCount = 0

      for (let month = 1; month <= 12; month++) {
        let daysInMonth = 30
        try { daysInMonth = getMonthDayCount(2082, month) } catch { /* fallback */ }

        let found = false
        for (let day = 1; day <= daysInMonth; day++) {
          const panchang = getPanchang({ year: 2082, month, day })
          if (panchang && panchang.tithi.number === 11 && panchang.paksha === 'shukla') {
            found = true
            break
          }
        }

        if (found) foundCount++
      }

      // Allow tithi skips in some months (lunar cycle can skip a tithi)
      expect(foundCount).toBeGreaterThanOrEqual(10)
    })
  })
})
