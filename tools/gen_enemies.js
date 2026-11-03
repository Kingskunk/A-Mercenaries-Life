#!/usr/bin/env node
/*
 * gen_enemies.js -- generates the enemy type library in web/mygame/scenes/combat_types.txt from tools/enemy_catalog.json.
 *
 * WHY: each enemy type used to be a hand-written apply_type_<name> label with every line written twice, once for
 * slot 1's bare combat_enemy_* names and once for the numbered slots, plus a line in five separate mapping labels
 * (dispatch, behaviour profile, size, creature type, reach). Adding a type meant about seven edits, adding a per-type
 * field meant about thirty, and the two copies could drift apart (the Mire-Rat's DEX did). Now a type is one
 * catalog entry, and each label below is written once for every slot through a prefix.
 *
 * HOW: the same GEN:BEGIN/GEN:END marker-block replacement gen_gear.js and gen_spells.js use, so a block is
 * never hand-edited -- the next run overwrites it. Indentation is taken from the BEGIN line.
 *
 * Usage: node tools/gen_enemies.js [--check]      --check exits 1 if any block is stale (for lint/CI)
 * Then:  node tools/test_enemy_catalog.js          builds every type in the real engine and checks the result
 */
"use strict";
var fs = require("fs");
var path = require("path");

var ROOT = path.join(__dirname, "..");
var SCENES = path.join(ROOT, "web", "mygame", "scenes");
var TYPES_FILE = path.join(SCENES, "combat_types.txt");
var PROSE_FILE = path.join(SCENES, "combat_prose.txt");
var CATALOG = JSON.parse(fs.readFileSync(path.join(__dirname, "enemy_catalog.json"), "utf8"));
var CHECK = process.argv.indexOf("--check") !== -1;
var types = CATALOG.types;

// ---------------------------------------------------------------- validation
var ABILITIES = ["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"];
var CREATURE_TYPES = { humanoid: 1, beast: 1, plant: 1, undead: 1 };
var SIZES = { small: 1, medium: 1, large: 1 };
var REACH = { touch: 1, short: 1, medium: 1, long: 1 };
var MORALE = { fearless: 1, steady: 1, normal: 1, skittish: 1 };
var WEAPONS = { melee: 1, ranged: 1 };
var DMG_TYPES = { slashing: 1, piercing: 1, bludgeoning: 1, poison: 1, fire: 1, cold: 1, lightning: 1, thunder: 1, acid: 1, necrotic: 1, radiant: 1, psychic: 1, force: 1 };
// The profiles resolve_behavior_profile knows (feral is its default: every knob at zero).
var typesSource = fs.readFileSync(TYPES_FILE, "utf8");
var PROFILES = { feral: 1 };
(typesSource.match(/rbp_profile = "([a-z_]+)"/g) || []).forEach(function (m) { PROFILES[m.match(/"([a-z_]+)"/)[1]] = 1; });
var prose = fs.readFileSync(PROSE_FILE, "utf8");

