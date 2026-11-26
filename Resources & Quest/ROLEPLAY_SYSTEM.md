# Roleplay system

How an AI roleplay session works in this game, and the rules for adding or changing one. Read this before touching `web/mygame/rp.js`, `web/mygame/rp-data.js`, a scene that holds an `[RP_SESSION:…]` marker, or the Mempalace server's roleplay routes.

| Part | Where |
| --- | --- |
| The engine: console, prompts, lore, memory calls | `web/mygame/rp.js` |
| Characters and scenes | `web/mygame/rp-data.js` (`RP_CHARACTERS`, `RP_DATA`) |
| World knowledge | `web/mygame/lorebook-*.js` (`window.LOREBOOK`), fields documented in `lorebook-data.js` |
| The server | `C:\Users\Kwesey\Desktop\Mempalace\server.py`: a separate repo with its own uncommitted work, so read before you edit |
| Offline and live checks | `tools/rp_prompt_preview.js`, `tools/rp_lore_search.js`, `tools/rp_memory_test.js` |

## 1. A session in a scene file

- A page becomes a roleplay page when it prints a paragraph that is exactly `[RP_SESSION:${rp_active_scene}]`. rp.js watches the page, finds the marker and mounts its console in its place.
- Set `rp_active_scene` to the `RP_DATA` key in the choice that leads there. Offer a written version beside the `[Roleplay]` one, with `rp_active_scene "none"`, so the game plays without the server (see `lina_verner.txt` `lv_menu`).
- Follow the marker with `*page_break <label>…`. The console hides that button until the scene ends, either when the AI writes `[ACT_COMPLETE]` or when the player ends it.
- **Auto reply** (a console checkbox, kept per browser in `settings.autoReply`):
  - Unchecked, Send and the prompt chips post the player's turn without a reply, so the player can have the last word before `/end`.
  - "Get reply", or Send with an empty box, asks for a reply. The last posted turn is the action, as with a regenerate.
- Clear `rp_active_scene` to `"none"` on the page after the roleplay, never on the roleplay page itself. Opening Stats replays the page, and a value cleared there breaks the replay. The memory is saved when rp.js sees a normal page with `rp_active_scene` set to `"none"`.
- A graded scene (kind `intimate`) writes its grade to `rp_encounter_rating` (0 to 20) when the player accepts the card. Set the variable to 0 before the marker and read it on the next page (`lv_tryst_after`). A companion's `formatBoon(rating)` in rp-data.js must use the same sum as the scene file.
- The game variables are `rp_active_scene`, `rp_encounter_rating` and `rp_world_id`, in `startup_parts/41_gear_shop_and_companion_state.txt`. `rp_world_id` is set once per playthrough and keeps each save's memories apart.

## 2. Characters and scenes (rp-data.js)

A **character** (`RP_CHARACTERS`) is who the companion is in every scene. A **scene** (`RP_DATA`) is one kind of visit and names its character with `character:`. `resolveSceneConfig` merges the two, and scene fields win.

| Character field | Meaning |
| --- | --- |
| `npcName` | The companion's name in prompts and memories |
| `memory`, `threadId` | Whether visits are remembered, and the base of the memory room (`cs_lina_verner`, plus `_<rp_world_id>`). Memory belongs to the character, so it carries between scenes. |
| `knowsName` | true, or `function(s)`: whether she knows the player's name. Decides who-is-who (section 4). |
| `companion`, `persona` | Her looks, and her voice and manner |
| `npcKnowledge` | What **she** knows: of the player, the quest and her own life. Written in the third person with the player's name (or "the player"), never "you". It never holds what only the player knows. |
| `worldKnowledge` | The core of her horizon: a few lines that are always sent |
| `lore` | Which lorebook entries she may be told about (section 5) |
| `profile`, `profileHeadings` | Hidden tastes, used only by a graded kind |

| Scene field | Meaning |
| --- | --- |
| `kind` | `"intimate"` (graded) or `"talk"`. Leaving it out means `"intimate"`, so always set it. |
| `title`, `subtitle`, `setting` | Console header, and the room right now |
| `scenePersona`, `sceneKnowledge` | Lines for this scene only, added after the character's (for example, which supper talks she has already told) |
| `undressed` | Overrides the kind's default for what the player wears in the prompt |
| `starters`, `beats` | One-tap opening actions, and the moments the scene can move through |
| `reciprocity`, `formatBoon`, `supportsEvaluation` | Grading, for graded kinds only |

