/*
 * dds2png.js -- minimal DDS -> PNG converter for the ICONS/ art library.
 *
 * WHY THIS EXISTS. Some of the library ships as .DDS (DirectDraw Surface), a DirectX texture format
 * that NO browser can display -- there is no image/dds MIME type, so a data: URI of one is a broken
 * icon, and a relative src would not help either, since the compiled game is a single self-contained
 * HTML file. Two encodings appear in this library and both are handled here:
 *
 *   - uncompressed 32-bit BGRA (fourCC empty, DDPF_RGB|DDPF_ALPHAPIXELS, 32 bpp)
 *   - DXT5 / BC3 block compression (fourCC "DXT5")
 *
 * PNG is emitted rather than WebP because Node ships zlib but no WebP encoder: a PNG is just
 * zlib-deflated filtered scanlines, so this needs no third-party dependency. These are one-off build
 * inputs, so a slow-but-correct encoder beats adding a native image toolchain to the project.
 *
 * Public API: ddsToPng(buffer) -> Buffer (a complete PNG file).
 */
"use strict";
const zlib = require("zlib");

// ── CRC-32 (PNG chunk checksum) ──
const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

// ── PNG encoding ──
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

function encodePng(width, height, rgba) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;    // bit depth
  ihdr[9] = 6;    // colour type 6 = RGBA
  ihdr[10] = 0;   // deflate
  ihdr[11] = 0;   // adaptive filtering
  ihdr[12] = 0;   // no interlace
  // Each scanline is prefixed with filter type 0 (None). Nothing here is a photograph, and at 18-28px
  // in the UI the PNG is a few KB either way, so a per-line filter heuristic would only add code.
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0;
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0))
  ]);
}

// ── DDS decoding ──
const DDPF_ALPHAPIXELS = 0x1, DDPF_YUV = 0x20, DDPF_RGB = 0x40, DDPF_LUMINANCE = 0x20000;

function readPixelFormat(buf) {
  // The DDS header is a fixed layout: ddPfFlags is at byte 76 and the fourCC at 84. Byte 80 holds
  // ddFlags in the DXT5/RGB layout but LUMINANCE in the YUV layout, so it is deliberately not read
  // here -- only byte 76 is the pixel format, and the two encodings in this library differ in kind.
  const flags = buf.readUInt32LE(76);
  const fourCC = buf.toString("ascii", 84, 88).replace(/\0/g, "");
  return {
    flags,
    fourCC,
    bitCount: buf.readUInt32LE(88),
    hasAlpha: (flags & DDPF_ALPHAPIXELS) !== 0
  };
}

// YCbCr 4:2:2 to RGB, using the BT.601 full-range coefficients that DirectX's D3DFMT_YUY2 implies.
// In 4:2:2 chroma is shared by each horizontal pair, so the data is 2 bytes per pixel and the
// Cr/Cb pair is stored once per pair, not per pixel.
function ycbcr422ToRgb(y, cb, cr) {
  const yy = y - 16, u = cb - 128, v = cr - 128;
  const clamp = (n) => (n < 0 ? 0 : n > 255 ? 255 : n | 0);
  return [
    clamp(1.164 * yy + 1.596 * v),
    clamp(1.164 * yy - 0.392 * u - 0.813 * v),
    clamp(1.164 * yy + 2.017 * u)
  ];
}

function decodeYuv422(buf, w, h) {
  const out = Buffer.alloc(w * h * 4);
  const pairW = w - (w % 2);          // width rounded down to whole pairs
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      // YUY2 packs 4 bytes per HORIZONTAL PAIR as Y0 Cb Y1 Cr, so luma is NOT at a flat 2-byte
      // stride: pixel x sits at (x - x%2) + (x%2)*2 within its pair. Assuming 2 bytes per pixel
      // reads the neighbouring pixel's luma as chroma, which turns neutral greys green.
      const pair = x - (x % 2);
      const base = 128 + (y * pairW / 2) * 4 + pair;
      const lum = buf[base + (x % 2) * 2];
      const c = ycbcr422ToRgb(lum, buf[base + 1], buf[base + 3]);
      const d = (y * w + x) * 4;
      out[d] = c[0]; out[d + 1] = c[1]; out[d + 2] = c[2]; out[d + 3] = 255;
    }
  }
  return out;
}

function decodeUncompressed(buf, w, h, pf) {
  const out = Buffer.alloc(w * h * 4);
  const stride = Math.ceil((w * pf.bitCount) / 8);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const s = 128 + y * stride + x * 4;
      const d = (y * w + x) * 4;
      // 32-bit uncompressed DDS is BGRA byte order.
      out[d] = buf[s + 2];
      out[d + 1] = buf[s + 1];
      out[d + 2] = buf[s];
      out[d + 3] = pf.hasAlpha ? buf[s + 3] : 255;
    }
  }
  return out;
}

