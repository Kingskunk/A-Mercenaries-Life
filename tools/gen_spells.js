#!/usr/bin/env node
/*
 * gen_spells.js -- generates the spell REACH TAG lookup from tools/spell_book.json (cantrips + reach-tagged learnable spells).
 *
 * WHY: a spell's reach used to be implied by whatever its call site happened to hard-code, so adding a
 * cantrip meant remembering which of several sites needed a matching condition -- and forgetting one
 * silently applied the wrong rule. The tag now lives in spell_book.json once, and this writes the lookup that
 * resolves it from `check_skill`, the variable every attack option already sets before it rolls.
 *
 * The tag answers two separate questions, and combat.txt asks them separately:
 *   spell_in_range  -- can the caster reach the target at all? (close/touch cannot)
 *   spell_disadv    -- is the shot spoiled by a hostile in reach? (ranged only, while ANY enemy is Engaged with the caster)
 * Collapsing those is a real bug: a touch spell at Mid-Range must be UNAVAILABLE, not offered at
 * disadvantage.
 *
 * HOW: the same GEN:BEGIN/GEN:END marker-block replacement gen_gear.js uses (see its header), so a block
 * is never hand-edited -- the next run overwrites it. Indentation is taken from the BEGIN line.
 *
 * It also writes web/mygame/spell-reach.generated.js, the same reach classes for the page (the battle stage's reach preview).
 *
 * Usage: node tools/gen_spells.js [--check]      --check exits 1 if any block is stale (for lint/CI)
 */
"use strict";
var fs = require("fs");
var path = require("path");

var ROOT = path.join(__dirname, "..");
var SCENES = path.join(ROOT, "web", "mygame", "scenes");
var BOOK = JSON.parse(fs.readFileSync(path.join(__dirname, "spell_book.json"), "utf8"));
var CHECK = process.argv.indexOf("--check") !== -1;

var cantrips = BOOK.cantrips || {};
var learnable = BOOK.learnable || {};
var spells = [];
Object.keys(cantrips).forEach(function (id) {
  if (Object.prototype.hasOwnProperty.call(learnable, id)) {
    throw new Error("spell id '" + id + "' appears in both cantrips and learnable");
  }
  var c = cantrips[id];
  if (c && Object.prototype.hasOwnProperty.call(c, "range")) {
    spells.push({ id: id, name: c.name, range: c.range, reach: c.reach });
  }
});
Object.keys(learnable).forEach(function (id) {
  var l = learnable[id];
  if (l && Object.prototype.hasOwnProperty.call(l, "range")) {
    spells.push({ id: id, name: l.name, range: l.range, reach: l.reach });
  }
});
var VALID_RANGES = { ranged: true, close: true, touch: true };
var VALID_REACH = { touch: true, short: true, medium: true, long: true };
// The reach class of a spell (see spell_book.json's readme): a touch-tagged spell is always touch, anything else defaults to long.
function reachOf(s) { return s.range === "touch" ? "touch" : (s.reach || "long"); }

var seenId = {};
spells.forEach(function (s) {
  ["id", "name", "range"].forEach(function (k) {
    if (!s[k]) throw new Error("spell " + (s.id || "?") + " needs field: " + k);
  });
  if (seenId[s.id]) throw new Error("duplicate spell id: " + s.id);
  seenId[s.id] = true;
  if (s.reach && !VALID_REACH[s.reach]) throw new Error("spell '" + s.id + "' has reach '" + s.reach + "'; must be touch | short | medium | long");
  if (!VALID_RANGES[s.range]) {
    throw new Error("spell '" + s.id + "' has range '" + s.range + "'; must be ranged | close | touch");
  }
});
// Names are the lookup key (check_skill is set to the display name), so a duplicate would silently make one
// spell unreachable behind the other. Cheap to catch here, expensive to debug in play.
var seenName = {};
spells.forEach(function (s) {
  if (seenName[s.name]) throw new Error("duplicate spell name (lookup key): '" + s.name + "' on " + s.id + " and " + seenName[s.name]);
  seenName[s.name] = s.id;
});


// A ChoiceScript string literal (JSON.stringify's escaping matches what ChoiceScript wants).
function q(s) { return JSON.stringify(String(s)); }

