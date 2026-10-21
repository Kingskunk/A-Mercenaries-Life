# Flùràlainn, the dryad of the grove (a relationship in the Longshade, BUILT 2026-10-20)

**Built from your answers:** as written, in its own scene `longshade/longshade_dryad.txt`; the night scene is written at the explicit register of Janna's repeat scenes. See the rules entry "Flùràlainn, the Dryad of the Grove".

For you to mark up before anything is built. It follows the model Janna's alcove uses (`alderford/janna_alcove.txt`), so the bond, the weekly evening and the night that unlocks at 20 work the same way. Prose is in the order the player meets it, in the character's own voice; the intimate scene itself is outlined here and drafted only at its edges, in the same register as Janna's and Talia's, and I will write the middle once you have approved the outline. Anything marked *(invented)* is mine. Where I had a question I made a suggestion under it; "your call" means use it.

---

## What I took from you

* **A love interest, like Talia and Janna.** Same bond model, same shape.
* **She lives in the grove.** She is tied to her oak (the quest had her beg for it: "I cannot leave him"). The player goes to her, deep in the Longshade, so each visit costs a walk.
* **The quest decides how warm she begins.** What the player did in the grove (saved the oak or left it to her, killed Dubhar or spared him) and how the war ended (the casualty rate) are already recorded and nothing reads them yet. This is where they matter.

---

## 1. How the bond works *(Janna's model)*

* A bond number, `dryad_bond`, **seeded** the first time the player comes to her after the oak greens.
* **The first visit is worth +3.** After that **one meaningful evening per campaign week is worth +3**, with a small +1 or +3 for the replies in the first conversation.
* **At 20 bond the night unlocks**: once a week, in the evening, under the oak.
* **The night** is a long rest in the grove, with a short boon, as Janna's is. *(The forest has no long rest of its own; this gives it one, only with her.)*

### Where the bond starts *(what the quest did)*

| The oak | Dubhar | Starts at |
|---|---|---|
| The player saved it (`lsf_dryad_friend`) | The player killed him | **10** *(same as Janna)* |
| The player saved it | The player spared him (`lsf_dryad_regard_lost`) | **7** |
| She had to save it herself (`lsf_dryad_busy`) | The player killed him | **6** |
| She had to save it herself | The player spared him | **4** |

*(Question 2. The casualty rate does not change the number; it changes the mood of the first meeting, below.)*

---

## 2. When she opens

**Before the oak greens** *(the same season Dubhar died)*: one short visit, +0 bond. The grove is quiet. *(invented)*

> Flùràlainn sits with her back against the black oak and her palm flat on the bark. She looks up when you come into the ring, and some of the weight goes out of her face. "He is sleeping," she says, and means the tree. "Come back when the year has turned. I think he will have something to show you."

**From the next season on** *(the oak has greened; `lsf_dubhar_death_season` is saved when he dies, and the oak is green whenever the season differs)*: the room's own description changes, and her talk opens.

> New growth has broken through the black bark all up the trunk, bright as new copper, and the low limbs are pricked with buds.

*(The Scorched Grove becomes "The Greening Oak" on the map. The sprites are in the boughs again.)*

---

## 3. The first meeting *(a one-time scene; +3 bond)*

The mood follows how the war ended *(`lsf_sprite_dead_pct`)*. One of three paragraphs, then her welcome.

* **10% gone:** The boughs are loud with small voices again, careful at first and then not careful at all. A few sprites have strung tiny garlands round the oak's roots.
* **20% gone:** There are fewer voices in the boughs than there should be, but they are singing, and a green sprite lands on your shoulder, looks at you, and goes.
* **40% gone:** The grove is quiet. White flowers are laid out in rows at the foot of the oak, each with a small flat stone beside it, and the sprites go about in twos and threes without a sound.

> Flùràlainn comes down off the roots to meet you, and for the first time you see her face without ash or fear on it. "You came," she says. "I was not certain you would." *(If she was too spent to help in the fight, she adds:)* "I was no use to you, that day. I have thought about it every night since." *(If the player spared Dubhar and she was not the one who ended him:)* "You wanted him to leave, and the grove would not allow it. I understand why you asked. I am not certain I would have."

**The player's replies** *(each +1 bond once, in Janna's way; they unlock nothing on their own)*:

* **"How is the oak?"** *(she is glad to be asked)*
* **"How are you?"** *(she is quiet, then honest)*
* **"I wanted to see it for myself."** *(she smiles)*

---

## 4. The weekly evening *(+3 bond)*

Once a week the player can spend an evening with her. Three rotate by the week's number, as Janna's do. Each is one scene and one reply that decides the tone. *(Invented; for you to rewrite.)*

