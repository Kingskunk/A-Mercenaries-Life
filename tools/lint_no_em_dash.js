#!/usr/bin/env node
/*
 * lint_no_em_dash.js - flags every em dash (—) in player-facing prose and choice lines.
 * The user created this lint to avoid em dashes; every hit should be fixed immediately
 * with either a comma or rephrasing to avoid the use of an em dash.
 *
 * Usage:
 *   node tools/lint_no_em_dash.js [path]
 *
 *   path - optional single file or directory to lint (default: web/mygame/scenes/)
 */

const fs = require('fs');
const path = require('path');
const { collectSceneFiles: collectScenes } = require('./lib/collect_scene_files');

let target = null;
process.argv.slice(2).forEach((a) => {
  if (!/^\w+=/.test(a) && !target) {
    target = path.resolve(a);
  }
});
if (!target) target = path.resolve(__dirname, '..', 'web', 'mygame', 'scenes');

const EM_DASH = '—';
const files = collectScenes(target);

let totalHits = 0;
let flaggedFiles = 0;

for (const file of files) {
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  const hits = [];
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (trimmed === '' || /^\*/.test(trimmed)) continue;
    if (trimmed.includes(EM_DASH)) {
      hits.push({ line: i + 1, text: trimmed });
    }
  }
  if (hits.length > 0) {
    flaggedFiles++;
    totalHits += hits.length;
    const rel = path.relative(process.cwd(), file);
    console.log(
      `WARNING [${rel}]: ${hits.length} em dash(es) detected. The user created this lint to avoid em dashes; this error should immediately be fixed with either a comma or rephrasing to avoid the use of an em dash.`
    );
    for (const h of hits) {
      console.log(`  line ${h.line}: ${h.text.slice(0, 100)}`);
    }
  }
}

if (totalHits === 0) {
  console.log(`Scanned ${files.length} file(s). No em dashes detected.`);
} else {
  console.log(`\n${totalHits} em dash warning(s) across ${flaggedFiles} of ${files.length} file(s).`);
}
process.exit(0);
