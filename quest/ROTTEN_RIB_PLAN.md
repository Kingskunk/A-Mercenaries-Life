# Quest Plan: The Rotten Rib (The Iron Wharves)

A grounded, low-stakes narrative quest for **The Iron Wharves** in Port Valen. Designed to flesh out the maritime labor, craftsman pride, and quiet corruption of the Gilded Scales shipyards without causing major faction shifts.

---

## 1. Overview, Cast & Trigger Architecture

### 1.1 Setting & Cast

* **District:** Harbor Quayside & Iron Wharves
* **Primary Location:** Slipway Two (drydock framing cradle), the Sawpits, and the Covered Timber Sheds.
* **Themes:** Craftsman integrity vs. commercial deadlines, the weight of unseasoned wood, dockside graft, working-class vulnerability.
* **Cast:**
  * **The Master Shipwright (Brant):** Broad, stooped shoulders, a beard greyed like driftwood, forearms crosshatched with old wood-knife scars. Spoke little; measured everything.
  * **The Yard Timber Clerk (Elric):** Narrow-jawed, ink-stained cuffs, smells of stale pipe tobacco and wet wool. Hides behind guild stamps and bills of lading.
  * **The Yard Factor (Master Hendryk):** Senior yard factor for the Gilded Scales. Wears fine beaver-fur trim over practical oilskin. Cares only for the launch calendar and tidal slipway rent.

### 1.2 Activation & Trigger Conditions

* **Trigger Location:** Harbor Quayside (`port_valen.txt`), navigating to `pv_poi_drydock` (*"Step down to the shipwrights' ways at the Iron Wharves"*).
* **Environmental & Time Gates:**
  * **Time of Day:** Active daytime hours only (`Morning`, `Midday`, `Afternoon`). At `Dusk`, `Night`, or `Pre-Dawn`, the yard gates are chained, forge hearths are banked, and only lone watchmen patrol.
  * **Weather:** Any weather except `Storm` or `Blizzard` (severe gales shut down outdoor slipway labor and crane hoisting).
* **The Organic Inciting Event (Beat 1):**
  * As the player walks the slipway, they observe an auditory and visual tell: Brant testing frames with his mallet (*Clink* on rib 3, ringing oak; *Thud* on rib 4, dead soggy spruce).
* **Player-Initiated Choice Architecture (No Video Game Pop-Up):**
  * `# Step onto the scaffold planking to see what the shipwright found in the hull.` -> Triggers Beat 2 (Approaching Brant).
  * `# Watch from the timber skids, observing the sawpits and clerk's office instead.` -> Skips direct confrontation, gives an early hint toward Beat 3 (Investigating the Sheds).
  * `# Mind your own business and return up to the cargo quayside.` -> Leaves the scene; quest remains unstarted with no penalty or lost opportunity.

### 1.3 Ambient Rumor Pre-Seed & Lifecycle

* **Location:** *The Cleaved Keel* taproom (`pv_poi_tavern_rumors` in `port_valen.txt`).
* **Timeless Rewording (Zero Ungated Days / Zero Premature Clocks):**
  > Over by the rear hearth, two sawyers are talking over sour beer: the Gilded Scales are riding the shipwrights hard down on Slipway Two. The guild factor has Master Brant under a brutal contract fine for every tide the slipway sits occupied, and the apprentices whisper that the timber cleared through the gates has been weeping green sap instead of ringing true.
* **When Does the Rumor Appear?**
  * Strictly gated behind `*if (rotten_rib_stage = "unstarted")`.
* **When Does the Rumor Stop Appearing?**
  * **Suppressed on Quest Start:** As soon as the player visits Slipway Two and triggers Beat 2 (`rotten_rib_stage != "unstarted"`), this rumor is permanently removed from the tavern rotation. The player already knows the truth firsthand; hearing vague dockside whispers would be immersion-breaking and redundant.
  * **Replaced on Resolution:** Once the quest is resolved (`rotten_rib_stage = "resolved"`), it cycles into an outcome-reactive world rumor:
    * *Branch A (Exposed Elric):* *"The guild lockup took Clerk Elric this morning. Caught skimming naval oak for black-market refits. Master Hendryk has every ledger in the timber office under audit."*
    * *Branch B (Shakedown):* *"They say Brant had to bolt scrap iron across green spruce on Slipway Two just to clear the slip. If that merchant tub hits open swell, the sea'll crack her open like a walnut."*
    * *Branch C (Company Divert):* *"The Carrion Company brought heavy draught wagons down to the timber gates today and hauled out three massive beams of highland oak. The clerk signed the vouchers with his own hand, white as a sheet."*

---

