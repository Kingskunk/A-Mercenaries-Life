---
trigger: always_on
---

# The Carrion Company — Narrative Guidelines

## 1. Strict Subjective POV (Zero Omniscient Leaks)
* **Second-Person Subjective Anchor ("You"):** Narration is strictly limited to what the protagonist directly sees, hears, smells, feels, or recalls from his selected background.
* **No Authorial Knowledge:** Never name a distant location, enemy plan, faction title, or officer's secret past in the prose unless an NPC speaks it, a scout reports it, or the protagonist reads/observes it in-universe.
* **No Telepathic NPC Insight:** Never state what an NPC is thinking or feeling in omniscient terms. Describe only their physical tells—voice pitch, posture, clenched jaws, avoidance of eye contact, or nervous habits.
* **Progressive Codex Discovery:** Factions, locations, and historical lore stay locked (`[??? UNDISCOVERED]`) until an in-world dialogue or event organically reveals them.

## 2. Ability-Specific Description (No Generic Combat Text)
* **Name the Thing, Not the Category:** When a cantrip, spell, weapon attack, or class feature resolves, the prose must describe *that specific ability* — never a generic stand-in like "you use your magic" or "you attack." Eldritch Blast should look, sound, and feel different from Fire Bolt or a rapier thrust.
* **Every Option Gets Its Own Text:** If a `*choice` offers multiple abilities to use in the same moment, each branch needs its own success/failure description tied to that ability's flavor — not a shared template with the ability name swapped in.
* **Dice Announcements Are Flavor Too:** The check label shown to the player (e.g. "Eldritch Blast" not "Eldritch Working") should match the in-fiction name of what's happening, not an abstracted mechanic name.

## 3. Squad Presence (Show the Unit, Not Just the Protagonist)
* **The Squad Acts Collectively:** In any scene where the protagonist fights or works alongside their assigned squad (Vanguard/Scout Company/Cadre), the prose must show other squad members doing their job in parallel — landing hits, casting spells, giving cover — not just the protagonist acting in a vacuum with allies as silent scenery.
* **Named NPCs Perform Their Role:** If a commanding or specialist NPC is present for an event, something in the text should reflect their actual specialty in that moment (e.g., an archer officer loosing arrows, an experienced caster weaving visibly stronger magic) rather than just standing nearby.
* **Match Squad Concept to Squad Action:** If a squad is defined by a role (Scout Company = ranged/mobility), scenes involving that squad need at least one beat that actually exercises that role. Don't build a squad identity in setup text and then never pay it off in the scene.

## 4. Continuity Discipline (No Invented Callbacks)
* **Never Reference an Event That Didn't Happen:** Lines like "just as X promised" or "exactly like Y warned you" must trace back to real prior text — an actual line of dialogue or a described event earlier in the game. If no such moment exists, write it as a generic beat ("as the plan called for") instead of inventing a false callback.
* **Check Cross-Squad/Cross-NPC References:** A character who never appears in a given squad's path should not be name-dropped as if they'd interacted with the player there.
* **When Renaming or Reworking a Character, Sweep for Old References:** Name collisions or leftover mentions of a cut/renamed character should be grepped for across all scene files before considering a change complete.

## 5. Choice Design (Three Real Options, No Hidden Traps)
* **Three Is the Standard:** Meaningful choices should offer three genuine options, not two. A two-option choice is a design smell; a single unconditional option is a bug unless it's deliberate (a class-determining trial, a settings toggle, or a `[Return to X]` nav link).
* **New Options Must Be Real, Not Filler:** A third option added to satisfy this rule needs its own distinct flavor, mechanic, and consequence — reusing a stat or reward wholesale from an existing option defeats the purpose.
* **Watch for Hidden Stat Traps:** When multiple options resolve via different ability checks at the same nominal difficulty, verify they're actually comparable for the origins that can pick them (a DEX check at DC 13 is not equivalent to a STR check at DC 13 for an origin with DEX 10 and STR 16). Use `tools/check_balance.js` to catch this empirically rather than assuming symmetry.

## 6. Prose Craft & Vocabulary Discipline
* **Vary Vocabulary Across Adjacent Text:** Outside of proper nouns, class/race terms, and established mechanic names, check general descriptive vocabulary (verbs, adjectives, sensory words) against the current scene and the previous one or two scenes. AI writing reflexively repeats the same words across nearby passages — if a distinctive word or turn of phrase was just used, pick a different one.
* **Substance Over Spice:** Avoid purple prose. Ground scenes in physical sensation — weather, terrain, weight of gear, exhaustion, cold — so the player inhabits the moment rather than reading a description of it from outside.
* **Trust What's Shown:** Don't restate in narration what an action or line of dialogue already made clear. If a beat needs a gloss afterward to land, the fix belongs in the setup, not in an explanatory sentence tacked on after.

