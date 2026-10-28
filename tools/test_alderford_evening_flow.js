#!/usr/bin/env node
"use strict";

const assert = require("assert");
const { play } = require("./scripted_play.js");

function run(label, stats, steps = []) {
  const result = play({
    scene: "prologue/alderford",
    label,
    preset: "Vanguard Line Fighter",
    weather: "Rain",
    time: "Dusk",
    day: "Ironday",
    stats: Object.assign({ name: "Corin" }, stats),
    steps
  });
  assert.deepStrictEqual(result.errors, [], result.errors.join("; "));
  return result;
}

const hub = run("alder_hub", { alder_actions_left: 5 });
assert.ok(!hub.stopped.some(option => option.includes("turn in for the night")), "early camp rest remains on the Alderford hub");

const freeTaliaVisit = run("alder_hub", {
  alder_actions_left: 4,
  talia_invitation_open: true,
  visited_talia_loft: false
}, [{ pick: "Talia's Loft" }]);
assert.strictEqual(freeTaliaVisit.s.alder_actions_left, 4, "Talia's follow-up visit spent an activity");
assert.strictEqual(freeTaliaVisit.s.visited_talia_loft, true, "Talia's follow-up visit was not recorded");

const taliaEarly = run("talia_decision_choice", { alder_actions_left: 2 });
assert.ok(!taliaEarly.stopped.some(option => option.includes("stay by the warm hearth tonight")), "Talia can still end the evening early");

const jannaEarly = run("janna_decision_choice", {
  alder_actions_left: 2,
  janna_invitation_open: true
});
assert.ok(!jannaEarly.stopped.some(option => option.includes("spend the night here")), "Janna can still end the evening early");

const bedtimeTalia = run("alder_end", {
  alder_actions_left: 0,
  talia_invitation_open: true,
  visited_talia_loft: false
}, [
  { pick: "Talia's warm loft" },
  { pick: "Corin" },
  { pick: "He taught you" },
  { pick: "Why stay and fight" },
  { pick: "You stood down" }
]);
assert.strictEqual(bedtimeTalia.s.discussed_talia_craft, true, "bedtime route skipped Talia's craft history");
assert.strictEqual(bedtimeTalia.s.discussed_talia_exemption, true, "bedtime route skipped Talia's free-wharf history");
assert.strictEqual(bedtimeTalia.s.discussed_talia_nerve, true, "bedtime route skipped Talia's personal history");
assert.ok(bedtimeTalia.stopped.some(option => option.includes("stay by the warm hearth tonight")), "Talia's overnight choice is missing after rounds end");

console.log("Alderford evening flow: free follow-up, no early sleep, and Talia bedtime backstory passed");
