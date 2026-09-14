#!/usr/bin/env node
/*
 * lint_weapon_assumption.js — flags bladed-weapon phrases ("pommel", "hilt",
 * "scabbard", "bare steel", "iron grip", "half-drawn", "clutching your
 * weapon") appearing in prose with no enclosing *if that actually gates on
 * a weapon, violating Section 22 ("Weapon-Class-Agnostic Prose"). These
 * phrases are physically meaningless for a longbow, quarterstaff, crossbow,
 * or arcane focus, so unguarded prose using them is wrong for a real chunk
 * of the player base.
 *
 * For every match, this walks the file backward from the match line,
 * tracking indentation the same way lint_choices.js walks block boundaries,
 * to find every enclosing `*if`/`*elseif`/`*else` in scope (stopping at a
 * `*label` or column 0, since control flow doesn't carry across those).
 * Two outcomes:
 *   VIOLATION - no ancestor condition mentions `weapon` or `weapon_type` at
 *               all. Unambiguous: this phrase is reachable by a character
 *               holding any weapon in the game.
 *   REVIEW    - some ancestor condition does test `weapon`/`weapon_type`,
 *               but this tool can't confirm it's actually scoped to bladed
 *               weapons specifically (that requires knowing which of this
 *               game's weapon names/types are bladed, which isn't something
 *               worth hardcoding here) — worth a quick look, not a
 *               confident verdict either way. Section 22's own example is
 *               exactly this trap: `*if (character_class = "fighter")`
 *               alone doesn't prove a bladed weapon, since a Fighter can
 *               still be holding a spear or bow.
 *
 * This deliberately only proves the *absence* of any weapon-related gate
 * (a strong signal) rather than trying to prove the *presence* of a
 * correctly-scoped one (a much harder, lower-confidence claim) — same
 * "don't give a confident wrong answer" philosophy as lint_choices.js.
 *
 * Usage:
 *   node tools/lint_weapon_assumption.js [path]
 *
 *   path - optional single file or directory to lint (default:
 *          web/mygame/scenes/)
 *
 * Report-only: always exits 0.
 */

const fs = require('fs');
const path = require('path');

const target = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.resolve(__dirname, '..', 'web', 'mygame', 'scenes');

function collectScenes(target) {
  const stat = fs.statSync(target);
  if (stat.isFile()) return [target];
  return fs
    .readdirSync(target)
    .filter((f) => f.endsWith('.txt'))
    .map((f) => path.join(target, f));
}

function indentOf(line) {
  const match = /^(\s*)/.exec(line);
  return match[1].length;
}

function isBlank(line) {
  return line.trim() === '';
}

const PHRASES = [
  { rule: 'pommel', re: /\bpommel\b/i },
  { rule: 'hilt', re: /\bhilt\b/i },
  { rule: 'scabbard', re: /\bscabbard\b/i },
  { rule: 'bare-steel', re: /\bbare\s+steel\b/i },
  { rule: 'iron-grip', re: /\biron\s+grip\b/i },
  { rule: 'half-drawn', re: /\bhalf-drawn\b/i },
  { rule: 'clutching-your-weapon', re: /\bclutching\s+your\s+weapon\b/i },
];

const WEAPON_GATE = /\bweapon(?:_type)?\b/;

// Walk backward from `matchLineIdx`, tracking the shallowest indent seen so
// far, collecting every *if/*elseif/*else whose indent is strictly less
// than the current threshold (i.e. actually encloses the match). Stops at
// a *label or column 0.
function findEnclosingConditions(lines, matchLineIdx) {
  const conditions = [];
  let threshold = indentOf(lines[matchLineIdx]);
  for (let i = matchLineIdx - 1; i >= 0; i--) {
    const line = lines[i];
    if (isBlank(line)) continue;
    if (/^\s*\*label\b/.test(line)) break;
    const ind = indentOf(line);
    if (ind >= threshold) continue;
    if (/^\s*\*(?:if|elseif|else)\b/.test(line)) {
      conditions.push(line.trim());
      threshold = ind;
      if (threshold === 0) break;
    } else {
      threshold = ind;
      if (threshold === 0) break;
    }
  }
  return conditions;
}

function lintFile(file) {
  const text = fs.readFileSync(file, 'utf8');
  const lines = text.split(/\r?\n/);
  const violations = [];
  const reviews = [];

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    if (isBlank(raw)) continue;
    const trimmed = raw.trim();
    if (/^\*/.test(trimmed)) continue; // command line, not prose

    for (const { rule, re } of PHRASES) {
      const match = re.exec(trimmed);
      if (!match) continue;

      const conditions = findEnclosingConditions(lines, i);
      const gated = conditions.some((c) => WEAPON_GATE.test(c));
      const entry = { file, line: i + 1, rule, snippet: match[0], context: trimmed.slice(0, 90) };

      if (gated) {
        reviews.push(entry);
      } else {
        violations.push(entry);
      }
    }
  }

  return { violations, reviews };
}

const files = collectScenes(target);
let allViolations = [];
let allReviews = [];

for (const file of files) {
  const { violations, reviews } = lintFile(file);
  allViolations = allViolations.concat(violations);
  allReviews = allReviews.concat(reviews);
}

console.log(`Scanned ${files.length} file(s).\n`);

if (allViolations.length === 0) {
  console.log('No unguarded weapon-assumption phrases found.');
} else {
  console.log(`${allViolations.length} VIOLATION(s) — no enclosing weapon/weapon_type gate at all:\n`);
  for (const f of allViolations) {
    console.log(`  ${path.relative(process.cwd(), f.file)}:${f.line} [${f.rule}] "${f.snippet}" — ${f.context}`);
  }
}

if (allReviews.length > 0) {
  console.log(`\n${allReviews.length} REVIEW(s) — gated on something weapon-related, but this tool can't confirm it's scoped to bladed weapons specifically:`);
  for (const f of allReviews) {
    console.log(`  ${path.relative(process.cwd(), f.file)}:${f.line} [${f.rule}] "${f.snippet}" — ${f.context}`);
  }
}

process.exit(0);
