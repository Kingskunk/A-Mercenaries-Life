# Quest Plan: The Quiet Block (The Fishmongers' Slip)

A small street-scale quest and a working market for **the Fishmongers' Slip**, the fish-market landing in Port Valen's Harbor Quayside. It replaces the Saint Althea shrine stop on the Quayside hub. The quest is a dawn auction where nobody bids: a ring of buyers has agreed on a price, and one boat-widow keeps selling into it.

**Status:** implemented in the game. This file is kept as the design and prose reference, and `quest/QUESTS.md` (Quest 5) is the current summary.

**Already verified.** Every code block in this file was first spliced into a scratch copy of the game (since deleted), then into the real game, and checked: `quicktest` passes with every new line reached, and directed playthroughs with forced dice confirmed the closed hours (Dusk, Night, Storm), the open midday menu with no auction option, all three routes with both outcomes (lawful +3 silver and Watch rep +1 or −1, pragmatic +5 silver, strategic no coin change or the 4-silver forfeit), the study check flags, the greyed-out strategic option under 40 copper, the shunned stall price (4 vs 3 copper), the affordability check, and the post-resolution watch scene. The prose linters (`prose_tics`, `anachronisms`, `weapon_assumption`, `mechanics_leak`, `blank_landing`, `thin_prose`) report nothing new. `lint_choices` notes four compound-condition hubs (the same Keel-style `not((food_buff_active) and …)` pattern) and `lint_vocab_overuse` flags the auction words "lot", "price" and "half circle", which are the subject matter here.

---

## 0. Review Notes (read this first)

1. **What this replaces.** The shrine stop was 15 minutes of atmosphere with no mechanics, and a cathedral is planned for the city. The shrine button, its label, `pv_shrine_seen` and the shrine quest-table row are already removed. The two ambient hub lines about the Tide-Well shrine (`port_valen.txt`, waterfront curfew and church-day lines) stay as scenery. The pier quest's strategic ending now hides Marl and Pip in a net-drying loft above the smokehouses, which is a building on this slip.
2. **Scope.** Rules Section 6 says minor street tasks get a small local reward, no district rewrites and no new systems. So this quest pays in coin, one point of Watch standing, or one ally flag. It does not add gear.
3. **Why a market, not only a quest.** The Keel already sells hot food and drink (CON, STR, CHA and WIS buffs). The Slip sells the two stats the Keel does not (DEX and INT), plus a plain cheap bite. It is also the commoner economy that sits below the sealed-writ counting houses in Upper Wharves (see Section 6).
4. **Names introduced in-story only.** The widow stays "the woman in the salt-stiff smock" until she gives her name. The lead buyer stays "the man in the good gloves" until she names him. The auctioneer and the slip-warden are never named.
5. **Time-gated by design.** The market is open Pre-Dawn to Afternoon. The auction is a Pre-Dawn and Morning event. Dusk, Night, Storm and Blizzard close the slip (boats are hauled and lashed).
6. **The Chart House is not in this plan.** You said it can go into the customs area later. Nothing here depends on it.
7. **Loss state.** The quest has a genuine `"failed"` result, reachable from any of the three routes. A failed roll at the climax never rescues the widow and never pays.

---

## 1. Overview, Cast & Trigger Architecture

### 1.1 Setting & Cast

* **District:** Harbor Quayside, the Fishmongers' Slip (`pv_poi_fish_slip`). Physical layout: a broad ramp of wet granite beside the fish market, an auction block at its head, stalls along the sides, low black smokehouses behind, and a net-drying loft above them.
* **Themes:** who sets a price when nobody bids, the difference between a quiet market and an honest one, and how a stranger can pay for a fair fight.
* **Cast:**
  * **The widow (Wenna Rusk):** forties, salt-stiff smock, hands that do not want to be gentle. Sells the catch of the *Patience*, her late husband's boat, with her teenage son on the sweeps. Direct, tired, not asking for help.
  * **The lead buyer (Thale):** good leather gloves, unhurried. Owns two smokehouses and controls the other two buyers. He does not threaten. He waits.
  * **The auctioneer:** hoarse, hand-bell and slate, keeps the stakes in a tin dish on a post.
  * **The slip-warden:** a heavy man in a Watch-blue surcoat with a scale-pattern badge, eating an onion like an apple. He enforces that inshore catch goes through the block. He is not corrupt, only literal.
* **The three prices.** Fair price for the widow's bass is about **6 silver marks** for three baskets. The ring pays **3**. Her last lot is two baskets of brill worth about **4** silver, and the ring would pay 2.
* **Operating hours:** open Pre-Dawn, Morning, Midday and Afternoon. The auction is Pre-Dawn and Morning. Closed at Dusk, Night, Storm and Blizzard.

### 1.2 The Slip Sub-Hub (`pv_poi_fish_slip` and `pv_poi_fish_slip_menu`)

Same shape as the Iron Wharves and the Pier: `pv_poi_fish_slip` pays the 15-minute entry cost once and prints the arrival vignette, then routes to `pv_poi_fish_slip_menu`. Every exit inside the slip returns to the menu, so the entry cost is never re-paid. The closed check lives in the menu, exactly like the drydock, so a closed slip is a short description and a route back, with no filler choices.

**Edit to the Quayside hub (`port_valen_harbor_pois`):** the shrine button was removed. Add this button in its place, after the pier:

```choicescript
*comment (added to port_valen_harbor_pois, between the pier button and "Move on to the rest of the city.")
  # Follow the smell of brine and woodsmoke down to the Fishmongers' Slip. [~15 min]
    *goto pv_poi_fish_slip
```

