export type AuspiciousClassification = 'auspicious' | 'inauspicious' | 'neutral'

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
}

export interface AuspiciousDay {
  bs: import('../converter/types.js').BSDate
  ad: Date
  classification: AuspiciousClassification
  events: CalendarEvent[]
}
