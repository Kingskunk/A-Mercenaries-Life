#!/usr/bin/env node
/*
 * gen_gear.js -- generates the repeated per-item code from tools/gear_catalog.json.
 *
 * WHY: every tradeable item used to mean ~10 hand-edited places (a *create, a loadout branch, a trade table
 * entry, dossier list and equip lines, an inventory-panel entry, and a buy/sell stanza in every shop). With
 * hundreds of items across dozens of shops that is thousands of near-identical lines, so the catalog is now
 * the only place an item is written and this script writes the rest.
 *
 * HOW: the target files hold blocks between marker lines
 *     *comment GEN:BEGIN <name> ...          (or  // GEN:BEGIN <name> ...  in .js files)
 *     *comment GEN:END <name>
 * and this script replaces everything between a pair. Indentation is taken from the BEGIN line, so a block
 * can sit inside a *choice. Anything outside the markers is hand-written and never touched.
 *
 * Usage (from anywhere):
 *     node tools/gen_gear.js            rewrite the blocks
 *     node tools/gen_gear.js --check    exit 1 if any block is stale (for a lint or CI step)
 *
 * Run it BEFORE tools/gen_equipment_data.js, which parses the loadout blocks this writes into equipment.txt.
 */
"use strict";
var fs = require("fs");
var path = require("path");

var ROOT = path.join(__dirname, "..");
var SCENES = path.join(ROOT, "web", "mygame", "scenes");
var GAME = path.join(ROOT, "web", "mygame");
var CATALOG = JSON.parse(fs.readFileSync(path.join(__dirname, "gear_catalog.json"), "utf8"));
var CHECK = process.argv.indexOf("--check") !== -1;

var items = CATALOG.items;
var byId = {};
items.forEach(function (it) {
  if (byId[it.id]) throw new Error("duplicate item id: " + it.id);
  byId[it.id] = it;
});

// ---------------------------------------------------------------- helpers
function q(s) { return JSON.stringify(String(s)); }            // a ChoiceScript string literal ("\"" escapes work)
function flag(it) { return "has_" + it.id; }
function has(it, key) { return it[key] !== undefined && it[key] !== null && it[key] !== ""; }
function isHand(it) { return !!(it.flags && it.flags.hand); }
function makesFlag(it) { return !(it.flags && it.flags.create === false); }

// ChoiceScript will not chain operators, so an OR of N terms is nested pairwise: (((a) or (b)) or (c)).
function orChain(terms) {
  var out = "(" + terms[0] + ")";
  for (var i = 1; i < terms.length; i++) out = "(" + out + " or (" + terms[i] + "))";
  return out;
}

function need(it, keys) {
  keys.forEach(function (k) {
    if (!has(it, k) && !(it[k] === 0)) throw new Error("item '" + it.id + "' (" + it.kind + ") needs field: " + k);
  });
}

// ---------------------------------------------------------------- block generators
function genCreates() {
  return items.filter(makesFlag).map(function (it) { return "*create " + flag(it) + " false"; });
}

function genGearInfo() {
  var L = [];
  items.forEach(function (it) {
    need(it, ["name"]);
    L.push('*if (gi_item = ' + q(it.id) + ')');
    L.push('  *set gear_name ' + q(it.name));
    if (it.retail) L.push('  *set gear_retail ' + it.retail);
    L.push('  *set gear_kind ' + q(it.kind));
    if (it.tier) L.push('  *set gear_tier ' + q(it.tier));
    if (it.hint) L.push('  *set gear_hint ' + q(it.hint));
    if (it.blurb) L.push('  *set gear_blurb ' + q(it.blurb));
    if (it.minutes && it.minutes !== 10) L.push('  *set gear_minutes ' + it.minutes);
    var s = it.sell || {};
    if (s.smith) L.push('  *set gear_pct_smith ' + s.smith);
    if (s.pawn) L.push('  *set gear_pct_pawn ' + s.pawn);
    if (s.pawnFixed) L.push('  *set gear_fixed_pawn ' + s.pawnFixed);
    if (s.smithPiece) L.push('  *set gear_piece_smith ' + s.smithPiece);
    if (s.countVar) L.push('  *set gear_count_var ' + q(s.countVar));
    (it.warn || []).forEach(function (w) {
      L.push('  *if ' + w.when);
      L.push('    *set gear_warn ' + q(w.text));
    });
    Object.keys(it.quotes || {}).forEach(function (shopKey) {
      L.push('  *if (gear_shop = ' + q(shopKey) + ')');
      L.push('    *set gear_quote ' + q(it.quotes[shopKey]));
    });
  });
  return L;
}

