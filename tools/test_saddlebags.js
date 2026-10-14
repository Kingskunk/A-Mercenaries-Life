#!/usr/bin/env node
/*
 * test_saddlebags.js -- the pack's container rules (web/mygame/inventory.js stowRoom / stowUnits / takeUnits / containerOf), run on plain stats with the saddlebags as the container: a stow and a
 * take-back conserve every unit, what is worn cannot be stowed, a container refuses past its capacity (never a penalty), nothing moves without the horse or inside a dungeon or a fight,
 * and the contents wait when the horse is gone. A second, invented container checks that the rules read the container's own entry (needs, capacity, dungeon) and that two containers
 * keep separate counts.
 * Run: node tools/test_saddlebags.js        Exit code 1 if a rule breaks.
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
function fresh(extra) { return (global.window.stats = Object.assign({ character_class: "fighter", strength: 16, has_horse: true, gold: 0, silver: 0, copper: 0 }, extra || {})); }
const units = (s, id) => (s["has_" + id] ? 1 + (Number(s["spare_" + id]) || 0) : 0) + (Number(s["stow_" + SB + "_" + id]) || 0);

// conservation: stow some, take some, the unit count never changes
let s = fresh({ has_pitch_torch: true, spare_pitch_torch: 3 });
ok(units(s, "pitch_torch") === 4, "four torches to start");
ok(P.stowUnits(SB, "pitch_torch", 2).moved === 2 && units(s, "pitch_torch") === 4 && s.stow_saddlebags_pitch_torch === 2, "stow two");
ok(P.stowUnits(SB, "pitch_torch", 999).moved === 2 && s.has_pitch_torch === false && units(s, "pitch_torch") === 4, "stow the rest, including the base copy");
ok(P.takeUnits(SB, "pitch_torch", 1).moved === 1 && s.has_pitch_torch === true && units(s, "pitch_torch") === 4, "take one back: the base copy returns first");
ok(P.takeUnits(SB, "pitch_torch", 999).moved === 3 && s.stow_saddlebags_pitch_torch === 0 && s.spare_pitch_torch === 3 && units(s, "pitch_torch") === 4, "take the rest back");

// a unique piece moves whole
s = fresh({ has_scholar_gloves: true });
ok(P.stowUnits(SB, "scholar_gloves", 5).moved === 1 && s.has_scholar_gloves === false && s.stow_saddlebags_scholar_gloves === 1, "a unique item stows once");
ok(P.takeUnits(SB, "scholar_gloves", 5).moved === 1 && s.has_scholar_gloves === true, "and comes back once");

// worn gear stays; a worn stack stows only its spares
s = fresh({ has_broadcloth_cloak: true, equipped_cloak_id: "broadcloth_cloak" });
ok(P.stowRoom(SB, "broadcloth_cloak", s).n === 0, "a worn cloak cannot be stowed");
s = fresh({ has_longshade_spear: true, spare_longshade_spear: 1, equipped_weapon_id: "longshade_spear" });
ok(P.stowRoom(SB, "longshade_spear", s).n === 1, "a worn weapon's spare can be");

// capacity: refuses, never penalises
s = fresh({ has_plate_harness: true, spare_plate_harness: 5 });   // 14 each, 40 in the bags
ok(P.stowRoom(SB, "plate_harness", s).n === 2, "two plate harnesses (28) fit in 40, a third (42) does not");
P.stowUnits(SB, "plate_harness", 999);
ok(P.stowRoom(SB, "plate_harness", s).n === 0 && /full/.test(P.stowRoom(SB, "plate_harness", s).why), "full bags refuse");
ok(P.containerOf(SB, s).total <= P.containerOf(SB, s).capacity, "never over capacity");

// where and when
s = fresh({ has_hooded_lantern: true });
s.has_horse = false; ok(P.stowRoom(SB, "hooded_lantern", s).n === 0, "no horse, no stowing");
s.has_horse = true; s.dg_in_run = true; ok(P.stowRoom(SB, "hooded_lantern", s).n === 0, "not in a dungeon");
s.dg_in_run = false; s.combat_engaged = true; ok(P.stowRoom(SB, "hooded_lantern", s).n === 0, "not in a fight");
s.combat_engaged = false; ok(P.stowRoom(SB, "hooded_lantern", s).n === 1, "free again");

// the contents wait for a horse
s = fresh({ has_hooded_lantern: true });
P.stowUnits(SB, "hooded_lantern", 1); s.has_horse = false;
ok(P.takeUnits(SB, "hooded_lantern", 1).moved === 0 && s.stow_saddlebags_hooded_lantern === 1, "nothing comes back without a horse");
const st = P.containerOf(SB, s);
ok(st.entries.length === 1 && st.present === false, "but it is still there, waiting");
ok(P.visibleContainers(s).length === 1, "and the container stays listed while it holds something");
s.has_horse = true; ok(P.takeUnits(SB, "hooded_lantern", 1).moved === 1, "a horse again, and it comes back");
ok(P.visibleContainers(s).length === 1, "with a horse it is listed even when empty");
s.has_horse = false; ok(P.visibleContainers(s).length === 0, "no horse and nothing in it: not listed");

// stowed things are not carried: the load drops by exactly their weight
s = fresh({ has_hemp_rope: true, spare_hemp_rope: 2 });
const before = P.loadOf(s).gear; P.stowUnits(SB, "hemp_rope", 3);
ok(Math.abs(before - P.loadOf(s).gear - 6) < 1e-9, "three ropes (2 each) leave the load");

// the rules read the container's own entry, and two containers keep separate counts
const cfg = global.window.INVENTORY.load.containers;
cfg.push({ id: "wagon", name: "Wagon", capacity: 100, needs: "has_wagon", needsReason: "Your wagon is not here.", dungeon: "waits", note: "" });
s = fresh({ has_pitch_torch: true, spare_pitch_torch: 4, has_wagon: false });
ok(P.stowRoom("wagon", "pitch_torch", s).n === 0 && /wagon is not here/.test(P.stowRoom("wagon", "pitch_torch", s).why), "a container with its own needs");
s.has_wagon = true;
ok(P.stowUnits("wagon", "pitch_torch", 2).moved === 2 && P.stowUnits(SB, "pitch_torch", 1).moved === 1, "stow into two containers");
ok(s.stow_wagon_pitch_torch === 2 && s.stow_saddlebags_pitch_torch === 1 && units(s, "pitch_torch") === 3 + 2 - 2 + 0, "separate counts (units outside the wagon: carried 2 + saddlebags 1)");
ok(P.containerOf("wagon", s).capacity === 100 && P.containerOf(SB, s).capacity === 40, "separate capacities");
cfg.pop();
console.log("containers: " + n + " checks passed");
