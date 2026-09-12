# Magic & Abilities Reference — The Carrion Company

A developer reference for every racial trait, innate magic, class cantrip, and class spell currently implemented, plus exactly which ones do something mechanical versus which are flavor-only. Keep this updated whenever a new race/class option, cantrip, or spell is added.

---

## How the system works

- Nothing here uses a real spell-slot economy, prepared-spell tracking, or damage resolution. Every cantrip/spell is a **string flag + a flavor description**, the same pattern used for `class_title`/`race_trait_title` elsewhere.
- "Slots" (`warlock_spell_slots`, `wizard_spell_slots`, `bard_spell_slots`) are tracked as numbers but **not currently decremented or checked anywhere** — they exist so a future "cast your spell" scene has something to reference, not because resource management is live today.
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
| Bard | 1d8 | 2 (from a pool of 4) | 2 (from a pool of 4–5*) | 2, long rest |
| Warlock | 1d8 | 2 (from a pool of 4) | 1 (from a pool of 3–4*) | 1, **short rest** (Pact Magic) |
| Wizard | 1d6 | 3 (from a pool of 6) | 1 (from a pool of 3, always) | 2, long rest |

\* **Bard's** and **Warlock's** spell pools shrink by one option for a Hexblood character, since Disguise Self (Bard) and Hex (Warlock) are hidden — the character already has them innately from `race_cantrip`/`race_cantrip_2`, so offering them again as a "new" class spell would be redundant. Dissonant Whispers (Bard) and Armor of Agathys (Warlock) exist specifically to keep the pool at 3+ genuine options for Hexblood even after that exclusion — see narrative_guidelines.md §5 (Three Is the Standard). Wizard's spell pool (Identify / Feather Fall / Comprehend Languages) never overlaps with Hexblood's innate magic, so it's unaffected. See the `*if (not(race = "hexblood"))` guards in `dawn_trial.txt`.

### Bard
- **Cantrip pool** (`bard_cantrip`, `bard_cantrip_2` — pick 2, second pick excludes the first): `vicious_mockery`, `minor_illusion`, `message`, `mage_hand`
- **Spell pool** (`bard_spell`, `bard_spell_2` — pick 2, second excludes the first): `charm_person`, `healing_word`, `disguise_self` (hidden for Hexblood), `comprehend_languages`, `dissonant_whispers`
- Framing: these are **not** newly discovered — the narration explicitly frames them as a lifelong knack the character always suspected was more than charm, finally admitted to under stress. Don't write future Bard content as "wow, I have magic now."

### Warlock
- **Patron** (`warlock_patron`): `archfey`, `fiend`, or `great_old_one` — flavor/identity only, doesn't gate anything else currently.
- **Cantrip pool** (`warlock_cantrip`, `warlock_cantrip_2` — pick 2, second excludes the first): `eldritch_blast`, `minor_illusion`, `chill_touch`, `prestidigitation`
- **Spell pool** (`warlock_spell`): `hex` (hidden for Hexblood), `comprehend_languages`, `unseen_servant`, `armor_of_agathys`
- Framing: this **is** meant to read as sudden and new — a pact is a discrete origin event in 5e fiction, so "wow, I have powers now" is the correct tone here, unlike Bard/Wizard.

### Wizard
- **Cantrip pool** (`wizard_cantrip`, `wizard_cantrip_2`, `wizard_cantrip_3` — pick 3, each pick excludes prior picks): `fire_bolt`, `ray_of_frost`, `mage_hand`, `guidance`, `light`, `prestidigitation`
- **Spell pool** (`wizard_spell`): `identify`, `feather_fall`, `comprehend_languages`
- Framing: same as Bard — these are years of secret, hidden practice (afraid of the scandal it'd cause if a lord's heir was caught dabbling in real theory), only just being admitted to under pressure, not invented on the spot.

---

## Martial Class Features (Fighter, Barbarian, Rogue, Ranger)

None of these four classes are spellcasters, but they still have real level-1 class features in 5e. Same rule as everything else in this doc: tagged with a flavor description now, and only "wired in" (actually affecting a formula) where it hooks into something that already exists.

