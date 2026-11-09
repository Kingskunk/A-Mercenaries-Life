# Black Oath Faction Quest Plan

> **Prototype notice — not concrete story canon.** This is a rough direction for the Black Oath arc, not a locked quest list, rank structure, cast, or location map. Names, requirements, outcomes, and even the number of tiers could change as the game and its level system grow. Its purpose is to protect the intended shape: the player earns access through work, and each step takes them to someone with more authority than the last.

## Core Direction

The Black Oath should feel distributed, practical, and cautious. The player begins by doing useful work in one Dredge-End ward; they do not meet the whole organization at once. Repeated work earns an introduction, named work earns a better introduction, and each promotion changes who is willing to deal with them.

Hask is the **first sponsor**, not the faction's permanent quest giver. He can test a newcomer, vouch for them, and bring them to the first door. He should not be the person assigning every important Black Oath job or representing the Oath's highest authority.

The associate reveal should be restrained. Hask names only the Black Oath and his own role in putting the player forward; he does not explain the brotherhood's size, hierarchy, or safe houses. If the player accepts, Hask puts their name forward for a real night contract, not a visible cord, badge, or equipable faction token. The player meets the woman upstairs during that contract's briefing.

The upper room of the Duckboard Market rope-and-oil house is a place for local accounts, disputes, and introductions. It is deliberately too small to be the Black Oath's headquarters. The shop sells legitimate boat supplies by day; after dark its locked front and upstairs room provide cover for local business.

## Current Foundation (Implemented)

- Scrap sales lead to Hask's courier work; successful rounds establish a hidden early connection.
- Hask's recruitment ladder is deliberately slow: six successful five-hour scavenges produce six separate scrap sales, then six successful six-hour courier rounds earn his sponsorship.
- After enough successful rounds, Hask identifies the Black Oath by name and can sponsor the player as an **associate**, not a sworn member.
- *The Night List* is repeatable night work after association: one run per campaign day, 18 copper per successful route, and a lifetime-success counter. The first run always has the lane confrontation; later runs roll a hidden 1-in-8 chance for it. Its first success grants standing; later runs do not farm it.
- `black_oath_status` ("outsider"/"contact"/"associate") tracks how the network receives the player. `black_oath_rep` and `black_oath_heat` existed as a small reputation/attention foundation but were removed 2026-11-09 (NPC/faction regard refactor): neither ever gated anything. Future standing or attention effects should be specific quest/event flags, not a reputation or heat counter.
- The Silt-Gate outcome and an outlaw origin both still affect the Oath's reception of the player, but through flags (e.g. `silt_gate_resolution`, `silt_gate_face_seen`) rather than a counter.
- Lyra's current aftermath points toward unfinished Black Oath business rather than treating the Five Silver plot as a full resolution.

These are foundations, not a promise that the proposed titles or counters below must be added exactly as written.

## Proposed Access Ladder

| Provisional standing | Who opens the door | What it means |
| --- | --- | --- |
| Outsider | Hask, a scrap-yard middleman | The player is untested and only sees ordinary work. |
| Contact | Hask's unnamed courier connection | The player has delivered reliably but still does not know the employer. |
| Associate | Hask as sponsor | The player knows the Black Oath's name and may accept paid, unsworn work. |
| Ward Hand | A ward keeper | The player can take named work affecting one ward and is judged on outcomes, not just obedience. |
| Trusted Hand | A higher operational figure, such as a river boss | The player is trusted with work crossing wards, crews, or real danger. |
| Sworn, Ally, or Enemy | Central Black Oath leadership | A later endpoint determined by the player's choices, rather than an automatic promotion. |

Only the first three rows are represented in the current game. The later names are placeholders. Their important function is the progression of authority: Hask introduces the ward keeper; the keeper introduces the next officer; a higher officer eventually offers access to central leadership.

## Provisional Character: Mara Vey

**Planning only.** The woman upstairs is not named in the current game, and none of this background is presently player knowledge. Do not add it to her first briefing or her lore entry until there is a specific scene in which the player can learn it.

