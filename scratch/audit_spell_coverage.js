// Cross-checks that EVERY spell id any scene can assign actually has an entry in spell-data.js.
// A missing entry is invisible in the UI: knownSpells() skips ids with no metadata, so the spell
// simply never appears in the spellbook. That is exactly how chill_touch went missing for warlocks
// while every test still passed -- nothing asserted that the list was complete.
//
// Exits 1 when any assignable spell is missing, so this can gate a commit.
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const dir = path.join(root, "web", "mygame", "scenes");

// Every spell id the scenes can write into a spell slot. The slot names are enumerated rather than
// pattern-matched loosely, so an unexpected spelling surfaces as a missing id instead of a silent miss.
const SLOTS = [
  "race_cantrip", "race_cantrip_2",
  "warlock_cantrip", "warlock_cantrip_2", "warlock_spell",
  "wizard_cantrip", "wizard_cantrip_2", "wizard_cantrip_3", "wizard_spell",
  "bard_cantrip", "bard_cantrip_2", "bard_spell", "bard_spell_2"
];

const used = new Map();   // spell id -> the scene file that first assigns it
for (const f of fs.readdirSync(dir).filter((n) => n.endsWith(".txt"))) {
  const src = fs.readFileSync(path.join(dir, f), "utf8");
  for (const line of src.split("\n")) {
    const t = line.trim();
    if (!t.startsWith("*set ")) continue;
    for (const slot of SLOTS) {
      const m = t.match(new RegExp("^\\*set\\s+" + slot + "\\s+\"([a-z_0-9]+)\""));
      if (m && m[1] !== "none" && !used.has(m[1])) used.set(m[1], f);
    }
  }
}

const data = fs.readFileSync(path.join(root, "web", "mygame", "spell-data.js"), "utf8");
const known = new Set([...data.matchAll(/\bid:\s*"([a-z_0-9]+)"/g)].map((m) => m[1]));
const missing = [...used.keys()].filter((id) => !known.has(id)).sort();
const unused = [...known].filter((id) => !used.has(id)).sort();

console.log("spell ids the scenes can assign: " + used.size);
console.log("entries in spell-data.js:         " + known.size);
console.log("");
if (missing.length) {
  console.log("MISSING from spell-data.js (invisible in the UI): " + missing.length);
  missing.forEach((id) => console.log("   " + id.padEnd(24) + "first set in " + used.get(id)));
} else {
  console.log("MISSING from spell-data.js: none");
}
if (unused.length) {
  console.log("");
  console.log("in spell-data.js but never assigned by any scene (" + unused.length + "):");
  unused.forEach((id) => console.log("   " + id));
}
process.exitCode = missing.length ? 1 : 0;
