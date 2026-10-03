# Black Oath Faction Quest Plan

> **Prototype notice — not concrete story canon.** This is a rough direction for the Black Oath arc, not a locked quest list, rank structure, cast, or location map. Names, requirements, outcomes, and even the number of tiers could change as the game and its level system grow. Its purpose is to protect the intended shape: the player earns access through work, and each step takes them to someone with more authority than the last.

## Core Direction

The Black Oath should feel distributed, practical, and cautious. The player begins by doing useful work in one Dredge-End ward; they do not meet the whole organization at once. Repeated work earns an introduction, named work earns a better introduction, and each promotion changes who is willing to deal with them.

Hask is the **first sponsor**, not the faction's permanent quest giver. He can test a newcomer, vouch for them, and bring them to the first door. He should not be the person assigning every important Black Oath job or representing the Oath's highest authority.

The associate reveal should be restrained. Hask names only the Black Oath and his own role in putting the player forward; he does not explain the brotherhood's size, hierarchy, or safe houses. If the player accepts, Hask puts their name forward for a real night contract, not a visible cord, badge, or equipable faction token. The player meets the woman upstairs during that contract's briefing.

The upper room of the Duckboard Market rope-and-oil house is a place for local accounts, disputes, and introductions. It is deliberately too small to be the Black Oath's headquarters. The shop sells legitimate boat supplies by day; after dark its locked front and upstairs room provide cover for local business.

## Current Foundation (Implemented)

- Scrap sales lead to Hask's courier work; successful rounds establish a hidden early connection.
- After enough successful rounds, Hask identifies the Black Oath by name and can sponsor the player as an **associate**, not a sworn member.
- `black_oath_rep`, `black_oath_heat`, and `black_oath_status` provide a small foundation for how the network receives the player.
- The Silt-Gate outcome can improve or damage that reception, while an outlaw origin begins with both poor standing and active heat.
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

### 2. Second named work: *The Short Purse*

**Suggested giver:** the ward keeper, after the player has completed *The Night List*. Hask may recommend the player, but he does not own the assignment.

A common burial purse is short before a drowned boatman's funeral. The ward keeper needs the shortage handled quietly, because involving the Watch would hurt the family and expose the ward's informal relief system. She specifically needs someone who is not tied to one of her regular crews: the player can ask questions without every crew knowing who sent them.

This is a good first test because it makes the Black Oath more than a criminal employer: it is also entangled with the neighborhood's real survival. The player might recover the money, learn it was diverted to cover another loss, expose a skimming crew, protect a desperate runner, replace the purse, or make a damaging bargain. The result should introduce the ward keeper as a person with authority and values, not merely a new shopkeeper with a quest marker.

**Possible result:** a provisional promotion to Ward Hand and access to a small pool of ward-level named work. The keeper, not Hask, becomes the player’s main contact at this tier.

### 3. Further ward-level named work

**Suggested giver:** the ward keeper and perhaps one specialist the keeper trusts.

Rather than advancing after raw courier repetitions, this tier should use a small number of completed named jobs. The jobs can vary in tone—debt, missing cargo, neighborhood protection, internal discipline, or a problem created by the player's earlier Silt-Gate choice—but should show competing Black Oath priorities.

At this point, `black_oath_rep` can affect trust and payment, while `black_oath_heat` can alter who notices the player, how much cover they receive, or which solutions remain safe. Neither variable should independently force the player's moral identity.

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

1. Define the ward keeper's personality, practical authority, and conflict with Hask's approach.
2. Decide the emotional outcome and branching resolutions of *The Short Purse*.
3. Decide which current choices its opening should read: Silt-Gate result, Black Oath reputation/heat, outlaw origin, and Lyra's existing state.
4. Add a named-job progression counter only when there are enough named jobs to support it.
