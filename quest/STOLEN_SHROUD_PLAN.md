# Quest Plan: The Stolen Shroud (The Alley Shrine)

A small, street-level Robin Hood dilemma at **the Alley Shrine** in Dredge-End (`cut_shrine`). On a Hallowday the parish's weekly shroud-purse is torn out of the friar's hands and his bowl is smashed. A family is waiting under the arch with an unburied body. The player can go after the thief, and then decide what happens to the money.

**Status:** implemented. The quest is in `port_valen_dredge_end.txt` and `combat.txt`, with the variables in `startup.txt`, the stats-sheet lines, the `quest-data.js` entry, the lorebook entries and `quest/QUESTS.md` Quest 6 all in place. The code blocks below are the design sketches, and the game has the final text. Where the two differ, the game wins, and the differences are listed here:

* **The cold ending is told by the older woman, not the friar.** The friar is not at the shrine on the day the scene closes, so the woman at the foundation timber says the family is gone (Section 5.6 shows the shipped lines).
* **The hook's revisit line is shorter.** The shards sentence moved into the place layer's bowl states, so the hook no longer repeats it (Section 5.1 shows the shipped lines).
* **The shared-combat dispatch changes one existing line.** In the sneak-attack block the old `*if (combat_is_nonlethal)` became an `*elseif` behind the new `"cellar"` branch. The before-and-after recording of the Alderford fight and every existing finisher came out identical.
* **The returns to the arch land on a fresh render of the shrine (`cut_shrine_page`), not on the bare hub.** The blank-landing linter flagged the bare hub, and the render shows the outcome.
* **The rest of the theft day stays quiet (`shroud_after`).** Once the quest has ended, that same day the shrine prints one line ("No queue forms under the arch today...") in place of the queue, the bowl is still in shards, and neither the broth nor the phial shop is offered. The new bowl or tin cup shows from the next visit. Without this, walking out and back in the same Hallowday would bring the broth queue, and a ready shop after ending C, hours after the theft.
* **The stats sheet's `@{...}` phrase takes its condition in parentheses** (Section 6.4).

* **Inspiration:** *Thief: The Dark Project*, the classic street-level Robin Hood dilemma.
* **Structure:** four beats on one spine (Branch-and-Bottleneck), a fight only after a failed roll, then a three-way ending and a real loss state.
* **Rewards:** silver, and access to one item. Nothing else. No standing, no gear, no reputation.

---

## 0. Decisions Already Made (read this first)

1. **Rewards are the phial and silver only.** No items from the thief, no reputation, no perks.
2. **The three endings:**

   | | What you do | Silver | Phial gift | Can you buy phials afterward |
   |---|---|---|---|---|
   | **A** | Put everything in the friar's hands | none | yes | yes |
   | **B** | Give back half of the purse, keep half as a fee (you say so to his face) | 2 | no | **no**, the friar knows |
   | **C** | Tell them you lost the trail, keep everything | 6 | no | yes, he thinks you failed |

   B is allowed to be the worst ending. Not every choice needs to be balanced.
3. **The friar only knows what the player tells him.** In C nobody knows, so nobody treats the player differently. The earlier line "the shrine queue falls quiet when you pass" is cut. The player simply did not succeed, in everyone else's eyes.
4. **The phial costs 50 copper and stays there.** Making it cheap would make healing cheap, and then sleeping might as well restore health. The catalog price of 50 copper (`tools/gear_catalog.json`) is the single source of the shop price.
5. **The friar sells that one item and nothing else.** Only after ending A or C. A player who fails, ignores the quest, or ends on B never gets to buy.
6. **One limit, and it is about time.** Phials take time to make, so it is not only a matter of cost. One purchase per 30 days. The friar sells on Hallowdays, when he is at the shrine (Section 4).
7. **The thief is not named.** He is described by what the player sees. **The friar is named**, Brother Anselm, by his own mouth, once he becomes a shopkeeper.
8. **No chain, no pawnbroker, no new items.** The extra silver in C is the thieves' own coin, and it is only ever a currency change.
9. **The fight is a knifeman thief and a lookout accomplice, and it is non-lethal.** A victory leaves them beaten senseless in the cellar, breathing, and nobody is hauled anywhere. It only follows a failed roll. There is no fight button. This needs a small cellar-only finisher set (Section 6.3). The Alderford fight is not touched.
10. **No rumors for now.** The Cleaved Keel is a Quayside taphouse, not a Dredge-End one. Dredge-End keeps its own shrine murmurs (`cut_rumors_shrine`) if a line is wanted later.
11. **No faction tie-ins.** The Black Oath runners who check names at the alley mouth on broth mornings (a line only savvy players see) stay in the background.

---

## 1. Overview, Cast & Trigger

### 1.1 Premise

The shrine's bowl collects the poorest residents' coppers. The friar does not keep what goes in, it goes into the parish shroud-purse for whichever family lost someone to the bar that week (the old woman says so to anyone who leaves a copper). This week the purse is **40 copper**, and it is for a drowned net-mender's burial.

A young man with a scar down his cheek tears the purse from the friar's hands, smashes the bowl so the friar cannot follow, and runs for Lamp Stair with an accomplice. By evening most of it will be dice and drink.

### 1.2 Cast

Only the friar is ever named.

