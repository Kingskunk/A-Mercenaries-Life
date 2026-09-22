# HOBB's Quest — Dredge-End Prose & Choices Review

**Source file:** `web/mygame/scenes/port_valen_dredge_end.txt`
**Scope:** All prose and choices relating to HOBB and the "A Bowl for the Oar-Maker" quest chain (Tier 1: Rusty Anchor) within Dredge-End, including the related Hobb's Shed area in the cut.
**Stats file cross-reference:** `web/mygame/scenes/choicescript_stats.txt` lines 63–80

---

## 1. Rusty Anchor Hub — Quest State Descriptions

**Label:** `pv_anchor_hub` (line 980)

### 1a. Room state prose gated on Hobb errand (lines 999–1009)

| Condition | Prose |
|-----------|-------|
| `anchor_errand_stage = "resolved"` AND `campaign_day > anchor_errand_day` (line 1000) | "The carters have dropped their voices. Two men in ink-stained leather sit in the corner booth with no drink between them, long gutting knives plain at their ribs, watching the door and a square hatch cut into the deck. A third man kneels at the hatch, feeding a knotted rope down into the bilge water. He pinches the wet hemp and marks the waterline with his thumbnail. He is not checking for leaks. He is sounding the clearance under the tavern like a man planning to come back. Sal is watching the corner booth instead of the room." |
| `anchor_errand_stage = "unstarted"` (line 1002) | "A covered bowl sits in front of the empty stool at the end of the counter." |
| `anchor_errand_stage = "resolved"` (line 1004) | "The hatch boards in the deck are pinned flat." |
| `anchor_quest_stage = "failed"` (line 1007) | "A fresh clerk's stamp is inked across the hatch boards now, and Sal's cleaver has moved from the block to the counter beside her hand." |

### 1b. Hub menu choices involving Hobb (lines 1111–1135)

| Choice | Condition | Target |
|--------|-----------|--------|
| "Carry the covered pot out to the oar-maker's shed. [~40 min]" | `anchor_errand_stage = "active"` | `pv_anchor_hobb_walk` |
| "Hand the pot back and say you can't spare the time." | `anchor_errand_stage = "active"` | Sets `anchor_errand_stage = "unstarted"`; returns to hub |
| "Take a stool at the counter and talk to the woman behind it." | `anchor_errand_stage = "unstarted"` | `pv_anchor_counter` |
| "Take the stool at the end of the counter, where Sal is watching the corner booth." | `box_ready` (true) | `pv_anchor_low_water` |
| "Sit at the end of the long table with your back to the wall." | default | `pv_anchor_rumors` |

### 1c. Hub reoffer gate comment (lines 981–986)

> The box job is the second tier. It only shows up on a later day than the one the player finished the small errand for Hobb (any outcome). Sal never approaches the player: the room turns tense (the visible tell) and the player chooses to take the stool at the end of the counter. Nothing forces it. Second chance: one re-offer, on the first Forgeday after a plain refusal. Never after backing out of a yes, and never on the day of the refusal.

---

## 2. Rusty Anchor Hub — Hobb Rumor (pv_anchor_rumors)

**Label:** `pv_anchor_rumors` (line 1138)

### 2a. Errand resolved — rumor (lines 1153–1158)

Triggered when `anchor_errand_stage = "resolved"` AND `not(anchor_errand_rumor)`.

**Success/failure split:**

| `anchor_errand_resolution` | Rumor text |
|---------------------------|------------|
| `"failed"` or `"stayed_out"` (line 1156) | "Hobb's got chalk on his door. Three strokes. Somebody carried him a pot and it didn't help him any." He drinks. "It's a long way down the cut when you owe." |
| otherwise (line 1158) | "Hobb's door is clean this week. Somebody got between him and the runner, and Hobb won't say who." He drinks. "That's a man who's still counting what he owes." |

### 2b. Quest failed — rumor (lines 1160–1162)

Triggered when `anchor_quest_stage = "failed"` AND `not(anchor_rumor_failed)`.

> Two carters bend over one cup and lower their voices, though the room is too small for it to matter. "The box is in the silt and the stamp is on the boards," one says. "Whoever it suited, it wasn't Sal." The other turns his cup a quarter turn. "Somebody's going to dive for it. Somebody always does."

---

## 3. Counter — Asking About the Covered Bowl (pv_anchor_counter_hub)

**Label:** `pv_anchor_counter_hub` (line 1184)

### 3a. Prose when asking about the bowl (lines 1201–1211)

Triggered when `anchor_errand_stage = "unstarted"`. Sets `met_hobb = true`.

