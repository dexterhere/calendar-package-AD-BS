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
}
