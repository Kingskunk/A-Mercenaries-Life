# Quest Design & Creation Rules — A Mercenary's Path

Design guidelines for authoring quests, side contracts, investigations, hubs, and settlements across *A Mercenary's Path*. For code rules, variables, and subroutines, see `GAMEPLAY_MECHANICS_RULES.md`. For step-by-step build checklists, see `CONTENT_WORKFLOW.md`.

---

## 1. Organic Discovery & Table-Facing Delivery

* **No Faction-Scanning or Badge Recognition:** Never write NPCs who magically recognize a player's faction, gear, or background to dump a quest on them. Quests originate through:
  1. **Environmental Tells:** Visible tension, a nervous barkeep watching an alley, crates being unloaded off-schedule, dockworkers arguing over a seized chain.
  2. **Player-Initiated Dialogue:** The player observes the environment, probes an NPC's behavior, or asks about work. Unless an immediate physical emergency is happening right around the protagonist (an ambush, a collapsing scaffold, a fire), quest-givers never single out the protagonist unprompted, and the player can always accept, decline, ignore, or walk away.
* **Table-Facing DM Voice:** Write as though describing the scene aloud to one player at the table. Keep immediate senses and physical actions in the foreground. Let NPC dialogue and discovered details drive the story without omniscient exposition.
* **Strict Subjective POV:** Never name an unfamiliar NPC, reveal secret allegiances, or explain hidden motives until discovered through in-world dialogue, documents, or direct investigation.
* **Plain, Modern-Readable Language First:** Simplify the language and avoid words that aren't commonly used today. Never force the reader to look up archaic, medieval, or trade-specific jargon just to picture a scene. If a plain modern word is clearer and easier to picture (like *water channel* instead of *flume*, or *winch*, *barrel*, *gate*, *drain*), always use the plain word. This rule supersedes any period-flavor convention.
* **Wider World Compatibility:** Content spans multiple continents, cultures, and climates—arid deserts, freezing mountain passes, river valleys, and untamed borderlands. Keep regional laws, customs, and descriptions grounded in the local area without assuming the whole world works like one province.
* **Magic in the World:** Magic exists—mages, wizards, sorcerers, and magical items are real, and larger cities have magic shops and bazaars. However, magic is uncommon in small towns and villages, where ordinary people often distrust what they don't understand. You are most likely to find practitioners among the nobility, wealthy merchants, cult leaders, gang leadership, or specialized military units.

---

## 2. Choice Architecture: Branch-and-Bottleneck

* **Branch-and-Bottleneck Discipline (Avoid the "Mindmap Trap"):**
  Never design quests as an exponentially branching tree where every option splits into a permanently separate path. Instead, use **Branch-and-Bottleneck** structure:
  * **The Shared Spine:** The quest follows a linear spine of 3–5 milestone beats (Hook → Investigation → Confrontation → Climax).
  * **Local Tactical Expression:** At each obstacle, offer 3 distinct approaches across archetypes (Combat/STR, Finesse/DEX, Social/CHA, Cunning/INT/WIS, or Arcane). Each option has its own check, flavor, and immediate cost or advantage (health lost, spell used, a piece of leverage found, or an alarm raised), then **converges back to the next shared beat**.
  * **Climax Divergence:** Reserve true structural branching for the **Climax / Resolution Beat**, where earlier clues, alarms, or leverage unlock or alter the final endings. How many endings a quest has depends on its story, not on a quota (see §4).
* **The Rule of Three Applies to Obstacles, Not Transitions:**
  Offering three options means giving three tactical ways through a major challenge beat. Simple navigation, room transitions, or binary gates (e.g., *"Climb the ladder"* vs. *"Step back to the lane"*) only need two options or a clean transition—never invent filler choices just to hit three.
* **Archetype Parity:** Balance major challenge beats across character builds:
  * **Brute Force / Combat:** Strength checks (charging, prying, disarming).
  * **Finesse / Stealth:** Dexterity checks (acrobatics, silent movement, lockpicking).
  * **Social / Streetwise:** Charisma checks (intimidation, deception, persuasion).
  * **Tactical / Cunning:** Intelligence or Wisdom checks (spotting structural flaws, reading physical tells, using local rules).
  * **Arcane / Occult:** Relevant cantrips and spells across all casting classes and origins.
* **Fail-Forward Design (Failure Must Cost Something):** A failed check keeps the story moving, but never hands over the prize the roll was gambling for. Ask: *would a table DM allow this after that roll?*
  * **Failure closes a door and costs something real:** Lost time, a raised alarm that makes later checks harder or cuts the payout, lost evidence or leverage, lost standing, a lost ally's trust, health damage, or an approach closed for good.
  * **Failure never converts into the same success or reward:** Never award consolation coin or gear after a failed roll, and never offer a failure menu containing the exact free route the player could have taken without rolling.
  * **No stronger repeat of the failed act:** A failed attempt to intimidate, persuade, or overpower an NPC cannot be followed by an even bigger version of the same act on the same person. The NPC now has the upper hand.
  * **Climactic checks do not fail forward into a rescue menu:** Setup and investigation beats can fail forward with a worse position on the next beat. Failing the climactic check that decides the quest's ending lands directly on a lesser or losing outcome.
  * **Losing Must Be Possible and Must Show:** The climactic check can be failed, and failing it lands on a worse result the player can feel: the prize damaged or lost, less pay or none, an NPC turned against them, standing lost. In a small quest this can be a short failed or lesser version of the main ending, with its own closing lines. Give losing a full ending of its own, with local aftermath, only when the loss changes the world (a person dies, a place is lost, a faction turns).
