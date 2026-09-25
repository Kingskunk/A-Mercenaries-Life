# Quests & Contracts Reference — The Carrion Company

A developer reference for every major quest, side contract, municipal task, and investigation across *A Mercenary's Path*. Keep this updated whenever a new quest, objective stage, or resolution branch is added.

---

## Quest State Architecture & Standards

All quests use standardized ChoiceScript lifecycle variables declared in `startup.txt`:
1. **Stage Flag (`[quest_name]_quest_stage`):**
   - `"unstarted"` — Initial state before the briefing, notice, or trigger event.
   - `"active"` — Accepted / ongoing; unlocks investigation choices, district travel goals, and POI scenes.
   - `"resolved"` — Finished; locks out repeatable investigation branches and updates district ambient prose.
2. **Resolution Flag (`[quest_name]_resolution`):**
   - Stores the narrative path taken (e.g. `"watch_seized"`, `"hush_money"`, `"leverage"`, `"scales_extorted"`).
3. **Intel & Evidence Flags:**
   - Tracks discovered clues, stolen manifests, or extracted names (`[quest_name]_full_intel`, `found_customs_vellum`, etc.).
4. **Reward & Claim Flags:**
   - One-time payout protection (`[quest_name]_bounty_claimed`), reputation boosts (`port_watch_rep`, `gilded_scales_rep`, `black_oath_rep`, `vane_standing`), and unique items (`has_silt_gate_payout_slip`).

---

## Chapter Overview

```mermaid
graph TD
    subgraph Prologue & Training
        Q0["Camp Night: Chores & Dice"] --> Q1["The Dawn Trial: Muster & Specialization"]
    end

    subgraph Chapter 1: The Black Sinks
        Q2["Assault on the Sinks Gatehouse"]
        Q2 --> Q2A["Parapet Archer Suppression"]
        Q2 --> Q2B["Gatehouse Breach & Melee"]
        Q2 --> Q2C["Customs Toll Register Search"]
    end

    subgraph Chapter 2: Alderford
        Q3["Bailiff Rennick's Curing Extortion"]
        Q4["The Drowned Oar Taphouse Rumors"]
        Q5["Granary Cellar Rat Extermination"]
        Q6["Sluice Gate Mill-Works Repair"]
        Q7["Factor Morzan & The Provincial Charter"]
    end

    subgraph Chapter 3: Port Valen
        Q8["Quest 1: The Silt-Gate Contraband"]
        Q9["Harbor POI Rumors & Chart House Navigation"]
        Q11["Crane Three: Day-Labor"]
        Q15["Hask's Real Money: Scrap Yard Courier Round"]
        Q12["Quest 3: The Rotten Rib -- Iron Wharves"]
        Q13["Quest 4: The Muffled Bell -- The Pier"]
        Q14["Quest 5: The Quiet Block -- Fishmongers' Slip"]
        Q16["Quest 6: The Stolen Shroud -- The Alley Shrine"]
    end

    Q1 --> Q2
    Q2 --> Q3
    Q3 --> Q8
```

---

## Chapter 1: The Black Sinks (`battle_black_sinks.txt`)

### 1. Assault on the Sinks Gatehouse
* **Scene File:** `battle_black_sinks.txt`
* **Briefing / Origin:** Captain Vane & squad sergeants prior to the causeway charge.
* **Core Objectives:**
  1. Cross the flooded mud-causeway under missile fire.
  2. Suppress the parapet archers and defensive barricades.
  3. Breach the iron-studded oak gatehouse and break the defending line.
* **Investigation / Sub-Objectives:**
  * **Search the Sinks Toll-House (`bivouac_search`):** Search the water-damaged office to recover the *Grey Waterway Toll Register* vellum (`found_customs_vellum = true`).
  * **Repair with Magic:** Use `[Cantrip: Mending]` to restore the torn vellum and salt-soaked seals.
* **Key Variables:**
  * `found_customs_vellum` (boolean) — Held in pack for leverage in Chapter 2 (Alderford).
  * `customs_register_restored` (boolean) — Repaired via Mending or careful drying.

---

## Chapter 2: Alderford River Hub (`alderford.txt`)

### 1. The Fish-Curing Lofts Extortion
* **Scene File:** `alderford.txt` (`alderford_fish_curing`)
* **Briefing:** River workers cornered by Bailiff Rennick and two iron-cudgel thugs shaking down the drying lofts for illegal toll-tribute.
* **Resolution Paths:**
  1. **Provincial Charter Leverage:** Slam the *Grey Waterway Toll Register* onto the salting bench (`found_customs_vellum`), citing Section 12 to expose Rennick's debt as unsanctioned extortion (Automatic Success).
  2. **Thaumaturgy / Arcane Intimidation:** Booming command with violet flaring lantern light (`CHA DC 10` / Tiefling / Spellcaster).
  3. **Martial Feat of Strength:** Snap a 3-inch oak curing beam barehanded (`STR DC 10` / Fighter / Barbarian).
  4. **Sleight of Hand Disarm:** Slice Rennick's purse-strings and kick his lead guard's knee (`DEX DC 10` / Rogue).
  5. **Physical Combat:** Full squad brawl against Rennick's cudgel-men (`combat.txt`).
* **Rewards:** +10–18 Silver Marks, Alderford worker regard, unlocks Gilded Scales leverage.

### 2. The Granary Cellar Infestation
* **Scene File:** `alderford.txt` (`alderford_granary`)
* **Briefing:** Mill master offers silver to clear aggressive bog-rats nesting beneath grain chutes.
* **Resolution Paths:**
  1. Tactical extermination / rat combat (`combat.txt` — `fight_granary_rats`).
  2. Trapping and barrier construction (`INT DC 11` / `DEX DC 11`).
* **Rewards:** +12 Silver Marks, clean meal rations.

### 3. Factor Morzan & The Provincial Charter
* **Scene File:** `alderford.txt` (`alderford_counting_house`)
* **Briefing:** Deliver the recovered Black Sinks Toll Register to the Gilded Scales counting house.
* **Resolution Paths:**
  1. Turn in the vellum for full guild contract price (+40 Silver Marks, `+2 gilded_scales_rep`).
  2. Leverage the tax skims to secure merchant concessions for the Carrion Company supply train.
* **Variables:** `turned_in_customs_vellum = true`.

---

## Chapter 3: Port Valen Municipal Quests (`port_valen.txt`)

