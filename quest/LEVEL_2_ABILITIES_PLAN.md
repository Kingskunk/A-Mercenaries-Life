# Plan: Level 2 Progression, Training, and Rest

How the character earns a level point from a quest, spends it by training at a home or at the Carrion, and what a level 2 actually unlocks. This is a **plan only** — nothing here is implemented, and no scene has been changed.

**Status:** proposal, not started. Written against the engine as it stands (see Section 8 for the two places `MAGIC_AND_ABILITIES_REFERENCE.md` has drifted from the code). Where a feature is proposed, the plan gives the variables, the engine primitive it reuses, and the file:line where it would live. Where a change is a prerequisite for later work (the rest refactor in Section 2, the HP term in Section 6), it is called out as such.

---

## 0. Decisions Already Made (read this first)

These were settled in discussion and should not be re-opened without a reason.

1. **A quest gives one level point.** Completing a quest moves the character one step toward the next level. Points are the *only* thing quests give toward advancement.
2. **Points are spent by training, not automatically.** Having a point is necessary but not sufficient: the character must also train, at a real location, in real time. Training is the gate.
3. **Training is class-flavored.** Martial classes train with weapons; caster classes channel spells; rogue/ranger-adjacent characters work at being unseen and tracking. The three tracks are described in Section 4.
4. **Time is the real currency.** Training advances the clock, so it burns the hunger and fatigue tracks like any other activity. The designer controls pacing by choosing what training costs in hours.
5. **A level is a spent point plus a completed training session.** `character_level` only moves inside the training routine, never in a quest reward.
6. **Short rest restores Action Surge, Bardic Inspiration, and the fighter/barbarian/warlock short-rest resources.** This is a deliberate house rule; see Section 8 note 2 about the Bardic Inspiration divergence from RAW.
7. **Training happens at two anchor sites: a home location, and the Carrion compound.** Both already exist as places the player can reach; Section 1 covers what each already provides.
8. **The rest refactor (Section 2) comes first.** Short rest currently restores nothing at the one place it is named, and the restore block is copy-pasted at six sites. Adding a new rest resource before fixing that means editing six files. So Section 2 is a hard prerequisite for Sections 4 and 5.

---

## 1. Site map for training

Two sites are in scope. Neither needs a new location, only new options inside an existing hub.

### 1.1 Home — the rented room (Middle Ward)

`mw_room_hub` in `port_valen_middle_ward.txt` is already a home hub: it offers sleep, a short rest, a wash, and reflection, and it is already flagged as a permanent home (`sleep_is_permanent_home true`, `port_valen_middle_ward.txt:850`). This is the natural anchor for "training at home."

- **Already have:** a hub with an action-slot pattern, a long rest path, a short rest path, and a reflect option.
- **Reuses:** the same `advance_time` + `time_advance_call_id` pattern every other timed activity uses; the `resolve_sleep` long-rest model in `calendar.txt` for rest recovery.
- **Needs:** one new menu option per class track (Section 4), each advancing the clock and turning one held point into a level.

### 1.2 The Carrion compound (Port Valen)

The compound is real and already costs travel time to reach (`pv_time_compound`; hub choice at `port_valen.txt:677`; arrival prose inline in `port_valen_hub`, label at `port_valen.txt:355`). It currently has **no action hub of its own** — unlike the Middle Ward, the compound has no `camp_actions_left`-style slot counter, and its content sits inline in the Port Valen hub rather than behind its own POI label.

- **Already have:** a reachable site, a travel-time cost, and faction flavor in the arrival prose (the drill lines, the muster yard).
- **Reuses:** the Port Valen hub's travel/time system and the same `advance_time` call the home uses.
- **Needs:** a new `pv_poi_carrion` label with a small action menu, rather than an inline addition. The compound is the site most likely to grow — training partners, the quartermaster, weapon loaners — and it is the natural place to gate class training behind a standing or regard check.
### 1.3 Varren's night camp (early game only)

`camp_night.txt` is the pre-crossing bivouac. It already runs an action-slot economy (`camp_actions_left`, 4 slots) and already has a training-adjacent Varren option ("Straight answers and footwork drills beat marching blind," with a Tactics/Regard stat hint, `camp_night.txt:39`). It is **early game only** — it plays before Port Valen. Whether it counts as a training site is Open Question 3.

