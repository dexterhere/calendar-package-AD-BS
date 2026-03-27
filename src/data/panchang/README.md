# Panchang Data

Precomputed per-day panchang data for Kathmandu. The runtime lookup uses compact day entries and derives localized names at read time.

## Coverage

- Supported BS year range in this repository: `2080–2090`
- Runtime fallback computation supports older in-range BS years via astronomy-engine

## Entry schema (compact)

Each `<year>.json` contains an array of entries:

```json
{
  "m": 1,
  "d": 1,
  "t": 16,
  "n": 17,
  "y": 18,
  "k": 3,
  "tt": "k"
}
```

Field meanings:

- `m`: BS month (1–12)
- `d`: BS day (1–32)
- `t`: tithi number (1–30)
- `n`: nakshatra number (1–27)
- `y`: yoga number (1–27)
- `k`: karana number (1–11)
- `tt`: optional tithi edge marker (`k` = kshaya, `v` = vriddhi)

## Source and generation

- Primary engine: `scripts/generate-panchang-v2.ts` (astronomy-engine)
- Reference checks: `scripts/validate-panchang.ts`
- Multi-engine cross-validation: `scripts/validation/cross-validate.ts`
- Integrity manifest: `src/data/panchang/integrity-manifest.json` (canonical SHA-256 + day counts)

## Monthly maintenance

Use:

```bash
pnpm maintenance:monthly
```

This runs generation + validation and writes summary artifacts under `reports/`.

## Integrity and reproducibility notes

- `pnpm trust:check` verifies all year files against `integrity-manifest.json` without network access.
- Canonicalization is deterministic (stable key ordering before hashing), so non-semantic formatting changes in JSON do not cause false negatives.
- After intentional panchang data updates, refresh trust metadata with:

```bash
pnpm trust:refresh-manifest
pnpm trust:check
```
