import type { BSDate, DualDate } from './types.js'
import { bsToAd } from './bs-to-ad.js'
import { adToBs } from './ad-to-bs.js'
import { getWeekdayName } from '../i18n/weekdays.js'
import { getMonthName } from '../i18n/months.js'
import { formatBS, type FormatBSOptions } from '../formatter/index.js'

export { bsToAd as toAD, adToBs as toBS, formatBS, type FormatBSOptions }
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
