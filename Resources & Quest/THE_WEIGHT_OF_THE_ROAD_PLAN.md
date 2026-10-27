# The Weight of the Road — Whitefold Quest Plan

## Status

Planning document only. This file defines the physical site, mystery, five-room structure, principal choices, and likely implementation hooks. It does not implement the quest.

## Quest Identity

- **Origin:** Whitefold
- **Primary quest-giver:** Edda Cale, Commonwarden
- **Existing supporting NPCs:** Hessa Vail, Nerin Bale, and Perrin Holt; Chief Clerk Orlov and Factor Morzan may appear in an optional post-quest follow-up
- **Primary locations:** Whitefold, the freight road toward Limestone Cut, the Fleecefold, the Quarry Yard, and the White Ram
- **Quest form:** Civic investigation followed by an emergency repair and public reckoning
- **Core dilemma:** Whitefold cannot save its road, quarry contract, pasture, and emergency fund at the same time. The player must determine what happened and decide where the cost falls.

## The Collapsed Wall

### What the wall is

The collapsed structure is a **dry-stone retaining wall on the downhill side of Whitefold's freight road**.

The road descends from Whitefold toward Limestone Cut across a sloping shoulder of the Coldspine. Rather than make every cart climb and fall with the natural ground, earlier builders cut into the uphill slope and built up the downhill side. The retaining wall holds that built-up roadbed in place.

At the deepest part of the slope, the wall is roughly six feet high. Its visible face is built from broad local limestone laid without mortar, with the courses leaning slightly back into the roadbed. Longer stones reach into the packed rubble behind the face and bind it together. Smaller broken stone fills the center. The road above is wide enough for one loaded cart, with occasional wider passing places rather than two full lanes.

This is ordinary working infrastructure, not a defensive wall. Its purpose is to stop the downhill half of the road from spreading and sliding down the slope under carts, animals, rain, and frost.

### The drain through it

A shallow ditch runs along the uphill edge of the road and gathers water coming down the slope. At the collapse, that ditch feeds a **stone-lined drain beneath the road**. The drain is a narrow covered channel: flat stones form its floor, squared stones its sides, and heavy slabs its roof. Its downhill mouth opens through the face of the retaining wall.

The drain keeps stormwater from collecting inside the roadbed. In ordinary weather, water enters from the uphill ditch, passes beneath the cart track, and spills from the wall into a stony run below.

The people of Whitefold would usually call it **the road drain**, **the covered drain**, or **the stone drain**. Narrative prose should prefer those plain terms over repeatedly calling it a culvert.

### What it looks like after the collapse

About twenty feet of wall has folded outward and gone down the slope. Pale facing stones lie among torn turf and grey road fill. The cart track above has lost its downhill edge, leaving a ragged shelf with wheel ruts ending in open air. The mouth of the stone drain is crushed beneath fallen blocks, while brown water gathers in the uphill ditch and seeps through the exposed roadbed.

One part of the wall still stands but bows outward. Gaps between its stones shed crumbs of chalk and wet grit whenever weight crosses the road above. A loaded quarry cart has slewed toward the broken edge, one wheel sunk to its hub and the bed leaning downhill.

This gives the scene several immediate physical dangers:

- The cart may overturn and pull its team with it.
- Sheep scattered below the road may be injured or cut off.
- People climbing over the fallen stone may bring down the bowed section.
- Water continues to collect behind the surviving wall.
- Heavy rain could wash out the remaining road before a proper repair begins.

## Why the Wall Failed

There is no single saboteur. The collapse is the result of several reasonable short-term decisions that became dangerous together.

### The unfinished winter repair

Frost had pushed a section of wall outward during the previous winter. Whitefold's road crew took down the loose upper courses before they could fall. The sound stones were stacked beside the road so the section could be rebuilt when labor and weather allowed.

During a difficult lambing night, part of a shelter wall failed. Edda gave verbal permission to use some of the stacked repair stone to make the shelter safe. She expected the Common to replace it before the road work resumed, but no replacement was entered into the written account. The retaining wall remained lower and less well bound around the drain than intended.

Edda concealed this because the decision protected animals and workers during an immediate emergency, but admitting it makes her responsible for delaying a common repair without recording the cost.

### The quarry loads

Whitefold is behind on a valuable stone delivery recorded through Alderford's Factor's Hall. Hessa allowed several carts to carry one additional block rather than lose another day to an extra journey. Her working slate shows the true weights, while the clean dispatch tally prepared for the Factor's Hall gives the ordinary load count.

Hessa knew the road repair was unfinished. She believed the remaining wall would hold through the last deliveries, especially in dry weather.

### The diverted flocks

Quarry spoil had narrowed the usual drove path used by the upper folds. Nerin began bringing several flocks down the freight road instead. Hooves broke the soft shoulder beside the uphill ditch and pushed mud, dung, wool, and loose chalk into the stone drain's intake.

Nerin complained informally but did not bring the blocked drove path before the Common. A formal complaint could have stopped quarry work while the delivery contract was already late.

### The final chain of failure

Rain runs down the slope. The partly blocked drain cannot carry it quickly enough. Water soaks the loose fill behind the unfinished wall. Repeated flock traffic churns the shoulder and sends more silt into the intake. An overloaded quarry cart crosses directly above the weakened drain. The saturated fill shifts, the drain's roof stones move, and the retaining wall folds outward under the added weight.

None of the three decisions would necessarily have destroyed a sound, dry road by itself. Together, they cause the collapse.

## Organic Discovery

The quest should begin through the event, not through a floating work offer.

The quest becomes eligible at least one month into the campaign, after the player has an Insignia carrying roughly ten completed jobs and has met Edda, Hessa, Nerin, and Perrin and spoken through their existing introductory dialogue. It triggers on an eligible morning with a clear current sky but wet or sodden ground left by earlier rain. That combination supports both the pleasant-weather arrival and the trapped water that caused the collapse.

Entering Whitefold replaces the ordinary street activity with a quarry horn sounding from the yard and a mud-spattered villager running up the Limestone Cut road. Edda is present at the Fleecefold, checks the player's Insignia, and can comment on the name and completed work recorded on it.

The player has one clean refusal point before following Edda to the road. Ignoring the alarm does not start the quest or consume the event; the world remains unchanged and the hook may appear again on a later eligible visit. Following Edda and beginning Room 1 is the commitment. Once the player has intervened in the emergency, Edda does not ask them to accept the same quest a second time, and the investigation cannot be left indefinitely unstarted while the wall waits offscreen.

Following reaches the collapse while the cart, sheep, and surviving wall are still in danger. This qualifies as an immediate physical emergency, so the scene may demand a quick decision without violating the normal rule against NPCs assigning unsolicited work.

After the emergency, Edda asks the player to give the Common an outside account and Room 2 begins. This is the natural continuation of the help already offered, not a second contract prompt.

While the quest is active, the player may move among Whitefold's common, Quarry Yard, Fleecefold, and White Ram, but cannot leave the settlement. Implementation must gate all three escape paths: the visible **roads out of the village** choice, the generated **Leave Whitefold** service used by the sidebar Travel menu, and a defensive check at the Whitefold-to-overworld handoff. The generator source in `tools/gen_city_settlements.js`, not only its generated scene block, must carry the quest gate. Sidebar Wait and Rest should use a quest-specific `wait_lock_reason` during the active emergency; clear that exact lock on every resolution or abandonment exit without erasing a different system's lock. Ordinary meals, trade, and other explicitly chosen activities may still consume time and are governed by the deadline below.

## Five-Room Structure

The five rooms are conceptual quest beats rather than enclosed chambers.

### Room 1 — The Broken Road

**Function:** Entrance and guardian challenge.

The player arrives during the collapse's immediate aftermath. Quarry workers want to save the cart and dressed stone. Shepherds want help recovering the scattered flock. Edda wants everyone away from the bowed wall before it follows the first section downhill.

The player chooses one primary intervention:

1. **Secure the cart and team.** An Athletics check, assisted by available leverage or rope. Success preserves contracted stone and earns quarry trust. Failure loses blocks down the slope and may injure the player or a draft animal.
2. **Recover the scattered sheep.** An Animal Handling check. A character who can cast *Speak with Animals* immediately also receives a separate spell choice. Success by either route limits the folds' losses and earns Nerin's trust. Failure on the skill route costs animals and worsens the folds' position in the final settlement.
3. **Clear the road and preserve the collapse.** An Investigation check to understand the unstable structure quickly enough to direct the workers safely. Success prevents further injury and preserves the clearest physical evidence. Failure allows hurried workers to move stones and obscure part of the failure sequence.

#### Room 1 checks

The three interventions above are the primary player-facing choices. Do not open a second menu of near-identical methods after the player chooses what to save. Each intervention has one distinct, consequential check; failure moves the quest forward with the stated loss rather than offering a cost-free retry. *Speak with Animals* is the sole additional choice because it spends a real magical resource and produces a mechanically different result rather than merely renaming the same check.

| Intervention | Skill check | DC | Assistance without another choice |
| --- | --- | --- | --- |
| **Secure the cart and team** | **Athletics** (`athletics`) | **12** | The player braces, levers, and secures the load while workers control the animals. An Iron Prybar or Hemp Rope grants advantage and is not consumed. |
| **Recover the scattered sheep** | **Animal Handling** (`animal_handling`) | **11** | The player turns the flock's leaders and settles the animals before they scatter farther. |
| **Clear the road and preserve the collapse** | **Investigation** (`investigation`) | **12** | The player reads the drain, wall courses, wheel ruts, and fresh breaks, then directs the workers around what must remain undisturbed. Preserving the site during the initial emergency grants advantage if this evidence is examined again later. |

**Separate spell choice — Speak with Animals:** If the player can cast the spell immediately through a spell slot, a free ancestry feature, or a scroll, show **“Call to the scattered flock. [Speak with Animals; cost shown]”** beside the ordinary sheep option. The spell is an automatic success: the player identifies the flock's panicked leaders, tells them where to turn, and the rest follow. It records the same saved-sheep and fold-trust result as a successful Animal Handling check, with distinct dialogue, but grants no additional reward. It must call the shared spell-source and replay-safe payment routines so the label states whether it uses a slot, free casting, or a scroll.

Ritual casting is not available during the active collapse; the extra casting time would make the emergency meaningless. Implementation should therefore request *Speak with Animals* from the shared source resolver as an immediate **spell**, not as a **ritual**, for this scene. A character who knows it but has no immediate casting source sees only the Animal Handling option. No resource is spent unless the player explicitly selects the spell choice.

`Guidance` works through the normal shared check system. Other utility magic should improve the relevant roll or alter its prose rather than add another button: *Mage Hand* cannot hold a loaded cart, *Mending* cannot rebuild a twenty-foot retaining wall during a collapse, and *Feather Fall* does not protect falling stone or cargo. Other genuinely suitable future spells may grant advantage, but should not silently provide a better version of every skill route.

All routes converge after the danger is contained. The unchosen problems are handled imperfectly by villagers, producing smaller losses rather than three simultaneous catastrophes.

### Room 2 — Four Accounts of One Road

**Function:** Investigation and social puzzle.

Edda asks the player to assemble an independent account before the Common meets. The player may visit the Whitefold NPCs in any order. This is where the Open world reopens again. We may have to make changes to the whitefold itself for the duration of this quest.

- **Hessa's two tallies:** Repeating heavy entries in her working slate, absent from the clean dispatch tally prepared for the Factor's Hall, reveal that the additional weight was deliberate. Winning her confidence or reading the figures carefully secures the strongest proof.
- **Nerin's wool and flock records:** Several upper flocks arrived together on days when they would ordinarily have used different lanes. Mud and pale quarry dust on the animals support his account of the obstructed drove path.
- **Perrin's disconnected observations:** Carters complained about extra blocks, shepherds arrived angry and chalk-covered, and during the difficult lambing night he saw road masons take a handcart of stacked limestone toward the damaged shelter before Edda bought food for the crew. Perrin does not know the whole answer; he supplies the link between the road stone and Edda's unrecorded authorization.
- **Edda's maintenance papers:** The written account records the winter opening of the wall but not the lambing shelter's use of the stacked repair stone.

No single clue is mandatory. Strong evidence provides leverage and safer options later; missed or failed approaches move the quest forward with uncertainty, damaged trust, or a higher final difficulty.

#### Room 2 checks

Room 2 is not a four-person wall of skill checks. Speaking to an NPC always provides that person's basic account and marks the lead as reviewed. A check is used only when the player is trying to turn an account into proof that can survive the public reckoning. Every check is attempted once; failure preserves the basic account but loses the stronger evidence and cannot be retried through differently worded choices.

