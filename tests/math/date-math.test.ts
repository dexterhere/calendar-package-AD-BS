import { describe, it, expect } from 'vitest'
import {
  addDays,
  subtractDays,
  diffInDays,
  diffInMonths,
  isBefore,
  isAfter,
  isSameDay,
  isBetween,
  addMonths,
  addYears,
} from '../../src/math/index.js'

describe('BS Date Math (date-math)', () => {
  it('adds days correctly within the same month', () => {
    const start = { year: 2082, month: 1, day: 1 }
    const result = addDays(start, 5)
    expect(result).toEqual({ year: 2082, month: 1, day: 6 })
  })

  it('adds days across month boundary (Baishakh to Jestha)', () => {
    // 2082 Baishakh has 31 days
    const start = { year: 2082, month: 1, day: 30 }
    const result = addDays(start, 3)
    expect(result).toEqual({ year: 2082, month: 2, day: 2 })
  })

  it('adds days across year boundary (Chaitra 2081 to Baishakh 2082)', () => {
    // 2081 Chaitra end -> 2082 Baishakh 1
    const end2081 = { year: 2081, month: 12, day: 30 }
    const result = addDays(end2081, 2)
    expect(result.year).toBe(2082)
    expect(result.month).toBe(1)
  })

  it('subtracts days correctly', () => {
    const start = { year: 2082, month: 1, day: 5 }
    const result = subtractDays(start, 4)
    expect(result).toEqual({ year: 2082, month: 1, day: 1 })
  })

  it('diffInDays calculates exact day difference', () => {
    const d1 = { year: 2082, month: 1, day: 1 }
    const d2 = { year: 2082, month: 1, day: 15 }
    expect(diffInDays(d1, d2)).toBe(14)
    expect(diffInDays(d2, d1)).toBe(-14)
    expect(diffInDays(d1, d1)).toBe(0)
  })

  it('isBefore, isAfter, isSameDay operate as expected', () => {
    const d1 = { year: 2082, month: 1, day: 1 }
    const d2 = { year: 2082, month: 1, day: 2 }
    expect(isBefore(d1, d2)).toBe(true)
    expect(isBefore(d2, d1)).toBe(false)
    expect(isAfter(d2, d1)).toBe(true)
    expect(isAfter(d1, d2)).toBe(false)
    expect(isSameDay(d1, { year: 2082, month: 1, day: 1 })).toBe(true)
  })

  it('isBetween checks range correctly', () => {
    const start = { year: 2082, month: 1, day: 1 }
    const mid = { year: 2082, month: 1, day: 15 }
    const end = { year: 2082, month: 1, day: 31 }

    expect(isBetween(mid, start, end)).toBe(true)
    expect(isBetween(start, start, end, true)).toBe(true)
    expect(isBetween(start, start, end, false)).toBe(false)
  })

  it('addMonths advances month and clamps overflow days if necessary', () => {
    const start = { year: 2082, month: 1, day: 31 } // Baishakh 31
    const nextMonth = addMonths(start, 1) // Jestha (may have 31 or 32 days)
    expect(nextMonth.month).toBe(2)

    // Check year wrap
    const endOfYear = { year: 2082, month: 12, day: 15 }
    const nextYear = addMonths(endOfYear, 1)
    expect(nextYear).toEqual({ year: 2083, month: 1, day: 15 })
  })

  it('addYears advances year correctly', () => {
    const date = { year: 2082, month: 5, day: 10 }
    const next = addYears(date, 2)
    expect(next).toEqual({ year: 2084, month: 5, day: 10 })
  })

  it('diffInMonths returns total month offset', () => {
    const d1 = { year: 2082, month: 1, day: 1 }
    const d2 = { year: 2083, month: 4, day: 1 }
    expect(diffInMonths(d1, d2)).toBe(15)
  })
})
