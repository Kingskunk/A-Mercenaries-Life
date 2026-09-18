# Implementation Plan: The Rusty Anchor — The Low-Water Box

**Status:** design spec. Replaces the earlier "Rusty Anchor Shakedown" draft of this file.

**Wiring note:** implemented. The `startup.txt` variable block, the `port_valen_dredge_end` menu entry, the full `port_valen.txt` scene (inserted after `pv_silt_gate_divert_conclude`, before the Harbor POI sub-hub), the `anchor_broker_note` cross-wire into `pv_silt_gate_parley_tally`'s CHA-threat branch, and the `quest/QUESTS.md` sync are all live. This document remains the design record and rationale; the code below is now a snapshot of what shipped, not a spec awaiting wiring.

---

## Why the shakedown draft was scrapped

The old draft failed at the root. Big Sal was written as a **victim** — furniture that gets extorted and then hands over a reward — and every other fault grew out of that one decision.

| Old draft | Why it broke |
|---|---|
| Sal is helpless | She had dockers, coal barges, an arbalest behind the bar, and coin under the counter. Her resources cancelled her fear. |
| "Ten silver marks every flood tide" | At 3 copper a bowl (`port_valen.txt:1656`), that is roughly 66 bowls of broth per day in pure tax. No taphouse can pay it, so the racket could not survive contact with arithmetic. |
| "Bounty as promised" | Sal never promised anything. The player had no offer and no motive. |
| An arbalest heaved onto the counter and held at full draw | Physically impossible, traceable to the Carrion, and it made the extortion retroactively impossible — if she could do that, Riker's first visit would have ended at crossbow-point. |
| 15 silver for winning a brawl | Exceeds the Watch's own 12-silver municipal bounty for breaking a smuggling ring (`port_valen.txt:1945`). |
| Free stew and free bunks, forever | `startup.txt:384-392` says plainly that the mess is ration-capped "so indefinite survival can't be sustained for free forever." |

Two hard defects in that draft must not be reproduced: a `*goto` to `pv_anchor_blunderbuss_rescue` against a label actually named `pv_anchor_arbalest_rescue` (a live crash), and "blunderbuss" — a forbidden firearm under `QUEST_DESIGN_RULES.md` §4, flagged by `tools/lint_anachronisms.js`.

---

## The pitch, in one breath

The Rusty Anchor stands on three sunken barge hulls at the low-water line. The taproom is the cover. Under the middle hull, in a void that only opens at ebb, Big Sal keeps the district's **debt paper** — tally-sticks, notes of hand, water-liens, payoff chits. Not stolen goods. Paper. In a city where the Watch, the Gilded Scales, and the Black Tally all fight over who a person owes, paper is the weapon, and Sal is the neutral keeper all three sides trust. That is why she can never leave Dredge-End, and why her room is worth more than her cash box.

**The shakedown the player walks in on is not a shakedown. It is two business partners having a disagreement in public.**

---

## 1. Big Sal, rebuilt

| As drafted | As designed |
|---|---|
| Passive victim | **A creditor.** She holds paper on half of Dredge-End — including on the man collecting from her. |
| Tells the truth | **Lies by default.** She is a vault-keeper; information is her inventory. She underpays and misdescribes the job, and she is good at it. |
| Has no leverage | Has the only leverage that counts: everyone's signature. She refuses to pay Riker because she **owns** him. |
| Wants thugs removed | Wants the box moved before a lien is stamped and the hulls are pumped and searched. |

The image that carries her whole character: **she tolerates Riker's collections because his collecting services the interest on his own note.** The racket is theatre, performed for the debtors who watch it, so they keep believing the tally-stick is the strongest thing in the district.

**Why the player, specifically:** everyone in Dredge-End owes somebody, so anyone Sal could hire locally is already written down in the box. The Carrion operative is detached from muster, newly landed, and — critically — **not yet an entry in anyone's ledger.** That is the qualification, and it is the same reason Vane picked them.

---
## 2. The object: three layers of reveal

The box pays out in stages, so the quest gets worse the more the player knows.

- **Layer 1 — what Sal says:** "Hull titles. My dockers' indentures. Family things." A lie, and a catchable one.
- **Layer 2 — what is actually in there:** the district's debt paper. Waxed packets, oilcloth-wrapped, each bearing a household the player has already walked past in Dredge-End's ambient prose — the eel-seller who shaves a copper to short her customers, the oar-maker under the shed roof, the tailor's apprentice with two wharf boys trailing him (`port_valen.txt:861, 873, 888`). Plus, **only if the player shook down the Tally's broker in this same district** (`port_valen.txt:1339-1341`), a freshly written note of hand naming the player — because that broker said "we'll remember who lets the water run."
- **Layer 3 — the turn:** a note of hand signed by **Riker**. He is in the box. He has been skimming his own collections to service the interest on his own debt, which is why his tribute never added up, and why Sal has tolerated him.

### Continuity note: why Kray and Pell are not in the box

An earlier pass of this design put Sergeant Kray's and watchman Pell's payoff chits in the box as a cross-quest link. That was wrong and is cut:

1. **They are not Tally paper.** Canon has the smuggling broker bribing them from his own pocket — "six silver marks every Marketday to walk the north quay" (`port_valen.txt:1483`). Nothing establishes that they owe the Tally anything, so filing them in a *debt vault* asserts a creditor relationship the text does not support (narrative_guidelines §4).
2. **They are already arrested in two of three outcomes.** Voss: "I'll have their badges stripped and both of them in the lockup before the midday bell tolls" (`1969`); "I'll have him in irons before noon" (`1982`). Ordering between the two quests is uncontrolled.
3. **Pell is conditional.** When `silt_gate_full_intel` is false the broker only ever gives up Kray's name (`1487`, `1502`, `1518`); Pell is never reachable. Asserting both as settled fact would spoil a live reveal and claim knowledge most playthroughs never earned.

If a Watch thread is wanted, **gate the recognition and never assert the fact.** An unnamed chit — six silver marks a Marketday, north quay — is inert for an uninformed player and electric for an informed one, and it names nobody. It appears in the Layer 2 code below.

## 3. Two clocks, both from existing systems

- **The lien stamps on Forgeday.** `day_of_week = "Forgeday"` is a live variable (`port_valen.txt:432, 879`). The harbor-master's office stamps water-liens on a weekly cycle, so the deadline derives itself from when the player walks in — two days on Greyday, six on Hallowday. No new timer.
- **The tide is the encounter timer.** The void opens at ebb. Each action below the waterline costs 20–40 minutes against the existing clock, and when the water returns it returns while you are inside a dead barge. This reuses the wait-for-the-tide idiom already at `port_valen.txt:941-945`.

## 4. Beat sheet

