# Oxworth Settlement Plan (`rn2`)

## Status

Planning document only. Nothing below is implemented canon until approved and wired into scene files, `overworld-data.js`, `trade.js`, and `tools/gen_city_settlements.js`.

---

## 1. Established Canon & Live Data

- **Overworld Tile (`rn2`)** (`web/mygame/overworld-data.js`): Village on the open down (`territory: "gault"`, `danger: 2`, `climate: -1`). Cattle pens and trampled turf surround low roofs.
- **Population & Tier** (`tools/market_defs.json`, `Resources & Quest/WESTERN_VALE_NOBILITY_PLAN.md`): Population **550**, plain tenants under the **Viscounty of Hartwell** (House Falwick: Viscountess Odile Falwick, consort Milo Falwick, heir Wren Falwick). No resident nobility.
- **Road Neighbors** (`web/mygame/overworld-data.js`):
  - **Hartwell (`ht`)**: 6 miles
  - **Esthorpe (`es`)**: 6 miles
  - **Maple Turn (`rn8`)**: 6 miles (toward Millstow / Mossy Road)
  - **`rn1`**: 7 miles (toward Broadmead / Carrowmark)
  - **The West Downs Road (`rn3`)**: 8 miles (toward Dennholt / Fallowmere)
- **Live Trade Production** (`tools/gear_catalog.json`):
  - **Major:** `beef` (peaks during the autumn drive, `season: [0.9, 0.85, 1.4, 0.85]`)
  - **Minor:** `cheese`, `butter`, `animal_fat`, `farm_eggs`, `raw_hide`
- **Local Friction**: Cattle-drive rights of way across other people's fields during the autumn cattle drive, plus plain-tenant resentment/grumbling over Hartwell's market dues.

---

## 2. Core Design Rule: Mechanical Stops Only

Every choice on the Oxworth hub must lead to a **playable mechanical loop** (trade panel, contract board, inn/rest/wager, wage work, or utility shop). Pure flavor—cattle pens, cattle-lane mud, wind off the downs, and right-of-way friction—belongs in the **3-layer prose (`place` / `sky` / `street`)**, hour-seeded vignettes, and NPC conversation topics rather than standalone scenery-only choices.

Oxworth follows the standard 4-stop village layout (`fallowmere/` / `broadmead/` pattern) plus `gen_city_settlements.js` Town-card routing (`board`, `inn`, `leave`):

| Stop | File | Role | Core Mechanics |
|---|---|---|---|
| **Hub** | `oxworth.txt` | Village green & cattle lane | Arrival (`rn2_arrive`), 3-layer prose, vignettes, hours checks, Town-card hooks |
| **1. Authority & Board** | `village_heads_hall.txt` | Village Head's Hall | Contract Board (`hall_courier.txt`, `cr_origin "rn2"`), Village Head dialogue, right-of-way/cattle-fine hook |
| **2. The Inn** | `yoke_and_horn.txt` | *The Yoke & Horn* | Meals/drinks (buffs), 24h bunk/room rest, night dice table (`resolve_wager`), rumor talk |
| **3. Market Area** | `oxworth_market.txt` | Oxworth Market (`ox_market`) | Full Trading Simulator panel (`trade.js` + `48_market.txt`), market rumors |
| **4. Signature Mechanical Stop** | `salting_yard.txt` | Salting & Cattle Yard | Once-daily paid shift work (`Athletics`/`Survival` bonus), road/cattle-driving supplies & leather/tack utility |

---

## 3. Detailed Stop Breakdown

### Hub: `oxworth.txt`
- **Labels:** `rn2_arrive` (5-min entry walk from overworld), `oxworth`, `ox_enter`, `ox_menu`, `ox_return`, `ox_market_return`, `ox_walk_time`, `ox_hall_hours`, `ox_market_hours`, `ox_yard_hours`, `ow_here`.
- **Prose:** 3-layer description (`place` once, `sky` weather/time, `street` active villagers, cattle pens, wagons, and cattle-lane traffic).
- **Hours Rules:**
  - **Village Head's Hall:** Open Morning through Afternoon. Closed Dusk, Night, `Hallowday`, and `street_life = "empty"`.
  - **Market (`rn2_market`):** Open Morning through Dusk. Closed Night, `Hallowday`, and `street_life = "empty"`.
  - **Salting & Cattle Yard:** Open Morning through Afternoon. Closed Dusk, Night, `Hallowday`, and `street_life = "empty"`.
  - **The Yoke & Horn (Inn):** Always open.

### Stop 1: Authority & Contract Board — `village_heads_hall.txt`
- **Place:** A timber-and-turf hall at the head of the cattle lane. Mud-scraped porch, grazing boundary rolls, tallies for Hartwell's counting-house, and the **Contract Board** nailed under the eaves.
- **NPC:** **The Village Head** (plain tenant appointed under Hartwell's oversight; practical, tired of both Hartwell's tax clerks and farmers shouting about trampled barley).
- **Mechanics:**
  - **Contract Board (`ox_hall_board`):** Uses `hall_courier.txt` (`cr_origin "rn2"`) for courier runs along Oxworth's spokes: **Hartwell** (6 mi), **Esthorpe** (6 mi), **Millstow** (via `rn8`), **Carrowmark** (via `rn1`), **Dennholt** (via `rn3`), and **Broadmead**.
  - **Village Head Dialogue (`ox_hl_talk`):** Tracks asked topics (`village`, `duties`, `herds`, `hartwell`) so dialogue doesn't loop identically, and unlocks local context on the autumn drive friction and Hartwell's rivalry with Langston.
  - **Optional Micro-Loop (Cattle-Drive / Grazing Check):** If desired, a one-time or periodic mediation/errand check tied to the autumn drive dispute (giving coin or local standing rather than static exposition).

