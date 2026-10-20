# Room 15, the Burning Grove: the dryad and the burning tree (chunk 4, for review)

For you to mark up before anything is built. It covers only chunk 4: the arrival, the dryad, the burning tree and its routes, and the sprite war as the player first meets it. Dubhar and his Twig Blights (chunk 5) and everything after the mage dies (chunk 6) are not here, only the hooks they hang on. Prose, spoken lines and choices are written out in the order the player meets them. Anything marked *(invented)* is mine. Answer in place under the QUESTIONS at the end; "your call" means use my suggestion.

*(Rewritten 2026-10-19 after your rulings below; the earlier "oak lost" outcomes and the "go and fetch water" idea are gone.)*

---

## What I took from you

* **Names kept:** the dryad Flùràlainn, the tribes Briarvine and Thornbranch, the grove Coilltean (the map calls the room *The Burning Grove*, a plain name; the grove's own name is the dryad's to say).
* **The oak is always saved.** There is no burned-down oak. Either the player saves it, or the dryad is too busy saving it herself to help in the fight.
* **Two results only:** *the player saves the oak* (the dryad's friend: **+5 and advantage** on Persuasion with her, and she helps in the fight with the mage), or *the dryad saves it herself* (no +5, no advantage, no help, so the fight is harder by one or two extra enemies).
* **No walking away to fetch things.** The player comes to the grove with what they carry or not at all. The only way to leave while the oak burns is "Turn your back on her and go", and that fails the quest (section 8).
* **Control Flames puts it out outright**, no roll. **Twenty full water jugs put it out outright**, no roll. The shovel (Athletics DC 14) and the firebreak (Survival DC 13) are rolls.
* **Nothing here may take more than 5 minutes.**
* **The sprite war cannot be won by force.** Trying costs the player HP.
* **Passive Perception 12** gives the sense of being watched, with **advantage if Bark's quest was taken first**.

---

## THE CLOCK

A hidden counter, **the grove clock** (`lsf_grove_mins`), counts the minutes the player spends **in Room 15**, from the first arrival until Dubhar dies. It adds up every action the player takes here. Chunk 6 reads it to set how hard the sprites are to stop: the longer the player dithers, the higher the DC. The game's own clock moves by the same minutes as usual.

* **Nothing in Room 15 takes more than 5 minutes.** Talking and looking around are 1 to 5 minutes; each of the four fire routes is 5.
* **The player never sees the number.** The room shows it through the prose instead (the ringing climbs, the smoke thickens). *(Built in chunk 6; chunk 4 only keeps the count.)*

---

## 1. Arriving in Room 15

The room is lit by the fire, even at night, while the oak burns. After the fire is out it falls back to the forest's normal day and dark versions *(built in chunk 6 with the rest of the "after")*.

**First arrival, by day:**

> The trail ends at a wide ring of trees around one old oak, and the oak is on fire. Flames climb the trunk and run out along the low limbs. A column of dirty smoke rolls from the crown and spreads flat under the canopy, and the heat reaches you across the whole clearing. A woman stands at the foot of the tree, beating at the bark with her bare hands. Her skin is the grey-brown of old wood and her hair hangs in long green ropes that steam as she works. Around her and high in the boughs, hand-sized figures on thin wings wheel and collide. Some wear green, some a brown like dead thorn, and the whole swarm shrieks in one thin, glassy note, like a spoon dragged round a glass.

**First arrival, at night:**

> Firelight first, then heat. The oak at the center of the ring is burning from root to crown, and the flames throw the nearest trunks into black and gold. A woman is at its foot, beating the bark with her bare hands, her hair steaming. Up in the boughs, tiny winged figures fly at one another in two swarms, green and thorn-brown, and the air rings with their shrieking.

**The sense of being watched** *(once, on the first arrival; passive Perception 12, with advantage if Bark's quest was taken, which is +5)*:

> The skin between your shoulders prickles, the way it does when someone is watching from a place you cannot see.

*(Sets `lsf_dubhar_felt`. Under 12 prints nothing. Chunk 5 uses it.)*

**The dryad sees the player** *(first arrival only)*:

> The woman spins around and sees you. "You! Help me!" Her voice cracks. "The tree, my tree. It wants water, twenty great jars of it at least, and the stream is... Please. Anything you have."

*(She does not give her name yet; the buttons call her "the woman" until she does.)*

**The room's own senses while the tree burns** *(a short rotating pool of lines, three or four, picked from the clock the way the other rooms do, so the room never repeats a gesture):* a limb of the oak splits and drops sparks; a handful of the thorn-brown sprites dive at the green ones and the green ones scatter; ash drifts down like grey snow; the fire cracks in the heartwood like a stick snapped over a knee.

---

## 2. The room's menu while the tree burns

All of these keep the player here. A route the player cannot use right now stays listed and says why. **There is no ordinary way out while the oak burns:** the only exit is the last button, and it fails the quest.

* **Talk to the woman. [~2 min]**  *(first time: the exchange in section 3; after that she is simply described)*
* **The four ways to the fire** (section 4)
* **Watch the swarms. [~5 min] [Insight DC 12]** *(section 5, once)*
* **Step between the swarms and order them to stop.** *(section 5)*
* **Turn your back on her and go.** *(section 8: this fails Bark's quest)*

**Everyone has a way in.** The firebreak needs no item and no class, so a player with nothing can still try it; a failed roll only means the dryad finishes it herself.

---

## 3. Talking to the woman *(once, then she is described)*

The player speaks in the prose; there is no button between lines.

> "What happened to the tree?" you ask, loud over the roaring.
>
> "They did it." She keeps her eyes on the flames. "Those two, the green and the brown. They were fighting over it, over the grove, over the stream that feeds it, and one of them set the crown alight. I have kept the peace between them for longer than that oak has been tall. I never saw them like this."
>
> "Can it be put out?"
>
> "Water. A river of it. Or a hand that can talk to fire." She looks at you properly, then. "If you have either, now. Please."

*(No roll. The talk costs 2 minutes. It tells the player what the routes are, so the list in section 4 does not need to say it again.)*

---

## 4. The four ways to put out the fire (each one 5 minutes or less)

Two of them are automatic (**Control Flames**, **twenty full jugs**). Two are rolls (**the shovel**, **the firebreak**). A pass saves the oak and the player is the dryad's friend. A fail means the dryad puts it out herself.

**Control Flames** *(Wizard, Bard or Warlock who knows it; no roll, 5 min; one variant for each class)*

> *Wizard:* You lift a hand and speak to the flame the way you would to a skittish horse. It leans toward your voice. You gather the fire off the trunk, limb by limb, and press it thinner and thinner until the last bright thread gutters and goes out. Smoke curls up from black bark, and the tree stands whole.
>
> *Bard:* You hum, low, on the note the fire's own crackle already makes, and let the tune drop. The flames sway down with it, shortening from the crown to the trunk, a quieter verse at every line, until the last bright thread goes out.
>
> *Warlock:* You reach for the pact and ask the fire to remember that it answers to something older than itself. It cringes. The flames fold down along the trunk and go out one limb at a time, smoke drifting up like breath.

*(Result: the player saves the oak.)*

**Pour out your water. [~5 min] [needs 20 full jugs]**

> Visible whenever the player carries a water jug. With fewer than twenty full, it stays listed and says how many: *Pour out your water: you carry 6 full jugs, and the tree wants twenty.*
>
> *With twenty:* You line the jugs up at the edge of the heat and start. One after another you pull the cork, swing the jug and throw the water high up the trunk. It hits the bark with a hiss and a roll of steam. The woman is running up beside you with her hands full of the runoff, flinging it into the crown. The last jug lands, the steam thins and clears, and the trunk stands black and streaming, with green still in the crown.

*(No roll. The twenty full jugs are used up; the empty jugs stay. Result: the player saves the oak. Only a few characters can carry 160 pounds, which is why this is rare.)*

**Throw earth on the trunk. [~5 min] [Athletics DC 14, needs a shovel]**

> You drive the shovel into the ground at the edge of the roots and start throwing. Earth hits the burning bark and smothers it in a hiss and a cloud of dust. The woman is beside you, scooping soil in her cupped hands and scraping it up the trunk.
>
> **Pass:** The earth takes the trunk and the low limbs. She drags the last embers from the crown with her hands, and the oak stands scorched and alive. *(The player saves the oak.)*
> **Miss:** The soil is too thin and the crown has too much of a start. You are still scraping at the trunk when the woman shoves you aside, plants both hands on the bark and speaks one low word. The fire dies under her palms. *(The dryad saves the oak herself.)*

**Cut a firebreak. [~5 min] [Survival DC 13]**

> You choose the line where the grass ends and start tearing it up, then the roots, hurling the turf behind you into a raw black trench around the foot of the oak. Sparks tick across the gap and die in the dirt, and the ground fire at the roots has nothing left to feed on.
>
> **Pass:** With the roots safe, the woman gets both hands flat on the trunk and, with you hauling turf up the bark beside her, the flames die down limb by limb. *(The player saves the oak.)*
> **Miss:** Sparks jump the trench and catch the nearest trunk. You are beating at the new fire when the woman shoves past you, plants both hands on the bark and speaks one low word, and it goes out. *(The dryad saves the oak herself.)*

---

## 5. The sprite war, as the player first meets it

**(Moved by you, 2026-10-19: none of this happens before the mage is beaten. The order is save the oak, fight the mage, then try to stop the battle. It was built and then commented out, to come back with the later label.)**

The two swarms fight in the air and the boughs. They do not attack anyone who stays out of it.

**Watch the swarms. [~5 min] [Insight DC 12]** *(once)*

> **Pass:** Something is wrong in them. Their eyes slide past you and past each other, bright and unfocused, and between rushes they drift down to the stream and kneel on the bank to drink, over and over, as if they cannot stop. *(Sets `lsf_sprites_watched`.)*
> **Miss:** It is a blur of wings and tiny blades, and nothing in it makes sense.

**Step between the swarms and order them to stop.** *(the same text each time, once the HP is paid; afterwards it is only described)*

> You walk into the middle of the dogfight with your hands up and shout. Both swarms turn on you at once, a hail of tiny blades and thorns and furious small faces, and you stagger out of the cloud with your arms over your head, bleeding from a hundred scratches. They have already forgotten you. **-4 HP** *(never below 1, paid once; every later time it is told, not repeated; Question 1)*

*(Sets `lsf_sprites_tried`.)*

---

## 6. When the fire is out

Right after the last route's text, the woman sits down where she stands and the exchange continues. The player speaks in the prose.

> She is on her knees in the ash with her hair hanging over her face, and when she lifts it her eyes are wet. "I thank you," she says. "I am Flùràlainn. I keep this grove, and I have kept it since before the oldest of these trees was a seed."
>
> "Why are they fighting?" you ask.
>
> "They are not themselves." She stares at the two swarms wheeling over the clearing. "The Briarvine and the Thornbranch. I have kept the peace between them for years. Then something changed, and now each would burn the grove if it meant the other could not have it. They drink from the stream and they get worse. Greed, and nothing else, as if all that was left of them was wanting."
>
> *(If the player knows the pool is poisoned:)* "The water is poisoned," you tell her. "I've seen what it does." She goes very still. "Poisoned. By whom?" You shake your head, and her gaze slides to the dark thicket by the water and back to you. *(Sets `lsf_dryad_hint`, which chunk 5 uses to point at where Dubhar hides.)*

**If the player saved the oak:** she grips the player's forearm and says it again. *"Whatever you need in this grove, you have only to ask."* *(Sets `lsf_dryad_friend`: **+5 and advantage** on Persuasion with her. Where it is used: chunk 6, when the sprites have to be stopped, and any later quest of hers. Nothing in chunk 4 rolls it. And chunk 5 gives the player her help in the fight.)*

**If the dryad saved the oak herself:** the thanks are thinner, and she turns back to the black bark. *"I would have liked the strength to do more for you. I have none left."* *(Sets `lsf_dryad_busy`: no +5, no advantage, and chunk 5 takes away her help, so the fight with the mage has one or two more enemies in it. The player still learns everything above, and Bark's quest stays open.)*

---

## 7. What is saved after this chunk

New state: `lsf_grove_seen` (first arrival done), `lsf_grove_mins` (the clock), `lsf_dubhar_felt`, `lsf_tree_state` (`"burning"`, `"saved_by_player"`, `"saved_by_dryad"`), `lsf_dryad_met`, `lsf_dryad_friend`, `lsf_dryad_busy`, `lsf_dryad_hint`, `lsf_sprites_watched`, `lsf_sprites_tried`, `lsf_bark_failed` (section 8). The fire, the war and the dryad's help are rooted in `lsf_tree_state` and the grove clock, so chunks 5 and 6 only have to read them.

Not built here, on purpose: Dubhar, the Twig Blights, the search for him, the way the dryad and the bear change the fight (one or two extra enemies when the dryad is busy is a chunk 5 number), the mercy choice, the cleaned water, the sprites' second challenge and Bark's fruit.

---

## 8. Walking away fails the quest *(your ruling, written out)*

"Turn your back on her and go" is the only way out while the oak burns, and it ends Bark's quest at once, with no confirmation (the button's own words are the only warning).

**What happens**
1. The player is still standing in Room 15 and walks out by the trail as usual (Room 15, the trail, the pool and Room 7 are still there on the way out).
2. **On arriving back in Room 7 the way closes behind them,** and Room 7 goes back to being exactly the plain dead end it was before the quest: no gap, no vines drawn back, no sign anything was ever opened. A short page the first time, shown not told:

> A creak behind you, and you turn. The two roots that arched apart have sunk back into the ground, the thorns have leaned together, and the vines are sliding across the gap one over the other, until the old wall of trunks stands bound and whole. There is no seam where the way was.

3. **The map forgets.** Removed from the player's map, as though never found: the way from Room 7 to the pool, **Room 9 (the Clear Pool), the stream path (Junction 27), Room 15, and Bark's Glade (Room 8) with its spur (Junction 15).** The watchtower view does not bring any of it back, and the paths cannot be walked again.
4. **Bark's quest fails** (`lsf_bark_failed`): it can never be accepted again (there is no Room 8 to accept it in), the poison stays in the forest for good, the sprites stay at war, and **Bark's five fruits can never be had.** Anything the player already took from Bark's glade stays with them (a fruit already eaten, or the memory of what Bark said), and the lore the player already learned stays in the codex.
5. The sidebar's quest entry for it (Question 3) simply leaves the list, the way every finished or failed quest does.

**Settled by you:** it is Junction 15 and Room 8 (Bark's Glade and its spur) on top of everything north of Room 7, and **there is no confirmation.** The alternative you named, not offering the walk-away at all, is not used.

---

## QUESTIONS

Your earlier answers (no fetching, the water route has no roll, the DCs 14 and 13, and the two results) are written in above. Two are left.

**1. The HP loss.** *Settled ("either works"):* a quarter of the player's maximum HP, at least 2, once, never below 1, so it scales.

**2. The light.** *Settled:* yes, the burning oak lights the room at night even without a torch or the Light cantrip.

**3. The sidebar.** You are right: the sidebar only lists quests that are in progress, and a finished or failed quest is removed from it (that was my mistake). So the only question is whether Bark's quest should show in the sidebar *while it is in progress*, from the moment the player accepts it until it is finished or failed, with a one-line goal that changes as the player goes (find the source of the poisoned water, put out the fire, find the one behind it) and the hover card the other quests have. My suggestion: yes. Say no if you would rather it not be there.

Your answer:

**4. Anything else you want added, cut or changed?**

Your answer:
