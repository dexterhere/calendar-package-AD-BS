/**
 * src/astro/astronomy-adapter.ts
 *
 * Bridges the astronomy-engine CJS/ESM import incompatibility.
 *
 * Two runtime environments load astronomy-engine differently:
 *
 *   vitest (pure ESM via vite):
 *     `import * as NS` → NS has all named exports directly (Observer, MoonPhase, …)
 *     NS.default is undefined
 *
 *   tsx inside a project with "type":"module" (CJS-wrapped-as-ESM):
 *     `import * as NS` → NS = { default: <full CJS module> }
 *     NS.Observer is undefined, NS.default.Observer is the class
 *
 * This adapter detects which case we're in and re-exports the symbols
 * needed by compute.ts under stable names that work in both environments.
 */

import * as NS from 'astronomy-engine'
import type {
  Observer as ObserverType,
  SearchRiseSet as SearchRiseSetType,
  MoonPhase as MoonPhaseType,
  EclipticGeoMoon as EclipticGeoMoonType,
  Body as BodyType,
} from 'astronomy-engine'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mod: Record<string, unknown> = (NS as any).default ?? NS

export const Observer     = mod['Observer']     as typeof ObserverType
export const SearchRiseSet = mod['SearchRiseSet'] as typeof SearchRiseSetType
export const MoonPhase    = mod['MoonPhase']    as typeof MoonPhaseType
export const EclipticGeoMoon = mod['EclipticGeoMoon'] as typeof EclipticGeoMoonType
export const Body         = mod['Body']         as typeof BodyType
