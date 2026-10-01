# Quest Plan: The Winter Errand (Lyra's Cousins, Dredge-End)

**A small errand, not a campaign.** Lyra's aunt died leaving two months of rent owed, and the children in those rooms lose them at the end of the month unless the arrears are cleared. Lyra cannot clear them. The player can. That is the whole quest.

**Status: designed, not implemented.** Nothing here is built. Line numbers were read from the working tree on 2026-09-30; the Port Valen scene files have since moved into `web/mygame/scenes/port_valen/`, so every `port_valen_*.txt` below means the file in that folder. Re-grep for labels before editing.

---

## 0. The Whole Thing, In One Paragraph

The player sees Lyra talking to a block steward on an upper walkway in Dredge-End. He is telling her that her dead aunt owed rent, that the law protects the two children in those rooms only until the end of the term, and that he has already asked for leniency and been refused. Lyra has nothing, and a fortnight's pay her captain will not release before the contract ends. She needs **five silver by the month's end**.

The player says yes or no. If yes, they go and find it — **using the game's existing money** — and hand it over. The children stay in the rooms.

1. The player sees Lyra, approaches, finds her talking to the steward.
2. The player finds out about the dead aunt, and the two children.
3. The player finds out how much is owed.
4. Lyra returns to the Compound.
5. The player can go back and ask the steward questions.
6. The player chooses to help Lyra or not. If yes, they must find the silver.
7. The player pays Lyra, and finds her back at the Compound.
8. Lyra is grateful, promises to pay it back, and tells the player something more about herself.

**Five beats, one deadline, one choice that matters: whether to help at all.**

**Rewards:** `lyra_bond`, the scars at `lyra_bond >= 20`, and one line that opens the next thing. Nothing else.

---

## 1. Decisions

1. **It's about money.** The player is a sellsword; finding coin is what they do. The quest gives them a *reason* to earn the silver the game already pays out, and a *person* to spend it on.
2. **The steward says everything in one conversation, in the street.** No institution, no records, no puzzle to solve.
3. **Lyra is available to all three squads.** She is the company-wide rookie, and the quest has no squad-gated content.
4. **The gate is `lyra_pay_generous`** (`alderford.txt:2121`) — a flag already in the game that is currently set and read nowhere else. The player must have earned the honest version of her story to trigger this.
5. **The clock is 10 days**, standing in for the end of the term. Long enough to run two or three other errands.
6. **No fight.** The steward is a tired man doing a job he dislikes, not a villain.
7. **The refusal is final and costs the player nothing but the story.** The children are put out. Lyra never mentions it again, and the coda has one line for it.
8. **The scars are the reward.** `lorebook-data.js` has said "quiet scars along both forearms that she's never once explained" since the entry was written. They get explained here, at `lyra_bond >= 20`, and only then.
9. **The Black Oath is not in this quest.** It has its own room behind a chandler's, its own roll and its own oaths, separate from the friar at Althea's arch. Nothing here needs it.

---

## 2. The Spine

| Beat | Label | Where | What happens | Roll |
|---|---|---|---|---|
| 1. The Ask | `lyra_hook` | Dredge-End, the Ribs walkway | The player overhears the steward. Lyra asks. Yes or no. | none |
| 2. The Asking About | `lyra_b2` | Dredge-End, the Ribs landing | The steward answers three questions. Optional. | one |
| 3. The Handing Over | `lyra_b3` | Dredge-End, the Ribs landing | The player gives her the silver, or admits they don't have it. | none |
| Coda | `lyra_epi` | Valen, the compound drill square | She is grateful, and tells the player something. | none |

**Beat 2 is optional and the player can skip it.** Everything needed was said in Beat 1. It exists so a careful player can confirm, not so a hasty one is punished. Every path gets the same three answers.

**Beat 3 is not a choice list.** It is one moment, and the prose branches on whether the player has the money.

---

## 3. The Beats, With Prose

Drafts are written to the narrative guidelines: second person, present tense, plain words, no role labels for anyone unnamed, no hand-on-weapon threats. Mechanics in brackets only.

### Beat 1: The Ask (`lyra_hook`)

