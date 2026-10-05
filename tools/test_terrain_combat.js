#!/usr/bin/env node
/*
 * Scripted smoke tests for the two terrain dev fixtures. This runs the actual ChoiceScript combat scenes through
 * a deterministic headless picker, rather than the lightweight transcript simulator, so cross-scene terrain
 * lookups and NPC turns execute exactly as they do in game.
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
global.printButton = function (label, parent, disabled, callback) { if (callback) callback(); };
load("web/mygame/mygame.js");

// The browser loader uses XHR. The test runner reads the same files directly, like quicktest/randomtest.
Scene.prototype.loadScene = function () {
  this.loadLines(fs.readFileSync("web/mygame/scenes/" + this.name + ".txt", "utf8"));
  this.loaded = true;
  if (this.executing) this.execute();
};
const sceneReturn = Scene.prototype.return;
Scene.prototype.return = function () {
  // Fixtures are entered directly below, whereas the game enters combat through *gosub_scene. Treat that final
  // hand-back as the end of this test invocation, while leaving all ordinary in-combat *gosub returns untouched.
  if (this.name === "combat" && this.stats.combat_outcome) { this.finished = true; return; }
  return sceneReturn.apply(this, arguments);
};

// Execute startup just far enough to apply every *create declaration. The first real player choice is irrelevant
// for these isolated combat fixtures.
Scene.prototype.choice = function () { this.finished = true; };
new Scene("startup", stats, nav, false).execute();
const baseStats = Object.assign({}, stats);

function flatten(options, out) {
  for (const option of options) {
    if (option.suboptions) flatten(option.suboptions, out);
    else if (!option.unselectable) out.push(option);
  }
}

function runFixture(label, mode) {
  const state = Object.assign({}, baseStats, {
    intake_completed: true,
    character_class: "fighter",
    character_level: 1,
    hp_current: 50,
    hp_max: 50,
    armor_class: 16,
    str_mod: 2,
    dex_mod: 3,
    weapon: "longbow",
    weapon_desc: "Longbow",
    weapon_type: "ranged",
    weapon_damage_type: "piercing",
    weapon_damage: "1d6 + 3 Piercing",
    weapon_hands: "two_handed",
    fighting_style: "archery"
  });
  let pending = null;
  let decisions = 0;
  const choices = [];
  const choiceFlags = { traded: false, waited: false };
  const priorPrintedLength = printed.length;

  Scene.prototype.choice = function (data, isFakeChoice) {
    const groups = data ? data.split(/ /) : ["choice"];
    const options = this.parseOptions(this.indent, groups, isFakeChoice === true || this.getVar("implicit_control_flow"));
    const leaves = [];
    flatten(options, leaves);
    if (!leaves.length) throw new Error(this.lineMsg() + " fixture presented no selectable options");
    let pick = null;
    if (mode === "chokepoint" && !choiceFlags.traded) {
      pick = leaves.find(function (o) { return /trade places/i.test(o.name); });
      if (pick) choiceFlags.traded = true;
    }
    // Let the archer take one turn before the player shoots. This makes the two bilateral fixtures prove both
    // halves of their rules: High Ground gives +2/-2, while Cover raises each defender's AC by 2.
    if (!pick && (mode === "high_ground" || mode === "cover") && !choiceFlags.waited) {
      pick = leaves.find(function (o) { return /^end your turn/i.test(o.name); });
      if (pick) choiceFlags.waited = true;
    }
    if (!pick) pick = leaves.find(function (o) { return /attack with your/i.test(o.name); });
    if (!pick) pick = leaves.find(function (o) { return /^end your turn/i.test(o.name); });
    if (!pick) pick = leaves[0];
    choices.push(String(pick.name).replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim());
    decisions++;
    if (decisions > 80) throw new Error(label + " exceeded 80 scripted choices (possible turn-loop)");
    this.finished = true;
    const self = this;
    pending = function () { self.standardResolution(pick); };
  };

  const scene = new Scene("combat", state, nav, false);
  scene.loadScene();
  scene.goto(label);
  scene.execute();
  while (pending) {
    const next = pending;
    pending = null;
    next();
  }
  const transcript = printed.slice(priorPrintedLength).join(" ").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ");
  return { state: state, choices: choices, flags: choiceFlags, transcript: transcript };
}

const high = runFixture("fight_dev_high_ground_test", "high_ground");
if (!/High Ground/.test(high.transcript) || !/Target on High Ground/.test(high.transcript)) {
  throw new Error("High Ground fixture did not produce both uphill and elevated ranged-roll modifiers");
}
if (!/victory|rescued/i.test(high.state.combat_outcome || "")) throw new Error("High Ground fixture did not finish cleanly");

const cover = runFixture("fight_dev_cover_test", "cover");
const coverMentions = (cover.transcript.match(/\+2 Cover/g) || []).length;
if (coverMentions < 2) throw new Error("Cover fixture did not show the +2 AC bonus for both ranged defenders");
if (!/victory|rescued/i.test(cover.state.combat_outcome || "")) throw new Error("Cover fixture did not finish cleanly");

const choke = runFixture("fight_dev_chokepoint_test", "chokepoint");
if (!choke.flags.traded) throw new Error("Chokepoint fixture never offered Trade Places");
if (!/victory|rescued/i.test(choke.state.combat_outcome || "")) throw new Error("Chokepoint fixture did not finish cleanly");

console.log("High Ground fixture: " + high.state.combat_outcome + " after " + high.choices.length + " choices; uphill and elevated modifiers observed.");
console.log("Cover fixture: " + cover.state.combat_outcome + " after " + cover.choices.length + " choices; both defenders received +2 AC.");
console.log("Chokepoint fixture: " + choke.state.combat_outcome + " after " + choke.choices.length + " choices; Trade Places observed.");
