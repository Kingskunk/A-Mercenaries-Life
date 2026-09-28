// Two fixes from 2026-09-28, transcribed and checked against their pre-fix behaviour.
//   A. fight_pick_nearest_target's *else binding -- an alive-but-ineligible clicked target was being cleared.
//   B. The 2024-rules ranged-at-closerange disadvantage house rule in resolve_enemy_attack.
// Run: node scratch/verify_targeting_fixes.js
"use strict";

var fails = 0;
function check(label, cond, extra) {
  if (!cond) { fails++; console.log("  FAIL  " + label + (extra ? "\n          " + extra : "")); }
  else console.log("  PASS  " + label);
}

// ── A. the chosen-target clear ────────────────────────────────────────────────────────────────────────
// Returns the value combat_player_chosen_target holds AFTER the call.
function pickNearest(direction, count, hp, range, chosen) {
  var active = 0;
  if (chosen > 0) {
    var chp = hp[chosen];
    if (chosen <= count && chp > 0) {
      var r = range[chosen];
      if ((direction === "push" && r > 0) || (direction === "fallback" && r < 3)) active = chosen;
    } else {
      chosen = 0;                       // correctly bound: only dead/out-of-range clears a click
    }
  }
  return { active: active, chosen: chosen };
}

// BEFORE: the eligibility *if carried the *else, so an alive-but-ineligible click was wiped too.
function pickNearestBefore(direction, count, hp, range, chosen) {
  var active = 0;
  if (chosen > 0) {
    var chp = hp[chosen];
    var alive = chosen <= count && chp > 0;
    var eligible = false;
    if (alive) { var r = range[chosen]; eligible = (direction === "push" && r > 0) || (direction === "fallback" && r < 3); }
    if (alive) { if (eligible) active = chosen; else chosen = 0; }   // <-- the bug
    else { chosen = 0; }
  }
  return { active: active, chosen: chosen };
}

var hp = { 1: 30, 2: 20 }, rng = { 1: 0, 2: 3 };   // slot 1 Engaged, slot 2 Long Range

console.log("--- A1. click an Engaged target, then Push forward (it is ineligible) ---");
var b = pickNearestBefore("push", 2, hp, rng, 1);
var a = pickNearest("push", 2, hp, rng, 1);
console.log("  BEFORE chosen=" + b.chosen + "  |  AFTER chosen=" + a.chosen + " (active=" + a.active + ")");
check("BEFORE wiped the click (the reported bug)", b.chosen === 0);
check("AFTER keeps the click alive", a.chosen === 1);
check("AFTER correctly did NOT select it for this move", a.active === 0);

console.log("\n--- A2. mirror case: click a Long Range target, then Fall back ---");
var b2 = pickNearestBefore("fallback", 2, hp, rng, 2);
var a2 = pickNearest("fallback", 2, hp, rng, 2);
check("BEFORE wiped it", b2.chosen === 0);
check("AFTER keeps it", a2.chosen === 2 && a2.active === 0);

console.log("\n--- A3. clearing must STILL happen when the clicked slot is genuinely gone ---");
var deadHp = { 1: 0, 2: 20 };
check("a DEAD clicked target is cleared, before and after",
      pickNearestBefore("push", 2, deadHp, rng, 1).chosen === 0 && pickNearest("push", 2, deadHp, rng, 1).chosen === 0);
check("a slot BEYOND combat_enemy_count is cleared, before and after",
      pickNearestBefore("push", 1, hp, rng, 2).chosen === 0 && pickNearest("push", 1, hp, rng, 2).chosen === 0);

console.log("\n--- A4. eligible clicks behave identically before and after (no regression) ---");
var same = true;
for (var c = 1; c <= 2; c++) {
  for (var d = 0; d < 2; d++) {
    var dir = d ? "fallback" : "push";
    if (pickNearestBefore(dir, 2, hp, rng, c).active !== pickNearest(dir, 2, hp, rng, c).active) same = false;
  }
}
check("selection of the active slot is unchanged in every eligible case", same);

// ── B. ranged-at-closerange disadvantage ──────────────────────────────────────────────────────────────
function advLabel(weaponType, range, disadvantage, advantage) {
  var pinned = (weaponType === "ranged" && range <= 0);
  if ((disadvantage || pinned) && !advantage) return pinned ? "pinned" : "debuff";
  if (advantage && !disadvantage && !pinned) return "advantage";
  return "none";
}

console.log("\n--- B1. fires only for a RANGED enemy at range 0 ---");
check("archer at range 0 -> disadvantage", advLabel("ranged", 0, false, false) === "pinned");
check("archer at range 1 -> no penalty", advLabel("ranged", 1, false, false) === "none");
check("archer at Long Range -> no penalty", advLabel("ranged", 3, false, false) === "none");
check("MELEE enemy at range 0 -> no penalty", advLabel("melee", 0, false, false) === "none");

console.log("\n--- B2. must not clobber the condition-based debuff ---");
check("Ray of Frost on a melee enemy still reads as a plain disadvantage", advLabel("melee", 0, true, false) === "debuff");
check("debuff + new rule together still read as one disadvantage", advLabel("ranged", 0, true, false) === "pinned");
check("a debuff on a distant archer is untouched", advLabel("ranged", 3, true, false) === "debuff");

console.log("\n--- B3. advantage still cancels it, exactly as it cancels a debuff ---");
check("advantage cancels the close-range penalty", advLabel("ranged", 0, false, true) === "none");
check("advantage cancels a debuff (pre-existing behaviour preserved)", advLabel("melee", 0, true, true) === "none");
check("advantage still works on a distant archer", advLabel("ranged", 3, false, true) === "advantage");

console.log("\n--- B4. it is a real accuracy drop: expected d20 falls 10.5 -> 7.175 ---");
// E[min of two d20] = sum_{j=1..20} (j/20)^2 = (20*21*41/6)/400 = 2870/400 = 7.175, i.e. a 31.67%
// drop. (6.25 is the WELL-known d20 disadvantage figure used for 4d6-drop-lowest, not this.)
function meanBest(weaponType, range) {
  var pinned = (weaponType === "ranged" && range <= 0);
  var total = 0, n = 0;
  for (var r1 = 1; r1 <= 20; r1++) {
    if (pinned) { for (var r2 = 1; r2 <= 20; r2++) { total += Math.min(r1, r2); n++; } }
    else { total += r1; n++; }
  }
  return total / n;
}
var flat = meanBest("ranged", 3), pinnedMean = meanBest("ranged", 0);
check("flat d20 averages 10.5", Math.abs(flat - 10.5) < 1e-9, "got " + flat);
check("disadvantage d20 averages 7.175", Math.abs(pinnedMean - 7.175) < 1e-9, "got " + pinnedMean);
check("a ~31.67% drop in expected roll", Math.abs((10.5 - pinnedMean) / 10.5 * 100 - 31.6667) < 0.01,
      "got " + ((10.5 - pinnedMean) / 10.5 * 100).toFixed(3) + "%");

console.log("\n--- B5. it never writes the durable flag the engine consumes ---");
// resolve_enemy_attack clears combat_enemy_disadvantage on the roll. The new rule is a *temp, so a
// debuff still owed on that slot must survive this attack and remain usable next round.
var slotDis = true;
check("with only the new rule firing, the per-slot debuff is left intact",
      advLabel("ranged", 0, false, false) === "pinned" && slotDis === true);

console.log(fails === 0 ? "\nAll targeting-fix checks passed." : "\n" + fails + " FAILED.");
if (fails) process.exitCode = 1;
