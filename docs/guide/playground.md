# Interactive Playground

Use the live playground to explore the package behavior directly in the browser.

- Calendar explorer with day-level details
- BS ↔ AD conversion tools
- Panchang lookups and month table
- Festival/event views
- Auspicious date checks
- Raw API response view

Open it here:

- <a href="/playground/index.html" target="_blank">Launch Playground</a>

## What the playground is for

The playground is designed for:

- quick API behavior checks before coding integration
- debugging date conversion or panchang assumptions
- validating event and auspicious-date outputs for specific dates
- sharing reproducible examples with teammates

## Build and publishing requirements

The playground imports the package bundle from `/dist/index.js`, which is synced into docs public assets during docs commands.

If you need a local URL for browser testing, run:

```bash
pnpm run site:dev
```

This starts VitePress and prints a URL like `http://localhost:5173/`.

Required workflow before preview/deploy:

```bash
pnpm run build
pnpm run docs:build
```

For local interactive docs:

```bash
pnpm run docs:dev
```

These commands now run `docs:sync-playground-assets` automatically to prevent missing `/dist/*` files.

## Troubleshooting (404 / blank playground)

If you see a 404 when opening `/playground/` or the page loads but tools fail:

1. Ensure package bundle exists: run `pnpm run build`
2. Re-sync docs assets: run `pnpm run docs:sync-playground-assets`
3. Rebuild docs: run `pnpm run docs:build` (or `pnpm run docs:dev`)
4. Confirm `docs/public/dist/index.js` exists

## Notes

- Playground behavior is deterministic and uses the same exported APIs documented in the package.
- It is an integration demo, not a security boundary. Production apps should still validate input and handle API errors explicitly.
