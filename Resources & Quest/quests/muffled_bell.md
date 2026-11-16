*Moved word for word from `QUESTS.md` on 2026-11-16 (lines 224 to 250 of the old file). The index row is in `../QUESTS.md`.*

### Quest 4: The Muffled Bell (The Pier)
* **Scene File:** `port_valen.txt` (the gate in `pv_poi_pier`, `bell_hook`, `bell_turn_back`, `bell_b2` and `bell_b2_*`, `bell_b3` and `bell_b3_*`, `bell_fight`, `bell_won`, `bell_rescued`, `bell_fled`, `bell_b4`) and `combat.txt` (`fight_wreckers`). Design and full prose: `quest/MUFFLED_BELL_PLAN.md`.
* **District:** Harbor Quayside, the Pier. Also touches The Cleaved Keel (rumors) and the pier's lower ladders (an overheard line).
* **Trigger:** nobody offers it. The player has to have heard the old wreck story (a Keel rumor, or two skiff hands on the lower ladders by day or at dusk: `bell_heard_story`) and visited the pier once (`pv_pier_seen`). Then, arriving at Night or Pre-Dawn in weather a ship cannot see through but not a storm (Fog, Rain, Snow or Sleet: `weather_visibility` not clear and `weather_severity` under 3), there is a `bell_hook_chance` (20%) chance per visit that `pv_poi_pier` hands off to `bell_hook`. That label replaces the normal arrival, because the normal arrival has the bell tolling on nearly every branch.
* **Briefing:** the bell is silent. The striker thuds dull against the bronze, the frame post is slick with lard, a hooded figure with a rag-muffled lantern goes down the ladder into a rowboat, and two mast lanterns are lined up with the reef. Nobody is named. The player chooses: go out to the post, or turn back (which ends the quest as a loss, `bell_walked_away`).
* **Objective Flow:**
  1. **The bell (`bell_b2`, 15 min, the climax roll):** `[STR DC 12]` climb and tear the wool off, `[DEX DC 12]` throw stones at the bronze (advantage with a ranged weapon, none required), `[INT DC 12]` follow the cord and slip the hitch, `[Cantrip: Mage Hand]` and `[Cantrip: Minor Illusion]` (both succeed without a roll), and `[Cantrip: Guidance]` (+1d4, loops back). No weather modifier. Success: the ketch turns. Any failure: the ketch breaks on the reef.
  2. **The steps (`bell_b3`, 15 min):** the lantern man and the broad man come up the ladder. `[CHA DC 12]` tell them the whole harbor heard the bell, `[STR DC 12]` hold the head of the steps, or `[WIS DC 12]` give the broad man a way out. There is no fight button. Success: the Watch's light shows, and the broad man throws a pouch to buy silence and takes the boat. A failed roll starts the fight with a cost per approach: CHA gives the wreckers advantage, STR gives the player disadvantage, WIS gives both.
  3. **The fight (`fight_wreckers`):** an `axeman` (10 HP, AC 11, slashing, 30% Bleeding) and a `slinger` (6 HP, AC 10, sling, 25% Blinded) from the shared enemy library. Lethal, at the same weight as the Dredge-End ambush. HP floors at 1 (`rescued`, narrated as the Watch arriving just in time), or the player can disengage (`fled`). The combat text is the library's, place-free; the pier, the ladder and the sea live in the scene's own prose.
  4. **The pouch (`bell_b4`, 15 min):** two watchmen arrive and take over. The older one says "wreck-goods", which unlocks `codex_wreck_law`. The pouch lies on the step. Leave it, or pick it up.
* **The Watch, the bribe and the bell:** the gang paid for the post by the landing stairs to be empty. A bribe buys not being noticed, and it cannot cover a bell the whole harbor hears, which is why the Watch turns up on every success route. The player never arrests, hauls or hands anything over, and there is no Voss, Vane or faction tie-in.
* **Resolutions:**

| Route | How | Outcome & State |
|---|---|---|
| **Reported** | Leave the pouch on the step | `bell_quest_stage = "resolved"`, `bell_resolution = "reported"`. No coin. |
| **Pocketed** | Pick up the pouch | `"resolved"`, `"pocketed"`. +5 silver (50 copper), no standing. |
| **Bloodied** | The fight ends `rescued` or `fled` | `"resolved"`, `"bloodied"`. The ketch is saved and the player is hurt (HP 1 if rescued). No pouch, no coin, no standing. |
| **Wrecked** | Turn back, or fail the bell roll | `bell_quest_stage = "failed"`, `"wrecked"`. The ketch breaks on the reef and nothing is paid. `bell_walked_away` marks the turn-back version. |

* **Fail-forward:** the Beat 2 roll is the climax and its failure ends the quest, with no rescue menu. The Beat 3 failures each cost something different and never return the pouch, and a beaten player gets nothing.
* **World memory:** timeless lines at the foot of the pier arrival (a grease-stiff cord still on the cleat after any success, a hooded lantern by the stairs after the reported route, more names than the post has room for after a failure). The Keel replaces its pre-seed rumor with one outcome-specific rumor (five variants), and the wrecked ones unlock `codex_wreck_law`. The lorebook `pier` entry gets one gated sentence.
* **Items:** none.
* **Variables:** `bell_quest_stage`, `bell_resolution`, `bell_resolved`, `bell_heard_story`, `bell_walked_away`, `bell_hook_chance`, `pv_tavern_rumor_bell`, `pv_tavern_rumor_bell_after`.
