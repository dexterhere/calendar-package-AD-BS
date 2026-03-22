import { describe, it, expect } from 'vitest'
import { toBS, toAD } from '../../src/converter/index.js'

describe('roundtrip consistency', () => {
  it.todo('toBS(toAD(bsDate)) === bsDate for all BS 2082 dates')
  it.todo('toAD(toBS(adDate)) ≡ adDate for sample AD dates')
})

describe('edge cases', () => {
  it.todo('handles Chaitra 30 vs 31 based on year')
  it.todo('handles month lengths at year boundaries')
  it.todo('rejects invalid month (month 13)')
  it.todo('rejects invalid day (day 33)')
  it.todo('rejects year below BS 2000')
  it.todo('rejects year above BS 2100')
})
