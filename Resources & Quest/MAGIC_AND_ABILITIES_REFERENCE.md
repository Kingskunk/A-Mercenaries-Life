# Magic & Abilities Reference — The Carrion Company

This reference describes what the game currently does. It is not a transcription of tabletop rules. The player-facing version is `choicescript_stats.txt` at `codex_abilities`; its wording must match the runtime mechanics below.

---

## Core Rules

- Combat distance uses named tiers: **Engaged**, **Close**, **Mid-Range**, and **Long Range**. Spell reach is **Engaged**, **Medium Reach**, or **Long Reach**; never document it in feet.
- An ordinary combat turn has one action, one bonus action, one movement, and one reaction. A feature may use another budget only when its implementation explicitly says so.
- `spell_save_dc` is the shared save DC. Spell attacks use proficiency plus the class casting modifier: Intelligence for Wizard, Charisma for Bard and Warlock, Wisdom for Ranger.
- Cantrips cost no spell slot. First-level spells spend the caster's class pool unless a racial use, invocation, ritual, scroll, or free Ranger cast explicitly replaces the cost.
- Untrained armor or a shield can set `spells_blocked`; class spell options then disappear until the equipment problem is removed. Scrolls remain usable.
- Temporary HP does not stack. Damage resistance halves after rounding down; vulnerability doubles; matching resistance and vulnerability cancel.

### Reach Classes

| Reach | Game meaning |
|---|---|
| Engaged | The target is in melee reach. |
| Medium Reach | The target is no farther than the fight's Mid-Range threshold. |
| Long Reach | Any target in the current combat lane. |

Ranged spell attacks made while Engaged have disadvantage. Saving-throw spells do not suffer that attack-roll penalty. `tools/spell_catalog.json` owns combat reach tags and `tools/gen_spells.js` writes the generated reach flags.

---

## Racial Mechanics

| Race | Implemented behavior |
|---|---|
| Human | +1 to all six abilities. No separate triggered trait. |
| Elf | Darkvision; advantage when `save_vs` is tagged `charmed` or `sleep`; Perception proficiency. |
| Dwarf | Darkvision; advantage when `save_vs` is tagged `poison`. Poison-damage resistance is not implemented. |
| Half-Orc | Darkvision; Intimidation proficiency. Black Sinks uses special endurance narration, but shared combat has no once-per-rest 1 HP trigger. |
| Halfling | Small size; a natural 1 on a d20 check rerolls once automatically. |
| Tiefling | Darkvision; Thaumaturgy unlocks authored story choices. Fire resistance is not implemented. |
| Hexblood | Darkvision; innate Hex is free once per Long Rest. Innate Disguise Self is known but has no generic disguise state. |

Darkvision and Devil's Sight both set `sees_in_dark`. In dungeon travel this prevents darkness disadvantage, avoids light consumption, and allows explored rooms to be added to the map.

---

## Class Features

| Class | Feature | Current mechanic |
|---|---|---|
| Fighter | Second Wind | Bonus action; heals `1d10 + level`; a Short Rest returns one use and a Long Rest all uses. |
| Fighter | Action Surge | From level 2; no action cost; grants one additional action; Short or Long Rest restores uses. |
| Fighter/Ranger | Fighting Style | `fighting_style_info` is the display source. Styles alter AC, attack, damage, reactions, or attack options as described there. |
| Barbarian | Rage | Bonus action; eligible Strength-based melee hits gain the rage bonus and incoming bludgeoning, piercing and slashing damage is halved for the fight. Strength-check advantage is not implemented. |
| Barbarian | Reckless Attack | From level 2; Strength attacks gain advantage until the next turn, while enemy attacks against the Barbarian also gain advantage. |
| Barbarian | Danger Sense | From level 2; advantage on Dexterity saves when the check is tagged correctly. |
| Rogue | Sneak Attack | Once per turn on a finesse or ranged weapon hit with advantage, or without disadvantage while a living ally is Engaged with the target. |
| Rogue | Cunning Action | From level 2; Dash, Disengage, and Hide can use the bonus action budget. |
| Ranger | Hunter's Mark | Bonus action; free casts equal proficiency bonus per Long Rest, then Ranger slots; marked weapon hits add `1d6` Force for 10 rounds. |
| Bard | Bardic Inspiration | Bonus action; an ally adds the die to its next missed attack, or a solo Bard adds it to the next failed d20 check. |
| Wizard | Arcane Recovery | Once per Long Rest, triggered by a Short Rest; restores first-level slots up to half Wizard level, rounded up. |
| Wizard | Ritual Casting | Only authored story choices tagged as rituals use it; spend 10 extra minutes instead of a slot. |
| Warlock | Pact Magic | All Pact Magic slots return on a Short or Long Rest. |

