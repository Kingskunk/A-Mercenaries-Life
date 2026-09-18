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
 * Reports:
 *   1. TREND & BASELINE ALERTS — flags words that spiked (+25%+) or newly entered
 *      the top overuse tier compared to tools/vocab_baseline.json.
 *   2. GLOBAL OVERUSE — every non-stopword, non-proper-noun word ranked by
 *      raw count with per-1000-word rates and curated alternative suggestions.
 *   3. TIGHT CLUSTERS — words appearing 2+ times within clusterWindow lines
 *      with repetition warnings and immediate synonym suggestions.
 *   4. RESTRICTED WORDS — hand-maintained list of words kept rare on purpose.
 *   5. WORD GROUPS — combined frequency of hand-defined synonym clusters.
 *
 * Baseline Commands:
 *   node tools/lint_vocab_overuse.js --update-baseline
 *
 * Usage:
 *   node tools/lint_vocab_overuse.js [path] [top=40] [minCount=5]
 *                                    [clusterWindow=8] [--update-baseline]
 *
 * Report-only: always exits 0.
 */

const fs = require('fs');
const path = require('path');

const BASELINE_FILE = path.resolve(__dirname, 'vocab_baseline.json');

// Curated setting-appropriate synonyms and alternative words
const SUGGESTED_ALTERNATIVES = {
  // Sensory & Atmospheric Adjectives
  heavy: ['ponderous', 'leaden', 'massive', 'weighted', 'grueling', 'dense', 'stout', 'burdened'],
  quiet: ['still', 'hushed', 'muted', 'subdued', 'low', 'soundless', 'restrained', 'faint'],
  cold: ['chill', 'bitter', 'biting', 'raw', 'frost-rimmed', 'bleak', 'numbing', 'wintry'],
  dark: ['dim', 'murky', 'shadow-draped', 'gloom-shrouded', 'blackened', 'unlit', 'somber'],
  sharp: ['keen', 'crisp', 'piercing', 'jagged', 'acute', 'biting', 'honed', 'incisive'],
  dry: ['parched', 'brittle', 'desiccated', 'seasoned', 'dusty', 'barren', 'arid'],
  clean: ['neat', 'unmarred', 'unbroken', 'clear', 'precise', 'bare', 'flawless'],
  low: ['faint', 'hushed', 'subdued', 'muffled', 'grounded', 'shallow', 'guttering'],
  tight: ['taut', 'constricted', 'snug', 'narrow', 'rigid', 'drawn', 'unyielding'],
  hard: ['stiff', 'stern', 'unyielding', 'calloused', 'solid', 'flinty', 'severe'],

  // Physical Nouns & Setting Elements
  eyes: ['gaze', 'stare', 'squint', 'glance', 'appraisal', 'regard', 'sight'],
  hand: ['palm', 'fist', 'fingers', 'knuckles', 'grip', 'clasp'],
  hands: ['palms', 'fists', 'fingers', 'knuckles', 'grip', 'clasps'],
  face: ['features', 'visage', 'expression', 'brow', 'jaw', 'countenance'],
  back: ['rear', 'retreat', 'return', 'withdrawal', 'spine', 'shoulders'],
  iron: ['steel', 'blackened metal', 'shear-steel', 'ferrous alloy', 'bloomery iron', 'cold iron'],
  stone: ['masonry', 'ashlar', 'limestone', 'cobblestones', 'flagstones', 'rock', 'granite'],
  timber: ['lumber', 'beams', 'baulks', 'planking', 'oak', 'pine', 'posts'],
  river: ['waterway', 'channel', 'current', 'flume', 'race', 'stream', 'flow'],
  mud: ['slurry', 'mire', 'churned earth', 'silt', 'clay', 'mire-soaked track'],
  water: ['spray', 'brine', 'run-off', 'drizzle', 'current', 'tide', 'surge'],
  silver: ['marks', 'coinage', 'bullion', 'specie', 'change', 'payout'],
  harbor: ['wharves', 'quayside', 'anchorage', 'docks', 'basin', 'waterfront', 'haven'],

  // Action Verbs
  says: ['remarks', 'notes', 'mutters', 'drawls', 'counters', 'answers', 'presses', 'barks'],
  said: ['remarked', 'noted', 'muttered', 'drawled', 'countered', 'answered', 'pressed'],
  looked: ['glanced', 'peered', 'scanned', 'appraised', 'surveyed', 'stared'],
  looking: ['glancing', 'peering', 'scanning', 'appraising', 'surveying', 'staring'],
  take: ['seize', 'claim', 'accept', 'draw', 'lift', 'secure', 'haul'],
  step: ['pace', 'stride', 'tread', 'advance', 'cross', 'shift'],
  stepped: ['paced', 'strode', 'trod', 'advanced', 'crossed', 'shifted'],
  walked: ['strode', 'picked their way', 'crossed', 'marched', 'trudged'],
  pulled: ['hauled', 'dragged', 'wrenched', 'tugged', 'heaved', 'drew'],
  holding: ['gripping', 'clasping', 'bearing', 'cradling', 'wielding', 'clutching'],
  turned: ['wheeled', 'swiveled', 'pivoted', 'shifted', 'faced'],
  notice: ['catch sight of', 'observe', 'spot', 'glimpse', 'discern', 'mark'],
};

