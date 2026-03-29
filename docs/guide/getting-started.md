# Getting Started

## Installation

```bash
# pnpm
pnpm add nepali-calendar-engine

# npm
npm install nepali-calendar-engine

# yarn
yarn add nepali-calendar-engine
```

**Requirements:** Node.js 18+. The package ships both ESM and CommonJS bundles — no bundler config needed.

---

## Step 1 — Convert a date

### AD → BS

```ts
import { toBS } from 'nepali-calendar-engine'

const bs = toBS(new Date('2025-04-13'))
console.log(bs)
// { year: 2081, month: 12, day: 29 }
//   ↑ Chaitra 29, BS 2081
```

### BS → AD

```ts
import { toAD } from 'nepali-calendar-engine'

const ad = toAD({ year: 2082, month: 1, day: 1 })

// Always use UTC getters — the returned Date is UTC midnight
console.log(ad.getUTCFullYear()) // 2025
console.log(ad.getUTCMonth())    // 3  (0-indexed, so April)
console.log(ad.getUTCDate())     // 13
```

> **Important:** `toAD()` returns a `Date` at UTC midnight. Use `getUTCFullYear()`, `getUTCMonth()`, `getUTCDate()` — not the local getters — to avoid timezone off-by-one errors.

### Today in BS

```ts
import { today } from 'nepali-calendar-engine'

const todayBS = today()
console.log(todayBS)
// { year: 2082, month: 12, day: 14 }  (whatever today's BS date is)
```

### Format a BS date

```ts
import { formatBS } from 'nepali-calendar-engine'

const formatted = formatBS({ year: 2082, month: 1, day: 15 })
console.log(formatted)
// '2082-01-15'

// With a custom template
const custom = formatBS({ year: 2082, month: 1, day: 15 }, 'DD MMMM YYYY')
console.log(custom)
// '15 Baishakh 2082'
```

---

## Step 2 — Get month info

```ts
import { getMonthDays } from 'nepali-calendar-engine'

const days = getMonthDays(2082, 1)  // Baishakh of BS 2082
console.log(days)
// 31
```

Months are **1-indexed** — 1 = Baishakh, 12 = Chaitra. Month lengths vary per year; never hardcode 30 or 31.

---

## Step 3 — Render a full month calendar

`getMonthCalendar` is async because it loads panchang data for the year.

```ts
import { getMonthCalendar } from 'nepali-calendar-engine'

const calendar = await getMonthCalendar(2082, 1)

console.log(calendar.monthName.en)   // 'Baishakh'
console.log(calendar.monthName.ne)   // 'बैशाख'
console.log(calendar.totalDays)      // 31
console.log(calendar.startWeekday)   // 0 = Sunday, 1 = Monday, ...
console.log(calendar.days.length)    // 35–42 (always full weeks)

// Each day in the grid:
const day = calendar.days[0]
console.log(day.bs)          // { year: 2082, month: 1, day: 1 }
console.log(day.ad)          // Date (UTC midnight)
console.log(day.isCurrentMonth) // true/false (false for overflow days)
console.log(day.isToday)     // true/false
console.log(day.weekday.en)  // 'Sunday'
console.log(day.weekday.ne)  // 'आइतवार'
```

The grid always starts on Sunday and includes overflow days from the previous and next months to fill complete weeks. See [Calendar Grid](./calendar-grid) for the full `CalendarDay` structure.

---

## Step 4 — Read panchang for a date

Panchang (पञ्चाङ्ग) is the Hindu almanac — it tells you the tithi (lunar day), paksha (moon phase), nakshatra (lunar mansion), yoga, and karana for any given day.

```ts
import { getPanchang, ensurePanchangYear } from 'nepali-calendar-engine'

// Preload the year's data first (one-time async cost per year)
await ensurePanchangYear(2082)

// Then all lookups are synchronous
const p = getPanchang({ year: 2082, month: 1, day: 1 })

console.log(p?.tithi.name)       // 'Krishna Pratipada'
console.log(p?.tithi.nameNe)     // 'कृष्ण प्रतिपदा'
console.log(p?.tithi.number)     // 16  (1–30)
console.log(p?.paksha)           // 'krishna'
console.log(p?.pakshaName.en)    // 'Krishna Paksha'
console.log(p?.nakshatra?.name)  // 'Vishakha'
console.log(p?.tithiType)        // 'normal' | 'kshaya' | 'vriddhi'
```

