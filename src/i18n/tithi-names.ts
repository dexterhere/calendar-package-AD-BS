// 30 tithis: 1–15 Shukla Paksha, then 1–15 Krishna Paksha
// Tithi 15 in Shukla = Purnima (full moon), tithi 15 in Krishna = Amavasya (new moon)
export const TITHI_NAMES: Array<{ en: string; ne: string; number: number }> = [
  { number: 1,  en: 'Pratipada',  ne: 'प्रतिपदा'  },
  { number: 2,  en: 'Dwitiya',    ne: 'द्वितीया'  },
  { number: 3,  en: 'Tritiya',    ne: 'तृतीया'    },
  { number: 4,  en: 'Chaturthi',  ne: 'चतुर्थी'   },
  { number: 5,  en: 'Panchami',   ne: 'पञ्चमी'    },
  { number: 6,  en: 'Shashthi',   ne: 'षष्ठी'    },
  { number: 7,  en: 'Saptami',    ne: 'सप्तमी'    },
  { number: 8,  en: 'Ashtami',    ne: 'अष्टमी'    },
  { number: 9,  en: 'Navami',     ne: 'नवमी'      },
  { number: 10, en: 'Dashami',    ne: 'दशमी'      },
  { number: 11, en: 'Ekadashi',   ne: 'एकादशी'    },
  { number: 12, en: 'Dwadashi',   ne: 'द्वादशी'   },
  { number: 13, en: 'Trayodashi', ne: 'त्रयोदशी'  },
  { number: 14, en: 'Chaturdashi',ne: 'चतुर्दशी'  },
  { number: 15, en: 'Purnima',    ne: 'पूर्णिमा'  }, // Shukla 15 (full moon)
  // Krishna Paksha reuses numbers 1–14, with 15 = Amavasya
  { number: 30, en: 'Amavasya',   ne: 'औंसी'      }, // stored as 30 to distinguish from Shukla 15
]

export function getTithiName(number: number): { en: string; ne: string; number: number } {
  const tithi = TITHI_NAMES.find(t => t.number === number)
  if (tithi === undefined) {
    throw new RangeError(`Invalid tithi number: ${number}`)
  }
  return tithi
}
