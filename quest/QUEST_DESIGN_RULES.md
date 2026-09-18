# Quest Design & Creation Rules — A Mercenary's Path

A comprehensive guide and rule-set for authoring quests, side contracts, investigations, and municipal encounters across *A Mercenary's Path*. 

---

## 1. Organic Discovery & Table-Facing Delivery (No Video Game Tropes)

* **No Faction-Scanning or Badge Recognition:** Never write NPCs who magically recognize a player's faction, gear, or background to dump a quest on them. Quests must originate through:
  1. **Environmental Tells:** Visible tension, a nervous barkeep watching an alley, crates being unloaded off-schedule, dockers arguing over a seized chain.
  2. **Player-Initiated Dialogue:** The player asks questions, probes an NPC's behavior, or inquires about work. It's much more immersive for the player to see that there is a quest here, and offer to assit and accept it or solve it and have the ability to not do anything, decline, or walk off.  Unless it's a devloping situation or event happening around the player outside of his control, where he has to act to defend his own life do we restrict choices, like an ambush or natural disaster, quest givers never magically signal out the player, tell them their issues and give them a quest like it's a video game.
* **Table-Facing DM Voice:** Write as though describing the scene aloud to one player at the table. Keep immediate senses and physical actions in the foreground. Let NPC dialogue and discoveries drive the plot without omniscient exposition.
* **Strict Subjective POV:** Never name an unfamiliar NPC, reveal secret gang allegiances, or explain an hidden motives until discovered through in-universe dialogue, documents, or direct investigation.
* **Wider World:** Understand that even though the amount of content we have now, with maybe only a town, or a village, the pc will dicover many more and be traveling around the world, adventuring, beyond Alderford, beyond Valen. What you write and create needs to make sense in a wider world too as well on the contien, where there is possibly no marches, where it could be a dester landscape, or a winter wonderland, or rocky mountain ranges, or a land of endless jungle, etc. Don't create possible world breaking lore. 

---

## 2. Multi-Branching Choice Architecture

* **The Rule of Three:** Every meaningful quest decision must offer at least three distinct, viable options. Avoid false binaries or identical checks dressed in different text.
* **Archetype Parity:** Ensure encounters offer balanced paths across character builds:
  * **Brute Force / Combat:** `[STR DC X]` (Vault charge, counter-slam, weapon disarm).
  * **Finesse / Stealth:** `[DEX DC X]` (Acrobatic sweep, stiletto draw, silent lock-tampering).
  * **Social / Underworld:** `[CHA DC X]` (Mercenary intimidation, deception, street shakedown).
  * **Tactical / Cunning:** `[INT DC X]` or `[WIS DC X]` (Exploiting guild regulations, reading tells, timing lifts).
  * **Arcane / Occult:** Dedicated cantrip and spell slots (`Mage Hand`, `Thaumaturgy`, `Vicious Mockery`, `Charm Person`, `Dissonant Whispers`, etc.).
* **Full Spell Slot Coverage:** When gating options by spells or cantrips, check all appropriate classes and origins (Wizard, Bard, Warlock, Hexblood) and deduct spell slots safely inside replay locks.
* **Fail-Forward Design:** Failing a check should escalate tension (drawing blades, shattering a cask, losing a surprise advantage, taking glancing HP damage) rather than causing an immediate dead-end or game-over. Provide secondary recovery options or NPC interventions.

---

## 3. Low-Fantasy Economy & Mercenary Dilemmas

* **Currency Scale (10:1 System):**
  * `10 Copper Bits = 1 Silver Mark`
  * `10 Silver Marks = 1 Gold Mark` (100 Copper)
* **Grounded Bounty Scale:**
  * **Street / Minor Task:** `1–5 Silver Marks` (10–50 copper).
  * **Municipal Contract / Major District Quest:** `10–20 Silver Marks` (100–200 copper).
  * **Major Guild / Military Campaign Reward:** `30–50 Silver Marks`.
