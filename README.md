# Nepali Calendar Engine

`nepali-calendar-engine` is a TypeScript package for Bikram Sambat (BS) calendar operations, including BS/AD conversion, calendar grid generation, panchang lookup, and festival/holiday classification.

## Quick Glance

- BS ↔ AD date conversion
- Monthly calendar grid generation
- Panchang data (tithi, paksha, nakshatra, yoga, karana, tithiType)
- Location-aware panchang for any observer coordinates (Kathmandu default)
- Kshaya (skipped) and Vriddhi (repeated) tithi detection
- Festival and public holiday resolution
- International observances (fixed AD dates, e.g. World Health Day, Valentine's Day)
- Year-round international observances across all months (curated fixed AD dates, non-exhaustive)
- Auspicious/inauspicious date classification
- English and Nepali labels

## Installation

```bash
pnpm add nepali-calendar-engine
```

## Quick Start

```ts
import { toBS, toAD, getMonthCalendar, getPanchang, getEventsForDate } from 'nepali-calendar-engine'

const bsDate = toBS(new Date(2025, 3, 14))
const adDate = toAD({ year: 2082, month: 1, day: 1 })

const month = await getMonthCalendar(2082, 1)
const events = getEventsForDate({ year: 2082, month: 7, day: 15 })

console.log({ bsDate, adDate, days: month.days.length, events: events.length })
```

## Panchang

Panchang data is computed from planetary positions at sunrise (astronomy-engine, validated against NASA JPL Horizons). All five classical elements are available for any BS date.

### Basic lookup

```ts
import { getPanchang, ensurePanchangYear } from 'nepali-calendar-engine'

// Pre-load data for a year (async, call once before bulk queries)
await ensurePanchangYear(2082)

const p = getPanchang({ year: 2082, month: 1, day: 1 })
// p.tithi      → { number: 16, name: 'Pratipada', nameNe: 'प्रतिपदा' }
// p.paksha     → 'krishna'
// p.nakshatra  → { name: 'Anuradha', nameNe: 'अनुराधा' }
// p.yoga       → { number: 18, name: 'Variyan', nameNe: 'वरीयान्' }
// p.karana     → { number: 3, name: 'Kaulava', nameNe: 'कौलव', inauspicious: false }
// p.tithiType  → 'normal' | 'kshaya' | 'vriddhi'
```

### Kshaya and Vriddhi tithis

`tithiType` classifies edge cases in the lunar calendar:

| Value | Meaning |
|---|---|
| `'normal'` | Standard day — one tithi at sunrise (the vast majority of days) |
| `'kshaya'` | The *next* tithi completes entirely within this solar day without appearing at sunrise. Its religious observances (fasting etc.) fall on this day. |
| `'vriddhi'` | This tithi also appeared at yesterday's sunrise — it spans two consecutive days. |

```ts
const p = getPanchang({ year: 2082, month: 9, day: 4 })
// p.tithiType → 'kshaya'  (Amavasya is kshaya here — Poush 2082)
```

### Location-aware queries

By default, all panchang is computed for Kathmandu (27.7172°N, 85.3240°E, 1400m, NST). For other locations, pass `options`:

```ts
// Pokhara, Nepal
const p = getPanchang({ year: 2082, month: 1, day: 1 }, {
  lat: 28.2096,
  lon: 83.9856,
})
```

Sunrise shifts slightly by location; on most days the tithi is identical to Kathmandu. Differences appear on lunar boundary days.

### Coverage

| Year range | Source |
|---|---|
| BS 2080–2090 | Precomputed JSON (astronomy-engine, 3-engine cross-validated, fast O(1) lookup) |
| BS 2000–2079 | Live computation via fallback (astronomy-engine, results LRU-cached per session) |
| BS < 2000 or > 2090 | Returns `null` |

## Development

```bash
pnpm build
pnpm test
pnpm typecheck
pnpm lint
pnpm trust:check
```

Core CI gates now run on pull requests and pushes to `main`:
- `pnpm run typecheck`
- `pnpm run test`
- `pnpm run validate:panchang` (lightweight, offline, no Horizons/network dependency)
- `pnpm run legal:check` (license + dataset provenance/source-map policy)
- `pnpm run deps:check` (lockfile integrity + dependency hygiene, offline)

## Data maintenance and validation

```bash
# Generate panchang data with astronomy-engine v2 generator
pnpm generate:panchang -- --year 2082

# Validate generated data against curated reference dates
pnpm validate:panchang

# Cross-validate against independent astronomy engines
pnpm validate:cross -- --year 2082 --no-horizons

# Verify dependency + generated-data trust signals (offline)
pnpm trust:check

# Refresh generated-data integrity manifest after intentional data updates
pnpm trust:refresh-manifest

# Run monthly maintenance workflow locally
pnpm maintenance:monthly
```

## Trust model and safe validation

- Default local/CI validation is deterministic and offline-first (`typecheck`, `test`, `validate:panchang`, `deps:check`, `trust:check`).
- `validate:cross` should use `--no-horizons` in routine runs to avoid external network APIs; only enable Horizons for explicit deep investigations.
- Generated panchang data now has an integrity manifest (`src/data/panchang/integrity-manifest.json`) with canonical SHA-256 hashes and per-year day counts.
- Integrity checks are trust signals (tamper/reproducibility detection), not astronomical correctness proofs. Keep `validate:panchang` and curated reference review in the workflow.
- Public holiday and festival datasets now require explicit source mappings checked by `legal:check`; this enforces traceability and release hygiene.

## Legal and compliance guardrails

- This package is open-source under the MIT License (`LICENSE` at repository root).
- Validation scripts enforce metadata and provenance completeness; they do **not** replace legal advice.
- Nepal public holiday declarations can change annually. Government gazette and ministry notices remain authoritative.
- Third-party calendars (Hamro Patro, Drik Panchang, etc.) are treated as **manual spot-check references** only; no automated scraping pipeline is used for them.
- Store only minimum factual assertions required for verification (date/tithi mappings), not copied proprietary editorial content.
- International observances are a curated informational dataset (non-public-holiday), not a legal/compliance registry of all global observances.
- For release candidates, run:

```bash
pnpm typecheck
pnpm test
pnpm validate:panchang
pnpm legal:check
pnpm deps:check
pnpm trust:check
pnpm validate:cross -- --year 2082 --no-horizons
```

## Documentation

All detailed docs are under [`docs/`](./docs/):

- [`docs/README.md`](./docs/README.md) - documentation index
- [`docs/PROJECT-ANALYSIS.md`](./docs/PROJECT-ANALYSIS.md) - deep project analysis
- [`docs/TESTING-GUIDE.md`](./docs/TESTING-GUIDE.md) - testing guide
- [`docs/CREDITS.md`](./docs/CREDITS.md) - credits and sources
- [`docs/project.md`](./docs/project.md) - original project plan/reference

For local docs site development and build:

```bash
pnpm run docs:dev
pnpm run docs:build
pnpm run docs:preview
```

API reference pages are generated from TypeScript exports via TypeDoc:

```bash
pnpm run docs:api
```

An interactive browser playground is available in the docs site at `/playground/` (source: `docs/public/playground/index.html`).
