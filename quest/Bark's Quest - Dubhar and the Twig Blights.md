# Finding Dubhar and the fight in the grove (chunk 5, BUILT 2026-10-20)

**Built as answered:** the dryad's pointer finds him outright; the bear counts when healed; the Twig Blights are two (the dryad removes one, the healed bear the other); Poison Spray is a ranged attack roll; no surprise round and no choice at the end of his speech; pack tactics dropped; **the fight cannot be fled** (a new `combat_no_flee` flag); his speech is kept as written. See the rules entry "Dubhar's Fight in the Burning Grove" in GAMEPLAY_MECHANICS_RULES.md.

For you to mark up before anything is built. It covers the part of the story between the oak being saved and Dubhar going down: the dryad's talk about the sprites (which leads the player to the thicket), the search for him, his entrance and his speech, the fight and what the dryad and the bear take out of it, and the two new enemy types the fight needs. **Nothing after he falls is written here** (his last moments, the mercy choice, the clean water, the sprites' second challenge and Bark's fruit are chunk 6). Prose, spoken lines and choices are written out in the order the player meets them. Anything marked *(invented)* is mine. Answer in place under the QUESTIONS at the end; "your call" means use my suggestion.

---

## What I took from you

* **Finding him:** passive Perception 12 gives the sense of being watched (built, on the first arrival); **15 finds him**, with advantage if Bark's quest was taken first (always true by the time the player is here). A friendly dryad can point at the thorn thicket by the water. If he is never found, he never acts and the stream stays poisoned.
* **His side:** Dubhar has a quarterstaff and **Poison Spray**, and three **Twig Blights** (7 HP, vulnerable to fire, pack tactics). Dubhar AC 12, HP 22, quarterstaff 1d6+2. Blights AC 14, claw 1d4+2.
* **A death battle.** For a level 1 character this is allowed to be deadly. A level 2 character can win it. **The helpers decide the odds:** if the player saved the oak, the dryad takes something out of the fight; if the player saved the bear (Room 13), the bear takes something out. Both together can leave the mage alone.
* **The dryad busy** (the oak was saved by her, not the player) means she never has the time to help, so the fight is harder by one or two more enemies.
* **No stopping the sprites before the mage is beaten.** The order is save the oak, fight the mage, then stop the battle.
* **What Dubhar leaves behind** is deferred, as you asked.
* **Needs better description and a monologue** (your note on my first draft): written below.

---

## 1. After the oak is saved: the dryad's talk, and the pointer to the thicket

*(This is the bridge I did not write in chunk 4. It runs once, right after her thanks, and only if the player saved the oak or the dryad did. The player speaks in the prose.)*

> "Why are they fighting?" you ask.
>
> "They are not themselves." Flùràlainn stares at the two swarms wheeling over the clearing. "The Briarvine and the Thornbranch. For years I stood between them, and they listened. Then something changed, and now each would burn the grove if it meant the other could not have it. They drink from the stream and they get worse. Greed, and nothing else, as if all that was left of them was wanting."

**If the player knows the pool is poisoned** (`lsf_corruption_found`):

> "The water is poisoned," you tell her. "I've seen what it does."
>
> She goes very still. "Poisoned. By whom?" You shake your head, and her eyes slide to the thicket of briar where the stream bends, and back to you. "Someone has been in my grove, and I did not feel them. That should not be possible."

*(Sets `lsf_dryad_hint`: she has pointed at the thicket. A dryad who was too busy to help (`lsf_dryad_busy`) still says all of this; she is spent, not unfriendly.)*

**If the player does not know:** she only says the first part, and the second line (the water, the thicket) is not said.

*(This costs 2 minutes on the grove clock. After it, the menu in Room 15 gets one new option: the search below.)*

---

## 2. Finding him

**The option** *(after the oak is saved; one try costs 5 minutes on the grove clock):*