```choicescript
*label pv_poi_fish_slip
*set hours_to_pass 0
*set minutes_to_pass 15
*set time_advance_call_id "pv_poi_fish_slip_1"
*gosub_scene calendar advance_time
*gosub_scene calendar recalc_hp_from_neglect

*if (hp_current <= 0)
  *set death_cause "starvation"
  *if (neglect_damage_fatigue > neglect_damage_hunger)
    *set death_cause "exhaustion"
  *goto_scene death death_screen

*if (not(pv_slip_seen))
  *set pv_slip_seen true
  The Fishmongers' Slip is a broad ramp of wet granite that runs down into the harbor beside the fish market, sloped so the inshore boats can be hauled up on rollers and sold off the boards. Scale glitter lies in every crack of the stone. Behind the stalls stand the low black smokehouses, their roofs stained brown by years of smoke, and above them a long net-drying loft with its loading door swinging open to the wind.
*else
  The Fishmongers' Slip again, with brine on the stone and smoke on the wind.

*goto pv_poi_fish_slip_menu

*label pv_poi_fish_slip_menu
*if (((time_period = "Dusk") or (time_period = "Night")) or ((weather = "Storm") or (weather = "Blizzard")))
  *if ((weather = "Storm") or (weather = "Blizzard"))
    Every boat is hauled high and lashed down, and the stalls are boarded over. Spray drives up the ramp in sheets, and a lone fishwife is dragging the last tub of salt into a smokehouse with her shoulder against the door. Nothing is being bought or sold in this.
  *elseif (time_period = "Dusk")
    The stalls are packing down for the night. Fishwives sluice the boards with harbor water while gulls fight over the scraps, and the smokehouse doors are being barred one by one.
  *else
    The slip is dark and empty, the stalls shuttered and the smokehouses barred. The harbor slaps at the foot of the ramp, and high above it the net-loft door creaks on its hinge.
  *page_break Back up to the quayside…
  *goto port_valen_harbor_pois

*if (time_period = "Pre-Dawn")
  Lanterns bob across the harbor as the inshore boats come in on the flood, and crews are already rolling the first of them up the ramp. A slate stands ready on the auction block.
*elseif (time_period = "Morning")
  The block is in full voice, a hand-bell ringing between lots while crews tip their baskets out along the wet stone.
*elseif (time_period = "Midday")
  The block is quiet now. Fishwives work down the stalls with knives and wet straw, and the smokehouse doors stand open on drifting blue smoke.
*else
  The last of the day's catch is being split for salting, and the smokehouses breathe a warm, sweet haze across the ramp.
*if (weather = "Rain")
  Rain runs down the granite in a sheet, carrying scales toward the harbor.
*elseif (weather = "Fog")
  Fog has swallowed the harbor mouth, and boats appear at the foot of the ramp one lantern at a time.
*elseif ((weather = "Snow") or (weather = "Sleet"))
  Sleet ticks off the stall awnings, and the fishwives stamp their boots on trampled straw.
*elseif (weather = "Clear")
  Sun flashes off the scales on the stones, and gulls wheel low over the stalls.

*choice
  *if ((time_period = "Pre-Dawn") or (time_period = "Morning"))
    # Take a place at the rail and watch the auction.
      *goto fish_watch
  # Work down the stalls for something hot to eat.
    *goto pv_poi_fish_stalls
  # Lean against a smokehouse door and listen to the fishwives talk.
    *goto pv_poi_fish_gossip
  # Head back up the ramp to the quayside.
    *page_break Back to the quayside…
    *goto port_valen_harbor_pois
```

### 1.3 The Market (always available while the slip is open)

Food sub-loop, patterned on the Keel's `pv_poi_tavern_bar_loop` (instant and coin-limited, no clock). The Slip covers the two stats the Keel does not, plus a cheap bite with no buff.

| Item | Cost | Effect |
|---|---|---|
| Hot fried smelt on a cabbage leaf | 3 copper | +1 Temp HP, +1 DEX for 4h (food) |
| Oysters shucked to order on a slate | 3 copper | +1 INT for 4h (food) |
| Fish-and-onion pasty | 2 copper | Fills the belly. No buff |

While `fish_slip_shunned` is true (see the loss state), every item costs one copper more.

```choicescript
*label pv_poi_fish_stalls
Stalls line both sides of the ramp, each with a fishwife behind a plank of wet slate, a knife, and a bucket. Steam and the smell of hot oil hang under the awnings.
*if (fish_slip_shunned)
  The fishwives take your coin without meeting your eyes, and the prices are a copper higher than for the woman beside you.
*elseif (wenna_favor)
  Wenna lifts a hand from her stall without looking up from her knife, and a cabbage leaf with something hot on it slides your way across the slate.

*label pv_poi_fish_stalls_loop
*choice
  *if (not((food_buff_active) and (food_buff_stat = "dex")))
    # Buy hot fried smelt on a cabbage leaf (@{fish_slip_shunned 4|3} Copper Bits)@{show_stat_hints  [+1 Temp HP, +1 DEX Checks for 4h]|}
      *set tavern_item_cost_copper 3
      *if (fish_slip_shunned)
        *set tavern_item_cost_copper 4
      *if ((((gold * 100) + (silver * 10)) + copper) < tavern_item_cost_copper)
        You don't have enough copper for the smelt.
        *goto pv_poi_fish_stalls_loop
      *set tavern_item_hp_heal 0
      *set tavern_item_temp_hp 1
      *set tavern_item_type "food"
      *set tavern_item_buff_name "Fried Smelt"
      *set tavern_item_buff_desc "+1 DEX Checks"
      *set tavern_item_buff_stat "dex"
      *set tavern_item_buff_bonus 1
      *set tavern_item_buff_minutes 240
      *gosub_scene startup buy_tavern_item
      The smelt come out of the oil in a brown, spitting heap, and you eat them head and all off the cabbage leaf while the fishwife wipes her knife. Salt and hot fat, and your fingers feel quick again.
      [b][🐟 Fried Smelt Consumed: +1 Temporary HP | Quick Hands (+1 DEX Checks for 4 Hours)][/b]
      *goto pv_poi_fish_stalls_loop
  *if (not((food_buff_active) and (food_buff_stat = "int")))
    # Buy oysters shucked to order on a slate (@{fish_slip_shunned 4|3} Copper Bits)@{show_stat_hints  [+1 INT Checks for 4h]|}
      *set tavern_item_cost_copper 3
      *if (fish_slip_shunned)
        *set tavern_item_cost_copper 4
      *if ((((gold * 100) + (silver * 10)) + copper) < tavern_item_cost_copper)
        You don't have enough copper for the oysters.
        *goto pv_poi_fish_stalls_loop
      *set tavern_item_hp_heal 0
      *set tavern_item_temp_hp 0
      *set tavern_item_type "food"
      *set tavern_item_buff_name "Fresh Oysters"
      *set tavern_item_buff_desc "+1 INT Checks"
      *set tavern_item_buff_stat "int"
      *set tavern_item_buff_bonus 1
      *set tavern_item_buff_minutes 240
      *gosub_scene startup buy_tavern_item
      The shucker pops six shells in the time it takes you to pay, tips the liquor over each with a squeeze of sour green fruit, and watches you swallow them with the pride of a woman who has never sold a bad one. Cold, clean, sharp, and your thoughts line up.
      [b][🐚 Oysters Consumed: Sharp Wits (+1 INT Checks for 4 Hours)][/b]
      *goto pv_poi_fish_stalls_loop
  # Buy a fish-and-onion pasty (@{fish_slip_shunned 3|2} Copper Bits)
    *set tavern_item_cost_copper 2
    *if (fish_slip_shunned)
      *set tavern_item_cost_copper 3
    *if ((((gold * 100) + (silver * 10)) + copper) < tavern_item_cost_copper)
      You don't have enough copper for the pasty.
      *goto pv_poi_fish_stalls_loop
    *set tavern_item_hp_heal 0
    *set tavern_item_temp_hp 0
    *set tavern_item_type "food"
    *set tavern_item_buff_bonus 0
    *gosub_scene startup buy_tavern_item
    The pasty is hot enough to hurt and stuffed with flaked whitefish, onion and pepper, and you eat it walking.
    [b][🥧 Pasty Eaten: Hunger Eased][/b]
    *goto pv_poi_fish_stalls_loop
  # Step away from the stalls.
    *goto pv_poi_fish_slip_menu
```

