# Quest Plan: The Dealer's Real Money (The Boat-Sheds Scrap Yard)

A minor, low-stakes recruitment quest for **the scrap yard** in Dredge-End. Answers the question "what happens if you sell scrap to the same dealer for two weeks straight" — and hands the player their first taste of Black Oath work as a *reward*, not an obstacle to overcome. Scoped as a Minor/Street Task (`QUEST_DESIGN_RULES.md` §6): one recruitment test, no faction-shift climax, and it deliberately does not carry the full three-branch Mercenary Dilemma structure that the bigger district quests use — see the Design Notes at the end for why, and push back on that if you want the harder version instead.

---

## 1. Overview & Cast

* **Location:** The scrap yard at `cut_sheds_hub` (Dredge-End).
* **Trigger:** the 14th time the player sells scrap to the dealer (`cut_scrap_sold_count`, a new counter — see §5). At roughly one wading trip and one sale per day, that's about two weeks of honest mudlarking before he decides this face is worn down enough to make the offer.
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
> "One run, before word of the loss gets stale. You'll know before you're halfway there whether you've got the stomach for the rest of it."

```choicescript
*choice
  # Ask what happens if you're seen.
    "Then you put it down and walk away from it," he says, flat. "Sitting in a yard, it's just scrap nobody can prove anything about. Carried in the open with a description going around that matches, it's evidence. That's yours to lose, not mine."
    *goto scrap_vetting_pitch
  # Take the barrow.${hint_scrap_vetting}
    *goto scrap_vetting_run
  # Walk away from it.
    *set scrap_vetting_offer_seen true
    "Your loss," he says, and doesn't ask again today.
    *goto cut_sheds_hub
```

---

## 4. The Vetting Job — The Barrow Run (`scrap_vetting_run`)

One bottleneck beat, three archetype approaches converging on the same outcome (Branch-and-Bottleneck, `QUEST_DESIGN_RULES.md` §2) — this is a test, not a heist, so it's sized like the culvert pattern: one roll, real fail-forward, no separate climax beat.

* **Time cost:** 2 hours (`hours_to_pass 2`), once per attempt.
* **Retry gate:** `scrap_vetting_day` (campaign_day of the last attempt) — Hask won't send the player out twice in the same day regardless of outcome ("things need to cool" after a failure; "the load isn't ready twice in a day" after a success that hasn't resolved yet — though success ends the quest, so this only matters for a failed retry).

> The barrow's under a canvas tarp already, wheeled out from behind the scrap pen: real weight in it, iron by the feel, and nothing about it says where it came from.

```choicescript
*choice
  # Haul it at a hard, fast pace through the back lanes and be past the risk window before anyone's looking twice.${hint_scrap_str}
    *set check_stat "str"
    *set check_dc 12
    *set check_skill "Force the Pace"
    *goto scrap_vetting_resolve
  # Keep to the side cuts and blind corners, and time the gaps in foot traffic.${hint_scrap_dex}
    *set check_stat "dex"
    *set check_dc 12
    *set check_skill "Thread the Backstreets"
    *goto scrap_vetting_resolve
  # Walk it straight down the open lane with a story about scrap for the boatwrights ready on your tongue.${hint_scrap_cha}
    *set check_stat "cha"
    *set check_dc 11
    *set check_skill "Bluff the Lane"
    *goto scrap_vetting_resolve
```

**Resolution (`scrap_vetting_resolve`):**

* **Success:**
  > You get the barrow to the foot of the chandler's stair with your pulse still your own. The man on the step doesn't say a word, just looks the tarp over once, jerks his chin, and takes it off your hands.
  >
  > Back at the sheds, Hask counts out real coin — more than a week of mudlarking, for two hours' work. "Come find me when you want another," he says, and for the first time he uses your name instead of just watching your boots.

  * `[b][💰 Barrow Delivered: +15 Copper Bits][/b]`
  * `black_oath_rep +1`
  * `hask_trusts_you true`
  * `scrap_vetting_quest_stage "resolved"`
  * Unlocks the repeatable Quiet Work option (§5).

