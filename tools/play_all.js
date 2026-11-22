// play_all.js -- run many play scripts at once, several at a time, and report only what failed (2026-11-15).
//
// WHY: tools/scripted_play.js runs one script. A regression over the folder was a shell loop, one script after another, and the folder holds over 1,600.
// This starts one scripted_play.js process per script, as many at a time as the machine has cores to spare, so the whole folder takes minutes.
// Each script still runs in its own process with the same exit code as running it by hand, so a result here means what it means there.
//
// Run:  node tools/play_all.js                       every script in tools/play_scripts
//       node tools/play_all.js blind conc_ oa_       only scripts whose path (under tools/play_scripts) contains one of these; "combat/" is a folder
//       node tools/play_all.js --jobs=6              how many at a time (default: cores minus 2, at least 1)
//       node tools/play_all.js --out=some/folder     also save every transcript there as <name>.txt; run it on two commits (a git worktree for the
//                                                    old one) and compare the two folders to see exactly what a change did to play
//       node tools/play_all.js --root=path/to/tree   run another checkout's scripts with that checkout's own tool (a worktree)
// INDEX (2026-11-22): every run also records which scene files each script entered, in <system temp>/cs_play_index.json ({ script: [scenes] },
// merged, so a partial run refreshes only its own entries; scripts no longer in the folder are dropped). Not written for a --root run.
//       node tools/play_all.js --touches=combat*     only scripts that ran one of these scene files on their last run (from the INDEX): a name is exact
//                                                    (combat, port_valen/port_valen), a trailing * matches the start (combat* = combat, combat_dice...);
//                                                    several are comma-separated. A script not in the index yet is run too.
//       node tools/play_all.js --changed             only scripts that ran a scene file with uncommitted changes (git status), plus play scripts that are
//                                                    new or changed themselves. A change to the engine or tool files every script loads runs everything.
// Name substrings, --touches and --changed can be combined: a script must pass each one given.
//       node tools/play_all.js --touches=combat* --list   print what would run, and run nothing
// Exit code: 0 when every script passed, 1 when any failed.
const { spawn, execSync } = require("child_process");
const fs = require("fs"), os = require("os"), path = require("path");

const args = process.argv.slice(2), flags = {}, wanted = [];
args.forEach(function (a) { const m = /^--([\w-]+)(?:=(.*))?$/.exec(a); if (m) flags[m[1]] = m[2] === undefined ? true : m[2]; else wanted.push(a); });
const ROOT = flags.root ? path.resolve(flags.root) : path.resolve(__dirname, "..");
const DIR = path.join(ROOT, "tools", "play_scripts"), TOOL = path.join(ROOT, "tools", "scripted_play.js");
const JOBS = Math.max(1, Number(flags.jobs) || os.cpus().length - 2);
const OUT = flags.out ? path.resolve(flags.out) : null;
if (OUT) fs.mkdirSync(OUT, { recursive: true });

// FOLDERS (2026-11-22): scripts sit in area folders (combat/, character/, systems/, story/<region>/). A script is named by its path under
// tools/play_scripts ("combat/oa_basic.json"), and a name filter matches that path, so "combat/" or "story/longshade/" picks a folder. Transcripts and
// the index still use the bare file name, which must be unique across the folders.
function listScripts() {
  const outList = [];
  (function walk(rel) {
    fs.readdirSync(path.join(DIR, rel), { withFileTypes: true }).forEach(function (e) {
      const r = rel ? rel + "/" + e.name : e.name;
      if (e.isDirectory()) walk(r); else if (/\.json$/.test(e.name)) outList.push(r);
    });
  })("");
  return outList.sort();
}
function base(f) { return path.basename(f).replace(/\.json$/, ""); }
const ALL = listScripts();
(function () {
  const seenBase = {};
  ALL.forEach(function (f) { const b = base(f); if (seenBase[b]) { console.log("play_all: two scripts share the name " + b + ": " + seenBase[b] + " and " + f + ". Rename one."); process.exit(1); } seenBase[b] = f; });
})();
let files = ALL.filter(function (f) {
  return !wanted.length || wanted.some(function (w) { return f.indexOf(w) !== -1; });
});

