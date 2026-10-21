# Dubhar's end, the clean water and Bark's fruit (chunk 6, second beat, BUILT 2026-10-20)

**Built from your marked-up version.** Your answers: the prose as edited, any refusal to kill him costs the dryad's +5 and advantage (read as both lost), the fruit is always a trip back to Bark, unused fruit stays in the pack. See the rules entry "Dubhar's End, the Clean Water and Bark's Fruit".

For you to mark up before anything is built. It covers everything after the swarms stop: Dubhar waking and begging, the choice to spare or kill him, what happens to the grove, the poison going out of the forest, and Bark's reward. **Nothing about what Dubhar leaves behind is written** (you set that aside for a later chunk). Prose is in the order the player meets it, in the character's own voice. Anything marked *(invented)* is mine. Answer in place under the QUESTIONS at the end; "your call" means use my suggestion.

---

## What I took from you

* **Order:** save the oak, fight the mage, stop the sprites (built), **then** he comes to his senses. He is unconscious when the war ends (built: his finishing blow is the "beaten senseless" one).
* **He begs for his life:** he will leave and never return.
* **The player chooses: spare him or kill him.**
* **Refusing to kill him does not save him.** If the player spares him, it is a **random toss-up whether the sprites or the dryad kill him** anyway. *(This replaces my older note that only the dryad does it.)*
* **The poison ends with his death, either way** (the rule from before: the water cannot be cleaned while he lives).
* **The casualty rate** from stopping the sprites is only recorded for now, as flavor. It does not change anything here.
* **Already built and waiting on this beat:** setting `lsf_corruption_cleared` is all it takes for Room 9's pool to be plain clean water (drinking it washes Clouded Mind away; the jug can be filled there) and for Bark's turn-in option to appear. I do not need to touch those.
* **Bark's reward** (your earlier answers): five **Heartwood Fruit**, the goodberry icon, **all five at once** at the turn-in, **a new five each season**. Eating one is a training session, once a day, and does not use up the day's training, so two sessions a day at most.

---

## PART A. Dubhar's end

### 1. He wakes

*(Runs on its own after the paragraph that counts the dead, behind a page break: the war is over and the player turns to look at him. The brief "Back to the oak" menu is skipped.)*

> A cough comes from the thicket. The grey-cloaked man has dragged himself upright against the briar with one hand pressed to where you struck him. The mildness is still on his face, but it has worn thin, like paper over a flame.
>
> "Well," he says. "That was thorough." His eyes go past you to the black oak, to the swarms hanging quiet in the smoke, to the small bodies in the ash. "I did not think anyone could stop them."

