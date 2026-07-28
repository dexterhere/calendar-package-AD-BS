import type { CalendarEvent } from '../events/types.js'
import type { BSDate } from '../converter/types.js'

export interface ICSEventPair {
  event: CalendarEvent
  bsDate: BSDate
}

export interface ICSExportOptions {
  /**
   * Calendar product identifier (PRODID).
   * Default: "-//Nepali Calendar Engine//NONSGML v0.2.0//EN"
   */
  prodId?: string

  /**
   * Calendar name (X-WR-CALNAME).
   * Default: "Nepali Calendar Events"
   */
  calName?: string

  /**
   * Timezone description for exported calendar.
   * Default: "Asia/Kathmandu"
   */
  timezone?: string
}