var problems = [];
function bad(t, msg) { problems.push("enemy '" + (t.id || "?") + "': " + msg); }
function isInt(v) { return typeof v === "number" && Math.floor(v) === v; }
function dmgType(t, where, v) { if (!DMG_TYPES[v]) bad(t, where + " damage type '" + v + "' is not one of " + Object.keys(DMG_TYPES).join(" | ")); }
var seen = {};
types.forEach(function (t) {
  if (!/^[a-z][a-z0-9_]*$/.test(t.id || "")) bad(t, "id must be lower_snake_case");
  if (seen[t.id]) bad(t, "duplicate id");
  seen[t.id] = 1;
  ["name", "epithet"].forEach(function (k) { if (typeof t[k] !== "string" || !t[k]) bad(t, "needs a " + k); });
  ["hp", "ac"].forEach(function (k) { if (!isInt(t[k]) || t[k] < 1) bad(t, k + " must be a whole number above 0"); });
  if (!CREATURE_TYPES[t.creature_type]) bad(t, "creature_type must be " + Object.keys(CREATURE_TYPES).join(" | "));
  if (!SIZES[t.size]) bad(t, "size must be " + Object.keys(SIZES).join(" | "));
  if (!isInt(t.proficiency) || t.proficiency < 1 || t.proficiency > 9) bad(t, "proficiency must be a whole number from 1 to 9 (+2 is levels 1-4)");
  if (!isInt(t.resolve) || t.resolve < 0 || t.resolve > 10) bad(t, "resolve must be a whole number from 0 to 10");
  if (!MORALE[t.morale]) bad(t, "morale must be " + Object.keys(MORALE).join(" | "));
  if (!PROFILES[t.profile]) bad(t, "profile '" + t.profile + "' is not one resolve_behavior_profile knows (" + Object.keys(PROFILES).join(" | ") + ")");
  var a = t.attack || {};
  if (!WEAPONS[a.weapon_type]) bad(t, "attack.weapon_type must be melee | ranged");
  if (!isInt(a.dice) || a.dice < 1) bad(t, "attack.dice must be the damage die's sides");
  dmgType(t, "attack", a.dmg_type);
  ["atk_bonus", "dmg_bonus"].forEach(function (k) { if (a[k] !== undefined && !isInt(a[k])) bad(t, "attack." + k + " must be a whole number"); });
  if (t.reach !== undefined) {
    if (!REACH[t.reach]) bad(t, "reach must be " + Object.keys(REACH).join(" | "));
    if (a.weapon_type !== "ranged") bad(t, "reach only applies to a ranged type");
  }
  ABILITIES.forEach(function (k) {
    var r = (t.abilities || {})[k];
    if (!Array.isArray(r) || r.length !== 2 || !isInt(r[0]) || !isInt(r[1]) || r[0] > r[1] || r[0] < 1 || r[1] > 30) bad(t, "abilities." + k + " must be [low, high]");
  });
  Object.keys(t.abilities || {}).forEach(function (k) { if (ABILITIES.indexOf(k) === -1) bad(t, "unknown ability '" + k + "'"); });
  if (t.move2) {
    var m = t.move2;
    if (!isInt(m.chance) || m.chance < 1 || m.chance > 100) bad(t, "move2.chance must be a percent from 1 to 100");
    ["atk_bonus", "dice", "dmg_bonus"].forEach(function (k) { if (!isInt(m[k])) bad(t, "move2." + k + " must be a whole number"); });
    dmgType(t, "move2", m.dmg_type);
    if (m.condition && (!m.condition.name || !m.condition.icon)) bad(t, "move2.condition needs a name and an icon");
  }
  if (t.sidearm) {
    var s = t.sidearm;
    if (!WEAPONS[s.weapon_type]) bad(t, "sidearm.weapon_type must be melee | ranged");
    if (!isInt(s.dice)) bad(t, "sidearm.dice must be the damage die's sides");
    dmgType(t, "sidearm", s.dmg_type);
    ["atk_bonus", "dmg_bonus"].forEach(function (k) { if (s[k] !== "weapon" && !isInt(s[k])) bad(t, "sidearm." + k + " must be a whole number or \"weapon\""); });
  }
  if (t.stun !== undefined && (!t.stun || !t.stun.name || !t.stun.icon)) bad(t, "stun needs a name and an icon");
  if (t.vulnerable !== undefined) String(t.vulnerable).split(/\s+/).forEach(function (v) { dmgType(t, "vulnerable", v); });
  // The type's own hit, miss and special-move lines: fight_narrate_enemy_turn finds them by flavor_type.
  if (prose.indexOf("*label flavor_type_" + t.id + "\n") === -1 && prose.indexOf("*label flavor_type_" + t.id + "\r\n") === -1) {
    bad(t, "has no *label flavor_type_" + t.id + " in combat_prose.txt (write its hit and miss lines first)");
  }
  if (prose.indexOf('(fft_type = "' + t.id + '")') === -1) bad(t, "is not listed in combat_prose.txt flavor_from_type");
});
if (problems.length) { console.error("gen_enemies: tools/enemy_catalog.json has problems:\n  " + problems.join("\n  ")); process.exit(1); }

// ---------------------------------------------------------------- generation
function q(s) { return JSON.stringify(String(s)); }
function set(field, value) { return "*set {(apt_p & " + q(field) + ")} " + value; }

