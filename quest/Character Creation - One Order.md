# Character creation in one order (prologue restructure, BUILT 2026-10-21)

**Built as answered:** the class page goes after race, the one-liners stand, picks are "Name. one line", the trial scenes are cut for a short muster, and class titles are the plain class name. **One correction to this document:** the pick text was not copied out per origin branch as I wrote above; each class's picks existed once. The saving came from cutting the three story scenes (996 lines to 369 for the muster, plus a 567-line class page). See the rules entry "Character Creation in One Order".

For you to mark up before anything is built. Anything marked *(invented)* is mine. Answer in place under the QUESTIONS at the end; "your call" means use my suggestion.

---

## What I took from you

* **The class is chosen from a plain list: its name and one line.** No class descriptions, and **no scene that shows the class in action**.
* **Origin no longer limits class.** Any origin can take any class.
* **Cut what can be cut** when it has no major knock-on effect later. Most of what the prologue sets has none.

---

## How it is now, and what is wrong with it

1. **Intake** (`company_intake.txt`): name, origin (three flashbacks), race, build, features, skin. Then three origin-specific "quartermaster" scenes that only hand over a cloak and boots and say *"the iron comes after the trial"*.
2. **Camp night** (`camp_night.txt`): seven NPC visits. The class is **not known yet**, so its four class checks are dead (see below).
3. **Dawn trial** (`dawn_trial.txt`, 996 lines): **the only place the class is chosen**, through story choices, in three origin-specific scenes (Ashbrook: Fighter or Barbarian; Outlaw: Rogue or Ranger; Disgraced: Bard, Wizard or Warlock). The class's picks (cantrips, spells, fighting style, patron, invocation) sit inside it and are **written out again for each branch**: the Wizard's cantrip picks appear 13 times, the Warlock's 9, the Bard's 8.
4. **Muster** (`trial_converge`): the class kit is issued and the "CLASS PATH DETERMINED" card prints, then **squad assignment** (Vanguard, Scouts or Cadre, from the class).

So the class lands a third of the way in, behind a story choice, tied silently to origin.

---

## The new order

1. **Name** *(unchanged)*.
2. **Origin** *(unchanged: three flashbacks, sets origin only)*.
3. **Race** *(unchanged)*.
4. **Class, new:** one page, seven options, each a **name and one line**. Choosing it sets everything the trial used to set (below), then goes straight to that class's picks, **written once**.
5. **Appearance** *(unchanged: build, features, skin)*.
6. **Camp night** *(unchanged scenes; the class checks wake up, see "Knock-on effects")*.
7. **The muster at dawn, new and short:** a bridge of about 300 words (the horns, the quartermaster issuing your kit, the company forming up) in place of the three trial scenes. It then runs the existing issue-the-kit lines, the "CLASS PATH DETERMINED" card and **squad assignment exactly as they are today**.
8. **Battle of the Black Sinks** *(unchanged)*.

### The class page *(the lines are mine, for you to rewrite)*

* **Fighter:** a trained soldier in heavy armor, skilled with every weapon and hard to put down.
* **Barbarian:** a rage-fuelled brawler who hits harder than anyone and shrugs off what would fell others.
* **Rogue:** a quick-handed skirmisher who strikes from advantage, picks locks and slips away.
* **Ranger:** a hunter of the wild with a bow, a tracker's eye and a little nature magic.
* **Bard:** a silver-tongued performer who charms, inspires and casts from a song.
* **Wizard:** a scholar of the arcane with the widest spell list and the frailest body.
* **Warlock:** a pact-bound caster whose power comes from a patron: few spells, renewed on a short rest.

### What choosing a class sets *(nothing new, all taken from the trial)*

`character_class`, `class_title` (e.g. "Shield-Wall Anvil (Fighter)"), `class_name`, the hit die, the class feature titles and descriptions, and the Rogue's and Ranger's fixed expertise. Then **the picks, once each**:

* **Fighter:** fighting style (Defense, Dueling, Great Weapon, Protection).
* **Barbarian, Rogue, Ranger:** no picks.
* **Bard:** two cantrips and two spells.
* **Wizard:** three cantrips and one spell.
* **Warlock:** patron (Archfey, Fiend or the Great Old One), two cantrips, one spell and an invocation. The Great Old One keeps its `codex_the_drowned` lore unlock.

**The pick wording:** the trial words every pick as story (*"Reach for it and feel your palm go slick and sour..."*). In the creator I would show each pick as **its name and one line**, using the descriptions the picks already carry (`wizard_cantrip_desc` and the rest). Question 3.

---

## What is cut

* The three trial scenes, `trial_ashbrook`, `trial_outlaw` and `trial_disgraced`, about 600 lines of prose, and their origin-to-class gate.
* The copies of the pick blocks. The class picks are written once, which should take the file down by several hundred lines.
* The three origin quartermaster scenes in intake keep their cloak-and-boots moment, but their lines *"the iron comes after the trial"* and *"holding the racks back until the trial has shown what you are"* (six lines) are reworded to *"after the muster"*.

## What is kept as it is

Squad assignment and its three squad scenes, the kit issue (`grant_class_armor`, `grant_class_weapons`, `kit_prose`), the "CLASS PATH DETERMINED" card, the origin flashbacks, race and appearance, camp night, and the developer presets (they set origin and class directly and are not touched).

---

## Knock-on effects I checked

* **Origin elsewhere is flavor, with one perk.** Port Valen gives `origin = "outlaw"` the same street-wise read as Wisdom 13 (`wisdom >= 13 or origin = "outlaw"`, in five scenes), and a few scenes have an origin line (Alderford, the Black Sinks, the equipment's starting clothes, which are identical for all three). None of them looks at class, so every new pairing (an Ashbrook Wizard, an Outlaw Fighter) reads fine. I found nothing that needs the old pairings.
* **Camp night's four class checks wake up.** Today they cannot fire, because the class is unset: the Bard's charm line (138), `[Hardened by Loss]` for origin Ruined **or** Warlock (151), the Wizard's line (271) and `[Already Forged]` for origin Ruined **or** Fighter or Barbarian (285). With the class known, those options become real choices for those classes (small bond and respect gains: Lyra +5 or +6, Varren +6). That reads as a bonus, not a problem, and I will read each of the four once before calling it done.
* **`class_assigned`** is only set at the muster and by the developer presets; nothing reads it elsewhere, so it moves with the kit issue.
* **Scripted tests:** six play scripts jump into the trial's pick labels (`control_flames_warlock_picks`, `poison_spray_*_picks`). They move to the new pick labels.

---

## QUESTIONS

**1. Where the class page goes.** After race and before appearance (my suggestion), or after appearance?

Your answer: Your suggestion

**2. The one-line descriptions.** The seven lines above. Keep, change or rewrite?

Your answer: I'll go with your choice here. 

**3. The pick wording.** Each pick shown as its name and one line, not the trial's story wording. OK?

Your answer: Sounds okay

**4. The muster bridge.** The three trial scenes and their origin prose are cut and replaced by one short muster scene (about 300 words) before the existing kit and squad lines. I will write it for you to read before building. OK to cut them outright?

Your answer: It's okay to cut them if easier. 

**5. Class titles.** "Shield-Wall Anvil (Fighter)", "Cutpurse Shadow (Rogue)" and the rest come from the trial's choices. Keep them as the class title on the card, or show only the plain class name?

Your answer: Show only the plain class name. 

**6. Anything else you want added, cut or changed?**

Your answer: Nothingelse. 