// --touches / --changed read the index the last runs wrote (see INDEX above).
function readIndex() {
  try { return JSON.parse(fs.readFileSync(path.join(os.tmpdir(), "cs_play_index.json"), "utf8")); }
  catch (e) { console.log("play_all: no play-script index yet (" + path.join(os.tmpdir(), "cs_play_index.json") + "); run the full suite once to build it."); process.exit(1); }
}
function sceneMatcher(list) {
  const pats = list.map(function (p) { return p.trim(); }).filter(Boolean);
  return function (scene) { return pats.some(function (p) { return /\*$/.test(p) ? scene.indexOf(p.slice(0, -1)) === 0 : scene === p; }); };
}
let unindexed = 0;
function byScenes(match) {
  const index = readIndex();
  files = files.filter(function (f) {
    const k = base(f);
    if (!index[k]) { unindexed++; return true; }
    return index[k].some(match);
  });
}
if (flags.touches && flags.touches !== true) byScenes(sceneMatcher(String(flags.touches).split(",")));
if (flags.changed) {
  // Files every script loads (scripted_play.js's own load list and the tool itself): a change to one can move any script, so all of them run.
  const SHARED = /^(web\/(scene|navigator|util)\.js|headless\.js|tools\/scripted_play\.js|web\/mygame\/(names-data|overworld-data|inventory-data|inventory|market|world|tradebook|discard|mygame)\.js|web\/mygame\/[\w-]+\.generated\.js)$/;
  let status = "";
  try { status = execSync("git status --porcelain -uall", { cwd: ROOT, encoding: "utf8" }); } catch (e) { console.log("play_all: --changed needs git (" + e.message + ")"); process.exit(1); }
  const paths = status.split(/\r?\n/).filter(Boolean).map(function (l) { const p = l.slice(3).replace(/^"|"$/g, ""); return p.indexOf(" -> ") >= 0 ? p.split(" -> ")[1] : p; });
  const scenes = {}, scripts = {};
  let shared = "";
  paths.forEach(function (p) {
    let m = /^web\/mygame\/scenes\/(.+)\.txt$/.exec(p);
    if (m) { scenes[/^startup_parts\//.test(m[1]) ? "startup" : m[1]] = true; return; }
    m = /^tools\/play_scripts\/(.+)\.json$/.exec(p);
    if (m) { scripts[path.basename(m[1])] = true; return; }
    if (SHARED.test(p) && !shared) shared = p;
  });
  if (shared) console.log("play_all: --changed: " + shared + " is loaded by every script, so every script runs.");
  else {
    const index = readIndex();
    files = files.filter(function (f) {
      const k = base(f);
      if (scripts[k]) return true;
      if (!index[k]) { unindexed++; return true; }
      return index[k].some(function (sc) { return scenes[sc]; });
    });
    console.log("play_all: --changed: " + (Object.keys(scenes).length ? Object.keys(scenes).sort().join(", ") : "no scene files") + (Object.keys(scripts).length ? "; " + Object.keys(scripts).length + " changed script(s)" : "") + ".");
  }
}
if (unindexed) console.log("play_all: " + unindexed + " script(s) not in the index yet were run as well.");
if (!files.length) { console.log("play_all: no script matches."); process.exit(flags.changed || flags.touches ? 0 : 1); }
if (flags.list) { files.forEach(function (f) { console.log(f.replace(/\.json$/, "")); }); console.log("play_all: " + files.length + " script(s) selected; --list runs nothing."); process.exit(0); }

const started = Date.now(), failed = [];
const INDEX_FILE = path.join(os.tmpdir(), "cs_play_index.json"), TOUCH_DIR = path.join(os.tmpdir(), "cs_play_touches_" + process.pid), touches = {};
const WRITE_INDEX = !flags.root;
if (WRITE_INDEX) fs.mkdirSync(TOUCH_DIR, { recursive: true });
let next = 0, done = 0, running = 0;
function launch() {
  while (running < JOBS && next < files.length) {
    const f = files[next++];
    running++;
    let out = "";
    const touchFile = path.join(TOUCH_DIR, base(f) + ".json");
    const env = WRITE_INDEX ? Object.assign({}, process.env, { PLAY_TOUCHES_FILE: touchFile }) : process.env;
    const child = spawn(process.execPath, [TOOL, path.join(DIR, f)], { cwd: ROOT, env: env });
    child.stdout.on("data", function (d) { out += d; });
    child.stderr.on("data", function (d) { out += d; });
    child.on("close", function (code) {
      running--; done++;
      if (OUT) fs.writeFileSync(path.join(OUT, base(f) + ".txt"), out);
      if (WRITE_INDEX) { try { touches[base(f)] = JSON.parse(fs.readFileSync(touchFile, "utf8")); fs.unlinkSync(touchFile); } catch (e) { /* no entry for this one */ } }
      if (code !== 0) {
        // the lines that say why: the tool's own errors, a refresh check that found differences, dead space
        const why = out.split(/\r?\n/).filter(function (l) { return /^ERROR|^scripted_play:|^!! |Refresh check: .* [1-9]\d* differences/.test(l); }).slice(0, 3);
        failed.push({ file: f, code: code, why: why });
      }
      if (done % 100 === 0 || done === files.length) process.stderr.write("  " + done + " / " + files.length + "\n");
      if (done === files.length) finish(); else launch();
    });
  }
}
function writeIndex() {
  if (!WRITE_INDEX) return;
  let index = {};
  try { index = JSON.parse(fs.readFileSync(INDEX_FILE, "utf8")); } catch (e) { index = {}; }
  const live = {};
  ALL.forEach(function (f) { live[base(f)] = true; });
  Object.keys(index).forEach(function (k) { if (!live[k]) delete index[k]; });
  Object.keys(touches).forEach(function (k) { index[k] = touches[k]; });
  const sorted = {};
  Object.keys(index).sort().forEach(function (k) { sorted[k] = index[k]; });
  try { fs.writeFileSync(INDEX_FILE, JSON.stringify(sorted, null, 1)); fs.rmSync(TOUCH_DIR, { recursive: true, force: true }); } catch (e) { /* only the index is lost */ }
}
function finish() {
  writeIndex();
  failed.sort(function (a, b) { return a.file < b.file ? -1 : 1; });
  failed.forEach(function (x) {
    console.log("FAIL (exit " + x.code + ") " + x.file);
    x.why.forEach(function (l) { console.log("    " + l.slice(0, 220)); });
  });
  const secs = Math.round((Date.now() - started) / 1000);
  console.log("play_all: " + (files.length - failed.length) + " passed, " + failed.length + " failed, of " + files.length + " scripts in " + secs + "s (" + JOBS + " at a time)." +
    (OUT ? " Transcripts in " + OUT : ""));
  process.exit(failed.length ? 1 : 0);
}
launch();
