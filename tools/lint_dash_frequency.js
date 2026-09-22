#!/usr/bin/env node
/*
 * lint_dash_frequency.js - reports how often em dashes appear in player-facing prose, and
 * where they cluster. Punctuation habits are easy to overdo without noticing, and a dash is
 * fine now and then; the problem is a passage where nearly every sentence leans on one.
 *
 * Only prose is counted. Command lines (*set, *if, *comment, ...) are skipped, and the words
 * inside [bracketed hints], [b]...[/b] banners and ${...} interpolations don't count toward
 * the total either, the same conventions the other linters use.
 *
 * Three signals, all advisory:
 *   rate     dashes per 1000 words of prose in the whole file (default limit 3.0)
 *   line     a single prose line holding several dashes (default 3 or more)
 *   window   a run of consecutive prose lines holding many dashes (default 4 or more in 10)
 *
 * Usage:
 *   node tools/lint_dash_frequency.js [path] [rate=3] [line=3] [window=4] [span=10] [show=8]
 *
 *   path - optional single file or directory to lint (default: web/mygame/scenes/)
 *
 * Report-only: always exits 0. On a directory it also prints a per-file table, densest first.
 */

const fs = require('fs');
const path = require('path');

const opts = { rate: 3, line: 3, window: 4, span: 10, show: 8 };
let target = null;
process.argv.slice(2).forEach((a) => {
  const m = /^(\w+)=(.*)$/.exec(a);
  if (m) {
    if (m[1] in opts) opts[m[1]] = parseFloat(m[2]);
  } else if (!target) {
    target = path.resolve(a);
  }
});
if (!target) target = path.resolve(__dirname, '..', 'web', 'mygame', 'scenes');

const EM = '—';
const BOLD_BANNER_SPAN = /\[b\][\s\S]*?\[\/b\]/gi;
const BRACKET_SPAN = /\[[^\[\]]*\]/g;
const INTERP_SPAN = /\$\{[^}]*\}/g;

function collectScenes(t) {
  const stat = fs.statSync(t);
  if (stat.isFile()) return [t];
  return fs.readdirSync(t).filter((f) => f.endsWith('.txt')).map((f) => path.join(t, f));
}

function analyse(file) {
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  const prose = []; // { line, dashes, words, text }
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (trimmed === '' || /^\*/.test(trimmed)) continue;
    const stripped = trimmed.replace(BOLD_BANNER_SPAN, ' ').replace(BRACKET_SPAN, ' ').replace(INTERP_SPAN, ' ');
    const dashes = (stripped.match(new RegExp(EM, 'g')) || []).length;
    const words = stripped.split(/\s+/).filter(Boolean).length;
    prose.push({ line: i + 1, dashes, words, text: trimmed });
  }
  const totalDashes = prose.reduce((n, p) => n + p.dashes, 0);
  const totalWords = prose.reduce((n, p) => n + p.words, 0);
  const rate = totalWords ? (totalDashes * 1000) / totalWords : 0;

  const heavyLines = prose.filter((p) => p.dashes >= opts.line);

  // sliding window over consecutive prose lines
  const windows = [];
  let lastEnd = -1;
  for (let s = 0; s < prose.length; s++) {
    const slice = prose.slice(s, s + opts.span);
    const d = slice.reduce((n, p) => n + p.dashes, 0);
    if (d >= opts.window && s > lastEnd) {
      windows.push({ from: slice[0].line, to: slice[slice.length - 1].line, dashes: d });
      lastEnd = s + opts.span - 1;
    }
  }
  return { file, totalDashes, totalWords, rate, heavyLines, windows };
}

const files = collectScenes(target);
const results = files.map(analyse);
const single = files.length === 1;

if (!single) {
  console.log('Em dash frequency per file (dashes per 1000 words of prose), densest first:\n');
  results
    .slice()
    .sort((a, b) => b.rate - a.rate)
    .forEach((r) => {
      const flag = r.rate > opts.rate ? '  <-- over limit' : '';
      console.log(`  ${path.basename(r.file).padEnd(34)} ${String(r.totalDashes).padStart(4)} dashes / ${String(r.totalWords).padStart(6)} words = ${r.rate.toFixed(1).padStart(5)}${flag}`);
    });
  console.log('');
}

let flagged = 0;
for (const r of results) {
  const problems = [];
  if (r.rate > opts.rate) problems.push(`rate ${r.rate.toFixed(1)} per 1000 words (limit ${opts.rate})`);
  if (r.heavyLines.length) problems.push(`${r.heavyLines.length} line(s) with ${opts.line}+ dashes`);
  if (r.windows.length) problems.push(`${r.windows.length} dense run(s) of ${opts.window}+ dashes in ${opts.span} lines`);
  if (!problems.length) {
    if (single) console.log(`${path.relative(process.cwd(), r.file)}: ${r.totalDashes} dash(es) in ${r.totalWords} words (${r.rate.toFixed(1)} per 1000). OK.`);
    continue;
  }
  flagged++;
  console.log(`${path.relative(process.cwd(), r.file)}: ${problems.join('; ')}`);
  r.heavyLines.slice(0, opts.show).forEach((p) => console.log(`    line ${p.line}: ${p.dashes} dashes - ${p.text.slice(0, 90)}`));
  r.windows.slice(0, opts.show).forEach((w) => console.log(`    lines ${w.from}-${w.to}: ${w.dashes} dashes`));
}

if (!single) console.log(flagged ? `\n${flagged} file(s) flagged (advisory).` : '\nNo files flagged.');
process.exit(0);