Mara Vey is a human woman of about forty: compact and broad-shouldered, with dark hair cut at the jaw and grey beginning at her temples. Her hands are clean but rough at the fingertips, marked by old needle pricks and small burns from lamp wicks and sealing wax. She dresses in plain dark wool suited to a room that smells of oil and hemp. Her authority is quiet. She remembers a name, an amount, and a promise, and does not need to raise her voice to make people take notice.

Her life begins outside the Black Oath. She grew up above a sail-mender's room near the canal. Her mother repaired canvas and her father carried freight for hire; keeping household accounts taught her letters and sums. As an adult, she made legitimate work from settling boat shares, writing debt notes, and helping crews understand what they were signing. Her husband is a river cook who took steady work upriver years ago. They see each other only a few times a year, but their marriage is not a tragedy or a secret. Their adult son is apprenticed to a cooper in another ward; he knows she works late above the rope-and-oil house, not what that work is.

She first became useful to the Black Oath when a boatman's widow asked her to untangle the dead man's debts. Mara proved hard to cheat and fair when fairness was possible. The Oath is now part of her life, not its whole explanation. Her useful flaw is that she tries to solve every practical problem herself—money, food, debts, funeral costs—until she starts treating people as entries that have to balance.

**Reveal order:** let the player earn her name first, likely after a successful named job. Her family, earlier work, and the widow's debt should emerge in separate later scenes through conversation, neighborhood observation, or a problem that directly involves them. Never deliver her biography in one explanation.

## Quest Flow Prototype

### 1. First night contract: *The Night List*

**Implemented prototype.** Hask does not send the player upstairs merely to be seen. The woman upstairs needs an outside hand for a night route, and Hask has put the player's name forward.

The player enters the rope-and-oil house only after dark. The man on the stair admits them because Hask vouched for them, not because they carry a public token. Upstairs, the woman gives a practical briefing: collect two purses, exchange one for an oilcloth packet, then exchange that packet for the final purse. The player meets her during this briefing rather than in a detached introduction scene.

The player may ask only the questions needed to decide whether to take the work: what is in the packet, what is kept upstairs, and who the woman is. No complete map of the Black Oath, its leadership, or its other locations is volunteered.

The route is a night-only test of ordinary Oath work: carrying money and a sealed item for people who do not want either on their person. It ends with a street challenge and has a genuine loss state. Success records that the player has met the woman upstairs and can handle a named contract; failure costs the purse, standing, and safety.

After the first list, this becomes a **radiant contract** rather than a one-off quest. A new list can be accepted after dark once per campaign day. `black_oath_night_list_count` records successful runs for future progression gates. The first success carries the standing reward and level-progress credit; later successes pay the same 18 copper, but do not add standing. A failed run still loses the route's money, standing, and cover.

### 2. Second named work: *The Short Purse*

**Giver:** Mara Vey (the woman upstairs above the Duckboard Market rope-and-oil house).
**Prerequisites:**
- `black_oath_status = "associate"`
- `black_oath_night_list_count >= 3` (at least three successful runs completed)
- Time: Dusk, Night, or Pre-Dawn (the rope-and-oil house operates its backroom only during dark hours)

**The Premise & Community Stakes:**
Joram Kell, an unsworn barge-hand and Dredge-End resident, drowned two nights ago when an overloaded cargo barge tipped near the canal water-gates. Joram held a half-share in a two-man cargo boat moored at the Boat-Sheds slipway. By waterfront custom, the Black Oath oversees the boat-shed slip fund, a pooled subscription paid by local boatmen to maintain berths, grease rollers, and buy out dead or injured crew shares so a vessel can keep working without missing a tide.

The fund was supposed to pay out **24 copper bits** to buy out Joram's share for his widow (Tessa Kell), allowing his surviving sixteen-year-old partner, Derry, to assume full ownership under Black Oath convention and keep the vessel working. When Mara opens the lead subscription tin kept behind the net-maker's shed to settle the payout, it is **24 copper bits short**. 

Worse, Orren, a corrupt Gilded Scales collector who impounds boats for missing fees, has posted notice that if the dead man's share and mooring dues aren't cleared with stamped coin, he is seizing the boat as "unregistered abandoned tonnage" to auction at the high wharves.

