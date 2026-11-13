# The Nobility of the Western Vale - Regional Feudal Structure Plan

## Status

Planning document only. Nothing below is implemented canon until it is approved and added to the game (lorebook-data.js, overworld-data.js, scene files). Do not take or implement any information from this file unless strictly permitted to do so. Anything here can change at will, including after implementation begins elsewhere.

This file is the structural companion to `WESTERN_VALE_VILLAGES_PLAN.md`. That file covers Langston and its three villages in detail; this file covers everything else in House Gault's holdings, and how all of it fits into one feudal ladder.

## The Political Triangle (background, already partly canon)

Established in `lorebook-data.js` and not to be contradicted:

- **House Gault** holds the **Western Vale** from the walled city of **Dunmow**. Arms: a golden horse on a deep-blue field. Rich in food, hemp, wool, wine and horses; poor in metal and minerals. Fields mounted riders and archers; keeps no fleet. Coombe Gap is Gault's road east to the river.
- **Baron Aldous Karr** holds **Stenmark**, the valleys and furnaces of the southern Crags, from **Karr's Keep** above Brandreth. Rich in iron, steel and coal; poor in food and people. Two tolls close Stenmark: Black Pike Gate (south) and Iron Gap (west, shared with Gault).
- **The Gilded Scales** are the merchant power at Port Valen. They move what each side cannot sell or buy itself (Gault's goods to the sea, Stenmark's iron inland), and that middleman position is new, explicit lore from this session: **it is why neither side can afford to destroy the Scales, and why the Scales profit from the tension rather than ending it.**

**New this session, to layer onto the above (not yet written into the lorebook):** House Gault holds an old, ancestral casus belli against Stenmark over the mineral-rich ground Karr now holds — the kind of claim every herald remembers and no army has pressed home in a generation. The border sees regular skirmishes, raids and toll disputes, never a real war. Iron Gap is the pressure point: Gault needs Karr's metal, Karr needs Gault's grain, and the Scales broker the trade that keeps both fed while the border stays hot enough to need watching. This is the reason the Vale needs frontier castles at all.

Writing this into `lorebook-data.js` (the `house_gault`, `iron_bailiffs` and `stenmark` entries) is a separate, later step once the structure below is approved — flagged here so it isn't forgotten.

### History: The Broken Promise (decided this session)

Dated against existing canon: the Meridian Empire's legions withdrew **thirty years ago**, in the **Broken Crown War**, a war of succession "fought across the western provinces" that "broke the last noble dynasties, and split the realm for good" (`meridian_empire`, `broken_crown_war`). That date is used in three independent lorebook entries already (the Empire's fall, the war itself, and the founding of the Iron Carrion "in the ashes" of it), so it's load-bearing, not a throwaway number.

- **House Karr were the Marches' native nobility**, forced into vassalage under House Gault centuries before the Empire fell — Gault having held the region's authority as the Empire's enfeoffing hand. By the time of the Broken Crown War, Karr was Gault's strongest and most resentful vassal house.
- As the Empire tore itself apart, **Avelina's father** (then Count Gault) judged that only a united Grey Marches, with Karr's full strength committed rather than grudgingly lent, could hold the region together through the chaos. He promised Karr what centuries of vassalage had denied them: full independence, free of Gault's feudal claim, in exchange for Karr's unreserved support.
- **He died in that war**, thirty years ago, with Avelina still a child or young heir. "Victory" meant the Marches held together and the Empire's local authority simply ceased to exist — but with her father gone, the court that settled the peace (his regents and rivals, not wholly sympathetic to his promise) honored Karr's independence in name while disputing exactly how much of the mineral-rich border ground went with it. Karr got free of Gault; Karr did not get all the land the promise implied.
- **Nobody has ever formally settled it**, because there was no higher imperial authority left standing to arbitrate or ratify either side's claim — which is also why Karr's own baronial patent, per existing lore, has never been "renewed since the legions left." Both houses are, legally, making an argument to an empty chair.
- **Gault's court quietly knows the promise was shorted** and doesn't own it publicly — official Gault history treats the border as settled fact, not a debt. Avelina herself privately carries some of her father's unrepaid word, which colors her preference for leverage over war: pressing Karr costs her nothing she admits to regretting, but she has never found the stomach to press it all the way.
- **Thirty years of a frozen conflict** since: regular border skirmishes and the odd pitched battle, never resolved and never allowed to become a real war, because each side depends on what only the other has (grain, iron) and neither will buy it from the other directly — only through the Gilded Scales, who profit as the sole channel for a trade neither house will admit it needs from its rival.

