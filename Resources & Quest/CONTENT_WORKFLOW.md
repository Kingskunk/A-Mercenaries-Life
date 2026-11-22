# Content Workflow

Checklists for adding content to the game. Each one lists what to decide, which files to touch, which tools to run, and which checks must pass before the work is done.

A checklist names the steps. The rules for how to write each step are in the files it points to. Rules are cited by heading name, so they stay findable when a file is renumbered.

Sections:

1. A new place in a settlement (village, town or city district)
2. A new settlement
3. A quest
4. A named character
5. A shop or market
6. An item
7. An enemy or a fight

Three things apply to every section:

- **Ask before inventing a decision.** Each section starts with what to decide. Those are the designer's choices. Invent detail freely (a smell, a price, a face) and say what was invented.
- **Edit the source, then run the tool.** A `.generated.` file or a `GEN:BEGIN` block is never edited by hand.
- **Finish with `git status --short` and `git diff --numstat`**, and account for every deleted line.

`GAMEPLAY_MECHANICS_RULES.md` is too large to read whole. Where a section says "search for", search that file for the quoted words.

---

## 1. A new place in a settlement

A place is one stop on a settlement's menu: an inn, a hall, a market, a workshop, a yard. The steps are the same for a village, a town and a city district. What changes with size is in the table at the end.

The example throughout is the Village Head's Hall in Oxworth (`web/mygame/scenes/hartwell/oxworth/village_heads_hall.txt`). Read it next to this list.

### 1.1 Decide before writing

Answer these with the designer. Each answer becomes a line of code in 1.3 or 1.4. The test for every one is whether the player would plausibly be allowed to do it there.

- Can the player wait here?
- Is there fresh drinking water?
- Can the player cook here? Is there an oven? What has to be true first (an inn's kitchen opens only after its keeper's quest)?
- Is this a place the player will return to, so the sidebar should be able to take them there?
- When is it open? What shuts it: the hour, the rest day, severe weather?
- Who is here? Staff and passers-by stay unnamed. A keeper or village head gives their name once.
- Is it indoors or outdoors? An indoor place gets one muffled weather line; an outdoor place gets the full sky layer.

Read first:

- `Resources & Quest/NARRATIVE_GUIDELINES.md`, "Place Descriptions: Weather, Time & Crowds Stay in Their Own Layers".
- `Resources & Quest/QUEST_DESIGN_RULES.md`, "Settlements Outside Port Valen: Scale, Template & Shelter" and "Choice Design & Hub Presentation".

### 1.2 Create the scene file

One file per place, in the settlement's folder under `web/mygame/scenes/`. A later shop or quest then never edits the hub. Give every label the settlement's prefix (`ox_`).

The file holds, in this order:

1. **Entry label.** It charges the walk through the hub's own walk routine (`ox_walk_time`), sets the place's `_seen` flag, and prints exactly one `[b]◈ NAME[/b]` heading. The page banner reads that heading.
2. **Menu label.** The choices, with one plain exit: an option whose only statements are an optional `*set shop_open ""` and a `*goto_scene` to the hub's return label (`ox_return`). The sidebar's Town card needs that plain exit.
3. **Closed label** (`ox_hall_closed`). The heading, a short description of the shut place, then straight back to the hub. It costs no time, sets no `_seen` flag and offers no choices.
4. **Layers.** Place (fixed, printed in full once), sky, street. No people in the sky layer.
5. **Talk labels**, if someone here speaks. A name is hidden behind a `met_` flag until it is given. A line that would repeat on a later visit is described, not quoted again. Before writing dialogue choices for a character, run a quick roleplay pass with the designer—the AI plays the NPC(s) and the designer plays the protagonist (one short pass for a brief exchange, or a few turns for a larger conversation)—to find the most natural player responses and choices.

On the menu page, from the answers in 1.1:

```
*set wait_ok_page page_id          waiting is allowed on this page
*set fresh_water_page page_id      there is drinking water on this page
*gosub_scene crafting cook_site_set "<site id>"      the player can cook here
```

