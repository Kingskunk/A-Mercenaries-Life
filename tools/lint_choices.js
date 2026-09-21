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
 * For every *choice, the linter estimates two numbers:
 *   guaranteedMin - the fewest options it can ever render. Unconditional
 *                   `#` lines always count. For a group of branches that
 *                   all test equality on the *same* variable with distinct
 *                   values (e.g. character_class = "fighter" / "barbarian"
 *                   / ...), exactly one is assumed to fire — same
 *                   assumption this linter has always made — so the group
 *                   contributes its smallest branch's option count, not
 *                   the sum. Anything it can't classify (complex/compound
 *                   conditions, or a lone branch sharing no variable with
 *                   a sibling) contributes 0 to the guarantee, since it
 *                   can't be proven always true.
 *   possibleMax     - the most it could ever render: unconditional options,
 *                   plus each mutually-exclusive group's *largest* branch
 *                   (only one of them can fire at once), plus every
 *                   ungrouped/complex branch's full count (best case, they
 *                   could all coincide).
 *
 * Three severities, worst first:
 *   RULE A - guaranteedMin is 0 or 1 from unconditional `#` lines alone
 *            (a flat, unconditional single-option or empty *choice).
 *   RULE B - guaranteedMin is 1 via mutually-exclusive branches with no
 *            unconditional fallback (the squad-test bug this tool was
 *            originally built to catch: whichever single class/race/squad
 *            branch is true is all the player ever sees).
 *   RULE C - guaranteedMin is exactly 2. Not broken, but two options reads
 *            almost as thin as one — three is treated as the standard
 *            worth aiming for. Reported as a review list, not an error.
 *
 * Exception for RULE C only: a two-option choice that is deliberately two
 * (a plain yes/no, a fork where a third option would be padding) can opt out
 * with a marker comment on the lines directly above the *choice:
 *
 *     *comment lint-ok two-options: plain yes or no
 *     *choice
 *
 * The block is skipped, and the number of exempted blocks is printed at the
 * end so exemptions stay visible. The marker never hides Rule A/B errors.
 *
 * This is a heuristic over the raw text, not a real ChoiceScript parser,
 * and deliberately errs toward under-flagging: it assumes this project's
 * consistent 2-space-per-level indentation and simple `VAR = "value"`
 * equality guards. Compound conditions (and/or) or inconsistent
 * indentation fall back to "can't tell" (contributing 0 to the guarantee,
 * its full count to the possible max) rather than a false "safe" — see the
 * SKIPPED summary at the end for anything it couldn't fully classify.
 *
 * A random-sampling approach (run many playthroughs, count what actually
 * rendered) was considered instead, per a suggestion to try that — but
 * static analysis is the better tool for this specific question: it gives
 * a certain answer for every pattern it understands, with no risk of a
 * rare state combination never getting sampled. Random testing still adds
 * real value elsewhere (see check_balance.js for success/fail rates,
 * which genuinely can't be computed without simulating rolls).
 *
 * Usage:
 *   node tools/lint_choices.js [path]
 *
 *   path - optional single file or directory to lint (default:
 *          web/mygame/scenes/)
 *
 * Exit code is 1 if any Rule A/B issue was found. Rule C findings and
 * skips don't affect the exit code — they're a nudge to look closer, not
 * a failure.
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

// Analyzes the surrounding label and options to distinguish one-shot quest
// beats from repeating hubs and menu backouts.
function analyzeChoiceContext(lines, choiceLineIdx, currentLabel, allTexts, blockEndIdx, file) {
  let isQuestBeat = /^(beat_|quest_|stage_|investigation_|confrontation_|climax_)/i.test(currentLabel);
  let isHub = /(_menu|_hub|_pois?|_inn|_quarters|_lodgings|_downtime|_rest)/i.test(currentLabel);
  const isStats = /choicescript_stats|startup/i.test(file) || /^(stats_|inventory_|journal_)/i.test(currentLabel);

  // Check recent comments (up to 25 lines preceding the choice)
  const commentStart = Math.max(0, choiceLineIdx - 25);
  for (let c = commentStart; c < choiceLineIdx; c++) {
    const line = lines[c].trim();
    if (/^\*comment\b/i.test(line)) {
      if (/\b(?:BEAT\b|QUEST\b)/i.test(line)) isQuestBeat = true;
      if (/\b(?:HUB\b|POI\b|DOWNTIME\b|REST\b|SUB-HUB)/i.test(line)) isHub = true;
    }
  }

  // Check if any option is a hub return or backout
  let hasHubReturn = false;
  for (const text of allTexts) {
    if (/^#\s*(?:\[?(?:Step back|Return to|Back to|Back out|Leave|Head back|Exit|Walk away)\b|"(?:Understood|Never mind|Leave it)")/i.test(text)) {
      hasHubReturn = true;
      break;
    }
  }

  // Also scan gotos within the choice block for returns to hub/menu labels
  if (!hasHubReturn) {
    for (let c = choiceLineIdx; c < blockEndIdx; c++) {
      const gotoMatch = /^\s*\*goto\s+([a-zA-Z0-9_]+)/i.exec(lines[c]);
      if (gotoMatch) {
        const target = gotoMatch[1];
        if (/_menu|_hub|_pois?|_camp|_inn|_quarters|_square|_quayside/i.test(target)) {
          hasHubReturn = true;
          break;
        }
      }
    }
  }

  let detail = '';
  if (isQuestBeat) {
    detail = hasHubReturn
      ? `(Quest Beat: ${currentLabel}) 2 options [Action + Hub Return] — one-shot quest fork, not a timeless hub`
      : `(Quest Beat: ${currentLabel}) 2 options — one-shot quest choice (consider a 3rd approach)`;
  } else if (isHub) {
    detail = `(Repeating Hub: ${currentLabel}) 2 options — repeating hub/menu should offer downtime variety (verify Rule 3)`;
  } else if (isStats) {
    detail = `(System/Menu: ${currentLabel}) 2 options — menu navigation`;
  } else if (hasHubReturn) {
    detail = `(${currentLabel}) 2 options [Action + Backout] — scene fork, not a repeating hub`;
  } else {
    detail = `(${currentLabel}) exactly 2 unconditional options — consider a third`;
  }

  return detail;
}

const EQUALITY = /\*(?:if|elseif)\s*\(\s*([\w.]+)\s*=\s*"([^"]*)"\s*\)\s*$/;