function loadoutBlock(kind) {
  var L = [];
  items.filter(function (it) { return it.kind === kind && it.loadout; }).forEach(function (it) {
    var o = it.loadout;
    if (kind === "armor") {
      need(o, ["armor", "desc", "type", "prose"]);
      L.push('*if (equipped_armor_id = ' + q(it.id) + ')');
      L.push('  *set armor ' + q(o.armor));
      L.push('  *set armor_desc ' + q(o.desc));
      L.push('  *set armor_type ' + q(o.type));
      L.push('  *set armor_prose ' + q(o.prose));
    } else if (kind === "weapon") {
      need(o, ["weapon", "desc", "damage", "damageType", "type", "hands", "prose"]);
      L.push('*if (equipped_weapon_id = ' + q(it.id) + ')');
      L.push('  *set weapon ' + q(o.weapon));
      L.push('  *set weapon_desc ' + q(o.desc));
      L.push('  *set weapon_damage ' + q(o.damage));
      L.push('  *set weapon_damage_type ' + q(o.damageType));
      L.push('  *set weapon_type ' + q(o.type));
      L.push('  *set weapon_hands ' + q(o.hands));
      L.push('  *set weapon_prose ' + q(o.prose));
    } else if (kind === "head") {
      need(o, ["desc", "prose"]);
      L.push('*if (equipped_head_id = ' + q(it.id) + ')');
      L.push('  *set head_desc ' + q(o.desc));
      L.push('  *set head_prose ' + q(o.prose));
      L.push('  *set head_ac ' + (o.ac || 0));
      L.push('  *set head_is_armor ' + (o.isArmor ? "true" : "false"));
    }
  });
  return L;
}

// A weapon can also sit in the sidearm slot (swap_active_sidearm), so every catalog weapon gets a sidearm branch.
function genSidearms() {
  var L = [];
  items.filter(function (it) { return it.kind === "weapon" && it.loadout; }).forEach(function (it) {
    var o = it.loadout;
    need(it, ["sidearmDesc"]);
    L.push('*if (equipped_sidearm_id = ' + q(it.id) + ')');
    L.push('  *set sidearm ' + q(o.weapon));
    L.push('  *set sidearm_desc ' + q(it.sidearmDesc));
    L.push('  *set sidearm_damage ' + q(o.damage));
    L.push('  *set sidearm_damage_type ' + q(o.damageType));
    L.push('  *set sidearm_type ' + q(o.type));
    L.push('  *set sidearm_hands ' + q(o.hands));
    L.push('  *set sidearm_prose ' + q(o.prose));
  });
  return L;
}

var EQUIPPED_VAR = { weapon: "equipped_weapon_id", head: "equipped_head_id", armor: "equipped_armor_id" };
function listed() { return items.filter(function (it) { return it.dossier && !isHand(it); }); }

function genDossierList() {
  var L = [];
  listed().forEach(function (it) {
    need(it.dossier, ["line"]);
    var d = it.dossier, badge = "";
    if (EQUIPPED_VAR[it.kind] && d.badgeOn) {
      badge = "@{(" + EQUIPPED_VAR[it.kind] + " = " + q(it.id) + ")  [" + d.badgeOn + "]|" + (d.badgeOff ? " [" + d.badgeOff + "]" : "") + "}";
    }
    L.push('*if (' + flag(it) + ')');
    L.push('  *set has_inventory_item true');
    L.push('  *line_break');
    L.push('  • [b]' + it.title + ':[/b] ' + d.line + badge);
  });
  return L;
}

var EQUIP_LABEL = { weapon: "equip_weapon", head: "equip_head", armor: "equip_armor" };
function equipOption(it) {
  need(it.dossier, ["equipText"]);
  return [
    '*if ((' + flag(it) + ') and (not(' + EQUIPPED_VAR[it.kind] + ' = ' + q(it.id) + ')))',
    '  # ' + it.dossier.equipText,
    '    *gosub_scene equipment ' + EQUIP_LABEL[it.kind] + ' ' + q(it.id),
    '    *goto codex_equipment_weapons'
  ];
}

function genEquipWeapons() {
  var L = [];
  listed().filter(function (it) { return it.kind === "weapon"; }).forEach(function (it) { L = L.concat(equipOption(it)); });
  return L;
}

function genEquipWorn() {
  var L = [];
  listed().filter(function (it) { return it.kind === "head"; }).forEach(function (it) { L = L.concat(equipOption(it)); });
  var armors = listed().filter(function (it) { return it.kind === "armor"; });
  if (armors.length) {
    L.push('*if (' + orChain(armors.map(flag)) + ' and (not(equipped_armor_id = "starting")))');
    L.push('  # Switch back to your ${starting_armor_desc}.');
    L.push('    *gosub_scene equipment equip_armor "starting"');
    L.push('    *goto codex_equipment_weapons');
    armors.forEach(function (it) { L = L.concat(equipOption(it)); });
  }
  return L;
}

