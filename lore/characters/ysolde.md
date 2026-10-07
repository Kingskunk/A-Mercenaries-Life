# Ysolde Ostrand

Handler of the Cadre, the Iron Carrion's small company of gifted recruits. Port Valen patrician by birth, former officer of the Empire's waterways service, and now the company's best hand with a lead line, a pointer and a column of figures. Exact, dry, unsentimental, and quietly protective of the people she counts.

Everything below comes from the game as it stands. Nothing about her life has been invented for this file, except where a line is tagged [PROPOSED]. Her backstory was written in an earlier session; this session only added the Rotten Rib job and her place in the compound.

## In the game now [GAME]

**Appearance:** an older woman with dark hair streaked iron-grey, pulled back in severe braids around two small polished obsidian ram horns (the lorebook calls it "subtle marks of infernal bloodline"). Pale mercury-silver eyes. Silver-framed spectacles she only wears over chart tables. A physician's leather satchel of scrolls and glass vials. Steady hands. An ink-stained travelling coat in the field, an immaculate woolen tunic in camp.

**Manner:** quiet enough that you have to lean in. Says "perils of the river" as an oath. Rations the Cadre's spells because "they cost the caster": a spell worked under arrow fire runs through the caster's own nerves, fingers seize if it is held too long, and a heart can quit in the mud. Praise is a dry nod or an errand of trust. Calls a low-regard player "Hands" (until `ysolde_respect` 10).

**Where the player sees her:**
- Camp: the Cadre's bivouac near the baggage wagons, sorting sulfur and marsh-salts. Four hundred soldiers avoid her, thumbs pressed to their brows against ill luck.
- Dawn trial (`dawn_trial.txt`): sets the Cadre recruits a working to show. `ysolde_respect` +8 to +2 depending on how the player approaches it.
- Black Sinks (`battle_black_sinks.txt`): at the prisoner, kill is `ysolde_respect` -5 ("a bad price"), spare is +6; bivouac scene at the wagon (+6 or +2, or +4 for an errand).
- Alderford (`alderford.txt`, `visit_cadre_pavilion`): spreads the river charts and shows the player the blank stretch two hundred yards below the weir: an imperial anti-galley boom that will catch the lead barge and put four hundred people in the river. The garrison took the plans, "so I have thirty years of guesswork and a flooded stone chamber." Sends one of hers, and picks the player. `alder_river_chain_cleared` is the payoff.
- Port Valen compound: the Cadre's corner under the contract office. Runs the Cadre's drill on the square in the morning, and is in her workroom (`pv_poi_workroom`) after drill.
- Vane's summons: "Contract audits or arcane counsel, go to her workroom." The Rotten Rib job begins and ends with her.

**Fixed in the lorebook (`lorebook-data.js`, "ysolde"):**
- The Cadre's handler. Keeps the company's handful of gifted recruits "the way other sergeants keep count of rations: exactly, constantly, and with no intention of running short." Six or seven at a time against four hundred soldiers.
- `alder_river_chain_cleared`: staked four barges on her depth readings and one person in the dark until the gorge was clear.
- `visited_bivouac_ysolde`: sorted sulfur and marsh-salts by hand; clumsy thumbs earned an order to leave the crate alone.
- `pv_workroom_seen`: a workroom at the back of the timber headquarters, the Grey River charted on both walls from the weir to the bay, and a shelf of notebooks, one for each year since she began drawing the river.
- `ysolde_waterways_told` (regard 10): she drew the river below the weir from a small boat in the Empire's waterways service, three summers with a weighted line. Twenty-four when the garrison left. She watched a cart of its plans go down the causeway. The oldest charts on her wall are her copies of the Empire's.
- `ysolde_ostrand_told` (regard 25, after the first): she is of House Ostrand. The house set its insurance prices from her river charts for eight years after the Empire left. She wanted them posted on the customs tower where any skipper could read them; the house kept them locked away. She took Captain Vane's written terms instead and keeps the family signet face-down on her table.

**Lines the player can hear (workroom, `port_valen.txt`):**
- The stove burns "eleven pounds of coal a day. Ten and a half. I weigh it."
- The charts: "If you've seen a shallow I haven't, bring me a number. 'About' I can get from any bargeman."
- Signet talk: the house insures ships. "Never insure a danger you can't measure, and never share a measurement you can sell." She thought that was wrong. "If a thing's free to everybody, nobody will pay you for it." Vane "puts his terms in writing and he pays on the day. Twenty-two years of it now."
- A boy of eleven called the numbers on the boat, and "never got one wrong."
- When she swears, it is "perils of the river," from the house's insurance papers: what they write when a ship is lost and nobody is to blame, so nobody pays.

