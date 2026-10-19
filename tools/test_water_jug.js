#!/usr/bin/env node
/*
 * test_water_jug.js -- the water jug's rules in the pack (web/mygame/inventory.js): ONE item, has_water_jug + spare_water_jug jugs of which jug_full are full. An empty jug weighs 1 pound and a full one 8; the hover line says how many of each;
 * stowing in the saddlebags takes the empty ones first and keeps the full ones full, both ways; a full jug weighs its 8 pounds in the bags and counts against their room.
 * Run: node tools/test_water_jug.js        Exit code 1 if a rule breaks.
 */
const path = require("path");
const assert = require("assert");
const ROOT = path.resolve(__dirname, "..");
global.window = {};
require(path.join(ROOT, "web", "mygame", "inventory-data.js"));
require(path.join(ROOT, "web", "mygame", "inventory.js"));
const P = global.window.InventoryPanel;
const SB = "saddlebags";
let n = 0;
function ok(cond, msg) { assert.ok(cond, msg); n++; }
function fresh(extra) { return (global.window.stats = Object.assign({ character_class: "fighter", strength: 16, has_horse: true, gold: 0, silver: 0, copper: 0, jug_full: 0 }, extra || {})); }
const gear = (s) => P.loadOf(s).gear;
const D = global.window.INVENTORY.items.filter((i) => i.id === "water_jug")[0];
const item = (s) => (s.has_water_jug ? { name: D.name(s), traits: D.traits(s) } : null);

// weight: 1 empty, 8 full
let s = fresh({ has_water_jug: true });
ok(gear(s) === 1, "one empty jug is 1 pound");
s = fresh({ has_water_jug: true, jug_full: 1 });
ok(gear(s) === 8, "one full jug is 8 pounds");
s = fresh({ has_water_jug: true, spare_water_jug: 2, jug_full: 2 });
ok(gear(s) === 17, "three jugs, two full: 2 x 8 + 1 = 17");
s = fresh({ has_water_jug: true, spare_water_jug: 1, jug_full: 9 });
ok(gear(s) === 16, "the full count never counts more jugs than are carried (2 jugs, both full)");
s = fresh({});
ok(gear(s) === 0 && !item(s), "no jug, no weight, no item");

// the name and the hover line
s = fresh({ has_water_jug: true, spare_water_jug: 2, jug_full: 2 });
ok(item(s).name === "Water Jug ×3", "the stack shows its count: " + item(s).name);
ok(item(s).traits === "3 jugs: 2 full of water, 1 empty", "the hover line: " + item(s).traits);
s = fresh({ has_water_jug: true, jug_full: 1 });
ok(item(s).traits === "Full of water", "one full jug: " + item(s).traits);
s = fresh({ has_water_jug: true });
ok(item(s).traits === "Empty", "one empty jug: " + item(s).traits);

// stowing takes the empty ones first, and the weight follows the full ones
s = fresh({ has_water_jug: true, spare_water_jug: 3, jug_full: 2 });   // four jugs: two full, two empty
ok(P.stowUnits(SB, "water_jug", 2).moved === 2, "stow two");
ok(s.jug_full === 2 && s.stow_saddlebags_jug_full === 0 && s.stow_saddlebags_water_jug === 2, "the two empty ones went; both full ones stay in the pack");
ok(gear(s) === 16 && P.containerOf(SB, s).total === 2, "the pack holds two full jugs (16), the bags two empty ones (2)");
ok(P.stowUnits(SB, "water_jug", 1).moved === 1 && s.jug_full === 1 && s.stow_saddlebags_jug_full === 1, "a third goes: it is a full one now");
ok(P.containerOf(SB, s).total === 2 + 8 && gear(s) === 8, "the bags now weigh 2 + 8, the pack 8");
// taking back brings the empty ones first too
ok(P.takeUnits(SB, "water_jug", 2).moved === 2 && s.stow_saddlebags_water_jug === 1 && s.stow_saddlebags_jug_full === 1 && s.jug_full === 1, "two come back: the two empty ones; the full one stays in the bags");
ok(gear(s) === 8 + 2, "the pack holds one full jug and two empties: " + gear(s));
ok(P.takeUnits(SB, "water_jug", 5).moved === 1 && s.jug_full === 2 && s.stow_saddlebags_jug_full === 0 && s.stow_saddlebags_water_jug === 0, "the last one back is the full one");
ok(gear(s) === 2 * 8 + 2 * 1, "all four are home: 2 full + 2 empty = 18");
const total = (1 + s.spare_water_jug) + s.stow_saddlebags_water_jug;
ok(total === 4 && s.jug_full === 2, "no jug is lost or made");

// what a stowed stack says
s = fresh({ has_water_jug: true, spare_water_jug: 2, jug_full: 3 });
P.stowUnits(SB, "water_jug", 3);
ok(s.stow_saddlebags_water_jug === 3 && s.stow_saddlebags_jug_full === 3 && s.jug_full === 0, "all three, all full, went into the bags");
const row = P.containerOf(SB, s).entries[0];
ok(row.qty === 3, "the bags list the jugs");

// room: the full ones weigh in last, so a full jug counts against the bags' room
s = fresh({ has_water_jug: true, spare_water_jug: 59, jug_full: 60, strength: 16 });   // 60 jugs, all full: 8 each; the bags hold 480 less the rider's 160 = 320
ok(P.stowRoom(SB, "water_jug", s).n === 40, "40 full jugs (320 pounds) fit in 320: " + P.stowRoom(SB, "water_jug", s).n);
s = fresh({ has_water_jug: true, spare_water_jug: 59, jug_full: 10 });   // 60 jugs, ten full: fifty empty (50) then the full ones
ok(P.stowRoom(SB, "water_jug", s).n === 60, "fifty empty (50 pounds) and ten full (80) is 130: all sixty fit");
console.log("water jug: " + n + " checks passed");
