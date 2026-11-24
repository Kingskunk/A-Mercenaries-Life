# Combat Engine Plan

This file is the starting point for any session that works on the fight system. It says what exists, what engine work is left, which decisions are waiting on the designer, and how to check a change before calling it done. It is a to-do list, not a changelog: a finished item is cut, and a rule it leaves behind goes into `GAMEPLAY_MECHANICS_RULES.md` (sections 5 and 6), which holds the rules of the system. How a piece of code works belongs in its `*comment`.

---

## 1. Where things stand

The 2026-11 refactor had one aim: adding a spell, an enemy, an enemy caster or a test fight should be a data entry and a short script, with checks that catch a mistake. What exists, one line each (the rules are in `GAMEPLAY_MECHANICS_RULES.md`):

| Area | Where |
| --- | --- |
| Shared conditions: Blinded, Slowed, Frightened, Restrained, Paralyzed, each with a source | `condition_apply` / `_has` / `_end` / `_end_by_source` / `_tick` (`combat_dice.txt`) |
| Concentration | `concentration_begin` / `_end` / `_reconcile` / `_damage_check` / `_end_incapacitated` |
| Spell numbers from data, every spell | `tools/spell_book.json` -> `node tools/gen_spells.js` -> `spell_facts_load` |
| Shared rolls | `roll_spell_damage`, `resolve_spell_hit`, `resolve_spell_heal`, `roll_spell_temp_hp`, `roll_spell_dice` |
| Assigned enemy spells | `tools/encounter_catalog.json`, `*_cast_*_override` |
| One reason per unavailable option | `combat_why_<id>`, `combat_eval_spell_why`, `battlehud.js` |
| Sight rule | `combat_player_can_see` |
| Replay guard: no spell writes a replay lock inside a fight | `pageReplayGuard` (`web/scene.js`), `combat_chain_begin` / `_end` |
| Terrain, including spell patches (Web, an enemy's Web, Grease) | `combat_terrain1..4`, `combat_movement.txt`, `combat_ai.txt` |
| Assigned abilities (special moves, the Net, Multiattack, riders, traits) | `tools/ability_book.json` -> `node tools/gen_abilities.js`, `combat_abilities.txt` |
| Prone, Restrained, Paralyzed, Frightened and Bane on every side | `prone_apply`, `condition_*`, `resolve_save` |
| Enemy casting by spell shape, at the player and at allies | `combat_enemy_player_action`, `fight_enemy_ally_attack`, `spell_worth_casting` (`combat_ai.txt`) |
| Enemy buffs, heals and reactions | `enemy_precast_buffs`, `enemy_try_heal`, `enemy_try_blade_ward`, `enemy_shield_check` |
| Ally casters | `combat_ally_cast_spell_*_override`, `fight_ally_cast`, `resolve_ally_cast_damage` |
| Morale by side HP share (the player counts with the allies) | `combat_morale_check`, `tools/test_morale.js` |
| Late enemies: an `arrives` round and an `enters_at` range tier | `combat_reinforcements_arrive`, `tools/encounter_catalog.json` |
| Subclasses, one per class at level 3: Abjurer, Fiend, Battle Master, Wild Heart, Valor, Gloom Stalker, Assassin (and the rogue's Steady Aim) | `refresh_features` (`character_progression.txt`); the rules are under "Subclasses" in `GAMEPLAY_MECHANICS_RULES.md` |
| Dev Hub test fights | `dev_hub.txt`, `fight_dev_*` (combat.txt) |
| Test tooling: the whole script folder in about six to eight minutes, or only the scripts a change can reach | `tools/play_all.js`, `tools/suite_report.js`, `tools/scripted_play.js` |

What is cheap now: a spell that fits the shared rolls (data entry, generator run, short cast label, one seeded refresh script); an enemy type, a template fight, a hand-written fight with overrides; an enemy caster, when the spell already has its non-player effect routine.

---

## 2. How to work on this system

These habits each exist because something went wrong without them.

1. **Review the diff, not the report.** On 2026-11-15 a session reported a passing quicktest on a `combat.txt` that had lost its last 400 lines. Run `git diff --numstat` against the commit before the work and account for every file with deletions. Search changed files for the text `truncated for diff preview`.
2. **Last step, after the final file write:** quicktest on the fight scenes, then `git status --short` and `git diff --numstat`. `combat.txt` must still end with the `fight_orren_guards` block. Count `*label` lines before and after any write to `combat.txt` or `combat_spells.txt`.
3. **Never write tool output, a preview or a shortened copy of a file back to disk.**
4. **Any engine change is compared across the whole script folder, before and after.** The claim to aim for is "every transcript identical, or different only in line numbers", with each other difference listed and explained. "The tests pass" is a weaker claim.
5. **Use a git worktree for the old commit.** No `git stash`.
6. **Every new spell gets one play script with `"refresh": true`, `"refreshText": true` and a `"seed"`.** Without a seed the tool fixes the dice, so a re-roll on refresh cannot show. Also check the Sight rule (does it name "a creature you can see"?) and set `"concentration"` in the data if it has it.
7. **Read the new page as a player would** before reporting it done.
8. **Never build a variable name from a spell id, class or level with `{}`.** Quicktest forces the true side of every `*if`, so the name can resolve to something that does not exist. Use explicit branches; let a generator write them.
9. **`*temp` does not cross `*gosub_scene`.** A value another scene must read is a global, created in `startup_parts/` and in `mygame.js`.
10. **No `*comment` between an `*if` body and its `*elseif`.**
11. **Edit `startup_parts/`, never the built `startup.txt`.** Rebuild with `tools/build_startup.js`.
12. **A generator must not overwrite a hand edit.** Put the wording in the source data and regenerate.
13. **Banners name the state only.** No rules text or instructions on screen.
14. **A lock stays wherever a routine can be reached outside a fight.** The replay guard only runs while `combat_engaged` is true. False Life is the example: it can be cast from the stats screen.
15. **A disagreement between data and play is listed, not fixed.** The designer decides which side is right.
16. **`*create` takes no negative literal.** Use a sentinel (99 for "none", as `combat_enemyN_enters_at` does).

### The checks

Run from the repository root.

```
node tools/build_startup.js --check
node tools/gen_spell_book.js --check
node tools/gen_spells.js --check
node tools/gen_encounters.js --check
node tools/test_morale.js
node tools/test_encounters.js

node tools/suite_report.js --touches=combat*   only scripts that ran a combat file (about 650 of 1,900)
node tools/suite_report.js --changed           only scripts a scene file with uncommitted changes can reach
node tools/suite_report.js                     the whole folder, against the saved baseline
node tools/play_all.js combat/ <name parts>    a folder, or scripts whose path contains one of these
node tools/play_all.js --root=<worktree> --out=<old folder>     the same on the old commit

node quicktest.js mygame startup combat combat_spells combat_movement combat_dice combat_prose combat_ai dice_engine dev_hub equipment choicescript_stats dungeon character_stats
```

Every script in the folder passes, so the full suite exiting 0 is the whole check, and any failure belongs to the change being made. Use `--changed` or `--touches` while working on a piece, and the full suite at the end. Play scripts live in area folders (`combat/`, `character/`, `systems/`, `story/<region>/`); a new one goes in its start scene's folder, and bare file names stay unique.

### Rules block to paste at the top of a hand-off prompt

```
RULES FOR THIS SESSION
- Edit startup_parts/, never the built startup.txt; rebuild with tools/build_startup.js.
- Never write tool output, a preview or a shortened copy of a file back to disk. After every
  write to combat.txt or combat_spells.txt, count the *label lines and compare with before.
- Generated blocks are never hand-edited; a generator must not overwrite a hand edit.
- No git stash; use a worktree for comparisons. No commits. Ignore play_game.html.
- Never build a variable name from a spell id, class or level with {}. Use explicit branches.
- No *comment between an *if body and its *elseif. *temp does not cross *gosub_scene.
- A spell inside a fight writes no replay lock. Do not add any.
- A disagreement between data and play is listed for the user, never fixed by changing play.
- Your very last step, after every file write: quicktest on the fight scenes, then
  git status --short and git diff --numstat. Explain every file with deletions, and confirm
  combat.txt still ends with fight_orren_guards's block.
- Say plainly what you did not run.
```

---

## 3. Engine work still to do

In the order I would take it. Each item is one hand-off, sized to review in one sitting.

### 3.1 Gaps in what exists

None open. Add one here when a play-through finds it.

### 3.2 Subclass pieces left out or waiting

All seven subclasses are built (table in section 1). What each one left behind:

- **Weapon properties (next, the user, 2026-11-24).** Weapon proficiency and the first martial weapons are built (`GAMEPLAY_MECHANICS_RULES.md`, Weapons). Still to build: Light, Heavy, Versatile (a Longsword at 1d10 in two hands) and Thrown (the Handaxe), and weapons that roll more than one die (Greatsword 2d6, Maul 2d6: `weapon_die_sides` reads one die). Once Light exists, a Rogue's martial training covers Light weapons too (`weapon_prof_check` reads only Finesse today). Plain arrows and bolts stay uncounted (the user); only special arrows are tracked.
- **Umbral Sight's invisibility in darkness.** It needs a "this fight is in darkness" state (today `dg_dark` means only "you cannot see") and enemy senses (blindsight, truesight).
- **A disguise kit**, once a scene uses disguises: sold by the Gilt Needle tailor or a fence; the user has an icon.

### 3.3 Feats (level 4)

After subclasses, once a quest can take a character to level 4. Take one feat as the pilot and write down every hand edit it needs (War Caster's advantage in `concentration_damage_check` is one known place).

The subclasses' route, the likely list for a feat: `feature_*` flags set in `refresh_features` (`character_progression.txt`), declared in `startup_parts/07_class_path.txt` and `mygame.js`; the level-up page line (`level_up_features`); the Abilities page line (`choicescript_stats.txt`); a per-enemy flag in `startup_parts/31_combat_engine_state.txt` and `mygame.js`, cleared in the stale-slot loop and `fight_cleanup`; an on-kill hook in `fight_check_all_dead`; a granted spell set known in `refresh_known_spells`, mirrored in `equipment-panel.js` and listed by the spellbook panel (`INVOCATION_SPELLS` in `spellbook.js` and `index.html`, both copies); a hub button in `battlehud.js` (`HUB_ORDER`) with its icon in `tools/gen_action_icons.js`; a line printed from a shared check goes through the end-of-action queue (`concentration_pending_add`).

### 3.4 Optional: the remaining replay locks

Step 6a removed only the spell-layer locks. Still in place: dice, save, attack and last-hit locks; budget spend and grant locks; manoeuvre locks; the banner caches that exist only for replay. A new spell never writes these, so removing them makes nothing cheaper. Do it only as clean-up, one family at a time, and keep every lock that a scene outside a fight can reach (`roll_locked`, `false_life_cast_locked`, anything `choicescript_stats`, `equipment`, `dungeon` or `character_stats` calls).

### 3.5 Level 5 and up: 3rd-level slots and upcasting into them

Not needed until a character can reach level 5 (no quest goes past level 3 yet). Built ahead only where it saves coming back to a piece later.

- Spell slots of 3rd level and up. Wizard, bard and ranger have only the 1st- and 2nd-level pools (`spell_slots_1` / `_2`), and `refresh_slot_left` (`combat_spells.txt`) maps a Warlock's pact slots to `slot_left_1` / `_2` only for `pact_slot_level` 1 and 2, so a level 5 Warlock's 3rd-level pact slots would count as none and no leveled spell would be offered. Needs: the pools from 3rd level up, `slot_left_N` and the hub's slot reasons for them, `spend_spell_slot` / `spend_lowest_slot` for them, and the rest and level-up refills.
- A 3rd-level Scorching Ray (four rays) and Magic Missile need their own hub option. The ray and dart counts and the prose already follow the cast level.
- Hold Person: one extra humanoid per slot level above 2nd. In the data (`upcast.targets`), not built; it would use the shared targeting page (`fight_target_multi`).

---

## 4. Decisions waiting on the designer

None open. Add a row (the question, and the options with a recommendation) when one comes up.

---

## 5. Known small things

- A refresh on a targeting prompt page (Magic Missile darts, a healing target) forgets the clicks. Nothing is rolled on those pages, so the player clicks again.
- The opening page of a fight entered from another scene is not covered by the replay guard. A refresh resumes at the choice instead of re-running the page. The test tool skips those pages.
- Test-tool limit, not a game bug: `fight_library` throws "invalid return" when the player kills its enemy, so a script there must not end the fight.
