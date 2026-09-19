# Quest Plan: The Rotten Rib (The Iron Wharves)

A grounded, low-stakes narrative quest for **The Iron Wharves** in Port Valen. Designed to flesh out maritime labor, craftsman pride, and the quiet commercial corruption of the Gilded Scales shipyards without causing major faction shifts.

> **Revision note (fail-forward pass).** The climax in Section 2 (Beat 4) and Section 3 was reworked after implementation. This plan is kept as the original design; where it differs, the game and `quest/QUESTS.md` (Quest 3) are current. What changed:
> * Branch A ("We're going to see Master Hendryk") no longer drags Elric to the factor and no longer needs no roll. The player goes over Elric's head, and the appeal at Hendryk's door is a check (`[CHA DC 13]` or `[INT DC 12]`, +1 if alerted, advantage with the ledger clue). Failure loses the evidence and a point of Gilded Scales standing.
> * The three failure menus (`beat_4_intellect_fail`, `_intimidation_fail`, `_blackmail_fail`) no longer offer Branch A or the bribe. A failed check is a strike: thrown out, alerted, DC +1. A second strike ends the quest.
> * A failed extortion no longer pays 4 or 8 silver. The waybill burns and the quest ends as `"failed"`.
> * New `rotten_rib_resolution = "failed"`: the ship launches on green wood, with no coin, gear or favor.
> * New variables: `rotten_rib_strikes`, `rotten_rib_ledger_clue`.
> * Reason: a failed roll must cost something and must never convert into the success (or the coin and gear) it was gambling for. See `quest/QUEST_DESIGN_RULES.md`, "Fail-Forward Design (Failure Must Cost Something)".

---

## 1. Overview, Cast & Trigger Architecture

### 1.1 Setting & Cast

* **District:** Harbor Quayside & Iron Wharves (Port Valen)
* **Primary Location:** Slipway Two (drydock framing cradle), Bay Four of the Timber Sheds, the Sawpits, and Clerk Elric's Raised Office.
* **Themes:** Craftsman integrity vs. commercial deadlines, the weight of unseasoned wood, dockside graft, and working-class vulnerability.
* **Cast:**
  * **The Master Shipwright (Brant):** Broad, stooped shoulders, a beard greyed like driftwood, forearms crosshatched with old tool scars. Speaks with economical precision; measures everything with his hands.
  * **The Yard Timber Clerk (Elric):** Narrow-jawed, ink-stained cuffs, smelling of stale pipe tobacco and damp wool. Diverts naval-grade highland oak to private refits in Dredge-End while substituting unseasoned green spruce.
  * **The Yard Factor (Master Hendryk):** Senior shipyard factor for the Gilded Scales. Wears beaver-fur trim over practical oilskin. Ruthlessly protective of his personal proof-stamp and tidal slipway rents.
  * **Yard Draymen (Gurn and Corve):** Heavy-shouldered teamsters who haul timber-skids and provide muscle for Clerk Elric when the yard is alerted.

---

### 1.2 The Iron Wharves Sub-Hub Architecture (`pv_poi_drydock` & `pv_poi_drydock_menu`)

* **Trigger Location:** Harbor Quayside (`port_valen.txt`), navigating to `pv_poi_drydock` (*"Step down to the shipwrights' ways at the Iron Wharves"*).
* **The Living Shipyard Sub-Hub (No Railroading):**
  Rather than forcing the player into a linear corridor, `pv_poi_drydock` operates as an open-world sub-hub grounded in the layout of the basin.
* **Environmental & Time Gates:**
  * **Operational Hours:** Active daytime only (`Morning`, `Midday`, `Afternoon`). 
  * **Barriers (No Filler Choices):** At `Dusk`, `Night`, or `Pre-Dawn`, or during severe gales (`Storm` or `Blizzard`), the wharf gates are chained, forge hearths are banked, and sentries turn visitors away. In accordance with Rule 5, these barriers deliver vivid sensory prose and route directly back via `*page_break Back up to the quayside… *goto port_valen_harbor_pois` without artificial filler choices.
* **Arrival vs. Internal Loop Architecture:**
  To prevent re-running the 15-minute arrival time advance (`pv_poi_drydock_1`) whenever returning from internal conversations, observations, or quest beats, `pv_poi_drydock` handles the arrival time and environmental gates, then routes to `pv_poi_drydock_menu`. All internal yard exits return to `pv_poi_drydock_menu`.
* **Hub Choices During Active Hours:**
  ```choicescript
  *label pv_poi_drydock
  *set hours_to_pass 0
  *set minutes_to_pass 15
  *set time_advance_call_id "pv_poi_drydock_1"
  *gosub_scene calendar advance_time
  *gosub_scene calendar recalc_hp_from_neglect

  *if (hp_current <= 0)
    *set death_cause "starvation"
    *if (neglect_damage_fatigue > neglect_damage_hunger)
      *set death_cause "exhaustion"
    *goto_scene death death_screen

  [Atmospheric time_period, weather, and day_of_week ambient prose]

  *label pv_poi_drydock_menu
  *choice
    *if (rotten_rib_quest_stage = "unstarted")
      # Walk down to Slipway Two, where an old shipwright works alone on a merchant hull.
        *goto beat_1_discovery
    *if (rotten_rib_quest_stage = "active")
      # Walk down to Slipway Two to check in with the master shipwright.
        *goto beat_2_shipwright_checkin
    *if (rotten_rib_quest_stage = "active")
      # Head uphill through the yard lane to the Timber Sheds and Sawpits.
        *goto beat_3_investigation
    *if (brant_favor)
      # Walk down to Slipway Two to speak with Master Brant.
        *goto pv_poi_brant_slipway
    # Watch the gantry cranes and caulkers at work along the central ways.
      *goto pv_poi_drydock_observe
    # Walk the granite sluice-walk past the tidal flood-gates and scrap bins.
      *goto pv_poi_drydock_salvage
    # Return to the Harbor Quayside.
      *goto port_valen_harbor_pois
  ```

---

### 1.3 Ambient Rumor Pre-Seed & Lifecycle

* **Location:** *The Cleaved Keel* taproom (`pv_poi_tavern_rumors` in `port_valen.txt`).
* **Pre-Seed Rumor (Strictly Gated behind `rotten_rib_quest_stage = "unstarted"`):**
  > Over by the rear hearth, two sawyers talk over sour beer: the Gilded Scales are riding the shipwrights hard down on Slipway Two. The guild factor has the master builder under a brutal contract fine for every tide the cradle sits occupied, and apprentices whisper that the timber cleared through the gates has been weeping green sap instead of ringing true.
* **Lifecycle Rules:**
  * **Suppressed on Quest Start:** Once the player visits Slipway Two and triggers Beat 2 (`rotten_rib_quest_stage != "unstarted"`), this rumor is permanently removed from the tavern rotation.
  * **Replaced on Resolution:** Once resolved (`rotten_rib_quest_stage = "resolved"`), it cycles into an outcome-reactive world rumor:
    * *Branch A (Exposed Elric):* *"The guild lockup took Clerk Elric this morning. Caught skimming naval oak for black-market refits. Master Hendryk has every account book in the timber office under audit."*
    * *Branch B (Shakedown):* *"They say Slipway Two had to bolt scrap iron across green spruce just to clear the cradle. If that merchant tub hits open swell, the sea will crack her open like a walnut."*
    * *Branch C (Silent Leverage):* *"Clerk Elric looked like he'd seen a ghost down in the sawpits today. Rolled three beams of cured highland oak back to Slipway Two with his own draymen and hasn't spoken a word since."*

```choicescript
*comment Tavern Rumor Integration in port_valen.txt (pv_poi_tavern_rumors)
*if (rotten_rib_quest_stage = "unstarted") and (not(pv_tavern_rumor_rotten_rib))
  *set pv_tavern_rumor_rotten_rib true
  Over by the rear hearth, two sawyers talk over sour beer: the Gilded Scales are riding the shipwrights hard down on Slipway Two. The guild factor has the master builder under a brutal contract fine for every tide the cradle sits occupied, and apprentices whisper that the timber cleared through the gates has been weeping green sap instead of ringing true.
  *page_break The talk moves on…
  *goto pv_poi_tavern_menu
*elseif (rotten_rib_quest_stage = "resolved") and (not(pv_tavern_rumor_rotten_rib_after))
  *set pv_tavern_rumor_rotten_rib_after true
  *if (rotten_rib_resolution = "lawful")
    A porter leans against the bar, nursing small beer. "The guild lockup took Clerk Elric this morning. Caught skimming naval oak for black-market refits in Dredge-End. Master Hendryk has every account book in the timber office under audit, and the slipways are moving again."
  *elseif (rotten_rib_resolution = "shakedown")
    Two ship caulkers shake their heads over their cups. "They say Slipway Two had to bolt scrap iron across green spruce just to clear the cradle. If that merchant tub hits open swell, the sea will crack her open like a walnut."
  *else
    *comment rotten_rib_resolution = "blackmail"
    A yard drayman chuckles into his tankard. "Clerk Elric looked like he'd seen a ghost down in the sawpits today. Rolled three beams of cured highland oak back to Slipway Two with his own men and hasn't spoken a word since."
  *page_break The talk moves on…
  *goto pv_poi_tavern_menu
```

---

## 2. Complete Narrative Prose Drafts

### Beat 1: The Environmental Discovery (Slipway Two)
*label beat_1_discovery

The air down on the shipwrights' ways is heavier than on the upper quays—thick with coal smoke from forge hearths, boiling pine tar, and the sour green smell of steamed timber. Across the basin, caulking irons ring rhythmically against the planking of two cargo vessels on Slipways One and Three, and sawpit crews shout over the rasp of heavy frame-saws.

