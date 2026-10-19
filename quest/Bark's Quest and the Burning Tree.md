# Bark's Quest and the Burning Tree (working title)

For you to review and mark up before anything is built. Every scene is written out in the order the player meets it, with the prose, the spoken lines and the choices. Anything marked *(invented)* is mine. Your own rulings are in the first section so you can see what I took from you. Nothing here is in the game yet.

---

## What you have decided (from your Random Quest Ideas notes and our chat)

* **The rooms.** Room 7 is a dead end until the player has met Bark and accepted his quest. Accepting opens a way through living growth to Room 9, which holds a pond of clear, fresh-looking water that is poisoned. Trail 27 leads on to Room 15, your Burning Tree grove.
* **The poisoned water.** Drinking it gives **-5 Wisdom for a few days**. It cannot be cleaned until the evil mage is dead.
* **The mage.** Dubhar, hiding in the foliage, poisoned the water and wants the grove for himself. **Killing him cleans the poison from the whole forest and completes Bark's quest.**
* **The tree.** The sprites set the dryad's favourite tree alight. Putting it out needs 20 gallons of water, which the game has no way to carry, so other routes are needed: the shovel and dirt, a Survival check, a spell. **Control Flames solves it outright.**
* **Control Flames** is added as a cantrip for **Wizard, Bard and Warlock**.
* **The sprite war** cannot be won by force. Trying it punishes the player with some HP loss.
* **Finding Dubhar:** a passive Perception check for the sense of being watched, 12 to feel it and 15 to find him, with **advantage if the player took Bark's quest first**. He only acts if found.
* **Dubhar's side:** a quarterstaff, Poison Spray, three Twig Blights (7 HP each, vulnerable to fire, pack tactics).
* **Reward from Bark:** five special fruits. Eating one gives a training session. **Only one fruit a day**, and training is a separate session, so the most a player can train in a day is two. **The fruits regenerate once a season.**

---

## HOW IT PLAYS (short version)

1. At Bark's Glade (Room 8) the player hears of the troubled water to the northwest and takes the quest. *(Bark's text needs two small changes, below.)*
2. Room 7, which was a closed dead end, has its tangle of vines draw back. Before the quest, the room tells the player why it is shut.(No it doesn't, we don't expose a secret path, furthmore the watchtower should not expose any paths beyond room 7 either)
3. Room 9 is the clear pool. The player can notice it is wrong in several ways, or drink and pay for it.
4. Trail 27 follows the stream upstream, and the signs of the poison get plainer as the player climbs.
5. Room 15 is the grove: a burning tree, a dryad begging for help, and two tribes of sprites at war. The player puts the fire out (with Control Flames, or with effort), or fails to.
6. Dubhar is hiding nearby. Finding him and killing him cleans the water.
7. Back at Bark's Glade, Bark pays with five fruits that grow back each season.

---

## THE SCENES

### 0. Two changes to Bark (Room 8, already written)

**0a. What Bark says about the water.** He currently says the stream "runs black." Yours is clear. Proposed replacement for the line in "Do the trees speak of any trouble?":

> The yellow eyes narrow, and Bark's voice drops to a heavy rumble like thunder muffled by deep soil. "The trees to the northwest are troubled. The water near their grove runs clean and clear, and nothing will drink it. Leaves curl and fall before their time. The roots whisper of a sickness that has no smell and no color."

And in "Tell me more about the poisoned water" (replacing "The water there smells of copper and decay, not rain"):

> "Follow the paths into the northwestern hollows, where the moss grows thick and grey. The water there is still as a held breath. Whatever touched the source is foreign to these woods."

**0b. The reward.** At the turn-in (`lsf_bark_turnin`), after his lines, Bark gives the fruits (scene 8).

(I woulld not to do, just remove the runs black wording or keep it as Bark speaking metaphorically.)

---

### 1. Room 7: the sealed hollow *(name invented: "The Grey Edge")*

Room 7 is reached from Trail 13 and from the hidden Game Trail below the Watchtower, so a player can come here without ever meeting Bark. It is a dead end until Bark's quest is taken.
**Before the quest, lit:**

> A small clearing ends in a wall of living growth. Vines as thick as your wrist wind through thorn and bramble, and the trunks behind them lean together, branch locked into branch. The leaves on this side are green, and the ones beyond the wall have gone grey and curled. A dead thrush lies at the foot of the tangle, whole, without a mark on it.