## 7. Natural Dialogue & Distinct NPC Voice
* **Imperfect, Not Clinical:** NPC dialogue should sound like a person talking, not a script — fragments, contractions, implication instead of spelled-out exposition. Avoid dialogue where a character explains information both speakers would already know, purely for the player's benefit.
* **Each NPC Has a Register:** Recurring NPCs should each read as a distinct person — word choice, sentence length, what they choose to say versus imply. Before writing a line for a recurring NPC, ask whether it sounds like *them* specifically or could be swapped into any other character's mouth unchanged.

## 8. Avoid AI Prose Tics
* **Earn Silence, Don't Default to It:** Before writing that a character "says nothing" or answers "without a word," write what they actually do or say instead. Described silence is a cop-out unless it's a deliberate, rare beat for a specific character.
* **Frame Actions Positively:** Avoid defining a character's behavior by what they don't do ("he doesn't ask why," "she doesn't look up"). Write the affirmative action or decision instead. The same tic shows up as "Not X. Just Y." sentence fragments — write the direct statement instead of defining it by negation.
* **Skip Standalone One-Word Replies:** "Yeah," "Right," "Good," and similar one-word answers used as a complete response are filler dressed as an emotional beat. Ask what the character actually wants to say and write that.
* **Avoid Borrowed-Comparison Shorthand:** Constructions like "the way he always does" or "the kind of quiet that..." outsource specificity to a vague category instead of stating the direct, concrete detail.
* **Cut Filler Processing Gestures:** Lines like "he files it away" or "let that settle" mark that information landed without showing what the character does with it. If nothing follows, cut it; if something does (a decision, a shift in plan), write that instead.

## 9. Surface Interior Reasoning on Meaningful Choices
* When the protagonist makes a meaningful decision in narration — sparing an enemy, picking one tactic over another, trusting or doubting an NPC — the prose should carry the specific reason, not just the outcome. A character who acts without visible reasoning reads as a plot device rather than a person making a choice in this specific moment.

## 10. Describe NPCs on Introduction
* The first time a named NPC appears on the page, give a concrete physical description — build, face, clothing, and anything visibly telling (scars, gear, bearing). This prevents the "faceless commander" problem and anchors the character immediately.

## 11. Don't Over-Explain Established Mechanics
* Once a racial trait, class feature, or mechanic has been established (in the codex, or from an earlier scene), later uses shouldn't re-explain how or why it works. Show the action and trust the player to already know it. Reserve an explicit explanation for: the first time something is established, a moment where it fails or meets friction, or a beat where it specifically changes what the player learns.

## 12. Action Economy in Choices (Combat vs. Exploration)
* **In Combat (Turn/Action Cost):** High-stakes combat beats must treat casting or tactical abilities as dedicated choice slots/actions in initiative order (e.g. casting a cantrip or spell is a full choice). You cannot swing a melee weapon and cast an action cantrip simultaneously without a specific class feature.
* **Outside Combat (Exploration/Downtime At-Will Prep):** Cantrips are at-will. In exploration, downtime, and investigation hubs, offer a preparatory pre-cast choice (e.g. `[Cantrip: Guidance]`) allowing the player to freely choose which subsequent skill check or dialogue option receives their magical focus.

## 13. ChoiceScript Code Discipline & State Hygiene
* **No Nested Multireplaces:** ChoiceScript's parser fails on nested multireplaces (`@{var1 @{var2 ...|...}|...}`). For dynamic stat hints based on multiple conditions, always compute them into `*temp` strings (e.g. `${hint_text}`) before the `*choice` block.
* **Engine State Hygiene:** Every temporary roll modifier (`advantage`, `disadvantage`, `guidance_active`) must automatically reset to `false` inside the engine subroutine (`roll_d20_check`) upon return so bonuses never leak across unrelated choices.
* **Full Slot Coverage:** When gating choices by learned spells or cantrips, always check all potential character slots (e.g. `wizard_cantrip`, `wizard_cantrip_2`, `wizard_cantrip_3`) so a player's build choices are never orphaned.

## 14. Grounded Economy & Low-Fantasy Magic Reception
* **Magic Is Rare, Distrusted, and Practical:** Mundane sellswords, officers, and common folk fear what they don't understand. Prose should reflect this: common soldiers eyeing unnatural bloodlines with suspicion, practitioners sitting slightly apart from the main campfire line, and line troops being rattled by sudden eldritch flares.
* **Economic Grit:** Silver marks, iron shillings, and copper coins are scarce and hard-won. Loot must feel tangible and modest (smoked rations, tallow candles, water-damaged ledgers, preserved frontier coins), reinforcing the mercenary reality that every mark counts.

## 15. Mechanics Confined to Brackets, Never in Prose
* **Strict Separation of Stats and Story:** Numbers, dice designations, DCs, and mechanic names belong strictly in `[bracketed stat hints]` or banner cards.
* **Pure In-Universe Narration:** Prose must never mention game mechanics directly (e.g. avoid *"you took 4 damage"* or *"you passed a DC 12 check"*). Ground the result in physical sensation: torn gambesons, bruised ribs, the cold bite of iron, and the sharp relief of a strike landing true.