A cooking place also needs one branch in `cook_site_eval` in `web/mygame/scenes/crafting.txt`. That branch is the only place the site's rule is written: what unlocks it, and whether it has an oven.

### 1.3 Wire it into the hub

In the settlement's hub file (`hartwell/oxworth/oxworth.txt`):

1. **Hours routine.** One small routine that sets `<prefix>_ok_<place>` and `<prefix>_<place>_closed_reason` from the clock, the day and the weather flags. Call it from the hub's enter routine.
2. **Two buttons on the hub menu.** Open: the bold name, what the place is, and the walk time. Shut: the same bold name and the reason, going to the closed label. A shut place never disappears from the menu.

Read the weather through the derived flags (`weather_severity`, `street_life`), never through weather names.

### 1.4 Register it

A place can pass every check and still be missing one of these, because no tool looks for something that was never added.

| What | Where | When |
| --- | --- | --- |
| New variables | A file in `web/mygame/scenes/startup_parts/`, then `node tools/build_startup.js` | Always |
| The scene file's name | A `verifyFileName("...")` line in `compile.js` | Always |
| Sidebar travel | `tools/gen_city_settlements.js`: add the file to the settlement's `files` list. If the place holds the notice board or is the inn, give it a service route with its `seen` flag. | Always in a town or village |
| Backdrop picture | `SCENE_PLACES` in `web/mygame/scenery.js`: the scene path and a picture key | Always |
| Sound | `ALIAS` in `web/mygame/ambience.js` | When the place should sound like another kind of place |
| Named people | `RESERVED` in `web/mygame/names-data.js`: first and last name of each | When someone is named |
| Lorebook | An entry in the region's `web/mygame/lorebook-*.js`, unlocked by the flag set when the player learns the name or reaches the place | When the player learns a name worth looking up |
| Notice board | The board's tile entry in `COURIER_TILES` in `web/mygame/overworld-data.js` | When the place holds the settlement's board |
| Water audit | The list of scenes in `tools/test_water_fill_locations.js` | When the place has water |

No fitting picture or icon: stop and ask the designer. Never reuse an item or action icon. Backdrops do have generic pictures meant for sharing (`generic_village_gathering_hall`, `generic_tavern_inn`, `generic_village_inn_room`).

**Background scenery & ambience workflow:**
1. **Check the picture before writing prose.** Open the backdrop image in `Wallpaper/` for any shared or dedicated key so the scene's fixtures (stair vs. ladder, private room vs. shared loft, shutters, tables) match what the player sees.
2. **Making a new backdrop.** Follow `Resources & Quest/BACKDROP_ART_WORKFLOW.md` (first-person POV camera, muted palette, dry packed-earth ground with no tyre tracks, candidate review, and saving to `Wallpaper/`).
3. **Register scenery and sound.** Add the key to `web/mygame/scenery-data.js` and `web/mygame/scenery.js` (and `scenery_subplace` rules if the scene has multiple rooms), hook up or verify its sound in `web/mygame/ambience.js` (`ALIAS`), and tell the user which ambience sound is used.

### 1.5 Run the generators

```
node tools/build_startup.js
node tools/gen_city_data.js
node tools/check_city_settlements.js --write
```

The second writes the hidden sidebar options into the scene files, inside `GEN:BEGIN` and `GEN:END` comments. Never edit those blocks by hand. The third walks each sidebar route through the real pages and saves the minutes it costs.

### 1.6 Write a play script