> "Hobb's," she says, with her eyes on the cup she is drying. "Oar-maker, three sheds down the cut. He's had that stool every night since before I tied the second barge, and it's been three nights. A man who owes doesn't drink where people can see him."
>
> "I can't leave this counter with a full room, and I don't send boys after a man's pride." She sets the cup down and waits, the way she waits on any order.

### 3b. Choices (lines 1213–1227)

| Choice | Effect |
|--------|--------|
| "I'll take it down to him. It's three sheds and a hot pot." | Sets `anchor_errand_stage = "active"`; Sal ladles pot; returns to hub |
| "That's his business." | Returns to counter hub; no state change |
| "Leave the counter." | Returns to hub |

---

## 4. HOBB'S OAR-SHED (pv_anchor_hobb_walk)

**Label:** `pv_anchor_hobb_walk` (line 1229)

### 4a. Scene heading and description (lines 1241–1256)

**Heading:** `[b]◈ HOBB'S OAR-SHED[/b]`

**Prose (line 1243):**
> Three sheds down the cut, a raised shed on stilts leans out over the water with a rack of ash sweeps under its eave, pale and half-shaped, the blades trimmed to a rough spoon. Shavings drift down into the canal and turn in the slow water. The door is a plank on rope hinges.

**Time-of-day variant (lines 1245–1246):**
> A horn lantern hangs from the eave and throws yellow light down onto the plank-walk.

**Scene setup (lines 1248–1256):**
> A young man in a hooded coat stands on the plank-walk below it with a wax tablet in one hand and a stick of chalk in the other, in no hurry. On the step above him, an older man in a leather apron, with wood-dust in his eyebrows, holds a wood plane like something he might yet need.
>
> "One mark five, oar-maker," the young man says. "The week's gone round. Chalk is chalk."
>
> "Next week," the old man says. "I'll have it next week."
>
> "You said that last week." The chalk comes up.
>
> Neither of them has noticed you or the pot.

### 4b. Stat hints (lines 1258–1270)

| Hint var | No Guidance | With Guidance |
|----------|-------------|---------------|
| `hint_hobb_cha` | `[CHA DC 11]` | `[CHA DC 11 (+1d4 Guidance)]` |
| `hint_hobb_int` | `[INT DC 11]` | `[INT DC 11 (+1d4 Guidance)]` |
| `hint_hobb_dex` | `[DEX DC 11]` | `[DEX DC 11 (+1d4 Guidance)]` |

### 4c. Choices at Hobb's door (lines 1271–1335)

| # | Choice | Stat | DC | Skill | Outcome on Success | Outcome on Failure |
|---|--------|------|----|-------|--------------------|--------------------|
| 1 | "Tell the runner the book will keep till next week, like someone with business here." | CHA | 11 | Persuasion | `anchor_errand_resolution = "talked"` — runner lowers chalk, says "Next week" | `anchor_errand_resolution = "failed"` — runner asks "Whose book is it?" then chalks door |
| 2 | "Read his tablet over his arm before he can lower the chalk." | INT | 11 | Investigation | `anchor_errand_resolution = "read"` — discovers padded figure ("That isn't one mark five") | `anchor_errand_resolution = "failed"` — "Does it?" then chalks door |
| 3 | "Trip on the loose plank as you come up, and put the runner's chalk in the canal." | DEX | 11 | Acrobatics | `anchor_errand_resolution = "slipped"` — chalk drops in canal, runner goes to find more | `anchor_errand_resolution = "failed"` — stew spills, runner chalks door anyway |
| 4 | "Pay the mark and five yourself." [15 Copper Bits] | — | — | — | `anchor_errand_resolution = "paid"` — runner ticks tablet, leaves | Requires ≥15 copper bits |
| 5 | "Hand Hobb the pot across the runner's shoulder, and keep out of it." | — | — | — | `anchor_errand_resolution = "stayed_out"` — chalk goes anyhow, hands empty | — |

### 4d. Hobb's response (pv_anchor_hobb_after, lines 1337–1344)

| Condition | Prose |
|-----------|-------|
| `resolution = "failed"` or `"stayed_out"` (line 1339) | "Hobb looks at the chalk on his door and leaves it there. He eats fast, standing on the step with his back to the plank-walk, and hands you the pot back scraped. 'Tell her I'll be on the stool when I've got it,' he says." |
| otherwise (line 1341) | "Hobb sets the wood plane down. He eats fast, standing on the step with his back to the plank-walk, and hands you the pot back scraped. 'Tell her the stool's still mine by the end of the week,' he says, and picks the plane up again." |

---

