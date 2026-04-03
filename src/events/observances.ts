import { BASE_FESTIVALS } from '../data/festivals.js'
import { FESTIVAL_SOURCE_MAP } from '../data/source-maps.js'

export type ObservanceConfidence = 'high' | 'medium' | 'baseline'

export interface InternationalObservanceMetadata {
  id: string
  name: { en: string; ne: string }
  description?: { en: string; ne: string }
  adMonth: number
  adDay: number
  isPublicHoliday: boolean
  confidence: ObservanceConfidence
  source: {
    authority: string
    reference: string
    usagePolicy: 'official' | 'manual_reference' | 'computed_public_domain'
    authorityTier: 'primary_official' | 'secondary_authoritative' | 'community_reference'
    reviewCadence: 'quarterly' | 'semiannual' | 'annual'
    lastReviewedIsoDate: string
  }
}

function toConfidence(
  authorityTier: 'primary_official' | 'secondary_authoritative' | 'community_reference',
): ObservanceConfidence {
  if (authorityTier === 'primary_official') return 'high'
  if (authorityTier === 'secondary_authoritative') return 'medium'
  return 'baseline'
}

function buildObservanceMetadata(): InternationalObservanceMetadata[] {
  const rows: InternationalObservanceMetadata[] = []

  for (const festival of BASE_FESTIVALS) {
    if (festival.method !== 'fixed_ad_date') continue
    if (festival.adMonth === undefined || festival.adDay === undefined) continue

    const source = FESTIVAL_SOURCE_MAP[festival.id]
    if (source === undefined) continue

    const metadata: InternationalObservanceMetadata = {
      id: festival.id,
      name: festival.name,
      adMonth: festival.adMonth,
      adDay: festival.adDay,
      isPublicHoliday: festival.isPublicHoliday,
      confidence: toConfidence(source.authorityTier),
      source: {
        authority: source.authority,
        reference: source.reference,
        usagePolicy: source.usagePolicy,
        authorityTier: source.authorityTier,
        reviewCadence: source.reviewCadence,
        lastReviewedIsoDate: source.lastReviewedIsoDate,
      },
    }

    if (festival.description !== undefined) {
      metadata.description = festival.description
    }

    rows.push(metadata)
  }

  rows.sort((a, b) => {
    if (a.adMonth !== b.adMonth) return a.adMonth - b.adMonth
    if (a.adDay !== b.adDay) return a.adDay - b.adDay
    return a.id.localeCompare(b.id)
  })

  return rows
}

const OBSERVANCE_METADATA = buildObservanceMetadata()
const OBSERVANCE_BY_ID = new Map(OBSERVANCE_METADATA.map(row => [row.id, row] as const))

export function listInternationalObservances(): readonly InternationalObservanceMetadata[] {
  return OBSERVANCE_METADATA
}

export function getInternationalObservanceById(id: string): InternationalObservanceMetadata | null {
  return OBSERVANCE_BY_ID.get(id) ?? null
}

export function getInternationalObservancesByAdDate(
  adMonth: number,
  adDay: number,
): InternationalObservanceMetadata[] {
  return OBSERVANCE_METADATA.filter(row => row.adMonth === adMonth && row.adDay === adDay)
}

