# Level 2 Groundwork — Audit and Plan

**Status (2026-09-26): audit only. Nothing here is implemented.** Level numbers below are 5e (PHB/SRD) unless marked "game". Line numbers are as of this date and will drift.

The short version: the game is a clean level 1. `character_level` exists but is only read by Second Wind; HP and class definitions are hard-coded level-1 numbers, several of them copied into many scenes (class-resource maximums and the long rest were fixed on 2026-09-26: see section 2, items 1 and 3). Level 2 itself is a small amount of new content per class. The work is in the plumbing underneath it, and most of the plumbing is worth doing whether or not level 2 ships.

---

## 0. The earlier plan

`quest/LEVEL_2_ABILITIES_PLAN.md` (commit 2ab62e6; its deletion is staged in the working tree as of this audit) recorded decisions from an earlier discussion and a tiered feature list. I read it against the current code and the 5e rules. This document keeps its decisions (section 4a: please confirm the deletion does not withdraw them), keeps the ideas that were right (section 7, "worth keeping"), and lists where it did not match the code or 5e (section 7, "did not match"). If you want the original back: `git show 2ab62e6:quest/LEVEL_2_ABILITIES_PLAN.md`.

---

## 1. What the game does today

| Area | Today | Where |
|---|---|---|
| Level | `character_level` = 1, never changes. Read by Second Wind (`1d10 + level`) and the dossier text only. | startup.txt:227, 3370 |
| Proficiency | `prof_bonus` = 2, static. Used for spell save DC / spell attack and Rogue Expertise (`prof_bonus * 2`). **It IS added to weapon and attack-cantrip rolls (`check_add_prof_bonus`) and to skill checks for a proficient skill (`roll_skill_check` reads the `skill_<id>` flags, which `character_stats.txt` sets from class, race, origin and squad).** *(This row said it was added to nothing; that was stale, corrected 2026-10-02.)* | startup.txt:229, 2698-2714; choicescript_stats.txt:966 |
| HP | `hp_max = hit_die_max + con_mod`, recomputed on every `update_dnd_stats` (current HP moves by the delta, so CON buffs already work). Level 1 max-die formula only. | startup.txt:2411-2418 |
| Class data | Set twice: once per class in `dawn_trial.txt` (7 classes) and once per dev preset in `startup.txt` (8 presets). Each sets `hit_die`, `hit_die_max`, resource counts, feature text. | dawn_trial.txt:40-374; startup.txt:1736-2152 |
| Spell slots | `wizard_/bard_/warlock_spell_slots` hold the **remaining** count only. **Done (2026-09-26):** each has a `_max` variable, written by `refresh_class_resource_maxs` (called from `update_dnd_stats`). | startup.txt `refresh_class_resource_maxs` |
| Class resource refill | **Done (2026-09-26):** one routine, `restore_class_resources`, called from `calendar.txt` `resolve_sleep` (so every sleeping place gets it) and directly by the two prologue rests. The copied blocks are gone. The initial values are still set in the `*create` block and the dev presets. | startup.txt `restore_class_resources` |
| Short rest | **Done (2026-09-26):** the dossier's Rest menu (Show Stats → Rest, and a Rest card pinned in the Inventory) takes one hour and restores Second Wind and the Pact Magic slot (`do_short_rest`). The Middle Ward garret's one-hour rest (`mw_room_short_rest`) calls it too. Rage, Bard and Wizard slots come back only on sleep. | choicescript_stats.txt `codex_rest`; startup.txt `do_short_rest`; port_valen_middle_ward.txt:881 |
| Slot spending | Class checks and `- 1` are written out at each cast site. | startup.txt:2947-3103; port_valen.txt:2951-2967; port_valen_dredge_end.txt:868, 1030-1060, 1209-1212 |
| Action economy | One action per round. There is no bonus-action tracking. Second Wind and Rage end the round (`*goto fight_enemy_turn`); Hex and Healing Word are free (`*goto fight_round_hub`) and can be repeated as long as they can be paid for. | combat.txt:898-1042 |
| Advantage | `advantage` / `disadvantage` on the player roll; `combat_enemy_advantage` / `_disadvantage` on the enemy roll; `roll_had_advantage` gates Sneak Attack. All auto-reset. | startup.txt:917, 2915-2936 |
| Sneak Attack | Rolls a hard-coded d6; `rogue_sneak_attack_die` is stored but never read by the roll. | startup.txt:2894-2896 |
| Leveling | No XP, no milestone, no level-up scene. Quests reward coin, regard and items. | quest/QUESTS.md |
| Enemies | Library types and fights are tuned for a level-1 player. `combat_enemy_hp/ac/atk_override` now lets one fight be tougher or weaker without a new type. | combat.txt |

