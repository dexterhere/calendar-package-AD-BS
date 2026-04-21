# What is Bikram Sambat?

Bikram Sambat (BS) is Nepal's official calendar system and the one used in daily life for everything from government documents to festival scheduling. If you work with any Nepali date data, you will encounter BS.

## The basics

BS is a **lunisolar calendar** — it tracks both the sun (for month start/end) and the moon (for religious timings). The Gregorian calendar (AD/CE) is purely solar.

BS runs approximately **56 years and 8 months ahead** of the Gregorian calendar. Today in AD 2026 is BS 2082. The offset is not a fixed number of days — it drifts slightly based on the difference between the two calendar systems' year lengths.

| AD year | BS year (approx.) |
|---|---|
| 1943 | 2000 |
| 2000 | 2056–2057 |
| 2025 | 2081–2082 |
| 2043 | 2099–2100 |

## Why months have variable lengths

This is the most confusing part for developers coming from Gregorian calendars.

In BS, **each month can have 29, 30, 31, or 32 days** — and the number changes year to year. Baishakh (month 1) might have 31 days in BS 2082 and 32 days in BS 2083. There is no formula to derive this — the lengths are determined by astronomical observation and published by Nepal's official authority, the [Nepal Rashtriya Panchang](https://nepalipatro.com.np).

This is why this package ships a precomputed month-length table (`bs-month-lengths.json`) covering BS 2000–2090. There is no shortcut.

A BS year totals **365 or 366 days**, same as the Gregorian year, because BS is synced to the solar year. The variable month lengths are how BS redistributes those days while staying aligned with the moon's phases.

## The twelve months

| # | Nepali name | English name | Approx. AD period |
|---|---|---|---|
| 1 | बैशाख | Baishakh | mid-Apr to mid-May |
| 2 | जेठ | Jestha | mid-May to mid-Jun |
| 3 | असार | Ashadh | mid-Jun to mid-Jul |
| 4 | श्रावण | Shrawan | mid-Jul to mid-Aug |
| 5 | भाद्र | Bhadra | mid-Aug to mid-Sep |
| 6 | आश्विन | Ashwin | mid-Sep to mid-Oct |
| 7 | कार्तिक | Kartik | mid-Oct to mid-Nov |
| 8 | मंसिर | Mangsir | mid-Nov to mid-Dec |
| 9 | पुष | Poush | mid-Dec to mid-Jan |
| 10 | माघ | Magh | mid-Jan to mid-Feb |
| 11 | फाल्गुन | Falgun | mid-Feb to mid-Mar |
| 12 | चैत्र | Chaitra | mid-Mar to mid-Apr |

The BS new year begins in **Baishakh** (around April 14 in AD). This is a national holiday in Nepal.

## Why Nepal uses two calendars simultaneously

Nepal officially uses BS for all government, legal, and cultural purposes. AD is used in international contexts, banking, and software systems.

In practice, every Nepali institution works with both:

- **Government documents** (birth certificates, land records, contracts) use BS dates.
- **Bank statements and international wire transfers** use AD dates.
- **Festivals** are scheduled by BS date (and often by tithi — lunar day — within BS).
- **Nepali newspapers** print both dates in the header.

Any software that deals with Nepali users, government data, or cultural events needs to handle BS. That is what this package is for.

## What this package supports

| Feature | Range |
|---|---|
| BS ↔ AD date conversion | BS 2000–2090 (AD 1943–2043) |
| Monthly calendar grid | Full BS range |
| Panchang data (precomputed) | BS 2080–2090 |
| Panchang data (live fallback) | BS 2000–2079 |
| Festival detection | All years (rule-based) |
| Public holidays | BS 2082 (more years in progress) |

## Next steps

- [Date Conversion](./date-conversion) — how BS ↔ AD conversion works under the hood
- [Getting Started](./getting-started) — install the package and convert your first date