## 2. Complete Narrative Prose Drafts

### Beat 1: The Environmental Discovery (Slipway Two)

The air down on the shipwrights' ways is heavier than on the upper quays—thick with coal smoke from the forge hearths, boiling pine tar, and the sour green smell of steamed timber. Across the yard, caulking irons ring rhythmically against the planking of two cargo vessels on Slipways One and Three, and sawpit crews shout over the rasp of heavy frame-saws.

On Slipway Two, the ribs of a seventy-foot merchant ship rise out of the granite cradle like the picked bones of a sea monster. Down in the basin mud beneath the keel, two young apprentices sweep cedar shavings into wicker baskets and stack split oak offcuts. Up in the ribs, working alone in the half-light beneath the deck beams where the shipyard noise is muffled by the curved timbers, an old man in a tar-stained leather apron is moving along the frames. He carries a short-handled iron mallet. 

*Clink.* The mallet strikes the third rib—a clear, ringing note that sings in the oak.

He steps forward two paces. 

*Thud.* 

The mallet strikes the fourth rib. The sound is dull, wet, and dead, like hitting a sack of turnips.

The old man stops. He doesn't strike it again. He sets the mallet down on a cross-beam, draws a blunt thumb across the black pitch wash painted over the wood, and brings the thumb to his nose. His shoulders hitch, and he stands there in the ribbed shadow with his forehead pressed against the timber, looking like a man who has just found rot in his own house.

*choice
  # Step onto the scaffold planking to see what the shipwright found in the hull.
    *goto beat_2_shipwright
  # Watch from the timber skids, observing the sawpits and clerk's office instead.
    *goto beat_3_investigation
  # Mind your own business and return up to the cargo quayside.
    *goto pv_poi_quays_menu

---

### Beat 2: Approaching the Shipwright

When your boots hit the scaffold planking, the old man doesn't turn around. He keeps his hand flat against the fourth frame, feeling the grain.

"Watch the grease on the timber slides," he grunts, his voice gravelly from forty years of sawdust and estuary damp. "Slip on that ledge and you'll slide thirty feet into the basin mud, and nobody's fishing you out till the tide turns."

He wipes his fingers on his apron, leaving a dark smear of pitch, and finally turns to face you. His eyes are watery grey, framed by deep crow's-feet etched with charcoal dust. He takes you in with tired, guarded eyes—no leather work-apron, no caulking irons in your hands, no fresh sawdust on your sleeves.

"You don't have sawdust on your sleeves, and you don't look like one of Hendryk's clerks," he says, his voice flat with craftsman suspicion. "This is an active cradle, stranger, and lines snap without warning down here. What are you doing on my staging?"

*choice
  # "Sounded like you struck bad wood with that mallet."
    *goto beat_2_examine_rib
  # "Looking for work along the wharves, or someone who knows where coin moves."
    *goto beat_2_mercenary_work
  # "My mistake. I'll leave you to your timbers."
    *goto beat_2_leave

*label beat_2_examine_rib
Brant's bushy grey eyebrows twitch. He looks at you for a long beat, measuring the lack of mock in your tone.

"You've got an ear on you, then," he murmurs. 

*label beat_2_reveal_rot
He taps the fourth rib with his knuckles. 

"Listen to that," he says.

He taps the third rib again—the clean, iron ring. Then the fourth—the flat, sodden thud.

"Third rib is highland heartwood," he says quietly. "Felled in the deep winter three years back, air-cured on river skids, hard enough to turn an iron arrowhead. Fourth rib... smells like fresh river-willow and summer sap. Green spruce. Not cured two months."

He scratches at the dark coating with a calloused thumbnail. Beneath the tarry stain, the wood is pale and wet, weeping tiny beads of sticky sap.

"Painted over with black pitch wash to give it the heartwood color," he murmurs. "Stamped with the Gilded Scales' inspection mark right where the rib joins the keel. Once this hull takes twenty tons of casked tallow and salt cod into the open bay, the sea swell will twist her. Green wood doesn't flex—it splits. The caulking will pop like stitching on an old boot, and she'll open up from the keel up in four fathoms of water."

He looks toward the yard gates, where a clerk with a ledger is arguing with a team of draymen.

"Thirty men on her crew," Brant says. "And the launch is set for [b]Tideday[/b]. Hendryk pays ten silver marks a day for every tide Slipway Two sits occupied past the contract date. If I pull these frames, I halt the work. If I halt the work, the guild docks my bond, fires my apprentices, and leaves me with forty years of debt I can't pay. If I don't pull them... thirty men drink estuary water before harvest."