Mara cannot simply top it off from Black Oath coffers without inviting every crew in Dredge-End to stop paying their subscription and expect free timber, nor can she allow the Gilded Scales to seize a hull and establish a legal foothold in *her* ward. She needs an outside associate hand who is known to be capable (from the Night List) to quietly track down the missing coin.

**The Outlaw Origin Interrogation Beat (`origin = "outlaw"`):**
*This beat triggers exclusively for characters with the Port Valen Outlaw background before the main briefing begins.*

When the player enters, Mara bars the door and sits across the slate table, measuring them in the candlelight. She brings up the description that reached Dredge-End months ago: a rogue fleeing an alley behind the canal brothel, two hundred pounds of an Oath collector with gold teeth left dead in the gutter, and six hundred silver marks missing from an upriver strongbox.

The player faces an immediate test:
- **Lie to Mara ("You've got the wrong runner. That wasn't me."):**
  - Requires a **Deception check [CHA DC 15]**.
  - *Success (`short_purse_outlaw_lied_passed`):* Mara studies your face, pauses, and lets out a dry breath. She accepts the denial (or decides not to press) and explains why she asked: she needed to know who was sitting in her room. She reveals that the blood bounty was quietly pulled down weeks ago anyway. The dead collector was despised across the water-streets, skimmed off his own crews, and was destined for a knife in the dark regardless; the Oath only posted the bounty because an organization that doesn't put a price on dead collectors looks weak to the other wards.
  - *Failure (`short_purse_outlaw_lied_failed`):* Mara spots the tell immediately (the involuntary twitch toward your belt, the defensive posture). She calls out the bluff coldly: *"Don't play me for a fool in my own room. The bounty's dead, and nobody shed a tear for that gold-toothed pig, he was skimming from everyone and due for the mud anyway. But if you lie to my face again, you won't walk back down those stairs."*
- **Tell the Truth ("He cornered me with a cleaver. I was faster."):**
  - *Resolution (`short_purse_outlaw_confessed`):* Mara leans back, respecting the blunt honesty. She confirms the same truth: the collector was widely hated, cheated the brotherhood's own boatmen, and had it coming. The bounty was an institutional formality to save face, quietly allowed to lapse once the noise died down. She appreciates knowing she is dealing with someone dangerous who doesn't waste her time with games.

After resolving this beat, the dialogue rejoins the main briefing (`short_purse_premise`), which non-outlaws enter directly. Mara gets straight to the problem at hand without wasting words on small talk: twenty-four coppers missing from the boat-shed slip box, and Orren is already circling the slipway.

**Investigation Beats (Branch-and-Bottleneck):**

1. **Beat 1: The Net-Maker’s Shed (The Crime Scene):**
   - The player visits Old Vond at the boat-sheds where the tin was kept.
   - *Investigation/Insight check (DC 11) or carried tool:* The lock was not forced with iron; it was opened with an oiled wire, or someone knew where the hidden peg was. Vond reveals that young Derry, Joram's sixteen-year-old partner and co-owner of the skiff, panicked after Orren threatened him with debtor hulks, stole the 24 coppers to pay off the Scales, and bolted toward Lamp Stair.

2. **Beat 2: Tracking Derry (The Confrontation at Lamp Stair):**
   - The player traces Derry to the narrow alleys behind Lamp Stair. Derry panics and tries to scramble up an exterior cargo ladder or dart into a drainage chute.
   - *Tactical Rule of Three (Tactical challenge, non-structural):*
     - **Athletics (STR DC 12):** Sprint down the lane and tackle him before he reaches the upper boardwalk.
     - **Acrobatics (DEX DC 12):** Vault a stack of wet barrel staves to cut off his escape route down the drain passage.
     - **Intimidation / Streetwise (CHA DC 11):** Bark the Oath's night-warning into the dark; Derry freezes, knowing running from the Oath never ends well.
     - *(Fail-Forward):* If the roll fails, the player corners him after a noisy scramble through greasy gutters that costs 15 minutes, causes minor fatigue/bruises (-2 HP), and draws nervous stares from nearby shuttered windows.

