# Roleplay knowledge pools: plan

Status: built 2026-11-26 (pieces 1 to 5; piece 6, the rest of the content, grows with the world). The user guide is `ROLEPLAY_SYSTEM.md` section 5.

## The idea

AI characters draw their knowledge of the world from shared **knowledge pools** instead of hand-written notes. A new character is linked to the pools they would know (the realm, their duchy, their village, their trade) at the right **standing** (common or learned). The only knowledge written by hand is their own personal entries. Each turn, the entries that matter to what is being said are found (by keyword, and by meaning through Mempalace) and sent to the AI.

The pools grow with the world. A new realm or duchy brings its own pools, and characters there link to them.

## Not the lorebook

The lorebook (`lorebook-*.js`) is for the player: atmospheric prose, unlocked as the player discovers it. Today's roleplay borrows it through each entry's short `rp` field. The knowledge pools replace that, and the AI stops reading the lorebook.

| | Lorebook | Knowledge pools |
| --- | --- | --- |
| Reader | The player | The AI only |
| Style | Prose for reading | Short facts the AI can use in its own voice |
| Secrets | Only what the player has unlocked | Anything a character would know, including things the player never sees |
| Depth | One text | A common version and a learned version |
| Edits | Change what the player reads | Change only what characters know |

A knowledge entry can name the lorebook entry on the same subject (`see`), only to help the writer find both. Nothing is sent from it.

## Pools

A pool is a group of entries about one place or group. Pools nest by place:

- **Realm:** `grey_marches`. What anyone in the realm would know of it: its name, its four powers and who holds them, the Broken Crown War, coin and the calendar as folk use them, the Empire's leaving.
- **Region:** one pool for each of the four powers (the user calls them duchies; in the lore they are a countship, a free city's territory, a barony and a warlord's holding). Each pool holds who rules, the main towns, the roads, local customs, and the quarrels with neighbours:

  | Pool | Region | Held by | Seat |
  | --- | --- | --- | --- |
  | `western_vale` | The Western Vale, west of the Grey River | House Gault: Countess Avelina Gault | Dunmow |
  | `valen_reach` | The Valen Reach, along the river to the coast | The Gilded Scales: the Council of Factors. No hereditary ruler; the free city's charters and contracts hold it. | Port Valen |
  | `stenmark` | Stenmark, the high valleys and passes of the Crags | Baron Aldous Karr | Karr's Keep |
  | `great_sedge` | The Great Sedge, the bog country east of the causeway | Warlord Skell | Gryke |

  The facts above come from `lorebook-data.js` and `WESTERN_VALE_NOBILITY_PLAN.md`; read those entries when writing the pools. The lorebook's Skell entry calls Skell "he"; the knowledge texts so far use the name rather than a pronoun.
- **Local:** a town or village (`palmcote`, `langston`, `port_valen`). Its people, places, gossip.
- **Trade:** knowledge that crosses places and standing, such as `trade.farming`, `trade.soldiering`, `trade.sea`, `trade.clergy`, `trade.underworld`. A dockhand knows the smuggling routes and a countess does not.
- **Faction:** secret knowledge held only by members (`faction.black_oath`).
- **Personal:** one character's own entries, written by hand: a pool named `own.<character id>`, linked at `insider` so the character gets every text.

Another realm later brings its own realm, duchy and local pools. A traveller can be linked to pools from two realms.

## Standing: common and learned

Each entry can have two texts:

- `common`: what an ordinary person (a villager, a labourer, a sailor) knows or believes. Vague, partial, sometimes wrong in the way folk get things wrong ("the old war folk still curse").
- `learned`: what a lord, scholar, priest, officer or rich merchant knows. Names, dates, causes, who owes whom.

A character is linked to each pool at a standing. A learned character gets the learned text, and the common text where there is no learned one. A common character gets only the common text. **An entry with no common text is unknown to common folk**: it is learned-only, such as the Countess's debts.

Standing is set per pool, so a village woman can be learned about her own village and common about the duchy, and a priest can be learned about the faith and common about the coast.

An optional `secret` text holds the truth only insiders know (the broken promise to Karr, as the Gault court knows it). A character gets it only through a faction pool or their own entries.

## Rumours

Folk versions of far-off things belong in the pool, so they don't have to be written per character:

- A pool can hold `rumors`: what its common folk say about something outside it ("Western Vale folk say Port Valen is all sellswords and stink").
- A character only writes their own version when theirs differs from the pool's (today's Lina `hearsay` entries become pool rumours, except the ones that are hers alone).
- A rumour is sent as hearsay: the character has heard it, knows no more, and may be wrong.

## Entries that change with the story

An entry, a text or a rumour can have a condition on the game state (`when: function (s) { ... }`). Once the player does something known, the pool learns it: after the heist in Palmcote, the Western Vale common pool gets the story, in the way folk tell it. Until then, nobody knows.

## How a character links to pools

