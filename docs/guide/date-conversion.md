# Date Conversion — How It Works

This document explains exactly how `toBS()` and `toAD()` convert between Bikram Sambat and Gregorian dates. Understanding this helps you trust the output, debug edge cases, and reason about performance.

## The single anchor point

Every conversion in this package derives from one fixed reference:

```
BS 2000-01-01  =  AD 1943-04-14 (UTC midnight)
```

This is called the **epoch**. It is verified against multiple Nepali calendar sources and hardcoded in [src/converter/utils.ts](../../src/converter/utils.ts):

```ts
export const BS_EPOCH_UTC_MS = Date.UTC(1943, 3, 14) // April 14, 1943
```

All conversions reduce to the question: *how many days from the epoch to the target date?*

## The month-length table

Because BS months have no algebraic pattern (see [What is BS?](./what-is-bs)), the package ships a precomputed table of every month's length from BS 2000 to BS 2090.

The raw data lives in `src/data/bs-month-lengths.json`:

```json
{
  "2000": [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  "2001": [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  ...
}
```

Each array is 12 values — the day count for months 1–12 (Baishakh through Chaitra).

At build time, this JSON is transformed into three typed arrays that make lookups O(1):

| Array | Contents | Usage |
|---|---|---|
| `monthLengthTable[yi × 12 + mi]` | Days in that month | Validation, day-of-month bounds |
| `yearDayOffsets[yi]` | Cumulative days from epoch to start of year `yi` | Year lookup in AD→BS |
| `monthDayOffsets[yi × 12 + mi]` | Days from year start to start of month `mi` in year `yi` | Month lookup |

Where `yi = year − 2000` and `mi = month − 1`.

These arrays are initialized once when the module loads and never mutated.

## BS → AD (`toAD`)

Converting a BS date to AD is a single arithmetic expression — **O(1)**.

### Algorithm

```
totalDays = yearDayOffsets[yi]           ← days from epoch to start of BS year
          + monthDayOffsets[yi × 12 + mi] ← days from year start to start of BS month
          + (day - 1)                      ← zero-based offset within the month

AD date = epoch + totalDays × 86,400,000 ms
```

### Worked example: BS 2082-01-01 → AD

```
yi = 2082 - 2000 = 82
mi = 1 - 1 = 0

yearDayOffsets[82]    = 29,930  (days from epoch to start of BS 2082)
monthDayOffsets[82×12 + 0] = 0  (Baishakh is the first month, zero offset)
day - 1               = 0

totalDays = 29,930 + 0 + 0 = 29,930

AD = April 14, 1943 + 29,930 days = April 13, 2025
```

BS 2082 Baishakh 1 is April 13, 2025 in AD.

### The actual code

```ts
// src/converter/bs-to-ad.ts
export function bsToAd(bsDate: BSDate): Date {
  validateBSDate(bsDate)

  const yi = bsDate.year - BS_DATA_YEAR_MIN  // year index (0-based)
  const mi = bsDate.month - 1                // month index (0-based)

  const totalDays =
    (yearDayOffsets[yi] as number) +
    (monthDayOffsets[yi * 12 + mi] as number) +
    bsDate.day - 1

  return utcMsToDate(BS_EPOCH_UTC_MS + totalDays * MS_PER_DAY)
}
```

The returned `Date` is set to **UTC midnight**. Always read the result using `getUTCFullYear()`, `getUTCMonth()`, `getUTCDate()` — never the local getters — to avoid timezone-dependent off-by-one errors.

## AD → BS (`toBS`)

Converting an AD date to BS requires finding which BS year and month contain it. This is done with a **binary search on the year** followed by a **linear walk on months** — overall O(log n) where n = 91 years.

### Step 1 — Days since epoch

```ts
function adDateToDaysSinceEpoch(adDate: Date): number {
  const targetMs = Date.UTC(
    adDate.getUTCFullYear(),
    adDate.getUTCMonth(),
    adDate.getUTCDate()
  )
  return Math.round((targetMs - BS_EPOCH_UTC_MS) / MS_PER_DAY)
}
```

This normalizes any input `Date` to a UTC day count, stripping time-of-day and local timezone effects.

