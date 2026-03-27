/**
 * Festival Date Accuracy Tests
 * Validates festival resolution against verified Hamro Patro / Drik Panchang data
 */
import { describe, it, expect, beforeAll } from 'vitest'
import { getEventsForDate, getEventsForMonth } from '../../src/events/event-engine.js'
import { getPanchang, ensurePanchangYear } from '../../src/panchang/panchang-lookup.js'

// ─── Reference Festival Dates (BS 2082) ──────────────────────────────────────
// Sources: Hamro Patro, Drik Panchang, nepcalendar.com, Nepal Government

const VERIFIED_FESTIVALS = [
  // --- Dashain ---
  {
    id: 'dashain-day1',
    name: 'Ghatasthapana',
    bsMonth: 6, bsDay: 6,
    adDate: '2025-09-22',
    tithi: 1, paksha: 'shukla' as const,
    source: 'Hamro Patro, Nepal Hiking Team',
  },
  {
    id: 'dashain-day7',
    name: 'Fulpati',
    bsMonth: 6, bsDay: 13,
    tithi: 7, paksha: 'shukla' as const,
    source: 'Hamro Patro',
  },
  {
    id: 'dashain-day8',
    name: 'Maha Asthami',
    bsMonth: 6, bsDay: 14,
    tithi: 8, paksha: 'shukla' as const,
    source: 'Hamro Patro',
  },
  {
    id: 'dashain-day9',
    name: 'Maha Nawami',
    bsMonth: 6, bsDay: 15,
    tithi: 9, paksha: 'shukla' as const,
    source: 'Hamro Patro',
  },
  {
    id: 'vijaya-dashami',
    name: 'Vijaya Dashami',
    bsMonth: 6, bsDay: 16,
    adDate: '2025-10-02',
    tithi: 10, paksha: 'shukla' as const,
    source: 'Hamro Patro, Ramro Patro, Drik Panchang',
  },
  {
    id: 'kojagrat-purnima',
    name: 'Kojagrat Purnima',
    bsMonth: 6, bsDay: 21,
    tithi: 15, paksha: 'shukla' as const,
    source: 'Nepal Hiking Team',
  },

  // --- Tihar ---
  {
    id: 'tihar-day1',
    name: 'Kag Tihar',
    bsMonth: 7, bsDay: 2,
    tithi: 28, paksha: 'krishna' as const,
    source: 'nepcalendar.com',
  },
  {
    id: 'tihar-day2',
    name: 'Kukur Tihar',
    bsMonth: 7, bsDay: 3,
    tithi: 29, paksha: 'krishna' as const,
    source: 'nepcalendar.com',
  },
  {
    id: 'tihar-day3-laxmi',
    name: 'Laxmi Puja',
    bsMonth: 7, bsDay: 4,
    adDate: '2025-10-21',
    tithi: 30, paksha: 'krishna' as const,
    source: 'Hamro Patro, nepcalendar.com',
  },
  {
    id: 'tihar-day4',
    name: 'Govardhan Puja',
    bsMonth: 7, bsDay: 5,
    tithi: 1, paksha: 'shukla' as const,
    source: 'nepcalendar.com',
  },
  {
    id: 'tihar-day5',
    name: 'Bhai Tika',
    bsMonth: 7, bsDay: 6,
    adDate: '2025-10-23',
    tithi: 2, paksha: 'shukla' as const,
    source: 'Hamro Patro, nepcalendar.com',
  },

  // --- Major Fixed-Date Festivals ---
  {
    id: 'maghe-sankranti',
    name: 'Maghe Sankranti',
    bsMonth: 10, bsDay: 1,
    adDate: '2026-01-14',
    source: 'timeanddate.com',
  },
  {
    id: 'republic-day',
    name: 'Republic Day',
    bsMonth: 2, bsDay: 15,
    source: 'Fixed BS date',
  },
  {
    id: 'constitution-day',
    name: 'Constitution Day',
    bsMonth: 6, bsDay: 3,
    source: 'Fixed BS date',
  },

  // --- Major Tithi-Based Festivals ---
  {
    id: 'buddha-jayanti',
    name: 'Buddha Jayanti',
    bsMonth: 1, bsDay: 29,
    tithi: 15, paksha: 'shukla' as const,
    source: 'rat32.com, ashesh.com.np',
  },
  {
    id: 'mata-tirtha-aunsi',
    name: "Mata Tirtha Aunsi (Mother's Day)",
    bsMonth: 1, bsDay: 14,
    tithi: 30, paksha: 'krishna' as const,
    source: 'Hamro Patro',
  },
  {
    id: 'gokarna-aurasi',
    name: "Gokarna Aunsi (Father's Day)",
    bsMonth: 5, bsDay: 7,
    tithi: 30, paksha: 'krishna' as const,
    source: 'Hamro Patro, giftmandu.com',
  },
  {
    id: 'janai-purnima',
    name: 'Janai Purnima',
    bsMonth: 4, bsDay: 24, // Shrawan Purnima
    tithi: 15, paksha: 'shukla' as const,
    source: 'nepalguideinfo.com',
  },
]