| Beat | Label | What happens |
|---|---|---|
| 0 | `pv_poi_rusty_anchor` | Entry, 15-minute cost, neglect recalc, death check. First visit prints the discovery. |
| 1 | `pv_anchor_hub` | Living hub: rationed tab, bought bowl, loft, rumours, the hook. |
| 2 | `pv_anchor_low_water` | Sal sits down uninvited. The job, the lie, the fee. |
| 3 | `pv_anchor_ebb_wait` | The window. Wait for the ebb, or go now. |
| 4 | `pv_anchor_bilge` | The descent. Five approaches, the sounding-man above, water rising. |
| 5 | `pv_anchor_the_box` | Layers 2 and 3 land. |
| 6 | `pv_anchor_choice` | Five endings, each faction-costed. |
| 7 | `pv_anchor_aftermath` | Witnesses talk. Tally-sticks on the footbridge. Vane's report hook. |

## 5. Variables index (`startup.txt`)

```choicescript
*comment --- THE RUSTY ANCHOR / THE LOW-WATER BOX ---
*create anchor_quest_stage "unstarted"       *comment "unstarted", "offered", "active", "resolved", "declined"
*create anchor_quest_resolved false          *comment one-time completion guard
*create anchor_bounty_claimed false          *comment one-time fee guard
*create anchor_route "none"                  *comment "sal", "watch", "scales", "kept", "burned", "walked"
*create anchor_cellar_read "none"            *comment "sounding_line" | "missed"
*create anchor_lie_caught false              *comment WIS insight in pv_anchor_low_water
*create anchor_sal_trust 0                   *comment 0-2 -- how much Sal has told you
*create anchor_descent "none"                *comment "forced", "threaded", "surveyed", "talked", "arcaned"
*create anchor_descent_failed false          *comment the box went into the silt
*create anchor_sounding_man "none"           *comment "evaded", "recruited", "dropped", "warned"
*create anchor_tab_unlocked false            *comment Sal's tab and loft, all five endings do NOT grant this
*create anchor_fee_paid false                *comment the two/three silver fee was actually collected
*create anchor_broker_note false             *comment set by the existing silt-gate broker shakedown
*create anchor_fee 2                         *comment 2 or 3 -- set at the offer or the haggle
*create anchor_ebb_ready false               *comment waited for low water vs. went in early
*create anchor_watch_chit_recognized false   *comment gated on silt_gate_full_intel, never asserted
*create anchor_knows_riker_note false        *comment found Layer 3
*create anchor_knows_second_void false       *comment read the sprung stern before stepping on it
*create anchor_rumor_1 false                 *comment one-shot taproom rumours
*create anchor_rumor_2 false
*create anchor_tally_grudge false            *comment the district remembers
*create anchor_district_rumor "none"         *comment "none", "witchmarked", "hired_blade", "quiet"
*create anchor_deposit 0                     *comment coin held behind the bar, safe from thieves
*create anchor_stew_used 0                   *comment free tab -- rationed, mirrors the mess hall
*create anchor_stew_week_start_day 0
*create anchor_stew_cap 3
```

## 6. Full narrative prose & ChoiceScript specification