**Before the quest, dark:**

> Your hands meet a wall of vine and thorn that runs from one side of the clearing to the other. The leaves on this side are damp and soft under your fingers, and the ones beyond the wall crackle. Something small and light lies at your feet, a bird, whole and cold.

**Options before the quest:**

* **"Look closely at the vines." [~10 min] [Nature DC 10]**
  > *Pass:* The vines are alive, and the newest tips are only a few days old, but they have grown thick as a door. Every tendril leans back toward you, away from the grey leaves, as if the forest has shut this way itself and means to keep something in.
  > *Miss:* You turn the thorns over until your thumbs bleed, and they tell you only that they are vines. Another day, with fresher eyes, may serve you better. *(one try per refill)*
* **"Speak with the animals here." [Speak with Animals]** *(only for a character who has it)*
  > A jay on a branch behind you answers in a quick, cross voice. "Not that way. Bad water, bad water. Dead leaf, dead wing." It shakes itself and will say no more.
* There is no way to force the tangle. (A blade would take a day, and the vines would grow back as fast.)

(remove these options, including them defeats the point of the dead end. Including them spoils the reveal)

**After the quest is taken (lit):**

> The tangle has drawn back. The vines have unwound from one another and lie along the trunks like ropes laid down, and between them a path opens north, wide enough for one, floored with leaf litter. A warmth moves in the roots under your ${feet_prose}, like a greeting. Past the opening the leaves go grey almost at once.

**The first time the player returns after taking the quest (shown once):**

> As you step toward the wall, the growth shivers and slides apart in front of you. Roots lift from the earth and settle again to either side. Nothing hurries, and nothing hinders.

(Also more tell then show, and a but authurative with the nothing hurries nothing hinders.)

**Exits:** west to Trail 13, north to Room 9 *(once the quest is taken)*, south on the Game Trail *(once the tower has been climbed, as now)*.

---

### 2. Room 9: the clear pool *(name invented)*

**Lit:**

> The path comes down to a pool the size of a cart, fed by a thread of stream from the north and drained by another to the south. The water is the clearest you have ever seen, still enough to show every pebble on the bottom, and the banks around it are neat as a swept floor. No reeds grow here. No fly crosses the surface, and nothing has printed the mud at the edge.