| Lead | Player-facing action | Skill check | DC | Success | Failure and assistance |
| --- | --- | --- | --- | --- | --- |
| **Hessa's load records** | **Compare the working slate with the clean dispatch tally.** | **Investigation** (`investigation`) | **12** | Secures the repeated heavy entries and the mismatch between Hessa's two records as strong quarry evidence. | The figures are rubbed, abbreviated, and interrupted by ordinary tallies; the player can establish that loads varied but cannot prove deliberate overloading. Saving the cart in Room 1 grants advantage because Hessa permits a less guarded look at both records. The Repair Kit does not apply. |
| **Nerin's flock** | **Inspect the sheep and trace where the upper flocks came down.** | **Survival** (`survival`) | **11** | Quarry dust, ditch mud, and the pattern of hoof wear corroborate repeated use of the freight road and secure strong fold evidence. | Nerin still admits bringing the flocks down the road, but the physical signs are too mixed to establish how often or how badly the intake was fouled. Saving the sheep in Room 1 grants advantage because Nerin helps identify the affected animals and their usual route. |
| **Perrin's recollection** | **Have Perrin put the complaints and the storm-night meal in order.** | **No check** | — | Perrin's timeline is guaranteed corroboration and points directly toward the unrecorded winter repair. It also grants advantage when Edda is asked about the missing stone. | Perrin is connective evidence rather than a culprit protecting himself. Charging a roll merely to hear his recollection would add a fourth gate without adding a meaningful risk. |
| **Edda's maintenance papers** | **Set the incomplete account beside Perrin's timeline and ask what happened to the repair stone.** | **Persuasion** (`persuasion`) | **12** | Edda gives a candid account of authorizing the shelter repair, securing strong Common evidence. | The written omission remains evident, but Edda refuses to turn it into a formal admission while the road is still failing. Perrin's timeline grants advantage. If Perrin was skipped, preserved physical evidence from Room 1 grants advantage instead; these sources do not stack. |

Hessa, Nerin, and Perrin each take about 15 minutes to question. Reviewing the papers with Edda takes about 10 minutes. Ordinary movement within Whitefold may retain its existing travel time. These costs make a complete investigation valuable but not free once Room 3 establishes worsening water pressure.

#### Bottleneck into Room 3

Room 2 uses one hub-and-spoke investigation and one explicit commitment point:

1. Accepting Edda's request opens the Hessa, Nerin, and Perrin investigation choices at their existing Whitefold locations. They may be completed in any order. Their **reviewed** flags are separate from their **evidence** flags, so a failed check still advances the investigation.
2. After any two of those three leads have been reviewed, Edda offers **“Bring the accounts back to Edda and return to the broken road.”** The remaining lead stays available until the player selects this option. If one remains, the choice text warns that worsening water means leaving that account unexamined; there is no accidental auto-transition.
3. Selecting the return is the bottleneck. It closes the remaining Room 2 interview, reviews Edda's maintenance papers, resolves the one-time Persuasion check above, and then sends every route to the same Room 3 arrival. The player cannot leave Whitefold or resume gathering accounts after committing because the wall has visibly worsened during the investigation.
4. Room 3 always lets the player reconstruct the physical chain of failure, even if some proof was missed. The quest must not hide the repair plans behind failed investigation rolls. Strong evidence instead determines whom the player can implicate, who cooperates in Room 4, and whether full public accounting is available in Room 5.

This means a thorough player can review all three field leads before returning, while an impatient player can advance after two and accept the evidentiary gap. The structure converges cleanly without making every clue mandatory or allowing indefinite retries.

### Room 3 — The Wall Beneath the Road

**Function:** Twist and setback.

**Location:** The collapsed retaining wall on Whitefold's freight road toward Limestone Cut, centered on the exposed stone drain.

The player returns to the collapse to test the competing accounts against the surviving wall, the exposed road fill, and Whitefold's own copy of the road agreement and quarry delivery contract. Edda keeps the Common's filed papers at the Fleecefold, while Hessa's quarry records hold the working delivery figures. The active quest remains entirely within Whitefold; the player does not travel to Alderford while the road is failing.

The drain itself is not a new discovery: its crushed downhill mouth was visible during Room 1. Room 3 reveals **why it mattered**. The missing repair stone left the courses around it low and poorly bound; diverted flocks fouled its uphill intake; backed-up water saturated the road fill; and the overloaded cart supplied the final pressure. These were not separate faults. They formed one chain of failure.

The reconstruction is guaranteed. Failed Room 2 checks may leave the player unable to prove who knowingly made each decision, but they do not prevent the player from understanding the physical collapse or choosing a repair. The scene changes its presentation according to the accumulated evidence:

- Preserved evidence from Room 1 leaves the wall courses, wheel rut, and original fall pattern readable. If villagers disturbed the site, the same conclusion has to be pieced together from fewer clean signs.
- Hessa's evidence determines whether she concedes that the heavy loads were deliberate or calls them ordinary variation.
- Nerin's evidence determines whether repeated flock traffic is established or rests only on his admission.
- Edda's evidence determines whether the missing repair stone is an admitted authorization or merely an omission in her papers.
- Perrin's timeline can corroborate an otherwise weak link, but it cannot replace all three principals' evidence for full public accounting.

The local contract copy adds the larger setback: Whitefold owes a serious penalty if the promised dressed stone does not reach its buyer by the agreed date. Using those blocks to repair the road saves the safest material but breaks the delivery. The document is clear enough for the player to understand the immediate cost without consulting an outside clerk. Chief Clerk Orlov and Factor Morzan remain relevant only afterward: Orlov can confirm how the completed settlement is entered, while Morzan can extend the term, waive the penalty, or accept a different arrangement in an optional post-quest follow-up.

Meanwhile, water already trapped in the uphill ditch continues soaking through the roadbed even if the current sky is clear. This keeps the deadline consistent with the planned fair-weather morning trigger: the danger comes from water the blocked drain cannot release, not from requiring a new storm to begin on cue.

#### Room 3 deadline state

When Room 2 begins, store an investigation-start stamp from `campaign_day`, `clock_hour`, and `clock_minute`. Whitefold's active-quest hub guard compares the current clock with that stamp, so interviewing, ordinary movement, eating, training, or any other time-consuming activity all count without every scene manually increasing a second timer.