```choicescript
*comment ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*comment DREDGE-END POI: THE RUSTY ANCHOR
*comment ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

*label pv_poi_rusty_anchor
*set hours_to_pass 0
*set minutes_to_pass 15
*set time_advance_call_id "pv_poi_anchor_1"
*gosub_scene calendar advance_time
*gosub_scene calendar recalc_hp_from_neglect

*if (hp_current <= 0)
  *set death_cause "starvation"
  *if (neglect_damage_fatigue > neglect_damage_hunger)
    *set death_cause "exhaustion"
  *goto_scene death death_screen

*if (anchor_cellar_read = "none")
  *goto pv_anchor_first_visit
*else
  *goto pv_anchor_hub


*comment Beat 0: the discovery. The player is not told anything here -- they
*comment are shown two men who aren't drinking and one man measuring the water
*comment under a taproom floor. Everything about the Tally's real interest in
*comment this building has to be inferred from that single image.
*label pv_anchor_first_visit
*set anchor_cellar_read "sounding_line"
[b]◈ THE RUSTY ANCHOR[/b]
*line_break
You push through the tarred doorflap and the floor moves under you before you have taken two steps inside. The Anchor stands on three sunken barge hulls lashed bow to stern, and the river has never once let them forget it.

The air is thick with boiling fish heads, wet rope, and peat smoke. A dozen carters and draymen sit along the long cedar tables with their hands flat on the wood, and nobody is talking.

Two men at the corner table wear notched black tally-sticks through their belts and have no ale in front of them. A third stands at the open cellar hatch with a knotted sounding-line paid out through one fist, hand over hand, watching the water climb the cord. Every few feet he pinches a knot and marks it with his thumbnail—the way a man measures a thing he means to come back for.

Nobody measures the water under a taproom floor.

Behind the low counter stands Big Sal: broad across the shoulders, hair gone salt and tied back with sail-twine, forearms mapped with old rope-burns. Her right hand rests on a broad butcher's cleaver buried two inches in the chopping block. Her eyes come up, find you, and do not move to the tally-sticks. They stay on you, counting.
*goto pv_anchor_hub


*label pv_anchor_hub
[b]◈ THE RUSTY ANCHOR[/b]
*line_break
The floor rolls with the tide under the pilings, and the hatch boards are pinned flat again. Carters argue wages across the long tables, and the smell of the pot never quite leaves the room.

*comment Weekly rollover for the free tab -- the same rolling-7-day shape as
*comment pv_mess_rations_used/pv_mess_week_start_day in port_valen_hub. A
*comment finished quest must not switch the hunger clock off; see
*comment startup.txt:384-392 for why that cap exists at all.
*if ((campaign_day - anchor_stew_week_start_day) >= 7)
  *set anchor_stew_used 0
  *set anchor_stew_week_start_day campaign_day

*comment Both the tab and the loft are gated on anchor_tab_unlocked -- earned
*comment only by giving the box back to Sal (pv_anchor_choice) -- not on
*comment anchor_quest_stage alone. This is the fix for the gap the review
*comment caught: as first drafted, neither option checked anchor_tab_unlocked
*comment at all, so every player got the free room from the first visit
*comment regardless of outcome, which directly contradicted Section 7's own
*comment "only the Sal route grants the tab" and undercut the whole point of
*comment gating a sleep-quality tier behind it (see resolve_sleep).
*if (anchor_tab_unlocked) and (anchor_stew_used >= anchor_stew_cap)
  Sal has drawn your share off the tab this week, and she makes a point of not looking at the pot when you come in.

*choice
  *if (anchor_tab_unlocked) and (anchor_stew_used < anchor_stew_cap)
    # Take your bowl off the tab. [~30 min]
      *set hours_to_pass 0
      *set minutes_to_pass 30
      *set time_advance_call_id "pv_anchor_stew_1"
      *gosub_scene calendar advance_time
      *if (not(stat_bump_locked)) or (not(locked_stat_bump_page_id = choice_page_id))
        *set minutes_since_meal 0
        *set hunger_stage "Fed"
        *set anchor_stew_used + 1
        *set stat_bump_locked true
        *set locked_stat_bump_page_id choice_page_id
      *gosub_scene calendar recalc_hp_from_neglect
      *if (hp_current <= 0)
        *comment The meal above already zeroed the hunger side, so a death
        *comment here is unambiguously fatigue, not hunger.
        *set death_cause "exhaustion"
        *goto_scene death death_screen
      Sal fills a wooden bowl from the pot without being asked and sets it down with two heel-ends of loaf. It is thick, hot, and heavily salted, and it is the first thing you have eaten in Dredge-End that somebody else paid for.
      *page_break Return to the taproom…
      *goto pv_anchor_hub

  # Buy a bowl the honest way. [3 Copper Bits]
    *set tavern_item_cost_copper 3
    *set tavern_item_type "food"
    *gosub_scene startup buy_tavern_item
    *page_break Return to the taproom…
    *goto pv_anchor_hub

  *if (anchor_tab_unlocked)
    # Take the cot up in the loft. [~4 Hours]
      *set hours_to_pass 4
      *set minutes_to_pass 0
      *set time_advance_call_id "pv_anchor_rest_1"
      *gosub_scene calendar advance_time
      *if (hp_current <= 0)
        *set death_cause "starvation"
        *if (neglect_damage_fatigue > neglect_damage_hunger)
          *set death_cause "exhaustion"
        *goto_scene death death_screen
      *comment resolve_sleep clears the fatigue debt, updates the routine
      *comment tracker, and grants this location's sleep-quality buff in one
      *comment call (see calendar.txt). The loft is a private room Sal handed
      *comment over herself -- sleep_is_shared false, one stat tier, same
      *comment shape as a future paid inn room, distinct from the compound's
      *comment shared/capped barracks.
      *set sleep_location_id "rusty_anchor_loft"
      *set sleep_is_shared false
      *set sleep_tier_name "Sal's Loft"
      *set sleep_tier_stat1 "wis"
      *set sleep_tier_bonus1 1
      *set sleep_tier_stat2 "none"
      *set sleep_tier_bonus2 0
      *gosub_scene calendar resolve_sleep
      You climb the ladder to the timber loft and lie down on a straw mattress under cedar shingles. The canal moves under the hulls, and the hulls move under you, and for the first time since Port Valen the quiet is actually yours.
      *page_break Wake and climb back down…
      *goto pv_anchor_hub

  # Sit at the end of the long table with your back to the wall.
    *goto pv_anchor_rumors

  *if (anchor_quest_stage = "unstarted")
    # Ask Sal why a man would measure the water under her floorboards.
      *set anchor_quest_stage "offered"
      *goto pv_anchor_low_water

  # Step back out onto the Dredge-End duckboards.
    *page_break Back to the water-lanes…
    *goto port_valen_dredge_end


*label pv_anchor_rumors
You take the end of the long table with your back to the wall, the way somebody taught you once, and let the room talk over the top of you.

*if (not(anchor_rumor_1))
  *set anchor_rumor_1 true
  *set codex_black_tally true
  A carter two benches down is explaining water-liens to a boy with a barrow, slowly, the way you explain a thing that has already been decided. "Tally holds the paper, harbor-master holds the stamp, and the two of them hold each other. You want to know who runs this quarter, don't look at the boats. Look at who keeps the book."

  The boy asks what happens if nobody signs. The carter drinks, and does not answer.

*if (not(anchor_rumor_2))
  *set anchor_rumor_2 true
  A dredge-woman nursing a mug tilts her head at the counter without looking at it. "Sal's been on that hull since before the Tally had a tally. She don't scare and she don't pay. Ask yourself how a woman with one pot and three hulls says no to men with sticks."

*page_break The talk moves on…
*goto pv_anchor_hub


*label pv_anchor_low_water
*set hours_to_pass 0
*set minutes_to_pass 10
*set time_advance_call_id "pv_anchor_offer_1"
*gosub_scene calendar advance_time

Sal comes round the end of the counter with a cup in each hand and sits down across from you without being asked. In a room this quiet, that is its own kind of announcement. Two heads at the nearest table turn, take her measure, and decide to study the wall instead.

"You counted the exits," she says. "I watched you do it. Twice this week a stranger has stood in my room and I couldn't tell you their business. The other one is measuring my water."

She sets the cup down in front of you. It is not a friendly gesture. It is a transaction being opened.

"There's a box under the middle hull. I want it out of this building before the harbor-master's clerk stamps a water-lien on these boards. Clerks stamp on Forgeday, because clerks do everything on one day and call it law." She turns her own cup a quarter turn, watching the ring it leaves. "Once that stamp's down, he can pump my bilges and send a surveyor in with a lamp and a writ, and every ledger in this quarter gets read out loud in a customs office."

"Two silver marks when the box is on dry boards. Not my friendship. Coin."

She drinks, and looks at you over the rim of the cup.

"Nothing in it but my own paper. Hull titles, my dockers' indentures, family things."

*comment That last line is the scene. Catching the lie is the difference between
*comment going down there informed and going down there used -- the same
*comment principle as Section 4's "never invent a callback": the player should
*comment only ever know what they actually looked at.
*temp hint_anchor_insight ""
*if (show_stat_hints)
  *if (guidance_active)
    *set hint_anchor_insight " [WIS DC 12 (+1d4 Guidance)]"
  *else
    *set hint_anchor_insight " [WIS DC 12]"

*choice
  # Watch her hands while she says it.${hint_anchor_insight}
    *set check_stat "wis"
    *set check_dc 12
    *set check_skill "Insight"
    *gosub_scene startup roll_d20_check
    *if (check_success)
      *set anchor_lie_caught true
      *set anchor_sal_trust +1
      She keeps her right hand flat on the table the whole way through it. When she gets to *family things*, the thumb comes up off the wood, and comes back down.

      You have known quartermasters with cleaner tells, and none of them were selling you anything.

      "Hull titles and indentures," you say. "That's a light box. You wouldn't need a stranger for it, and you wouldn't pay two silver to move it twenty feet."

      Sal looks at you for a while with nothing at all on her face, which is the most honest thing she has done since she sat down.

      "No," she says at last. "You wouldn't." She finishes the cup, sets it down square, and drops her voice until it is underneath the room. "It's paper. Debts. Every note of hand in this quarter is in that box, and about half of Dredge-End would like a look inside it. I keep it because I'm the only one all three sides will let keep it. That's the whole of my life, so now you know."

      "Two silver is still the fee. But for two silver you can know what you're standing in." She stands up. "Low water. The hatch only opens when the river gets bored."
    *else
      *set anchor_lie_caught false
      She tells it flat, watching the room instead of you, and the words come out as dull as a manifest. Nothing in her face moves that you could name. Half the people you have ever taken coin from have lied to you exactly like this, and you have never once caught it.

      "Hull titles," you say, and drink. It tastes of river water and scorched peat. "Low water, then."
    *goto pv_anchor_ebb_wait

  # Take the fee and the job as offered.
    *set anchor_sal_trust 0
    "Hull titles," you say. "Low water. Two silver."
    Sal nods once and stands, and as far as she is concerned the transaction is now closed.
    *goto pv_anchor_ebb_wait

  # Tell her you don't carry boxes you haven't opened.
    *goto pv_anchor_haggle

  # Tell her you're not for hire, and go.
    *set anchor_quest_stage "declined"
    *set anchor_route "walked"
    "Find another hand," you say, and set the cup back on her counter untouched.

    Sal does not argue and does not look up from wiping the ring of water off the wood. Whatever she meant to pay a stranger for, she will find someone else to pay it to, and someone in this quarter will remember that she had to.

    *page_break Back to the water-lanes…
    *goto port_valen_dredge_end


*label pv_anchor_haggle
"I don't move cargo I haven't looked at," you say. "Open it in front of me or find another hand."

Sal laughs once, through her nose, with no warmth in it at all. "Then you'd know what I'm carrying, and I'd know you know. That is worse for both of us." She leans back and looks at you the way she looked at the tally-sticks. "Three silver, and I tell you what the box is. Or two, and you find out the way I found out."

*choice
  # Take the three silver and whatever truth she's willing to sell.
    *set anchor_fee 3
    *set anchor_sal_trust +1
    *set anchor_lie_caught true
    "Three silver," you say, and Sal nods, and pays herself the difference in honesty.

    "It's paper," she says, low. "Debts. Notes of hand, tallies, liens — every promise anybody in this quarter ever made to anybody. I keep it because I'm the only one the Watch, the Scales, and the Tally will all let keep it." She turns the cup a quarter turn, watching the ring it leaves. "And there's one page in it I don't like to think about, which is why I want it off this hull before a clerk puts a stamp on my boards."

    *goto pv_anchor_ebb_wait

  # Take the two and stop asking.
    *set anchor_sal_trust 0
    "Two, then," you say, and let it go, and Sal's shoulders come down a finger's width.

    *goto pv_anchor_ebb_wait

*label pv_anchor_ebb_wait
The ebb runs late this week.

You sit with it a while. Outside, the water in the cut drops by fingers, and the duckboards stop knocking against the pilings. In the taproom the two tally-stick men finish their business and leave without drinking, and the sounding-man coils his line and marks the hatch boards with a stub of chalk before he goes.

*if (day_of_week = "Forgeday")
  A clerk's runner works along the plank-walk with a leather satchel and a brass stamp on his belt. The stamp is on Forgeday. Forgeday is today.
*else
  The harbor-master's clerk stamps liens on Forgeday, and the week has to get there first.

*comment The deadline derives itself from day_of_week rather than a new timer —
*comment the clerk's stamp day is already established canon (port_valen.txt:432, 879).
*choice
  # Wait for the water to drop properly. [~3 Hours]
    *set hours_to_pass 3
    *set minutes_to_pass 0
    *set time_advance_call_id "pv_anchor_ebb_1"
    *gosub_scene calendar advance_time
    *gosub_scene calendar recalc_hp_from_neglect
    *if (hp_current <= 0)
      *set death_cause "starvation"
      *if (neglect_damage_fatigue > neglect_damage_hunger)
        *set death_cause "exhaustion"
      *goto_scene death death_screen
    You sleep in pieces on the loft cot, waking each time a hull shifts under you. By the low watch the canal has drawn down far enough to show black weed on the pilings at chest height, and the hatch boards come up under their iron ring without a sound.
    *set anchor_ebb_ready true
    *goto pv_anchor_bilge

  # Go down now, while the Tally's man is out of the room.
    *comment Going early buys time and costs safety — his chalk mark is still on
    *comment the boards, and he will be back for it.
    *set anchor_ebb_ready false
    *goto pv_anchor_bilge


*label pv_anchor_bilge
The hatch opens onto a ladder and a smell like old rope and cold iron.

Under the taproom floor there is a space that should not be there. The middle hull has been gutted stem to stern and re-ribbed in good oak, and the void between the new ribs and the old planking is dry — for now. A foot of black water moves across the bottom boards, breathing in and out with the cut outside. The air is thick enough to chew.

The box sits on a timber cradle at the far end. Iron-banded. Longer than a man's arm.

*if (anchor_ebb_ready)
  You have perhaps half an hour of floor before the water starts back. You can hear it working already, ticking at the planking.
*else
  The water is still high. It laps the second rib and it is climbing, and somewhere above you the iron ring of the hatch is no longer where you left it.

*temp hint_anchor_str ""
*temp hint_anchor_dex ""
*temp hint_anchor_int ""
*temp hint_anchor_cha ""
*temp hint_anchor_hand ""
*temp hint_anchor_light ""
*temp hint_anchor_thaum ""
*if (show_stat_hints)
  *if (guidance_active)
    *set hint_anchor_str " [STR DC 13 (+1d4 Guidance)]"
    *set hint_anchor_dex " [DEX DC 13 (+1d4 Guidance)]"
    *set hint_anchor_int " [INT DC 13 (+1d4 Guidance)]"
    *set hint_anchor_cha " [CHA DC 13 (+1d4 Guidance)]"
    *set hint_anchor_hand " [INT DC 11 (+1d4 Guidance)]"
    *set hint_anchor_light " [WIS DC 11 (+1d4 Guidance)]"
    *set hint_anchor_thaum " [CHA DC 12 (+1d4 Guidance)]"
  *else
    *set hint_anchor_str " [STR DC 13]"
    *set hint_anchor_dex " [DEX DC 13]"
    *set hint_anchor_int " [INT DC 13]"
    *set hint_anchor_cha " [CHA DC 13]"
    *set hint_anchor_hand " [INT DC 11]"
    *set hint_anchor_light " [WIS DC 11]"
    *set hint_anchor_thaum " [CHA DC 12]"

*choice
  # Shoulder the fallen rib aside and go down the middle of the hull.${hint_anchor_str}
    *set hours_to_pass 0
    *set minutes_to_pass 30
    *set time_advance_call_id "pv_anchor_descent_str_1"
    *gosub_scene calendar advance_time
    *set check_stat "str"
    *set check_dc 13
    *set check_skill "Athletics"
    *gosub_scene startup roll_d20_check
    *set anchor_descent "forced"
    *if (check_success)
      *goto pv_anchor_box_reached
    *else
      *goto pv_anchor_descent_botched

  # Thread the flooded ribs without a lamp and come at the box from the side.${hint_anchor_dex}
    *set hours_to_pass 0
    *set minutes_to_pass 40
    *set time_advance_call_id "pv_anchor_descent_dex_1"
    *gosub_scene calendar advance_time
    *set check_stat "dex"
    *set check_dc 13
    *set check_skill "Stealth"
    *gosub_scene startup roll_d20_check
    *set anchor_descent "threaded"
    *if (check_success)
      *goto pv_anchor_box_reached
    *else
      *goto pv_anchor_descent_botched

  # Read the hull first: the sounding-man's chalk marks and the repair scars in the oak.${hint_anchor_int}
    *set hours_to_pass 0
    *set minutes_to_pass 20
    *set time_advance_call_id "pv_anchor_descent_int_1"
    *gosub_scene calendar advance_time
    *set check_stat "int"
    *set check_dc 13
    *set check_skill "Investigation"
    *gosub_scene startup roll_d20_check
    *set anchor_descent "surveyed"
    *if (check_success)
      *set anchor_knows_second_void true
      *goto pv_anchor_box_reached
    *else
      *goto pv_anchor_descent_botched


  # Walk up to the hatch like you belong to the surveyor's office and put the Tally's man to work.${hint_anchor_cha}
    *set hours_to_pass 0
    *set minutes_to_pass 25
    *set time_advance_call_id "pv_anchor_descent_cha_1"
    *gosub_scene calendar advance_time
    *set check_stat "cha"
    *set check_dc 13
    *set check_skill "Deception"
    *gosub_scene startup roll_d20_check
    *set anchor_descent "talked"
    *if (check_success)
      You come up the plank-walk with a ledger under your arm and the flat, tired face of a man sent to check a number for somebody more important than himself.

      "Second survey," you tell the sounding-man, without stopping. "Clerk's had two lien plats come back short this week, so he wants the middle hull plumbed by a second hand before the stamp goes down. You can hold the line, or you can stand there while I explain to him why I had to do it twice."

      He looks at the ledger, and at your boots, and at the water-mark on the planking, and hands you the line. Then he sets the hatch boards back exactly as he found them and walks off to keep his own name clean, which is the only thing a man in his position actually owns.

      *set anchor_sounding_man "recruited"
      *goto pv_anchor_box_reached
    *else
      He asks, quite reasonably, which clerk. You do not have a name ready, and by the time you have invented one he is already backing toward the door with his hand on the tally-stick at his belt.

      *set anchor_sounding_man "warned"
      *goto pv_anchor_descent_botched

  *if ((((((((((wizard_cantrip = "mage_hand") or (wizard_cantrip_2 = "mage_hand")) or (wizard_cantrip_3 = "mage_hand")) or (bard_cantrip = "mage_hand")) or (bard_cantrip_2 = "mage_hand")) or (warlock_cantrip = "mage_hand")) or (warlock_cantrip_2 = "mage_hand")) or (race_cantrip = "mage_hand")) or (race_cantrip_2 = "mage_hand")))
    # [Cantrip: Mage Hand] Put a spectral hand down the ladder ahead of you and work the cradle pins before you ever go in.${hint_anchor_hand}
      *set hours_to_pass 0
      *set minutes_to_pass 35
      *set time_advance_call_id "pv_anchor_descent_hand_1"
      *gosub_scene calendar advance_time
      *set check_stat "int"
      *set check_dc 11
      *set check_skill "Mage Hand"
      *gosub_scene startup roll_d20_check
      *set anchor_descent "arcaned"
      *if (check_success)
        You kneel at the hatch and send the hand down into the dark, where it works the cradle with the patience of something that cannot get cold or frightened.

        The pins come out one at a time and drop into the bilge with three small, final sounds. When you finally climb down, the box is already sitting loose, and you have not put your weight on a single rotten board.

        *goto pv_anchor_box_reached
      *else
        The hand takes the first pin, drops the second, and rolls the third off the cradle on its own. The box shifts and settles hard into the timber with a knock you feel through the floorboards — and which, two seconds later, comes back to you echoed from somewhere above.

        *goto pv_anchor_descent_botched

  *if ((((((((((wizard_cantrip = "light") or (wizard_cantrip_2 = "light")) or (wizard_cantrip_3 = "light")) or (bard_cantrip = "light")) or (bard_cantrip_2 = "light")) or (warlock_cantrip = "light")) or (warlock_cantrip_2 = "light")) or (race_cantrip = "light")) or (race_cantrip_2 = "light")))
    # [Cantrip: Light] Hang a cold white light on the cradle rail and read the hull before you put a boot on it.${hint_anchor_light}
      *set hours_to_pass 0
      *set minutes_to_pass 25
      *set time_advance_call_id "pv_anchor_descent_light_1"
      *gosub_scene calendar advance_time
      *set check_stat "wis"
      *set check_dc 11
      *set check_skill "Light"
      *gosub_scene startup roll_d20_check
      *set anchor_descent "arcaned"
      *if (check_success)
        You set the light on the cradle rail where the hatch boards will hide it from anyone standing above, and for the first time you can see what is under this building.

        The middle hull is re-ribbed in good oak, and the re-ribbing stops short of the stern by two frames. Past that line the old planking is sprung, and the water has been in and out of it for years, and the grain has gone black and soft as tallow.

        Nobody walks past that line and comes back up the ladder.

        You go along the sound ribs, take the box from the dry side, and are climbing again before the light has finished swinging.

        *set anchor_knows_second_void true
        *goto pv_anchor_box_reached
      *else
        The light goes up clean and bright and shows you a hull you do not have time to read. You step out onto the second rib anyway, and the telltale under your boot gives.

        *goto pv_anchor_descent_botched

  *if ((race_cantrip = "thaumaturgy") or (race_cantrip_2 = "thaumaturgy"))
    # [Cantrip: Thaumaturgy] Grumble the hull and the water like the tide has already turned.${hint_anchor_thaum}
      *set hours_to_pass 0
      *set minutes_to_pass 25
      *set time_advance_call_id "pv_anchor_descent_thaum_1"
      *gosub_scene calendar advance_time
      *set check_stat "cha"
      *set check_dc 12
      *set check_skill "Thaumaturgy"
      *gosub_scene startup roll_d20_check
      *set anchor_descent "arcaned"
      *if (check_success)
        You let the hull speak. It is not a voice and it is not loud — it is the long grinding complaint of oak taking weight it does not want to take, and it comes up through the planks of the taproom and into the bones of everyone standing on them.

        Above you, the sounding-man stops. He knows that sound better than anyone in the district; predicting it is the whole of his job. He coils his line and goes up the plank-walk at a pace that is not quite running, and the two tally-stick men go with him, because none of them wants to be standing on this barge when the water comes back.

        You have the room to yourself.

        *set anchor_sounding_man "dropped"
        *goto pv_anchor_box_reached
      *else
        The hull speaks, and speaks too well. The groan runs up through the timbers and every board in the room answers it, and every man in the room is suddenly and silently certain that the barge is going into the cut.

        It is not the deception you wanted. It is a whole room coming up off the benches at once, shouting, and a Tally sounding-man at the hatch with his chalk in his fist and his eyes on you.

        *set anchor_sounding_man "warned"
        *goto pv_anchor_descent_botched


*label pv_anchor_box_reached
The box comes up the ladder heavier than it looks, and the weight of it tells you what it is before the lid does. Paper does not weigh this much. Paper with wax and oilcloth and a hundred people's names in it does.

You set it down on the taproom floor. Sal puts both hands flat on the bar and looks at it for a while, and then she nods once, and you take the irons off.


*comment Layer 2. The reveal is deliberately built out of households the player has
*comment already walked past in Dredge-End's own ambient prose (port_valen.txt:861,
*comment 873, 888) rather than famous names. The district's small debtors are the
*comment horror here, not a plot twist. See the Section 2 continuity note for why
*comment Kray and Pell are not in this box.
*label pv_anchor_the_box
Inside, in oilcloth packets tied with waxed cord, in an order somebody has been keeping for years: notes of hand.

You read the top few, because they are face up.

An eel-seller's note, one mark eleven copper, four years old, attested by a witness who has since died. An oar-maker's note, two marks, with a margin note in a different hand about a boat he no longer owns. A tailor's apprentice, six copper, on a page so small it must have been cut down from something else. A woman in the water-streets who signs with a mark, because she cannot write her own name.

Half of Dredge-End is in this box. None of it is worth more than a night's drinking. All of it is worth everything to the people named on it.

*if (anchor_broker_note)
  *comment WIRING REQUIREMENT: the existing broker extortion in pv_dredge_silt_gates'
  *comment parley branch (port_valen.txt:1338-1355 -- "we'll remember who lets the
  *comment water run") must set `anchor_broker_note true` in both its success and its
  *comment counter-offer paths. Nothing else in the game reads the flag.
  And under the eel-seller's packet, still soft, in the same hand you watched write in the dark two streets away: a note of hand on a Carrion sellsword, one night's work at the silt gates, twenty-five marks.

  It is the freshest page in the box. Somebody has been keeping the book on you since the night you shook down the Tally's broker.

Wedged between two household packets, on Watch-issue stock: a sergeant's tally-chit, six silver marks a Marketday, north quay. No name anywhere on it.

*if (silt_gate_full_intel)
  *comment Recognition, never assertion -- see the Section 2 continuity note. An
  *comment informed player gets the jolt; an uninformed one gets ominous paper and no
  *comment spoiler. No NPC is named either way, so no Silt-Gate resolution can be
  *comment contradicted and no live reveal is spent.
  Six marks a Marketday, north quay. You have heard that rate before — whispered on a wet stone platform by a man who very much wanted to keep breathing.
  *set anchor_watch_chit_recognized true
*else
  You do not know that rate, or whose column it belongs in, and the fact that it is filed in here at all is the part that matters.

*if (anchor_knows_second_void)
  Sal watches you bring the box up and does not ask how you got it, which means she already knows about the stern frames. "Two more winters," she says. "Maybe three. Then the middle hull goes into the cut, surveyor or no surveyor. That's the real reason I wanted it off the boards and not just out of the water."

And at the bottom, flat, on better paper than everything above it, with a seal:

A note of hand. Signed by Garrick Riker.

You read it twice to be sure of the columns. Forty marks principal, drawn eleven years ago, with interest recorded against it in tidy monthly entries — and every entry for the last four years matches, almost to the copper, what the district's collections are reported to have brought in.

He is not collecting for the Tally. He has been collecting for her, at interest, and taking the difference out of his own reported tallies, and that is why the tribute has never once added up to what he said it would.

*comment The Riker note is Layer 3 and it reframes the whole district: the man
*comment extorting the taphouse is the taphouse's debtor. Set the principal against
*comment the district's small debts (1-2 marks above) so the scale reads, and against
*comment the Watch bounty scale in QUEST_DESIGN_RULES.md §3 so it stays credible for
*comment a mid-tier canal boss rather than a guild magnate.
*set anchor_knows_riker_note true
*set anchor_quest_stage "active"
*goto pv_anchor_choice


*label pv_anchor_descent_botched
It comes apart quietly and badly.

*if (anchor_ebb_ready)
  The water reaches the third rib while you are still working, and what was a foot of slack across the bottom boards becomes a knee, then a waist, moving with purpose. You get one hand on the cradle and lose your footing, and the box goes over the side into the black and sits down in the silt with a soft, final thud you feel through the boards.
*else
  The water is already at your chest when you reach the cradle, and it is not slack water, it is the returning tide and it is working like something with a job to do. You take the first pin and the current takes your feet, and the box goes over the side and sits down in the silt with a soft, final thud you feel through the boards.

You come up the ladder with your arms shaking and nothing to show for it.

*if (anchor_sounding_man = "warned")
  And above you is the Tally's sounding-man, at the head of the hatch, with his chalk in one fist and a tally-stick in the other, having watched you go down into a hull he has spent three days measuring.

  He does not say anything. He looks at you the way a man looks at a number that has finally resolved, and then he walks away up the plank-walk, and you know exactly where he is going.

  *set anchor_tally_grudge true
*else
  Above you, the hatch is closed and the boards are back on it. By the time you get out from under the taproom, whoever put them there is gone.

*if (not(anchor_descent_failed))
  *set anchor_descent_failed true
  Sal is at the bar with a fresh cup and does not look up when you come dripping through the room. She heard the whole thing through the floorboards, the way she hears everything on this barge.

  "You want to tell me you nearly drowned in my cellar for two silver," she says, "or do you want to sit down and dry out first."

  *comment Failing forward, per QUEST_DESIGN_RULES.md §2: the box is not lost as a
  *comment story object -- it is just no longer in the building, which is now a
  *comment different and worse problem for Sal, and the player's first chance to
  *comment learn what was really in it is gone. Cost: hours, health, the fee, and
  *comment whatever the Tally's man decided to do with what he saw.

  *page_break Sit down and dry out…
  *goto pv_anchor_hub


*label pv_anchor_choice
You are kneeling on a wet floor in Dredge-End with half the district's promises open in front of you and a woman watching you decide what they are worth.

*comment Section 3's Mercenary Dilemma, made literal: five exits, each costing
*comment something the player will feel later, and none of them paying twice.
*choice
  # Close the lid and give it back to her.
    *set anchor_route "sal"
    *set anchor_sal_trust +1
    You put the packets back the way you found them, eel-seller on top, close the lid, and slide the box across the boards until it touches her boot.

    Sal looks at it for a long moment. Then she crouches — slowly, because her knees are fifty years old — and puts one hand flat on the lid and stays like that.

    "You didn't read the bottom," she says. It is not a question.
    "I read the bottom."
    "And you put it back."
    "It isn't mine."

    She stands and puts the box behind the bar and does not explain, and does not thank you, because in this quarter thanking somebody is how you start owing them. What she does instead is lift a small iron key off a nail and set it on the wood beside your cup.

    "That's the loft," she says. "Coin you leave with me stays with me, and nobody in this quarter has ever touched what's behind my bar. Eat when you're hungry. Don't make me regret the key."

    She counts the fee out of a tin box under the counter, to the copper, the way a woman pays a debt rather than does a favor.

    *comment Bug fix: the original draft never actually paid this out despite
    *comment Section 7 promising it and anchor_fee_paid existing as a guard.
    *if (not(currency_txn_locked)) or (not(locked_currency_txn_page_id = choice_page_id))
      *set currency_add_amount (anchor_fee * 10)
      *gosub_scene startup currency_add
      *set currency_txn_locked true
      *set locked_currency_txn_page_id choice_page_id

    *set anchor_tab_unlocked true
    *set anchor_fee_paid true
    *goto pv_anchor_aftermath

  # Carry it up to Voss and let the Watch do what the Watch does.
    *set anchor_route "watch"
    You wrap the packets in their own oilcloth, put them under your coat, and climb out of Dredge-End with the whole quarter's paper against your ribs.

    Voss is at the tally-desk under the customs awning with a lamp and a cold cup, the way he is at every hour you have ever seen him, and he does not look surprised to see you.

    He reads for a long time, going back twice to the same name before he's satisfied he read it right the first time. When he reaches Riker's note he lays it flat and puts one finger on the seal, as though it might otherwise get away.

    "A Tally collector skimming his own tribute to cover a debt to the woman he's collecting from," he says, "and half of Dredge-End's paper sitting under a taproom floor the whole time." He looks at you over the sheet. "I've had a man watching that hull for a season on nothing but a hunch. You walked in with the ledger."

    He counts coin out of the strongbox instead of the tally-desk — a smaller sum than the box might suggest a smuggling case is worth, and he says as much while he does it. "The city doesn't have a line item for this. Call it a finder's fee, and my thanks, which costs the treasury nothing and is worth rather more."

    *if (not(currency_txn_locked)) or (not(locked_currency_txn_page_id = choice_page_id))
      *set currency_add_amount 40
      *gosub_scene startup currency_add
      *set currency_txn_locked true
      *set locked_currency_txn_page_id choice_page_id

    *goto pv_anchor_aftermath

  # Sell Riker's note and the household debts to the Scales.
    *set anchor_route "scales"
    The Scales keep a factoring house on the Upper Wharves with clean steps and a brass rail, and a clerk who takes one look at the packets and asks you to wait, and then a factor who does not ask you to wait.

    He does not haggle. He reads, does sums in the margin of a slate, reads again, and names a number that makes the eel-seller's one-mark-eleven note look like exactly what it is: nothing, to him, and everything to her.

    "Distressed paper, bought below face value, from a debtor with no leverage to refuse it." He taps the stack without looking up. "That is the whole of the Scales' business, condensed into one barge cellar. We will collect on every page in here, eventually. All of it."

    You take the coin. He does not ask where the box went. You do not tell him. Both of you understand that the district is about to get quieter and worse, and that neither of you is the one who will have to live in it.

    *if (not(currency_txn_locked)) or (not(locked_currency_txn_page_id = choice_page_id))
      *set currency_add_amount 80
      *gosub_scene startup currency_add
      *set currency_txn_locked true
      *set locked_currency_txn_page_id choice_page_id

    *goto pv_anchor_aftermath

  # Keep it. All of it.
    *set anchor_route "kept"
    You take the packets out of the box one at a time, put them inside your coat, and stand up.

    Sal watches you do it, arms folded, her jaw set hard enough to show the muscle in it, and lets you finish before she speaks.

    "It isn't yours," she says, at last.
    "No," you agree, and put the coat on over it, and leave the empty box on her floor, because the box was never the thing that mattered.

    She does not stop you, and she does not speak to you again that evening, or the next week, or the one after. The pot stays on the fire and the attic stays dry, and none of it is the same as being welcome.

    You walk out with the whole quarter's obligations in your coat, and by the time you reach the footbridge you have begun to understand what you are carrying: not money, and not power exactly, but the ability to decide, for two hundred people you will never meet, whether this week is survivable.

    *goto pv_anchor_aftermath

  # Burn the Tally's ledger in the pot-stove.
    *set anchor_route "burned"
    You carry the collection book to the stove in the corner and lift the ring, and the columns catch quickly, because they are dry and they are old and they have been waiting for somebody to do this for years.

    *if (anchor_knows_riker_note)
      *comment Burning the Tally's ledger and burning Riker's note are different
      *comment acts. The note is Sal's paper, not the Tally's, and the player has
      *comment to decide which pile it belongs on. It stays out.
      You hold Riker's note over the coals as well, and then you stop, and put it back in your coat, because it is not the Tally's paper.

    Two hundred people's worth of obligation goes up in about four minutes, and it smells like any other fire.

    Nobody stops you. Two carters look up, look at each other, and go back to their ale with the studied blankness of men who have decided they did not see anything.

    Sal stands at the bar and watches the paper curl, and does not say a word until the last corner has gone black. Then she says, "You've ruined me," in a voice of complete calm, and begins wiping a counter that is already clean.

    The fee she owes you for the box sits forgotten on the wood between you. She is not going to remember it, and you are not going to remind her. You take it anyway, because the job was still the job.

    *if (not(currency_txn_locked)) or (not(locked_currency_txn_page_id = choice_page_id))
      *set currency_add_amount (anchor_fee * 10)
      *gosub_scene startup currency_add
      *set currency_txn_locked true
      *set locked_currency_txn_page_id choice_page_id

    *goto pv_anchor_aftermath


*label pv_anchor_aftermath
*if (not(anchor_quest_resolved))
  *set anchor_quest_resolved true
  *set anchor_quest_stage "resolved"
  *comment Every faction swing lives inside this once-only guard, per Section 5 and
  *comment Section 13 -- a bare *set rep +/-N on a page that can pause is a replay bug.
  *comment Rescaled down from the original +4/+3/-3 draft -- this is one taphouse's
  *comment debt paper and one corrupt collector, not city governance, so the swings
  *comment sit closer to Silt-Gate's own +1 port_watch_rep than a district-toppling
  *comment reveal would justify. Scales route now also carries the black_tally_rep -1
  *comment the rewards table already promised but the code never actually set.
  *if (anchor_route = "sal")
    *set anchor_tally_grudge true
  *elseif (anchor_route = "watch")
    *set port_watch_rep +2
    *set black_tally_rep -1
    *set anchor_tally_grudge true
  *elseif (anchor_route = "scales")
    *set gilded_scales_rep +2
    *set black_tally_rep -1
    *set anchor_tally_grudge true
  *elseif (anchor_route = "kept")
    *set black_tally_rep +1
    *set anchor_tally_grudge true
  *elseif (anchor_route = "burned")
    *set black_tally_rep -2

It takes the district about four hours to know.

By the time you cross the footbridge, two men with black tally-sticks are standing where no men were standing before, and neither of them is counting boats. One watches you the whole way across and does not pretend otherwise.

*if (anchor_route = "sal")
  Sal carries the consequences before you do. She starts taking her meals standing up, near the hatch, and the loft cot stays made, and when you ask about it she says the Anchor is fine and asks what you think of the price of fish. Whatever Riker does next he will do to her, because she is the one still on the boards at night.
*elseif (anchor_route = "burned")
  The pot keeps boiling and the crowds keep coming, and for about a month the whole quarter is lighter on its feet. Then the collection starts again out of a different doorway, with different men and a cleaner book, because the paper was never the part that wanted the money.
*elseif (anchor_route = "kept")
  Nobody comes for you, and nobody has to. The tally-sticks get counting again, and the notes of hand start moving in your name instead of hers, and the first person to offer you a bribe for one of them does it in the Anchor, in front of Sal, about nine days later.
*else
  The Anchor stays open and stays busy. Sal serves you without comment, and something has been taken out of that room that was never visible in the first place and cannot be put back.

*comment Closes the loop Vane's handoff scene left open: the bi-weekly report at
*comment port_valen_next_report_day is still unbuilt (see port_valen.txt:2321-2327),
*comment and this quest is the first content in the game that gives the player
*comment something real to report. Whatever they did with the box is standing.
The fortnight turns over the way fortnights do, and a runner eventually finds you in the compound with a folded chit in his hand: [i]Captain's office. Second week. Bring what you've got.[/i]

*page_break Pocket what you've got and go…
*goto pv_anchor_hub
```

