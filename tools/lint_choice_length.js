#!/usr/bin/env node
/*
 * lint_choice_length.js - finds choice buttons that are too long to sit on one line.
 *
 * A button that wraps onto a second line is harder to scan, and the player stops being able to tell at a glance where
 * each one leads. The Port Valen hubs avoid it with a short bold place name, a colon, one short clause and the time:
 *
 *     # [b]Cargo Quay[/b]: walk to the customs tower, where the dockmaster logs every hull. [~5 min]
 *
 * What it measures: the text the player sees on the button, in characters (the screen wraps by width, not by word
 * count). Markup is removed first: [b]/[i] tags, and the tags and conditions of @{...} (the longest option is counted).
 * A ${...} interpolation counts as the longest text the file ever sets into that variable (*set name "text"), which is how the
 * stat hints are filled in. If the file never sets it to a plain string it is a guess: 12 characters, or 60 for a name with "hint". The bracketed hint written straight into the
 * button, such as [Lyra Bond / Dialogue / Advantage on Gatehouse Melee], is counted: the player reads it.
 *
 * Two signals, both advisory:
 *   long     the button is over the limit (default 100 characters, about one line on the game screen)
 *   hint     the bracketed hint alone is over 65 characters, so it is the part to trim first
 *
 * Usage:
 *   node tools/lint_choice_length.js [path] [max=100] [hintmax=65] [show=40]
 *
 *   path - optional single file or directory to lint (default: web/mygame/scenes/)
 *
 * Skipped: combat buttons (a different rule, 15 words, tools/lint_choice_labels.js), the developer menu, and the level-up
 * pick lists in character_progression.txt, where a spell name plus its description is the point of the menu.
 * Report-only: always exits 0. On a directory it also prints a per-file table, most over-long buttons first.
 */

const fs = require('fs');
const path = require('path');

const opts = { max: 100, hintmax: 65, show: 40 };
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

const { collectSceneFiles: collectScenes } = require('./lib/collect_scene_files');

// Files whose buttons follow the combat rule instead, the developer menu, and the level-up pick lists (a spell or feature
// name followed by its description is the point of those menus).
const SKIP_FILES = /(^|[\\/])(combat[a-z_]*|dev_hub|dungeon|character_progression)\.txt$/i;

// The button text of a choice line, or null when the line is not a choice. Handles the option prefixes
// (*selectable_if (...) #text, *hide_reuse #text, *disable_reuse #text, *allow_reuse #text).
function buttonText(line) {
  const t = line.trim();
  if (/^#\s/.test(t) || t === '#') return t.slice(1).trim();
  if (/^\*(hide_reuse|disable_reuse|allow_reuse)\s+#\s/.test(t)) return t.replace(/^\*[a-z_]+\s+#\s*/, '');
  if (/^\*selectable_if\b/.test(t)) {
    const i = t.lastIndexOf(') #');
    return i >= 0 ? t.slice(i + 3).trim() : null;
  }
  return null;
}

// Expands every @{condition first|second} to its longest option. Conditions can hold nested parentheses and the
// options can hold nested @{...}, so this walks the braces instead of using one pattern.
function expandInline(text) {
  let out = '';
  let i = 0;
  while (i < text.length) {
    if (text[i] === '@' && text[i + 1] === '{') {
      let pos = i + 2;
      while (text[pos] === ' ') pos++;
      if (text[pos] === '(') {
        let depth = 0;
        do {
          if (text[pos] === '(') depth++;
          if (text[pos] === ')') depth--;
          pos++;
        } while (pos < text.length && depth > 0);
      } else {
        while (pos < text.length && !/[\s}]/.test(text[pos])) pos++;
      }
      let depth = 1;
      const start = pos;
      while (pos < text.length && depth > 0) {
        if (text[pos] === '{') depth++;
        if (text[pos] === '}') depth--;
        pos++;
      }
      const body = text.slice(start, pos - 1);
      const options = [];
      let cur = '';
      let d = 0;
      for (const ch of body) {
        if (ch === '{') d++;
        if (ch === '}') d--;
        if (ch === '|' && d === 0) { options.push(cur); cur = ''; } else cur += ch;
      }
      options.push(cur);
      const expanded = options.map((o) => expandInline(o).trim()).sort((x, y) => y.length - x.length);
      out += expanded[0] || '';
      i = pos;
    } else {
      out += text[i];
      i++;
    }
  }
  return out;
}

// What the player sees: the longest option of each @{...}, no tags. A ${...} stands for the longest text the file ever
// puts in that variable with *set name "text" (the real hint), or, when the file never sets it to a plain string, a guess:
// 12 characters, or 60 for a name containing "hint".
function rendered(text, varLengths) {
  let out = expandInline(text);
  out = out.replace(/\$\{([^}]*)\}/g, (m, name) => {
    const known = varLengths && varLengths[name.trim()];
    return 'x'.repeat(known || (/hint/i.test(name) ? 60 : 12));
  });
  out = out.replace(/\[\/?[bi]\]/g, '').replace(/\*\*/g, '');
  return out.replace(/\s+/g, ' ').trim();
}