On Slipway Two, the ribs of a seventy-foot merchant ship rise out of the granite cradle like the picked bones of a sea monster. Down in the basin mud beneath the keel, two young apprentices sweep cedar shavings into wicker baskets and stack split oak offcuts. Up in the ribs, working alone in the half-light beneath the deck beams where the shipyard noise is muffled by curved timbers, an old man in a tar-stained leather apron moves along the frames. He carries a short-handled iron mallet.

*Clink.* The mallet strikes the third rib—a clear, ringing note that sings in the oak.

He steps forward two paces.

*Thud.*

The mallet strikes the fourth rib. The sound is dull, wet, and dead, like hitting a sack of turnips.

The old man lowers the mallet to a cross-beam. He draws a blunt thumb across the black pitch wash painted over the wood, bringing his thumb to his nose. He pauses, exhales slowly, and presses his forehead against the damp timber, his shoulders sagging against the wood as if the weariness of a long lifetime had settled into his bones.

*choice
  # Step onto the scaffold planking to see what the shipwright found in the hull.
    *goto beat_2_shipwright
  # Watch from the timber skids, observing the old man and his apprentices at work.
    *goto beat_1_observe
  # Mind your own business and step back to the shipyard lane.
    *goto pv_poi_drydock_menu

*label beat_1_observe
You lean against a stack of seasoning spruce, watching the cradle from the gravel lane. Down by the keel, the two apprentices huddle over their broom handles, keeping their voices low beneath the clatter of the wooden mallets.

"He's been striking that same frame since dawn bell," the taller boy murmurs, glancing uneasily up at the ribs. "Sap's weeping straight through the pitch. If Master Hendryk finds out the ways are halted, he'll dock our winter meal-tokens."

"Halt the work or drown the crew," the younger boy retorts, kicking a wood shaving into the mud. "You want to ride her into the gorge when the seams open?"

Up on the staging, the old shipwright remains motionless against the fourth frame, glaring at the dark wash with a look of quiet, smoldering fury.

*choice
  # Step onto the scaffold planking to speak with him.
    *goto beat_2_shipwright
  # Approach the two apprentices sweeping shavings by the keel.
    *goto beat_1_ask_apprentices
  # Leave the shipwright to his troubles and return to the shipyard lane.
    *goto pv_poi_drydock_menu

*label beat_1_ask_apprentices
You step down into the basin mud beneath the ship's overhang, where the two apprentices are packing cedar curls into wicker hampers. When your shadow falls across their work, both boys stiffen, clutching their brooms with wide, uneasy eyes.

"We aren't holding up the ways, sir," the taller boy stammers, wiping wood dust from his nose with a greasy cuff. "Master Brant's just checking the framing sills. If you're from the front office, the master builder's right up on the scaffold."

"Don't look like a factor's clerk to me," the younger boy mutters under his breath, nudging a cedar wedge with his toe. "Clerks don't get mud on their boots."

They clearly know nothing beyond their broom handles and fear of the factor's fines.
*choice
  # Climb the timber ladder to the scaffold planking to speak with Brant.
    *goto beat_2_shipwright
  # Step back to the shipyard lane.
    *goto pv_poi_drydock_menu

---

### Beat 2: Approaching the Shipwright
*label beat_2_shipwright

When your boots hit the scaffold planking, the old man keeps his hand flat against the fourth frame, feeling the grain.

"Watch the grease on the timber slides," he grunts, his voice gravelly from decades of sawdust and estuary damp. "Slip on that ledge and you'll slide thirty feet into the basin mud, and nobody fishes you out till the tide turns."

He wipes his fingers on his apron, leaving a dark smear of pitch, and turns to face you. His eyes are watery grey, framed by deep crow's-feet etched with charcoal dust. He takes in your stance and gear with guarded craftsman caution.

"You don't look like one of Hendryk's clerks," he says, his tone flat. "This is an active cradle, stranger, and staging ropes fray without warning down here. What brings you onto my scaffolding?"

*choice
  # "Sounded like you struck bad wood with that mallet."
    *goto beat_2_examine_rib
  # "Looking for work along the wharves, or someone who knows where coin moves."
    *goto beat_2_mercenary_work
  # "My mistake. I'll leave you to your timbers."
    *goto beat_2_leave

*label beat_2_examine_rib
The old man's bushy grey eyebrows twitch. He studies your face, measuring the lack of mockery in your tone.

"You've got an ear on you, then," he murmurs.

*label beat_2_reveal_rot
He taps the fourth rib with his knuckles.

"Listen to that," he says.

He taps the third rib again—a clean, iron ring. Then the fourth—the flat, sodden thud.

"Third rib is highland heartwood," he says. "Felled in deep winter three years back, air-cured on river skids, hard enough to turn an iron arrowhead. Fourth rib... smells of damp bark and green summer sap. Unseasoned mountain spruce. Not cured two months."

He scratches at the dark coating with a calloused thumbnail. Beneath the tarry stain, the wood is pale and wet, weeping tiny beads of sticky sap.

"Painted over with black pitch wash to mimic heartwood," he murmurs. "Stamped with the Gilded Scales' inspection mark right where the rib joins the keel. Once this hull takes twenty tons of casked tallow and salt cod into open bay swells, the water will twist her. Green wood doesn't flex—it splits. The caulking will pop like old shoe stitching, and she'll open up from the keel in four fathoms of water."

He looks toward the yard gates, where a clerk with an armful of papers argues with a team of draymen.

"Thirty men on her crew," he says, wiping pitch from his thumb. "And Brant's name is carved into the keel-block. The launch is set for @{(day_of_week = "Tideday") this evening's flood tide|the coming Tideday's flood}. Hendryk fines me ten silver marks a day for every tide Slipway Two sits occupied past the contract date. If I pull these frames, I halt the work. If I halt the work, the guild docks my bond, turns my apprentices into the street, and leaves me with forty years of debt. If I don't pull them... thirty men drink harbour water before harvest."

*choice
  # "Who stamped the inspection mark? Where was the load delivered?"
    *goto beat_2_inquire_trail
  # "I can look into where your timber went. What is it worth to you if I find it?"
    *goto beat_2_bargain_reward
  # "Take a piece of this spruce straight to Master Hendryk. Force the factor to look at it."
    *goto beat_2_suggest_factor
  # "Thirty drowned sailors is a heavy weight, but it's not my fight. Good luck with the tide."
    *goto beat_2_decline

*label beat_2_inquire_trail
Brant points a calloused thumb at the faint red wax impression stamped into the wood near the keel line.

"Elric's office cleared it at dawn," he grunts. "The manifest said three long beams of cured highland oak went onto storage rack number four behind the sawpits. If real heartwood was delivered, it was there two hours ago. Go look at the rack if you have a mind to."
*goto beat_2_decision

*label beat_2_bargain_reward
Brant gives a dry chuckle, wiping his pitch-stained hand on his apron. He understands the question—coin-hunters don't work for prayers.

"I don't have guild silver—Hendryk keeps my bond in an iron vice," he says plainly. "But I have forty years of craftsman credit and prime bull-hide in my chest. I can build you a pair of heavy, iron-heeled shipwright boots that will keep you sure-footed on any grease, scaffolding, or wet deck in this basin. And as long as my slipway stands, you'll have an ally on these ways."

He nods toward the timber sheds. "The delivery was signed for rack four behind the sawpits. That's where you start."
*goto beat_2_decision

*label beat_2_suggest_factor
Brant shakes his head grimly, his mouth setting into a hard line.

"Hendryk demands paper proof," he says. "If I walk into the front office with nothing but a wet splinter, Elric will pull out his signed delivery sheet, swear I ruined the wood myself, and Hendryk will dock my bond on the spot. In this yard, paper beats wood every time. If we want the factor to listen, we need to find where the real timber went."

He looks back toward the sheds. "Check rack four behind the sawpits. That's where the paper says my heartwood was stacked."
*goto beat_2_decision

*label beat_2_decision
*set rotten_rib_quest_stage "active"
*set has_rotten_rib_splinter true
Brant draws a small hand-chisel from his apron pocket. With a firm, practiced strike of his palm, he shears off a thick, sap-weeping splinter from the fourth rib, catching it in his calloused hand. He presses the pale, sticky wood firmly into your fingers.

"Take this," Brant grunts, his eyes steady on yours. "Smell that raw mountain spruce sap? Keep it tucked in your pocket. If anyone claims Bay Four delivered cured heartwood, put this under their nose. And if you're going to look, do it before the evening shift clears the ways. In this yard, what sits after dark grows legs."

*choice
  # Head uphill through the yard lane to the Timber Sheds and Sawpits right now.
    *goto beat_3_investigation
  # "How do I recognize the real heartwood if they've already moved it?"
    *goto beat_2_identify_heartwood
  # "I'll see what I can find." Step off the staging back to the shipyard lane.
    *goto pv_poi_drydock_menu

*label beat_2_identify_heartwood
Brant taps the edge of his hand-chisel against the third rib.

"Three things," he grunts, holding up three calloused fingers. "First, grain rings: tight, dark bands, thirty to the inch. Highland oak grows slow in the high cols. Second, weight: cured heartwood feels like cold pig-iron when you lift a skid. Third... my brand. Brant's personal yard mark—a square notch over two crossed adzes—is burned two inches deep into the butt-end of every beam cleared for Slipway Two. If they shaved that mark off, the fresh cut will still smell of pine oil and iron."

He nods toward the seasoning sheds. "Now go before the evening shift clears the lanes."
*choice
  # Head uphill to the Timber Sheds and Sawpits now.
    *goto beat_3_investigation
  # "Understood." Step off the staging back to the shipyard lane.
    *goto pv_poi_drydock_menu

