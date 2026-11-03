#!/usr/bin/env node
/*
 * quicktest_parallel.js -- the game's quicktest split across every CPU core, or run on just the scenes a change touched.
 *
 *   node tools/quicktest_parallel.js                    every scene the full quicktest walks, spread over all cores
 *   node tools/quicktest_parallel.js --since-pass       only the scenes whose text changed since they last PASSED here, plus every scene that jumps or calls
 *                                                       into one. Needs no git: it compares the files with a note this tool saves after each passing run.
 *   node tools/quicktest_parallel.js --changed          only the scenes changed since main in git (committed or not), plus their callers
 *   node tools/quicktest_parallel.js --changed=<ref>    the same, against another branch or commit
 *   node tools/quicktest_parallel.js --jobs=2 [...]     run 2 scenes at a time instead of one per core
 *   node tools/quicktest_parallel.js combat combat_types   just these scenes, spread over the cores (the same as quicktest_scene.js, faster for several)
 *
 * WHY: the quicktest walks each scene on its own, so the scenes can be tested side by side. One `node quicktest.js` walks all ~190 one after
 * another on a single core and takes many minutes; this splits the same scenes across the cores. --changed is the everyday check: a commit that
 * touches two scenes only needs those two and their callers (a caller breaks when a label it jumps to is renamed or its *params change).
 *
 * HOW: it finds the scenes the full run would walk the same way autotest.js does (startup's *scene_list and every *goto_scene, *gosub_scene and
 * *save_game, followed from startup) and runs each scene as its own ordinary focused `node quicktest.js mygame <scene>` (see autotest.js FOCUSED
 * RUN: it still learns every label any scene jumps into, so a scene entered only at a label is walked there), one per core at a time, the slowest
 * first (each scene's time is remembered in tools/.quicktest-times.json). Every job also walks startup first, for its *create lines; that takes under a second.
 * A change to startup (or startup_parts/) can affect any scene, so --changed then tests everything.
 * Each scene's full output goes to a log file, named in the summary. Exit code 1 when any worker fails.
 * After a run passes, the tool notes a fingerprint of every scene it tested (and startup) in tools/.quicktest-pass.json (git ignores it); a failed run notes
 * nothing, so --since-pass keeps re-testing a scene until it passes. With no note yet, --since-pass tests every scene once.
 */
"use strict";
const fs = require("fs");
const os = require("os");
const path = require("path");
const cp = require("child_process");
const crypto = require("crypto");

const ROOT = path.resolve(__dirname, "..");
const SCENES = path.join(ROOT, "web", "mygame", "scenes");