*Past the red lamps the lanes narrow and the buildings lean out over the canal on their shored timbers. The walkway here sags in the middle and you take it in two strides without thinking about it, and that is the only reason you hear the man on the landing, because you are already past him and have to stop.*


#### Asking her about it

She waits until he is out of earshot, which on a plank walkway is about four steps.

"Two rooms," she says. "Bed alcove and a box room off it. That was my mother's. Twenty years in those rooms and she never once had it in writing that we were in it, and now she's dead and it's all in his book and not in ours."

She is not asking for sympathy and she does not want it.

"Five silver. That's what four months of that block comes to, and it's owed on the rooms, not on the children, though you'll hear him say otherwise if you ask him in front of anyone." A beat, flat. "I've got none of it. Vane owes me a fortnight's pay and he won't release it before the contract's done, and a fortnight's pay is four silver, so I'm five short of everything. I've been standing on this walkway on market days for a month hoping he'd say something different."

She turns her bow a quarter turn in her hand, the way people do with a thing they are holding while they think.

"You can ask him. He's on the landing most days and he won't lie to you, he's just tired, and if you're going to do this then it's better that you know the whole of it before you decide."

"I'm not asking you to feel anything about it," she says. "I'm telling you the arithmetic, because you're going to work it out on your own in about a minute and I'd rather you had the figures than the speech."

* **Help her.** The clock starts.
* **Leave it.** Nothing happens, and nothing is lost yet.

#### Helping

*comment Sets `lyra_quest_stage "active"`, `lyra_start_day`, and the three squad-agnostic flags, all inside `*if (not(lyra_active_set))` and the page lock (§5.4).*

She nods once. That is all she does, and it is a long moment.

"Right," she says. "Then don't tell me when you've got it, come and find me, and don't make a speech about it when you do, because I'll only be embarrassed."

She goes up the walkway toward the compound, and the sag in the middle of it takes her weight the same way it took yours.

#### Leaving it

She does not call after you. She goes up the walkway the other way, and you are left holding a piece of information you did not ask for.

*comment Sets `lyra_refused true` and `lyra_refused_day campaign_day`, same lock as above. The stage stays `"unstarted"`.*

### Beat 2: The Asking About (`lyra_b2`) — optional

The player can go back to the landing later. The steward is there, and he has already said all of this once, so he is brief about it.

**Option A — "Is five the whole of it?" `[WIS DC 10]`**

*Success.* He is not offended by the question, which is a surprise.

"Four months, same as hers. Four months is four silver and there's a copper on it for the water, because the block always adds the water, and the water is what takes them." He folds the paper. "It's five. It was five last month and it'll be five next month, and it isn't going down, and if you're waiting for a factor's man to come down here and take it off her — he isn't coming, because he's never come, and the block's worth less to him than the trouble of the stairs."

*Failure.* "It's five."

*comment One line either way. Fails forward (rules §13). The failed variant is terse and a little cold, and that is the whole difference.*

**Option B — "Who else is owed?" `[INT DC 10]`**

*Success.* This is the one he has not been asked.

"Nobody." He looks mildly surprised at himself. "There's no factor to argue with, and that's the trouble with it. The block's owned off a ledger in a counting room three hundred steps and four hundred feet above the water, and nobody from that ledger has set foot down here since my predecessor died, and he was a drunk." He taps the paper. "So I collect for a man I've never seen, and there's nobody to complain to, and that's the whole reason I've stopped trying."

*Failure.* "Nobody that matters."

**Option C — "What happens to the rooms?" `[CHA DC 10]`**

*Success.* He is almost grateful.


### Beat 3: The Handing Over (`lyra_b3`)

The player comes up the walkway with the money, or without it. **There is no menu.** One moment on the landing, and the prose branches on `lyra_have_silver`.

#### With the money

She is sitting on the bottom step with the bow across her knees, doing something to a fletching with her thumbnail. She sees you and starts to stand and then does not, which is somehow the loudest thing in the scene.

You put the five silver in her hand.

She does not count it in front of you straight away. She turns it over once, feels the weight, and does the arithmetic herself, and you can watch her do it. It comes to five.

