# Quest Plan: The Dealer's Real Money (The Boat-Sheds Scrap Yard)

A minor, low-stakes recruitment quest for **the scrap yard** in Dredge-End. Answers the question "what happens if you sell scrap to the same dealer for two weeks straight" — and hands the player their first taste of Black Oath work as a *reward*, not an obstacle to overcome. **The player never learns it's Black Oath work at this stage** — Hask connects them to "a man he does business with" who needs a runner, and nothing carried is illegal or dangerous. `black_oath_rep` still ticks up in the background; the reveal is reserved for later content. Scoped as a Minor/Street Task (`QUEST_DESIGN_RULES.md` §6): no faction-shift climax, and it deliberately does not carry the full three-branch Mercenary Dilemma structure that the bigger district quests use — see the Design Notes at the end for why, and push back on that if you want the harder version instead.

---

## 1. Overview & Cast

* **Location:** The scrap yard at `cut_sheds_hub` (Dredge-End).
* **Trigger:** the 14th time the player sells scrap to the dealer (`cut_scrap_sold_count`, a new counter — see §6). At roughly one wading trip and one sale per day, that's about two weeks of honest mudlarking before he decides this face is worn down enough to make the offer.
* **Cast:**
  * **The Scrap Dealer (Hask):** currently unnamed in prose ("a wide, slow man in a greased canvas apron"). He gives his name at this exact beat, once he's decided the player is worth naming — matches the "names introduced in-story only" rule. Slow, unhurried, watches hands and boots before faces. Already established fencing hot chain with rasped-off harbor-master proof-stamps (his 2nd rumor line, `cut_rumors_scrap = 2`), so he's Oath-adjacent, not Oath leadership — a middleman, not a boss.

---

## 2. The Approach (fires once, on the 14th sale)

Appended to the *existing* sale text at `cut_sheds_hub`, after the coins are counted out — same beat, not a new hub option:

> He counts the copper bits into your palm from a stained leather pouch, same as he's done thirteen times before this one. This time his thumb stays closed over the last coin.
>
> "You're back again," he says. Not a question. "Same mud, same few coppers, week in and week out." He looks you over the way a man checks a rope before he trusts his weight to it — not your face, your hands and your boots. "Name's Hask. There's real money moves through this quarter. Not this." He nods at the empty balance pan. "But it's not weighed anywhere a man with clean hands gets to watch."
>
> He waits, watching you, and doesn't say anything more.

```choicescript
*choice
  # Ask him what he means.
    *goto scrap_vetting_pitch
  # Take your coin and go. Not today.
    *set scrap_vetting_offer_seen true
    "Suit yourself," he says, and goes back to his scales without another look.
    *goto cut_sheds_hub
```

Declining is **not permanent** — once `scrap_vetting_offer_seen` is true, a standing hub option appears ("Ask Hask about the real money he mentioned") so the player can pick this up any later visit, same forgiving shape as Crane Three's offer rather than the Pier's one-shot permanent decline. This is a job offer, not a life-or-death rescue; nothing in the fiction demands it be a single irreversible moment.

---

## 3. The Pitch (`scrap_vetting_pitch`)

> He glances once down the row of sheds, though nobody's close enough to hear over the draw-knives. "Man I do business with always needs somebody to carry word and small parcels between people who'd rather not walk the lanes themselves. Nothing heavy, nothing that'll get you in trouble if you're stopped and asked to open one. He just needs somebody who delivers what he's given, doesn't dawdle, and doesn't ask who anything's for." He shrugs. "I don't send him just anybody. You've shown up here often enough that I'm willing to put your name to him. Doesn't mean he'll trust you either, not yet."
>
> "It's a full afternoon of it — several stops, all over the quarter, before you're done. He'll know soon enough whether you're worth sending again."

```choicescript
*choice
  # Ask what's actually in the parcels.
    "Whatever he's given me to hand you," he says. "I don't open them and neither do you. That's the whole job."
    *goto scrap_vetting_pitch
  # Take the round.${hint_scrap_vetting}
    *goto scrap_vetting_run
  # Walk away from it.
    *set scrap_vetting_offer_seen true
    "Your loss," he says, and doesn't ask again today.
    *goto cut_sheds_hub
```

---

## 4. The Job — Running the Quarter (`scrap_vetting_run` first time, `hask_courier_run` after)

