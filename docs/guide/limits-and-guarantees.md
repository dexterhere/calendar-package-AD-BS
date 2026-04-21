# Limits and Guarantees

This page tells application developers what they can safely rely on, where the package draws its boundaries, and what still belongs in the application layer.

## What the package guarantees

Within its supported range, the package aims to provide:

- Deterministic BS to AD and AD to BS conversion.
- Stable public API exports from the package root.
- UTC-safe Gregorian `Date` outputs from conversion APIs.
- Offline-first behavior for embedded data lookups.
- Transparent provenance metadata for events and observances where available.

## Supported ranges

| Capability | Supported range |
|---|---|
| BS to AD conversion | BS 2000-2090 |
| AD to BS conversion | AD dates that map into BS 2000-2090 |
| Precomputed panchang | BS 2080-2090 |
| Live panchang fallback | BS 2000-2079 |
| Public holiday dataset | BS 2082 |

Requests outside the supported range return `null` for panchang or throw a `RangeError` for conversion APIs, depending on the API.

## What the package does not guarantee

The package does not guarantee:

- Legal finality for public-holiday declarations.
- Universal agreement with every third-party calendar site on disputed dates.
- Complete historical coverage before BS 2000 or future coverage after BS 2090.
- Product-specific business rules for bookings, payroll, compliance, or ritual scheduling.
- Purpose-specific muhurat decisions beyond the package's general auspicious/inauspicious signals.

## Timezone guarantee

`toAD()` returns a JavaScript `Date` at UTC midnight. This is a deliberate package contract.

That means downstream code should:

- Use `getUTCFullYear()`, `getUTCMonth()`, and `getUTCDate()`.
- Treat the returned `Date` as a calendar-date carrier, not as a local wall-clock timestamp.
- Avoid local `getFullYear()`/`getMonth()`/`getDate()` getters unless you intentionally want timezone-local reinterpretation.

## Data and trust boundary

The runtime package does not fetch third-party calendar websites during normal use.

The engine is based on:

- Embedded month-length and panchang data where available.
- Deterministic computation for fallback panchang years and custom locations.
- Curated source mappings and validation reports maintained in the repository.

This is a strong reliability model for software integration, but it is still separate from legal or religious authority.

## Application responsibilities

If you build a product on top of this package, your application should still handle:

- User authentication and authorization.
- Input sanitization for external request payloads.
- Product-specific caching and rate limiting.
- Data persistence and audit logging.
- Human review workflows for annually changing holiday policies.
- UX wording around uncertainty, curation, or unsupported ranges.

## Recommended production posture

For production applications:

1. Pin package versions explicitly.
2. Read the changelog and validation notes before upgrading.
3. Run your own smoke tests for the dates that matter most to your users.
4. Treat event output as domain data, not immutable law.
5. Keep a fallback UX for unsupported years or unresolved edge cases.

## Good ways to use the package

- Nepali calendar UI rendering.
- Internal tools that need BS and AD conversion.
- Panchang-backed informational APIs.
- Festival-aware reminders and scheduling surfaces.
- Developer platforms that need a tested Nepali calendar engine.

## Risk-sensitive use cases

Use extra review for:

- Government or legal compliance workflows.
- Public-holiday payroll calculations.
- Ritual or religious scheduling that requires human priest or domain review.
- Long-range forecasting beyond the precomputed trust envelope.

## Related guides

- [Getting Started](./getting-started)
- [Validation and Trust](./validation-and-trust)
- [Developer Journey](./developer-journey)
