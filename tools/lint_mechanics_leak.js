#!/usr/bin/env node
/*
 * lint_mechanics_leak.js — flags plain narration that states a game
 * mechanic directly ("you took 4 damage", "DC 12", "your armor class"),
 * violating Section 15 ("Mechanics Confined to Brackets, Never in Prose").
 * Numbers/DCs/mechanic names belong in `[bracketed hints]` or banner
 * cards; prose should ground the same result in physical sensation.
 *
 * This is a grep-style scan, not a real parser: it walks every non-command
 * line, strips out `[...]` bracket spans and `${...}` interpolations first
 * (both are legitimate places for this vocabulary to live), then tests
 * what's left against a small set of mechanic-shaped patterns:
 *   - "DC <number>" (a bare difficulty class stated in prose)
 *   - "<number> damage" / "<number> HP" / "<number> hit points"
 *   - "armor class" / "hit points" as a named mechanic (not just physical
 *     armor/wounds described in sensory terms)
 *   - "(STR|DEX|CON|INT|WIS|CHA) (check|save|modifier)" as a named ability
 *     check, spelled out in narration instead of grounded in the action
 *
 * Deliberately narrow: this project's prose is full of legitimate numbers
 * (dates, distances, headcounts — "three hundred years", "four hundred
 * sellswords") that have nothing to do with game mechanics, so the patterns
 * require a mechanic-specific keyword directly adjacent to the number, not
 * just any number in a sentence. Expect some false positives in dialogue
 * where a character is *narratively* discussing danger in general terms
 * ("that's a a killing blow") — read each hit in context, this is a nudge
 * to look, not an automatic verdict.
 *
 * Usage:
 *   node tools/lint_mechanics_leak.js [path]
 *
 *   path - optional single file or directory to lint (default:
 *          web/mygame/scenes/)
 *
 * Report-only: always exits 0.
 */

const fs = require('fs');
const path = require('path');

const target = process.argv[2] && !/=/.test(process.argv[2])
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

function isBlank(line) {
  return line.trim() === '';
}

// [b]...[/b] is this project's whole-banner convention (dossier/stat-card
// lines like "[b]Armor Class (AC):[/b] ${armor_class}", not just the
// "[Hit: 5 damage]"-style hint spans inside it) -- strip the whole span as
// one unit first, or the bare "[b]"/"[/b]" tokens get stripped individually
// and leave the label text in between exposed as if it were bare prose.
const BOLD_BANNER_SPAN = /\[b\][\s\S]*?\[\/b\]/gi;
const BRACKET_SPAN = /\[[^\[\]]*\]/g;
const INTERP_SPAN = /\$\{[^}]*\}/g;

const PATTERNS = [
  { rule: 'DC-in-prose', re: /\bDC\s*\d+\b/i },
  { rule: 'damage-number-in-prose', re: /\b\d+\s+damage\b/i },
  { rule: 'hp-number-in-prose', re: /\b\d+\s*(?:HP|hit points)\b/i },
  { rule: 'armor-class-named', re: /\barmor class\b/i },
  { rule: 'ability-check-named', re: /\b(?:STR|DEX|CON|INT|WIS|CHA)\s+(?:check|save|saving throw|modifier)\b/i },
  { rule: 'dice-notation-in-prose', re: /\b\d+d\d+(?:\s*[+-]\s*\d+)?\b/i },
];

function lintFile(file) {
  const text = fs.readFileSync(file, 'utf8');
  const lines = text.split(/\r?\n/);
  const findings = [];

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    if (isBlank(raw)) continue;
    const trimmed = raw.trim();
    if (/^\*/.test(trimmed)) continue; // command line, not prose

    const stripped = trimmed.replace(BOLD_BANNER_SPAN, ' ').replace(BRACKET_SPAN, ' ').replace(INTERP_SPAN, ' ');

    for (const { rule, re } of PATTERNS) {
      const match = re.exec(stripped);
      if (match) {
        findings.push({ file, line: i + 1, rule, snippet: match[0], context: trimmed.slice(0, 90) });
        break; // one finding per line is enough to flag it for review
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

console.log(`Scanned ${files.length} file(s).\n`);

if (allFindings.length === 0) {
  console.log('No mechanics-in-prose leaks found.');
} else {
  console.log(`${allFindings.length} potential mechanics-in-prose leak(s):\n`);
  for (const f of allFindings) {
    console.log(`  ${path.relative(process.cwd(), f.file)}:${f.line} [${f.rule}] "${f.snippet}" — ${f.context}`);
  }
}

process.exit(0);
