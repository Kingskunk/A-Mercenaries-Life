# Vane's Debrief

*Agreed with the user 2026-11-23, built the same day. The index row is in `../QUESTS.md`, "Story beats the sidebar does not list".*

## What it is

A story beat, not a quest: no sidebar entry, no ending to win or lose, no reward. Captain Vane closes the loop he opened in the summons ("I'll send for you when there's larger work"). Once the player has finished all three commanders' quests, he has them brought in and goes through how the work went: what went well, what could have been better, and one verdict on the whole. He ends by saying he will send for the player when he needs them again (see "After it" below).

## Scene file

`port_valen/vane_debrief.txt` (new), with the trigger hook in `port_valen/port_valen_random_encounters.txt`. The office is the contract office from the summons (`scenery_subplace "vane_contract_office"`).

## Trigger

1. **The three turn-ins.** Each of these, the first time it runs, calls one shared check:
   * The Rotten Rib, Ysolde's workroom (`pv_workroom_timber_turnin`, sets `ysolde_timber_turned_in`). Either ending.
   * Silt-Gate Contraband, Kestrel's watchtower (`pv_tower_silt_turnin`, sets `kestrel_slip_turned_in`).
   * Varren's Errand, the armory shed (`slasher_report`, sets `slasher_reported`). Arrested or escaped.
2. **The shared check** (`vane_debrief_check`): when all three flags are true and `vane_debrief_due_day` is still 0, it sets `vane_debrief_due_day` to `campaign_day + 1`. The order the quests are finished in does not matter. It is a fixed-value set, so a replay changes nothing.
3. **The escort.** On or after the due day, the next walk between Port Valen districts brings the squad. It hooks in at the top of `pv_re_roll`, the way Ulrich's courier does (`slasher_courier`), and it never depends on the random roll. The courier goes first when both are due on the same walk. Not at Night or Pre-Dawn (the captain keeps office hours); any weather (soldiers on an errand do not wait for the rain). It fires once: `vane_debrief_done` is set at the end of the scene, and a walk that brings the squad does not also roll a random encounter.

## The scene

1. **The squad.** Three or four Carrion soldiers, unnamed (the user, 2026-11-23: they may get a leader later, once the next main quest is decided). They find the player in the street, say the captain wants them, and walk with them to the compound. A short walk, not a fight and not an arrest: they are the player's own company. The walk costs time as a real walk does.
2. **The office.** Vane at his desk with the three reports in front of him. He reads from each, and each verdict names its source, because Vane only knows what crossed his desk:

| Quest | Source | Went well | Could have been better |
| --- | --- | --- | --- |
| The Rotten Rib | Ysolde's report | `rotten_rib_resolution = "blackmail"` with `rotten_rib_strikes = 0`: the oak back with Brant and nobody thrown out | One strike (`rotten_rib_strikes = 1`): won, but the draymen put the player out once first. `"failed"`: the ship launched on green wood. Ysolde still got the paper, and Vane says so. |
| Silt-Gate Contraband | Kestrel's word | Both names on the slip, face unseen | `silt_gate_face_seen`: the porters saw the player's face, so Dredge-End knows it now. Kestrel still has her names. |
| Varren's Errand | Varren, and the Watch sergeant who came to the gate | `slasher_resolution = "arrested"`: Trent in the Watch house, and the Watch thanked the company | `"escaped"`: Trent loose in Dredge-End, and two militiamen wounded on his way out. Vane does not soften it. |

   Optional extra lines, each one sentence, only where a flag shows it:
   * **Silt-Gate prep:** any of `silt_gate_winch_jammed`, `silt_gate_lamp_snuffed`, `silt_gate_illusion_active` or `silt_gate_lookout_spotted`: Kestrel noticed the work done before the work.
   * **Rotten Rib clue:** `rotten_rib_ledger_clue`: Ysolde noticed the player read the pillar before going in.

3. **The verdict.** One line on the whole, from how many of the three went well:
   * **Three:** clean work, the kind he can build on.
   * **One or two:** mixed. He names a loss first (Trent loose, then the timber still held), or else says people saw the player who shouldn't have.
   * **None:** he is blunt, but he still sent for the player, and says why.
4. **The promise.** "When I need you again, I'll send for you." No details: the next main quest is not decided, and this must not commit to one.
5. **The reply.** One choice, three options, recorded in `vane_debrief_reply`:
   * **"What's the larger work?"** (`"larger_work"`): "When it's ready, you'll hear it from me. Not before."
   * **Answering the verdict.** If anything went less than well: **"That one's on me."** (`"owned"`), and he respects owning it in one line. If everything went well: **"My commanders made it easy."** (`"modest"`), and he sees through it, dryly.
   * **A nod, and out** (`"silent"`): he is already reaching for the next dispatch, as at the end of the summons.

   No coin, no stats. The reply is kept so the next main quest can call back to it.
6. **Back out.** The player leaves the compound for the Port Valen hub.

## Writing notes

* Read `NARRATIVE_GUIDELINES.md` first. Vane's voice is the summons: short, dry, blunt, no speeches. The player is a hired hand, weapon- and class-agnostic.
* Vane talks about what happened, never about checks or numbers ("thrown out once", not "a failed roll").
* The soldiers are "the Carrion soldiers" or by a detail (the one with the split lip), never named.

## After it

`vane_debrief_done` is for Vane's next summons to check, which sends for the player again once a set time has passed and a requirement is met (not built: both wait on the next main quest). A repeatable job line per commander was planned and dropped (the user, 2026-11-23).

## Variables (new)

`vane_debrief_due_day` (0 until set), `vane_debrief_done`, `vane_debrief_reply` (`"none"`, `"larger_work"`, `"owned"`, `"modest"`, `"silent"`).

## Play scripts

`tools/play_scripts/story/port_valen/vane_debrief_*`: one per verdict (`clean`, `mixed_blemish`, `mixed_trent_loose`, `mixed_timber_lost`, `none_clean`, covering all three replies), the hook (`hook_fires`, `hook_waits_night`, `hook_waits_due_day`), and Kestrel's turn-in as the last of three (`last_turnin_sets_due_day`) and as the second (`two_turnins_no_due_day`). All run with refresh.
