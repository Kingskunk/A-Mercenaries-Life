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
 * It also writes the trade panel's inputs: each shop's cart pass and panel rows (the `trades` list in the catalog)
 * and web/mygame/trade-data.generated.js, a whole file rather than a marker block.
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

var STACKABLE_KINDS = ["armor", "shield", "weapon", "head", "tool", "consumable", "cloak", "hands", "waist", "feet", "neck"];
// Clothing kinds worn in their own slot. Each has equipped_<kind>_id, <kind>_desc and <kind>_prose in equipment.txt.
var CLOTHING = ["cloak", "hands", "waist", "feet", "neck"];
function isClothing(it) { return CLOTHING.indexOf(it.kind) !== -1; }
var STAT_NAMES = { str: "STR", dex: "DEX", con: "CON", int: "INT", wis: "WIS", cha: "CHA" };
// Which equipment slot an item occupies, as the player reads it (menus, the trade panel, the inventory). "" for things
// that fill no slot (tools, consumables, salvage). A two-handed weapon says so (it stows the shield).
var SLOT_LABEL = { armor: "Body armor", shield: "Off hand", head: "Head", cloak: "Cloak", hands: "Hands", waist: "Waist", feet: "Feet", neck: "Neck", ring: "Ring" };
function slotLabel(it) {
  if (it.kind === "weapon") return it.loadout && it.loadout.hands === "two_handed" ? "Weapon, two-handed" : "Weapon";
  return SLOT_LABEL[it.kind] || "";
}
// One line describing what a garment's traits do, shown in menus, the dossier and the shop. The runtime copy is
// generated into equipment.txt garment_traits (garment_hint), so the two can never disagree.
function traitHint(it) {
  var t = it.traits || {}, w = [], out = "";
  if (t.cold) w.push("cold -" + t.cold + "%");
  if (t.wet) w.push("rain -" + t.wet + "%");
  if (t.heat) w.push(t.heat > 0 ? "heat -" + t.heat + "%" : "heat +" + (-t.heat) + "%");
  if (w.length) out = "Weather wear: " + w.join(", ");
  if (t.stat) out += (out ? "; " : "") + "+" + t.bonus + " " + STAT_NAMES[t.stat];
  return out;
}
function stackable(it) { return it.stack !== undefined ? !!it.stack : STACKABLE_KINDS.indexOf(it.kind) !== -1; }

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
// Which items each side of a trade handles, so only those get cart variables.
function tradeIds(field) {
  var out = {};
  (CATALOG.shops || []).forEach(function (sh) {
    if (sh.type === field) sh.items.forEach(function (r) { out[r.id] = true; });
  });
  return out;
}

function genCreates() {
  var buys = tradeIds("buy"), sells = tradeIds("sell");
  var L = items.filter(makesFlag).map(function (it) { return "*create " + flag(it) + " false"; });
  items.forEach(function (it) { if (stackable(it)) L.push("*create spare_" + it.id + " 0"); });
  items.forEach(function (it) { if (buys[it.id]) L.push("*create cart_buy_" + it.id + " 0"); });
  items.forEach(function (it) { if (sells[it.id]) L.push("*create cart_sell_" + it.id + " 0"); });
  return L;
}

// One line for menus and banners: what using the item does.
function effectSummary(it) {
  var ef = it.effect;
  if (ef.type === "heal") return "Restores " + ef.n + "d" + ef.sides + (ef.bonus ? "+" + ef.bonus : "") + " HP";
  if (ef.type === "wash") return "Hygiene back to Clean, with water at hand";
  if (ef.type === "dressing") return "+" + ef.bonus + " HP from your next sleep";
  var h = ef.minutes % 60 === 0 ? (ef.minutes / 60) + " hours" : ef.minutes + " minutes";
  return "+" + ef.bonus + " " + ef.stat.toUpperCase() + " for " + h;
}