| Class | Feature | Tagged? | Wired In? |
|---|---|---|---|
| Fighter | Fighting Style (player picks one: Defense, Dueling, Great Weapon Fighting, Protection) | `fighter_fighting_style` (chosen during `dawn_trial.txt`) | **Yes / Active** — chosen at dawn trial. `"defense"` gives +1 AC immediately in `update_dnd_stats`. All four styles also gate a dedicated, style-specific melee option (DC 12 STR) in `battle_black_sinks.txt`'s `beat_gatehouse_fight` — Fighter previously had zero class-specific combat choices there, unlike every other class. |
| Fighter | Second Wind | `fighter_second_wind_uses` (starts at 1) | **Yes** — `*label second_wind` in `startup.txt` is a real, callable subroutine: restores `1d10 + character_level` HP (capped at `hp_max`) and consumes a use. Wired into `battle_black_sinks.txt` before the gatehouse melee. |
| Barbarian | Rage | `barbarian_rage_uses` (starts at 2), `is_raging`, `barbarian_rage_damage_bonus` (2) | **Partially** — `*label activate_rage` / `*label end_rage` in `startup.txt` toggle `is_raging` and spend a use. Wired into `battle_black_sinks.txt` for pre-battle activation and gatehouse frenzy. |
| Barbarian | Unarmored Defense | `class_feature_2_title`/`_desc` | No — and it's currently **unreachable**: Ashbrook-origin characters always pick real armor at muster, so "unarmored" never actually applies under the current gear flow. Flavor text says as much. |
| Rogue | Sneak Attack | `rogue_sneak_attack_die` ("1d6") | No — static flag only. No attack-with-advantage system exists to trigger it. |
| Rogue | Expertise (Stealth & Thieves' Tools) | `rogue_expertise_1` ("Stealth"), `rogue_expertise_2` ("Thieves' Tools") | **Yes** — `roll_d20_check` adds `prof_bonus * 2` (+4) to `check_mod` if `check_skill` matches either chosen skill *and* `character_class = "rogue"`. Active in `dawn_trial.txt`. |
| Ranger | Favored Enemy (player picks a creature type) | `ranger_favored_enemy`, default `"none"` | No — the advantage/disadvantage engine now exists (see below), so once this is chosen, wiring it in is just a `*set save_vs`-style tag away. What's still missing is a creature-type context on checks — a future tracking/recall scene would need to set something like `*set check_context "goblin"` before the check so the engine knows what's being tracked. |
| Ranger | Natural Explorer (player picks a terrain) | `ranger_favored_terrain`, default `"none"` | No — same shape as above; needs a terrain-context tag on checks, not an advantage mechanic (that part's solved). |

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
| Fighter | `fighter_fighting_style`, `fighter_second_wind_uses`, `second_wind` (subroutine, `startup.txt`) |
| Barbarian | `barbarian_rage_uses`, `barbarian_rage_damage_bonus`, `is_raging`, `activate_rage`/`end_rage` (subroutines, `startup.txt`) |
| Rogue | `rogue_expertise_1`, `rogue_expertise_2`, `rogue_sneak_attack_die` |
| Ranger | `ranger_favored_enemy`, `ranger_favored_terrain` |
| Warlock | `warlock_patron`, `warlock_patron_title`, `warlock_patron_desc`, `warlock_cantrip(_2)`, `warlock_cantrip(_2)_desc`, `warlock_spell`, `warlock_spell_desc`, `warlock_spell_slots` |
| Wizard | `wizard_cantrip(_2/_3)`, `wizard_cantrip(_2/_3)_desc`, `wizard_spell`, `wizard_spell_desc`, `wizard_spell_slots` |
| Bard | `bard_cantrip(_2)`, `bard_cantrip(_2)_desc`, `bard_spell(_2)`, `bard_spell(_2)_desc`, `bard_spell_slots` |

All of these are `*create`d in `startup.txt` and set during `dawn_trial.txt` (class/magic) or `startup.txt`'s `choose_race` label (racial magic). Full dossier display (racial magic, patron, cantrips, spells) lives in `choicescript_stats.txt`'s Soldier Profile block and in `dawn_trial.txt`'s `trial_converge` summary. `camp_night.txt`'s `night_end` dossier only shows racial magic — class magic isn't known yet at that point in the story, since `dawn_trial` hasn't run.
