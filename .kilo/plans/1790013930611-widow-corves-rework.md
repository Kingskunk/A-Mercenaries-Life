# Plan: Widow Corve's — First-Visit Scene Expansion

**File:** `web/mygame/scenes/port_valen_dredge_end.txt`

## Context

Widow Corve's needs a complete first-visit rework. The current version has a wine purchase as the only way to interact with the women, gates interaction behind 5 copper, and introduces Mistress Helvi too early.

## Design Principles

1. **The woman IS the menu.** The player enters, a woman approaches, and she is the interface for drinks, available companions, and how the house works.
2. **No owner on first visit.** The person who runs the place is not introduced.
3. **Wine served by women, not purchased at a bar.** Wine (5 copper) is offered by the woman who approached or by any available woman. Both can serve drinks.
4. **Available women randomized per day, locked for the day.** From a pool of 6 unique women (2 elves, 3 humans, 1 half-orc), 2-4 are available each day. The rest are busy. Leaving and returning does not reset the list.
5. **Mistress Helvi not introduced.** She does not appear in this scene.
6. **No sit/listen option.** 25 minutes of sitting without 6-8 hours of rest doesn't justify fatigue processing.
7. **House rules in intro prose.** The woman explains how the house works as part of her approach, not as a separate menu question. Detailed Q&A happens in `cut_corve_woman_talk`.
8. **Selected woman accompanies player to private chamber.** The availability system ties to the chamber option.
9. **Unique rates per available woman.** Each of the 6 women has a different price.
10. **Unique buff per woman.** Each woman gives a different stat buff (DEX, INT, STR, WIS, CON, or dual). This is a separate buff system from food and drink.
11. **Chamber is NOT sleep.** No clock advance, no sleep system, no hunger/fatigue processing. Just the encounter and the buff.
12. **Limited operating hours.** Widow Corve's opens at dusk and closes early morning. The player may only get 1-2 chances to visit different women per day. The entire scene is time-gated to these hours.
13. **No time advance on selection hub.** Time advances only for actual activities (drink, chamber), not for browsing the available women.
14. **Conversation depth out of scope.** The `cut_corve_woman` conversation is brief for now. Expand later when the base is worked out.

## Pool of 6 Women

| # | Name | Race | Rate | Buff | Brief |
|---|------|------|------|------|-------|
| 1 | Lirael | Elf | 50 cp | +1 DEX Checks (4h) | Quiet, good conversation |
| 2 | Sable | Elf | 40 cp | +1 INT Checks (4h) | Doesn't talk much, listens well |
| 3 | Maren | Human | 30 cp | +1 STR Checks (4h) | Loud, easy, carries two drinks |
| 4 | Tesslyn | Human | 45 cp | +1 WIS Checks (4h) | Speaks softly, watches reactions |
| 5 | Kael | Human | 35 cp | +1 CON Checks (4h) | Steady, no nonsense |
| 6 | Brinna | Half-orc | 60 cp | +1 STR and +1 CON Checks (2h) | Warm, gentle despite build |

**Operating hours:** Dusk to early morning. The parlor is in full motion at night — the scarlet glow washes the entryway, music and laughter carry past the curtain. The place closes in the early morning hours. The player may only get 1-2 chamber visits per day due to the time constraint. The entire scene is time-gated to these hours.

**Chamber encounters are NOT sleep.** They do NOT advance the clock, do NOT use the sleep system, and do NOT process hunger/fatigue. Each woman gives a unique stat buff (separate from food and drink) for a limited duration. This is a unique buff system outside of food and drink.

## What Gets Removed

### 1. Comment block update (lines 2881–2887)

**Old:**
```
*comment WIDOW CORVE'S (THE STEWS UNDER THE SEAWALL)
*comment A reputable private house combining bathhouse, heated parlor, and chambers.
*comment Staffed entirely by women working under Widow Corve's leasehold.
*comment Marked-up spiced wine (5 copper) and private luxury rest (3 silver).
*comment Timeless, faction-agnostic, and role-agnostic throughout.
```

**New:**
```
*comment WIDOW CORVE'S (THE STEWS UNDER THE SEAWALL)
*comment A reputable private house combining bathhouse, heated parlor, and chambers.
*comment Staffed entirely by women working under Widow Corve's leasehold.
*comment Wine is served by the women, not purchased at a bar. Private luxury rest (3 silver).
*comment Timeless, faction-agnostic, and role-agnostic throughout.
```

