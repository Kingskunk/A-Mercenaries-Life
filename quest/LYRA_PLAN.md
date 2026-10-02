# Quest Plan: Five Silver (Lyra's Aunt's Rooms, Dredge-End and Valen)

**A small errand, not a campaign.** Lyra's aunt was the tenant. She died four months ago and the rent is still running on her name, and the term ends at the month. The two children living in those rooms are on nothing — no lease, no book, no list — so when the term lapses they have nothing holding them there. Lyra cannot pay the five silver it takes to stop that. The player can.

**Status: designed, not implemented.** Nothing here is built. Line numbers were read from the working tree on 2026-09-30; the Port Valen scene files have since moved into `web/mygame/scenes/port_valen/`, so every `port_valen_*.txt` below means the file in that folder. Re-grep for labels before editing. **Updated after the Dredge-End retcon of the same date** (the district is no longer built on pilings; it is leaning terraces on ordinary footings, with plank walkways slung between the *upper storeys*). The staging was relocated to those walkways and the 2026-09-30 line citations were re-grepped and corrected.

---

## 0. The Whole Thing, In One Paragraph

The player sees Lyra talking to a block steward on an upper walkway in Dredge-End. The aunt was the tenant; she died four months ago, and the lease is still in her name with the rent still running on it. The law will not let anyone be put out of a room for arrears while the term is live — but the term ends at the month, and after that the debt is just a debt with nobody attached to it, and the block will want the money or it will want the rooms. The two children are on nothing: not the lease, not the steward's book, not the friar's list. Lyra has none of the five silver. The steward leaves and does not come back. The player chooses whether to help, goes and finds the silver, and hands it to her on the drill square at the compound after dark.

**Eight steps, one deadline, one choice that matters: whether to help at all.**

1. The player sees Lyra, approaches, finds her talking to the steward.
2. The player finds out about the dead aunt, and the two children.
3. The player finds out how much is owed.
4. Lyra returns to the Compound.
5. The steward is gone and cannot be questioned again. **A closed door, not a puzzle.**
6. The player chooses to help Lyra or not. If yes, they must find the silver.
7. The player visits Lyra at the compound, after dark, and pays — or admits they could not.
8. Lyra is grateful, promises to pay it back, and tells the player something more about herself.

**Rewards:** `lyra_bond`, the scars (ungated — finishing the errand is the unlock), and one line that opens the next thing. Nothing else.

---

## 1. Decisions

1. **It's about money.** The player is a sellsword; finding coin is what they do. The quest gives them a *reason* to earn the silver the game already pays out, and a *person* to spend it on.
2. **The steward says everything in one conversation, in the street.** No institution, no records, no puzzle to solve.
3. **Lyra is available to all three squads.** She is the company-wide rookie, and the quest has no squad-gated content.
4. **The hook is not gated on bond.** `lyra_pay_generous` (`alderford.txt:2121`, `lyra_bond >= 15`) would have made the 8-19 and under-8 tiers dead code: below 15 the button never appears, so the greeting could only ever run its warm branch. The gate is `met_lyra` — not a bond gate, just that the player has been in the same room as her — and the greeting does the filtering.
5. **The clock is 10 days**, standing in for the end of the term. Long enough to run two or three other errands.
6. **No fight.** The steward is a tired man doing a job he dislikes, not a villain.
7. **The refusal is final and costs the player nothing but the story.** The children are put out. Lyra never mentions it again, and the coda has one line for it.
8. **The scars are the reward, and they are not gated on bond.** `lorebook-data.js` has said "quiet scars along both forearms that she's never once explained" since the entry was written. Finishing the errand is what unlocks them: any player who reaches the coda sees the explanation, whatever `lyra_bond` is. The only guard left is `lyra_scars_told`, so a replayed coda does not reprint the reveal.
9. **The Black Oath remains backstory mechanically, but the coda now opens a live sequel thread.** Lyra says she worked for them as a thief, broke their oath, escaped before they finished collecting, and hid something she carried out. Nothing in Five Silver itself rolls against the Oath or changes its standing. After repaying the player, however, Lyra returns to Dredge-End to learn what the changed leadership wants rather than leaving the company. The room above the chandler is one ward captain's counting room, separate from the friar at Althea's arch and explicitly not the headquarters of the whole brotherhood.

---

## 2. The Spine

