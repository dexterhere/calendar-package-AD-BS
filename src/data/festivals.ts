/**
 * Base Festival Dataset for Nepali Calendar
 * 
 * This file contains ~40 major festivals celebrated in Nepal.
 * Each festival is categorized by how its date is determined:
 * 
 * 1. FIXED_BS_DATE: Same BS date every year (e.g., Maghe Sankranti - Magh 1)
 * 2. TITHI_BASED: Determined by tithi (e.g., Dashain starts on Ashwin Shukla Pratipada)
 * 3. GOVERNMENT_DECLARED: Published annually by government (e.g., Republic Day)
 * 
 * Data sources:
 * - Nepal government publications
 * - Drik Panchang (drikpanchang.com)
 * - Common cultural knowledge
 */

export type FestivalDeterminationMethod = 'fixed_bs_date' | 'tithi_based' | 'government_declared' | 'fixed_ad_date'

export interface FestivalDefinition {
  /** Unique identifier for the festival */
  id: string
  /** Name in English and Nepali */
  name: { en: string; ne: string }
  /** How the date is determined */
  method: FestivalDeterminationMethod
  /** Event type classification */
  type: 'festival' | 'public_holiday' | 'auspicious_date' | 'inauspicious_period'
  /** Category for filtering */
  category: 'wedding' | 'bratabandha' | 'religious' | 'national' | 'cultural' | 'general'
  /** Description (optional) */
  description?: { en: string; ne: string }
  /** Whether it's a government public holiday */
  isPublicHoliday: boolean
  
  // For FIXED_BS_DATE method:
  /** BS month (1-12), required for fixed_bs_date */
  month?: number
  /** BS day (1-32), required for fixed_bs_date */
  day?: number
  /** Number of days the festival spans (default: 1) */
  duration?: number
  
  // For TITHI_BASED method:
  /** Tithi number (1-30), required for tithi_based */
  tithi?: number
  /** Paksha ('shukla' or 'krishna'), required for tithi_based */
  paksha?: 'shukla' | 'krishna'
  /** BS month to search in (1-12), required for tithi_based */
  searchMonth?: number
  /** Duration in days (for multi-day festivals like Dashain) */
  tithiDuration?: number
  
  // For GOVERNMENT_DECLARED:
  /** Fixed BS date for government holidays */
  govMonth?: number
  govDay?: number

  // For FIXED_AD_DATE method:
  /** Gregorian month (1-12) for fixed_ad_date */
  adMonth?: number
  /** Gregorian day (1-31) for fixed_ad_date */
  adDay?: number
}

/**
 * Base festival definitions - these apply to all years
 * Annual government-declared holidays are in separate year-specific files
 */