const RESTRICTED_WORDS = [];

const WORD_GROUPS = [
  { name: 'written-record', words: ['ledger', 'tally', 'slate', 'register', 'chart', 'log', 'roster', 'tablet', 'dossier', 'manifest'] },
];

let target = path.resolve(__dirname, '..', 'web', 'mygame', 'scenes');
let top = 40;
let minCount = 5;
let clusterWindow = 8;
let updateBaseline = false;

for (const arg of process.argv.slice(2)) {
  if (arg === '--update-baseline') {
    updateBaseline = true;
    continue;
  }
  const [name, value] = arg.split('=');
  if (name === 'top') top = Number(value);
  else if (name === 'minCount') minCount = Number(value);
  else if (name === 'clusterWindow') clusterWindow = Number(value);
  else if (!arg.startsWith('--')) target = path.resolve(arg);
}

function collectScenes(targetPath) {
  if (!fs.existsSync(targetPath)) return [];
  const stat = fs.statSync(targetPath);
  if (stat.isFile()) return [targetPath];
  return fs
    .readdirSync(targetPath)
    .filter((f) => f.endsWith('.txt') || f.endsWith('.md'))
    .map((f) => path.join(targetPath, f));
}

const BOLD_BANNER_SPAN = /\[b\][\s\S]*?\[\/b\]/gi;
const BRACKET_SPAN = /\[[^\[\]]*\]/g;
const INTERP_SPAN = /\$\{[^}]*\}/g;
const MULTIREPLACE_SPAN = /@\{[^{}]*\}/g;
const WORD_RE = /[A-Za-z']+/g;

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
const stats = new Map();
let totalWords = 0;

for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    if (isBlank(raw)) continue;
    const trimmed = raw.trim();
    if (/^\*/.test(trimmed)) continue;

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

const candidates = [];
for (const [word, entry] of stats) {
  if (STOPWORDS.has(word)) continue;
  if (entry.total < minCount) continue;
  if (entry.lowercaseCount / entry.total < 0.5) continue;
  candidates.push({ word, ...entry });
}
candidates.sort((a, b) => b.total - a.total);

// --- Baseline & Trend Analysis --------------------------------------------
let baseline = {};
if (fs.existsSync(BASELINE_FILE)) {
  try {
    baseline = JSON.parse(fs.readFileSync(BASELINE_FILE, 'utf8'));
  } catch (e) {
    baseline = {};
  }
}

const trendAlerts = [];
if (Object.keys(baseline).length > 0) {
  for (const c of candidates.slice(0, top)) {
    const baseCount = baseline.counts ? baseline.counts[c.word] : null;
    if (baseCount === undefined || baseCount === null) {
      if (c.total >= 30) {
        trendAlerts.push({
          type: 'NEW_TOP',
          word: c.word,
          current: c.total,
          rate: ((c.total / totalWords) * 1000).toFixed(2),
          hasAlt: !!SUGGESTED_ALTERNATIVES[c.word],
        });
      }
    } else if (baseCount > 0) {
      const deltaPercent = Math.round(((c.total - baseCount) / baseCount) * 100);
      if (deltaPercent >= 25 && c.total - baseCount >= 8) {
        trendAlerts.push({
          type: 'SPIKE',
          word: c.word,
          previous: baseCount,
          current: c.total,
          deltaPercent,
          hasAlt: !!SUGGESTED_ALTERNATIVES[c.word],
        });
      }
    }
  }
}

// Auto-create or explicitly update baseline
if (updateBaseline || !fs.existsSync(BASELINE_FILE)) {
  const currentCounts = {};
  for (const c of candidates) {
    currentCounts[c.word] = c.total;
  }
  const snapshot = {
    updatedAt: new Date().toISOString(),
    totalWords,
    counts: currentCounts,
  };
  fs.writeFileSync(BASELINE_FILE, JSON.stringify(snapshot, null, 2), 'utf8');
}

console.log(`Scanned ${files.length} file(s), ${totalWords} word(s) of prose.\n`);

// --- Report 1: Trends & Spikes --------------------------------------------
if (trendAlerts.length > 0) {
  console.log(`📈 TREND & BASELINE ALERTS (${trendAlerts.length} detected against baseline):\n`);
  for (const t of trendAlerts) {
    if (t.type === 'SPIKE') {
      console.log(`  🚨 [SPIKE +${t.deltaPercent}%] "${t.word}" increased from ${t.previous} → ${t.current} uses.`);
    } else if (t.type === 'NEW_TOP') {
      console.log(`  ✨ [NEW TOP CRUTCH] "${t.word}" reached top overuse tier (${t.current} uses, ${t.rate}/1000 words).`);
    }
    if (!t.hasAlt) {
      console.log(`     ↳ Notice: No alternatives registered in SUGGESTED_ALTERNATIVES.`);
    } else {
      console.log(`     ↳ Try varying with: ${SUGGESTED_ALTERNATIVES[t.word].slice(0, 5).join(', ')}`);
    }
  }
  console.log('');
}

// --- Report 2: global overuse ------------------------------------------
console.log(`GLOBAL OVERUSE — top ${Math.min(top, candidates.length)} word(s) with ${minCount}+ uses, ranked by count:\n`);
for (const c of candidates.slice(0, top)) {
  const rate = ((c.total / totalWords) * 1000).toFixed(2);
  const topFiles = [...c.byFile.entries()]
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 3)
    .map(([f, lines]) => `${path.basename(f)} (${lines.length})`)
    .join(', ');
  
  console.log(`  ${c.word.padEnd(18)} ${String(c.total).padStart(4)}  (${rate}/1000 words)  ${topFiles}`);
  if (SUGGESTED_ALTERNATIVES[c.word]) {
    console.log(`    ↳ Try varying with: ${SUGGESTED_ALTERNATIVES[c.word].slice(0, 6).join(', ')}`);
  }
}

// --- Report 3: tight clusters --------------------------------------------
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
  const isHighEcho = c.lines.length >= 3;
  const tag = isHighEcho ? ' [WARNING: REPETITION ECHO]' : '';
  console.log(`  ${path.relative(process.cwd(), c.file)}:${c.lines.join(',')} "${c.word}" (${c.lines.length}x)${tag}`);
  if (SUGGESTED_ALTERNATIVES[c.word]) {
    console.log(`    ↳ Suggested alternatives: ${SUGGESTED_ALTERNATIVES[c.word].slice(0, 5).join(', ')}`);
  }
}
if (clusters.length > top) {
  console.log(`  ... and ${clusters.length - top} more (raise top= to see them all)`);
}

// --- Report 4: restricted words -------------------------------------------
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

// --- Report 5: word groups ------------------------------------------------
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

if (updateBaseline) {
  console.log(`\n[BASELINE UPDATED] Saved current word counts to ${path.relative(process.cwd(), BASELINE_FILE)}.`);
}

process.exit(0);