### 2. Delete entire `cut_corve_menu` choice block (lines 2935–3045)

Delete everything from `*label cut_corve_menu` through the last `*goto cut_corve_menu`. This removes:
- Wine purchase choice (5 copper)
- Private chamber choice (3 silver, with Mistress Helvi)
- Sit and listen choice
- Ask the doorkeeper choice (to be redesigned)
- Step back out choice

### 3. Remove "Sit near the parlor stove and listen" from menu

This option is removed entirely. No fatigue processing without 6-8 hours of rest.

## What Gets Added

### 4. New label: `cut_corve_approach` (inserted between `cut_corve` entry and new `cut_corve_menu`)

The woman's approach scene. First visit only. Full prose below.

```
*label cut_corve_approach
*set cut_corve_first_visit true
*set hours_to_pass 0
*set minutes_to_pass 0
*set time_advance_call_id "cut_corve_approach_1"
*gosub_scene calendar advance_time
*gosub_scene calendar recalc_hp_from_neglect
*if (hp_current <= 0)
  *set death_cause "exhaustion"
  *goto_scene death death_screen

*temp corve_approach_roll (((campaign_day * 7) + clock_hour) modulo 6) + 1

*if (corve_approach_roll = 1)
  *set corve_approach_name "Lirael"
  *set corve_approach_race "elf"
  *set corve_approach_desc "A tall elf with copper skin and long black hair braided with tiny silver bells, her amber eyes tracking you with the patience of someone who has all the time in the world."
*elseif (corve_approach_roll = 2)
  *set corve_approach_name "Sable"
  *set corve_approach_race "elf"
  *set corve_approach_desc "A pale elf with white-blonde hair and a quiet, measuring smile. She moves like smoke between the tables, unhurried, her green eyes taking in everything."
*elseif (corve_approach_roll = 3)
  *set corve_approach_name "Maren"
  *set corve_approach_race "human"
  *set corve_approach_desc "A broad-shouldered human woman with sun-darkened skin and auburn hair pulled back bare. Her laugh is loud and easy, and she carries two drinks at once without spilling."
*elseif (corve_approach_roll = 4)
  *set corve_approach_name "Tesslyn"
  *set corve_approach_race "human"
  *set corve_approach_desc "A slender human woman in a deep blue dress, dark hair swept up with a single bone pin. She speaks softly and watches your reaction more than your purse."
*elseif (corve_approach_roll = 5)
  *set corve_approach_name "Kael"
  *set corve_approach_race "human"
  *set corve_approach_desc "A stocky human woman with a shaved head and a scar across her jaw. She carries a tray like a soldier carries a shield — steady, no nonsense."
*else
  *set corve_approach_name "Brinna"
  *set corve_approach_race "half-orc"
  *set corve_approach_desc "A half-orc woman with tusked lips and a warm, open grin. She is built like a blacksmith and moves with surprising gentleness, a half-empty bottle balanced on one thick finger."

*if (not(cut_corve_daily_set))
  *temp corve_daily_roll 0
  *rand corve_daily_roll 2 4
  *set cut_corve_available_count corve_daily_roll
  *set cut_corve_daily_set true

*if (corve_approach_roll = 1)
  *set cut_corve_available_1 "Lirael"
*elseif (corve_approach_roll = 2)
  *set cut_corve_available_1 "Sable"
*elseif (corve_approach_roll = 3)
  *set cut_corve_available_1 "Maren"
*elseif (corve_approach_roll = 4)
  *set cut_corve_available_1 "Tesslyn"
*elseif (corve_approach_roll = 5)
  *set cut_corve_available_1 "Kael"
*else
  *set cut_corve_available_1 "Brinna"

*if (cut_corve_available_count >= 2)
  *if (cut_corve_available_1 = "Lirael")
    *set cut_corve_available_2 "Sable"
  *elseif (cut_corve_available_1 = "Sable")
    *set cut_corve_available_2 "Lirael"
  *elseif (cut_corve_available_1 = "Maren")
    *set cut_corve_available_2 "Tesslyn"
  *elseif (cut_corve_available_1 = "Tesslyn")
    *set cut_corve_available_2 "Maren"
  *elseif (cut_corve_available_1 = "Kael")
    *set cut_corve_available_2 "Brinna"
  *else
    *set cut_corve_available_2 "Kael"

*if (cut_corve_available_count >= 3)
  *if (cut_corve_available_1 != "Lirael" and cut_corve_available_2 != "Lirael")
    *set cut_corve_available_3 "Lirael"
  *elseif (cut_corve_available_1 != "Sable" and cut_corve_available_2 != "Sable")
    *set cut_corve_available_3 "Sable"
  *elseif (cut_corve_available_1 != "Maren" and cut_corve_available_2 != "Maren")
    *set cut_corve_available_3 "Maren"
  *elseif (cut_corve_available_1 != "Tesslyn" and cut_corve_available_2 != "Tesslyn")
    *set cut_corve_available_3 "Tesslyn"
  *elseif (cut_corve_available_1 != "Kael" and cut_corve_available_2 != "Kael")
    *set cut_corve_available_3 "Kael"
  *else
    *set cut_corve_available_3 "Brinna"

*comment ROOM DESCRIPTION
"Parlor is warm," the doorkeeper says as you step through. "Steel stays in the scabbard, hands stay to yourself, and coin goes on the brass tray before you take the stairs." He watches you past, his gaze settling on the room behind you as you leave the threshold behind.

The air hits you immediately: dried lavender, burning applewood coals, melted beeswax, and sweet, warming clove wine. The scarlet glow from the red lanterns washes everything in warm light.

The parlor hums with low conversation — a bard tuning a lute in the corner, the clink of glasses, the soft rustle of silk. The women move through the room with easy purpose. One carries two drinks at once, balancing them on one palm. Another sits at a table with a man in a merchant's coat, her laughter low and deliberate. A third stands at the bar, wiping down the counter between customers, her movements unhurried.

They are not waiting to be chosen. They are working.

*comment THE APPROACH
{corve_approach_desc} She crosses the room toward you, a tray in one hand, and sets it on the small table beside your bench without ceremony. Two drinks. She picks one up, takes a sip to test the temperature, and sets it before you.

"First time in Corve's?" she asks, her voice neither warm nor cool. "The wine's good. The company's better. And everything else is a conversation you'll have to have yourself."

She straightens, glances around the room at the other women, then back at you.

"Here's how it works. I'm {corve_approach_name}, and these are the women who are free tonight." She counts on her fingers. "Drinks are on the table. The women bring them. No bar to queue at, no waiting on a server who doesn't want to look at you. Beyond that, it's between you and whoever you choose. Prices are listed. No hidden fees, no pressure. You leave when you're done."

She pauses, letting that settle.

"Take your time. I'll be wherever the light hits best."

*page_break The door stays open behind her…
*goto cut_corve_menu
```

