import { describe, it, expect } from 'vitest'
import { exportToICS, exportMonthToICS } from '../../src/export/index.js'
import type { CalendarEvent } from '../../src/events/types.js'

describe('iCalendar Exporter (export)', () => {
  it('generates valid RFC 5545 .ics string for given events', () => {
    const sampleEvent: CalendarEvent = {
      id: 'test-event-1',
      name: { en: 'New Year', ne: 'नयाँ वर्ष' },
      type: 'festival',
      category: 'national',
      isPublicHoliday: true,
      description: { en: 'Nepali New Year Celebration', ne: 'नेपाली नयाँ वर्ष मनाउने' },
    }

    const ics = exportToICS([
      { event: sampleEvent, bsDate: { year: 2082, month: 1, day: 1 } },
    ])

    expect(ics).toContain('BEGIN:VCALENDAR')
    expect(ics).toContain('VERSION:2.0')
    expect(ics).toContain('SUMMARY:New Year (नयाँ वर्ष)')
    expect(ics).toContain('DTSTART;VALUE=DATE:20250414')
    expect(ics).toContain('END:VCALENDAR')
  })

  it('exportMonthToICS exports all events in a BS month', () => {
    const ics = exportMonthToICS(2082, 1)

    expect(ics).toContain('BEGIN:VCALENDAR')
    expect(ics).toContain('X-WR-CALNAME:Nepali Calendar Events - BS 2082/1')
    expect(ics).toContain('BEGIN:VEVENT')
    expect(ics).toContain('END:VCALENDAR')
  })
})
