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
(typeof window !== "undefined" ? window : global).INVENTORY = {   // global in the node test harnesses, which read the load rules through *script
  categories: [
    { id: "weapons", label: "Weapons" },
    { id: "apparel", label: "Apparel" },
    { id: "accessories", label: "Accessories & Trinkets" },
    { id: "mounts", label: "Mount" },
    { id: "valuables", label: "Valuables" },
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
  // to match the equip choices the game has always offered (the Dossier's codex_equipment_* pages, removed 2026-10-21, listed exactly these) EXACTLY, not by what
  // EquipmentEngine could technically do. That list (read it before touching this one):
  //   - Weapon: "switch back to starting" (ALWAYS offered) + has_x alternates. Never
  //     offers "unarmed" -- that's a narrative-only state, not a player action.
  //   - Head: "switch back to your ORIGIN's default" (arming_cap/camo_hood/scholar_coif,
  //     ALWAYS offered) + has_x alternates. Never offers "bare head".
  //   - Shield: a toggle (has_shield gates it, not ownership of an id).
  //   - Sidearm: no direct picker at all -- only the "swap with weapon" action (its own
  //     button below, not this per-slot control).
  //   - Armor: "switch back to starting" + has_x alternates (Halda's Forge armor), as of the Port Valen forge.
  //   - Cloak: "switch back to your ORIGIN's cloak" (wool_mantle/camo_cloak/weather_cloak, ALWAYS
  //     offered) + has_x alternates (Talia's oiled cloak), as of the exposure traits (calendar.txt
  //     cloak_traits). Never offers "no cloak".
  //   - Hands, Waist, Feet: "switch back to your ORIGIN's piece" (ALWAYS offered) + has_x alternates (the
  //     tailor's stock, Talia's and Brant's boots, Rorik's camp gifts), as of the Gilt Needle. Never "bare".
  //   - Neck, Rings: NO equip choice in the real menu
  //     (apparel is explicitly commented "Cosmetic" there; accessories only ever gains
  //     one-way neck pieces, which aren't modeled here yet -- manage it from the
  //     Dossier). Building a swap control for slots that were never a player-facing
  //     ability produced a real dead end (a slot with only one candidate collapses to no
  //     control at all once you leave that candidate) -- see the git history on this file
  //     for what that bug looked like. Don't re-add `swappable` to these without ALSO
  //     checking whether the real menu has grown a matching choice for that slot.
  //
  // `always(s)` (weapon, head) returns id(s) that must appear in the dropdown regardless
  // of has_x ownership, mirroring the menu's own "switch back to X" option.
  equippedSlots: [
    {
      label: "Primary Weapon", shape: "weapon", desc: "weapon_desc", dmg: "weapon_damage", bucket: "weapon",
      swappable: true, always: function () { return ["starting"]; }
    },
    { label: "Sidearm", shape: "weapon", desc: "sidearm_desc", dmg: "sidearm_damage", bucket: "sidearm" },
    {
      label: "Armor", shape: "armor", desc: "armor_desc", armorType: "armor_type", bucket: "armor",
      swappable: true, always: function () { return ["starting"]; }
    },
    { label: "Shield", shape: "shield", bucket: "shield", swappable: true },
    {
      label: "Head", shape: "headwear", desc: "head_desc", ac: "head_ac", isArmor: "head_is_armor", bucket: "head",
      swappable: true,
      always: function (s) {
        return ["none"];   // nobody starts in headwear; a hat or helm can always come off (equipment.txt apply_head_loadout)
      }
    },
    {
      label: "Cloak", shape: "plain", desc: "cloak_desc", bucket: "cloak",
      swappable: true,
      always: function (s) {
        return ["starting_cloak"];   // the same plain cloak for every origin (equipment.txt apply_cloak_loadout)
      }
    },
    {
      label: "Hands", shape: "plain", desc: "hands_desc", bucket: "hands",
      swappable: true,
      always: function (s) {
        return ["starting_gloves"];   // the same plain gloves for every origin (equipment.txt apply_hands_loadout)
      }
    },
    {
      label: "Waist", shape: "plain", desc: "waist_desc", bucket: "waist",
      swappable: true,
      always: function (s) {
        return ["starting_belt"];   // the same leather belt for every origin (equipment.txt apply_waist_loadout)
      }
    },
    {
      label: "Feet", shape: "plain", desc: "feet_desc", bucket: "feet",
      swappable: true,
      always: function (s) {
        return ["starting_boots"];   // the same plain boots for every origin (equipment.txt apply_feet_loadout)
      }
    },
    // Neck and rings became swappable 2026-10-02 (the dossier already offers neck pieces; rings had no menu at all and were only ever put on by the story).
    // Both can be taken off: "none" is a bare throat or finger. A neck is not offered the way back while the Hearthstone is attuned (that is broken with its
    // own option, which ChoiceScript carries out because it changes CON and max HP).
    {
      label: "Neck", shape: "plain", desc: "neck_desc", bucket: "neck", swappable: true,
      always: function (s) { return truthy(s.hearthstone_attuned) ? [] : ["none"]; }
    },
    { label: "Ring (1)", shape: "plain", desc: "ring1_desc", bucket: "ring", ringSlot: "1", swappable: true, always: function () { return ["none"]; } },
    { label: "Ring (2)", shape: "plain", desc: "ring2_desc", bucket: "ring", ringSlot: "2", swappable: true, always: function () { return ["none"]; } }
  ],

  // GEN:BEGIN load_config -- generated by tools/gen_gear.js from tools/gear_catalog.json (capacity, coin_weights, starting_weights); edit the catalog, not this block
  load: {"capacityBase":0,"capacityPerStr":15,"capacityHorse":0,"containers":[{"id":"saddlebags","name":"Saddlebags","capacity":480,"needs":"has_horse","needsReason":"Your horse is not with you.","dungeon":"waits","rider":true,"note":"Carried by your horse, which you ride: a riding horse carries 480 pounds in all, and your own weight is taken off that. It never counts toward your own load, and it waits outside when you go into a dungeon."}],"overPctPerPoint":1,"overPctCap":50,"coin":{"copper":0.02,"silver":0.02,"gold":0.02},"body":{"human":160,"halfling":40,"elf":120,"dwarf":150,"tiefling":150,"hexblood":150,"half_orc":200,"default":160},"starting":{"armor":{"simple clothes":3,"barbarian clothes":4,"leather armor":10,"scale mail":45},"weapons":{"dagger":1,"longsword":3,"broadaxe":7,"quarterstaff":4,"shortbow":2,"falchion":3},"sidearms":{"ash_spear":3,"hand_crossbow":3,"matched_dagger":1},"sidearm_by_class":{"fighter":"ash_spear","barbarian":"ash_spear","wizard":"hand_crossbow","warlock":"hand_crossbow","rogue":"matched_dagger","bard":"matched_dagger","ranger":"matched_dagger"},"clothing":{"starting_cloak":3,"starting_gloves":0.5,"starting_belt":1,"starting_boots":3}}},
  // GEN:END load_config

  items: [
    // GEN:BEGIN gear_items -- generated by tools/gen_gear.js from tools/gear_catalog.json; edit the catalog, not this block
    {
      id: "timber_axe", category: "weapons", owned: "has_timber_axe", slot: "Weapon",
      weight: 4, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_timber_axe) || 0); return "Highland Hewing Axe" + (n > 1 ? " ×" + n : ""); },
      description: "Broad-bearded single-handed felling axe with a hardened wedge.",
      traits: "1d8 Slashing, One-Handed",
      badge: function (s) { return s.equipped_weapon_id === "timber_axe" ? "Equipped" : ""; },
      equip: { slot: "weapon", id: "timber_axe" }
    },
    {
      id: "stiletto", category: "weapons", owned: "has_stiletto", slot: "Weapon",
      weight: 1, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_stiletto) || 0); return "Alderford Stiletto" + (n > 1 ? " ×" + n : ""); },
      description: "Slender square-section thrusting dagger ground from scrap file-steel.",
      traits: "1d4 Piercing, Finesse",
      badge: function (s) { return s.equipped_weapon_id === "stiletto" ? "Equipped" : ""; },
      equip: { slot: "weapon", id: "stiletto" }
    },
    {
      id: "road_club", category: "weapons", owned: "has_road_club", slot: "Weapon",
      weight: 2, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_road_club) || 0); return "Wooden Club" + (n > 1 ? " ×" + n : ""); },
      description: "Knotted hardwood club with an iron band at the head.",
      traits: "1d4 Bludgeoning, One-Handed",
      badge: function (s) { return s.equipped_weapon_id === "road_club" ? "Equipped" : ""; },
      equip: { slot: "weapon", id: "road_club" }
    },
    {
      id: "rough_spear", category: "weapons", owned: "has_rough_spear", slot: "Weapon",
      weight: 3, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_rough_spear) || 0); return "Rough Spear" + (n > 1 ? " ×" + n : ""); },
      description: "Straight ash pole with a wired-on iron head.",
      traits: "1d6 Piercing, Reach, One-Handed",
      badge: function (s) { return s.equipped_weapon_id === "rough_spear" ? "Equipped" : ""; },
      equip: { slot: "weapon", id: "rough_spear" }
    },
    {
      id: "cord_sling", category: "weapons", owned: "has_cord_sling", slot: "Weapon",
      weight: 0.5, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_cord_sling) || 0); return "Cord Sling" + (n > 1 ? " ×" + n : ""); },
      description: "Braided cord and a leather pouch for throwing stones.",
      traits: "1d4 Bludgeoning, Ranged, One-Handed",
      badge: function (s) { return s.equipped_weapon_id === "cord_sling" ? "Equipped" : ""; },
      equip: { slot: "weapon", id: "cord_sling" }
    },
    {
      id: "hunting_bow", category: "weapons", owned: "has_hunting_bow", slot: "Weapon, two-handed",
      weight: 2, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_hunting_bow) || 0); return "Hunting Bow" + (n > 1 ? " ×" + n : ""); },
      description: "Plain yew stave with a waxed string.",
      traits: "1d6 Piercing, Ranged, Two-Handed",
      badge: function (s) { return s.equipped_weapon_id === "hunting_bow" ? "Equipped" : ""; },
      equip: { slot: "weapon", id: "hunting_bow" }
    },
    {
      id: "iron_crowbar", category: "provisions", owned: "has_iron_crowbar",
      weight: 5, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_iron_crowbar) || 0); return "Iron Prybar" + (n > 1 ? " ×" + n : ""); },
      description: "Cold-forged crowbar and tempered wedges for forcing stubborn locks and stone seams."
    },
    {
      id: "torvald_iron_sallet", category: "apparel", owned: "has_torvald_iron_sallet", slot: "Head",
      weight: 3, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_torvald_iron_sallet) || 0); return "Iron Skullcap" + (n > 1 ? " ×" + n : ""); },
      description: "Plain riveted steel skullcap, guild-stamped at Torvald's forge.",
      traits: "+1 AC, Counts as Armor",
      badge: function (s) { return s.equipped_head_id === "torvald_iron_sallet" ? "Equipped, +1 AC" : "Stowed"; },
      equip: { slot: "head", id: "torvald_iron_sallet" }
    },
    {
      id: "torvald_hide_cap", category: "apparel", owned: "has_torvald_hide_cap", slot: "Head",
      weight: 1, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_torvald_hide_cap) || 0); return "Leather Watch Cap" + (n > 1 ? " ×" + n : ""); },
      description: "Stiffened leather skullcap, cheap and close-fitting under a hood.",
      badge: function (s) { return s.equipped_head_id === "torvald_hide_cap" ? "Equipped" : "Stowed"; },
      equip: { slot: "head", id: "torvald_hide_cap" }
    },
    {
      id: "brigandine", category: "apparel", owned: "has_brigandine", slot: "Body armor",
      weight: 20, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_brigandine) || 0); return "Studded Gambeson" + (n > 1 ? " ×" + n : ""); },
      description: "Quilted wool-and-canvas coat with rows of iron studs sewn between the layers.",
      traits: "Medium Armor: AC 13 + DEX, max +2",
      badge: function (s) { return s.equipped_armor_id === "brigandine" ? "Worn, Medium Armor" : "Stowed"; },
      equip: { slot: "armor", id: "brigandine" }
    },
    {
      id: "chain_jack", category: "apparel", owned: "has_chain_jack", slot: "Body armor",
      weight: 25, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_chain_jack) || 0); return "Iron Chain Shirt" + (n > 1 ? " ×" + n : ""); },
      description: "Hand-closed mail rings over a wool lining, with doubled seams at the neck and hips.",
      traits: "Medium Armor: AC 13 + DEX, max +2",
      badge: function (s) { return s.equipped_armor_id === "chain_jack" ? "Worn, Medium Armor" : "Stowed"; },
      equip: { slot: "armor", id: "chain_jack" }
    },
    {
      id: "plate_harness", category: "apparel", owned: "has_plate_harness", slot: "Body armor",
      weight: 65, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_plate_harness) || 0); return "Iron Plate Harness" + (n > 1 ? " ×" + n : ""); },
      description: "Overlapping iron plates riveted over a mail coat, with hinged shoulders and lapped hip plates.",
      traits: "Heavy Armor: AC 16, no DEX bonus",
      badge: function (s) { return s.equipped_armor_id === "plate_harness" ? "Worn, Heavy Armor" : "Stowed"; },
      equip: { slot: "armor", id: "plate_harness" }
    },
    {
      id: "warming_liniment", category: "provisions", owned: "has_warming_liniment",
      weight: 0.5, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_warming_liniment) || 0); return "Warming Liniment" + (n > 1 ? " ×" + n : ""); },
      description: "Pot of grey camphor-and-thyme tallow for stiff joints."
    },
    {
      id: "clear_head_draught", category: "consumables", owned: "has_clear_head_draught",
      weight: 0.5, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_clear_head_draught) || 0); return "Clear-Head Draught" + (n > 1 ? " ×" + n : ""); },
      description: "Corked bottle of amber pine-and-mint tonic.",
      badge: function (s) { return "+1 WIS for 12 hours" + (function (s) { for (var n = 1; n <= 3; n++) { var a = s["unique_buff" + n + "_active"]; if ((a === true || a === "true") && s["unique_buff" + n + "_name"] === "Clear-Head Draught") return true; } return false; }(s) ? " · active, using it refreshes" : ""); },
      useLabel: function (s) { return function (s) { for (var n = 1; n <= 3; n++) { var a = s["unique_buff" + n + "_active"]; if ((a === true || a === "true") && s["unique_buff" + n + "_name"] === "Clear-Head Draught") return true; } return false; }(s) ? "Refresh" : "Use"; },
      use: true
    },
    {
      id: "philter_of_remembrance", category: "consumables", owned: "has_philter_of_remembrance",
      weight: 0.3, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_philter_of_remembrance) || 0); return "Philter of Remembrance" + (n > 1 ? " ×" + n : ""); },
      description: "A small rope-necked flask of scent that stirs vivid memories in whoever breathes it.",
      badge: function (s) { return "+1 CHA for 4 hours" + (function (s) { for (var n = 1; n <= 3; n++) { var a = s["unique_buff" + n + "_active"]; if ((a === true || a === "true") && s["unique_buff" + n + "_name"] === "Philter of Remembrance") return true; } return false; }(s) ? " · active, using it refreshes" : ""); },
      useLabel: function (s) { return function (s) { for (var n = 1; n <= 3; n++) { var a = s["unique_buff" + n + "_active"]; if ((a === true || a === "true") && s["unique_buff" + n + "_name"] === "Philter of Remembrance") return true; } return false; }(s) ? "Refresh" : "Use"; },
      use: true
    },
    {
      id: "althea_phial", category: "consumables", owned: "has_althea_phial",
      weight: 0.5, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_althea_phial) || 0); return "Saint Althea's Water" + (n > 1 ? " ×" + n : ""); },
      description: "Wax-stoppered clay flask of blessed cistern-water steeped with wild angelica and mountain arnica.",
      badge: "Restores 2d4+2 HP",
      use: true
    },
    {
      id: "linen_bandage", category: "consumables", owned: "has_linen_bandage",
      weight: 0.2, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_linen_bandage) || 0); return "Linen Bandage" + (n > 1 ? " ×" + n : ""); },
      description: "Boiled linen rolled around a pad of comfrey leaf, for binding a wound before sleep.",
      badge: "+1 HP from your next sleep",
      use: true
    },
    {
      id: "lye_soap", category: "consumables", owned: "has_lye_soap",
      weight: 0.5, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_lye_soap) || 0); return "Lye Soap" + (n > 1 ? " ×" + n : ""); },
      description: "Brown-paper twist of grey lye-soap shavings, enough for one wash by a stream or the shore.",
      badge: "Hygiene back to Clean, with water at hand",
      use: true
    },
    {
      id: "trail_rations", category: "consumables", owned: "has_trail_rations",
      weight: 2, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_trail_rations) || 0); return "Trail Rations" + (n > 1 ? " ×" + n : ""); },
      description: "Cloth-wrapped biscuit, dried sausage and raisins, a full meal for the road.",
      badge: "Clears hunger, like a meal",
      use: true
    },
    {
      id: "heartwood_fruit", category: "consumables", owned: "has_heartwood_fruit",
      weight: 0.1, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_heartwood_fruit) || 0); return "Heartwood Fruit" + (n > 1 ? " ×" + n : ""); },
      description: "Pale fruit from the old tree in the Longshade.",
      badge: "One training session, once a day",
      use: true
    },
    {
      id: "honey", category: "provisions", owned: "has_honey",
      weight: 0.5, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_honey) || 0); return "Honey" + (n > 1 ? " ×" + n : ""); },
      description: "Strained amber honey, sealed in a small pottery jar for the pot, pastry, or market stall."
    },
    {
      id: "honeycomb", category: "consumables", owned: "has_honeycomb",
      weight: 0.5, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_honeycomb) || 0); return "Honeycomb" + (n > 1 ? " ×" + n : ""); },
      description: "Dark gold comb from wild bees: a snack, a gift for a bear, and part of Green Honey Mash.",
      badge: "Holds off about 9 hours of hunger",
      use: true
    },
    {
      id: "boar_meat", category: "provisions", owned: "has_boar_meat",
      weight: 2, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_boar_meat) || 0); return "Boar Meat" + (n > 1 ? " ×" + n : ""); },
      description: "Dark, close-grained meat from a wild boar, for cooking or a trapper's trade."
    },
    {
      id: "venison", category: "provisions", owned: "has_venison",
      weight: 2, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_venison) || 0); return "Venison" + (n > 1 ? " ×" + n : ""); },
      description: "Lean, dark meat from an elk, for cooking or a trapper's trade."
    },
    {
      id: "barley_loaf", category: "consumables", owned: "has_barley_loaf",
      weight: 0.75, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_barley_loaf) || 0); return "Barley Loaf" + (n > 1 ? " ×" + n : ""); },
      description: "Dense barley-and-oat loaf from a Barleycross farm oven.",
      badge: "Holds off about 12 hours of hunger",
      use: true
    },
    {
      id: "grain", category: "provisions", owned: "has_grain",
      weight: 2, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_grain) || 0); return "Grain" + (n > 1 ? " ×" + n : ""); },
      description: "Two-pound sack of grain, for milling, porridge, brewing, or a pot."
    },
    {
      id: "cheese", category: "consumables", owned: "has_cheese",
      weight: 0.5, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_cheese) || 0); return "Cheese" + (n > 1 ? " ×" + n : ""); },
      description: "Waxed wedge of sharp hard cheese from the village dairies.",
      badge: "Holds off about 12 hours of hunger",
      use: true
    },
    {
      id: "butter", category: "provisions", owned: "has_butter",
      weight: 0.5, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_butter) || 0); return "Butter" + (n > 1 ? " ×" + n : ""); },
      description: "Salted block of village butter, for the pan, the loaf and the pot."
    },
    {
      id: "animal_fat", category: "provisions", owned: "has_animal_fat",
      weight: 1, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_animal_fat) || 0); return "Animal Fat" + (n > 1 ? " ×" + n : ""); },
      description: "Rendered lard or tallow, for the pan, the lamp and dressing leather."
    },
    {
      id: "orchard_apple", category: "consumables", owned: "has_orchard_apple",
      weight: 0.25, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_orchard_apple) || 0); return "Orchard Apple" + (n > 1 ? " ×" + n : ""); },
      description: "Firm tart apple from a Barleycross hedgerow orchard.",
      badge: "Holds off about 6 hours of hunger",
      use: true
    },
    {
      id: "root_vegetable_bundle", category: "provisions", owned: "has_root_vegetable_bundle",
      weight: 1, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_root_vegetable_bundle) || 0); return "Root-Vegetable Bundle" + (n > 1 ? " ×" + n : ""); },
      description: "String-tied carrots and turnips from the village root fields, ready for a pot."
    },
    {
      id: "farm_eggs", category: "provisions", owned: "has_farm_eggs",
      weight: 0.75, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_farm_eggs) || 0); return "Farm Eggs" + (n > 1 ? " ×" + n : ""); },
      description: "Six brown eggs packed safely in straw, for frying, baking, or a pot."
    },
    {
      id: "dried_pork_sausage", category: "consumables", owned: "has_dried_pork_sausage",
      weight: 0.4, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_dried_pork_sausage) || 0); return "Dried Pork Sausage" + (n > 1 ? " ×" + n : ""); },
      description: "Short smoked pork sausage, wrapped for travel.",
      badge: "Holds off about 12 hours of hunger",
      use: true
    },
    {
      id: "onions", category: "provisions", owned: "has_onions",
      weight: 0.5, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_onions) || 0); return "Onions" + (n > 1 ? " ×" + n : ""); },
      description: "Four dry onions on a stem-string, a cheap base for a pot or a roadside meal."
    },
    {
      id: "potatoes", category: "provisions", owned: "has_potatoes",
      weight: 1, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_potatoes) || 0); return "Potatoes" + (n > 1 ? " ×" + n : ""); },
      description: "Small potatoes in a cloth net, good roasted in embers or added to a pot."
    },
    {
      id: "tomatoes", category: "provisions", owned: "has_tomatoes",
      weight: 0.75, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_tomatoes) || 0); return "Tomatoes" + (n > 1 ? " ×" + n : ""); },
      description: "Ripe red tomatoes from a sheltered garden, for cooking down in a pot."
    },
    {
      id: "dressed_chicken", category: "provisions", owned: "has_dressed_chicken",
      weight: 3, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_dressed_chicken) || 0); return "Dressed Chicken" + (n > 1 ? " ×" + n : ""); },
      description: "Plucked and cleaned farm chicken, wrapped for the road and ready for a fire or pot."
    },
    {
      id: "fish", category: "provisions", owned: "has_fish",
      weight: 0.75, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_fish) || 0); return "Fish" + (n > 1 ? " ×" + n : ""); },
      description: "A whole fish, salted and packed for the road, for the pan or the pot."
    },
    {
      id: "cabbage", category: "provisions", owned: "has_cabbage",
      weight: 1.5, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_cabbage) || 0); return "Cabbage" + (n > 1 ? " ×" + n : ""); },
      description: "Fresh field cabbage, a cheap staple for soups, braises, and pickling."
    },
    {
      id: "pumpkin", category: "provisions", owned: "has_pumpkin",
      weight: 4, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_pumpkin) || 0); return "Pumpkin" + (n > 1 ? " ×" + n : ""); },
      description: "Whole pumpkin for roasting, stews, pies, or storing through the colder weeks."
    },
    {
      id: "hemp_rope", category: "provisions", owned: "has_hemp_rope",
      weight: 10, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_hemp_rope) || 0); return "Hemp Rope" + (n > 1 ? " ×" + n : ""); },
      description: "Fifty feet of tarred hemp rope, coiled and tied off."
    },
    {
      id: "pitch_torch", category: "provisions", owned: "has_pitch_torch",
      weight: 1, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_pitch_torch) || 0); return "Torch" + (n > 1 ? " ×" + n : ""); },
      description: "Pine stave wrapped in tarred rag and dipped in pitch."
    },
    {
      id: "lamp_oil", category: "provisions", owned: "has_lamp_oil",
      weight: 1, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_lamp_oil) || 0); return "Lamp Oil" + (n > 1 ? " ×" + n : ""); },
      description: "Stoppered tin flask of lamp oil."
    },
    {
      id: "hooded_lantern", category: "provisions", owned: "has_hooded_lantern",
      weight: 2, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_hooded_lantern) || 0); return "Hooded Lantern" + (n > 1 ? " ×" + n : ""); },
      description: "Iron lantern with horn windows and a sliding tin shutter."
    },
    {
      id: "tool_kit", category: "provisions", owned: "has_tool_kit",
      weight: 10, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_tool_kit) || 0); return "Repair Kit" + (n > 1 ? " ×" + n : ""); },
      description: "Canvas roll of repair tools for field fixes and simple mechanisms."
    },
    {
      id: "shovel", category: "provisions", owned: "has_shovel",
      weight: 5, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_shovel) || 0); return "Shovel" + (n > 1 ? " ×" + n : ""); },
      description: "Long-handled iron shovel for digging."
    },
    {
      id: "lute", category: "provisions", owned: "has_lute",
      weight: 2, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_lute) || 0); return "Lute" + (n > 1 ? " ×" + n : ""); },
      description: "Plain maple lute with seven gut strings and a worn pick-guard."
    },
    {
      id: "tinderbox", category: "provisions", owned: "has_tinderbox",
      weight: 1, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_tinderbox) || 0); return "Flint and Tinderbox" + (n > 1 ? " ×" + n : ""); },
      description: "Dented tin box with a striker, flint and dry char-cloth."
    },
    {
      id: "water_jug", category: "provisions", owned: "has_water_jug",
      weight: 1, stow: true, stack: true,
      held: { var: "jug_full", extra: 7, full: "full of water", empty: "empty" },
      traits: function (s) { var n = 1 + (Number(s.spare_water_jug) || 0), f = Math.max(0, Math.min(n, Number(s.jug_full) || 0)); return n === 1 ? (f ? "Full of water" : "Empty") : n + " jugs: " + f + " " + "full of water" + ", " + (n - f) + " empty"; },
      name: function (s) { var n = 1 + (Number(s.spare_water_jug) || 0); return "Water Jug" + (n > 1 ? " ×" + n : ""); },
      description: "Glazed clay jug with a corked neck and a leather-wrapped grip."
    },
    {
      id: "scroll_magic_missile", category: "consumables", owned: "has_scroll_magic_missile",
      weight: 0.05, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_scroll_magic_missile) || 0); return "Magic Missile Scroll" + (n > 1 ? " ×" + n : ""); },
      description: "Rolled paper with three lines of silver-dusted script.",
      badge: "Read in a fight: three darts of force that never miss"
    },
    {
      id: "scroll_healing_word", category: "consumables", owned: "has_scroll_healing_word",
      weight: 0.05, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_scroll_healing_word) || 0); return "Healing Word Scroll" + (n > 1 ? " ×" + n : ""); },
      description: "Short slip of folded paper with one bright line of script.",
      badge: "Read in a fight, as a bonus action: heal 1d4 plus your casting modifier"
    },
    {
      id: "scroll_mage_armor", category: "consumables", owned: "has_scroll_mage_armor",
      weight: 0.05, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_scroll_mage_armor) || 0); return "Mage Armor Scroll" + (n > 1 ? " ×" + n : ""); },
      description: "Long narrow scroll lettered in careful columns.",
      badge: "Read: base AC 13 + Dexterity for 24 hours, with no armor worn",
      use: true
    },
    {
      id: "scroll_bane", category: "consumables", owned: "has_scroll_bane",
      weight: 0.05, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_scroll_bane) || 0); return "Bane Scroll" + (n > 1 ? " ×" + n : ""); },
      description: "Curl of dark paper written in thin red ink.",
      badge: "Read in a fight: up to three foes make a Charisma save or are Baned for 10 rounds"
    },
    {
      id: "scroll_false_life", category: "consumables", owned: "has_scroll_false_life",
      weight: 0.05, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_scroll_false_life) || 0); return "False Life Scroll" + (n > 1 ? " ×" + n : ""); },
      description: "Stiff yellowed sheet on a wooden spindle.",
      badge: "Read: 1d4 + 4 temporary hit points for 12 hours",
      use: true
    },
    {
      id: "scroll_detect_magic", category: "consumables", owned: "has_scroll_detect_magic",
      weight: 0.05, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_scroll_detect_magic) || 0); return "Detect Magic Scroll" + (n > 1 ? " ×" + n : ""); },
      description: "Narrow grey slip with a ring of script round a blank center.",
      badge: "Read where magic may lie: it stands in for the spell, once"
    },
    {
      id: "scroll_jump", category: "consumables", owned: "has_scroll_jump",
      weight: 0.05, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_scroll_jump) || 0); return "Jump Scroll" + (n > 1 ? " ×" + n : ""); },
      description: "Pale paper bearing one blue line that rises in a sharp curve.",
      badge: "Read where a leap is needed: it stands in for Jump, once"
    },
    {
      id: "scroll_speak_with_animals", category: "consumables", owned: "has_scroll_speak_with_animals",
      weight: 0.05, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_scroll_speak_with_animals) || 0); return "Animal Speech Scroll" + (n > 1 ? " ×" + n : ""); },
      description: "Brown scroll in looping script with a small inked bird.",
      badge: "Read where an animal may answer: it stands in for Speak with Animals, once"
    },
    {
      id: "scroll_charm_person", category: "consumables", owned: "has_scroll_charm_person",
      weight: 0.05, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_scroll_charm_person) || 0); return "Charm Person Scroll" + (n > 1 ? " ×" + n : ""); },
      description: "Soft pink-edged sheet in curling script.",
      badge: "Read where a conversation offers Charm Person: it stands in for the spell, once"
    },
    {
      id: "scroll_remove_curse", category: "consumables", owned: "has_scroll_remove_curse",
      weight: 0.05, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_scroll_remove_curse) || 0); return "Remove Curse Scroll" + (n > 1 ? " ×" + n : ""); },
      description: "Pale scroll sealed with white wax stamped with a broken chain.",
      badge: "Read to renew the Silverstar, or to lift a curse where one lies",
      use: true
    },
    {
      id: "cooking_pot", category: "provisions", owned: "has_cooking_pot",
      weight: 4, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_cooking_pot) || 0); return "Iron Cooking Pot" + (n > 1 ? " ×" + n : ""); },
      description: "Blackened lidded iron pot with a wire bail for cooking over a campfire."
    },
    {
      id: "dripping_roasted_boar", category: "consumables", owned: "has_dripping_roasted_boar",
      weight: 1, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_dripping_roasted_boar) || 0); return "Dripping-Roasted Boar" + (n > 1 ? " ×" + n : ""); },
      description: "Roast boar wrapped in cloth, glossy with its own fat.",
      badge: "A full meal: +1 STR for 12 hours, +2 temporary HP",
      use: true
    },
    {
      id: "onion_seared_venison", category: "consumables", owned: "has_onion_seared_venison",
      weight: 1, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_onion_seared_venison) || 0); return "Onion-Seared Venison" + (n > 1 ? " ×" + n : ""); },
      description: "Seared venison and brown onions wrapped in cloth.",
      badge: "A full meal: +1 DEX for 12 hours, +2 temporary HP",
      use: true
    },
    {
      id: "pot_braised_chicken", category: "consumables", owned: "has_pot_braised_chicken",
      weight: 1, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_pot_braised_chicken) || 0); return "Pot-Braised Chicken and Roots" + (n > 1 ? " ×" + n : ""); },
      description: "Braised chicken with carrots and turnips, wrapped in cloth.",
      badge: "A full meal: +1 CON for 12 hours, +2 temporary HP",
      use: true
    },
    {
      id: "riverfish_barley_pottage", category: "consumables", owned: "has_riverfish_barley_pottage",
      weight: 1, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_riverfish_barley_pottage) || 0); return "Riverfish and Barley Pottage" + (n > 1 ? " ×" + n : ""); },
      description: "Crock of riverfish and barley pottage.",
      badge: "A full meal: +1 CON for 10 hours, +2 temporary HP",
      use: true
    },
    {
      id: "tomato_riverfish_broth", category: "consumables", owned: "has_tomato_riverfish_broth",
      weight: 1, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_tomato_riverfish_broth) || 0); return "Tomato Riverfish Broth" + (n > 1 ? " ×" + n : ""); },
      description: "Stoppered crock of tomato and riverfish broth.",
      badge: "A full meal: +1 WIS for 10 hours, +2 temporary HP",
      use: true
    },
    {
      id: "smoked_sausage_braise", category: "consumables", owned: "has_smoked_sausage_braise",
      weight: 1, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_smoked_sausage_braise) || 0); return "Smoked Sausage and Cabbage Braise" + (n > 1 ? " ×" + n : ""); },
      description: "Crock of cabbage braised with smoked sausage.",
      badge: "A full meal: +1 STR for 10 hours, +2 temporary HP",
      use: true
    },
    {
      id: "pumpkin_onion_soup", category: "consumables", owned: "has_pumpkin_onion_soup",
      weight: 1, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_pumpkin_onion_soup) || 0); return "Pumpkin and Onion Soup" + (n > 1 ? " ×" + n : ""); },
      description: "Stoppered crock of pumpkin and onion soup.",
      badge: "A full meal: +1 WIS for 8 hours, +1 temporary HP",
      use: true
    },
    {
      id: "field_garden_stew", category: "consumables", owned: "has_field_garden_stew",
      weight: 1, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_field_garden_stew) || 0); return "Field-Garden Stew" + (n > 1 ? " ×" + n : ""); },
      description: "Crock of root and cabbage stew.",
      badge: "A full meal: +1 CON for 8 hours, +1 temporary HP",
      use: true
    },
    {
      id: "honeyed_barley_porridge", category: "consumables", owned: "has_honeyed_barley_porridge",
      weight: 1, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_honeyed_barley_porridge) || 0); return "Honeyed Barley Porridge" + (n > 1 ? " ×" + n : ""); },
      description: "Crock of barley porridge sweetened with honey.",
      badge: "A full meal: +1 INT for 8 hours, +1 temporary HP",
      use: true
    },
    {
      id: "apple_barley_porridge", category: "consumables", owned: "has_apple_barley_porridge",
      weight: 1, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_apple_barley_porridge) || 0); return "Apple Barley Porridge" + (n > 1 ? " ×" + n : ""); },
      description: "Crock of barley porridge with stewed apple.",
      badge: "A full meal: +1 CON for 8 hours, +1 temporary HP",
      use: true
    },
    {
      id: "acorn_truffle_pottage", category: "consumables", owned: "has_acorn_truffle_pottage",
      weight: 1, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_acorn_truffle_pottage) || 0); return "Acorn-Truffle Pottage" + (n > 1 ? " ×" + n : ""); },
      description: "Crock of potato pottage with acorn truffle.",
      badge: "A full meal: +1 INT for 12 hours, +2 temporary HP",
      use: true
    },
    {
      id: "brambleberry_barley_pudding", category: "consumables", owned: "has_brambleberry_barley_pudding",
      weight: 1, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_brambleberry_barley_pudding) || 0); return "Brambleberry Barley Pudding" + (n > 1 ? " ×" + n : ""); },
      description: "Crock of barley pudding streaked with brambleberry.",
      badge: "A full meal: +1 CHA for 12 hours, +2 temporary HP",
      use: true
    },
    {
      id: "chalk_sticks", category: "provisions", owned: "has_chalk_sticks",
      weight: 0.1, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_chalk_sticks) || 0); return "Chalk Sticks" + (n > 1 ? " ×" + n : ""); },
      description: "Six sticks of soft white chalk tied with string."
    },
    {
      id: "camp_kit", category: "provisions", owned: "has_camp_kit",
      weight: 25, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_camp_kit) || 0); return "Camp Kit" + (function () { var w = Number(s.camp_kit_wear) || 0; return w >= 16 ? " (Ragged)" : w >= 8 ? " (Worn)" : ""; })() + (n > 1 ? " ×" + n : ""); },
      description: "Canvas tent, poles and pegs rolled in a wool bedroll, with needle and thread."
    },
    {
      id: "waxed_oilcloth", category: "provisions", owned: "has_waxed_oilcloth",
      weight: 3, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_waxed_oilcloth) || 0); return "Oilcloth Sheet" + (n > 1 ? " ×" + n : ""); },
      description: "Square of canvas soaked in linseed oil and wax, stiff and rain-proof."
    },
    {
      id: "lockpick_set", category: "provisions", owned: "has_lockpick_set",
      weight: 1, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_lockpick_set) || 0); return "Lockpick Set" + (n > 1 ? " ×" + n : ""); },
      description: "Leather roll of slim steel picks, tension wrenches and a hooked rake."
    },
    {
      id: "padlock", category: "provisions", owned: "has_padlock",
      weight: 1, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_padlock) || 0); return "Padlock and Key" + (n > 1 ? " ×" + n : ""); },
      description: "Heavy brass padlock with a steel shackle and two keys."
    },
    {
      id: "door_bolt", category: "provisions", owned: "has_door_bolt",
      weight: 2, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_door_bolt) || 0); return "Door Bolt" + (n > 1 ? " ×" + n : ""); },
      description: "Forged iron slide-bolt with a keeper plate and wood screws."
    },
    {
      id: "iron_manacles", category: "provisions", owned: "has_iron_manacles",
      weight: 6, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_iron_manacles) || 0); return "Iron Manacles" + (n > 1 ? " ×" + n : ""); },
      description: "Pair of hinged iron cuffs on a short chain, with one key."
    },
    {
      id: "broadcloth_cloak", category: "apparel", owned: "has_broadcloth_cloak", slot: "Cloak",
      weight: 4, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_broadcloth_cloak) || 0); return "Traveler's Cloak" + (n > 1 ? " ×" + n : ""); },
      description: "Full-length cloak of stout undyed broadcloth.",
      traits: "Weather wear: cold -55%, rain -45%",
      badge: function (s) { return s.equipped_cloak_id === "broadcloth_cloak" ? "Worn" : "Stowed"; },
      equip: { slot: "cloak", id: "broadcloth_cloak" }
    },
    {
      id: "storm_cape", category: "apparel", owned: "has_storm_cape", slot: "Cloak",
      weight: 4, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_storm_cape) || 0); return "Storm Cape" + (n > 1 ? " ×" + n : ""); },
      description: "Short waxed cape that sheds rain like a slate roof.",
      traits: "Weather wear: cold -30%, rain -75%",
      badge: function (s) { return s.equipped_cloak_id === "storm_cape" ? "Worn" : "Stowed"; },
      equip: { slot: "cloak", id: "storm_cape" }
    },
    {
      id: "winter_cloak", category: "apparel", owned: "has_winter_cloak", slot: "Cloak",
      weight: 6, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_winter_cloak) || 0); return "Winter Cloak" + (n > 1 ? " ×" + n : ""); },
      description: "Heavy grey cloak lined in marten fur, with a tall collar.",
      traits: "Weather wear: cold -90%, rain -40%, heat +40%",
      badge: function (s) { return s.equipped_cloak_id === "winter_cloak" ? "Worn" : "Stowed"; },
      equip: { slot: "cloak", id: "winter_cloak" }
    },
    {
      id: "summer_duster", category: "apparel", owned: "has_summer_duster", slot: "Cloak",
      weight: 3, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_summer_duster) || 0); return "Summer Duster" + (n > 1 ? " ×" + n : ""); },
      description: "Loose ankle-length linen coat with a vented back.",
      traits: "Weather wear: cold -10%, rain -30%, heat -60%",
      badge: function (s) { return s.equipped_cloak_id === "summer_duster" ? "Worn" : "Stowed"; },
      equip: { slot: "cloak", id: "summer_duster" }
    },
    {
      id: "felt_hat", category: "apparel", owned: "has_felt_hat", slot: "Head",
      weight: 0.5, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_felt_hat) || 0); return "Felt Hat" + (n > 1 ? " ×" + n : ""); },
      description: "Pressed grey felt hat with a broad brim.",
      traits: "Weather wear: rain -15%, heat -25%",
      badge: function (s) { return s.equipped_head_id === "felt_hat" ? "Worn" : "Stowed"; },
      equip: { slot: "head", id: "felt_hat" }
    },
    {
      id: "fur_cap", category: "apparel", owned: "has_fur_cap", slot: "Head",
      weight: 1, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_fur_cap) || 0); return "Fur Cap" + (n > 1 ? " ×" + n : ""); },
      description: "Close wool cap with fur-trimmed flaps.",
      traits: "Weather wear: cold -20%",
      badge: function (s) { return s.equipped_head_id === "fur_cap" ? "Worn" : "Stowed"; },
      equip: { slot: "head", id: "fur_cap" }
    },
    {
      id: "lined_gloves", category: "apparel", owned: "has_lined_gloves", slot: "Hands",
      weight: 0.5, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_lined_gloves) || 0); return "Lined Gloves" + (n > 1 ? " ×" + n : ""); },
      description: "Soft leather gloves lined with combed fleece.",
      traits: "Weather wear: cold -20%",
      badge: function (s) { return s.equipped_hands_id === "lined_gloves" ? "Worn" : "Stowed"; },
      equip: { slot: "hands", id: "lined_gloves" }
    },
    {
      id: "scholar_gloves", category: "apparel", owned: "has_scholar_gloves", slot: "Hands",
      weight: 0.5, stow: true, stack: false,
      name: "Lamplight Gloves",
      description: "Fine black kid gloves cut close for close work.",
      traits: "+1 INT",
      badge: function (s) { return s.equipped_hands_id === "scholar_gloves" ? "Worn" : "Stowed"; },
      equip: { slot: "hands", id: "scholar_gloves" },
      statBonus: true
    },
    {
      id: "masters_gloves", category: "apparel", owned: "has_masters_gloves", slot: "Hands",
      weight: 0.5, stow: true, stack: false,
      name: "Spellseeker Gloves",
      description: "Black kid gloves fitted finger by finger and stitched in silk.",
      traits: "+2 INT",
      badge: function (s) { return s.equipped_hands_id === "masters_gloves" ? "Worn" : "Stowed"; },
      equip: { slot: "hands", id: "masters_gloves" },
      statBonus: true
    },
    {
      id: "waxed_boots", category: "apparel", owned: "has_waxed_boots", slot: "Feet",
      weight: 4, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_waxed_boots) || 0); return "Rain Boots" + (n > 1 ? " ×" + n : ""); },
      description: "Knee-high oiled calf boots with waxed seams.",
      traits: "Weather wear: cold -10%, rain -25%",
      badge: function (s) { return s.equipped_feet_id === "waxed_boots" ? "Worn" : "Stowed"; },
      equip: { slot: "feet", id: "waxed_boots" }
    },
    {
      id: "winter_boots", category: "apparel", owned: "has_winter_boots", slot: "Feet",
      weight: 5, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_winter_boots) || 0); return "Winter Boots" + (n > 1 ? " ×" + n : ""); },
      description: "Thick-soled boots lined with pressed felt.",
      traits: "Weather wear: cold -25%",
      badge: function (s) { return s.equipped_feet_id === "winter_boots" ? "Worn" : "Stowed"; },
      equip: { slot: "feet", id: "winter_boots" }
    },
    {
      id: "dancing_slippers", category: "apparel", owned: "has_dancing_slippers", slot: "Feet",
      weight: 1, stow: true, stack: false,
      name: "Swallowstep Shoes",
      description: "Flat black kid shoes with a thin flexible sole.",
      traits: "+1 DEX",
      badge: function (s) { return s.equipped_feet_id === "dancing_slippers" ? "Worn" : "Stowed"; },
      equip: { slot: "feet", id: "dancing_slippers" },
      statBonus: true
    },
    {
      id: "wool_muffler", category: "apparel", owned: "has_wool_muffler", slot: "Neck",
      weight: 1, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_wool_muffler) || 0); return "Wool Muffler" + (n > 1 ? " ×" + n : ""); },
      description: "Long knitted grey wool muffler.",
      traits: "Weather wear: cold -10%",
      badge: function (s) { return s.equipped_neck_id === "wool_muffler" ? "Worn" : "Stowed"; },
      equip: { slot: "neck", id: "wool_muffler" }
    },
    {
      id: "silk_neckcloth", category: "apparel", owned: "has_silk_neckcloth", slot: "Neck",
      weight: 0.2, stow: true, stack: false,
      name: "Silvertongue Cravat",
      description: "Dove-grey silk neckcloth folded in the Quarter fashion.",
      traits: "+1 CHA",
      badge: function (s) { return s.equipped_neck_id === "silk_neckcloth" ? "Worn" : "Stowed"; },
      equip: { slot: "neck", id: "silk_neckcloth" },
      statBonus: true
    },
    {
      id: "court_coat", category: "apparel", owned: "has_court_coat", slot: "Body armor",
      weight: 4, stow: true, stack: false,
      name: "Envoy's Court Coat",
      description: "Charcoal wool coat, silk-lined and cut close through the shoulder.",
      traits: "Cloth armor: AC 10 + DEX; cold -25%, rain -10%; +2 CHA",
      badge: function (s) { return s.equipped_armor_id === "court_coat" ? "Worn, Cloth Armor" : "Stowed"; },
      equip: { slot: "armor", id: "court_coat" },
      statBonus: true
    },
    {
      id: "bramble_heart", category: "provisions", owned: "has_bramble_heart",
      weight: 1, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_bramble_heart) || 0); return "Gnarled Bramble Heart" + (n > 1 ? " ×" + n : ""); },
      description: "Black bramble knotted into a heart, warm to the touch; once a day it calls up Blight Twigs in a fight."
    },
    {
      id: "poisoners_robes", category: "apparel", owned: "has_poisoners_robes", slot: "Body armor",
      weight: 3, stow: true, stack: false,
      name: "Poisoner's Robes",
      description: "Dull green-black robes, bitter-threaded at hem and cuff.",
      traits: "Cloth armor: AC 10 + DEX; +1d4 to the poison damage of your spells",
      badge: function (s) { return s.equipped_armor_id === "poisoners_robes" ? "Worn, Cloth Armor" : "Stowed"; },
      equip: { slot: "armor", id: "poisoners_robes" }
    },
    {
      id: "longshade_quarterstaff", category: "weapons", owned: "has_longshade_quarterstaff", slot: "Weapon",
      weight: 4, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_longshade_quarterstaff) || 0); return "Ash Quarterstaff" + (n > 1 ? " ×" + n : ""); },
      description: "Six-foot staff of straight-grained Longshade ash, planed round and oiled.",
      traits: "1d8 Bludgeoning, One-Handed",
      badge: function (s) { return s.equipped_weapon_id === "longshade_quarterstaff" ? "Equipped" : ""; },
      equip: { slot: "weapon", id: "longshade_quarterstaff" }
    },
    {
      id: "longshade_spear", category: "weapons", owned: "has_longshade_spear", slot: "Weapon",
      weight: 3, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_longshade_spear) || 0); return "Longshade Spear" + (n > 1 ? " ×" + n : ""); },
      description: "Seven-foot Longshade ash shaft with a leaf-bladed iron head.",
      traits: "1d6 Piercing, Reach, One-Handed",
      badge: function (s) { return s.equipped_weapon_id === "longshade_spear" ? "Equipped" : ""; },
      equip: { slot: "weapon", id: "longshade_spear" }
    },
    {
      id: "longshade_shortbow", category: "weapons", owned: "has_longshade_shortbow", slot: "Weapon, two-handed",
      weight: 2, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_longshade_shortbow) || 0); return "Longshade Shortbow" + (n > 1 ? " ×" + n : ""); },
      description: "Short ash stave bow backed with sinew and strung with waxed hemp.",
      traits: "1d6 Piercing, Ranged, Two-Handed",
      badge: function (s) { return s.equipped_weapon_id === "longshade_shortbow" ? "Equipped" : ""; },
      equip: { slot: "weapon", id: "longshade_shortbow" }
    },
    {
      id: "wooden_clogs", category: "apparel", owned: "has_wooden_clogs", slot: "Feet",
      weight: 3, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_wooden_clogs) || 0); return "Wooden Clogs" + (n > 1 ? " ×" + n : ""); },
      description: "Deep-heeled ash clogs carved from the block.",
      traits: "Weather wear: rain -15%",
      badge: function (s) { return s.equipped_feet_id === "wooden_clogs" ? "Worn" : "Stowed"; },
      equip: { slot: "feet", id: "wooden_clogs" }
    },
    {
      id: "iron_ore", category: "provisions", owned: "has_iron_ore",
      weight: 3, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_iron_ore) || 0); return "Iron Ore" + (n > 1 ? " ×" + n : ""); },
      description: "Hand-sorted red iron ore from the Eastcut, for a smelter's furnace."
    },
    {
      id: "limestone", category: "provisions", owned: "has_limestone",
      weight: 6, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_limestone) || 0); return "Limestone" + (n > 1 ? " ×" + n : ""); },
      description: "Six-pound piece of Whitefold limestone, for masonry or burning into lime."
    },
    {
      id: "iron_bar", category: "provisions", owned: "has_iron_bar",
      weight: 2.5, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_iron_bar) || 0); return "Iron Bar" + (n > 1 ? " ×" + n : ""); },
      description: "Single forged bar of wrought iron, ready for a smith's work."
    },
    {
      id: "longshade_timber", category: "provisions", owned: "has_longshade_timber",
      weight: 6, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_longshade_timber) || 0); return "Longshade Timber" + (n > 1 ? " ×" + n : ""); },
      description: "Seasoned length of Longshade ash, squared and ready for a wright's work."
    },
    {
      id: "charcoal", category: "provisions", owned: "has_charcoal",
      weight: 3, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_charcoal) || 0); return "Charcoal" + (n > 1 ? " ×" + n : ""); },
      description: "Sack of Ashrun charcoal, burned slow in the earth-covered mounds."
    },
    {
      id: "salt", category: "provisions", owned: "has_salt",
      weight: 2, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_salt) || 0); return "Salt" + (n > 1 ? " ×" + n : ""); },
      description: "Two-pound sack of coarse coast salt, for curing and the cook-pot."
    },
    {
      id: "beeswax", category: "provisions", owned: "has_beeswax",
      weight: 1, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_beeswax) || 0); return "Beeswax" + (n > 1 ? " ×" + n : ""); },
      description: "One-pound cake of clean beeswax for candles, seals, and waterproofing."
    },
    {
      id: "furs", category: "provisions", owned: "has_furs",
      weight: 1.5, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_furs) || 0); return "Furs" + (n > 1 ? " ×" + n : ""); },
      description: "Bundle of dressed furs, tied for the pack and ready for a furrier."
    },
    {
      id: "leather", category: "provisions", owned: "has_leather",
      weight: 3, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_leather) || 0); return "Leather" + (n > 1 ? " ×" + n : ""); },
      description: "Stack of bark-tanned hides, ready for a saddler or cobbler."
    },
    {
      id: "wool", category: "provisions", owned: "has_wool",
      weight: 2, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_wool) || 0); return "Wool" + (n > 1 ? " ×" + n : ""); },
      description: "Sack of washed fleece, ready for the spinner."
    },
    {
      id: "wool_cloth", category: "provisions", owned: "has_wool_cloth",
      weight: 4, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_wool_cloth) || 0); return "Wool Cloth" + (n > 1 ? " ×" + n : ""); },
      description: "Bolt of close-woven wool cloth, ready for a tailor."
    },
    {
      id: "flimsy_jeweled_dagger", category: "weapons", owned: "has_flimsy_jeweled_dagger", slot: "Weapon",
      weight: 1, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_flimsy_jeweled_dagger) || 0); return "Flimsy Jeweled Dagger" + (n > 1 ? " ×" + n : ""); },
      description: "Showy dagger with a jeweled hilt and a thin blade.",
      traits: "1d4 Piercing, Finesse, Flimsy (-1 to attack)",
      badge: function (s) { return s.equipped_weapon_id === "flimsy_jeweled_dagger" ? "Equipped" : ""; },
      equip: { slot: "weapon", id: "flimsy_jeweled_dagger" }
    },
    {
      id: "scrapling_claw_weapon", category: "weapons", owned: "has_scrapling_claw_weapon", slot: "Weapon",
      weight: 1, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_scrapling_claw_weapon) || 0); return "Scrapling Claw" + (n > 1 ? " ×" + n : ""); },
      description: "Knotted wooden limb with its claws bound in a leather strap.",
      traits: "1d4 Bludgeoning, One-Handed, Magic +1, fades after a week",
      badge: function (s) { return s.equipped_weapon_id === "scrapling_claw_weapon" ? "Equipped" : ""; },
      equip: { slot: "weapon", id: "scrapling_claw_weapon" }
    },
    {
      id: "grease_flask", category: "consumables", owned: "has_grease_flask",
      weight: 1, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_grease_flask) || 0); return "Grease Flask" + (n > 1 ? " ×" + n : ""); },
      description: "Stoppered clay flask of rendered tallow and pitch-oil, for throwing.",
      badge: "Thrown: a foe that fails a Dex save slips when it moves"
    },
    {
      id: "alchemists_fire", category: "consumables", owned: "has_alchemists_fire",
      weight: 1, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_alchemists_fire) || 0); return "Alchemist's Fire" + (n > 1 ? " ×" + n : ""); },
      description: "Sealed glass flask of a sticky mixture that catches fire in open air.",
      badge: "Thrown: 1d4 fire, then burns for 3 turns"
    },
    {
      id: "fire_arrow", category: "consumables", owned: "has_fire_arrow",
      weight: 0.05, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_fire_arrow) || 0); return "Fire Arrow" + (n > 1 ? " ×" + n : ""); },
      description: "Arrow wound with pitch-soaked cord that catches in open air.",
      badge: "Shot: your bow attack plus 1d4 fire, then burns for 2 turns"
    },
    {
      id: "ice_arrow", category: "consumables", owned: "has_ice_arrow",
      weight: 0.05, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_ice_arrow) || 0); return "Ice Arrow" + (n > 1 ? " ×" + n : ""); },
      description: "Arrow tipped with pale frost-flint packed in damp moss.",
      badge: "Shot: your bow attack plus 1d4 cold, and the target is slowed"
    },
    {
      id: "mortar_pestle", category: "provisions", owned: "has_mortar_pestle",
      weight: 3, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_mortar_pestle) || 0); return "Mortar and Pestle" + (n > 1 ? " ×" + n : ""); },
      description: "Bronze mortar and stone pestle for grinding herbs into poultices and salves."
    },
    {
      id: "empty_potion_vial", category: "provisions", owned: "has_empty_potion_vial",
      weight: 0.1, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_empty_potion_vial) || 0); return "Empty Potion Vial" + (n > 1 ? " ×" + n : ""); },
      description: "Clear-glass vial with a snug cork, for bottling a brew."
    },
    {
      id: "portable_burner", category: "provisions", owned: "has_portable_burner",
      weight: 4, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_portable_burner) || 0); return "Portable Burner" + (n > 1 ? " ×" + n : ""); },
      description: "Squat brass burner with an oil well and a lipped pan, for brewing on the road."
    },
    {
      id: "herbalists_field_notes", category: "documents", owned: "has_herbalists_field_notes",
      weight: 0.5, stow: true, stack: false,
      name: "Herbalist's Field Notes",
      description: "Weathered herbal notes recording Green Honey Mash (shadefern and honeycomb), Restful Balsam, and Winterward Tea."
    },
    {
      id: "mending_draught", category: "consumables", owned: "has_mending_draught",
      weight: 0.3, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_mending_draught) || 0); return "Mending Draught" + (n > 1 ? " ×" + n : ""); },
      description: "A stoppered vial of clear green liquid that smells of wet moss and warm stone.",
      badge: "The next proper sleep restores 2 extra HP",
      use: true
    },
    {
      id: "potion_barkskin", category: "consumables", owned: "has_potion_barkskin",
      weight: 0.3, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_potion_barkskin) || 0); return "Potion of Barkskin" + (n > 1 ? " ×" + n : ""); },
      description: "A green glass vial of brown brew that smells of oak bark.",
      badge: "For 1 hour: your armor class is at least 16",
      use: true
    },
    {
      id: "brine_antivenom", category: "consumables", owned: "has_brine_antivenom",
      weight: 0.3, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_brine_antivenom) || 0); return "Brine Antivenom" + (n > 1 ? " ×" + n : ""); },
      description: "A stoppered vial of cloudy grey-green liquid with a sharp tang of salt.",
      badge: "For 4 hours: resistance to poison damage and advantage on saves against poison",
      use: true
    },
    {
      id: "tidebreath_elixir", category: "consumables", owned: "has_tidebreath_elixir",
      weight: 0.3, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_tidebreath_elixir) || 0); return "Tidebreath Elixir" + (n > 1 ? " ×" + n : ""); },
      description: "A stoppered vial of pale, bubbling liquid that smells of cold sea air.",
      badge: "Ten minutes of held breath for one submerged route or dive",
      use: true
    },
    {
      id: "darksight_tonic", category: "consumables", owned: "has_darksight_tonic",
      weight: 0.3, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_darksight_tonic) || 0); return "Darksight Tonic" + (n > 1 ? " ×" + n : ""); },
      description: "A stoppered vial of milky blue liquid with a faint chill to the glass.",
      badge: "For 4 hours: the dark no longer hampers sight if you have no darkvision",
      use: true
    },
    {
      id: "fortifying_tonic", category: "consumables", owned: "has_fortifying_tonic",
      weight: 0.3, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_fortifying_tonic) || 0); return "Fortifying Tonic" + (n > 1 ? " ×" + n : ""); },
      description: "A stoppered vial of warm amber liquid that glows faintly when shaken.",
      badge: "Gain 4 temporary HP",
      use: true
    },
    {
      id: "restful_balsam", category: "consumables", owned: "has_restful_balsam",
      weight: 0.3, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_restful_balsam) || 0); return "Restful Balsam" + (n > 1 ? " ×" + n : ""); },
      description: "A stoppered vial of thick golden balsam that smells of resin and silverleaf.",
      badge: "The next proper sleep leaves you Well Rested for 12 hours",
      use: true
    },
    {
      id: "clearhead_tea", category: "consumables", owned: "has_clearhead_tea",
      weight: 0.3, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_clearhead_tea) || 0); return "Clearhead Tea" + (n > 1 ? " ×" + n : ""); },
      description: "A stoppered vial of pale gold tea that smells of crushed leaves and berries.",
      badge: "Clears a clouded mind, then +2 to your next INT or WIS check within 4 hours",
      use: true
    },
    {
      id: "winterward_tea", category: "consumables", owned: "has_winterward_tea",
      weight: 0.3, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_winterward_tea) || 0); return "Winterward Tea" + (n > 1 ? " ×" + n : ""); },
      description: "A stoppered vial of dark red-brown tea, warm to hold even when cold.",
      badge: "For 4 hours: cold exposure is cut by half",
      use: true
    },
    {
      id: "surestep_cordial", category: "consumables", owned: "has_surestep_cordial",
      weight: 0.3, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_surestep_cordial) || 0); return "Surestep Cordial" + (n > 1 ? " ×" + n : ""); },
      description: "A stoppered vial of sweet, deep-purple cordial with a trace of truffle.",
      badge: "For 8 hours: +3 to footing checks on slick stone, fords, wet timber and loose scree",
      use: true
    },
    {
      id: "moonshard", category: "weapons", owned: "has_moonshard", slot: "Weapon",
      weight: 1, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_moonshard) || 0); return "Moonshard" + (n > 1 ? " ×" + n : ""); },
      description: "Pale-bladed dagger that shimmers with its own light.",
      traits: "1d4 Piercing, Finesse; casts Light while in hand, Magic +1",
      badge: function (s) { return s.equipped_weapon_id === "moonshard" ? "Equipped" : ""; },
      equip: { slot: "weapon", id: "moonshard" }
    },
    {
      id: "lesser_amulet_of_the_beast", category: "apparel", owned: "has_lesser_amulet_of_the_beast", slot: "Neck",
      weight: 0.2, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_lesser_amulet_of_the_beast) || 0); return "Lesser Amulet of the Beast" + (n > 1 ? " ×" + n : ""); },
      description: "Carved horn pendant on a braided leather cord.",
      traits: "Resistance to natural attacks from Beast creatures",
      badge: function (s) { return s.equipped_neck_id === "lesser_amulet_of_the_beast" ? "Worn" : "Stowed"; },
      equip: { slot: "neck", id: "lesser_amulet_of_the_beast" }
    },
    {
      id: "iron_gap_poster", category: "valuables", owned: "has_iron_gap_poster",
      weight: 0.1, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_iron_gap_poster) || 0); return "Iron Gap Wanted Poster" + (n > 1 ? " ×" + n : ""); },
      description: "Singed wanted poster for the Wolf of the Road, Iron Gap constabulary."
    },
    {
      id: "solaines_unfinished_letter", category: "valuables", owned: "has_solaines_unfinished_letter",
      weight: 0.1, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_solaines_unfinished_letter) || 0); return "Solaine's Unfinished Letter" + (n > 1 ? " ×" + n : ""); },
      description: "Tear-stained letter in a looping hand, addressed to Tomlin."
    },
    {
      id: "bloodstained_lavender_ribbon", category: "valuables", owned: "has_bloodstained_lavender_ribbon",
      weight: 0.05, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_bloodstained_lavender_ribbon) || 0); return "Bloodstained Lavender Ribbon" + (n > 1 ? " ×" + n : ""); },
      description: "Lavender silk hair ribbon in a double bow, stained with blood."
    },
    {
      id: "burnt_holy_vestments", category: "valuables", owned: "has_burnt_holy_vestments",
      weight: 0.8, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_burnt_holy_vestments) || 0); return "Burnt Holy Vestments" + (n > 1 ? " ×" + n : ""); },
      description: "Charred white vestments, restitched in places."
    },
    {
      id: "mayors_letter", category: "valuables", owned: "has_mayors_letter",
      weight: 0.1, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_mayors_letter) || 0); return "The Mayor's Letter" + (n > 1 ? " ×" + n : ""); },
      description: "Short letter from Mayor Anathram, sealed with plain Hall wax."
    },
    {
      id: "iron_gap_warrant", category: "valuables", owned: "has_iron_gap_warrant",
      weight: 0.1, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_iron_gap_warrant) || 0); return "Iron Gap Warrant" + (n > 1 ? " ×" + n : ""); },
      description: "Rolled bounty warrant for the Wolf of the Road, Iron Gap constabulary."
    },
    {
      id: "pickled_hen_tankard", category: "valuables", owned: "has_pickled_hen_tankard",
      weight: 1, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_pickled_hen_tankard) || 0); return "Damaged Tankard" + (n > 1 ? " ×" + n : ""); },
      description: "Chewed pewter tankard stamped with the Pickled Hen's name."
    },
    {
      id: "gem_agate", category: "valuables", owned: "has_gem_agate",
      weight: 0.1, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_gem_agate) || 0); return "Agate" + (n > 1 ? " ×" + n : ""); },
      description: "Polished red-orange stone with fine pale bands."
    },
    {
      id: "gem_citrine", category: "valuables", owned: "has_gem_citrine",
      weight: 0.1, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_gem_citrine) || 0); return "Citrine" + (n > 1 ? " ×" + n : ""); },
      description: "Clear golden stone with a warm-cut face."
    },
    {
      id: "gem_quartz", category: "valuables", owned: "has_gem_quartz",
      weight: 0.1, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_gem_quartz) || 0); return "Clear Quartz" + (n > 1 ? " ×" + n : ""); },
      description: "Pale transparent crystal with a clean faceted face."
    },
    {
      id: "gem_aquamarine", category: "valuables", owned: "has_gem_aquamarine",
      weight: 0.1, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_gem_aquamarine) || 0); return "Aquamarine" + (n > 1 ? " ×" + n : ""); },
      description: "Clear blue stone the colour of sunlit shallows."
    },
    {
      id: "gem_opal", category: "valuables", owned: "has_gem_opal",
      weight: 0.1, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_gem_opal) || 0); return "Opal" + (n > 1 ? " ×" + n : ""); },
      description: "Milk-pale stone with ember and green colour under the surface."
    },
    {
      id: "gem_pearl", category: "valuables", owned: "has_gem_pearl",
      weight: 0.1, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_gem_pearl) || 0); return "Pearl" + (n > 1 ? " ×" + n : ""); },
      description: "Single round pearl with a soft cream lustre."
    },
    {
      id: "gem_sapphire", category: "valuables", owned: "has_gem_sapphire",
      weight: 0.1, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_gem_sapphire) || 0); return "Sapphire" + (n > 1 ? " ×" + n : ""); },
      description: "Deep blue stone cut in a careful oval."
    },
    {
      id: "gem_ruby", category: "valuables", owned: "has_gem_ruby",
      weight: 0.1, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_gem_ruby) || 0); return "Ruby" + (n > 1 ? " ×" + n : ""); },
      description: "Deep red stone with a strong steady fire."
    },
    {
      id: "gem_emerald", category: "valuables", owned: "has_gem_emerald",
      weight: 0.1, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_gem_emerald) || 0); return "Emerald" + (n > 1 ? " ×" + n : ""); },
      description: "Rich green rectangular stone with a stepped cut."
    },
    {
      id: "gem_diamond", category: "valuables", owned: "has_gem_diamond",
      weight: 0.1, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_gem_diamond) || 0); return "Diamond" + (n > 1 ? " ×" + n : ""); },
      description: "Clear hard stone cut into bright cold facets."
    },
    {
      id: "jewelry_silver_ring", category: "accessories", owned: "has_jewelry_silver_ring", slot: "Ring",
      weight: 0.1, stow: true, stack: false,
      name: "Silver Ring",
      description: "Broad polished silver ring, plain enough for engraving.",
      badge: function (s) { return (s.equipped_ring1_id === "jewelry_silver_ring" || s.equipped_ring2_id === "jewelry_silver_ring") ? "Worn" : "Stowed"; },
      equip: { slot: "ring", id: "jewelry_silver_ring" }
    },
    {
      id: "jewelry_gold_ring", category: "accessories", owned: "has_jewelry_gold_ring", slot: "Ring",
      weight: 0.1, stow: true, stack: false,
      name: "Gold Ring",
      description: "Smooth yellow-gold ring with a nearly invisible join.",
      badge: function (s) { return (s.equipped_ring1_id === "jewelry_gold_ring" || s.equipped_ring2_id === "jewelry_gold_ring") ? "Worn" : "Stowed"; },
      equip: { slot: "ring", id: "jewelry_gold_ring" }
    },
    {
      id: "jewelry_crescent_earrings", category: "accessories", owned: "has_jewelry_crescent_earrings", slot: "Head",
      weight: 0.1, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_jewelry_crescent_earrings) || 0); return "Crescent-Moon Earrings" + (n > 1 ? " ×" + n : ""); },
      description: "Matched silver crescent earrings with tiny dark glass beads.",
      traits: "Head slot; matched silver crescents",
      badge: function (s) { return s.equipped_head_id === "jewelry_crescent_earrings" ? "Equipped" : ""; },
      equip: { slot: "head", id: "jewelry_crescent_earrings" }
    },
    {
      id: "jewelry_drop_pendant", category: "accessories", owned: "has_jewelry_drop_pendant", slot: "Neck",
      weight: 0.1, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_jewelry_drop_pendant) || 0); return "Drop Pendant" + (n > 1 ? " ×" + n : ""); },
      description: "Pale cut-glass drop in silver wire on a fine chain.",
      traits: "Neck slot; pale cut-glass drop",
      badge: function (s) { return s.equipped_neck_id === "jewelry_drop_pendant" ? "Worn" : "Stowed"; },
      equip: { slot: "neck", id: "jewelry_drop_pendant" }
    },
    {
      id: "jewelry_gold_necklace", category: "accessories", owned: "has_jewelry_gold_necklace", slot: "Neck",
      weight: 0.2, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_jewelry_gold_necklace) || 0); return "Fine Gold Necklace" + (n > 1 ? " ×" + n : ""); },
      description: "Fine gold necklace with a worked central drop and careful joins.",
      traits: "Neck slot; fine worked gold",
      badge: function (s) { return s.equipped_neck_id === "jewelry_gold_necklace" ? "Worn" : "Stowed"; },
      equip: { slot: "neck", id: "jewelry_gold_necklace" }
    },
    {
      id: "jewelry_emerald_pearl_necklace", category: "accessories", owned: "has_jewelry_emerald_pearl_necklace", slot: "Neck",
      weight: 0.3, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_jewelry_emerald_pearl_necklace) || 0); return "Emerald Pearl Necklace" + (n > 1 ? " ×" + n : ""); },
      description: "Pale pearl necklace ending in a deep green emerald drop.",
      traits: "Neck slot; pearls and emerald drop",
      badge: function (s) { return s.equipped_neck_id === "jewelry_emerald_pearl_necklace" ? "Worn" : "Stowed"; },
      equip: { slot: "neck", id: "jewelry_emerald_pearl_necklace" }
    },
    {
      id: "jewelry_ruby_pearl_necklace", category: "accessories", owned: "has_jewelry_ruby_pearl_necklace", slot: "Neck",
      weight: 0.3, stow: true, stack: true,
      name: function (s) { var n = 1 + (Number(s.spare_jewelry_ruby_pearl_necklace) || 0); return "Ruby Pearl Necklace" + (n > 1 ? " ×" + n : ""); },
      description: "Pale pearl necklace ending in a dark red ruby drop.",
      traits: "Neck slot; pearls and ruby drop",
      badge: function (s) { return s.equipped_neck_id === "jewelry_ruby_pearl_necklace" ? "Worn" : "Stowed"; },
      equip: { slot: "neck", id: "jewelry_ruby_pearl_necklace" }
    },
    {
      id: "jewelry_sapphire_gold_ring", category: "accessories", owned: "has_jewelry_sapphire_gold_ring", slot: "Ring",
      weight: 0.1, stow: true, stack: false,
      name: "Sapphire Gold Ring",
      description: "Deep blue sapphire set above a leaf-chased gold band.",
      badge: function (s) { return (s.equipped_ring1_id === "jewelry_sapphire_gold_ring" || s.equipped_ring2_id === "jewelry_sapphire_gold_ring") ? "Worn" : "Stowed"; },
      equip: { slot: "ring", id: "jewelry_sapphire_gold_ring" }
    },
    {
      id: "jewelry_ruby_gold_ring", category: "accessories", owned: "has_jewelry_ruby_gold_ring", slot: "Ring",
      weight: 0.1, stow: true, stack: false,
      name: "Ruby Gold Ring",
      description: "Deep red ruby set in a heavy worked gold band.",
      badge: function (s) { return (s.equipped_ring1_id === "jewelry_ruby_gold_ring" || s.equipped_ring2_id === "jewelry_ruby_gold_ring") ? "Worn" : "Stowed"; },
      equip: { slot: "ring", id: "jewelry_ruby_gold_ring" }
    },
    {
      id: "jewelry_diamond_gold_ring", category: "accessories", owned: "has_jewelry_diamond_gold_ring", slot: "Ring",
      weight: 0.1, stow: true, stack: false,
      name: "Diamond Gold Ring",
      description: "Clear diamond set above a leaf-chased gold band.",
      badge: function (s) { return (s.equipped_ring1_id === "jewelry_diamond_gold_ring" || s.equipped_ring2_id === "jewelry_diamond_gold_ring") ? "Worn" : "Stowed"; },
      equip: { slot: "ring", id: "jewelry_diamond_gold_ring" }
    },
    // GEN:END gear_items
    // ---- weapons ----

    // ---- apparel ----
    {
      id: "talia_oiled_cloak", category: "apparel", owned: "has_talia_oiled_cloak",
      weight: 4,
      name: "Talia's Cloak",
      description: "Heavy oil-dark cloak, waxed against river spray and marsh rot.",
      badge: function (s) { return s.equipped_cloak_id === "talia_oiled_cloak" ? "Worn" : "Stowed"; },
      equip: { slot: "cloak", id: "talia_oiled_cloak" }
    },
    {
      id: "rorik_grip_wraps", category: "apparel", owned: "has_rorik_grip_wraps",
      weight: 0.5,
      name: "Rorik's Grip Wraps",
      description: "Tarred cord wound over the palm for a sure grip.",
      badge: function (s) { return s.equipped_hands_id === "rorik_grip_wraps" ? "Worn" : "Stowed"; },
      equip: { slot: "hands", id: "rorik_grip_wraps" }
    },
    {
      id: "rorik_campaign_belt", category: "apparel", owned: "has_rorik_campaign_belt",
      weight: 1,
      name: "Rorik's Campaign Belt",
      description: "A broad belt riveted with iron studs.",
      badge: function (s) { return s.equipped_waist_id === "rorik_campaign_belt" ? "Worn" : "Stowed"; },
      equip: { slot: "waist", id: "rorik_campaign_belt" }
    },
    {
      id: "talia_deck_boots", category: "apparel", owned: "has_talia_deck_boots",
      weight: 4,
      name: "Talia's Deck Boots",
      description: "Waterproofed brine-shed boots, wax-sealed river-tight.",
      badge: function (s) { return s.equipped_feet_id === "talia_deck_boots" ? "Worn" : "Stowed"; },
      equip: { slot: "feet", id: "talia_deck_boots" }
    },
    {
      id: "brant_iron_heel_boots", category: "apparel", owned: "has_brant_iron_heel_boots",
      weight: 5,
      name: "Brant's Iron-Heel Boots",
      description: "Heavy bull-hide boots pitch-sealed against estuary damp, fitted with caulked iron heel-plates for slipway grip. While worn: rain exposure -20%; Caulked Grip +2 on footing checks.",
      badge: function (s) { return s.equipped_feet_id === "brant_iron_heel_boots" ? "Worn" : "Stowed"; },
      equip: { slot: "feet", id: "brant_iron_heel_boots" }
    },

    // ---- the mount (hand-written: it is not gear, so it is not in tools/gear_catalog.json) ----
    {
      id: "horse", category: "mounts", owned: "has_horse",
      weight: 0,
      keep: "You would never leave your horse behind.",   // a keep tag (web/mygame/discard.js): the reason it can never be thrown away
      name: function (s) { return String(s.horse_name || "Horse"); },
      description: function (s) { return "Your " + String(s.horse_coat || "") + " " + (s.horse_sex === "gelding" ? "gelding" : "mare") + ", bridled and saddled. You ride on the road: a mile takes about 12 minutes instead of 24. A stable keeps it for 2 copper a day in a town or city and 1 in a village, and it grazes free on the road. Three days unpaid and the stable keeps it." + (Number(s.horse_unpaid_days) > 0 ? " The stable is owed " + Number(s.horse_owed) + " copper (" + Number(s.horse_unpaid_days) + " days unpaid)." : "");; },
      badge: function () { return "Ridden"; }
    },
    // ---- accessories & trinkets ----
    {
      id: "toll_seal_ring", category: "accessories", owned: "has_toll_seal_ring",
      weight: 0.1,
      name: "Officer's Signet Ring",
      description: "Tarnished silver band from a customs officer, stamped with a three-headed imperial hawk. Worn, it lets you cast Guidance.",
      badge: function (s) { return (s.equipped_ring1_id === "toll_seal_ring" || s.equipped_ring2_id === "toll_seal_ring") ? "Worn" : ""; },
      equip: { slot: "ring", id: "toll_seal_ring" }
    },
    {
      id: "night_eye_ring", category: "accessories", owned: "has_night_eye_ring",
      weight: 0.1,
      name: "Night-Eye Ring",
      description: "Black horn polished smooth by many thumbs, a smuggler's ring from the Silt-Gate Vault. Worn, you see in the dark: no light needed, and none of the penalties of fighting blind.",
      badge: function (s) { return (s.equipped_ring1_id === "night_eye_ring" || s.equipped_ring2_id === "night_eye_ring") ? "Worn" : "Stowed"; },
      equip: { slot: "ring", id: "night_eye_ring" }
    },
    {
      id: "althea_votive_ring", category: "accessories", owned: "has_althea_votive_ring",
      weight: 0.1,
      name: "Althea's Stone Ring",
      description: "Flat river stone, silver-wired, taken from Saint Althea's altar offerings.",
      badge: function (s) { return (s.equipped_ring1_id === "althea_votive_ring" || s.equipped_ring2_id === "althea_votive_ring") ? "Worn" : "Stowed"; },
      equip: { slot: "ring", id: "althea_votive_ring" }
    },
    {
      id: "silverstar", category: "accessories", owned: "has_silverstar",
      weight: 0.1,
      name: "The Silverstar",
      description: "A silver starburst brooch from Solaine of the Radiant Order, made to protect common folk and monster hunters. It holds a single charge of Remove Curse, touch, and glows brightly when it discharges. A Remove Curse working renews it; it holds one charge at a time.",
      badge: function (s) { return truthy(s.silverstar_charged) ? "One charge held" : "Spent, renew with Remove Curse"; }
    },
    {
      id: "hearthstone_talisman", category: "accessories", owned: "has_hearthstone_talisman",
      weight: 1,
      name: "Torvald's Hearthstone Talisman",
      description: "Ancient highland furnace lodestone on braided oxhide.",
      badge: function (s) { return truthy(s.hearthstone_attuned) ? "Attuned, +1 Constitution" : "Not Attuned"; },
      // Attuning cascades into recalculate_attuned_bonuses (startup.txt), which touches CON and max HP, so the panel never writes it itself: inventory.js hands
      // it to ChoiceScript (choicescript_stats codex_attune_do), the same way a piece with an ability-score bonus is handed to codex_equip_do.
      equip: { slot: "neck", id: "hearthstone_talisman", attune: true }
    },
    {
      id: "shield", category: "accessories", owned: "has_shield",
      weight: 6,
      name: "Oak Shield",
      description: "Heavy oak-and-iron shield with cold-hammered boss.",
      badge: function (s) { return truthy(s.shield_equipped) ? "Equipped, +2 AC" : "Stowed"; },
      equip: { slot: "shield" }
    },

    // ---- provisions & trail gear ----
    {
      id: "scrap_steel", category: "provisions",
      weight: 2,
      owned: function (s) { return Number(s.scrap_steel) > 0; },
      name: function (s) { return "Scrap Steel (" + Number(s.scrap_steel) + ")"; },
      description: "Bent blades and iron fittings, worth a little to a smith by weight.",
      badge: "Sells to a smith"
    },
    {
      id: "frog_slime", category: "provisions",
      weight: 0.5,
      owned: function (s) { return Number(s.frog_slime) > 0; },
      name: function (s) { return "Frog Slime (" + Number(s.frog_slime) + ")"; },
      description: "Cold, clear slime scraped from a giant frog. Ambrose buys it by the jar.",
      badge: "Sells to a herbalist"
    },
    {
      id: "centipede_gland", category: "provisions",
      weight: 0.2,
      owned: function (s) { return Number(s.centipede_gland) > 0; },
      name: function (s) { return "Centipede Gland (" + Number(s.centipede_gland) + ")"; },
      description: "A venom gland cut from a giant centipede. Ambrose buys it by the piece.",
      badge: "Sells to a herbalist"
    },
    {
      id: "viper_venom", category: "provisions",
      weight: 0.2,
      owned: function (s) { return Number(s.viper_venom) > 0; },
      name: function (s) { return "Viper Venom (" + Number(s.viper_venom) + ")"; },
      description: "Venom milked from a giant viper.",
      badge: "Sells to a herbalist"
    },
    {
      id: "scrapling_claw", category: "provisions",
      weight: 0.5,
      owned: function (s) { return Number(s.scrapling_claw) > 0; },
      name: function (s) { return "Scrapling Claw (" + Number(s.scrapling_claw) + ")"; },
      description: "A hooked claw of knotted wood, still sharp. Roi Sunderhammer may know what to make of it."
    },
    {
      id: "sage", category: "provisions",
      weight: 0.1,
      owned: function (s) { return Number(s.sage) > 0; },
      name: function (s) { return "Sage (" + Number(s.sage) + ")"; },
      description: "Grey-green leaves, soft as felt, that smell of dust and warm resin."
    },
    {
      id: "hornwort", category: "provisions",
      weight: 0.1,
      owned: function (s) { return Number(s.hornwort) > 0; },
      name: function (s) { return "Hornwort (" + Number(s.hornwort) + ")"; },
      description: "A dripping handful of feathery water-weed, dark green and slick to hold."
    },
    {
      id: "wolfsbane", category: "provisions",
      weight: 0.1,
      owned: function (s) { return Number(s.wolfsbane) > 0; },
      name: function (s) { return "Wolfsbane (" + Number(s.wolfsbane) + ")"; },
      description: "Hooded blue flowers on a bundled stem. Every part of it is poison, and Tomlin handles it with gloves."
    },
    {
      id: "grave_ichor", category: "provisions",
      weight: 0.5,
      owned: function (s) { return Number(s.grave_ichor) > 0; },
      name: function (s) { return "Grave Ichor (" + Number(s.grave_ichor) + ")"; },
      description: "Black fluid drawn from the drowned dead. Ambrose buys it by the phial.",
      badge: "Sells to a herbalist"
    },
    {
      id: "raw_hide", category: "provisions", weight: 3,
      owned: function (s) { return Number(s.raw_hide) > 0; },
      name: function (s) { return "Raw Hide (" + Number(s.raw_hide) + ")"; },
      description: "A skinned hide, still green. A trapper or the Hide Yard buys it by the piece.",
      badge: "Sells to a trapper"
    },
    {
      id: "boar_tusk", category: "provisions", weight: 0.5,
      owned: function (s) { return Number(s.boar_tusk) > 0; },
      name: function (s) { return "Boar Tusk (" + Number(s.boar_tusk) + ")"; },
      description: "A curved tusk, yellowed and ridged. A trapper buys it by the piece.",
      badge: "Sells to a trapper"
    },
    {
      id: "elk_antler", category: "provisions", weight: 1.5,
      owned: function (s) { return Number(s.elk_antler) > 0; },
      name: function (s) { return "Elk Antler (" + Number(s.elk_antler) + ")"; },
      description: "A branching antler, brown and ridged. A trapper buys it by the piece.",
      badge: "Sells to a trapper"
    },
    // Forage ingredients keep their future alchemy information here, rather than in their
    // descriptions: effects can remain unknown to the player until they discover them.
    {
      id: "sluice_moss", category: "provisions", weight: 0.1,
      owned: function (s) { return Number(s.sluice_moss) > 0; },
      name: function (s) { return "Sluice-moss (" + Number(s.sluice_moss) + ")"; },
      description: "Green-grey moss scraped from wet brick seams in the Silt-Gate Channels.",
      badge: "Ingredient",
      alchemy: { source: "silt_gates", form: "moss", rarity: "common", potency: 1, effects: ["mend", "resist_poison"] }
    },
    {
      id: "brinecap", category: "provisions", weight: 0.1,
      owned: function (s) { return Number(s.brinecap) > 0; },
      name: function (s) { return "Brinecap (" + Number(s.brinecap) + ")"; },
      description: "A squat, salt-speckled fungus gathered above the channel's high-water line.",
      badge: "Ingredient",
      alchemy: { source: "silt_gates", form: "fungus", rarity: "common", potency: 1, effects: ["resist_poison", "hold_breath"] }
    },
    {
      id: "pale_crackroot", category: "provisions", weight: 0.1,
      owned: function (s) { return Number(s.pale_crackroot) > 0; },
      name: function (s) { return "Pale Crackroot (" + Number(s.pale_crackroot) + ")"; },
      description: "Chalk-pale roots pulled from a fissure where the street above has found the dark.",
      badge: "Ingredient",
      alchemy: { source: "silt_gates", form: "root", rarity: "uncommon", potency: 1, effects: ["hold_breath", "keen_sight"] }
    },
    {
      id: "cistern_spores", category: "provisions", weight: 0.1,
      owned: function (s) { return Number(s.cistern_spores) > 0; },
      name: function (s) { return "Cistern Spores (" + Number(s.cistern_spores) + ")"; },
      description: "Fine, dry spores collected from an old culvert beyond the reach of the tide.",
      badge: "Ingredient",
      alchemy: { source: "silt_gates", form: "spore", rarity: "rare", potency: 1, effects: ["keen_sight", "fortify_health"] }
    },
    {
      id: "glowmold", category: "provisions", weight: 0.1,
      owned: function (s) { return Number(s.glowmold) > 0; },
      name: function (s) { return "Glowmold (" + Number(s.glowmold) + ")"; },
      description: "A faintly luminous film gathered from stone kept wet and dark.",
      badge: "Ingredient",
      alchemy: { source: "silt_gates", form: "mold", rarity: "uncommon", potency: 1, effects: ["fortify_health", "mend"] }
    },
    {
      id: "silverleaf", category: "provisions", weight: 0.1,
      owned: function (s) { return Number(s.silverleaf) > 0; },
      name: function (s) { return "Silverleaf (" + Number(s.silverleaf) + ")"; },
      description: "Soft silver-backed leaves gathered from a rare break in Longshade's canopy.",
      badge: "Ingredient",
      alchemy: { source: "longshade_forest", form: "herb", rarity: "common", potency: 1, effects: ["mend_rest", "clear_mind"] }
    },
    {
      id: "oakheart_balsam", category: "provisions", weight: 0.1,
      owned: function (s) { return Number(s.oakheart_balsam) > 0; },
      name: function (s) { return "Oakheart Balsam (" + Number(s.oakheart_balsam) + ")"; },
      description: "A fragrant amber resin collected from a scored oak or fallen beech.",
      badge: "Ingredient",
      alchemy: { source: "longshade_forest", form: "resin", rarity: "common", potency: 1, effects: ["mend_rest", "resist_cold"] }
    },
    {
      id: "shadefern", category: "provisions", weight: 0.1,
      owned: function (s) { return Number(s.shadefern) > 0; },
      name: function (s) { return "Shadefern (" + Number(s.shadefern) + ")"; },
      description: "A cool, dark-green fern cut from wet stone beneath the oldest trees.",
      badge: "Ingredient",
      alchemy: { source: "longshade_forest", form: "fern", rarity: "uncommon", potency: 1, effects: ["resist_cold", "fortify_health"] }
    },
    {
      id: "acorn_truffle", category: "provisions", weight: 0.1,
      owned: function (s) { return Number(s.acorn_truffle) > 0; },
      name: function (s) { return "Acorn Truffle (" + Number(s.acorn_truffle) + ")"; },
      description: "A knobbly brown truffle unearthed from the leaf mold below an old oak.",
      badge: "Ingredient",
      alchemy: { source: "longshade_forest", form: "truffle", rarity: "rare", potency: 1, effects: ["fortify_health", "surefooted"] }
    },
    {
      id: "brambleberry", category: "provisions", weight: 0.1,
      owned: function (s) { return Number(s.brambleberry) > 0; },
      name: function (s) { return "Brambleberry (" + Number(s.brambleberry) + ")"; },
      description: "A tart, near-black berry picked from briars along a game trail.",
      badge: "Ingredient",
      alchemy: { source: "longshade_forest", form: "berry", rarity: "uncommon", potency: 1, effects: ["surefooted", "clear_mind"] }
    },
    {
      id: "odessa_salve", category: "provisions", owned: "prep_odessa_salve",
      weight: 0.5,
      name: "Tin of Camphor Fat",
      description: "Pungent herbal lanolin balm from Surgeon Odessa."
    },
    {
      id: "fish_cache", category: "provisions", owned: "found_fish_cache",
      weight: 5,
      name: "Squatters' Cache",
      description: "Smoked river fish, dried meat, and rushlight candle stubs."
    },
    {
      id: "kestrel_dispatch", category: "provisions",
      weight: 0.1,
      owned: function (s) { return truthy(s.errand_kestrel_unlocked) && !truthy(s.visited_bivouac_kestrel); },
      name: "Sentry Dispatch Order",
      description: "Wooden dispatch board and straightened iron bodkins."
    },
    {
      id: "ysolde_requisition", category: "provisions",
      weight: 0.1,
      owned: function (s) { return truthy(s.errand_ysolde_unlocked) && !truthy(s.visited_bivouac_ysolde); },
      name: "Cadre Supply Requisition",
      description: "Crate of beeswax tapers and reagent requisition chits."
    },
    {
      id: "vanguard_grease_chit", category: "provisions",
      weight: 0.1,
      owned: function (s) { return truthy(s.errand_vanguard_unlocked) && !truthy(s.visited_bivouac_lyra); },
      name: "Armorer's Grease Chit",
      description: "Signed requisition chit for blade-grease."
    },
    {
      id: "customs_vellum", category: "provisions",
      weight: 0.1,
      owned: function (s) { return truthy(s.found_customs_vellum) && !truthy(s.turned_in_customs_vellum); },
      name: "Grey Waterway Toll Register",
      description: "Preserved provincial toll ledger with the three-headed hawk imperial wax seal."
    },
    {
      id: "waterproof_gear", category: "provisions", owned: "prep_waterproof_gear",
      weight: 4,
      name: "Waterproofing Grease Tins",
      description: "Refined mutton wax and hoof oil for boots and bowstring seams."
    },
    {
      id: "talia_provisions", category: "provisions", owned: "has_talia_provisions",
      weight: 4,
      name: "Hearth-Baked Travel Provisions",
      description: "Warm crusty bread and salt-cured river trout wrapped in greasecloth."
    },

    // ---- documents & leverage ----
    {
      id: "rotten_rib_splinter", category: "documents", owned: "has_rotten_rib_splinter",
      weight: 0.5,
      name: "Sap-Weeping Spruce Splinter",
      description: "A wet, pitch-stained splinter of green mountain spruce sheared from the fourth rib of Slipway Two.",
      badge: "Physical Evidence"
    },
    {
      id: "pellam_pouch", category: "documents", owned: "has_pellam_pouch",
      weight: 0.2,
      name: "Leaf-Stitched Pouch",
      description: "A small leather pouch with a green leaf stitched on the flap, the thread gone grey. Someone sewed it with care.",
      badge: "Evidence"
    },
    {
      id: "ressa_hale_ring", category: "documents", owned: "has_ressa_hale_ring",
      weight: 0.05,
      name: "Ressa Hale's Ring",
      description: function (s) { return truthy(s.hale_ring_cut_known) ? "A worn gold ring engraved R. H., set with a small diamond cut in an unusual, deliberate pattern." : "A worn gold ring engraved R. H., set with a small, sharply cut diamond."; },
      badge: "Quest Item"
    },
    {
      id: "diverted_timber_waybill", category: "documents", owned: "has_diverted_timber_waybill",
      weight: 0.1,
      name: "Diverted Timber Waybill",
      description: "Scribed transit waybill bearing Master Hendryk's personal proof-stamp, falsely condemning naval heartwood for worm-rot.",
      badge: "Evidence"
    },
    {
      id: "silt_gate_payout_slip", category: "documents", owned: "has_silt_gate_payout_slip",
      weight: 0.1,
      name: "Broker's Payout Slip",
      description: "Wax vellum in a smuggler's hand, listing the night-sergeants who take weekly payoffs to leave the Silt-Gates unwatched.",
      badge: "Leverage"
    },
    {
      id: "hall_insignia", category: "documents", owned: "has_hall_insignia",
      weight: 0.2,
      name: "Contractor's Insignia",
      description: function (s) {
        var pages = insignia().pages(s).map(function (p) { return p.page + " page: " + p.rankName + ", " + p.jobs + (p.jobs === 1 ? " job" : " jobs") + " finished."; });
        return "A palm-sized brass contractor's disc. Your name, rank and the terms of what you sign are set into the metal, where any reader can pass over it and tell; the signature in it is yours alone. It keeps a separate page for each government that has registered you. " + pages.join(" ");
      },
      badge: function (s) {
        return insignia().pages(s).map(function (p) { return p.rankName; }).join(" · ");
      }
    },
    {
      id: "letter_of_credit", category: "documents", owned: "has_letter_of_credit",
      weight: 0.1,
      name: "Gilded Scales Letter of Credit",
      description: function (s) {
        return "Redeemable in Port Valen or Alderford — worth " + formatCoinAmount(Number(s.letter_of_credit_value) || 0) + ".";
      }
    },

    // ---- consumables ----
    // (Saint Althea's phial, Ambrose's liniment and draught come from the catalog, in the generated block above.)
  ]
};

