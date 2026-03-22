import { describe, it, expect } from 'vitest'
import { isAuspicious } from '../../src/events/classifier.js'

describe('isAuspicious', () => {
  it.todo('returns "neutral" for a date with no events')
  it.todo('returns "auspicious" for a Shubha Vivah Muhurat date')
  it.todo('returns "inauspicious" for a date in Pitru Paksha')
  it.todo('inauspicious takes precedence over auspicious if both present')
})
