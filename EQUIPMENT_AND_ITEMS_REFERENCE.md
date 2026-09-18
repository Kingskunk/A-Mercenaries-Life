# Equipment & Items Reference — The Carrion Company

A comprehensive developer and lore reference for every wearable, equippable, and carried item in the codebase, detailing item IDs, descriptions, acquisition sources, slots, and exact mechanical effects.

---

## ◈ How the Equipment System Works

- **Id-Driven State Machine:** All paper-doll slots and weapons derive their display and combat properties from persistent string IDs (e.g., `equipped_weapon_id`, `equipped_head_id`, `equipped_neck_id`).
- **Idempotent Recomputations:** Changing equipment triggers idempotent recompute subroutines (`recalculate_armor_class`, `apply_weapon_loadout`, `apply_head_loadout`, etc.). No stat is nudged with bare `*set +N` operations, ensuring complete refresh and replay safety.
- **Starting Snapshot Mechanism:** At enlistment/chargen, the player's initial weapon and armor choices are permanently saved to `starting_weapon_*` and `starting_armor_*`. Players can switch back to their starting equipment at any time from the dossier.
- **Magic Item Attunement:** Attuned items bind to a limited attunement pool (`max_attunement_slots = 5`). Bonuses only apply while `attuned = true`. Attuning to wearable relics automatically equips them to their physical slot.
- **Sidearm Swapping:** Characters can carry a secondary sidearm (`equipped_sidearm_id`). Calling `swap_active_sidearm` instantaneously swaps the primary main-hand weapon with the sidearm.
- **Two-Handed Weapon / Shield Exclusivity:** Equipping a two-handed weapon (`weapon_hands = "two_handed"`) automatically stows the shield (`shield_equipped = false`). Switching back to a one-handed weapon automatically restores the player's prior shield stance (`wants_shield_equipped`).
- **Economic Scale & Denominations:**
  - **10 Copper Bits (c) = 1 Silver Mark (s)**
  - **10 Silver Marks (s) = 1 Gold Crown (g) = 100 Copper Bits**
  - Ordinary labor pays 4s–7s per shift; common tavern meals cost 2c–3c; fine shear-steel and armor represent major capital investments.

---

## 1. Weapons & Sidearms

Primary weapons and secondary sidearms can be equipped in the main-hand or stored in the sidearm slot. Finesse weapons dynamically use the higher of Strength or Dexterity for both attack rolls and damage modifiers, and qualify for Rogue Sneak Attack.