3. **Beat 3: The Revelation & Dilemma:**
   - Derry is terrified, but he doesn't have the coin anymore.
   - *The Truth:* Derry didn't steal the money for dice or drink. When Joram drowned, Orren, a collector for the Gilded Scales, demanded an immediate 24-copper "unregistered tonnage fee" and threatened to chain the skiff and tow it to the upper wharves. Panicked that Joram's family would lose their only surviving income, Derry stole the 24 coppers from the slip-fund tin and handed it to Orren as a deposit, only for Orren to pocket the coin and insist on seizing the skiff anyway unless another fee was paid.
   - *The Decision Core (Three Meaningful Solutions):*
     - **Option A: The Cold Reclaim (Enforce the Code):** March Derry straight to Orren's toll-post, intimidate or strong-arm Orren into coughing up the stolen 24 coppers (STR/Intimidation DC 12 or Black Oath muscle). *Outcome:* The slip tin is fully restored. Orren backs down under Oath pressure but harbors a bitter grudge. Joram's surviving partner gets the boat, but Derry is publicly exposed as a thief. Sets `short_purse_resolution = "recovered_enforced"`.
     - **Option B: The Mercenary Pocket (Personal Subsidy):** The player covers the 24 copper bits out of their own coin pouch (paying 24 coppers, guarded by `currency_txn_locked`). Derry's theft stays hidden, the slip fund is restored for the widow, and Mara receives the full tin. *Outcome:* Solves the problem with zero street friction. Mara notices the clean minting of the coins with a keen eye, respecting the player's discretion while warning that soft hearts don't buy firewood. Sets `short_purse_resolution = "covered_pocket"`, `short_purse_derry_protected = true`.
     - **Option C: The Leveraged Compromise (Street Fixer):** Use Investigation/Persuasion (DC 12) to catch Orren in an illegal off-the-books extortion of a Black Oath slip. Orren folds, returning 12 coppers and dropping the seizure notice; the player gets Old Vond and the net-makers to cover the remaining 12 as a crew solidarity pool. *Outcome:* No coin lost by the player, the skiff is protected, and the crew solidarity is restored. Sets `short_purse_resolution = "brokered_compromise"`.

**Resolution & Aftermath:**
- Return to the upper room. Mara receives the 24 copper bits.
- **The Name Reveal:** Impressed by the player's ability to settle a neighborhood dispute without triggering a riot, a Watch raid, or a crew strike, Mara puts her chalk down and introduces herself properly:
  *"I am Mara Vey. People around Duckboard bring me their books when the numbers won't lie flat. When there is trouble in this ward that needs quiet iron or cool heads, I decide whose boots walk."*
- **Direct Associate Access & Mara Vey Reveal:**
  - `black_oath_status = "associate"` (remains a trusted associate; full sworn mob membership/Ward Hand promotion requires 1-2 more contracts)
  - `black_oath_mara_named = true`
  - Unlocks Mara as a direct contact in the upper room without needing Hask's vetting.
  - Adds +1 to `quests_finished` pool in `count_finished_dredge_end`.
- **Hask's Reaction:** When the player next visits the scrap yard, Hask grunts over his scales:
  *"Heard you settled the Kell business with Mara. Good. You're her runner now. Just remember who put your boots on her stairs."*

### 3. Further ward-level named work

**Suggested giver:** the ward keeper and perhaps one specialist the keeper trusts.

Rather than advancing after raw courier repetitions, this tier should use a small number of completed named jobs. The jobs can vary in tone—debt, missing cargo, neighborhood protection, internal discipline, or a problem created by the player's earlier Silt-Gate choice—but should show competing Black Oath priorities.

At this point, specific job-outcome flags should affect trust, payment, and who notices the player, how much cover they receive, or which solutions remain safe — not a reputation or heat counter (both were removed 2026-11-09; see Current Foundation above). No single flag should independently force the player's moral identity.

### 4. Higher-risk work: *A Boat Without a Bell* (working title)

**Suggested giver:** a river boss, introduced by the ward keeper after the player has proved useful.

A boat, cargo record, crew member, or signal route goes missing across ward boundaries. This is where the player stops being a useful local associate and becomes someone the Oath may trust with consequences beyond one room. It can support the game's more dangerous combat, rescue, investigation, and leverage options.

