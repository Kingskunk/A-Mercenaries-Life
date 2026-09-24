# Equipment & Items Reference — The Carrion Company

A comprehensive developer and lore reference for every wearable, equippable, and carried item in the codebase, detailing item IDs, descriptions, acquisition sources, slots, and exact mechanical effects.

---

## ◈ How the Equipment System Works

- **Tradeable items are defined in `tools/gear_catalog.json`.** Prices, names, hints, dossier text, optional seller quotes and shop stock live there, and `node tools/gen_gear.js` writes the loadout branches, dossier lines, inventory entries and shop menus from it (see `quest/GAMEPLAY_MECHANICS_RULES.md`). The tables below describe the items; the catalog is what the game is built from.

- **Id-Driven State Machine:** All paper-doll slots and weapons derive their display and combat properties from persistent string IDs (e.g., `equipped_weapon_id`, `equipped_head_id`, `equipped_neck_id`).
- **Idempotent Recomputations:** Changing equipment triggers idempotent recompute subroutines (`recalculate_armor_class`, `apply_weapon_loadout`, `apply_head_loadout`, etc.). No stat is nudged with bare `*set +N` operations, ensuring complete refresh and replay safety.
- **Starting Snapshot Mechanism:** At enlistment/chargen, the player's initial weapon and armor choices are permanently saved to `starting_weapon_*` and `starting_armor_*`. Players can switch back to their starting equipment at any time from the dossier.
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
| `starting` / `ash_spear` | **Seven-Foot Ash-Wood Spear** | One-Handed Reach Melee | `1d6/1d8 piercing` | Enlistment (Ashbrook / Outlaw) or Armorer — **2s 0c** | Reach weapon (STR-based). Versatile 1d8 profile in frontline combat. |
| `starting` / `felling_axe` | **Heavy Hooked Broadaxe** | Two-Handed Heavy Melee | `1d12 slashing` | Enlistment (Ashbrook) or Master Smith — **5s 0c** | Heavy Two-Handed weapon (STR-based). Forces `weapon_hands = "two_handed"`, automatically stowing off-hand shields. Eligible for Great Weapon Fighting rerolls. Sidearm profile deals 1d8 slashing. |
| `starting` / `matched_dagger` | **Twin Daggers** | One-Handed Finesse | `1d4 piercing` | Enlistment (Port Valen Outlaw) or Cutler — **1s 5c** (pair) | Finesse (uses higher of STR or DEX for attack and damage). Triggers Rogue Sneak Attack (+1d6). |
| `starting` / `hand_crossbow` | **Compact Hand Crossbow** | One-Handed Ranged | `1d6 piercing` | Enlistment (Port Valen Outlaw) or Bowyer — **2s 5c** | Ranged weapon (DEX-based). Single-handed, concealable. Triggers Rogue Sneak Attack (+1d6). |
| `starting` (Scout) | **Recurve Shortbow** | Two-Handed Ranged | `1d6 piercing` | Enlistment (Outlaw Dev Preset) or Bowyer — **2s 5c** | Ranged weapon (DEX-based). Two-handed. Triggers Rogue Sneak Attack (+1d6). |
| `starting` (Disgraced) | **Iron-Shod Quarterstaff** | One-Handed / Versatile Melee | `1d6/1d8 bludgeoning` | Enlistment (Disgraced Scion) or Woodworker — **1s 5c** | Versatile blunt weapon (STR-based, 1d6/1d8). |
| `starting` / `bodkin_dagger` | **Slim Dagger** | One-Handed Finesse | `1d4 piercing` | Enlistment (Disgraced Scion) or Cutler — **1s 5c** | Finesse (uses higher of STR or DEX). Triggers Rogue Sneak Attack (+1d6). |
| `starting` (Disgraced) | **Compact Light Crossbow** | Two-Handed Ranged | `1d8 piercing` | Enlistment (Disgraced Scion) or Bowyer — **3s 0c** | Ranged weapon (DEX-based, 1d8). Two-handed. |
| `timber_axe` | **Highland Hewing Axe** | One-Handed Melee | `1d8 slashing` | Master Torvald's Smithy (Alderford) or Halda's Forge (Port Valen) — **2s 5c** | One-handed felling axe (STR-based). Compatible with off-hand shields and Dueling Fighting Style (+2 damage). |
| `stiletto` | **Alderford Stiletto** | One-Handed Finesse | `1d4 piercing` | Master Torvald's Smithy (Alderford) or Halda's Forge (Port Valen) — **1s 5c** | Refined file-steel thrusting blade. Finesse (STR or DEX). Triggers Rogue Sneak Attack (+1d6). |

