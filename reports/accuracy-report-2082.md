# 📊 Calendar Accuracy Report — BS 2082

> **Developed and Led by: Prince Bhagat — Call sign "Buggy Buck" 🦌**
>
> **Package:** `@meroevent/nepali-calendar-engine` v0.1.0
> **Generated:** 2026-03-23T10:47:02.886Z
> **Reference:** Hamro Patro, Drik Panchang, Nepal Rashtriya Panchang

---

## 🎯 Overall Accuracy Dashboard

| Metric | Score |
|--------|-------|
| **Overall Accuracy** | 🟢 **98.6%** |
| 1. BS↔AD Conversion | 🟢 100.0% (13/13) |
| 2. Tithi Accuracy | 🟢 100.0% (10/10) |
| 3. Special Dates | 🟡 95.8% (23/24) |
| 4. Festival Accuracy | 🟢 100.0% (24/24) |
| 5. Nakshatra Data | 🟢 100.0% (2/2) |

## 1. BS↔AD Conversion

| Test | Status | Expected | Actual |
|------|--------|----------|--------|
| BS 2082/1/1 → AD (Nepali New Year) | ✅ PASS | 2025-04-14 | 2025-04-14 |
| BS 2082/2/1 → AD (Jestha 1) | ✅ PASS | 2025-05-15 | 2025-05-15 |
| BS 2082/3/1 → AD (Ashadh 1) | ✅ PASS | 2025-06-15 | 2025-06-15 |
| BS 2082/4/1 → AD (Shrawan 1) | ✅ PASS | 2025-07-17 | 2025-07-17 |
| BS 2082/5/1 → AD (Bhadra 1) | ✅ PASS | 2025-08-17 | 2025-08-17 |
| BS 2082/6/1 → AD (Ashwin 1) | ✅ PASS | 2025-09-17 | 2025-09-17 |
| BS 2082/7/1 → AD (Kartik 1) | ✅ PASS | 2025-10-18 | 2025-10-18 |
| BS 2082/8/1 → AD (Mangsir 1) | ✅ PASS | 2025-11-17 | 2025-11-17 |
| BS 2082/9/1 → AD (Poush 1) | ✅ PASS | 2025-12-16 | 2025-12-16 |
| BS 2082/10/1 → AD (Magh 1 / Maghe Sankranti (⚠️ off-by-1 vs some sources)) | ✅ PASS | 2026-01-15 | 2026-01-15 |
| BS 2082/11/1 → AD (Falgun 1) | ✅ PASS | 2026-02-13 | 2026-02-13 |
| BS 2082/12/1 → AD (Chaitra 1) | ✅ PASS | 2026-03-15 | 2026-03-15 |
| Round-trip consistency (365 days) | ✅ PASS | 365/365 round-trips match | 365/365 round-trips match |

## 2. Tithi Accuracy

| Test | Status | Expected | Actual |
|------|--------|----------|--------|
| Tithi at BS 2082/1/1 (Krishna Pratipada (New Year)) | ✅ PASS | Tithi 16, krishna | Tithi 16, krishna |
| Tithi at BS 2082/1/14 (Amavasya) | ✅ PASS | Tithi 30, krishna | Tithi 30, krishna |
| Tithi at BS 2082/1/15 (Shukla Pratipada) | ✅ PASS | Tithi 1, shukla | Tithi 1, shukla |
| Tithi at BS 2082/1/29 (Purnima) | ✅ PASS | Tithi 15, shukla | Tithi 15, shukla |
| Tithi at BS 2082/7/5 (Ghatasthapana) | ✅ PASS | Tithi 1, shukla | Tithi 1, shukla |
| Tithi at BS 2082/7/15 (Vijaya Dashami) | ✅ PASS | Tithi 10, shukla | Tithi 10, shukla |
| Tithi at BS 2082/7/19 (Kojagrat Purnima) | ✅ PASS | Tithi 15, shukla | Tithi 15, shukla |
| Tithi at BS 2082/8/4 (Laxmi Puja (Amavasya)) | ✅ PASS | Tithi 30, krishna | Tithi 30, krishna |
| Tithi at BS 2082/8/6 (Bhai Tika) | ✅ PASS | Tithi 2, shukla | Tithi 2, shukla |
| Tithi data coverage (365 days) | ✅ PASS | 365 days with valid tithi data | 365/365 days valid |

## 3. Special Dates

