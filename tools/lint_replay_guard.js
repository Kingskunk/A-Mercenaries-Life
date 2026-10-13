#!/usr/bin/env node
/*
 * lint_replay_guard.js - flags a mutation that a page refresh would repeat.
 *
 * A refresh (or a Stats/dossier round trip) replays the current page with no new player action, so every
 * command on it runs again. quest/GAMEPLAY_MECHANICS_RULES.md "Refresh/Replay Safety" is the rule: a bare
 * increment or decrement, or a currency change, must sit inside a guard the replay cannot pass twice. A plain
 * assignment of a constant (`*set janna_bond 10`) is idempotent and is not flagged.
 *
 * What it flags (static, per file):
 *   1. `*set x + N`, `*set x - N`, `*set x * N`, `*set x %+ N`, and the long form `*set x (x + N)`
 *   2. `*gosub_scene economy currency_add` (and any other call listed in MUTATORS below)
 *   ...unless one of these is true:
 *   - an enclosing `*if` / `*elseif` condition mentions `locked` or `page_id` (the page-lock pattern)
 *   - an enclosing `*if` is a one-time test `not(flag)` and its body sets that flag true
 *   - the variable is a `*temp` of the same file (a temp is rebuilt on every replay)
 *   - the variable is given a fresh value earlier under the same `*label` (an accumulator that restarts)
 *   - a `*comment` block directly above the line, above an enclosing `*if`, or above the `*label` it sits under, says `replay-ok` (say why)
 *
 * It cannot see whether a page can really pause between the mutation and the next page, so it over-reports
 * a little rather than miss one. Report-only: always exits 0, like lint_all.js.
 *
 * Usage: node tools/lint_replay_guard.js [path]      (default web/mygame/scenes)
 *        add --summary for per-file counts only
 */

const fs = require('fs');
const path = require('path');
const { collectSceneFiles } = require('./lib/collect_scene_files');

// calls that change persistent state and have no replay guard of their own
const MUTATORS = [
  { start: '*gosub_scene economy currency_add', what: 'currency_add' },
  { start: '*gosub currency_add', what: 'currency_add' },
];

const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const summaryOnly = process.argv.includes('--summary');
const target = path.resolve(args[0] || path.join(__dirname, '..', 'web', 'mygame', 'scenes'));

function indentOf(line) {
  return line.length - line.trimStart().length;
}

const OPS = '+-*/%';

// Returns the name of the variable a `*set` changes relative to its old value, or null.
function relativeSet(t) {
  const parts = t.split(/\s+/);
  if (parts[0] !== '*set' || parts.length < 3) return null;
  const name = parts[1];
  const rest = t.slice(t.indexOf(name) + name.length).trim();
  if (OPS.indexOf(rest.charAt(0)) !== -1 && rest.length > 1 && !/^-\d/.test(rest)) return name; // *set x + 1
  if (rest.charAt(0) === '(' && rest.slice(1).trim().startsWith(name)) {
    const after = rest.slice(1).trim().slice(name.length).trim();
    if (OPS.indexOf(after.charAt(0)) !== -1) return name; // *set x (x + 1)
  }
  return null;
}

function scanFile(file) {
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  const temps = new Set();
  lines.forEach((l) => {
    const m = /^\s*\*temp\s+(\w+)/.exec(l);
    if (m) temps.add(m[1]);
  });
  const findings = [];
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const t = raw.trim();
    if (!t.startsWith('*')) continue;
    let what = null;
    const varName = relativeSet(t);
    if (varName) {
      what = varName + ' (relative set)';
    } else {
      for (const mu of MUTATORS) if (t.startsWith(mu.start)) { what = mu.what; break; }
    }
    if (!what) continue;
    if (varName && temps.has(varName)) continue;
    if (replayOk(lines, i)) continue;
    if (varName && resetEarlier(lines, i, varName)) continue;
    if (isGuarded(lines, i)) continue;
    findings.push({ line: i + 1, what, text: t });
  }
  return findings;
}