*choice
  # "Who stamped the inspection mark? Where was the load delivered?"
    *goto beat_2_inquire_trail
  # "I can look into where your timber went. What's it worth to you if I find it?"
    *goto beat_2_bargain_reward
  # "Take a piece of this spruce straight to Master Hendryk. Force the factor to look at it."
    *goto beat_2_suggest_factor
  # "Thirty drowned sailors is a heavy weight, but it's not my fight. Good luck with the tide."
    *goto beat_2_decline

*label beat_2_inquire_trail
Brant points a calloused thumb at the faint red wax impression stamped into the wood near the keel line.

"Elric's office cleared it at dawn," he grunts. "The manifest said three seventy-foot beams of cured highland oak went onto storage rack number four behind the sawpits. If real heartwood was delivered, it was there two hours ago. Go look at the rack if you have a mind to."
*page_break Head behind the drydocks toward the timber sheds…
*goto beat_3_investigation

*label beat_2_bargain_reward
Brant gives a tired, dry chuckle, wiping his pitch-blackened hand on his apron. He doesn't resent the question—mercenaries don't work for prayers.

"I don't have guild coin—Hendryk has my bond in an iron vice," he says plainly. "But I've got forty years of craftsman credit, good tools, and an ash-wood whetstone that'll put a razor bite on any steel you carry. If you find my heartwood before the sun touches the seawall, you'll have a master shipwright in your debt."

He nods toward the timber sheds. "The delivery was signed for rack four behind the sawpits. That's where you start."
*page_break Head toward the storage racks…
*goto beat_3_investigation

*label beat_2_suggest_factor
Brant shakes his head grimly, his mouth setting into a hard line.

"Hendryk doesn't listen to complaints without paper proof," he says. "If I walk into the front office with nothing but a wet splinter, Elric will pull out his signed delivery sheet, swear I ruined the wood myself, and Hendryk will dock my bond on the spot. In this yard, paper beats wood every time. If we want the factor to listen, we need to find where the real timber went."

He looks back toward the sheds. "Check rack four behind the sawpits. That's where the paper says my heartwood was stacked."
*page_break Head toward the sawpits…
*goto beat_3_investigation

*label beat_2_decline
Brant doesn't curse or beg. He simply turns his back on you, reaches into his chest for an iron brace, and begins futilely bolting scrap metal across the rotten spruce, trying to reinforce wood that cannot be saved.
*page_break Back to the quayside…
*goto pv_poi_quays_menu

*label beat_2_mercenary_work
Brant snorts, shaking his head. "Coin? Nobody makes coin here but the factor and the river brokers. Unless you can haul seventy-foot beams or swing an adze for ten hours without dropping it, there's no day-wages on these ways."

He pauses, his hand resting on the fourth rib, his jaw working as he glares at the damp wood.

"Unless you're the sort of sellsword who knows how to track down thieves. Look here." He strikes the frame with his knuckles—a dull, wet thud. "Listen to that..."
*goto beat_2_reveal_rot

*label beat_2_leave
You give the old man a short nod, turn on your heel, and make your way back down the timber slides to the quayside lane. Brant doesn't watch you go; he just stands there in the ribbed shadow with his forehead pressed against the timber.
*page_break Back to the quayside…
*goto pv_poi_quays_menu

---

### Beat 3: Investigating the Timber Sheds & Sawpits

The timber yard sits behind the drydocks, under a cavernous open-sided shed thatched with woven reed mats. Immense logs of highland oak and mountain spruce rest on greased skids, waiting for the sawpit teams.

In the center of the lane, two sawyers stand in a seven-foot pit, rhythmically pulling a two-man frame saw through an eight-foot oak trunk. Sawdust showers down like yellow snow over their bare, sweating shoulders with every rasping stroke.

Around the corner, by the numbered storage racks:

* **The Delivery Manifest:** Pinned to an oak pillar under an iron spike is the week's delivery sheet, sealed with the red wax of the Gilded Scales Timber Office. It records: *Three hewn timber beams, prime highland heartwood, seventy feet, cleared for Slipway Two.*
* **The Empty Bay:** Rack number four—marked for Slipway Two—is completely empty.
* **The Tell:** A trail of freshly planed wood-shavings and crushed pine needles leads away from the empty rack. But it doesn't lead down the slipway toward Brant's ship. It leads toward the river-gate at the western wall, where private river barges load scrap iron and salvaged rope under tarpaulins.
* **The Stash:** Behind the boiler shed, tucked beneath an old storm-tarp and stacks of salted cod-crates, sit three massive beams of genuine, silver-grey cured highland heartwood. They are stamped with Brant's yard number, freshly painted over with white chalk: *Barge 'Osprey' — Dredge-End Cut.*