*label beat_2_shipwright_checkin
Brant is still working under the hull's shadow, checking the pitch wash on the third frame with a worn rasp. He looks up as your boots hit the staging.

"Still framing this green spruce," he grunts grimly. "Did you find where they moved the highland oak from Rack Four? Look behind the sawpits before Elric moves it onto the river."

*choice
  # Head uphill to the Seasoning Sheds and Sawpits now.
    *goto beat_3_investigation
  # "Anyone come sniffing around your staging while I was away?"
    *goto beat_2_checkin_sniffing
  # "Working on it. Keep your mallet handy." Step back to the shipyard lane.
    *goto pv_poi_drydock_menu

*label beat_2_checkin_sniffing
Brant runs a thumb down the fourth rib, shaking his head with a low grunt.

"Two of Hendryk's gate runners walked the cradle at mid-bell," he murmurs, his voice guarded. "Pretending to check the tidal sluices, but their eyes were counting my frames. The factor knows this hull is late. If you're going to turn up that heartwood, do it before the dusk shift rings."
*choice
  # Head uphill to the Seasoning Sheds and Sawpits now.
    *goto beat_3_investigation
  # Step back to the shipyard lane.
    *goto pv_poi_drydock_menu

*label beat_2_decline
Brant turns his back to the scaffolding, reaches into his chest for an iron brace, and begins bolting scrap metal across the rotten spruce, reinforcing wood that cannot be saved.
*page_break Back to the shipyard lane…
*goto pv_poi_drydock_menu

*label beat_2_mercenary_work
Brant snorts, shaking his head. "Coin? Nobody makes coin here but the factor and the river brokers. Unless you can haul massive timbers or swing a broadaxe for ten hours without dropping it, there are no day-wages on these ways."

He pauses, his hand resting on the fourth rib, his jaw tightening as he glares at the damp wood.

"Unless you're someone who knows how to run down thieves. Look here." He strikes the frame with his knuckles—a dull, wet thud. "Listen to that..."
*goto beat_2_reveal_rot

*label beat_2_leave
You give the shipwright a short nod and make your way back down the timber slides to the shipyard lane. The old man remains in the ribbed shadow, his palm pressed against the flawed timber.
*page_break Back to the shipyard lane…
*goto pv_poi_drydock_menu

---

### Beat 3: Investigating the Timber Sheds & Sawpits
*label beat_3_investigation

*set hours_to_pass 0
*set minutes_to_pass 15
*set time_advance_call_id "rotten_rib_investigate_1"
*gosub_scene calendar advance_time
*gosub_scene calendar recalc_hp_from_neglect

*if (hp_current <= 0)
  *set death_cause "starvation"
  *if (neglect_damage_fatigue > neglect_damage_hunger)
    *set death_cause "exhaustion"
  *goto_scene death death_screen

Leaving Slipway Two, you head fifty paces uphill through the shipyard lane toward the seasoning sheds. Here, the smell of estuary mud gives way to the resinous bite of fresh wood shavings, damp bark, and chimney smoke.

The timber yard sits under an open-sided pole shed thatched with woven reed mats to shield drying lumber from rain. Immense trunks of highland oak and mountain spruce rest on greased skids. In the center of the lane, two sawyers stand in a seven-foot pit, rhythmically pulling a two-man frame saw through an eight-foot oak trunk. Yellow sawdust showers over their sweating shoulders with every rasping stroke. Directly above the pit, perched on stout timber stilts, sits the yard clerk's wooden office, its shuttered window looking out over the lumber rows.

*temp tried_yard_ledger false
Following Brant's directions, you make your way past the sawpits to the numbered storage bays along the north wall.

*label beat_3_investigation_hub
Pinned to the heavy oak pillar of Bay Four under a rusted iron spike is the morning's delivery manifest. It bears the red wax seal of the Gilded Scales Timber Office: *Three hewn timber beams, prime highland heartwood, seventy feet, cleared for Slipway Two.*

Beneath the parchment, Bay Four's timber skids sit bare.

Only crushed bark and damp impressions in the gravel mark where the long timbers rested when the skids were cleared.

*temp hint_rib_wis ""
*temp hint_rib_int ""
*temp hint_sawyers_cha ""
*temp hint_sawyers_str ""
*temp hint_scout_dex ""
*if (show_stat_hints)
  *if (guidance_active)
    *set hint_rib_wis " [WIS DC 11 (+1d4 Guidance)]"
    *set hint_rib_int " [INT DC 11 (+1d4 Guidance)]"
    *set hint_sawyers_cha " [CHA DC 12 (+1d4 Guidance)]"
    *set hint_sawyers_str " [STR DC 12 (+1d4 Guidance)]"
    *set hint_scout_dex " [DEX DC 11 (+1d4 Guidance)]"
  *else
    *set hint_rib_wis " [WIS DC 11]"
    *set hint_rib_int " [INT DC 11]"
    *set hint_sawyers_cha " [CHA DC 12]"
    *set hint_sawyers_str " [STR DC 12]"
    *set hint_scout_dex " [DEX DC 11]"

*choice
  *if ((((((((((wizard_cantrip = "guidance") or (wizard_cantrip_2 = "guidance")) or (wizard_cantrip_3 = "guidance")) or (bard_cantrip = "guidance")) or (bard_cantrip_2 = "guidance")) or (warlock_cantrip = "guidance")) or (warlock_cantrip_2 = "guidance")) or (race_cantrip = "guidance")) or (race_cantrip_2 = "guidance")) and (not(guidance_active)))
    # [Cantrip: Guidance] Murmur a quiet divination blessing to steady your mind and senses.
      *set guidance_active true
      You trace a calming sign across your temples, murmuring an old divination verse. A subtle prickle of clairvoyance steadies your pulse and sharpens your focus.
      *goto beat_3_investigation_hub
  #${hint_rib_wis} Follow the fresh drag-scrapes and crushed bark in the mud leading away from Bay Four.
    *set check_stat "wis"
    *set check_dc 11
    *set check_skill "Read the Yard Tracks"
    *gosub_scene startup roll_d20_check
    *if (check_success)
      *goto beat_3_track_mud_success
    *else
      *goto beat_3_track_mud_failure
  *if (not(tried_yard_ledger))
    #${hint_rib_int} Check the Bay Four delivery manifest against the chalk notes on the pillar.
      *set check_stat "int"
      *set check_dc 11
      *set check_skill "Inspect Yard Ledgers"
      *gosub_scene startup roll_d20_check
      *if (check_success)
        *goto beat_3_ledger_success
      *else
        *goto beat_3_ledger_failure
  # Step up to the pit-saw and ask the sawyers who hauled the load out.
    *goto beat_3_question_sawyers
  # Circle the yard perimeter toward the western river-gate where private barges dock.
    *goto beat_3_scout_rivergate
  # This yard squabble isn't worth your neck. Leave the timber sheds and return to the quays.
    *goto beat_3_leave

*label beat_3_track_mud_success
You crouch beside Bay Four. In the packed gravel and damp sawdust, the trail is unmistakable: three heavy timbers were dragged off the skids with iron timber-hooks and wooden rollers.

The drag-scrapes bypass the lane to Slipway Two. Instead, the ruts cut south, skirting the back of the sawpits toward the brick boiler shed, where thick coal smoke from the pitch vats rolls low across the ground, screening the corner from view.

You follow the gouges through the smoke, staying low and out of sight.
*goto beat_3_find_stash

*label beat_3_track_mud_failure
You crouch by Bay Four, trying to isolate the heavy timber gouges. But the churn of dray hooves and hundreds of yard boots confuses the trail. You spend several minutes following an old iron-scrap furrow toward the active slag heaps.

Turning back through the swirling pitch smoke, your boot strikes a discarded iron pry-bar with a sharp clang. The smoke thins, leaving you in plain view of a worker tending the tar vats. The man glares and shouts a warning up toward the raised office: "Hoy! Watch the vats, stranger!"

Up in the clerk's office, a shutter swings open. You spot the canvas tarp behind the cod crates, but your approach was noisy.
*set elric_alerted true
*goto beat_3_find_stash

*label beat_3_ledger_success
You run your finger down the chalk delivery notes scrawled on the oak pillar beside the spike. The wagon driver logged the delivery under Team Three when the timber cleared. But right beside the driver's mark, a second set of clerk's initials—*E.V.*—reassigned the team to the western river-gate under a "special transit waybill," with a note for the boiler shed.

The paperwork confirms it: the oak never went to Brant. It was diverted straight to the river wall.
*goto beat_3_find_stash

*label beat_3_ledger_failure
*set tried_yard_ledger true
You squint at the chalk marks on the pillar, but the rain-damp wood and scrawled trade abbreviations are smudged beyond recognition. You won't get anything useful from this pillar—you'll have to find another trail through the yard.
*goto beat_3_investigation_hub

*label beat_3_question_sawyers
You walk over to the edge of the trench. The rhythmic rasp of the long two-man saw slows, then stops. The sawyer standing at the rim of the pit wipes sweat from his brow with a forearm and looks up, breathing hard, while his partner leans against the dirt wall down in the trench.

"Looking for the Bay Four timber," you say, pitching your voice over the hiss of the boiling tar. "Who hauled it out?"

The sawyer spits dark tobacco into the sawdust and wipes his mouth with the back of his hand, his eyes narrowing at your belt. "We're paid to saw oak, stranger, not answer questions for drifters. If you want yard business, go talk to Master Hendryk's guards at the gate. Clear off before a beam rolls."

