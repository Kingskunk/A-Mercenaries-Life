# Tar & Teeth — Millstow Village Quest Blueprint

**Sidebar ID:** `millstow_tar_and_teeth`  
**Main Scene File:** `web/mygame/scenes/hartwell/millstow/tar_and_teeth.txt`  
**Startup Part:** `web/mygame/scenes/startup_parts/64_millstow_cove.txt`  
**Tone & Pillar:** Witcher / D&D dark-fantasy contract — monster in the reeds colliding with desperate human smugglers; coin, sex, violence, and morally grey endings.  
**Pays Off Existing Millstow Rumors:**
- **Willem Halstead** (*The Turning Sail* — `ml_ts_asked_lanterns`): hooded lanterns moving low along the southern cove toward the Oatcroft reeds in the fog.
- **Merrit Appleby** (*The Gathering Hall* — `ml_gh_asked_trouble`): fishing skiffs returning with cleanly slashed drift-nets and splintered planking; lake-edge sheep bolting over a stone wall at night.
- **Orik** (*The Lake Landing* — `ml_ld_asked_hulls`): deep, clean-angled waterline gouges on two skiffs + six lengths of seasoned oak planking and a small keg of pine pitch stolen from his drying rack after sundown.

---

## 1. Cast & New Named NPC

| Name | Race / Look | Role & Personality |
| --- | --- | --- |
| **Sabine Kess** *(reserve `"Sabine"`, `"Kess"` in `names-data.js`)* | Human woman, early 30s; dark hair pinned up with a bone pin, sharp grey-green eyes, oiled canvas coat over dark wool, silver-hilted dagger at her hip, faint smell of pine tar and plum brandy. | Quartermaster for a small Dunmow smuggling crew running untaxed silver-ore and dyed wool across Azure Lake in black-tarred skiffs. Cynical, practical, unsentimental, and cornered. |
| **Smuggler Boatman** *(unnamed)* | Broad-shouldered lake hand with a hooked iron boat-pole (`hookman`). | Sabine's lookout and rower on the lower pier. |
| **Smuggler Crossbowman** *(unnamed)* | Lean, weather-chapped deckhand with a short crossbow (`archer`). | Watches the reed channel from the loft doorway. |
| **The Lake Jaw** *(monster)* | Twelve-foot armored aquatic ambush predator (`beast`): moss-dark ridged shell-back, wide serrated jaws, heavy muscled tail built to crack wooden strakes and drag sheep off the bank. | Claimed the southern cove's reed channel two weeks ago; attacks any hull that moves over its hunting water. |

---

## 2. Quest Spine (Branch-and-Bottleneck)

