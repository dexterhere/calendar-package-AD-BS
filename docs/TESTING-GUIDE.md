# Nepali Calendar Engine - Testing Guide

## Overview

This package now includes comprehensive testing tools for the Nepali Calendar Engine backend.

## Reliability pipeline commands

```bash
# Main quality gates
pnpm typecheck
pnpm test
pnpm validate:panchang  # lightweight offline validation used by PR/push CI
pnpm deps:check         # lockfile integrity + dependency hygiene (offline)
pnpm trust:check        # generated-data integrity manifest verification (offline)

# Panchang generation/validation
pnpm generate:panchang -- --year 2082
pnpm validate:panchang
pnpm validate:cross -- --year 2082 --no-horizons
pnpm trust:refresh-manifest  # run only after intentional panchang JSON updates

# Monthly maintenance runner (for cron/CI)
pnpm maintenance:monthly
```

`validate:cross` remains available for deeper manual checks, but routine CI gates avoid Horizons/network APIs by default.

## Trust model and safe validation practice

1. **Offline-first default:** routine checks should remain deterministic and not depend on external APIs.
2. **Dependency trust:** `deps:check` validates lockfile integrity metadata and warns on version skew for transitive dependencies.
3. **Generated-data trust:** `trust:check` verifies canonical SHA-256 hashes/day counts from `src/data/panchang/integrity-manifest.json`.
4. **When data changes intentionally:** regenerate data, run validation, then refresh manifest:

   ```bash
   pnpm generate:panchang -- --year 2082
   pnpm validate:panchang
   pnpm trust:refresh-manifest
   pnpm trust:check
   ```

5. **External cross-checks are optional:** use `validate:cross -- --no-horizons` for default local/CI safety; add Horizons only for explicit investigation runs.

## Test Interfaces

### 1. HTML Interactive Test Interface

**File:** `test-calendar.html`

A beautiful, interactive web interface for testing the calendar visually.

**How to Use:**

1. First build the package:
   ```bash
   pnpm build
   ```

2. Open `test-calendar.html` in a web browser that supports ES modules
   - **Note:** Due to browser security restrictions, you need to serve the file via HTTP
   - Use a simple HTTP server:
     ```bash
     # Using Python
     python -m http.server 8080
     
     # Using Node.js (install http-server first)
     npx http-server -p 8080
     ```

3. Navigate to `http://localhost:8080/test-calendar.html`

**Features:**
- Select any BS year (2082–2087) and month
- View complete calendar grid with:
  - BS and AD dates
  - Tithi (lunar day) information
  - Festival indicators (colored dots)
  - Auspicious/inauspicious classification
- Click any day to see detailed information:
  - Full date information
  - Panchang data (tithi, paksha, nakshatra)
  - All events and festivals
  - Classification badge
- Month statistics dashboard
- Options panel to toggle:
  - Adjacent month days
  - Panchang enrichment
  - Event enrichment

### 2. Command-Line Test Script

**File:** `test-cli.cjs`

A comprehensive CLI test suite that runs in the terminal.

**How to Use:**

```bash
# Build first
pnpm build

# Run CLI tests
node test-cli.cjs
```

**Features:**
- Date conversion tests (BS ↔ AD)
- Panchang data verification
- Calendar grid generation
- Festival detection
- Auspicious date classification
- Monthly events summary
- Visual ASCII calendar display
- Test statistics summary

**Sample Output:**
```
════════════════════════════════════════════════════════════
📅 NEPALI CALENDAR ENGINE - TEST SUITE
════════════════════════════════════════════════════════════

────────────────────────────────────────
1. Date Conversion Tests
────────────────────────────────────────
Today (BS): 2082-12-08
Today (AD): Sunday, March 22, 2026

BS 2082/1/1 → AD 4/14/2025

────────────────────────────────────────
2. Panchang Data Tests
────────────────────────────────────────
Baishakh 1, 2082:
  Tithi: Pratipada (प्रतिपदा)
  Paksha: Krishna Paksha
  Nakshatra: Ashwini (अश्विनी)

... (and more tests)
```

### 3. Automated Test Suite

**Location:** `tests/`

