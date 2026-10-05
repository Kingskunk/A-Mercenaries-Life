# Middle Ward Quest Plan

## 0. Status and Purpose

This document plans four new quests for Port Valen's Middle Ward. They should make the ward feel like the working center of the city: public water, rented rooms, skilled trades, street markets, and the small civic decisions that keep all of them functioning.

These are plans, not implemented quests. Add each quest to `quest/QUESTS.md`, `web/mygame/quest-data.js`, and the lorebook only when its implementation begins.

### Development order

| Order | Quest | Main locations | Type | Status |
|---:|---|---|---|---|
| 1 | **The Dry Lion** | Conduit Square, wash-house, Marda's bakehouse, a nearby tenement yard | Civic problem, investigation, moral choice | **Implemented** |
| 2 | **A Key for Every Door** | Terrace Lodgings, Vael & Son | Locked-room mystery | **Implemented** |
| 3 | **Smoke Under the Eaves** | Smiths' Row, Halda's forge, Conduit Square | Craft investigation, fire emergency | Queued |
| 4 | **The Honest Measure** | Conduit Square, Marda's bakehouse, market storage yard | Market investigation, civic corruption | Queued |

Only one quest should be brought through detailed design and implementation at a time. Lessons from the completed quest should be applied to the next one before its design is locked.

---

## 1. Shared Design Rules

- Keep the Middle Ward distinct from the Harbor and Dredge-End. These quests concern homes, workshops, water, food, and city services rather than ships, contraband, or territorial gangs.
- Introduce each problem through something the player can see, hear, or ask about. No NPC should identify a stranger as the solution on sight.
- Use a shared spine of **Entrance -> Puzzle -> Setback -> Climax -> Resolution**. Investigative approaches may differ, but they must converge before the setback.
- Every quest needs a genuine loss state. Failed investigation checks should usually cost time, evidence, trust, or position while allowing the player to reach the climax.
- Combat is a consequence of a failed or aggressive choice, never the assumed solution.
- Carried goods add options without becoming mandatory. A repair or mechanism task uses Investigation, Sleight of Hand, or both and automatically receives the Repair Kit's `+1` while the player carries it. The first suitable lock should establish the matching lockpick-set convention for **Thieves' Tools**.
- Keep rewards at street or ward scale: several silver marks, a one-use service, a local favor, or one point of appropriate standing.
- Aftermath should be proportional. Prefer changed greetings, one-shot rumors, and small services over rewriting the entire district.
- Severe weather may change the scene and checks, but it must not permanently hide a quest. The hot room can provide a fallback lead after the player misses or walks away from a street entrance.

---

# Quest One: The Dry Lion

## 2. Core Identity

**Working title:** The Dry Lion

**Status:** Implemented in `web/mygame/scenes/port_valen/MiddlewardQuest/dry_lion.txt`. Future revisions should preserve the runtime split and its separation from the Silt-Gate cistern route.

**Premise:** One of the four bronze lion heads in Conduit Square coughs up dirty water and runs dry. The failing flow threatens the wash-house, Marda's bakehouse, and nearby homes. The apparent theft of public water proves to be an illegal branch serving tenants whom the official system abandoned years ago.

