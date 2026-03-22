export const PAKSHA_NAMES = {
  shukla: { en: 'Shukla Paksha', ne: 'शुक्ल पक्ष' },
  krishna: { en: 'Krishna Paksha', ne: 'कृष्ण पक्ष' },
} as const

export type Paksha = keyof typeof PAKSHA_NAMES