* **The oak.** She tells the player what the oak is to her: planted by someone she will not name, the first thing she woke to. The player can ask whether the sap in her veins and in his is the same thing. She does not answer, and smiles.
* **The two tribes.** The Briarvine and the Thornbranch, what they were to each other, which of the dead she knew by name. The player can offer to carry a message to the survivors, or only listen.
* **The wide world.** She asks what the road is like: what a harbour smells like, how loud a city is. She has never been past the edge of the stream. The player tells her one thing from the road and she asks for another.

Each evening ends with a line about the time they spent and the bond award, and the clock moves forward.

---

## 5. The night *(at 20 bond; once a week, in the evening, outdoors under the oak)*

**The offer** *(she asks, in her way)*:

> The moon has come up over the ring, and the new leaves of the oak catch it. Flùràlainn's palm rests on the bark, and then she lifts it and holds the hand out to you. "Stay," she says. "Not for the grove. For me."

**The player's tone** *(the same three as Janna's, so the system reads the same: `ask`, `want`, `lead`, which only colours her reply afterwards)*:

* **"Are you certain?"** *(ask)*
* **"I want to."** *(want)*
* **"Come here."** *(lead)*

**The scene.** A page in the same register as Janna's repeat scene (warm, sensual, nothing graphic, a fade to the quiet after). It is outdoors under the oak, with moss and the new leaves. *(Middle to be written after you approve the outline.)* The quiet version (the player declines, or only wants to sleep beside her) is a long rest with no boon.

**After:** a morning in the grove.

> You wake with moss under your cheek and the first light coming green through the leaves. Flùràlainn is already awake, sitting with her back against the oak and her feet in the stream. She looks round at you. "The grove slept well," she says. "So did I."

**The boon** *(a long rest resolved, as Janna's is):* **Rooted Calm, +1 CON for 3 days** *(invented; Janna's is +1 WIS; question 4)*. The banner reads as hers: `[Rooted Calm: +1 CON for 3 days | Long Rest Resolved | Hygiene Restored to Clean]`.

---

## 6. Small touches

* **The sprites.** After the oak greens, a sprite lands on the player's shoulder now and then and tells them something small and harmless (a flower that opened, a rumor). It is a line, not a system. *(Question 5.)*
* **Bark.** One line if the player asks him about her. *(Question 5.)* *"The dryad is rooted deeper than I am. She feels the wood as I do, and she does not lie."* *(invented)*
* **Janna and Talia.** Nothing in the game checks the other relationships; no jealousy is written. *(Question 6.)*

---

## What is new

New state: `dryad_bond`, `dryad_bond_seeded`, `dryad_bond_week`, `dryad_bond_award_locked`, `locked_dryad_bond_page_id`, `dryad_first_met`, `dryad_early_seen`, `dryad_intimacy_unlocked`, `dryad_intimacy_tone`, `lsf_dubhar_death_season`. The new scene labels live in the same `longshade/longshade_forest.txt` as the rest of the quest (or in a `longshade_dryad.txt` beside it if you prefer a separate file; question 7). Tests will cover each starting bond, the early visit, the first meeting (all three casualty moods), a weekly evening, the night's unlock at 20, and replay safety.

---

## QUESTIONS

**1. When she opens.** The next season after Dubhar dies (the oak greens a season later, and the first visit opens her). Before that, one short quiet visit. My suggestion: as written. OK?

Your answer: As written is okay for now. 

**2. Where the bond starts.** 10, 7, 6 and 4 by what the player did, with the casualty rate only colouring the mood. Right, or do you want the casualty rate to change the number too?

Your answer: this is fine how you have it. 

**3. The weekly evenings.** The oak, the two tribes, the wide world, rotating weekly. OK, or do you have topics of your own?

Your answer: This is fine. 

**4. The boon.** Rooted Calm, +1 CON for three days. OK, or another stat?

Your answer: This is also okay. 

**5. The small touches.** A sprite message now and then, and one line from Bark. Keep both, or cut one?

Your answer: You can keep both.

**6. Other romances.** Nothing is written about Janna or Talia when the player is with her, and nothing about her when they are with them. OK?

Your answer: Yeah, no jealousy system.

**7. Where the code goes.** A new file beside `longshade_forest.txt` (my suggestion, because that file is already very long), or in the same file?

Your answer: yeah, seperate files, longshade is mostly finished, just this romance to work on, and random forest enconters next.

**8. The scene's tone.** The same register as Janna's repeat scene: warm, sensual, nothing graphic, a fade to the quiet after. OK?

Your answer: As far are I know, they all are a bit graphic, aren't Dyrads Nymphs? Not really a huge fan of fade to blacks, I would rather you lean more on the side of explicit similar to the corve companions. 

**9. Anything else you want added, cut or changed?**

Your answer: Not at the moment.
