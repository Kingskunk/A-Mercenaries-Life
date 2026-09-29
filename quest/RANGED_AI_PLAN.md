# Combat Plan: Ranged-AI Position Awareness

Improves how ranged enemies and ranged allies behave once the close-combat ranged disadvantage rule is in place, so that a bow user is no longer a stationary damage sponge and kiting becomes a real option for both sides.

**Status:** Phases 1-6 implemented and verified (2026-09-29). Sits on top of the completed close-combat ranged penalty (see §2). **§11 added (2026-09-29):** Phase 2 shipped correctly but its own claim that it "makes row 2 apply to Kess too" didn't hold up — closing that properly needed a real target-selection feature, designed and now built as §11's Layer 1 (Phase 3) and Layer 2's 6a (Phase 4). See §11.4 for the current phase numbering (supersedes §6).

**Phase 5 (Retreat, §4.5), done — row 3 only, enemy side, per-type opt-in.** A cornered ranged type (`combat_enemy_weapon_type = "ranged"`, `range <= 0`) with a melee ally already in the shared adjacency bucket now has a real third option instead of just being intercepted: fall back one tier, take exactly one reversed opportunity attack, and still get a clean shot this same turn. Gated on a new per-type field, `combat_enemy<N>_can_retreat` (boolean, same "type must opt in" shape `chase_chance` already established for the same reason — a future non-tactical ranged creature simply wouldn't set it) — set true on `archer`/`slinger`, the only two ranged types today. **The reaction asymmetry is closed:** `player_oa_used` and `combat_ally<N>_oa_used` mirror the enemy side's own `oa_used` exactly, reset every round in `combat_begin_round` (and, matching that field's own double-coverage, again in `fight_cleanup`). `find_opportunity_attacker_against` is the reversed candidate finder — player first if eligible (a melee or finesse weapon, this specific enemy at range 0, reaction unspent), falling back to the lowest-HP eligible melee ally otherwise, "whoever's pool is left" per the plan's own framing, never a fight over who gets it. Two resolvers: `resolve_reverse_oa_player` replicates `resolve_weapon_attack_choice`'s melee-branch attack/damage math (finesse STR-or-DEX, two-handed dice, Dueling, Rage) because that label itself can never be safely `*gosub`'d for a reaction — it always ends by spending the player's own attack budget via a `*goto`, which is correct only for the player's own turn — but the actual roll, resistance/vulnerability and HP application still reuse `resolve_player_weapon_hit` whole, so Sneak Attack and Hex apply for free (both already live inside that label). `resolve_reverse_oa_ally` is far simpler: it just reuses `resolve_ally_attack` + `fight_narrate_ally_attack` wholesale, an ally's reaction hitting exactly like its normal attack does. Favored Foe marking is deliberately not offered on a reaction (RAW ties it to a declared attack). Retreat prose is new and dedicated, not a reuse of the closing lines. Row 4 (Disengage) is not built — every eligible retreat takes this path regardless of health until Phase 6 splits it by a `flee_hp_pct` field, deliberately not added yet since nothing would read it before Phase 6 exists.

Verified live via `scripted_play.js`, four scenarios against the real engine: (1) a cornered archer with a melee ally already adjacent correctly retreated instead of being intercepted — the player's own opportunity attack fired first (a natural-1 miss), the archer fell back to Close with the new dedicated prose and a correctly-labeled banner, and its follow-up shot that same turn correctly carried no `(Disadvantage` tag, confirming "the shot is clean" falls out of the existing close-range-penalty check for free once the range has actually changed; (2) with the player's own weapon forced to `"ranged"` (ineligible for a melee reaction), the ally correctly took the opportunity attack instead, via the reused `resolve_ally_attack` path; (3) a 1-HP archer killed outright by the reversed OA correctly ended the fight (`combat_outcome = "victory"`) with no retreat/shoot narration printed at all — the `if (combat_enemy_hp > 0)` guard around the movement/shoot block worked as intended; (4) a full 9-fixture regression pass, plus a real story fight (`fight_wreckers`, axeman + slinger), ran clean with no errors. **Not independently live-verified:** a ranged type with `can_retreat` deliberately false, for a concrete, structural reason rather than an oversight — the only two ranged types in the library (`archer`/`slinger`) both set it `true` unconditionally inside their own `apply_type_*` block, the same way they unconditionally set `weapon_type`, so there is currently no way to inject a `false` override via `stats` before the type applies without the type immediately overwriting it back to `true` — attempted, and confirmed to behave exactly this way live. Confidence instead comes from the field being a plain boolean AND-gate using the identical, already-proven pattern `chase_chance`'s own type-gating uses. `lint_all`/`quicktest` clean throughout.

**Phase 6 (Disengage, §4.6/§4.7), done.** The other half of the row 3/4 split, sharing Phase 5's `combat_enemy_can_retreat` gate (a type tactically capable of falling back is capable of picking the safer variant when hurt — no separate boolean needed) and adding one new per-type field, `combat_enemy<N>_flee_hp_pct` (0-100, set to 33 on `archer`/`slinger`, the same untuned-starting-point shape every other percentage in this plan used). The row-3 branch built in Phase 5 now opens with a wounded check — `(combat_enemy_hp * 100) <= (combat_enemy_max_hp * combat_enemy_flee_hp_pct)`, cross-multiplied rather than divided to sidestep this engine's integer-only `/` — and branches to Disengage when true, Retreat (unchanged from Phase 5) when false. Disengage falls back the same single tier as Retreat, but calls neither `find_opportunity_attacker_against` nor `resolve_enemy_attack`: no reaction at all (RAW: Disengage suppresses opportunity attacks entirely, a stronger guarantee than Retreat's "provokes but the shot is worth it"), and no follow-up shot — the whole turn is spent surviving. No separate `combat_enemy<N>_disengaged` flag was added despite §4.6's literal wording ("mirroring `combat_player_disengaged`") — reconsidered during implementation: the player's own flag exists because a single round can hold several of the player's own movement actions, each needing independent suppression; an enemy's entire turn is one dispatch with no equivalent multi-action structure, so simply never calling the OA finder in the Disengage branch is sufficient and there is no other code path that would ever try to react to this specific movement. Documented here as a deliberate scope trim, not an oversight, consistent with not adding a field nothing would read.

Verified live via `scripted_play.js` — genuinely wounded (not just re-labeled healthy) required bypassing the type library entirely for the test build: `apply_type_archer` unconditionally sets both `hp` and `max_hp` to the same number whenever `combat_enemy_hp_override` is used (an override represents "full health at this total," never a wounded fraction of a larger max), so a hand-built enemy (`combat_lib_1: ""`, every field the type would normally set given directly via `stats` instead — the same no-type-matches trick that leaves `apply_enemy_type`'s dispatch chain a pure no-op) was the only way to get a genuinely-wounded 3-of-10-HP (30%) archer into the fight. Confirmed: at 30% (below the 33% threshold), it Disengaged — no opportunity attack roll printed at all, no follow-up shot, just the fall-back and a dedicated new banner; at 40% (above threshold, same setup with HP raised to 4), it correctly took Retreat instead — the opportunity attack fired, the "Falls Back" banner appeared, and it attempted its normal shot — confirming the percentage boundary itself, not just "wounded vs not," is correctly wired. **A fourth occurrence of the exact same mid-sentence capitalization mistake** (`$!{combat_enemy_epithet}` instead of `${combat_enemy_epithet}` after "Hurt, ") was caught the same way as the previous three — reading the live transcript before calling it done, not lint or quicktest — and fixed. Full regression (9 dev fixtures + `fight_wreckers`) and `lint_all`/`quicktest` clean.

**Real bug caught live during Phase 5, the third time this exact shape has shown up:** the new `combat_enemy_can_retreat` field hit the identical `fight_setup` slot-1-snapshot gotcha as the sidearm fields (Phase 1) and `chase_chance` (this same session, minutes earlier) — `apply_type_archer`'s slot-1 branch only ever sets the BARE scratch, and without an explicit snapshot line `combat_enemy1_can_retreat` would stay at its `false` default forever. This time it was caught and fixed *before* any live test ran, by deliberately adding the snapshot line in the same edit that created the field, specifically because the pattern was now recognized in advance. Worth remembering as a standing checklist item: **any new field a slot-1 `apply_type_*` branch sets needs a matching line in `fight_setup`'s snapshot block, added in the same change, not after a bug proves it's missing.**

**Phase 4 (6a: Commit-and-Chase, §11.3), done — enemy side only:** melee enemies now genuinely notice a ranged ally and can break off to hunt her. New per-enemy-slot state (`chase_target`, `chase_range` — a field SEPARATE from `combat_enemy<N>_range`, deliberately, so breaking off needs no reset step at all — `chase_roll_done`, `chase_hp_snapshot`), synced/reset the same way every other per-slot field in this file is. `roll_enemy_chase_commit` (the one-shot decision, 33% starting odds against a living ranged ally at Close/Mid, untuned per §11.5) and `do_enemy_chase_step` (the shared single-tier-no-Dash movement/arrival step, reused for both the commit turn and every turn after) both take the acting slot as an explicit `*params` argument rather than reading `combat_next_turn`'s own `cnt_slot` implicitly — the IDE's own linter flags a same-file `*gosub` target positioned earlier in the file than its *temp's declaring line as "used before creation" even though the engine's actual `*temp` scope is shared across a same-file `*gosub` (confirmed by reading `web/scene.js`'s `gosub`/`temps` implementation directly) — sidestepped rather than fought, and it's the more explicit, more consistent-with-the-rest-of-the-file shape anyway. Two new dedicated prose pools (approaching / arriving) were written from scratch, never reusing the existing player-directed closing lines.

Verified live via `scripted_play.js` against the real engine: a Mid-Range swordsman with `rand=low` (forcing the 33% roll to hit) correctly broke off from the player, closed on Kess over two real turns with the new dedicated prose, arrived and attacked her directly, then correctly cleared its chase and resumed ordinary player-closing behavior on the third round — the full commit → chase → arrive → clear → resume cycle, one live run. A pre-seeded active chase with a lower current HP than its stored commit-time snapshot correctly broke off with the new "took a hit" line and no movement that turn. A `rand=high` run (forcing the roll to fail) correctly fell through to the ordinary closing-toward-player behavior with zero chase state touched. One real bug caught in this same pass, not by lint or quicktest: two of the new prose lines used `$!{combat_enemy_epithet}` (sentence-initial capitalization) in a mid-sentence position, printing "The swordsman cuts hard..." instead of "the swordsman cuts hard..." — caught by reading the actual transcript, fixed to `${...}`, reconfirmed correct on the next run. **Not independently live-verified:** the "chase target already dead" break condition (structurally identical to the already-verified "took damage" check, reading `combat_ally<N>_hp` the same way every other routine in this file already does) — the ally type library always resets an ally's HP when a fight is built, which made "pre-seed Kess as already dead before the fight starts" impractical without a real multi-round kill first; confirmed instead by code inspection and by `quicktest`'s branch-coverage walk reaching that exact conditional with no error. **Per-type tunability retrofit (2026-09-29, on request).** The commit roll's 33% odds were a bare literal shared by every melee actor regardless of species. Converted to `combat_enemy<N>_chase_chance`/`combat_ally<N>_chase_chance` (0-100, "0 means never" — same convention `move2_chance` already uses), set explicitly to 33 by every tactical humanoid type (`swordsman`/`axeman`/`knifeman`/`maceman`/`spearman`/`hookman`/`guard`, plus the `guard` ally type for Rook) and left at the unset default for the three mindless creature types (`lacedon`/`mire_rat`/`beast`), which now get a documented comment explaining the omission is deliberate, not forgotten. `roll_enemy_chase_commit`/`roll_ally_chase_commit` now read the field instead of a hardcoded `33`, gated on `> 0` so a non-tactical type skips the whole candidate scan rather than relying on the roll happening to always fail.

**Real bug caught live during the retrofit, same shape as Phase 1's sidearm gotcha:** `fight_setup`'s hand-listed slot-1 snapshot step (which copies bare scratch into `combat_enemy1_*` after a type is applied) didn't have a line for the new `chase_chance` field, so a slot-1 tactical enemy's chase odds silently stayed at 0 forever — indistinguishable from a mindless creature that deliberately never sets it. Caught by re-running the exact live scripted scenario that had proven commit-and-chase working before the retrofit (a Mid-Range swordsman with `rand=low`) and seeing it close on the player instead of breaking for Kess. Fixed by adding the missing snapshot line next to the sidearm fields' own (which document this exact class of gotcha already). Reconfirmed live: the swordsman chases again, and a same-setup lacedon — mindless, deliberately never given chase odds — still never does, even with the same forced-low roll.

**Melee-ally mirror, built and verified the same day (2026-09-29).** `roll_ally_chase_commit`/`do_ally_chase_step` (combat.txt) give Rook the same one-shot decision against living ranged-classified enemies, reading `combat_enemy<N>_range` as the distance proxy (the mirror image of the enemy side reading `combat_ally<N>_range`). Written against the ally system's own conventions rather than copied verbatim — no bare active-target scratch exists on this side, so both routines take the acting slot as an explicit `*params` argument and read/write `combat_ally<N>_chase_*` directly throughout. Genuinely new prose was written for "an ally closing on an enemy," not the enemy-side lines with nouns swapped. `combat_next_turn`'s ally branch now checks an active chase before `select_ally_attack_target` even runs, since a committed chase overrides its ordinary closest-tier/ranged-preference pick entirely.

Verified live via `scripted_play.js`: with a closer melee enemy (range 0) and a ranged enemy at Close (range 1) both on the field, Rook — who would ordinarily fight the closer melee enemy per Layer 1's own closest-tier rule — correctly broke off, closed to and attacked the ranged enemy instead, then correctly cleared the chase and resumed ordinary targeting (back onto the melee enemy) the round after. A pre-seeded active chase with HP below its stored snapshot correctly broke off with the "took a hit" line, mirroring the enemy-side result exactly. Same verification gap as the enemy side and for the identical reason: the "target already dead" branch wasn't independently live-fired (the ally type library resets HP on fight build, same practical obstacle), confirmed instead by code inspection and clean `quicktest` coverage. Full 9-fixture regression pass and `lint_all`/`quicktest` both clean throughout.

**Phase 3 (Layer 1: symmetric target selection, §11.1), done:** `find_intercepting_ally` widened in place — Mechanism A drops its melee-only filter (any living ally at range 0 is now a legal interception target for any acting enemy, melee or ranged), Mechanism B adds ranged-prefers-ranged sniping when Mechanism A found nobody in reach and the acting enemy is itself ranged (no range check — ranged attacks don't care about distance). New `select_ally_attack_target` wraps `fight_pick_target` (13 call sites, left untouched) for the one ally-turn call site: ranged allies prefer a living ranged-classified enemy anywhere on the field; melee allies restrict to the closest tier present among living enemies, kill-priority only as the tiebreak within that tier; both fall back to `fight_pick_target`'s plain scan when nothing's preferred; the player's HUD click still wins over all of it, checked first.

Verified live via `scripted_play.js` against the real engine, six scenarios, all against fresh `fight_library` calls (not mocked): (A) a melee swordsman with only a ranged ally at range 0 in the fight correctly attacked her instead of the player — impossible before this phase; (B) a ranged enemy archer with a ranged ally present but NOT at range 0 correctly sniped her over the player, confirming Mechanism B needs no adjacency; (D) a melee ally (Rook) facing a healthy Close swordsman and a 1-HP Long-Range archer correctly attacked the closer swordsman, not the trivially-killable archer — confirms closest-tier beats raw kill-priority; (E) a ranged ally (Kess) facing a 1-HP melee swordsman and a healthy ranged archer, both equally close, correctly shot the healthy archer — confirms ranged-preference beats raw kill-priority the other direction too; (F) a player HUD click still correctly overrode Kess's own preference, confirming the precedence rule holds. A full regression pass across all 9 existing dev fixtures (`Silt-Lurker` through `Squad Test`) completed with no errors. `lint_all`/`quicktest` clean throughout, no new bugs found this time (Phases 1 and 2 each caught one live; this one didn't, worth noting since the pattern had been "always verify anyway").

**Phase 2, done:** `resolve_ally_attack` (`combat_dice.txt`) now takes the same close-range disadvantage penalty as `resolve_enemy_attack`, gated on the acting ally's own `weapon_type = "ranged"` and `range <= 0` (no advantage/Bane counterpart — nothing grants either to an ally yet, so that half of the enemy version's shape would be dead code here). **Scope note, not in the original phase table:** §4.4's prose said this "makes row 2 apply to Kess too," but it doesn't, and shouldn't yet — there is still no signal anywhere for "an ally is being threatened by a melee enemy" (interception explicitly only ever protects/targets MELEE allies, never a ranged one), so a Kess-side quick-draw decision has no real trigger condition to gate on. Left for whichever phase actually builds that signal, not assumed here.

**Real bug caught live, not by lint/quicktest:** the fix as first written was a genuine regression. `combat_ally<N>_range` has always defaulted to 0 and nothing before Phase 2 ever read it for a ranged ally (`resolve_ally_attack` fires regardless of range), so no fixture or real fight ever bothered to set it — unlike the enemy side, where every real ranged-enemy fight (`fight_wreckers`, `fight_shroud_thieves`, `fight_dredge_ambush`) explicitly opens its archer/slinger at Close (1), never Engaged (0). The instant the penalty started reading that field, both dev fixtures that use Kess (`fight_dev_ally_ranged_test`, `fight_dev_squad_test`) started showing her shooting at a false "(Disadvantage — in reach)" on a shot whose own flavor text says "from the flank." Caught by literally reading the `scripted_play.js` transcript before declaring Phase 2 done, not by any automated check. Fixed by giving both fixtures the same explicit `combat_ally<N>_range 1` the enemy-side fights already use as convention — the type library itself still doesn't set a default (mirroring `apply_type_archer`, which doesn't either), so a future real fight that recruits an archer ally must remember to set her opening range explicitly, same as it already must for an enemy archer.

**Phase 1, done:** per-slot sidearm fields (enemies only — allies deferred until a phase actually wires ally quick-draw; `resolve_ally_attack` doesn't even have the close-range penalty yet, see §2's known limit, so there's nothing for an ally quick-draw to answer before Phase 2 lands), the row-2 decision in `combat_next_turn`'s enemy branch, `flavor_type_archer_dagger`/`flavor_type_slinger_dagger` prose pools, and a `fight_dev_quickdraw_test` dev fixture. Verified live via `scripted_play.js` against the real engine (not a mock): a slot-1 archer opened already cornered with no ally quick-draws on its very first turn (no `(Disadvantage` tag, correct 1d4+DEX dagger damage, correct dagger prose), re-fires correctly on a second consecutive round, and a slot-2 slinger (the indirected `apt_p` code path) quick-draws correctly too. Caught and fixed one real bug in the process — see `GAMEPLAY_MECHANICS_RULES.md`'s new bullet on `fight_setup`'s slot-1 snapshot list — where slot 1's sidearm fields were set but never copied into durable storage, so a slot-1 archer silently never quick-drew.

---

## 0. Decisions Already Made (read this first)

Settled in debated discussion already. Do not re-open without a good reason.

1. **Ranged attacks at close range take disadvantage; melee never does.** Implemented and verified. This plan assumes it.
2. **Ranged combatants get a melee sidearm (a dagger) and use it when cornered.** A one-off for that single attack, **not** a persistent equip — a drawn dagger must never leave a bow user disarmed.
3. **The dagger is a "quick draw": a second option for the AI, since the player can already swap so their sidearm at will.**
4. **A retreat is movement, and provokes an opportunity attack.** RAW. It is not free immunity.
5. **A melee ally does not "eat" the OA.** The ally is a separate creature. What an adjacent ally *does* do is make the chaser get intercepted — see §4.3, which is the actual strategic payload.
6. **Disengage is a distinct fourth option**, not a flavour of retreat: costs the action, grants no OA, and is for a wounded ranged combatant letting its melee ally hold the line.
7. **A retreat and a Dash are mutually exclusive in one round.** The player already has this via `combat_player_disengaged` + Dash's extra move; the AI needs the same constraint.
8. **Approximate adjacency is acceptable.** "Is a melee ally adjacent" uses the shared adjacency bucket, matching what `find_intercepting_ally` already accepts. No per-pair distance matrix.

---

## 1. Problem Statement

Before the penalty rule, a ranged combatant at any range attacked at full accuracy and had no reason to want distance. A Long Range archer was, in the engine's own words, "3 turns of free damage" (`combat.txt:844`) — a stationary damage sponge that nothing the player did mattered to.

The penalty fixed the *incentive* but created a new problem: a ranged combatant that gets adjacent now has only bad options.

| Current behaviour at range 0 | Result |
|---|---|
| Shoot | Disadvantage |
| Melee enemies excluded from movement (`combat.txt:2606` gates closing to non-ranged) | Cannot retreat at all |
| No sidearm fields exist on enemies or allies | Cannot switch to melee |

So an archer cornered by a swordsman simply shoots badly until it dies. The rule that was supposed to make *closing on a ranged enemy worthwhile* instead makes the archer unable to respond.

This plan gives ranged combatants three real answers to being cornered: draw a dagger, retreat, or disengage — and makes the choice depend on the tactical situation rather than on a single branch.

---

## 2. Dependency: the Close-Combat Ranged Penalty (DONE)

Already implemented and verified. Recorded here so this plan stands alone.

- `tools/spell_catalog.json` + `tools/gen_spells.js` — spell reach tags (`ranged` / `close` / `touch`), generated into `combat.txt`'s `spell_range_lookup` block.
- Player weapon + sidearm take disadvantage at range 0 (`resolve_weapon_attack_choice`).
- Ranged cantrips take it; Shocking Grasp is `touch`, so it is *offered* only when Engaged and never penalised.
- Enemies already had it (`combat_dice.txt`, `cea_ranged_pinned`).
- Roll banner reads `(Disadvantage — in reach)`, mirroring the enemy-side wording.
- Dev fixture `fight_dev_reach_test`: one lacedon Engaged, one at Long Range.

**Known limit carried into this plan:** ranged *allies* take no penalty at all. `resolve_ally_attack` has no advantage/disadvantage concept. This plan fixes that as a side effect (§4.4). **Closed in Phase 2 (2026-09-29).**

---

## 3. The Decision Table

Evaluated during the combatant's own turn, not as a static option gate.

| # | Situation | Action | Cost | Notes |
|---|---|---|---|---|
| 1 | Range > 0 | Shoot (primary) | none | unchanged |
| 2 | Range ≤ 0, **no** melee ally adjacent | **Quick-draw dagger**, attack | weaker damage, no penalty | the common case; never a bad option |
| 3 | Range ≤ 0, melee ally adjacent, healthy | **Retreat + shoot** | movement; **provokes an OA** | the shot is clean |
| 4 | Range ≤ 0, melee ally adjacent, **wounded** | **Disengage**, no shot | action; **no OA** | survive to fight again |

Possible future idea (not in this plan): archers attempting to keep foes at a safe distance, so a melee attacker has to Dash to close. Could be a fun mechanic; may be too smart for a player with only a melee option — needs testing before it's scoped.

Rows 2–4 are the new behaviour. Row 2 is what stops the archer being forced into a gamble; rows 3–4 are the situational choices.

**Why row 3 is still worth taking** (the correction made during design): the OA is real, but the melee enemy must *choose* to chase. If it does, `find_intercepting_ally` redirects its swing to the archer's adjacent melee ally. Chasing therefore trades "a hit on a possibly-wounded archer" for "a hit on me." That is the strategic payload, and it costs nothing to enable because interception already exists.

---

## 4. Implementation

### 4.1 Per-slot sidearm fields

Enemies (`startup.txt:1452-1493`) and allies currently have `weapon_type` / `dmg_*` but **no sidearm equivalent**. Add, per slot:

- `combat_enemy<N>_sidearm_weapon_type` (`"melee"`)
- `combat_enemy<N>_sidearm_atk_bonus`
- `combat_enemy<N>_sidearm_dmg_dice_sides`
- `combat_enemy<N>_sidearm_dmg_bonus`
- `combat_enemy<N>_sidearm_dmg_type`

**Built (Phase 1).** `_sidearm_prose` (originally listed here) turned out unnecessary — every existing type's flavor pool hardcodes its weapon noun directly in the prose text rather than interpolating a variable (confirmed against `flavor_type_maceman` etc.), so the new dagger pools do the same.

`combat_ally<N>_*` equivalents were added too (on request, 2026-09-29, for Kess specifically), one slot-cap ahead of when they were strictly needed: `apply_allytype_archer` now gives Kess the same dagger treatment as the enemy archer (same DEX-based to-hit/damage as her bow, only the die drops to 1d4), verified live via `scripted_play.js`'s `watch` (`combat_ally1_sidearm_atk_bonus`/`_dmg_bonus` exactly match her primary's 4/2, `_dmg_dice_sides` is 4, `_weapon_type` is "melee"); `apply_allytype_guard` clears the field explicitly for Rook, also verified live (empty string). **Data only — no ally-side runtime decision reads these yet.** `combat_next_turn`'s ally branch has no quick-draw logic, and still shouldn't until `resolve_ally_attack` actually has a close-range penalty to dodge (§4.4, Phase 2) — there is nothing for Kess's AI to be avoiding yet. The fields exist now so Phase 2 has something to build on and so Kess can be inspected/tested in the dev hub in the meantime. Unlike the enemy pool, there's no `fight_setup`-style snapshot trap here: `apply_ally_type` writes every slot's real storage directly via `{}`-indirection (no bare-scratch-then-copy step for slot 1), and `resolve_ally_attack` reads `combat_ally<N>_*` straight from that storage with no active-target sync layer either — see `apply_allytype_archer`'s own comment. Cleared in the existing per-slot reset loops (`fight_cleanup`), never in `fight_setup`, for the reason documented there.

Set by the type library: `apply_type_archer` and `apply_type_slinger` get a dagger (same DEX-based to-hit/damage bonus as the primary, only the die drops to 1d4 for the archer — the slinger's sling is already 1d4); melee types get `""` and never read the fields. **Gotcha found live:** slot 1's block only sets the BARE `combat_enemy_sidearm_*` names — `fight_setup` has a separate, hand-listed snapshot step that copies bare into `combat_enemy1_*`, and forgetting the sidearm fields there left a live slot-1 archer's sidearm permanently empty even though the type set it correctly. Slot 2+ never hits this since it writes its real per-slot storage directly. See `GAMEPLAY_MECHANICS_RULES.md`'s new bullet.

### 4.2 The three-way decision

Lives in `combat_next_turn`'s enemy branch, beside the existing closing logic at `combat.txt:2606`. **Not** a `*if` on the option like the player's sidearm gate at `1731` — that gate is static, this is a per-turn judgment.

Order: row 1 → row 2 → row 3 → row 4.

### 4.3 The engagement check

"Is a melee ally adjacent" = any living `combat_ally<N>` with `_weapon_type = "melee"` and `_range <= 0`. This is the same approximation `find_intercepting_ally` (`combat.txt:1157-1201`) already uses and explicitly documents as "the loosest thing the 0-3 tier model can honestly express." No new distance model.

### 4.4 Ranged allies take the penalty

`resolve_ally_attack` (`combat_dice.txt:545`) currently has no advantage/disadvantage at all. Add the close-range penalty there, gated on the ally's own `_weapon_type = "ranged"` and its `_range <= 0`. This closes the known limit from §2 and makes row 2 apply to Kess too.

### 4.5 Retreat

New branch in the enemy turn. Reuses `combat_shift_all_ranges "fallback"` and `find_opportunity_attacker`. **The candidate check must be reversed** — it currently only ever finds *enemies* attacking the *player*. A new `find_opportunity_attacker_against` reads the player's and allies' melee weapons and ranges.

**Capping, and why two axes are needed:**

- **Per-reactor:** `combat_enemyN_oa_used` already exists and is already cleared in `combat_begin_round` (`combat.txt:1270-1274`). Enemies already have exactly 1 reaction per round.
- **Per-move:** a single departure may trigger **at most 1** OA, whoever's pool is left. The existing code takes this approach for the player for the same reason (`combat.txt:1081-1087`: three engaged enemies would otherwise be ~18 damage, "an unwinnable spiral").

Both are required. Per-reactor alone does not bound a retreat by a player plus two adjacent allies — three *fresh* pools, three OAs.

**The reaction asymmetry must be closed.** Today only enemies react to the player's movement (`startup.txt:1468`). Giving the AI a retreat the player cannot answer would be a rules asymmetry in the player's disfavour. Add `player_oa_used` + `combat_ally<N>_oa_used`, cleared in the same `combat_begin_round` loop, and a reverse OA resolver reusing `resolve_player_weapon_hit` so Shield, Armor of Agathys, resistances, conditions and the death/rescue checks all work for free rather than forking.

### 4.6 Disengage

A fourth option, not a variant of retreat.

- New `combat_enemy<N>_disengaged`, set for the round, suppressing OAs from that combatant — mirroring `combat_player_disengaged`.
- Gated on **wounded** and **a melee ally adjacent**.
- Spends the action; no attack, no damage.
- Thematically: "let me flee, have my melee ally handle this, and live to fight again."

### 4.7 The flee threshold must be a field, not a constant

The wounded-ness gate is a tuning knob with no precedent in the engine — the archer type is annotated *"Not balance-simmed"* (`combat.txt:3179`). Make it a named per-type field:

`combat_enemy<N>_flee_hp_pct` — disengage below this fraction of max HP.

Archer and slinger can then differ, and the number is documentable rather than buried in a branch.

**Starting value (resolved, was §10 Q1):** 33% max HP for both archer and slinger — a sensible default, not a simmed one, since neither type is balance-simmed to begin with. Tune later via playtesting and the scripted scenarios in §8 if it reads wrong. There's no targeted/seeded balance-test harness in this repo for narrow tuning questions like this (`tools/check_balance.js` reads `randomtest` output, which can't isolate one scenario) — a real gap, worth its own tool eventually, not something to build for this plan.

### 4.8 Prose

The bulk of the work, and the reason §6 sequences prose first.

- **New dagger pools.** `flavor_type_archer` (`combat_prose.txt:1315-1349`) is 8 bow-specific hit/miss pairs — every one names a draw, a loose, an arrow. A close attack needs its own pool: 8 new pairs of a genuinely different physical action (a thrust, a slash, a grapple-and-stab). Reusing bow text with `${weapon}` swapped in reads wrong, and `combat.txt`'s own header warns against exactly that.
- **Same for `flavor_type_slinger`** (1180).
- **New retreat-and-shoot narration.** Nothing in the codebase narrates an enemy backing away; the closing branch only narrates closing.
- **New Disengage narration.**
- Per `narrative_guidelines.md`: enemy lines name the fighter through `$!{combat_enemy_epithet}` / `${combat_enemy_epithet}`, never a fixed noun; no weapon anatomy (crossguard, pommel, hilt); a blade is "an edge, a point, a swing."
- **No separate re-equip line (resolved, was §10 Q4).** The dagger hit/miss pool itself is enough to tell the player a swap happened — a line that names a thrust or a grapple-and-stab, instead of a loose or a draw, already reads as "this archer just went to melee." No dedicated "draws a dagger" banner needed; silent swap, loud attack.

---

## 5. UI

The sidebar already has an **"In your reach"** row (`index.html:561`, built at 531-540) listing every enemy at range 0. Once retreat exists, that row doubles as an OA-risk display for free — the player can see who could punish a Fall Back before committing. It stays read-only, deriving nothing, per its own comment.

Worth adding later, not in this plan: a marker on the ranged enemy row showing it has a dagger, so the player can read "that archer is cornered and dangerous."

---

## 6. Sequencing

Four phases. Each is independently testable; each leaves the fight working.

**Superseded by §11.4** (2026-09-29) — Layer 1 target selection was inserted as its own phase once Phase 2's "makes row 2 apply to Kess too" claim turned out to need a real feature, not just a gate check. §11.4 has the current phase numbers; this table is kept for history only.

| Phase | Scope | Needs | Status |
|---|---|---|---|
| **1** | Per-slot sidearm fields, the row-2 quick-draw decision, dagger prose for archer + slinger | nothing | **Done (2026-09-29)** |
| **2** | `resolve_ally_attack` penalty (§4.4) — closes the §2 known limit | phase 1 | **Done (2026-09-29)** |
| ~~3~~ | ~~Retreat + reverse OAs + both caps (§4.5)~~ | phase 2 | **Renumbered — see §11.4** |
| ~~4~~ | ~~Disengage + `flee_hp_pct` (§4.6, §4.7)~~ | phase 3 | **Renumbered — see §11.4** |

**Phase 1 first** because it is a pure improvement — the archer stops being forced into a bad choice — and it needs no reaction system. Phases 3 and 4 are the risky ones and must not be bundled with it.

---

## 7. Files

| File | Change |
|---|---|
| `web/mygame/scenes/startup.txt` | per-slot sidearm fields, `flee_hp_pct`, `_disengaged`, `player_oa_used`, `combat_ally<N>_oa_used` |
| `web/mygame/scenes/combat.txt` | the four-way AI decision (incl. row-2 quick-draw), retreat branch, reverse OA finder/resolver, type-library sidearm data |
| `web/mygame/scenes/combat_dice.txt` | ally penalty; reuse `resolve_player_weapon_hit` for player OAs |
| `web/mygame/scenes/combat_prose.txt` | dagger pools, retreat + disengage narration |
| `web/mygame/scenes/dev_hub.txt` | extend `fight_dev_reach_test`, or add a ranged-AI fixture — **done:** added `fight_dev_quickdraw_test` (also fixed a pre-existing dispatch gap where `fight_dev_reach_test`'s own menu option had no matching `*if` in `dev_combat_test_run`, so it silently ran no fight at all) |

---

## 8. Verification

**Per `GAMEPLAY_MECHANICS_RULES.md` §7, the right-sized tool is `quicktest` plus targeted scripted runs — NOT `randomtest`.** `randomtest` is a page-load smoke test and cannot catch mechanics errors; `scripted_play.js` drives the real engine with forced dice and assertions, which is what a mechanics change needs.

| Check | Catches |
|---|---|
| `node quicktest.js` | label/reachability/syntax; must report no uncovered lines in the touched files |
| `node tools/gen_spells.js --check` | generated block drift (added in the penalty work) |
| `node tools/lint_choices.js` | option-shape issues |
| `node tools/lint_weapon_assumption.js` | prose assuming a weapon the actor may not have |
| scripted runs per scenario | actual behaviour |

Required scenarios:

1. Ranged enemy cornered, no melee ally → quick-draws, no penalty, weak damage
2. Ranged enemy cornered, melee ally adjacent → retreats, takes exactly **one** OA
3. Same, with two adjacent melee allies → still exactly **one** OA (per-move cap)
4. Wounded ranged enemy, melee ally adjacent → disengages, no OA, no attack
5. Disengaged combatant, enemy leaves reach → **no** OA
6. Ranged ally cornered → takes the penalty (closes the §2 limit)
7. Player retreats from three melee enemies → at most one OA
8. Quick-draw leaves the primary intact (the archer still shoots next turn)
9. Full fight to victory — no soft-lock from the new branches

**Open measurement gap:** the archer type is annotated *"Not balance-simmed."* Whether kiting makes ranged enemies *harder* or just *different* is not something scripted runs can answer. If that matters, `tools/check_balance.js` exists but reads `randomtest` output, so it would need a scripted multi-seed driver first. Not a blocker for shipping; a real gap in the evidence.

---

## 9. Known Limits Carried Forward

- **No per-pair distance.** "Melee ally adjacent" is a shared bucket; an ally adjacent to enemy A counts as adjacent to enemy B. Accepted, and consistent with `find_intercepting_ally`.
- **Approximate engagement check.** Same reason.
- **`combat_enemy_range` staleness.** `fight_round_hub` calls `fight_pick_target` but not `fight_sync_target_in`, so the shared scratch is stale at menu-build time. Found and worked around during the penalty work via `combat_target_range`; a **pre-existing** issue affecting other gates. Worth its own look.
- **Flee threshold is untuned** and will need playtesting.

---

## 10. Open Questions

1. ~~**Flee percentage.**~~ Resolved — see §4.7: 33% max HP, both types, tune via playtesting.
2. **Should a melee ally ever disengage?** Almost certainly not; probably worth an explicit note so a later pass doesn't add it by accident. **Still open.**
3. ~~**Player quick-draw.**~~ Dropped — the player already has a free, permanent sidearm swap (`combat.txt:1731`) and doesn't need a second, temporary version of the same thing. §4.9 removed; no new player-facing option in this plan. The AI needs its own row-2 decision (§4.2) because it must never end a fight stranded in melee with its ranged weapon put away for good — the player has no such risk, since they choose their own gear.
4. ~~**Archer re-equip narration.**~~ Resolved — see §4.8: no dedicated line, the dagger prose pool itself carries it.

---

## 11. Extension: Symmetric Target Selection (design agreed 2026-09-29, not yet implemented)

**Why this exists.** Phase 2 closed the ally-side disadvantage gap, but its own §4.4 overclaimed: it does **not** make row 2 apply to Kess, because nothing in the engine can ever make an enemy attack her in the first place. `find_intercepting_ally` — the only thing that ever redirects an attack away from the player — explicitly and deliberately excludes ranged allies ("it isn't standing in the way, it's shooting from wherever it already is"). A ranged ally cannot currently be attacked by anything, under any circumstance. This section is the real fix: not a bigger gate condition, a genuine (if deliberately scoped) target-selection AI, built once and shared by both sides so enemies and allies get smarter from the same change — same philosophy as `fight_pick_target`'s own kill-priority rule already being shared by the player's auto-target and every ally.

### 11.0 Decisions Already Made For This Section

1. **No full per-pair distance matrix.** Every place "closest" is needed reuses the SAME shared-adjacency-bucket approximation `find_intercepting_ally` already relies on (`GAMEPLAY_MECHANICS_RULES.md`'s own words: "the loosest thing the 0-3 tier model can honestly express"). A real matrix would touch essentially every combat file for a spatial precision a 6-slot tier-based skirmish game doesn't need. Named as Option A during design, explicitly rejected as disproportionate — see §11.6 if that judgment is ever worth revisiting.
2. **Two layers, not one feature.** **Layer 1** (this phase): WHO an already-reachable attacker chooses to hit — a real decision, still using the existing bucket/kill-priority machinery, costs nothing new in movement. **Layer 2** (a later phase, not scoped here): an attacker actively redirecting its own closing movement toward a *specific* target it wasn't already near, and kiting (a ranged combatant retreating before it's forced to, to deny the dash). Layer 2 is where "may choose to move and attack, kiting the melee attacker" actually lives, and it needs one real new idea (see §11.3) that Layer 1 does not.
3. **`fight_pick_target` is not touched.** 13 call sites (every player weapon/spell option, the player's own auto-target, every ally's turn) share it today. Rather than parameterize a routine with that much blast radius, the ally side gets a new routine that wraps it, called only from `combat_next_turn`'s ally branch — the one call site that needs the new behavior.
4. **`find_intercepting_ally` is widened in place, not replaced by a parallel routine.** It already runs for every acting enemy regardless of type and already writes the one output (`combat_intercepting_ally`) `combat_next_turn` already branches on. Reusing it means zero changes to the call site or to `resolve_enemy_attack_on_ally`.
5. **Ranged-vs-ranged sniping preference is real behavior change, not just plumbing.** A fight that puts a ranged enemy and a ranged ally on the field together will see the enemy sometimes shoot the ally instead of the player from turn one. Safe to ship today only because, confirmed by grep, no real story scene currently uses an ally archer at all (`combat_ally_lib_1/2` never appears outside `combat.txt`/`dev_hub.txt`) — the same "nothing shipped is affected yet" argument Phases 1-2 relied on. Re-check this the day a real quest recruits Kess.

### 11.1 Layer 1: Attack Target Selection

**The rule, one table, both sides:**

| Actor | Eligible pool (reachable right now) | Pick |
|---|---|---|
| Melee enemy | The player, if this enemy's own range is 0 — **and/or** any living ally (melee or ranged) at range 0. *Widened from today's melee-only filter.* | Lowest HP among the eligible pool (existing tiebreak, unchanged). |
| Ranged enemy (always "in range") | The player — **and/or** any living ally at range 0. | Prefer a **ranged-classified** candidate in the pool (snipe the archer/caster). Fall back to lowest HP if none are ranged. **Exception:** if this enemy is itself cornered (`combat_enemy_range <= 0`, the existing row-1-4 gate), self-preservation overrides — it's already mid-decision on rows 2-4 against whoever cornered it, not picking a fresh target. |
| Melee ally | Every living enemy. | Lowest HP among enemies at the CLOSEST tier present (mirrors the enemy-side tiebreak: prefer whoever's nearest, not just weakest, when several tiers are in play) — `fight_pick_target`'s own kill-priority stays the *tiebreak within a tier*, not the whole rule. |
| Ranged ally (Kess) | Every living enemy. | Prefer a ranged-classified enemy (duel the enemy's own archer). Fall back to `fight_pick_target`'s existing lowest-HP rule if none are ranged. **Exception:** if a melee enemy has reached range 0 with HER specifically (now reachable — see below), that's a personal threat and should feed the ally-side equivalent of rows 2-4, not a target pick. *Ally-side rows 2-4 (Kess quick-drawing/retreating) are not scoped here — see §11.5.*

**What actually changes, concretely:**
- `find_intercepting_ally` (`combat.txt`) drops its `fia_weapon = "melee"` filter — any living ally at range 0 is now a legal interception target, not just melee ones. This alone is what makes Kess *reachable*: a scene that opens her already at range 0 (an ambush, matching the convention Phase 2 established) can now actually have her attacked.
- A new comparison step, added to the same routine, layers the ranged-prefers-ranged rule on top of the existing lowest-HP tiebreak when the ACTING enemy's own `weapon_type` is `"ranged"`.
- A new `select_ally_attack_target` (`combat.txt`), called from `combat_next_turn`'s ally branch in place of its current bare `*gosub fight_pick_target`: computes the closest-tier-among-enemies pool for a melee ally, or the ranged-preference pool for a ranged ally, then delegates to `fight_pick_target`'s existing kill-priority scan restricted to that pool for the final pick — so the tiebreak logic isn't duplicated, only gated.
- **No new movement.** Both routines only ever choose among candidates already at range 0 (or, for ranged, always-eligible) — exactly `find_intercepting_ally`'s existing scope, just widened. An enemy that hasn't reached anyone yet keeps closing exactly as it does today, toward the fight in general, not toward a specific chosen individual (that's Layer 2).

### 11.2 What Layer 1 Actually Delivers vs. Doesn't

**Delivers:** melee-vs-melee interception generalizes to melee-vs-anyone; ranged-vs-ranged sniping becomes real; Kess becomes attackable, and row 2 (her sidearm, built and verified in Phase 1's ally extension) finally has something to trigger it, in any fight that deliberately opens her engaged.

**Does not deliver:** an enemy noticing Kess is squishy mid-fight and spending several turns walking toward her specifically while she was previously safe at Close. Her own `combat_ally<N>_range` never changes during a fight today (ranged allies never enter the movement branch — confirmed while fixing Phase 2's regression), so nothing exists yet that could decrease it over time. This is honestly the more dramatic and satisfying half of what you described, and Layer 1 does not pretend to deliver it — that's Layer 2.

### 11.3 Layer 2: split into 6a (Commit-and-Chase) and 6b (Kiting) (2026-09-29)

Originally one phase; split once implementation planning showed the two halves have different dependencies. **6a doesn't need anything from Phases 4-5** — it's purely about who a melee actor decides to walk toward, using the same movement primitives that already exist. **6b (kiting) genuinely needs Phase 4's retreat machinery** (`combat_shift_all_ranges "fallback"`, the opportunity-attack rules) to already exist, since kiting IS a self-triggered retreat. 6a can be built next; 6b waits.

#### 6a. Commit-and-Chase (design finished 2026-09-29, ready to build)

The core idea, unchanged from the first draft: **an enemy's (or melee ally's) tracked range has to stop meaning "distance to my default target" and start meaning "distance to whoever I'm currently committed to."**

**Commit, don't re-roll.** A melee actor (enemy or melee ally) that is NOT already chasing anyone, and is not itself already engaged with its default target, gets **one roll per fight** — the first turn a ranged/caster candidate on the other side becomes a live option — deciding whether it breaks off to hunt that target instead of its normal default (the player, for an enemy; kill-priority-nearest, for a melee ally). A failed roll doesn't get retried later in the same fight if the candidate is still visible next turn — one attempt, one answer, tracked by a per-slot flag. Re-rolling every turn was explicitly rejected: it produces visibly indecisive AI (lunge at the archer, "change its mind" next turn, lunge again) and repeatedly disturbs the tracked-distance approximation for no benefit. Once committed, the actor keeps closing on that same target until one of three things happens: the target dies, the actor itself takes damage, or it actually reaches melee with its chase target (at which point Layer 1's ordinary attack-target-selection takes over — it's not "chasing" anymore, it's fighting).

**What breaks a chase (resolved):** **any damage the chaser takes, from any source, ends the chase immediately** — not just damage from whoever it originally abandoned. Considered and rejected: tracking the specific source and only breaking on damage from the abandoned default. That reads worse in practice, not better — a chaser that keeps charging toward its chosen target while every OTHER ally or enemy gets free hits on it looks suicidally fixated, not smart, and source-tracking adds real bookkeeping (who dealt this damage, was it the abandoned target specifically) for a behavior that should just mean "something hurt me, I'm done being clever." Simpler check, more sensible result, consistent with how this engine already prefers a plain reactive flag over precise attribution elsewhere (Bane's flat penalty, the close-range disadvantage's own `*temp` flag).

**Bounded by the target's own range, and reset the same way.** The commit roll only fires if the ranged/caster candidate's own tracked range is within a threshold (Close or Mid, not Long — a fight that opens its archer at Long Range is explicitly saying "she's not reachable easily," and the AI should respect that) — and if the roll succeeds, **that same value becomes the chaser's new tracked distance to her.** One number does both jobs: gates whether the chase is even worth starting, and becomes the pursuit's starting distance. This isn't an arbitrary reset — a ranged combatant's own range already means "how far back I'm standing from the fight," so reusing it as "how far the thing now hunting me has to close" is reading data that already means the right thing, not inventing a number. Resolved §11.6's old open question #2: no scoped enemy-to-ranged-ally distance field needed — a plain re-read of the target's own existing field does the job, in every direction (enemy chasing ally, ally chasing enemy), with no new state at all.

**Prose gotcha found during implementation planning, resolved:** the existing enemy-closing lines are hardcoded second-person — *"…and ${combat_enemy_epithet} is suddenly right on top of **you**"* — always addressing the player. An enemy committed to chasing Kess instead needs the line to be true, not just present. **Decision: write new, dedicated closing prose for "an enemy is closing on an ally," not a reuse of the existing player-directed lines or the ally-side's generic "closes in on the fight" phrasing** — named the target directly (mirrors how the dagger pools got their own dedicated prose in Phase 1 rather than reusing the bow's lines with a noun swapped in). Needed alongside the code, not an afterthought.

**New state this needs** (sketch, not final field names): one "chase target" slot number (0 = not chasing) per enemy slot and per melee ally slot; one "commit roll already attempted" flag per slot, so the once-per-fight roll doesn't re-fire every turn a candidate is present but was already declined. Both reset in the usual `fight_cleanup` sweep. Symmetric shape on both sides — build it once, shared, the same way Layer 1 was.

#### 6b. Kiting (still deferred, needs 6a and Phase 4)

A ranged combatant retreating on its own initiative, before it's cornered, specifically to deny a melee attacker the free close and force a Dash. Only makes sense once "who is this enemy actually walking toward" is a real, trackable fact (6a) AND a retreat action actually exists to trigger (Phase 4). The original plan draft (§3) flagged this exact idea and pulled back from it ("may be a bit too smart... will have to test") — that caution still applies to the actual retreat-trigger numbers, even once the targeting foundation is built. Recommend a live playtest pass before locking any threshold, the same gap already flagged for `flee_hp_pct` (§4.7) — this plan has no targeted balance-test tooling, only full scripted scenarios and manual play.

### 11.4 Sequencing (renumbers §6)

Layer 1 slots in as its own phase, between the already-shipped Phase 2 and the original Phase 3 (which itself becomes cleaner once allies can be legitimately threatened — retreat/disengage were always going to need "am I actually in danger" to mean something for Kess too). 6a is pulled forward ahead of Retreat/Disengage since it has no dependency on them; 6b stays after.

| Phase | Scope | Needs | Status |
|---|---|---|---|
| 1 | Enemy sidearm fields, row-2 quick-draw, dagger prose | nothing | **Done** |
| 2 | `resolve_ally_attack` close-range penalty | phase 1 | **Done** |
| **3** | **Layer 1: symmetric target selection (§11.1)** | **phase 2** | **Done (2026-09-29)** |
| **4** | **6a: Commit-and-Chase (§11.3)** | **phase 3** | **Done (2026-09-29), both sides** |
| 5 | Retreat + reverse OAs + both caps (was Phase 3, §4.5) | phase 4 | **Done (2026-09-29)** |
| 6 | Disengage + `flee_hp_pct` (was Phase 4, §4.6/§4.7) | phase 5 | **Done (2026-09-29)** |
| 7 | 6b: Kiting (§11.3) | phase 6 | Not started, not designed |

### 11.5 Known Limits Carried Forward (this section)

- **Ally-side rows 2-4 are still unscoped.** Once Kess can be genuinely cornered (Layer 1), she has a dagger (Phase 1) but no decision logic telling her to draw it, retreat, or disengage — that's the ally-side mirror of Phases 5-6 above, itself not yet designed for a non-player-controlled ranged ally (does she ever retreat on her own initiative before 6b/kiting exists? Almost certainly not — no mechanism would trigger it).
- **Ranged-enemy-vs-ranged-ally sniping changes real difficulty the moment any fight uses both.** Verify balance live (`scripted_play.js`, not `randomtest`) the day this stops being purely theoretical.
- **The commit-roll itself has no tuned odds yet** (what chance a live ranged/caster candidate actually triggers a chase) — a fresh tuning knob with the same "no targeted balance-test harness, pick something sensible and verify with scripted scenarios plus playtesting" situation as `flee_hp_pct` (§4.7). Not blocking the design, just not a number to invent casually when the time comes.
- **Kiting's retreat-threshold numbers are still untuned**, same reason, carried forward from the original plan's own caution (§3).

### 11.6 Open Questions

1. ~~**Layer 1's melee-ally "closest tier" pick.**~~ Resolved in discussion — a melee actor can only ever attack what it's already reached (range 0); if nothing's engaged yet there's nothing to widen to, it just keeps closing on whatever Layer 1's kill-priority currently prefers, same as today. No change needed to Layer 1 itself. Chasing a farther, more-preferred (ranged/caster) target instead is real, but it's a movement decision, not an attack-selection one — that's what §11.3's commit-and-chase covers.
2. ~~**Should Option A be reconsidered for Layer 2?**~~ Resolved — no. §11.3's reset rule (chaser's new tracked distance = the target's own existing range value) does the job in every direction with no new field at all. The "no full matrix" decision from §11.0 holds for both layers now, not just Layer 1.
