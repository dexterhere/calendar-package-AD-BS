# nepali-calendar-engine

A TypeScript package for Bikram Sambat (BS) calendar conversion, panchang lookup, and festival resolution. Zero runtime dependencies. Works in Node.js, Next.js, NestJS, and React Native.

```bash
pnpm add nepali-calendar-engine
```

---

## What do you want to do?

### "I want to convert a date between BS and AD"

```ts
import { toBS, toAD, today } from 'nepali-calendar-engine'

toBS(new Date('2025-04-13'))         // → { year: 2081, month: 12, day: 29 }
toAD({ year: 2082, month: 1, day: 1 }).getUTCFullYear()  // → 2025
today()                              // → current date in BS
```

→ [Getting Started](./guide/getting-started) · [Conversion Algorithm](./guide/date-conversion)

---

### "I want to build a Nepali calendar UI"

```ts
import { getMonthCalendar } from 'nepali-calendar-engine'

const cal = await getMonthCalendar(2082, 1)
// cal.days → 35–42 CalendarDay objects, each with BS date, AD date,
//            panchang, festivals, and auspicious classification
```

→ [Calendar Grid Guide](./guide/calendar-grid) · [Getting Started](./guide/getting-started)

---

### "I want panchang, festival, or auspicious date data"

```ts
import { getPanchang, getEventsForDate, getAuspiciousDates } from 'nepali-calendar-engine'

getPanchang({ year: 2082, month: 1, day: 1 })
// → { tithi: 'Krishna Pratipada', paksha: 'krishna', nakshatra: 'Vishakha', ... }

getEventsForDate({ year: 2082, month: 7, day: 15 })
// → [{ name: 'Vijaya Dashami', isPublicHoliday: true, ... }]

getAuspiciousDates(2082, 2, 'wedding')
// → [{ bs: {...}, classification: 'auspicious', events: [...] }, ...]
```

→ [Panchang and Events](./guide/panchang-and-events)

---

### "I want to understand the calendar system first"

→ [What is Bikram Sambat?](./guide/what-is-bs)

---

### "I want to see it running live"

→ [Interactive Playground](./guide/playground)

---

## Feature overview

| Feature | Range / Notes |
|---|---|
| BS ↔ AD conversion | BS 2000–2090 · O(1) forward, O(log n) reverse |
| Calendar grid | Full month with overflow days, week alignment |
| Panchang (precomputed) | BS 2080–2090 · offline, O(1) lookup |
| Panchang (live fallback) | BS 2000–2079 · via astronomy-engine |
| Festivals | 40+ entries · fixed-date, tithi-based, government-declared |
| Public holidays | BS 2082 (more years in progress) |
| Auspicious dates | wedding, bratabandha, grihapravesh, religious |
| Languages | English + Nepali (Devanagari) |
| Bundle size | 188 KB ESM · 189 KB CJS · zero runtime deps |

---

## All guides

- [What is Bikram Sambat?](./guide/what-is-bs) — the calendar system explained
- [Getting Started](./guide/getting-started) — install and first usage
- [Date Conversion](./guide/date-conversion) — how the algorithms work
- [Calendar Grid](./guide/calendar-grid) — building month views
- [Panchang and Events](./guide/panchang-and-events) — tithi, festivals, auspicious dates
- [Validation and Trust](./guide/validation-and-trust) — data sources and verification
- [Interactive Playground](./guide/playground) — live browser explorer

## API Reference

- [All functions](./api/reference/README)