One mechanic used two ways — the first attempt, then its own repeatable form afterward — the same shape Crane Three already uses (its first shift and every repeat shift share identical mechanics, just different framing text). One bottleneck beat, three archetype approaches converging on the same outcome (Branch-and-Bottleneck, `QUEST_DESIGN_RULES.md` §2): this is one round of deliveries, not a multi-beat plot, so it's one roll standing in for the whole afternoon — the same abstraction Crane Three uses for its own multi-crate hold (one roll represents the whole 2.5-hour shift, not one roll per crate).

**Nothing carried is illegal, and nothing about the risk is legal jeopardy.** The tension is entirely "can this person be trusted to do a plain job competently and keep quiet," not "will they get caught." That rules out any failure built around detection, an authority figure, or a description matching a report — all of that belongs to a different kind of story than this one.

* **Time cost:** 6 hours (`hours_to_pass 6`) — raised +2h across every day job in the district at once, see the Economics Check.
* **Stops (flavor only, not a counted mechanic):** the round runs to several points across Dredge-End rather than one fixed destination — reuses locations and background figures the district already establishes rather than inventing new named characters: a parcel left with someone minding the market stalls near the chandler's stair (Area 1), word passed to one of the lookouts on the Gangways rail (Area 2, already established as a whistle-signal relay point — a natural fit for "somebody used to passing word along without being told why"), and a bundle handed off to someone waiting near the foot of Lamp Stair (Area 5). Three stops plus the return, at the ~15-20 minutes one-way this file already uses for a comparable short local move, is real walking time but not six hours of it on its own — the rest is waiting for the right moment at each hand-off rather than just barging up and thrusting a satchel at someone. The prose should gesture at "a full afternoon of it, more waiting than walking" rather than making the player click through each stop individually.
* **Cadence:** once every 2 days — `scrap_vetting_day`/`hask_courier_day` (campaign_day of the last attempt) checked as `(campaign_day - X_day) >= 2`.

> Hask hands over a canvas satchel, already packed: a few wrapped parcels, nothing heavy, nothing that rattles or clinks. "Market stall, the gangway rail, the foot of Lamp Stair. In that order, or don't bother going at all. Whoever's waiting will know you by the satchel, not your face."

```choicescript
*choice
  # Keep a hard, steady pace between stops and get the whole round done before the light turns.${hint_scrap_str}
    *set check_stat "str"
    *set check_dc 12
    *set check_skill "Keep the Pace"
    *goto scrap_vetting_resolve
  # Take the fastest cuts between each stop, and don't waste a step doubling back.${hint_scrap_dex}
    *set check_stat "dex"
    *set check_dc 12
    *set check_skill "Know the Shortest Way"
    *goto scrap_vetting_resolve
  # Keep every hand-off brief and businesslike, in and out without lingering to talk.${hint_scrap_cha}
    *set check_stat "cha"
    *set check_dc 11
    *set check_skill "Keep It Brief"
    *goto scrap_vetting_resolve
```

**Resolution (`scrap_vetting_resolve`):**

* **Success, first time only (one-time guard):**
  > All three parcels change hands without a wasted word, and you're back at the sheds before the satchel's had time to go stiff with damp.
  >
  > Hask counts out the coin without much comment, same flat count as every sale before it. "Same again in a couple of days, if you're still around," is all he says, and goes back to his scales.

  * `[b][💰 Deliveries Made: +15 Copper Bits][/b]`
  * `black_oath_rep +1` (never named or explained on-screen — the player-character has no idea who they just did a favor for; see Design Notes)
  * `hask_courier_unlocked true`
  * `scrap_vetting_quest_stage "resolved"`
  * `hask_courier_count + 1`
  * Unlocks the standing "Ask Hask if there's a round to run" hub option.

* **Success, ordinary run:**
  > Same three stops, same satchel, and nobody so much as looks at you twice by the third hand-off.

  * `[b][💰 Deliveries Made: +15 Copper Bits][/b]`
  * `hask_courier_count + 1`
  * No further `black_oath_rep` change — that was the first run's reward specifically, so the loop doesn't quietly farm reputation the way Crane Three's old silver farmed the writ.
  * Once `hask_courier_count` crosses a threshold (see Design Notes), this is where "another job" would start being offered — not built yet.

