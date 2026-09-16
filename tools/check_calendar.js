#!/usr/bin/env node
/*
 * check_calendar.js — directed regression check for calendar.txt's derived
 * calendar/weather math: day_of_week, weather, and month/season/year
 * rollover. Unlike check_stats.js (which samples the *final* value of a
 * numeric stat across many full random playthroughs), this drives
 * check_calendar_month directly, day by day, the same way advance_time's own
 * fallthrough does -- far faster than fishing for calendar edge cases
 * through randomtest, and it can assert exact invariants (an even 7-day
 * cycle, every weather bucket reachable, year only advancing on the Pisces
 * -> Aries wrap) that a distribution-over-playthroughs tool can't cleanly
 * express.
 *
 * This exists because none of the other tools would catch a typo'd
 * threshold in the weather *if chain (a bucket quietly becoming unreachable,
 * or another silently overrepresented), a swapped day-of-week branch (still
 * hits all 7 names, just in the wrong order), or a month/year rollover bug
 * (calendar_year not incrementing on the Pisces -> Aries wrap, or a wrong
 * month_max letting calendar_day drift past its month) -- randomtest/
 * refresh_fuzz_test only ever see whatever a few hundred random seeds
 * happen to roll, and neither one asserts anything about the *shape* of the
 * distribution, just whether a run crashes or diverges on replay.
 *
 * Checks:
 *   1. day_of_week cycles through all 7 names in the fixed order
 *      Ironday..Hallowday with no skip/repeat, for 3 full years of days.
 *   2. weather, rolled 4000 times per season, reaches every named bucket for
 *      that season and lands within a generous tolerance of its intended
 *      weight (see WEATHER_WEIGHTS below, mirrors calendar.txt's thresholds).
 *   3. Month/season/day-suffix table stays internally consistent and
 *      calendar_year increments exactly once per Pisces -> Aries wrap, over
 *      3 simulated years of day-by-day advancement from the real startup
 *      defaults.
 *
 * usage: node tools/check_calendar.js [game=mygame] [weatherSamples=4000]
 *                                     [tolerance=0.5]
 */

const path = require('path');
const fs = require('fs');
const vm = require('vm');

let gameName = 'mygame';
let weatherSamples = 4000;
let tolerance = 0.5; // observed rate must stay within [target*(1-tol), target*(1+tol)]

process.argv.slice(2).forEach((arg) => {
  const [name, value] = arg.split('=');
  if (name === 'game') gameName = value;
  else if (name === 'weatherSamples') weatherSamples = Number(value);
  else if (name === 'tolerance') tolerance = Number(value);
});

const root = path.resolve(__dirname, '..');
function load(file) {
  vm.runInThisContext(fs.readFileSync(path.join(root, file), 'utf8'), file);
}
global.require = require;
load('web/scene.js');
load('web/navigator.js');
load('web/util.js');
load('headless.js');
load('seedrandom.js');
global.safeTimeout = function (fn) { safeCall(null, fn); };
load(`web/${gameName}/mygame.js`);

global.allScenes = {};
fs.readdirSync(path.join(root, 'web', gameName, 'scenes')).forEach((file) => {
  if (!/\.txt$/.test(file)) return;
  const name = file.replace(/\.txt$/, '');
  const text = fs.readFileSync(path.join(root, 'web', gameName, 'scenes', file), 'utf8');
  const tmp = new Scene();
  tmp.loadLines(text);
  global.allScenes[name] = { crc: tmp.crc, lines: tmp.lines, labels: tmp.labels };
});

nav.resetStats(stats);
try { new Scene('startup', stats, nav, false).execute(); } catch (e) { /* pauses at intake, fine */ }