### 5. New label: `cut_corve_select` (NEW — selection hub)

This is the missing piece. After "Ask who's available," the player sees the list and selects a woman. This is the hub for selecting who they want to spend time with.

```
*label cut_corve_select

*if (cut_corve_available_count >= 1)
  *if (cut_corve_available_1 = "Lirael")
    # Lirael [50 Copper Bits] — A tall elf with copper skin and long black hair braided with tiny silver bells. Quiet, good conversation.
  *elseif (cut_corve_available_1 = "Sable")
    # Sable [40 Copper Bits] — A pale elf with white-blonde hair and a quiet, measuring smile. Doesn't talk much, listens well.
  *elseif (cut_corve_available_1 = "Maren")
    # Maren [30 Copper Bits] — A broad-shouldered human woman with sun-darkened skin and auburn hair pulled back bare. Loud, easy, carries two drinks.
  *elseif (cut_corve_available_1 = "Tesslyn")
    # Tesslyn [45 Copper Bits] — A slender human woman in a deep blue dress, dark hair swept up with a single bone pin. Speaks softly, watches your reaction.
  *elseif (cut_corve_available_1 = "Kael")
    # Kael [35 Copper Bits] — A stocky human woman with a shaved head and a scar across her jaw. Steady, no nonsense.
  *else
    # Brinna [60 Copper Bits] — A half-orc woman with tusked lips and a warm, open grin. Built like a blacksmith, moves with surprising gentleness.

*if (cut_corve_available_count >= 2)
  *if (cut_corve_available_2 = "Lirael")
    # Lirael [50 Copper Bits] — A tall elf with copper skin and long black hair braided with tiny silver bells. Quiet, good conversation.
  *elseif (cut_corve_available_2 = "Sable")
    # Sable [40 Copper Bits] — A pale elf with white-blonde hair and a quiet, measuring smile. Doesn't talk much, listens well.
  *elseif (cut_corve_available_2 = "Maren")
    # Maren [30 Copper Bits] — A broad-shouldered human woman with sun-darkened skin and auburn hair pulled back bare. Loud, easy, carries two drinks.
  *elseif (cut_corve_available_2 = "Tesslyn")
    # Tesslyn [45 Copper Bits] — A slender human woman in a deep blue dress, dark hair swept up with a single bone pin. Speaks softly, watches your reaction.
  *elseif (cut_corve_available_2 = "Kael")
    # Kael [35 Copper Bits] — A stocky human woman with a shaved head and a scar across her jaw. Steady, no nonsense.
  *else
    # Brinna [60 Copper Bits] — A half-orc woman with tusked lips and a warm, open grin. Built like a blacksmith, moves with surprising gentleness.

*if (cut_corve_available_count >= 3)
  *if (cut_corve_available_3 = "Lirael")
    # Lirael [50 Copper Bits] — A tall elf with copper skin and long black hair braided with tiny silver bells. Quiet, good conversation.
  *elseif (cut_corve_available_3 = "Sable")
    # Sable [40 Copper Bits] — A pale elf with white-blonde hair and a quiet, measuring smile. Doesn't talk much, listens well.
  *elseif (cut_corve_available_3 = "Maren")
    # Maren [30 Copper Bits] — A broad-shouldered human woman with sun-darkened skin and auburn hair pulled back bare. Loud, easy, carries two drinks.
  *elseif (cut_corve_available_3 = "Tesslyn")
    # Tesslyn [45 Copper Bits] — A slender human woman in a deep blue dress, dark hair swept up with a single bone pin. Speaks softly, watches your reaction.
  *elseif (cut_corve_available_3 = "Kael")
    # Kael [35 Copper Bits] — A stocky human woman with a shaved head and a scar across her jaw. Steady, no nonsense.
  *else
    # Brinna [60 Copper Bits] — A half-orc woman with tusked lips and a warm, open grin. Built like a blacksmith, moves with surprising gentleness.

*if (cut_corve_available_count >= 4)
  *if (cut_corve_available_4 = "Lirael")
    # Lirael [50 Copper Bits] — A tall elf with copper skin and long black hair braided with tiny silver bells. Quiet, good conversation.
  *elseif (cut_corve_available_4 = "Sable")
    # Sable [40 Copper Bits] — A pale elf with white-blonde hair and a quiet, measuring smile. Doesn't talk much, listens well.
  *elseif (cut_corve_available_4 = "Maren")
    # Maren [30 Copper Bits] — A broad-shouldered human woman with sun-darkened skin and auburn hair pulled back bare. Loud, easy, carries two drinks.
  *elseif (cut_corve_available_4 = "Tesslyn")
    # Tesslyn [45 Copper Bits] — A slender human woman in a deep blue dress, dark hair swept up with a single bone pin. Speaks softly, watches your reaction.
  *elseif (cut_corve_available_4 = "Kael")
    # Kael [35 Copper Bits] — A stocky human woman with a shaved head and a scar across her jaw. Steady, no nonsense.
  *else
    # Brinna [60 Copper Bits] — A half-orc woman with tusked lips and a warm, open grin. Built like a blacksmith, moves with surprising gentleness.

# Step back. Return to the menu.
  *goto cut_corve_menu
```

