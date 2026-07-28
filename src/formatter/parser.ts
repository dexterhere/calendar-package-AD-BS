import type { BSDate } from '../converter/types.js'
import { validateBSDate } from '../converter/utils.js'

const DEVANAGARI_DIGIT_MAP: Record<string, string> = {
  '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
  '५': '5', '६': '6', '७': '7', '८': '8', '९': '9',
}

const ASCII_DIGIT_MAP: Record<string, string> = {
  '0': '०', '1': '१', '2': '२', '3': '३', '4': '४',
  '5': '५', '6': '६', '7': '७', '8': '८', '9': '९',
}

/**
 * Converts Devanagari numerals (०–९) in a string to standard ASCII digits (0–9).
 */
export function devanagariToAsciiDigits(str: string): string {
  return str.replace(/[०-९]/g, ch => DEVANAGARI_DIGIT_MAP[ch] ?? ch)
}

/**
 * Converts standard ASCII digits (0–9) in a string to Devanagari numerals (०–९).
 */
export function asciiToDevanagariDigits(str: string): string {
  return str.replace(/[0-9]/g, ch => ASCII_DIGIT_MAP[ch] ?? ch)
}

/**
 * Parses a Bikram Sambat date string into a validated BSDate object.
 *
 * Supports both ASCII ("2082-01-01") and Devanagari ("२०८२-०१-०१") numerals.
 *
 * Default auto-detected formats:
 * - "YYYY-MM-DD", "YYYY/MM/DD", "YYYY.MM.DD"
 * - "DD-MM-YYYY", "DD/MM/YYYY"
 *
 * @throws SyntaxError if the string format cannot be recognized.
 * @throws RangeError if the parsed date is out of supported range or invalid for the month.
 */
export function parseBS(dateString: string, format?: string): BSDate {
  if (typeof dateString !== 'string' || dateString.trim() === '') {
    throw new SyntaxError('Invalid BS date string: input is empty or non-string.')
  }

  // Normalize Devanagari numerals to ASCII
  const asciiStr = devanagariToAsciiDigits(dateString.trim())

  let year: number | undefined
  let month: number | undefined
  let day: number | undefined

  if (format !== undefined && format.trim() !== '') {
    // Custom format parsing
    const tokenRegex = /(YYYY|MM|DD)/g
    const regexStr = '^' + format
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      .replace(tokenRegex, token => {
        if (token === 'YYYY') return '(\\d{4})'
        if (token === 'MM') return '(\\d{1,2})'
        if (token === 'DD') return '(\\d{1,2})'
        return token
      }) + '$'

    const reg = new RegExp(regexStr)
    const match = reg.exec(asciiStr)

    if (match === null) {
      throw new SyntaxError(
        `Date string "${dateString}" does not match specified format "${format}".`
      )
    }

    const tokens: string[] = []
    let m: RegExpExecArray | null
    const findTokensReg = /(YYYY|MM|DD)/g
    while ((m = findTokensReg.exec(format)) !== null) {
      tokens.push(m[0])
    }

    for (let i = 0; i < tokens.length; i++) {
      const val = parseInt(match[i + 1] ?? '', 10)
      const token = tokens[i]
      if (token === 'YYYY') year = val
      if (token === 'MM') month = val
      if (token === 'DD') day = val
    }
  } else {
    // Auto-detection
    // Pattern 1: YYYY-MM-DD / YYYY/MM/DD / YYYY.MM.DD
    const isoMatch = /^(\d{4})[-/.](0?\d{1,2})[-/.](0?\d{1,2})$/.exec(asciiStr)
    if (isoMatch !== null) {
      year = parseInt(isoMatch[1] ?? '', 10)
      month = parseInt(isoMatch[2] ?? '', 10)
      day = parseInt(isoMatch[3] ?? '', 10)
    } else {
      // Pattern 2: DD-MM-YYYY / DD/MM/YYYY
      const dmyMatch = /^(0?\d{1,2})[-/.](0?\d{1,2})[-/.](\d{4})$/.exec(asciiStr)
      if (dmyMatch !== null) {
        day = parseInt(dmyMatch[1] ?? '', 10)
        month = parseInt(dmyMatch[2] ?? '', 10)
        year = parseInt(dmyMatch[3] ?? '', 10)
      }
    }
  }

  if (year === undefined || month === undefined || day === undefined || isNaN(year) || isNaN(month) || isNaN(day)) {
    throw new SyntaxError(
      `Unable to parse BS date string "${dateString}". Supported formats: YYYY-MM-DD, YYYY/MM/DD, DD-MM-YYYY, or Devanagari equivalents.`
    )
  }

  const bsDate: BSDate = { year, month, day }
  validateBSDate(bsDate)
  return bsDate
}