Someone didn't just make a mistake. Someone skimmed sixty silver marks' worth of naval-grade heartwood to sell to a private refit down in the slums, and substituted unseasoned ditch-wood from an upriver float-raft to cover the theft.

---

### Beat 4: Confronting the Timber Clerk (Elric)

The clerk sits in a cramped wooden office built on stilts above the sawpits. The room smells of dry ink, cold mutton grease, and pipe smoke. Behind him, tall pigeonholes hold rolled paper orders.

When you step through the doorframe, the timber floorboards creak under your boots. 

Elric looks up from his desk, quill poised over an open ledger. He is young, sharp-featured, with fingers stained purple around the nails from ink. His eyes immediately flick to your belt, then back to your face.

"All yard labor requisitions go through Master Hendryk's front office," he says smoothly, dipping his quill into the inkpot. "If you're looking for day-haul wages, the line forms at the outer gate on dawn bell. We don't hire off the street at this hour."

You drop a chunk of the pale, sap-wet wood onto his ledger, right over his fresh ink. A sticky bead of pine resin smears across the column.

The quill stops. Elric stares at the wet splinter for three long seconds. The air in the little office goes dead quiet, save for the rhythmic *rasp-rasp-rasp* of the pit-saw working below the floorboards.

"What is that?" he asks, his voice dropping an octave, losing its brisk clerk's cadence.

"That's the fourth rib of the ship on Slipway Two," you say. "Fresh spruce. Green as spring grass. Painted in the dark with pitch."

Elric doesn't jump up or shout. He slowly lays the quill down in the pewter groove of the inkstand. He leans back in his stool, folding his ink-stained hands over his stomach.

"Wood cures differently depending on the valley it was felled in," he says, perfectly flat. "The timber was surveyed, weighed, and stamped by the harbor inspector. The papers are filed with the Gilded Scales."

"The papers say three heavy beams of highland heartwood went to Slipway Two," you answer. "The heartwood is sitting behind the boiler shed under an oilcloth, marked for the *Osprey* in Dredge-End. What's on the slipway wouldn't hold a pig-trough together in a chop."

Elric's jaw tightens. A nerve jumps beneath his left eye. He looks past you, out the little square window that overlooks the slipways.

"You don't know this quarter," he says, very low. "You think you've caught a thief. You think there's an honest piece of wood in this whole basin. The factor knows the ship is insured through the guild's lenders. If she sinks in deep water, the guild collects the bond and the builder's deposit. Nobody asks about the timber once the water's over the masthead."

He reaches into his leather vest pocket, pulls out a small cloth purse, and sets it on the desk. It clinks with the heavy, muffled ring of silver.

"Eight silver marks," Elric says. "That's three months of what a soldier makes pulling watch on the seawall. Walk back out the gate, forget the sound of Brant's mallet, and let the ship launch on Tideday."

---

## 3. The Three Resolution Branches (The Prose Scenarios)

### Branch A: The Guild Truth (Exposing the Fraud)

* **The Mercenary Motive:** Honesty backed by leverage. Protecting the craftsman and holding the corrupt clerk to guild law.

You look at the silver on the desk, then at the grease-smeared paper.

"Put the coin away," you say. "We're going to see Master Hendryk."

Elric's face drains of blood. He reaches for the desk drawer, but your hand comes down over his wrist like an iron clamp, pressing his sleeve flat to the wood until the wood groans. You pick up the forged delivery slip with your free hand.

When you walk Elric down the central slipway into the factor's office, the yard workers stop their mauls. Word moves through a shipyard like grease on water. 

Master Hendryk sits beneath a bronze balance-scale, sipping watered wine from a pewter cup. When you drop the sap-wet wood and the altered slip onto his clean cedar desk, he doesn't shout. He picks up the splinter, scrapes it with a silver fruit knife, and looks at Elric with the cold, bored disgust of a man finding a hair in his soup.

"You used my proof-stamp," Hendryk says softly. "I don't care that you sold the timber, Elric. I care that you used my personal stamp on a hull insured under the provincial charter. If the city inspectors had seen this, the guild would have seized my warehouse."

He waves two heavy-shouldered yard guards forward. They take Elric by the elbows and drag him out toward the customs lockup without a word.

Hendryk turns his pale eyes to you.

"Brant gets the cured heartwood moved from the boiler shed within the hour," Hendryk says, counting four silver marks from an iron box onto the desk. "And Slipway Two gets three days' grace on the tide clock, signed under my seal. A finder's fee for your trouble, mercenary. And my advice: don't linger by the timber gates after dark. Elric has brothers down in Dredge-End."

