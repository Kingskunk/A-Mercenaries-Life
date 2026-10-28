#!/usr/bin/env node
"use strict";

const assert = require("assert");
const { play } = require("./scripted_play.js");

function run(stats) {
  const result = play({
    scene: "prologue/battle_black_sinks",
    label: "bivouac_odessa_hub",
    preset: "Cadre Dread Warlock",
    stats,
    steps: [{ pick: "Ask about the company", rand: "mid" }]
  });
  assert.deepStrictEqual(result.errors, [], result.errors.join("; "));
  assert.ok(!result.text.includes("Inquire Past"), "obsolete pseudo-skill returned");
  return result.text;
}

const persuasion = run({
  skill_persuasion: true,
  skill_investigation: false,
  cha_mod: 3,
  int_mod: 0,
  guidance_active: false
});
assert.ok(persuasion.includes("D20 Check: Persuasion"), "Persuasion was not selected");
assert.ok(persuasion.includes("Roll: 11 +5 = 16"), "Persuasion proficiency was not applied");

const investigation = run({
  skill_persuasion: false,
  skill_investigation: true,
  cha_mod: 0,
  int_mod: 4,
  guidance_active: false
});
assert.ok(investigation.includes("D20 Check: Investigation"), "Investigation was not selected");
assert.ok(investigation.includes("Roll: 11 +6 = 17"), "Investigation proficiency was not applied");

console.log("Odessa past check: Persuasion and Investigation routes passed");