---

## 2. Off-Hand Shields

| Item ID | Item Name | Slot | Acquisition / Cost | Mechanical Effects |
|---|---|---|---|---|
| `has_shield` / `shield_equipped` | **Limestone Boss Shield / Buckler** | Off-Hand | Enlistment (Ashbrook Falchion) or Torvald's Smithy (**3s 0c**) | **+2 Armor Class (AC)** when strapped on. Can be toggled on/off in the dossier. Automatically stows if a two-handed weapon is drawn. Enables Fighter *Protection* Fighting Style. |

---

## 3. Torso Armor

Torso armor sets the character's base AC calculation in `recalculate_armor_class`. All armors within the same category share identical pricing to reflect mechanical parity.

| Item ID | Armor Name | Armor Class Category | Base AC Formula | Acquisition & Retail Cost | Mechanical Interaction & Rules |
|---|---|---|---|---|---|
| `brigandine` | **Iron-Studded Gambeson** | Medium Armor | `13 + DEX (max +2)` | Enlistment (Ashbrook), Armorer, or Halda's Forge (Port Valen, Middle Ward) — **7s 0c** | Solid protection against slashing and bludgeoning. Caps DEX contribution at +2. Identical mechanical tier to the Iron Chain Shirt. |
| `chain_jack` | **Iron Chain Shirt** | Medium Armor | `13 + DEX (max +2)` | Enlistment (Ashbrook), Armorer, or Halda's Forge (Port Valen, Middle Ward) — **7s 0c** | Interlocking scrap iron rings over wool. Caps DEX contribution at +2. Identical mechanical tier to the Iron-Studded Gambeson. |
| `plate_harness` | **Iron Plate Harness** | Heavy Armor | `16 (no DEX)` | Halda's Forge (Port Valen, Middle Ward) — **15s 0c** | Overlapping iron plates riveted over a mail coat. A flat AC 16 that ignores DEX entirely, so it beats medium armor unless DEX is high. Needs heavy-armor training (fighters only). |
| `buff_coat` | **Scaled Oxhide Coat** | Light Armor | `11 + DEX (full)` | Enlistment (Ashbrook) or Tanner — **3s 0c** | Supple hide with scale reinforcement. Full DEX bonus applies. Identical mechanical tier to all Light Armors. |
| `leather_cuirass` / `leather` | **Hardened Leather Armor** | Light Armor | `11 + DEX (full)` | Enlistment (Outlaw) or Leatherworker — **3s 0c** | Form-fitted hardened leather. Full DEX bonus applies. |
| `thief_leather` | **Oiled Leather Jerkin** | Light Armor | `11 + DEX (full)` | Enlistment (Outlaw) or Black Market — **3s 0c** | Lined with hidden pockets and pouches for concealed carry. Full DEX bonus applies. |
| `scout_wraps` | **Layered Leather Scout Wraps** | Light Armor | `11 + DEX (full)` | Enlistment (Outlaw) or Tanner — **3s 0c** | Silent movement wraps. Full DEX bonus applies. |
| `scholars_cassock` / `cloth` | **Quilted Scholar's Robe** | Cloth / Unarmored | `10 + DEX (full)` | Enlistment (Disgraced) or Tailor — **1s 0c** | Ordinary clothing. Qualifies for Wizard *Mage Armor* (`13 + DEX`) and Barbarian *Unarmored Defense* (`10 + DEX + CON`). |
| `reinforced_doublet` | **Reinforced Canvas Jacket** | Cloth / Unarmored | `10 + DEX (full)` | Enlistment (Disgraced) or Draper — **1s 0c** | Stiffened canvas. Counts as cloth/unarmored. |
| `tailored_vest` | **Tailored Travel Coat** | Cloth / Unarmored | `10 + DEX (full)` | Enlistment (Disgraced) or High Clothier — **1s 0c** | Noble travel garments. Counts as cloth/unarmored. |
| `traveling_cloak` | **Oiled Traveling Robes** | Cloth / Unarmored | `10 + DEX (full)` | Outfitter / Chandler — **1s 0c** | Traveling mantle and robes. Counts as cloth/unarmored. |