* **The Mercenary Dilemma:** Quests should present conflicting incentives:
  * *The Lawful Route:* Modest official pay, but earns municipal standing and clean reputation (`port_watch_rep +1`).
  * *The Underworld Route:* Double or triple the coin in dirty hush-money, but forfeits official standing.
  * *The Company Route:* Diverting materials (steel, medical supplies) to the Carrion compound, earning standing with Captain Vane and long-term favors.

---

## 4. Setting, Technology & Worldbuilding Authenticity

* **Era: Early Modern / Renaissance Low-Fantasy (circa 1480–1530):**
  * **Allowed Technology:** Clocks and bell hours, waterwheels, tidal flap-valves, storm-winch counterweight cogs, drydock slipways, paper manifests, double-entry bookkeeping, bills of exchange, notarized vellum.
  * **Allowed Metallurgy:** *Shear-steel*, *blister-steel*, *crucible tool-steel*, *spring-steel*, *bog-iron*, *bloomery iron*, *case-hardened iron*, *tempered bodkins*.
  * **Ranged Armaments:** Heavy steel-limbed arbalests, hunting bows, recurve bows, siege ballistas, javelins.
* **Strictly Forbidden Anachronisms:**
  * **NO Gunpowder / Firearms:** No blunderbusses, flintlocks, pistols, or black powder.
  * **NO Industrial / Chemical Terms:** No "high-carbon", "titanium", "chemical reaction", "calories", "pneumatic", "turbines", "hydraulic".
  * **Run `tools/lint_anachronisms.js`** before finalizing any quest text.

---

## 5. ChoiceScript State Hygiene & Replay Safety

* **Standard Lifecycle Variables:**
  * `[quest]_quest_stage` — `"unstarted"`, `"active"`, `"resolved"`
  * `[quest]_resolution` — stores specific path taken (e.g. `"watch_seized"`, `"bribed"`, `"vane_diverted"`)
  * `[quest]_bounty_claimed` — boolean guard for one-time cash payouts
* **Zero Bare Increments Before Pauses:**
  * Never use bare `*set rep +1` or `*set coin +X` before a `*page_break` or `*choice`.
  * **Currency:** Always use `currency_add_amount` with `currency_txn_locked` and `*gosub_scene startup currency_add`.
  * **Reputation / Story Grants:** Always gate inside once-only boolean guards:
    ```choicescript
    *if (not(quest_name_resolved))
      *set quest_name_resolved true
      *set quest_name_quest_stage "resolved"
      *set port_watch_rep +1
    ```
  * **Combat / HP Damage:** Use `stat_bump_locked` with `locked_stat_bump_page_id = choice_page_id`.
* **Action-Grounded Time Progression (No Arbitrary Flat Increments):**
  * Time advances only when a physical action with genuine duration occurs (e.g. traveling between districts via the distance matrix, physical labor/cargo hauling, prolonged stakeouts, or resting).
  * Dialogue choices, tactical decisions, and shop haggling are free—the clock does not advance for conversation or menu selection.
  * Advance time contextually to match the in-fiction action, rather than applying a rigid template formula.

---

## 6. Open-World & Living Hub Integration

* **District & POI Hierarchy (No Floating Quest Menus):** Quests must live inside concrete physical locations within the world.
* **Environmental & Clock Reactivity:**
  * Quests should tie into living environmental systems where relevant: **Tidal Clocks** (low tide exposing canal vaults), **Day/Night Cycles** (contraband moving at dusk/night, merchants active during market hours), and **Weather** (rain slurry altering footing).
* **Proportional World Memory (Scale to Scope):** Quests should feel acknowledged without bloating hub systems or creating unnecessary maintenance overhead:
  * **Minor / Street Tasks (e.g. Tavern Shakedowns, Alley Skirmishes):** A brief greeting shift or single local perk from the directly involved NPC (e.g. Maret pouring a complimentary draught, a clerk skipping a routine bribe). *No district-wide rewrites or complex new systems required.*
  * **District / Faction Contracts (e.g. Silt-Gate Contraband, Vault Audits):** Faction reputation adjustments (`port_watch_rep`, `gilded_scales_rep`) and specific POI or contact unlocks.
* **Sync with `QUESTS.md`:** Every new quest must be documented in `quest/QUESTS.md` with its objective flow, mechanics, DCs, rewards, and variable list.
