# Nepali Calendar Engine

`@meroevent/nepali-calendar-engine` is a TypeScript package for Bikram Sambat (BS) calendar operations, including BS/AD conversion, calendar grid generation, panchang lookup, and festival/holiday classification.

## Quick Glance

- BS ↔ AD date conversion
- Monthly calendar grid generation
- Panchang data (tithi, paksha, nakshatra)
- Festival and public holiday resolution
- Auspicious/inauspicious date classification
- English and Nepali labels

## Installation

```bash
pnpm add @meroevent/nepali-calendar-engine
```

## Quick Start

```ts
import { toBS, toAD, getMonthCalendar, getEventsForDate } from '@meroevent/nepali-calendar-engine'

const bsDate = toBS(new Date(2025, 3, 14))
const adDate = toAD({ year: 2082, month: 1, day: 1 })

const month = await getMonthCalendar(2082, 1)
const events = getEventsForDate({ year: 2082, month: 7, day: 15 })

console.log({ bsDate, adDate, days: month.days.length, events: events.length })
```

## Development

```bash
pnpm build
pnpm test
pnpm typecheck
pnpm lint
```

## Documentation

All detailed docs are under [`docs/`](./docs/):

- [`docs/README.md`](./docs/README.md) - documentation index
- [`docs/PROJECT-ANALYSIS.md`](./docs/PROJECT-ANALYSIS.md) - deep project analysis
- [`docs/TESTING-GUIDE.md`](./docs/TESTING-GUIDE.md) - testing guide
- [`docs/CREDITS.md`](./docs/CREDITS.md) - credits and sources
- [`docs/project.md`](./docs/project.md) - original project plan/reference

