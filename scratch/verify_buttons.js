// Confirms every bolded hub-menu button that exists in the scene sources also
// made it into the compiled build, and that the old unbolded wording is gone.
// Written to a file (not node -e) because PowerShell mangles quotes in inline
// scripts, which produced false "MISS" results.
const fs = require("fs");

const SCENES = [
  ["web/mygame/scenes/port_valen.txt", "harbour quay", "pv_poi_fish_slip"],
  ["web/mygame/scenes/port_valen.txt", "city travel", "port_valen_travel_to"],
  ["web/mygame/scenes/port_valen_dredge_end.txt", "Dredge-End", "cut_market"],
  ["web/mygame/scenes/port_valen_middle_ward.txt", "Middle Ward", "mw_locksmiths_close"],
  ["web/mygame/scenes/port_valen_civic_heights.txt", "Civic Heights", "pv_ch_hall_door"],
  ["web/mygame/scenes/port_valen_upper_wharves.txt", "Patrician Quarter", "pq_estates"],
];

// The hub menu is the *choice block containing ANCHOR, ending at the
// "head to another district" exit. Only that block was rewritten -- buttons in
// sub-menus, quest beats and "walk back" exits are deliberately untouched, so
// they must be excluded from the legacy-wording check.
function hubMenu(lines, anchor) {
  const start = lines.findIndex((l) =>
    new RegExp("^\\s*\\*goto(?:_scene)?\\s+" + anchor + "\\s*$").test(l));
  if (start < 0) return [];
  let top = start;
  while (top >= 0 && !/^\*choice\s*$/.test(lines[top])) top--;
  const out = [];
  for (let i = top; i < lines.length; i++) {
    const m = lines[i] && lines[i].match(/^\s+# (.+)$/);
    if (m) out.push(m[1]);
    // Stop at the "head to another district" exit, or -- for the city travel
    // menu, which has no such exit -- at the next top-level *label. Without the
    // second stop the city travel scan runs to EOF and swallows the harbour
    // menu too, double-counting its buttons.
    if (/^\s*\*goto(?:_scene)?\s+(?:port_valen\s+)?port_valen_travel\s*$/.test(lines[i] || "")) break;
    if (i > top && /^\*label\s/.test(lines[i] || "")) break;
  }
  return out;
}

const build = fs.readFileSync("play_game.html", "utf8");
// The compiler JSON-escapes non-ASCII, and ${...} is left verbatim in the
// scene data, so normalise both before comparing against source text.
const buildNoEsc = build
  .replace(/\\u2013/g, "\u2013")
  .replace(/\\u2019/g, "\u2019");

let problems = 0;

SCENES.forEach(function (p) {
  const lines = fs.readFileSync(p[0], "utf8").split(/\r?\n/);
  const btns = hubMenu(lines, p[2]);

  const bolded = btns.filter((b) => /^\[b\]/.test(b));
  const plain = btns.filter((b) => !/^\[b\]/.test(b));

  console.log("\n=== " + p[1] + " ===");
  console.log("  hub menu buttons: " + btns.length +
              "   bolded: " + bolded.length + "   plain: " + plain.length);
  if (process.env.DEBUG_MENU) btns.forEach((b) => console.log("    | " + b.slice(0, 70)));
  console.log("  plain ones (expected: travel exit only): " + plain.join(" | "));

  bolded.forEach((b) => {
    const c = buildNoEsc.split(b).length - 1;
    if (c !== 1) { console.log("  PROBLEM build count=" + c + "  " + b); problems++; }
  });
  const ok = bolded.length > 0 && bolded.every((b) => buildNoEsc.split(b).length - 1 === 1);
  console.log("  every bolded hub button present exactly once in build: " + (ok ? "yes" : "NO"));
  if (!ok) problems++;
});

console.log("\n=== TOTAL PROBLEMS: " + problems + " ===");
