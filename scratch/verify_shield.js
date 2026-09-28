// Walks resolve_enemy_attack's Shield logic (combat_dice.txt:253-276) for every combination of
// attack total, armor_class and shield_armed, and checks three things the attack banner depends on:
//   1. the hit is first judged at the BARE AC (Shield cannot help a blow that already missed),
//   2. a Shield that triggers re-judges the same roll at AC+5 and can flip the result,
//   3. the DC printed is the one the roll was actually tested against.
// (The other two places the player's AC is displayed -- sidebar and round banner -- are covered by
// verify_ac_display.js.)
// Run: node scratch/verify_shield.js
"use strict";

// Transcribed verbatim from combat_dice.txt.
function resolve(total, armorClass, shieldArmed) {
  var hit = total >= armorClass;
  var shieldTriggered = false;
  if (hit && shieldArmed) {
    shieldTriggered = true;          // shield_armed is cleared here in the real label
    hit = total >= (armorClass + 5);
  }
  var verdict = hit ? "HIT" : "MISS";
  var dc = armorClass;               // the NEW banner lines
  var shieldStr = "";
  if (shieldTriggered) { dc = armorClass + 5; shieldStr = " (Shield)"; }
  return { hit: hit, triggered: shieldTriggered, dc: dc, verdict: verdict, shieldStr: shieldStr };
}

var fails = 0;
function check(label, cond, extra) {
  if (!cond) { fails++; console.log("  FAIL  " + label + (extra ? "\n          " + extra : "")); }
  else console.log("  PASS  " + label);
}

console.log("--- the reported fight: Rearguard Archer 14+5=19, AC 12, Shield armed ---");
var r = resolve(19, 12, true);
console.log("  -> " + r.verdict + " vs AC " + r.dc + r.shieldStr);
check("19 beats the bare AC 12, so the blow lands and Shield triggers",
      r.triggered === true, "triggered=" + r.triggered);
check("19 also beats the Shielded AC 17, so Shield is broken through", r.hit === true);
check("banner prints the Shielded DC 17, not the bare 12", r.dc === 17, "printed AC " + r.dc);
check("banner is marked as a Shield check", r.shieldStr === " (Shield)");
console.log("  (RAW-correct: Shield adds +5 AC, it does not simply cancel a hit. 19 >= 17, so the hit stands.)\n");

console.log("--- Shield actually working: 14 vs AC 12, Shield armed ---");
var h = resolve(14, 12, true);
console.log("  -> " + h.verdict + " vs AC " + h.dc + h.shieldStr);
check("14 beats bare AC 12, Shield triggers", h.triggered === true);
check("14 does NOT beat Shielded AC 17, so Shield negates the hit", h.hit === false);
check("verdict reads MISS", h.verdict === "MISS");
check("banner shows the Shielded DC 17", h.dc === 17);
console.log("  (This is the case that was previously invisible: old banner said 'vs AC 12 — MISS',\n" +
            "   which looked like Shield did nothing, when it had just eaten the whole attack.)\n");

console.log("--- Shield must not help a blow that already missed ---");
var m = resolve(8, 12, true);
check("8 vs AC 12 misses outright, Shield never triggers", m.triggered === false && m.hit === false);
check("banner shows the bare AC 12 (no Shield marker)", m.dc === 12 && m.shieldStr === "");

console.log("--- no Shield armed: unchanged behaviour ---");
var n = resolve(19, 12, false);
check("19 vs AC 12 hits, no Shield marker", n.hit === true && n.triggered === false && n.dc === 12);
var n2 = resolve(11, 12, false);
check("11 vs AC 12 misses, no Shield marker", n2.hit === false && n2.dc === 12);

console.log("--- exhaustive: banner DC always equals the DC actually used ---");
var exhaustiveFails = 0, cases = 0;
for (var ac = 5; ac <= 25; ac++) {
  for (var total = 1; total <= 40; total++) {
    for (var armed = 0; armed <= 1; armed++) {
      var res = resolve(total, ac, armed === 1);
      cases++;
      // The printed DC must be the higher of the two only when Shield actually triggered.
      var expectedDc = res.triggered ? ac + 5 : ac;
      if (res.dc !== expectedDc) exhaustiveFails++;
      // And the verdict must be exactly "total >= printed DC".
      var expectedHit = total >= expectedDc;
      if (res.hit !== expectedHit) exhaustiveFails++;
      // Shield can only ever turn a hit into a miss, never the reverse.
      var bare = total >= ac;
      if (res.hit && !bare) exhaustiveFails++;
    }
  }
}
check(cases + " (AC x roll x armed) combinations are self-consistent", exhaustiveFails === 0,
      exhaustiveFails + " inconsistent");

console.log(fails === 0 ? "\nAll Shield checks passed." : "\n" + fails + " FAILED.");
if (fails) process.exitCode = 1;
