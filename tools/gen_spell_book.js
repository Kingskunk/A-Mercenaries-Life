#!/usr/bin/env node
/*
 * gen_spell_book.js -- generates how a class's leveled spells are stored, read and learned, from tools/spell_book.json.
 *
 * WHY: a spell used to be a numbered slot (wizard_spell, wizard_spell_2 ...), and refresh_known_spells held one hand-written line per spell that
 * listed every slot of every class. A new slot meant editing all of them, and every level-up menu checked each earlier slot by hand. Now a slot is
 * only storage: learn_spell fills the first free one, a loop reads them all into held_<id>, and known_<id> follows from that. Scenes read the flags.
 *
 * It writes these GEN blocks (the same GEN:BEGIN/GEN:END marker blocks gen_spells.js uses, so a block is never hand-edited):
 *   character_progression.txt   spell_book_refresh   inline in refresh_known_spells: clear held_, scan each class's slots, set known_
 *   character_progression.txt   spell_book_subs      the labels book_scan, held_mark and learn_spell
 *   startup_parts/02_character_profile.txt   spell_book_creates   slots 2..N with their descriptions, the held_/known_ flags and the learn result
 *   choicescript_stats.txt      spell_book_cards     the dossier's spell cards, one call per class
 *   spell-data.js               spell_book_js_slots  BOOK_SLOTS: the slot field names the sidebar panel reads (a JS file, so its markers are // comments)
 *   spell-data.js               spell_book_js_copy   SPELL_LISTS / SPELL_LEVELS / SPELL_SCROLLS / COPY_*: what the book panel needs to show the loose leaves
 *   prologue/class_select.txt and character_progression.txt   the PICK MENUS (2026-11-04) -- the options in every "choose a spell" *choice at
 *     creation and on a level-up, one marker per menu (see the MENUS array below, and spell_book.json's readme). Adding a spell to a class's
 *     `lists` is enough: it appears in every menu that class offers with no other edit.
 *
 * Usage: node tools/gen_spell_book.js [--check]      --check exits 1 if any block is stale. After a change run node tools/build_startup.js too.
 */
"use strict";
var fs = require("fs");
var path = require("path");

var ROOT = path.join(__dirname, "..");
var SCENES = path.join(ROOT, "web", "mygame", "scenes");
var BOOK = JSON.parse(fs.readFileSync(path.join(__dirname, "spell_book.json"), "utf8"));
// The scroll items, read from the gear catalog rather than guessed from the id: a scroll declares its spell in effect.spell, and the
// panel needs that map to know which of the scrolls in a pack could be written into the book.
var GEAR = JSON.parse(fs.readFileSync(path.join(__dirname, "gear_catalog.json"), "utf8"));
function scrollMap() {
  var out = {};
  (function walk(o) {
    if (!o || typeof o !== "object") return;
    if (Array.isArray(o)) { o.forEach(walk); return; }
    if (o.effect && o.effect.type === "scroll" && o.effect.spell && o.id) out[o.effect.spell] = o.id;
    Object.keys(o).forEach(function (k) { walk(o[k]); });
  })(GEAR);
  return out;
}
var CHECK = process.argv.indexOf("--check") !== -1;

var classes = Object.keys(BOOK.classes);
// learnable is a map now (it was a bare array of ids): each spell carries its level, the classes that may learn it, and the book
// entry written when a copying class writes it in. The generated order follows the key order here.
var ids = Object.keys(BOOK.learnable);
var COST_PER_LEVEL = BOOK.copy_cost_per_level;
if (!(COST_PER_LEVEL >= 1)) throw new Error("copy_cost_per_level must be a positive number of training sessions");
var ABILITY = { int: "int_mod", wis: "wis_mod", cha: "cha_mod" };
classes.forEach(function (c) {
  var n = BOOK.classes[c].slots;
  if (!(n >= 1)) throw new Error("class " + c + " needs slots >= 1");
  if (!BOOK.classes[c].empty) throw new Error("class " + c + " needs an empty text");
  var p = BOOK.classes[c].prepares;
  if (p === undefined) throw new Error("class " + c + " needs a prepares field (an ability name, or false)");
  if (p !== false && !ABILITY[p]) throw new Error("class " + c + " prepares with unknown ability " + JSON.stringify(p));
});
var preparers = classes.filter(function (c) { return BOOK.classes[c].prepares !== false; });
var copiers = classes.filter(function (c) { return BOOK.classes[c].copies === true; });
ids.forEach(function (id) {
  var sp = BOOK.learnable[id];
  if (!sp.name) throw new Error("spell " + id + " needs a name (the display text)");
  if (!(sp.level >= 1)) throw new Error("spell " + id + " needs a level of 1 or more");
  if (!sp.lists || !sp.lists.length) throw new Error("spell " + id + " needs a lists array naming the classes that may learn it");
  sp.lists.forEach(function (c) { if (classes.indexOf(c) < 0) throw new Error("spell " + id + " lists unknown class " + c); });
  if (!sp.pitch) throw new Error("spell " + id + " needs a pitch (the short line a pick menu shows)");
  // desc is the long book entry, passed to learn_spell and shown when a copying class writes the spell in. Usually one string
  // shared by every class that can learn it; a few spells are flavoured differently per class (see spell_book.json's readme),
  // so it can instead be an object keyed by class name -- but every class in `lists` needs a resolvable entry either way, because
  // the pick menus are generated from this now too, not only a copying class's copy-in text.
  sp.lists.forEach(function (c) { descOf(id, c); });
  (sp.race_exclude || []).forEach(function (r) {
    if (typeof r !== "string" || !r) throw new Error("spell " + id + " has a bad race_exclude entry");
  });
});
function listOf(c) { return ids.filter(function (id) { return BOOK.learnable[id].lists.indexOf(c) >= 0; }); }
function costOf(id) { return BOOK.learnable[id].level * COST_PER_LEVEL; }
// The long book entry for a spell AS THAT CLASS would write or read it (see spell_book.json's readme on per-class desc).
function descOf(id, cls) {
  var d = BOOK.learnable[id].desc;
  if (typeof d === "string") return d;
  if (d && typeof d === "object" && typeof d[cls] === "string") return d[cls];
  throw new Error("spell " + id + " needs a desc for class " + cls + " (a single string, or an object keyed by class)");
}