// True if a `*comment lint-ok two-options` marker sits in the comment/blank lines
// directly above the *choice (see the header). Walks up until it hits real content.
function hasTwoOptionExemption(lines, choiceLineIdx) {
  for (let c = choiceLineIdx - 1; c >= 0 && choiceLineIdx - c <= 6; c--) {
    const line = lines[c].trim();
    if (/^\*comment\s+lint-ok\s+two-options\b/i.test(line)) return true;
    if (line !== '' && !/^\*comment\b/i.test(line)) return false;
  }
  return false;
}

function lintFile(file) {
  const text = fs.readFileSync(file, 'utf8');
  const lines = text.split(/\r?\n/);
  const findings = [];
  const skipped = [];
  const exempted = [];
  let currentLabel = '(top-level)';

  for (let i = 0; i < lines.length; i++) {
    if (isBlank(lines[i])) continue;
    const labelMatch = /^\s*\*label\s+([a-zA-Z0-9_]+)/.exec(lines[i]);
    if (labelMatch) {
      currentLabel = labelMatch[1];
    }
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
    const hasBranches = items.some((it) => it.kind === 'branch');

    // Case 1: no branches at all — the rendered count IS totalHashes, no
    // uncertainty possible. Safe to score directly, including Rule C.
    if (!hasBranches) {
      if (totalHashes === 0 || (totalHashes === 1 && !isNavOption(allTexts[0]))) {
        findings.push({
          file,
          line: choiceLineNum,
          rule: 'A',
          detail: `*choice resolves to ${totalHashes} option${totalHashes === 1 ? '' : 's'} — not a real choice`,
        });
      } else if (totalHashes === 2) {
        if (hasTwoOptionExemption(lines, i)) {
          exempted.push({ file, line: choiceLineNum });
        } else {
          const detail = analyzeChoiceContext(lines, i, currentLabel, allTexts, blockEndIdx, file);
          findings.push({ file, line: choiceLineNum, rule: 'C', detail });
        }
      }
      continue;
    }

    // Case 2: there are branches. Group simple, non-else branches by
    // variable to find mutually exclusive sets (same variable, distinct
    // literal values) — the only pattern this tool can reason about with
    // full confidence. Anything else (compound conditions, a lone branch
    // sharing no variable with a sibling, overlapping values) goes to
    // `unresolved`: not because it's assumed to contribute 0, but because
    // we genuinely can't tell, and a wrong confident answer is worse than
    // an honest "check by eye".
    const unconditionalCount = items.filter((it) => it.kind === 'hash').length;
    const branches = items.filter((it) => it.kind === 'branch');

    const byVariable = new Map();
    const unresolved = [];

    for (const b of branches) {
      if (!b.simple || b.isElse) {
        unresolved.push(b);
        continue;
      }
      if (!byVariable.has(b.variable)) byVariable.set(b.variable, []);
      byVariable.get(b.variable).push(b);
    }

    const exclusiveGroups = [];
    for (const [variable, members] of byVariable) {
      const distinctValues = new Set(members.map((m) => m.value)).size === members.length;
      if (members.length < 2 || !distinctValues) {
        unresolved.push(...members); // lone branch, or overlapping values — not provably exclusive
        continue;
      }
      exclusiveGroups.push({ variable, members });
    }

    if (unresolved.length > 0) {
      skipped.push({
        file,
        line: choiceLineNum,
        reason: `${unresolved.length} branch(es) not fully classified (compound condition, or shares no variable with a sibling) — can't confidently bound this choice`,
      });
      continue; // do not score — an unresolved branch could always be the thing that saves it
    }

    let guaranteedMin = unconditionalCount;
    let possibleMax = unconditionalCount;
    for (const g of exclusiveGroups) {
      const counts = g.members.map((m) => m.optionCount);
      guaranteedMin += Math.min(...counts);
      possibleMax += Math.max(...counts);
    }

    if (guaranteedMin <= 1) {
      const culprit = exclusiveGroups.find((g) => Math.min(...g.members.map((m) => m.optionCount)) === guaranteedMin);
      if (unconditionalCount === 0 && culprit) {
        findings.push({
          file,
          line: choiceLineNum,
          rule: 'B',
          detail: `all branches gate on \`${culprit.variable}\` (values: ${culprit.members
            .map((m) => JSON.stringify(m.value))
            .join(', ')}) with no unconditional fallback — since ${culprit.variable} only ever holds one value, worst case renders exactly 1 option`,
        });
      } else {
        findings.push({
          file,
          line: choiceLineNum,
          rule: 'B',
          detail: `worst case renders ${guaranteedMin} option${guaranteedMin === 1 ? '' : 's'} (best case ${possibleMax})`,
        });
      }
    } else if (guaranteedMin === 2) {
      if (hasTwoOptionExemption(lines, i)) {
        exempted.push({ file, line: choiceLineNum });
      } else {
        const detail = analyzeChoiceContext(lines, i, currentLabel, allTexts, blockEndIdx, file);
        findings.push({
          file,
          line: choiceLineNum,
          rule: 'C',
          detail: `${detail} (worst case renders 2 options, best case ${possibleMax})`,
        });
      }
    }
  }

  return { findings, skipped, exempted };
}

