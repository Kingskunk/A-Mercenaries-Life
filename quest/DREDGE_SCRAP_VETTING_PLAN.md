# Quest Plan: The Dealer's Real Money (The Boat-Sheds Scrap Yard)

A minor, low-stakes recruitment quest for **the scrap yard** in Dredge-End. Answers the question "what happens if you sell scrap to the same dealer for two weeks straight" — and hands the player their first taste of Black Oath work as a *reward*, not an obstacle to overcome. Scoped as a Minor/Street Task (`QUEST_DESIGN_RULES.md` §6): one recruitment test, no faction-shift climax, and it deliberately does not carry the full three-branch Mercenary Dilemma structure that the bigger district quests use — see the Design Notes at the end for why, and push back on that if you want the harder version instead.

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
> He waits. Whatever comes next, he's not saying it until you ask.

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

> He glances once down the row of sheds, though nobody's close enough to hear over the draw-knives. "Most weeks nobody official cares what's under a mud crust — you've seen that yourself by now. This week's different. A length of chain went missing off a barge two nights back, and somebody filed a loss on it. Description's going around that matches a barrow I've got sitting behind the pen too well for comfort. I can't be the one seen carrying it — every regular hand on this bank already owes somebody money or a favor, and half of them know exactly what's missing and from where." He shrugs, like it costs him nothing either way. "You don't. Not yet. That's worth something to him."
>
> "It's not one barrow, it's the whole lot behind the pen — four or five loads, back and forth to the chandler's stair, before word of the loss gets stale. You'll know inside the first load whether you've got the stomach for the rest of it."

```choicescript
*choice
  # Ask what happens if you're seen.
    "Then you put it down and walk away from it," he says, flat. "Sitting in a yard, it's just scrap nobody can prove anything about. Carried in the open with a description going around that matches, it's evidence. That's yours to lose, not mine."
    *goto scrap_vetting_pitch
  # Start hauling loads.${hint_scrap_vetting}
    *goto scrap_vetting_run
  # Walk away from it.
    *set scrap_vetting_offer_seen true
    "Your loss," he says, and doesn't ask again today.
    *goto cut_sheds_hub
```

---

## 4. The Job — The Barrow Relay (`scrap_vetting_run` first time, `hask_work_run` after)

One mechanic, used two ways — the trust-test the first time, then its own repeatable form afterward — the same shape Crane Three already uses (its first shift and every repeat shift share identical mechanics, just different framing text). One bottleneck beat, three archetype approaches converging on the same outcome (Branch-and-Bottleneck, `QUEST_DESIGN_RULES.md` §2): this is one relay shift, not a multi-beat heist, so it's one roll standing in for the whole shift — the same abstraction Crane Three uses for its own multi-crate hold (one roll represents the whole 2.5-hour shift, not one roll per crate).

* **Time cost:** 4 hours (`hours_to_pass 4`).
* **Trip count (flavor only, not a counted mechanic):** the scrap yard (Area 3) and the chandler's stair (Area 1) sit two area-lengths apart along the canal bank, with the Gangways (Area 2) between them — not adjacent, but not a cross-district haul either. At the ~15-20 minutes one-way this file already uses for a comparable short local move, a loaded barrow's round trip plus hand-off runs ~45-50 minutes, so **4-5 laps** fit a 4-hour shift. The prose should gesture at "a few loads" rather than making the player click through each one individually.
* **Cadence:** once every 2 days, not daily — `scrap_vetting_day`/`hask_work_day` (campaign_day of the last attempt) checked as `(campaign_day - X_day) >= 2`, not `X_day < campaign_day`. Applies to both the vetting attempt's retry gate and the ongoing job.

> The first barrow's already waiting under a canvas tarp behind the scrap pen: real weight in it, iron by the feel, and nothing about it says where it came from. There will be three or four more behind it before the lot's moved.

```choicescript
*choice
  # Haul at a hard, fast pace through the back lanes, load after load, and be past the risk window before anyone's looking twice.${hint_scrap_str}
    *set check_stat "str"
    *set check_dc 12
    *set check_skill "Force the Pace"
    *goto scrap_vetting_resolve
  # Keep to the side cuts and blind corners each trip, and time the gaps in foot traffic.${hint_scrap_dex}
    *set check_stat "dex"
    *set check_dc 12
    *set check_skill "Thread the Backstreets"
    *goto scrap_vetting_resolve
  # Walk each load straight down the open lane with a story about scrap for the boatwrights ready on your tongue.${hint_scrap_cha}
    *set check_stat "cha"
    *set check_dc 11
    *set check_skill "Bluff the Lane"
    *goto scrap_vetting_resolve
```

**Resolution (`scrap_vetting_resolve`), branches on whether this is the first attempt (`scrap_vetting_quest_stage = "active"`) or an established run (`hask_trusts_you`):**

* **Success, first time (the vetting job):**
  > By the last load your arms are dead and you're wrung out with sweat, but every barrow made it to the foot of the chandler's stair, and the man on the step took each one without a word.
  >
  > Back at the sheds, Hask counts out real coin — not a fortune, but honest weight for dishonest work, and more than you'd see wading a day of mud for it. "Come find me when you want another," he says, and for the first time he uses your name instead of just watching your boots.

  * `[b][💰 Barrow Relay: +15 Copper Bits][/b]`
  * `black_oath_rep +1`
  * `hask_trusts_you true`
  * `scrap_vetting_quest_stage "resolved"`
  * Unlocks the standing "Ask Hask if there's a load moving" hub option.

