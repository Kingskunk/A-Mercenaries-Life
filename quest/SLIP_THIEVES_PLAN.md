# Implementation Plan: The Slip Thieves — The Fishmongers' Slip

**Status:** design spec. **Not yet implemented.** As of this document, no code exists for this quest: `port_valen.txt`, `startup.txt`, and `quest/QUESTS.md` are untouched. This file is the build contract for the implementation pass that follows; the ChoiceScript in §6 is written to be lifted verbatim.

**Precedent:** follows `quest/RUSTY_ANCHOR_PLAN.md` in structure and standard. The Anchor postmortem's hard rules are inherited wholesale — nobody is furniture, arithmetic must survive contact, no firearm, no dead-end failure, no un-earned payout.

**Names:** "Pike" (the boy), "Widow Mael" (the senior monger) and "Odo" (the count-man) are placeholders in the district's established dockside register (Maret, Voss, Dell, Rilla, Sal, Riker). No label or variable embeds a name, so renames are text-only. The count-man is deliberately *unnamed in scene* until the skim surfaces — strict subjective POV, §1.

---

## Why this quest exists

1. **It creates the Fishmongers' Slip.** The POI exists today only as a row in `quest/QUESTS.md`'s Harbor POIs table ("Eel & Smoked Fish Rations, High-Flood Gossip | Day-dependent street life | Rations (reduces hunger neglect)"). No label, no menu entry, no code. This quest is the reason to build it — the same way the Low-Water Box was the reason the Rusty Anchor exists.
2. **It makes Rumor 3 playable.** The Cleaved Keel's third rumor — debtor crews chained in the deep water off the Iron Wharves, bonds held in the Gilded Scales' counting houses, renewed every quarter-day — is prose that currently goes nowhere. This quest puts a living consequence of it on the waterfront without ever quoting the rumor back (continuity §4: the player who heard it recognizes the shape; the player who didn't loses nothing).
3. **It fills the street tier — and it touches the player's own intake stake.** `QUEST_DESIGN_RULES.md` §3 defines a 1–5 silver "Street / Minor Task" band and §6 gives minor tasks one NPC perk, not district systems. Port Valen has a municipal contract (Silt-Gate, 12–20 silver) and a wage loop (Crane Three, 4–8 silver/shift) but nothing between. And for an `origin = "outlaw"` player, the debtor workhouse this boy feeds is not set dressing: their father Jorick is chained in it (`startup.txt:2100-2106` — "held in the debtor's workhouse beneath Port Valen's wharves… before the winter damp kills him"). That personal beat is strictly gated on `family_name = "Jorick"`; Elspeth and Gareth origins get neutral text only.

## The pitch, in one breath

Smoked eels are walking out of the brine barrels at the fishmongers' slip, night after night, and the mongers are paying two silver to stop it — but the thief is a boy feeding the chained debtor hulls off the Iron Wharves, the shortages the slip's tally-keeper has been hanging on him are partly the tally-keeper's own skim, and the player holds five exits of very different costs: the bounty, the lie, the crane, the arithmetic, or the door.
---

## 1. The cast, rebuilt

(Anchor postmortem rule: no victim furniture. Each actor has resources, an arithmetic, and a private ledger.)

### The boy — "Pike" (placeholder)

| As the mongers tell it | As designed |
|---|---|
| A dock-rat, vermin with hands | A system: slack-tide timing, a pried stave, eels wrapped in wet sacking so the smoke-smell doesn't trail behind him |
| A charity case | Somebody on those hulls is his; he isn't saying who, and the scene never says it for him |
| A payout, a punishment, or a lesson | A set of exits — every route hands him a different future, and two of them hand him a pipeline |

Design notes: resourceful first, hungry second. He lies about small things (his name, where he sleeps) and nothing large, because large lies are what get boys drowned. His telling detail, visible before any dialogue: he takes only smoked fish, never fresh — smoked keeps for the row out past the breakwater. That detail is the player's first honest clue, and it reads as food-logistics, not sentiment.

### Widow Mael — senior monger (placeholder)

* **A creditor, not a victim.** Like Big Sal, she budgets: the shortage is three barrels light in nine days at her count, which is a handful of marks a season — annoying, survivable, and therefore worth exactly a two-silver bounty and not one copper more. The Anchor postmortem's arithmetic rule cuts both ways: her bounty must be *proportionate*, the way "ten marks every flood tide" was not.
* **She is not wrong about the theft.** The counter-failure to avoid: Mael must not curdle into a cruel employer. Her count is right — eels are walking out. She is only wrong about what the taking costs the taker, and that difference is where the quest's moral weight lives.
* **The perk she grants is in character:** a standing slip-tab for whoever ended her shortage is cheaper than another season of counting chalk, and she knows it.

### The count-man — "Odo" (placeholder; named only after the skim surfaces)

* The slip's tally-keeper. Marks brine-lines, chalks shortages, and files them under the boy's growing legend, because a shortage with a face keeps Mael off his own arithmetic: some of what's missing is his skim, sold fresh off the racks before it ever sees brine. Street-scale echo of Riker's skimmed tribute (`RUSTY_ANCHOR_PLAN.md` Layer 3) — this quest's dark layer is again *paper*, not knives.
* POV discipline: "the count-man" in all scene text until `slip_skim_known`; Mael names him Odo only in the conversation where the player can use it.

---

## 2. The crime & the evidence trail

What is taken, how, and what the player can find, in escalating layers. Layers 0–2 are daytime actions; layer 3 is the night beat; layer 4 is paper.

| Layer | What the player finds | Where it lives | State |
|---|---|---|---|
| 0 — tell | A monger at a brine barrel with a chalk stub; the line she's marking reads too low for the season's catch | slip ambient, any daytime visit pre-quest | none |
| 1 — asked | Mael's count: three barrels light in nine days; the pried stave behind her cart; the 2-silver bounty, offered overheard-style | `pv_slip_probe` | `slip_quest_stage "active"` |
| 2 — looked | Wet small footprints under the ladder's foot; a needle-fine nail-scar in the stave's pry-mark; eel-grease on the lowest rung that never came off the racks | `pv_slip_evidence` | `slip_evidence_found` (advantage at the stakeout) |
| 3 — watched | The boy himself, at slack water, sacking-wrapped eels going down the ladder to a drawn-up skiff | `pv_slip_stakeout` → `pv_slip_caught` / `pv_slip_botched` | catch outcome |
| 4 — counted | Mael's count and the count-man's board disagree by roughly a barrel a week | `pv_slip_skim` (probe follow-up, free) | `slip_skim_known` (unlocks the extort exit) |

Layer 4 is deliberately decoupled from the catch: the ledgers can be compared on any route, day or dark, so the extort exit is never locked behind one archetype's success. Knowing the skim is knowing that "stopping the thief" and "stopping the shortage" are not the same sentence.
---

## 3. Clocks, both from existing systems

1. **Time-of-day gating.** The slip is a daytime POI (the QUESTS.md table's "day-dependent street life"). Entry costs the standard 15 minutes (`pv_poi_slip_1`). At Night/Pre-Dawn the market is shuttered — one ambient line, no menu business — except that the stakeout is offered from the daytime menu as a deliberate two-hour wait into the dark, mirroring the Silt-Gate stakeout's "wait for night flood tide [~2 Hours]" convention. Waiting is a physical action with real duration, so it costs the clock; every conversation on the slip is free (Rules §5).
2. **The rolling-7-day ration cap.** The post-quest free-ration perk copies the compound-mess shape exactly (`port_valen.txt:467-469`, `port_valen_dredge_end.txt:815-821`): `slip_rations_used` resets against `slip_rations_week_start_day` at ≥ 7 campaign days, cap 3. A finished quest must not switch the hunger clock off (see `startup.txt`'s mess-ration comment). Consumption resets `minutes_since_meal`, `hunger_stage`, and `neglect_damage_hunger` inside a `stat_bump_locked` guard, exactly like the Anchor's tab (`port_valen_dredge_end.txt:839-845`). This page owns its own `time_advance_locked`, so `stat_bump_locked` (not `stat_bump2_locked`) is the right pair — same as `pv_anchor_hub`.

## 4. Beat sheet

| # | Beat | Label |
|---|---|---|
| 1 | First visit, daytime: slip intro — smoke, brine, mongers at the tide's schedule; paid rations live immediately | `pv_poi_slip` → `pv_slip_menu` |
| 2 | The tell: Mael over her chalk count; the probe; the bounty lands overheard-style | `pv_slip_probe` |
| 3 | The ledgers: ask to set her count beside the count-man's board | `pv_slip_skim` (free, any time while active) |
| 4 | The evidence hunt: the ladder-line at your own initiative | `pv_slip_evidence` (~10 min, once) |
| 5 | The stakeout: two hours into the dark at the mooring steps; optional Minor Illusion bait; the catch | `pv_slip_stakeout` → `pv_slip_take` → `pv_slip_caught` / `pv_slip_botched` |
| 6 | Fail-forward: the mob morning — the slip catches him without you | `pv_slip_mob` (armed by the entry guard) |
| 7 | The five exits | `pv_slip_choice` |
| 8 | Aftermath: perks, the Jorick pipe, ambient shift | `pv_slip_aftermath`, then living inside `pv_slip_menu` |

### The five exits (Rules §2 rule-of-three, §3 mercenary dilemma)

| Route | Mechanics | Immediate pay | State & consequences |
|---|---|---|---|
| **Catch & expose** *(only if `slip_stakeout_success`)* | none — you did the catching | 2 silver from Mael (`slip_bounty_claimed` guard; 20 copper via `currency_add`) | `slip_resolution "caught"`; the boy is bond-taken to a workhouse crew — Rumor 3 gains a rower; Mael's slip-tab unlocks |
| **Look away & lie** | `[CHA DC 11]` Deception vs Mael — "three big lads off a Tally barge; they'll not come back" | nothing now | `"lied"`; the shortage continues quietly; the boy's standing eel-tab (3/week) is the pay, in stolen goods; his trust opens the workhouse pipe |
| **Honest work via Dell** *(requires `crane_seen` and `crane_shifts_completed >= 1`)* | `[CHA DC 11]` to sell Mael the reform | 2 silver from Mael (shortage ends) | `"employed"`; boy goes on as tar-runner *off the crate-tally* (Rilla's boycott untouched); spends 1 `crane_dell_regard` if any; Mael's slip-tab unlocks |
| **Extort the tally-keeper** *(requires `slip_skim_known`)* | `[CHA DC 12]` or `[INT DC 12]` | 3–4 silver hush, once (30–40 copper) | `"hush"`; no tab; the count-man owns you a small silence; eels keep walking |
| **Walk away** | free | nothing | `"walked"`; the shortage stays everyone's problem |

**Dell canon constraint:** the boy never takes a docker's line. Rilla's crew is mid-boycott over the mate's clipped coin (`pv_crane_dockers`), and solidarity norms would flare at a new hand on the crate-tally. Dell's gain is an oil-and-rags tar-runner, off the tally — which is why `crane_dell_regard`, the variable tracked "for a future promotion ladder hook" and read nowhere yet, is the natural currency this route spends. Gate on `crane_shifts_completed >= 1` (provable state, incremented at `pv_crane_shift_resolve`, `port_valen.txt:1673`); spend `crane_dell_regard -1` defensively only if > 0.

**Fail-forward (botched stakeout → mob morning):** he reads you the moment you commit and goes over the ladder's side; you come up the lane with wet gloves and nothing the mongers would call proof — but he comes back, because his people are on those hulls and there is no other food. Next entry to the slip, it has caught him without you: three mongers, a cargo net off a crane's spare arm, and Mael watching from her barrel. Fast choice: talk the slip down (`[CHA DC 12]`), shoulder through and stand him behind you (`[STR DC 12]`), cut the net-line and put him in the water (`[DEX DC 12]` — he can swim; they can't be bothered), or let it happen (`slip_mob_outcome "complicit"`; the district remembers). Every intervention ends with Mael calling it off before a drowning happens on her slip — she is a creditor; drowned boys pay no bonds — and lands the boy in front of you and her → `pv_slip_choice`, minus the clean "catch" exit (you didn't do the catching). Nothing dead-ends.

**HP policy: deliberately zero.** No check in this quest costs HP, ever. The codebase documents that `recalc_hp_from_neglect` fully overwrites `hp_current` on its own schedule (`port_valen_eat_mess`'s comment block), which makes out-of-combat HP deductions a known footgun. This quest's costs are coin, hours, and who remembers what — which is also truer to its street scale.
---

## 5. Variables index (`startup.txt`)

Insert after the Anchor block (after `*create anchor_stew_cap 3`, ~line 273), same comment style. Sixteen creates, nothing else:

```choicescript
*comment --- The Slip Thieves / Fishmongers' Slip (see quest/SLIP_THIEVES_PLAN.md) ---
*create slip_quest_stage "unstarted"        *comment "unstarted", "active", "resolved", "declined"
*create slip_seen false                     *comment first-visit intro guard
*create slip_resolution "none"              *comment "none", "caught", "lied", "employed", "hush", "walked"
*create slip_bounty_claimed false           *comment once-only 2-silver payout guard
*create slip_evidence_found false           *comment footprints/pry-mark -- advantage on the stakeout
*create slip_stakeout_done false            *comment the night beat has run at all
*create slip_stakeout_success false         *comment the catch itself landed
*create slip_skim_known false               *comment the count-man's arithmetic is exposed
*create slip_boy_known false                *comment the boy has given his name (friendly routes only)
*create slip_mob_outcome "none"             *comment "none", "talked", "shielded", "freed", "complicit"
*create slip_rations_unlocked false         *comment the post-quest free-ration tab
*create slip_rations_used 0                 *comment rolling-7-day free-ration counter
*create slip_rations_week_start_day 0
*create slip_rations_cap 3
*create slip_jorick_word_sent false         *comment gated on family_name = "Jorick"
*create slip_illusion_bait false            *comment Minor Illusion set at the stakeout (advantage source)
```

**No faction reputation variables.** This is the wage-labor/street tier (§6), same rule as Crane Three: "no faction reputation changes; this is wage labor, not a municipal contract." The only currencies here are coin, the tab, and who remembers what.

**Grant-vs-derived rule for the tab:** `slip_rations_unlocked` is set at the moment of granting (Mael's slip-tab on `caught`/`employed`, the boy's standing eels on `lied`) and is never derived from `slip_resolution` alone — the complicit mob outcome resolves as `"caught"` while still denying the tab, so the two facts must be able to disagree.

---

## 6. Full narrative prose & ChoiceScript specification

**File placement:** everything lives in `port_valen.txt`, inserted between `pv_poi_shrine`'s closing `*goto port_valen_harbor_pois` (~line 1802) and `port_valen_eat_mess` (~line 1815). One menu line is added to `port_valen_harbor_pois`'s `*choice`. No new scene file, no `compile.js` change (`port_valen.txt` is already a verified file). Fourteen labels, prefixed `pv_slip_` / `pv_poi_slip`:

```
pv_poi_slip          entry (15 min, weekly rollover, mob-morning guard)
pv_slip_menu         living menu loop (ambient by time/day/resolution)
pv_slip_probe        the tell -> the bounty (sets stage "active")
pv_slip_skim         the ledgers compared (WIS DC 11, free)
pv_slip_evidence     the ladder-line (WIS DC 11 Investigation, ~10 min, once)
pv_slip_stakeout     the two-hour wait + Minor Illusion bait option
pv_slip_take         the catch check (DEX DC 12 Stealth, advantage if evidence/bait)
pv_slip_caught       the talk (skim flavor; his account of the hulls)
pv_slip_botched      the fail (he slips; the mob beat arms)
pv_slip_mob          the mob morning (fast 4-way; armed by entry guard)
pv_slip_choice       the five exits
pv_slip_aftermath    state lock, perk grant text, the Jorick pipe
pv_slip_rations      paid racks loop (4-copper smoked eel)
pv_slip_free_ration  the free tab (cap 3/rolling week)
```

**Unique `time_advance_call_id`s:** `pv_poi_slip_1`, `pv_slip_evidence_1`, `pv_slip_stakeout_1`, `pv_slip_free_ration_1` — one per call site, per the calendar convention.

**Menu line (in `port_valen_harbor_pois`'s `*choice`, after the shrine option, before "Move on to the rest of the city."):**

```choicescript
  # Walk the fishmongers' slip where the market meets the water. [~15 min]
    *goto pv_poi_slip
```
### 6.1 Entry (`pv_poi_slip`)

```choicescript
*comment ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*comment THE FISHMONGERS' SLIP: "THE SLIP THIEVES"
*comment Street-tier quest (quest/SLIP_THIEVES_PLAN.md). Daytime POI; the
*comment night beat is the stakeout option, not a separate POI mode. State:
*comment startup.txt "slip_*" block. Inserted after pv_poi_shrine, before
*comment port_valen_eat_mess. No faction reps -- wage-labor tier (Crane rule).
*comment ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

*label pv_poi_slip
*set hours_to_pass 0
*set minutes_to_pass 15
*set time_advance_call_id "pv_poi_slip_1"
*gosub_scene calendar advance_time
*gosub_scene calendar recalc_hp_from_neglect

*if (hp_current <= 0)
  *set death_cause "starvation"
  *if (neglect_damage_fatigue > neglect_damage_hunger)
    *set death_cause "exhaustion"
  *goto_scene death death_screen

*comment Fail-forward trigger (QUEST_DESIGN_RULES.md §2): the stakeout ran and
*comment failed, so the slip has done its own watching. The mob morning plays
*comment once, on the next entry, whatever the hour.
*if (slip_stakeout_done) and (not(slip_stakeout_success))
  *if (slip_quest_stage = "active") and (slip_mob_outcome = "none")
    *goto pv_slip_mob

*if (not(slip_seen))
  *set slip_seen true
  The fishmongers' slip is a plank-walk of stalls and mooring steps where the fish market gives up and the water takes over. Brine barrels stand three deep under a slung oilcloth, gutting tables run out over the tide, and the mongers work the water's schedule rather than the bell's — sales-bell at the turn, everything scrubbed and shuttered by dark.
  The smell is salt, smoke, and fish blood in equal parts, and underneath it, faint, the sourness of money counted too often.
  *if (not(squad = "none"))
    A monger with rope-scarred knuckles marks you in one pass — woolens, a raven, company kit — and goes back to her knife without a word. Ravens buy like anyone else here.
  *else
    A monger with rope-scarred knuckles marks you in one pass — woolens, travel kit, no colors — and goes back to her knife without a word.
*else
  *if ((time_period = "Night") or (time_period = "Pre-Dawn"))
    The slip is shuttered and dark, stalls boarded, oilcloth lashed down. Somewhere out past the breakwater a hull-bell counts the flood, and the mooring steps run down into black water that smells of brine and smoke.
  *elseif (time_period = "Dusk")
    The mongers are banking their fires and lashing down the oilcloth. The day's last sales-bell has rung, and what hasn't sold is going back into brine for another night.
  *else
    *if (slip_quest_stage = "resolved")
      *if (slip_resolution = "caught")
        The ladder under the middle steps has been boarded over since the morning the slip's strong arms dragged a boy past the stalls. The brine-line has held level ever since. Mael has not once looked at it.
      *elseif (slip_resolution = "lied")
        Mael still counts — she will count till they lay her out — but the line holds its level now, and she has stopped marking it twice.
      *elseif (slip_resolution = "employed")
        Some mornings a small figure runs tar up the cargo line past the fish market, and Mael watches him go with an expression she charges nobody for.
      *elseif (slip_resolution = "hush")
        The count-man writes on. The shortage writes on too, smaller now, steadier — like a thing that has learned to budget.
      *else
        Nothing has changed. The chalk keeps marking, the line keeps sinking, and the slip keeps its own quiet books about you.
    *elseif (slip_quest_stage = "active")
      *if ((time_period = "Morning") or (time_period = "Midday") or (time_period = "Afternoon"))
        The slip works on around you — knives, brine, the sales-bell — and the mongers have stopped staring at your kit. To them you are the one who asked Mael's count for a living, and that buys a wide berth and no love.
      *else
        The slip's dark is thicker for what you know is under it. Nobody has said a word to you since the night you sat the mooring steps.
    *else
      [b]Mael[/b] — the senior monger, hair gone salt and pinned with a fish-bone, chalk stub in one fist — stands over a brine barrel marking a line, reading it, and marking it again, like the wood is lying to her.
```

*(Note: the tell — Mael at her chalk — is the `slip_quest_stage = "unstarted"` ambient. It re-renders every pre-quest daytime visit until the probe runs, so the player can simply buy eels a few times and never ask. That is the point: the quest is a room, not a popup.)*
### 6.2 The slip menu (`pv_slip_menu`)

```choicescript
*label pv_slip_menu
*comment Weekly rollover for the free tab -- the same rolling-7-day shape as
*comment pv_mess_rations_used/pv_mess_week_start_day (port_valen_hub) and
*comment anchor_stew_used/anchor_stew_week_start_day (pv_anchor_hub). A
*comment finished quest must not switch the hunger clock off; see startup.txt's
*comment mess-ration comment for why that cap exists at all.
*if ((campaign_day - slip_rations_week_start_day) >= 7)
  *set slip_rations_used 0
  *set slip_rations_week_start_day campaign_day

*if (slip_rations_unlocked) and (slip_rations_used >= slip_rations_cap)
  Your share's drawn off the tab this week — three flood-tides is the arrangement, not one more, and whoever's feeding you has made that plain.

*if (day_of_week = "Marketday")
  *comment day-flavored gossip (the QUESTS.md table's "high-flood gossip")
  The sales-bell rings twice on Marketday, and the mongers' talk runs to hulls and prices and whose counting-house clerk bought fresh this week.

*choice
  # Buy something off the smoking racks.
    *goto pv_slip_rations
  *if (slip_quest_stage = "unstarted")
    # Ask the monger at the brine barrel what she's counting.
      *goto pv_slip_probe
  *if (slip_quest_stage = "active") and (not(slip_skim_known))
    # Ask to see her count set beside the count-man's board.
      *goto pv_slip_skim
  *if (slip_quest_stage = "active") and (not(slip_evidence_found))
    # Work down the ladder-line while the mongers aren't watching. [~10 min]
      *goto pv_slip_evidence
  *if (slip_quest_stage = "active") and (not(slip_stakeout_done))
    # Come back after dark and watch the ladder from the mooring steps. [~2 hours]
      *goto pv_slip_stakeout
  *if (slip_rations_unlocked) and (slip_rations_used < slip_rations_cap)
    # Take what's yours off the slip's tab. [~15 min]
      *goto pv_slip_free_ration
  # Back up to the quayside.
    *page_break Back to the quayside…
    *goto port_valen_harbor_pois
```

*(Day-flavored gossip: one Marketday line ships in v1; that `*if (day_of_week = ...)` slot is the pattern for more. It is ambient, not the Keel's rumor system.)*

### 6.3 The probe (`pv_slip_probe`) and the ledgers (`pv_slip_skim`)

```choicescript
*label pv_slip_probe
The monger at the barrel is sixty if a day, hair gone salt and pinned back with a fish-bone, chalk in one fist and a counting-board in the other. She marks the brine-line, reads it, and marks it again like the wood is lying.

"You're staring at my barrels," she says, without looking up.

*set slip_quest_stage "active"

She spits over the tide before you can answer. "Two silver to whoever puts a stop to it. Not a copper more, and not paid on might-be. Three barrels light in nine days at my count, and the count-man's board says less, and between the two of them I'm being robbed by arithmetic."

"Mael!" someone calls up the plank-walk. "High-water cart's on the ramp!"

"Mael," she agrees, already turning. "The stave behind my cart is pried, if you've eyes. I've paid for catching before, and I'll pay for catching again. I don't pay for sympathy."

*comment No badge-scan, no company name spoken -- she reads kit, not colors
*comment (Rules §1). The bounty is overheard-style: she was talking before the
*comment player arrived, the way Voss pitches the Silt-Gate job at pv_quays_voss_pitch.
*page_break Watch her go…
*goto pv_slip_menu

*label pv_slip_skim
*comment Free action: comparing two people's numbers is conversation, and §5
*comment says conversation does not cost the clock. This is the only door to
*comment slip_skim_known, so the extort exit is never locked behind the catch.
The count-man is a narrow man with ink on three fingers, and his board hangs from the tally-post at the lane's end where the mongers file their takes. Mael unships hers from under the cart and lays the two side by side on a gutting-table, wet wood under dry.

"Read them," she says. "Out loud, if you like. My count and his."

*set check_stat "wis"
*set check_dc 11
*set check_skill "Insight"
*gosub_scene startup roll_d20_check
*if (check_success)
  *set slip_skim_known true
  A barrel a week. That's the size of it, laid flat where the two columns stop agreeing: Mael's losses run three in nine days; the board admits two. The difference has been walking out the front of the slip in somebody's lunch-pail — sold fresh, off the racks, before it ever saw brine — and every week of it chalked up under a boy's growing legend.

  The count-man feels you reading and does not look up. Mael does, and reads your face instead of the board, and puts her hand flat on her own column like it might be next.
*else
  Two boards, two hands, two days of chalk between them. Whatever the difference is, it hides in the arithmetic, and Mael snaps her board shut under her arm. "My count's my count. His is his."
*page_break Leave the boards where they lie…
*goto pv_slip_menu
```
### 6.4 The evidence hunt (`pv_slip_evidence`)

```choicescript
*label pv_slip_evidence
*set hours_to_pass 0
*set minutes_to_pass 10
*set time_advance_call_id "pv_slip_evidence_1"
*gosub_scene calendar advance_time
*gosub_scene calendar recalc_hp_from_neglect

*if (hp_current <= 0)
  *set death_cause "starvation"
  *if (neglect_damage_fatigue > neglect_damage_hunger)
    *set death_cause "exhaustion"
  *goto_scene death death_screen

*set check_stat "wis"
*set check_dc 11
*set check_skill "Investigation"
*gosub_scene startup roll_d20_check
*if (check_success)
  *set slip_evidence_found true
  Three things, each small. The lowest rung of the mooring ladder is greased with eel-fat that never came off the racks. The pry-mark in the stolen stave carries a needle-fine nail-scar — a knife-tip's work, not a crow's. And under the ladder's foot, pressed into the black tide-slime, the prints of somebody small enough to pass under a loaded hand-barrow.

  Somebody light. Somebody careful. Somebody who comes and goes by the water-side, where the lamplight quits.
*else
  You spend ten wet minutes on your knees by the ladder and come up with splinters and nothing you would swear to. Whatever the slip knows, it keeps below the water-line.
*page_break Straighten up…
*goto pv_slip_menu
```

*(The evidence is once-only — the option hides after it resolves — and it exists to feed `slip_evidence_found` → advantage at the stakeout check, using the existing `advantage`/`roll_d20_check` plumbing (`startup.txt:604-605`; callers set the flag immediately before their own gosub, as documented at `startup.txt:244-247`).)*

### 6.5 The stakeout (`pv_slip_stakeout` → `pv_slip_take`)

```choicescript
*label pv_slip_stakeout
*comment The deliberate two-hour wait into the dark -- the Silt-Gate
*comment stakeout's "wait for night flood tide [~2 Hours]" convention.
*comment Conversation above was free; this is a physical wait with real
*comment duration, so it costs the clock.
*set hours_to_pass 2
*set minutes_to_pass 0
*set time_advance_call_id "pv_slip_stakeout_1"
*gosub_scene calendar advance_time
*gosub_scene calendar recalc_hp_from_neglect

*if (hp_current <= 0)
  *set death_cause "starvation"
  *if (neglect_damage_fatigue > neglect_damage_hunger)
    *set death_cause "exhaustion"
  *goto_scene death death_screen

The lamps along the market lane go out one by one until only the customs tower keeps a shuttered glow. You fold yourself onto the mooring steps where the ladder meets the tide, back to a piling, and let the cold come up through the planks. Slack water is a long time coming. So is he.

The boy comes at slack water, when the ladder's foot goes quiet — a thin shape down the market lane with wet sacking over one shoulder, moving the way working people move when they are somewhere they have no business being.

*choice
  # Take him at the ladder-foot.${hint_slip_take}
    *goto pv_slip_take
  *if ((((((((((wizard_cantrip = "minor_illusion") or (wizard_cantrip_2 = "minor_illusion")) or (wizard_cantrip_3 = "minor_illusion")) or (bard_cantrip = "minor_illusion")) or (bard_cantrip_2 = "minor_illusion")) or (warlock_cantrip = "minor_illusion")) or (warlock_cantrip_2 = "minor_illusion")) or (race_cantrip = "minor_illusion")) or (race_cantrip_2 = "minor_illusion")))
    # Put the sound of a hand-cart rolling up the lane behind him, and watch what he does with his shoulders. (Minor Illusion)
      *set slip_illusion_bait true
      The creak of an empty cart turns him to stone against the boards — three long breaths of a boy learning in one night what every lane sounds like when it is empty. He commits to the ladder a beat later, and now you have his rhythm and his blind side both.
      *goto pv_slip_take
  # Let him work. You've seen what you came to see.
    *set slip_stakeout_done true
    He goes down the ladder like water going down stairs, eels and all, and a drawn-up skiff takes the sacking and pulls away soft oarless toward the breakwater lights. Out there past the bar, someone will be glad of smoked fish tonight, and none of them will know your name.
    *page_break Climb back up the lane…
    *goto pv_slip_menu

*label pv_slip_take
*comment Advantage plumbing: set immediately before the roll, cleared by the
*comment roll itself (startup.txt:3187-3212). Evidence and illusion bait do not
*comment stack -- advantage does not stack in this engine (startup.txt:3061-3063).
*set advantage false
*set disadvantage false
*if (slip_evidence_found) or (slip_illusion_bait)
  *set advantage true
*temp hint_slip_take ""
*if (show_stat_hints)
  *if (guidance_active)
    *set hint_slip_take " [DEX DC 12 (+1d4 Guidance)]"
  *else
    *set hint_slip_take " [DEX DC 12]"
*set check_stat "dex"
*set check_dc 12
*set check_skill "Stealth"
*gosub_scene startup roll_d20_check
*if (check_success)
  *goto pv_slip_caught
*else
  *goto pv_slip_botched
```

*(Guidance needs no dedicated option here — `guidance_active` is read by the hint and by the roll, same as the crane haggle at `port_valen.txt:1380-1385`. The full 9-slot cantrip guard chain above is copied from the Silt-Gate's `minor_illusion` option (`port_valen_dredge_end.txt:288`) — the canonical pattern.)*
### 6.6 The catch (`pv_slip_caught`) and the botch (`pv_slip_botched`)

```choicescript
*label pv_slip_caught
*set slip_stakeout_done true
*set slip_stakeout_success true
You have him by the collar before the second rung, one arm pinned to the wet planks, and the sacking spills smoked eels across both your boots.

He doesn't fight. That is the first surprising thing. He goes still the way small animals go still, and looks up with the patience of somebody who has been caught before and knows the arithmetic of it.

"Two silver," he says. "That's what she's paying. I'd have asked five, me." A shrug under your grip, unbothered. "Do what you like."

The eels go out past the breakwater — that much he gives you, because you are holding his collar and the tide is going your way. A drawn-up skiff, a cousin at the oars, smoked fish because smoked keeps for the row. He names no hull and no name, and he watches you not write them down, and there is something in the watching that is older than he is.

His eyes cut once to the tally-post at the lane's end, where the count-man's board hangs — a glance he thinks you missed, filed the way he files everything, in the ledger of who knows what.

*comment Note: slip_skim_known is NOT granted here. It lives only in
*comment pv_slip_skim (the ledgers), so the extort exit stays reachable on
*comment every route and the boy's glance is flavor, not a second keyhole.
*page_break Hold him…
*goto pv_slip_choice

*label pv_slip_botched
*set slip_stakeout_done true
He reads you the same moment you commit — whatever told him, told him early — and he is over the ladder's side before your hand closes, sacking held high, keeping it dry if not himself.

The water takes him without a sound. A drawn-up skiff slides away from the piling, soft oars, no lights, and the black water closes over where both of them were.

You come up the lane with wet gloves, a boot-full of tide, and nothing the mongers would call proof.

*comment Fail-forward, per QUEST_DESIGN_RULES.md §2: the theft is unsolved and
*comment the boy is uncaught, but the night is spent, the tide knows your face,
*comment and the slip will not stay patient. pv_poi_slip's guard arms the mob
*comment morning on the next entry. No HP cost -- see §3 of this plan.
*page_break Climb back up the lane…
*goto pv_slip_menu
```

*(The "let him work" stakeout option also sets only `slip_stakeout_done` — the player has chosen to know and not act, and the mob morning will still find the boy eventually, because the shortage doesn't stop while the player watches. That is deliberate: every path except the five exits keeps the clock running.)*

### 6.7 The mob morning (`pv_slip_mob`)

```choicescript
*label pv_slip_mob
*comment Armed by pv_poi_slip's guard (stakeout ran, catch failed, quest
*comment active, mob not yet resolved). The slip catches the boy without you.
The slip has done its own watching since your wet night — somebody has been paid to sit up with the barrels — and this morning it caught what it was paying to catch. Three mongers have him against the gutting-table, and the cargo net off crane four's spare arm is already over his shoulders, and the crowd is doing that quiet arithmetic crowds do before they decide a boy has stopped being anybody's.

Mael stands apart with her arms folded. Not stopping it. Not starting it either. Looking at you — because you are the one who asked her count for a living, and whatever her slip does this morning, you are part of why.

He sees you over their shoulders. Doesn't call out. He's done the same sum you have: what you do next is the whole of it.

*temp hint_slip_mob_talk ""
*temp hint_slip_mob_shield ""
*temp hint_slip_mob_cut ""
*if (show_stat_hints)
  *if (guidance_active)
    *set hint_slip_mob_talk " [CHA DC 12 (+1d4 Guidance)]"
    *set hint_slip_mob_shield " [STR DC 12 (+1d4 Guidance)]"
    *set hint_slip_mob_cut " [DEX DC 12 (+1d4 Guidance)]"
  *else
    *set hint_slip_mob_talk " [CHA DC 12]"
    *set hint_slip_mob_shield " [STR DC 12]"
    *set hint_slip_mob_cut " [DEX DC 12]"

*choice
  # Talk the slip down off him.${hint_slip_mob_talk}
    *set check_stat "cha"
    *set check_dc 12
    *set check_skill "Persuasion"
    *gosub_scene startup roll_d20_check
    *if (check_success)
      "Two silver buys a catching," you say, to Mael, over the noise. "Not a drowning. Ask her what her count's worth with the Watch reading it."
      The net comes off him by ones and twos, the way crowds give back what they were only holding onto for the shape of it. He hits the planks coughing, and nobody helps him up, and that is what mercy looks like on a working slip.
      *set slip_mob_outcome "talked"
    *else
      The words go into the crowd and come apart — and it is Mael who ends it, one raised hand and a voice like a cleaver: "Not on my slip. Drowned boys pay no bonds." The net comes off. He is deposited at your feet, deposited on you, by the plain arithmetic of who spoke last.
      *set slip_mob_outcome "talked"
    *goto pv_slip_choice
  # Put your shoulders in and stand him behind you.${hint_slip_mob_shield}
    *set check_stat "str"
    *set check_dc 12
    *set check_skill "Athletics"
    *gosub_scene startup roll_d20_check
    *if (check_success)
      You take the net's pull on your own back and walk it, two steps, three, until the boy is behind you and the slip's anger has a wall in it. Mongers give ground the way they give change: exactly, and all at once.
      *set slip_mob_outcome "shielded"
    *else
      You go into the gutter with a net-man's knee in your back, and it is Mael's hand that comes down — not yours — calling the whole thing off her slip before it becomes a drowning on her books.
      *set slip_mob_outcome "shielded"
    *goto pv_slip_choice
  # Cut the net-line and put him in the water.${hint_slip_mob_cut}
    *set check_stat "dex"
    *set check_dc 12
    *set check_skill "Acrobatics"
    *gosub_scene startup roll_d20_check
    *if (check_success)
      One pass of a knife through wet mesh, one shove, and he is over the side and swimming like the thing he is — something the water has been raising on purpose. The crowd roars at the dare of it. Mael watches him go and says nothing at all.
      *page_break Wait by the mooring steps…
      *goto pv_slip_mob_freed
    *else
      The mesh takes your knife and the net-men take you, both, into the shallows — and again it is Mael's voice that hauls the morning back from a drowning nobody meant to have on their ledger. You come out of the water beside the boy. Equals, of a kind.
      *set slip_mob_outcome "freed"
    *goto pv_slip_choice
  # Let it happen.
    The beam swings. The boy takes his beating with his arms over his head, and the crowd takes its lesson, and the net-men take Mael's two silver for the catching, because that is who she pays when it is not you.
    *set slip_mob_outcome "complicit"
    *set slip_resolution "caught"
    *set slip_quest_stage "resolved"
    *comment Complicit resolves as "caught" but denies the tab and the bounty:
    *comment the pay went to the net-men, and slip_rations_unlocked stays false.
    *goto pv_slip_aftermath

*label pv_slip_mob_freed
He finds you at the mooring steps an hour later, wringing the tide out of his sleeves like it is somebody else's money he is glad to be rid of.

"You cut it," he says. "Not many do that for free."

*set slip_boy_known true
"Name's mine to give and you've earned the hearing of it. Pike."

*page_break Walk him up the lane…
*goto pv_slip_choice
```

*(All three interventions converge on `pv_slip_choice` regardless of the check — success and failure differ in prose and in `slip_mob_outcome` only. Mael ends every version before a drowning happens on her slip, because she is a creditor and drowned boys pay no bonds. The explicit "let it happen" is the one route that skips the choice entirely. The `pv_slip_mob_freed` side-label exists because the DEX-success physically separates the boy from the slip and gives him a name — `slip_boy_known` — that the other routes earn differently.)*
### 6.8 The five exits (`pv_slip_choice`)

```choicescript
*label pv_slip_choice
The boy is in front of you — by your hand or by the slip's — and Mael is watching from her barrel with her arms folded, patient as arithmetic. Whatever happens next happens once.

*comment Section 3's mercenary dilemma at street scale: five exits, each
*comment costing something the player will feel later, and none paying twice.
*temp hint_slip_lie ""
*temp hint_slip_work ""
*temp hint_slip_hush ""
*if (show_stat_hints)
  *if (guidance_active)
    *set hint_slip_lie " [CHA DC 11 (+1d4 Guidance)]"
    *set hint_slip_work " [CHA DC 11 (+1d4 Guidance)]"
    *set hint_slip_hush " [CHA DC 12 (+1d4 Guidance)]"
  *else
    *set hint_slip_lie " [CHA DC 11]"
    *set hint_slip_work " [CHA DC 11]"
    *set hint_slip_hush " [CHA DC 12]"

*choice
  *if (slip_stakeout_success) and (not(slip_bounty_claimed))
    # Walk him to Mael's cart and take her silver.
      *set slip_resolution "caught"
      The boy walks because you are holding his arm, and because he has already priced this morning and found it acceptable. Mael counts twenty copper into your hand — to the copper, the way she counts everything — and sends a runner for the bond-men from the workhouse gate with the same chalk stub she counted the barrels with.

      He doesn't look back at the water. That is the worst of it. Out past the breakwater there is a skiff that will row a hungry circuit tonight and find nobody waiting.

      *comment Bounty (2 silver = 20 copper), once-only guard per Rules §5.
      *if (not(currency_txn_locked)) or (not(locked_currency_txn_page_id = choice_page_id))
        *set currency_add_amount 20
        *gosub_scene startup currency_add
        *set currency_txn_locked true
        *set locked_currency_txn_page_id choice_page_id

      "Shortage's ended," Mael says. "Eat cheap at my slip for the doing of it. Don't make me regret the arithmetic." — and that is the whole of the ceremony. The bond-men will row him out with the next tide's crews. Rumor 3's hulls gain a rower; the slip loses its thief; the tally-board keeps its numbers.

      *set slip_quest_stage "resolved"
      *set slip_bounty_claimed true
      *set slip_rations_unlocked true
      *goto pv_slip_aftermath
  # Lie to Mael about what you found.${hint_slip_lie}
    *set check_stat "cha"
    *set check_dc 11
    *set check_skill "Deception"
    *gosub_scene startup roll_d20_check
    *if (check_success)
      "Three big lads off a Tally barge," you tell her. "Took what they could carry and ran the bar at slack water. They'll not come back — I saw to that."

      Mael looks at you for a long, counting moment, the way she looks at everything. Then she spits over the tide, which is as close to thanks as this slip pays.

      "Then I'm out two silver and three barrels, and you're telling me a story." She shoulders her chalk. "But it's a story with an ending, which is more than my weeks have had lately."

      *set slip_resolution "lied"
      *set slip_boy_known true
      *comment The tab is the boy's pay, not Mael's: stolen eels, wrapped in
      *comment sacking at the ladder-step, three flood-tides a week. Same
      *comment variable either way (see the grant-vs-derived rule in §5).
      *set slip_rations_unlocked true
    *else
      "Big lads off a Tally barge," Mael repeats, flatter than the tide. "And you, walking my slip with wet gloves and no catch." She doesn't press it. She is a creditor, not a magistrate, and your story is worth exactly what she paid for it. "Then we're both lying, and mine's cheaper."

      *set slip_resolution "lied"
      *comment No tab on the failed lie: the boy's trust survives (he watched
      *comment you lie for him), but Mael grants nothing and the boy's own
      *comment pipeline is not yet a standing arrangement. Fail-forward, not a
      *comment dead end -- §2.
    *goto pv_slip_aftermath
```

**(`pv_slip_choice` continued — remaining options of the same `*choice`):**

```choicescript
  *if (crane_seen) and (crane_shifts_completed >= 1)
    # Take the boy up the cargo line and put him on Dell's books.${hint_slip_work}
      *set check_stat "cha"
      *set check_dc 11
      *set check_skill "Persuasion"
      *gosub_scene startup roll_d20_check
      *if (check_success)
        You walk him up the cargo line yourself, past the customs arch, to crane three — the same walk Voss's runner makes with manifests, in the other direction. Dell hears it out with his tally-board under his arm and the boy's collar in your fist.

        "Not a hand," he says first, because Rilla's lot are still standing at the plank's foot over the mate's clipped coin, and solidarity is solidarity. "Tar-runner. Chain-grease. He carries, he doesn't lift, he stays off the tally, and if the guild asks, he's my sister's boy and none of theirs." A beat. "You vouch, you own half of whatever he breaks."

        *set slip_resolution "employed"
        *set slip_boy_known true
        *comment Dell's regard is spent here -- the one standing favor this
        *comment route draws on. Spent defensively: the variable is tracked
        *comment from the first shift and read nowhere else yet.
        *if (crane_dell_regard > 0)
          *set crane_dell_regard -1

        Back at the slip, Mael hears the word "crane" and the argument is over before it starts — an ending with a wage in it is the only kind she trusts. She pays the two silver for the shortage stopping, not for the boy, and nobody explains the difference to anybody.

        *if (not(currency_txn_locked)) or (not(locked_currency_txn_page_id = choice_page_id))
          *set currency_add_amount 20
          *gosub_scene startup currency_add
          *set currency_txn_locked true
          *set locked_currency_txn_page_id choice_page_id

        *set slip_quest_stage "resolved"
        *set slip_bounty_claimed true
        *set slip_rations_unlocked true
      *else
        "A boy off the streets, reformed by a raven's say-so." Mael chalks something that is not a number. "I want my shortage ended, not promised. Come back when he's somebody's."

        *comment Employed-fail is the one soft refusal: nothing resolves, the
        *comment choice re-presents. All other exits stay live.
        *page_break Put your hand down…
        *goto pv_slip_choice
  *if (slip_skim_known)
    # Take the count-man's arithmetic in both hands.${hint_slip_hush}
      You find him at the tally-post with his ink-fingers and his board, and you don't raise your voice, because you don't need to. You lay his week beside Mael's, barrel by barrel, out loud, the way she taught you to.

      *set check_stat "cha"
      *set check_dc 12
      *set check_skill "Persuasion"
      *gosub_scene startup roll_d20_check
      *if (check_success)
        He goes the grey of wet rope, and when he breathes again it is carefully, like a man counting.

        "Forty copper," he says. "Once. And the board balances, and you've never read it, and the boy keeps his legend because legends keep ledgers quiet." He counts it out of his own purse, not Mael's — the distinction matters to a man like him, and it is the only honest thing about him.

        *set slip_resolution "hush"
        *if (not(currency_txn_locked)) or (not(locked_currency_txn_page_id = choice_page_id))
          *set currency_add_amount 40
          *gosub_scene startup currency_add
          *set currency_txn_locked true
          *set locked_currency_txn_page_id choice_page_id

        *set slip_quest_stage "resolved"
      *else
        He doesn't go grey. He goes cold, and folds his board shut, and Mael backs her man the way slips back their own — with a look that docks you at the gate. The boy keeps his legend. The skim keeps its skim. You keep the knowledge, which buys you nothing on this slip but a wider berth.

        *set slip_resolution "hush"
        *set slip_quest_stage "resolved"
        *comment Fail-forward: no coin, no tab, and the slip's welcome is
        *comment withdrawn (the aftermath ambients read colder). Not a dead end
        *comment -- the district goes on, and so does the player.
      *goto pv_slip_aftermath
  # Leave the slip to its own arithmetic.
    *if (slip_stakeout_success)
      You open your hand off the boy's collar and step back, and he is gone over the side before your boot leaves the first rung — sacking and all, into the soft black water, gone like something the tide was owed.

      Mael watches you not spend the two silver. Whatever she writes about you in her own quiet books, she writes it now.
    *else
      Whatever the slip is owed, you are not the one to collect it. You buy your eel, if you're buying, and you walk back up the lane.

    *set slip_resolution "walked"
    *set slip_quest_stage "resolved"
    *goto pv_slip_aftermath
```
### 6.9 Aftermath & the Jorick pipe (`pv_slip_aftermath`)

```choicescript
*label pv_slip_aftermath
*comment Idempotent lifecycle lock: every exit branch sets its own state and
*comment lands here; the stage transition happens exactly once.
*if (not(slip_quest_stage = "resolved"))
  *set slip_quest_stage "resolved"

*if (slip_rations_unlocked)
  *if (slip_resolution = "lied")
    He finds you at the ladder-step before the next flood, smelling of smoke and river, and lays a sacking bundle by your boot without a word about whose eels they were or whose they stay. "Three flood-tides a week," he says. "Not one more. A body's still got to buy its bread, or they'll know."
  *else
    Mael wraps your slab without being asked and charges you the look that goes with it. "Cheap at my slip, from now on. Three a week is three a week, mind. The rest pays."

*if ((slip_resolution = "lied") or (slip_resolution = "employed"))
  *if (family_name = "Jorick")
    *if (not(slip_jorick_word_sent))
      He lingers at the ladder-foot, weighing you the way he weighs everything now — by what you cost and what you carry.

      "There's a name I could carry down," he says. "If you had one. Names go further than bread on those hulls. Bread they take. A name they pass hand to hand."

      You give him Jorick's.

      He nods once, slowly, and does not ask the thing you can see him wanting to ask — what the name is to you — because boys who live by carrying other people's business learn early not to weigh it out loud.

      Two flood-tides later there's an answer, wrapped in sacking with the eels: he's on the low hull, the one that takes the water. The damp is in his hands. He's breathing. And he kept his ration the week the chain-master came round.

      *comment Grounded in the intake canon only (startup.txt:2100-2106 --
      *comment "held in the debtor's workhouse beneath Port Valen's wharves...
      *comment before the winter damp kills him"). No trade, no history, no
      *comment promise about wider game-state. The pipe is now simply open:
      *comment word and rations travel down with the boy, and something
      *comment travels back. The muster clerk's "we'll send the chit" line
      *comment (startup.txt:2102) now has a street-level counterpart.
      *set slip_jorick_word_sent true

      You send the first ration down with the next eels, and do not tell anyone, including yourself, what you would have paid for a second letter.

      *page_break Watch the skiff pull out past the breakwater…
    *else
      The skiff comes and goes on its own schedule now, and every sacking bundle that comes back has been opened and re-tied in a way that is not the boy's doing.
  *else
    "Any name you want carried down gets carried," he says, and means it as payment, and doesn't understand why you look at the water after.
*else
  *if (family_name = "Jorick")
    Whatever road the boy took today, the name you might have sent down the water went unspoken, and the low hull keeps its secret a while longer.

*page_break Back up to the quayside…
*goto port_valen_harbor_pois
```

*(POV/continuity notes: the Jorick beat is triple-gated — resolution grants the pipe (`lied`/`employed`), `family_name = "Jorick"` grants the father, and `slip_jorick_word_sent` makes it once-only. The father is described only in words traceable to the player's own intake text; the boy never learns the relationship; Elspeth and Gareth origins get one neutral line and no invented ties. `slip_boy_known` is set on `lied` (he watches you lie for him), on `employed` (Dell says his name in front of you), and on the mob's freed-success; the `caught` route never learns it — that silence is the route's cost, stated in the aftermath table in §7.)*

### 6.10 The ration loops (paid racks + free tab)

```choicescript
*label pv_slip_rations
You step up to the smoking racks. Slabs of eel hang dark and oily over a slow peat-fire, and a monger's girl cuts them down onto brown paper without asking what you want until you say it.

*label pv_slip_rations_loop
*choice
  # Take a slab of smoked eel. (4 Copper Bits)@{show_stat_hints  [+3 Temp HP]|}
    *if ((((gold * 100) + (silver * 10)) + copper) < 4)
      You don't have enough copper for the eel.
      *goto pv_slip_rations_loop
    *set tavern_item_cost_copper 4
    *set tavern_item_hp_heal 0
    *set tavern_item_temp_hp 3
    *set tavern_item_type "food"
    *set tavern_item_buff_bonus 0
    *gosub_scene startup buy_tavern_item
    The eel is dense and sweet with brine-smoke, cut thick enough to be a meal and not a courtesy. You eat it standing at the rail like the porters do, watching the tide work the ladder.
    *goto pv_slip_rations_loop
  # Back to the slip.
    *goto pv_slip_menu

*label pv_slip_free_ration
*comment The free tab. Grant and cadence differ by route (Mael's slip-tab on
*comment "caught"/"employed", the boy's standing eels on "lied"), but the
*comment mechanics are the mess-hall/Anchor shape: rolling-7-day window, cap 3,
*comment consumption inside a stat_bump_locked guard that also resets the
*comment hunger clock. This page owns its own time_advance_locked, so
*comment stat_bump_locked (not stat_bump2) is the right pair -- pv_anchor_hub.
*set hours_to_pass 0
*set minutes_to_pass 15
*set time_advance_call_id "pv_slip_free_ration_1"
*gosub_scene calendar advance_time
*if (not(stat_bump_locked)) or (not(locked_stat_bump_page_id = choice_page_id))
  *set minutes_since_meal 0
  *set hunger_stage "Fed"
  *set neglect_damage_hunger 0
  *set slip_rations_used + 1
  *set stat_bump_locked true
  *set locked_stat_bump_page_id choice_page_id
*gosub_scene calendar recalc_hp_from_neglect

*if (hp_current <= 0)
  *comment The meal above already zeroed the hunger side, so a death here is
  *comment unambiguously fatigue, not hunger (mirrors pv_anchor_hub's comment).
  *set death_cause "exhaustion"
  *goto_scene death death_screen

*if (slip_resolution = "lied")
  The sacking bundle is where he said it would be, tied off with tarred twine and not a soul nearby who could swear to having seen you take it. Smoked eel, bread wrapped in a leaf, a heel of hard cheese that has no honest business being in a thief's larder.
*else
  Mael ladles your portion against her own count and watches you eat it standing up, the way she watches everything — priced, weighed, and entered.
*page_break Eat by the water…
*goto pv_slip_menu
```

*(The paid item deliberately competes with the Keel's 3-copper stew: 4 copper, +3 Temp HP, no stat buff (`tavern_item_buff_bonus 0`, the `port_valen_eat_mess` field set) — temp-HP versus the Keel's CON buff is a real menu choice, and the eel is a protein-rich meal rather than a hot drink's comfort. No `*gosub recalc` after the purchase, per the tavern bar's own order of operations (`port_valen.txt:896-908`).)*
---

## 7. Rewards, scale, and what each route actually pays

| Route | Immediate coin | The tab (3/free rolling week) | The pipe & the future |
|---|---|---|---|
| **Caught** (your catch) | 2 silver from Mael | Mael's slip-tab | The boy rows out with the tide's crews — Rumor 3 gains a rower. The district remembers a clean job done cold. |
| **Complicit** (the mob's catch) | 0 (the net-men took the two silver) | none | The same dark future, witnessed instead of chosen. The slip's ambients stay cold. |
| **Lied** | 0 | the boy's standing eels — stolen goods, on the nail | The workhouse pipe opens: word and rations travel down, something travels back. Jorick beat lives here. |
| **Employed** | 2 silver from Mael | Mael's slip-tab | The pipe opens *and* the boy eats honest — the one route that pays twice, bought with a spent Dell favor and a CHA gate. |
| **Hush** | 3–4 silver, once | none | The count-man owns you a small silence; eels keep walking; the slip's welcome is thinner. |
| **Walked** | 0 | none | The shortage continues; nobody owes anybody. |

Scale check (Rules §3): every payout sits inside the 1–5 silver street band — the two-silver bounty is under half the Watch's *smallest* municipal figure and a fifth of Silt-Gate's 12-silver; the 4-silver hush is the band's ceiling and buys silence, not justice. No faction reputation moves anywhere, per the Crane Three rule. The tab is the §6 "minor/street task" perk: one NPC's standing arrangement, not a system. The paid 4-copper eel is the QUESTS.md table's "Eel & Smoked Fish Rations" row, finally real.

**What the Jorick pipe is worth:** nothing mechanical yet, by design. It is a thread-end tied to the player's own intake — `slip_jorick_word_sent` exists so a later chapter (the muster clerk's "we'll send the chit," `startup.txt:2102`) has a street-level counterpart to build on. `QUESTS.md` should log it as *planted, unresolved*.

---

## 8. Reuses vs. must-be-built

**Reuses (no new plumbing):**
* `advance_time` / `recalc_hp_from_neglect` / death-screen routing — as every POI does.
* `roll_d20_check` + `advantage`/`disadvantage` + `guidance_active` hints + `show_stat_hints` inline `@{...}` pattern.
* `buy_tavern_item` for the paid eel; the Anchor's direct hunger-clock reset for the free tab.
* `currency_add` + `currency_txn_locked` (all three payouts ride it).
* `stat_bump_locked` pair for tab consumption (Anchor precedent, same-page `time_advance_locked` ownership).
* The rolling-7-day window shape (`port_valen.txt:467-469`, `port_valen_dredge_end.txt:819-821`).
* The 9-slot cantrip guard chain (copied from `port_valen_dredge_end.txt:288`).
* Crane state reads: `crane_seen`, `crane_shifts_completed` (gate), `crane_dell_regard` (spent defensively).
* `family_name` from intake (the Jorick beat; `startup.txt:2100-2106`).
* The harbor POIs menu structure and the entry-cost convention (15 min).

**Must-be-built:**
* Fourteen labels in `port_valen.txt` (listed in §6's wiring map), roughly 480–560 lines with prose.
* The 16-variable block in `startup.txt` (§5).
* One menu line in `port_valen_harbor_pois`.
* `quest/QUESTS.md` sync (below).
* No new scene file, no `compile.js`/`verifyFileName` change, no codex entry (the fish market is not a faction — the pier already carries `codex_port_valen`).

**`quest/QUESTS.md` sync (implementation-time, three edits):**
1. New chapter entry — *"Quest 5: The Slip Thieves — The Fishmongers' Slip"* — after the Rusty Anchor section, with the objective flow, DCs, reward table, and variable list from this plan.
2. Harbor POIs table: update the Fishmongers' Slip row from docs-only to implemented (paid rations, free tab post-quest, stakeout hours).
3. Complete Variables Index: append the 16 `slip_*` creates. Also add one node to the Chapter 3 mermaid graph.

---

## 9. Compliance checklist

* **Rules §1 — Organic discovery.** The hook is a chalk stub over a brine-line and a monger talking to herself about her own losses, not a badge-scan or a noticeboard. Mael reads the player's *kit*, never their colors; the boy reads behavior ("You're staring at my barrels"). The bounty is overheard-style, pitched the way Voss pitches the Silt-Gate.
* **Rules §2 — Multi-branching.** Five exits with real archetype parity: DEX catches, CHA lies and extorts and brokers, INT lays out the skim, WIS reads both the ladder-line and the ledgers, STR shields. Arcane coverage: Minor Illusion (9-slot guard, advantage at the catch). Every failure is fail-forward — the botched stakeout arms the mob morning; the failed lie keeps the boy's trust; the failed employ leaves all other exits live; the failed hush costs welcome, not progress. Zero HP costs anywhere (see §3's recalc-overwrite note).
* **Rules §3 — Low-fantasy economy.** 2-silver bounty / 2-silver employ pay / 4-silver hush ceiling: all inside the street band, below half of Silt-Gate's smallest figure, proportionate to Mael's own arithmetic (three barrels in nine days). The mercenary dilemma is the structure, not the garnish: lawful (bounty), underworld (hush), and a third thing this game does better than either — a boy kept whole.
* **Rules §4 — Setting & technology.** Brine, peat-smoke, hand-carts, tally-boards, chalk, bond-men, cargo nets. Nothing invented past 1530; no firearms (run `node tools/lint_anachronisms.js` before finalizing). No weapons drawn, so `node tools/lint_weapon_assumption.js` should also pass clean.
* **Rules §5 — State hygiene.** Every payout rides `currency_txn_locked`; the tab rides `stat_bump_locked` with the page's own `time_advance_locked`; every time advance has a unique `time_advance_call_id`; `slip_bounty_claimed` guards the once-only payout; `slip_quest_stage` transitions exactly once (idempotent lock at the top of `pv_slip_aftermath`); conversation is free, waits cost the clock.
* **Rules §6 — Open-world integration.** The quest lives in a real POI in the harbor hierarchy, reacts to time-of-day (shuttered nights), day-of-week (Marketday gossip), and resolution (five ambient variants); the perk is scoped to §6's minor-task band (one NPC's standing arrangement, capped like the mess).
* **narrative_guidelines §4 — Continuity.** The Jorick beat is triple-gated and grounded only in the intake text (`startup.txt:2100-2106`); the boy never learns the relationship; Elspeth/Gareth get neutral lines; Rumor 3 is echoed in shape, never quoted; no absolute claims about the player's wider history anywhere in the prose; `crane_dell_regard` is spent defensively (only if > 0) since its increment site is conditional.
* **Replay safety note (narrative_guidelines §13 pattern):** the free-ration page owns its own `time_advance_locked`, so `stat_bump_locked` — not `stat_bump2_locked` — is the correct independent lock, matching `pv_anchor_hub`, not `port_valen_eat_mess` (whose page already had an advance in flight).

---

## 10. Open decisions (to resolve at implementation start)

1. **Names.** Pike / Widow Mael / Odo are placeholders. Recommendation: keep — they sit in the district's register without colliding (Maret, Mael is the only near-pair; change Mael to e.g. *Brey* if it reads too close on the page).
2. **The boy's name reveal.** Currently granted on `lied`, `employed`, and the mob's freed-success — never on `caught`/`hush`/`walked` (on `caught`, Dell's line "my sister's boy" does it *if* employed). Recommendation: keep; the withheld name is the dark routes' texture.
3. **Extort availability.** Currently decoupled from the catch (any route can compare the ledgers via `pv_slip_skim`). Alternative: catch-only, which makes the hush exit a reward for archetype success. Recommendation: keep decoupled — Rules §2 wants every build to reach every ending.
4. **`crane_dell_regard` spend vs. gate-only.** Currently spent −1 if > 0, gated on `crane_shifts_completed >= 1`. Recommendation: keep both — the gate reads provable state, the spend preserves the variable's meaning as a consumable favor.
5. **The "lied" tab being stolen goods.** The boy's eels as a standing perk is morally spicier than Mael's honest one. Recommendation: keep — it is the route's identity, and the cap text ("a body's still got to buy its bread, or they'll know") carries the world's own suspicion of it.
6. **The mob's complicit outcome granting no tab and no bounty.** Recommendation: keep — it is the one outcome where watching costs something, and `slip_mob_outcome "complicit"` leaves a clean flag for later district memory (the Anchor's `anchor_tally_grudge` pattern).
7. **Post-quest Jorick presence.** Currently aftermath-only (`slip_jorick_word_sent` logged as planted, unresolved). Recommendation: keep for this quest's scope; the muster clerk's chit line belongs to a later chapter.

**Status of this document:** complete. Implementation, when approved, touches exactly three files — `startup.txt` (§5 block), `port_valen.txt` (§6 labels + one menu line) — plus the `quest/QUESTS.md` sync listed in §8, with `node tools/lint_anachronisms.js` and the repo's quicktest pass as the closing gates. Per the commissioning note, no code has been written yet; this file is the whole of the change.