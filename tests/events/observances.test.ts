import { describe, it, expect } from 'vitest'
import {
  listInternationalObservances,
  getInternationalObservanceById,
  getInternationalObservancesByAdDate,
} from '../../src/events/observances.js'

describe('International observance metadata APIs', () => {
  it('lists curated international observances sorted by AD date', () => {
    const items = listInternationalObservances()
    expect(items.length).toBeGreaterThan(20)

    for (let i = 1; i < items.length; i++) {
      const prev = items[i - 1]!
      const curr = items[i]!
      const prevKey = prev.adMonth * 100 + prev.adDay
      const currKey = curr.adMonth * 100 + curr.adDay
      expect(currKey).toBeGreaterThanOrEqual(prevKey)
    }
  })

  it('gets a known observance by id with governance metadata', () => {
    const worldHealth = getInternationalObservanceById('world-health-day')
    expect(worldHealth).not.toBeNull()
    expect(worldHealth!.adMonth).toBe(4)
    expect(worldHealth!.adDay).toBe(7)
    expect(worldHealth!.source.usagePolicy).toBe('manual_reference')
    expect(worldHealth!.source.authorityTier).toBe('secondary_authoritative')
    expect(['high', 'medium', 'baseline']).toContain(worldHealth!.confidence)
  })

  it('returns null for unknown observance id', () => {
    const item = getInternationalObservanceById('missing-observance-id')
    expect(item).toBeNull()
  })

  it('filters observances by Gregorian month/day', () => {
    const items = getInternationalObservancesByAdDate(4, 7)
    expect(items.length).toBeGreaterThan(0)
    expect(items.some(i => i.id === 'world-health-day')).toBe(true)
  })
})

