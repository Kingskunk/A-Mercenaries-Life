# The Mare on the Down (`broadmead_mare`)

*Adapted from* Kingdom Come: Deliverance*'s "The Horse That Bolted" for Broadmead in the Western Vale. See [QUEST_DESIGN_RULES.md](../QUEST_DESIGN_RULES.md) and [CONTENT_WORKFLOW.md](../CONTENT_WORKFLOW.md).*

---

## Metadata

| Field | Value |
| --- | --- |
| **Title** | The Mare on the Down |
| **Sidebar id** | `broadmead_mare` (`web/mygame/quest-data.js`) |
| **Scene file** | `web/mygame/scenes/Langston/broadmead/bolted_mare.txt` |
| **Startup part** | `web/mygame/scenes/startup_parts/58_broadmead_mare.txt` |
| **Settlement & region** | Broadmead, Western Vale (House Gault) |
| **Hook & gate** | Pinned under `STRAYS AND BRANDS` on Broadmead's Contract Board (`port_valen/radiant/notice_board.txt nb_read`, `cr_origin = "bm"`), gated on `cr_can` (`Insignia.canTake(stats, "gault")`, requiring a Contractor's Insignia with a House Gault page) |
| **Level-up pool** | Counts as 1 completed quest on `returned` (`bm_mare_success = true`, read by `count_finished_broadmead_mare` in `bolted_mare.txt`, wired into `character_progression.txt refresh_quests_finished`) |
| **Insignia credit** | Credits 1 job on the House Gault page (`window.Insignia.credit(stats, "gault")`) on `returned` (counts toward *Proven* at 3 jobs; does not grant *Vouched*) |
| **Endings (`bm_mare_ending`)** | Two endings: `"returned"` and `"lost"`. Inside `"returned"`, `bm_mare_how` records `"settled"`, `"law"`, `"paid"`, or `"brawled"`. |

---

## Cast

### Existing NPCs (reuse existing flags; no re-introductions)
- **Sergeant Dagny Marren** (`bm_know_sergeant`, `bm_ry_met`): commands the Countess's Remount Yard across the stream. Gives the contract, pays out on completion, and grants permanent gate access (`bm_ry_open = true`, opening her talk and `horse_dealer.txt` `"bm"` sale) on any clean return (`settled`, `law`, or `paid`).
- **Mardred Birchstone** (`bm_know_head`, `bm_hl_asked_sides`): Broadmead's village head. Reads brands by touch and adjudicates brand vs. grazing custom at her counter in the `settled` route; remembers the outcome on later visits.
- **Olof** (`bm_ch_talk_opened`): innkeeper at The Crooked Halter. Sides with neither camp and judges people by how they treat animals; remembers the outcome in a short aftermath line.

### New Named NPCs (add to `RESERVED` in `web/mygame/names-data.js`)
- **Myles Buckman** (human, late teens, commons-born junior groom newly taken on at the Remount Yard): lost the mare at the stream ford. Keeps his place at the yard on `returned`; loses it on `lost`.
- **Thistle** (human, late forties, weathered commons shepherd known across the downs by his byname): penned the stray mare in the dry-stone commons pound under old grazing custom, demanding the customary 1-silver pound fee and recognition that common grazing still stands.
- **Magpie** (the horse): a piebald remount mare bearing House Gault's golden-horse brand on her near shoulder and yard-forged shoes with the farrier's crescent toe-notch.

### Unnamed Extras (remain unnamed per `QUEST_DESIGN_RULES.md`)
- Remount Yard gate troopers, yard farrier, Downs Road drover, old shepherd and herdboy at the lambing fold.

---

## Quest Spine (Branch-and-Bottleneck, 6 Beats)

### Beat 1: The Notice (`notice_board.txt nb_read` -> `bm_mare_notice_take` / `bm_mare_notice_need`, 0 min to sign)
- Appears on Broadmead's board (`cr_origin = "bm"`, `bm_mare_stage = 0`) under `STRAYS AND BRANDS`:
  > *"STRAYED: piebald mare, Countess's brand on the near shoulder, shod with the yard's mark. Four silver marks for her return sound. Apply at the Remount Yard gate. Sgt. D. Marren."*
