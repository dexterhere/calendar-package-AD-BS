import type { BSDate } from './types.js'
import { BS_EPOCH, BS_YEAR_MIN, BS_YEAR_MAX } from './utils.js'
import { getMonthLengths } from '../data/bs-month-lengths.js'

/**
 * Converts a JavaScript Date (Gregorian/AD) to a Bikram Sambat date.
 * Throws RangeError if the date is outside the supported range.
 */
export function adToBs(adDate: Date): BSDate {
  const epochUtc = Date.UTC(BS_EPOCH.getFullYear(), BS_EPOCH.getMonth(), BS_EPOCH.getDate())
  const targetUtc = Date.UTC(adDate.getFullYear(), adDate.getMonth(), adDate.getDate())

  let remaining = Math.round((targetUtc - epochUtc) / 86_400_000)

  if (remaining < 0) {
    throw new RangeError(
      `Date ${adDate.toISOString().slice(0, 10)} is before BS ${BS_YEAR_MIN} Baishakh 1 (AD 1943-04-14).`
    )
  }

  let year = BS_YEAR_MIN
  let month = 1
  let day = 1

  // Walk through BS years
  while (year <= BS_YEAR_MAX) {
    const lengths = getMonthLengths(year)
    const daysInYear = lengths.reduce((sum, len) => sum + len, 0)

    if (remaining < daysInYear) break

    remaining -= daysInYear
    year++
  }

  if (year > BS_YEAR_MAX) {
    throw new RangeError(
      `Date ${adDate.toISOString().slice(0, 10)} exceeds the supported range (BS ${BS_YEAR_MAX}).`
    )
  }

  // Walk through BS months within the year
  const lengths = getMonthLengths(year)
  for (let m = 0; m < 12; m++) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const daysInMonth = lengths[m]!
    if (remaining < daysInMonth) {
      month = m + 1
      day = remaining + 1
      break
    }
    remaining -= daysInMonth
  }

  return { year, month, day }
}