### 1.4 Gossip (`pv_poi_fish_gossip`)

Repeatable and free. Its lines are keyed to the quest state so the slip always reflects what the player did.

```choicescript
*label pv_poi_fish_gossip
You lean against a smokehouse door frame with your back to the warm planks and let the fishwives talk over their knives.
*if (fish_quest_stage = "unstarted")
  The talk runs to the price of salt, an overdue boat from the northern banks, and one grievance that comes up in three different mouths: bass fetched twice as much at the block last winter. When they get to the reason, all of them turn their heads toward the man in the good gloves at the head of the ramp, and then back to their knives.
*elseif (fish_quest_stage = "active")
  The fishwives have quieted around you. Somebody has seen you talking to the widow, and they are watching to see what you do about it.
*elseif (fish_resolution = "lawful")
  The fishwives are loud again. Three buyers have been struck off the block for the season, and the slip-warden is being bought onions by people who never used to speak to him.
*elseif (fish_resolution = "pragmatic")
  The fishwives keep their voices low while you are near. The half circle at the block still bids by the brim of a cap, and a new face stands in it now.
*elseif (fish_resolution = "strategic")
  The talk is about the morning a stranger put silver in the dish and bid against the smokehouse men. The buyers bid against each other now, and the widow's boy has been seen eating meat.
*else
  *comment fish_quest_stage = "failed"
  The talk stops when you settle against the door. It starts again a few doors down.
*page_break Back to the slip…
*goto pv_poi_fish_slip_menu
```

---

## 2. Complete Narrative Prose Drafts

### Beat 1: The Rail (the auction, observation)

*Reached from `pv_poi_fish_slip_menu` at Pre-Dawn or Morning. Time: 20 minutes on entry. For a quest that is unstarted or active, this leads to the block hub. If the quest is resolved or failed, it prints a short aftermath scene and returns to the menu.*

```choicescript
*label fish_watch
*set hours_to_pass 0
*set minutes_to_pass 20
*set time_advance_call_id "fish_watch_1"
*gosub_scene calendar advance_time
*gosub_scene calendar recalc_hp_from_neglect

*if (hp_current <= 0)
  *set death_cause "starvation"
  *if (neglect_damage_fatigue > neglect_damage_hunger)
    *set death_cause "exhaustion"
  *goto_scene death death_screen

You take a place at the rail along the top of the block. Below it, boats are hauled up the rollers one at a time and their baskets tipped out in a row on the wet stone, and a hoarse auctioneer with a hand-bell and a slate chalks each lot as the crews empty it. A dozen buyers stand in a half circle: smokehouse men in leather aprons and cook-house runners with baskets on their hips.

*if (fish_quest_stage = "resolved")
  *if (fish_resolution = "lawful")
    The slip-warden stands beside the auctioneer with his slate under his arm, and three buyers' places in the half circle are empty. The bidding is loud and quick, and a cook-house runner wins a lot of bass with a whoop that sets the gulls off.
  *elseif (fish_resolution = "pragmatic")
    The half circle is as quiet as ever. A lot of bass comes up, three fingers go to three cap brims, and the bell falls on the price you would expect. One of the brims belongs to you.
  *else
    *comment strategic
    Every lot is fought over. The smokehouse men bid against one another with their hands flicking up, and the man in the good gloves bids as hard as any of them, and does not look in your direction.
  *page_break Back to the slip…
  *goto pv_poi_fish_slip_menu
*if (fish_quest_stage = "failed")
  The half circle is as quiet as ever. A lot of bass comes up, two fingers go to a cap brim, and the bell falls on the price you would expect. Nobody at the rail stands next to you.
  *page_break Back to the slip…
  *goto pv_poi_fish_slip_menu

*if (not(fish_met_wenna))
  The first lot is herring, and it goes the way you would expect. Three buyers bid against one another until the price has climbed a copper past where it started, and the bell falls on a man who wanted them badly.

  The second lot is different. A woman in a salt-stiff smock stands beside three baskets of fat sea bass, silver-bellied and still moving, and the auctioneer calls a price so low that a runner beside you laughs out loud. Nobody bids. A man in good leather gloves, in the middle of the half circle, lifts two fingers to the brim of his cap. The buyer on his left scratches an ear. The buyer on his right looks at his boots. The bell falls on the man in the good gloves, and the price is half of what the herring fetched by the basket.

  The woman counts the coins into a leather purse, twice, and carries the empty baskets down the ramp with her lips pressed white.

  You have seen that trick in a dozen camps. When nobody bids, somebody has already agreed on the price.
*else
  The bidding on the herring is as loud as before. Then the woman in the salt-stiff smock comes back up the ramp with two baskets of brill on a hand-barrow, and the half circle goes quiet as if someone had shut a door.

*goto fish_block_hub
```

### Beat 2: The Half Circle (the block hub)

*The hub never runs out of options: study the hands, talk to the widow, decide, watch more, or leave. The study check is a one-time roll. Success gives the signals; failure alerts the ring.*

| Option | Check | On success | On failure |
|---|---|---|---|
| Study the buyers' hands | `[INT DC 11]` | `fish_saw_signals`: advantage on the pragmatic and strategic routes, and on the lawful route's INT option | `fish_ring_wary`: +1 DC on every route check |
| `[Cantrip: Guidance]` | none | `guidance_active` | (loops back) |

