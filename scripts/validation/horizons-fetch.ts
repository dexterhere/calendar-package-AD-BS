/**
 * scripts/validation/horizons-fetch.ts
 *
 * Step 4 — NASA JPL Horizons API client.
 *
 * Fetches Sun and Moon ecliptic longitudes from NASA's Horizons system for a
 * given date range. Used exclusively for cross-validation of astronomy-engine
 * output — never for production data generation.
 *
 * Source:  https://ssd.jpl.nasa.gov/horizons/
 * License: Public domain (US federal government data, free for all use)
 * Auth:    None required
 *
 * Each result is cached to validation/horizons-cache/<YYYY-MM-DD>.json so the
 * API is never called twice for the same date. Delete cache files to re-fetch.
 *
 * Usage:
 *   pnpm exec tsx --tsconfig scripts/tsconfig.scripts.json \
 *     scripts/validation/horizons-fetch.ts --date 2025-04-14
 *
 *   pnpm exec tsx --tsconfig scripts/tsconfig.scripts.json \
 *     scripts/validation/horizons-fetch.ts --from 2025-04-14 --to 2025-04-18
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// ── Paths ─────────────────────────────────────────────────────────────────────
const ROOT       = path.resolve(fileURLToPath(import.meta.url), '../../..')
const CACHE_DIR  = path.join(ROOT, 'validation', 'horizons-cache')

// ── Horizons API constants ────────────────────────────────────────────────────
const HORIZONS_API = 'https://ssd.jpl.nasa.gov/api/horizons.api'

/**
 * Kathmandu observer coordinates for Horizons.
 * Format: 'lon,lat,elev_km'  (Note: Horizons uses lon first, then lat)
 */
const KTM_SITE_COORD = '85.3240,27.7172,1.4'  // lon, lat, elevation km

const BODY_SUN  = '10'   // JPL Horizons body ID for Sun
const BODY_MOON = '301'  // JPL Horizons body ID for Moon

/** Delay between API requests to avoid hitting rate limits */
const REQUEST_DELAY_MS = 200

// ── Types ─────────────────────────────────────────────────────────────────────

export interface HorizonsPosition {
  /** Gregorian date (YYYY-MM-DD) in Nepal — used as the cache key */
  date: string
  /** Sun ecliptic longitude at Kathmandu sunrise (degrees, 0–360) */
  sunLon: number
  /** Moon ecliptic longitude at Kathmandu sunrise (degrees, 0–360) */
  moonLon: number
  /** Moon phase angle = (moonLon - sunLon + 360) % 360 (0–360) */
  moonPhase: number
  /** Tithi derived from moon phase: floor(moonPhase / 12) + 1 */
  tithi: number
  /** Nakshatra derived from moon longitude: floor(moonLon / (360/27)) + 1 */
  nakshatra: number
  /** UTC ISO timestamp used for the query (Kathmandu sunrise approximation) */
  queryTime: string
}

interface HorizonsRawEntry {
  lon: number   // ecliptic longitude degrees
}

// ── Sunrise approximation ─────────────────────────────────────────────────────

/**
 * Returns a UTC ISO timestamp for querying Horizons for a given Nepal date.
 *
 * We use 00:00 UTC = 05:45 NST, which is just after Kathmandu sunrise
 * (~05:20–05:50 NST depending on season). At this time the Sun is above the
 * Kathmandu horizon, so QUANTITIES=31 (ObsEcLon) returns valid data.
 *
 * This is within ~5–25 minutes of actual sunrise — close enough that the tithi
 * is the same as at precise sunrise for all normal days. On Kshaya tithi days
 * (where tithi changes within minutes of sunrise), a 1-tithi YELLOW flag is
 * expected and correctly identifies the edge case.
 */
function approximateSunriseUTC(nepaliDateStr: string): string {
  // nepaliDateStr: YYYY-MM-DD → return 00:00 UTC of the same calendar date
  // (the Gregorian date returned by bsToAd() corresponds to the Nepal solar day)
  return `${nepaliDateStr}T00:00:00Z`
}

// ── Horizons API call ─────────────────────────────────────────────────────────