* **Failure (fail-forward, not a dead end):**
  > Near the corner, a man stops and crouches by a length of chain poking loose from under the tarp, turning one link over between two fingers like he's checking it against something he's carrying in his head. You don't wait to find out what. You leave the barrow half a lane short of the stair and walk the other way, your heart going hard.
  >
  > Hask's face doesn't change when you come back with empty hands, but he doesn't offer you a second barrow today either. "Let it cool," is all he says.

  * No coin.
  * `hask_wary true` (permanent, one-time) — the retry check's DC rises by 1 for every archetype.
  * `scrap_vetting_day campaign_day` — locks out a same-day retry.
  * `scrap_vetting_quest_stage` stays `"active"`; the player can come back another day and try again at the higher DC. There is no hard failure state here — see Design Notes.

---

## 5. The Job It Opens — Quiet Work (repeatable, once `hask_trusts_you`)

This is the direct answer to "successful completion leads into a job": a new standing option at `cut_sheds_hub`, "Ask Hask if there's a load moving today," gated the same way Crane Three's repeatable loop is.

* **Cadence:** once per `campaign_day` (`hask_work_day`).
* **Time cost:** 2 hours — same shape as the vetting run, no separate roll variety needed since the tension was already spent proving trust; this is the payoff, not another test.
* **Check:** a single roll, DC 11, rotating which stat it asks for by a `*rand` pick each time (STR/DEX/CHA) so it doesn't calcify into "always pick STR" — matches the flavor-variety expectation for a job meant to be run dozens of times, same principle as Crane Three's greeting-line pools.
* **Pay:** flat 12 copper on success, 4 copper on a failed run (the load still moves, just late/rough — no combat, no alarm; this is a courier job, not a fight). No `black_oath_rep` change on ordinary runs — the rep bump was the vetting job's reward specifically, so the loop doesn't quietly farm reputation into irrelevance the way Crane Three's silver farmed the writ.
* **Why it beats wading on paper and in fiction:** 12 copper/2h (6/hr) vs. wading's 9 copper/3h (3/hr) — better, but not absurdly so, and it costs something wading doesn't: `black_oath_rep` is now a real fact about the player, and Hask's dialogue can reference it. This is the "graduation" the player earned, not a strictly-better clone of the honest job.

---

## 6. Variables

```choicescript
*create cut_scrap_sold_count 0         *comment times sold TO Hask specifically -- fires the offer at 14
*create scrap_vetting_offer_seen false *comment Hask has raised it at least once; makes the ask-again hub option available
*create scrap_vetting_quest_stage "unstarted" *comment "unstarted", "active", "resolved"
*create scrap_vetting_day 0            *comment campaign_day of the last barrow-run attempt; blocks a same-day retry
*create hask_wary false                *comment set on a failed run; +1 DC on every retry archetype, permanent
*create hask_trusts_you false          *comment quest resolved; unlocks the Quiet Work loop
*create hask_work_day 0                *comment campaign_day of the last Quiet Work run; once/day like Crane Three
```

`cut_scrap_wade_count` (added in the earlier exploit-fix pass) becomes unused once this ships, since the trigger moved to sales rather than wading attempts — recommend deleting it rather than leaving orphaned state, unless you want it kept for something else.

---

## 7. Design Notes / Open Questions

* **No hard failure state on the vetting job.** `QUEST_DESIGN_RULES.md` §2 says every quest needs a genuine loss state, but that rule is written against the bigger climax-grade quests (Rotten Rib, the Pier). This is Minor/Street scope (§6) — like Crane Three, which also has no failure-ends-everything state. The retry-at-higher-DC-with-a-day-gate cost is the fail-forward teeth here. Flag if you'd rather this have a real "Hask writes you off for good" failure branch (e.g. two strikes, like Rotten Rib) — that's a straightforward addition if you want the harder version.
* **Only three archetypes (STR/DEX/CHA), no INT/WIS option.** Kept to three since this is a single bottleneck beat, not a multi-beat investigation that needs a fourth angle. Could add "read the clerk's rounds schedule" as an INT option if you want full stat coverage here.
* **Hask stays unnamed until this beat** — consistent with how Dell, Wenna, Marl and Tobin are all introduced in-story rather than up front.
* **The chandler's upper-room stub is deliberately NOT wired into this plan.** That stays the separate, bigger investigation-grade quest we discussed earlier (loyal/discreet as the default path, Watch-report as the one path that costs Oath standing). `hask_trusts_you` and `black_oath_rep` are exactly the kind of state that quest would want to read as a prerequisite later, but nothing here commits to that shape yet.
