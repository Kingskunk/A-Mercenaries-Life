# Quest Plan: The Stolen Shroud (The Alley Shrine)

A grounded, street-level Robin Hood dilemma for the Alley Shrine under the timber arch in Dredge-End (`cut_shrine`). The clay bowl at the feet of Saint Althea's statue holds the weekly shroud-purse; a ruthless young thug from Lamp Stair has taken it, and the family of a drowned net-mender is waiting at the shrine with an unburied body.

* **Inspiration:** *Thief: The Dark Project* — classic street-level Robin Hood dilemma.
* **Location:** The Alley Shrine under the timber arch (`cut_shrine`).
* **Trigger:** reaching `cut_shrine` and finding the friar battered and the clay bowl shattered.
* **Structure:** four beats (Branch-and-Bottleneck), then a three-ending Mercenary Dilemma.

**Status:** outline only. No code, no `startup.txt` variables and no `quest/QUESTS.md` entry yet.

---

## 1. Existing Lore Hook

The text in `cut_shrine` already explains:

> "The friar does not keep what goes in the dish, traveler. It goes into the parish shroud-purse for whichever family lost their skiff to the bar this week. You've paid for somebody's burial shroud."

---

## 2. The In-World Premise

The clay bowl at the feet of Saint Althea's statue holds the weekly shroud-purse — a collection of hard-earned coppers gathered from the district's poorest residents to pay for simple linen shrouds and shallow cemetery plots for drowned watermen. A ruthless young thug from Lamp Stair kicked over the clay bowl, battered the elderly friar, and ran off with the entire purse. The family of a drowned net-mender is waiting at the shrine with an unburied body, unable to pay the gravedigger.

---

## 3. The Funnel Architecture (Branch-and-Bottleneck)

### Beat 1: The Hook (Broken Clay and Blood)

* **The Scene:** Entering the alley, you find the friar bleeding against the soot-blackened post, shards of the earthenware bowl scattered across the flagstones. A sobbing woman with three children is huddled by the saint's feet. The friar tells you a scarred tough named Crake tore the shroud-purse from his hands and fled toward the dice cellar on Lamp Stair.
* **Convergence:** The player agrees to hunt down the thief and recover the parish silver.

### Beat 2: Tracking Crake (Urban Investigation)

* **Bottleneck:** Finding where the thief holed up along the crowded terrace of Lamp Stair.
* **Branching Approaches:**
  * **Investigation / INT:** Follow the faint trail of dropped copper bits and fresh blood drops (from the broken bowl) along the granite steps.
  * **Perception / WIS:** Scan the crowds outside the drinking house, spotting a nervous hood repeatedly checking a heavy linen bag inside his coat.
  * **Intimidation / CHA:** Squeeze an off-duty runner by the dice cellar door, who quickly gives up Crake's hideout: an abandoned smoking cellar behind the drinking house.
* **Convergence:** You corner Crake in the dark cellar beneath Lamp Stair. He's already splitting the coins onto a barrel-head with an accomplice.

### Beat 3: Recovering the Purse (The Confrontation)

* **Bottleneck:** Crake draws an iron-tipped cudgel, backed against the wall.
* **Branching Approaches:**
  * **Combat / STR:** Step inside his swing and knock him into the barrels with a decisive strike.
  * **Acrobatics / DEX:** Feint, disarm his striking wrist, and pin him against the brick wall.
  * **Intimidation / CHA:** Radiate cold, lethal menace, telling him that stealing from a dead man's shroud marks him for the river silt before the morning bell.
  * **Arcane / Spells:** Cast Shocking Grasp or Vicious Mockery, dropping him to his knees in stunned surrender.
* **Convergence:** The thieves yield or drop. You retrieve the intact shroud-purse (`40 copper bits` / `4 silver marks`) and find an extra piece of stolen jewelry on Crake's neck.

### Beat 4: Climax / The Mercenary Dilemma (Multi-Ending Divergence)

#### Ending A: Altruistic / Saint's Favor (Return the Purse in Full)

* Bring the entire purse back to the friar and the weeping widow at the shrine.
* **Consequences:**
  * The widow presses a `Phial of Saint Althea's Water` into your hands — cistern-water the parish keeps for those who go out on the river, steeped with wild angelica and mountain arnica (`2d4+2 HP`, stackable).

#### Ending B: Cynical / Mercenary (The Finder's Fee)

* Return half the purse to the friar so the family can bury their dead, but keep the other half (`2 silver marks`) as your "contract recovery fee."
* **Consequences:** Moderate coin reward, neutral standing. The friar thanks you with sad eyes, understanding that mercy rarely comes free in Port Valen.

#### Ending C: Underworld Power Play (Keep the Gold & Pawn the Goods)