function q(s) { return JSON.stringify(String(s)); }
function prefix(c) { return c + "_spell"; }
function slotVar(c, i) { return i === 1 ? prefix(c) : prefix(c) + "_" + i; }

// ---------------------------------------------------------------- spell_book_refresh
function genRefresh() {
  var L = [
    "*comment HELD = the spell is in one of a class's slots (learn_spell fills them). PREPARED = a preparing class is carrying it today. KNOWN = CASTABLE RIGHT NOW:",
    "*comment held or granted, prepared if this class prepares, and not spells_blocked (untrained armor or a shield).",
    "*comment Every scene asks known_<id>, so defining it this way is what makes the whole game honour preparation without one scene changing.",
    "*comment Cantrips are NOT gated: they are always ready, and their known_ flags are the hand-written chains above, not this block.",
    "*comment Generated by tools/gen_spell_book.js from tools/spell_book.json; scenes read held_<id> and known_<id>, never a slot."
  ];
  ids.forEach(function (id) { L.push("*set held_" + id + " false"); });
  classes.forEach(function (c) { L.push("*gosub book_scan " + q(prefix(c)) + " " + BOOK.classes[c].slots); });
  L.push("*gosub prepare_setup");
  ids.forEach(function (id) {
    var a = "((held_" + id + ") or (race_cantrip = " + q(id) + "))";
    var b = "(" + a + " or (race_cantrip_2 = " + q(id) + "))";
    // The preparation term reads TRUE for every class that does not prepare, so a bard, warlock or ranger is untouched by construction.
    var ready = "((not(class_prepares)) or (prepared_" + id + "))";
    L.push("*set known_" + id + " ((" + b + " and " + ready + ") and (not(spells_blocked)))");
  });
  return L;
}

