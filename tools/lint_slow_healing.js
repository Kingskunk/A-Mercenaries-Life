#!/usr/bin/env node
/*
 * lint_slow_healing.js - guards the Port Valen healing rule in quest/QUEST_DESIGN_RULES.md
 * section 12: in Port Valen a wound persists, sleep does not restore health, and food gives
 * temporary HP only. Fast healing comes only from magic, potions and healers. The prologue
 * chapters (before Port Valen) may still heal instantly, so this only checks files whose
 * name starts with "port_valen"; any other file is reported as skipped.
 *
 * Rules, all advisory:
 *   hp-set-to-max        *set hp_current hp_max (or an expression built on hp_max): a full heal
 *   hp-set-absolute      *set hp_current <number>: an absolute value replaces real health
 *   heal-without-cap     *set hp_current + ... with no hp_max cap on the next few lines
 *   prose-full-restore   prose claiming the body is fully restored or wounds healed overnight,
 *                        which contradicts slow healing (a night only clears exhaustion and
 *                        mends a point or two)
 *
 * Usage:
 *   node tools/lint_slow_healing.js [path] [all=true]
 *
 *   path - optional single file or directory to lint (default: web/mygame/scenes/)
 *   all=true - check every file, not just the Port Valen ones
 *
 * Report-only: always exits 0.
 */

const fs = require('fs');
const path = require('path');

let target = null;
let all = false;
process.argv.slice(2).forEach((a) => {
  if (a === 'all=true') all = true;
  else if (!/=/.test(a) && !target) target = path.resolve(a);
});
if (!target) target = path.resolve(__dirname, '..', 'web', 'mygame', 'scenes');

function collectScenes(t) {
  const stat = fs.statSync(t);
  if (stat.isFile()) return [t];
  return fs.readdirSync(t).filter((f) => f.endsWith('.txt')).map((f) => path.join(t, f));
}

const FULL_RESTORE = /\b(?:fully (?:restored|healed|recovered)|wounds? (?:have |has )?(?:healed|mended|closed|knit)|as good as new|feels? whole again|body (?:is|feels) (?:fully )?(?:restored|healed))\b/i;
const BOLD_BANNER_SPAN = /\[b\][\s\S]*?\[\/b\]/gi;
const BRACKET_SPAN = /\[[^\[\]]*\]/g;

function lintFile(file) {
  const findings = [];
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (trimmed === '' || /^\*comment\b/.test(trimmed)) continue;

    if (/^\*set\s+hp_current\b/.test(trimmed)) {
      const rest = trimmed.replace(/^\*set\s+hp_current\s*/, '');
      if (/^\(?\s*hp_max\b/.test(rest) && !/^\(?\s*hp_max\s*-/.test(rest)) {
        findings.push({ file, line: i + 1, rule: 'hp-set-to-max', context: trimmed });
      } else if (/^\d+\s*$/.test(rest) && rest.trim() !== '0') {
        findings.push({ file, line: i + 1, rule: 'hp-set-absolute', context: trimmed });
      } else if (/^\+/.test(rest)) {
        const next = lines.slice(i + 1, i + 5).join('\n');
        if (!/hp_current\s*>\s*hp_max|hp_current\s*<\s*hp_max/.test(next)) {
          findings.push({ file, line: i + 1, rule: 'heal-without-cap', context: trimmed });
        }
      }
      continue;
    }

    if (/^\*/.test(trimmed)) continue;
    const prose = trimmed.replace(BOLD_BANNER_SPAN, ' ').replace(BRACKET_SPAN, ' ');
    const m = FULL_RESTORE.exec(prose);
    if (m) findings.push({ file, line: i + 1, rule: 'prose-full-restore', context: `"${m[0]}" in: ${trimmed.slice(0, 90)}` });
  }
  return findings;
}

const files = collectScenes(target);
const inScope = files.filter((f) => all || /^port_valen/.test(path.basename(f)));
const skipped = files.filter((f) => !inScope.includes(f));

let found = [];
for (const f of inScope) found = found.concat(lintFile(f));

if (skipped.length && files.length === 1) {
  console.log(`${path.basename(skipped[0])}: not a Port Valen file, skipped (prologue chapters may heal instantly). Use all=true to check it anyway.`);
  process.exit(0);
}
console.log(`Scanned ${inScope.length} Port Valen file(s)${skipped.length ? `, skipped ${skipped.length} prologue/shared file(s)` : ''}.\n`);
if (!found.length) {
  console.log('No slow-healing issues found.');
} else {
  console.log(`${found.length} slow-healing issue(s):\n`);
  for (const f of found) console.log(`  ${path.relative(process.cwd(), f.file)}:${f.line} [${f.rule}] ${f.context}`);
}
process.exit(0);