## The Northwest Corner: Azure Lake and Its Forest (added 2026-11-13, overworld map changes)

The drawn map has grown since the last terrain pass: a lake and a forest now exist in Dunmow's own corner of the Vale, and a village and a road junction swapped places. Retconning the affected text here rather than letting it drift out of sync with `overworld-data.js`/`overworld-art.js`.

- **Dunmow is a lakeside city.** Azure Lake sits right against Dunmow's own position on the map, close enough that "walled city among open grassland" is no longer the whole picture. Still the grassland-grain-and-linen capital it already is — now with a lake at its gate too, and a minor fishing trade alongside the linen looms. Carried into `lorebook-data.js`'s `house_gault` entry and `overworld-data.js`'s `dm` prose.
- **The forest only actually touches two villages: Oatcroft and Caldby.** (Correction: a first pass read this off the drawn feature's bounding box, which overstates a forest's real footprint whenever it isn't a neat rectangle — Harwick, despite sitting near that box, isn't actually forest-adjacent.) Oatcroft and Caldby are now minor makers of timber, charcoal, raw hide and furs, the same ambient forest-edge bundle `overworld-data.js` already gives Langston — plus a minor animal-meat trade (boar meat), since a real forest edge means real game. Oatcroft, sitting closest to the lake as well as the wood, also picks up a minor fish trade. Implemented in `tools/gear_catalog.json` (`cb`/`oc` added as minor makers of `longshade_timber`, `charcoal`, `raw_hide`, `furs`, `boar_meat`; `oc` and `dm` added as minor makers of `fish`).
- **Reedmere's reeds are the lake's own shallows.** Reedmere's existing flavor text ("a damp meadow where reeds grow thick along slow water") already sits right at Azure Lake's edge on the map — read that "slow water" as the lake's own marshy northeast inlet, not a separate, unnamed body of water. A happy accident, not a contradiction, but worth saying so rather than leaving two disconnected "there's water here" facts side by side.
- **This doesn't touch the downs/frontier-castle corridor.** The "the Western Vale is level grassland" correction from 2026-11-12 (see Carrowmark/Dennholt below) was and remains specifically about the Carrowmark-Dennholt road east of this cluster — real mountain ground only starts right at those two castles. The lake and forest sit in a different corner of the same territory, around Dunmow, not along that road.

**Oxworth and Fold Crossing swapped tiles.** The droving village and the road junction that used to share this cluster traded places on the map: Oxworth now sits where Fold Crossing used to be, and vice versa.

- **Oxworth is no longer "on the road to Dunmow"** — it now sits directly beside Hartwell itself (a 6-mile road, the shortest either tile has) and the downs/Esthorpe corridor instead. Its peerage entry below is corrected to match.
- **Fold Crossing** now occupies Oxworth's old spot, between Dunmow, Millstow, Reedmere and Verdant Way — a crossing on open grassland, named for sheepfolds rather than anything to do with the downs.
- Oxworth's economic role (cattle/hide/fat byproducts, part of Hartwell's cluster) is unchanged; only its road neighbor is.

## The Three-Tier Ladder

