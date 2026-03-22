# Panchang Data

Pre-computed tithi/paksha/nakshatra data per BS year.

**Coverage target:** BS 2082–2087 (approximately AD 2025–2030)

**Schema per day entry:**
```json
{
  "bsDate": { "year": 2082, "month": 1, "day": 1 },
  "tithi": { "name": "Pratipada", "nameNe": "प्रतिपदा", "number": 1 },
  "paksha": "shukla",
  "nakshatra": { "name": "Ashwini", "nameNe": "अश्विनी" }
}
```

**Sources:**
1. Primary: Nepal Rashtriya Panchang (government-published)
2. Validation: Drik Panchang (drikpanchang.com)

**Maintenance:** Add a new `<year>.json` file before each BS new year (mid-April AD).
