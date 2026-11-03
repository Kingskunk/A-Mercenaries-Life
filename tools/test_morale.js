#!/usr/bin/env node
/*
 * test_morale.js -- morale (combat.txt MORALE) through the real ChoiceScript labels, with the dice fixed per case:
 * combat_morale_check (the save), combat_morale_turn (the triggers, and what a broken enemy or ally then does).
 */
"use strict";
const fs = require("fs");
const vm = require("vm");
const path = require("path");
process.chdir(path.join(__dirname, ".."));
global.fs = fs; global.path = path; global.require = require;
function load(file) { vm.runInThisContext(fs.readFileSync(file, "utf8"), { filename: file }); }
load("web/scene.js"); load("web/navigator.js"); load("web/util.js"); load("headless.js");
global.main = {}; global.delayBreakEnd = function () {};
load("web/mygame/mygame.js");
Scene.prototype.loadScene = function () {
  this.loadLines(fs.readFileSync("web/mygame/scenes/" + this.name + ".txt", "utf8"));
  this.loaded = true;
  if (this.executing) this.execute();
};
const sceneReturn = Scene.prototype.return;
Scene.prototype.return = function () {
  if (this.name === "combat" && (!this.temps.choice_substack || !this.temps.choice_substack.length) &&
      (!this.stats.choice_subscene_stack || !this.stats.choice_subscene_stack.length)) { this.finished = true; return; }
  return sceneReturn.apply(this, arguments);
};
Scene.prototype.choice = function () { this.finished = true; };
new Scene("startup", stats, nav, false).execute();
const base = Object.assign({}, stats);
Scene.prototype.choice = function () { throw new Error("morale probe reached a choice"); };
const combatLines = fs.readFileSync("web/mygame/scenes/combat.txt", "utf8");
let text = "";
function run(label, params, overrides, roll) {
  const state = Object.assign({}, base, { page_id: 40, combat_round: 2, combat_enemy_count: 1, combat_lane_player_position: 3, hp_current: 20, hp_max: 20,
    combat_lane_min_position: 0, combat_lane_max_position: 6, combat_max_range: 3 }, overrides);
  const real = Math.random;
  Math.random = function () { return roll === undefined ? 0.5 : roll; };
  try {
    const scene = new Scene("combat", state, nav, false);
    scene.loadLines(combatLines); scene.loaded = true;
    scene.temps.param = params;
    scene.goto(label);
    scene.execute();
    text = (scene.accumulatedParagraph || []).join("");
  } finally { Math.random = real; }
  return state;
}
function e(n, o) { const r = {}; Object.keys(o).forEach((k) => { r["combat_enemy" + n + "_" + k] = o[k]; }); return r; }
function a(n, o) { const r = {}; Object.keys(o).forEach((k) => { r["combat_ally" + n + "_" + k] = o[k]; }); return r; }
let failed = 0;
function expect(what, got, want) {
  if (JSON.stringify(got) !== JSON.stringify(want)) { failed++; console.error("FAIL " + what + ": got " + JSON.stringify(got) + ", want " + JSON.stringify(want)); }
  else console.log("  ok  " + what);
}
// Dice: Math.random 0.3 rolls a 7 on a d20 (fails DC 10 with WIS 10); 0.6 rolls a 13 (passes).
const LOW = 0.3, HIGH = 0.6;
const rat = { name: "Rat", epithet: "the rat", hp: 4, max_hp: 4, wisdom: 10, morale: "skittish", position: 5, side: 1, range: 2, creature_type: "beast" };
const thug = { name: "Thug", epithet: "the thug", hp: 10, max_hp: 10, wisdom: 10, morale: "normal", position: 5, side: 1, range: 2, creature_type: "humanoid" };