### Features described in the dossier that do nothing in code
Bardic Inspiration, Arcane Recovery, Ritual Casting (choicescript_stats.txt:1044-1049); Ranger Favored Enemy and Natural Explorer (chosen, never read); Barbarian Unarmored Defense (unreachable by design, per the reference). Level 2 builds on some of these (see Wizard and Ranger), so decide whether each is implemented, hidden or left as flavor.

---

## 2. Shared plumbing (do first; none of it is visible to a player)

1. **One rest routine.** **Done (2026-09-26):** `restore_class_resources` (long rest) is called from `resolve_sleep`, so no sleeping place lists pools and a future sleep gets it free; the short rest is `short_rest_preview` / `do_short_rest` / `short_rest_banner`. Adding a pool touches `startup.txt` and the displays only. Fixes the Middle Ward bug (section 6).
2. **HP from level.** **House rule decided (2026-09-26):** every level gives the maximum of the hit die (solo campaign), so `hp_max = character_level * (hit_die_max + con_mod)`, kept inside `update_dnd_stats`. Level 1 is already the maximum, so nothing changes until level 2. Because it is derived, it needs no replay lock and CON changes stay retroactive, as in 5e. `update_dnd_stats` already moves current HP by the change in max, so a level-up raises current HP by the same amount (5e does this too). **Done (2026-09-26):** `update_dnd_stats` sets `hp_max` to `character_level * (hit_die_max + con_mod)`; the level-up heal is kept (decided). Verified for all 8 presets at levels 1-20 (499 checks) and by a sabotage run.
3. **Derived maxima.** **Done (2026-09-26):** `fighter_second_wind_max`, `barbarian_rage_max`, `warlock_spell_slots_max`, `wizard_spell_slots_max`, `bard_spell_slots_max`, set by one ladder label; the dossier, the side panel and the Rest card show "x / max". Second Wind follows the 2024 rules (2 uses at level 1, 3 at level 4, 4 at level 10; a short rest returns one). Second-level slots are not built (no second-level spells exist); each would be one more pool in the same places.
4. **Derived `prof_bonus`.** 5e is +2 through level 4, +3 at 5-8, +4 at 9-12. The engine has no floor, and the obvious formulas fail (checked in the real engine): `2 + ((character_level - 1) / 4)` gives 2.25 at level 2, and wrapping it in `round(...)` gives 3 at levels 3, 4 and 8. Use `2 + (((character_level - 1) - ((character_level - 1) modulo 4)) / 4)`, which is exact, or an `*if` ladder. ChoiceScript also refuses mixed operators without parentheses. **Done (2026-09-26):** `update_dnd_stats` sets `prof_bonus` this way; it changes only at levels 5, 9, 13 and 17. It does not change until level 5, so this is groundwork only. *Size: trivial.*
5. **One class definition.** Chargen and the dev presets both set the same fields. A shared `apply_class_level_1` (or presets that call the chargen setter) means a new level-2 preset, and the level-up scene, have one place to read. *Size: medium; optional but it removes the biggest copy-paste risk.*
6. **A bonus-action rule.** **Done (2026-09-26):** one action and one bonus action per round, as refilled numbers (`combat_player_actions_max` / `combat_player_bonus_max`), with Second Wind, Rage, Hex and Healing Word as bonus actions. Cunning Action only has to be a bonus-action option.
7. **An extra-action hook.** **Done (2026-09-26):** `combat_grant_action` / `combat_grant_bonus` for a one-off (Action Surge) and `combat_player_actions_max` for an ongoing effect (Haste). Nothing uses them yet.
8. **The level-up gate and the training routine (decided 2026-09-26, see 4a).** Level 2 needs 30 training sessions and 10 finished quests. Both are counts, so nothing is spent and there are no level points. **Built (2026-09-26):** `refresh_quests_finished` derives the pool from success flags (section 8 below); `refresh_level_up_progress` holds the thresholds (30 sessions and 10 quests at level 1, tuned in that one label; 0 means no next level is defined) and sets `level_up_ready`, and `update_hub_condition` (which every time advance and the district hubs already call) keeps it current; `training_preview` and `do_training_session` are the once-per-day session tracker (guarded by the clock at the end of the session); the dossier's Level line shows "Training x/30 sessions, Quests y/10". **The level-up itself is built:** the dossier's main menu offers "Level Up" when `level_up_ready`, `codex_levelup` (confirm) and `codex_levelup_do` (apply) run it, and a gold Level Up button at the end of the top bar (`levelup.js`, `levelup.css`) opens the same page. `do_level_up` sets `character_level` to an exact target (`level_up_from + 1`), calls `update_dnd_stats` (max HP, current HP by the same amount, proficiency, pool maxima), and raises each class pool by the change in its maximum. **The compound training place is built as a pilot (2026-09-26):** the compound hub offers "Cross to the drill square" (independent operatives, while a level is on offer), which opens `pv_poi_carrion` in `port_valen.txt` (layered intro, then drill / ask your squad leader / head back). Drill is listed but reworded when shut (done for the day, the hour, the weather, or nothing more to learn); a session is 4 hours through `advance_time` with outdoor exposure and the death check, then `do_training_session`. The session prose rotates through six vignettes by `training_sessions` (never the clock or `*rand`, so a replay reads the same), with a first-session and a last-session beat. **Written (2026-09-27):** all three squads have their own leader, six vignettes, a presence line, a first/last-session beat and talk lines: Vanguard (Sergeant Varren, with a fighter/barbarian tail split), Scouts (Kestrel: stealth, archery, tracking, stillness, reflex, blade-work), Cadre (Ysolde: candle steadiness, breath discipline under distraction, a paired concentration test, precise sigil copying, repetition/endurance, discretion). `squad = "none"` (never reached by a real character) keeps the original file-corporal set as a fallback. No per-class tail split for Scouts or Cadre yet (only Vanguard's fighter/barbarian split exists); open follow-up if wanted. **Still to build:** the class features for each new level, which plug into `do_level_up` after `update_dnd_stats` as one hook each. *Size: the two squads are prose; the rest is small.*
9. **Level-2 test builds.** Dev presets at level 2 for each class (so `scripted_play` and `randomtest` can reach them), plus a scripted play of the level-up scene per class. Follow the three-point sync rule (create, dossier, dev menu). *Size: medium.*
10. **Naming.** The earlier plan called the two rest labels `do_short_rest` and `do_long_rest`, in `startup.txt` beside `second_wind` and `activate_rage`; use those names.
11. **Docs.** MAGIC_AND_ABILITIES_REFERENCE.md is out of date (it says slots are never decremented; combat and several scenes now check and spend them). Update it as part of this.

Every mutation must follow the Refresh/Replay rule in GAMEPLAY_MECHANICS_RULES.md §1: derive the value, or guard it with the `_locked` / `locked_..._page_id` pair. Level itself is the one stored counter; everything else here is a function of class and level.

---

## 3. Per class

Level 2 hit points for all seven classes: `+ hit_die_max + con_mod` (the maximum of the die, house rule). Proficiency stays +2 through level 4. No race gains anything at level 2 (Tiefling's Hellish Rebuke is level 3).

### Fighter
- **5e:** Action Surge (one extra action, once per short rest).
- **Have:** Second Wind (`fighter_second_wind_uses`), Fighting Style, four style-specific hooks.
- **Need:** `action_surge_uses` + refill, the extra-action hook (plumbing 7), a hub option, dossier line.
- **Hooks that exist:** Healing Word and Hex already return to the hub without an enemy turn.

### Barbarian
- **5e:** Reckless Attack, Danger Sense. Rage uses stay 2 and damage stays +2 until level 3 and 9.
- **Have:** Rage (uses, damage bonus, resistance in `resolve_enemy_attack`).
- **Need:** a Reckless Attack option (advantage on the STR attack this round, `combat_enemy_advantage` on the next enemy attack, then cleared); Danger Sense as a tag on the rare DEX saves, or flavor only.
- **Hooks that exist:** `advantage` and `combat_enemy_advantage` are both live.

### Rogue
- **5e:** Cunning Action (bonus Dash, Disengage or Hide). **Built (2026-10-01): `combat_cunning` in combat.txt is gated on `character_level >= 2`, so the level-up only has to raise the level.**
- **Have:** Sneak Attack (needs advantage), Expertise, a Disengage option in the hub.
- **Need:** a bonus-action rule (plumbing 6); a "Hide" option that gives advantage on the next attack, which is what turns Sneak Attack on; Dash is flavor in combat. Also make the sneak die read `rogue_sneak_attack_die` (it is fixed at d6 today, which is correct for levels 1-2 and wrong from 3).
- **Watch:** without proficiency in attack rolls, Hide-for-advantage is a very large swing. Playtest before shipping.

### Ranger (most new work)
- **5e:** Spellcasting (WIS; 2 spells known, 2 first-level slots) and a Fighting Style.
- **Have:** Favored Enemy and Natural Explorer as text only. No spell variables, no chargen picks, no hub options, no spell DC in the dossier (`codex_abilities` covers only wizard, warlock, bard), no refill.
- **Need:** `ranger_spell(_2)`, `ranger_spell_slots`, a spell pool, WIS as casting stat, the refill and dossier lines, and a choice of Fighting Style.
- **Hooks that exist (reuse, don't invent):** Hunter's Mark can reuse the Hex engine (`hex_active`, +1d6); Cure Wounds can reuse Healing Word; Goodberry fits the food and hunger system. The Fighter's Defense and Dueling styles already exist; Archery (+2 to ranged attacks) would be new and, with no proficiency in rolls, is a large bonus.

### Bard
- **5e:** Jack of All Trades (half proficiency on unproficient checks), Song of Rest (extra healing on a short rest), 3 slots, one more spell known.
- **Have:** 2 slots, 2 cantrips, 2 spells known (game; 5e is 4 known at level 1), Healing Word, Dissonant Whispers, Charm Person, Disguise Self.
- **Need:** slots 2 → 3 (plumbing 3), one more spell pick (remaining pool: Charm Person / Healing Word / Disguise Self / Dissonant Whispers / Comprehend Languages, minus what was taken and what Hexblood hides).
- **Two features have no natural home yet:** Jack of All Trades has nothing to be half of because checks carry no proficiency; Song of Rest needs a short rest that heals, and healing is deliberately slow here. A fitting version: +1 HP to nightly recovery in `resolve_sleep` for a Bard, which respects the slow-healing rule.

### Warlock
- **5e:** Eldritch Invocations (2), 2 slots, one more spell known.
- **Have:** 1 slot on a short rest (game and 5e), Eldritch Blast, Hex, Armor of Agathys, False Life, patron as text.
- **Need:** an invocation pick of two from a pool of about three to five, slots 1 → 2, one more spell pick.
- **Hooks that exist:** Agonizing Blast is one line at the Eldritch Blast damage (`+ cha_mod`, currently `combat_player_dmg_bonus 0`); Armor of Shadows reuses the Mage Armor line in `update_dnd_stats`; Fiendish Vigor reuses the False Life / `temp_hp` engine; Mask of Many Faces removes the slot cost of the Disguise Self option in Dredge-End; Devil's Sight would need night hooks (only `camp_night.txt` reads darkvision today).

### Wizard
- **5e:** Arcane Tradition (a school), 3 slots, two more spells in the spellbook.
- **Have:** 2 slots, 3 cantrips, one spell (game; 5e is six in the book), Magic Missile, Shield, Mage Armor, False Life; Arcane Recovery and Ritual Casting are text only.
- **Need:** slots 2 → 3, a school pick, one or two more spell picks, and a decision on Arcane Recovery (at level 2 it recovers one slot level, which is the reason the dossier already names it).
- **Hooks that exist:** Abjuration's Arcane Ward can reuse `temp_hp` (twice level + INT); Necromancy's Grim Harvest and Divination's Portent would each need one small hook (a heal on a spell kill; a stored pair of rolls, close to Halfling Lucky). The Battle-Abjurer preset already implies Abjuration.

---

## 4. Decisions

### 4a. Carried over from the earlier plan (treated as settled unless you say otherwise)

1. **The level-2 gate (decided 2026-09-26).** 30 training sessions (one per day, about 4 hours each, and training cannot fail) and 10 finished quests. Both are counts; there are no level points. A missed day does not reset the session count (the days do not have to be consecutive). A finished quest is a successful completion only: quest failures do not count. Every Port Valen story quest counts one (the radiant day-jobs, Crane Three and the scrap round, do not: that would be a cheat), and so do the Alderford quests (Maura, Torvald, Talia, Janna, the mire rats, the deacon, and Factor Morzan's vellum turn-in). Rennick's curing sheds, the Cadre river chain and the Black Sinks assault are left out. The 10 is a variable to tune in playtest, and the same cumulative pool is used for level 3 (with a higher threshold).
2. **Where (decided).** Training is at the Carrion compound (Varren's camp) and nowhere else for level 2: the Middle Ward room is not a training site. It is free, and it only ever gets you to level 2. Later levels use other teachers and places, some paid, some gated behind quests.
3. **Flavor (decided).** The training prose depends on your class and squad: your squad leader trains you where that fits, otherwise it is regular training. Squads are Vanguard, Scouts, Cadre, and independent recruits.
4. **The Level Up button (decided).** When both counts are met, a Level Up choice appears in the Show Stats (dossier) hub menu, and a fancy Level Up button appears at the end of the top bar (Show Stats, Lorebook, Inventory, Save / Load, Level Up) as a quality-of-life shortcut. If a button that appears and disappears with those conditions proves a problem, the dossier entry and the progress line are the fallback. The dossier's Level line shows the progress (for example "Training 12/30, Quests 6/10"), so a player can see why the button is missing.
5. House rule: a short rest restores Action Surge, Bardic Inspiration (5e says long rest) and the other short-rest resources.
6. The rest refactor comes first.

Still open: whether an early ability score increase is wanted at level 4 (5e gives it there), and the exact prose for each squad's training.

### 4b. Still open

0. **Hit points per level: decided (2026-09-26).** The maximum of the die every level (house rule, solo campaign).
0. **Second Wind rule: decided (2026-09-26).** The 2024 rules: 2 uses, 3 from level 4, 4 from level 10, a short rest returns one use and a long rest all of them.
1. **Bonus action: decided (2026-09-26).** One per round, refilled each round, as numbers so an effect can raise them. Second Wind and Rage moved onto it: they no longer end the round.
2. **5e totals or the game's trimmed numbers?** Level 1 already trims spells known (Bard 2 vs 4, Warlock 1 vs 2, Wizard 1 vs a six-spell book). Continue with +1 per class (+2 for the Wizard's book), or jump to 5e's totals? *Recommendation: +1 each, +1 for the Wizard, so picks stay meaningful.*
3. **Proficiency.** Attacks and checks are ability modifier only today. The earlier plan raised `prof_bonus` to 3 at level 2; 5e keeps +2 through level 4. With no proficiency in attack rolls, a bump changes only Rogue Expertise and the dossier's spell DC. Do you want that house rule, a real proficiency system, or neither until level 5? Jack of All Trades, Beguiling Influence and Archery all depend on this. *Recommendation: neither for level 2; give the affected features game-shaped versions.*
4. **The option pools.** Ranger spells (3-5) and style, Wizard schools (3), Warlock invocations (3-5). The narrative rule is three options per choice, and every option should do something mechanical, so unimplemented spells (Comprehend Languages, Unseen Servant, Identify, Feather Fall) either get a use or stay off the level-2 list.
5. **The Ranger at level 2. Decided (2026-09-26): option (a).** The 2014 rules with a tiny spell list built on engines that already exist (Hunter's Mark on the Hex engine, Cure Wounds on Healing Word, Goodberry on the food system), and a Fighting Style. The 2014 Ranger is a half-caster from level 2 (Spellcasting: 2 spells known, 2 first-level slots, no cantrips). **To do (after the current chunks):** draft the list of Ranger spells that can be done cheaply, then build it as one more pool in the same places as the others.
6. **Enemies at level 2.** Retune the library types, or leave them and use the hp/ac/atk overrides on the fights that need to be harder. *Recommendation: overrides, per fight, after a balance pass.*
7. **Where does level 2 first appear? Decided in effect (2026-09-26).** The gate is 30 training days and 10 finished quests, so level 2 arrives about a month into Port Valen at the earliest, and everything before that is level-1 content. The Alderford quests are banked before Port Valen starts (up to seven of the ten), so the 30 training days are the real gate. Second-level spells come at level 3, which is well off; more worldbuilding comes first.

---

## 5. Suggested order

1. Plumbing 1-4 (rest routine, HP from level, derived maxima, derived proficiency). No player-visible change; verify with quicktest, randomtest and a scripted sleep for each class.
2. Plumbing 5 and 9 (one class definition, level-2 presets) so every later step is testable.
3. Decision 4b.1 answered (bonus action), then plumbing 6-8 (bonus action rule, extra action, level points and the training routine).
4. Classes, cheapest first: Barbarian, Rogue, Fighter, Warlock, Bard, Wizard, Ranger (the Ranger last because it needs a spell list; draft the cheap list of Ranger spells first, see 4b.5).
5. Balance pass on the encounters players reach at level 2, then the dossier and reference docs.

## 6. Existing problems found while auditing (worth fixing regardless)

- **Sleeping in the Middle Ward lodgings never restores wizard or bard spell slots.** Both refill blocks (port_valen_middle_ward.txt:859-863 and 1191-1195) list Second Wind, Rage and warlock slots only. A Wizard or Bard who sleeps there starts the next day with whatever they had left. **Fixed (2026-09-26):** both sleeps now go through `resolve_sleep` and `restore_class_resources`.
- **Fixed (2026-09-26): the two Middle Ward sleeps (the rented room and the wagoners' rest) skipped Wizard and Bard slots, Hexblood's Hex and clearing temporary HP.** They now match the compound barracks. The prologue camps are scripted and outside the sleep system. The class refill is still copied into three Port Valen places (the barracks and the two Middle Ward sleeps), plus the prologue.
- **`rogue_sneak_attack_die` is stored but never read**; the roll is a fixed d6.
- **MAGIC_AND_ABILITIES_REFERENCE.md is stale** on slots and on several "flavor-only" spells that now have combat effects.
- **Three dossier features have no code** (Bardic Inspiration, Arcane Recovery, Ritual Casting), and two Ranger features are chosen but unused.

## 7. The earlier plan, reconciled

**Worth keeping** (all folded in above):
- The decisions in 4a, and the rest-refactor-first order.
- `do_short_rest` / `do_long_rest`, and moving the class-resource half of a long rest out of every scene while `resolve_sleep` keeps the HP and sleep half.
- Deriving a spell save DC and spell attack bonus in `update_dnd_stats`. Today they are computed only inside the dossier, and the two save-style spells (Vicious Mockery, Dissonant Whispers) use a fixed DC 12. It costs nothing at level 2 (proficiency does not move) and gives casters scaling later.
- Counting completed-quest flags rather than guarding an award.
- Its verification list: `scripted_play` with `refresh: true` and then `sabotage` to prove the check can fail; a level-up followed by a gear change to prove the HP bonus survives `update_dnd_stats`; `render_hub` and `lint_thin_places` for the new hubs; `lint_all` and the vocabulary lint for the new prose.

**Did not match the code or 5e:**
- **`prof_bonus` +1 at level 2.** 5e is +2 until level 5 (section 4b.3).
- **Ranger.** It listed Favored Enemy and Natural Explorer as level-2 features; both are level 1, and neither does anything in code yet. Its level-2 gain is spellcasting and a fighting style, which section 3 covers, and its Tier 3 gave the Ranger cantrips and three slots (5e: none, and two).
- **A bonus-action slot in the round hub.** There is none.
- **Missing level-2 features.** Reckless Attack, Jack of All Trades, Song of Rest, Eldritch Invocations, Arcane Tradition, the Ranger's Fighting Style, and every slot and spells-known increase are not in its list. Section 3 has them.
- **HP.** It stored a `level_up_hp_bonus` set by training. Deriving the whole term from `character_level` gives the same numbers, needs no stored bonus and no lock, and keeps CON changes retroactive (plumbing 2).
- **Bardic Inspiration** is built (2026-10-02, see `resolve_bardic_inspiration`).
- **Its rest table** lists only Second Wind and Rage for most sites; the code also refills class slots at three of them, and misses wizard and bard slots only at the two Middle Ward sites (section 6). Its line numbers have drifted.

---

## 8. Quest pool audit (2026-09-26)

What the level-up pool counts, and which flag says a quest was successfully completed. The counter is `refresh_quests_finished` in `startup.txt`: derived, so it needs no lock, and a new quest is one more line. Only a successful completion counts; failed endings do not, and radiant jobs never do.

| Quest | Success marker | Not counted |
|---|---|---|
| Silt-Gate Contraband | stage `resolved` and `silt_gate_resolution` not `"failed"` | resolution `"failed"` (the stage is still `resolved`) |
| The Rotten Rib | stage `resolved` and `rotten_rib_resolution` not `"failed"` | resolution `"failed"` (the stage is still `resolved`) |
| The Muffled Bell | stage `resolved` (reported, pocketed, bloodied) | stage `failed` (wrecked). "Bloodied" (fled or rescued) counts because the code marks it resolved |
| The Quiet Block | stage `resolved` | stage `failed` |
| The Stolen Shroud | stage `resolved` (returned, fee, pocketed) | stage `failed` (cold, escaped) |
| Janna's mooring pins | `janna_pins_forged` | the failed ending |
| Maura's cellar | `maura_cellar_cleared` | rescue and flee (they can be retried) |
| The mire rats (granary) | `granary_rats_resolved` | flee and rescue |
| The deacon's grain | `delivered_chapel_grain` | |
| Torvald's wheel | `torvald_wheel_saved` (added 2026-09-26) | the failed jam |
| Talia's casks | `talia_casks_saved` (added 2026-09-26) | the failed ending |
| Factor Morzan's vellum | `morzan_vellum_delivered` (added 2026-09-26, set only in `ch_bounty_redemption`) | handing the vellum to Ysolde's chart room instead (the two routes exclude each other) |

That is 12 quests. Every flag is a fixed-value set that is never cleared (checked across all scenes), so the count is replay-safe. `turned_in_customs_vellum` is not the Morzan marker: it is also set by Ysolde's chart room, and `met_morzan` is set on a plain visit. Item flags (the hearthstone, the oiled cloak) are not markers either: a reward can be held, sold or lost. Older developer saves are not backfilled (the user does not care about them).

Deliberately not counted: Crane Three and Hask's Scrap Round (radiant day-jobs), Rennick's curing sheds (which lead into Talia's cask rescue), the Cadre river chain, and the Black Sinks gatehouse assault. `carrion_contract_ratcatcher_resolved` duplicates `granary_rats_resolved`; only one is counted. Tested through the real engine (55 checks, plus a sabotage run for the training guard).