### 6. New label: `cut_corve_woman` (NEW — scene with selected woman)

After selecting a woman from the list, this scene handles the interaction. Uses `selected_woman_name` variable.

```
*label cut_corve_woman
*set hours_to_pass 0
*set minutes_to_pass 0
*set time_advance_call_id "cut_corve_woman_1"
*gosub_scene calendar advance_time
*gosub_scene calendar recalc_hp_from_neglect
*if (hp_current <= 0)
  *set death_cause "exhaustion"
  *goto_scene death death_screen

{selected_woman_name} comes to your table, or you go to her — the parlor is small enough that it doesn't matter. She gives you a look that's neither invitation nor refusal, just acknowledgment.

"Got a drink in you, or are you starting dry?"

*choice
  # Take her up on the drink. [5 Copper Bits]
    *if (not(cut_corve_wine_ordered))
      *set cut_corve_wine_ordered true
      *set tavern_item_cost_copper 5
      *set tavern_item_hp_heal 0
      *set tavern_item_temp_hp 0
      *set tavern_item_type "drink"
      *set tavern_item_buff_name "Clove Wine"
      *set tavern_item_buff_desc "+1 CHA Checks"
      *set tavern_item_buff_stat "cha"
      *set tavern_item_buff_bonus 1
      *set tavern_item_buff_minutes 240
      *gosub_scene startup buy_tavern_item
      *set hours_to_pass 0
      *set minutes_to_pass 20
      *set time_advance_call_id "cut_corve_woman_drink_1"
      *gosub_scene calendar advance_time
      *gosub_scene calendar recalc_hp_from_neglect
      *if (hp_current <= 0)
        *set death_cause "exhaustion"
        *goto_scene death death_screen

      {selected_woman_name} pours you a glass of spiced clove wine from a copper boiler on the stove. It's warm and sweet, the kind of drink that settles in your chest and loosens your tongue.

      [b][🍷 Wine Served: Easy Demeanor (+1 CHA Checks for 4 Hours)][/b]
      *page_break She settles into the seat across from you…
      *goto cut_corve_woman_talk
    *else
      {selected_woman_name} gives you a look. "Another?"
      *goto cut_corve_woman_talk

  # No, I'm good. Just want to talk.
    *goto cut_corve_woman_talk

*label cut_corve_woman_talk

{selected_woman_name} takes a sip of her own drink and settles in.

"I'm {selected_woman_name}." She says it plainly, no flourish. "I'm here because I'm here. Nobody's keeping me, and I'm not keeping anyone. The rates are on the table."

She looks at you, measuring.

"Ask me anything. We'll get to the rest when you're ready."

*choice
  # Ask about the house rules.
    *if (not(cut_corve_q_rules))
      *set cut_corve_q_rules true
      {selected_woman_name} shrugs. "No weapons inside. No raising your voice. Pay on the dot, no excuses. Beyond that, you're a grown adult — act like one."
      *goto cut_corve_woman_talk
    *else
      {selected_woman_name} gives you a look. "You already know the rules."
      *goto cut_corve_woman_talk

  # Ask about the other women.
    *if (not(cut_corve_q_women))
      *set cut_corve_q_women true
      {selected_woman_name} glances around the room. "They're all here because they want to be. Some of them are new, some of them have been here a while. They all do the same work. The rates are on the table."
      *goto cut_corve_woman_talk
    *else
      {selected_woman_name} waves a hand. "You've seen them. They're all the same."
      *goto cut_corve_woman_talk

  # Ask about the owner.
    *if (not(cut_corve_q_owner))
      *set cut_corve_q_owner true
      {selected_woman_name} pauses. "There's an owner. You won't meet her. She doesn't need to know your name."
      *goto cut_corve_woman_talk
    *else
      {selected_woman_name} gives you a flat look. "She's not here. What else do you want to know?"
      *goto cut_corve_woman_talk

  # Ask about a private room. [3 Silver Marks]
    *if (not(cut_corve_chamber_paid))
      *if (not(currency_txn_locked)) or (not(locked_currency_txn_page_id = choice_page_id))
        *set currency_add_amount 0 - 30
        *gosub_scene startup currency_add
        *set currency_txn_locked true
        *set locked_currency_txn_page_id choice_page_id
      *set cut_corve_chamber_paid true
      *set intimate_encounters + 1

      *if (selected_woman_name = "Lirael")
        *set cut_corve_buff_name "Elven Grace"
        *set cut_corve_buff_desc "+1 DEX Checks"
        *set cut_corve_buff_stat "dex"
        *set cut_corve_buff_bonus 1
        *set cut_corve_buff_minutes 240
      *elseif (selected_woman_name = "Sable")
        *set cut_corve_buff_name "Shadow Mind"
        *set cut_corve_buff_desc "+1 INT Checks"
        *set cut_corve_buff_stat "int"
        *set cut_corve_buff_bonus 1
        *set cut_corve_buff_minutes 240
      *elseif (selected_woman_name = "Maren")
        *set cut_corve_buff_name "Bold Spirit"
        *set cut_corve_buff_desc "+1 STR Checks"
        *set cut_corve_buff_stat "str"
        *set cut_corve_buff_bonus 1
        *set cut_corve_buff_minutes 240
      *elseif (selected_woman_name = "Tesslyn")
        *set cut_corve_buff_name "Whisper Calm"
        *set cut_corve_buff_desc "+1 WIS Checks"
        *set cut_corve_buff_stat "wis"
        *set cut_corve_buff_bonus 1
        *set cut_corve_buff_minutes 240
      *elseif (selected_woman_name = "Kael")
        *set cut_corve_buff_name "Iron Nerve"
        *set cut_corve_buff_desc "+1 CON Checks"
        *set cut_corve_buff_stat "con"
        *set cut_corve_buff_bonus 1
        *set cut_corve_buff_minutes 240
      *else
        *set cut_corve_buff_name "Unyielding"
        *set cut_corve_buff_desc "+1 STR and +1 CON Checks"
        *set cut_corve_buff_stat "str"
        *set cut_corve_buff_bonus 1
        *set cut_corve_buff_stat2 "con"
        *set cut_corve_buff_bonus2 1
        *set cut_corve_buff_minutes 120

      {selected_woman_name} stands, nods once, and leads you up the narrow timber stairs to a chamber tucked beneath the heavy joists of the upper floor. A fire of split birch crackles in the hearth, and a copper tub of steaming, lavender-scented water waits on the floorboards beside a wide bed piled deep with goose-feather quilts.

      The door closes behind you. What happens next is between the two of you. When you're done, you wash up, settle back into your clothes, and head down the stairs a different person than the one who went up.

      [b][${cut_corve_buff_name}: ${cut_corve_buff_desc} for ${cut_corve_buff_minutes} Minutes][/b]
      *page_break Back to the doorway…
      *goto cut_corve_menu
    *else
      {selected_woman_name} raises an eyebrow. "You already paid for tonight."
      *goto cut_corve_woman_talk

  # I'll just have the wine and conversation for now.
    *goto cut_corve_woman_leave

  # Nothing for me, thanks. I should go.
    *goto cut_corve_woman_leave

*label cut_corve_woman_leave
{selected_woman_name} nods. "Anytime."

*page_break She drifts back to her table…
*goto cut_corve_menu
```