## 5. Return to Sal — Report (pv_anchor_report)

**Label:** `pv_anchor_report` (line 1346)

### 5a. Sal's response prose (lines 1362–1377)

| `anchor_errand_resolution` | Sal's dialogue |
|---------------------------|----------------|
| `"paid"` (line 1363) | "You paid his mark," she says, flat. "I won't pay you back for it. If I do, it stops being yours." |
| `"talked"`, `"read"`, or `"slipped"` (lines 1364–1369) | "Is there chalk on his door?" she asks. → "The door's clean." → She counts ten copper bits onto the wood and pushes them across with two fingers. "The pot's price, and a little over." |
| `"stayed_out"` (lines 1370–1375) | "Is there chalk on his door?" she asks. → "There's chalk on it." → Sal nods once. "You brought the pot back," she says, and turns to the next cup. |
| `"failed"` (lines 1376–1377) | "There's chalk on his door," Sal says, "and the runner has your face. Word came up the cut ahead of you." She puts a cup of small beer in front of you. "Be careful which stools you take for a few weeks." |

### 5b. State changes (lines 1379–1396)

| Resolution | State changes |
|------------|---------------|
| `"paid"`, `"talked"`, `"read"`, or `"slipped"` | `anchor_sal_trust + 1`; `anchor_errand_resolved = true`; `anchor_errand_stage = "resolved"`; `anchor_errand_day = campaign_day`; +10 copper bits |
| `"failed"` | `anchor_errand_resolved = true`; `anchor_errand_stage = "resolved"`; `anchor_errand_day = campaign_day`; `black_tally_rep -1` |

### 5c. Feedback text (lines 1397–1397)

| Resolution | Text |
|------------|------|
| `"paid"`, `"talked"`, `"read"`, or `"slipped"` | [b][🍲 Pot Returned: +10 Copper Bits][/b] |
| `"failed"` | [b][🗡 Black Tally Standing: Black Tally Rep -1][/b] |

---

## 6. Sal's Box Job Offer (pv_anchor_low_water)

**Label:** `pv_anchor_low_water` (line 1403)

Sets `anchor_quest_stage = "offered"`.

### 6a. Sal's dialogue referencing Hobb (lines 1414–1423)

| Resolution | Sal's opening line |
|------------|--------------------|
| `"paid"`, `"talked"`, `"read"`, or `"slipped"` (line 1415) | "You carried Hobb his bowl and you kept his door clean," she says. "Nobody asked you for the second half. I noticed." |
| `"stayed_out"` (line 1417) | "You carried Hobb his bowl and brought me my pot back," she says. "His door has chalk on it. I noticed that too." |
| `"failed"` (line 1419) | "Hobb's door has chalk on it and the runner has your face," she says. "You came back and told me so anyway. Most don't." |

**Core offer (lines 1421–1427):**
> "The man with the rope has been at my floor since the last tide, and he'll be at it until he's done." She turns the cup toward you. It is not a friendly gesture. It is a transaction being opened.
>
> "Everyone in this quarter owes somebody. Hobb does, and half this room does. You don't, yet, and you brought my pot back. That is the whole of why I'm talking to you." She turns her own cup a quarter turn, watching the ring it leaves. "There's a box under the middle hull. I want it out of this building before the harbor-master's clerk stamps a water-lien on these boards. Clerks stamp on [b]Forgeday[/b], because clerks do everything on one day and call it law."
>
> "Once that stamp's down, he can pump my bilges and send a man in with a lamp and a writ."
>
> "Two silver marks when the box is on dry boards. Not my friendship. Coin."
>
> She drinks, and looks at you over the rim of the cup.
>
> "Nothing in it but my own paper. Hull titles, my dockers' indentures, family things."

### 6b. Choices (lines 1443–1483)

| # | Choice | Target | Notes |
|---|--------|--------|-------|
| 1 | "Watch her hands while she says it." (WIS DC 12 Insight) | `pv_anchor_terms` | Success: catches Sal's lie (`anchor_lie_caught = true`), `anchor_sal_trust + 1`. Sal reveals: "Paper. Debts. That is all you get before the hatch." Failure: Sal tells it flat, no lie caught. |
| 2 | "Take the fee and the job as offered." | `pv_anchor_ebb_wait` | `anchor_sal_trust = 0` |
| 3 | "Tell her you don't carry boxes you haven't opened." | `pv_anchor_haggle` | See section 7 below |
| 4 | "Tell her you're not for hire, and go." | `pv_anchor_decline` | See section 8 below |

---

## 7. Haggle (pv_anchor_haggle)

**Label:** `pv_anchor_haggle` (line 1585)

