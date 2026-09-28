// Ground-truth probe for the ChoiceScript condition grammar. Feeds candidate *if conditions
// straight through the real parser in web/scene.js and reports which ones it accepts, so the
// rule encoded in tools/lint_conditions.js is derived from observed behaviour, not guessed.
// Run: node scratch/probe_condition_grammar.js
"use strict";

var fs = require("fs");
var vm = require("vm");
function load(f) { vm.runInThisContext(fs.readFileSync(f), f); }
load("web/scene.js");
load("web/navigator.js");
load("web/util.js");
load("headless.js");
// util.js:24 branches on `typeof window` -- if it exists it reaches for navigator/location/document.
// Leave it undefined during the loads (same as randomtest.js does, so util.js takes its safe
// else-branch) and only hand scene.js a window afterwards.
if (typeof globalThis.window === "undefined") {
  // No navigator stub: Node 24 ships a read-only global `navigator`, and util.js (which would
  // want one) has already run by this point.
  globalThis.window = { location: { href: "file:///probe", protocol: "file:" } };
}
if (typeof globalThis.startLoading === "undefined") globalThis.startLoading = function () {};
if (typeof globalThis.doneLoading === "undefined") globalThis.doneLoading = function () {};
// Reached only AFTER the condition has parsed and evaluated (it's the print path for text lines),
// so its absence is a clean signal that a case got past the parser -- which is what we're measuring.
if (typeof globalThis.printFollowButtons === "undefined") globalThis.printFollowButtons = function () {};

function parses(cond) {
  // t1..t4 are booleans so each operand of and/or is a real boolean -- numeric or string operands
  // fail with "Neither true nor false" before the parser reaches the SHAPE we're probing.
  var sc = new Scene("probe", {
    t1: true, t2: true, t3: true, t4: true, x: 5,
    combat_enemy_disadvantage: false, cea_ranged_pinned: false, combat_enemy_advantage: false
  }, undefined, {});
  sc.lines = ["*if " + cond, "yes", "no"];
  sc.lineNum = 0;
  try {
    // printLoop is the interpreter's main loop; Scene.prototype.execute is the browser-facing
    // wrapper that fetches the scene over XHR first, which is why it wants a network here.
    sc.printLoop();
    return { ok: true };
  } catch (e) {
    return { ok: false, err: String(e.message).split("\n")[0] };
  }
}

var cases = [
  ["((t1) and (t2))",                        "2-term and"],
  ["((t1) or (t2))",                         "2-term or"],
  ["((t1) and (t2) and (t3))",               "FLAT 3-term and"],
  ["((t1) or (t2) or (t3))",                 "FLAT 3-term or"],
  ["(((t1) and (t2)) and (t3))",             "nested 3-term and (left)"],
  ["(((t1) or (t2)) and (t3))",              "or-group then and"],
  ["((t1) and ((t2) or (t3)))",              "and with an or-subgroup"],
  ["((t1) or ((t2) and (t3)))",              "or with an and-subgroup"],
  ["(((t1) or (t2)) or (t3))",               "or-group then or"],
  ["(((t1) and (t2)) or (t3))",              "and-group then or"],
  ["((((t1) or (t2)) and (t3)) or (t4))",   "deeper nesting, or-group then and"],
  ["(((t1) and (t2)) and (t3)) and (t4)",   "flat 4-term and"],
  ["((t1) and (t2) and (t3) and (t4))",      "flat 4-term, all in one group"],
  ["((((t1) and (t2)) and (t3)) and (t4))", "fully nested 4-term and"],
  ["(((t1) or (t2)) and (not(t3)))",        "or-group then and, with not()"],
  ["((t1) and (t2)) and (not(t3))",          "flat and, with not()"],
  ["(((t1 = true) and (t2 = true)) and ((t3 = false) or (t4 = false)))", "real-world mixed shape"],
  ["(((t1) and (t2)) and ((t3) or (t4)))",   "the shape combat.txt's combat_can_disengage uses"],
  // The EXACT string that failed at runtime, reproduced verbatim (with tN standing in for the real
  // stat names) to confirm what actually killed it.
  ["(((combat_enemy_disadvantage) or (cea_ranged_pinned)) and (not(combat_enemy_advantage)))",
   "the ORIGINAL combat_dice.txt:256 line, verbatim"]
];

console.log("ChoiceScript condition grammar, probed against the real parser:\n");
var bad = 0;
cases.forEach(function (entry) {
  var r = parses(entry[0]);
  if (!r.ok) bad++;
  console.log((r.ok ? "  PARSES   " : "  REJECTS  ") + entry[1]);
  if (!r.ok) console.log("             " + r.err.substring(0, 115));
});
console.log("\n" + (cases.length - bad) + "/" + cases.length + " accepted.");