- **Up to 120 minutes:** the bowed section is still shedding only grit. Room 3 checks are made normally.
- **121–180 minutes:** water is visibly bleeding through the wall and the remaining face moves underfoot. The Room 3 preparation check has disadvantage.
- **181–240 minutes:** the preparation check has disadvantage and Room 4's decisive execution DC increases by 1.
- **More than 240 minutes:** the remaining face gives way before a repair can be organized. Route directly to the designed `"road_lost"` failure; the player cannot sleep for days and return to an unchanged emergency.

The Whitefold hub should describe the current urgency tier, and any non-investigation activity that would cross the hard deadline must explicitly warn that taking the time abandons the road. A thorough three-lead investigation can fit inside the normal window; the penalties are aimed at avoidable delay, not at punishing the player for engaging with Room 2. Recalculate on every Whitefold hub entry and immediately after any quest-controlled time advance so the sidebar, an inn room, trading, or another menu cannot freeze the emergency clock.

#### Room 3 preparation checks

Once the failure chain and contract penalty are understood, the player has time for **one** preparation before the wall worsens. These are not three differently worded attempts to solve the same problem. Each prepares one of Room 4's materially different plans, and the choice label states which plan benefits.

| Preparation | Skill check | DC | Success | Failure and assistance |
| --- | --- | --- | --- | --- |
| **Mark the sound courses and a new line for the stone drain.** | **Investigation** (`investigation`) | **12** | Records `"contract_stone"` preparation and grants advantage on Room 4's decisive check if the player chooses to break the contracted stone and rebuild the road. | The exposed fill shifts before the player can establish a trustworthy line. The plan remains available, but receives no preparation advantage. Preserving the collapse in Room 1 grants advantage on this check. |
| **Walk and stake a firm line across the lower grazing ground.** | **Survival** (`survival`) | **11** | Records `"pasture_bypass"` preparation and grants advantage on Room 4's decisive check if the player chooses the bypass. | Seepage and torn turf conceal the firmest ground, so the bypass remains possible but must be laid out during the operation without advantage. Saving the scattered sheep grants advantage because Nerin supplies the flock's safe footing and boundary knowledge. |
| **Shore the drain mouth while paid local crews and replacement carts are assembled.** | **Athletics** (`athletics`) | **12** | Records `"common_fund"` preparation and grants advantage on Room 4's decisive check if the player spends the emergency fund on local labor and materials. | The temporary brace slips as the fill settles. It causes no second collapse yet, but it provides no advantage and cannot be attempted again. Saving the quarry cart grants advantage because its team, rope, pole, and wheel chocks are still available for the shoring work. |

`Guidance` works through the normal shared check system. A Repair Kit does not assist: the player is reading ground or placing emergency shoring, not repairing a fitting or mechanism. *Mending* and *Mage Hand* cannot bind saturated road fill or support the weight of the wall, so they do not create extra spell buttons here.

Every preparation takes 15 minutes, succeeds or fails once, and then converges. Failure costs the matching Room 4 advantage; it does not reopen the preparation menu, substitute another check, or remove the associated repair plan.

#### Bottleneck into Room 4

After the one preparation check, a section beside the drain drops, water pushes chalky mud through the joints, and the assembled workers refuse to spend stone, pasture, or public money without a decision. This physical deterioration ends investigation rather than another NPC instruction.

Hessa, Nerin, and Edda each state the resource their part of Whitefold can supply and the consequence of spending it. The available holders of the Common's four seats are called to the roadside as well; Edda chairs their emergency decision but does not personally own the public fund. Their tone and willingness change with the rescue, evidence, and trust flags, but the scene does not settle blame yet; that remains Room 5's purpose. All three preparation routes then:

1. record the chosen preparation and whether it succeeded;
2. advance `weight_road_quest_stage` from `"wall"` to `"repair"` behind a real page boundary;
3. close all investigation and preparation choices permanently; and
4. enter the single Room 4 repair-plan menu with all three plans still visible.

The Room 3 preparation never locks the player into its matching plan. Choosing a different plan in Room 4 is allowed, but forfeits the unused preparation advantage. This preserves the climax as the actual decision while still rewarding foresight.

### Room 4 — The Price of Repair

**Function:** Climax.

**Location:** The same collapsed-road site. The contracted-stone and emergency-fund operations remain around the wall and drain; the pasture-bypass operation extends into the adjoining lower grazing ground and reconnects with the freight road beyond the break.

Water is rising behind the road and the surviving face has begun shedding stone. Hessa's workers, Nerin's shepherds, and the road households will not commit their limited material or labor until someone decides who bears the loss.

The player selects and leads one plan. Each plan has **one irreversible best-of-two skill check**. The player does not choose between two nearly identical execution buttons: the shared `roll_skill_check` routine automatically uses the better applicable skill and records it so the success or failure prose can reflect how the player led the work.

#### A. Break the contracted stone

Recover the fallen wall stone for the bulk of the work, then break and recut contracted blocks from the surviving cart and Quarry Yard reserve for the missing bond stones, drain roof, and stable facing. A single cartload is not expected to rebuild twenty feet of wall by itself.

- Best long-term road repair.
- Preserves the pasture and Common fund.
- Costs the quarry enough dressed stone to break its delivery and risks the Factor's Hall penalty.
- Strong quarry trust secures Hessa's willing cooperation. Strong evidence can instead compel practical cooperation, but her resentment carries into Room 5.
- If the cart was not fully saved in Room 1, the plan remains available through the yard reserve and recoverable blocks, but begins with less prepared material rather than pretending the lost load reappeared.

**Decisive check:** **Athletics or Investigation, base DC 13.** Athletics represents working the levers, teams, and heavy bond stones; Investigation represents directing the drain level, backward lean, fill, and placement sequence. This is one roll using the better modifier.

#### B. Cut a pasture bypass

Leave the damaged section closed and cut a temporary cart road that leaves the freight road before the break, follows a gentler contour across the adjoining lower pasture, and rejoins beyond the failed wall. It does not descend directly over the steep rubble slope beneath the collapse.

- Preserves the quarry delivery.
- Costs the folds grazing land and several boundary walls.
- The temporary route may become permanent unless the Common later funds the original repair.
- Strong fold trust secures willing consent. Strong evidence can instead compel Nerin to yield the ground, but his resentment carries into Room 5.