> "I don't move cargo I haven't looked at," you say. "Open it in front of me or find another hand."
>
> Sal laughs once, through her nose, with no warmth in it at all. "Then you'd know what I'm carrying, and I'd know you know. That is worse for both of us." She leans back and looks at you the way she looked at the two men in the corner. "Three silver, and I tell you what the box is. Or two, and you find out the way I found out."

### Choices (lines 1590–1619)

| # | Choice | Effect |
|---|--------|--------|
| 1 | "Take the three silver and whatever truth she's willing to sell." | `anchor_fee = 3`; `anchor_lie_caught = true`; `anchor_sal_trust + 1`; Sal reveals contents are "Paper. Debts. Notes of hand, tallies, liens." → `pv_anchor_ebb_wait` |
| 2 | "Take the two and stop asking." | `anchor_sal_trust = 0` → `pv_anchor_ebb_wait` |
| 3 | "Refuse both offers and walk away." | `anchor_quest_stage = "declined"`; `anchor_route = "walked"`; `anchor_declined_day = campaign_day` → `pv_anchor_hub` |

---

## 8. Decline (pv_anchor_decline)

**Label:** `pv_anchor_decline` (line 1501)

Sets `anchor_quest_stage = "declined"`, `anchor_route = "walked"`, `anchor_declined_day = campaign_day`.

> "Find another hand," you say, and set the cup back on her counter untouched.
>
> Sal does not argue and does not look up from wiping the ring of water off the wood. Whatever she meant to pay a stranger for, she will find someone else to pay it to, and someone in this quarter will remember that she had to.

---

## 9. Backout Paths

### 9a. Backout while waiting (pv_anchor_backout_wait, line 1514)

Sets `anchor_quest_stage = "declined"`, `anchor_route = "walked"`, `anchor_backed_out = true`.

> You push back from the table and stand. "I said yes to a box I hadn't seen the bottom of," you tell her. "I'm taking it back."
>
> Sal does not argue and does not look up from the bar. She has already stopped counting on you. Someone else will get the job, and she will remember that you said yes first.

### 9b. Backout at hatch (pv_anchor_backout_hatch, line 1527)

Sets `anchor_quest_stage = "declined"`, `anchor_route = "walked"`, `anchor_backed_out = true`.

> You lower the hatch boards back into their frame and stand on them until they stop knocking. The box stays on its cradle in the dark, and whatever is written in it stays there too.
>
> Sal is at the bar when you come through the room. She reads the water on your boots and the empty hands, and goes back to her cups. You will not be asked twice.

---

## 10. Second Chance Reoffer (pv_anchor_reoffer, line 1545)

Triggered on Forgeday after a plain refusal (`anchor_quest_stage = "declined"`, `not(anchor_reoffer_used)`, `not(anchor_backed_out)`, `campaign_day > anchor_declined_day`).

> "I asked once," she says. "I don't do it twice, as a rule. Today isn't a rule, it's a clerk."
>
> "The stamp comes down today. The water is up, and it won't wait for the ebb, and neither will he."

### Choices (lines 1563–1582)

| # | Choice | Effect |
|---|--------|--------|
| 1 | "Take it. 'Two silver. Now.'" | `anchor_quest_stage = "offered"`; `anchor_route = "none"`; `anchor_ebb_ready = false` → `pv_anchor_bilge` (with Disadvantage on descent) |
| 2 | "Tell her no, again." | Sal stamps the boards; returns to `port_valen_dredge_end` |

---

## 11. Hobb's Note in the Box (pv_anchor_the_box, lines 1895–1904)

**Label:** `pv_anchor_the_box` (line 1893)

> Inside, in oilcloth packets tied with waxed cord, in an order somebody has been keeping for years: notes of hand.
>
> You read the top few, because they are face up.
>
> An eel-seller's note, one mark eleven copper, four years old, attested by a witness who has since died. An oar-maker's note, two marks, with a margin note in a different hand about a boat he no longer owns. A tailor's apprentice, six copper, on a page so small it must have been cut down from something else. A woman in the water-streets who signs with a mark, because she cannot write her own name.

**Hobb-specific conditional prose (lines 1901–1902):**

| Condition | Prose |
|-----------|-------|
| `met_hobb = true` | "The oar-maker's note is signed Hobb." |

---

## 12. cut_sheds — Hobb's Shed Area (lines 2369–2461)

**Label:** `cut_sheds` (line 2373) — Area 3 of 7: The Boat-Sheds and Scrap Yard

### 12a. cut_sheds_hub choices (lines 2409–2426)