| Step | Label | Where | What happens | Roll |
|---|---|---|---|---|
| 1. Overhear | `lyra_hook` | Dredge-End, the sagging walkway | The player comes up the gangway and finds Lyra talking to the steward. | none |
| 2. The two children | `lyra_hook` | same | The rooms, the aunt, the children who are on no list. | none |
| 3. The number | `lyra_hook` | same | Five silver, four months, term ends at the month's end. | none |
| 4. She leaves | `lyra_hook` | same | She goes up the walkway to the compound. | none |
| 5. No steward | none | none | He has gone for good. The door on that is closed. | none |
| 6. The choice | `lyra_hook` | same | Help her or do not. | none |
| 7. The paying | `lyra_b2` | Valen, the compound drill square | The player brings the silver, or admits they have not got it. | none |
| 8. The coda | `lyra_epi` | same | She is grateful, promises repayment, and says something about herself. | none |
**The two decisions are step 6 and step 7.** Whether to help, and whether the money arrives before the term does.

**Two hubs, and that is deliberate.** The errand opens in Dredge-End and resolves in Valen, because that is the shape of the problem: her life is in the district and her work is at the compound, and the errand is the distance between the two. The Silt-Gate quest already moves across districts this way.

**Step 5 is a closed door, not a puzzle.** There is no second visit to the steward, no legal research, no record to find. He said everything he is permitted to say and he went down the outside stair. A player who wants more information cannot get it, and this is said once, plainly, and never again.

**Step 7 is time-gated, because she is a soldier on duty.** See §3.2.

---

## 3. The Beats, With Prose

Drafts are written to the narrative guidelines: second person, present tense, plain words, no role labels for anyone unnamed, no hand-on-weapon threats. Mechanics in brackets only.

### Beat 1: The Ask (`lyra_hook`)

*Past the red lamps the lanes narrow and the buildings lean out over the canal on their shored timbers. You go up the outside stair with the rest of the foot traffic, and the walkway at the top sags in the middle. You take it in two strides without thinking about it, and that is the only reason you hear the man on the landing, because you are already past him and have to stop.*

He is lean, in a steward's apron gone grey at the seams, and he is talking to a woman with a recurve bow over her shoulder. He has a folded paper in his hand that he keeps folding and unfolding, which is what people do with a document they have already had returned twice.

"Your aunt died four months ago, Lyra." He says it without emotion. "She was the tenant. The lease is still in her name and the rent's still running on it, and by law the city won't let a soul put anybody out of a room for arrears while the term's live. My boss made me check. I checked it in the spring and I checked it again last month, and I'm afraid there isn't much I can do."

"I understand." Lyra's voice is tight.

"You think I want to put two children out in the street? That's how it starts, and this city has enough of it as it is." He says it without heat. "I've asked for leniency on this lease for the sake of the children and I've been told no. You know why? Because a woman dying in a room off the terraces isn't the business of anyone else."

"How long?"

"Term's up at the end of the month." He looks at her. "You want to do something about it, you go and find the money yourself, because I'm not walking anywhere again for you and I shouldn't have to."

He goes down the outside stair. The boards creak twice under his weight and then stop moving.

**Step 5 is right here and it is a hard close.** He does not come back, he is not findable, and there is no second conversation with him, no record to look up, and no one at the compound who can say more than he has already said. The game does not repeat this and does not grey out anything to advertise it. The player finds out by walking away and finding the door shut.

**The player says something.** Every beat in this quest has the protagonist in the room and reacting. The dialogue is the player's, and the steward and Lyra answer it. Two options, as the game writes two-option gates:

* **Step up and say her name.**
  *comment lint-ok two-options: plain yes or no*
* **Keep walking.**
  *comment lint-ok two-options: plain yes or no*

**Button text stays under fifteen words.** That is a hard constraint on every option in this quest, not only this one.

#### `lyra_bond >= 20` — she knows you

*You come up onto the landing behind him and say her name before he has finished the sentence, and she turns before the steward does.*

"${name}."

Lyra smiles when she hears a familiar voice. "You heard all of that?"

#### `lyra_bond >= 8` and under 20 — you fought together, and that is all

*You come up the last flight and stop, and she sees you and does not turn, and finishes what she is saying. Only when the steward is gone does she look over.*

"${name}." What are you doing here?

"You heard all of that."