"Right," she says. Then, to the paper and not to you: "That's a fortnight's pay I can't get out of the captain, and four months of a dead woman's back rent, and you found it in nine days, and I'm not going to make a thing of it, because you'd only be polite about it and I'd only be worse."

She stands up. She does not thank you, and she does not apologise for not thanking you.

"I'll pay it back. That isn't politeness, that's a debt, and I'll pay it back whether or not we've—" she stops, starts again, and picks a smaller sentence. "I'll pay it back. Ask me in a fortnight and I'll have a number."

*comment `lyra_paid true`, `lyra_resolution "paid"`, `lyra_bond +6`, and the 5-silver transaction — all inside `*if (not(lyra_paid))` plus the currency and page locks (§5.4).*

Then she goes up to the steward and pays him, and the player is not there for that, which is correct.

#### Without it

She looks at your face, and then at the absence of coin in your hand, and she does not ask and she does not look disappointed.

"Right," she says, and stands up, and goes up the walkway toward the compound. She finds another way. The player hears about it later, or does not.

*comment `lyra_resolution "unpaid"`, stage `"resolved"`. No `lyra_paid`, no coin, no bond change. The coda has one line for this (§3).*

### The Coda (`lyra_epi`)

One scene at the compound drill square, in Valen, days later. The existing arrival prose (`port_valen.txt:365`) already puts Lyra on a brine cask with a whetstone. This adds a standing option and touches that paragraph not at all.

**She is grateful first, because that is what the player is owed.**

"You're the reason those two are sleeping in a dry room, and I'm not going to pretend otherwise, and I'm not going to kneel about it either." She works the whetstone. "That's yours to spend how you like. I don't care if you tell people or don't."

**Then she promises to pay it back, which is the thread into the next one.**

"And I'm paying it back. I don't know how yet, and I know it'll be in silver, and I want you to have that before I start, because I'm not being brave about it. I'm just good at owing people and bad at it." A beat. "Vane pays out at the contract's end or he doesn't, and I'd rather it wasn't the second thing, and it isn't going to be the second thing."

**Then one line for how it went**, read from the resolution:

| State | The line |
|---|---|
| `paid` | Nothing more. The two passages above have already spent it. |
| `unpaid` | "You never came back with it." She says it without heat. "That's all right. I found it. Ask me how and you'll be bored." |
| Refused at the walkway | "I've got them somewhere dry for now. Up the canal, with a woman who doesn't ask questions." She does not explain further, because explaining would be asking for credit. |


## 4. Outcomes

| State | `lyra_resolution` | What it means |
|---|---|---|
| **Paid** | `paid` | The children keep the rooms. The player is out 5 silver and closer to Lyra. |
| **No money** | `unpaid` | She found another way, or did not. The player hears about it, or never does. |
| **Refused** | `none` | The stage never left `"unstarted"`. The children go out. The player meets Lyra again only by accident. |

**No gold ending, no best ending, no reputation moves, no items, no buffs.** The whole reward is `lyra_bond` and one conversation at the drill square. If the player walks away, nothing happens to them and the children are out, and the game never tells them they were wrong.

"Four copper. That's the bed frame and the box and the tin pot, and I'd have told you that for nothing, but you didn't ask, which tells me you'd been standing up there doing arithmetic about furniture, and I felt sorry for you." He does not look away. "Nobody's coming for the rooms. They're coming for the children, and the rooms are only where the children are."

*Failure.* "They're cleared. That's what clearing a room means."

**All three succeed, all three fail, and none of them is a fight, a coin, or a consequence.** The player leaves this beat knowing exactly what they knew at the end of Beat 1, having spent up to three checks to confirm it. That is the point of an optional beat.

*comment `lyra_asked_steward true` on entry, so the hub option hides itself (§5.2).*

He is lean, in a steward's apron gone grey at the seams, and he is talking to a woman with a recurve bow over her shoulder. He has a folded paper in his hand that he keeps folding and unfolding, which is what people do with a document they have already had returned twice.

"Your aunt died four months ago, Lyra." He says it without emotion. "There's two children in those rooms, and by law the city won't let a soul put them out until the end of the term. My boss made me check. I checked it in the spring and I checked it again last month, and I'm afraid there isn't much we can do."

"I understand." Lyra's voice is tight.

