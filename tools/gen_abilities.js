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
  extra_attack: { extra_attacks: true, damage_dice_sides: true },
  attack_variant: {},
  action: {},
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
    L.push("  *set ability_fact_dmg_dice_sides " + posInt(id, "damage_dice_sides", a.damage_dice_sides));
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
