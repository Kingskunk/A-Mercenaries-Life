// Checks whether a .DDS that CLAIMS DXT5 is really DXT5. The giveaway is the header's fourCC versus
// the block stride the pixel data actually needs: DXT1 blocks are 8 bytes, DXT3/DXT5 are 16. A file
// whose data is exactly half the DXT5 size is DXT1 with the fourCC mislabelled by whatever exported it.
const fs = require("fs");
const path = require("path");
const dir = path.join(__dirname, "..", "ICONS", "Spell");

const targets = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ["Spell_Transmutation_Prestidigitation.DDS", "Spell_Conjuration_UnseenServant.DDS", "Action_ChillingHand.DDS"];

for (const f of targets) {
  const b = fs.readFileSync(path.join(dir, f));
  const w = b.readUInt32LE(16), h = b.readUInt32LE(12);
  const fourCC = b.toString("ascii", 84, 88).replace(/\0/g, "") || "(uncompressed)";
  const pfFlags = b.readUInt32LE(80);
  const bits = b.readUInt32LE(88);
  const avail = b.length - 128;
  const blocks = Math.ceil(w / 4) * Math.ceil(h / 4);
  console.log(f);
  console.log("   header says: fourCC='" + fourCC + "' flags=0x" + pfFlags.toString(16) + " bits=" + bits);
  if (fourCC === "(uncompressed)") {
    console.log("   uncompressed data: " + avail + " vs needed " + w * h * 4 + " -> " + (avail >= w * h * 4 ? "matches" : "SHORT"));
    console.log("");
    continue;
  }
  console.log("   " + blocks + " blocks; DXT5 would need " + blocks * 16 + " bytes, DXT1 " + blocks * 8);
  console.log("   data available:    " + avail);
  const fitsDxt5 = avail >= blocks * 16;
  const fitsDxt1 = avail >= blocks * 8 && avail < blocks * 16;
  console.log("   -> " + (fitsDxt1 ? "SUSPECT: only DXT1-sized. This is really DXT1 (1-bit alpha), mislabelled."
                                   : fitsDxt5 ? "consistent with DXT5" : "neither"));
  console.log("");
}