```choicescript
*label fish_block_hub
*temp hint_fish_study ""
*if (show_stat_hints)
  *if (guidance_active)
    *set hint_fish_study " [INT DC 11 (+1d4 Guidance)]"
  *else
    *set hint_fish_study " [INT DC 11]"

*choice
  *if ((((((((((wizard_cantrip = "guidance") or (wizard_cantrip_2 = "guidance")) or (wizard_cantrip_3 = "guidance")) or (bard_cantrip = "guidance")) or (bard_cantrip_2 = "guidance")) or (warlock_cantrip = "guidance")) or (warlock_cantrip_2 = "guidance")) or (race_cantrip = "guidance")) or (race_cantrip_2 = "guidance")) and (not(guidance_active)))
    # [Cantrip: Guidance] Murmur a quiet blessing to steady your eyes and your patience.
      *set guidance_active true
      You breathe out a short divination verse, and the noise of the block seems to draw back a step.
      *goto fish_block_hub
  *if (not(fish_met_wenna))
    # Follow the woman with the empty baskets down the ramp and ask what just happened.
      *goto fish_wenna_talk
  *if (not(fish_study_tried))
    # Study the buyers' hands while the next lot comes up.${hint_fish_study}
      *set fish_study_tried true
      *set check_stat "int"
      *set check_dc 11
      *set check_skill "Read the Half Circle"
      *gosub_scene startup roll_d20_check
      *if (check_success)
        You stop looking at the fish and look at the hands. Two fingers to the cap brim means the lot is his. An ear scratched by the buyer on his left means that man will stay out of it, and so does a glance at the boots from the buyer on his right. Between lots the three of them stand a yard apart and never look at one another, and that is how you know they are talking.
        *set fish_saw_signals true
      *else
        You stare so hard at the half circle that you forget to look like anyone else at the rail. When the bell falls, the man in the good gloves turns his head and finds you. He studies you for the length of one slow breath, then turns back, and the buyers on either side of him shift their weight.
        *set fish_ring_wary true
      *goto fish_block_hub
  *if (fish_met_wenna)
    # Decide what to do about the half circle before the last lot comes up.
      *goto fish_climax_hub
  # Watch another lot go under the bell.
    Another boat comes up the rollers. This time the buyers bid in earnest, hands flicking up and the bell falling twice on a price that climbs a copper at a time. Then a lot of bass from the widow's neighbor comes up, and the half circle goes still. Two fingers to a brim, a scratched ear, a glance at a boot, and the bell falls at half the price. It takes less time than it takes to describe.
    *goto fish_block_hub
  # Step back from the rail.
    *page_break Back down the ramp…
    *goto pv_poi_fish_slip_menu
```

### Beat 3: The Widow (the hook)

*No time cost. Sets `fish_met_wenna` and moves the quest to `"active"`.*

```choicescript
*label fish_wenna_talk
*set fish_met_wenna true
*if (fish_quest_stage = "unstarted")
  *set fish_quest_stage "active"

You catch up with her at the foot of the ramp, where a flat-bottomed skiff sits on its rollers and a boy of about fifteen is scraping scales off the thwarts with the back of a knife. The woman is knotting a cord around her empty baskets with hands that do not want to be gentle.

"You were at the rail," she says, without turning. "You saw."

"I saw nobody bid."

"Nobody ever bids on mine." She pulls the knot tight. "Wenna Rusk. The [i]Patience[/i] is mine, and she was my husband's until he went over the side off the northern banks last spring. Bass goes for twenty coppers a basket on a fair morning. Ten is what I got." She lifts the baskets onto the barrow. "Three dawns running. The boy and I split what is left after the rent on the rollers, and some mornings it is not enough to buy the salt for tomorrow's catch."

"Why sell here?"

"Inshore catch goes through the block. That is the warden's rule, and it is a good one, because it keeps the boats honest." Her mouth twists. "It doesn't keep the buyers honest. That is Thale, in the good gloves. He owns two of the smokehouses, and the other two buyers eat at his table. The warden says a quiet market is no crime, and he is right. There is no law against nobody wanting my fish."

She has two baskets of brill left, held back for the last lot of the morning. She looks at them, and then at you, the way people look at a stranger who has asked one question too many.

"I am not asking you for anything," she says. "But you asked."

*goto fish_block_hub
```

### Beat 4: The Last Lot (the decision hub)

*The three universal resolutions. Each route needs one roll and each roll is the climax of the quest: success resolves it, failure loses it. The strategic route needs four silver marks visible in your purse to lay in the dish; without that the option is shown but greyed out.*

```choicescript
*label fish_climax_hub
The auctioneer lifts his hand-bell. The last lot of the morning is Wenna's two baskets of brill, and the half circle is drifting a step closer together.

*choice
  # Walk to the slip-warden's booth and lay out what you have seen.
    *goto fish_route_lawful
  # Step into the half circle and lift two fingers to your own brow.
    *goto fish_route_pragmatic
  *selectable_if ((((gold * 100) + (silver * 10)) + copper) >= 40) # Put four silver marks in the auctioneer's dish and bid against the ring. [4 Silver Marks]
    *goto fish_route_strategic
  # Step back from the rail and think it over.
    *goto fish_block_hub
```

#### Branch A: The Lawful Route (the slip-warden)

*Time: 25 minutes. Success: `port_watch_rep +1`, 3 silver informant's share, Thale's buyers struck from the block for the season. Failure: `port_watch_rep -1`, `fish_slip_shunned`, quest `"failed"`.*