(This is very tell and not much showing, show me the area is empty of life, don't tell me)

**Dark:**

> The air turns cool and clean. Water speaks somewhere ahead, a thin steady trickle, and your hand finds a stone rim, wet and smooth. No frog calls, and nothing stirs among whatever grows at the edge.

(Same thing, all tell, no show, negative framing, narrative rule violation ontop of that.)

**If the quest is taken, one line is added (the roots warn the player):**

> The roots under your ${feet_prose} hum low and steady, the way a hand goes still on your arm.

**Ways to notice the water is wrong (each once, any order; any one sets `lsf_corruption_found`):**

* **"Look closely at the water." [~10 min] [Nature or Survival DC 11]**
  > *Pass:* It is too clean. There is no green on the stones, no skin of dust on the surface, no insect, no track of any animal that came to drink. Whatever lives in this wood has learned to stay away from it.
* **"Smell the water and taste a drop on a fingertip." [~5 min] [Medicine DC 12]** *(a risk of a mild effect on a miss; see question 5)*
  > *Pass:* There is a faint thinness to it, almost sweet, and a metallic edge at the back of the tongue. You spit it out. It is the kind of poison that works on a mind and not on a body, slow, and it would leave you dull and slow to see what is in front of you.
* **Detect Magic (cast):**
  > The pool glows faintly sick-green to your second sight, a clean shimmer that moves against the current, and the glow thins and brightens in time with some distant pulse.
* **Speak with Animals (cast):**
  > A vole at the edge of the clearing, watching you from a root, tells you without being asked. "Water bad. Water takes the thinking. Don't." It dives back into the roots.

**Drinking:**

* **"Drink from the pool." [~2 min]**
  > You kneel and drink. The water is cold and sweet, the best you have tasted in days. By the time you stand, a fog has settled behind your eyes, and it does not lift. [b]-5 Wisdom for three days.[/b]
  *(A timed effect in the sidebar's Effects, with the minutes left. Offered always. If the player already knows the water is wrong, a short line is added before it: "You know what is in it.")*

**After Dubhar is dead:** the pool is plainly clean. Reeds have started along the banks, and a water-strider skates the surface. **"Drink from the pool"** is safe, and **removes the Wisdom penalty** if the player has it. *(Question 5: should it also work like the Hidden Spring?)*(no it should no work like the hidden spring, it's just clean water, when we implement the jug system this would be a place to fill up water though.)

**Exits:** south to Room 7, northwest to Trail 27.

---

### 3. Trail 27: the stream path *(name invented)*

The trail follows the stream upstream, so the signs of the poison thicken as the player climbs.

**Lit:**

> The path runs beside the stream and climbs with it. Here the banks are bare of moss, there the moss is grey and furred, and farther up a few small fish lie on the stones, whole and pale. Smoke hangs in the air, bitter and thin, and from somewhere ahead comes a high, thin sound like a hundred tiny bells being struck at once.

**Dark:**

> The stream talks beside you, thin and cold. The moss under your hand has gone dry and furred, and a bitter smoke hangs in the air. Ahead, a high ringing, like many small bells struck together.

**Sky layer, chalk mark option, exits:** the usual. Southeast to Room 9, northeast to Room 15.

---

### 4. Room 15: the grove *(name invented: "The Burning Grove")*

**First arrival, lit:**

> The trees stand back in a wide ring around one enormous oak, and the oak is burning. Fire runs up the trunk and out along the lower limbs, and smoke boils from the crown in a dirty column. In the middle of it all a slender woman with bark-grained skin and hair like wet leaves beats at the flames with her bare hands, weeping and shouting. Around her, in the air and among the boughs, small winged shapes no bigger than your hand are fighting: two tribes, one in green, one in thorn-brown, screaming at each other and at her.

**First arrival, dark:**

> Heat on your face before you see anything: a fire, close, with the crack and roar of big timber. A woman's voice is shouting in a language you half know, and over it, all around, a thin, savage ringing, like blades on glass.

**Perception (once, on arrival):**

* **Passive Perception 12:** *"The skin between your shoulders prickles, the way it does when something is watching from a place you cannot see."* (sets `lsf_dubhar_felt`; **advantage on this check if Bark's quest was taken first**.)

**Then the dryad speaks to the player:**

> The woman turns and sees you. "Help me!" she cries. "The tree, my tree. It needs water, twenty great pails, more than I can carry, and the stream is... Please!"

**The player's choices at the burning tree (all take game time; the fire is spreading):**

* **Control Flames** *(a Wizard, Bard or Warlock who knows it)*
  > You raise a hand and speak to the flame as you would to a nervous animal. It leans toward your voice. One by one you gather the patches of fire, trunk and limb and crown, and bend them down, thinner and thinner, until the last bright thread gutters and goes out. The smoke thins. The great tree stands scorched and whole.
  *(No roll. It takes a few casts, and the fire cannot beat the player.)*
* **Throw earth on the flames with a shovel. [Athletics DC 14, ~2 hours]** *(needs a shovel)*
  > *Pass:* You dig and throw until your arms burn. The earth smothers the flames on the trunk and the low limbs, and the dryad drags the last of the crown's embers out with her hands. The tree is scarred but alive.
  > *Miss by little:* The tree lives, but the crown is lost.
  > *Miss badly:* The fire wins. The tree is gone.
* **Cut a firebreak. [Survival DC 13, ~1 hour]**
  > The grove is saved and the tree is not: you cannot stop the fire in the trunk, but you stop it reaching the others. *(the tree is lost; the dryad still thanks you for the grove)*
* **"Ray of Frost" or another spell.** *(question 7)*
* **Leave the dryad to it.**
  > You turn away. Behind you the roar climbs and the dryad's voice breaks. *(the tree is lost; she will not trust the player. The Dubhar part remains open.)*

**If the tree is saved, the dryad explains (player speaks too):**

> "Thank you," the dryad says, and sits down where she stands. "I am Flùràlainn. I keep this grove." *(her name is from your notes)* "The sprites were my friends. For years I kept the peace between them. Then something changed, and now they will kill each other for one more tree."
>
> "What changed?" you ask.
>
> "Their minds. They drink from the stream that feeds this place, and it has done something to them. Greed, and nothing else, as if the greed were the only thing left." She looks at the burning crown, the grey scar. "I thought it was a spell. I do not know who would cast it."

*(If the player has noticed the water is wrong, a line from them here: "The water is poisoned. I've seen what it does.")*

**Her gratitude:** an ongoing reaction for later quests, the **+10 on Persuasion with her** from your notes *(question 8)*.

---

### 5. The sprite war

The two tribes fight in the air and in the boughs and do not attack anyone who stays out of it.

* **"Step between them and order them to stop."**
  > Both tribes turn on you at once, a hail of tiny blades and thorns, a storm of small furious faces. You stagger out of the cloud with your arms over your head, bleeding from a hundred scratches, and they have already forgotten you. [b]-4 HP[/b] *(never below 1, once; afterwards they are described, not repeated)*
* **"Watch them." [~10 min] [Insight DC 12]**
  > They are not themselves. Their eyes slide past you and past each other, bright and unfocused, and between fights they drift to the stream and kneel to drink, over and over, as if they cannot stop.

---

### 6. Dubhar

**Finding him:** passive Perception 12 gives the sense of being watched, and an active search **[Perception DC 15]** finds him *(advantage if the player took Bark's quest)*. A friendly dryad can also point to the thorn thicket by the water. If the player never finds him, he does not act, and the stream stays poisoned.

**When he is found:**

> A man in a grey cloak straightens from behind a stout thorn briar. He is lean, with a quarterstaff in one hand, and three small, twiggy shapes uncurl from the ground at his feet. "You," he says, mildly, as if you were a minor inconvenience. "I do wish you hadn't."

*(The player can answer or attack. If Dubhar speaks more, nothing he says changes the outcome.)*

**The fight:** Dubhar (AC 12, HP 22, quarterstaff 1d6+2, **Poison Spray**) and **three Twig Blights** (AC 14, HP 7, claw 1d4+2, vulnerable to fire, pack tactics). Dubhar fights from behind the briar. *(See question 9: three blights and a mage is heavy for one level 1 or 2 character.)*

**When he dies:** the poison goes out of the forest at once.

> The strength goes out of the twig shapes first, and they fall apart into leaf and bark. Dubhar's hand opens on the staff. Down in the grove, the ringing stops as if a string had been cut. The stream runs the same color as before, but the air above it is different.

*(Sets `lsf_dubhar_dead` and `lsf_corruption_cleared`: Room 9's pool is clean, the sprites come out of their madness and scatter, the dryad is free to speak.)*

---

### 7. After: the grove and the pool

* **The grove:** the sprites, dazed, break off the fight and leave in two small groups. The dryad, if the player saved the tree, thanks them again.
* **Room 9's pool:** clean, safe, and the Wisdom penalty can be washed away.
* **Bark:** he has felt it in the roots.

---

### 8. Bark's reward: five fruits

**At the turn-in** (after his existing lines), Bark gives five fruits, which grow back every season.

> A lower branch bends toward you, and from among the leaves five small fruits drop into your hand, firm and pale as river stones. "Eat one a day," Bark says, "and no more. They will not keep your hunger from you or your wounds from you. They give you what the work gives you. A day's work, in a morning." The yellow eyes close slowly. "The tree will bear them again with the seasons."

**The fruit** *(name invented: "Heartwood Fruit")*:

* Eating one takes 5 minutes and **counts as one training session**, once a day (a second fruit that day does nothing, and the item stays).
* **It does not use up the day's training:** a player can eat one fruit and train once, so two sessions a day at most.
* **Five fruits, and they grow back once a season.** The glade's bough holds up to five at a time (the same year-by-four-plus-season clock as the Old Grove), and Bark lets the player take them when they are ripe.
* They count toward the sessions needed for each level, as training does.

---

### 9. Control Flames (the cantrip)

**Spell card text:**

> **Control Flames** *(cantrip, Transmutation)*. You choose an ordinary flame within sight and bend it: make it spread, put it out, make it burn brighter or lower, or give it a shape or a color. The flame obeys for an hour. You cannot start a fire with it, only shape one that already burns.

**Who gets it:** Wizard, Bard and Warlock, chosen like the other cantrips.

**What it does in the game *(my suggestions, you pick)*:**

* **The burning tree:** outright, as above.
* **Camp:** *"Bank the fire,"* when a lit fire is there, so the night is warmer and the cold exposure for that rest is lower.
* **Dungeons:** *"Feed the torch,"* so a lit torch burns a few steps longer, or *"Pinch the torch out"* to go unseen in a room.
* **Combat:** *"Snuff the flames"* on the player when they are burning, once.

---

## BUILD NOTES (for me, not for you to decide)

* Edits to Bark's lines (0a), the turn-in reward (0b), and the new rooms 7, 9, 15 and Trail 27 in `overworld/longshade_forest.txt`. The map names and the hidden-edge rule for Room 7 to Room 9 in `dungeons/longshade_forest.js` (the edge reads `lsf_bark_accepted`).
* State: `lsf_dubhar_felt`, `lsf_dubhar_found`, `lsf_dubhar_dead`, `lsf_pool_wrong`, `lsf_tree_saved` (and its degrees), `lsf_dryad_friend`, plus the existing `lsf_bark_quest`, `lsf_bark_accepted`, `lsf_corruption_found` and `lsf_corruption_cleared`.
* The -5 Wisdom effect uses one of the three unique effect slots with a negative bonus for 4,320 minutes; it needs a check that a negative bonus shows and applies.
* Two new enemies for the fight library: Dubhar (a human caster with Poison Spray, which the library may not have) and the Twig Blight (a plant creature that takes extra damage from fire).
* Control Flames: `known_control_flames` in the profile startup, `refresh_known_spells`, `spell-data.js`, the three classes' cantrip choices in `prologue/dawn_trial.txt` and the level-up pages, and a spell card.
* The fruit: a counted item, a once-a-day guard on the eating, a +1 to `training_sessions` that does not touch `last_training_day`, and the seasonal stock for Bark's bough.
* Tests for every branch, the dark versions and a replay check on every page that grants HP loss, the effect, or a session.

---

## QUESTIONS

Answer in place. If you would rather I just choose, write "your call" and I will use my suggestion.

**1. Names.** The dryad (Flùràlainn), the two sprite tribes (Briarvine and Thornbranch), the grove (Coilltean) and Dubhar come from the idea you borrowed. Keep them, or give them names of our own? Rooms are named for what they are (The Grey Edge, The Clear Pool, The Stream Path, The Burning Grove, all mine).

Your answer:

**2. Room 7.** Is "the forest sealed this way itself" the right reason for the closed path? And do you want the dead thrush and the grey leaves, or something plainer?

Your answer:

**3. Bark's two changed lines.** Is the proposed wording right, now that the water is clear?

Your answer:

**4. The roots' warning in Room 9** (a line added when the quest is taken). Keep it, or leave the player to find out for themselves?

Your answer:

**5. The pool.** (a) Should tasting the water on a miss harm the player a little, or is the check harmless? (b) After Dubhar's death, should the clean pool also work like the Hidden Spring (clears fatigue once per refill), or just remove the Wisdom penalty?

Your answer:

**6. The tree's outcomes.** I wrote four: saved clean, saved with the crown lost, lost, and the grove saved but the tree lost. Is that the right spread, and does losing the tree close the dryad's gratitude only, with Bark's quest still open?

Your answer:

**7. Other spells on the burning tree.** Should Ray of Frost also put the fire out (slowly), or only Control Flames and the shovel/Survival routes?

Your answer:

**8. The +10 Persuasion with the dryad.** It is far above the normal scale of a d20 plus a few points. Do you want it as written, or as "advantage plus 5", or as a permanent friendly state with no number?

Your answer:

**9. The fight.** Three Twig Blights and a mage is a lot for one level 1 or 2 character. Fewer blights (two), the mage already wounded by the dryad, or the dryad's help in the fight? Or keep it as written?

Your answer:

**10. Mercy.** If Dubhar is beaten, can he surrender or flee, or must he die for the poison to end? (As you wrote: the stream cannot be cleaned unless he is dead.)

Your answer:

**11. What Dubhar leaves behind.** Nothing but his staff? Or something small, a spell, a note, or the reason he wanted the grove?

Your answer:

**12. The fruit.** (a) Is "Heartwood Fruit" an acceptable name? (b) Do fruits kept past their season spoil? (c) Does Bark let the player take the five at once at the turn-in, or one at a time as the bough bears them?

Your answer:

**13. Control Flames in the game.** Do you want the camp, torch and combat uses above, or only some of them?

Your answer:

**14. Anything else you want added, cut or changed?**

Your answer:
