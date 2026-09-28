// Round-trip test for tools/dds2png.js: builds DXT5 blocks with known contents, decodes them, and
// checks the RGBA output matches exactly. This is the definitive check on the decoder -- inferring
// correctness by eye from a real icon is unreliable, because "is that red halo real art or a bug?"
// cannot be settled by staring. A synthetic block has an answer we chose.
const path = require("path");
const zlib = require("zlib");
const { ddsToPng } = require(path.join(__dirname, "..", "tools", "dds2png.js"));

let fail = 0;
const ok = (c, m) => { console.log((c ? "  PASS  " : "  FAIL  ") + m); if (!c) fail++; };

// A header describing YCbCr 4:2:2 (flags 0x20 = DDPF_YUV), which is what the two uncompressed .DDS
// files in ICONS/ actually use. Only the pixel-format flags are set: a DDS in this layout does NOT
// carry RGBBitCount, and zeroing the surrounding header fields is what corrupted the earlier version
// of this test (it overwrote bytes the decoder reads).
function ddsHeaderYuv422(w, h) {
  const b = Buffer.alloc(128);
  b.write("DDS ", 0, "ascii");
  b.writeUInt32LE(124, 4);            // dwSize
  b.writeUInt32LE(0x1007, 8);         // CAPS|HEIGHT|WIDTH|PIXELFORMAT
  b.writeUInt32LE(h, 12);             // dwHeight
  b.writeUInt32LE(w, 16);             // dwWidth
  b.writeUInt32LE(1, 28);             // dwMipMapCount
  b.writeUInt32LE(0x20, 76);          // ddPfFlags = DDPF_YUV, and nothing else set
  return b;
}

// Minimal DDS header writer. Offsets matter: the DDS header is a fixed layout where
// ddPfFlags sits at byte 76, the fourCC at 84, and RGBBitCount at 88. (ddFlags is at 80, NOT the
// pixel-format flags -- writing the flags there is why the first version of this test failed.)
function ddsHeader(w, h, fourCC) {
  const b = Buffer.alloc(128);
  b.write("DDS ", 0, "ascii");
  b.writeUInt32LE(124, 4);            // dwSize
  b.writeUInt32LE(0x1007, 8);         // CAPS|HEIGHT|WIDTH|PIXELFORMAT
  b.writeUInt32LE(h, 12);             // dwHeight
  b.writeUInt32LE(w, 16);             // dwWidth
  b.writeUInt32LE(1, 28);             // dwMipMapCount
  b.writeUInt32LE(fourCC ? 0x4 : 0x41, 76);   // ddPfFlags: FOURCC, or RGB|ALPHAPIXELS
  if (fourCC) b.write(fourCC, 84, "ascii");
  b.writeUInt32LE(32, 88);            // dwRGBBitCount
  return b;
}

// Decompress our own PNG back to raw RGBA so we can compare pixels exactly.
function decodePngToRgba(png) {
  let w = 0, h = 0, idat = [];
  let off = 8;
  while (off < png.length) {
    const len = png.readUInt32BE(off);
    const type = png.toString("ascii", off + 4, off + 8);
    const data = png.slice(off + 8, off + 8 + len);
    if (type === "IHDR") { w = data.readUInt32BE(0); h = data.readUInt32BE(4); }
    if (type === "IDAT") idat.push(data);
    off += 12 + len;
  }
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const out = Buffer.alloc(w * h * 4);
  const stride = w * 4;
  for (let y = 0; y < h; y++) raw.copy(out, y * stride, y * (stride + 1) + 1, (y + 1) * (stride + 1));
  return { rgba: out, w, h };
}

console.log("=== DXT5 alpha modes ===");

// Case 1: 8-value alpha (a0 > a1) with 4-colour endpoints. Index 3 must NOT be transparent here.
{
  // c0 = 0xF800 (pure red in RGB565), c1 = 0x07E0 (pure green). c0 > c1, so 4-colour mode.
  // Four bytes of 2-bit indices, all 0 -> every pixel takes c0, which is red.
  const block = Buffer.from([
    255, 0, 0, 0, 0, 0, 0, 0,        // alpha: a0=255, a1=0, 3-bit indices all 0 -> all opaque
    0x00, 0xF8, 0xE0, 0x07,          // colour: c0=0xF800 little-endian, c1=0x07E0 little-endian
    0x00, 0x00, 0x00, 0x00           // indices all 0 -> c0 (red) everywhere
  ]);
  const { rgba } = decodePngToRgba(ddsToPng(Buffer.concat([ddsHeader(4, 4, "DXT5"), block])));
  const p = (x, y) => { const d = (y * 4 + x) * 4; return [rgba[d], rgba[d + 1], rgba[d + 2], rgba[d + 3]]; };
  ok(p(0, 0)[3] === 255, "8-value alpha: pixel 0 opaque (a=" + p(0, 0)[3] + ")");
  ok(p(0, 0)[0] === 255 && p(0, 0)[1] === 0 && p(0, 0)[2] === 0,
     "4-colour: pixel 0 is endpoint c0 = red, got rgb(" + p(0, 0).slice(0, 3) + ")");
}

// Case 2: 3-colour mode (c0 <= c1). Index 3 MUST be transparent regardless of the alpha block.
{
  const block = Buffer.from([
    255, 255, 0, 0, 0, 0, 0, 0,      // alpha a0=255 a1=255 -> 2-bit mode, all indices 0 -> opaque 255
    0x00, 0x00, 0x00, 0x00,           // c0 = c1 = 0x0000 (equal) -> 3-colour mode
    0xFF, 0xFF, 0xFF, 0xFF            // every pixel index 3 = transparent
  ]);
  const { rgba } = decodePngToRgba(ddsToPng(Buffer.concat([ddsHeader(4, 4, "DXT5"), block])));
  const a = rgba[3];
  ok(a === 0, "3-colour mode: index 3 is transparent even when the alpha block says 255 (a=" + a + ")");
}

// Case 3: 3-colour mode, index 0 = opaque c0. Confirms non-3 indices keep the alpha block's value.
{
  const block = Buffer.from([
    255, 0, 0, 0, 0, 0, 0, 0,
    0x00, 0x00, 0x00, 0x00,           // c0 = c1 = black -> 3-colour mode
    0x00, 0x00, 0x00, 0x00            // all index 0 -> opaque black
  ]);
  const { rgba } = decodePngToRgba(ddsToPng(Buffer.concat([ddsHeader(4, 4, "DXT5"), block])));
  ok(rgba[3] === 255, "3-colour mode: index 0 keeps the alpha block's value (a=" + rgba[3] + ")");
}

console.log("");
console.log("=== uncompressed BGRA ===");
{
  const hdr = ddsHeader(2, 1, null);
  const px = Buffer.from([0x10, 0x20, 0x30, 0xFF, 0x40, 0x50, 0x60, 0x80]); // BGRA pairs
  const { rgba } = decodePngToRgba(ddsToPng(Buffer.concat([hdr, px])));
  ok(rgba[0] === 0x30 && rgba[1] === 0x20 && rgba[2] === 0x10,
     "BGRA swizzled to RGBA: got rgb(" + rgba[0] + "," + rgba[1] + "," + rgba[2] + ")");
  ok(rgba[3] === 0xFF, "alpha preserved: " + rgba[3]);
  ok(rgba[7] === 0x80, "second pixel alpha: " + rgba[7]);
}

console.log("");
console.log("=== YCbCr 4:2:2 ===");
{
  // Neutral greys in YUV: Y=128 with neutral chroma must decode to ~128 on all three channels, and
  // pure Y=255 must be white. This is the encoding the two uncompressed library files use.
  // Genuine YUY2 packing: 4 bytes per HORIZONTAL PAIR, laid out Y0 Cb Y1 Cr -- not 2 bytes per
  // pixel. Writing it per-pixel (the first attempt here) feeds the decoder a chroma byte that is
  // really the next pixel's luma, which is why neutral 128/128/128 came out green.
  const w = 2, h = 2;
  // The payload buffer below is CONCATENATED AFTER a 128-byte header, but the offsets written into it
  // here must be relative to the START OF THE PAYLOAD (0), not to the finished file (128). Writing at
  // 128 + n in a payload that is then concatenated leaves 128 zero bytes in front of the data, so the
  // decoder -- which reads at absolute 128 + n -- sampled the header's zeros instead. That is why
  // neutral 128s produced rgb(0,135,0): it decoded Y=0, which clamps to black-ish green.
  const payload = Buffer.alloc(w * h * 2);
  for (let row = 0; row < h; row++) {
    for (let pair = 0; pair < w / 2; pair++) {
      const base = (row * w / 2) * 4 + pair * 4;
      payload[base] = 128;        // Y0
      payload[base + 1] = 128;    // Cb
      payload[base + 2] = 128;    // Y1
      payload[base + 3] = 128;    // Cr
    }
  }
  const png = ddsToPng(Buffer.concat([ddsHeaderYuv422(w, h), payload]));
  const { rgba } = decodePngToRgba(png);
  const near = (v) => Math.abs(v - 128) <= 4;
  ok(near(rgba[0]) && near(rgba[1]) && near(rgba[2]),
     "neutral YUV 128/128/128 decodes to neutral grey, got rgb(" + rgba[0] + "," + rgba[1] + "," + rgba[2] + ")");
  ok(rgba[3] === 255, "YUV decodes opaque, alpha=" + rgba[3]);
}

console.log("");
console.log("=== PNG container ===");
{
  const png = ddsToPng(Buffer.concat([ddsHeader(4, 4, "DXT5"), Buffer.alloc(16)]));
  ok(png.slice(0, 8).toString("hex") === "89504e470d0a1a0a", "PNG signature");
  ok(png.toString("ascii", 12, 16) === "IHDR", "first chunk is IHDR");
  ok(png.toString("ascii", png.length - 8, png.length - 4) === "IEND", "last chunk is IEND");
}

console.log("");
console.log(fail === 0 ? "ALL PASS" : fail + " FAILURE(S)");
process.exitCode = fail ? 1 : 0;
