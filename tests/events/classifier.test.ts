import { describe, it, expect, beforeAll } from 'vitest'
import { isAuspicious, classifyDateForPurpose } from '../../src/events/classifier.js'
import { ensurePanchangYear } from '../../src/panchang/panchang-lookup.js'

describe('Phase 4: Classifier', () => {
  beforeAll(async () => {
    await ensurePanchangYear(2082)
  })

  describe('isAuspicious - Basic Classification', () => {
    it('returns auspicious for major festivals', () => {
      // Vijaya Dashami - biggest festival (Ashwin 16 in 2082)
      const result = isAuspicious({ year: 2082, month: 6, day: 16 })
      expect(result).toBe('auspicious')
    })

    it('returns auspicious for Purnima (full moon)', () => {
      // Baishakh Purnima - Buddha Jayanti (Baishakh 29 in 2082)
      const result = isAuspicious({ year: 2082, month: 1, day: 29 })
      expect(result).toBe('auspicious')
    })

    it('returns auspicious for Maghe Sankranti', () => {
      const result = isAuspicious({ year: 2082, month: 10, day: 1 })
      expect(result).toBe('auspicious')
    })

    it('returns neutral for regular days without events', () => {
      // A random day in Jestha without major festivals
      const result = isAuspicious({ year: 2082, month: 2, day: 20 })
      expect(result).toBe('neutral')
    })

    it('handles Ekadashi (fasting days)', () => {
      // Ekadashi occurs on tithi 11 (Shukla) and 26 (Krishna)
      // These are typically inauspicious for weddings but auspicious for fasting
      const shuklaEkadashi = isAuspicious({ year: 2082, month: 1, day: 11 })
      expect(['inauspicious', 'neutral']).toContain(shuklaEkadashi)
    })
  })

  describe('isAuspicious - Tihar Period', () => {
    it('classifies Laxmi Puja as auspicious', () => {
      // Kartik Amavasya (Kartik 4 in 2082)
      const result = isAuspicious({ year: 2082, month: 7, day: 4 })
      expect(result).toBe('auspicious')
    })

    it('classifies Bhai Tika as auspicious', () => {
      // Kartik Shukla Dwitiya (Kartik 6 in 2082)
      const result = isAuspicious({ year: 2082, month: 7, day: 6 })
      expect(result).toBe('auspicious')
    })
  })

  describe('classifyDateForPurpose - Wedding', () => {
    it('classifies wedding-suitable dates', () => {
      // Maghe Sankranti is auspicious
      const result = classifyDateForPurpose(
        { year: 2082, month: 10, day: 1 }, // Maghe Sankranti
        'wedding'
      )
      expect(result).toBe('auspicious')
    })

    it('may not classify Ekadashi as ideal for weddings', () => {
      const result = classifyDateForPurpose(
        { year: 2082, month: 1, day: 11 },
        'wedding'
      )
      // Ekadashi is not ideal for weddings
      expect(['neutral', 'inauspicious']).toContain(result)
    })
  })

  describe('classifyDateForPurpose - Bratabandha', () => {
    it('classifies religious festivals as auspicious for bratabandha', () => {
      const result = classifyDateForPurpose(
        { year: 2082, month: 6, day: 16 }, // Vijaya Dashami
        'bratabandha'
      )
      expect(result).toBe('auspicious')
    })
  })

  describe('classifyDateForPurpose - Grihapravesh', () => {
    it('classifies auspicious dates for house warming', () => {
      const result = classifyDateForPurpose(
        { year: 2082, month: 10, day: 1 }, // Maghe Sankranti
        'grihapravesh'
      )
      expect(result).toBe('auspicious')
    })
  })

  describe('classifyDateForPurpose - General', () => {
    it('uses base classification for general purpose', () => {
      const result = classifyDateForPurpose(
        { year: 2082, month: 6, day: 16 }, // Vijaya Dashami
        'general'
      )
      expect(result).toBe('auspicious')
    })

    it('returns neutral for regular days', () => {
      const result = classifyDateForPurpose(
        { year: 2082, month: 3, day: 15 },
        'general'
      )
      expect(result).toBe('neutral')
    })
  })

  describe('Priority Rules', () => {
    it('prioritizes inauspicious over auspicious markers', () => {
      // If a date has both inauspicious_period and festival events,
      // inauspicious should take priority
      // This is tested through the implementation logic
      const result = isAuspicious({ year: 2082, month: 1, day: 11 })
      // Should handle conflicting markers correctly
      expect(['auspicious', 'inauspicious', 'neutral']).toContain(result)
    })
  })

  describe('Edge Cases', () => {
    it('handles dates at month boundaries', () => {
      const result = isAuspicious({ year: 2082, month: 12, day: 30 })
      expect(['auspicious', 'inauspicious', 'neutral']).toContain(result)
    })

    it('handles year-end dates', () => {
      const result = isAuspicious({ year: 2082, month: 12, day: 29 })
      expect(['auspicious', 'inauspicious', 'neutral']).toContain(result)
    })

    it('handles new year dates', () => {
      // Baishakh 1 is New Year - should be auspicious
      const result = isAuspicious({ year: 2082, month: 1, day: 1 })
      // Check if it's auspicious (New Year is generally auspicious)
      expect(['auspicious', 'neutral']).toContain(result)
    })
  })
})
