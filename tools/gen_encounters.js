#!/usr/bin/env node
/*
 * gen_encounters.js -- generates the encounter templates (tools/encounter_catalog.json) as fight_<id> labels.
 *
 * WHY: a fight with several enemies used to be a hand-written fight_<name> label: a combat_lib_N, a name, an epithet
 * and any overrides per slot, with slot 1's names different from the rest (combat_enemy_name_override, not
 * combat_enemy1_). A template says the same in a few lines of JSON, numbers a pack's names for you, and gives each
 * slot a group the story can count after the fight (count_results "Boar" "down").
 *
 * WRITES, between GEN:BEGIN/GEN:END markers (never hand-edit inside them; indentation comes from the BEGIN line):
 *   web/mygame/scenes/combat.txt   encounter_labels  one fight_<id> label per template, each ending *goto fight_library
 *   web/mygame/scenes/dev_hub.txt  encounter_menu    the dev hub's page listing every template
 *                                  encounter_run     dev_combat_test_run's call for each one
 *
 * Usage: node tools/gen_encounters.js [--check]     --check exits 1 if any block is stale
 * Then:  node tools/test_encounters.js               builds every template in the real engine and checks it
 */
"use strict";
var fs = require("fs");
var path = require("path");

var ROOT = path.join(__dirname, "..");
var SCENES = path.join(ROOT, "web", "mygame", "scenes");
var COMBAT_FILE = path.join(SCENES, "combat.txt");
var DEV_FILE = path.join(SCENES, "dev_hub.txt");
var CHECK = process.argv.indexOf("--check") !== -1;
var SLOT_CAP = 6;
var ORDINALS = ["first", "second", "third", "fourth", "fifth", "sixth"];

var catalog = JSON.parse(fs.readFileSync(path.join(__dirname, "encounter_catalog.json"), "utf8"));
var enemyTypes = {};
JSON.parse(fs.readFileSync(path.join(__dirname, "enemy_catalog.json"), "utf8")).types.forEach(function (t) { enemyTypes[t.id] = t; });