**Rotten Rib (converted 2026-10-06):** she is the one who notices the company's timber and forage orders are held. She wants the factor's stamped waybill with its seal whole. Regard +5 on turn-in either way, five silver only if the oak went back to Brant. See `quest/QUESTS.md` (Quest 3).

## Her life, as it can be worked out [GAME, computed]

- **Charting:** at eighteen to twenty-four, three summers drawing the Grey River below the weir from a small boat for the Empire's waterways service.
- **The garrison leaves:** thirty years ago (the Alderford scene says "thirty years of guesswork"). She was twenty-four and watched the plans leave in a cart.
- **House Ostrand:** for eight years after, the house's insurance prices ran on her charts. She argued for posting them and was refused.
- **Vane:** twenty-two years ago, at about thirty-two, she took his written terms and left. So she is about fifty-four, and she joined the company in about its ninth year (Vane raised it thirty years ago; Kestrel joined in the second).
- **Why Vane wanted her:** the Black Sinks bivouac gossip says "Vane hired her for her count before her craft": she keeps the Cadre's rations, vials and names "to the grain."

## Deliberately unwritten [AGREED]

From the comment above her workroom in `port_valen.txt`: her niece or nephew in the house, who runs it now, and whether the house knows where she is, are NOT written. They wait for a quest. Do not build flags or items for them before that quest exists.

## Reveal ladder

1. First meeting: the dawn trial for Cadre players, the bivouac wagon or the Alderford pavilion for the rest. Manner and the cost of spells.
2. Workroom, first visit: "Ysolde Ostrand, handler of the Cadre." The charts.
3. Workroom, regard 10: the waterways service and the garrison cart.
4. Workroom, regard 25, after the first: House Ostrand and the signet.
5. Rotten Rib: the briefing and the waybill. Regard +5.
6. **Not written:** the house today. Whoever runs it, what it knows. Waits for a quest.

Thresholds to check before relying on them: the regard sources are the dawn trial (Cadre only, up to +8), the prisoner (Cadre only, +6), the bivouac wagon (up to +6), the Alderford boom (up to +4 and smaller), and the Rotten Rib (+5). Whether a non-Cadre player can reach 10, and any player 25, has not been computed.

## Voice

Crisp, exact, a little aristocratic, never loud. Contractions always. She states figures to the pound and weighs things aloud ("Ten and a half. I weigh it"). Talks in risk and price. Mentions a job mid-sentence and goes back to what she was doing. Dry rather than warm: "I'd call that a bad price." Never a speech. Her softness shows as small practical acts (a ruler passed, "the door shut properly"), not statements.

Examples that work:
- "Shut the door. That stove burns eleven pounds of coal a day. Ten and a half. I weigh it."
- "'About' I can get from any bargeman."
- "You've spent a person and bought nothing with her. I'd call that a bad price."
- "Ruler. By your elbow, there. Thanks."

## Relationships

- **Vane:** hired her on written terms, twenty-two years ago. Pays on the day. Trusted with "contract audits and arcane counsel."
- **House Ostrand:** her birth house. The signet lies face-down on her table. She does not use it.
- **Rank:** one of the three unit heads below Vane, with Varren and Kestrel, and any of them could take the company if he fell.
- **The Cadre:** hers to count. Six or seven gifted recruits, avoided by the rest of the company.
- **Kestrel:** in Kestrel's own words she is still sore that Ysolde found the river boom "from a boat with a length of rope" when her scouts walked past it for two days. No more established.
- **Varren:** no direct line. Both reach the player through Vane's handoff.
- **The player:** `ysolde_respect`. She likes steady hands and exact numbers.

## Ideas, not built [PROPOSED]

- The house's present head, who could be a niece or nephew who reached out. A letter, a message through the Weigh House, a favor asked. Nothing built.
- A reason the house would want her back now: the charts she drew are still the best on the Grey River.
- Vantry's salt moving on Ostrand-insured hulls: the two houses sit on the same quay, so a Vantry salt job could land on an Ostrand policy.
- The Empire's lost boom plans, or the garrison's cart. Where it went.

## Open questions

- Player-facing typos: the lorebook line for `ysolde_ostrand_told` in `lorebook-data.js` reads "a Merchant Lord house the belongs to the Guilded Scales." That should be "that belongs to the Gilded Scales." Not changed yet.
- Age: about fifty-four from the dates above. The lorebook says "older woman" and nothing else. Confirm.
- The boy who called the numbers, aged eleven, is not named. He would be in his forties now. The user wants to hook into him later (decided 2026-10-06); nothing is built.
- Whether the Rotten Rib timber link to Hendryk and the Gilded Scales should ever reach her house's insurance, since House Ostrand insures hulls.
