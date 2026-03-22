import type { BSDate } from './types.js'

export const BS_YEAR_MIN = 2000
export const BS_YEAR_MAX = 2100

// The Gregorian date that corresponds to BS 2000 Baishakh 1
export const BS_EPOCH: Date = new Date(1943, 3, 14) // April 14, 1943

export function isLeapYear(adYear: number): boolean {
  return (adYear % 4 === 0 && adYear % 100 !== 0) || adYear % 400 === 0
}

export function validateBSDate(date: BSDate): void {
  if (date.year < BS_YEAR_MIN || date.year > BS_YEAR_MAX) {
    throw new RangeError(
      `BS year ${date.year} is outside the supported range (${BS_YEAR_MIN}–${BS_YEAR_MAX}).`
    )
  }
  if (date.month < 1 || date.month > 12) {
    throw new RangeError(`BS month ${date.month} is invalid. Must be 1–12.`)
  }
  if (date.day < 1) {
    throw new RangeError(`BS day ${date.day} is invalid. Must be >= 1.`)
  }
}

export function daysBetween(a: Date, b: Date): number {
  const msPerDay = 86_400_000
  const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())
  const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate())
  return Math.round((utcB - utcA) / msPerDay)
}