---

## 4. Headwear Slot (`equipped_head_id`)

Headwear is divided into physical armor (+1 AC) and non-armor headwear (0 AC, cosmetic / warmth).

| Item ID | Item Name | AC Bonus | Counts as Armor? | Acquisition & Retail Cost | Description & Mechanical Details |
|---|---|---|---|---|---|
| `torvald_iron_sallet` | **Cold-Hammered Skullcap** | **+1 AC** | **Yes** (`head_is_armor = true`) | Master Torvald's Smithy (Alderford) or Halda's Forge (Port Valen) — **3s 0c** | Plain riveted steel skullcap with guild touchmark. Grants flat **+1 AC**. Because it counts as wearing real armor, it **suppresses** Wizard *Mage Armor* and Barbarian *Unarmored Defense*. |
| `torvald_hide_cap` | **Boiled-Hide Watch Cap** | 0 AC | No | Master Torvald's Smithy (Alderford) — **8c** | Stiffened blackened leather cap. Cosmetic/warmth headwear. Does not interfere with unarmored/cloth abilities. |
| `arming_cap` | **Padded Linen Cap** | 0 AC | No | Enlistment (Ashbrook) or Tailor — **8c** | Quilted linen and wool cap worn beneath iron helmets. Cosmetic headwear. |
| `camo_hood` | **Shadowed Mottled Hood** | 0 AC | No | Enlistment (Outlaw) or Draper — **8c** | Mottled dark hood designed to break facial contours in brush and fog. Cosmetic headwear. |
| `scholar_coif` | **Scholar's Linen Cap** | 0 AC | No | Enlistment (Disgraced) or Scribe Shop — **8c** | Tailored linen cap worn by academics, tutors, and scions. Cosmetic headwear. |
| `none` | **Bare Head** | 0 AC | No | Default / Unequipped | No headgear worn. |

---

## 5. Cloaks Slot (`equipped_cloak_id`)

Cosmetic apparel worn over shoulders. Standard civilian and military mantles share a flat **1s 0c** baseline.

| Item ID | Item Name | Acquisition & Retail Cost | Description & Mechanical Role |
|---|---|---|---|
| `talia_oiled_cloak` | **Talia's Oiled Cloak** | Talia's Shed (Alderford) — Quest Reward (Priceless) | Heavy oil-dark cloak saturated with mutton tallow and neatsfoot dubbin to repel salt spray and marsh rot. Equippable cosmetic cloak; awarded alongside the river crossing protection (`prep_waterproof_gear`). |
| `wool_mantle` | **Iron Bull Wool Mantle** | Enlistment (Ashbrook) or Weaver — **1s 0c** | Coarse, heavy-spun wool cloak pinned with an iron brooch. Cosmetic apparel. |
| `camo_cloak` | **Weathered Mottled Cloak** | Enlistment (Outlaw) or Dyer — **1s 0c** | Mottled marsh-green and brown wool cloak for blending into reeds and scrub. Cosmetic apparel. |
| `weather_cloak` | **Oiled Marcher Weather Cloak** | Enlistment (Disgraced) or Outfitter — **1s 0c** | High-collared travel cloak treated with pine-oil against frontier rains. Cosmetic apparel. |
| `none` | **None** | Default / Unequipped | Bare shoulders. |

