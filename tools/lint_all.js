#!/usr/bin/env node
/*
 * lint_all.js - runs every per-file linter on one scene file (or a folder) and prints the
 * results one after another. This is the single list a "Lint File" button should call, so that
 * adding a linter means adding one line here instead of editing an editor extension.
 *
 * Only linters that take a path argument and finish quickly belong here. Whole-game tools
 * (lint_thin_places, sim_weather, the check_* tools, quicktest, randomtest) are run separately;
 * see the tasks in .vscode/tasks.json.
 *
 * Usage:
 *   node tools/lint_all.js [path] [skip=name,name] [only=name,name]
 *
 *   path - a scene file or folder (default: web/mygame/scenes/)
 *   skip - comma-separated linter names to leave out, for example skip=lint_vocab_overuse
 *   only - run just these linters
 *
 * Report-only: always exits 0.
 */

const path = require('path');
const fs = require('fs');
const cp = require('child_process');

// One entry per linter. Order is the order the results are printed in.
const LINTERS = [
  'lint_choices',
  'lint_blank_landing',
  'lint_prose_tics',
  'lint_anachronisms',
  'lint_weapon_assumption',
  'lint_mechanics_leak',
  'lint_thin_prose',
  'lint_vocab_overuse',
  'lint_dash_frequency',
  'lint_weather_names',
  'lint_slow_healing',
];

let target = null;
let skip = [];
let only = null;
process.argv.slice(2).forEach((a) => {
  const m = /^(\w+)=(.*)$/.exec(a);
  if (m) {
    if (m[1] === 'skip') skip = m[2].split(',').filter(Boolean);
    if (m[1] === 'only') only = m[2].split(',').filter(Boolean);
  } else if (!target) {
    target = path.resolve(a);
  }
});
if (!target) target = path.resolve(__dirname, '..', 'web', 'mygame', 'scenes');

console.log(`Linting ${path.relative(process.cwd(), target) || target}\n`);
for (const name of LINTERS) {
  if (skip.includes(name) || (only && !only.includes(name))) continue;
  const script = path.join(__dirname, name + '.js');
  console.log(`--- ${name} ---`);
  if (!fs.existsSync(script)) {
    console.log('(not found, skipped)\n');
    continue;
  }
  const r = cp.spawnSync(process.execPath, [script, target], { encoding: 'utf8', maxBuffer: 1 << 26, cwd: path.resolve(__dirname, '..') });
  process.stdout.write(r.stdout || '');
  if (r.stderr) process.stdout.write('Error:\n' + r.stderr);
  console.log('');
}
console.log('Lint finished.');
process.exit(0);