// ---------------------------------------------------------------- spell_book_subs
function genSubs() {
  var L = [];
  L.push("*comment BOOK SCAN: reads every slot of one class (book_scan \"wizard_spell\" 12) and marks each spell found as held. Slot 1 is the bare name, slot N is name_N.");
  L.push("*label book_scan");
  L.push("*params bs_prefix bs_cap");
  L.push("*temp bs_i 1");
  L.push("*temp bs_name \"\"");
  L.push("*temp bs_id \"none\"");
  L.push("*label book_scan_loop");
  L.push("*if (bs_i <= bs_cap)");
  L.push("  *set bs_name bs_prefix");
  L.push("  *if (bs_i > 1)");
  L.push("    *set bs_name ((bs_prefix & \"_\") & bs_i)");
  L.push("  *set bs_id {(bs_name)}");
  L.push("  *if (not(bs_id = \"none\"))");
  L.push("    *gosub held_mark bs_id");
  L.push("  *set bs_i + 1");
  L.push("  *goto book_scan_loop");
  L.push("*return");
  L.push("");
  L.push("*comment HELD MARK: one line per learnable spell, so a spell id read from a slot sets its own flag. An id that is not listed in tools/spell_book.json sets nothing.");
  L.push("*label held_mark");
  L.push("*params hm_id");
  ids.forEach(function (id) {
    L.push("*if (hm_id = " + q(id) + ")");
    L.push("  *set held_" + id + " true");
  });
  L.push("*return");
  L.push("");
  L.push("*comment BOOK CLEAR EXTRA: empties every slot after the first of every class (the Dev Hub's reset back to a level 1 loadout; a preset then sets slot 1 itself).");
  L.push("*label book_clear_extra");
  classes.forEach(function (c) {
    for (var i = 2; i <= BOOK.classes[c].slots; i++) L.push("*set " + slotVar(c, i) + " \"none\"");
  });
  L.push("*gosub prepare_clear");
  L.push("*return");
  L.push("");

  // ---------------------------------------------------------------- preparation
  L.push("*comment PREPARE SETUP: who prepares, and how many they carry. A preparing class picks from its book each morning; every other class simply knows its");
  L.push("*comment spells and can cast them all, so class_prepares stays false and the preparation term in refresh_known_spells reads true for them.");
  L.push("*comment The count is the class's own ability modifier plus character_level, never below one. Called from refresh_known_spells, so it is always current.");
  L.push("*label prepare_setup");
  L.push("*set class_prepares false");
  L.push("*set prepared_max 0");
  L.push("*comment class_copies rides along here because it is the other standing fact about how a class handles spells, and this label is");
  L.push("*comment recomputed on every refresh_known_spells, so a panel can read it at any time without calling the copying check first.");
  L.push("*set class_copies false");
  copiers.forEach(function (c) {
    L.push("*if (character_class = " + q(c) + ")");
    L.push("  *set class_copies true");
  });
  if (preparers.length) {
    preparers.forEach(function (c) {
      L.push("*if (character_class = " + q(c) + ")");
      L.push("  *set class_prepares true");
      L.push("  *set prepared_max (" + ABILITY[BOOK.classes[c].prepares] + " + character_level)");
    });
    L.push("*if ((class_prepares) and (prepared_max < 1))");
    L.push("  *set prepared_max 1");
    L.push("*comment A bare literal in *set is stored as a STRING by the engine (\"1\"), while arithmetic yields a number. Comparisons coerce either way, but");
    L.push("*comment the panel reads this value, so adding nothing to it forces a number and the contract stays one type.");
    L.push("*set prepared_max (prepared_max + 0)");
  }
  L.push("*return");
  L.push("");

  L.push("*comment PREPARE CLEAR: nothing carried. The Dev Hub's reset uses it; so does a change of class.");
  L.push("*label prepare_clear");
  ids.forEach(function (id) { L.push("*set prepared_" + id + " false"); });
  L.push("*set prepared_count 0");
  L.push("*set prepared_count (prepared_count + 0)");
  L.push("*return");
  L.push("");

  L.push("*comment PREPARE COUNT: how many are carried right now. A spell that is no longer in the book is dropped here rather than counted, so the tally");
  L.push("*comment cannot drift when a book changes.");
  L.push("*label prepare_count");
  L.push("*set prepared_count 0");
  L.push("*set prepared_count (prepared_count + 0)");
  ids.forEach(function (id) {
    L.push("*if (prepared_" + id + ")");
    L.push("  *if (held_" + id + ")");
    L.push("    *set prepared_count + 1");
    L.push("  *else");
    L.push("    *set prepared_" + id + " false");
  });
  L.push("*return");
  L.push("");

  L.push("*comment PREPARE SET: carry one spell, or put it back. prepare_set \"magic_missile\" true. It refuses to carry what is not in the book, and refuses to go");
  L.push("*comment over prepared_max; prepare_result says what happened (\"set\", \"cleared\", \"not_held\", \"full\", \"no_preparation\"). The panel will call this and nothing else.");
  L.push("*label prepare_set");
  L.push("*params ps_id ps_on");
  L.push("*set prepare_result \"no_preparation\"");
  L.push("*if (class_prepares)");
  L.push("  *gosub prepare_count");
  L.push("  *set prepare_result \"not_held\"");
  ids.forEach(function (id) {
    L.push("  *if (ps_id = " + q(id) + ")");
    L.push("    *if (held_" + id + ")");
    L.push("      *if (ps_on)");
    L.push("        *if ((prepared_" + id + ") or (prepared_count < prepared_max))");
    L.push("          *set prepared_" + id + " true");
    L.push("          *set prepare_result \"set\"");
    L.push("        *else");
    L.push("          *set prepare_result \"full\"");
    L.push("      *else");
    L.push("        *set prepared_" + id + " false");
    L.push("        *set prepare_result \"cleared\"");
  });
  L.push("  *if ((prepare_result = \"set\") or (prepare_result = \"cleared\"))");
  L.push("    *gosub prepare_count");
  L.push("    *gosub refresh_known_spells");
  L.push("*return");
  L.push("");

  L.push("*comment PREPARE AUTO FILL: carry as much of the book as will fit, keeping whatever is already carried. This is what a long rest does while the player has no");
  L.push("*comment way to choose (restore_class_resources calls it), and what a newly learned spell does, so a caster is never left with an empty head. Once the book");
  L.push("*comment holds more than can be carried, this stops being the whole story and the choosing belongs to the player.");
  L.push("*label prepare_auto_fill");
  L.push("*gosub prepare_setup");
  L.push("*if (class_prepares)");
  L.push("  *gosub prepare_count");
  L.push("  *comment Carrying more than the cap allows is possible after the cap FALLS -- a lost level, a drained ability score, a change of class. Filling");
  L.push("  *comment cannot fix that, because it only ever adds, so an overfull head is emptied first and packed again from scratch.");
  L.push("  *if (prepared_count > prepared_max)");
  L.push("    *gosub prepare_clear");
  ids.forEach(function (id) {
    L.push("  *if (((not(prepared_" + id + ")) and (held_" + id + ")) and (prepared_count < prepared_max))");
    L.push("    *set prepared_" + id + " true");
    L.push("    *set prepared_count + 1");
  });
  L.push("  *gosub refresh_known_spells");
  L.push("*return");
  L.push("");
  // ---------------------------------------------------------------- copying a spell out of a scroll
  L.push("*comment BOOK FREE COUNT: how many empty slots one class book still has (book_free_count \"wizard_spell\" 12 -> book_room_left).");
  L.push("*label book_free_count");
  L.push("*params bf_prefix bf_cap");
  L.push("*temp bf_i 1");
  L.push("*temp bf_name \"\"");
  L.push("*set book_room_left 0");
  L.push("*label book_free_loop");
  L.push("*if (bf_i <= bf_cap)");
  L.push("  *set bf_name bf_prefix");
  L.push("  *if (bf_i > 1)");
  L.push("    *set bf_name ((bf_prefix & \"_\") & bf_i)");
  L.push("  *if ({(bf_name)} = \"none\")");
  L.push("    *set book_room_left + 1");
  L.push("  *set bf_i + 1");
  L.push("  *goto book_free_loop");
  L.push("*set book_room_left (book_room_left + 0)");
  L.push("*return");
  L.push("");

  L.push("*comment COPY BUDGET: training is a ditch, not a purse. training_sessions is the lifetime total and only ever grows -- the level-up gates read");
  L.push("*comment it, so copying must never touch it. training_spent_on_spells is what has been poured in, and what is left is the difference.");
  L.push("*label refresh_copy_budget");
  L.push("*set training_budget_left (training_sessions - training_spent_on_spells)");
  L.push("*if (training_budget_left < 0)");
  L.push("  *set training_budget_left 0");
  L.push("*set training_budget_left (training_budget_left + 0)");
  L.push("*return");
  L.push("");

  L.push("*comment SPELL DESC: the entry written into the book when a spell is copied in. Only a spell a COPYING class may learn needs one, since nothing");
  L.push("*comment else calls this. desc is usually one string, but a few spells (see spell_book.json's readme) are flavoured differently per class, so");
  L.push("*comment this branches on character_class ONLY for those -- descOf below picks the right one at generation time either way.");
  L.push("*label spell_desc");
  L.push("*params sd_id");
  L.push("*set spell_desc_text \"\"");
  ids.forEach(function (id) {
    var copyClasses = BOOK.learnable[id].lists.filter(function (c) { return copiers.indexOf(c) >= 0; });
    if (!copyClasses.length) return; // nobody who could copy this spell may learn it, so copy_spell never reaches it
    L.push("*if (sd_id = " + q(id) + ")");
    if (typeof BOOK.learnable[id].desc === "string") {
      L.push("  *set spell_desc_text " + q(descOf(id, copyClasses[0])));
    } else {
      copyClasses.forEach(function (c, i) {
        L.push("  " + (i === 0 ? "*if" : "*elseif") + " (character_class = " + q(c) + ")");
        L.push("    *set spell_desc_text " + q(descOf(id, c)));
      });
    }
  });
  L.push("*return");
  L.push("");

  L.push("*comment CAN COPY SPELL: may this character write this spell into their book, and what would it cost? Sets copy_result and copy_cost, and");
  L.push("*comment refreshes book_room_left and training_budget_left so a caller can show all of it at once. copy_result is one of:");
  L.push("*comment   ok                   it can be copied now, for copy_cost training sessions");
  L.push("*comment   not_your_book        this class does not copy spells (only a wizard keeps a book)");
  L.push("*comment   not_on_list          the spell is not one this class can learn");
  L.push("*comment   already_known        it is already written in the book");
  L.push("*comment   book_full            no empty slot left");
  L.push("*comment   not_enough_training  copy_cost is more training than training_budget_left");
  L.push("*label can_copy_spell");
  L.push("*params cc_id");
  L.push("*set copy_result \"not_your_book\"");
  L.push("*set copy_cost 0");
  L.push("*set book_room_left 0");
  L.push("*gosub refresh_copy_budget");
  copiers.forEach(function (c) {
    var mine = listOf(c);
    if (!mine.length) return;
    L.push("*if (character_class = " + q(c) + ")");
    L.push("  *gosub book_free_count " + q(prefix(c)) + " " + BOOK.classes[c].slots);
    L.push("  *set copy_result \"not_on_list\"");
    var byLevel = {};
    mine.forEach(function (id) {
      var lv = BOOK.learnable[id].level;
      byLevel[lv] = byLevel[lv] || [];
      byLevel[lv].push(id);
    });
    Object.keys(byLevel).sort(function (a, b) { return a - b; }).forEach(function (lvl) {
      // ChoiceScript takes binary operators two at a time: "a or b or c" is a parse error, so the chain is nested right to left.
      var test = byLevel[lvl].map(function (id) { return "(cc_id = " + q(id) + ")"; })
        .reduceRight(function (acc, one) { return acc === null ? one : "(" + one + " or " + acc + ")"; }, null);
      L.push("  *if " + (test.charAt(0) === "(" ? test : "(" + test + ")"));
      L.push("    *set copy_cost " + (Number(lvl) * COST_PER_LEVEL));
      L.push("    *set copy_result \"ok\"");
    });
  });
  L.push("*if (copy_result = \"ok\")");
  ids.forEach(function (id) {
    var copyable = BOOK.learnable[id].lists.some(function (c) { return copiers.indexOf(c) >= 0; });
    if (!copyable) return;
    L.push("  *if (cc_id = " + q(id) + ")");
    L.push("    *if (held_" + id + ")");
    L.push("      *set copy_result \"already_known\"");
  });
  L.push("*if (copy_result = \"ok\")");
  L.push("  *if (book_room_left < 1)");
  L.push("    *set copy_result \"book_full\"");
  L.push("*set copy_cost (copy_cost + 0)");
  L.push("*if (copy_result = \"ok\")");
  L.push("  *if (training_budget_left < copy_cost)");
  L.push("    *set copy_result \"not_enough_training\"");
  L.push("*return");
  L.push("");

  L.push("*comment COPY SPELL: write it in, and pour the training into the ditch. THE SCROLL IS NOT CONSUMED and no coin is spent (the user, 2026-11-04):");
  L.push("*comment the price is training already done, so a wizard still has reason to carry the scroll afterwards. copy_result ends as copied, or whatever");
  L.push("*comment can_copy_spell refused it for. learn_spell does the rest, including carrying the new spell today if there is room for it.");
  L.push("*label copy_spell");
  L.push("*params cs_id");
  L.push("*gosub can_copy_spell cs_id");
  L.push("*if (copy_result = \"ok\")");
  L.push("  *gosub spell_desc cs_id");
  L.push("  *gosub learn_spell character_class cs_id spell_desc_text");
  L.push("  *if (spell_learn_result = \"learned\")");
  L.push("    *set training_spent_on_spells (training_spent_on_spells + copy_cost)");
  L.push("    *gosub refresh_copy_budget");
  L.push("    *set copy_result \"copied\"");
  L.push("  *else");
  L.push("    *set copy_result \"book_full\"");
  L.push("*return");
  L.push("");

  L.push("*comment LEARN SPELL: puts a spell in the class's first free slot, with its description, then recomputes held_ and known_. A pick menu calls it and nothing else, for any level.");
  L.push("*comment learn_spell \"wizard\" \"magic_missile\" \"Magic Missile—three darts of force.\"   Output spell_learn_result: \"learned\", \"known\" (already in the book, nothing changed) or \"full\" (no free slot).");
  L.push("*comment Repeating a call changes nothing, so a page that replays it is safe.");
  L.push("*label learn_spell");
  L.push("*params ls_class ls_id ls_desc");
  L.push("*temp ls_cap 0");
  classes.forEach(function (c) {
    L.push("*if (ls_class = " + q(c) + ")");
    L.push("  *set ls_cap " + BOOK.classes[c].slots);
  });
  L.push("*temp ls_prefix (ls_class & \"_spell\")");
  L.push("*temp ls_i 1");
  L.push("*temp ls_name \"\"");
  L.push("*set spell_learn_result \"full\"");
  L.push("*label learn_spell_find");
  L.push("*if (ls_i <= ls_cap)");
  L.push("  *set ls_name ls_prefix");
  L.push("  *if (ls_i > 1)");
  L.push("    *set ls_name ((ls_prefix & \"_\") & ls_i)");
  L.push("  *if ({(ls_name)} = ls_id)");
  L.push("    *set spell_learn_result \"known\"");
  L.push("    *set ls_i ls_cap");
  L.push("  *set ls_i + 1");
  L.push("  *goto learn_spell_find");
  L.push("*set ls_i 1");
  L.push("*label learn_spell_place");
  L.push("*if ((ls_i <= ls_cap) and (spell_learn_result = \"full\"))");
  L.push("  *set ls_name ls_prefix");
  L.push("  *if (ls_i > 1)");
  L.push("    *set ls_name ((ls_prefix & \"_\") & ls_i)");
  L.push("  *if ({(ls_name)} = \"none\")");
  L.push("    *set {(ls_name)} ls_id");
  L.push("    *set {(ls_name & \"_desc\")} ls_desc");
  L.push("    *set spell_learn_result \"learned\"");
  L.push("  *set ls_i + 1");
  L.push("  *goto learn_spell_place");
  L.push("*if (spell_learn_result = \"learned\")");
  L.push("  *gosub refresh_known_spells");
  L.push("  *comment A newly learned spell is carried straight away if there is room, so learning something never leaves a caster unable to cast it.");
  L.push("  *gosub prepare_auto_fill");
  L.push("*return");
  return L;
}

