# Roleplay system

How an AI roleplay session works in this game, and the rules for adding or changing one. Read this before touching `web/mygame/rp.js`, `web/mygame/rp-data.js`, a scene that holds an `[RP_SESSION:…]` marker, or the Mempalace server's roleplay routes.

| Part | Where |
| --- | --- |
| The engine: console, prompts, knowledge, memory calls | `web/mygame/rp.js` |
| Characters and scenes | `web/mygame/rp-data.js` (`RP_CHARACTERS`, `RP_DATA`) |
| World knowledge | `web/mygame/rp-knowledge/*.js` (`window.RPKnowledge`), format in `rp-knowledge/registry.js`, plan in `RP_KNOWLEDGE_PLAN.md`. The lorebook is the player's; the AI never reads it. |
| The server | `C:\Users\Kwesey\Desktop\Mempalace\server.py`: a separate repo with its own uncommitted work, so read before you edit |
| Offline and live checks | `tools/rp_prompt_preview.js`, `tools/rp_knowledge_check.js`, `tools/rp_knowledge_search.js`, `tools/rp_memory_test.js` |

## 1. A session in a scene file

- A page becomes a roleplay page when it prints a paragraph that is exactly `[RP_SESSION:${rp_active_scene}]`. rp.js watches the page, finds the marker and mounts its console in its place.
- Set `rp_active_scene` to the `RP_DATA` key in the choice that leads there. Offer a written version beside the `[Roleplay]` one, with `rp_active_scene "none"`, so the game plays without the server (see `lina_verner.txt` `lv_menu`).
- Follow the marker with `*page_break <label>…`. The console hides that button until the scene ends, either when the AI writes `[ACT_COMPLETE]` or when the player ends it.
- **Model picker** (rp.js `MODEL PICKER`):
  - The header chip shows the model, its cost per 100 turns and its context length. It opens a panel of cards: price per 1M tokens (in, out, cache), cost per 100 turns for this scene's prompt as it stands, context, maximum reply, release date, and the Thinking, Batch and ban badges.
  - Each card also shows the player's own record, kept in `Mempalace/model_stats.json` (server.py `MODEL RECORD`): turns, average seconds, average cost, share cached, failures.
  - **Best deal** (server.py `BEST DEAL`):
    - OpenRouter's listed price for a model is one provider's price, often the maker's, not the cheapest. A paid card uses the provider the router tries first instead (`ranked_endpoints`: up providers first, then cheapest cache read, then cheapest input). The card says "via <provider>" and shows the input price range across providers.
    - "Providers (N)" lists every provider in that order, with uptime over the last 30 minutes.
    - The $0.50 budget cap uses the best deal too.
    - The server reads the provider lists for paid models listed at up to $2 per million tokens, 12 at a time. They're cached for an hour, and a failed read is retried after 5 minutes. The first load takes about 7 seconds.
  - **Refusals:** server.py `looks_like_refusal` counts a reply that reads as the model declining the scene. It takes quoted dialogue out first, then looks for phrasing like "I can't continue", "as an AI" or "content policy". A moderation 403 also counts. The card shows "refused N of M", and a Refuses badge once refusals reach 20% of turns. It's a guide, not exact.
  - **Moderated:** the badge comes from OpenRouter's `is_moderated`, meaning OpenRouter screens the prompt and refuses flagged ones. The "Hide moderated" checkbox hides these models.
  - The panel has search, filters (all, free, paid, starred) and a sort. Starred models stay at the top. Stars and the last filter and sort are kept per browser.
  - The hidden `.rp-model-select` still holds the value the rest of rp.js reads.
- **Auto reply** (a console checkbox, kept per browser in `settings.autoReply`):
  - Unchecked, Send and the prompt chips post the player's turn without a reply, so the player can have the last word before `/end`.
  - "Get reply", or Send with an empty box, asks for a reply. The last posted turn is the action, as with a regenerate.
