import type { BSDate } from '../converter/types.js'
import { bsToAd } from '../converter/bs-to-ad.js'
import { getMonthName } from '../i18n/months.js'
import { getWeekdayName } from '../i18n/weekdays.js'
import { asciiToDevanagariDigits } from './parser.js'

export { parseBS, devanagariToAsciiDigits, asciiToDevanagariDigits } from './parser.js'

export interface FormatBSOptions {
  /**
   * Output locale for numbers and text tokens.
   * 'en' (default) uses English digits and names.
   * 'ne' uses Devanagari digits (२०८२) and Nepali names (बैशाख, सोमबार).
   */
  locale?: 'en' | 'ne'
}

/**
 * Formats a BS date into a readable string using tokens.
 *
 * Supported tokens:
 * - YYYY / YYYY_NE: Full 4-digit year (e.g. 2082 or २०८२)
 * - YY / YY_NE: 2-digit year (e.g. 82 or ८२)
 * - MMMM / MMMM_NE: Full month name (e.g. Baishakh or बैशाख)
 * - MMM / MMM_NE: Short month name (e.g. Bai or बै)
 * - MM / MM_NE: 2-digit month (01–12 or ०१–१२)
 * - M / M_NE: 1-or-2 digit month (1–12 or १–१२)
 * - DD / DD_NE: 2-digit day (01–32 or ०१–३२)
 * - D / D_NE: 1-or-2 digit day (1–32 or १–३२)
 * - dddd / dddd_NE: Full weekday name (e.g. Monday or सोमबार)
 * - ddd / ddd_NE: Short weekday name (e.g. Mon or सोम)
 */
export function formatBS(
  bsDate: BSDate,
  format = 'YYYY-MM-DD',
  options?: FormatBSOptions
): string {
  const isNe = options?.locale === 'ne'

  const ad = bsToAd(bsDate)
  const weekday = getWeekdayName(ad.getUTCDay())
  const monthName = getMonthName(bsDate.month)

  const tokens: Record<string, string> = {
    YYYY_NE: asciiToDevanagariDigits(String(bsDate.year)),
    YY_NE: asciiToDevanagariDigits(String(bsDate.year).slice(-2)),
    MMMM_NE: monthName.ne,
    MMM_NE: monthName.ne,
    MM_NE: asciiToDevanagariDigits(String(bsDate.month).padStart(2, '0')),
    M_NE: asciiToDevanagariDigits(String(bsDate.month)),
    DD_NE: asciiToDevanagariDigits(String(bsDate.day).padStart(2, '0')),
    D_NE: asciiToDevanagariDigits(String(bsDate.day)),
    dddd_NE: weekday.ne,
    ddd_NE: weekday.ne.slice(0, 3),

    YYYY: isNe ? asciiToDevanagariDigits(String(bsDate.year)) : String(bsDate.year),
    YY: isNe ? asciiToDevanagariDigits(String(bsDate.year).slice(-2)) : String(bsDate.year).slice(-2),
    MMMM: isNe ? monthName.ne : monthName.en,
    MMM: isNe ? monthName.ne : monthName.en.slice(0, 3),
    MM: isNe ? asciiToDevanagariDigits(String(bsDate.month).padStart(2, '0')) : String(bsDate.month).padStart(2, '0'),
    M: isNe ? asciiToDevanagariDigits(String(bsDate.month)) : String(bsDate.month),
    DD: isNe ? asciiToDevanagariDigits(String(bsDate.day).padStart(2, '0')) : String(bsDate.day).padStart(2, '0'),
    D: isNe ? asciiToDevanagariDigits(String(bsDate.day)) : String(bsDate.day),
    dddd: isNe ? weekday.ne : weekday.en,
    ddd: isNe ? weekday.ne.slice(0, 3) : weekday.en.slice(0, 3),
  }

  const pattern = /YYYY_NE|YY_NE|MMMM_NE|MMM_NE|MM_NE|M_NE|DD_NE|D_NE|dddd_NE|ddd_NE|YYYY|YY|MMMM|MMM|MM|M|DD|D|dddd|ddd/g

  return format.replace(pattern, match => tokens[match] ?? match)
}
