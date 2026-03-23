/**
 * Government-declared public holidays for BS 2082
 * 
 * These are additional holidays beyond the base festival list.
 * Some holidays are declared annually by the government and may vary.
 */

import type { CalendarEvent } from '../../events/types.js'

export const PUBLIC_HOLIDAYS_2082: readonly CalendarEvent[] = [
  {
    id: '2082-new-year',
    name: { en: 'Nepali New Year (BS 2082)', ne: 'नयाँ वर्ष २०८२' },
    type: 'public_holiday',
    category: 'national',
    description: { en: 'First day of BS 2082', ne: '२०८२ को पहिलो दिन' },
    isPublicHoliday: true,
  },
  {
    id: '2082-constitution',
    name: { en: 'Constitution Day', ne: 'संविधान दिवस' },
    type: 'public_holiday',
    category: 'national',
    isPublicHoliday: true,
  },
  {
    id: '2082-democracy',
    name: { en: 'Democracy Day', ne: 'प्रजातन्त्र दिवस' },
    type: 'public_holiday',
    category: 'national',
    isPublicHoliday: true,
  },
  {
    id: '2082-martyrs',
    name: { en: 'Martyrs Day', ne: 'शहीद दिवस' },
    type: 'public_holiday',
    category: 'national',
    isPublicHoliday: true,
  },
  {
    id: '2082-womens',
    name: { en: "International Women's Day", ne: 'अन्तर्राष्ट्रिय नारी दिवस' },
    type: 'public_holiday',
    category: 'national',
    isPublicHoliday: true,
  },
  {
    id: '2082-labour',
    name: { en: 'International Labour Day', ne: 'अन्तर्राष्ट्रिय श्रमिक दिवस' },
    type: 'public_holiday',
    category: 'national',
    isPublicHoliday: true,
  },
  {
    id: '2082-republic',
    name: { en: 'Republic Day', ne: 'गणतन्त्र दिवस' },
    type: 'public_holiday',
    category: 'national',
    isPublicHoliday: true,
  },
  {
    id: '2082-dashain1',
    name: { en: 'Ghatasthapana', ne: 'घटस्थापना' },
    type: 'public_holiday',
    category: 'religious',
    isPublicHoliday: true,
  },
  {
    id: '2082-dashain7',
    name: { en: 'Fulpati', ne: 'फूलपाती' },
    type: 'public_holiday',
    category: 'religious',
    isPublicHoliday: true,
  },
  {
    id: '2082-dashain8',
    name: { en: 'Maha Asthami', ne: 'महा अष्टमी' },
    type: 'public_holiday',
    category: 'religious',
    isPublicHoliday: true,
  },
  {
    id: '2082-dashain9',
    name: { en: 'Maha Nawami', ne: 'महा नवमी' },
    type: 'public_holiday',
    category: 'religious',
    isPublicHoliday: true,
  },
  {
    id: '2082-dashain10',
    name: { en: 'Vijaya Dashami', ne: 'विजया दशमी' },
    type: 'public_holiday',
    category: 'religious',
    isPublicHoliday: true,
  },
  {
    id: '2082-tihar3',
    name: { en: 'Laxmi Puja', ne: 'लक्ष्मी पूजा' },
    type: 'public_holiday',
    category: 'religious',
    isPublicHoliday: true,
  },
  {
    id: '2082-tihar4',
    name: { en: 'Govardhan Puja / Mha Puja', ne: 'गोवर्धन पूजा / म्ह पूजा' },
    type: 'public_holiday',
    category: 'cultural',
    isPublicHoliday: true,
  },
  {
    id: '2082-tihar5',
    name: { en: 'Bhai Tika', ne: 'भाइ टीका' },
    type: 'public_holiday',
    category: 'cultural',
    isPublicHoliday: true,
  },
  {
    id: '2082-chhath',
    name: { en: 'Chhath Parva', ne: 'छठ पर्व' },
    type: 'public_holiday',
    category: 'religious',
    isPublicHoliday: true,
  },
  {
    id: '2082-maghi',
    name: { en: 'Maghe Sankranti', ne: 'माघे संक्रान्ति' },
    type: 'public_holiday',
    category: 'cultural',
    isPublicHoliday: true,
  },
  {
    id: '2082-shivaratri',
    name: { en: 'Maha Shivaratri', ne: 'महा शिवरात्री' },
    type: 'public_holiday',
    category: 'religious',
    isPublicHoliday: true,
  },
  {
    id: '2082-holi',
    name: { en: 'Holi (Fagu Purnima)', ne: 'होली (फागु पूर्णिमा)' },
    type: 'public_holiday',
    category: 'cultural',
    isPublicHoliday: true,
  },
]
