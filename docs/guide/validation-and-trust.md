# Validation and Trust

This package uses an offline-first reliability pipeline for routine development and CI.

The goal of this pipeline is not only "tests pass," but also:

- generated data has not been silently altered,
- curated datasets remain traceable,
- release candidates can be explained to downstream teams,
- maintainers have a repeatable trust workflow.

## Routine quality gates

```bash
pnpm typecheck
pnpm test
pnpm validate:panchang
pnpm legal:check
pnpm deps:check
pnpm trust:check
```

What each gate is for:

- `typecheck`: keeps the public API and internal data contracts coherent.
- `test`: catches behavioral regressions.
- `validate:panchang`: checks key dates against curated reference points.
- `legal:check`: enforces provenance and usage-policy hygiene.
- `deps:check`: reviews lockfile integrity and dependency hygiene.
- `trust:check`: verifies generated-data manifests and trust signals.

## Cross-validation

Use multi-engine validation for deeper investigation:

```bash
pnpm validate:cross -- --year 2082 --no-horizons
```

Enable Horizons only for explicit investigations where network dependency is acceptable.

For normal CI and pull requests, prefer the offline path so builds remain deterministic and fast.

## Data integrity workflow

When panchang JSON data changes intentionally:

```bash
pnpm generate:panchang -- --year 2082
pnpm validate:panchang
pnpm trust:refresh-manifest
pnpm trust:check
```

This is the expected sequence whenever panchang source data changes. Do not update generated year files without refreshing the manifest and re-running validation.

## Legal and provenance compliance

- `pnpm legal:check` is a strict release gate.
- It verifies:
  - root `LICENSE` presence and package license metadata consistency
  - explicit source mappings for festival and public-holiday datasets
  - baseline structural constraints for legal traceability
  - observance governance metadata (`authorityTier`, `reviewCadence`, `lastReviewedIsoDate`)
- This check improves release hygiene and auditability; it is not legal advice.

For package consumers, this means the repository is trying to preserve source traceability instead of shipping unexplained hard-coded dates.

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

## Release checklist

Before publishing a new package version, run:

```bash
pnpm typecheck
pnpm test
pnpm validate:panchang
pnpm legal:check
pnpm deps:check
pnpm trust:check
pnpm build
pnpm docs:build
```

If the release includes data updates, also run:

```bash
pnpm trust:refresh-manifest
pnpm validate:cross -- --year 2082 --no-horizons
```

## What downstream developers should know

If you depend on this package in your own application:

- Prefer pinned versions over loose semver ranges.
- Review release notes for data changes, not just API changes.
- Keep a short smoke-test suite for the dates most important to your product.
- Treat trust checks as a strong signal, not a substitute for your own business validation.
