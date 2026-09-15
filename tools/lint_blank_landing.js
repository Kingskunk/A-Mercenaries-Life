#!/usr/bin/env node
/*
 * lint_blank_landing.js — flags a *page_break whose destination lands
 * directly on a *choice with no prose printed above it, so the player sees
 * a genuinely blank screen (just the button options) right after a hard
 * page transition.
 *
 * This is a distinct bug class from what lint_thin_prose.js's SILENT
 * category models. A *choice option that prints nothing is usually fine
 * *if* it's still on the same scrolling page as whatever text came before
 * it (a header, a preceding option's own prose) -- the player never sees an
 * empty screen, just a menu appearing under content they already read.
 * *page_break is different: it forces a hard reload to a *fresh* page, so
 * if the destination's very first visible content is a bare *choice, the
 * player is looking at a screen with nothing on it but buttons. Found live
 * in alderford.txt: one of four "ask Maura a question" options had a stray
 * *page_break the other three didn't, landing on taphouse_bar_loop (a
 * header-less revisit hub, fine for the other three since they fall
 * straight through with no page break) -- an empty-looking screen after a
 * full conversation, unnoticed for a whole session because SILENT-option
 * checks don't look at what's above a *choice, only what's inside an
 * option's own body.
 *
 * Method: for each *page_break, look at the immediate lines that follow
 * (skipping blanks/*comments) for a *goto/*goto_scene — including inside a
 * simple following *if/*else split, since a page_break's destination is
 * sometimes conditional. For every target label found, follow it (across
 * scene files for *goto_scene) and scan forward from there: if the very
 * first thing with any real content is a bare *choice/*fake_choice with
 * zero prose printed first, that's a blank landing. A ${variable}-only line
 * along the way (this codebase's shared-narration-string pattern, e.g.
 * combat.txt's ${combat_flavor_weapon_hit}) can't be judged statically --
 * treated as "might not be blank," not flagged, same call
 * lint_thin_prose.js's DELEGATED category makes.
 *
 * This is a text-line heuristic, not a real parse -- it does NOT evaluate
 * *if/*else branch logic, just whether ANY line in the reachable span looks
 * like prose. That means a label with genuinely conditional prose (a
 * reactive greeting where only some branches print text) is correctly left
 * unflagged as long as at least one branch has real content, but it also
 * means a few classes of false positive are expected and this is a
 * candidate list for a human to read, not a verdict:
 *   - A label whose only "prose" is itself gated behind a condition this
 *     tool can't prove is ever false along this specific path.
 *   - A *goto target this tool couldn't resolve (typo, or a label defined
 *     in a scene bundled only via *scene_list machinery this tool doesn't
 *     replicate) is silently skipped, not flagged -- under-reporting is
 *     preferred over a confusing false alarm pointing at "line 0."
 *   - Multiple *page_break sites landing on the same blank label report as
 *     separate findings (each is its own real bug site to fix or waive).
 *
 * Usage:
 *   node tools/lint_blank_landing.js [path] [maxScan=50]
 *
 *   path     - optional single file or directory to lint (default:
 *              web/mygame/scenes/)
 *   maxScan  - lines to scan forward from a target label before giving up
 *              without flagging (default 50)
 *
 * Report-only: always exits 0.
 */

const fs = require('fs');
const path = require('path');

let target = path.resolve(__dirname, '..', 'web', 'mygame', 'scenes');
let maxScan = 50;
for (const arg of process.argv.slice(2)) {
  const scanMatch = /^maxScan=(\d+)$/.exec(arg);
  if (scanMatch) {
    maxScan = parseInt(scanMatch[1], 10);
  } else {
    target = path.resolve(arg);
  }
}

function collectScenes(dir) {
  const stat = fs.statSync(dir);
  if (stat.isFile()) return [dir];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.txt'))
    .map((f) => path.join(dir, f));
}

function isBlank(line) {
  return line.trim() === '';
}

const BRACKET_SPAN = /\[[^\[\]]*\]/g;
const DELEGATED_LINE = /^\$\{[\w.]+\}$/;
const PAGE_BREAK = /^\s*\*page_break\b/;
const COMMENT_LINE = /^\s*\*comment\b/;
const CHOICE_LINE = /^\s*\*(choice|fake_choice)\b/;
const LABEL_DEF = /^\*label\s+([A-Za-z0-9_]+)/;
const GOTO_LINE = /^\s*\*goto\s+([A-Za-z0-9_]+)/;
const GOTO_SCENE_LINE = /^\s*\*goto_scene\s+([A-Za-z0-9_]+)(?:\s+([A-Za-z0-9_]+))?/;

const sceneDir = fs.statSync(target).isFile() ? path.dirname(target) : target;

// Build a whole-directory label map so *goto_scene can resolve into any
// scene file, not just the one currently being scanned.
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

function resolveGoto(currentFile, labelName) {
  const labels = labelIndex[currentFile];
  if (labels && labelName in labels) return { file: currentFile, line: labels[labelName] };
  return null;
}

function resolveGotoScene(sceneName, labelName) {
  const f = sceneName + '.txt';
  if (!(f in fileLines)) return null;
  if (!labelName) return { file: f, line: 0 };
  const labels = labelIndex[f];
  if (labels && labelName in labels) return { file: f, line: labels[labelName] };
  return null;
}