// ---------------------------------------------------------------- spell_book_creates
function genCreates() {
  var L = [
    "*comment Slots 2 and up of each class's leveled spells, with the flags learn_spell and refresh_known_spells keep. Slot 1 is created with the class above. Generated by tools/gen_spell_book.js from tools/spell_book.json.",
    "*create spell_learn_result \"none\"",
    "*comment PREPARATION: class_prepares says whether this character chooses a set each morning (a wizard) or simply knows their spells (a bard, warlock,",
    "*comment ranger). prepared_max is how many may be carried, prepared_count how many are, and prepared_<id> which. See tools/spell_book.json.",
    "*create class_prepares false",
    "*create prepared_max 0",
    "*create prepared_count 0",
    "*create prepare_result \"none\"",
    "*comment COPYING A SCROLL INTO THE BOOK: training_spent_on_spells is the water in the ditch that training_sessions digs. It only ever grows, and",
    "*comment training_sessions is never touched by copying, so level-up progress is untouched. See tools/spell_book.json.",
    "*create class_copies false",
    "*create training_spent_on_spells 0",
    "*create training_budget_left 0",
    "*create copy_result \"none\"",
    "*create copy_cost 0",
    "*create book_room_left 0",
    "*create spell_desc_text \"\"",
    "*comment The spellbook panel sets these two, then runs the one-shot codex_prepare_now (choicescript_stats.txt) through quietRun, so a spell can be",
    "*comment carried or put back without the page behind the open book turning.",
    "*create prepare_target_id \"none\"",
    "*create prepare_target_on false",
    "*create copy_target_id \"none\""
  ];
  ids.forEach(function (id) { L.push("*create prepared_" + id + " false"); });
  ids.forEach(function (id) { L.push("*create held_" + id + " false"); });
  L.push("*comment known_<id> for every spell on SOME class's list -- cantrips are not here (they are hand-written: CANTRIP_SLOTS has no tools/spell_book.json entry). Set true by refresh_known_spells, never by hand.");
  ids.forEach(function (id) { L.push("*create known_" + id + " false"); });
  L.push("*comment <class>_spell_1 is never used: slot 1 is the bare <class>_spell. The quicktest walker forces every *if both ways, so the slot-name code in book_scan and learn_spell builds this name once with slot 1, and it needs something to read.");
  classes.forEach(function (c) {
    L.push("*create " + prefix(c) + "_1 \"none\"");
    L.push("*create " + prefix(c) + "_1_desc \"unused\"");
  });
  classes.forEach(function (c) {
    for (var i = 2; i <= BOOK.classes[c].slots; i++) {
      L.push("*create " + slotVar(c, i) + " \"none\"");
      L.push("*create " + slotVar(c, i) + "_desc " + q(BOOK.classes[c].empty));
    }
  });
  return L;
}

