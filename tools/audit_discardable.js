#!/usr/bin/env node
/*
 * audit_discardable.js -- which inventory items the discard rules (web/mygame/discard.js) would let a player throw away, and which they would protect. Read-only: it changes nothing.
 *
 * The rule is "protected unless clearly junk", so the risk is an item that LOOKS like junk (a food, an ingredient, a plain consumable) but a quest needs. This lists, among the droppable items, the ones whose
 * logic (an *if, *set, grant or spend) names them in a story scene, outside the shop and engine files: those are the ones to read and, where a quest depends on them, to give a "keep" tag in tools/gear_catalog.json.
 *
 * Run: node tools/audit_discardable.js            the summary and the lists
 *      node tools/audit_discardable.js --all      also every droppable item
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const GAME = path.join(ROOT, "web", "mygame");
global.window = global;
require(path.join(GAME, "inventory-data.js"));
require(path.join(GAME, "discard-data.generated.js"));
const Discard = require(path.join(GAME, "discard.js"));
const items = (global.INVENTORY && global.INVENTORY.items) || [];

// every scene file, with the generated blocks (shop menus, loadout branches, item creates) taken out, so only hand-written story text is searched
function walk(dir, out) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out); else if (/\.txt$/.test(e.name)) out.push(p);
  });
  return out;
}
const SKIP = /(^|[\\/])(startup\.txt|equipment\.txt|economy\.txt|calendar\.txt|choicescript_stats\.txt|combat\.txt|dev_hub\.txt|crafting\.txt|40_gear_creates_generated\.txt)$/;
const files = walk(path.join(GAME, "scenes"), []).filter((f) => !SKIP.test(f));
const texts = files.map((f) => {
  const raw = fs.readFileSync(f, "utf8").replace(/\r\n/g, "\n");
  return { f: path.relative(path.join(GAME, "scenes"), f).replace(/\\/g, "/"), t: raw.replace(/\*comment GEN:BEGIN[\s\S]*?\*comment GEN:END[^\n]*\n/g, "") };
});
// A story scene DEPENDS on an item when its logic tests, grants or spends it: a command line (starting with *) that names the item, other than a shop menu or trade cart line. Prose that merely mentions it does not count.
function mentions(id) {
  const re = new RegExp("(^|[^a-z0-9_])(has_|spare_)?" + id + "([^a-z0-9_]|$)", "i");
  const out = [];
  texts.forEach((x) => {
    let n = 0;
    x.t.split("\n").forEach((line) => {
      const s = line.trim();
      if (s[0] === "*" && !/^\*comment/.test(s) && !/gear_buy_label|gear_sell_label|_cart_|_cart\b|cart_(buy|sell)/.test(s) && re.test(s)) n++;
    });
    if (n) out.push(x.f + (n > 1 ? " (" + n + ")" : ""));
  });
  return out;
}

const rows = items.map((i) => {
  const s = Discard.status(i.id, {});
  return { id: i.id, category: i.category, status: s, hand: !global.DISCARD_DATA[i.id], kind: (global.DISCARD_DATA[i.id] || {}).kind || "(hand-written)" };
});
const drop = rows.filter((r) => r.status.ok), prot = rows.filter((r) => !r.status.ok);
const byCode = {};
prot.forEach((r) => { byCode[r.status.code] = (byCode[r.status.code] || []).concat(r); });

console.log("Inventory items: " + rows.length + "  |  droppable: " + drop.length + "  |  protected: " + prot.length);
Object.keys(byCode).forEach((c) => console.log("  protected (" + c + "): " + byCode[c].length));

console.log("\n== PROTECTED, hand-written story pieces (" + (byCode.story || []).filter((r) => r.hand).length + "): always locked unless given a keep tag with an \"until\" ==");
console.log((byCode.story || []).filter((r) => r.hand).map((r) => "  " + r.id + "  [" + r.category + "]").join("\n"));

console.log("\n== PROTECTED, catalog items of a protected kind ==");
console.log(prot.filter((r) => !r.hand).map((r) => "  " + r.id + "  [" + r.kind + "] " + r.status.why).join("\n") || "  (none)");

// Scenes that are quests, hunts or dungeons (as opposed to town menus, shops and general travel text): an item they test, grant or spend is the likeliest to be one a quest needs.
const QUEST_RE = /(Quest|varren_quests|black_oath|longshade|radiant|innkeepers_daughter|stolen_shroud|muffled|rotten_rib|quiet_block|silt_conduits|dry_lion|a_key_for_every_door|startup_parts\/(17|20|21|22|39|42|43|44|46)_)/i;
const flagged = drop.map((r) => ({ r, scenes: mentions(r.id) })).filter((x) => x.scenes.length);
const quest = flagged.map((x) => ({ r: x.r, scenes: x.scenes.filter((s) => QUEST_RE.test(s)) })).filter((x) => x.scenes.length).sort((a, b) => b.scenes.length - a.scenes.length);
console.log("\n== DROPPABLE, but a QUEST, HUNT OR DUNGEON scene tests, grants or spends them (" + quest.length + "): the tagging candidates; read these ==");
quest.forEach((x) => console.log("  " + x.r.id.padEnd(26) + "[" + x.r.kind + "]  " + x.scenes.slice(0, 3).join(", ") + (x.scenes.length > 3 ? " +" + (x.scenes.length - 3) + " more" : "")));

const other = flagged.filter((x) => !quest.some((q) => q.r.id === x.r.id));
const quiet = drop.filter((r) => !flagged.some((x) => x.r.id === r.id));
console.log("\n== DROPPABLE, used only by town, shop or general scenes (" + other.length + ") and not used by any story logic (" + quiet.length + ") ==");
console.log(process.argv.includes("--all") ? other.map((x) => "  " + x.r.id + "  [" + x.r.kind + "]  " + x.scenes.slice(0, 2).join(", ")).concat(quiet.map((r) => "  " + r.id + "  [" + r.kind + "]")).join("\n") : "  (run with --all to list them)");