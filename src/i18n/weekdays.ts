// index 0 = Sunday, index 6 = Saturday
export const WEEKDAYS: Array<{ en: string; ne: string }> = [
  { en: 'Sunday',    ne: 'आइतबार'  },
  { en: 'Monday',    ne: 'सोमबार'  },
  { en: 'Tuesday',   ne: 'मंगलबार' },
  { en: 'Wednesday', ne: 'बुधबार'  },
  { en: 'Thursday',  ne: 'बिहिबार' },
  { en: 'Friday',    ne: 'शुक्रबार' },
  { en: 'Saturday',  ne: 'शनिबार'  },
]

export function getWeekdayName(dayOfWeek: number): { en: string; ne: string } {
  const w = WEEKDAYS[dayOfWeek]
  if (w === undefined) {
    throw new RangeError(`Invalid day of week: ${dayOfWeek}. Must be 0–6.`)
  }
  return w
}