*choice
  #${hint_sawyers_cha} "Thirty men will drown if that rotten spruce takes open water. Tell me where the heartwood went."
    *set check_stat "cha"
    *set check_dc 12
    *set check_skill "Appeal to Craftsman Honor"
    *gosub_scene startup roll_d20_check
    *if (check_success)
      *goto beat_3_sawyers_success
    *else
      *goto beat_3_sawyers_failure
  #${hint_sawyers_str} Step up to the pit rim, leaning over the timber with cold, unblinking physical menace.
    *set check_stat "str"
    *set check_dc 12
    *set check_skill "Physical Intimidation"
    *gosub_scene startup roll_d20_check
    *if (check_success)
      *goto beat_3_sawyers_success
    *else
      *goto beat_3_sawyers_failure
  *if (((((character_class = "bard") and ((bard_spell = "charm_person") or (bard_spell_2 = "charm_person"))) and (bard_spell_slots > 0)) or (((character_class = "wizard") and (wizard_spell = "charm_person")) and (wizard_spell_slots > 0))) or (((character_class = "warlock") and (warlock_spell = "charm_person")) and (warlock_spell_slots > 0)))
    # [Spell: Charm Person] Weave an enchanting warmth into your voice, putting the sawyer at total ease.
      *goto beat_3_sawyers_charm
  *if (((gold * 100) + (silver * 10) + copper) >= 20)
    # Slide two silver marks across the cut timber to buy a straight answer. [Cost: 2 Silver Marks]
      *goto beat_3_sawyers_bribe
  # Back away from the pit and look for another way to find the timber.
    *goto beat_3_investigation_hub

*label beat_3_sawyers_charm
*if (not(stat_bump_locked)) or (not(locked_stat_bump_page_id = choice_page_id))
  *if (character_class = "bard")
    *set bard_spell_slots - 1
  *elseif (character_class = "wizard")
    *set wizard_spell_slots - 1
  *else
    *set warlock_spell_slots - 1
  *set stat_bump_locked true
  *set locked_stat_bump_page_id choice_page_id
You trace a subtle spiral in the sawdust-laden air and speak with a gentle, hypnotic cadence. The enchantment settles over the sawyer's strained features like warm wine; his defensive scowl softens into easy camaraderie.

"Two dray teams hitched up when the load cleared," he confides warmly, leaning over the saw handle as if speaking to an old shipmate. "Clerk Elric came down the stairs himself with a private waybill. Told the teamsters the heartwood was condemned for worm-rot and had them roll the logs behind the boiler shed to wait for an evening river barge. Check behind the cod crates by the boiler wall."
*goto beat_3_find_stash

*label beat_3_sawyers_bribe
*if (not(currency_txn_locked)) or (not(locked_currency_txn_page_id = choice_page_id))
  *set currency_add_amount 0 - 20
  *gosub_scene startup currency_add
  *set currency_txn_locked true
  *set locked_currency_txn_page_id choice_page_id
You slide two silver marks across the rough oak trunk. The sawyer's calloused palm covers them in an instant, sweeping the coins into his pocket.

"Two dray teams hitched up when the load cleared," he grunts, keeping his voice beneath the hiss of the boiling tar. "Clerk Elric came down himself with a private waybill. Condemned the heartwood for worm-rot—three-winter cured oak, hard as iron—and had them roll the logs behind the boiler shed to wait for an evening river barge. Check behind the cod crates."
*goto beat_3_find_stash

*label beat_3_sawyers_success
The sawyer spits into the sawdust, his eyes darting toward the raised office above before settling back on you.

"Two dray teams hitched up when the load cleared," he grunts, keeping his voice low. "Clerk Elric came down the stairs himself with a private waybill. Told the teamsters the heartwood was condemned for worm-rot and had them roll the logs behind the boiler shed to wait for an evening river barge. Worm-rot? That highland oak was three winters cured. You could strike an anvil on it. Check behind the cod crates by the boiler wall."
*goto beat_3_find_stash

*label beat_3_sawyers_failure
The sawyer slams the flat of his palm against the oak trunk. "I told you to clear off! You don't pay our day-wages!"

The angry shout carries across the seasoning sheds. Up in the office above, the wooden shutter swings open. Clerk Elric leans out, his sharp face tightening as he glares down at the disturbance.

The sawyer spits furiously and snarls under his breath: "Behind the boiler wall, under the cod crates! Now get away from our pit before you cost us our day-wages!"
*set elric_alerted true
*goto beat_3_find_stash

*label beat_3_scout_rivergate
You keep to the shadows of the stacked timber skids, moving toward the western wall where the yard opens onto a muddy river-gate. Out in the channel, private river barges load scrap iron and salvaged rope under tarpaulins, far from the customs tower.

Near the gate, two rough-looking barge hands lounge against stacks of salted-cod barrels, sharing a clay pipe while keeping a casual eye on the lane. Behind them, tucked into the dead space between the boiler chimney and the stone retaining wall, sits a massive heap draped in weathered storm-canvas.

*choice
  #${hint_scout_dex} Ghost between the cod barrels and stacked timber racks while their backs are turned.
    *set check_stat "dex"
    *set check_dc 11
    *set check_skill "Slip Past the Barge Hands"
    *gosub_scene startup roll_d20_check
    *if (check_success)
      *goto beat_3_scout_success
    *else
      *goto beat_3_scout_failure
  *if ((((((((((wizard_cantrip = "minor_illusion") or (wizard_cantrip_2 = "minor_illusion")) or (wizard_cantrip_3 = "minor_illusion")) or (bard_cantrip = "minor_illusion")) or (bard_cantrip_2 = "minor_illusion")) or (warlock_cantrip = "minor_illusion")) or (warlock_cantrip_2 = "minor_illusion")) or (race_cantrip = "minor_illusion")) or (race_cantrip_2 = "minor_illusion")))
    # [Cantrip: Minor Illusion] Manifest the loud crash of an overturned barrel thirty yards up-channel to draw them away.
      *goto beat_3_scout_illusion
  # Back away from the river-gate and return to Bay Four.
    *goto beat_3_investigation_hub

*label beat_3_scout_illusion
You flick your fingers behind a stack of spruce skids. Thirty paces up the wharf lane, the sharp clatter of a heavy cask shattering on granite echoes off the retaining wall, accompanied by the phantom cry of an angry docker.

The two barge hands curse, drop their clay pipe, and hurry up the lane to see who damaged their cargo. You slip past their empty station into the shadowed space behind the boiler shed.
*goto beat_3_find_stash

*label beat_3_scout_success
You move silently between the barrels, timing your steps to the rhythm of the sawpits and the low rumble of the boiling vats. You slip behind the barrel stacks without attracting notice.
*goto beat_3_find_stash

*label beat_3_scout_failure
A loose iron barrel-hoop clatters against stone under your boot. One of the barge hands whips around, his hand dropping to a rusted iron belaying pin at his hip.

"Hoy! Who told you you could sniff around the private berths?"

You step into the light, meeting him with a cold, unblinking glare that promises violence if he takes another step. The two men size you up, exchange an uneasy glance, and slowly back toward the wharf edge. But before they scatter, one raises a boatswain's whistle to his lips and blows a piercing blast toward the timber office.
*set elric_alerted true
*goto beat_3_find_stash

*label beat_3_leave
You step back from the empty storage bay. Sinking ships and missing heartwood belong to the shipwrights and the harbor factor. You turn your back on the sawpits and head down the timber lane toward the water.
*page_break Back to the shipyard lane…
*goto pv_poi_drydock_menu

*label beat_3_find_stash
*set has_diverted_timber_waybill true
Behind the brick boiler shed, hidden beneath stacks of salted cod-crates and a heavy oiled storm-tarp, lie three massive, silver-grey beams of genuine highland oak.

You pull back the stiff canvas. The wood is dense, cool, and dry to the touch, smelling faintly of old forest humus and winter frost. Brant's yard registration number is branded clearly into the butt-ends. Wet white chalk scrawls a new destination across the grain:

*Barge 'Osprey' — Dredge-End Cut.*

Tacked to the underside of the oilcloth with an iron nail is a folded document: Clerk Elric's private transit waybill. It bears a red wax seal stamped with the scales-and-timber mark of 'Factor Hendryk' and the Gilded Scales, with scribed ink falsely condemning the highland oak for "worm-rot" and clearing it for disposal downriver.

You fold the stamped waybill into a tight square and slip it into your coat pocket. Someone skimmed thirty silver marks' worth of naval-grade heartwood to sell to an illegal refit in Dredge-End, substituting rotten spruce to cover the theft.

*if (elric_alerted)
  Above the lane, yellow candlelight flickers erratically in the small window of the wooden office on stilts. Through the dirty panes, you can see Clerk Elric pacing behind his desk, a heavy brass scale-weight in his grip, while two burly yard draymen linger at the foot of his stairs.
*else
  Above the lane, yellow candlelight flickers peacefully in the small window of the wooden office on stilts. Elric sits alone, quill scratching across open paper, oblivious to your presence.
*page_break Climb the wooden stairs to Clerk Elric's office…
*goto beat_4_clerk

---

### Beat 4: Confronting the Timber Clerk (Elric)
*label beat_4_clerk

The clerk sits in a cramped wooden office built on stilts above the sawpits. The room smells of dry ink, cold mutton grease, and pipe smoke. Behind him, tall pigeonholes hold rolled paper orders.

When you step through the doorframe, the timber floorboards creak under your boots.

*if (elric_alerted)
  Elric stands behind his desk, arms crossed over his chest, his face pale with furious tension. An iron lockbox sits bolted to the floorboards behind his stool, already shut and padlocked. At the foot of the exterior stairs, two heavy-shouldered yard draymen lean against the railing, clubs in hand, watching the door.
  
  "I heard the commotion down by the skids," Elric says coldly, his fingers tapping against a heavy brass scale-weight resting beside his inkpot. "Master Hendryk's guards are one whistle away. Whatever you're selling, stranger, I'm not buying."
  
  You pull Brant's sap-weeping spruce splinter from your coat pocket and drop it onto the desk. A sticky bead of pine resin smears across the polished oak.
