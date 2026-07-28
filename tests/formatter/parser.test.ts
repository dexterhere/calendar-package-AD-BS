import { describe, it, expect } from 'vitest'
import {
  parseBS,
  formatBS,
  devanagariToAsciiDigits,
  asciiToDevanagariDigits,
} from '../../src/formatter/index.js'

describe('BS Formatter and Parser (formatter)', () => {
  it('converts between ASCII and Devanagari numerals', () => {
    expect(asciiToDevanagariDigits('2082-01-15')).toBe('२०८२-०१-१५')
    expect(devanagariToAsciiDigits('२०८२-०१-१५')).toBe('2082-01-15')
  })

  it('parses ASCII date strings (ISO format)', () => {
    const parsed = parseBS('2082-01-01')
    expect(parsed).toEqual({ year: 2082, month: 1, day: 1 })

    const parsedSlash = parseBS('2082/05/10')
    expect(parsedSlash).toEqual({ year: 2082, month: 5, day: 10 })
  })

  it('parses Devanagari date strings', () => {
    const parsed = parseBS('२०८२-०१-०१')
    expect(parsed).toEqual({ year: 2082, month: 1, day: 1 })
  })

  it('parses DD-MM-YYYY format', () => {
    const parsed = parseBS('15-01-2082')
    expect(parsed).toEqual({ year: 2082, month: 1, day: 15 })
  })

  it('throws SyntaxError on malformed date string', () => {
    expect(() => parseBS('not-a-date')).toThrow(SyntaxError)
  })

  it('throws RangeError when parsed date is out of range or invalid', () => {
    expect(() => parseBS('2082-13-40')).toThrow(RangeError)
  })

  it('formatBS supports rich tokens and Devanagari locale', () => {
    const date = { year: 2082, month: 1, day: 1 } // Monday Baishakh 1

    expect(formatBS(date, 'YYYY-MM-DD')).toBe('2082-01-01')
    expect(formatBS(date, 'DD MMMM YYYY')).toBe('01 Baishakh 2082')
    expect(formatBS(date, 'dddd, MMMM D, YYYY')).toBe('Monday, Baishakh 1, 2082')

    // Devanagari locale
    expect(formatBS(date, 'YYYY-MM-DD', { locale: 'ne' })).toBe('२०८२-०१-०१')
    expect(formatBS(date, 'dddd, MMMM D, YYYY', { locale: 'ne' })).toBe(
      'सोमबार, बैशाख १, २०८२'
    )
  })
})
