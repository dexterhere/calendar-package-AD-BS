// BS months: index 0 = Baishakh (month 1), index 11 = Chaitra (month 12)
export const BS_MONTHS: Array<{ en: string; ne: string; romanized: string }> = [
  { en: 'Baishakh',   ne: 'बैशाख',    romanized: 'Baisakh'   },
  { en: 'Jestha',     ne: 'जेठ',      romanized: 'Jestha'    },
  { en: 'Ashadh',     ne: 'असार',     romanized: 'Ashadh'    },
  { en: 'Shrawan',    ne: 'साउन',     romanized: 'Shrawan'   },
  { en: 'Bhadra',     ne: 'भदौ',      romanized: 'Bhadra'    },
  { en: 'Ashwin',     ne: 'असोज',     romanized: 'Ashwin'    },
  { en: 'Kartik',     ne: 'कार्तिक',  romanized: 'Kartik'    },
  { en: 'Mangsir',    ne: 'मंसिर',    romanized: 'Mangsir'   },
  { en: 'Poush',      ne: 'पुस',      romanized: 'Poush'     },
  { en: 'Magh',       ne: 'माघ',      romanized: 'Magh'      },
  { en: 'Falgun',     ne: 'फागुन',    romanized: 'Falgun'    },
  { en: 'Chaitra',    ne: 'चैत',      romanized: 'Chaitra'   },
]

export function getMonthName(month: number): { en: string; ne: string; romanized: string } {
  const m = BS_MONTHS[month - 1]
  if (m === undefined) {
    throw new RangeError(`Invalid BS month: ${month}. Must be 1–12.`)
  }
  return m
}
