#!/usr/bin/env node
/*
 * test_combat_reactions.js -- who may take an opportunity attack, through the real ChoiceScript finders in combat.txt:
 *   find_opportunity_attacker          the enemy that swings at the player (or a retreating ally) leaving its reach
 *   find_opportunity_attacker_against  the player or ally that swings at an enemy retreating from them
 * A stunned combatant has no reactions (RAW), so a stunned enemy never swings and a stunned player passes the chance to an ally.
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
  // The finder is entered directly, not through *gosub, so its own last *return ends the probe.
  if (this.name === "combat" && (!this.temps.choice_substack || !this.temps.choice_substack.length)) { this.finished = true; return; }
  return sceneReturn.apply(this, arguments);
};
Scene.prototype.choice = function () { this.finished = true; };
new Scene("startup", stats, nav, false).execute();
const base = Object.assign({}, stats);
Scene.prototype.choice = function () { throw new Error("reaction probe reached a choice"); };
const combatLines = fs.readFileSync("web/mygame/scenes/combat.txt", "utf8");

function run(label, overrides) {
  const state = Object.assign({}, base, overrides);
  const scene = new Scene("combat", state, nav, false);
  scene.loadLines(combatLines);
  scene.loaded = true;
  scene.goto(label);
  scene.execute();
  return state;
}
let failed = 0;
function expect(what, got, want) {
  if (got !== want) { failed++; console.error("FAIL " + what + ": got " + JSON.stringify(got) + ", want " + JSON.stringify(want)); }
}

// Two melee enemies in the player's reach; slot 1 is the weaker, so it is the one that would swing.
const pair = {
  combat_enemy_count: 2,
  combat_enemy1_hp: 3, combat_enemy1_weapon_type: "melee", combat_enemy1_range: 0, combat_enemy1_oa_used: false, combat_enemy1_stunned: 0,
  combat_enemy2_hp: 9, combat_enemy2_weapon_type: "melee", combat_enemy2_range: 0, combat_enemy2_oa_used: false, combat_enemy2_stunned: 0
};
expect("the weaker of two ready enemies swings", Number(run("find_opportunity_attacker", pair).combat_oa_candidate), 1);
expect("a stunned enemy does not swing; the other one does",
  Number(run("find_opportunity_attacker", Object.assign({}, pair, { combat_enemy1_stunned: 2 })).combat_oa_candidate), 2);
expect("nobody swings when both are stunned",
  Number(run("find_opportunity_attacker", Object.assign({}, pair, { combat_enemy1_stunned: 1, combat_enemy2_stunned: 3 })).combat_oa_candidate), 0);

// An enemy retreating from the player, with a melee ally beside it too.
const retreat = {
  weapon_type: "melee", combat_enemy_range: 0, player_oa_used: false, player_stunned: false,
  combat_ally1_hp: 8, combat_ally1_weapon_type: "melee", combat_ally1_range: 0, combat_ally1_oa_used: false
};
let r = run("find_opportunity_attacker_against", retreat);
expect("the ready player takes the swing", r.combat_oa_against_kind, "player");
r = run("find_opportunity_attacker_against", Object.assign({}, retreat, { player_stunned: true }));
expect("a stunned player passes the swing to the ally", r.combat_oa_against_kind + "/" + r.combat_oa_against_slot, "ally/1");
r = run("find_opportunity_attacker_against", Object.assign({}, retreat, { player_stunned: true, combat_ally1_hp: 0 }));
expect("a stunned player with no ally beside the enemy: no swing", r.combat_oa_against_kind, "");

if (failed) process.exit(1);
console.log("Combat reactions OK: stunned enemies and a stunned player take no opportunity attacks.");