| # | Choice | Condition | Target |
|---|--------|-----------|--------|
| 1 | "Look in at Hobb's shed." | `met_hobb = true` AND `not(anchor_errand_stage = "active")` | `cut_hobb` |
| 2 | "Look in at the oar-maker's shed." | `not(met_hobb)` AND `not(anchor_errand_stage = "active")` | `cut_hobb` |
| 3 | "Walk into the scrap yard and see what the dealer has." | — | `cut_scrap_yard` |
| 4 | "Go over to the smith's bench." | — | `cut_smith` |
| 5 | "Head back to the cut." | — | `port_valen_dredge_end` |

### 12b. cut_hobb sub-location (lines 2429–2443)

**Heading:** `[b]◈ HOBB'S SHED[/b]` (if `met_hobb`) or `[b]◈ THE OAR-MAKER'S SHED[/b]` (if not)

**Prose (line 2435):**
> The shed is one long room open to the cut on the water side, with a bench under the light and oars in every stage of being made hanging from the rafters. An older man in a leather apron, with wood-dust in his eyebrows, stands at the bench shaving an oar blade thin with a two-handed knife.

**Door-state variants:**

| `anchor_errand_resolution` | Prose (line 2437–2442) |
|---------------------------|------------------------|
| `"paid"`, `"talked"`, `"read"`, or `"slipped"` | "The door stands clean in the light. He glances up at you and back at the blade. 'You. Sal's pot.' He nods at a stool by the bench. 'Sit if you're staying.'" |
| `"stayed_out"` or `"failed"` | "Three chalk strokes cross the door, gone grey with handling. He looks up at you and keeps his eyes on the blade." |
| otherwise (unstarted/none) | "He looks up, takes in your hands, and goes back to the blade. 'Buying or looking?'" |

### 12c. cut_hobb_hub choices (lines 2444–2461)

| # | Choice | Condition | Prose |
|---|--------|-----------|-------|
| 1 | "Ask how an oar gets made." | Always | "Ash," he says. "Straight-grained, cut in winter, dried a year under a roof..." Loops back to hub. |
| 2 | "Ask about the chalk on doors." | `not(anchor_errand_resolution = "none")` | "The book's weekly," he says. "Fall a week behind and the runner comes with the chalk. Fall two, and somebody comes without it." Loops back to hub. |
| 3 | "Ask what the cut was like when he was young." | Always | "Sixty years I've watched the cut..." Loops back to hub. |
| 4 | "Step back out to the yard." | Always | Returns to `cut_sheds_page` |

---

## 13. Stats Screen Entries (choicescript_stats.txt, lines 63–80)

| Variable | Display Text |
|----------|-------------|
| `anchor_errand_stage = "active"` | **Active Quest:** A Bowl for the Oar-Maker (The Rusty Anchor) |
| `anchor_errand_stage = "resolved"` | **Small Job:** A Bowl for the Oar-Maker |
| `anchor_errand_resolution = "paid"` | — Paid Hobb's Mark Yourself |
| `anchor_errand_resolution = "talked"` | — Talked the Runner Off Hobb's Door |
| `anchor_errand_resolution = "read"` | — Caught the Runner's Padded Figure |
| `anchor_errand_resolution = "slipped"` | — Chalk Lost in the Canal |
| `anchor_errand_resolution = "stayed_out"` | — Stayed Out of It (Hobb's Door Chalked) |
| `anchor_errand_resolution = "failed"` | — The Runner Won (Hobb's Door Chalked, Tally Rep -1) |
| `anchor_quest_stage = "failed"` | **Closed Matter:** The Low-Water Box (the box is in the silt) |
| `anchor_quest_stage = "resolved"` | **Resolved Contract:** The Low-Water Box |

---

## 14. Summary: Hobb Quest Flow

```
pv_anchor_hub (unstarted)
  └─► pv_anchor_counter (ask about bowl)
        └─► pv_anchor_hubb_walk (carry pot)
              └─► pv_anchor_hobb_after (Hobb response)
                    └─► pv_anchor_report (report to Sal)
                          └─► pv_anchor_hub (resolved)
                                └─► pv_anchor_low_water (box offer)
                                      ├── pv_anchor_terms → pv_anchor_ebb_wait → pv_anchor_bilge → pv_anchor_the_box → pv_anchor_choice
                                      ├── pv_anchor_haggle → pv_anchor_ebb_wait
                                      ├── pv_anchor_decline
                                      └── pv_anchor_reoffer (Forgeday)
```

**Cut area cross-reference:** `cut_sheds` → `cut_hobb` (Hobb's Shed / Oar-Maker's Shed)
