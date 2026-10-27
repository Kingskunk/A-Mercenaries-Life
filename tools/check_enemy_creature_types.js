"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const typesPath = path.join(root, "web", "mygame", "scenes", "combat_types.txt");
const combatPath = path.join(root, "web", "mygame", "scenes", "combat.txt");
const startupPath = path.join(root, "web", "mygame", "scenes", "startup_parts", "31_combat_engine_state.txt");
const types = fs.readFileSync(typesPath, "utf8");
const combat = fs.readFileSync(combatPath, "utf8");
const startup = fs.readFileSync(startupPath, "utf8");

function section(source, startLabel, endLabel) {
  const start = source.indexOf(`*label ${startLabel}`);
  const end = source.indexOf(`*label ${endLabel}`, start + 1);
  if (start < 0 || end < 0) throw new Error(`Could not find ${startLabel} section`);
  return source.slice(start, end);
}

const dispatch = section(types, "apply_enemy_type", "apply_ally_type");
const libraryTypes = [...dispatch.matchAll(/^\*if \(combat_apply_type = "([^"]+)"\)/gm)].map((m) => m[1]);
const mapping = section(types, "assign_enemy_creature_type", "apply_ability_score_range");
const allowed = new Set(["humanoid", "beast", "plant", "undead"]);
const classified = new Map();
let pending = [];

for (const line of mapping.split(/\r?\n/)) {
  if (/^\*(?:if|elseif) /.test(line)) {
    pending = [...line.matchAll(/aect_type = "([^"]+)"/g)].map((m) => m[1]);
    continue;
  }
  const assignment = line.match(/^  \*set aect_value "([^"]+)"/);
  if (!assignment) continue;
  const category = assignment[1];
  if (!allowed.has(category)) throw new Error(`Invalid creature type category: ${category}`);
  for (const enemyType of pending) {
    if (classified.has(enemyType)) throw new Error(`Enemy archetype classified twice: ${enemyType}`);
    classified.set(enemyType, category);
  }
  pending = [];
}

const missing = libraryTypes.filter((enemyType) => !classified.has(enemyType));
const stale = [...classified.keys()].filter((enemyType) => !libraryTypes.includes(enemyType));
if (missing.length) throw new Error(`Unclassified enemy archetype(s): ${missing.join(", ")}`);
if (stale.length) throw new Error(`Creature type mapping has unknown archetype(s): ${stale.join(", ")}`);

for (let slot = 0; slot <= 6; slot += 1) {
  for (const suffix of ["creature_type", "creature_type_override"]) {
    const declaration = `*create combat_enemy${slot}_${suffix} ""`;
    if (!startup.includes(declaration)) throw new Error(`Missing startup declaration: ${declaration}`);
  }
}
for (const suffix of ["creature_type", "creature_type_override"]) {
  const declaration = `*create combat_enemy_${suffix} ""`;
  if (!startup.includes(declaration)) throw new Error(`Missing active-target declaration: ${declaration}`);
}
if (!combat.includes('*set combat_enemy_creature_type {(fti_p & "creature_type")}')) {
  throw new Error("Active-target creature type is not synchronized in fight_sync_target_in");
}
if (!combat.includes('*set {(fc_p & "creature_type")} ""')) {
  throw new Error("Per-slot creature type is not reset in fight_cleanup");
}

const summary = [...classified.entries()]
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([enemyType, category]) => `${enemyType}=${category}`)
  .join(", ");
console.log(`Enemy creature types OK (${classified.size}): ${summary}`);
