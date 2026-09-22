# Plan: Dredge-End Expansion — Places First (REVIEW DRAFT)

> **Update:** Sal, Hobb, the Rusty Anchor and both tiers of Sal's quest line (the Hobb errand and the Low-Water Box) were removed entirely — no rewrite, no placeholder. Every mention of them below is historical record of what was true when this plan was written and built, not a description of the live game. The Boat-Sheds and Scrap Platform area itself stays (the scrap dealer and the smith), just without Hobb. Whether anything replaces the Rusty Anchor's map slot is an open question for a future pass.
>
> **Status:** IMPLEMENTED (all seven areas, the texture pass and the light retcon). Kept as the design record. Where the built version differs from the draft below, see "As built" at the end of section 5. **Scope changed:** you want to test how the place feels in the game before adding quests, so this plan builds **locations, prose and small things to do** only. The only quests in Dredge-End stay the two tiers of Sal's line (already built).
> **Goal:** Turn Dredge-End from one district page with two things in it (the Rusty Anchor and the Silt-Gates) into a walkable place with a weekly rhythm and a warmer, less muddy feel, ready to hold quests later.
> **Voice and rules:** `.agents/rules/narrative_guidelines.md`, `quest/QUEST_DESIGN_RULES.md`, `quest/GAMEPLAY_MECHANICS_RULES.md`. Section 9 checks this plan against them.

---

## 0. Review Notes (read this first)

1. **What is in scope.** The tide rule, the texture pass on the existing prose, and seven new areas with their locations, each offering a few small things to do (section 5). No new quest, no new faction system.
2. **What is kept.** Sal's two tiers stay exactly as built: the Hobb errand (the runner appears there, once, as scenery and an obstacle) and the Low-Water Box. Nothing new attaches to the runner.
3. **What was removed and where it went.** The Small Paper quest chain, the runner as a job-giver, the Tally standing tiers, the area quests and the Bookkeeper reveal are all parked in the short Appendix (section 8), so the design is not lost. Nothing in phases 1 to 3 depends on them.
4. **Odalys Crake.** She stays the Tally's boss, "the Bookkeeper", but with no quests there is nothing to reveal her, so she gets **no lorebook entry and no prose for now**. The name is recorded in the Appendix.
5. **Loose end this plan still fixes.** The tide is described two different ways: the Silt-Gate quest treats it as day and night (out from Morning to Dusk), while the Rusty Anchor waits for an "ebb" measured in hours. Section 4 unifies them into one derived value. (The other loose end, that `black_tally_rep` has no readers, is left alone: it only mattered for the parked standing tiers.)
6. **Constraints kept for later.** Not engaging with the Tally never locks anything or costs anything with another faction, and other factions only react once they have seen and been told who the player is. Any quest added later follows branch-and-bottleneck and player-initiated offers.

---

## 1. What Is Canon Today (do not contradict)

* **The place** (`port_valen_dredge_end.txt:27`, lorebook `dredge_end`): the cobblestones give out at the drainage cut. Greased timber **duckboards** and sunken **mud tracks** below the river's high-water mark. A low **silt basin** with waterlogged timber **tenements on black-greased pilings**, joined by **rope gangways** over canal trenches. So it is a walkable shanty district with water in it, not one big pier. (The wording does not say what the ground itself is made of. Section 3.1b proposes making it broken stone lanes and packed cinder, with planks only over the wettest patches.)
* **Things already placed:** the drainage cut, the seawall, the **Silt-Gate culvert** (flap-valves, a broker, porters, a punt), the **Rusty Anchor** (three barges tied end to end), **Hobb's oar-shed** on stilts three doors down the cut, an alley shrine, a scrap dealer on a timber platform, a boat-shed, a smith, flophouse cellars, a hatch to a flooded cellar.
* **Ambient people, by weekday** (`port_valen_dredge_end.txt:56-91`):

| Day | Ambient life |
| :--- | :--- |
| Marketday | eel-seller shorting her scale, wharf boys lifting the tailor's apprentice's purse, a healer-calling woman who is really a lookout, a turnip punt hiding a strongbox |
| Tideday | grapple boatman hauling parcels off bridge pilings, a diver slipping into a flooded flophouse |
| Hallowday | the friar's charity broth at the alley shrine, men checking faces against vellum, an acolyte selling temple silver to a fence |
| Greyday | a man pounding doors with a bundle of debt-writs, rooftop runners sliding parcels across alley gaps |
| Forgeday | scrap dealer, chain with proof-marks rasped off, a smith's hammer signaling an empty channel |
| Ironday | a **collector's runner** threading the footbridges with a wax tablet, checking names |
| Hearthday | the district empties early; two men still checking names at the footbridge |

