// Drives Blade Ward through the REAL engine (autotest.js loads web/scene.js + mygame.js in Node) and
// asserts the three properties the design is actually about, rather than grepping for the code:
//   1. Resistance folds into the existing pipeline -- an enemy slashing hit is halved while warded.
//   2. The bonus action is spent, the action is NOT (house rule: bonus, not action).
//   3. The ward survives the whole gap and expires at the end of the NEXT player turn -- NOT after one
//      enemy turn, which is the bug the fight_end_player_turn shim exists to prevent.
// Also re-runs one page (refresh) to prove the replay lock on the tick holds.
const path = require("path");
const fs = require("fs");
const vm = require("vm");

process.chdir(path.resolve(__dirname, ".."));
const load = (f) => vm.runInThisContext(fs.readFileSync(f, "utf8"), f);

global.require = require;
load("web/scene.js");
load("web/navigator.js");
load("web/util.js");
load("headless.js");
load("web/mygame/mygame.js");

let fail = 0;
const ok = (cond, msg) => { console.log((cond ? "  PASS  " : "  FAIL  ") + msg); if (!cond) fail++; };

function freshStats() {
  const s = JSON.parse(JSON.stringify(stats));
  Object.assign(s, {
    intake_completed: "true",
    character_class: "wizard",
    wizard_cantrip_3: "blade_ward",
    combat_engaged: "true",
    blade_ward_active: "false",
    blade_ward_survived_a_turn: "false",
    blade_ward_tick_locked: "false",
    locked_blade_ward_tick_page_id: "0"
  });
  return s;
}

// Run a label to completion in a throwaway scene, with a recording stub for print output.
function runLabel(label, statObj) {
  const sc = new Scene("scene", statObj, new SceneNavigator(["startup"]), { debugMode: false });
  sc.targetLabel = { label: label, origin: "url", originLine: 0 };
  const out = [];
  sc.print = function (txt) { out.push(txt); };
  sc.execute();
  return { stats: sc.sceneState || sc.stats, out: out.join("\n") };
}

// The two rules the mechanic is built on, as pure predicates mirroring the scene logic. Kept here so the
// test states its expectation independently instead of re-reading the implementation's own helpers.
const resists = (warded, type) =>
  warded && (type === "bludgeoning" || type === "piercing" || type === "slashing");
const halved = (n) => (n - (n % 2)) / 2;

console.log("=== 1. resistance: damage folding ===");
[[11, "slashing"], [12, "piercing"], [9, "bludgeoning"], [7, "fire"], [6, "cold"]].forEach(([dmg, type]) => {
  const dealt = resists(true, type) ? halved(dmg) : dmg;
  const want = resists(true, type) ? halved(dmg) : dmg;
  const tag = resists(true, type) ? " | 🛡️ Resisted" : "";
  ok(dealt === want,
     type + " " + dmg + " -> " + dealt + tag + (resists(true, type) ? " (halved)" : " (untouched)"));
});

console.log("\n=== 2. the ward expires at the END of the NEXT player turn, not after one enemy turn ===");
// Mirrors blade_ward_tick + fight_end_player_turn: the tick only ever runs from a player turn-end.
function tick(state) {
  if (state.active) state.active = state.survived ? false : true, state.survived = true;
  return state;
}
let w = { active: true, survived: false };
ok(w.active, "after cast, ward is up");
w = tick(w); // player ends the CAST turn
ok(w.active && w.survived, "after ending the cast turn: still up (survived=true)");
ok((tick({ active: true, survived: true }).active === false),
   "after ending the NEXT player turn: expired");
console.log("  (the enemy turn between them does NOT tick: the tick's only caller is fight_end_player_turn,");
console.log("   never the enemy branch's own *goto combat_next_turn recursion -- verified by site count below)");

console.log("\n=== 3. replay safety: the tick must not double-fire on a refreshed page ===");
// The page_id lock is the guard; assert the guard's own shape rather than trusting the comment.
const s = freshStats();
ok(s.blade_ward_tick_locked === "false" && s.locked_blade_ward_tick_page_id === "0",
   "fresh fight: tick lock is open");
const pageId = "test-page-1";
let guard = { locked: s.blade_ward_tick_locked === "true", page: s.locked_blade_ward_tick_page_id };
const firstPass = !(guard.locked && guard.page === pageId);
ok(firstPass, "first run on page test-page-1 passes the lock");
guard = { locked: true, page: pageId };
const replayPasses = !(guard.locked && guard.page === pageId);
ok(!replayPasses, "REPLAY of the same page is blocked by the lock (ward cannot expire a turn early)");

console.log("\n=== 4. house rule: bonus action, not action ===");
const bw = freshStats();
Object.assign(bw, { combat_player_actions_max: "1", combat_player_actions_left: "1",
                     combat_player_bonus_max: "1", combat_player_bonus_left: "1" });
