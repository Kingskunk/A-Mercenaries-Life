# Project guide

A ChoiceScript game: an open-world, fantasy life simulator with D&D-style fights. The game is in `web/mygame/` (scenes in `web/mygame/scenes/`), the tools are in `tools/`, and the design documents are in `Resources & Quest/`.

This file only says where to look. The rules are in the files it names. Read the one for your task before you write anything.

## Read first

| Task | File |
| --- | --- |
| Any prose the player reads | `.agents/rules/narrative_guidelines.md` |
| A quest, a place, a shop, a named character | `Resources & Quest/QUEST_DESIGN_RULES.md`. `Resources & Quest/QUESTS.md` is the index of every quest: add a row for a new one. Longer write-ups are in `Resources & Quest/quests/`. |
| Adding a place, a settlement, a quest, a named character, a shop, an item, or an enemy or fight | `Resources & Quest/CONTENT_WORKFLOW.md`: for each, what to decide, the files to touch, the tools to run and the checks |
| Scene code, items, the interface, dungeons, the overworld, the test tools | `Resources & Quest/GAMEPLAY_MECHANICS_RULES.md`. It is far too large to read whole: list its `## ` headings, then search inside the one section you need. |
| The fight system: spells, enemies, conditions, subclasses, feats | `Resources & Quest/COMBAT_ENGINE_PLAN.md` |
| What already exists: gear, spells, recipes | The `*_REFERENCE.md` files in `Resources & Quest/` |
| A quest or region that has its own plan | The matching `*_PLAN.md` in `Resources & Quest/` |

## Rules for every task

- Work in small pieces. Agree on the piece, do it, then stop. Do nothing beyond what was asked, though you can provide recomendations.
- Edit `web/mygame/scenes/startup_parts/`, never the built `startup.txt`. Rebuild with `node tools/build_startup.js`.
- A `.generated.` file, or a generated block inside a scene file, comes from a `tools/gen_*.js` tool. Change the source data and run the tool. Never edit the output by hand.
- Never write tool output or a shortened copy of a file back to disk. After a large edit, run `git diff --numstat` and account for every deleted line.
- The designer compiles and commits. Make no commit and do not rebuild `play_game.html` unless asked.
- Compare against an older commit with a git worktree, never with `git stash`.
- A tool that starts Chrome stops only the process it started, never Chrome by name.
- Old saves need no support. Write no migration code.

## Checks before work is called done

```
node tools/lint_all.js <scene file or folder>
node tools/quicktest_parallel.js --changed
node tools/play_all.js <part of a script name>
```

A new page that changes coin, items, health or a flag needs a play script in `tools/play_scripts/` with `"refresh": true`. Read the printed page as a player would before reporting it done. Say plainly what you did not run.