1. **Trigger (Organic Discovery — No Faction-Scanning):**
   - Unlocks once the player has heard **at least one** of the three Millstow rumors (`ml_ts_asked_lanterns`, `ml_gh_asked_trouble`, or `ml_ld_asked_hulls`).
   - **Entry A (Orik at the Lake Landing):** Orik shows a third fisherman's freshly splintered oar and offers **4 silver marks** from the boatmen's pool (plus Merrit's village chest adding **3 silver** = **7 silver** clean village pay) to track down what is gouging hulls in the southern cove and find who lifted his oak and pitch.
   - **Entry B (Direct Shore Track from Millstow Hub):** Once any rumor is heard (or Orik's job accepted), a new hub choice appears on `millstow.txt`: *"Follow the reedy shore track south toward the cove. [~20 min]"*. Works in any weather or hour (foul weather/fog gives a Stealth edge; never locks the quest out).
2. **Optional Village Prep (Downtime Prep = Tactical Edge, Never a Penalty):**
   - **Orik (`ml_tt_prep_orik`):** Hands you a **tar-soaked pine bundle** (`ml_tt_has_pitch`) and explains the crescent-shaped serrated bite marks — a **Lake Jaw** hates burning pine resin and smoke. Unlocks the fire-bait ambush edge in Beat 3.
   - **Willem (`ml_tt_prep_willem`):** Shares what late boatmen saw — the hooded lantern in the cove blinks **twice, low and slow**, before a skiff answers (`ml_tt_knows_signal`). Unlocks a clean deception/bluff entry at the boathouse.
   - **Merrit (`ml_tt_prep_merrit`):** Mentions Hartwell's road bailiff posted a **6-silver bounty** on the untagged Dunmow contraband skiff (`ml_tt_knows_bounty`). Unlocks extra leverage in the climax and raises the lawful payout.
3. **Beat 1 — The Reedy Southern Cove (Approach Beat):**
   - A half-sunk stone-and-timber boathouse sits on rotten pilings in the reeds; a hooded lantern glows behind its loft shutter. Below, a freshly patched black-tarred skiff rides beside the pier while a dark wake circles slowly in the rushes.
   - **Approaches:**
     - **Stealth** (`Stealth DC 12`, advantage in Fog/Rain/Storm): Slip along the catwalk unseen and overhear Sabine arguing with her crew (`ml_tt_overheard` -> advantage on opening social check or surprise edge if attacking).
     - **Lantern Signal** (requires `ml_tt_knows_signal` or `hooded_lantern` / `Light` cantrip): Blink the two-beat signal across the water (`Deception DC 11`, advantage if `ml_tt_knows_signal`). Sabine lowers the gangplank herself.
     - **Arcane Scout** (`Minor Illusion`, `Detect Magic`, or `Speak with Animals` on a shore frog/heron): Clean intel without risking detection.
     - **Walk straight onto the pier** (direct): Boatman levels a boat-hook; Sabine calls him off from the loft window because she needs a hired blade.
     - **Sabotage / Bait the Cove early** (`Survival` or `Nature DC 13`, or `Athletics DC 12` with meat/blood): Lure the Lake Jaw straight into smashing the smugglers' moored skiff and fighting their crew (`ml_tt_baited_cove`) -> skips straight to a bloody three-way aftermath against the wounded beast!
4. **Beat 2 — The Boathouse Loft (Sabine Kess's Pitch + Optional Intimacy Beat):**
   - Inside the dry loft: tarred crates with Dunmow stamps, Orik's six oak planks, and his half-empty pine-pitch keg.
   - Sabine admits to stealing the oak — *"Better than sinking forty marks of untaxed Dunmow silver-ore and fine wool in ten feet of mud"* — and lays out the real problem: the **Lake Jaw** killed one of her rowers three nights back and has pinned her crew inside the cove.
   - **Her Offer:** Kill the Lake Jaw so they can launch before dawn and keep Merrit in the dark. Pays **10 silver marks** (negotiable to **12 silver** with `Persuasion` or `Intimidation DC 13`).
   - **Optional Loft Hour (Brandied Calm Before the Hunt — Coin, Sex & Danger):**
     - While waiting for the beast's hunting wake to swing back near the pilings (`~1 hour`), Sabine pours Dunmow plum brandy beside the shuttered brazier.
     - **Option 1 — Share her blanket behind the crate stacks (`ml_tt_sabine_bedded = true`):** Grounded, unsentimental Witcher-noir intimacy — sharp heat between two people surrounded by black water and steel. Afterward, half-dressed while relighting her lantern, she lets slip where the key to her personal strongbox is tucked (`ml_tt_knows_chest = true` — pays off whether you keep faith or double-cross her!).
     - **Option 2 — Keep it professional over brandy (`ml_tt_sabine_respect = true`):** She points out a cask of cheap lamp-oil lashed to the lower pier piling you can crack open against the Lake Jaw (`ml_tt_pier_oil = true`).
     - **Option 3 — Skip the drink and go straight to the pier.**
   - **Alternative:** Refuse her deal and draw steel in the loft right now (lethal fight against Sabine + 2 deckhands first, then deal with the Lake Jaw).
5. **Beat 3 — The Hunt in the Reeds (Tactical D&D Boss Fight: The Lake Jaw):**
   - **Approach Beat before Combat (earned edges, never a mandatory penalty):**
     - **Pine-Pitch & Fire Bait** (if `ml_tt_has_pitch` from Orik, `ml_tt_pier_oil` from Sabine, `has_alchemists_fire`, `has_pitch_torch`, or `Fire Bolt` / `Burning Hands`): Ignite the tarred driftwood/oil slick as the Lake Jaw lunges -> sears its eyes and softens its hide (`ml_tt_beast_burned = true`, HP drops `34 -> 24`, fire terrain tile on the water, player keeps opening initiative).
     - **Boat-Hook Anchor Ambush** (`Athletics DC 13` or `Stealth DC 13` from the catwalk): Drive a spare iron hook into a gap behind its shell-plate and snub it to a piling (`ml_tt_beast_pinned = true`, player advantage + beast starts at tile 1).
     - **Meet it head-on from the broken pier** (direct fight, neutral opening).
     - **Failed approach check:** The Lake Jaw erupts beneath the planks with `combat_enemy_advantage = true`.
   - **Lethal Boss Fight Statblock:**
     - `combat_player_can_die = true`, `combat_is_nonlethal = false`, `combat_no_morale = true`, `combat_open_sky = true`.
     - **Authored Terrain:** `chokepoint` at `0` (narrow broken pier), `water` (or `fire` if burned) at `1` (cove shallows), `cover` at `2` (rotten pilings and reeds).
     - **Enemy:** `combat_lib_1 = "beast"`, name `"Lake Jaw"`, epithet `"the lake jaw"`, HP `34` (`24` if burned, `20` if weakened by cove-baiting smugglers), AC `14`, ATK `+5`, damage `1d8` slashing, range `1`.
   - **Victory:** You pry loose a foot-long serrated jaw-fang (`ml_tt_beast_dead = true`, `ml_tt_has_trophy = true`).
   - **Fleeing:** Ends on `fled_cove` (loss ending).
6. **Beat 4 — The Reckoning on the Pier (Climax Divergence — 5 Grounded Endings):**
   Once the Lake Jaw is dead, Sabine and her two deckhands step down onto the pier with lanterns and iron ready:
   - **Ending 1 — `smuggler_deal` (Pragmatic / Underworld):** Take Sabine's **10–12 silver marks** (warm/knowing parting if `ml_tt_sabine_bedded`), let them launch before dawn, and bring the Lake Jaw fang to Merrit & Orik saying it was *"only a beast in the reeds"* (+3 silver for the beast = **13–15 silver total**; Orik stays sour about his missing oak and pitch).
   - **Ending 2 — `village_clean` (Lawful / Civic — Bloodless or Forced):** Demand Sabine drop Orik's oak, pitch, and the untaxed Dunmow crates and row off empty-handed (`Intimidation DC 14`, advantage if `ml_tt_knows_bounty` or `ml_tt_beast_burned`). On success, she cuts her losses and vanishes into the fog; you return Orik's timber and deliver the seized crates + fang to Merrit for **10 silver marks** (village pool + Hartwell bounty) + Millstow goodwill (free hot meal & cider at The Turning Sail, Orik's lasting respect). On failure -> triggers the lethal smuggler pier fight!
   - **Ending 3 — `double_cross_blood` (Cold Mercenary / Violent):** Turn on Sabine and her crew on the pier (either before or *right after* pocketing her advance — with sharp, bitter lines from Sabine if you just left her blanket an hour ago). Lethal 3-enemy fight (`Smuggler Boatman` `hookman` HP 13 AC 12 ATK +3 tile 1; `Smuggler Crossbowman` `archer` HP 11 AC 12 ATK +3 tile 2; `Sabine Kess` `knifeman` HP 18 AC 14 ATK +4 `1d6` piercing tile 3). Victory -> loot the strongbox (**14 silver**, or **16 silver** if `ml_tt_knows_chest`), recover Orik's oak & pitch, and collect **5 silver** from Merrit & Orik (**19–21 silver total**, blood-soaked hands).
   - **Ending 4 — `cove_bait` (Dark Sabotage):** You baited the Lake Jaw into the pilings; the beast tore up the deckhands and drove Sabine off (or killed her) before you killed the wounded beast and stripped the loft (**14 silver** + optional return of Orik's oak & pitch for **+3 silver**).
   - **Ending 5 — `fled_cove` (Loss Ending):** Fleeing either fight lets Sabine torch the loft and escape across Azure Lake; Orik's timber is lost and Merrit closes the pool with no coin paid.

---

## 3. Startup Variables (`web/mygame/scenes/startup_parts/64_millstow_cove.txt`)

```choicescript
*comment ====================================================================================
*comment TAR & TEETH (Millstow village quest, hartwell/millstow/tar_and_teeth.txt)
*comment Stage 0: not started; 1: lead heard / job offered; 2: cove reached / Sabine met;
*comment 3: Lake Jaw dead, reckoning at pier or report pending; 5: resolved (ml_tt_finished = true).
*comment Endings (ml_tt_ending):
*comment   "", "smuggler_deal", "village_clean", "double_cross_blood",
*comment   "cove_bait", "fled_cove"
*comment ====================================================================================
*create ml_tt_stage 0
*create ml_tt_ending ""
*create ml_tt_finished false
*create ml_tt_success false
*create ml_tt_reward_claimed false
*create ml_tt_prep_orik false
*create ml_tt_has_pitch false
*create ml_tt_prep_willem false
*create ml_tt_knows_signal false
*create ml_tt_prep_merrit false
*create ml_tt_knows_bounty false
*create ml_tt_overheard false
*create ml_tt_baited_cove false
*create ml_tt_sabine_deal_rate 100
*create ml_tt_loft_rested false
*create ml_tt_sabine_bedded false
*create ml_tt_sabine_respect false
*create ml_tt_knows_chest false
*create ml_tt_pier_oil false
*create ml_tt_beast_burned false
*create ml_tt_beast_pinned false
*create ml_tt_beast_dead false
*create ml_tt_has_trophy false
*create ml_tt_smugglers_dead false
*create ml_tt_oak_returned false
*create ml_tt_willem_free_meal false
*create ml_tt_aftermath_orik false
*create ml_tt_aftermath_merrit false
*create met_sabine_kess false
```

---

## 4. Integration Map (Files Touched When Approved)

1. **New files:**
   - `web/mygame/scenes/startup_parts/64_millstow_cove.txt` (rebuild `startup.txt` via `node tools/build_startup.js`)
   - `web/mygame/scenes/hartwell/millstow/tar_and_teeth.txt` (main quest scene)
   - `tools/play_scripts/story/hartwell/millstow_tar_and_teeth_*.json` (play scripts covering prep, smuggler deal, lawful clean, double-cross blood, and flee endings — all with `"refresh": true`)
2. **Existing Millstow scenes:**
   - `web/mygame/scenes/hartwell/millstow/millstow.txt`: add southern-cove shore track choice once any rumor is heard (`ml_ts_asked_lanterns` / `ml_gh_asked_trouble` / `ml_ld_asked_hulls`) and `not(ml_tt_finished)`.
   - `web/mygame/scenes/hartwell/millstow/lake_landing.txt`: add Orik's job offer (`ml_tt_stage = 0`), Orik's pine-pitch prep (`ml_tt_prep_orik`), and post-quest aftermath dialogue (reacting to whether his oak & pitch came back).
   - `web/mygame/scenes/hartwell/millstow/turning_sail.txt`: add Willem's lantern-signal prep (`ml_tt_prep_willem`) and one free meal/cider perk after `village_clean` (`ml_tt_willem_free_meal`).
   - `web/mygame/scenes/hartwell/millstow/millstow_gathering_hall.txt`: add Merrit's Hartwell bounty prep (`ml_tt_prep_merrit`) and post-quest turn-in / aftermath dialogue.
3. **Data & Engine Registrations:**
   - `web/mygame/quest-data.js`: add `millstow_tar_and_teeth` sidebar quest object with dynamic `giver`, `goal`, and `clues`.
   - `web/mygame/lorebook-hartwell.js`: add `sabine_kess` person entry + update `millstow`, `orik`, `merrit_appleby`, and `willem_halstead` with quest aftermath paragraphs.
   - `web/mygame/names-data.js`: add `"Sabine"`, `"Kess"` to `RESERVED`.
   - `web/mygame/scenes/character_progression.txt`: add `ml_tt_success` to quest level-up progress tally.
   - `web/mygame/scenery.js` & `web/mygame/ambience.js`: map `hartwell/millstow/tar_and_teeth` (option to generate a dedicated **Southern Cove Boathouse** Day/Night backdrop pair, or reuse `millstow_lake_landing` + `generic_curing_shed` with `small_waves_river` overlay).
   - `compile.js`, `tools/gen_city_settlements.js` (add `tar_and_teeth.txt` to `millstow.files` if needed), and `Resources & Quest/QUESTS.md` (add row for `Tar & Teeth`).

---

## 5. Open Design Calls Before Wiring
1. **Backdrop Art:** Do you want a dedicated Day/Night backdrop pair for **The Southern Cove Boathouse** (reedy twilight/daytime half-sunk timber boathouse on Azure Lake), or should we reuse `millstow_lake_landing` (outdoors) and `generic_curing_shed` (loft interior)?
2. **Payouts & Difficulty:** Are the silver payouts (`10–12s` smuggler deal, `10s` lawful village + bounty, `19–21s` bloody double-cross) and enemy stats (`Lake Jaw` HP `34` / `24` burned, AC `14`; 3-smuggler crew HP `13`/`11`/`18`) right for the Western Vale level band?
3. **Sabine Kess's Fate / Follow-up:** Should Sabine be strictly a self-contained Millstow character, or should surviving (`smuggler_deal` / `village_clean`) leave a flag (`ml_tt_sabine_alive`) so she can show up later in **Dunmow** or **Oatcroft**?