// ---------------------------------------------------------------- spell_book_cards
function genCards() {
  return classes.map(function (c) { return "*gosub book_print_cards " + q(prefix(c)) + " " + BOOK.classes[c].slots; });
}

// ---------------------------------------------------------------- pick menus (prologue/class_select.txt, character_progression.txt)
// Every "choose a spell" *choice a player sees, generated from spell_book.json so a new spell never needs a hand-edited menu
// (see the readme's PICK MENUS section). Each option is guarded by `not(held_<id>))`, plus a `not(race = "<r>"))` for every
// race_exclude -- always, regardless of where the option falls in a sequence, so a spell a race already grants innately
// (Hex and Disguise Self, for a hexblood) is correctly never offered without the menu needing to know that separately.
// guardFor returns that boolean expression; MENUS below says which marker gets which class, in which file, in which format.
function andAll(parts) { return parts.length === 1 ? parts[0] : parts.reduceRight(function (acc, p) { return acc === null ? p : "(" + p + " and " + acc + ")"; }, null); }
function orAll(parts) { return parts.length === 1 ? parts[0] : parts.reduceRight(function (acc, p) { return acc === null ? p : "(" + p + " or " + acc + ")"; }, null); }
function guardFor(id) {
  var parts = ["not(held_" + id + ")"];
  (BOOK.learnable[id].race_exclude || []).forEach(function (r) { parts.push("not(race = " + q(r) + ")"); });
  return andAll(parts);
}
// The complement of guardFor: true when this spell could NOT be offered (already held, or excluded for this character's
// race) -- held OR (for each race_exclude) race = r, by De Morgan's rather than a doubled not(not(...)) that would just
// read as noise on held_<id> alone.
function cannotOfferFor(id) {
  var parts = ["held_" + id];
  // Each operand an `or` combines must be a complete, self-contained expression, so a bare comparison
  // needs its own parens -- `(race = "x") or held_y` parses, `race = "x" or held_y` does not (ChoiceScript
  // read it as `(... or race) = "x"` and choked on race's string value where a boolean was expected).
  (BOOK.learnable[id].race_exclude || []).forEach(function (r) { parts.push("(race = " + q(r) + ")"); });
  return orAll(parts);
}
// format "A" (prologue/class_select.txt, creation): "# [b]Name[/b]: pitch[@hint]", falls through, no *goto.
// format "B" (character_progression.txt, level-up): "# Name. pitch@{show_stat_hints  [hint or "Spell: Name"]|}", always a *goto.
function genPickMenu(cfg) {
  var cls = cfg.cls, pool = listOf(cls), L = [];
  pool.forEach(function (id) {
    var sp = BOOK.learnable[id];
    L.push("*if (" + guardFor(id) + ")");
    if (cfg.format === "A") {
      var tagA = sp.hint ? ("@{show_stat_hints  [" + sp.hint + "]|}") : "";
      L.push("  # [b]" + sp.name + "[/b]: " + sp.pitch + tagA);
      L.push("    *gosub_scene character_progression learn_spell " + q(cls) + " " + q(id) + " " + q(descOf(id, cls)));
    } else {
      var tagB = "@{show_stat_hints  [" + (sp.hint || ("Spell: " + sp.name)) + "]|}";
      L.push("  # " + sp.name + ". " + sp.pitch + tagB);
      L.push("    *gosub_scene character_progression learn_spell " + q(cls) + " " + q(id) + " " + q(descOf(id, cls)));
      L.push("    *goto " + cfg.goto);
    }
  });
  // A fallback, guarded to show ONLY when nothing else in the pool could be offered (every spell is either held, or
  // excluded for this character's race) -- the complement of every guard above, ANDed together -- so a *choice can never
  // resolve to zero visible options as the list grows, without an always-visible "skip" button showing up alongside real
  // choices the rest of the time.
  var noneLeft = andAll(pool.map(cannotOfferFor));
  L.push("*if (" + noneLeft + ")");
  L.push("  # You have learned all you can for now.");
  if (cfg.format === "B") L.push("    *goto " + cfg.goto);
  return L;
}
// The manifest: marker name -> {file, cls, format, goto}. This is scene WIRING (which label a menu's *goto needs), not spell
// data, so it lives here as code rather than in spell_book.json. Every entry's pool is listOf(cls) -- the class's full list --
// per the readme: there is no notion of a menu offering only part of a class's book.
var CLASS_SELECT = path.join(SCENES, "prologue", "class_select.txt");
var PROGRESSION_FILE = path.join(SCENES, "character_progression.txt");
var MENUS = [
  { marker: "bard_create_1", file: CLASS_SELECT, cls: "bard", format: "A" },
  { marker: "bard_create_2", file: CLASS_SELECT, cls: "bard", format: "A" },
  { marker: "bard_create_3", file: CLASS_SELECT, cls: "bard", format: "A" },
  { marker: "bard_create_4", file: CLASS_SELECT, cls: "bard", format: "A" },
  { marker: "wizard_create_1", file: CLASS_SELECT, cls: "wizard", format: "A" },
  { marker: "wizard_create_2", file: CLASS_SELECT, cls: "wizard", format: "A" },
  { marker: "wizard_create_3", file: CLASS_SELECT, cls: "wizard", format: "A" },
  { marker: "wizard_create_4", file: CLASS_SELECT, cls: "wizard", format: "A" },
  { marker: "warlock_create_1", file: CLASS_SELECT, cls: "warlock", format: "A" },
  { marker: "warlock_create_2", file: CLASS_SELECT, cls: "warlock", format: "A" },
  { marker: "bard_lvl2_pick", file: PROGRESSION_FILE, cls: "bard", format: "B", goto: "level_up_bard_2_done" },
  { marker: "ranger_lvl2_pick_1", file: PROGRESSION_FILE, cls: "ranger", format: "B", goto: "level_up_ranger_2_second" },
  { marker: "ranger_lvl2_pick_2", file: PROGRESSION_FILE, cls: "ranger", format: "B", goto: "level_up_ranger_2_style" },
  { marker: "warlock_lvl2_pick", file: PROGRESSION_FILE, cls: "warlock", format: "B", goto: "level_up_warlock_2_done" }
];