function insignia() { return (typeof window !== "undefined" ? window : global).Insignia; }

/*
 * THE CONTRACTOR'S INSIGNIA, one page for each government (2026-10-30, the user's design). The Insignia is a single global item, a contractor's resume: its magical signature is unique and cannot
 * be faked, so an employer reads it at a glance. It keeps a separate page per government, each with its own job count and its own rank; a rank from one government grants no authority in another
 * (a Gilded Scales rank means nothing to House Gault). A page's rank is DERIVED, never stored by hand: Insignia.refresh walks the page's ladder and stops at the first rung not yet met. A rung asks
 * for a number of finished jobs (jobs), a story flag (flag: a promotion scene, or a grant from the ruler), or both. A page is "none" until the player is registered with it.
 * The disc and its pages are separate: any hall that sells the disc calls Insignia.issue (the three Gilded Scales sales call register, which issues and opens the Scales page; Langston Hall issues it and
 * opens the Gault page), and a hall opens its page on a disc the player already carries with Insignia.register. Scenes call Insignia.register(stats, id) when a government first registers the player, and Insignia.credit(stats, id) when a job for it is finished (from *script: the callers keep their own replay
 * guards). A new government is one entry in PAGES and its stats in startup_parts/23: <jobs>, <rank>, <creditVar> (its courier count), its registered flag and the flags its ladder names. Scenes never name a
 * government to say or decide something about its page: they ask canTake, needText, line, courierDelivered and courierLine, which read the page's fields. The numbers below are first guesses to tune.
 * The ranks are the user's: Gilded Scales Open > Bonded > Sealed > Named (commercial reliability and access to sensitive contracts); House Gault Listed > Proven > Vouched > Commissioned (service,
 * noble sponsorship and delegated authority; Commissioned is granted by the Countess and never earned by repetition, and it does not make the player noble or a retainer).
 */