---

## 2. The rest refactor (prerequisite)

Restoration is currently copy-pasted at **six** sites rather than owned by a routine. Every new rest resource added before this is fixed has to be written six times, and a missed site is a silent bug — the player has Action Surge back at the wrong moment, or loses it entirely.

### 2.1 The six duplicated sites

| # | Scene | Line | Restores today |
|---|---|---|---|
| 1 | `alderford.txt` pre-dawn muster | 3826-3828 | Second Wind 1, Rage 2 |
| 2 | `battle_black_sinks.txt` post-battle long rest | 1951-1953 | Second Wind 1, Rage 2 |
| 3 | `port_valen.txt` arrival | 5186-5188 | Second Wind 1, Rage 2 |
| 4 | `port_valen_middle_ward.txt` rented room sleep | 859-861 | Second Wind 1, Rage 2, **Warlock slots 1** |
| 5 | `port_valen_middle_ward.txt` inn sleep | 1191-1193 | Second Wind 1, Rage 2 |
| 6 | `startup.txt` class assignment | 2116, 2169 | Second Wind 1, Rage 2 |

Note that site 4 already restores Warlock slots and the other five do not — the copy-paste has already drifted out of sync once.

### 2.2 Two labels

```
*label do_short_rest
*label do_long_rest
```

Both in `startup.txt`, beside the existing `second_wind` / `activate_rage` subroutines (`startup.txt:3319`, `:3386`). Each sets every per-rest resource in one place and prints nothing itself, so a calling scene keeps its own prose.

| Resource | Short rest | Long rest | RAW |
|---|---|---|---|
| Second Wind (fighter) | Yes | Yes | Short |
| Action Surge (fighter, §5) | Yes | Yes | Short |
| Bardic Inspiration (bard, §5) | Yes | Yes | **Long — deliberate departure** |
| Cunning Action (rogue, §5) | Yes | Yes | Bonus action, no rest cadence — house rule |
| Warlock spell slots | Yes | Yes | Short (Pact Magic) |
| Barbarian Rage uses | No | Yes | Long |
| Bard / Wizard spell slots | No | Yes | Long |
| HP | No | Yes (via `resolve_sleep`) | Long |

`resolve_sleep` in `calendar.txt` already owns the HP/exposure/sleep-tier half of a long rest, so `do_long_rest` owns the *uses* half and does not duplicate the sleep model.

### 2.3 The bug this fixes

`mw_room_short_rest` (`port_valen_middle_ward.txt:881`) is the one label actually named for a short rest, and it **restores nothing at all** — it advances an hour, prints prose, and returns to the hub. The only uses-restoring path at the rented room is `mw_room_sleep` (`:858-863`), which is a long rest. So today a player who takes a short rest at their own home gets nothing, which is the opposite of the intended rule.

The stats sheet also mislabels this: Second Wind is printed as `${fighter_second_wind_uses}/Short Rest remaining` (`choicescript_stats.txt:1020`) and Rage as `${barbarian_rage_uses}/Long Rest remaining` (`:1026`) — both actually restoring on the same long-rest path. Fix the labels in the same pass.

### 2.4 Migration

Replace the block at each of the six sites with one call (`*gosub do_long_rest`, or `do_short_rest` where the scene intends one). Then route `mw_room_short_rest` through `do_short_rest`. Search for `second_wind_uses` and `barbarian_rage_uses` after the change: every remaining hit should be inside the two new labels, the combat choice gates, or the dossier display.

---

## 3. Level points and the XP curve

### 3.1 Variables

Add to `startup.txt` beside `character_level` (`:227`):

```
*comment Level points are earned from quests and spent on training. The player
*comment never advances a level by completing a quest alone -- training is the gate.
*create level_points 0
*create level_points_total 0
*create level_points_next 3
*create training_session_id ""
```

`level_points` is unspent points, `level_points_total` is lifetime earned (dossier only, never reset).

### 3.2 The curve

`level_points_next` is a single tunable number, not a table, so pacing is one edit rather than nine. The suggestion is a flat +1 per level: 3 points for level 2, 4 for level 3, 5 for level 4, and so on. One point per quest then means the first level is roughly two to three quests of real content, which fits the current quest cadence (the Port Valen POIs plus the Stolen Shroud line).

