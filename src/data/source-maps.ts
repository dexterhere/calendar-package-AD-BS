import { BASE_FESTIVALS } from './festivals.js'
import { PUBLIC_HOLIDAYS_2082 } from './public-holidays/2082.js'

export interface LegalDataSource {
  authority: string
  reference: string
  lastVerifiedBsYear: number
  licenseNote: string
  usagePolicy: 'official' | 'manual_reference' | 'computed_public_domain'
  automationAllowed: boolean
}

const GOVERNMENT_2082_SOURCE: LegalDataSource = {
  authority: 'Government of Nepal',
  reference: 'Nepal Gazette and Ministry calendar notices for BS 2082 public holidays',
  lastVerifiedBsYear: 2082,
  licenseNote: 'Public holiday facts are public-interest data; verify annually before release.',
  usagePolicy: 'official',
  automationAllowed: false,
}

const NEPAL_CALENDAR_SOURCE: LegalDataSource = {
  authority: 'Nepal Rashtriya Panchang / Calendar authorities',
  reference: 'Traditional Nepal panchang observance rules and nationally used BS festival conventions',
  lastVerifiedBsYear: 2082,
  licenseNote: 'Festival date logic is rule-based and must be reviewed against annual official notices.',
  usagePolicy: 'official',
  automationAllowed: false,
}

const UN_OBSERVANCE_SOURCE: LegalDataSource = {
  authority: 'International observance calendars',
  reference: 'UN/WHO and other globally-recognized observance date calendars',
  lastVerifiedBsYear: 2082,
  licenseNote: 'Observance names/dates are factual references, not official Nepal public-holiday declarations.',
  usagePolicy: 'manual_reference',
  automationAllowed: false,
}

function buildFestivalSourceMap(): Record<string, LegalDataSource> {
  const map: Record<string, LegalDataSource> = {}
  for (const festival of BASE_FESTIVALS) {
    map[festival.id] = festival.method === 'fixed_ad_date'
      ? UN_OBSERVANCE_SOURCE
      : NEPAL_CALENDAR_SOURCE
  }
  return map
}

function buildPublicHolidaySourceMap2082(): Record<string, LegalDataSource> {
  const map: Record<string, LegalDataSource> = {}
  for (const holiday of PUBLIC_HOLIDAYS_2082) {
    map[holiday.id] = GOVERNMENT_2082_SOURCE
  }
  return map
}

export const FESTIVAL_SOURCE_MAP: Record<string, LegalDataSource> = buildFestivalSourceMap()
export const PUBLIC_HOLIDAY_SOURCE_MAP_2082: Record<string, LegalDataSource> = buildPublicHolidaySourceMap2082()
