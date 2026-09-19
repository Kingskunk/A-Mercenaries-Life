# Quest Plan: What the Bar Keeps (The Pier)

A grounded night-time rescue quest for **the Pier** in Port Valen's Harbor Quayside. It is the counterpart to *The Rotten Rib*: that quest is a daytime paper chase through a shipyard, this one is a tide-clocked rescue on the reef at the end of the breakwater, and its moral pressure comes from three people who each want something different from the survivors (the Port Watch, the Black Tally, and the player).

**Status:** design and prose draft for review. Nothing here is in the game yet.

**Already verified.** Every code block in this file was spliced into a scratch copy of the game (not your real files, since deleted) and checked: `quicktest` passes with every new line reached, and directed playthroughs confirmed the hook gating, decline, all three resolutions, the strategic-failure fallback, the payouts (lawful 6 or 2 silver, pragmatic 12 or 4 silver, spooked nothing), the reputation changes, and the belt equip. The fixed Dusk branch is also reached now.

---

## 0. Review Notes (read this first)

1. **Pre-existing bug this plan fixes.** In `pv_poi_pier` the `*elseif (time_period = "Dusk")` line is nested *inside* the Night/Pre-Dawn branch, so the Dusk prose can never run (this is the `port_valen.txt` line `quicktest` reports as UNTESTED). Section 1.2 restructures the arrival block and fixes it.
2. **Naming.** The ally is a *skipper* (a boat captain), not a pilot; the gang is always named in full (**Black Tally**) on first mention and "the Tally" after that; generic counting uses "count", "chalk strokes", "ledger" and never "tally". This follows the earlier vocabulary sweeps.
3. **Names introduced in-story only.** The watcher stays "the man at the jetty head" until he gives his name; the skipper stays "the woman at the sweep" until she does; the boy stays "the boy" until she says his name. The dockmaster's name is gated on `pv_quays_seen`.
4. **Declining is permanent, on purpose.** A rescue with a clock can't wait for the player to come back. If the player walks away, the survivors are lost off-screen (`bar_quest_stage = "declined"`) and the pier and Keel remember it. Every branch before that point (asking questions) is safe and free.
5. **Decisions are locked** (Section 7): names as written, declining permanent, `marl_favor` reserved for future sea travel, the knotted bell line stays, and the strategic route costs one point of Black Tally standing.

---

## 1. Overview, Cast & Trigger Architecture

### 1.1 Setting & Cast

