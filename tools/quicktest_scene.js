#!/usr/bin/env node
/*
 * quicktest_scene.js - the quicktest on one scene file (or several), in seconds instead of the full game's several minutes.
 *
 *   node tools/quicktest_scene.js web/mygame/scenes/port_valen/radiant/hall_escort.txt [more files]
 *   node tools/quicktest_scene.js port_valen/radiant/hall_escort          (a scene name under scenes/ works too)
 *
 * It runs `node quicktest.js mygame <scene> ...`. A focused run walks only the scenes named, but it enters them the way the full game does: every label another scene jumps or calls
 * into is walked too (autotest.js scans every scene file for those entry labels), so a scene that is only ever reached at a label is covered, not skipped. What it does not do is walk
 * the scenes that call yours, so a change that breaks a CALLER (a label renamed, a *params changed) still needs the full `node quicktest.js` before a commit.
 * `--all` runs the whole game's quicktest instead (several minutes), always from the project folder.
 * Exit code 1 when the run fails.
 */
const path = require('path');
const cp = require('child_process');

const root = path.resolve(__dirname, '..');
const scenesRoot = path.join(root, 'web', 'mygame', 'scenes');
if (process.argv[2] === '--all') {
  // the whole game (several minutes); the editor extension's "Run Quicktest (all scenes)" calls this so the run always starts in the project folder
  const all = cp.spawnSync(process.execPath, ['quicktest.js'], { cwd: root, stdio: 'inherit' });
  process.exit(all.status === null ? 1 : all.status);
}
const scenes = process.argv.slice(2).map((a) => {
  const abs = path.isAbsolute(a) ? a : (/^web[\\/]/.test(a) ? path.join(root, a) : path.join(scenesRoot, a));
  return path.relative(scenesRoot, abs).replace(/\\/g, '/').replace(/\.txt$/, '');
});
if (!scenes.length || scenes.some((s) => s.startsWith('..'))) {
  console.error('Give one or more scene files under web/mygame/scenes/ (or scene names such as port_valen/radiant/hall_escort).');
  process.exit(2);
}
const r = cp.spawnSync(process.execPath, ['quicktest.js', 'mygame', ...scenes], { cwd: root, stdio: 'inherit' });
process.exit(r.status === null ? 1 : r.status);
