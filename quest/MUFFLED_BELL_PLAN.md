# Quest Plan: The Muffled Bell (The Pier)

A small, linear, one-night quest at **the Pier** in Harbor Quayside. Someone has packed the wreck-bell's striker with greased wool so it cannot ring. A coasting ketch is feeling her way in toward the reef, and a wrecking gang waits in a boat below the ladder to strip her when she breaks. The player can act, or turn back and let it happen.

**Status:** implemented in the game. It replaces the Tobin quest ("What the Bar Keeps"), which was removed from the pier, and it grew out of `quest/Quest Ideas`. This file is kept as the design and prose reference, and `quest/QUESTS.md` (Quest 4) is the current summary. Where this file and the scenes differ, the scenes are right (see the note at the top of Section 4).

**Verified.** `quicktest` passes with no uncovered lines in `port_valen.txt`. A scripted driver (the real engine, the game's own dev-menu characters, forced dice) then walked 51 scenarios, all passing: every gate condition on its own, all four weather types, both hours, every Beat 2 and Beat 3 option with a success and a failure, the per-approach fight flags, the fight ending `victory`, `rescued` and `fled`, both endings with the exact coin and standing change, the cantrip and Guidance options, the pre-seed rumor and all five after-rumors, the ladders line, and the pier world-memory lines. A second pass replayed every page of every route on top of its own results (what opening the Stats screen and returning does) and found no difference, and the same check catches a double-applied clock, coin or standing when the locks are knocked out on purpose. The one exception is the fight's own pages, which show the same replay difference in the shipped Dredge-End ambush and belong to the shared combat engine. The stats-sheet lines, the quest-log entry and the lorebook `pier` entry were checked for every outcome. `lint_all.js` reports nothing on the new lines, and the pier menu still passes `lint_thin_places.js`. The driver scripts were session-local and are not kept in the repo.

---

## 0. Decisions Already Made (read this first)

These were settled in discussion and should not be re-opened without a reason.

1. **The bell stays, no lighthouse.** 28 lines of pier prose already lean on the bell. It has no rope and the surge rings it, so the only way to silence it is to pack the striker, and undoing that takes a climb. A lighthouse would need a tower, a keeper and a mage. A false light can be a separate quest later.
2. **One quest, one night, four beats, no faction tie-ins.** No Dockmaster Voss, no Captain Vane, no Black Oath, no Gilded Scales. The only standing that moves is Port Watch +1, on one route.
3. **The player never arrests, hauls or drags anyone, and never hands anything to anyone.** The Watch notices the bell, arrives just in time, and takes over.
4. **Fights only follow a failed roll.** There is no "fight them" button. The wreckers are the consequence of failing Beat 3.
5. **The ending is one small choice.** Leave the pouch on the step and get **+1 Port Watch standing, no coin**, or pick it up and get **5 silver, no standing**. The standing only comes if you leave the pouch, so the two options cost each other something.
6. **The bribe.** When the wreckers back down, the leader throws a pouch at your feet to buy your silence. If it comes to a fight, the same pouch drops from his belt. It is the same pouch and the same choice on both paths.
7. **A real loss state.** Turning back or failing the bell roll means the ketch breaks on the reef, with its own prose, stats line and rumor.
8. **Nobody is named.** The player never learns a name. Everyone is described by what can be seen.
9. **Small reward, no gear.** Neighborhood-scale, in line with the Fish Slip (up to 5 silver).
10. **It reuses a slot the removal freed.** The pier's world-memory lines and Keel rumor slot are empty now. It also gives the orphaned `codex_wreck_law` entry a reason to unlock again (Section 5.4).
11. **The wreckers die if you win the fight.** They came up the ladder to kill whoever rang the bell. Men knocked out on the steps would talk to the Watch about who paid the guards, which opens an investigation this quest does not want. Dead men leave no loose ends and match how the Dredge-End ambush ends. The engine's non-lethal mode has finisher text written for the Alderford guards ("sawdust", "curing bench", "floorboards"), and it was left alone. Making that text generic is a separate job if a later fight needs it.

---

## 1. Overview, Cast & Trigger

### 1.1 Premise, and why the guards turn up

The bell hangs on a timber gallows-frame at the head of the breakwater, over the reef. The sea swings the striker against it, so it tolls whether or not anyone is there. A ship feeling in through bad weather steers by that sound.

The gang packs the striker with greased wool, lashes it tight with a cord run down the post to an iron cleat, and waits in a boat under the ladder. When a ship breaks her keel on the reef, they are on her before the tide turns and gone before the customs tower opens. Salvage taken that way is theft from the crown (the Harbor Wreck Law codex entry).

The gang has also paid the Watch to be elsewhere. The post by the landing stairs stands empty. **A bribe buys not being noticed, and it cannot cover a bell the whole harbor hears.** That one sentence is why the Watch arrives on every success route, and why "the Watch is coming" is a true threat in Beat 3.

### 1.2 Cast

Nobody is named, by design (narrative guidelines §1 and §7).

| Who | What the player sees | Combat type |
|---|---|---|
| **The lantern man** | Thin and hooded, a horn lantern with its shutter stuffed with cloth on his wrist, a sling coiled at his belt. First seen going down the ladder. | `dock_lookout` (6 HP, AC 10, sling, 25% Blinded) |
| **The broad man** | Broad in the shoulder, cropped beard, a hatchet with a pitted head hanging from his fist. He sits on the oars, then comes up the steps. He is the one who throws the pouch. | `gang_hatchet` (10 HP, AC 11, slashing, 30% Bleeding) |
| **The ketch** | Two mast lanterns in the haze, then a thin voice across the water. Never boarded, never named. | none |
| **The watchmen** | Two, in greased sheepskins with a swinging lantern (the pier's storm-day prose already has watchmen in sheepskins). The older one runs out of breath. The younger goes straight to the ladder. | none |

### 1.3 The trigger (all six must be true, then a chance roll)

| # | Condition | Why |
|---|---|---|
| 1 | `bell_quest_stage = "unstarted"` | The quest fires once. |
| 2 | `bell_heard_story` | The player has heard, from an NPC, that the bell has gone quiet before and nobody was there to notice. Two sources, Section 4.1. |
| 3 | `pv_pier_seen` | The player has stood at the pier once and knows what the bell sounds like, so silence is noticeable. |
| 4 | `time_period` is `"Night"` or `"Pre-Dawn"` | Wreckers work in the dark. |
| 5 | `weather_severity < 3` **and** `weather_visibility` is not `"clear"` | A ship needs the bell when she cannot see the reef: Fog, Rain, Snow or Sleet. Storm and Blizzard already empty the pier. Read the flags, never weather names (rules §12). |
| 6 | `*rand` 1 to 100 is at or under `bell_hook_chance` (default **20**) | Keeps it from firing the first eligible time. Tunable. |

**Why not Fog only.** Fog is about 20% of autumn days, 10% of spring, 5% of summer, and never happens in winter, where the calendar turns it into Overcast. A Fog-only gate would leave the quest almost unreachable. Fog, Rain, Snow and Sleet together cover roughly 45% of autumn days, 35% of spring and winter, and 20% of summer.

### 1.4 Where it plugs into the pier

* **Hook:** `pv_poi_pier` pays its 15 minutes and runs the death check as usual. Then, before the first-visit and layered arrival prose, it evaluates the gate. If it passes, it goes to `bell_hook`, which prints its own arrival (the bell is silent, so the normal arrival, which mentions the bell tolling on nearly every branch, cannot run).
* **No hook:** arrival is unchanged.
* **Return:** a successful quest ends at `pv_poi_pier_menu`. A failed one ends at the Quayside hub (`port_valen_harbor_pois`), because the pier menu's bell prose would read wrong right after a silent bell and a wreck.
* **World memory:** two short timeless lines at the foot of the pier arrival, in the slot the removed quest used (Section 4.8).

---

## 2. The Spine

| Beat | Label | Time | What happens | Roll |
|---|---|---|---|---|
| **1. The Silence** | `bell_hook` | (entry's 15 min) | Silent bell, greasy post, a lantern man going down the ladder, mast lanterns lined up with the reef. Go out to the post, or turn back. | none |
| **2. The Bell** | `bell_b2` | 15 min | Get the bell ringing before the ketch reaches the foam. | **the climax**: one roll |
| **3. The Steps** | `bell_b3` | 15 min | The wreckers come up the ladder to silence whoever rang it. Hold them until the Watch arrives. | one roll, failure means a fight |
| **4. The Pouch** | `bell_b4` | 15 min | The Watch arrives and takes over. Leave the pouch or take it. | none |

Every beat starts after a `*page_break`, one `advance_time` per page (rules §12, "two calls on one page double-advance on refresh").

### Beat 1: The Silence

The player has heard the story and knows the bell. They walk out and it does not toll. Three tells, each physical: the striker thuds dull against the bronze, the frame post is slick and smells of lard, and a hooded figure is going down the ladder into a rowboat where someone waits on the oars. Then the mast lanterns, lined up with the pale stripe of foam where the reef breaks.

* **Go out to the frame post.** Sets `bell_quest_stage "active"`.
* **Turn back along the causeway.** Sets `bell_quest_stage "failed"`, `bell_resolution "wrecked"`, `bell_walked_away true`, and goes to the loss aftermath.
* A binary yes-or-no gate: mark it `*comment lint-ok two-options: plain yes or no`.
* This is a real decision the player can decline. The emergency exception in rules §1 covers a ship about to hit the reef, and the story and visibility gates mean the player has context and is not being told what to do.

### Beat 2: The Bell (the climax)

The wool is packed into the striker's head, tied off to an iron cleat at the foot of the post. There is time for one attempt. This roll decides the ketch, so **failure ends the quest** (rules §2: the climactic check cannot be rescued).

| Option | Check | Notes |
|---|---|---|
| Climb the frame and tear the wool off by hand | `[STR DC 12]` | Wet timber, no weather modifier (see below). |
| Throw stones at the bronze until the harbor hears it | `[DEX DC 12]` | **Advantage with `weapon_type = "ranged"`**, so a bow or sling user shoots the bell instead. No weapon is required. |
| Follow the cord to the cleat and slip the hitch | `[INT DC 12]` | Cunning route (rules §2, archetype parity). |
| `[Cantrip: Mage Hand]` | auto | Pull the wool free from the ground. |
| `[Cantrip: Minor Illusion]` | auto | Throw the sound of the bell out over the reef. Minor Illusion can make a sound, and the real striker stays muffled. |
| `[Cantrip: Guidance]` | none | Pre-cast, +1d4, loops back to the hub (existing pattern). |

* **Cantrip options succeed without a roll.** That is the game's existing precedent (Mage Hand in the old pier quest, Minor Illusion at the Rotten Rib and the Fish Slip). The cost is that the build has to have the cantrip.
* **No weather modifier on these rolls.** Visibility is the trigger, not a penalty. Rules §12 says any effect on the odds has to be a deliberate decision written in the plan, and this plan decides there is none. The cold and wet are in the prose only.
* **Success:** the bell rings and the ketch turns. Go to Beat 3.
* **Failure (any option):** each option has its own failure line, then all fall into the shared wreck aftermath. Sets `failed` and `wrecked`. The player is walked back to the quay.

### Beat 3: The Steps

The lantern man and the broad man come up the ladder and stop three steps down. They know the bell has been rung and someone rang it. There is no "fight" button. The three approaches are all ways of getting through the next few minutes until the Watch's lantern shows.

| Option | Check | On success | On failure, the fight starts with |
|---|---|---|---|
| Tell them the whole harbor heard the bell and the Watch is coming | `[CHA DC 12]` | He weighs it and backs down. | **enemy advantage** (they call the bluff and strike first) |
| Plant yourself at the head of the steps and do not move | `[STR DC 12]` | He measures the drop and the steps and does not come up. | **player disadvantage** (a weeded step gives way) |
| Watch the broad man's eyes and give him a way out | `[WIS DC 12]` | He takes the excuse. | **both** (you misjudged him, and he knows it) |
| `[Cantrip: Guidance]` | none | Pre-cast, loops back. | |

* All three success paths lead to the same place: the Watch's light appears at the landward end of the causeway, the broad man throws the pouch, and both men take the boat. Go to Beat 4.
* Per rules §13, each failure has a different cost, and the fight uses the flags the Dredge-End ambush already sets (`combat_enemy_advantage`, `disadvantage`).
* The STR option is written as posture and presence, not a hand on a weapon (narrative guidelines §9).

### The fight

Only reachable through a Beat 3 failure. `fight_wreckers` (new entry label in `combat.txt`, Section 5.3). Outcomes:

| Outcome | What happens | Result |
|---|---|---|
| `victory` | Both men are down. The pouch has burst partway open on the step where the broad man fell. Go to Beat 4. | the same choice as the talk path |
| `rescued` | HP floors at 1 (this fight is non-lethal by default). A whistle sounds along the causeway just as the hatchet lifts, and the wreckers' boat backs off the ladder. | **resolution `"bloodied"`: no pouch, no coin, no standing.** The ketch is saved. The cost is the wound, which persists in Port Valen. |
| `fled` | The player runs the causeway toward the light. Same result. | `"bloodied"` |
| `player_died` | The death screen, with the standard call-site check (`death_cause "combat"`). | |

The Watch arriving "just in time" is not a special mechanic. It is how the `rescued` outcome is narrated.

### Beat 4: The Pouch

Two watchmen reach the head of the breakwater at a run. The older one has to stop and breathe. The younger goes to the ladder and looks down at the water. The older one says a line that names what the gang was after: **wreck-goods** (this sets `codex_wreck_law`). The pouch is at your feet, and both watchmen are looking elsewhere.

* **Leave the pouch where it lies.** The older watchman finds it, counts it under the lantern, and looks up at the bell. `bell_resolution "reported"`, `port_watch_rep +1`, no coin.
* **Pick it up.** `bell_resolution "pocketed"`, +5 silver, no standing.

The older watchman tells you to go down to the quay, and adds "We have this." Nobody is detained, questioned or escorted.

---

## 3. Outcomes

| Route | Trigger | State | Reward |
|---|---|---|---|
| **Reported** | Beat 4, leave the pouch | `bell_quest_stage "resolved"`, `bell_resolution "reported"` | `port_watch_rep +1`, no coin |
| **Pocketed** | Beat 4, take the pouch | `"resolved"`, `"pocketed"` | +5 silver, no standing |
| **Bloodied** | Fight ends `rescued` or `fled` | `"resolved"`, `"bloodied"` | none. The ketch is saved and you are hurt. |
| **Wrecked** | Turn back, or fail the Beat 2 roll | `bell_quest_stage "failed"`, `"wrecked"`, plus `bell_walked_away` if you turned back | none. The ketch breaks on the reef. |

Loss state (rules §2): every quest needs one, with aftermath prose, a stats-sheet line and a rumor. Wrecked has all three.

---

## 4. Prose Drafts

**Note:** the wording in `port_valen.txt` is final, and it changed in a few places during implementation and testing. The loss endings now show the bell being freed too late (the turn-back version hears it from the quay, the failed-roll version tears the wool loose after the crack), because the Quayside hub prose says the bell tolls and the drafts left it muffled. The two endings gained a fight-path line where the older watchman looks at the dead men. "Inside your coat" became "tuck it out of sight", since the apparel linter rightly flags assuming a coat. Repeated words ("frame", "one") were varied. The drafts below are otherwise faithful.

Drafts for review, written to the narrative guidelines: second person, present tense, plain words, no names, no role labels, no hand-on-weapon threats, no `weather` printed mid-sentence. Bracketed lines are sky or state variants. Mechanics notes appear in italics and never in the story text. These need the full linter pass once they are code (Section 7).

### 4.1 The two ways to hear the story (sets `bell_heard_story`)

**Keel rumor**, a new branch in `pv_poi_tavern_rumors`, placed with the other pre-seed rumors and gated `(bell_quest_stage = "unstarted") and (not(pv_tavern_rumor_bell))`. Sets `pv_tavern_rumor_bell` and `bell_heard_story`.

> A skiff hand with a salt-cracked lip tells the end of the bench about the night the bell went quiet. A grain barge, he says, feeling in through weather with her crew listening for it, and the bell never sounded. She broke her back on the reef before dawn. By first light the wool was gone from the striker and the watchmen at the stairs had seen nothing. "Nobody was out on the stone that night," he says. "Nobody could have told you it wasn't ringing until she hit."

**The lower ladders**, added to `pv_poi_pier_ladders` for Dusk and the daytime hours only, gated `(bell_quest_stage = "unstarted") and (not(bell_heard_story))`. It sets `bell_heard_story`. Prose only, no new menu option.

> Two skiff hands are coiling line on the lower planks, arguing about the grain barge that broke on the reef. "The striker was stuffed," says one. The other spits into the water. "Stuffed by who? Nobody saw a thing." "That's what I mean."

### 4.2 Beat 1: The Silence (`bell_hook`)

Sky sentence, one per weather, no people:

> [Fog] Fog has swallowed the harbor lamps behind you and laid a lid on the sea ahead.
> [Rain] Rain slants across the stone and smears every light on the water.
> [Snow] Snow drifts sideways past the frame and hides the far end of the reef.
> [Sleet] Sleet ticks against the timber and freezes in the notches of the frame post.

Body:

> You know the sound this place makes. One slow stroke behind every heave of the sea, out here where the stone runs out. [sky sentence] Tonight the sea heaves and no stroke follows.
>
> At the head of the breakwater the frame stands black in the murk, and the bronze bell hangs in it over the surf, swinging with every swell. Something is wrong with the striker. It swings and thuds, dull as a fist in a pillow, and the note that should roll out over the reef stays inside the frame.
>
> You lay a hand on the frame post the way the watermen do. The timber is slick, and your fingers come away greasy and stinking of old lard.
>
> Below the head of the stone, a horn lantern with a rag stuffed in its shutter moves on the landing stage. A hooded figure is scrambling down the ladder into a rowboat, where someone is already sitting on the oars. Neither of them looks up.
>
> Then you see the lights. Two yellow points hang low in the haze beyond the reef, one behind the other, slow and steady. A ship's mast lanterns, feeling their way in. They are lined up with the pale stripe of foam where the reef breaks.

Choice:

> `# Go out to the frame post and see what is wrong with the striker.`
> `# Turn back along the causeway.`

**Turn back** (`bell_walked_away`):

> You put the frame behind you and walk the causeway toward the harbor lamps. The lights out on the water do not stop. Somewhere past the halfway stone you hear a long, low tearing, like a door pulled off its hinges, and then voices, small across the water, and then the knock of oars. You keep walking until the stone under your boots is the quay.

### 4.3 Beat 2: The Bell (`bell_b2`)

Set-up, after choosing to go out:

> The wool is packed into the striker's head in a greasy wad the size of a loaf, and a cord holds it there, run down the post to an iron cleat at its foot. Under the wad the striker swings and thuds. Out on the water the mast lanterns have not turned. You have a few minutes, and the bell has to ring.

Options (each with its own success and failure, per narrative guidelines §2):

**Climb** `[STR DC 12]`
> *Success.* The timber is slick with lard, but the notches in the post are cut at every height of a hand, and you climb them like rungs. Halfway up you hook one arm round the beam, get your fingers into the wool, and heave. It comes away in a greasy rope, and the striker swings free. The bell answers at once, one huge flat note that shudders through the frame and rolls out over the reef.
> *Failure.* You get as high as the crossbeam before your hands slide on the lard. The wool is packed tighter than it looked, and you spend the moments you had hauling at it with fingers that will not close.

**Throw** `[DEX DC 12]` (*advantage with a ranged weapon; the ranged version says "your ${weapon}" once and never assumes what it is*)
> *Success.* The third stone hits the bronze dead center. The note goes out over the reef, raw and ugly and impossible to miss, and you keep throwing until your arm burns.
> *Success, ranged.* You skip the hunt for a stone and put your first shot into the bronze. It rings. You put the next one after it.
> *Failure.* The first stone skips off the granite. The second goes into the sea. The third clips the frame and the wood only thuds. By the time you have a fourth in your hand, the mast lanterns are level with the foam.

**Cord** `[INT DC 12]`
> *Success.* You follow the cord down the post with your fingers to the cleat, where somebody has taken three neat turns and a hitch. It is tied to be untied by someone who knows the knot, and you do. A pull, a shake, and the striker throws the wad off on its next swing. The bell answers before the wool reaches the water.
> *Failure.* The cord is wet, the hitch has swollen, and in the dark you cannot find the end. You pull the wrong turn and lock it tighter, and by the time you find the right one, the lanterns are much closer.

**`[Cantrip: Mage Hand]`**
> A pale hand of force rises along the post, closes on the wad of wool, and pulls. The wool comes away with a wet tearing sound, and the striker swings free. The bell rings.

**`[Cantrip: Minor Illusion]`**
> You shape the sound in your mind, then let it go. A deep, slow stroke rolls out of the empty air above the reef, and then another, exactly where the real bell should be.

**Success tail** (shared, then `*page_break`):
> Out on the water, the two mast lanterns swing hard to the left. A thin voice carries across the swell, someone on that deck shouting for a lead-line. The lights slide on past the foam and go steadily toward the harbor mouth until the haze takes them.

**Failure tail** (shared, then to the wreck aftermath):
> The lanterns do not turn. A long, tearing crack rolls across the water, like a door pulled off its hinges. One of the mast lights swings, tilts and goes out. Voices carry over the swell, a lot of them, high and quick, and then fewer. Below the ladder a pair of oars begins to dip, and the rowboat you saw slides away into the murk toward the sound.
>
> Nobody comes along the causeway. You stand at the frame post with your hand still on the wood, and the bell swings and thuds and does not ring.

Then `*page_break Back toward the docks…` and `*goto port_valen_harbor_pois`.

### 4.4 Beat 3: The Steps (`bell_b3`)

> Below the head of the stone, the oars stop. The boat bumps the foot of the ladder, and two men are coming up the steps fast. One has the rag-stuffed lantern swinging from his wrist. The other is broad in the shoulder, with a hatchet hanging from his fist, its head pitted with rust. They stop three steps down, breathing hard. The broad one looks at the bell, then at you, then along the causeway toward the harbor lamps, and his eyes stay there a moment too long.
>
> "That wasn't yours to ring," he says.

**Talk** `[CHA DC 12]`
> *Success.* "Every watchman between here and the customs tower heard that, and half the harbor with them," you say. "You've got as long as it takes to walk here from the stairs. Whatever is in that boat is worth less than what they'll do to you." The lantern man is already looking down the causeway. Out past the stairs, a light has started to bob.
> *Failure.* "Nobody's coming," says the broad man. He has been listening to the same night you have, and there are no whistles in it yet. He comes up the last three steps with the hatchet swinging loose at his knee.

**Hold the steps** `[STR DC 12]`
> *Success.* You plant your feet on the wet stone at the head of the steps, square across the only way up, and stay there. The lantern man stops. The broad one looks at the width of the steps, at the drop on either side, and at you, and he does not come up. Behind you the causeway begins to ring with running feet.
> *Failure.* The step under your left foot is green with weed, and it goes when you shift your weight. You catch the frame post with one hand and lose your footing on the other, and the broad man takes the step you gave him.

**Give him a way out** `[WIS DC 12]`
> *Success.* You watch his eyes and not the hatchet. They go to the causeway again and again, and each time they come back a little slower. "You didn't see a face," you say. "All you saw was a bell that wanted ringing. Take your boat." It is the offer he was waiting for.
> *Failure.* "You can take your boat and go," you say, and your voice comes out thin. The broad man hears how thin. The hatchet comes up.

### 4.5 The bribe (all three success paths, before Beat 4)

> The broad man swears through his teeth and drags a leather pouch off his belt. He throws it, and it lands on the step at your feet with a heavy clink. "For your trouble, bellringer," he says. "You never saw a face." Then he is going down the ladder, and the lantern man goes after him, and the oars bite. The boat slides off into the murk.
>
> The whistle comes down the causeway then, two long notes, and the light that has been bobbing at the landward end breaks into a run.

### 4.6 The fight lead-ins and outcomes

Each failure line in 4.4 flows straight into `fight_wreckers`. The bespoke flavor overrides are in Section 5.3.

> *Victory.* The broad man goes down on the step and does not get up. The lantern man is sprawled at the foot of the ladder with his sling under him, and the boat is drifting away on its painter. A leather pouch has burst partway open on the stone where the broad man fell, and silver shows through the split. Along the causeway, a whistle sounds, two long notes.
>
> *Rescued.* Your knees go. The hatchet lifts, and a whistle shrieks along the causeway, two long notes, and it does not fall. The boat is already backing off the ladder when the lantern light reaches the head of the stone, and two watchmen find you sitting against the frame post with a hand pressed to your side. "Get down to the quay," the older one says, not unkindly. "We have this."
>
> *Fled.* You run. The causeway is a long dark road, and behind you the hatchet rings off the frame post where you were standing. Halfway to the stairs you meet two lanterns coming the other way at a run, and they part around you without slowing. The older watchman calls out as he passes. "Get on home. We have this."

*The rescued and fled outcomes have no pouch. The fight took the reward, and the wound is the cost.*

### 4.7 Beat 4: The Pouch (`bell_b4`)

> Two watchmen in greased sheepskins reach the head of the breakwater, a lantern swinging between them. The older one stops with both hands on his knees to get his breath back. The younger goes straight to the ladder and looks down at the water.
>
> "Half the harbor heard that," the older one says, between breaths. He looks at the bell, and at the post by the stairs he has just run past. "And nobody on it tonight. She'd have been wreck-goods by sunup, that ketch, and every hook on the quay out for her."
>
> The pouch is at your feet. Both of them are looking somewhere else.

*Fight-path variant (after `victory`): the younger watchman does not go to the ladder. He crouches over the broad man, turns his head with two fingers, and straightens without a word to anyone. The pouch line becomes: "The pouch is at your feet, split open on the stone. The younger one is looking at the dead men, and the older one is looking at the bell."*

Choice (`*comment lint-ok two-options: take it or leave it`):

> `# Leave the pouch where it lies.`
> `# Pick up the pouch.`

**Leave** (resolution `reported`, once-guarded):
> You step back from it. The older watchman's eyes find it a moment later, and he nudges it with his boot, opens it, and tips silver into his palm under the lantern. He turns the coins over. Then he looks up at the bell, and at you. "You rang that," he says. It is not a question. "Go on down to the quay. We have this."
> *[b][⚖ Harbor Standing: Port Watch Rep +1][/b]*

**Take** (resolution `pocketed`, currency-locked):
> You bend for the pouch and slide it inside your coat before either watchman turns. It is heavier than it looked. The older one comes to the frame and looks up at the striker, then looks you over once from boots to hat. "You rang that," he says. "Go on down to the quay. We have this."
> *[b][💰 Found: 5 Silver Marks][/b]*

Both then `*page_break Back along the causeway…` and `*goto pv_poi_pier_menu`.

### 4.8 World memory at the pier arrival

Two short lines, timeless (nothing that goes false on Day 3673), placed at the foot of the pier arrival where the old quest's lines used to sit.

* **Any success** (`resolved`): *A length of grease-stiff cord still hangs from the iron cleat at the foot of the frame post, and nobody has taken it down.*
* **Reported only**: *A hooded lantern hangs on a hook by the landing stairs now, lit through the night.*
* **Failed**: *More names than the post has room for are cut at hand height on the seaward side, crowded shoulder to shoulder.*

### 4.9 After-rumors (the Keel)

Replaces the pre-seed rumor once resolved or failed, branch by outcome, gated `(bell_quest_stage = "resolved" or "failed") and (not(pv_tavern_rumor_bell_after))`.

* **Reported:** A caulker with tar to the elbows shakes his head into his cup. "The bell went off at all hours the other night, no rhythm to it, like a man beating a pot. Watchmen came off the pier with a purse, they say, and there's a lantern on the stairs now."
* **Pocketed:** A porter lowers his voice. "The watchmen found the striker bare and the steps empty, and there's talk a purse went missing off the stone."
* **Bloodied:** An old net-mender turns her mug in her hands. "Somebody rang it. They found a stranger on the steps with a hatchet's work on them, and the boat was already gone."
* **Wrecked, tried:** A drayman leans back on his stool. "A coaster broke on the outer reef. Somebody was seen on the frame trying to tear the wool off when she struck. By first light the salvage crews had stripped her, and there was nothing left for customs to count."
* **Wrecked, turned back:** A skiff hand looks into his beer. "Nobody was out on the stone again. Same as the grain barge."

*The wrecked rumors carry the words "wreck-goods" or "salvage" so a player who never met the watchmen still learns the term. Sets `codex_wreck_law` in the `wrecked` branches.*

---

## 5. Technical Specification

### 5.1 New variables in `startup.txt`

Put them in the pier's block, after `pv_tavern_rumor_3`, before the Quiet Block header, where the old quest's variables sat.

```choicescript
*comment --- THE MUFFLED BELL (the Pier, see quest/MUFFLED_BELL_PLAN.md) ---
*comment bell_quest_stage: "unstarted", "active", "resolved", "failed"
*create bell_quest_stage "unstarted"
*comment bell_resolution: "none", "reported", "pocketed", "bloodied", "wrecked"
*create bell_resolution "none"
*create bell_resolved false
*create bell_heard_story false
*create bell_walked_away false
*comment percent chance per eligible pier visit (the gate in pv_poi_pier). Tune here.
*create bell_hook_chance 20
*create pv_tavern_rumor_bell false
*create pv_tavern_rumor_bell_after false
```

Every variable is read somewhere (`bell_resolved` guards the rewards, `bell_walked_away` picks the loss prose, the stats line and the rumor). `bell_resolved_day` is left out on purpose because all the world-memory lines are timeless. `codex_wreck_law` already exists.

### 5.2 The gate in `pv_poi_pier` (sketch)

```choicescript
*comment (after the death check, before the first-visit / layered arrival prose)
*temp bell_roll 0
*if ((bell_quest_stage = "unstarted") and (bell_heard_story and pv_pier_seen))
  *if ((time_period = "Night") or (time_period = "Pre-Dawn"))
    *if ((weather_severity < 3) and (not(weather_visibility = "clear")))
      *rand bell_roll 1 100
      *if (bell_roll <= bell_hook_chance)
        *goto bell_hook
```

`update_weather_flags` runs inside `advance_time`, which `pv_poi_pier` has just called, so the flags are fresh.

### 5.3 The fight (`combat.txt`)

New entry label `fight_wreckers`, modeled on `fight_dredge_ambush`:

```choicescript
*label fight_wreckers
*comment Two wreckers: a hatchet-hand and a sling lookout. Lethal by design (they came to
*comment kill the bell-ringer, and survivors would talk to the Watch). The non-lethal mode's
*comment finisher text is Alderford-guard specific, so it is not used. Reports combat_outcome;
*comment the caller (bell_b3) narrates.
*set combat_is_nonlethal false
*set combat_enemy_count 2
*set combat_apply_type "gang_hatchet"
*set combat_apply_slot 1
*gosub apply_enemy_type
*set combat_apply_type "dock_lookout"
*set combat_apply_slot 2
*gosub apply_enemy_type
*comment retune the flavor lines that assume a street (see the note below)
*set combat_round 1
*gosub apply_generic_weapon_flavor
*gosub fight_setup
*goto fight_round_hub
```

**Seven lines were retuned for a stone breakwater** (set after the `apply_enemy_type` calls, in this label only, so Dredge-End keeps using the shared types unchanged). The first pass of this plan named three; reading every line of both types found four more.

* Hatchet-Hand `miss_5` mentioned a rain barrel (now an iron mooring ring in the stone).
* Lookout `hit_4` came from the shadow of a gangway, and `miss_1` to `miss_5` had a canal, a shutter, planks, a lamp-post and a rain barrel. The lookout's slot is 2, so those overrides use the `combat_flavor_enemy2_*` names.

Caller in `bell_b3`:

```choicescript
*gosub_scene combat fight_wreckers
*if (combat_outcome = "player_died")
  *set death_cause "combat"
  *set death_enemy_epithet "the wreckers on the breakwater"
  *goto_scene death death_screen
*if (combat_outcome = "victory")
  *goto bell_won
*if (combat_outcome = "rescued")
  *goto bell_rescued
*goto bell_fled
```

Before the call, each Beat 3 failure sets its flags (Section 2): `*set combat_enemy_advantage true`, `*set disadvantage true`, or both.

**Balance.** The pairing is the same weight as the Dredge-End ambush: about 64 to 67% overall at level 1 against the ten stock builds (a Fire Bolt wizard is about 43 to 49%, a barbarian about 100%). That is acceptable here because the fight only follows a failed roll, the player cannot die by default (HP floors at 1 and `rescued` reads as the Watch arriving), and the real cost is a persistent wound. No new sim is needed unless the stats change. Note `tools/test_combat.js` charges a turn for Shield and Hex, which are free in the game, so do not trust its caster numbers.

### 5.4 Everything else that has to change

| Where | Change |
|---|---|
| `port_valen.txt` | `bell_hook` and the four beat labels, the gate, the world-memory lines, the after-rumor branch and pre-seed rumor branch, the ladders overhear line. |
| `combat.txt` | `fight_wreckers` and the overrides above. |
| `startup.txt` | Variables (5.1). |
| `choicescript_stats.txt` | Quest lines next to the other quests, below. |
| `quest-data.js` | One entry: `{ id: "muffled_bell", title: "The Muffled Bell", place: "The Pier", active: function (s) { return s.bell_quest_stage === "active"; } }`. |
| `lorebook-port-valen.js` | Add one gated sentence to the existing `pier` entry: after `bell_quest_stage` is `resolved` or `failed`, a line about the night the bell was silenced. No new people entries, because nobody is named. `wreck_law` is already there and now unlocks again (`codex_wreck_law` is set in Beat 4 and in the wrecked rumors). |
| `quest/QUESTS.md` | Replace the "Quest 4 was removed" note with this quest's summary, and update the Pier row in the POI table, the Mermaid node and the variables index. |
| `tools/lint_thin_places.js` | Optional: add a `bell_hook` entry (kind `poi`, min 75 words) with the gate flags set. |

**Stats sheet:**

```choicescript
*if (bell_quest_stage = "active")
  *line_break
  • [b]Active Quest:[/b] The Muffled Bell (The Pier)
*if (bell_quest_stage = "resolved")
  *line_break
  • [b]Resolved Contract:[/b] The Muffled Bell
  *if (bell_resolution = "reported")
    — [i]The Wreckers' Pouch Left for the Watch[/i]
  *if (bell_resolution = "pocketed")
    — [i]The Wreckers' Pouch Kept[/i]
  *if (bell_resolution = "bloodied")
    — [i]Bell Rung, Wreckers Driven Off by the Watch[/i]
*if (bell_quest_stage = "failed")
  *line_break
  • [b]Closed Matter:[/b] The Ketch on the Reef [i](@{bell_walked_away you turned back|the bell rang too late})[/i]
```

### 5.5 Time costs

Entry 15 min (existing), then 15 min each for Beats 2, 3 and 4, about an hour in total. The turn-back path costs 15 for the walk. The loss path costs the Beat 2 quarter hour. Each beat's `advance_time` sits at the top of its label, behind a `*page_break`, with the standard `recalc_hp_from_neglect` and death check afterward.

### 5.6 Replay safety

* **Rewards:** wrap both in the resolved guard (`*if (not(bell_resolved)) *set bell_resolved true ...`), then `port_watch_rep +1` or `currency_add_amount 50` (5 silver) behind the existing currency-transaction lock.
* **`*rand`:** the hook roll follows the Dredge-End ambush pattern.
* **Stage transitions:** `active` is set once, on the choice to go out. `resolved` and `failed` are terminal.
* **Combat:** damage goes through the shared engine, which handles its own locks.

---

## 6. Design-Rule Check

| Rule | How this plan meets it |
|---|---|
| QUEST_DESIGN §1, organic discovery | The player hears the story first and knows the bell. The hook is an emergency the player can decline. Nobody is named. |
| §2, branch-and-bottleneck | Four beats on one spine. Beats 2 and 3 offer archetype approaches that converge. |
| §2, rule of three and archetype parity | STR, DEX and INT in Beat 2, with two cantrips and Guidance. CHA, STR and WIS in Beat 3. |
| §2, fail-forward | The Beat 2 roll is the climax and ends the quest on failure, with no rescue menu. The Beat 3 failures each cost something different and never return the pouch. |
| §2, genuine loss state | `wrecked`, with prose, a stats line and a rumor. |
| §3, proportional reward | 5 silver or +1 Watch standing, matching the Fish Slip. No gear. |
| §5, state hygiene | One-time reward guards, currency lock, no bare increments before a pause. |
| §6, hub integration and sync | Lives in a concrete place. `QUESTS.md`, `quest-data.js` and the lorebook are updated. |
| §7, choices | Both binary gates are marked `lint-ok two-options`. The pouch options each cost something. |
| §11, mechanics in brackets only | DCs and cantrip tags only in `[...]`. |
| §12, time and weather | One `advance_time` per page. The trigger reads flags, not names. No weather modifier on rolls, and the plan says so. |
| §13, combat | Fight only after a failed roll, with a different cost per approach. It is lethal because the non-lethal finisher text is guard-specific. |
| Narrative §1, §7, §9 | Strict POV, no names, no role labels, posture-based intimidation, weapon-agnostic. |
| Narrative §3 and §10 | Timeless world-memory lines. Sky sentences are sky only. |

---

## 7. Test Plan

1. **Build:** `node compile.js`, then `node quicktest.js` passes with every new line reached.
2. **Directed playthroughs with forced dice:**
   * Gate: each of the six conditions blocking it on its own, and the chance roll at 0 and 100.
   * Beat 1: go out, and turn back (`wrecked`, `bell_walked_away`).
   * Beat 2: every option succeeds and fails. The ranged-weapon advantage. Both cantrips. Guidance loop-back. A failure lands in the wreck aftermath and the Quayside hub.
   * Beat 3: every option succeeds (the bribe and Beat 4) and fails (the fight with the right flags).
   * Fight: `victory`, `rescued`, `fled`, `player_died` each land where the plan says, and the wound persists.
   * Beat 4: leave (`+1` standing, no coin) and take (+5 silver, no standing). Reload the page on each and confirm no double reward.
3. **World memory:** the pier arrival lines and the Keel after-rumor read correctly on Day 4 and Day 100 for each outcome.
4. **Linters:** `node tools/lint_all.js web/mygame/scenes/port_valen.txt` (prose tics, anachronisms, weapon assumption, mechanics leak, blank landing, thin prose, dash frequency, vocab overuse). Expect `lint_choices` to note the two intentional two-option gates. Also `node tools/lint_thin_places.js only=Pier`.
5. **Stats sheet, sidebar and lorebook:** the quest shows while active, the dossier line reads correctly per outcome, the `pier` and `wreck_law` entries unlock and read correctly.
6. **Regression:** the pier menu and other pier paths are unchanged when the gate does not fire.

---

## 8. Decisions to Confirm

Defaults are in brackets. Change any and the plan follows.

1. **Hook chance** [20% per eligible visit, one variable in `startup.txt`].
2. **Pouch size** [5 silver, matching the Fish Slip's top payout].
3. **Cantrip options auto-succeed** [yes, per precedent] or roll like the others.
4. **A third arcane option** for Tieflings: Thaumaturgy (a booming voice across the water to warn the ketch) [not included].
5. **The wreckers die on victory** [settled, see Section 0 item 11]. There is no further consequence for the player.
6. **Loss returns to the Quayside hub**, not the pier menu [yes].
7. **Quest number** [fills the freed Quest 4 slot].
8. **`codex_wreck_law` unlock** [set in Beat 4 and in the wrecked rumors].
