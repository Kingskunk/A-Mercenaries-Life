/*
 * EQUIPMENT PANEL ENGINE -- the write-back half of the Inventory panel. Reads
 * window.EQUIPMENT_CATALOG (generated from equipment.txt by tools/gen_equipment_data.js)
 * and mutates window.stats directly, mirroring equipment.txt's apply_<slot>_loadout /
 * recalculate_armor_class / toggle_shield_equipped / swap_active_sidearm labels.
 *
 * This is a deliberate, scoped exception to "ChoiceScript is the only place game rules
 * live" -- see the design discussion this was built from: the alternative (a real
 * JS-invokes-a-ChoiceScript-subroutine bridge) is architecturally possible in this engine
 * (gosub_scene's resume state lives in stats.choice_subscene_stack, and headless.js
 * already proves a DOM-free Scene can run real .txt logic) but is a much bigger, riskier
 * piece of engine-level plumbing. This mirror keeps the risk small and contained:
 *   - Item DATA (names/damage/AC per id) is never hand-duplicated -- it's parsed
 *     straight from equipment.txt by gen_equipment_data.js, so it can't drift.
 *   - Only the RULES are hand-ported here, and they're intentionally small and stable:
 *     recalcArmorClass (~15 lines) and the two-handed-weapon-drops-shield rule (~5
 *     lines). tools/check_ac_formula_sync.js runs the REAL recalculate_armor_class
 *     headlessly against random equipment/class combos and diffs it against
 *     recalcArmorClass below, so a future edit to the real formula that isn't mirrored
 *     here gets caught by that script, not discovered by a player.
 *   - Attunement (hearthstone_talisman) is deliberately NOT handled here -- it cascades
 *     into recalculate_attuned_bonuses (startup.txt), which touches CON and HP max. Left
 *     entirely to the Dossier's existing Equipment menu.
 */