* Pocket the entire purse and sell Crake's stolen neck-chain at the Lamp Stair pawnbroker.
* **Consequences:** Highest immediate cash payout (`+6 silver marks` total), but the shrine queue falls quiet when you pass, and rumors of your cold blood spread through the water-lanes (`-1 local standing`).

---

## 4. Design Notes (added during formatting — not part of the outline above)

1. **The reward is item-only: no blessing, no coin, no standing line.** The draft's "Saint Althea's Folk Blessing (a permanent minor lore perk or free daily broth)" and "Universal respect among the Dredge-End poor" are both cut. That is what `QUEST_DESIGN_RULES.md` §6 asks for anyway — a Minor / Street Task gets a single local perk from the directly involved NPC, with "no district-wide rewrites or complex new systems required" — and each of the two cut rewards needed something that does not exist: there is no permanent-perk system (boons run through `apply_unique_buff`, 3 slots, timed, and lore through codex flags), and the shrine's broth line serves on Hallowdays only (`cut_shrine_page`, `port_valen_dredge_end.txt:2874-2968`), so "free daily broth" would have been new behaviour. The friar's gratitude stays as prose with nothing mechanical attached.
2. **The widow's charm has to be decided against an item already in the game.** The canonical "waterman's charm" is the weir-knot: tightly braided flax cord knotted with three river stones, "meant to keep you grounded when the river pulls hard" (`alderford.txt:3239-3241`), and it is already implemented as `elspeth_weir_knot` — Elspeth's Braided Weir-Knot, an equippable neck accessory (`inventory-data.js:190`, `equipment.txt:481`) handed over by the player's sister in Alderford along with `codex_weir_knots` (`alderford.txt:3242-3245`). So a "Waterman's Carved Bone Charm" would be a second neck item competing with her keepsake, and it cannot unlock `codex_weir_knots` because that entry already has a home. Pick one: make the reward what the parish weavers actually produce (a weir-knot braided for the drowned man, which fits the shrine's own congregation and keeps one shared craft), or make it a non-equipped keepsake or passive buff flag instead of a neck item. Either way it is a quest reward, and quest rewards are never sellable or pawnable (`equipment.txt:559-560`), so it must not go into the pawnbroker's table.
3. **"Cast Shocking Grasp or Vicious Mockery" needs a caster gate.** Both are real — `shocking_grasp` is a wizard cantrip and `vicious_mockery` a bard cantrip (`MAGIC_AND_ABILITIES_REFERENCE.md`) — but both are picks, so a fighter, rogue or warlock can never reach either. That option has to sit behind a `wizard_cantrip*` / `bard_cantrip*` check, the same multi-`or` shape the existing Mending and Prestidigitation gates use (`alderford.txt:568`).
4. **The numbers are internally consistent.** Ten copper bits make one silver mark in the `currency_add` math, so the purse's `40 copper bits` / `4 silver marks` and Ending B's half at `2 silver marks` both land. Ending C reads as the purse plus the pawned neck-chain reaching `+6 silver marks` total; since the Lamp Stair pawnbroker pays 35% of retail and quest items are not in the trade table (`equipment.txt:559`), the chain needs a fixed quest value of roughly `5s 7c` for that total to be exact rather than a standard-rate sale.
5. **Anchors verified in the game.** `*label cut_shrine` (`port_valen_dredge_end.txt:2860`), the shrine hub (`:2938`), `cut_shrine_gave` and the friar's quote (`:2996`), `codex_saint_althea` (`:2862`), and Lamp Stair as Area 5 of 7 with the dice cellar, the all-night drinking house and the pawnbroker's window (`:1923-2084`).
6. **The dice venues are already built and named, and Cutter is not one of them.** Beat 2 should land on the game's existing **Dice Cellar** (`cut_dice`, `port_valen_dredge_end.txt:2312`; the hub option reads "Go down the steps of the green door to the dice game", `:2025`), whose keeper is the unnamed "woman with a drawn face" (`:2315`). Do not name her, and do not put Crake's hideout inside her cellar: it is a new space, the abandoned smoking cellar behind the **Drinking House** (`cut_drink`, `:2365`; the hub option reads "Push into the all-night drinking house at the end of the street", `:2029`), which is what that venue is called in-game, so this plan no longer says "taproom". **`Cutter`** (`port_valen.txt:1204-1254`) is a different man at a different table: the chalk-circle hazard game in the Keel on the Quayside slips, with the gull-fight laugh and "Fresh face at the slips?" He is Quayside, not Dredge-End — do not borrow his name, his table or his voice, and do not let a Lamp Stair figure pick up that screeching laugh. Crake's own name still arrives from the friar's mouth in Beat 1, which is what `narrative_guidelines.md` §1 requires.