// ---------------------------------------------------------------- validation and expansion into slots
var errors = [];
function fail(where, msg) { errors.push(where + ": " + msg); }
function quote(s) { return '"' + String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"'; }
function isInt(v) { return typeof v === "number" && Math.floor(v) === v; }

var combatSource = fs.readFileSync(COMBAT_FILE, "utf8");
var devSource = fs.readFileSync(DEV_FILE, "utf8");
function stripRegion(text, name) {
  var re = new RegExp("GEN:BEGIN " + name + "[\\s\\S]*?GEN:END " + name);
  return text.replace(re, "");
}
var handWritten = stripRegion(combatSource, "encounter_labels");

var seen = {};
var encounters = (catalog.encounters || []).map(function (enc) {
  var where = "encounter " + (enc.id || "?");
  if (!/^[a-z0-9_]+$/.test(enc.id || "")) fail(where, "id must be lower case letters, digits and _");
  if (seen[enc.id]) fail(where, "duplicate id");
  seen[enc.id] = true;
  if (new RegExp("^\\*label fight_" + enc.id + "\\s*$", "m").test(handWritten)) fail(where, "combat.txt already has a hand-written *label fight_" + enc.id);
  if (!enc.title) fail(where, "needs a title (the dev hub's menu line)");
  if (!Array.isArray(enc.enemies) || !enc.enemies.length) fail(where, "needs at least one entry in enemies");
  var slots = [];
  (enc.enemies || []).forEach(function (e, ei) {
    var ew = where + " enemies[" + ei + "]";
    var t = enemyTypes[e.type];
    if (!t) { fail(ew, "unknown type " + JSON.stringify(e.type) + " (not in tools/enemy_catalog.json)"); return; }
    var count = e.count === undefined ? 1 : e.count;
    if (!isInt(count) || count < 1) fail(ew, "count must be a whole number, 1 or more");
    ["hp", "ac", "atk", "resolve"].forEach(function (k) { if (e[k] !== undefined && !isInt(e[k])) fail(ew, k + " must be a whole number"); });
    if (e.hp !== undefined && e.hp < 1) fail(ew, "hp must be 1 or more");
    var ranges = Array.isArray(e.range) ? e.range : null;
    if (ranges && ranges.length !== count) fail(ew, "range lists " + ranges.length + " tiers for " + count + " enemies");
    var name = e.name || t.name;
    var group = e.group || name;
    for (var i = 0; i < count; i++) {
      var range = ranges ? ranges[i] : e.range;
      if (range !== undefined && (!isInt(range) || range < 0 || range > 3)) fail(ew, "range must be 0 to 3");
      var slotName = count > 1 ? name + " " + (i + 1) : name;
      var epithet;
      if (e.epithet) epithet = count > 1 ? e.epithet.replace(/^the /, "the " + ORDINALS[i] + " ") : e.epithet;
      else epithet = count > 1 ? "the " + ORDINALS[i] + " " + name.toLowerCase() : "the " + name.toLowerCase();
      slots.push({ type: e.type, name: slotName, epithet: epithet, group: group, hp: e.hp, ac: e.ac, atk: e.atk, resolve: e.resolve, range: range });
    }
  });
  if (slots.length > SLOT_CAP) fail(where, slots.length + " enemies; a fight holds " + SLOT_CAP + " at most");
  ["leader", "nonlethal_slot"].forEach(function (k) {
    if (enc[k] !== undefined && (!isInt(enc[k]) || enc[k] < 1 || enc[k] > slots.length)) fail(where, k + " must be a slot from 1 to " + slots.length);
  });
  ["morale", "nonlethal", "no_flee"].forEach(function (k) {
    if (enc[k] !== undefined && typeof enc[k] !== "boolean") fail(where, k + " must be true or false");
  });
  return { enc: enc, slots: slots };
});
if (errors.length) { console.error("gen_encounters: tools/encounter_catalog.json has problems:\n  " + errors.join("\n  ")); process.exit(1); }

// ---------------------------------------------------------------- generation
// Slot 1's per-fight fields are the bare combat_enemy_* names; slots 2 and beyond are numbered (fight_library's convention).
function field(slot, name) { return (slot === 1 ? "combat_enemy_" : "combat_enemy" + slot + "_") + name; }

function genLabel(x) {
  var enc = x.enc;
  var out = ["*label fight_" + enc.id];
  out.push("*comment Encounter template " + quote(enc.id) + (enc.notes ? ": " + enc.notes : "."));
  out.push("*set combat_is_nonlethal " + (enc.nonlethal ? "true" : "false"));
  out.push("*set combat_no_morale " + (enc.morale === false ? "true" : "false"));
  if (enc.no_flee !== undefined) out.push("*set combat_no_flee " + enc.no_flee);
  if (enc.leader !== undefined) out.push("*set combat_leader_slot " + enc.leader);
  if (enc.nonlethal_slot !== undefined) out.push("*set combat_nonlethal_slot " + enc.nonlethal_slot);
  x.slots.forEach(function (s, i) {
    var n = i + 1;
    out.push("*set combat_lib_" + n + " " + quote(s.type));
    out.push("*set " + field(n, "name_override") + " " + quote(s.name));
    out.push("*set " + field(n, "epithet_override") + " " + quote(s.epithet));
    out.push("*set combat_enemy" + n + "_group " + quote(s.group));
    if (s.hp !== undefined) out.push("*set " + field(n, "hp_override") + " " + s.hp);
    if (s.ac !== undefined) out.push("*set " + field(n, "ac_override") + " " + s.ac);
    if (s.atk !== undefined) out.push("*set " + field(n, "atk_override") + " " + s.atk);
    if (s.resolve !== undefined) out.push("*set " + field(n, "resolve_override") + " " + s.resolve);
    if (s.range !== undefined) out.push("*set " + (n === 1 ? "combat_enemy_range" : "combat_enemy" + n + "_range") + " " + s.range);
  });
  out.push("*goto fight_library");
  out.push("");
  return out;
}

function genMenu() {
  var out = ["*label dev_encounter_hub",
    "[b]📜 DEVELOPER TESTING: ENCOUNTER TEMPLATES[/b]",
    "*line_break",
    "Every template in tools/encounter_catalog.json. After each fight the result line says how each enemy ended (FIGHT RESULTS).",
    "",
    "*choice"];
  encounters.forEach(function (x) {
    out.push("  # " + x.enc.title);
    out.push("    *set dctest_label " + quote("fight_" + x.enc.id));
    out.push("    *goto dev_combat_test_run");
  });
  out.push("  # Back to the combat tests");
  out.push("    *goto dev_combat_test_hub");
  out.push("");
  return out;
}

function genRun() {
  var out = [];
  encounters.forEach(function (x) {
    out.push("*if (dctest_label = " + quote("fight_" + x.enc.id) + ")");
    out.push("  *gosub_scene combat fight_" + x.enc.id);
  });
  return out;
}

function setRegion(text, file, name, lines) {
  var rows = text.split("\n");
  var b = -1, e = -1;
  rows.forEach(function (r, i) {
    if (r.indexOf("GEN:BEGIN " + name + " ") !== -1 || r.trim().endsWith("GEN:BEGIN " + name)) b = i;
    if (r.indexOf("GEN:END " + name) !== -1 && b >= 0 && e < 0 && i > b) e = i;
  });
  if (b < 0 || e < 0) throw new Error(file + ": missing the GEN:BEGIN/GEN:END " + name + " markers");
  var indent = rows[b].slice(0, rows[b].length - rows[b].trimLeft().length);
  var body = lines.map(function (l) { return l.length ? indent + l : l; });
  return rows.slice(0, b + 1).concat(body, rows.slice(e)).join("\n");
}

var labels = [];
encounters.forEach(function (x) { labels = labels.concat(genLabel(x)); });
var combatText = setRegion(combatSource, "combat.txt", "encounter_labels", labels);
var devText = setRegion(devSource, "dev_hub.txt", "encounter_menu", genMenu());
devText = setRegion(devText, "dev_hub.txt", "encounter_run", genRun());

var stale = [];
if (combatText !== combatSource) stale.push("combat.txt");
if (devText !== devSource) stale.push("dev_hub.txt");
if (CHECK) {
  if (stale.length) { console.error("gen_encounters: generated blocks are stale in " + stale.join(", ") + "\nRun: node tools/gen_encounters.js"); process.exit(1); }
  console.log("gen_encounters: all generated blocks are up to date (" + encounters.length + " encounters).");
} else {
  if (combatText !== combatSource) fs.writeFileSync(COMBAT_FILE, combatText);
  if (devText !== devSource) fs.writeFileSync(DEV_FILE, devText);
  console.log("gen_encounters: " + encounters.length + " encounters; " + (stale.length ? "rewrote " + stale.join(", ") : "nothing changed") + ".");
}
