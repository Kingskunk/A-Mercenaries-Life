#!/usr/bin/env node
/*
 * gen_spell_icons.js -- turns the ICONS/ art library into web/mygame/spell-icons.js, a plain
 * window.SPELL_ICONS map of spell id -> data: URI.
 *
 * WHY A GENERATED FILE. The art library is ~7,200 files / 119 MB, which is far too much to ship, and
 * compile.js only inlines images for *image lines in a scene and only from web/mygame/ -- panels are
 * plain JS reading window.stats, so they cannot use that path. Worse, the game ships as ONE
 * self-contained play_game.html, where a plain <img src="icons/x.webp"> would 404. Base64 data URIs in
 * a generated JS file are the only form that behaves identically in dev and in the compiled bundle,
 * which is why compile.js inlines its images the same way. This is the UI-panel equivalent of that.
 *
 * Only spells the game can actually know are emitted -- the list is spell-data.js's, not a directory
 * scan of ICONS/ -- so adding art to the library never silently bloats the build.
 *
 * `--check` exits 1 if the generated file is stale, for use after editing ICONS/ or spell-data.js.
 *
 * Run: node tools/gen_spell_icons.js            (write)
 *      node tools/gen_spell_icons.js --check    (verify, non-writing)
 *      node tools/gen_spell_icons.js --verbose  (write, and print the spell -> filename mapping)
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const ICONS = path.join(ROOT, "ICONS");
const OUT = path.join(ROOT, "web", "mygame", "spell-icons.js");
const DATA = path.join(ROOT, "web", "mygame", "spell-data.js");

const checkOnly = process.argv.includes("--check");

// `--batch` inlines ONLY the three cantrips the Cadre Battle-Abjurer preset already knows, for a
// proof-of-concept pass before committing to the whole set: 97 KB base64 vs 645 KB. The spell LIST
// (spell-data.js) is unchanged either way, so the UI is identical -- spells with no inlined art just
// take the initials-chip fallback, which is also how the 6 spells with no art in the library render.
// Drop the flag once the feature is kept and the full set costs little more than the batch does.
const batchOnly = process.argv.includes("--batch");
const BATCH_IDS = ["guidance", "ray_of_frost", "blade_ward"];

// Spell ids that the library's FUZZY match cannot resolve to the right file on its own, because the
// library disambiguates them into several near-identical variants. Everything else -- including the
// British "Armour" spelling and names carrying an extra word like "Bane_spell" -- is resolved
// automatically by findSpellIcon, so this list stays short and only holds genuine ambiguities.
const RENAMES = {
  // "Spell/" prefixes are relative to ICONS/, not ICONS/Spell/ -- see findSpellIcon step 1.
  hex: "Spell/Hex_Charisma_Icon.webp",                   // library also has Hex_Conjure
  disguise_self: "Spell/Disguise_Self_Femme_Dragonborn_Icon.webp",  // library variants are race-specific

  // The library's newer DDS-derived batch uses a Spell_<School>_<Name> convention, which the fuzzy
  // scorer handles badly -- the school word is extra text, so these would lose to a shorter wrong
  // candidate. Naming them explicitly is clearer and cheaper than teaching the scorer about a
  // second naming scheme. (These arrived as .DDS and were converted to .webp; see tools/dds2png.js
  // for the DDS path still used by the rest of the library.)
  prestidigitation: "Spell/Spell_Transmutation_Prestidigitation.webp",
  unseen_servant: "Spell/Spell_Conjuration_UnseenServant.webp",
  // NOTE: the library has no Chill Touch art. Action_ChillingHand is a DIFFERENT spell (a 1st-level
  // evocation attack, not a necromancy cantrip), so this is a deliberate visual stand-in rather than
  // the correct icon: a blue hand fits a chilling touch far better than an initials chip does. The
  // name in the UI still comes from spell-data.js, so nothing but the picture is affected.
  // RENAMES entries are paths relative to ICONS/, so spell art living in ICONS/Spell/ needs the
  // "Spell/" prefix here (see findSpellIcon step 1). Getting this wrong fails SILENTLY -- the entry
  // stops resolving and the spell quietly reverts to an initials chip -- which is exactly how
  // disguise_self went unnoticed until this check was added.
  chill_touch: "Spell/Action_ChillingHand.webp",

  // No Message art exists in the library. This is a silent-speech cantrip, and the closest available
  // art is the sentient amulet's "talk" action -- a figure speaking, which is a reasonable read for
  // a spell whose whole point is projecting a message. Another deliberate stand-in, not a match.
  message: "Action/Talk_to_the_Sentient_Amulet_Icon.webp"   // relative to ICONS/, not ICONS/Spell/
};

// The level-orb tab icons, by level. 0 is the cantrip row. The library ships Ico_knownSpells_lvl_01
// through _09, so any level the game's pools ever reach can be added here without new art.
const ORBS = {
  0: "Ico_classCantrip.png",
  1: "Ico_knownSpells_lvl_01.png",
  2: "Ico_knownSpells_lvl_02.png",
  3: "Ico_knownSpells_lvl_03.png",
  4: "Ico_knownSpells_lvl_04.png"
};

const MIME = { ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml" };

function dataUri(absPath) {
  const ext = path.extname(absPath).toLowerCase();
  const mime = MIME[ext];
  if (!mime) throw new Error("no MIME mapping for " + ext);
  return "data:" + mime + ";base64," + fs.readFileSync(absPath).toString("base64");
}

function findSpellIcon(id) {
  const spellDir = path.join(ICONS, "Spell");
  // 1. An explicit override always wins. Resolved against ICONS/ rather than ICONS/Spell/ because a
  //    stand-in can live in another category -- message borrows from ICONS/Action/, since the library
  //    has no Message art at all and the closest read is a figure speaking.
  if (RENAMES[id]) {
    const p = path.join(ICONS, RENAMES[id]);
    if (fs.existsSync(p)) return p;
    // A stale RENAMES entry is a silent-failure trap: the spell just reverts to an initials chip and
    // nothing else in the build complains. Say so loudly instead.
    console.warn("  WARNING: RENAMES['" + id + "'] -> " + RENAMES[id] + " does not exist under ICONS/");
  }
  // 2. The library's convention: <Display_Name>_Icon.webp. Also accept the _Unfaded_ spelling, since
  //    most spells ship in both a faded and an unfaded form and either is fine at this size.
  const title = id.charAt(0).toUpperCase() + id.slice(1);
  for (const suffix of ["_Icon.webp", "_Unfaded_Icon.webp"]) {
    const p = path.join(spellDir, title + suffix);
    if (fs.existsSync(p)) return p;
  }
  // 3. The library is not internally consistent, so fall back to a scored fuzzy match over the
  //    directory rather than a growing list of renames. The library is a UK-flavoured 5e asset set,
  //    so spell ids routinely differ from the filenames in three ways, all handled below:
  //      - British spelling:  armor_of_agathys -> Armour_of_Agathys, mage_armor -> Mage_Armour
  //      - an extra word:     bane -> Bane_spell
  //      - a suffix/descriptor: e.g. "Bestow_Curse_Attack_Disadvantage_Icon" for a plain bestow curse
  //    Scoring requires the candidate to contain the id's words (or their British spelling) and then
  //    ranks by how much extra text the candidate adds, so the closest name wins over a longer one.
  const words = id.split("_").filter((w) => w.length > 2);
  if (!words.length) return null;
  const alt = (w) => (/^a(r|rmou)o?r/.test(w) || w === "armor" || w === "armour") ? ["armor", "armour"] : [w];
  let best = null, bestScore = Infinity;
  for (const name of fs.readdirSync(spellDir)) {
    if (!/\.(webp|png|jpg|jpeg|svg)$/i.test(name)) continue;
    if (/_Unfaded_/.test(name)) continue;             // prefer the standard (faded) form
    const flat = name.toLowerCase().replace(/[^a-z]/g, "");
    // Every word of the id must appear in the candidate, allowing the armour/armor spelling swap.
    const hasAll = words.every((w) => alt(w).some((v) => flat.includes(v)));
    if (!hasAll) continue;
    // Fewer extra characters = closer match. Underscores stripped above, so this is a true length gap.
    let score = flat.length - id.replace(/_/g, "").length;
    // A library filename that merely CONTAINS the spell's name is a different spell that happens to
    // include it: "shield" must not resolve to Fire_Shield, or "ward" would match Blade_ward by
    // accident. The id's own words must therefore be a contiguous run, not scattered substrings.
    // Stripping a filler infix the library inserts ("_spell_") is allowed -- that is the
    // Bane -> Bane_spell case -- but any OTHER leftover text is a mismatch.
    let stem = flat;
    for (const filler of ["spell", "icon", "unfaded"]) stem = stem.split(filler).join("");
    // The id must be the stem's PREFIX, not merely a substring of it: "fireshield" contains "shield"
    // but is a different spell, whereas "shield" and "Shield_spell" both reduce to a stem beginning
    // "shield". Anchoring at the start is what keeps shield off Fire_Shield / Fire_Shield_Chill.
    if (!stem.startsWith(id.replace(/_/g, ""))) {
      score += 1000;   // sort these last, but keep them as a last resort rather than dropping them
    }
    if (score < bestScore || (score === bestScore && best && name < best)) {
      bestScore = score;
      best = name;
    }
  }
  return best ? path.join(spellDir, best) : null;
}

// The spell list lives in spell-data.js as data, not code, so this reads it rather than hardcoding
// names here -- a spell added there with no art simply falls back to an initials chip.
function readSpellIds() {
  const src = fs.readFileSync(DATA, "utf8");
  const ids = new Set();
  // Pull the id field out of each SPELL_DATA entry: id: "fire_bolt",
  const re = /\bid:\s*"([a-z_0-9]+)"/g;
  let m;
  while ((m = re.exec(src)) !== null) ids.add(m[1]);
  return [...ids].sort();
}

const allIds = readSpellIds();
const ids = batchOnly ? allIds.filter((id) => BATCH_IDS.includes(id)) : allIds;
const icons = {};
const missing = [];
let bytes = 0;

for (const id of ids) {
  const found = findSpellIcon(id);
  if (!found) { missing.push(id); continue; }
  icons[id] = dataUri(found);
  bytes += fs.statSync(found).size;
}

const orbs = {};
for (const [lvl, file] of Object.entries(ORBS)) {
  const p = path.join(ICONS, "Interface", file);
  if (!fs.existsSync(p)) throw new Error("missing tab orb: " + p);
  orbs[lvl] = dataUri(p);
  bytes += fs.statSync(p).size;
}

const out =
  "/*\n" +
  " * SPELL ICONS -- generated by tools/gen_spell_icons.js from the ICONS/ art library. Do not edit by\n" +
  " * hand; re-run `node tools/gen_spell_icons.js` (or `--check` to verify it is current). Consumed by the\n" +
  " * sidebar's spellbook section in index.html, which renders these as data: URIs because the game ships\n" +
  " * as a single self-contained play_game.html where a relative img src would 404.\n" +
  " *\n" +
  " * Only the " + Object.keys(icons).length + " spells this game can know are inlined (" +
  Math.round(bytes / 1024) + " KB of art). Spells with no matching art are deliberately absent so the\n" +
  " * UI can fall back to an initials chip rather than showing a broken image.\n" +
  " */\n" +
  "window.SPELL_ICONS = " + JSON.stringify(icons, null, 0) + ";\n" +
  "window.SPELL_TAB_ORBS = " + JSON.stringify(orbs, null, 0) + ";\n";

