#!/usr/bin/env node
/*
 * lane_regression.js -- plays the same long, movement-heavy route through every developer test fight and writes each transcript to a folder, so a change to the combat lane
 * (movement, ranges, enemy positions) can be proved to change nothing it should not: write a baseline folder BEFORE the change, write another AFTER, then compare them.
 * Born in lane step 1 (2026-10-16), where all 30 transcripts matched byte for byte.
 *
 *   node tools/lane_regression.js run <outdir> [repoRoot] [--nocross]   write 30 transcripts (--nocross: the route that never slips or steps past an enemy): 10 fights x (fighter low rolls, fighter high rolls, rogue mid rolls)
 *   node tools/lane_regression.js compare <dirA> <dirB>     list the transcripts that differ (exit 1 if any)
 *
 * To baseline code you are about to change while you keep editing, copy the repo (web and tools and the root *.js) to a temp folder and pass it as repoRoot: scripted_play reads the
 * scene files from disk on every run, so editing in place would corrupt the baseline mid-run. Each run takes about 35 seconds, so the whole suite is about 15 minutes.
 * The route is a list of OPTIONAL steps (scripted_play "optional": true): Push forward, Attack, Fall back, End your turn, repeated, each skipped when it is not on offer, so one list
 * works in every fight. To prove a comparison can fail, sabotage a copy (e.g. start every enemy behind) and check it reports a difference.
 */
const fs = require("fs"), path = require("path"), os = require("os"), cp = require("child_process");
const FIGHTS = ["Silt-Lurker", "Rennick's Dock-Guards", "Granary Rats", "Dredge-End Night Ambush", "The Muffled Bell Wreckers", "The Stolen Shroud Thieves", "Captain Trent", "Grease & Fire Test", "Reach Test", "Squad Test"];
const PRESETS = [["fighter", "Vanguard Line Fighter", "low"], ["fighterhigh", "Vanguard Line Fighter", "high"], ["rogue", "Scout Company Rogue", "mid"]];
const ROUND_FULL = ["Push forward", "Attack with your", "Fall back", "Attack with your", "Push forward", "Push forward", "Attack with your", "End your turn"];

// The second route only advances to CLOSE on an enemy (never "past" one), so in a fight where nothing is ever crossed it must play exactly as before a crossing change.
const ROUND_NOCROSS = ["Push forward and close", "Attack with your", "Fall back", "Attack with your", "Push forward and close", "Attack with your", "End your turn"];
let ROUND = ROUND_FULL;

function script(fight, preset, rand) {
  const steps = [{ pick: fight }];
  for (let r = 0; r < 7; r++) ROUND.forEach(p => steps.push({ pick: p, optional: true }));
  for (let r = 0; r < 4; r++) steps.push({ pick: "End your turn", optional: true });
  return { scene: "dev_hub", label: "dev_combat_test_hub", preset, rand, stats: { hp_max: 400, hp_current: 400 }, steps };
}

const argv = process.argv.slice(2).filter(x => { if (x === "--nocross") { ROUND = ROUND_NOCROSS; return false; } return true; });
const [mode, a, b] = argv;
if (mode === "run" && a) {
  const root = path.resolve(b || path.join(__dirname, ".."));
  const out = path.resolve(a);
  fs.mkdirSync(out, { recursive: true });
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "lane_"));
  let n = 0;
  FIGHTS.forEach((fight, fi) => PRESETS.forEach(([tag, preset, rand]) => {
    const name = "f" + String(fi).padStart(2, "0") + "_" + tag;
    const file = path.join(tmp, name + ".json");
    fs.writeFileSync(file, JSON.stringify(script(fight, preset, rand)));
    const r = cp.spawnSync(process.execPath, [path.join(root, "tools", "scripted_play.js"), file], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
    fs.writeFileSync(path.join(out, name + ".txt"), (r.stdout || "") + (r.stderr || ""));
    n++;
    process.stdout.write(".");
  }));
  console.log("\nwrote " + n + " transcripts to " + out);
} else if (mode === "compare" && a && b) {
  // The play tool's "!! DEAD SPACE" notes quote the source line of a scene ("combat line 2079"), which moves whenever code is added above it, so those numbers are ignored.
  const norm = t => t.replace(/\b([a-z_]+ line )\d+/g, "$1N");
  const names = fs.readdirSync(a).filter(f => /^f\d\d_/.test(f));
  let diff = 0;
  names.forEach(f => {
    const pa = path.join(b, f);
    if (!fs.existsSync(pa) || norm(fs.readFileSync(path.join(a, f), "utf8")) !== norm(fs.readFileSync(pa, "utf8"))) { diff++; console.log("DIFFERENT: " + f); }
  });
  console.log(names.length - diff + " identical, " + diff + " different");
  process.exit(diff ? 1 : 0);
} else {
  console.log("usage: node tools/lane_regression.js run <outdir> [repoRoot]\n       node tools/lane_regression.js compare <dirA> <dirB>");
  process.exit(2);
}