*else
  Elric looks up from his desk, quill poised over an open daybook. He is young, sharp-featured, with fingers stained purple around the nails from ink. His eyes immediately flick to your belt, then back to your face.
  
  "All yard labor requisitions go through Master Hendryk's front office," he says smoothly, dipping his quill into the inkpot. "If you're looking for day-haul wages, the line forms at the outer gate on dawn bell. We don't hire off the street at this hour."
  
  You draw Brant's sap-weeping spruce splinter from your pocket and lay it directly across his open daybook, right over his fresh ink. A sticky bead of pine resin smears across the column.

The quill stops. Elric stares at the wet wood for three long seconds. The air in the little office goes dead quiet, save for the rhythmic *rasp-rasp-rasp* of the pit-saw working below the floorboards.

"What is that?" he asks, his voice dropping an octave.

"That's the fourth rib of the ship on Slipway Two," you say. "Fresh spruce. Green as spring grass. Painted in the dark with pitch."

Elric slowly rests his quill in the pewter inkstand. He leans back in his stool, folding his ink-stained hands over his stomach.

"Wood cures differently depending on the valley it was felled in," he says, perfectly flat. "The timber was surveyed, weighed, and stamped by the harbor inspector. The papers are filed with the Gilded Scales."

"The papers say three heavy beams of highland heartwood went to Slipway Two," you answer. "The heartwood is sitting behind the boiler shed under an oilcloth, marked for the *Osprey* in Dredge-End. And I have your waybill with Hendryk's personal proof-stamp tucked safely in my pocket."

Elric's jaw tightens. A nerve jumps beneath his left eye. He looks out the square window that overlooks the slipways.

"You don't know this quarter," he says, very low. "You think you've caught a thief. You think there's an honest piece of wood in this whole basin. The factor knows the ship is insured through the guild's lenders. If she sinks in deep water, the guild collects the bond and the builder's deposit. Nobody asks about the timber once the water's over the masthead."

*if (elric_alerted)
  He reaches into his vest pocket and pulls out a small cloth purse, setting it heavily on the desk.
  
  "Four silver marks," Elric says, his eyes flicking toward the window where his draymen wait. "Take it, walk out the front gate, and forget the sound of Brant's mallet. Push this further, and my draymen will throw you into the basin mud before you reach the factor."
*else
  He reaches into his leather vest pocket, pulls out a small cloth purse, and sets it on the desk. It clinks with the muffled ring of silver.
  
  "Eight silver marks," Elric says. "That's more than a month of company soldier's pay. Walk back out the gate, forget the sound of Brant's mallet, and let the ship launch."

*temp hint_clerk_extort_alerted ""
*temp hint_clerk_extort_unalerted ""
*temp hint_clerk_law ""
*temp hint_clerk_str ""
*temp hint_clerk_cha_blackmail ""
*if (show_stat_hints)
  *if (guidance_active)
    *set hint_clerk_extort_alerted " [CHA DC 13 (+1d4 Guidance)]"
    *set hint_clerk_extort_unalerted " [CHA DC 10 (Surprise / +1d4 Guidance)]"
    *set hint_clerk_law " [INT DC 12 (+1d4 Guidance)]"
    *set hint_clerk_str " [STR DC 12 (+1d4 Guidance)]"
    *set hint_clerk_cha_blackmail " [CHA DC 12 (+1d4 Guidance)]"
  *else
    *set hint_clerk_extort_alerted " [CHA DC 13]"
    *set hint_clerk_extort_unalerted " [CHA DC 10 (Surprise)]"
    *set hint_clerk_law " [INT DC 12]"
    *set hint_clerk_str " [STR DC 12]"
    *set hint_clerk_cha_blackmail " [CHA DC 12]"

*choice
  # "Put the coin away. We're going to see Master Hendryk."
    *goto beat_4_branch_a
  # Take the @{elric_alerted four|eight} silver marks from the desk, turn your back on Slipway Two, and walk out.
    *goto beat_4_take_bribe
  *if (elric_alerted)
    #${hint_clerk_extort_alerted} "Four silver? For thirty marks of stolen oak? Fourteen, or Hendryk hangs you by dusk."
      *set check_stat "cha"
      *set check_dc 13
      *set check_skill "High-Pressure Extortion"
      *gosub_scene startup roll_d20_check
      *if (check_success)
        *goto beat_4_branch_b
      *else
        *goto beat_4_shakedown_alerted_fail
  *if (not(elric_alerted))
    #${hint_clerk_extort_unalerted} "Eight silver is a joke for thirty marks of heartwood. Fourteen, or Hendryk sees this waybill."
      *set check_stat "cha"
      *set check_dc 10
      *set check_skill "High-Pressure Extortion"
      *gosub_scene startup roll_d20_check
      *if (check_success)
        *goto beat_4_branch_b
      *else
        *goto beat_4_shakedown_unalerted_fail
  #${hint_clerk_law} "Diverting naval timber under city charter carries the debtor hulks, Elric. The oak rolls back to Brant now, or this waybill goes to the customs bailiffs."
    *set check_stat "int"
    *set check_dc 12
    *set check_skill "Cite Guild Law"
    *gosub_scene startup roll_d20_check
    *if (check_success)
      *goto beat_4_branch_c
    *else
      *goto beat_4_intellect_fail
  #${hint_clerk_str} Step up to the desk, slamming your hand flat over his open daybook until the inkpot jumps. "The oak rolls back to Brant, Elric. Now."
    *set check_stat "str"
    *set check_dc 12
    *set check_skill "Physical Intimidation"
    *gosub_scene startup roll_d20_check
    *if (check_success)
      *goto beat_4_branch_c
    *else
      *goto beat_4_intimidation_fail
  #${hint_clerk_cha_blackmail} Lean across the desk, tapping Hendryk's proof-stamp against his knuckles. "The oak rolls back to Slipway Two before dusk, Elric. Or Hendryk reads his own seal on this transit sheet."
    *set check_stat "cha"
    *set check_dc 12
    *set check_skill "Coercive Blackmail"
    *gosub_scene startup roll_d20_check
    *if (check_success)
      *goto beat_4_branch_c
    *else
      *goto beat_4_blackmail_fail

*label beat_4_intellect_fail
Elric recovers his footing, his face hardening as he leans across the desk. "You know charter law, stranger, but you don't know who owns the bailiffs. Hendryk pays their wages. Threaten me with city law, and I'll have the Watch impound you for trespassing."

He taps the purse of coins. "Take what's on the table, or walk out with nothing."
*choice
  # "Then we take this straight to Master Hendryk right now."
    *goto beat_4_branch_a
  # Take the @{elric_alerted four|eight} silver marks and walk out.
    *goto beat_4_take_bribe
  # Leave the office without taking his tainted coin.
    *goto beat_4_walk_away

*label beat_4_intimidation_fail
Elric flinches as the desk shudders, but catching sight of his draymen on the stairs outside, his jaw locks with obstinate defiance.

"You can break my nose, stranger, but Gurn and Corve break necks for a living," he hisses, resting his hand against the heavy brass weight. "One shout and they pull you apart on the staging. Take the silver on the table, or leave through the mud."
*choice
  # Drag him off his stool anyway. "Then we're going to see Master Hendryk."
    *goto beat_4_branch_a
  # Take the @{elric_alerted four|eight} silver marks and walk out.
    *goto beat_4_take_bribe
  # Back away from the desk and leave the office.
    *goto beat_4_walk_away

*label beat_4_blackmail_fail
Elric's mouth thins into a venomous line. He leans back, resting both hands flat against his desk.

"You're waving paper you don't understand, stranger," he whispers harshly. "Hendryk knows every piece of timber moved in this yard. Bring that to him alone, and you'll find out who the Watch arrests for extortion. Take the coin on the table, or leave empty-handed."
*choice
  # "We'll see who Hendryk believes." Take him straight to the factor.
    *goto beat_4_branch_a
  # Take the @{elric_alerted four|eight} silver marks and walk out.
    *goto beat_4_take_bribe
  # Push the purse aside and leave the office.
    *goto beat_4_walk_away

*label beat_4_walk_away
*if (not(rotten_rib_resolved))
  *set rotten_rib_resolved true
  *set rotten_rib_quest_stage "resolved"
  *set rotten_rib_resolution "shakedown"
  *set rotten_rib_resolved_day campaign_day
  *set brant_favor false
  *set has_diverted_timber_waybill false
  *set has_rotten_rib_splinter false

You leave the purse lying on the desk and walk out the door onto the landing. Elric snatches the silver back with a triumphant sneer, while the two draymen watch you descend the stairs. Without proof or leverage, you have no way to halt the launch; down on Slipway Two, Brant will have to bolt whatever scrap iron he can find across wood that cannot hold.
*page_break Back to the shipyard lane…
*goto pv_poi_drydock_menu

*label beat_4_shakedown_unalerted_fail
Elric's eyes narrow. He pulls the purse back toward himself, his hand resting beside the brass weight.

"You're greedy, stranger, but you're not in a position to dictate terms in my own office," he says coldly. "Eight silver is my final offer. Take it and clear the staging, or I call the yard watch."

You take the eight silver marks from the desk and toss the transit waybill onto his brazier. Pushing further without backup will only draw the yard sentries.
*goto beat_4_shakedown_payout_8

---

## 3. The Three Resolution Branches (ChoiceScript Blocks & Logic)

### Branch A: The Guild Truth (Exposing the Fraud)
*label beat_4_branch_a

*set hours_to_pass 0
*set minutes_to_pass 30
*set time_advance_call_id "rotten_rib_branch_a_time"
*gosub_scene calendar advance_time
*gosub_scene calendar recalc_hp_from_neglect