```js
knowledge: {
  pools: {
    grey_marches: "common",
    western_vale: "common",
    palmcote: "learned",          // she grew up there
    "trade.farming": "learned"
  },
  rumors: { oxworth: "..." },      // only where hers differs from the pool's
  skip: [],                        // entries she would not know, despite her pools
  max: 3                           // most entries sent a turn
}
```

This replaces today's `lore` scope (`know`, `hearsay`, `skip`, `max`).

## The entry format

One file per pool in `web/mygame/rp-knowledge/` (for example `grey_marches.js`, `western_vale.js`, `palmcote.js`), loaded by the page like `rp-data.js`:

```js
RPKnowledge.pool("western_vale", {
  title: "The Western Vale",
  entries: [
    {
      id: "house_gault",
      title: "House Gault",
      aliases: ["the Gaults", "the Countess"],
      common: "The great lords of the Vale, at Dunmow. Their riders pass on the Hartwell road. Taxes go to them in the end.",
      learned: "Countess Avelina Gault holds the Vale from Dunmow, with two viscounties under her: Harwick (House Reyner) and Falmere (House Falwick). ...",
      secret: "...",
      see: "house_gault"            // the lorebook entry on the same subject, for the writer only
    }
  ],
  rumors: {
    port_valen: { common: "A big port city far off, with ships and sellswords." }
  }
});
```

Writing rules:
- Plain facts, neutral, never from one character's point of view: every character linked to the pool shares it.
- Short: two to four sentences per text. The AI uses them in its own words.
- No em dashes (the narrative guidelines apply, since the AI echoes what it is given).

## Finding entries each turn

- **Keywords** (in the page, with the server down too): an entry inside the character's reach is sent when its title or an alias appears in the latest words. This is how `loreMatches` works now.
- **Meaning** (Mempalace): all pools share **one** search room, with each entry tagged by its pool. One search a turn (about 4.5 seconds), and the page keeps only hits in the character's pools. One room per pool would cost one search per pool.
- The pools are sent to the server when their version changes, as the lorebook is now (`syncLoreToServer`).
- At most `max` entries a turn, keyword matches first.
- They go in the turn's context, never the system message, so the prompt cache keeps working.

## Checking tool

`tools/rp_knowledge_check.js <character>`:
- lists every entry the character can reach, with the text they would get and why (which pool and standing);
- flags entries with no common and no learned text, unknown pools, missing `own` entries, and duplicate ids;
- with `--say "<line>"`, shows what would be sent for that line.

It catches "why does a milkmaid know the Countess's debts" before it happens in play.

## Build pieces

1. **Format and loader:** done. `rp-knowledge/registry.js` (`RPKnowledge.pool`), `tools/rp_knowledge_load.js` for node tools, `tools/rp_knowledge_check.js`.
2. **Reach and turn matching:** done. `rp.js` `knowledgeReach`, `knowledgeMatches`, `formatKnowledgeMatch`.
3. **Search by meaning:** done. server.py `/sync_knowledge`, `/search_knowledge` (room `cs_knowledge`); `rp.js` `syncKnowledgeToServer`, `fetchKnowledgeHits`; `tools/rp_knowledge_search.js`.
4. **Conditions:** done. Any text can be a function of the stats; `when` hides an entry.
5. **Move the characters over:** done for Lina and Vera, the only two with a lore scope. The roleplay no longer reads the lorebook: the `lore` code, the `rp` fields, `syncLoreToServer` and the lore routes are gone. Personal `own.<id>` pools are not written yet: both characters' own story is still in their `npcKnowledge`.
6. **Write the rest of the content:** ongoing. Written so far (71 entries):
   - **`grey_marches`:** every town and village in the Marches, each with common and learned text and `commonIn` for the smaller ones.
   - **The four region pools.**
   - **Local pools:** `hartwell`, `palmcote`, `oxworth`, `dredge_end`, `fallowmere`, `barolo`.
   - **Trade:** `trade.farming`.
   - **Linked characters:** Sable and Brinna are linked to `dredge_end` (learned). Fallowmere's and Barolo's pools wait for their characters.
   - **Still to write:** local pools for the other places as they get characters, and the Sedge's towns beyond Gryke.

## Decisions

- **First trade and faction pools** (adopted): only what the current characters need, so each pool is tested by a real character as soon as it exists. `trade.farming` for Lina (Palmcote's terraces and press). `faction.gilded_scales` for Port Valen insiders, and `faction.black_oath` when its characters are built (`BLACK_OATH_FACTION_PLAN.md`).
- **How well-known the four rulers are** (adopted): the realm pool's common text names all four powers by the name folk use ("the Gaults at Dunmow", "the Scales in Port Valen", "the Baron up in the Crags", "the warlord in the bog"), with one line of what each is known for (the grain, the money, the iron, the peat). Names, titles and politics past that line are learned text, or common text in the region's own pool. A Palmcote picker knows "Countess" and "Dunmow" because they are her own region's, and knows of Skell only as "the warlord in the bog".
