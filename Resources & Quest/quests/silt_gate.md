*Moved word for word from `QUESTS.md` on 2026-11-16 (lines 146 to 173 of the old file). The index row is in `../QUESTS.md`.*

## Chapter 3: Port Valen Municipal Quests (`port_valen.txt`)

### Quest 1: The Silt-Gate Contraband
* **Scene File:** `port_valen_dredge_end.txt` (`pv_dredge_silt_gates`, `pv_silt_gate_stakeout`, `pv_silt_gate_squeeze`); Kestrel's side in the watchtower (`pv_tower_silt`, `pv_tower_silt_turnin`) and Voss's desk at the Harbor Quayside (`pv_quays_voss_briefing`, `pv_quays_voss_chat`) in `port_valen.txt`.
* **District:** Dredge-End (Low drainage flume & tidal vault).
* **Briefing:** Dockmaster Voss reports uninspected highland shear-steel and illicit peat-spiritus entering through the tidal flap-valves during midnight flood tides. He's a customs official, not a Watch officer — he can catch corruption near his docks and escalate it hard, but every consequence he promises routes through "the Watch captain," never his own authority.
* **Starts with Kestrel (converted 2026-10-06, like the Rotten Rib):** Vane tells every player to go up the watchtower after dark. There, "Tell her Vane said she has a use for you" (`silt_gate_quest_stage = "unstarted"`, sets `kestrel_silt_briefed`) is her brief: the Watch's night sergeants are paid to walk the far bank, she needs the broker's own list to keep them in her pocket, the player should take Voss's job as cover, and she pays 5 silver for both names. Voss's briefing button needs `kestrel_silt_briefed`; before that he only talks traffic.
* **Voss:** still gives the quest, but is never told the result and is never paid. Three days after the player hands the slip to Kestrel, his chat says Sergeant Kray, who never noticed him in eleven years, has started saluting him and the men on the far bank have turned polite, though it is no better watched, and that he has decided not to ask (Kestrel is keeping the sergeants quiet, not spending them) (`silt_gate_turned_in_day`, `silt_gate_voss_told`).

#### Objective Flow:
1. **Daytime Recon (`pv_dredge_silt_gates`):**
   * Map roofline blind spots and spot the lantern-boy (`silt_gate_lookout_spotted = true`).
   * Jam the street-level storm-winch counterweight cog (`silt_gate_winch_jammed = true`).
   * Study high-tide charcoal marks on the stone vault.
   * `[Cantrip: Mage Hand]` - Remotely wedge an iron bolt into the winch cog from the canal shadows.
2. **Night Stakeout (`pv_silt_gate_stakeout`):**
   * Wait for night flood tide (`[~2 Hours]`).
   * `[Cantrip: Guidance]` - Divination focus buff (`+1d4` to next check).
   * `[Cantrip: Prestidigitation]` - Snuff the platform's fish-oil lamp from afar (`silt_gate_lamp_snuffed = true`, advantage on the squeeze).
   * `[Cantrip: Minor Illusion]` - Project false patrol footsteps down the north cut (`silt_gate_illusion_active = true`, advantage on the squeeze).
3. **The one ending (`pv_silt_gate_squeeze`):** pin the broker for the names on his payroll. `[CHA DC 12]` intimidate, `[STR DC 12]` search his coat, `[WIS DC 11]` offer him a way out, `[Cantrip: Thaumaturgy]` (`CHA DC 10`), `[Spell: Dissonant Whispers]` (1 Bard Slot, automatic). Advantage if the winch is jammed, the lamp snuffed or the illusion running. **The player always gets the slip with both names** (a one-name result was removed 2026-10-06 as pointless). A failed check costs something else: `silt_gate_face_seen` is set, the porters see the player's face, and the player loses an hour hiding in a cellar drain. Either way `silt_gate_resolution = "leverage"` and `has_silt_gate_payout_slip = true`. The crates stay on the platform.
4. **Turn-in (`pv_tower_silt_turnin`):** "Lay the broker's payout slip on the bench." Counts as one of Kestrel's trust moments and 5 silver, always; she adds a line about keeping clear of Dredge-End if `silt_gate_face_seen`. Sets `kestrel_slip_turned_in`, `kestrel_watch_leverage`, `silt_gate_bounty_claimed` and `silt_gate_turned_in_day`.

* **Removed 2026-10-06:** the ambush-for-the-Watch branch (12 silver from Voss), the parley-and-bribe branch (25-30 silver hush money), the "failed" ending that only they could reach, Voss's report and the slip choices at his desk (give it to him, or lie and keep it), and the Captain Vane turn-in (`port_valen_vane_slip_turnin`, `vane_watch_leverage`, now `kestrel_watch_leverage`). The stats sheet and the Silt-Gates lorebook entry carry the one ending.
* **Why only the names:** Kestrel wants the sergeants where they are, as a door that opens when she knocks; a lockup or a bounty would spend them. The payout slip can only be handed over once.
