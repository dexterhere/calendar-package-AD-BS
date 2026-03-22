export interface BSDate {
  year: number   // e.g., 2082
  month: number  // 1–12 (Baishakh = 1, Chaitra = 12)
  day: number    // 1–32
}

export interface DualDate {
  bs: BSDate
  ad: Date
  weekday: { en: string; ne: string }
  monthName: { en: string; ne: string }
}