### Step 2 — Find the BS year (binary search)

`yearDayOffsets` is a strictly increasing array: `[0, 365, 730, 1096, ...]`. Binary search finds the largest `yi` where `yearDayOffsets[yi] <= days`.

```ts
let lo = 0, hi = lastYearIdx
while (lo < hi) {
  const mid = (lo + hi + 1) >>> 1
  if (yearDayOffsets[mid] <= days) lo = mid
  else hi = mid - 1
}
const yi = lo
const dayInYear = days - yearDayOffsets[yi]
```

### Step 3 — Find the BS month (linear walk)

Within a year there are at most 12 months. Walk forward until the next month's offset exceeds `dayInYear`:

```ts
let mi = 0
while (mi < 11 && monthDayOffsets[yi * 12 + mi + 1] <= dayInYear) {
  mi++
}
const day = dayInYear - monthDayOffsets[yi * 12 + mi] + 1
```

### Worked example: AD 2025-04-13 → BS

```
days since epoch = (2025-04-13 UTC) - (1943-04-14 UTC) = 29,929

Binary search on yearDayOffsets finds yi = 82  (BS 2082)
  yearDayOffsets[82] = 29,930 > 29,929 → too high
  yearDayOffsets[81] = 29,565 <= 29,929 → yi = 81  (BS 2081)

dayInYear = 29,929 - 29,565 = 364

Walk months of BS 2081:
  monthDayOffsets for month 12 (Chaitra) = 336
  336 <= 364 → mi = 11 (Chaitra)

day = 364 - 336 + 1 = 29

Result: BS 2081-12-29 (Chaitra 29)
```

## Timezone safety

The package always operates on **UTC date components**. The input `Date` for `toBS()` is read via `getUTCFullYear / getUTCMonth / getUTCDate`, not local getters. The output `Date` from `toAD()` is always UTC midnight.

This means:

```ts
// These are all safe regardless of system timezone:
const ad = toAD({ year: 2082, month: 1, day: 1 })
console.log(ad.getUTCFullYear())  // 2025 ✓
console.log(ad.getFullYear())     // may differ! depends on local timezone
```

If you are rendering the AD date in a UI, use `getUTCFullYear() / getUTCMonth() / getUTCDate()` or format via a UTC-aware formatter.

## Validation and error handling

`validateBSDate` is called before every conversion. It throws a `RangeError` with a descriptive message on:

- Year outside BS 2000–2090
- Month outside 1–12
- Day outside the actual length of that month

```ts
toAD({ year: 2082, month: 1, day: 33 })
// → RangeError: BS day 33 is invalid for 2082/1. That month has 31 days (valid range: 1–31).

toAD({ year: 2091, month: 1, day: 1 })
// → RangeError: BS year 2091 is outside the supported range (2000–2090).
```

`toBS()` also throws if the AD date falls outside the supported range:

```ts
toBS(new Date('1940-01-01'))
// → RangeError: 1940-01-01 is before BS 2000 Baishakh 1 (AD 1943-04-14).
```

## Data sourcing and cross-validation

The month-length table is sourced from official Nepali calendar publications and cross-validated against:

- Nepal government patro data
- Drik Panchang reference dates
- Physical Nepali calendar printings

The panchang data (tithi, nakshatra) is computed from [astronomy-engine](https://github.com/cosinekitty/astronomy) at Kathmandu coordinates and spot-checked against the Nepal Rashtriya Panchang.

To verify the data integrity yourself:

```bash
pnpm trust:check       # verifies SHA-256 hashes of all data files
pnpm validate:panchang # checks panchang against known reference dates
```

## Performance characteristics

| Operation | Complexity | Typical time |
|---|---|---|
| `toAD(bsDate)` | O(1) | < 0.01 ms |
| `toBS(adDate)` | O(log n) | < 0.01 ms |
| `getMonthDays(year, month)` | O(1) | < 0.01 ms |
| `getMonthCalendar(year, month)` | O(days) + async panchang load | < 10 ms (after preload) |

The async cost in `getMonthCalendar` is a one-time JSON parse per year. After `ensurePanchangYear(year)` has been called, all subsequent calls for that year are synchronous.