// The three *temp outputs every caller reads, written out to durable *set names so a caller's option body
// can read them after the lookup label has returned.
function genLookup() {
  var L = [
    "*temp spell_range_tag \"ranged\"",
    "*temp spell_in_range true",
    "*temp spell_disadv false",
    "*comment Read the TARGET's live distance, not the shared combat_enemy_range scratch. fight_round_hub calls",
    "*comment fight_pick_target (setting combat_active_target) but not fight_sync_target_in, so that scratch is",
    "*comment STALE at menu-build time -- a fight opened at Long Range still read 0 on its first page. The option",
    "*comment bodies below call fight_pick_target first, so combat_active_target is the slot this cast will hit;",
    "*comment combat_target_range is that slot's own range, computed fresh in the hub (see the block above the",
    "*comment *choice). The scratch is only the fallback for a call made before the hub has run.",
    "*temp spell_range_at combat_enemy_range",
    "*if (combat_target_range >= 0)",
    "  *set spell_range_at combat_target_range"
  ];
  spells.forEach(function (s) {
    L.push("*if (check_skill = " + q(s.name) + ")");
    L.push("  *set spell_range_tag " + q(s.range));
  });
  // Reach class: out of reach is UNAVAILABLE (spell_in_range false), never a penalty. Touch is covered by its range tag just below.
  spells.forEach(function (s) {
    var r = reachOf(s);
    if (r === "short" || r === "medium") {
      L.push("*if (check_skill = " + q(s.name) + ")");
      L.push("  *if (spell_range_at > " + (r === "short" ? "1" : "combat_reach_medium") + ")");
      L.push("    *set spell_in_range false");
    }
  });
  L.push("*if (spell_range_tag = \"close\")");
  L.push("  *if (spell_range_at <= 0)");
  L.push("    *set spell_in_range false");
  L.push("*if (spell_range_tag = \"touch\")");
  L.push("  *if (spell_range_at > 0)");
  L.push("    *set spell_in_range false");
  L.push("*if (spell_range_tag = \"ranged\")");
  L.push("  *gosub_scene combat_movement combat_check_engaged");
  L.push("  *if (combat_any_engaged)");
  L.push("    *set spell_disadv true");
  L.push("*set spell_reach_result spell_in_range");
  L.push("*set spell_penalty_result spell_disadv");
  return L;
}

// ---------------------------------------------------------------- marker block replacement (see gen_gear.js)
var pending = {};
function fileText(file) {
  if (pending[file] !== undefined) return pending[file];
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
}
function eolOf(text) { return text.indexOf("\r\n") >= 0 ? "\r\n" : "\n"; }
function markerIndex(rows, kind, name) {
  var tag = "GEN:" + kind + " " + name;
  for (var i = 0; i < rows.length; i++) {
    var body = rows[i].replace(/^\s*\*comment\s+/, "").replace(/^\s*\/\/\s+/, "").trim();
    if (body === tag || body.indexOf(tag + " ") === 0) return i;
  }
  return -1;
}
function setRegion(file, name, lines) {
  var raw = fileText(file);
  var eol = eolOf(raw);
  var rows = raw.split(/\r?\n/);
  var b = markerIndex(rows, "BEGIN", name);
  var e = markerIndex(rows, "END", name);
  if (b < 0) throw new Error(path.basename(file) + ": missing marker  GEN:BEGIN " + name);
  if (e < 0 || e < b) throw new Error(path.basename(file) + ": missing marker  GEN:END " + name);
  var indent = rows[b].slice(0, rows[b].length - rows[b].trimLeft().length);
  var body = lines.map(function (l) { return l.length ? indent + l : l; });
  pending[file] = rows.slice(0, b + 1).concat(body, rows.slice(e)).join(eol);
}