### 7. Updated `cut_corve_menu` (replaces old `cut_corve_menu`)

Rebuilt. The woman who approached is the primary interaction. Choices:

```
*label cut_corve_menu
*choice
  # Ask about what's to drink.
    *if (not(cut_corve_drinks_ordered))
      *set cut_corve_drinks_ordered true
      *set tavern_item_cost_copper 5
      *set tavern_item_hp_heal 0
      *set tavern_item_temp_hp 0
      *set tavern_item_type "drink"
      *set tavern_item_buff_name "Clove Wine"
      *set tavern_item_buff_desc "+1 CHA Checks"
      *set tavern_item_buff_stat "cha"
      *set tavern_item_buff_bonus 1
      *set tavern_item_buff_minutes 240
      *gosub_scene startup buy_tavern_item
      *set hours_to_pass 0
      *set minutes_to_pass 20
      *set time_advance_call_id "cut_corve_drink_1"
      *gosub_scene calendar advance_time
      *gosub_scene calendar recalc_hp_from_neglect
      *if (hp_current <= 0)
        *set death_cause "exhaustion"
        *goto_scene death death_screen

      {corve_approach_name} pours you a glass of spiced clove wine from a copper boiler on the stove. It's warm and sweet, the kind of drink that settles in your chest and loosens your tongue.

      [b][🍷 Wine Served: Easy Demeanor (+1 CHA Checks for 4 Hours)][/b]
      *page_break She wanders back toward the other tables…
      *goto cut_corve_menu
    *else
      {corve_approach_name} gives you a knowing look. "Another?"
      *goto cut_corve_menu

  # Ask who's available tonight.
    *if (not(cut_corve_availability_shown))
      *set cut_corve_availability_shown true
      *set cut_corve_daily_locked true
      *set cut_corve_intro_done true
      *goto cut_corve_select
    *else
      *if (cut_corve_daily_locked)
        {corve_approach_name} waves a hand. "Same list as before. I'm not changing the roster mid-night."
        *goto cut_corve_menu
      *else
        *set cut_corve_availability_shown false
        *goto cut_corve_select

  # Step back out onto Lamp Stair.
    *goto cut_lamp_page
```