```choicescript
*label fish_route_lawful
The slip-warden keeps a plank booth at the head of the ramp, with a lantern on a hook, a slate of licence marks, and a fish-scale weight hung on a chain to prove every basket. He is a heavy man in a Watch-blue surcoat, and he is eating an onion the way another man would eat an apple. He looks at you, then at the block, and goes on chewing.

*label fish_lawful_hub
*temp fish_route_dc 12
*if (fish_ring_wary)
  *set fish_route_dc 13
*temp hint_fish_l_int ""
*temp hint_fish_l_cha ""
*if (show_stat_hints)
  *if (guidance_active)
    *set hint_fish_l_int ((" [INT DC " & fish_route_dc) & " (+1d4 Guidance)]")
    *set hint_fish_l_cha ((" [CHA DC " & fish_route_dc) & " (+1d4 Guidance)]")
  *else
    *set hint_fish_l_int ((" [INT DC " & fish_route_dc) & "]")
    *set hint_fish_l_cha ((" [CHA DC " & fish_route_dc) & "]")

*choice
  # Lay out the pattern: the same three buyers, two fingers to a brim, and the same low price on the same seller three dawns running.${hint_fish_l_int}
    *set check_stat "int"
    *set check_dc fish_route_dc
    *set check_skill "Make the Case"
    *if (fish_saw_signals)
      *set advantage true
    *gosub_scene startup roll_d20_check
    *if (check_success)
      *goto fish_lawful_success
    *else
      *goto fish_lawful_fail
  # Stand before him as a witness and make him believe you.${hint_fish_l_cha}
    *set check_stat "cha"
    *set check_dc fish_route_dc
    *set check_skill "Be Believed"
    *gosub_scene startup roll_d20_check
    *if (check_success)
      *goto fish_lawful_success
    *else
      *goto fish_lawful_fail
  # Leave the booth and go back to the rail.
    *goto fish_climax_hub

*label fish_lawful_success
*set hours_to_pass 0
*set minutes_to_pass 25
*set time_advance_call_id "fish_lawful_time"
*gosub_scene calendar advance_time
*gosub_scene calendar recalc_hp_from_neglect

*if (hp_current <= 0)
  *set death_cause "starvation"
  *if (neglect_damage_fatigue > neglect_damage_hunger)
    *set death_cause "exhaustion"
  *goto_scene death death_screen

The warden stops chewing. He comes out of the booth and stands beside you at the rail, and when the last lot comes up he watches the half circle and not the fish. Two fingers to a brim. An ear scratched. A glance at a boot.

"Huh," he says. He takes the chalk from behind his ear and writes three marks on his slate, and when the bell lifts he walks into the half circle and takes the auctioneer by the sleeve. The lot is called again, this time with three buyers' places empty. A cook-house runner bids, then another, and the bell falls on a price that makes Wenna put a hand to her mouth.

The warden fishes a small purse off his belt and counts three silver marks into your palm. "Informant's share of the fine," he says. "It's in the rules. Nobody ever claims it."

*if (not(fish_resolved))
  *set fish_resolved true
  *set fish_quest_stage "resolved"
  *set fish_resolution "lawful"
  *set fish_resolved_day campaign_day
  *set port_watch_rep +1

*if (not(currency_txn_locked)) or (not(locked_currency_txn_page_id = page_id))
  *set currency_add_amount 30
  *gosub_scene startup currency_add
  *set currency_txn_locked true
  *set locked_currency_txn_page_id page_id

[b][⚖ Harbor Standing: Port Watch Rep +1][/b]
*line_break
[b][💰 Informant's Share: +3 Silver Marks][/b]

*page_break Back to the slip…
*goto pv_poi_fish_slip_menu

*label fish_lawful_fail
*set hours_to_pass 0
*set minutes_to_pass 25
*set time_advance_call_id "fish_lawful_fail_time"
*gosub_scene calendar advance_time
*gosub_scene calendar recalc_hp_from_neglect

*if (hp_current <= 0)
  *set death_cause "starvation"
  *if (neglect_damage_fatigue > neglect_damage_hunger)
    *set death_cause "exhaustion"
  *goto_scene death death_screen

The warden hears you out with the onion halfway to his mouth. "Three licensed buyers who did not bid," he says. "That is what you are telling me. Nobody wanted a basket of fish." He wipes his knife on his surcoat. "Here is what I have. A complaint from Master Thale's clerk this morning about a stranger who stares at the block and frightens the crews. I'll put it down as a warning."

He does, in front of you, and the chalk leaves a small hard mark. Down at the block, the bell falls on Wenna's two baskets at the ring's price. Word goes along the stalls faster than you can walk.

*if (not(fish_resolved))
  *set fish_resolved true
  *set fish_quest_stage "failed"
  *set fish_resolution "failed"
  *set fish_resolved_day campaign_day
  *set port_watch_rep -1
  *set fish_slip_shunned true

[b][⚖ Harbor Standing: Port Watch Rep -1][/b]
*line_break
[b][🐟 The Slip Remembers: Stall Prices +1 Copper][/b]

*page_break Back to the slip…
*goto pv_poi_fish_slip_menu
```

#### Branch B: The Pragmatic Route (buy into the ring)

*Time: 25 minutes. Success: 5 silver from the common purse, no standing change, Wenna stops speaking to you (`wenna_favor` stays false). Failure: the ring closes ranks, `fish_slip_shunned`, no coin, quest `"failed"`.*

*The signals matter here. With `fish_saw_signals` you know the code, so the WIS option gets advantage; the CHA bluff does not.*

