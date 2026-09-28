// Converts the three .DDS spell icons in ICONS/ to PNG and writes them beside the originals, so the
// result can be eyeballed (and so gen_spell_icons.js can pick them up) without a browser. The PNGs
// land in scratch/, NOT in ICONS/ -- ICONS/ is the source library and should not gain build output.
const fs = require("fs");
const path = require("path");
const { ddsToPng } = require(path.join(__dirname, "..", "tools", "dds2png.js"));

const dir = path.join(__dirname, "..", "ICONS", "Spell");
const outDir = path.join(__dirname, "dds_png");
fs.mkdirSync(outDir, { recursive: true });

const files = ["Spell_Transmutation_Prestidigitation.DDS", "Spell_Conjuration_UnseenServant.DDS", "Action_ChillingHand.DDS"];
let fail = 0;
for (const f of files) {
  const src = path.join(dir, f);
  if (!fs.existsSync(src)) { console.log("  missing: " + f); fail++; continue; }
  try {
    const png = ddsToPng(fs.readFileSync(src));
    // A PNG is only valid if its signature and CRCs check out; verify rather than assume.
    const ok = png.slice(0, 8).toString("hex") === "89504e470d0a1a0a";
    const out = path.join(outDir, f.replace(/\.DDS$/i, ".png"));
    fs.writeFileSync(out, png);
    console.log("  " + f + " -> " + path.basename(out) +
                "  " + Math.round(fs.statSync(src).size / 1024) + " KB DDS" +
                "  ->  " + Math.round(png.length / 1024) + " KB PNG" +
                "  signature " + (ok ? "OK" : "BAD"));
    if (!ok) fail++;
  } catch (e) {
    console.log("  " + f + " FAILED: " + e.message);
    fail++;
  }
}
process.exitCode = fail ? 1 : 0;