## Flow Summary

### First Visit
1. `cut_corve` — player enters, doorkeeper lets them in
2. Room description — player sees drink servers, women, bard at Night
3. `cut_corve_approach` — randomized woman approaches, sets daily availability, explains house rules and how the place works as part of the intro prose
4. `cut_corve_menu` — woman is the menu:
   - Ask about drinks (wine served, 5 copper, CHA buff)
   - Ask who's available → `cut_corve_select` → select a woman → `cut_corve_woman`
   - Exit

### Repeat Visit (same day)
1. `cut_corve` — player enters
2. Room description
3. Skip `cut_corve_approach` (first visit done)
4. `cut_corve_menu` — same woman, daily availability unchanged
5. "Ask who's available" → shows same list (locked), select woman → `cut_corve_woman`

### Repeat Visit (new day)
1. `cut_corve` — player enters
2. Room description
3. `cut_corve_approach` — new randomized woman approaches, new daily availability set
4. `cut_corve_menu` — fresh options

### In `cut_corve_woman` (all visits)
- Player can ask questions from a shared dialogue pool (house rules, other women, owner)
- Any available woman can answer any question
- Wine option: 5 copper, CHA buff (same as menu)
- Chamber option: 30 copper, unique stat buff per woman (NOT sleep, NOT time advance)
- Then proceed to wine, chamber, or leave

