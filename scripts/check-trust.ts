/**
 * scripts/check-trust.ts
 *
 * Local/CI trust checks with no external network dependency by default:
 *  1) lockfile integrity metadata presence + duplicate package version hygiene
 *  2) deterministic panchang data manifest verification (or refresh)
 *
 * Usage:
 *   pnpm trust:check
 *   pnpm deps:check
 *   pnpm trust:refresh-manifest
 */

import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

type CliMode = 'check' | 'lockfile-only' | 'write-manifest'

interface ManifestFile {
  metadata: {
    generatedAt: string
    generatedBy: string
    source: string
    algorithm: 'sha256'
    years: number[]
    totalDays: number
    note: string
  }
  files: Record<string, {
    sha256: string
    bytes: number
    days: number
  }>
}

const __filename = fileURLToPath(import.meta.url)
const ROOT = path.resolve(__filename, '..', '..')
const LOCKFILE = path.join(ROOT, 'pnpm-lock.yaml')
const PANCHANG_DIR = path.join(ROOT, 'src', 'data', 'panchang')
const MANIFEST_PATH = path.join(PANCHANG_DIR, 'integrity-manifest.json')

function parseMode(argv: string[]): CliMode {
  if (argv.includes('--lockfile-only')) return 'lockfile-only'
  if (argv.includes('--write-manifest')) return 'write-manifest'
  return 'check'
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value)
  }
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`
  }
  const entries = Object.entries(value as Record<string, unknown>)
    .sort(([a], [b]) => a.localeCompare(b))
  return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`).join(',')}}`
}

function sha256OfString(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex')
}

function ensureLockfileExists(): string {
  if (!fs.existsSync(LOCKFILE)) {
    throw new Error('Missing pnpm-lock.yaml. Run pnpm install to regenerate lockfile deterministically.')
  }
  return fs.readFileSync(LOCKFILE, 'utf8')
}

function normalizeLockVersion(version: string): string {
  const peerVariantIdx = version.indexOf('(')
  return peerVariantIdx === -1 ? version : version.slice(0, peerVariantIdx)
}

function checkLockfileHygiene(
  lockText: string,
  options: { strictDuplicates: boolean }
): { summary: string[]; issues: string[]; warnings: string[] } {
  const summary: string[] = []
  const issues: string[] = []
  const warnings: string[] = []

  const integrityMatches = lockText.match(/integrity:\s*sha\d{3,}-/g) ?? []
  summary.push(`lockfile integrities found: ${integrityMatches.length}`)
  if (integrityMatches.length === 0) {
    issues.push('No integrity hashes found in pnpm-lock.yaml package resolutions.')
  }

  const packageEntries = [...lockText.matchAll(/^ {2}(.+):$/gm)]
  const versionsByName = new Map<string, Set<string>>()
  for (const match of packageEntries) {
    const rawKey = match[1]?.trim()
    if (!rawKey) continue

    const key = rawKey.startsWith('\'') && rawKey.endsWith('\'')
      ? rawKey.slice(1, -1)
      : rawKey

    const versionStart = key.startsWith('@')
      ? key.indexOf('@', key.indexOf('/') + 1)
      : key.indexOf('@')

    if (versionStart <= 0) continue

    const name = key.slice(0, versionStart)
    const version = normalizeLockVersion(key.slice(versionStart + 1))

    let set = versionsByName.get(name)
    if (!set) {
      set = new Set<string>()
      versionsByName.set(name, set)
    }
    set.add(version)
  }

  const duplicates = [...versionsByName.entries()]
    .filter(([, versions]) => versions.size > 1)
    .sort((a, b) => b[1].size - a[1].size)
  summary.push(`packages with multiple versions: ${duplicates.length}`)
  if (duplicates.length > 0) {
    const worst = duplicates.slice(0, 10).map(([name, versions]) => `${name}(${versions.size})`)
    const message =
      `Dependency hygiene warning: multiple versions detected for ${duplicates.length} package(s): ${worst.join(', ')}`
    if (options.strictDuplicates) {
      issues.push(message)
    } else {
      warnings.push(message)
    }
  }

  return { summary, issues, warnings }
}

function listPanchangYearFiles(): string[] {
  const files = fs.readdirSync(PANCHANG_DIR)
    .filter(name => /^\d{4}\.json$/.test(name))
    .sort()
  if (files.length === 0) {
    throw new Error('No panchang year JSON files found under src/data/panchang.')
  }
  return files
}

function buildManifestData(): ManifestFile {
  const files = listPanchangYearFiles()
  const entries: ManifestFile['files'] = {}
  let totalDays = 0
  const years: number[] = []

  for (const fileName of files) {
    const year = Number.parseInt(fileName.slice(0, 4), 10)
    years.push(year)

    const fullPath = path.join(PANCHANG_DIR, fileName)
    const raw = fs.readFileSync(fullPath, 'utf8')
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) {
      throw new Error(`Invalid panchang JSON in ${fileName}: expected an array.`)
    }

    const canonical = stableStringify(parsed)
    const bytes = Buffer.byteLength(canonical, 'utf8')
    const hash = sha256OfString(canonical)
    const days = parsed.length
    totalDays += days

    entries[fileName] = { sha256: hash, bytes, days }
  }

  return {
    metadata: {
      generatedAt: new Date().toISOString(),
      generatedBy: 'pnpm trust:refresh-manifest',
      source: 'src/data/panchang/*.json (canonicalized JSON, key-sorted)',
      algorithm: 'sha256',
      years,
      totalDays,
      note: 'Offline integrity signal only; combine with validate:panchang for domain correctness.',
    },
    files: entries,
  }
}

function writeManifest(): ManifestFile {
  const manifest = buildManifestData()
  fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
  return manifest
}

function verifyManifest(): { ok: boolean; details: string[]; issues: string[] } {
  const details: string[] = []
  const issues: string[] = []

  if (!fs.existsSync(MANIFEST_PATH)) {
    issues.push(
      'Missing integrity manifest at src/data/panchang/integrity-manifest.json. Run: pnpm trust:refresh-manifest'
    )
    return { ok: false, details, issues }
  }

  const expectedRaw = fs.readFileSync(MANIFEST_PATH, 'utf8')
  const expected = JSON.parse(expectedRaw) as ManifestFile
  const current = buildManifestData()

  details.push(`manifest years: ${current.metadata.years[0]}-${current.metadata.years[current.metadata.years.length - 1]}`)
  details.push(`manifest files checked: ${Object.keys(current.files).length}`)

  for (const [fileName, info] of Object.entries(current.files)) {
    const expectedInfo = expected.files[fileName]
    if (!expectedInfo) {
      issues.push(`Manifest missing entry for ${fileName}`)
      continue
    }
    if (expectedInfo.sha256 !== info.sha256) {
      issues.push(`${fileName}: sha256 mismatch (expected ${expectedInfo.sha256}, got ${info.sha256})`)
    }
    if (expectedInfo.days !== info.days) {
      issues.push(`${fileName}: day count mismatch (expected ${expectedInfo.days}, got ${info.days})`)
    }
  }

  for (const expectedName of Object.keys(expected.files)) {
    if (!(expectedName in current.files)) {
      issues.push(`Manifest references missing file ${expectedName}`)
    }
  }

  return { ok: issues.length === 0, details, issues }
}

function main(): void {
  const argv = process.argv.slice(2)
  const mode = parseMode(process.argv.slice(2))
  const strictDuplicates = argv.includes('--strict-duplicates')

  const lockText = ensureLockfileExists()
  const lock = checkLockfileHygiene(lockText, { strictDuplicates })

  console.log('\n[trust] lockfile checks')
  for (const line of lock.summary) {
    console.log(`  - ${line}`)
  }
  for (const warning of lock.warnings) {
    console.log(`  - warning: ${warning}`)
  }

  if (mode === 'lockfile-only') {
    if (lock.issues.length > 0) {
      console.error('\n[trust] FAIL')
      for (const issue of lock.issues) {
        console.error(`  - ${issue}`)
      }
      process.exit(1)
    }
    console.log('\n[trust] OK (lockfile-only)')
    return
  }

  if (mode === 'write-manifest') {
    const manifest = writeManifest()
    console.log('\n[trust] integrity manifest updated')
    console.log(`  - file: ${path.relative(ROOT, MANIFEST_PATH)}`)
    console.log(`  - years: ${manifest.metadata.years[0]}-${manifest.metadata.years[manifest.metadata.years.length - 1]}`)
    console.log(`  - total days: ${manifest.metadata.totalDays}`)
    return
  }

  const manifest = verifyManifest()
  console.log('\n[trust] generated data checks')
  for (const line of manifest.details) {
    console.log(`  - ${line}`)
  }

  const allIssues = [...lock.issues, ...manifest.issues]
  if (allIssues.length > 0) {
    console.error('\n[trust] FAIL')
    for (const issue of allIssues) {
      console.error(`  - ${issue}`)
    }
    process.exit(1)
  }

  console.log('\n[trust] OK')
}

main()