---

## 6. Handwear Slot (`equipped_hands_id`)

Cosmetic handwear and weapon wraps. All non-armor wraps share a flat **8c** baseline.

| Item ID | Item Name | Acquisition & Retail Cost | Description & Mechanical Role |
|---|---|---|---|
| `rorik_grip_wraps` | **Tarred Grip Wraps** | Veteran Rorik (`camp_night.txt`) / Outfitter — **8c** | Dense coils of tarred linen wound around palms and knuckles to protect against blistering and wet hilt slippage. Equippable cosmetic handwear. |
| `leather_wraps` | **Hardened Leather Wraps** | Enlistment (Ashbrook) or Cobbler — **8c** | Boiled-leather straps wrapped around wrists and forearms for weapon grip. Cosmetic handwear. |
| `archer_bracers` | **Supple Archer Bracers** | Enlistment (Outlaw) or Bowyer / Tanner — **8c** | Flexible leather forearm bracers protecting against bowstring slap. Cosmetic handwear. |
| `scribe_gloves` | **Scribe's Writing Gloves** | Enlistment (Disgraced) or Guild Stationer — **8c** | Supple fingerless calfskin writing gloves with tailored wrist supports. Cosmetic handwear. |
| `none` | **Bare Hands** | Default / Unequipped | Unwrapped hands. |

---

## 7. Waist Slot (`equipped_waist_id`)

Standard field belts and frogs share a flat **1s 0c** baseline.

| Item ID | Item Name | Acquisition & Retail Cost | Description & Mechanical Role |
|---|---|---|---|
| `rorik_campaign_belt` | **Iron-Riveted Campaign Belt** | Veteran Rorik (`camp_night.txt`) — Veteran Gift (Priceless) | Worn, heavy leather field belt reinforced with hammered iron rivets and a reinforced frog. Equippable cosmetic belt. |
| `soldiers_belt` | **Heavy Soldier's Belt** | Enlistment (Ashbrook) or Harness-Maker — **1s 0c** | Broad harness-leather belt with forged iron buckle and heavy scabbard frog. Cosmetic belt. |
| `scabbard_belt` | **Concealed Scabbard Belt** | Enlistment (Outlaw) or Black Market — **1s 0c** | Supple leather belt fitted with low-profile loops and hidden sheath slots. Cosmetic belt. |
| `satchel_harness` | **Satchel Harness** | Enlistment (Disgraced) or Scribe — **1s 0c** | Cross-body shoulder and waist leather harness carrying document cylinders. Cosmetic belt. |
| `marl_rope_belt` | **Marl's Tarred Rope Belt** | Port Valen — Marl Coyne's Rescue (Quest Reward, Priceless) | Thick tarred rope with a wooden toggle worn smooth, taken off a skipper who has crossed the bar for twenty years. Equippable cosmetic belt. |
| `none` | **None** | Default / Unequipped | Bare waist. |

---

## 8. Footwear Slot (`equipped_feet_id`)

Standard travel and combat boots share a flat **1s 5c** baseline.

