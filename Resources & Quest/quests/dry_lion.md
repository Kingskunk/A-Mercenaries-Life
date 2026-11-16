*Moved word for word from `QUESTS.md` on 2026-11-16 (lines 174 to 187 of the old file). The index row is in `../QUESTS.md`.*

### Quest 2: The Dry Lion (Middle Ward)
* **Scene File:** `port_valen/MiddlewardQuest/dry_lion.txt`; the physical entry points, services, and aftermath live in `port_valen_middle_ward.txt`.
* **District:** Conduit Square, Mother Marda's communal bakehouse, the Conduit Wash-House, and the tenement yard off Locksmiths' Close.
* **Entrance:** On Greyday, during Morning or Midday, after the player has visited both Marda and Merrin, one bronze lion-head at the public fountain coughs brown grit and falls dry. The hot-room can subsequently repeat the lead as a one-shot rumor.
* **Objective Flow:** Inspect the fountain fittings, trace the brown seep to the yard, or coordinate valve tests with Marda and Merrin. Each route exposes an old unlisted branch; deeper evidence and local support make a temporary registration possible.
* **Setback:** The yard's leaked water has undermined the paving. The crack opens as the clerk prepares to close the line, forcing an immediate choice.
* **Resolutions:**
  1. **Seal the branch:** restores the public fountain and awards 4 Silver Marks, but leaves the yard without its tap (`dry_lion_resolution = "city_sealed"`).
  2. **Repair it quietly:** supports both the public line and the yard; Mending, a repair check, or a brace can hold the joint. A failed repair closes the line for two days (`"hidden_repaired"` or `"failed"`).
  3. **Register it temporarily:** with strong evidence, clerk Tomas Saye puts the branch on the roll pending inspection (`"line_registered"`).
* **Repair Kit:** The fitting and hand-repair checks mark `check_task_type = "repair"`; the shared dice engine grants the Repair Kit's automatic +1 only on these Investigation/Sleight of Hand checks.
