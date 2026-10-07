# Kestrel

Scout Company commander of the Iron Carrion. Half-elf, past sixty winters, looks past forty. One name, no rank, no colors. Dry, watchful and short on words.

## In the game now [GAME]

**Appearance** (settled 2026-10-06):
- Lean, weathered, past sixty winters but "she looks past forty" (half-elf). Dark, watchful eyes. Tapered half-elven ears under a greased-leather coif. Dark hair cropped short and greying at the temples. A long plain iron knife, no ornament. Mottled grey leathers the color of damp river-stone.
- Sources: lorebook "kestrel" (`lorebook-data.js`), the skiff scene (`battle_black_sinks.txt`, `bivouac_companion_scouts`), the prisoner scene ("dark, measuring eyes"). No scars: the one "scarred face" line in the skiff hub now reads "weathered face".

**Manner:** says almost nothing, murmurs something different to each recruit as she passes, watches everyone. Praise from her is "closer to a commendation than anything with actual words in it."

**Where the player sees her:**
- Black Sinks causeway: leads the Scout Company's flank through the reeds. "Wet feet and quiet feet, or you don't make the wall at all."
- Bivouac: on the forward skiff (`bivouac_companion_scouts`). Respect +6 or +2, depending on the approach.
- The gate-wall prisoner (`beat_resolution`): reacts to whether the player kills, spares or hands over the deserter. Kill: `kestrel_respect -5` ("Messy"). Spare: +6 ("Corpses don't give you answers").
- Carrion compound: runs the Scouts' drill (`pv_poi_carrion`) in the morning, and the Scout squad's training sessions.
- Watchtower top room (`pv_poi_tower`, `port_valen.txt`): Dusk and after dark. Out on the square in the morning, out past the gate in the afternoon.
- Vane's summons sends every operative up the tower after dark ("she has a use for someone who isn't on my roster").

**Fixed in the lorebook, gated by talks** (`lorebook-data.js`, "kestrel"):
- `kestrel_advice_told`: she keeps watching the whole time, everyone shows what they will do before they do it, it is exhausting, she is terrible company. Talk: "Ask what she sees from up here."
- `kestrel_origin_told` (needs `kestrel_respect >= 6`): born in a fen town on piles, east of the causeway. Mother poled an eel boat. Father an elf who came with a survey party and didn't come back. At fifteen, guide to the legion at Gryke. The legion's soldiers named her Kestrel for how she watched water before stepping on it. Her fen name stays private. Talk: "Ask where she's from."
- `kestrel_watch_leverage`: she holds the names of the paid night sergeants of the Silt-Gates and means to keep them owing her. Set when the broker's payout slip is delivered.