Any field can be a value or a `function(s)` of the game's variables. Branch on the quest's flags so her knowledge matches the ending the player had (the `kelmGone` split in `lina_supper` is an example). A fact she remembers from a quest needs a flag recorded where the quest decides it (`pc_sw_hall_way`, `pc_sw_purse`, `pc_sw_done_day` in `59_palmcote_press.txt`).

## 3. Scene kinds (rp.js SCENE_KINDS)

A kind sets the narrator's opening role and its extra rules, the helper's suggestion styles, the default for `undressed`, and the `grader`.

- `intimate`: a bedroom scene. It sends the hidden profile, has the reciprocity and dislike rules, and is graded afterwards.
- `talk`: a conversation. There is no profile, no grade, and she deflects sex in character.

A new kind is a new key in `SCENE_KINDS` with every one of those fields. `resolveSceneProfile` returns null for any kind without a grader, so the profile is never sent or graded there.

## 4. The prompt, and what may go where

Prompt caching only reuses an identical start of the prompt, so the order is fixed.

**The system message** (`buildSystemPrompt(cfg, s)`, `buildAdvisorSystemPrompt(cfg, s)`) stays the same for the whole visit:
the voice rules, the kind's rules, then `buildContextBlocks`: companion, persona, wider world, hidden profile, what she knows, the calendar core (two lines), the player as she sees them, setting, NOW.

**The turn's context** (`buildTurnContext(cfg, s, memBlock, focusParts, semanticIds)`) goes in the user message, after the conversation and just before the player's action:
the lore matched this turn, the month and week detail or the coin line when someone mentions them (`CALENDAR_WORDS`, `COIN_WORDS`), and the memories fetched for this turn.

Rules:
- Anything that can change from one turn to the next goes in the turn's context, never in the system message. A system message that changes mid-visit stops the cache from working.
- **Who is who:** the prompt's sections call the player by name once she knows it (`playerRef`), otherwise "the player". The narrator still writes to the player as "you" (`whoIsWhoRule`). Never write "you" for the player in `npcKnowledge`, `sceneKnowledge` or the profile cues.
- Shared narrator rules name nobody. A rule that needs a name goes in that character's fields.
- `dispatchRpGenerate` sends a `session_id` for each scene and each job (narrator, helper, grader), so OpenRouter keeps routing to the provider that holds the cache. Never send `provider.order`: it turns that stickiness off.

## 5. Lore on demand

A character's `lore` scope:

```js
lore: {
  know: { tags: ["Palmcote"], ids: [] },          // entries she knows as a local does
  hearsay: { oxworth: "her own version of the rumor" }, // a name and a rumor only; she says she knows no more
  skip: ["lina_verner", "bailiff_kelm"],          // never: her own entry, or one her notes already cover
  max: 3                                          // at most this many a turn (default 3)
}
```

- **Keywords** (`loreMatches`, in the page, so they work with the server down): an entry inside her scope is sent when its title, an alias or a link name appears in the player's latest words, the last reply or the turn before, in that order of weight.
- **Meaning** (`fetchLoreHits`): the server finds entries by meaning ("the old war"). It is only asked about lines that sound like talk (`LORE_TALK_WORDS`), with an 8 second timeout, and keeps hits scoring at least `LORE_SEMANTIC_THRESHOLD` (0.45). Hits pass through the same scope and rank below every keyword match. A search takes about 4.5 seconds.
- An entry's `rp` field (`lorebook-data.js`) is the short version a local would know, and is sent in place of the full text. Write it neutral, never from one character's point of view ("her own village"): it is shared by everyone.
- `syncLoreToServer` sends the lorebook once per page load when its version hash differs from the server's. After a lorebook edit, run `node tools/rp_lore_search.js --sync` to test before the game does it.

## 6. Memory

- **Save:** `commitSessionToMemPalace` runs when the session closes and `memory` is true and the player left "save to memory" on. Its id is `msg_<page_id>_day<campaign_day>_<scene id>`, so two visits on one day keep two files.
- **The writer:** always OpenRouter, using the model picked in the console (`memoryModel()` returns `settings.model`), even when the scene ran on Perchance. Never hardcode a model.
- **The summary:** server.py turns the transcript into a third-person memory that uses `player_name` when she knows it and never "he" or "she" for the player. If the summary fails, the server returns 502 and saves nothing. It never falls back to saving the raw transcript.
- **The memory's shape** (server.py `MEMORY WRITING`): one stored line in three parts.
  - The memory itself: 2-3 sentences for a short scene, 3-4 from 4000 characters, 4-6 from 12000.
  - `Topics:` every subject raised, a few words each. Small talk survives, and a later semantic search has words to find it by.
  - `Open threads:` whatever was left unresolved, left out when there is none.