- Gated by `cr_can`. Without a House Gault page, `bm_mare_notice_need` prints the House Gault page refusal and returns to `notice_board nb_read`.
- Taking the posting sets `bm_mare_stage = 1` and offers either walking straight to the Remount Yard (`+5 min`) or stepping back to the Village Head's Hall.

### Beat 2: Inside the Remount Yard (`bm_mare_yard`, +5 min walk, +10 min briefing; optional prep +5 min each)
- Gate troopers inspect the Insignia and admit the player for this job (`remount_yard.txt` also routes here while `bm_mare_stage = 1`).
- Dagny Marren (`bm_know_sergeant = true`, `bm_ry_met = true`) sets the terms plainly: bring Magpie back sound, before dark if possible.
- Optional downtime prep inside the yard before setting out (each gives an advantage later; skipping carries no penalty):
  - **Speak with Myles Buckman** (`bm_mare_prep_groom = true`): admits a loose hurdle startled her at the stream ford and she bolted upslope toward the open down. Grants advantage on Beat 3 Animal Handling and Survival checks.
  - **Speak with the yard farrier at the smithy bay** (`bm_mare_prep_shoe = true`): shows the crescent toe-notch stamped into every yard shoe. Grants advantage on Beat 3 Survival tracking and lets non-trackers spot her prints.
  - **Take a spare rope halter from the tack room** (`bm_mare_has_halter = true`, or note carried Hemp Rope): physical affordance for handling Magpie cleanly at the pound.
- Advances to `bm_mare_stage = 2`.

### Beat 3: The Ford and the Down (`bm_mare_trail`, +30 min; +45 min extra on failure)
- Calls `calendar ensure_navigable_weather` before the outdoor search.
- One obstacle with four archetype approaches, all converging on Beat 4:
  - **Track the notched hoofprints** (`Survival DC 12`, advantage with `bm_mare_prep_shoe` or `bm_mare_prep_groom`):
    - Success: reaches the fold in 30 min and spots `bm_mare_clue_led` (steady walking pace beside boot tracks partway up, showing someone led her).
    - Failure: loses +45 min following false sheep tracks (no `bm_mare_clue_led`; risks pushing Beat 5 into dusk or night).
  - **Follow a frightened horse's instincts** (`Animal Handling DC 13`, advantage with `bm_mare_prep_groom`):
    - Success: reaches the fold in 30 min with `bm_mare_clue_calm` (advantage when handling or riding Magpie later).
    - Failure: loses +45 min checking the wrong hollows.
  - **Flag down a drover on the Downs Road** (`Persuasion DC 12`, or pay `3 copper` with no check):
    - Success or paid: learns a commons man led a piebald upslope (`bm_mare_clue_led`) in 30 min.
    - Failure: loses +45 min walking the down by hand.
  - **Arcane (`known_speak_with_animals`, cast via `dungeon dg_spell_source` / `dg_spell_cast`):**
    - Ask a grazing sheep or farm dog near the ford; automatic 30 min arrival with `bm_mare_clue_led`.
- Advances to `bm_mare_stage = 3`.

### Beat 4: The Shepherds' Fold (`bm_mare_fold`, +15 min)
- Bottleneck beat (no forced 3-way menu): a turf-and-stone lambing fold on the down with an old shepherd, a herdboy, and a sheepdog.
- They confirm **Thistle** found the mare loose on the common grass and penned her in the dry-stone **commons pound** up the ridge, following old grazing custom.
- Optional single read (`Insight DC 12`, or automatic if the player already learned `bm_hl_asked_sides` from Mardred): surfaces the real grievance. Thistle is not trying to steal a horse; he is forcing the yard to recognize commons grazing rights after the Home Meadow was fenced (`bm_mare_clue_grievance = true`). Failing Insight gets a curt brush-off with no leverage.
- Advances to `bm_mare_stage = 4`.

