#!/usr/bin/env node
/*
 * gen_action_icons.js -- the Battle HUD's art for the combat actions that are NOT spells (Dash, Dodge, Rage, Second Wind...), written to
 * web/mygame/action-icons.js as a plain window.ACTION_ICONS map of action id -> data: URI. Spells are covered by gen_spell_icons.js.
 *
 * Same reasons as that generator: the art library is far too big to ship, and the game is one self-contained play_game.html, so a plain
 * <img src> would 404 -- base64 data URIs in a generated JS file behave the same in dev and in the bundle.
 *
 * The ids are the HUD's slug of the hub option's name: lower case, apostrophes dropped, other runs of characters turned into "_"
 * ("Second Wind" -> second_wind, "Use item" -> use_item). Only the actions listed here are emitted, so adding art to ICONS/ never bloats
 * the build, and an action with no entry simply shows its initial in the HUD.
 *
 * To give an action art: add a line to MAP (path is relative to ICONS/), run this, then compile.
 *
 * Run: node tools/gen_action_icons.js            (write)
 *      node tools/gen_action_icons.js --check    (verify, non-writing; exit 1 if stale or a path is missing)
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const ICONS = path.join(ROOT, "ICONS");
const OUT = path.join(ROOT, "web", "mygame", "action-icons.js");
const checkOnly = process.argv.includes("--check");

const MAP = {
  // The standard actions.
  dash: "Action/Dash_Icon.webp",
  disengage: "Action/Disengage_Icon.webp",
  dodge: "Passive_feature/Uncanny_Dodge_Icon.webp",       // no plain Dodge art in the library; a figure slipping a blow reads right
  hide: "Action/Hide_Icon.webp",
  intimidate: "Action/Intimidating_Presence_Icon.webp",   // the morale action (combat.txt MORALE)
  shove: "Action/Shove_Icon.webp",
  throw: "Action/Throw_Icon.webp",   // the one Throw button on the bar; its fly-out shows each item in its own art (below)
  // Each thrown item's own art, keyed throw_<slug of its title>: battlehud.js variantArt reads "Throw: Grease Flask" as throw_grease_flask.
  shoot: "Action/Arcane_Shot_Piercing_Arrow_Icon.webp",   // the one Shoot button on the bar (the special arrows); its fly-out shows each arrow in its own art (below)
  shoot_fire_arrow: "Item/Consumable/Arrow/Arrow_of_Fire_Unfaded_Icon.png",
  shoot_ice_arrow: "Item/Consumable/Arrow/Arrow_of_Ice_Unfaded_Icon.png",
  throw_grease_flask: "Item/Consumable/Grenade/GRN_Grease_Bottle_Unfaded_Icon.png",
  throw_alchemists_fire: "Item/Consumable/Grenade/GRN_Alchemist's_Fire_Unfaded_Icon.png",
  throw_water_jug: "item:water_jug",
  // Unique combat items share one Items button. Each "Items: <name>" choice uses items_<slug of its name> in the fly-out.
  items: "Item/Miscellaneous_item/Container/Backpack_A_Unfaded_Icon.webp",
  items_bramble_heart: "item:bramble_heart",
  items_silverstar: "item:silverstar",
  items_philter_of_remembrance: "item:philter_remembrance",
  // Drinkable potions share one Potions button (2026-11-01). Each "Potions: <title>" choice uses potions_<slug of its title> in the fly-out.
  potions: "Interface/Elixir_Icon.png",
  potions_potion_of_barkskin: "item:potion_barkskin",
  potions_clear_head_draught: "item:clear_head_draught",
  potions_saint_altheas_water: "item:althea_phial",
  potions_fortifying_tonic: "item:potion_fortifying",
  potions_brine_antivenom: "item:potion_antivenom",
  potions_healing_potion: "item:healing_potion",
  potions_fire_resistance_potion: "item:fire_resistance_potion",
  potions_cold_resistance_potion: "item:cold_resistance_potion",
  potions_wolfsbane_antidote: "item:wolfsbane_antidote",
  potions_heroism_potion: "item:heroism_potion",
  // Each spell scroll's own art on the Read fly-out, keyed read_<slug of its title> (battlehud.js variantArt).
  read: "Item/Consumable/Scroll/BOOK_SignedTradeVisa_Unfaded_Icon.png",
  read_magic_missile_scroll: "Item/Consumable/Scroll/Scroll_of_Magic_Missile_Unfaded_Icon.png",
  read_healing_word_scroll: "Item/Consumable/Scroll/Scroll_of_Healing_Word_Unfaded_Icon.png",
  read_mage_armor_scroll: "Item/Consumable/Scroll/Scroll_of_Mage_Armour_Unfaded_Icon.png",
  read_bane_scroll: "Item/Consumable/Scroll/Scroll_of_Bane_Unfaded_Icon.png",
  read_false_life_scroll: "Item/Consumable/Scroll/Scroll_of_False_Life_Unfaded_Icon.png",   // the user's own jug art (2026-10-19)
  read_grease_scroll: "Item/Consumable/Scroll/Scroll_of_Grease_Unfaded_Icon.png",
  read_thunderwave_scroll: "Item/Consumable/Scroll/Scroll_of_Thunderwave_Unfaded_Icon.png",
  swap_weapons: "Passive_feature/Dual_Wielder_Icon.webp",   // STAND-IN for the Swap Weapons button (the user to choose their own art)
  trade_places: "Action/Benign_Transposition_Swap_Icon.webp",
  call_ally_back: "Action/Benign_Transposition_Swap_Icon.webp",

  // Class features.
  second_wind: "Skill/Second_Wind_Icon.webp",
  action_surge: "Skill/Action_Surge_Icon.webp",
  rage: "Action/Rage_Icon.webp",
  reckless_attack: "Weapon_action/Reckless_Attack_Icon.webp",
  bardic_inspiration: "Action/Bardic_Inspiration_Icon.webp",
  dual_shot: "Weapon_action/Volley_Icon.webp",            // stand-in: a volley of arrows for loosing two shots at once

  // The two weapon buttons at the left of the bar. Keyed by hand and attack kind, not by an action name, because the label is the weapon's own name ("Attack with your
  // falchion"); battlehud.js picks the key from weapon_type / sidearm_type. These are the framed "Unfaded" 64px tiles, which fill the button on their own, so the button
  // carries no word. A melee, finesse or reach weapon takes the sword tile; a ranged one takes the arrow.
  primary_melee: "Weapon_action/Main_Hand_Attack_Unfaded_Icon.webp",
  primary_ranged: "Weapon_action/Ranged_Attack_Unfaded_Icon.webp",
  sidearm_melee: "Weapon_action/Off-Hand_Attack_Melee_Unfaded_Icon.webp",
  sidearm_ranged: "Weapon_action/Off-Hand_Attack_Ranged_Unfaded_Icon.webp",

  // The fight's own buttons.
  flee: "Action/Jump_Running_Icon.webp",                  // a figure at a run
  use_item: "Interface/Elixir_Icon.png",
  end_turn: "HUD/Turn_Controller_UI_Icon.png"
};

const MIME = { ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml" };

// A value written "item:<key>" uses the Pack's own art for that icon key (web/mygame/item-icons.js, already shrunk by gen_item_icons.js), so one picture serves an item in the Pack and on the
// battle bar and the generated file stays small. Run gen_item_icons.js first.
let ITEM_ART = null;
function itemArt(key) {
  if (!ITEM_ART) {
    const sandbox = { window: {} };
    require("vm").runInNewContext(fs.readFileSync(path.join(ROOT, "web", "mygame", "item-icons.js"), "utf8"), sandbox);
    ITEM_ART = sandbox.window.ITEM_ICONS || {};
  }
  return ITEM_ART[key] || "";
}

let bytes = 0, bad = 0;
const out = {};
for (const id of Object.keys(MAP).sort()) {
  if (String(MAP[id]).indexOf("item:") === 0) {
    const uri = itemArt(MAP[id].slice(5));
    if (!uri) { console.warn("  MISSING item art: " + id + " -> " + MAP[id]); bad++; continue; }
    out[id] = uri;
    bytes += uri.length * 3 / 4;
    continue;
  }
  const p = path.join(ICONS, MAP[id]);
  if (!fs.existsSync(p)) { console.warn("  MISSING: " + id + " -> " + MAP[id]); bad++; continue; }
  const mime = MIME[path.extname(p).toLowerCase()];
  out[id] = "data:" + mime + ";base64," + fs.readFileSync(p).toString("base64");
  bytes += fs.statSync(p).size;
}

const body = "/*\n * ACTION ICONS -- generated by tools/gen_action_icons.js from the ICONS/ art library. Do not edit by hand; add a line to MAP in\n" +
  " * that script and re-run it (or `--check` to verify it is current). Read by battlehud.js, keyed by the slug of the action's name.\n */\n" +
  "window.ACTION_ICONS = " + JSON.stringify(out) + ";\n";

if (checkOnly) {
  const cur = fs.existsSync(OUT) ? fs.readFileSync(OUT, "utf8").replace(/\r\n/g, "\n") : "";
  if (cur !== body || bad) { console.error("action-icons.js is STALE or incomplete -- re-run `node tools/gen_action_icons.js`"); process.exit(1); }
  console.log("action-icons.js is up to date (" + Object.keys(out).length + " icons, " + Math.round(bytes / 1024) + " KB)");
} else {
  fs.writeFileSync(OUT, body);
  console.log("wrote " + path.relative(ROOT, OUT) + ": " + Object.keys(out).length + " action icons, " + Math.round(bytes / 1024) + " KB of art" + (bad ? "; " + bad + " MISSING" : ""));
  if (bad) process.exit(1);
}
