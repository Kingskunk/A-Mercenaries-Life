#!/usr/bin/env node
/*
 * gen_item_icons.js -- the Inventory panel's art, written to web/mygame/item-icons.js as a plain window.ITEM_ICONS map of icon key -> data: URI.
 *
 * Same reasons as gen_action_icons.js / gen_ui_art.js: the ICONS/ library is far too big to ship and the game is one self-contained play_game.html, so a
 * plain <img src> would 404. Each image is redrawn at 72x72 as a WebP in headless Chrome, which keeps the whole set small.
 *
 * Icons are keyed by WHAT AN ITEM IS, not by item: many items share a key (every plain sword uses w_sword), and web/mygame/inventory.js decides the key
 * for an item (iconFor). An item with no good art yet uses a stand-in key; the stand-ins are marked "STAND-IN" below so they are easy to find and replace.
 *
 * To give something art: add or change a line in MAP (the value is either a path under ICONS/Item/ or just a file name, which is looked up anywhere under
 * ICONS/Item/ and must be unique there), then run this and compile. Paths starting with "../" are relative to ICONS/Item/, which is how art made for this game
 * is used (it sits in ICONS/Generic, e.g. "../Generic/Name.png"). Any size is fine: it is redrawn at 72x72, keeping its proportions.
 *
 * Run: node tools/gen_item_icons.js            (write)
 *      node tools/gen_item_icons.js --check    (verify, non-writing; exit 1 if stale or a source is missing)
 *      node tools/gen_item_icons.js --refresh-png key [...]  (refresh selected PNG keys without recompressing the rest)
 */
const fs = require("fs");
const path = require("path");
const os = require("os");
const { spawn } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const ITEM = path.join(ROOT, "ICONS", "Item");
const OUT = path.join(ROOT, "web", "mygame", "item-icons.js");
const CHROME = process.env.CHROME || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9347;
const SIZE = 72, QUALITY = 0.88;
const checkOnly = process.argv.includes("--check");
const refreshAt = process.argv.indexOf("--refresh-png");
const refreshKeys = refreshAt >= 0 ? process.argv.slice(refreshAt + 1) : [];