* **Fights Are a Consequence of a Failed Roll, Not a Given:**
  * **Build an approach beat before combat:** Never jump straight from accepting a contract into a fight. Offer a careful approach that wins an edge on success, a clever approach that can solve or bypass the threat without fighting, and a direct "go straight in" option for players who want the fight.
  * **Non-combat solutions must still fulfill the contract:** If the patron paid to eliminate a threat, a clever bypass still has to neutralize it (such as an environmental trap or collapse) rather than leaving the danger behind.
  * **Failed bypasses carry distinct costs:** A failed stealth approach might simply forfeit the opening edge, while a failed sabotage attempt alerts the enemy and gives *them* the opening edge.
* **Downtime Prep Pays Off as an Edge, Never a Penalty for Skipping:**
  * Preparing ahead of time (gathering intel, sharpening weapons, buying salves, clearing an obstacle early) rewards the player with advantage on a specific later roll or a helpful edge. Skipping prep simply means rolling at normal odds, never taking an artificial penalty.
  * On multi-step journeys or hazards, a failed roll on the first beat can rattle or soak the protagonist and impose disadvantage on the next beat instead of dealing direct health damage.

---

## 3. Choice Design & Hub Presentation

* **Three Options Is the Standard for Active Decision Hubs:** Meaningful decision points, active exploration hubs, and open conversations should offer at least three genuine options.
* **Never Force Three Choices on Shut Doors or Barriers:** When a shop, gate, or road is closed for the night or shut by severe weather, do not invent filler options (*"Inspect the shutter"*, *"Listen at the door"*). Keep the location listed on the hub menu with a label showing why it is shut, and have it play a brief atmospheric description of the closed entrance before returning to the hub at no time cost.
* **Every Option Needs Its Own Substance:** Never pad a menu by cloning an existing option's check and reward with slightly different text.
* **Earned Affordances (No Magic Buttons):** Every choice must grow out of physical details, items, or conversational openings already established in the prose above it.
* **Background & Trait Justification:** When an option is unlocked by a background, class, or high attribute, ground *why* the character sees that angle in the prose.
* **Surface Interior Reasoning on Major Choices:** When the player makes a high-stakes call—spending scarce coin, trusting a suspect, or picking a risky plan—include the character's practical reasoning in the prose so they feel like a thinking person rather than a plot device.
* **Action Economy (Combat vs. Exploration):** In combat, casting a spell or using a tactical ability takes its turn in order—never combine a weapon swing and an action spell in one button unless a class feature allows it. Outside combat, cantrips are at-will.
* **Mechanics Stay in Brackets, Never in Prose:** Keep all numbers, DCs, costs, and mechanic labels inside `[bracketed hints]` or UI banners. Prose never says "you take 4 damage"—describe the physical impact instead. Brackets on choices are strictly for mechanical information (`[STR DC 12]`, `[5 Silver Marks]`), never narrative summaries.

---

## 4. Economy, Rewards & Mercenary Dilemmas

* **Currency Scale (10:1 System):**
  * `10 Copper Bits = 1 Silver Mark`
  * `10 Silver Marks = 1 Gold Crown` (100 Copper Bits)
* **Real-World Living Costs & Labor Benchmarks:**
  Measure every quest payout against what ordinary people actually earn and spend:
  * **Daily Food & Drink (Copper):** A hot bowl of stew, cider, or travel bread costs `2–5 copper bits`.
  * **Manual Day Labor (Copper, by the Hour):** Unskilled dock or hauling work pays about `1 copper bit per hour` (`8–10 copper` for a full backbreaking day), sometimes with a hot meal included. Silver is reserved for skilled or dangerous work.
  * **Soldier / Mercenary Monthly Pay:** A private soldier or enlisted mercenary earns a base wage of `~6 silver marks per month` (with barracks bunk and company bread provided).
  * **Working Lodgings:** A modest private room in a working district costs `1 silver mark per week` (`4 silver per month`).
  * **Major Capital (Gold Crowns):** Gold crowns buy ships, warehouses, masterwork plate armor, trade caravans, or armed retainers.
* **Proportional Reward Scaling:**
  Scale payouts to **danger, risk, time, and the patron's purse** rather than arbitrary brackets. A quick street job should feel meaningful against a laborer's daily copper; a dangerous bust or recovery should stack up against months of soldier pay; large faction operations deal in gold crowns.
* **Carried Tools Unlock Extra Options; They Never Gate the Path:**
  Catalog tools (rope, lanterns, repair kits, lockpicks, manacles, chalk) give a prepared player an extra or easier approach, and single-use supplies are spent when used. A player without the tool must always still have a viable route—a harder check, a cost, or a detour. Likewise, worn clothing affects comfort, exposure, or social difficulty, never whether a path is possible at all.
