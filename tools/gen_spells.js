#!/usr/bin/env node
/*
 * gen_spells.js -- generates the spell REACH TAG lookup from tools/spell_catalog.json.
 *
 * WHY: a spell's reach used to be implied by whatever its call site happened to hard-code, so adding a
 * cantrip meant remembering which of several sites needed a matching condition -- and forgetting one
 * silently applied the wrong rule. The tag now lives in the catalog once, and this writes the lookup that
 * resolves it from `check_skill`, the variable every attack option already sets before it rolls.
 *
 * The tag answers two separate questions, and combat.txt asks them separately:
 *   spell_in_range  -- can the caster reach the target at all? (close/touch cannot)
 *   spell_disadv    -- is the shot spoiled by a hostile in reach? (ranged only, while ANY enemy is Engaged with the caster)
 * Collapsing those is a real bug: a touch spell at Mid-Range must be UNAVAILABLE, not offered at
 * disadvantage.
 *
 * HOW: the same GEN:BEGIN/GEN:END marker-block replacement gen_gear.js uses (see its header), so a block
 * is never hand-edited -- the next run overwrites it. Indentation is taken from the BEGIN line.
 *
 * Usage: node tools/gen_spells.js [--check]      --check exits 1 if any block is stale (for lint/CI)
 */
"use strict";
var fs = require("fs");
var path = require("path");

var ROOT = path.join(__dirname, "..");
var SCENES = path.join(ROOT, "web", "mygame", "scenes");
var CATALOG = JSON.parse(fs.readFileSync(path.join(__dirname, "spell_catalog.json"), "utf8"));
var CHECK = process.argv.indexOf("--check") !== -1;

var spells = CATALOG.spells;
var VALID_RANGES = { ranged: true, close: true, touch: true };

var seenId = {};
spells.forEach(function (s) {
  ["id", "name", "range"].forEach(function (k) {
    if (!s[k]) throw new Error("spell " + (s.id || "?") + " needs field: " + k);
  });
  if (seenId[s.id]) throw new Error("duplicate spell id: " + s.id);
  seenId[s.id] = true;
  if (!VALID_RANGES[s.range]) {
    throw new Error("spell '" + s.id + "' has range '" + s.range + "'; must be ranged | close | touch");
  }
});
// Names are the lookup key (check_skill is set to the display name), so a duplicate would silently make one
// spell unreachable behind the other. Cheap to catch here, expensive to debug in play.
var seenName = {};
spells.forEach(function (s) {
  if (seenName[s.name]) throw new Error("duplicate spell name (lookup key): '" + s.name + "' on " + s.id + " and " + seenName[s.name]);
  seenName[s.name] = s.id;
});


// A ChoiceScript string literal (JSON.stringify's escaping matches what ChoiceScript wants).
function q(s) { return JSON.stringify(String(s)); }

// The three *temp outputs every caller reads, written out to durable *set names so a caller's option body
// can read them after the lookup label has returned.
function genLookup() {
  var L = [
    "*temp spell_range_tag \"ranged\"",
    "*temp spell_in_range true",
    "*temp spell_disadv false",
    "*comment Read the TARGET's live distance, not the shared combat_enemy_range scratch. fight_round_hub calls",
    "*comment fight_pick_target (setting combat_active_target) but not fight_sync_target_in, so that scratch is",
    "*comment STALE at menu-build time -- a fight opened at Long Range still read 0 on its first page. The option",
    "*comment bodies below call fight_pick_target first, so combat_active_target is the slot this cast will hit;",
    "*comment combat_target_range is that slot's own range, computed fresh in the hub (see the block above the",
    "*comment *choice). The scratch is only the fallback for a call made before the hub has run.",
    "*temp spell_range_at combat_enemy_range",
    "*if (combat_target_range >= 0)",
    "  *set spell_range_at combat_target_range"
  ];
  spells.forEach(function (s) {
    L.push("*if (check_skill = " + q(s.name) + ")");
    L.push("  *set spell_range_tag " + q(s.range));
  });
  L.push("*if (spell_range_tag = \"close\")");
  L.push("  *if (spell_range_at <= 0)");
  L.push("    *set spell_in_range false");
  L.push("*if (spell_range_tag = \"touch\")");
  L.push("  *if (spell_range_at > 0)");
  L.push("    *set spell_in_range false");
  L.push("*if (spell_range_tag = \"ranged\")");
  L.push("  *gosub combat_check_engaged");
  L.push("  *if ((spell_range_at <= 0) or (combat_any_engaged))");
  L.push("    *set spell_disadv true");
  L.push("*set spell_reach_result spell_in_range");
  L.push("*set spell_penalty_result spell_disadv");
  return L;
}

// ---------------------------------------------------------------- marker block replacement (see gen_gear.js)
var pending = {};
function fileText(file) { return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : ""; }
function markerIndex(rows, kind, name) {
  var tag = "GEN:" + kind + " " + name;
  for (var i = 0; i < rows.length; i++) {
    var body = rows[i].replace(/^\s*\*comment\s+/, "").replace(/^\s*\/\/\s+/, "").trim();
    if (body === tag || body.indexOf(tag + " ") === 0) return i;
  }
  return -1;
}
function setRegion(file, name, lines) {
  var rows = fileText(file).split("\n");
  var b = markerIndex(rows, "BEGIN", name);
  var e = markerIndex(rows, "END", name);
  if (b < 0) throw new Error(path.basename(file) + ": missing marker  GEN:BEGIN " + name);
  if (e < 0 || e < b) throw new Error(path.basename(file) + ": missing marker  GEN:END " + name);
  var indent = rows[b].slice(0, rows[b].length - rows[b].trimLeft().length);
  var body = lines.map(function (l) { return l.length ? indent + l : l; });
  pending[file] = rows.slice(0, b + 1).concat(body, rows.slice(e)).join("\n");
}

setRegion(path.join(SCENES, "combat.txt"), "spell_range_lookup", genLookup());

// ---------------------------------------------------------------- write or check
var stale = [];
Object.keys(pending).forEach(function (p) {
  var current = fs.existsSync(p) ? fs.readFileSync(p, "utf8") : null;
  if (current !== pending[p]) {
    stale.push(path.relative(ROOT, p));
    if (!CHECK) fs.writeFileSync(p, pending[p]);
  }
});
if (CHECK) {
  if (stale.length) { console.error("gen_spells: generated blocks are stale in:\n  " + stale.join("\n  ") + "\nRun: node tools/gen_spells.js"); process.exit(1); }
  console.log("gen_spells: all generated blocks are up to date (" + spells.length + " spells).");
} else {
  console.log("gen_spells: " + spells.length + " spells; " + (stale.length ? "rewrote " + stale.join(", ") : "nothing changed") + ".");
}