* **The Black Tally** (lorebook `black_tally`): rules by paper, not blades. Promissory notes, labor liens, interest books on every punt, eel-trap and stilt. Truce with the city above: the Watch stays off the duckboards, the Scales buy their distressed paper. Collectors work the footbridges checking faces against wax tablets. Its Silt-Gate line pays Watch sergeants six silver marks a Marketday. **Collector Garrick Riker** has been skimming his own tribute, covered by an eleven-year debt to Sal.
* **The box** (`pv_anchor_the_box`): the notes are "in oilcloth packets tied with waxed cord, in an order somebody has been keeping for years." An eel-seller's note (one mark eleven, four years old, its witness since dead), an oar-maker's (two marks, a margin note in a different hand about a boat he no longer owns), a tailor's apprentice (six copper), and a woman who signs with a mark.
* **Lyra** (`alderford.txt:2138`): fled Dredge-End three winters ago "barefoot through freezing canal silt with half a sack of barley meal and two bailiff hounds baying behind." Alderford also mentions missing a Tally payment meant "waking up chained to an ore barge."
* **Tide today:** derived from `time_period` in the Silt-Gate quest (out Morning to Dusk, in at Night). The Anchor's low-water wait uses separate hour math.
* **Time rules** (rules section 12): Dredge-End is 60 minutes from the compound. An activity entered inside a district costs 15 to 25 minutes once on entry. Dialogue and menu loops are free. Multi-beat set-pieces cost 30 to 45 minutes per beat.
* **Built last session:** the Hobb errand ("A Bowl for the Oar-Maker", `anchor_errand_*`), the runner (unnamed, has your face if you fail), the Anchor's two-tier structure and the Forgeday re-offer.

**Gaps this plan fills:** the prose is one-note (it leans on mud and damp words, see 3.4), there are no ground-level places beyond the Anchor and the flume, no reason to walk the district, and the weekday life is only ever scenery.

---

## 2. The Shape of the Expansion (one page)

Three layers, built in this order. Each works without the ones after it.

| Layer | What it is | Phase |
| :--- | :--- | :--- |
| **A. Feel** | One derived tide value, plus the texture pass that removes the mud-word stacking from the existing prose. | 1 |
| **B. Places** | Seven new areas, each an option on the existing district page, each with its own prose (by tide, weather and weekday) and a few small things to do. | 2 and 3 |
| **C. Hooks for later** | Environmental tells left in place (the man at the foot of the outside stair, the doorkeeper at the bawdy house, the debt-writ man on Greyday) that a future quest can use. Nothing is built behind them. | with B |

```
District page (existing)
  ├─ Rusty Anchor (built)  ── Hobb errand, Low-Water Box (both built)
  ├─ Silt-Gate channel (built)
  ├─ Duckboard Market ─ chandler's shop, stalls, foot of the outside stair
  ├─ Upper Gangways
  ├─ Boat-Sheds and Scrap Platform ─ Hobb's shed, scrap dealer, smith
  ├─ Dredge Landing            (low water only)
  ├─ Lamp Stair ─ dice cellar, pawnbroker, hedge-doctor, drinking house, bawdy house (outside only)
  ├─ Alley Shrine
  ├─ Flooded Lower Steps       (low water only)
  └─ Travel (built)
```

---

## 3. Geography: How Dredge-End Is Laid Out

### 3.1 Same shape as every other district (no second hub)

An earlier draft of this plan invented a second "walk the cut" hub. That was wrong: it contradicts every other district, and it came from misreading the "living hub" rule (that rule only bans bulleted location catalogs *inside* the story text). Here is how the districts actually work today:

* **Harbor Quayside** (`port_valen_harbor_pois`): arrival prose, then one `*choice` of places, each with a time tag ("Push into The Cleaved Keel... [~20 min]", "Walk the cargo quay... [~15 min]", "Step down to the shipwrights' ways... [~15 min]", "Walk out the long pier... [~15 min]").
* **Middle Ward:** the same shape, with about five places at `[~5 min]` to `[~10 min]`.
* **Dredge-End today:** the same shape already (the Rusty Anchor `[~15 min]`, the Silt-Gate channel `[~15-45 min]`, and the way out).

**So the expansion adds each new area as one more option on the existing Dredge-End district page.** No new hub, no new navigation pattern.

* Each option carries a time tag, `[~15 min]` for an area, matching the Quayside and the Anchor.
* An option is only offered when the place is open right now (tide, hour or weekday). A closed place is not shown, with no filler button (rules section 7, "no barrier bloat").
* The arrival prose stays the place where the district's atmosphere, weather and weekday life are written, and section 3.4 changes how.
* **Option count.** After phase 2 the district page shows the three new areas, the Anchor, the Silt-Gate channel and the way out: six buttons at most, and tide, hour and weekday hide some of them. After phase 3 it is up to ten at most, so a typical visit shows six to eight. If that is too long when you playtest, the fallback is to fold the rare places into a single option that names the reach ("Go along the cut to the boat-sheds and the scrap platform"). Only do that if the playtest shows the list is too long.

### 3.1b What You Walk On (proposed change to the canon wording)

**The problem.** The game's wording today is "greased timber duckboards and sunken mud tracks". Read literally, that is boards over mud and water, and the plan followed it. That is not the district you want: it should have **real ground, made of dirty stones**, with boards only where the ground is too wet to walk. So the plan proposes clarifying the canon. **This changes existing wording, so please confirm it (section 11).**

**Proposed ground.** Dredge-End is built on a low basin, and the dredgers have spent generations dumping what they pull out of the cut onto its banks. So the ground is mostly *made ground*:

| Ground | What it is | Where |
| :--- | :--- | :--- |
| **Broken stone lanes** | Old paving and salvaged rubble, laid by residents, sunken and uneven, slick and dirty, with kerbs half buried. Cobbles patched with slabs, brick ends and chunks of scrap stone. | Most lanes: the market street, the way to the boat-sheds, the paved shelf under the seawall |
| **Packed cinder and dried spoil** | Black dredge spoil and forge ash rammed hard. Dry and dusty in fair weather, greasy after rain. | Banks along the cut, the Dredge Landing, yards between sheds |
| **Planks (duckboards)** | Laid only over the lowest, wettest patches and along canal edges. | Low corners, the flooded lower steps, canal-side walkways |
| **Stilts and gangways** | Tenements and sheds standing on pilings at the canal edge, joined by rope gangways. | Along the trenches, the Upper Gangways |
| **Brick and stone** | Seawall, culvert vaults, the smith's floor. | The seawall shelf, Silt-Gates |

**What it changes in the plan.**

* The city's paving stops at the drainage cut. Past it the lanes are **broken stone and packed cinder with planks over the wet patches**, not planks over water. (This is close to the canon line "the cobblestones give out at the drainage cut", which now means the *clean* paving gives out.)
* **Duckboard Market** keeps its name because the low market ground is where the planks are laid, but it is a stone-and-cinder street with plank patches, not a pier.
* **Lamp Stair** becomes a proper **flagged street** on the higher ground under the seawall, reached by a short flight of stone steps (which is why it is a "stair"). It is not a boardwalk.
* The tide still floods the low corners and the lower steps, and the boards and stilts still exist. They are one part of the district and not the whole of it.
* The wording that has to change is listed in 3.1c.

### 3.1c The Retcon: What Existing Text Changes

You asked me to consider a retcon. It is small, because only **seven lines** in the game use the "duckboards and sunken mud tracks" wording. Nothing in a quest, a check or a variable depends on it.

| Where | Current wording | Proposed change |
| :--- | :--- | :--- |
| `port_valen_dredge_end.txt:27` (arrival paragraph) | "The cobblestones give out at the drainage cut, replaced by greased timber duckboards and sunken mud tracks that run below the river's high-water mark." | Rewritten in the texture pass (sample in 3.4): the city's paving stops at the cut, past it broken stone and packed cinder with planks over the wet patches, below the high-water line. |
| `lorebook-port-valen.js:598` (`dredge_end` base text) | the same sentence | The same rewrite, so the lorebook and the arrival page agree. |
| `lorebook-data.js:579` (`black_tally`) | "the Port Watch stays off the canal duckboards" | "stays off the canal lanes" |
| `port_valen.txt:565` (a Harbor rumor) | "From Dredge-End's low canal duckboards" | "From Dredge-End's low canal banks" |
| `port_valen_dredge_end.txt:998` (button) | "Step back out onto the Dredge-End duckboards." | "Step back out onto the stone lanes." |
| `port_valen_dredge_end.txt:11` (comment) and `:1489` | "back to the duckboards"; "the duckboards stop knocking against the pilings" | Left as they are. Planks still lie along the canal edge, so this line stays true. |

**Three levels of retcon, your pick.**

* **A. Light (recommended).** Only the lines above. Keep the name Dredge-End, the silt basin, the high-water line, the canals and the Silt-Gates. The district is stone and cinder lanes with planks and stilts where it is wet. Cost: about six one-line edits and the paragraph rewrite that the texture pass already does.
* **B. Heavier.** Make Dredge-End an old stone quarter that sank as the basin silted up, with canals cut through it and a few pilings. More character, but it changes what the Silt-Gates and the Anchor's barges mean, so it touches more scenes.
* **C. None.** Leave the wording, and read "duckboards and mud tracks" as the wet lower half only, with the stone lanes as the higher half that was never written down. Cheapest, but the arrival paragraph still says the ground is boards and mud.

### 3.2 The areas (the Anchor, which exists, plus seven new)

Every area is grounded in something the canon already describes. "Open" uses the tide rule in section 4. What each place actually offers the player is in section 5.

| # | Area | What it physically is | Open when |
| :--- | :--- | :--- | :--- |
| 1 | **The Rusty Anchor** *(built)* | Three barges, taproom, hatch. | Always |
| 2 | **Duckboard Market** | The market street: a stone-and-cinder lane with planks over its wet patches, awnings, punts nosing in from the canal side. Holds the chandler's shop and an outside stair (see 3.2b). | Day. Busiest Marketday. Dusk and night, a few stalls only. |
| 3 | **The Upper Gangways** | Rope bridges and stilt landings over the trenches, the tenements' upper storey. | Always, but at night only by lantern. |
| 4 | **The Boat-Sheds and Scrap Platform** | Sheds on stilts along the cut (Hobb is here), the scrap dealer's yard where salvaged stone and chain are stacked, the smith's bench. | Day. Forgeday is scrap and chain day. |
| 5 | **The Dredge Landing** | Where dredgers haul silt out of the cut: barges, grapples, the pit-mounds of black spoil. The district's namesake. | Low water only (Morning to Dusk). At high water the landing is awash and closed. |
| 6 | **Lamp Stair** | The seedy stretch: a flagged street on the higher ground under the seawall, reached by a short flight of stone steps, lit by red-shaded lamps. Bawdy house, gambling cellar, pawnbroker and fence, an all-night drinking house, a hedge-doctor's stall. Dry ground, because it stands above the flood line. | Lively at Dusk and Night. By day it is shuttered, and only the pawnbroker, the fence and the hedge-doctor are open. |
| 7 | **The Alley Shrine** | A timber arch smeared with tallow, with a veiled figure of Saint Althea (the mender the frontier prays to); the friar's broth line on Hallowday. | Day. Hallowday is the broth line. |
| 8 | **The Flooded Lower Steps** | Stair landings and cellar flophouses that go under at high water. | Low water only. |