* **Look for whoever has been in the grove. [~5 min] [Perception DC 15]**  *(advantage, because the quest was taken)*

**If the dryad has pointed at the thicket** (`lsf_dryad_hint`): the option reads **"Go to the thicket where she pointed. [~5 min]"** and needs **no roll**: the player walks straight to it. *(Question 1.)*

**On a miss:**

> You turn slowly, studying the ring of trees, the stream bank and the black oak. The grove gives back nothing but ash and ringing.

*(The player can try again, and each try adds its 5 minutes to the clock, which makes the sprites harder to stop later: this is the cost of dithering.)*

**On a pass (or on arriving at the thicket), by day:**

> Between the stream and the ring of trees a stand of briar grows head-high, thick with thorns as long as your finger. A shape in the middle of it has not moved since you came in. It is not part of the briar. It is a man in a grey cloak, crouched so still that his hood had looked like a stone.
>
> He stands up unhurried, as if you had knocked at his door at a bad hour. He is lean, with a long face gone grey at the temples and ink on his fingertips, and he holds a quarterstaff wrapped at the grip in strips of bark. At his feet the ground shifts. Three small shapes of twig and bramble uncurl from the leaf litter and stand, each no taller than a dog, with knuckles of knotted wood where their hands should be.

**By night** *(the oak's embers give a low red light, or the player's torch)*: the same, with the shape picked out by a low red glow on the cloak and the three small shapes lifting out of the dark one at a time.

---

## 3. His speech *(invented, for you to rewrite)*

> "You," he says mildly, as if you were a small inconvenience. "I do wish you hadn't."
>
> He lays one ink-stained hand flat on the staff. "I did try the quiet way, you know. I asked the Briarvine whose ground this was, and they said theirs. I asked the Thornbranch, and they said theirs. I asked the lady of the oak." A glance toward Flùràlainn, courteous and brief. "Hers, of course. Everyone here owns it, and no one will sell. So I gave the water something to say, and now they all say the same thing."
>
> "Which is?" you ask.
>
> "More." The corners of his mouth lift. "It is remarkable how little a creature needs to want, once you've taken everything else away. A week more and the whole wood would have been drinking from my hand. You've been very thorough. You've also been very tiresome."

*(No roll. Nothing he says changes the outcome. It does not explain what he wanted the grove for, which is the question you deferred.)*

**The player's choice at the end of the speech** *(the only choice here; Question 5):*

* **Strike him before he is done.** *(the player moves first in round 1)*
* **Let him finish.** *(he adds one more line, "Very well," taps the staff on the ground, and the fight starts normally)*

---

## 4. The fight

**The setup, by who helps** *(printed right after the speech and before round 1; each helper has her own lines)*

* **The dryad helped** (the player saved the oak, `lsf_dryad_friend`): *Flùràlainn steps up beside you with both hands raised. The ground bursts at the feet of two of the three twig shapes and roots haul them down, thrashing, until the leaf litter closes over them.* **Removes two Twig Blights.**
* **The bear helped** (Question 2: the bear was saved): *A roar comes down the trail, and then the crash of something heavy through the brush. A brown bear bursts into the grove at a run and takes the nearest twig shape in her jaws, shaking it apart.* **Removes one Twig Blight.**
* **Neither:** all three blights fight.
* **Both:** only Dubhar.

| Dryad helped | Bear helped | Twig Blights in the fight |
|---|---|---|
| yes | yes | 0 (the mage alone) |
| yes | no | 1 |
| no | yes | 2 |
| no | no | 3 |

*(Question 3: is that the split you meant, two from the dryad and one from the bear?)*

**The enemies** *(two new library types, the first two with their own names, as the library asks)*