### Fighting-Style Terms

- **Close Combat Shooter:** while Engaged, ranged weapon attacks lose their normal disadvantage and ranged hits gain +2 damage.
- **Dual Shot:** one ranged attack against each of two targets at the same range; both attacks have disadvantage.
- **Protection:** while holding a shield, impose disadvantage on an attack against a nearby ally.

---

## Spell Status

The player-facing card must identify one of these states:

- **Combat:** directly available in the shared combat hub.
- **Exploration:** maintained by dungeon, camp, travel, timer, or sidebar-cast systems.
- **Story:** appears only in authored scene choices; that scene owns its time, cost, check, and outcome.
- **Narrative:** known and displayed, but no current mechanic calls it.

### Cantrips

| Spell | Status | Implemented effect |
|---|---|---|
| Blade Ward | Combat | Bonus action; halves weapon bludgeoning, piercing and slashing damage through the end of the next turn; cannot be refreshed while active. |
| Booming Blade | Combat | Engaged melee weapon attack; a hit marks the target and voluntary movement triggers Thunder damage. |
| True Strike | Combat | One weapon attack using the casting ability; choose normal weapon damage or Radiant; gains scaling Radiant dice from level 5. |
| Fire Bolt | Combat / Exploration | Long Reach spell attack for `1d10` Fire; also starts camp and crafting fires. |
| Ray of Frost | Combat | Medium Reach spell attack for `1d8` Cold; a hit prevents the target from Dashing on its next turn. |
| Shocking Grasp | Combat | Engaged spell attack for `1d8` Lightning; a hit spends the target's reaction; metal-armored targets grant advantage when marked as such. |
| Eldritch Blast | Combat | Long Reach spell attack for `1d10` Force; invocations can add Charisma damage or push one range step. |
| Chill Touch | Combat | Medium Reach spell attack for `1d8` Necrotic. No healing-prevention rider is implemented. |
| Vicious Mockery | Combat | Medium Reach Wisdom save; `1d4` Psychic and disadvantage on the next attack on failure. |
| Poison Spray | Combat | Medium Reach Constitution save; `1d12` Poison on failure. |
| Control Flames | Combat / Exploration | Spreads fire between enemies on one tile, banks campfires, and extends one torch by three dungeon steps. |
| Guidance | Exploration | Sidebar cast; next eligible ability check within 1 minute gains `1d4`; unavailable in combat. |
| Light | Exploration | Supplies dungeon light without torch consumption. |
| Mending | Story | Authored repair options in travel, quests, and the Black Sinks bivouac. |
| Mage Hand | Story | Authored remote-manipulation choices. |
| Minor Illusion | Story | Authored distraction and deception choices. |
| Prestidigitation | Story / Exploration | Starts camp and crafting fires and appears in authored minor-magic choices. |
| Thaumaturgy | Story | Authored intimidation and supernatural-display choices. |
| Message | Narrative | No current mechanical caller. |

### First-Level Spells

