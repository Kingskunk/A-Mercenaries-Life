# Full 5E Combat Engine Spell & Cantrip Integration Plan (Refined & Watertight)

## Overview
Currently, the small-combat engine implemented in [`alderford.txt`](file:///c:/Users/Kwesey/Desktop/choicescript-main/web/mygame/scenes/alderford.txt) and [`startup.txt`](file:///c:/Users/Kwesey/Desktop/choicescript-main/web/mygame/scenes/startup.txt) supports martial classes (Fighter *Second Wind*, Barbarian *Rage*, Rogue *Sneak Attack*) and Wizard combat spells (*Magic Missile*, *Shield*, *Mage Armor*, damage cantrips). However, **Warlock** leveled spells (*Hex*, *Armor of Agathys*, *False Life*), **Bard** combat spells (*Dissonant Whispers*, *Healing Word*), **Hexblood** innate magic, and the **Chill Touch** cantrip are not yet connected. Furthermore, the existing cantrip detection uses a single generic fire template that violates Rule 2 and suppresses secondary cantrips.

This plan resolves every state, narrative, and mechanical gap, providing full D&D 5E fidelity, refresh/replay safety (Rule 13), bespoke narrative descriptions for all spells/cantrips (Rule 2), and strict ChoiceScript boolean syntax.

---

## User Review Required & Key Architecture Decisions

> [!IMPORTANT]
> 1. **Unified Temporary Hit Point System (`temp_hp` & `locked_temp_hp_gain`):**
>    - Add `*create temp_hp 0` and `*create locked_temp_hp_gain 0` to [`startup.txt`](file:///c:/Users/Kwesey/Desktop/choicescript-main/web/mygame/scenes/startup.txt).
>    - *False Life* and *Armor of Agathys* grant `temp_hp` instead of overflowing `hp_current`. This prevents temporary hit points from being wiped by `update_dnd_stats` HP clamping (`hp_current <= hp_max`).
>    - In `resolve_enemy_attack`, incoming damage is absorbed by `temp_hp` first; any excess overflows into `hp_current`.
>    - `choicescript_stats.txt` is updated to conditionally display `(+${temp_hp} Temp HP)` when `temp_hp > 0`.
>
> 2. **Armor of Agathys Engine Flags & Retaliatory Kill Check:**
>    - Add `combat_agathys_triggered` and `combat_agathys_shattered` flags to [`startup.txt`](file:///c:/Users/Kwesey/Desktop/choicescript-main/web/mygame/scenes/startup.txt).
>    - On an enemy hit, if `agathys_active` is true and `temp_hp > 0`, 5 cold damage is dealt back to `combat_enemy_hp` and `combat_agathys_triggered` is set to `true`.
>    - If `temp_hp` drops to 0, `combat_agathys_shattered` is set to `true` and `agathys_active` is disarmed.
>    - In `culvert_enemy_turn`, narrative prose branches on `combat_agathys_triggered` and `combat_agathys_shattered`, allowing accurate text whether the rime holds or shatters.
>    - An explicit death check (`*if (combat_enemy_hp <= 0) *goto culvert_victory`) is placed immediately after `resolve_enemy_attack` so retaliatory kills end combat cleanly.
>
> 3. **Hex Curse Integration & Innate Racial Priority:**
>    - Hex bonus damage (+1d6 necrotic) is handled directly inside `startup.txt`'s `resolve_player_hit` subroutine under `combat_player_hit_locked`.
>    - This automatically applies to all weapon strikes and attack cantrips without consuming `stat_bump2_locked`, preventing lock collisions with Rogue *Sneak Attack*.
>    - When casting Hex, innate Hexblood racial casts (`race_cantrip_2 = "hex"`) are prioritized and consumed first (`hexblood_hex_used true`) before deducting `warlock_spell_slots`, preventing slot underflow bugs on multi-class / innate characters.
>    - As a 5E Bonus Action, casting Hex in combat sets `hex_active true` and returns immediately to `culvert_combat_round_hub` so the player can attack on that same turn.
>
> 4. **Bespoke Cantrip Architecture (Rule 2 Compliance & Full Slot Coverage):**
>    - Remove the generic `has_attack_cantrip` fire-only template.
>    - Replace with dedicated `# [Cantrip: ...]` choice options for every attack cantrip learned (*Fire Bolt*, *Ray of Frost*, *Shocking Grasp*, *Eldritch Blast*, *Chill Touch*, *Vicious Mockery*).
>    - Multi-slot checks cover all slot variables (`wizard_cantrip`, `wizard_cantrip_2`, `wizard_cantrip_3`, `warlock_cantrip`, `warlock_cantrip_2`, `bard_cantrip`, `bard_cantrip_2`, `race_cantrip`, `race_cantrip_2`).
>    - Each cantrip features distinct sensory prose, correct damage types, and mechanical riders (*Vicious Mockery* applies `combat_enemy_disadvantage true`, *Ray of Frost* chills and slows, *Chill Touch* channels spectral frost).
>
> 5. **Replay-Guarded Slot Deductions, Damage Locks & Rest Resets:**
>    - All spell slot deductions are guarded by `stat_bump2_locked` and `choice_page_id`.
>    - *Healing Word* uses pre-declared global `locked_heal_roll` to eliminate `*temp` runtime crashes on replay.
>    - *Dissonant Whispers* guards its 3d6 damage roll and enemy HP deduction with `combat_player_hit_locked` so page refreshes never multi-apply damage.
>    - `hexblood_hex_used false` is added to long rest resets in both `alderford.txt` and `battle_black_sinks.txt`.
>    - Ephemeral combat variables (`hex_active`, `agathys_active`, `shield_armed`, `temp_hp`, `combat_agathys_triggered`, `combat_agathys_shattered`) are reset at combat start and upon all exits (victory, rescue, flee).

---

## Proposed Changes

### 1. Core Engine & Global State (`startup.txt`)

#### [MODIFY] [`startup.txt`](file:///c:/Users/Kwesey/Desktop/choicescript-main/web/mygame/scenes/startup.txt)

1. **Global Variable Initializations:**
```choicescript
*comment --- COMBAT SPELLS & TEMPORARY HP STATE ---
*create temp_hp 0
*create locked_temp_hp_gain 0
*create hex_active false
*create agathys_active false
*create hexblood_hex_used false
*create combat_agathys_triggered false
*create combat_agathys_shattered false
```

2. **Update `resolve_player_hit` (Integrate Hex Damage):**
```choicescript
*label resolve_player_hit
*if ((not(combat_player_hit_locked)) or (not(locked_combat_player_hit_page_id = choice_page_id)))
  *temp cph_roll 0
  *rand cph_roll 1 combat_player_dmg_dice_sides
  *set combat_player_dmg_dealt (cph_roll + combat_player_dmg_bonus)
  *if (hex_active)
    *temp hex_dmg 0
    *rand hex_dmg 1 6
    *set combat_player_dmg_dealt + hex_dmg
  *set combat_enemy_hp - combat_player_dmg_dealt
  *if (combat_enemy_hp < 0)
    *set combat_enemy_hp 0
  *set combat_player_hit_locked true
  *set locked_combat_player_hit_page_id choice_page_id
*return
```

3. **Update `resolve_enemy_attack` (Temp HP Absorption, Armor of Agathys Retaliation & Engine Flags):**
```choicescript
*label resolve_enemy_attack
*if ((not(combat_enemy_atk_locked)) or (not(locked_combat_enemy_atk_page_id = choice_page_id)))
  *temp cea_roll 0
  *rand cea_roll 1 20
  *if ((combat_enemy_disadvantage) and (not(combat_enemy_advantage)))
    *temp cea_roll_2 0
    *rand cea_roll_2 1 20
    *if (cea_roll_2 < cea_roll)
      *set cea_roll cea_roll_2
  *if ((combat_enemy_advantage) and (not(combat_enemy_disadvantage)))
    *temp cea_roll_2 0
    *rand cea_roll_2 1 20
    *if (cea_roll_2 > cea_roll)
      *set cea_roll cea_roll_2
  *set combat_enemy_advantage false
  *set combat_enemy_atk_total (cea_roll + combat_enemy_atk_bonus)
  *set combat_enemy_hit_success (combat_enemy_atk_total >= armor_class)
  *set combat_shield_triggered false
  *set combat_agathys_triggered false
  *set combat_agathys_shattered false

  *if ((combat_enemy_hit_success) and (shield_armed))
    *set shield_armed false
    *set wizard_spell_slots - 1
    *set combat_shield_triggered true
    *set combat_enemy_hit_success (combat_enemy_atk_total >= (armor_class + 5))

  *set combat_enemy_dmg_dealt 0
  *if (combat_enemy_hit_success)
    *temp cea_dmg 0
    *rand cea_dmg 1 combat_enemy_dmg_dice_sides
    *set cea_dmg (cea_dmg + combat_enemy_dmg_bonus)
    *if ((character_class = "barbarian") and (is_raging))
      *set cea_dmg cea_dmg / 2
    *set combat_enemy_dmg_dealt cea_dmg
    
    *comment Handle Armor of Agathys retaliatory cold damage
    *if ((agathys_active) and (temp_hp > 0))
      *set combat_agathys_triggered true
      *set combat_enemy_hp - 5
      *if (combat_enemy_hp < 0)
        *set combat_enemy_hp 0

    *comment Handle Temp HP absorption before deducting hp_current
    *if (temp_hp > 0)
      *if (temp_hp >= cea_dmg)
        *set temp_hp - cea_dmg
      *else
        *temp excess_dmg (cea_dmg - temp_hp)
        *set temp_hp 0
        *set hp_current - excess_dmg
    *else
      *set hp_current - combat_enemy_dmg_dealt

    *if (temp_hp = 0)
      *if (agathys_active)
        *set combat_agathys_shattered true
      *set agathys_active false

    *if (hp_current < 1)
      *set hp_current 1

  *set combat_enemy_atk_locked true
  *set locked_combat_enemy_atk_page_id choice_page_id
*return
```

---

### 2. Culvert Combat Engine (`alderford.txt`)

#### [MODIFY] [`alderford.txt`](file:///c:/Users/Kwesey/Desktop/choicescript-main/web/mygame/scenes/alderford.txt)

1. **Combat Start State Resets (`*label culvert_breach_start`):**
```choicescript
*set hex_active false
*set agathys_active false
*set shield_armed false
*set temp_hp 0
*set combat_agathys_triggered false
*set combat_agathys_shattered false
```

2. **Round Hub Status Banner & Bespoke Cantrips/Spells (`*label culvert_combat_round_hub`):**

```choicescript
*label culvert_combat_round_hub
*set combat_enemy_disadvantage false

[b][⚔️ Round ${combat_round} — ${combat_enemy_name}: HP ${combat_enemy_hp}/${combat_enemy_max_hp} (AC ${combat_enemy_ac}) | You: HP ${hp_current}/${hp_max}@{(temp_hp > 0)  (+${temp_hp} Temp HP)|} (AC ${armor_class})][/b]
*if (shield_armed)
  [b][✨ Shield Armed — will trigger on next hit][/b]
*if (hex_active)
  [b][🔮 Hex Active — +1d6 Necrotic Damage on all hits][/b]
*if (agathys_active)
  [b][❄️ Armor of Agathys Active — +${temp_hp} Temp HP | 5 Cold Damage Retaliation][/b]

*choice
  # Attack with your ${weapon}.
    *if (weapon_type = "ranged")
      *set check_stat "dex"
    *else
      *if (weapon_type = "finesse")
        *if (str_mod > dex_mod)
          *set check_stat "str"
        *else
          *set check_stat "dex"
      *else
        *set check_stat "str"
    *temp attack_had_advantage advantage
    *set check_dc combat_enemy_ac
    *set check_skill "Melee Attack"
    *gosub_scene startup roll_d20_check
    *if (check_success)
      *if (weapon_type = "finesse")
        *set combat_player_dmg_dice_sides 4
        *if (str_mod > dex_mod)
          *set combat_player_dmg_bonus str_mod
        *else
          *set combat_player_dmg_bonus dex_mod
      *else
        *if (weapon_type = "ranged")
          *set combat_player_dmg_dice_sides 6
          *set combat_player_dmg_bonus dex_mod
        *else
          *if (weapon_type = "two_handed")
            *set combat_player_dmg_dice_sides 12
            *set combat_player_dmg_bonus str_mod
          *else
            *set combat_player_dmg_dice_sides 8
            *set combat_player_dmg_bonus str_mod
      *gosub_scene startup resolve_player_hit
      *temp sneak_attack_landed false
      *if ((((character_class = "rogue") and ((weapon_type = "finesse") or (weapon_type = "ranged"))) and (attack_had_advantage)))
        *set sneak_attack_landed true
        *if ((not(stat_bump2_locked)) or (not(locked_stat_bump2_page_id = choice_page_id)))
          *temp sneak_die 0
          *rand sneak_die 1 6
          *set combat_enemy_hp - sneak_die
          *if (combat_enemy_hp < 0)
            *set combat_enemy_hp 0
          *set combat_player_dmg_dealt + sneak_die
          *set stat_bump2_locked true
          *set locked_stat_bump2_page_id choice_page_id
      *if (sneak_attack_landed)
        You strike from an opening it never saw coming, driving your ${weapon} into an exposed weak point for a vicious, precise finishing blow.
        [b][🗡️ Sneak Attack | 🩸 Hit: ${combat_player_dmg_dealt} damage][/b]
      *else
        You drive your ${weapon} home. It bites deep, and the creature recoils with a wet, furious hiss.
        [b][🩸 Hit: ${combat_player_dmg_dealt} damage][/b]
    *else
      Your ${weapon} scrapes off wet scale and old chitin, throwing you half a step off balance in the current.
      [b][💨 Miss][/b]
    *goto culvert_check_enemy_hp

  *if (((((wizard_cantrip = "fire_bolt") or (wizard_cantrip_2 = "fire_bolt")) or (wizard_cantrip_3 = "fire_bolt")) or (race_cantrip = "fire_bolt")) or (race_cantrip_2 = "fire_bolt"))
    # [Cantrip: Fire Bolt] Hurl a focused mote of arcane flame at the creature.
      *set check_stat "int"
      *set check_dc combat_enemy_ac
      *set check_skill "Fire Bolt"
      *gosub_scene startup roll_d20_check
      *if (check_success)
        *set combat_player_dmg_dice_sides 10
        *set combat_player_dmg_bonus 0
        *gosub_scene startup resolve_player_hit
        A blistering mote of fire snaps from your outstretched fingers, searing across waterlogged scales in a violent flare of orange light and hissing steam!
        [b][🔥 Fire Bolt: Hit | ${combat_player_dmg_dealt} Fire Damage][/b]
      *else
        The mote of fire zips wide into the black culvert water with a sharp sizzle.
        [b][💨 Miss][/b]
      *goto culvert_check_enemy_hp

  *if (((((wizard_cantrip = "ray_of_frost") or (wizard_cantrip_2 = "ray_of_frost")) or (wizard_cantrip_3 = "ray_of_frost")) or (race_cantrip = "ray_of_frost")) or (race_cantrip_2 = "ray_of_frost"))
    # [Cantrip: Ray of Frost] Project a beam of numbing, pale-blue frost into its flank.
      *set check_stat "int"
      *set check_dc combat_enemy_ac
      *set check_skill "Ray of Frost"
      *gosub_scene startup roll_d20_check
      *if (check_success)
        *set combat_player_dmg_dice_sides 8
        *set combat_player_dmg_bonus 0
        *gosub_scene startup resolve_player_hit
        A lance of crystalline frost strikes the beast's shoulder, rime crackling across wet skin and slowing its sluggish lunges in the freezing current.
        [b][❄️ Ray of Frost: Hit | ${combat_player_dmg_dealt} Cold Damage][/b]
      *else
        The pale ray splashes harmlessly against the dripping imperial brickwork.
        [b][💨 Miss][/b]
      *goto culvert_check_enemy_hp

  *if (((((wizard_cantrip = "shocking_grasp") or (wizard_cantrip_2 = "shocking_grasp")) or (wizard_cantrip_3 = "shocking_grasp")) or (race_cantrip = "shocking_grasp")) or (race_cantrip_2 = "shocking_grasp"))
    # [Cantrip: Shocking Grasp] Drive an arc of crackling lightning straight through the water into its hide.
      *set check_stat "int"
      *set check_dc combat_enemy_ac
      *set check_skill "Shocking Grasp"
      *gosub_scene startup roll_d20_check
      *if (check_success)
        *set combat_player_dmg_dice_sides 8
        *set combat_player_dmg_bonus 0
        *gosub_scene startup resolve_player_hit
        Blue-white electricity discharges from your palm through the flooded drain, violently convulsing the creature's limbs and locking its jaws mid-snarl!
        [b][⚡ Shocking Grasp: Hit | ${combat_player_dmg_dealt} Lightning Damage][/b]
      *else
        The creature twists beneath the current, letting the lightning dissipate into the silt.
        [b][💨 Miss][/b]
      *goto culvert_check_enemy_hp

  *if ((warlock_cantrip = "eldritch_blast") or (warlock_cantrip_2 = "eldritch_blast"))
    # [Cantrip: Eldritch Blast] Unleash a crackling beam of eldritch force from your outstretched hand.
      *set check_stat "cha"
      *set check_dc combat_enemy_ac
      *set check_skill "Eldritch Blast"
      *gosub_scene startup roll_d20_check
      *if (check_success)
        *set combat_player_dmg_dice_sides 10
        *set combat_player_dmg_bonus 0
        *gosub_scene startup resolve_player_hit
        A jagged streak of uncanny violet force slams into the creature's chest with the concussive boom of a shattered timber!
        [b][✨ Eldritch Blast: Hit | ${combat_player_dmg_dealt} Force Damage][/b]
      *else
        The eldritch beam tears a furrow through the silt and shatters against the far stone.
        [b][💨 Miss][/b]
      *goto culvert_check_enemy_hp

  *if ((warlock_cantrip = "chill_touch") or (warlock_cantrip_2 = "chill_touch"))
    # [Cantrip: Chill Touch] Conjure a skeletal hand of necrotic frost to clasp the creature's throat.
      *set check_stat "cha"
      *set check_dc combat_enemy_ac
      *set check_skill "Chill Touch"
      *gosub_scene startup roll_d20_check
      *if (check_success)
        *set combat_player_dmg_dice_sides 8
        *set combat_player_dmg_bonus 0
        *gosub_scene startup resolve_player_hit
        A ghostly, translucent skeletal hand materializes from the dark water, its icy grip wreathed in necrotic mist, sapping the vitality from the lacerated flesh!
        [b][💀 Chill Touch: Hit | ${combat_player_dmg_dealt} Necrotic Damage][/b]
      *else
        The spectral phantasm dissolves into harmless mist as the creature ducks beneath the flow.
        [b][💨 Miss][/b]
      *goto culvert_check_enemy_hp

  *if ((bard_cantrip = "vicious_mockery") or (bard_cantrip_2 = "vicious_mockery"))
    # [Cantrip: Vicious Mockery] Hurl a barbed, resonating insult layered with subtle enchantment to rattle its predatory instinct.
      *set check_stat "cha"
      *set check_dc 12
      *set check_skill "Vicious Mockery"
      *gosub_scene startup roll_d20_check
      *if (check_success)
        *set combat_player_dmg_dice_sides 4
        *set combat_player_dmg_bonus 0
        *gosub_scene startup resolve_player_hit
        *set combat_enemy_disadvantage true
        Your sharp, mocking cadence reverberates off the dripping brickwork, stinging the creature's mind with discordant psychic pain and throwing off its footing!
        [b][🎭 Vicious Mockery: Hit | ${combat_player_dmg_dealt} Psychic Damage | ⚠️ Target has Disadvantage on its next attack][/b]
      *else
        The creature's feral mind ignores the harmonic discord, fixing its gaze entirely on your throat.
        [b][💨 Resisted][/b]
      *goto culvert_check_enemy_hp

  *if ((((warlock_spell = "hex") and (warlock_spell_slots > 0)) or ((race_cantrip_2 = "hex") and (not(hexblood_hex_used)))) and (not(hex_active)))
    # [Spell: Hex] Lay a baleful eldritch curse upon the creature, marking it to suffer deeper wounds.
      *if ((not(stat_bump2_locked)) or (not(locked_stat_bump2_page_id = choice_page_id)))
        *if ((race_cantrip_2 = "hex") and (not(hexblood_hex_used)))
          *set hexblood_hex_used true
        *else
          *set warlock_spell_slots - 1
        *set hex_active true
        *set stat_bump2_locked true
        *set locked_stat_bump2_page_id choice_page_id
      You whisper a guttural syllable of ancient ruin. Dark, spectral runes flare briefly across the creature's waterlogged hide, tying its fate to your will—every strike you land will tear through it with extra necrotic fury!
      [b][🔮 Hex Active — +1d6 Necrotic Damage on all hits][/b]
      *goto culvert_combat_round_hub

  *if (((warlock_spell = "armor_of_agathys") and (warlock_spell_slots > 0)) and (not(agathys_active)))
    # [Spell: Armor of Agathys] Sheathe yourself in spectral frost that shields you and punishes melee strikes.
      *if ((not(stat_bump2_locked)) or (not(locked_stat_bump2_page_id = choice_page_id)))
        *set warlock_spell_slots - 1
        *set temp_hp 5
        *set agathys_active true
        *set stat_bump2_locked true
        *set locked_stat_bump2_page_id choice_page_id
      A brittle casing of translucent, jagged rime coats your leather harness and shoulders, radiating bone-chilling cold. Any creature foolish enough to strike you will feel the frost shatter against them.
      [b][🛡️ Armor of Agathys: +5 Temp HP | 5 Cold Damage Retaliation on Hits][/b]
      *goto culvert_enemy_turn

  *if (((((character_class = "wizard") and (wizard_spell = "false_life")) and (wizard_spell_slots > 0)) or (((character_class = "warlock") and (warlock_spell = "false_life")) and (warlock_spell_slots > 0))) and (temp_hp = 0))
    # [Spell: False Life] Weave a necromantic shroud over your flesh for a protective buffer of vitality.
      *if ((not(stat_bump2_locked)) or (not(locked_stat_bump2_page_id = choice_page_id)))
        *if (character_class = "wizard")
          *set wizard_spell_slots - 1
        *else
          *set warlock_spell_slots - 1
        *temp fl_roll 0
        *rand fl_roll 1 4
        *set locked_temp_hp_gain (fl_roll + 4)
        *set temp_hp locked_temp_hp_gain
        *set stat_bump2_locked true
        *set locked_stat_bump2_page_id choice_page_id
      You murmur a dark necromantic rite. A numb, leathery vitality spreads beneath your skin, insulating your muscles against immediate harm.
      [b][✨ False Life: +${locked_temp_hp_gain} Temporary Hit Points][/b]
      *goto culvert_enemy_turn

  *if (((bard_spell = "dissonant_whispers") or (bard_spell_2 = "dissonant_whispers")) and (bard_spell_slots > 0))
    # [Spell: Dissonant Whispers] Utter a hideous, discordant psychic phrase that wracks its mind.
      *if ((not(stat_bump2_locked)) or (not(locked_stat_bump2_page_id = choice_page_id)))
        *set bard_spell_slots - 1
        *set stat_bump2_locked true
        *set locked_stat_bump2_page_id choice_page_id
      *set check_stat "cha"
      *set check_dc 12
      *set check_skill "Dissonant Whispers"
      *gosub_scene startup roll_d20_check
      *if ((not(combat_player_hit_locked)) or (not(locked_combat_player_hit_page_id = choice_page_id)))
        *temp dw_d1 0
        *temp dw_d2 0
        *temp dw_d3 0
        *rand dw_d1 1 6
        *rand dw_d2 1 6
        *rand dw_d3 1 6
        *if (check_success)
          *set combat_player_dmg_dealt ((dw_d1 + dw_d2) + dw_d3)
        *else
          *set combat_player_dmg_dealt (((dw_d1 + dw_d2) + dw_d3) / 2)
        *set combat_enemy_hp - combat_player_dmg_dealt
        *if (combat_enemy_hp < 0)
          *set combat_enemy_hp 0
        *set combat_player_hit_locked true
        *set locked_combat_player_hit_page_id choice_page_id
      *if (check_success)
        You whisper a jarring, dissonant phrase into the shadows. The sound bypasses its ears and ruptures straight into its rotting brain—the beast screeches in agony, clawing wildly at its own skull!
        [b][🧠 Dissonant Whispers: Failed Save | ${combat_player_dmg_dealt} Psychic Damage][/b]
      *else
        The phrase reverberates through the drain, but the creature recoils just enough to weather the worst of the psychic assault.
        [b][🧠 Dissonant Whispers: Saved | Half Damage: ${combat_player_dmg_dealt} Psychic Damage][/b]
      *goto culvert_check_enemy_hp

  *if ((((bard_spell = "healing_word") or (bard_spell_2 = "healing_word")) and (bard_spell_slots > 0)) and (hp_current < hp_max))
    # [Spell: Healing Word] Speak a resonant, curative syllable to knit your gashes and steady your footing.
      *if ((not(stat_bump2_locked)) or (not(locked_stat_bump2_page_id = choice_page_id)))
        *set bard_spell_slots - 1
        *temp hw_roll 0
        *rand hw_roll 1 4
        *set locked_heal_roll (hw_roll + cha_mod)
        *if (locked_heal_roll < 1)
          *set locked_heal_roll 1
        *set hp_current + locked_heal_roll
        *if (hp_current > hp_max)
          *set hp_current hp_max
        *set stat_bump2_locked true
        *set locked_stat_bump2_page_id choice_page_id
      A sharp, ringing cadence leaves your lips, vibrating through the cold mist. Warmth rushes through your marrow, closing shallow claw-marks and banishing the chill.
      [b][🩸 Healing Word: Restored ${locked_heal_roll} HP | HP: ${hp_current}/${hp_max}][/b]
      *goto culvert_enemy_turn

  *if (((character_class = "wizard") and (wizard_spell = "magic_missile")) and (wizard_spell_slots > 0))
    # [Spell: Magic Missile] Unleash three darts of force that strike unerringly, bypassing its hide entirely.
      *if ((not(stat_bump2_locked)) or (not(locked_stat_bump2_page_id = choice_page_id)))
        *set wizard_spell_slots - 1
        *temp mm_dart_1 0
        *temp mm_dart_2 0
        *temp mm_dart_3 0
        *rand mm_dart_1 1 4
        *rand mm_dart_2 1 4
        *rand mm_dart_3 1 4
        *set combat_player_dmg_dealt (((mm_dart_1 + mm_dart_2) + mm_dart_3) + 3)
        *set combat_enemy_hp - combat_player_dmg_dealt
        *if (combat_enemy_hp < 0)
          *set combat_enemy_hp 0
        *set stat_bump2_locked true
        *set locked_stat_bump2_page_id choice_page_id
      You speak three crisp syllables and snap your fingers forward. Three glowing, pale-blue darts of crackling arcane force burst from your fingertips, curving through the dark water with impossible precision to slam home.
      [b][✨ Magic Missile: Automatic Hit | ${combat_player_dmg_dealt} damage][/b]
      *goto culvert_check_enemy_hp

  # Brace and watch its strikes, giving ground instead of pressing the attack.
    *set combat_enemy_disadvantage true
    You plant your feet in the silt and keep the torch high, tracking the shape moving low through the water instead of swinging blind.
    *goto culvert_enemy_turn

  *if ((((character_class = "wizard") and (wizard_spell = "shield")) and (wizard_spell_slots > 0)) and (not(shield_armed)))
    # [Spell: Shield] Hold the barrier-spell coiled and ready, primed to snap into place the instant something connects.
      *set shield_armed true
      You murmur the first half of the somatic phrase under your breath, holding the working coiled and ready at your fingertips, costing you nothing to keep it there.
      [b][✨ Shield Readied — will trigger automatically on the next hit][/b]
      *goto culvert_combat_round_hub

  *if ((character_class = "fighter") and (fighter_second_wind_uses > 0))
    # [Second Wind] Grit your teeth through the cold and the fear, and keep going.
      *gosub_scene startup second_wind
      A surge of stubborn, practiced discipline steadies your breathing and closes the worst of your scrapes.
      [b][🩸 Hit Points: ${hp_current} / ${hp_max}][/b]
      *goto culvert_enemy_turn

  *if (((character_class = "barbarian") and (not(is_raging))) and (barbarian_rage_uses > 0))
    # [Rage] Let the fury take you.
      *gosub_scene startup activate_rage
      A hot, roaring pressure floods your chest, dulling the cold and the stink of the drain to nothing at all.
      *goto culvert_enemy_turn

  # Break off and scramble back up through the breach.
    *goto culvert_flee
```

3. **Enemy Turn Retaliatory Death & Armor of Agathys Flavor (`*label culvert_enemy_turn`):**
```choicescript
*label culvert_enemy_turn
*gosub_scene startup resolve_enemy_attack
*if (combat_shield_triggered)
  *if (combat_enemy_hit_success)
    A shimmering lattice of force flares to life around you on pure reflex, but the blow crashes through it anyway, claws finding your ribs regardless.
    [b][✨ Shield Broken Through | 🩸 ${combat_enemy_name} Hits: ${combat_enemy_dmg_dealt} damage | HP: ${hp_current} / ${hp_max}][/b]
  *else
    A shimmering lattice of force flares to life around you on pure reflex, deflecting the claws a hair's breadth from your ribs.
    [b][✨ Shield Holds | 💨 ${combat_enemy_name} Misses][/b]
*else
  *if (combat_enemy_hit_success)
    The thing surges out of the dark water in a wet lunge, ragged claws raking for your ribs.
    *if (combat_agathys_triggered)
      *if (combat_agathys_shattered)
        As its claws strike, your frost-sheathe shatters violently in a burst of crystalline rime, driving shards of biting cold deep into its chest!
        [b][❄️ Armor of Agathys: 5 Cold Damage dealt to ${combat_enemy_name} | Frost Armor Shattered][/b]
      *else
        As its claws strike, the rime holding across your harness pulses with bitter frost, biting into its flesh while your armor holds!
        [b][❄️ Armor of Agathys: 5 Cold Damage dealt to ${combat_enemy_name} | ${temp_hp} Temp HP remaining][/b]
    [b][🩸 ${combat_enemy_name} Hits: ${combat_enemy_dmg_dealt} damage | HP: ${hp_current} / ${hp_max}][/b]
  *else
    It lunges out of the water, but you're already moving, and the claws rake nothing but torchlit air.
    [b][💨 ${combat_enemy_name} Misses][/b]

*comment Critical check for retaliatory kills (Armor of Agathys)
*if (combat_enemy_hp <= 0)
  *goto culvert_victory

*if (hp_current <= 1)
  *goto culvert_rescue
*if ((not(stat_bump_locked)) or (not(locked_stat_bump_page_id = choice_page_id)))
  *set combat_round + 1
  *set stat_bump_locked true
  *set locked_stat_bump_page_id choice_page_id
*page_break Hold your ground...
*goto culvert_combat_round_hub
```

4. **Exit Resets on Victory, Rescue, and Flee (`alderford.txt`):**
   * In `culvert_victory`, `culvert_rescue`, and `culvert_flee`:
     ```choicescript
     *set hex_active false
     *set agathys_active false
     *set temp_hp 0
     *set shield_armed false
     *set combat_agathys_triggered false
     *set combat_agathys_shattered false
     ```

5. **Morning Muster Long Rest Reset (`alderford.txt` line 2480):**
   * Reset `hexblood_hex_used` alongside spell slots:
     ```choicescript
     *if (race = "hexblood")
       *set hexblood_hex_used false
     ```

---

### 3. Campaign & Dossier Synchronization

#### [MODIFY] [`battle_black_sinks.txt`](file:///c:/Users/Kwesey/Desktop/choicescript-main/web/mygame/scenes/battle_black_sinks.txt)
* In the bivouac long rest sequence (around line 1918), add:
  ```choicescript
  *if (race = "hexblood")
    *set hexblood_hex_used false
  ```

#### [MODIFY] [`choicescript_stats.txt`](file:///c:/Users/Kwesey/Desktop/choicescript-main/web/mygame/scenes/choicescript_stats.txt)
* In Combat Vitals (line 113), synchronize temporary hit points:
  ```choicescript
  • [b]Hit Points (HP):[/b] ${hp_current} / ${hp_max}@{(temp_hp > 0)  (+${temp_hp} Temp HP)|}
  ```

---

## Verification Plan

### Automated Tests
* Run `quicktest.js` to ensure all ChoiceScript syntax, boolean conditions, labels, and slot deductions compile cleanly:
  ```powershell
  node quicktest.js web/mygame
  ```
* Run `randomtest.js` across multiple iterations to verify all spell paths, rolls, and branches resolve properly without runtime errors:
  ```powershell
  node randomtest.js --numTests=100
  ```

### Manual Verification Matrix
* **Warlock with Chill Touch & Eldritch Blast:** Verify both cantrip choices appear independently in the round menu with distinct prose.
* **Hexblood with Innate Hex:** Verify Hex can be cast once per long rest without consuming warlock slots, adds +1d6 to all subsequent attacks, and doesn't conflict with Sneak Attack.
* **Warlock with Armor of Agathys:** Verify +5 temp HP is granted, retaliates with 5 cold damage when hit, narrates properly when shattered vs held, and routes cleanly to `culvert_victory` on retaliatory kills.
* **Bard with Dissonant Whispers & Healing Word:** Verify Dissonant Whispers deals psychic damage (full on failed save, half on save) without multi-rolling on refresh, and Healing Word heals up to max HP without `*temp` runtime crashes.
* **Wizard/Warlock with False Life:** Verify `temp_hp` absorbs incoming damage without corrupting `hp_current` or being cleared by `update_dnd_stats`.