* **District:** Harbor Quayside, the Pier (`pv_poi_pier`), with a short scene at the customs tower window and one in a net-drying loft above the fish-market smokehouses.
* **Primary locations:** the stone breakwater and jetty-head crane, the outer reef ridge, the wreck of a river-mouth skiff, and the causeway end where the bell hangs.
* **Themes:** who counts the drowned, debts that outlive the debtor, doing a hard thing in the dark when nobody assigned it to you, and the bell that nobody rings for the living.
* **Operating hours:** the hook only appears at `Night` or `Pre-Dawn`, and never in `Storm` or `Blizzard` (the reef can't be crossed). The rest of the pier stays open at any hour, as it is today.
* **Cast:**
  * **The watcher (Tobin):** thin, in a cloak stiff with old salt and a knit cap pulled to his eyebrows, chalk ground into the creases of his fingers. He keeps the Black Tally's count of boats going over the bar after curfew by chalking strokes on the crane's base post. Frightened, evasive, not cruel.
  * **The skipper (Marl Coyne):** in her fifties, sun-cracked, hands like rope, a voice used to carrying over wind. She runs night cargo for the Black Tally to pay off a boat loan, and she knows the bar better than anyone alive. Short sentences. Swears easily. Does not ask for help.
  * **The boy (Pip):** eleven, her sister's son, cannot swim, wrapped in a tarp in the bow.
  * **The dockmaster (Voss):** already established at the quays. He is a customs official, not a Watch officer, so his consequences route through "the Watch" (same rule as the Silt-Gate quest). He is awake at night; the existing quays prose already has his lamp in the tower window.
  * **Black Tally collectors:** two men with no badge and a bare knife each. They appear only in the pragmatic route.
* **Boat and cargo:** the *Gannet*, a twenty-foot river-mouth skiff, and six oilcloth-wrapped casks of untaxed spirit. Value to the Black Tally: about twelve silver marks landed. Value under harbor law: a finder's share of six.

### 1.2 The Pier Sub-Hub (`pv_poi_pier` and `pv_poi_pier_menu`)

Same shape as the Iron Wharves: `pv_poi_pier` pays the 15-minute entry cost once and prints the arrival vignette, then routes to `pv_poi_pier_menu`. Every exit inside the pier returns to the menu, so the entry cost is never re-paid.

**Edits to the existing `pv_poi_pier` block**

1. **Fix the Dusk nesting.** Move the `*elseif (time_period = "Dusk")` block out one indent level so it is a sibling of the `*if ((time_period = "Night") or (time_period = "Pre-Dawn"))` line, not a child of its storm `*else`. Once it can run, it also needs a storm case, since the existing sentence describes skiffs tied off in the lee of the jetty. Replacement below.
2. **Quest-aware night line.** In the non-storm Night/Pre-Dawn branch, replace the single line about "a pair of cloaked figures slip into deep shadow" with the block below. Keep the `day_of_week` lines that follow it unchanged.
3. **Replace the last two lines.** Delete `*page_break Back toward the docks…` / `*goto port_valen_harbor_pois` at the end of `pv_poi_pier` and write `*goto pv_poi_pier_menu` there instead.
4. **Aftermath line.** Add the aftermath block (below) after the weather/time prose and before the `*goto`.

```choicescript
*comment (replaces the existing Dusk block, now at the same indent as the Night/Pre-Dawn *if)
*elseif (time_period = "Dusk")
  *if ((weather = "Storm") or (weather = "Blizzard"))
    The last watermen are hauling their skiffs up the ladders ahead of the surf, and nobody lingers by the frame post.
  *else
    As daylight drains from the bay, coastal watermen tie off skiffs in the sheltered lee of the jetty. They pause by the gallows-post to lay a salt-crusted hand against the wood before turning toward the warmth of the quayside taverns.
```

```choicescript
*comment (replaces the "pair of cloaked figures slip into deep shadow" line)
*if (bar_quest_stage = "unstarted")
  Under the jetty-head crane, two cloaked figures start to slip back into the shadows as you come out along the stones, but only one of them makes it. The other stays on the open breakwater, pacing the last stretch past the crane with a stub of chalk in his fist and his lips moving in time with the bell.
*else
  In the darkness beneath the jetty-head crane, a pair of cloaked figures slip into deep shadow as you approach, tracking unlit skiffs threading the barrier shoals after curfew.
```

```choicescript
*comment (aftermath block, added after the weather/time prose, before *goto pv_poi_pier_menu)
*if (bar_resolution = "lawful")
  A Watch lantern hangs from the crane arm now, and the chalk strokes on the crane's base post have been scrubbed to a grey smear.
*elseif (bar_resolution = "pragmatic")
  The chalk strokes on the crane's base post run on in tidy rows, and the man who keeps them pulls his cap lower when you pass.
*elseif (bar_resolution = "strategic")
  A short length of knotted line hangs from the bell's striker now, tied by someone who knew how. Watermen who touch the frame post give the line one tug on their way past, and the bell answers with a single small stroke ahead of the surge's slow toll.
*elseif (bar_quest_stage = "declined")
  One row of chalk strokes on the crane's base post has a line scratched through it, and nobody has rubbed it out.
```

**Menu ambient line (repeatable, so it branches on both axes).**

```choicescript
*label pv_poi_pier_menu
*if ((time_period = "Night") or (time_period = "Pre-Dawn"))
  The bell keeps its slow count out past the last of the stone, and the water has drawn back far enough that you can hear it working at the reef.
*elseif (time_period = "Dusk")
  Skiff hands are tying off along the lower ladders, and the bell is the loudest thing left on the breakwater.
*else
  Gulls circle the gallows-frame, and the bell sounds thin against the daytime noise of the harbor.
*if (weather = "Rain")
  Rain runs off the bell's rim in threads.
*elseif (weather = "Fog")
  Fog has taken everything past the crane, and only the bell tells you the breakwater goes on.
*elseif ((weather = "Snow") or (weather = "Sleet"))
  Ice is forming in the cracks between the paving stones.
*elseif ((weather = "Storm") or (weather = "Blizzard"))
  Spray comes over the parapet in sheets, and nobody with a choice is out here.

*choice
  *if ((((time_period = "Night") or (time_period = "Pre-Dawn")) and (bar_quest_stage = "unstarted")) and (not((weather = "Storm") or (weather = "Blizzard"))))
    # Walk out along the breakwater toward the man pacing at the jetty head.
      *goto bar_tobin_approach
  *if (marl_favor and (not((weather = "Storm") or (weather = "Blizzard"))))
    *if ((time_period = "Dusk") or ((time_period = "Night") or (time_period = "Pre-Dawn")))
      # Go down the lower stone ladders to Marl's skiff.
        *goto pv_poi_marl_skiff
  # Stand under the gallows-frame and watch the bar.
    *goto pv_poi_pier_observe
  *if (not((weather = "Storm") or (weather = "Blizzard")))
    # Go down the lower stone ladders and watch the skiffs come and go.
      *goto pv_poi_pier_ladders
  # Head back along the causeway to the quayside.
    *page_break Back toward the docks…
    *goto port_valen_harbor_pois
```

**Persistent downtime beats (always at least three real options).**

```choicescript
*label pv_poi_pier_observe
You stand under the gallows-frame with your hand on the weathered post. Names are scratched into the wood at every height a person could reach, initials and short marks cut with knives and nails, the older ones worn nearly flat by hands. There is no list and no keeper. Whoever loses someone to the bar adds a mark, and whoever passes touches one.
*if ((time_period = "Night") or (time_period = "Pre-Dawn"))
  Out past the last stone, the reef ridge shows as a long black line in the pale foam, and the bell counts the surge against it in slow, even strokes.
*else
  Out past the last stone, the reef ridge shows as a dark line under the green water, and the bell counts the surge against it in slow, even strokes.
*page_break Back to the breakwater…
*goto pv_poi_pier_menu

*label pv_poi_pier_ladders
You go down the lower stone ladders to the landing steps, where the granite is slick with weed and the smell of tar and fish scales comes up off the boards. Skiffs knock against the pilings on short lines. A boy is bailing one with a wooden scoop, an old woman is mending a net in a boat-bottom with her feet braced against the ribs, and none of them look up as you pass.
*if ((time_period = "Night") or (time_period = "Pre-Dawn"))
  Most of the boats are dark and empty, and the few that aren't have their lamps hooded down to a slit.
*page_break Back up to the breakwater…
*goto pv_poi_pier_menu
```

### 1.3 Ambient Rumor Pre-Seed & Lifecycle

* **Location:** *The Cleaved Keel* (`pv_poi_tavern_rumors` in `port_valen.txt`).
* **Pre-seed (only while `bar_quest_stage = "unstarted"`):** two skiff hands argue about a ridge showing on the bar that wasn't in last year's soundings, and a third says the boats going over after curfew wouldn't wait for a marker anyway.
* **Lifecycle:** suppressed once the player commits to the reef or declines; replaced by one outcome-specific rumor.

```choicescript
*comment Tavern rumor integration in port_valen.txt (pv_poi_tavern_rumors)
*comment Add these as *elseif branches AFTER the Rotten Rib branches and BEFORE pv_tavern_rumor_1.
*elseif ((bar_quest_stage = "unstarted") and (not(pv_tavern_rumor_bar)))
  *set pv_tavern_rumor_bar true
  Two skiff hands argue over a stubby pencil at the end of a bench. A black ridge has been showing on the bar at low water, one of them says, and it wasn't in last year's soundings. Somebody will lose a keel on it before the guild sends a boat to mark it. The other jerks a thumb at the door. "The ones that go over after curfew won't wait for a marker," he says, "and they won't go around."
  *page_break The talk moves on…
  *goto pv_poi_tavern_menu
*elseif (((bar_quest_stage = "resolved") or (bar_quest_stage = "declined")) and (not(pv_tavern_rumor_bar_after)))
  *set pv_tavern_rumor_bar_after true
  *if (bar_resolution = "lawful")
    A caulker with tar to the elbows shakes his head into his cup. "The Watch dragged a skiff in off the bar, casks and all. The dockmaster paid a finder's share to whoever fished them out, and the skiff-master's boat is sitting in the impound yard."
  *elseif (bar_resolution = "pragmatic")
    A drayman leans back on his stool. "Collectors were on the bridges before the tide turned. That skiff-master and her boy went straight back under the Tally's thumb, and nobody's said who pulled them off the bar."
  *elseif (bar_resolution = "strategic")
    Two porters lower their voices without being asked to. "The bar took a Dredge-End skiff and everyone aboard, they say, and the Tally struck the debt off its books. Never seen a collector so quick to close a ledger."
  *else
    *comment bar_quest_stage = "declined"
    An old net-mender turns her mug in her hands. "The bell was going hard two nights running and nobody would say who it was for. A skiff never came back in, and the fish market found an oar with a boat's name burned into the blade."
  *page_break The talk moves on…
  *goto pv_poi_tavern_menu
```

---

## 2. Complete Narrative Prose Drafts

### Beat 1: The Man Who Wouldn't Leave (the approach)

*Reached from `pv_poi_pier_menu`. No time cost (a walk along the breakwater).*

```choicescript
*label bar_tobin_approach
You leave the shelter of the frame post and walk out along the last stretch of the breakwater, where the stones are wet and the wind has room to work. The man is thin, in a cloak stiff with old salt and a knit cap pulled down to his eyebrows. Chalk is ground into the creases of his fingers. Behind him, the base post of the crane is covered in rows of short chalk strokes, all in one hand, and the last row stops with a stroke half drawn.

He quits pacing when you are ten feet away and plants himself between you and the post.

"Nothing out here for you," he says, and his voice has no give in it. "Go on. Back to your bench."

*label bar_tobin_hub
*choice
  *if (not(bar_asked_count))
    # "You're counting something. What?"
      "Boats," he says, too fast. "After curfew, some boats go out and they come back, and somebody keeps count of that. It's a dull job." He rubs the chalk stub into his palm until it crumbles. "The count's off by one. That's all it is. Go home."
      *set bar_asked_count true
      *goto bar_tobin_hub
  *if (not(bar_asked_who))
    # "Who do you count for?"
      He looks toward the lit window of the customs tower, then back at you, and lowers his voice. "Tobin. That's what they call me at the bridges." He swallows. "You'll know the Black Tally, or you will soon enough. I'm not supposed to be seen talking to a stranger, so talk quick or don't."
      *set bar_asked_who true
      *set bar_met_tobin true
      *set codex_black_tally true
      *goto bar_tobin_hub
  *if (bar_asked_count and (not(bar_asked_out)))
    # "One short. Which boat didn't come back?"
      Tobin's jaw works. When he answers, it comes out in one breath, like something he's been holding in his mouth all night.
      
      "The [i]Gannet[/i]. River-mouth skiff, twenty feet, no lamp. Marl Coyne on the sweep and her sister's boy in the bow. Eleven years old, can't swim a stroke. Six casks under an oilcloth." He looks past you at the bell. "She'd have been back before the water bottomed out. It's bottomed out. If she struck, she struck on the ridge, and she's out there now."
      *set bar_asked_out true
      *set bar_knows_boy true
      *goto bar_tobin_hub
  *if (bar_asked_out)
    # "I'll go out and look for her."
      *goto bar_go_out
  # Tell him it's not your problem and turn back along the breakwater.
    *goto bar_decline
```

```choicescript
*label bar_decline
*set bar_quest_stage "declined"
Tobin's shoulders drop half an inch. He turns back to the post, licks his thumb, and rubs a stroke out of the last row, then draws it in again in exactly the same place.

You walk back along the breakwater with the bell counting behind you.
*page_break Back to the pier…
*goto pv_poi_pier_menu
```

### Beat 2: Going Out

*The commit. Tobin can't leave his post, so he gives directions and two things: a shuttered lantern and thirty feet of line off the crane hook.*

```choicescript
*label bar_go_out
*set bar_quest_stage "active"
*set bar_rattled false
*set bar_ahead false
*set bar_line_rigged false
*set bar_cargo_lost false
*set bar_cargo_saved false

Tobin stares at you for a long moment. Then he pulls a shuttered horn lantern out from behind the crane post and a coil of line off the crane hook, and pushes both into your arms.

"I can't go," he says. "If I'm not on this post when the collector comes over the bridge at first light, there's no count and there's no me. Keep to the seaward side of the ridge, where the stone is flat. Don't go near the gully, the water comes back through there first. When the bell starts ringing quick, the flood's turned, and you've got about as long as it takes to say a prayer." He clears his throat. "I don't know you. I don't know your name. I'd like to keep it that way."

You take the lantern and the line and step off the end of the breakwater onto the reef.

*page_break Out onto the reef…
*goto bar_r1
```

### Beat 3: Crossing the Ridge (first check)

*Time: 20 minutes. Weather-aware: rain, snow and sleet make the footing hazardous for the physical option; fog makes the swell hard to read. Storm and blizzard never reach this beat (the hook is gated).*

Success sets flags that pay off later in the run instead of dealing damage:

| Option | Check | On success | On failure |
|---|---|---|---|
| Pick your way along the wet ridge | `[DEX DC 12]` | `bar_ahead` (advantage at the wreck) | `bar_rattled` (disadvantage at the wreck) |
| Match your steps to the bell and the water | `[WIS DC 12]` | `bar_ahead` | `bar_rattled` |
| Rig the crane line across the gully | `[INT DC 12]` | `bar_line_rigged` (advantage hauling back) | `bar_rattled` |
| `[Cantrip: Mage Hand]` carry the line across | none | `bar_line_rigged` | (cannot fail) |
| `[Cantrip: Guidance]` | none | `guidance_active` | (loops back) |

```choicescript
*label bar_r1
*set hours_to_pass 0
*set minutes_to_pass 20
*set time_advance_call_id "bar_r1_time"
*gosub_scene calendar advance_time
*gosub_scene calendar recalc_hp_from_neglect

*if (hp_current <= 0)
  *set death_cause "starvation"
  *if (neglect_damage_fatigue > neglect_damage_hunger)
    *set death_cause "exhaustion"
  *goto_scene death death_screen

The stone under the breakwater gives way to bare reef, black and ridged like the back of something asleep. Water sucks and hisses in every crack. The shuttered lantern throws a single slit of light on the rock in front of your boots, and beyond it there is only the sound of the bell, which seems louder out here and slower, one deep stroke and a long wait and another.

Ahead the ridge runs on toward a dark line of foam, and between you and it a gully cuts across the way, a black slot with the sea heaving in and out of it.

*label bar_r1_hub
*temp hint_bar_dex ""
*temp hint_bar_wis ""
*temp hint_bar_int ""
*if (show_stat_hints)
  *if (guidance_active)
    *set hint_bar_dex " [DEX DC 12 (+1d4 Guidance)]"
    *set hint_bar_wis " [WIS DC 12 (+1d4 Guidance)]"
    *set hint_bar_int " [INT DC 12 (+1d4 Guidance)]"
  *else
    *set hint_bar_dex " [DEX DC 12]"
    *set hint_bar_wis " [WIS DC 12]"
    *set hint_bar_int " [INT DC 12]"

*temp bar_hazard_physical false
*temp bar_hazard_visual false
*if (((weather = "Rain") or (weather = "Snow")) or (weather = "Sleet"))
  *set bar_hazard_physical true
*if (weather = "Fog")
  *set bar_hazard_visual true

*choice
  *if ((((((((((wizard_cantrip = "guidance") or (wizard_cantrip_2 = "guidance")) or (wizard_cantrip_3 = "guidance")) or (bard_cantrip = "guidance")) or (bard_cantrip_2 = "guidance")) or (warlock_cantrip = "guidance")) or (warlock_cantrip_2 = "guidance")) or (race_cantrip = "guidance")) or (race_cantrip_2 = "guidance")) and (not(guidance_active)))
    # [Cantrip: Guidance] Murmur a quiet blessing to steady your feet and your nerve.
      *set guidance_active true
      You breathe out a short divination verse. The dread in your stomach settles into something you can walk on.
      *goto bar_r1_hub
  # Pick your way along the wet ridge, testing each foothold before you put your weight on it.${hint_bar_dex}
    *set check_stat "dex"
    *set check_dc 12
    *set check_skill "Thread the Reef"
    *if (bar_hazard_physical)
      *set disadvantage true
    *gosub_scene startup roll_d20_check
    *if (check_success)
      You go slowly and never let both boots leave the rock at once. Where the weed is slick you go around, and where the ridge narrows to a hand's width you lean into it and keep moving. The gully comes up under you, and you cross it on a shelf of dry stone the sea has forgotten.
      *set bar_ahead true
    *else
      A shelf of weed slides out from under your heel and you go down on one knee with a jolt that rings up your spine. You catch yourself before the gully, but the lantern is knocked crooked and the cold has soaked your leggings to the thigh. You cross on all fours, losing time you didn't have.
      *set bar_rattled true
    *goto bar_r1_done
  # Match your steps to the bell and the water, crossing the gully in the gap between one surge and the next.${hint_bar_wis}
    *set check_stat "wis"
    *set check_dc 12
    *set check_skill "Read the Swell"
    *if (bar_hazard_visual)
      *set disadvantage true
    *gosub_scene startup roll_d20_check
    *if (check_success)
      The bell strikes, the sea heaves into the gully, then drains back with a long sucking rush, and there is a beat before the next stroke when the slot lies empty. You take it in four running steps and land on the far side as the water comes booming back through behind you.
      *set bar_ahead true
    *else
      You count the bell and the swell, but the two never quite agree, and you go a half-beat early. The gully is still full. You hang on the far edge with your fingers wedged in a crack while the water tears at your legs, then haul yourself out, coughing.
      *set bar_rattled true
    *goto bar_r1_done
  # Rig the crane line across the gully, hitch one end to a rock spur, and cross hand over hand.${hint_bar_int}
    *set check_stat "int"
    *set check_dc 12
    *set check_skill "Rig a Crossing Line"
    *gosub_scene startup roll_d20_check
    *if (check_success)
      You loop the line twice around a spur of black rock, test it with your full weight, and pay it out across. It is the wrong way to cross a gully quickly, but the right way to leave a line behind you. The far anchor is a crack in the reef the width of your fist, and it holds. Whoever comes back this way will have something to hold.
      *set bar_line_rigged true
    *else
      The first hitch slips under the strain, and you spend two long minutes on your knees in the dark re-tying it while the swell climbs the reef around you. By the time it holds, you are soaked and shaking and there is no time left to walk the ridge gently.
      *set bar_rattled true
    *goto bar_r1_done
  *if ((((((((((wizard_cantrip = "mage_hand") or (wizard_cantrip_2 = "mage_hand")) or (wizard_cantrip_3 = "mage_hand")) or (bard_cantrip = "mage_hand")) or (bard_cantrip_2 = "mage_hand")) or (warlock_cantrip = "mage_hand")) or (warlock_cantrip_2 = "mage_hand")) or (race_cantrip = "mage_hand")) or (race_cantrip_2 = "mage_hand")))
    # [Cantrip: Mage Hand] Send the line across the gully on a pale, weightless hand and pin it to the far rock.
      A faint hand of pale force lifts the loose end of the line and carries it out over the black slot, dipping once when the surge comes up to meet it. It settles on the far side and closes around a spur of rock, holding as tight as a real fist. You test the line, and it takes your weight easily, the whole way across.
      *set bar_line_rigged true
      *goto bar_r1_done

*label bar_r1_done
*page_break The bell picks up its pace…
*goto bar_r2
```

### Beat 4: The Wreck (second check)

*Time: 20 minutes. The bell is now the clock: the strokes bunch together as the flood begins to turn. `bar_rattled` gives disadvantage on every option here; `bar_ahead` gives advantage. Both true cancel, as `roll_d20_check` already handles.*

*Failure loses the cargo (`bar_cargo_lost`), never a survivor.*

| Option | Check | Success | Failure |
|---|---|---|---|
| Lever the fallen mast with the crane line and a length of broken oar | `[STR DC 13]` | Marl is free | Marl is free, casks lost |
| Slide her leg out along the boards while the hull shifts | `[DEX DC 12]` | Marl is free | Marl is free, casks lost |
| Read how the mast is wedged and pull the one pin | `[INT DC 12]` | Marl is free | Marl is free, casks lost |
| Talk her calm, then follow her orders | `[CHA DC 12]` | Marl is free | Marl is free, casks lost |

```choicescript
*label bar_r2
*set hours_to_pass 0
*set minutes_to_pass 20
*set time_advance_call_id "bar_r2_time"
*gosub_scene calendar advance_time
*gosub_scene calendar recalc_hp_from_neglect

*if (hp_current <= 0)
  *set death_cause "starvation"
  *if (neglect_damage_fatigue > neglect_damage_hunger)
    *set death_cause "exhaustion"
  *goto_scene death death_screen

The bell has begun to hurry. The strokes come closer together now, and the water in the cracks is no longer draining. It is standing still, then creeping back.

The wreck lies on its side where the ridge falls away, wedged into a crack in the reef with its stern up and its snapped mast lying across the bottom boards. A woman is pinned under the mast at the waist, her hands white on the wood and her mouth a hard, angry line. In the bow, a boy has wrapped himself in a tarp up to his eyes. Six oilcloth bundles are lashed to the thwarts beside them, rolling against their ropes with each surge.

"About time somebody came," the woman says, through her teeth. Her voice is sun-cracked and used to carrying over wind. "You're not one of his. Tobin wouldn't come. He never comes. Get this off me, or get the boy out. One or the other, and don't stand there."

*label bar_r2_hub
*temp hint_bar_str ""
*temp hint_bar_dex2 ""
*temp hint_bar_int2 ""
*temp hint_bar_cha ""
*if (show_stat_hints)
  *if (guidance_active)
    *set hint_bar_str " [STR DC 13 (+1d4 Guidance)]"
    *set hint_bar_dex2 " [DEX DC 12 (+1d4 Guidance)]"
    *set hint_bar_int2 " [INT DC 12 (+1d4 Guidance)]"
    *set hint_bar_cha " [CHA DC 12 (+1d4 Guidance)]"
  *else
    *set hint_bar_str " [STR DC 13]"
    *set hint_bar_dex2 " [DEX DC 12]"
    *set hint_bar_int2 " [INT DC 12]"
    *set hint_bar_cha " [CHA DC 12]"

*choice
  # Wedge a length of broken oar under the mast, brace the crane line around a rock, and lever it off her with your whole weight.${hint_bar_str}
    *set check_stat "str"
    *set check_dc 13
    *set check_skill "Lever the Mast"
    *if (bar_rattled)
      *set disadvantage true
    *if (bar_ahead)
      *set advantage true
    *gosub_scene startup roll_d20_check
    *if (check_success)
      The oar bends, groans, and holds. The mast rolls half a foot, then a foot, and she drags herself clear on her elbows with a hiss of pain. The casks stay lashed. You set your shoulder against the rock and don't let go until she is out from under.
    *else
      The oar splits with a crack like a snapped bone. The mast rolls the wrong way, taking half the lashings with it, and three casks tear loose and go bobbing away into the dark. You catch her arm as the mast rolls back, and by the time you've hauled her free, the sea has taken everything else that wasn't tied down.
      *set bar_cargo_lost true
    *goto bar_r2_done
  # Get down in the swamped hull beside her and slide her leg out along the boards a finger at a time, timing each pull to the rocking.${hint_bar_dex2}
    *set check_stat "dex"
    *set check_dc 12
    *set check_skill "Ease Her Free"
    *if (bar_rattled)
      *set disadvantage true
    *if (bar_ahead)
      *set advantage true
    *gosub_scene startup roll_d20_check
    *if (check_success)
      You go down on your belly in the ankle-deep water and talk yourself through it, a finger of leg at a time, the pain making her swear in three different ways. When the mast rolls with the surge, you pull, and when it settles, you stop. The last pull comes with the hull's lean, and she slides out like a cork from a bottle.
    *else
      Your hands slip on the wet boards at the wrong moment. The hull heaves and the mast comes down on her leg with all its weight. She screams, once, and you are somehow able to drag her out anyway, but the casks tear loose from the thwarts when the hull lurches and the sea takes them.
      *set bar_cargo_lost true
    *goto bar_r2_done
  # Look at how the mast is wedged before touching anything, and find the one pin that's carrying the load.${hint_bar_int2}
    *set check_stat "int"
    *set check_dc 12
    *set check_skill "Read the Wreck"
    *if (bar_rattled)
      *set disadvantage true
    *if (bar_ahead)
      *set advantage true
    *gosub_scene startup roll_d20_check
    *if (check_success)
      The mast isn't pinned by its weight. It's pinned by a single snapped thwart driven into the crack in the reef, and everything else is resting on that. You find the splintered end with your fingers, work it out of the crack, and the whole mast shifts and rolls off her with barely a shove.
    *else
      You are sure the pin is the stern post. It isn't. By the time you've worked it out, the swell has shifted the mast twice, and when you finally pull the right piece the whole hull lurches, the casks tear free, and the sea takes them.
      *set bar_cargo_lost true
    *goto bar_r2_done
  # Get your face close to hers and tell her to breathe, then do exactly what she says, in the order she says it.${hint_bar_cha}
    *set check_stat "cha"
    *set check_dc 12
    *set check_skill "Steady the Skipper"
    *if (bar_rattled)
      *set disadvantage true
    *if (bar_ahead)
      *set advantage true
    *gosub_scene startup roll_d20_check
    *if (check_success)
      "Breathe," you say, and keep saying it until she does. Then her hands stop fighting the mast and start telling you where to put yours. "Oar there. Rock there. Now." She has done this in worse water. In ninety seconds, she is out from under and swearing at you with real warmth.
    *else
      She doesn't want to be talked to. She wants to be out, and each time you ask her to wait she strains against the mast until the hull groans. By the time she lets you touch it, the water has climbed the boards, and the casks are beginning to lift on their ropes. You get her free, but the sea takes the cargo.
      *set bar_cargo_lost true
    *goto bar_r2_done

*label bar_r2_done
*set bar_rattled false
*set bar_ahead false
*page_break The strokes bunch together…
*goto bar_r3
```

### Beat 5: Back Before the Flood (third choice)

*Time: 25 minutes. If the casks were lost in Beat 4 this is a short, linear passage with no choice (a closed door, not a decision), otherwise it is a real three-way decision.*

| Option | Check | On success | On failure |
|---|---|---|---|
| Survivors only, straight back | none | Everyone lives; casks left to the sea | (none) |
| Survivors and casks, hauled on the line | `[STR DC 13]` (advantage if `bar_line_rigged`) | `bar_cargo_saved` | Casks lost, survivors safe |
| Float the casks on the crane line for later | `[INT DC 12]` (advantage if `bar_line_rigged`) | `bar_cargo_saved` (Tobin can retrieve them at slack water) | Casks lost, survivors safe |

```choicescript
*label bar_r3
*set hours_to_pass 0
*set minutes_to_pass 25
*set time_advance_call_id "bar_r3_time"
*gosub_scene calendar advance_time
*gosub_scene calendar recalc_hp_from_neglect

*if (hp_current <= 0)
  *set death_cause "starvation"
  *if (neglect_damage_fatigue > neglect_damage_hunger)
    *set death_cause "exhaustion"
  *goto_scene death death_screen

The bell isn't tolling any more. It is clanging, quick and ragged, and the sea has begun to come across the reef in long, shallow sheets, each one a little deeper than the last. The woman gets to her feet with a hand on your shoulder, her leg shaking under her, and she picks the boy out of the bow like a sack of grain.

"Name's Marl," she says. "That's Pip. Don't drop him."

*if (bar_cargo_lost)
  There is nothing left of the cargo but a torn strip of oilcloth snagged on a rock. Marl looks at it for exactly as long as it takes to breathe in and out, then turns her back on it and starts across the ridge.

  The way back is a hard, cold, silent scramble along the seaward stones with the boy on Marl's hip and the water at your shins, and you keep the lantern low and your eyes on the next foothold until the black shape of the breakwater rises out of the dark.
  *set bar_cargo_saved false
  *goto bar_landing
*else
  Behind her, the six casks still ride their lashings, dark and heavy in the boat's swamped belly. She glances back at them and then at the water.

  "That's my boat's whole year," she says quietly. "Your call."

*label bar_r3_hub
*temp hint_bar_haul ""
*temp hint_bar_float ""
*if (show_stat_hints)
  *if (guidance_active)
    *set hint_bar_haul " [STR DC 13 (+1d4 Guidance)]"
    *set hint_bar_float " [INT DC 12 (+1d4 Guidance)]"
  *else
    *set hint_bar_haul " [STR DC 13]"
    *set hint_bar_float " [INT DC 12]"

*choice
  # Leave the casks. Take the boy and the skipper and go, before the flood decides for you.
    You put your shoulder under Marl's arm and start across. She doesn't look back at the boat. The way back is a hard, cold, silent scramble along the seaward stones with the water at your shins, until the black shape of the breakwater comes up out of the dark.
    *goto bar_landing
  # Lash the casks to the crane line and haul them behind you across the ridge.${hint_bar_haul}
    *set check_stat "str"
    *set check_dc 13
    *set check_skill "Haul the Cargo"
    *if (bar_line_rigged)
      *set advantage true
    *gosub_scene startup roll_d20_check
    *if (check_success)
      You throw a bight of line round the casks, take it over your shoulder, and lean. The bundles drag, then float, then drag again over the stone, and the rigged line keeps them off the worst of the rocks. It is the hardest half-hour of work you have ever done, and when you reach the breakwater they are all still behind you.
      *set bar_cargo_saved true
    *else
      Halfway across the ridge the line snags on a spur of rock, and every cask on it swings sideways into the gully. You throw your whole weight on the line, but the surge takes them out of your hands. Marl grabs your belt and drags you on, cursing quietly, and you leave the cargo to the sea.
    *goto bar_landing
  # Lash the casks together into a single float, cut the line off at the wreck, and let the flood carry them toward the breakwater for later.${hint_bar_float}
    *set check_stat "int"
    *set check_dc 12
    *set check_skill "Float the Cargo"
    *if (bar_line_rigged)
      *set advantage true
    *gosub_scene startup roll_d20_check
    *if (check_success)
      You bind the casks side by side into a raft of oilcloth and rope, tie the crane line on as a tether, and anchor the other end to the fixed rock. The flood lifts them, swings them toward the breakwater, and holds. When the tide is slack again, anyone who knows where to find the line can haul them in.
      *set bar_cargo_saved true
    *else
      The knots are wrong, or the rock is, or both. The raft comes apart on the first swell and the casks scatter across the dark water. Marl watches them go with a face like a shut door, then takes the boy and starts across.
    *goto bar_landing
```

### Beat 6: The Landing (three resolutions)

*Reached after Beat 5. Every survivor lives; the choice is what the player does with them. The route options are values, not checks, so they are presented plainly. The strategic route has its own sub-hub with three ways in (a persuade check, a plan check, and a coin bribe) and a fail-forward fallback into the pragmatic route.*

```choicescript
*label bar_landing
*set bar_rattled false
*set bar_ahead false
*page_break Back on the breakwater…
*label bar_landing_arrive
Tobin is waiting at the head of the breakwater with his cap in his fist. When he sees the boy, his face does something that he tries and fails to stop. Marl sets Pip down against the crane post, sits down beside him with her bad leg out in front of her, and lets out a long breath that goes on for a while.

Behind you, the reef has disappeared. The flood has covered it, and the bell has stopped its hurry and gone back to its slow, indifferent count. On the shore side of the breakwater, one lamp burns steadily in the customs tower window.

*if (bar_cargo_saved)
  Tobin looks at the casks, if there are any to look at, and then away.
*else
  Tobin looks at the empty water where the casks should be, and his shoulders drop.

"Well," Marl says. She is looking at you, not at him. "Somebody is going to decide what happens to us. It might as well be the one who came out."

*label bar_landing_hub
*choice
  # Hoist the signal lamp toward the customs tower and wait for the dockmaster and the Watch.
    *goto bar_route_lawful
  # Let Tobin whistle up the collectors from the bridge and hand the skipper and her boy back to the Black Tally.
    *goto bar_route_pragmatic
  # Get them off the breakwater before anyone comes, and make the count come out right for everyone but the sea.
    *goto bar_route_strategic
```

#### Branch A: The Lawful Route (declare it, hand them to the Watch)

*Time: 20 minutes. Effects, once only: `port_watch_rep +1`, `black_tally_rep -1`, finder's share (6 silver if the casks were saved, 2 if not), Tobin's post is exposed, Marl fined and her boat impounded.*

```choicescript
*label bar_route_lawful
*set hours_to_pass 0
*set minutes_to_pass 20
*set time_advance_call_id "bar_lawful_time"
*gosub_scene calendar advance_time
*gosub_scene calendar recalc_hp_from_neglect

*if (hp_current <= 0)
  *set death_cause "starvation"
  *if (neglect_damage_fatigue > neglect_damage_hunger)
    *set death_cause "exhaustion"
  *goto_scene death death_screen

You turn the shuttered lantern to face the shore, slide the shutter open and closed three times, and wait. Tobin sees what you are doing and goes grey. "You'll hang the both of us," he says, very quietly, and Marl puts a hand on his sleeve without looking at him. "It's done, Tobin. Go."

He goes. He is off the breakwater and into the dark of the fish market before the answering lamp shows in the tower window.

A Watch boat comes out first, a low, broad launch with four sweeps and a sentry in the bow. Behind it, a tall man in a stiff oilskin coat picks his way along the breakwater with a lantern of his own. @{pv_quays_seen Dockmaster Voss|The dockmaster} looks at Marl, at the boy, at the wet oilcloth on the stones, and last at you.

*if (bar_cargo_saved)
  "Untaxed spirit, off a river-mouth skiff wrecked on the outer bar, no marker, no papers," he says, going through the casks with a finger. "That's wreck-goods under harbor law. The crown takes the cargo. The finder takes a share." He looks at Marl. "The skiff-master takes a fine, and her boat sits in the impound yard until it's paid."
*else
  "A river-mouth skiff wrecked on the outer bar, two rescued, cargo lost to the sea," he says, writing it into a pocket ledger by lantern light. "There's no wreck-goods to declare, but I'll record the rescue." He looks at Marl. "The skiff-master will explain herself to the Watch."

Marl lifts Pip onto one of the sentries' backs, takes a sweep from the launch, and looks at you once as she goes down the ladder, a long, level, unsurprised look. She spits neatly into the water, and it isn't at you.

*if (not(bar_resolved))
  *set bar_resolved true
  *set bar_quest_stage "resolved"
  *set bar_resolution "lawful"
  *set bar_resolved_day campaign_day
  *set port_watch_rep +1
  *set black_tally_rep -1

*if (not(currency_txn_locked)) or (not(locked_currency_txn_page_id = choice_page_id))
  *if (bar_cargo_saved)
    *set currency_add_amount 60
  *else
    *set currency_add_amount 20
  *gosub_scene startup currency_add
  *set currency_txn_locked true
  *set locked_currency_txn_page_id choice_page_id

[b][⚖ Harbor Standing: Port Watch Rep +1][/b]
*line_break
[b][🗡 Black Tally Standing: Black Tally Rep -1][/b]
*line_break
*if (bar_cargo_saved)
  [b][💰 Finder's Share: +6 Silver Marks][/b]
*else
  [b][💰 Rescue Fee: +2 Silver Marks][/b]

*page_break Back to the pier…
*goto pv_poi_pier_menu
```

#### Branch B: The Pragmatic Route (return them to the Black Tally)

*Time: 20 minutes. Effects, once only: `black_tally_rep +1`, payout 12 silver if the casks were saved and 4 if not. In the "spooked" fallback from a failed Branch C persuasion, the player gets **nothing**: no coin and no standing (a failed roll must not pay). Marl and Pip go back under the Tally's thumb; Tobin's count comes out right.*

```choicescript
*label bar_route_pragmatic
*set hours_to_pass 0
*set minutes_to_pass 20
*set time_advance_call_id "bar_pragmatic_time"
*gosub_scene calendar advance_time
*gosub_scene calendar recalc_hp_from_neglect

*if (hp_current <= 0)
  *set death_cause "starvation"
  *if (neglect_damage_fatigue > neglect_damage_hunger)
    *set death_cause "exhaustion"
  *goto_scene death death_screen

*if (not(bar_tobin_spooked))
  Tobin blows two short notes through his teeth, no louder than a night bird, and waits. Marl watches him do it, and her eyes stay on yours.

Two men come out along the breakwater from the fish-market end, walking without hurry. Neither has a badge. Each has a bare knife on his belt, worn where anyone can see it, and neither of them looks at you until they have looked at the boy, at the woman on the ground, and at the wet oilcloth behind her.

*if (bar_cargo_saved)
  The taller one turns a cask over with his boot. "Six," he says. He counts them again out loud to be sure. "Good. That's the count."
*else
  The taller one looks at the empty water and then at Tobin. "No cargo," he says, and Tobin flinches. "The skipper and the boy, though. That counts for something."

They take Marl by the arms, not roughly, the way you take someone you intend to keep. She stands and goes with them, her eyes on you the whole way. It isn't hatred and it isn't gratitude. It is a debt being written down.

*comment A spooked handover (bar_tobin_spooked, from a failed strategic persuasion)
*comment pays nothing and earns no standing: the collectors never asked for this.
*if (not(bar_resolved))
  *set bar_resolved true
  *set bar_quest_stage "resolved"
  *set bar_resolution "pragmatic"
  *set bar_resolved_day campaign_day
  *if (not(bar_tobin_spooked))
    *set black_tally_rep +1

*if (not(bar_tobin_spooked))
  *if (not(currency_txn_locked)) or (not(locked_currency_txn_page_id = choice_page_id))
    *if (bar_cargo_saved)
      *set currency_add_amount 120
    *else
      *set currency_add_amount 40
    *gosub_scene startup currency_add
    *set currency_txn_locked true
    *set locked_currency_txn_page_id choice_page_id

*if (bar_tobin_spooked)
  Nobody offers you anything. You were never on the collectors' books, and the taller man looks through you as if you were a post.
*else
  [b][💰 Collector's Cut: +@{bar_cargo_saved 12|4} Silver Marks][/b]
  *line_break
  [b][🗡 Black Tally Standing: Black Tally Rep +1][/b]

*page_break Back to the pier…
*goto pv_poi_pier_menu
```

#### Branch C: The Strategic Route (write them off)

*The player convinces Tobin to report the* Gannet *lost with all hands, so the Black Tally strikes Marl's debt as a drowned account. Marl and Pip vanish from every ledger. Payoff: no coin, a skipper who owes the player, and a route out of the harbor that doesn't pass the customs chain.*

*Cost: `black_tally_rep -1` (the Tally is quietly short a debtor and a cargo it will never account for), and Tobin is now the only person who knows, and he is frightened. If the persuasion fails, he panics and hands the survivors to the collectors by force, and the player gets nothing for it.*

```choicescript
*label bar_route_strategic
You look at Tobin, and then at the water where the bar has already gone under. Marl pulls the boy tighter against her side, and he has gone still, listening.

"Your count is one short," you tell Tobin. "So make it right. A skiff went over the bar after curfew, and the sea took her and everyone in her. No survivors, no cargo, no argument. It's true enough. The bar keeps its own count, and no one is going to check it."

Tobin's mouth opens and closes. He looks at the crane post, at the rows of chalk strokes, at the half-drawn one on the end. He looks at Marl.

*label bar_strategic_hub
*temp hint_bar_persuade ""
*temp hint_bar_plan ""
*if (show_stat_hints)
  *if (guidance_active)
    *set hint_bar_persuade " [CHA DC 12 (+1d4 Guidance)]"
    *set hint_bar_plan " [INT DC 12 (+1d4 Guidance)]"
  *else
    *set hint_bar_persuade " [CHA DC 12]"
    *set hint_bar_plan " [INT DC 12]"

*choice
  # Tell him it's the truth, that nobody at the bridges has ever come out to check the bar, and that he'd rather be the man who got it right.${hint_bar_persuade}
    *set check_stat "cha"
    *set check_dc 12
    *set check_skill "Talk Him Round"
    *gosub_scene startup roll_d20_check
    *if (check_success)
      *goto bar_strategic_success
    *else
      *goto bar_strategic_fail
  # Give him the plan whole: which of the crane's chalk rows to leave alone, what the collector will ask, and what he answers.${hint_bar_plan}
    *set check_stat "int"
    *set check_dc 12
    *set check_skill "Build the Story"
    *gosub_scene startup roll_d20_check
    *if (check_success)
      *goto bar_strategic_success
    *else
      *goto bar_strategic_fail
  *if ((((gold * 100) + (silver * 10)) + copper) >= 30)
    # Press three silver marks into his chalky palm and tell him it's for the trouble of the lie. [3 Silver Marks]
      *if (not(currency_txn_locked)) or (not(locked_currency_txn_page_id = choice_page_id))
        *set currency_add_amount 0 - 30
        *gosub_scene startup currency_add
        *set currency_txn_locked true
        *set locked_currency_txn_page_id choice_page_id
      Tobin looks at the silver as if it might bite him. Then he closes his fist over it, slowly, and puts it inside his shirt.
      *goto bar_strategic_success
```

```choicescript
*label bar_strategic_fail
*set bar_tobin_spooked true
Tobin backs a step away from you, and then another. "No," he says. "No, no. If I lie and they find out, it's me at the bridges with my hands in a vise. I can't." His voice cracks, and his hand goes to his teeth, and he blows two short notes.

Marl looks at you with an expression that doesn't need words.
*goto bar_route_pragmatic
```

```choicescript
*label bar_strategic_success
*set hours_to_pass 0
*set minutes_to_pass 25
*set time_advance_call_id "bar_strategic_time"
*gosub_scene calendar advance_time
*gosub_scene calendar recalc_hp_from_neglect

*if (hp_current <= 0)
  *set death_cause "starvation"
  *if (neglect_damage_fatigue > neglect_damage_hunger)
    *set death_cause "exhaustion"
  *goto_scene death death_screen

Tobin takes his chalk, walks to the post, and rubs out the half-drawn stroke. Then he draws a different one, a short heavy bar through the whole row. He puts the chalk in his pocket. His hand is steady enough that it surprises him.

"Lost on the bar," he says. "All hands. I never saw a soul." He doesn't look at you. "I won't say your name. I don't know it."

You get Marl up on her good leg and the boy across your shoulders and take them along the breakwater the long way, through the fish-market dark, to a net-drying loft above the smokehouses. The ladder is down and the floor is empty. The smokers are banked low underneath, and the planking is warm through your boots. You lay the boy on a stack of dry nets and pull a square of tarred sailcloth over him.

Marl lowers herself onto an upturned fish-crate with a grunt and a hand on her leg. Pip is asleep before she has finished settling him. She looks at you over his head for a long, level time, and then she says the only thing she has said to you that isn't an order.

"I don't owe the Black Tally a thing," she says. "For the first time in nine years, I don't owe [i]anyone[/i] a thing, except you." She almost smiles. "That's a better place to owe from. You'll find me on the lower ladders when it's dark. Ask for the [i]Gannet[/i], if you don't mind the name of a wreck."

*if (not(bar_resolved))
  *set bar_resolved true
  *set bar_quest_stage "resolved"
  *set bar_resolution "strategic"
  *set bar_resolved_day campaign_day
  *set marl_favor true
  *set black_tally_rep -1
  *set has_marl_rope_belt true
  *gosub_scene equipment equip_waist "marl_rope_belt"

[b][⚓ Ally: Marl Coyne, Skipper (Owes You a Favor)][/b]
*line_break
[b][🗡 Black Tally Standing: Black Tally Rep -1][/b]
*line_break
[b][🧵 Acquired: Marl's Tarred Rope Belt][/b]

Before you leave, Marl pulls the belt from her waist, a thick length of tarred rope with a wooden toggle worn smooth as bone, and holds it out.

"Reef rope," she says. "Take it. It's held me on that bar for twenty years, and it can hold a stranger."

*page_break Back to the pier…
*goto pv_poi_pier_menu
```

---

## 3. Post-Resolution: Marl's Skiff (`pv_poi_marl_skiff`)

Only reachable with `marl_favor` (strategic route), and only at Dusk, Night or Pre-Dawn: Marl is drowned on paper and keeps to the dark. `marl_favor` is created and set now and is **reserved for future sea travel**: nothing reads it yet except this menu, and the "passenger past the harbor chain" line is the promise that later content will cash in. No mechanical perk ships with this quest. The weather-aware line is the living-hub requirement. None of it goes stale, because it depends on `weather`, not on the quest's date.

```choicescript
*label pv_poi_marl_skiff
Down on the lowest ladder, a skiff rides on a short line under a scrap of tarpaulin, its name painted over and repainted in fresh white: something that isn't the [i]Gannet[/i]. Marl sits in the stern with a sweep across her knees, and when you come down the ladder, she lifts one hand without turning her head.
*if (weather = "Fog")
  "Fog's good," she says. "Nobody sees a skiff. Nobody hears one, either, if you know how to feather a sweep."
*elseif (weather = "Rain")
  "Rain covers a lot of sin," she says. "Bar doesn't care. Bar's the same in rain."
*elseif ((weather = "Snow") or (weather = "Sleet"))
  "Ice on the ridge tonight," she says. "Don't ever cross it on ice. I'm saying that for free."
*else
  "Good bar tonight," she says. "Water's honest."

*label pv_poi_marl_skiff_menu
*choice
  # Ask how the bar is behaving tonight.
    Marl tips her head toward the reef, where the bell is counting the surge against it. "Listen. Slow bell, slack water, safe to walk. Quick bell, flood's turning, run. No bell at all..." She shrugs. "...somebody's stopped the surge, and you don't want to know how. The old ones say the bar's honest if you listen to it. It just doesn't care whether you do."
    *goto pv_poi_marl_skiff_menu
  # Ask about the boy.
    "Pip? He's learning the sweep," she says, and something in her face gives a little. "Won't get in the boat without me watching, and won't stay out of it when I'm not. Takes after his mother." She glances at the tarp in the bow. "He asks about you."
    *goto pv_poi_marl_skiff_menu
  # Ask whether she'd take a passenger out past the harbor chain, one who doesn't want a customs stamp.
    Marl looks at you a while, and then she laughs quietly, once. "I've run cargo over that bar for nine years and I've never once carried a stamp," she says. "The day you need a boat that doesn't ask, you come and tell me where. I don't ask why." She taps the sweep on the gunwale. "You'll owe me nothing. That's how it works, isn't it?"
    *goto pv_poi_marl_skiff_menu
  # Say goodnight and climb back up to the breakwater.
    *goto pv_poi_pier_menu
```

---

## 4. Technical Specification & Variable Manifest

### 4.1 Required variables in `startup.txt`

Use `*comment` lines for annotations (a trailing `;` is not valid ChoiceScript).

```choicescript
*comment --- WHAT THE BAR KEEPS (the Pier, see quest/WRECK_BELL_PLAN.md) ---
*comment bar_quest_stage: "unstarted", "active", "resolved", "declined"
*create bar_quest_stage "unstarted"
*comment bar_resolution: "none", "lawful", "pragmatic", "strategic"
*create bar_resolution "none"
*create bar_resolved false
*create bar_resolved_day 0
*create bar_met_tobin false
*create bar_asked_count false
*create bar_asked_who false
*create bar_asked_out false
*create bar_knows_boy false
*create bar_rattled false
*create bar_ahead false
*create bar_line_rigged false
*create bar_cargo_lost false
*create bar_cargo_saved false
*create bar_tobin_spooked false
*comment marl_favor: set by the strategic route. Reserved for future sea travel; read only by pv_poi_marl_skiff for now.
*create marl_favor false
*create has_marl_rope_belt false
*create pv_tavern_rumor_bar false
*create pv_tavern_rumor_bar_after false
```

### 4.2 Equipment integration in `equipment.txt`

Add one branch to `apply_waist_loadout`. It is cosmetic, matching the Brant's-boots precedent; no AC.

```choicescript
*if (equipped_waist_id = "marl_rope_belt")
  *set waist_desc "Marl's Tarred Rope Belt"
  *set waist_prose "tarred rope belt"
```

### 4.3 Stats sheet integration in `choicescript_stats.txt`

```choicescript
*comment Under CURRENT STATUS, next to the Rotten Rib lines:
*if (bar_quest_stage = "active")
  *line_break
  • [b]Active Quest:[/b] What the Bar Keeps (The Pier)
*if (bar_quest_stage = "resolved")
  *line_break
  • [b]Resolved Contract:[/b] What the Bar Keeps
  *if (bar_resolution = "lawful")
    — [i]Survivors Handed to the Watch[/i]
  *if (bar_resolution = "pragmatic")
    — [i]Returned to the Black Tally[/i]
  *if (bar_resolution = "strategic")
    — [i]Written Off the Ledger[/i]
*if (bar_quest_stage = "declined")
  *line_break
  • [b]Closed Matter:[/b] The Skiff on the Bar [i](left to the sea)[/i]

*comment Inventory:
*if (has_marl_rope_belt)
  *set has_inventory_item true
  *line_break
  • [b]Marl's Tarred Rope Belt:[/b] Thick tarred rope with a wooden toggle worn smooth, taken off a skipper who has crossed the bar for twenty years@{(equipped_waist_id = "marl_rope_belt")  [Worn]| [Stowed]}
```

### 4.4 Codex

`codex_black_tally` is set when Tobin names the gang (`bar_asked_who`). No new codex entry is needed; the existing Black Tally entry already covers it.

### 4.5 Reference documentation in `quest/QUESTS.md`

Add under *Chapter 3: Port Valen*, after Quest 3 (The Rotten Rib): a **Quest 4: What the Bar Keeps** section with the objective flow, the three-resolution table, the variables, and a row in the *Harbor POIs* table for the Pier. Mention the Dusk fix.

### 4.6 Time costs

| Step | Cost |
|---|---|
| Pier entry (existing) | 15 min |
| Approach, conversation, decline | free |
| Beat 3 (crossing the ridge) | 20 min |
| Beat 4 (the wreck) | 20 min |
| Beat 5 (back before the flood) | 25 min |
| Branch A (lawful) or B (pragmatic) | 20 min |
| Branch C (strategic) | 25 min |

Each `advance_time` call is on its own page (each sits directly after a `*page_break` or a real `*choice` resolution) so the replay lock never sees two calls on one page.

### 4.7 Replay safety

* Every currency change uses `currency_add_amount` with the `currency_txn_locked` pair.
* Every rep and state change is inside `*if (not(bar_resolved))`.
* The rep changes, flag sets and equipment call for a resolution sit in one guard.
* `bar_rattled`, `bar_ahead`, `bar_line_rigged`, `bar_cargo_lost` and `bar_cargo_saved` are reset at the start of `bar_go_out`, and `bar_rattled` and `bar_ahead` are reset again at `bar_r2_done` and `bar_landing`. All resets are literal assignments, safe to repeat.

---

## 5. Design-Rule Check

| Rule | How this quest meets it |
|---|---|
| Organic discovery | No one hands the player a quest. The player notices a pacing man and chooses to approach; every clue is earned by asking. |
| No badge recognition | Tobin reacts to a stranger who asks; nobody reacts to gear, faction or class. |
| Subjective POV / names | Tobin, Marl and Pip are named only after they say their names or Tobin says them. The dockmaster's name is gated on `pv_quays_seen`. |
| Three options at decision hubs | The conversation hub always has at least three options until the final commit; the landing hub has three; the reef beats have four. |
| Archetype parity | STR, DEX, INT, WIS, CHA all have an option; `[Cantrip: Mage Hand]` and `[Cantrip: Guidance]` are represented. |
| Fail-forward | A failed check never ends the quest. Failure sets `bar_rattled` (a disadvantage on the next beat) or loses the cargo, never a survivor. |
| Three universal resolutions | Lawful (Watch), Pragmatic (Black Tally), Strategic (a debt owed and a hidden ally, at a one-point cost to Black Tally standing). |
| Proportional rewards | 6 silver (lawful), up to 12 silver (pragmatic), or a permanent ally with no coin (strategic), against wages of 2 to 4 silver a day. |
| Timelessness | Post-resolution prose depends on `bar_resolution`, never on "last night" or "yesterday". |
| Time tiers | 15-minute entry, 20 to 25 minutes per beat, conversation free. |
| Weather and time reactivity | The hook is gated to Night/Pre-Dawn and non-storm; footing hazards (rain, snow, sleet) and visibility hazards (fog) are wired into the two relevant checks. |
| Mechanics stay in brackets | DCs, silver amounts and rep changes appear only in hints and banner lines. |
| No weapon assumption | Nothing depends on the player carrying any particular weapon; the threat beats are posture, not a hand on a weapon. |
| No modern jargon | No "pilot", "tally" (outside the gang name) or specialist boat words. |

---

## 6. Test Plan

1. `node quicktest.js` after the edits, and check that the Dusk line in `pv_poi_pier` is no longer reported UNTESTED.
2. Directed traces (as done for The Rotten Rib), forcing rolls high and low:
   * Hook appears only at Night/Pre-Dawn, only when unstarted, never in Storm/Blizzard.
   * Decline → `declined`, and the hook does not reappear.
   * Each of the four Beat 3 options, both outcomes, and the Mage Hand and Guidance options.
   * Each Beat 4 option's failure loses the cargo and skips the Beat 5 choice.
   * Beat 5 all three options, both outcomes.
   * Lawful, pragmatic (with and without cargo), strategic via each of the three routes, and the strategic-failure fallback (`bar_tobin_spooked`: no coin, no rep).
   * Payouts in copper: lawful 60/20, pragmatic 120/40, spooked none, bribe -30.
   * Strategic success sets `marl_favor`, equips the belt, and drops `black_tally_rep` by 1 exactly once (replay-safe inside the `bar_resolved` guard).
3. Closing behavior: the pier is never closed, but the hook option must vanish in Storm/Blizzard and at Morning/Midday/Afternoon.
4. `refresh_fuzz_test.js` on the new labels, since Beats 3 to 5 chain check results into later beats via flags.
5. Linters on the new block only: `lint_choices`, `lint_prose_tics`, `lint_anachronisms`, `lint_mechanics_leak`, `lint_blank_landing`, `lint_vocab_overuse`.
6. Recompile `play_game.html` at the end, since the compiled build is what players see.

---

## 7. Decisions (locked)

1. **Names:** Tobin, Marl Coyne, Pip and the *Gannet*, as written.
2. **Declining is permanent.** The survivors are lost off-screen and the pier and Keel remember it.
3. **Marl's favor:** `marl_favor` is created and set on the strategic route and reserved for future sea travel. No mechanical perk now; the belt is cosmetic.
4. **The bell:** the strategic route adds the knotted line on the striker as a permanent small world change.
5. **Black Tally standing:** lawful -1, pragmatic +1, strategic -1. Standing swings are meant to be recoverable through radiant faction quests planned for later, so a one-point setback here is acceptable.