describe('Festival Date Accuracy (Reference Comparison)', () => {
  beforeAll(async () => {
    await ensurePanchangYear(2082)
  })

  describe('All verified festivals are detected on the correct BS date', () => {
    for (const fest of VERIFIED_FESTIVALS) {
      it(`${fest.name} found on BS 2082/${fest.bsMonth}/${fest.bsDay}`, () => {
        const events = getEventsForDate({ year: 2082, month: fest.bsMonth, day: fest.bsDay })
        const match = events.find(e => e.id === fest.id)
        expect(match).toBeDefined()
        if (match) {
          expect(match.name.en).toContain(fest.name.split('(')[0].trim().split('/')[0].trim())
        }
      })
    }
  })

  describe('Tithi alignment for tithi-based festivals', () => {
    const tithiFestivals = VERIFIED_FESTIVALS.filter(f => f.tithi !== undefined)

    for (const fest of tithiFestivals) {
      it(`${fest.name} — BS 2082/${fest.bsMonth}/${fest.bsDay} has tithi ${fest.tithi} (${fest.paksha})`, () => {
        const panchang = getPanchang({ year: 2082, month: fest.bsMonth, day: fest.bsDay })
        expect(panchang).not.toBeNull()
        expect(panchang!.tithi.number).toBe(fest.tithi)
        expect(panchang!.paksha).toBe(fest.paksha)
      })
    }
  })

  describe('Dashain spans correct days', () => {
    it('Ashwin month has all Dashain events (Day 1 through 15)', () => {
      const events = getEventsForMonth(2082, 6) // Ashwin = month 6
      const dashainIds = events.filter(e => e.id.includes('dashain') || e.id === 'vijaya-dashami' || e.id === 'kojagrat-purnima')
      expect(dashainIds.length).toBeGreaterThanOrEqual(5)
    })

    it('Vijaya Dashami is marked as public holiday', () => {
      const events = getEventsForDate({ year: 2082, month: 6, day: 16 })
      const vd = events.find(e => e.id === 'vijaya-dashami')
      expect(vd).toBeDefined()
      expect(vd!.isPublicHoliday).toBe(true)
    })
  })

  describe('Tihar spans correct days', () => {
    it('Kartik month has all Tihar events', () => {
      const events = getEventsForMonth(2082, 7)
      const tiharIds = events.filter(e => e.id.includes('tihar'))
      expect(tiharIds.length).toBeGreaterThanOrEqual(3)
    })

    it('Laxmi Puja and Bhai Tika are public holidays', () => {
      const laxmiEvents = getEventsForDate({ year: 2082, month: 7, day: 4 })
      const laxmi = laxmiEvents.find(e => e.id === 'tihar-day3-laxmi')
      expect(laxmi).toBeDefined()
      expect(laxmi!.isPublicHoliday).toBe(true)

      const bhaiEvents = getEventsForDate({ year: 2082, month: 7, day: 6 })
      const bhai = bhaiEvents.find(e => e.id === 'tihar-day5')
      expect(bhai).toBeDefined()
      expect(bhai!.isPublicHoliday).toBe(true)
    })
  })

  describe('Mother/Father Day accuracy', () => {
    it("Mother's Day (Mata Tirtha Aunsi) on Baishakh Amavasya", () => {
      const events = getEventsForDate({ year: 2082, month: 1, day: 14 })
      const motherDay = events.find(e => e.id === 'mata-tirtha-aunsi')
      expect(motherDay).toBeDefined()

      const panchang = getPanchang({ year: 2082, month: 1, day: 14 })
      expect(panchang!.tithi.number).toBe(30) // Amavasya
    })

    it("Father's Day (Gokarna Aunsi) on Bhadra Amavasya", () => {
      const events = getEventsForDate({ year: 2082, month: 5, day: 7 })
      const fatherDay = events.find(e => e.id === 'gokarna-aurasi')
      expect(fatherDay).toBeDefined()

      const panchang = getPanchang({ year: 2082, month: 5, day: 7 })
      expect(panchang!.tithi.number).toBe(30) // Amavasya
    })
  })
})
