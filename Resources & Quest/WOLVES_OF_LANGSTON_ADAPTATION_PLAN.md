# The Wolves of Langston - Personal Adaptation Plan

## Scope

This is a private, personal-use adaptation of *The Wolves of Langston: Second Edition* for *A Mercenary's Path*. Source narration, dialogue, physical reactions, and scene order are preserved by default. Text changes are limited to what this game's world, religion, economy, mechanics, continuity, or ChoiceScript branching actually require.

The adaptation is implemented one complete chapter at a time. A chapter is not considered built until its scene compiles and its important success, failure, refusal, refresh, and re-entry routes have been replayed.

## Chapter Files

1. `wolves_of_langston_chapter_1.txt` - **The Adventure Begins**: road encounter, Roi's intervention, funeral, first suspect impressions, paid rest, and Mayor Anathram's contract.
2. `wolves_of_langston_chapter_2.txt` - **Speaking to Tomlin**: in progress. The magical warning, cottage approach, and doorstep encounter are playable; the interview, tea, and garden investigation remain.
3. `chapter_3.txt` - **Speaking to Roi**: not started.
4. `chapter_4.txt` - **Helping Mayor Anathram**: not started.
5. `chapter_5.txt` - **Speaking with Solaine**: not started.
6. `chapter_6.txt` - **The Accusation**: not started.
7. `epilogue.txt` - not started.

The ChoiceScript source directory is `web/mygame/scenes/Langston/`.

## Chapter 1 Adaptation Contract

Chapter 1 preserves the source scenes, details, and wording except where adaptation is required:

- Langston is introduced as a prosperous walled town in House Gault's mostly level Western Vale, among open grassland and fertile fields with the region's old forest along the southern horizon.
- A wolf pack threatens the protagonist on the approach.
- Roi Sunderhammer intervenes and directs the protagonist to the Pickled Hen.
- The funeral introduces Maybelline, Tomlin, Roi, Solaine, Mayor Tanya Anathram, and Buttercup.
- Optional observations seed suspicions about Tomlin's relationships, Roi's involuntary change, Solaine's hymn and familiarity with Tomlin, and Anathram's past and trained dog.
- The funeral ends with the mayor's request, not a hiring: she names no day and tells the protagonist to ask the aide for her at Langston Hall. There is no forced sleep and no free room. The protagonist is returned to the town square and rests wherever they choose, at their own cost.
- The mayor receives in her office during the Hall's public day (the same hours as the counters: Morning to Afternoon, shut on the rest day and in empty-street weather). The Hall's menu lists her door at every hour and says why it is shut. The briefing and the offer happen when the player walks in, whether that is the same evening or a week later.
- The contract is verbal, as at Whitefold: Anathram states the terms aloud (15 Silver Marks on the threat's end or the killer in custody, a 2-mark advance counted against it, the Pickled Hen room and two meals at the town's cost), the protagonist repeats them, they shake on it, and she writes one line in the Hall's day-book. Nothing is posted on the Contract Board. The room, meals and advance begin at that handshake.
- The Dev Hub (Quests) has a jump for the stage after the funeral: Langston's square on a clear market morning with the mayor having asked.
- Accepting the contract makes Tomlin the first lead, returns the player to Langston's hub, and adds a daytime cottage visit rather than forcing the Chapter 2 opening immediately.

The adaptation deliberately improves the original structure:

- The road encounter offers physical, social/animal, and perceptive approaches instead of a single compulsory perception roll.
- A failed road check has a later consequence: the protagonist carries disadvantage into the confrontation at the funeral.
- The funeral confrontation allows persuasion, intimidation, or deliberate de-escalation.
- The opening uses the reusable `western_vale_road` day/night scenery pair: a maintained chalk-and-earth wagon road across open Gault grassland, with no Langston-specific landmarks. Wolves use the hedgerows and field margins rather than an enclosing forest.
- A protagonist who owns a Contractor's Insignia presents it when identifying themselves as a mercenary available for hire. Anathram verifies the name and rank with a grey seal-stone; a protagonist without one identifies themselves verbally, so the quest remains accessible.
- The source's three Inspiration awards become replay-safe Heroic Inspiration: observing through the inn window, successfully calming the drunk, and successfully making him back down.
- Every funeral observation can be declined instead of forcing the protagonist to investigate grieving people.
- Failed observation checks do not reveal the clue.
- Declining the contract does not expel the protagonist from town or permanently end the quest. The offer remains at the meeting hall.
- The Church of the True Sun replaces the PDF's incompatible religious organization.
- The Battle of Iron Gap replaces the source's Battle of Three Rivers. Anathram presents it as a defense of House Gault's people, while a successful History check recalls that Gault's riders crossed into Stenmark first to break Karr's tollhold.
- The original 320-gold reward is rescaled to 15 Silver Marks plus an ordinary room and meals. Two Silver Marks are paid as an advance and count against the total.

