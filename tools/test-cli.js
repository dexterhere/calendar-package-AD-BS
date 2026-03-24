#!/usr/bin/env node
/**
 * Nepali Calendar Engine - Interactive CLI Test Script
 * 
 * Run with: node test-cli.js
 */

import { 
  getMonthCalendar, 
  toBS, 
  toAD, 
  today, 
  formatBS,
  getPanchang,
  getEventsForDate,
  isAuspicious,
  ensurePanchangYear,
  getEventsForMonth,
  getAuspiciousDates
} from './dist/index.js';

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

function log(text, color = 'reset') {
  console.log(`${colors[color]}${text}${colors.reset}`);
}

function header(text) {
  log('\n' + '═'.repeat(60), 'cyan');
  log(text, 'cyan');
  log('═'.repeat(60), 'cyan');
}

function subheader(text) {
  log('\n' + '─'.repeat(40), 'gray');
  log(text, 'gray');
  log('─'.repeat(40), 'gray');
}

async function runTests() {
  console.clear();
  
  header('📅 NEPALI CALENDAR ENGINE - TEST SUITE');
  
  // Test 1: Basic Conversion
  subheader('1. Date Conversion Tests');
  
  const todayDual = today();
  log(`Today (BS): ${formatBS(todayDual.bs, 'YYYY-MM-DD')}`, 'green');
  log(`Today (AD): ${todayDual.ad.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, 'green');
  
  // Test conversion
  const testBS = { year: 2082, month: 1, day: 1 };
  const convertedAD = toAD(testBS);
  log(`\nBS ${testBS.year}/${testBS.month}/${testBS.day} → AD ${convertedAD.toLocaleDateString('en-US')}`, 'blue');
  
  // Test 2: Panchang Lookup
  subheader('2. Panchang Data Tests');
  
  await ensurePanchangYear(2082);
  
  const panchangDate = { year: 2082, month: 1, day: 1 };
  const panchang = getPanchang(panchangDate);
  
  if (panchang) {
    log(`Baishakh 1, 2082:`, 'yellow');
    log(`  Tithi: ${panchang.tithi.name} (${panchang.tithi.nameNe})`, 'blue');
    log(`  Paksha: ${panchang.pakshaName.en}`, 'blue');
    if (panchang.nakshatra) {
      log(`  Nakshatra: ${panchang.nakshatra.name} (${panchang.nakshatra.nameNe})`, 'blue');
    }
  } else {
    log('Panchang data not available', 'red');
  }
  
  // Test 3: Calendar Grid Generation
  subheader('3. Calendar Grid Generation');
  
  const calendar = getMonthCalendar(2082, 7, { 
    includeAdjacentDays: true,
    enrichPanchang: true,
    enrichEvents: true
  });
  
  log(`Month: ${calendar.monthName.en} ${calendar.year}`, 'yellow');
  log(`Total days in grid: ${calendar.days.length}`, 'blue');
  log(`Days in month: ${calendar.totalDays}`, 'blue');
  log(`Start weekday: ${calendar.startWeekday} (0=Sun, 6=Sat)`, 'blue');
  
  // Count days with events
  const daysWithEvents = calendar.days.filter(d => d.isCurrentMonth && d.events.length > 0);
  log(`Days with events: ${daysWithEvents.length}`, 'green');
  
  // Test 4: Festival Detection
  subheader('4. Festival Detection (Ashwin 2082 - Dashain Month)');
  
  const dashainDays = calendar.days.filter(d => 
    d.isCurrentMonth && 
    d.events.some(e => e.id.includes('dashain') || e.id.includes('vijaya'))
  );
  
  if (dashainDays.length > 0) {
    log(`Found ${dashainDays.length} days with Dashain events:`, 'green');
    dashainDays.slice(0, 5).forEach(day => {
      const eventNames = day.events
        .filter(e => e.id.includes('dashain') || e.id.includes('vijaya'))
        .map(e => e.name.en)
        .join(', ');
      log(`  Ashwin ${day.bs.day}: ${eventNames}`, 'blue');
    });
  }
  
  // Test 5: Auspicious Classification
  subheader('5. Auspicious Date Classification');
  
  const testDates = [
    { date: { year: 2082, month: 7, day: 14 }, label: 'Vijaya Dashami' },
    { date: { year: 2082, month: 1, day: 15 }, label: 'Purnima' },
    { date: { year: 2082, month: 10, day: 1 }, label: 'Maghe Sankranti' },
    { date: { year: 2082, month: 3, day: 15 }, label: 'Regular Day' }
  ];
  
  testDates.forEach(({ date, label }) => {
    const classification = isAuspicious(date);
    const color = classification === 'auspicious' ? 'green' : 
                  classification === 'inauspicious' ? 'red' : 'yellow';
    log(`${label} (${date.year}/${date.month}/${date.day}): ${classification.toUpperCase()}`, color);
  });
  
  // Test 6: Events for Month
  subheader('6. Monthly Events Summary');
  
  const allEvents = getEventsForMonth(2082, 7);
  const uniqueEvents = [...new Set(allEvents.map(e => e.id))];
  
  log(`Total unique events in Ashwin 2082: ${uniqueEvents.length}`, 'green');
  log('\nMajor events:', 'yellow');
  
  const majorEvents = allEvents.filter(e => e.isPublicHoliday);
  majorEvents.slice(0, 10).forEach(event => {
    log(`  • ${event.name.en} ${event.isPublicHoliday ? '🎉' : ''}`, 'blue');
  });
  
  // Test 7: Auspicious Dates
  subheader('7. Auspicious Dates in Magh 2082');
  
  const auspiciousDays = getAuspiciousDates(2082, 10, 'religious');
  log(`Found ${auspiciousDays.length} religious auspicious days:`, 'green');
  
  auspiciousDays.slice(0, 5).forEach(day => {
    log(`  Magh ${day.bs.day}: ${day.classification} - ${day.events.length} events`, 'blue');
  });
  
  // Test 8: Visual Calendar Display
  subheader('8. Visual Calendar (Ashwin 2082)');
  
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  let calendarDisplay = weekdays.map(d => d.padStart(5)).join(' ');
  log(calendarDisplay, 'gray');
  
  let dayOutput = '';
  calendar.days.forEach((day, index) => {
    if (!day.isCurrentMonth) {
      dayOutput += '    . ';
    } else {
      const hasEvent = day.events.length > 0 ? '📍' : '  ';
      const dayStr = day.bs.day.toString().padStart(2);
      dayOutput += `${dayStr}${hasEvent} `;
    }
    
    if ((index + 1) % 7 === 0 || index === calendar.days.length - 1) {
      log(dayOutput, 'blue');
      dayOutput = '';
    }
  });
  
  // Summary
  header('✅ TEST SUMMARY');
  
  const stats = {
    totalDaysInGrid: calendar.days.length,
    daysWithEvents: daysWithEvents.length,
    totalEvents: allEvents.length,
    auspiciousDays: auspiciousDays.length,
    panchangAvailable: panchang ? 'Yes' : 'No'
  };
  
  Object.entries(stats).forEach(([key, value]) => {
    log(`  ${key.replace(/([A-Z])/g, ' $1').trim()}: ${value}`, 'green');
  });
  
  log('\n✓ All tests completed successfully!\n', 'green');
}

// Run the tests
runTests().catch(error => {
  log(`\n❌ Error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
