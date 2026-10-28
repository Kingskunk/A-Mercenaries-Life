#!/usr/bin/env node
"use strict";

/*
 * test_skill_gear_context.js -- roll_skill_check's opt-in gear context (check_gear_context "leverage_repair", added for the Weight of the Road).
 *
 * The context makes carried gear follow the skill that actually WINS the best-of choice: a Repair Kit's +1 joins the Investigation candidate when the
 * skills are compared (and is applied only if Investigation wins), and an Iron Prybar gives advantage only if Athletics wins. Without the context nothing
 * changes. The test writes a one-label scene into the scenes folder, plays it through the real engine and removes it again.
 */

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { play } = require("./scripted_play.js");

const SCENE = "tmp_gear_context_test";
const FILE = path.join(__dirname, "..", "web", "mygame", "scenes", SCENE + ".txt");

let lastWatch = {};

function run(context, stats) {
  const body = [
    "*label gear_test",
    context ? '*set check_gear_context "' + context + '"' : "",
    '*gosub_scene dice_engine roll_skill_check 12 "athletics" "" "investigation" "" "" ""',
    "*finish",
    ""
  ].join("\n");
  fs.writeFileSync(FILE, body);
  try {
    const result = play({
      scene: SCENE,
      label: "gear_test",
      preset: "Vanguard Line Fighter",
      stats: Object.assign({
        skill_athletics: false, skill_investigation: false, character_class: "fighter", character_level: 1,
        prof_bonus: 2, guidance_active: false, has_iron_crowbar: false, has_tool_kit: false
      }, stats),
      steps: [],
      watch: ["check_gear_context", "check_task_type", "check_skill_id", "advantage"]
    });
    assert.deepStrictEqual(result.errors, [], result.errors.join("; "));
    lastWatch = result.watch;
    return result.text;
  } finally {
    fs.unlinkSync(FILE);
  }
}

// 1. Athletics wins with a Prybar: advantage, and the Repair Kit is not mentioned.
let t = run("leverage_repair", { str_mod: 4, int_mod: 0, has_iron_crowbar: true, has_tool_kit: true });
assert.ok(t.includes("D20 Check: Athletics"), "Athletics should win\n" + t);
assert.ok(t.includes("(Advantage)"), "an Iron Prybar should give advantage when Athletics wins\n" + t);
assert.ok(!t.includes("Repair Kit"), "the Repair Kit must not apply to an Athletics roll\n" + t);

// 2. Athletics wins without a Prybar: no advantage.
t = run("leverage_repair", { str_mod: 4, int_mod: 0, has_iron_crowbar: false, has_tool_kit: true });
assert.ok(t.includes("D20 Check: Athletics"), "Athletics should win\n" + t);
assert.ok(!t.includes("(Advantage)"), "no Prybar, no advantage\n" + t);

// 3. Investigation wins with a Repair Kit: +1, and the Prybar gives nothing.
t = run("leverage_repair", { str_mod: 0, int_mod: 4, has_iron_crowbar: true, has_tool_kit: true });
assert.ok(t.includes("D20 Check: Investigation"), "Investigation should win\n" + t);
assert.ok(t.includes("(Repair Kit +1)"), "the Repair Kit should add its +1 when Investigation wins\n" + t);
assert.ok(t.includes("Roll: 11 +5"), "Investigation 4 + Repair Kit 1 should be +5\n" + t);
assert.ok(!t.includes("(Advantage)"), "the Prybar must not help an Investigation roll\n" + t);

// 4. The Repair Kit's +1 takes part in choosing the skill: 3 against 3 would stay with Athletics, 3 against 3 + 1 goes to Investigation.
t = run("leverage_repair", { str_mod: 3, int_mod: 3, has_iron_crowbar: false, has_tool_kit: true });
assert.ok(t.includes("D20 Check: Investigation"), "the kit's +1 should tip a tie to Investigation\n" + t);
t = run("leverage_repair", { str_mod: 3, int_mod: 3, has_iron_crowbar: false, has_tool_kit: false });
assert.ok(t.includes("D20 Check: Athletics"), "without the kit the tie stays with Athletics\n" + t);

// 5. Without the context nothing changes: no Prybar advantage, no Repair Kit +1.
t = run("", { str_mod: 4, int_mod: 0, has_iron_crowbar: true, has_tool_kit: true });
assert.ok(!t.includes("(Advantage)"), "no context, no Prybar advantage\n" + t);
t = run("", { str_mod: 0, int_mod: 4, has_iron_crowbar: true, has_tool_kit: true });
assert.ok(!t.includes("Repair Kit"), "no context, no Repair Kit +1\n" + t);

// 6. The context and the task type are cleared after the roll, and the winning skill's id is reported.
t = run("leverage_repair", { str_mod: 0, int_mod: 4, has_tool_kit: true });
assert.strictEqual(lastWatch.check_gear_context, "", "the gear context should be cleared after the roll");
assert.strictEqual(lastWatch.check_task_type, "none", "the task type should be cleared after the roll");
assert.strictEqual(lastWatch.check_skill_id, "investigation", "the winning skill id should be reported");
assert.strictEqual(lastWatch.advantage, false, "advantage should be cleared after the roll");

console.log("Skill gear context: Prybar follows Athletics, Repair Kit follows Investigation, default rolls unchanged");