```choicescript
*label fish_route_pragmatic
At the next lull you step off the rail and into the half circle as if you had every right to be there. The man in the good gloves looks you over from boots to brow, unhurried. Nobody at the Slip knows what you are, and that is the only thing you have going for you.

*label fish_pragmatic_hub
*temp fish_route_dc 12
*if (fish_ring_wary)
  *set fish_route_dc 13
*temp hint_fish_p_cha ""
*temp hint_fish_p_wis ""
*if (show_stat_hints)
  *if (guidance_active)
    *set hint_fish_p_cha ((" [CHA DC " & fish_route_dc) & " (+1d4 Guidance)]")
    *set hint_fish_p_wis ((" [WIS DC " & fish_route_dc) & " (+1d4 Guidance)]")
  *else
    *set hint_fish_p_cha ((" [CHA DC " & fish_route_dc) & "]")
    *set hint_fish_p_wis ((" [WIS DC " & fish_route_dc) & "]")

*choice
  # Introduce yourself as a buyer's agent from upriver, with a purse and a hand that knows the game.${hint_fish_p_cha}
    *set check_stat "cha"
    *set check_dc fish_route_dc
    *set check_skill "Play the Buyer"
    *gosub_scene startup roll_d20_check
    *if (check_success)
      *goto fish_pragmatic_success
    *else
      *goto fish_pragmatic_fail
  # Answer the ring in its own signals, two fingers to your brow at exactly the right moment.${hint_fish_p_wis}
    *set check_stat "wis"
    *set check_dc fish_route_dc
    *set check_skill "Answer the Signals"
    *if (fish_saw_signals)
      *set advantage true
    *gosub_scene startup roll_d20_check
    *if (check_success)
      *goto fish_pragmatic_success
    *else
      *goto fish_pragmatic_fail
  # Back out of the half circle.
    *goto fish_climax_hub

*label fish_pragmatic_success
*set hours_to_pass 0
*set minutes_to_pass 25
*set time_advance_call_id "fish_pragmatic_time"
*gosub_scene calendar advance_time
*gosub_scene calendar recalc_hp_from_neglect

*if (hp_current <= 0)
  *set death_cause "starvation"
  *if (neglect_damage_fatigue > neglect_damage_hunger)
    *set death_cause "exhaustion"
  *goto_scene death death_screen

He lets the moment stretch. Then one corner of his mouth lifts, and he lowers two fingers to his own brim, and the buyer on his left scratches an ear. You are in.

The bell falls on Wenna's two baskets at the ring's price. Afterward, behind the smokehouse wall, Thale opens a purse and counts five silver marks into your hand, the difference from three mornings of low lots, and he does not ask what you want with it. "You see how it goes," he says. "Nobody is hurt. Fish is fish."

Down the ramp, Wenna has stopped tying her baskets. She watches you close your fist over the coins.

*if (not(fish_resolved))
  *set fish_resolved true
  *set fish_quest_stage "resolved"
  *set fish_resolution "pragmatic"
  *set fish_resolved_day campaign_day

*if (not(currency_txn_locked)) or (not(locked_currency_txn_page_id = page_id))
  *set currency_add_amount 50
  *gosub_scene startup currency_add
  *set currency_txn_locked true
  *set locked_currency_txn_page_id page_id

[b][💰 The Ring's Cut: +5 Silver Marks][/b]

*page_break Back to the slip…
*goto pv_poi_fish_slip_menu

*label fish_pragmatic_fail
*set hours_to_pass 0
*set minutes_to_pass 25
*set time_advance_call_id "fish_pragmatic_fail_time"
*gosub_scene calendar advance_time
*gosub_scene calendar recalc_hp_from_neglect

*if (hp_current <= 0)
  *set death_cause "starvation"
  *if (neglect_damage_fatigue > neglect_damage_hunger)
    *set death_cause "exhaustion"
  *goto_scene death death_screen

Your fingers rise a beat late. The buyer on Thale's left frowns. Thale looks at your hand, at your face, and at your hand again. "That is not the signal," he says, mild as milk, and the half circle opens and closes around you like a gate. Two runners take your elbows and walk you back to the rail, so smoothly that nobody at the block turns to look.

The bell falls on Wenna's baskets at the ring's price. When you look for her, she has gone down the ramp, and the smokehouse boys watch you the way you would watch a dog that has bitten someone.

*if (not(fish_resolved))
  *set fish_resolved true
  *set fish_quest_stage "failed"
  *set fish_resolution "failed"
  *set fish_resolved_day campaign_day
  *set fish_slip_shunned true

[b][🐟 The Slip Remembers: Stall Prices +1 Copper][/b]

*page_break Back to the slip…
*goto pv_poi_fish_slip_menu
```

#### Branch C: The Strategic Route (bid against the ring)

