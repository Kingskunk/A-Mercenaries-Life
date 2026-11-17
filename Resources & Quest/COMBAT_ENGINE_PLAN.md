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
| Terrain, including a spell's own patch (Web) | `combat_terrain1..4`, `combat_movement.txt`, `combat_ai.txt` |
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

Roughly in the order I would take it. Each item is one hand-off, sized to review in one sitting.

### 3.1 Critical hits for enemies and allies

The player's critical hits are built (the rule is in `GAMEPLAY_MECHANICS_RULES.md`, section 6). Left: the same rule for enemy and ally attacks (`resolve_enemy_attack`, `resolve_enemy_attack_on_ally`, `resolve_ally_attack`): a natural 20 rolls the damage dice twice, the attacker's riders on the hit double too, and a hit on a paralyzed creature by an attacker Engaged with it is a critical hit.

### 3.2 Damage cantrips that grow with level

Fire Bolt, Ray of Frost, Chill Touch, Vicious Mockery, Poison Spray and Shocking Grasp roll one die at every level (Eldritch Blast grows in beams instead: see 3.3). Booming Blade and True Strike already read `cantrip_scale` from the data, and `resolve_player_hit` rolls `combat_player_dmg_dice_count` dice, so the damage cantrips need their `cantrip_scale` entries and the count passed through `resolve_spell_hit`. No character reaches level 5 yet.

### 3.3 Shared multi-target attacks, then Eldritch Blast's beams

What is shared today: the sidebar allocation (`assignMultiTargetDart` in `index.html`, writing `combat_mm_darts_1..6` up to `combat_mm_darts_max`) and the count from the data (`projectiles_for_level`: `projectiles` plus `upcast.projectiles` per slot level). What is written per spell: the hub option, the Cast/Cancel targeting page (`fight_target_magic_missile`, `fight_target_scorching_ray`, `fight_target_cause_fear`, near copies) and the resolver loop. Make one targeting page and one "an attack roll per projectile" resolver keyed by spell id, and move Scorching Ray onto it (Magic Missile stays its own: it never rolls to hit). Then Eldritch Blast is data: beams from `cantrip_scale` (2 at level 5, 3 at 11, 4 at 17; `projectiles_for_level` reads the tier), with Agonizing Blast and Repelling Blast applied per beam. Until a character reaches level 5 it stays one target.

### 3.4 Upcasting gaps