### Beat 5: The Commons Pound and Thistle (`bm_mare_pound`, +25 min)
- Dry-stone pen on the ridge. Magpie is inside, mud-splashed across her shoulder (hiding the brand), twitchy but sound. Thistle leans on the gate-bar with a crooked ash staff, demanding the customary 1-silver pound fee.
- Approaches (climactic failures have real consequences with no rescue menus; combat follows only from an explicit force choice or a failed push at the gate):
  - **Propose taking it to Mardred Birchstone's counter** (`Persuasion DC 12`, advantage with `bm_mare_clue_grievance` or `bm_hl_asked_sides`):
    - Success: short ruling beat at Mardred's counter (`bm_mare_mardred_ruling`, +20 min). Mardred reads the brand by touch, rules the yard honors the customary 1-silver pound fee on the roll, and hands over the lead (`bm_mare_how = "settled"`).
    - Failure: Thistle rejects hall paper, swings his ash staff to bar the gate, and forces the non-lethal brawl below.
  - **Scrape the mud off the Gault brand and press authority** (`Intimidation DC 13`, advantage with `bm_mare_clue_led` or `known_thaumaturgy`):
    - Success: Thistle backs down grimly; player takes Magpie (`bm_mare_how = "law"`).
    - Failure: shouting and a slammed staff startle Magpie; she scrambles over the low corner of the dry-stone wall and bolts lame across the scree straight into **`lost`**.
  - **Pay the customary pound fee yourself** (`[1 Silver Mark]`, requires `>= 10 copper`, spent via `economy currency_spend`, no check):
    - Automatic quiet handover (`bm_mare_how = "paid"`).
  - **Slip the halter on and draw Magpie past him** (`Animal Handling DC 13`, advantage with `bm_mare_clue_calm` or `bm_mare_has_halter`):
    - Success: clean getaway with Magpie; Thistle curses after you (`bm_mare_how = "law"`).
    - Failure: clumsy grab startles Magpie; she bolts over the broken wall and goes lame off the down straight into **`lost`**.
  - **Force your way through (direct brawl)**, or triggered by failed Mardred-counter Persuasion:
    - Non-lethal `fight_library` scuffle (`combat_is_nonlethal true`, `combat_lib_1 "hookman"`, `combat_enemy_name_override "Thistle"`, `combat_enemy_epithet_override "Thistle"`, `combat_enemy_hp_override 10`, `combat_enemy_ac_override 11`, `combat_enemy_atk_override 2`, `combat_open_sky true`, `combat_no_morale false`).
    - Win: Thistle yields nursing a bruise; player takes Magpie (`bm_mare_how = "brawled"`).
    - Lose or flee: driven off the ridge or Magpie bolts in the confusion -> **`lost`**.
  - **Arcane (`known_charm_person`, if slot available via `dungeon dg_spell_source` / `dg_spell_cast`):**
    - Cast Charm Person to get Thistle to hand Magpie over quietly (`bm_mare_how = "law"`, with commons distrust of magic once it wears off); failure triggers the startled-bolting **`lost`** or brawl.

### Return Trip (`bm_mare_return_trip`, skipped for `settled` since Thistle and the player walk straight to Mardred's counter)
- **Mount and ride Magpie back** (`Animal Handling DC 12`, advantage with `bm_mare_clue_calm`, `+20 min`; failure means she sidesteps and the player leads her in `+50 min`).
- **Lead her back on foot** (no check, `+50 min`).

### Beat 6: Resolution at the Remount Yard (`bm_mare_resolve`, +10 min)
- All coin, credit, and access grants sit inside a single `bm_mare_reward_claimed` replay guard. Advances to `bm_mare_stage = 5` and sets `bm_mare_finished = true`.
- **`returned` (`bm_mare_ending = "returned"`, `bm_mare_success = true`):**
  - `settled`: **3 Silver Marks** (30c) + 1 Gault job (`Insignia.credit(stats, "gault")`) + **`bm_ry_open = true`** + `bm_mare_goodwill = true` (warmer greeting from Mardred and Olof).
  - `law`: **4 Silver Marks** (40c) + 1 Gault job + **`bm_ry_open = true`** + `bm_mare_commons_cold = true`.
  - `paid`: **4 Silver Marks** (40c; 3 silver net after 1-silver fee) + 1 Gault job + **`bm_ry_open = true`**.
  - `brawled`: **3 Silver Marks** (30c) + 1 Gault job + **`bm_ry_open` stays `false`** + `bm_mare_commons_cold = true`.
  - Myles Buckman keeps his place at the yard.
