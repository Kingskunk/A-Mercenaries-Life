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
const lines = {};
function sceneLines(name) { return lines[name] || (lines[name] = fs.readFileSync("web/mygame/scenes/" + name + ".txt", "utf8")); }
// combat_can_react lives in combat_dice and takes *params, so it is entered with them set, the way *gosub_scene passes them.
Scene.prototype.return = function () {
  if ((this.name === "combat" || this.name === "combat_dice") && (!this.temps.choice_substack || !this.temps.choice_substack.length) &&
      (!this.stats.choice_subscene_stack || !this.stats.choice_subscene_stack.length)) { this.finished = true; return; }
  return sceneReturn.apply(this, arguments);
};
function run(label, overrides, sceneName, params) {
  const state = Object.assign({}, base, overrides);
  const scene = new Scene(sceneName || "combat", state, nav, false);
  scene.loadLines(sceneLines(sceneName || "combat"));
  scene.loaded = true;
  if (params) scene.temps.param = params;
  scene.goto(label);
  scene.execute();
  return state;
}
function canReact(kind, slot, overrides) { return run("combat_can_react", overrides, "combat_dice", [kind, slot]).combat_can_react_ok; }

// The shared check every reaction asks.
expect("a ready player can react", canReact("player", 0, { hp_current: 10, player_oa_used: false, player_stunned: false }), true);
expect("a stunned player cannot", canReact("player", 0, { hp_current: 10, player_oa_used: false, player_stunned: true }), false);
expect("a player whose reaction is spent cannot", canReact("player", 0, { hp_current: 10, player_oa_used: true }), false);
expect("a ready ally can react", canReact("ally", 2, { combat_ally2_hp: 6, combat_ally2_oa_used: false, combat_ally2_stunned: 0 }), true);
expect("a stunned ally cannot", canReact("ally", 2, { combat_ally2_hp: 6, combat_ally2_oa_used: false, combat_ally2_stunned: 1 }), false);
expect("a downed ally cannot", canReact("ally", 2, { combat_ally2_hp: 0, combat_ally2_oa_used: false, combat_ally2_stunned: 0 }), false);
expect("a stunned enemy cannot", canReact("enemy", 3, { combat_enemy3_hp: 6, combat_enemy3_oa_used: false, combat_enemy3_stunned: 2 }), false);
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

r = run("find_opportunity_attacker_against", Object.assign({}, retreat, { player_stunned: true, combat_ally1_stunned: 1 }));
expect("a stunned player beside a stunned ally: no swing", r.combat_oa_against_kind, "");

if (failed) process.exit(1);
console.log("Combat reactions OK: combat_can_react, and no opportunity attack from a stunned enemy, player or ally.");
