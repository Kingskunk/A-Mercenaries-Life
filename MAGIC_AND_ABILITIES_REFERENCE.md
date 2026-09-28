# Magic & Abilities Reference — The Carrion Company

A developer reference for every racial trait, innate magic, class cantrip, and class spell currently implemented, plus exactly which ones do something mechanical versus which are flavor-only. Keep this updated whenever a new race/class option, cantrip, or spell is added.

---

## How the system works

- Nothing here uses a real spell-slot economy, prepared-spell tracking, or damage resolution. Every cantrip/spell is a **string flag + a flavor description**, the same pattern used for `class_title`/`race_trait_title` elsewhere.
- "Slots" (`warlock_spell_slots`, `wizard_spell_slots`, `bard_spell_slots`) are **live**: each holds the remaining count, has a `_max` written by `refresh_class_resource_maxs` (so the maximum follows `character_level`), is shown as `x / _max` in the dossier, and is spent at each cast site (`combat.txt` gates on `*_spell_slots > 0` and the `resolve_*` subroutine does the `- 1`). A long rest refills every pool via `restore_class_resources`; a short rest returns only the Warlock's Pact Magic slots, via `do_short_rest`. There is still no spell-slot *level* economy and no prepared-spell tracking — every spell in the game is first level, so one pool per class covers it.
- Almost everything below is **flavor-only**: it sets a variable and prints a description, but doesn't alter any dice roll, check, or damage. Where something is a real, working mechanic, it's called out explicitly — don't assume any cantrip/spell "does" anything in code beyond existing as a flag unless it's flagged as MECHANICAL below.
- All of it is gated behind `show_stat_hints` bracket tags in the choices, consistent with every other mechanical choice in the game.

---

## Racial Traits & Innate Magic

| Race | Ability Bonus | Darkvision | Racial Trait | Innate Magic | Mechanical? |
|---|---|---|---|---|---|
| Human | +1 to all six | No | Versatile (no combat effect, pure flavor) | None | No |
| Elf | +2 DEX | Yes | Fey Ancestry (advantage vs. charmed/sleep saves) | None | **Yes** — see below |
| Dwarf | +2 CON | Yes | Dwarven Resilience (advantage vs. poison saves; poison damage *resistance* still not wired — no damage system exists) | None | **Partially** — see below |
| Half-Orc | +2 STR, +1 CON | Yes | Relentless Endurance (cling to 1 HP on lethal blow — wired in `battle_take_damage`) | None | **Yes** — see below |
| Halfling | +2 DEX | No | Lucky | None | **Yes** — see below |
| Tiefling | +2 CHA, +1 INT | Yes | Hellish Resistance (fire resistance — *not wired in*). Trait text notes Hellish Rebuke (lvl 3) / Darkness (lvl 5) are real 5e unlocks **not yet earned** — no leveling system exists yet, so these are intentionally absent, not missing. | **Thaumaturgy** (cantrip, `race_cantrip` — wired into `camp_night.txt` intimidation) | **Yes** — see below |
| Hexblood | +1 CON, +1 CHA | Yes | Hex Magic (umbrella name for the two spells below; "once per long rest" noted in flavor text only, not enforced) | **Disguise Self** (`race_cantrip`) + **Hex** (`race_cantrip_2` — wired into `battle_black_sinks.txt` melee curse) | **Partially** — see below |

**MECHANICAL — Halfling Lucky:** wired into `roll_d20_check`. If a Halfling rolls a natural 1, the engine automatically rerolls once and uses the new result.

**MECHANICAL — Advantage/Disadvantage engine:** `roll_d20_check` now supports real advantage and disadvantage. Set `*set advantage true` (or `disadvantage`) before `*gosub_scene startup roll_d20_check`, and it rolls a second d20 and keeps the higher (advantage) or lower (disadvantage) result — resolved *before* Halfling Lucky checks for a natural 1, matching RAW (Lucky rerolls whichever die was actually used for the check, not both dice). If both flags are true they cancel out and it rolls normally, same as tabletop rules. Both flags — and `save_vs` — **auto-reset to false/`"none"` at the end of every check**, so a future scene never has to remember to clean up after itself; just set what you need immediately before the `*gosub_scene` call. The announcement text also appends `(Advantage)`/`(Disadvantage)` automatically when relevant.

