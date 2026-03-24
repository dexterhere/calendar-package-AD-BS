import type { BSDate } from '../converter/types.js'
import type { CalendarEvent, AuspiciousDay, EventCategory } from './types.js'
import { adToBs } from '../converter/ad-to-bs.js'
import { bsToAd } from '../converter/bs-to-ad.js'
import { getMonthDayCount } from '../data/bs-month-lengths.js'
import { getPanchang } from '../panchang/panchang-lookup.js'
import { BASE_FESTIVALS, type FestivalDefinition } from '../data/festivals.js'
import { PUBLIC_HOLIDAYS_2082 } from '../data/public-holidays/2082.js'

// Runtime-injected events (added via registerEvents())
let injectedEvents: CalendarEvent[] = []

/**
 * Merges custom events into the base dataset for the current runtime session.
 * Called once at app startup (e.g., with events from the MeroEvent admin panel).
 */
export function registerEvents(events: CalendarEvent[]): void {
  injectedEvents = [...injectedEvents, ...events]
}

/**
 * Resolve tithi-based festivals for a given year
 * Searches through the specified month to find the matching tithi
 */
function resolveTithiBasedFestival(
  festival: FestivalDefinition,
  bsYear: number
): BSDate[] {
  const dates: BSDate[] = []

  if (!festival.tithi || !festival.paksha || !festival.searchMonth) {
    return dates
  }

  const searchMonths = festival.searchMonth === 1
    ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] // All months for Ekadashi
    : [festival.searchMonth]

  for (const month of searchMonths) {
    // Get number of days in the month
    let daysInMonth = 30
    try {
      daysInMonth = getMonthDayCount(bsYear, month)
    } catch {
      // Fallback if not available
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const bsDate: BSDate = { year: bsYear, month, day }
      const panchang = getPanchang(bsDate)

      if (!panchang) continue

      // Check if tithi and paksha match
      const tithiMatches = panchang.tithi.number === festival.tithi
      const pakshaMatches = panchang.paksha === festival.paksha

      if (tithiMatches && pakshaMatches) {
        dates.push(bsDate)
        // Only add first match unless it's a multi-day festival
        if (!festival.tithiDuration || festival.tithiDuration === 1) {
          break
        }
      }

      // Handle multi-day festivals
      if (festival.tithiDuration && festival.tithiDuration > 1 && tithiMatches && pakshaMatches) {
        for (let offset = 1; offset < festival.tithiDuration; offset++) {
          const nextDay = day + offset
          if (nextDay <= daysInMonth) {
            dates.push({ year: bsYear, month, day: nextDay })
          }
        }
        break
      }
    }
  }

  return dates
}

/**
 * Get fixed BS date festivals for a given year
 */
function resolveFixedDateFestival(
  festival: FestivalDefinition,
  bsYear: number
): BSDate[] {
  const dates: BSDate[] = []

  if (!festival.month || !festival.day) {
    return dates
  }

  const duration = festival.duration || 1

  // Get actual days in month
  let daysInMonth = 30
  try {
    daysInMonth = getMonthDayCount(bsYear, festival.month)
  } catch {
    // Fallback
  }

  for (let i = 0; i < duration; i++) {
    const day = festival.day + i
    if (day <= daysInMonth) {
      dates.push({ year: bsYear, month: festival.month!, day })
    }
  }

  return dates
}

/**
 * Get all resolved festival dates for a specific BS date
 */
function getResolvedFestivalsForDate(bsDate: BSDate): CalendarEvent[] {
  const events: CalendarEvent[] = []
  const { year, month, day } = bsDate
  const panchang = getPanchang(bsDate)

  for (const festival of BASE_FESTIVALS) {
    let isMatch = false

    if (festival.method === 'fixed_bs_date') {
      const duration = festival.duration || 1
      if (
        festival.month === month &&
        day >= festival.day! &&
        day < festival.day! + duration
      ) {
        isMatch = true
      }
    } else if (festival.method === 'tithi_based' && panchang) {
      const tithiMatches = festival.tithi === panchang.tithi.number
      const pakshaMatches = festival.paksha === panchang.paksha
      const monthMatches = !festival.searchMonth ||
        festival.searchMonth === 1 || // All months (like Ekadashi)
        festival.searchMonth === month

      if (tithiMatches && pakshaMatches && monthMatches) {
        isMatch = true
      }

      // Kshaya tithi: the festival's tithi completes entirely within this solar day
      // without appearing at sunrise. Its observance falls on today (the preceding day).
      // e.g. today tithi=10 (Dashami), tithiType='kshaya' → Ekadashi (11) is kshaya here.
      if (!isMatch && panchang.tithiType === 'kshaya' && festival.tithi !== undefined && monthMatches) {
        const kshayaTithi = (panchang.tithi.number % 30) + 1
        const kshayaPaksha: 'shukla' | 'krishna' = kshayaTithi <= 15 ? 'shukla' : 'krishna'
        if (festival.tithi === kshayaTithi && festival.paksha === kshayaPaksha) {
          isMatch = true
        }
      }
    } else if (festival.method === 'fixed_ad_date' && festival.adMonth && festival.adDay) {
      const adDate = bsToAd(bsDate)
      if (adDate.getUTCMonth() + 1 === festival.adMonth && adDate.getUTCDate() === festival.adDay) {
        isMatch = true
      }
    }

    if (isMatch) {
      const event: CalendarEvent = {
        id: festival.id,
        name: festival.name,
        type: festival.type,
        category: festival.category,
        isPublicHoliday: festival.isPublicHoliday,
      }

      if (festival.description) {
        event.description = festival.description
      }

      events.push(event)
    }
  }

  return events
}

