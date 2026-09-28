// find_intercepting_ally (combat.txt), transcribed before and after the 2026-09-28 broadening, so the
// behaviour change is measurable rather than asserted. The old version required the ally's own
// combat_ally<N>_target to equal the dispatching enemy; the new one treats "in melee" as a shared bucket and
// picks the LOWEST-HP engaged ally so several enemies don't dogpile one slot.
// Run: node scratch/verify_interception.js
"use strict";

var SLOT_CAP = 4;

// BEFORE: required target == dispatching enemy.
function oldRule(allies, activeTarget) {
  for (var i = 1; i <= SLOT_CAP; i++) {
    var a = allies[i];
    if (!a) continue;
    if (a.hp > 0 && a.weapon === "melee" && a.target === activeTarget && a.range <= 0) return i;
  }
  return 0;
}

// AFTER: any engaged living melee ally is fair game; lowest HP wins, ties fall to the lowest slot.
function newRule(allies) {
  var pick = 0, bestHp = 0;
  for (var i = 1; i <= SLOT_CAP; i++) {
    var a = allies[i];
    if (!a) continue;
    if (a.hp > 0 && a.weapon === "melee" && a.range <= 0) {
      if (pick === 0 || a.hp < bestHp) { pick = i; bestHp = a.hp; }
    }
  }
  return pick;
}

var fails = 0;
function check(label, cond, extra) {
  if (!cond) { fails++; console.log("  FAIL  " + label + (extra ? "\n          " + extra : "")); }
  else console.log("  PASS  " + label);
}

console.log("--- the dead-branch case: tank fighting a DIFFERENT enemy ---");
var split = {
  1: { hp: 30, weapon: "melee", target: 2, range: 0 },   // guard locked onto the archer
  2: { hp: 7,  weapon: "ranged", target: 1, range: 3 }
};
console.log("  OLD -> slot " + oldRule(split, 1) + "   NEW -> slot " + newRule(split));
check("OLD never intercepted the swordsman (the reported bug)", oldRule(split, 1) === 0);
check("NEW does intercept it", newRule(split) === 1);

console.log("\n--- dogpile guard: two engaged allies, three enemies acting ---");
var duo = {
  1: { hp: 30, weapon: "melee", target: 1, range: 0 },
  2: { hp: 9,  weapon: "melee", target: 1, range: 0 }
};
// The naive "first engaged ally" rule every enemy would match:
var naiveFirst = 0;
for (var i = 1; i <= SLOT_CAP; i++) { if (duo[i] && duo[i].hp > 0 && duo[i].weapon === "melee" && duo[i].range <= 0) { naiveFirst = i; break; } }
check("a naive first-match rule sends all three enemies at slot 1", naiveFirst === 1);
check("NEW rule spreads: everyone hits the weaker ally (slot 2)", newRule(duo) === 2,
      "picked " + newRule(duo));

console.log("\n--- focus walks down the wounded ally in sequence, as they fall ---");
var t1 = { 1: { hp: 30, weapon: "melee", range: 0 }, 2: { hp: 9, weapon: "melee", range: 0 } };
check("ally 2 (9 HP) is the focus", newRule(t1) === 2);
var t2 = { 1: { hp: 30, weapon: "melee", range: 0 }, 2: { hp: 0, weapon: "melee", range: 0 } };
check("once ally 2 is down, focus moves to ally 1", newRule(t2) === 1);
var t3 = { 1: { hp: 30, weapon: "melee", range: 0 } };
check("with only ally 1 left, it is the focus", newRule(t3) === 1);

console.log("\n--- eligibility is unchanged ---");
check("no allies at all -> 0 (enemy hits the player)", newRule({}) === 0);
check("all allies downed -> 0", newRule({ 1: { hp: 0, weapon: "melee", range: 0 } }) === 0);
check("a RANGED ally at range 0 still never intercepts",
      newRule({ 1: { hp: 30, weapon: "ranged", range: 0 } }) === 0);
check("a melee ally still at Close is not yet blocking",
      newRule({ 1: { hp: 30, weapon: "melee", range: 1 } }) === 0);
check("a melee ally at Mid-Range is not yet blocking",
      newRule({ 1: { hp: 30, weapon: "melee", range: 2 } }) === 0);

console.log("\n--- ties fall to the lowest slot (strict <) ---");
var tie = { 1: { hp: 20, weapon: "melee", range: 0 }, 2: { hp: 20, weapon: "melee", range: 0 } };
check("equal HP picks slot 1", newRule(tie) === 1);

console.log("\n--- the new rule can only ever intercept a LEGAL ally ---");
// Exhaustive: the returned slot must always be a living melee ally at range 0, and never slot 0 unless none exist.
var bad = 0, legal = 0, checked = 0;
for (var h1 = 0; h1 <= 2; h1++) for (var h2 = 0; h2 <= 2; h2++)
for (var w1 = 0; w1 <= 1; w1++) for (var w2 = 0; w2 <= 1; w2++)
for (var r1 = 0; r1 <= 1; r1++) for (var r2 = 0; r2 <= 1; r2++) {
  var set = {
    1: { hp: h1 * 10, weapon: w1 ? "melee" : "ranged", range: r1 },
    2: { hp: h2 * 10, weapon: w2 ? "melee" : "ranged", range: r2 }
  };
  var pick = newRule(set);
  checked++;
  var expectAny = false;
  for (var s = 1; s <= 2; s++) if (set[s].hp > 0 && set[s].weapon === "melee" && set[s].range <= 0) expectAny = true;
  if (expectAny) {
    legal++;
    var p = set[pick];
    if (!p || p.hp <= 0 || p.weapon !== "melee" || p.range > 0) bad++;
  } else if (pick !== 0) { bad++; }
}
check(checked + " ally configurations, every pick is a legal engaged melee ally", bad === 0, bad + " illegal");

console.log("\n--- no regression on single-enemy fights with no allies ---");
check("a lone enemy in an empty party still targets the player", newRule({}) === 0);

console.log(fails === 0 ? "\nAll interception checks passed." : "\n" + fails + " FAILED.");
if (fails) process.exitCode = 1;
