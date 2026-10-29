# The Wolves of Langston - Personal Adaptation Plan

## Scope

This is a private, personal-use adaptation of *The Wolves of Langston: Second Edition* for *A Mercenary's Path*. Source narration, dialogue, physical reactions, and scene order are preserved by default. Text changes are limited to what this game's world, religion, economy, mechanics, continuity, or ChoiceScript branching actually require.

The adaptation is implemented one complete chapter at a time. A chapter is not considered built until its scene compiles and its important success, failure, refusal, refresh, and re-entry routes have been replayed.

## Chapter Files

1. `wolves_of_langston_chapter_1.txt` - **The Adventure Begins**: road encounter, Roi's intervention, funeral, first suspect impressions, overnight stay, and Mayor Anathram's contract.
2. `chapter_2.txt` - **Speaking to Tomlin**: not started.
3. `chapter_3.txt` - **Speaking to Roi**: not started.
4. `chapter_4.txt` - **Helping Mayor Anathram**: not started.
5. `chapter_5.txt` - **Speaking with Solaine**: not started.
6. `chapter_6.txt` - **The Accusation**: not started.
7. `epilogue.txt` - not started.

The ChoiceScript source directory is `web/mygame/scenes/Langston/`.

## Chapter 1 Adaptation Contract

Chapter 1 preserves the source scenes, details, and wording except where adaptation is required:

- Langston is introduced as a prosperous walled town beside old forest.
- A wolf pack threatens the protagonist on the approach.
- Roi Sunderhammer intervenes and directs the protagonist to the Pickled Hen.
- The funeral introduces Maybelline, Tomlin, Roi, Solaine, Mayor Tanya Anathram, and Buttercup.
- Optional observations seed suspicions about Tomlin's relationships, Roi's involuntary change, Solaine's hymn and familiarity with Tomlin, and Anathram's past and trained dog.
- The mayor provides a room, briefs the protagonist in the morning, and offers the investigation.
- Accepting the contract makes Tomlin the first lead and hands Chapter 2 a clean entry state.

The adaptation deliberately improves the original structure:

- The road encounter offers physical, social/animal, and perceptive approaches instead of a single compulsory perception roll.
- A failed road check has a later consequence: the protagonist carries disadvantage into the confrontation at the funeral.
- The funeral confrontation allows persuasion, intimidation, or deliberate de-escalation.
- The source's three Inspiration awards become replay-safe Heroic Inspiration: observing through the inn window, successfully calming the drunk, and successfully making him back down.
- Every funeral observation can be declined instead of forcing the protagonist to investigate grieving people.
- Failed observation checks do not reveal the clue.
- Declining the contract does not expel the protagonist from town or permanently end the quest. The offer remains at the meeting hall.
- The Church of the True Sun replaces the PDF's incompatible religious organization.
- The original 320-gold reward is rescaled to 15 Silver Marks plus an ordinary room and meals. Two Silver Marks are paid as an advance and count against the total.

## Chapter 1 Source-Fidelity Audit

All 48 numbered Chapter 1 sections in `Resources & Quest/Wolves_of_Langston` were checked against the playable scene on 2026-10-29. The audit restored the distinct stand-and-fight and run-for-town versions of Roi's intervention, Solaine's complete street exchange, the full window-observation route, source-supported success and failure clues, Anathram's first appraisal of the protagonist, Tomlin's post-funeral introduction, and the general-store supply arrangement.

The remaining differences are deliberate: refusing the contract leaves a reversible offer instead of ending the adventure through expulsion, and the Church, checks, reward scale, rest handling, and general-store access follow *A Mercenary's Path* systems. The source's Inspiration awards use this game's Heroic Inspiration system.

## Chapter 1 State

- `wol_quest_stage`: `unstarted`, `offered`, `active`, and later resolution states.
- `wol_chapter`: `0` before entry, `1` during the opening, and `2` after accepting the contract.
- `wol_chapter_1_started`, `wol_chapter_1_complete`, and `wol_advance_paid`: replay and re-entry guards.
- `wol_road_approach`, `wol_road_composed`, `wol_road_rattled`, and `wol_funeral_drunk_outcome`: route memory.
- `wol_met_*`: name and relationship discovery.
- Individual clue flags: `wol_tomlin_*`, `wol_roi_*`, `wol_solaine_*`, and `wol_mayor_*`.

Clue totals must always be derived from those flags. They must never be incremented as permanent counters.

## Deferred Until the World Hook Is Chosen

- Langston's exact map location and travel route.
- The trigger that offers the journey to Langston.
- Langston Lorebook and NPC entries.
- A town hub, general store, repeatable inn, and post-quest state.
- Final payment, level-progress credit, unique rewards, accusation outcomes, and aftermath.
- Whether Langston remains the settlement's final name.