const CALENDAR_LABEL = allScenes['calendar'].labels['check_calendar_month'];
function runCheckCalendarMonth() {
  stats.testEntryPoint = CALENDAR_LABEL;
  const s = new Scene('calendar', stats, nav, false);
  // Jumping straight to a mid-file label (bypassing a real *gosub call
  // stack) means execution eventually falls through to a *return with
  // nothing to return to -- expected here, not a real error; the label's
  // own work (calendar_date/day_of_week/etc, all *set commands) has already
  // run by the time that happens.
  try { s.execute(); } catch (e) { /* expected, see above */ }
}

let failures = 0;
function fail(msg) {
  failures++;
  console.log('  FAIL: ' + msg);
}

// --- Check 1: day_of_week cycles cleanly ------------------------------
(function checkDayOfWeek() {
  console.log('Checking day_of_week cycle (3 years)...');
  const ORDER = ['Ironday', 'Tideday', 'Marketday', 'Hearthday', 'Forgeday', 'Greyday', 'Hallowday'];
  const seen = {};
  let expectedIdx = null;
  for (let day = 1; day <= 365 * 3; day++) {
    stats.campaign_day = day;
    runCheckCalendarMonth();
    const dow = stats.day_of_week;
    seen[dow] = (seen[dow] || 0) + 1;
    if (ORDER.indexOf(dow) === -1) {
      fail(`Day ${day}: unrecognized day_of_week "${dow}"`);
      continue;
    }
    const idx = ORDER.indexOf(dow);
    if (expectedIdx !== null && idx !== expectedIdx) {
      fail(`Day ${day}: expected ${ORDER[expectedIdx]}, got ${dow} -- cycle broken`);
    }
    expectedIdx = (idx + 1) % 7;
  }
  ORDER.forEach((name) => {
    if (!seen[name]) fail(`day_of_week never produced "${name}" across 3 years`);
  });
  if (!failures) console.log('  OK -- all 7 names, clean rotation, 3 full years.');
})();

// --- Check 2: weather distribution per season --------------------------
const WEATHER_WEIGHTS = {
  Winter: { Clear: 30, Overcast: 25, Snow: 20, Sleet: 15, Blizzard: 10 },
  Spring: { Clear: 35, Overcast: 25, Rain: 25, Fog: 10, Storm: 5 },
  Summer: { Clear: 45, Overcast: 20, Rain: 15, Storm: 15, Fog: 5 },
  Autumn: { Clear: 15, Overcast: 30, Rain: 25, Fog: 20, Storm: 10 },
};

(function checkWeather() {
  Object.keys(WEATHER_WEIGHTS).forEach((season) => {
    console.log(`Checking weather distribution for ${season} (${weatherSamples} samples)...`);
    const counts = {};
    for (let i = 0; i < weatherSamples; i++) {
      stats.current_season = season;
      stats.days_to_pass = 1;
      stats.hours_to_pass = 0;
      stats.minutes_to_pass = 0;
      stats.time_advance_locked = false;
      stats.choice_page_id = i;
      stats.time_advance_call_id = 'check_calendar_' + i;
      stats.testEntryPoint = 0; // full advance_time, not just check_calendar_month -- weather rolls inside it
      const s = new Scene('calendar', stats, nav, false);
      try { s.execute(); } catch (e) { /* falls off the end of the file at check_calendar_month's return-less tail, expected */ }
      counts[stats.weather] = (counts[stats.weather] || 0) + 1;
    }
    const weights = WEATHER_WEIGHTS[season];
    Object.keys(weights).forEach((bucket) => {
      const target = weights[bucket] / 100;
      const observed = (counts[bucket] || 0) / weatherSamples;
      if (!counts[bucket]) {
        fail(`${season}: "${bucket}" never rolled in ${weatherSamples} samples (target ${weights[bucket]}%)`);
      } else if (observed < target * (1 - tolerance) || observed > target * (1 + tolerance)) {
        fail(`${season}: "${bucket}" observed ${(observed * 100).toFixed(1)}% vs target ${weights[bucket]}% (outside ±${tolerance * 100}% tolerance)`);
      }
    });
    Object.keys(counts).forEach((bucket) => {
      if (!weights[bucket]) fail(`${season}: unexpected weather value "${bucket}" (not in this season's bucket list)`);
    });
  });
  console.log('  (see failures above, if any)');
})();