**Decisive check:** **Survival or Animal Handling, base DC 12.** Survival represents holding the bypass to firm contour and drainage; Animal Handling represents moving the flocks, draft teams, and frightened stock through the work without breaking the marked line. This is one roll using the better modifier.

#### C. Spend the Common's emergency fund

Release emergency money immediately for extra shifts from Whitefold's quarry workers, shepherds, and carters; replacement carting; rough local stone; timber; rope; and other material held by village households. The local crews stabilize the drain and build a serviceable repair without consuming the contracted dressed blocks. Alderford is not supplying workers during the live emergency.

- Spreads the immediate cost across the Common and preserves both the contracted stone and most pasture.
- Empties money reserved for winter hardship, injured workers, lambing trouble, and failed harvests.
- Produces a serviceable stabilization rather than the contracted-stone plan's best permanent rebuild; later ordinary road work will still be needed.
- Requires emergency assent from the available Common seats, chaired by Edda under Whitefold's existing four-interest governance, and leaves the village exposed to the next emergency.

**Decisive check:** **Persuasion or Insight, base DC 12.** Persuasion represents winning immediate assent and keeping the paid crews to one plan; Insight represents reading what each Common interest will concede, assigning the right cost to each, and preventing the roadside council from stalling. This is one roll using the better modifier.

#### Room 4 DC adjustments

Before displaying the menu, calculate three temporary preview DCs from the current flags so each choice can show its true number. After the player selects a plan, copy only that preview into the persistent final-DC variable. Modifiers are deliberately few and concrete:

| Condition | DC effect |
| --- | --- |
| Matching operational cooperation is absent | **+1 DC.** Contracted stone checks quarry trust or Hessa's strong evidence; the bypass checks fold trust or Nerin's strong evidence; the emergency fund checks Common trust or Edda's strong evidence. Cooperation changes difficulty, not plan availability. Trust produces willing help; evidence produces pressured help and different Room 5 dialogue. |
| Contracted-stone plan: the cart was left to the villagers and suffered partial losses | **+1 DC.** This is `weight_road_emergency_choice != "cart"` with `weight_road_cart_saved = false`. |
| Contracted-stone plan: the player chose the cart intervention and failed it | **+2 DC instead of +1.** More dressed blocks and useful rigging went down the slope. |
| Pasture-bypass plan: the sheep were left to the villagers and some remain scattered | **+1 DC.** This is `weight_road_emergency_choice != "sheep"` with `weight_road_sheep_saved = false`. |
| Pasture-bypass plan: the player chose the sheep intervention and failed it | **+2 DC instead of +1.** Lost and frightened animals obstruct the lower ground while the route is cut. |
| Room 3 began after more than 180 minutes | **+1 DC.** Apply this once from `weight_road_delay_level = 2`; it does not stack with itself as the operation advances the clock. |

The final menu should make both the roll and sacrifice explicit without adding a confirmation page:

- **Break the contracted stone and rebuild the road.** `[Athletics or Investigation DC ${stone_dc} | ~6 Hours | Quarry delivery lost]`
- **Cut a temporary road through the lower pasture.** `[Survival or Animal Handling DC ${bypass_dc} | ~4 Hours | Grazing ground lost]`
- **Commit the Common's emergency fund.** `[Persuasion or Insight DC ${fund_dc} | ~5 Hours | Emergency reserve emptied]`

The emergency-fund route receives no Room 1 loss surcharge. Its lower practical risk is what the player buys by sacrificing Whitefold's reserve. Its cost is economic and persistent rather than another hidden mechanical punishment.

A successful matching Room 3 preparation grants advantage on the decisive check. A preparation for another plan grants nothing but causes no penalty. `Guidance` functions normally. Earlier trust and evidence adjust support through the DC table instead of adding a second social roll.

Candidate-specific equipment must follow the skill the shared resolver actually selects. If Athletics wins the contracted-stone check, an Iron Prybar grants advantage because the task involves repeated force and leverage. If Investigation wins, a carried Repair Kit grants its normal +1 because the hammer, chisel, saw, pliers, and line support a grounded repair check. Neither item benefits the other skill, and advantage still does not stack with matching preparation. Because `roll_skill_check` currently chooses the best candidate internally, implementation should extend that shared path so the Repair Kit's +1 participates only in evaluating the Investigation candidate and the Prybar's advantage is applied only if Athletics becomes the winner; do not duplicate best-skill calculations in the quest scene. No existing spell can rebuild or hold this structure outright, so Room 4 adds no separate spell-win buttons.

#### Room 4 operation results

Each operation resolves on the single roll and advances time once:

| Plan | Work time | Successful physical result | Failure |
| --- | --- | --- | --- |
| **Contracted stone** | **6 hours** | The crews reopen the drain, rebuild its roof and the critical lower face, and key the surviving wall into the new work. Dressing the road surface can continue safely afterward. Set `weight_road_resolution = "road_rebuilt"`. | A lower course rolls while the fill is open; the remaining face and road edge follow it downhill. |
| **Pasture bypass** | **4 hours** | The crews open boundary walls, lay a firm temporary track around the break, and close the failed road. Set `weight_road_resolution = "pasture_bypass"`. | A loaded test cart sinks or slews across the marked line, the work scatters, and the unsupported road wall gives way before another route can be tried. |
| **Emergency fund** | **5 hours** | Paid local crews clear the drain, brace the surviving face, and build a rough serviceable section using uncontracted material. Set `weight_road_resolution = "fund_stabilized"`. | Assent or work assignments come too slowly; the brace shifts before enough hands and material reach it, and the remaining wall collapses. |

The four-hour deadline governs how long the player may investigate **before committing a repair plan**. Selecting a Room 4 plan commits the assembled workforce and snapshots the delay modifier. The operation's own four-to-six-hour time advance does not trigger the investigation deadline halfway through successful work.

Earlier successes improve the chosen operation through the explicit DC and advantage rules above. Current weather supplies scene dressing but does not add an unplanned second penalty after the quest has already been gated to a clear morning.

#### Bottleneck into Room 5

The Room 4 plan menu is the commitment point. Selecting a plan immediately stores the plan and final DC, closes the other two plans, and begins the one decisive check—there is no confirmation submenu and no return to Room 3.