On spend: `*set level_points - 1` and `*set level_points_next + 1`, both inside the training lock. This is deliberately simple — a per-level XP table is more machinery than a game with this many quest branches needs.

### 3.3 Where points are awarded

**The rule:** a quest's completion path awards `+1 level_points_total` and `+1 level_points`, in one locked mutation. This has to happen on the *completion* branch, not the quest-start branch, so a failed or abandoned quest pays nothing.

**The lock (non-negotiable).** Quest completions sit on pages with `*page_break` and `*goto` calls, which are exactly the replay-risk sites in `GAMEPLAY_MECHANICS_RULES.md` §1. Reuse the shared pair rather than inventing a new one:

```
*if (not(xp_locked)) or (not(locked_xp_page_id = page_id))
  *set level_points + 1
  *set level_points_total + 1
  *set xp_locked true
  *set locked_xp_page_id page_id
```

`page_id` only advances on a genuine choice or Next, never on a refresh, so this survives a Stats round trip. If a quest grants the point on a page that also spends a companion's standing, the second mutation needs its own lock — the pre-declared `stat_bump2_locked` / `locked_stat_bump2_page_id` slot exists for that.

**Alternative worth considering:** make the award derived instead. If every quest completion already sets a durable `*codex_*` or `*_completed` flag, then `level_points_total` can be a count of those flags, recomputed in a routine, with no lock at all. That is the cleanest option under §1 rule 1, but it only works if the quest flags are reliably set and never cleared — worth auditing before committing to it.

---

## 4. Training

Training is the only thing that converts a point into a level.

### 4.1 Shape

Both sites expose the same menu, one option per class track, so the class decides prose and the site decides cost:

| Track | Classes | At the home | At the Carrion |
|---|---|---|---|
| Martial | Fighter, Barbarian | Drill forms against the stand | Yard drills with the veterans |
| Channeling | Bard, Warlock, Wizard | Quiet cantrip work in the garret | Quarters practice, drill-yard nonsense suppressed |
| Fieldcraft | Rogue, Ranger | Prying practice, spoor tracking on the roof | Live practice on the garrison outbuildings |

One option per track keeps the menu to three lines and lets the player train a track that is not their class for flavor, at no mechanical benefit.

### 4.2 Cost and gate

```
*comment Gate: at least one unspent point. Without one, the option still shows
*comment (training is a thing you can do) but the level does not move.
```

| Element | Home | Carrion compound |
|---|---|---|
| Action cost | 1 of the hub's slots | 1 of the compound's new slots |
| Time cost | ~2 hours (`hours_to_pass 2`) | ~4 hours, plus `pv_time_compound` travel each way |
| Hunger / fatigue | Yes — flows through `advance_time` | Yes, and the travel compounds it |
| Coin | Free | Free, or a small fee if a quartermaster gate is added later |

Time cost is the pacing lever the design is actually built on, so it must run through `*gosub_scene calendar advance_time` with a unique `time_advance_call_id` per call site — never a bare `*set clock_hour`. The existing call sites to copy are `mw_room_short_rest` (`port_valen_middle_ward.txt:882-885`).

### 4.3 What training does

Guarded once, as a single mutation:

```
*if (not(training_locked)) or (not(locked_training_page_id = page_id))
  *if (level_points > 0)
    *set level_points - 1
    *set level_points_next + 1
    *set character_level + 1
    *set prof_bonus + 1
    *set training_completed true
  *set training_locked true
  *set locked_training_page_id page_id
```

| Change | Note |
|---|---|
| `level_points` -1 | Spends the earned point |
| `level_points_next` +1 | Raises the next threshold (§3.2) |
| `character_level` +1 | The point of the whole system |
| `prof_bonus` +1 | Feeds Rogue Expertise (`prof_bonus * 2`, `startup.txt:2670`) and the new `spell_save_dc` |
| HP | **Not here** — see §6 |

Then a single derived recompute, never a bump: `*gosub update_dnd_stats` handles `prof_bonus` consumers once the HP term in §6 is in place.

### 4.4 Locking note