| Item ID | Item Name | Category & Grip | Base Damage | Acquisition & Retail Cost | Mechanical Effects |
|---|---|---|---|---|---|
| `starting` (Ashbrook) | **Heavy Falchion & Buckler** | One-Handed Melee | `1d8 slashing` | Enlistment (Ashbrook) or Master Smith — **3s 2c** (Blade alone) | Standard 1d8 melee weapon (STR-based). Grants and pairs with the Limestone Boss Buckler (+2 AC when equipped). |
| `starting` / `ash_spear` | **Seven-Foot Ash-Wood Spear** | One-Handed Reach Melee | `1d6/1d8 piercing` | Enlistment (Ashbrook / Outlaw) or Armorer — **1s 4c** | Reach weapon (STR-based). Versatile 1d8 profile in frontline combat. |
| `starting` / `felling_axe` | **Heavy Bearded Broadaxe** | Two-Handed Heavy Melee | `1d12 slashing` | Enlistment (Ashbrook) or Master Smith — **4s 5c** | Heavy Two-Handed weapon (STR-based). Forces `weapon_hands = "two_handed"`, automatically stowing off-hand shields. Eligible for Great Weapon Fighting rerolls. Sidearm profile deals 1d8 slashing. |
| `starting` / `matched_dagger` | **Matched Pair of Daggers** | One-Handed Finesse | `1d4 piercing` | Enlistment (Port Valen Outlaw) or Cutler — **1s 8c** (pair) | Finesse (uses higher of STR or DEX for attack and damage). Triggers Rogue Sneak Attack (+1d6). |
| `starting` / `hand_crossbow` | **Compact Hand Crossbow** | One-Handed Ranged | `1d6 piercing` | Enlistment (Port Valen Outlaw) or Bowyer — **4s 2c** | Ranged weapon (DEX-based). Single-handed, concealable. Triggers Rogue Sneak Attack (+1d6). |
| `starting` (Scout) | **Recurve Shortbow** | Two-Handed Ranged | `1d6 piercing` | Enlistment (Outlaw Dev Preset) or Bowyer — **2s 8c** | Ranged weapon (DEX-based). Two-handed. Triggers Rogue Sneak Attack (+1d6). |
| `starting` (Disgraced) | **Iron-Shod Quarterstaff** | One-Handed / Versatile Melee | `1d6/1d8 bludgeoning` | Enlistment (Disgraced Scion) or Woodworker — **7c** | Versatile blunt weapon (STR-based). |
| `starting` / `bodkin_dagger` | **Slim Bodkin Dagger** | One-Handed Finesse | `1d4 piercing` | Enlistment (Disgraced Scion) or Cutler — **1s 1c** | Finesse (uses higher of STR or DEX). Triggers Rogue Sneak Attack (+1d6). |
| `starting` (Disgraced) | **Compact Light Crossbow** | Two-Handed Ranged | `1d8 piercing` | Enlistment (Disgraced Scion) or Bowyer — **3s 8c** | Ranged weapon (DEX-based, 1d8). Two-handed. |
| `timber_axe` | **Highland Hewing Axe** | One-Handed Melee | `1d8 slashing` | Master Torvald's Smithy (Alderford) — **2s 5c** | One-handed felling axe (STR-based). Compatible with off-hand shields and Dueling Fighting Style (+2 damage). |
| `stiletto` | **Alderford Bodkin Stiletto** | One-Handed Finesse | `1d4 piercing` | Master Torvald's Smithy (Alderford) — **1s 6c** | Refined file-steel thrusting blade. Finesse (STR or DEX). Triggers Rogue Sneak Attack (+1d6). |

---

## 2. Off-Hand Shields

| Item ID | Item Name | Slot | Acquisition / Cost | Mechanical Effects |
|---|---|---|---|---|
| `has_shield` / `shield_equipped` | **Limestone Boss Shield / Buckler** | Off-Hand | Enlistment (Ashbrook Falchion) or Torvald's Smithy (**3s 5c**) | **+2 Armor Class (AC)** when strapped on. Can be toggled on/off in the dossier. Automatically stows if a two-handed weapon is drawn. Enables Fighter *Protection* Fighting Style. |

---

## 3. Torso Armor

Torso armor sets the character's base AC calculation in `recalculate_armor_class`.

| Item ID | Armor Name | Armor Class Category | Base AC Formula | Acquisition & Retail Cost | Mechanical Interaction & Rules |
|---|---|---|---|---|---|
| `brigandine` | **Padded Gambeson & Leather Brigandine** | Medium Armor | `13 + DEX (max +2)` | Enlistment (Ashbrook) or Armorer — **5s 5c** | Solid protection against slashing and bludgeoning. Caps DEX contribution at +2. |
| `chain_jack` | **Quilted Aketon & Iron Chain-Jack** | Medium Armor | `13 + DEX (max +2)` | Enlistment (Ashbrook) or Armorer — **6s 2c** | Interlocking scrap iron rings over wool. Caps DEX contribution at +2. |
| `buff_coat` | **Greased Oxhide Buff-Coat & Scale Sleeves** | Light Armor | `11 + DEX (full)` | Enlistment (Ashbrook) or Tanner — **3s 8c** | Supple hide with scale reinforcement. Full DEX bonus applies. |
| `leather_cuirass` / `leather` | **Boiled Leather Cuirass** | Light Armor | `11 + DEX (full)` | Enlistment (Outlaw) or Leatherworker — **2s 4c** | Form-fitted hardened leather. Full DEX bonus applies. |
| `thief_leather` | **Oiled Leather Jerkin with Hidden Pockets** | Light Armor | `11 + DEX (full)` | Enlistment (Outlaw) or Black Market — **2s 8c** | Concealed weapon pouches. Full DEX bonus applies. |
| `scout_wraps` | **Layered Leather Scout Wraps** | Light Armor | `11 + DEX (full)` | Enlistment (Outlaw) or Tanner — **2s 2c** | Silent movement wraps. Full DEX bonus applies. |
| `scholars_cassock` / `cloth` | **Quilted Scholar's Cassock** | Cloth / Unarmored | `10 + DEX (full)` | Enlistment (Disgraced) or Tailor — **1s 2c** | Ordinary clothing. Qualifies for Wizard *Mage Armor* (`13 + DEX`) and Barbarian *Unarmored Defense* (`10 + DEX + CON`). |
| `reinforced_doublet` | **Reinforced Canvas Doublet** | Cloth / Unarmored | `10 + DEX (full)` | Enlistment (Disgraced) or Draper — **9c** | Stiffened canvas. Counts as cloth/unarmored. |
| `tailored_vest` | **Tailored Vest & Travel Coat** | Cloth / Unarmored | `10 + DEX (full)` | Enlistment (Disgraced) or High Clothier — **1s 6c** | Noble travel garments. Counts as cloth/unarmored. |
| `traveling_cloak` | **Oiled Traveling Cloak & Robes** | Cloth / Unarmored | `10 + DEX (full)` | Outfitter / Chandler — **1s 4c** | Traveling mantle and robes. Counts as cloth/unarmored. |