### Quest 1: The Silt-Gate Contraband
* **Scene File:** `port_valen_dredge_end.txt` (`pv_dredge_silt_gates`, `pv_silt_gate_stakeout`, `pv_silt_gate_ambush_watch`, `pv_silt_gate_parley_oath`, `pv_silt_gate_divert_vane`); briefed and reported at `port_valen.txt`'s `pv_quays_voss_briefing`/`pv_quays_voss_report` (Harbor Quayside).
* **District:** Dredge-End (Low drainage flume & tidal vault).
* **Briefing:** Dockmaster Voss reports uninspected highland shear-steel and illicit peat-spiritus entering through the tidal flap-valves during midnight flood tides. He's a customs official, not a Watch officer — he can catch corruption near his docks and escalate it hard, but every consequence he promises routes through "the Watch captain," never his own authority.

#### Objective Flow:
1. **Daytime Recon (`pv_dredge_silt_gates`):**
   * Map roofline blind spots and spot the lantern-boy (`silt_gate_lookout_spotted = true`).
   * Jam the street-level storm-winch counterweight cog (`silt_gate_winch_jammed = true`).
   * Study high-tide charcoal marks on the stone vault.
   * `[Cantrip: Mage Hand]` — Remotely wedge an iron bolt into the winch cog from the canal shadows.
2. **Night Stakeout Prep (`pv_silt_gate_stakeout`):**
   * Wait for night flood tide (`[~2 Hours]`).
   * `[Cantrip: Guidance]` — Divination focus buff (`+1d4` to next check).
   * `[Cantrip: Prestidigitation]` — Snuff the platform's fish-oil lamp from afar (`silt_gate_lamp_snuffed = true` ➔ Advantage on ambush).
   * `[Cantrip: Minor Illusion]` — Project false patrol footsteps down the north cut (`silt_gate_illusion_active = true` ➔ Advantage on ambush).
3. **Three Resolution Branches:**

| Branch | Mechanics & Spells | Outcome & State |
|---|---|---|
| **Branch A: Ambush for the Watch** (`pv_silt_gate_ambush_watch`) | • `[STR DC 12]` / `[DEX DC 12]` / `[INT DC 11]`<br>• `[Cantrip: Shocking Grasp]` (Advantage, `INT DC 11`)<br>• `[Cantrip: Ray of Frost]` (Freeze rudder, `INT DC 11`)<br>• `[Spell: Magic Missile]` (1 Slot, Auto-Success) | Success: neutralizes drop, muscles barrow to Quayside.<br>`silt_gate_resolution = "watch_seized"`<br>+12 Silver bounty from Voss (`+1 port_watch_rep`).<br>**Failure (`pv_silt_gate_ambush_fail`): the drop gets away.** No cargo, no bounty, +2 or +3 fatigue, `black_oath_rep -1`, and `silt_gate_resolution = "failed"`. |
| **Branch B: Parley & Bribe** (`pv_silt_gate_parley_oath`) | • `[CHA DC 12]` / `[WIS DC 11]` / `[INT DC 11]`<br>• `[Cantrip: Thaumaturgy]` (`CHA DC 10`, 30 Silver Marks)<br>• `[Spell: Charm Person]` (1 Slot, 25 Silver Marks)<br>• `[Spell: Disguise Self]` (1 Slot / Hexblood, 25 Silver Marks) | Success: shakes down independent contraband broker for a hush-money cut.<br>`silt_gate_resolution = "hush_money"`<br>+25–30 Silver Marks.<br>**Failure (`pv_silt_gate_parley_fail`): you are walked out with nothing.** No coin (the old 15-silver consolation is gone), `black_oath_rep -1`, `silt_gate_resolution = "failed"`. |
| **Branch C: Squeeze the Payroll** (`pv_silt_gate_divert_vane`) | • `[CHA DC 12]` / `[STR DC 12]` / `[WIS DC 11]`<br>• `[Cantrip: Thaumaturgy]` (`CHA DC 10`)<br>• `[Spell: Dissonant Whispers]` (1 Bard Slot, Auto-Intel) | Pins the broker for the names of the Watch sergeants he pays. The crates are left on the platform; the payout slip is the prize.<br>`silt_gate_resolution = "leverage"`<br>`has_silt_gate_payout_slip = true`<br>`silt_gate_full_intel = true / false` (a failed check costs the second name).<br>**Spend it once:** give it to Voss (`pv_silt_gate_slip_voss`: +8 silver with both names, +6 with one, `+1 port_watch_rep` only with both) **or** take it to Captain Vane (`port_valen_vane_slip_turnin`: `+1 vane_standing`, no coin, sets `vane_watch_leverage`). Or lie to Voss and keep it (`pv_silt_gate_slip_keep`). |

* **Why Branch C is about the names, not the steel:** Vane's briefing asks for leverage and standing ("the Carrion holds the leverage when you wash your fingers"), and never mentions steel or an armory, so the branch no longer invents that goal. The payout slip is the strings he can pull, and it can only be spent once, the same shape as Rotten Rib's waybill.
* **Loss state:** `silt_gate_resolution = "failed"` (from a failed ambush or parley). The dossier shows "The Drop Got Away", the flume revisit says the run is still going, and Voss's report (`pv_quays_voss_report`) closes the matter with no bounty. See `QUEST_DESIGN_RULES.md`, "Failure Must Cost Something".

---