- Clear `rp_active_scene` to `"none"` (and `rp_escalated` to `false`) on the page after the roleplay, never on the roleplay page itself. Opening Stats replays the page, and a value cleared there breaks the replay. The memory is saved when rp.js sees a normal page with `rp_active_scene` set to `"none"`.
- A graded scene (kind `intimate`) writes its grade to `rp_encounter_rating` (0 to 20) when the player accepts the card. Set the variable to 0 before the marker and read it on the next page (`lv_tryst_after`). A companion's `formatBoon(rating)` in rp-data.js must use the same sum as the scene file.
- **Talk ↔ Intimate bridge (`escalate` & `pillowTalk`):**
  - A `talk` scene may declare `escalate: { target, allowed(s), buttonLabel, promptTitle, confirmLabel, dividerText, nextBtnLabel, transitionNote, subplace, reasonNotNow(s) }`. When `allowed(s)` is true, the narrator may emit `[ESCALATE_INTIMATE]` (showing a 1-click inline confirmation bar) and the player also gets a subtle console button and `/intimate` command. Confirming switches the live console to `target` in the same transcript, sets `rp_escalated = true`, keeps clothing until undressed in prose, starts a fresh cache `session_id`, and grades only the intimate portion (`escalatedAtTurn` onward). On exit, the scene's `*_after` label checks `*if (rp_escalated)`, stamps the same cooldown/time as a direct tryst, and jumps into `*_tryst_after` so there is no double-dipping.
  - An `intimate` scene may declare `pillowTalk: { target, buttonLabel, dividerText, settingNote }`. On the post-scene evaluation card, clicking `Accept Grade & Pillow Talk` locks `rp_encounter_rating` permanently (no re-grading), switches the live console to an afterglow `talk` session, and preserves the locked rating on exit (and across Stats round-trips).
- The game variables are `rp_active_scene`, `rp_encounter_rating`, `rp_escalated` and `rp_world_id`, in `startup_parts/41_gear_shop_and_companion_state.txt`. `rp_world_id` is set once per playthrough and keeps each save's memories apart.

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
| `knowledge` | Which knowledge pools she reaches, at what standing (section 5) |
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
the knowledge matched this turn, the month and week detail or the coin line when someone mentions them (`CALENDAR_WORDS`, `COIN_WORDS`), and the memories fetched for this turn.

Rules:
- Anything that can change from one turn to the next goes in the turn's context, never in the system message. A system message that changes mid-visit stops the cache from working.
- **Who is who:** the prompt's sections call the player by name once she knows it (`playerRef`), otherwise "the player". The narrator still writes to the player as "you" (`whoIsWhoRule`). Never write "you" for the player in `npcKnowledge`, `sceneKnowledge` or the profile cues.
- Shared narrator rules name nobody. A rule that needs a name goes in that character's fields.
- `dispatchRpGenerate` sends a `session_id` for each scene and each job (narrator, helper, grader), so OpenRouter keeps routing to the provider that holds the cache. Never send `provider.order`: it turns that stickiness off.

## 5. Knowledge on demand

What a character knows of the world comes from **knowledge pools** (`web/mygame/rp-knowledge/`, one file per pool), written for the AI only. Plan and reasoning: `RP_KNOWLEDGE_PLAN.md`. Entry format: the header of `rp-knowledge/registry.js`.

- **Pools:**
  - The realm (`grey_marches`) holds every town and village in the Marches.
  - One pool per region (`western_vale`, `valen_reach`, `stenmark`, `great_sedge`) holds what its own people know beyond that: lords, Port Valen's quarters.
  - Local pools (`hartwell`, `palmcote`, `oxworth`, `dredge_end`, `fallowmere`, `barolo`) hold a place's people and its own business.
  - Trade pools (`trade.farming`).
- **Places:** a place entry with `commonIn` (its region and local pool) is common knowledge only there. Anyone else needs learned standing to know it. Port Valen and Dunmow have no `commonIn`, so everyone knows them. A character gets their own region's places at their standing in that region. Add faction pools (`faction.<name>`) and new realms the same way. Each pool file needs a `<script>` tag in `index.html`, after `registry.js` and before `rp-data.js`.
- **Entry texts:**
  - `common` is what an ordinary person knows or believes. An entry with no common text is unknown to common folk.
  - `learned` is what a lord, scholar or officer knows. Write it whole: it replaces the common text rather than adding to it.
  - `secret` is for insiders only.
  - Any text can be a function of the stats, so it follows the story. `when(s)` hides the whole entry until it is true.
- **Rumors:** a pool's `rumors` are what its folk say about an entry, sent beside it ("Folk here say: ..."), or alone as hearsay when the entry itself is out of reach.

