#!/usr/bin/env node
/*
 * lint_weather_names.js - enforces the weather rules in quest/QUEST_DESIGN_RULES.md section 12:
 * scenes read the derived flags (weather_severity, weather_visibility, weather_wet,
 * weather_cold, street_life), and name a weather type only in the one sentence that describes
 * that weather itself (the sky layer). Naming types elsewhere means a new weather type needs
 * an edit in every district.
 *
 * Four rules, all advisory:
 *   storm-blizzard-pair   a condition naming both Storm and Blizzard: use weather_severity >= 3
 *   weather-name-chain    a condition naming three or more weather types: use the flags
 *   weather-mixed         a condition mixing a weather-name test with another variable
 *                         (time_period, day_of_week, ...): gate on the flags instead. A test
 *                         combined only with other weather_* flags is fine, for example
 *                         (weather_visibility = "poor") or (weather = "Snow")
 *   weather-in-prose      ${weather} printed inside a sentence ("With the Storm blowing"): it
 *                         prints the type name capitalised. A stat banner such as
 *                         [b]Weather:[/b] ${weather} is fine.
 *
 * A plain sky chain (*if (weather = "Rain") ... *elseif (weather = "Fog") ...) and pairs like
 * (weather = "Snow") or (weather = "Sleet") are allowed: that is the sky layer.
 *
 * Usage:
 *   node tools/lint_weather_names.js [path]
 *
 *   path - optional single file or directory to lint (default: web/mygame/scenes/)
 *
 * Report-only: always exits 0. calendar.txt is skipped (it is where the weather is defined).
 */

const fs = require('fs');
const path = require('path');

const target = process.argv[2] && !/=/.test(process.argv[2])
  ? path.resolve(process.argv[2])
  : path.resolve(__dirname, '..', 'web', 'mygame', 'scenes');

function collectScenes(t) {
  const stat = fs.statSync(t);
  if (stat.isFile()) return [t];
  return fs.readdirSync(t).filter((f) => f.endsWith('.txt')).map((f) => path.join(t, f));
}

const CONDITION_LINE = /^\*(?:if|elseif|selectable_if|hide_reveal_if|disable_reveal_if)\b/;
const WEATHER_TEST = /\bweather\s*(?:=|!=)\s*"[A-Za-z]+"/g;
const BOLD_BANNER_SPAN = /\[b\][\s\S]*?\[\/b\]/gi;

function lintFile(file) {
  const findings = [];
  if (path.basename(file) === 'calendar.txt') return findings;
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (trimmed === '' || /^\*comment\b/.test(trimmed)) continue;

    if (CONDITION_LINE.test(trimmed)) {
      const tests = trimmed.match(WEATHER_TEST) || [];
      if (!tests.length) continue;
      const names = tests.map((t) => /"([A-Za-z]+)"/.exec(t)[1]);
      let rule = null;
      if (names.includes('Storm') && names.includes('Blizzard')) {
        rule = 'storm-blizzard-pair';
      } else if (names.length >= 3) {
        rule = 'weather-name-chain';
      } else {
        // strip the weather-name tests and any weather_* flag terms, then see whether another
        // variable is still being tested on the same line
        const rest = trimmed
          .replace(CONDITION_LINE, '')
          .replace(WEATHER_TEST, ' ')
          .replace(/\bweather_\w+\s*(?:=|!=|>=|<=|>|<)\s*(?:"[^"]*"|\w+)/g, ' ')
          .replace(/\b(?:not|and|or)\b/g, ' ')
          .replace(/\bweather_\w+/g, ' ');
        if (/\b[a-z_][a-z0-9_]*\b/i.test(rest.replace(/["()\s]/g, ' ').trim())) rule = 'weather-mixed';
      }
      if (rule) findings.push({ file, line: i + 1, rule, context: trimmed.slice(0, 110) });
      continue;
    }

    if (/^\*/.test(trimmed)) continue;
    if (trimmed.includes('${weather}')) {
      const beforeAfter = trimmed.replace(BOLD_BANNER_SPAN, ' ');
      const idx = beforeAfter.indexOf('${weather}');
      const before = beforeAfter.slice(0, idx);
      if (/[A-Za-z]/.test(before)) findings.push({ file, line: i + 1, rule: 'weather-in-prose', context: trimmed.slice(0, 110) });
    }
  }
  return findings;
}

const files = collectScenes(target);
let all = [];
for (const f of files) all = all.concat(lintFile(f));

console.log(`Scanned ${files.length} file(s).\n`);
if (!all.length) {
  console.log('No weather-name issues found.');
} else {
  console.log(`${all.length} weather-name issue(s):\n`);
  const byRule = {};
  for (const f of all) {
    byRule[f.rule] = (byRule[f.rule] || 0) + 1;
    console.log(`  ${path.relative(process.cwd(), f.file)}:${f.line} [${f.rule}] ${f.context}`);
  }
  console.log('\nBy rule: ' + Object.keys(byRule).map((k) => `${k} ${byRule[k]}`).join(', '));
}
process.exit(0);
