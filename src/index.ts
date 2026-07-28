// ─── Layer 1: Date Conversion & Formatting ────────────────────────────────────
export { toAD, toBS, today, formatBS } from './converter/index.js'
export type { BSDate, DualDate, FormatBSOptions } from './converter/index.js'

export {
  parseBS,
  devanagariToAsciiDigits,
  asciiToDevanagariDigits,
} from './formatter/index.js'

// ─── Layer 1 Ext: Date Math & Nepal Working Days ─────────────────────────────
export {
  addDays,
  subtractDays,
  diffInDays,
  diffInMonths,
  isBefore,
  isAfter,
  isSameDay,
  isBetween,
  addMonths,
  addYears,
  isWorkingDay,
  addWorkingDays,
  getWorkingDaysCount,
} from './math/index.js'
export type { WorkingDayOptions, DateMathOptions } from './math/index.js'

// ─── Layer 2: Calendar Grid ───────────────────────────────────────────────────
export { getMonthCalendar, getMonthDays } from './calendar/month-grid.js'
export { nextMonth, prevMonth, monthRange } from './calendar/navigation.js'
export type { CalendarDay, CalendarMonth, CalendarOptions } from './calendar/types.js'

// ─── Layer 3: Panchang ────────────────────────────────────────────────────────
export { getPanchang, ensurePanchangYear, preloadAllPanchang } from './panchang/panchang-lookup.js'
export type { PanchangInfo } from './panchang/types.js'

// ─── Layer 4: Events & Classification ────────────────────────────────────────
export {
  getEventsForDate,
  getEventsForMonth,
  getAuspiciousDates,
  registerEvents,
} from './events/event-engine.js'
export {
  listInternationalObservances,
  getInternationalObservanceById,
  getInternationalObservancesByAdDate,
} from './events/observances.js'
export { isAuspicious } from './events/classifier.js'
export type {
  CalendarEvent,
  AuspiciousDay,
  AuspiciousClassification,
  EventOrigin,
  EventCategory,
  EventType,
  EventProvenance,
} from './events/types.js'
export type {
  InternationalObservanceMetadata,
  ObservanceConfidence,
} from './events/observances.js'
export type { FallbackOptions } from './panchang/compute-fallback.js'

// ─── Layer 4 Ext: iCalendar (.ics) Exporter ───────────────────────────────────
export { exportToICS, exportMonthToICS } from './export/index.js'
export type { ICSEventPair, ICSExportOptions } from './export/index.js'
