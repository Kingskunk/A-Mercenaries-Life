#!/usr/bin/env node
/*
 * Report direct *goto / *goto_scene entries into a label containing *return
 * when the source has no known *gosub caller. A normal jump does not create
 * a return frame, so these paths can crash if reached during fresh play.
 * This is a review hint, not a control-flow proof: dynamic jumps and
 * indirect subroutine entry are intentionally outside this small check.
 * Usage: node tools/lint_unsafe_return.js [scene file or folder]
 * Report-only: always exits 0.
 */

const fs = require('fs');
const path = require('path');
const { collectSceneRelativePaths, collectSceneFiles } = require('./lib/collect_scene_files');

const scenesRoot = path.resolve(__dirname, '..', 'web', 'mygame', 'scenes');
const target = path.resolve(process.argv[2] || scenesRoot);
const labelPattern = /^\*label\s+([A-Za-z_]\w*)\b/i;
const returnPattern = /^\s*\*return\b/i;
const gosubPattern = /^\s*\*gosub\s+([A-Za-z_]\w*)\b/i;
const gosubScenePattern = /^\s*\*gosub_scene\s+([A-Za-z_][\w/]*)(?:\s+([A-Za-z_]\w*))?\b/i;
const gotoPattern = /^\s*\*goto\s+([A-Za-z_]\w*)\b/i;
const gotoScenePattern = /^\s*\*goto_scene\s+([A-Za-z_][\w/]*)(?:\s+([A-Za-z_]\w*))?\b/i;

function analyze(files, scannedFiles) {
  const segments = {};
  const callers = new Set();
  const jumps = new Map();
  for (const [file, lines] of Object.entries(files)) {
    let label = '';
    const byLabel = { '': { returns: false } };
    const atLine = [];
    lines.forEach((line) => {
      const match = labelPattern.exec(line);
      if (match) {
        // Labels inside a subroutine often split a loop into several
        // segments; execution can fall through without another gosub.
        if (!byLabel[label].returns) {
          const source = file + ':' + label;
          if (!jumps.has(source)) jumps.set(source, new Set());
          jumps.get(source).add(file + ':' + match[1].toLowerCase());
        }
        label = match[1].toLowerCase();
        byLabel[label] = { returns: false };
      }
      atLine.push(label);
      if (returnPattern.test(line)) byLabel[label].returns = true;
      if (/^\s*\*params\b/i.test(line)) callers.add(file + ':' + label);
      const localCall = gosubPattern.exec(line);
      if (localCall) callers.add(file + ':' + localCall[1].toLowerCase());
      const sceneCall = gosubScenePattern.exec(line);
      if (sceneCall) callers.add(sceneCall[1].toLowerCase() + '.txt:' + (sceneCall[2] || '').toLowerCase());
      const localJump = gotoPattern.exec(line);
      const sceneJump = gotoScenePattern.exec(line);
      if (localJump || sceneJump) {
        const source = file + ':' + label;
        const destination = localJump
          ? file + ':' + localJump[1].toLowerCase()
          : sceneJump[1].toLowerCase() + '.txt:' + (sceneJump[2] || '').toLowerCase();
        if (!jumps.has(source)) jumps.set(source, new Set());
        jumps.get(source).add(destination);
      }
    });
    segments[file] = { byLabel, atLine };
  }

  // A goto inside a gosub chain retains its caller's return frame. Follow
  // known jumps from each gosub entry so routine helper loops stay quiet.
  const inSubroutine = new Set(callers);
  const queue = Array.from(callers);
  for (let i = 0; i < queue.length; i++) {
    for (const next of jumps.get(queue[i]) || []) {
      if (inSubroutine.has(next)) continue;
      inSubroutine.add(next);
      queue.push(next);
    }
  }

  const warnings = [];
  for (const file of scannedFiles) {
    const lines = files[file];
    if (!lines || !segments[file]) continue;
    lines.forEach((line, index) => {
      const localJump = gotoPattern.exec(line);
      const sceneJump = gotoScenePattern.exec(line);
      if (!localJump && !sceneJump) return;
      const destinationFile = localJump ? file : sceneJump[1].toLowerCase() + '.txt';
      const destinationLabel = (localJump ? localJump[1] : sceneJump[2] || '').toLowerCase();
      const destination = segments[destinationFile] && segments[destinationFile].byLabel[destinationLabel];
      if (!destination || !destination.returns) return;
      const sourceLabel = segments[file].atLine[index];
      if (inSubroutine.has(file + ':' + sourceLabel)) return;
      warnings.push(`${file}:${index + 1}: ${line.trim()} enters ${destinationFile}:${destinationLabel || '(scene start)'}, which contains *return without a known caller`);
    });
  }
  return warnings;
}

if (require.main === module) {
  const files = {};
  for (const file of collectSceneRelativePaths(scenesRoot)) {
    files[file] = fs.readFileSync(path.join(scenesRoot, file), 'utf8').split(/\r?\n/);
  }
  const scannedFiles = collectSceneFiles(target).map((file) => path.relative(scenesRoot, file).split(path.sep).join('/'));
  const warnings = analyze(files, scannedFiles);
  if (warnings.length) warnings.forEach((warning) => console.log(warning));
  else console.log('No direct jumps into return labels found.');
  console.log(`${warnings.length} possible unsafe return path(s); review only.`);
}

module.exports = { analyze };