export const BASE_FESTIVALS: readonly FestivalDefinition[] = [
  // ───────────────────────────────────────────────────────────────────────────
  // DASHAIN (Vijaya Dashami) - Biggest Hindu festival, 15 days
  // Starts: Ashwin Shukla Pratipada (tithi 1)
  // Main day: Vijaya Dashami (Ashwin Shukla Dashami, tithi 10)
  // Ends: Kojagrat Purnima (Ashwin Shukla Purnima, tithi 15)
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'dashain-day1',
    name: { en: 'Ghatasthapana (Dashain Day 1)', ne: 'घटस्थापना (दशैं १ गते)' },
    method: 'tithi_based',
    type: 'festival',
    category: 'religious',
    description: {
      en: 'First day of Dashain, sacred barley seeds are planted',
      ne: 'दशैंको पहिलो दिन, कोठाको कोठामा जमरा राखिन्छ'
    },
    isPublicHoliday: true,
    tithi: 1,
    paksha: 'shukla',
    searchMonth: 6, // Ashwin
    duration: 1
  },
  {
    id: 'dashain-day7',
    name: { en: 'Fulpati (Dashain Day 7)', ne: 'फूलपाती (दशैं ७ गते)' },
    method: 'tithi_based',
    type: 'festival',
    category: 'religious',
    isPublicHoliday: true,
    tithi: 7,
    paksha: 'shukla',
    searchMonth: 6, // Ashwin
    duration: 1
  },
  {
    id: 'dashain-day8',
    name: { en: 'Maha Asthami (Dashain Day 8)', ne: 'महा अष्टमी (दशैं ८ गते)' },
    method: 'tithi_based',
    type: 'festival',
    category: 'religious',
    description: { en: 'Day of Goddess Kali, animal sacrifices in temples', ne: 'काली देवीको दिन, मन्दिरहरूमा बलि चढाउने' },
    isPublicHoliday: true,
    tithi: 8,
    paksha: 'shukla',
    searchMonth: 6, // Ashwin
    duration: 1
  },
  {
    id: 'dashain-day9',
    name: { en: 'Maha Nawami (Dashain Day 9)', ne: 'महा नवमी (दशैं ९ गते)' },
    method: 'tithi_based',
    type: 'festival',
    category: 'religious',
    description: { en: 'Day of Goddess Durga, vehicle worship', ne: 'दुर्गा देवीको दिन, सवारी साधनको पूजा' },
    isPublicHoliday: true,
    tithi: 9,
    paksha: 'shukla',
    searchMonth: 6, // Ashwin
    duration: 1
  },
  {
    id: 'vijaya-dashami',
    name: { en: 'Vijaya Dashami (Dashain Day 10)', ne: 'विजया दशमी (दशैं १० गते)' },
    method: 'tithi_based',
    type: 'festival',
    category: 'religious',
    description: { en: 'Main Dashain day, elders give tika and blessings', ne: 'मुख्य दशैं दिन, ठूलाहरूबाट टीका र आशीर्वाद' },
    isPublicHoliday: true,
    tithi: 10,
    paksha: 'shukla',
    searchMonth: 6, // Ashwin
    duration: 1
  },
  {
    id: 'dashain-day11',
    name: { en: 'Dashain Day 11', ne: 'दशैं ११ गते' },
    method: 'tithi_based',
    type: 'festival',
    category: 'religious',
    isPublicHoliday: false,
    tithi: 11,
    paksha: 'shukla',
    searchMonth: 6, // Ashwin
    duration: 1
  },
  {
    id: 'dashain-day12',
    name: { en: 'Dashain Day 12', ne: 'दशैं १२ गते' },
    method: 'tithi_based',
    type: 'festival',
    category: 'religious',
    isPublicHoliday: false,
    tithi: 12,
    paksha: 'shukla',
    searchMonth: 6, // Ashwin
    duration: 1
  },
  {
    id: 'dashain-day13',
    name: { en: 'Dashain Day 13', ne: 'दशैं १३ गते' },
    method: 'tithi_based',
    type: 'festival',
    category: 'religious',
    isPublicHoliday: false,
    tithi: 13,
    paksha: 'shukla',
    searchMonth: 6, // Ashwin
    duration: 1
  },
  {
    id: 'dashain-day14',
    name: { en: 'Dashain Day 14 (Kalratri)', ne: 'दशैं १४ गते (कालरात्री)' },
    method: 'tithi_based',
    type: 'festival',
    category: 'religious',
    isPublicHoliday: false,
    tithi: 14,
    paksha: 'shukla',
    searchMonth: 6, // Ashwin
    duration: 1
  },
  {
    id: 'kojagrat-purnima',
    name: { en: 'Kojagrat Purnima (Dashain Day 15)', ne: 'कोजाग्रत पूर्णिमा (दशैं १५ गते)' },
    method: 'tithi_based',
    type: 'festival',
    category: 'religious',
    description: { en: 'Final day of Dashain, worship of Goddess Laxmi', ne: 'दशैंको अन्तिम दिन, देवी लक्ष्मीको पूजा' },
    isPublicHoliday: false,
    tithi: 15,
    paksha: 'shukla',
    searchMonth: 6, // Ashwin
    duration: 1
  },

  // ───────────────────────────────────────────────────────────────────────────
  // TIHAR (Deepawali) - Festival of lights, 5 days
  // Starts: Kartik Krishna Trayodashi (tithi 13)
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'tihar-day1',
    name: { en: 'Kag Tihar (Crow Worship)', ne: 'काग तिहार (कौवाको पूजा)' },
    method: 'tithi_based',
    type: 'festival',
    category: 'cultural',
    description: { en: 'First day of Tihar, worship of crow as messenger of Yama', ne: 'तिहारको पहिलो दिन, यमको दूतको रूपमा कौवाको पूजा' },
    isPublicHoliday: false,
    tithi: 28, // Krishna Trayodashi
    paksha: 'krishna',
    searchMonth: 7, // Kartik
    duration: 1
  },
  {
    id: 'tihar-day2',
    name: { en: 'Kukur Tihar (Dog Worship)', ne: 'कुकुर तिहार (कुकुरको पूजा)' },
    method: 'tithi_based',
    type: 'festival',
    category: 'cultural',
    description: { en: 'Second day of Tihar, worship of dog as guardian', ne: 'तिहारको दोस्रो दिन, रक्षकको रूपमा कुकुरको पूजा' },
    isPublicHoliday: false,
    tithi: 29, // Krishna Chaturdashi
    paksha: 'krishna',
    searchMonth: 7,
    duration: 1
  },
  {
    id: 'tihar-day3-laxmi',
    name: { en: 'Laxmi Puja (Tihar Day 3)', ne: 'लक्ष्मी पूजा (तिहार ३ गते)' },
    method: 'tithi_based',
    type: 'festival',
    category: 'religious',
    description: { en: 'Main Tihar day, worship of Goddess Laxmi, lights and decorations', ne: 'मुख्य तिहार दिन, देवी लक्ष्मीको पूजा, बत्ती र सजावट' },
    isPublicHoliday: true,
    tithi: 30, // Amavasya
    paksha: 'krishna',
    searchMonth: 7,
    duration: 1
  },
  {
    id: 'tihar-day4',
    name: { en: 'Govardhan Puja / Mha Puja (Tihar Day 4)', ne: 'गोवर्धन पूजा / म्ह पूजा (तिहार ४ गते)' },
    method: 'tithi_based',
    type: 'festival',
    category: 'cultural',
    description: { en: 'Fourth day, Newars celebrate Mha Puja (self worship)', ne: 'चौथो दिन, नेवारहरूले म्ह पूजा मनाउँछन्' },
    isPublicHoliday: true,
    tithi: 1,
    paksha: 'shukla',
    searchMonth: 7,
    duration: 1
  },
  {
    id: 'tihar-day5',
    name: { en: 'Bhai Tika (Tihar Day 5)', ne: 'भाइ टीका (तिहार ५ गते)' },
    method: 'tithi_based',
    type: 'festival',
    category: 'cultural',
    description: { en: 'Fifth day, sisters put tika for brothers, exchange gifts', ne: 'पाँचौं दिन, दिदीबहिनीहरूले दाजुभाइलाई टीका लगाउँछन्, उपहार साट्छन्' },
    isPublicHoliday: true,
    tithi: 2,
    paksha: 'shukla',
    searchMonth: 7,
    duration: 1
  },

  // ───────────────────────────────────────────────────────────────────────────
  // MAJOR FIXED FESTIVALS
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'maghe-sankranti',
    name: { en: 'Maghe Sankranti', ne: 'माघे संक्रान्ति' },
    method: 'fixed_bs_date',
    type: 'festival',
    category: 'religious',
    description: { en: 'First day of Magh, end of winter solstice, holy river bathing', ne: 'माघको पहिलो दिन, शीतकालीन संक्रान्ति अन्त्य, पवित्र नदी स्नान' },
    isPublicHoliday: true,
    month: 10, // Magh
    day: 1,
    duration: 1
  },
  {
    id: 'republic-day',
    name: { en: 'Republic Day', ne: 'गणतन्त्र दिवस' },
    method: 'fixed_bs_date',
    type: 'public_holiday',
    category: 'national',
    description: { en: 'Commemoration of Nepal becoming a republic (2065 Jestha 15)', ne: 'नेपाल गणतन्त्र भएको दिन (२०६५ जेठ १५)' },
    isPublicHoliday: true,
    month: 2, // Jestha
    day: 15,
    duration: 1
  },
  {
    id: 'prithvi-jayanti',
    name: { en: 'Prithvi Jayanti / National Unity Day', ne: 'पृथ्वी जयन्ती / राष्ट्रिय एकता दिवस' },
    method: 'fixed_bs_date',
    type: 'festival',
    category: 'national',
    description: { en: 'Birthday of King Prithvi Narayan Shah, unifier of Nepal', ne: 'नेपालका एकीकारक पृथ्वी नारायण शाहको जन्मजयन्ती' },
    isPublicHoliday: false,
    month: 9, // Poush
    day: 27,
    duration: 1
  },
  {
    id: 'martyrs-day',
    name: { en: 'Martyrs Day (Shahid Diwas)', ne: 'शहीद दिवस' },
    method: 'fixed_bs_date',
    type: 'public_holiday',
    category: 'national',
    description: { en: 'Honoring those who sacrificed for democracy', ne: 'लोकतन्त्रका लागि शहीदहरूको सम्झना' },
    isPublicHoliday: true,
    month: 10, // Magh
    day: 16,
    duration: 1
  },
  {
    id: 'womens-day',
    name: { en: "International Women's Day", ne: 'अन्तर्राष्ट्रिय नारी दिवस' },
    method: 'fixed_bs_date',
    type: 'public_holiday',
    category: 'national',
    isPublicHoliday: true,
    month: 11, // Falgun
    day: 26,
    duration: 1
  },
  {
    id: 'democracy-day',
    name: { en: 'Democracy Day', ne: 'प्रजातन्त्र दिवस' },
    method: 'fixed_bs_date',
    type: 'public_holiday',
    category: 'national',
    description: { en: 'Commemoration of 2007 BS revolution', ne: '२००७ सालको क्रान्तिको सम्झना' },
    isPublicHoliday: true,
    month: 11, // Falgun
    day: 7,
    duration: 1
  },
  {
    id: 'may-day',
    name: { en: 'International Labour Day', ne: 'अन्तर्राष्ट्रिय श्रमिक दिवस' },
    method: 'fixed_bs_date',
    type: 'public_holiday',
    category: 'national',
    isPublicHoliday: true,
    month: 1, // Baishakh
    day: 18,
    duration: 1
  },
  {
    id: 'childrens-day',
    name: { en: "Children's Day", ne: 'बाल दिवस' },
    method: 'fixed_bs_date',
    type: 'festival',
    category: 'cultural',
    isPublicHoliday: false,
    month: 5, // Bhadra
    day: 28,
    duration: 1
  },
  {
    id: 'loktantra-day',
    name: { en: 'Loktantra Day (People\'s Movement Day)', ne: 'लोकतन्त्र दिवस' },
    method: 'fixed_bs_date',
    type: 'festival',
    category: 'national',
    description: { en: 'Commemoration of the 2063 BS People\'s Movement and restoration of parliament', ne: '२०६३ सालको जनआन्दोलन र संसद पुनर्स्थापनाको सम्झना' },
    isPublicHoliday: false,
    month: 1, // Baishakh
    day: 11,
    duration: 1
  },
  {
    id: 'constitution-day',
    name: { en: 'Constitution Day', ne: 'संविधान दिवस' },
    method: 'fixed_bs_date',
    type: 'public_holiday',
    category: 'national',
    description: { en: 'Commemoration of 2072 BS constitution promulgation', ne: '२०७२ सालको संविधान जारी भएको दिन' },
    isPublicHoliday: true,
    month: 6, // Ashwin
    day: 3,
    duration: 1
  },

  // ───────────────────────────────────────────────────────────────────────────
  // OTHER TITHI-BASED FESTIVALS
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'teej',
    name: { en: 'Harijika Teej (Women\'s Festival)', ne: 'हरितालिका तीज' },
    method: 'tithi_based',
    type: 'festival',
    category: 'cultural',
    description: { en: 'Women\'s festival, fasting for husband\'s long life', ne: 'महिलाहरूको व्रत, पतिको दीर्घायुको लागि' },
    isPublicHoliday: true,
    tithi: 3,
    paksha: 'shukla',
    searchMonth: 5, // Bhadra
    duration: 1
  },
  {
    id: 'janai-purnima',
    name: { en: 'Janai Purnima / Raksha Bandhan', ne: 'जनै पूर्णिमा / रक्षा बन्धन' },
    method: 'tithi_based',
    type: 'festival',
    category: 'religious',
    description: { en: 'Sacred thread changing day, brothers-sisters bonding', ne: 'जनै फेर्ने दिन, दाजु-बहिनीको सम्बन्ध' },
    isPublicHoliday: true,
    tithi: 15, // Purnima
    paksha: 'shukla',
    searchMonth: 4, // Shrawan
    duration: 1
  },
  {
    id: 'gokarna-aurasi',
    name: { en: 'Gokarna Aunsi (Father\'s Day)', ne: 'गोकर्ण औंसी (बुवाको दिन)' },
    method: 'tithi_based',
    type: 'festival',
    category: 'cultural',
    description: { en: 'Nepali Father\'s Day, worship of father', ne: 'नेपाली बुवाको दिन, बुवाको पूजा' },
    isPublicHoliday: true,
    tithi: 30, // Amavasya
    paksha: 'krishna',
    searchMonth: 5, // Bhadra
    duration: 1
  },
  {
    id: 'mata-tirtha-aunsi',
    name: { en: 'Mata Tirtha Aunsi (Mother\'s Day)', ne: 'माता तीर्थ औंसी (आमाको दिन)' },
    method: 'tithi_based',
    type: 'festival',
    category: 'cultural',
    description: { en: 'Nepali Mother\'s Day, pilgrimage to Mata Tirtha pond', ne: 'नेपाली आमाको दिन, माता तीर्थ कुण्डमा तीर्थ' },
    isPublicHoliday: true,
    tithi: 30, // Amavasya
    paksha: 'krishna',
    searchMonth: 1, // Baishakh
    duration: 1
  },
  {
    id: 'buddha-jayanti',
    name: { en: 'Buddha Jayanti (Buddha Purnima)', ne: 'बुद्ध जयन्ती (बुद्ध पूर्णिमा)' },
    method: 'tithi_based',
    type: 'festival',
    category: 'religious',
    description: { en: 'Birthday of Lord Buddha, pilgrimage to Lumbini', ne: 'गौतम बुद्धको जन्मजयन्ती, लुम्बिनीमा तीर्थ' },
    isPublicHoliday: true,
    tithi: 15, // Purnima
    paksha: 'shukla',
    searchMonth: 1, // Baishakh
    duration: 1
  },
  {
    id: 'gunla-purnima',
    name: { en: 'Gunla Purnima (Janai Purnima)', ne: 'गुंला पूर्णिमा (जनै पूर्णिमा)' },
    method: 'tithi_based',
    type: 'festival',
    category: 'religious',
    isPublicHoliday: true,
    tithi: 15,
    paksha: 'shukla',
    searchMonth: 4,
    duration: 1
  },
  {
    id: 'krishna-janmastami',
    name: { en: 'Krishna Janmastami', ne: 'कृष्ण जन्माष्टमी' },
    method: 'tithi_based',
    type: 'festival',
    category: 'religious',
    description: { en: 'Birthday of Lord Krishna, temple visits and fasting', ne: 'भगवान कृष्णको जन्मजयन्ती, मन्दिर दर्शन र व्रत' },
    isPublicHoliday: false,
    tithi: 23, // Ashtami (15 + 8)
    paksha: 'krishna',
    searchMonth: 5, // Bhadra
    duration: 1
  },
  {
    id: 'gaura-parva',
    name: { en: 'Gaura Parva', ne: 'गौरा पर्व' },
    method: 'tithi_based',
    type: 'festival',
    category: 'cultural',
    description: { en: 'Far-western Nepal festival, worship of Gaura Devi', ne: 'सुदूरपश्चिमको पर्व, गौरा देवीको पूजा' },
    isPublicHoliday: false,
    tithi: 11, // Ekadashi
    paksha: 'shukla',
    searchMonth: 5, // Bhadra
    duration: 4
  },
  {
    id: 'chhath-parva',
    name: { en: 'Chhath Parva', ne: 'छठ पर्व' },
    method: 'tithi_based',
    type: 'festival',
    category: 'religious',
    description: { en: 'Sun worship festival, 4-day fasting and river offerings', ne: 'सूर्य पूजा पर्व, ४ दिनको व्रत र नदीमा अर्घ्य' },
    isPublicHoliday: true,
    tithi: 6, // Shashthi
    paksha: 'shukla',
    searchMonth: 7, // Kartik
    duration: 4
  },
  {
    id: 'yomari-purnima',
    name: { en: 'Yomari Punhi', ne: 'योमरी पुन्ही' },
    method: 'tithi_based',
    type: 'festival',
    category: 'cultural',
    description: { en: 'Newar festival, worship of Annapurna, yomari delicacy', ne: 'नेवार पर्व, अन्नपूर्णको पूजा, योमरी परिकार' },
    isPublicHoliday: false,
    tithi: 15, // Purnima
    paksha: 'shukla',
    searchMonth: 9, // Mangsir
    duration: 1
  },
  {
    id: 'losar',
    name: { en: 'Tamu Losar (Gurung New Year)', ne: 'तमु लोसार (गुरुङ नयाँ वर्ष)' },
    method: 'fixed_bs_date',
    type: 'festival',
    category: 'cultural',
    description: { en: 'Gurung community New Year celebration', ne: 'गुरुङ समुदायको नयाँ वर्ष' },
    isPublicHoliday: false,
    month: 9, // Poush
    day: 15,
    duration: 1
  },
  {
    id: 'gyalpo-losar',
    name: { en: 'Gyalpo Losar (Sherpa/Tibetan New Year)', ne: 'ग्याल्पो लोसार (शेर्पा/तिब्बती नयाँ वर्ष)' },
    method: 'fixed_bs_date',
    type: 'festival',
    category: 'cultural',
    description: { en: 'Sherpa and Tibetan community New Year', ne: 'शेर्पा र तिब्बती समुदायको नयाँ वर्ष' },
    isPublicHoliday: false,
    month: 11, // Falgun
    day: 1,
    duration: 1
  },
  {
    id: 'sonam-losar',
    name: { en: 'Sonam Losar (Tamang New Year)', ne: 'सोनाम लोसार (तामाङ नयाँ वर्ष)' },
    method: 'fixed_bs_date',
    type: 'festival',
    category: 'cultural',
    description: { en: 'Tamang community New Year celebration', ne: 'तामाङ समुदायको नयाँ वर्ष' },
    isPublicHoliday: false,
    month: 10, // Magh
    day: 1,
    duration: 1
  },
  {
    id: 'maghi',
    name: { en: 'Maghi (Tharu New Year)', ne: 'माघी (थारु नयाँ वर्ष)' },
    method: 'fixed_bs_date',
    type: 'festival',
    category: 'cultural',
    description: { en: 'Tharu community New Year, celebrated with feasts', ne: 'थारु समुदायको नयाँ वर्ष, भोजसँगै मनाइन्छ' },
    isPublicHoliday: true,
    month: 10, // Magh
    day: 1,
    duration: 1
  },
  {
    id: 'shree-panchami',
    name: { en: 'Shree Panchami (Saraswati Puja)', ne: 'श्री पञ्चमी (सरस्वती पूजा)' },
    method: 'tithi_based',
    type: 'festival',
    category: 'religious',
    description: { en: 'Worship of Goddess Saraswati, students worship books', ne: 'देवी सरस्वतीको पूजा, विद्यार्थीहरूले किताबको पूजा गर्छन्' },
    isPublicHoliday: false,
    tithi: 5, // Panchami
    paksha: 'shukla',
    searchMonth: 11, // Magh
    duration: 1
  },
  {
    id: 'mahashivaratri',
    name: { en: 'Maha Shivaratri', ne: 'महा शिवरात्री' },
    method: 'tithi_based',
    type: 'festival',
    category: 'religious',
    isPublicHoliday: true,
    tithi: 29, // Chaturdashi
    paksha: 'krishna',
    searchMonth: 11, // Falgun
    duration: 1
  },
  {
    id: 'holy',
    name: { en: 'Holi (Fagu Purnima)', ne: 'होली (फागु पूर्णिमा)' },
    method: 'tithi_based',
    type: 'festival',
    category: 'cultural',
    description: { en: 'Festival of colors, celebration with colored powder', ne: 'रङको पर्व, रङ्गीन पाउडरसँगै मनाइन्छ' },
    isPublicHoliday: true,
    tithi: 15, // Purnima
    paksha: 'shukla',
    searchMonth: 11, // Falgun
    duration: 1
  },
  {
    id: 'ghode-jatra',
    name: { en: 'Ghode Jatra', ne: 'घोडे जात्रा' },
    method: 'tithi_based',
    type: 'festival',
    category: 'cultural',
    description: { en: 'Horse racing festival at Tundikhel, Kathmandu', ne: 'टुँडिखेलमा घोडदौड पर्व, काठमाडौं' },
    isPublicHoliday: true,
    tithi: 30, // Amavasya
    paksha: 'krishna',
    searchMonth: 12, // Chaitra
    duration: 1
  },
  {
    id: 'ram-navami',
    name: { en: 'Ram Navami', ne: 'राम नवमी' },
    method: 'tithi_based',
    type: 'festival',
    category: 'religious',
    description: { en: 'Birthday of Lord Rama', ne: 'भगवान रामको जन्मजयन्ती' },
    isPublicHoliday: false,
    tithi: 9, // Navami
    paksha: 'shukla',
    searchMonth: 12, // Chaitra
    duration: 1
  },
  {
    id: 'naga-panchami',
    name: { en: 'Naga Panchami', ne: 'नाग पञ्चमी' },
    method: 'tithi_based',
    type: 'festival',
    category: 'religious',
    description: { en: 'Worship of snake deity', ne: 'सर्प देवीको पूजा' },
    isPublicHoliday: false,
    tithi: 5, // Panchami
    paksha: 'shukla',
    searchMonth: 4, // Shrawan
    duration: 1
  },
  {
    id: 'raksha-bandhan',
    name: { en: 'Raksha Bandhan', ne: 'रक्षा बन्धन' },
    method: 'tithi_based',
    type: 'festival',
    category: 'cultural',
    description: { en: 'Brother-sister bonding festival', ne: 'दाजु-बहिनीको सम्बन्ध पर्व' },
    isPublicHoliday: false,
    tithi: 15, // Purnima
    paksha: 'shukla',
    searchMonth: 4, // Shrawan
    duration: 1
  },
  {
    id: 'kushe-aunsi',
    name: { en: 'Kushe Aunsi (Father\'s Day)', ne: 'कुशे औंसी (बुवाको दिन)' },
    method: 'tithi_based',
    type: 'festival',
    category: 'cultural',
    isPublicHoliday: true,
    tithi: 30, // Amavasya
    paksha: 'krishna',
    searchMonth: 5, // Bhadra
    duration: 1
  },
  {
    id: 'indrajatra',
    name: { en: 'Indra Jatra', ne: 'इन्द्र जात्रा' },
    method: 'tithi_based',
    type: 'festival',
    category: 'cultural',
    description: { en: 'Kathmandu\'s biggest street festival, Kumari procession', ne: 'काठमाडौंको ठूलो सडक पर्व, कुमारी झाँकी' },
    isPublicHoliday: false,
    tithi: 12, // Dwadashi
    paksha: 'shukla',
    searchMonth: 5, // Bhadra
    duration: 8
  },
  {
    id: 'manirimdu',
    name: { en: 'Mani Rimdu', ne: 'मणि रिम्दु' },
    method: 'tithi_based',
    type: 'festival',
    category: 'cultural',
    description: { en: 'Sherpa Buddhist festival with masked dances', ne: 'शेर्पा बौद्ध पर्व, मुखौटा नृत्यसँगै' },
    isPublicHoliday: false,
    tithi: 15, // Purnima
    paksha: 'shukla',
    searchMonth: 9, // Mangsir
    duration: 3
  },
  {
    id: 'ubhauli',
    name: { en: 'Sakela Ubhauli', ne: 'साकेला उभौली' },
    method: 'fixed_bs_date',
    type: 'festival',
    category: 'cultural',
    description: { en: 'Kirat community festival, worship of nature', ne: 'किरात समुदायको पर्व, प्रकृतिको पूजा' },
    isPublicHoliday: false,
    month: 1, // Baishakh
    day: 15,
    duration: 1
  },
  {
    id: 'udhauli',
    name: { en: 'Sakela Udhauli', ne: 'साकेला उधौली' },
    method: 'fixed_bs_date',
    type: 'festival',
    category: 'cultural',
    description: { en: 'Kirat community harvest festival', ne: 'किरात समुदायको कटाई पर्व' },
    isPublicHoliday: false,
    month: 9, // Mangsir
    day: 15,
    duration: 1
  },
  {
    id: 'chhath-krishna',
    name: { en: 'Chhath (Krishna Paksha)', ne: 'छठ (कृष्ण पक्ष)' },
    method: 'tithi_based',
    type: 'festival',
    category: 'religious',
    isPublicHoliday: false,
    tithi: 6, // Shashthi
    paksha: 'shukla',
    searchMonth: 12, // Chaitra
    duration: 4
  },
  {
    id: 'ekadashi-shukla',
    name: { en: 'Ekadashi (Shukla Paksha)', ne: 'एकादशी (शुक्ल पक्ष)' },
    method: 'tithi_based',
    type: 'inauspicious_period',
    category: 'religious',
    description: { en: 'Fasting day, Vishnu worship, avoid grains', ne: 'व्रत दिन, विष्णु पूजा, अन्न टाढा' },
    isPublicHoliday: false,
    tithi: 11,
    paksha: 'shukla',
    searchMonth: 1, // All months (handled specially)
    duration: 1
  },
  {
    id: 'ekadashi-krishna',
    name: { en: 'Ekadashi (Krishna Paksha)', ne: 'एकादशी (कृष्ण पक्ष)' },
    method: 'tithi_based',
    type: 'inauspicious_period',
    category: 'religious',
    isPublicHoliday: false,
    tithi: 26, // Krishna Ekadashi = 15 + 11
    paksha: 'krishna',
    searchMonth: 1, // All months
    duration: 1
  },

  // ───────────────────────────────────────────────────────────────────────────
  // INTERNATIONAL OBSERVANCE DAYS (fixed Gregorian dates)
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'world-braille-day',
    name: { en: 'World Braille Day', ne: 'विश्व ब्रेल दिवस' },
    method: 'fixed_ad_date',
    type: 'festival',
    category: 'general',
    description: { en: 'UN observance promoting accessibility and awareness of Braille', ne: 'ब्रेलप्रति पहुँच र सचेतना बढाउन संयुक्त राष्ट्रको दिवस' },
    isPublicHoliday: false,
    adMonth: 1, adDay: 4,
  },
  {
    id: 'international-day-of-education',
    name: { en: 'International Day of Education', ne: 'अन्तर्राष्ट्रिय शिक्षा दिवस' },
    method: 'fixed_ad_date',
    type: 'festival',
    category: 'general',
    description: { en: 'UN observance promoting inclusive and equitable quality education', ne: 'समावेशी र गुणस्तरीय शिक्षालाई प्रवर्द्धन गर्ने संयुक्त राष्ट्रको दिवस' },
    isPublicHoliday: false,
    adMonth: 1, adDay: 24,
  },
  {
    id: 'international-clean-energy-day',
    name: { en: 'International Day of Clean Energy', ne: 'स्वच्छ ऊर्जा अन्तर्राष्ट्रिय दिवस' },
    method: 'fixed_ad_date',
    type: 'festival',
    category: 'general',
    description: { en: 'UN observance promoting clean and affordable energy transitions', ne: 'स्वच्छ र किफायती ऊर्जाको रूपान्तरण प्रवर्द्धनका लागि संयुक्त राष्ट्रको दिवस' },
    isPublicHoliday: false,
    adMonth: 1, adDay: 26,
  },
  {
    id: 'international-holocaust-remembrance-day',
    name: { en: 'International Holocaust Remembrance Day', ne: 'अन्तर्राष्ट्रिय होलोकास्ट स्मरण दिवस' },
    method: 'fixed_ad_date',
    type: 'festival',
    category: 'general',
    description: { en: 'UN observance honoring victims of the Holocaust and promoting remembrance', ne: 'होलोकास्टका पीडितको सम्मान र स्मरणका लागि संयुक्त राष्ट्रको दिवस' },
    isPublicHoliday: false,
    adMonth: 1, adDay: 27,
  },
  {
    id: 'world-wetlands-day',
    name: { en: 'World Wetlands Day', ne: 'विश्व सिमसार दिवस' },
    method: 'fixed_ad_date',
    type: 'festival',
    category: 'general',
    description: { en: 'UN observance highlighting wetland conservation and restoration', ne: 'सिमसार संरक्षण र पुनर्स्थापनामा जोड दिने संयुक्त राष्ट्रको दिवस' },
    isPublicHoliday: false,
    adMonth: 2, adDay: 2,
  },
  {
    id: 'world-cancer-day',
    name: { en: 'World Cancer Day', ne: 'विश्व क्यान्सर दिवस' },
    method: 'fixed_ad_date',
    type: 'festival',
    category: 'general',
    description: { en: 'Global observance for cancer awareness, prevention and care', ne: 'क्यान्सर सचेतना, रोकथाम र उपचारका लागि विश्वव्यापी दिवस' },
    isPublicHoliday: false,
    adMonth: 2, adDay: 4,
  },
  {
    id: 'zero-tolerance-for-fgm-day',
    name: { en: 'International Day of Zero Tolerance for Female Genital Mutilation', ne: 'महिला जननाङ्ग विकृति विरुद्ध शून्य सहनशीलता दिवस' },
    method: 'fixed_ad_date',
    type: 'festival',
    category: 'general',
    description: { en: 'UN observance advocating elimination of female genital mutilation', ne: 'महिला जननाङ्ग विकृति अन्त्यका लागि संयुक्त राष्ट्रको दिवस' },
    isPublicHoliday: false,
    adMonth: 2, adDay: 6,
  },
  {
    id: 'women-and-girls-in-science-day',
    name: { en: 'International Day of Women and Girls in Science', ne: 'विज्ञानमा महिला तथा बालिका अन्तर्राष्ट्रिय दिवस' },
    method: 'fixed_ad_date',
    type: 'festival',
    category: 'general',
    description: { en: 'UN observance promoting equal access for women and girls in STEM', ne: 'STEM क्षेत्रमा महिला तथा बालिकाको समान पहुँच प्रवर्द्धनका लागि संयुक्त राष्ट्रको दिवस' },
    isPublicHoliday: false,
    adMonth: 2, adDay: 11,
  },
  {
    id: 'world-radio-day',
    name: { en: 'World Radio Day', ne: 'विश्व रेडियो दिवस' },
    method: 'fixed_ad_date',
    type: 'festival',
    category: 'general',
    description: { en: 'UNESCO observance recognizing radio as a powerful communication medium', ne: 'शक्तिशाली सञ्चार माध्यमका रूपमा रेडियोलाई मान्यता दिने युनेस्कोको दिवस' },
    isPublicHoliday: false,
    adMonth: 2, adDay: 13,
  },
  {
    id: 'valentines-day',
    name: { en: "Valentine's Day", ne: 'भ्यालेन्टाइन डे' },
    method: 'fixed_ad_date',
    type: 'festival',
    category: 'cultural',
    description: { en: 'Global observance celebrating love and relationships', ne: 'प्रेम र सम्बन्धलाई उत्सवका रूपमा मनाइने विश्वव्यापी दिवस' },
    isPublicHoliday: false,
    adMonth: 2, adDay: 14,
  },
  {
    id: 'world-day-of-social-justice',
    name: { en: 'World Day of Social Justice', ne: 'विश्व सामाजिक न्याय दिवस' },
    method: 'fixed_ad_date',
    type: 'festival',
    category: 'general',
    description: { en: 'UN observance focused on social justice, equality and inclusion', ne: 'सामाजिक न्याय, समानता र समावेशीकरणमा केन्द्रित संयुक्त राष्ट्रको दिवस' },
    isPublicHoliday: false,
    adMonth: 2, adDay: 20,
  },
  {
    id: 'international-mother-language-day',
    name: { en: 'International Mother Language Day', ne: 'अन्तर्राष्ट्रिय मातृभाषा दिवस' },
    method: 'fixed_ad_date',
    type: 'festival',
    category: 'cultural',
    description: { en: 'UNESCO observance to promote linguistic and cultural diversity', ne: 'भाषिक र सांस्कृतिक विविधता प्रवर्द्धनका लागि युनेस्कोको दिवस' },
    isPublicHoliday: false,
    adMonth: 2, adDay: 21,
  },
  {
    id: 'world-wildlife-day',
    name: { en: 'World Wildlife Day', ne: 'विश्व वन्यजन्तु दिवस' },
    method: 'fixed_ad_date',
    type: 'festival',
    category: 'general',
    description: { en: 'UN observance for wildlife conservation and biodiversity awareness', ne: 'वन्यजन्तु संरक्षण र जैविक विविधता सचेतनाका लागि संयुक्त राष्ट्रको दिवस' },
    isPublicHoliday: false,
    adMonth: 3, adDay: 3,
  },
  {
    id: 'international-womens-day',
    name: { en: "International Women's Day (UN)", ne: 'अन्तर्राष्ट्रिय महिला दिवस (UN)' },
    method: 'fixed_ad_date',
    type: 'festival',
    category: 'general',
    description: { en: 'UN observance for gender equality and women\'s rights', ne: 'लैङ्गिक समानता र महिला अधिकारको लागि संयुक्त राष्ट्रको दिवस' },
    isPublicHoliday: false,
    adMonth: 3, adDay: 8,
  },
  {
    id: 'international-day-of-happiness',
    name: { en: 'International Day of Happiness', ne: 'अन्तर्राष्ट्रिय खुशी दिवस' },
    method: 'fixed_ad_date',
    type: 'festival',
    category: 'general',
    description: { en: 'UN observance emphasizing wellbeing and happiness in public policy', ne: 'सार्वजनिक नीतिमा कल्याण र खुशीको महत्त्व जोड्ने संयुक्त राष्ट्रको दिवस' },
    isPublicHoliday: false,
    adMonth: 3, adDay: 20,
  },
  {
    id: 'international-day-of-forests',
    name: { en: 'International Day of Forests', ne: 'अन्तर्राष्ट्रिय वन दिवस' },
    method: 'fixed_ad_date',
    type: 'festival',
    category: 'general',
    description: { en: 'UN observance promoting conservation and sustainable management of forests', ne: 'वन संरक्षण र दिगो व्यवस्थापन प्रवर्द्धनका लागि संयुक्त राष्ट्रको दिवस' },
    isPublicHoliday: false,
    adMonth: 3, adDay: 21,
  },
  {
    id: 'world-water-day',
    name: { en: 'World Water Day', ne: 'विश्व जल दिवस' },
    method: 'fixed_ad_date',
    type: 'festival',
    category: 'general',
    description: { en: 'UN observance for freshwater conservation', ne: 'मिठो पानीको संरक्षणको लागि संयुक्त राष्ट्रको दिवस' },
    isPublicHoliday: false,
    adMonth: 3, adDay: 22,
  },
  {
    id: 'world-tuberculosis-day',
    name: { en: 'World Tuberculosis Day', ne: 'विश्व क्षयरोग दिवस' },
    method: 'fixed_ad_date',
    type: 'festival',
    category: 'general',
    description: { en: 'WHO observance raising awareness to end tuberculosis', ne: 'क्षयरोग अन्त्यका लागि सचेतना बढाउने WHO को दिवस' },
    isPublicHoliday: false,
    adMonth: 3, adDay: 24,
  },
  {
    id: 'world-autism-awareness-day',
    name: { en: 'World Autism Awareness Day', ne: 'विश्व अटिजम सचेतना दिवस' },
    method: 'fixed_ad_date',
    type: 'festival',
    category: 'general',
    description: { en: 'UN observance promoting inclusion and rights of autistic persons', ne: 'अटिजम भएका व्यक्तिहरूको समावेशीकरण र अधिकार प्रवर्द्धनका लागि संयुक्त राष्ट्रको दिवस' },
    isPublicHoliday: false,
    adMonth: 4, adDay: 2,
  },
  {
    id: 'international-day-of-sport-for-development-and-peace',
    name: { en: 'International Day of Sport for Development and Peace', ne: 'विकास र शान्तिका लागि अन्तर्राष्ट्रिय खेलकुद दिवस' },
    method: 'fixed_ad_date',
    type: 'festival',
    category: 'general',
    description: { en: 'UN observance highlighting sport as a tool for development and peace', ne: 'विकास र शान्तिका लागि खेलकुदको भूमिकालाई जोड दिने संयुक्त राष्ट्रको दिवस' },
    isPublicHoliday: false,
    adMonth: 4, adDay: 6,
  },
  {
    id: 'world-health-day',
    name: { en: 'World Health Day', ne: 'विश्व स्वास्थ्य दिवस' },
    method: 'fixed_ad_date',
    type: 'festival',
    category: 'general',
    description: { en: 'WHO annual observance to raise awareness about health', ne: 'स्वास्थ्यप्रति जागरुकता बढाउन WHO को वार्षिक दिवस' },
    isPublicHoliday: false,
    adMonth: 4, adDay: 7,
  },
  {
    id: 'world-earth-day',
    name: { en: 'World Earth Day', ne: 'विश्व पृथ्वी दिवस' },
    method: 'fixed_ad_date',
    type: 'festival',
    category: 'general',
    description: { en: 'Annual event to raise awareness about environmental protection', ne: 'पर्यावरण संरक्षणप्रति जागरुकताको लागि वार्षिक दिवस' },
    isPublicHoliday: false,
    adMonth: 4, adDay: 22,
  },
  {
    id: 'world-book-and-copyright-day',
    name: { en: 'World Book and Copyright Day', ne: 'विश्व पुस्तक तथा प्रतिलिपि अधिकार दिवस' },
    method: 'fixed_ad_date',
    type: 'festival',
    category: 'general',
    description: { en: 'UNESCO observance celebrating books, reading and copyright', ne: 'पुस्तक, पठन संस्कृति र प्रतिलिपि अधिकारलाई सम्मान गर्ने युनेस्कोको दिवस' },
    isPublicHoliday: false,
    adMonth: 4, adDay: 23,
  },
  {
    id: 'world-malaria-day',
    name: { en: 'World Malaria Day', ne: 'विश्व मलेरिया दिवस' },
    method: 'fixed_ad_date',
    type: 'festival',
    category: 'general',
    description: { en: 'WHO observance focused on malaria prevention and elimination', ne: 'मलेरिया रोकथाम र अन्त्यमा केन्द्रित WHO को दिवस' },
    isPublicHoliday: false,
    adMonth: 4, adDay: 25,
  },
  {
    id: 'world-press-freedom-day',
    name: { en: 'World Press Freedom Day', ne: 'विश्व प्रेस स्वतन्त्रता दिवस' },
    method: 'fixed_ad_date',
    type: 'festival',
    category: 'general',
    description: { en: 'UN observance defending media freedom and journalist safety', ne: 'सञ्चारमाध्यम स्वतन्त्रता र पत्रकार सुरक्षाका लागि संयुक्त राष्ट्रको दिवस' },
    isPublicHoliday: false,
    adMonth: 5, adDay: 3,
  },
  {
    id: 'international-day-of-families',
    name: { en: 'International Day of Families', ne: 'अन्तर्राष्ट्रिय परिवार दिवस' },
    method: 'fixed_ad_date',
    type: 'festival',
    category: 'general',
    description: { en: 'UN observance focused on family wellbeing and policy awareness', ne: 'परिवारको कल्याण र नीतिगत जागरुकतामा केन्द्रित संयुक्त राष्ट्रको दिवस' },
    isPublicHoliday: false,
    adMonth: 5, adDay: 15,
  },
  {
    id: 'international-day-for-biological-diversity',
    name: { en: 'International Day for Biological Diversity', ne: 'जैविक विविधता अन्तर्राष्ट्रिय दिवस' },
    method: 'fixed_ad_date',
    type: 'festival',
    category: 'general',
    description: { en: 'UN observance promoting protection of biodiversity', ne: 'जैविक विविधता संरक्षण प्रवर्द्धनका लागि संयुक्त राष्ट्रको दिवस' },
    isPublicHoliday: false,
    adMonth: 5, adDay: 22,
  },
  {
    id: 'world-no-tobacco-day',
    name: { en: 'World No Tobacco Day', ne: 'विश्व सुर्तीजन्य पदार्थ निषेध दिवस' },
    method: 'fixed_ad_date',
    type: 'festival',
    category: 'general',
    description: { en: 'WHO observance raising awareness of tobacco harms', ne: 'सुर्तीजन्य पदार्थका असरबारे सचेतना बढाउने WHO को दिवस' },
    isPublicHoliday: false,
    adMonth: 5, adDay: 31,
  },
  {
    id: 'world-bicycle-day',
    name: { en: 'World Bicycle Day', ne: 'विश्व साइकल दिवस' },
    method: 'fixed_ad_date',
    type: 'festival',
    category: 'general',
    description: { en: 'UN observance recognizing cycling for health, mobility and sustainability', ne: 'स्वास्थ्य, आवागमन र दिगोपनका लागि साइकलको महत्त्वलाई मान्यता दिने संयुक्त राष्ट्रको दिवस' },
    isPublicHoliday: false,
    adMonth: 6, adDay: 3,
  },
  {
    id: 'world-environment-day',
    name: { en: 'World Environment Day', ne: 'विश्व वातावरण दिवस' },
    method: 'fixed_ad_date',
    type: 'festival',
    category: 'general',
    description: { en: 'UN\'s principal vehicle for encouraging awareness and action for the environment', ne: 'वातावरणका लागि जागरुकता र कार्यका लागि संयुक्त राष्ट्रको प्रमुख माध्यम' },
    isPublicHoliday: false,
    adMonth: 6, adDay: 5,
  },
  {
    id: 'world-oceans-day',
    name: { en: 'World Oceans Day', ne: 'विश्व महासागर दिवस' },
    method: 'fixed_ad_date',
    type: 'festival',
    category: 'general',
    description: { en: 'UN observance promoting ocean conservation and sustainability', ne: 'महासागर संरक्षण र दिगोपन प्रवर्द्धनका लागि संयुक्त राष्ट्रको दिवस' },
    isPublicHoliday: false,
    adMonth: 6, adDay: 8,
  },
  {
    id: 'world-blood-donor-day',
    name: { en: 'World Blood Donor Day', ne: 'विश्व रक्तदाता दिवस' },
    method: 'fixed_ad_date',
    type: 'festival',
    category: 'general',
    description: { en: 'WHO observance honoring voluntary blood donors', ne: 'स्वेच्छिक रक्तदाताहरूको सम्मानमा WHO को दिवस' },
    isPublicHoliday: false,
    adMonth: 6, adDay: 14,
  },
  {
    id: 'world-refugee-day',
    name: { en: 'World Refugee Day', ne: 'विश्व शरणार्थी दिवस' },
    method: 'fixed_ad_date',
    type: 'festival',
    category: 'general',
    description: { en: 'UN observance honoring the strength and rights of refugees', ne: 'शरणार्थीहरूको अधिकार र संघर्षलाई सम्मान गर्ने संयुक्त राष्ट्रको दिवस' },
    isPublicHoliday: false,
    adMonth: 6, adDay: 20,
  },
  {
    id: 'international-yoga-day',
    name: { en: 'International Yoga Day', ne: 'अन्तर्राष्ट्रिय योग दिवस' },
    method: 'fixed_ad_date',
    type: 'festival',
    category: 'general',
    description: { en: 'UN observance to raise awareness about the benefits of yoga', ne: 'योगको फाइदाप्रति जागरुकताको लागि संयुक्त राष्ट्रको दिवस' },
    isPublicHoliday: false,
    adMonth: 6, adDay: 21,
  },
  {
    id: 'world-population-day',
    name: { en: 'World Population Day', ne: 'विश्व जनसंख्या दिवस' },
    method: 'fixed_ad_date',
    type: 'festival',
    category: 'general',
    description: { en: 'UN observance highlighting population and development issues', ne: 'जनसंख्या र विकास सम्बन्धी विषयमा ध्यानाकर्षण गर्ने संयुक्त राष्ट्रको दिवस' },
    isPublicHoliday: false,
    adMonth: 7, adDay: 11,
  },
  {
    id: 'world-youth-skills-day',
    name: { en: 'World Youth Skills Day', ne: 'विश्व युवा सीप दिवस' },
    method: 'fixed_ad_date',
    type: 'festival',
    category: 'general',
    description: { en: 'UN observance promoting youth skills for employment and entrepreneurship', ne: 'रोजगारी र उद्यमशीलताका लागि युवाको सीप प्रवर्द्धन गर्ने संयुक्त राष्ट्रको दिवस' },
    isPublicHoliday: false,
    adMonth: 7, adDay: 15,
  },
  {
    id: 'world-hepatitis-day',
    name: { en: 'World Hepatitis Day', ne: 'विश्व हेपाटाइटिस दिवस' },
    method: 'fixed_ad_date',
    type: 'festival',
    category: 'general',
    description: { en: 'WHO observance for prevention, testing and treatment of hepatitis', ne: 'हेपाटाइटिस रोकथाम, परीक्षण र उपचारका लागि WHO को दिवस' },
    isPublicHoliday: false,
    adMonth: 7, adDay: 28,
  },
  {
    id: 'international-friendship-day',
    name: { en: 'International Day of Friendship', ne: 'अन्तर्राष्ट्रिय मित्रता दिवस' },
    method: 'fixed_ad_date',
    type: 'festival',
    category: 'cultural',
    description: { en: 'UN observance promoting friendship among peoples and cultures', ne: 'समुदाय र संस्कृतिबीच मित्रता प्रवर्द्धन गर्ने संयुक्त राष्ट्रको दिवस' },
    isPublicHoliday: false,
    adMonth: 7, adDay: 30,
  },
  {
    id: 'international-youth-day',
    name: { en: 'International Youth Day', ne: 'अन्तर्राष्ट्रिय युवा दिवस' },
    method: 'fixed_ad_date',
    type: 'festival',
    category: 'general',
    description: { en: 'UN observance celebrating youth contribution and empowerment', ne: 'युवाको योगदान र सशक्तीकरणलाई मान्यता दिने संयुक्त राष्ट्रको दिवस' },
    isPublicHoliday: false,
    adMonth: 8, adDay: 12,
  },
  {
    id: 'world-humanitarian-day',
    name: { en: 'World Humanitarian Day', ne: 'विश्व मानवीय दिवस' },
    method: 'fixed_ad_date',
    type: 'festival',
    category: 'general',
    description: { en: 'UN observance honoring humanitarian workers and affected communities', ne: 'मानवीय सेवाकर्मी र प्रभावित समुदायको सम्मानमा संयुक्त राष्ट्रको दिवस' },
    isPublicHoliday: false,
    adMonth: 8, adDay: 19,
  },
  {
    id: 'international-day-of-clean-air',
    name: { en: 'International Day of Clean Air for blue skies', ne: 'स्वच्छ वायुमण्डलका लागि अन्तर्राष्ट्रिय दिवस' },
    method: 'fixed_ad_date',
    type: 'festival',
    category: 'general',
    description: { en: 'UN observance focused on air quality and pollution reduction', ne: 'वायु गुणस्तर र प्रदूषण न्यूनीकरणमा केन्द्रित संयुक्त राष्ट्रको दिवस' },
    isPublicHoliday: false,
    adMonth: 9, adDay: 7,
  },
  {
    id: 'international-literacy-day',
    name: { en: 'International Literacy Day', ne: 'अन्तर्राष्ट्रिय साक्षरता दिवस' },
    method: 'fixed_ad_date',
    type: 'festival',
    category: 'general',
    description: { en: 'UNESCO observance promoting literacy for all', ne: 'सबैका लागि साक्षरतामा जोड दिने युनेस्कोको दिवस' },
    isPublicHoliday: false,
    adMonth: 9, adDay: 8,
  },
  {
    id: 'international-democracy-day',
    name: { en: 'International Day of Democracy', ne: 'अन्तर्राष्ट्रिय लोकतन्त्र दिवस' },
    method: 'fixed_ad_date',
    type: 'festival',
    category: 'general',
    description: { en: 'UN observance to promote democratic governance', ne: 'लोकतान्त्रिक शासनलाई बढावा दिन संयुक्त राष्ट्रको दिवस' },
    isPublicHoliday: false,
    adMonth: 9, adDay: 15,
  },
  {
    id: 'world-ozone-day',
    name: { en: 'World Ozone Day', ne: 'विश्व ओजोन दिवस' },
    method: 'fixed_ad_date',
    type: 'festival',
    category: 'general',
    description: { en: 'UN observance for protection of the ozone layer', ne: 'ओजोन तहको संरक्षणका लागि संयुक्त राष्ट्रको दिवस' },
    isPublicHoliday: false,
    adMonth: 9, adDay: 16,
  },
  {
    id: 'world-patient-safety-day',
    name: { en: 'World Patient Safety Day', ne: 'विश्व बिरामी सुरक्षा दिवस' },
    method: 'fixed_ad_date',
    type: 'festival',
    category: 'general',
    description: { en: 'WHO observance promoting safer healthcare systems', ne: 'सुरक्षित स्वास्थ्य सेवा प्रणाली प्रवर्द्धनका लागि WHO को दिवस' },
    isPublicHoliday: false,
    adMonth: 9, adDay: 17,
  },
  {
    id: 'international-day-of-peace',
    name: { en: 'International Day of Peace', ne: 'अन्तर्राष्ट्रिय शान्ति दिवस' },
    method: 'fixed_ad_date',
    type: 'festival',
    category: 'general',
    description: { en: 'UN observance dedicated to strengthening ideals of peace', ne: 'शान्तिको आदर्शलाई सुदृढ बनाउन समर्पित संयुक्त राष्ट्रको दिवस' },
    isPublicHoliday: false,
    adMonth: 9, adDay: 21,
  },
  {
    id: 'international-day-for-universal-access-to-information',
    name: { en: 'International Day for Universal Access to Information', ne: 'सूचनामा सार्वभौमिक पहुँच अन्तर्राष्ट्रिय दिवस' },
    method: 'fixed_ad_date',
    type: 'festival',
    category: 'general',
    description: { en: 'UN observance supporting transparent and accessible public information', ne: 'पारदर्शी र सुलभ सार्वजनिक सूचनाका लागि संयुक्त राष्ट्रको दिवस' },
    isPublicHoliday: false,
    adMonth: 9, adDay: 28,
  },
  {
    id: 'international-day-of-older-persons',
    name: { en: 'International Day of Older Persons', ne: 'ज्येष्ठ नागरिक अन्तर्राष्ट्रिय दिवस' },
    method: 'fixed_ad_date',
    type: 'festival',
    category: 'general',
    description: { en: 'UN observance recognizing rights and wellbeing of older persons', ne: 'ज्येष्ठ नागरिकको अधिकार र कल्याणलाई मान्यता दिने संयुक्त राष्ट्रको दिवस' },
    isPublicHoliday: false,
    adMonth: 10, adDay: 1,
  },
  {
    id: 'international-day-of-non-violence',
    name: { en: 'International Day of Non-Violence', ne: 'अहिंसा अन्तर्राष्ट्रिय दिवस' },
    method: 'fixed_ad_date',
    type: 'festival',
    category: 'general',
    description: { en: 'UN observance promoting peace and non-violent values', ne: 'शान्ति र अहिंसात्मक मूल्य प्रवर्द्धनका लागि संयुक्त राष्ट्रको दिवस' },
    isPublicHoliday: false,
    adMonth: 10, adDay: 2,
  },
  {
    id: 'world-teachers-day',
    name: { en: "World Teachers' Day", ne: 'विश्व शिक्षक दिवस' },
    method: 'fixed_ad_date',
    type: 'festival',
    category: 'general',
    description: { en: 'UNESCO observance recognizing the role of teachers', ne: 'शिक्षकहरूको भूमिकाको सम्मानमा युनेस्कोको दिवस' },
    isPublicHoliday: false,
    adMonth: 10, adDay: 5,
  },
  {
    id: 'world-mental-health-day',
    name: { en: 'World Mental Health Day', ne: 'विश्व मानसिक स्वास्थ्य दिवस' },
    method: 'fixed_ad_date',
    type: 'festival',
    category: 'general',
    description: { en: 'WHO observance to raise awareness about mental health', ne: 'मानसिक स्वास्थ्यप्रति जागरुकताको लागि WHO को दिवस' },
    isPublicHoliday: false,
    adMonth: 10, adDay: 10,
  },
  {
    id: 'international-day-of-the-girl-child',
    name: { en: 'International Day of the Girl Child', ne: 'बालिका दिवस' },
    method: 'fixed_ad_date',
    type: 'festival',
    category: 'general',
    description: { en: 'UN observance promoting rights and opportunities for girls', ne: 'बालिकाको अधिकार र अवसर प्रवर्द्धनका लागि संयुक्त राष्ट्रको दिवस' },
    isPublicHoliday: false,
    adMonth: 10, adDay: 11,
  },
  {
    id: 'world-food-day',
    name: { en: 'World Food Day', ne: 'विश्व खाद्य दिवस' },
    method: 'fixed_ad_date',
    type: 'festival',
    category: 'general',
    description: { en: 'UN observance highlighting food security and nutrition', ne: 'खाद्य सुरक्षा र पोषणमा केन्द्रित संयुक्त राष्ट्रको दिवस' },
    isPublicHoliday: false,
    adMonth: 10, adDay: 16,
  },
  {
    id: 'world-science-day-for-peace-and-development',
    name: { en: 'World Science Day for Peace and Development', ne: 'शान्ति र विकासका लागि विश्व विज्ञान दिवस' },
    method: 'fixed_ad_date',
    type: 'festival',
    category: 'general',
    description: { en: 'UNESCO observance connecting science with peace and development goals', ne: 'विज्ञानलाई शान्ति र विकास लक्ष्यसँग जोड्ने युनेस्कोको दिवस' },
    isPublicHoliday: false,
    adMonth: 11, adDay: 10,
  },
  {
    id: 'world-diabetes-day',
    name: { en: 'World Diabetes Day', ne: 'विश्व मधुमेह दिवस' },
    method: 'fixed_ad_date',
    type: 'festival',
    category: 'general',
    description: { en: 'Global health observance focused on diabetes prevention and care', ne: 'मधुमेह रोकथाम र उपचारमा केन्द्रित विश्व स्वास्थ्य सम्बन्धी दिवस' },
    isPublicHoliday: false,
    adMonth: 11, adDay: 14,
  },
  {
    id: 'international-day-for-tolerance',
    name: { en: 'International Day for Tolerance', ne: 'सहिष्णुता अन्तर्राष्ट्रिय दिवस' },
    method: 'fixed_ad_date',
    type: 'festival',
    category: 'general',
    description: { en: 'UN observance promoting respect, tolerance and diversity', ne: 'सम्मान, सहिष्णुता र विविधताको प्रवर्द्धनका लागि संयुक्त राष्ट्रको दिवस' },
    isPublicHoliday: false,
    adMonth: 11, adDay: 16,
  },
  {
    id: 'world-toilet-day',
    name: { en: 'World Toilet Day', ne: 'विश्व शौचालय दिवस' },
    method: 'fixed_ad_date',
    type: 'festival',
    category: 'general',
    description: { en: 'UN observance focused on sanitation and safe toilet access', ne: 'सरसफाइ र सुरक्षित शौचालय पहुँचमा केन्द्रित संयुक्त राष्ट्रको दिवस' },
    isPublicHoliday: false,
    adMonth: 11, adDay: 19,
  },
  {
    id: 'international-childrens-day-un',
    name: { en: "Universal Children's Day (UN)", ne: 'अन्तर्राष्ट्रिय बाल दिवस (UN)' },
    method: 'fixed_ad_date',
    type: 'festival',
    category: 'cultural',
    description: { en: 'UN observance for the welfare and rights of children worldwide', ne: 'विश्वभरका बालबालिकाको कल्याण र अधिकारका लागि UN को दिवस' },
    isPublicHoliday: false,
    adMonth: 11, adDay: 20,
  },
  {
    id: 'elimination-of-violence-against-women-day',
    name: { en: 'International Day for the Elimination of Violence against Women', ne: 'महिलामाथि हिंसा उन्मूलन अन्तर्राष्ट्रिय दिवस' },
    method: 'fixed_ad_date',
    type: 'festival',
    category: 'general',
    description: { en: 'UN observance to prevent and eliminate violence against women and girls', ne: 'महिला तथा बालिकामाथि हुने हिंसा रोकथाम र उन्मूलनका लागि संयुक्त राष्ट्रको दिवस' },
    isPublicHoliday: false,
    adMonth: 11, adDay: 25,
  },
  {
    id: 'world-aids-day',
    name: { en: 'World AIDS Day', ne: 'विश्व एड्स दिवस' },
    method: 'fixed_ad_date',
    type: 'festival',
    category: 'general',
    description: { en: 'Global observance for HIV awareness, prevention and solidarity', ne: 'एचआईभी सचेतना, रोकथाम र ऐक्यबद्धताका लागि विश्वव्यापी दिवस' },
    isPublicHoliday: false,
    adMonth: 12, adDay: 1,
  },
  {
    id: 'abolition-of-slavery-day',
    name: { en: 'International Day for the Abolition of Slavery', ne: 'दासप्रथा उन्मूलन अन्तर्राष्ट्रिय दिवस' },
    method: 'fixed_ad_date',
    type: 'festival',
    category: 'general',
    description: { en: 'UN observance calling for elimination of modern slavery and exploitation', ne: 'आधुनिक दासता र शोषण अन्त्यका लागि संयुक्त राष्ट्रको दिवस' },
    isPublicHoliday: false,
    adMonth: 12, adDay: 2,
  },
  {
    id: 'international-day-of-persons-with-disabilities',
    name: { en: 'International Day of Persons with Disabilities', ne: 'अपाङ्गता भएका व्यक्तिहरूको अन्तर्राष्ट्रिय दिवस' },
    method: 'fixed_ad_date',
    type: 'festival',
    category: 'general',
    description: { en: 'UN observance advancing rights and inclusion of persons with disabilities', ne: 'अपाङ्गता भएका व्यक्तिहरूको अधिकार र समावेशीकरण प्रवर्द्धनका लागि संयुक्त राष्ट्रको दिवस' },
    isPublicHoliday: false,
    adMonth: 12, adDay: 3,
  },
  {
    id: 'international-volunteer-day',
    name: { en: 'International Volunteer Day', ne: 'अन्तर्राष्ट्रिय स्वयंसेवक दिवस' },
    method: 'fixed_ad_date',
    type: 'festival',
    category: 'general',
    description: { en: 'UN observance recognizing volunteerism and civic participation', ne: 'स्वयंसेवा र नागरिक सहभागिताको सम्मानमा संयुक्त राष्ट्रको दिवस' },
    isPublicHoliday: false,
    adMonth: 12, adDay: 5,
  },
  {
    id: 'international-human-rights-day',
    name: { en: 'International Human Rights Day', ne: 'अन्तर्राष्ट्रिय मानव अधिकार दिवस' },
    method: 'fixed_ad_date',
    type: 'festival',
    category: 'general',
    description: { en: 'UN observance marking the adoption of the Universal Declaration of Human Rights', ne: 'मानव अधिकारको विश्वव्यापी घोषणापत्र अपनाइएको स्मृतिमा UN को दिवस' },
    isPublicHoliday: false,
    adMonth: 12, adDay: 10,
  },
  {
    id: 'universal-health-coverage-day',
    name: { en: 'Universal Health Coverage Day', ne: 'सार्वभौमिक स्वास्थ्य सेवाको दिवस' },
    method: 'fixed_ad_date',
    type: 'festival',
    category: 'general',
    description: { en: 'Global observance advocating quality, affordable healthcare for all', ne: 'सबैका लागि गुणस्तरीय र किफायती स्वास्थ्य सेवाको पक्षमा मनाइने विश्वव्यापी दिवस' },
    isPublicHoliday: false,
    adMonth: 12, adDay: 12,
  },
  {
    id: 'international-migrants-day',
    name: { en: 'International Migrants Day', ne: 'अन्तर्राष्ट्रिय आप्रवासी दिवस' },
    method: 'fixed_ad_date',
    type: 'festival',
    category: 'general',
    description: { en: 'UN observance recognizing rights and dignity of migrants', ne: 'आप्रवासीहरूको अधिकार र गरिमाको सम्मानमा संयुक्त राष्ट्रको दिवस' },
    isPublicHoliday: false,
    adMonth: 12, adDay: 18,
  },
  {
    id: 'international-human-solidarity-day',
    name: { en: 'International Human Solidarity Day', ne: 'मानव ऐक्यबद्धता अन्तर्राष्ट्रिय दिवस' },
    method: 'fixed_ad_date',
    type: 'festival',
    category: 'general',
    description: { en: 'UN observance promoting global solidarity to address shared challenges', ne: 'साझा चुनौती समाधानका लागि विश्वव्यापी ऐक्यबद्धता प्रवर्द्धन गर्ने संयुक्त राष्ट्रको दिवस' },
    isPublicHoliday: false,
    adMonth: 12, adDay: 20,
  },
]