| Tier | Title | Holds | Answers to |
|---|---|---|---|
| 1 | **Countess** (apex) | The city of Dunmow directly; the Vale as a whole | Nobody in the Vale (an imperial patent nobody has renewed, same as Karr's) |
| 2 | **Viscount / Viscountess** (middle nobility) | One town and its surrounding villages | The Countess |
| 3 | **Lord / Lady** (minor nobility) | A single castle, or a landed estate inside someone else's jurisdiction | A Viscount, or directly the Countess (for marcher castellans — see below) |

**"Lord/Lady" is not a new coinage** — it's already in play. `WESTERN_VALE_VILLAGES_PLAN.md` has **Lady Maelin Veyre** of House Veyre holding a vineyard estate in Barolo: landed nobility with no public jurisdiction, sworn to Gault, living inside Langston's directly-administered demesne. That's the template for minor nobility done right, and it sets the precedent that a Lord/Lady can hold land without governing the settlement it sits in. The Durnells (merchant wealth) and Avenels (local gentry) are explicitly **not** nobility, and stay that way.

**Why not call tier 3 "Baron/Baroness":** Baron Aldous Karr already uses "Baron" as the *sovereign* title of an entire independent barony. Reusing it one tier down inside Gault's own hierarchy would read as though Gault's minor nobles were Karr's peers. "Lord/Lady" avoids the collision and costs nothing, since it's already established usage.

## Langston Stays Exactly As Planned

Langston is **not** enfeoffed to anyone. It's House Gault's **direct demesne**: an appointed Mayor (Anathram) answers straight to the Countess, same as `WESTERN_VALE_VILLAGES_PLAN.md` already has it (Countess at Dunmow -> Mayor of Langston -> village heads). Its three villages (Barolo, Broadmead, Fallowmere) don't change. This is the real-world "crown land vs. enfeoffed land" split: some of a sovereign's territory is administered directly, the rest is granted out to vassals. No retcon needed here at all.

## The Rest of the Vale: Two Viscounties

To reach "3 towns, 10-14 villages, 4 castles" without touching Langston, the remaining 2 towns become the seats of 2 new Viscount/Viscountess houses (middle nobility):

- **Viscounty A** — a new town (placeholder name TBD), holding 3 villages and 1 castle.
- **Viscounty B** — a new town (placeholder name TBD), holding 3 villages and 1 castle.

Dunmow itself also holds **2 villages directly** as the Countess's own demesne land around the city, the same direct-rule pattern Langston uses rather than enfeoffing every acre.

That's 3 (Langston) + 3 + 3 (the viscounties) + 2 (Dunmow's own) = 11 villages total, inside your 10-14 target with room to add a couple more later if the Vale feels sparse.

Each viscounty's castle is held by its own **Lord/Lady castellan**, sworn to that Viscount rather than straight to the Countess — the normal feudal chain (Countess -> Viscount -> Lord).

## The Frontier Castles: Carrowmark and Dennholt

These two are already on the map, north of Broadmead, guarding the downs road toward the mountains (terrain corrected 2026-11-12: the Western Vale is level grassland, so the road stays on open down and only turns to real mountain ground right at the two castles). Proposal: these two are **not** part of either viscounty. They're **marcher castles**, their Lords sworn **directly to the Countess**, because:

- They sit above Langston's demesne, which has no noble overlord (a mayor can't be a feudal suzerain to a landed Lord).
- Marcher wardens answering straight to the sovereign is the standard pattern for border fortresses in a feudal setup — it keeps frontier defense out of any single vassal's hands, which matters more given the live skirmish risk with Stenmark.

That gives 4 castles total: Carrowmark + Dennholt (Crown marcher wardens) + 1 each for Viscounty A and B.

### Geography Settles It: Carrowmark Is Iron Gap's Gault-Side Fortress (confirmed from the user's regional map, 2026-11-12)

