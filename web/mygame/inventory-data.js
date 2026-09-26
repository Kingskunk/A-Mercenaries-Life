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
  //   - Cloak: "switch back to your ORIGIN's cloak" (wool_mantle/camo_cloak/weather_cloak, ALWAYS
  //     offered) + has_x alternates (Talia's oiled cloak), as of the exposure traits (calendar.txt
  //     cloak_traits). Never offers "no cloak".
  //   - Hands, Waist, Feet: "switch back to your ORIGIN's piece" (ALWAYS offered) + has_x alternates (the
  //     tailor's stock, Talia's and Brant's boots, Rorik's camp gifts), as of the Gilt Needle. Never "bare".
  //   - Neck, Rings: NO equip choice in the real menu
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
    { label: "Cloak", shape: "plain", desc: "cloak_desc", bucket: "cloak",
      swappable: true,
      always: function (s) {
        var originDefault = { ruined: "wool_mantle", outlaw: "camo_cloak", disgraced: "weather_cloak" };
        return [originDefault[s.origin] || "wool_mantle"];
      } },
    { label: "Hands", shape: "plain", desc: "hands_desc", bucket: "hands",
      swappable: true,
      always: function (s) {
        var originDefault = { ruined: "leather_wraps", outlaw: "archer_bracers", disgraced: "scribe_gloves" };
        return [originDefault[s.origin] || "leather_wraps"];
      } },
    { label: "Waist", shape: "plain", desc: "waist_desc", bucket: "waist",
      swappable: true,
      always: function (s) {
        var originDefault = { ruined: "soldiers_belt", outlaw: "scabbard_belt", disgraced: "satchel_harness" };
        return [originDefault[s.origin] || "soldiers_belt"];
      } },
    { label: "Feet", shape: "plain", desc: "feet_desc", bucket: "feet",
      swappable: true,
      always: function (s) {
        var originDefault = { ruined: "marching_boots", outlaw: "scout_boots", disgraced: "riding_boots" };
        return [originDefault[s.origin] || "marching_boots"];
      } },
    { label: "Neck", shape: "plain", desc: "neck_desc", bucket: "neck" },
    { label: "Ring (1)", shape: "plain", desc: "ring1_desc", bucket: "ring", ringSlot: "1" },
    { label: "Ring (2)", shape: "plain", desc: "ring2_desc", bucket: "ring", ringSlot: "2" }
  ],

  items: [
    // GEN:BEGIN gear_items -- generated by tools/gen_gear.js from tools/gear_catalog.json; edit the catalog, not this block
    {
      id: "timber_axe", category: "weapons", owned: "has_timber_axe", slot: "Weapon",
      name: function (s) { var n = 1 + (Number(s.spare_timber_axe) || 0); return "Highland Hewing Axe" + (n > 1 ? " ×" + n : ""); },
      description: "Broad-bearded single-handed felling axe with a hardened wedge.",
      traits: "1d8 Slashing, One-Handed",
      badge: function (s) { return s.equipped_weapon_id === "timber_axe" ? "Equipped" : ""; },
      equip: { slot: "weapon", id: "timber_axe" }
    },
    {
      id: "stiletto", category: "weapons", owned: "has_stiletto", slot: "Weapon",
      name: function (s) { var n = 1 + (Number(s.spare_stiletto) || 0); return "Alderford Stiletto" + (n > 1 ? " ×" + n : ""); },
      description: "Slender square-section thrusting dagger ground from scrap file-steel.",
      traits: "1d4 Piercing, Finesse",
      badge: function (s) { return s.equipped_weapon_id === "stiletto" ? "Equipped" : ""; },
      equip: { slot: "weapon", id: "stiletto" }
    },
    {
      id: "iron_crowbar", category: "provisions", owned: "has_iron_crowbar",
      name: function (s) { var n = 1 + (Number(s.spare_iron_crowbar) || 0); return "Iron Prybar" + (n > 1 ? " ×" + n : ""); },
      description: "Cold-forged crowbar and tempered wedges for forcing stubborn locks and stone seams."
    },
    {
      id: "torvald_iron_sallet", category: "apparel", owned: "has_torvald_iron_sallet", slot: "Head",
      name: function (s) { var n = 1 + (Number(s.spare_torvald_iron_sallet) || 0); return "Iron Skullcap" + (n > 1 ? " ×" + n : ""); },
      description: "Plain riveted steel skullcap, guild-stamped at Torvald's forge.",
      traits: "+1 AC, Counts as Armor",
      badge: function (s) { return s.equipped_head_id === "torvald_iron_sallet" ? "Equipped, +1 AC" : "Stowed"; },
      equip: { slot: "head", id: "torvald_iron_sallet" }
    },
    {
      id: "torvald_hide_cap", category: "apparel", owned: "has_torvald_hide_cap", slot: "Head",
      name: function (s) { var n = 1 + (Number(s.spare_torvald_hide_cap) || 0); return "Leather Watch Cap" + (n > 1 ? " ×" + n : ""); },
      description: "Stiffened leather skullcap, cheap and close-fitting under a hood.",
      badge: function (s) { return s.equipped_head_id === "torvald_hide_cap" ? "Equipped" : "Stowed"; },
      equip: { slot: "head", id: "torvald_hide_cap" }
    },
    {
      id: "brigandine", category: "apparel", owned: "has_brigandine", slot: "Body armor",
      name: function (s) { var n = 1 + (Number(s.spare_brigandine) || 0); return "Studded Gambeson" + (n > 1 ? " ×" + n : ""); },
      description: "Quilted wool-and-canvas coat with rows of iron studs sewn between the layers.",
      traits: "Medium Armor: AC 13 + DEX, max +2",
      badge: function (s) { return s.equipped_armor_id === "brigandine" ? "Worn, Medium Armor" : "Stowed"; },
      equip: { slot: "armor", id: "brigandine" }
    },
    {
      id: "chain_jack", category: "apparel", owned: "has_chain_jack", slot: "Body armor",
      name: function (s) { var n = 1 + (Number(s.spare_chain_jack) || 0); return "Iron Chain Shirt" + (n > 1 ? " ×" + n : ""); },
      description: "Hand-closed mail rings over a wool lining, with doubled seams at the neck and hips.",
      traits: "Medium Armor: AC 13 + DEX, max +2",
      badge: function (s) { return s.equipped_armor_id === "chain_jack" ? "Worn, Medium Armor" : "Stowed"; },
      equip: { slot: "armor", id: "chain_jack" }
    },
    {
      id: "plate_harness", category: "apparel", owned: "has_plate_harness", slot: "Body armor",
      name: function (s) { var n = 1 + (Number(s.spare_plate_harness) || 0); return "Iron Plate Harness" + (n > 1 ? " ×" + n : ""); },
      description: "Overlapping iron plates riveted over a mail coat, with hinged shoulders and lapped hip plates.",
      traits: "Heavy Armor: AC 16, no DEX bonus",
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
      name: function (s) { var n = 1 + (Number(s.spare_althea_phial) || 0); return "Saint Althea's Water" + (n > 1 ? " ×" + n : ""); },
      description: "Wax-stoppered clay flask of blessed cistern-water steeped with wild angelica and mountain arnica.",
      badge: "Restores 2d4+2 HP",
      use: true
    },
    {
      id: "linen_bandage", category: "consumables", owned: "has_linen_bandage",
      name: function (s) { var n = 1 + (Number(s.spare_linen_bandage) || 0); return "Linen Bandage" + (n > 1 ? " ×" + n : ""); },
      description: "Boiled linen rolled around a pad of comfrey leaf, for binding a wound before sleep.",
      badge: "+1 HP from your next sleep",
      use: true
    },
    {
      id: "lye_soap", category: "consumables", owned: "has_lye_soap",
      name: function (s) { var n = 1 + (Number(s.spare_lye_soap) || 0); return "Lye Soap" + (n > 1 ? " ×" + n : ""); },
      description: "Brown-paper twist of grey lye-soap shavings, enough for one wash by a stream or the shore.",
      badge: "Hygiene back to Clean, with water at hand",
      use: true
    },
    {
      id: "hemp_rope", category: "provisions", owned: "has_hemp_rope",
      name: function (s) { var n = 1 + (Number(s.spare_hemp_rope) || 0); return "Hemp Rope" + (n > 1 ? " ×" + n : ""); },
      description: "Fifty feet of tarred hemp rope, coiled and tied off."
    },
    {
      id: "pitch_torch", category: "provisions", owned: "has_pitch_torch",
      name: function (s) { var n = 1 + (Number(s.spare_pitch_torch) || 0); return "Torch" + (n > 1 ? " ×" + n : ""); },
      description: "Pine stave wrapped in tarred rag and dipped in pitch."
    },
    {
      id: "lamp_oil", category: "provisions", owned: "has_lamp_oil",
      name: function (s) { var n = 1 + (Number(s.spare_lamp_oil) || 0); return "Lamp Oil" + (n > 1 ? " ×" + n : ""); },
      description: "Stoppered tin flask of lamp oil."
    },
    {
      id: "hooded_lantern", category: "provisions", owned: "has_hooded_lantern",
      name: function (s) { var n = 1 + (Number(s.spare_hooded_lantern) || 0); return "Hooded Lantern" + (n > 1 ? " ×" + n : ""); },
      description: "Iron lantern with horn windows and a sliding tin shutter."
    },
    {
      id: "tool_kit", category: "provisions", owned: "has_tool_kit",
      name: function (s) { var n = 1 + (Number(s.spare_tool_kit) || 0); return "Tool Kit" + (n > 1 ? " ×" + n : ""); },
      description: "Canvas roll of hammer, chisel, awl, pliers, folding saw and wire."
    },
    {
      id: "tinderbox", category: "provisions", owned: "has_tinderbox",
      name: function (s) { var n = 1 + (Number(s.spare_tinderbox) || 0); return "Flint and Tinderbox" + (n > 1 ? " ×" + n : ""); },
      description: "Dented tin box with a striker, flint and dry char-cloth."
    },
    {
      id: "chalk_sticks", category: "provisions", owned: "has_chalk_sticks",
      name: function (s) { var n = 1 + (Number(s.spare_chalk_sticks) || 0); return "Chalk Sticks" + (n > 1 ? " ×" + n : ""); },
      description: "Six sticks of soft white chalk tied with string."
    },
    {
      id: "wool_blanket", category: "provisions", owned: "has_wool_blanket",
      name: function (s) { var n = 1 + (Number(s.spare_wool_blanket) || 0); return "Wool Blanket" + (n > 1 ? " ×" + n : ""); },
      description: "Heavy grey wool blanket with a red stripe at each end."
    },
    {
      id: "waxed_oilcloth", category: "provisions", owned: "has_waxed_oilcloth",
      name: function (s) { var n = 1 + (Number(s.spare_waxed_oilcloth) || 0); return "Oilcloth Sheet" + (n > 1 ? " ×" + n : ""); },
      description: "Square of canvas soaked in linseed oil and wax, stiff and rain-proof."
    },
    {
      id: "lockpick_set", category: "provisions", owned: "has_lockpick_set",
      name: function (s) { var n = 1 + (Number(s.spare_lockpick_set) || 0); return "Lockpick Set" + (n > 1 ? " ×" + n : ""); },
      description: "Leather roll of slim steel picks, tension wrenches and a hooked rake."
    },
    {
      id: "padlock", category: "provisions", owned: "has_padlock",
      name: function (s) { var n = 1 + (Number(s.spare_padlock) || 0); return "Padlock and Key" + (n > 1 ? " ×" + n : ""); },
      description: "Heavy brass padlock with a steel shackle and two keys."
    },
    {
      id: "door_bolt", category: "provisions", owned: "has_door_bolt",
      name: function (s) { var n = 1 + (Number(s.spare_door_bolt) || 0); return "Door Bolt" + (n > 1 ? " ×" + n : ""); },
      description: "Forged iron slide-bolt with a keeper plate and wood screws."
    },
    {
      id: "iron_manacles", category: "provisions", owned: "has_iron_manacles",
      name: function (s) { var n = 1 + (Number(s.spare_iron_manacles) || 0); return "Iron Manacles" + (n > 1 ? " ×" + n : ""); },
      description: "Pair of hinged iron cuffs on a short chain, with one key."
    },
    {
      id: "broadcloth_cloak", category: "apparel", owned: "has_broadcloth_cloak", slot: "Cloak",
      name: function (s) { var n = 1 + (Number(s.spare_broadcloth_cloak) || 0); return "Traveler's Cloak" + (n > 1 ? " ×" + n : ""); },
      description: "Full-length cloak of stout undyed broadcloth.",
      traits: "Weather wear: cold -55%, rain -45%",
      badge: function (s) { return s.equipped_cloak_id === "broadcloth_cloak" ? "Worn" : "Stowed"; },
      equip: { slot: "cloak", id: "broadcloth_cloak" }
    },
    {
      id: "storm_cape", category: "apparel", owned: "has_storm_cape", slot: "Cloak",
      name: function (s) { var n = 1 + (Number(s.spare_storm_cape) || 0); return "Storm Cape" + (n > 1 ? " ×" + n : ""); },
      description: "Short waxed cape that sheds rain like a slate roof.",
      traits: "Weather wear: cold -30%, rain -75%",
      badge: function (s) { return s.equipped_cloak_id === "storm_cape" ? "Worn" : "Stowed"; },
      equip: { slot: "cloak", id: "storm_cape" }
    },
    {
      id: "winter_cloak", category: "apparel", owned: "has_winter_cloak", slot: "Cloak",
      name: function (s) { var n = 1 + (Number(s.spare_winter_cloak) || 0); return "Winter Cloak" + (n > 1 ? " ×" + n : ""); },
      description: "Heavy grey cloak lined in marten fur, with a tall collar.",
      traits: "Weather wear: cold -90%, rain -40%, heat +40%",
      badge: function (s) { return s.equipped_cloak_id === "winter_cloak" ? "Worn" : "Stowed"; },
      equip: { slot: "cloak", id: "winter_cloak" }
    },
    {
      id: "summer_duster", category: "apparel", owned: "has_summer_duster", slot: "Cloak",
      name: function (s) { var n = 1 + (Number(s.spare_summer_duster) || 0); return "Summer Duster" + (n > 1 ? " ×" + n : ""); },
      description: "Loose ankle-length linen coat with a vented back.",
      traits: "Weather wear: cold -10%, rain -30%, heat -60%",
      badge: function (s) { return s.equipped_cloak_id === "summer_duster" ? "Worn" : "Stowed"; },
      equip: { slot: "cloak", id: "summer_duster" }
    },
    {
      id: "felt_hat", category: "apparel", owned: "has_felt_hat", slot: "Head",
      name: function (s) { var n = 1 + (Number(s.spare_felt_hat) || 0); return "Felt Hat" + (n > 1 ? " ×" + n : ""); },
      description: "Pressed grey felt hat with a broad brim.",
      traits: "Weather wear: rain -15%, heat -25%",
      badge: function (s) { return s.equipped_head_id === "felt_hat" ? "Worn" : "Stowed"; },
      equip: { slot: "head", id: "felt_hat" }
    },
    {
      id: "fur_cap", category: "apparel", owned: "has_fur_cap", slot: "Head",
      name: function (s) { var n = 1 + (Number(s.spare_fur_cap) || 0); return "Fur Cap" + (n > 1 ? " ×" + n : ""); },
      description: "Close wool cap with fur-trimmed flaps.",
      traits: "Weather wear: cold -20%",
      badge: function (s) { return s.equipped_head_id === "fur_cap" ? "Worn" : "Stowed"; },
      equip: { slot: "head", id: "fur_cap" }
    },
    {
      id: "lined_gloves", category: "apparel", owned: "has_lined_gloves", slot: "Hands",
      name: function (s) { var n = 1 + (Number(s.spare_lined_gloves) || 0); return "Lined Gloves" + (n > 1 ? " ×" + n : ""); },
      description: "Soft leather gloves lined with combed fleece.",
      traits: "Weather wear: cold -20%",
      badge: function (s) { return s.equipped_hands_id === "lined_gloves" ? "Worn" : "Stowed"; },
      equip: { slot: "hands", id: "lined_gloves" }
    },
    {
      id: "scholar_gloves", category: "apparel", owned: "has_scholar_gloves", slot: "Hands",
      name: function (s) { var n = 1 + (Number(s.spare_scholar_gloves) || 0); return "Scholar's Gloves" + (n > 1 ? " ×" + n : ""); },
      description: "Fine black kid gloves cut close for close work.",
      traits: "+1 INT",
      badge: function (s) { return s.equipped_hands_id === "scholar_gloves" ? "Worn" : "Stowed"; },
      equip: { slot: "hands", id: "scholar_gloves" },
      statBonus: true
    },
    {
      id: "masters_gloves", category: "apparel", owned: "has_masters_gloves", slot: "Hands",
      name: function (s) { var n = 1 + (Number(s.spare_masters_gloves) || 0); return "Master's Gloves" + (n > 1 ? " ×" + n : ""); },
      description: "Black kid gloves fitted finger by finger and stitched in silk.",
      traits: "+2 INT",
      badge: function (s) { return s.equipped_hands_id === "masters_gloves" ? "Worn" : "Stowed"; },
      equip: { slot: "hands", id: "masters_gloves" },
      statBonus: true
    },
    {
      id: "waxed_boots", category: "apparel", owned: "has_waxed_boots", slot: "Feet",
      name: function (s) { var n = 1 + (Number(s.spare_waxed_boots) || 0); return "Rain Boots" + (n > 1 ? " ×" + n : ""); },
      description: "Knee-high oiled calf boots with waxed seams.",
      traits: "Weather wear: cold -10%, rain -25%",
      badge: function (s) { return s.equipped_feet_id === "waxed_boots" ? "Worn" : "Stowed"; },
      equip: { slot: "feet", id: "waxed_boots" }
    },
    {
      id: "winter_boots", category: "apparel", owned: "has_winter_boots", slot: "Feet",
      name: function (s) { var n = 1 + (Number(s.spare_winter_boots) || 0); return "Winter Boots" + (n > 1 ? " ×" + n : ""); },
      description: "Thick-soled boots lined with pressed felt.",
      traits: "Weather wear: cold -25%",
      badge: function (s) { return s.equipped_feet_id === "winter_boots" ? "Worn" : "Stowed"; },
      equip: { slot: "feet", id: "winter_boots" }
    },
    {
      id: "dancing_slippers", category: "apparel", owned: "has_dancing_slippers", slot: "Feet",
      name: function (s) { var n = 1 + (Number(s.spare_dancing_slippers) || 0); return "Dancing Slippers" + (n > 1 ? " ×" + n : ""); },
      description: "Flat black kid slippers with a thin flexible sole.",
      traits: "+1 DEX",
      badge: function (s) { return s.equipped_feet_id === "dancing_slippers" ? "Worn" : "Stowed"; },
      equip: { slot: "feet", id: "dancing_slippers" },
      statBonus: true
    },
    {
      id: "wool_muffler", category: "apparel", owned: "has_wool_muffler", slot: "Neck",
      name: function (s) { var n = 1 + (Number(s.spare_wool_muffler) || 0); return "Wool Muffler" + (n > 1 ? " ×" + n : ""); },
      description: "Long knitted grey wool muffler.",
      traits: "Weather wear: cold -10%",
      badge: function (s) { return s.equipped_neck_id === "wool_muffler" ? "Worn" : "Stowed"; },
      equip: { slot: "neck", id: "wool_muffler" }
    },
    {
      id: "silk_neckcloth", category: "apparel", owned: "has_silk_neckcloth", slot: "Neck",
      name: function (s) { var n = 1 + (Number(s.spare_silk_neckcloth) || 0); return "Silk Neckcloth" + (n > 1 ? " ×" + n : ""); },
      description: "Dove-grey silk neckcloth folded in the Quarter fashion.",
      traits: "+1 CHA",
      badge: function (s) { return s.equipped_neck_id === "silk_neckcloth" ? "Worn" : "Stowed"; },
      equip: { slot: "neck", id: "silk_neckcloth" },
      statBonus: true
    },
    {
      id: "court_coat", category: "apparel", owned: "has_court_coat", slot: "Body armor",
      name: function (s) { var n = 1 + (Number(s.spare_court_coat) || 0); return "Court Coat" + (n > 1 ? " ×" + n : ""); },
      description: "Charcoal wool coat, silk-lined and cut close through the shoulder.",
      traits: "Cloth armor: AC 10 + DEX; cold -25%, rain -10%; +2 CHA",
      badge: function (s) { return s.equipped_armor_id === "court_coat" ? "Worn, Cloth Armor" : "Stowed"; },
      equip: { slot: "armor", id: "court_coat" },
      statBonus: true
    },
    // GEN:END gear_items
    // ---- weapons ----

    // ---- apparel ----
    {
      id: "talia_oiled_cloak", category: "apparel", owned: "has_talia_oiled_cloak",
      name: "Talia's Cloak",
      description: "Heavy oil-dark cloak, waxed against river spray and marsh rot.",
      badge: function (s) { return s.equipped_cloak_id === "talia_oiled_cloak" ? "Worn" : "Stowed"; },
      equip: { slot: "cloak", id: "talia_oiled_cloak" }
    },
    {
      id: "rorik_grip_wraps", category: "apparel", owned: "has_rorik_grip_wraps",
      name: "Rorik's Grip Wraps",
      description: "Tarred cord wound over the palm for a sure grip.",
      badge: function (s) { return s.equipped_hands_id === "rorik_grip_wraps" ? "Worn" : "Stowed"; },
      equip: { slot: "hands", id: "rorik_grip_wraps" }
    },
    {
      id: "rorik_campaign_belt", category: "apparel", owned: "has_rorik_campaign_belt",
      name: "Rorik's Campaign Belt",
      description: "A broad belt riveted with iron studs.",
      badge: function (s) { return s.equipped_waist_id === "rorik_campaign_belt" ? "Worn" : "Stowed"; },
      equip: { slot: "waist", id: "rorik_campaign_belt" }
    },
    {
      id: "talia_deck_boots", category: "apparel", owned: "has_talia_deck_boots",
      name: "Talia's Deck Boots",
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
      name: "Officer's Signet Ring",
      description: "Tarnished silver band from a customs officer, stamped with a three-headed imperial hawk.",
      badge: function (s) { return (s.equipped_ring1_id === "toll_seal_ring" || s.equipped_ring2_id === "toll_seal_ring") ? "Worn" : ""; },
      equip: { slot: "ring", id: "toll_seal_ring" }
    },
    {
      id: "elspeth_weir_knot", category: "accessories", owned: "has_elspeth_weir_knot",
      name: "Elspeth's Weir-Knot",
      description: "Flax cord knotted with three river stones, a sister's keepsake.",
      badge: function (s) { return s.equipped_neck_id === "elspeth_weir_knot" ? "Worn" : "Stowed"; },
      equip: { slot: "neck", id: "elspeth_weir_knot" }
    },
    {
      id: "althea_votive_ring", category: "accessories", owned: "has_althea_votive_ring",
      name: "Althea's Stone Ring",
      description: "Flat river stone, silver-wired, taken from Saint Althea's altar offerings.",
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
      name: "Oak Shield",
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