// ---------------------------------------------------------------- arguments
let jobs = os.cpus().length || 2;
let changedBase = null;
let sincePass = false;
const PASS_FILE = path.join(__dirname, ".quicktest-pass.json");
const named = [];
process.argv.slice(2).forEach((a) => {
  let m;
  if ((m = a.match(/^--jobs=(\d+)$/))) jobs = Math.max(1, +m[1]);
  else if (a === "--since-pass") sincePass = true;
  else if (a === "--changed") changedBase = "";
  else if ((m = a.match(/^--changed=(.+)$/))) changedBase = m[1];
  else if (a === "--help" || a === "-h") { console.log(fs.readFileSync(__filename, "utf8").split("*/")[0]); process.exit(0); }
  else if (a.startsWith("-")) { console.error("Unknown option: " + a); process.exit(2); }
  else named.push(a.replace(/\\/g, "/").replace(/^web\/mygame\/scenes\//, "").replace(/\.txt$/, ""));
});

// ---------------------------------------------------------------- the scenes a full run walks
function read(scene) { return fs.readFileSync(path.join(SCENES, scene + ".txt"), "utf8"); }
function exists(scene) { return fs.existsSync(path.join(SCENES, scene + ".txt")); }
// The scenes one scene jumps or calls into, read the way autotest.js reads them (a name built from a variable cannot be followed).
function targetsOf(text) {
  const out = [];
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const r = /^\s*\*(\w+)\s*(.*)/.exec(lines[i]);
    if (!r) continue;
    const cmd = r[1].toLowerCase(), data = r[2].trim();
    if (cmd === "goto_scene" || cmd === "gosub_scene") {
      if (!/[\[\{]/.test(data)) { const m = /^(\S+)/.exec(data); if (m) out.push(m[1]); }
    } else if (cmd === "save_game" && data) {
      out.push(data);
    } else if (cmd === "scene_list") {
      for (let j = i + 1; j < lines.length; j++) {
        if (!lines[j].trim()) continue;
        if (!/^\s/.test(lines[j])) break;
        out.push(lines[j].trim().replace(/^\$\w*\s+/, ""));
      }
    }
  }
  return out;
}
function reachable() {
  const seen = new Set(["startup"]);
  const queue = ["startup"];
  while (queue.length) {
    const s = queue.shift();
    if (!exists(s)) continue;
    targetsOf(read(s)).forEach((t) => { if (!seen.has(t)) { seen.add(t); queue.push(t); } });
  }
  return [...seen];
}
const all = reachable();
// A scene's fingerprint: its text, with Windows line endings read as plain ones so a checkout on either system matches.
function fingerprint(scene) {
  return crypto.createHash("sha1").update(read(scene).replace(/\r\n/g, "\n")).digest("hex");
}
function readPassNote() {
  try { return JSON.parse(fs.readFileSync(PASS_FILE, "utf8")).scenes || {}; } catch (e) { return {}; }
}
function callersOf(changed) {
  return all.filter((s) => !changed.has(s) && exists(s) && targetsOf(read(s)).some((t) => changed.has(t)));
}

// ---------------------------------------------------------------- which scenes to test
let scenes;
let why;
if (named.length) {
  scenes = named;
  why = "the scenes named";
} else if (sincePass) {
  const note = readPassNote();
  if (!Object.keys(note).length) {
    scenes = all;
    why = "no passing run noted yet, so every scene is tested once";
  } else if (note.startup !== fingerprint("startup")) {
    scenes = all;
    why = "startup changed since its last pass, which can affect every scene";
  } else {
    const changed = new Set(all.filter((s) => s !== "startup" && exists(s) && note[s] !== fingerprint(s)));
    const callers = callersOf(changed);
    scenes = [...changed].concat(callers);
    why = changed.size + " scene(s) changed since they last passed" + (changed.size ? " (" + [...changed].slice(0, 8).join(", ") + (changed.size > 8 ? ", and " + (changed.size - 8) + " more" : "") + ")" : "") +
      ", plus " + callers.length + " that jump or call into them";
  }
} else if (changedBase !== null) {
  const git = (args) => {
    try { return cp.execFileSync("git", args, { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim(); }
    catch (e) { console.error("--changed needs git and a git checkout of the game (" + String(e.message).split("\n")[0] + ").\nUse --since-pass instead: it needs no git."); process.exit(2); }
  };
  let base = changedBase;
  if (!base) {
    base = ["origin/main", "main", "origin/master", "master"].find((b) => { try { git(["rev-parse", "--verify", "-q", b]); return true; } catch (e) { return false; } });
    if (!base) { console.error("--changed: no main branch found; name one with --changed=<ref>"); process.exit(2); }
  }
  const mergeBase = git(["merge-base", "HEAD", base]);
  const files = new Set(git(["diff", "--name-only", mergeBase, "--", "web/mygame/scenes"]).split("\n")
    .concat(git(["ls-files", "--others", "--exclude-standard", "--", "web/mygame/scenes"]).split("\n")).filter(Boolean));
  const changed = new Set();
  let startupChanged = false;
  files.forEach((f) => {
    if (!/\.txt$/.test(f)) return;
    const rel = path.relative(SCENES, path.join(ROOT, f)).replace(/\\/g, "/").replace(/\.txt$/, "");
    if (rel === "startup" || rel.startsWith("startup_parts/")) startupChanged = true;
    else changed.add(rel);
  });
  if (startupChanged) {
    scenes = all;
    why = "startup changed since " + base + ", which can affect every scene";
  } else {
    const callers = callersOf(changed);
    scenes = [...changed].filter(exists).concat(callers);
    why = changed.size + " scene(s) changed since " + base + (changed.size ? " (" + [...changed].slice(0, 8).join(", ") + (changed.size > 8 ? ", and " + (changed.size - 8) + " more" : "") + ")" : "") +
      ", plus " + callers.length + " that jump or call into them";
  }
} else {
  scenes = all;
  why = "every scene the full quicktest walks";
}
scenes = scenes.filter((s) => s !== "startup");
const missing = scenes.filter((s) => !exists(s));
if (missing.length) { console.error("No such scene file(s): " + missing.join(", ")); process.exit(2); }
if (!scenes.length) { console.log("Nothing to test: " + why + "."); process.exit(0); }

// ---------------------------------------------------------------- a queue: each scene is one job, the next free core takes the next one
// Slowest first, so a long scene never starts last. A scene's time comes from earlier runs (tools/.quicktest-times.json, git ignores it);
// a scene never timed counts by its size, at a rough rate measured on this game.
const TIMES_FILE = path.join(__dirname, ".quicktest-times.json");
let times = {};
try { times = JSON.parse(fs.readFileSync(TIMES_FILE, "utf8")).seconds || {}; } catch (e) { times = {}; }
const size = (s) => fs.statSync(path.join(SCENES, s + ".txt")).size;
const guess = (s) => (times[s] !== undefined ? times[s] : size(s) / 20000);
const queue = scenes.slice().sort((a, b) => guess(b) - guess(a));
jobs = Math.min(jobs, scenes.length);

// ---------------------------------------------------------------- run
const logDir = fs.mkdtempSync(path.join(os.tmpdir(), "quicktest-"));
const started = Date.now();
console.log("Quicktest: " + scenes.length + " scene(s), " + why + "; " + jobs + " at a time. Logs: " + logDir);
const results = [];
let done = 0;
function runOne(scene) {
  return new Promise((resolve) => {
    const log = path.join(logDir, scene.replace(/\//g, "__") + ".log");
    const out = fs.openSync(log, "w");
    const t0 = Date.now();
    const child = cp.spawn(process.execPath, ["quicktest.js", "mygame", scene], { cwd: ROOT, stdio: ["ignore", out, out] });
    child.on("close", (code) => {
      fs.closeSync(out);
      const text = fs.readFileSync(log, "utf8");
      const secs = (Date.now() - t0) / 1000;
      const passed = code === 0 && /QUICKTEST PASSED/.test(text);
      done++;
      if (!passed || secs >= 30) console.log("  [" + done + "/" + scenes.length + "] " + scene + ": " + (passed ? "passed" : "FAILED") + " in " + Math.round(secs) + "s");
      results.push({ scene, log, text, passed, secs });
      resolve();
    });
  });
}
function worker() { const s = queue.shift(); return s === undefined ? Promise.resolve() : runOne(s).then(worker); }

Promise.all(Array.from({ length: jobs }, worker)).then(() => {
  const untested = new Set();
  const warnings = new Set();
  const failures = [];
  results.forEach((r) => {
    times[r.scene] = Math.round(r.secs * 10) / 10;
    const lines = r.text.split("\n");
    lines.forEach((l) => {
      if (/ UNTESTED /.test(l)) untested.add(l.trim());
      else if (/WARNING /.test(l)) warnings.add(l.trim());
    });
    if (!r.passed) {
      const at = lines.findIndex((l) => /QUICKTEST FAILED/.test(l));
      const msg = at < 0 ? lines.filter(Boolean).slice(-5).join("\n    ") : lines.slice(at + 1).filter(Boolean).slice(0, 5).join("\n    ");
      failures.push(r.scene + ":\n    " + msg + "\n    (full output: " + r.log + ")");
    }
  });
  try { fs.writeFileSync(TIMES_FILE, JSON.stringify({ readme: "Seconds each scene's quicktest took, written by tools/quicktest_parallel.js to start the slowest first. Safe to delete.", seconds: times }, null, 1) + "\n"); } catch (e) {}
  // The full run also lists scene files nobody reaches; only a run over every scene can say that.
  if (!named.length && scenes.length + 1 === all.length) {
    fs.readdirSync(SCENES).filter((f) => /\.txt$/.test(f) && all.indexOf(f.replace(/\.txt$/, "")) === -1)
      .forEach((f) => untested.add("UNTESTED " + f + " (no scene reaches it)"));
  }
  if (untested.size) {
    console.log("\nUntested lines (" + untested.size + "):");
    [...untested].sort().forEach((l) => console.log("  " + l));
  }
  if (warnings.size) {
    console.log("\nWarnings (" + warnings.size + "):");
    [...warnings].sort().forEach((l) => console.log("  " + l));
  }
  const secs = Math.round((Date.now() - started) / 1000);
  const slowest = results.slice().sort((a, b) => b.secs - a.secs).slice(0, 5).map((r) => r.scene + " " + Math.round(r.secs) + "s").join(", ");
  if (failures.length) {
    console.log("\nQUICKTEST FAILED in " + secs + "s (" + failures.length + " scene(s)):\n  " + failures.join("\n  "));
    process.exit(1);
  }
  // Note what passed, for --since-pass. Every job walked startup too, so it passed as well.
  let note = readPassNote();
  // Under a changed startup, only the scenes this run walked are known to pass.
  if (note.startup !== fingerprint("startup")) note = {};
  scenes.concat(["startup"]).forEach((s) => { note[s] = fingerprint(s); });
  try {
    fs.writeFileSync(PASS_FILE, JSON.stringify({ readme: "Written by tools/quicktest_parallel.js after each passing run; read by --since-pass. Safe to delete.", scenes: note }, null, 1) + "\n");
  } catch (e) { console.log("(could not save the pass note: " + e.message + ")"); }
  console.log("\nQUICKTEST PASSED: " + scenes.length + " scene(s) in " + secs + "s, " + jobs + " at a time. Slowest: " + slowest + ".");
});