Comprehensive Vitest test suite with 158 tests covering:

- **Converter Tests** (57 tests)
  - BS to AD conversion
  - AD to BS conversion
  - Edge cases (year boundaries, leap years)

- **Panchang Tests** (11 tests)
  - Tithi lookup
  - Purnima/Amavasya verification
  - Paksha classification
  - Nakshatra data

- **Event Engine Tests** (34 tests)
  - Fixed date festivals
  - Tithi-based festivals
  - Multi-day festivals (Dashain, Tihar)
  - Event categories
  - Public holidays
  - Runtime event injection

- **Classifier Tests** (17 tests)
  - Auspicious/inauspicious classification
  - Purpose-based classification (wedding, bratabandha, grihapravesh)
  - Edge cases

- **Calendar Grid Tests** (39 tests)
  - Grid shape validation
  - Weekday correctness
  - Overflow days
  - Date accuracy
  - Metadata fields

**Run Tests:**
```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test:coverage

# Run in watch mode
pnpm test:watch
```

## API Functions Available for Testing

### Core Functions

```javascript
// Date conversion
toBS(adDate: Date): BSDate
toAD(bsDate: BSDate): Date
today(): DualDate
formatBS(bsDate, format?: string): string

// Calendar grid
getMonthCalendar(year, month, options?): Promise<CalendarMonth>
getMonthDays(year, month): number

// Panchang
getPanchang(date): PanchangInfo | null
ensurePanchangYear(year): Promise<void>
preloadAllPanchang(): Promise<void>

// Events
getEventsForDate(date): CalendarEvent[]
getEventsForMonth(year, month): CalendarEvent[]
getAuspiciousDates(year, month, category?): AuspiciousDay[]
registerEvents(events: CalendarEvent[]): void

// Classification
isAuspicious(date): 'auspicious' | 'inauspicious' | 'neutral'
classifyDateForPurpose(date, purpose): AuspiciousClassification
```

## Data Coverage

### Panchang Data
- **Years:** BS 2082–2087 (AD 2025–2030)
- **Includes:** Tithi, Paksha, Nakshatra for all 365/366 days per year
- **Total:** 2,191 days of panchang data

### Festivals
- **40+ major festivals** including:
  - Dashain (15 days)
  - Tihar (5 days)
  - Maghe Sankranti
  - Buddha Jayanti
  - Holi
  - Chhath
  - Republic Day
  - Constitution Day
  - And many more

### Public Holidays
- Government holidays for BS 2082
- Framework for adding more years

## Known Limitations

1. **Generated Panchang Data:** The tithi data for BS 2083–2087 is algorithmically generated based on the BS 2082 reference. For production use, source actual data from Nepal Rashtriya Panchang.

2. **Festival Date Accuracy:** Tithi-based festivals are matched by tithi number, but the generated panchang data may not perfectly align with actual astronomical tithis.

3. **HTML Interface:** Requires a local HTTP server due to browser CORS restrictions on ES modules.

## Troubleshooting

### "Panchang data not available"
- Ensure you've run `pnpm build` before testing
- Check that the JSON files exist in `dist/` directory
- Verify `ensurePanchangYear()` or `preloadAllPanchang()` is called before `getPanchang()`

### HTML interface doesn't load
- Must serve via HTTP server (not file:// protocol)
- Check browser console for errors
- Ensure modern browser with ES module support

### Tests fail after code changes
- Run `pnpm build` to rebuild
- Clear dist folder: `rm -rf dist && pnpm build`
- Check for TypeScript errors: `pnpm typecheck`

## Next Steps for Production

1. **Source Real Panchang Data:** Replace generated tithi data with actual Nepal Rashtriya Panchang data for BS 2083–2087

2. **Add More Years:** Extend coverage to BS 2100

3. **Add Public Holidays:** Create `2083.ts`, `2084.ts`, etc. in `src/data/public-holidays/`

4. **Enhance Tests:** Add visual regression tests for calendar grid

5. **Performance Testing:** Benchmark `getMonthCalendar()` for large-scale usage

---

**Package Version:** 0.1.0  
**Last Updated:** March 22, 2026  
**Test Coverage:** 158 tests passing ✅