| Item ID | Item Name | Acquisition & Retail Cost | Description & Mechanical Role |
|---|---|---|---|
| `talia_deck_boots` | **Talia's Pitch-Sealed Deck Boots** | Talia's Shed (Alderford) — Quest Reward (Priceless) | Waterproofed leather deck boots, pitch- and wax-sealed river-tight against marsh damp. Equippable cosmetic boots; awarded alongside river crossing protection (`prep_waterproof_gear`). |
| `brant_iron_heel_boots` | **Brant's Iron-Heel Boots** | Port Valen — Rotten Rib Quest (Brant), Quest Reward (Priceless) | Heavy bull-hide boots pitch-sealed against estuary damp, fitted with caulked iron heel-plates for slipway grip. Equippable cosmetic boots. |
| `marching_boots` | **Iron-Nailed Marching Boots** | Enlistment (Ashbrook) or Cordwainer — **1s 5c** | Thick oxhide boots studded with iron nail-heads for traction in heavy clay mud. Cosmetic footwear. |
| `scout_boots` | **Soft-Soled Scout Wraps** | Enlistment (Outlaw) or Tanner — **1s 5c** | Supple, silent moccasin boots lined with sheepskin for muffled footing. Cosmetic footwear. |
| `riding_boots` | **Travel Riding Boots** | Enlistment (Disgraced) or Master Bootmaker — **1s 5c** | High-topped calfskin riding boots built for saddle stirrups and highway travel. Cosmetic footwear. |
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
| `althea_votive_ring` | **Saint Althea's River-Stone Ring** | No | Chapel of Saint Althea — Pious Offering (**6c** temple donation) | Flat river stone drilled and bound in silver wire, offered by watermen before river crossings. Equippable on either ring finger. |
| `none` | **Bare Finger** | No | Default / Unequipped | Empty ring slot. |

---

## 11. Carried Field Tools & Consumables (Mechanical Inventory)

These items are carried in the player's satchel/inventory and provide active mechanical utility in skill checks, exploration, or combat:

| Variable | Item Name | Type | Acquisition Source / Retail Cost | Exact Mechanical Effect |
|---|---|---|---|---|
| `has_iron_crowbar` | **Pioneer's Iron Prybar** (Sapper's Pinch Crowbar) | Field Tool | Master Torvald's Smithy (Alderford) or Halda's Forge (Port Valen) — **1s 2c** | Cold-forged crowbar and tempered climbing pegs. **Grants Advantage on Strength/Athletics and Force/Pry checks** (e.g., prying waterlogged timbers in Alderford's weir or forcing barred stone doors). |
| `has_althea_phial` | **Phial of Saint Althea's Water** | Consumable Holy Relic | Chapel of Saint Althea (Alderford / Valen) — Temple Offering (**1s 0c**) | Stackable. Used at will (combat item option, the dossier's Satchel, or the inventory panel's **Use** button) to **restore 2d4 + 2 Hit Points**. In combat it costs the turn and has no limit; out of combat it shares the once-a-day instant-heal limit (`last_mundane_treatment_day`) with the Dredge-End hedge-doctor. Refused, and not consumed, at full HP. |
| `prep_waterproof_gear` | **Waterproofing Dubbin Tins** | Gear Treatment | Talia's Shed (Reward) or Chandler / Cobbler — **7c** | Waterproofs boots, weapon frogs, and leather harness. Negates cold-water exposure hazards and prevents disadvantage during river barge transits. |
| `unique_buff` (Warming Liniment) | **Warming Liniment** | Timed Boon | Ambrose's Still-Room (Port Valen, Herb-Pounder Close) — **1s** | **+1 STR for 12 hours** through `apply_unique_buff`. A +1 only raises the modifier when it lifts an odd score onto the next even number. Takes one of the 3 unique-buff slots, so it stacks with food, drink, sleep and other unique boons. Hidden while active. |
| `unique_buff` (Clear-Head Draught) | **Clear-Head Draught** | Timed Boon | Ambrose's Still-Room (Port Valen, Herb-Pounder Close) — **1s** | **+1 WIS for 12 hours** through `apply_unique_buff`. Same parity rule as the liniment. Hidden while active. |
| `scrap_steel` | **Scrap Steel** | Salvage (count) | Dredge-End night ambush victory: 1 to 3 pieces | Bent blades and iron fittings. Halda's Forge buys them by weight at **5c a piece** (all at once). Not sold by any shop. |
| `has_talia_provisions` | **Hearth-Baked Travel Provisions** | Food Supply | Talia's Loft or Middle Ward Bakery — **5c** | Warm crusty bread and salt-cured river trout wrapped in greasecloth. Provides dense, sustaining nourishment. |
| `has_letter_of_credit` | **Gilded Scales Letter of Credit** | Financial Note | Gilded Scales Factor (Alderford / Port Valen) | Certified draft for silver marks (`letter_of_credit_value`), redeemable at counting houses in Alderford or Port Valen. |
| `has_silt_gate_payout_slip` | **Broker's Payout Slip** | Quest Evidence | Silt-Gate Contraband, Branch C (squeeze the broker) | Wax vellum listing the Watch night-sergeants who take weekly payoffs. Spend it once: sell it to the Dockmaster for silver and Watch standing, or hold it for Captain Vane as leverage (`vane_watch_leverage`). |

---

## 12. Selling Gear (Port Valen)

Prices live in one place: `equipment.txt` `gear_sale_value` (retail in copper, per item), and `sell_gear` removes the item. A sale that would leave the player wearing something they no longer own puts them back in their starting gear (weapon, armor, or their origin's default cap); a weapon held in the sidearm slot is cleared to `none`.

| Buyer | Where | Pays | Buys |
|---|---|---|---|
| Halda (smith) | Halda's Forge, Middle Ward | **50% of retail** | studded gambeson, mail shirt, hewing axe, stiletto, iron skullcap, iron prybar, and scrap steel (5c a piece) |
| Pawnbroker | Dredge-End, Lamp Stair (daytime) | **35% of retail**, no questions | everything Halda buys except scrap steel, plus the hide cap and the signet ring (fixed **8s**) |

Never sellable: starting gear (it is the fallback) and quest rewards (Talia's cloak and boots, Marl's belt, Brant's boots, the Hearthstone Talisman, Elspeth's keepsake, the Althea ring). Example sales: mail shirt 3s 5c to Halda or 2s 4c to the pawnbroker; skullcap 1s 5c or 1s.

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

**The trade panel** (`web/mygame/trade.js`, `trade.css`) is a tablet-friendly quality-of-life layer over the menus, never a replacement. Buy and Sell tabs with `-` / `+` steppers, a running total, and a Confirm button. It appears (a **Trade** button in the header, plus a bar at the top of the Inventory, or the T key) only on pages that offer it: Halda's forge and racks, and the pawnbroker's window. The "Look over the racks" and "Put something on the bench" menus stay on every shop as the fallback.

How it stays honest: the panel only writes a cart (`cart_buy_<id>`, `cart_sell_<id>`) and clicks the shop's hidden `⚖ Settle up the trade panel.` option. `equipment.txt` (`shop_begin`, the shop's generated `*_cart_pass`, `shop_check`) re-prices, re-counts and re-checks the coin inside the shop's currency lock, so a tampered cart cannot buy what the menus could not. One `advance_time` covers the whole trade (each distinct purchase's fitting minutes, plus 10 for a sale).

