// Lints ChoiceScript *if / *elseif conditions for the parser restriction that `node compile.js`
// does NOT catch. The rule below was derived empirically, not guessed: see
// scratch/probe_condition_grammar.js, which feeds candidate conditions straight through the real
// parser in web/scene.js and prints which ones it accepts.
//
// THE RULE: a single parenthesised group may contain AT MOST ONE `and`/`or`. evaluateExpr in
// web/scene.js is a strict binary parser -- value [operator value], then it requires either the
// closing paren or the end of input. Two operators at the same level therefore fail with
// "Invalid expression ... expected CLOSE_PARENTHESIS, was: NAMED_OPERATOR". Nesting is unlimited.
//
//   OK    *if ((A) and (B))                       one operator in the group
//   OK    *if ((A) and ((B) or (C)))              the 'or' lives in its own inner group
//   OK    *if (((A) and (B)) and (C))              left-nested, one operator per level
//   OK    *if (((A) or (B)) and (C))              mixing operators across LEVELS is fine
//   BAD   *if ((A) and (B) and (C))               two operators in one group
//   BAD   *if ((A) or (B) or (C) or (D))          likewise
//
// This is a hard PARSE ERROR at runtime, not a wrong answer -- which is exactly the kind of thing
// that ships green from a clean compile and then dies the first time anyone enters combat.
//
// Run: node tools/lint_conditions.js
"use strict";

var fs = require("fs");
var path = require("path");

var dir = process.argv[2] || "web/mygame/scenes";
// Relative paths (e.g. "port_valen/port_valen_dredge_end.txt"), not bare basenames -- line 67 below
// reconstructs the real path via path.join(dir, f), which needs the subfolder segment to still be there.
var files = require("./lib/collect_scene_files").collectSceneRelativePaths(dir);

// Returns the depth (1-based) of the first group holding 2+ operators, or 0 if every group is fine.
function firstBadGroup(cond) {
  var counts = [0], depth = 0, i, ch;
  var inString = false, quote = "";
  for (i = 0; i < cond.length; i++) {
    ch = cond[i];
    if (inString) { if (ch === quote) inString = false; continue; }
    if (ch === '"' || ch === "'") { inString = true; quote = ch; continue; }
    if (ch === "(") { counts.push(0); depth++; continue; }
    if (ch === ")") {
      if (depth === 0) continue;
      if (counts.pop() > 1) return depth;
      depth--;
      continue;
    }
    if (depth >= 1 && (ch === "a" || ch === "o")) {
      var isAnd = cond.slice(i, i + 3) === "and";
      var isOr = !isAnd && cond.slice(i, i + 2) === "or";
      if (isAnd || isOr) {
        // Word boundaries are mandatory: a naive substring match counts the "and" inside
        // `has_hands_id` and the "or" inside `won_rorik_dice` as operators. ChoiceScript
        // identifiers are [a-z0-9_], so a real operator can never be glued to one.
        var before = i > 0 ? cond[i - 1] : " ";
        var afterCh = cond[i + (isAnd ? 3 : 2)] || " ";
        var wordChar = function (c) { return /[a-z0-9_]/i.test(c); };
        if (!wordChar(before) && !wordChar(afterCh)) {
          counts[depth]++;
          i += isAnd ? 2 : 1;
        }
        continue;
      }
    }
  }
  return 0;
}

var issues = [];
files.forEach(function (f) {
  var lines = fs.readFileSync(path.join(dir, f), "utf8").split(/\r?\n/);
  lines.forEach(function (line, idx) {
    var m = line.match(/^\s*\*(if|elseif)\s+(\(.*)$/);
    if (!m) return;
    var cond = m[2];
    // A trailing *comment on the same line is not part of the expression.
    var cAt = cond.indexOf(" *comment");
    if (cAt !== -1) cond = cond.slice(0, cAt);
    if (firstBadGroup(cond) !== 0) {
      issues.push({ file: f, line: idx + 1, text: line.trim().substring(0, 150) });
    }
  });
});

if (issues.length === 0) {
  console.log("Scanned " + files.length + " file(s). No group holds more than one and/or.");
} else {
  console.log(issues.length + " condition(s) with 2+ operators in a single group (runtime PARSE error):");
  issues.forEach(function (i) {
    console.log("  " + i.file + ":" + i.line);
    console.log("    " + i.text);
  });
  process.exitCode = 1;
}