### Stop 2: The Inn — `yoke_and_horn.txt` (*The Yoke & Horn*)
- **Place:** Low-roofed stone-and-thatch cattlemen's inn built against the wind (`climate: -1`), with a peat-and-wood hearth, tallow lamps, and a loft bunkroom.
- **NPC:** **Innkeeper** (ex-herder or cattleman's widow who buys beef and tallow straight from the yard).
- **Mechanics (matching `grey_gander.txt`):**
  - **Hot Meal & Drink:** e.g. *Salted beef & root stew* (`+2 Temp HP`, `+1 CON` for 4h) and *House small-ale / cider*.
  - **24-Hour Bunk / Room (`ox_yh_room_until`):** Standard rest/recovery loop.
  - **Evening Dice Table (`ox_yh_dice`):** Open at `time_period = "Night"`, using `economy.txt resolve_wager` and a daily-refilled house pot (`ox_dice_bankroll`).
  - **Hearsay & Rumors:** Dynamic chatter about Hartwell's tolls, Harwick's tanneries buying Oxworth hides, and border traffic near Carrowmark/Dennholt.

### Stop 3: Market Area — `oxworth_market.txt` (*Oxworth Market*, `ox_market`)
- **Place:** Trodden turf beside the main holding pens—wooden hurdles, hanging quarters under canvas, salt-casks, cheesecloth racks, and a heavy iron beam-scale for hides and tallow tubs.
- **Mechanics:**
  - Wired into the Trading Simulator (`tools/market_defs.json`, `tools/gear_catalog.json`, `web/mygame/trade.js`, `startup_parts/48_market.txt`).
  - Uses standard `ox_market_open_panel`, `ox_market_cart_pass`, `ox_market_settle`, and `market_rumor_check "rn2_market"`.
  - **Trade Identity:** High supply/cheap **beef** (especially in autumn), **raw hide**, **animal fat**, **cheese**, **butter**, **farm eggs**; high demand for **salt**, **grain / barley loaf**, **hemp rope**, and iron tools.

### Stop 4: Signature Mechanical Stop — `salting_yard.txt` (*The Salting & Cattle Yard*)
- **Why this stop:** Replaces pure-scenery cattle pens with a dedicated **wage-work + road-supply loop** tailored to Oxworth's economy.
- **NPC:** **Yard Boss / Master Salter** (or **Yard Farrier**).
- **Mechanics:**
  1. **Daily Shift Work (`ox_yard_work`):** Once per campaign day (`ox_yard_worked_day < campaign_day`), take a 4-hour or 6-hour shift (salting hides, rendering tallow, or bracing pen hurdles / tailing an incoming herd).
     - Pays a modest base copper wage (comparable to `work/smithing.txt` ranks/tiers).
     - Includes a skill check (`Athletics`, `Survival`, or `Animal Handling`—using existing `dice_engine.txt` checks) for a small bonus payout or extra ration/scrap.
  2. **Practical Road & Herder Counter:** Sells non-bulk, player-useful travel supplies (e.g. `trail_rations`, `oil`, `hemp_rope`, or basic tack/pack upkeep) so travelers coming off `danger: 2` downs can resupply without needing bulk market quantities.

---

## 4. Technical & Generator Wiring Checklist

1. **Scene Folder:** Create scenes under `web/mygame/scenes/hartwell/oxworth/` (or `Langston/`—see Open Decisions).
2. **Startup State (`web/mygame/scenes/startup_parts/`):** Add `ox_seen`, `ox_hall_seen`, `ox_yh_seen`, `ox_market_seen`, `ox_yard_seen`, `ox_yh_room_until`, `ox_dice_bankroll`, `ox_yard_worked_day`, and talk flags -> run `node tools/build_startup.js`.
3. **Town Card (`tools/gen_city_settlements.js`):** Register `oxworth` with `board`, `inn`, and `leave` routes -> run `node tools/gen_city_data.js` and `node tools/check_city_settlements.js --write`.
4. **Overworld (`web/mygame/overworld-data.js`):** Point tile `rn2` arrival to `oxworth rn2_arrive`.
5. **Trade Simulator (`tools/market_defs.json`, `web/mygame/trade.js`, `startup_parts/48_market.txt`):** Register `rn2_market` on tile `rn2` -> run `gen_world.js` / `gen_markets.js`.
6. **Scenery & Ambience (`web/mygame/scenery.js`, `web/mygame/ambience.js`):** Map day/night backdrops and `"village"` / `"tavern"` ambience aliases.
7. **Verification:** Run `quicktest_scene.js`, `lint_replay_guard.js`, `scripted_play.js`, and `node compile.js`.

---

## 5. Open Decisions Before Implementation

1. **Scene Directory:** Place under `web/mygame/scenes/hartwell/oxworth/` (mirroring `alderford/`, `timbermouth/`, `Langston/` as top-level viscounty/town folders) or another path?
2. **Stop 4 Emphasis:** Keep Stop 4 as the **Salting & Cattle Yard** (wage labor + trail rations/rope/oil), or make it a **Farrier & Saddler's Shed** (wage labor + horse/tack care)?
3. **NPC Names & Voices:** Confirm names and brief voice notes for the **Village Head**, **Innkeeper**, and **Yard Boss** before writing dialogue.
