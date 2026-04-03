import type { FestivalDefinition } from './festivals.js'
import type { CalendarEvent } from '../events/types.js'

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
  authority: 'United Nations / international observance calendars',
  reference: 'UN and WHO fixed Gregorian observance dates',
  lastVerifiedBsYear: 2082,
  licenseNote: 'Observance names/dates are factual references, not official Nepal public-holiday declarations.',
  usagePolicy: 'manual_reference',
  automationAllowed: false,
}

function buildFestivalSourceMap(): Record<string, LegalDataSource> {
  const map: Record<string, LegalDataSource> = {}
  for (const id of FESTIVAL_IDS) {
    map[id] = id.startsWith('international-') || id.startsWith('world-')
      ? UN_OBSERVANCE_SOURCE
      : NEPAL_CALENDAR_SOURCE
  }
  return map
}

function buildPublicHolidaySourceMap2082(): Record<string, LegalDataSource> {
  const map: Record<string, LegalDataSource> = {}
  for (const id of PUBLIC_HOLIDAY_IDS_2082) {
    map[id] = GOVERNMENT_2082_SOURCE
  }
  return map
}

const FESTIVAL_IDS = [
  'dashain-day1',
  'dashain-day7',
  'dashain-day8',
  'dashain-day9',
  'vijaya-dashami',
  'dashain-day11',
  'dashain-day12',
  'dashain-day13',
  'dashain-day14',
  'kojagrat-purnima',
  'tihar-day1',
  'tihar-day2',
  'tihar-day3-laxmi',
  'tihar-day4',
  'tihar-day5',
  'maghe-sankranti',
  'republic-day',
  'prithvi-jayanti',
  'martyrs-day',
  'womens-day',
  'democracy-day',
  'may-day',
  'childrens-day',
  'constitution-day',
  'teej',
  'janai-purnima',
  'gokarna-aurasi',
  'mata-tirtha-aunsi',
  'buddha-jayanti',
  'gunla-purnima',
  'krishna-janmastami',
  'gaura-parva',
  'chhath-parva',
  'yomari-purnima',
  'losar',
  'gyalpo-losar',
  'sonam-losar',
  'maghi',
  'shree-panchami',
  'mahashivaratri',
  'holy',
  'ghode-jatra',
  'ram-navami',
  'naga-panchami',
  'raksha-bandhan',
  'kushe-aunsi',
  'indrajatra',
  'manirimdu',
  'ubhauli',
  'udhauli',
  'chhath-krishna',
  'ekadashi-shukla',
  'ekadashi-krishna',
  'international-womens-day',
  'world-water-day',
  'world-health-day',
  'world-earth-day',
  'world-environment-day',
  'international-yoga-day',
  'international-democracy-day',
  'world-mental-health-day',
  'international-childrens-day-un',
  'international-human-rights-day',
] as const satisfies readonly FestivalDefinition['id'][]

const PUBLIC_HOLIDAY_IDS_2082 = [
  '2082-new-year',
  '2082-constitution',
  '2082-democracy',
  '2082-martyrs',
  '2082-womens',
  '2082-labour',
  '2082-republic',
  '2082-dashain1',
  '2082-dashain7',
  '2082-dashain8',
  '2082-dashain9',
  '2082-dashain10',
  '2082-tihar3',
  '2082-tihar4',
  '2082-tihar5',
  '2082-chhath',
  '2082-maghi',
  '2082-shivaratri',
  '2082-holi',
] as const satisfies readonly CalendarEvent['id'][]

export const FESTIVAL_SOURCE_MAP: Record<string, LegalDataSource> = buildFestivalSourceMap()
export const PUBLIC_HOLIDAY_SOURCE_MAP_2082: Record<string, LegalDataSource> = buildPublicHolidaySourceMap2082()