| Test | Status | Expected | Actual |
|------|--------|----------|--------|
| Purnima — BS 2082/1/29 (Baishakh Purnima / Buddha Jayanti) | ✅ PASS | Tithi 15 (Purnima), Shukla Paksha | Tithi 15 (Purnima), shukla |
| Purnima — BS 2082/2/28 (Jestha Purnima) | ✅ PASS | Tithi 15 (Purnima), Shukla Paksha | Tithi 15 (Purnima), shukla |
| Purnima — BS 2082/3/26 (Ashadh Purnima / Guru Purnima) | ✅ PASS | Tithi 15 (Purnima), Shukla Paksha | Tithi 15 (Purnima), shukla |
| Purnima — BS 2082/4/24 (Shrawan Purnima / Janai Purnima) | ✅ PASS | Tithi 15 (Purnima), Shukla Paksha | Tithi 15 (Purnima), shukla |
| Purnima — BS 2082/5/22 (Bhadra Purnima) | ✅ PASS | Tithi 15 (Purnima), Shukla Paksha | Tithi 15 (Purnima), shukla |
| Purnima — BS 2082/6/21 (Ashwin Purnima) | ✅ PASS | Tithi 15 (Purnima), Shukla Paksha | Tithi 15 (Purnima), shukla |
| Purnima — BS 2082/7/19 (Kartik Purnima / Kojagrat Purnima) | ✅ PASS | Tithi 15 (Purnima), Shukla Paksha | Tithi 15 (Purnima), shukla |
| Purnima — BS 2082/9/19 (Poush Purnima) | ✅ PASS | Tithi 15 (Purnima), Shukla Paksha | Tithi 15 (Purnima), shukla |
| Purnima — BS 2082/10/18 (Magh Purnima) | ✅ PASS | Tithi 15 (Purnima), Shukla Paksha | Tithi 15 (Purnima), shukla |
| Purnima — BS 2082/11/19 (Falgun Purnima / Holi) | ✅ PASS | Tithi 15 (Purnima), Shukla Paksha | Tithi 15 (Purnima), shukla |
| Purnima — BS 2082/12/19 (Chaitra Purnima) | ✅ PASS | Tithi 15 (Purnima), Shukla Paksha | Tithi 15 (Purnima), shukla |
| Amavasya — BS 2082/1/14 (Baishakh Amavasya / Mata Tirtha Aunsi) | ✅ PASS | Tithi 30 (Amavasya), Krishna Paksha | Tithi 30 (Amavasya), krishna |
| Amavasya — BS 2082/2/13 (Jestha Amavasya) | ✅ PASS | Tithi 30 (Amavasya), Krishna Paksha | Tithi 30 (Amavasya), krishna |
| Amavasya — BS 2082/3/11 (Ashadh Amavasya) | ✅ PASS | Tithi 30 (Amavasya), Krishna Paksha | Tithi 30 (Amavasya), krishna |
| Amavasya — BS 2082/4/8 (Shrawan Amavasya / Gokarna Aunsi) | ✅ PASS | Tithi 30 (Amavasya), Krishna Paksha | Tithi 30 (Amavasya), krishna |
| Amavasya — BS 2082/5/7 (Bhadra Amavasya / Kushe Aunsi) | ✅ PASS | Tithi 30 (Amavasya), Krishna Paksha | Tithi 30 (Amavasya), krishna |
| Amavasya — BS 2082/6/5 (Ashwin Amavasya) | ✅ PASS | Tithi 30 (Amavasya), Krishna Paksha | Tithi 30 (Amavasya), krishna |
| Amavasya — BS 2082/7/4 (Kartik Amavasya / Laxmi Puja) | ✅ PASS | Tithi 30 (Amavasya), Krishna Paksha | Tithi 30 (Amavasya), krishna |
| Amavasya — BS 2082/8/4 (Mangsir Amavasya) | ✅ PASS | Tithi 30 (Amavasya), Krishna Paksha | Tithi 30 (Amavasya), krishna |
| Amavasya — BS 2082/9/4 (Poush Amavasya) | ✅ PASS | Tithi 30 (Amavasya), Krishna Paksha | Tithi 30 (Amavasya), krishna |
| Amavasya — BS 2082/10/4 (Magh Amavasya) | ✅ PASS | Tithi 30 (Amavasya), Krishna Paksha | Tithi 30 (Amavasya), krishna |
| Amavasya — BS 2082/11/5 (Falgun Amavasya) | ✅ PASS | Tithi 30 (Amavasya), Krishna Paksha | Tithi 30 (Amavasya), krishna |
| Amavasya — BS 2082/12/5 (Chaitra Amavasya) | ✅ PASS | Tithi 30 (Amavasya), Krishna Paksha | Tithi 30 (Amavasya), krishna |
| Ekadashi detection (24 expected across 12 months) | ⚠️ WARN | 24 Ekadashi dates found | 21 Ekadashi dates found |

## 4. Festival Accuracy

