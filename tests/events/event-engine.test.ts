import { describe, it, expect, beforeEach } from 'vitest'
import { getEventsForDate, registerEvents } from '../../src/events/event-engine.js'

describe('registerEvents', () => {
  it.todo('merges custom events with the base dataset')
  it.todo('registered events are returned by getEventsForDate')
})

describe('getEventsForDate', () => {
  it.todo('returns empty array for a date with no events')
  it.todo('returns festival events for Dashain Tika day')
  it.todo('returns public holiday events for public holidays')
})
