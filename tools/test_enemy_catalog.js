#!/usr/bin/env node
/*
 * test_enemy_catalog.js -- builds every enemy library type through the REAL ChoiceScript setup
 * (combat_types.txt apply_enemy_type) in slot 1 (the bare combat_enemy_* names) and in slots 2 and 3, with
 * dice forced low, middle and high, and checks each slot came out exactly as tools/enemy_catalog.json says.
 *
 * Usage: node tools/test_enemy_catalog.js            check against the catalog
 *        node tools/test_enemy_catalog.js --dump F   write every built slot's stats to F (JSON), for a before/after diff
 */
"use strict";
const fs = require("fs");
const vm = require("vm");
const path = require("path");

const ROOT = path.join(__dirname, "..");
process.chdir(ROOT);
global.fs = fs;
global.path = path;
global.require = require;
function load(file) { vm.runInThisContext(fs.readFileSync(file, "utf8"), { filename: file }); }
load("web/scene.js");
load("web/navigator.js");
load("web/util.js");
load("headless.js");
global.main = {};
global.delayBreakEnd = function () {};
load("web/mygame/mygame.js");

Scene.prototype.loadScene = function () {
  this.loadLines(fs.readFileSync("web/mygame/scenes/" + this.name + ".txt", "utf8"));
  this.loaded = true;
  if (this.executing) this.execute();
};
const sceneReturn = Scene.prototype.return;
Scene.prototype.return = function () {
  // apply_enemy_type is entered directly here, not through *gosub_scene, so its own last *return ends the probe.
  if (this.name === "combat_types" && (!this.temps.choice_substack || !this.temps.choice_substack.length) &&
      (!this.stats.choice_subscene_stack || !this.stats.choice_subscene_stack.length)) {
    this.finished = true;
    return;
  }
  return sceneReturn.apply(this, arguments);
};
Scene.prototype.choice = function () { this.finished = true; };
new Scene("startup", stats, nav, false).execute();
const baseStats = Object.assign({}, stats);
Scene.prototype.choice = function () { throw new Error("enemy setup unexpectedly reached a choice"); };

const SOURCE = fs.readFileSync("web/mygame/scenes/combat_types.txt", "utf8");
const TYPES = [...SOURCE.matchAll(/^\*if \(combat_apply_type = "([^"]+)"\)/gm)].map((m) => m[1]);
const RANDS = { low: 0, mid: 0.5, high: 0.999 };

function build(type, slot, rand) {
  const state = Object.assign({}, baseStats, { combat_apply_slot: slot, combat_apply_type: type });
  const real = Math.random;
  Math.random = function () { return RANDS[rand]; };
  try {
    const scene = new Scene("combat_types", state, nav, false);
    scene.loadScene();
    scene.goto("apply_enemy_type");
    scene.execute();
  } finally { Math.random = real; }
  const prefix = slot === 1 ? "combat_enemy_" : "combat_enemy" + slot + "_";
  const raw = {};
  Object.keys(state).forEach(function (k) {
    if (k.indexOf(prefix) === 0 && state[k] !== baseStats[k]) raw[k.slice(prefix.length)] = state[k];
  });
  // Slot 1's profile, flavor type and similar are written to the numbered combat_enemy1_* names, not the bare ones.
  if (slot === 1) {
    Object.keys(state).forEach(function (k) {
      if (k.indexOf("combat_enemy1_") === 0 && state[k] !== baseStats[k] && raw[k.slice(14)] === undefined) raw[k.slice(14)] = state[k];
    });
  }
  // Sorted, and every value as a string: a literal *set stores "7" where an expression stores 7.
  const out = {};
  Object.keys(raw).sort().forEach(function (k) { out[k] = String(raw[k]); });
  return out;
}

const all = {};
TYPES.forEach(function (type) {
  Object.keys(RANDS).forEach(function (rand) {
    [1, 2, 3].forEach(function (slot) { all[type + "/" + rand + "/" + slot] = build(type, slot, rand); });
  });
});

const dumpAt = process.argv.indexOf("--dump");
if (dumpAt !== -1) {
  fs.writeFileSync(process.argv[dumpAt + 1], JSON.stringify(all, null, 1));
  console.log("Wrote " + Object.keys(all).length + " built slots for " + TYPES.length + " types.");
  process.exit(0);
}

// Check mode: slot 1 and the numbered slots must agree, and every value must be the catalog's.
const catalog = JSON.parse(fs.readFileSync("tools/enemy_catalog.json", "utf8")).types;
const failures = [];
const ids = catalog.map((t) => t.id);
TYPES.forEach((t) => { if (ids.indexOf(t) === -1) failures.push("dispatch has a type the catalog lacks: " + t); });
ids.forEach((t) => { if (TYPES.indexOf(t) === -1) failures.push("catalog type missing from the dispatch: " + t); });
catalog.forEach(function (t) {
  Object.keys(RANDS).forEach(function (rand) {
    const one = all[t.id + "/" + rand + "/1"], two = all[t.id + "/" + rand + "/2"], three = all[t.id + "/" + rand + "/3"];
    if (!one) return;
    if (JSON.stringify(one) !== JSON.stringify(two) || JSON.stringify(two) !== JSON.stringify(three)) {
      failures.push(t.id + " (" + rand + "): slot 1 and the numbered slots differ\n  1: " + JSON.stringify(one) + "\n  2: " + JSON.stringify(two));
    }
    const expect = {
      name: t.name, epithet: t.epithet, hp: t.hp, max_hp: t.hp, ac: t.ac,
      behavior_profile: t.profile, size: t.size, creature_type: t.creature_type, flavor_type: t.id
    };
    if (t.reach) expect.reach = t.reach;
    Object.keys(expect).forEach(function (k) {
      const got = one[k] !== undefined ? one[k] : String(baseStats["combat_enemy_" + k]);
      if (expect[k] !== undefined && got !== String(expect[k])) {
        failures.push(t.id + " (" + rand + "): " + k + " is " + JSON.stringify(one[k]) + ", catalog says " + JSON.stringify(expect[k]));
      }
    });
    Object.keys(t.abilities || {}).forEach(function (a) {
      const r = t.abilities[a], v = Number(one[a] !== undefined ? one[a] : baseStats["combat_enemy_" + a]);
      if (v < r[0] || v > r[1]) failures.push(t.id + " (" + rand + "): " + a + " " + v + " is outside " + r.join("-"));
    });
  });
});
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("Enemy catalog OK: " + catalog.length + " types built in slots 1-3 at low/mid/high dice, all slots identical and matching the catalog.");