"You think I want to put two children out in the street? That's how it starts, and this city has enough of it as it is." He says it without heat. "I've asked for leniency on this lease for the sake of the children and I've been told no. You know why? Because a woman dying in a room off the Ribs isn't the business of anyone else."

"How long?"

"Term's up at the end of the month." He looks at her. "You want to do something about it, you go and find the money yourself, because I'm not walking anywhere again for you and I shouldn't have to."

He goes down the walkway. The rope creaks twice under his weight and then stops moving. Lyra does not watch him go. She watches the player, because the player stopped.

* **Ask her about it.**
* **Go on down the walkway.** She does not call after you.
  *comment lint-ok two-options: plain yes or no*

## 4a. Scope

The quest is: **three hub options, four labels, thirteen variables, two files of prose, one line in the lorebook, one line in the stats sheet, one line in the backstory.**

Not in it: a new district, a new POI, a new place layer, a new combat call, a new file in the build, an item, a buff, a unique weapon, a reputation move, a romance flag, or any change to her Chapter 1 arc — anxious before the gate, steady after, which is already written in `camp_night.txt` and `battle_black_sinks.txt`.

## 5. Technical Specification

### 5.1 Variables (`startup.txt`)

Thirteen, in one block after the Chapter 3 quest variables.

```choicescript
*comment --- THE WINTER ERRAND (Lyra's cousins, Dredge-End; see quest/LYRA_PLAN.md) ---
*create lyra_quest_stage "unstarted"   *comment "unstarted", "active", "resolved", "failed"
*create lyra_resolution "none"        *comment "none", "paid", "unpaid"
*create lyra_start_day 0              *comment campaign_day the player accepted; the clock runs from here
*create lyra_deadline_days 10         *comment days standing in for the end of the term
*create lyra_arrears_silver 5         *comment what the rooms cost; one month of a private's pay
*comment guards -- each is set once, inside the page_id lock (5.4)
*create lyra_paid false               *comment the player handed the silver over
*create lyra_have_silver false        *comment computed at Beat 3 from the player's purse
*create lyra_refused false            *comment the player walked past at the walkway
*create lyra_moved_on false           *comment the coda's refusal line
*create lyra_epi_seen false           *comment the coda has played
*create lyra_scars_told false         *comment the scars have been explained
*create lyra_asked_steward false      *comment Beat 2 has been seen; hides the hub option
*create lyra_active_set false         *comment guards the clock assignment at accept
```

**`mygame.js` is generated — do not hand-edit it.** It regenerates from `startup.txt` on every build and the mirror is overwritten.

### 5.2 The hub options (`port_valen_dredge_end.txt`)

All three go on the district hub's `*choice`, after `cut_market`. Nothing else in that file changes except one sentence in the layer-3 street prose.

```choicescript
*if ((lyra_pay_generous) and (lyra_quest_stage = "unstarted")
     and (not(lyra_refused)) and (vane_independent_operative)
     and (street_life != "empty") and dredge_end_seen)
  # The lanes past the lanterns, where the walkway sags and a man is talking to Lyra. [~15 min]
    *goto lyra_hook
*if ((lyra_quest_stage = "active") and (not(lyra_asked_steward)))
  # The Ribs landing: the steward is there, and he has already answered everything once. [~15 min]
    *goto lyra_b2
*if (lyra_quest_stage = "active")
  # The Ribs landing, and Lyra, and the end of the term. [~15 min]
    *goto lyra_b3
```

`street_life != "empty"` closes the beat in a Storm or Blizzard (`calendar.txt:652`) — the steward is not standing in a gale. Correct per rules §12: weather closes a place, never a quest option.

### 5.3 Everything that changes