`getPanchang` returns `null` if no data exists for the date (outside precomputed range without fallback). If you call `getMonthCalendar`, panchang is already preloaded for you.

---

## Step 5 — Get events and festivals

```ts
import { getEventsForDate, getEventsForMonth } from 'nepali-calendar-engine'

// Events for a single day
const events = getEventsForDate({ year: 2082, month: 7, day: 15 })
// Returns CalendarEvent[]

events.forEach(e => {
  console.log(e.name.en)        // 'Vijaya Dashami (Dashain Day 10)'
  console.log(e.name.ne)        // 'विजया दशमी (दशैं १० गते)'
  console.log(e.isPublicHoliday) // true
  console.log(e.category)       // 'religious'
})

// All events in a month
const monthEvents = getEventsForMonth(2082, 7)
// Returns CalendarEvent[]
```

---

## Step 6 — Find auspicious dates

```ts
import { getAuspiciousDates, isAuspicious } from 'nepali-calendar-engine'

// Get all auspicious dates in a month for a specific purpose
const weddingDays = getAuspiciousDates(2082, 2, 'wedding')
// Returns AuspiciousDay[]

weddingDays.forEach(d => {
  console.log(d.bs)              // { year: 2082, month: 2, day: 14 }
  console.log(d.classification)  // 'auspicious'
  console.log(d.events)          // CalendarEvent[] on that day
})

// Check a specific date
const verdict = isAuspicious({ year: 2082, month: 2, day: 14 }, 'wedding')
console.log(verdict) // 'auspicious' | 'inauspicious' | 'neutral'
```

---

## TypeScript types

All public types are exported from the root import:

```ts
import type {
  BSDate,          // { year: number; month: number; day: number }
  DualDate,        // { bs: BSDate; ad: Date; weekday: {...}; monthName: {...} }
  CalendarDay,     // Full day object from getMonthCalendar
  CalendarMonth,   // Full month object from getMonthCalendar
  CalendarOptions, // Options for getMonthCalendar
  CalendarEvent,   // Festival/holiday/event
  PanchangInfo,    // Tithi, paksha, nakshatra, yoga, karana
  AuspiciousDay,   // Date + classification + events
  AuspiciousClassification, // 'auspicious' | 'inauspicious' | 'neutral'
  EventType,       // 'festival' | 'public_holiday' | 'auspicious_date' | ...
  EventCategory,   // 'wedding' | 'bratabandha' | 'religious' | ...
} from 'nepali-calendar-engine'
```

---

## Common mistakes

### Month is 1-indexed, not 0-indexed

```ts
// Wrong — this is what you'd do for JavaScript's Date
new Date(2025, 3, 14)  // month 3 = April (0-indexed)

// Correct for this package
toAD({ year: 2082, month: 1, day: 1 })  // month 1 = Baishakh (1-indexed)
```

### Use UTC getters on the returned Date

```ts
const ad = toAD({ year: 2082, month: 1, day: 1 })

// Wrong — gives wrong date if your timezone is UTC-5 or UTC+5:45
ad.getFullYear()  // may be 2025 or 2024 depending on timezone

// Correct
ad.getUTCFullYear()  // always 2025
ad.getUTCMonth()     // always 3 (April, 0-indexed)
ad.getUTCDate()      // always 13
```

### Await getMonthCalendar

```ts
// Wrong — returns a Promise, not a CalendarMonth
const cal = getMonthCalendar(2082, 1)
cal.days  // undefined

// Correct
const cal = await getMonthCalendar(2082, 1)
cal.days  // CalendarDay[]
```

### Call ensurePanchangYear before getPanchang in a loop

```ts
// Inefficient — loads data on every call
for (const month of months) {
  const p = getPanchang({ year: 2082, month, day: 1 })
}

// Correct — load once, then query synchronously
await ensurePanchangYear(2082)
for (const month of months) {
  const p = getPanchang({ year: 2082, month, day: 1 })
}
```

---

## Next steps

- [What is BS?](./what-is-bs) — understand the calendar system
- [Date Conversion](./date-conversion) — how the algorithms work
- [Calendar Grid](./calendar-grid) — full CalendarDay structure
- [Panchang and Events](./panchang-and-events) — panchang data, festivals, auspicious dates
- [API Reference](../api/reference/README) — complete function signatures
