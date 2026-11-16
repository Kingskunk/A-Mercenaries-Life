# Palmcote Settlement Plan (`pc`)

## Status

Planning document only. Nothing below is canon until the designer approves it. Follows `CONTENT_WORKFLOW.md` section 2 (new settlement), with section 1 for each place.

---

## 1. Established Canon & Live Data

- **Tile `pc`** (`web/mygame/overworld-data.js`): village, `territory: "gault"`, `danger: 1`, `climate: -1`. Sheltered sun-facing slope of olive rows, manor above, carts waiting for Hartwell. The tile already exists; it has no hub, no door from the map and no scenes.
- **Roads:** Hartwell (`ht`) 7 mi, Fold Crossing (`fn`) 7 mi, Verdant Way (`rn5`) 8 mi.
- **Population / tier:** 500, plain tenants of the Viscounty of Hartwell. Minor nobility: **House Ferrand** lives in the manor (bought into minor nobility on trade money two generations ago; no public jurisdiction over the village). See `WESTERN_VALE_NOBILITY_PLAN.md`.
- **Trade (`gear_catalog.json`):** Major: `olives`. Minor: `honey`. Hartwell presses the olives into oil, so the carts matter.
- **Market def:** `market_defs.json` has `pc`, pop 500, anon phrase "an olive-grove village".
- **Prefix / tile id:** `pc_` / `pc` (confirmed free of scene use).

## 2. Designer Decisions (2026-11-16)

| Question | Answer |
| --- | --- |
| Places | Gathering hall (notice board), inn, olive-harvest yard (once-daily paid work) |
| Market | No full trade-panel market. A small counter or stall only, olives and honey, at the yard |
| House Ferrand | Visible only: manor on the slope, the family's mark on the carts. No named Ferrand met on a first visit |
| Prefix | `pc_` |

## 3. Proposed Layout (village template, 3 services)

| Stop | File (`web/mygame/scenes/hartwell/palmcote/`) | Role |
| --- | --- | --- |
| Hub | `palmcote.txt` | Slope track, carts, arrival `pc_arrive`, 3-layer prose, hours, Town card hooks |
| 1. Gathering hall | `gathering_hall.txt` | Notice board (courier tile), village head, wait + water |
| 2. Inn | `inn.txt` (name TBD) | Meals, shared bunk, rumours. Always open |
| 3. Olive yard | `olive_yard.txt` | Once-daily paid picking/loading shift, olive and honey counter |

Severe weather: yard shuts; hall and inn stay open.

## 4. Open Items (to invent and approve)

- Inn name and keeper (name given once, unlocks `met_` flag). Keeper's race and two first-seen details.
- Village head: name, race, voice. A plain tenant, not a Ferrand.
- Yard shift: pay measured against wages (see `QUEST_DESIGN_RULES.md`, "Real-World Living Costs"), skill bonus, time cost.
- Cooking site / oven at the inn? (1.1) Fresh water at the hall or a well?
- Local friction for the village head's talk topics (e.g. carts, pickers' wages, the manor on the slope). Visible only; no Ferrand named.
- Hours: hall Morning-Afternoon, yard Morning-Afternoon, inn always, all shut on the rest day for the hall and yard; outdoor places close in severe weather.
- Lorebook entries, `RESERVED` names, backdrop pictures (olive grove, village hall; ask designer if no fit).

## 5. Build Order

1. Approve this plan.
2. Hub file and `overworld.txt` door; `startup_parts/` file; `compile.js` verifyFileName lines.
3. Places one at a time (section 1: hours routine, two hub buttons, closed label, layers, play script).
4. Registration: `gen_city_settlements.js`, `scenery.js`, `ambience.js`, `names-data.js`, `COURIER_TILES`, lorebook, water audit.
5. Generators and checks (section 2.7 and 2.8).
