# Validation and Trust

This package uses an offline-first reliability pipeline for routine development and CI.

## Routine quality gates

```bash
pnpm typecheck
pnpm test
pnpm validate:panchang
pnpm legal:check
pnpm deps:check
pnpm trust:check
```

## Cross-validation

Use multi-engine validation for deeper investigation:

```bash
pnpm validate:cross -- --year 2082 --no-horizons
```

Enable Horizons only for explicit investigations where network dependency is acceptable.

## Data integrity workflow

When panchang JSON data changes intentionally:

```bash
pnpm generate:panchang -- --year 2082
pnpm validate:panchang
pnpm trust:refresh-manifest
pnpm trust:check
```

## Legal and provenance compliance

- `pnpm legal:check` is a strict release gate.
- It verifies:
  - root `LICENSE` presence and package license metadata consistency
  - explicit source mappings for festival and public-holiday datasets
  - baseline structural constraints for legal traceability
  - observance governance metadata (`authorityTier`, `reviewCadence`, `lastReviewedIsoDate`)
- This check improves release hygiene and auditability; it is not legal advice.

## International observance curation policy

- International observances are a **curated factual set**, not an exhaustive registry of all possible global days.
- They are classified as informational events (`fixed_ad_date`, non-public-holiday) and can be filtered separately from Nepal public holidays.
- Source mappings must declare:
  - authority tier (`primary_official`, `secondary_authoritative`, or `community_reference`)
  - review cadence (quarterly/semiannual/annual)
  - last reviewed date (ISO format)
- Before release, review and refresh curated observances according to cadence and rerun `pnpm legal:check`.

## Third-party source legal boundary

- Third-party calendar sites (for example Hamro Patro / Drik Panchang) are used as **manual reference checks**, not as automated ingestion sources.
- Validation data should keep only minimal factual assertions (date/tithi/nakshatra expectations) needed for regression tests.
- Do not add scripts that fetch or scrape third-party calendar websites for production or validation datasets without explicit legal review.