const files = collectScenes(target);
let allFindings = [];
let allSkipped = [];
let allExempted = [];

for (const file of files) {
  const { findings, skipped, exempted } = lintFile(file);
  allFindings = allFindings.concat(findings);
  allSkipped = allSkipped.concat(skipped);
  allExempted = allExempted.concat(exempted);
}

const errors = allFindings.filter((f) => f.rule === 'A' || f.rule === 'B');
const advisories = allFindings.filter((f) => f.rule === 'C');

if (errors.length === 0) {
  console.log(`No 0/1-option *choice issues found across ${files.length} file(s).`);
} else {
  console.log(`Found ${errors.length} issue(s) (guaranteed 0 or 1 options):\n`);
  for (const f of errors) {
    console.log(`${path.relative(process.cwd(), f.file)}:${f.line} [Rule ${f.rule}] ${f.detail}`);
  }
}

if (advisories.length > 0) {
  console.log(`\n${advisories.length} two-option *choice(s) worth a look (not errors — three is the standard, not a requirement):`);
  for (const f of advisories) {
    console.log(`  ${path.relative(process.cwd(), f.file)}:${f.line} [Rule C] ${f.detail}`);
  }
}

if (allExempted.length > 0) {
  console.log(`\n${allExempted.length} deliberate two-option *choice(s) exempted with "*comment lint-ok two-options":`);
  for (const e of allExempted) {
    console.log(`  ${path.relative(process.cwd(), e.file)}:${e.line}`);
  }
}

if (allSkipped.length > 0) {
  console.log(`\n${allSkipped.length} *choice block(s) with some complex/compound conditions (min/max may be understated — check by eye):`);
  for (const s of allSkipped) {
    console.log(`  ${path.relative(process.cwd(), s.file)}:${s.line} — ${s.reason}`);
  }
}

process.exit(errors.length > 0 ? 1 : 0);
