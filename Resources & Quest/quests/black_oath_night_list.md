*Moved word for word from `QUESTS.md` on 2026-11-16 (lines 360 to 371 of the old file). The index row is in `../QUESTS.md`.*

### The Night List
* **Scene File:** `port_valen/black_oath/black_oath_night_list.txt` (`night_list_briefing` through `night_list_failed`).
* **District:** Dredge-End, entered from the Duckboard Market rope-and-oil house at Night or Pre-Dawn.
* **Requirements:** `hask_associate_joined`, no active Night List, and no accepted list earlier that campaign day.
* **Briefing:** the player meets the unnamed woman upstairs during a real job briefing, not a social audience. Three stops exchange two purses and an oilcloth packet; the player may ask what is in the packet before accepting.
* **Route:** after the three hand-offs, three approaches resolve a street interception: STR (`Athletics DC 12`), DEX (`Acrobatics DC 12`), or CHA (`Persuasion DC 11`).
* **Radiant cadence:** after the introductory run, the woman upstairs can offer one fresh list each campaign day. The first always ends with the lane confrontation; later runs make a hidden 1-in-8 roll for it. `black_oath_night_list_count` records successful runs; the first success grants level-progress credit, while later successes pay 18 copper.
* **Failure:** `black_oath_night_list_resolution = "failed"`; no pay and no level-progress credit.
* **Variables:** `black_oath_keeper_met`, `black_oath_night_list_stage`, `black_oath_night_list_resolution`, `black_oath_night_list_paid`, `black_oath_night_list_count`, and `black_oath_night_list_day`.