* **Endings Fit the Quest (The Mercenary Dilemma Is a Tool, Not a Quota):** Give a quest the endings its situation actually offers, and never invent one to fill a slot. Ask: *would someone in this scene really offer or allow this path?* If not, cut it.
  * **Small side quests** (a lost animal, an errand, one confrontation): one success and one failure are usually enough. Different ways of succeeding (paid or unpaid, a grudge earned, a favour owed) can be variations inside one ending, tracked with a flag rather than a new ending.
  * **Larger quests and faction contracts:** when the situation offers real temptation or leverage, offer the routes below that fit. Two is fine and three is the most, and avoid a flat good/evil choice.
  * **The three routes, as a reference:**
    * **The Lawful / Institutional Route (Legitimacy & Standing):** Honoring the contract, upholding local law, or backing established authorities. Pays standard rates, builds lawful reputation, and keeps local standing safe, at the cost of passing up bigger illicit profits.
    * **The Pragmatic / Underworld Route (Immediate Profit):** Exploiting the situation for maximum coin—taking a bribe, skimming cargo, or fencing contraband. Pays double or triple the contract fee up front, at the cost of institutional standing and local goodwill.
    * **The Strategic / Leverage Route (Long-Term Influence):** Turning the crisis into lasting political leverage, blackmail, an ongoing informant, or access to specialist services, trading immediate cash for long-term power.

---

## 5. Living World: Time, Weather, Healing & Settlements

* **Action-Grounded, Tiered Time Progression:**
  Time advances only when an action takes real physical duration—never for conversation choices, shop browsing, or menu navigation.
  * **Overworld & Inter-District Travel:** Follows distance and pace.
  * **Entering a Local Activity or Place:** Costs 15–25 minutes on entry; browsing or talking inside is free.
  * **Major Quest Beats & Set-Pieces:** Cost 30–45 minutes per beat, or hours for prolonged labor and stakeouts.
  * **Atmospheric Alignment:** Light and activity must match the hour and season (dawn, working day, dusk, night). Resting across midnight advances the calendar into early morning.
* **Wounds Persist and Heal Slowly:**
  After the prologue, wounds from a fight stay until treated. A night's sleep only mends 1–3 HP (depending on a private bed, bedroll, and bandages), and food never restores real health. Fast healing comes only from magic, potions, or a doctor, and mundane treatment is limited to once a day. Weigh combat consequences carefully when a failed roll can start a fight.
* **Four-Layer Place Descriptions:**
  To keep weather, time, and crowds from contradicting each other, location intros are built in four distinct layers:
  1. **Place:** Fixed geography, architecture, and smell—no weather, time, or people.
  2. **Sky:** Current weather and natural light matching the time of day (no people), ending with the ground's memory of recent weather (wet stone, mud, or high water lingering after rain). Indoor and sheltered places skip the sky layer and use at most one muffled weather detail.
  3. **Street:** Who is out and about, scaled by the hour, the day's schedule, and how harsh the weather is. Never write a weekday's name in prose (*"It is Hallowday"*); show what the day does to the street (shuttered stalls on a rest day, crowded lanes on a market day).
  4. **Tell:** Optional extra observations noticed by a perceptive or streetwise character, added onto the street layer.
* **Weather May Close an Outdoor Place, Never a Quest:**
  Severe weather or late hours can empty streets and close open-air stalls or boat landings for the day (leaving their button visible with the reason it is shut), while indoor halls, inns, and offices stay open. However, weather never locks out a quest option—foul weather is prime cover for thieves and smugglers, and any weather effect on a check's difficulty is a deliberate design choice for that specific obstacle (such as slick footing or poor visibility).
* **Proportional World Memory:**
  Match a quest's aftermath to its scope. A minor street task only needs a changed greeting or small local perk from the NPC involved; a major settlement or faction contract shifts faction standing, unlocks contacts, and adds rumors or lorebook updates.
* **Settlements Outside Port Valen: Scale, Template & Shelter:**
  * **Scale Sets the Services:** A city has everything; a town has a handful of places and small staff (a factor's hall with two unnamed clerks rather than a grand bank); a village has about three places of interest including a gathering hall, a village head who introduces themselves once, and a shared bunk or hayloft, with no bank, factor, or insurance.
  * **Severe Weather Shelter:** When dangerous weather shuts a settlement's exposed outdoor places, the gathering hall, the inn, or the place holding the village's beds always stays open and reflects the storm inside (barred door, crowded benches, built-up fire) so a traveler is never stranded.
  * **The Trading System Is Discovered, Never Explained:** Prose, map cards, lore entries, and shop text never lecture the player on supply chains or trade routes. Show stacked timber, grain wagons, or weighing scales and let the player connect the dots. A hub button never advertises what a shop sells.
  * **Unnamed by Default:** Guards, clerks, and passers-by who aren't part of a story stay unnamed. A shopkeeper or village head gives their name once on the first visit, and return visits describe their greeting rather than quoting the same line in a loop.