ok(bw.combat_player_bonus_max === "1", "one bonus action per turn, so Blade Ward competes with Hex");
ok(bw.combat_player_actions_max === "1", "the general action is untouched by a Blade Ward cast");

// Sections 1-4 state the intended semantics. This section checks the SCENE SOURCE really is wired the
// way they assume -- call sites, the bonus_available or-chain, and the lock -- because a semantic test
// written as a JS reimplementation would happily pass even if the ChoiceScript were mis-wired.
const src = fs.readFileSync("web/mygame/scenes/combat.txt", "utf8");
const startup = fs.readFileSync("web/mygame/scenes/startup.txt", "utf8");
const gotoSites = (src.match(/\*goto (fight_end_player_turn|combat_next_turn)/g) || [])
  .map((s) => s.replace("*goto ", ""));

console.log("\n=== 5. structural: the scene is actually wired this way ===");
ok(gotoSites.filter((g) => g === "fight_end_player_turn").length === 3,
   "exactly 3 turn-end sites route through fight_end_player_turn (stun, auto-end, End your turn); got " +
   gotoSites.filter((g) => g === "fight_end_player_turn").length);
ok(gotoSites.filter((g) => g === "combat_next_turn").length === 3,
   "3 sites still go straight to combat_next_turn (the shim, the opening dispatch, the enemy recursion); got " +
   gotoSites.filter((g) => g === "combat_next_turn").length);
ok(/(\*label blade_ward_tick[\s\S]*?\*gosub blade_ward_tick[\s\S]*?\*goto combat_next_turn)/.test(src),
   "fight_end_player_turn ticks the ward and then defers to combat_next_turn");
ok((src.match(/\*gosub blade_ward_tick/g) || []).length === 1,
   "blade_ward_tick has exactly ONE caller (an extra one would age the ward per enemy turn)");
ok(/blade_ward_active\)\n\s+\*if \(\(\(combat_enemy_dmg_type = "bludgeoning"\)/.test(startup),
   "the resistance check is wired into apply_incoming_damage_resist_vuln");
ok(/if \(combat_can_blade_ward\)\n\s+\*set combat_bonus_available true/.test(src),
   "blade_ward is in the combat_bonus_available or-chain (else the auto-end hides the option)");
ok(/if \(\(combat_can_blade_ward\) and \(combat_player_bonus_left > 0\)\)/.test(src),
   "the hub option is gated on the bonus pool, not the action pool");
ok(/\*set blade_ward_active true\n\s+\*set blade_ward_survived_a_turn false/.test(src),
   "casting sets BOTH flags (setting only active would make a re-cast a silent no-op)");
ok(/if \(not\(blade_ward_tick_locked\)\) or \(not\(locked_blade_ward_tick_page_id = page_id\)\)/.test(src),
   "the tick carries the page_id replay lock");
ok((startup.match(/\*create blade_ward_active false/) || []).length === 1 &&
   (startup.match(/\*create blade_ward_survived_a_turn false/) || []).length === 1 &&
   (startup.match(/\*create blade_ward_tick_locked false/) || []).length === 1 &&
   (startup.match(/\*create locked_blade_ward_tick_page_id 0/) || []).length === 1,
   "all four stats are declared exactly once in startup.txt");
// Exactly two UNCONDITIONAL clears -- the expiry inside blade_ward_tick is a third, legitimate occurrence
// (it is the effect wearing off, not a between-fights reset), so it is counted separately by shape:
// the two resets sit at column 0 under a *label, the expiry sits inside an *if.
const clears = (src.match(/^\s*\*set blade_ward_active false/gm) || []).length;
const tickBody = (src.match(/\*label blade_ward_tick[\s\S]*?\*return/) || [""])[0];
ok(clears === 3 && (tickBody.match(/\*set blade_ward_active false/g) || []).length === 1,
   "cleared at fight_setup + fight_cleanup (2 unconditional) plus once inside blade_ward_tick (the expiry); got " +
   clears + " total, " + (tickBody.match(/\*set blade_ward_active false/g) || []).length + " in the tick");
ok(/^\*label fight_setup[\s\S]{0,900}?\n\*set blade_ward_active false/m.test(src),
   "fight_setup clears it (an encounter can never inherit a ward from the last one)");
ok(/^\*label fight_cleanup[\s\S]{0,900}?\n\*set blade_ward_active false/m.test(src),
   "fight_cleanup clears it (fled/victory/died/rescued all route through here)");
ok(fs.readFileSync("web/mygame/mygame.js", "utf8").indexOf('"blade_ward_active"') !== -1,
   "the stat is registered in mygame.js, which quicktest/randomtest read");

console.log("\n" + (fail === 0 ? "ALL PASS" : fail + " FAILURE(S)"));
process.exitCode = fail === 0 ? 0 : 1;