// ---------------------------------------------------------------- spell_book_js_slots
// The panel in web/mygame/spell-data.js reads a spell id straight out of window.stats by field name, so it needs the
// same slot names the *create block makes. One line per class keeps a diff readable when a class gains slots.
function genJsSlots() {
  var L = ["var BOOK_SLOTS = ["];
  classes.forEach(function (c, ci) {
    var names = [];
    for (var i = 1; i <= BOOK.classes[c].slots; i++) names.push(q(slotVar(c, i)));
    L.push("  " + names.join(", ") + (ci === classes.length - 1 ? "" : ","));
  });
  L.push("];");
  return L;
}

// ---------------------------------------------------------------- spell_book_js_copy
// The panel shows which scrolls in the pack could be copied, and what each would cost. It DECIDES nothing: copy_spell re-checks every
// rule in ChoiceScript. This is display data only, generated from the same file the rule is generated from, so the two cannot drift.
function genJsCopy() {
  var scrolls = scrollMap();
  var L = [];
  L.push("// Which classes may learn each spell, from tools/spell_book.json. The pick menus and the copying rule read the same lists.");
  L.push("var SPELL_LISTS = {");
  L.push(ids.map(function (id) { return "    " + JSON.stringify(id) + ": " + JSON.stringify(BOOK.learnable[id].lists); }).join(",\n"));
  L.push("  };");
  L.push("var SPELL_LEVELS = {");
  L.push(ids.map(function (id) { return "    " + JSON.stringify(id) + ": " + BOOK.learnable[id].level; }).join(",\n"));
  L.push("  };");
  L.push("// A scroll an item grants, keyed by the spell it carries (from tools/gear_catalog.json effect.spell). A spell with no scroll");
  L.push("// simply never appears among the loose leaves.");
  L.push("var SPELL_SCROLLS = {");
  L.push(Object.keys(scrolls).sort().map(function (sp) { return "    " + JSON.stringify(sp) + ": " + JSON.stringify(scrolls[sp]); }).join(",\n"));
  L.push("  };");
  L.push("var COPY_COST_PER_LEVEL = " + COST_PER_LEVEL + ";");
  L.push("var COPY_CLASSES = " + JSON.stringify(copiers) + ";");
  return L;
}

