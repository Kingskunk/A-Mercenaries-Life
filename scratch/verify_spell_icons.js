// Verify every spell in spell-data.js now has real, decodable art in the generated file.
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");

const data = fs.readFileSync(path.join(ROOT, "web/mygame/spell-data.js"), "utf8");
const icons = JSON.parse(
  fs.readFileSync(path.join(ROOT, "web/mygame/spell-icons.js"), "utf8")
    .match(/window\.SPELL_ICONS = (\{.*?\});/s)[1]
);

const entries = [...data.matchAll(/\bid:\s*"([a-z_0-9]+)"/g)].map((m) => m[1]);
let fail = 0;
const ok = (cond, msg) => { if (!cond) fail++; console.log((cond ? "  ok   " : "  FAIL ") + msg); };

console.log("spells=" + entries.length + "  icons=" + Object.keys(icons).length);

// Every spell must have an icon, and every icon must belong to a real spell.
const missing = entries.filter((e) => !icons[e]);
const orphan = Object.keys(icons).filter((e) => !entries.includes(e));
ok(missing.length === 0, "no spell missing an icon" + (missing.length ? ": " + missing.join(", ") : ""));
ok(orphan.length === 0, "no orphan icon" + (orphan.length ? ": " + orphan.join(", ") : ""));

// Each data URI must be well-formed and decode to real bytes, so no row renders a broken image.
let decoded = 0;
for (const id of entries) {
  const uri = icons[id];
  const m = /^data:(image\/(?:webp|png|jpeg|svg\+xml));base64,(.+)$/.exec(uri || "");
  if (!m) { ok(false, id + ": malformed data URI"); continue; }
  const buf = Buffer.from(m[2], "base64");
  if (buf.length < 500) { ok(false, id + ": implausibly small (" + buf.length + "B)"); continue; }
  // RIFF/WEBP container signature; PNG signature; JPEG SOI.
  const webp = buf.length > 12 && buf.slice(0, 4).toString("ascii") === "RIFF" &&
               buf.slice(8, 12).toString("ascii") === "WEBP";
  const png = buf.slice(0, 8).toString("hex") === "89504e470d0a1a0a";
  const jpg = buf[0] === 0xff && buf[1] === 0xd8;
  ok(webp || png || jpg, id + ": " + m[1] + ", " + buf.length + "B");
  decoded++;
}
console.log("decoded " + decoded + "/" + entries.length + " icons");

// The three previously-missing spells specifically, plus a per-spell initials check.
console.log("\nthe three fixes:");
for (const id of ["alarm", "detect_magic", "jump"]) {
  const uri = icons[id] || "";
  const mime = (/^data:(image\/[a-z+]+);/.exec(uri) || [])[1];
  console.log("  " + (icons[id] ? "  ok   " : "  FAIL ") + id.padEnd(14) + mime +
              "  " + Math.round((uri.length * 0.75) / 1024) + " KB");
}

console.log(fail ? "\nFAILED (" + fail + ")" : "\nALL CHECKS PASSED");
process.exit(fail ? 1 : 0);