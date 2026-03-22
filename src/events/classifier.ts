import type { BSDate } from '../converter/types.js'
import type { AuspiciousClassification } from './types.js'
import { adToBs } from '../converter/ad-to-bs.js'
import { getEventsForDate } from './event-engine.js'

/**
 * Returns the auspicious classification for a given date.
 * Derived from the events attached to that date.
 * TODO Phase 4: implement full classification rules.
 */
export function isAuspicious(date: Date | BSDate): AuspiciousClassification {
  const bsDate: BSDate = date instanceof Date ? adToBs(date) : date
  const events = getEventsForDate(bsDate)

  if (events.some(e => e.type === 'inauspicious_period')) return 'inauspicious'
  if (events.some(e => e.type === 'auspicious_date')) return 'auspicious'
  return 'neutral'
}
