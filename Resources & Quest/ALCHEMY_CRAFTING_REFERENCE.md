# Alchemy Crafting Reference

Status: design reference for the future alchemy system. The ingredients below are harvestable now; the crafted potions and their effects are not implemented yet.

## Harvesting rules

- Gathering uses the better of Nature or Survival and takes 15 minutes.
- A success yields 1 ingredient. Beating the DC by 5 or more yields 2.
- A failure spoils that patch until its normal refill.
- Each listed ingredient weighs 0.1 and has potency 1.
- Silt Gates patches and the ordinary Longshade patches are attempted once per location refill. The Old Grove has separate seasonal stock limits noted below.

## Ingredients

The listed properties are alchemy traits, not effects gained by eating a raw ingredient.

| Region | Ingredient | Item ID | Alchemy properties | Rarity | Harvest location | Check | Availability note |
|---|---|---|---|---|---|---|---|
| Silt Gates | Sluice-moss | `sluice_moss` | Mend; Resist Poison | Common | The Landing — wet brick seams | Nature or Survival DC 10 | Normal dungeon refill |
| Silt Gates | Brinecap | `brinecap` | Resist Poison; Hold Breath | Common | The Gate Hall — above the high-water line | Nature or Survival DC 11 | Normal dungeon refill |
| Silt Gates | Pale Crackroot | `pale_crackroot` | Hold Breath; Keen Sight | Uncommon | The Collapsed Run — a fissure beneath the street | Nature or Survival DC 11 | Normal dungeon refill |
| Silt Gates | Glowmold | `glowmold` | Fortify Health; Mend | Uncommon | The Lair — wet, dark stone | Nature or Survival DC 12 | Normal dungeon refill |
| Silt Gates | Cistern Spores | `cistern_spores` | Keen Sight; Fortify Health | Rare | The Vault — dry culvert beyond the tide | Nature or Survival DC 11 | Normal dungeon refill |
| Longshade Forest | Silverleaf | `silverleaf` | Mend Rest; Clear Mind | Common | The Lightning Oak — a break in the canopy | Nature or Survival DC 10 | Normal forest refill |
| Longshade Forest | Oakheart Balsam | `oakheart_balsam` | Mend Rest; Resist Cold | Common | The Low Ridge — fresh cuts on an oak | Nature or Survival DC 10 | Normal forest refill |
| Longshade Forest | Shadefern | `shadefern` | Resist Cold; Fortify Health | Uncommon | The Old Grove — wet rock by the seep | Nature or Survival DC 12 | Maximum 4 pieces per season |
| Longshade Forest | Acorn Truffle | `acorn_truffle` | Fortify Health; Surefooted | Rare | The Old Grove — leaf mold beneath the great oak | Nature or Survival DC 14 | Maximum 3 pieces per season |
| Longshade Forest | Brambleberry | `brambleberry` | Surefooted; Clear Mind | Uncommon | The Dry Edge — briars along the game trail | Nature or Survival DC 11 | Normal forest refill |

## Crafting rules

- A standard potion consumes 2 ingredients which share one alchemy property and produces 1 potion.
- Every standard potion also consumes 1 Empty Potion Vial.
- Repeating a timed potion refreshes its duration rather than creating a second timer, unless an individual effect explicitly says otherwise.
- Three-ingredient brews are reserved for later, stronger versions of existing recipes rather than wholly new effects.
- These icon files are selected source art in the current icon library. The two generated Mending/Tidebreath source images are not the chosen production art.

## Crafting supply

| Supply | Planned item ID | Source icon | Seller | Price | Weight | Use |
|---|---|---|---|---:|---:|---|
| Empty Potion Vial | `empty_potion_vial` | `Item/Miscellaneous_item/05-empty-vial.png` | Herbalists | 1 copper | 0.1 | A stackable clear-glass, corked vial. One is consumed for each brewed potion. **Built 2026-10-23:** on Ambrose's shelf and buyable now. |
| Portable Burner | `portable_burner` | `Item/Miscellaneous_item/07-portable-burner.png` | Herbalists | 45 copper (invented) | 4 | A squat brass burner for brewing on the road or at camp. **Built 2026-10-23:** on Ambrose's shelf; price, weight and sell-back (22c) are stand-ins until the user rules. Nothing asks for it yet. |

## The crafting menu (the user's design, 2026-10-23)