function genTypeLabel(t) {
  var L = [];
  L.push("*label apply_type_" + t.id);
  (t.notes || []).forEach(function (n) { L.push("*comment " + n); });
  L.push("*comment One block for every slot: apt_p is the bare combat_enemy_ prefix for slot 1 and combat_enemyN_ for the rest.");
  L.push("*temp apt_p \"combat_enemy_\"");
  L.push("*if (combat_apply_slot > 1)");
  L.push("  *set apt_p ((\"combat_enemy\" & combat_apply_slot) & \"_\")");
  L.push(set("name", q(t.name)));
  L.push(set("hp", t.hp));
  L.push(set("max_hp", t.hp));
  L.push(set("ac", t.ac));
  L.push(set("dmg_dice_sides", t.attack.dice));
  L.push(set("epithet", q(t.epithet)));
  L.push(set("dmg_type", q(t.attack.dmg_type)));
  // weapon_type must be written before apply_derived_combat_bonuses, which reads it to pick DEX over STR.
  if (t.attack.weapon_type !== "melee") L.push(set("weapon_type", q(t.attack.weapon_type)));
  if (t.move2) {
    var m = t.move2;
    L.push(set("move2_chance", m.chance));
    L.push(set("move2_atk_bonus", m.atk_bonus));
    L.push(set("move2_dmg_dice_sides", m.dice));
    L.push(set("move2_dmg_bonus", m.dmg_bonus));
    L.push(set("move2_dmg_type", q(m.dmg_type)));
    if (m.condition) {
      L.push(set("move2_inflicts_condition", "true"));
      L.push(set("move2_condition_name", q(m.condition.name)));
      L.push(set("move2_condition_icon", q(m.condition.icon)));
    }
  }
  // Proficiency before the derived bonuses (apply_derived_combat_bonuses adds it to the attack roll). Slot 1's is also written to its numbered
  // combat_enemy1_ slot, where Intimidate reads it, like resolve.
  L.push(set("prof", t.proficiency));
  L.push("*set {((\"combat_enemy\" & combat_apply_slot) & \"_prof\")} " + t.proficiency);
  L.push("*set {((\"combat_enemy\" & combat_apply_slot) & \"_resolve\")} " + t.resolve);
  ABILITIES.forEach(function (k) {
    L.push("*gosub apply_ability_score_range apt_p " + q(k) + " " + t.abilities[k][0] + " " + t.abilities[k][1]);
  });
  L.push("*gosub apply_derived_combat_bonuses apt_p");
  if (t.attack.atk_bonus !== undefined) L.push(set("atk_bonus", t.attack.atk_bonus));
  if (t.attack.dmg_bonus !== undefined) L.push(set("dmg_bonus", t.attack.dmg_bonus));
  if (t.sidearm) {
    var s = t.sidearm;
    L.push(set("sidearm_weapon_type", q(s.weapon_type)));
    L.push(set("sidearm_atk_bonus", s.atk_bonus === "weapon" ? "{(apt_p & \"atk_bonus\")}" : s.atk_bonus));
    L.push(set("sidearm_dmg_dice_sides", s.dice));
    L.push(set("sidearm_dmg_bonus", s.dmg_bonus === "weapon" ? "{(apt_p & \"dmg_bonus\")}" : s.dmg_bonus));
    L.push(set("sidearm_dmg_type", q(s.dmg_type)));
  }
  if (t.vulnerable) L.push(set("vulnerable_types", q(t.vulnerable)));
  if (t.stun) {
    L.push(set("inflicts_stun", "true"));
    L.push(set("stun_name", q(t.stun.name)));
    L.push(set("stun_icon", q(t.stun.icon)));
  }
  L.push("*return");
  return L;
}
function genTypeLabels() {
  var L = [];
  types.forEach(function (t, i) { if (i) L.push(""); L.push.apply(L, genTypeLabel(t)); });
  return L;
}
function genDispatch() {
  var L = [];
  types.forEach(function (t) { L.push("*if (combat_apply_type = " + q(t.id) + ")", "  *gosub apply_type_" + t.id); });
  return L;
}
// A mapping label's lines: one *if per type whose value differs from the label's default.
function genMap(param, variable, field, dflt) {
  var L = [];
  types.forEach(function (t) {
    var v = t[field] === undefined ? dflt : t[field];
    if (v !== dflt) L.push("*if (" + param + " = " + q(t.id) + ")", "  *set " + variable + " " + q(v));
  });
  return L;
}
// The creature type map has no default (an empty value is reserved for hand-authored combatants), so every type is listed.
// tools/check_enemy_creature_types.js reads these lines.
function genCreatureMap() {
  var L = [];
  types.forEach(function (t) { L.push("*if (aect_type = " + q(t.id) + ")", "  *set aect_value " + q(t.creature_type)); });
  return L;
}

// ---------------------------------------------------------------- marker block replacement (see gen_gear.js)
var text = typesSource;
function markerIndex(rows, kind, name) {
  var tag = "GEN:" + kind + " " + name;
  for (var i = 0; i < rows.length; i++) {
    var body = rows[i].replace(/^\s*\*comment\s+/, "").trim();
    if (body === tag || body.indexOf(tag + " ") === 0) return i;
  }
  return -1;
}
function setRegion(name, lines) {
  var rows = text.split("\n");
  var b = markerIndex(rows, "BEGIN", name);
  var e = markerIndex(rows, "END", name);
  if (b < 0) throw new Error("combat_types.txt: missing marker  GEN:BEGIN " + name);
  if (e < 0 || e < b) throw new Error("combat_types.txt: missing marker  GEN:END " + name);
  var indent = rows[b].slice(0, rows[b].length - rows[b].trimLeft().length);
  var body = lines.map(function (l) { return l.length ? indent + l : l; });
  text = rows.slice(0, b + 1).concat(body, rows.slice(e)).join("\n");
}
setRegion("enemy_profile_map", genMap("aeb_type", "aeb_profile", "profile", "feral"));
setRegion("enemy_reach_map", genMap("aer_type", "aer_class", "reach", "long"));
setRegion("enemy_size_map", genMap("aes_type", "aes_size", "size", "medium"));
setRegion("enemy_morale_map", genMap("aem_type", "aem_morale", "morale", "normal"));
setRegion("enemy_creature_type_map", genCreatureMap());
setRegion("enemy_type_dispatch", genDispatch());
setRegion("enemy_type_labels", genTypeLabels());

// ---------------------------------------------------------------- write or check
var stale = text !== typesSource;
if (CHECK) {
  if (stale) { console.error("gen_enemies: generated blocks are stale in web/mygame/scenes/combat_types.txt\nRun: node tools/gen_enemies.js"); process.exit(1); }
  console.log("gen_enemies: all generated blocks are up to date (" + types.length + " enemy types).");
} else {
  if (stale) fs.writeFileSync(TYPES_FILE, text);
  console.log("gen_enemies: " + types.length + " enemy types; " + (stale ? "rewrote web/mygame/scenes/combat_types.txt" : "nothing changed") + ".");
}
