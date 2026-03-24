export interface PanchangInfo {
  tithi: {
    name: string     // "Pratipada"
    nameNe: string   // "प्रतिपदा"
    number: number   // 1–30
  }
  paksha: 'shukla' | 'krishna'
  pakshaName: { en: string; ne: string }
  nakshatra?: {
    name: string     // "Ashwini"
    nameNe: string   // "अश्विनी"
  }
  yoga?: {
    name: string     // "Vishkambha"
    nameNe: string   // "विष्कम्भ"
    number: number   // 1–27
  }
  karana?: {
    name: string     // "Bava"
    nameNe: string   // "बव"
    number: number   // 1–11
    inauspicious: boolean
  }
  /**
   * Tithi edge-case classification for this solar day.
   *
   * 'normal'  — Standard day: one tithi at sunrise (the vast majority of days).
   * 'kshaya'  — The tithi numbered (tithi.number + 1) completes within this solar day
   *             without appearing at sunrise. Its observance (fasting, etc.) falls here.
   * 'vriddhi' — This tithi also appeared at yesterday's sunrise; it rules two consecutive days.
   *
   * Defaults to 'normal' for pre-Phase-7 data that lacks the `tt` schema field.
   */
  tithiType: 'normal' | 'kshaya' | 'vriddhi'
}
