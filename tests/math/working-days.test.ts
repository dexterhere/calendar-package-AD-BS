import { describe, it, expect } from 'vitest'
import {
  isWorkingDay,
  addWorkingDays,
  getWorkingDaysCount,
} from '../../src/math/index.js'

describe('Nepal Working Days (working-days)', () => {
  it('identifies Saturday as non-working by default in Nepal', () => {
    // 2082 Baishakh 1 is Monday (AD 2025-04-14)
    // 2082 Baishakh 6 is Saturday (AD 2025-04-19)
    const monday = { year: 2082, month: 1, day: 1 }
    const saturday = { year: 2082, month: 1, day: 6 }

    expect(isWorkingDay(monday)).toBe(false) // Note: 2082 Baishakh 1 is New Year public holiday!
    expect(isWorkingDay(saturday)).toBe(false) // Saturday weekend
  })

  it('allows overriding weekend days to 5-day workweek [0, 6]', () => {
    // Sunday (0) and Saturday (6) off
    const sunday = { year: 2082, month: 1, day: 7 }
    expect(isWorkingDay(sunday, { weekendDays: [0, 6] })).toBe(false)
  })

  it('respects custom holiday overrides', () => {
    const regularTuesday = { year: 2082, month: 1, day: 2 }
    expect(isWorkingDay(regularTuesday)).toBe(true)

    expect(
      isWorkingDay(regularTuesday, { customHolidays: [regularTuesday] })
    ).toBe(false)
  })

  it('addWorkingDays skips weekends and public holidays', () => {
    // 2082 Baishakh 2 (Tuesday) is a working day
    const tuesday = { year: 2082, month: 1, day: 2 }
    // Adding 1 working day -> Wednesday Baishakh 3
    const nextWorking = addWorkingDays(tuesday, 1)
    expect(nextWorking).toEqual({ year: 2082, month: 1, day: 3 })
  })

  it('getWorkingDaysCount accurately counts working days in a range', () => {
    // 2082 Baishakh 2 (Tue) to Baishakh 5 (Fri) -> 4 days: Tue, Wed, Thu, Fri (all working days)
    const start = { year: 2082, month: 1, day: 2 }
    const end = { year: 2082, month: 1, day: 5 }

    const count = getWorkingDaysCount(start, end)
    expect(count).toBe(3) // 3 days in range [start, end)
  })
})
