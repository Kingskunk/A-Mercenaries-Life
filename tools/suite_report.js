// suite_report.js -- run play scripts and report, in a few lines, what failed and which transcripts changed since the last run (2026-11-18).
//
// WHY: a regression check is play_all.js with --out, then a comparison of the new transcripts with the last run's. Reading both by hand (or
// having a helper agent do it) costs far more than the answer, which is usually "all passed, nothing changed". This does the comparison itself
// and prints only the outcome, so the reader looks at a diff only when something actually moved.
//
// Run:  node tools/suite_report.js                     every script; compare with the baseline, then make this run the baseline
//       node tools/suite_report.js oa_ conc_           only scripts whose name contains one of these (passed on to play_all.js)
//       node tools/suite_report.js --show=6            also print up to 6 changed lines from each side of each changed transcript
//       node tools/suite_report.js --no-save           compare only; leave the baseline as it was
//       node tools/suite_report.js --base=some/folder  the baseline folder (default: <system temp>/cs_suite_baseline)
//       node tools/suite_report.js --seed=some/folder  copy an existing transcript folder (play_all --out) in as the baseline, run nothing
//       --jobs=N is passed on to play_all.js.
// The baseline is updated file by file, so a run of a few scripts refreshes only theirs. A script missing from the baseline is listed as new.
// Before a changed transcript's baseline is overwritten, the old one is copied to <baseline>_prev (emptied at the start of every run that
// saves), so a change can still be read after the run: diff <baseline>_prev/<name>.txt <baseline>/<name>.txt.
// Exit code: 0 when every script passed, 1 when any failed. A changed transcript is not a failure: it is for the reader to judge.
const { spawn } = require("child_process");
const fs = require("fs"), os = require("os"), path = require("path");

const args = process.argv.slice(2), flags = {}, pass = [];
args.forEach(function (a) {
  const m = /^--([\w-]+)(?:=(.*))?$/.exec(a);
  if (m && ["show", "no-save", "base", "seed"].indexOf(m[1]) !== -1) flags[m[1]] = m[2] === undefined ? true : m[2];
  else pass.push(a);
});
const ROOT = path.resolve(__dirname, "..");
const BASE = path.resolve(flags.base || path.join(os.tmpdir(), "cs_suite_baseline"));
const SHOW = Number(flags.show) || 0;

function copyTxt(from, to) {
  fs.mkdirSync(to, { recursive: true });
  let n = 0;
  fs.readdirSync(from).forEach(function (f) { if (/\.txt$/.test(f)) { fs.copyFileSync(path.join(from, f), path.join(to, f)); n++; } });
  return n;
}

if (flags.seed) {
  console.log("suite_report: seeded " + copyTxt(path.resolve(flags.seed), BASE) + " transcripts into " + BASE);
  process.exit(0);
}

const NEW = fs.mkdtempSync(path.join(os.tmpdir(), "cs_suite_run_"));
const child = spawn(process.execPath, [path.join(ROOT, "tools", "play_all.js"), "--out=" + NEW].concat(pass), { cwd: ROOT });
let out = "";
child.stdout.on("data", function (d) { out += d; });
child.stderr.on("data", function (d) { const s = String(d); if (!/^\s*\d+ \/ \d+\s*$/m.test(s)) out += s; }); // drop the progress counter
child.on("close", function (code) {
  // play_all's own summary: the FAIL lines with their reasons, and the count line (minus the folder, which is temporary)
  out.split(/\r?\n/).forEach(function (l) {
    if (/^FAIL |^    |^play_all:/.test(l)) console.log(l.replace(/ Transcripts in .*$/, ""));
  });

  const haveBase = fs.existsSync(BASE);
  const changed = [], added = [];
  fs.readdirSync(NEW).filter(function (f) { return /\.txt$/.test(f); }).sort().forEach(function (f) {
    const b = path.join(BASE, f);
    if (!haveBase || !fs.existsSync(b)) { added.push(f); return; }
    const A = fs.readFileSync(b, "utf8").split(/\r?\n/), B = fs.readFileSync(path.join(NEW, f), "utf8").split(/\r?\n/);
    // trim the common start and end; what is left is the changed stretch on each side
    let s = 0; while (s < A.length && s < B.length && A[s] === B[s]) s++;
    if (s === A.length && s === B.length) return;
    let ea = A.length - 1, eb = B.length - 1; while (ea >= s && eb >= s && A[ea] === B[eb]) { ea--; eb--; }
    changed.push({ f: f, line: s + 1, old: A.slice(s, ea + 1), neu: B.slice(s, eb + 1) });
  });

  if (!haveBase) console.log("suite_report: no baseline yet at " + BASE + "; this run becomes it.");
  else {
    console.log("suite_report: " + changed.length + " transcript(s) changed, " + added.length + " new, against " + BASE);
    changed.forEach(function (c) {
      console.log("CHANGED " + c.f + "  (from line " + c.line + ": " + c.old.length + " old line(s) -> " + c.neu.length + " new)");
      if (SHOW) {
        c.old.slice(0, SHOW).forEach(function (l) { console.log("    - " + l.slice(0, 200)); });
        c.neu.slice(0, SHOW).forEach(function (l) { console.log("    + " + l.slice(0, 200)); });
      }
    });
    if (added.length) console.log("NEW " + added.join(", "));
  }

  if (!flags["no-save"]) {
    const PREV = BASE + "_prev";
    fs.rmSync(PREV, { recursive: true, force: true });
    if (changed.length) {
      fs.mkdirSync(PREV, { recursive: true });
      changed.forEach(function (c) { fs.copyFileSync(path.join(BASE, c.f), path.join(PREV, c.f)); });
      console.log("suite_report: the old version of each changed transcript is in " + PREV);
    }
    copyTxt(NEW, BASE);
  }
  else console.log("suite_report: baseline left as it was; this run's transcripts are in " + NEW);
  if (!flags["no-save"]) fs.rmSync(NEW, { recursive: true, force: true });
  process.exit(code === 0 ? 0 : 1);
});
