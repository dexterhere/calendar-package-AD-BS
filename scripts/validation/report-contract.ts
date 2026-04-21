import fs from 'node:fs'
import path from 'node:path'

export const REPORT_CONTRACT_VERSION = '1.0.0'

export type ValidationCheckStatus = 'pass' | 'fail' | 'warn' | 'skip'

export interface ValidationCheckResult {
  id: string
  category: string
  label: string
  status: ValidationCheckStatus
  expected?: string
  actual?: string
  details?: string
  metadata?: Record<string, unknown>
}

export interface ValidationRunMetadata {
  source: string
  script: string
  command: string
  generatedAt: string
  artifactPath: string
  metadata?: Record<string, unknown>
}

export interface ValidationStatusSummary {
  total: number
  pass: number
  fail: number
  warn: number
  skip: number
  success: boolean
}

export interface UnifiedValidationReport {
  contractVersion: string
  run: ValidationRunMetadata
  statusSummary: ValidationStatusSummary
  checks: ValidationCheckResult[]
}

interface BuildUnifiedReportInput {
  source: string
  script: string
  command: string
  generatedAt: string
  artifactPath: string
  checks: ValidationCheckResult[]
  metadata?: Record<string, unknown>
}

function portablePath(filePath: string): string {
  return filePath.replaceAll('\\', '/')
}

export function buildStatusSummary(checks: ValidationCheckResult[]): ValidationStatusSummary {
  let pass = 0
  let fail = 0
  let warn = 0
  let skip = 0

  for (const check of checks) {
    if (check.status === 'pass') pass++
    else if (check.status === 'fail') fail++
    else if (check.status === 'warn') warn++
    else skip++
  }

  return {
    total: checks.length,
    pass,
    fail,
    warn,
    skip,
    success: fail === 0,
  }
}

export function buildUnifiedReport(input: BuildUnifiedReportInput): UnifiedValidationReport {
  return {
    contractVersion: REPORT_CONTRACT_VERSION,
    run: {
      source: input.source,
      script: input.script,
      command: input.command,
      generatedAt: input.generatedAt,
      artifactPath: portablePath(input.artifactPath),
      ...(input.metadata ? { metadata: input.metadata } : {}),
    },
    statusSummary: buildStatusSummary(input.checks),
    checks: input.checks,
  }
}

export function writeJsonArtifact(filePath: string, payload: unknown): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
}
