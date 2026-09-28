/*
 * SPELL DATA -- the castable-spell list the sidebar's spellbook section renders, and the single
 * source of truth for which spells exist.
 *
 * Deliberately hand-maintained, NOT a scan of ICONS/: the art library holds ~7,200 files covering all
 * of D&D 5e, while this game implements around thirty. Listing them here means (a) the sidebar only
 * ever offers things that can actually happen, and (b) adding art to ICONS/ never silently changes what
 * the UI shows. `tools/gen_spell_icons.js` reads the `id` fields of this file to decide which icons to
 * inline, so a spell added here with no matching art simply falls back to an initials chip.
 *
 * `level` is the 5e spell level, used to pick which tab orb the entry files under (0 = cantrip). These
 * are the levels the game actually offers in its pools: a cantrip (0) or a 1st-level spell, so levels
 * 2+ have no entries yet and their tabs render dimmed rather than hidden -- the tab row keeps a stable
 * shape so it does not reflow when a character learns something.
 *
 * `name` is the display label; the sidebar's own `_desc` stat (bard_cantrip_desc and friends) is
 * preferred over `desc` when present, since it carries the game's own longer prose.
 *
 * Open with the Spellbook section in the sidebar, or the S key.
 */
(function () {
  "use strict";

  var SPELL_DATA = [
    // ── Cantrips (level 0) ──
    { id: "blade_ward",         name: "Blade Ward",         level: 0, schools: "Abjuration" },
    { id: "chill_touch",         name: "Chill Touch",         level: 0, schools: "Necromancy" },
    { id: "eldritch_blast",     name: "Eldritch Blast",     level: 0, schools: "Evocation" },
    { id: "fire_bolt",          name: "Fire Bolt",          level: 0, schools: "Evocation" },
    { id: "guidance",           name: "Guidance",           level: 0, schools: "Divination" },
    { id: "light",              name: "Light",              level: 0, schools: "Evocation" },
    { id: "mage_hand",          name: "Mage Hand",          level: 0, schools: "Conjuration" },
    { id: "message",            name: "Message",            level: 0, schools: "Transmutation" },
    { id: "mending",            name: "Mending",            level: 0, schools: "Transmutation" },
    { id: "minor_illusion",     name: "Minor Illusion",     level: 0, schools: "Illusion" },
    { id: "prestidigitation",   name: "Prestidigitation",   level: 0, schools: "Conjuration" },
    { id: "ray_of_frost",       name: "Ray of Frost",       level: 0, schools: "Evocation" },
    { id: "shocking_grasp",     name: "Shocking Grasp",     level: 0, schools: "Evocation" },
    { id: "vicious_mockery",    name: "Vicious Mockery",    level: 0, schools: "Enchantment" },
    { id: "thaumaturgy",        name: "Thaumaturgy",        level: 0, schools: "Transmutation" },

    // ── 1st-level spells ──
    { id: "armor_of_agathys",   name: "Armor of Agathys",   level: 1, schools: "Abjuration" },
    { id: "bane",               name: "Bane",               level: 1, schools: "Enchantment" },
    { id: "charm_person",       name: "Charm Person",       level: 1, schools: "Enchantment" },
    { id: "comprehend_languages", name: "Comprehend Languages", level: 1, schools: "Divination" },
    { id: "disguise_self",      name: "Disguise Self",      level: 1, schools: "Illusion" },
    { id: "dissonant_whispers", name: "Dissonant Whispers", level: 1, schools: "Enchantment" },
    { id: "false_life",         name: "False Life",         level: 1, schools: "Necromancy" },
    { id: "feather_fall",       name: "Feather Fall",       level: 1, schools: "Transmutation" },
    { id: "healing_word",       name: "Healing Word",       level: 1, schools: "Evocation" },
    { id: "hex",                name: "Hex",                level: 1, schools: "Enchantment" },
    { id: "identify",           name: "Identify",           level: 1, schools: "Divination" },
    { id: "mage_armor",         name: "Mage Armor",         level: 1, schools: "Abjuration" },
    { id: "magic_missile",      name: "Magic Missile",      level: 1, schools: "Evocation" },
    { id: "shield",             name: "Shield",             level: 1, schools: "Abjuration" },
    { id: "unseen_servant",     name: "Unseen Servant",     level: 1, schools: "Conjuration" }
  ];

  // The stat fields that can hold a spell id, in display order. The sidebar reads all of them rather
  // than branching on class, so a character shows one combined list however their magic was acquired
  // (a Hexblood's innate race_cantrip_2 sits alongside their class picks, exactly as combat reads it).
  var SPELL_SLOTS = [
    "race_cantrip", "race_cantrip_2",
    "warlock_cantrip", "warlock_cantrip_2", "warlock_spell",
    "wizard_cantrip", "wizard_cantrip_2", "wizard_cantrip_3", "wizard_spell",
    "bard_cantrip", "bard_cantrip_2", "bard_spell", "bard_spell_2"
  ];

  var byId = {};
  SPELL_DATA.forEach(function (sp) { byId[sp.id] = sp; });

  window.SPELL_DATA = SPELL_DATA;
  window.SPELL_SLOTS = SPELL_SLOTS;
  window.spellById = function (id) { return byId[id] || null; };
})();
