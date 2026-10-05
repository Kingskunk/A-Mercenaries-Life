#!/usr/bin/env node
/*
 * Focused headless checks for Phase 1 terrain intelligence. These exercise the real ChoiceScript profile resolver
 * and shared destination scorer directly; no movement is performed in this phase.
 */
const fs = require("fs");
const vm = require("vm");

global.fs = fs;
global.path = require("path");
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
  // The scorer is invoked directly here, unlike the game where it is entered through *gosub_scene. Its final
  // return therefore ends this probe, while the real cross-scene returns remain untouched.
  if (this.name === "combat_ai" && (!this.temps.choice_substack || !this.temps.choice_substack.length) && (!this.stats.choice_subscene_stack || !this.stats.choice_subscene_stack.length)) {
    this.finished = true;
    return;
  }
  return sceneReturn.apply(this, arguments);
};

Scene.prototype.choice = function () { this.finished = true; };
new Scene("startup", stats, nav, false).execute();
const baseStats = Object.assign({}, stats);
Scene.prototype.choice = function () { throw new Error("Terrain policy probe unexpectedly reached a choice"); };

function score(profile, weapon, currentPosition, candidatePosition, terrain) {
  const state = Object.assign({}, baseStats, {
    combat_enemy1_behavior_profile: profile,
    combat_enemy1_weapon_type: weapon,
    combat_enemy1_position: currentPosition,
    combat_terrain1_type: terrain[0] || "none",
    combat_terrain1_position: terrain[1] || 0,
    combat_terrain2_type: terrain[2] || "none",
    combat_terrain2_position: terrain[3] || 0,
    combat_terrain3_type: terrain[4] || "none",
    combat_terrain3_position: terrain[5] || 0
  });
  const scene = new Scene("combat_ai", state, nav, false);
  scene.loadScene();
  scene.temps.param = ["enemy", 1, candidatePosition];
  scene.goto("combat_score_terrain_destination");
  scene.execute();
  return { score: state.combat_ai_terrain_score, reason: state.combat_ai_terrain_reason };
}

function choose(profile, weapon, currentPosition, targetPosition, mustClose, keepDistance, terrain) {
  const state = Object.assign({}, baseStats, {
    combat_enemy_count: 1,
    combat_enemy1_hp: 10,
    combat_enemy1_behavior_profile: profile,
    combat_enemy1_weapon_type: weapon,
    combat_enemy1_position: currentPosition,
    combat_lane_player_position: targetPosition,
    combat_terrain1_type: terrain[0] || "none",
    combat_terrain1_position: terrain[1] || 0,
    combat_terrain1_capacity: terrain[2] || 0
  });
  const scene = new Scene("combat_ai", state, nav, false);
  scene.loadScene();
  scene.temps.param = ["enemy", 1, targetPosition, mustClose, keepDistance];
  scene.goto("combat_choose_terrain_step");
  scene.execute();
  return {
    direction: state.combat_ai_terrain_step_direction,
    reason: state.combat_ai_terrain_step_reason,
    hold: state.combat_ai_terrain_hold_position,
    score: state.combat_ai_terrain_score,
    legal: state.combat_ai_terrain_destination_legal
  };
}

const sharpshooter = score("sharpshooter", "ranged", 3, 4, ["cover", 4, "high_ground", 4]);
if (sharpshooter.score !== 5 || sharpshooter.reason !== "high_ground") {
  throw new Error("Sharpshooter did not value Cover + High Ground as expected: " + JSON.stringify(sharpshooter));
}

const feral = score("feral", "melee", 3, 4, ["cover", 4, "high_ground", 4]);
if (feral.score !== 0 || feral.reason !== "none") {
  throw new Error("Feral profile made a deliberate terrain choice: " + JSON.stringify(feral));
}

const guardian = score("guardian", "melee", 3, 4, ["chokepoint", 4]);
if (guardian.score !== 3 || guardian.reason !== "chokepoint") {
  throw new Error("Guardian did not value holding a chokepoint: " + JSON.stringify(guardian));
}

const skirmisher = score("skirmisher", "melee", 3, 4, ["difficult_terrain", 4]);
if (skirmisher.score !== -2 || skirmisher.reason !== "avoid_difficult_terrain") {
  throw new Error("Skirmisher did not avoid Difficult Terrain: " + JSON.stringify(skirmisher));
}

const sharpshooterMove = choose("sharpshooter", "ranged", 3, 2, false, true, ["cover", 4]);
if (sharpshooterMove.direction !== "away" || sharpshooterMove.reason !== "cover" || sharpshooterMove.hold) {
  throw new Error("Sharpshooter did not choose the legal Cover step: " + JSON.stringify(sharpshooterMove));
}

const guardianHold = choose("guardian", "melee", 3, 2, true, false, ["chokepoint", 3, 1]);
if (guardianHold.direction !== "none" || guardianHold.reason !== "chokepoint" || !guardianHold.hold) {
  throw new Error("Guardian did not hold its valued chokepoint: " + JSON.stringify(guardianHold));
}

console.log("Terrain AI policy: profile scores, sharpshooter Cover step, and guardian chokepoint hold passed.");