*She has not said whether she is glad you are here. She is deciding.*

#### Under 8 — she has no reason to owe you anything

*You come up the last flight and she sees you and does not turn, and finishes what she is saying. Only when the steward is gone does she look over, and she looks at you the way she looks at a colleague who has come to ask a favour.*

"${name}."

"Aye. I heard it." She does not soften it. "Go on down the walkway."

*She is not hostile. She has simply decided that this is hers and that you are company on the way past, and she is not wrong to think that. A failed check at the camp brazier put the player here, and nothing since has made her think otherwise.*

**This is a colder no than the one at 20, and it should read that way.** At 20 she has decided the player is worth something and the kindness is mutual; under 8 she is dismissing someone who stopped to listen. Neither path loses bond and neither sets `lyra_refused`, because the player never got as far as being asked.


#### The three facts, and only now

**Nobody tells the player anything in this quest for free, and the tiering is the mechanism.** What follows is the `>= 20` case, where she has decided the player is worth talking to. Each lower tier gets less.

*fact 1 — the two rooms*

"I overheard what was said."

She turns her bow a quarter turn in her hand, the way people do with a thing they are holding while they think.

"I've not got all the silver. I'm five short of everything." She looks at you, and this is the first time she has. 

#### The two options

* **Say you'll help.**
  *comment Sets `lyra_quest_stage "active"` and `lyra_start_day`, inside `*if (not(lyra_active_set))` and the page lock (§5.4).*
* **Say you wish you could do more.**
  *comment Sets `lyra_refused true` and `lyra_refused_day campaign_day`, same lock. The stage stays `"unstarted"`.*

#### Saying you'll help

**The button is the action, not the line.** `Say you'll help` tells the engine what to do; the player's actual words are prose underneath, exactly as in the kind no. Every branch of this quest gives the player a spoken line.

"You'll get it," you say. "I'll have it before the term's out."

She has made this decision before, and the last time did not go well, so she gives you the arrangement and none of the relief.

"All right," she says. "Don't tell me when you've got it. Come and find me. And don't make a speech about it when you do, because I'll only be embarrassed."

She goes up the walkway toward the compound, and the sag in the middle of it takes her weight the same way it took yours.

#### The kind no

**The second option is not a brush-off and the prose must not punish it.** The player is not walking away from two children; the player is declining to put their hand in someone else's pocket, and Lyra — who has been telling the player her arithmetic rather than asking for a speech — respects that more than she would a performance of sympathy. She never asked. Being told no is the outcome she was already braced for.

> "That's a bad business," you say. "I wish I could do more, and I can't."
>
> She nods, and it is not disappointed. "Aye. Well." She turns the bow a quarter turn in her hand and looks back up the walkway. "Everyone says they can't. You're the first one who said it straight, though, and I'll remember that."
>
> She goes up toward the compound, and does not look back.

**The button names the kindness, not the leaving.** "Leave it on the walkway" told the player what the engine was about to do to them. The new text tells them what they are choosing to be.

**`lyra_refused` stays.** The stage remains `"unstarted"`, so if `lyra_bond` later rises past 20 the hub option returns on its own and the player can take the errand then. A kind no is not a lock, and the plan does not treat it as one. The coda carries a line for this branch (§3).

### Beat 2: The Handing Over (`lyra_b2`)

**Location: the company barracks in Valen, not Dredge-End and not the drill square.** She is a soldier and she sleeps in a bunk like everyone else in the company. `port_valen.txt:365` puts her on the drill square at first arrival inside the `squad = "vanguard"` branch, which is the only place in the game she is named, and Beat 1 ends with her walking up toward the compound, so the errand resolving inside the walls is the only version that is not a contradiction.

**The cask is first-arrival prose and must not be leaned on.** `port_valen.txt:365` renders inside `*if (not(port_valen_hub_seen))` (line 355), which sets the flag on the walk from the ship and never runs again. By the time this quest opens the player has been to Valen many times and the overturned brine cask was described to them once, days earlier, and forgotten. **Do not name the cask or the whetstone in a recurring option.**

**There is no barracks interior scene to reuse.** `port_valen_rest` (line 522) is the player's own bedroll and `port_valen_eat_mess` (line 5098) is the stores awning. Neither is a room with other soldiers in it, so this scene is written fresh and locates her the way a soldier would: the end bunk nearest the door, and her quiver, which is the object that is conspicuously missing when she is on duty.

