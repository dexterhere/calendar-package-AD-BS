import type { BSDate } from '../converter/types.js'
import type { PanchangInfo } from '../panchang/types.js'
import type { CalendarEvent, AuspiciousClassification } from '../events/types.js'

export interface CalendarDay {
  bs: BSDate
  ad: Date
  weekday: { en: string; ne: string }
  isToday: boolean
  isCurrentMonth: boolean
  panchang: PanchangInfo | null
  events: CalendarEvent[]
  classification: AuspiciousClassification
}

export interface CalendarMonth {
  year: number
  month: number
  monthName: { en: string; ne: string }
  totalDays: number
  startWeekday: number  // 0 = Sunday, 6 = Saturday
  days: CalendarDay[]
}

export interface CalendarOptions {
  includeAdjacentDays?: boolean  // default: true
  enrichPanchang?: boolean       // default: true
  enrichEvents?: boolean         // default: true
}
