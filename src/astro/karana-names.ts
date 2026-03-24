/**
 * Karana (half-tithi) names and their classification.
 *
 * A tithi spans 12° of the Moon's elongation from the Sun. A karana is half
 * of that — 6°. Each lunar month therefore contains 60 karanas.
 *
 * There are 11 distinct karanas in two groups:
 *
 * FIXED (4) — each appears exactly once per lunar month at a fixed position:
 *   Kimstughna  — 1st half of Shukla Pratipada (karana index 0)
 *   Shakuni     — 2nd half of Krishna Chaturdashi (index 57)
 *   Chatushpada — 1st half of Amavasya (index 58)
 *   Nagava      — 2nd half of Amavasya (index 59)
 *
 * MOVABLE (7) — cycle repeatedly through the remaining 56 positions (indices 1–56):
 *   Bava, Balava, Kaulava, Taitila, Garaja, Vanija, Vishti
 *   Each movable karana appears 8 times per lunar month.
 *
 * Karana number used in this package: 1–11 (1-based)
 *   1=Bava, 2=Balava, 3=Kaulava, 4=Taitila, 5=Garaja, 6=Vanija,
 *   7=Vishti, 8=Shakuni, 9=Chatushpada, 10=Nagava, 11=Kimstughna
 */

export type KaranaKind = 'movable' | 'fixed'

export interface KaranaInfo {
  /** 1-based karana number (1–11) */
  number: number
  en: string
  ne: string
  kind: KaranaKind
  /** True for Vishti (Bhadra) — considered inauspicious in muhurta selection */
  inauspicious: boolean
}

export const KARANA_NAMES: ReadonlyArray<KaranaInfo> = [
  // ── Movable karanas (1–7) ────────────────────────────────────────────────────
  { number: 1,  en: 'Bava',        ne: 'बव',        kind: 'movable', inauspicious: false },
  { number: 2,  en: 'Balava',      ne: 'बालव',      kind: 'movable', inauspicious: false },
  { number: 3,  en: 'Kaulava',     ne: 'कौलव',      kind: 'movable', inauspicious: false },
  { number: 4,  en: 'Taitila',     ne: 'तैतिल',     kind: 'movable', inauspicious: false },
  { number: 5,  en: 'Garaja',      ne: 'गरज',       kind: 'movable', inauspicious: false },
  { number: 6,  en: 'Vanija',      ne: 'वणिज',      kind: 'movable', inauspicious: false },
  { number: 7,  en: 'Vishti',      ne: 'विष्टि',    kind: 'movable', inauspicious: true  },
  // ── Fixed karanas (8–11) ─────────────────────────────────────────────────────
  { number: 8,  en: 'Shakuni',     ne: 'शकुनि',     kind: 'fixed',   inauspicious: false },
  { number: 9,  en: 'Chatushpada', ne: 'चतुष्पाद',  kind: 'fixed',   inauspicious: false },
  { number: 10, en: 'Nagava',      ne: 'नाग',       kind: 'fixed',   inauspicious: false },
  { number: 11, en: 'Kimstughna',  ne: 'किंस्तुघ्न', kind: 'fixed',  inauspicious: false },
]

const _karanaByNumber = new Map(KARANA_NAMES.map(k => [k.number, k]))

export function getKaranaByNumber(number: number): KaranaInfo {
  const k = _karanaByNumber.get(number)
  if (k === undefined) {
    throw new RangeError(`Invalid karana number: ${number}. Must be 1–11.`)
  }
  return k
}

/**
 * Derive karana number (1–11) from a raw karana index (0–59).
 *
 * Index 0     → Kimstughna (11)
 * Index 1–56  → movable cycle: (index - 1) % 7 → 0-6 → karana 1-7
 * Index 57    → Shakuni (8)
 * Index 58    → Chatushpada (9)
 * Index 59    → Nagava (10)
 */
export function karanaIndexToNumber(index: number): number {
  if (index === 0)  return 11  // Kimstughna
  if (index <= 56)  return ((index - 1) % 7) + 1   // Bava–Vishti cycle
  if (index === 57) return 8   // Shakuni
  if (index === 58) return 9   // Chatushpada
  return 10                    // Nagava (index 59)
}