// One flag per spell for the hub to gate its option on: can ANY living enemy be reached by this spell right now? The class flags
// (combat_in_short, combat_in_medium) and combat_melee_reach are worked out by hand in the hub just above the block.
function genReachFlags() {
  var L = [];
  spells.forEach(function (s) {
    var r = reachOf(s);
    var flag = r === "touch" ? "combat_melee_reach" : (r === "short" ? "combat_in_short" : (r === "medium" ? "combat_in_medium" : "combat_in_long"));
    L.push("*temp spell_reach_ok_" + s.id + " " + flag);
  });
  return L;
}
// ---------------------------------------------------------------- combat facts lookup (combat_spells.txt)
// Writes *label spell_facts_load <id> from every spell in cantrips/learnable that carries a "combat" block.
// Strict parsing: any malformed dice string, mismatched upcast sides, or unknown combat field throws an Error.
var VALID_COST = { action: true, bonus: true, reaction: true, minute: true };
var VALID_RES = { attack: true, save: true, auto: true, heal: true, effect: true };
var VALID_ABILITY = { strength: true, dexterity: true, constitution: true, intelligence: true, wisdom: true, charisma: true };
var KNOWN_COMBAT_KEYS = {
  cost: true, slot_level: true, resolution: true, duration: true, area: true, effect: true,
  attack_kind: true, damage_dice: true, damage_type: true, add_casting_mod: true,
  save_ability: true, half_on_save: true, cantrip_scale: true, base_move_dice: true,
  upcast: true, temp_hp_flat: true, damage_flat: true, heal_dice: true,
  temp_hp_dice: true, projectiles: true
};
var KNOWN_UPCAST_KEYS = { damage_dice: true, projectiles: true, targets: true, temp_hp_flat: true };

function parseDice(expr, ctx) {
  if (typeof expr !== "string") throw new Error(ctx + ": expected NdM dice string, got " + JSON.stringify(expr));
  var m = /^(\d+)d(\d+)$/.exec(expr.trim());
  if (!m) throw new Error(ctx + ": unreadable dice string " + JSON.stringify(expr));
  var count = Number(m[1]), sides = Number(m[2]);
  if (!Number.isInteger(count) || count < 1 || !Number.isInteger(sides) || sides < 1) {
    throw new Error(ctx + ": invalid dice bounds in " + JSON.stringify(expr));
  }
  return { count: count, sides: sides };
}
function checkIntMin(val, min, ctx) {
  if (typeof val !== "number" || !Number.isInteger(val) || val < min) {
    throw new Error(ctx + ": expected integer >= " + min + ", got " + JSON.stringify(val));
  }
}