| Who | What the player sees | Combat type |
|---|---|---|
| **The friar (Brother Anselm)** | The friar the shrine already has: an undyed, frayed wool habit, murmured speech, a dry way of putting things. Battered, with a rag held to his head. | none |
| **The scarred young man** | Lean, a scar from ear to mouth, a gutting knife. First seen at the barrel-head in the cellar. | `gang_knifeman` (10 HP, AC 11, slashing, 30% Poisoned) |
| **His accomplice** | Thin, a sling coiled at his belt. Splits the coins with him. | `dock_lookout` (6 HP, AC 10, sling, 25% Blinded) |
| **The widow** | A woman with three children pulled in against her, crouched by the plinth. Her husband, a net-mender, lies under a fishing net. | none |
| **The older woman** | The same woman who spoke to the player when they left a copper (she rests against the foundation timber). Raspy, calls people "traveler". | none |

### 1.3 What already exists (checked against the game)

* The shrine: `cut_shrine`, `cut_shrine_page` (the arrival, in layers) and `cut_shrine_hub`, in `port_valen_dredge_end.txt`. The old woman's shroud-purse line is only spoken when the player leaves a copper (`cut_shrine_gave`).
* **The friar is only at the shrine on Hallowdays.** `cut_broth_serving` is true on a Hallowday between Morning and Afternoon when the street is not empty. At Dusk on Hallowday he scours the kettle. On other days there is no friar, only spinners and injured dockers resting on the steps.
* The shrine's constant place text describes a **clay bowl** holding river pebbles, and the ordinary-day line has people leaving a pebble "in the bowl". Both need a small branch (Section 6.4).
* Lamp Stair (`cut_lamp_page`): by day (Morning to Afternoon) the night trade is shuttered and only the hedge-doctor and the pawnbroker's window are offered. The dice cellar (`cut_dice`, "the steps of the green door") and the all-night drinking house (`cut_drink`) are offered at **Dusk only**. At Night the terrace is crowded but the menu offers just Widow Corve's door (existing behavior, not part of this quest). The dice cellar is already a low brick cellar with a barrel-head and an unnamed keeper. **The thieves' hideout is a new, quest-only space**, a smoking cellar down a side passage behind the drinking house. Do not put it inside the dice cellar.
* The phial exists: `has_althea_phial`, restores `2d4+2 HP`, stackable through `spare_althea_phial`. `*gosub_scene equipment grant_gear althea_phial 1` grants it, and the caller takes the coin inside its own currency lock (the Middle Ward's Ambrose does this in `mw_ambrose_buy_do`). Out of combat it shares the once-a-day instant-heal limit (`last_mundane_treatment_day`) with the hedge-doctor. At full HP it is refused and not consumed. Deacon Corbel in Alderford already gives one away as a quest reward.

### 1.4 The trigger, and the clock

| # | Condition | Why |
|---|---|---|
| 1 | `shroud_quest_stage = "unstarted"` | It fires once. |
| 2 | `cut_shrine_gave` | The player has left a copper and heard "You've paid for somebody's burial shroud". They already know what the shroud-purse is, and it is their copper too. |
| 3 | `cut_broth_serving` (a Hallowday, Morning to Afternoon, street not empty) | The friar is there, the weekly purse has just been collected, and the broth line is where the theft interrupts. |

No random chance. The gate is the visit itself.

**The clock.** A body cannot wait for weeks, and repeatable prose must never rely on someone still waiting (narrative guidelines §3). So the scene has a soft deadline, `shroud_deadline_days` (default **3** days from the day it was first seen). While it is open, every arrival at the shrine replays the scene (with a "revisit" variant). Once it has passed, the next arrival shows the aftermath and ends the quest as **failed** (`cold`): the family has taken him to the pauper's ditch, and the friar has no purse to give them.

### 1.5 Where it plugs in

* **Hook:** `cut_shrine_page` prints layers 1 and 2 as usual, then replaces layer 3 (street life) with `shroud_hook`. On the hook day the broth is not served (the kettle is overturned).
* **Yes or no:** "Leave them to it" continues to the normal shrine hub. The player is never trapped in the scene.
* **After the quest:** the shrine's bowl, the ordinary-day line and the hub option text follow the outcome (Section 6.4), and the friar's shop appears on Hallowdays for A and C.

---

## 2. The Spine

| Beat | Label | Time | What happens | Roll |
|---|---|---|---|---|
| **1. Broken Clay and Blood** | `shroud_hook` | (the shrine's 15 min) | The friar bleeding against the post, the family, the net. Ask what happened, or leave them to it. | none |
| **2. The Trail** | `shroud_b2` | 15 min walk, then 30 min | Find the thief in Lamp Stair. | one roll, **failure costs money** |
| **3. The Smoking Cellar** | `shroud_b3` | 30 min | Corner the scarred man and his accomplice. | **the climax**: one roll, failure means a fight |
| **4. The Purse** | `shroud_b4` | 15 min | Back at the shrine with the money. A, B or C. | none |

Each beat starts after a `*page_break`, one `advance_time` per page (rules §12).

### Beat 1: Broken Clay and Blood

The friar sits against the blackened post with a rag to his head. Shards of the bowl lie among scattered pebbles. The widow and her children crouch by the plinth, and a long shape lies under a fishing net. The older woman lifts her chin at the player.

* **Kneel by the friar and ask what happened.** The friar gives the purse (40 copper, for the gravedigger) and the thief (a scar from ear to mouth). The older woman gives the direction (up the cut to Lamp Stair) and the clock ("half gone by nightfall"). Nobody asks the player for anything. Then on to Beat 2.
* **Leave them to it.** Back to the normal hub. The scene replays on later arrivals until the deadline.
* A binary gate, marked `*comment lint-ok two-options: plain yes or no`.

### Beat 2: The Trail

The player walks up the cut to Lamp Stair (15 min). The hub offers three ways to find him, one roll each, a way out, and Guidance.

| Option | Check | Notes |
|---|---|---|
| Follow what he left behind | `[INT DC 12]` | Dropped coppers and a smear of the friar's blood on the handrail, ending at the drinking house's side passage. |
| Watch the doors | `[WIS DC 12]` | Spot the hooded man with a hand pressed flat over a heavy bag. |
| Squeeze the man on the dice-cellar steps | `[CHA DC 12]` | Posture and presence, no hand on a weapon. |
| `[Cantrip: Guidance]` | none | Pre-cast, +1d4, loops back. |
| Give it up and walk back to the shrine | none | 15 minutes lost. The quest stays open until the deadline. |

* **Success:** the side passage behind the drinking house, with the purse still at 40 copper.
* **Failure:** the player still finds the passage (this is a setup beat, so it fails forward), but the trail ran cold for a while. **The thief has been spending. `shroud_purse` drops by 10** (40 becomes 30), and the endings scale from what is left. No other penalty, and no rescue.
* Only the WIS option needs a day variant and a Dusk variant, because the street looks different (Section 5). The CHA option's man is the one the existing day prose already places on the cellar steps with a waxed slate.

### Beat 3: The Smoking Cellar (the climax)

A low cellar reeking of old smoke, split eels on the racks, barrels along the walls, a hooded lamp. The scarred young man and the thin one are dividing coins on a barrel-head. The scarred one has his knife out before the player reaches the third step.

| Option | Check | On success | On failure, the fight starts with |
|---|---|---|---|
| Step inside the knife and put him into the barrels | `[STR DC 12]` | Wrist caught, the man dropped among the barrels. | **player disadvantage** (a slick floor gives way) |
| Feint, catch the wrist, pin him | `[DEX DC 12]` | Knife falls, forearm across his collarbone. | **enemy advantage** (he does not bite on the feint) |
| Tell him what stealing a dead man's shroud costs | `[CHA DC 12]` | He drops the knife. | **both** (you misread him and it shows) |
| `[Cantrip: Shocking Grasp]` (wizard only) | auto | His arm locks and the knife drops. | |
| `[Cantrip: Vicious Mockery]` (bard only) | auto | His hand opens. | |
| `[Cantrip: Guidance]` | none | Pre-cast, +1d4, loops back. | |

* All success paths end with the accomplice running up the far stairs and the purse on the barrel-head beside a knotted rag of the thieves' own coin (20 copper). The player scoops up both. What happens to them is decided at the shrine.
* Per rules §13, each failure has a different cost, and the fight uses the flags the Dredge-End ambush already sets (`combat_enemy_advantage`, `disadvantage`).
* The two cantrip gates use the same multi-`or` shape as the game's other cantrip options (`wizard_cantrip`, `_2`, `_3` for Shocking Grasp, `bard_cantrip`, `_2` for Vicious Mockery). A fighter, rogue or warlock cannot reach either.

### The fight

`fight_shroud_thieves` (a new entry label in `combat.txt`). It is only reachable through a failed Beat 3 roll.

| Outcome | What happens | Result |
|---|---|---|
| `victory` | Both men are beaten senseless on the cellar floor. The purse and the rag lie on the barrel-head. | on to Beat 4 |
| `rescued` | HP floors at 1. The thieves kick the barrel-head over, take the purse and run rather than finish the fight. | **`escaped`** (failed) |
| `fled` | The player breaks off and gets out. The thieves take the purse and go. | **`escaped`** (failed) |
| `player_died` | The death screen, with the standard call-site check (`death_cause "combat"`). | |

The fight is **non-lethal** (`combat_is_nonlethal true`, the mode the Alderford guards use). Nothing happens to the thieves afterward, and the player takes the purse and the rag and leaves them where they lie. The engine's shared non-lethal finisher text is written for the Alderford curing shed, so this fight gets its own small cellar-only set (Section 6.3) and the Alderford fight is left alone.

### Beat 4: The Purse

The player comes back down the cut with the purse and the rag. The friar is where he was. The widow has drawn the net up over her husband's face. Three options:

* **Put everything in the friar's hands.** Ending A.
* **Count out half for the burial and keep the rest as your fee.** Ending B.
* **Tell them the trail went cold.** Ending C.

---

## 3. Outcomes

`shroud_purse` is 40 copper, or 30 if the trail was bungled in Beat 2. The thieves' rag is always 20 copper.

| Ending | `shroud_resolution` | The player gets | The shrine gets |
|---|---|---|---|
| **A: returned** | `returned` | one phial (the gift), the shop, the friar's name | the purse and the rag |
| **B: fee** | `fee` | half the purse (20 copper, or 15) | half the purse and the rag |
| **C: pocketed** | `pocketed` | the purse and the rag (60 copper, or 50), the shop | nothing |
| **Escaped** | `escaped` | nothing | nothing |
| **Cold** | `cold` | nothing | nothing |

* **A** is worth 5 silver of phial (unsellable) and the shop, and nothing in coin. **C** is 6 silver. That is nearly the same value, so the choice between them is about conscience, which is the point.
* **Escaped and cold are the loss states** (rules §2): each has aftermath prose, a stats-sheet line, and shrine world memory. There is no rumor, by decision.
* **The world remembers the outcome, not the player.** In C and the loss states the bowl is replaced by a tin cup and the family buried him in the ditch. Nobody blames anyone.

---

## 4. The Phial Shop

* **Where and when:** the friar sells while `cut_broth_serving` (a Hallowday between Morning and Afternoon, street not empty). That is when he is at the shrine, so this adds no new presence prose. It fits the brew time.
* **Who can buy:** `shroud_resolution` is `returned` or `pocketed`.
* **B sees a refusal.** The option is visible and he turns it down, so the cost is legible. Anyone else (a player who failed or ignored the quest) sees no option.
* **The limit:** one purchase per `shroud_phial_wait_days` (30). `shroud_phial_ready_day` holds the next day one is ready. In A the gift counts as this month's batch, so the clock starts at the gift. In C the first phial is ready at once.
* **Price:** `gear_retail` for `althea_phial` (50 copper), read from the catalog through `gear_info`, so it cannot drift.
* **Wording:** the wait is shown in a bracket on the option (`[Ready in 12 days]`), never as a number in prose. Prose says the cistern water needs a month in the dark.
* **Plain menu.** A single-item shop needs no trade panel.

---

## 5. Prose Drafts

Drafts for review, written to the narrative guidelines: second person, present tense, plain words, no names but the friar's, no role labels, no hand-on-weapon threats. Mechanics appear in brackets only. These need the linter pass once they are code (Section 8).

### 5.1 Beat 1: the hook (`shroud_hook`, replaces layer 3)

First arrival:

> No queue lines the tenement wall. The iron kettle lies on its side under the arch, and pea soup is cooling in the cracks between the flags.
>
> The friar sits against the blackened post with a rag held to his head. It has soaked red, and his lip is split so badly it has swollen his whole mouth. A woman crouches by the plinth with three children pulled in against her, and behind them lies a long shape under a fishing net, bare feet toward the saint. The older woman who spoke to you when you left your copper has a hand on the friar's shoulder. When she sees you, she lifts her chin.

Revisit (within the deadline):

> The kettle stands cold under the arch. The friar sits where he sat, the rag on his head gone brown. The woman and her three children have not left the plinth, and the net still covers the shape at their feet. The older woman meets your eye across the alley.

Choice: `# Kneel by the friar and ask what happened.` / `# Leave them to it.`

Ask:

> "Purse," the friar says. It comes out thick past the lip. "Forty coppers, this week's dish, meant for the gravedigger." His eyes go to the net and come back. "A young man came down the steps while the line was breaking up. Scar from ear to mouth, here." He touches his own cheek. "He tore the purse out of my hands and broke the bowl so I would not follow."
>
> The older woman tips her head toward the alley mouth. "Up the cut to Lamp Stair, and running. That's where his sort go to spend it." Her hand tightens on the friar's shoulder. "It will be half gone by nightfall."
>
> The friar bows his head over the rag, and his lips move in the saint's prayer for the drowned.

### 5.2 Beat 2: the trail (`shroud_b2`)

Set-up, with a day variant and an evening variant:

> You take the cut up to Lamp Stair at a jog. [Day] The night trade is shuttered and the red lanterns hang dark. The pawnbroker's window stands open, and people hauling laundry bundles move along the flags toward the upper stairs. [Dusk or later] Shutter pins are pulling back, stools are being dragged onto thresholds, and tapers are touching the red lanterns one by one. Somewhere along it, a scarred young man is spending the parish's money.
>
> *The hook fires between Morning and Afternoon and the walk is 15 minutes, so the day variant is almost always the one shown. The evening variant covers a hook late in the afternoon.*

**Follow what he left behind** `[INT DC 12]`
> *Success.* Coppers lie where they bounced out of a torn seam: one on the bottom step, two in the gutter, one under the pawnbroker's lintel. Between them a brown smear on the iron handrail marks where a hand with the friar's blood on it took the turn. The trail runs past the green door and ends at the drinking house, where it turns down a side passage.
> *Failure.* You find one copper, then nothing. You walk the length of the terrace with your eyes on the flags until the smear you were chasing turns out to be tar. When you look up, the day has moved on. By the time you find the passage, whoever you are after has been spending for a while.

**Watch the doors** `[WIS DC 12]`
> *Success, day.* You stop under the pawnbroker's lintel as though the shelves interested you, and let the terrace go by. Most of the faces do not matter. One does: a lean young man with a hood pulled forward, one hand pressed flat over a heavy bag under his shirt. When he turns his head, the scar shows white. He is not going to the green door. He is going round the side of the drinking house.
> *Success, Dusk or later.* You lean on the rail across from the drinking house and let the crowd wash past. Most of the faces do not matter. One does: a lean young man with a hood pulled forward, one hand pressed flat over a heavy bag under his shirt. When he turns his head, the scar shows white. He slips round the side of the building.
> *Failure.* Every second man on Lamp Stair has a hand over his bag, because everyone here is guarding something. You follow the wrong one halfway to the drinking house before he turns and asks what you want, and by the time you have doubled back, the terrace has closed over whoever you were looking for.

**Squeeze the man on the dice-cellar steps** `[CHA DC 12]`
> *Success.* A lean man sits on the cellar steps with a waxed slate on his knee and his eyes on the canal ladder, watching who comes and goes with the patience of someone paid to. You sit down a step below him and go still. "A man with a scar took a dead man's burial money up this street," you say, "and the friar's people know his face." You keep your voice level and your eyes on the terrace, and you make it clear you have all the time there is. The lean man looks at your hands, then at the street. "Side passage behind the drinking house," he says. "You didn't get it from me."
> *Failure.* "Never seen him," says the lean man, before you have finished the scar. He says it too fast. Then he is on his feet and through the green door, and you hear a bolt slide. Somewhere beyond the wall, a stool scrapes.

**Turn back:** *You go back down the cut. The friar looks up, reads it in your face, and lowers his eyes to the rag again.*

Tail (all approaches, then `*page_break`):
> The side passage behind the drinking house is one body wide and smells of old smoke. A slanted door stands propped open with a brick, and steps go down into the dark.

### 5.3 Beat 3: the smoking cellar (`shroud_b3`)

> The steps end in a low cellar black with old smoke. Split eels still hang from the racks along the ceiling, and barrels stand against the walls. Under a hooded lamp, two men are dividing coins into piles on a barrel-head: a scarred young man, and a thin one with a sling coiled at his belt. Their hands stop when your boot finds the third step.
>
> The scarred one is already reaching under the barrel-head, and something long and dull comes up in his fist. A gutting knife. "Wrong cellar, friend," he says.

**Step inside the knife** `[STR DC 12]`
> *Success.* You close before the blade has finished coming up, catch his wrist against your hip, and drive him backward into the barrels. The staves boom. The knife rings off the flags, and the scarred man ends up on the floor with his breath gone and coins rolling under his boots. The thin one is already halfway up the far stairs.
> *Failure.* You step in, and the floor is greasy with eel oil. Your heel goes, your shoulder meets a barrel instead of a man, and he is already turning with the knife.

**Feint, catch the wrist, pin him** `[DEX DC 12]`
> *Success.* You drop a shoulder as if to charge, and when the knife goes for the space you left, you are on the other side of it. Your hand closes on his wrist and twists, and the knife falls. You walk him back into the brick and hold him there with a forearm across his collarbone. The thin one drops a handful of coins and takes the far stairs three at a time.
> *Failure.* He does not bite on the feint. The point is coming across your line before you have finished it.

**Tell him what it costs** `[CHA DC 12]`
> *Success.* You stop on the third step and let the smoke curl round you. "That was a burial," you say. "The family is sitting under an arch with a body and no money for the gravedigger. A man who takes that has stolen from the river, and the river keeps a long count." You do not raise your voice or move. The knife hand begins to shake. The thin one behind him is already gone up the stairs, and the knife rings on the flags.
> *Failure.* "The river can wait its turn," says the scarred man, grinning around a broken tooth. You hear how it landed. He lifts the point to the height of your throat, and the thin one, quiet until now, uncoils his sling.

**`[Cantrip: Shocking Grasp]`**
> You catch his wrist as he lunges and let the charge go. His whole arm locks. The knife drops from fingers that have stopped listening, and he sits down hard among the barrels, shaking.

**`[Cantrip: Vicious Mockery]`**
> You tell him, softly and in detail, what Lamp Stair will say when it learns a friar's bowl bought him one night of dice: the scar, the borrowed knife, the man who could not even hold on to what he stole. His eyes fill with rage and shame, and his hand opens.

Success tail:
> The shroud-purse lies on the barrel-head, a scuffed leather bag no bigger than your fist with the friar's knot still tied in its neck. Beside it is a knotted rag that clinks: the thieves' own coin. You scoop up both and go up the steps into the light.

Fight victory: *the scarred man lies still on the flags with his breath going in and out, and the thin one is folded over the third step with his sling under him. Neither is going anywhere soon.* Then the same tail.

**Escaped** (rescued or fled):
> The knife comes up, and you are on the floor with your ribs on fire. The scarred man kicks the barrel-head over, sweeps the purse and the coins into his shirt, and is gone up the far stairs with the thin one after him. You lie in the reek of old smoke until you can stand.
>
> You go back to the shrine anyway. The friar reads it on you before you say a word. "You tried," he says. The widow does not lift her head.

### 5.4 Beat 4: the endings (`shroud_b4`)

> You come back down the cut with the purse and the rag heavy in your pouch. The friar is where you left him. The widow has drawn the net up over her husband's face. They all look up.

**A: Put everything in the friar's hands.**
> You put the purse and the knotted rag into his hands without counting. He weighs them, opens the rag, and looks at the silver lying in the cloth. "This was not the parish's," he says. "It was on him," you say. The friar closes his fingers over it. "Then it belongs to the saint now, and it will bury him properly."
>
> The widow crosses to the plinth, takes a wax-stoppered clay flask from the niche behind it, and puts it into your hand with both of hers. "Cistern water," the friar says, "steeped with angelica and arnica, a month in the dark. It is for those who go out on the river." He tries to smile with the ruined lip. "I am Anselm. Brother Anselm, on the days the parish remembers it has brothers."
> *[b][🧪 Acquired: Saint Althea's Water][/b]*

**B: Count out half, keep the rest as your fee.**
> You count half the coppers onto the flags and push the thieves' rag across with them, and you put the rest away. "A recovery fee," you say. "That is how it is done." The friar turns the coins over with one finger, and his sad eyes come up to yours. "It will bury him," he says. "Mercy comes dear in Port Valen." The widow keeps her face turned to the net.
> *[b][💰 Found: 2 Silver Marks][/b]*

*The banners read the computed amount: a purse of 40 gives 2 Silver Marks in B and 6 in C, and a purse of 30 gives 1 Silver Mark 5 Copper Bits in B and 5 Silver Marks in C. Prose never states the amount.*

**C: Tell them the trail went cold.**
> "He went to ground somewhere up the stairs," you tell them. "I lost him at the drinking house." You keep your voice level, and the purse and the rag stay where they are, heavy against your hip. The friar looks at you for a long moment, then nods. "You tried," he says. "That is more than most on Lamp Stair would." The older woman spits into the gutter, though not at you. Behind the plinth, one of the children begins to cry again.
> *[b][💰 Found: 6 Silver Marks][/b]*

### 5.5 The shop (Hallowdays, A and C)

Option: `# Ask the friar for a phial of Saint Althea's water. [5 Silver Marks]` (or `[Ready in N days]` while the batch is not ready).

> *Not ready.* He shakes his head slowly. "The water has to sit a full month in the dark, with the angelica and the arnica, before it is fit to bottle. Come back when the cistern is ready."
> *Short of coin.* He names the price, and you find your purse is a little short of it. "It will keep," he murmurs.
> *Bought, A.* He unhooks a flask from the cord at his waist, and you count the coin into his hand. "Drink it when you need it," he says. "Not before."
> *Bought, C, first time.* He passes you the flask with a nod. "Anselm," he says, "if you are going to be a customer."
> *Refused, B.* He does not look up from the kettle. "Not to you."

### 5.6 The cold ending

> The family is gone from the plinth, and the flags where they sat have been swept clean. The older woman resting against the foundation timber lifts her chin as you come in. "They carried him to the pauper's ditch," she says. "The gravedigger would not wait on the parish." She nods at the tin cup lashed to the plinth where the bowl used to be. "The friar has said his prayers. Nobody blames the ones who stayed out of it."

### 5.7 World memory at the shrine

Timeless lines that stay true on any later day:

* **Purse returned or fee taken:** a new clay bowl at the saint's feet, fired lopsided, with fresh river pebbles in the bottom. (The place layer's own bowl sentence is unchanged.)
* **Pocketed, escaped or cold:** a tin cup lashed to the plinth with linen strips where the bowl used to be. (The place layer and the ordinary-day line say "cup" instead of "bowl".)

---

## 6. Technical Specification

### 6.1 New variables in `startup.txt`

Put them with the Dredge-End shrine variables.

```choicescript
*comment --- THE STOLEN SHROUD (the Alley Shrine, see quest/QUESTS.md Quest 6) ---
*comment shroud_quest_stage: "unstarted", "active", "resolved", "failed"
*create shroud_quest_stage "unstarted"
*comment shroud_resolution: "none", "returned", "fee", "pocketed", "escaped", "cold"
*create shroud_resolution "none"
*create shroud_resolved false
*create shroud_seen false
*comment campaign_day the scene was first seen; the deadline clock starts here
*create shroud_start_day 0
*comment copper left in the purse (40, or 30 if the trail was bungled)
*create shroud_purse 40
*comment campaign_day the friar has another phial ready
*create shroud_phial_ready_day 0
*comment tunables
*create shroud_deadline_days 3
*create shroud_phial_wait_days 30
*create met_anselm false
```

Every variable is read somewhere. `shroud_seen` and `shroud_start_day` drive the replay and the deadline, `shroud_purse` sets the amounts, `shroud_phial_ready_day` gates the shop, and `met_anselm` unlocks the lorebook entry and the friar's name in prose.

### 6.2 The gate in `cut_shrine_page` (sketch)

```choicescript
*comment (after the temps at the top of cut_shrine_page; layers 1 and 2 still print)
*temp shroud_scene false
*temp shroud_cold false
*if (shroud_quest_stage = "unstarted")
  *if (shroud_seen)
    *if ((campaign_day - shroud_start_day) < shroud_deadline_days)
      *set shroud_scene true
    *else
      *set shroud_cold true
  *elseif (cut_shrine_gave and cut_broth_serving)
    *set shroud_scene true
    *set shroud_seen true
    *set shroud_start_day campaign_day
*if (shroud_scene)
  *set cut_broth_serving false
```

Layer 3 then starts with `*if (shroud_scene)` to print the hook (first or revisit variant) and go to its choice, or `*elseif (shroud_cold)` to print the cold scene and set the quest to `failed` and `cold` (behind the resolved guard). The bowl state is one more `*temp` (`"clay"`, `"shards"` or `"tin"`) read by the place layer and the ordinary-day line.

### 6.3 The fight (`combat.txt`)

**Reuse.** The enemies are Dredge-End's own library types (`gang_knifeman`, `dock_lookout`), the same ones the night ambush uses, so no new enemy is written. `fight_shroud_thieves` is only a thin wrapper around them. It cannot simply call `fight_dredge_ambush`, because that label picks its bruiser's weapon at random, has street lines (a canal, a lamp-post), and is lethal.

New entry label `fight_shroud_thieves`, modeled on `fight_wreckers` and `fight_dredge_ambush`: `gang_knifeman` in slot 1, `dock_lookout` in slot 2, `combat_is_nonlethal true` and `combat_nonlethal_style "cellar"`, then the flavor overrides, `apply_generic_weapon_flavor`, `fight_setup`. The caller sets `combat_enemy_advantage` and/or `disadvantage` for a failed Beat 3 roll first.

**Lines to retune for a cellar** (set in this label only, so Dredge-End keeps the shared text):

* **Knifeman:** `miss_1` (cobblestones), `miss_3` (the hem of your cloak) and `miss_5` (the folds of your coat). The last two assume the player wears a cloak or a coat, which the apparel linter flags.
* **Lookout (slot 2, the `combat_flavor_enemy2_*` names):** `hit_2` (a piling), `hit_4` (a gangway), and `miss_1` to `miss_5` (a canal, a shutter, planks, a lamp-post, a rain barrel).

The cellar's props are barrels, split eels on racks, low beams, and greasy flags.

**Why Alderford comes into it.** It has nothing to do with the story. `combat_is_nonlethal` is one shared engine mode, and the Alderford guards are the only fight that has ever used it (every Dredge-End fight, the ambush included, is lethal). The text that mode prints was written for that one scene, with its fish-curing props ("the guard's knee", "the cedar sawdust", "a curing bench"). **This quest does not touch it.**

**The cellar's own finisher set (the one piece of shared-file work).** This fight gets its own compact set of finishing-blow lines, picked by a one-variable selector. No existing line of text is edited, and the Alderford fight's output does not change.

* **The selector:** a new `combat_nonlethal_style`, created in `startup.txt` next to `combat_is_nonlethal` and reset to `""` in `fight_cleanup`. `fight_shroud_thieves` sets it to `"cellar"`. When it is empty, every finisher behaves exactly as it does today.
* **The dispatch:** three small branches at the top of the shared code, each of which does nothing while the style is empty: at the top of `pick_weapon_death_flavor`, at the top of `pick_spell_death_flavor`, and in front of the sneak-attack finisher in `fight_round_hub`. Each sends a `"cellar"` fight to a new label and returns. In the two finisher labels these are pure additions. In the sneak-attack block one existing `*if (combat_is_nonlethal)` becomes an `*elseif` so the new branch can sit in front of it, and the lines under it are untouched. No other fight's output changes, and a before-and-after recording of the Alderford fight and every existing finisher proves it.
* **The new labels**, appended to `combat.txt`:

| Label | Lines | Covers |
|---|---|---|
| `pick_weapon_death_flavor_cellar` | 10 | two variants each for ranged, slashing, bludgeoning, piercing and the fallback |
| `pick_spell_death_flavor_cellar` | 10 | one each for fire bolt, ray of frost, shocking grasp, eldritch blast, chill touch, vicious mockery, magic missile, dissonant whispers, armor of agathys and the fallback |
| the sneak-attack finisher | 2 | ranged and melee |

  That is about 22 lines. Two variants are enough because this fight happens once per game. The variety in the shared sets exists for repeatable fights.
* **How to write them:** the props are the cellar's own (barrels, the barrel-head, low beams, racks of split eels, greasy flags, the hooded lamp). Name the foe with `${combat_enemy_epithet}` (`the knifeman` or `the lookout`, since either can take the last blow) and avoid pronouns. **Do not name a weapon:** the knifeman's knife and the lookout's sling are each wrong for the other target, and the shared set's cudgels are wrong for both. Each variant is a different physical action, and each spell gets its own description (narrative guidelines §2).
* **Leave alone:** every existing finisher line, the lethal branches, the "💀 Defeated" banner (it is neutral), and every enemy's own attack text.

**Balance.** A knifeman and a lookout is the same weight as the Dredge-End ambush, about a 64 to 67% win at level 1 against the ten stock builds (casters are the weak side). That is acceptable because the fight only follows a failed roll and the player cannot die by default (HP floors at 1). No new sim is needed unless the stats change.

Caller in `shroud_b3`: the same outcome handling as the other fights, with `victory` on to Beat 4, `rescued` and `fled` to `escaped`, and the standard `player_died` check.

### 6.4 Everything else that changes

| Where | Change |
|---|---|
| `port_valen_dredge_end.txt` | The gate, `shroud_hook`, `shroud_b2`, `shroud_b3`, the fight caller, `shroud_b4`, the two loss labels, the hub's shop and refusal options, and the bowl and cup branches in the place layer and the ordinary-day line. (The hub's "leave a copper" option needs no branch: it is hidden once `cut_shrine_gave` is true, and the gate requires that.) |
| `combat.txt` | `fight_shroud_thieves` and its overrides, and the cellar-only finisher set with its three dispatch branches (about 22 lines, Section 6.3). |
| `startup.txt` | The variables (6.1), and `combat_nonlethal_style` next to `combat_is_nonlethal`. |
| `choicescript_stats.txt` | Quest lines (below). |
| `quest-data.js` | One entry: `{ id: "stolen_shroud", title: "The Stolen Shroud", place: "The Alley Shrine", active: function (s) { return s.shroud_quest_stage === "active"; } }`. |
| `lorebook-port-valen.js` | A new people entry for the friar (`id: "anselm"`, unlock `met_anselm`, link `Brother Anselm`), and gated lines on the existing `alley_shrine` entry. |
| `quest/QUESTS.md` | Quest 6, the Mermaid node, the variables index, and a row for the shrine in the POI table. |

**Stats sheet** (next to the other quests):

```choicescript
*if (shroud_quest_stage = "active")
  *line_break
  • [b]Active Quest:[/b] The Stolen Shroud (The Alley Shrine)
*if (shroud_quest_stage = "resolved")
  *line_break
  • [b]Resolved Contract:[/b] The Stolen Shroud
  *if (shroud_resolution = "returned")
    — [i]The Purse Returned to the Friar[/i]
  *if (shroud_resolution = "fee")
    — [i]Half the Purse Kept as a Fee[/i]
  *if (shroud_resolution = "pocketed")
    — [i]The Purse Kept, the Friar Told It Was Lost[/i]
*if (shroud_quest_stage = "failed")
  *line_break
  • [b]Closed Matter:[/b] The Stolen Shroud [i](@{(shroud_resolution = "escaped") the thief got away|the trail went cold})[/i]
```

The sheet's other conditional phrase (`@{bell_walked_away you turned back|the bell rang too late}`) uses a bare boolean, so this one puts its comparison in parentheses.

### 6.5 Time costs

The shrine's own 15 minutes (existing), then 15 for the walk in Beat 2, 30 for Beat 3, and 15 for Beat 4, about 75 minutes. Buying a phial is instant. Each beat's `advance_time` sits at the top of its label behind a `*page_break`, with the standard `recalc_hp_from_neglect` and death check. A Beat 2 that turns back has still spent its 15-minute walk.

### 6.6 Replay safety

* **Rewards:** wrap the stage change in the resolved guard (`*if (not(shroud_resolved))`) and take every coin change behind the existing currency-transaction lock.
* **The shop:** the coin and `grant_gear` go in one lock (as in `mw_ambrose_buy_do`), and `shroud_phial_ready_day` is set inside it.
* **Stage changes:** `active` is set once, when Beat 2 starts, and cleared to `unstarted` if the player turns back. `resolved` and `failed` are terminal.

---

## 7. Design-Rule Check

| Rule | How this plan meets it |
|---|---|
| QUEST_DESIGN §1, organic discovery | The friar does not ask. The player kneels and asks, and can leave at either step. Nothing is dumped on a stranger. |
| §2, branch-and-bottleneck | Four beats on one spine, with approaches that converge. |
| §2, fail-forward | A failed Beat 2 costs coin and never rescues. A failed Beat 3 costs a fight, with a different cost per approach. Losing the fight forfeits everything. |
| §2, genuine loss state | Two: `escaped` and `cold`, each with aftermath prose and a stats line. |
| §3, proportional reward | Silver and the phial, sized as a street task. |
| §5, state hygiene | Once-only reward guard, currency lock, no bare increments before a pause. |
| §6, hub integration and sync | Lives in a real place. `QUESTS.md`, `quest-data.js` and the lorebook are updated. |
| §7, choices | Every option is real. The two binary gates are marked `lint-ok two-options`. |
| §11, mechanics in brackets | DCs, prices and the wait appear in brackets only. |
| §12, time and weather | One `advance_time` per page. The gate reads `cut_broth_serving`, which already reads the street-life flags. No weather modifier on rolls. |
| §13, combat | A fight only after a failed roll, with an approach beat first. Non-lethal, so no one dies over a purse. |
| Narrative §1, §7 | No names but the friar's. No role labels. Intimidation is posture, not a hand on a weapon. |
| Narrative §3, timelessness | The soft deadline exists so the family is not waiting on Day 100. World-memory lines are timeless. |
| Slow healing | The phial is scarce by price and by time. It shares the once-a-day limit out of combat. |

---

## 8. Test Plan

Use the method that worked for the pier quest: a scripted driver on the real engine, with the game's own dev-menu characters, forced dice and a page-replay check.

1. **Build:** `node compile.js`, then `node quicktest.js` passes with every new line reached.
2. **The gate:** each of the three conditions blocking it alone, the revisit variant inside the deadline, and the `cold` ending once the deadline has passed.
3. **Beat 2:** every option succeeding and failing (the purse drops to 30 on a failure), Guidance, and turning back.
4. **Beat 3:** every option succeeding and failing (each failure sets the right fight flags), both cantrips visible only to the right casters, and the fight ending `victory`, `rescued` and `fled`. Also the cellar finishers: one victory per weapon category and per attack cantrip on this fight prints the cellar lines, no cellar line ever appears in another fight, and the Alderford curing-shed fight prints exactly what it printed before (same forced dice, compare a run before and after the change).
5. **Beat 4:** all three endings, with exact coin changes for both purse sizes (A none, B 20 or 15 copper, C 60 or 50 copper), the phial gift in A only, and the friar's name unlocking in A.
6. **The shop:** A and C can buy on a Hallowday and not on other days, B sees the refusal, anyone else sees no option, the price is 50, the 30-day wait holds, A's gift starts the clock, and the phial stacks.
7. **World memory:** the bowl, the cup and the shards in every state and hour.
8. **Replay safety:** every page of every route replayed on top of its own results, with a positive control that knocks out a lock on purpose.
9. **Linters:** `node tools/lint_all.js web/mygame/scenes/port_valen_dredge_end.txt` and `combat.txt`. Expect `lint_choices` to note the two intentional binary gates.
10. **Stats sheet, sidebar and lorebook:** the quest lines for every outcome, and the friar's entry only after his name is given.

---

## 9. Decisions (all confirmed)

Every item below was confirmed in discussion. They are kept here as a record.

1. **Deadline** [3 days from the first sight, then `cold`]. Without it the family waits under the arch indefinitely.
2. **Non-lethal fight** [settled: the thieves are beaten senseless and left in the cellar, using a small cellar-only finisher set. Alderford is not touched].
3. **Purse and the bungled trail** [40 copper, minus 10 on a failed Beat 2].
4. **The thieves' rag** [20 copper, always picked up, kept only in C].
5. **Shop hours** [Hallowdays only, while the broth is served, so Dusk on Hallowday is closed].
6. **Broth on the hook day** [not served that day, normal on later Hallowdays while the quest is open].
7. **The friar's name** [Brother Anselm, given in A's thanks scene and at his first sale in C].
8. **Quest number** [Quest 6].
