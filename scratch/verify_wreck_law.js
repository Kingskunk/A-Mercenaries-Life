// Ad-hoc verification for the harbor-wreck-law unlock fix in port_valen.txt.
// Walks every *set bell_resolution site, groups them by the label that sets it,
// and confirms each of the three tavern after-rumour branches now sets the flag
// (it was 2 of 3 before; the "bloodied" branch was the gap).
const fs = require("fs");
const lines = fs.readFileSync("web/mygame/scenes/port_valen.txt", "utf8").split(/\r?\n/);

let label = "";
const res = [];
const wreck = [];

lines.forEach((l, i) => {
  const lm = l.match(/^\*label\s+(\S+)/);
  if (lm) label = lm[1];
  const rm = l.match(/\*set\s+bell_resolution\s+"(\w+)"/);
  if (rm) res.push({ v: rm[1], label: label, ln: i + 1 });
  if (/\*set\s+codex_wreck_law\s+true/.test(l)) wreck.push({ label: label, ln: i + 1 });
});

console.log("--- bell_resolution set sites ---");
res.forEach(r => console.log("  " + r.v.padEnd(10) + " @ " + r.label + " (L" + r.ln + ")"));

console.log("--- codex_wreck_law set sites ---");
wreck.forEach(w => console.log("  @ " + w.label + " (L" + w.ln + ")"));

const rumour = wreck.filter(w => w.label === "pv_poi_tavern_rumors").map(w => w.ln);
console.log("--- tavern after-rumour branches that set it: L" + rumour.join(", L") + " ---");
console.log(rumour.length === 3
  ? "PASS: all 3 after-rumour branches set the flag (was 2)"
  : "CHECK: expected 3 branches, got " + rumour.length);
console.log(wreck.some(w => w.label === "bell_b4")
  ? "PASS: bell_b4 still sets it immediately (success paths)"
  : "CHECK: bell_b4 immediate set missing");

// The three branches the rumor can take, and whether each is covered.
const branches = new Set(res.map(r => r.v));
console.log("--- resolution values used anywhere: " + [...branches].join(", ") + " ---");

// bloodied must now be covered by the rumour (it is never set inside bell_b4).
const bloodied = res.filter(r => r.v === "bloodied").map(r => r.label);
console.log("bloodied set at: " + bloodied.join(", "));
const covered = bloodied.every(l => l !== "bell_b4");
console.log(covered
  ? "PASS: no 'bloodied' resolution happens inside bell_b4, so the rumour is the only place it can be earned"
  : "CHECK: a 'bloodied' resolution occurs inside bell_b4; rumour-only coverage would be unreachable for it");
