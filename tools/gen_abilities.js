#!/usr/bin/env node
/*
 * gen_abilities.js -- generates the assigned-ability facts lookup from tools/ability_book.json.
 *
 * WHY (COMBAT_ENGINE_PLAN.md 3.4a): an enemy's unique abilities (Multiattack, a net, a special move) used to be
 * wired one by one, each in its own way, so no body could carry a mix of them. They now live in one catalog, and
 * an enemy or ally holds up to three of them in ability slots (combat_enemyN_ability_1..3), as it holds assigned
 * spells. This writes the one lookup every resolver asks: ability_facts_load <id>.
 *
 * HOW: the same GEN:BEGIN/GEN:END marker-block replacement gen_spells.js uses, so the block is never hand-edited --
 * the next run overwrites it. Indentation is taken from the BEGIN line. Strict: an unknown kind, an unknown key
 * for a kind, or a bad number throws.
 *
 * Usage: node tools/gen_abilities.js [--check]      --check exits 1 if the block is stale
 */
"use strict";
var fs = require("fs");
var path = require("path");

var ROOT = path.join(__dirname, "..");
var TARGET = path.join(ROOT, "web", "mygame", "scenes", "combat_abilities.txt");
var BOOK = JSON.parse(fs.readFileSync(path.join(__dirname, "ability_book.json"), "utf8"));
var CHECK = process.argv.indexOf("--check") !== -1;

var COMMON_KEYS = { name: true, kind: true, uses: true, desc: true };
var KIND_KEYS = {
  extra_attack: { extra_attacks: true, weapon: true, damage_dice_sides: true, damage_type: true },
  attack_variant: { chance: true, damage_dice_sides: true, damage_bonus: true, damage_type: true, condition_name: true, condition_icon: true },
  action: { chance: true, range_min: true, range_max: true, condition: true, escape_dc: true, src: true },
  on_hit_rider: {},
  trait: {}
};

function fail(id, msg) { throw new Error("ability_book.json: " + id + ": " + msg); }
function posInt(id, key, v) {
  if (typeof v !== "number" || v !== Math.floor(v) || v < 1) fail(id, key + " must be a whole number of at least 1");
  return v;
}
function csString(id, key, v) {
  if (typeof v !== "string" || v.indexOf('"') >= 0) fail(id, key + " must be a string with no double quotes");
  return v;
}

