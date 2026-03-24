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
  /**
   * Yoga index 1–27 (optional — included from Phase 7 v2 data onward).
   * 1=Vishkambha … 27=Vaidhriti. Derived from (sun_lon + moon_lon) % 360.
   */
  y?: number
  /**
   * Karana number 1–11 (optional — included from Phase 7 v2 data onward).
   * 1=Bava … 7=Vishti (movable), 8=Shakuni, 9=Chatushpada, 10=Nagava, 11=Kimstughna (fixed).
   */
  k?: number
  /**
   * Tithi edge-case type (omitted for normal days).
   *
   * 'k' = Kshaya: the tithi numbered (t + 1) completes entirely within this solar day
   *       without appearing at sunrise. Its observance falls on this day.
   *       e.g. t=10, tt='k' → Ekadashi (11) is the Kshaya tithi for this day.
   *
   * 'v' = Vriddhi: this tithi (t) also appeared at yesterday's sunrise.
   *       The same tithi rules two consecutive solar days.
   *
   * Populated by the panchang generator (Step 8). Not present in pre-Phase-7 data.
   */
  tt?: 'k' | 'v'
}
