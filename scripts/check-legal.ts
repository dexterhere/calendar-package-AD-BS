/**
 * scripts/check-legal.ts
 *
 * Strict legal/compliance gate for release:
 *  1) Root LICENSE file exists and matches package.json license metadata
 *  2) Core datasets have explicit, auditable source mappings by record id
 *  3) Holiday/festival records satisfy baseline structural constraints
 *
 * This script validates traceability and policy hygiene. It is not legal advice.
 *
 * Usage:
 *   pnpm legal:check
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import pkg from '../package.json' with { type: 'json' }
import { BASE_FESTIVALS, type FestivalDeterminationMethod } from '../src/data/festivals.js'
import { PUBLIC_HOLIDAYS_2082 } from '../src/data/public-holidays/2082.js'
import {
  FESTIVAL_SOURCE_MAP,
  PUBLIC_HOLIDAY_SOURCE_MAP_2082,
  type LegalDataSource,
} from '../src/data/source-maps.js'

interface Failure {
  code: string
  detail: string
}

const ROOT = path.resolve(fileURLToPath(import.meta.url), '../..')
const LICENSE_PATH = path.join(ROOT, 'LICENSE')
const THIRD_PARTY_REFERENCE_DATASET = path.join(ROOT, 'tests', 'reference-data', 'hamropatro-2082.json')

const ALLOWED_NETWORK_VALIDATION_SCRIPTS = [
  'scripts/check-legal.ts', // self-auditing script includes domain strings by design
  'scripts/validation/horizons-fetch.ts', // NASA Horizons is explicitly allowed
]

function fail(code: string, detail: string): Failure {
  return { code, detail }
}

function assertLicense(failures: Failure[]): void {
  if (!fs.existsSync(LICENSE_PATH)) {
    failures.push(fail('license.missing', 'Missing root LICENSE file.'))
    return
  }

  const licenseText = fs.readFileSync(LICENSE_PATH, 'utf8')
  if (!/MIT License/i.test(licenseText)) {
    failures.push(fail('license.content', 'LICENSE file must contain MIT License text.'))
  }

  if (pkg.license !== 'MIT') {
    failures.push(fail('package.license', `package.json license must be "MIT", got "${String(pkg.license)}".`))
  }
}

function assertSourceFields(prefix: string, source: LegalDataSource, failures: Failure[]): void {
  if (source.authority.trim().length === 0) {
    failures.push(fail(`${prefix}.authority`, 'authority must be non-empty.'))
  }
  if (source.reference.trim().length === 0) {
    failures.push(fail(`${prefix}.reference`, 'reference must be non-empty.'))
  }
  if (source.lastVerifiedBsYear < 2000 || source.lastVerifiedBsYear > 2200) {
    failures.push(fail(`${prefix}.lastVerifiedBsYear`, 'lastVerifiedBsYear is outside expected bounds.'))
  }
  if (source.licenseNote.trim().length === 0) {
    failures.push(fail(`${prefix}.licenseNote`, 'licenseNote must be non-empty.'))
  }
  if (!['official', 'manual_reference', 'computed_public_domain'].includes(source.usagePolicy)) {
    failures.push(fail(`${prefix}.usagePolicy`, `Unsupported usagePolicy "${source.usagePolicy}".`))
  }
  if (source.usagePolicy === 'manual_reference' && source.automationAllowed) {
    failures.push(fail(`${prefix}.automationAllowed`, 'manual_reference sources must set automationAllowed=false.'))
  }
}

function assertFestivalConstraints(failures: Failure[]): void {
  const validMethods = new Set<FestivalDeterminationMethod>([
    'fixed_bs_date',
    'tithi_based',
    'government_declared',
    'fixed_ad_date',
  ])

  const seenIds = new Set<string>()
  for (const festival of BASE_FESTIVALS) {
    const id = festival.id

    if (seenIds.has(id)) {
      failures.push(fail(`festival.${id}.duplicate`, `Duplicate festival id "${id}".`))
      continue
    }
    seenIds.add(id)

    if (!validMethods.has(festival.method)) {
      failures.push(fail(`festival.${id}.method`, `Unsupported method "${festival.method}".`))
    }

    const source = FESTIVAL_SOURCE_MAP[id]
    if (source === undefined) {
      failures.push(fail(`festival.${id}.source`, 'Missing source mapping in FESTIVAL_SOURCE_MAP.'))
    } else {
      assertSourceFields(`festival.${id}.source`, source, failures)
    }

    if (festival.method === 'fixed_bs_date') {
      if (festival.month === undefined || festival.day === undefined) {
        failures.push(fail(`festival.${id}.fixed_bs_date`, 'fixed_bs_date requires month and day.'))
      }
    }

    if (festival.method === 'tithi_based') {
      if (festival.tithi === undefined || festival.paksha === undefined || festival.searchMonth === undefined) {
        failures.push(fail(`festival.${id}.tithi_based`, 'tithi_based requires tithi, paksha, and searchMonth.'))
      }
    }

    if (festival.method === 'fixed_ad_date') {
      if (festival.adMonth === undefined || festival.adDay === undefined) {
        failures.push(fail(`festival.${id}.fixed_ad_date`, 'fixed_ad_date requires adMonth and adDay.'))
      }
    }
  }

  for (const id of Object.keys(FESTIVAL_SOURCE_MAP)) {
    if (!seenIds.has(id)) {
      failures.push(fail(`festival.${id}.orphan-source`, 'Source map has id not present in BASE_FESTIVALS.'))
    }
  }
}

function assertPublicHolidayConstraints(failures: Failure[]): void {
  const seenIds = new Set<string>()
  for (const holiday of PUBLIC_HOLIDAYS_2082) {
    const id = holiday.id
    if (seenIds.has(id)) {
      failures.push(fail(`holiday.${id}.duplicate`, `Duplicate holiday id "${id}".`))
      continue
    }
    seenIds.add(id)

    if (holiday.type !== 'public_holiday') {
      failures.push(fail(`holiday.${id}.type`, 'Public holiday records must use type="public_holiday".'))
    }
    if (!holiday.isPublicHoliday) {
      failures.push(fail(`holiday.${id}.isPublicHoliday`, 'Public holiday records must set isPublicHoliday=true.'))
    }

    const source = PUBLIC_HOLIDAY_SOURCE_MAP_2082[id]
    if (source === undefined) {
      failures.push(fail(`holiday.${id}.source`, 'Missing source mapping in PUBLIC_HOLIDAY_SOURCE_MAP_2082.'))
    } else {
      assertSourceFields(`holiday.${id}.source`, source, failures)
    }
  }

  for (const id of Object.keys(PUBLIC_HOLIDAY_SOURCE_MAP_2082)) {
    if (!seenIds.has(id)) {
      failures.push(fail(`holiday.${id}.orphan-source`, 'Source map has id not present in PUBLIC_HOLIDAYS_2082.'))
    }
  }
}

function assertThirdPartyReferenceDatasetPolicy(failures: Failure[]): void {
  if (!fs.existsSync(THIRD_PARTY_REFERENCE_DATASET)) {
    failures.push(fail('reference-data.missing', 'Missing tests/reference-data/hamropatro-2082.json file.'))
    return
  }

  const raw = fs.readFileSync(THIRD_PARTY_REFERENCE_DATASET, 'utf8')
  const parsed = JSON.parse(raw) as {
    _metadata?: {
      legalBasis?: string
      usagePolicy?: string
      acquisitionMethod?: string
      redistributionStatement?: string
      requiresTermsReview?: boolean
    }
  }

  const metadata = parsed._metadata
  if (metadata === undefined) {
    failures.push(fail('reference-data.metadata', 'Missing _metadata in hamropatro-2082.json.'))
    return
  }

  if ((metadata.usagePolicy ?? '') !== 'manual_reference_only') {
    failures.push(fail(
      'reference-data.usagePolicy',
      'hamropatro-2082.json must declare usagePolicy="manual_reference_only".',
    ))
  }

  if ((metadata.acquisitionMethod ?? '') !== 'manual_spot_check') {
    failures.push(fail(
      'reference-data.acquisitionMethod',
      'hamropatro-2082.json must declare acquisitionMethod="manual_spot_check".',
    ))
  }

  if ((metadata.requiresTermsReview ?? false) !== true) {
    failures.push(fail(
      'reference-data.requiresTermsReview',
      'hamropatro-2082.json must set requiresTermsReview=true.',
    ))
  }

  if ((metadata.redistributionStatement ?? '').trim().length === 0) {
    failures.push(fail(
      'reference-data.redistributionStatement',
      'hamropatro-2082.json must include redistributionStatement.',
    ))
  }
}

function assertNoThirdPartyAutomationInScripts(failures: Failure[]): void {
  const scriptsDir = path.join(ROOT, 'scripts')
  const stack = [scriptsDir]
  const suspectDomains = [
    'hamropatro.com',
    'drikpanchang.com',
    'nepcalendar.com',
    'ramropatro.com',
    'timeanddate.com',
    'ashesh.com.np',
  ]

  while (stack.length > 0) {
    const dir = stack.pop() as string
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        stack.push(fullPath)
        continue
      }
      if (!entry.isFile() || (!fullPath.endsWith('.ts') && !fullPath.endsWith('.mjs'))) continue

      const relative = path.relative(ROOT, fullPath).replaceAll('\\', '/')
      if (ALLOWED_NETWORK_VALIDATION_SCRIPTS.includes(relative)) continue

      const text = fs.readFileSync(fullPath, 'utf8').toLowerCase()
      const hasAutomation =
        text.includes('fetch(') ||
        text.includes('axios') ||
        text.includes('https.get(') ||
        text.includes('http.get(') ||
        text.includes('curl ')
      if (!hasAutomation) continue

      for (const domain of suspectDomains) {
        if (text.includes(domain)) {
          failures.push(fail(
            `automation.${relative}`,
            `Script references third-party domain "${domain}". Keep such sources manual-reference-only.`,
          ))
        }
      }
    }
  }
}

function main(): void {
  const failures: Failure[] = []

  assertLicense(failures)
  assertFestivalConstraints(failures)
  assertPublicHolidayConstraints(failures)
  assertThirdPartyReferenceDatasetPolicy(failures)
  assertNoThirdPartyAutomationInScripts(failures)

  if (failures.length > 0) {
    console.error('\n[legal] FAIL')
    for (const item of failures) {
      console.error(`  - ${item.code}: ${item.detail}`)
    }
    process.exit(1)
  }

  console.log('\n[legal] OK')
  console.log(`  - festival records validated: ${BASE_FESTIVALS.length}`)
  console.log(`  - public holiday records validated: ${PUBLIC_HOLIDAYS_2082.length}`)
  console.log('  - license, provenance, and third-party usage-policy checks passed')
}

main()
