import { describe, it, expect } from 'vitest'
import { toBS } from '../../src/converter/index.js'

describe('toBS (Gregorian → BS)', () => {
  it.todo('converts AD 2025-04-14 to BS 2082 Baishakh 1')
  it.todo('converts AD 1943-04-14 to BS 2000 Baishakh 1 (epoch)')
  it.todo('converts a Gregorian date near year boundary (Dec/Jan)')
  it.todo('rejects dates before the epoch')
})
