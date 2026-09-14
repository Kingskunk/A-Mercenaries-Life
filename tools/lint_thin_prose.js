#!/usr/bin/env node
/*
 * lint_thin_prose.js — flags *choice options whose resolution has little or
 * no actual narrative prose before the next *goto/*gosub_scene/choice, a bug
 * class lint_choices.js doesn't catch (it checks how many options a *choice
 * offers, not how much actually happens once you pick one) and that
 * quicktest/randomtest can't catch either (a thin resolution is perfectly
 * valid ChoiceScript, just an unsatisfying beat).
 *
 * For every `#` option anywhere in every *choice block, this walks the
 * option's own body (everything indented deeper than the `#` line, down to
 * the next sibling/dedent — same block-boundary logic as lint_choices.js)
 * and measures how many words of real narration it contains:
 *   - Lines starting with `*` (commands: *set, *if, *goto, *gosub_scene,
 *     *page_break, *comment, etc.) don't count — they're mechanics, not
 *     prose, even though *page_break carries a button-label argument.
 *   - `[bracketed stat/result hints]` (this project's convention for
 *     mechanical banners, e.g. `[b][🩸 Hit: 5 damage][/b]`) are stripped out
 *     of a line before counting — a line that's *only* a hint banner
 *     contributes 0 words, since a banner is feedback, not narration.
 *   - A line that is *only* a single `${some_variable}` interpolation (no
 *     other text) is a special case: this project stores shared narration
 *     in string stats and interpolates it (see combat.txt's
 *     `${combat_flavor_weapon_hit}` pattern) specifically so multiple
 *     fights/callers can reuse the same round-hub prose slot with different
 *     content. This tool can't statically know how long that string will
 *     be at runtime, so rather than false-positive every option that uses
 *     this pattern, it's excluded from scoring entirely and reported
 *     separately as DELEGATED, not flagged as thin.
 *
 * Exactly like lint_choices.js, an option whose header text is wrapped in
 * [brackets] (`# [Return to Dossier]`, `# [Second Wind]`) is exempt — a
 * one-button menu/action acknowledgment is expected to resolve quickly, and
 * isn't held to the "needs a narrated beat" standard the way a bare
 * narrative option is. Same exemption applies to a body containing
 * `*input_text` (a name/text-entry prompt is expected to be a short
 * transitional line, not a narrated beat).
 *
 * Two severities, both advisory (this is a nudge for a human/AI author to
 * look closer, not an unambiguous bug the way a 0/1-option *choice is — see
 * lint_choices.js for that harder case):
 *   THIN   - the option's body has SOME output (prose and/or a bracketed
 *            result banner) but the prose word count is below `minWords`.
 *            This is the strongest signal: something mechanically happened
 *            (damage dealt, an item bought, a check resolved) with little
 *            or no narration wrapped around it. Shown in full by default.
 *   SILENT - the option's body prints literally nothing at all before
 *            falling through to a *goto/*gosub_scene/*choice. This is
 *            expectedly common and mostly NOT a problem in this codebase:
 *            a "pick a name/origin/cantrip" selection menu often puts all
 *            its flavor in the option's own header text and prints shared
 *            follow-up narration after the whole *choice block resolves,
 *            by design (see dawn_trial.txt's cantrip-selection menus).
 *            Not shown at all by default -- not even a count, since it's
 *            dominated by this normal pattern and barely moves run to run.
 *            Pass `showSilent=true` for the full list, and treat it as an
 *            occasional spot-check
 *            for a genuine dead end, not a punch list to clear to zero.
 *
 * Usage:
 *   node tools/lint_thin_prose.js [path] [minWords=10] [showSilent=false]
 *
 *   path       - optional single file or directory to lint (default:
 *                web/mygame/scenes/)
 *   minWords   - prose word count below which a non-empty option is
 *                flagged THIN (default 10)
 *   showSilent - print the full SILENT list instead of just its count
 *                (default false)
 *
 * Report-only: this tool always exits 0. Word-count thresholds are
 * inherently fuzzy judgment calls, not a correctness bug the way
 * lint_choices.js's 0/1-option case is — use the THIN report as a punch
 * list, not a pass/fail gate.
 */

const fs = require('fs');
const path = require('path');

