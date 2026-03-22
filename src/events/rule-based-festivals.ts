/**
 * Rule-based festival resolver for festivals with fixed BS dates or tithi-based determination.
 *
 * Fixed BS-date festivals (e.g., Maghe Sankranti = Poush 1) are computed here directly.
 * Tithi-dependent festivals (e.g., Shivaratri = Magh Krishna Chaturdashi) are resolved
 * by querying the panchang layer.
 *
 * TODO Phase 4: implement festival rules.
 */

export type RuleBoundFestival = {
  id: string
  name: { en: string; ne: string }
  determinedBy: 'fixed-bs-date' | 'tithi'
}

// Placeholder — will be populated in Phase 4
export const RULE_BASED_FESTIVALS: RuleBoundFestival[] = []