*Time: 25 minutes. Success: no coin changes hands (the stake becomes Wenna's price, and a cook-house runner buys the baskets from you at what you paid), `wenna_favor`, and the ring is broken. Failure: the four-silver stake is forfeited and the quest is `"failed"`. `fish_slip_shunned` is not set, because you only lost a bid.*

```choicescript
*label fish_route_strategic
You cross to the auctioneer's dish, a tin plate on a post where bidders lay their stakes, and count four silver marks onto it. The auctioneer's eyebrows climb.

"Stake is kept if the bid fails to close," he says. "That is the rule." He says it loud enough that the half circle turns to look at you all at once, and the man in the good gloves lowers his hand from his brim.

*label fish_strategic_hub
*temp fish_route_dc 12
*if (fish_ring_wary)
  *set fish_route_dc 13
*temp hint_fish_s_wis ""
*temp hint_fish_s_int ""
*if (show_stat_hints)
  *if (guidance_active)
    *set hint_fish_s_wis ((" [WIS DC " & fish_route_dc) & " (+1d4 Guidance)]")
    *set hint_fish_s_int ((" [INT DC " & fish_route_dc) & " (+1d4 Guidance)]")
  *else
    *set hint_fish_s_wis ((" [WIS DC " & fish_route_dc) & "]")
    *set hint_fish_s_int ((" [INT DC " & fish_route_dc) & "]")

*choice
  # Watch the lead buyer's glove instead of the fish, and bid when his hand drops.${hint_fish_s_wis}
    *set check_stat "wis"
    *set check_dc fish_route_dc
    *set check_skill "Outwait the Ring"
    *gosub_scene startup roll_d20_check
    *if (check_success)
      *goto fish_strategic_success
    *else
      *goto fish_strategic_fail
  # Work out what a smokehouse can pay for brill and still make its profit, and bid a copper past it.${hint_fish_s_int}
    *set check_stat "int"
    *set check_dc fish_route_dc
    *set check_skill "Find Their Ceiling"
    *if (fish_saw_signals)
      *set advantage true
    *gosub_scene startup roll_d20_check
    *if (check_success)
      *goto fish_strategic_success
    *else
      *goto fish_strategic_fail
  *if ((((((((((wizard_cantrip = "minor_illusion") or (wizard_cantrip_2 = "minor_illusion")) or (wizard_cantrip_3 = "minor_illusion")) or (bard_cantrip = "minor_illusion")) or (bard_cantrip_2 = "minor_illusion")) or (warlock_cantrip = "minor_illusion")) or (warlock_cantrip_2 = "minor_illusion")) or (race_cantrip = "minor_illusion")) or (race_cantrip_2 = "minor_illusion")))
    # [Cantrip: Minor Illusion] Throw a second bidder's voice from the back of the crowd and let the ring bid against a ghost.
      *set check_stat "int"
      *set check_dc fish_route_dc
      *set check_skill "Throw a Voice"
      *set advantage true
      *gosub_scene startup roll_d20_check
      *if (check_success)
        *goto fish_strategic_success
      *else
        *goto fish_strategic_fail
  # Take your stake back off the dish and return to the rail.
    *goto fish_climax_hub

*label fish_strategic_success
*set hours_to_pass 0
*set minutes_to_pass 25
*set time_advance_call_id "fish_strategic_time"
*gosub_scene calendar advance_time
*gosub_scene calendar recalc_hp_from_neglect

*if (hp_current <= 0)
  *set death_cause "starvation"
  *if (neglect_damage_fatigue > neglect_damage_hunger)
    *set death_cause "exhaustion"
  *goto_scene death death_screen

The price climbs a copper at a time. The man in the good gloves stays in past what the brill is worth, and then his hand drops, and you lift yours. "Sold," the auctioneer says, and the bell falls on you, at four silver marks and not a copper less. It is twice what the ring would have paid.

He slides your stake across the dish into Wenna's purse in one movement. A cook-house runner has been watching the whole thing with his mouth open, and he buys the baskets off you for what you paid before you have decided what to do with them.

Nobody in the half circle looks at you now. The buyers who used to stand a yard apart are standing a yard apart for a different reason. On the next lot, the man to Thale's left bids against him.

*if (not(fish_resolved))
  *set fish_resolved true
  *set fish_quest_stage "resolved"
  *set fish_resolution "strategic"
  *set fish_resolved_day campaign_day
  *set wenna_favor true

[b][🤝 Ally: Wenna Rusk, Fishwife (Will Sell to You First)][/b]

Wenna catches you at the foot of the ramp with a smoked eel wrapped in a cabbage leaf. "I don't know what you are," she says. "I know what you did. When there is a lot worth buying, I will sell it to you before I sell it to anyone."

*page_break Back to the slip…
*goto pv_poi_fish_slip_menu

*label fish_strategic_fail
*set hours_to_pass 0
*set minutes_to_pass 25
*set time_advance_call_id "fish_strategic_fail_time"
*gosub_scene calendar advance_time
*gosub_scene calendar recalc_hp_from_neglect

*if (hp_current <= 0)
  *set death_cause "starvation"
  *if (neglect_damage_fatigue > neglect_damage_hunger)
    *set death_cause "exhaustion"
  *goto_scene death death_screen

The price climbs one copper at a time, past what the brill is worth, past what you laid on the dish, and you stop with your hand in the air. The bell falls on the man in the good gloves at a price barely above what the ring pays. The auctioneer sweeps your stake off the plate with the side of his hand.

"Rule is the rule," he says, not unkindly.

Wenna is standing at the foot of the ramp with her arms crossed. She has watched a stranger pay four silver marks to lose, and it has told her what the ring is worth to fight.

*if (not(fish_resolved))
  *set fish_resolved true
  *set fish_quest_stage "failed"
  *set fish_resolution "failed"
  *set fish_resolved_day campaign_day

*if (not(currency_txn_locked)) or (not(locked_currency_txn_page_id = page_id))
  *set currency_add_amount 0 - 40
  *gosub_scene startup currency_add
  *set currency_txn_locked true
  *set locked_currency_txn_page_id page_id

[b][💰 Stake Forfeited: -4 Silver Marks][/b]

*page_break Back to the slip…
*goto pv_poi_fish_slip_menu
```

---

## 3. Tavern Rumors (The Cleaved Keel)

Pre-seed while the quest is unstarted, then one outcome-specific line. Add these as `*elseif` branches after the What the Bar Keeps branches and before `pv_tavern_rumor_1` in `pv_poi_tavern_rumors`.

```choicescript
*comment Tavern rumor integration in port_valen.txt (pv_poi_tavern_rumors)
*comment Add these as *elseif branches AFTER the What the Bar Keeps branches and BEFORE pv_tavern_rumor_1.
*elseif ((fish_quest_stage = "unstarted") and (not(pv_tavern_rumor_fish)))
  *set pv_tavern_rumor_fish true
  A sawyer with a herring wrapped in a leaf says the bass at the block go for half what they did last winter, and the fishwives have stopped asking why. His friend laughs into his beer. "Ask the smokehouse men why the fish soup is so cheap."
  *page_break The talk moves on…
  *goto pv_poi_tavern_menu
*elseif (((fish_quest_stage = "resolved") or (fish_quest_stage = "failed")) and (not(pv_tavern_rumor_fish_after)))
  *set pv_tavern_rumor_fish_after true
  *if (fish_resolution = "lawful")
    A caulker grins into his cup. "The slip-warden struck three buyers off the block for the season. Bidding is like a cockfight now, and the fishwives are eating meat."
  *elseif (fish_resolution = "pragmatic")
    A drayman shrugs. "Same three at the block, same low prices. There is a new fellow drinking with them these days, and the fishwives spit when he passes."
  *elseif (fish_resolution = "strategic")
    Two porters compare notes over a shared plate. "Somebody put silver in the dish and bid against the smokehouse men. Now they bid honest, and nobody knows who paid the widow."
  *else
    *comment fish_quest_stage = "failed"
    A net-mender turns her mug in her hands. "A stranger went at the smokehouse men and got his hand slapped for it. The whole slip is watching who it sees talking to whom."
  *page_break The talk moves on…
  *goto pv_poi_tavern_menu
```

---

## 4. Technical Specification & Variable Manifest

### 4.1 Required variables in `startup.txt`

Add after `pv_tavern_rumor_bar_after`. Use `*comment` lines for annotations.

```choicescript
*comment --- THE QUIET BLOCK (the Fishmongers' Slip, see quest/FISH_SLIP_PLAN.md) ---
*create pv_slip_seen false
*comment fish_quest_stage: "unstarted", "active", "resolved", "failed"
*create fish_quest_stage "unstarted"
*comment fish_resolution: "none", "lawful", "pragmatic", "strategic", "failed"
*create fish_resolution "none"
*create fish_resolved false
*create fish_resolved_day 0
*create fish_met_wenna false
*create fish_study_tried false
*comment fish_saw_signals: advantage on the routes' checks. fish_ring_wary: +1 DC on every route check.
*create fish_saw_signals false
*create fish_ring_wary false
*comment fish_slip_shunned: set only by a failed lawful or pragmatic route. Every Slip stall charges one copper more.
*create fish_slip_shunned false
*comment wenna_favor: set by the strategic route. Reserved for future wholesale dealing at the slip; read only by the stall prose for now.
*create wenna_favor false
*create pv_tavern_rumor_fish false
*create pv_tavern_rumor_fish_after false
```

### 4.2 Stats sheet integration in `choicescript_stats.txt`

No inventory items. Under CURRENT STATUS, next to the other quest lines:

```choicescript
*comment Under CURRENT STATUS, next to the What the Bar Keeps lines:
*if (fish_quest_stage = "active")
  *line_break
  • [b]Active Quest:[/b] The Quiet Block (The Fishmongers' Slip)
*if (fish_quest_stage = "resolved")
  *line_break
  • [b]Resolved Contract:[/b] The Quiet Block
  *if (fish_resolution = "lawful")
    — [i]The Ring Struck Off the Block[/i]
  *if (fish_resolution = "pragmatic")
    — [i]Bought Into the Ring[/i]
  *if (fish_resolution = "strategic")
    — [i]Outbid at the Block[/i]
*if (fish_quest_stage = "failed")
  *line_break
  • [b]Closed Matter:[/b] The Quiet Block [i](the ring held)[/i]
```

### 4.3 Reference documentation in `quest/QUESTS.md`

Add under *Chapter 3: Port Valen*, after Quest 4 (What the Bar Keeps): a **Quest 5: The Quiet Block** section with the objective flow, the three-resolution table plus the loss state, the variables, and update the Fishmongers' Slip row in the *Harbor POIs* table. Note that the shrine was removed.

### 4.4 Time costs

| Step | Cost |
|---|---|
| Slip entry (once per visit) | 15 min |
| Watching the auction (`fish_watch`) | 20 min |
| Study, talk to the widow, watch more lots, decide | free |
| Any route (success or failure) | 25 min |
| Stalls and gossip | free |

Each `advance_time` call sits on its own page: the entry label, `fish_watch`, and each route's success or fail label are each preceded by a real choice resolution or a `*page_break`.

### 4.5 Replay safety

* Every currency change uses `currency_add_amount` with the `currency_txn_locked` pair, and there is at most one currency change on any page.
* Every rep and state change sits inside `*if (not(fish_resolved))`.
* `fish_study_tried` is set before the roll, so a refresh cannot re-roll the study check.
* The strategic route takes coin only on failure, so a refresh after success can never double-charge.
* `fish_route_dc` and the hint temps are recomputed each time a route hub label is entered.

---

## 5. Design-Rule Check

| Rule | How this quest meets it |
|---|---|
| Organic discovery | Nobody offers the quest. The player sees the quiet bid at the rail and chooses to follow the widow. |
| No badge recognition | Wenna talks to a stranger who asked; nobody reacts to gear, faction or class. |
| Subjective POV / names | Wenna is named by herself, Thale by Wenna. The auctioneer and the warden are never named. |
| Three options at decision hubs | The slip menu has four options at dawn. The block hub has up to five. The decision hub has four (three routes and a step back). Every route hub has three. |
| Archetype parity | INT, CHA and WIS across the routes, with `[Cantrip: Guidance]` and `[Cantrip: Minor Illusion]` represented. |
| Fail-forward (Failure Must Cost Something) | Study failure raises every later DC. A failed climax roll ends the quest as `"failed"` and pays nothing. No failure menu offers a route that could have been taken for free. |
| Genuine loss state | `fish_resolution = "failed"` has its own prose, a stats-sheet line, a rumor, and a lasting cost. |
| Three universal resolutions | Lawful (Watch, +1 rep, 3 silver), Pragmatic (5 silver, moral cost), Strategic (an ally, no coin, a stake at risk). |
| Proportional rewards | 3 to 5 silver against day wages of 2 to 4. A minor street task. |
| Timelessness | Post-resolution prose depends on `fish_resolution`, never on "last night" or "yesterday". |
| Time tiers | 15-minute entry, 20 minutes to watch, 25 per route, everything else free. |
| Weather and time reactivity | The market is closed at Dusk, Night and in storms. Pre-Dawn and Morning have the auction. |
| Mechanics stay in brackets | DCs, stakes and rep changes appear only in hints and banner lines. |
| No weapon or apparel assumption | Uses "brow", "purse", "smock" (the widow's), and no coat or belt items on the player. |
| No modern jargon | No "pilot". Counting words: "count", "price", "lot". |

---

## 6. World Layout Note (the economy layers)

This is here so the trading simulator, the cathedral and the Chart House have somewhere to land:

* **Quayside (physical layer):** warehouses, cranes, the fish market, the Slip. Small lots and day wages.
* **Upper Wharves (paper layer):** counting houses, the Gilded Scales headquarters, letters of credit, contracts. Sealed-writ access.
* **The Pier (sea layer):** hulls, skiffs, and sea travel later. `marl_favor` is reserved for this.
* **`wenna_favor`** is reserved for wholesale dealing at the Slip: buying direct from a boat before the block.
* **Deferred:** the Chart House (tide tables) goes into the customs area later. The Saint Althea shrine's rites move to the cathedral when it is built.

---

## 7. Test Plan

1. `node quicktest.js` after the edits. Every new line should be reached.
2. Directed traces (as done for the earlier quests), forcing rolls high and low:
   * Slip closed at Dusk, Night, Storm and Blizzard, and open Pre-Dawn to Afternoon.
   * Auction option only at Pre-Dawn and Morning.
   * Study success (signals) and failure (wary), each once only.
   * Widow conversation sets `active`.
   * Each route, both outcomes; the DC shows 13 when wary.
   * Payouts in copper: lawful +30, pragmatic +50, strategic success 0, strategic failure −40.
   * `port_watch_rep` +1 (lawful success) and −1 (lawful failure), each exactly once.
   * Strategic option greyed out with under 40 copper.
   * Failed state: stalls charge one copper more; gossip and the Keel rumor show the failed variant.
   * Post-resolution watch scene for each outcome.
3. `refresh_fuzz_test.js` on the new labels, since the study flags feed later checks.
4. Linters on the new block only: `lint_choices`, `lint_prose_tics`, `lint_anachronisms`, `lint_weapon_assumption`, `lint_mechanics_leak`, `lint_blank_landing`, `lint_thin_prose`, `lint_vocab_overuse`.
5. Recompile `play_game.html` at the end.

---

## 8. Decisions to Confirm

1. **Names:** Wenna Rusk, Thale, the *Patience*. Change any you dislike.
2. **The three payouts:** lawful 3 silver and +1 Watch rep, pragmatic 5 silver, strategic no coin plus `wenna_favor`.
3. **The failure costs:** lawful failure −1 Watch rep and stall prices +1 copper, pragmatic failure stall prices +1 copper, strategic failure a 4-silver forfeited stake.
4. **Single-roll climax:** each route is one roll, and losing it ends the quest. The study check is the only softener.
5. **`wenna_favor`:** reserved for wholesale, like `marl_favor` is for sea travel.