let target = path.resolve(__dirname, '..', 'web', 'mygame', 'scenes');
let minWords = 10;
let showSilent = false;
for (const arg of process.argv.slice(2)) {
  const wordsMatch = /^minWords=(\d+)$/.exec(arg);
  const silentMatch = /^showSilent=(true|false)$/.exec(arg);
  if (wordsMatch) {
    minWords = parseInt(wordsMatch[1], 10);
  } else if (silentMatch) {
    showSilent = silentMatch[1] === 'true';
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

function indentOf(line) {
  const match = /^(\s*)/.exec(line);
  return match[1].length;
}

function isBlank(line) {
  return line.trim() === '';
}

// Returns the exclusive end index of the block that starts at `start` and
// is indented deeper than `headerIndent`. Blank lines don't end a block.
function blockEnd(lines, start, headerIndent) {
  let i = start;
  while (i < lines.length) {
    if (!isBlank(lines[i]) && indentOf(lines[i]) <= headerIndent) break;
    i++;
  }
  return i;
}

// This project's convention for a menu/navigation or single-action option
// ("[Return to Dossier]", "[Second Wind]") — exempt from the "needs a
// narrated beat" standard, same exception lint_choices.js makes.
function isBracketOnlyOption(hashLine) {
  return /^#\s*\[/.test(hashLine.trim());
}

function hasInputText(lines, start, end) {
  for (let i = start; i < end; i++) {
    if (/^\s*\*input_text\b/.test(lines[i])) return true;
  }
  return false;
}

const DELEGATED_LINE = /^\$\{[\w.]+\}$/;
const BRACKET_SPAN = /\[[^\[\]]*\]/g;

function scoreBody(lines, start, end) {
  let words = 0;
  let hadBracketBanner = false;
  let delegated = false;

  for (let i = start; i < end; i++) {
    const raw = lines[i];
    if (isBlank(raw)) continue;
    const trimmed = raw.trim();
    if (/^\*/.test(trimmed)) continue; // command line, not prose
    if (DELEGATED_LINE.test(trimmed)) {
      delegated = true;
      continue;
    }
    const stripped = trimmed.replace(BRACKET_SPAN, '').trim();
    if (stripped !== trimmed) hadBracketBanner = true;
    if (stripped === '') continue;
    words += stripped.split(/\s+/).filter(Boolean).length;
  }

  return { words, hadBracketBanner, delegated };
}

function lintFile(file) {
  const text = fs.readFileSync(file, 'utf8');
  const lines = text.split(/\r?\n/);
  const thin = [];
  const silent = [];
  const delegated = [];

  // Only look inside *choice blocks — a bare `#` outside one isn't an option.
  let inChoiceDepth = 0; // indent of the nearest enclosing *choice's options
  const choiceStack = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (isBlank(line)) continue;
    if (/^\s*\*choice\b/.test(line)) {
      choiceStack.push(indentOf(line));
      continue;
    }
    if (choiceStack.length && !isBlank(line) && indentOf(line) <= choiceStack[choiceStack.length - 1]) {
      choiceStack.pop();
    }
    if (!choiceStack.length) continue;
    if (!/^\s*#/.test(line)) continue;

    const hashIndent = indentOf(line);
    const bodyStart = i + 1;
    const bodyEnd = blockEnd(lines, bodyStart, hashIndent);
    const optionLineNum = i + 1;
    const optionText = line.trim().replace(/^#\s*/, '').slice(0, 70);

    if (isBracketOnlyOption(line)) continue;
    if (hasInputText(lines, bodyStart, bodyEnd)) continue;

    const { words, hadBracketBanner, delegated: isDelegated } = scoreBody(lines, bodyStart, bodyEnd);

    if (isDelegated) {
      delegated.push({ file, line: optionLineNum, text: optionText });
    } else if (words === 0 && !hadBracketBanner) {
      silent.push({ file, line: optionLineNum, text: optionText });
    } else if (words < minWords) {
      thin.push({ file, line: optionLineNum, text: optionText, words });
    }
  }

  return { thin, silent, delegated };
}

const files = collectScenes(target);
let allThin = [];
let allSilent = [];
let allDelegated = [];

for (const file of files) {
  const { thin, silent, delegated } = lintFile(file);
  allThin = allThin.concat(thin);
  allSilent = allSilent.concat(silent);
  allDelegated = allDelegated.concat(delegated);
}

console.log(`Scanned ${files.length} file(s), minWords=${minWords}.\n`);

if (allThin.length === 0) {
  console.log('No thin-prose options found.');
} else {
  console.log(`${allThin.length} THIN option(s) — some output, but under ${minWords} prose words:\n`);
  for (const f of allThin) {
    console.log(`  ${path.relative(process.cwd(), f.file)}:${f.line} [${f.words}w] "${f.text}"`);
  }
}

if (showSilent && allSilent.length > 0) {
  console.log(`\n${allSilent.length} SILENT option(s) — resolve with zero printed output (mostly expected: selection menus with header-only flavor, or routing into a content-rich hub):`);
  for (const f of allSilent) {
    console.log(`  ${path.relative(process.cwd(), f.file)}:${f.line} "${f.text}"`);
  }
}
// SILENT is intentionally not summarized by default (not even a count) --
// it's dominated by this codebase's normal "selection menu, header-only
// flavor, shared narration after the *choice block" pattern and a plain
// count would just be inert noise on every run (it barely moves unless a
// *choice's structure actually changes). Pass showSilent=true if you're
// specifically hunting for a dead-end option, not as part of a routine run.

if (allDelegated.length > 0) {
  console.log(`\n${allDelegated.length} DELEGATED option(s) — prose comes from a \${variable}, can't verify statically (not flagged):`);
  for (const f of allDelegated) {
    console.log(`  ${path.relative(process.cwd(), f.file)}:${f.line} "${f.text}"`);
  }
}

process.exit(0);
