import { describe, it, expect } from 'vitest'
import { BASE_FESTIVALS } from '../../src/data/festivals.js'
import { PUBLIC_HOLIDAYS_2082 } from '../../src/data/public-holidays/2082.js'
import { FESTIVAL_SOURCE_MAP, PUBLIC_HOLIDAY_SOURCE_MAP_2082 } from '../../src/data/source-maps.js'

describe('Data source maps', () => {
  it('covers every base festival id exactly', () => {
    const festivalIds = new Set(BASE_FESTIVALS.map(entry => entry.id))
    const sourceIds = new Set(Object.keys(FESTIVAL_SOURCE_MAP))

    expect(sourceIds).toEqual(festivalIds)
  })

  it('covers every 2082 public holiday id exactly', () => {
    const holidayIds = new Set(PUBLIC_HOLIDAYS_2082.map(entry => entry.id))
    const sourceIds = new Set(Object.keys(PUBLIC_HOLIDAY_SOURCE_MAP_2082))

    expect(sourceIds).toEqual(holidayIds)
  })

  it('enforces non-empty source metadata', () => {
    const allSources = [
      ...Object.values(FESTIVAL_SOURCE_MAP),
      ...Object.values(PUBLIC_HOLIDAY_SOURCE_MAP_2082),
    ]

    for (const source of allSources) {
      expect(source.authority.trim().length).toBeGreaterThan(0)
      expect(source.reference.trim().length).toBeGreaterThan(0)
      expect(source.licenseNote.trim().length).toBeGreaterThan(0)
      expect(source.lastVerifiedBsYear).toBeGreaterThanOrEqual(2000)
      expect(source.lastReviewedIsoDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(['primary_official', 'secondary_authoritative', 'community_reference']).toContain(source.authorityTier)
      expect(['quarterly', 'semiannual', 'annual']).toContain(source.reviewCadence)
      expect(['official', 'manual_reference', 'computed_public_domain']).toContain(source.usagePolicy)
      if (source.usagePolicy === 'manual_reference') {
        expect(source.automationAllowed).toBe(false)
      }
      if (source.usagePolicy === 'official') {
        expect(source.authorityTier).not.toBe('community_reference')
      }
    }
  })
})