## Key Changes from Current Code

### Remove (delete entirely):
- Wine purchase choice block at `cut_corve_menu` (lines 2936–2965)
- "Spiced Wine" tavern item buff
- `cut_corve_wine` time advance call id
- Current `cut_corve_menu` choices (lines 2935–3045)
- Mistress Helvi references in private chamber (lines 2997–2999)
- Mistress Helvi name in doorkeeper dialogue (lines 3041–3043)

### Add:
- `cut_corve_approach` — woman's approach scene (first visit)
- `cut_corve_select` — selection hub with available women list and rates
- `cut_corve_woman` — scene with selected woman (drink, talk, chamber)
- Updated `cut_corve_menu` — rebuilt with new structure

### Modify:
- Comment block (lines 2881–2887)
- Private chamber: replace Mistress Helvi with generic attendant (lines 2997–2999)
- Doorkeeper dialogue: remove Mistress Helvi name (lines 3041–3043)

## Open Questions

1. **`cut_corve_woman` conversation depth:** The current plan has a brief conversation with 3 question types (rules, women, owner). Should this be expanded with more dialogue options (flirting, negotiating, declining)? Recommend: keep brief for now, expand later. User confirmed this is not worked out yet.

2. **Buff system integration:** Each woman gives a unique stat buff. Should these be implemented as temporary stat checks (like the wine's Easy Demeanor), or as a different system? Recommend: same system as wine — temporary buff with duration, applied via `startup` scene. Confirm during implementation.

## Verification

1. Compile and verify Widow Corve's loads without errors
2. First visit: player enters, woman approaches (randomized from 6), menu shows drinks/availability
3. "Ask who's available" leads to selection hub with 2-4 women and unique rates
4. Selecting a woman leads to `cut_corve_woman` scene with drink, questions, and chamber options
5. No standalone wine purchase option; wine is served by women (both approach and selected)
6. Available women list: 2-4 names, randomized per day, locked (leaving and returning doesn't reset)
7. Mistress Helvi not named or introduced
8. No "Sit and listen" option in menu
9. Private chamber is NOT sleep — no clock advance, no sleep system, no hunger/fatigue processing
10. Each woman gives a unique stat buff (DEX/INT/STR/WIS/CON/dual), separate from food/drink
11. Shared dialogue pool: player can ask rules/women/owner questions to any available woman
12. Repeat visit same day: availability unchanged, no repeated dialogue
13. Repeat visit new day: new woman approaches, new availability set
14. No time advance on selection hub
15. Scene not accessible outside operating hours (dusk to early morning)