// Collect every *goto/*goto_scene target reachable in the small window right
// after a *page_break, including inside a simple *if/*else split.
function collectGotoTargets(lines, currentFile, startIdx) {
  const targets = [];
  let i = startIdx;
  let scanned = 0;
  while (i < lines.length && scanned < 8) {
    const raw = lines[i];
    if (isBlank(raw) || COMMENT_LINE.test(raw)) {
      i++;
      continue;
    }
    scanned++;
    const trimmed = raw.trim();
    if (/^\*(if|elseif|else)\b/.test(trimmed)) {
      i++;
      continue; // branch keyword itself carries no target
    }
    const gm = GOTO_LINE.exec(raw);
    if (gm) {
      const resolved = resolveGoto(currentFile, gm[1]);
      if (resolved) targets.push(resolved);
      i++;
      continue;
    }
    const gsm = GOTO_SCENE_LINE.exec(raw);
    if (gsm) {
      const resolved = resolveGotoScene(gsm[1], gsm[2]);
      if (resolved) targets.push(resolved);
      i++;
      continue;
    }
    if (/^\*set\b/.test(trimmed)) {
      i++;
      continue; // bookkeeping before the goto, keep scanning
    }
    // Hit something else (prose, another command) -- the page_break's own
    // destination is this line itself, not a goto elsewhere.
    break;
  }
  return targets;
}

// From a target label, scan forward for the first *choice with nothing but
// command lines / comments above it. Returns 'blank' (truly nothing --
// no prose, not even a bracket banner), 'banner-only' (a stat/status
// banner rendered but no narrative sentence -- e.g. combat's per-round HP
// dashboard, a deliberate design, not an empty screen), 'has-prose',
// 'delegated', or 'inconclusive' (hit a cap, another *label, or EOF first).
function scanLanding(lines, startIdx) {
  let i = startIdx + 1; // skip the *label line itself
  let scanned = 0;
  let sawBanner = false;
  while (i < lines.length && scanned < maxScan) {
    const raw = lines[i];
    if (isBlank(raw)) {
      i++;
      continue;
    }
    scanned++;
    const trimmed = raw.trim();
    if (CHOICE_LINE.test(trimmed)) return sawBanner ? 'banner-only' : 'blank';
    if (LABEL_DEF.test(raw)) return 'inconclusive';
    if (/^\*/.test(trimmed)) {
      i++;
      continue; // command line, not prose
    }
    if (DELEGATED_LINE.test(trimmed)) return 'delegated';
    const stripped = trimmed.replace(BRACKET_SPAN, '').trim();
    if (stripped === '') {
      sawBanner = true; // line was only a [bracket] banner -- real content,
      i++; // just not narrative prose. Keep scanning for actual prose.
      continue;
    }
    return 'has-prose';
  }
  return 'inconclusive';
}

function lintFile(basename) {
  const lines = fileLines[basename];
  const blank = [];
  const bannerOnly = [];
  for (let i = 0; i < lines.length; i++) {
    if (!PAGE_BREAK.test(lines[i])) continue;
    const pageBreakLine = i + 1;
    const targets = collectGotoTargets(lines, basename, i + 1);
    for (const t of targets) {
      const verdict = scanLanding(fileLines[t.file], t.line);
      if (verdict !== 'blank' && verdict !== 'banner-only') continue;
      const labelMatch = LABEL_DEF.exec(fileLines[t.file][t.line]);
      const entry = {
        file: basename,
        line: pageBreakLine,
        targetFile: t.file,
        targetLine: t.line + 1,
        targetLabel: labelMatch ? labelMatch[1] : '?',
      };
      (verdict === 'blank' ? blank : bannerOnly).push(entry);
    }
  }
  return { blank, bannerOnly };
}

const files = collectScenes(target).map((f) => path.basename(f));
let allBlank = [];
let allBannerOnly = [];
for (const f of files) {
  if (!(f in fileLines)) continue; // outside sceneDir, not indexed
  const { blank, bannerOnly } = lintFile(f);
  allBlank = allBlank.concat(blank);
  allBannerOnly = allBannerOnly.concat(bannerOnly);
}

function formatEntry(f) {
  const same = f.file === f.targetFile;
  return `  ${f.file}:${f.line} *page_break -> ${same ? '' : f.targetFile + ':'}${f.targetLabel} (${f.targetFile}:${f.targetLine})`;
}

console.log(`Scanned ${files.length} file(s) for blank *page_break landings.\n`);

if (allBlank.length === 0) {
  console.log('No blank landings found.');
} else {
  console.log(`${allBlank.length} BLANK landing(s) — the destination prints nothing at all (not even a bracket banner) before its *choice, so a hard page_break lands on a genuinely empty screen. Read each in context, this is a candidate list, not a verdict:\n`);
  for (const f of allBlank) console.log(formatEntry(f));
}

if (allBannerOnly.length > 0) {
  console.log(`\n${allBannerOnly.length} BANNER-ONLY landing(s) — the destination shows a [bracket] status banner (HP, stats, etc.) but no narrative prose before its *choice. Often intentional (a dashboard-style hub like combat's round summary) rather than a bug — spot-check, don't treat as a punch list:\n`);
  for (const f of allBannerOnly) console.log(formatEntry(f));
}

process.exit(0);
