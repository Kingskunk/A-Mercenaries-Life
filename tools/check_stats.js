/*
 * check_stats.js — runs N random playthroughs (same engine/headless harness as
 * randomtest.js) and reports the distribution of ending values for key
 * numeric stats (currency, HP, relationship/respect stats, ruthless), broken
 * down by squad and class where that's meaningful.
 *
 * This exists because randomtest.js's own reporting (line coverage, dice
 * check pass/fail rates via check_balance.js) never looks at *where numbers
 * actually end up* — it can tell you a check succeeds ~55% of the time, but
 * not whether every playthrough ends with 0 gold, or whether lyra_bond
 * reliably tops out near 100 regardless of what the player actually chose.
 *
 * usage: node tools/check_stats.js [num=200] [seed=0] [game=mygame]
 */

var iterations = 200;
var randomSeed = 0;
var gameName = "mygame";

function parseArgs(args) {
  for (var i = 0; i < args.length; i++) {
    var parts = args[i].split("=");
    if (parts.length !== 2) continue;
    var name = parts[0], value = parts[1];
    if (name === "num") iterations = parseInt(value, 10);
    else if (name === "seed") randomSeed = parseInt(value, 10);
    else if (name === "game") gameName = value;
  }
}
parseArgs(process.argv.slice(2));

// randomtest.js fully configures the Scene class for headless random play as
// a side effect of loading (overriding *choice resolution, file-based scene
// loading, *finish/*goto_scene, etc.) and then auto-runs itself via a
// trailing `if (!delay) randomtest();`. Rather than re-implementing all of
// that, load it with num=0 (its own loop then does nothing) and drive the
// now-patched Scene class ourselves below — this reuses the exact same
// tested internals with no duplication.
var realArgv = process.argv;
process.argv = [realArgv[0], realArgv[1], "num=0", "game=" + gameName, "showText=false", "showCoverage=false", "showChoices=false"];
var fs = require('fs');
var vm = require('vm');
global.require = require;
var realConsoleLog = console.log;
console.log = function() {}; // silence randomtest.js's own num=0 startup chatter
vm.runInThisContext(fs.readFileSync("randomtest.js", "utf8"), "randomtest.js");
process.argv = realArgv;

// Tracked variables. "group" splits the distribution (e.g. respect stats
// only mean something once you've actually met that NPC / joined that squad).
var TRACKED = [
  { key: "gold", label: "Gold" },
  { key: "silver", label: "Silver" },
  { key: "copper", label: "Copper" },
  { key: "hp_current", label: "HP (current)" },
  { key: "hp_max", label: "HP (max)" },
  { key: "ruthless", label: "Ruthless (0-100)" },
  { key: "lyra_bond", label: "Lyra Bond", onlyIf: function(s) { return s.squad === "vanguard"; } },
  { key: "kestrel_respect", label: "Kestrel Respect", onlyIf: function(s) { return s.squad === "scouts"; } },
  { key: "ysolde_respect", label: "Ysolde Respect", onlyIf: function(s) { return s.squad === "cadre"; } },
  { key: "varren_respect", label: "Varren Respect" },
  { key: "odessa_respect", label: "Odessa Respect", onlyIf: function(s) { return !!s.met_odessa; } }
];

var samples = {};
TRACKED.forEach(function(t) { samples[t.key] = []; });
var bySquad = {};
var byClass = {};
var completed = 0;
var errored = 0;

// randomtest.js's internal *rand/*choice logging fires regardless of our
// showChoices=false flag once we're driving the loop ourselves, so keep
// stdout muted for the run itself and restore it before printing our report.
for (var i = 0; i < iterations; i++) {
  nav.resetStats(stats);
  timeout = null;
  Math.seedrandom(i + randomSeed);
  var scene = new Scene(nav.getStartupScene(), stats, nav, false);
  try {
    scene.execute();
    while (timeout) {
      var fn = timeout;
      timeout = null;
      fn();
    }
  } catch (e) {
    errored++;
    continue;
  }

  completed++;
  TRACKED.forEach(function(t) {
    if (t.onlyIf && !t.onlyIf(stats)) return;
    var v = stats[t.key];
    if (typeof v === "number") samples[t.key].push(v);
  });
  if (stats.squad) bySquad[stats.squad] = (bySquad[stats.squad] || 0) + 1;
  if (stats.character_class) byClass[stats.character_class] = (byClass[stats.character_class] || 0) + 1;
}

console.log = realConsoleLog;

function stat(arr) {
  if (!arr.length) return null;
  var min = Math.min.apply(null, arr);
  var max = Math.max.apply(null, arr);
  var avg = arr.reduce(function(a, b) { return a + b; }, 0) / arr.length;
  var sorted = arr.slice().sort(function(a, b) { return a - b; });
  var median = sorted[Math.floor(sorted.length / 2)];
  return { n: arr.length, min: min, max: max, avg: avg, median: median };
}

console.log("\nEnding-stat distribution across " + completed + " completed run(s) (" + errored + " errored, seed=" + randomSeed + ")\n");
console.log(
  pad("Stat", 20) + pad("N", 6) + pad("Min", 8) + pad("Max", 8) + pad("Avg", 10) + pad("Median", 8)
);
console.log("-".repeat(60));
TRACKED.forEach(function(t) {
  var s = stat(samples[t.key]);
  if (!s) {
    console.log(pad(t.label, 20) + "(no samples reached this point)");
    return;
  }
  console.log(
    pad(t.label, 20) + pad(s.n, 6) + pad(round1(s.min), 8) + pad(round1(s.max), 8) + pad(round1(s.avg), 10) + pad(round1(s.median), 8)
  );
});

console.log("\nSquad distribution:");
Object.keys(bySquad).sort().forEach(function(k) {
  console.log("  " + pad(k, 12) + bySquad[k] + " (" + (100 * bySquad[k] / completed).toFixed(1) + "%)");
});

console.log("\nClass distribution:");
Object.keys(byClass).sort().forEach(function(k) {
  console.log("  " + pad(k, 12) + byClass[k] + " (" + (100 * byClass[k] / completed).toFixed(1) + "%)");
});

function pad(v, width) {
  v = "" + v;
  while (v.length < width) v += " ";
  return v;
}
function round1(n) {
  return Math.round(n * 10) / 10;
}
