#!/usr/bin/env node
/*
 * lint_dead_space.js - flags source patterns that print an empty line the author did not mean (the "dead space"
 * between two paragraphs on the page).
 *
 * How the engine makes it. A blank line in a scene file ends the paragraph being built. *line_break adds a [n/]
 * to the paragraph being built, but when there is none (the one before it was just ended) it prints a bare empty
 * line instead (web/scene.js line_break). So a *line_break straight after a blank line, after another
 * *line_break, or after a *gosub whose label ended its paragraph, shows as a gap with nothing in it. The Wagon
 * Escort road page had the last kind: the sky label ended its paragraph, and the *line_break under the call made two.
 *
 * What it flags (a candidate list for a human, not a verdict):
 *   BLANK ABOVE   a *line_break whose nearest line above (comments skipped) is blank: an empty line is printed.
 *   DOUBLE        two *line_break in a row: the second one makes an empty line.
 *   TRAILING      a *line_break right above a blank line or a *page_break: nothing follows it to break from.
 *
 * It cannot follow a *gosub into the label it calls, or see what a ${variable} holds, so a gap that comes from either is
 * not found here. For those, scripted_play.js reports every *line_break that printed an empty line while a page was
 * actually played ("!! DEAD SPACE"), which is the check to run on a new page.
 *
 * Usage:
 *   node tools/lint_dead_space.js [path]      path: a scene file or a folder (default web/mygame/scenes/)
 *
 * Report-only: always exits 0.
 */

const fs = require('fs');
const path = require('path');
const { collectSceneFiles, collectSceneRelativePaths } = require('./lib/collect_scene_files');

const scenesRoot = path.resolve(__dirname, '..', 'web', 'mygame', 'scenes');
const target = process.argv[2] ? path.resolve(process.argv[2]) : scenesRoot;

const LINE_BREAK = /^\s*\*line_break\b/;
const COMMENT = /^\s*\*comment\b/;
const PAGE_BREAK = /^\s*\*page_break\b/;
const isBlank = (l) => l.trim() === '';

const files = collectSceneFiles(target);
let total = 0;
for (const file of files) {
  const rel = path.relative(scenesRoot, file).replace(/\\/g, '/').replace(/\.txt$/, '');
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  const found = [];
  lines.forEach((line, i) => {
    if (!LINE_BREAK.test(line)) return;
    let above = i - 1;
    while (above >= 0 && COMMENT.test(lines[above])) above--;
    let below = i + 1;
    while (below < lines.length && COMMENT.test(lines[below])) below++;
    if (above < 0) return;
    if (isBlank(lines[above])) {
      found.push([i + 1, 'BLANK ABOVE', 'a blank line ends the paragraph, so this prints an empty line']);
    } else if (LINE_BREAK.test(lines[above])) {
      found.push([i + 1, 'DOUBLE', 'a second *line_break in a row prints an empty line']);
    }
    if (below < lines.length && (isBlank(lines[below]) || PAGE_BREAK.test(lines[below]))) {
      found.push([i + 1, 'TRAILING', 'nothing follows this *line_break on the same paragraph']);
    }
  });
  if (found.length) {
    console.log(path.relative(process.cwd(), file));
    found.forEach(([n, kind, why]) => console.log('  ' + path.relative(process.cwd(), file) + ':' + n + ' [' + kind + '] ' + why));
    total += found.length;
  }
}
console.log(total ? total + ' line(s) that may print an empty line (a candidate list, not errors).' : 'No *line_break dead space found.');