/**
 * Builds the Horizons API URL for a single body at a specific moment.
 *
 * QUANTITIES=31 = observer geocentric ecliptic lon/lat (ObsEcLon, ObsEcLat)
 * COORD_TYPE=GEODETIC = observer site is specified by lon/lat/elevation
 */
function buildHorizonsUrl(bodyId: string, utcTimestamp: string): string {
  // Horizons expects times in format: YYYY-MMM-DD HH:MM (e.g. 2025-Apr-14 23:45)
  const dt = new Date(utcTimestamp)
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const yyyy  = dt.getUTCFullYear()
  const mon   = months[dt.getUTCMonth()] as string
  const dd    = String(dt.getUTCDate()).padStart(2, '0')
  const hh    = String(dt.getUTCHours()).padStart(2, '0')
  const min   = String(dt.getUTCMinutes()).padStart(2, '0')
  const start = `${yyyy}-${mon}-${dd} ${hh}:${min}`

  // End time = 1 minute after start (single data point)
  const endMs = dt.getTime() + 60 * 1000
  const dtEnd = new Date(endMs)
  const ddE   = String(dtEnd.getUTCDate()).padStart(2, '0')
  const hhE   = String(dtEnd.getUTCHours()).padStart(2, '0')
  const minE  = String(dtEnd.getUTCMinutes()).padStart(2, '0')
  const end   = `${yyyy}-${mon}-${ddE} ${hhE}:${minE}`

  const params = new URLSearchParams({
    format:      'json',
    COMMAND:     `'${bodyId}'`,
    OBJ_DATA:    'NO',
    MAKE_EPHEM:  'YES',
    EPHEM_TYPE:  'OBSERVER',
    CENTER:      'coord@399',           // Earth surface, custom coordinates
    COORD_TYPE:  'GEODETIC',
    SITE_COORD:  `'${KTM_SITE_COORD}'`,
    START_TIME:  `'${start}'`,
    STOP_TIME:   `'${end}'`,
    STEP_SIZE:   '1m',
    QUANTITIES:  '31',                  // Observer geocentric ecliptic lon/lat
    ANG_FORMAT:  'DEG',
    CSV_FORMAT:  'YES',
  })

  return `${HORIZONS_API}?${params.toString()}`
}

/**
 * Parses the ecliptic longitude from a Horizons API JSON response.
 * Returns the longitude in degrees (0–360).
 */
function parseHorizonsLongitude(responseJson: unknown): number {
  const result = responseJson as { result?: string; error?: string }

  if (result.error) {
    throw new Error(`Horizons API error: ${result.error}`)
  }

  if (!result.result) {
    throw new Error('Horizons API returned empty result')
  }

  // The result field contains the raw text output from Horizons
  // Find the data section between $$SOE and $$EOE markers
  const text  = result.result
  const soeIdx = text.indexOf('$$SOE')
  const eoeIdx = text.indexOf('$$EOE')

  if (soeIdx === -1 || eoeIdx === -1) {
    throw new Error(`Horizons response missing $$SOE/$$EOE markers:\n${text.slice(0, 500)}`)
  }

  const dataBlock = text.slice(soeIdx + 5, eoeIdx).trim()
  const lines     = dataBlock.split('\n').filter(l => l.trim().length > 0)

  if (lines.length === 0) {
    throw new Error('Horizons response data block is empty')
  }

  // CSV format for QUANTITIES=31:
  //   Date__(UT)__HR:MN, flag1, flag2, ObsEcLon, ObsEcLat
  //   col 0: date, col 1: visibility flag, col 2: blank, col 3: ObsEcLon ← target
  const firstLine = lines[0]!.trim()
  const cols      = firstLine.split(',').map(s => s.trim())

  // Ecliptic longitude is column index 3 for QUANTITIES=31
  const lonStr = cols[3]
  if (!lonStr) {
    throw new Error(`Cannot parse ecliptic longitude from Horizons line: "${firstLine}"`)
  }

  const lon = parseFloat(lonStr)
  if (isNaN(lon)) {
    throw new Error(`Non-numeric ecliptic longitude in Horizons response: "${lonStr}"`)
  }

  // Ensure 0–360 range
  return ((lon % 360) + 360) % 360
}

