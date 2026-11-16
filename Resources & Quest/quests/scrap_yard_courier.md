*Moved word for word from `QUESTS.md` on 2026-11-16 (lines 341 to 359 of the old file). The index row is in `../QUESTS.md`.*

### Hask's Real Money: The Scrap Yard Courier Round
* **Scene File:** `port_valen_dredge_end.txt` (`cut_sheds_hub`, `scrap_vetting_approach`, `scrap_vetting_pitch`, `scrap_vetting_run`, `scrap_vetting_resolve`)
* **District:** Dredge-End (the Boat-Sheds Scrap Yard).
* **Design intent:** a Minor/Street Task (`QUEST_DESIGN_RULES.md` §6) that turns a repeatable day-job into a recruitment hook without a faction-shift climax, and deliberately without the full three-branch Mercenary Dilemma structure the bigger district quests use. Full design writeup: `quest/DREDGE_SCRAP_VETTING_PLAN.md`.
* **Origin:** no new quest-giver — the scrap dealer makes the offer after six sales (`cut_scrap_sold_count`) and names himself (Hask) for the first time at that beat. Since each successful five-hour mud-scavenge yields one sale, this takes six successful trips.
* **Briefing:** Hask connects the player to "a man he does business with" who needs a runner to carry parcels and word between people around the quarter who'd rather not walk the lanes themselves. **The player never learns this is Black Oath work** — nothing carried is illegal or dangerous, and the text never names the association.
* **The round (`scrap_vetting_run`):** one archetype choice resolves the whole afternoon (one roll standing in for several stops — the market stalls, the Gangways rail, the foot of Lamp Stair):
  * **STR** (`DC 12`) — keep a hard, steady pace between every stop.
  * **DEX** (`DC 12`) — take the fastest cuts and never double back.
  * **CHA** (`DC 11`) — keep every hand-off brief and businesslike.
  * Failure is fail-forward with no permanent penalty: nothing carried is illegal, so there's no authority to get more alert and no reason to raise the DC or lock the player out — a fumbled round just pays less and doesn't count toward the trust counter.
* **Economics:** 12 copper on a successful round (partial 4 on failure), once per `campaign_day` (`scrap_vetting_day`) — a real day job (6 hours) rather than an errand, sized so the courier round and wading together eat most of the 14-hour working day if both are run the same day.
* **The repeatable loop:** once the first round resolves, `hask_courier_unlocked` opens a standing "Ask Hask if there's a round to run" option at `cut_sheds_hub` — same mechanics as the first round.
* **Associate reveal:** after six successful rounds, Hask names the employer as the Black Oath and offers to put his name behind the player. Accepting sets `black_oath_status = "associate"`. This is named paid work, not a sworn oath; Hask puts the player forward for a night contract upstairs. Refusal is reversible and leaves the ordinary courier loop open.
* **Outlaw origin:** carries the existing six-hundred-mark theft and blood bounty (`origin_desc`). Hask's sponsorship may create a ward-level opening for paid work, but it does not erase the debt or make the rest of the organization forget the dead collector. (`black_oath_heat` was removed 2026-11-09 — it never gated anything; the bounty is tracked by the origin text alone.)
* **The rope-and-oil house:** by day it sells cordage, hooks, lamp oil, tallow and sail patches. After dark, its upper room is a Black Oath contact point for local work. The player is not told whether it is a headquarters or how it fits into the wider organization.
* **Lore and log:** Hask has a gated people entry in `lorebook-port-valen.js`; the repeatable day-job remains out of `quest-data.js`, matching Crane Three's treatment.
* **Variables:** `cut_scrap_sold_count`, `scrap_vetting_offer_seen`, `scrap_vetting_quest_stage`, `scrap_vetting_day`, `hask_courier_unlocked`, `hask_courier_count`, `hask_associate_offer_seen`, `hask_associate_joined`, and `black_oath_status`.
