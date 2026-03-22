/**
 * BS month length lookup.
 * Each entry maps a BS year to an array of 12 month lengths.
 * Data sourced from established open-source references (cross-validated).
 *
 * TODO Phase 1: populate bs-month-lengths.json with validated data for BS 2000–2100.
 */
import data from './bs-month-lengths.json' with { type: 'json' }

type MonthLengthData = Record<string, number[]>
const monthLengths = data as MonthLengthData

export function getMonthLengths(bsYear: number): number[] {
  const lengths = monthLengths[String(bsYear)]
  if (lengths === undefined) {
    throw new RangeError(`No month length data for BS year ${bsYear}.`)
  }
  if (lengths.length !== 12) {
    throw new Error(`Corrupt data: BS year ${bsYear} has ${lengths.length} months (expected 12).`)
  }
  return lengths
}
