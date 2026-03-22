import type { BSDate } from '../converter/types.js'
import type { CalendarEvent, AuspiciousDay, EventCategory } from './types.js'
import { adToBs } from '../converter/ad-to-bs.js'

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
 * Returns all events for a specific date.
 * TODO Phase 4: implement rule-based festival resolution and static dataset lookup.
 */
export function getEventsForDate(date: Date | BSDate): CalendarEvent[] {
  const bsDate: BSDate = date instanceof Date ? adToBs(date) : date
  void bsDate
  return injectedEvents.filter(_event => false) // stub
}

/**
 * Returns all events for a given BS month.
 * TODO Phase 4: aggregate getEventsForDate across all days in the month.
 */
export function getEventsForMonth(bsYear: number, bsMonth: number): CalendarEvent[] {
  void bsYear
  void bsMonth
  return []
}

/**
 * Returns auspicious days in a given BS month, optionally filtered by category.
 * TODO Phase 4: implement classification logic.
 */
export function getAuspiciousDates(
  bsYear: number,
  bsMonth: number,
  category?: EventCategory
): AuspiciousDay[] {
  void bsYear
  void bsMonth
  void category
  return []
}