Phase 2 builds areas 2, 3 and 4. Phase 3 builds areas 5, 6, 7 and 8. You want to test the feel of the place before adding quests, so the plan pauses after phase 2 (section 10).

### 3.2b Locations Inside an Area

An **area** is a place the district page offers (like the Quayside's Iron Wharves). Inside an area, a short area page can offer **locations** (like the Iron Wharves' slipway, seasoning sheds and clerk's office).

| Area | Locations inside it | Notes |
| :--- | :--- | :--- |
| Duckboard Market | the eel-seller's awning (Marketday), the tailor's stall, **the chandler's shop**, the foot of the outside stair | The chandler sells candles, rope and lamp oil. The outside stair climbs to a room over the shop. **The room is not built now.** A man sits at the foot of the stair and the door at the top is shut. That is an environmental tell only, so a future quest can open it without rewriting the market. |
| Upper Gangways | a lookout landing, a rooftop washing line, a rope crossing | Mostly movement and view. |
| Boat-Sheds and Scrap Platform | Hobb's shed, the scrap dealer, the smith's bench | Hobb's shed is where the Hobb errand already happens. |
| Lamp Stair | **the bawdy house** (working name "The Blue Door"), **the dice cellar**, the pawnbroker and fence, the all-night drinking house, the hedge-doctor's stall | See 3.2c. |

### 3.2c Lamp Stair (the seedy stretch)

A poor district has a seedy quarter, and Dredge-End is missing one. This is it.

* **Name.** Lamp Stair on the map and in the lorebook (a link phrase must be a full proper name). Locals can say "the Red Lamps" in dialogue as slang. The new names avoid the Middle Ward's Smiths' Row and Lantern Lane.
* **Where and what.** A flagged street on the higher ground under the seawall, reached by a short flight of stone steps, above the flood line, so it stays dry when the lower district does not. Red-shaded lamps over the doors. Cheap perfume over the tar, a fiddle, laughter through shutters, painted cloth. It gives the district a warm, bright, dry place, which also helps the texture pass in 3.4.
* **Hours (ambient sound obeys operating hours).** By day the lane is shuttered and sleepy: a pawnbroker and a fence with their doors open, a hedge-doctor at her stall, a woman sluicing a doorstep. From Dusk through Night it is lit and loud.
* **What is in it.**
  * **The bawdy house** (working name "The Blue Door"): a house of adult workers who owe the Tally for their rooms, their clothes and their protection. It is a **place and a set of debts**, not a scene. For now it is seen from the outside only: the door, the lamp, a doorkeeper, and what people say about it. No interior is built.
  * **The dice cellar:** a gambling den. The game already has dice (knuckle-bones at the Anchor's hearth, Cutter's table at the Keel), so this reuses that shape.
  * **The pawnbroker and fence:** modest buying and selling, and the acolyte's unrecorded tincture vials from the Hallowday ambient prose.
  * **The all-night drinking house:** a rougher room than the Anchor, for a different crowd.
  * **The hedge-doctor's stall:** poppy tinctures and fever cures. Magic is rare and distrusted, so she is a herbwife and nothing more.
* **How the Tally is there.** Every house and cellar owes it paper. That is what puts the Lamp Stair inside the Book: it is where the Tally's money is *made*, and where its debts are most personal. The Tally does not run the houses. It holds their notes.
* **Content approach (please confirm, section 11).** Adult characters only. Told in the same table-facing voice as the rest of the game, with the material kept **off the page**: no scenes are played out. The stories are about debt, contracts, protection, who owes whom, and people trying to get out from under the paper. Nothing exploitative is written for effect.
* **Tide.** Not affected (it stands above the flood line). Night is the busy time, and at high water the lamps show in the black water below the steps.
* **Unlock.** Lorebook entries open at first visit. No faction cost or lock of any kind (your constraint). The area is simply another place the player may walk into.

### 3.3 Travel and time inside the district

Walking between areas uses the "activity entered inside a district" tier: **15 minutes once on entering an area**, free thereafter. There is no new travel matrix. The district as a whole stays 60 minutes from the compound, unchanged.

### 3.4 Texture Pass: Making Dredge-End Less Muddy

**The finding.** The canon geography is fine: a low district with stone, brick, boards and roofs (see 3.1b for what the ground is). The problem is the prose. The arrival paragraph alone stacks mud, silt, waterlogged, stagnant, brackish mud, rotting, wet, greased and black-greased. Across the Dredge-End scene the counts are about silt 17, wet 14, black 19, damp 9, rot 8, mud 7, sludge 6. Nearly every weather and time-of-day variant also lands on "dark water". So every visit reads the same, whatever the area.

**The approach.** Say the district is low and damp **once**, in the arrival paragraph, and give the rest of the prose something else to look at, hear and smell.

| Lever | What it means |
| :--- | :--- |
| **Colors** | Dyed and patched awnings (yellow, red), whitewashed doorposts, rust-orange scrap, green weed on the lower steps, pale wood shavings at the boat-sheds. |
| **Sounds** | A smith's hammer, gulls, a ferry horn, mallets in the sheds, laundry snapping in the wind. |
| **Smells** | Frying eel, tar, cedar shavings, lamp oil, boiling washing, broth. |
| **Textures** | Worn stone, cinder, rope, planks, brick, cold iron. |
| **Height** | The Upper Gangways and the roofs get sun, wind and a view of the city above. |
| **Dry places** | Brick (seawall, culvert vaults), the stone shelf under the seawall, packed cinder banks, an ash floor at the smith's, the flagged Lamp Stair street. Wet is then reserved for the Flooded Lower Steps and the Dredge Landing. |
| **Weather and tide** | A clear low-water afternoon is bright and drying (steam off the banks, laundry out, doors open). Fog, rain and high water carry the grim mood when they happen. |
| **People** | Ordinary district life as ambient description (laundry, cooking smoke, neighbors calling across gangways). Never a one-off gesture by a background figure in repeatable text. |

**Palette per area** (the first sentence of each area's prose should draw from its own row, not from "mud"):

| Area | Look | Sound and smell | Ground |
| :--- | :--- | :--- | :--- |
| Duckboard Market | patched red and yellow awnings, hanging eels, punts; the chandler's shop smells of wax and rope | shouting prices, frying eel | stone and cinder lane, planks over the wet patches, mostly dry by day |
| Upper Gangways | washing lines, tin-whistle lookouts, sky | wind in the ropes | rope and plank overhead, sun-dried |
| Boat-Sheds and Scrap Platform | pale ash oars, rust-orange chain | hammer, plane, tar | dry timber on stilts |
| Lamp Stair | red-shaded lamps, painted cloth, shutters | fiddle and laughter, cheap perfume over tar | flagged street, dry |
| Dredge Landing | grapples, black spoil-mounds, barges | chains, gulls | wet, and only here |
| Alley Shrine | tallow candles, a friar's pot | broth steam, murmured names | worn timber |
| Flooded Lower Steps | green weed, cellar doors | dripping, cold | wet, and only here |

**Sample rewrite of the arrival paragraph** (keeps the canon facts: the city's paving ends at the cut, planks over the wet ground, below the high-water line, tenements on pilings, rope gangways; and it uses the ground from 3.1b):

> The city's paving stops at the drainage cut. Past it the lanes are broken stone and packed cinder, with planks laid over the low wet patches. Dredge-End sits under the river's high-water line, its tenements standing on tarred pilings with rope gangways strung between them. Down beside the trenches the canals lie flat and green-black, but the lanes above are loud and colored: laundry snapping on the gangways, oilskin awnings patched in yellow and red, smoke from a frying-eel stall, and a smith's hammer keeping time somewhere out of sight. Every step on the stone rings a little hollow.

**What gets built.**

1. **Rewrite pass** on the existing arrival paragraph and its weather, time-of-day and weekday variants in `port_valen_dredge_end.txt`, plus the Rusty Anchor and Silt-Gate arrival prose where they repeat the same words. Facts do not change, only wording and what gets described.
2. **A word budget for new prose.** Any single area's prose uses each of mud, silt, sludge, damp, brackish, rot and stagnant at most once.
3. **Lint.** Add those words to `RESTRICTED_WORDS` in `tools/lint_vocab_overuse.js` so the drift shows up in future runs.
4. **Lorebook.** The `dredge_end` entry keeps its base facts, but its text follows the same palette.

This is phase 1 and does not depend on any of the new areas. It is also the fastest way to test the feel of the place, because it changes what the player reads on every visit.

---

## 4. Tide and Weekday: One Rule for the Whole District

### 4.1 A derived `tide_state`

Replace the two separate tide descriptions with one **derived stat** (recomputed, not stored, so it has no replay risk, the same way `day_of_week` is derived):

* **Low water:** Morning, Midday, Afternoon, Dusk.
* **High water:** Night and Pre-Dawn.

This is exactly the rule the Silt-Gate quest already uses, so nothing about that quest changes. The Rusty Anchor's "wait for the ebb" scene keeps its own hours (the box is under a specific hull and its wait is a set-piece), but its prose is checked against the same rule so the two never contradict.

### 4.2 What the tide changes

| Area | Low water | High water |
| :--- | :--- | :--- |
| Duckboard Market | lane dry and busy, wet patches steaming | low corners and plank patches awash, stalls shuttered, punts poled in from the canal side |
| Dredge Landing | working, grapples out | closed (awash) |
| Flooded Lower Steps | reachable | under water |
| Upper Gangways | quiet, lookouts bored | lit, watched, more traffic |
| Boat-Sheds | doors open, work under the eaves | lantern-lit, shuttered |
| Lamp Stair | shuttered and sleepy, a few doors open | lit and loud (above the flood line, unaffected by the water below) |

### 4.3 The weekly rhythm (what changes in the places)

The weekday life the game already writes as scenery becomes something you can walk into and hear about. No jobs: just a different day in the same place.

| Day | Where it shows | What is different |
| :--- | :--- | :--- |
| Marketday | Duckboard Market | Busiest day. Eel-seller and stalls out, wharf boys working the crowd. |
| Tideday | Dredge Landing, Flooded Lower Steps | The grapple boatman hauls parcels off the pilings. A diver slips into a flooded flophouse. |
| Hallowday | Alley Shrine | The friar's broth line. Men checking faces against vellum stand nearby. |
| Greyday | Upper Gangways | Someone pounds doors with a bundle of debt-writs. Runners slide parcels across roof gaps. |
| Forgeday | Boat-Sheds and Scrap Platform | Scrap and chain unloaded. The smith's hammer rings signals along the cut. |
| Ironday | Footbridges | The collector's runner threads the bridges with a wax tablet (scenery, as today). |
| Hearthday | Whole district | Empties early. Quiet evening. |

The day changes what you see and hear and which rumors are in the air. It never closes a place for the whole day, except where section 3.2 says the tide does.

---

## 5. What Each Place Offers Now (no quests)

Every option here reuses a system the game already has (buffs, dice, day labor, prep flags, rumors), so the build risk is low. Each is a small, real thing: it costs coin or time and gives something, per the rule that options must not be filler. **This whole table is a proposal for you to cut or change.**

| Place | Small things to do | Reuses |
| :--- | :--- | :--- |
| **Duckboard Market** | Buy a street snack (2 to 5 copper) with a small buff. Listen at the stalls for the day's rumor (one per weekday, unlocks lorebook facts). On Marketday, watch the crowd (a WIS check): a miss costs a few copper to the wharf boys, a success keeps your purse and gives a rumor. Buy candles, rope or lamp oil at the chandler's. | Tavern-purchase buff, rumor flags, purse and currency lock |
| **Upper Gangways** | Climb to the lookout landing for a view: the city above, the water below, the hour and weather in the light. Deliberately light: mostly prose and a rumor. | Prose by `time_period`, `weather`, `tide_state` |
| **Boat-Sheds and Scrap Platform** | ~~Visit Hobb at his shed~~ (removed with the quest). Sell salvage to the scrap dealer at a modest price. Pay the smith to hone your weapon for a small edge on your next check. | Sell shape, the `prep_honed_blade` idiom from camp |
| **Dredge Landing** (low water) | Take a day-labor shift with the dredgers for silver, at the cost of hours. | The Cargo Quay's crane-three day labor |
| **Lamp Stair** | Dice cellar: a wager with the knuckle-bones. Pawnbroker and fence: sell modest loot. Hedge-doctor: buy a poultice or fever tea for a small heal. All-night drinking house (night): drinks with buffs. Bawdy house: outside only, the door, the lamp, a doorkeeper and rumors. | Dice wager, buy and sell, tavern buffs |
| **Alley Shrine** | On Hallowday, take a bowl from the friar's broth line (fixes hunger, no buff). Other days it is quiet, with a rumor. | Hunger reset |
| **Flooded Lower Steps** (low water) | Wade the lower steps and search for scrap. A success gives a little coin or salvage. A miss costs an hour and a soaking, and nothing else. | Search check, the neglect clock |

**As built (differences from this table).**

* **No selling.** The game has no sell system, so the pawnbroker does not buy anything. He gives rumors and a look at the window. The scrap dealer does buy: **scrap found at the Flooded Lower Steps** (2 pieces per successful search, 3 copper each) is sold to him, which gives the search a purpose.
* **The smith** tends your gear for 4 copper and gives a "Kit Tended" buff (+1 STR checks for 4 hours), using the unique-buff system, not a new flag.
* **Street food** is vinegar eel at 3 copper: +1 temp HP and a **+1 INT** buff, the least-used stat among the existing meals.
* **Chandler's shop** is a look at the shop and a short exchange with the man on the stair, with no purchases.
* **Bawdy house** is the outside only: a doorkeeper who answers three questions (what it charges, who runs it, how it treats its people). No interior exists.
* **Hedge-doctor** heals 4 HP for 5 copper (hidden when you are at full health). **Dice cellar** is a 4-copper stake, WIS DC 12, once per day. **All-night drinking house** sells black ale (+1 CON, 3 copper).
* **Landing** day shift: CON DC 11, four hours, 3 silver on success and 1 silver on a spilled basket, once per day.
* **Shrine:** the broth line on Hallowday (once per Hallowday), the friar, two rumors, and a one-copper offering that gets a third.
* **Rumors** are ints (`cut_rumors_*`) and each place has two or three.

**Rumors and lorebook.** Each area has a small pool of rumors that unlock its own lorebook entry and give the district facts without any quest. That is also where a future quest would plant its hooks.

**Persistent NPCs.** ~~Hobb becomes a persistent minor NPC at his shed.~~ (Removed with the quest.) Nobody else new needs a name yet (stall-holders and the doorkeeper stay unnamed).

**Not offered.** No new sidebar quests, no dossier quest lines, no reputation changes, no faction effects.

---

## 6. Small Economy and Lorebook

### 6.1 Food and buffs

The Anchor's stew gives a WIS buff. Existing buffs use CON, STR, DEX, INT, CHA and WIS. The Duckboard Market snack is one cheap item, and which stat it buffs is your call (section 11). Prices stay in 2 to 5 copper.

### 6.2 Lorebook entries to add (all places, phase 2 and 3)

Each unlocks from a first-visit flag set the moment the player reaches the place, and follows any name-hiding the scene does.

| Entry | Category | Unlock | Notes |
| :--- | :--- | :--- | :--- |
| Duckboard Market | places | first visit | tide and weekday facts only |
| Upper Gangways | places | first visit | lookouts stay unnamed |
| Boat-Sheds and Scrap Platform | places | first visit | includes Hobb (already has an entry) |
| Dredge Landing | places | first visit | phase 3 |
| Lamp Stair | places | first visit | phase 3; the houses are described by their debts, not their trade |
| Alley Shrine | places | first visit | phase 3 |
| Flooded Lower Steps | places | first visit | phase 3 |

The existing `dredge_end` entry gets a `see` link to each new place. No new people entries and no faction entries change. Link phrases are full proper names ("Duckboard Market", "Lamp Stair"), never starting with "the" and never a generic word. (`hobb` and `rusty_anchor` were removed along with the quest — see the update note at the top.)

### 6.3 What is not touched

`quest-data.js` (the sidebar), `choicescript_stats.txt` (the dossier quest lines) and `QUESTS.md` do not change, because there is no new quest.

---

## 7. State Variables (as built, all created in `startup.txt`)

| Variable | Values | Notes |
| :--- | :--- | :--- |
| `cut_seen_market`, `cut_seen_gangways`, `cut_seen_sheds`, `cut_seen_landing`, `cut_seen_lamp_stair`, `cut_seen_shrine`, `cut_seen_lower_steps` | bool | first-visit flags that unlock each lorebook entry |
| `cut_rumors_market`, `_gangways`, `_scrap`, `_landing`, `_pawn`, `_drink`, `_shrine`, `_steps` | int | how many one-shot rumors heard in that place |
| `cut_scrap` | int | scrap found at the Lower Steps, sold to the scrap dealer |
| `cut_market_watch_day`, `cut_labor_day`, `cut_dice_day`, `cut_broth_day` | campaign day | once-per-day guards |
| `cut_shrine_gave` | bool | records a specific answer, used by the lorebook |

`tide_state` is not stored: it is derived from `time_period` where it is needed (the district page and the area pages), the same rule the Silt-Gate quest uses.

---

## 8. Appendix: Parked Ideas (out of scope, kept so the design is not lost)

### 8.1 The Black Tally's leadership (names and concepts only — no lorebook entry, no prose, until a real quest reveals each one; this section exists so the design is not lost, the same reason Crake's name was originally parked here)

Reviewed 2026-09-22. One leader, three people under her. All four are deliberately unrevealed: no scene currently shows any of them, so none get a lorebook card yet (see the "Progressive codex" rule — an entry only exists once the player has actually been told or shown something). This section is the character bible to write from once a quest needs them.

**Odalys Crake — "the Bookkeeper."** The Tally's boss. Sits above the whole Dredge-End operation, and yet has no door with her name on it and signs nothing herself. Older (50s-60s), dressed like a minor clerk rather than a crime boss — plain wool, ink-stained cuffs, spectacles on a cord — and works out of a back room, not a throne room. Debtors and even collectors rarely see her face; her name is invoked far more often than she appears ("it's gone to the Bookkeeper," "the Bookkeeper says"). She doesn't collect and doesn't threaten in person — by the time a threat reaches a debtor's door it has already passed through several other hands. Her only real power is total, instant recall of exactly who owes what, to whom, and what happens next, because she is the one who wrote it down. Unreadable and calm; the closest thing she has to a tell is correcting people's arithmetic without seeming to notice she's doing it. Embodies "paper not blades" more purely than anyone else in the organization.

**Widow Corve's owner (name reserved, currently unmet).** *(Not live: the earlier draft of this section named her "Mistress Helvi" and had her appear in person at the `corve_chamber` overnight stay, but the house's owner is deliberately never named or met on-page — the doorkeeper says so outright, and the scene, its dossier, and the lorebook were all corrected to match. No name is locked in; pick one when an actual quest needs her to appear.)* The parked hook is the Tally angle: she pays part of what she owes the Tally on the leasehold (`cut_house_lease` already establishes the debt) not just in coin but in information. Patrons and companions talk in her parlor the way they never would at a counting-house window, and she has a very good memory for who said what, to whom, and while owing how much. Write her as a pragmatic survivor, not a gleeful informant — she doesn't see herself as a collaborator, she sees it as the toll that keeps her house, and the women in it, out of the Tally's direct hands, and it's what lets her buy her own workers' debt-writs back from the house strongbox (already an established ambient rumor). A future quest could force the player, or a companion, to reckon with what that protection has actually cost someone else — and that same quest is the moment she'd finally get a name, a face, and a lorebook entry.

**"The Barge-Man" — Corlan Vasse.** The Tally's enforcement of last resort, and the literal mechanism behind the game's existing line that missing a payment means "waking up chained to an ore barge." Not a collector, not a threat-maker — the person who actually processes an overdue debtor onto a barge as living collateral. A big, unhurried, entirely unglamorous man who treats the job like cargo logistics rather than violence: manifest-and-clipboard energy, not knife-and-threat energy, which is what makes him unsettling. He doesn't beat anyone. He checks a name against Crake's ledger, and walks the debtor to a barge the way you'd walk livestock to a pen. Rarely raises his voice. The one thing that gets a reaction out of him is someone trying to talk their way off his manifest — he doesn't negotiate, because the negotiating already happened, on paper, before he was ever sent. Potential hook: a labor-conditions or barge-debt thread at the Dredge Landing, the Cargo Quay, or wherever a resident's unpaid debt becomes visible.

**"The Collector" — Aldric Pell.** Field collector for the lower tenements beat, and the specific person who still holds the note on Lyra's family — the one who, per Lyra's own flashback (`alderford.txt:2138`, "two bailiff hounds baying behind me"), set the hounds after her three winters ago when she ran. Quiet and meticulous; keeps two lean tracking hounds that go door to door with him. Doesn't raise his voice or make a show of a debt — reads the amount off his tablet and waits, letting the silence and the dogs do the persuading. Unlike Vasse he is small-scale and personal: one beat, every name on it known by heart, a debt treated like an overdue invoice rather than a grievance. The detail that should survive into any real scene: he still has the note on Lyra's aunt's family, still unpaid, still accruing. This is the existing "Lyra's old debt as springboard into the Black Tally" idea (previously just a bullet point below) with an actual person and an actual object attached to it, ready for a quest that lets the player — with or without Lyra along — find that thread still live in Dredge-End.

---

## 9. Checked Against the Rules

| Rule | How this plan satisfies it |
| :--- | :--- |
| Organic discovery, no unprompted quest offers (quest rules section 1) | No new quests. The district only offers places. |
| Living hub environments (section 7) | The arrival prose carries the atmosphere, and the options are plain buttons with time tags, the same as every other district. |
| No barrier bloat (section 7) | A closed place (low water only, night only) is simply not listed. |
| New options must be real, not filler (section 7) | Every item in section 5 costs coin or time and gives something. |
| Organic name discovery (narrative section 1) | Nobody new is named. Hobb stays gated on `met_hobb`. |
| Progressive codex (narrative section 1) | Lorebook entries unlock on first visit only. |
| Timeless repeating hubs (narrative section 3) | Hub prose branches on `time_period`, `weather` and `tide_state`. No one-off NPC micro-actions in repeatable text. |
| Time tiers (mechanics section 12) | 15 minutes once on entering an area. Sub-loops (buying, dice, listening) are free. |
| Derived stats (rules section 12) | `tide_state` is derived, so no replay risk. |
| Plain words, no jargon (narrative section 4) | Plain place names. The texture pass and the lint change stop the mud words from coming back. |
| Currency hygiene (mechanics section 1) | Currency lock pattern, once-only guards, no bare increments before a pause. |

---

## 10. Phasing and Implementation Map

| Phase | Deliverable | Size | Depends on |
| :--- | :--- | :--- | :--- |
| **1. Feel** | `tide_state`, the texture pass on the arrival paragraph and its weather, time and weekday variants, the Anchor and Silt-Gate arrival prose, the lint change (section 3.4), a tide check of the Anchor prose. | Small to medium | none |
| **2. First places** | Duckboard Market, Upper Gangways, Boat-Sheds and Scrap Platform as options on the district page, each with its place kit (section 5), lorebook entries, first-visit flags. | Medium | 1 |
| **Pause and playtest** | You walk the district in the game. Decide what to keep, change or cut before anything else is built. | | 2 |
| **3. The rest** | Dredge Landing, Lamp Stair, Alley Shrine, Flooded Lower Steps, with their kits. | Medium to large, splittable | 2 |

**Where the code goes.** Decided and built: **the same file**, `port_valen_dredge_end.txt`, in a clearly bannered section at the end (one banner per area, and a lighter marker for each sub-location). Every district is one file, so a second file would have been the exception, and `port_valen.txt` is already about 5,000 lines. No `compile.js` change was needed.

**Verification each phase:** `quicktest` with every new line reached, `lint_anachronisms`, `lint_prose_tics`, `lint_mechanics_leak`, `lint_choices`, `lint_thin_prose`, `lint_blank_landing`, `lint_vocab_overuse`, the lorebook check (all `see` ids resolve, link phrases valid), a recompile, and a playthrough at low and high water, by day and by night.

---

## 11. Decisions (answered)

1. **Phase order.** Build everything in one pass (all three phases). Done.
2. **Where the code lives.** The same file (see section 10). Done.
3. **The place kits.** Built as in section 5, with the "as built" changes above. Open to cuts after playtesting.
4. **Street food.** Vinegar eel, +1 INT. Done.
5. **The texture pass.** Done: the arrival paragraph, the weather, time-of-day and weekday variants, and the Harbor rumor about Dredge-End, plus caps on sludge, brackish, stagnant and waterlogged in `tools/lint_vocab_overuse.js`. Those caps list every use for review, and most remaining uses are legitimate ones in the mill-race and marsh chapters. (The words "mud", "silt" and "damp" are not capped, because the marsh chapters use them honestly.)
6. **Lamp Stair.** Content approach confirmed as drafted, with the bawdy house seen from the outside only.
7. **Hobb.** A persistent NPC at his shed, with a short conversation that reads the Hobb errand outcome. Done, then reversed — Hobb was removed along with Sal and the Anchor (see the update note at the top).
8. **The stair and the doorkeeper.** Kept as tells for later.
9. **Crake.** No lorebook entry and no prose until a quest needs her. Confirmed.
10. **The ground.** Retcon level A (light). Done: the arrival paragraph and the `dredge_end` lorebook entry, one line in the `black_tally` entry, one Harbor rumor (the search also caught a second Harbor line about "sunken walkways" and "wooden boardwalks"), and the "Step back out" button. Two "duckboards" mentions were left in place because planks still lie along the canal edge.
11. **Whose shrine.** Saint Althea the Mender, from the existing pantheon (the Sun-Father and two saints, Althea and Dunstan). No new god. The figure is veiled ("of the Shroud"), which is why its face is worn smooth. First visit sets `codex_saint_althea`, which also unlocks the Sun-Father entry, as it does at Alderford.
