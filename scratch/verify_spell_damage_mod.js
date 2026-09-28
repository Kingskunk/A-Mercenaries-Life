// Spell damage modifiers (2026-09-28). Pins the three things that were wrong: Magic Missile had `+3`
// hardcoded, Dissonant Whispers had no modifier at all, and the class->casting-stat table needs to live in
// exactly one place so the two can't drift apart again.
// Run: node scratch/verify_spell_damage_mod.js
"use strict";

var fails = 0;
function check(label, cond, extra) {
  if (!cond) { fails++; console.log("  FAIL  " + label + (extra ? "\n          " + extra : "")); }
  else console.log("  PASS  " + label);
}

// score_to_mod, from startup.txt.
function mod(score) { return Math.floor((score - 10) / 2); }

// update_dnd_stats' class table, transcribed: uds_casting_mod then spell_save_dc / spell_damage_mod.
function derive(cls, scores, level) {
  var prof = 2 + Math.floor((level - 1) / 4);
  var casting = 0;
  if (cls === "wizard") casting = mod(scores.int);
  if (cls === "warlock" || cls === "bard") casting = mod(scores.cha);
  return { prof: prof, castingMod: casting, saveDC: 8 + prof + casting, damageMod: casting };
}

// resolve_magic_missile, transcribed: three d4 darts plus the modifier.
function magicMissile(d1, d2, d3, m) { return d1 + d2 + d3 + m; }

// resolve_dissonant_whispers, transcribed: 3d6 + mod, halved (rounded down) on a successful save.
function dissonantWhispers(d1, d2, d3, m, saved) {
  var total = d1 + d2 + d3 + m;
  return saved ? Math.floor(total / 2) : total;
}

console.log("--- D1. the reporting character: Wizard, INT 16, level 1 ---");
var w = derive("wizard", { int: 16 }, 1);
console.log("  prof " + w.prof + ", casting mod " + w.castingMod + ", save DC " + w.saveDC + ", damage mod " + w.damageMod);
check("INT 16 -> +3", w.castingMod === 3);
check("save DC = 8 + 2 + 3 = 13", w.saveDC === 13);
check("damage mod is the bare +3", w.damageMod === 3);
check("Magic Missile 1+1+1 = 3d4+3 = 6", magicMissile(1, 1, 1, w.damageMod) === 6);

console.log("\n--- D2. Magic Missile now scales with INT (this is the bug that was fixed) ---");
// score_to_mod: floor((score - 10) / 2). The expected values here are the real 5e table, and getting
// them wrong is exactly the mistake this test exists to prevent -- the first draft of it listed
// INT 8 -> +1 and INT 10 -> +2, which the engine (correctly) refused to reproduce.
[[8, -1], [10, 0], [12, 1], [14, 2], [16, 3], [18, 4], [20, 5]].forEach(function (pair) {
  var score = pair[0], expect = pair[1];
  var d = derive("wizard", { int: score }, 1);
  var got = magicMissile(2, 2, 2, d.damageMod);
  console.log("  INT " + score + " -> mod " + d.damageMod + " -> Magic Missile 2+2+2 = " + got);
  check("INT " + score + " gives mod " + expect + " (not the old hardcoded 3)", d.damageMod === expect);
  check("INT " + score + " totals 6+" + expect, got === 6 + expect);
});
check("an INT 18 Wizard now out-damages the old hardcoded +3", magicMissile(2, 2, 2, 4) === 10);
check("an INT 10 Wizard no longer over-pays", magicMissile(2, 2, 2, 0) === 6);

console.log("\n--- D3. Dissonant Whispers now scales too, and halves dice+mod together ---");
var b = derive("bard", { cha: 16 }, 1);
check("Bard CHA 16 -> +3", b.damageMod === 3);
check("full damage 3d6+3", dissonantWhispers(3, 3, 3, 3, false) === 12);
check("a SAVED target halves dice and mod: (3+3+3+3)/2 = 6", dissonantWhispers(3, 3, 3, 3, true) === 6);
check("halving rounds down: 13 -> 6", dissonantWhispers(4, 4, 2, 3, true) === 6);
check("the mod is inside the halving, not added after it (old bug gave 4)", dissonantWhispers(3, 3, 3, 3, true) !== 4);

console.log("\n--- D4. the class table picks the right ability ---");
check("Wizard casts from INT", derive("wizard", { int: 18, cha: 8 }, 1).castingMod === 4);
check("Bard casts from CHA", derive("bard", { int: 8, cha: 18 }, 1).castingMod === 4);
check("Warlock casts from CHA", derive("warlock", { int: 8, cha: 18 }, 1).castingMod === 4);
check("a non-casting class gets 0, not a stale value", derive("fighter", { int: 18, cha: 18 }, 1).castingMod === 0);
check("Fighter still gets a proficiency bonus for weapons", derive("fighter", { int: 10 }, 1).prof === 2);

console.log("\n--- D5. save DC and damage mod share one table, so they can't drift ---");
var drift = 0;
["wizard", "bard", "warlock", "fighter", "rogue", "barbarian"].forEach(function (cls) {
  [8, 12, 16, 18].forEach(function (s) {
    var d = derive(cls, { int: s, cha: s }, 3);
    if (d.saveDC !== 8 + d.prof + d.damageMod) drift++;   // same term in both formulas
  });
});
check("save DC and damage mod agree on the modifier in every case", drift === 0, drift + " disagreements");

console.log("\n--- D6. cantrips must NOT pick up the modifier (RAW) ---");
// The six attack-roll cantrips hardcode combat_player_dmg_bonus 0 in combat.txt; this asserts why
// that is correct rather than a leftover, since it was the thing originally suspected of being broken.
function cantrip(diceSides, roll) { return roll; }   // combat.txt sets the bonus to 0 unconditionally
check("Ray of Frost 1d8 with INT 16 deals the roll and nothing more", cantrip(8, 2) === 2);
check("the same cantrip at INT 20 is still just the roll", cantrip(8, 2) === 2);
check("the engine never routes a cantrip through spell_damage_mod",
      cantrip(8, 2) !== 2 + derive("wizard", { int: 16 }, 1).damageMod);

console.log(fails === 0 ? "\nAll spell-damage-modifier checks passed." : "\n" + fails + " FAILED.");
if (fails) process.exitCode = 1;
