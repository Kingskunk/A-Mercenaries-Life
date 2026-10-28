#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const statsPath = path.join(root, "web", "mygame", "scenes", "choicescript_stats.txt");
const spellDataPath = path.join(root, "web", "mygame", "spell-data.js");
const source = fs.readFileSync(statsPath, "utf8");

global.window = {};
vm.runInThisContext(fs.readFileSync(spellDataPath, "utf8"), { filename: spellDataPath });

const cardIds = Array.from(source.matchAll(/\*if \(ability_id = "([^"]+)"\)/g), match => match[1]);
const errors = [];

for (const spell of window.SPELL_DATA) {
  const count = cardIds.filter(id => id === spell.id).length;
  if (count !== 1) errors.push(`${spell.id}: expected one ability card, found ${count}`);
}

for (const id of cardIds) {
  if (!window.SPELL_DATA.some(spell => spell.id === id)) errors.push(`${id}: ability card has no spell-data entry`);
}

const grimoireStart = source.indexOf("*label codex_abilities");
const grimoireEnd = source.indexOf("*return", source.indexOf("*label print_ability_card"));
const grimoire = source.slice(grimoireStart, grimoireEnd);

if (/\b\d+\s*(?:ft\.?|feet)\b/i.test(grimoire)) errors.push("grimoire uses tabletop distance units");

const requiredText = [
  "Ranger Spell Slots:",
  "*set ab_casting_stat \"Wisdom\"",
  "Mage Armor — Action · Self · 24 hours.",
  "False Life — Action · Self · 12 hours.",
  "Ray of Frost — Combat: Action · Medium Reach",
  "Chill Touch — Combat: Action · Medium Reach",
  "Blade Ward — Combat: Bonus Action.",
  "Dissonant Whispers — Combat: Action · Medium Reach",
  "3d6 + casting modifier Psychic damage",
  "At certain lethal moments, you can endure the blow instead of falling."
];

for (const text of requiredText) {
  if (!grimoire.includes(text)) errors.push(`missing audited text: ${text}`);
}

const staleText = [
  "full recovery on a Long Rest",
  "Mage Armor — Action, Touch, 8 Hours",
  "False Life — Action, Self, 1 Hour",
  "Chill Touch — Action, 120 ft",
  "Thaumaturgy — Action, 30 ft",
  "authored",
  "shared combat",
  "combat engine",
  "recorded as known",
  "currently no",
  "no generic",
  "not modelled",
  "no free-roaming",
  "nothing calls"
];

for (const text of staleText) {
  if (grimoire.includes(text)) errors.push(`stale grimoire text remains: ${text}`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`abilities reference: ${window.SPELL_DATA.length} spell cards covered; no tabletop distances or audited stale text`);