## 7. Rewards, scale, and what each route actually pays

Rescaled down from the original draft, which pitched this as a district/faction contract touching Council seats and a decade of city governance — too big for a level-1 recruit's first side job, and bigger than what Layer 2 actually shows the player (household debts and one collector's note, not merchant-house paper). It reads now as what it is: a taphouse's debt vault and one corrupt canal collector. Rep and coin are both scaled to sit near Silt-Gate's own numbers, not above them.

| Route | Coin | Standing | Access | What it costs |
|---|---|---|---|---|
| Give it back to Sal | 2–3 silver (the original job fee, now actually paid) | — | Rationed tab (3 bowls/week), private loft (a real sleep-quality tier, see `resolve_sleep`) | Riker keeps breathing; the racket continues and you become its auditor |
| Carry it to Voss | 4 silver, a finder's fee | `port_watch_rep +2`, `black_tally_rep -1` | Watch standing becomes public | The Watch now knows the box exists; Sal is owned by the city, and she knows you sold her |
| Sell to the Scales | 8 silver, the largest purse in the quest | `gilded_scales_rep +2`, `black_tally_rep -1` | A factor-tier contact | Dredge-End gets quietly consolidated, and you were paid for it |
| Keep it | none | `black_tally_rep +1` | You hold paper on the district | Every debtor learns your face; you become the new Sal |
| Burn the Tally's ledger | 2–3 silver (the job fee, taken while she's still reeling) | `black_tally_rep -2` | The debtors go genuinely free | Sal's credit dies with the paper. She is ruined, she is right about you, and the tab is closed forever |
| Walk away at the offer | none | — | — | Nothing. Sal hires someone else, and the quarter remembers that she had to |

