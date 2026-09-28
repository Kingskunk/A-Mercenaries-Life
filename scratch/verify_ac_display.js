// Checks that the three places showing the player's AC all agree once Shield is armed:
//   1. sidebar AC row       -> effectiveAc(s) + shieldAcTag(s)   (web/mygame/index.html)
//   2. round banner        -> ac_shown                          (combat.txt fight_round_hub)
//   3. enemy attack banner -> cea_dc                            (combat_dice.txt resolve_enemy_attack)
// and that none of them writes back to armor_class -- the +5 is display/recheck-only.
// Run: node scratch/verify_ac_display.js
"use strict";

function fmt(v) { return (v === undefined || v === null) ? "" : v; }
function isTruthy(v) { return v === true || v === "true"; }

// web/mygame/index.html
function effectiveAc(s) { return fmt(Number(s.armor_class) + (isTruthy(s.shield_armed) ? 5 : 0)); }
function shieldAcTag(s) {
  if (!isTruthy(s.shield_armed)) return "";
  return " <span class=\"boon boonUp\" title=\"Shield: +5 AC until the next hit that gets through it\">+5 Shield</span>";
}
// combat.txt -- ac_shown
function acShown(s) { return isTruthy(s.shield_armed) ? Number(s.armor_class) + 5 : s.armor_class; }
// combat_dice.txt -- cea_dc (only when the Shield actually triggered on THAT roll)
function ceaDc(s, triggered) { return triggered ? Number(s.armor_class) + 5 : s.armor_class; }

var fails = 0;
function check(label, cond, extra) {
  if (!cond) { fails++; console.log("  FAIL  " + label + (extra ? "\n          " + extra : "")); }
  else console.log("  PASS  " + label);
}

console.log("--- Shield NOT armed: all three show the bare AC ---");
// effectiveAc() returns whatever fmt() passes through, so a numeric armor_class comes back as a NUMBER.
// Coerced with String() throughout rather than loosening the comparisons, so a real type change
// (e.g. someone "fixing" fmt to stringify) still shows up here.
var bare = { armor_class: "12", shield_armed: false };
check("sidebar shows 12", String(effectiveAc(bare)) === "12", "got " + effectiveAc(bare));
check("no green tag", shieldAcTag(bare) === "");
check("round banner shows 12", String(acShown(bare)) === "12");
check("attack banner shows 12", Number(ceaDc(bare, false)) === 12);

console.log("\n--- Shield armed: all three show 17 ---");
var up = { armor_class: "12", shield_armed: true };
check("sidebar shows 17", String(effectiveAc(up)) === "17", "got " + effectiveAc(up));
check("green tag appears", shieldAcTag(up).indexOf("+5 Shield") !== -1);
check("round banner shows 17", Number(acShown(up)) === 17, "got " + acShown(up));
check("attack banner (triggered) shows 17", Number(ceaDc(up, true)) === 17);

console.log("\n--- sidebar and round banner never disagree, any AC, either state ---");
var disagree = 0, cases = 0;
for (var ac = 7; ac <= 25; ac++) {
  for (var armed = 0; armed <= 1; armed++) {
    var st = { armor_class: String(ac), shield_armed: armed === 1 };
    cases++;
    if (Number(effectiveAc(st)) !== Number(acShown(st))) disagree++;
  }
}
check(cases + " (AC x armed) combinations agree", disagree === 0, disagree + " mismatches");

console.log("\n--- the +5 is display-only: armor_class is never written ---");
var stat = { armor_class: "12", shield_armed: true };
effectiveAc(stat); acShown(stat);
check("armor_class still reads 12 after both displays ran", stat.armor_class === "12",
      "now " + stat.armor_class);

console.log("\n--- realistic values ---");
[10, 12, 14, 16, 17].forEach(function (a) {
  var s = { armor_class: String(a), shield_armed: true };
  console.log("  base AC " + a + "  ->  sidebar " + effectiveAc(s) + " | round banner " + acShown(s) +
              " | attack DC " + ceaDc(s, true));
});
check("every base AC gains exactly 5", [10, 12, 14, 16, 17].every(function (a) {
  return String(effectiveAc({ armor_class: String(a), shield_armed: true })) === String(a + 5);
}));

console.log(fails === 0 ? "\nAll AC-display checks passed." : "\n" + fails + " FAILED.");
if (fails) process.exitCode = 1;