(typeof window !== "undefined" ? window : global).Insignia = (function () {
  var PAGES = {
    scales: {
      government: "The Gilded Scales", page: "Port Valen", jobs: "hall_jobs_scales", rank: "hall_insignia_rank_scales", creditVar: "cr_credit_scales", registeredVar: "hall_scales_registered",
      registered: function (s) { return truthy(s.has_hall_insignia) && truthy(s.hall_scales_registered); },
      // any Insignia may take a Gilded Scales board's work: finishing the first job opens the Port Valen page (credit)
      canTake: function (s) { return truthy(s.has_hall_insignia); },
      needText: "You reach for the posting, and the seal at its foot is the Hall's, not a village's. The work goes to a bearer of a Contractor's Insignia, and the Seals window in Port Valen sells one, once.",
      register: function (s) { s.has_hall_insignia = true; s.hall_scales_registered = true; },
      ladder: [{ id: "open" }, { id: "bonded", jobs: 5 }, { id: "sealed", jobs: 15, flag: "hall_scales_sealed" }, { id: "named", flag: "hall_scales_named" }]
    },
    gault: {
      government: "House Gault", page: "House Gault", jobs: "hall_jobs_gault", rank: "hall_insignia_rank_gault", creditVar: "cr_credit_gault", registeredVar: "hall_gault_registered",
      registered: function (s) { return truthy(s.has_hall_insignia) && truthy(s.hall_gault_registered); },
      // House Gault's work is open to a Gault page, Listed or above
      canTake: function (s) { return truthy(s.has_hall_insignia) && truthy(s.hall_gault_registered); },
      needText: "You reach for the posting, and the counterseal at its foot is the mayor's. The work goes to a bearer of a House Gault page. The clerks at the Hall's counters open one on a Contractor's Insignia, or sell you the Insignia with the page already on it.",
      register: function (s) { s.hall_gault_registered = true; },
      ladder: [{ id: "listed" }, { id: "proven", jobs: 3 }, { id: "vouched", jobs: 6, flag: "hall_gault_vouched" }, { id: "commissioned", flag: "hall_gault_commissioned" }]
    }
  };
  function jobsOf(s, id) { return Number(s[PAGES[id].jobs]) || 0; }
  function rankOf(s, id) {
    var page = PAGES[id], rank = "none";
    if (!page.registered(s)) return rank;
    for (var i = 0; i < page.ladder.length; i++) {
      var rung = page.ladder[i];
      if (rung.jobs !== undefined && jobsOf(s, id) < rung.jobs) break;
      if (rung.flag !== undefined && !truthy(s[rung.flag])) break;
      rank = rung.id;
    }
    return rank;
  }
  function refresh(s) { for (var id in PAGES) s[PAGES[id].rank] = rankOf(s, id); }
  function pageOf(id) { return PAGES[id] || PAGES.scales; }   // anything unknown is a Gilded Scales job, as every job was before the Vale
  var COURIER_SET = 3;   // courier deliveries that make one finished job on a page
  return {
    pages: function (s) {
      var out = [];
      for (var id in PAGES) {
        var r = rankOf(s, id);
        if (r !== "none") out.push({ id: id, government: PAGES[id].government, page: PAGES[id].page, rank: r, rankName: r.charAt(0).toUpperCase() + r.slice(1), jobs: jobsOf(s, id) });
      }
      return out;
    },
    ids: function () { return Object.keys(PAGES); },
    ladder: function (id) { return PAGES[id].ladder.map(function (r) { return r.id; }); },
    // what the page's next rung still asks for, for a clerk to read out: { next: rung id ("" at the top or unregistered), jobsLeft: jobs still to finish, flagNeeded: a promotion or grant is also required }
    next: function (s, id) {
      var page = PAGES[id], r = rankOf(s, id), at = -1;
      for (var i = 0; i < page.ladder.length; i++) if (page.ladder[i].id === r) at = i;
      if (r === "none" || at < 0 || at >= page.ladder.length - 1) return { next: "", jobsLeft: 0, flagNeeded: false };
      var rung = page.ladder[at + 1];
      return { next: rung.id, jobsLeft: rung.jobs !== undefined ? Math.max(0, rung.jobs - jobsOf(s, id)) : 0, flagNeeded: rung.flag !== undefined && !truthy(s[rung.flag]) };
    },
    refresh: refresh,
    // what a scene needs to say or decide about a page, so none of them names a government: whether the player may take a board's work, the message when they may not, the "Insignia:" line after a job, and the
    // courier's count (every COURIER_SET deliveries credit one job; courierLine says where the count stands, or the finished jobs on the delivery that completed a set)
    canTake: function (s, id) { return !!pageOf(id).canTake(s); },
    needText: function (id) { return pageOf(id).needText; },
    line: function (s, id) { var p = pageOf(id), n = Number(s[p.jobs]) || 0; return "Insignia: " + p.page + " page, " + n + (n === 1 ? " job" : " jobs") + " finished"; },
    courierDelivered: function (s, id) {
      var p = pageOf(id), key = Object.keys(PAGES).filter(function (k) { return PAGES[k] === p; })[0], c = (Number(s[p.creditVar]) || 0) + 1;
      if (c >= COURIER_SET) { s[p.creditVar] = 0; this.credit(s, key); } else s[p.creditVar] = c;
    },
    courierLine: function (s, id) {
      var p = pageOf(id), c = Number(s[p.creditVar]) || 0;
      return c === 0 ? this.line(s, id) : "Insignia: courier work, " + c + " of " + COURIER_SET + " deliveries toward the next job on the " + p.page + " page";
    },
    // issue: a government's hall sells the blank disc. It opens no page by itself; register does.
    issue: function (s) { s.has_hall_insignia = true; refresh(s); },
    register: function (s, id) { PAGES[id].register(s); refresh(s); },
    // finishing a job writes it on the employer's page, so a page that was never opened is opened first
    credit: function (s, id) { if (!PAGES[id].registered(s)) PAGES[id].register(s); s[PAGES[id].jobs] = jobsOf(s, id) + 1; refresh(s); }
  };
})();

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