| Where | Change |
|---|---|
| `startup.txt` | The block above. |
| `port_valen_dredge_end.txt` | Three hub options; `lyra_hook`, `lyra_aftermath`, `lyra_b2`, `lyra_b3`; one sentence in the layer-3 street prose. **No existing label's prose is edited.** |
| `port_valen.txt` | One standing option on `pv_poi_carrion` for the coda, gated on the stage. **Nothing else.** |
| `alderford.txt` | One sentence added to `discussed_lyra_archery`, and a flour clause dropped from the pay conversation (5.5). |
| `quest-data.js` | One object. |
| `lorebook-data.js` | Convert Lyra's `body` from a flat array to `body: function (s)` with gated pushes (5.5). |
| `lorebook-port-valen.js` | One people entry (the steward), gated pushes on `dredge_end`. |
| `choicescript_stats.txt` | Two lines. |
| `quest/QUESTS.md` | One entry, one POI row, the variables index. |
| `compile.js` | **No change.** Nothing is added to the build. |

**Quest log** (`quest-data.js`):

```js
{
  id: "winter_errand", title: "The Winter Errand", place: "Dredge-End",
  active: function (s) { return s.lyra_quest_stage === "active"; }
},
```

**Stats sheet**, same shape as the Shroud's:

```choicescript
*if (lyra_quest_stage = "active")
  *line_break
  • [b]Active Errand:[/b] The Winter Errand — five silver by the end of the month
*if (lyra_quest_stage = "resolved")
  *line_break
  • [b]Closed Errand:[/b] The Winter Errand [i](@{lyra_paid the children kept the rooms|somebody else found the money})[/i]
*if (lyra_quest_stage = "failed")
  *line_break
  • [b]Closed Errand:[/b] The Winter Errand [i](the children went out on the canal)[/i]
```


### 5.4 Replay safety

The class of bug that matters is a `*set` on a choice path that doubles on a page replay.

| Grant | Guard |
|---|---|
| The 5-silver payment | `*if (not(lyra_paid))` → `currency_add_amount 0-50` + `currency_txn_locked` + `economy currency_add`, inside `stat_bump_locked` / `locked_stat_bump_page_id = page_id`. **`lyra_paid` is the lock; the page lock is the belt.** |
| `lyra_quest_stage "active"`, `lyra_start_day`, `lyra_refused` | `*if (not(lyra_active_set))`. **This is the one that will bite**: without it, replaying the accept page resets the clock to today and silently extends the deadline. |
| `lyra_asked_steward` | Once, at the top of `lyra_b2`, behind its own boolean. |
| `lyra_scars_told` | In the same block that plays the scars scene, so flag and prose cannot disagree. |
| `lyra_epi_seen` | `*if (not(lyra_epi_seen))`. The coda is a standing option and gets walked into repeatedly. |
| `lyra_moved_on` | Set once, in the refusal branch of the coda. |

**The currency idiom is not optional.** `*set silver - 5` is a hard fail; it goes through `economy currency_add` with the amount in copper (50) inside the transaction lock.

### 5.5 The Alderford lines

The ridge estates and Dredge-End are two stages of one history in the existing text (`alderford.txt:2112` and `:2096`), and the eviction between them is missing. One sentence in the *existing* `discussed_lyra_archery` beat, gated on `lyra_pay_generous`:

> "Then the bailiffs came up the ridge with hounds and took the house, and we came down to the water, and after a while there was no room for us there either. That's the whole road."

**The pay conversation loses four words.** `alderford.txt:2129` currently reads *"If they made it through the frost, buy them a sack of dry rye flour and square their debt..."* — the flour clause goes, and the line becomes:

> "First thing? Buy a pair of lined leather boots that don't split at the welt. Then track down my aunt's kids in the lower tenements. If they made it through the frost, square their debt with the tenement rent-collector before they get turned out into the silt. That's the only reason I took Vane's coin."

**And the "cousins" / "aunt's kids" slip is fixed** by naming them once, in the archery beat, and leaving `:2129` as it stands.

**Lorebook** — Lyra's entry becomes `body: function (s)` with pushes gated on `lyra_pay_generous` (the aunt, the two children, the arrears), on `lyra_quest_stage` (where the errand stands), and on `lyra_scars_told` (**the payoff**). Add `baron_karr` to her `see` array so the story-linker cross-links from the baron's entry.

---

## 6. Canon Change Already Applied: the Black Oath and the Alley Shrine

The Black Oath was separated from Saint Althea's arch so the quest never leans on a merged institution. **This is already in the working tree** (3 files: `lorebook-data.js`, `lorebook-port-valen.js`, `port_valen_dredge_end.txt`) and is not part of the build work:

