import type { BSDate, DualDate } from './types.js'
import { bsToAd } from './bs-to-ad.js'
import { adToBs } from './ad-to-bs.js'
import { getWeekdayName } from '../i18n/weekdays.js'
import { getMonthName } from '../i18n/months.js'

export { bsToAd as toAD, adToBs as toBS }
export type { BSDate, DualDate }

/**
 * Returns the current date as both BS and AD with weekday and month name.
 */
export function today(): DualDate {
  const ad = new Date()
  const bs = adToBs(ad)
  // getUTCDay() for weekday — consistent with the UTC-based date system used throughout
  return {
    bs,
    ad,
    weekday: getWeekdayName(ad.getUTCDay()),
    monthName: getMonthName(bs.month),
  }
}

const FORMAT_TOKENS: Record<string, (date: BSDate) => string> = {
  YYYY: d => String(d.year),
  MM:   d => String(d.month).padStart(2, '0'),
  DD:   d => String(d.day).padStart(2, '0'),
  MMMM: d => getMonthName(d.month).en,
}

/**
 * Formats a BS date as a string.
 * Supported tokens: YYYY, MM, DD, MMMM
 * Default format: "YYYY-MM-DD"
 */
export function formatBS(bsDate: BSDate, format = 'YYYY-MM-DD'): string {
  return format.replace(/YYYY|MMMM|MM|DD/g, token => {
    const fn = FORMAT_TOKENS[token]
    return fn !== undefined ? fn(bsDate) : token
  })
}
