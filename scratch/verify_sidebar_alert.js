// Exercises the derived "Acting next" / "In your reach" rows added to renderStatSidebar
// (web/mygame/index.html, 2026-09-28) against the turn-order shapes it has to survive.
// Run: node scratch/verify_sidebar_alert.js
"use strict";

// rangeTierName, verbatim from index.html
function rangeTierName(n) {
  if (n <= 0) return "Engaged";
  if (n === 1) return "Close";
  if (n === 2) return "Mid-Range";
  return "Long Range";
}
function fmt(v) { return (v === undefined || v === null) ? "" : v; }
// esc, verbatim from index.html
function esc(v) {
  return String(v)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
// allyTierName, verbatim from index.html
function allyTierName(n) { return (Number(n) || 0) <= 0 ? "in melee" : rangeTierName(n); }
// allyTargetLine, verbatim from index.html
function allyTargetLine(s, slot) {
  var t = Number(s["combat_ally" + slot + "_target"]) || 0;
  if (t <= 0) return "";
  var name = fmt(s["combat_enemy" + t + "_name"]) || "an enemy";
  var down = (Number(s["combat_enemy" + t + "_hp"]) || 0) <= 0;
  return "fighting " + esc(name) + (down ? " (down)" : "");
}

// The derivation loop, transcribed from the sidebar.
function derive(s, count) {
  var engaged = [], nextAfter = null, firstAny = null, sawPlayer = false;
  for (var ai = 1; ai <= count; ai++) {
    var akind = s["combat_turn_kind_" + ai], aslot = Number(s["combat_turn_slot_" + ai]) || 0;
    if (akind === "player") { sawPlayer = true; continue; }
    if (akind !== "enemy" && akind !== "ally") continue;
    var apfx = akind === "enemy" ? "combat_enemy" : "combat_ally";
    var arange = Number(s[apfx + aslot + "_range"]) || 0;
    var alive = akind === "ally" || (Number(s[apfx + aslot + "_hp"]) || 0) > 0;
    if (!alive) continue;
    if (akind === "enemy" && arange <= 0) engaged.push(fmt(s["combat_enemy" + aslot + "_name"]) || "Enemy");
    var who = { name: fmt(s[apfx + aslot + "_name"]) || (akind === "enemy" ? "Enemy" : "Ally"),
                enemy: akind === "enemy", tier: rangeTierName(arange) };
    if (!firstAny) firstAny = who;
    if (sawPlayer && !nextAfter) nextAfter = who;
  }
  return { upcoming: nextAfter || firstAny, engaged: engaged };
}

// Build a stats stub. order is a list of [kind, slot].
function build(order, enemies, allies) {
  var s = { combat_turn_count: String(order.length) };
  order.forEach(function (o, i) {
    s["combat_turn_kind_" + (i + 1)] = o[0];
    s["combat_turn_slot_" + (i + 1)] = String(o[1]);
  });
  Object.keys(enemies).forEach(function (k) {
    var e = enemies[k];
    s["combat_enemy" + k + "_name"] = e.name;
    s["combat_enemy" + k + "_hp"] = String(e.hp);
    s["combat_enemy" + k + "_range"] = String(e.range);
  });
  Object.keys(allies || {}).forEach(function (k) {
    var a = allies[k];
    s["combat_ally" + k + "_name"] = a.name;
    s["combat_ally" + k + "_hp"] = String(a.hp === undefined ? 5 : a.hp);
    s["combat_ally" + k + "_range"] = String(a.range);
    s["combat_ally" + k + "_target"] = String(a.target === undefined ? 0 : a.target);
  });
  return s;
}

var cases = [
  { n: "player first -> first enemy acts next",
    s: build([["player", 0], ["enemy", 1], ["enemy", 2]], { 1: { name: "Swordsman", hp: 10, range: 0 },
                                                          2: { name: "Archer", hp: 10, range: 3 } }),
    wantNext: "Swordsman", wantReach: ["Swordsman"] },
  { n: "player middle -> the FOLLOWING enemy, not the first",
    s: build([["enemy", 1], ["player", 0], ["enemy", 2]], { 1: { name: "Swordsman", hp: 10, range: 0 },
                                                          2: { name: "Archer", hp: 10, range: 3 } }),
    wantNext: "Archer", wantReach: ["Swordsman"] },
  { n: "player last -> falls back to the round's first",
    s: build([["enemy", 1], ["enemy", 2], ["player", 0]], { 1: { name: "Swordsman", hp: 10, range: 2 },
                                                          2: { name: "Archer", hp: 10, range: 3 } }),
    wantNext: "Swordsman", wantReach: [] },
  { n: "downed enemy is skipped for 'acting next'",
    s: build([["player", 0], ["enemy", 1], ["enemy", 2]], { 1: { name: "Swordsman", hp: 0, range: 0 },
                                                          2: { name: "Archer", hp: 10, range: 3 } }),
    wantNext: "Archer", wantReach: [] },
  { n: "all enemies down -> no 'acting next' row, empty reach",
    s: build([["player", 0], ["enemy", 1]], { 1: { name: "Swordsman", hp: 0, range: 0 } }),
    wantNext: null, wantReach: [] },
  { n: "ally after the player is reported with its own range",
    s: build([["player", 0], ["ally", 1], ["enemy", 1]], { 1: { name: "Swordsman", hp: 10, range: 0 } },
              { 1: { name: "Rook", range: 2 } }),
    wantNext: "Rook", wantReach: ["Swordsman"] },
  { n: "an ally is never counted as 'in your reach'",
    s: build([["player", 0], ["ally", 1]], {}, { 1: { name: "Rook", range: 0 } }),
    wantNext: "Rook", wantReach: [] },
  { n: "every living enemy at range 0 is listed",
    s: build([["player", 0], ["enemy", 1], ["enemy", 2], ["enemy", 3]],
              { 1: { name: "A", hp: 3, range: 0 }, 2: { name: "B", hp: 4, range: 0 },
                3: { name: "C", hp: 5, range: 0 } }),
    wantNext: "A", wantReach: ["A", "B", "C"] },
  { n: "unused turn-order slots (kind \"\") are ignored",
    s: build([["player", 0], ["", 0], ["enemy", 1]], { 1: { name: "Swordsman", hp: 10, range: 0 } }),
    wantNext: "Swordsman", wantReach: ["Swordsman"] }
];

var failed = 0;
cases.forEach(function (c) {
  var r = derive(c.s, Number(c.s.combat_turn_count));
  var gotNext = r.upcoming ? r.upcoming.name : null;
  var okNext = gotNext === c.wantNext;
  var okReach = JSON.stringify(r.engaged) === JSON.stringify(c.wantReach);
  var pass = okNext && okReach;
  if (!pass) failed++;
  console.log((pass ? "  PASS  " : "  FAIL  ") + c.n);
  if (!okNext) console.log("          acting next: got " + gotNext + ", want " + c.wantNext);
  if (!okReach) console.log("          in reach:   got [" + r.engaged + "], want [" + c.wantReach + "]");
});

// --- ally tier wording + the "fighting <enemy>" sub-line --------------------------------------------
var allyCases = [
  { n: "allyTierName tier 0 drops the misleading 'Engaged'",
    got: allyTierName(0), want: "in melee" },
  { n: "allyTierName tier 1 keeps the shared vocabulary",
    got: allyTierName(1), want: "Close" },
  { n: "allyTierName tier 2 keeps the shared vocabulary",
    got: allyTierName(2), want: "Mid-Range" },
  { n: "allyTierName tier 3 keeps the shared vocabulary",
    got: allyTierName(3), want: "Long Range" },
  { n: "allyTierName copes with a stats STRING, not just a number",
    got: allyTierName("0"), want: "in melee" },
  { n: "allyTierName copes with a missing value",
    got: allyTierName(undefined), want: "in melee" },
  { n: "allyTierName still uses plain 'Engaged' vocabulary for ENEMY rows (unchanged)",
    got: rangeTierName(0), want: "Engaged" },
  { n: "no sub-line for an ally that has not picked a target yet",
    got: allyTargetLine(build([["player", 0]], { 1: { name: "Swordsman", hp: 5, range: 0 } },
                                     { 1: { name: "Rook", range: 2, target: 0 } }), 1), want: "" },
  { n: "sub-line names the enemy the ally actually picked",
    got: allyTargetLine(build([["player", 0]], { 2: { name: "Rearguard Archer", hp: 9, range: 3 } },
                                     { 1: { name: "Kess", range: 0, target: 2 } }), 1),
    want: "fighting Rearguard Archer" },
  { n: "sub-line marks an ally whose target is already down",
    got: allyTargetLine(build([["player", 0]], { 2: { name: "Rearguard Archer", hp: 0, range: 3 } },
                                     { 1: { name: "Kess", range: 0, target: 2 } }), 1),
    want: "fighting Rearguard Archer (down)" },
  { n: "sub-line falls back when the target enemy has no name",
    got: allyTargetLine(build([["player", 0]], { 1: { name: "", hp: 5, range: 0 } },
                                     { 1: { name: "Kess", range: 0, target: 1 } }), 1),
    want: "fighting an enemy" },
  { n: "sub-line escapes a hostile enemy name",
    got: allyTargetLine(build([["player", 0]], { 1: { name: "A <b>&\"O'Brien\"", hp: 5, range: 0 } },
                                     { 1: { name: "Kess", range: 0, target: 1 } }), 1),
    want: "fighting A &lt;b&gt;&amp;&quot;O&#39;Brien&quot;" }
];

var allyFailed = 0;
allyCases.forEach(function (c) {
  var pass = c.got === c.want;
  if (!pass) allyFailed++;
  console.log((pass ? "  PASS  " : "  FAIL  ") + c.n);
  if (!pass) console.log("          got  " + c.got + "\n          want " + c.want);
});

var totalFailed = failed + allyFailed;
console.log(totalFailed === 0
  ? "\nAll " + cases.length + " awareness-row + " + allyCases.length + " ally-wording cases passed."
  : "\n" + totalFailed + " of " + (cases.length + allyCases.length) + " failed.");
if (totalFailed) process.exitCode = 1;