- **Where:** no new rail button. A **Craft** tab on the Inventory's left side (beside You and each container) swaps that side to the crafting view; You swaps it back. Built: the tab and the three tool slots. Its icon is a stand-in (the mortar's), the user to choose.
- **Tools fill themselves.** Alchemy needs the Empty Potion Vial, the Portable Burner and the Mortar and Pestle. Each slot is filled from everything the character can reach: the pack first, then every container that is with them (the saddlebags, any future one). A container that waits outside a dungeon is out of reach inside one. Nothing is dragged into a tool slot. The same menu will make food later, with its own list of required tools (`CRAFT_MODES` in `inventory.js`); alchemy first, cooking after.
- **Better tools later** (better glass, burner, mortar) will lower the crafting DC. For now a tool only allows crafting; the mortar's old +1 on Medicine checks was removed 2026-10-23.
- **Ingredient boxes (built 2026-10-23):** three boxes under the tool slots. Click an ingredient in the bag to fill the next empty box, or drag it onto a particular box (a filled box takes the new one in its place). Click a filled box to take its ingredient back. An ingredient is any bag item with `alchemy` data in `inventory-data.js`; in the crafting view everything else in the bag is dimmed. The boxes only CHOOSE: nothing is spent until Craft, a box cannot hold more of one ingredient than the pack carries, and a box whose ingredient is gone empties itself. Ingredients are pack-only for now (they have no stow flag, so no container holds them yet).
- **Result box (built 2026-10-23):** under the boxes, headed Makes. Two ingredients that match a row of the standard crafting table show that potion's icon, name, shared property, Crafting DC and one-line result, in either order. Anything else says why not: one ingredient so far, the same ingredient twice, a shared property with no recipe, nothing in common, or three ingredients (reserved for later upgrades). The recipes are `web/mygame/crafting-data.js` (`window.CRAFT_RECIPES`), written by hand from the Standard crafting table, so a change to that table needs the same change there. The potions are not items yet; the box only names them.
- **The Craft button (built 2026-10-23):** under the result box; disabled, with the reason beneath, in a fight or when a tool is missing (the place limits are not built: `craftWhy` in `inventory.js` is where they go). It leaves the recipe in `craft_*` stats and opens the dossier AT `codex_craft_now` (`choicescript_stats.txt`), the same one-shot route as Use, which runs `craft_brew` (`scenes/crafting.txt`): a Herbalism check (the better of Nature or Medicine, `roll_skill_check`), then 20 to 30 minutes either way. **A success** uses up both ingredients and one empty vial and adds the potion to the pack; **a failure** loses one of the two ingredients, picked at random, and keeps the vial. The one-line result (the check against the DC, the minutes) is a toast on the page. A vial that is only in a container is taken out into the pack first. The boxes keep what is left, so another brew is one click away; the panel closes for each brew (reopening it lands on the Craft tab). Refused in a fight and when starving or collapsing with 2 HP or less (a half hour of time can tick those debts).
- **The potions are catalog items (2026-10-23):** all nine are drinkable consumables in `tools/gear_catalog.json` (stackable, weight 0.3, retail 25, not sold anywhere), effect types `draught` (Mending) and `brewed` (the other eight). Each is drunk from the pack or the dossier, takes 5 minutes, is not usable in a fight and is used up on drinking. A timed potion is minutes left on a stat, counted down by `calendar.txt advance_time`; drinking the same one again renews the time and never makes a second timer.
- **Mending Draught works (built 2026-10-23):** drink it from the pack or the dossier (`use_consumable`, effect type `draught`, 5 minutes). It heals nothing at once. The next sleep that heals adds **+2 HP** (`calendar.txt resolve_sleep`, flag `draught_on`, `draught_bonus`) and the draught is used up when it helps, in the same way as a linen bandage. It is its own flag, so a draught and a bandage on the same night give +3 together. Refused at full HP ("no hurt worth mending", the cork stays in) and while one is already working. Not usable in a fight. The sleep line: "The draught does its quiet work through the night, and the ache is dull by waking." Tests: `draught_use_*` and `draught_sleep_*`. The other eight potions still have no effect.
- **The other eight effects (built 2026-10-23):**
  - **Brine Antivenom** (`brine_minutes_left`, 240): resistance to poison damage (folded into both incoming-damage resist routines in `combat_dice.txt`) and advantage on a save marked `save_vs "poison"` (`dice_engine.txt`). Poison comes at the player from three places (tests `snake_bite_poison*`, `silt_viper_bite_poison`, `dubhar_poison_spray_*`): the Longshade's Venomous Snake (1d4+2 piercing plus a separate 1d4 poison packet, the user's sheet, 2026-10-23), the Silt-Gates Giant Viper (piercing plus the same 1d4 poison, given the same rider by me) and the Grey-Cloaked Man's Poison Spray (1d12 poison, resisted to 6 from 12 in the test). A dwarf resists poison without the potion. No scene makes a save against poison yet.
  - **Tidebreath Elixir** (`tidebreath_minutes_left`, 10): ten minutes of held breath. **No scene asks for it** (the game has no submerged route yet): a future underwater scene tests `tidebreath_minutes_left > 0` and sets it to 0 when the dive begins.
  - **Darksight Tonic** (`darksight_minutes_left`, 240): `dungeon.txt dg_dark_check` never sets the dark while it lasts, so no torch is needed and the disadvantage and the ambush edge both go.
  - **Fortifying Tonic**: adds 4 to `temp_hp` at once (it adds to what is already held, as the reference says; a long rest clears it). It has no timer and no cap.
  - **Restful Balsam** (`balsam_on`): the next sleep, of any kind and whether or not it heals, leaves Well Rested for 12 hours (`calendar.txt resolve_sleep`, `sleep_balsam_night`), even in a shared bunk, and the balsam is used up by it.
  - **Clearhead Tea** (`clearhead_minutes_left`, 240): drinking it ends Clouded Mind (all three unique-buff slots), and the next INT or WIS check outside a fight (not a save) within 4 hours gets +2 and uses the tea up (`dice_engine.txt`, inside the roll's own lock).
  - **Winterward Tea** (`winterward_minutes_left`, 240): adds 50 to the cold cut in `calendar.txt calc_exposure` before the 90 percent cap, so with a 40 percent gear cut the cap is reached.
  - **Surestep Cordial** (`surestep_minutes_left`, 480): **+3** for **8 hours** on a check marked `check_task_type "footing"`, after the boots' bonus (it stacks with Brant's). Made stronger than the reference's +2 for 4 hours on 2026-10-23 (the user: its Acorn Truffle is limited to 3 a season).
  Tests: `potion_use_*`, `potion_sleep_balsam`, `potion_brine_poison_*`, `potion_darksight_night`, `potion_surestep_footing`, `potion_clearhead_*`, `potion_winterward_*`.