* **Success, established (ordinary Quiet Work run):**
  > Same lane, same stair, load after load, and nobody looks at you twice anymore.

  * `[b][💰 Barrow Relay: +15 Copper Bits][/b]`
  * No further `black_oath_rep` change — that was the vetting job's reward specifically, so the loop doesn't quietly farm reputation the way Crane Three's old silver farmed the writ.

* **Failure, first time (fail-forward, not a dead end):**
  > On one of the middle loads, a man stops near the corner and crouches by a length of chain poking loose from under the tarp, turning one link over between two fingers like he's checking it against something he's carrying in his head. You don't wait to find out what. You leave that barrow half a lane short of the stair and walk the other way, your heart going hard, the rest of the loads still sitting behind the pen.
  >
  > Hask's face doesn't change when you come back short, but he doesn't offer you another load today either. "Let it cool," is all he says.

  * No coin.
  * `hask_wary true` (permanent, one-time) — every retry archetype's DC rises by 1.
  * `scrap_vetting_day campaign_day` — the 2-day cadence gate above blocks an immediate retry.
  * `scrap_vetting_quest_stage` stays `"active"`. There is no hard failure state here — see Design Notes.

* **Failure, established (ordinary Quiet Work run):** lower stakes once trust exists — nobody's testing the player anymore, just a rough shift.
  > One load runs late, and by the time you're back for the next the light's against you. Hask shrugs it off same as any other bad day at any other job.

  * `[b][💰 Barrow Relay: +5 Copper Bits][/b]` (the loads still move, just slower — no `hask_wary`, no rep change, just a worse day's pay; kept at roughly the same fraction of the (now lower) success payout as before).

---

## 5. Economics Check

Reverted from 24 back to 15 copper on success per your call. Quiet Work now pays 15 copper every 2 days (≈7.5 copper/day average) — barely ahead of wading's 3 copper/hour (15/4h = 3.75/hour), which is worth having open eyes about: the whole pitch was "real money," and at this rate the loop's actual draw is `black_oath_rep` and the door it opens, not the coin. That's a legitimate design choice (the reward is standing, not wages) — just flagging that the "real money" line in Hask's pitch (§3) may want a rewrite if the coin itself isn't meant to carry the sell.

---

## 6. Variables

```choicescript
*create cut_scrap_sold_count 0         *comment times sold TO Hask specifically -- fires the offer at 14
*create scrap_vetting_offer_seen false *comment Hask has raised it at least once; makes the ask-again hub option available
*create scrap_vetting_quest_stage "unstarted" *comment "unstarted", "active", "resolved"
*create scrap_vetting_day 0            *comment campaign_day of the last barrow-relay attempt (either stage); blocks a retry inside 2 days
*create hask_wary false                *comment set on a failed FIRST attempt; +1 DC on every retry archetype, permanent
*create hask_trusts_you false          *comment quest resolved; unlocks the standing Quiet Work hub option
*create hask_work_day 0                *comment campaign_day of the last established run; same 2-day cadence as scrap_vetting_day
```

`scrap_vetting_day` and `hask_work_day` are functionally the same clock (campaign_day of the last relay run, whichever stage) — kept as two names only because they read clearer at their two call sites; fold them into one variable if you'd rather not carry two names for one clock.

`cut_scrap_wade_count` (added in the earlier exploit-fix pass) becomes unused once this ships, since the trigger moved to sales rather than wading attempts — recommend deleting it rather than leaving orphaned state, unless you want it kept for something else.

---

## 7. Design Notes / Open Questions

* **No hard failure state on the vetting job.** `QUEST_DESIGN_RULES.md` §2 says every quest needs a genuine loss state, but that rule is written against the bigger climax-grade quests (Rotten Rib, the Pier). This is Minor/Street scope (§6) — like Crane Three, which also has no failure-ends-everything state. The retry-at-higher-DC-with-a-2-day-gate cost is the fail-forward teeth here. Flag if you'd rather this have a real "Hask writes you off for good" failure branch (e.g. two strikes, like Rotten Rib) — that's a straightforward addition if you want the harder version.
* **Only three archetypes (STR/DEX/CHA), no INT/WIS option.** Kept to three since this is a single bottleneck beat, not a multi-beat investigation that needs a fourth angle. Could add "read the clerk's rounds schedule" as an INT option if you want full stat coverage here.
* **Hask stays unnamed until this beat** — consistent with how Dell, Wenna, Marl and Tobin are all introduced in-story rather than up front.
* **The chandler's upper-room stub is deliberately NOT wired into this plan.** That stays the separate, bigger investigation-grade quest we discussed earlier (loyal/discreet as the default path, Watch-report as the one path that costs Oath standing). `hask_trusts_you` and `black_oath_rep` are exactly the kind of state that quest would want to read as a prerequisite later, but nothing here commits to that shape yet.
