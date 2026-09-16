#!/usr/bin/env node
/*
 * lint_vocab_overuse.js — catches the vocabulary-repetition half of Section 6
 * ("Vary Vocabulary Across Adjacent Text") that no other tool checks.
 * lint_prose_tics.js greps for specific *fixed phrases* Section 8 names by
 * pattern; this instead measures word *frequency*, which is what actually
 * catches an AI writer's reflexive habit of leaning on the same handful of
 * favorite verbs/adjectives/sensory words across a whole game's worth of
 * prose, one scene at a time, without ever noticing it in any single scene.
 *
 * Three reports, all from one pass over the prose:
 *
 *   1. GLOBAL OVERUSE — every non-stopword, non-proper-noun word ranked by
 *      raw count across the whole corpus (or `path`, if narrower), with a
 *      per-1000-word rate and its top files by count. This is the "AI has a
 *      favorite word and used it 140 times across 9 files" signal — no
 *      single instance looks wrong on its own, only the aggregate does.
 *
 *   2. TIGHT CLUSTERS — the same word appearing 2+ times within
 *      `clusterWindow` lines of itself, in the same file. This is Section
 *      6's literal complaint ("if one was just used, pick another") — a
 *      narrower, more actionable signal than #1, since these are usually
 *      genuinely fixable in a single pass over one scene.
 *
 *   3. RESTRICTED WORDS — a small, hand-maintained list (see
 *      RESTRICTED_WORDS below) of words the author wants kept rare/special
 *      on purpose (a word meant to mark one specific place, character, or
 *      moment) rather than used freely. Empty by default; add entries as
 *      you notice a word you want to protect from exactly this kind of
 *      dilution. Every use gets listed, not just the count over the limit,
 *      since the point is deciding which instances to cut.
 *
 * A proper-noun word (a character/faction/place name, always or almost
 * always capitalized) is excluded from #1/#2 via a self-maintaining
 * heuristic — no hardcoded name list to keep updating as characters get
 * added: a word only counts if at least half its raw occurrences in the
 * text actually start lowercase (a name essentially never does, since
 * sentence-initial capitalization alone would cap out around 1-in-15 words
 * for a genuinely common word, nowhere near 50%).
 *
 * This is frequency analysis, not comprehension — it cannot tell a
 * deliberate, load-bearing repeated motif from an accidental crutch word.
 * Read the top of each list, not the whole thing; a moderate rate for a
 * very common concept (grip, cold, quiet) is often just genre, not a bug.
 *
 * Usage:
 *   node tools/lint_vocab_overuse.js [path] [top=40] [minCount=5]
 *                                    [clusterWindow=8]
 *
 *   path          - optional single file or directory to lint (default:
 *                   web/mygame/scenes/)
 *   top           - how many words to show in the global overuse ranking
 *   minCount      - minimum total occurrences before a word appears in the
 *                   global ranking at all (cuts noise from words used 2-3
 *                   times, which is normal)
 *   clusterWindow - max line gap between two uses of the same word to count
 *                   as a "tight cluster" (roughly "the current scene and
 *                   the last one or two" from Section 6's own wording)
 *
 * Report-only: always exits 0.
 */

const fs = require('fs');
const path = require('path');

// Add entries here as you notice a word you want kept rare on purpose.
// { word: "threshold", maxUses: 3 } flags every use once total uses exceed 3.
//
// NOT the right mechanism for a literal-vs-figurative restriction (e.g.
// "ledger" reserved for an actual physical/account book, not a metaphor for
// "outcome" or "the legal system") -- a raw count can't tell which sense a
// given use is in, only a human read can. That review already happened once
// for "ledger": of 54 uses across the corpus, ~50 are literal (a clerk's
// physical book, Voss's ledger on his tally-box, Vane's on his desk) and 2
// figurative instances were found and reworded (port_valen.txt, Voss's
// "the city pays for cargo in the ledger" -> "in coin and paper"; Vane's
// "that's the kind of ledger entry I like" -> "that's the kind of result I
// like"). Re-run this review by hand if "ledger" usage grows a lot more --
// don't add it here expecting the count alone to catch a recurrence.
const RESTRICTED_WORDS = [];

