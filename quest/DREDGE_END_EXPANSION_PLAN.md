# Plan: Dredge-End Expansion — Places First (REVIEW DRAFT)

> **Status:** DRAFT FOR REVIEW. Nothing in this file is implemented. **Scope changed:** you want to test how the place feels in the game before adding quests, so this plan builds **locations, prose and small things to do** only. The only quests in Dredge-End stay the two tiers of Sal's line (already built).
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

* **The place** (`port_valen_dredge_end.txt:27`, lorebook `dredge_end`): the cobblestones give out at the drainage cut. Greased timber **duckboards** and sunken **mud tracks** below the river's high-water mark. A low **silt basin** with waterlogged timber **tenements on black-greased pilings**, joined by **rope gangways** over canal trenches. So it is a walkable mud-flat shanty district with water in it, not one big pier.
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

### 3.2 The areas (the Anchor, which exists, plus seven new)

Every area is grounded in something the canon already describes. "Open" uses the tide rule in section 4. What each place actually offers the player is in section 5.

| # | Area | What it physically is | Open when |
| :--- | :--- | :--- | :--- |
| 1 | **The Rusty Anchor** *(built)* | Three barges, taproom, hatch. | Always |
| 2 | **Duckboard Market** | The market street: planks laid over silt, awnings, punts nosing in. Holds the chandler's shop and an outside stair (see 3.2b). | Day. Busiest Marketday. Dusk and night, a few stalls only. |
| 3 | **The Upper Gangways** | Rope bridges and stilt landings over the trenches, the tenements' upper storey. | Always, but at night only by lantern. |
| 4 | **The Boat-Sheds and Scrap Platform** | Raised sheds on stilts along the cut (Hobb is here), the scrap dealer's timber platform, the smith's bench. | Day. Forgeday is scrap and chain day. |
| 5 | **The Dredge Landing** | Where dredgers haul silt out of the cut: barges, grapples, the pit-mounds of black spoil. The district's namesake. | Low water only (Morning to Dusk). At high water the landing is awash and closed. |
| 6 | **Lamp Stair** | The seedy stretch: a raised boardwalk street on the landward side under the seawall, lit by red-shaded lamps. Bawdy house, gambling cellar, pawnbroker and fence, an all-night drinking house, a hedge-doctor's stall. Dry ground, because the boards are raised above the flood line. | Lively at Dusk and Night. By day it is shuttered, and only the pawnbroker, the fence and the hedge-doctor are open. |
| 7 | **The Alley Shrine** | A timber arch smeared with tallow; the friar's broth line on Hallowday. | Day. Hallowday is the broth line. |
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
* **Where and what.** A raised boardwalk street on the landward side, under the seawall, off the flood line, so its boards stay dry when the lower district does not. Red-shaded lamps over the doors. Cheap perfume over the tar, a fiddle, laughter through shutters, painted cloth. It gives the district a warm, bright, dry place, which also helps the texture pass in 3.4.
* **Hours (ambient sound obeys operating hours).** By day the lane is shuttered and sleepy: a pawnbroker and a fence with their doors open, a hedge-doctor at her stall, a woman sluicing a doorstep. From Dusk through Night it is lit and loud.
* **What is in it.**
  * **The bawdy house** (working name "The Blue Door"): a house of adult workers who owe the Tally for their rooms, their clothes and their protection. It is a **place and a set of debts**, not a scene. For now it is seen from the outside only: the door, the lamp, a doorkeeper, and what people say about it. No interior is built.
  * **The dice cellar:** a gambling den. The game already has dice (knuckle-bones at the Anchor's hearth, Cutter's table at the Keel), so this reuses that shape.
  * **The pawnbroker and fence:** modest buying and selling, and the acolyte's unrecorded tincture vials from the Hallowday ambient prose.
  * **The all-night drinking house:** a rougher room than the Anchor, for a different crowd.
  * **The hedge-doctor's stall:** poppy tinctures and fever cures. Magic is rare and distrusted, so she is a herbwife and nothing more.
* **How the Tally is there.** Every house and cellar owes it paper. That is what puts the Lamp Stair inside the Book: it is where the Tally's money is *made*, and where its debts are most personal. The Tally does not run the houses. It holds their notes.
* **Content approach (please confirm, section 11).** Adult characters only. Told in the same table-facing voice as the rest of the game, with the material kept **off the page**: no scenes are played out. The stories are about debt, contracts, protection, who owes whom, and people trying to get out from under the paper. Nothing exploitative is written for effect.
* **Tide.** Not affected (raised boards). Night is the busy time, and at high water the lamps show in the black water underneath.
* **Unlock.** Lorebook entries open at first visit. No faction cost or lock of any kind (your constraint). The area is simply another place the player may walk into.

