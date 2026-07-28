import type { BSDate } from '../converter/types.js'
import type { WorkingDayOptions } from './types.js'
import { bsToAd } from '../converter/bs-to-ad.js'
import { getEventsForDate } from '../events/event-engine.js'
import { addDays, diffInDays, isSameDay } from './date-math.js'

const DEFAULT_WEEKEND_DAYS = [6] // Saturday in Nepal

/**
 * Checks if a given BS date is a working day.
 * Returns false if the day falls on a configured weekend or a public holiday.
 */
export function isWorkingDay(
  bsDate: BSDate,
  options?: WorkingDayOptions
): boolean {
  const weekendDays = options?.weekendDays ?? DEFAULT_WEEKEND_DAYS
  const excludeHolidays = options?.excludeHolidays ?? true

  // 1. Check weekend
  const ad = bsToAd(bsDate)
  const weekday = ad.getUTCDay() // 0 = Sunday, 6 = Saturday
  if (weekendDays.includes(weekday)) {
    return false
  }

  // 2. Check custom holidays
  if (options?.customHolidays !== undefined && options.customHolidays.length > 0) {
    if (options.customHolidays.some(h => isSameDay(h, bsDate))) {
      return false
    }
  }

  // 3. Check official public holidays
  if (excludeHolidays) {
    const events = getEventsForDate(bsDate)
    const isHoliday = events.some(
      e => e.isPublicHoliday || e.type === 'public_holiday'
    )
    if (isHoliday) {
      return false
    }
  }

  return true
}

/**
 * Adds a specified number of working days to a BSDate (skipping weekends & holidays).
 */
export function addWorkingDays(
  bsDate: BSDate,
  days: number,
  options?: WorkingDayOptions
): BSDate {
  if (days === 0) return { ...bsDate }

  const step = days > 0 ? 1 : -1
  let remaining = Math.abs(days)
  let curr = { ...bsDate }

  while (remaining > 0) {
    curr = addDays(curr, step)
    if (isWorkingDay(curr, options)) {
      remaining--
    }
  }

  return curr
}

/**
 * Counts the total number of working days between startDate and endDate.
 * Inclusive of startDate, exclusive of endDate (unless startDate === endDate).
 */
export function getWorkingDaysCount(
  startDate: BSDate,
  endDate: BSDate,
  options?: WorkingDayOptions
): number {
  const diff = diffInDays(startDate, endDate)
  if (diff === 0) {
    return isWorkingDay(startDate, options) ? 1 : 0
  }

  const step = diff > 0 ? 1 : -1
  const stepsCount = Math.abs(diff)
  let count = 0
  let curr = { ...startDate }

  for (let i = 0; i < stepsCount; i++) {
    if (isWorkingDay(curr, options)) {
      count++
    }
    curr = addDays(curr, step)
  }

  return count
}
