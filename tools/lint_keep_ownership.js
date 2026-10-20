#!/usr/bin/env node
/*
 * lint_keep_ownership.js - finds "keep / keeps / kept / keeping" used to say who owns, runs, staffs or guards something.
 *
 * The user's rule (2026-10-19): "I keep this grove", "Nessa keeps the counter", "keeps the Postings window", "kept the peace" read like a character
 * speaking of themselves in the third person, the same as "this grove belongs to Flùràlainn". State it outright instead: "This is my grove", "works the
 * counter", "sits at the window", "holds the gate". Other uses of keep are fine and are NOT flagged: "keep your voice low", "keep to the edge", "keep going",
 * "keeps the ox from wandering", "keeps the doorway clear", a promise kept. Compounds (innkeeper, toll-keeper, lamp-keeper) are fine.
 *
 * Only prose is checked: command lines (*set, *if, *comment, ...) are skipped, and so are the built startup.txt and anything outside web/mygame/scenes.
 * The verb is matched in lower case only, so an imperative at the start of a sentence ("Keep the peace and your coin on the wood") and a capitalised sign are left alone.
 *
 * Usage: node tools/lint_keep_ownership.js [path]      (a file or a directory; default web/mygame/scenes/)
 * Report-only: always exits 0.
 */
const fs = require('fs');
const path = require('path');

const target = process.argv[2] ? path.resolve(process.argv[2]) : path.resolve(__dirname, '..', 'web', 'mygame', 'scenes');

const OWNED = ['counter', 'shop', 'stall', 'inn', 'tavern', 'house', 'desk', 'window', 'post', 'gate', 'gatehouse', 'grove', 'garden', 'store', 'office', 'lamps', 'peace',
  'watch', 'books', 'accounts', 'ferry', 'bridge', 'tolls', 'boat', 'warehouse', 'yard', 'market', 'smithy', 'dock', 'pier', 'tower', 'camp', 'cottage', 'farm', 'flock', 'herd',
  'crew', 'rest day', 'place'];
const DET = '(?:the|a|an|his|her|their|this|that|my|our|its)';
// up to two words may sit between the determiner and the thing ("keeps the Postings window")
const RE_OBJECT = new RegExp('\\b(?:keep|keeps|kept|keeping)\\s+' + DET + "\\s+(?:[A-Za-z'-]+\\s+){0,2}?(?:" + OWNED.join('|') + ')\\b');
const RE_KEEPER_OF = /\bkeeper of\b/;
const RE_PASSIVE = /\b(?:are|is|was|were)\s+kept\s+for\b/;
const RE_LEAD = /^\s*\*/;   // a command line

function walk(p, out) {
  const st = fs.statSync(p);
  if (st.isDirectory()) fs.readdirSync(p).forEach((f) => walk(path.join(p, f), out));
  else if (p.endsWith('.txt') && path.basename(p) !== 'startup.txt' && !p.includes(path.sep + 'startup_parts' + path.sep)) out.push(p);
  return out;
}

let total = 0;
walk(target, []).forEach((file) => {
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  lines.forEach((line, i) => {
    if (RE_LEAD.test(line)) return;
    const m = RE_OBJECT.exec(line) || RE_KEEPER_OF.exec(line) || RE_PASSIVE.exec(line);
    if (!m) return;
    total++;
    const rel = path.relative(path.resolve(__dirname, '..'), file);
    const at = Math.max(0, m.index - 30);
    console.log(rel + ':' + (i + 1) + '  ...' + line.slice(at, m.index + m[0].length + 40).trim() + '...');
  });
});
console.log('lint_keep_ownership: ' + total + ' line(s) use keep for ownership or duty');
