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
| Dev Hub test fights | `dev_hub.txt`, `fight_dev_*` (combat.txt) |
| Test tooling: the whole script folder in about seven minutes | `tools/play_all.js`, `tools/scripted_play.js` |

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

### The checks

Run from the repository root.

```
node tools/build_startup.js --check
node tools/gen_spell_book.js --check
node tools/gen_spells.js --check
node tools/gen_encounters.js --check

node tools/play_all.js <name parts>            only scripts whose file name contains one of these
node tools/play_all.js --out=<new folder>      the whole folder, transcripts saved
node tools/play_all.js --root=<worktree> --out=<old folder>     the same on the old commit

node quicktest.js mygame startup combat combat_spells combat_movement combat_dice combat_prose combat_ai dice_engine dev_hub equipment choicescript_stats dungeon character_stats
```

Every script in the folder passes, so `node tools/play_all.js` exiting 0 is the whole check, and any failure belongs to the change being made.

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

### 3.1 Before subclasses: what is left of 3.9a

The user wants as much of the D&D system working as possible before subclasses start (agreed 2026-11-19). Done (2026-11-20).

1. **A review of the fight AI**, after the condition rebalance (3.3), so it judges the final rules. Dev Hub fights are added only to test or review the AI (the user, 2026-11-19); no new story content just to test a fight. A great deal was added in a short time (enemy casting by shape, buffs, heals and reactions, ally casters, patches, abilities), each with its own worth-it rule. Play the Dev Hub fights and read the choices as a player would: where a side wastes its turn, picks a poor spell or target, stands where it should not, or ignores something it should use. List the findings first, then fix them one at a time. Review played 2026-11-20 (7 fights, seeds 1-3); fixed: an ally dropped to 0 HP with no line, casters with three leveled spells walked into melee (each enemy slot now has its own cantrip), an archer swapped between high ground and long range every turn. Not reproduced in 32 runs: the idle badly hurt guard against a kiting archer seen earlier.

### 3.2 Gaps in what exists

None open. Add one here when a play-through finds it.

### 3.3 Real conditions for the special moves

Done (2026-11-19). The rules are in `GAMEPLAY_MECHANICS_RULES.md`, "Special-move conditions".

### 3.4 Subclasses

Feats are separate (3.5): they come at level 4, and no quest goes past level 3 yet.

One subclass per class, the best for solo play (the user, 2026-11-20), level 3 features only. Each gets its own discussion of how its mechanics adapt before it is built.

| Class | Subclass | State |
| --- | --- | --- |
| Wizard | Abjurer | Built and play-tested |
| Warlock | The Fiend | In progress |
| Fighter | Champion | Not started |
| Barbarian | Path of the Wild Heart | Not started |
| Bard | College of Valor | Not started |
| Ranger | Gloom Stalker | Not started |
| Rogue | Thief | Not started |

**The Fiend** (agreed 2026-11-20). The patron is still chosen at creation; Archfey and The Vast stay flavor only and show nothing at level 3. The Fiend's features switch on at warlock level 3.
1. Done (2026-11-20; `fiend_blessing_*` scripts). Dark One's Blessing: on dropping a foe to 0 HP (a foe beaten into surrender counts; one that gives up or flees on morale does not), temp HP = CHA mod + warlock level (min 1). An ally's kill counts when the foe was within 10 ft of you. Temp HP does not stack (the higher stays); replacing Armor of Agathys's temp HP ends Agathys.
2. Fiend Spells: Burning Hands and Scorching Ray join the list at level 3, outside the known-spell slots.
3. Command: a new spell, its own piece (an icon may exist already). Suggestion is left out.

Hand edits the Fiend needed so far (the route list for the other subclasses): a hook in `fight_check_all_dead` (combat.txt) for an on-kill feature; a per-enemy flag in `startup_parts/31_combat_engine_state.txt` and `mygame.js`, cleared in the stale-slot loop and `fight_cleanup`; the feature's line on the Abilities page (`choicescript_stats.txt`, under the patron). The class gate is `character_class`, the patron and `character_level >= 3`; no level-up page was needed, since the patron is chosen at creation.

Not yet built or tested end to end. The fight has places meant for them (for example the comment in `concentration_damage_check` where War Caster would add advantage), but nobody has proved the route. Take one subclass as the pilot, and write down every place that needed a hand edit. That list is the real plan for the rest.

### 3.5 Feats (level 4)

After subclasses, once a quest can take a character to level 4. The same pilot approach: one feat, every hand edit written down (War Caster's advantage in `concentration_damage_check` is one known place).

### 3.6 Optional: the remaining replay locks

Step 6a removed only the spell-layer locks. Still in place: dice, save, attack and last-hit locks; budget spend and grant locks; manoeuvre locks; the banner caches that exist only for replay. A new spell never writes these, so removing them makes nothing cheaper. Do it only as clean-up, one family at a time, and keep every lock that a scene outside a fight can reach (`roll_locked`, `false_life_cast_locked`, anything `choicescript_stats`, `equipment`, `dungeon` or `character_stats` calls).

### 3.7 Level 5 and up: 3rd-level slots and upcasting into them

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
- Test-tool limits, not game bugs: a script that injects fight overrides (`combat_enemy_hp_override` and the rest) as starting stats fails the refresh check on its first page, since a real scene sets them on that page and the injected ones are already spent, so about 90 library-fight scripts run without refresh. And `fight_library` throws "invalid return" when the player kills its enemy, so a script there must not end the fight.
- Never checked in a real browser: the Web, Enemy Web and Grease art on the lane, and a target click followed by Stats and back.
- Other surfaces still use the browser's own `title` tooltip beside the themed card: the sidebar's condition chips (Restless, Poisoned, Wounds dressed), the boons (Mage Armor, Shield, False Life), the darts badge and the range tags.