console.log("The save:");
let s = run("combat_morale_check", ["enemy", 1, "test"], e(1, thug), LOW);
expect("a 7 fails DC 10 and breaks", [s.combat_morale_broke, s.combat_enemy1_broken], [true, true]);
s = run("combat_morale_check", ["enemy", 1, "test"], e(1, thug), HIGH);
expect("a 13 holds", s.combat_enemy1_broken, false);
s = run("combat_morale_check", ["enemy", 1, "test"], Object.assign(e(1, thug), { combat_morale_forced_a: 6, combat_morale_forced_b: 15, combat_enemy1_morale: "steady" }), LOW);
expect("steady keeps the higher of two dice (6 and 15: holds)", s.combat_enemy1_broken, false);
s = run("combat_morale_check", ["enemy", 1, "test"], Object.assign(e(1, thug), { combat_morale_forced_a: 15, combat_morale_forced_b: 6, combat_enemy1_morale: "skittish" }), HIGH);
expect("skittish keeps the lower (15 and 6: breaks)", s.combat_enemy1_broken, true);
expect("...and the banner says so", /Morale \(test\): 6 \+0 \(Disadvantage: skittish\) = 6 vs DC 10 — BREAKS/.test(text), true);
s = run("combat_morale_check", ["enemy", 1, "test"], Object.assign(e(1, thug), { combat_enemy1_morale: "fearless" }), LOW);
expect("fearless never breaks", s.combat_enemy1_broken, false);
s = run("combat_morale_check", ["enemy", 1, "test"], Object.assign(e(1, thug), { combat_no_morale: true }), LOW);
expect("combat_no_morale turns it off", s.combat_enemy1_broken, false);

console.log("Triggers (each once):");
s = run("combat_morale_turn", ["enemy", 1], Object.assign(e(1, Object.assign({}, thug, { hp: 4 })), { combat_active_target: 1 }), HIGH);
expect("badly hurt: checks once, holds, carries on", [s.combat_enemy1_morale_bloodied, s.combat_enemy1_broken, s.combat_morale_stop], [true, false, false]);
s = run("combat_morale_turn", ["enemy", 1], Object.assign(e(1, Object.assign({}, thug, { hp: 4, morale_bloodied: true })), { combat_active_target: 1 }), LOW);
expect("...and not again on a later turn", s.combat_enemy1_broken, false);
const captainDown = Object.assign({ combat_enemy_count: 2, combat_active_target: 2 }, e(1, Object.assign({}, thug, { name: "Captain", hp: 0, max_hp: 24 })), e(2, thug));
s = run("combat_morale_turn", ["enemy", 2], captainDown, HIGH);
expect("the captain (24 HP) down: the thug checks", s.combat_enemy2_morale_strong, true);
const peerDown = Object.assign({ combat_enemy_count: 3, combat_active_target: 2 }, e(1, Object.assign({}, rat, { hp: 0 })), e(2, rat), e(3, rat));
s = run("combat_morale_turn", ["enemy", 2], peerDown, HIGH);
expect("one rat of three down: no check (equals, and not half)", [s.combat_enemy2_morale_strong, s.combat_enemy2_morale_half], [false, false]);
s = run("combat_morale_turn", ["enemy", 3], Object.assign({}, peerDown, e(2, Object.assign({}, rat, { hp: 0 })), { combat_active_target: 3 }), HIGH);
expect("two of three down: the last checks (half its side)", s.combat_enemy3_morale_half, true);

console.log("A broken enemy:");
s = run("combat_morale_turn", ["enemy", 1], Object.assign(e(1, Object.assign({}, thug, { broken: true })), { combat_active_target: 1, combat_enemy_creature_type: "humanoid", combat_lane_player_position: 5 }), HIGH);
expect("a cornered humanoid surrenders: out, 0 HP, counted", [s.combat_enemy1_out, Number(s.combat_enemy1_hp), Number(s.combat_enemies_surrendered), s.combat_morale_stop], ["surrendered", 0, 1, true]);
s = run("combat_morale_turn", ["enemy", 1], Object.assign(e(1, Object.assign({}, thug, { broken: true })), { combat_active_target: 1, combat_enemy_creature_type: "humanoid", combat_is_nonlethal: true }), HIGH);
expect("in a non-lethal fight it surrenders even with room to run", s.combat_enemy1_out, "surrendered");
s = run("combat_morale_turn", ["enemy", 1], Object.assign(e(1, Object.assign({}, rat, { broken: true, position: 4, range: 1 })), { combat_active_target: 1, combat_enemy_creature_type: "beast", combat_enemy_range: 1 }), HIGH);
expect("a beast with room runs: two steps toward its edge, still in the fight", [Number(s.combat_enemy1_position), s.combat_enemy1_out, Number(s.combat_enemy1_hp)], [6, "", 4]);
s = run("combat_morale_turn", ["enemy", 1], Object.assign(e(1, Object.assign({}, rat, { broken: true, position: 6, range: 3 })), { combat_active_target: 1, combat_enemy_creature_type: "beast" }), HIGH);
expect("...and starting a turn on the edge, it is gone", [s.combat_enemy1_out, Number(s.combat_enemy1_hp), Number(s.combat_enemies_fled)], ["fled", 0, 1]);