#### 3.2 The working-hours gate

`calendar.txt:375-385` sets `time_period` to one of six values. She is on duty for three of them:

| `time_period` | Lyra | The player gets |
|---|---|---|
| `"Morning"` | on duty | the absent line |
| `"Midday"` | on duty | the absent line |
| `"Afternoon"` | on duty | the absent line |
| `"Dusk"` | off duty | the scene |
| `"Night"` | off duty | the scene |
| `"Pre-Dawn"` | off duty | the scene |

**The absent line must be a person, not a system.** It is second person, it explains itself in the fiction, and it tells the player when to come back without printing a clock or a word like `time_period`. The player should leave knowing she is about after dark, not knowing that `"Dusk"` is when the variable flips.

*Dusk, off duty:*

The bunks are made up and her gear is not on the rack. Her quiver is not hanging off the end of the bunk nearest the door, where it lives when she is off the roster, and the straw by that bunk has been kicked about by somebody who was not waiting.

"The company do their field work while there is light," a scout passing tells you, not unkindly. "She'll be back after dark. No point sitting in the barracks waiting on her."

*Dusk, the scene:*

She is on the end bunk in the barracks with a blanket over her knees and the bow stood against the frame, and the light has gone the colour of a knife.

**There is no `lyra_b2` scene during working hours and this costs the player nothing.** The option stays on the hub all day, the player can click it and be told where she is, and the errand never becomes something the player is locked out of. The absent line costs no time and sets nothing.

#### With the money

You come down the barracks aisle with the weight of it against your `${hands_prose}`, counting nothing out loud, because a man who counts silver in a barracks is a man telling the room what he has.

She is sitting on the end bunk with the bow across her knees, working a fletching with her thumbnail. She sees you and starts to stand and then does not, which is somehow the loudest thing in the scene.

"${name}." She sets the arrow down. "You did find it."

"Five," you say. "It was five."

You put the silver in her hand.

She does not count it in front of you straight away. She turns it over once, feels the weight, and does the math herself, and you can watch her do it.

"Right," she says, once, and does not say it again. Then, to the ground and not to you: "That's a fortnight's pay I can't get out of the captain, and four months my aunt's back rent. Thank you. You're a real one. You didn't have to do that."

Two bunks down a man grinds the edge off a shield boss with a whetstone and blows the filings off his own thumbnail to see whether they stick to it. Someone has a kettle on a footlocker and is arguing with another man about whose turn it is to feed it. A third is asleep on his back with one boot still on and a sock trailing over the frame.

Nobody looks over.

"I'll pay it back. Of course that's a debt, and I'll pay it back whether or not we've—" she stops, starts again, and picks a smaller sentence. "I'll pay it back. Ask me in a fortnight and I'll have a number."

*comment `lyra_paid true`, `lyra_resolution "paid"`, `lyra_bond +6`, and the 5-silver transaction — all inside the currency and page locks (§5.4). `lyra_paid` also guards re-entry at the top of the label.*

#### Without it

You come down the barracks aisle and stop at the end bunk with your hands empty, and you have already worked out the sentence on the walk over and it does not come out the way you planned it.

"I could not get it," you say. "Not in time."

She looks at your face, and then at the absence of coin in your hand.

She takes the measure of you in about a second, files the answer, and leaves you to it.

"Another month, then," she says, and stands, and shoulders the bow.

She finds another way. The player hears about it later, or does not.

She looks at your face, and then at the absence of coin in your hand.

She takes the measure of you in about a second, files the answer, and leaves you to it.

"Another month, then," she says, and stands, and shoulders the bow.

*comment `lyra_resolution "unpaid"`, stage `"resolved"`. No `lyra_paid`, no coin, no bond change. The coda has one line for this (§3).*
### The Coda (`lyra_epi`)

One scene in the company barracks in Valen, days later. It adds a standing option and touches `port_valen.txt` not at all. **The coda is its own scene and names nothing from the first-arrival paragraph** — the cask and the whetstone are not in this scene, because the player has no reason to remember them (see §3.2).

**She is grateful first, because that is what the player is owed.**

"You're the reason those two are sleeping in a dry room, and I'm not going to pretend otherwise, and I'm not going to kneel about it either." She does not stop what she is doing. "That's yours to spend how you like. I don't care if you tell people or don't."