const MAP = {
  // ---- weapons (one key per weapon family; the starting loadouts and shop weapons all fall into these)
  w_sword: "Longsword_Unfaded_Icon.png",
  w_shortsword: "Shortsword_Unfaded_Icon.png",
  w_dagger: "Dagger_Unfaded_Icon.png",
  w_axe: "Handaxe_Unfaded_Icon.png",
  w_battleaxe: "Battleaxe_Unfaded_Icon.png",
  w_greataxe: "Greataxe_Unfaded_Icon.png",
  w_spear: "Spear_Unfaded_Icon.png",
  w_bow: "Shortbow_Unfaded_Icon.png",
  w_xbow: "Hand_Crossbow_Unfaded_Icon.png",
  w_sling: "Sling.png",
  w_staff: "Quarterstaff_Unfaded_Icon.png",
  w_mace: "Mace_Unfaded_Icon.png",
  w_club: "Club_Unfaded_Icon.png",
  w_hammer: "Warhammer_Item_Icon.png",
  w_generic: "../RPGIcons/weapon_icon.png",                     // STAND-IN: unarmed and anything unrecognised

  // ---- body armour and clothing worn as armour
  a_cloth: "Robe_D_Unfaded_Icon.png",
  a_coat: "Robe_E_Unfaded_Icon.png",
  a_clothes: "Clothes_Unfaded_Icon.png",                       // Simple Clothes, the Wizard's and the Warlock's
  a_barbarian: "Barbarian_Clothes_Unfaded_Icon.png",
  a_scale: "Scale_Mail_Unfaded_Icon.png",
  a_robe: "Robe_E_Unfaded_Icon.png",                       // a plain robe (the Dread Warlock's)
  a_leather: "Hide_Armour_Unfaded_Icon.png",
  a_chain: "Chain_Shirt_Unfaded_Icon.png",
  a_brig: "Breastplate_Unfaded_Icon.png",                       // STAND-IN: studded gambeson / brigandine
  a_plate: "Half_Plate_Unfaded_Icon.png",
  a_generic: "../RPGIcons/armor_icon.png",                      // STAND-IN

  // ---- the rest of the paper doll
  shield: "Wooden_Shield_Unfaded_Icon.png",
  h_cap: "Frumpy_Hat_Unfaded_Icon.png",
  h_hat: "Brimmed_Hat_Unfaded_Icon.png",
  h_helm: "Blackplume_Helm_Unfaded_Icon.png",                   // STAND-IN: a plain iron helm
  cloak: "Cloak_B_Unfaded_Icon.png",
  cloak_traveler: "Travelers_cloak.png",                     // Traveler's Cloak (id broadcloth_cloak)
  cloak_storm: "Storm_Cloak.png",                            // Storm Cape
  cloak_winter: "Winter_Cloak.png",
  cloak_duster: "Summer_Duster.png",
  neck_muffler: "Wool_Muffler.png",
  neck_cravat: "Silvertongue_Cravat.png",                    // Silvertongue Cravat (id silk_neckcloth)
  gloves: "Gloves_Hide_Unfaded_Icon.png",
  gloves_scholar: "Gloves_Leather_3_Unfaded_Icon.png",       // Lamplight Gloves
  gloves_lined: "Bracers_Barbarian_Unfaded_Icon.png",         // Lined Gloves
  gloves_master: "Spellseeking_Gloves_Unfaded_Icon.png",      // Spellseeker Gloves
  boots: "Boots_Leather_Unfaded_Icon.png",
  boots_iron_heel: "../Generic/Brants_Iron_Heel_Boots_Generated_Source.png", // Brant's shipyard reward
  boots_rain: "Boots_Leather_A_Unfaded_Icon.png",             // Rain Boots
  boots_winter: "Shoes_Barbarian_Unfaded_Icon.png",          // Winter Boots
  shoes_dancing: "Camp_Shoes_C_Unfaded_Icon.webp",            // Swallowstep Shoes
  belt: "Leather_Belt.png",
  neck: "Amulet_Necklace_A_Bronze_A_Unfaded_Icon.png",          // STAND-IN for scarves and mufflers too
  ring: "Ring_A_Simple_Gold_Unfaded_Icon.png",
  signet: "Equipment/Ring/Guild_Ring_Unfaded_Icon.png",

  // ---- consumables and tools
  potion: "POT_Potion_of_Healing_Unfaded_Icon.png",
  grease: "GRN_Grease_Bottle_Unfaded_Icon.png",
  mortar_pestle: "Mortar_And_Pestle_Unfaded_Icon.png",
  alch_fire: "GRN_Alchemist's_Fire_Unfaded_Icon.png",
  elixir: "ELX_Elixir_of_Darkvision_Unfaded_Icon.png",
  salve: "Clutter_Bottle_Small_Flowers_Unfaded_Icon.webp",
  bandage: "Bed_Linen_Unfaded_Icon.png",
  soap: "Soap_Bar_Unfaded_Icon.png",
  rope: "Rope_Unfaded_Icon.png",
  torch: "Torch_Unfaded_Icon.png",
  lantern: "../Generic/Hooded_Lantern_Generated_Source.png",
  oil: "../Generic/Lamp_Oil_Generated_Source.png",
  toolkit: "Trap_Disarm_Toolkit_Unfaded_Icon.png",
  lute: "Equipment/Instrument/Instrument_Lute_Unfaded_Icon.png",
  lockpicks: "Thieves_Tools_Unfaded_Icon.png",
  key: "Key_Iron_A_Icon.png",
  shovel: "Shovel_Unfaded_Icon.png",
  cooking_pot: "Miscellaneous_item/Clutter/Cooking_Pot_A_Unfaded_Icon.png",
  arrow_fire: "Arrow_of_Fire_Unfaded_Icon.png",
  arrow_ice: "Arrow_of_Ice_Unfaded_Icon.png",
  tool: "Blacksmith's_Tongs_Unfaded_Icon.png",                  // STAND-IN: prybar, manacles, bolt and any other hand tool
  tinder: "../Generic/Antique Tinderbox with Flint Stone.png",  // the user's own art (2026-10-02)
  chalk: "../Generic/Rustic Bundle of Chalk Sticks.png",         // the user's own art (2026-10-02)
  blanket: "Clutter_Bedroll_Unfaded_Icon.webp",
  cloth: "Bed_Linen_Unfaded_Icon.png",                          // STAND-IN: oilcloth

  // ---- ingredients and salvage
  scrap: "Clutter_AdamantineScrap_Unfaded_Icon.webp",
  bramble_heart: "../Generic/Gnarled_Bramble_Heart_Generated_Source.png",   // the user's own art (2026-10-21): Dubhar's heart of bramble
  poisoners_robes: "Poisoners_Robe_Unfaded_Icon.png",                  // Dubhar's robes
  boar_meat: "FOOD_Pork_Shoulder_Unfaded_Icon.png",                    // a boar's haunch (STAND-IN: no wild-meat art yet)
  raw_hide: "../Generic/Raw_Hide_Generated_Source.png",                 // a skinned beast's hide, from the Longshade's boar and elk
  boar_tusk: "../Generic/Boar_Tusk_Generated_Source.png",
  elk_antler: "../Generic/Elk_Antler_Generated_Source.png",
  venison: "FOOD_Raw_Steak_Unfaded_Icon.png",                                   // an elk's haunch (STAND-IN: no wild-meat art yet)
  heartwood_fruit: "FOOD_Goodberry_Unfaded_Icon.png",                   // Bark's reward
  honeycomb: "FOOD_Honey_Comb_Unfaded_Icon.png",                    // the Longshade bee tree
  frog_slime: "Bowl_With_Dead_Tadpoles_Unfaded_Icon.png",
  gland: "Carrion_Crawler_Tentacle_Item_Icon.png",
  venom: "Conical_Flask_Filled_Unfaded_Icon.png",
  ichor: "Clutter_Bottle_Small_Eye_Unfaded_Icon.webp",
  sluice_moss: "Weavemoss_Item_Icon.png",
  brinecap: "Swarming_Toadstool_Item_Icon.png",
  pale_crackroot: "Daggerroot_Unfaded_Icon.png",
  cistern_spores: "Timmask_Spores_Item_Icon.png",
  glowmold: "glowing_spore_group.png",
  silverleaf: "01-silverleaf-herbs.png",
  oakheart_balsam: "Balsam_Item_Icon.png",
  shadefern: "frost_fern.png",
  acorn_truffle: "Acorn_Truffle_Item_Icon.png",
  brambleberry: "thorn_briar.png",

  // ---- loose stones
  gem_agate: "Miscellaneous_item/Valuables/Gemstone/GEM_Agate_Unfaded_Icon.png",
  gem_citrine: "Miscellaneous_item/Valuables/Gemstone/GEM_Jacinth_Unfaded_Icon.png",
  gem_quartz: "Miscellaneous_item/Valuables/Gemstone/Quartz.png",
  gem_aquamarine: "Miscellaneous_item/Valuables/Gemstone/GEM_Topaz_Unfaded_Icon.png",
  gem_opal: "Miscellaneous_item/Valuables/Gemstone/Opal.png",
  gem_pearl: "Miscellaneous_item/Valuables/Gemstone/GEM_Pearl_Unfaded_Icon.png",
  gem_sapphire: "Miscellaneous_item/Valuables/Gemstone/GEM_Sapphire_Unfaded_Icon.png",
  gem_ruby: "Miscellaneous_item/Valuables/Gemstone/GEM_Ruby_Unfaded_Icon.png",
  gem_emerald: "Miscellaneous_item/Valuables/Gemstone/GEM_Malachite_Unfaded_Icon.png",
  gem_diamond: "Miscellaneous_item/Valuables/Gemstone/GEM_Diamond_Unfaded_Icon.png",

  // ---- finished jewelry (decorative valuables; not powered equipment)
  jewelry_silver_ring: "Equipment/Ring/Silver_Ring.png",
  jewelry_gold_ring: "Equipment/Ring/Gold_Ring.png",
  jewelry_crescent_earrings: "Miscellaneous_item/Valuables/Crescent_Moon_Earring_Unfaded_Icon.png",
  jewelry_drop_pendant: "Equipment/Amulet/Silver_Pendant_Unfaded_Icon.png",
  jewelry_gold_necklace: "Equipment/Amulet/Amulet_Necklace_B_Gold_A_Unfaded_Icon.png",
  jewelry_emerald_pearl_necklace: "Equipment/Amulet/Amulet_Necklace_E_Pearl_B_Unfaded_Icon.png",
  jewelry_ruby_pearl_necklace: "Equipment/Amulet/Amulet_Necklace_E_Pearl_C_Unfaded_Icon.png",
  jewelry_sapphire_gold_ring: "Equipment/Ring/Sapphire_Gold_Ring.png",
  jewelry_ruby_gold_ring: "Equipment/Ring/Gold_Ruby_Ring.png",
  jewelry_diamond_gold_ring: "Equipment/Ring/Golden Diamond Ring Render.png",

  // ---- provisions, papers and everything else
  food: "FOOD_Dried_Rope_Sausage_Unfaded_Icon.png",
  rations: "Consumable/Camp_supply/Heavy_Supply_Pack_Unfaded_Icon.png",
  barley_loaf: "FOOD_Sourdough_Bread_Unfaded_Icon.png",
  hard_farm_cheese: "FOOD_Durinbold_Cheese_Wedge_Unfaded_Icon.png",
  orchard_apple: "FOOD_Apple_Unfaded_Icon.png",
  root_vegetable_bundle: "FOOD_Turnip_Unfaded_Icon.png",
  farm_eggs: "FOOD_Egg_Unfaded_Icon.png",
  dried_pork_sausage: "FOOD_Dried_Pork_Sausage_Unfaded_Icon.png",
  fish: "Bucket_of_Fish_Unfaded_Icon.png",
  sack: "Camp_Supply_Sack_Unfaded_Icon.png",
  mount: "Miscellaneous_item/Horse.png",
  jug: "Ceramic_Jug_A_Unfaded_Icon.png",
  scroll_magic_missile: "Scroll_of_Magic_Missile_Unfaded_Icon.png",
  scroll_healing_word: "Scroll_of_Healing_Word_Unfaded_Icon.png",
  scroll_mage_armor: "Scroll_of_Mage_Armour_Unfaded_Icon.png",
  scroll_bane: "Scroll_of_Bane_Unfaded_Icon.png",
  scroll_false_life: "Scroll_of_False_Life_Unfaded_Icon.png",
  scroll_detect_magic: "Scroll_of_Detect_Magic_Unfaded_Icon.png",
  scroll_jump: "Scroll_of_Jump_Unfaded_Icon.png",
  scroll_charm_person: "Scroll_of_Charm_Person_Unfaded_Icon.png",
  scroll_speak_with_animals: "Scroll_of_Speak_with_Animals_Unfaded_Icon.png",
  water_jug: "../Generic/Filled_Water_Jug_Generated_Source.png",   // the user's own art (2026-10-19): the water jug, one icon for empty and full
  note: "Book_Note_A_Item_Icon.png",
  letter: "Book_Parchment_A_Item_Icon.png",
  ledger: "Book_Bound_A_Item_Icon.png",
  scroll: "Scroll_of_Arcane_Lock_Unfaded_Icon.png",
  stone: "Resonance_Stone_Unfaded_Icon.png",
  splinter: "../Generic/Sap_Weeping_Spruce_Splinter_Generated_Source.png",
  misc: "Pouch_A_Unfaded_Icon.webp"                              // STAND-IN: the fallback for anything without art
};

