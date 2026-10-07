# Timbermouth Regional Plan

## 0. Status and Design Constraints

**Implementation status (2026-10-07):** a placeholder hub is built in `web/mygame/scenes/timbermouth/` (the hub `timbermouth.txt` plus one file per place), with the setting, the three location-intro layers, the day and night cycle (hours and closure pages) and the places as empty pages (five: the timber market and the general market of section 3 were merged into one "Market" on 2026-10-07 at the user's call), reached only from the developer menu ("Jump to Timbermouth"). A short Lorebook entry (`web/mygame/lorebook-timbermouth.js`) unlocks on the first visit. The road is built too (2026-10-07): Port Valen, three road tiles and Timbermouth on an overworld point-and-click map (`web/mygame/overworld-data.js`, `overworldmap.js`, `scenes/overworld/overworld.txt`), 10 miles a tile, 20 miles a day on foot, entered from the Charter Gate and from Timbermouth's old-road exit. Not built: events on the road, camps and food, other tiles (Alderford, the villages), the Town Factor and any named person, shops, quests, the job board. The hours are a first draft, all in `tm_hours` in the hub.

This document establishes Timbermouth as the next town within the Gilded Scales' territory. It is a regional settlement plan, not yet an implementation plan for a specific quest.

### Locked decisions

- **Timbermouth is a town, not a Port Valen district.** Its repeating game hub is named **Timbermouth**.
- **One hub only.** Individual places return directly to the Timbermouth hub; none becomes another district or nested town hub.
- **Six selectable places at most.** Three express the town's timber identity and three serve ordinary town life.
- **The Gilded Scales are the state.** Port Valen is the seat of an oligarchy governed by merchant lords and Factors. Timbermouth is one of its subject towns, not part of another kingdom's land.
- **The regional economy has three layers:** villages produce raw goods, Timbermouth collects and processes them, and Port Valen finances, consumes, and exports them.
- **Timbermouth is not another river town.** Alderford already owns the navigable-river, weir, barge, and bulk-freight identity.
- **The surrounding forest is the Longshade Forest**, usually shortened to **the Longshade**.
- **Longshade ash is the signature timber.** It is a valuable natural hardwood, not magical wood.
- **Use plain language.** Do not add places or prose built around the terms `boom`, `wharf`, or `dray`. Prefer plain words such as market, wagon, cart, chain, gate, and stable where they are accurate.

### Provisional decisions to confirm during map work

- Timbermouth is about **40 miles east of Port Valen**, reached through the Charter Gate along the old imperial road.
- The town stands at the western mouth of the Longshade, where several forest and village roads meet that paved road.
- The name refers to the opening through which the Longshade's timber trade reaches the main road. It does not require a river mouth.
- Three feeder villages are enough for the first regional pass. More villages should only be added when they have playable work or a distinct economic purpose.

---

## 1. Continuity Check: Why the Location Works

### What is already established

- The Grey River begins at Alderford and runs thirty miles to Port Valen. It already forms a complete trade route with a clear beginning and end.
- Alderford is the northern river gateway. It handles the weir, barges, highland freight, rough-cut timber, fish curing, and goods coming down from the Crags.
- Port Valen's Charter Gate opens onto an old imperial road that runs east and climbs into uplands beyond the city.
- Salt and wine traffic already uses the eastern gate, proving that it is a working freight road rather than an abandoned track.
- A Port Valen notice already asks for an escort for a coal-and-iron wagon travelling two days to Timbermouth.
- The current overworld mock covers the Grey River corridor only and explicitly treats its terrain arrangement as provisional. Timbermouth can sit beyond that first map without displacing Alderford, the Western Vale, or the Great Sedge.

### Rejected placement: a second navigable river

A second river would repeat too much of Alderford:

- Water would again explain the town's location.
- Timber would again travel as bulk freight by water.
- The arrival imagery would again center on boats, landings, warehouses, and river labor.
- Road travel and future mounts would become secondary to the cheaper water route.

Timbermouth therefore has ordinary wells, springs, and small local watercourses as needed for daily life, but **no navigable river and no water-based regional identity**.

### Chosen placement: an inland road junction

The old imperial road climbs east from Port Valen into wooded uplands. Timbermouth stands at the western mouth of the Longshade, where that road meets three smaller roads serving the forest and nearby villages. The ground is firm enough for loaded wagons, and the surviving imperial road makes a two-day freight journey believable.

The town began as an inspection and supply stop at the edge of the managed forest. It grew because raw goods from the villages could be collected, processed, taxed, and placed under one Factor before travelling to Port Valen.

This gives the two towns separate functions:

| Settlement | Regional function |
|---|---|
| **Alderford** | Northern gateway for bulk goods carried by river: highland freight, rough timber, fish, and barge traffic. |
| **Timbermouth** | Eastern road town for finished woodcraft, wagons, barrels, village produce, and overland trade. |
| **Port Valen** | Capital, financial center, mass consumer, sea port, and exporter to the wider world. |

---

## 2. Settlement Scale and Identity

Timbermouth should feel comparable in playable size to one Port Valen district, while remaining a complete town in the fiction.

- **Permanent population:** roughly 2,000 to 3,000 people.
- **Marketday population:** larger because villagers, forest workers, merchants, and wagon crews come in from the surrounding area.
- **Physical scale:** about fifteen minutes across on foot.
- **Government:** one Town Factor appointed by the Council of Factors in Port Valen.
- **Defence:** a small town watch answerable to the Town Factor; no separate lord, royal garrison, or competing kingdom.
- **Economic identity:** finished wood goods and road transport, supported by a broader market in food, animals, pottery, hides, and ordinary supplies.

Timber remains the source of the town's name and its most visible trade, but it should not account for every job, building, shop, or quest.

---

## 2.1 The Longshade Forest and Its Timber

The Longshade is a mixed upland forest rather than a single-species plantation or a magical wood. Ash is its prized tree, with oak and pine supporting the ordinary economy.

### Longshade ash

Longshade ash grows slowly in the thin, stony soil of the forest slopes. A mature tree produces long sections with straight grain and few knots. The wood flexes under repeated impacts and resists splitting, making it valuable for things that take constant strain.

**Best uses:**

- Wheel spokes and rims.
- Tool handles.
- Cart and wagon parts.
- Bows and practice weapons.
- Quality furniture and fitted interior woodwork.

**Limits:**

- It is not naturally resistant to rot.
- Fresh ash twists or cracks when dried too quickly.
- It needs slow seasoning before a craftsperson can trust it.
- It is not a replacement for the massive highland oak beams used in shipbuilding.
- Its value comes from flexibility, clean grain, and skilled finishing rather than supernatural strength.

### Other Longshade woods

| Wood | Regional role |
|---|---|
| **Lowland oak** | Barrels, doors, heavy frames, workbenches, and durable furniture. |
| **Common pine** | Crates, cheap boards, shingles, firewood, resin, and pitch. |
| **Birch and smaller mixed wood** | Bowls, pegs, handles, household repairs, and fuel. |

The Gilded Scales protect the Longshade ash name as a commercial grade. Timber sold under that name must meet the town's grain, age, and seasoning standards. This creates room for honest inspection, false grading, illegal cutting, rushed drying, and merchants passing ordinary ash off as Longshade stock.

---

## 3. The Six Places

The player enters the repeating **Timbermouth** hub and chooses among no more than six places. All six return directly to Timbermouth.

### Three places tied to the town's theme

1. **The Timber Market**
   - Longshade ash, oak, pine, and other cut wood arrive from the forest village.
   - Inspectors grade loads, merchants bid, and the Factor's clerks collect the town's fee.
   - Suitable for contracts, price disputes, theft, false grading, and labor work.

2. **The Sawmill**
   - Removes bark, damaged wood, and unusable weight before anything begins the long road to Port Valen.
   - Produces planks, boards, beams, shingles, and smaller pieces for local workshops.
   - Suitable for paid shifts, accidents, supply problems, and conflicts between output quotas and safe work.

3. **The Woodworkers' Workshops**
   - Produces barrels, crates, wheels, carts, doors, furniture, tool handles, and fitted building pieces.
   - This is Timbermouth's real advantage over Alderford: it exports finished goods worth hauling by road, not entire forests in raw form.
   - Suitable for crafting, specialist shops, apprenticeships, repairs, and larger Port Valen orders.

### Three places serving ordinary town life

4. **The Factor's Hall**
   - Town government, hearings, contracts, permits, banking, taxes, and Gilded Scales standing.
   - The Town Factor works here and speaks for the oligarchy.
   - Village disputes and Port Valen orders eventually pass through this building.

5. **The General Market**
   - Sells food, clothing, tools, pottery, animal feed, household goods, and produce brought in by the villages.
   - Keeps the town from reading as one large timber workplace.
   - Provides space for ordinary shopping, rumors, small jobs, and changing Marketday activity.

6. **The Split Pine Inn and Stables**
   - Lodging, meals, rumors, gambling, caravan arrangements, mount care, and wagon storage.
   - Serves as the practical home for the future mount system in Timbermouth.
   - One establishment can contain both the inn and its stable without creating a seventh selectable place.

### Non-selectable infrastructure

The town gates, wells, crossroads, watch post, small smithies, storage buildings, and residential streets appear in arrival and travel prose. They do not require separate menu entries unless later content proves that one can support repeated gameplay.

---

## 4. The Village Layer

The villages are not miniature towns. Each has one clear economic purpose, a small population, and at most one compact playable hub if it is later opened to the player.

Working names should remain provisional until the expanded map fixes terrain and direction.

### 4.1 Forest village

**Distance from Timbermouth:** about 8 to 10 miles along the Forest Road.

**Produces:**

- Longshade ash, oak, pine, and other raw logs.
- Resin and pitch.
- Bark used in leather work.
- Firewood and charcoal, primarily for local use.
- Gathered plants, mushrooms, and seasonal food.

**Receives:**

- Grain and preserved food.
- Iron axes, saws, wedges, and replacement parts.
- Clothing, salt, medicine, and credit.

Small temporary logging camps farther into the forest send their loads to this village first. They are work sites, not additional settlements that need their own markets and government.

### 4.2 Farming village

**Distance from Timbermouth:** about 5 to 7 miles along the Farm Road.

**Produces:**

- Barley, oats, root vegetables, and hay.
- Milk, eggs, pigs, and poultry.
- Hides, wool, and tallow in modest quantities.
- Mules and sturdy working horses.

**Receives:**

- Iron tools and horseshoes.
- Timber for fences, carts, roofs, and repairs.
- Pottery, salt, cloth, and access to Gilded Scales credit.

This village supplies the town's daily food and gives the future mount system a believable local source without making Timbermouth itself a horse-breeding settlement.

---

## 5. Economic Flow

### The three layers

```text
Forest village ---- Longshade ash, other wood, resin, bark ----\
Farming village --- food, animals, hides ------> Timbermouth ---- finished goods and combined loads ---->

Forest village <--- tools, food, credit --------\
Farming village <-- tools, timber, salt ---------- Timbermouth <--- iron, coal, coin, imports, contracts --- Port Valen

### Why the road economy is credible

Raw logs are heavy and low in value for their weight. Timbermouth should not routinely haul whole tree trunks forty miles to Port Valen. The town earns its place by removing waste and turning local wood into goods worth transporting:

- Barrels and crates carry other cargo, so their transport cost serves two purposes.
- Carts and wagons can travel under their own wheels or be sent in parts.
- Wheels, tool handles, doors, furniture, and fitted building pieces are worth more than raw logs.
- Planks and boards are cut to standard sizes and packed without bark, branches, or unusable sections.
- Resin and pitch travel in sealed containers rather than as raw forest material.

Port Valen sends iron and coal east because Timbermouth's workshops and smithies need them. The same wagons return west carrying finished Longshade ash goods, pottery, hides, and village produce. This reduces empty return journeys and supports the existing coal-and-iron escort notice.

### Goods that remain Alderford's responsibility

To preserve settlement identities, the following should continue to favor Alderford and the Grey River route:

- Large volumes of rough highland timber.
- Very long ship beams and mast timber.
- Highland iron and coal moving south in bulk.
- Grain barges and other heavy river freight.
- River fish curing and the weir economy.

Timbermouth may work on smaller ship orders, barrels, replacement pieces, and fitted parts, but it should not replace Alderford as the source of Port Valen's bulk ship timber.

---

## 6. Roads and Travel

### 6.1 Port Valen to Timbermouth

**Route:** Port Valen's Charter Gate -> old imperial road through the eastern uplands -> Timbermouth.

**Working distance:** 40 miles, or 8 hexes at the current 5-mile scale.

| Travel method | Normal one-way time | Design purpose |
|---|---:|---|
| On foot | 2 days | Requires a road camp or roadside lodging. |
| Riding horse, steady pace | 1.5 days | Saves meaningful time without erasing the journey. |
| Riding horse, hard pace | 1 long day | Requires mount fatigue and risk once that system exists. |
| Laden wagon | 2 days in good conditions | Matches the existing Timbermouth escort notice. |
| Laden wagon after sustained rain | Up to 3 days | Lets `ground_state` matter without changing the base map distance. |
| Relay courier using fresh horses | About 1 day | Reserved for official messages or expensive travel, not ordinary player movement. |

The imperial road should be better near Port Valen and more worn as it climbs. It remains passable to wagons because the Gilded Scales depend on the taxes and goods moving over it.

There is **no routine river or sea shortcut** between Port Valen and Timbermouth. The road is the relationship, which preserves the value of walking, mounts, caravans, weather, roadside stops, and escort work.

### 6.2 Timbermouth to its villages

| Route | Approximate distance | On foot | Horse | Laden cart |
|---|---:|---:|---:|---:|
| Forest Road | 8-10 miles | 3-4 hours | 1.5-2 hours | 4-5 hours |
| Farm Road | 5-7 miles | 2-3 hours | About 1 hour | 3-4 hours ||

These are local trips rather than multi-day journeys. A mount lets the player visit a village and return with useful time left in the day, while walking may commit most of the working day once the visit itself is included.

### 6.3 Road shape

```text
                              Forest village and logging camps
                                           |
                                      Forest Road
                                           |
Port Valen ===== old imperial road ===== Timbermouth
                                          /      
                                  Farm Road      
                                      /             
                              Farming village     
```

The village roads meet at Timbermouth rather than bypassing it. This is why the Town Factor can inspect, tax, finance, and redirect the region's trade.

---

## 7. Government and the Gilded Scales

Timbermouth makes the Gilded Scales visible as a government rather than merely a merchant guild.

### The Town Factor

- Appointed by the Council of Factors in Port Valen.
- Governs the town in the Council's name.
- Controls trade permits, town taxes, public contracts, road spending, and the local watch.
- Hears commercial disputes and can pass serious criminal matters to Port Valen.
- Maintains clerks in the Factor's Hall and inspectors at the Timber Market.
- Can advance Gilded Scales credit to workshops and villages, creating both opportunity and debt.

### Local authority below the Factor

- Workshop masters can petition collectively but do not constitute a separate government.
- Each village has a local head or council responsible for ordinary disputes and shared work.
- Village authorities answer to the Town Factor on taxes, contracts, road upkeep, and serious crime.
- The local watch serves the state and protects trade, but it should not be written as a private guard force belonging personally to the Factor.

### Central political pressure

The Council wants reliable output, taxes, and road traffic. The Town Factor must meet those demands while keeping workshops open and villages productive. This naturally creates conflicts over prices, debt, inspection standards, road repairs, forest limits, and which community absorbs a shortage.

---

## 8. Central NPC Cast

The first cast should connect the three economic layers and give Timbermouth personal ties to existing characters without making every important person related. Names are checked against the current project and do not duplicate an existing named character.

### 8.1 Factor Sabine Halloran — Town Factor

**Primary place:** The Factor's Hall.

**Public role:** Sabine governs Timbermouth for the Council of Factors. She controls public contracts, road spending, trade permits, the local watch, and the official grading rules for Longshade ash.

**Introduction anchor:** A tall woman in her middle years, with dark hair going silver at the temples, a green oak-leaf clasp at her collar, and ink worked into the side of one forefinger. The player learns her office and name from the hall staff or from Sabine herself, not from narration.

**Background:** Sabine comes from a younger branch of House Halloran, the Port Valen merchant house whose green gate bears the gilt oak leaf. She began as a contract clerk in the Gilded Scales Head House rather than inheriting a Council seat. Twelve years ago House Halloran put her forward for the deputy's post in Timbermouth, and the Council appointed her to repair a failing system of workshop loans. The Council later raised her to Town Factor when her predecessor was recalled after road-tax money disappeared from the accounts.

Sabine believes the oligarchy works because contracts outlast individual rulers. She does not steal from the town chest and has no patience for clerks who do. She will still close a workshop, seize tools, or raise a village quota when Port Valen's orders require it. In her view, predictable hardship is better than a broken trade system.

**Current pressure:** House Halloran expects rising Longshade ash profits, while the forest village insists that the mature ash stands cannot sustain another increase. Sabine's family connection helped earn her office and can also remove her from it.

**Established-world connections:**

- House Halloran gives Timbermouth a direct line into the Council's merchant politics.
- Teller Maris Quillon and Registrar Corwin Ashe know Sabine from her years at the Head House, though neither needs to become a close friend.
- She negotiates with Factor Morzan over the price and priority of highland coal and iron passing through Alderford. Each believes the other's office adds too much to the cost.

**Voice:** Precise and patient. She answers the question asked, states the cost, and dislikes moral speeches that do not include a workable alternative.

**Story use:** Sabine can act as patron, obstacle, or reluctant ally depending on whether the player protects the trade system, exposes abuse inside it, or threatens House Halloran's interests.

### 8.2 Master Edda Roan — Senior Woodworker

**Primary place:** The Woodworkers' Workshops.

**Public role:** Edda is the most respected wheelwright and senior voice among Timbermouth's independent workshops. She does not govern the craftspeople, but when a large order must be divided among several shops, she is usually the person trusted to divide it.

**Introduction anchor:** A square-built woman with cropped iron-grey hair, two old breaks set crooked in her left hand, and pale curls of fresh wood clinging to her apron. Her name follows when someone addresses her or she gives it.

**Background:** Edda was born in Timbermouth and left as a teenager to apprentice in Port Valen's shipyards. Master Brant taught her to judge strain through the sound of a fitted piece, but she preferred wheels, carts, and joinery to ship frames. She returned when her mother's workshop lost two experienced hands during a fever season and eventually took it over.

Edda built her reputation on refusing wood she would not trust under weight. This makes her valuable to merchants and infuriating to Factors facing deadlines. She can identify Longshade ash by grain and balance, but her real skill is knowing where a finished piece will fail after months of use.

**Current pressure:** A large Port Valen order could keep every workshop paid through winter, but its delivery schedule leaves too little time for newly cut ash to season safely.

**Established-world connections:**

- Master Brant remembers her as an apprentice and still trades technical letters with her.
- She buys hardened cutting tools and replacement saw teeth that ultimately come through Torvald's Alderford forge.
- Halda's Forge in Port Valen supplies iron rims and fittings for some of Edda's wagon orders.

**Voice:** Blunt, physical, and specific. She explains a problem by pointing to the joint, grain, wheel, or tool that will carry the strain.

**Story use:** Edda anchors crafting, workshop employment, safe-work conflicts, and any storyline in which a Port Valen contract demands more than sound materials can provide.

### 8.3 Oren Pike — Timber Inspector

**Primary places:** The Timber Market and the Sawmill.

**Public role:** Oren grades incoming timber for the town. His mark determines whether a load can be sold as Longshade ash, ordinary ash, fuel wood, or waste.

**Introduction anchor:** A lean man with close-cut brown hair, a pale scar crossing one thumb, and fine sawdust caught permanently in the seams of his dark coat. The measuring rule and chalk in his hands show his work before his name is known.

**Background:** Oren grew up in the forest village among cutters and tree planters. He began at the Sawmill and learned inspection after a rushed load twisted inside a finished wagon order. The Town Factor hired him because he could identify where the drying had failed and because he was willing to say it in front of the merchant responsible.

Workers from the forest regard him as someone who crossed to the Factor's side. Merchants dislike how often he lowers a load's grade. Both still seek him when they need an answer they can trust.

**Current pressure:** The Timber Market has begun receiving more young ash than the forest village's cutting records should allow. Oren must determine whether the records are wrong, illegal trees are being cut, or someone is using the Longshade name on wood brought from elsewhere.

**Established-world connections:**

- Oren does not begin with a personal relationship to an existing NPC. His connection is through the timber fraud already present in Port Valen.
- If the player lawfully exposed the green-timber substitution at Brant's shipyard, that outcome can give Oren reason to listen once the player tells him what happened.
- If the player still carries relevant timber evidence or a diverted waybill, Oren may be able to read it, but he must never know the player's involvement without being shown or told.

**Voice:** Careful and restrained. He names what he can prove, separates suspicion from fact, and refuses to improve a grade as a favor.

**Story use:** Oren anchors inspection, fraud, forest limits, and investigations that cross the Timber Market, Sawmill, and villages.

### 8.4 Ressa Hale — Innkeeper and Former Wagoner

**Primary place:** The Split Pine Inn and Stables.

**Public role:** Ressa runs the inn, stable, wagon storage, and message arrangements for travellers using the Port Valen road.

**Introduction anchor:** A broad-shouldered woman with a weathered face, a grey-shot braid, and forearms marked by old rope burns. She usually has a stable key ring at her waist, but introduces herself before any choice names her.

**Background:** Ressa and her older brother, Oswin Hale, spent years driving freight between Port Valen and Timbermouth. They saved enough to leave the road and divided the route between them: Oswin bought the Wagoner's Rest near Port Valen's gates, while Ressa took over the Split Pine at the Timbermouth end. Each inn can send a message, small parcel, or trusted traveller toward the other without inventing a formal postal service.

Ressa stopped driving after a winter journey killed a pair of horses and left the wagon stranded overnight. Nobody died, but she has no patience for merchants who treat animals, weather, and road time as figures that can be argued downward.

**Current pressure:** The road remains profitable, but repeated heavy loads and delayed repairs are making the eastern climb dangerous. Sabine prioritizes the main road near town; wagon crews claim the worst stretch lies beyond the part the town watch regularly sees.

**Established-world connections:**

- Oswin Hale is her brother and business counterpart at the Port Valen end of the road.
- Their inns provide a natural way for rumors and personal news to move between the city and town without either sibling knowing information that was never sent.

**Voice:** Direct, dry, and practical. She asks where a traveller is going, what they are carrying, and whether their animal has eaten before she asks why they are travelling.

**Story use:** Ressa anchors travel, mounts, caravans, road conditions, lodging, and news that has physically arrived from Port Valen.

### 8.5 Lysa Thorn — Speaker for the Forest Village

**Primary places:** The forest village and the Timber Market on trading days.

**Public role:** Lysa speaks for the households that cut, plant, and tend the Longshade. She is not a noble or a Factor. Her authority comes from being trusted to represent the village in contracts and disputes.

**Introduction anchor:** A narrow, upright woman with a long silver-brown braid, resin-darkened fingertips, and a flat wooden map case carried under one arm. Nothing in the initial description assigns her authority; her role emerges when the village asks her to speak.

**Background:** Lysa's family has kept cutting maps for three generations. The maps record which slopes were cut, replanted, damaged by fire, or left to mature. She learned the work from her grandmother and treats the forest as a crop measured across decades rather than a storehouse waiting to be emptied.

Lysa accepts that Timbermouth and Port Valen need the forest's wood. Her dispute is over pace. A mature Longshade ash can be cut once; a workshop order can be rewritten. She brings that arithmetic to the Factor's Hall even when nobody there wants to hear it.

**Current pressure:** Recent quotas require more mature ash than the village says can be cut without stripping an entire slope. At the same time, illegal cutters are taking younger trees and leaving the village to answer for the missing wood.

**Established-world connections:**

- Pine resin, bark, and gathered plants from the village reach Ambrose's still-room and other Port Valen buyers through Timbermouth merchants. This is a trade connection, not an assumed personal friendship.
- Oren grew up under the same village cutting rules. Lysa respects his knowledge but believes his official grades help the Town Factor demand more than the forest can replace.

**Voice:** Calm and persistent. She frames choices in seasons, slopes, and what will still be standing years later.

**Story use:** Lysa gives the village layer its own voice and prevents the forest from existing only as a resource controlled from town.

### 8.6 Relationship Shape

| Relationship | Source of tension or trust |
|---|---|
| Sabine and Edda | Contract deadlines against safe, properly seasoned work. |
| Sabine and Oren | She needs his honest grades but also needs higher output. |
| Sabine and Lysa | State quotas against the forest's replacement rate. |
| Edda and Oren | Mutual respect for sound wood; disagreement over whether inspection alone protects workers. |
| Oren and Lysa | Shared origins, divided responsibilities. |
| Ressa and the others | Road news, transport, lodging, and the practical consequences of their decisions. |

Only two links begin as direct personal relationships with established characters: Edda and Brant, and Ressa and Oswin. The other cross-region links run through houses, contracts, suppliers, and correspondence. This keeps the setting connected without making the cast implausibly intimate.

All connections must still be discovered in play. An NPC never recognizes the player from a distant event unless a message arrived, the player presents evidence, or the player explains what happened.

---

## 9. Quest and Activity Slots

This plan does not lock a main Timbermouth quest yet. It reserves the following grounded conflict areas for later design:

### Town-scale conflicts

- A major Port Valen order forces workshops to choose between speed and safe work.
- Timber inspectors downgrade sound wood so a favored merchant can buy it cheaply.
- A shortage of iron parts stops wagon and barrel production despite full timber stores.
- The Town Factor spends road taxes on the main imperial road while village roads become unusable.
- Workshop debt gives the Factor legal power to seize tools and finished orders.

### Village-to-town conflicts

- The forest village withholds loads after Timbermouth lowers its buying price.
- The farming village's horses fall sick before a large caravan departure.
- A damaged local road traps goods in one village while the Factor still demands the contracted amount.

### First-arrival option

The existing coal-and-iron escort notice is the strongest introduction:

1. The player accepts the escort in Port Valen.
2. The two-day road journey establishes distance, weather, camping, and the future value of mounts.
3. The cargo demonstrates what Timbermouth needs from the capital.
4. Arrival at the Factor's Hall opens the Timbermouth hub.
5. Later travel can be undertaken freely once the route is known.

The escort should be designed separately as a travel contract, with its own success and loss states, rather than folded into this regional plan.

---

## 10. Future Implementation Requirements

When Timbermouth moves from planning into implementation, it will need:

- A dedicated scene folder or scene file, with the hub named Timbermouth.
- A progressive `codex_timbermouth` unlock and a lorebook entry.
- A progressive `codex_longshade` unlock or a gated Longshade section inside Timbermouth's entry.
- A town standing variable only if Timbermouth standing will produce behavior distinct from general Gilded Scales standing.
- Developer jumps that set the discovery, clock, weather, and travel prerequisites.
- Hub arrival prose layered by place, sky, street activity, and any character insight.
- Time-, weather-, and `ground_state`-aware repeat visits.
- Opening hours and visible closure pages for places that shut, without removing their menu choices.
- Inter-town travel measured in hours and days, separate from Port Valen's district travel routine.
- Mount travel added through one shared overland system when mounts are implemented, not hard-coded only for Timbermouth.
- Updates to the overworld map only after Timbermouth's direction and the extent of Gilded Scales territory are fixed.
- A terminology pass ensuring the rejected trade vocabulary is not reintroduced.

---

## 11. Open Decisions

The next planning pass should settle:

1. The exact direction of the imperial road after it leaves Port Valen: due east or east-northeast through the uplands.
3. Whether Timbermouth has its own standing meter or uses only `gilded_scales_rep`.
4. Whether the first trip must be the escort contract or whether free travel can unlock through another route.
5. Where roadside shelter falls on the two-day journey and whether it is a safe inn, a guarded rest stop, or a player-made camp.
6. Which one of the six town places receives the first full quest after the arrival contract.
7. How far the Gilded Scales' territory continues beyond Timbermouth; no neighboring kingdom needs to be named or developed during this phase.