**Then she promises to pay it back, which is the thread into the next one.**

"And I'm paying it back. I don't know how yet, and I know it'll be in silver, and I want you to have that before I start, because I'm not being brave about it. I'm just good at owing people and bad at it." A beat. "Vane pays out at the contract's end or he doesn't, and I'd rather it wasn't the second thing, and it isn't going to be the second thing."

**Then one line for how it went**, read from the resolution:

| State | The line |
|---|---|
| `paid` | Nothing more. The two passages above have already spent it. |
| `unpaid` | "You never came back with it." She says it without heat. "That's all right. I found it. Ask me how and you'll be bored." |
| The kind no | **Not reachable.** The kind no leaves the stage at `"unstarted"`, and only `lyra_b2` sets `"resolved"`, so a player who declines never sees the coda. There is no coda line for them, by design. |

## 4. Outcomes

| State | `lyra_resolution` | What it means |
|---|---|---|
| **Paid** | `paid` | The children keep the rooms. The player is out 5 silver and closer to Lyra. |
| **No money** | `unpaid` | She found another way, or did not. The player hears about it, or never does. |
| **Refused** | `none` | The stage never left `"unstarted"`. The children go out. The player meets Lyra again only by accident. |

**No gold ending, no best ending, no reputation moves, no items, no buffs.** The whole reward is `lyra_bond` and one conversation at the drill square. If the player walks away, nothing happens to them and the children are out, and the game never tells them they were wrong.

## 4a. Scope

The quest is: **two hub options, three labels, eleven variables, two files of prose, one line in the lorebook, one line in the stats sheet, one line in the backstory.**

Not in it: a new district, a new POI, a new place layer, a new combat call, a new file in the build, an item, a buff, a unique weapon, a reputation move, a romance flag, or any change to her Chapter 1 arc — anxious before the gate, steady after, which is already written in `camp_night.txt` and `battle_black_sinks.txt`.

## 5. Technical Specification

### 5.1 Variables (`startup.txt`)

Eleven, in one block after the Chapter 3 quest variables.

```choicescript

*create lyra_quest_stage "unstarted"   *comment "unstarted", "active", "resolved", "failed"
*create lyra_resolution "none"        *comment "none", "paid", "unpaid"
*create lyra_start_day 0              *comment campaign_day the player accepted; the clock runs from here
*create lyra_deadline_days 10         *comment days standing in for the end of the term
*create lyra_arrears_silver 5         *comment what the rooms cost; one month of a private's pay
*comment guards -- each is set once, inside the page_id lock (5.4)
*create lyra_paid false               *comment the player handed the silver over
*create lyra_have_silver false        *comment computed at Beat 2 from the player's purse
*create lyra_refused false            *comment the player gave a kind no on the walkway
*comment (lyra_moved_on is gone: the coda has no line for the kind no, because that player never reaches it)
*create lyra_epi_seen false           *comment the coda has played
*create lyra_scars_told false         *comment the scars have been explained
*create lyra_active_set false         *comment guards the clock assignment at accept
```

**`mygame.js` is generated — do not hand-edit it.** It regenerates from `startup.txt` on every build and the mirror is overwritten.

### 5.2 The two hub options

**They go on two different hubs in two different files**, because step 1 is in Dredge-End and steps 7 and 8 are in Valen.

**Beat 1 goes on the Dredge-End district hub** (`port_valen_dredge_end.txt`), after `cut_market` and before the Silt-Gate options at line 290:

```choicescript
*if (met_lyra)
  *if ((lyra_quest_stage = "unstarted") and ((not(lyra_refused)) and ((vane_independent_operative) and ((street_life != "empty") and dredge_end_seen))))
    # A man in a steward's apron talking to Lyra, past the lamps.
      *goto_scene port_valen/lyra_quests/lyra_quest lyra_hook
```

Twelve words, and no `[b]` like the eight districts, because it is a scene and not a place. It carries **no time tag**: this quest advances no clock, so any `[~N min]` on these buttons would be a lie.

**Beat 2 goes on the Valen compound hub** (`port_valen.txt`), where she actually is:

```choicescript
*if ((lyra_quest_stage = "active") and (squad = "vanguard"))
  # Lyra on the end bunk in the company barracks. [~15 min]
    *goto lyra_b2
```