**MECHANICAL — Fey Ancestry (Elf) & Dwarven Resilience (Dwarf):** both now trigger automatically inside `roll_d20_check` via a `save_vs` context tag. A future scene just needs to `*set save_vs "charmed"` (or `"sleep"`, or `"poison"`) immediately before the check — the engine handles granting advantage to the right race on its own. Example: right before a hag tries to charm the player, a scene would do `*set check_stat "wis"` / `*set save_vs "charmed"` / `*gosub_scene startup roll_d20_check`, and an Elf automatically gets advantage without the scene needing to know or care that Elves have Fey Ancestry.

**MECHANICAL — Relentless Endurance (Half-Orc):** wired into `battle_take_damage` in `battle_black_sinks.txt`. When an attack would reduce the player to 0 HP, a Half-Orc's savage tenacity triggers specifically, keeping them on their feet at 1 HP with custom orcish flavor.

**MECHANICAL — Innate Magic in Scenes:** 
- **Thaumaturgy (Tiefling):** Active option in `camp_night.txt`'s gambling tent for a specialized DC 10 Charisma Intimidation check with brimstone eyes and booming voice.
- **Hex (Hexblood / Warlock):** Active combat choice in `battle_black_sinks.txt`'s gatehouse melee to curse the lead defender (DC 12 Charisma check).

---

## Class Spellcasting

