# The Overdue Peddler (working title)

Written for you, the author. Answer in the **Your answer:** lines under each question and I will build from them. Anything marked *(invented)* is mine; change or cut it freely. Nothing in this file is built yet, apart from the forest rooms listed under "Already built".

**Part 1** is the investigation job that gives the Longshade Forest a reason to be entered, and is built. **Part 2**, the Ambrose request that gives Room 6's two plants a reason to be gathered, now lives in its own file.

---

## What already exists (so the quest hangs on it, not the other way round)

* **Room 10, the Wrecked Camp.** Three tents, a cold firepit, split crates, claw grooves on a pole. Survival DC 12 reads a big cat; Investigation DC 12 finds a pouch with **6 Silver Marks** (once ever).
* **Room 12, the Trampled Clearing.** Three bodies, torn and partly eaten, packs and a snapped short bow. Survival, Medicine and Nature readings point to the cat (Room 14) and the bear (Room 13).
* **Timbermouth Factor's Hall.** The notice board has an empty **job slot** waiting for its first posting. Two unnamed clerks run the Hall. The Hall Insignia (1 silver) is what contracted postings ask for.
* **Barleycross** (Wenna Hart, halfling village head, a board at the Gathering Hall) and **Ashrun Holt** (Speaker Lysa Thorn; Odile and Bram, the hunters, whose house the player can already visit).
* **The shared plant-gathering routine**, used for the Silt-Gate plants and now for Room 6's shadefern and acorn truffle.

Three bodies and three tents fit one peddler and two hired guards, which is the party I propose below.

---

## PART 1: THE OVERDUE PEDDLER

### The idea in four lines

A peddler and two hired guards left Barleycross for Ashrun Holt by the forest shortcut and never arrived. A notice at the Timbermouth Factor's Hall asks someone to find out what happened. The player gathers what the people at each end know, goes into the Longshade, finds the camp and the bodies, and brings back proof. What they do with the camp's 6 silver is the real decision.

### The party *(invented)*

* **The peddler:** Aldis Pellam, a middle-aged tinker who sold pots, needles and ribbon on a fixed round between Timbermouth, Barleycross and Ashrun Holt.
* **Two hired guards:** Marr, a broad woman with a spear, and Joss, a young man with a short bow (the snapped bow in Room 12 is his).
* **The proof:** a **brass licence tag** stamped by the Factor's Hall, still on the peddler's belt in Room 12. The Hall issues these to peddlers, which is why the Hall is the natural patron.

### The hook

**Where:** the Factor's Hall notice board in Timbermouth (reading it already costs 10 minutes). A posting under the forecast slip and the road notice.

**The posting** *(draft wording, plain notice voice)*:

> OVERDUE ON THE SHORTCUT. A licensed peddler and two hired guards left Barleycross for Ashrun Holt through the Longshade and have not been seen since. Anyone who can learn what became of them may report to the counter. Paid on proof.

The posting is a real job, so it follows the radiant-job rules you set: it lapses silently if its term runs out, and it does not count toward the level-2 quest pool.

### The leads (any order, none required)

The forest is open from the start, as it already is. The leads make the forest checks easier and make the ending richer. Each one is a short conversation with the player's own words in it.

| Lead | Where | What it gives |
|---|---|---|
| The Hall clerks | Timbermouth Factor's Hall | The licence, who the peddler was, the guards' names, the date they left. Gives knowledge of the **brass tag**, so the player knows what to look for in Room 12. |
| Wenna Hart | Barleycross, Gathering Hall | The peddler's round, that he always took the shortcut when the road was wet, and that the guards were hired in Barleycross. She asks the player to bring word back to the family if it is bad news. |
| Odile and Bram | Ashrun Holt | They heard something big scream in the woods two nights ago, from the middle of the forest. Gives **advantage on the Survival read** at the Wrecked Camp. |

Each lead sets one flag, and the player can finish the job having done none of them.

### In the forest

Everything below is added to rooms that exist. No new rooms.

* **Wrecked Camp (Room 10).** With the job active, one extra line in the Search option: the crates hold tinker's goods (needles, buttons, thread), so the player understands whose camp it is. The 6 silver pouch is the party's travelling money.
* **Trampled Clearing (Room 12).** A new option, only while the job is active: **look over the bodies for anything that names them** (Investigation DC 10, or automatic if the player learned of the tag at the Hall). A pass finds the **brass licence tag**. A miss allows one retry per refill, like the other readings in the room.
* **No fight.** The cat and the bear are already dealt with by their own rooms.

