import type { BSDate } from '../converter/types.js'

/**
 * Options for working day calculations in Nepal.
 */
export interface WorkingDayOptions {
  /**
   * Weekday indexes to consider as weekends.
   * 0 = Sunday, 1 = Monday, 2 = Tuesday, 3 = Wednesday, 4 = Thursday, 5 = Friday, 6 = Saturday.
   * Default: [6] (Saturday, standard weekly off in Nepal).
   */
  weekendDays?: number[]

  /**
   * Whether to exclude government public holidays from working days.
   * Default: true.
   */
  excludeHolidays?: boolean

  /**
   * Custom array of BSDates to treat as additional holidays or non-working days.
   */
  customHolidays?: BSDate[]
}

/**
 * Options for date addition/subtraction.
 */
export interface DateMathOptions {
  /**
   * If true, clamp day to target month's maximum length when adding months or years.
   * Default: true.
   */
  clampDays?: boolean
}