* **Failure (fail-forward, every attempt — no permanent flag, no escalating DC, since nothing here is illegal and there's no authority to get more alert):**
  > One hand-off runs long — a wrong turn, a slow crowd, a stop that keeps talking past when you'd rather be gone — and by the time you're back the satchel's a delivery short.
  >
  > Hask's mouth flattens, but his hands don't stop moving over the scales. "Doesn't fill me with confidence," is all he says.

  * `[b][💰 Deliveries Made: +5 Copper Bits][/b]` (partial — most of the round still got done)
  * No `black_oath_rep` change, no `hask_courier_count` increment (a fumbled round doesn't count toward "enough of these").
  * `scrap_vetting_quest_stage` stays `"active"` if this was the first attempt — no hard failure state here, see Design Notes.

---

## 5. Economics Check

**Every Dredge-End day job is getting +2 hours** (your call, applies district-wide, not just here): wading 3h→5h, the dredge-landing shift 4h→6h, and this courier round 4h→6h; Crane Three (Harbor) goes 2.5h→4.5h too. Intent: 2 jobs should eat most of a 14-hour working day (07:00-21:00, Morning through Dusk), and 3 shouldn't fit at all without spilling past the point where the later jobs' own "not Night/Pre-Dawn" gates close them out. Same-district 2-job math (e.g. wading + dredge shift) lands at 11h; a cross-district pairing with Crane Three (+~2.5h round-trip travel) lands at 12-13h; any 3-job combination clears 17h and doesn't fit in one calendar day.

15 copper every 2 days (≈7.5 copper/day average) is now barely ahead of wading's 3 copper/hour (15/6h = 2.5/hour) — a touch worse per hour than wading, if anything. Worth having open eyes about: since nothing illegal ever gets said out loud, the *pitch* can't lean on "real money" quite as hard as the original draft did — the actual draw at this stage is being trusted with something at all, not the wage. The coin buys the player's time; `black_oath_rep` and the door to "another job" are the real prize, same conclusion as before, just for a cleaner reason this time (there's no smuggling premium to justify a bigger number).

---

## 6. Variables

```choicescript
*create cut_scrap_sold_count 0         *comment times sold TO Hask specifically -- fires the offer at 14
*create scrap_vetting_offer_seen false *comment Hask has raised it at least once; makes the ask-again hub option available
*create scrap_vetting_quest_stage "unstarted" *comment "unstarted", "active", "resolved"
*create scrap_vetting_day 0            *comment campaign_day of the last delivery-round attempt (either stage); blocks a retry inside 2 days
*create hask_courier_unlocked false    *comment first round resolved; unlocks the standing "run a round" hub option
*create hask_courier_count 0           *comment lifetime SUCCESSFUL rounds; RESERVED to gate "another job" later (see Design Notes)
```

`scrap_vetting_day` doubles as the ongoing job's cadence clock too (no separate `hask_work_day` needed now — one clock, one meaning, since first attempt and every later attempt share identical stakes).

`cut_scrap_wade_count` (added in the earlier exploit-fix pass) becomes unused once this ships, since the trigger moved to sales rather than wading attempts — recommend deleting it rather than leaving orphaned state, unless you want it kept for something else.

---

## 7. Design Notes / Open Questions

* **`black_oath_rep` moves without the player ever being told why.** This is deliberate — you said the player is unknowingly running for a Black Oath associate, so the text can never name them, and the protagonist has no way to know. Mechanically this is just a background stat change, same as any other; nothing in `narrative_guidelines.md` requires the *player-character* to understand every number that moves, only that the *narration* never asserts knowledge the character doesn't have. The reveal (if any) belongs to whatever later quest cashes this in.
* **"Another job" is a future hook, not built here.** Proposed gate: `hask_courier_count >= 6` (at the 2-day cadence, that's about 12 days of reliable running — comparable in length to the ~2 weeks of mudlarking that got the player this far in the first place). What that job actually is stays open; presumably it's the first point where "not carrying anything illegal *yet*" stops being true.
* **No hard failure state on the courier job.** `QUEST_DESIGN_RULES.md` §2 says every quest needs a genuine loss state, but that's written against the bigger climax-grade quests (Rotten Rib, the Pier). This is Minor/Street scope (§6) — like Crane Three, which also has no failure-ends-everything state, and there's even less reason for one here than in the old iron-hauling draft, since nothing failure-adjacent is remotely dangerous. A fumbled round just pays less and doesn't count toward the trust counter.
* **Only three archetypes (STR/DEX/CHA), no INT/WIS option.** Kept to three since this is a single bottleneck beat, not a multi-beat investigation that needs a fourth angle.
* **Hask stays unnamed until his own beat (§2)** — consistent with how Dell, Wenna, Marl and Tobin are all introduced in-story rather than up front. The associate at the other end of this job stays unnamed too, and should stay that way for as long as this quest exists on its own.
* **The chandler's upper-room stub is deliberately NOT wired into this plan.** That stays the separate, bigger investigation-grade quest we discussed earlier. `black_oath_rep` and `hask_courier_count` are exactly the kind of state that quest (or "another job" above) would want to read as a prerequisite later, but nothing here commits to that shape yet.