- **Still to build, one piece at a time:** the recipe list, which gains a recipe when it is first brewed and can then refill the boxes from the bag.
- **Rulings:** a brew takes **20 to 30 minutes**. A failed check **loses one ingredient and keeps the vial**. Crafting is limited to places (the user's picture, to be settled after the menu works): the room at an inn, the apartment in the Middle Ward, and anywhere in the overworld.

## Fairness review (2026-10-23)

The coin is cheap and the effort is the real price. A brew's herbs cost 1 to 3 copper each at Ambrose's buy-back prices and the vial 1, so a potion is 3 to 7 copper of material, against 5 for a linen bandage and 10 for a liniment or a clear-head draught. What the player pays is the gathering (15 minutes and a DC 10 to 12 check per herb, inside a dungeon), the brewing (20 to 30 minutes) and the failures. The kit is a one-time 75 copper (burner 45, mortar 30).

**The check** is the better of Nature (INT) or Medicine (WIS), plus proficiency if the character has the skill (a Rogue's expertise doubles it). At level 1 that runs from 0 for an untrained character with a 10 up to about +7 for a trained, expert one with a 16, and it keeps rising with levels, training, tools and Guidance, so the user keeps the DCs high (15 to 18): they ask a specialist, not a beginner. A beginner at +1 makes a DC 15 brew 35% of the time and a DC 18 one 20% of the time, each failure losing an herb, so for a character with no skill the first brews are an expensive gamble; that is the intended place for better tools, training and the later three-herb upgrades to come in, and it is noted here only so the number is known.

**Value of each effect against its cost:** Mending Draught +2 HP (twice a bandage, for about the same coin plus the work). Fortifying Tonic +4 temporary HP is a third of a level 1 character's hit points, held until a long rest, and the brews stack without a limit, which a rare herb and DC 16 keep in check for now. The Restful Balsam's +1 on non-combat INT and WIS checks is small, but its herbs are the cheapest and it works anywhere.

## Future crafting check

- Crafting will use an Herbalism check, taking the better of Nature or Medicine. The exact implementation can later add a dedicated Herbalism Kit proficiency, training bonuses, equipment, and permanent crafting boosts.
- The DCs intentionally begin high. A new character may make a basic brew with care and supplies, while specialists and future bonuses become meaningfully valuable rather than excessive.
- A success produces 1 potion. Failure handling is intentionally not fixed yet, so it can be balanced alongside ingredient availability and the eventual alchemy interface.

## Standard crafting table

**Tuned 2026-10-23:** the Mending Draught gives +2 HP, not +1, and the Surestep Cordial gives +3 for 8 hours, not +2 for 4. The DCs stay as the user wrote them (a fairness pass first lowered them by 2, and the user put them back: characters can reach +6 to +11 on a check, so level 1 is the wrong yardstick). The DCs in `web/mygame/crafting-data.js` must match this table.

| Potion | Ingredients consumed | Crafting DC | Shared property | Icon source | Mechanical result |
|---|---|---:|---|---|---|
| Mending Draught | Sluice-moss + Glowmold | 15 | Mend | `Item/Consumable/Potion/POT_Remedial_Potion_Unfaded_Icon.png` | The next proper sleep restores +2 additional HP. It supplements slow natural recovery and does not heal immediately. The effect is consumed by that sleep. |
| Brine Antivenom | Sluice-moss + Brinecap | 15 | Resist Poison | `Item/Consumable/Potion/POT_Antidote_Unfaded_Icon.png` | For 4 hours: resistance to poison damage and advantage on saves against poison. A later poison-condition hook may also let it clear ordinary poison. |
| Tidebreath Elixir | Brinecap + Pale Crackroot | 16 | Hold Breath | `Item/Consumable/Potion/POT_Potion_of_Gaseous_Form_Unfaded_Icon.png` | Provides 10 minutes of held breath for one submerged route or dive. It is not water breathing, does not improve swim speed, and is consumed when the underwater segment begins. |
| Darksight Tonic | Pale Crackroot + Cistern Spores | 18 | Keen Sight | `Item/Consumable/Elixir/ELX_Elixir_of_Darkvision_Unfaded_Icon.png` | For 4 hours: removes the normal no-light disadvantage in darkness for a character without darkvision. It does not illuminate the area or reveal hidden things. |
| Fortifying Tonic | Glowmold + Cistern Spores | 18 | Fortify Health | `Item/Consumable/Potion/POT_Potion_of_Vitality_Unfaded_Icon.png` | Gain +4 temporary HP. This adds to the current temporary-HP pool; it lasts until lost or a long rest. |
| Restful Balsam | Silverleaf + Oakheart Balsam | 15 | Mend Rest | `Item/Consumable/Potion/POT_Wilted_Dreams_Unfaded_Icon.png` | The next proper sleep grants Well Rested for 12 hours: +1 to non-combat INT and WIS checks. |
| Clearhead Tea | Silverleaf + Brambleberry | 16 | Clear Mind | `Item/Consumable/Elixir/ELX_Elixir_of_Vigilance_Unfaded_Icon.png` | Clears Clouded Mind or a future effect marked as a clear-mind condition, then grants +2 to the next INT or WIS check made within 4 hours. |
| Winterward Tea | Oakheart Balsam + Shadefern | 16 | Resist Cold | `Item/Consumable/Elixir/ELX_Elixir_of_Cold_Resistance_Unfaded_Icon.png` | For 4 hours: adds a 50% cut to cold exposure, using the normal exposure calculation and its existing 90% cap. |
| Surestep Cordial | Acorn Truffle + Brambleberry | 17 | Surefooted | `Item/Consumable/Potion/POT_Potion_of_Glorious_Vaulting_Unfaded_Icon.png` | For 8 hours: +3 to marked footing checks, such as slick stone, fords, wet timber, loose scree, and similar terrain. It stacks with Brant's Iron-Heel Boots. (Stronger than first written, 2026-10-23.) |

## Later three-ingredient upgrade pattern

Three ingredients should intensify an existing shared property, not create an unrelated effect. Example: Glowmold + Cistern Spores + Shadefern can become a Greater Fortifying Tonic that grants +6 temporary HP.
