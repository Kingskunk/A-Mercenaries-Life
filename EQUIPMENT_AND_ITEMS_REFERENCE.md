# Equipment & Items Reference — The Carrion Company

A comprehensive developer and lore reference for every wearable, equippable, and carried item in the codebase, detailing item IDs, descriptions, acquisition sources, slots, and exact mechanical effects.

---

## ◈ How the Equipment System Works

- **Tradeable items are defined in `tools/gear_catalog.json`.** Prices, names, hints, dossier text, optional seller quotes and shop stock live there, and `node tools/gen_gear.js` writes the loadout branches, dossier lines, inventory entries and shop menus from it (see `quest/GAMEPLAY_MECHANICS_RULES.md`). The tables below describe the items; the catalog is what the game is built from.

- **Every worn slot has traits (`equipment.txt` `garment_traits`).** Percent cuts to the cold, rain and heat parts of outdoor exposure, and an optional ability-score bonus. Older hand-written worn items are listed first (only the ones whose own text promises weather protection have numbers: Talia's cloak and deck boots, Brant's boots, the four origin cloaks); catalog items are generated from `traits` in `tools/gear_catalog.json`. **Equipment bonuses to the same ability score do not stack**: `startup.txt` `recalculate_equipment_bonuses` keeps the highest one per stat (the attuned Hearthstone's +1 CON counts as one), and the six scores hold base + timed boon + equipment. See section 15.
- **Id-Driven State Machine:** All paper-doll slots and weapons derive their display and combat properties from persistent string IDs (e.g., `equipped_weapon_id`, `equipped_head_id`, `equipped_neck_id`).
- **Idempotent Recomputations:** Changing equipment triggers idempotent recompute subroutines (`recalculate_armor_class`, `apply_weapon_loadout`, `apply_head_loadout`, etc.). No stat is nudged with bare `*set +N` operations, ensuring complete refresh and replay safety.
- **Starting Snapshot Mechanism:** At enlistment/chargen, the player's initial weapon and armor choices are permanently saved to `starting_weapon_*` and `starting_armor_*`. Players can switch back to their starting equipment at any time from the dossier.
- **Starting kit, unified (2026-10-12, the user's call, after Baldur's Gate 3):** there is no armor choice at enlistment any more. The class is known only at the dawn trial, so the muster leaves Simple Clothes on you and `equipment.txt grant_class_armor` issues the class armor then (and refreshes the `starting_armor*` snapshot): **Fighter** Scale Mail (AC 13 + DEX max 2, `brigandine` type), **Rogue, Bard and Ranger** Leather Armor (AC 11 + DEX), **Barbarian** Barbarian Clothes (cloth, so Unarmored Defense applies), **Wizard and Warlock** Simple Clothes (cloth, AC 10 + DEX; Mage Armor and Armor of Shadows work). Every character also starts in the same plain **Cloak** (`starting_cloak`, cold -40%, rain -40%) and **Boots** (`starting_boots`). The hands and belt are one plain pair too (**Gloves**, **Leather Belt**: `starting_gloves`, `starting_belt`), and **nobody starts with headwear** (`equipped_head_id` "none", a Bare Head; caps, hats and helms are shop stock, and the swap menus offer "Take off your ..." as the way back). The rows below for the old muster armors (Studded Gambeson, Scaled Coat, Leather Jerkin, Scout Wraps, Scholar's Robe, Canvas Jacket, Travel Coat) and the three origin cloaks and boots are no longer issued at enlistment; the ones sold in shops stay as shop stock.
- **Starting weapons, unified (2026-10-12, the user's call):** the weapon choice is gone too. `equipment.txt grant_class_weapons` issues one kit per class at the dawn trial (the muster leaves you unarmed): **Fighter** a Longsword (1d8 slashing), a shield and a Spear in the sidearm slot; **Barbarian** a two-handed **Broadaxe** (1d12 slashing, no shield) and the Spear; **Wizard and Warlock** a Quarterstaff and a Crossbow; **Rogue, Bard and Ranger** a Shortbow and a Dagger. Every dagger is just **Dagger** (1d4 piercing, finesse, one weapon, not a pair), the spear is **Spear**, the hand crossbow is **Crossbow**, the recurve shortbow is **Shortbow**, the arming sword and falchion are **Longsword**, and the iron-shod quarterstaff is **Quarterstaff**. The prose of the old picks is told once when the kit is issued (`dawn_trial.txt kit_prose`). The Twin Daggers, Slim Dagger, Matched Dagger, Bodkin Dagger, Trench Dagger, Falchion and Broadaxe rows are no longer issued; the Hooked Broadaxe (`felling_axe`) stays as an item only.
- **Magic Item Attunement:** Attuned items bind to a limited attunement pool (`max_attunement_slots = 5`). Bonuses only apply while `attuned = true`. Attuning to wearable relics automatically equips them to their physical slot.
- **Sidearm Swapping:** Characters can carry a secondary sidearm (`equipped_sidearm_id`). Calling `swap_active_sidearm` instantaneously swaps the primary main-hand weapon with the sidearm.
- **Two-Handed Weapon / Shield Exclusivity:** Equipping a two-handed weapon (`weapon_hands = "two_handed"`) automatically stows the shield (`shield_equipped = false`). Switching back to a one-handed weapon automatically restores the player's prior shield stance (`wants_shield_equipped`).
- **Economic Scale & Denominations:**
  - **10 Copper Bits (c) = 1 Silver Mark (s)**
  - **10 Silver Marks (s) = 1 Gold Crown (g) = 100 Copper Bits**
  - **The Laborer Anchor:** An ordinary dock or farm laborer earns **3 to 4 Copper Bits per day** (~7 Silver Marks / month).
  - **Mechanics-Locked Pricing:** Items within the same mechanical tier (e.g. all 11+DEX Light Armors, or both 13+DEX Medium Armors) share identical price baselines to ensure gameplay fairness.

---

## 1. Weapons & Sidearms

Primary weapons and secondary sidearms can be equipped in the main-hand or stored in the sidearm slot. Finesse weapons dynamically use the higher of Strength or Dexterity for both attack rolls and damage modifiers, and qualify for Rogue Sneak Attack. Prices are locked by damage die, grip, and martial category.

| Item ID | Item Name | Category & Grip | Base Damage | Acquisition & Retail Cost | Mechanical Effects |
|---|---|---|---|---|---|
| `starting` (Ashbrook) | **Heavy Falchion** | One-Handed Melee | `1d8 slashing` | Enlistment (Ashbrook) or Master Smith — **2s 5c** (Blade alone) | Standard 1d8 melee weapon (STR-based). Grants and pairs with the Limestone Boss Buckler (+2 AC when equipped). |
| `starting` / `ash_spear` | **Ash-Wood Spear** | One-Handed Reach Melee | `1d6/1d8 piercing` | Enlistment (Ashbrook / Outlaw) or Armorer — **2s 0c** | Reach weapon (STR-based): can attack from Close as well as Engaged. Versatile 1d8 profile in frontline combat. |
| `starting` / `felling_axe` | **Hooked Broadaxe** | Two-Handed Heavy Melee | `1d12 slashing` | Enlistment (Ashbrook) or Master Smith — **5s 0c** | Heavy Two-Handed weapon (STR-based). Forces `weapon_hands = "two_handed"`, automatically stowing off-hand shields. Eligible for Great Weapon Fighting rerolls. Sidearm profile deals 1d8 slashing. |
| `starting` / `matched_dagger` | **Twin Daggers** | One-Handed Finesse | `1d4 piercing` | Enlistment (Port Valen Outlaw) or Cutler — **1s 5c** (pair) | Finesse (uses higher of STR or DEX for attack and damage). Triggers Rogue Sneak Attack (+1d6). |
| `starting` / `hand_crossbow` | **Hand Crossbow** | One-Handed Ranged | `1d6 piercing` | Enlistment (Port Valen Outlaw) or Bowyer — **2s 5c** | Ranged weapon (DEX-based). Single-handed, concealable. Triggers Rogue Sneak Attack (+1d6). |
| `starting` (Scout) | **Recurve Shortbow** | Two-Handed Ranged | `1d6 piercing` | Enlistment (Outlaw Dev Preset) or Bowyer — **2s 5c** | Ranged weapon (DEX-based). Two-handed. Triggers Rogue Sneak Attack (+1d6). |
| `starting` (Disgraced) | **Iron-Shod Quarterstaff** | One-Handed / Versatile Melee | `1d6/1d8 bludgeoning` | Enlistment (Disgraced Scion) or Woodworker — **1s 5c** | Versatile blunt weapon (STR-based, 1d6/1d8). |
| `starting` / `bodkin_dagger` | **Slim Dagger** | One-Handed Finesse | `1d4 piercing` | Enlistment (Disgraced Scion) or Cutler — **1s 5c** | Finesse (uses higher of STR or DEX). Triggers Rogue Sneak Attack (+1d6). |
| `starting` (Disgraced) | **Compact Light Crossbow** | Two-Handed Ranged | `1d8 piercing` | Enlistment (Disgraced Scion) or Bowyer — **3s 0c** | Ranged weapon (DEX-based, 1d8). Two-handed. |
| `longshade_quarterstaff` | **Ash Quarterstaff** | One-Handed Melee | `1d6 bludgeoning` | Roan's Wheel Shop (Timbermouth Workshops) — **1s 5c**; sells back for 50% | Plain blunt weapon of straight-grained Longshade ash (STR-based), one-handed, so it pairs with a shield. |
| `longshade_spear` | **Longshade Spear** | One-Handed Reach Melee | `1d6 piercing` | Roan's Wheel Shop — **2s 0c**; sells back for 50% | Reach weapon (STR-based, `weapon_type "reach"`): can attack from Close as well as Engaged. |
| `longshade_shortbow` | **Longshade Shortbow** | Two-Handed Ranged | `1d6 piercing` | Roan's Wheel Shop — **2s 5c**; sells back for 50% | Ranged weapon (DEX-based). Two-handed. Triggers Rogue Sneak Attack (+1d6). |
| `timber_axe` | **Highland Hewing Axe** | One-Handed Melee | `1d8 slashing` | Master Torvald's Smithy (Alderford) or Halda's Forge (Port Valen) — **2s 5c** | One-handed felling axe (STR-based). Compatible with off-hand shields and Dueling Fighting Style (+2 damage). |
| `stiletto` | **Alderford Stiletto** | One-Handed Finesse | `1d4 piercing` | Master Torvald's Smithy (Alderford) or Halda's Forge (Port Valen) — **1s 5c** | Refined file-steel thrusting blade. Finesse (STR or DEX). Triggers Rogue Sneak Attack (+1d6). |
| `road_club` | **Wooden Club** | One-Handed Melee | `1d4 bludgeoning` | Not sold: dropped by robbers on the road (a robber with a club, 40%) — pawnbroker 35%, Roan's Wheel Shop 50% (**5c** retail) | A plain knotted club banded with iron at the head. |
| `rough_spear` | **Rough Spear** | One-Handed Reach Melee | `1d6 piercing` | Not sold: dropped by robbers on the road (a robber with a spear, 40%) — pawnbroker 35%, Roan's Wheel Shop 50% (**8c** retail) | A straight ash pole with a wired-on iron head. Reach (STR-based): can attack from Close. |
| `cord_sling` | **Cord Sling** | One-Handed Ranged | `1d4 bludgeoning` | Not sold: dropped by robbers on the road (a robber with a sling, 40%) — pawnbroker 35%, Roan's Wheel Shop 50% (**4c** retail) | Braided cord and a leather pouch for throwing stones. |
| `hunting_bow` | **Hunting Bow** | Two-Handed Ranged | `1d6 piercing` | Not sold: dropped by robbers on the road (a robber with a bow, 40%) — pawnbroker 35%, Roan's Wheel Shop 50% (**15c** retail) | A plain yew stave with a waxed string. |

---

## 2. Off-Hand Shields

| Item ID | Item Name | Slot | Acquisition / Cost | Mechanical Effects |
|---|---|---|---|---|
| `has_shield` / `shield_equipped` | **Oak Shield / Buckler** | Off-Hand | Enlistment (Ashbrook Falchion) or Torvald's Smithy (**3s 0c**) | **+2 Armor Class (AC)** when strapped on. Can be toggled on/off in the dossier. Automatically stows if a two-handed weapon is drawn. Enables Fighter *Protection* Fighting Style. |

---

## 3. Torso Armor

Torso armor sets the character's base AC calculation in `recalculate_armor_class`. All armors within the same category share identical pricing to reflect mechanical parity.

| Item ID | Armor Name | Armor Class Category | Base AC Formula | Acquisition & Retail Cost | Mechanical Interaction & Rules |
|---|---|---|---|---|---|
| `brigandine` | **Studded Gambeson** | Medium Armor | `13 + DEX (max +2)` | Enlistment (Ashbrook), Armorer, or Halda's Forge (Port Valen, Middle Ward) — **7s 0c** | Solid protection against slashing and bludgeoning. Caps DEX contribution at +2. Identical mechanical tier to the Iron Chain Shirt. |
| `chain_jack` | **Iron Chain Shirt** | Medium Armor | `13 + DEX (max +2)` | Enlistment (Ashbrook), Armorer, or Halda's Forge (Port Valen, Middle Ward) — **7s 0c** | Interlocking scrap iron rings over wool. Caps DEX contribution at +2. Identical mechanical tier to the Studded Gambeson. |
| `plate_harness` | **Iron Plate Harness** | Heavy Armor | `16 (no DEX)` | Halda's Forge (Port Valen, Middle Ward) — **15s 0c** | Overlapping iron plates riveted over a mail coat. A flat AC 16 that ignores DEX entirely, so it beats medium armor unless DEX is high. Needs heavy-armor training (fighters only). |
| `buff_coat` | **Scaled Coat** | Light Armor | `11 + DEX (full)` | Enlistment (Ashbrook) or Tanner — **3s 0c** | Supple hide with scale reinforcement. Full DEX bonus applies. Identical mechanical tier to all Light Armors. |
| `leather_cuirass` / `leather` | **Leather Armor** | Light Armor | `11 + DEX (full)` | Enlistment (Outlaw) or Leatherworker — **3s 0c** | Form-fitted hardened leather. Full DEX bonus applies. |
| `thief_leather` | **Leather Jerkin** | Light Armor | `11 + DEX (full)` | Enlistment (Outlaw) or Black Market — **3s 0c** | Lined with hidden pockets and pouches for concealed carry. Full DEX bonus applies. |
| `scout_wraps` | **Scout Wraps** | Light Armor | `11 + DEX (full)` | Enlistment (Outlaw) or Tanner — **3s 0c** | Silent movement wraps. Full DEX bonus applies. |
| `scholars_cassock` / `cloth` | **Scholar's Robe** | Cloth / Unarmored | `10 + DEX (full)` | Enlistment (Disgraced) or Tailor — **1s 0c** | Ordinary clothing. Qualifies for Wizard *Mage Armor* (`13 + DEX`) and Barbarian *Unarmored Defense* (`10 + DEX + CON`). |
| `reinforced_doublet` | **Canvas Jacket** | Cloth / Unarmored | `10 + DEX (full)` | Enlistment (Disgraced) or Draper — **1s 0c** | Stiffened canvas. Counts as cloth/unarmored. |
| `tailored_vest` | **Travel Coat** | Cloth / Unarmored | `10 + DEX (full)` | Enlistment (Disgraced) or High Clothier — **1s 0c** | Noble travel garments. Counts as cloth/unarmored. |
| `traveling_cloak` | **Traveling Robes** | Cloth / Unarmored | `10 + DEX (full)` | Outfitter / Chandler — **1s 0c** | Traveling mantle and robes. Counts as cloth/unarmored. |

---

## 4. Headwear Slot (`equipped_head_id`)

Headwear is divided into physical armor (+1 AC) and non-armor headwear (0 AC, cosmetic / warmth).

| Item ID | Item Name | AC Bonus | Counts as Armor? | Acquisition & Retail Cost | Description & Mechanical Details |
|---|---|---|---|---|---|
| `torvald_iron_sallet` | **Iron Skullcap** | **+1 AC** | **Yes** (`head_is_armor = true`) | Master Torvald's Smithy (Alderford) or Halda's Forge (Port Valen) — **3s 0c** | Plain riveted steel skullcap with guild touchmark. Grants flat **+1 AC**. Because it counts as wearing real armor, it **suppresses** Wizard *Mage Armor* and Barbarian *Unarmored Defense*. |
| `torvald_hide_cap` | **Leather Watch Cap** | 0 AC | No | Master Torvald's Smithy (Alderford) — **8c** | Stiffened blackened leather cap. Cosmetic/warmth headwear. Does not interfere with unarmored/cloth abilities. |
| `arming_cap` | **Linen Cap** | 0 AC | No | Enlistment (Ashbrook) or Tailor — **8c** | Quilted linen and wool cap worn beneath iron helmets. Cosmetic headwear. |
| `camo_hood` | **Mottled Hood** | 0 AC | No | Enlistment (Outlaw) or Draper — **8c** | Mottled dark hood designed to break facial contours in brush and fog. Cosmetic headwear. |
| `scholar_coif` | **Scholar's Cap** | 0 AC | No | Enlistment (Disgraced) or Scribe Shop — **8c** | Tailored linen cap worn by academics, tutors, and scions. Cosmetic headwear. |
| `none` | **Bare Head** | 0 AC | No | Default / Unequipped | No headgear worn. |

---

## 5. Cloaks Slot (`equipped_cloak_id`)

Worn over the shoulders. Standard civilian and military mantles share a flat **1s 0c** baseline. **Cloaks are mechanical:** each one carries percent cuts to the cold, wet-weather and (for some) heat parts of outdoor exposure (`equipment.txt` `garment_traits`, summed over every worn slot by `calendar.txt` `calc_exposure`), which is how fast cold, heat and foul weather burn through food and rest on long outdoor stretches. The Gilt Needle sells more cloaks (section 15). The player swaps cloaks from the dossier (Equipment > Apparel) or the inventory panel's Cloak dropdown: the origin's own cloak is always on offer, plus any owned alternative such as Talia's.

| Item ID | Item Name | Acquisition & Retail Cost | Description & Mechanical Role |
|---|---|---|---|
| `talia_oiled_cloak` | **Talia's Cloak** | Talia's Shed (Alderford) — Quest Reward (Priceless) | Heavy oil-dark cloak saturated with mutton tallow and neatsfoot dubbin to repel salt spray and marsh rot. **Cold -50%, wet -80%** (the best against rain and storms). Awarded alongside the river crossing protection (`prep_waterproof_gear`). |
| `wool_mantle` | **Wool Mantle** | Enlistment (Ashbrook) or Weaver — **1s 0c** | Coarse, heavy-spun wool cloak pinned with an iron brooch. **Cold -65%, wet -30%** (the warmest). |
| `camo_cloak` | **Mottled Cloak** | Enlistment (Outlaw) or Dyer — **1s 0c** | Mottled marsh-green and brown wool cloak for blending into reeds and scrub. **Cold -40%, wet -40%** (thin, the weakest all-rounder). |
| `weather_cloak` | **Marcher Weather Cloak** | Enlistment (Disgraced) or Outfitter — **1s 0c** | High-collared travel cloak treated with pine-oil against frontier rains. **Cold -30%, wet -65%** (rain-proof). |
| `none` | **None** | Default / Unequipped | Bare shoulders. |

---

## 6. Handwear Slot (`equipped_hands_id`)

Handwear and weapon wraps. The wraps below are cosmetic; the gloves sold at the Gilt Needle carry traits (section 15). Swap from the dossier (Equipment > Apparel) or the inventory panel: your origin's own piece is always on offer, and Rorik's wraps come back once you have swapped them out. All non-armor wraps share a flat **8c** baseline.

| Item ID | Item Name | Acquisition & Retail Cost | Description & Mechanical Role |
|---|---|---|---|
| `rorik_grip_wraps` | **Grip Wraps** | Veteran Rorik (`camp_night.txt`) / Outfitter — **8c** | Dense coils of tarred linen wound around palms and knuckles to protect against blistering and wet hilt slippage. Equippable cosmetic handwear. |
| `leather_wraps` | **Leather Wraps** | Enlistment (Ashbrook) or Cobbler — **8c** | Boiled-leather straps wrapped around wrists and forearms for weapon grip. Cosmetic handwear. |
| `archer_bracers` | **Archer Bracers** | Enlistment (Outlaw) or Bowyer / Tanner — **8c** | Flexible leather forearm bracers protecting against bowstring slap. Cosmetic handwear. |
| `scribe_gloves` | **Scribe's Gloves** | Enlistment (Disgraced) or Guild Stationer — **8c** | Supple fingerless calfskin writing gloves with tailored wrist supports. Cosmetic handwear. |
| `none` | **Bare Hands** | Default / Unequipped | Unwrapped hands. |

---

## 7. Waist Slot (`equipped_waist_id`)

Standard field belts and frogs share a flat **1s 0c** baseline. Belts are cosmetic and swap the same way as gloves (origin belt, Rorik's campaign belt once swapped out).

| Item ID | Item Name | Acquisition & Retail Cost | Description & Mechanical Role |
|---|---|---|---|
| `rorik_campaign_belt` | **Campaign Belt** | Veteran Rorik (`camp_night.txt`) — Veteran Gift (Priceless) | Worn, heavy leather field belt reinforced with hammered iron rivets and a reinforced frog. Equippable cosmetic belt. |
| `soldiers_belt` | **Soldier's Belt** | Enlistment (Ashbrook) or Harness-Maker — **1s 0c** | Broad harness-leather belt with forged iron buckle and heavy scabbard frog. Cosmetic belt. |
| `scabbard_belt` | **Scabbard Belt** | Enlistment (Outlaw) or Black Market — **1s 0c** | Supple leather belt fitted with low-profile loops and hidden sheath slots. Cosmetic belt. |
| `satchel_harness` | **Satchel Harness** | Enlistment (Disgraced) or Scribe — **1s 0c** | Cross-body shoulder and waist leather harness carrying document cylinders. Cosmetic belt. |
| `none` | **None** | Default / Unequipped | Bare waist. |

---

## 8. Footwear Slot (`equipped_feet_id`)

Standard travel and combat boots share a flat **1s 5c** baseline. Two quest boots carry grandfathered weather traits because their own text promises it: **Talia's deck boots rain -30%** and **Brant's iron-heel boots rain -20%**; every other boot below is neutral. The Gilt Needle sells more (section 15).

| Item ID | Item Name | Acquisition & Retail Cost | Description & Mechanical Role |
|---|---|---|---|
| `talia_deck_boots` | **Talia's Deck Boots** | Talia's Shed (Alderford) — Quest Reward (Priceless) | Waterproofed leather deck boots, pitch- and wax-sealed river-tight against marsh damp. Equippable boots (**rain -30%**); awarded alongside river crossing protection (`prep_waterproof_gear`). |
| `brant_iron_heel_boots` | **Brant's Iron-Heel Boots** | Port Valen — Rotten Rib Quest (Brant), Quest Reward (Priceless) | Heavy bull-hide boots pitch-sealed against estuary damp, fitted with caulked iron heel-plates for slipway grip. Equippable boots (**rain -20%**). |
| `marching_boots` | **Marching Boots** | Enlistment (Ashbrook) or Cordwainer — **1s 5c** | Thick oxhide boots studded with iron nail-heads for traction in heavy clay mud. Cosmetic footwear. |
| `scout_boots` | **Scout Boots** | Enlistment (Outlaw) or Tanner — **1s 5c** | Supple, silent moccasin boots lined with sheepskin for muffled footing. Cosmetic footwear. |
| `riding_boots` | **Riding Boots** | Enlistment (Disgraced) or Master Bootmaker — **1s 5c** | High-topped calfskin riding boots built for saddle stirrups and highway travel. Cosmetic footwear. |
| `none` | **Bare Feet** | Default / Unequipped | Unshod feet. |

---

## 9. Neckwear & Relics Slot (`equipped_neck_id`)

| Item ID | Item Name | Attunement? | Acquisition & Retail Cost | Mechanical & Narrative Details |
|---|---|---|---|---|
| `hearthstone_talisman` | **Torvald's Hearthstone Talisman** | **Yes** (Consumes 1 Attunement Slot) | Master Torvald (Alderford) — Quest Reward (Priceless Artifact) | Ancient dark furnace lodestone banded in cold-hammered iron on oxhide cord. When attuned (`hearthstone_attuned = true`), grants **+1 Constitution** (`constitution + 1`), recalculating maximum HP and Constitution modifier. Automatically equips to Neck when attuned. |
| `none` | **Bare Throat** | No | Default / Unequipped | No necklace or talisman worn. |

---

## 10. Rings Slot (`equipped_ring1_id`, `equipped_ring2_id`)

Both Ring 1 and Ring 2 share the same item pool and can be equipped on either hand.

| Item ID | Item Name | Attunement? | Acquisition & Retail Cost | Mechanical & Narrative Details |
|---|---|---|---|---|
| `toll_seal_ring` | **Officer's Signet Ring** | No | Black Sinks Strongbox — Loot (Pawn/Fence Value: **8s 0c**) | Tarnished silver signet ring stamped with the three-headed imperial hawk. Physical proof of the fallen Meridian Empire's provincial customs post. Equippable on either ring finger. Worn, it lets the wearer cast **Guidance** (a character who already knows it gets nothing extra). |
| `althea_votive_ring` | **Althea's Stone Ring** | No | Chapel of Saint Althea — Pious Offering (**6c** temple donation) | Flat river stone drilled and bound in silver wire, offered by watermen before river crossings. Equippable on either ring finger. |
| `night_eye_ring` | **Night-Eye Ring** | No | Silt-Gate Vault strongbox, once ever (the first time it is opened) | Black horn polished smooth by many thumbs, a smuggler's ring. **Worn in either ring slot, the wearer sees in the dark** (`sees_in_dark`: no light needed, no darkness disadvantage, no ambush in the dark), the same as darkvision. Not attuned: the cost is one of the two ring slots. Unsellable. |
| `none` | **Bare Finger** | No | Default / Unequipped | Empty ring slot. |

---

## 11. Carried Field Tools & Consumables (Mechanical Inventory)

These items are carried in the player's satchel/inventory and provide active mechanical utility in skill checks, exploration, or combat:

| Variable | Item Name | Type | Acquisition Source / Retail Cost | Exact Mechanical Effect |
|---|---|---|---|---|
| `has_iron_crowbar` | **Iron Prybar** (Sapper's Pinch Crowbar) | Field Tool | Master Torvald's Smithy (Alderford) or Halda's Forge (Port Valen) — **1s 2c** | Cold-forged crowbar and tempered climbing pegs. **Grants Advantage on Strength/Athletics and Force/Pry checks** (e.g., prying waterlogged timbers in Alderford's weir or forcing barred stone doors). |
| `has_althea_phial` | **Saint Althea's Water** | Consumable Holy Relic | Deacon Corbel (Alderford) — grain-delivery reward (`alderford.txt:3211`). No vendor stocks it and it has no sell rates. Retail **5s 0c** (`tools/gear_catalog.json`) | Stackable. Used at will (combat item option, the dossier's Satchel, or the inventory panel's **Use** button) to **restore 2d4 + 2 Hit Points**. In combat it costs the turn and has no limit; out of combat it shares the once-a-day instant-heal limit (`last_mundane_treatment_day`) with the Dredge-End hedge-doctor. Refused, and not consumed, at full HP. |
| `prep_waterproof_gear` | **Waterproofing Dubbin Tins** | Gear Treatment | Talia's Shed (Reward) or Chandler / Cobbler — **7c** | Waterproofs boots, weapon frogs, and leather harness. Negates cold-water exposure hazards and prevents disadvantage during river barge transits. |
| `unique_buff` (Warming Liniment) | **Warming Liniment** | Timed Boon | Ambrose's Still-Room (Port Valen, Herb-Pounder Close) — **1s** | **+1 STR for 12 hours** through `apply_unique_buff`. A +1 only raises the modifier when it lifts an odd score onto the next even number. Takes one of the 3 unique-buff slots, so it stacks with food, drink, sleep and other unique boons. Hidden while active. |
| `unique_buff` (Clear-Head Draught) | **Clear-Head Draught** | Timed Boon | Ambrose's Still-Room (Port Valen, Herb-Pounder Close) — **1s** | **+1 WIS for 12 hours** through `apply_unique_buff`. Same parity rule as the liniment. Hidden while active. |
| `has_linen_bandage` | **Linen Bandage** | Consumable (dressing) | Ambrose's Still-Room (Port Valen) — **5c** | Stackable. Used from the Satchel or the inventory panel's **Use** button to bind a wound: **+1 HP from your next sleep that heals**, then it is used up (`dressing_on`, `dressing_bonus`; the status line shows "Wounds Dressed"). Refused, and not consumed, at full HP or while a dressing is already on. Not a healing item, so it has no once-a-day limit. Not buyable back. |
| `has_trail_rations` | **Trail Rations** | Consumable (ration) | Hollis & Daughters (Lantern Lane) — **2c**; sells back for 1c | Stackable, a day's food. **On the overworld one is eaten for you** whenever the hunger clock reaches 1080 minutes (the Hungry point), or at once if you start a walk already hungry, and again every further 1080 minutes, until the rations run out (`calendar.txt` `advance_time`, only while `ow_on`, so a two-day walk uses two). It counts as a full meal, like a tavern meal: the clock and the hunger damage both go to 0, with no buff. The travel page says how many were eaten (`rations_eaten_last`). Used by hand from the Satchel or the inventory panel it is the same meal, refused (not consumed) within 6 hours of the last meal. Nothing is eaten in town, so the taverns and the mess hall still matter. **Camping on the overworld** (`overworld.txt` `ow_camp`, an 8-hour sleep on any tile that is not a town): the camp counts as a shared bunk, so the wool blanket's +1 HP works there; the oilcloth halves the rain wear while you sleep out; an owned flint and tinderbox halves the cold wear (`exposure_camping` in `calc_exposure`). None is needed to camp: fatigue clears anyway, but sleeping out in bad weather without them costs more hunger. |
| `has_lye_soap` | **Lye Soap** | Consumable (wash) | Hollis & Daughters (Lantern Lane) — **2c**; sells back for 1c | Stackable, and **one twist is used up per wash**. Used from the Satchel or the inventory panel: **hygiene back to Clean** (resets `minutes_since_wash`), no boon and no healing, like the room basins. **Needs a stream, river or shore within reach** (`equipment.txt` `water_at_hand`). **That is false in every town, so it does nothing in Port Valen**: the city has the Conduit Baths, room basins and the Corve parlor for washing. On the overworld it is true on a tile whose data has a `water` phrase (`overworld-data.js`; Ashrun Mouth, "the river", and Ashrun Holt, "the Ashrun"), so a camp there can wash. Tiles also take a `climate` (steps colder or hotter than Port Valen, fed to `climate_shift`; Longshade Edge is -1), which moves temperature only, never rain or storms. Refused, and not consumed, with no water at hand, within 6 hours of the last wash, or before the player is independent (when the clock is not running). |
| `has_hemp_rope` | **Hemp Rope** | Field Tool (stock) | Hollis & Daughters — **8c**; sells back for 4c | Stackable. Fifty feet of tarred hemp. **No effect yet:** it exists so climbing, lowering and tying options can be added to quests later (spend one with `sell_gear`). |
| `has_pitch_torch` | **Torch** | Field Tool (stock) | Hollis & Daughters — **2c**; sells back for 1c | Stackable. About an hour of light. **No effect yet** (future dark-place options). |
| `has_lamp_oil` | **Lamp Oil** | Field Tool (stock) | Hollis & Daughters — **3c**; sells back for 1c | Stackable. Fuel for the hooded lantern. **No effect yet.** |
| `has_grease_flask` | **Grease Flask** | Thrown Consumable | Hollis & Daughters — **5c**; sells back for 2c | Stackable. Thrown from the **Throw** button on the fight menu (a fly-out of throwables) as an action: Dex save or the foe is greased (DC 10 Dex check when it moves, or it falls prone and loses its turn; attacks from Close range on a prone foe have advantage). |
| `has_alchemists_fire` | **Alchemist's Fire** | Thrown Consumable | Ambrose's Still-Room — **25c**; sells back for 12c | Stackable. Thrown as an action: Dex attack vs AC, 1d4 fire (+2 on a greased foe), then burns 1d4 for 3 of its turns. Fire attacks have advantage on a greased foe. |
| `has_herbalists_kit` | **Herbalist's Kit** | Field Tool (stock) | Ambrose's Still-Room — **30c**; sells back for 15c | Stackable. **+1 on every Medicine check**, any scene (`dice_engine.txt roll_d20_check`, keyed on the skill, so no scene needs to know about it). |
| `has_hooded_lantern` | **Hooded Lantern** | Field Tool (stock) | Hollis & Daughters — **12c**; sells back for 6c | Stackable. Iron lantern with horn windows and a sliding tin shutter. **No effect yet**; when light becomes a mechanic it is the lasting item and lamp oil is what gets used up. |
| `has_tool_kit` | **Repair Kit** | Field Tool (stock) | Hollis & Daughters — **2s**; sells back for 1s | Stackable. Canvas roll with a hammer, chisel, awl, pliers, folding saw and wire for field repairs and simple mechanisms. Its hint reads **"+1 on repair and mechanism checks"**. A scene marks a grounded repair or mechanism task, then the shared check engine automatically adds `+1` if the kit is carried. Such tasks use Investigation, Sleight of Hand, or both; a repair kit does not improve unrelated searching, pickpocketing, Survival, or harvesting. The save-safe internal item id remains `tool_kit`. Deliberately not sold by Halda or Vael, whose stock is narrower. |
| `has_lute` | **Lute** | Field Tool (stock) | Hollis & Daughters — **4s**; sells back for 2s | Stackable. A pear-bellied maple lute with seven gut strings. Its hint reads **"+1 on performance checks"**. A scene marks a performance (music for a room, a song) with `check_task_type "perform"` before the roll, then the shared check engine (`dice_engine.txt`) adds `+1` if the lute is carried, the same way the Repair Kit works for `"repair"`. A cantrip, a speech or a haggle is not a performance and does not set it. The radiant bard job, "Music for an Evening" (`hall_perform.txt`), sets it on every set. |
| `has_tinderbox` | **Flint and Tinderbox** | Field Tool (stock) | Hollis & Daughters — **4c**; sells back for 2c | Stackable. Striker, flint and char-cloth. **No effect yet** (future fire-lighting options). |
| `has_chalk_sticks` | **Chalk Sticks** | Field Tool (stock) | Hollis & Daughters — **2c**; sells back for 1c | Stackable. Six sticks, for marking a wall or a route. **Used in the Silt-Gate channels dungeon:** each chalk mark at a hallway junction uses one stick (a bundle is six marks; opening a new bundle uses the item up), takes 5 minutes, and lasts forever; a chalked junction skips its encounter roll when you arrive at it and shows solid on the map (`dungeon.txt` `dg_chalk_mark`). |
| `has_camp_kit` | **Camp Kit** | Field Tool | Hollis & Daughters, Marlow's General Store, the Alderford lower wharf market — **30c**; sells back for 15c | Replaced the wool blanket (2026-10-15). A canvas tent with poles and pegs rolled in a wool bedroll, with needle and thread. Weight 8. **The bedroll gives +1 HP on a night's sleep in a shared bunk or at a camp** while there is a wound to mend (`sleep_is_shared`). **The tent takes a share off the wet part of exposure whenever the exposure is a camp's** (a night, a short rest, a drill or a mend), and it stacks with the oilcloth: half while the kit is New, a third once it is Worn, a sixth once it is Ragged. **It wears:** `camp_kit_wear` rises each night's camp by 1, 2 in rain, 3 in a storm; Worn from 8, Ragged from 16, past use at 24 (a spare takes its place, otherwise it is gone). The camp menu offers **Mend the camp kit** (1 hour, Survival or Sleight of Hand DC 12, the Tool Kit adds +1) once it is Worn: a pass takes 8 points off. |
| `has_shovel` | **Shovel** | Field Tool | the three general stores — **8c**; sells back for 4c | Weight 3. Halves the time to dig up the Circle of Ferns grave in the Longshade Forest (two hours by hand, one with it). |
| `has_fire_arrow` | **Fire Arrow** | Special ammunition | the Longshade trapper (Merrick Thole) — **5c**; he buys back for 2c | Stackable, weight 0.1. A bow attack that also does +1d4 fire (+2 on a greased target) and sets the target burning for 2 turns; counts as a fire attack (advantage on a greased target). Shot from the fight menu ("Shoot: Fire Arrow") while wielding a bow; the arrow is spent hit or miss. |
| `has_ice_arrow` | **Ice Arrow** | Special ammunition | the Longshade trapper — **8c**; he buys back for 4c | Stackable, weight 0.1. A bow attack that also does +1d4 cold and Slows the target (it cannot Dash on its next turn). "Shoot: Ice Arrow". |
| `has_waxed_oilcloth` | **Oilcloth Sheet** | Field Tool | Hollis & Daughters — **6c**; sells back for 3c | Stackable, but a second one does nothing. **Halves whatever is left of the rain-and-storm part of outdoor exposure** in `calendar.txt` `calc_exposure`, after the worn cloak's wet cut (a storm's +40% becomes +20% with no cloak, and Talia's cloak's +8% becomes +4%). It does not touch cold or heat. |
| `has_lockpick_set` | **Lockpick Set** | Field Tool (stock) | Vael & Son, Locksmiths' Close — **3s**; sells back for 1s 5c | Stackable. A leather roll of picks, tension wrenches and a rake. Its hint reads **"Advantage on lock checks"**, but **no scene offers a lock check yet**, so it does nothing today. When one does, gate the option on `has_lockpick_set`, set `advantage` (the prybar does the same in Alderford) and name the skill "Thieves' Tools" so a rogue's expertise (`rogue_expertise_2`, double proficiency, applied in `roll_d20_check`) counts. The option must stay additive (a harder route exists without it). |
| `has_padlock` | **Padlock and Key** | Field Tool (stock) | Vael & Son — **8c**; sells back for 4c | Stackable. Heavy brass padlock, two keys. **No effect yet** (future "lock it behind you" options; spend one with `sell_gear`). |
| `has_door_bolt` | **Door Bolt** | Field Tool (stock) | Vael & Son — **5c**; sells back for 2c | Stackable. Forged slide-bolt with a keeper plate and screws, small enough to pack. **No effect yet** (future "bar the door" options in rooms and camps). |
| `has_iron_manacles` | **Iron Manacles** | Field Tool (stock) | Vael & Son — **15c**; sells back for 7c | Stackable. Hinged cuffs on a short chain, one key. **No effect yet** (future "bind a captive" options). |
| `scrap_steel` | **Scrap Steel** | Salvage (count) | Dredge-End night ambush victory: 1 to 3 pieces | Bent blades and iron fittings. Halda's Forge buys them by weight at **5c a piece** (all at once). Not sold by any shop. |
| `frog_slime` | **Frog Slime** | Salvage (count, ingredient) | Harvested from a giant frog (Survival DC 10) | Counted like Scrap Steel. Ambrose's Still-Room buys it at **4c a piece**. |
| `centipede_gland` | **Centipede Gland** | Salvage (count, ingredient) | Harvested from a giant centipede (Survival DC 12; a failed cut stings for 1 HP) | Ambrose buys it at **8c a piece**. |
| `viper_venom` | **Viper Venom** | Salvage (count, ingredient) | Harvested from a giant viper (Survival DC 13; a failed milking stings for 1 HP) | Ambrose buys it at **10c a piece**. |
| `grave_ichor` | **Grave Ichor** | Salvage (count, ingredient) | Harvested from a lacedon (Survival DC 14) | Ambrose buys it at **15c a piece**. |

Harvesting (2026-10-02, `dungeon.txt` `dg_harvest`) is an option a dungeon offers after a kill, never automatic: 15 minutes and a Survival check. A pass gives one piece, a total that beats the DC by 5 or more gives two, a failure gives nothing and costs the time (a nick of 1 HP from the venomous two, never below 1 HP). Mire-rats and anything else drop nothing. The ingredients are sold at Ambrose's counter (the plain "Lay out the ingredients" menu, or the trade panel's Sell tab); he buys nothing else (the catalog buyer `herbalist`, paid by the piece through `herbalistPiece`). The only source today is the Silt-Gate channels dungeon (Developer menu for now): the giant frog, giant centipede and giant viper are fights there, the lacedon fights at high tide, and after each win the player may harvest. The Developer menu's dungeon test hub can also harvest each creature directly. The cache encounter hands out one pitch torch and one flask of lamp oil.
| `has_talia_provisions` | **Hearth-Baked Travel Provisions** | Food Supply | Talia's Loft or Middle Ward Bakery — **5c** | Warm crusty bread and salt-cured river trout wrapped in greasecloth. Provides dense, sustaining nourishment. |
| `has_letter_of_credit` | **Gilded Scales Letter of Credit** | Financial Note | Gilded Scales Factor (Alderford / Port Valen) | Certified draft for silver marks (`letter_of_credit_value`), redeemable at counting houses in Alderford or Port Valen. |
| `has_silt_gate_payout_slip` | **Broker's Payout Slip** | Quest Evidence | Silt-Gate Contraband, Branch C (squeeze the broker) | Wax vellum listing the Watch night-sergeants who take weekly payoffs. Spend it once: sell it to the Dockmaster for silver and Watch standing, or hold it for Captain Vane as leverage (`vane_watch_leverage`). |

---

## 12. Selling Gear (Port Valen)

Prices live in one place: `equipment.txt` `gear_sale_value` (retail in copper, per item), and `sell_gear` removes the item. **The player's Charisma raises every sale** (2026-10-11): `sell_bonus_percent` adds 5% per point of positive Charisma modifier to the final per-unit price, rounded to the nearest copper, and the menus and the trade panel both show it; see GAMEPLAY_MECHANICS_RULES.md. A sale that would leave the player wearing something they no longer own puts them back in their starting gear (weapon, armor, or their origin's default cap); a weapon held in the sidearm slot is cleared to `none`.

| Buyer | Where | Pays | Buys |
|---|---|---|---|
| Halda (smith) | Halda's Forge, Middle Ward | **50% of retail** | studded gambeson, mail shirt, hewing axe, stiletto, iron skullcap, iron prybar, and scrap steel (5c a piece) |
| Pawnbroker | Dredge-End, Lamp Stair (daytime) | **35% of retail** for ordinary gear; **40%** for loose gems, no questions | everything Halda buys except scrap steel, plus the hide cap, signet ring (fixed **8s**), and the loose gems in section 16 |
| Cassia Rell (jeweler) | The Bright Setting, Upper Wharves | **75% of retail** | loose gems only (section 16); she tests and weighs each one before buying |
| Fenwick (tailor) | The Gilt Needle, Patrician Quarter (Morning to Afternoon, needs a writ) | **40% of retail** | only what he stocks (section 15); the pawnbroker does not list these |
| Hollis (general store) | Hollis & Daughters, Lantern Lane (Morning to Afternoon) | **50% of retail** | only what he stocks: rope, torch, lamp oil, hooded lantern, repair kit, shovel, tinderbox, chalk, camp kit, waxed oilcloth, lye soap and trail rations (buyer `general`; a 1c item like the torch pays 1c, since each price is floored) |
| Edda Roan (Roan's Wheel Shop, Timbermouth Workshops) | The Woodworkers' Workshops, Timbermouth (Morning to Afternoon, closed on the rest day) | **50% of retail** | only what she stocks: the ash quarterstaff, the Longshade spear, the Longshade shortbow and wooden clogs (buyer `general`) |
| Marlow (Marlow's General Store, Timbermouth) | Beside the Market's yard gate, Timbermouth (Morning to Dusk, closed on the rest day) | **50% of retail** | the same twelve goods as Hollis & Daughters at the same prices: rope, torch, lamp oil, hooded lantern, repair kit, shovel, lute, flint and tinderbox, chalk, camp kit, oilcloth, lye soap and trail rations (buyer `general`; shops `tmstore_buy` / `tmstore_sell`, keep the two stock lists in step) |
| Vael (locksmith) | Vael & Son, Locksmiths' Close (Morning to Afternoon; shut at Dusk, on Hallowday and in a gale) | **50% of retail** | only what he stocks: lockpick set, padlock and key, door bolt and iron manacles (buyer `general`, the same flat counter as Hollis) |

Never sellable: starting gear (it is the fallback) and quest rewards (Talia's cloak and boots, Brant's boots, the Hearthstone Talisman, the Althea ring). Example sales: mail shirt 3s 5c to Halda or 2s 4c to the pawnbroker; skullcap 1s 5c or 1s.

---

## 13. Armor Tiers & Proficiency

`armor_tier` is derived from `armor_type` every time armor loads (`apply_armor_loadout` in `equipment.txt`): **none** (cloth or unarmored), **light** (`leather`, `buff_coat`), **medium** (`brigandine`, `chain_jack`), **heavy** (`plate_harness`). A class is trained in these tiers (`armor_prof_check`):

| Class | Trained in |
|---|---|
| Fighter | light, medium, heavy |
| Barbarian, Ranger | light, medium |
| Bard, Rogue, Warlock | light |
| Wizard | nothing (cloth only) |

Wearing an untrained tier sets `armor_nonprof`, which gives **disadvantage on STR and DEX rolls, attack rolls included** (`roll_d20_check`). It cancels against advantage. **Spellcasting is not blocked**, by design: spell attacks use INT/CHA and are unaffected. The starting kit is grandfathered (`equipped_armor_id = "starting"` never triggers it), because class is chosen after the muster armor and an Ashbrook wizard can start in a gambeson. Shops warn before a purchase but never refuse it. **Shields work the same way:** fighters, barbarians and rangers are trained; anyone else takes the same disadvantage on STR and DEX rolls while a shield is equipped (`shield_nonprof`). Nothing is hidden or refused by class, so shields can drop as loot for anyone. A shield the character started with is grandfathered (`shield_grandfathered`, snapshotted at loadout init, and lazily for older saves), because origin hands out the muster shield before class is chosen.

Halda and Master Torvald both sell the shield (3s, `has_shield`) to every class that does not own one, and Halda buys the harness back at 50% of its 15s retail (pawnbroker 35%).

Halda's buy menu is its own screen (`mw_halda_stock`, opened from "Look over the racks") so the forge hub stays short. Besides the armor and shield it stocks a few Alderford pieces (hewing axe, stiletto, iron skullcap, iron prybar) at Torvald's prices and with the same `has_` flags, so anyone who missed them in Alderford can buy them, and nothing shows once it is owned. The boiled-hide watch cap stays Alderford-only, since Halda deals in metal.

---

## 14. Stacking Copies & the Trade Panel

**Copies.** Armor, shields, weapons, headwear and tools are stackable: `has_<id>` means "at least one" and `spare_<id>` counts the extra copies, so every older `has_` check still works. `grant_gear <id> <copies>` adds them (the first copy wears the armor or readies the shield; extra copies change nothing worn), and `sell_gear` gives up a spare before it touches the copy in use. The dossier list shows `[+N spare]` and the inventory panel shows `×N`. A ring or a counted item (scrap steel keeps its own counter) is not stackable (`stack: false` in the catalog). Loot drops use the same `grant_gear`: a Dredge-End ambush bruiser with a knife can drop a stiletto (40%) and one with a hatchet a hewing axe (35%), which Halda or the pawnbroker will buy.

**The trade panel** (`web/mygame/trade.js`, `trade.css`) is a tablet-friendly quality-of-life layer over the menus, never a replacement. Buy and Sell tabs with `-` / `+` steppers, a running total, and a Confirm button. Each row names the equipment slot the item fills (Cloak, Hands, Feet, Body armor, Weapon and so on), and the plain shop menus and the inventory panel show the same tag; tools and consumables fill no slot and show none. It appears (a **Trade** button in the header, plus a bar at the top of the Inventory, or the T key) only on pages that offer it: Halda's forge and racks, Ambrose's shelves, Hollis's store and shelves, Vael's counter, the Gilt Needle's racks, and the pawnbroker's window. The "Look over the racks" and "Put something on the bench" menus stay on every shop as the fallback.

How it stays honest: the panel only writes a cart (`cart_buy_<id>`, `cart_sell_<id>`) and clicks the shop's hidden `⚖ Settle up the trade panel.` option. `equipment.txt` (`shop_begin`, the shop's generated `*_cart_pass`, `shop_check`) re-prices, re-counts and re-checks the coin inside the shop's currency lock, so a tampered cart cannot buy what the menus could not. One `advance_time` covers the whole trade (each distinct purchase's fitting minutes, plus 10 for a sale).

Adding a shop: give its scene the marker pairs `<name>_cart_pass` (and `<name>_panel_rows` for a buy side), an `*_open_panel` label that sets `shop_open` and `shop_rows`, a `*_settle` label copied from Halda's, the hidden settle option on its hub, and a `trades` entry in `tools/gear_catalog.json`. `web/mygame/trade-data.generated.js` is generated by `tools/gen_gear.js`.

**The Rest card.** The inventory panel pins a Rest card above the category chips (always shown, not a catalog item and not counted in "items carried"; `inventory.js` `renderPinned`). Its badge shows Second Wind or the Pact Magic slots as "x/max" for the classes that have one, and its button opens the dossier's Rest menu, like Use opens the satchel. See MAGIC_AND_ABILITIES_REFERENCE.md, Short Rest.

**Consumables** (kind `consumable` in the catalog: the Warming Liniment, Clear-Head Draught and Saint Althea's phial) are stackable and used at will. One routine, `equipment.txt` `use_consumable <id>`, applies the effect, takes one copy (a spare first) and is replay-safe; every route calls it: the fight's "Use an item from your satchel" option (`combat.txt`, costs the turn, generated from the catalog), the dossier's "Satchel: Use a Consumable" menu (`choicescript_stats.txt`, `codex_use`), and the inventory panel's **Use** button, which opens the dossier straight at `codex_use_do` so the effect is still written by ChoiceScript. Effects are `heal` (dice; free in combat, once a day out of combat), `boon` (goes through `apply_unique_buff`; no limit; stacks with food and other boons; using a second copy while one runs just refreshes the timer), `wash` (the lye soap: hygiene back to Clean), `ration` (trail rations: a meal, clears hunger) or `dressing` (Ambrose's linen bandage: +1 HP on the next sleep that heals). The last two are out-of-combat only and refuse without consuming. The dossier and inventory refuse mid-fight (`combat_engaged`). Ambrose's Still-Room is a catalog shop like Halda's (plain "Look over the shelves" menu plus the trade panel, buy only). Hollis & Daughters and Vael & Son are catalog shops with both sides: the same menus and panel, plus a counter where each buys back what he stocks at half retail.

---

## 15. The Gilt Needle (Tailor, Patrician Quarter)

Master Idris Fenwick sells finished pieces "cut to the wearer" from three racks (cloaks and capes; hats, gloves, boots and mufflers; fine dress), and buys them back at **40% of retail** (buyer `tailor`) because each was cut to one person. The shop is inside the Quarter, so it needs a Day Writ, and it trades Morning to Afternoon. Everything is stackable. Clothing is **not worn on purchase** (wear it from the dossier: Equipment > Apparel, or Accessories for neckwear); the Envoy's Court Coat is armor and is put on like any bought armor. A trade past Afternoon ends in the avenue.

| Item ID | Item | Slot | Price | Buy-back | Effect |
|---|---|---|---|---|---|
| `broadcloth_cloak` | **Traveler's Cloak** | Cloak | 4s | 1s 6c | cold -55%, rain -45% |
| `storm_cape` | **Storm Cape** | Cloak | 7s | 2s 8c | cold -30%, rain -75% |
| `winter_cloak` | **Winter Cloak** | Cloak | 12s | 4s 8c | cold -90%, rain -40%, heat +40% (adds heat wear) |
| `summer_duster` | **Summer Duster** | Cloak | 5s | 2s | cold -10%, rain -30%, heat -60% |
| `felt_hat` | **Felt Hat** | Head | 2s |  8c | rain -15%, heat -25% |
| `fur_cap` | **Fur Cap** | Head | 3s | 1s 2c | cold -20% |
| `lined_gloves` | **Lined Gloves** | Hands | 3s | 1s 2c | cold -20% |
| `waxed_boots` | **Rain Boots** | Feet | 6s | 2s 4c | cold -10%, rain -25% |
| `winter_boots` | **Winter Boots** | Feet | 5s | 2s | cold -25% |
| `wooden_clogs` | **Wooden Clogs** | Feet | 1s (Roan's Wheel Shop, Timbermouth; sells back at 50%) | 5c | rain -15% |
| `wool_muffler` | **Wool Muffler** | Neck | 1s |  4c | cold -10% |
| `silk_neckcloth` | **Silvertongue Cravat** | Neck | 4g (400c) | 1g 6s (160c) | **+1 CHA**; unique |
| `scholar_gloves` | **Lamplight Gloves** | Hands | 4g (400c) | 1g 6s (160c) | **+1 INT**; unique |
| `dancing_slippers` | **Swallowstep Shoes** | Feet | 4g (400c) | 1g 6s (160c) | **+1 DEX**; unique |
| `masters_gloves` | **Spellseeker Gloves** | Hands | 15g (1,500c) | 6g (600c) | **+2 INT**; unique |
| `court_coat` | **Envoy's Court Coat** | Body (armor slot) | 12g (1,200c) | 4g 8s (480c) | cold -25%, rain -10%; **+2 CHA**; unique |

**Traits.** Cold, rain and heat are percent cuts to that part of outdoor exposure, summed over every worn slot (armor, head, cloak, hands, waist, feet, neck) and capped at 90% per part; a heat cut below zero adds heat wear (the winter cloak in summer costs more than going bare, so owning a second cloak is a real choice). An owned waxed oilcloth then halves the rain part. `tools/sim_weather.js` prints full kits.

**Fenwick and the second stitch (2026-10-13, the user's call).** The tailor is a quiet enchanter: he never says "magic". The fine work stands behind a grey curtain in the corner under the skylight, every seam carries a second line of pale stitching in red-dyed Quarter silk that does not fray, and the air near it is faintly warm. A talk option ("Ask about the fine work under the skylight", `pq_tailor_talk_fine`) has him explain that a piece is finished once, for one wearer, which is why there is one of each. Each of the five has a hint in its description (the sole rising to meet the floor; folds that settle on their own; fingertips warming on a lit page or near a written line; a coat that makes people stand straighter), and selling one back is explained as unpicking the finishing (`tailor_sell` quotes). The lorebook entries for the Gilt Needle and Fenwick gain a paragraph once the talk has happened. Invented details: the second stitch, the red silk, the warmth, and that the finishing holds for one wearer only.

**These five are magical dress, priced and kept that way (2026-10-13, the user's call):** +1 pieces cost 400c (4 gold crowns), +2 pieces 1,200c to 1,500c, against a Hall job's 40c. Each is **unique**: any item with a stat bonus cannot be stacked (`tools/gen_gear.js stackable()`), the shop's plain menu stops offering it while you own it, the trade panel drops it from the shelf and never allows more than one in the cart, and `shop_cart_buy` refuses a second copy at the counter. Sell it back (the tailor pays 40%) and it returns to the shelf. Rings are non-stacking by default and behave the same.

**Ability-score bonuses** are ordinary and modest: +1 or +2 to one score, derived and revocable while the piece is worn, and **only the highest equipment bonus to a stat applies** (the +2 Envoy's Court Coat and the +1 neckcloth give +2 CHA together, not +3; different stats each count). A +1 raises the modifier only when it lifts an odd score onto the next even number; a +2 always raises it by 1. Nothing here adds to the d20 roll itself (that is reserved for powerful items, see `quest/GAMEPLAY_MECHANICS_RULES.md` section 2). The gloves, slippers and neckcloth compete with weatherproof pieces for the same slot.

**Envoy's Court Coat.** Cloth armor (`armor_type "cloth"`: AC 10 + DEX, Mage Armor and Barbarian Unarmored Defense still work), so it competes with mail for the body slot; the shop warns before it replaces armor you are wearing, and selling it puts you back in your starting armor.

**Swapping.** The dossier's Apparel page offers, for each slot, the character's origin piece (`origin_clothing`: Ashbrook, outlaw and disgraced each start in their own cloak, gloves, belt and boots), the quest pieces they hold (Talia's cloak and boots, Brant's boots, Rorik's grip wraps and belt) and everything bought. The inventory panel's Cloak, Hands, Waist and Feet dropdowns do the same; a swap that changes an ability score is handed to the dossier (`codex_equip_do`) so ChoiceScript re-derives scores, max HP and AC. Neckwear swaps only from the dossier (the Hearthstone's attunement lives there).

**Comparing with what you wear.** The inventory's slot cards show each worn piece's weather cuts and score bonus (or "No bonuses"), the dossier's worn-gear lists show the same text, and the trade panel adds a "Wearing:" line under each equipment row (your weapon's damage, your armor's AC, or the piece in that slot and what it does), so a purchase can be weighed against what is on. All of it reads the `garment_traits` table.

**Regions.** `climate_shift` (startup.txt, 0 in Port Valen) moves the raw temperature before it is clamped into the six bands; each step it pushes past freezing or hot adds +20% to that part of exposure (`temp_extreme`). Port Valen's own numbers are unchanged. Set it per region when overland travel exists.

---

## 16. The Bright Setting (Gemstones and Jewelry)

Cassia Rell keeps small, jewelry-grade loose stones in paper trays beneath her display cases. They are stackable **Valuables** with no mechanical effect: portable wealth intended for sale, gifts, crafting, or future quest use. Cassia pays **75% of retail** after inspection; the Dredge-End pawnbroker buys the same stones at **40%**. Both prices receive the normal Charisma selling bonus.

| Item ID | Item | Retail | Cassia | Pawnbroker | Asset stand-in |
|---|---|---:|---:|---:|---|
| `gem_agate` | **Agate** | 1s | 7c | 4c | Agate |
| `gem_citrine` | **Citrine** | 2s | 1s 5c | 8c | Jacinth |
| `gem_quartz` | **Clear Quartz** | 3s | 2s 2c | 1s 2c | Quartz |
| `gem_aquamarine` | **Aquamarine** | 5s | 3s 7c | 2s | Topaz |
| `gem_opal` | **Opal** | 8s | 6s | 3s 2c | Opal |
| `gem_pearl` | **Pearl** | 1g | 7s 5c | 4s | Pearl |
| `gem_sapphire` | **Sapphire** | 2g | 1g 5s | 8s | Sapphire |
| `gem_ruby` | **Ruby** | 3g | 2g 2s 5c | 1g 2s | Ruby |
| `gem_emerald` | **Emerald** | 4g | 3g | 1g 6s | Malachite |
| `gem_diamond` | **Diamond** | 5g | 3g 7s 5c | 2g | Diamond |

All prices in the table are exact values after the 75% and 40% rate, before any Charisma bonus.

Cassia also sells finished, nonmagical jewelry. Each piece can be worn in its listed equipment slot but grants no combat or ability bonus. Finished work loses more of its retail markup on resale than a loose stone, so Cassia pays **60%** and the Dredge-End pawnbroker pays **35%**. At the setting's ordinary labor rate of 6 copper per day, the last column gives the rough number of workdays needed to buy each piece at retail.

| Item ID | Item | Slot | Retail | Cassia | Pawnbroker | Labor days |
|---|---|---|---:|---:|---:|---:|
| `jewelry_silver_ring` | **Silver Ring** | Ring | 3s | 1s 8c | 1s | 5 |
| `jewelry_crescent_earrings` | **Crescent-Moon Earrings** | Head | 8s | 4s 8c | 2s 8c | 13⅓ |
| `jewelry_gold_ring` | **Gold Ring** | Ring | 1g | 6s | 3s 5c | 16⅔ |
| `jewelry_drop_pendant` | **Drop Pendant** | Neck | 1g 2s | 7s 2c | 4s 2c | 20 |
| `jewelry_gold_necklace` | **Fine Gold Necklace** | Neck | 2g 5s | 1g 5s | 8s 7c | 41⅔ |
| `jewelry_sapphire_gold_ring` | **Sapphire Gold Ring** | Ring | 4g | 2g 4s | 1g 4s | 66⅔ |
| `jewelry_ruby_gold_ring` | **Ruby Gold Ring** | Ring | 5g 5s | 3g 3s | 1g 9s 2c | 91⅔ |
| `jewelry_ruby_pearl_necklace` | **Ruby Pearl Necklace** | Neck | 4g 5s | 2g 7s | 1g 5s 7c | 75 |
| `jewelry_emerald_pearl_necklace` | **Emerald Pearl Necklace** | Neck | 5g 5s | 3g 3s | 1g 9s 2c | 91⅔ |
| `jewelry_diamond_gold_ring` | **Diamond Gold Ring** | Ring | 7g | 4g 2s | 2g 4s 5c | 116⅔ |