On success, set `weight_road_repair_success = true`, advance the appropriate work time once, show that plan's completed physical result, and advance the stage to `"reckoning"`. On failure, set `weight_road_repair_success = false` and `weight_road_resolution = "road_lost"`, advance the same work time, show the collapse, and still advance to `"reckoning"`. A real page boundary then takes every result to the Fleecefold for Room 5. The quest-specific meeting overrides the Fleecefold's ordinary closing hour; lamps are lit and the Common remains assembled even if the operation ended at Dusk or Night.

The roll result, selected winning skill, final DC, resolution, and time advance all require replay-safe guards. Refreshing the result page must not reroll the climax, choose a different winning skill, restore closed plans, or charge another four to six hours.

A failed climactic approach does not offer a cost-free retry. The physical result is irreversibly `"road_lost"`, but the quest still advances to Room 5: the Common must decide how the failure and the evidence are recorded. This preserves the investigation's purpose without converting the failed repair into a success.

### Room 5 — The Common's Reckoning

**Function:** Finale, judgment, and reward.

**Location and opening:** The meeting takes place that same evening in the Fleecefold. Lamps are lit over the weighing floor, the four Common interests occupy their established seats, and the doors remain open despite the ordinary closing hour. Edda chairs and breaks a tie if one occurs, but she does not decide the result alone. Hessa, Nerin, and Perrin attend as witnesses and affected householders. The scene first states the irreversible material result of Room 4: which resource was spent, whether the freight road is usable, and whether the contracted stone can still be delivered.

Room 5 contains **no new skill check**. The decisive rolls have already happened. The finale pays off the evidence the player gathered and asks what should be done with it; a final Persuasion roll would make the investigation feel provisional and could erase a well-earned route on one unlucky throw.

#### Accounting choices

1. **Give the full public account.** Record Edda's unlisted authorization, Hessa's heavy carts, and Nerin's diverted flocks as one causal chain. Whitefold accepts collective responsibility rather than assigning the entire loss to one interest. The Common orders three concrete reforms: emergency withdrawals must be entered in the shared ledger, quarry loads remain capped until the road is certified, and the quarry and folds receive named duties for keeping the drove path and road drain clear. This is the strongest institutional ending, but none of the three principals can preserve a spotless public reputation.
2. **Record negotiated common fault.** State that unfinished maintenance, heavy traffic, and a blocked drain combined, without entering every concealed decision or naming one principal debtor. The four interests share the formal burden in the proportions created by the Room 4 result. This preserves working relationships and produces the calmest immediate aftermath, but it creates no new inspection or recordkeeping rule and leaves the official account deliberately incomplete.
3. **Place formal liability.** Open a short second menu that names the supported targets: **the quarry**, **the folds**, or **the Commonwarden's office**. This is a real allocation choice, not three alternate methods of making the same check. The selected interest bears Whitefold's internal compensation and the principal share of any contract loss. The outside Factor's Hall still deals with Whitefold as the contracting settlement; the Common cannot make an external debt disappear by naming a local culprit.

The exact player-facing choices should state the consequence rather than merely the tone:

- **Enter every concealed decision and require shared safeguards.**
- **Record the collapse as common fault and preserve the working peace.**
- **Assign formal liability under the road agreement.**

The formal-liability submenu only shows an interest when the corresponding strong evidence exists: Hessa's slate for the quarry, Nerin's account and traces for the folds, or Edda's papers for the Commonwarden's office. The player cannot impose a legally clean judgment on suspicion alone.

#### Full-accounting gate

The full account is available when all three principal evidence flags are true. It is also available when exactly two are true **and** both Perrin's timeline and the preserved Room 1 site evidence are true; together those two sources may corroborate one missing admission. They cannot replace two missing principals. In state terms:

`all three principal evidence flags OR (exactly two principal evidence flags AND weight_road_perrin_evidence AND weight_road_evidence_preserved)`

The physical failure chain is always known from Room 3 and is not another gate. Orlov is not required. If the full-accounting gate is closed, its disabled label should explain that the account cannot prove every concealed decision rather than hiding the route without explanation.

Negotiated common fault is always available, including after `road_lost`. Formal liability is available target by target as described above. Once the player chooses, the decision is final: store it before the closing prose, apply rewards once, clear the emergency locks, and set the quest to `"resolved"` or `"failed"` behind a page boundary.

#### How the repair and accounting outcomes combine

The Room 4 result determines who already bore the physical sacrifice and therefore which one constituency may owe the player lasting goodwill:

| Physical result | Permanent material cost | Potential constituency favor |
|---|---|---|
| `road_rebuilt` | The contracted dressed stone rebuilds the safe line; the delivery is lost and Whitefold faces the contract penalty. | **Fold goodwill:** Nerin's pasture and flocks were protected. |
| `pasture_bypass` | A fenced cart track takes part of the lower grazing; the failed wall remains closed while the bypass carries freight. | **Quarry goodwill:** Hessa's delivery stone and quarry traffic were protected. |
| `fund_stabilized` | The emergency reserve pays for local labor and rough material, leaving Whitefold financially exposed. | **Common goodwill:** Edda and the seated interests recognize that both working livelihoods were preserved at public cost. |
| `road_lost` | The freight road and stone delivery are lost; earlier animal, cart, or evidence losses also remain. | None. |

Only the listed constituency favor can arise from a physical result. Full or shared accounting preserves it. Formal liability against that same constituency cancels it: Nerin does not offer fold goodwill if the folds are made principal debtor, Hessa does not offer quarry goodwill if the quarry is liable, and the Common does not offer its goodwill if the Commonwarden's office is liable. Blaming a different interest does not create a second favor. Full accounting additionally sets the institutional-reform outcome, but that is a world-state benefit rather than a second supplier reward.

Formal liability should also leave one explicit relationship scar: Hessa becomes cool and strictly contractual, Nerin refuses personal favors, or Edda deals with the player only in her official capacity. This changes later dialogue without locking the player out of Whitefold's essential inn, market, roads, or quest services.

## Failure State

The quest needs a designed loss rather than indefinite retries.

If the Room 4 operation fails, or the player allows more than 240 minutes to pass after Room 2 begins, the bowed wall and drain collapse completely. No one dies solely because of one failed roll, but the freight road closes for a longer rebuilding season, Whitefold loses the quarry delivery, and animals or material already lost remain lost. Deadline failure receives its own prose showing the collapse occurring while the player is elsewhere in Whitefold; it must not silently teleport the player back to the road.

