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
| Empty Potion Vial | `empty_potion_vial` | `Item/Miscellaneous_item/05-empty-vial.png` | Herbalists | 1 copper | 0.1 | A stackable clear-glass, corked vial. One is consumed for each brewed potion. |

## Future crafting check

- Crafting will use an Herbalism check, taking the better of Nature or Medicine. The exact implementation can later add a dedicated Herbalism Kit proficiency, training bonuses, equipment, and permanent crafting boosts.
- The DCs intentionally begin high. A new character may make a basic brew with care and supplies, while specialists and future bonuses become meaningfully valuable rather than excessive.
- A success produces 1 potion. Failure handling is intentionally not fixed yet, so it can be balanced alongside ingredient availability and the eventual alchemy interface.

## Standard crafting table

| Potion | Ingredients consumed | Crafting DC | Shared property | Icon source | Mechanical result |
|---|---|---:|---|---|---|
| Mending Draught | Sluice-moss + Glowmold | 15 | Mend | `Item/Consumable/Potion/POT_Remedial_Potion_Unfaded_Icon.png` | The next proper sleep restores +1 additional HP. It supplements slow natural recovery and does not heal immediately. The effect is consumed by that sleep. |
| Brine Antivenom | Sluice-moss + Brinecap | 15 | Resist Poison | `Item/Consumable/Potion/POT_Antidote_Unfaded_Icon.png` | For 4 hours: resistance to poison damage and advantage on saves against poison. A later poison-condition hook may also let it clear ordinary poison. |
| Tidebreath Elixir | Brinecap + Pale Crackroot | 16 | Hold Breath | `Item/Consumable/Potion/POT_Potion_of_Gaseous_Form_Unfaded_Icon.png` | Provides 10 minutes of held breath for one submerged route or dive. It is not water breathing, does not improve swim speed, and is consumed when the underwater segment begins. |
| Darksight Tonic | Pale Crackroot + Cistern Spores | 18 | Keen Sight | `Item/Consumable/Elixir/ELX_Elixir_of_Darkvision_Unfaded_Icon.png` | For 4 hours: removes the normal no-light disadvantage in darkness for a character without darkvision. It does not illuminate the area or reveal hidden things. |
| Fortifying Tonic | Glowmold + Cistern Spores | 18 | Fortify Health | `Item/Consumable/Potion/POT_Potion_of_Vitality_Unfaded_Icon.png` | Gain +4 temporary HP. This adds to the current temporary-HP pool; it lasts until lost or a long rest. |
| Restful Balsam | Silverleaf + Oakheart Balsam | 15 | Mend Rest | `Item/Consumable/Potion/POT_Wilted_Dreams_Unfaded_Icon.png` | The next proper sleep grants Well Rested for 12 hours: +1 to non-combat INT and WIS checks. |
| Clearhead Tea | Silverleaf + Brambleberry | 16 | Clear Mind | `Item/Consumable/Elixir/ELX_Elixir_of_Vigilance_Unfaded_Icon.png` | Clears Clouded Mind or a future effect marked as a clear-mind condition, then grants +2 to the next INT or WIS check made within 4 hours. |
| Winterward Tea | Oakheart Balsam + Shadefern | 16 | Resist Cold | `Item/Consumable/Elixir/ELX_Elixir_of_Cold_Resistance_Unfaded_Icon.png` | For 4 hours: adds a 50% cut to cold exposure, using the normal exposure calculation and its existing 90% cap. |
| Surestep Cordial | Acorn Truffle + Brambleberry | 17 | Surefooted | `Item/Consumable/Potion/POT_Potion_of_Glorious_Vaulting_Unfaded_Icon.png` | For 4 hours: +2 to marked footing checks, such as slick stone, fords, wet timber, loose scree, and similar terrain. It stacks with Brant's Iron-Heel Boots. |

## Later three-ingredient upgrade pattern

Three ingredients should intensify an existing shared property, not create an unrelated effect. Example: Glowmold + Cistern Spores + Shadefern can become a Greater Fortifying Tonic that grants +6 temporary HP.