// ---------------------------------------------------------------- marker block replacement (see gen_spells.js)
var pending = {};
function fileText(file) { return pending[file] !== undefined ? pending[file] : fs.readFileSync(file, "utf8"); }
function markerIndex(rows, kind, name) {
  var tag = "GEN:" + kind + " " + name;
  for (var i = 0; i < rows.length; i++) {
    // A marker is a comment in whatever language the file is written in: *comment in a scene, // in spell-data.js.
    var body = rows[i].replace(/^\s*(?:\*comment|\/\/)\s+/, "").trim();
    if (body === tag || body.indexOf(tag + " ") === 0) return i;
  }
  return -1;
}
function setRegion(file, name, lines) {
  var text = fileText(file);
  var eol = text.indexOf("\r\n") !== -1 ? "\r\n" : "\n";
  var rows = text.split(eol);
  var b = markerIndex(rows, "BEGIN", name);
  var e = markerIndex(rows, "END", name);
  if (b < 0) throw new Error(path.basename(file) + ": missing marker  GEN:BEGIN " + name);
  if (e < 0 || e < b) throw new Error(path.basename(file) + ": missing marker  GEN:END " + name);
  var indent = rows[b].slice(0, rows[b].length - rows[b].trimLeft().length);
  var body = lines.map(function (l) { return l.length ? indent + l : l; });
  pending[file] = rows.slice(0, b + 1).concat(body, rows.slice(e)).join(eol);
}

