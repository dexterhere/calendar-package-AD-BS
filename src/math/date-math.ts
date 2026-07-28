import type { BSDate } from '../converter/types.js'
import type { DateMathOptions } from './types.js'
import { bsToAd } from '../converter/bs-to-ad.js'
import { adToBs } from '../converter/ad-to-bs.js'
import { MS_PER_DAY, validateBSDate } from '../converter/utils.js'
import { getMonthDayCount } from '../data/bs-month-lengths.js'

/**
 * Adds a specified number of days to a BSDate.
 */
export function addDays(bsDate: BSDate, days: number): BSDate {
  validateBSDate(bsDate)
  if (days === 0) return { ...bsDate }

  const ad = bsToAd(bsDate)
  const targetMs = ad.getTime() + days * MS_PER_DAY
  return adToBs(new Date(targetMs))
}

/**
 * Subtracts a specified number of days from a BSDate.
 */
export function subtractDays(bsDate: BSDate, days: number): BSDate {
  return addDays(bsDate, -days)
}

/**
 * Calculates the exact difference in days between two BSDates (date2 - date1).
 * Positive if date2 is after date1, negative if date2 is before date1.
 */
export function diffInDays(date1: BSDate, date2: BSDate): number {
  validateBSDate(date1)
  validateBSDate(date2)

  const ad1 = bsToAd(date1)
  const ad2 = bsToAd(date2)
  return Math.round((ad2.getTime() - ad1.getTime()) / MS_PER_DAY)
}

/**
 * Returns true if date1 is strictly before date2.
 */
export function isBefore(date1: BSDate, date2: BSDate): boolean {
  return diffInDays(date1, date2) > 0
}

/**
 * Returns true if date1 is strictly after date2.
 */
export function isAfter(date1: BSDate, date2: BSDate): boolean {
  return diffInDays(date1, date2) < 0
}

/**
 * Returns true if date1 and date2 refer to the exact same BS date.
 */
export function isSameDay(date1: BSDate, date2: BSDate): boolean {
  return (
    date1.year === date2.year &&
    date1.month === date2.month &&
    date1.day === date2.day
  )
}

/**
 * Checks if target BSDate falls between start and end BSDates.
 * By default inclusive of start and end dates.
 */
export function isBetween(
  date: BSDate,
  start: BSDate,
  end: BSDate,
  inclusive = true
): boolean {
  const diffStart = diffInDays(start, date)
  const diffEnd = diffInDays(date, end)

  if (inclusive) {
    return diffStart >= 0 && diffEnd >= 0
  }
  return diffStart > 0 && diffEnd > 0
}

/**
 * Adds a specified number of months to a BSDate.
 * Clamps the day to the target month's maximum length if clampDays is true.
 */
export function addMonths(
  bsDate: BSDate,
  months: number,
  options?: DateMathOptions
): BSDate {
  validateBSDate(bsDate)
  if (months === 0) return { ...bsDate }

  const clamp = options?.clampDays ?? true
  const totalMonths = (bsDate.year * 12 + (bsDate.month - 1)) + months
  const targetYear = Math.floor(totalMonths / 12)
  const targetMonth = ((totalMonths % 12) + 12) % 12 + 1

  const maxDays = getMonthDayCount(targetYear, targetMonth)
  const targetDay = clamp ? Math.min(bsDate.day, maxDays) : bsDate.day

  const result: BSDate = { year: targetYear, month: targetMonth, day: targetDay }
  validateBSDate(result)
  return result
}

/**
 * Adds a specified number of years to a BSDate.
 */
export function addYears(
  bsDate: BSDate,
  years: number,
  options?: DateMathOptions
): BSDate {
  return addMonths(bsDate, years * 12, options)
}

/**
 * Calculates month difference (date2 - date1) in full BS calendar months.
 */
export function diffInMonths(date1: BSDate, date2: BSDate): number {
  validateBSDate(date1)
  validateBSDate(date2)

  const m1 = date1.year * 12 + (date1.month - 1)
  const m2 = date2.year * 12 + (date2.month - 1)
  return m2 - m1
}