---

## 7. World Memory

One change, in one place. **The market lane reads the same in every outcome** — including the refusal. It is a market lane in a slum, and whether two children live in one room off it is not a thing the street prose has an opinion about.

No district rewrite. `port_valen_dredge_end.txt` is 243 KB of layered prose and this quest adds one conditional sentence to it.

---

## 8. Test Plan

1. **Build:** `node compile.js`, then `node quicktest` passes with every new line reached. `mygame.js` regenerates and shows the new variables.
2. **The gate:** each condition blocked alone; never on the first Dredge-End arrival; a Storm closing it; and the option returning once the weather eases.
3. **The clock:** accept on day N with `lyra_deadline_days 10`, visit N+1 through N+10, and N+11 for `failed`. **Replay the accept page on N+3 and confirm `lyra_start_day` did not move.**
4. **Beat 1:** both options; the accept sets the stage and the clock together, the refusal sets only the refusal.
5. **Beat 2:** all three questions, each passing and failing; the hub option hiding itself on entry; and confirm the player can walk straight from Beat 1 to Beat 3 without it.
6. **Beat 3:** with the money and without it; **replay the page and confirm the silver is not taken twice.**
7. **The coda:** all three resolution lines, the scars at `lyra_bond >= 20` and their absence below 20, and repeated visits.
8. **The Alderford lines:** play the taproom at `lyra_bond` 7, 14, 15 and 20; the new sentence appears only at 15+, `:2129` loses the flour clause, and `battle_black_sinks.txt` is byte-identical.
9. **Replay safety:** `node refresh_fuzz_test.js num=30 seed=3 mode=smart`, plus a positive control.
10. **Linters:** `node tools/lint_all.js` on the changed scene files. Expect `lint_choices` to report the one intentional binary gate.
11. **Render:** `node tools/render_hub.js` for Dredge-End across weather × time × day.

---

## 9. Decisions to Confirm

1. **Five silver** is one month of a private's pay (rules §3: ~6/month) and about fourteen shifts of crane work, or one small contract. The player can earn it inside the ten-day window. Still check against `randomtest` output before locking it.
2. **Ten days.** Enough for two or three errands. Two days is a scramble that looks like a quest; twenty is a chore.
3. **Should Beat 2 exist at all?** It is the most cuttable thing in the plan. The player already knows the number from Beat 1, so it is confirmation rather than discovery. Cut it and the quest is two beats and a coda.
4. **Should the coda's refusal line play for a player who walked away?** It is the only trace a refusing player gets. One sentence. Keep it, but it is the first thing to cut if the coda feels crowded.


* **The Oath's oaths and roll moved** out of the Alley Shrine into *its own room behind a chandler's* — *"It kept its own room behind a chandler's for the oaths and the roll of sworn names, and that is where they still are."*
* **A third line added to the Oath's entry:** *"They have nothing to do with the friar at Althea's arch. Both of them feed the same quarter and neither will say so in the other's hearing."*
* **The Alley Shrine entry** now says the friar feeds whoever is hungry and asks nothing, the men in boiled leather are there to find out who has stopped turning up, and the two are not connected.
* **The two savvy-player lines in `port_valen_dredge_end.txt`** (`:197`, `:3149`) lost the "who gets pulled out of the line" and "Black Oath runners" language. The men now tap a shoulder, say two words, and walk off up the lane.
* **The friar's `alley_shrine` lore push** changed from *"whoever is on the list that week"* to *"whoever he has it for that week"*.
* **The Oath's `see` array** no longer cross-links `alley_shrine`.

**What this buys beyond this quest:** a room behind a chandler's that nobody rents is already in the fiction (`port_valen_dredge_end.txt:1409` — *"the chandler's upper room has candles burning in it at all hours, and that nobody has ever seen it rented"*). It is now the Oath's, which is a real location a later quest can put a door on. **The Stolen Shroud is untouched** — it runs entirely on the friar, the bowl and the gravedigger.

The second line's `@{...}` takes a **bare boolean** — `lyra_paid` is one, and nested parentheses are not supported in that position (`STOLEN_SHROUD_PLAN.md` §6.4).