// Expand one 16-bit 5:6:5 colour to 8 bits per channel: DXT stores endpoints as RGB565.
function rgb565(c) {
  const r = (c >> 11) & 0x1f, g = (c >> 5) & 0x3f, b = c & 0x1f;
  return [(r << 3) | (r >> 2), (g << 2) | (g >> 4), (b << 3) | (b >> 2)];
}

function decodeDxt5(buf, w, h) {
  const out = Buffer.alloc(w * h * 4);
  const bw = Math.ceil(w / 4), bh = Math.ceil(h / 4);
  for (let by = 0; by < bh; by++) {
    for (let bx = 0; bx < bw; bx++) {
      const base = 128 + (by * bw + bx) * 16;
      // Alpha block (8 bytes): a0, a1, then 6 bytes of 3-bit indices -- or 4 bytes of 2-bit indices
      // plus an explicit 4-value table, which is what a0 <= a1 selects.
      const a0 = buf[base], a1 = buf[base + 1];
      const alpha = new Array(16);
      if (a0 > a1) {
        const bits = buf.readUIntLE(base + 2, 6);
        for (let i = 0; i < 16; i++) {
          const idx = (bits >> (3 * i)) & 7;
          alpha[i] = idx === 0 ? a0 : idx === 1 ? a1
            : Math.round(a0 + ((a1 - a0) * (idx - 1)) / 7);
        }
      } else {
        const table = [a0, a1, buf[base + 6], buf[base + 7]];
        const bits = buf.readUInt32LE(base + 2);
        for (let i = 0; i < 16; i++) alpha[i] = table[(bits >> (2 * i)) & 3];
      }
      // Colour block (8 bytes): two RGB565 endpoints then four bytes of 2-bit indices.
      const c0 = buf.readUInt16LE(base + 8);
      const c1 = buf.readUInt16LE(base + 10);
      // Whether the COLOUR half uses 3-colour+transparent is a separate decision from the alpha
      // half's own a0<=a1 test. Note c0 and c1 can be equal (a flat block): that still selects
      // 3-colour mode, in which index 3 means "fully transparent black".
      const threeColour = c0 <= c1;
      const pal = [rgb565(c0), rgb565(c1)];
      if (!threeColour) {
        pal.push([(2 * pal[0][0] + pal[1][0]) / 3 | 0, (2 * pal[0][1] + pal[1][1]) / 3 | 0, (2 * pal[0][2] + pal[1][2]) / 3 | 0]);
        pal.push([(pal[0][0] + 2 * pal[1][0]) / 3 | 0, (pal[0][1] + 2 * pal[1][1]) / 3 | 0, (pal[0][2] + 2 * pal[1][2]) / 3 | 0]);
      } else {
        pal.push([(pal[0][0] + pal[1][0]) / 2 | 0, (pal[0][1] + pal[1][1]) / 2 | 0, (pal[0][2] + pal[1][2]) / 2 | 0]);
        pal.push([0, 0, 0]);   // 3-colour mode: index 3 is transparent black
      }
      const cbits = buf.readUInt32LE(base + 12);
      for (let py = 0; py < 4; py++) {
        for (let px = 0; px < 4; px++) {
          const x = bx * 4 + px, y = by * 4 + py;
          if (x >= w || y >= h) continue;          // the right/bottom edges of a block are padding
          const idx = (cbits >> (2 * (4 * py + px))) & 3;
          const c = pal[idx];
          const d = (y * w + x) * 4;
          out[d] = c[0]; out[d + 1] = c[1]; out[d + 2] = c[2];
          // In 3-colour mode index 3 is transparent REGARDLESS of the alpha block -- that is the whole
          // point of the mode, and it is what carries the icon's background transparency. Reading
          // alpha from the alpha block here instead is what painted a red halo over the whole image.
          out[d + 3] = (threeColour && idx === 3) ? 0 : alpha[4 * py + px];
        }
      }
    }
  }
  return out;
}

function ddsToPng(buf) {
  if (buf.toString("ascii", 0, 4) !== "DDS ") throw new Error("not a DDS file");
  const height = buf.readUInt32LE(12);
  const width = buf.readUInt32LE(16);
  if (!width || !height) throw new Error("DDS has zero dimensions");
  const pf = readPixelFormat(buf);
  let rgba;
  if (pf.fourCC) {
    if (pf.fourCC === "DXT5" || pf.fourCC === "BC3") rgba = decodeDxt5(buf, width, height);
    else if (pf.fourCC === "DXT1" || pf.fourCC === "BC1") {
      throw new Error("DXT1/BC1 is not implemented -- re-save this file as DXT5 or uncompressed RGBA");
    } else {
      throw new Error("unsupported DDS fourCC '" + pf.fourCC + "'");
    }
  } else if (pf.flags & DDPF_YUV) {
    rgba = decodeYuv422(buf, width, height);
  } else if (pf.flags & DDPF_RGB) {
    rgba = decodeUncompressed(buf, width, height, pf);
  } else {
    throw new Error("unsupported DDS pixel format (flags 0x" + pf.flags.toString(16) + ")");
  }
  return encodePng(width, height, rgba);
}

module.exports = { ddsToPng, encodePng, crc32 };

