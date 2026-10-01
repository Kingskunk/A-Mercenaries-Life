// Shared recursive scene-file collector (2026-09-30, scenes/ subfolder support). web/mygame/scenes/ can now
// contain subdirectories (see quest/GAMEPLAY_MECHANICS_RULES.md's scenes/ subfolder note); every lint tool used
// to do its own flat, non-recursive fs.readdirSync().filter(f => f.endsWith('.txt')), which doesn't crash on a
// subfolder but silently never looks inside it -- a scene moved into one goes dark to every one of these tools
// at once. One real recursive walk here, required by each tool instead of re-implemented, so this only needs
// fixing (or extending) in one place.
var fs = require("fs");
var path = require("path");

// Returns every file under `target` matching one of `extensions` (default just ".txt"), recursing into
// subdirectories. If `target` is itself a file, returns just that file regardless of extension (matches every
// existing collectScenes' single-file behavior, e.g. `node lint_x.js one_scene.txt`). A couple of callers
// (lint_weapon_assumption.js, lint_vocab_overuse.js) also scan ".md" docs outside scenes/, hence the param
// rather than hardcoding ".txt".
function collectSceneFiles(target, extensions) {
  extensions = extensions || [".txt"];
  if (!fs.existsSync(target)) return [];
  var stat = fs.statSync(target);
  if (stat.isFile()) return [target];
  var results = [];
  (function walk(dir) {
    var entries = fs.readdirSync(dir);
    for (var i = 0; i < entries.length; i++) {
      var entryPath = path.join(dir, entries[i]);
      if (fs.statSync(entryPath).isDirectory()) {
        walk(entryPath);
      } else if (extensions.some(function (ext) { return entries[i].endsWith(ext); })) {
        results.push(entryPath);
      }
    }
  })(target);
  return results;
}

// Same walk, but keyed by path RELATIVE TO `target` (e.g. "port_valen/port_valen_dredge_end.txt") rather than a
// bare basename -- for a tool that indexes files by name (lint_gosub_arity.js, lint_blank_landing.js's second
// copy) a bare basename would collide the moment two different subfolders ever contain a same-named file. Keys
// use "/" even on Windows, matching how a scene name is written in *goto_scene/*gosub_scene.
function collectSceneRelativePaths(target) {
  return collectSceneFiles(target).map(function (p) {
    return path.relative(target, p).split(path.sep).join("/");
  });
}

module.exports = { collectSceneFiles: collectSceneFiles, collectSceneRelativePaths: collectSceneRelativePaths };
