#!/usr/bin/env node
/*
 * lint_prose_tics.js — greps prose for the specific filler phrases Section 8
 * ("Avoid AI Prose Tics") already calls out by name, so they surface on a
 * tool run instead of only being caught by a close manual read.
 *
 * Each rule below is a literal pattern lifted straight from Section 8's own
 * wording, scoped as tightly as the guideline itself scopes it:
 *   - earned-silence: "says nothing" / "without a word" as a description of
 *     a character's (non-)response.
 *   - negative-framing: "doesn't/didn't <verb>" describing what a person
 *     chose not to do, or the "Not X. Just Y." fragment pattern.
 *   - one-word-reply: a dialogue line that is *only* "Yeah."/"Right."/
 *     "Good." (or a close variant) with nothing else in the quote.
 *   - borrowed-comparison: "the way he/she/they always ___s" or "the kind
 *     of quiet that ___".
 *   - filler-processing: "files it away" / "let that settle" as a stand-in
 *     for showing what a character actually does with information.
 *
 * This is a grep, not a comprehension check — it cannot tell a genuinely
 * bad instance of "doesn't ask why" from a rare, deliberate one, and
 * "doesn't"/"didn't" alone are common, often perfectly fine words (describing
 * weather, terrain, or a fact, not a character's choice — or already
 * compliant with the rule, "You didn't plead. You grabbed the axe instead"
 * frames the affirmative action right after the negation). On this codebase
 * it ran ~53 hits, nearly all fine on inspection, against 0 for every other
 * rule combined — noisy enough that it's off by default; opt in with
 * `includeNegativeFraming=true` if you specifically want to skim it.
 *
 * Usage:
 *   node tools/lint_prose_tics.js [path] [includeNegativeFraming=false]
 *
 *   path                  - optional single file or directory to lint
 *                           (default: web/mygame/scenes/)
 *   includeNegativeFraming - include the high-noise "doesn't/didn't <verb>"
 *                           scan (default false)
 *
 * Report-only: always exits 0.
 */

const fs = require('fs');
const path = require('path');

let target = path.resolve(__dirname, '..', 'web', 'mygame', 'scenes');
let includeNegativeFraming = false;
for (const arg of process.argv.slice(2)) {
  const m = /^includeNegativeFraming=(true|false)$/.exec(arg);
  if (m) {
    includeNegativeFraming = m[1] === 'true';
  } else {
    target = path.resolve(arg);
  }
}

function collectScenes(target) {
  const stat = fs.statSync(target);
  if (stat.isFile()) return [target];
  return fs
    .readdirSync(target)
    .filter((f) => f.endsWith('.txt'))
    .map((f) => path.join(target, f));
}

function isBlank(line) {
  return line.trim() === '';
}

const RULES = [
  { rule: 'earned-silence', re: /\b(?:says?|answer(?:s|ed)?|replied?)\s+nothing\b|\bwithout\s+a\s+word\b/i },
  { rule: 'not-x-just-y-fragment', re: /\bNot\s+\w[\w '-]*\.\s+Just\s+\w/i },
  { rule: 'one-word-reply', re: /^["“](?:Yeah|Yea|Right|Good|Fine|Sure|Okay|OK)\.?["”]$/i },
  { rule: 'borrowed-comparison', re: /\bthe\s+way\s+(?:he|she|they)\s+always\b|\bthe\s+kind\s+of\s+quiet\s+that\b/i },
  { rule: 'filler-processing', re: /\bfiles?\s+it\s+away\b|\blet\s+that\s+settle\b/i },
];

const NEGATIVE_FRAMING = { rule: 'negative-framing', re: /\b(?:doesn't|does not|didn't|did not)\s+\w+/i };

function lintFile(file) {
  const text = fs.readFileSync(file, 'utf8');
  const lines = text.split(/\r?\n/);
  const findings = [];

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    if (isBlank(raw)) continue;
    const trimmed = raw.trim();
    if (/^\*/.test(trimmed)) continue; // command line, not prose

    for (const { rule, re } of RULES) {
      const match = re.exec(trimmed);
      if (match) {
        findings.push({ file, line: i + 1, rule, snippet: match[0], context: trimmed.slice(0, 90) });
      }
    }

    if (includeNegativeFraming) {
      const match = NEGATIVE_FRAMING.re.exec(trimmed);
      if (match) {
        findings.push({ file, line: i + 1, rule: NEGATIVE_FRAMING.rule, snippet: match[0], context: trimmed.slice(0, 90) });
      }
    }
  }

  return findings;
}

const files = collectScenes(target);
let allFindings = [];
for (const file of files) {
  allFindings = allFindings.concat(lintFile(file));
}

const core = allFindings.filter((f) => f.rule !== 'negative-framing');
const negFraming = allFindings.filter((f) => f.rule === 'negative-framing');

console.log(`Scanned ${files.length} file(s).\n`);

if (core.length === 0) {
  console.log('No core prose-tic matches found.');
} else {
  console.log(`${core.length} prose-tic match(es):\n`);
  for (const f of core) {
    console.log(`  ${path.relative(process.cwd(), f.file)}:${f.line} [${f.rule}] "${f.snippet}" — ${f.context}`);
  }
}

if (includeNegativeFraming && negFraming.length > 0) {
  console.log(`\n${negFraming.length} negative-framing match(es) ("doesn't/didn't <verb>" — noisiest rule, many are fine; skim for the ones describing a character's deliberate choice not to act):`);
  for (const f of negFraming) {
    console.log(`  ${path.relative(process.cwd(), f.file)}:${f.line} "${f.snippet}" — ${f.context}`);
  }
}

process.exit(0);