*(Dubhar's lines follow, for you to rewrite.)*

> "Please." The word comes out smaller than the rest of him. "I'll go. This hour, this minute. I'll not set foot in this wood again, I swear it on anything you like. You've won. What more is there to take?"

### 2. The choice *(the only choice here; no roll)*

* **Let him go.**
* **End it.**

### 3A. End it

> You make it quick. He meets your eyes until the end, and then his hand opens on the staff.
>
> Down in the grove the ringing has already stopped, and now the air above the stream feels different, like a held breath let go.

*(The same closing paragraph is used after a spare, below. No weapon is named: the line works for a blade, a bow or a spell.)*

### 3B. Let him go

> "Go," you tell him. "And keep going."
>
> He gets a hand under him and hauls himself up on the briar. He has taken three steps along the stream when the grove makes up its mind.

*Then a toss-up, 50/50, decided once and saved so a replay shows the same page:*

* **The dryad:**
  > Roots break the ground across his path, thick as a man's thigh, and close around his legs. Flùràlainn walks out of the smoke with her palm held out flat. "Not through my wood," she says, not loudly. The roots draw him down, and the leaf litter closes over the place.
* **The sprites:**
  > A single green sprite drops out of the smoke and lands on his shoulder. He stops. "This is for my friends!," it says, in a voice no bigger than a bell. Behind it both swarms lift off the branches together, green and thorn-brown in one cloud. They pass over you without a glance, and then the briar is full of sound of tiny wings, and then silence.

*(Both are told and not shown.)* Then the same closing paragraph as 3A.

### 4. The poison goes

*(State only: `lsf_dubhar_dead` and `lsf_corruption_cleared` are set, `lsf_dubhar_spared` and `lsf_dubhar_killed_by` ("player", "dryad" or "sprites") record how, for later.)* **The sidebar entry's goal changes** to *"Return to Bark in his glade."*

### 5. The grove afterwards

**The sprites** *(invented, to close the war)*:

> The sprites do not stay. The green ones gather their dead in their arms, and the thorn-brown ones do the same, and the two groups drift apart toward opposite edges of the ring. A few look back at you as they go.

*(If the sprites killed him they leave the same way.)*

**The dryad** thanks the player once, shortly, in her own voice *(invented)*. **If the player saved the oak (`lsf_dryad_friend`):**

> Flùràlainn stays where she is, one hand on the black bark. "You came into my grove with nothing to gain by it," she says. "I will remember that. When the oak greens again, come and see it."

**If she was too spent to help (`lsf_dryad_busy`):**

> Flùràlainn leans on the black bark. "I could not do what you did," she says quietly. "Thank you."

**Her regard for the player:** she is the player's friend already (`lsf_dryad_friend`: +5 and advantage on Persuasion with her). **If the player spared him,** my reading is that this drops to **advantage alone** *(your earlier note)*. Question 3.

*(The scene then returns to the grove menu. Reaching Bark is the way to the reward.)*

---

## PART B. Bark's fruit

At the turn-in (the lines Bark already has), he gives the fruits. The text is the one from before, with the training line reworded for the character:

> A lower branch bends toward you, and from among the leaves five small fruits drop into your hand, firm and pale as river stones. "These are for you," Bark says, "to help cultivate your body." The yellow eyes close slowly. "There will be more again with the seasons."

**The item: Heartwood Fruit** *(goodberry icon, as you chose)*:

* A counted item in the catalog, five at the turn-in, weight light, **no sale value** (a quest reward; it has a use of its own, so it is not a sell-only item).
* **Eating one:** 5 minutes, and it adds **one training session** (`training_sessions`), **once a day**. A second fruit the same day does nothing and stays in the pack. **It does not touch `last_training_day`**, so the player can still train that day.
* **Refills each season:** a new five at the next season's turn. *(The glade is where it grows. Question 4.)*
* The pack's Use button works, as with the other quest foods; a quest food is not eaten as ordinary rations.

---

## What is new and what stays

* New state: `lsf_dubhar_dead`, `lsf_dubhar_spared`, `lsf_dubhar_killed_by`, `lsf_dubhar_choice_made`; the fruit item and a `heartwood_last_day` for the once-a-day rule.
* Not written: what Dubhar leaves behind, and anything with the sprites after today (their regard for the player, what the casualty rate will do).

---

## QUESTIONS

**1. His speech.** The wording above, and the manner (thin, frightened, still polite). Keep, change or rewrite?

Your answer: I rewrote parts of it already. 

**2. The two endings.** The prose for killing him, for the dryad taking him and for the sprites taking him. Keep, change or rewrite? And do you want a line after the dryad version about the player's choice (a hint that she does not forgive the mercy, or the opposite)?

Your answer: Made changes already. 

**3. The dryad's regard.** Does sparing him cost the +5 (so advantage alone) **whoever** kills him, or **only** when she is the one who does it? My suggestion: only when the dryad does it, because she acted against the player's wish.

Your answer: If the player refuses to kill the evil mage, the player losses +5 and advantage.

**4. The fruit's season.** I would make the five refill at the start of each season, counted the way the Old Grove's season is, and only at the glade (the player has to come back to Bark for the next five). Or do you want the fruit to appear in the pack without a trip back?

Your answer: No, always a trip back. 

**5. Spoiling.** Fruits not eaten by the next season: do they stay in the pack (my suggestion, as there is no spoiling system) or are they lost?

Your answer: They stay in the back, no spoiling. 

**6. Anything else you want added, cut or changed?**

Your answer: No.
