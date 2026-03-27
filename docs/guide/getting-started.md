# Getting Started

## Install

```bash
pnpm add nepali-calendar-engine
```

## Quick usage

```ts
import { toBS, toAD, getMonthCalendar, getPanchang, getEventsForDate } from 'nepali-calendar-engine'

const bsDate = toBS(new Date(2025, 3, 14))
const adDate = toAD({ year: 2082, month: 1, day: 1 })

const month = await getMonthCalendar(2082, 1)
const panchang = getPanchang({ year: 2082, month: 1, day: 1 })
const events = getEventsForDate({ year: 2082, month: 7, day: 15 })

console.log({ bsDate, adDate, days: month.days.length, tithi: panchang?.tithi, events: events.length })
```

## Development commands

```bash
pnpm build
pnpm test
pnpm typecheck
pnpm lint
```