## Chapter 1 Source-Fidelity Audit

All 48 numbered Chapter 1 sections in `Resources & Quest/Wolves_of_Langston` were checked against the playable scene on 2026-10-29. The audit restored the distinct stand-and-fight and run-for-town versions of Roi's intervention, Solaine's complete street exchange, the full window-observation route, source-supported success and failure clues, Anathram's first appraisal of the protagonist, Tomlin's post-funeral introduction, and the general-store supply arrangement.

The remaining differences are deliberate: refusing the contract leaves a reversible offer instead of ending the adventure through expulsion, and the Church, checks, reward scale, rest handling, and general-store access follow *A Mercenary's Path* systems. The source's Inspiration awards use this game's Heroic Inspiration system.

## Chapter 1 State

- `wol_quest_stage`: `unstarted`, `asked` (the mayor asked the protagonist to call at her office), `offered` (briefed, declined for now), `active`, and later resolution states. The quest log lists the quest from `asked` onward.
- `wol_chapter`: `0` before entry, `1` during the opening, and `2` after accepting the contract.
- `wol_chapter_1_started`, `wol_chapter_1_complete`, and `wol_advance_paid`: replay and re-entry guards.
- `wol_funeral_day` and `wol_contract_day`: timestamps for time-aware Chapter 2 narration; later scenes must not assume the player visits Tomlin the next day.
- `wol_road_approach`, `wol_road_composed`, `wol_road_rattled`, and `wol_funeral_drunk_outcome`: route memory.
- `wol_met_*`: name and relationship discovery.
- Individual clue flags: `wol_tomlin_*`, `wol_roi_*`, `wol_solaine_*`, and `wol_mayor_*`.

Clue totals must always be derived from those flags. They must never be incremented as permanent counters.

## Langston Town Hub

- `web/mygame/scenes/Langston/langston.txt` owns Langston's reusable town-level view, first and repeat arrival prose, weather and street-life layers, and road exit.
- `langston_seen` keeps the full fixed town description from repeating; `langston_arrival_seen` keeps the long Western Vale road arrival from repeating.
- The hub exposes the Pickled Hen through its separate `Langston/pickled_hen.txt` scene. Shops, the chapel, civic buildings, and quest destinations remain unconnected until their own files are built.
- The Pickled Hen provides ordinary paid meals and 24-hour private rooms. While the Wolves contract is active, Anathram's room-and-board agreement covers the protagonist's room and the two ordinary meals.
- Harlan Vetch is the Pickled Hen's aproned, balding innkeeper. The inn introduces him on an early visit; otherwise Anathram identifies him as Master Vetch while arranging the investigator's room in Chapter 1.
- Langston's future general store is named **The Cord & Kettle**. It does not have a scene or hub connection yet.
- Western Vale trade is distinguished by fibre hemp, wool, wine and horses rather than staple crops common throughout the setting's farming settlements.
- Langston is overworld tile `lg` (Western Vale Road `wv` joins it to Fellgate, 8 miles each way). The map card's "Go into Langston." enters at `lg_arrive`, and the road exit sets `ow_pos` to `lg`.

## Deferred Until the World Hook Is Chosen

- Langston's exact map location and travel route.
- The trigger that offers the journey to Langston.
- Langston Lorebook and NPC entries.
- A general store, remaining local town destinations, and post-quest state.
- Final payment, level-progress credit, unique rewards, accusation outcomes, and aftermath.
- Whether Langston remains the settlement's final name.