### 3.3 Travel and time inside the district

Walking between areas uses the "activity entered inside a district" tier: **15 minutes once on entering an area**, free thereafter. There is no new travel matrix. The district as a whole stays 60 minutes from the compound, unchanged.

### 3.4 Texture Pass: Making Dredge-End Less Muddy

**The finding.** The canon geography is fine: a low district with real boards, brick, stone and roofs. The problem is the prose. The arrival paragraph alone stacks mud, silt, waterlogged, stagnant, brackish mud, rotting, wet, greased and black-greased. Across the Dredge-End scene the counts are about silt 17, wet 14, black 19, damp 9, rot 8, mud 7, sludge 6. Nearly every weather and time-of-day variant also lands on "dark water". So every visit reads the same, whatever the area.

**The approach.** Say the district is low and damp **once**, in the arrival paragraph, and give the rest of the prose something else to look at, hear and smell.

| Lever | What it means |
| :--- | :--- |
| **Colors** | Dyed and patched awnings (yellow, red), whitewashed doorposts, rust-orange scrap, green weed on the lower steps, pale wood shavings at the boat-sheds. |
| **Sounds** | A smith's hammer, gulls, a ferry horn, mallets in the sheds, laundry snapping in the wind. |
| **Smells** | Frying eel, tar, cedar shavings, lamp oil, boiling washing, broth. |
| **Textures** | Rope, planks, brick, cold iron. |
| **Height** | The Upper Gangways and the roofs get sun, wind and a view of the city above. |
| **Dry places** | Brick (seawall, culvert vaults), stone at the drainage cut, an ash floor at the smith's, the dry, clean Lamp Stair boards. Wet is then reserved for the Flooded Lower Steps and the Dredge Landing. |
| **Weather and tide** | A clear low-water afternoon is bright and drying (steam off the banks, laundry out, doors open). Fog, rain and high water carry the grim mood when they happen. |
| **People** | Ordinary district life as ambient description (laundry, cooking smoke, neighbors calling across gangways). Never a one-off gesture by a background figure in repeatable text. |