var abilities = BOOK.abilities || {};
var L = [];
L.push("*set ability_fact_name \"\"");
L.push("*set ability_fact_kind \"\"");
L.push("*set ability_fact_uses 0");
L.push("*set ability_fact_extra_attacks 0");
L.push("*set ability_fact_dmg_dice_sides 0");
L.push("*set ability_fact_weapon \"\"");
L.push("*set ability_fact_dmg_type \"\"");
L.push("*set ability_fact_chance 0");
L.push("*set ability_fact_range_min 0");
L.push("*set ability_fact_range_max 0");
L.push("*set ability_fact_condition \"\"");
L.push("*set ability_fact_escape_dc 0");
L.push("*set ability_fact_src \"\"");
L.push("*set ability_fact_dmg_bonus 0");
L.push("*set ability_fact_cond_name \"\"");
L.push("*set ability_fact_cond_icon \"\"");
var CONDITIONS = { restrained: 1 };
function band(id, key, v) {
  if (typeof v !== "number" || v !== Math.floor(v) || v < 0 || v > 5) fail(id, key + " must be a range band, 0 (Engaged) to 5");
  return v;
}
var DAMAGE_TYPES = { acid: 1, bludgeoning: 1, cold: 1, fire: 1, force: 1, lightning: 1, necrotic: 1, piercing: 1, poison: 1, psychic: 1, radiant: 1, slashing: 1, thunder: 1 };
Object.keys(abilities).sort().forEach(function (id) {
  if (!/^[a-z][a-z0-9_]*$/.test(id)) fail(id, "an id is lowercase letters, digits and underscores");
  var a = abilities[id];
  if (!Object.prototype.hasOwnProperty.call(KIND_KEYS, a.kind)) fail(id, "unknown kind '" + a.kind + "'");
  Object.keys(a).forEach(function (k) {
    if (!COMMON_KEYS[k] && !KIND_KEYS[a.kind][k]) fail(id, "unknown key '" + k + "' for kind " + a.kind);
  });
  var uses = -1;
  if (a.uses !== "unlimited") uses = posInt(id, "uses", a.uses);
  L.push("*if (afl_id = \"" + id + "\")");
  L.push("  *set ability_fact_name \"" + csString(id, "name", a.name) + "\"");
  L.push("  *set ability_fact_kind \"" + a.kind + "\"");
  // A bare "*set x -1" is ChoiceScript shorthand for subtracting 1, so unlimited is written (0 - 1).
  L.push("  *set ability_fact_uses " + (uses < 0 ? "(0 - 1)" : uses));
  if (a.kind === "extra_attack") {
    L.push("  *set ability_fact_extra_attacks " + posInt(id, "extra_attacks", a.extra_attacks));
    // "own": the body's own weapon, so the entry names no die or type. "offhand": a second weapon, so it must name both.
    if (a.weapon === "own") {
      if (a.damage_dice_sides !== undefined || a.damage_type !== undefined) fail(id, "an \"own\" weapon takes the body's die and type; drop damage_dice_sides and damage_type");
    } else if (a.weapon === "offhand") {
      L.push("  *set ability_fact_dmg_dice_sides " + posInt(id, "damage_dice_sides", a.damage_dice_sides));
      if (!DAMAGE_TYPES[a.damage_type]) fail(id, "damage_type must be a damage type, got '" + a.damage_type + "'");
      L.push("  *set ability_fact_dmg_type \"" + a.damage_type + "\"");
    } else {
      fail(id, "weapon must be \"own\" or \"offhand\"");
    }
    L.push("  *set ability_fact_weapon \"" + a.weapon + "\"");
  }
  if (a.kind === "attack_variant") {
    var vch = posInt(id, "chance", a.chance);
    if (vch > 100) fail(id, "chance is 1 to 100");
    if (typeof a.damage_bonus !== "number" || a.damage_bonus !== Math.floor(a.damage_bonus)) fail(id, "damage_bonus must be a whole number");
    if (!DAMAGE_TYPES[a.damage_type]) fail(id, "damage_type must be a damage type, got '" + a.damage_type + "'");
    L.push("  *set ability_fact_chance " + vch);
    L.push("  *set ability_fact_dmg_dice_sides " + posInt(id, "damage_dice_sides", a.damage_dice_sides));
    L.push("  *set ability_fact_dmg_bonus " + (a.damage_bonus < 0 ? "(0 - " + (-a.damage_bonus) + ")" : a.damage_bonus));
    L.push("  *set ability_fact_dmg_type \"" + a.damage_type + "\"");
    L.push("  *set ability_fact_cond_name \"" + csString(id, "condition_name", a.condition_name) + "\"");
    L.push("  *set ability_fact_cond_icon \"" + csString(id, "condition_icon", a.condition_icon) + "\"");
  }
  if (a.kind === "action") {
    var ch = posInt(id, "chance", a.chance);
    if (ch > 100) fail(id, "chance is 1 to 100");
    var lo = band(id, "range_min", a.range_min), hi = band(id, "range_max", a.range_max);
    if (lo > hi) fail(id, "range_min is above range_max");
    L.push("  *set ability_fact_chance " + ch);
    L.push("  *set ability_fact_range_min " + lo);
    L.push("  *set ability_fact_range_max " + hi);
    if (a.condition !== undefined) {
      if (!CONDITIONS[a.condition]) fail(id, "condition must be one the engine applies here: " + Object.keys(CONDITIONS).join(", "));
      L.push("  *set ability_fact_condition \"" + a.condition + "\"");
      L.push("  *set ability_fact_escape_dc " + posInt(id, "escape_dc", a.escape_dc));
      L.push("  *set ability_fact_src \"" + csString(id, "src", a.src) + "\"");
    }
  }
});

function markerIndex(rows, kind, name) {
  var tag = "GEN:" + kind + " " + name;
  for (var i = 0; i < rows.length; i++) {
    var body = rows[i].replace(/^\s*\*comment\s+/, "").trim();
    if (body === tag || body.indexOf(tag + " ") === 0) return i;
  }
  return -1;
}
var raw = fs.readFileSync(TARGET, "utf8");
var eol = raw.indexOf("\r\n") >= 0 ? "\r\n" : "\n";
var rows = raw.split(/\r?\n/);
var b = markerIndex(rows, "BEGIN", "ability_facts_load");
var e = markerIndex(rows, "END", "ability_facts_load");
if (b < 0 || e < 0 || e < b) throw new Error("combat_abilities.txt: missing GEN:BEGIN/GEN:END ability_facts_load");
var indent = rows[b].slice(0, rows[b].length - rows[b].trimLeft().length);
var out = rows.slice(0, b + 1).concat(L.map(function (l) { return indent + l; }), rows.slice(e)).join(eol);
if (out === raw) {
  console.log("gen_abilities: combat_abilities.txt is up to date (" + Object.keys(abilities).length + " abilities).");
} else if (CHECK) {
  console.error("gen_abilities: combat_abilities.txt is stale; run node tools/gen_abilities.js");
  process.exit(1);
} else {
  fs.writeFileSync(TARGET, out);
  console.log("gen_abilities: wrote ability_facts_load (" + Object.keys(abilities).length + " abilities) into combat_abilities.txt.");
}