* **Dubhar** *(a caster type, `hedge_mage`)*: AC 12, HP 22. **Poison Spray** is his main attack: ranged, 1d12 poison, an ordinary attack roll against the player's AC (the engine has no save-based attacks for enemies, so I would not invent one for a single fight; Question 4). He fights from behind the blights at Mid-Range and Long. When the player gets close, he falls back on the **quarterstaff**, 1d6+2, using the same sidearm machinery the archers have. He retreats from melee when he can.
* **Twig Blight** *(a plant creature, `twig_blight`)*: AC 14, HP 7, claw 1d4+2 slashing. **Vulnerable to fire** (double fire damage; Control Flames' spread and Alchemist's Fire catch the whole pack at once, and a burning blight dies in a turn or two). **Pack tactics:** a blight attacks with advantage while two or more blights are alive. *(Question 6.)*

**Where they start:** the blights at Close, Dubhar at Mid-Range. The player starts at Mid-Range from the thicket.

**Running away:** "Break off and run" works as in any fight. The fight is over, and Dubhar and any blights still alive are still in the thicket when the player comes back. Dubhar's wounds are healed (a mage rested; Question 7).

**If the player is beaten:** the usual death scene. *(You said this is a death battle.)*

**The fight ends when Dubhar goes down.** The blights lose their strength then (the twig shapes fall apart) and the fight is over. **What the player sees at that moment, and everything after, is chunk 6 and is not written.**

---

## 5. What is saved after this chunk

New state: `lsf_dubhar_found` (the player reached the thicket), `lsf_dryad_hint` (she pointed), `lsf_dubhar_speech_done`, `lsf_dubhar_fight_started`, `lsf_blights_left` (how many came into the fight), `lsf_dubhar_down` (he was beaten). `lsf_corruption_cleared` is **not** set here: it is set in chunk 6, when he dies.

Not built, on purpose: what happens when he goes down (his last words, the mercy choice, the dryad finishing him), the poison going out of the water, the sprites' second challenge, Bark's fruit, and what Dubhar leaves behind.

---

## QUESTIONS

**1. The dryad's pointer.** If the player has told her the water is poisoned, she points at the thicket. Should that find him outright (no roll), or only give the Perception check advantage (which the player already has) and still need the DC 15 roll? My suggestion: it finds him outright, since she is the one who feels the grove.

Your answer: Your suggestion

**2. The bear.** "Saved the bear" is which one: the sick bear in the Root Hollow **healed** (`lsf_bear_healed`), her **cub freed** (`lsf_cub_freed`), or either? My suggestion: healed, because then she is the player's debt-holder and comes to help.

Your answer: healed

**3. How many blights each helper removes.** I wrote two from the dryad and one from the bear, so that both together leave the mage alone and neither leaves all three. You said "one or two extra enemies" when the dryad is busy; the table above gives two or three. Is that right, or do you want one extra enemy at the least?

Your answer: We have have two, one gets removed by the dryad, another by the bear.

**4. Poison Spray.** An ordinary ranged attack roll against the player's armor, 1d12 poison, rather than a Constitution save. The save version needs a new enemy-save mechanic for one fight. Is the attack roll acceptable?

Your answer: Yeah, that's right.

**5. The player's first move.** Should striking him before the end of his speech give the player the first move in round 1 (a surprise round), with "let him finish" as the plain start? Or no difference, and no choice at all?

Your answer: No difference, just normal.

**6. Pack tactics.** Advantage on a blight's attack while two or more blights are alive. This needs a small new rule (enemy attacks have no advantage source yet). OK, or drop pack tactics and make each blight a little tougher instead?

Your answer: We can drop the pack tactics.

**7. Running away.** If the player breaks off and leaves, Dubhar is back at full health when they return (my suggestion, so the fight cannot be won in installments). Or he stays wounded?

Your answer: Are there options to disable flee mechanics for fights? Can we disable flee for this.

**8. His speech.** Wording, the motive it hints at (wanting the grove for himself, taking it by making everyone want), and his manner (mild and patient). Keep, change or rewrite?

Your answer: We can keep it, I'll make edits to it after if needed.

**9. Anything else you want added, cut or changed?**

Your answer: No.
