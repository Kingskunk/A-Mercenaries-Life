#!/usr/bin/env node
/*
 * run_all.js — one command instead of the ~10 that a full verification pass
 * currently needs run by hand each session (quicktest, every lint_*.js, the
 * new check_calendar.js, randomtest.js, refresh_fuzz_test.js). Runs each as
 * a real subprocess (spawnSync, stdio inherited) rather than requiring them
 * in-process, since several of these scripts call process.exit()/set
 * process.exitCode as a side effect of loading, which would kill a wrapper
 * that tried to import them directly -- the same reason check_balance.js
 * shells out to randomtest.js instead of embedding it.
 *
 * Output streams live exactly like running each tool by hand (nothing is
 * captured/suppressed), then a one-line-per-tool summary prints at the end
 * so you don't have to scroll back through everything to see what passed.
 * The 5 lint_*.js tools are report-only by design (see narrative_guidelines.
 * md Section 19 -- they always exit 0 and print a candidate list for a human
 * to triage, not a hard pass/fail gate) -- their summary line just confirms
 * they ran; read their actual output above for the real findings.
 *
 * usage: node tools/run_all.js [game=mygame] [randomNum=15] [refreshNum=10]
 *                              [seed=1] [skipSlow=false]
 *
 *   skipSlow=true skips randomtest.js/refresh_fuzz_test.js (the two that
 *   take real wall-clock time) for a fast quicktest+lints-only pass.
 */

const { spawnSync } = require('child_process');
const path = require('path');

let gameName = 'mygame';
let randomNum = 15;
let refreshNum = 10;
let seed = 1;
let skipSlow = false;

process.argv.slice(2).forEach((arg) => {
  const [name, value] = arg.split('=');
  if (name === 'game') gameName = value;
  else if (name === 'randomNum') randomNum = Number(value);
  else if (name === 'refreshNum') refreshNum = Number(value);
  else if (name === 'seed') seed = Number(value);
  else if (name === 'skipSlow') skipSlow = value !== 'false';
});

const root = path.resolve(__dirname, '..');

const steps = [
  { label: 'quicktest.js', cmd: ['quicktest.js', gameName] },
  { label: 'lint_choices.js', cmd: ['tools/lint_choices.js'] },
  { label: 'lint_thin_prose.js', cmd: ['tools/lint_thin_prose.js'] },
  { label: 'lint_mechanics_leak.js', cmd: ['tools/lint_mechanics_leak.js'] },
  { label: 'lint_prose_tics.js', cmd: ['tools/lint_prose_tics.js'] },
  { label: 'lint_weapon_assumption.js', cmd: ['tools/lint_weapon_assumption.js'] },
  { label: 'lint_anachronisms.js', cmd: ['tools/lint_anachronisms.js'] },
  { label: 'lint_blank_landing.js', cmd: ['tools/lint_blank_landing.js'] },
  { label: 'lint_vocab_overuse.js', cmd: ['tools/lint_vocab_overuse.js'] },
  { label: 'check_calendar.js', cmd: ['tools/check_calendar.js', `game=${gameName}`] },
];

if (!skipSlow) {
  steps.push({
    label: 'randomtest.js',
    cmd: ['randomtest.js', `num=${randomNum}`, `seed=${seed}`, 'showCoverage=false', 'showChoices=false'],
  });
  steps.push({
    label: 'refresh_fuzz_test.js',
    cmd: ['refresh_fuzz_test.js', `num=${refreshNum}`, `seed=${seed}`],
  });
}

const results = [];
const start = Date.now();

steps.forEach((step) => {
  console.log('');
  console.log('='.repeat(70));
  console.log('RUNNING: ' + step.label);
  console.log('='.repeat(70));
  const stepStart = Date.now();
  const result = spawnSync(process.execPath, step.cmd, { cwd: root, stdio: 'inherit' });
  const seconds = ((Date.now() - stepStart) / 1000).toFixed(1);
  results.push({ label: step.label, code: result.status, seconds: seconds });
});

console.log('');
console.log('='.repeat(70));
console.log('SUMMARY');
console.log('='.repeat(70));
let anyFailed = false;
results.forEach((r) => {
  const ok = r.code === 0 || r.code === null;
  if (!ok) anyFailed = true;
  const status = ok ? 'OK' : `FAILED (exit ${r.code})`;
  console.log(pad(r.label, 28) + pad(status, 20) + r.seconds + 's');
});
console.log('');
console.log('Total time: ' + ((Date.now() - start) / 1000).toFixed(1) + 's');
if (skipSlow) {
  console.log('(skipSlow=true -- randomtest.js/refresh_fuzz_test.js were not run)');
}
if (anyFailed) {
  console.log('RUN_ALL: one or more tools failed -- see output above.');
  process.exitCode = 1;
} else {
  console.log('RUN_ALL: all tools completed clean.');
}

function pad(v, width) {
  v = '' + v;
  while (v.length < width) v += ' ';
  return v;
}