// --- Check 3: month/season/year rollover stays consistent --------------
(function checkMonthYearRollover() {
  console.log('Checking month/season/year rollover (3 years, day by day)...');
  const MONTH_MAX = [30, 31, 32, 31, 31, 31, 31, 30, 30, 28, 30, 30];
  const MONTH_NAME = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  const MONTH_SEASON = ['Spring', 'Spring', 'Spring', 'Summer', 'Summer', 'Summer', 'Autumn', 'Autumn', 'Autumn', 'Winter', 'Winter', 'Winter'];

  nav.resetStats(stats);
  try { new Scene('startup', stats, nav, false).execute(); } catch (e) { /* expected */ }
  // calendar.txt sets calendar_month_num/calendar_year/calendar_day via
  // plain literal *set (not *set X +N), which -- per this project's own
  // documented gotcha -- leaves them as strings until real arithmetic
  // touches them. A Node harness comparing them directly (e.g. `1 !== "1"`)
  // gets false positives; coerce with Number() on every read, same as any
  // other harness inspecting `stats` straight off the wire.
  let prevMonthNum = Number(stats.calendar_month_num);
  let prevYear = Number(stats.calendar_year);

  for (let day = 0; day < 365 * 3; day++) {
    stats.calendar_day = Number(stats.calendar_day) + 1;
    runCheckCalendarMonth();

    const monthNum = Number(stats.calendar_month_num);
    const calendarDay = Number(stats.calendar_day);
    const calendarYear = Number(stats.calendar_year);
    const monthIdx = monthNum - 1;
    if (monthIdx < 0 || monthIdx > 11) {
      fail(`Simulated day ${day}: calendar_month_num out of range: ${monthNum}`);
      continue;
    }
    if (calendarDay < 1 || calendarDay > MONTH_MAX[monthIdx]) {
      fail(`Simulated day ${day}: calendar_day ${calendarDay} out of range for month ${monthNum} (max ${MONTH_MAX[monthIdx]})`);
    }
    if (stats.calendar_month !== MONTH_NAME[monthIdx]) {
      fail(`Simulated day ${day}: calendar_month "${stats.calendar_month}" doesn't match expected "${MONTH_NAME[monthIdx]}" for month ${monthNum}`);
    }
    if (stats.current_season !== MONTH_SEASON[monthIdx]) {
      fail(`Simulated day ${day}: current_season "${stats.current_season}" doesn't match expected "${MONTH_SEASON[monthIdx]}" for month ${monthNum}`);
    }
    // Year must advance exactly on the wrap from month 12 (Pisces) back to month 1 (Aries), never otherwise.
    if (monthNum < prevMonthNum) {
      if (monthNum !== 1 || prevMonthNum !== 12) {
        fail(`Simulated day ${day}: month went backward (${prevMonthNum} -> ${monthNum}) outside the expected 12->1 wrap`);
      } else if (calendarYear !== prevYear + 1) {
        fail(`Simulated day ${day}: month wrapped 12->1 but calendar_year didn't advance (${prevYear} -> ${calendarYear})`);
      }
    } else if (calendarYear !== prevYear) {
      fail(`Simulated day ${day}: calendar_year changed (${prevYear} -> ${calendarYear}) without a 12->1 month wrap`);
    }
    prevMonthNum = monthNum;
    prevYear = calendarYear;
  }
  if (!failures) console.log('  OK -- month/season table consistent, year advances only on Pisces -> Aries wrap.');
})();

console.log('');
if (failures) {
  console.log(`CHECK_CALENDAR FAILED: ${failures} issue(s) found.`);
  process.exitCode = 1;
} else {
  console.log('CHECK_CALENDAR PASSED.');
}
