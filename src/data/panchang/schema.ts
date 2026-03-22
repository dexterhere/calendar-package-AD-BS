/**
 * Schema for a single day's panchang entry in a year JSON file.
 *
 * JSON file format: src/data/panchang/<bsYear>.json
 * Each file is an array of PanchangEntry objects, one per day of the BS year.
 * Days MUST be in chronological order (Baishakh 1 first, Chaitra last).
 *
 * Tithi numbering uses the continuous 1–30 scheme:
 *   1–15  = Shukla Paksha (15 = Purnima)
 *   16–30 = Krishna Paksha (30 = Amavasya)
 *
 * Data sources:
 *   Primary:   Nepal Rashtriya Panchang (government-published annual panchang)
 *   Validation: Drik Panchang (drikpanchang.com)
 */
export interface PanchangEntry {
  /** BS month number, 1–12 */
  m: number
  /** BS day number, 1–32 */
  d: number
  /**
   * Tithi number using the 1–30 continuous scheme.
   * When a solar day spans two tithis, record the tithi at sunrise (traditional panchang convention).
   */
  t: number
  /**
   * Nakshatra index, 1–27 (optional — include when reliably sourced).
   * 1=Ashwini, 2=Bharani, 3=Krittika, 4=Rohini, 5=Mrigashira, 6=Ardra, 7=Punarvasu,
   * 8=Pushya, 9=Ashlesha, 10=Magha, 11=Purva Phalguni, 12=Uttara Phalguni,
   * 13=Hasta, 14=Chitra, 15=Swati, 16=Vishakha, 17=Anuradha, 18=Jyeshtha,
   * 19=Mula, 20=Purva Ashadha, 21=Uttara Ashadha, 22=Shravana, 23=Dhanishtha,
   * 24=Shatabhisha, 25=Purva Bhadrapada, 26=Uttara Bhadrapada, 27=Revati
   */
  n?: number
}