var combatSpells = [];
function collectCombatSpell(id, sp, expectedLevel) {
  if (!sp || !sp.combat) return;
  var c = sp.combat;
  if (!sp.name) throw new Error("spell '" + id + "' is missing name");
  if (typeof c !== "object" || Array.isArray(c)) throw new Error("spell '" + id + "' combat must be an object");
  Object.keys(c).forEach(function (k) {
    if (!KNOWN_COMBAT_KEYS[k]) throw new Error("spell '" + id + "' combat has unknown field '" + k + "'");
  });
  if (!VALID_COST[c.cost]) throw new Error("spell '" + id + "' has invalid combat.cost " + JSON.stringify(c.cost));
  if (!VALID_RES[c.resolution]) throw new Error("spell '" + id + "' has invalid combat.resolution " + JSON.stringify(c.resolution));
  checkIntMin(c.slot_level, 0, "spell '" + id + "' combat.slot_level");
  if (c.slot_level !== expectedLevel) {
    throw new Error("spell '" + id + "' combat.slot_level (" + c.slot_level + ") !== expected level (" + expectedLevel + ")");
  }
  if (c.save_ability !== undefined && !VALID_ABILITY[c.save_ability]) {
    throw new Error("spell '" + id + "' has invalid combat.save_ability " + JSON.stringify(c.save_ability));
  }
  if (c.half_on_save !== undefined && typeof c.half_on_save !== "boolean") {
    throw new Error("spell '" + id + "' combat.half_on_save must be boolean");
  }
  if (c.add_casting_mod !== undefined && typeof c.add_casting_mod !== "boolean") {
    throw new Error("spell '" + id + "' combat.add_casting_mod must be boolean");
  }
  if (c.damage_type !== undefined && (typeof c.damage_type !== "string" || !c.damage_type)) {
    throw new Error("spell '" + id + "' combat.damage_type must be a non-empty string");
  }
  if (c.damage_dice !== undefined && c.heal_dice !== undefined) {
    throw new Error("spell '" + id + "' has both combat.damage_dice and combat.heal_dice");
  }
  var baseDice = { count: 0, sides: 0 };
  if (c.damage_dice !== undefined) baseDice = parseDice(c.damage_dice, "spell '" + id + "' combat.damage_dice");
  else if (c.heal_dice !== undefined) baseDice = parseDice(c.heal_dice, "spell '" + id + "' combat.heal_dice");
  var tempHpDice = { count: 0, sides: 0 };
  if (c.temp_hp_dice !== undefined) tempHpDice = parseDice(c.temp_hp_dice, "spell '" + id + "' combat.temp_hp_dice");
  // A cantrip that grows with character level: the dice it rolls at level 1 and a list of tiers, each a level and the dice that replace them from then on.
  // kinds: hit = a rider on the weapon hit, move = damage when the sheathed target moves, extra = extra dice added to the hit.
  var scale = { sides: { hit: 0, move: 0, extra: 0 }, base: { hit: 0, move: 0, extra: 0 }, tiers: [] };
  var SCALE_KEYS = { hit: "on_hit_dice", move: "on_move_dice", extra: "extra_dice" };
  if (c.base_move_dice !== undefined) {
    var bm = parseDice(c.base_move_dice, "spell '" + id + "' combat.base_move_dice");
    scale.base.move = bm.count;
    scale.sides.move = bm.sides;
  }
  if (c.cantrip_scale !== undefined) {
    if (typeof c.cantrip_scale !== "object" || Array.isArray(c.cantrip_scale)) {
      throw new Error("spell '" + id + "' combat.cantrip_scale must be an object");
    }
    Object.keys(c.cantrip_scale).forEach(function (lvl) {
      var tier = c.cantrip_scale[lvl];
      if (!tier || typeof tier !== "object") throw new Error("spell '" + id + "' cantrip_scale[" + lvl + "] must be an object");
      if (!/^[1-9][0-9]*$/.test(lvl)) throw new Error("spell '" + id + "' cantrip_scale level '" + lvl + "' must be a whole number");
      var entry = { level: Number(lvl), count: {} };
      Object.keys(SCALE_KEYS).forEach(function (kind) {
        var dk = SCALE_KEYS[kind];
        if (tier[dk] === undefined) return;
        var d = parseDice(tier[dk], "spell '" + id + "' cantrip_scale." + lvl + "." + dk);
        if (scale.sides[kind] > 0 && scale.sides[kind] !== d.sides) {
          throw new Error("spell '" + id + "' cantrip_scale." + dk + " changes die size between tiers");
        }
        scale.sides[kind] = d.sides;
        entry.count[kind] = d.count;
      });
      scale.tiers.push(entry);
    });
    scale.tiers.sort(function (a, b) { return a.level - b.level; });
  }
  var flat = 0;
  if (c.damage_flat !== undefined) {
    checkIntMin(c.damage_flat, 0, "spell '" + id + "' combat.damage_flat");
    flat = c.damage_flat;
  }
  if (c.temp_hp_flat !== undefined) checkIntMin(c.temp_hp_flat, 0, "spell '" + id + "' combat.temp_hp_flat");
  var projectiles = 0;
  if (c.projectiles !== undefined) {
    checkIntMin(c.projectiles, 1, "spell '" + id + "' combat.projectiles");
    projectiles = c.projectiles;
  }
  var upcastDice = 0, upcastProjectiles = 0, upcastTempHp = 0;
  if (c.upcast !== undefined) {
    if (typeof c.upcast !== "object" || Array.isArray(c.upcast)) {
      throw new Error("spell '" + id + "' combat.upcast must be an object");
    }
    Object.keys(c.upcast).forEach(function (uk) {
      if (!KNOWN_UPCAST_KEYS[uk]) throw new Error("spell '" + id + "' combat.upcast has unknown field '" + uk + "'");
    });
    if (c.upcast.damage_dice !== undefined) {
      var ud = parseDice(c.upcast.damage_dice, "spell '" + id + "' combat.upcast.damage_dice");
      if (baseDice.sides > 0 && ud.sides !== baseDice.sides) {
        throw new Error("spell '" + id + "' combat.upcast.damage_dice sides (" + ud.sides + ") !== base sides (" + baseDice.sides + ")");
      }
      upcastDice = ud.count;
    }
    if (c.upcast.projectiles !== undefined) {
      checkIntMin(c.upcast.projectiles, 1, "spell '" + id + "' combat.upcast.projectiles");
      upcastProjectiles = c.upcast.projectiles;
    }
    if (c.upcast.targets !== undefined) checkIntMin(c.upcast.targets, 1, "spell '" + id + "' combat.upcast.targets");
    if (c.upcast.temp_hp_flat !== undefined) {
      checkIntMin(c.upcast.temp_hp_flat, 0, "spell '" + id + "' combat.upcast.temp_hp_flat");
      upcastTempHp = c.upcast.temp_hp_flat;
    }
  }
  combatSpells.push({
    id: id,
    name: sp.name,
    resolution: c.resolution,
    save_ability: c.save_ability || "",
    half_on_save: Boolean(c.half_on_save),
    dice_count: baseDice.count,
    dice_sides: baseDice.sides,
    flat: flat,
    dmg_type: c.damage_type || "",
    add_mod: Boolean(c.add_casting_mod),
    slot_level: c.slot_level,
    upcast_dice: upcastDice,
    projectiles: projectiles,
    upcast_projectiles: upcastProjectiles,
    temp_hp_count: tempHpDice.count,
    temp_hp_sides: tempHpDice.sides,
    temp_hp_flat: c.temp_hp_flat || 0,
    upcast_temp_hp: upcastTempHp,
    scale: scale
  });
}
Object.keys(cantrips).forEach(function (id) { collectCombatSpell(id, cantrips[id], 0); });
Object.keys(learnable).forEach(function (id) { collectCombatSpell(id, learnable[id], learnable[id].level); });

