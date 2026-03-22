import { describe, it, expect } from 'vitest'
import { toBS } from '../../src/converter/index.js'

// Create a UTC Date (timezone-safe)
function utc(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day))
}

describe('toBS — known reference date pairs', () => {
  it('epoch: AD 1943-04-14 → BS 2000-01-01', () => {
    expect(toBS(utc(1943, 4, 14))).toEqual({ year: 2000, month: 1, day: 1 })
  })

  it('AD 2025-04-14 → BS 2082-01-01 (BS new year 2082)', () => {
    expect(toBS(utc(2025, 4, 14))).toEqual({ year: 2082, month: 1, day: 1 })
  })

  it('AD 2025-12-31 → BS 2082-09-16', () => {
    // Verified: 261 days after April 14 lands on Poush (month 9) day 16
    expect(toBS(utc(2025, 12, 31))).toEqual({ year: 2082, month: 9, day: 16 })
  })

  it('AD 2026-01-01 → BS 2082-09-17 (Gregorian new year crossover)', () => {
    expect(toBS(utc(2026, 1, 1))).toEqual({ year: 2082, month: 9, day: 17 })
  })

  it('AD 2026-04-14 → BS 2083-01-01 (BS new year 2083)', () => {
    expect(toBS(utc(2026, 4, 14))).toEqual({ year: 2083, month: 1, day: 1 })
  })

  it('AD 2024-04-13 → BS 2081-01-01 (BS new year 2081)', () => {
    expect(toBS(utc(2024, 4, 13))).toEqual({ year: 2081, month: 1, day: 1 })
  })
})

describe('toBS — Gregorian year boundaries', () => {
  it('December 31 in various years converts to correct BS month', () => {
    // These fall in BS month 9 (Poush) — a winter month
    const dec31 = toBS(utc(2025, 12, 31))
    expect(dec31.month).toBe(9) // Poush
    expect(dec31.year).toBe(2082)
  })

  it('January 1 converts to the same BS month as December 31 + 1 day', () => {
    const dec31 = toBS(utc(2025, 12, 31))
    const jan1 = toBS(utc(2026, 1, 1))
    // They should be in the same month (Poush) and jan1.day = dec31.day + 1
    expect(jan1.year).toBe(dec31.year)
    expect(jan1.month).toBe(dec31.month)
    expect(jan1.day).toBe(dec31.day + 1)
  })
})

describe('toBS — range extremes', () => {
  it('converts the epoch date without error', () => {
    expect(() => toBS(utc(1943, 4, 14))).not.toThrow()
  })

  it('throws RangeError for a date before the epoch', () => {
    expect(() => toBS(utc(1943, 4, 13))).toThrowError(RangeError)
  })

  it('throws RangeError for a far-future date beyond BS 2090', () => {
    expect(() => toBS(utc(2034, 4, 15))).toThrowError(RangeError)
  })
})