**Entrance window:** The initial event is eligible only on **Greyday** (the ward's washday), during **Morning or Midday**, after the player has met both Marda and Merrin. This makes the first appearance part of the ward's working rhythm, prevents it from crowding the early game, and rewards returning to places the player already knows. Once the player has seen the event, the investigation remains available on later days and at other hours through the fountain, Marda, Merrin, and the hot-room lead.
**Themes:** Public need against private law; whether an illegal remedy is still theft when it corrects official neglect; the difference between restoring a system and making it just.

**Scale:** One public square, one opened hole in the paving where the pipe is exposed, one nearby tenement yard, and several hours. This is not a dungeon quest or a city-wide water crisis.

**The tenement yard:** A cramped shared paved yard behind a row of rented rooms, reached through a narrow passage off Locksmiths' Close. It has washing lines, back doors, refuse bins, and one shared tap. It is not an alley, a new district, or a permanent menu location. "Back court" is removed from this plan because it is not immediately clear modern language.

### Locked continuity decisions

- Conduit Square already has an octagonal fountain with **four bronze lion-head spouts** supplied by mountain water.
- The wash-house already receives water through a bronze pipe, and Marda's ovens heat its boilers.
- Two flat stone covers beside the fountain can be lifted, leaving a small fenced hole in the paving with the pipe exposed at the bottom. It is **not** the barred wash-house cover, the cistern ladder, or any part of the playable Silt-Gate Channels.
- The quest must not open `mw_cistern_open`, change the dungeon entrance rules, or require that the player has visited the dungeon.
- The hidden branch feeds the nearby tenement yard. It is a quest scene, not a new permanent hub location.
- There is no secret wealthy water thief. The first assumption is wrong: the illegal branch is keeping poor tenants supplied.
- The hidden line is old, repaired with mixed materials, and has finally split at a joint. Its leak, not ordinary household use, causes the serious loss of flow.
- The Repair Kit provides an automatic `+1` on a grounded repair or mechanism check while the player carries it. Players without it still have viable routes. The scene marks the task as a repair; it never needs a separate inventory branch.
- `Mending` may repair a small, clean break when the player has correctly located and exposed it. It cannot replace missing pipe, shore up loose paving, or settle who receives water.

## 3. Cast and Personal Stakes

### Existing characters

- **Merrin:** Loses bathing and laundry water. She understands how the wash-house line behaves and can identify when the trouble is upstream. Her concern is keeping the yard working and preventing burns or flooding around the boilers.
- **Mother Marda:** Her ovens heat the bath water, and her bakehouse depends on reliable clean water. Closing either business harms the other. She can supply workers, boards, cloth, and practical knowledge of the wall shared with the boilers.

### New quest roles

- **A city clerk for water lines:** A city employee responsible for the public line. Their first duty is to restore the fountain and registered businesses. They are not secretly responsible for the leak, but they regard the unregistered branch as theft and will order it sealed. The plan no longer calls this person a "conduit keeper"; that title is vague and risks colliding with existing uses of "keeper."
- **A tenant from the yard:** Knows the unofficial line's history. They are protective, suspicious of city officers, and unwilling to let the branch be cut without a replacement.
- **One older resident or former repair hand:** Can establish who fitted the line and why, but only if the player earns cooperation. This testimony can support the strategic resolution.

Names, appearances, histories, and existing NPC connections should be designed before prose implementation. Their names and jobs must be learned in the scene rather than supplied by narration. In the prose, people are first described by visible action and appearance; for example, a blue city badge, a rolled-sleeve worker moving pails, or a flour-dusted apprentice carrying empty buckets. The city clerk states their own name and office after the player speaks to them.

## 4. Entrance

### Preferred trigger

- Quest stage is `"unstarted"`.
- The player has met both Marda and Merrin: `mw_bakehouse_seen` and `mw_baths_seen` are true. The quest can therefore use their names in menu text and give the player existing relationships to care about.
- The first scene triggers on Greyday in Morning or Midday. The player sees it only on a later return to Conduit Square, never on their first arrival in the ward.
- After `dry_lion_hook_seen` is true, the quest is available on later days and at other hours through persistent changed locations and the hot-room lead.
- Severe weather changes who remains outside but does not cancel the entrance.

### Visible entrance scene

On returning to Conduit Square, the player sees the south lion spout cough brown grit into a waiting pail and stop. A second spout weakens. The disturbance grows naturally:

- a dwarf woman with her sleeves tied above the elbow shifts two pails toward the remaining water;
- a young human apprentice in a flour-dusted apron hurries from Marda's with empty buckets;
- a horned tenant in a patched green coat argues that the wash-house has taken more than its share;
- a dark-skinned man in a blue city coat and brass badge clears space around the fountain, directs two laborers to lift the stone covers, and only names himself and his office when questioned.

Nobody asks the player for help immediately. The player may:

1. Examine the dirty water and fountain in silence.
2. Ask the woman moving pails, "When did the water first turn brown?"
3. Tell the man directing the work, "Show me what you have found."
4. Say to the arguing crowd, "One at a time. What stopped first?"
5. Walk away.

Investigating or asking questions opens the job naturally. Walking away leaves the problem active. A later hot-room rumor or changed fountain button leads back to it.

The player is not mute. Any investigation choice that starts with a question, accusation, request, or promise must give the player an actual spoken line before the other person answers.
### Problem as first understood

Once the blue-coated man introduces himself as the clerk responsible for this stretch of line, he explains that water is escaping somewhere between the fountain and the wash-house branch. He believes an unregistered connection is drawing too much from it. Unless the fault is found, the public fountain must be reduced and the wash-house closed while a city crew is summoned.

The player is useful because the clerk has too few hands, Marda and Merrin cannot abandon their businesses, and the crowd trusts none of them enough to answer freely. The player volunteers, negotiates payment, or begins investigating independently; nobody assigns the task merely because the protagonist entered the square.

## 5. Puzzle: Finding the Lost Flow

The investigation uses three principal approaches. Each has a concrete, physical route to the same opened hole in the paving and the hidden branch. The prose should not pretend that a vague observation solves a pipe problem.

### Approach A: Follow the pipe and inspect the fittings

- Join the clerk at the opened hole beside the fountain and inspect the exposed pipe.
- Find the crude second fitting attached to the public pipe, then identify the split joint and mixed old repairs around it.
- Use Investigation, Sleight of Hand, or either skill to tell which section is leaking and which part can still be safely clamped. The scene marks this as a repair task, so the shared check engine automatically adds `+1` if the player carries the Repair Kit.

**Success benefit:** The player identifies the cracked joint before the laborers open the second stone cover and gains an easier climax repair.

**Failure cost:** The player spends time scraping and testing the wrong patched section. The clerk finds the split before the player does, but the leak worsens while the crowd waits.

### Approach B: Read the water and the street

- Compare the four spouts while people draw water and notice that the brown water runs from one edge of the fountain toward a narrow passage off Locksmiths' Close.
- Follow the thin surface trickle and the hollow rattle beneath two loose paving stones.
- Reach the tenement yard and see that its shared tap is still pulsing in time with the weakened fountain.
- Ask the tenants where that tap's pipe runs, rather than accusing them of stealing water.

**Success benefit:** The player reaches the hidden line without publicly accusing the residents and gains their initial cooperation.

**Failure cost:** The surface trickle vanishes into the wash-yard runoff before the player can follow it. The clerk reaches the tenement yard first and makes the tenants defensive by calling the line illegal.

### Approach C: Shut branches and organize the ward

- Ask Marda and Merrin, both already known to the player, to close their separate valves in turn.
- Watch the fountain while each line is closed, proving that neither the ovens nor the baths is causing the loss.
- Ask the clerk to open the second stone cover once the known branches have been ruled out.
- Keep the frustrated crowd from opening taps again before the test is complete.

**Success benefit:** Marda or Merrin publicly backs the player in the later dispute, and the player knows the wash-house is not causing the loss.

**Failure cost:** The crowd interrupts the test and the clerk initially orders the wash-house shut as a precaution. The physical evidence still appears, but Merrin begins the later dispute angry and unsupported.

### Additive item and ability options

- **Repair Kit:** Automatic `+1` on the diagnosis or repair check; never required.
- **Chalk:** Mark tested branches or the movement of water around a joint, granting a smaller investigation benefit if consumed under the normal carried-good rules.
- **Rope:** Help raise an inspection cover or brace loose stone, creating a safer physical option.
- **Mending:** Repair a revealed small split, provided the surrounding line is still sound.
- Other spells should be added only after the available spell list and their physical limits are audited.

### Shared discovery

The opened hole exposes a narrow, patched branch leading toward the tenement yard. Its fitting is unofficial, but old tool marks and accumulated mineral stain show that it has existed for years. The joint has recently split, and much more water is soaking into the ground than reaches the homes.

## 6. Setback

The obvious solution is to seal the illegal branch. The city clerk prepares to do exactly that.

Residents of the tenement yard arrive and reveal that their registered pipe was cut off years ago after an absentee owner stopped paying city charges. They have paid rent ever since, but nobody restored the service. A former conduit worker fitted the hidden branch so the families would not have to carry every bucket from the public square.

Before the argument can be settled, the water that has been escaping underground gives the ground beneath a nearby stone nowhere to hold. The stone sags into the opened hole and pulls the already cracked joint apart. For a moment water pours into the hole while the fountain runs almost dry: this is the same shortage made visible, because the mountain water is now spilling into the ground instead of reaching the spouts and homes. The player has an immediate physical problem and a political decision that cannot both be postponed.

Earlier successes determine:

- whether the player knew the joint was close to failing;
- whether the residents trust the player;
- whether Marda or Merrin publicly supports continued service;
- whether the player found old work marks or testimony that can be used against the city's neglect;
- how difficult the climax repair becomes.

## 7. Climax

### Route A: Seal the branch under city law

The player helps the city clerk close the illegal line and shore up the public pipe. This is the safest technical solution and can be completed without risking a failed improvised repair.

- The fountain and registered businesses regain full flow.
- The tenement yard loses its only nearby water source.
- The player may arrange temporary access at the public fountain, but that does not erase the consequence.

This is the lawful resolution, not the morally perfect one.

### Route B: Repair the branch quietly

The player rejects the city clerk's order or works before it can be enforced, braces the exposed pipe, and repairs the split while leaving the hidden branch in service.

Possible methods include:

- an Investigation or Sleight of Hand repair, with the Repair Kit's automatic `+1` if carried;
- `Mending` after cleaning and aligning the break;
- a physical brace while Merrin's or Marda's workers fit a clamp;
- a coordinated repair using clues and help earned during the puzzle.

A failed climax check breaks the weakened section beyond an immediate repair. The main line must be closed until a proper city crew replaces it.

This route protects the residents but leaves the illegal arrangement vulnerable to later discovery.

### Route C: Make the city recognize the line

The player repairs or stabilizes the break openly, then uses accumulated evidence and support to prevent the keeper from sealing it:

- old city work marks or testimony show that officials knew of the connection;
- Marda and Merrin can make the economic cost of closure public;
- cooperative residents can prove they have been paying rent that was supposed to include water;
- the threat of taking the facts to the Council's open roll can force a temporary registration and inspection.

With strong evidence, this route succeeds without reducing the decision to one Persuasion roll. With weak evidence, the player may attempt a harder social check and risk falling back to either sealing the branch or making a rushed quiet repair.

This is the strategic resolution: little immediate profit, but a durable local change and stronger allies.

## 8. Resolution and Consequences

Rewards remain provisional until the coin and reputation audit during implementation.

### `city_sealed` — lawful

- Public flow and registered businesses are restored.
- Tentative reward: **4 Silver Marks** from the city and `gilded_scales_rep +1`.
- The city clerk regards the player as reliable.
- Tenement-yard residents distrust the player.
- Merrin and Marda accept the result but do not celebrate it.

### `hidden_repaired` — communal but unlawful

- Both the square and the tenement yard keep water.
- Tentative reward: **2 Silver Marks** collected locally, plus a one-use free soak or meal.
- The player earns the confidence of the residents and Merrin.
- No official standing is awarded. The hidden branch remains future leverage or future trouble.

### `line_registered` — strategic

- The break is repaired and the branch receives temporary legal recognition pending inspection.
- Tentative reward: little or no immediate coin, a free local service, resident confidence, and a durable favor from Marda or Merrin.
- The player gains proof that back-court rent was collected without the promised water service. This may connect to a later landlord, Council, or housing story.
- The city clerk may become a reluctant contact rather than an enemy.

### `failed` — genuine loss

- The joint breaks beyond an immediate repair, and the main line is closed until a city crew replaces the damaged length.
- The bath and part of the bakehouse lose service for a short, fixed period; the tenement yard is cut off.
- No payout is awarded.
- After the fixed outage, ordinary hub services return so the failure does not permanently damage the player's save.
- One-shot aftermath prose and hot-room gossip remember the failure.

### Revelation

The quest begins as an apparent case of stolen public water. Its final truth is that the illegal branch served people whom the official system had abandoned, while the damaging loss came from neglecting the old repair rather than from the amount they used.

## 9. Planned State

Names may be shortened during implementation, but the state should cover these jobs:

```text
dry_lion_quest_stage          "unstarted" / "active" / "resolved"
dry_lion_resolution           "city_sealed" / "hidden_repaired" / "line_registered" / "failed"
dry_lion_hook_seen            initial square event has played
dry_lion_rumor_heard          fallback hot-room lead has been heard
dry_lion_approach             "fittings" / "water" / "coordination"
dry_lion_joint_found_early    easier technical climax
dry_lion_residents_trust      tenants cooperate
dry_lion_marda_support        Marda will speak publicly
dry_lion_merrin_support       Merrin will speak publicly
dry_lion_old_mark_found       evidence for recognition route
dry_lion_outage_until_day     temporary failure aftermath, 0 when unused
dry_lion_reward_claimed       one-time payout guard
dry_lion_aftermath_heard      one-shot hot-room aftermath guard
dry_lion_free_service         one-use local reward if a route grants it
```

The final variable pass must also add:

- one quest object to `web/mygame/quest-data.js` while active;
- lorebook unlocks for any named new NPCs, set only when their names are learned;
- a summary in `quest/QUESTS.md` once the quest is implemented;
- save-migration defaults if the project's current save format requires them.

## 10. Implementation Sequence for The Dry Lion

### Runtime file split

- `web/mygame/scenes/port_valen/MiddlewardQuest/dry_lion.txt` owns the main quest: investigation, choices, checks, setback, climax, rewards, resolutions, and all return hand-offs.
- `web/mygame/scenes/port_valen/port_valen_middle_ward.txt` owns only physical integration: the Greyday fountain trigger, persistent return buttons, small NPC hooks, and result-specific aftermath prose.
- Future Middle Ward quests receive their own files beside `dry_lion.txt`. They are registered directly in `compile.js`, following the project's existing `*goto_scene`-only scene pattern rather than being placed in the startup `*scene_list`.

1. **Lock the cast and geography.** Name and connect the city clerk, tenant spokesperson, and older witness; decide where the tenement yard sits relative to the square.
2. **Lock the outcome economy.** Confirm coin, reputation, local favors, and exactly what the temporary outage changes.
3. **Add state and quest tracking.** Declare lifecycle, clue, reward, rumor, and outage variables; add the active sidebar entry and required lorebook entries.
4. **Build the entrance and fallback hook.** Change Conduit Square and the spout interaction while the quest is active; insert the priority hot-room rumor.
5. **Build the three puzzle approaches.** Each gets one distinct check, one success benefit, and one fail-forward cost before converging.
6. **Build the setback and climax.** Read accumulated clues and support flags; implement the three resolution routes and the genuine failure.
7. **Build aftermath.** Update the fountain, Marda, wash-house, affected NPC greetings, and one-shot gossip in proportion to the result.
8. **Verify.** Run quicktest, directed successes and failures for every route, currency/reputation replay checks, ChoiceScript choice linting, prose linters, anachronism linting, and a check that the Silt-Gate entrance remains unchanged.

---

# Quest Two: A Key for Every Door

## 11. Core Identity and Scope

This is a contained Middle Ward mystery about trust, reputation, and the difference between a lock being defeated and a key being copied. No lock in Locksmiths' Close has been picked, broken, or forced. The original keys still work, the bolts still throw cleanly, and Vael's work has done exactly what it promised to do. Someone has simply had brief access to the right keys and made copies.

The quest takes place entirely around the existing Locksmiths' Close: the courtyard, Terrace Lodgings, and Vael & Son. It should not add a permanent new hub. The small scale matters: tenants fear someone has been inside their rooms; Kess fears the close will become known as unsafe; Vael fears a public accusation will damage work he can prove is sound.

The eventual theft target is Vael's pattern book: a locked workshop record of key cuts and lock fittings for local customers. It is valuable because it can be used to make copies, not because it opens every door by itself. If it is lost, Vael must treat the affected locks as compromised and replace or re-key them at real cost.

## 12. Entrance and Trigger

After the player has encountered both Terrace Lodgings and Vael & Son, returning to Locksmiths' Close during Vael's open hours can present the quest. A tenant is arguing with Kess in the courtyard: their room was disturbed, although its window was barred and the door was still locked when they returned. Vael refuses to concede in the street that a warranted lock has failed; Kess refuses to dismiss a tenant without proof.

(We cold reuse a canon tenant instead of creating a new one here if possible.)

The player is offered clear first responses in their own voice:

- “Let me see the door before either of you decide what happened.”
- “Show me what was moved, and what was left untouched.”
- “Kess, who could have had cause to enter that room?”
- “Vael, tell me what your lock rules out.”
- “This is your quarrel, not mine.”

Renting at Terrace Lodgings adds personal stakes: Kess can ask whether the player will let their own room be used as a monitored bait room. It is never required. A non-tenant can inspect the affected room with Kess's permission or help set a mark on a vacant room instead.

The opening establishes two facts: no valuables were taken, and the disturbed objects were minor, personal things. This makes the event unsettling rather than a simple burglary and gives the player a reason to suspect testing or reconnaissance.

(We will have to gate this as well, I would say it's gated to you renting from Kess, having met Vale, and a specific day / or time period)

## 13. Investigation Puzzle

The shared conclusion is that the intrusions are trials of copied keys. The player only needs enough evidence to reach that conclusion, but extra evidence gives firmer control of the runner and thief during the finale.

### Evidence routes

1. **Read the lock and key.** An Investigation or Sleight of Hand examination shows an untouched ward, clean bolt, and no wedge marks. A lockpick set gives advantage on the close examination, not on forcing the lock; the point is to recognise that it was opened normally. Vael can confirm that the lock's condition rules out picking or force. A failed check still establishes that the door was locked on return, and another route can supply the decisive clue.

2. **Follow the pattern between rooms.** Kess's ordinary tenant book and the tenants' accounts show that every target has a Vael lock fitted or re-keyed within the same recent period. The rooms have different key cuts, so a single stolen master key cannot explain it. Each occupant also remembers briefly lending, leaving, or setting down their key during a plausible everyday interruption. Together, the accounts point to impressions made one key at a time.

3. **Ask who comes and goes.** Questioning tenants, Kess, and the familiar errand runners reveals a new runner has been carrying harmless-looking notes through the close, marked with brass knots in the wharf warehousers' livery. Insight can identify the story that does not fit; Persuasion can make a worried tenant admit when their key was briefly out of sight. This route supports the watch route and is where Kess names the counting house the boy works for.

4. **Seed a false opportunity.** With Kess's consent, the player can let it be overheard that a newly fitted lock and a tenant's expected absence make one second-landing room worth testing. This is the quickest route, but it alerts the criminals that someone may be watching. It should make the later setback sharper rather than bypass it.

   *(Implemented 2026-10-10 as clue 3 of 4, replacing the earlier plan's clue 3, "Set a quiet mark." The wax-seal stakeout was cut because it let the player catch the boy on camera, which spent the quest's one "you catch the culprit" beat on reconnaissance and then had to invent a second entrance for the same boy at the decoy. The runner now appears exactly once, and only because the player baited the room. `a_key_mark_found` and `a_key_fast_to_shop` are reused by the bait: the second skips the Perception check at the decoy, since the player already knows what to look for.)*

The player may name the conclusion aloud once enough clues are in place: the locks have not failed; someone is collecting impressions and testing copied keys against different cuts. Vael is vindicated on the immediate accusation, but the close is still in danger.

## 14. Setback: The Decoy


The runner is real, young, and frightened, but not the person directing the work. When the player moves to confront or follow them, the runner loudly presents a copied key near a tenant's door and creates exactly the public disturbance Kess and Vael feared. The commotion draws attention into the courtyard.

While it lasts, the actual thief enters Vael's open shop as an ordinary customer and uses a copied workshop key to take the pattern book from its locked drawer. This preserves the central truth of the quest: neither the lodgings' locks nor Vael's own drawer were picked. The runner was hired to make sure they were the person everyone noticed.

The player can still gain something from the setback:

- Strong runner evidence means they can be talked into naming the buyer's meeting signal or the thief's direction.
- A good door mark or false-opportunity route lets the player realise the disturbance is too neatly timed and reach the shop sooner.
- Weak evidence leaves the player with only the alarm, a description, and the knowledge that every pattern in the book may now be compromised.

## 15. Climax and Resolution

The climax remains inside Locksmiths' Close. Its single narrow tunnel to Conduit Square becomes useful once the thief tries to leave with the book. The player does not need to win a fight; the goal is to decide who controls the exit, the evidence, and the runner.

### Finale approaches

- **Contain the thief.** Use a padlock or door bolt on the shop door, or use Kess and Vael to keep the tunnel exit in sight, then force a surrender or wait for the Watch. Equipment gives practical options, but it is never required.
- **Turn the runner.** Offer protection, expose the buyer's willingness to abandon them, or appeal to their fear of the Watch. A turned runner can identify the thief or reveal the next hand-off signal.
- **Pose as the buyer.** With the copied key, a runner's phrase, or enough details from the pattern book, the player can make the thief hesitate and arrange a controlled hand-off. This is risky but supports a quieter, more strategic ending.
- **Raise the Watch.** Send word to Conduit Square while holding the tunnel in view. This is reliable if the player has enough evidence, but it gives the thief time to destroy a page or pass the book to someone else.
- **Physical pursuit.** If containment fails, the thief tries to force past the player. Combat is a loss of control, not the intended or only answer; surrender, escape, and recovery of the book must all remain possible outcomes.

### Resolution paths

**Lawful — secure the book and hand over the evidence.** The Watch takes the thief or the named buyer lead. Kess can publicly clear the lodgings, and Vael can demonstrate that his locks were copied rather than defeated. The player earns modest local payment and lasting goodwill from both, with the exact reward to be set during implementation.

**Pragmatic — recover the book quietly.** The player can take compensation from the thief or buyer in return for closing the immediate matter without a public case. Kess's tenants stay protected if the book is returned, but the underlying key-copying network remains active. This gives better short-term coin at the cost of a cleaner outcome.

**Strategic — turn the trail into a future lead.** The player returns the pattern book, protects the runner from being discarded, and keeps the buyer's signal, phrase, or meeting place for a later quest. Vael and Kess receive the immediate protection they need, while the player gains an avenue into a wider local theft operation.

**Failure or partial recovery — the patterns spread.** If the thief escapes with the book, copies pages, or the player cannot prove the case, Vael must consider the affected locks compromised. Kess has to warn tenants and arrange costly changes. The quest still resolves, but Locksmiths' Close carries a visible, persistent consequence and the thief's operation can resurface later.

### Implementation State to Track

- `a_key_quest_stage`: unstarted, investigating, decoy, finale, resolved.
- `a_key_evidence`: count or discrete flags for lock, pattern, mark, runner, and false-opportunity evidence.
- `a_key_runner_trust`: whether the runner can identify the thief or buyer signal.
- `a_key_pattern_book`: secure, recovered, copied, or stolen.
- `a_key_resolution`: lawful, pragmatic, strategic, or compromised.
- `a_key_lodgings_compromised`: persistent state for follow-up dialogue and future quest hooks.
- `a_key_fast_to_shop`: set by the false-opportunity bait, skips the Perception check at the decoy.

**The ward's answer to the rumour (2026-10-10).** Vael's line at `a_key_offer` used to promise a cost ("A ward that starts panicking buys no locks at all") that no ending actually charged him — all four outcomes showed him re-keying other people's doors, which is work, not damage. The line now points at the on-screen threat instead (the boy's public accusation), and the reputational sting moved to the hub's Layer 5 aftermath, keyed on `a_key_pattern_book`:

- `recovered` (lawful / strategic): `a_key_vael_favor` chalks a promise onto the slate — *Keys cut for the holder only.*
- `stolen` (the one full-loss failure): a question mark appears under the warranty line, and Vael has wiped the board twice and left it.
- `copied` (thief held, pages torn out): no chalk either way — the book came back, so there is nothing to answer.

When implemented, the full quest lives in `MiddlewardQuest/a_key_for_every_door.txt`. `port_valen_middle_ward.txt` only needs its daytime entry trigger at Locksmiths' Close and any short post-quest state dialogue.

---

# Quest Three: Smoke Under the Eaves

## 16. Entrance

Workers stagger coughing from Smiths' Row while smoke spills from workshop doors instead of rising through the shared chimney. Halda shuts her forge, but neighboring smiths blame her fuel and resist closing their own fires.

The player can help move a worker, inspect the smoke, ask Halda what changed, or leave. Ambrose and the conduit provide natural secondary locations.

## 17. Puzzle

- Compare coal and fuel from affected workshops.
- Take a sample or sick worker to Ambrose.
- Inspect the chimney and shared vents with Investigation or Sleight of Hand; this is a repair/mechanism task, so the Repair Kit applies if carried.
- Question apprentices about recent roof activity.
- Climb above the row to inspect the obstruction.
- Coordinate the smiths to test each forge separately.

The fuel is sound. Something has been hidden in an unused part of the shared chimney.

## 18. Setback

Opening the blockage exposes stolen lamp oil, cloth, and metal offcuts hidden above the forges. The returning draft catches the cache alight. An investigation becomes a roof fire threatening Smiths' Row and Lantern Lane.

## 19. Climax

The player can organize a bucket line from the conduit, climb to open the main vent, shut forge drafts in the correct order, cut away an isolated burning section, or use suitable magic. Earlier investigation determines warning, available helpers, and whether the cache's evidence survives.

## 20. Resolution

- **Lawful:** Save the row and turn the thief and evidence over to the Watch.
- **Pragmatic:** Recover valuable stolen stock or accept payment to conceal its owner.
- **Strategic:** Preserve the workshops while using the thief or reseller to identify a wider fencing route.
- **Failure:** One workshop is badly damaged and closes temporarily; evidence burns and no reward is paid.

Halda may offer several silver marks, one repair service, or a smiths' favor. The likely personal twist is an apprentice who began selling discarded metal to cover a family debt and was then trapped into hiding stolen goods for a reseller.

---

# Quest Four: The Honest Measure

## 21. Existing Seed

This quest can pay off the current `mw_rumor_grain` hot-room line and the Marketday street tell in which a grain officer pockets a small payment slip from an unlicensed flour wagon. Do not replace that evidence with a contradictory hook.

## 22. Entrance

On Marketday, a grain officer declares an independent farmer's sacks underweight and moves to impound the wagon. The player may already have seen or heard that this officer accepts quiet payments from unlicensed drivers. Marda intervenes because excluding small growers will raise her flour costs.

If the player misses Marketday, the existing hot-room rumor can open a standing investigation lead without requiring the entrance scene to repeat on a rare schedule.

## 23. Puzzle

- Compare the official measure with known containers at Marda's bakehouse.
- Test its volume using water from the conduit.
- Examine sack stitching and inspection marks.
- Follow a wagon after it passes the gate.
- Question carters about where inspected loads wait before reaching the market.
- Persuade several farmers to compare accounts and testify together.

The official measure is accurate. The condemned sacks truly are light, but they were swapped after inspection in a shared storage yard.

## 24. Setback

The visible payment is a separate wrong: the officer accepts money to let small growers bypass an expensive permit. Exposing the officer alone removes the farmers' unofficial route while leaving the larger theft untouched.

A licensed grain broker is replacing certified sacks with lighter ones, then using failed inspections and debt clauses to seize carts from independent farmers.

## 25. Climax

The broker attempts another exchange while the first farmer's wagon is being removed. The player can demonstrate the swap publicly, recover marked sacks, rally carters to block the yard, take the proof to a gate warden, or stop the cart physically. Fighting follows only if a stop or confrontation fails.

## 26. Resolution

- **Lawful:** Expose broker and officer. Earn lawful standing, but close the permit shortcut used by poor growers.
- **Pragmatic:** Force repayment or take payment while preserving the unofficial arrangement.
- **Strategic:** Break the broker's hold, preserve small growers' access, and keep documentary leverage over the officer.
- **Failure:** The farmer loses the cart, Marda faces temporarily higher grain costs, and no reward is paid.

The revelation is that the obvious corruption is real but is not the scheme causing the condemned loads. Solving only what the player first sees can make food access worse while leaving the principal culprit untouched.

---

## 27. Cross-Quest Balance

The four quests should not all feel like investigations with the same answer:

| Quest | Primary pressure | Main climax | Central choice |
|---|---|---|---|
| **The Dry Lion** | Failing public infrastructure | Repair under immediate physical danger | Law against neglected need |
| **A Key for Every Door** | Fear inside rented homes | Catch or turn a burglar | Safety, profit, or intelligence |
| **Smoke Under the Eaves** | Workshop shutdown and spreading fire | Coordinated emergency response | Punishment, concealment, or leverage |
| **The Honest Measure** | Food prices and unequal market access | Public exposure or controlled settlement | Clean law against an imperfect lifeline |

The Dry Lion establishes the Middle Ward's quest identity first: several ordinary places depend on one another, and repairing a physical fault does not automatically resolve the human one.