`character_level`, `prof_bonus` and `level_points` must all move inside the one guard above. Splitting them across branches is exactly the shape that produces a half-applied level on refresh, and `prof_bonus` is read by `roll_d20_check` on the very next check, so a leaked partial state is visible immediately.

---

## 5. What level 2 actually unlocks

Ordered by how little new machinery each needs. The tiering is the point: Tiers 1 and 2 need no new combat primitive and no new damage math, because they reuse engines that already exist. Do those first — they are what makes training feel worth the clock.

### 5.1 Tier 1 — near-free (1-5 lines each, no new math)

| Class | Feature | Vars to add | Engine reused | Where |
|---|---|---|---|---|
| Barbarian | **Danger Sense** — advantage on DEX saves | none | `advantage` flag | `roll_d20_check`, beside the Elf/Dwarf racial block (`startup.txt:2616-2620`) |
| Fighter | **Action Surge** — one extra action per short rest | `fighter_action_surge_uses` (1) | an existing no-cost attack option | `combat.txt` round hub, beside Second Wind (`:992`) |
| Bard | **Bardic Inspiration** — advantage granted, CHA-mod uses | `bardic_inspiration_uses` (3) | `advantage` flag | `combat.txt` round hub, beside Vicious Mockery (`:740`) |
| Rogue | **Cunning Action** — free disengage/hide once per short rest | `rogue_cunning_action_used` (false) | the bonus-action slot already in `fight_round_hub` | `combat.txt` round hub |
| Ranger | **Favored Enemy** — advantage vs. a chosen creature type | `check_context` | `advantage` flag | `roll_d20_check`; see the gap below |

**Ranger's two level-2 features are the most expensive in Tier 1, and only because of a missing variable.** `ranger_favored_enemy` and `ranger_favored_terrain` are already chosen in `dawn_trial.txt` and already documented as "just a `*set save_vs`-style tag away." The one thing missing is creature/terrain context: a `*set check_context "goblin"` on the calling scene, and a branch in `roll_d20_check` that grants advantage when it matches `ranger_favored_enemy`. That is ~4 lines plus one new context tag per call site that wants it. `Natural Explorer` has the identical shape against `ranger_favored_terrain`.

**Bardic Inspiration is a house rule.** RAW gives it a CHA-mod number of uses recovered on a **long** rest. The decision here (§0.6) is short rest, so a bard can hold it through a whole day of Port Valen without sleeping. That is better for this game's action economy, and it is a deliberate departure — flagged again in §8 so it is not "corrected" by accident later.

**Cunning Action is also a house rule.** RAW gives it no rest cadence at all — once per turn, unbounded. Capping it at one per short rest keeps the rogue from spending its whole turn on movement every fight, and makes the short-rest rule in §2 meaningful for a class that has no slots.

### 5.2 Tier 2 — spell save DC and spell attack bonus (highest leverage)

**This is the single most valuable addition in the plan, and it is one line each.**

Neither variable exists anywhere in the codebase — every check hardcodes DC 10 or DC 12. So a 20 INT Wizard and an 8 INT Wizard cast at the same difficulty, and the level-2 `prof_bonus` bump (2 → 3) changes nothing for any caster.

Derive both in `update_dnd_stats` (`startup.txt:2274`), right beside the existing `*_mod` derivations:

```
*comment Spell save DC / attack bonus, derived from the casting stat.
*comment Wizard is INT, Bard and Warlock are CHA, Ranger is WIS.
*set spell_save_dc (8 + prof_bonus + int_mod)
*set spell_attack_bonus (prof_bonus + int_mod)
*if (((character_class = "bard") or (character_class = "warlock")))
  *set spell_save_dc (8 + prof_bonus + cha_mod)
  *set spell_attack_bonus (prof_bonus + cha_mod)
```

Derived, not bumped — so it needs **no lock** and survives refreshes for free (`GAMEPLAY_MECHANICS_RULES.md` §1, rule 1). Then replace the hardcoded `*set check_dc 10` / `*set check_dc 12` in the spell paths with `${spell_save_dc}`. The combat gates at `combat.txt:740-820` are the cluster to sweep; leave the non-spell skill DCs (Persuasion, Stealth, lockpicking) alone, since those are 5e ability checks, not spell saves.