Adding a shop: give its scene the marker pairs `<name>_cart_pass` (and `<name>_panel_rows` for a buy side), an `*_open_panel` label that sets `shop_open` and `shop_rows`, a `*_settle` label copied from Halda's, the hidden settle option on its hub, and a `trades` entry in `tools/gear_catalog.json`. `web/mygame/trade-data.generated.js` is generated by `tools/gen_gear.js`.

**Consumables** (kind `consumable` in the catalog: the Warming Liniment, Clear-Head Draught and Saint Althea's phial) are stackable and used at will. One routine, `equipment.txt` `use_consumable <id>`, applies the effect, takes one copy (a spare first) and is replay-safe; every route calls it: the fight's "Use an item from your satchel" option (`combat.txt`, costs the turn, generated from the catalog), the dossier's "Satchel: Use a Consumable" menu (`choicescript_stats.txt`, `codex_use`), and the inventory panel's **Use** button, which opens the dossier straight at `codex_use_do` so the effect is still written by ChoiceScript. Effects are `heal` (dice; free in combat, once a day out of combat) or `boon` (goes through `apply_unique_buff`; no limit; stacks with food and other boons; using a second copy while one runs just refreshes the timer). The dossier and inventory refuse mid-fight (`combat_engaged`). Ambrose's Still-Room is a catalog shop like Halda's (plain "Look over the shelves" menu plus the trade panel, buy only).
