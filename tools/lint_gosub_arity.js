#!/usr/bin/env node
/*
 * lint_gosub_arity.js — flags a *gosub/*gosub_scene call whose argument
 * count doesn't match the target label's own *params declaration.
 *
 * ChoiceScript's *params loop shifts one value off the passed-in list per
 * declared name; if a caller passes fewer arguments than the label
 * declares, the engine throws "No parameter passed for <name>" the moment
 * that call actually runs — a real crash, not a style issue. quicktest's
 * coverage walker (autotest.js) explicitly skips any *gosub/*gosub_scene
 * line that carries parameters rather than validating them, so this class
 * of bug can sit in the codebase indefinitely: syntactically valid, passes
 * quicktest, and only surfaces the moment a player (or a scripted_play.js
 * run) actually reaches that specific call with that specific branch live.
 * Found for real this session: widening roll_skill_check from 4 params to
 * 7 silently broke 23 already-written calls in camp_night.txt, caught only
 * because a careful sweep noticed the *params line had changed underneath
 * it — this tool is what should have caught it in one command instead.
 *
 * Method: index every *label in every scene file, and for each one, walk
 * forward past blank lines and *comment lines (this codebase does put
 * comments between *label and *params in several places, e.g. combat.txt's
 * apply_slot_stat_override) to find the first real command. If that's
 * *params, record its declared name count; anything else (including EOF)
 * means the label takes zero. Then scan every *gosub <label> <args...> and
 * *gosub_scene <scene> <label> <args...> call, tokenize its argument list
 * (a mini state-machine, not a plain space-split, since an argument can be
 * a quoted string or a parenthesized expression containing its own spaces,
 * e.g. `*gosub score_to_mod (strength - buff_str_bonus)` is ONE argument),
 * and compare the count against that label's declared params.
 *
 * Two finding classes:
 *   TOO FEW  — a real crash the instant this call is reached. Always fix.
 *   TOO MANY — the engine silently drops the extra values rather than
 *     erroring, so this never crashes, but it's the same drift in the
 *     opposite direction (a *params list shrank and this call site wasn't
 *     updated) and is worth a look.
 *
 * A *gosub_scene with no label at all (jumps to a scene's own top-level
 * flow, e.g. `*gosub_scene combat`) takes no params by construction and is
 * skipped. A label this tool can't resolve (typo, or defined somewhere
 * outside the scanned directory) is silently skipped too, same
 * under-reporting-over-false-alarm philosophy as this codebase's other
 * lint tools — this is a candidate list to read, not a verdict, though
 * unlike the prose-heuristic linters, an arity mismatch that IS found here
 * is unambiguous: there's no such thing as an intentional one.
 *
 * Usage:
 *   node tools/lint_gosub_arity.js [path]
 *
 *   path — optional single file or directory to scan CALL SITES in
 *          (default: web/mygame/scenes/). The label index is always built
 *          from the whole scenes/ directory regardless, since a call site
 *          in one file routinely targets a label in another.
 *
 * Report-only: always exits 0.
 */

const fs = require('fs');
const path = require('path');

let target = path.resolve(__dirname, '..', 'web', 'mygame', 'scenes');
for (const arg of process.argv.slice(2)) {
  target = path.resolve(arg);
}

const sceneDir = fs.statSync(target).isFile() ? path.dirname(target) : target;

const LABEL_DEF = /^\*label\s+([A-Za-z0-9_]+)/;
const COMMENT_LINE = /^\s*\*comment\b/;
const PARAMS_LINE = /^\*params\s+(.+)$/;
const GOSUB_LINE = /^\s*\*gosub\s+([A-Za-z_]\w*)\s*(.*)$/;
const GOSUB_SCENE_LINE = /^\s*\*gosub_scene\s+([A-Za-z_]\w*)(?:\s+([A-Za-z_]\w*))?\s*(.*)$/;

function isBlank(line) {
  return line.trim() === '';
}

// Whole-directory index: every scene's lines, and its label -> line-index map.
const fileLines = {}; // basename -> lines[]
const labelIndex = {}; // basename -> { labelName -> lineIndex }
for (const f of fs.readdirSync(sceneDir).filter((f) => f.endsWith('.txt'))) {
  const text = fs.readFileSync(path.join(sceneDir, f), 'utf8');
  const lines = text.split(/\r?\n/);
  fileLines[f] = lines;
  const labels = {};
  lines.forEach((line, idx) => {
    const m = LABEL_DEF.exec(line);
    if (m) labels[m[1]] = idx;
  });
  labelIndex[f] = labels;
}

