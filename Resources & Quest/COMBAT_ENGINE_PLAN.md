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

### 3.3 Upcasting into 2nd-level slots (done 2026-11-17)

The 1st-level spells below, which lacked it, now grow with a 2nd-level slot: a "Spell: 2nd level" hub option for a Wizard, Bard or Ranger, the pact slot's own level for a Warlock.

- Cure Wounds and Healing Word upcast (+2d8 and +2d4), with 1st and 2nd level options. Healing Word moved to the 2024 rules' 2d4.
- Warlock pact upcasts: Arms of Hadar (+1d6), Armor of Agathys (+5 temporary hit points and +5 cold) and Hellish Rebuke (+1d10) per slot level above 1st, cast at the pact slot's level (`pact_cast_level`). Agathys keeps its retaliation in `agathys_dmg`, fixed at the cast.
- Bane: one more creature per slot level above 1st (the data's `targets` 3 and `upcast.targets` 1, read through `spell_fact_targets` / `spell_fact_upcast_targets`).
- Absorb Elements: armed at a chosen level (`absorb_elements_level`), it spends that level's slot when it fires and its melee rider rolls +1d6 per level above 1st (`combat_player_extra_dmg_dice_count`).

### 3.4 Web and Restrained, the rest of the rules

- Done (2026-11-18): fire burns the webs away. Fire damage to an enemy on the patch (any source: the player, an ally, a burn tick, Hellish Rebuke) sets `combat_web_burn_pending` in `adjust_damage_packet`; `web_burn_check` (combat_spells.txt) then deals one shared 2d4 fire to each living enemy on the patch and ends the Web's concentration, which clears the patch and frees everyone it held. Called from `fight_check_enemy_hp`, after an enemy's burn tick, at `cnt_boom_tail` and at the end of an ally's turn. Enemies only, like Web; the player and allies in the patch take no burn. Script: `web_fire_burns_patch`.
- Done (2026-11-18): Restrained on the player and allies. A restrained player has speed 0 (the round's movement is held in `combat_player_moves_held`, and Push Forward, Fall Back, Dash, Disengage and fleeing are gone), attacks against them have advantage, and their own attacks have disadvantage (labelled "Restrained"). A new action, Break Free, is an Athletics check against the stored `restrained_dc`; a success ends the condition and hands back the movement. A restrained ally never moves (`combat_ally_restrain_turn`): with a foe on its tile (or a ranged weapon) it attacks from the spot at disadvantage, otherwise it spends the turn on a Strength check to break free. Attacks against it have advantage. Prose keys on the source: `"net"` has its own lines, anything else gets general ones. Still no source: the player's Web stays enemies-only, and the Net comes as the first assigned ability (section 3.4a). Scripts: `restrained_player_break_free`, `restrained_player_attacks_at_disadvantage`, `restrained_ally_breaks_free`, `restrained_ally_fights_from_spot`.
- Done (2026-11-18): a restrained creature (Web, Ensnaring Strike, any slot including the player and allies) makes Dexterity saves with disadvantage, in the shared `resolve_save`. The banner reads "(disadvantage, Restrained)" unless another disadvantage already applies. Script: `web_restrained_dex_save_disadvantage`.
- Done (2026-11-18): AI and webs. A profile with `combat_behavior_hold_at_web` 1 (skirmisher, sharpshooter, caster; the user's call) whose next step toward its target would enter a web waits at the edge instead (`combat_ai_web_balk`, combat_ai.txt; the "holds back from the web" branch in combat_next_turn). The lane is one line, so there is no way around. Bruiser, guardian and feral push through. A foe already in the webs may step out; a ranged foe within reach shoots from where it stands. Scripts: `web_skirmisher_holds_at_edge`, `web_bruiser_pushes_through`.

### 3.4a Assigned abilities (agreed 2026-11-18; done 2026-11-18, steps 1-5)

The non-magical twin of assigned spells. A type is a body (HP, AC, scores, weapon, profile); what it can *do* beyond a plain attack comes from up to three ability slots, filled from one catalog, so any body can carry any mix.

**What exists today (each wired its own way):**

| Ability | Where it lives | Limit |
| --- | --- | --- |
| Special move (Off-Guard, Bleeding, Poisoned, Dazed, Pinned, Off-Balance, Hobbled, Blinded) | One `move2_*` block per type in combat_types.txt (chance, to-hit, die, type, condition name and icon), picked in `fight_pick_enemy_move` | One per type, fixed. Every one has the same effect, disadvantage on the player's next d20 (`disadvantage true`), and Pinned, Hobbled and Off-Balance also set `player_movement_restricted`. The names are labels, not engine conditions, which is also why Off-Guard spoils a Break Free check. |
| Multiattack (Captain Trent) | `combat_multiattack_slot`, one fight-wide number | One enemy per fight |
| Damage rider (a poisoned bite) | `extra_dmg_*` fields, set by a scene before the fight | One per enemy, set by hand |
| Stun on hit | `inflicts_stun` / `stun_name` fields | Set by hand |
| Undead Fortitude | Keyed on the slot's flavor type "zombie" | Zombie only |

**The design:**

1. **Catalog.** `tools/ability_book.json`, one entry per ability, round-tripped like spell_book.json. A new `tools/gen_abilities.js` writes an `ability_facts_load` block (a GEN block, never hand-edited) into a new scene, `combat_abilities.txt`, which also holds the resolvers. An entry says its `kind` and its numbers:
   - `attack_variant`: replaces a plain attack some of the time (today's move2): chance, to-hit and damage changes, the condition or effect on a hit.
   - `action`: the turn is spent on it instead of attacking (the Net, later a breath or a shove): range bands, attack or save, damage, condition with escape DC and src, uses per fight or a recharge (5-6), and a "worth it" rule like `spell_worth_casting` (no Net on a target already restrained).
   - `extra_attack`: Multiattack: how many extra swings, and at what die.
   - `on_hit_rider`: an extra damage packet on every hit (die, type), resolved as its own packet as riders are now.
   - `trait`: a passive rule the engine asks about (Undead Fortitude, later pack tactics).
2. **Slots.** Per enemy and per ally: `ability_1..3` (an id or ""), `ability_uses_1..3`. A fight fills them through `combat_enemy_ability_1_override` .. `_3` for slot 1 and `combat_enemyN_ability_K_override` for the others, exactly as `cast_spell_*` is filled. A type can name **default** abilities (a swordsman's feint); a fight's override wins per slot, and `"none"` clears one.
3. **Where each kind runs.** `action` abilities are picked first in `combat_enemy_player_action` (and the ally/intercept dispatchers), before assigned spells and before a plain attack. `attack_variant` is picked where move2 is picked now. `extra_attack` follows the first swing where Trent's does now. `on_hit_rider` joins the hit's damage packets. `trait` is a lookup ("does slot N have undead_fortitude?"). Every pick is replay-locked per slot, as `fight_pick_enemy_spell` is.
4. **Allies.** The same slots and the same resolvers, aimed at enemies.

**Order of work** (each its own piece, and each existing fight must play exactly as before, checked by transcript diffs against a worktree of the commit before the piece):

1. Done (2026-11-18): catalog (`tools/ability_book.json`), generator (`tools/gen_abilities.js`, `--check` for staleness), the new scene `combat_abilities.txt` (`ability_facts_load`, `ability_apply_overrides`, `ability_clear_slot`, `ability_extra_attacks`) and three ability slots on every enemy slot (enemies only so far; ally slots arrive with the first ally ability). An `extra_attack` names its weapon: `"own"` re-reads the body's own weapon (die, type, bonus; a cornered archer's sidearm) with no special move, after any attack on the player, melee or ranged; `"offhand"` brings its own die and damage type. Two entries: **`multiattack`** (own weapon, one extra attack: a swordsman cuts twice, an archer shoots twice) and **`offhand_knife`** (Trent's d4 piercing stab). Trent's fight and the dev test fight set `combat_enemy_ability_1_override "offhand_knife"`, and `combat_multiattack_slot` is retired. Trent's fights play identically (transcripts diffed before and after). Scripts: `ability_multiattack_any_slot` (an axeman in slot 2), `ability_multiattack_archer`.
2. Done (2026-11-18): **the Net**, the first `action` ability. `ability_pick_action` (combat_abilities.txt) picks an action ability whose range bands hold the player, whose effect would do something (no net on a player already restrained, none while hidden) and whose chance comes up, cached per slot per page. `ability_use_action` spends a use and makes an attack roll (the body's own attack bonus against AC, with cover, Dodge and Shield; advantage on a blinded player, disadvantage for a blinded or frightened thrower), and a hit applies the catalog's condition (Restrained, escape DC 10, src `"net"`), stored per slot against the page for replay. Asked in two places: a melee enemy still out of reach throws instead of closing (the `cnt_throw_place` branch in `combat_next_turn`), and `combat_enemy_player_action` asks before assigned spells and a plain attack. The prose is `flavor_ability_action` (combat_prose.txt). Player target only; an ally being netted waits for an ally-target hook. Scripts: `ability_net_restrains_player`, `ability_net_one_use_then_closes`.
3. Done (2026-11-18): the eight **special moves** are `attack_variant` entries (`feint`, `bleeding_cut`, `poisoned_blade`, `dazing_blow`, `pinning_thrust`, `hook_and_pull`, `hobbling_shot`, `blinding_stone`), each its type's default in ability slot 3 (`ability_type_default`), so a fight's abilities in slots 1 and 2 add to it and `ability_3_override` replaces or clears it. `ability_refresh_variant` writes the slot's `move2_*` fields from the catalog once the slot's attack bonus and overrides are final; the to-hit is the body's attack bonus without its ability modifier (atk_bonus minus dmg_bonus), which is what every type had, and it follows an attack override (the old `so_delta` / `aso_delta` shifts are gone). The picker, sync, sidearm and prose still read `move2_*` as runtime fields, so behavior is unchanged: the whole suite's transcripts were diffed before and after (zero differences), and two seeded scripts that make the moves fire (`ability_special_moves_melee`, `ability_special_moves_reach_ranged`) were run on a worktree of the commit before and on the change, with identical transcripts.

   Known issue, found here and older than this step: in `fight_library` with an archer, slinger, spearman and hookman, refreshing the opening page re-rolls slot 1's ability scores (and so its attack and damage bonuses) and, with a melee type in slot 1 and ranged ones after it, its weapon fields. `ability_special_moves_reach_ranged` runs with refresh off until it is fixed. The authored `move2_*` blocks on the types are retired. A special move on a different body uses that body's own move2 flavor lines.
4. **Riders and stun** become `on_hit_rider` and an effect, and the scenes that set `extra_dmg_*` by hand assign an ability instead. **Done (2026-11-18).** An `on_hit_rider` carries a damage packet (`damage_dice_sides`, `damage_bonus`, `damage_type`), an effect (`effect: "stun"` with `effect_name`, `effect_icon`), or both. `combat_abilities.txt ability_refresh_rider` runs beside `ability_refresh_variant` (slot 1 in fight setup, the others in `apply_slot_stat_override`) and loads the first rider damage into the slot's `extra_dmg_*` and the first stun into `inflicts_stun`, `stun_name`, `stun_icon`; the hit resolvers are unchanged. A slot with no rider keeps its fields, so a test can still set them by hand. Catalog: `venom` (1d4 poison: the Longshade venomous snake and the silt-conduit giant viper, both now `combat_enemy_ability_1_override "venom"`), `venom_laced_claws` (1d2+3 poison, the dev lacedon), `stunning_blow` (stun, 💫 Stunned; no story foe holds it). New script `ability_stunning_blow_stuns_player`.
5. **Undead Fortitude** becomes a `trait`. **Done (2026-11-18).** `undead_fortitude` is a `trait` in the catalog and the zombie type's default (slot 3). `combat_abilities.txt ability_has_trait <slot> <id>` answers in `ability_has_trait_result`; `combat.txt fight_undead_fortitude_roll` asks it instead of reading the flavor type, so any body can hold the rule and a zombie fight can clear it (`ability_3_override "none"`). The unit scripts give the trait by hand (`combat_enemy1_ability_3`); new script `ability_trait_undead_fortitude_any_body` (a lacedon holding it).

**Decided (the designer, 2026-11-18):**

- **Type defaults stay.** A type names its default abilities (the swordsman's feint). A fight's override wins per slot, and `"none"` clears one, so no existing fight changes.
- **Turn order.** An action ability first, then an assigned spell, then a plain attack. Each uses its own chance and its own "worth it" rule.
- **Uses.** Uses per fight, recharge 5-6, or a plain chance, chosen per ability.
- **Real conditions come later, as their own piece.** The migration keeps today's behavior exactly. Turning the special-move names into real conditions is a balance pass after step 3. The designer's targets, after Baldur's Gate 3 (2026-11-18; Daze was an early design and is to be redone):

| Condition | Effect | Ends |
| --- | --- | --- |
| Dazed | Disadvantage on Wisdom saves, no reactions, loses its Dexterity bonus to AC | An ally Helps it |
| Stunned | Cannot move or take actions, bonus actions or reactions; fails Strength and Dexterity saves; attacks against it have advantage; breaks concentration when applied | (its duration) |
| Off-Balance | Disadvantage on Strength and Dexterity ability checks; attacks against it have advantage | It takes damage, or is Helped |
| Blinded | Disadvantage on attack rolls; its attacks and spells reach only 10 ft (Engaged); attacks against it have advantage | (its duration) |
| Poisoned | Disadvantage on attack rolls and ability checks | (its duration) |
| Bleeding | 2 slashing at the start of each of its turns; disadvantage on Constitution saves | Any healing |

  Off-Guard, Pinned and Hobbled have no target yet. A "Help" action (one ally ends Dazed or Off-Balance on another) would arrive with this pass.

### 3.5 Paralyzed and other conditions on the player and allies

Paralyzed has its fields on every combatant, but its effects (lost turn, no reactions, advantage against, failed Strength and Dexterity saves) are wired for enemies only, since only the player casts Hold Person. An enemy caster with Hold Person needs the player and ally side. Done (2026-11-18): a stunned enemy no longer spoils a ranged shot (`combat_movement.txt combat_check_engaged` skips it as it skips a paralyzed one, reading stun as `combat_attack_edge` does).

### 3.6 Scrolls and enemy use of the 2nd-level spells

No scroll exists for Shatter (`ICONS/Item/Consumable/Scroll/Scroll_of_Shatter_Unfaded_Icon.png` is ready), Scorching Ray, Hold Person or Web, and no enemy casts any of them (each needs its non-player effect routine).

### 3.7 Clear the dead-space flags

Done (2026-11-17): no script carries `"allowDeadSpace": true` any more (`grep -l allowDeadSpace tools/play_scripts/*.json` finds none), so a new doubled line break fails its script. A script's transcript names the scene and line ("!! DEAD SPACE"; its line number counts from 0, so it is one less than the editor's). Causes met while clearing them, for the next one. A routine called just before a `*line_break` that ends the paragraph itself (a time skip, `apply_unique_buff`) is the usual cause; a blank line instead of the break fixes it either way, since an empty paragraph prints nothing. A dice banner from `dice_engine` and the endings `fight_victory` and `fight_cured` already end on a break, so a `*line_break` straight after them is a second one. Another known cause: `calendar.txt`'s blank lines between commands end the caller's paragraph, so a page that passes time (`dg_time`) and then prints a `*line_break` (as `dg_status_line` does first) shows an empty line. Pass the time before the page's prose instead (as Bark's fruit exchanges in `longshade_forest.txt` do). Removing every blank line from `calendar.txt` was tried and reverted: 38 transcripts then joined text across a time skip (a shop's purchase banner ran into the next place's heading), because those pages rely on the time skip to end the paragraph.

### 3.8 Ally casters

An ally has the spell fields (`combat_ally<N>_cast_*`) but no turn step that uses them. Needs: the cast step in the ally's turn, a choice of target among enemies, and prose that does not address "you". `flavor_npc_blindness` reads the same whether the target fails or saves and speaks to the player; an ally caster needs its own lines for both outcomes.

### 3.9 Enemy casting gaps

- An enemy only casts when it is within weapon reach. A caster standing back never uses its ranged spells.
- Enemies and allies make no concentration save when damaged. Only the player does. (Checked 2026-11-18: nothing to save yet, since only the player ever calls `concentration_begin`; build it with the first enemy or ally concentration spell. `concentration_damage_check` already takes any prefix.)
- Also found 2026-11-18: no story fight gives an enemy a spell yet (only scripts set `cast_spell_*`), and the spell data has no range band an enemy picker can read, so "cast from standing back" needs that first.

### 3.10 Subclasses and feats

Not yet built or tested end to end. The fight has places meant for them (for example the comment in `concentration_damage_check` where War Caster would add advantage), but nobody has proved the route. Take one subclass and one feat as pilots, and write down every place that needed a hand edit. That list is the real plan for the rest.

### 3.11 Optional: the remaining replay locks

Step 6a removed only the spell-layer locks. Still in place: dice, save, attack and last-hit locks; budget spend and grant locks; manoeuvre locks; the banner caches that exist only for replay. A new spell never writes these, so removing them makes nothing cheaper. Do it only as clean-up, one family at a time, and keep every lock that a scene outside a fight can reach (`roll_locked`, `false_life_cast_locked`, anything `choicescript_stats`, `equipment`, `dungeon` or `character_stats` calls).

### 3.12 Level 5 and up: 3rd-level slots and upcasting into them

Not needed until a character can reach level 5 (no quest goes past level 3 yet). Built ahead only where it saves coming back to a piece later.

- Spell slots of 3rd level and up. Wizard, bard and ranger have only the 1st- and 2nd-level pools (`spell_slots_1` / `_2`), and `refresh_slot_left` (`combat_spells.txt`) maps a Warlock's pact slots to `slot_left_1` / `_2` only for `pact_slot_level` 1 and 2, so a level 5 Warlock's 3rd-level pact slots would count as none and no leveled spell would be offered. Needs: the pools from 3rd level up, `slot_left_N` and the hub's slot reasons for them, `spend_spell_slot` / `spend_lowest_slot` for them, and the rest and level-up refills.
- A 3rd-level Scorching Ray (four rays) and Magic Missile need their own hub option. The ray and dart counts and the prose already follow the cast level.
- Hold Person: one extra humanoid per slot level above 2nd. In the data (`upcast.targets`), not built; it would use the shared targeting page (`fight_target_multi`).

---

## 4. Decisions waiting on the designer

Odd design choices found, that need a user recomendation change and decision.

| # | What disagrees | Options |
| --- | --- | --- |
| 1 | An enemy's Poison Spray is an attack roll (1d12). The data, and the 2024 rule, make it a Constitution save. The player's version has the same question. | Make both a save, or record in the data that this game uses an attack roll. |
| 2 | Bane's data says medium reach. The fight applies it to every enemy at any distance. | Add the reach check, or change the data. |
| 4 | Ten utility spells (Alarm, Charm Person, Comprehend Languages, Detect Magic, Disguise Self, Feather Fall, Identify, Jump, Speak with Animals, Unseen Servant) carry a `combat` entry but have no fight option. | Harmless: the entry feeds the hover card. Leave unless a card looks wrong. |

Older open questions:

- Hellish Rebuke can only be armed while an action is left. Intended, or a leftover?
- A weapon's damage die comes from its category (finesse 1d4, ranged 1d6, two-handed 1d12, other 1d8), not from each weapon's own listed die.
- Burning Hands needs an Engaged foe to be offered.

---

## 5. Known small things

- A refresh on a targeting prompt page (Magic Missile darts, a healing target) forgets the clicks. Nothing is rolled on those pages, so the player clicks again.
- The opening page of a fight entered from another scene is not covered by the replay guard. A refresh resumes at the choice instead of re-running the page. The test tool skips those pages.
- Fixed (2026-11-18): refreshing a library fight's opening page used to give slot 1 another slot's ability scores, bonuses, weapon and sidearm fields (slot 1 is built in the bare scratch fields, which later syncs on the page overwrite). `combat_types.txt` now restores slot 1's unchanging fields from its own snapshot on a locked replay (`apply_ability_score_range`, `apply_derived_combat_bonuses`, `apply_enemy_type`); 17 scripts that now replay cleanly run with refresh on. Test-tool limit, not a game bug: a script that injects fight overrides (`combat_enemy_hp_override` and the rest) as starting stats fails the refresh check on its first page, because a real scene sets them on that page and re-runs them, while injected stats are already spent; about 88 library-fight scripts run without refresh for that reason.
- Off-Guard (and every condition that gives "disadvantage on the next d20") also hits the player's next skill check, so a swordsman's feint can spoil a Break Free roll. Settle it in the condition rebalance (the BG3 table in 3.4a).
- Done (2026-11-18): an enemy whose attack an intercepting ally takes now makes its extra attacks (Multiattack, Off-hand Knife) at that ally (`combat.txt fight_enemy_ally_extra_attack`; script `ability_multiattack_on_intercepting_ally`). The Net needs no ally hook here: it is thrown at Close or Mid-Range, and an intercepting ally is Engaged.
- Never checked in a real browser: the Web badge art on the lane, and a target click followed by Stats and back.
- Other surfaces still use the browser's own `title` tooltip beside the themed card: the sidebar's condition chips (Restless, Poisoned, Wounds dressed), the boons (Mage Armor, Shield, False Life), the darts badge and the range tags.
