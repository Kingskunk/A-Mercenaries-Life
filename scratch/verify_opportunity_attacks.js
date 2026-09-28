// Opportunity attacks + Disengage (2026-09-28), Phase 1: find_opportunity_attacker and the two
// departure options. Transcribed from combat.txt and checked against the caps that make this safe
// alongside the global combat_shift_all_ranges move.
// Run: node scratch/verify_opportunity_attacks.js
"use strict";

var fails = 0;
function check(label, cond, extra) {
  if (!cond) { fails++; console.log("  FAIL  " + label + (extra ? "\n          " + extra : "")); }
  else console.log("  PASS  " + label);
}

// find_opportunity_attacker, transcribed.
function findOA(count, enemies) {
  var cand = 0, bestHp = 0;
  for (var i = 1; i <= count; i++) {
    var e = enemies[i];
    if (!e) continue;
    if (e.hp > 0 && e.weapon === "melee" && e.range <= 0 && e.oa === false) {
      if (cand === 0 || e.hp < bestHp) { cand = i; bestHp = e.hp; }
    }
  }
  return cand;
}

console.log("--- C1. the cap: three engaged melee enemies still yield ONE attacker ---");
var three = { 1: { hp: 30, weapon: "melee", range: 0, oa: false },
              2: { hp: 25, weapon: "melee", range: 0, oa: false },
              3: { hp: 20, weapon: "melee", range: 0, oa: false } };
check("exactly one candidate, never three", findOA(3, three) === 3);

console.log("\n--- C2. lowest-HP engaged enemy wins (matches find_intercepting_ally) ---");
check("picks the weakest, not the lowest slot", findOA(3, three) === 3);
var two = { 1: { hp: 4, weapon: "melee", range: 0, oa: false },
            2: { hp: 40, weapon: "melee", range: 0, oa: false } };
check("a nearly-dead enemy is finished off first", findOA(2, two) === 1);
var tie = { 1: { hp: 12, weapon: "melee", range: 0, oa: false },
            2: { hp: 12, weapon: "melee", range: 0, oa: false } };
check("ties fall to the lowest slot (strict <)", findOA(2, tie) === 1);

console.log("\n--- C3. all four eligibility rules are enforced ---");
check("no enemies -> nobody", findOA(0, {}) === 0);
check("all downed -> nobody", findOA(1, { 1: { hp: 0, weapon: "melee", range: 0, oa: false } }) === 0);
check("a RANGED enemy at range 0 never OAs (5e: an OA is a melee attack)",
      findOA(1, { 1: { hp: 30, weapon: "ranged", range: 0, oa: false } }) === 0);
check("a melee enemy at Close is not yet in reach",
      findOA(1, { 1: { hp: 30, weapon: "melee", range: 1, oa: false } }) === 0);
check("a melee enemy at Mid-Range is not in reach",
      findOA(1, { 1: { hp: 30, weapon: "melee", range: 2, oa: false } }) === 0);
check("an enemy that already spent its reaction cannot OAs again",
      findOA(1, { 1: { hp: 30, weapon: "melee", range: 0, oa: true } }) === 0);

console.log("\n--- C4. one enemy can hurt the player at most once per round ---");
// Simulate a round of repeated retreats against the same engaged enemy.
var state = { 1: { hp: 30, weapon: "melee", range: 0, oa: false } };
var swings = 0;
for (var m = 0; m < 4; m++) {                       // four departures in one round
  var c = findOA(1, state);
  if (c > 0) { state[c].oa = true; swings++; }     // resolve_opportunity_attack spends it
  state[1].range = 0;                               // re-engaged before trying again
}
check("4 retreats -> exactly 1 opportunity attack", swings === 1, "got " + swings);
state[1].oa = false;                                // combat_begin_round
check("the round boundary gives the reaction back", findOA(1, state) === 1);

console.log("\n--- C5. the flag and the replay lock can never disagree ---");
// resolve_enemy_attack skips its roll when combat_enemy_atk_locked_<slot> is already set for this
// page, so a second same-slot attack on one page would silently do NOTHING. The per-round flag is
// what makes that unreachable: once spent, find_opportunity_attacker returns 0 and no second call
// ever reaches the resolver.
var attempted = 0;
for (var r2 = 0; r2 < 2; r2++) {
  var cand = findOA(1, { 1: { hp: 30, weapon: "melee", range: 0, oa: r2 === 1 } });
  if (cand > 0) attempted++;
}
check("only one call reaches the resolver on a page", attempted === 1);

console.log("\n--- C6. availability gates ---");
// combat_can_disengage / combat_can_break_off, transcribed.
function canDisengage(actions, disengaged, restricted) {
  return actions > 0 && !disengaged && !restricted;
}
function canBreakOff(moves, restricted) { return moves > 0 && !restricted; }
check("Disengage available with an action in hand", canDisengage(1, false, false) === true);
check("Disengage hidden once the action is spent", canDisengage(0, false, false) === false);
check("Disengage hidden once already active this round", canDisengage(1, true, false) === false);
check("Disengage hidden while Pinned/Hobbled/Off-Balance holds", canDisengage(1, false, true) === false);
check("Break off needs a movement tier (no longer free)", canBreakOff(0, false) === false);
check("Break off available with a move in hand", canBreakOff(1, false) === true);
check("Break off hidden while movement-restricted", canBreakOff(1, true) === false);

console.log("\n--- C7. exhaustive: a returned candidate is always a legal attacker ---");
var bad = 0, checked = 0;
for (var h1 = 0; h1 <= 2; h1++) for (var h2 = 0; h2 <= 2; h2++)
for (var w1 = 0; w1 <= 1; w1++) for (var w2 = 0; w2 <= 1; w2++)
for (var g1 = 0; g1 <= 2; g1++) for (var g2 = 0; g2 <= 2; g2++)
for (var o1 = 0; o1 <= 1; o1++) for (var o2 = 0; o2 <= 1; o2++) {
  var set = { 1: { hp: h1 * 10, weapon: w1 ? "melee" : "ranged", range: g1, oa: o1 === 1 },
              2: { hp: h2 * 10, weapon: w2 ? "melee" : "ranged", range: g2, oa: o2 === 1 } };
  var pick = findOA(2, set);
  checked++;
  var any = false;
  for (var s2 = 1; s2 <= 2; s2++) {
    if (set[s2].hp > 0 && set[s2].weapon === "melee" && set[s2].range <= 0 && !set[s2].oa) any = true;
  }
  if (any) { var p = set[pick]; if (!p || p.hp <= 0 || p.weapon !== "melee" || p.range > 0 || p.oa) bad++; }
  else if (pick !== 0) bad++;
}
check(checked + " configurations, every pick is a legal unspent melee attacker", bad === 0, bad + " illegal");

console.log(fails === 0 ? "\nAll opportunity-attack checks passed." : "\n" + fails + " FAILED.");
if (fails) process.exitCode = 1;