### Quest 3: The Rotten Rib (The Iron Wharves)
* **Scene File:** `port_valen.txt` (`pv_poi_drydock`, `pv_poi_drydock_menu`, `beat_1_*` through `beat_4_*`, `pv_poi_brant_slipway`, `port_valen_vane_timber_turnin`)
* **District:** Harbor Quayside, reached through the Iron Wharves POI (`pv_poi_drydock`). Also touches The Cleaved Keel (rumors) and the Carrion Compound hub (Vane turn-in).
* **Hub shape:** `pv_poi_drydock` pays the 15-minute entry cost once, prints the arrival vignette, and either turns the player away or lands on `pv_poi_drydock_menu`. Every yard exit returns to the menu, never to the arrival label. The menu re-checks the closing hours itself, because quest beats spend time and can carry the player past the shift bell.
* **Operating hours:** open Morning/Midday/Afternoon only. Dusk, Night, Pre-Dawn, and Storm/Blizzard close the gate (no filler choices, straight back to the quayside).
* **Briefing:** no quest-giver singles the player out. An old shipwright on Slipway Two is seen testing his hull with a mallet. The player chooses to step onto the scaffold, and he only explains once asked. A pre-seed rumor at The Cleaved Keel hints at the fines and green timber (`rotten_rib_quest_stage = "unstarted"` only).
* **Names:** the shipwright stays "the old man" in narration until the apprentices name him (Master Brant) and he names himself. Elric and Hendryk reach the player through Brant's dialogue before either appears.
* **Objective Flow:**
  1. **Slipway Two (`beat_1_*`, `beat_2_*`):** observe, question the apprentices, or approach Brant. Accepting the lead sets `rotten_rib_quest_stage = "active"` and hands over the sap-weeping splinter (`has_rotten_rib_splinter`). Declining ("not my fight") closes that conversation without starting the quest.
  2. **Timber Sheds (`beat_3_*`, 15 min):** four routes to the hidden oak behind the boiler shed, all ending at `beat_3_find_stash`:
     * `[WIS DC 11]` follow the drag-scrapes.
     * `[INT DC 11]` read the ledger notes (one attempt per visit).
     * Sawyers: `[CHA DC 12]` / `[STR DC 12]` / `[Spell: Charm Person]` / 2 silver.
     * River-gate: `[DEX DC 11]` (advantage in Fog) or `[Cantrip: Minor Illusion]`.
     * A failed approach sets `elric_alerted` instead of dead-ending. The find sets `has_diverted_timber_waybill`.
  3. **The stash choice:** confront Elric now, report to Brant (advice on how each pressure point works), or slip away with the waybill and come back later.
  4. **Elric's office (`beat_4_*`):** alerted vs. unalerted prose and a different opening bribe (4 vs. 8 silver). Re-entering from the menu costs 10 min (`beat_4_climb`). Walking out before rolling resolves nothing but sets `elric_alerted`. **Failure at the climax costs something real and never converts into the route or reward it was chasing** (see `QUEST_DESIGN_RULES.md`, "Failure Must Cost Something"):
     * **Strikes.** A failed INT, STR or blackmail check gets the player thrown out by Elric's draymen (10 min). That is one strike: `elric_alerted` is set, the DC for the same checks rises from 12 to 13, and the purse stays at 4 silver. A **second strike** ends the quest as `"failed"` (the oak is carted off).
     * **Failed extortion** is not a strike. Elric snatches the waybill and burns it, and the quest ends as `"failed"` immediately. No consolation payout.
     * **Ledger clue.** Reading the chalk initials on the Bay Four pillar sets `rotten_rib_ledger_clue`, which gives advantage on the appeal to Hendryk.
* **Resolutions (three ways to win, one to lose):**

| Branch | How | Outcome & State |
|---|---|---|
| **A: Guild Truth** (`beat_4_branch_a`, `beat_4_hendryk_*`) | Leave the purse and go over Elric's head to Hendryk (30 min). At the factor's door: `[CHA DC 13]` (14 if alerted) hold your ground, or `[INT DC 12]` (13 if alerted) make the case from the waybill. Advantage with `rotten_rib_ledger_clue`. Turning back at the door is free but alerts Elric. | Success: `rotten_rib_resolution = "lawful"`. +4 silver, `gilded_scales_rep +1`, `brant_favor`, Brant's Iron-Heel Boots. Elric arrested, the slipway gets a 3-day grace. **Failure: the waybill and splinter are taken, `gilded_scales_rep -1`, and the quest ends as `"failed"`.** |
| **B: Shakedown** (`beat_4_take_bribe`, `beat_4_branch_b`) | Take the purse (4 or 8 silver, a straight choice), or `[CHA DC 13/10]` extortion for 14 silver. | `rotten_rib_resolution = "shakedown"`. Waybill destroyed, `brant_favor` stays false, the green spruce ships. **A failed extortion pays nothing and ends as `"failed"`.** |
| **C: Silent Leverage** (`beat_4_branch_c`) | `[INT DC 12]` cite charter law, `[STR DC 12]` intimidate, or `[CHA DC 12]` blackmail (DC 13 if alerted) | `rotten_rib_resolution = "blackmail"`. Oak rolled back to Brant, player keeps the waybill, `brant_favor`, Brant's Iron-Heel Boots. A failure is a strike (see above). |
| **Failed** (`beat_4_failed_*`) | Burned waybill, a failed appeal to Hendryk, or a second strike | `rotten_rib_resolution = "failed"`. The ship launches on green wood. **No coin, no gear, no favor from Brant.** The stats sheet shows "The Ship Launched on Green Wood" and the Keel has its own rumor. |

* **Captain Vane hook:** while `rotten_rib_resolution = "blackmail"` and `has_diverted_timber_waybill`, the compound hub offers `port_valen_vane_timber_turnin` (independent operatives only): +5 silver and `vane_standing +1`, once (`vane_timber_turned_in`). The waybill can't be turned in mid-quest.
* **Post-resolution:** with `brant_favor`, `pv_poi_brant_slipway` opens as an allied contact. Its prose branches on `campaign_day - rotten_rib_resolved_day` (ship still on the ways vs. long since launched) and on `rotten_rib_resolution`, so it stays valid on any later day. Without `brant_favor`, the menu still has the crane-watching and sluice-walk beats.
* **Rumor lifecycle:** the pre-seed rumor is only offered while unstarted. After resolution it is replaced by one outcome-specific rumor per branch (`pv_tavern_rumor_rotten_rib_after`).
* **Items:** Brant's Iron-Heel Shipwright Boots (`has_brant_iron_heel_boots`, feet slot id `brant_iron_heel_boots`, cosmetic, no AC); Sap-Weeping Spruce Splinter and Diverted Timber Waybill (evidence, shown in the dossier inventory while held).
* **Variables:** `rotten_rib_quest_stage`, `rotten_rib_resolution`, `rotten_rib_resolved`, `rotten_rib_resolved_day`, `has_rotten_rib_splinter`, `has_diverted_timber_waybill`, `vane_timber_turned_in`, `elric_alerted`, `rotten_rib_strikes`, `rotten_rib_ledger_clue`, `brant_favor`, `has_brant_iron_heel_boots`, `pv_tavern_rumor_rotten_rib`, `pv_tavern_rumor_rotten_rib_after`.

---

