# Lore notes (author's eyes only)

Nothing in this folder is loaded by the game. The player-facing lorebook lives in `web/mygame/lorebook-*.js`, which ships to the player. This folder is for everything the player must not see yet: full life stories, secrets, and the order in which they come out.

One file per character in `characters/`. Each file uses the same sections, and every fact carries a tag:

- **[GAME]**: the player can already read this, and the file says where.
- **[AGREED]**: decided in design, written nowhere in the game yet.
- **[PROPOSED]**: suggested but not confirmed. Change or delete freely.

When a talk or lorebook paragraph is written that reveals something, move that fact from [AGREED] to [GAME] and note the scene and flag.

Ideas for quests or hooks may live here as notes. Do not build flags, items or props for them until the quest exists.

| Character | File |
|---|---|
| Kestrel, Scout Company commander | `characters/kestrel.md` |
