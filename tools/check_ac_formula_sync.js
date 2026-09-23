/*
 * check_ac_formula_sync.js -- catches drift between recalculate_armor_class
 * (web/mygame/scenes/equipment.txt, the real rule) and its hand-ported JS mirror
 * (web/mygame/equipment-panel.js's EquipmentEngine.recalcArmorClass, used by the
 * Inventory panel's interactive equip controls so a swap can update AC without a
 * ChoiceScript page navigation -- see equipment-panel.js's header comment for why that
 * one function is duplicated instead of generated).
 *
 * Reuses randomtest.js's already-tested headless harness (same technique as
 * tools/check_stats.js) to run N real random playthroughs -- every one of them calls the
 * REAL recalculate_armor_class every time chargen/equip choices change gear -- then, for
 * each completed playthrough, feeds that same final stats snapshot into the JS mirror
 * and diffs its output against the armor_class the real game actually computed. Run this
 * after editing recalculate_armor_class; a mismatch means equipment-panel.js's mirror
 * needs the same edit.
 *
 * usage: node tools/check_ac_formula_sync.js [num=200] [seed=0] [game=mygame]
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

// Same reuse trick as check_stats.js: load randomtest.js with num=0 so its own loop is a
// no-op, then drive the now-patched (headless-safe) Scene class ourselves below.
var realArgv = process.argv;
process.argv = [realArgv[0], realArgv[1], "num=0", "game=" + gameName, "showText=false", "showCoverage=false", "showChoices=false"];
var fs = require('fs');
var vm = require('vm');
var path = require('path');
global.require = require;
var realConsoleLog = console.log;
console.log = function() {}; // silence randomtest.js's own num=0 startup chatter
vm.runInThisContext(fs.readFileSync("randomtest.js", "utf8"), "randomtest.js");
process.argv = realArgv;
console.log = realConsoleLog;

// Load the real JS mirror the same way compile.js loads engine files in Node --
// window.EquipmentEngine needs SOME window object to attach to.
global.window = global;
vm.runInThisContext(fs.readFileSync(path.join("web", "mygame", "equipment-data.generated.js"), "utf8"), "equipment-data.generated.js");
vm.runInThisContext(fs.readFileSync(path.join("web", "mygame", "equipment-panel.js"), "utf8"), "equipment-panel.js");
var recalcArmorClass = window.EquipmentEngine.recalcArmorClass;

var mismatches = [];
var checked = 0;
var errored = 0;

console.log = function() {}; // silence randomtest.js's internal per-choice logging
for (var i = 0; i < iterations; i++) {
  nav.resetStats(stats);
  timeout = null;
  Math.seedrandom(i + randomSeed);
  var scene = new Scene(nav.getStartupScene(), stats, nav, false);
  try {
    scene.execute();
    // scene.execute() only runs until the next simulated async pause (page turn); drain
    // the queued continuations the same way check_stats.js does, or the "playthrough"
    // stops after its very first tick and never actually reaches chargen.
    while (timeout) {
      var fn = timeout;
      timeout = null;
      fn();
    }
  } catch (e) {
    errored++;
    continue;
  }
  // Skip playthroughs that never actually reached chargen: armor_class *creates at a
  // raw default (13) that's only made consistent with shield_equipped's OWN raw default
  // (true) once the real recalculate_armor_class actually runs during chargen. Before
  // that, comparing the two "at rest" defaults against each other isn't testing the
  // formula at all, just catching that ChoiceScript's initial *create values don't
  // agree with each other before startup.txt reconciles them.
  if (stats.armor_class === undefined || stats.character_class === "none" || !stats.character_class) continue;
  checked++;
  var realAc = Number(stats.armor_class);
  // Shallow copy: recalcArmorClass only reads primitive fields and writes armor_class/
  // shield_prose, so this is enough to isolate it, and a deep clone would choke on
  // stats.scene's circular back-reference to the Scene object that holds this stats.
  var snapshot = {};
  for (var key in stats) snapshot[key] = stats[key];
  recalcArmorClass(snapshot);
  var mirroredAc = Number(snapshot.armor_class);
  if (realAc !== mirroredAc) {
    mismatches.push({
      seed: i + randomSeed, real: realAc, mirrored: mirroredAc,
      armor_type: stats.armor_type, character_class: stats.character_class,
      head_is_armor: stats.head_is_armor, head_ac: stats.head_ac,
      shield_equipped: stats.shield_equipped, fighter_fighting_style: stats.fighter_fighting_style,
      wizard_spell: stats.wizard_spell, dex_mod: stats.dex_mod, con_mod: stats.con_mod
    });
  }
}
console.log = realConsoleLog;

console.log("Checked " + checked + " completed playthroughs (" + errored + " errored before reaching equipped gear).");
if (!mismatches.length) {
  console.log("PASSED -- EquipmentEngine.recalcArmorClass matches recalculate_armor_class on every sampled combo.");
  process.exit(0);
} else {
  console.log("FAILED -- " + mismatches.length + " mismatch(es) between the real formula and the JS mirror:");
  mismatches.slice(0, 10).forEach(function (m) {
    console.log("  seed=" + m.seed + " real=" + m.real + " mirrored=" + m.mirrored +
      " | armor_type=" + m.armor_type + " class=" + m.character_class +
      " head_is_armor=" + m.head_is_armor + " head_ac=" + m.head_ac +
      " shield_equipped=" + m.shield_equipped + " fighting_style=" + m.fighter_fighting_style +
      " wizard_spell=" + m.wizard_spell + " dex_mod=" + m.dex_mod + " con_mod=" + m.con_mod);
  });
  if (mismatches.length > 10) console.log("  ... and " + (mismatches.length - 10) + " more.");
  process.exit(1);
}