This is a failed **repair**, not a reason to delete Room 5. After the immediate collapse aftermath, set the physical outcome to `"road_lost"`, advance to `"reckoning"`, and hold the Common's meeting. The player may still give a full, shared, or formal-liability account if the evidence supports it, but receives no successful-repair reward. Only after that accounting is recorded does the quest enter its final `"failed"` stage.

Suggested resolution value: `weight_road_resolution = "road_lost"`.

## Rewards and Persistent Consequences

The quest occupies most of a day after its morning hook: roughly one hour of focused investigation and preparation, ordinary movement, then a four-to-six-hour operation and the evening hearing. It has substantial civic consequences but no required combat. The balanced successful reward is therefore:

- **5 Silver Marks**, paid once from the fee the four Common interests set aside for the outside account. This sits above a small local task but below the eight-silver Overdue Peddler investigation.
- **One completed job on the Contractor's Insignia**, because the four-seat Common witnesses and certifies the work inside Gilded Scales territory. This does **not** also award `gilded_scales_rep`; local certification is not the same as improving the player's relationship with the central organization.
- **One finished quest toward level-up progression** after any successful Room 4 repair is carried through the Room 5 reckoning. This is separate from the Contractor's Insignia job. Implementation sets the permanent `weight_road_successful_completion` flag once the successful finale is recorded; `refresh_quests_finished` then receives exactly `+1` from the quest's count label. Do not increment `quests_finished` directly during the reward transaction, because that total is derived whenever level-up progress refreshes.
- **Permanent White Ram kitchen and oven access** on any successful Room 4 result. Perrin benefits from retaining a usable freight route and grants the player the same practical favor regardless of which resource saved it. No extra room or counter choice is required; Cooking is available anywhere the normal inn interaction exposes Alchemy/Cooking.
- **At most one constituency-favor flag** from the matrix above, subject to the formal-liability cancellation. These flags should unlock later services or personal requests only when those rewards are concretely designed. Do not invent a free stone, lime, wool, or equipment payout merely to consume the flag during the finale.
- Outcome-specific street prose, road-approach prose, Fleecefold notices, Quarry Yard and White Ram dialogue, and Lorebook additions.

On `road_lost`, the player receives no silver, no completed Insignia job, no level-up quest credit, no kitchen access, and no constituency favor. The accounting decision and its relationship or reform consequences still persist; failure does not erase the investigation.

### Level-up quest credit

The new quest scene must own a counting label following the existing derived-counter convention:

```choicescript
*label count_finished_weight_road
*if (weight_road_successful_completion)
  *set quests_finished +1
*return
```

`character_progression.txt` must call it once from `refresh_quests_finished`:

```choicescript
*gosub_scene alderford/whitefold/the_weight_of_the_road count_finished_weight_road
```

Set `weight_road_successful_completion` only when Room 5 records a completed quest whose Room 4 repair succeeded. Never clear it. The `"road_lost"` failure path leaves it false even though the player still attends the reckoning and records an accounting outcome. Because `refresh_quests_finished` rebuilds its total from zero each time, this permanent boolean and count label are replay-safe and always contribute exactly one successful quest.

#### Future Whitefold visits

The physical resolution should remain visible without creating a new location or making the player enter a special road screen:

- **Rebuilt road:** later arrivals mention the pale dressed-stone courses and carts using the restored line. Quarry dialogue acknowledges the lost delivery and pending penalty.
- **Pasture bypass:** later arrivals pass the fenced cart track cut across the lower grazing. The Quarry Yard remains busy, while Nerin's dialogue and Fleecefold activity acknowledge the smaller pasture.
- **Fund stabilization:** later arrivals mention the rough mixed-stone repair and recurring inspections. Fleecefold dialogue refers to delayed communal purchases and the depleted reserve, not to an arbitrary market-wide price increase.
- **Road lost:** the freight line remains fenced at the collapse. Pedestrians and lightly laden pack animals can still reach Whitefold by the safe approach, but quarry blocks accumulate in the yard and the village receives fewer carters. Do not remove Whitefold's overworld connection or close its essential services. A later rebuilding quest may supersede this state.

The accounting result supplies a second, independent layer:

- **Full:** a posted ledger and named maintenance rota appear at the Fleecefold; later dialogue treats the rules as active rather than saying only that lessons were learned.
- **Shared:** no names are posted, and later dialogue emphasizes the preserved peace and the things left unsaid.
- **Formal quarry/folds/Commonwarden:** the notice names the liable interest, and the affected NPC uses the cool relationship variant described above.

Use a one-time first-return exchange for the larger reaction, followed by short persistent lines so every visit does not replay the finale. Lorebook text should append the physical and accounting outcomes to the existing Whitefold and NPC entries rather than creating duplicate entries.

The first implementation should not silently alter commodity prices, generated market stock, or map connectivity. Those systems would turn one narrative consequence into a broad economy change and need separate balancing. The visible road, workload, dialogue, kitchen permission, favors, and future hooks are sufficient persistent consequences.

Orlov and Morzan remain optional afterward. `road_rebuilt` and `road_lost` create a failed stone delivery that Morzan may later renegotiate; `pasture_bypass` and `fund_stabilized` preserve the delivery. Orlov can record any accounting outcome, but visiting him never upgrades the finale or unlocks full accounting retroactively.

## Planned State Shape

Names are provisional until implementation.

