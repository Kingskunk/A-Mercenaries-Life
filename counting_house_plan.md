# Factor Morzan's Counting House & Provincial Bounty Board

> [!NOTE]
> **STATUS: Implemented.** All four sections below (`startup.txt` state, the `alderford.txt` hub/scene, the Company Contract Board, and the `choicescript_stats.txt` codex sync) are live in the game. Verified with `quicktest.js` (pass), `randomtest.js num=400` plus `showUnreachedLabels=true` (every new label reached, no untested branches), `refresh_fuzz_test.js num=600 mode=smart` (zero findings beyond the two pre-existing baseline `int_mod`/`check_stat` cases — see below), `lint_mechanics_leak.js`/`lint_weapon_assumption.js`/`lint_anachronisms.js`/`lint_prose_tics.js`/`lint_thin_prose.js` (all clean of new findings), and `compile.js` (builds cleanly). This document is kept as the design record; a few details below were simplified during implementation — noted inline where that happened.
>
> **Two real bugs surfaced and fixed while building this, both recorded in `.agents/rules/narrative_guidelines.md`:**
> 1. **`currency_add` (`startup.txt`) had a pre-existing bug in its spend path**, live since the currency system was first built but never exercised until a Letter of Credit deposit became the first transaction in the game large enough to touch a nonzero gold column — column-wise subtraction could drive `gold` negative even with plenty of total wealth, if that wealth happened to be sitting in silver instead. Rewrote it to redecompose from total copper-equivalent value instead of subtracting per denomination. Directly confirmed against the exact corrupted state a real playthrough hit (`0g 25s`, spend 2 gold → was `-2g 25s`, now correctly `0g 5s`).
> 2. **`ch_credit_reclaim`'s own refund display had a refresh-safety bug** — it read `letter_of_credit_value` for display *before* the same guarded block zeroed it, which looks safe in program order but isn't: a refresh of that exact page reconstructs from already-mutated persistent stats and re-reads the post-reset value. Fixed by moving the display computation inside the same lock as the reset. The actual coin transfer was never affected (that part was already correctly guarded) — this was display-only, caught by `refresh_fuzz_test`.
>
> The remaining two `refresh_fuzz_test` findings (`startup.txt`'s `int_mod`, `dawn_trial`'s `int_mod`, and `alderford.txt`'s smithy `check_stat` flip at line 1321) are pre-existing and unrelated to this feature — flagged separately, not fixed here.

## Overview
This plan designs and integrates a new major location in **Alderford** ([alderford.txt](file:///c:/Users/Kwesey/Desktop/choicescript-main/web/mygame/scenes/alderford.txt)): **Factor Morzan's Counting House & Toll Office**.

This location serves as the commercial, legal, and bounty hub of Alderford, providing three core services plus one optional/deferred fourth:
1. **Bounty Redemption & Document Hand-In:** Redeem the `found_customs_vellum` (Grey Waterway Toll Register from the Black Sinks) for silver and guild standing. Assayer/scale-testing flavor (touchstone, balance pans, lead weights) is folded into this station's description rather than its own mechanic — see "Cut: Currency Exchange" below.
2. **Secure Deposit & Letter of Credit:** Deposit coin into the Gilded Scales vault in exchange for a certified Letter of Credit redeemable in Port Valen.
3. **Provincial Bounty Board:** A public notice board featuring regional contracts, wanted posters (with reactivity to the player's background), and downriver river warnings — now reactive to actual quest state instead of static (see "Narrative Synergies").
4. **(Optional, Tier 2) Company Contract Board:** A standing-wage desk for completed Carrion company business, separate from freelance bounties. See "Tier 2: Company Contract Board" — flagged as infrastructure without an immediate payoff, since every quest that exists today already has its own bespoke payout path.

---

## Cut: Currency Exchange
The original plan's second station — manual Copper↔Silver↔Gold exchange at a 10:1 rate — is **cut**. `currency_add` (`startup.txt`) already auto-carries and auto-borrows across all three denominations on every single transaction (gold = amount / 100 floored, silver = remainder / 10 floored, with post-hoc carry/borrow safety nets in both directions). A player's purse is never left in an un-normalized state, so a manual exchange station would be dead content with nothing to actually convert. The real-5e rate is genuinely 10:1 per tier (100:1 is the *compounded* two-step rate, not a separate base rate), so the current implementation is already RAW-accurate — this cut is about redundancy, not correcting the rate.

The sensory detail (assayer testing coin edges with a black touchstone, brass balance pans, lead weights) survives by moving into the Bounty Redemption station's flavor text, so nothing atmospheric is lost.

---

## User Review Required

> [!NOTE]
> - **Hub Action Economy:** Visiting the Counting House uses normal hub traversal. Browsing the Bounty Board and making a deposit does not drain extra hub action slots; major activities provide natural lore progression.
> - **Fugitive / Runaway Background Reactivity:** If the player chose the Fugitive background, reading Baron Karr's wanted notice on the bounty board triggers custom interior monologue and cautious roleplay options.
> - **Tier 2 decision needed:** does the Company Contract Board get built now as forward-looking infrastructure, or deferred until a quest exists that would actually use it? See that section below — this is the one open call in the plan.

---

## Proposed Changes

### 1. `startup.txt` — State Variables
Add tracking variables for Counting House transactions, letters of credit, and narrative reactivity:
* `has_letter_of_credit` (boolean, default `false`)
* `letter_of_credit_value` (number, default `0`, tracked in silver value)
* `met_morzan` (boolean, default `false`)
* `visited_counting_house` (boolean, default `false`)
* `read_alderford_bounty_board` (boolean, default `false`)
* `rennick_reported` (boolean, default `false`) — **new**, see "Narrative Synergies" below. Set only at the one point in `alderford.txt` (the successful Insight check around line 393) where the player's own dialogue explicitly promises to walk Rennick's shaved scales up to Morzan's toll-house.
* `carrion_contract_ratcatcher_resolved` (boolean, default `false`) — see "Company Contract Board" below.
* **Implementation detail:** the reactive-greeting tiers described below actually run off a new `morzan_regard` percent stat (mirroring every other NPC's `_regard`/`_respect` pattern, added to the Personnel codex), not raw booleans — `curing_resolution` bumps it `+12`, with an additional `+12` if `rennick_reported`. Net effect is identical to what's described (never-intervened / intervened / intervened-and-reported), just driven by one numeric stat instead of nested `*if`s, so it reads consistently with how every other NPC relationship in this game is tracked.

A Company Contract Board ledger turned out to need only the one boolean above — see that section for why the original 3-flag estimate was oversized.

---

### 2. `alderford.txt` — Hub Integration & Counting House Scene

#### A. Hub Entry in `alder_hub`
Add a dedicated option to the Alderford main menu:
* `# Inspect the slate-roofed Counting House & Toll Wharves on the customs slip.`
  * Gated by `alder_actions_left > 0`.
  * Deducts 1 action slot, advances time by 45 minutes (matching every other `alder_hub` destination, not the originally-planned 30), and routes to `*label visit_counting_house`.

#### B. Sensory Arrival & Atmosphere (`*label visit_counting_house`)
* Built on ironwood pilings over the customs basin, with slate shingles shedding steady drizzle.
* Two armed Gilded Scales guards in yellow-and-black brigandine flank the heavy iron-reinforced oak doors.
* Inside: Warm whale-oil lamps, smell of cedar, beeswax, and dry vellum. Clerks on high oak stools scratch ledgers with quill pens. Brass balance pans clink as coins are tested against standard lead weights.
* **Reactive greeting, gated on `met_talia` / `curing_abandoned`-reached:**
  * If the player never intervened at the curing shed (`met_talia` was never set), Morzan is blandly transactional — a factor with no particular opinion of a merc he's never had reason to notice.
  * If the player intervened by any path (paid Rennick off, exposed him, or fought his guards — all three currently converge on the same `met_talia true` / `talia_regard +8`), Morzan is warmer and more forthcoming, on the reasoning that quietly resolving a problem in his own toll district is worth a factor's attention even without him knowing the specifics.
  * If `rennick_reported` is additionally true, Morzan gets one extra line acknowledging the specific promise: *"A little bird already told me my bailiff's scales run light. Good instinct, chasing that up — I'll be having a word with him."* This is the one branch where the player's own words named Morzan directly, so it's the only case that gets a concrete payoff rather than a general warmth bump.

#### C. The Counting House Core Hub (`*label counting_house_menu`)
Offers four distinct, interactive stations (Currency Exchange removed per above):

1. **`# [Bounty Redemption] Present the Grey Waterway Toll Register to Chief Clerk Orlov.`**
   * *Conditions:* `*if ((found_customs_vellum) and (not(turned_in_customs_vellum)))`
   * *Resolution:* The clerk verifies the imperial three-headed hawk wax seal, testing it against a touchstone and balance pans before Factor Morzan steps out of his private office, acknowledging the Carrion's swift work at the Black Sinks.
   * *Reward:* Pays **4 Silver Marks** (`currency_add_amount 40`, properly locked) and sets `turned_in_customs_vellum true`.

2. **`# [Letters of Credit] Approach the vault counter.`** — now branded the **Gilded Scales Letter of Credit** throughout.
   * Deposit 5/10/20 Silver Marks at a time (`ch_credit_deposit_amount`, capped by what the player can afford).
   * **Stacks into a single running balance, not separate note instances.** `letter_of_credit_value` is one number the clerk amends in the ledger on every deposit ("same letter, larger claim") rather than the player accumulating multiple discrete letters — sidesteps ChoiceScript's lack of arrays, stays replay-safe with the same lock every other currency mutation uses, and matches the fiction (it's a vault ledger entry, not a stack of carried paper).
   * **Reclaimable at the Counting House itself, not just Port Valen** (added after a direct question about whether deposited coin ever comes back): a `has_letter_of_credit` player can void the *entire* balance back to coin on the spot, any visit. This closes what would otherwise be a real dead end — Port Valen doesn't exist as playable content yet, so without this, depositing was a one-way sink with no payoff anywhere in the game. Partial withdrawal isn't supported (void-all-or-nothing) — reads as "settle the ledger entry," not a bank teller.
   * Surfaced in the Equipment codex (`choicescript_stats.txt`) under a new "Sealed Documents" section once held.
   * Redemption at the actual Port Valen factoring house is still unbuilt — that's downriver content, not yet reachable.

3. **`# [Provincial Bounty Board] Read the iron-posted notices on the customs board.`**
   * **Notice 1: Black Sinks Toll Clearance (Completed):** Official notice detailing the Carrion contract.
   * **Notice 2: Taphouse Cellar Nuisance:** now reactive to `maura_cellar_cleared` (already set by both the environmental-kill and combat-victory branches of the culvert fight in `alderford.txt`, so this needs zero new state) — if true, the notice shows a "claimed/cleared" stamp instead of an open contract; if false, it still reads as an open merchant notice cross-linking to Maura's taphouse bounty.
   * **Notice 3: Baron Aldous Karr's Highland Proscription:** Wanted notices for runaway serfs and deserters. If the player is a *Fugitive/Runaway*, triggers a tense, observant beat recognizing the bailiff's handwriting.

4. **`# Step back out onto the customs wharf.`**
   * Returns to `*goto alder_hub`.

---

### 3. Narrative Synergies (new section)

The Counting House isn't a cold-open location — Factor Morzan is already referenced 10+ times across `alderford.txt` before the player ever sets foot there: he's the standing threat Rennick is repeatedly warned could end him, Talia name-drops "Factor Morzan's toll skimming" directly, Ysolde's weir-boom stealth stakes are framed as "getting caught means Morzan's men," and Maura flatly warns the player to "stay clear of the counting house." This plan leans on that instead of introducing him cold:

* **`rennick_reported` payoff** (see 1.A above) — the cheapest, highest-value hook. One new boolean, one new `*set` at an existing branch, one reactive line at an existing location.
* **Bounty Board Notice 2 reactivity to `maura_cellar_cleared`** — zero new state, just an `*if` swap on text that's currently static.
* **Sequencing Maura's "stay clear of the counting house" line** ahead of `visited_counting_house` — if she hasn't said it yet by the time the player visits, the location loses a beat of foreshadowing. Recommend checking where that line currently fires in `alderford.txt` and confirming it's reachable before the Counting House hub option, or gating the Counting House's first-visit flavor to acknowledge her warning directly ("Maura's words about staying clear come back to you as the door swings shut behind you...") if the player heard it first.

---

### 4. Company Contract Board — **DECIDED: build now**

Confirmed direction: a separate board at the Counting House for standing *Iron Carrion* company business, distinct from the freelance Provincial Bounty Board. Built as forward-looking infrastructure specifically so it has something to show on revisits — when the company marches out of and back into Alderford, or when the player passes through solo between story beats.

**Registration gate — zero new state needed.** Lore framing: the Gilded Scales only posts and pays out contracts to mercenary companies it has formally vetted. The Iron Carrion already qualifies — every player character is inducted into the Carrion at intake (the "Carrion Crow" ink stamp, `startup.txt` ~line 1492), and the Black Sinks Toll Clearance contract already establishes a working relationship between the Carrion and Morzan's office. So the gate is pure flavor text on first visit ("the clerk checks your company's seal against the Gilded Scales' registry — already on file") with no boolean behind it. This gets Morzan's registration requirement into the game without inventing a company-membership system that doesn't otherwise exist.

**Scope decision: bespoke contract, not a generic ledger.** ChoiceScript has no arrays, and every quest in the codebase so far (`found_customs_vellum`/`turned_in_customs_vellum`, `maura_cellar_cleared`, Talia's resolution branches) is its own small set of hand-named flags rather than a generalized system — building a numbered-slot ledger now, before a second contract exists to prove out what fields it actually needs, risks the same infrastructure-before-content trap as the deferred option this replaces. Instead: build one real, working contract end-to-end, and leave a short "how to add the next one" comment block in `startup.txt` (mirroring the existing "adding a new fight" comment pattern in `combat.txt`) so a second contract is a fast copy-paste later, shaped by what the first one actually needed.

**Built test contract — "Ratcatcher's Notice":** reframed during implementation from "grain-store vermin in the customs warehouse" to vermin nesting in the Counting House's own **archive cellar**, gnawing through old toll ledgers and vellum rolls — a tighter thematic fit (threatens the counting house's own records, not a generic warehouse) and avoids reading as a reskin of Maura's grain-store culvert bounty. Morzan's clerks want it handled quietly, before the Gilded Scales' own inspectors have cause to ask why their archive had tenants.

Mirrors the culvert quest's three-way approach split (Section 21 of the narrative guidelines — a fight is a consequence of a failed roll, not a given):
* **Careful (Stealth, DC 10):** success grants advantage on the first strike; failure just means the rats aren't surprised.
* **Clever (Athletics, DC 10):** success seals the den entirely, bypassing combat for the same reward; failure alerts the rats (`combat_enemy_advantage`) and still drops into the fight.
* **Direct:** straight into combat, no check.

Combat uses a new `fight_archive_rats` label in `combat.txt` — 3 "Archive Rats" (HP 4, AC 9 each), deliberately the weakest fight in the game, and the first fight to actually exercise the full 3-enemy-slot path end to end (`fight_rennick_guards` only ever proved out 2 slots).

**Simplified from the original 3-flag design to one:** only `carrion_contract_ratcatcher_resolved` (bool, default `false`) was actually needed — accept and resolution happen in one continuous scene (matching how Maura's culvert bounty already works), so a separate "claimed" mid-state had nothing to protect. Paid flat: 1 Silver Mark, 5 Copper Bits (`currency_add_amount 15`).

**Registration gate, as discussed:** zero new state. Chief Clerk Orlov checks the Carrion's seal against the Gilded Scales' registry once, during the player's very first Counting House visit (`visit_counting_house` in `alderford.txt`) — leaning on the codex's own existing line that the Gilded Scales are literally "the Carrion's current paymasters," so the registration check reads as a formality, not a new mechanic.

Once resolved, the slate board goes quiet with a forward-looking line about the board refilling if the company marches out of Alderford and back — the hook the revisit design was built for, ready for a second contract whenever one exists.

---

### 5. `choicescript_stats.txt` — Codex & Inventory Synchronization
* Update **Inventory** to display the sealed *Gilded Scales Letter of Credit* and its deposited face value when active.
* Add Factor Morzan and Chief Clerk Orlov to the **Personnel & Relationships** codex if met.
* Update the **Gazetteer** to include the *Alderford Customs Slip & Counting House*.

---

## Verification Plan

### Automated Tests
* `node quicktest` — Verify all scene syntax, labels, and branching flow.
* `node randomtest num=100` — Verify playthrough stability and stat screen reachability across 100 runs.
* `node refresh_fuzz_test.js num=20` — Verify zero replay mutations or duplication leaks on the Letter of Credit deposit and Bounty Redemption payout.
* `node tools/lint_anachronisms.js` — Verify 0 chemical or industrial anachronisms in all new text.
* `node tools/lint_mechanics_leak.js` — Verify narrative separation standards.
* `node tools/lint_weapon_assumption.js` — Verify weapon-class neutrality.
* `node compile play_game.html` — Compile complete bundled HTML build.

### Manual Walkthrough Verification
* Verify turning in `found_customs_vellum` grants 4 silver marks and removes the prompt.
* Verify Letter of Credit deposits deduct the correct coin amount and update the inventory card.
* Verify Bounty Board Notice 2 reflects `maura_cellar_cleared` correctly in both states.
* Verify Bounty Board reactivity for Fugitive background.
* Verify Morzan's greeting correctly branches across all three states: never intervened, intervened without reporting, intervened with `rennick_reported`.
