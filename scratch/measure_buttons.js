// Measures rendered width (markup tags stripped) of a district hub's POI menu
// buttons AS CURRENTLY SHIPPED, compared against the pre-change baseline
// (captured from git HEAD) so nothing that fitted on one line before starts
// wrapping.
//
// Usage: node scratch/measure_buttons.js [sceneFile] [anchorGoto]
//   defaults: web/mygame/scenes/port_valen.txt  pv_poi_fish_slip
const { execSync } = require("child_process");
const fs = require("fs");

const FILE = process.argv[2] || "web/mygame/scenes/port_valen.txt";
const ANCHOR = process.argv[3] || "pv_poi_fish_slip";
const cur = fs.readFileSync(FILE, "utf8").split(/\r?\n/);
const base = execSync("git show HEAD:" + FILE, { encoding: "utf8", maxBuffer: 1 << 28 })
  .split(/\r?\n/);

function harvest(lines) {
  // The *choice block containing ANCHOR, so we pick the right menu and not some
  // other one later in the file. Option bodies are indented, so every match here
  // has to allow leading whitespace.
  const start = lines.findIndex((l) =>
    new RegExp("^\\s*\\*goto(?:_scene)?\\s+" + ANCHOR + "\\s*$").test(l));
  if (start < 0) return [];
  let top = start;
  while (top >= 0 && !/^\*choice\s*$/.test(lines[top])) top--;
  const out = [];
  for (let i = top; i < lines.length; i++) {
    const m = lines[i] && lines[i].match(/^\s+# (.+)$/);
    if (m) out.push(m[1]);
    // The menu ends at the "head to another district" exit, which is spelled
    // "*goto port_valen_travel" in the harbour and "*goto_scene port_valen
    // port_valen_travel" in the district files, so match both. The city travel
    // menu has no such exit, so also stop at the next top-level *label.
    if (/^\s*\*goto(?:_scene)?\s+(?:port_valen\s+)?port_valen_travel\s*$/.test(lines[i] || "")) break;
    if (i > top && /^\*label\s/.test(lines[i] || "")) break;
  }
  return out;
}

// Rendered text: ChoiceScript markup is stripped before layout, so it costs no
// width. ${...} placeholders render as their value, so a two-digit sample is
// used to get a realistic width (the longest district leg is ~95 min).
function render(s) {
  return s
    .replace(/\[b\]/gi, "").replace(/\[\/b\]/gi, "")
    .replace(/\[i\]/gi, "").replace(/\[\/i\]/gi, "")
    .replace(/\$\{[^}]*\}/g, "75");
}
function words(s) { return s.trim().split(/\s+/).filter(Boolean).length; }

// @{condition true-text|false-text}: the condition is the leading token of the
// true branch. Both branches are measured, since only one ever renders.
function branches(s) {
  const m = s.match(/@\{([^|}]+)\|([^}]+)\}/);
  if (!m) return [render(s)];
  const cond = m[1].split(/\s+/)[0];
  const trueText = m[1].slice(cond.length).replace(/^\s+/, "");
  return [render(s.replace(m[0], trueText)), render(s.replace(m[0], m[2]))];
}

function report(label, list) {
  console.log("\n" + label);
  let max = 0, over15 = 0;
  list.forEach((b) => {
    branches(b).forEach((v) => {
      max = Math.max(max, v.length);
      if (words(v) > 15) over15++;
      console.log("  " + String(words(v)).padStart(2) + "w " + String(v.length).padStart(3) + "c  " + v);
    });
  });
  console.log("  --> longest " + max + "c | over-15-word lines: " + over15);
  return max;
}

console.log("file: " + FILE + "   anchor: " + ANCHOR);
const bMax = report("=== BASELINE (git HEAD) ===", harvest(base));
const cMax = report("=== SHIPPED NOW ===", harvest(cur));

console.log("\n=== VERDICT ===");
console.log("longest now " + cMax + "c vs baseline " + bMax + "c -> " +
  (cMax <= bMax ? "SAFE: nothing exceeds the longest line the player already saw"
                : "REGRESSION: " + (cMax - bMax) + "c longer than baseline"));
const now = harvest(cur);
const bad = now.filter((b) => branches(b).some((v) => words(v) > 15));
console.log("buttons over 15 words now: " + (bad.length ? bad.length + " -> " + bad.join(" | ") : "none"));
console.log("button count baseline/shipped: " + harvest(base).length + "/" + now.length);
const bolded = now.filter((b) => /^\[b\]/.test(b)).length;
console.log("buttons leading with [b]: " + bolded + "/" + now.length);