Only three of the seven classes have any spellcasting at level 1 — this matches real 5e entitlement (Fighter/Barbarian/Rogue never get spells this early; Ranger doesn't get spells until level 2, so it correctly has none yet).

| Class | Hit Die | Cantrips Known | Spells Known | Slots |
|---|---|---|---|---|
| Fighter | 1d10 | 0 | 0 | 0 |
| Barbarian | 1d12 | 0 | 0 | 0 |
| Rogue | 1d8 | 0 | 0 | 0 |
| Ranger | 1d10 | 0 | 0 | 0 (correctly starts at level 2 in RAW — not implemented, not a bug) |
| Bard | 1d8 | 2 (from a pool of 5) | 2 (from a pool of 4–5*) | 2, long rest |
| Warlock | 1d8 | 2 (from a pool of 4) | 1 (from a pool of 4–5*) | 1, **short rest** (Pact Magic) |
| Wizard | 1d6 | 3 (from a pool of 8) | 1 (from a pool of 7, always) | 2, long rest |

\* **Bard's** and **Warlock's** spell pools shrink by one option for a Hexblood character, since Disguise Self (Bard) and Hex (Warlock) are hidden — the character already has them innately from `race_cantrip`/`race_cantrip_2`, so offering them again as a "new" class spell would be redundant. Dissonant Whispers (Bard) and Armor of Agathys / False Life (Warlock) keep the pool robust for Hexblood characters. Wizard's spell pool never overlaps with Hexblood's innate magic, so it's unaffected. See the `*if (not(race = "hexblood"))` guards in `dawn_trial.txt`.

### Bard
- **Cantrip pool** (`bard_cantrip`, `bard_cantrip_2` — pick 2, second pick excludes the first): `vicious_mockery`, `minor_illusion`, `message`, `blade_ward`, `mage_hand`, `mending`
- **`blade_ward` (Blade Ward) is a HOUSE RULE, not RAW.** RAW's Blade Ward costs **1 action**; here it costs the **bonus action**, so it competes with Hex for `combat_player_bonus_max 1` (one bonus action per turn, already enforced by the engine). It is a cantrip, so it costs **no spell slot**. It gives resistance to bludgeoning, piercing and slashing from weapon attacks **until the end of your next turn** — implemented with `blade_ward_active` + `blade_ward_survived_a_turn` and aged by `blade_ward_tick` (`combat.txt`), which is called from exactly one place, `fight_end_player_turn`, because `combat_next_turn` recurses once per combatant. Re-casting is allowed (it refreshes the duration), and a turn lost to a stun still counts as a turn. Available to warlocks, wizards and bards.
- **Spell pool** (`bard_spell`, `bard_spell_2` — pick 2, second excludes the first): `charm_person`, `healing_word`, `disguise_self` (hidden for Hexblood), `comprehend_languages`, `dissonant_whispers`, `bane` (2026-09-27 — up to three targets, Charisma save vs `spell_save_dc`, -1d4 to a failed target's attack rolls and saving throws for 10 rounds; see `resolve_cast_bane`, startup.txt)
- Framing: these are **not** newly discovered — the narration explicitly frames them as a lifelong knack the character always suspected was more than charm, finally admitted to under stress. Don't write future Bard content as "wow, I have magic now."

### Warlock
- **Patron** (`warlock_patron`): `archfey`, `fiend`, or `great_old_one` — flavor/identity only, doesn't gate anything else currently.
- **Cantrip pool** (`warlock_cantrip`, `warlock_cantrip_2` — pick 2, second excludes the first): `eldritch_blast`, `minor_illusion`, `chill_touch`, `blade_ward`, `prestidigitation`
- **Spell pool** (`warlock_spell`): `hex` (hidden for Hexblood), `comprehend_languages`, `unseen_servant`, `armor_of_agathys`, `false_life`
- Framing: this **is** meant to read as sudden and new — a pact is a discrete origin event in 5e fiction, so "wow, I have powers now" is the correct tone here, unlike Bard/Wizard.

### Wizard
- **Cantrip pool** (`wizard_cantrip`, `wizard_cantrip_2`, `wizard_cantrip_3` — pick 3, each pick excludes prior picks): `fire_bolt`, `ray_of_frost`, `shocking_grasp`, `blade_ward`, `mage_hand`, `guidance`, `mending`, `light`, `prestidigitation`
- **Spell pool** (`wizard_spell`): `identify`, `feather_fall`, `comprehend_languages`, `mage_armor`, `shield`, `magic_missile`, `false_life`
- Framing: same as Bard — these are years of secret, hidden practice (afraid of the scandal it'd cause if a lord's heir was caught dabbling in real theory), only just being admitted to under pressure, not invented on the spot.

**MECHANICAL — Mage Armor:** wired into the AC formula in `update_dnd_stats` (`startup.txt`). RAW is 13 + DEX while not wearing armor; implemented as `*if ((armor_type = "cloth") and (wizard_spell = "mage_armor")) *set base_ac 13` — "cloth" (traveling robes, scholar robes, the Gilt Needle's Court Coat) is ordinary clothing in this game's armor model, already using the same `10 + DEX` baseline as true unarmored, so it's the correct condition rather than gating on class alone. A Wizard who instead picked real armor at muster doesn't get the bonus, matching RAW (Mage Armor doesn't apply over actual armor).

**MECHANICAL — Shield:** wired into `battle_black_sinks.txt` before the gatehouse melee (`beat_gatehouse`), providing an emergency reactive barrier that deflects skittering missiles and grants advantage on the approach.

**MECHANICAL — Magic Missile:** wired into `battle_black_sinks.txt` for both the Cadre causeway crossing (`beat_crossing_cadre`) and gatehouse melee (`beat_gatehouse_fight`), providing guaranteed automatic success (no d20 roll needed) to eliminate parapet archers or suppress defenders in the breach.

**MECHANICAL — Shocking Grasp:** wired into `battle_black_sinks.txt` gatehouse melee (`beat_gatehouse_fight`), providing a close-quarters lightning attack with Advantage against metal-armored/chain-wielding defenders.

**MECHANICAL — False Life:** wired into `battle_black_sinks.txt` pre-battle preparations, allowing Warlocks and Wizards to bolster their flesh with +5 temporary Hit Points (`hp_current + 5`).

**MECHANICAL — Mending:** wired into `battle_black_sinks.txt` bivouac companion interactions (`bivouac_companion_vanguard` to mend Lyra's torn armor seam for bonus regard) and gatehouse search (`bivouac_search` to automatically restore the water-damaged toll ledger).

---

## Martial Class Features (Fighter, Barbarian, Rogue, Ranger)

None of these four classes are spellcasters, but they still have real level-1 class features in 5e. Same rule as everything else in this doc: tagged with a flavor description now, and only "wired in" (actually affecting a formula) where it hooks into something that already exists.

| Class | Feature | Tagged? | Wired In? |
|---|---|---|---|
| Fighter | Fighting Style (player picks one: Defense, Dueling, Great Weapon Fighting, Protection) | `fighter_fighting_style` (chosen during `dawn_trial.txt`) | **Yes / Active** — chosen at dawn trial. `"defense"` gives +1 AC immediately in `update_dnd_stats`. All four styles also gate a dedicated, style-specific melee option (DC 12 STR) in `battle_black_sinks.txt`'s `beat_gatehouse_fight` — Fighter previously had zero class-specific combat choices there, unlike every other class. |
| Fighter | Second Wind | `fighter_second_wind_uses` (max `fighter_second_wind_max`: 2 at level 1) | **Yes** — `*label second_wind` in `startup.txt` is a real, callable subroutine: restores `1d10 + character_level` HP (capped at `hp_max`) and consumes a use. Wired into `battle_black_sinks.txt` before the gatehouse melee. |
| Barbarian | Rage | `barbarian_rage_uses` (max `barbarian_rage_max`: 2 at level 1), `is_raging`, `barbarian_rage_damage_bonus` (2) | **Partially** — `*label activate_rage` / `*label end_rage` in `startup.txt` toggle `is_raging` and spend a use. Wired into `battle_black_sinks.txt` for pre-battle activation and gatehouse frenzy. |
| Barbarian | Unarmored Defense | `class_feature_2_title`/`_desc` | No — and it's currently **unreachable**: Ashbrook-origin characters always pick real armor at muster, so "unarmored" never actually applies under the current gear flow. Flavor text says as much. |
| Rogue | Sneak Attack | `rogue_sneak_attack_die` ("1d6") | No — static flag only. No attack-with-advantage system exists to trigger it. |
| Rogue | Expertise (Stealth & Thieves' Tools) | `rogue_expertise_1` ("Stealth"), `rogue_expertise_2` ("Thieves' Tools") | **Yes** — `roll_d20_check` adds `prof_bonus * 2` (+4) to `check_mod` if `check_skill` matches either chosen skill *and* `character_class = "rogue"`. Active in `dawn_trial.txt`. |
| Ranger | Favored Enemy (player picks a creature type) | `ranger_favored_enemy`, default `"none"` | No — the advantage/disadvantage engine now exists (see below), so once this is chosen, wiring it in is just a `*set save_vs`-style tag away. What's still missing is a creature-type context on checks — a future tracking/recall scene would need to set something like `*set check_context "goblin"` before the check so the engine knows what's being tracked. |
| Ranger | Natural Explorer (player picks a terrain) | `ranger_favored_terrain`, default `"none"` | No — same shape as above; needs a terrain-context tag on checks, not an advantage mechanic (that part's solved). |

---

## Actions and Bonus Actions in a Fight

The player has one action and one bonus action each round, and each round refills them (`combat.txt` `combat_begin_round`; the rule is written up in quest/GAMEPLAY_MECHANICS_RULES.md section 6). **Bonus actions:** Second Wind, Rage, Hex and Healing Word. Using one keeps you in the same round with your action still to come, and a second bonus option is not offered until the next round. **Actions:** an attack, a damage spell or cantrip, Armor of Agathys, False Life, Brace, and using an item; the enemies answer once your action is spent. **Shield** is a reaction (an armed flag), not a budget. The limits are variables (`combat_player_actions_max`, `combat_player_bonus_max`), so an effect such as Haste or a feature that grants an extra bonus action only has to change a number for the length of the fight.

---

## Class Resource Maximums and Rests

Every class pool has a `_max` variable, set in one place: `refresh_class_resource_maxs` in `startup.txt`, which `update_dnd_stats` calls, so the maximum follows `character_level`. No scene types a pool number. Levels not listed keep the value above them.

| Pool | Level 1 | Steps up |
|---|---|---|
| Second Wind (Fighter, 2024 rules) | 2 | 3 at level 4, 4 at level 10 |
| Rage (Barbarian) | 2 | 3 at level 3, 4 at 6, 5 at 12, 6 at 17 |
| Pact Magic slots (Warlock) | 1 | 2 at level 2, 3 at 11, 4 at 17 |
| First-level slots (Wizard, Bard) | 2 | 3 at level 2, 4 at level 3 |

Wizard and Bard second-level slots (from level 3) and the Warlock's rising slot level are not built: nothing in the game is a second-level spell yet. When they are, each is a new pool added in the same few places (see quest/GAMEPLAY_MECHANICS_RULES.md section 1, *Class Resources Live in One Place*), and no scene that sleeps changes.

**Long rest.** One routine, `restore_class_resources`, refills every pool to its maximum, clears temp HP and readies the Hexblood's Hex. Hit points are not touched (healing stays slow). Every sleeping place calls `calendar.txt` `resolve_sleep`, which calls it, and the prologue rests call it directly.

## Short Rest

**Show Stats → Rest** and the **Rest card pinned at the top of the Inventory** open the dossier's Rest menu (`choicescript_stats.txt` `codex_rest`). A short rest takes one hour of the clock (`advance_time`, so it burns hunger and fatigue like any other hour) and gives back what a short rest gives back: a **Fighter regains one Second Wind use** (2024 rules; a long rest gives them all back) and a **Warlock's Pact Magic slots all come back** (`startup.txt` `short_rest_preview` reports it, `do_short_rest` applies it, guarded by `last_short_rest_stamp` so a replayed page cannot give twice). It does **not** heal: healing stays slow. Rage, Bard slots and Wizard slots come back with sleep. It is refused in a fight, and at 2 HP or less while Starving or Collapsing (an hour can tick a hunger or fatigue point off HP, and a death cannot be handled from inside the dossier). The Middle Ward garret's own one-hour rest (`mw_room_short_rest`) calls `do_short_rest` too and prints `short_rest_banner`, so a new short-rest give-back never touches the garret.

---

## Guidance Cantrip Engine

`guidance_active` allows any scene or choice where you cast *Guidance* before a check to trigger an active `+1d4` roll.
- Setting `*set guidance_active true` right before `*gosub_scene startup roll_d20_check` automatically rolls `1d4`, adds it to `check_total`, displays `+X (Guidance)` in the check banner, and auto-resets `guidance_active false` upon return (matching the lifecycle of `advantage` and `disadvantage`).

---

## Quick variable index

| Concept | Variables |
|---|---|
| Advantage / Disadvantage / Guidance engine | `advantage`, `disadvantage`, `guidance_active`, `save_vs` (set right before `*gosub_scene startup roll_d20_check` — all auto-reset after) |
| Race identity | `race`, `race_title`, `race_desc`, `race_darkvision` |
| Racial trait | `race_trait_title`, `race_trait_desc` |
| Racial innate magic | `race_cantrip`, `race_cantrip_desc`, `race_cantrip_2`, `race_cantrip_2_desc` |
| Class identity | `character_class`, `class_title`, `class_assigned`, `hit_die`, `hit_die_max` |
| Generic class feature (auto-granted) | `class_feature_title`, `class_feature_desc`, `class_feature_2_title`, `class_feature_2_desc` |
| Fighter | `fighter_fighting_style`, `fighter_second_wind_uses`, `fighter_second_wind_max`, `second_wind` (subroutine, `startup.txt`) |
| Barbarian | `barbarian_rage_uses`, `barbarian_rage_max`, `barbarian_rage_damage_bonus`, `is_raging`, `activate_rage`/`end_rage` (subroutines, `startup.txt`) |
| Rogue | `rogue_expertise_1`, `rogue_expertise_2`, `rogue_sneak_attack_die` |
| Ranger | `ranger_favored_enemy`, `ranger_favored_terrain` |
| Warlock | `warlock_patron`, `warlock_patron_title`, `warlock_patron_desc`, `warlock_cantrip(_2)`, `warlock_cantrip(_2)_desc`, `warlock_spell`, `warlock_spell_desc`, `warlock_spell_slots`, `warlock_spell_slots_max` |
| Wizard | `wizard_cantrip(_2/_3)`, `wizard_cantrip(_2/_3)_desc`, `wizard_spell`, `wizard_spell_desc`, `wizard_spell_slots`, `wizard_spell_slots_max` |
| Bard | `bard_cantrip(_2)`, `bard_cantrip(_2)_desc`, `bard_spell(_2)`, `bard_spell(_2)_desc`, `bard_spell_slots`, `bard_spell_slots_max` |

All of these are `*create`d in `startup.txt` and set during `dawn_trial.txt` (class/magic) or `startup.txt`'s `choose_race` label (racial magic). Full dossier display (racial magic, patron, cantrips, spells) lives in `choicescript_stats.txt`'s Soldier Profile block and in `dawn_trial.txt`'s `trial_converge` summary. `camp_night.txt`'s `night_end` dossier only shows racial magic — class magic isn't known yet at that point in the story, since `dawn_trial` hasn't run.
