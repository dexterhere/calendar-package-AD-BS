# Validation and Trust

This package uses an offline-first reliability pipeline for routine development and CI.

## Routine quality gates

```bash
pnpm typecheck
pnpm test
pnpm validate:panchang
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