// Word GROUPS catch what GLOBAL OVERUSE structurally can't: a near-synonym
// cluster the writer keeps reaching for, where no single member word ever
// crosses minCount on its own but the combined idea is used constantly.
// True hypernym/synonym detection needs a real lexical database (WordNet-
// class dependency) -- this project stays zero-dependency, so groups are
// hand-defined instead: add a { name, words } entry whenever you notice
// several different words doing the same descriptive job. Confirmed real on
// this codebase: ledger(54)+tally(40)+slate(37)+register(19)+chart(10)+
// log(9)+roster(9)+tablet(6)+dossier(4)+manifest(3) = 191 combined uses of
// "written record" imagery, more than all but ~2 single words in the entire
// GLOBAL OVERUSE list -- invisible there because it's spread across 10
// surface words. Not automatically a bug here specifically (this is a
// mercantile port city built on guild bureaucracy and a tally-stick crime
// syndicate -- some of this weight is earned theme, not a crutch), but
// exactly the shape worth watching for elsewhere: sum first, judge second.
const WORD_GROUPS = [
  { name: 'written-record', words: ['ledger', 'tally', 'slate', 'register', 'chart', 'log', 'roster', 'tablet', 'dossier', 'manifest'] },
];

let target = path.resolve(__dirname, '..', 'web', 'mygame', 'scenes');
let top = 40;
let minCount = 5;
let clusterWindow = 8;
for (const arg of process.argv.slice(2)) {
  const [name, value] = arg.split('=');
  if (name === 'top') top = Number(value);
  else if (name === 'minCount') minCount = Number(value);
  else if (name === 'clusterWindow') clusterWindow = Number(value);
  else target = path.resolve(arg);
}

function collectScenes(target) {
  const stat = fs.statSync(target);
  if (stat.isFile()) return [target];
  return fs
    .readdirSync(target)
    .filter((f) => f.endsWith('.txt'))
    .map((f) => path.join(target, f));
}

// Same stripping convention as lint_mechanics_leak.js: bracket/banner spans
// and ${} interpolations are UI/mechanics, not prose vocabulary.
const BOLD_BANNER_SPAN = /\[b\][\s\S]*?\[\/b\]/gi;
const BRACKET_SPAN = /\[[^\[\]]*\]/g;
const INTERP_SPAN = /\$\{[^}]*\}/g;
// @{var text1|text2} -- ChoiceScript's multireplace/conditional-text syntax
// (e.g. @{show_stat_hints [+1 STR Checks for 4h]|}). Not nested in this
// codebase (see narrative_guidelines.md Section 13's "No Nested
// Multireplaces" rule), so a single non-recursive strip is safe.
const MULTIREPLACE_SPAN = /@\{[^{}]*\}/g;
const WORD_RE = /[A-Za-z']+/g;

// True function/grammar words only -- NOT common content verbs like "said"/
// "looked"/"walked", which are legitimate overuse-detection targets, not
// noise to filter out.
const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'nor', 'so', 'yet', 'for',
  'to', 'of', 'in', 'on', 'at', 'by', 'with', 'as', 'from', 'into', 'onto',
  'about', 'against', 'between', 'through', 'during', 'before', 'after',
  'above', 'below', 'under', 'over', 'out', 'off', 'up', 'down', 'again',
  'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
  'my', 'your', 'his', 'its', 'our', 'their', 'mine', 'yours', 'hers', 'ours', 'theirs',
  'this', 'that', 'these', 'those',
  'is', 'am', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'having',
  'do', 'does', 'did', 'doing',
  'will', 'would', 'shall', 'should', 'can', 'could', 'may', 'might', 'must',
  'not', "n't", 'no', 'nor',
  'if', 'then', 'than', 'because', 'while', 'when', 'where', 'which', 'who',
  'whom', 'whose', 'what', 'why', 'how',
  'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such',
  'only', 'own', 'same', 'too', 'very', 'just', 'still', 'even',
  'there', 'here', 'now', 'once',
]);

function isBlank(line) {
  return line.trim() === '';
}

function stripNonProse(line) {
  return line
    .replace(BOLD_BANNER_SPAN, ' ')
    .replace(MULTIREPLACE_SPAN, ' ')
    .replace(BRACKET_SPAN, ' ')
    .replace(INTERP_SPAN, ' ');
}

const files = collectScenes(target);

// word (lowercased) -> { total, lowercaseCount, byFile: Map<file, occurrences[]> }
const stats = new Map();
let totalWords = 0;