---

## 4. Headwear Slot (`equipped_head_id`)

| Item ID | Item Name | AC Bonus | Counts as Armor? | Acquisition & Retail Cost | Description & Mechanical Details |
|---|---|---|---|---|---|
| `torvald_iron_sallet` | **Cold-Hammered Iron Sallet** | **+1 AC** | **Yes** (`head_is_armor = true`) | Master Torvald's Smithy (Alderford) — **2s 8c** | Plain riveted steel skullcap with guild touchmark. Grants flat **+1 AC**. Because it counts as wearing real armor, it **suppresses** Wizard *Mage Armor* and Barbarian *Unarmored Defense*. |
| `torvald_hide_cap` | **Boiled-Hide Watch-Cap** | 0 AC | No | Master Torvald's Smithy (Alderford) — **8c** | Stiffened blackened leather cap. Cosmetic/warmth headwear. Does not interfere with unarmored/cloth abilities. |
| `arming_cap` | **Padded Arming Cap** | 0 AC | No | Enlistment (Ashbrook) or Tailor — **5c** | Quilted linen and wool cap worn beneath iron helmets. Cosmetic headwear. |
| `camo_hood` | **Shadowed Camo Hood** | 0 AC | No | Enlistment (Outlaw) or Draper — **7c** | Mottled dark hood designed to break facial contours in brush and fog. Cosmetic headwear. |
| `scholar_coif` | **Scholar's Linen Coif** | 0 AC | No | Enlistment (Disgraced) or Scribe Shop — **6c** | Tailored linen coif worn by academics, tutors, and scions. Cosmetic headwear. |
| `none` | **Bare Head** | 0 AC | No | Default / Unequipped | No headgear worn. |

---

## 5. Cloaks Slot (`equipped_cloak_id`)

| Item ID | Item Name | Acquisition & Retail Cost | Description & Mechanical Role |
|---|---|---|---|
| `talia_oiled_cloak` | **Talia's Oiled Brine-Cloak** | Talia's Shed (Alderford) — Quest Reward (Priceless) | Heavy oil-dark cloak saturated with mutton tallow and neatsfoot dubbin to repel salt spray and marsh rot. Equippable cosmetic cloak; awarded alongside the river crossing protection (`prep_waterproof_gear`). |
| `wool_mantle` | **Iron Bull Wool Mantle** | Enlistment (Ashbrook) or Weaver — **1s 2c** | Coarse, heavy-spun wool cloak pinned with an iron brooch. Cosmetic apparel. |
| `camo_cloak` | **Weathered Camouflage Cloak** | Enlistment (Outlaw) or Dyer — **1s 4c** | Mottled marsh-green and brown wool cloak for blending into reeds and scrub. Cosmetic apparel. |
| `weather_cloak` | **Oiled Marcher Weather-Cloak** | Enlistment (Disgraced) or Outfitter — **1s 8c** | High-collared travel cloak treated with pine-oil against frontier rains. Cosmetic apparel. |
| `none` | **No Cloak** | Default / Unequipped | Bare shoulders. |

