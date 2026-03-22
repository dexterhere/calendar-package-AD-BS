// ─── Layer 1: Date Conversion ────────────────────────────────────────────────
export { toAD, toBS, today, formatBS } from './converter/index.js'
export type { BSDate, DualDate } from './converter/types.js'

// ─── Layer 2: Calendar Grid ───────────────────────────────────────────────────
export { getMonthCalendar, getMonthDays } from './calendar/month-grid.js'
export { nextMonth, prevMonth, monthRange } from './calendar/navigation.js'
export type { CalendarDay, CalendarMonth, CalendarOptions } from './calendar/types.js'

// ─── Layer 3: Panchang ────────────────────────────────────────────────────────
export { getPanchang } from './panchang/panchang-lookup.js'
export type { PanchangInfo } from './panchang/types.js'

// ─── Layer 4: Events & Classification ────────────────────────────────────────
export {
  getEventsForDate,
  getEventsForMonth,
  getAuspiciousDates,
  registerEvents,
} from './events/event-engine.js'
export { isAuspicious } from './events/classifier.js'
export type {
  CalendarEvent,
  AuspiciousDay,
  AuspiciousClassification,
  EventCategory,
  EventType,
} from './events/types.js'
