import type { BSDate } from './types.js'
import { validateBSDate, BS_EPOCH, daysBetween } from './utils.js'
import { getMonthLengths } from '../data/bs-month-lengths.js'

/**
 * Converts a Bikram Sambat date to a JavaScript Date (Gregorian/AD).
 * Throws RangeError if the date is outside the supported range or invalid.
 */
export function bsToAd(bsDate: BSDate): Date {
  validateBSDate(bsDate)

  // Count total days from BS 2000 Baishakh 1 to the given BS date
  let totalDays = 0

  for (let y = 2000; y < bsDate.year; y++) {
    const lengths = getMonthLengths(y)
    totalDays += lengths.reduce((sum, len) => sum + len, 0)
  }

  const monthLengths = getMonthLengths(bsDate.year)
  for (let m = 1; m < bsDate.month; m++) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    totalDays += monthLengths[m - 1]!
  }

  totalDays += bsDate.day - 1

  const adDate = new Date(BS_EPOCH)
  adDate.setDate(adDate.getDate() + totalDays)
  return adDate
}

// Re-export daysBetween for use in other modules
export { daysBetween }