### Reporting back

Two ends, and both are optional parts of the same ending:

1. **At the Hall:** hand over the tag. The clerks pay and close the posting.
2. **At Barleycross:** tell Wenna Hart in person. She takes the news to the family.

### The pouch (the choice)

The player may be holding the camp's 6 silver when they report. They can:

* **Hand it over** along with the tag, as the dead party's money for the family.
* **Say nothing and keep it.**

I would make this the whole moral weight of the quest, with no extra item for either choice, and let each ending change only what the people say afterwards (Wenna's reply, whether the clerks mention a shortfall). The player is never told what the "right" choice is.

### Pay *(my suggestion)*

8 Silver Marks from the Hall for the tag. Nothing else. The Hall Insignia is required to take the job (1 silver, which the player may already own).

### Failure and lapse

* If the term runs out, the posting disappears with no message, as with the other jobs.
* If the player never finds the tag, they can still tell Wenna what they found (the camp, or the bodies seen without the tag) for a partial ending with no pay.

### Build notes (for me, not for you to decide)

* One flag block in a startup part, one posting block in `factors_hall.txt` at the job slot, one block each in Barleycross and Ashrun Holt, two small additions to Rooms 10 and 12.
* The new lines are written to the narrative guidelines: player words inside the conversations, contractions, first meeting spoken and later visits described.
* Page-refresh checks on every page that pays or grants the tag.

---

## PART 2: AMBROSE'S REQUEST

Moved to its own file, with all of its prose, dialogue and choices written out for review: [Ambrose's Deep-Wood Order.md](Ambrose's%20Deep-Wood%20Order.md).

---

## QUESTIONS

Answer in place. If you would rather I just choose, write "your call" and I will use my suggestion.

### Part 1

**1. Patron.** Who is the posting from?
* (a) The Gilded Scales clerks at the Factor's Hall: needs the Hall Insignia, pays from the Hall. *(My suggestion.)*
* (b) The family, as a private notice pinned on the board by Wenna Hart: no Insignia, and the pay is smaller because it is a farming family's savings.
* (c) Both, as two separate postings with different pay and a different ending.

Your answer:  Lets go with B here, it makes more sense.

**2. Pay.** Is **8 silver** from the Hall right for dangerous work, with no Gilded Scales standing added? Higher, lower, or add some standing?

Your answer: I think 8 silver is fair here, worth the risk.

**3. The pouch.** Is "hand it over or keep it, the choice is the whole payoff" what you want? Or should one choice carry a small mechanical consequence (for example Wenna Hart's goodwill, or the Hall's)?

Your answer: I've always wanted to add in a Farm ownership, Wenna's goodwill can go a long way here, so goodwill from wenna makes sense if you hand it over, it'll play divends.

**4. Do you want the party's names and the tag?** Aldis Pellam, Marr and Joss, and a brass licence tag from the Hall, are all invented. Keep, rename, or cut the tag and make the proof something else (the broken bow, a letter, a ring)?

Your answer: I think the Insignia tags being retrived is a good idea, the Hall can even pay a small fee for returned tags.  Leave out the broken bow, letter and ring. 

**5. Number of leads.** Three leads (Hall, Barleycross, Ashrun Holt) are optional and each helps. Is that the right size, or do you want one or two to be required for the ending?

Your answer: This is the right size.  THis is the right size. 

**6. Both ends of the report.** Should the player report to the Hall and to Barleycross (two short scenes), or just the Hall?

Your answer: Technically how this works is that we never report to the to the hall, on quest completion, this follows the same way we've done our jobs in the notice board in Port Valen Civic quarter.

**7. Should this count toward the level-2 quest pool?** Radiant jobs never count. This one is closer to a real quest. I would count it only if you want it to be one.

Your answer: Ah yeah, it would count towards the level 2 quest pool, also make the return of the bear cub count towards the level 2 quest pool as well.

**8. Anything to add to the forest side?** For example a sign near Room 10 that the guards fought back, or a third set of tracks that does not belong to the party, left open as a seed for a later quest.

Your answer: I think this is a good idea, we can do this. 

### Part 2

Moved with the rest of it to the Ambrose file: your answers (hook B, 3 shadefern and 2 acorn truffle, payment above market price, starting in Port Valen) are recorded there.

### General

**13. Order of work.** Part 1 first and Part 2 after, or the other way round?

Your answer: Whichever you think best. 

**14. Anything else you want added, cut or changed?**

Your answer: No, but don't work on any Ambrose things yet, untill the quest is finished, consider the ambrose thing a seperate quest for now, we'll deal with it after the Wenna one.
---

## DECISIONS AND WHAT WAS BUILT (2026-10-18)

From your answers: the family posts it (Wenna Hart, no Insignia), 8 silver, handing over the pouch earns Wenna's goodwill (kept for the farm you mean to add), the brass tag is the proof (Wenna keeps it; the Hall's fee for a returned tag was built and then removed at your request, as a loophole), nothing else as proof, three optional leads, the job is taken and reported at Wenna's bench and never at the Hall, it counts toward the level-2 pool, and so does returning the bear cub. Ambrose waits.