The user's territory map shows Gault's land, Karr's land, the Valen Reach and the Great Sedge as four shaded regions, with a single narrow mountain valley between Gault and Karr — and Carrowmark sits squarely at its mouth. That valley is the Vale's own **Iron Gap**, already named in `lorebook-data.js` (`western_vale`: "Iron Gap climbs north into the Crags and [Karr]'s tolls"; `iron_bailiffs`: Karr's guards man "Iron Gap on the west"). Rather than invent a second, redundant pass, **Carrowmark is the Gault-side counterpart fortress to Karr's own toll-post deeper in Stenmark** — two rival watch-forts facing each other across the one crossing both economies actually depend on. This also slots neatly into the Coldspine's existing description ("in the west the range bends away to the north, past Langston, into country no road reaches") — our downs road is the first road to ever reach that stretch.

**This changes what Carrowmark's castellan actually is.** Lord Corin Ashdown doesn't just guard *a* border post — he sits on the single legal channel for the Gault-Karr iron/grain trade and the most likely flashpoint for any real escalation of the thirty-year frozen conflict. Dennholt, by contrast, faces a remote, lesser stretch of highland with no real route through it — rough ground a smuggler or a shepherd might use, not an army or a loaded wagon train. **The two castles are not peers in practice, even though both are "a Lord sworn to the Crown."**

That asymmetry is deliberately left as a rank mismatch rather than fixed by promoting Ashdown: Avelina keeps his title exactly as modest as Hollis's at Dennholt, on purpose. A Lord who commands the Vale's entire lever against Stenmark would be dangerous with a Viscount's formal independence — better that his outsized importance stays a fact everyone at court quietly knows rather than a rank anyone can point to. It also sharpens his hawkishness: letting a skirmish run long at Carrowmark isn't a border lord's temper, it's a man who controls the chokepoint making his own foreign policy, which is exactly the kind of thing a Countess thirty years into managing her father's broken promise has to watch most carefully.

## Settlement Count Check

| Type | Count | Who |
|---|---|---|
| City | 1 | Dunmow (Countess, direct) |
| Town | 3 | Langston (direct) + Viscounty A seat + Viscounty B seat |
| Village | 11 | 3 under Langston (existing) + 2 under Dunmow (direct) + 3 under Viscounty A + 3 under Viscounty B |
| Castle | 4 | Carrowmark + Dennholt (Crown marcher) + 1 per viscounty |

Matches your 1/3/10-14/4 target.

## The Peerage (draft, this session)

All placeholder, all open to change — the point of this pass is to get names and relationships on the page so the messiness has somewhere to live.

### The Countess's Own Demesne

**Countess Avelina Gault**, Dunmow (city). Her two direct villages: **Reedmere** and **Oatcroft**.

### Viscounty of Harwick — House Reyner (the martial, border-facing viscounty)

**Viscount Baldric Reyner**, hard and soldierly, proud of three generations of Reyner border service. His private grievance: Carrowmark and Dennholt sit on his doorstep, garrisoned largely by men his own levies raised, and yet answer straight to Dunmow over his head. He isn't disloyal, but he resents being treated as a recruiting ground rather than a commander.

**Viscountess Isabel Reyner**, born **Isabel Veyre** — Lady Maelin Veyre's daughter and Lucan Veyre's sister, out of `WESTERN_VALE_VILLAGES_PLAN.md`'s Barolo cast. This is exactly the "useful marriage" Lucan has been pushing his mother toward: it ties the old, coin-poor nobility of House Veyre to a real viscounty. Maelin is privately proud and privately uneasy — her daughter married well, but married north and hard, away from Barolo's vines.

Their heir, **Garreth Reyner**, is unmarried and a live piece on the board (see below).

Harwick's own castellan: **Lord Aldric Penn** of **Pennborough**, Baldric's cousin and most loyal bannerman — and the man who feels the levy-poaching problem worst of all, since it's literally his garrison the Crown castles draw from.

**Harwick's three villages:**

- **Caldby** — hill-farming and wool, feeds Harwick's garrisons with mutton and conscripts. Plain tenants, no resident nobility; the Broadmead model. Its friction is grazing rights on the high pasture versus the levy's demand for carts and mules every muster season.
- **Esthorpe** — a smaller border hamlet with a real tradition of supplying archers and scouts to House Reyner. A point of local pride rather than resentment; Esthorpe men have fought under the Reyner banner for generations and expect to be asked by name, not conscripted like strangers.
- **Addercombe** — home to **House Thorne**, a minor noble line with no jurisdiction over the village (the Veyre model, martial flavor instead of agricultural). Once a name that mattered — old armor and a faded banner still hang in Thorne Hall — but the family's martial glory outlived its income generations ago, and its head, an aging and proud knight, supplies a handful of household men-at-arms to Reyner's levy rather than coin, which is all the house has left to offer.

### Viscounty of Hartwell — House Falwick (the mercantile, Dunmow-adjacent viscounty)

**Viscountess Odile Falwick**, shrewd and commercially minded, resents that Langston gets to be the Vale's one recognized market hub (full Contract Board, the regional trade panel) despite Hartwell producing comparable wealth. A legitimate grievance, not spite — her viscounty is doing the work and Langston gets the name for it.

Her consort, **Milo Falwick**, is a cousin of **Master Cellan Durnell** of Barolo. That's a real, standing tie between Hartwell and merchant money: it's part of why Falwick runs its viscounty like a counting house, and it's a quiet sore point with older nobility like the Veyres, who consider Falwick's wealth a little too recently laundered through trade to be entirely respectable. It's also Cellan Durnell's best current argument for his own house's recognition — "the Falwicks already married in; why not acknowledge what's already true."

Their heir, **Wren Falwick**, is as shrewd as her mother and the other live piece on the board.

Hartwell's own castellan: **Lady Fenella Rourke** of **Rourkethwaite**, who guards a river crossing rather than a mountain pass and is, by implication rather than open accusation, comfortable looking the other way on an untithed cask or a quietly re-marked wagon when it serves her own purse — the same rural-underworld pattern `WESTERN_VALE_VILLAGES_PLAN.md` already uses for Broadmead and Harrowfield, just a tier higher up the ladder this time.

**Hartwell's three villages:**

- **Millstow** — grain and milling on the river, the plainest of the three: tenants, a mill, a grain market. No resident nobility; its friction is toll rates and whose grain gets milled first on a crowded day.
- **Oxworth** — cattle and trade stock, a droving village hard against Hartwell's own gate and the downs road beyond it. Plain tenants; its friction is droving rights of way across other men's fields during the autumn drive.
- **Palmcote** — home to **House Ferrand**, who bought their way into minor nobility two generations ago on trade money, same as the Durnells are trying to do now. This is the direct answer to Cellan Durnell's argument in Barolo: "the Ferrands managed it, why not us." The Ferrands have no public jurisdiction over Palmcote (the Veyre/Thorne model again), and old blood like the Veyres privately still consider them jumped-up merchants in a manor, three generations in or not.

A deliberate pattern across all three clusters: Langston has House Veyre (old blood, no money), Harwick has House Thorne (old blood, faded martial glory), Hartwell has House Ferrand (new money, bought the title) — three different answers to "what is minor nobility without land to govern," each a different flavor, none of them a repeat.

### The Two Crown Marcher Castellans

Sworn straight to Avelina, not to either viscounty — and they don't agree with each other:

- **Lord Corin Ashdown**, castellan of **Carrowmark**. Old border-warden stock, and privately thinks Avelina's restraint toward Karr is closer to cowardice than wisdom. Not disloyal enough to be a traitor, but the kind of man who lets a skirmish run a little longer than Dunmow would like, and who the Countess has had to quietly rein in more than once. He's a believable, unforced *source* of the "regular skirmishes" rather than something she orders.
- **Lady Perrin Hollis**, castellan of **Dennholt**. The dove to Ashdown's hawk — she's seen the border up close long enough to actually want peace, not just avoid war, and is rumored (not yet canon) to keep an unofficial, deniable line of contact on the Karr side of the pass. A possible future hook rather than something to resolve now: fully inventing Karr's own nobility is its own project, out of scope here.

### How It's All Interconnected (the messiness)

- **Old nobility vs. new money:** Veyre (old, prestigious, coin-poor) marries into Reyner (martial, respected); Durnell (merchant, ambitious) already has a foothold in Falwick (mercantile, wealthy) through Milo. Neither viscounty is "the good one" — Harwick looks down on Hartwell's trade money, Hartwell looks down on Harwick's debt-ridden pride.
- **A dynastic match waiting to happen:** Garreth Reyner and Wren Falwick are both unmarried heirs of the right age. Uniting Harwick and Hartwell by marriage would be the obvious next move for either house's ambition — and exactly the kind of consolidation a Countess has to watch for, since two viscounties acting as one bloc would outweigh Dunmow's own direct demesne. Avelina doesn't need to forbid it outright; she just needs a reason to be quietly, plausibly slow about approving it.
- **Loyal doesn't mean agreeable:** all four castellans and both viscounts are genuinely sworn to Avelina — none of this is a rebellion plot — but Ashdown wants more war than she'll allow, Reyner wants more command than she'll grant, Falwick wants more recognition than Langston's status leaves room for, and Rourke is making a little extra on the side. That's the texture asked for: regular friction, no clean villain.
- **The casus belli sits above all of it.** Every one of these houses has an opinion on whether Avelina should press her father's old claim on Karr's mineral ground, and none of them agree — which is exactly why she's been able to leave it unresolved for thirty years without any single vassal forcing her hand.

## Resources and the Trade Simulator (implemented this session, 2026-11-12)

Unlike everything above, this part is **live, not just planned** — the 11 new settlements, their populations, and their production are already written into `web/mygame/overworld-data.js` (map tiles + roads), `tools/market_defs.json` (settlements, demand, industry) and `tools/gear_catalog.json` (commodity makers), and the full generator chain (`gen_gear.js` → `gen_world.js` → `gen_markets.js` → `compile.js`) runs clean.

**Map positions, round two (2026-11-12).** The first layout was placed by extending coordinates without checking the drawn terrain, and it showed: two villages (Millstow, Oxworth) landed on the drawn shoreline, and the whole cluster read too far south on the rendered map. Corrected by checking candidate coordinates against the actual water/coast/mountain polygons in `overworld-art.js` (see [[feedback-verify-terrain-before-placing-nodes]]) and shifting the whole cluster north, clear of the coastline. Edge mileages were recomputed to match the ~6.5-mile-per-map-unit local scale the cluster borders (the nw/bm/fm edges), rather than carried over from the old, wrong positions. Still a first-guess layout in the sense that nobody sketched it — just one that's now at least geographically valid.

**Gault stays deliberately resource-incomplete, per the user's own call:** no iron anywhere in these villages (reinforces the whole Gault-Karr-Scales premise), and no dedicated timber industry (the user: forest-adjacent places get ambient minor timber/fur without a dedicated industry — Langston already has exactly this, as a minor maker of `longshade_timber`, `charcoal`, `raw_hide` and `furs`).

### Settlement Production

| Settlement | Pop | Tier | Produces |
|---|---|---|---|
| Dunmow (city) | 4500 | direct demesne | **Linen** (major, woven from Reedmere's flax), fish (minor, Azure Lake) |
| Harwick (town) | 2000 | Viscounty seat | **Wool Cloth** (major, woven from Caldby's wool) + **Leather** (major, tanned from the Vale's raw hide) |
| Hartwell (town) | 2600 | Viscounty seat | **Oil** (major, pressed from Palmcote's olives) |
| Reedmere | 450 | Dunmow's own | **Flax** (major), fish (minor) |
| Oatcroft | 600 | Dunmow's own | Grain (major), timber/charcoal/raw hide/furs/boar meat (all minor, forest edge), fish (minor, Azure Lake) |
| Caldby | 500 | Harwick's | Wool (major), timber/charcoal/raw hide/furs/boar meat (all minor, forest edge) |
| Esthorpe | 300 | Harwick's | Farm eggs (minor) — kept deliberately thin, a border hamlet not a farming village |
| Addercombe | 350 | Harwick's | Orchard apples (minor) — House Thorne's faded estate |
| Millstow | 650 | Hartwell's | Grain (major), barley loaf (major) |
| Oxworth | 550 | Hartwell's | Animal fat (minor), raw hide (minor) — cattle droving, no dedicated beef commodity exists so byproducts stand in |
| Palmcote | 500 | Hartwell's | **Olives** (major) — picked and carted off, not pressed on the spot (see below) |

### The Four New Commodities

Modeled directly on existing precedent rather than invented from scratch:

- **Olives** (consumable, local range) and **Oil** (ingredient, far range) — Palmcote grows the olives; **Hartwell presses them into oil** (`inputs: {"olives": 0.6}`). Originally self-contained at Palmcote alone (the Barolo grapes→wine pattern); moved to a cross-tile chain on 2026-11-14, below, to match the village-grows/town-refines rule.
- **Flax** (ingredient, regional range, raw_material) and **Linen** (ingredient, far range, worked_material, `inputs: {"flax": 0.6}`) — Reedmere grows the flax, **Dunmow weaves it into linen** (the wool→wool_cloth pattern: raw material from a village, weaving at a town/city). This keeps Linen inside the Countess's own demesne rather than creating a cross-viscounty dependency; that's a choice, not a constraint — it could instead go to Harwick or Hartwell if a forced economic tie between the two rival viscounties is wanted as another political lever.
- All four added to `market_defs.json`'s `demand` (units/1000 people/day: olives 12, oil 10, flax 3, linen 8) and `dseason` (olives/oil follow grapes/wine's autumn-harvest curve; flax/linen left flat, same as hemp/wool_cloth).

### Villages Produce, Towns Refine (added 2026-11-14, closes last session's genuine economic gap)

Dunmow's flax→linen chain was already this pattern; made it an explicit rule and applied it everywhere a town sits next to its own raw material, rather than letting a village do both ends:

- **Oil moved from Palmcote to Hartwell.** Palmcote still grows and picks the olives (its only commodity now); Hartwell presses them, same shape as Dunmow/Reedmere's flax→linen. `tools/gear_catalog.json`: `oil`'s maker changed from `pc` to `ht`, with `inputs: {"olives": 0.6}` added so its output actually depends on Palmcote's supply. `market_defs.json`'s `industry` gained `"ht": {"olives": 15}` (a first-guess number, scaled down from Dunmow's flax-25-for-pop-4500 ratio; open to retuning).
- **This also closes the one real gap flagged last session:** Caldby's wool and the Vale's scattered minor raw hide (Oxworth, Oatcroft, Caldby) had no weaver or tannery anywhere in Gault's own territory, so both left the realm to be finished elsewhere and came back bought. **Harwick is now a major maker of both Wool Cloth and Leather** (`tools/gear_catalog.json`: added `"hk": "major"` to each; both already had `inputs` on wool/raw_hide from the existing precedent). `market_defs.json`'s `industry` gained `"hk": {"wool": 10, "raw_hide": 10}` (also first-guess numbers). This doubles as a thematic fit: a border-garrison town finishing its own wool and hide into cloth and leather supplies its own levy's gear, which sits well with House Reyner's martial character.
- **Harwick and Hartwell stop being pure consumer towns** and get an actual trade identity each — Harwick textiles/leather, Hartwell oil pressing — rather than just drawing on their villages without giving anything back.

### What Wasn't Deeply Verified

The generator chain runs clean with no errors, and the known self-sufficiency machinery (`world.margin`/`coverFloor`/`pullExp` in `market_defs.json`) applies automatically to everything added. But I did not hand-verify that, say, regional grain actually clears demand with Oatcroft and Millstow added, the way the project's own precedent did for fish ("Timbermouth is a minor maker eaten almost whole by its own townsfolk, leaving Barleycross starved on the global setting," caught and overridden after the fact). None of the 11 new settlements have a player-facing market scene yet (same "map connections only" status as Whitefold before its village scenes existed), so there's no in-game way to inspect actual resulting prices yet either. Worth a dedicated pass once there's a way to actually look at the numbers.

## Open Decisions Before Naming Anything

Flagging these rather than guessing past them, since they're creative calls:

1. ~~The Countess's name and disposition~~ — **settled:** Countess Avelina Gault, pragmatic over hawkish, the broken promise of her father's reign shaping her reluctance to press the claim all the way. See History above.
2. ~~Names for the two new towns and their houses~~ — **settled:** Viscounty of Harwick (House Reyner, martial) and Viscounty of Hartwell (House Falwick, mercantile). See The Peerage above.
3. ~~Whether the two viscounties should contrast~~ — **settled:** Harwick is border-facing and proud but cash-poor and under-commanded; Hartwell is wealthy and trade-connected but status-starved next to Langston.
4. ~~Names for the villages~~ — **settled:** Harwick holds Caldby, Esthorpe and Addercombe (House Thorne); Hartwell holds Millstow, Oxworth and Palmcote (House Ferrand); Dunmow holds Reedmere and Oatcroft. One minor-nobility village per cluster (Veyre/Thorne/Ferrand), the rest plain tenants. See The Peerage above. Full G.U.A.R.D.S.-depth writeups (places of interest, named NPCs beyond the noble family, trade identity) are a later pass, same as `WESTERN_VALE_VILLAGES_PLAN.md` did for Langston's three.
5. ~~Names and houses for the 4 castellan Lords/Ladies~~ — **settled:** Lord Aldric Penn (Pennborough, Harwick's own), Lady Fenella Rourke (Rourkethwaite, Hartwell's own), Lord Corin Ashdown (Carrowmark, Crown, hawkish) and Lady Perrin Hollis (Dennholt, Crown, dovish). See The Peerage above.
6. **How the broken promise reads in play** — is it common knowledge, tavern rumor, something only nobility discuss openly while commoners get a simpler story, or a hook reserved for a later quest/codex unlock (following the existing `codex_house_gault`/`codex_baron_karr` flag pattern)?
7. **Whether the Garreth Reyner / Wren Falwick match actually happens eventually**, and if so, on what timescale relative to the player's own story — a slow-burn background thread, or something a quest can hang off of directly.

## Source Pointers

- `WESTERN_VALE_VILLAGES_PLAN.md` — Langston, its villages, House Veyre precedent, Mayor Anathram.
- `web/mygame/lorebook-data.js` — `house_gault`, `stenmark`, `baron_karr`, `iron_bailiffs`, `western_vale` entries (existing canon, to extend not contradict).
- `web/mygame/overworld-data.js` — map tiles for Langston, Barolo, Broadmead, Fallowmere, Carrowmark, Dennholt, and the downs road network (`rn1`/`rn2`/`rn3`/`fn`/`fw`).