### 5.3 Tier 3 — Ranger spellcasting (no longer optional)

Once Training exists, a Ranger who trains to level 2 and gets nothing is a dead end. Ranger's only level-2 features are Fighting Style and spellcasting, so spellcasting has to ship with the training system or the class's whole reason to train is missing.

- **Vars:** `ranger_cantrip`, `ranger_cantrip_2`, `ranger_spell`, `ranger_spell_slots` (3 at level 2, WIS-based, long rest).
- **Cheapest implementation by far:** widen the existing `*if` conditions at `combat.txt:591-767` so they also match the ranger vars. Fire Bolt, Ray of Frost, Magic Missile and friends are already written, already wired to `resolve_player_hit` and `resolve_magic_missile`, and already have death-flavor branches. Zero new damage math.
- **The list constraint people get wrong:** a Wisdom caster draws cantrips from the **druid/wizard** list, not the warlock list. So a Ranger gets `guidance`, `mending`, `light`, `mage_hand`, `minor_illusion`, `prestidigitation`, `ray_of_frost`, `fire_bolt`, `thorn_whirl` — but **not** Eldritch Blast and **not** Shocking Grasp. Check the pool against the class list, not against the Wizard's pool, since Wizard and Ranger share a list but a Ranger's spells are WIS-gated.
- Keep pools at 3-5 per `narrative_guidelines.md` §5, and let the pool be the same *strings* the Wizard uses so the combat conditions widen cleanly.

### 5.4 Tier 4 — needs a real new primitive

**Rogue Sneak Attack.** `rogue_sneak_attack_die` is tracked ("1d6") and completely dead, because the doc notes there is "no attack-with-advantage system to trigger it" — that system now exists. The work is capturing whether the current attack was made with advantage (`roll_had_advantage` is already persisted at `startup.txt:863` and set at `:2696`) and adding the die inside `resolve_player_weapon_hit`.

Per the engine's existing simplification, fold the Sneak Attack die into the weapon hit's own roll rather than making it a separate typed damage instance — the same decision already made for Hex's rider die.

---



## 6. Level-up hit points and the recompute trap

**This is the trap that silently breaks a naive implementation.**

`update_dnd_stats` recomputes `hp_max` from scratch on every run:

```
*set hp_max (hit_die_max + con_mod)          *comment startup.txt:2415
```

There is **no level term in the HP formula at all**. So a training routine that does `*set hp_max + 6` appears to work, and then the next time any stat recomputes — new armor, a gear change, a buff applied, `recalculate_buff_stats` — the bump is gone, because `hp_max` was rebuilt from `hit_die_max + con_mod` and never consulted the level.

**The fix: a separate additive term.**

```
*create level_up_hp_bonus 0
*comment inside update_dnd_stats, replacing the two lines at :2411 and :2415:
*set hp_max ((hit_die_max + con_mod) + level_up_hp_bonus)
```

Note the pairwise parentheses — `a + b + c` throws `expected CLOSE_PARENTHESIS` in ChoiceScript (`GAMEPLAY_MECHANICS_RULES.md` §1).

Training then sets `level_up_hp_bonus` by the class's average hit die, RAW-style (half the die, rounded down, +1 per level after the first):

| Class | Hit die | `hit_die_max` | HP per level-up |
|---|---|---|---|
| Barbarian | 1d12 | 12 | +7 |
| Fighter, Ranger | 1d10 | 10 | +6 |
| Rogue, Bard, Warlock | 1d8 | 8 | +5 |
| Wizard | 1d6 | 6 | +4 |

Because `level_up_hp_bonus` is a persistent flag rather than a mutation of `hp_max`, the existing recompute stays correct on every refresh and needs no lock of its own. Set `hp_current` up by the same amount inside the training guard so the character is not silently weaker after leveling.

---

## 7. Known issues found while writing this plan

Recorded so they are not rediscovered. None are caused by the training system, and all are independent of it.

