/**
 * Tithi (lunar day) names in English and Nepali.
 *
 * A lunar month has 30 tithis:
 *   - Shukla Paksha (bright fortnight): tithis 1–14, plus 15 = Purnima (full moon)
 *   - Krishna Paksha (dark fortnight):  tithis 16–29 (mapped as 1–14), plus 30 = Amavasya (new moon)
 *
 * In this package, tithi numbers follow the continuous 1–30 scheme:
 *   1–15  = Shukla Paksha (15 = Purnima)
 *   16–30 = Krishna Paksha (16 = Krishna Pratipada, ..., 30 = Amavasya)
 *
 * The paksha field on PanchangInfo disambiguates when needed.
 */
export const TITHI_NAMES: ReadonlyArray<{ en: string; ne: string; number: number }> = [
  // ── Shukla Paksha ──────────────────────────────────────────────────────────
  { number: 1,  en: 'Pratipada',   ne: 'प्रतिपदा'  },
  { number: 2,  en: 'Dwitiya',     ne: 'द्वितीया'  },
  { number: 3,  en: 'Tritiya',     ne: 'तृतीया'    },
  { number: 4,  en: 'Chaturthi',   ne: 'चतुर्थी'   },
  { number: 5,  en: 'Panchami',    ne: 'पञ्चमी'    },
  { number: 6,  en: 'Shashthi',    ne: 'षष्ठी'     },
  { number: 7,  en: 'Saptami',     ne: 'सप्तमी'    },
  { number: 8,  en: 'Ashtami',     ne: 'अष्टमी'    },
  { number: 9,  en: 'Navami',      ne: 'नवमी'      },
  { number: 10, en: 'Dashami',     ne: 'दशमी'      },
  { number: 11, en: 'Ekadashi',    ne: 'एकादशी'    },
  { number: 12, en: 'Dwadashi',    ne: 'द्वादशी'   },
  { number: 13, en: 'Trayodashi',  ne: 'त्रयोदशी'  },
  { number: 14, en: 'Chaturdashi', ne: 'चतुर्दशी'  },
  { number: 15, en: 'Purnima',     ne: 'पूर्णिमा'  },
  // ── Krishna Paksha ─────────────────────────────────────────────────────────
  { number: 16, en: 'Pratipada',   ne: 'प्रतिपदा'  },
  { number: 17, en: 'Dwitiya',     ne: 'द्वितीया'  },
  { number: 18, en: 'Tritiya',     ne: 'तृतीया'    },
  { number: 19, en: 'Chaturthi',   ne: 'चतुर्थी'   },
  { number: 20, en: 'Panchami',    ne: 'पञ्चमी'    },
  { number: 21, en: 'Shashthi',    ne: 'षष्ठी'     },
  { number: 22, en: 'Saptami',     ne: 'सप्तमी'    },
  { number: 23, en: 'Ashtami',     ne: 'अष्टमी'    },
  { number: 24, en: 'Navami',      ne: 'नवमी'      },
  { number: 25, en: 'Dashami',     ne: 'दशमी'      },
  { number: 26, en: 'Ekadashi',    ne: 'एकादशी'    },
  { number: 27, en: 'Dwadashi',    ne: 'द्वादशी'   },
  { number: 28, en: 'Trayodashi',  ne: 'त्रयोदशी'  },
  { number: 29, en: 'Chaturdashi', ne: 'चतुर्दशी'  },
  { number: 30, en: 'Amavasya',    ne: 'औंसी'      },
]

// Pre-built lookup map for O(1) access
const _tithiByNumber = new Map(TITHI_NAMES.map(t => [t.number, t]))

export function getTithiByNumber(number: number): { en: string; ne: string; number: number } {
  const tithi = _tithiByNumber.get(number)
  if (tithi === undefined) {
    throw new RangeError(`Invalid tithi number: ${number}. Must be 1–30.`)
  }
  return tithi
}
