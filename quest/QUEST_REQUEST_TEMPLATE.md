# Quest Request Template — A Mercenary's Path

A reusable prompt template for asking an AI (or a collaborator) to design a new quest, side contract, or repeatable job for a specific location. Grew out of a real side-by-side: Crane Three was requested with this framing and shipped with almost no rework; the Rusty Anchor was inherited as a full spec without it and needed a whole review-and-rescale pass afterward (see `RUSTY_ANCHOR_PLAN.md`'s own postmortem). Use this before asking for a new quest; use `QUEST_DESIGN_RULES.md` and `narrative_guidelines.md` while actually writing one.

---

## The template

```
Design a quest for [specific location — a POI, or "somewhere in District X"].
I want [scale] — e.g. "down to earth, nothing faction-altering" or "this is a
big one, touching all three factions." It should be [one-shot narrative /
repeatable job]. Ground it in:

1. NPC Agency & Motivation — why this NPC, why me specifically, are they
   acting in self-preservation?
2. Mercenary Logic & Economics — is the risk/reward proportional? Do the
   numbers match our currency scale?
3. Logistical & Physical Realism — time, distance, weather, fatigue,
   physical constraints.
4. Information Integrity — how do I learn what I know? No unearned
   deduction.
5. World Reaction & Friction — guards, witnesses, local politics,
   consequences.
6. Cause & Effect — do outcomes follow logically from my actions?
7. A natural, non-game-like start — no quest markers, no NPC recognizing
   me on sight.

Player is at [chapter/level/power point] — keep stakes appropriate to that;
don't let this outgrow what a quest at that point should be able to touch.
Check what's already established in this location's existing text before
inventing new NPCs or hooks, and reuse existing mechanical systems
(currency_add, resolve_sleep, roll_d20_check, etc.) rather than building new
ones. Pitch me the concept first — don't write the full implementation until
I sign off.
```

---

## Why each piece is there

* **Scale, stated up front.** This is the single highest-leverage line in the whole prompt. The Rusty Anchor was pitched at "Council seats, a decade of city governance" scale with no ceiling given, and needed a full rescale pass later — rewriting the Watch and Scales factor's dialogue, dropping every reputation swing — once it became clear a level-1 recruit's first side job shouldn't carry that much political weight. Naming the scale up front, even just "keep it street-level," heads that off entirely.
* **Repeatable vs. one-shot, stated up front.** Crane Three needed genuine combinatorial text variation (familiarity tier × weather × day-of-week × time-of-day, ~670+ combinations from ~40 lines) specifically *because* it's a job the player returns to dozens of times. A one-shot quest like the Anchor doesn't need that density — writing it in anyway is wasted effort; leaving it out of a repeatable job reads as tedious fast. Decide which one it is before writing, not after a player complains the NPC says the same thing every morning.
* **"Check what's already established" first.** The actual hook for Crane Three was a line Dockmaster Voss already spoke — "talk to the gang-boss by crane three" — that had been sitting unused in the code the whole time. That's what made the quest feel organic instead of bolted on. An AI (or a writer) that doesn't go looking for that first will default to inventing a new quest-giver from nothing, which is exactly what Rule 1 of `QUEST_DESIGN_RULES.md` (organic discovery) is trying to prevent.
* **"Reuse existing systems."** Two real examples from one project: correctly reusing `resolve_sleep` for the Anchor's loft instead of hand-rolling a bespoke rest mechanic, and correctly *not* reusing the Gilded Scales' Letter of Credit system for Big Sal's coin-deposit offer, since that would have mechanically implied she's part of a faction her whole character is built around being independent from. Point the AI at the currency/sleep/combat/dialogue primitives that already exist before it writes new ones.
* **"Pitch first."** Every piece of content that shipped clean this project went through a concept pitch before any ChoiceScript got written — Crane Three, the sleep-quality tier system. The one time a fully-written spec got inherited without that step (the Rusty Anchor), it needed a full review pass afterward to catch a gating bug, missing payouts, a table/code mismatch, and the scale problem above. A pitch is cheap to redirect; 800 lines of finished ChoiceScript are not.

---

## A worked comparison

**Weak:** *"Add a quest at the Iron Wharves drydock."*

Nothing here tells the AI the scale, whether it repeats, or what's already in the scene. It'll invent a quest-giver from scratch, probably oversized the same way the Anchor was, and hand back a full implementation with no chance to redirect before a lot of work is already sunk.

**Strong:** *"Design a quest at the Iron Wharves drydock — down to earth, one-shot, not faction-altering. Player just landed in Port Valen, so keep it street-level. Check what's already established about the shipwrights and the foreman before inventing anyone new. Pitch me the concept first."*

Same location, four extra sentences, and every one of them heads off a specific kind of rework this project has actually hit.
