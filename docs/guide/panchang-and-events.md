# Panchang and Events

## Panchang model

Panchang data is computed at sunrise and includes:

- `tithi`
- `paksha`
- `nakshatra`
- `yoga`
- `karana`
- `tithiType` (`normal`, `kshaya`, `vriddhi`)

```ts
import { getPanchang, ensurePanchangYear } from 'nepali-calendar-engine'

await ensurePanchangYear(2082)
const p = getPanchang({ year: 2082, month: 1, day: 1 })
```

## Event resolution

Use event helpers to get events for a day or month:

```ts
import { getEventsForDate, getEventsForMonth } from 'nepali-calendar-engine'

const dayEvents = getEventsForDate({ year: 2082, month: 8, day: 3 })
const monthEvents = getEventsForMonth(2082, 8)
```

## Auspicious-day helpers

```ts
import { getAuspiciousDates, isAuspicious } from 'nepali-calendar-engine'

const days = getAuspiciousDates(2082, 1, 'marriage')
const verdict = isAuspicious({ year: 2082, month: 1, day: 10 }, 'marriage')
```