**Palette per area** (the first sentence of each area's prose should draw from its own row, not from "mud"):

| Area | Look | Sound and smell | Ground |
| :--- | :--- | :--- | :--- |
| Duckboard Market | patched red and yellow awnings, hanging eels, punts; the chandler's shop smells of wax and rope | shouting prices, frying eel | planks over silt, mostly dry by day |
| Upper Gangways | washing lines, tin-whistle lookouts, sky | wind in the ropes | rope and plank, sun-dried |
| Boat-Sheds and Scrap Platform | pale ash oars, rust-orange chain | hammer, plane, tar | dry timber on stilts |
| Lamp Stair | red-shaded lamps, painted cloth, shutters | fiddle and laughter, cheap perfume over tar | raised boards, dry |
| Dredge Landing | grapples, black spoil-mounds, barges | chains, gulls | wet, and only here |
| Alley Shrine | tallow candles, a friar's pot | broth steam, murmured names | worn timber |
| Flooded Lower Steps | green weed, cellar doors | dripping, cold | wet, and only here |

**Sample rewrite of the arrival paragraph** (keeps every canon fact: cobbles end at the cut, duckboards, below the high-water line, tenements on pilings, rope gangways):

> The cobblestones give out at the drainage cut, and the planks begin. Dredge-End sits low, under the river's high-water line, its tenements standing on tarred pilings with rope gangways strung between them. Down under the boards the canals lie flat and green-black, but up here the district is loud and colored: laundry snapping on the gangways, oilskin awnings patched in yellow and red, smoke from a frying-eel stall, and a smith's hammer keeping time somewhere out of sight. Every step on the boards knocks hollow.

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
| Duckboard Market | planks dry and busy, mud banks steaming | planks awash, stalls shuttered, punts poled between tenements |
| Dredge Landing | working, grapples out | closed (awash) |
| Flooded Lower Steps | reachable | under water |
| Upper Gangways | quiet, lookouts bored | lit, watched, more traffic |
| Boat-Sheds | doors open, work under the eaves | lantern-lit, shuttered |
| Lamp Stair | shuttered and sleepy, a few doors open | lit and loud (raised boards, unaffected by the water below) |

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
| **Boat-Sheds and Scrap Platform** | Visit Hobb at his shed (a short exchange that reads the Hobb errand outcome, and is unnamed if the player never did the errand). Sell salvage to the scrap dealer at a modest price. Pay the smith to hone your weapon for a small edge on your next check. | Existing outcome flags, sell shape, the `prep_honed_blade` idiom from camp |
| **Dredge Landing** (low water) | Take a day-labor shift with the dredgers for silver, at the cost of hours. | The Cargo Quay's crane-three day labor |
| **Lamp Stair** | Dice cellar: a wager with the knuckle-bones. Pawnbroker and fence: sell modest loot. Hedge-doctor: buy a poultice or fever tea for a small heal. All-night drinking house (night): drinks with buffs. Bawdy house: outside only, the door, the lamp, a doorkeeper and rumors. | Dice wager, buy and sell, tavern buffs |
| **Alley Shrine** | On Hallowday, take a bowl from the friar's broth line (fixes hunger, no buff). Other days it is quiet, with a rumor. | Hunger reset |
| **Flooded Lower Steps** (low water) | Wade the lower steps and search for scrap. A success gives a little coin or salvage. A miss costs an hour and a soaking, and nothing else. | Search check, the neglect clock |

**Rumors and lorebook.** Each area has a small pool of rumors that unlock its own lorebook entry and give the district facts without any quest. That is also where a future quest would plant its hooks.

**Persistent NPCs.** Hobb becomes a persistent minor NPC at his shed. Nobody else new needs a name yet (stall-holders and the doorkeeper stay unnamed).

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

The existing `dredge_end`, `hobb` and `rusty_anchor` entries get a `see` link to each new place. No new people entries and no faction entries change. Link phrases are full proper names ("Duckboard Market", "Lamp Stair"), never starting with "the" and never a generic word.

### 6.3 What is not touched

`quest-data.js` (the sidebar), `choicescript_stats.txt` (the dossier quest lines) and `QUESTS.md` do not change, because there is no new quest.

---

## 7. State Variables (all new, all created in `startup.txt`)

| Variable | Values | Notes |
| :--- | :--- | :--- |
| `cut_seen_market`, `cut_seen_gangways`, `cut_seen_sheds`, `cut_seen_landing`, `cut_seen_lamp_stair`, `cut_seen_shrine`, `cut_seen_lower_steps` | bool | first-visit flags that unlock each lorebook entry |
| `cut_rumor_*` | bool | one-shot rumor flags, per weekday or per area |
| `cut_smith_honed` or reuse `prep_honed_blade` | bool | see section 11 |

`tide_state` is **derived** (recomputed each time, not stored), like `day_of_week`. Any coin change uses the currency lock. Any once-only grant uses its own flag.

---

## 8. Appendix: Parked Ideas (out of scope, kept so the design is not lost)

* **Later arcs:** Lyra's old debt this is what we use as a springboard into the Black Tally

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

**Where the code goes.** `port_valen_dredge_end.txt` is already about 2,000 lines. Two options:

* **A. Keep everything in that file.** Simplest, no build change, but the file keeps growing.
* **B. New file `port_valen_dredge_end_cut.txt`** for the new areas, reached from options on the district page (the district page itself stays where it is). It needs an entry in `compile.js` (the district scene is registered there by hand) and a look at how `quicktest` loads scenes. I recommend B.

**Verification each phase:** `quicktest` with every new line reached, `lint_anachronisms`, `lint_prose_tics`, `lint_mechanics_leak`, `lint_choices`, `lint_thin_prose`, `lint_blank_landing`, `lint_vocab_overuse`, the lorebook check (all `see` ids resolve, link phrases valid), a recompile, and a playthrough at low and high water, by day and by night.

---

## 11. Decisions Needed From You

1. **Phase order.** Feel first (1), then the three first places (2), then a playtest pause, then the rest (3)? Or would you rather see the Lamp Stair sooner?
2. **Where the code lives.** Option A (same file) or B (new `_cut` file)? I recommend B.
3. **The place kits (section 5).** Are these the right things to do in each place? Anything to cut or add, for example the pickpocket check on Marketday, the smith's edge, the Landing's day labor, or the Lower Steps scavenging?
4. **Street food.** Does Duckboard Market sell a buffed item, and which stat (DEX, INT or CHA are the ones the Anchor's WIS and the Keel's CON and STR do not cover)?
5. **The texture pass.** Do the rewrite pass on the existing Dredge-End prose in phase 1 as described in 3.4 (facts unchanged, wording and description changed), and add the mud words to the restricted list? I recommend both.
6. **Lamp Stair.** Is the content approach in 3.2c right (adult characters, off the page, about debt and protection, the bawdy house outside only for now)?
7. **Hobb.** Should he be a persistent NPC at his shed, with a short greeting that reads the Hobb errand outcome?
8. **The stair and the doorkeeper.** Keep the man at the foot of the outside stair and the bawdy-house doorkeeper as "tells" for later, even though nothing sits behind them yet?
9. **Crake.** Confirm she gets no lorebook entry and no prose until a quest needs her.
