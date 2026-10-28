#!/usr/bin/env node
const assert = require("assert");
const { play } = require("./scripted_play.js");

const origins = ["ruined", "outlaw", "disgraced"];
const priorities = {
  fighter: ["strength", "constitution", "dexterity"],
  barbarian: ["strength", "constitution", "dexterity"],
  rogue: ["dexterity", "constitution", "wisdom"],
  ranger: ["dexterity", "wisdom", "constitution"],
  bard: ["charisma", "dexterity", "constitution"],
  wizard: ["intelligence", "dexterity", "constitution"],
  warlock: ["charisma", "dexterity", "constitution"]
};
const raceBonuses = {
  human: { strength: 1, dexterity: 1, constitution: 1, intelligence: 1, wisdom: 1, charisma: 1 },
  elf: { dexterity: 2 },
  dwarf: { constitution: 2 },
  half_orc: { strength: 2, constitution: 1 },
  halfling: { dexterity: 2 },
  tiefling: { charisma: 2, intelligence: 1 },
  hexblood: { constitution: 1, charisma: 1 }
};
const abilities = ["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"];
let combinations = 0;
let checks = 0;

function expectedScores(origin, characterClass, race) {
  const expected = Object.fromEntries(abilities.map((ability) => [ability, 10]));
  priorities[characterClass].forEach((ability, index) => { expected[ability] = [16, 14, 12][index]; });
  Object.entries(raceBonuses[race]).forEach(([ability, bonus]) => { expected[ability] += bonus; });
  return expected;
}

const cases = [];
for (const origin of origins) {
  for (const characterClass of Object.keys(priorities)) cases.push({ origin, characterClass, race: "human" });
}
for (const race of Object.keys(raceBonuses).filter((name) => name !== "human")) {
  cases.push({ origin: "disgraced", characterClass: "warlock", race });
}

for (const testCase of cases) {
  const { origin, characterClass, race } = testCase;
  const result = play({
    scene: "prologue/class_select",
    label: "class_done",
    preset: "Vanguard Line Fighter",
    stats: { origin, race, character_class: characterClass }
  });
  assert.deepStrictEqual(result.errors, [], `${origin}/${characterClass}/${race}: ${result.errors.join("; ")}`);
  const expected = expectedScores(origin, characterClass, race);
  for (const ability of abilities) {
    assert.strictEqual(Number(result.s[ability]), expected[ability], `${origin}/${characterClass}/${race} ${ability}`);
    checks++;
  }
  combinations++;
}

const reported = play({
  scene: "prologue/class_select",
  label: "class_done",
  preset: "Vanguard Line Fighter",
  stats: { origin: "disgraced", race: "tiefling", character_class: "warlock" }
}).s;
assert.deepStrictEqual(
  [reported.charisma, reported.dexterity, reported.constitution, reported.intelligence].map(Number),
  [18, 14, 12, 11]
);
checks += 4;

console.log(`class stat priority: ${combinations} branch-covering combinations, ${checks} checks passed`);