// For a *label at lines[idx], how many *params it declares (0 if none),
// skipping blank/*comment lines to find the first real command.
function paramCountAt(lines, idx) {
  let i = idx + 1;
  while (i < lines.length) {
    const raw = lines[i];
    if (isBlank(raw) || COMMENT_LINE.test(raw)) {
      i++;
      continue;
    }
    const m = PARAMS_LINE.exec(raw.trim());
    return m ? splitArgs(m[1]).length : 0;
  }
  return 0;
}

// Tokenize a *gosub/*gosub_scene argument string: a quoted "..." span or a
// parenthesized (...) span (nesting-aware) counts as ONE argument even
// though it can contain internal spaces; anything else splits on whitespace.
function splitArgs(str) {
  const args = [];
  let i = 0;
  const n = str.length;
  while (i < n) {
    while (i < n && /\s/.test(str[i])) i++;
    if (i >= n) break;
    const start = i;
    if (str[i] === '"') {
      i++;
      while (i < n && str[i] !== '"') i++;
      if (i < n) i++; // consume closing quote
    } else if (str[i] === '(') {
      let depth = 0;
      while (i < n) {
        if (str[i] === '(') depth++;
        else if (str[i] === ')') {
          depth--;
          i++;
          if (depth === 0) break;
          continue;
        }
        i++;
      }
    } else {
      while (i < n && !/\s/.test(str[i])) i++;
    }
    args.push(str.slice(start, i));
  }
  return args;
}

// Build the label -> paramCount map once, per file.
const paramCounts = {}; // basename -> { labelName -> count }
for (const f of Object.keys(fileLines)) {
  const lines = fileLines[f];
  const labels = labelIndex[f];
  const counts = {};
  for (const name of Object.keys(labels)) {
    counts[name] = paramCountAt(lines, labels[name]);
  }
  paramCounts[f] = counts;
}

function collectScenes(dir) {
  const stat = fs.statSync(dir);
  if (stat.isFile()) return [path.basename(dir)];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.txt'));
}

const scanFiles = collectScenes(target);
const tooFew = [];
const tooMany = [];

// ---------------------------------------------------------------------------
// roll_skill_check argument CONTENT validation.
//
// Counting arguments is only half the job for this one call. Its signature is
// <DC> "<skill 1>" "<override 1>" "<skill 2>" "<override 2>" "<skill 3>" "<override 3>",
// and the engine validates NONE of that: an unknown skill id or a typo'd override
// resolves to an empty/garbage ability, no ability branch fires in roll_d20_check,
// and because check_mod is *create'd once and never reset per roll, the roll
// silently reuses the previous check's modifier. No crash, no wrong-looking
// number, an empty skill name in the banner. Arity checking cannot see any of
// it, so check the values here, statically, for every call in the repo.
// ---------------------------------------------------------------------------

// The 18 valid ids are read out of startup.txt's skill_lookup itself rather than
// hardcoded, so adding a skill to that table automatically makes it legal here.
const SKILL_LOOKUP_ID = /^\s*\*if\s*\(\s*skl_id\s*=\s*"([^"]+)"\s*\)/;
const RSC_ABILITY_ID = /^\s*\*if\s*\(\s*rsc_ability\s*=\s*"([^"]+)"\s*\)/;

function idsFromLabel(basename, labelName, re) {
  const lines = fileLines[basename];
  const labels = labelIndex[basename];
  if (!lines || !labels || !(labelName in labels)) return null;
  const out = new Set();
  for (let i = labels[labelName]; i < lines.length; i++) {
    const m = re.exec(lines[i]);
    if (m) out.add(m[1]);
    if (/^\s*\*label\b/.test(lines[i]) && i > labels[labelName]) break;
  }
  return out.size ? out : null;
}

const validSkills =
  idsFromLabel('startup.txt', 'skill_lookup', SKILL_LOOKUP_ID) ||
  new Set(['acrobatics', 'animal_handling', 'arcana', 'athletics', 'deception', 'history',
    'insight', 'intimidation', 'investigation', 'medicine', 'nature', 'perception',
    'performance', 'persuasion', 'religion', 'sleight_of_hand', 'stealth', 'survival']);
const validAbilities =
  idsFromLabel('startup.txt', 'roll_skill_check', RSC_ABILITY_ID) ||
  new Set(['str', 'dex', 'con', 'int', 'wis', 'cha']);

const unquote = (s) => s.trim().replace(/^"(.*)"$/, '$1');
const badArgs = [];