- **`lost` (`bm_mare_ending = "lost"`, `bm_mare_success = false`):**
  - No coin, no Gault job credit, **`bm_ry_open` stays `false`**, and Myles loses his place at the yard, with brief closing prose and local aftermath.

---

## Scenery & World Memory

### Scenery Keys (all existing backdrops; no new art required)
- `remount_yard`: yard briefing and resolution beats
- `broadmead`: stream ford
- `overworld_hilly_road`: downland trail
- `generic_village_pasture`: shepherds' fold and commons pound
- `broadmead_villageheadhall`: Mardred's counter ruling

### World Memory Touches (wired in Steps 5 and 6)
- `Langston/broadmead/remount_yard.txt`: admit the player when `bm_mare_stage = 1` (routing to `bolted_mare bm_mare_yard`) or when `bm_ry_open` is true (inside-the-wall place/street layers plus hub option to `bm_ry_sgt`, unlocking Dagny's dormant talk and `horse_dealer.txt` `"bm"`).
- `Langston/broadmead/village_heads_hall.txt`: mention the posted sheet under `STRAYS AND BRANDS` while `bm_mare_stage = 0`; add one reactive line from Mardred once `bm_mare_finished` is true.
- `Langston/broadmead/crooked_halter.txt`: add one reactive line from Olof reflecting `bm_mare_goodwill`, `bm_mare_commons_cold`, or `lost`.
- `web/mygame/lorebook-langston.js`: add gated lines on `broadmead` and `dagny_marren` when `bm_ry_open` is true (and a brief note if `bm_mare_ending = "lost"`).

---

## State Variables (`startup_parts/58_broadmead_mare.txt`)

- `bm_mare_stage` (0..5)
- `bm_mare_ending` (`""` | `"returned"` | `"lost"`)
- `bm_mare_how` (`""` | `"settled"` | `"law"` | `"paid"` | `"brawled"`)
- `bm_mare_finished` (`false`)
- `bm_mare_success` (`false`)
- `bm_mare_reward_claimed` (`false`)
- `bm_ry_open` (`false`)
- `bm_mare_prep_groom` (`false`)
- `bm_mare_prep_shoe` (`false`)
- `bm_mare_has_halter` (`false`)
- `bm_mare_clue_led` (`false`)
- `bm_mare_clue_calm` (`false`)
- `bm_mare_clue_grievance` (`false`)
- `bm_mare_goodwill` (`false`)
- `bm_mare_commons_cold` (`false`)
- `bm_mare_from_dev` (`false`)

---

## Build Plan (Small Pieces)

1. **Step 1 (done):** Write this specification (`Resources & Quest/quests/broadmead_mare.md`).
2. **Step 2:** Create `startup_parts/58_broadmead_mare.txt` + rebuild `startup.txt`, add `"Myles"`, `"Buckman"`, `"Thistle"`, `"Magpie"` (check each against `names-data.js` / existing scenes) to `RESERVED`, add the notice block in `notice_board.txt`, add `broadmead_mare` to `quest-data.js`, add the row in `QUESTS.md`, register `bolted_mare` in `compile.js` `verifyFileName`, add `scenery.js` subplace rules, write Beat 1 (`bm_mare_notice_take` / `bm_mare_notice_need`) in `bolted_mare.txt`, and add a `dev_hub.txt` entry.
3. **Step 3:** Build Beat 2 (Remount Yard interior briefing and optional prep) in `bolted_mare.txt`.
4. **Step 4:** Build Beats 3 and 4 (ford/down tracking and shepherds' fold).
5. **Step 5:** Build Beats 5 and 6 (commons pound, Thistle confrontation and non-lethal brawl, Mardred ruling, ride-vs-lead return, Dagny resolution, `count_finished_broadmead_mare` + `character_progression.txt`).
6. **Step 6:** Wire permanent Remount Yard opening (`remount_yard.txt` inside-the-wall layers + `bm_ry_sgt`), reactive lines in `village_heads_hall.txt` and `crooked_halter.txt`, `lorebook-langston.js` lines, and a `"refresh": true` play-script suite (`settled`, `law`, `paid`, `brawled`, `lost`, `remount_yard_open`).