function genFactsLookup() {
  var L = [
    "*comment Generated by tools/gen_spells.js from tools/spell_book.json -- do not edit inside this block.",
    "*label spell_facts_load",
    "*params sfl_id",
    "*set spell_fact_found false",
    "*set spell_fact_name \"\"",
    "*set spell_fact_resolution \"\"",
    "*set spell_fact_save_ability \"\"",
    "*set spell_fact_half_on_save false",
    "*set spell_fact_dice_count 0",
    "*set spell_fact_dice_sides 0",
    "*set spell_fact_flat 0",
    "*set spell_fact_dmg_type \"\"",
    "*set spell_fact_add_mod false",
    "*set spell_fact_slot_level 0",
    "*set spell_fact_upcast_dice 0",
    "*set spell_fact_projectiles 0",
    "*set spell_fact_upcast_projectiles 0",
    "*set spell_fact_temp_hp_count 0",
    "*set spell_fact_temp_hp_sides 0",
    "*set spell_fact_temp_hp_flat 0",
    "*set spell_fact_upcast_temp_hp 0",
    "*set spell_fact_hit_count 0",
    "*set spell_fact_hit_sides 0",
    "*set spell_fact_move_count 0",
    "*set spell_fact_move_sides 0",
    "*set spell_fact_extra_count 0",
    "*set spell_fact_extra_sides 0"
  ];
  combatSpells.forEach(function (s) {
    L.push("*if (sfl_id = " + q(s.id) + ")");
    L.push("  *set spell_fact_found true");
    L.push("  *set spell_fact_name " + q(s.name));
    L.push("  *set spell_fact_resolution " + q(s.resolution));
    if (s.save_ability) L.push("  *set spell_fact_save_ability " + q(s.save_ability));
    if (s.half_on_save) L.push("  *set spell_fact_half_on_save true");
    if (s.dice_count > 0) L.push("  *set spell_fact_dice_count " + s.dice_count);
    if (s.dice_sides > 0) L.push("  *set spell_fact_dice_sides " + s.dice_sides);
    if (s.flat > 0) L.push("  *set spell_fact_flat " + s.flat);
    if (s.dmg_type) L.push("  *set spell_fact_dmg_type " + q(s.dmg_type));
    if (s.add_mod) L.push("  *set spell_fact_add_mod true");
    if (s.slot_level > 0) L.push("  *set spell_fact_slot_level " + s.slot_level);
    if (s.upcast_dice > 0) L.push("  *set spell_fact_upcast_dice " + s.upcast_dice);
    if (s.projectiles > 0) L.push("  *set spell_fact_projectiles " + s.projectiles);
    if (s.upcast_projectiles > 0) L.push("  *set spell_fact_upcast_projectiles " + s.upcast_projectiles);
    if (s.temp_hp_count > 0) L.push("  *set spell_fact_temp_hp_count " + s.temp_hp_count);
    if (s.temp_hp_sides > 0) L.push("  *set spell_fact_temp_hp_sides " + s.temp_hp_sides);
    if (s.temp_hp_flat > 0) L.push("  *set spell_fact_temp_hp_flat " + s.temp_hp_flat);
    if (s.upcast_temp_hp > 0) L.push("  *set spell_fact_upcast_temp_hp " + s.upcast_temp_hp);
    // Cantrip scaling: the counts that hold at the caster's character level, worked out here from the tiers.
    ["hit", "move", "extra"].forEach(function (kind) {
      if (s.scale.sides[kind] > 0) L.push("  *set spell_fact_" + kind + "_sides " + s.scale.sides[kind]);
      if (s.scale.base[kind] > 0) L.push("  *set spell_fact_" + kind + "_count " + s.scale.base[kind]);
    });
    s.scale.tiers.forEach(function (t) {
      var kinds = Object.keys(t.count);
      if (!kinds.length) return;
      L.push("  *if (character_level >= " + t.level + ")");
      kinds.forEach(function (kind) { L.push("    *set spell_fact_" + kind + "_count " + t.count[kind]); });
    });
  });
  L.push("*return");
  return L;
}