for (const basename of scanFiles) {
  if (!(basename in fileLines)) continue;
  const lines = fileLines[basename];
  lines.forEach((raw, idx) => {
    const m = /^\s*\*gosub_scene\s+startup\s+roll_skill_check\s*(.*)$/.exec(raw);
    if (!m) return;
    const args = splitArgs(m[1]);
    if (args.length !== 7) return; // arity is this tool's other job; don't double-report

    const problems = [];
    // The DC may be a literal (the common case) or a variable holding a computed one --
    // port_valen.txt scales several checks off climax_dc / fish_route_dc / hendryk_*_dc, and
    // the engine resolves a bare identifier in this position just fine. Only reject things
    // that can be neither.
    const dc = args[0].trim();
    if (!/^\d+$/.test(dc) && !/^[A-Za-z_]\w*$/.test(dc)) {
      problems.push(`arg 1 (the DC) is "${dc}", expected a plain number or a variable name`);
    }
    for (const [dcSlot, skillIdx, ovrIdx] of [[2, 1, 2], [3, 3, 4], [4, 5, 6]]) {
      const skill = unquote(args[skillIdx]);
      const ovr = unquote(args[ovrIdx]);
      if (skill !== '' && !validSkills.has(skill)) {
        problems.push(`slot ${dcSlot - 1} skill id "${skill}" is not one of the ${validSkills.size} skills in skill_lookup`);
      }
      if (ovr !== '' && !validAbilities.has(ovr)) {
        problems.push(`slot ${dcSlot - 1} ability override "${ovr}" is not one of ${[...validAbilities].join('/')} (or "" for the skill's own ability)`);
      }
      // A filled override on an empty skill slot is discarded without a word: the loop
      // only ever reads the override for a non-empty skill, so this is dead config
      // that reads as though it does something.
      if (skill === '' && ovr !== '') {
        problems.push(`slot ${dcSlot - 1} has override "${ovr}" but an empty skill slot — the override is silently discarded`);
      }
    }
    if (problems.length) {
      badArgs.push({ file: basename, line: idx + 1, problems, text: raw.trim() });
    }
  });
}

for (const basename of scanFiles) {
  if (!(basename in fileLines)) continue;
  const sceneName = basename.replace(/\.txt$/, '');
  const lines = fileLines[basename];
  lines.forEach((raw, idx) => {
    let targetFile = null;
    let labelName = null;
    let argStr = null;

    const gsm = GOSUB_SCENE_LINE.exec(raw);
    if (gsm) {
      if (!gsm[2]) return; // no label -- scene top-level, no params to check
      targetFile = gsm[1] + '.txt';
      labelName = gsm[2];
      argStr = gsm[3] || '';
    } else {
      const gm = GOSUB_LINE.exec(raw);
      if (gm) {
        targetFile = basename;
        labelName = gm[1];
        argStr = gm[2] || '';
      }
    }
    if (!targetFile) return;
    if (!(targetFile in paramCounts) || !(labelName in paramCounts[targetFile])) return; // unresolved, skip

    const declared = paramCounts[targetFile][labelName];
    const passed = splitArgs(argStr).length;
    if (passed === declared) return;

    const entry = {
      file: basename,
      line: idx + 1,
      targetFile,
      labelName,
      declared,
      passed,
      text: raw.trim(),
    };
    (passed < declared ? tooFew : tooMany).push(entry);
  });
}

function formatEntry(e) {
  const sameFile = e.file === e.targetFile;
  return `  ${e.file}:${e.line} calls ${sameFile ? '' : e.targetFile.replace(/\.txt$/, '') + ' '}${e.labelName} with ${e.passed} arg(s), but it declares ${e.declared}\n      ${e.text}`;
}

console.log(`Scanned ${scanFiles.length} file(s) for *gosub/*gosub_scene argument-count mismatches.\n`);

if (tooFew.length === 0 && tooMany.length === 0) {
  console.log('No arity mismatches found.');
} else {
  if (tooFew.length > 0) {
    console.log(`${tooFew.length} TOO FEW argument(s) — this call WILL crash ("No parameter passed") the moment it's reached:\n`);
    for (const e of tooFew) console.log(formatEntry(e));
  }
  if (tooMany.length > 0) {
    console.log(`\n${tooMany.length} TOO MANY argument(s) — not a crash (the engine silently drops the extras), but likely a stale call after a *params list shrank:\n`);
    for (const e of tooMany) console.log(formatEntry(e));
  }
}

if (badArgs.length > 0) {
  console.log(`\n${badArgs.length} roll_skill_check call(s) with INVALID argument values — these do NOT crash; they roll with a wrong (often stale) modifier and print an empty skill name:\n`);
  for (const e of badArgs) {
    console.log(`  ${e.file}:${e.line}`);
    for (const p of e.problems) console.log(`      - ${p}`);
    console.log(`      ${e.text}`);
  }
} else {
  console.log(`\nAll roll_skill_check calls use valid skill ids and ability overrides.`);
}

process.exit(0);