if (checkOnly) {
  if (!fs.existsSync(OUT)) { console.error("spell-icons.js is missing -- run without --check"); process.exit(1); }
  const cur = fs.readFileSync(OUT, "utf8");
  if (cur !== out) {
    console.error("spell-icons.js is STALE -- re-run `node tools/gen_spell_icons.js`");
    process.exit(1);
  }
  console.log("spell-icons.js is up to date (" + Object.keys(icons).length + " icons, " +
              Math.round(bytes / 1024) + " KB)" + (batchOnly ? " [batch]" : ""));
} else {
  fs.writeFileSync(OUT, out, "utf8");
  console.log("wrote " + path.relative(ROOT, OUT) + ": " + Object.keys(icons).length + " spell icons, " +
              Object.keys(orbs).length + " tab orbs, " + Math.round(bytes / 1024) + " KB of art" +
              (batchOnly ? " [batch -- drop the flag for the full set]" : ""));
  if (!batchOnly && missing.length) {
    console.log("  no art for " + missing.length + " spell(s), UI will use an initials chip: " +
                missing.join(", "));
  } else if (batchOnly && missing.length) {
    console.log("  (batch) not inlined, as expected: " + missing.join(", "));
  }
  // --verbose prints the spell -> filename mapping. Worth having because step 3 of findSpellIcon is a
  // FUZZY match: it can quietly resolve a spell to a plausible-looking neighbour (shield landing on
  // Fire_Shield, say) and nothing else in the build would reveal it. Run this after editing RENAMES
  // or adding a spell, and read the list.
  if (process.argv.includes("--verbose")) {
    console.log("\n  spell id -> library file");
    ids.forEach((id) => {
      const f = findSpellIcon(id);
      console.log("    " + (id + "                          ").slice(0, 26) +
                  (f ? "-> " + path.basename(f) : "-> (none -- initials chip)"));
    });
  }
}