// ── Fetch with caching ────────────────────────────────────────────────────────

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Fetches ecliptic longitude for a body at a UTC moment from Horizons API.
 * Results are NOT cached individually — caching is done at the date level.
 */
async function fetchLongitude(bodyId: string, utcTimestamp: string): Promise<number> {
  const url = buildHorizonsUrl(bodyId, utcTimestamp)

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Horizons HTTP ${response.status} for body ${bodyId} at ${utcTimestamp}`)
  }

  const json = await response.json()
  return parseHorizonsLongitude(json)
}

/**
 * Returns Horizons positions for a given Nepal date string (YYYY-MM-DD).
 * Reads from cache if available, otherwise fetches from the API and caches.
 */
export async function getHorizonsPositions(nepaliDate: string): Promise<HorizonsPosition> {
  fs.mkdirSync(CACHE_DIR, { recursive: true })
  const cacheFile = path.join(CACHE_DIR, `${nepaliDate}.json`)

  // Cache hit
  if (fs.existsSync(cacheFile)) {
    const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf8')) as HorizonsPosition
    return cached
  }

  const queryTime = approximateSunriseUTC(nepaliDate)

  // Fetch Sun and Moon in sequence (avoid parallel to respect rate limits)
  const sunLon  = await fetchLongitude(BODY_SUN,  queryTime)
  await sleep(REQUEST_DELAY_MS)
  const moonLon = await fetchLongitude(BODY_MOON, queryTime)

  const moonPhase = ((moonLon - sunLon) + 360) % 360
  const tithi     = Math.floor(moonPhase / 12) + 1
  const nakshatra = Math.floor(moonLon / (360 / 27)) + 1

  const entry: HorizonsPosition = {
    date: nepaliDate,
    sunLon,
    moonLon,
    moonPhase,
    tithi,
    nakshatra,
    queryTime,
  }

  // Write cache
  fs.writeFileSync(cacheFile, JSON.stringify(entry, null, 2), 'utf8')
  return entry
}

// ── Date range helpers ────────────────────────────────────────────────────────

function addDays(dateStr: string, n: number): string {
  const d = new Date(`${dateStr}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

function dateRange(from: string, to: string): string[] {
  const dates: string[] = []
  let cur = from
  while (cur <= to) {
    dates.push(cur)
    cur = addDays(cur, 1)
  }
  return dates
}

// ── CLI entry point ───────────────────────────────────────────────────────────

const _cliArgv = process.argv.slice(2)
if (_cliArgv.includes('--date') || _cliArgv.includes('--from')) {
  const argv  = _cliArgv
  const get   = (flag: string) => { const i = argv.indexOf(flag); return i !== -1 ? argv[i + 1] : undefined }

  const single = get('--date')
  const from   = get('--from')
  const to     = get('--to')

  const dates: string[] = single
    ? [single]
    : from && to
      ? dateRange(from, to)
      : []

  if (dates.length === 0) {
    console.error('Usage:')
    console.error('  horizons-fetch.ts --date 2025-04-14')
    console.error('  horizons-fetch.ts --from 2025-04-14 --to 2025-04-18')
    process.exit(1)
  }

  console.log(`\nFetching ${dates.length} date(s) from NASA JPL Horizons...\n`)

  for (const date of dates) {
    try {
      const pos = await getHorizonsPositions(date)
      const cached = fs.existsSync(path.join(CACHE_DIR, `${date}.json`)) ? '(cached)' : '(fetched)'
      console.log(
        `${date}  sunLon=${pos.sunLon.toFixed(3).padStart(8)}°` +
        `  moonLon=${pos.moonLon.toFixed(3).padStart(8)}°` +
        `  phase=${pos.moonPhase.toFixed(2).padStart(7)}°` +
        `  tithi=${String(pos.tithi).padStart(2)}` +
        `  nakshatra=${String(pos.nakshatra).padStart(2)}` +
        `  ${cached}`
      )
    } catch (err) {
      console.error(`  ERROR ${date}: ${err instanceof Error ? err.message : String(err)}`)
    }

    if (dates.length > 1) await sleep(REQUEST_DELAY_MS)
  }

  console.log(`\nCache location: ${CACHE_DIR}\n`)
}