Three constraints, all inherited rather than invented:

- **The free food is rationed, not unlimited** (`anchor_stew_cap 3`, weekly rollover). `startup.txt:384-392` says in plain text that the mess is capped "so indefinite survival can't be sustained for free forever"; a completed quest must not switch the hunger clock off. The paid bowl at 3 copper — matching the Cleaved Keel's stew (`port_valen.txt:1656`) — is the fallback once the tab is drawn down.
- **The loft is free, not instant.** It still costs its 4 hours through `advance_time`, exactly like the compound rest. What the player buys is the travel saved, not a free reset.
- **Only the Sal route grants the tab.** Four of the five endings leave you with a room you can drink in and no longer a home in, which is what gives the choice teeth.

## 8. Reuses vs. must-be-built

**Reuses, with no new systems:** `currency_add` / `currency_txn_locked` (§18); `buy_tavern_item` for the paid bowl; `calendar.txt`'s `resolve_sleep` for the loft (clears the fatigue debt, updates the routine tracker, and grants the loft's sleep-quality tier in one call — same primitive the Carrion Compound's own rest now calls); the neglect clock and the mess hall's `rations_used` / `ration_cap` / `week_start_day` shape; `stat_bump_locked` / `locked_stat_bump_page_id`; `advance_time` with `time_advance_call_id`; the wait-for-the-tide idiom already at `port_valen.txt:941-945`; `day_of_week` for the Forgeday lien clock (`432`, `879`); all three rep tracks — `black_tally_rep` is explicitly "still unwritten by anything" (`port_valen.txt:2325`) and this is the quest it was waiting for; `codex_black_tally`; `vane_standing`; `port_valen_next_report_day`.

