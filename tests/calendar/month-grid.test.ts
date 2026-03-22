import { describe, it, expect } from 'vitest'
import { getMonthCalendar, getMonthDays } from '../../src/calendar/month-grid.js'

describe('getMonthDays', () => {
  it.todo('returns correct days for BS 2082 Baishakh (should be 31)')
  it.todo('returns correct days for BS 2082 Ashadh (should be 31)')
})

describe('getMonthCalendar', () => {
  it.todo('grid has 35 or 42 days (5 or 6 complete week rows)')
  it.todo('correct startWeekday for BS 2082 Baishakh')
  it.todo('isCurrentMonth is false for overflow days')
  it.todo('isToday is true for exactly one day when current month')
  it.todo('adjacent month overflow days fill complete weeks')
})
