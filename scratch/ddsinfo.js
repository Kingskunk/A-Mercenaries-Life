// Reports the DDS header fields that decide how a file must be decoded.
const fs = require("fs"), path = require("path");
const dir = path.join(__dirname, "..", "ICONS", "Spell");
const F = { DDPF_FOURCC: 0x4, DDPF_RGB: 0x40, DDPF_ALPHAPIXELS: 0x1, DDPF_LUMINANCE: 0x20000 };
for (const n of ["Spell_Transmutation_Prestidigitation.DDS", "Spell_Conjuration_UnseenServant.DDS", "Action_ChillingHand.DDS"]) {
  const b = fs.readFileSync(path.join(dir, n));
  const magic = b.toString("ascii", 0, 4);
  const size = b.readUInt32LE(4);
  const flags = b.readUInt32LE(8);
  const h = b.readUInt32LE(12), w = b.readUInt32LE(16);
  const mipCount = b.readUInt32LE(28);
  const pfFlags = b.readUInt32LE(80);
  const fourCC = b.toString("ascii", 84, 88);
  const rgbBitCount = b.readUInt32LE(88);
  const caps2 = b.readUInt32LE(112);
  const nMip = caps2 & 0x200 ? (caps2 & 0x1ff) + 1 : 1;
  const desc = [];
  if (fourCC.trim()) desc.push("fourCC=" + fourCC.trim());
  if (pfFlags & F.DDPF_RGB) desc.push("RGB");
  if (pfFlags & F.DDPF_ALPHAPIXELS) desc.push("ALPHAPIXELS");
  if (pfFlags & F.DDPF_LUMINANCE) desc.push("LUMINANCE");
  if (rgbBitCount) desc.push("bits=" + rgbBitCount);
  console.log(n);
  console.log("   magic=" + magic.trim() + " dwSize=" + size + " " + w + "x" + h +
              " mipMapCount=" + mipCount + " usableMips=" + nMip);
  console.log("   pixelformat: " + (desc.join(" ") || "(none)"));
  console.log("   pixel data starts at byte 128; available=" + (b.length - 128));
  // DXT1 block = 8 bytes, DXT3/5 = 16 bytes; uncompressed = w*h*4
  const need = { DXT1: Math.ceil(w/4)*Math.ceil(h/4)*8, DXT3: Math.ceil(w/4)*Math.ceil(h/4)*16, DXT5: Math.ceil(w/4)*Math.ceil(h/4)*16 };
  const k = fourCC.trim();
  if (need[k]) console.log("   top mip needs " + need[k] + " bytes -> " + ((b.length-128) >= need[k] ? "OK" : "SHORT"));
  else if (pfFlags & F.DDPF_RGB) console.log("   uncompressed top mip needs " + (w*h*4) + " bytes -> " + ((b.length-128) >= w*h*4 ? "OK" : "SHORT"));
  console.log("");
}
