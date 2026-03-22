import type { BSDate } from '../converter/types.js'

/**
 * Returns the BS year/month for the next month.
 */
export function nextMonth(bsYear: number, bsMonth: number): { year: number; month: number } {
  return bsMonth === 12
    ? { year: bsYear + 1, month: 1 }
    : { year: bsYear, month: bsMonth + 1 }
}

/**
 * Returns the BS year/month for the previous month.
 */
export function prevMonth(bsYear: number, bsMonth: number): { year: number; month: number } {
  return bsMonth === 1
    ? { year: bsYear - 1, month: 12 }
    : { year: bsYear, month: bsMonth - 1 }
}

/**
 * Returns all BS year/month pairs in a date range (inclusive).
 */
export function monthRange(
  from: BSDate,
  to: BSDate
): Array<{ year: number; month: number }> {
  const result: Array<{ year: number; month: number }> = []
  let y = from.year
  let m = from.month

  while (y < to.year || (y === to.year && m <= to.month)) {
    result.push({ year: y, month: m })
    if (m === 12) { y++; m = 1 } else { m++ }
  }

  return result
}
