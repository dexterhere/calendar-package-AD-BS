// 27 nakshatras (lunar mansions), indexed 1–27
export const NAKSHATRA_NAMES: ReadonlyArray<{ en: string; ne: string; number: number }> = [
  { number: 1,  en: 'Ashwini',            ne: 'अश्विनी'       },
  { number: 2,  en: 'Bharani',            ne: 'भरणी'          },
  { number: 3,  en: 'Krittika',           ne: 'कृत्तिका'      },
  { number: 4,  en: 'Rohini',             ne: 'रोहिणी'        },
  { number: 5,  en: 'Mrigashira',         ne: 'मृगशिरा'       },
  { number: 6,  en: 'Ardra',              ne: 'आर्द्रा'        },
  { number: 7,  en: 'Punarvasu',          ne: 'पुनर्वसु'      },
  { number: 8,  en: 'Pushya',             ne: 'पुष्य'         },
  { number: 9,  en: 'Ashlesha',           ne: 'आश्लेषा'       },
  { number: 10, en: 'Magha',              ne: 'मघा'           },
  { number: 11, en: 'Purva Phalguni',     ne: 'पूर्व फाल्गुनी' },
  { number: 12, en: 'Uttara Phalguni',    ne: 'उत्तर फाल्गुनी' },
  { number: 13, en: 'Hasta',              ne: 'हस्त'          },
  { number: 14, en: 'Chitra',             ne: 'चित्रा'        },
  { number: 15, en: 'Swati',              ne: 'स्वाती'        },
  { number: 16, en: 'Vishakha',           ne: 'विशाखा'        },
  { number: 17, en: 'Anuradha',           ne: 'अनुराधा'       },
  { number: 18, en: 'Jyeshtha',           ne: 'ज्येष्ठा'      },
  { number: 19, en: 'Mula',               ne: 'मूल'           },
  { number: 20, en: 'Purva Ashadha',      ne: 'पूर्वाषाढा'    },
  { number: 21, en: 'Uttara Ashadha',     ne: 'उत्तराषाढा'    },
  { number: 22, en: 'Shravana',           ne: 'श्रवण'         },
  { number: 23, en: 'Dhanishtha',         ne: 'धनिष्ठा'       },
  { number: 24, en: 'Shatabhisha',        ne: 'शतभिषा'        },
  { number: 25, en: 'Purva Bhadrapada',   ne: 'पूर्वभाद्रपदा' },
  { number: 26, en: 'Uttara Bhadrapada',  ne: 'उत्तरभाद्रपदा' },
  { number: 27, en: 'Revati',             ne: 'रेवती'         },
]

const _nakshatraByNumber = new Map(NAKSHATRA_NAMES.map(n => [n.number, n]))

export function getNakshatraByNumber(number: number): { en: string; ne: string; number: number } {
  const n = _nakshatraByNumber.get(number)
  if (n === undefined) {
    throw new RangeError(`Invalid nakshatra number: ${number}. Must be 1–27.`)
  }
  return n
}