for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    if (isBlank(raw)) continue;
    const trimmed = raw.trim();
    if (/^\*/.test(trimmed)) continue; // command line, not prose

    const prose = stripNonProse(trimmed);
    let m;
    WORD_RE.lastIndex = 0;
    while ((m = WORD_RE.exec(prose))) {
      const token = m[0];
      if (token.length <= 2) continue;
      totalWords++;
      const lower = token.toLowerCase();
      if (!stats.has(lower)) {
        stats.set(lower, { total: 0, lowercaseCount: 0, byFile: new Map() });
      }
      const entry = stats.get(lower);
      entry.total++;
      if (token[0] === token[0].toLowerCase()) entry.lowercaseCount++;
      if (!entry.byFile.has(file)) entry.byFile.set(file, []);
      entry.byFile.get(file).push(i + 1);
    }
  }
}

// --- Report 1: global overuse ------------------------------------------
const candidates = [];
for (const [word, entry] of stats) {
  if (STOPWORDS.has(word)) continue;
  if (entry.total < minCount) continue;
  if (entry.lowercaseCount / entry.total < 0.5) continue; // likely a proper noun
  candidates.push({ word, ...entry });
}
candidates.sort((a, b) => b.total - a.total);

console.log(`Scanned ${files.length} file(s), ${totalWords} word(s) of prose.\n`);
console.log(`GLOBAL OVERUSE — top ${Math.min(top, candidates.length)} word(s) with ${minCount}+ uses, ranked by count:\n`);
for (const c of candidates.slice(0, top)) {
  const rate = ((c.total / totalWords) * 1000).toFixed(2);
  const topFiles = [...c.byFile.entries()]
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 3)
    .map(([f, lines]) => `${path.basename(f)} (${lines.length})`)
    .join(', ');
  console.log(`  ${c.word.padEnd(18)} ${String(c.total).padStart(4)}  (${rate}/1000 words)  ${topFiles}`);
}

// --- Report 2: tight clusters --------------------------------------------
const clusters = [];
for (const [word, entry] of stats) {
  if (STOPWORDS.has(word)) continue;
  if (entry.lowercaseCount / entry.total < 0.5) continue;
  for (const [file, lineNums] of entry.byFile) {
    const sorted = [...lineNums].sort((a, b) => a - b);
    let runLines = [sorted[0]];
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] - sorted[i - 1] <= clusterWindow) {
        runLines.push(sorted[i]);
      } else {
        if (runLines.length >= 2) clusters.push({ word, file, lines: runLines });
        runLines = [sorted[i]];
      }
    }
    if (runLines.length >= 2) clusters.push({ word, file, lines: runLines });
  }
}
clusters.sort((a, b) => b.lines.length - a.lines.length);

console.log(`\nTIGHT CLUSTERS — same word used 2+ times within ${clusterWindow} lines, same file (${clusters.length} found):\n`);
for (const c of clusters.slice(0, top)) {
  console.log(`  ${path.relative(process.cwd(), c.file)}:${c.lines.join(',')} "${c.word}" (${c.lines.length}x)`);
}
if (clusters.length > top) {
  console.log(`  ... and ${clusters.length - top} more (raise top= to see them all)`);
}

// --- Report 3: restricted words -------------------------------------------
if (RESTRICTED_WORDS.length) {
  console.log(`\nRESTRICTED WORDS — configured to stay rare:\n`);
  for (const { word, maxUses } of RESTRICTED_WORDS) {
    const entry = stats.get(word.toLowerCase());
    const total = entry ? entry.total : 0;
    if (total <= maxUses) continue;
    console.log(`  "${word}": ${total} use(s), limit ${maxUses}:`);
    for (const [file, lineNums] of entry.byFile) {
      console.log(`    ${path.relative(process.cwd(), file)}: lines ${lineNums.join(', ')}`);
    }
  }
} else {
  console.log(`\nRESTRICTED WORDS — none configured (edit RESTRICTED_WORDS at the top of this file to add some).`);
}

// --- Report 4: word groups (hand-defined synonym/theme clusters) ---------
console.log(`\nWORD GROUPS — combined frequency of hand-defined synonym clusters:\n`);
for (const { name, words } of WORD_GROUPS) {
  let groupTotal = 0;
  const members = [];
  for (const w of words) {
    const entry = stats.get(w.toLowerCase());
    const count = entry ? entry.total : 0;
    groupTotal += count;
    members.push({ word: w, count });
  }
  members.sort((a, b) => b.count - a.count);
  const rate = ((groupTotal / totalWords) * 1000).toFixed(2);
  console.log(`  "${name}": ${groupTotal} combined use(s) (${rate}/1000 words)`);
  for (const m of members) {
    if (m.count > 0) console.log(`    ${m.word.padEnd(14)} ${m.count}`);
  }
}

process.exit(0);