- **Continuity:** the writer is given the memory of the visit before (the highest visit number below this one). It notes a follow-up, carries unsettled threads over, and drops the settled ones.
- **Long scenes:** `memoryTranscript` sends up to 80000 characters. Past 16000 (`MEMORY_CHUNK_OVER`), the server notes the transcript in parts of about 10000 characters, cut between turns, three at a time. It then writes the memory from the notes. If any part fails, it sends the start and end of the transcript, 24000 characters. Perchance is used only for an unchunked scene. A chunked memory takes about 2-3 minutes; the save runs in the background.
- **Load:** `fetchMemories` asks `/get_npc_memories` with `max_visit` = `page_id`, so loading an earlier save hides memories from later in that playthrough. Only the last visit's open threads are sent. They are cut from every memory and listed last as "LEFT OPEN AT THE LAST VISIT" (`formatMemoryBlock`, which the test tool uses too).
- No migration code for old memory rooms or old saves.

## 7. The server (Mempalace server.py)

| Route | Use |
| --- | --- |
| `/rp_generate` | A reply, with `mode` `"openrouter"` or `"perchance"`. It passes `session_id` through (`universal_core`). |
| `/append_memory`, `/get_npc_memories`, `/delete_npc_memory` | Save, load and delete memories |
| `/sync_lore`, `/search_lore` | The lore room `thread_cs_lore`, with its version in `data/cs_lore_version.txt` |
| `/get_free_models`, `/perchance_bridge/status` | The console's model list and Perchance status |

- **Perchance bridge limits:** at most 3 jobs queued (beyond that it returns 429 `PERCHANCE_BUSY`), one job at a time with a 2 second gap, and a job left waiting 120 seconds expires. Perchance is never used to write memories.
- **Provider routing** (server.py `CHEAPEST CACHE, STAY WHILE CACHED`), for paid models only:
  - A scene's first turn sends the model's providers ranked by cache-read price, and the next turn is pinned to whichever one served it.
  - A pinned turn with no cache read or write leaves that provider out for the rest of the scene.
  - Memory calls go to the cheapest provider. `:free` models keep OpenRouter's default routing.
  - The server log shows each decision as `[CachePin]`.
- **Bans:** a model that keeps failing is banned in `Mempalace/blacklist.json` (`auto_banned`). Remove its entry to lift the ban.
- The server holds the OpenRouter key. Never search for keys.

## 8. Checks

1. **Offline first, always:** `node tools/rp_prompt_preview.js <scene id> --script <play script>`, with `--say "<line>"` to see the lore pulled, `--kind`, `--memory`, `--hits`, `--advisor` or `--eval` as needed. Read the system message and the turn's context as the AI will. Look for "undefined", empty sections, "you" for the player, and knowledge that doesn't match the ending.
2. **Lore by meaning:** `node tools/rp_lore_search.js "<line>" --scene <id>`. It runs locally and calls no model, but run one query at a time.
3. **Live memory:** `node tools/rp_memory_test.js tools/rp_memory_samples/<character>.json --model <OpenRouter id>`. **Run one live test, read it, then decide whether to run another.** Several runs back to back get a free model rate-limited and banned. `lina_verner_long_talk.json` is a long talk full of small topics followed by a visit that settles two of its threads. Add `--chunk-over 4000` to send it through the long-scene path.
4. The scene file has the usual checks (`lint_all`, `quicktest_parallel --changed`, `play_all`), plus a play script for each roleplay entry point and its written twin.
5. Say plainly which live checks were not run (caching, stickiness, the in-browser lore sync, a full session). They are the designer's to do in the browser.

## 9. Adding a roleplay companion or scene

1. **Character:** add or reuse an entry in `RP_CHARACTERS` with `npcName`, `memory`/`threadId`, `knowsName`, `companion`, `persona`, `npcKnowledge` (third person, branched on quest flags), `worldKnowledge` and a `lore` scope. Add `profile` only if a graded scene uses it.
2. **Scene:** add an `RP_DATA` entry with `kind`, `character`, `title`, `subtitle`, `setting`, `starters` and `beats`, plus `scenePersona`/`sceneKnowledge` for this visit's own facts.
3. **Lorebook:** give the entries she will be asked about an `rp` line. Put her own entry in `skip`.
4. **Scene file:** the `[Roleplay]` choice and its written twin, the marker page with its `*page_break`, and the page afterwards that clears `rp_active_scene` (and reads `rp_encounter_rating` if the scene is graded).
5. **Flags:** any fact she must remember from a quest needs a flag recorded where the quest decides it.
6. **Checks:** section 8, offline first. For memory tests, add a sample in `tools/rp_memory_samples/`.
