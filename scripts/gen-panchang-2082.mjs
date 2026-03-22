/**
 * Generates src/data/panchang/2082.json using the mean synodic month model,
 * calibrated to confirmed anchor points from Nepal Rashtriya Panchang / hamropatro.com.
 *
 * Model parameters verified against 7 independent anchor points:
 *   Baishakh  1 → t=16 (Krishna Pratipada) ✓
 *   Baishakh 29 → t=15 (Purnima)           ✓
 *   Jestha   13 → t=30 (Amavasya)          ✓
 *   Jestha   28 → t=15 (Purnima)           ✓
 *   Ashadh   11 → t=30 (Amavasya)          ✓
 *   Ashadh   26 → t=15 (Guru Purnima)      ✓
 *   Shrawan  24 → t=15 (Janai Purnima)     ✓
 *
 * Method:
 *   At Baishakh 1 2082 sunrise, moon-sun angle ≈ 191.78°  (calibrated to April 14 2025 sunrise)
 *   Mean synodic increment = 360 / 29.53059 ≈ 12.19°/day
 *   tithi(n) = floor( angle(n) / 12 ) + 1  where angle is in [0°, 360°)
 *   Tithi 1–15 = Shukla Paksha; 16–30 = Krishna Paksha (30 = Amavasya)
 */

const MONTH_LENGTHS = [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30]
const REF_ANGLE    = 191.78        // moon-sun angle at Baishakh 1, 2082 sunrise
const DAILY_INC    = 360 / 29.53059 // 12.1915...°/day

const entries = []
let dayNum = 0

for (let m = 1; m <= 12; m++) {
  const days = MONTH_LENGTHS[m - 1]
  for (let d = 1; d <= days; d++) {
    const angle  = (REF_ANGLE + dayNum * DAILY_INC) % 360
    const tithi  = Math.floor(angle / 12) + 1
    entries.push({ m, d, t: tithi })
    dayNum++
  }
}

// Validation
const ANCHORS = [
  { m: 1, d:  1, t: 16 }, // Baishakh  1 = Krishna Pratipada
  { m: 1, d: 29, t: 15 }, // Baishakh 29 = Purnima
  { m: 2, d: 13, t: 30 }, // Jestha   13 = Amavasya
  { m: 2, d: 28, t: 15 }, // Jestha   28 = Purnima
  { m: 3, d: 11, t: 30 }, // Ashadh   11 = Amavasya
  { m: 3, d: 26, t: 15 }, // Ashadh   26 = Guru Purnima
  { m: 4, d: 24, t: 15 }, // Shrawan  24 = Janai Purnima
]

let ok = true
for (const a of ANCHORS) {
  const entry = entries.find(e => e.m === a.m && e.d === a.d)
  if (!entry || entry.t !== a.t) {
    console.error(`FAIL: ${a.m}/${a.d} expected t=${a.t}, got t=${entry?.t}`)
    ok = false
  }
}

if (!ok) {
  process.exit(1)
}

console.error(`All ${ANCHORS.length} anchors validated. Total entries: ${entries.length}`)
console.log(JSON.stringify(entries))
