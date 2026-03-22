import type { BSDate } from '../converter/types.js'
import type { PanchangInfo } from './types.js'
import { adToBs } from '../converter/ad-to-bs.js'

/**
 * Returns panchang data (tithi, paksha, nakshatra) for a given date.
 * Returns null if the date is outside the pre-computed data range.
 *
 * TODO Phase 3: implement JSON data loading per year file.
 */
export function getPanchang(date: Date | BSDate): PanchangInfo | null {
  const bsDate: BSDate = date instanceof Date ? adToBs(date) : date

  void bsDate // will be used once data files are populated

  // Stub: return null until panchang data files are populated in Phase 3
  return null
}