*if (hp_current <= 0)
  *set death_cause "starvation"
  *if (neglect_damage_fatigue > neglect_damage_hunger)
    *set death_cause "exhaustion"
  *goto_scene death death_screen

You push the silver aside. "Put the coin away," you say. "We're going to see Master Hendryk."

Elric's face drains of color. He reaches for his desk drawer, but your hand clamps his wrist against the wood, holding him fast until he winces. 

*if (elric_alerted)
  As you push Elric through the office door onto the landing, the two heavy-shouldered draymen step toward the stairs, clubs gripped in calloused fists. Elric's voice cracks in panic: "Stay back, Gurn! Don't touch him! It's factor's business—stay back!" Knowing that a brawl will bring the city bailiffs and expose his personal forgery, the clerk waves them off in terror, and the two men slowly lower their clubs.

When you walk Elric down the central slipway into the factor's office, the yard workers lower their mallets. Word moves through a shipyard like grease on water.

Master Hendryk sits beneath a bronze balance-scale, sipping watered wine from a pewter cup. When you lay the sap-wet wood and the altered waybill onto his cedar desk, he studies the evidence in cold, deliberate silence. He inspects the splinter, scrapes it with a silver fruit knife, and looks at Elric with the quiet disgust of a man finding a dead beetle in his soup.

"You used my proof-stamp," Hendryk says softly. "I don't care that you sold the timber, Elric. I care that you used my personal stamp on a hull insured under the provincial charter. If the city inspectors had seen this, the guild would have seized my warehouse."

He waves two heavy-shouldered yard guards forward. They take Elric by the elbows and march him out toward the customs lockup.

Hendryk turns his pale eyes to you.

"Brant gets the cured heartwood moved from the boiler shed within the hour," Hendryk says, counting four silver marks from an iron box onto the desk. "And Slipway Two gets three days' grace on the tide clock, signed under my seal. A finder's fee for your trouble, stranger. And my advice: don't linger by the timber gates after dark. Elric has brothers down in Dredge-End."

*if (not(rotten_rib_resolved))
  *set rotten_rib_resolved true
  *set rotten_rib_quest_stage "resolved"
  *set rotten_rib_resolution "lawful"
  *set rotten_rib_resolved_day campaign_day
  *set gilded_scales_rep +1
  *set brant_favor true
  *set has_diverted_timber_waybill false
  *set has_rotten_rib_splinter false
  *set has_brant_iron_heel_boots true
  *gosub_scene equipment equip_feet "brant_iron_heel_boots"

*if (not(currency_txn_locked)) or (not(locked_currency_txn_page_id = choice_page_id))
  *set currency_add_amount 40
  *gosub_scene startup currency_add
  *set currency_txn_locked true
  *set locked_currency_txn_page_id choice_page_id

