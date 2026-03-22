import { describe, it, expect } from 'vitest'
import { getPanchang } from '../../src/panchang/panchang-lookup.js'

describe('getPanchang', () => {
  it.todo('returns null for dates outside the pre-computed range')
  it.todo('returns correct tithi for a known date in BS 2082')
  it.todo('Purnima (tithi 15 Shukla) matches published date for BS 2082 Baishakh')
  it.todo('Amavasya (tithi 30 Krishna) matches published date')
})
