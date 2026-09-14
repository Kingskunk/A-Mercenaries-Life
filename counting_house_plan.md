# Factor Morzan's Counting House & Provincial Bounty Board

## Overview
This plan designs and integrates a new major location in **Alderford** ([alderford.txt](file:///c:/Users/Kwesey/Desktop/choicescript-main/web/mygame/scenes/alderford.txt)): **Factor Morzan's Counting House & Toll Office**. 

This location serves as the commercial, legal, and bounty hub of Alderford, providing four key services:
1. **Bounty Redemption & Document Hand-In:** Redeem the `found_customs_vellum` (Grey Waterway Toll Register from the Black Sinks) for silver and guild standing.
2. **Currency Exchange & Assaying:** Scale-tested conversion between Copper Bits, Silver Marks, and Gold Crowns.
3. **Secure Deposit & Letter of Credit:** Deposit coin into the Gilded Scales vault in exchange for a certified Letter of Credit redeemable in Port Valen.
4. **Provincial Bounty Board:** A public notice board featuring regional contracts, wanted posters (with reactivity to the player's background), and downriver river warnings.

---

## User Review Required

> [!NOTE]
> - **Hub Action Economy:** Visiting the Counting House uses normal hub traversal. Browsing the Bounty Board and making currency exchanges does not drain extra hub action slots; major activities provide natural lore progression.
> - **Fugitive / Runaway Background Reactivity:** If the player chose the Fugitive background, reading Baron Karr's wanted notice on the bounty board triggers custom interior monologue and cautious roleplay options.

---

## Proposed Changes

### 1. `startup.txt` — State Variables
Add tracking variables for Counting House transactions and letters of credit:
* `has_letter_of_credit` (boolean, default `false`)
* `letter_of_credit_value` (number, default `0`, tracked in silver value)
* `met_morzan` (boolean, default `false`)
* `visited_counting_house` (boolean, default `false`)
* `read_alderford_bounty_board` (boolean, default `false`)

---

### 2. `alderford.txt` — Hub Integration & Counting House Scene

#### A. Hub Entry in `alder_hub`
Add a dedicated option to the Alderford main menu:
* `# Inspect the slate-roofed Counting House & Toll Wharves on the customs slip.`
  * Gated by `alder_actions_left > 0`.
  * Deducts 1 action slot, advances time by 30 minutes, and routes to `*label visit_counting_house`.

#### B. Sensory Arrival & Atmosphere (`*label visit_counting_house`)
* Built on ironwood pilings over the customs basin, with slate shingles shedding steady drizzle.
* Two armed Gilded Scales guards in yellow-and-black brigandine flank the heavy iron-reinforced oak doors.
* Inside: Warm whale-oil lamps, smell of cedar, beeswax, and dry vellum. Clerks on high oak stools scratch ledgers with quill pens. Brass balance pans clink as coins are tested against standard lead weights.

#### C. The Counting House Core Hub (`*label counting_house_menu`)
Offers five distinct, interactive stations:

1. **`# [Bounty Redemption] Present the Grey Waterway Toll Register to Chief Clerk Orlov.`**
   * *Conditions:* `*if ((found_customs_vellum) and (not(turned_in_customs_vellum)))`
   * *Resolution:* The clerk verifies the imperial three-headed hawk wax seal. Factor Morzan steps out of his private office, acknowledging the Carrion's swift work at the Black Sinks.
   * *Reward:* Pays **4 Silver Marks** (`currency_add_amount 40`, properly locked) and sets `turned_in_customs_vellum true`.

2. **`# [Currency Exchange] Approach the assayer's counter to exchange coin or test weights.`**
   * Exchange 10 Silver Marks for 1 Gold Crown (compact, lightweight, prestigious in Port Valen).
   * Exchange 1 Gold Crown for 10 Silver Marks.
   * Exchange loose Copper Bits for Silver Marks (10:1 ratio).
   * Flavor text showing the assayer testing coin edges with a black touchstone and balance scales.

3. **`# [Letters of Credit] Deposit coin with the Factor's vault for a Port Valen Letter of Credit.`**
   * Deposit silver (minimum 5 Silver Marks) in exchange for a signed, wax-sealed Gilded Scales Promissory Note (`has_letter_of_credit true`).
   * Protects wealth from river mishaps, camp thieves, or swamp skirmishes on the downriver run, redeemable at the head factoring house in Port Valen's Upper Wharves.

4. **`# [Provincial Bounty Board] Read the iron-posted notices on the customs board.`**
   * **Notice 1: Black Sinks Toll Clearance (Completed):** Official notice detailing the Carrion contract.
   * **Notice 2: Taphouse Cellar Nuisance:** Merchant notice about strange scrapings in the riverfront storage (cross-links to Maura's taphouse bounty).
   * **Notice 3: Baron Aldous Karr's Highland Proscription:** Wanted notices for runaway serfs and deserters. If the player is a *Fugitive/Runaway*, triggers a tense, observant beat recognizing the bailiff's handwriting.

5. **`# Step back out onto the customs wharf.`**
   * Returns to `*goto alder_hub`.

---

### 3. `choicescript_stats.txt` — Codex & Inventory Synchronization
* Update **Inventory** to display the sealed *Gilded Scales Letter of Credit* and its deposited face value when active.
* Add Factor Morzan and Chief Clerk Orlov to the **Personnel & Relationships** codex if met.
* Update the **Gazetteer** to include the *Alderford Customs Slip & Counting House*.

---

## Verification Plan

### Automated Tests
* `node quicktest` — Verify all scene syntax, labels, and branching flow.
* `node randomtest num=100` — Verify playthrough stability and stat screen reachability across 100 runs.
* `node refresh_fuzz_test.js num=20` — Verify zero replay mutations or duplication leaks on all currency exchanges.
* `node tools/lint_anachronisms.js` — Verify 0 chemical or industrial anachronisms in all new text.
* `node tools/lint_mechanics_leak.js` — Verify narrative separation standards.
* `node tools/lint_weapon_assumption.js` — Verify weapon-class neutrality.
* `node compile play_game.html` — Compile complete bundled HTML build.

### Manual Walkthrough Verification
* Verify turning in `found_customs_vellum` grants 4 silver marks and removes the prompt.
* Verify currency conversions accurately adjust gold, silver, and copper pools.
* Verify Letter of Credit deposits deduct the correct coin amount and update the inventory card.
* Verify Bounty Board reactivity for Fugitive background.