[b][⚖ Guild Standing: Gilded Scales Rep +1][/b]
*line_break
[b][🪙 Finder's Fee: +4 Silver Marks][/b]
*line_break
[b][👢 Acquired: Brant's Iron-Heel Shipwright Boots][/b]

Down on Slipway Two, four draymen are already rolling the three massive highland oak beams down the skids. Brant watches the yard crane lower the dense wood into the cradle, his rough face softening with relief. He hands you a pair of heavy, bull-hide boots fitted with caulked iron heel-plates: *"Tide mud ruined three pairs of apprentice shoes before I forged these heel-plates. These will keep your feet dry and sure-footed on any slick timber or wet cobbles in this city. Slipway Two remembers who stood by her."*

*page_break Back to the shipyard lane…
*goto pv_poi_drydock_menu

---

### Branch B: The Shakedown (Taking the Cut)
*label beat_4_take_bribe
*set hours_to_pass 0
*set minutes_to_pass 20
*set time_advance_call_id "rotten_rib_take_bribe_time"
*gosub_scene calendar advance_time
*gosub_scene calendar recalc_hp_from_neglect

*if (hp_current <= 0)
  *set death_cause "starvation"
  *if (neglect_damage_fatigue > neglect_damage_hunger)
    *set death_cause "exhaustion"
  *goto_scene death death_screen

You sweep the cloth purse from the desk into your pocket and push the folded delivery waybill across the wood. Elric's shaking hand clamps down on the paper, immediately holding it over his tallow candle until the flame catches the dry fibers and curls Hendryk's red seal into black ash.

"A sensible trade, stranger," Elric breathes, the color creeping back into his narrow face. "Now walk out through the main gates and forget what you heard in Slipway Two."

*if (not(rotten_rib_resolved))
  *set rotten_rib_resolved true
  *set rotten_rib_quest_stage "resolved"
  *set rotten_rib_resolution "shakedown"
  *set rotten_rib_resolved_day campaign_day
  *set brant_favor false
  *set has_diverted_timber_waybill false
  *set has_rotten_rib_splinter false

*if (not(currency_txn_locked)) or (not(locked_currency_txn_page_id = choice_page_id))
  *if (elric_alerted)
    *set currency_add_amount 40
  *else
    *set currency_add_amount 80
  *gosub_scene startup currency_add
  *set currency_txn_locked true
  *set locked_currency_txn_page_id choice_page_id

*if (elric_alerted)
  [b][🪙 Hush Money: +4 Silver Marks][/b]
*else
  [b][🪙 Hush Money: +8 Silver Marks][/b]

Down on Slipway Two, Brant watches you pass the cradle toward the outer gates. He looks at your face, sees the heavy sag of your purse, and turns back to the rotten spruce with his iron braces, futilely bolting scrap metal across wood that cannot hold. The ship will launch on schedule, but her fate on the open swell is sealed.

*page_break Back to the shipyard lane…
*goto pv_poi_drydock_menu

*label beat_4_branch_b

*set hours_to_pass 0
*set minutes_to_pass 20
*set time_advance_call_id "rotten_rib_branch_b_time"
*gosub_scene calendar advance_time
*gosub_scene calendar recalc_hp_from_neglect

*if (hp_current <= 0)
  *set death_cause "starvation"
  *if (neglect_damage_fatigue > neglect_damage_hunger)
    *set death_cause "exhaustion"
  *goto_scene death death_screen

You weigh the pouch of silver in your palm, leaning in until Elric can smell the grit on your coat.

"You're moving three massive oak beams to a private yard in the cut," you say in a low voice. "That's thirty silver marks on the low side, cash in hand before the barge clears the harbor chain. You want me to forget the boiler shed? Fourteen silver. Right now. Or I take this waybill to Hendryk and let the debtor hulks teach you how to saw spruce."

Elric stares at you with pure hatred. For a second, his knuckles whiten on the armrests of his stool. Then he reaches beneath the floorboards behind his desk and drags out a heavy iron lockbox. He counts six more heavy silver marks into your hand, his fingers trembling with rage, and snatches the waybill from your grip to burn in his brazier.

"Take it," he hisses. "And get out of my yard."

*if (not(rotten_rib_resolved))
  *set rotten_rib_resolved true
  *set rotten_rib_quest_stage "resolved"
  *set rotten_rib_resolution "shakedown"
  *set rotten_rib_resolved_day campaign_day
  *set brant_favor false
  *set has_diverted_timber_waybill false
  *set has_rotten_rib_splinter false

*if (not(currency_txn_locked)) or (not(locked_currency_txn_page_id = choice_page_id))
  *set currency_add_amount 140
  *gosub_scene startup currency_add
  *set currency_txn_locked true
  *set locked_currency_txn_page_id choice_page_id

[b][🪙 Black-Market Cut: +14 Silver Marks][/b]

You pocket the fourteen silver marks and step back into the shipyard lane.

Down on Slipway Two, Brant stands in the hollow curve of the ship's ribs. He watches you walk past toward the main gates. He looks at your face, sees the heavy line of your purse, and understands.

He turns his back on you, takes an iron brace from his chest, and begins bolting scrap iron across the rotten green spruce, attempting to reinforce wood that cannot be saved. The ship will launch on schedule, but her fate on the open swell is sealed.

*page_break Back to the shipyard lane…
*goto pv_poi_drydock_menu

*label beat_4_shakedown_alerted_fail
*set hours_to_pass 0
*set minutes_to_pass 20
*set time_advance_call_id "rotten_rib_branch_b_fail_time"
*gosub_scene calendar advance_time
*gosub_scene calendar recalc_hp_from_neglect

*if (hp_current <= 0)
  *set death_cause "starvation"
  *if (neglect_damage_fatigue > neglect_damage_hunger)
    *set death_cause "exhaustion"
  *goto_scene death death_screen

Elric holds his ground. Backed by the two heavy-shouldered draymen lingering on the steps outside, his lips peel back in a sneer.

"Fourteen silver?" He gives a harsh bark of laughter. "You're standing in my office with sawdust in your hair, threatening a guild factor's clerk. One shout and Gurn and Corve break your ribs on the staging, and Master Hendryk won't even look up from his accounts."

He shoves the pouch of four silver marks hard across the desk, snatching the waybill from the wood before tossing it into his tallow burner.

"Four silver. Take it and walk out the front gate before I change my mind and call the watch."

You look at the two thick-necked draymen through the window, then down at the small purse. The leverage is gone; pressing further means fighting the yard watch on their staging. You pocket the four silver marks and leave the raised office.

*if (not(rotten_rib_resolved))
  *set rotten_rib_resolved true
  *set rotten_rib_quest_stage "resolved"
  *set rotten_rib_resolution "shakedown"
  *set rotten_rib_resolved_day campaign_day
  *set brant_favor false
  *set has_diverted_timber_waybill false
  *set has_rotten_rib_splinter false

*if (not(currency_txn_locked)) or (not(locked_currency_txn_page_id = choice_page_id))
  *set currency_add_amount 40
  *gosub_scene startup currency_add
  *set currency_txn_locked true
  *set locked_currency_txn_page_id choice_page_id

[b][🪙 Hush Money: +4 Silver Marks][/b]

Down on Slipway Two, Brant watches you pass the cradle with your head down. He turns back to the rotten spruce with his iron braces, futilely reinforcing wood that cannot hold.

*page_break Back to the shipyard lane…
*goto pv_poi_drydock_menu

*label beat_4_shakedown_payout_8
*set hours_to_pass 0
*set minutes_to_pass 20
*set time_advance_call_id "rotten_rib_branch_b_8_time"
*gosub_scene calendar advance_time
*gosub_scene calendar recalc_hp_from_neglect

*if (hp_current <= 0)
  *set death_cause "starvation"
  *if (neglect_damage_fatigue > neglect_damage_hunger)
    *set death_cause "exhaustion"
  *goto_scene death death_screen

*if (not(rotten_rib_resolved))
  *set rotten_rib_resolved true
  *set rotten_rib_quest_stage "resolved"
  *set rotten_rib_resolution "shakedown"
  *set rotten_rib_resolved_day campaign_day
  *set brant_favor false
  *set has_diverted_timber_waybill false
  *set has_rotten_rib_splinter false

*if (not(currency_txn_locked)) or (not(locked_currency_txn_page_id = choice_page_id))
  *set currency_add_amount 80
  *gosub_scene startup currency_add
  *set currency_txn_locked true
  *set locked_currency_txn_page_id choice_page_id

[b][🪙 Hush Money: +8 Silver Marks][/b]

Down on Slipway Two, Brant watches you walk past the slipway toward the main gates. He sees the heavy line of your purse and turns back to the rotten wood in silence.

*page_break Back to the shipyard lane…
*goto pv_poi_drydock_menu

---

### Branch C: The Silent Leverage (Political Blackmail)
*label beat_4_branch_c

*set hours_to_pass 0
*set minutes_to_pass 25
*set time_advance_call_id "rotten_rib_branch_c_time"
*gosub_scene calendar advance_time
*gosub_scene calendar recalc_hp_from_neglect

*if (hp_current <= 0)
  *set death_cause "starvation"
  *if (neglect_damage_fatigue > neglect_damage_hunger)
    *set death_cause "exhaustion"
  *goto_scene death death_screen

You push the silver purse firmly aside.

"Keep your coin," you say.

Elric blinks, uncomprehending. "What do you want, then?"

"Before dusk, the three highland oak beams behind the boiler shed go back to Slipway Two," you say, your voice even. "Brant gets his timber. His apprentices start fitting the ribs tomorrow morning. If so much as one splinter goes missing between the shed and the slipway, we have another conversation."

Elric swallows, his eyes darting to your inner coat pocket. "And the waybill? You give me the delivery slip?"

You pat your coat pocket, feeling the stiff parchment bearing Master Hendryk's personal proof-stamp.

"I keep the paper."

Elric's face turns the color of curdled milk. He scrambles half off his stool. "You can't do that! Who are you selling it to? Who do you answer to? The Harbour Bailiffs? The city inspectors?"

You let the silence hang between you, letting his fear do the work. A clerk who used his master's official proof-stamp to condemn naval-grade timber under city charter knows the penalty; his eyes dart frantically between the stamped parchment and the door as if he can already hear the iron locks of the debtor hulks swinging shut. As long as that stamped waybill exists in unnamed hands, Elric will never know when the hammer falls.

*if (elric_alerted)
  At the foot of the stairs, the two heavy-shouldered draymen step forward. You hold up the red-waxed waybill, flashing Master Hendryk's personal proof-seal in the daylight. "Factor's audit," you state flatly. "Touch a hand to me, and you join your clerk in the lockup before sundown." The two draymen glance at the stamp, exchange an uneasy look, and step back.

Down on Slipway Two, the afternoon horn sounds across the water. Before the steam has cleared from the sawpits, four yard workers appear rolling the three massive, dark highland oak beams down the skids onto Brant's slipway.

Brant watches the yard crane lower the dense oak into the ship's framing cradle. He looks across the slipway at you, his rough face softening with profound relief. He reaches into a heavy wood chest and brings out a pair of thick-soled bull-hide boots, sealed with black pitch against harbor mud and fitted with iron heel-plates.

"I don't know what you said to that snake on the stilts," Brant says quietly, handing you the boots with a firm grip. "And I won't ask. But Slipway Two remembers who pulled her out of the mud. If you ever need honest counsel, word along the wharves, or a skipper who doesn't ask guild permission, my slip is open to you."

*if (not(rotten_rib_resolved))
  *set rotten_rib_resolved true
  *set rotten_rib_quest_stage "resolved"
  *set rotten_rib_resolution "blackmail"
  *set rotten_rib_resolved_day campaign_day
  *set brant_favor true
  *set has_rotten_rib_splinter false
  *set has_brant_iron_heel_boots true
  *gosub_scene equipment equip_feet "brant_iron_heel_boots"

[b][📜 Retained: Stamped Timber Waybill (Hendryk Blackmail Material)][/b]
*line_break
[b][👢 Acquired: Brant's Iron-Heel Shipwright Boots][/b]

*comment ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*comment CAPTAIN VANE INTEGRATION: TURNING IN THE WAYBILL
*comment ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*comment In port_valen.txt, at port_valen_hub (Carrion Compound), under *if (vane_independent_operative):
*comment   *if (has_diverted_timber_waybill)
*comment     # Report to Captain Vane's study with Master Hendryk's diverted timber waybill.
*comment       *goto port_valen_vane_timber_turnin

*label port_valen_vane_timber_turnin
*set hours_to_pass 0
*set minutes_to_pass 15
*set time_advance_call_id "vane_timber_turnin_time"
*gosub_scene calendar advance_time
*gosub_scene calendar recalc_hp_from_neglect

*if (hp_current <= 0)
  *set death_cause "starvation"
  *if (neglect_damage_fatigue > neglect_damage_hunger)
    *set death_cause "exhaustion"
  *goto_scene death death_screen

You climb the narrow timber stair to the upper gallery of the garrison headquarters. On the landing outside the captain's study, a veteran sentry in soot-blackened chainmail stands watch, an upright poleaxe grounded against the planking. As you approach, the sentry shifts his haft across the doorframe, checking your stride and kit before recognizing you from the company muster.

The sentry grunts, rapping two iron-studded knuckles against the heavy oak frame."The recruit you mentioned, sir."

From within, Vane's voice cuts through the door: "Enter."

The study is spartan and functional: a trestle desk crowded with ledgers and transit waybills, the company's raven banner nailed flat to the masonry behind him.
*if ((time_period = "Night") or ((time_period = "Late Night") or (time_period = "Pre-Dawn")))
  A single horn lantern burns steady beside his inkhorn, casting a sharp pool of orange light across open requisition sheets.
*elseif (time_period = "Dusk")
  The dying amber light of dusk filters through the shutter slats, catching the drifting smoke of a small clay brazier.
*else
  A blade of pale daylight cuts through the shutter slats across open requisition sheets.

You step up to the desk and lay Clerk Elric's folded transit waybill flat onto the wood. The red wax impression of Master Hendryk's personal proof-stamp catches the light.

Vane lets the parchment lie on the timber between you, his cold grey eyes moving from the paper to your face, then down to the scribed ink. He draws the parchment closer with one finger, scanning the diverted oak tonnage, the false "worm-rot" notation, and the barge routing for Dredge-End.

"Hendryk's personal proof-seal," Vane murmurs, his voice devoid of surprise but weighted with calculating satisfaction. "The Gilded Scales have been stalling company supply requisitions all week, claiming transport shortages along the river cut. This proves their wharf factor is illegally liquidating naval heartwood under city charter."

He folds the waybill into a neat square and slides it into a brass-cornered dispatch box behind his inkpot.

"Leverage like this buys the company six months of priority forage rights and silences the guild's complaints about our patrol logs," Vane says, opening his iron cash drawer. He counts five heavy silver marks onto the table. "You used your eyes and kept the paper intact. The company remembers initiative."

*if (not(stat_bump_locked)) or (not(locked_stat_bump_page_id = choice_page_id))
  *set vane_standing +1
  *set has_diverted_timber_waybill false
  *set vane_timber_turned_in true
  *set stat_bump_locked true
  *set locked_stat_bump_page_id choice_page_id

*if (not(currency_txn_locked)) or (not(locked_currency_txn_page_id = choice_page_id))
  *set currency_add_amount 50
  *gosub_scene startup currency_add
  *set currency_txn_locked true
  *set locked_currency_txn_page_id choice_page_id

[b][🦅 Company Regard: Captain Vane's Regard +1][/b]
*line_break
[b][🪙 Intelligence Bounty: +5 Silver Marks][/b]

*page_break Return to the garrison yard…
*goto port_valen_hub

---

## 4. Post-Resolution Hub Integration: Slipway Two (`pv_poi_brant_slipway`)

When the player returns to the Iron Wharves after saving Brant's ship (Branch A or Branch C), Slipway Two operates as an allied contact location on the waterfront (`brant_favor = true`).

To satisfy the **Timelessness Litmus Test (100-Day Rule)**, dialogue dynamically branches across `campaign_day`, and dialogue sub-options route through an internal loop label (`pv_poi_brant_slipway_menu`) to avoid repeating the arrival greeting:

```choicescript
*label pv_poi_brant_slipway
*if ((campaign_day - rotten_rib_resolved_day) <= 2)
  Down on Slipway Two, genuine highland oak ribs gleam under a dark coat of pine pitch. Brant stands by his timber bench, smoothing an oak beam with a curved draw-blade amid the screech of long saws. The apprentices drive the final wooden fastening pegs into the hull planks, rigging the merchant vessel for her coming launch.
*else
  Down on Slipway Two, the merchant ship has long since cleared her cradle for the open sea. In her place, Brant and his apprentices are framing a stout forty-foot river barge, the smell of fresh cedar shavings and hot pitch rich in the salt air.

When he spots you walking the staging, the old shipwright lays down his blade and wipes his calloused hands on his leather apron, a rare, genuine grin crinkling the corners of his eyes.

"Back again," he greets you with a nod of real craftsman respect. "Good to have honest boots on the staging. What's on your mind?"

*label pv_poi_brant_slipway_menu
*choice
  # Check on how the slipway's work is progressing.
    *if ((campaign_day - rotten_rib_resolved_day) <= 2)
      "She'll take the flood true," Brant says, rapping his knuckles against the third rib—a clear, bell-like ring that hums through the oak. "No spruce rot, no water in the bilges. The apprentices are driving the last fastening pegs now. Thirty men will see their home ports because of you."
    *else
      "The merchant ship cleared the harbor chain on the spring flood without taking an inch of water in her bilges," Brant says proudly, running a hand over the new barge keel. "Her master sent back word: dry cargo all the way to the outer banks. We're laying down this grain barge now—honest heartwood from stem to stern."
    *page_break Continue talking with Brant…
    *goto pv_poi_brant_slipway_menu
  # Inquire about what he's hearing along the quays and river channel.
    *if (rotten_rib_resolution = "lawful")
      Brant leans against his bench, dropping his voice below the noise of the yard. "The Gilded Scales factors are sweating. Word along the basin is the council's customs inspectors are auditing timber manifests up and down the cut. Hendryk's keeping his head down, and independent skippers are moving their freight before the bailiffs tighten the harbour chains."
    *else
      *comment rotten_rib_resolution = "blackmail"
      Brant leans against his bench, dropping his voice below the noise of the yard. "Well, Elric's been quiet as a mouse up in that stilt office. Walks past my slipway with his eyes glued to the mud, and I haven't seen a stick of green spruce near Bay Four since. Whatever thumb you put on him, it's holding."
    *page_break Continue talking with Brant…
    *goto pv_poi_brant_slipway_menu
  # Find out if he knows any skippers who might need reliable help or quiet passage downriver.
    Brant gives a knowing chuckle. "Slipway Two's seen forty years of river craft come through her cradle. When you need a word put in with an independent barge master—men who haul quiet cargo downriver and don't ask the guild's leave—you come see me first. I know every honest skipper between here and the sea."
    *page_break Continue talking with Brant…
    *goto pv_poi_brant_slipway_menu
  # Take your leave and step back to the shipyard lane.
    *goto pv_poi_drydock_menu
```

### Persistent Downtime Affordances for `pv_poi_drydock_menu`
To ensure `pv_poi_drydock_menu` always offers at least 3 genuine options regardless of quest stage or branch resolution (preventing 2-choice collapse under Branch B where `brant_favor` is false):

```choicescript
*label pv_poi_drydock_observe
You lean against the stone retaining wall above the ways, watching the steady labor of the Iron Wharves. Massive balance cranes swing heavy oak timbers through the air, weighted down by iron cages of river stone. Shipwrights drive boiling tar into hull seams with rhythmic mallet strikes, while foremen with chalkboards shout orders over the rasp of the sawpits. Down here, stone, iron, and timber dictate the rhythms of every life.
*page_break Back to the shipyard lane…
*goto pv_poi_drydock_menu

*label pv_poi_drydock_salvage
You walk along the granite sluice-walk overlooking the lower basin. By the tidal flood-gates, apprentices sort through bins of seasoned oak wedges, curled pine shavings, and salvage iron salvaged from broken keels. The tidal water laps against the granite sills below, scouring the slime from the timber slides as the estuary tide turns.
*page_break Back to the shipyard lane…
*goto pv_poi_drydock_menu
```

---

## 5. Technical Specification & Variable Manifest

### 5.1 Required Variables in `startup.txt`
```choicescript
*create rotten_rib_quest_stage "unstarted"     ; "unstarted" | "active" | "resolved"
*create rotten_rib_resolution "none"           ; "none" | "lawful" | "shakedown" | "blackmail"
*create rotten_rib_resolved false              ; one-time completion guard
*create rotten_rib_resolved_day 0              ; campaign_day when resolved
*create has_rotten_rib_splinter false          ; physical proof collected from Brant
*create has_diverted_timber_waybill false      ; Hendryk's personal proof-stamped waybill
*create vane_timber_turned_in false            ; whether Hendryk's waybill was delivered to Vane
*create elric_alerted false                    ; whether sawpits/gate sentries raised alarm
*create brant_favor false                      ; unlocks allied contact hub on Slipway Two
*create has_brant_iron_heel_boots false        ; inventory item flag
*create pv_tavern_rumor_rotten_rib false       ; pre-seed rumor in The Cleaved Keel
*create pv_tavern_rumor_rotten_rib_after false ; post-resolution rumor in The Cleaved Keel
```

### 5.2 Equipment Integration in `equipment.txt`
```choicescript
*if (equipped_feet_id = "brant_iron_heel_boots")
  *set feet_desc "Brant's Iron-Heel Shipwright Boots"
  *set feet_prose "iron-heeled boots"
```

### 5.3 Stats Sheet Integration in `choicescript_stats.txt`
```choicescript
*comment Contract / Quest Status under ◈ CURRENT STATUS
*if (rotten_rib_quest_stage = "active")
  *line_break
  • [b]Active Quest:[/b] The Rotten Rib (The Iron Wharves)
*if (rotten_rib_quest_stage = "resolved")
  *line_break
  • [b]Resolved Contract:[/b] The Rotten Rib
  *if (rotten_rib_resolution = "lawful")
    — [i]Exposed to Master Hendryk (Gilded Scales)[/i]
  *if (rotten_rib_resolution = "shakedown")
    — [i]Hush-Money Shakedown (Clerk Elric)[/i]
  *if (rotten_rib_resolution = "blackmail")
    *if (vane_timber_turned_in)
      — [i]Silent Leverage (Evidence Delivered to Captain Vane)[/i]
    *else
      — [i]Silent Leverage & Blackmail Material Retained[/i]

*comment Inventory Integration under ◈ INVENTORY
*comment Permanent Equipment Reward (Branch A or Branch C):
*if (has_brant_iron_heel_boots)
  *set has_inventory_item true
  *line_break
  • [b]Brant's Iron-Heel Shipwright Boots:[/b] Heavy bull-hide boots pitch-sealed against estuary damp, fitted with caulked iron heel-plates for slipway grip@{(equipped_feet_id = "brant_iron_heel_boots")  [Worn]| [Stowed]}

*comment Temporary Investigation Evidence (cleared to false on resolution across all branches):
*if (has_rotten_rib_splinter)
  *set has_inventory_item true
  *line_break
  • [b]Sap-Weeping Spruce Splinter:[/b] A wet, pitch-stained splinter of unseasoned mountain spruce sheared from the fourth rib of Slipway Two [Physical Evidence]

*comment Temporary Blackmail Material (cleared on resolution for A & B; retained in C until turned in to Captain Vane):
*if (has_diverted_timber_waybill)
  *set has_inventory_item true
  *line_break
  • [b]Diverted Timber Waybill:[/b] Scribed transit waybill bearing Master Hendryk's personal proof-stamp, falsely condemning naval heartwood for worm-rot [Blackmail Material]
```

### 5.4 Quest Reference Documentation in `quest/QUESTS.md`
```markdown
### 3. The Rotten Rib (The Iron Wharves)
* **Scene File:** `port_valen.txt` (`pv_poi_drydock`)
* **Briefing / Origin:** Slipway Two at the Iron Wharves. Master Shipwright Brant discovers that green, unseasoned mountain spruce was substituted for naval-grade highland oak, threatening to split the hull on launch day under thirty marks of guild fines.
* **Investigation Paths:**
  1. **Read the Tracks:** Trace heavy timber gouges and roller ruts south through pitch smoke to the boiler shed (`[WIS DC 11]`).
  2. **Audit the Ledgers:** Check Bay Four's delivery manifest against clerk notes and cart slips chalked on the pillar (`[INT DC 11]`).
  3. **Interrogate Sawyers:** Appeal to craftsman honor (`[CHA DC 12]`), physical intimidation (`[STR DC 12]`), `[Spell: Charm Person]`, or a 2-silver bribe (`20 copper`).
  4. **Scout River-Gate:** Ghost past barge sentries (`[DEX DC 11]`) or create a diversion with `[Cantrip: Minor Illusion]`.
* **Resolution Archetypes:**
  1. **Branch A (Lawful Truth):** March Elric to Master Hendryk with the spruce splinter and forged waybill. Hendryk audits the office, arrests Elric, releases real heartwood to Brant, grants Slipway Two a 3-day extension, and pays +4 Silver Marks. Brant gifts his custom Iron-Heel Boots. (+1 Gilded Scales Rep, Brant Favor).
  2. **Branch B (The Shakedown):** Extort hush money from Clerk Elric. Direct bribe: 4 silver (alerted) or 8 silver (unalerted). High-pressure extortion: 14 silver (`[CHA DC 13/10]`). The green spruce is patched with scrap iron, and Brant's favor is permanently lost.
  3. **Branch C (Silent Leverage):** Force Elric to roll the highland oak to Slipway Two while retaining Hendryk's proof-stamped waybill. Brant gifts his Iron-Heel Boots (+Brant Favor). Turning in the waybill to Captain Vane at headquarters grants +1 Vane Regard and +5 Silver Marks intelligence bounty.
```
