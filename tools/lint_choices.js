#!/usr/bin/env node
/*
 * lint_choices.js — flags *choice blocks that can render with 0 or 1 real
 * options, a bug class that's syntactically valid (quicktest/randomtest
 * won't catch it) but breaks the point of offering a choice at all.
 *
 * This exists because of a real bug pattern hit repeatedly while writing
 * dawn_trial.txt's squad-assignment scenes: a *choice with exactly one `#`
 * line under it isn't a choice, it's a speed bump. A subtler variant is a
 * *choice whose only options are mutually-exclusive *if branches on the
 * same variable (e.g. character_class) with no unconditional fallback —
 * whichever single branch is true at runtime is all the player ever sees.
 *
 * Exception: a single option whose text is wrapped in [brackets] (this
 * project's convention for menu/navigation choices — "[Return to Dossier]",
 * "[Close Dossier & Return]", etc.) is not flagged. A one-button "go back"
 * acknowledgment menu is a deliberate, common pattern; only bare narrative
 * options get held to the "must be a real choice" standard.
 *
 * Two checks:
 *   RULE A - the *choice contains 1 or fewer `#` option lines in total,
 *            counted anywhere inside it (any nesting depth). Always a bug.
 *   RULE B - every top-level item in the *choice is a conditional branch
 *            (no bare, unconditional `#`), all those branches test equality
 *            on the *same* variable with distinct literal values (so at
 *            most one can ever be true), and every one of them individually
 *            resolves to exactly one option. Since the variable can only
 *            hold one value, this *choice always renders exactly one
 *            option — same practical bug as Rule A, just spread across
 *            branches instead of written as a single bare line.
 *
 * This is a heuristic over the raw text, not a real ChoiceScript parser —
 * it assumes this project's consistent 2-space-per-level indentation and
 * simple `VAR = "value"` equality guards. Compound conditions (and/or) or
 * inconsistent indentation will fall back to "can't tell", not a false
 * "safe" — see the SKIPPED summary at the end for anything it couldn't
 * classify, and check those by eye.
 *
 * Usage:
 *   node tools/lint_choices.js [path]
 *
 *   path - optional single file or directory to lint (default:
 *          web/mygame/scenes/)
 *
 * Exit code is 1 if any Rule A/B issue was found, 0 otherwise (skips don't
 * affect the exit code — they're a nudge to look closer, not a failure).
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

// Returns the exclusive end index of the block that starts at `start`
// (the line right after the header line) and is indented deeper than
// `headerIndent`. Blank lines don't end a block on their own.
function blockEnd(lines, start, headerIndent) {
  let i = start;
  while (i < lines.length) {
    if (!isBlank(lines[i]) && indentOf(lines[i]) <= headerIndent) break;
    i++;
  }
  return i;
}

function countHashes(lines, start, end) {
  return hashTexts(lines, start, end).length;
}

function hashTexts(lines, start, end) {
  const texts = [];
  for (let i = start; i < end; i++) {
    if (!isBlank(lines[i]) && /^\s*#/.test(lines[i])) texts.push(lines[i].trim());
  }
  return texts;
}

// This project's convention for a menu/navigation option ("[Return to
// Dossier]", "[Close Dossier & Return]") — a deliberate single-button
// acknowledgment menu, not a narrative choice that needs real alternatives.
function isNavOption(hashLine) {
  return /^#\s*\[/.test(hashLine);
}

const EQUALITY = /\*(?:if|elseif)\s*\(\s*([\w.]+)\s*=\s*"([^"]*)"\s*\)\s*$/;

function lintFile(file) {
  const text = fs.readFileSync(file, 'utf8');
  const lines = text.split(/\r?\n/);
  const findings = [];
  const skipped = [];

  for (let i = 0; i < lines.length; i++) {
    if (isBlank(lines[i])) continue;
    if (!/^\s*\*choice\b/.test(lines[i])) continue;

    const choiceIndent = indentOf(lines[i]);
    const choiceLineNum = i + 1;

    // Find the first non-blank line after *choice to establish the child
    // indent level used throughout this block.
    let j = i + 1;
    while (j < lines.length && isBlank(lines[j])) j++;
    if (j >= lines.length || indentOf(lines[j]) <= choiceIndent) {
      findings.push({ file, line: choiceLineNum, rule: 'A', detail: '*choice has no options at all' });
      continue;
    }
    const childIndent = indentOf(lines[j]);
    const blockEndIdx = blockEnd(lines, j, choiceIndent);

    // Walk direct children at exactly childIndent.
    const items = []; // { kind: 'hash' } | { kind: 'if', variable, value, simple, optionCount }
    let k = j;
    while (k < blockEndIdx) {
      if (isBlank(lines[k]) || indentOf(lines[k]) !== childIndent) {
        k++;
        continue;
      }
      const line = lines[k];
      if (/^\s*#/.test(line)) {
        items.push({ kind: 'hash' });
        k++;
        continue;
      }
      if (/^\s*\*(if|elseif|else)\b/.test(line)) {
        const branchEnd = blockEnd(lines, k + 1, childIndent);
        const optionCount = countHashes(lines, k + 1, branchEnd);
        const eqMatch = EQUALITY.exec(line.trim());
        items.push({
          kind: 'branch',
          simple: !!eqMatch,
          variable: eqMatch ? eqMatch[1] : null,
          value: eqMatch ? eqMatch[2] : null,
          optionCount,
          isElse: /^\s*\*else\b/.test(line),
        });
        k = branchEnd;
        continue;
      }
      // *comment, *set, stray text, etc. at child indent: ignore for counting.
      k++;
    }

    const allTexts = hashTexts(lines, j, blockEndIdx);
    const totalHashes = allTexts.length;

    // Rule A: 0 or 1 real options anywhere in the whole block, unless
    // that single option is a bracket-style nav/menu acknowledgment.
    if (totalHashes === 0 || (totalHashes === 1 && !isNavOption(allTexts[0]))) {
      findings.push({
        file,
        line: choiceLineNum,
        rule: 'A',
        detail: `*choice resolves to ${totalHashes} option${totalHashes === 1 ? '' : 's'} — not a real choice`,
      });
      continue; // Rule B is moot if Rule A already fired.
    }
    if (totalHashes <= 1) continue; // single nav option — fine, nothing more to check

    // Rule B: every top-level item is a conditional branch (no bare '#'),
    // all branches are simple equality on the same variable with distinct
    // values, none is *else, and every branch offers exactly 1 option.
    const hasUnconditional = items.some((it) => it.kind === 'hash');
    const branches = items.filter((it) => it.kind === 'branch');
    if (!hasUnconditional && branches.length >= 2) {
      const allSimple = branches.every((b) => b.simple && !b.isElse);
      const sameVar = allSimple && branches.every((b) => b.variable === branches[0].variable);
      const distinctValues = sameVar && new Set(branches.map((b) => b.value)).size === branches.length;
      const allSingleOption = branches.every((b) => b.optionCount === 1);

      if (sameVar && distinctValues && allSingleOption) {
        findings.push({
          file,
          line: choiceLineNum,
          rule: 'B',
          detail: `all branches gate on \`${branches[0].variable}\` (values: ${branches
            .map((b) => JSON.stringify(b.value))
            .join(', ')}) with no unconditional fallback — since ${branches[0].variable} only ever holds one value, this always renders exactly 1 option`,
        });
      } else if (!allSimple) {
        skipped.push({ file, line: choiceLineNum, reason: 'branches use compound/complex conditions, not analyzed' });
      }
    }
  }

  return { findings, skipped };
}

const files = collectScenes(target);
let allFindings = [];
let allSkipped = [];

for (const file of files) {
  const { findings, skipped } = lintFile(file);
  allFindings = allFindings.concat(findings);
  allSkipped = allSkipped.concat(skipped);
}

if (allFindings.length === 0) {
  console.log(`No single-option *choice issues found across ${files.length} file(s).`);
} else {
  console.log(`Found ${allFindings.length} issue(s):\n`);
  for (const f of allFindings) {
    console.log(`${path.relative(process.cwd(), f.file)}:${f.line} [Rule ${f.rule}] ${f.detail}`);
  }
}

if (allSkipped.length > 0) {
  console.log(`\n${allSkipped.length} *choice block(s) skipped (compound conditions — check by eye):`);
  for (const s of allSkipped) {
    console.log(`  ${path.relative(process.cwd(), s.file)}:${s.line} — ${s.reason}`);
  }
}

process.exit(allFindings.length > 0 ? 1 : 0);
