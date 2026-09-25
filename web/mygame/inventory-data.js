/*
 * INVENTORY DATA -- read by inventory.js, same relationship lorebook-data.js has to
 * lorebook.js. This is a static catalog: display text (name/description/category) for
 * every "carried gear" item, since ChoiceScript only stores a has_x boolean for each one
 * (see choicescript_stats.txt's "CARRIED GEAR & SATCHEL" section) -- the flavor text
 * itself only exists as literal strings in that scene, not as a stat, so it has to be
 * duplicated here once rather than parsed out of rendered game text.
 *
 * The "Equipped Loadout" slots are NOT duplicated the same way -- weapon_desc, armor_desc,
 * head_desc, etc. are themselves plain live stats (computed by equipment.txt's
 * apply_<slot>_loadout labels), so EQUIPPED_SLOTS below just names which stat fields to
 * read, and inventory.js reads them live off window.stats with zero duplicated text.
 *
 * `owned`/`equipped`/`badge`/`description` may be a plain value or a function(s) that
 * takes the live stats object, same convention as lorebook-data.js's `unlock`/`body`.
 */
window.INVENTORY = {
  categories: [
    { id: "weapons", label: "Weapons" },
    { id: "apparel", label: "Apparel" },
    { id: "accessories", label: "Accessories & Trinkets" },
    { id: "provisions", label: "Provisions & Trail Gear" },
    { id: "documents", label: "Documents & Leverage" },
    { id: "consumables", label: "Consumables" }
  ],

  // Always-present gear slots, shown regardless of any has_x flag. `stat` names the
  // live field(s) inventory.js reads off window.stats -- see its render code for how
  // each shape (weapon/armor/plain/ring/shield/attune) is displayed.
  // `bucket` (+ `ringSlot` for rings) names which EquipmentEngine slot this is.
  //
  // `swappable: true` is the ONLY thing that turns a slot's control on -- and it's set
  // to match choicescript_stats.txt's real codex_equipment_* menus EXACTLY, not by what
  // EquipmentEngine could technically do. That menu (read it before touching this list):
  //   - Weapon: "switch back to starting" (ALWAYS offered) + has_x alternates. Never
  //     offers "unarmed" -- that's a narrative-only state, not a player action.
  //   - Head: "switch back to your ORIGIN's default" (arming_cap/camo_hood/scholar_coif,
  //     ALWAYS offered) + has_x alternates. Never offers "bare head".
  //   - Shield: a toggle (has_shield gates it, not ownership of an id).
  //   - Sidearm: no direct picker at all -- only the "swap with weapon" action (its own
  //     button below, not this per-slot control).
  //   - Armor: "switch back to starting" + has_x alternates (Halda's Forge armor), as of the Port Valen forge.
  //   - Cloak, Hands, Waist, Feet, Neck, Rings: NO equip choice in the real menu
  //     (apparel is explicitly commented "Cosmetic" there; accessories only ever gains
  //     Elspeth's Weir-Knot, one-way, which isn't modeled here yet -- manage it from the
  //     Dossier). Building a swap control for slots that were never a player-facing
  //     ability produced a real dead end (a slot with only one candidate collapses to no
  //     control at all once you leave that candidate) -- see the git history on this file
  //     for what that bug looked like. Don't re-add `swappable` to these without ALSO
  //     checking whether the real menu has grown a matching choice for that slot.
  //
  // `always(s)` (weapon, head) returns id(s) that must appear in the dropdown regardless
  // of has_x ownership, mirroring the menu's own "switch back to X" option.
  equippedSlots: [
    { label: "Primary Weapon", shape: "weapon", desc: "weapon_desc", dmg: "weapon_damage", bucket: "weapon",
      swappable: true, always: function () { return ["starting"]; } },
    { label: "Sidearm", shape: "weapon", desc: "sidearm_desc", dmg: "sidearm_damage", bucket: "sidearm" },
    { label: "Armor", shape: "armor", desc: "armor_desc", ac: "armor_class", bucket: "armor",
      swappable: true, always: function () { return ["starting"]; } },
    { label: "Shield", shape: "shield", bucket: "shield", swappable: true },
    { label: "Head", shape: "headwear", desc: "head_desc", ac: "head_ac", isArmor: "head_is_armor", bucket: "head",
      swappable: true,
      always: function (s) {
        var originDefault = { ruined: "arming_cap", outlaw: "camo_hood", disgraced: "scholar_coif" };
        return [originDefault[s.origin] || "arming_cap"];
      } },
    { label: "Cloak", shape: "plain", desc: "cloak_desc", bucket: "cloak" },
    { label: "Hands", shape: "plain", desc: "hands_desc", bucket: "hands" },
    { label: "Waist", shape: "plain", desc: "waist_desc", bucket: "waist" },
    { label: "Feet", shape: "plain", desc: "feet_desc", bucket: "feet" },
    { label: "Neck", shape: "plain", desc: "neck_desc", bucket: "neck" },
    { label: "Ring (1)", shape: "plain", desc: "ring1_desc", bucket: "ring", ringSlot: "1" },
    { label: "Ring (2)", shape: "plain", desc: "ring2_desc", bucket: "ring", ringSlot: "2" }
  ],

  items: [
    // GEN:BEGIN gear_items -- generated by tools/gen_gear.js from tools/gear_catalog.json; edit the catalog, not this block
    {
      id: "timber_axe", category: "weapons", owned: "has_timber_axe",
      name: function (s) { var n = 1 + (Number(s.spare_timber_axe) || 0); return "Highland Hewing Axe" + (n > 1 ? " ×" + n : ""); },
      description: "Broad-bearded single-handed felling axe with a hardened wedge.",
      badge: function (s) { return s.equipped_weapon_id === "timber_axe" ? "Equipped" : ""; },
      equip: { slot: "weapon", id: "timber_axe" }
    },
    {
      id: "stiletto", category: "weapons", owned: "has_stiletto",
      name: function (s) { var n = 1 + (Number(s.spare_stiletto) || 0); return "Alderford Stiletto" + (n > 1 ? " ×" + n : ""); },
      description: "Slender square-section thrusting dagger ground from scrap file-steel.",
      badge: function (s) { return s.equipped_weapon_id === "stiletto" ? "Equipped" : ""; },
      equip: { slot: "weapon", id: "stiletto" }
    },
    {
      id: "iron_crowbar", category: "provisions", owned: "has_iron_crowbar",
      name: function (s) { var n = 1 + (Number(s.spare_iron_crowbar) || 0); return "Pioneer's Iron Prybar" + (n > 1 ? " ×" + n : ""); },
      description: "Cold-forged crowbar and tempered wedges for forcing stubborn locks and stone seams."
    },
    {
      id: "torvald_iron_sallet", category: "apparel", owned: "has_torvald_iron_sallet",
      name: function (s) { var n = 1 + (Number(s.spare_torvald_iron_sallet) || 0); return "Cold-Hammered Skullcap" + (n > 1 ? " ×" + n : ""); },
      description: "Plain riveted steel skullcap, guild-stamped at Torvald's forge.",
      badge: function (s) { return s.equipped_head_id === "torvald_iron_sallet" ? "Equipped, +1 AC" : "Stowed"; },
      equip: { slot: "head", id: "torvald_iron_sallet" }
    },
    {
      id: "torvald_hide_cap", category: "apparel", owned: "has_torvald_hide_cap",
      name: function (s) { var n = 1 + (Number(s.spare_torvald_hide_cap) || 0); return "Boiled-Hide Watch Cap" + (n > 1 ? " ×" + n : ""); },
      description: "Stiffened leather skullcap, cheap and close-fitting under a hood.",
      badge: function (s) { return s.equipped_head_id === "torvald_hide_cap" ? "Equipped" : "Stowed"; },
      equip: { slot: "head", id: "torvald_hide_cap" }
    },
    {
      id: "brigandine", category: "apparel", owned: "has_brigandine",
      name: function (s) { var n = 1 + (Number(s.spare_brigandine) || 0); return "Iron-Studded Gambeson" + (n > 1 ? " ×" + n : ""); },
      description: "Quilted wool-and-canvas coat with rows of iron studs sewn between the layers.",
      badge: function (s) { return s.equipped_armor_id === "brigandine" ? "Worn, Medium Armor" : "Stowed"; },
      equip: { slot: "armor", id: "brigandine" }
    },
    {
      id: "chain_jack", category: "apparel", owned: "has_chain_jack",
      name: function (s) { var n = 1 + (Number(s.spare_chain_jack) || 0); return "Iron Chain Shirt" + (n > 1 ? " ×" + n : ""); },
      description: "Hand-closed mail rings over a wool lining, with doubled seams at the neck and hips.",
      badge: function (s) { return s.equipped_armor_id === "chain_jack" ? "Worn, Medium Armor" : "Stowed"; },
      equip: { slot: "armor", id: "chain_jack" }
    },
    {
      id: "plate_harness", category: "apparel", owned: "has_plate_harness",
      name: function (s) { var n = 1 + (Number(s.spare_plate_harness) || 0); return "Iron Plate Harness" + (n > 1 ? " ×" + n : ""); },
      description: "Overlapping iron plates riveted over a mail coat, with hinged shoulders and lapped hip plates.",
      badge: function (s) { return s.equipped_armor_id === "plate_harness" ? "Worn, Heavy Armor" : "Stowed"; },
      equip: { slot: "armor", id: "plate_harness" }
    },
    {
      id: "warming_liniment", category: "consumables", owned: "has_warming_liniment",
      name: function (s) { var n = 1 + (Number(s.spare_warming_liniment) || 0); return "Warming Liniment" + (n > 1 ? " ×" + n : ""); },
      description: "Pot of grey camphor-and-thyme tallow for stiff joints.",
      badge: function (s) { return "+1 STR for 12 hours" + (function (s) { for (var n = 1; n <= 3; n++) { var a = s["unique_buff" + n + "_active"]; if ((a === true || a === "true") && s["unique_buff" + n + "_name"] === "Warming Liniment") return true; } return false; }(s) ? " · active, using it refreshes" : ""); },
      useLabel: function (s) { return function (s) { for (var n = 1; n <= 3; n++) { var a = s["unique_buff" + n + "_active"]; if ((a === true || a === "true") && s["unique_buff" + n + "_name"] === "Warming Liniment") return true; } return false; }(s) ? "Refresh" : "Use"; },
      use: true
    },
    {
      id: "clear_head_draught", category: "consumables", owned: "has_clear_head_draught",
      name: function (s) { var n = 1 + (Number(s.spare_clear_head_draught) || 0); return "Clear-Head Draught" + (n > 1 ? " ×" + n : ""); },
      description: "Corked bottle of amber pine-and-mint tonic.",
      badge: function (s) { return "+1 WIS for 12 hours" + (function (s) { for (var n = 1; n <= 3; n++) { var a = s["unique_buff" + n + "_active"]; if ((a === true || a === "true") && s["unique_buff" + n + "_name"] === "Clear-Head Draught") return true; } return false; }(s) ? " · active, using it refreshes" : ""); },
      useLabel: function (s) { return function (s) { for (var n = 1; n <= 3; n++) { var a = s["unique_buff" + n + "_active"]; if ((a === true || a === "true") && s["unique_buff" + n + "_name"] === "Clear-Head Draught") return true; } return false; }(s) ? "Refresh" : "Use"; },
      use: true
    },
    {
      id: "althea_phial", category: "consumables", owned: "has_althea_phial",
      name: function (s) { var n = 1 + (Number(s.spare_althea_phial) || 0); return "Phial of Saint Althea's Water" + (n > 1 ? " ×" + n : ""); },
      description: "Wax-stoppered clay flask of blessed cistern-water steeped with wild angelica and mountain arnica.",
      badge: "Restores 2d4+2 HP",
      use: true
    },
    // GEN:END gear_items
    // ---- weapons ----

    // ---- apparel ----
    {
      id: "talia_oiled_cloak", category: "apparel", owned: "has_talia_oiled_cloak",
      name: "Talia's Oiled Cloak",
      description: "Heavy oil-dark cloak, waxed against river spray and marsh rot.",
      badge: function (s) { return s.equipped_cloak_id === "talia_oiled_cloak" ? "Worn" : "Stowed"; },
      equip: { slot: "cloak", id: "talia_oiled_cloak" }
    },
    {
      id: "talia_deck_boots", category: "apparel", owned: "has_talia_deck_boots",
      name: "Talia's Pitch-Sealed Deck Boots",
      description: "Waterproofed brine-shed boots, wax-sealed river-tight.",
      badge: function (s) { return s.equipped_feet_id === "talia_deck_boots" ? "Worn" : "Stowed"; },
      equip: { slot: "feet", id: "talia_deck_boots" }
    },
    {
      id: "brant_iron_heel_boots", category: "apparel", owned: "has_brant_iron_heel_boots",
      name: "Brant's Iron-Heel Boots",
      description: "Heavy bull-hide boots pitch-sealed against estuary damp, fitted with caulked iron heel-plates for slipway grip.",
      badge: function (s) { return s.equipped_feet_id === "brant_iron_heel_boots" ? "Worn" : "Stowed"; },
      equip: { slot: "feet", id: "brant_iron_heel_boots" }
    },

    // ---- accessories & trinkets ----
    {
      id: "toll_seal_ring", category: "accessories", owned: "has_toll_seal_ring",
      name: "Customs Officer's Signet Ring",
      description: "Tarnished silver band stamped with a three-headed imperial hawk.",
      badge: function (s) { return (s.equipped_ring1_id === "toll_seal_ring" || s.equipped_ring2_id === "toll_seal_ring") ? "Worn" : ""; },
      equip: { slot: "ring", id: "toll_seal_ring" }
    },
    {
      id: "elspeth_weir_knot", category: "accessories", owned: "has_elspeth_weir_knot",
      name: "Elspeth's Braided Weir-Knot",
      description: "Flax cord knotted with three river stones, a sister's keepsake.",
      badge: function (s) { return s.equipped_neck_id === "elspeth_weir_knot" ? "Worn" : "Stowed"; },
      equip: { slot: "neck", id: "elspeth_weir_knot" }
    },
    {
      id: "althea_votive_ring", category: "accessories", owned: "has_althea_votive_ring",
      name: "Saint Althea's River-Stone Ring",
      description: "Flat river stone, silver-wired, taken from the altar offerings.",
      badge: function (s) { return (s.equipped_ring1_id === "althea_votive_ring" || s.equipped_ring2_id === "althea_votive_ring") ? "Worn" : "Stowed"; },
      equip: { slot: "ring", id: "althea_votive_ring" }
    },
    {
      id: "hearthstone_talisman", category: "accessories", owned: "has_hearthstone_talisman",
      name: "Torvald's Hearthstone Talisman",
      description: "Ancient highland furnace lodestone on braided oxhide.",
      badge: function (s) { return truthy(s.hearthstone_attuned) ? "Attuned, +1 Constitution" : "Not Attuned"; }
      // Deliberately no `equip` here -- attuning/unattuning cascades into
      // recalculate_attuned_bonuses (startup.txt), which touches CON and HP max, not
      // just AC/flavor text. Out of scope for the interactive panel for now; stays
      // read-only. Manage it from the Dossier's Equipment menu.
    },
    {
      id: "shield", category: "accessories", owned: "has_shield",
      name: "Limestone Boss Shield",
      description: "Heavy oak-and-iron shield with cold-hammered boss.",
      badge: function (s) { return truthy(s.shield_equipped) ? "Equipped, +2 AC" : "Stowed"; },
      equip: { slot: "shield" }
    },

    // ---- provisions & trail gear ----
    {
      id: "scrap_steel", category: "provisions",
      owned: function (s) { return Number(s.scrap_steel) > 0; },
      name: function (s) { return "Scrap Steel (" + Number(s.scrap_steel) + ")"; },
      description: "Bent blades and iron fittings, worth a little to a smith by weight.",
      badge: "Sells to a smith"
    },
    {
      id: "odessa_salve", category: "provisions", owned: "prep_odessa_salve",
      name: "Tin of Camphor Fat",
      description: "Pungent herbal lanolin balm from Surgeon Odessa."
    },
    {
      id: "fish_cache", category: "provisions", owned: "found_fish_cache",
      name: "Squatters' Cache",
      description: "Smoked river fish, dried meat, and rushlight candle stubs."
    },
    {
      id: "kestrel_dispatch", category: "provisions",
      owned: function (s) { return truthy(s.errand_kestrel_unlocked) && !truthy(s.visited_bivouac_kestrel); },
      name: "Sentry Dispatch Order",
      description: "Wooden dispatch board and straightened iron bodkins."
    },
    {
      id: "ysolde_requisition", category: "provisions",
      owned: function (s) { return truthy(s.errand_ysolde_unlocked) && !truthy(s.visited_bivouac_ysolde); },
      name: "Cadre Supply Requisition",
      description: "Crate of beeswax tapers and reagent requisition chits."
    },
    {
      id: "vanguard_grease_chit", category: "provisions",
      owned: function (s) { return truthy(s.errand_vanguard_unlocked) && !truthy(s.visited_bivouac_lyra); },
      name: "Armorer's Grease Chit",
      description: "Signed requisition chit for blade-grease."
    },
    {
      id: "customs_vellum", category: "provisions",
      owned: function (s) { return truthy(s.found_customs_vellum) && !truthy(s.turned_in_customs_vellum); },
      name: "Grey Waterway Toll Register",
      description: "Preserved provincial toll ledger with the three-headed hawk imperial wax seal."
    },
    {
      id: "waterproof_gear", category: "provisions", owned: "prep_waterproof_gear",
      name: "Waterproofing Grease Tins",
      description: "Refined mutton wax and hoof oil for boots and bowstring seams."
    },
    {
      id: "talia_provisions", category: "provisions", owned: "has_talia_provisions",
      name: "Hearth-Baked Travel Provisions",
      description: "Warm crusty bread and salt-cured river trout wrapped in greasecloth."
    },

    // ---- documents & leverage ----
    {
      id: "rotten_rib_splinter", category: "documents", owned: "has_rotten_rib_splinter",
      name: "Sap-Weeping Spruce Splinter",
      description: "A wet, pitch-stained splinter of green mountain spruce sheared from the fourth rib of Slipway Two.",
      badge: "Physical Evidence"
    },
    {
      id: "diverted_timber_waybill", category: "documents", owned: "has_diverted_timber_waybill",
      name: "Diverted Timber Waybill",
      description: "Scribed transit waybill bearing Master Hendryk's personal proof-stamp, falsely condemning naval heartwood for worm-rot.",
      badge: "Evidence"
    },
    {
      id: "silt_gate_payout_slip", category: "documents", owned: "has_silt_gate_payout_slip",
      name: "Broker's Payout Slip",
      description: "Wax vellum in a smuggler's hand, listing the night-sergeants who take weekly payoffs to leave the Silt-Gates unwatched.",
      badge: "Leverage"
    },
    {
      id: "letter_of_credit", category: "documents", owned: "has_letter_of_credit",
      name: "Gilded Scales Letter of Credit",
      description: function (s) {
        return "Redeemable in Port Valen or Alderford — worth " + formatCoinAmount(Number(s.letter_of_credit_value) || 0) + ".";
      }
    },

    // ---- consumables ----
    // (Saint Althea's phial, Ambrose's liniment and draught come from the catalog, in the generated block above.)
  ]
};

// Shared with lorebook-data.js's own local copy of this idea (core.truthy in
// lorebook.js) -- kept here too so this file has no load-order dependency on it.
function truthy(v) { return v === true || v === "true"; }

// Mirrors startup.txt's describe_silver_amount (10 silver = 1 gold crown) so the
// Letter of Credit's value reads the same here as it does on the dossier page.
function formatCoinAmount(totalSilver) {
  var gold = (totalSilver - (totalSilver % 10)) / 10;
  var silver = totalSilver % 10;
  var goldStr = gold === 1 ? "1 Gold Crown" : (gold + " Gold Crowns");
  var silverStr = silver === 1 ? "1 Silver Mark" : (silver + " Silver Marks");
  if (gold > 0 && silver > 0) return goldStr + ", " + silverStr;
  return gold > 0 ? goldStr : silverStr;
}
