#!/usr/bin/env node
/*
 * check_coverage.js — finds lines that never executed across N randomized
 * playthroughs, and (with pattern=) reports exact hit-counts for any lines
 * matching a regex, for querying specific branches directly.
 *
 * This generalizes the class of bug we kept catching by hand this session
 * (Scout Company never getting a ranged option, Cadre never touching a
 * weapon, codex entries that could never unlock for two of three origins) —
 * instead of noticing a gap by reading prose closely, run this and see
 * exactly which lines/branches never fired across a large random sample.
 *
 * A zero-hit line is not automatically a bug — some are intentionally rare
 * (a specific race+class combo), some are structural (*label headers,
 * *comment lines), and some require a specific prior choice chain that a
 * larger `num=` would eventually reach. Use this to find candidates to look
 * at, not as an automatic pass/fail.
 *
 * Usage:
 *   node tools/check_coverage.js [num=1000] [seed=1] [scene=<name>] [min=1]
 *   node tools/check_coverage.js [num=1000] [seed=1] pattern=<regex>
 *
 *   num     - number of randomized playthroughs to simulate (default 1000)
 *   seed    - starting RNG seed (default 1)
 *   scene   - only report gaps for this scene file (default: all scenes)
 *   min     - hide scenes with fewer than this many total lines executed at
 *             all, to skip scenes randomtest never really entered (default 1)
 *   pattern - instead of a gap report, print the hit count of every line
 *             matching this regex (case-insensitive) across all scenes —
 *             e.g. pattern=visited_bivouac to see hub-activity pick rates,
 *             or pattern=codex_\\w+ true to see which codex unlocks fire.
 */

const { spawn } = require('child_process');
const path = require('path');
const readline = require('readline');

function parseArgs(argv) {
  const args = { num: 1000, seed: 1, scene: null, min: 1, pattern: null };
  for (const raw of argv) {
    const eq = raw.indexOf('=');
    if (eq === -1) continue;
    const key = raw.slice(0, eq);
    const value = raw.slice(eq + 1);
    args[key] = value;
  }
  args.num = Number(args.num);
  args.seed = Number(args.seed);
  args.min = Number(args.min);
  return args;
}

const args = parseArgs(process.argv.slice(2));
const projectRoot = path.resolve(__dirname, '..');

// randomtest's showCoverage output: "<sceneName> <count>: <lineText>"
// Blank source lines are printed with no count at all (rollbackLineCoverage
// skips them), so require a count to be present.
const COVERAGE_LINE = /^(\S+) (\d+): (.*)$/;

// Structural lines that are "never hit" by design and shouldn't clutter a
// gap report — the line itself doesn't execute so much as get parsed past.
const STRUCTURAL = /^\s*(\*comment\b|\*label\b)/;

const scenes = new Map(); // sceneName -> [{count, text}]
const patternHits = []; // {scene, count, text} for pattern= mode

function record(scene, count, text) {
  if (!scenes.has(scene)) scenes.set(scene, []);
  scenes.get(scene).push({ count, text });
  if (args.pattern) {
    const re = new RegExp(args.pattern, 'i');
    if (re.test(text)) patternHits.push({ scene, count, text });
  }
}

function printGapReport() {
  console.log(`\nCoverage gap report (${args.num} playthroughs, seed ${args.seed})\n`);
  let anyGaps = false;
  for (const [scene, lines] of scenes.entries()) {
    if (args.scene && scene !== args.scene) continue;
    const executed = lines.filter((l) => l.count > 0).length;
    if (executed < args.min) continue;
    const gaps = lines.filter((l) => l.count === 0 && l.text.trim() && !STRUCTURAL.test(l.text));
    console.log(`${scene}: ${executed}/${lines.length} lines executed at least once, ${gaps.length} unreached`);
    if (gaps.length) {
      anyGaps = true;
      for (const g of gaps) {
        console.log(`  never hit: ${g.text.trim().slice(0, 140)}`);
      }
    }
  }
  if (!anyGaps) {
    console.log('\nNo unreached lines found (excluding *label/*comment) — try a higher num= if this seems surprising.');
  }
}

function printPatternReport() {
  console.log(`\nHit counts for lines matching /${args.pattern}/i (${args.num} playthroughs, seed ${args.seed})\n`);
  if (!patternHits.length) {
    console.log('No lines matched that pattern in any scene file.');
    return;
  }
  patternHits.sort((a, b) => b.count - a.count);
  for (const h of patternHits) {
    console.log(`${String(h.count).padStart(6)}x  ${h.scene}: ${h.text.trim().slice(0, 140)}`);
  }
}

console.log(`Running ${args.num} playthroughs (seed ${args.seed}) through randomtest.js with coverage tracking...`);

const child = spawn(
  process.execPath,
  ['randomtest.js', `num=${args.num}`, `seed=${args.seed}`, 'showText=false', 'showChoices=false', 'showCoverage=true'],
  { cwd: projectRoot }
);

let sawPass = false;
let sawFail = false;

const rl = readline.createInterface({ input: child.stdout });
rl.on('line', (line) => {
  const match = COVERAGE_LINE.exec(line);
  if (match) {
    record(match[1], Number(match[2]), match[3]);
    return;
  }
  if (line.includes('RANDOMTEST FAILED')) sawFail = true;
  if (line.includes('RANDOMTEST PASSED')) sawPass = true;
});

child.stderr.on('data', (chunk) => process.stderr.write(chunk));

child.on('error', (err) => {
  console.error('Failed to launch randomtest.js:', err.message);
  process.exit(1);
});

child.on('close', () => {
  if (sawFail || !sawPass) {
    console.error('\nrandomtest.js did not report PASSED — fix the underlying failure before trusting a coverage report.');
    process.exit(1);
  }
  if (args.pattern) {
    printPatternReport();
  } else {
    printGapReport();
  }
});