console.log("A wavering ally:");
const rook = { name: "Rook", epithet: "Rook", hp: 3, max_hp: 12, wisdom: 10, morale: "normal", position: 5, target: 1 };
s = run("combat_morale_turn", ["ally", 1], Object.assign({ combat_ally_count: 1 }, a(1, rook), e(1, thug)), LOW);
expect("badly hurt and failing: wavers, steps toward the player, covers up", [s.combat_ally1_broken, Number(s.combat_ally1_position), s.combat_ally1_dodging, s.combat_morale_stop], [true, 4, true, true]);
s = run("combat_morale_turn", ["ally", 1], Object.assign({ combat_ally_count: 1 }, a(1, Object.assign({}, rook, { broken: true, morale_bloodied: true, dodging: true, position: 4 })), e(1, thug)), HIGH);
expect("next turn it rallies and fights on", [s.combat_ally1_broken, s.combat_ally1_dodging, s.combat_morale_stop], [false, false, false]);
s = run("combat_morale_turn", ["ally", 1], Object.assign({ combat_ally_count: 1, hp_current: 4 }, a(1, Object.assign({}, rook, { hp: 12 })), e(1, thug)), HIGH);
expect("an ally checks when the player is badly hurt", s.combat_ally1_morale_strong, true);
s = run("combat_morale_turn", ["ally", 1], Object.assign({ combat_ally_count: 1 }, a(1, Object.assign({}, rook, { morale: "fearless" })), e(1, thug)), LOW);
expect("a fearless blight twig never wavers", s.combat_ally1_broken, false);

console.log("Intimidate's DC (10 + WIS + proficiency + resolve, then the moment):");
const guardE = { name: "Guard", epithet: "the guard", hp: 8, max_hp: 8, wisdom: 10, prof: 2, resolve: 2 };
s = run("combat_intimidate_dc", [1], e(1, guardE));
expect("a fresh guard: 10 + 0 + 2 + resolve 2 = 14", [Number(s.combat_intim_dc), s.combat_intim_dc_note], [14, "resolve +2"]);
s = run("combat_intimidate_dc", [2], Object.assign({ combat_enemy_count: 2 }, e(1, Object.assign({}, thug, { name: "Captain", max_hp: 24, hp: 24, prof: 2 })), e(2, guardE)));
expect("...with its captain still standing: 16", Number(s.combat_intim_dc), 16);
const pack = Object.assign({ combat_enemy_count: 2 }, e(1, Object.assign({}, rat, { hp: 0, prof: 2 })), e(2, Object.assign({}, rat, { hp: 1, prof: 2 })));
s = run("combat_intimidate_dc", [2], pack);
expect("a bleeding rat whose pack is half down: 12 - 2 - 2 = 8", [Number(s.combat_intim_dc), s.combat_intim_dc_note], [8, "badly hurt -2, its side half down -2"]);
s = run("combat_intimidate_dc", [2], Object.assign({}, pack, { hp_current: 5, hp_max: 20 }));
expect("...but with you below half HP: +2 = 10", Number(s.combat_intim_dc), 10);
s = run("combat_intimidate_dc", [1], e(1, Object.assign({}, rat, { hp: 1, wisdom: 1, prof: 1 })));
expect("never below 5", Number(s.combat_intim_dc), 5);
s = run("combat_intimidate_dc", [1], e(1, Object.assign({}, guardE, { prof: 0 })));
expect("no proficiency set: the library's +2 stands in", Number(s.combat_intim_dc), 14);

if (failed) { console.error(failed + " morale case(s) failed."); process.exit(1); }
console.log("Morale OK.");
