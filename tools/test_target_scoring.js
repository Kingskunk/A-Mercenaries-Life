#!/usr/bin/env node
/*
 * test_target_scoring.js -- target scoring (combat_ai.txt combat_score_targets) through the real ChoiceScript pickers:
 * choose_melee_enemy_target, choose_ranged_enemy_target and select_ally_attack_target, one scenario per profile and factor.
 * Lane positions are absolute tiles; the player stands on tile 3 unless a scenario says otherwise.
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
  // The picker is entered directly, so its own last *return (with nothing left on either stack) ends the probe.
  if (this.name === "combat_ai" && (!this.temps.choice_substack || !this.temps.choice_substack.length) &&
      (!this.stats.choice_subscene_stack || !this.stats.choice_subscene_stack.length)) { this.finished = true; return; }
  return sceneReturn.apply(this, arguments);
};
Scene.prototype.choice = function () { this.finished = true; };
new Scene("startup", stats, nav, false).execute();
const base = Object.assign({}, stats);
Scene.prototype.choice = function () { throw new Error("scoring probe reached a choice"); };
let printed = [];
global.printx = global.printParagraph = function (msg) { printed.push(String(msg)); };

function run(label, slot, overrides) {
  printed = [];
  const state = Object.assign({}, base, {
    page_id: 50, combat_round: 2, combat_enemy_count: 1, combat_lane_player_position: 3, hp_current: 20, hp_max: 20,
    weapon_type: "melee", character_class: "fighter", combat_player_hidden: false
  }, overrides);
  const scene = new Scene("combat_ai", state, nav, false);
  scene.loadScene();
  scene.temps.param = [slot];
  scene.goto(label);
  scene.execute();
  printed.push((scene.accumulatedParagraph || []).join(""));
  return state;
}
function enemy(n, o) { const r = {}; Object.keys(o).forEach((k) => { r["combat_enemy" + n + "_" + k] = o[k]; }); return r; }
function ally(n, o) { const r = {}; Object.keys(o).forEach((k) => { r["combat_ally" + n + "_" + k] = o[k]; }); return r; }
function pick(state) { return state.combat_score_best_kind + (state.combat_score_best_slot > 0 ? Number(state.combat_score_best_slot) : ""); }
let failed = 0;
function expect(what, got, want, state) {
  if (got !== want) { failed++; console.error("FAIL " + what + ": got " + got + ", want " + want + (state ? "  [" + state.combat_score_reason + "]" : "")); }
  else console.log("  ok  " + what + "  [" + (state ? state.combat_score_reason : "") + "]");
}
const rat = { hp: 4, max_hp: 4, weapon_type: "melee", behavior_profile: "feral", dmg_dice_sides: 4, dmg_bonus: 1, position: 5 };
const knife = { hp: 10, max_hp: 10, weapon_type: "melee", behavior_profile: "skirmisher", dmg_dice_sides: 6, dmg_bonus: 2, position: 4 };
const archer = { hp: 7, max_hp: 7, weapon_type: "ranged", behavior_profile: "sharpshooter", dmg_dice_sides: 6, dmg_bonus: 3, reach: "long", position: 8 };
const kess = { hp: 10, max_hp: 10, weapon_type: "ranged", behavior_profile: "sharpshooter", dmg_dice_sides: 6, dmg_bonus: 3, position: 1, name: "Kess" };
const rook = { hp: 12, max_hp: 12, weapon_type: "melee", behavior_profile: "guardian", dmg_dice_sides: 8, dmg_bonus: 2, position: 4, name: "Rook" };
let s;

console.log("Feral (close + payback):");
s = run("choose_melee_enemy_target", 1, Object.assign(enemy(1, rat), ally(1, Object.assign({}, rook, { position: 5 }))));
expect("a rat goes for the ally on its own tile over the player two steps off", pick(s), "ally1", s);
s = run("choose_melee_enemy_target", 1, Object.assign(enemy(1, Object.assign({}, rat, { last_hit_kind: "player", last_hit_slot: 0, last_hit_round: 2 })), ally(1, Object.assign({}, rook, { position: 5 }))));
expect("...but turns on the player who just hit it", pick(s), "player", s);
s = run("choose_melee_enemy_target", 1, Object.assign(enemy(1, Object.assign({}, rat, { last_hit_kind: "player", last_hit_slot: 0, last_hit_round: 0 })), ally(1, Object.assign({}, rook, { position: 5 }))));
expect("...and forgets a hit from two rounds ago", pick(s), "ally1", s);

console.log("Skirmisher (soft + isolated):");
s = run("choose_melee_enemy_target", 1, Object.assign(enemy(1, knife), ally(1, Object.assign({}, rook, { position: 3 })), ally(2, kess)));
expect("a knifeman passes the guarded fighter beside it for the lone archer at the back", pick(s), "ally2", s);
expect("...and is told to close on her (not engaged yet)", Number(s.combat_enemy_goal_ally), 2);
s = run("choose_melee_enemy_target", 1, Object.assign(enemy(1, knife), ally(1, Object.assign({}, rook, { position: 1 })), ally(2, kess)));
expect("with Rook standing over her she is no longer isolated, and the knifeman takes the nearer player", pick(s), "player", s);

console.log("Sharpshooter (can drop + wounded):");
s = run("choose_ranged_enemy_target", 1, Object.assign(enemy(1, archer), ally(1, Object.assign({}, rook, { hp: 3 }))));
expect("an archer finishes the ally it can drop this turn", pick(s), "ally1", s);
expect("...through the attack-the-ally branch", Number(s.combat_intercepting_ally), 1);
s = run("choose_ranged_enemy_target", 1, Object.assign(enemy(1, archer), ally(1, rook), { hp_current: 9 }));
expect("with nobody to finish, it shoots the more wounded player", pick(s), "player", s);

console.log("Reach and cornering:");
s = run("choose_ranged_enemy_target", 1, Object.assign(enemy(1, Object.assign({}, archer, { reach: "medium", position: 5 })), ally(1, Object.assign({}, kess, { position: 0, hp: 2 }))));
expect("a medium-reach slinger cannot pick the dying ally out of its reach, so it shoots the player", pick(s), "player", s);
s = run("choose_ranged_enemy_target", 1, Object.assign(enemy(1, Object.assign({}, archer, { position: 5 })), ally(1, Object.assign({}, rook, { position: 5 })), { hp_current: 2 }));
expect("a cornered archer can only answer the one on its tile, not the dying player", pick(s), "ally1", s);
expect("...and knows it is cornered", s.combat_ranged_cornered, true);
s = run("choose_melee_enemy_target", 1, Object.assign(enemy(1, rat), { combat_player_hidden: true }));
expect("a hidden player is no candidate (nobody left)", pick(s), "");

console.log("Guardian ally (payback on behalf of its side):");
const pair = Object.assign({ combat_enemy_count: 2 }, enemy(1, Object.assign({}, rat, { position: 4, hp: 4 })), enemy(2, Object.assign({}, knife, { position: 6 })));
s = run("select_ally_attack_target", 1, Object.assign({}, pair, ally(1, rook), { combat_player_chosen_target: 0 }));
expect("Rook takes the rat on his own tile", pick(s), "enemy1", s);
s = run("select_ally_attack_target", 1, Object.assign({}, pair, ally(1, rook), { combat_player_chosen_target: 0, player_last_hit_kind: "enemy", player_last_hit_slot: 2, player_last_hit_round: 2 }));
expect("...but goes after the knifeman that just hurt the player", pick(s), "enemy2", s);

console.log("Current target (no switching on a tie):");
const twin = Object.assign({ combat_enemy_count: 1 }, enemy(1, Object.assign({}, rat, { position: 3 })), ally(1, Object.assign({}, rook, { position: 3, hp: 20, max_hp: 20 })));
s = run("choose_melee_enemy_target", 1, twin);
expect("level scores: the first found (the player)", pick(s), "player", s);
s = run("choose_melee_enemy_target", 1, Object.assign({}, twin, enemy(1, Object.assign({}, rat, { position: 3, target_kind: "ally", target_slot: 1 }))));
expect("...unless it was already on the ally", pick(s), "ally1", s);
expect("the pick is remembered for next turn", s.combat_enemy1_target_kind + s.combat_enemy1_target_slot, "ally1");

console.log("Refresh-safe:");
s = run("choose_melee_enemy_target", 1, Object.assign(enemy(1, Object.assign({}, rat, { last_hit_kind: "player", last_hit_slot: 0, last_hit_round: 2, last_hit_page: 50 })), ally(1, Object.assign({}, rook, { position: 5 }))));
expect("a hit landed later on THIS page is not seen yet (a refresh reads what the first pass read)", pick(s), "ally1", s);
s = run("choose_melee_enemy_target", 1, Object.assign(enemy(1, Object.assign({}, rat, { last_hit_kind: "ally", last_hit_slot: 1, last_hit_round: 2, last_hit_page: 50,
  prev_hit_kind: "player", prev_hit_slot: 0, prev_hit_round: 2 })), ally(1, Object.assign({}, rook, { position: 5 }))));
expect("...it reads the record from before this page instead", pick(s), "player", s);
s = run("choose_melee_enemy_target", 1, Object.assign({}, twin, enemy(1, Object.assign({}, rat, { position: 3, target_kind: "player", target_slot: 0, target_page: 50, prev_target_kind: "ally", prev_target_slot: 1 }))));
expect("its own pick from this page is not its current target; the one before is", pick(s), "ally1", s);

console.log("Explain line:");
s = run("choose_melee_enemy_target", 1, Object.assign(enemy(1, Object.assign({}, rat, { name: "Lead Rat" })), { combat_ai_explain: true }));
const line = printed.join(" ");
expect("prints who and why while combat_ai_explain is on", /🧠 Lead Rat → you: .*close/.test(line), true);

if (failed) { console.error(failed + " scenario(s) failed."); process.exit(1); }
console.log("Target scoring OK.");
