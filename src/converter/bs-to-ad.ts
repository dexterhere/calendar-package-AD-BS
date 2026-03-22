import type { BSDate } from './types.js'
import { validateBSDate, BS_EPOCH_UTC_MS, MS_PER_DAY, utcMsToDate } from './utils.js'
import {
  yearDayOffsets,
  monthDayOffsets,
  BS_DATA_YEAR_MIN,
} from '../data/bs-month-lengths.js'

/**
 * Converts a Bikram Sambat date to a JavaScript Date (Gregorian/AD).
 *
 * The returned Date is set to UTC midnight of the corresponding Gregorian date.
 * Always read the result using getUTCFullYear / getUTCMonth / getUTCDate to
 * avoid timezone-dependent off-by-one errors.
 *
 * Complexity: O(1) — uses precomputed cumulative day-offset tables.
 * Throws RangeError for invalid or out-of-range inputs.
 */
export function bsToAd(bsDate: BSDate): Date {
  validateBSDate(bsDate)

  const yi = bsDate.year - BS_DATA_YEAR_MIN
  const mi = bsDate.month - 1

  // Total days from epoch to this BS date:
  //   days to start of year  +  days to start of month within year  +  (day - 1)
  const totalDays =
    (yearDayOffsets[yi] as number) +
    (monthDayOffsets[yi * 12 + mi] as number) +
    bsDate.day - 1

  return utcMsToDate(BS_EPOCH_UTC_MS + totalDays * MS_PER_DAY)
}
