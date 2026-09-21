// One-off audit helper: list every \bline(s)\b occurrence in scenes with a tight
// context window, so military-formation senses can be told from rope/picket/etc.
// Run: node scratch/scan_line2.js
const fs = require("fs");
const path = require("path");

const dir = "web/mygame/scenes";
const out = [];

for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith(".txt")) continue;
  const lines = fs.readFileSync(path.join(dir, f), "utf8").split(/\r?\n/);
  lines.forEach((raw, i) => {
    const l = raw.trim();
    if (l.startsWith("*comment") || l.startsWith("*line_break")) return;
    const re = /\blines?\b/gi;
    let m;
    while ((m = re.exec(l)) !== null) {
      const a = Math.max(0, m.index - 60);
      const b = Math.min(l.length, m.index + m[0].length + 60);
      out.push(
        f + ":" + (i + 1) + " | " +
        (a > 0 ? "..." : "") + l.slice(a, b) + (b < l.length ? "..." : "")
      );
    }
  });
}

fs.writeFileSync("scratch/line_report.txt", out.join("\n"), "utf8");
console.log("wrote scratch/line_report.txt (" + out.length + " occurrences)");