- `weight_road_quest_stage`: `"unstarted"`, `"emergency"`, `"investigation"`, `"wall"`, `"repair"`, `"reckoning"`, `"resolved"`, or `"failed"`; advancing from `"investigation"` to `"wall"` is the persistent Room 2 commitment and prevents closed interviews from reopening after a refresh or return visit
- `weight_road_resolution`: physical road outcome: `"road_rebuilt"`, `"pasture_bypass"`, `"fund_stabilized"`, or `"road_lost"`; public accounting is stored separately
- `weight_road_resolved`
- `weight_road_resolved_day`
- `weight_road_emergency_choice`: `"cart"`, `"sheep"`, or `"site"`
- `weight_road_cart_saved`
- `weight_road_sheep_saved`
- `weight_road_evidence_preserved`
- `weight_road_investigation_start_stamp`: absolute minute derived from campaign day and clock time when Room 2 begins
- `weight_road_delay_level`: `0` through 120 minutes, `1` from 121–180, `2` from 181–240, or `3` after 240 immediately before routing to deadline failure
- `weight_road_hessa_reviewed`
- `weight_road_nerin_reviewed`
- `weight_road_perrin_reviewed`
- `weight_road_accounts_reviewed`: count of Hessa, Nerin, and Perrin leads completed; opens the Room 3 commitment at two
- `weight_road_hessa_evidence`
- `weight_road_nerin_evidence`
- `weight_road_perrin_evidence`
- `weight_road_edda_evidence`
- `weight_road_failure_chain_known`: guaranteed at the Room 3 reconstruction; replaces a misleading “drain discovered” flag because the drain is visible in Room 1
- `weight_road_contract_seen`
- `weight_road_preparation`: `"contract_stone"`, `"pasture_bypass"`, or `"common_fund"`
- `weight_road_preparation_success`
- `weight_road_quarry_trust`
- `weight_road_folds_trust`
- `weight_road_common_trust`
- `weight_road_repair_plan`: `"contract_stone"`, `"pasture_bypass"`, or `"common_fund"`
- `weight_road_repair_dc`: selected plan's final displayed DC, stored at commitment
- `weight_road_repair_skill`: the winning skill selected by the shared best-of check, used to branch result prose
- `weight_road_repair_total`: stored check total for the result banner and replay-safe prose
- `weight_road_repair_roll_resolved`: replay guard for the single climactic roll and its stored result
- `weight_road_repair_success`: whether Room 4 preserved a usable road; false on a failed operation or expired deadline
- `weight_road_successful_completion`: permanent level-up credit marker, set only when a successful repair is finalized through Room 5; never set by `"road_lost"` and never cleared
- `weight_road_accounting`: `"full"`, `"shared"`, `"formal_quarry"`, `"formal_folds"`, or `"formal_commonwarden"`
- `weight_road_reforms_adopted`: true only after full public accounting
- `weight_road_quarry_favor`: potential later Hessa service or request; never an automatic item payout
- `weight_road_folds_favor`: potential later Nerin service or request; never an automatic item payout
- `weight_road_common_favor`: potential later Edda/Common service or request
- `weight_road_first_return_seen`: guards the longer post-quest reaction before using short persistent variants
- `weight_road_reward_claimed`: guards the 5-silver payment, completed-job increment, kitchen unlock, and favor assignment as one replay-safe result transaction
- `wf_ram_kitchen_unlocked`

## Likely Implementation Sites
 (All the content a lebels exist within the new quest scene file, only any choices that need to exist belong to the other files)
- New quest scene file inside `web/mygame/scenes/alderford/whitefold/`
- Organic hook, urgency-tier text, active-quest deadline guard, gated road exit, and post-quest road tell in `whitefold.txt`
- Edda and Nerin investigation routes in `fleecefold.txt`
- Hessa investigation route in `stone_yard.txt`
- Perrin investigation and possible kitchen unlock in `white_ram.txt`
- Active-quest variations in all three Whitefold places so quest leads remain reachable, elapsed time is rechecked on return, and inn sleep/training cannot cross the hard deadline without an explicit abandonment warning
- Source-level gating of the generated **Leave Whitefold** sidebar service in `tools/gen_city_settlements.js`, followed by regeneration; add a defensive Whitefold quest check at the overworld handoff so a stale or unusual route cannot escape the settlement
- Optional post-quest Orlov records route and Morzan penalty decision in `alderford/factors_hall.txt`; neither gates the Whitefold investigation, repair, or full-accounting outcome
- Startup variables in the appropriate startup source part, followed by startup regeneration
- `count_finished_weight_road` in the new quest scene and one corresponding `*gosub_scene` in `character_progression.txt`'s `refresh_quests_finished`, so a successful completion adds exactly one derived level-up quest credit
- Active quest entry in `web/mygame/quest-data.js`
- Outcome-gated Lorebook additions for Whitefold and the involved NPCs
- Quest registry summary in `Resources & Quest/QUESTS.md`

## Open Design Decisions

Before implementation, decide:

1. The exact contract destination and purpose for Whitefold's dressed stone.
2. The concrete later service or personal request attached to each constituency-favor flag. The finale deliberately stores goodwill without inventing an unsupported shop stock or item reward.

## Resolved Design Decisions

- **Alderford travel:** The active quest remains entirely within Whitefold. Edda's and Hessa's local records establish the delivery obligation and penalty. Orlov is not required for full public accounting, formal liability, or any repair plan. Any later visit to Orlov or Morzan is an optional post-quest attempt to confirm the filed settlement or negotiate the contract's consequences.
- **Quest weather and hour:** The hook appears in the Morning under a clear current sky when `ground_state` remains `"wet"` or `"sodden"` from earlier rain. The old water explains the failure and continuing deadline without forcing a storm to begin during the quest.
- **Commitment and abandonment:** Ignoring the initial alarm leaves the event unstarted and eligible to recur. Following Edda into Room 1 commits the player; there is no second acceptance prompt or indefinitely suspended emergency afterward. Leaving Whitefold is blocked, while deliberately exceeding the four-hour investigation deadline produces the designed road-loss resolution.
- **Room 4 resolution:** Room 4 is one decisive best-of-two skill check after the player chooses which resource Whitefold sacrifices. Earlier preparation grants advantage, support and losses alter the displayed DC, and success or failure converges on Room 5 without retries or supporting-check spam.
- **Room 5 resolution:** Room 5 has no additional roll. Full accounting requires all three principal evidence flags, or exactly two plus both Perrin's corroborating timeline and preserved site evidence. Shared fault is always available; each formal-liability target requires its own strong evidence.
- **Reward scale:** Any successful repair finalized through Room 5 pays 5 Silver Marks, adds one completed Insignia job, contributes one finished quest toward level-up progression, and permanently unlocks the White Ram kitchen and oven without adding Gilded Scales standing. `road_lost` grants none of those successful-repair rewards or level-up credit.
- **Local favors:** The physical sacrifice permits at most one constituency favor—folds after contracted-stone repair, quarry after the pasture bypass, or Common after fund stabilization. Formal liability against that constituency cancels the favor; no accounting choice creates extra constituency rewards.
- **Persistent scope:** Future Whitefold visits show the physical road result and accounting result in prose, dialogue, Fleecefold notices, and Lorebook additions. The first implementation does not remove map access or alter generated commodity prices and stock.
