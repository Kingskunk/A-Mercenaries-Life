*Moved word for word from `QUESTS.md` on 2026-11-16 (lines 251 to 276 of the old file). The index row is in `../QUESTS.md`.*

### Quest 5: The Quiet Block (The Fishmongers' Slip)
* **Scene File:** `port_valen.txt` (`pv_poi_fish_slip`, `pv_poi_fish_slip_menu`, `pv_poi_fish_stalls`, `pv_poi_fish_gossip`, `fish_watch`, `fish_block_hub`, `fish_wenna_talk`, `fish_climax_hub`, `fish_route_*`, `fish_lawful_*`, `fish_pragmatic_*`, `fish_strategic_*`). Design and full prose: `quest/FISH_SLIP_PLAN.md`.
* **District:** Harbor Quayside, the Fishmongers' Slip. It replaces the removed Saint Althea shrine stop. Also touches The Cleaved Keel (rumors).
* **Hub shape:** `pv_poi_fish_slip` pays the 15-minute entry cost once, then lands on `pv_poi_fish_slip_menu`. The slip is closed at Dusk, Night, Storm and Blizzard (a short description and a route back, no filler choices). The auction option only appears at Pre-Dawn and Morning.
* **Market:** stalls (instant, coin-limited): fried smelt (3 copper, +1 Temp HP, +1 DEX for 4h), oysters (3 copper, +1 INT for 4h) and a plain pasty (2 copper, no buff). The Keel covers CON, STR, CHA and WIS, so the two together cover every stat. While `fish_slip_shunned` is true, every item costs one copper more. Gossip is free and keyed to the quest state.
* **Briefing:** nobody offers the quest. At the dawn auction the player watches a widow's bass go for half price with no bid, while three buyers signal with two fingers to a cap brim, a scratched ear and a glance at a boot. The player chooses to follow her. Wenna Rusk is named by herself and Thale by Wenna.
* **Objective Flow:**
  1. **The rail (`fish_watch`, 20 min):** the auction, with a state-aware aftermath scene once the quest is resolved or failed.
  2. **The block hub (`fish_block_hub`, free):** talk to the widow (sets `active`), study the buyers' hands once (`[INT DC 11]`: success sets `fish_saw_signals`, failure sets `fish_ring_wary`, and either way `fish_study_tried`), watch more lots, decide, or leave. `[Cantrip: Guidance]` loops back.
  3. **The last lot (`fish_climax_hub`):** three routes, each with one roll that is the climax. `fish_ring_wary` adds +1 DC to every route check and `fish_saw_signals` gives advantage on the INT and WIS options.
* **Resolutions (three ways to win, one to lose):**

| Route | How | Outcome & State |
|---|---|---|
| **Lawful** (`fish_route_lawful`) | The slip-warden's booth: `[INT DC 12]` lay out the pattern, or `[CHA DC 12]` be believed (DC 13 if wary) | `fish_resolution = "lawful"`. 3 silver informant's share, the ring struck off the block for the season. **Failure: `fish_slip_shunned`, quest `"failed"`.** |
| **Pragmatic** (`fish_route_pragmatic`) | Buy into the ring: `[CHA DC 12]` play a buyer's agent, or `[WIS DC 12]` answer the signals (advantage with `fish_saw_signals`) | `fish_resolution = "pragmatic"`. 5 silver from the common purse, no standing change, the widow stops speaking to you. **Failure: `fish_slip_shunned`, no coin, quest `"failed"`.** |
| **Strategic** (`fish_route_strategic`) | Needs 4 silver visible in your purse (`*selectable_if`). Bid against the ring: `[WIS DC 12]`, `[INT DC 12]` (advantage with signals) or `[Cantrip: Minor Illusion]` | `fish_resolution = "strategic"`. No coin changes hands (the stake becomes the widow's price and a cook-house runner buys the lot at what you paid), `wenna_favor`, the ring is broken. **Failure: the 4-silver stake is forfeited and the quest is `"failed"`.** |

* **Loss state:** `fish_quest_stage = "failed"`, `fish_resolution = "failed"`. The dossier shows "The Quiet Block (the ring held)", gossip and the Keel have their own failed lines, and lawful or pragmatic failure raises stall prices.
* **Wenna's favor (`wenna_favor`):** created and set on the strategic route and **reserved for future wholesale dealing at the slip**. Only the stall prose reads it for now.
* **World memory:** the auction scene changes with the outcome (new buyers bidding hard after the lawful route, the same quiet half circle after the pragmatic route or a failure, honest bidding after the strategic route).
* **Items:** none.
* **Variables:** `pv_slip_seen`, `fish_quest_stage`, `fish_resolution`, `fish_resolved`, `fish_resolved_day`, `fish_met_wenna`, `fish_study_tried`, `fish_saw_signals`, `fish_ring_wary`, `fish_slip_shunned`, `wenna_favor`, `pv_tavern_rumor_fish`, `pv_tavern_rumor_fish_after`.