// A comment block directly above the line, or above any enclosing line, that says replay-ok.
function replayOk(lines, idx) {
  let level = indentOf(lines[idx]);
  let j = idx;
  for (;;) {
    let k = j - 1;
    while (k >= 0 && lines[k].trim().startsWith('*comment')) {
      if (lines[k].indexOf('replay-ok') !== -1) return true;
      k--;
    }
    if (level === 0) return labelOk(lines, idx);
    // climb to the enclosing line
    j = idx;
    let found = -1;
    for (let m = j - 1; m >= 0; m--) {
      if (lines[m].trim() === '') continue;
      if (indentOf(lines[m]) < level) { found = m; break; }
    }
    if (found < 0) return false;
    idx = found;
    level = indentOf(lines[found]);
    j = found;
  }
}

// A replay-ok comment block above the nearest *label above the line covers everything under that label.
function labelOk(lines, idx) {
  for (let k = idx; k >= 0; k--) {
    if (!lines[k].trim().startsWith('*label ')) continue;
    for (let m = k - 1; m >= 0 && lines[m].trim().startsWith('*comment'); m--) {
      if (lines[m].indexOf('replay-ok') !== -1) return true;
    }
    return false;
  }
  return false;
}

// An accumulator: the same label assigns the variable a fresh value first, so a replay rebuilds it from that.
function resetEarlier(lines, idx, name) {
  const head = '*set ' + name + ' ';
  for (let k = idx - 1; k >= 0; k--) {
    const t = lines[k].trim();
    if (t.startsWith('*label ')) return false;
    if (t.startsWith(head)) {
      if (relativeSet(t)) continue;
      return true;
    }
  }
  return false;
}

// Walk up through shallower-indented lines; any enclosing *if/*elseif/*else that is a guard clears the line.
function isGuarded(lines, idx) {
  let level = indentOf(lines[idx]);
  for (let j = idx - 1; j >= 0 && level > 0; j--) {
    const l = lines[j];
    if (l.trim() === '') continue;
    const ind = indentOf(l);
    if (ind >= level) continue;
    level = ind;
    let t = l.trim();
    if (t.startsWith('*else') && !t.startsWith('*elseif')) {
      // the *else of a guarded *if is guarded: find the *if it belongs to, at the same indent
      for (let k = j - 1; k >= 0; k--) {
        if (lines[k].trim() === '') continue;
        const kInd = indentOf(lines[k]);
        if (kInd > ind) continue;
        if (kInd < ind) break;
        const kt = lines[k].trim();
        if (kt.startsWith('*elseif') || kt.startsWith('*if')) {
          t = kt;
          if (kt.startsWith('*if')) break;
        } else break;
      }
    }
    if (t.startsWith('*if') || t.startsWith('*elseif')) {
      if (t.indexOf('locked') !== -1 || t.indexOf('page_id') !== -1) return true;
      if (conditionFlipped(lines, j, t)) return true;
    }
  }
  return false;
}

// A one-time transition: the condition tests a variable that the block itself then assigns a fresh value
// (`*if (stage = "active")` ... `*set stage "done"`, or `*if (not(paid))` ... `*set paid true`), so a replay
// that starts from the finished state does not enter the block again.
function conditionFlipped(lines, j, cond) {
  const ind = indentOf(lines[j]);
  const names = new Set();
  (cond.match(/[A-Za-z_][A-Za-z0-9_]*/g) || []).forEach((n) => names.add(n));
  for (let k = j + 1; k < lines.length; k++) {
    if (lines[k].trim() === '') continue;
    if (indentOf(lines[k]) <= ind) break;
    const t = lines[k].trim();
    if (!t.startsWith('*set ')) continue;
    const name = t.split(' ')[1];
    if (names.has(name) && !relativeSet(t)) return true;
  }
  return false;
}

const files = collectSceneFiles(target).sort();
let total = 0;
const perFile = [];
for (const f of files) {
  const found = scanFile(f);
  if (!found.length) continue;
  total += found.length;
  const rel = path.relative(process.cwd(), f);
  perFile.push([rel, found.length]);
  if (!summaryOnly) {
    console.log(rel);
    found.forEach((x) => console.log(`  ${x.line}: [${x.what}] ${x.text}`));
  }
}
if (summaryOnly) perFile.sort((a, b) => b[1] - a[1]).forEach(([r, n]) => console.log(String(n).padStart(5), r));
console.log(`\nlint_replay_guard: ${total} unguarded mutation(s) in ${perFile.length} of ${files.length} file(s)`);