| # | Issue | Location |
|---|---|---|
| 1 | The doc says spell slots are "not currently decremented or checked anywhere" — **stale**. `resolve_magic_missile` and `resolve_cast_agathys` both spend a slot, and call sites gate on `> 0`. | `MAGIC_AND_ABILITIES_REFERENCE.md:10` vs `startup.txt:2968`, `:3010`, `combat.txt:769` |
| 2 | The doc says Tiefling's fire resistance is "not wired in" — **stale**. Both Tiefling paths set `player_resist_type_1 "fire"`, and the resist engine consumes it. Dwarf poison resistance is live too. | `MAGIC_AND_ABILITIES_REFERENCE.md:25` vs `startup.txt:1703`, `:1893`, `:2065` |
| 3 | The stats sheet says "Short Rest remaining" for Second Wind and "Long Rest remaining" for Rage, but both restore on the same long-rest path. | `choicescript_stats.txt:1020`, `:1026` |
| 4 | `hp_max` has no level term, so any level-up HP bump is wiped by the next recompute. | `startup.txt:2411`, `:2415` |

---

## 8. Verification

Per `GAMEPLAY_MECHANICS_RULES.md` §9, in this order:

1. **`quicktest`** — must pass with no uncovered lines in every touched scene.
2. **`node tools/scripted_play.js`** — a script that completes a quest to earn a point, trains at the home, and confirms the exact delta on `character_level`, `prof_bonus`, `level_points` and `level_up_hp_bonus`. Force the dice (`rand`) so it is deterministic.
3. **Refresh replay** — same script with `refresh: true`, confirming **zero** variable drift. This is the real test: it proves the training guard and the quest-award lock hold. Then run with `sabotage` to prove the check can actually fail.
4. **Rest paths** — a short rest at the rented room must now restore uses, which it does not today (§2.3). Verify all six migrated sites.
5. **HP persistence** — level up, then change a piece of gear to force `update_dnd_stats`, and confirm `hp_max` keeps the level-up bonus. This is the §6 trap and no other test will catch it.
6. **`node tools/render_hub.js`** — the new home and Carrion training options render in every weather × time × day combination.
7. **`node tools/lint_thin_places.js only=<hub>`** — the two training hubs are new player-facing entry points and need prose depth (35 words minimum on a re-entry line, 100 on a hub intro).
8. **`lint_all.js`** and `node tools/lint_vocab_overuse.js` — new prose, new restricted-word exposure.

---

## 9. Open questions

Answers change the plan, so they are listed rather than guessed.

1. **Points per level.** "One point per quest" read literally means one quest = one level, which is very fast for a game with a hub-and-quest structure. The plan currently assumes a rising threshold (`level_points_next` 3, 4, 5 — §3.2). Confirm, or set the real number. **Everything else in the plan is independent of this value.**
2. **Bardic Inspiration on short rest.** RAW is long-rest only; §0.6 and §5.1 make it short rest deliberately, because it gives bards a per-adventure resource and makes the short-rest rule matter for a class with no spell slots to restore. Confirm this is the intent, since it is a stated departure from 5e.
3. **Is Varren's camp a third training site?** `camp_night.txt` has the slot economy and a drill-adjacent Varren option already (§1.3), but it is early-game only. If yes, add a third site row to §4.1; if no, note that the early game then has no training access at all, which is worth knowing.
4. **Does the Carrion compound charge coin, or gate on standing?** §4.2 assumes free. A quartermaster fee, or a regard threshold, would make the compound meaningfully different from the home rather than just slower.
5. **Is a level-2 ASI in scope?** RAW grants an Ability Score Increase at 4, not 2, so §4.3 correctly omits it. But if training should feel meatier at the first level-up, an early ASI is a reasonable house rule — it would mean touching the ability-score derivation in `update_dnd_stats`.
6. **Should training be able to fail?** §4.2 currently gates on `level_points > 0` with no roll, so training cannot fail. If it should be a check (a sparring spar, a casting that misfires), that is a new failure branch and a loss-state prose pass, and it interacts with the hunger/fatigue clocks.

| 5 | No `spell_save_dc` or `spell_attack_bonus` anywhere; all DCs hardcoded 10/12. | codebase-wide |
| 6 | Restoration is duplicated at six sites, already drifted out of sync (one restores Warlock slots, five don't). | §2.1 table |
| 7 | `character_level` is created at 1 and never incremented; `prof_bonus` is hardcoded at 2 and never changes. | `startup.txt:227`, `:228` |
