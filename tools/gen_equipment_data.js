#!/usr/bin/env node
/*
 * gen_equipment_data.js -- generates web/mygame/equipment-data.generated.js from
 * web/mygame/scenes/equipment.txt's apply_<slot>_loadout lookup tables.
 *
 * WHY: the Inventory panel needs to show what a piece of gear WOULD look like before
 * the player equips it (name, damage, AC), but the only place that data exists is these
 * *if (equipped_x_id = "...") *set x_desc "..." tables in equipment.txt. Rather than
 * hand-copy that catalog into JS a second time (drift risk -- add a new sword to
 * equipment.txt, forget to mirror it, the panel shows stale data forever), this parses
 * the real .txt file directly, so the JS catalog can never fall out of sync with it.
 *
 * Run via `node tools/gen_equipment_data.js` (or automatically from compile.js, which
 * calls it before bundling so play_game.html always has a fresh copy).
 *
 * This is a narrow, purpose-built parser for this file's specific shape -- it is NOT a
 * general ChoiceScript parser. It understands exactly one pattern, repeated for every
 * slot:
 *   *if (equipped_<slot>_id = "id")            <- or OR'd together: (... = "a") or (... = "b")
 *     *set fieldName "string literal"          <- or a bare number/true/false/identifier
 *     *set otherField anotherStatVariable      <- e.g. "starting" copies from starting_weapon_desc
 * If equipment.txt's shape changes in a way this doesn't understand, this script throws
 * loudly rather than silently emitting a wrong or empty catalog.
 */
"use strict";
var fs = require("fs");
var path = require("path");

var ROOT = path.join(__dirname, "..");
var SRC = path.join(ROOT, "web", "mygame", "scenes", "equipment.txt");
var OUT = path.join(ROOT, "web", "mygame", "equipment-data.generated.js");

// label name -> { bucket: catalog key, idVar: the equipped_x_id variable this label
// switches on (or null for the ring, which switches on a "item_id" *params instead) }
var LABELS = {
  apply_weapon_loadout:  { bucket: "weapon",  idVar: "equipped_weapon_id" },
  apply_sidearm_loadout: { bucket: "sidearm", idVar: "equipped_sidearm_id" },
  apply_armor_loadout:   { bucket: "armor",   idVar: "equipped_armor_id" },
  apply_head_loadout:    { bucket: "head",    idVar: "equipped_head_id" },
  apply_cloak_loadout:   { bucket: "cloak",   idVar: "equipped_cloak_id" },
  apply_hands_loadout:   { bucket: "hands",   idVar: "equipped_hands_id" },
  apply_waist_loadout:   { bucket: "waist",   idVar: "equipped_waist_id" },
  apply_feet_loadout:    { bucket: "feet",    idVar: "equipped_feet_id" },
  apply_neck_loadout:    { bucket: "neck",    idVar: "equipped_neck_id" },
  apply_ring_loadout:    { bucket: "ring",    idVar: "item_id" }
};

function parseValue(raw) {
  raw = raw.trim();
  var strMatch = /^"((?:[^"\\]|\\.)*)"$/.exec(raw);
  if (strMatch) return { type: "literal", value: strMatch[1].replace(/\\(.)/g, "$1") };
  if (/^-?\d+$/.test(raw)) return { type: "literal", value: parseInt(raw, 10) };
  if (raw === "true") return { type: "literal", value: true };
  if (raw === "false") return { type: "literal", value: false };
  if (/^[A-Za-z_]\w*$/.test(raw)) return { type: "statRef", value: raw };
  throw new Error("gen_equipment_data: unrecognized *set value shape: " + JSON.stringify(raw));
}

function extractLabelBody(lines, labelName) {
  var startPatt = new RegExp("^\\*label\\s+" + labelName + "\\s*$", "i");
  var start = -1;
  for (var i = 0; i < lines.length; i++) {
    if (startPatt.test(lines[i].trim())) { start = i + 1; break; }
  }
  if (start === -1) throw new Error("gen_equipment_data: could not find *label " + labelName);
  var end = lines.length;
  for (var j = start; j < lines.length; j++) {
    if (/^\*label\s+\S/i.test(lines[j].trim())) { end = j; break; }
  }
  return lines.slice(start, end);
}

