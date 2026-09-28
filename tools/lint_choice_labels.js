// Enforces the combat choice-label convention (2026-09-28):
//   1. NO choice button may exceed 15 words of rendered text, so a button never wraps to a second line.
//   2. A choice that spends an ACTION or a BONUS must say so FIRST, in bold: [b][Action] ...[/b] or
//      [b][Bonus Action] ...[/b].
//   3. A choice that spends nothing must NOT carry a cost label.
//   4. The ability/spell/move name follows the cost label, also bold.
//
// Word count is measured on the RENDERED text: @{...} stat-hint annotations and [b]/[/i] markup are
// stripped first, because neither is visible to the player. The cost label is counted as words, since
// the player reads it.
//
// The "spends an action" half is not hardcoded per button -- it is inferred from the option BODY, so a
// new option that starts routing through fight_action_spent gets checked without touching this file.
//
// Run: node tools/lint_choice_labels.js [sceneFile ...]
"use strict";

var fs = require("fs");

var targets = process.argv.slice(2);
if (!targets.length) targets = ["web/mygame/scenes/combat.txt"];

// Markup and annotations that are invisible to the player.
function rendered(text) {
  return text
    .replace(/@\{[^}]*\}/g, " ")        // stat-hint / inline-conditional annotation
    .replace(/\[\/?[bi]\]/g, "")       // bold / italic tags
    .replace(/\*\*/g, "")              // stray markdown
    .replace(/[•·]/g, " ");            // bullet glyphs, not words
}
function wordCount(text) {
  // Count only tokens containing at least one alphanumeric character. A bare em-dash or bullet takes
  // horizontal space but is not a word, and counting it would make the 15-word budget feel arbitrary.
  var t = rendered(text).trim();
  if (!t) return 0;
  return t.split(/\s+/).filter(function (w) { return /[0-9a-z]/i.test(w); }).length;
}

// What an option BODY must contain for each cost, and the label it must then carry.
// The `fight_use_do` entry is an indirection target rather than a spend call: the three consumable options
// *goto it, and IT does the `*goto fight_action_spent`. Naming it here keeps the item buttons honest
// without teaching the linter to follow gotos.
// Format is [b]ACTION[/b] or [b]BONUS ACTION[/b] -- the designer's exact shape, cost bold with NO inner
// brackets, matching how the prose writes [b]Current Armor Class:[/b].
// What an option BODY must contain for each cost, and the label it must then carry.
// The indirection entries are goto TARGETS, not spend calls: the attack options reach the action spend
// through `*goto resolve_weapon_attack_choice` or `*goto fight_check_enemy_hp` (which routes on to
// fight_attack_spent), and the three consumable options through `*goto fight_use_do`, with the real
// `*goto fight_action_spent` several frames further down. Naming the targets here keeps those buttons
// honest without teaching the linter to follow gotos.
var SPEND = [
  { re: /fight_action_spent|combat_spend_action|fight_use_do|fight_attack_spent|resolve_weapon_attack_choice|fight_check_enemy_hp/,
    label: "[ACTION]", name: "action" },
  { re: /fight_bonus_spent|combat_spend_bonus/, label: "[BONUS ACTION]", name: "bonus" }
];

// Buttons that legitimately carry no cost label. Shield arms itself and *goto fight_round_hub without
// spending the action (its cost is the spell slot, paid on trigger, not on arming), "Use an item" only opens
// a submenu whose own options are labelled, and these three are free or end the turn.
var NO_COST_OK = ["Shield", "Use an item", "Push forward", "Fall back", "Break off and run", "End your turn",
                  "Put the satchel away"];

var problems = [];
var checked = 0;

targets.forEach(function (file) {
  if (!fs.existsSync(file)) { console.log("  (missing: " + file + ")"); return; }
  var lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
  for (var i = 0; i < lines.length; i++) {
    var m = lines[i].match(/^(\s*)#\s(.*)$/);
    if (!m) continue;
    var indent = m[1].length;
    var button = m[2];
    // Collect the option body: following lines indented deeper than the button.
    var body = [];
    for (var j = i + 1; j < lines.length; j++) {
      var l = lines[j];
      if (l.trim() === "") continue;
      var ind = l.match(/^\s*/)[0].length;
      if (ind <= indent) break;
      body.push(l);
    }
    body = body.join("\n");
    checked++;

    var where = file + ":" + (i + 1);
    var words = wordCount(button);

    // 1. length
    if (words > 15) {
      problems.push(where + "  " + words + " words (limit 15)\n      " + rendered(button).trim());
    }

    // 2/3. cost label present iff the body spends that cost.
    var startsBold = /^\s*\[b\]/.test(button);
    SPEND.forEach(function (s) {
      var spends = s.re.test(body);
      var hasLabel = button.indexOf("[b]" + s.label + "[/b]") !== -1;
      if (spends && !hasLabel) {
        problems.push(where + "  spends the " + s.name + " but has no " + s.label + " label\n      "
          + rendered(button).trim());
      }
      if (!spends && hasLabel) {
        problems.push(where + "  labelled " + s.label + " but the body never spends the " + s.name);
      }
    });
    if (startsBold) {
      // Compare with the square brackets stripped: the buttons render as "[Shield] Hold the barrier...",
      // so a plain prefix match against the bare name would never match.
      var after = rendered(button).trim();
      var bare = after.replace(/[\[\]]/g, "");
      var isFree = NO_COST_OK.some(function (n) { return bare.indexOf(n) === 0; });
      if (!isFree && !/^(\[ACTION\]|\[BONUS ACTION\])/.test(after)) {
        problems.push(where + "  bold does not start with a cost label\n      " + after);
      }
    }

    // 5. No em/en dashes in button text. The prose uses them throughout, but in a choice list they read as
    // clutter at 0.82em; a colon after the bold label does the same job. (2026-09-28, designer's call.)
    var vis = rendered(button);
    if (/[\u2014\u2013]/.test(vis)) {
      problems.push(where + "  em/en dash in button text, use a colon after the label instead\n      "
        + vis.trim());
    }
  }
});

if (problems.length === 0) {
  console.log("Checked " + checked + " choice(s) in " + targets.length + " file(s). All within 15 words, "
    + "cost labels correct.");
} else {
  console.log(problems.length + " choice-label problem(s):");
  problems.forEach(function (p) { console.log("  " + p); });
  process.exitCode = 1;
}