// The longest plain string each variable is set to anywhere in the file: *set name "text".
function stringLengths(lines) {
  const longest = {};
  for (const line of lines) {
    const m = line.match(/^\s*\*set\s+(\w+)\s+"([^"]*)"\s*$/);
    if (m && m[2].length > (longest[m[1]] || 0)) longest[m[1]] = m[2].length;
  }
  return longest;
}

// The last [bracketed hint] of the visible text, or ''.
function bracketHint(text) {
  const m = text.match(/\[[^\[\]]*\]\s*$/);
  return m ? m[0] : '';
}

function analyse(file) {
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  const found = [];
  const varLengths = stringLengths(lines);
  let buttons = 0;
  for (let i = 0; i < lines.length; i++) {
    const raw = buttonText(lines[i]);
    if (raw === null || raw === '') continue;
    buttons++;
    const shown = rendered(raw, varLengths);
    const hint = bracketHint(shown);
    const problems = [];
    if (shown.length > opts.max) problems.push('long');
    if (hint.length > opts.hintmax) problems.push('hint');
    if (problems.length) found.push({ line: i + 1, length: shown.length, hintLength: hint.length, problems, text: raw });
  }
  return { file, buttons, found };
}

const files = collectScenes(target).filter((f) => !SKIP_FILES.test(f));
const results = files.map(analyse);
const single = files.length === 1;
const rel = (f) => path.relative(process.cwd(), f);

if (!single) {
  console.log(`Long choice buttons per file (limit ${opts.max} characters), most first:\n`);
  results
    .filter((r) => r.found.length)
    .sort((a, b) => b.found.length - a.found.length)
    .slice(0, 30)
    .forEach((r) => {
      console.log(`  ${path.basename(r.file).padEnd(40)} ${String(r.found.length).padStart(4)} of ${String(r.buttons).padStart(4)} buttons`);
    });
  console.log('');
}

let flaggedFiles = 0;
let flaggedButtons = 0;
for (const r of results) {
  if (!r.found.length) {
    if (single) console.log(`${rel(r.file)}: ${r.buttons} button(s), none over ${opts.max} characters. OK.`);
    continue;
  }
  flaggedFiles++;
  flaggedButtons += r.found.length;
  console.log(`${rel(r.file)}: ${r.found.length} of ${r.buttons} button(s) too long`);
  r.found
    .sort((a, b) => b.length - a.length)
    .slice(0, opts.show)
    .forEach((p) => {
      const note = p.problems.includes('hint') ? ` (hint ${p.hintLength})` : '';
      console.log(`    line ${p.line}: ${p.length} chars${note} - ${p.text.slice(0, 110)}${p.text.length > 110 ? '...' : ''}`);
    });
}

if (!single) {
  console.log(flaggedFiles
    ? `\n${flaggedButtons} button(s) in ${flaggedFiles} file(s) flagged (advisory).`
    : '\nNo buttons flagged.');
}
process.exit(0);