function parseLoadoutLabel(lines, labelName, idVar) {
  var body = extractLabelBody(lines, labelName);
  var entries = [];
  var current = null;
  var idPatt = idVar === "item_id"
    ? /item_id\s*=\s*"([^"]+)"/g
    : new RegExp(idVar.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s*=\\s*\"([^\"]+)\"", "g");

  for (var i = 0; i < body.length; i++) {
    var raw = body[i];
    var trimmed = raw.trim();
    if (!trimmed || trimmed.indexOf("*comment") === 0) continue;
    var indented = /^\s/.test(raw);
    // apply_ring_loadout opens with *params and two *temp defaults before its id table
    // starts -- preamble, not part of any entry and not the end of the table either.
    if (!indented && (/^\*params\s/.test(trimmed) || /^\*temp\s/.test(trimmed))) continue;

    if (/^\*if\s*\(/.test(trimmed) && !indented) {
      var ids = [];
      var m;
      idPatt.lastIndex = 0;
      while ((m = idPatt.exec(trimmed))) ids.push(m[1]);
      if (!ids.length) {
        // Not an id-lookup *if -- this is the end of the table. apply_weapon_loadout's
        // trailing shield-auto-unequip logic ("*if (weapon_hands = "two_handed") ...")
        // lives here; it's hand-ported in equipment-panel.js's equipItem instead, since
        // it's a cross-slot side effect, not a per-id lookup this shape can express.
        break;
      }
      current = { ids: ids, fields: {} };
      entries.push(current);
      continue;
    }
    if (/^\*set\s+/.test(trimmed) && !indented) {
      // A *set at column 0 (not nested under our current *if) also means the table's
      // over -- same trailing-logic case as above.
      break;
    }
    if (/^\*set\s+/.test(trimmed)) {
      if (!current) throw new Error("gen_equipment_data: *set before any *if in " + labelName + ": " + trimmed);
      var setMatch = /^\*set\s+(\w+)\s+(.+)$/.exec(trimmed);
      if (!setMatch) throw new Error("gen_equipment_data: unparseable *set in " + labelName + ": " + trimmed);
      current.fields[setMatch[1]] = parseValue(setMatch[2]);
      continue;
    }
    // Anything else indented under the current *if that isn't a plain *set (e.g. a
    // nested *if) is a shape this narrow parser can't safely flatten -- fail loudly
    // rather than silently drop data.
    if (indented) {
      throw new Error("gen_equipment_data: unexpected line inside " + labelName + "'s \"" +
        (current ? current.ids.join(",") : "?") + "\" entry (unsupported shape): " + trimmed);
    }
    break; // *return or anything else at column 0 ends the table
  }
  return entries;
}

// equipment.txt garment_traits: one *if (gt_id = "<id>") block per worn item, each ending in *set garment_hint "<text>".
// The panels show that text for whatever is worn (slot cards, the trade panel's "wearing" line), so it is read from the
// same table the game uses and never written twice.
function parseGarmentHints(lines) {
  var body = extractLabelBody(lines, "garment_traits");
  var hints = {}, current = null, m;
  for (var i = 0; i < body.length; i++) {
    var raw = body[i], t = raw.trim();
    if (!t || t.indexOf("*comment") === 0) continue;
    if (!/^\s/.test(raw)) {
      m = /^\*if\s*\(\s*gt_id\s*=\s*"([^"]+)"\s*\)/.exec(t);
      current = m ? m[1] : null;
      if (/^\*return/.test(t)) break;
      continue;
    }
    m = /^\*set\s+garment_hint\s+"((?:[^"\\]|\\.)*)"/.exec(t);
    if (current && m) hints[current] = m[1].replace(/\\(.)/g, "$1");
  }
  return hints;
}

function generate() {
  var text = fs.readFileSync(SRC, "utf8");
  var lines = text.split(/\r?\n/);
  var catalog = {};
  Object.keys(LABELS).forEach(function (labelName) {
    var info = LABELS[labelName];
    catalog[info.bucket] = parseLoadoutLabel(lines, labelName, info.idVar);
  });

  var hints = parseGarmentHints(lines);

  var header =
    "/*\n" +
    " * GENERATED FILE -- do not hand-edit. Produced by tools/gen_equipment_data.js from\n" +
    " * web/mygame/scenes/equipment.txt's apply_<slot>_loadout tables. Regenerate with\n" +
    " * `node tools/gen_equipment_data.js`, or just run `node compile.js`, which does it\n" +
    " * automatically before bundling play_game.html.\n" +
    " *\n" +
    " * Shape: window.EQUIPMENT_CATALOG.<slot> is an array of { ids: [...], fields: {...} }.\n" +
    " * Each field value is either { type: \"literal\", value } or { type: \"statRef\", value }\n" +
    " * -- a statRef means \"read this off window.stats at apply-time\" (used by the\n" +
    " * \"starting\" weapon/sidearm entries, which copy from starting_weapon_desc etc.\n" +
    " * instead of a fixed string). See equipment-panel.js's applyCatalogEntry for how\n" +
    " * these get resolved.\n" +
    " */\n";
  var content = header + "window.EQUIPMENT_CATALOG = " + JSON.stringify(catalog, null, 2) + ";\n" +
    "// id -> the short text for what a worn item does (weather cuts, score bonus), from equipment.txt garment_traits.\n" +
    "window.GARMENT_HINTS = " + JSON.stringify(hints, null, 2) + ";\n";
  fs.writeFileSync(OUT, content, "utf8");
  console.log("Generated", OUT, "(" + Object.keys(hints).length + " worn-item hints)");
  Object.keys(catalog).forEach(function (bucket) {
    console.log("  " + bucket + ": " + catalog[bucket].length + " entries");
  });
}

generate();
module.exports = { generate: generate };
