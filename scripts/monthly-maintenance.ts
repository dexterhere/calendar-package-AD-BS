/**
 * Monthly maintenance runner for panchang data reliability.
 *
 * Workflow:
 *  1) Generate panchang for target year window (default current BS year and next year)
 *  2) Validate generated data against curated reference dates
 *  3) Cross-validate using independent astronomical engines (local-only by default)
 *  4) Produce a machine-readable summary report for CI and maintainers
 *
 * This script is safe to run in automation (cron/GitHub Actions).
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

interface MaintenanceSummary {
  generatedAt: string
  years: number[]
  steps: Array<{
    name: string
    command: string
    exitCode: number
  }>
  success: boolean
}

const ROOT = path.resolve(fileURLToPath(import.meta.url), '../..')
const REPORT_DIR = path.join(ROOT, 'reports')

function parseArg(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag)
  return idx !== -1 ? process.argv[idx + 1] : undefined
}

function hasFlag(flag: string): boolean {
  return process.argv.includes(flag)
}

function approxBsYearFromNow(): number {
  return new Date().getUTCFullYear() + 57
}

function runStep(name: string, command: string): { exitCode: number } {
  const result = spawnSync(command, {
    shell: true,
    stdio: 'inherit',
    cwd: ROOT,
  })

  return { exitCode: result.status ?? 1 }
}

function main(): void {
  const explicitYear = parseArg('--year')
  const fromArg = parseArg('--from')
  const toArg = parseArg('--to')
  const withHorizons = hasFlag('--with-horizons')

  const years: number[] =
    explicitYear !== undefined
      ? [Number.parseInt(explicitYear, 10)]
      : fromArg !== undefined && toArg !== undefined
        ? Array.from(
            { length: Number.parseInt(toArg, 10) - Number.parseInt(fromArg, 10) + 1 },
            (_, i) => Number.parseInt(fromArg, 10) + i
          )
        : [approxBsYearFromNow(), approxBsYearFromNow() + 1]

  fs.mkdirSync(REPORT_DIR, { recursive: true })

  const steps: MaintenanceSummary['steps'] = []
  let success = true

  for (const year of years) {
    const genCmd = `pnpm exec tsx --tsconfig scripts/tsconfig.scripts.json scripts/generate-panchang-v2.ts --year ${year}`
    const genRes = runStep(`generate-${year}`, genCmd)
    steps.push({ name: `generate-${year}`, command: genCmd, exitCode: genRes.exitCode })
    if (genRes.exitCode !== 0) success = false

    const crossCmd = withHorizons
      ? `pnpm exec tsx --tsconfig scripts/tsconfig.scripts.json scripts/validation/cross-validate.ts --year ${year}`
      : `pnpm exec tsx --tsconfig scripts/tsconfig.scripts.json scripts/validation/cross-validate.ts --year ${year} --no-horizons`
    const crossRes = runStep(`cross-validate-${year}`, crossCmd)
    steps.push({ name: `cross-validate-${year}`, command: crossCmd, exitCode: crossRes.exitCode })
    if (crossRes.exitCode !== 0) success = false
  }

  const validateCmd = 'pnpm exec tsx --tsconfig scripts/tsconfig.scripts.json scripts/validate-panchang.ts'
  const validateRes = runStep('validate-panchang', validateCmd)
  steps.push({ name: 'validate-panchang', command: validateCmd, exitCode: validateRes.exitCode })
  if (validateRes.exitCode !== 0) success = false

  const summary: MaintenanceSummary = {
    generatedAt: new Date().toISOString(),
    years,
    steps,
    success,
  }

  const outPath = path.join(REPORT_DIR, 'monthly-maintenance-summary.json')
  fs.writeFileSync(outPath, JSON.stringify(summary, null, 2), 'utf8')

  if (!success) {
    process.exit(1)
  }
}

main()