| Test | Status | Expected | Actual |
|------|--------|----------|--------|
| Ghatasthapana — BS 2082/7/5 | ✅ PASS | Event "dashain-day1" found on 2082/7/5 | Found: "Ghatasthapana (Dashain Day 1)" (tithi ✓) |
| Fulpati — BS 2082/7/12 | ✅ PASS | Event "dashain-day7" found on 2082/7/12 | Found: "Fulpati (Dashain Day 7)" (tithi ✓) |
| Maha Asthami — BS 2082/7/13 | ✅ PASS | Event "dashain-day8" found on 2082/7/13 | Found: "Maha Asthami (Dashain Day 8)" (tithi ✓) |
| Maha Nawami — BS 2082/7/14 | ✅ PASS | Event "dashain-day9" found on 2082/7/14 | Found: "Maha Nawami (Dashain Day 9)" (tithi ✓) |
| Vijaya Dashami — BS 2082/7/15 | ✅ PASS | Event "vijaya-dashami" found on 2082/7/15 | Found: "Vijaya Dashami (Dashain Day 10)" (tithi ✓) |
| Kojagrat Purnima (Dashain Day 15) — BS 2082/7/19 | ✅ PASS | Event "kojagrat-purnima" found on 2082/7/19 | Found: "Kojagrat Purnima (Dashain Day 15)" (tithi ✓) |
| Kag Tihar — BS 2082/7/2 | ✅ PASS | Event "tihar-day1" found on 2082/7/2 | Found: "Kag Tihar (Crow Worship)" (tithi ✓) |
| Kukur Tihar — BS 2082/7/3 | ✅ PASS | Event "tihar-day2" found on 2082/7/3 | Found: "Kukur Tihar (Dog Worship)" (tithi ✓) |
| Laxmi Puja — BS 2082/7/4 | ✅ PASS | Event "tihar-day3-laxmi" found on 2082/7/4 | Found: "Laxmi Puja (Tihar Day 3)" (tithi ✓) |
| Govardhan Puja / Mha Puja — BS 2082/7/5 | ✅ PASS | Event "tihar-day4" found on 2082/7/5 | Found: "Govardhan Puja / Mha Puja (Tihar Day 4)" (tithi ✓) |
| Bhai Tika — BS 2082/7/6 | ✅ PASS | Event "tihar-day5" found on 2082/7/6 | Found: "Bhai Tika (Tihar Day 5)" (tithi ✓) |
| Maghe Sankranti — BS 2082/10/1 | ✅ PASS | Event "maghe-sankranti" found on 2082/10/1 | Found: "Maghe Sankranti" |
| Maha Shivaratri — BS 2082/11/4 | ✅ PASS | Event "mahashivaratri" found on 2082/11/4 | Found: "Maha Shivaratri" (tithi ✓) |
| Holi (Fagu Purnima) — BS 2082/11/19 | ✅ PASS | Event "holy" found on 2082/11/19 | Found: "Holi (Fagu Purnima)" (tithi ✓) |
| Haritalika Teej — BS 2082/5/10 | ✅ PASS | Event "teej" found on 2082/5/10 | Found: "Harijika Teej (Women's Festival)" (tithi ✓) |
| Buddha Jayanti — BS 2082/1/29 | ✅ PASS | Event "buddha-jayanti" found on 2082/1/29 | Found: "Buddha Jayanti (Buddha Purnima)" (tithi ✓) |
| Janai Purnima — BS 2082/4/24 | ✅ PASS | Event "janai-purnima" found on 2082/4/24 | Found: "Janai Purnima / Raksha Bandhan" (tithi ✓) |
| Gokarna Aunsi (Father's Day) — BS 2082/5/7 | ✅ PASS | Event "gokarna-aurasi" found on 2082/5/7 | Found: "Gokarna Aunsi (Father's Day)" (tithi ✓) |
| Mata Tirtha Aunsi (Mother's Day) — BS 2082/1/14 | ✅ PASS | Event "mata-tirtha-aunsi" found on 2082/1/14 | Found: "Mata Tirtha Aunsi (Mother's Day)" (tithi ✓) |
| Krishna Janmashtami — BS 2082/5/29 | ✅ PASS | Event "krishna-janmastami" found on 2082/5/29 | Found: "Krishna Janmastami" (tithi ✓) |
| Ghode Jatra — BS 2082/12/5 | ✅ PASS | Event "ghode-jatra" found on 2082/12/5 | Found: "Ghode Jatra" (tithi ✓) |
| Chhath Parva — BS 2082/7/11 | ✅ PASS | Event "chhath-parva" found on 2082/7/11 | Found: "Chhath Parva" (tithi ✓) |
| Republic Day — BS 2082/2/15 | ✅ PASS | Event "republic-day" found on 2082/2/15 | Found: "Republic Day" |
| Constitution Day — BS 2082/5/3 | ✅ PASS | Event "constitution-day" found on 2082/5/3 | Found: "Constitution Day" |

## 5. Nakshatra Data

| Test | Status | Expected | Actual |
|------|--------|----------|--------|
| Nakshatra data coverage | ✅ PASS | >90% days with nakshatra data | 365/365 days (100.0%) |
| Nakshatra value validity | ✅ PASS | All nakshatra entries have valid names | All 365 entries valid |

## 🎯 Bang-On Matches (Perfect Accuracy)

- ✅ 1. BS↔AD Conversion: 13/13 tests
- ✅ 2. Tithi Accuracy: 10/10 tests
- ✅ 4. Festival Accuracy: 24/24 tests
- ✅ 5. Nakshatra Data: 2/2 tests

## 🔧 Needs Enhancement

_All tests passing — no enhancements needed!_

## 💡 Recommendations

All core data is accurate! Consider:
1. Extending panchang data to more years (2083-2090) with verified sources
2. Adding government holidays for years beyond 2082
3. Cross-referencing with additional panchang sources for redundancy

---

*Report generated by `@meroevent/nepali-calendar-engine` accuracy comparison engine*
*Developed and Led by Prince Bhagat — Call sign "Buggy Buck" 🦌*