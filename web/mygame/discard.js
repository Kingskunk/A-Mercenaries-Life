/*
 * DISCARD RULES (2026-10-26, the user) -- which items may be thrown away. One module, used by the inventory panel (to offer or refuse a discard and say why), by ChoiceScript through *script (the same answer,
 * checked again when the discard runs) and by tools/audit_discardable.js, so there is one rule and no copy of it to drift. No screen code.
 *
 * PROTECTED BY DEFAULT. Wrongly allowing a discard destroys a quest item for good; wrongly refusing one is only an annoyance. An item can be thrown away only when ALL of this holds:
 *   1. it is a catalog item (window.DISCARD_DATA, generated from tools/gear_catalog.json by tools/gen_gear.js) of an ordinary kind: ingredient, consumable, salvage, tool or spare gear
 *      (weapon, armor, shield, head, cloak, hands, feet, neck, ring). A valuable (gem, jewelry) is for selling. An item that is NOT in the catalog is a hand-written story piece (a letter, the horse, a
 *      companion's gift): always protected unless it carries its own tag below;
 *   2. it carries no keep tag, or the keep tag has been released.
 *
 * A KEEP TAG is one optional field on an item, in the catalog ("keep" in tools/gear_catalog.json) or on a hand-written entry in inventory-data.js:
 *     keep: "reason shown to the player"
 *     keep: { reason: "...", until: "some_stat" }                       released once that stat is true
 *     keep: { reason: "...", until: { var: "some_stat", in: ["a", "b"] } }   released once the stat is one of the listed values
 *     keep: { reason: "...", until: function (stats) { ... } }          (hand-written entries only)
 * The reason is what the player reads ("Ressa's ring: you promised to return it"), so write it in the character's voice.
 *
 * What is NOT decided by status() (the discard action checks it): a worn piece (worn()), and combat. The attuned Hearthstone is worn, and is a hand-written story piece besides.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.Discard = factory();
})(this, function () {
  "use strict";

  var OK_KINDS = { ingredient: 1, consumable: 1, salvage: 1, tool: 1, weapon: 1, armor: 1, shield: 1, head: 1, cloak: 1, hands: 1, feet: 1, neck: 1, ring: 1 };

  // The stats that hold what the character is wearing or wielding. The same list as WORN in inventory.js; keep the two in step.
  var WORN_VARS = ["equipped_weapon_id", "equipped_sidearm_id", "equipped_armor_id", "equipped_head_id", "equipped_cloak_id", "equipped_hands_id", "equipped_waist_id", "equipped_feet_id", "equipped_neck_id", "equipped_ring1_id", "equipped_ring2_id"];

  function R() { return typeof window !== "undefined" ? window : globalThis; }
  function truthy(v) { return v === true || v === "true"; }

  function entryOf(id) {
    var inv = R().INVENTORY, items = (inv && inv.items) || [], i;
    for (i = 0; i < items.length; i++) if (items[i].id === id) return items[i];
    return null;
  }
  // Has the keep tag been released by the story? (A tag with no "until" is never released.)
  function released(until, stats) {
    if (until === undefined || until === null) return false;
    if (typeof until === "function") return !!until(stats);
    if (typeof until === "string") return truthy(stats[until]);
    if (until && until.var !== undefined) {
      var v = stats[until.var];
      if (until["in"]) return until["in"].indexOf(String(v)) >= 0;
      return truthy(v);
    }
    return false;
  }

  // The answer for one item id and the current stats: { ok, code, why }. code is "ok", "keep" (a tag), "story" (hand-written, no tag), "valuable" or "unknown".
  function status(id, stats) {
    stats = stats || {};
    var data = (R().DISCARD_DATA || {})[id] || null, entry = entryOf(id), keep = (data && data.keep) || (entry && entry.keep) || null;
    if (keep) {
      var k = typeof keep === "string" ? { reason: keep } : keep;
      if (!released(k.until, stats)) return { ok: false, code: "keep", why: String(k.reason || "You are holding on to this.") };
    }
    if (!data) {
      if (!entry) return { ok: false, code: "unknown", why: "That cannot be thrown away." };
      // a hand-written entry: a released keep tag makes it droppable, and anything else is part of the story
      if (keep) return { ok: true, code: "ok", why: "" };
      return { ok: false, code: "story", why: "This is part of your story, so you hold on to it." };
    }
    if (data.kind === "valuable") return { ok: false, code: "valuable", why: "That is worth coin. Sell it instead." };
    if (!OK_KINDS[data.kind]) return { ok: false, code: "story", why: "You cannot throw that away." };
    return { ok: true, code: "ok", why: "" };
  }

  // Is this item on the character right now? A worn piece can lose spare copies but never the one being worn, which the discard action enforces.
  function worn(id, stats) {
    stats = stats || {};
    return WORN_VARS.some(function (v) { return stats[v] === id; });
  }

  return { status: status, worn: worn, WORN_VARS: WORN_VARS, OK_KINDS: OK_KINDS, entryOf: entryOf };
});