Eight words. `squad = "vanguard"` matches the only branch in the game that describes her (`port_valen.txt:362-369`). This button is **not** time-gated — `lyra_b2` itself handles the working-hours case and gives the absent line, so the player is never locked out of the errand and always knows it is live.

`street_life != "empty"` closes the hook in a Storm or Blizzard (`calendar.txt:652`) — the steward is not standing in a gale. Correct per rules §12: weather closes a place, never a quest option.

**The hook is deliberately not gated on `lyra_bond`.** A player below 20 still walks past the conversation and still hears part of it, because a quest that is invisible to a player is worse than one that is refused. The tiering happens inside `lyra_hook`: the greeting and the facts are gated, and at under 20 the `Say you'll help` option never renders. The player learns the errand exists and is not offered it, which is the intended failure state and is reachable by anyone who was cold at the camp brazier.

### 5.3 Everything that changes

| Where | Change |
|---|---|
| `startup.txt` | The block above. |
| `port_valen_dredge_end.txt` | Two hub options; `lyra_hook`, `lyra_b2`, `lyra_epi`; one sentence in the layer-3 street prose. **No existing label's prose is edited.** |
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
  id: "lyra_errand", title: "Five Silver", place: "Dredge-End",
  active: function (s) { return s.lyra_quest_stage === "active"; }
},
```

**Stats sheet**, same shape as the Shroud's:

```choicescript
*if (lyra_quest_stage = "active")
  *line_break
  • [b]Active Errand:[/b] Five Silver — pay Lyra before the term is out
*if (lyra_quest_stage = "resolved")
  *line_break
  • [b]Closed Errand:[/b] Five Silver [i](@{lyra_paid the children kept the rooms|somebody else found the money})[/i]
*if (lyra_quest_stage = "failed")
  *line_break
  • [b]Closed Errand:[/b] Five Silver [i](the children went out on the canal)[/i]