// ---- find every source up front (a bare file name is searched for under ICONS/Item)
const index = {};
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p); else (index[e.name] = index[e.name] || []).push(p);
  }
})(ITEM);

function resolveSource(spec) {
  if (spec.indexOf("/") >= 0) return path.resolve(ITEM, spec);
  const hits = index[spec] || [];
  if (hits.length === 1) return hits[0];
  if (hits.length > 1) { console.warn("  AMBIGUOUS: " + spec + " matches " + hits.length + " files; using " + path.relative(ITEM, hits[0])); return hits[0]; }
  return null;
}

let bad = 0;
const SRC = {};
for (const k of Object.keys(MAP)) {
  const p = resolveSource(MAP[k]);
  if (!p || !fs.existsSync(p)) { console.error("  MISSING source: " + k + " -> " + MAP[k]); bad++; } else SRC[k] = p;
}

if (refreshAt >= 0) {
  if (!refreshKeys.length) { console.error("--refresh-png requires at least one icon key"); process.exit(1); }
  const js = fs.existsSync(OUT) ? fs.readFileSync(OUT, "utf8") : "";
  const marker = "window.ITEM_ICONS = ";
  const start = js.indexOf("{", js.indexOf(marker));
  const end = js.lastIndexOf(";");
  if (start < 0 || end < start) { console.error("could not read the existing item-icons.js bundle"); process.exit(1); }
  const out = JSON.parse(js.slice(start, end));
  for (const k of refreshKeys) {
    if (!Object.prototype.hasOwnProperty.call(MAP, k)) { console.error("unknown icon key: " + k); bad++; continue; }
    if (!SRC[k] || path.extname(SRC[k]).toLowerCase() !== ".png") { console.error(k + " does not resolve to a PNG source"); bad++; continue; }
    out[k] = "data:image/png;base64," + fs.readFileSync(SRC[k]).toString("base64");
  }
  if (bad) process.exit(1);
  fs.writeFileSync(OUT, js.slice(0, start) + JSON.stringify(out, null, 1) + js.slice(end));
  console.log("refreshed " + refreshKeys.length + " PNG icons in " + path.relative(ROOT, OUT));
  process.exit(0);
}

