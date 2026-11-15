// play_all.js -- run many play scripts at once, several at a time, and report only what failed (2026-11-15).
//
// WHY: tools/scripted_play.js runs one script. A regression over the folder was a shell loop, one script after another, and the folder holds over 1,600.
// This starts one scripted_play.js process per script, as many at a time as the machine has cores to spare, so the whole folder takes minutes.
// Each script still runs in its own process with the same exit code as running it by hand, so a result here means what it means there.
//
// Run:  node tools/play_all.js                       every script in tools/play_scripts
//       node tools/play_all.js blind conc_ oa_       only scripts whose file name contains one of these
//       node tools/play_all.js --jobs=6              how many at a time (default: cores minus 2, at least 1)
//       node tools/play_all.js --out=some/folder     also save every transcript there as <name>.txt; run it on two commits (a git worktree for the
//                                                    old one) and compare the two folders to see exactly what a change did to play
//       node tools/play_all.js --root=path/to/tree   run another checkout's scripts with that checkout's own tool (a worktree)
// Exit code: 0 when every script passed, 1 when any failed.
const { spawn } = require("child_process");
const fs = require("fs"), os = require("os"), path = require("path");

const args = process.argv.slice(2), flags = {}, wanted = [];
args.forEach(function (a) { const m = /^--([\w-]+)(?:=(.*))?$/.exec(a); if (m) flags[m[1]] = m[2] === undefined ? true : m[2]; else wanted.push(a); });
const ROOT = flags.root ? path.resolve(flags.root) : path.resolve(__dirname, "..");
const DIR = path.join(ROOT, "tools", "play_scripts"), TOOL = path.join(ROOT, "tools", "scripted_play.js");
const JOBS = Math.max(1, Number(flags.jobs) || os.cpus().length - 2);
const OUT = flags.out ? path.resolve(flags.out) : null;
if (OUT) fs.mkdirSync(OUT, { recursive: true });

const files = fs.readdirSync(DIR).filter(function (f) {
  return /\.json$/.test(f) && (!wanted.length || wanted.some(function (w) { return f.indexOf(w) !== -1; }));
}).sort();
if (!files.length) { console.log("play_all: no script matches."); process.exit(1); }

const started = Date.now(), failed = [];
let next = 0, done = 0, running = 0;
function launch() {
  while (running < JOBS && next < files.length) {
    const f = files[next++];
    running++;
    let out = "";
    const child = spawn(process.execPath, [TOOL, path.join(DIR, f)], { cwd: ROOT });
    child.stdout.on("data", function (d) { out += d; });
    child.stderr.on("data", function (d) { out += d; });
    child.on("close", function (code) {
      running--; done++;
      if (OUT) fs.writeFileSync(path.join(OUT, f.replace(/\.json$/, ".txt")), out);
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
function finish() {
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
