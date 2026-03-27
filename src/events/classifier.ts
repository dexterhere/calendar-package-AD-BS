import type { BSDate } from '../converter/types.js'
import type { AuspiciousClassification } from './types.js'
import { adToBs } from '../converter/ad-to-bs.js'
import { getEventsForDate } from './event-engine.js'
import { getPanchang } from '../panchang/panchang-lookup.js'

/**
 * Returns the auspicious classification for a given date.
 * 
 * Classification rules:
 * - inauspicious: Dates with inauspicious_period events (e.g., Ekadashi fasting days, Pitru Paksha)
 * - auspicious: Dates with festivals, auspicious_date events, or special tithis (Purnima, etc.)
 * - neutral: All other dates
 * 
 * Priority: inauspicious > auspicious > neutral
 */
export function isAuspicious(date: Date | BSDate): AuspiciousClassification {
  const bsDate: BSDate = date instanceof Date ? adToBs(date) : date
  const events = getEventsForDate(bsDate)
  const panchang = getPanchang(bsDate)

  // Check for inauspicious periods first (highest priority)
  if (events.some(e => e.type === 'inauspicious_period')) {
    return 'inauspicious'
  }

  // Check for auspicious events
  if (events.some(e => e.type === 'auspicious_date')) {
    return 'auspicious'
  }

  // Festivals are generally auspicious
  if (events.some(e => e.type === 'festival')) {
    return 'auspicious'
  }

  // Check panchang for special tithis
  if (panchang) {
    // Purnima (full moon) is auspicious
    if (panchang.tithi.number === 15) {
      return 'auspicious'
    }
    // Amavasya (new moon) can be inauspicious for weddings but auspicious for certain rituals
    if (panchang.tithi.number === 30) {
      return 'neutral' // Context-dependent
    }
  }

  // Default to neutral
  return 'neutral'
}

/**
 * Enhanced classification that considers specific event categories
 * for wedding, bratabandha, and grihapravesh muhurat.
 */
export function classifyDateForPurpose(
  date: Date | BSDate,
  purpose: 'wedding' | 'bratabandha' | 'grihapravesh' | 'general'
): AuspiciousClassification {
  const bsDate: BSDate = date instanceof Date ? adToBs(date) : date
  const events = getEventsForDate(bsDate)
  const panchang = getPanchang(bsDate)
  const baseClassification = isAuspicious(date)

  // If base is inauspicious, it's generally not good for any purpose
  if (baseClassification === 'inauspicious') {
    return 'inauspicious'
  }

  // Check for specific auspicious markers
  if (purpose === 'wedding') {
    // Weddings need explicitly auspicious dates
    if (events.some(e => e.category === 'wedding' || e.type === 'auspicious_date')) {
      return 'auspicious'
    }
    // Avoid Ekadashi, Purnima, Amavasya for weddings
    if (panchang) {
      if (panchang.tithi.number === 11 || panchang.tithi.number === 15 || panchang.tithi.number === 30) {
        return 'neutral' // Not ideal but not forbidden
      }
    }
  }

  if (purpose === 'bratabandha') {
    // Bratabandha (sacred thread ceremony) is auspicious on religious festivals
    if (events.some(e => e.category === 'religious')) {
      return 'auspicious'
    }
  }

  if (purpose === 'grihapravesh') {
    // House warming - look for auspicious_date events
    if (events.some(e => e.type === 'auspicious_date')) {
      return 'auspicious'
    }
  }

  return baseClassification
}