var PROGRESSION = PROGRESSION_FILE;
setRegion(PROGRESSION, "spell_book_refresh", genRefresh());
setRegion(PROGRESSION, "spell_book_subs", genSubs());
setRegion(path.join(SCENES, "startup_parts", "02_character_profile.txt"), "spell_book_creates", genCreates());
setRegion(path.join(SCENES, "choicescript_stats.txt"), "spell_book_cards", genCards());
MENUS.forEach(function (m) { setRegion(m.file, m.marker, genPickMenu(m)); });
setRegion(path.join(ROOT, "web", "mygame", "spell-data.js"), "spell_book_js_slots", genJsSlots());
setRegion(path.join(ROOT, "web", "mygame", "spell-data.js"), "spell_book_js_copy", genJsCopy());

// ---------------------------------------------------------------- write or check
var stale = [];
Object.keys(pending).forEach(function (p) {
  var current = fs.readFileSync(p, "utf8");
  if (current !== pending[p]) {
    stale.push(path.relative(ROOT, p));
    if (!CHECK) fs.writeFileSync(p, pending[p]);
  }
});
if (CHECK) {
  if (stale.length) { console.error("gen_spell_book: generated blocks are stale in:\n  " + stale.join("\n  ") + "\nRun: node tools/gen_spell_book.js"); process.exit(1); }
  console.log("gen_spell_book: all generated blocks are up to date (" + ids.length + " spells, " + classes.length + " classes).");
} else {
  console.log("gen_spell_book: " + ids.length + " spells, " + classes.length + " classes; " + (stale.length ? "rewrote " + stale.join(", ") : "nothing changed") + ".");
}