One script in `tools/play_scripts/story/<region>/` (the region folder the settlement's scenes sit under), named `<settlement>_<place>_visit.json`. Copy `story/hartwell/oxworth_village_hall_visit.json`. It must have:

- `"refresh": true` and `"requireNoDeadSpace": true`;
- `current_district` and the weather zone in `stats`;
- a step for every option on the place's menu, ending on a real stopping point;
- the place's flags and `clock_time` in `watch`.

A place that takes coin or gives an item needs a second script for that path.

### 1.7 Check

```
node tools/lint_all.js <the place file>
node tools/lint_all.js <the hub file>
node tools/quicktest_parallel.js --changed
node tools/play_all.js <settlement name>
node tools/check_city_settlements.js
node tools/render_hub.js "" "" "" <scene> <entry label>
```

The last one prints the place for every weather, hour and day. Read some of that output as a player would, and look for these:

- daylight at night, or sun under fog;
- a crowd in a storm;
- a name printed before it was given;
- the closed page giving a different reason from the button;
- the same quoted line on a second visit.

Run `node tools/test_water_fill_locations.js` when a water flag was added.

Then `git status --short` and `git diff --numstat`, and account for every deleted line.

### 1.8 What changes with size

| | Village | Town | City district |
| --- | --- | --- | --- |
| Places | About three, one of them a gathering hall | A handful | Many, grouped in districts |
| Services | A shared bunk or hayloft. No bank, factor or insurance. | A few of each, small staff | Everything |
| Named people | The village head and the innkeeper | A keeper per shop | As the story needs |
| Sidebar | Town card: notice board, inn, way out (`gen_city_settlements.js`) | The same Town card | Places list with kinds: shops, food, healing, work, services (`gen_city_places.js`, checked by `check_city_places.js`) |
| Walking | One walk routine for the whole settlement | The same | Distance between districts, one number per district |
| Severe weather | Outdoor places shut; the hall and the inn stay open so a traveller is never stranded | The same | Each district reads the flags its own way |

The game has one city, Port Valen. Its district travel is written for that city alone. A second city is a design decision, not a copy.

---

## 2. A new settlement

A settlement is a map tile, a hub file, and its places. The example is Oxworth: the hub and market arrived in commit `46fc247f`, the hall in `1b016917`.

### 2.1 Decide before writing

- **Write a plan file first** (`<NAME>_SETTLEMENT_PLAN.md`, like `OXWORTH_SETTLEMENT_PLAN.md`). Nothing in it is canon until the designer approves it.
- Size: village, town or city. The table in 1.8 says what each has.
- Its tile id (two or three letters) and its label prefix (`ox_`). Both must be unused.
- Which territory it is in, and which weather zone.
- What it makes, if anything. That decides prices at every market on the map.
- Its three services. Every town and village must have a notice board, an inn or a stand-in for one, and a way out. The build fails without all three.

Read first: `QUEST_DESIGN_RULES.md`, "Settlements Outside Port Valen: Scale, Template & Shelter".

### 2.2 The map tile

1. Draw the tile and its roads in the "places" layer of `web/mygame/overworld-art/worldmap.svg`, then run `node tools/gen_overworld_places.js`. Its header explains the drawing rules.
2. Before showing the designer, check the tile sits on open ground and the road lengths match the roads around it.
3. Fill in the tile's entry in `web/mygame/overworld-data.js`: `name`, `kind`, `territory`, `danger`, `climate`, `walk`, `info`, `here`.
4. Add the settlement to `DISTRICT_ZONE` in the same file when it is outside the default weather zone.

Tile text describes land and buildings only. It names no people, politics or chain of command, and it avoids wording that depends on which roads exist today.

### 2.3 The door from the map

In `web/mygame/scenes/overworld/overworld.txt`, one option under `*if (ow_pos = "<tile>")`. It sets `ow_on false` and `climate_shift`, then goes to the hub's arrival label (`rn2_arrive`).

### 2.4 The hub file

Copy the shape of `hartwell/oxworth/oxworth.txt`. It has these labels:

| Label | Job |
| --- | --- |
| `<tile>_arrive` | Charges the walk in. Prints one line for a first arrival and a shorter one after, by time of day. |
| `<prefix>_enter` | Sets `current_district` and the `_seen` flag, calls `calendar update_hub_condition`, then each place's hours routine. |
| `<prefix>_header` | The one `[b]◈ NAME[/b]` heading. |
| `<prefix>_layers` | Place, sky, street. |
| `<prefix>_return` | Where every place sends the player back to. |
| `<prefix>_menu` | The wait and water flags, one button per place, and the way out (`*set ow_pos "<tile>"`, then `*goto_scene overworld/overworld ow_here`). |
| `<prefix>_walk_time` | Advances the clock, recalculates hunger and fatigue, and sends a character at 0 HP to the death screen. |

The street layer prints on every return, so it is a pool of variants by hour and state, never one fixed line.

### 2.5 The places

Build each one with section 1.

### 2.6 Register it

| What | Where |
| --- | --- |
| Sidebar Town card | A `SETTLEMENTS` entry in `tools/gen_city_settlements.js`: hub labels, place files, and the three services, each with a `seen` flag |
| Every scene file | A `verifyFileName("...")` line in `compile.js` |
| Variables | A file in `startup_parts/` |
| Backdrops | `SCENE_PLACES` in `web/mygame/scenery.js`, and a line in `ALIAS` there when the picture has another name |
| Sound | `ALIAS` in `web/mygame/ambience.js` |
| Who lives there | A `settlements` entry in `tools/market_defs.json`: name, population, and the phrase a rumour uses for it. A settlement with no market still eats. |
| What it makes | `commodity.makers` on the goods in `tools/gear_catalog.json`: tile id, then `major` or `minor` |
| A market | Search the mechanics rules for "Adding a settlement market" |
| Notice board | A `COURIER_TILES` entry in `overworld-data.js` |
| Wagon lines, if it has a yard | Search the mechanics rules for "To add a town" |
| Lorebook | A place entry in the region's `lorebook-*.js` |
| Water audit | `tools/test_water_fill_locations.js`, for the hub and any yard with water |

### 2.7 Run the generators

```
node tools/build_startup.js
node tools/gen_gear.js
node tools/gen_world.js
node tools/gen_markets.js
node tools/gen_city_data.js
node tools/check_city_settlements.js --write
```

`compile.js` does not run `gen_world.js` or `gen_markets.js`. After changing makers or `market_defs.json`, run both by hand and read the generated file to confirm the change landed.

### 2.8 Check

```
node tools/check_overworld_map.js
node tools/check_city_settlements.js
node tools/check_market_loops.js
node tools/check_freight_routes.js
node tools/lint_all.js <the settlement's folder>
node tools/quicktest_parallel.js --changed
node tools/render_hub.js "" "" "" <hub scene> <hub label>
node tools/play_all.js <settlement name>
```

Play scripts to write: arriving from the map tile, each of the three sidebar routes, and leaving. Run `check_escort_lines.js` when a wagon line was added.

---

## 3. A quest

The example is The Short Purse (`port_valen/black_oath/black_oath_short_purse.txt`, commit `24bce23a`).

### 3.1 Decide before writing

- How the player finds it. A quest giver never singles the player out unprompted.
- The spine: three to five beats that every route passes through.
- The endings, including one where the player loses.
- What each failed roll costs. A failure never turns into the success it was chasing.
- The reward, measured against wages. Search `QUEST_DESIGN_RULES.md` for "Real-World Living Costs".
- How much time each beat costs.
- Whether a success counts toward the level-up pool.

For anything larger than a street task, write the prose and choices into a plan file and get it approved before building.

Read first, in `QUEST_DESIGN_RULES.md`: "Organic Discovery & Table-Facing Delivery", "Choice Architecture: Branch-and-Bottleneck", and "Fights Are a Consequence of a Failed Roll, Not a Given"; and in `GAMEPLAY_MECHANICS_RULES.md`: "ChoiceScript Code Discipline & State Hygiene".

### 3.2 Build it

1. **Its own scene file**, in the folder of the place it starts in. The district or hub file holds only the short hook that sends the player there.Keep file names unique and not generic, ensure no file name shares another.
2. **Its own file in `startup_parts/`**: a stage variable, a resolution variable, one flag per clue, and one success flag.
3. **Rewards are guarded.** Outside a fight nothing protects a page from being replayed, so every grant of coin, items or standing sits behind a once-only flag. Coin goes through `economy currency_add`.
4. **One clock advance per page.** Put a page break between two.
5. **The world remembers.** One changed line in the place's prose, or one rumour per ending, is enough for a small quest.

### 3.3 Register it

| What | Where |
| --- | --- |
| Sidebar | One object in `web/mygame/quest-data.js`. `clues` lists only what the player has found. |
| Index | One row in `Resources & Quest/QUESTS.md`, with the same id |
| Level-up pool | A `count_finished_<name>` label in the quest's file and one line in `refresh_quests_finished` in `character_progression.txt`. It counts a success flag that is set once and never cleared. Search the mechanics rules for "The Level-Up Pool Is Derived From Success Flags". |
| Lorebook | Every person, place and faction the player learns of, unlocked at the moment they learn it |
| The scene file | A `verifyFileName("...")` line in `compile.js` |
| Testing entry | An option in `dev_hub.txt` that sets up the state the quest needs |
| Named people | Section 4 |

### 3.4 Play scripts

One script per ending, the losing one included. Use `"refresh": true` on every script, force the dice with `rand`, and put the reward variables in `watch`. A refresh must never pay twice.

### 3.5 Check

```
node tools/lint_all.js <the quest file>
node tools/quicktest_parallel.js --changed
node tools/play_all.js <quest name>
```

Read each ending as a player. Then confirm three things by hand: the sidebar entry appears and disappears at the right moments, no name appears before it is given, and the losing ending has its own closing prose.

---

## 4. A named character

The example is Bramwell Tallow in `hartwell/oxworth/village_heads_hall.txt`.

### 4.1 Decide before writing

- Does this person need a name? Guards, clerks and passers-by stay unnamed. A keeper or head gives their name once.
- Race, physical description, detailed enough to be worth a lore entry? Face, hair, skin color, guessed age, body shape, clothing and two or three things the player sees first.
- Background, a resonable background, these backgrounds may not always make it into the game, but in a plan it helps shape and reinforce personality and behavior.
- How they talk: sentence length, word choice, personality. 
- The name is unused. Check `RESERVED` in `web/mygame/names-data.js` and search the scenes.

Read first, in the narrative guidelines: "Describe NPCs on Introduction" and "Natural Dialogue & Distinct NPC Voice".

### 4.2 Build it

1. **A `met_<name>` flag** in `startup_parts/`.
2. **Appearance before name.** The first meeting describes what the player sees. The name arrives when the person gives it or someone else says it.
3. **Hide the name everywhere until then**: in prose, on choice buttons, in the hub's street layer, and in the sidebar's `giver` text. Buttons name the person by role or look.
4. **The player gives their name in return** when someone introduces themselves. After that the person says `${name}`.
5. **A talk menu of its own** (`<prefix>_talk_menu`). Every topic returns to it, never to the top of the place.
6. **A topic that is used up sets a flag and leaves the menu.**
7. **Return visits are described, not quoted again.**
8. **A blank line between paragraphs**, never `*line_break`.
9. **The player speaks or acts** in every branch before the reply.

### 4.3 Register it

| What | Where |
| --- | --- |
| The name | `RESERVED` in `web/mygame/names-data.js`, first and last name |
| Lorebook | A people entry unlocked by the `met_` flag. `link` phrases are full proper names only. The entry says only what the scenes say. |
| Portrait (optional) | `portraits/<id>.webp` (`512×768`). `web/mygame/lorebook.js` loads it automatically by entry `id`; `tools/build_app.js` copies `portraits/` into `dist/`. |

To generate Lorebook portraits through the free MemPalace ↔ Perchance bridge (`server.py` + open Perchance tab):
1. `node tools/gen_portraits.js --sync` — adds any new `people` entry to `tools/portrait_prompts.json`. Rewrite each new prompt to **visual-only chest-up looks and clothing** before generating:
   - **Keep:** age, skin, hair, eyes, scars, and upper-body clothing/collars.
   - **Strip:** backstory, waist-level gear (belts, aprons with tools, satchels, canes), small props (quills/chalk behind ears, pipes, knives), small faction insignia/badges/emblems/pendants, and surface splatters/particles (salt crystals, flour dust, sparks).
   - **Lighting:** use `"warm low-key amber lighting, dark moody background"` (never `"candlelight"`, which draws literal candles).
2. `node tools/gen_portraits.js --batch 3` — generates up to 3 missing `.webp` portraits into `portraits/` (run `node tools/gen_portraits.js --list` to see what is missing).
3. Review the generated `.webp` files, delete any duds and re-run `--batch` (or `--ids <id> --force` to reroll one), then run `node tools/build_app.js` to pack them into `dist/`.

### 4.4 Check

Write a play script that meets the person, uses every topic, leaves and comes back. Read the second visit closely: that is where repeated lines and an early name show up.

---

## 5. A shop or market

Shops are data. `tools/gear_catalog.json` holds every shop and what it stocks, and `tools/gen_gear.js` writes the menus and the trade panel's rows.

### 5.1 Decide before writing

- What it sells and why this place would sell it.
- **Who buys each thing back.** Every item a shop sells needs somewhere to be sold. Prefer the seller buying its own stock at half price. A price is rounded down, so a 1-copper item cannot be sold back at 50%.
- Its hours and what shuts it.
- A shop with a counter, or an open market that trades every commodity.
- Its purse and how deep its shelves are, for a market.

A hub button never says what a shop sells. The player sees the goods and works it out.

### 5.2 Build it

1. **The place**, by section 1. Its exit option starts with `*set shop_open ""`.
2. **The catalog.** In `tools/gear_catalog.json`: a buy shop and a sell shop in `shops`, and one entry in `trades` naming the scene file, the label prefix and both shops. The file's own `_readme` lists every field.
3. **The scene's panel and settle labels.** Copy `timbermouth/market.txt` for a market.
4. **For a market**, search the mechanics rules for "Adding a settlement market": an entry in `tools/market_defs.json`, its key in `PILOT` in `web/mygame/trade.js`, and `*create market_<key> ""` in `startup_parts/48_market.txt`.
5. **For a counter shop on the trade panel**, search the mechanics rules for "To add a merchant".

### 5.3 Run the generators

```
node tools/gen_gear.js
node tools/gen_world.js
node tools/gen_markets.js
node tools/gen_gear.js
node tools/build_startup.js
```

`gen_gear.js` is listed twice because the recipe in the mechanics rules runs it again after the markets are rebuilt. That recipe also runs `node compile.js` between the two. Compiling is the designer's step, so ask before running it.

### 5.4 Check

```
node tools/gen_gear.js --check
node tools/check_market_loops.js
node tools/check_tradebook.js
node tools/lint_all.js <the shop file>
node tools/quicktest_parallel.js --changed
node tools/play_all.js <shop name>
```

Play scripts to write: the panel opens, a purchase settles at the agreed cost, a sale settles at the agreed credit, and a short purse is refused. Copy the three `halda_market_*` scripts.

Any new hover in a panel is a themed card like the sidebar's. Add no `title` attributes and no animation to trade rows.

---

## 6. An item

Items are data. One entry in `tools/gear_catalog.json` replaces about ten hand edits.

### 6.1 Decide before writing

- **What it does.** An item needs a use, a role as an ingredient, or a quest that needs it. An item that exists only to be sold is not added.
- **Which existing system it moves**: exposure, load, hygiene, healing, a check. Do not invent a new mechanic to justify an item.
- **Its price**, worked out from days of skilled labour plus materials plus a small markup. Then test it: how many days would a common labourer work to afford it?
- **Who buys it back.**
- **Its weight** in pounds, in steps of 0.05.
- **Its icon.** Every item has its own. If nothing in `ICONS/` matches the item's description, stop and ask the designer for one. Leave the item without art meanwhile.

A bonus to an ability score is ordinary for equipment. A bonus to a d20 roll is rare. An item with a score bonus is unique: it cannot stack or be bought twice.

### 6.2 Build it

1. **The catalog entry.** The `_readme` at the top of `tools/gear_catalog.json` lists every field.
   - `title` is three words or fewer, with no treatment words (boiled, waxed, riveted). Those go in `blurb`.
   - `id` never changes once it exists. The ownership flag is always `has_<id>`.
2. **The shop that stocks it**, in the same file.
3. **The icon**: a line in `MAP` in `tools/gen_item_icons.js`. Check the path is used by no other entry there or in `tools/gen_action_icons.js`.
4. **A quest item** gets a `keep` tag in its catalog entry, with the reason shown to the player, so it cannot be thrown away. The header of `web/mygame/discard.js` gives the format.
5. **The reference file**: a line in `Resources & Quest/EQUIPMENT_AND_ITEMS_REFERENCE.md`.

### 6.3 Run the generators

```
node tools/gen_gear.js
node tools/gen_item_icons.js
node tools/gen_world.js       only for a trade good
node tools/gen_markets.js     only for a trade good
```

For a trade good, search the mechanics rules for "Adding a trade good".

### 6.4 Check

```
node tools/gen_gear.js --check
node tools/gen_item_icons.js --check
node tools/check_inventory_weights.js
node tools/audit_discardable.js
node tools/quicktest_parallel.js --changed
```

Write a play script that buys the item, uses or wears it, and sells it back, with `"refresh": true`. Prose that mentions a worn piece uses its variable (`${cloak_prose}`), never the item's name.

---

## 7. An enemy or a fight

Read `Resources & Quest/COMBAT_ENGINE_PLAN.md` first. It holds the fight system's habits and its own check commands. This section is the short list.

### 7.1 Decide before writing

- A new enemy type, or an existing type renamed for one fight. A fight can rename a type and change its HP, AC and attack, so most fights need no new type.
- Its creature type, size, behaviour profile and morale.
- Whether the fight is lethal, whether the player can flee, and what a loss costs.
- What the fight is a consequence of. A quest reaches a fight through a failed roll or a choice, never straight from "accept".
- Spells belong to the fight, never to the enemy type.

### 7.2 A new enemy type

1. One entry in `tools/enemy_catalog.json`. Its `readme` lists every field.
2. Its prose in `web/mygame/scenes/combat_prose.txt`: a `*label flavor_type_<id>` and its line in `flavor_from_type`. The generator refuses a type without them.
3. The prose rules are strict because every player and every fight shares these lines. Read the long bullet on fight flavour in the narrative guidelines, under "Strict Subjective POV".

```
node tools/gen_enemies.js
node tools/test_enemy_catalog.js
node tools/check_enemy_creature_types.js
```

### 7.3 A fight

1. One template in `tools/encounter_catalog.json`. Its `_doc` lists every field: who is in it, where each starts, reinforcements, a leader, non-lethal, and up to three spells per enemy.
2. The story calls it in one line: `*gosub_scene combat fight_<id>`.
3. The place, the weather and the light are in the scene's own prose, never in the fight's.

```
node tools/gen_encounters.js
node tools/test_encounters.js
```

The generator also adds the fight to the dev hub's test menu.

### 7.4 Check

```
node tools/gen_enemies.js --check
node tools/gen_encounters.js --check
node tools/play_all.js <fight name>
node quicktest.js mygame startup combat combat_spells combat_movement combat_dice combat_prose combat_ai dice_engine dev_hub equipment choicescript_stats dungeon character_stats
```

Write one play script that wins the fight and one that loses or flees it. A script with a seed and `"refresh": true` is the only kind that proves the dice replay the same.

After any write to `combat.txt`, count its `*label` lines and compare with the count before.