---

## 6. Handwear Slot (`equipped_hands_id`)

| Item ID | Item Name | Acquisition & Retail Cost | Description & Mechanical Role |
|---|---|---|---|
| `rorik_grip_wraps` | **Tarred Linen Grip-Wraps** | Veteran Rorik (`camp_night.txt`) / Outfitter — **4c** | Dense coils of tarred linen wound around palms and knuckles to protect against blistering and wet hilt slippage. Equippable cosmetic handwear. |
| `leather_wraps` | **Hardened Leather Weapon-Wraps** | Enlistment (Ashbrook) or Cobbler — **6c** | Boiled-leather straps wrapped around wrists and forearms for weapon grip. Cosmetic handwear. |
| `archer_bracers` | **Supple Archer Bracers** | Enlistment (Outlaw) or Bowyer / Tanner — **1s 0c** | Flexible leather forearm bracers protecting against bowstring slap. Cosmetic handwear. |
| `scribe_gloves` | **Scribe Wrist-Bracers & Writing Gloves** | Enlistment (Disgraced) or Guild Stationer — **1s 2c** | Supple fingerless calfskin writing gloves and tailored wrist supports. Cosmetic handwear. |
| `none` | **Bare Hands** | Default / Unequipped | Unwrapped hands. |

---

## 7. Waist Slot (`equipped_waist_id`)

| Item ID | Item Name | Acquisition & Retail Cost | Description & Mechanical Role |
|---|---|---|---|
| `rorik_campaign_belt` | **Iron-Riveted Campaign Belt** | Veteran Rorik (`camp_night.txt`) — Veteran Gift (Priceless) | Worn, heavy leather field belt reinforced with hammered iron rivets and an reinforced frog. Equippable cosmetic belt. |
| `soldiers_belt` | **Heavy Soldier's Belt & Frog** | Enlistment (Ashbrook) or Harness-Maker — **1s 0c** | Broad harness-leather belt with forged iron buckle and heavy scabbard frog. Cosmetic belt. |
| `scabbard_belt` | **Concealed Scabbard Belt** | Enlistment (Outlaw) or Black Market — **1s 5c** | Supple leather belt fitted with low-profile loops and hidden sheath slots. Cosmetic belt. |
| `satchel_harness` | **Satchel-Harness & Vellum Roll** | Enlistment (Disgraced) or Scribe — **1s 8c** | Cross-body shoulder and waist leather harness carrying document cylinders. Cosmetic belt. |
| `none` | **No Belt** | Default / Unequipped | Bare waist. |

---

## 8. Footwear Slot (`equipped_feet_id`)

| Item ID | Item Name | Acquisition & Retail Cost | Description & Mechanical Role |
|---|---|---|---|
| `talia_deck_boots` | **Talia's Pitch-Sealed Deck Boots** | Talia's Shed (Alderford) — Quest Reward (Priceless) | Waterproofed leather deck boots, pitch- and wax-sealed river-tight against marsh damp. Equippable cosmetic boots; awarded alongside river crossing protection (`prep_waterproof_gear`). |
| `marching_boots` | **Hobnailed Marching Boots** | Enlistment (Ashbrook) or Cordwainer — **1s 8c** | Thick oxhide boots studded with iron hobnails for traction in heavy clay mud. Cosmetic footwear. |
| `scout_boots` | **Soft-Soled Scout Wraps** | Enlistment (Outlaw) or Tanner — **1s 4c** | Supple, silent moccasin boots lined with sheepskin for muffled footing. Cosmetic footwear. |
| `riding_boots` | **Cured Travel Riding Boots** | Enlistment (Disgraced) or Master Bootmaker — **2s 6c** | High-topped calfskin riding boots built for saddle stirrups and highway travel. Cosmetic footwear. |
| `none` | **Bare Feet** | Default / Unequipped | Unshod feet. |

---

## 9. Neckwear & Relics Slot (`equipped_neck_id`)

