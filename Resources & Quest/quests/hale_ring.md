*Moved word for word from `QUESTS.md` on 2026-11-16 (lines 64 to 74 of the old file). The index row is in `../QUESTS.md`.*

## The Hale Ring (`overworld/travel_events.txt`)

* **Origin:** A one-time 5% encounter roll while travelling in daylight or dusk through the River Road, Ashrun Mouth, or Longshade Edge. A bird drops a gold ring engraved `R. H.` into the roadside scree.
* **Objective flow:** The player may inspect the diamond with Perception or Investigation (DC 16; optional clue), then have Cassia Rell at the Bright Setting identify it as Ressa Hale's. Only after Cassia provides that lead can the ring be shown to Oswin Hale or returned to Ressa at the Split Pine in Timbermouth.
* **Resolutions:** Return it freely for Ressa's permanent 2-copper room rate; return it for 2 gold crowns; or sell it to Angel at the Open Hand on Lamp Stair for 4 gold crowns and 2 silver marks. Cassia identifies the owner but refuses to buy it. Selling is valid but ends the return route.
* **Player-facing state:** The quest is active only while the ring is carried. Cassia, Oswin, Ressa, and Angel receive direct player dialogue rather than answering a silent protagonist. Learning Ressa's name through Cassia unlocks her lore entry with only the information Cassia supplied.
* **Level progress:** Either return to Ressa counts as one completed quest. The sale does not.
* **Key variables:** `hale_ring_stage` (`"none"`, `"found"`, `"owner_known"`, `"returned_free"`, `"returned_paid"`, `"sold"`), `has_ressa_hale_ring`, `hale_ring_cut_known`, `hale_ring_cassia_spoken`, `hale_ring_oswin_spoken`, `tm_hale_ring_discount`.