if (checkOnly) {
  const js = fs.existsSync(OUT) ? fs.readFileSync(OUT, "utf8") : "";
  for (const k of Object.keys(MAP)) if (js.indexOf("\"" + k + "\":") < 0) { console.error("  item-icons.js lacks " + k); bad++; }
  if (bad) { console.error("item-icons.js is STALE or incomplete -- run `node tools/gen_item_icons.js`"); process.exit(1); }
  console.log("item-icons.js is up to date (" + Object.keys(MAP).length + " icons, " + Math.round(js.length / 1024) + " KB)");
  process.exit(0);
}
if (bad) process.exit(1);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const page = "file:///" + ITEM.replace(/\\/g, "/") + "/Consumable/Potion/POT_Potion_of_Healing_Unfaded_Icon.png";   // any file:// page to run in
  const profileDirName = "cs-itemicons-" + Date.now();
  const chrome = spawn(CHROME, ["--headless=new", "--disable-gpu", "--allow-file-access-from-files", "--remote-debugging-port=" + PORT, "--no-first-run",
    "--user-data-dir=" + path.join(os.tmpdir(), profileDirName), page], { stdio: "ignore" });
  let ws = null;
  try {
    let list = null;
    for (let i = 0; i < 40; i++) {
      await sleep(250);
      try { list = await (await fetch("http://127.0.0.1:" + PORT + "/json/list")).json(); if (list.some((t) => t.type === "page")) break; } catch (e) {}
    }
    const target = list && list.find((t) => t.type === "page");
    if (!target) throw new Error("no browser page appeared (is Chrome at " + CHROME + "? set CHROME=...)");
    ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
    let id = 0; const pending = new Map();
    ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
    const evaluate = (expression) => new Promise((res, rej) => {
      const n = ++id;
      pending.set(n, (m) => (m.result && m.result.exceptionDetails) ? rej(new Error(JSON.stringify(m.result.exceptionDetails).slice(0, 400))) : res(m.result.result.value));
      ws.send(JSON.stringify({ id: n, method: "Runtime.evaluate", params: { expression, awaitPromise: true, returnByValue: true } }));
    });

    const out = {};
    let total = 0;
    for (const k of Object.keys(MAP).sort()) {
      const url = "file:///" + SRC[k].replace(/\\/g, "/");
      const uri = await evaluate(`new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const c = document.createElement("canvas"); c.width = ${SIZE}; c.height = ${SIZE};
          const g = c.getContext("2d"); g.imageSmoothingQuality = "high";
          const s = Math.min(${SIZE} / img.width, ${SIZE} / img.height), w = img.width * s, h = img.height * s;
          g.drawImage(img, (${SIZE} - w) / 2, (${SIZE} - h) / 2, w, h);
          resolve(c.toDataURL("image/webp", ${QUALITY}));
        };
        img.onerror = () => reject(new Error("could not load " + ${JSON.stringify(k)}));
        img.src = ${JSON.stringify(url)};
      })`);
      if (!/^data:image\/webp/.test(uri)) throw new Error(k + ": the browser did not produce a WebP");
      out[k] = uri; total += uri.length;
    }
    const body = "/*\n * ITEM ICONS -- generated by tools/gen_item_icons.js from the ICONS/Item art library. Do not edit by hand; edit MAP in that script and re-run it\n" +
      " * (or `--check` to verify it is current). Read by inventory.js: window.ITEM_ICONS[key] is a data: URI. Keys are what an item IS (w_sword, a_chain, potion...).\n */\n" +
      "window.ITEM_ICONS = " + JSON.stringify(out, null, 1) + ";\n";
    fs.writeFileSync(OUT, body);
    console.log("wrote " + path.relative(ROOT, OUT) + " (" + Object.keys(out).length + " icons, " + Math.round(body.length / 1024) + " KB)");
  } finally {
    if (ws) try { ws.close(); } catch (e) {}
    // kill the whole tree this script started (the GPU and renderer children outlive chrome.kill()); by PID, never by name, so the person's own browser is untouched
    try { chrome.kill(); } catch (e) {}
    // The browser leaves helper processes behind that a plain kill misses, and they do not share a process tree with it. Find them by THIS run's own profile folder (never by program name, which would also close the person's browser).
    try { require("child_process").spawnSync("powershell", ["-NoProfile", "-Command", "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | Where-Object { $_.CommandLine -like '*" + profileDirName + "*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }"], { stdio: "ignore" }); } catch (e) {}
  }
})().catch((e) => { console.error("FAILED: " + e.message); process.exit(1); });