### Quest 4: The Muffled Bell (The Pier)
* **Scene File:** `port_valen.txt` (the gate in `pv_poi_pier`, `bell_hook`, `bell_turn_back`, `bell_b2` and `bell_b2_*`, `bell_b3` and `bell_b3_*`, `bell_fight`, `bell_won`, `bell_rescued`, `bell_fled`, `bell_b4`) and `combat.txt` (`fight_wreckers`). Design and full prose: `quest/MUFFLED_BELL_PLAN.md`.
* **District:** Harbor Quayside, the Pier. Also touches The Cleaved Keel (rumors) and the pier's lower ladders (an overheard line).
* **Trigger:** nobody offers it. The player has to have heard the old wreck story (a Keel rumor, or two skiff hands on the lower ladders by day or at dusk: `bell_heard_story`) and visited the pier once (`pv_pier_seen`). Then, arriving at Night or Pre-Dawn in weather a ship cannot see through but not a storm (Fog, Rain, Snow or Sleet: `weather_visibility` not clear and `weather_severity` under 3), there is a `bell_hook_chance` (20%) chance per visit that `pv_poi_pier` hands off to `bell_hook`. That label replaces the normal arrival, because the normal arrival has the bell tolling on nearly every branch.
* **Briefing:** the bell is silent. The striker thuds dull against the bronze, the frame post is slick with lard, a hooded figure with a rag-muffled lantern goes down the ladder into a rowboat, and two mast lanterns are lined up with the reef. Nobody is named. The player chooses: go out to the post, or turn back (which ends the quest as a loss, `bell_walked_away`).
* **Objective Flow:**
  1. **The bell (`bell_b2`, 15 min, the climax roll):** `[STR DC 12]` climb and tear the wool off, `[DEX DC 12]` throw stones at the bronze (advantage with a ranged weapon, none required), `[INT DC 12]` follow the cord and slip the hitch, `[Cantrip: Mage Hand]` and `[Cantrip: Minor Illusion]` (both succeed without a roll), and `[Cantrip: Guidance]` (+1d4, loops back). No weather modifier. Success: the ketch turns. Any failure: the ketch breaks on the reef.
  2. **The steps (`bell_b3`, 15 min):** the lantern man and the broad man come up the ladder. `[CHA DC 12]` tell them the whole harbor heard the bell, `[STR DC 12]` hold the head of the steps, or `[WIS DC 12]` give the broad man a way out. There is no fight button. Success: the Watch's light shows, and the broad man throws a pouch to buy silence and takes the boat. A failed roll starts the fight with a cost per approach: CHA gives the wreckers advantage, STR gives the player disadvantage, WIS gives both.
  3. **The fight (`fight_wreckers`):** a Dockside Hatchet-Hand (10 HP, AC 11, slashing, 30% Bleeding) and a Dock Lookout (6 HP, AC 10, sling, 25% Blinded). Lethal, at the same weight as the Dredge-End ambush. HP floors at 1 (`rescued`, narrated as the Watch arriving just in time), or the player can disengage (`fled`). A few street-specific flavor lines are retuned in the fight's own label so Dredge-End keeps the shared text.
  4. **The pouch (`bell_b4`, 15 min):** two watchmen arrive and take over. The older one says "wreck-goods", which unlocks `codex_wreck_law`. The pouch lies on the step. Leave it, or pick it up.
* **The Watch, the bribe and the bell:** the gang paid for the post by the landing stairs to be empty. A bribe buys not being noticed, and it cannot cover a bell the whole harbor hears, which is why the Watch turns up on every success route. The player never arrests, hauls or hands anything over, and there is no Voss, Vane or faction tie-in.
* **Resolutions:**

| Route | How | Outcome & State |
|---|---|---|
| **Reported** | Leave the pouch on the step | `bell_quest_stage = "resolved"`, `bell_resolution = "reported"`. `port_watch_rep +1`, no coin. |
| **Pocketed** | Pick up the pouch | `"resolved"`, `"pocketed"`. +5 silver (50 copper), no standing. |
| **Bloodied** | The fight ends `rescued` or `fled` | `"resolved"`, `"bloodied"`. The ketch is saved and the player is hurt (HP 1 if rescued). No pouch, no coin, no standing. |
| **Wrecked** | Turn back, or fail the bell roll | `bell_quest_stage = "failed"`, `"wrecked"`. The ketch breaks on the reef and nothing is paid. `bell_walked_away` marks the turn-back version. |

* **Fail-forward:** the Beat 2 roll is the climax and its failure ends the quest, with no rescue menu. The Beat 3 failures each cost something different and never return the pouch, and a beaten player gets nothing.
* **World memory:** timeless lines at the foot of the pier arrival (a grease-stiff cord still on the cleat after any success, a hooded lantern by the stairs after the reported route, more names than the post has room for after a failure). The Keel replaces its pre-seed rumor with one outcome-specific rumor (five variants), and the wrecked ones unlock `codex_wreck_law`. The lorebook `pier` entry gets one gated sentence.
* **Items:** none.
* **Variables:** `bell_quest_stage`, `bell_resolution`, `bell_resolved`, `bell_heard_story`, `bell_walked_away`, `bell_hook_chance`, `pv_tavern_rumor_bell`, `pv_tavern_rumor_bell_after`.