/**
 * Get public holidays for a specific BS year
 */
function getPublicHolidaysForYear(bsYear: number): CalendarEvent[] {
  // Currently only 2082 is defined
  if (bsYear === 2082) {
    return [...PUBLIC_HOLIDAYS_2082]
  }
  return []
}

/**
 * Returns all events for a specific date.
 * Combines:
 * - Resolved tithi-based festivals
 * - Fixed BS date festivals
 * - Government public holidays
 * - Runtime-injected custom events
 */
export function getEventsForDate(date: Date | BSDate): CalendarEvent[] {
  const bsDate: BSDate = date instanceof Date ? adToBs(date) : date
  const events: CalendarEvent[] = []

  // Get resolved festivals for this date
  const festivalEvents = getResolvedFestivalsForDate(bsDate)
  events.push(...festivalEvents)

  // Get public holidays for this year
  const yearHolidays = getPublicHolidaysForYear(bsDate.year)
  events.push(...yearHolidays)

  // Add injected custom events (from runtime registration)
  const customEvents = injectedEvents.filter(event => {
    // Custom events can have date information embedded in their ID or metadata
    // For now, they're returned for all dates (can be enhanced with date filtering)
    return false // Custom events need date metadata to filter properly
  })
  events.push(...customEvents)

  // Remove duplicates by ID
  const uniqueEvents = events.filter((event, index, self) =>
    index === self.findIndex(e => e.id === event.id)
  )

  // Sort: public holidays first, then by type priority
  uniqueEvents.sort((a, b) => {
    if (a.isPublicHoliday !== b.isPublicHoliday) return a.isPublicHoliday ? -1 : 1
    const typePriority: Record<string, number> = { public_holiday: 1, festival: 2, auspicious_date: 3, inauspicious_period: 4, custom: 5 }
    return (typePriority[a.type] ?? 9) - (typePriority[b.type] ?? 9)
  })

  return uniqueEvents
}

/**
 * Returns all events for a given BS month.
 * Aggregates getEventsForDate across all days in the month.
 */
export function getEventsForMonth(bsYear: number, bsMonth: number): CalendarEvent[] {
  const allEvents: CalendarEvent[] = []
  const seenIds = new Set<string>()

  // Get number of days in the month
  let daysInMonth = 30
  try {
    daysInMonth = getMonthDayCount(bsYear, bsMonth)
  } catch {
    // Fallback
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const bsDate: BSDate = { year: bsYear, month: bsMonth, day }
    const dayEvents = getEventsForDate(bsDate)

    for (const event of dayEvents) {
      if (!seenIds.has(event.id)) {
        seenIds.add(event.id)
        allEvents.push(event)
      }
    }
  }

  return allEvents
}

/**
 * Returns auspicious days in a given BS month, optionally filtered by category.
 */
export function getAuspiciousDates(
  bsYear: number,
  bsMonth: number,
  category?: EventCategory
): AuspiciousDay[] {
  const auspiciousDays: AuspiciousDay[] = []

  // Get number of days in the month
  let daysInMonth = 30
  try {
    daysInMonth = getMonthDayCount(bsYear, bsMonth)
  } catch {
    // Fallback
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const bsDate: BSDate = { year: bsYear, month: bsMonth, day }
    const adDate = bsToAd(bsDate)
    const events = getEventsForDate(bsDate)

    // Filter by category if specified
    const filteredEvents = category
      ? events.filter(e => e.category === category)
      : events

    // Determine classification
    let classification: 'auspicious' | 'inauspicious' | 'neutral' = 'neutral'

    if (events.some(e => e.type === 'inauspicious_period')) {
      classification = 'inauspicious'
    } else if (events.some(e => e.type === 'auspicious_date' || e.type === 'festival')) {
      classification = 'auspicious'
    }

    // Only include days with events or specific classifications
    if (filteredEvents.length > 0 || classification !== 'neutral') {
      auspiciousDays.push({
        bs: bsDate,
        ad: adDate,
        classification,
        events: filteredEvents,
      })
    }
  }

  return auspiciousDays
}
