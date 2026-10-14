#!/usr/bin/env node
/*
 * check_inventory_weights.js -- every item in the pack has a weight (load points, 0 or more, in steps of 0.1), the load block names a capacity, coin weights and starting gear, and every
 * catalog item's weight matches the generated pack entry. Weights live in tools/gear_catalog.json (catalog stock) and in inventory-data.js (the hand-written entries); the capacity
 * formula, coin weights and starting gear are in the catalog and reach inventory-data.js's `load` block through tools/gen_gear.js.
 * Run: node tools/check_inventory_weights.js        Exit code 1 if anything disagrees.
 */
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
global.window = {};
require(path.join(ROOT, "web", "mygame", "inventory-data.js"));
const INV = global.window.INVENTORY;
const catalog = require(path.join(ROOT, "tools", "gear_catalog.json"));
let bad = 0;
function fail(m) { console.error("  FAIL: " + m); bad++; }
const tenth = (n) => Math.abs(n * 10 - Math.round(n * 10)) < 1e-9;

INV.items.forEach((it) => {
  if (typeof it.weight !== "number" || !(it.weight >= 0)) fail("pack item " + it.id + " has no weight (a number of load points, 0 or more)");
  else if (!tenth(it.weight)) fail("pack item " + it.id + " weighs " + it.weight + ", which is not a multiple of 0.1");
});
catalog.items.forEach((c) => {
  const e = INV.items.find((i) => i.id === c.id);
  if (typeof c.weight !== "number") fail("catalog item " + c.id + " has no weight");
  else if (e && e.weight !== c.weight) fail("catalog item " + c.id + " weighs " + c.weight + " but its pack entry says " + e.weight + " (run node tools/gen_gear.js)");
});
const L = INV.load;
if (!L) fail("inventory-data.js has no load block (run node tools/gen_gear.js)");
else {
  if (!(L.capacityBase > 0) || !(L.capacityPerStr >= 0)) fail("load.capacityBase / capacityPerStr are missing");
  if (typeof L.capacityHorse !== "number") fail("load.capacityHorse is missing (the capacity a horse adds)");
  ["copper", "silver", "gold"].forEach((k) => { if (typeof (L.coin || {})[k] !== "number") fail("load.coin." + k + " is missing"); });
  const st = L.starting || {};
  ["armor", "weapons", "sidearms", "sidearm_by_class", "clothing"].forEach((k) => { if (!st[k]) fail("load.starting." + k + " is missing"); });
  ["fighter", "barbarian", "wizard", "warlock", "rogue", "bard", "ranger"].forEach((cl) => {
    const sid = st.sidearm_by_class && st.sidearm_by_class[cl];
    if (!sid || !(st.sidearms && typeof st.sidearms[sid] === "number")) fail("class " + cl + " has no sidearm weight");
  });
}
if (bad) { console.error(bad + " problem(s)"); process.exit(1); }
console.log("inventory weights: " + INV.items.length + " pack items, capacity " + L.capacityBase + " + " + L.capacityPerStr + " x STR. OK.");