---

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
| **Lawful** (`fish_route_lawful`) | The slip-warden's booth: `[INT DC 12]` lay out the pattern, or `[CHA DC 12]` be believed (DC 13 if wary) | `fish_resolution = "lawful"`. `port_watch_rep +1`, 3 silver informant's share, the ring struck off the block for the season. **Failure: `port_watch_rep -1`, `fish_slip_shunned`, quest `"failed"`.** |
| **Pragmatic** (`fish_route_pragmatic`) | Buy into the ring: `[CHA DC 12]` play a buyer's agent, or `[WIS DC 12]` answer the signals (advantage with `fish_saw_signals`) | `fish_resolution = "pragmatic"`. 5 silver from the common purse, no standing change, the widow stops speaking to you. **Failure: `fish_slip_shunned`, no coin, quest `"failed"`.** |
| **Strategic** (`fish_route_strategic`) | Needs 4 silver visible in your purse (`*selectable_if`). Bid against the ring: `[WIS DC 12]`, `[INT DC 12]` (advantage with signals) or `[Cantrip: Minor Illusion]` | `fish_resolution = "strategic"`. No coin changes hands (the stake becomes the widow's price and a cook-house runner buys the lot at what you paid), `wenna_favor`, the ring is broken. **Failure: the 4-silver stake is forfeited and the quest is `"failed"`.** |

* **Loss state:** `fish_quest_stage = "failed"`, `fish_resolution = "failed"`. The dossier shows "The Quiet Block (the ring held)", gossip and the Keel have their own failed lines, and lawful or pragmatic failure raises stall prices.
* **Wenna's favor (`wenna_favor`):** created and set on the strategic route and **reserved for future wholesale dealing at the slip**. Only the stall prose reads it for now.
* **World memory:** the auction scene changes with the outcome (new buyers bidding hard after the lawful route, the same quiet half circle after the pragmatic route or a failure, honest bidding after the strategic route).
* **Items:** none.
* **Variables:** `pv_slip_seen`, `fish_quest_stage`, `fish_resolution`, `fish_resolved`, `fish_resolved_day`, `fish_met_wenna`, `fish_study_tried`, `fish_saw_signals`, `fish_ring_wary`, `fish_slip_shunned`, `wenna_favor`, `pv_tavern_rumor_fish`, `pv_tavern_rumor_fish_after`.

---

### Quest 6: The Stolen Shroud (The Alley Shrine)
* **Scene File:** `port_valen_dredge_end.txt` (the gate at the top of `cut_shrine_page`, then `shroud_ask`, `shroud_b2` and `shroud_b2_*`, `shroud_b3` and `shroud_b3_hub`, `shroud_fight`, `shroud_fight_won`, `shroud_b3_take`, `shroud_escaped`, `shroud_b4`, `shroud_shop`, `shroud_shop_refused`) and `combat.txt` (`fight_shroud_thieves`, `pick_weapon_death_flavor_cellar`, `pick_spell_death_flavor_cellar`). Design and full prose: `quest/STOLEN_SHROUD_PLAN.md`.
* **District:** Dredge-End, the Alley Shrine, with Lamp Stair (the pawnbroker's terrace, the drinking house) as the trail.
* **Trigger:** nobody offers it. The player has already left a copper in the bowl (`cut_shrine_gave`) and arrives on a Hallowday while the friar is at his kettle (`cut_broth_serving`: Morning to Afternoon, not in a storm). The place layer's street-life text is replaced by the hook and `shroud_seen` and `shroud_start_day` are set. The friar's broth is not served on that day.
* **Briefing:** the kettle lies on its side, the clay bowl is in shards, the friar holds a bloody rag to his head, and a widow and three children crouch by a body under a fishing net with its feet toward the saint. A scarred young man tore the week's dish (40 coppers, meant for the gravedigger) out of the friar's hands. The friar is named in dialogue only after the player helps (see Ending A) or buys a phial (Ending C). The thief is never named. The player chooses to kneel and ask, or leave them to it. Leaving is free and the scene comes back on later visits.
* **Deadline:** three days from `shroud_start_day` (`shroud_deadline_days`). After that the older woman at the plinth tells the player the family has gone (the pauper's ditch), the bowl becomes a tin cup, and the quest closes as `failed` / `"cold"` with no cost beyond the missed reward.
* **Objective Flow:**
  1. **The hook (free):** kneel and ask (`shroud_ask`), or leave.
  2. **The trail (`shroud_b2`, 15 min):** `[INT DC 12]` follow the coppers, `[WIS DC 12]` watch the doors, `[CHA DC 12]` squeeze the man on the cellar steps, `[Cantrip: Guidance]` (+1d4, loops back), or give it up and walk back (`shroud_b2_back`, no cost). Failure loses 10 coppers of the purse (`shroud_purse` 40 → 30) but still finds the cellar.
  3. **The cellar (`shroud_b3`, 30 min, the climax roll):** the scarred man and a thin one with a sling divide coins on a barrel-head. `[STR DC 12]` step inside the knife, `[DEX DC 12]` feint and pin, `[CHA DC 12]` name the cost, `[Cantrip: Guidance]`, plus `[Cantrip: Shocking Grasp]` (wizards) and `[Cantrip: Vicious Mockery]` (bards), which succeed without a roll. Success: the thin one bolts, the scarred man is disarmed, and the player takes the purse and the thieves' rag. There is no fight button. A failed roll starts the fight, with a different cost per approach (STR: player disadvantage, DEX: enemy advantage, CHA: both).
  4. **The fight (`fight_shroud_thieves`):** a Dockside Knifeman and a Dock Lookout from the shared enemy library, **non-lethal** (`combat_is_nonlethal`), with a cellar-only set of finishing-blow lines chosen by `combat_nonlethal_style = "cellar"` (reset in `fight_cleanup`). Same weight as the Dredge-End night ambush. Victory beats both senseless and the player takes the purse. HP floors at 1 (`rescued`) or the player can disengage (`fled`): the thieves keep everything and run, and the quest closes as `failed` / `"escaped"`. No one is arrested, hauled or handed over.
  5. **The purse (`shroud_b4`, 15 min):** back at the arch, with the purse (`shroud_purse`) and the thieves' rag (20 coppers) in the pouch. Three choices, no rolls.
* **Resolutions:**

| Route | How | Outcome & State |
|---|---|---|
| **Returned** | Put everything in the friar's hands | `shroud_quest_stage = "resolved"`, `shroud_resolution = "returned"`. The friar gives a **Phial of Saint Althea's Water** (`althea_phial`) and gives his name (`met_anselm`). The shop opens and `shroud_phial_ready_day` is set 30 days out. No coin. |
| **Fee** | Count out half for the burial, keep the rest | `"resolved"`, `"fee"`. Half of `shroud_purse` in coin (2 silver, or 1 silver 5 copper after a failed trail); the friar takes the other half and the rag. He **refuses to sell** afterward ("Not to you"). |
| **Pocketed** | Say the trail went cold, keep everything | `"resolved"`, `"pocketed"`. The purse plus the rag (6 silver, or 5 after a failed trail). The friar believes the player only failed and **still sells**. He is named on the first sale. |
| **Escaped** | Lose or flee the fight | `shroud_quest_stage = "failed"`, `"escaped"`. Nothing paid, no shop. |
| **Cold** | Deadline passes | `"failed"`, `"cold"`. Nothing paid, no shop. |

* **Fail-forward:** a failed trail roll costs coin, a failed cellar roll starts a fight with a per-approach handicap and losing it costs the whole reward, and a beaten player gets nothing. No failure converts into a reward.
* **The shop (`shroud_shop`):** the friar sells one item only, the phial (`gear_info "althea_phial"`, 50 copper, restores 2d4+2 HP), and only after Returned or Pocketed, only on a Hallowday while he is at his kettle (`cut_broth_serving`), and one purchase per `shroud_phial_wait_days` (30 days: the water steeps a month in the dark). The hub shows `[Ready in N days]` while the batch is not ready. A player who tried and failed, or took the fee, never buys.
* **World memory:** the place layer's bowl changes with the outcome (shards while the scene is live and for the rest of the theft day, then a new lopsided clay bowl after Returned or Fee, a tin cup after Pocketed, Escaped or Cold), and the ordinary-day line says "cup" for the tin one. For the rest of the theft day (`shroud_after`) the shrine prints "No queue forms under the arch today", with no broth and no phial shop. The beats' returns land on `cut_shrine_page` (a fresh render of the shrine), not on a bare menu. The lorebook `alley_shrine` entry gets gated lines and a new `anselm` people entry unlocks with `met_anselm`. No rumors (the Keel is a Quayside venue).
* **Items:** Phial of Saint Althea's Water (Returned, or bought).
* **Variables:** `shroud_quest_stage`, `shroud_resolution`, `shroud_resolved`, `shroud_seen`, `shroud_start_day`, `shroud_purse`, `shroud_phial_ready_day`, `shroud_deadline_days`, `shroud_phial_wait_days`, `met_anselm`, `combat_nonlethal_style`.

---

### Crane Three: Dell Ostrey's Day-Labor
* **Scene File:** `port_valen.txt` (`pv_poi_crane`, `pv_crane_menu`, `pv_crane_offer`, `pv_crane_shift_intro`, `pv_crane_shift_resolve`)
* **District:** Harbor Quayside (`pv_poi_quays`, crane three on the cargo line).
* **Design intent:** a repeatable, ungated day-labor job, not a bounty — the down-to-earth counterpart to the district's bigger municipal contracts. See `QUEST_DESIGN_RULES.md` §6 ("Minor / Street Tasks") for the scaling this stays inside.
* **Origin:** pays off a line Dockmaster Voss already speaks at `pv_quays_voss_briefing` — "talk to the gang-boss by crane three" — rather than a new quest-giver. Only reachable during daytime/dusk hours (the quay gate is shut Night/Pre-Dawn, per existing `pv_poi_quays` canon).
* **Briefing:** gang-boss Dell Ostrey is two hands short of a contracted hold-clearing before the evening bell — one docker laid up from a crane accident, three more boycotting the hull over a wage dispute with its mate. He hires the player as an outside hand exempt from the dock crews' turf and solidarity norms.
* **First-Shift Resolution (`pv_crane_shift_intro`):** one archetype choice fully resolves the shift, each with its own fail-forward (not a dead end):
  * **STR** (`Athletics DC 12`) — brute-force pace; failure still clears the hold on time but costs 2 HP.
  * **DEX** (`Acrobatics DC 12`) — work the crane's guy-lines; failure damages a crate (bonus lost, base pay kept).
  * **INT** (`Investigation DC 11`) — re-sequence the lift order off the chalk-board; failure runs the shift late (bonus lost).
  * **CHA** (`Persuasion DC 11`) — talk the ship's mate into a grace window before lifting anything; failure wastes the time and the shift still runs late.
* **Economics:** flat 3 copper base pay regardless of outcome, plus a matching 3-copper on-time/undamaged bonus (6 copper total) that can be haggled to 4 copper (7 total) at the offer (`CHA DC 11`, `crane_fee_bonus`) — the haggled rate persists to every future shift. Sized as a fraction of a full "day-shift" (§3's 20–40 copper/day manual-labor benchmark): the shift only simulates ~2.5 hours of a workday, not all of it.
* **The repeatable loop:** once the first shift resolves, `crane_job_unlocked` opens ordinary day-labor at crane three — same archetype choice, same pay math, gated to one shift per `campaign_day` (`crane_last_shift_day`). No faction reputation changes; this is wage labor, not a municipal contract.
* **Future work (not yet implemented):** `crane_shifts_completed` and `crane_dell_regard` are tracked from the first shift onward specifically so a later promotion ladder (better rate, standing crew role, etc.) has something to read.
* **Variables:** `crane_quest_stage`, `crane_seen`, `crane_grievance_known`, `crane_fee_bonus`, `crane_first_shift_method`, `crane_shift_ontime`, `crane_shift_damaged`, `crane_job_unlocked`, `crane_shifts_completed`, `crane_last_shift_day`, `crane_dell_regard`, `crane_award_locked`, `locked_crane_award_page_id`.

---

### Hask's Real Money: The Scrap Yard Courier Round
* **Scene File:** `port_valen_dredge_end.txt` (`cut_sheds_hub`, `scrap_vetting_approach`, `scrap_vetting_pitch`, `scrap_vetting_run`, `scrap_vetting_resolve`)
* **District:** Dredge-End (the Boat-Sheds Scrap Yard).
* **Design intent:** a Minor/Street Task (`QUEST_DESIGN_RULES.md` §6) that turns a repeatable day-job into a recruitment hook without a faction-shift climax, and deliberately without the full three-branch Mercenary Dilemma structure the bigger district quests use. Full design writeup: `quest/DREDGE_SCRAP_VETTING_PLAN.md`.
* **Origin:** no new quest-giver — the scrap dealer the player has already been selling to for two weeks (`cut_scrap_sold_count`) makes the offer himself, and names himself (Hask) for the first time at that beat.
* **Briefing:** Hask connects the player to "a man he does business with" who needs a runner to carry parcels and word between people around the quarter who'd rather not walk the lanes themselves. **The player never learns this is Black Oath work** — nothing carried is illegal or dangerous, and the text never names the association; `black_oath_rep` moves silently in the background on the first success only.
* **The round (`scrap_vetting_run`):** one archetype choice resolves the whole afternoon (one roll standing in for several stops — the market stalls, the Gangways rail, the foot of Lamp Stair):
  * **STR** (`DC 12`) — keep a hard, steady pace between every stop.
  * **DEX** (`DC 12`) — take the fastest cuts and never double back.
  * **CHA** (`DC 11`) — keep every hand-off brief and businesslike.
  * Failure is fail-forward with no permanent penalty: nothing carried is illegal, so there's no authority to get more alert and no reason to raise the DC or lock the player out — a fumbled round just pays less and doesn't count toward the trust counter.
* **Economics:** 12 copper on a successful round (partial 4 on failure), once per `campaign_day` (`scrap_vetting_day`) — a real day job (6 hours) rather than an errand, sized so the courier round and wading together eat most of the 14-hour working day if both are run the same day.
* **The repeatable loop:** once the first round resolves, `hask_courier_unlocked` opens a standing "Ask Hask if there's a round to run" option at `cut_sheds_hub` — same mechanics as the first round, no further `black_oath_rep` change (that was the first round's reward specifically, so the loop can't farm reputation).
* **Future work (not yet implemented):** `hask_courier_count` is tracked from the first round onward so a future "another job" hook (proposed gate: 12 successful rounds) has something to read — presumably the point where "not carrying anything illegal *yet*" stops being true. The chandler's upper-room stub at `cut_market_night` is a separate, bigger investigation-grade quest and is not wired to this one.
* **Not yet added:** `lorebook-data.js` (Hask) and `quest-data.js` — skipped to match existing Port Valen practice: no POI-quest NPC (Dell, Wenna, Elric, Brant, Hendryk) has a lorebook entry yet, and Crane Three's identically-shaped repeatable day-job isn't in the sidebar quest log either. Worth a dedicated pass across all of Port Valen's cast later rather than fixing it piecemeal for one NPC.
* **Variables:** `cut_scrap_sold_count`, `scrap_vetting_offer_seen`, `scrap_vetting_quest_stage`, `scrap_vetting_day`, `hask_courier_unlocked`, `hask_courier_count`.

---

## Harbor POIs & Minor Contract Log

| Location | Quest / Activity | Requirements / Triggers | Rewards |
|---|---|---|---|
| **The Cleaved Keel Taphouse** | Tavern Dice Gambling & Port Valen Rumors | Open after Vane briefing (`pv_pois_open`) | Up to 15 Silver Marks, 3 unique district rumors |
| **Fishmongers' Slip** | **The Quiet Block** (see Quest 5 and `quest/FISH_SLIP_PLAN.md`): a dawn auction where a ring of buyers never bids against each other. Plus DEX/INT street food and gossip | Open Pre-Dawn to Afternoon; closed Dusk, Night, Storm and Blizzard; the auction is Pre-Dawn and Morning only | Up to 5 Silver Marks, or `port_watch_rep +1` and 3 Silver, or an ally (`wenna_favor`); failure costs stall prices and Watch standing |
| **Sail-Loft Ropes** | Rigging repairs, tarred hemp cordage, climbing gear | Open during daytime hours | Rigging tools for Sapper / Rogue checks |
| **Harbor Chart House** | Tidal charts, channel navigation, barge clearance (deferred: planned for the customs area, not its own Quayside stop) | Requires `port_watch_rep >= 1` or `gilded_scales_rep >= 1` | Tidal navigation advantages |
| **Iron Wharves** | The Rotten Rib investigation; allied contact on Slipway Two afterward | Daytime, fair weather only (gate closed at Dusk/Night/Pre-Dawn and in Storm/Blizzard) | Up to 14 Silver Marks, Brant's Iron-Heel Boots, `gilded_scales_rep +1` |
| **The Pier** | **The Muffled Bell** (see Quest 4 and `quest/MUFFLED_BELL_PLAN.md`): a night emergency at the wreck-bell. Plus the observe and lower-ladder scenes | The pier is open at any hour; the quest needs the wreck story, Night or Pre-Dawn, and Fog, Rain, Snow or Sleet | +5 silver, or `port_watch_rep +1`; a lost ketch on failure |
| **The Alley Shrine** (Dredge-End) | **The Stolen Shroud** (see Quest 6 and `quest/STOLEN_SHROUD_PLAN.md`): a stolen burial purse, a trail up Lamp Stair, a cellar. Plus the Hallowday broth line, Saint Althea's phials, and rumors | The hook needs a copper left in the bowl and a Hallowday with the friar at his kettle; three days to act | A Phial of Saint Althea's Water, or 2 to 6 silver; the friar sells a phial (50 copper, one per 30 days) after Returned or Pocketed |
| **Crane Three** | Repeatable dock day-labor for gang-boss Dell Ostrey | Daytime/Dusk only; first shift resolves a one-off headcount crisis | 3 Copper base + up to 4 Copper bonus per shift, once/day |

> **Removed:** the Tide-Well / Saint Althea shrine stop (it had no mechanics and the Alderford chapel and a planned city cathedral cover the same ground). Its two ambient hub lines stay as scenery.

### World Economy Layers (design note for the future trading simulator)

* **Quayside (physical layer):** warehouses, cranes, the fish market and the Fishmongers' Slip. Small lots, day wages, commoner trade.
* **Civic Heights (paper layer):** the Gilded Scales head house beside the Council Hall: banking and letters of credit, entry writs for the Patrician Quarter, dispatches, and the (later) contracts window. Alderford's counting house and Hendryk's factor's office at the Iron Wharves are branches of this. The **Patrician Quarter** is the merchant lords' private enclave (great houses, walled estates, the Terrace Walk, a tailor), reached by a Day Writ or Registered Writ bought at the head house.
* **The Pier (sea layer):** hulls, skiffs and later sea travel.
* **`wenna_favor`** (from The Quiet Block, strategic route) is reserved for wholesale dealing at the Slip.
* **Governance:** Port Valen is a **free city** (a status, not a name: it comes from an old Meridian charter, and other free cities can exist with their own governments; the carved legend reads "The Free City of Port Valen"), ruled by its Council (the Council of Factors, drawn from the senior merchant houses of the Gilded Scales). It is a plutocracy in practice, and the game never uses that word: the player sees it in the two tax-hall lines and the carved legend over the Council Hall, and the codex says "whoever controls the purse controls the city." The Free City's reach extends to the surrounding towns and villages of the river country, Alderford among them, through tolls, tax contracts and factors rather than garrisons. Old imperial charters (free-wharf exemptions, church toll immunity) are what the independents cite against it. Civic Heights is the seat of the Council, courts, tax and records offices and the Watch headquarters.

---

## Complete Variables Index

```choicescript
*create silt_gate_quest_stage "unstarted"     *comment "unstarted", "active", "resolved"
*create silt_gate_resolution "none"           *comment "watch_seized", "hush_money", "leverage", "failed"
*create silt_gate_lookout_spotted false       *comment daytime recon reward
*create silt_gate_winch_jammed false          *comment daytime recon reward / mage hand
*create silt_gate_recon_done false            *comment tracks daytime scout completion
*create silt_gate_lamp_snuffed false          *comment prestidigitation stakeout buff
*create silt_gate_illusion_active false       *comment minor illusion stakeout buff
*create silt_gate_full_intel false            *comment both corrupt watch names discovered
*create silt_gate_bounty_claimed false        *comment one-time 20 silver watch payout guard
*create has_silt_gate_payout_slip false       *comment the broker's list of paid Watch sergeants (Branch C); spent at Voss or held for Vane
*create vane_watch_leverage false             *comment Vane holds the names; RESERVED for future radiant Watch quests
*create port_watch_rep 0                      *comment municipal guard standing
*create black_oath_rep 0                     *comment canal smuggling network standing
*create gilded_scales_rep 0                   *comment merchant guild monopoly standing
*create vane_standing 0                       *comment mercenary company captain regard

*comment --- Crane Three day-labor (see full label list above) ---
*create crane_quest_stage "unstarted"         *comment "unstarted", "active", "resolved"
*create crane_seen false                      *comment first-visit intro guard
*create crane_grievance_known false           *comment heard the boycotting dockers' side
*create crane_fee_bonus 3                     *comment 3 or 4 copper -- haggled once, persists every shift
*create crane_first_shift_method "none"       *comment "muscle", "rigging", "tally", "talked"
*create crane_shift_ontime false              *comment recomputed every shift
*create crane_shift_damaged false             *comment recomputed every shift
*create crane_job_unlocked false              *comment true once the repeatable loop is open
*create crane_shifts_completed 0              *comment lifetime counter -- future promotion ladder hook
*create crane_last_shift_day 0                *comment campaign_day of last shift -- one shift/day
*create crane_dell_regard 0                   *comment Dell's opinion -- future promotion gate

*comment --- Hask's Real Money / Scrap Yard Courier Round (see full label list above) ---
*create cut_scrap_sold_count 0                *comment times sold TO Hask specifically -- fires his offer at 14
*create scrap_vetting_offer_seen false        *comment Hask has raised the offer at least once
*create scrap_vetting_quest_stage "unstarted" *comment "unstarted", "active", "resolved"
*create scrap_vetting_day 0                   *comment campaign_day of the last delivery-round attempt; once/day
*create hask_courier_unlocked false           *comment first round resolved; unlocks the standing "run a round" option
*create hask_courier_count 0                  *comment lifetime SUCCESSFUL rounds; RESERVED to gate a future "another job" hook

*comment --- The Rotten Rib / Iron Wharves (see Quest 3 above) ---
*create rotten_rib_quest_stage "unstarted"    *comment "unstarted", "active", "resolved"
*create rotten_rib_resolution "none"          *comment "none", "lawful", "shakedown", "blackmail", "failed"
*create rotten_rib_resolved false             *comment one-time completion guard
*create rotten_rib_resolved_day 0             *comment campaign_day of resolution -- drives Slipway Two prose
*create has_rotten_rib_splinter false         *comment physical proof from Brant, cleared on resolution
*create has_diverted_timber_waybill false     *comment Hendryk-stamped waybill; kept only on the blackmail route
*create vane_timber_turned_in false           *comment waybill delivered to Captain Vane
*create elric_alerted false                   *comment a failed approach or walk-away raised the alarm
*create rotten_rib_strikes 0                  *comment failed INT/STR/blackmail checks at Elric; the second ends the quest
*create rotten_rib_ledger_clue false          *comment read the Bay Four initials; advantage when appealing to Hendryk
*create brant_favor false                     *comment unlocks the Slipway Two contact (lawful and blackmail only)
*create has_brant_iron_heel_boots false       *comment reward footwear
*create pv_tavern_rumor_rotten_rib false      *comment Cleaved Keel pre-seed rumor
*create pv_tavern_rumor_rotten_rib_after false *comment Cleaved Keel post-resolution rumor

*comment --- The Muffled Bell / The Pier (see Quest 4 above) ---
*create bell_quest_stage "unstarted"          *comment "unstarted", "active", "resolved", "failed"
*create bell_resolution "none"                *comment "none", "reported", "pocketed", "bloodied", "wrecked"
*create bell_resolved false                   *comment one-time completion guard
*create bell_heard_story false                *comment heard the old wreck story; opens the hook
*create bell_walked_away false                *comment turned back at the hook (wrecked without trying)
*create bell_hook_chance 20                   *comment percent chance per eligible pier visit
*create pv_tavern_rumor_bell false            *comment Cleaved Keel pre-seed rumor
*create pv_tavern_rumor_bell_after false      *comment Cleaved Keel post-resolution rumor

*create pv_slip_seen false                     *comment first-visit intro at the Fishmongers' Slip
*create fish_quest_stage "unstarted"           *comment "unstarted", "active", "resolved", "failed"
*create fish_resolution "none"                 *comment "lawful", "pragmatic", "strategic", "failed"
*create fish_resolved false
*create fish_resolved_day 0
*create fish_met_wenna false
*create fish_study_tried false                 *comment one-time INT DC 11 study of the buyers' hands
*create fish_saw_signals false                 *comment study success: advantage on route checks
*create fish_ring_wary false                   *comment study failure: +1 DC on every route check
*create fish_slip_shunned false                *comment failed lawful/pragmatic route: stalls charge +1 copper
*create wenna_favor false                      *comment strategic route; RESERVED for future wholesale dealing
*create pv_tavern_rumor_fish false             *comment Cleaved Keel pre-seed rumor
*create pv_tavern_rumor_fish_after false       *comment Cleaved Keel post-resolution rumor

*comment --- The Stolen Shroud / The Alley Shrine (see Quest 6 above) ---
*create shroud_quest_stage "unstarted"         *comment "unstarted", "active", "resolved", "failed"
*create shroud_resolution "none"               *comment "none", "returned", "fee", "pocketed", "escaped", "cold"
*create shroud_resolved false                  *comment one-time completion guard
*create shroud_seen false                      *comment the hook has been shown once
*create shroud_start_day 0                     *comment campaign_day the hook first appeared; starts the deadline
*create shroud_purse 40                        *comment coppers in the recovered purse; 30 after a failed trail roll
*create shroud_phial_ready_day 0               *comment first campaign_day the friar has another phial
*create shroud_deadline_days 3                 *comment days the family waits before the scene closes as "cold"
*create shroud_phial_wait_days 30              *comment days between phial batches
*create met_anselm false                       *comment the friar has given his name (Returned ending or first sale)
*create combat_nonlethal_style ""              *comment "" or "cellar": which non-lethal finishing-blow lines a fight uses; reset in fight_cleanup
```
