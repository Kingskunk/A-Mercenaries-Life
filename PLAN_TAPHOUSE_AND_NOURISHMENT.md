# Implementation Plan - Taphouse Integration & Temporary Nourishment Buff System

Integrate **The Drowned Oar Taphouse** into [`alderford.txt`](file:///c:/Users/Kwesey/Desktop/choicescript-main/web/mygame/scenes/alderford.txt) with full prose review, the **Temporary Nourishment Buff System** across [`startup.txt`](file:///c:/Users/Kwesey/Desktop/choicescript-main/web/mygame/scenes/startup.txt), [`calendar.txt`](file:///c:/Users/Kwesey/Desktop/choicescript-main/web/mygame/scenes/calendar.txt), and [`choicescript_stats.txt`](file:///c:/Users/Kwesey/Desktop/choicescript-main/web/mygame/scenes/choicescript_stats.txt), and strict adherence to all narrative guidelines.

---

## User Review Required

> [!IMPORTANT]
> - **Temporary Nourishment Buff System (Stat Checks Only):**
>   - Consuming food/drink at the taphouse grants a temporary $+1$ bonus to checks for a specific core stat (`CON`, `WIS`, `STR`, or `CHA`) for **4 hours (240 minutes)**.
>   - **Automatic Time-Decay:** Tracked in minutes in `calendar.txt` so every action in Alderford (45m per hub action) naturally ticks down the duration until it expires.
>   - **Integrated Engine Roll Bonus:** `roll_d20_check` in `startup.txt` checks `meal_buff_active` and adds $+1$ directly to the stat check modifier.
>   - **Status Screen Display:** Active nourishment and remaining minutes appear dynamically in `choicescript_stats.txt`.
>   - **No Stacking:** Purchasing a new meal/drink replaces the previous active buff.
> - **Tavern Menu Options:**
>   1. **Hot Mutton-and-Marrow Pottage (3 Copper):** Restores `3 HP` + **+1 CON Checks** (4h).
>   2. **Mug of Hot Spiced River Cider (2 Copper):** **+1 WIS Checks** (4h).
>   3. **Smoked Peat-Herring & Rye Bread (3 Copper):** Restores `1 HP` + **+1 STR Checks** (4h).
>   4. **Dram of Old Marches Herbal Bitters (2 Copper):** **+1 CHA Checks** (4h).
> - **Maura Dialogue & Knowledge Polish (Rules 1, 7, 14):**
>   - Organic introduction without meta distance drops.
>   - Grounded river lore (30-mile routine float, fast current, waxed cloaks).
>   - Optional inquiry regarding her retired sellsword past (Iron Bull Free Company).
> - **Lyra Rookie Continuity & Reputation Curve:**
>   - Maximum `lyra_bond` at Alderford capped at **32%** (via scaled early gains in `camp_night.txt` and `battle_black_sinks.txt`).
>   - Gated, grounded options: canal background, archery past, full moon pay, and ditch relief callback.
> - **Full Squad Presence (Rule 3):** Vanguard infantrymen, Fen-Scout skirmishers, and Cadre clerks all visibly present across the taproom.

---

## Proposed Changes Across Files

### 1. Component: Engine State & Nourishment Buff System

#### [MODIFY] [`startup.txt`](file:///c:/Users/Kwesey/Desktop/choicescript-main/web/mygame/scenes/startup.txt)
* **Add Global Nourishment Variables:**
```choicescript
*create meal_buff_active false
*create meal_buff_name "none"
*create meal_buff_desc "none"
*create meal_buff_stat "none"
*create meal_buff_bonus 0
*create meal_buff_minutes_left 0
```
* **Update `roll_d20_check` (incorporate meal buff bonus into check calculation):**
```choicescript
  *temp meal_bonus 0
  *if (meal_buff_active) and (check_stat = meal_buff_stat)
    *set meal_bonus meal_buff_bonus
    *set adv_label "${adv_label} +${meal_bonus} (${meal_buff_name})"

  *set check_total (d20_roll + check_mod)
  *if (guidance_active)
    *set check_total + guidance_roll
  *if (meal_bonus > 0)
    *set check_total + meal_bonus
```

#### [MODIFY] [`calendar.txt`](file:///c:/Users/Kwesey/Desktop/choicescript-main/web/mygame/scenes/calendar.txt)
* **Add Buff Decay to `*label advance_time`:**
```choicescript
*if (meal_buff_active)
  *temp total_mins_passed ((hours_to_pass * 60) + minutes_to_pass)
  *if (total_mins_passed > 0)
    *if (meal_buff_minutes_left > total_mins_passed)
      *set meal_buff_minutes_left - total_mins_passed
    *else
      *set meal_buff_minutes_left 0
      *set meal_buff_active false
      *set meal_buff_name "none"
      *set meal_buff_desc "none"
      *set meal_buff_stat "none"
      *set meal_buff_bonus 0
```

#### [MODIFY] [`choicescript_stats.txt`](file:///c:/Users/Kwesey/Desktop/choicescript-main/web/mygame/scenes/choicescript_stats.txt)
* **Display Active Nourishment in Condition Section:**
```choicescript
*if (meal_buff_active)
  • [b]Nourishment:[/b] ${meal_buff_name} (${meal_buff_desc} — ${meal_buff_minutes_left}m remaining)
```

---

### 2. Component: Early Game Progression Rebalance

#### [MODIFY] [`camp_night.txt`](file:///c:/Users/Kwesey/Desktop/choicescript-main/web/mygame/scenes/camp_night.txt)
* **Reassure Choice (`line 131`):** Change `*set lyra_bond +15` $\rightarrow$ `*set lyra_bond +6` (Fail: `+2`).
* **Pragmatic Choice (`line 154`):** Change `*set lyra_bond +10` $\rightarrow$ `*set lyra_bond +5` (Fail: `+2`).
* **Gentle Choice (`line 177`):** Change `*set lyra_bond +20` $\rightarrow$ `*set lyra_bond +8` (Fail: `+2`).

#### [MODIFY] [`battle_black_sinks.txt`](file:///c:/Users/Kwesey/Desktop/choicescript-main/web/mygame/scenes/battle_black_sinks.txt)
* **Pre-Battle Vanguard (`line 42`):** Change `*set lyra_bond +10` $\rightarrow$ `*set lyra_bond +4`.
* **Breach Surrender Mercy (`line 894`):** Change `*set lyra_bond +10` $\rightarrow$ `*set lyra_bond +6`.
* **Breach Charm Person (`line 916`):** Change `*set lyra_bond +15` $\rightarrow$ `*set lyra_bond +6`.
* **Gatehouse Bivouac Mending (`line 1123`):** Change `*set lyra_bond +15` $\rightarrow$ `*set lyra_bond +6`.
* **Gatehouse Bivouac Bowstring Maintenance (`line 1144`):** Change `*set lyra_bond +15` $\rightarrow$ `*set lyra_bond +6` (Fail: `+2`).
* **Gatehouse Bivouac Speak Truth (`line 1162`):** Change `*set lyra_bond +15` $\rightarrow$ `*set lyra_bond +6` (Fail: `+2`).
* **Gatehouse Bivouac Share Salt-Pork (`line 1175`):** Change `*set lyra_bond +10` $\rightarrow$ `*set lyra_bond +4`.

---

### 3. Component: Alderford Orders & Full Taphouse Scene Chain

#### [MODIFY] [`alderford.txt`](file:///c:/Users/Kwesey/Desktop/choicescript-main/web/mygame/scenes/alderford.txt)

#### A. Sergeant Varren's Orders (`line 56`):
```choicescript
"Barges load at first light!" Varren barks over the rushing weir. "Fourteen miles of marsh mud will rot your boots and rust your iron before we even step onto the open decks tomorrow. The riverfront salt lofts have rendered waterproofing wax for your leather; the Cadre marquee is pitched by the willows for surgery and sick call; and there's a heavy waterwheel forge upstream by the mill-race if your edges need grinding. If you're looking for hot broth and a warm hearth, the watermen have a low-timber taphouse down by the logging slips—just keep your steel in its scabbards and don't start brawling with the barge-men. Tend to your kit before the second watch or freeze on the river tomorrow!"
```

#### B. Hub Option (`*label alder_hub`):
```choicescript
  *if (not(visited_alder_tavern))
    # Push through the low-timber doors of the watermen's taphouse down by the logging slips for hot broth and dry warmth.
      *set visited_alder_tavern true
      *set alder_actions_left - 1
      *set minutes_to_pass 45
      *gosub_scene calendar advance_time
      *goto visit_taphouse
```

#### C. Full Scene Chain (`*label visit_taphouse`):

```choicescript
*comment ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*comment CHAIN 4: THE DROWNED OAR TAPHOUSE
*comment ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

*label visit_taphouse
Following the smell of burning peat, woodsmoke, and boiling mutton, you make your way down the gravel track toward the logging slips south of the sawmills. 

Built directly against the stone wharf embankment on massive cedar piles, a long, low-roofed timber building hugs the water. Above its heavy iron-strapped door, a weathered cedar signboard creaks in the freezing autumn wind, bearing a faded icon of an anchor entangled in riverweed: [b]THE DROWNED OAR TAPHOUSE[/b].

You push through the heavy leather draft-curtain into a wall of dry heat, stinging pipe smoke, and the steady murmur of tavern conversation. 

The taproom is filled with local watermen, heavy-set draymen in wool frocks, and river-barge pilots resting on scarred trestle benches. Near the roaring central river-stone hearth, off-duty Carrion mercenaries have claimed a wide semicircle of tables—vanguard heavy infantry scraping marsh mud from their greaves, fen-scouts waxing recurve strings, and cadre quartermaster clerks nursing clay mugs of bitter barley ale out of the drizzle.

Behind the wide oak plank bar, a lean, sharp-eyed woman in a clean linen apron and a bleached wolf-skin vest works the earthenware ale-taps with practiced ease. A faded mercenary brand is visible on the side of her neck as she fills stoneware mugs for thirsty carters.

*if (lyra_bond >= 20)
  At the edge of the hearth light, Lyra sits with her boots propped on an overturned nail-keg, nursing a cup of mulled cider. When she spots you through the peat haze, a faint, genuine smirk breaks across her guarded face. She kicks an empty wooden stool out from under the table toward you with the heel of her boot, raising her cup in a warm, welcoming toast.
*if ((lyra_bond >= 8) and (lyra_bond < 20))
  At the edge of the hearth light, Lyra sits with her boots propped on an overturned nail-keg, nursing a cup of mulled cider. She catches your eye through the peat haze, giving a slow, respectful nod of sellsword acknowledgment and lifting her flagon before returning to her drink.
*if (lyra_bond < 8)
  At the edge of the hearth light, Lyra sits with her boots propped on an overturned nail-keg, nursing a cup of mulled cider. She watches you step in with a cool, measuring gaze over the rim of her cup, offering a faint, unreadable dip of her chin before looking back toward the door.

*if (squad = "vanguard")
  Near the hearth bench, two heavy-set vanguard comrades have unbuckled their iron greaves, laughing quietly as they compare bruised knuckles and dried mud on their brigandines.
*if (squad = "scouts")
  Near the dark corner booth, two of Kestrel's fen-runners sit in low-voiced conversation with a local boatman, comparing landmark descriptions over a bowl of roasted river nuts.
*if (squad = "cadre")
  At a smaller side bench away from the main floor, a young Cadre logistical clerk is checking grain vouchers into a ledger while enjoying a steaming bowl of broth.

*label taphouse_menu_hub
*temp hint_taphouse_dice ""
*temp hint_taphouse_bard ""
*temp hint_taphouse_lyra ""
*if (show_stat_hints)
  *if (guidance_active)
    *set hint_taphouse_dice " [Guidance: Sleight of Hand (DEX DC 11) + 1d4, +1 Silver, +2 Copper]"
    *set hint_taphouse_bard " [Guidance: Performance (CHA DC 10) + 1d4, +1 Silver, +1 Copper, Free Drink]"
    *set hint_taphouse_lyra " [Guidance: Conversation with Lyra]"
  *else
    *set hint_taphouse_dice " [Sleight of Hand (DEX DC 11), +1 Silver, +2 Copper]"
    *set hint_taphouse_bard " [Performance (CHA DC 10), +1 Silver, +1 Copper, Free Drink]"
    *set hint_taphouse_lyra ""

The taproom hums with quiet comfort and warmth.

*choice
  *if ((((wizard_cantrip = "guidance") or (wizard_cantrip_2 = "guidance")) or (wizard_cantrip_3 = "guidance")) and (not(guidance_active)))
    # [Cantrip: Guidance] Murmur a focusing syllable to center your thoughts before stepping to the tables.
      *set guidance_active true
      You whisper the quiet focusing verse under your breath, letting the steady calm sharpen your hearing and perception amidst the taproom din.
      *goto taphouse_menu_hub

  # Pull up the stool beside Lyra near the hearth to talk over warm cider.${hint_taphouse_lyra}
    *goto taphouse_talk_lyra

  # Approach the oak counter to speak with the tavern-keeper and order warm food or drink.
    *goto taphouse_shop_bar

  # Pull up a bench at Corporal Rorik's bone-dice table by the hearth to wager a few coins.${hint_taphouse_dice}
    *goto taphouse_dice_table

  *if (character_class = "bard")
    # [Bard: Performance] Borrow a tavern lute and play a steady border tune for the room.${hint_taphouse_bard}
      *goto taphouse_bard_performance

  # Step out of the taphouse and return to the company lines.
    You pull the heavy leather draft-curtain aside and step back out into the cold, clean night air of the wharves.
    *goto alder_hub

*comment ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*comment TAPHOUSE SUB-BRANCH: TALKING TO LYRA
*comment ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

*label taphouse_talk_lyra
*temp discussed_lyra_valen false
*temp discussed_lyra_archery false
*temp discussed_lyra_pay false
*temp discussed_lyra_pact false

You pull up the wooden stool beside Lyra, feeling the dry heat from the river-stone hearth radiate against your boots. She slides a small wooden plate of roasted chestnuts toward you with the tip of her belt knife.

"Look at this," Lyra murmurs, leaning back against the timber wall. "A dry roof, peat in the grate, and cider that doesn't taste like marsh water. Beats sleeping in wet wool by a long shot."

*label lyra_dialogue_hub
*choice
  *if (not(discussed_lyra_valen))
    # "What are we walking into at Port Valen tomorrow?"
      *set discussed_lyra_valen true
      *if (lyra_bond >= 8)
        *set lyra_bond +2
        "Dredge-End," Lyra says quietly, staring into her cup. "When I left three winters back, I was bolting barefoot through freezing canal silt with half a sack of barley meal and two bailiff hounds baying behind me. Tomorrow we tie up at the timber slips with two companies of heavy steel and crossbows at our backs."
        
        She looks up at you with a faint, wry smirk. "The merchant factors in their velvet coats look right through you when you're begging in the ditch. But when the Carrion marches down the quay with pikes leveled, they suddenly remember how to bow."
        *page_break "What about the streets themselves?"...
        *goto lyra_port_valen_intel
      *else
        "Canals, rotting pilings, and crooked toll-wardens," Lyra says, keeping her eyes on her mug. "High stone wharves belong to the guild factors. Everything below the waterline belongs to footpads and canal draymen. Keep your purse laced inside your shirt and your dagger loose in the frog, or you'll be fishing your pockets out of the muck before midday."
        *page_break "Sound advice."...
        *goto lyra_dialogue_hub

  *if ((lyra_bond >= 8) and (not(discussed_lyra_archery)))
    # "Most recruits from the alleys grab a billhook or a spear. How'd you end up on the archery line?"
      *set discussed_lyra_archery true
      *set lyra_bond +2
      Lyra lets out a low, dry chuckle, tapping the horn tip of her bow propped against the table. "Spears are for people who like wrestling in the mud. I started on the ridge estates north of the city—poaching roe deer and hares out of Baron Karr's private timber to keep my younger cousins fed."
      
      Her expression turns distant, shadowed by old memory. "You learn to shoot fast and quiet when an iron bailiff's hounds are baying in the brush. And on the line, a bow gives you distance. In melee, you have to watch a man's eyes while his breath leaves him. At eighty yards, it's just wind, drop, and letting go."
      *page_break "Sounds like you earned every calloused finger."...
      *goto lyra_dialogue_hub

  *if (not(discussed_lyra_pay))
    # "Got any plans for your pay once the full moon muster rolls around?"
      *set discussed_lyra_pay true
      *if (lyra_bond >= 15)
        *set lyra_bond +2
        Lyra pauses, looking down into her cider. Her voice drops, losing its usual caustic edge. "First thing? Buy a pair of lined leather boots that don't split at the welt. Then track down my aunt's kids in the lower tenements. If they made it through the frost, buy them a sack of dry rye flour and square their debt with the tenement rent-collector before they get turned out into the silt. That's the only reason I took Vane's coin."
        *page_break "That's good coin well spent."...
        *goto lyra_dialogue_hub
      *else
        *set lyra_bond +1
        Lyra taps the rim of her cup against the table. "Lined boots that don't split at the welt, a fresh whetstone, and a pint of something that actually burns on the way down. Beyond that? Hold onto every copper. A sellsword with empty pockets ends up back in the ditch the day the contract expires."
        *page_break "Practical enough."...
        *goto lyra_dialogue_hub

  *if (((prep_lyra_pact) and (lyra_bond >= 12)) and (not(discussed_lyra_pact)))
    # "Glad we kept each other in one piece back at the ditch."
      *set discussed_lyra_pact true
      *set lyra_bond +2
      Lyra clinks her battered tin cup against yours with a dull ring. "Aye. When the line buckled, having someone watching the flanks was the only reason I didn't catch an iron point in the ribs." She takes a slow drink, shaking her head. "Here's to not feeding crows in the reeds, ${name}."
      *page_break Share a quiet drink with Lyra...
      *goto lyra_dialogue_hub

  # "Take it easy by the fire. I'm going to stretch my legs."
    "Don't let Rorik talk you out of your coin at the dice table," Lyra smirks, lifting her cup in a parting nod. "See you on the morning barges, ${name}."
    *page_break Step away from the bench...
    *goto taphouse_menu_hub

*label lyra_port_valen_intel
Lyra leans in closer over the table, keeping her voice beneath the tavern hum. "Down in the water-streets, the Gilded Scales don't collect the coin—the [b]Black Tally[/b] does. They control the eel-traps, the night barges, and every cellar flophouse along the marsh cut. Don't go flashing silver in the taprooms, and don't take side alleys after dusk unless you've got two mates carrying iron at your flank."
*set prep_marsh_intel true
*page_break Commit her warning to memory...
*goto lyra_dialogue_hub

*comment ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*comment TAPHOUSE SUB-BRANCH: MAURA'S COUNTER & NOURISHMENT
*comment ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

*label taphouse_shop_bar
*temp discussed_maura_past false

You step up to the wide oak bar. The lean woman in the bleached wolf-skin vest pauses her wiping of the counter with a clean linen rag, her sharp, assessing eyes taking in your company gear and weapons.

"Welcome to the Drowned Oar, soldier," she says in a calm, smoky voice. "I'm [b]Maura[/b]. If you came off the marsh road with the rest of Vane's outfit, you look like you could use something hot in your ribs. I've got thick mutton pottage bubbling on the grate, smoked river herring, clean spiced cider, and herbal bitters. What'll it be?"

*label taphouse_bar_loop
*choice
  *if (not(has_talia_provisions))
    # Order a bowl of Hot Mutton-and-Marrow Pottage (3 Copper Bits)@{show_stat_hints  [Restore 3 HP, +1 CON Checks for 4h]|}
      *if (((silver * 10) + copper) < 3)
        You don't have enough copper for the pottage.
        *goto taphouse_bar_loop
      *if (not(currency_txn_locked)) or (not(locked_currency_txn_page_id = choice_page_id))
        *set copper - 3
        *label balance_stew_coin
        *if (copper < 0)
          *set copper + 10
          *set silver - 1
          *goto balance_stew_coin
        *set currency_txn_locked true
        *set locked_currency_txn_page_id choice_page_id
      *if (hp_current < hp_max)
        *set hp_current + 3
        *if (hp_current > hp_max)
          *set hp_current hp_max
      *set meal_buff_active true
      *set meal_buff_name "Mutton Pottage"
      *set meal_buff_desc "+1 CON Checks"
      *set meal_buff_stat "con"
      *set meal_buff_bonus 1
      *set meal_buff_minutes_left 240
      Maura ladles a steaming wooden bowl of thick mutton stew loaded with barley, root vegetables, and rich marrow broth, sliding a wooden spoon across the bar. 
      
      You eat it right at the counter, the dense, savory broth spreading deep heat through your chest and limbs, completely banishing the road chill from your muscles.
      [b][🍲 Hot Meal Consumed: Restored 3 HP | Fortified Stamina (+1 CON Checks for 4 Hours) | HP: ${hp_current} / ${hp_max}][/b]
      *goto taphouse_bar_loop

  # Order a mug of Hot Spiced River Cider (2 Copper Bits)@{show_stat_hints  [+1 WIS Checks for 4h]|}
    *if (((silver * 10) + copper) < 2)
      You don't have enough copper for the cider.
      *goto taphouse_bar_loop
    *if (not(currency_txn_locked)) or (not(locked_currency_txn_page_id = choice_page_id))
      *set copper - 2
      *label balance_cider_coin
      *if (copper < 0)
        *set copper + 10
        *set silver - 1
        *goto balance_cider_coin
      *set currency_txn_locked true
      *set locked_currency_txn_page_id choice_page_id
    *set meal_buff_active true
    *set meal_buff_name "Spiced River Cider"
    *set meal_buff_desc "+1 WIS Checks"
    *set meal_buff_stat "wis"
    *set meal_buff_bonus 1
    *set meal_buff_minutes_left 240
    Maura draws a foaming earthenware mug from the kettle simmered on the hearth embers, the fragrant steam carrying scents of dried clove, wild ginger, and orchard honey.
    
    The hot cider warms your throat and clears the dull fog of the road from your mind, sharpening your focus and senses.
    [b][🍎 Spiced Cider Consumed: Clearheaded Focus (+1 WIS Checks for 4 Hours)][/b]
    *goto taphouse_bar_loop

  # Order a trencher of Smoked Peat-Herring & Rye Bread (3 Copper Bits)@{show_stat_hints  [Restore 1 HP, +1 STR Checks for 4h]|}
    *if (((silver * 10) + copper) < 3)
      You don't have enough copper for the herring.
      *goto taphouse_bar_loop
    *if (not(currency_txn_locked)) or (not(locked_currency_txn_page_id = choice_page_id))
      *set copper - 3
      *label balance_herring_coin
      *if (copper < 0)
        *set copper + 10
        *set silver - 1
        *goto balance_herring_coin
      *set currency_txn_locked true
      *set locked_currency_txn_page_id choice_page_id
    *if (hp_current < hp_max)
      *set hp_current + 1
    *set meal_buff_active true
    *set meal_buff_name "Smoked Peat-Herring"
    *set meal_buff_desc "+1 STR Checks"
    *set meal_buff_stat "str"
    *set meal_buff_bonus 1
    *set meal_buff_minutes_left 240
    Maura slides a wooden trencher across the counter bearing two salted river herring cured over fragrant peat smoke, accompanied by coarse stoneground mustard and a thick slice of dense rye bread.
    
    The oily, mineral-rich fish and hearty grain provide solid, enduring fuel for working muscles.
    [b][🐟 Smoked Fish Consumed: Restored 1 HP | Sustained Muscle (+1 STR Checks for 4 Hours) | HP: ${hp_current} / ${hp_max}][/b]
    *goto taphouse_bar_loop

  # Order a dram of Old Marches Herbal Bitters (2 Copper Bits)@{show_stat_hints  [+1 CHA Checks for 4h]|}
    *if (((silver * 10) + copper) < 2)
      You don't have enough copper for the bitters.
      *goto taphouse_bar_loop
    *if (not(currency_txn_locked)) or (not(locked_currency_txn_page_id = choice_page_id))
      *set copper - 2
      *label balance_bitters_coin
      *if (copper < 0)
        *set copper + 10
        *set silver - 1
        *goto balance_bitters_coin
      *set currency_txn_locked true
      *set locked_currency_txn_page_id choice_page_id
    *set meal_buff_active true
    *set meal_buff_name "Herbal Bitters"
    *set meal_buff_desc "+1 CHA Checks"
    *set meal_buff_stat "cha"
    *set meal_buff_bonus 1
    *set meal_buff_minutes_left 240
    Maura unbungs a dark clay decanter and pours a single iron-thimble measure of dark, pungent liquor. "Careful," she grins. "Distilled out of wormwood and wild angelica by the mountain rangers."
    
    You toss the measure back. A jolt of blistering, herbal fire hits the back of your throat, rushing warmth straight into your blood and putting a sharp, confident edge on your posture.
    [b][🥃 Bitters Consumed: Iron Resolve (+1 CHA Checks for 4 Hours)][/b]
    *goto taphouse_bar_loop

  *if (not(discussed_maura_past))
    # Ask about the faded sellsword brand on her neck.
      *set discussed_maura_past true
      Maura glances up, running a thumb over the blurred ink on her throat with a dry, knowing smirk. "Five campaign seasons with the Iron Bull Free Company down in the border marches," she says calmly. "Until a heavy crossbow quarrel through my left knee told me it was time to find dry floorboards. Bought this timber house off an old barge-carpenter ten years back."
      
      She taps the oak bar with a scarred knuckle. "The river's quieter than the shield wall, and nobody shoots at you over the counter—most nights, anyway."
      *goto taphouse_bar_loop

  # Ask about river conditions down to Port Valen.
    Maura rests her forearms on the oak counter, glancing toward the sound of the river rushing past the wharf piles outside. "Thirty miles of open water between here and the capital," she explains in a low, measured tone. "No rapids to speak of, but the current runs fast after the autumn rains, and the spray will soak straight through wool before midday if your cloaks aren't waxed. You'll make good time on the timber barges—just stay out of the river pilots' way and don't drop your iron over the gunwales."
    *goto taphouse_bar_loop

  # Step back from the counter.
    *goto taphouse_menu_hub

*comment ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*comment TAPHOUSE SUB-BRANCH: BONE-DICE TABLE
*comment ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

*label taphouse_dice_table
You walk over to the long hearthside table where Corporal Rorik is sitting with two burly timber-sawyers and a dwarven mill-wright. A leather dice cup clatters rhythmically against the oak table as polished bone cubes roll across a circle of chalk.

"Look who wandered in out of the drizzle!" Rorik chuckles, blowing a plume of fragrant pipe smoke toward the rafters. "Care to risk a few marks on the horn, recruit? Two copper to ante, three dice to beat the high point."

*choice
  *if (((silver * 10) + copper) >= 4)
    # Drop 4 Copper Bits onto the table and take your turn with the leather cup.${hint_taphouse_dice}
      *if (not(currency_txn_locked)) or (not(locked_currency_txn_page_id = choice_page_id))
        *set copper - 4
        *label balance_dice_ante_coin
        *if (copper < 0)
          *set copper + 10
          *set silver - 1
          *goto balance_dice_ante_coin
        *set currency_txn_locked true
        *set locked_currency_txn_page_id choice_page_id
      *set check_stat "dex"
      *set check_dc 11
      *set check_skill "Sleight of Hand"
      *gosub_scene startup roll_d20_check
      *if (check_success)
        *if (not(currency_txn_locked)) or (not(locked_currency_txn_page_id = choice_page_id))
          *set silver + 1
          *set copper + 2
          *set currency_txn_locked true
          *set locked_currency_txn_page_id choice_page_id
        *set alder_wager_won true
        You rattle the leather cup with crisp, rhythmic precision, turning the bones out smoothly onto the chalk circle. The dice tumble to a stop showing two crown-triples—a clean high point!
        
        Rorik bellows with laughter, slapping his thigh as the sawyers groan in good-natured defeat. "Look at that! Clean as a whistle!" The old corporal sweeps the pot of coins across the table into your hands.
        [b][🎲 Dice Wager Won: +1 Silver Mark, +2 Copper Bits][/b]
      *else
        You shake the cup and roll, but the bone cubes bounce erratically across an uneven knothole, landing on an uncoordinated pair of twos. 
        
        Rorik grins, dragging the copper coins toward his pile with a wink. "Better luck on the next cast, recruit. The bones are fickle mistresses."
      *page_break Step back from the table...
      *goto taphouse_menu_hub

  # Shake your head and watch the veterans roll a round before stepping away.
    You raise your hands in good-humored refusal, watching the veterans roll another round while you rest your boots near the warm hearth.
    *goto taphouse_menu_hub

*comment ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*comment TAPHOUSE SUB-BRANCH: BARD PERFORMANCE
*comment ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

*label taphouse_bard_performance
*set check_stat "cha"
*set check_dc 10
*set check_skill "Performance"
*gosub_scene startup roll_d20_check
*if (check_success)
  *if (not(currency_txn_locked)) or (not(locked_currency_txn_page_id = choice_page_id))
    *set silver + 1
    *set copper + 1
    *set currency_txn_locked true
    *set locked_currency_txn_page_id choice_page_id
  You step onto the low hearth bench with your instrument, tuning the strings with a swift, confident flourish before striking into a rhythmic border ballad. 
  
  Within moments, the entire taproom is stomping heavy work boots in rhythm against the floorboards, singing out the chorus over clattering mugs. When you strike the final chord, the room erupts into thundering cheers and tankards banged against tables.
  
  The woman behind the oak counter slides a foaming mug of spiced ale across the bar with a broad, approving grin, and several appreciative watermen toss silver and copper onto the hearth bench!
  [b][🎵 Performance Acclaimed: +1 Silver Mark, +1 Copper Bit | Free Spiced Ale][/b]
*else
  You tune your instrument, but the humidity of the crowded room has slackened your strings. Your opening chord buzzes flat against the wood. A few draymen chuckle, but you recover smoothly enough to finish a quiet tune that earns polite nods from the veterans.
*page_break Step down from the bench...
*goto taphouse_menu_hub
```

---

## Verification Plan

### Automated Tests
- Run ChoiceScript quicktest from root:
  ```powershell
  node quicktest.js
  ```
- Run ChoiceScript randomtest (100 iterations):
  ```powershell
  node randomtest.js iterations=100
  ```
- Recompile standalone HTML:
  ```powershell
  node compile.js
  ```

### Manual Verification
- Verify that Vanguard infantrymen appear in the taproom atmosphere and squad interactions.
- Verify that Maura's tavern menu applies the temporary $+1$ stat check buffs correctly.
- Verify that `calendar.txt` decrements `meal_buff_minutes_left` on action transitions.
- Verify that `roll_d20_check` adds the active meal buff bonus to corresponding stat rolls.
- Verify that `choicescript_stats.txt` displays the active nourishment buff.
- Verify that maximum `lyra_bond` at Alderford reaches at most 32%.
