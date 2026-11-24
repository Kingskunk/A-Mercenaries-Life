# Quest Index

One row per quest. This file says what exists and where it is. It holds no prose, no step lists and no variable lists: those are in the scene file, and in the quest's write-up when it has one.

- **Sidebar id** is the `id` in `web/mygame/quest-data.js`, spelled the same. A quest the sidebar lists must have a row here.
- **Scene file** is under `web/mygame/scenes/`.
- **Endings** are the values the quest's resolution variable can end on.
- **Write-up** is a file in `quests/`, named after the sidebar id, or a plan file in this folder. "None" means nobody has written one.

To add a quest: add its object to `quest-data.js`, add its row here, and add its people and places to the Lorebook. Write a file in `quests/` only when the quest needs more than its row.

The write-ups in `quests/` were moved here word for word from the old version of this file on 2026-11-16. They have not been checked against the scenes since, so where a write-up and a scene disagree, the scene is right.

---

## Quests the sidebar lists

| Quest | Sidebar id | Scene file | Starts with | Endings | Write-up |
| --- | --- | --- | --- | --- | --- |
| The Hale Ring | `hale_ring` | `overworld/travel_events.txt` | A ring found on the road (a rare travel event) | `returned_free`, `returned_paid`, `sold` | `quests/hale_ring.md` |
| The Weight of the Road | `weight_road` | `alderford/whitefold/the_weight_of_the_road.txt` | The Whitefold road wall collapses; the player offers help to Edda Cale | `road_rebuilt`, `pasture_bypass`, `fund_stabilized`, `road_lost` | `quests/weight_road.md`, `THE_WEIGHT_OF_THE_ROAD_PLAN.md` |
| The Wolves of Langston | `wolves_of_langston` | `Langston/wolves_of_langston_chapter_1.txt` to `_chapter_6.txt`, `_epilogue.txt` | Mayor Anathram, Langston Hall | Not recorded here | `quests/wolves_of_langston.md` (covers chapter 1 only; all six chapters and the epilogue now have scene files), `WOLVES_OF_LANGSTON_ADAPTATION_PLAN.md` |
| Toll Register Delivery | `toll_register` | `prologue/battle_black_sinks.txt`, `prologue/alderford.txt` | Finding the toll register at the Black Sinks | Turned in, or used as leverage | `quests/toll_register.md` |
| Silt-Gate Contraband | `silt_gate` | `port_valen/port_valen_dredge_end.txt`, `port_valen/port_valen.txt` | Kestrel in the watchtower, then Dockmaster Voss | `leverage` (one ending) | `quests/silt_gate.md` |
| The Dry Lion | `dry_lion` | `port_valen/MiddlewardQuest/dry_lion.txt` | A fountain lion runs dry in Conduit Square | `city_sealed`, `hidden_repaired`, `line_registered`, `failed` | `quests/dry_lion.md` |
| A Key for Every Door | `a_key_for_every_door` | `port_valen/MiddlewardQuest/a_key_for_every_door.txt` | Not recorded here | `lawful`, `pragmatic`, `strategic`, `compromised` | None |
| The Rotten Rib | `rotten_rib` | `port_valen/port_valen.txt` | Ysolde in her workroom, after Vane's summons | `blackmail`, `failed` | `quests/rotten_rib.md` |
| The Muffled Bell | `muffled_bell` | `port_valen/port_valen.txt` | Nobody offers it: a silent wreck-bell on a foul night at the Pier | `reported`, `pocketed`, `bloodied`, `wrecked` | `quests/muffled_bell.md` |
| The Quiet Block | `quiet_block` | `port_valen/port_valen.txt` | Nobody offers it: the dawn auction at the Fishmongers' Slip | `lawful`, `pragmatic`, `strategic`, `failed` | `quests/quiet_block.md` |
| The Stolen Shroud | `stolen_shroud` | `port_valen/port_valen_dredge_end.txt` | Nobody offers it: the robbed friar at the Alley Shrine | `returned`, `fee`, `pocketed`, `escaped`, `cold` | `quests/stolen_shroud.md` |
| Varren's Errand | `varren_errand` | `port_valen/varren_quests/varren_errand.txt` | Sergeant Varren in the armory shed, after Vane's summons | `arrested`, `escaped` | `quests/varren_errand.md` |
| Five Silver | `lyra_errand` | `port_valen/lyra_quests/lyra_quest.txt` | Not recorded here | `paid`, `unpaid` | None |
| The Night List | `black_oath_night_list` | `port_valen/black_oath/black_oath_night_list.txt` | The woman upstairs at the rope-and-oil house, after Hask's sponsorship | `completed`, `failed` | `quests/black_oath_night_list.md`, `BLACK_OATH_FACTION_PLAN.md` |
| The Short Purse | `black_oath_short_purse` | `port_valen/black_oath/black_oath_short_purse.txt` | The woman upstairs | `recovered_enforced`, `covered_pocket`, `brokered_compromise`, `failed_muscle` | `BLACK_OATH_FACTION_PLAN.md` |
| The Innocent Smile | `innocent_smile` | `overworld/valen_reach_alyndra.txt` | An elven traveler in a Valen Reach tavern at dusk or night, level 2 or higher | Not recorded here | None |
| Ambrose's Deep-Wood Order | `ambrose_order` | `port_valen/port_valen_middle_ward.txt` | Master Ambrose, the Still-Room in Herb-Pounder Close | Delivered; repeats by season | `Ambrose's Deep-Wood Order.md` |
| The Troubled Water | `bark_poisoned_water` | `longshade/longshade_forest.txt` | Bark, the old tree in the Longshade | Finished, or failed by leaving the burning grove | None |
| Word of Aldis Pellam | `overdue_peddler` | `timbermouth/barleycross/overdue_peddler.txt` | A job board, with the Contractor's Insignia | Resolved | None |
| A Frying Pan, Spick and Span | `greybank_pan` | `overworld/greybank_frying_pan.txt` | A 10% daytime road event on Greybank Rise (`ar2`) | `returned`, `pocketed` | None |
| Sparks in the Holt | `ashrun_forge` | `timbermouth/ashrun_holt/burnt_smithy.txt` | Durgan's notice on Ashrun Holt's board of cords (requires the Contractor's Insignia; credits `hall_jobs_scales`) | `returned_peaceful`, `returned_subdued`, `bribed` | None |
| The Mare on the Down | `broadmead_mare` | `Langston/broadmead/bolted_mare.txt` | Remount Yard notice under STRAYS AND BRANDS on Broadmead's Contract Board (requires a House Gault page; credits `hall_jobs_gault`) | `returned` (`settled`, `law`, `paid`, `brawled`), `lost` | `quests/broadmead_mare.md` |

## Hiring Hall jobs and parcels the sidebar lists

These repeat and are listed under their own heading in the sidebar.

| Job | Sidebar id | Scene file |
| --- | --- | --- |
| Vermin in the Walls | `hall_pests` | `port_valen/radiant/hall_pests.txt` |
| A House to Be Moved | `hall_haul` | `port_valen/radiant/hall_haul.txt` |
| The Night Watch | `hall_watch` | `port_valen/radiant/hall_watch.txt` |
| Music for an Evening | `hall_perform` | `port_valen/radiant/hall_perform.txt` |
| Wagon Escort | `hall_escort` | `port_valen/radiant/hall_escort.txt` |
| Courier parcels | `courier_1`, `courier_2`, `courier_3` | `port_valen/radiant/hall_courier.txt` |

## Story beats and day work the sidebar does not list

| Name | Scene file | What it is | Write-up |
| --- | --- | --- | --- |
| Assault on the Sinks Gatehouse | `prologue/battle_black_sinks.txt` | The prologue battle | `quests/black_sinks_assault.md` |
| The Fish-Curing Lofts Extortion | `prologue/alderford.txt` | Alderford side task | `quests/alderford_fish_curing.md` |
| The Granary Cellar Infestation | `prologue/alderford.txt` | Alderford side task | `quests/alderford_granary.md` |
| Crane Three | `port_valen/port_valen.txt` | Repeatable dock labour for Dell Ostrey | `quests/crane_three.md` |
| Hask's Real Money | `port_valen/port_valen_dredge_end.txt` | Repeatable courier round; leads to the Black Oath | `quests/scrap_yard_courier.md` |
| Vane's Debrief | `port_valen/vane_debrief.txt` | Vane reviews the three commanders' quests a day after the last is turned in; says he will send for the player again | `quests/vane_debrief.md` |

## Planned, not built

| Name | Plan |
| --- | --- |
| The Bell Below (Redvein) | `THE_BELL_BELOW_PLAN.md` |
| Later Black Oath work | `BLACK_OATH_FACTION_PLAN.md` |
| Loose ideas | `Random Quest Ideas.md` |

## Known gaps

- Four plan files named inside the write-ups are not in this folder: `MUFFLED_BELL_PLAN.md`, `FISH_SLIP_PLAN.md`, `STOLEN_SHROUD_PLAN.md` and `DREDGE_SCRAP_VETTING_PLAN.md`.
- `quests/_LEFTOVER_FROM_OLD_QUESTS_FILE.md` holds the parts of the old file that were not quest write-ups: the chapter diagram, a harbor places table, a design note on the economy and the old variables index.