* **Consequences:**
  * +4 Silver Marks (official guild payout).
  * `+1 gilded_scales_rep`.
  * Slipway Two is saved; Brant replaces the rotten frames with real oak.
  * Brant gives you a sturdy, hand-carved ash-wood whetstone: *"It won't make you rich, soldier. But it'll keep an edge on your steel when the rain starts."*

---

### Branch B: The Shakedown (Taking the Cut)

* **The Mercenary Motive:** Pragmatic greed. A mercenary didn't enlist to police someone else's shipyards.

You pick up the pouch of eight silver marks from the desk. You weigh it in your palm, feeling the satisfying heft of the coins.

"Eight silver is a good offer," you say, leaning in close enough that Elric can smell the dried mud and iron on your brigandine. "For a man who doesn't know what cured heartwood sells for down in Dredge-End."

Elric swallows hard. "That's all I have on me—"

"You're moving three seventy-foot oak beams to a private yard in the cut," you cut him off, voice dropping to a harsh rasp. "That's thirty silver marks on the low side, cash in hand before the barge clears the harbor chain. You want me to forget the boiler shed? Fourteen silver. Right now. Or I take this splinter to Hendryk and let the debtor hulks teach you how to saw spruce."

Elric stares at you with pure, undiluted hatred. For a second, his knuckles whiten on the armrests of his stool. Then he reaches beneath the floorboards behind his desk and drags out a heavy iron lockbox. He counts six more heavy silver marks into your hand, his fingers trembling with rage.

"Take it," he hisses. "And get out of my yard."

You pocket the fourteen silver marks and step back into the shipyard lane. 

Down on Slipway Two, Brant is still standing in the hollow curve of the ship's ribs. He watches you walk past the slipway toward the main gates. He looks at your face, sees the heavy line of your purse, and understands immediately.

He doesn't curse you. He doesn't throw his mallet. He simply turns his back on you, takes an iron brace from his chest, and begins bolting scrap iron across the rotten green spruce, trying to reinforce wood that cannot be saved.

* **Consequences:**
  * +14 Silver Marks (dirty extortion money).
  * No guild reputation change.
  * The ship launches on Tideday with rotten ribs braced by scrap iron; its fate is sealed on the open sea.
  * Brant refuses to speak to you ever again; the craftsmen of Slipway Two look away in cold silence whenever you pass.

---

### Branch C: The Company Divert (Mercenary Logistics)

* **The Mercenary Motive:** Prioritizing your company. The Carrion needs cured oak more than the Gilded Scales needs another merchant tub.

You look at Elric, then down through the window at the timber skids.

"Keep your eight silver," you tell the clerk.

Elric blinks, confused. "What do you want, then?"

"The three highland heartwood beams behind the boiler shed," you say. "They're not going to Dredge-End. They're going up the cliff road to the Carrion Company compound before sundown."

"Are you insane?" Elric whispers. "Those beams weigh three tons! You can't just walk out with seventy-foot oak beams—"

"The Carrion has four heavy draught wagons parked outside the upper gate," you reply calmly. "And forty veterans with halberds who know how to hitch a team. You're going to write a requisition order under your official stamp: *Timber condemned for worm-rot, released to the garrison for palisade and wheel repairs.* You sign it. We haul it. You tell Hendryk the rot was burned in the yard pits."

Elric stares at you, realizing the brutal elegance of the shakedown: the paper will show the wood was ruined, so no audit will ever trace the silver.

"And Brant's ship?" Elric asks.

"Brant gets the unseasoned spruce pulled down," you say. "And you're going to assign him three spare beams from the Gilded Scales' reserve pile in shed three, marked as warranty replacements. You eat that loss out of your next three kickbacks."

Two hours later, a Carrion Company dray wagon groans up the winding stone causeway toward the fortified company compound, loaded with three massive timbers of highland heartwood. Quartermaster Orlov rubs his calloused hands over the silver grain with open delight—wagon axles and ballista frames that won't warp in the winter mud.

Down in the yards, Brant stands by his slipway as a yard crane swings real, cured highland oak into the cradle of his ship. He watches your squad secure the wagon chains, meets your eyes across the slipway, and raises his iron mallet in a single, somber salute.

* **Consequences:**
  * `+1 vane_standing` (Captain Vane and Quartermaster Orlov commend your initiative in securing vital winter lumber).
  * Brant is deeply grateful; he custom-reinforces your shield with boiled leather and copper banding or fits a balanced oak grip to your weapon (`+1 Parry trait` or personal weapon buff).
  * Elric is neutralized—terrified of both you and the Carrion garrison.
  * The ship launches strong and sea-worthy on Tideday.
