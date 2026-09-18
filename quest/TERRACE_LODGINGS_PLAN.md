# Implementation Plan: Middle Ward (Second Terrace) & Terrace Lodgings

**Status:** Design Spec & Architectural Contract (Narrative & DM Voice Polished).
**Scale:** Multi-area artisan district & **street-level civic infrastructure / player starter home**. Not faction-altering.
**Precedent:** Follows `quest/RUSTY_ANCHOR_PLAN.md` and `quest/SITTING_BARGE_PLAN.md` in structural rigor, economic realism, and state hygiene under `quest/QUEST_DESIGN_RULES.md`.

---

## Why this district and building exist

1. **It bridges the economic and geographic gulf between the Waterfront and the Heights.**
   Port Valen rises in four distinct terraces. Currently, the game has content at the bottom (Harbor Quayside, Dredge-End canals) and hooks for the top (Civic Heights, Upper Wharves). The **Middle Ward (Second Terrace)** is the missing socio-economic backbone: the thriving, multi-craft artisan borough where lock-wrights, scriveners, apothecaries, coopers, communal bakers, and town clerks live and work.
2. **It avoids craft saturation by differentiating from Alderford.**
   In Alderford, weaving, fleece, flax, and clacking handlooms are already the central emotional and thematic pillar (Saint Althea the Mender, Elspeth's sanctuary). The Middle Ward provides a fresh, distinct, Witcher-style medieval urban identity focused on **security hardware, legal parchment, apothecary stills, heavy cooperage, and communal bakehouses**.
3. **It structures the ward as a living, multi-zone medieval district.**
   Rather than a single dead-end street, the Middle Ward contains five interconnected courts, wynds, and squares (The Conduit Square, Locksmiths' Close, Parchmenters' Wynd, Herb-Pounder Close, and the Cooperage Basin), complete with dynamic day/night shifts, a 7-day weekly calendar, and randomized street vignettes.
4. **It solves the mercenary's foundational housing dilemma without power creep.**
   * The **Carrion Compound Barracks** is free, but it is noisy, crowded with 40 snoring soldiers, offers zero privacy, and mechanically inflicts the **"Restless" (-1 checks)** and **"Rutted" (-2 checks)** debuffs if slept in continuously for 3+ or 6+ nights (`calendar.txt:456–462`).
   * **Sal's Loft in Dredge-End** is locked behind a multi-stage quest, sits in a canal swamp over rotting dock-weed, and is a public tavern loft.
   * **Terrace Lodgings** provides an accessible, modest, private room where the player has their own iron key, a locked door, a quiet bed, and a washstand.
5. **It establishes a grounded starter baseline (Zero Stat Boosts).**
   Per user directive, this is strictly a **starter home**. It provides basic rest, fatigue clearance, and routine relief. It does **not** grant stat buffs or magical power creep. High-tier manors, noble suites, and guild townhouses in Civic Heights can offer luxury amenities later; Terrace Lodgings is an honest, working-class sanctuary.
6. **It matches the newly overhauled 10:1 currency economy.**
   At **1 Silver Mark (10 copper bits) per 7 campaign days**, the rent is authentic to low-fantasy laborer economics (an unskilled laborer earns 3–4c/day gross, the PC earns 6s/month net). A mercenary can comfortably afford 1s/week from contract pay or bounties.

---

## The Pitch, in One Breath

On the Second Terrace, tucked into the Locksmiths' Close above Master Vael's brass-and-iron workshop, the widow of an old Watch sergeant rents whitewashed third-floor garrets to quiet tradesmen and off-duty sellswords. For one silver mark a week, Mistress Kess gives you a cold-hammered iron key, an un-rotted straw-and-flock mattress under cedar shingles, and a clean latch that stays barred against the city—no sergeants kicking your cot at dawn, no squadmates rifling through your kit, and no Watchmen asking questions so long as your rent is in her tin box before the seventh sunset.

---

## 1. District Geography & Multi-Area Urban Architecture

The Middle Ward is laid out as five distinct, interconnected quarters centered around a stone plaza:

```
                   [ Civic Heights (Third Terrace) ]
                                 ▲
                    Stone Switchbacks & Water Stair
                                 │
   ┌─────────────────────────────┴─────────────────────────────┐
   │                                                           │
   ▼                                                           ▼
[ Parchmenters' Wynd & Scriveners ]            [ Herb-Pounder Close & Still-Rooms ]
- Vellum scraping, gallnut ink, wax seals      - Dried barks, resin, stone pestles, salves
- Public scriveners, legal petition stalls     - Field liniments & apothecary tonics
   │                                                           │
   └─────────────────────────────┬─────────────────────────────┘
                                 │
                                 ▼
              [ ◈ THE CONDUIT SQUARE & BAKEHOUSES ◈ ]
                   (Central District Hub & Crossroads)
              - Octagonal limestone freshwater conduit
              - Mother Marda’s communal pie-bakehouse & ovens
              - Town notice board & street gossip
                                 │
   ┌─────────────────────────────┴─────────────────────────────┐
   │                                                           │
   ▼                                                           ▼
[ The Locksmiths' Close ]                      [ The Cooperage & Dray Basin ]
- Terrace Lodgings (Mistress Kess & Cot)       - Heavy barrels, wheelwrights, dray teams
- Master Vael's Lock & Key Workshop            - Teamster taphouse, road freight from slips
   │                                                           │
   └─────────────────────────────┬─────────────────────────────┘
                                 │
                    Stone Switchbacks & Road Cut
                                 ▼
                   [ Harbor Quayside (First Terrace) ]
```

### 1.1. The Conduit Square (Central District Hub)
* **Visuals & Atmosphere:** A broad flagstone plaza centered around an octagonal imperial limestone conduit where fresh upland spring water pours continuously from four bronze lion-head spouts into deep stone basins.
* **Civic Life:** Washerwomen scrub linen, apprentice boys fill coopered pails, and Council bailiffs post stamped proclamations on the central stone pillar.
* **Mother Marda's Communal Bakehouse:** A massive brick-fronted public oven fronted by a painted timber shingle reading *"Mother Marda's Communal Oven"*. Tenement dwellers bring raw dough to bake, and Marda sells hot mutton-and-leek pasties (1 copper bit; clears hunger, +1 Temp HP, +1 DEX checks for 4 hours) and crusted caraway loaves.
  * **Operating Hours:** Shuttered and padlocked at **Night**; ovens stoked and rolls prepped in **Pre-Dawn**; full bustling communal service during **Daytime**; coals banked and tables scrubbed at **Dusk**.
  * **7-Day Dynamic Gossip:** Grounded entirely in weekly neighborhood artisan life (grain prices, teamster squabbles, laundry lye steam, Hallowday chapel quiet) with zero quest dependencies.
  * **Unique District Utility:** Fills the game's missing Dexterity food buff gap (+1 DEX Checks for 4 hours) with affordable working-class street food (1c vs tavern 3c) tailored to the lock-wrights, apprentices, and scriveners of the Second Terrace.
* **Sensory Profile:** Sweet woodsmoke, fresh baking rye, hot mutton drippings, cold rushing mountain water.

### 1.2. The Locksmiths' Close & Terrace Lodgings (Residential Hub)
* **Visuals & Atmosphere:** A quiet, flagged courtyard overhung by heavy oak timbers and seasoned limestone tenements. Workshop shutters display protective iron grilles, brass weighing scales, and rows of ward-cut keys under a forged metal sign shaped like an open padlock reading *"Vael & Son, Lock-Wrights"*.
* **Master Vael's Lock-Wright Shop (Ground Floor):** Occupies the ground floor of Terrace Lodgings. Master Vael shapes precision brass tumblers, iron deadbolts, and strongbox bindings.
* **Terrace Lodgings Interior:**
  * **Ground Floor Landing:** Scrubbed oak floorboards smelling of beeswax and sweetgrass. Beneath a brass wall-plaque reading *"Kess Tenements"*, Mistress Kess sits at her parlor desk with an iron key-board and a locking tin box.
  * **The Rented Room (Third Floor Garret):** Whitewashed rafters, clean straw-and-flock mattress, wool blanket, tin washstand with ceramic pitcher and lye soap, casement window overlooking the slate roofs, thick oak door with an iron drop-bar and deadbolt.
* **Sensory Profile:** Scorched quenching oil, cold metal filings, sweet brass polish, dried lavender. Sound of fine steel files scraping (*scritch-scritch*) and small hammer taps on anvil horns.

### 1.3. Parchmenters' Wynd & Scriveners' Arcade
* **Visuals & Atmosphere:** A narrow, steeply rising wynd hugging the cliff base beneath Civic Heights. Stretched sheepskin and calfskin dry on high wooden stretching frames leaning against upper balconies.
* **Craft & Labor:** Master Orin and his apprentices scrape hair and flesh with curved half-moon scraping blades, rub skins with pumice, and boil oak gallnuts with rusty iron water and beer dregs to brew dark black ink.
* **Scriveners' Stalls:** Public scribes sit behind sloped pine desks under canvas awnings, writing letters for illiterate dockworkers, drafting apprentices' indentures, or preparing legal petitions for council courts above.
* **Sensory Profile:** Bitter gallnut ink, scraped leather shavings, boiled animal glue, melting red beeswax. Sound of scraping blades and scratching quill-nibs.

### 1.4. Herb-Pounder Close & The Distillers' Yard
* **Visuals & Atmosphere:** A damp, aromatic cul-de-sac shaded by cedar eaves. Wicker hampers of wild marsh-mallow, dried wormwood, pine resin, and willow bark line the walls beneath a painted mortar-and-pestle sign reading *"Brand's Still-Room & Physic"*.
* **Craft & Labor:** Master Apothecary Brand operates two copper stills, distilling cleansing spirits, rendering sheep fat into soothing foot-salves for line-soldiers, and grinding dried roots in deep stone mortars.
* **Sensory Profile:** Sharp vinegar, pungent wormwood, crushed camphor, menthol, roasted chicory. Sound of heavy stone pestles rhythmically thudding into granite mortars (*chunk... chunk... chunk*).

### 1.5. The Cooperage Basin & Dray Turn
* **Visuals & Atmosphere:** The lower transition terrace where freight wagons enter from the harbor switchbacks. Beneath a charred timber archway branded with a cooper's adze reading *"Kaelen & Sons, Guild Coopers,"* open-sided curing sheds sit filled with split white oak staves, iron quench troughs, and stacks of herring casks, grain barrels, and beer kegs.
* **Craft & Labor:** Master Cooper Kaelen and his journeymen heat staves over open cressets, bend them with rope windlasses, and drive iron hoops down with heavy sledge-irons (*tink-tink-CLANG*).
* **Sensory Profile:** Scorched white oak, hot metal quenched in rain-water, pine pitch, horse sweat, wet hay.

---

## 2. Character Profiles

| Character | Role & Location | Personality & Voice | Narrative Function |
|---|---|---|---|
| **Mistress Kess** | Tenement Landlady (*Terrace Lodgings*) | Late 50s. Widow of Sergeant Bran Kess (22 years in Watch). Thin, straight-backed, grey linen coil. Speaks like a retired quartermaster—clipped, honest, zero nonsense. | Manages room leases (1s/7d), issues iron keys, guarantees quiet and privacy. |
| **Master Lock-Wright Vael** | Locksmith (*Terrace Lodgings Ground Floor*) | Mid 40s. Calipers tucked into his leather apron, soot on his knuckles. Quiet, meticulous craftsman. | Provides setting flavor; explains key replacement costs; grounds physical security. |
| **Mother Marda** | Communal Baker (*Conduit Square*) | Round, flour-dusted, booming laugh, sharp eye for scroungers. Runs the public ovens. | Sells hot pasties and morning rolls (1c); shares timeless 7-day street gossip; reflects realistic day/night shop hours. |
| **Master Scrivener Orin** | Parchmenter & Scribe (*Parchmenters' Wynd*) | Ink-stained fingers, spectacles, dry bureaucratic wit. | Sells paper, writes letters home, comments on Council legal disputes. |
| **Master Cooper Kaelen** | Master Cooper (*Cooperage Basin*) | Broad-shouldered, beard singed by wood-cressets, deep resonant voice. | Grounds transport logistics and freight traffic from harbor slips. |

---

## 3. Mechanical & Systems Specification

### 3.1. Rental Economics & Lease Tracking
* **Rent Cost:** **1 Silver Mark (10 copper bits)** for **7 campaign days**.
* **Payment State Hygiene:**
  * Uses `currency_txn_locked` with `locked_currency_txn_page_id = choice_page_id` to ensure refresh-safety.
  * Deducts 10 copper bits (`currency_add_amount = 0 - 10`) via `*gosub_scene startup currency_add`.
* **Lease Expiry Logic:**
  * On initial lease:
    ```choicescript
    *set mw_rent_active true
    *set mw_rent_paid_day campaign_day
    *set mw_rent_expiry_day (campaign_day + 7)
    ```
  * On renewal / extension (can be done any time):
    ```choicescript
    *if (campaign_day > mw_rent_expiry_day)
      *set mw_rent_expiry_day (campaign_day + 7)
    *else
      *set mw_rent_expiry_day + 7
    ```
  * If `campaign_day > mw_rent_expiry_day`, the lease is lapsed. Mistress Kess holds the key until 1 Silver Mark is paid.

### 3.2. Rest & Sleep Resolution (`resolve_sleep`)
* **Cost / Time:** Advances the clock by **8 hours** (`hours_to_pass = 8`, `minutes_to_pass = 0`, unique `time_advance_call_id`).
* **Neglect Death Check:** Evaluates `hp_current <= 0` immediately after `advance_time`.
* **Engine Call:** Calls `*gosub_scene calendar resolve_sleep`.
* **Inputs to `resolve_sleep`:**
  ```choicescript
  *set sleep_location_id "terrace_lodgings"
  *set sleep_is_shared false
  *set sleep_tier_name "none"
  *set sleep_tier_stat1 "none"
  *set sleep_tier_bonus1 0
  *set sleep_tier_stat2 "none"
  *set sleep_tier_bonus2 0
  ```
* **Effects:**
  1. Fatigue debt cleared: `neglect_damage_fatigue = 0`, `minutes_since_rest = 0`.
  2. Full health restoration (up to hunger cap): `resolve_sleep` calls `recalc_hp_from_neglect`.
  3. Class long-rest resets: `fighter_second_wind_uses = 1`, `barbarian_rage_uses = 2`, `warlock_spell_slots = 1`.
  4. Routine tracking: Changes `last_sleep_location` to `"terrace_lodgings"`, resetting the barracks streak so the player avoids the "Restless" and "Rutted" penalties.
  5. **Zero Stat Buffs:** Pure restorative rest, no magical or unrealistic modifiers.

### 3.3. Tin Washstand & Personal Grooming
* **Action:** Wash off road slurry, canal scum, and dried combat grime in the tin basin with well-water and lye soap.
* **Cost / Time:** Advances clock by **10 minutes** (`minutes_to_pass = 10`).
* **Effect:** Resets `routine_stage` to `"Settled"` and zeroes `nights_same_location 0`.

### 3.4. Downtime Reflection (Timeless Sanctuary Beat)
* **Action:** Sit on the pine stool by the casement window and let your guard down in private.
* **Cost / Time:** Free / 5 minutes.
* **Narrative Grounding:** A timeless, state-agnostic beat grounded in the immediate physical relief of having four locked walls, watching twilight smoke curl over the slate roofs, and resting without soldiers, bailiffs, or sergeants watching.

### 3.5. Mother Marda’s Communal Bakehouse (Grounded Sustenance & Schedule)
* **Action:** Purchase a piping-hot mutton-and-leek pasty (Day/Dusk) or warm morning caraway roll (Pre-Dawn).
* **Cost:** **1 Copper Bit** (`currency_add_amount = 0 - 1`).
* **Time:** 15 minutes (`minutes_to_pass = 15`).
* **Effect:** Clears hunger debt (`neglect_damage_hunger = 0`, `minutes_since_meal = 0`, calls `recalc_hp_from_neglect`). Provides an authentic working-class meal without the alcohol or brawl risks of waterfront taverns.
* **Operating Hours:**
  * **Night:** Closed and barred behind oak drop-shutters and iron padlocks.
  * **Pre-Dawn:** Firing ovens; morning caraway rolls/bannocks available.
  * **Daytime (Morning, Midday, Afternoon):** Full active communal bakehouse; hot pasties and caraway rye loaves.
  * **Dusk:** Winding down, banking embers.
* **7-Day Dynamic Gossip (Zero Quest Dependencies):**
  * **Marketday:** Farm carts, peck haggling, bailiff flour tax rods.
  * **Forgeday:** Tool grinders under eaves, spark-watching, water buckets.
  * **Tideday:** Heavy harbor drays, iron ingots, teamsters filling up before the cliff road.
  * **Greyday:** Communal laundry lye steam, wet wool, sitting by hearth to dry bones.
  * **Hallowday:** Cathedral chapel quiet, Hallowday dinner pots baking in the embers.
  * **Ironday:** Hard artisan trade roar, cooperage hammers, locksmith files.
  * **Hearthday:** Early tool pack-up, clay pipes, cider, boys rolling knucklebones.

### 3.6. Public Conduit Spring-Water
* **Action:** Cup your hands or drink from the clean bronze spout at the Conduit.
* **Cost:** Free. Cleanses trail dust and provides a brief moment of urban grounding.

---

## 4. Multi-Layered Variation & Dynamic Life

To ensure the district feels alive and unpredictable, it utilizes four distinct layers of narrative variation:

1. **Weather Layer:** 7 distinct weather states (Rain, Storm, Fog, Snow/Sleet, Blizzard, Clear, Overcast) affecting roof drainage, workshop draft-curtains, and mud conditions.
2. **Time-of-Day Shifts:**
   * **Pre-Dawn / Dawn:** Lantern-snuffers, bread-bakers firing ovens, coal draymen unloading, curfew chains dropped.
   * **Day / Afternoon:** Full artisan roar—grinding sparks, scrivener shouting, cooper hoop-strikes, pie-hawkers.
   * **Dusk:** Curfew horn from Civic Heights, shop shutters folded and barred with drop-bolts, smell of boiled cabbage and hearth broth.
   * **Night:** Quiet stone lanes, Watch patrols in heavy leather coats with iron-shod spears, taverns shuttered, scriveners working by sputtering oil lamps.
3. **7-Day Weekly Economic Rhythm:**
   * **Marketday:** Conduit Square packed with upland farm carts, butter tubs, poultry; town bailiffs checking brass scale weights.
   * **Forgeday:** Peak tool and lock maintenance; treadle grinding-stones throwing spark showers under eaves.
   * **Tideday:** Heavy freight day; drays hauling iron bars, resin barrels, and vellum rolls up the switchbacks.
   * **Greyday:** Communal laundry day; boiling lye steam rising behind tenements, washwomen scrubbing smocks.
   * **Hallowday:** Church quiet; Cathedral bells tolling above, shutters barred, wax tapers at Saint Dunstan's wayside shrine.
   * **Ironday:** Hard artisan trade; tax runners, guild inspections, heavy barrel-driving.
   * **Hearthday:** Early closure; craftsmen smoking clay pipes with sour cider, children tossing knucklebones.
4. **Randomized Ambient Street Vignettes:**
   Every arrival in the Conduit Square triggers one of 6 randomized street events:
   * *Vignette 1:* An apprentice cooper chases a runaway beer keg that slipped its chocks, bouncing down the flagstones.
   * *Vignette 2:* Two washerwomen argue loudly at the south conduit spout over whose coopered pail was first in line.
   * *Vignette 3:* A street knifegrinder pumps a treadle stone, offering a razor-edge on your weapons for 1 copper.
   * *Vignette 4:* A street balladeer sings an unflattering satire about the Council's grain tax until a Watchman taps his halberd.
   * *Vignette 5:* A drayman's shaggy terrier sits patiently outside Marda's pie-oven watching for suet scraps.
   * *Vignette 6:* A city bailiff in a pewter badge hammers a fresh price-control parchment onto the central stone notice board.
5. **Perception Filters:** High wisdom (`wisdom >= 13`) or Outlaw origin (`origin = "outlaw"`) surfaces illicit transactions, bailiff bribes, and Watch surveillance patterns.

---

## 5. Beat Sheet & Navigation Map

| Beat Label | Location | Purpose & Mechanics | Exits |
|---|---|---|---|
| `port_valen_middle_ward` | Second Terrace Entry | Arrival from city travel. Sets district, evaluates weather/time/day, rolls random ambient vignette. | `mw_conduit_square` |
| `mw_conduit_square` | Conduit Square | Central district hub. Crossroads leading to all 4 craft quarters, bakehouse, conduit water, and city travel. | `mw_locksmiths_close`, `mw_bakehouse`, `mw_parchment_wynd`, `mw_herb_close`, `mw_cooper_basin`, `port_valen_travel` |
| `mw_bakehouse` | Mother Marda's Oven | Timeless 7-day schedule & hours. Buy pasty/roll (1c; clears hunger, +1 Temp HP, +1 DEX checks for 4h), observe ovens, hear weekly gossip. Shuttered at Night. | `mw_conduit_square` |
| `mw_locksmiths_close` | Locksmiths' Close | Forecourt of Terrace Lodgings and Master Vael's workshop. Inspect locksmith bench or enter lodgings. | `mw_lodgings_entry`, `mw_conduit_square` |
| `mw_lodgings_entry` | Ground Floor Hall | Mistress Kess's desk. Lease room (1s/7d), extend lease, talk to landlady, or climb to room. | `mw_room_hub`, `mw_locksmiths_close` |
| `mw_room_hub` | Third Floor Garret | Private player room hub. Displays lease status. Options: Sleep (8h), Wash (10m), Reflect, Leave. | `mw_room_sleep`, `mw_room_wash`, `mw_room_reflect`, `mw_lodgings_entry` |
| `mw_room_sleep` | Pine Cot | 8-hour restorative sleep. Calls `resolve_sleep`. Fatigue cleared, HP restored via `recalc_hp_from_neglect`, resets class cooldowns and routine. | `mw_room_hub` |
| `mw_room_wash` | Tin Washstand | 10-minute rinse. Cleans blood/mud, resets `routine_stage "Settled"` and `nights_same_location 0`. | `mw_room_hub` |
| `mw_room_reflect` | Casement Window | Timeless downtime introspection beat grounded in private sanctuary. | `mw_room_hub` |
| `mw_parchment_wynd` | Parchmenters' Wynd | Inspect drying vellum frames, observe public scriveners drafting contracts, listen to legal petitioners. | `mw_conduit_square` |
| `mw_herb_close` | Herb-Pounder Close | Inspect drying racks and stills, speak with Master Brand about liniments, observe apprentices grinding barks. | `mw_conduit_square` |
| `mw_cooper_basin` | Cooperage Basin | Inspect barrel-making yards, speak with dray teamsters about valley roads, observe hoop-driving. | `mw_conduit_square` |

---

## 6. Variables Index (`startup.txt`)

```choicescript
*comment ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*comment MIDDLE WARD & TERRACE LODGINGS (RESIDENTIAL STARTER HOME)
*comment ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*create middle_ward_open false             *comment Unlocked by Captain Vane along with other districts
*create mw_seen false                     *comment First arrival narrative trigger for Middle Ward
*create mw_lodgings_seen false            *comment First visit narrative trigger for Terrace Lodgings
*create mw_bakehouse_seen false           *comment First visit narrative trigger for Mother Marda's bakehouse
*create mw_parchment_seen false           *comment First visit narrative trigger for Parchmenters' Wynd
*create mw_herb_seen false                *comment First visit narrative trigger for Herb-Pounder Close
*create mw_cooper_seen false              *comment First visit narrative trigger for Cooperage Basin
*create mw_rent_active false              *comment True if player currently has an active room lease
*create mw_rent_paid_day 0                *comment Campaign day when rent was last paid
*create mw_rent_expiry_day 0              *comment Campaign day when current lease expires (day > expiry = locked)
*create mw_rent_rate_silver 1             *comment Cost per 7 days: 1 Silver Mark (10 copper)
*create mw_vignette_roll 1                *comment Dynamic ambient street event tracker (1-6)
```

---

## 7. Full Verbatim ChoiceScript Specification (`port_valen_middle_ward.txt`)

```choicescript
*comment ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*comment PORT VALEN: MIDDLE WARD & TERRACE LODGINGS
*comment Reached via *goto_scene from port_valen.txt's port_valen_travel_to.
*comment Contains the Conduit Square, Locksmiths' Close, Mother Marda's Bakehouse,
*comment Parchmenters' Wynd, Herb-Pounder Close, Cooperage Basin,
*comment and the Terrace Lodgings residential starter home run by Mistress Kess.
*comment ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

*label port_valen_middle_ward
*set current_district "middle_ward"
[b]◈ THE MIDDLE WARD — SECOND TERRACE[/b]
*line_break

*if (not(mw_seen))
  *set mw_seen true
  The stone road switchbacks climb clear of the brackish quayside mist, leveling out onto the broad flagstone terraces of the Second Terrace. Here, midway between the salt spray of the lower slips and the sheer limestone cliffs of Civic Heights, the Middle Ward hums with the disciplined rhythm of skilled town craft. Sturdy post-and-beam tenements lean toward one another across narrow stone wynds, their overhanging upper storeys nearly touching beneath steep slate gables, while lower shutters stand propped wide as trade counters. The air carries the sharp tang of quenched iron, cold brass filings, drying cedar sawdust, and the rich, comforting warmth of baking caraway bread from communal brick ovens.

*if (weather = "Rain")
  Steady coastal rain streams across the slate gables, cascading from lead downspouts into deep stone street gutters where apprentices leap between pavers under oiled leather capes.
*elseif (weather = "Storm")
  A fierce channel gale howls through the narrow wynds, rattling hanging iron shop signs and whistling through the timber overhangs.
*elseif (weather = "Fog")
  Thick river mist curls up from the lower harbor, settling between the leaning upper storeys and turning horn lanterns into fuzzy amber halos.
*elseif ((weather = "Snow") or (weather = "Sleet"))
  Cold grey slush slicks the granite pavers, shoveled into dirty slush piles along workshop fronts where craftsmen work behind heavy felt draft-curtains.
*elseif (weather = "Blizzard")
  A freezing upland squall sweeps through the lanes, driving snow against timber doorframes and sending artisans indoors behind barred shutters.
*elseif (weather = "Clear")
  Sharp autumn sunlight washes over the red cedar shingles and whitewashed plaster, laundry lines fluttering like banners between the high windows.
*else
  *comment Overcast
  A heavy pewter sky hangs low over the slate rooftops, trapping the aromatic woodsmoke of communal bakehouses and brazier coals in the street cuts.

*label mw_conduit_square
*set mw_vignette_roll ((campaign_day + clock_hour) modulo 6) + 1

[b]◈ CONDUIT SQUARE (MIDDLE WARD CROSSROADS)[/b]
*line_break
At the center of the terrace, an octagonal imperial limestone conduit discharges clear mountain spring-water through four bronze lion-head spouts into deep stone basins. Surrounding the square, timber wynds branch off toward the various craft quarters. Across the flagstones, a massive brick chimney rises above a painted timber sign reading [i]"Mother Marda's Communal Oven,"[/i] venting sweet rye smoke into the air.

*if ((time_period = "Night") or (time_period = "Pre-Dawn"))
  The square is barred and quiet under the swinging horn lanterns. Watchmen in heavy leather coats pace the perimeter in pairs, their spear-butts clicking in measured cadence against the pavers.
*elseif (time_period = "Dusk")
  Apprentices are hauling in trestle displays and bolting heavy drop-shutters across shopfronts. The smell of boiled mutton, leeks, and hearth stew drifts from upper tenement windows.
*else
  *comment Day shifts -- 7-day weekly rhythm
  *if (day_of_week = "Marketday")
    *if ((wisdom >= 13) or (origin = "outlaw"))
      Marketday packs Conduit Square to bursting with valley farm carts, butter tubs, and turnip stalls under propped canvas awnings. Beneath the din of haggling housewives, you clock the subtle currents: a town grain bailiff pocketing a folded coin-chit from an unlicensed flour-carter, while two sharp-eyed street boys in dyed caps shadow a cheese merchant, waiting for the Watch sergeant on the corner to turn his back.
    *else
      Marketday fills the square with upland farm carts and trestle stalls. Country carters shout prices over wheels of sharp yellow curd, sacks of winter oats, and smoked bacon under canvas awnings, while servants from the upper terraces haggle with bakers over caraway loaves.
  *elseif (day_of_week = "Tideday")
    Heavy two-horse drays loaded with raw pig-iron bars, resin casks, and vellum bales rattle up the switchbacks from the morning tide. Drivers pause at the conduit to water steaming horses while apprentices heave bundles of iron strapping into the workshops.
  *elseif (day_of_week = "Hallowday")
    Distant cathedral bells echo from Civic Heights, bringing a solemn quiet to the terrace. Workshop shutters are barred, and families in their best-brushed coats walk toward the parish chapel. At the roadside shrine of Saint Dunstan of the Key, humble reed-lights flicker in the alcove.
  *elseif (day_of_week = "Greyday")
    Heavy river damp hangs between the overhanging timbers, and the communal laundries behind the tenements are thick with steam. Women stir massive iron cauldrons of boiling lye-water over charcoal pits, hanging smocks beneath the sheltering eaves.
  *elseif (day_of_week = "Forgeday")
    The ward rings with metalcraft and maintenance. Itinerant shear-sharpeners and tool-grinders pump treadle stones under the shop overhangs, throwing bright red spark arcs into the air as they hone wood-chisels, leather-awls, and lock-plates.
  *elseif (day_of_week = "Ironday")
    The Middle Ward hits its full working stride. The steady scritch of locksmith files, the thud of apothecary mortars, and the clang of cooperage sledge-irons blend into a continuous, industrious roar across the stone lanes.
  *else
    *comment Hearthday
    *if ((wisdom >= 13) or (origin = "outlaw"))
      Hearthday afternoon brings early closures, but the neighborhood keeps a sharp watch. Under the tavern awnings, retired Watch veterans and elder artisans nurse cider mugs with eyes fixed on newcomers. You feel their gaze tracking your weapon harness and pack—in a quarter where everyone knows their neighbor's rent, an unfamiliar mercenary is cataloged before you take twenty paces.
    *else
      Work winds down early for Hearthday. By afternoon, heavy workshop shutters are propped halfway, and craftsmen gather under tavern awnings smoking clay pipes and drinking sour orchard cider while children toss knucklebones in dry corners.

*line_break
*if (mw_vignette_roll = 1)
  [i]Across the square, an apprentice cooper chases a runaway beer keg that slipped its chocks, swearing as it bounces over the granite gutters.[/i]
*elseif (mw_vignette_roll = 2)
  [i]Two washerwomen exchange sharp words beside the south conduit spout over whose coopered pail had rightful place under the lion's mouth.[/i]
*elseif (mw_vignette_roll = 3)
  [i]A traveling knifegrinder pumping a treadle stone catches your eye from under an awning, nodding toward your weapon belt with a professional wink.[/i]
*elseif (mw_vignette_roll = 4)
  [i]A street balladeer perched on a mounting block sings an irreverent tune about the Council's grain tariff until a passing Watchman raps a spear-butt on the stones.[/i]
*elseif (mw_vignette_roll = 5)
  [i]A drayman's shaggy grey terrier sits patiently outside the bakehouse door, its tail thumping the flagstones at the smell of roasting suet.[/i]
*else
  [i]A city bailiff in a pewter badge hammers a fresh parchment notice of grain price controls onto the conduit's central stone pillar.[/i]

*choice
  # Turn into the Locksmiths' Close toward the rented lodgings.
    *goto mw_locksmiths_close
  *if ((time_period = "Night") or (time_period = "Pre-Dawn"))
    *if (time_period = "Night")
      # Check the barred shutters of the communal bakehouse.
        *goto mw_bakehouse
    *else
      # Step toward the glowing hearth of the communal bakehouse.
        *goto mw_bakehouse
  *else
    *if (mw_bakehouse_seen)
      # Step toward Mother Marda's communal bakehouse for hot food.
        *goto mw_bakehouse
    *else
      # Step toward the brick communal bakehouse for hot food.
        *goto mw_bakehouse
  # Walk up Parchmenters' Wynd to see the scribes and vellum yards.
    *goto mw_parchment_wynd
  # Step into Herb-Pounder Close to visit the apothecary stills.
    *goto mw_herb_close
  # Walk down to the Cooperage Basin to see the dray wagons.
    *goto mw_cooper_basin
  # Drink clean mountain spring-water from the Conduit spout.
    You step up to the octagonal stone basin and cup your hands beneath the cold, rushing mountain water from the bronze lion-head spout. The water is crisp, sweet, and icy cold, washing the dry road dust and salt grit from your throat.
    *page_break Step back from the conduit…
    *goto mw_conduit_square
  # Travel to another district in the city.
    *goto_scene port_valen port_valen_travel

*comment ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*comment LOCKSMITHS' CLOSE & TERRACE LODGINGS
*comment ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

*label mw_locksmiths_close
[b]◈ THE LOCKSMITHS' CLOSE[/b]
*line_break
An arched stone passage leads into a scrubbed courtyard paved with pale river cobbles. To the left, beneath a forged metal signboard shaped like an open padlock reading [i]"Vael & Son, Lock-Wrights,"[/i] a charcoal brazier glows cherry-red behind protective iron grilles. On sturdy oak workbenches sit cold-hammered strongboxes, brass deadbolts, and rows of ward-cut keys on split rings.

Ahead rises the four-storey oak-and-limestone facade of [b]Terrace Lodgings[/b], its thick timber door hung with a teardrop-shaped metal knocker.

*choice
  # Enter Terrace Lodgings to speak with the landlady.
    *goto mw_lodgings_entry
  # Inspect the locksmith's workshop display.
    Through the protective grille, you watch the locksmith—a lean craftsman with calipers tucked into his leather apron and fine brass filings dusting his knuckles. With swift, rhythmic strokes of a fine steel file, he smooths the brass tumblers of a massive deadbolt, testing the mechanism with a crisp, satisfying [i]snick[/i]. A small slate sign on the counter reads: [i]"Locks Warranted Against Pick & Wedge. Replacement Keys: Three Copper Bits."[/i]
    *page_break Step away from the workshop window…
    *goto mw_locksmiths_close
  # Return to Conduit Square.
    *goto mw_conduit_square

*label mw_lodgings_entry
[b]◈ TERRACE LODGINGS (GROUND FLOOR)[/b]
*line_break
Inside the front hall, the seasoned oak floorboards are scrubbed clean and smell faintly of beeswax, sweetgrass, and dried lavender hung to ward off moths. Beneath a small brass wall-plaque reading [i]"Kess Tenements,"[/i] a tall, spare woman with iron-grey hair coiled tightly in black linen sits behind a sloped writing desk, peering down over steel-rimmed spectacles beside a pigskin ledger box.

*if (not(mw_lodgings_seen))
  *set mw_lodgings_seen true
  She assesses your boots, weapon harness, and posture with the swift, unblinking precision of an old quartermaster.

*if (mw_rent_active)
  *if (campaign_day > mw_rent_expiry_day)
    Mistress Kess looks up from her vellum ledger as the heavy outer latch thuds shut. Her expression is calm, dry, and wholly devoid of surprise.
    
    "Seventh sunset's passed, soldier," she says in her even, measured voice, tapping a bone stylus against the desk. "The padlock is on your latch. One silver mark to renew your key for the week, or take your pack and clear the risers."
  *else
    *temp days_left (mw_rent_expiry_day - campaign_day)
    Mistress Kess looks up from her mending as you step onto the landing, giving you a curt, professional nod. "Key's valid for another ${days_left} days, mercenary. Stairs are swept. Mind your boots on the upper risers."
*else
  Mistress Kess watches you cross the threshold, her pale grey eyes measuring the wear on your weapon harness and the dried road mud on your boots without blinking.
  
  "I am Mistress Kess," she says, her voice crisp and no-nonsense. "Looking for lodging, soldier? One silver mark buys seven days. Clean straw, dry roof, quiet stairs. Master Vael's deadbolts on every door. No blood in my hallway, no thieves under my rafters, and no Watchmen asking questions so long as your coin hits the tin on time."

*label mw_lodgings_menu
*choice
  *if (mw_rent_active) and (campaign_day <= mw_rent_expiry_day)
    # Head up the stairs to your private room on the third floor.
      *goto mw_room_hub
  *if (not(mw_rent_active)) or (campaign_day > mw_rent_expiry_day)
    *if ((((gold * 100) + (silver * 10)) + copper) >= 10)
      # [1 Silver Mark] Pay the weekly rent and take the room key.
        *if (not(currency_txn_locked)) or (not(locked_currency_txn_page_id = choice_page_id))
          *set currency_txn_locked true
          *set locked_currency_txn_page_id choice_page_id
          *set currency_add_amount 0 - 10
          *gosub_scene startup currency_add
          *set mw_rent_active true
          *set mw_rent_paid_day campaign_day
          *set mw_rent_expiry_day (campaign_day + 7)
        You count ten copper bits—a full silver mark—onto the scrubbed oak desk. Mistress Kess sweeps the coins into her palm, checks each rim against her thumbnail with practiced efficiency, and drops them into a locking iron tin.
        
        From a brass peg beside her desk, she lifts a heavy, cold-hammered iron key on a loop of waxed cord and slides it across the wood.
        
        "Top of the second landing, third door on the street side," she says, scratching your name into her ledger. "Key turns twice to the right. Don't lose it; a replacement costs three copper from Vael downstairs."
        *page_break Take the key and climb the risers…
        *goto mw_room_hub
    *else
      # "I don't have a silver mark on me right now."
        Mistress Kess dips her pen into the inkpot without looking up. "Then you sleep in the mud or the barracks until you do. My roof doesn't leak, and my rooms don't open on credit."
        *page_break Step back into the passage…
        *goto mw_locksmiths_close

  *if (mw_rent_active) and (campaign_day <= mw_rent_expiry_day)
    *if ((((gold * 100) + (silver * 10)) + copper) >= 10)
      # [1 Silver Mark] Extend your lease for another seven days.
        *if (not(currency_txn_locked)) or (not(locked_currency_txn_page_id = choice_page_id))
          *set currency_txn_locked true
          *set locked_currency_txn_page_id choice_page_id
          *set currency_add_amount 0 - 10
          *gosub_scene startup currency_add
          *set mw_rent_expiry_day + 7
        *temp new_days_left (mw_rent_expiry_day - campaign_day)
        You slide a silver mark across the desk. Mistress Kess inspects the coin, drops it into her tin, and updates the tally stroke in her book with a brisk nod.
        
        "Extended," she says. "That covers you for ${new_days_left} days from today."
        *page_break Step back toward the stairs…
        *goto mw_lodgings_menu

  # "Who else lives in these rooms, Mistress Kess?"
    Mistress Kess rests her hands flat on the ledger. "Quiet folk. An engraver from the mint on the second floor, two journeymen clerks from the customs wharf, and Master Vael's senior apprentice. Everyone minds their own latch, pays on the day, and keeps their boots quiet after the ninth bell. I expect the same from you."
    *page_break "Understood."…
    *goto mw_lodgings_menu

  # Step back out into the Locksmiths' Close.
    *goto mw_locksmiths_close

*comment ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*comment THE STARTER ROOM (THIRD FLOOR GARRET)
*comment ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

*label mw_room_hub
[b]◈ YOUR CHAMBER — TERRACE LODGINGS[/b]
*line_break
You turn the heavy iron key twice in the lock and push the door open into your room. Tucked directly beneath the slate rooflines, the garret is small, clean, and smells of fresh whitewash and seasoned pine. A low cot with a clean straw tick and wool blanket sits against the far wall, a tin basin rests on a pine washstand beneath the casement window, and an oak stool stands beside a small hearth brazier.

Through the leaded panes, you look out across a sea of wet slate rooftops toward the distant blue cut of the river gorge. Down below, the occasional crisp chime of Master Vael's hammer against a bench anvil sets a slow, grounding cadence through the floorboards.

*temp room_days_left (mw_rent_expiry_day - campaign_day)
[i]Lease: ${room_days_left} days remaining until sunset.[/i]

*choice
  # Bar the door and sleep through the night on your cot. [~8 Hours]
    *goto mw_room_sleep
  # Pour well-water into the tin basin and wash off the road grime. [~10 min]
    *goto mw_room_wash
  # Sit by the casement window in quiet reflection.
    *goto mw_room_reflect
  # Lock the room and head back down the stairs.
    You draw the heavy oak door shut, turn the iron key twice in the lock until the bolt clunks solid into the keeper on the frame, and head down the stairs.
    *goto mw_lodgings_entry

*label mw_room_sleep
*set hours_to_pass 8
*set minutes_to_pass 0
*set time_advance_call_id "mw_room_sleep"
*gosub_scene calendar advance_time

*if (hp_current <= 0)
  *set death_cause "starvation"
  *if (neglect_damage_fatigue > neglect_damage_hunger)
    *set death_cause "exhaustion"
  *goto_scene death death_screen

*set sleep_location_id "terrace_lodgings"
*set sleep_is_shared false
*set sleep_tier_name "none"
*set sleep_tier_stat1 "none"
*set sleep_tier_bonus1 0
*set sleep_tier_stat2 "none"
*set sleep_tier_bonus2 0
*gosub_scene calendar resolve_sleep

*if (character_class = "fighter")
  *set fighter_second_wind_uses 1
*if (character_class = "barbarian")
  *set barbarian_rage_uses 2
*if (character_class = "warlock")
  *set warlock_spell_slots 1

You drop the heavy oak drop-bar across the door, pinch out the smoking candle wick, and pull the coarse wool blanket up to your chin. The mattress is simple straw and flock, but it is dry, clean, and completely yours. There are no snoring recruits rolling in the straw, no sergeant kicking your boots at second watch, and no drunken tavern brawlers shouting through the planks.

Sleep takes you deep and dreamless.

*if ((time_period = "Morning") or (time_period = "Pre-Dawn"))
  You wake to the distant chime of the cathedral bells and the early smell of woodsmoke drifting past the casement. Your muscles are loose, your wounds have closed cleanly, and you wake under a dry roof paid for with your own silver.
*else
  You wake to the crisp, rhythmic chiming of Vael's hammer on the ground floor, the room filled with pale daylight. Your body feels fully restored and rested.
*page_break Stand and stretch your limbs…
*goto mw_room_hub

*label mw_room_wash
*set minutes_to_pass 10
*set time_advance_call_id "mw_room_wash"
*gosub_scene calendar advance_time
*set routine_stage "Settled"
*set nights_same_location 0

You pour cold, clean well-water from the ceramic jug into the battered tin basin. Using a harsh scrap of lye soap, you scrub the dried road slurry, dried sweat, and dark crusts of old combat grime from your hands, neck, and forearms.

Splashing the cold water across your face, you shake the chill off with a sharp gasp. Drying yourself with a coarse linen cloth, you feel the gritty tension of the street melt away. Your skin is raw, but your bearing is clean, sharp, and settled.
*page_break Step away from the washstand…
*goto mw_room_hub

*label mw_room_reflect
You pull up the three-legged wooden stool to the narrow casement and look out across the crowded slate rooftops of the Second Terrace toward the distant blue cut of the river gorge.

Down below, pale woodsmoke curls from a hundred stone chimneys into the evening air, and the dull, grinding noise of the streets feels muffled and far away. There are no file sergeants calling muster, no tavern brawlers shouting through the floorboards, and no squadmates watching your kit.

Behind a solid oak door with the heavy drop-bolt thrown, you let your shoulders drop and take a slow, unhurried breath. The city will still be out there tomorrow with its contracts and debts—but for tonight, the quiet belongs entirely to you.
*page_break Take a centering breath…
*goto mw_room_hub

*comment ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*comment MOTHER MARDA'S COMMUNAL BAKEHOUSE
*comment ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

*label mw_bakehouse
*set mw_bakehouse_seen true
[b]◈ MOTHER MARDA'S COMMUNAL BAKEHOUSE[/b]
*line_break

*if (time_period = "Night")
  The communal bakehouse is barred and dark beneath the eaves, its service counters secured behind massive oak drop-shutters and stout iron padlocks. Through the gaps between the seasoned planks, the faint lingering warmth of banked hearth embers and the dry scent of cooling brick and flour dust drift into the stone lane.

  *choice
    # Inspect the barred counter and chalked notice slate.
      A slate board wired to the timber shutter reads in neat chalk: [i]"Ovens Fired at Fourth Bell. Communal Proofs Accepted Through Midday. Pasties & Caraway Rye: 1 Copper Bit."[/i] Above the roofline, only a faint wisp of grey smoke trickles from the brick chimney into the cold night sky.
      *page_break Step away from the dark shutters…
      *goto mw_bakehouse
    # Listen at the shutter seams for hearth or street movement.
      You lean close to the weathered oak planks. Inside, the only sounds are the faint, rhythmic ticking of cooling firebrick and the quiet settling of charcoal under ash. Out on the cobbles, the night wind sweeps cold and empty through the terrace wynds.
      *page_break Step back from the shutter seams…
      *goto mw_bakehouse
    # Return to Conduit Square.
      *goto mw_conduit_square

*elseif (time_period = "Pre-Dawn")
  Early firebox woodsmoke rolls out beneath the bakehouse awning, sweet with burning split oak. The heavy shop shutters are unbolted and propped wide on iron stays. Inside, two yawning apprentice boys shovel glowing coals into the twin domed ovens to heat the brick arches, while Mother Marda—flour already dusting her wool apron—vigorously works a massive wooden trough of proofed rye dough.

  On the side iron kettle, a small batch of morning caraway rolls and oatmeal bannocks warms over the ash coals.

  *choice
    *if ((((gold * 100) + (silver * 10)) + copper) >= 1)
      # [1 Copper Bit] Buy a warm morning caraway roll. [~15 min]@{show_stat_hints  [+1 Temp HP, +1 DEX Checks for 4h]|}
        *set tavern_item_cost_copper 1
        *set tavern_item_hp_heal 0
        *set tavern_item_temp_hp 1
        *set tavern_item_type "food"
        *set tavern_item_buff_name "Caraway Roll"
        *set tavern_item_buff_desc "+1 DEX Checks"
        *set tavern_item_buff_stat "dex"
        *set tavern_item_buff_bonus 1
        *set tavern_item_buff_minutes 240
        *gosub_scene startup buy_tavern_item
        *set hours_to_pass 0
        *set minutes_to_pass 15
        *set time_advance_call_id "mw_bakehouse_eat"
        *gosub_scene calendar advance_time
        *gosub_scene calendar recalc_hp_from_neglect
        *if (hp_current <= 0)
          *set death_cause "exhaustion"
          *goto_scene death death_screen
        You hand over a copper bit. Mother Marda uses a thick linen cloth to lift a steaming, crusty caraway roll from the warming pan and wraps it in clean butcher's paper.
        
        You sit on the bench near the hearth warmth and eat. The crust is chewy and blistered with roasted caraway seeds, the crumb dense and steaming hot with herb drippings. The warmth spreads down through your chest, easing stiff joints in your fingers and sharpening your footing on the wet cobbles.

        [b][🍞 Warm Roll Consumed: +1 Temporary HP | Nimble Warmth (+1 DEX Checks for 4 Hours) | HP: ${hp_current} / ${hp_max}@{(temp_hp > 0)  (+${temp_hp} Temp HP)|}][/b]
        *page_break Finish the warm roll…
        *goto mw_bakehouse
    # Watch the apprentices stoke the pre-dawn oven fires.
      You watch the apprentices heave split dry oak into the lower fireboxes, using long iron pokers to draw the draft until the brick arches glow with a steady, crackling heat. Mother Marda kneads rhythmically at the trough, her powerful forearms working the dough with practiced ease.
      *page_break Step back from the hearth…
      *goto mw_bakehouse
    # "Up early, Mother Marda. What's the word this morning?"
      *if (day_of_week = "Marketday")
        Mother Marda glances toward the torchlit square with a floury chuckle. "Upland farmers have been rattling their carts through the lower gates since third watch, jockeying for stall space in the square before the morning bell tolls. Buy your rolls early, soldier—once seventh bell rings, the carters will crowd the counter three deep."
      *elseif (day_of_week = "Forgeday")
        Mother Marda wipes her brow with her apron. "Coal wagons came up from the lower slips during the dark—good hard pit-coal for Master Vael and the tool-grinders. Once the seventh bell strikes, this whole wynd will be a shower of grinding sparks and iron dust. Best enjoy the quiet while it lasts."
      *elseif (day_of_week = "Tideday")
        Mother Marda nods down toward the switchback road. "Morning tide's turning at the quays. Down in the basin, the teamsters are already hitching two-horse teams and greasing axles by lantern light, getting ready to haul raw iron up the cliff cut before midday."
      *elseif (day_of_week = "Greyday")
        Mother Marda gestures with a baker's peel toward the steaming yard. "Washerwomen have been hauling coopered pails from the conduit since the fourth bell. They're lighting charcoal under their lye cauldrons now—river damp's heavy this morning, and they want their smocks on the lines before the street dust rises."
      *elseif (day_of_week = "Hallowday")
        Mother Marda speaks in a lowered, respectful tone. "Solemn morning across the terrace. Parish sexton's already lighting early beeswax tapers over at Saint Dunstan's shrine. Craftsmen won't open their shutters today, but folks will be dropping their dinner pots off for my ovens before the first chapel service."
      *elseif (day_of_week = "Ironday")
        Mother Marda heaves a fresh lump of dough onto the board with a sigh. "First morning of the working week. Apprentices are out shivering in the dark, stacking oak cordwood under my eaves and sweeping the workshop risers. Everyone’s sour-tempered until the seventh bell rings and the first loaves come out."
      *else
        *comment Hearthday
        Mother Marda kneads rhythmically at her trough with a calm smile. "Quiet start to Hearthday. Tradesmen take their time lighting their shop lanterns this morning, knowing work wraps up early after midday. Good, peaceful morning to take the road."
      *page_break "Good to know."…
      *goto mw_bakehouse
    # Step back into Conduit Square.
      *goto mw_conduit_square

*elseif (time_period = "Dusk")
  The heat of the long baking day still radiates from the massive brick hearth, but the fire is dying down to a bed of glowing embers. The smell of scorched caraway crusts and savory suet gravy hangs thick under the awning. An apprentice sweeps white flour dust from the stone floor with a straw broom, while Mother Marda checks the remaining pasties warming in the iron pan.

  *choice
    *if ((((gold * 100) + (silver * 10)) + copper) >= 1)
      # [1 Copper Bit] Buy a hot mutton-and-leek pasty. [~15 min]@{show_stat_hints  [+1 Temp HP, +1 DEX Checks for 4h]|}
        *set tavern_item_cost_copper 1
        *set tavern_item_hp_heal 0
        *set tavern_item_temp_hp 1
        *set tavern_item_type "food"
        *set tavern_item_buff_name "Mutton Pasty"
        *set tavern_item_buff_desc "+1 DEX Checks"
        *set tavern_item_buff_stat "dex"
        *set tavern_item_buff_bonus 1
        *set tavern_item_buff_minutes 240
        *gosub_scene startup buy_tavern_item
        *set hours_to_pass 0
        *set minutes_to_pass 15
        *set time_advance_call_id "mw_bakehouse_eat"
        *gosub_scene calendar advance_time
        *gosub_scene calendar recalc_hp_from_neglect
        *if (hp_current <= 0)
          *set death_cause "exhaustion"
          *goto_scene death death_screen
        You hand over a copper bit. Mother Marda uses a thick linen cloth to lift a smoking, golden-crusted pasty from the iron tray and wraps it in clean butcher's paper.
        
        You sit on a wooden bench under the bakehouse eave and take a bite. The crust is flaky and rich with suet, filled with tender braised mutton, chopped leeks, cracked black pepper, and thick potato gravy. The peppery heat and rich broth warm your chest and drive the numbness from your fingers, leaving your hands limber and your step light.

        [b][🥟 Hot Mutton Pasty Consumed: +1 Temporary HP | Nimble Warmth (+1 DEX Checks for 4 Hours) | HP: ${hp_current} / ${hp_max}@{(temp_hp > 0)  (+${temp_hp} Temp HP)|}][/b]
        *page_break Finish the last flaky crust…
        *goto mw_bakehouse
    # Watch Mother Marda bank the evening hearth embers.
      You watch Mother Marda use a broad iron rake to draw the red embers into a tidy mound against the firebrick, covering them with a thick blanket of grey wood-ash so the core heat holds until dawn.
      *page_break Step back from the hearth…
      *goto mw_bakehouse
    # "Winding down, Mother Marda? What's the word around the terrace?"
      *if (day_of_week = "Marketday")
        Mother Marda wipes her brow with a corner of her apron. "Marketday's done, thank the saints. The valley carters are packing their crates, haggling over tavern stabling down by the basin, and the dogs are fighting over cabbage scraps under the trestles. Lucky for you I've still a few hot pasties left in the pan before I bank the hearth."
      *elseif (day_of_week = "Forgeday")
        Mother Marda leans against the flour counter with a tired smile. "Tool-grinders have packed their stones away and doused their coals for the night. The lane smells of wet stone-dust and quenched iron, and the apprentices are dumping water buckets down the gutters. Good night to be indoors away from the drafts."
      *elseif (day_of_week = "Tideday")
        Mother Marda rubs the small of her back as she looks out at the gathering gloom. "Freight wagons are all stabled down at the turn, and the teamsters are washing road grit from their throats over at the dray taphouse. High tide's passed, and the Watch is already setting horn lanterns along the switchbacks."
      *elseif (day_of_week = "Greyday")
        Mother Marda watches an apprentice sweep grey ash from the apron. "Washwomen are pulling their linen lines down between the tenements before the evening damp ruins the drying. Smells like boiled lye and river fog from here to the cliff stair. Best get your boots by a hearth before the chill sets in."
      *elseif (day_of_week = "Hallowday")
        Mother Marda listens as the evening vesper bells chime softly from Civic Heights. "Chapel bells are ringing down for the night. Families have fetched their baked dinner pots, the parish gates are locked, and the lane's as quiet as a tomb. Even the Watch walks softer on Hallowday evening."
      *elseif (day_of_week = "Ironday")
        Mother Marda exhales a long, whistling breath. "First hard day of the week is behind us. Sledges have stopped banging in the cooperage, the locksmiths have barred their grilles, and everyone on the terrace is crawling into their cots bone-tired. Time to turn the key in your latch."
      *else
        *comment Hearthday
        Mother Marda unties her apron and gives it a brisk shake. "Hearthday evening is always peaceful. Tavern games are winding down, clay pipes are getting tapped out against the stone stoops, and everyone's saving their coin for Marketday tomorrow. Keep your head down and enjoy the quiet."
      *page_break "Good to know."…
      *goto mw_bakehouse
    # Step back into Conduit Square.
      *goto mw_conduit_square

*else
  *comment Daytime: Morning, Midday, Afternoon -- Full active bakehouse
  Heat washes over you from the massive brick hearth, where oak logs burn down to glowing embers beneath twin domed bake-ovens. Flour dust floats in the air like pale snow. Behind a broad flour-dusted counter, Mother Marda—a round, red-cheeked woman in a linen apron with flour up to her elbows—slides a long-handled baker's paddle into the oven, retrieving a row of dark caraway rye loaves. Tenement dwellers and apprentices bustle around the counter with proofing pans.

  On a side trestle beneath a propped awning, an iron kettle keeps a batch of thick mutton-and-leek pasties sizzling hot in their suet crusts.

  *choice
    *if ((((gold * 100) + (silver * 10)) + copper) >= 1)
      # [1 Copper Bit] Buy a hot mutton-and-leek pasty. [~15 min]@{show_stat_hints  [+1 Temp HP, +1 DEX Checks for 4h]|}
        *set tavern_item_cost_copper 1
        *set tavern_item_hp_heal 0
        *set tavern_item_temp_hp 1
        *set tavern_item_type "food"
        *set tavern_item_buff_name "Mutton Pasty"
        *set tavern_item_buff_desc "+1 DEX Checks"
        *set tavern_item_buff_stat "dex"
        *set tavern_item_buff_bonus 1
        *set tavern_item_buff_minutes 240
        *gosub_scene startup buy_tavern_item
        *set hours_to_pass 0
        *set minutes_to_pass 15
        *set time_advance_call_id "mw_bakehouse_eat"
        *gosub_scene calendar advance_time
        *gosub_scene calendar recalc_hp_from_neglect
        *if (hp_current <= 0)
          *set death_cause "exhaustion"
          *goto_scene death death_screen
        You hand over a copper bit. Mother Marda uses a thick linen cloth to lift a smoking, golden-crusted pasty from the iron tray and wraps it in clean butcher's paper.
        
        You sit on a wooden bench under the bakehouse eave and take a bite. The crust is flaky and rich with suet, filled with tender braised mutton, chopped leeks, cracked black pepper, and thick potato gravy. The peppery heat and rich broth warm your chest and drive the numbness from your fingers, leaving your hands limber and your step light.

        [b][🥟 Hot Mutton Pasty Consumed: +1 Temporary HP | Nimble Warmth (+1 DEX Checks for 4 Hours) | HP: ${hp_current} / ${hp_max}@{(temp_hp > 0)  (+${temp_hp} Temp HP)|}][/b]
        *page_break Finish the last flaky crust…
        *goto mw_bakehouse
    # Watch Mother Marda paddle fresh caraway loaves into the hearth.
      You watch Mother Marda deftly slide a long ash-wood peel into the domed brick oven, shifting glowing oak embers to maintain an even baking heat. The comforting aroma of roasted caraway seeds, browned rye crust, and sweet woodsmoke fills the air under the bakehouse awning.
      *page_break Step back from the oven hearth…
      *goto mw_bakehouse
    # "What's the word around the Second Terrace, Mother Marda?"
      *if (day_of_week = "Marketday")
        Mother Marda wipes flour from her brow with her apron and chuckles. "Marketday's always a mad scramble, soldier. Upland farmers bringing damp grain down from the valley, haggling over every peck of winter wheat, and Council tax bailiffs poking their brass rods into flour barrels to skim their toll. Good thing I keep the pasty kettles refilled through the afternoon, or the carters would leave the counter bare."
      *elseif (day_of_week = "Forgeday")
        Mother Marda shakes her head, dusting flour from her hands. "Grinders and sharpeners take over the eaves today. Tool-grinders pumping treadle stones throwing sparks everywhere, which keeps the apprentices on their toes with the water buckets—flour dust catches fast if a hot iron splinter hits a sack. But Master Vael's smiths usually keep their sparks inside the Close."
      *elseif (day_of_week = "Tideday")
        Mother Marda nods toward the lower road cut. "Heavy freight day. Drays hauling raw iron ingots and vellum bales up the switchbacks from the harbor slips. The draymen always crowd the counter for pasties before they face the stone climb to Civic Heights, grumbling about broken wheel axles and mud past the weir."
      *elseif (day_of_week = "Greyday")
        Mother Marda chuckles softly. "Laundry day across the whole terrace. Tenement yards are full of boiling lye steam and dripping smocks, which makes the whole street smell like wet wool and wood ash. Folks like to linger by my oven hearth just to get their marrow dry."
      *elseif (day_of_week = "Hallowday")
        Mother Marda keeps her voice low over the quiet bells. "Cathedral bells tolling from the Heights. Most of the craftsmen keep their shutters barred for chapel on Hallowday, but folks still bring their dinner pots down for my ovens. Slower day, quiet street."
      *elseif (day_of_week = "Ironday")
        Mother Marda gestures with her wooden baker's peel toward the noisy lanes. "First hard work-day of the week. Cooperage sledge-irons banging down in the basin, locksmiths filing brass tumblers, scriveners shouting over boundary chits. Everyone’s in a foul temper until they've had a hot pasty in their belly."
      *else
        *comment Hearthday
        Mother Marda wipes her counter down with a dry linen cloth. "Craftsmen pack their tools up early for Hearthday. By late afternoon they're sitting out front smoking clay pipes and drinking sour orchard cider, leaving the boys to roll knucklebones in the gutters. Good quiet afternoon to keep your head down."
      *page_break "Good to know."…
      *goto mw_bakehouse
    # Step back into Conduit Square.
      *goto mw_conduit_square

*comment ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*comment PARCHMENTERS' WYND
*comment ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

*label mw_parchment_wynd
*set mw_parchment_seen true
[b]◈ PARCHMENTERS' WYND[/b]
*line_break
The lane narrows as it climbs toward the cliff buttresses of Civic Heights. High wooden stretching frames lean against upper balconies, holding wet sheepskin and calfskin under drying tension. From open cellar doorways comes the sharp, acrid reek of boiling gallnut ink, lime vats, and scrapings of vellum.

Under an arched timber colonnade, two public scriveners sit at sloped pine desks, writing letters and indentures for a small queue of apprentices and dockworkers, their quill-nibs scratching steadily over creamy calfskin.

*choice
  # Watch the parchment-makers scrape and cure hides.
    You pause beside an open workshop where two journeymen in stained leather smocks work over wet sheepskins. Using curved, half-moon scraping blades, they rhythmically strip hair and grain from the hides with practiced, sweeping strokes, scattering translucent shavings into coopered tubs. On a side bench, an old master boils crushed oak galls with iron-black water, stirring the inky sludge with a charred wooden paddle.
    *page_break Step away from the stretching frames…
    *goto mw_parchment_wynd
  # Listen to the public scriveners drafting petitions for the queue.
    You stand under the colonnade awning, watching a red-faced river carter dictate a petition regarding an impounded freight wagon. The elder scrivener nods with bored patience, dipping his quill into gallnut ink and translating the carter's angry curses into formal legal rhetoric with flourishes of imperial script. Behind him on a wooden shelf, bundles of wrapped debt chits and letters are tied with hemp twine and stamped with red beeswax.
    *page_break Step back from the scriveners' desks…
    *goto mw_parchment_wynd
  # Return to Conduit Square.
    *goto mw_conduit_square

*comment ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*comment HERB-POUNDER CLOSE
*comment ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

*label mw_herb_close
*set mw_herb_seen true
[b]◈ HERB-POUNDER CLOSE[/b]
*line_break
This quiet, flagstone cul-de-sac is shaded by cedar eaves and lined with wicker drying racks laden with wild marsh-mallow, dried wormwood bundles, pine resin, and shredded willow bark. The air is pungent with crushed camphor, menthol, and roasted chicory beneath a painted mortar-and-pestle sign reading [i]"Brand's Still-Room & Physic."[/i]

Through the timber shutters, twin copper stills hiss softly over charcoal braziers, while two apprentices steadily work heavy stone pestles in deep granite mortars with a rhythmic, hollow *chunk... chunk... chunk*.

*choice
  # Inspect the drying racks and apothecary stills.
    You examine the neat bundles of highland roots and dried marsh herbs hanging under the eaves. Master Brand, an elderly herbalist with yellow-stained fingers, looks up from pouring distilled pine spirit into dark glass phials. "Looking for wound-salve or bitters, soldier?" he murmurs. "The Cadre takes our best willow-bark for the field chirurgeons, but a jar of camphor liniment does wonders for swollen marching joints."
    *page_break Step away from the still-room…
    *goto mw_herb_close
  *if (mw_herb_seen)
    # Ask Master Brand about his camphor liniments.
      Master Brand wipes a glass dropper on a clean linen rag. "The line-soldiers from the compound swear by it," the old herbalist says, tapping a row of sealed stoneware pots. "Mutton suet rendered with crushed camphor, marsh-fennel, and wintergreen. Rub it over strained knee-tendons or blistered heels before you lace your boots, and the swelling stays down through a fifteen-mile march."
      *page_break "Good to keep in mind."…
      *goto mw_herb_close
  *else
    # Speak with the elderly herbalist behind the counter.
      Master Brand wipes a glass dropper on a clean linen rag. "The line-soldiers from the compound swear by it," the old herbalist says, tapping a row of sealed stoneware pots. "Mutton suet rendered with crushed camphor, marsh-fennel, and wintergreen. Rub it over strained knee-tendons or blistered heels before you lace your boots, and the swelling stays down through a fifteen-mile march."
      *page_break "Good to keep in mind."…
      *goto mw_herb_close
  # Return to Conduit Square.
    *goto mw_conduit_square

*comment ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*comment THE COOPERAGE BASIN
*comment ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

*label mw_cooper_basin
*set mw_cooper_seen true
[b]◈ THE COOPERAGE BASIN[/b]
*line_break
Beneath a charred timber archway branded with a cooper's adze reading [i]"Kaelen & Sons, Guild Coopers,"[/i] the lower end of the Middle Ward opens into a broad curing yard where the road switchbacks descend to the harbor. High racks of split white oak staves cure under open sheds, and the air smells richly of scorched wood, pine pitch, and wet horse straw.

In the center of the yard, Master Cooper Kaelen and his smiths heat barrel staves over open iron cressets, hammering red-hot iron hoops down over the wood with smithing drivers. Every strike rings out across the terrace with a sharp, echoing *tink-tink-CLANG*. Stout freight wagons wait in the turn-circle, their teamsters lounging on cargo boxes and rolling knucklebones.

*choice
  # Watch the coopers drive iron hoops onto an oak cask.
    You watch three journeymen work in synchronized rhythm around a steaming white oak barrel. As one man clamps the hoop with a notched driver, two others strike it with smithing sledges, forcing the iron band down the swelling belly of the cask until the joints lock water-tight with a final hollow thud.
    *page_break Step back from the dray yard…
    *goto mw_cooper_basin
  # Speak with the dray teamsters about road conditions from the valley.
    You pause beside a two-horse freight wagon loaded with iron ingots. The drayman, spitting a stream of chicory juice between the wagon spokes, gives you a dry nod. "Upper highway is churned to grey porridge past the weir," he grunts, checking his horse's leather harness. "If the rain keeps up, the valley grain wagons won't make the terrace by Marketday without three horse teams to pull every wagon."
    *page_break Step back toward the square…
    *goto mw_cooper_basin
  # Return to Conduit Square.
    *goto mw_conduit_square
```