**Talks with no lorebook paragraph:** `kestrel_sinks_told` (her view of the Sinks and Alderford, built from the player's deeds). The Silt-Gate brief and turn-in (`pv_tower_silt`, `pv_tower_silt_turnin`).

**The fen casks (not in the game now):** an earlier draft had her tell the player the spirits are a fen drink and that she knows whose casks they are. The user cut it from the brief on 2026-10-06 so the quest does not give away its hook. The link is still true in her notes: the Silt-Gate spirits are fen casks and she knows whose.

## Her life, as agreed [AGREED]

All of this is consistent with what is in the game and is not shown to the player yet beyond the facts above.

- **Born:** about sixty-five years ago, in a fen town built on piles, a long way into the Great Sedge. Human mother, eel-boat woman. Elf father, passing through with a survey party the Empire sent out; he left her mother before she knew she was pregnant. A half-elf in a place that small: everyone looked, nobody spoke. She grew up on the water.
- **Skills:** the water, the tracks, the currents, which reeds hold a boat and which hold you under; later the bow and the legion's signals, learned from the soldiers at Gryke.
- **Gryke:** at fifteen, hired as a guide because the legion had lost two patrols in the mire. Bad pay, worse food, and the first people who looked at her as simply useful. She stayed "a long time". The Meridian legion there was the same one that dissolved where it stood when the Empire collapsed.
- **The name:** her commander at the time said she looked like a bird over a ditch, because she would stand at the edge of open water for an age, watching, before she put a foot in, and the name Kestrel stuck. Her fen name is "where she left it."
- **After the collapse:** in her thirties, with no legion left, she hired herself out among the fen towns' quarrels for years. This is the "decades of fen warfare" in the lorebook. She lost people.
- **Joining the Carrion:** in the company's second year, Vane needed a way through the Sedge. She guided them and signed her own terms: a written contract, no rank, no colors. That is why she answers to no one but her own reputation. Vane's company is about thirty years old, so she has been with it about twenty-eight.
- **Family:** none left. The scouts are what she has.
- **Skell:** she served in the same fort as the sergeant who became the warlord Skell. Skell's pronouns are deliberately unwritten, so anything about Skell must avoid them.
- **Vane:** she has heard where he came from, and doesn't say.
- **Habits:** says something different to each recruit as she passes, and remembers each one. Eats dried eel. Sits in the shutter that faces the inland road. Keeps no paper: her maps are charcoal on a crate, rubbed out each night.

## Reveal ladder

What the player can learn, in order, and how.

1. First meeting at the Sinks or on the skiff: manner only.
2. Tower: "What she sees" (any regard). Her method.
3. Tower: the Silt-Gate brief. She wants the sergeants owing her; she knows the spirits are fen casks.
4. Tower: "The Sinks and Alderford." What she watches the player do.
5. Tower: "Where she's from" at regard 6. Fen, mother, father, Gryke, the name.
6. **Not yet written:** the regard where she tells what happened after the legion collapsed, and the Skell link. Suggested: regard 15, ideally after the player has handed her the Silt-Gate names, since the fen casks give her a reason to say more.
7. **Not yet written:** the Vane story. Suggested: late, and refused at least once.

## First words in the tower, by history [GAME]

The "what she sees" talk (`pv_tower_advice`) opens on how the player has already met her. The skiff outcome is stored in `kestrel_skiff` (set in `battle_black_sinks.txt`); Scouts are read from `kestrel_respect` with the Silt-Gate +5 taken off.

| History | What she says |
|---|---|
| Skiff, approach passed (`light_feet`, +6) | "Light feet", in the fog she expected to fish them out of the reeds. Mentioned them to Vane for hands off his roster. |
| Skiff, questions passed (`good_questions`, +6) | Most hand the board over and run; this one asked about the road past the bog and listened. Mentioned them to Vane. |
| Skiff, bundle only (`delivered`, +4) | Left the bodkins on the transom without a word. She gave the two-finger salute, "which I don't waste." |
| Skiff, approach failed (`stumbled`, +2) | The loud root. She nearly put an arrow through them and lets it go. |
| Skiff, questions failed (`brushed_off`, +2) | She was short with them that night. No hard feelings. |
| Never reached the skiff | "We've never talked." Knows the face from the gate wall, and remembers if they spared the woman. |
| Scout, regard 12+ | "One of mine" since the dawn trial wire. Told Vane so. |
| Scout, regard 6 to 11 | Quiet feet since the dawn trial. Gave Vane the name. |
| Scout, regard 0 to 5 | Hasn't let her down, hasn't impressed her. Short of better, so gave Vane the name. |
| Scout, regard below 0 | The killed prisoner. "Messy", unchanged. Still hers, and the quietest she had. |

## Voice

Dry, short, practical. Deflects with a small mundane remark, laughs at herself ("I'm told I'm terrible company"), never explains her own reasoning in a tidy sentence, never a maxim. Describes people by what they did, not by who they are. Contractions always.

Examples that work:
- "Shut the trapdoor. I'm cold enough already."
- "Lovely fellow, shouts at clerks."
- "He'd do the decent thing with it, and I'd rather he didn't."
- "I took the other side. I won, if that's any comfort."

Examples that did not and were rewritten: any line that reads as a quotable summary of her philosophy ("That's the whole of the skill", "It's more than I had"), and any run of question-then-paragraph exchanges.

## Relationships

- **Vane:** hired her in year two on her own terms. She keeps what she knows about him to herself.
- **Rank:** one of the three unit heads below Vane, with Varren and Ysolde. No one stands between any of them and Vane, and any of the three could take the company if he fell. She has no formal rank, but she is not beneath the other two.
- **Varren:** works in the same compound; he sends the Vanguard's errands to her skiff in the prologue. No more established.
- **Ysolde:** in the Alderford talk, Kestrel is still sore that Ysolde found the river boom "from a boat with a length of rope" when her scouts walked past it for two days.
- **Voss:** she uses him as cover and wants him not told, "he'd do the decent thing."
- **Skell:** see above. Knows whose casks.
- **The player:** respect is `kestrel_respect`. She likes quiet and people who check before they act.

## Ideas, not built [PROPOSED]

- A Silt-Gate follow-up through the fen casks: she knows which town they come from. This would go through Skell's people.
- A reason the legion at Gryke was hers to leave. What happened to the soldiers she guided who did not come out.
- The father: a survey party means someone drew a map of the fen. Possibly the Empire's, possibly Ysolde's side of the story.

## Open questions

None at the moment. Settled 2026-10-06:
- **Eyes:** dark. The lorebook's "pale moss-green" was changed.
- **Scars:** none. The skiff hub's "scarred face" now reads "weathered face".
- **Age:** past sixty, looks past forty.
- **Silt-Gate sergeants:** she keeps them quiet and does not spend them. The far bank is no better watched than before. Voss notices only that Sergeant Kray, who never noticed him in eleven years, has started saluting him and the men have turned polite, and decides not to ask. The fen casks keep running, which fits "I know whose casks they are, leave that alone."
