import type { BSDate } from '../converter/types.js'
import type { CalendarEvent, AuspiciousDay, EventCategory } from './types.js'
import { adToBs } from '../converter/ad-to-bs.js'
import { bsToAd } from '../converter/bs-to-ad.js'
import { getMonthDayCount } from '../data/bs-month-lengths.js'
import { getPanchang } from '../panchang/panchang-lookup.js'
import { BASE_FESTIVALS } from '../data/festivals.js'
import { PUBLIC_HOLIDAYS_2082 } from '../data/public-holidays/2082.js'

// Runtime-injected events (added via registerEvents())
let injectedEvents: CalendarEvent[] = []

const FESTIVAL_IDS_BY_NAME = new Map<string, string[]>()
for (const festival of BASE_FESTIVALS) {
  const normalized = normalizeEventName(festival.name.en)
  const ids = FESTIVAL_IDS_BY_NAME.get(normalized) ?? []
  ids.push(festival.id)
  FESTIVAL_IDS_BY_NAME.set(normalized, ids)
}

const PUBLIC_HOLIDAY_FIXED_DATES_2082 = new Map<string, { month: number; day: number; duration?: number }>([
  ['2082-new-year', { month: 1, day: 1 }],
])

/**
 * Merges custom events into the base dataset for the current runtime session.
 * Called once at app startup (e.g., with events from the MeroEvent admin panel).
 */
export function registerEvents(events: CalendarEvent[]): void {
  injectedEvents = [
    ...injectedEvents,
    ...events.map(event => withRuntimeProvenance(event)),
  ]
}

/**
 * Get all resolved festival dates for a specific BS date
 */
function getResolvedFestivalsForDate(bsDate: BSDate): CalendarEvent[] {
  const events: CalendarEvent[] = []
  const { month, day } = bsDate
  const panchang = getPanchang(bsDate)

  for (const festival of BASE_FESTIVALS) {
    let isMatch = false

    if (festival.method === 'fixed_bs_date') {
      const duration = festival.duration ?? 1
      const festMonth = festival.month
      const festDay = festival.day
      if (
        festMonth !== undefined &&
        festDay !== undefined &&
        festMonth === month &&
        day >= festDay &&
        day < festDay + duration
      ) {
        isMatch = true
      }
    } else if (festival.method === 'tithi_based' && panchang !== null) {
      const tithiMatches = festival.tithi === panchang.tithi.number
      const pakshaMatches = festival.paksha === panchang.paksha
      const monthMatches = festival.searchMonth === undefined ||
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
    } else if (festival.method === 'fixed_ad_date' && festival.adMonth !== undefined && festival.adDay !== undefined) {
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
        provenance: {
          origin: 'base_festival',
          sourceKind: 'rule_based',
          reference: `BASE_FESTIVALS:${festival.id}`,
        },
      }

      if (festival.description !== undefined) {
        event.description = festival.description
      }

      events.push(event)
    }
  }

  return events
}