**Built:** the POI hub; the quest block with its `unstarted → offered → active → resolved` lifecycle; the `port_valen_dredge_end` `*choice` entry; the `startup.txt` variable block (replacing a stale partial block left over from the scrapped draft — see that file's own comment); the `QUESTS.md` entry; and the `anchor_broker_note` line in `pv_silt_gate_parley_tally`'s CHA-threat branch (both its success and counter-offer paths).

**Optional:** a codex entry on water-liens as a discovery reward, and six-to-nine flavour triplets if the descent is ever routed through `combat.txt` instead of resolved by checks.
---

## 9. Compliance checklist

- **Rules §1 — Organic discovery.** The hook is a sounding-line in a taproom and a notice nailed to a bar, not a badge-scan. No NPC recognises the player's faction; Sal reads their *behaviour* — "You counted the exits."
- **Rules §2 — Multi-branching.** Five descent approaches with real archetype parity (STR / DEX / INT / CHA / four cantrips across all cantrip slots) and five endings plus a walk-away. Failure costs coin, HP, hours, or the box; nothing dead-ends.
- **Rules §3 — Economy.** The 2–3 silver job fee and the 4/8 silver Watch/Scales payouts all sit at or below §3's "street / minor task" band; nothing here approaches even Silt-Gate's 12-silver bounty, let alone the old draft's 15. Rep swings (+1/+2, -1/-2) are scaled to match Silt-Gate's own +1 port_watch_rep rather than the original +4/+3/-3 draft, which read as a district/faction-contract payout for what Layer 2 actually shows is a much smaller find.
- **Rules §4 — Setting authenticity.** Arbalest, crossbow and bodkin only; no firearms anywhere, including the dead draft's `blunderbuss` label. Run `node tools/lint_anachronisms.js` before finalising.
- **Rules §5 — State hygiene.** Every rep swing is inside the `anchor_quest_resolved` once-only guard; every currency mutation rides `currency_txn_locked`; every time advance carries its own `time_advance_call_id`; the tab counters copy the mess hall's rolling-7-day shape.
- **Rules §6 — Open-world integration.** The quest lives in a real POI inside the district hierarchy and reacts to `day_of_week` (the Forgeday stamp) and to the tide.
- **§22 — Weapon-class-agnostic prose.** No pommel, blade, scabbard or boot-dagger appears anywhere in the descent. Run `node tools/lint_weapon_assumption.js`.
- **narrative_guidelines §4 — Continuity.** The Kray/Pell chits are cut and replaced with an unnamed chit plus gated recognition; the player's own note appears only if the player actually shook down the broker.

## 10. Open decisions (resolved for the shipped version)

1. ~~**Does drowning kill?**~~ **Resolved — not used here.** `death.txt` supports a `"drowning"` cause end-to-end, but the botched descent stays a fail-forward beat (box lost, fee lost, grudge set) rather than a death check, per the doc's own recommendation — a bad roll shouldn't end a chapter over two silver. Available for a future, more deliberately telegraphed risk if one gets built.
2. ~~**Does the descent fight?**~~ **Resolved — checks only.** Shipped as five archetype checks, no `combat.txt` routing. Still an option later if the Tally's men need a combat presence, but not required for this quest to work.
3. ~~**Is the tab capped at 3 bowls a week?**~~ **Resolved — yes**, `anchor_stew_cap 3`, matching the compound mess's rolling-7-day shape.
4. ~~**Is the broker's note wired in at all?**~~ **Resolved — yes.** `anchor_broker_note true` is set in both the success and counter-offer paths of `pv_silt_gate_parley_tally`'s CHA-threat branch (the one with the actual "we'll remember who lets the water run" line).