```

### 5.4 Replay safety

The class of bug that matters is a `*set` on a choice path that doubles on a page replay.

| Grant | Guard |
|---|---|
| The 5-silver payment | `*if (not(lyra_paid))` → `currency_add_amount 0-50` + `currency_txn_locked` + `economy currency_add`, inside `stat_bump_locked` / `locked_stat_bump_page_id = page_id`. **`lyra_paid` is the lock; the page lock is the belt.** |
| `lyra_quest_stage "active"`, `lyra_start_day`, `lyra_refused` | `*if (not(lyra_active_set))`. **This is the one that will bite**: without it, replaying the accept page resets the clock to today and silently extends the deadline. |

| `lyra_scars_told` | In the same block that plays the scars scene, so flag and prose cannot disagree. |
| `lyra_epi_seen` | `*if (not(lyra_epi_seen))`. The coda is a standing option and gets walked into repeatedly. |
*comment (no lyra_moved_on: the coda never plays for a player who gave a kind no)

**The currency idiom is not optional.** `*set silver - 5` is a hard fail; it goes through `economy currency_add` with the amount in copper (50) inside the transaction lock.

### 5.5 The Alderford lines

The ridge estates and Dredge-End are two stages of one history in the existing text (`alderford.txt:2112` and `:2096`), and the eviction between them is missing. One sentence in the *existing* `discussed_lyra_archery` beat, gated on `lyra_pay_generous`:

> "Then the bailiffs came up the ridge with hounds and took the house, and we came down to the water, and after a while there was no room for us there either. That's the whole road."

**The pay conversation loses four words.** `alderford.txt:2129` currently reads *"If they made it through the frost, buy them a sack of dry rye flour and square their debt..."* — the flour clause goes, and the line becomes:

> "First thing? Buy a pair of lined leather boots that don't split at the welt. Then track down my aunt's kids in the lower tenements. If they made it through the frost, square their debt with the tenement rent-collector before they get turned out into the silt. That's the only reason I took Vane's coin."

**And the "cousins" / "aunt's kids" slip is fixed** by naming them once, in the archery beat, and leaving `:2129` as it stands.

**Lorebook** — Lyra's entry becomes `body: function (s)` with pushes gated on `lyra_pay_generous` (the aunt, the two children, the arrears, her history with the Oath), on `lyra_quest_stage` (where the errand stands), and on `lyra_scars_told` (**the payoff**). Add `baron_karr` to her `see` array so the story-linker cross-links from the baron's entry.

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
5. **Beat 2:** with the money and without it; **replay the page and confirm the silver is not taken twice.**
6. **The coda:** all three resolution lines, the scars reveal on first visit and its absence on a repeat, at any `lyra_bond`.
7. **The Alderford lines:** play the taproom at `lyra_bond` 7, 14, 15 and 20; the new sentence appears only at 15+, `:2129` loses the flour clause, and `battle_black_sinks.txt` is byte-identical.
8. **Replay safety:** `node refresh_fuzz_test.js num=30 seed=3 mode=smart`, plus a positive control.
9. **Linters:** `node tools/lint_all.js` on the changed scene files. Expect `lint_choices` to report the one intentional binary gate.
10. **Render:** `node tools/render_hub.js` for Dredge-End across weather x time x day.

---

## 9. Decisions to Confirm

### Lyra's squad: leave it, and fix the one label

**She is not in the Vanguard, and moving her is a retcon this quest does not need.** `camp_night.txt:1064` prints her as **`Lyra (Vanguard Scout)`**, which is already the contradiction the user spotted: she fights with a recurve bow, and `dawn_trial.txt:585` puts rogues and rangers in the Scout Company. So a bow-using player gets the Scout Company and still reads "Vanguard Scout" beside her name.

**But `squad` is the player's unit, not hers.** `dawn_trial.txt:580-592` assigns it from `character_class` — fighter and barbarian to vanguard, rogue and ranger to scouts, bard and warlock and wizard to cadre. Nothing sets it for Lyra, because she is an NPC and the variable was never meant to describe her.

**Therefore:** do **not** move her prose out of the `squad = "vanguard"` branch at `port_valen.txt:362-369`. Doing so means editing the player's own arrival scene and inventing a new home for her in the scouts text, for a quest that plays identically either way. **The quest gates on `lyra_quest_stage` and `squad = "vanguard"` only because that is the branch where the game already puts her**, not because the Vanguard is correct.

**The cheap fix, if wanted:** change `camp_night.txt:1064` to `Lyra (Vanguard)` — one line, no scene edit, and the bow/label mismatch disappears. Not required for this quest.

**Consequence for the plan:** every reference to her unit in this document is descriptive only. No mechanic keys off "she is Vanguard." The barracks location is justified by her being a soldier in the company, not by her squad assignment.

1. **Five silver** is one month of a private's pay (rules §3: ~6/month) and about fourteen shifts of crane work, or one small contract. The player can earn it inside the ten-day window. Still check against `randomtest` output before locking it.
2. **Ten days.** Enough for two or three errands. Two days is a scramble that looks like a quest; twenty is a chore.
3. **Should the coda's refusal line play for a player who walked away?** It is the only trace a refusing player gets. One sentence. Keep it, but it is the first thing to cut if the coda feels crowded.

* **The Oath's oaths and roll moved** out of the Alley Shrine into *its own room behind a chandler's* — *"It kept its own room behind a chandler's for the oaths and the roll of sworn names, and that is where they still are."*
* **A third line added to the Oath's entry:** *"They have nothing to do with the friar at Althea's arch. Both of them feed the same quarter and neither will say so in the other's hearing."*
* **The Alley Shrine entry** now says the friar feeds whoever is hungry and asks nothing, the men in boiled leather are there to find out who has stopped turning up, and the two are not connected.
* **The two savvy-player lines in `port_valen_dredge_end.txt`** (`:197`, `:3158`) lost the "who gets pulled out of the line" and "Black Oath runners" language. The men now tap a shoulder, say two words, and walk off up the lane.
* **The friar's `alley_shrine` lore push** changed from *"whoever is on the list that week"* to *"whoever he has it for that week"*.
* **The Oath's `see` array** no longer cross-links `alley_shrine`.

**What this buys beyond this quest:** a room behind a chandler's that nobody rents is already in the fiction (`port_valen_dredge_end.txt:1418` — *"the chandler's upper room has candles burning in it at all hours, and that nobody has ever seen it rented"*). It is now the Oath's, which is a real location a later quest can put a door on. **The Stolen Shroud is untouched** — it runs entirely on the friar, the bowl and the gravedigger.

The second line's `@{...}` takes a **bare boolean** — `lyra_paid` is one, and nested parentheses are not supported in that position (`STOLEN_SHROUD_PLAN.md` §6.4).
