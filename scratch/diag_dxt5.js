// Diagnoses the red fringe seen in the DXT5 decode: dumps the first block's endpoints and reports
// where the reddest pixels are, so it can be established whether the alpha or colour half is wrong.
const fs = require("fs");
const path = require("path");
const { ddsToPng } = require(path.join(__dirname, "..", "tools", "dds2png.js"));
const f = path.join(__dirname, "..", "ICONS", "Spell", "Spell_Transmutation_Prestidigitation.DDS");
const b = fs.readFileSync(f);
const w = b.readUInt16LE(16), h = b.readUInt16LE(12);
console.log("dims " + w + "x" + h + "  (divisible by 4: " + (w % 4 === 0 && h % 4 === 0) + ")");

// Block 0 = top-left 4x4.
const b0 = 128;
const a0 = b[b0], a1 = b[b0 + 1];
const c0 = b.readUInt16LE(b0 + 8), c1 = b.readUInt16LE(b0 + 10);
console.log("block0: alpha a0=" + a0 + " a1=" + a1 + " -> " + (a0 > a1 ? "8-value (3-bit) mode" : "4-value (2-bit) mode"));
console.log("        colour c0=0x" + c0.toString(16) + " c1=0x" + c1.toString(16) + " -> " + (c0 > c1 ? "4-colour mode" : "3-colour + transparent"));
console.log("        block bytes: " + Array.from(b.slice(b0, b0 + 16)).join(","));

// Re-decode and find the reddest pixels and where they live.
const zlib = require("zlib");
const png = ddsToPng(b);
// Undo our own PNG round-trip by inflating the IDAT chunk back to raw filtered scanlines.
const idat = [];
let off = 8;
while (off < png.length) {
  const len = png.readUInt32BE(off);
  const type = png.toString("ascii", off + 4, off + 8);
  if (type === "IDAT") idat.push(png.slice(off + 8, off + 8 + len));
  off += 12 + len;
}
const raw = zlib.inflateSync(Buffer.concat(idat));
const stride = w * 4;
let best = null, redCount = 0, edgeRed = 0, opaqueCount = 0;
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const d = y * (stride + 1) + 1 + x * 4;
    const r = raw[d], g = raw[d + 1], bb = raw[d + 2], a = raw[d + 3];
    if (a > 128) opaqueCount++;
    const redness = r - Math.max(g, bb);
    // Only judge colour where the pixel is actually VISIBLE. At alpha 0 the RGB channels are
    // undefined padding, so counting them would "find" red everywhere in every transparent region.
    if (a > 24 && r > 90 && redness > 45) {
      redCount++;
      const onEdge = x >= w - 8 || y >= h - 8 || x < 8 || y < 8;
      if (onEdge) edgeRed++;
      if (!best || redness > best.redness) best = { x, y, r, g, bb, a, redness };
    }
  }
}
console.log("");
console.log("visible pixels (alpha>128): " + opaqueCount + " of " + (w * h) + "  (" + (100 * opaqueCount / (w * h)).toFixed(1) + "%)");
console.log("VISIBLE pixels strongly red: " + redCount + "  (" + (100 * redCount / (w * h)).toFixed(1) + "% of frame)");
console.log("  of those, within 8px of an edge: " + edgeRed);
if (best) console.log("  reddest visible: (" + best.x + "," + best.y + ") rgba(" + best.r + "," + best.g + "," + best.bb + "," + best.a + ")");