- Hold Person: one extra humanoid per slot level above 2nd. In the data (`upcast.targets`), not built; it would use the target sidebar that Cause Fear's 2nd-level cast uses.
- Cure Wounds has no `upcast` in the data, so it heals the same at every slot level.
- Decision 3 in section 4 (a Warlock's 2nd-level pact slot on 1st-level spells).
- A 3rd-level Scorching Ray (four rays) and Magic Missile need their own hub option once a character has 3rd-level slots (level 5). The ray and dart counts and the prose already follow the cast level.

### 3.5 Web and Restrained, the rest of the rules

- Fire burns the webs away: any fire damage to a creature in the patch clears it, frees everyone in it, and deals 2d4 fire to each.
- The player and allies are never caught; the patch only slows them. Catching them needs Restrained effects on the player side (no move, attacks against them with advantage, their own attacks with disadvantage) and a tear-free action on the player's menu.
- A restrained creature should make Dexterity saves with disadvantage. Not built for any restraint.
- AI: an optional step already avoids a web, but the closing route still walks a melee enemy into it. Decide which profiles refuse and fight from range or wait instead (a caster or sharpshooter holds back, a bruiser pushes through).

### 3.6 Paralyzed and other conditions on the player and allies

Paralyzed has its fields on every combatant, but its effects (lost turn, no reactions, advantage against, failed Strength and Dexterity saves) are wired for enemies only, since only the player casts Hold Person. An enemy caster with Hold Person needs the player and ally side. Related: a stunned creature is also incapacitated, so it should not spoil a ranged shot either (`combat_check_engaged` skips only paralyzed ones).

### 3.7 Scrolls and enemy use of the 2nd-level spells

No scroll exists for Shatter (`ICONS/Item/Consumable/Scroll/Scroll_of_Shatter_Unfaded_Icon.png` is ready), Scorching Ray, Hold Person or Web, and no enemy casts any of them (each needs its non-player effect routine).

### 3.8 Clear the dead-space flags

42 scripts carry `"allowDeadSpace": true` (`grep -l allowDeadSpace tools/play_scripts/*.json`). Each is a doubled line break to fix, then drop the flag.

### 3.9 Ally casters

An ally has the spell fields (`combat_ally<N>_cast_*`) but no turn step that uses them. Needs: the cast step in the ally's turn, a choice of target among enemies, and prose that does not address "you". `flavor_npc_blindness` reads the same whether the target fails or saves and speaks to the player; an ally caster needs its own lines for both outcomes.

### 3.10 Enemy casting gaps

- An enemy only casts when it is within weapon reach. A caster standing back never uses its ranged spells.
- Enemies and allies make no concentration save when damaged. Only the player does.

### 3.11 Subclasses and feats

Not yet built or tested end to end. The fight has places meant for them (for example the comment in `concentration_damage_check` where War Caster would add advantage), but nobody has proved the route. Take one subclass and one feat as pilots, and write down every place that needed a hand edit. That list is the real plan for the rest.

### 3.12 Optional: the remaining replay locks

Step 6a removed only the spell-layer locks. Still in place: dice, save, attack and last-hit locks; budget spend and grant locks; manoeuvre locks; the banner caches that exist only for replay. A new spell never writes these, so removing them makes nothing cheaper. Do it only as clean-up, one family at a time, and keep every lock that a scene outside a fight can reach (`roll_locked`, `false_life_cast_locked`, anything `choicescript_stats`, `equipment`, `dungeon` or `character_stats` calls).

---

## 4. Decisions waiting on the designer

Found by the step 8 audit. Play was left as it is in every case.

| # | What disagrees | Options |
| --- | --- | --- |
| 1 | An enemy's Poison Spray is an attack roll (1d12). The data, and the 2024 rule, make it a Constitution save. The player's version has the same question. | Make both a save, or record in the data that this game uses an attack roll. |
| 2 | Bane's data says medium reach. The fight applies it to every enemy at any distance. | Add the reach check, or change the data. |
| 3 | A level 3 Warlock spends a 2nd-level pact slot on Arms of Hadar, Armor of Agathys and Hellish Rebuke but gets 1st-level numbers. | Add `upcast` to the three data entries (the tabletop rule gives +1d6, +5 and +1d10), or leave as a deliberate limit. |
| 4 | Ten utility spells (Alarm, Charm Person, Comprehend Languages, Detect Magic, Disguise Self, Feather Fall, Identify, Jump, Speak with Animals, Unseen Servant) carry a `combat` entry but have no fight option. | Harmless: the entry feeds the hover card. Leave unless a card looks wrong. |
| 5 | A comment in `combat.txt` still says Poison Spray's reach is short. Data and code both say medium. | Fix the comment. |

Older open questions:

- Hellish Rebuke can only be armed while an action is left. Intended, or a leftover?
- A weapon's damage die comes from its category (finesse 1d4, ranged 1d6, two-handed 1d12, other 1d8), not from each weapon's own listed die.
- Burning Hands needs an Engaged foe to be offered.

---

## 5. Known small things

- A refresh on a targeting prompt page (Magic Missile darts, a healing target) forgets the clicks. Nothing is rolled on those pages, so the player clicks again.
- The opening page of a fight entered from another scene is not covered by the replay guard. A refresh resumes at the choice instead of re-running the page. The test tool skips those pages.
- Quality of life, not urgent: a foe beaten into surrender in a non-lethal fight still gets the "💀 Defeated" banner, for every spell and weapon. The line above it reads as a surrender. A different banner for the non-lethal slot would finish the job.
- A library fight with a beast and a swordsman, or with enemy slot 2 clicked, gives the enemies different ability scores when its first page is refreshed (true at commit `2a3efe1b`, before any spell). Scripts on those fights run without `"refresh"`.
- Hunter's Mark's damage type ("force") is still typed in `combat_dice.txt`; its die is the ranger's `favored_foe_die_sides`, not data.
- Never checked in a real browser: the Web badge art on the lane, and a target click followed by Stats and back.
- Other surfaces still use the browser's own `title` tooltip beside the themed card: the sidebar's condition chips (Restless, Poisoned, Wounds dressed), the boons (Mage Armor, Shield, False Life), the darts badge and the range tags.
