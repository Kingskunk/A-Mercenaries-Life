// One-off audit helper: list every military-sense use of "line" in scenes.
// Run: node scratch/scan_line.js          -> only likely-military uses
//      node scratch/scan_line.js all      -> every \bline(s)\b occurrence
const fs = require("fs");
const path = require("path");

const dir = "web/mygame/scenes";
const showAll = process.argv[2] === "all";

// Collocations where "line" means something other than a battle formation.
const notMilitary = [
  "picket line", "tent line", "camp line", "company line", "baggage line",
  "dock line", "tow line", "hemp line", "scaling line", "shoreline", "water-line",
  "waterline", "hairline", "bloodline", "line of blood", "line of your", "line of his",
  "line of her", "family line", "succession line", "storyline", "outline",
  "pipe line", "fishing line", "laundry line", "linen line", "washing line",
  "line of sight", "line up", "line them", "line the", "silt-gate line",
  "line through", "line drawing", "line of the", "in line with", "lines of the",
  "along the line", "wagon line", "supply line", "line in the", "trade line",
  "line his", "line their", "firing line"
];

const hits = [];
for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith(".txt")) continue;
  const lines = fs.readFileSync(path.join(dir, f), "utf8").split(/\r?\n/);
  lines.forEach((raw, i) => {
    const l = raw.trim();
    if (l.startsWith("*comment") || l.startsWith("*line_break")) return;
    if (!/\blines?\b/i.test(l)) return;
    const low = l.toLowerCase();
    const skip = notMilitary.some((c) => low.includes(c));
    if (skip && !showAll) return;
    hits.push({ where: f + ":" + (i + 1), tag: skip ? "NON-MIL" : "MILITARY", text: l });
  });
}

const mil = hits.filter((h) => h.tag === "MILITARY").length;
console.log("### " + hits.length + " shown / " + mil + " flagged military" + (showAll ? " (all mode)" : "") + "\n");
for (const h of hits) {
  const snippet = h.text.length > 175 ? h.text.slice(0, 175) + "…" : h.text;
  console.log("[" + h.tag + "] " + h.where + "\n    " + snippet + "\n");
}
