/**
 * Yoga names in English and Nepali.
 *
 * Yoga is derived from the combined ecliptic longitude of the Sun and Moon:
 *   yoga = floor((sun_lon + moon_lon) % 360 / (360/27)) + 1
 *
 * There are 27 yogas, numbered 1–27.
 * Vishkambha and Vaidhriti are considered inauspicious.
 * Vyatipata is also highly inauspicious in muhurta selection.
 */
export const YOGA_NAMES: ReadonlyArray<{ number: number; en: string; ne: string }> = [
  { number:  1, en: 'Vishkambha', ne: 'विष्कम्भ'  },
  { number:  2, en: 'Priti',      ne: 'प्रीति'     },
  { number:  3, en: 'Ayushman',   ne: 'आयुष्मान्'  },
  { number:  4, en: 'Saubhagya',  ne: 'सौभाग्य'    },
  { number:  5, en: 'Shobhana',   ne: 'शोभन'       },
  { number:  6, en: 'Atiganda',   ne: 'अतिगण्ड'    },
  { number:  7, en: 'Sukarma',    ne: 'सुकर्म'     },
  { number:  8, en: 'Dhriti',     ne: 'धृति'       },
  { number:  9, en: 'Shoola',     ne: 'शूल'        },
  { number: 10, en: 'Ganda',      ne: 'गण्ड'       },
  { number: 11, en: 'Vriddhi',    ne: 'वृद्धि'     },
  { number: 12, en: 'Dhruva',     ne: 'ध्रुव'      },
  { number: 13, en: 'Vyaghata',   ne: 'व्याघात'    },
  { number: 14, en: 'Harshana',   ne: 'हर्षण'      },
  { number: 15, en: 'Vajra',      ne: 'वज्र'       },
  { number: 16, en: 'Siddhi',     ne: 'सिद्धि'     },
  { number: 17, en: 'Vyatipata',  ne: 'व्यतीपात'   },
  { number: 18, en: 'Variyan',    ne: 'वरीयान्'    },
  { number: 19, en: 'Parigha',    ne: 'परिघ'       },
  { number: 20, en: 'Shiva',      ne: 'शिव'        },
  { number: 21, en: 'Siddha',     ne: 'सिद्ध'      },
  { number: 22, en: 'Sadhya',     ne: 'साध्य'      },
  { number: 23, en: 'Shubha',     ne: 'शुभ'        },
  { number: 24, en: 'Shukla',     ne: 'शुक्ल'      },
  { number: 25, en: 'Brahma',     ne: 'ब्रह्म'     },
  { number: 26, en: 'Indra',      ne: 'इन्द्र'     },
  { number: 27, en: 'Vaidhriti',  ne: 'वैधृति'     },
]

const _yogaByNumber = new Map(YOGA_NAMES.map(y => [y.number, y]))

export function getYogaByNumber(number: number): { en: string; ne: string; number: number } {
  const yoga = _yogaByNumber.get(number)
  if (yoga === undefined) {
    throw new RangeError(`Invalid yoga number: ${number}. Must be 1–27.`)
  }
  return yoga
}