| Item ID | Item Name | Attunement? | Acquisition & Retail Cost | Mechanical & Narrative Details |
|---|---|---|---|---|
| `hearthstone_talisman` | **Torvald's Hearthstone Talisman** | **Yes** (Consumes 1 Attunement Slot) | Master Torvald (Alderford) — Quest Reward (Priceless Artifact) | Ancient dark furnace lodestone banded in cold-hammered iron on oxhide cord. When attuned (`hearthstone_attuned = true`), grants **+1 Constitution** (`constitution + 1`), recalculating maximum HP and Constitution modifier. Automatically equips to Neck when attuned. |
| `elspeth_weir_knot` | **Elspeth's Braided Weir-Knot** | No (Mundane Keepsake) | Elspeth (Alderford) — Sister's Keepsake (Priceless) | Flax cord braided with three polished river pebbles. A sister's protective keepsake. Can be worn in the Neck slot when not wearing an attuned magic talisman. |
| `none` | **Bare Throat** | No | Default / Unequipped | No necklace or talisman worn. |

---

## 10. Rings Slot (`equipped_ring1_id`, `equipped_ring2_id`)

Both Ring 1 and Ring 2 share the same item pool and can be equipped on either hand.

| Item ID | Item Name | Attunement? | Acquisition & Retail Cost | Mechanical & Narrative Details |
|---|---|---|---|---|
| `toll_seal_ring` | **Customs Officer's Signet Ring** | No | Black Sinks Strongbox — Loot (Pawn/Fence Value: **8s 0c**) | Tarnished silver signet ring stamped with the three-headed imperial hawk. Physical proof of the fallen Meridian Empire's provincial customs post. Equippable on either ring finger. |
| `althea_votive_ring` | **Saint Althea's Votive River-Stone Ring** | No | Chapel of Saint Althea — Pious Offering (**6c** temple donation) | Flat river stone drilled and bound in silver wire, offered by watermen before river crossings. Equippable on either ring finger. |
| `none` | **Bare Finger** | No | Default / Unequipped | Empty ring slot. |

---

## 11. Carried Field Tools & Consumables (Mechanical Inventory)

These items are carried in the player's satchel/inventory and provide active mechanical utility in skill checks, exploration, or combat:

| Variable | Item Name | Type | Acquisition Source / Retail Cost | Exact Mechanical Effect |
|---|---|---|---|---|
| `has_iron_crowbar` | **Pioneer's Iron Prybar & Pitons** (Sapper's Pinch Crowbar) | Field Tool | Master Torvald's Smithy (Alderford) — **1s 2c** | **Grants Advantage on Strength/Athletics and Force/Pry checks** (e.g., prying waterlogged timbers in Alderford's weir or forcing barred stone doors). |
| `has_althea_phial` | **Phial of Saint Althea's Water** | Consumable Holy Relic | Chapel of Saint Althea (Alderford / Valen) — Temple Offering (**1s 0c**) | Can be consumed in or out of combat to immediately **restore 2d4 + 2 Hit Points**. |
| `prep_waterproof_gear` | **Waterproofing Dubbin Tins** | Gear Treatment | Talia's Shed (Reward) or Chandler / Cobbler — **7c** | Waterproofs boots, weapon frogs, and leather harness. Negates cold-water exposure hazards and prevents disadvantage during river barge transits. |
| `has_talia_provisions` | **Hearth-Baked Travel Provisions** | Food Supply | Talia's Loft or Middle Ward Bakery — **5c** | Warm crusty bread and salt-cured river trout wrapped in greasecloth. Provides dense, sustaining nourishment. |
| `has_letter_of_credit` | **Gilded Scales Letter of Credit** | Financial Note | Gilded Scales Factor (Alderford / Port Valen) | Certified draft for silver marks (`letter_of_credit_value`), redeemable at counting houses in Alderford or Port Valen. |
| `has_silt_gate_iron` | **Highland Tool-Steel Blanks** | Quest Cargo | Silt-Gate Contraband (Black Market Value: **25s 0c**; Armory Value: Company Standing) | Heavy bars of un-stamped forged tool-steel and tempered bodkin tips diverted for the Carrion armory. |