var INV_CATEGORY = { weapon: "weapons", armor: "apparel", head: "apparel", tool: "provisions" };
function genInventory() {
  var L = [];
  listed().forEach(function (it) {
    var d = it.dossier;
    var cat = (it.inventory && it.inventory.category) || INV_CATEGORY[it.kind];
    if (!cat) throw new Error("item '" + it.id + "' has no inventory category");
    var desc = /[.!?]$/.test(d.line) ? d.line : d.line + ".";
    L.push('{');
    L.push('  id: ' + q(it.id) + ', category: ' + q(cat) + ', owned: ' + q(flag(it)) + ',');
    L.push('  name: ' + q(it.title) + ',');
    L.push('  description: ' + q(desc) + (EQUIPPED_VAR[it.kind] ? ',' : ''));
    if (EQUIPPED_VAR[it.kind]) {
      var slot = it.kind;
      L.push('  badge: function (s) { return s.' + EQUIPPED_VAR[it.kind] + ' === ' + q(it.id) + ' ? ' + q(d.badgeOn || "Equipped") + ' : ' + q(d.badgeOff || "") + '; },');
      L.push('  equip: { slot: ' + q(slot) + ', id: ' + q(it.id) + ' }');
    }
    L.push('},');
  });
  return L;
}

function genShop(shop) {
  var labels = [], options = [], temps = [];
  shop.items.forEach(function (ref) {
    var it = byId[ref.id];
    if (!it) throw new Error("shop " + shop.name + " lists unknown item " + ref.id);
    var t = shop.prefix + "_" + it.id;
    var cond, fn;
    if (shop.type === "buy") {
      cond = "not(" + flag(it) + ")";
      if (ref.when) cond = "(" + ref.when + ") and (" + cond + ")";
      fn = 'gear_buy_label ' + q(it.id);
    } else {
      cond = ref.owned || flag(it);
      fn = 'gear_sell_label ' + q(it.id) + ' ' + q(shop.buyer);
    }
    temps.push('*temp ' + t + ' ""');
    labels.push('*if (' + cond + ')');
    labels.push('  *gosub_scene equipment ' + fn);
    labels.push('  *set ' + t + ' gear_label');
    options.push('*if (' + cond + ')');
    options.push('  # ${' + t + '}');
    options.push('    *set ' + (shop.type === "buy" ? "buy_item_id" : "sell_item_id") + ' ' + q(it.id));
    options.push('    *goto ' + shop.goto);
  });
  return { labels: temps.concat(labels), options: options };
}

// ---------------------------------------------------------------- region replacement
var pending = {};   // absolute path -> text
function fileText(p) { if (pending[p] === undefined) pending[p] = fs.readFileSync(p, "utf8"); return pending[p]; }

function markerIndex(rows, kind, name) {
  // a marker line is "<indent>*comment GEN:BEGIN name ..." or "<indent>// GEN:BEGIN name ..."
  for (var i = 0; i < rows.length; i++) {
    var t = rows[i].trim();
    var body = t.indexOf("*comment ") === 0 ? t.slice(9) : (t.indexOf("// ") === 0 ? t.slice(3) : "");
    var tag = "GEN:" + kind + " " + name;
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

var F = {
  startup: path.join(SCENES, "startup.txt"),
  equipment: path.join(SCENES, "equipment.txt"),
  stats: path.join(SCENES, "choicescript_stats.txt"),
  inventory: path.join(GAME, "inventory-data.js")
};

setRegion(F.startup, "gear_creates", genCreates());
setRegion(F.equipment, "gear_info_items", genGearInfo());
setRegion(F.equipment, "armor_items", loadoutBlock("armor"));
setRegion(F.equipment, "weapon_items", loadoutBlock("weapon"));
setRegion(F.equipment, "sidearm_items", genSidearms());
setRegion(F.equipment, "head_items", loadoutBlock("head"));
setRegion(F.stats, "gear_list", genDossierList());
setRegion(F.stats, "gear_equip_weapons", genEquipWeapons());
setRegion(F.stats, "gear_equip_worn", genEquipWorn());
setRegion(F.inventory, "gear_items", genInventory());
CATALOG.shops.forEach(function (shop) {
  var out = genShop(shop);
  var file = path.join(SCENES, shop.file);
  setRegion(file, shop.name + "_labels", out.labels);
  setRegion(file, shop.name + "_options", out.options);
});

// ---------------------------------------------------------------- write or check
var stale = [];
Object.keys(pending).forEach(function (p) {
  var current = fs.readFileSync(p, "utf8");
  if (current !== pending[p]) {
    stale.push(path.relative(ROOT, p));
    if (!CHECK) fs.writeFileSync(p, pending[p]);
  }
});
if (CHECK) {
  if (stale.length) { console.error("gen_gear: generated blocks are stale in:\n  " + stale.join("\n  ") + "\nRun: node tools/gen_gear.js"); process.exit(1); }
  console.log("gen_gear: all generated blocks are up to date (" + items.length + " items, " + CATALOG.shops.length + " shop menus).");
} else {
  console.log("gen_gear: " + items.length + " items, " + CATALOG.shops.length + " shop menus; " + (stale.length ? "rewrote " + stale.join(", ") : "nothing changed") + ".");
}