setRegion(path.join(SCENES, "combat.txt"), "spell_range_lookup", genLookup());
setRegion(path.join(SCENES, "combat.txt"), "spell_reach_flags", genReachFlags());
setRegion(path.join(SCENES, "combat_spells.txt"), "spell_facts_lookup", genFactsLookup());

// The same reach classes for the page: the battle stage (index.html) tints the tiles a spell can reach while its HUD slot is hovered.
// A whole generated file, keyed by the HUD's slot id (the spell's id is the slug of its display name).
(function () {
  var map = {};
  spells.forEach(function (s) { map[s.id] = reachOf(s); });
  var reachFile = path.join(ROOT, "web", "mygame", "spell-reach.generated.js");
  var reachEol = fs.existsSync(reachFile) ? eolOf(fs.readFileSync(reachFile, "utf8")) : "\n";
  pending[reachFile] = [
    "// GENERATED by tools/gen_spells.js from tools/spell_book.json -- edit spell_book.json, not this file.",
    "// Each spell's reach class (touch / short / medium / long), read by the battle stage's reach preview (index.html).",
    "window.SPELL_REACH = " + JSON.stringify(map) + ";",
    ""
  ].join(reachEol);
})();

// ---------------------------------------------------------------- write or check
var stale = [];
Object.keys(pending).forEach(function (p) {
  var current = fs.existsSync(p) ? fs.readFileSync(p, "utf8") : null;
  // Compared with line endings ignored: other generators write LF blocks into the same CRLF file, and a mixed file is not a stale one.
  if (current === null || current.replace(/\r\n/g, "\n") !== pending[p].replace(/\r\n/g, "\n")) {
    stale.push(path.relative(ROOT, p));
    if (!CHECK) fs.writeFileSync(p, pending[p]);
  }
});
if (CHECK) {
  if (stale.length) { console.error("gen_spells: generated blocks are stale in:\n  " + stale.join("\n  ") + "\nRun: node tools/gen_spells.js"); process.exit(1); }
  console.log("gen_spells: all generated blocks are up to date (" + spells.length + " spells).");
} else {
  console.log("gen_spells: " + spells.length + " spells; " + (stale.length ? "rewrote " + stale.join(", ") : "nothing changed") + ".");
}
