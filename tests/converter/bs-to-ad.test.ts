import { describe, it, expect } from 'vitest'
import { toAD } from '../../src/converter/index.js'

// Helper: create a UTC Date for comparison (avoids timezone issues in assertions)
function utc(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day))
}

describe('toAD — known reference date pairs', () => {
  // All pairs verified against hamropatro.com

  it('epoch: BS 2000-01-01 → AD 1943-04-14', () => {
    expect(toAD({ year: 2000, month: 1, day: 1 })).toEqual(utc(1943, 4, 14))
  })

  it('BS 2082-01-01 → AD 2025-04-14 (BS new year 2082)', () => {
    expect(toAD({ year: 2082, month: 1, day: 1 })).toEqual(utc(2025, 4, 14))
  })

  it('BS 2082-09-16 → AD 2025-12-31 (day before Gregorian new year)', () => {
    // Verified: April 14 + 261 days = Dec 31; offset 261 in BS 2082 = Poush day 16
    expect(toAD({ year: 2082, month: 9, day: 16 })).toEqual(utc(2025, 12, 31))
  })

  it('BS 2082-09-17 → AD 2026-01-01 (Gregorian new year crossover)', () => {
    expect(toAD({ year: 2082, month: 9, day: 17 })).toEqual(utc(2026, 1, 1))
  })

  it('BS 2083-01-01 → AD 2026-04-14 (BS new year 2083)', () => {
    expect(toAD({ year: 2083, month: 1, day: 1 })).toEqual(utc(2026, 4, 14))
  })

  it('BS 2081-01-01 → AD 2024-04-13 (BS new year 2081)', () => {
    expect(toAD({ year: 2081, month: 1, day: 1 })).toEqual(utc(2024, 4, 13))
  })
})

describe('toAD — month boundary correctness', () => {
  it('BS 2082 Baishakh has 31 days — last day converts correctly', () => {
    expect(toAD({ year: 2082, month: 1, day: 31 })).toEqual(utc(2025, 5, 14))
  })

  it('BS 2082 Ashadh has 32 days — last day converts correctly', () => {
    expect(toAD({ year: 2082, month: 3, day: 32 })).toEqual(utc(2025, 7, 16))
  })

  it('first day of each month is exactly one day after last day of previous month', () => {
    // Use year 2082 with known month lengths: [31,31,32,31,31,31,30,29,30,29,30,30]
    const monthLengths = [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30]
    for (let m = 1; m < 12; m++) {
      const lastDay = toAD({ year: 2082, month: m, day: monthLengths[m - 1] as number })
      const firstNext = toAD({ year: 2082, month: m + 1, day: 1 })
      expect(firstNext.getTime() - lastDay.getTime(), `months ${m}→${m + 1}`).toBe(86_400_000)
    }
  })

  it('year boundary: last day of BS 2082 Chaitra → BS 2083 Baishakh 1 is +1 day', () => {
    // BS 2082 Chaitra (month 12) has 30 days
    const lastDay = toAD({ year: 2082, month: 12, day: 30 })
    const newYear = toAD({ year: 2083, month: 1, day: 1 })
    expect(newYear.getTime() - lastDay.getTime()).toBe(86_400_000)
  })
})

describe('toAD — weekday correctness', () => {
  it('BS 2082-01-01 (AD 2025-04-14) is a Monday', () => {
    expect(toAD({ year: 2082, month: 1, day: 1 }).getUTCDay()).toBe(1)
  })

  it('BS 2083-01-01 (AD 2026-04-14) is a Tuesday', () => {
    expect(toAD({ year: 2083, month: 1, day: 1 }).getUTCDay()).toBe(2)
  })
})

describe('toAD — range extremes', () => {
  it('converts minimum supported date: BS 2000-01-01', () => {
    expect(toAD({ year: 2000, month: 1, day: 1 })).toEqual(utc(1943, 4, 14))
  })

  it('converts last supported year without throwing', () => {
    expect(() => toAD({ year: 2090, month: 12, day: 30 })).not.toThrow()
  })
})

describe('toAD — returned Date is UTC midnight', () => {
  it('UTC getters match the expected Gregorian date', () => {
    const ad = toAD({ year: 2082, month: 1, day: 1 })
    expect(ad.getUTCFullYear()).toBe(2025)
    expect(ad.getUTCMonth()).toBe(3)   // April is index 3
    expect(ad.getUTCDate()).toBe(14)
    expect(ad.getUTCHours()).toBe(0)
    expect(ad.getUTCMinutes()).toBe(0)
  })
})