**Possible result:** Trusted Hand standing, plus an introduction to a person connected to the Black Oath's broader network.

### 5. Lyra crossover: *Names Under Wax* (working title)

**Suggested giver:** Lyra brings the personal reason; a rollkeeper, senior fixer, or other higher-ranked Oath contact controls the information. It should not return the player to Hask for another main quest.

Once Lyra has spoken about her scars and the Five Silver aftermath has settled, the player needs access beyond the ward's ordinary records. The task is not simply to fight another collection crew. It should reveal who protected, redirected, or profited from the old debt chain—and force a decision about what Lyra wants done with that truth.

This can be the moment that proves the faction and Lyra's arc are genuinely intertwined: the player needs Black Oath standing to reach the records, while Lyra's history makes the information matter.

### 6. Later faction endpoint

Do not lock this yet. A final arc should bring the player to a real central Black Oath location and a leadership-level decision, but neither the headquarters nor the leader needs to be named now. Plausible future sites include an old ropewalk, a flood warehouse, or a waterfront burial hall with records and river access.

The finish should be a choice of relationship, not merely a rank award: swear an oath, remain an independent ally, reshape a ward's practices, expose the network, or become its enemy. Whether any of those outcomes fit the wider game is still open.

## Advancement and Level-Gate Policy

Work should be visible before it becomes available. A player who has earned a referral should hear that harder work exists, with an in-fiction reason it is withheld—lack of experience, danger, scrutiny, or the need to prove themselves—rather than having the quest silently disappear.

- Use **completed named jobs**, not endless courier counts, for future promotions.
- Keep low-risk social or local work available at Level 1 when the fiction supports it.
- Gate genuinely dangerous follow-up work on both demonstrated trust and `character_level >= 2` once that work is implemented.
- Do not design Level 3 requirements yet; the current level groundwork defines the Level 1-to-2 path, not a complete later-level framework.
- Avoid committing to exact job totals until each tier has enough authored work to make those totals feel natural.

A useful long-term split is:

- **Status/rank:** which contacts and jobs the player can access.
- **Reputation:** how those contacts interpret the player's record.
- **Heat:** how risky it is for the Oath to publicly use or protect the player.
- **Hidden priorities (optional later):** community, order, and profit, recorded from choices without presenting them as morality meters.

## Design Guardrails

- Every advancement must introduce a person of greater Black Oath standing than the prior main contact.
- Hask remains relevant as a local sponsor and source of Dredge-End texture, but a higher-rank quest giver should take over as soon as the player becomes a Ward Hand.
- Do not give the player a visible Black Oath badge, cord, or uniform at associate standing. Their access comes from Hask's word and a single introduction; thereafter their conduct earns recognition.
- The chandler is a ward office, not a retroactive gang headquarters.
- A referral should feel earned by a specific completed problem, not by an invisible numerical threshold alone.
- Faction access should create new dilemmas and information, not only better pay or combat missions.
- Lyra's end state should have its own emotional resolution even if Black Oath faction content continues afterward.

## Before Implementing the Next Tier

1. **[RESOLVED in §2]** Define the ward keeper's personality, practical authority, and conflict with Hask's approach: Mara Vey values quiet neighborhood balance, clean tallies, and community stability, contrasting with Hask's purely transactional scrap-and-courier pragmatism.
2. **[RESOLVED in §2]** Decide the emotional outcome and branching resolutions of *The Short Purse*: Three meaningful branch resolutions (Cold Enforcement, Mercenary Pocket, and Leveraged Compromise), each tracking concrete consequence flags without relying on deleted numerical reputation counters.
3. **[RESOLVED in §2]** Opening state reads: Strictly the Outlaw origin (`origin = "outlaw"`) via a dedicated interrogation beat. Avoid gamey callbacks to Silt-Gate or past Night List tallies, Mara gets straight to the immediate ward crisis without conversational bloat.
4. Add a named-job progression counter only when there are enough named jobs to support it: *The Short Purse* provides direct access to Mara Vey as a vetted associate (`black_oath_mara_named = true`), and registers as a completed quest in `count_finished_dredge_end`. Full promotion to Ward Hand will require 1-2 further ward contracts as the player gets to know more of the syndicate.