(function () {
  "use strict";

  var EQ = window.EquipmentEngine = window.EquipmentEngine || {};

  function truthy(v) { return v === true || v === "true"; }

  function catalog() { return (window.EQUIPMENT_CATALOG || {}); }

  function findEntry(bucket, id) {
    var list = catalog()[bucket] || [];
    for (var i = 0; i < list.length; i++) {
      if (list[i].ids.indexOf(id) !== -1) return list[i];
    }
    return null;
  }

  function resolveFieldValue(field, s) {
    if (!field) return undefined;
    return field.type === "statRef" ? s[field.value] : field.value;
  }

  // Ring entries are keyed on item_id and set new_ring_desc/new_ring_prose (matching
  // equipment.txt's apply_ring_loadout, which is itself parametrized by slot) -- remap
  // those two generic field names onto ring1_/ring2_ before writing them into stats.
  function fieldNameForSlot(bucket, fieldName, ringSlot) {
    if (bucket !== "ring") return fieldName;
    if (fieldName === "new_ring_desc") return "ring" + ringSlot + "_desc";
    if (fieldName === "new_ring_prose") return "ring" + ringSlot + "_prose";
    return fieldName;
  }

  // Mirrors apply_<slot>_loadout: look up the id's catalog entry and write its fields.
  function applyCatalogEntry(bucket, id, s, ringSlot) {
    var entry = findEntry(bucket, id);
    if (!entry) return false;
    Object.keys(entry.fields).forEach(function (fieldName) {
      var value = resolveFieldValue(entry.fields[fieldName], s);
      s[fieldNameForSlot(bucket, fieldName, ringSlot)] = value;
    });
    return true;
  }

  // Mirrors apply_weapon_loadout's trailing shield rule (equipment.txt lines ~99-104):
  // a two-handed weapon always drops the shield; switching back to a one-handed weapon
  // restores it if the player still wants it up.
  function applyWeaponShieldRule(s) {
    if (s.weapon_hands === "two_handed") {
      s.shield_equipped = false;
    } else if (truthy(s.has_shield) && truthy(s.wants_shield_equipped)) {
      s.shield_equipped = true;
    }
  }

  // Mirrors recalculate_armor_class (equipment.txt lines ~511-543) exactly. Kept in
  // lockstep by tools/check_ac_formula_sync.js -- if you edit the real label, run that
  // script and fix this to match before shipping.
  EQ.recalcArmorClass = function recalcArmorClass(s) {
    var baseAc = 11;
    var effectiveDexMod = Number(s.dex_mod) || 0;
    if (s.armor_type === "cloth") {
      baseAc = 10;
      if (s.wizard_spell === "mage_armor" && !truthy(s.head_is_armor)) baseAc = 13;
      if (s.character_class === "barbarian" && !truthy(s.head_is_armor)) baseAc = 10 + (Number(s.con_mod) || 0);
    }
    if (s.armor_type === "leather" || s.armor_type === "buff_coat") baseAc = 11;
    if (s.armor_type === "brigandine" || s.armor_type === "chain_jack") {
      baseAc = 13;
      if (effectiveDexMod > 2) effectiveDexMod = 2;
    }
    // Heavy armor: a flat 16 that ignores DEX (equipment.txt).
    if (s.armor_type === "plate_harness") {
      baseAc = 16;
      effectiveDexMod = 0;
    }
    var ac = baseAc + effectiveDexMod;
    if (truthy(s.head_is_armor) && Number(s.head_ac) > 0) ac += Number(s.head_ac);
    if (truthy(s.shield_equipped)) {
      ac += 2;
      s.shield_prose = "boss shield";
    } else {
      s.shield_prose = "free off-hand";
    }
    if (s.fighter_fighting_style === "defense") ac += 1;
    s.armor_class = ac;
    EQ.recalcProficiency(s);
  };

  // Mirrors armor_tier (apply_armor_loadout), armor_prof_check and recalculate_proficiency in
  // equipment.txt, so the sidebar's "not proficient" warning follows a panel swap immediately.
  // The starting kit is grandfathered exactly as in the real label.
  EQ.recalcProficiency = function recalcProficiency(s) {
    var t = s.armor_type, tier = "none";
    if (t === "leather" || t === "buff_coat") tier = "light";
    if (t === "brigandine" || t === "chain_jack") tier = "medium";
    if (t === "plate_harness") tier = "heavy";
    s.armor_tier = tier;
    var c = s.character_class, ok = false;
    if (tier === "none" || c === "none") ok = true;
    if (c === "fighter") ok = true;
    if ((c === "barbarian" || c === "ranger") && tier !== "heavy") ok = true;
    if ((c === "bard" || c === "rogue" || c === "warlock") && tier === "light") ok = true;
    s.armor_nonprof = (s.equipped_armor_id !== "starting") && !ok;
    // Shields: a starting shield is grandfathered (shield_grandfathered); fighter, barbarian and
    // ranger are trained. Mirrors shield_prof_check in equipment.txt.
    var shieldOk = c === "fighter" || c === "barbarian" || c === "ranger" || c === "none";
    s.shield_nonprof = truthy(s.shield_equipped) && !truthy(s.shield_grandfathered) && !shieldOk;
  };

  // The slot-id stat each bucket's equip state lives in (mirrors equip_<slot>'s own
  // "*set equipped_x_id new_x_id" line). Ring is handled separately (two slots).
  var ID_STAT = {
    weapon: "equipped_weapon_id", sidearm: "equipped_sidearm_id", armor: "equipped_armor_id",
    head: "equipped_head_id", cloak: "equipped_cloak_id", hands: "equipped_hands_id",
    waist: "equipped_waist_id", feet: "equipped_feet_id", neck: "equipped_neck_id"
  };

  // Top-level write action -- the only thing the Inventory panel calls directly.
  // ringSlot is "1" or "2", only meaningful when bucket === "ring".
  EQ.equipItem = function equipItem(bucket, id, ringSlot) {
    var s = window.stats;
    if (!s) return;
    if (bucket === "shield") {
      // toggle_shield_equipped (equipment.txt lines ~114-120)
      if (s.weapon_hands !== "two_handed") {
        s.shield_equipped = !truthy(s.shield_equipped);
        s.wants_shield_equipped = s.shield_equipped;
      }
      EQ.recalcArmorClass(s);
      return;
    }
    if (bucket === "ring") {
      s["equipped_ring" + ringSlot + "_id"] = id;
      applyCatalogEntry("ring", id, s, ringSlot);
      return; // rings never affect AC
    }
    var idStat = ID_STAT[bucket];
    if (!idStat) return;
    // Mirrors equip_weapon's swap-instead-of-overwrite guard (equipment.txt): if this id is
    // already sitting in the sidearm slot, swap the two rather than duplicating it into both
    // and orphaning the old weapon -- sidearm items have no has_x flag to fall back on.
    if (bucket === "weapon" && id === s.equipped_sidearm_id) {
      s.equipped_sidearm_id = s.equipped_weapon_id;
      applyCatalogEntry("sidearm", s.equipped_sidearm_id, s);
    }
    s[idStat] = id;
    applyCatalogEntry(bucket, id, s);
    if (bucket === "weapon") applyWeaponShieldRule(s);
    if (bucket === "weapon" || bucket === "armor" || bucket === "head") EQ.recalcArmorClass(s);
  };

  // Mirrors swap_active_sidearm (equipment.txt lines ~420-428).
  EQ.swapSidearm = function swapSidearm() {
    var s = window.stats;
    if (!s) return;
    var holdId = s.equipped_weapon_id;
    s.equipped_weapon_id = s.equipped_sidearm_id;
    s.equipped_sidearm_id = holdId;
    applyCatalogEntry("weapon", s.equipped_weapon_id, s);
    applyCatalogEntry("sidearm", s.equipped_sidearm_id, s);
    applyWeaponShieldRule(s);
    EQ.recalcArmorClass(s);
  };

  // For the panel's dropdowns: every id this bucket's catalog knows about, with its
  // resolved display description. Filtering to what the player can actually pick from
  // is the panel's job (inventory.js), not this engine's -- it just answers "what would
  // this id look like."
  EQ.describeOption = function describeOption(bucket, id, ringSlot) {
    var entry = findEntry(bucket, id);
    if (!entry) return id;
    var s = window.stats || {};
    var descField = bucket === "ring" ? "new_ring_desc" : (bucket + "_desc");
    var f = entry.fields[descField];
    return f ? resolveFieldValue(f, s) : id;
  };

  EQ.getEquippedId = function getEquippedId(bucket, ringSlot) {
    var s = window.stats || {};
    if (bucket === "shield") return truthy(s.shield_equipped) ? "shield" : "none";
    if (bucket === "ring") return s["equipped_ring" + ringSlot + "_id"] || "none";
    var idStat = ID_STAT[bucket];
    return idStat ? s[idStat] : undefined;
  };

  EQ.catalogIdsForSlot = function catalogIdsForSlot(bucket) {
    var list = catalog()[bucket] || [];
    var ids = [];
    list.forEach(function (entry) { entry.ids.forEach(function (id) { ids.push(id); }); });
    return ids;
  };
})();