| Spell | Status | Implemented effect |
|---|---|---|
| Arms of Hadar | Combat | Action; every Engaged enemy makes a Strength save against one shared `2d6` Necrotic roll; failed targets also lose reactions. |
| Armor of Agathys | Combat | Action; 5 temporary HP and 5 Cold retaliation on melee hits while those HP remain in the current fight. |
| Bane | Combat | Action; first three living enemies make Charisma saves; failures subtract `1d4` from attacks and saves for 10 rounds. |
| Cause Fear | Combat | Medium Reach Wisdom save; failed target has disadvantage on attacks and will not approach; repeats the save after its turns. |
| Dissonant Whispers | Combat | Medium Reach Wisdom save; `3d6 + casting modifier` Psychic, half on success; no forced movement. |
| Ensnaring Strike | Combat | Bonus action; arms the next weapon hit for up to 10 rounds; failed Strength save restrains and deals recurring `1d6` Piercing. |
| False Life | Combat / Exploration | Action; `1d4+4` temporary HP for 12 hours; sidebar cast supported; Fiendish Vigor removes slot cost. |
| Healing Word | Combat | Bonus action; heals self or sidebar-selected ally for `1d4 + casting modifier`, minimum 1, anywhere in the fight. |
| Hellish Rebuke | Combat | Free to arm; next damaging enemy attack spends reaction and Pact slot, then deals `2d10` Fire, Dexterity save for half. |
| Hex | Combat | Bonus action, Medium Reach; attack-roll hits add `1d6` Necrotic for the fight; no concentration system. |
| Hunter's Mark | Combat | Bonus action, Medium Reach; weapon hits add `1d6` Force for 10 rounds; orphaned mark moves without another cast. |
| Mage Armor | Combat / Exploration | Action; base AC 13 + Dexterity for 24 hours while body gear is cloth and no armored headpiece is worn; sidebar cast supported. |
| Magic Missile | Combat | Action, Long Reach; three sidebar-allocated darts, each `1d4+1` Force, no attack roll. |
| Shield | Combat | Free to arm; spends Wizard slot and reaction only when +5 AC converts a hit to a miss; remains through the next turn. |
| Charm Person | Story | Authored social choices own target, cost, and outcome. |
| Detect Magic | Story | Authored magical-investigation choices; normal slot/scroll cost or Wizard ritual time. |
| Jump | Story | Authored traversal choices; no persistent movement multiplier; Otherworldly Leap makes casts free. |
| Speak with Animals | Story | Authored beast conversations; normal slot/scroll cost or Wizard ritual time. |
| Unseen Servant | Story | Authored Longshade interactions; normal slot/scroll cost or Wizard ritual time. |
| Alarm | Narrative | No current camp-watch or intrusion caller. |
| Comprehend Languages | Narrative | No current language-check caller. |
| Disguise Self | Narrative | No generic cast action, timer, or disguise state. |
| Feather Fall | Narrative | No current fall reaction or falling-state caller. |
| Identify | Narrative | No current item-identification caller. |

---

## Spell Pools and Recovery

| Pool | Recovery |
|---|---|
| Wizard | Short Rest restores half, rounded up; Arcane Recovery may add more once per Long Rest; Long Rest restores all. |
| Bard | Short Rest restores half, rounded up; Long Rest restores all. |
| Warlock | Short or Long Rest restores all Pact Magic slots. |
| Ranger | Slots begin at level 2; Short Rest restores half, rounded up; Long Rest restores all. |

`refresh_class_resource_maxs` owns pool maxima. `restore_class_resources` owns Long Rest recovery. `short_rest_preview` and `do_short_rest` own Short Rest recovery. Sleeping naturally restores only a small amount of HP through `calendar.txt resolve_sleep`; a Long Rest does not automatically refill HP.

---

## Sources of Truth

| Subject | Source |
|---|---|
| Player-facing reference | `web/mygame/scenes/choicescript_stats.txt` — `codex_abilities`, `print_ability_card` |
| Spell registry and sidebar order | `web/mygame/spell-data.js` |
| Spell reach | `tools/spell_catalog.json` and generated block in `combat.txt` |
| Combat spell gates | `web/mygame/scenes/combat.txt` |
| Combat spell resolution | `web/mygame/scenes/combat_spells.txt`, `combat_dice.txt` |
| Story utility spell cost | `web/mygame/scenes/dungeon.txt` — `dg_spell_source`, `dg_spell_cast` |
| Known-spell flags and resources | `web/mygame/scenes/character_progression.txt` |
| Timers and sleep | `web/mygame/scenes/calendar.txt` |
| Armor and Mage Armor | `web/mygame/scenes/equipment.txt` |

Run `node tools/check_abilities_reference.js` after changing the registry or reference. It verifies that every spell in `spell-data.js` has exactly one player-facing card and that tabletop distance units and audited stale phrases have not returned.