A character's `knowledge`:

```js
knowledge: {
  pools: { grey_marches: "common", western_vale: "common", palmcote: "learned" }, // standing: common, learned or insider
  rumors: { broken_crown_war: "her own version" }, // only where hers differs from the pool's
  skip: ["bailiff_kelm"],                           // never: an entry her notes already cover
  max: 3                                            // at most this many a turn (default 3)
}
```

- **Keywords** (`knowledgeMatches`, in the page, so they work with the server down): an entry in reach is sent when its title or an alias appears in the player's latest words, the last reply or the turn before, in that order of weight.
- **Meaning** (`fetchKnowledgeHits`): the server finds entries by meaning ("the old war").
  - It is only asked about lines that sound like talk (`KNOWLEDGE_TALK_WORDS`), with an 8 second timeout. A search takes about 4.5 seconds.
  - It keeps hits scoring at least `KNOWLEDGE_SEMANTIC_THRESHOLD` (0.45).
  - All pools share one room, so it is one search a turn. Hits pass through the character's reach and rank below every keyword match.
- **Sync:** `syncKnowledgeToServer` sends every entry once per page load when the version hash differs from the server's. After editing a pool, run `node tools/rp_knowledge_search.js --sync`.
- **Writing:** short plain facts, neutral, never one character's point of view, and no em dashes. Every character linked to the pool shares the text.

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
| `/sync_knowledge`, `/search_knowledge` | The knowledge room `thread_cs_knowledge`, with its version in `data/cs_knowledge_version.txt`. The old lore room (`cs_lore`) is no longer used. |
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

1. **Offline first, always:** `node tools/rp_prompt_preview.js <scene id> --script <play script>`, with `--say "<line>"` to see the knowledge pulled, `--kind`, `--memory`, `--hits`, `--advisor` or `--eval` as needed. Read the system message and the turn's context as the AI will. Look for "undefined", empty sections, "you" for the player, and knowledge that doesn't match the ending.
2. **Knowledge:**
   - `node tools/rp_knowledge_check.js` checks every pool and character.
   - `node tools/rp_knowledge_check.js <character> [--set flag=value] [--say "<line>"]` lists what that character can reach and what a line would send.
   - `node tools/rp_knowledge_search.js "<line>" --scene <id>` tests search by meaning. It runs locally and calls no model, but run one query at a time.
   - Test that a character receives the right knowledge offline only. Whether a model then uses it is the model's business, not something to test live.
3. **Live memory:** `node tools/rp_memory_test.js tools/rp_memory_samples/<character>.json --model <OpenRouter id>`. **Run one live test, read it, then decide whether to run another.** Several runs back to back get a free model rate-limited and banned. `lina_verner_long_talk.json` is a long talk full of small topics followed by a visit that settles two of its threads. Add `--chunk-over 4000` to send it through the long-scene path.
4. The scene file has the usual checks (`lint_all`, `quicktest_parallel --changed`, `play_all`), plus a play script for each roleplay entry point and its written twin.
5. Say plainly which live checks were not run (caching, stickiness, the in-browser knowledge sync, a full session). They are the designer's to do in the browser.

## 9. Adding a roleplay companion or scene

1. **Character:** add or reuse an entry in `RP_CHARACTERS` with `npcName`, `memory`/`threadId`, `knowsName`, `companion`, `persona`, `npcKnowledge` (third person, branched on quest flags), `worldKnowledge` (the few facts sent every turn) and `knowledge` (pools and standing). Add `profile` only if a graded scene uses it.
2. **Scene:** add an `RP_DATA` entry with `kind`, `character`, `title`, `subtitle`, `setting`, `starters` and `beats`, plus `scenePersona`/`sceneKnowledge` for this visit's own facts.
3. **Knowledge:** link her pools and standing. Write a local pool for her place if none exists, and put entries her notes already cover in `skip`. Run `node tools/rp_knowledge_check.js <character>`.
4. **Scene file:** the `[Roleplay]` choice and its written twin, the marker page with its `*page_break`, and the page afterwards that clears `rp_active_scene` (and reads `rp_encounter_rating` if the scene is graded).
5. **Flags:** any fact she must remember from a quest needs a flag recorded where the quest decides it.
6. **Checks:** section 8, offline first. For memory tests, add a sample in `tools/rp_memory_samples/`.