function genGearInfo() {
  var L = [];
  items.forEach(function (it) {
    need(it, ["name"]);
    L.push('*if (gi_item = ' + q(it.id) + ')');
    L.push('  *set gear_name ' + q(it.name));
    if (it.retail) L.push('  *set gear_retail ' + it.retail);
    L.push('  *set gear_kind ' + q(it.kind));
    if (slotLabel(it)) L.push('  *set gear_slot ' + q(slotLabel(it)));
    L.push('  *set gear_title ' + q(it.title || it.name));
    if (stackable(it)) L.push('  *set gear_stack true');
    if (it.kind === "consumable") {
      var ef = it.effect || {};
      need(it, ["effect", "useText"]);
      L.push('  *set gear_effect ' + q(ef.type));
      L.push('  *set gear_use_text ' + q(it.useText));
      L.push('  *set gear_use_verb ' + q(it.useVerb || "Use"));
      if (it.combat) L.push('  *set gear_combat true');
      L.push('  *set gear_eff_summary ' + q(effectSummary(it)));
      if (ef.type === "heal") {
        L.push('  *set gear_heal_n ' + ef.n);
        L.push('  *set gear_heal_sides ' + ef.sides);
        L.push('  *set gear_heal_bonus ' + (ef.bonus || 0));
      } else if (ef.type === "boon") {
        L.push('  *set gear_eff_name ' + q(ef.name));
        L.push('  *set gear_eff_desc ' + q(ef.desc));
        L.push('  *set gear_eff_stat ' + q(ef.stat));
        L.push('  *set gear_eff_bonus ' + ef.bonus);
        L.push('  *set gear_eff_minutes ' + ef.minutes);
      } else if (ef.type === "wash") {
        // no fields: use_consumable resets the hygiene clock itself
      } else if (ef.type === "dressing") {
        L.push('  *set gear_eff_bonus ' + ef.bonus);
      } else {
        throw new Error("item '" + it.id + "': unknown effect type " + ef.type);
      }
    }
    if (it.tier) L.push('  *set gear_tier ' + q(it.tier));
    var shownHint = it.hint || (it.traits ? traitHint(it) : "");
    if (shownHint) L.push('  *set gear_hint ' + q(shownHint));
    if (it.blurb) L.push('  *set gear_blurb ' + q(it.blurb));
    if (it.minutes && it.minutes !== 10) L.push('  *set gear_minutes ' + it.minutes);
    var s = it.sell || {};
    if (s.smith) L.push('  *set gear_pct_smith ' + s.smith);
    if (s.pawn) L.push('  *set gear_pct_pawn ' + s.pawn);
    if (s.general) L.push('  *set gear_pct_general ' + s.general);
    if (s.tailor) L.push('  *set gear_pct_tailor ' + s.tailor);
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

// One row per catalog item that carries traits: percent cuts to the cold, wet and heat parts of exposure (heat may be
// negative, a heavy garment adds heat wear) and an optional ability-score bonus. Hand-written rows for older worn items
// sit above the GEN block in equipment.txt garment_traits.
function genGarmentTraits() {
  var L = [];
  items.filter(function (it) { return it.traits; }).forEach(function (it) {
    var t = it.traits;
    L.push('*if (gt_id = ' + q(it.id) + ')');
    if (t.cold) L.push('  *set garment_cold ' + t.cold);
    if (t.wet) L.push('  *set garment_wet ' + t.wet);
    if (t.heat) L.push('  *set garment_heat ' + (t.heat < 0 ? "0 - " + (-t.heat) : t.heat));
    if (t.stat) {
      L.push('  *set garment_stat ' + q(t.stat));
      L.push('  *set garment_bonus ' + t.bonus);
    }
    L.push('  *set garment_hint ' + q(traitHint(it)));
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
    } else if (CLOTHING.indexOf(kind) !== -1) {
      need(o, ["desc", "prose"]);
      L.push('*if (equipped_' + kind + '_id = ' + q(it.id) + ')');
      L.push('  *set ' + kind + '_desc ' + q(o.desc));
      L.push('  *set ' + kind + '_prose ' + q(o.prose));
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

var EQUIPPED_VAR = { weapon: "equipped_weapon_id", head: "equipped_head_id", armor: "equipped_armor_id",
  cloak: "equipped_cloak_id", hands: "equipped_hands_id", waist: "equipped_waist_id", feet: "equipped_feet_id", neck: "equipped_neck_id" };
function listed() { return items.filter(function (it) { return it.dossier && !isHand(it); }); }

function genDossierList() {
  var L = [];
  listed().forEach(function (it) {
    need(it.dossier, ["line"]);
    var d = it.dossier, badge = "";
    var badgeOn = d.badgeOn || (isClothing(it) ? "Worn" : ""), badgeOff = d.badgeOff !== undefined ? d.badgeOff : (isClothing(it) ? "Stowed" : "");
    if (EQUIPPED_VAR[it.kind] && badgeOn) {
      badge = "@{(" + EQUIPPED_VAR[it.kind] + " = " + q(it.id) + ")  [" + badgeOn + "]|" + (badgeOff ? " [" + badgeOff + "]" : "") + "}";
    }
    L.push('*if (' + flag(it) + ')');
    L.push('  *set has_inventory_item true');
    L.push('  *line_break');
    var qty = stackable(it) ? "@{(spare_" + it.id + " > 0)  [+${spare_" + it.id + "} spare]|}" : "";
    if (it.kind === "consumable") badge = " [" + effectSummary(it) + "]";
    L.push('  • [b]' + it.title + ':[/b] ' + d.line + badge + qty);
  });
  return L;
}

var EQUIP_LABEL = { weapon: "equip_weapon", head: "equip_head", armor: "equip_armor", cloak: "equip_cloak", hands: "equip_hands", waist: "equip_waist", feet: "equip_feet", neck: "equip_neck" };
// returnLabel: the dossier page the option came from (weapons and worn armor live on codex_equipment_weapons).
function equipOption(it, returnLabel) {
  need(it.dossier, ["equipText"]);
  var text = it.dossier.equipText;
  if (it.traits && traitHint(it) && text.indexOf("[") === -1) text = text.replace(/\.$/, "") + " [" + traitHint(it) + "].";
  return [
    '*if ((' + flag(it) + ') and (not(' + EQUIPPED_VAR[it.kind] + ' = ' + q(it.id) + ')))',
    '  # ' + text,
    '    *gosub_scene equipment ' + EQUIP_LABEL[it.kind] + ' ' + q(it.id),
    '    *goto ' + (returnLabel || "codex_equipment_weapons")
  ];
}

function genEquipWeapons() {
  var L = [];
  listed().filter(function (it) { return it.kind === "weapon"; }).forEach(function (it) { L = L.concat(equipOption(it)); });
  return L;
}

// Cloaks, gloves, belts and boots swap on the Apparel page, neckwear on the Accessories page.
function genEquipClothing(kinds, returnLabel) {
  var L = [];
  listed().filter(function (it) { return kinds.indexOf(it.kind) !== -1; }).forEach(function (it) { L = L.concat(equipOption(it, returnLabel)); });
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

var INV_CATEGORY = { weapon: "weapons", armor: "apparel", head: "apparel", tool: "provisions", consumable: "consumables",
  cloak: "apparel", hands: "apparel", waist: "apparel", feet: "apparel", neck: "apparel" };
function genInventory() {
  var L = [];
  listed().forEach(function (it) {
    var d = it.dossier;
    var cat = (it.inventory && it.inventory.category) || INV_CATEGORY[it.kind];
    if (!cat) throw new Error("item '" + it.id + "' has no inventory category");
    var desc = /[.!?]$/.test(d.line) ? d.line : d.line + ".";
    L.push('{');
    L.push('  id: ' + q(it.id) + ', category: ' + q(cat) + ', owned: ' + q(flag(it)) + ',' + (slotLabel(it) ? ' slot: ' + q(slotLabel(it)) + ',' : ''));
    if (stackable(it)) {
      L.push('  name: function (s) { var n = 1 + (Number(s.spare_' + it.id + ') || 0); return ' + q(it.title) + ' + (n > 1 ? " ×" + n : ""); },');
    } else {
      L.push('  name: ' + q(it.title) + ',');
    }
    var wornHint = it.hint || (it.traits ? traitHint(it) : "");
    if (EQUIPPED_VAR[it.kind] && wornHint) { L.push('  description: ' + q(desc) + ','); L.push('  traits: ' + q(wornHint) + ','); }
    var more = EQUIPPED_VAR[it.kind] || it.kind === "consumable";
    if (!(EQUIPPED_VAR[it.kind] && wornHint)) L.push('  description: ' + q(desc) + (more ? ',' : ''));
    if (it.kind === "consumable") {
      if (it.effect.type === "boon") {
        // The boon names are matched against the three unique-buff slots, like boonRunning() does for the menus.
        var nm = q(it.effect.name);
        var on = 'function (s) { for (var n = 1; n <= 3; n++) { var a = s["unique_buff" + n + "_active"]; if ((a === true || a === "true") && s["unique_buff" + n + "_name"] === ' + nm + ') return true; } return false; }';
        L.push('  badge: function (s) { return ' + q(effectSummary(it)) + ' + (' + on + '(s) ? " · active, using it refreshes" : ""); },');
        L.push('  useLabel: function (s) { return ' + on + '(s) ? "Refresh" : "Use"; },');
      } else {
        L.push('  badge: ' + q(effectSummary(it)) + ',');
      }
      L.push('  use: true');
    }
    if (EQUIPPED_VAR[it.kind]) {
      var slot = it.kind;
      L.push('  badge: function (s) { return s.' + EQUIPPED_VAR[it.kind] + ' === ' + q(it.id) + ' ? ' + q(d.badgeOn || (isClothing(it) ? "Worn" : "Equipped")) + ' : ' + q(d.badgeOff !== undefined ? d.badgeOff : (isClothing(it) ? "Stowed" : "")) + '; },');
      // statBonus: the panel hands the swap to the dossier so ChoiceScript recomputes the ability scores.
      L.push('  equip: { slot: ' + q(slot) + ', id: ' + q(it.id) + ' }' + (it.traits && it.traits.stat ? ',' : ''));
      if (it.traits && it.traits.stat) L.push('  statBonus: true');
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
      // A stackable item is always for sale; a one-of-a-kind item disappears once owned.
      cond = stackable(it) ? "" : "not(" + flag(it) + ")";
      if (ref.when) cond = cond ? "(" + ref.when + ") and (" + cond + ")" : ref.when;
      fn = 'gear_buy_label ' + q(it.id);
    } else {
      cond = ref.owned || flag(it);
      fn = 'gear_sell_label ' + q(it.id) + ' ' + q(shop.buyer);
    }
    temps.push('*temp ' + t + ' ""');
    var pad = cond ? "  " : "";
    if (cond) labels.push('*if (' + cond + ')');
    labels.push(pad + '*gosub_scene equipment ' + fn);
    labels.push(pad + '*set ' + t + ' gear_label');
    if (cond) options.push('*if (' + cond + ')');
    options.push(pad + '# ${' + t + '}');
    options.push(pad + '  *set ' + (shop.type === "buy" ? "buy_item_id" : "sell_item_id") + ' ' + q(it.id));
    options.push(pad + '  *goto ' + shop.goto);
  });
  return { labels: temps.concat(labels), options: options };
}

// ---------------------------------------------------------------- consumables (use menus)
function consumables(combatOnly) {
  return items.filter(function (it) { return it.kind === "consumable" && (!combatOnly || it.combat); });
}
// True while a boon of this item's name is already running in one of the three unique-buff slots (a boon item only).
function boonRunning(it) {
  var terms = [1, 2, 3].map(function (n) { return "(unique_buff" + n + "_active) and (unique_buff" + n + "_name = " + q(it.effect.name) + ")"; });
  return orChain(terms.map(function (t) { return "(" + t + ")"; }));
}
function useLabel(it) {
  var verb = it.useVerb || "Use";
  var tag = it.effect.type === "boon" ? "@{" + boonRunning(it) + "  [Already active: using it refreshes the timer]|}" : "";
  return verb + " the " + it.name + ".@{show_stat_hints  [" + effectSummary(it) + "]|}" + tag;
}
// A one-line owned test: sets cu_any (a *temp the caller declares) when any listed consumable is owned.
function genUseCheck(combatOnly) {
  var L = [];
  consumables(combatOnly).forEach(function (it) {
    L.push('*if (' + flag(it) + ')');
    L.push('  *set cu_any true');
  });
  return L;
}
function genUseOptions(goto, combatOnly) {
  var L = [];
  consumables(combatOnly).forEach(function (it) {
    L.push('*if (' + flag(it) + ')');
    L.push('  # ' + useLabel(it));
    L.push('    *set use_item_id ' + q(it.id));
    L.push('    *goto ' + goto);
  });
  return L;
}

// ---------------------------------------------------------------- trade panel (the QoL layer over the shop menus)
var shopByName = {};
(CATALOG.shops || []).forEach(function (sh) { shopByName[sh.name] = sh; });

// One pass over every item the shop deals in. equipment.txt shop_cart_sell / shop_cart_buy read the cart_* variables
// the trade panel wrote and, depending on shop_mode ("tally", "apply" or "clear"), add up, carry out or discard them.
// Sales run before purchases so a worn suit that is sold is swapped out before its replacement is put on.
function genCartPass(trade) {
  var L = [];
  var sell = trade.sellShop ? shopByName[trade.sellShop] : null, buy = trade.buyShop ? shopByName[trade.buyShop] : null;
  if (trade.sellShop && !sell) throw new Error("trade " + trade.name + ": unknown sellShop " + trade.sellShop);
  if (!sell && !buy) throw new Error("trade " + trade.name + " has neither a buyShop nor a sellShop");
  if (sell) {
    L.push('*set shop_buyer ' + q(sell.buyer));
    L.push('*set gear_shop ' + q(trade.sellKey));
    sell.items.forEach(function (r) {
      if (!byId[r.id]) throw new Error("trade " + trade.name + " lists unknown item " + r.id);
      L.push('*gosub_scene equipment shop_cart_sell ' + q(r.id));
    });
  }
  if (buy) {
    L.push('*set gear_shop ' + q(trade.buyKey));
    buy.items.forEach(function (r) {
      if (!byId[r.id]) throw new Error("trade " + trade.name + " lists unknown item " + r.id);
      if (r.when) {
        L.push('*if (' + r.when + ')');
        L.push('  *gosub_scene equipment shop_cart_buy ' + q(r.id));
      } else {
        L.push('*gosub_scene equipment shop_cart_buy ' + q(r.id));
      }
    });
  }
  return L;
}

// The rows the panel shows for the buy side: every item currently for sale, with its live warning text.
function genPanelRows(trade) {
  var L = [];
  shopByName[trade.buyShop].items.forEach(function (r) {
    if (r.when) {
      L.push('*if (' + r.when + ')');
      L.push('  *gosub_scene equipment shop_row_add ' + q(r.id));
    } else {
      L.push('*gosub_scene equipment shop_row_add ' + q(r.id));
    }
  });
  return L;
}

// Static facts for the panel (names, retail prices, sell rules). Live facts (warnings, availability) come from the game.
function genTradeData() {
  var data = { items: {}, trades: {} };
  var ids = {};
  (CATALOG.trades || []).forEach(function (t) {
    var sell = t.sellShop ? shopByName[t.sellShop] : null, buy = t.buyShop ? shopByName[t.buyShop] : null;
    if (sell) sell.items.forEach(function (r) { ids[r.id] = true; });
    if (buy) buy.items.forEach(function (r) { ids[r.id] = true; });
    data.trades[t.name] = {
      title: t.title,
      buyer: sell ? sell.buyer : "",
      buy: buy ? buy.items.map(function (r) { return r.id; }) : [],
      sell: sell ? sell.items.map(function (r) { return r.id; }) : []
    };
  });
  Object.keys(ids).forEach(function (id) {
    var it = byId[id], sl = it.sell || {};
    data.items[id] = {
      name: it.name, title: it.title || it.name, kind: it.kind, tier: it.tier || "", retail: it.retail || 0,
      minutes: it.minutes || 10, hint: it.hint || (it.traits ? traitHint(it) : ""), slot: slotLabel(it), stack: stackable(it),
      sell: { smith: sl.smith || 0, pawn: sl.pawn || 0, general: sl.general || 0, tailor: sl.tailor || 0, pawnFixed: sl.pawnFixed || 0, smithPiece: sl.smithPiece || 0, countVar: sl.countVar || "" }
    };
  });
  return "// GENERATED by tools/gen_gear.js from tools/gear_catalog.json -- do not edit; edit the catalog and run the generator." + String.fromCharCode(10) +
    "window.TRADE_DATA = " + JSON.stringify(data, null, 1) + ";" + String.fromCharCode(10);
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
  combat: path.join(SCENES, "combat.txt"),
  inventory: path.join(GAME, "inventory-data.js")
};

setRegion(F.startup, "gear_creates", genCreates());
setRegion(F.equipment, "gear_info_items", genGearInfo());
setRegion(F.equipment, "armor_items", loadoutBlock("armor"));
setRegion(F.equipment, "weapon_items", loadoutBlock("weapon"));
setRegion(F.equipment, "sidearm_items", genSidearms());
setRegion(F.equipment, "head_items", loadoutBlock("head"));
CLOTHING.forEach(function (k) { setRegion(F.equipment, k + "_items", loadoutBlock(k)); });
setRegion(F.equipment, "garment_traits_items", genGarmentTraits());
setRegion(F.stats, "gear_list", genDossierList());
setRegion(F.stats, "gear_equip_weapons", genEquipWeapons());
setRegion(F.stats, "gear_equip_worn", genEquipWorn());
setRegion(F.stats, "gear_equip_apparel", genEquipClothing(["cloak", "hands", "waist", "feet"], "codex_equipment_apparel"));
setRegion(F.stats, "gear_equip_neck", genEquipClothing(["neck"], "codex_equipment_accessories"));
setRegion(F.inventory, "gear_items", genInventory());
setRegion(F.stats, "codex_use_check", genUseCheck(false));
setRegion(F.stats, "codex_use_check2", genUseCheck(false));   // the satchel page repeats the check
setRegion(F.stats, "codex_use_options", genUseOptions("codex_use_do", false));
setRegion(F.combat, "combat_use_check", genUseCheck(true));
setRegion(F.combat, "combat_use_options", genUseOptions("fight_use_do", true));
CATALOG.shops.forEach(function (shop) {
  if (shop.menu === false) return;   // a shop that only feeds the trade panel has no plain menu of its own
  var out = genShop(shop);
  var file = path.join(SCENES, shop.file);
  setRegion(file, shop.name + "_labels", out.labels);
  setRegion(file, shop.name + "_options", out.options);
});
(CATALOG.trades || []).forEach(function (t) {
  var file = path.join(SCENES, t.file);
  setRegion(file, t.name + "_cart_pass", genCartPass(t));
  if (t.buyShop) setRegion(file, t.name + "_panel_rows", genPanelRows(t));
});
pending[path.join(GAME, "trade-data.generated.js")] = genTradeData();

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
  if (stale.length) { console.error("gen_gear: generated blocks are stale in:\n  " + stale.join("\n  ") + "\nRun: node tools/gen_gear.js"); process.exit(1); }
  console.log("gen_gear: all generated blocks are up to date (" + items.length + " items, " + CATALOG.shops.length + " shop menus).");
} else {
  console.log("gen_gear: " + items.length + " items, " + CATALOG.shops.length + " shop menus; " + (stale.length ? "rewrote " + stale.join(", ") : "nothing changed") + ".");
}