function getPublicHolidaysForDate(bsDate: BSDate, festivalEvents: readonly CalendarEvent[]): CalendarEvent[] {
  if (bsDate.year !== 2082) return []

  const festivalIds = new Set(festivalEvents.map(event => event.id))
  const holidaysForDate: CalendarEvent[] = []

  for (const holiday of PUBLIC_HOLIDAYS_2082) {
    const mirroredFestivalId = resolveMirroredFestivalId(holiday.name.en)

    if (mirroredFestivalId !== undefined) {
      if (!festivalIds.has(mirroredFestivalId)) continue
      holidaysForDate.push(withGovernmentProvenance(holiday, bsDate.year))
      continue
    }

    const fixedDate = PUBLIC_HOLIDAY_FIXED_DATES_2082.get(holiday.id)
    if (fixedDate === undefined) continue

    const duration = fixedDate.duration ?? 1
    const inDateRange = bsDate.month === fixedDate.month &&
      bsDate.day >= fixedDate.day &&
      bsDate.day < fixedDate.day + duration
    if (!inDateRange) continue

    holidaysForDate.push(withGovernmentProvenance(holiday, bsDate.year))
  }

  return holidaysForDate
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
  const festivalEvents = getResolvedFestivalsForDate(bsDate)
  const yearHolidays = getPublicHolidaysForDate(bsDate, festivalEvents)

  // Add injected custom events (from runtime registration)
  const customEvents = injectedEvents.filter(_event => {
    // Custom events can have date information embedded in their ID or metadata
    // For now, they're returned for all dates (can be enhanced with date filtering)
    return false // Custom events need date metadata to filter properly
  })
  const mergedById = new Map<string, CalendarEvent>()
  for (const event of festivalEvents) {
    mergedById.set(event.id, event)
  }

  for (const holiday of yearHolidays) {
    const mirroredFestivalId = extractMirroredFestivalId(holiday.provenance?.reference)
    if (mirroredFestivalId !== undefined) {
      const mirroredFestival = mergedById.get(mirroredFestivalId)
      if (mirroredFestival !== undefined) {
        const holidayReference = holiday.provenance?.reference
        const festivalProvenance = mirroredFestival.provenance
        const festivalReference = festivalProvenance?.reference
        if (
          holidayReference !== undefined &&
          festivalProvenance !== undefined &&
          festivalReference !== undefined &&
          !festivalReference.includes(holidayReference)
        ) {
          mirroredFestival.provenance = {
            ...festivalProvenance,
            reference: `${festivalReference}; ${holidayReference}`,
          }
        }

        if (holiday.isPublicHoliday && !mirroredFestival.isPublicHoliday) {
          mirroredFestival.isPublicHoliday = true
        }
        continue
      }
    }

    if (!mergedById.has(holiday.id)) {
      mergedById.set(holiday.id, holiday)
    }
  }

  for (const customEvent of customEvents) {
    if (!mergedById.has(customEvent.id)) {
      mergedById.set(customEvent.id, customEvent)
    }
  }

  const uniqueEvents = [...mergedById.values()]

  // Sort: public holidays first, then by type priority
  uniqueEvents.sort((a, b) => {
    if (a.isPublicHoliday !== b.isPublicHoliday) return a.isPublicHoliday ? -1 : 1
    const typePriority: Record<string, number> = { public_holiday: 1, festival: 2, auspicious_date: 3, inauspicious_period: 4, custom: 5 }
    return (typePriority[a.type] ?? 9) - (typePriority[b.type] ?? 9)
  })

  return uniqueEvents
}

function withGovernmentProvenance(event: CalendarEvent, bsYear: number): CalendarEvent {
  const matchedFestivalId = resolveMirroredFestivalId(event.name.en)

  const baseReference = `PUBLIC_HOLIDAYS_${bsYear}:${event.id}`
  const reference = matchedFestivalId === undefined
    ? baseReference
    : `${baseReference}; mirrors BASE_FESTIVALS:${matchedFestivalId}`

  return {
    ...event,
    provenance: {
      origin: 'government_holiday',
      sourceKind: 'government_declared',
      reference,
    },
  }
}

function withRuntimeProvenance(event: CalendarEvent): CalendarEvent {
  return {
    ...event,
    provenance: {
      origin: 'runtime_injected',
      sourceKind: 'runtime_injected',
      reference: `registerEvents:${event.id}`,
    },
  }
}

function normalizeEventName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

function resolveMirroredFestivalId(eventNameEn: string): string | undefined {
  const matchedFestivalIds = FESTIVAL_IDS_BY_NAME.get(normalizeEventName(eventNameEn))
  return matchedFestivalIds?.[0]
}

function extractMirroredFestivalId(reference: string | undefined): string | undefined {
  if (reference === undefined) return undefined
  const match = /mirrors BASE_FESTIVALS:([a-z0-9-]+)/.exec(reference)
  return match?.[1]
}

/**
 * Returns all events for a given BS month.
 * Aggregates getEventsForDate across all days in the month.
 */
export function getEventsForMonth(bsYear: number, bsMonth: number): CalendarEvent[] {
  const allEvents: CalendarEvent[] = []
  const seenIds = new Set<string>()

  const daysInMonth = getMonthDayCount(bsYear, bsMonth)

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

  const daysInMonth = getMonthDayCount(bsYear, bsMonth)

  for (let day = 1; day <= daysInMonth; day++) {
    const bsDate: BSDate = { year: bsYear, month: bsMonth, day }
    const adDate = bsToAd(bsDate)
    const events = getEventsForDate(bsDate)

    // Filter by category if specified
    const filteredEvents = category !== undefined
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
    const eventsForDay = category !== undefined ? filteredEvents : events
    const hasCategoryMatch = category === undefined || filteredEvents.length > 0

    if (hasCategoryMatch && (eventsForDay.length > 0 || classification !== 'neutral')) {
      auspiciousDays.push({
        bs: bsDate,
        ad: adDate,
        classification,
        events: eventsForDay,
      })
    }
  }

  return auspiciousDays
}
