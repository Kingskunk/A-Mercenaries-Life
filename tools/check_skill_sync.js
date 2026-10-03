/*
 * check_skill_sync.js -- catches drift between the skill rules in the scenes and the sidebar's Stats view,
 * which keeps hand copies of them in web/mygame/index.html (SB_SKILLS and sbExpertSkills).
 *
 * The real rules:
 *   - skill_lookup (scenes/dice_engine.txt): every skill's id, display name and default ability
 *   - the `*create skill_<id>` proficiency flags (scenes/startup.txt)
 *   - the expertise lines in roll_d20_check (scenes/dice_engine.txt): which class doubles which <class>_expertise_N variable
 * The copies: SB_SKILLS (id from the name, ability) and sbExpertSkills (class -> variables) in index.html.
 * A new skill, a changed ability or a new expertise class has to be mirrored there, or the sidebar shows a wrong number.
 *
 * Static text comparison, no engine needed. Exit code 1 on any mismatch.
 * usage: node tools/check_skill_sync.js [game=mygame]
 */
var fs = require("fs");
var path = require("path");

var gameName = "mygame";
process.argv.slice(2).forEach(function (a) { var p = a.split("="); if (p[0] === "game" && p[1]) gameName = p[1]; });
var base = path.join(__dirname, "..", "web", gameName);
function read(f) { return fs.readFileSync(path.join(base, f), "utf8"); }

var dice = read("scenes/dice_engine.txt");
var startup = read("scenes/startup.txt");
var index = read("index.html");
var problems = [];

// skill_lookup: *if (skl_id = "x") then the next two lines set ability and display name.
var real = {};
var lookup = dice.split("*label skill_lookup")[1];
if (!lookup) { console.error("skill_lookup not found in dice_engine.txt"); process.exit(1); }
lookup = lookup.split("*return")[0];
var re = /skl_id = "(\w+)"\)\s*\n\s*\*set skill_lookup_ability "(\w+)"\s*\n\s*\*set skill_lookup_display "([^"]+)"/g, m;
while ((m = re.exec(lookup))) real[m[1]] = { ability: m[2], display: m[3] };

// The sidebar's copy.
var copyBlock = index.match(/var SB_SKILLS = \[([\s\S]*?)\];/);
if (!copyBlock) { console.error("SB_SKILLS not found in index.html"); process.exit(1); }
var copy = {};
var pr = /\["([^"]+)",\s*"(\w+)"\]/g;
while ((m = pr.exec(copyBlock[1]))) copy[m[1].toLowerCase().replace(/ /g, "_")] = { ability: m[2], display: m[1] };

var flags = {};
var fr = /^\*create skill_(\w+) /gm;
while ((m = fr.exec(startup))) if (m[1] !== "lookup_ability" && m[1] !== "lookup_display") flags[m[1]] = true;

Object.keys(real).forEach(function (id) {
  if (!copy[id]) problems.push("skill '" + id + "' is in skill_lookup but missing from SB_SKILLS (index.html)");
  else {
    if (copy[id].ability !== real[id].ability) problems.push("skill '" + id + "': skill_lookup says " + real[id].ability + ", SB_SKILLS says " + copy[id].ability);
    if (copy[id].display !== real[id].display) problems.push("skill '" + id + "': skill_lookup name is \"" + real[id].display + "\", SB_SKILLS has \"" + copy[id].display + "\"");
  }
  if (!flags[id]) problems.push("skill '" + id + "' is in skill_lookup but has no *create skill_" + id + " in startup.txt");
});
Object.keys(copy).forEach(function (id) { if (!real[id]) problems.push("skill '" + id + "' is in SB_SKILLS but not in skill_lookup"); });
Object.keys(flags).forEach(function (id) { if (!real[id]) problems.push("*create skill_" + id + " exists in startup.txt but skill_lookup has no such skill"); });

// Expertise: class -> variables, as roll_d20_check reads them against the real game, versus sbExpertSkills.
var realExp = {};
dice.split("\n").forEach(function (line) {
  var cls = line.match(/character_class = "(\w+)"/);
  var vars = line.match(/check_skill = \w+_expertise_\d/g);
  if (!cls || !vars || line.trim().charAt(0) === "*" && line.indexOf("*comment") >= 0) return;
  vars.forEach(function (v) {
    var name = v.replace("check_skill = ", "");
    (realExp[cls[1]] = realExp[cls[1]] || {})[name] = true;
  });
});
var fnBody = index.match(/function sbExpertSkills\(s\) \{([\s\S]*?)\n  \}/);
if (!fnBody) { console.error("sbExpertSkills not found in index.html"); process.exit(1); }
var copyExp = {};
var er = /c === "(\w+)"\) return \[([^\]]*)\]/g;
while ((m = er.exec(fnBody[1]))) {
  copyExp[m[1]] = {};
  (m[2].match(/s\.(\w+)/g) || []).forEach(function (v) { copyExp[m[1]][v.slice(2)] = true; });
}
var classes = {};
Object.keys(realExp).concat(Object.keys(copyExp)).forEach(function (c) { classes[c] = true; });
Object.keys(classes).forEach(function (c) {
  var a = Object.keys(realExp[c] || {}).sort().join(", "), b = Object.keys(copyExp[c] || {}).sort().join(", ");
  if (a !== b) problems.push("expertise for " + c + ": roll_d20_check uses [" + a + "], sbExpertSkills uses [" + b + "]");
});

if (problems.length) {
  console.log("SKILL SYNC: " + problems.length + " mismatch(es)");
  problems.forEach(function (p) { console.log("  - " + p); });
  process.exit(1);
}
console.log("SKILL SYNC ok: " + Object.keys(real).length + " skills, expertise for " + Object.keys(realExp).join(", "));
