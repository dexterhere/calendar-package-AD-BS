export type AuspiciousClassification = 'auspicious' | 'inauspicious' | 'neutral'

export type EventOrigin = 'base_festival' | 'government_holiday' | 'runtime_injected'

export interface EventProvenance {
  origin: EventOrigin
  sourceKind: 'rule_based' | 'government_declared' | 'runtime_injected'
  reference: string
}

export type EventType =
  | 'festival'
  | 'public_holiday'
  | 'auspicious_date'
  | 'inauspicious_period'
  | 'custom'

export type EventCategory =
  | 'wedding'
  | 'bratabandha'
  | 'religious'
  | 'national'
  | 'cultural'
  | 'general'

export interface CalendarEvent {
  id: string
  name: { en: string; ne: string }
  type: EventType
  category?: EventCategory
  description?: { en: string; ne: string }
  isPublicHoliday: boolean
  provenance?: EventProvenance
}

export interface AuspiciousDay {
  bs: import('../converter/types.js').BSDate
  ad: Date
  classification: AuspiciousClassification
  events: CalendarEvent[]
}