Built: `web/mygame/scenes/timbermouth/barleycross/overdue_peddler.txt` (Wenna's conversation and report), the notices on both boards, the Hall clerk's lead at the counter, Odile and Bram's lead, the camp and clearing additions, the tag item, and the two level-2 pool counts. The full list is in `quest/GAMEPLAY_MECHANICS_RULES.md`.

Things I decided that you did not rule on: no term or lapse (a real quest, not a radiant job); a bare "told" report closes the job with no pay and no credit; the fight-back sign is at the camp and the stranger's tracks (a seed only) are in the clearing; the tinker was Aldis Rennick until you caught that the surname belongs to the Port Valen curing sheds, and is now Aldis Pellam.

### Change the same day: the patron is the wife, and it is a notice

You pointed out that Wenna Hart has nothing to do with it, and that it is about a wife and her missing husband. So the patron is now **Merel Pellam**, Aldis's wife (her name and the girls are mine). It is a plain notice: reading the new paper on the Gathering Hall's plank board and choosing "Take the job" accepts it, with no conversation first. The Timbermouth Hall board copy is display only. You report at **her cottage, the last house on the Barleycross Lane**, where her first conversation is the one place the quest is explained. Handing over the camp's 6 silver now has her promise that Wenna Hart will hear of it, which keeps the goodwill for your farm idea. Wenna herself is back to being only the village head on her bench.

### Reworked to your outline (2026-10-18, later the same day)

You said a job is found on the job board, and gave a new outline. The quest is now: the **posting** is on the Timbermouth Factor's Hall board and the Barleycross notice post; the **wife, Merel Pellam,** gives it at her cottage on the Lane; **Aldis was a plant gatherer** (rare plants sold in Port Valen) with two bodyguards; she has **already held his funeral** and wants closure, not a rescue; the leads are Merel herself and **the woman at the Ashrun House counter** (people saw him go in with two guards), with Odile and Bram's scream kept as an extra; the **proof is the pouch** from the camp. She pays 8 silver for the news (having seen the clearing with the dead). **Handing the pouch back with what is left of its silver is the only thing that gives her closure and her favor.** The brass tag, the Hall clerk's lead and the "told without proof" ending are gone.

Things I decided that you did not rule on: the news is "you have seen the Trampled Clearing" (the pouch is not needed to be paid); handing back what is left of the six silver counts even if it is less than six, or nothing; the camp's goods are now a gatherer's presses and drying frames; the posting is seen on both boards and it is the only thing that shows the cottage.

### Taken on the board, with the Insignia (2026-10-19)

You pointed out that the posting had no way to accept it on the board, so it never counted on the Insignia and never showed in the sidebar. Now the posting on the Timbermouth Hall board and on the Barleycross notice post has "Press your insignia to the posting and take the job" (without an insignia it says the Hall's insignia is needed and where to buy one, as the courier postings do). Taking it lists it in the sidebar's active quests as "Word of Aldis Pellam" with the level-progress note. Finishing it (giving Merel the news) adds one to the Insignia's job count. Her cottage is the briefing and the place you report; it is offered on the lane only once you have taken the job.
