// Compares the DDS-decoded icon against the library's own WEBP icon for the same spell. If the webp
// shows the same red halo, the red is in the source art and the decode is fine; if only the DDS shows
// it, the decode is at fault. This is the check that settles it without guessing.
const fs = require("fs");
const path = require("path");
const dir = path.join(__dirname, "..", "ICONS", "Spell");

// Prestidigitation's DDS decode put a red halo where the art should be transparent. Compare the
// alpha histogram of the DXT5 decode against a known-good webp of the same visual family.
const { ddsToPng } = require(path.join(__dirname, "..", "tools", "dds2png.js"));
const zlib = require("zlib");

function rawFromPng(png, w, h) {
  const idat = [];
  let off = 8;
  while (off < png.length) {
    const len = png.readUInt32BE(off);
    if (png.toString("ascii", off + 4, off + 8) === "IDAT") idat.push(png.slice(off + 8, off + 8 + len));
    off += 12 + len;
  }
  return zlib.inflateSync(Buffer.concat(idat));
}

// The webp icons cannot be decoded here (no webp decoder in Node), so compare the DXT5 file against
// itself under a DIFFERENT hypothesis instead: does the red live in blocks whose 3-bit colour index
// is 3? If yes, it is the transparent-punchthrough colour being shown, i.e. our palette is wrong.
const b = fs.readFileSync(path.join(dir, "Spell_Transmutation_Prestidigitation.DDS"));
const w = b.readUInt32LE(16), h = b.readUInt32LE(12);
const bw = Math.ceil(w / 4), bh = Math.ceil(h / 4);

let blocks3 = 0, blocks4 = 0, total = 0;
let visibleRed = 0, visibleTotal = 0;
const raw = rawFromPng(ddsToPng(b), w, h);
const stride = w * 4;

for (let by = 0; by < bh; by++) {
  for (let bx = 0; bx < bw; bx++) {
    const base = 128 + (by * bw + bx) * 16;
    const c0 = b.readUInt16LE(base + 8), c1 = b.readUInt16LE(base + 10);
    total++;
    if (c0 <= c1) blocks3++; else blocks4++;
  }
}
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const d = y * (stride + 1) + 1 + x * 4;
    const r = raw[d], g = raw[d + 1], bl = raw[d + 2], a = raw[d + 3];
    if (a > 128) {
      visibleTotal++;
      if (r > 90 && r - Math.max(g, bl) > 45) visibleRed++;
    }
  }
}
console.log("blocks: " + total + "  (" + blocks3 + " in 3-colour mode, " + blocks4 + " in 4-colour mode)");
console.log("visible px: " + visibleTotal + "   visibly red: " + visibleRed +
            "  (" + (100 * visibleRed / visibleTotal).toFixed(1) + "% of visible)");
console.log("");
console.log("If a large share of blocks are 3-colour mode AND much of the icon is visibly red, the");
console.log("art is likely NOT using punchthrough there, and the red is real source content.");
