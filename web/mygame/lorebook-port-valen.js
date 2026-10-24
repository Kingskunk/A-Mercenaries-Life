/*
 * LOREBOOK: PORT VALEN -- people, places and customs of the Free City.
 *
 * Same entry format as lorebook-data.js (see the header there). This file only adds to
 * window.LOREBOOK, so it must be loaded after lorebook-data.js. Each entry names the
 * variable that unlocks it; those variables are set at the moment the player learns the
 * name or reaches the place (see "LOREBOOK UNLOCK TRIGGERS" in startup.txt).
 *
 * Text rules: an entry only says what the player has been told or shown by the time it
 * unlocks. Later developments go in a function body gated on the quest variable that
 * records them, never in the base text. Link phrases are full proper names only.
 */
(function () {
  "use strict";

  var L = window.LOREBOOK;
  if (!L || !L.entries) return;

  function truthy(v) { return v === true || v === "true"; }

  Array.prototype.push.apply(L.entries, [

    /* ------------------------------------------------------------- PEOPLE: QUAYSIDE */

    {
      id: "voss", category: "people", title: "Dockmaster Harl Voss",
      sub: "Harbor registry and customs",
      role: "Dockmaster, Harbor Registry (Cargo Quay)",
      link: ["Dockmaster Harl Voss", "Harl Voss", "Dockmaster Voss", "Voss"],
      tags: ["Quayside", "Law"], aliases: ["Voss", "Harl", "dockmaster", "customs", "harbor registry"],
      unlock: "pv_quays_seen",
      body: [
        "A hawk-nosed man with ink-stained thumbs who stands on an upturned cargo crate with a brass seal pinned to his salt-crusted oilskin coat, calling hull numbers down to a runner. He keeps the harbor registry: every hull is logged, and manifests are sealed with red wax before cargo moves.",
        "He is a customs official, not a Watch officer. His lamp burns in the customs tower window long after the quay shuts, while he audits the next day's tide manifests."
      ],
      see: ["cargo_quay", "weigh_house", "port_watch", "dell"]
    },
    {
      id: "maret", category: "people", title: "Maret",
      sub: "Keeper of The Cleaved Keel",
      role: "Barkeep, The Cleaved Keel",
      link: ["Maret"],
      tags: ["Quayside"], aliases: ["barkeep", "innkeeper", "taphouse"],
      unlock: "pv_tavern_seen",
      body: [
        "A barrel-chested man with a salt-grey beard and a leather-strapped stump below the left knee. He spent twenty winters hauling logs on the shipwright slips before a snapped crane cable took the lower leg.",
        "He keeps an orderly house: keep the peace and your coin on the wood, and you are as welcome as anyone."
      ],
      see: ["cleaved_keel", "cutter"]
    },
    {
      id: "cutter", category: "people", title: "Cutter",
      sub: "Table-master of the Keel's dice game",
      role: "Runs the porter-crew dice game, The Cleaved Keel",
      tags: ["Quayside"], aliases: ["dice", "gambling", "table-master"],
      unlock: "pv_dice_met",
      body: [
        "A scarred longshoreman with a missing finger, grease-stained cuffs, and a screeching laugh like gulls fighting over offal. He runs the game at the long trestle by the hearth with a cut-down drinking horn banded in brass, and a chalk circle for the throw.",
        "He insists his coin is as good as any porter's."
      ],
      see: ["cleaved_keel", "maret"]
    },
    {
      id: "dell", category: "people", title: "Dell",
      sub: "Gang-boss of crane three",
      role: "Gang-boss, crane three (Cargo Quay)",
      link: ["Dell"],
      tags: ["Quayside"], aliases: ["gang-boss", "crane three", "day labor", "stevedore"],
      // The game hides his name behind these same two conditions in the crane menu text, so the
      // entry follows the same rule.
      unlock: function (s) { return truthy(s.crane_grievance_known) || Number(s.crane_shifts_completed) > 0; },
      body: [
        "A heavyset man in a salt-stiffened canvas coat who keeps a wax-slated manifest board under one arm like a shield. He runs the day crew at crane three, and the dockmaster sends anyone looking for hauling work to him.",
        "He works to the factor's contract, not the city's: a hold cleared late after the evening bell docks his own pay."
      ],
      see: ["cargo_quay", "voss", "gilded_scales"]
    },

    /* -------------------------------------------------------- PEOPLE: IRON WHARVES */

    {
      id: "brant", category: "people", title: "Master Brant",
      sub: "Master shipwright, Slipway Two",
      role: "Master builder, Iron Wharves",
      link: ["Master Brant", "Brant"],
      tags: ["Iron Wharves"], aliases: ["shipwright", "slipway two", "master builder"],
      unlock: "met_brant",
      body: function (s) {
        var out = [
          "A master builder at the Iron Wharves, answerable to the Gilded Scales' factor, who is fined for every tide a cradle sits occupied. His apprentices call him Master Brant, and they fear those fines."
        ];
        if (truthy(s.brant_saw_him)) {
          out.push("He is an old shipwright in a tar-stained leather apron who works Slipway Two, moving along the ribs of a seventy-foot merchant hull with a short-handled iron mallet and listening to each note.");
        }
        if (truthy(s.has_rotten_rib_splinter)) {
          out.push("Under his mallet the third rib rings clean iron and the fourth gives back a flat, sodden thud. The oak in Bay Four's delivery was green, and he wants somebody to know it before the ship is launched on it.");
        }
        if (s.rotten_rib_resolution === "failed") {
          out.push("The ship went down the ways with a green rib bolted over. He stood on the staging with the mallet hanging from his hand and did not strike the fourth rib again.");
        } else if (s.rotten_rib_resolution === "blackmail") {
          out.push("The three highland oak beams went onto his slip and into the cradle. He gave you a pair of pitch-sealed bull-hide boots with iron heel-plates and will not ask what you said to the clerk. His slip is open to you for honest counsel, word along the wharves, or a skipper who does not ask the guild's leave.");
        }
        return out;
      },
      see: ["iron_wharves", "hendryk", "elric"]
    },
    {
      id: "hendryk", category: "people", title: "Master Hendryk",
      sub: "The Scales' factor at the Iron Wharves",
      role: "Gilded Scales factor, Iron Wharves",
      link: ["Master Hendryk", "Hendryk"],
      tags: ["Iron Wharves", "Gilded Scales"], aliases: ["factor", "guild factor"],
      unlock: "met_hendryk",
      body: function (s) {
        var out = [
          "The Gilded Scales' factor at the Iron Wharves. The yard works to his schedule, and the apprentices fear their meal-tokens will be docked if the ways stand idle."
        ];
        if (truthy(s.met_hendryk_office)) {
          out.push("His office is a stone counting-house at the foot of the central slipway, its door hung with a bronze balance-scale, with a gate-runner in river-serpent colors on the step.");
        }
        return out;
      },
      see: ["iron_wharves", "gilded_scales", "brant"]
    },
    {
      id: "elric", category: "people", title: "Clerk Elric",
      sub: "Yard clerk, Iron Wharves",
      role: "Clerk of the yard office, Iron Wharves",
      link: ["Clerk Elric", "Elric"],
      tags: ["Iron Wharves"], aliases: ["clerk", "yard office"],
      unlock: "met_elric",
      body: function (s) {
        var out = [
          "The clerk who runs the yard office up on stilts behind the sawpits. Every load that passes through the yard gets his initials. Brant's warning about the yard: whatever sits still too long grows legs."
        ];
        if (s.rotten_rib_resolution === "failed") {
          out.push("A waybill carrying Master Hendryk's proof-stamp, which condemned the naval oak as worm-rotten, " + (truthy(s.ysolde_timber_turned_in) ? "went to Ysolde, its red seal whole." : "is in your pouch with its red seal whole.") + " The oak is gone.");
        } else if (s.rotten_rib_resolution === "blackmail") {
          out.push("You turned down his purse. The three oak beams went back to Brant's slip, and the waybill that carries Master Hendryk's proof-stamp " + (truthy(s.ysolde_timber_turned_in) ? "went to Ysolde. He knows it exists and does not know whose hands it is in." : "is in your hands. He knows it exists and does not know whose hands it is in."));
        }
        return out;
      },
      see: ["brant", "hendryk", "iron_wharves"]
    },

    /* --------------------------------------------------- PEOPLE: FISHMONGERS' SLIP */

    {
      id: "wenna", category: "people", title: "Wenna Rusk",
      sub: "Boat-widow of the Patience",
      role: "Fisherwoman, boat Patience",
      link: ["Wenna Rusk", "Wenna"],
      tags: ["Fishmongers' Slip"], aliases: ["widow", "Patience", "fishwife"],
      unlock: "fish_met_wenna",
      body: function (s) {
        var out = [
          "A fisherwoman who works the Patience, her late husband's boat, with a boy of about fifteen to help her. Her husband went over the side off the northern banks last spring, and she sells what the boat brings in at the Slip's dawn auction."
        ];
        if (s.fish_resolution === "lawful") {
          out.push("With three buyers struck off the block, her catch now sells for a fair price.");
        } else if (s.fish_resolution === "pragmatic") {
          out.push("She has stopped speaking to you. She watched you take the ring's coin.");
        } else if (s.fish_resolution === "strategic") {
          out.push("She will sell you a lot before she sells it to anyone else.");
        } else if (s.fish_resolution === "failed") {
          out.push("Her catch still sells into the ring at the ring's price.");
        }
        return out;
      },
      see: ["fishmongers_slip", "auction_block", "thale"]
    },
    {
      id: "thale", category: "people", title: "Thale",
      sub: "The lead buyer at the Slip",
      role: "Smokehouse owner and buyer, Fishmongers' Slip",
      link: ["Thale"],
      tags: ["Fishmongers' Slip"], aliases: ["buyer", "ring", "good gloves", "smokehouse"],
      unlock: "fish_met_wenna",
      body: function (s) {
        var out = [
          "A buyer in good leather gloves who owns two of the Slip's smokehouses. The other two buyers eat at his table, and when he lifts two fingers to the brim of his cap, nobody bids against him.",
          "There is no law against nobody wanting a widow's fish, and the slip-warden says so."
        ];
        if (truthy(s.pq_seen_vantry)) {
          out.push("His smokehouses cure fish for [[pq_house_vantry|House Vantry]]'s contract, at the price the contract sets. Fish bought cheap at the block is how he keeps the price.");
        }
        return out;
      },
      see: ["wenna", "auction_block", "fishmongers_slip", "pq_house_vantry"]
    },

    /* --------------------------------------------------------- PEOPLE: MIDDLE WARD */

    {
      id: "kess", category: "people", title: "Mistress Kess",
      sub: "Landlady of Terrace Lodgings",
      role: "Landlady, Terrace Lodgings (Locksmiths' Close)",
      link: ["Mistress Kess"],
      tags: ["Middle Ward"], aliases: ["Kess", "landlady", "lodgings", "rent"],
      unlock: "mw_lodgings_seen",
      body: [
        "A crisp, no-nonsense landlady who keeps clean straw, a dry roof, quiet stairs, and Master Vael's deadbolts on every door.",
        "No blood in her hallway, no thieves under her rafters, and no Watchmen asking questions, so long as the coin hits the tin on time."
      ],
      see: ["vael", "middle_ward"]
    },
    {
      id: "marda", category: "people", title: "Mother Marda",
      sub: "Keeper of the communal oven",
      role: "Baker, Mother Marda's Communal Oven (Conduit Square)",
      link: ["Mother Marda"],
      tags: ["Middle Ward"], aliases: ["Marda", "baker", "bakehouse", "oven", "pasties"],
      unlock: "mw_bakehouse_seen",
      body: [
        "Keeps the communal oven on Conduit Square, opposite the fountain: caraway loaves, rye, and hot pasties for the wagon drivers before they face the climb to Civic Heights.",
        "She hears what the whole ward is doing, from the washerwomen at the conduit to the parish sexton and the Watch's rounds, and she passes it on to anyone who asks."
      ],
      see: ["middle_ward"]
    },
    {
      id: "tomas_saye", category: "people", title: "Tomas Saye",
      sub: "Water clerk and surveyor, Second Terrace",
      role: "City water clerk and field surveyor, Middle Ward",
      link: ["Tomas Saye", "Tomas"],
      tags: ["Middle Ward", "Law"], aliases: ["Tomas", "Saye", "water-lines clerk", "water clerk", "conduit clerk", "surveyor"],
      unlock: "met_tomas_saye",
      body: [
        "A city water clerk and field surveyor in a blue coat with a brass badge, who keeps damp plans, a grease pencil, and shutoff keys on his person. Tomas Saye follows the Second Terrace pipes in person and treats a line on the public roll as a promise the city has to defend.",
        "He is not a Watchman and cannot settle a landlord dispute by decree. He can close a valve, call an engineering crew to shore and dig, or enter a temporary service on the maintenance roll when the evidence will stand up in daylight."
      ],
      see: ["middle_ward", "marda", "merrin"]
    },
    {
      id: "nadi_venn", category: "people", title: "Nadi Venn",
      sub: "Tenant of the court off Locksmiths' Close",
      role: "Tenant, Middle Ward",
      link: ["Nadi Venn", "Nadi"],
      tags: ["Middle Ward"], aliases: ["Nadi", "Venn", "tenement yard", "tenement court", "court tenant", "yard tenant"],
      unlock: "met_nadi_venn",
      body: [
        "A horned tenant from the cramped shared court behind the rented rooms off Locksmiths' Close. Nadi Venn speaks plainly when officials ask a question and keeps a child close when they begin talking about closures.",
        "Forty families draw from the court's one standpipe. The landlord once folded the water charge into the rents, then stopped paying the city and left the old branch to the tenants, who kept it alive with pitch and patchwork."
      ],
      see: ["middle_ward", "tomas_saye"]
    },
    {
      id: "vael", category: "people", title: "Master Vael",
      sub: "Locksmith, Locksmiths' Close",
      role: "Locksmith, Vael & Son",
      link: ["Master Vael"],
      tags: ["Middle Ward"], aliases: ["Vael", "locksmith", "locks", "keys"],
      unlock: "met_vael",
      body: function (s) {
        var out = [
          "A lean, wiry craftsman in a leather apron stiff with oil, with measuring calipers in his breast pocket, who works a needle file inside a lock held up to his ear and tests the mechanism with a sharp flick of the wrist until it answers with a crisp snick. His sign reads: Locks Warranted Against Pick and Wedge.",
          "The shop is Vael and Son, and the Son is long gone. He keeps the name up and works the trade himself, with apprentices on the benches."
        ];
        if (truthy(s.mw_vael_seen)) {
          out.push("The workshop is one long room warm from a charcoal hearth, with sample locks on display boards along one wall: thumb-sized jewelry latches up to iron-banded chest deadbolts. The locks on the boards are samples, not stock.");
        }
        if (truthy(s.mw_vael_sign_talk)) {
          out.push("He sells picks himself, to whoever asks. \"It's not a boast. It's mathematics.\" His customers are owners who have lost a key, clerks shut out of their own strongboxes, and the Watch, twice a year, trying to see if they can slip one of his deadbolts. A pick is just a lever with an attitude, and it doesn't care whose hand is on the grip. No one has picked one of his locks yet.");
        }
        if (truthy(s.mw_vael_customers_talk)) {
          out.push("A locksmith knows a ward by its secrets. The customs wharf takes cash-boxes three at a time because drunken clerks drop their keys into the dock mud. The mint has a standing order for four-tumbler strongroom bolts and pays in unclipped silver so he doesn't ask what goes behind the doors. Kess has a double-turn deadbolt on every room in her house and would rather evict a tenant than replace a latch. Hollis takes his cast-off padlocks at what Hollis calls cost, and sells him brass wire at what he calls outright robbery.");
        }
        if (truthy(s.mw_vael_son_talk)) {
          out.push("The shop is called Vael and Son because there was a son. Serran is cut into the workshop awning in Vael's own lettering, and he has never taken the name down. Serran took the Gilded Scales' contract work north out of Port Valen eight years ago and writes when he can. \"He is not dead, and he is not coming back either. A man who leaves to take other people's money is doing the same work I do, only he lies about the hours.\"");
        }
        if (s.a_key_resolution === "lawful") {
          out.push("The pattern book came back to him unopened. The Watch took the thief and the runner, the compromised doors were re-keyed the same night, and he counted three silver marks onto the counter for you.");
        } else if (s.a_key_resolution === "pragmatic") {
          out.push("The pattern book came back to him, and you carried away a purse of four silver marks. The buyer was left at large, and Vael burned the wax impressions in his brazier knowing a larger matter was left breathing.");
        } else if (s.a_key_resolution === "strategic") {
          out.push("The pattern book came back to him and the wax packet went into his brazier. A notched brass token and a fountain phrase point toward the buyer, and he gave you the details of every lock that needs changing and a promise that his door is open when you pursue it.");
        } else if (s.a_key_resolution === "compromised") {
          out.push(s.a_key_pattern_book === "copied"
            ? "The Watch took the thief, but the pattern book came back to him lighter, with a fistful of pages torn out. He has been taking sample keys down off the wall since: every lock in those pages is a question."
            : "The pattern book is gone. He has been taking sample keys down off the wall since: every lock in it is a question, Kess's first and Hollis's next.");
        }
        return out;
      },
      see: ["kess", "middle_ward", "hollis"]
    },
    {
      id: "ambrose", category: "people", title: "Master Ambrose",
      sub: "Herbalist and physic",
      role: "Herbalist, Ambrose's Still-Room & Physic (Herb-Pounder Close)",
      link: ["Master Ambrose"],
      tags: ["Middle Ward"], aliases: ["Ambrose", "herbalist", "physic", "salve", "still-room"],
      unlock: "mw_herb_seen",
      body: [
        "An elderly herbalist with yellow-stained fingers, who pours pine medicine into small dark glass bottles behind a painted mortar-and-pestle sign. Wicker racks of mountain angelica, wormwood, pine resin and willow bark dry along the close, and two copper stills hiss over charcoal.",
        "The army takes his best willow bark for its field surgeons. What he sells to soldiers is wound salve, bitters, and a warming rub of animal fat with wintergreen, thyme and camphor that they swear by for strained knees and blistered heels."
      ],
      see: ["middle_ward"]
    },
    {
      id: "hollis", category: "people", title: "Master Hollis",
      sub: "General goods, Lantern Lane",
      role: "Shopkeeper, Hollis & Daughters General Goods (Lantern Lane)",
      link: ["Master Hollis"],
      tags: ["Middle Ward", "Trade"], aliases: ["Hollis", "shopkeeper", "general goods", "general store", "Hollis & Daughters"],
      unlock: "mw_store_seen",
      body: function (s) {
        var out = [
          "An old shopkeeper in a canvas apron sewn with a dozen pockets, with close-cropped white hair, a nose broken at least once, and a stub of chalk on a cord at his waist. He keeps the general store on Lantern Lane, and every price in it is chalked on a slate on the wall behind him. Nothing is sold on credit.",
          "The sign says Hollis & Daughters, but only he is ever behind the counter."
        ];
        if (truthy(s.mw_hollis_stock_talk)) {
          out.push("His daughters do the buying. They shop the quay before the fish crews take the good carts and bring back rope and sailcloth the shipyards will not use. The tin comes from the smiths in the ward, and the wool from valley carts on Marketday. He sells it all for what it cost him, plus what it cost to carry.");
        }
        if (truthy(s.mw_hollis_neighbors_talk)) {
          out.push("He knows his neighbors by what they buy. Vael buys brass wire and files, Marda takes flour sacks by the fifty, Ambrose takes corks by the hundred, and Kess buys beeswax and lavender. \"A ward runs on people who buy the same thing every week.\"");
        }
        if (truthy(s.mw_rumor_daughters)) {
          out.push("Rumor from the baths: his daughters have come back from the quay with an empty cart three times this season, as if someone is buying ahead of them.");
        }
        return out;
      },
      see: ["middle_ward", "vael", "marda", "ambrose", "kess"]
    },
    {
      id: "halda", category: "people", title: "Master Halda",
      sub: "Smith, Smiths' Row",
      role: "Smith, Halda's Forge (Smiths' Row)",
      link: ["Master Halda"],
      tags: ["Middle Ward", "Trade"], aliases: ["Halda", "smith", "blacksmith", "armorer", "forge", "blades", "steel"],
      unlock: "mw_forge_seen",
      body: function (s) {
        var out = [
          "A broad-shouldered smith past fifty, with a grey braid pinned up under a leather cap and forearms freckled with old burns. Her sign reads: Steel Bought, Sold, and Mended. She works the largest shed on Smiths' Row, and her racks hold every kind of blade, axe, spear, shield, helmet and mail shirt."
        ];
        if (truthy(s.mw_rumor_steel)) {
          out.push("Rumor from the baths: half a wagon-load of Crag steel is sitting in a shed in Alderford, and no carter will haul it down while the bailiffs work the highway.");
        }
        return out;
      },
      see: ["middle_ward", "iron_bailiffs", "broken_crags", "torvald"]
    },
    {
      id: "merrin", category: "people", title: "Merrin",
      sub: "Keeper of the Conduit Baths",
      role: "Bath-keeper, Conduit Baths (Conduit Wash-House)",
      link: ["Merrin"],
      tags: ["Middle Ward"], aliases: ["bath keeper", "baths", "bathhouse", "wash-house", "soak"],
      unlock: "mw_baths_seen",
      body: function (s) {
        var out = [
          "A tall, thin woman in a spotless grey apron, with hands red and cracked from lye. She keeps the Conduit Baths from a small desk inside the door. Weapons go on the rack by the door until their owners leave."
        ];
        if (truthy(s.mw_merrin_rules_talk)) {
          out.push("Her rules are three: steel on the rack, no quarrels in the steam, and nobody stays past the night bell. In twenty years she has had one fight, and both people left by the drain door without their clothes. People say things in the steam they would not say in the street, and anyone who repeats it outside does not come back.");
        }
        if (truthy(s.mw_merrin_water_talk)) {
          out.push("The boilers are built into the back wall of Mother Marda's ovens, and Merrin pays for the heat in soaks. Marda's bakers bathe free on Hearthday.");
        }
        if (truthy(s.mw_rumor_steam)) {
          out.push("Rumor from the hot room: someone has been repeating what is said in the steam. A regular has stopped coming, and Merrin does not lose a regular for nothing.");
        }
        return out;
      },
      see: ["conduit_baths", "marda", "middle_ward"]
    },
    {
      id: "tolliver", category: "people", title: "Clerk Tolliver",
      sub: "Clerk of the Hiring Hall",
      role: "Clerk, Postings window, the Hiring Hall (the Council Hall)",
      link: ["Clerk Tolliver"],
      tags: ["Civic Heights", "Law"], aliases: ["Tolliver", "clerk", "roll clerk", "postings"],
      unlock: "ch_records_seen",
      body: function (s) {
        var out = [
          "A broad-shouldered clerk in a dark grey coat and a matching cap, with a straight back and the flat, carrying voice of a man who reads other people's terms aloud all day. He keeps the Postings window at the Hiring Hall."
        ];
        if (truthy(s.ch_roll_rules_talk)) {
          out.push("To him the Hall is the law and not a courtesy, and the words carved over the lintel are there so nobody can say they did not see them.");
        }
        if (truthy(s.ch_roll_claims_talk)) {
          out.push("He has a low opinion of people who reach the Claims window without reading the wall first. Most of them, he says, did not.");
        }
        return out;
      },
      see: ["hiring_hall", "civic_heights"]
    },

    /* --------------------------------------------------------- PEOPLE: MARLCROSS */

    {
      id: "sella_morren", category: "people", title: "Sella Morren",
      sub: "Elder of Marlcross",
      role: "Holds the elder's chair, Marlcross Cross Hall",
      link: ["Sella Morren"],
      tags: ["Marlcross"], aliases: ["Sella", "Elder Morren", "elder", "Cross Hall"],
      unlock: "mc_sella_met",
      body: [
        "The lean, weather-browned elder who holds Marlcross's chair at the Cross Hall. She sorts notices and council papers at the table nearest the door, and expects anyone with village business to say it plainly.",
        "Disputes are heard by the people who will live beside the answer; Sella and the council put a choice before the room rather than deciding it alone. The same rule covers road work and the grain-market business that depends on it."
      ],
      see: ["marlcross"]
    },
    {
      id: "tamsin_pike", category: "people", title: "Tamsin Pike",
      sub: "Keeper of the Wayfarer's Rest",
      role: "Innkeeper, The Wayfarer's Rest in Marlcross",
      link: ["Tamsin Pike"],
      tags: ["Marlcross"], aliases: ["Tamsin", "innkeeper", "Wayfarer's Rest", "rooms", "stable yard"],
      unlock: "mc_rest_seen",
      body: [
        "A broad-shouldered innkeeper with a close-cropped head, a pale burn scar across one hand, and a ring of room keys at her belt. She keeps the Wayfarer's Rest with a plain rule: the pot is on when it is on, rooms cost three copper, and the yard has water and hay.",
        "During the annual Milling Fair, she keeps the entry book and sends contestants on to the Grain Green when the judges call the table."
      ],
      see: ["marlcross", "sella_morren"]
    },
    {
      id: "broadbelt_cousins", category: "people", title: "The Broadbelt Cousins",
      sub: "Repeat entrants in Marlcross's Milling Fair",
      role: "Pie-eating contestants, the Milling Fair",
      link: ["Boro Broadbelt", "Tov Broadbelt", "Keda Broadbelt"],
      tags: ["Marlcross"], aliases: ["Boro", "Tov", "Keda", "Broadbelt", "Broadbelts", "pie-eating contest"],
      unlock: function (s) {
        return truthy(s.marlcross_milling_fair_completed) || truthy(s.marlcross_milling_fair_spotted_trick) || truthy(s.marlcross_milling_fair_boro_out);
      },
      body: function (s) {
        var out = [
          "Boro, Tov and Keda Broadbelt are dwarf cousins who return to Marlcross's annual pie-eating contest. When they enter, one usually takes the table while the others keep close to the benches."
        ];
        if (truthy(s.marlcross_milling_fair_spotted_trick) || truthy(s.marlcross_milling_fair_boro_out)) {
          out.push("Their great padded coat hid a cheating scheme: the cousins changed places beneath it while the crowd watched the plates. Sella disqualifies them if the trick is brought to her.");
        }
        return out;
      },
      see: ["marlcross", "sella_morren", "tamsin_pike"]
    },

    /* ---------------------------------------------------------- PEOPLE: BRINEWICK */

    {
      id: "hesta_rill", category: "people", title: "Hesta Rill",
      sub: "Elder of Brinewick",
      role: "Holds the elder's chair, Brinewick Tide House",
      link: ["Hesta Rill"],
      tags: ["Brinewick"], aliases: ["Hesta", "Elder Rill", "elder", "Tide House", "tide gates"],
      unlock: "bw_tide_house_seen",
      body: [
        "The short, square-built elder who keeps Brinewick's chair at the Tide House. Notices, lamp oil and spare rope are arranged within reach of her place at the long table; when the water rises, the house is the village refuge.",
        "Hesta's rule for closing the tide gates is practical: the water, wind and channel marks decide the moment, and whoever is nearest shuts the gate. The village sorts out repairs afterward."
      ],
      see: ["brinewick"]
    },
    {
      id: "nessa_cale", category: "people", title: "Nessa Cale",
      sub: "Keeper of the Reedhouse",
      role: "Innkeeper, the Reedhouse in Brinewick",
      link: ["Nessa Cale"],
      tags: ["Brinewick"], aliases: ["Nessa", "innkeeper", "Reedhouse", "rooms", "stable yard"],
      unlock: "bw_reedhouse_seen",
      body: function (s) {
        var out = [
          "The practical innkeeper of the Reedhouse, with salt-cracked hands and a plain kerchief over her dark hair. She keeps the counter, rooms and high-ground stable yard, and makes no ceremony of prices or necessities."
        ];
        if (s.bw_daughter_quest_stage === "active") {
          out.push("Her daughter Iria's intended marriage troubles her less for the man than for the quieter home she fears it will leave.");
        } else if (truthy(s.bw_daughter_completed)) {
          out.push("Iria's marriage has not driven her away: she still takes breakfast and noon tables at the Reedhouse, which is the answer Nessa needed more than anyone.");
        }
        return out;
      },
      see: ["brinewick", "iria_tovin"]
    },
    {
      id: "iria_tovin", category: "people", title: "Iria Cale and Tovin Rusk",
      sub: "A Reedhouse daughter and a tanner's son",
      role: "Brinewick couple",
      link: ["Iria Cale", "Tovin Rusk"],
      tags: ["Brinewick"], aliases: ["Iria", "Tovin", "Cale", "Rusk", "tanyard", "tannery"],
      unlock: "bw_daughter_met",
      body: function (s) {
        var out = [
          "Iria Cale is Nessa's daughter and a Reedhouse server. Tovin Rusk is the son of a Brinewick tanner; his family's small tanyard stands just past the salt store, across the bank rather than across the sea.",
          "Their proposed marriage became difficult because Nessa feared a new household would turn Iria's childhood home into a stopover."
        ];
        if (truthy(s.bw_daughter_completed)) {
          out.push("The couple were given Nessa's blessing and planned their household close enough to keep a place at both fires.");
        }
        if (truthy(s.bw_daughter_wedding_seen)) {
          out.push("They married in Brinewick with both families present. Iria still works at the Reedhouse.");
        }
        return out;
      },
      see: ["brinewick", "nessa_cale"]
    },

    /* ----------------------------------------------------- PLACES: EASTERN GRAINLANDS */

    {
      id: "marlcross", category: "places", title: "Marlcross",
      sub: "The eastern rye and milling village",
      tags: ["Eastern Grainlands", "Trade"], aliases: ["grain green", "cross hall", "windmill", "rye", "milling fair", "eastern high ground"],
      link: ["Marlcross"],
      unlock: "mc_seen",
      body: [
        "A village where the High Grey Road meets three farm tracks on the eastern high ground. Its surrounding fields are known for rye: sacks come to the Grain Green to be weighed, then go on to the drying floors, windmill, or raised storehouses.",
        "The old stone cross and the Cross Hall stand at the meeting of the roads. Its annual Milling Fair turns the Grain Green into a day of pies, prizes, and a very public contest."
      ],
      see: ["sella_morren", "tamsin_pike"]
    },

    /* -------------------------------------------------------- PLACES: TIDAL FLATS */

    {
      id: "brinewick", category: "places", title: "Brinewick",
      sub: "Salt village on the western tidal flats",
      tags: ["Western Tidal Flats", "Trade"], aliases: ["Tide House", "Reedhouse", "Slip Market", "Saltworks", "salt pans", "brine beds"],
      link: ["Brinewick"],
      unlock: "bw_seen",
      body: [
        "A village built inside an earthen bank where the road meets the tidal flats. Brinewick makes salt by letting brine stand in shallow beds, then boiling it in peat-fired pan sheds.",
        "The raised Tide House is its refuge and council room; salt, fish and road goods trade at the narrow loading slip. The Reedhouse and its stable yard sit on the highest ground by the road gate."
      ],
      see: ["hesta_rill", "nessa_cale"]
    },

    /* ------------------------------------------------------------- PLACES: THE CITY */

    {
      id: "carrion_compound", category: "places", title: "The Carrion Compound",
      sub: "The company's rented home base",
      tags: ["Port Valen", "Iron Carrion"], aliases: ["compound", "barracks", "mess", "headquarters"],
      link: ["Carrion Compound"],
      unlock: "port_valen_hub_seen",
      body: function (s) {
        var out = [
          "The fortified compound the Iron Carrion rents near the Iron Wharves. The company returns here between contracts to collect pay, repair equipment, and recruit replacements. Recruits sleep on bedrolls in the barracks, and the company mess serves plain fare from the stores awning.",
          "It is a headquarters, not a fief. The company owns no land and can be driven elsewhere whenever its contracts or enemies demand it."
        ];
        if (truthy(s.pv_drill_seen)) {
          out.push("Behind the barracks lies the drill square, a fenced stretch of packed ground with practice posts and a lean-to of wooden weapons. Each squad drills there under its own leader, one long shift a day at most, and the company asks nothing for it.");
        }
        if (truthy(s.pv_workroom_seen)) {
          out.push("An outside stair on the timber headquarters climbs to a back room with a blank brass plate on the door. The Cadre handler works there by day, and the door is shut after dark.");
        }
        return out;
      },
      see: ["iron_carrion", "vane", "iron_wharves"]
    },
    {
      id: "harbor_quayside", category: "places", title: "Harbor Quayside",
      sub: "The waterfront",
      tags: ["Quayside", "Port Valen"], aliases: ["quayside", "harbor", "docks", "waterfront"],
      link: ["Harbor Quayside"],
      unlock: function (s) {
        return truthy(s.port_valen_harbor_seen) || truthy(s.pv_tavern_seen) || truthy(s.pv_quays_seen) ||
          truthy(s.pv_drydock_seen) || truthy(s.pv_pier_seen) || truthy(s.pv_slip_seen) || truthy(s.wh_named);
      },
      body: [
        "One long line of stone and timber along the estuary: the fish market's granite ramp and the low wooden taverns at the western end, the cargo quay with its slips and massive balance cranes, a squat customs tower where the road down from the terraces meets the quay gate, then the shipyard wall and a long stone breakwater running out toward the bar. Deep-hulled merchant vessels ride at anchor in the outer roadstead, while flat-bottomed river barges and fishing smacks crowd the inner docks.",
        "From west to east the quayside holds the Fishmongers' Slip, the Cleaved Keel, the Cargo Quay with its long grey hall under an iron beam-scale and the customs tower at its end, the shipwrights' ways of the Iron Wharves, and the long pier out to the wreck-bell."
      ],
      see: ["cleaved_keel", "cargo_quay", "iron_wharves", "pier", "fishmongers_slip", "port_valen"]
    },
    {
      id: "cleaved_keel", category: "places", title: "The Cleaved Keel",
      sub: "Porter crews' taphouse",
      tags: ["Quayside"], aliases: ["Keel", "taphouse", "tavern", "taproom"],
      link: ["Cleaved Keel"],
      unlock: "pv_tavern_seen",
      body: [
        "A low wooden hall on pilings above the tideline, where the fish market gives up and the taverns take over. Its sign is a keel split down the middle by a painted shipwright's wedge, and the room smells of sprat smoke and spilled beer.",
        "The porter crews drink their wages here. There is stew and salt mackerel at the bar, a dice game at the long trestle, and dockside talk on the benches, and Maret keeps the peace."
      ],
      see: ["maret", "cutter", "harbor_quayside"]
    },
    {
      id: "cargo_quay", category: "places", title: "The Cargo Quay",
      sub: "Under the customs tower",
      tags: ["Quayside", "Law", "Trade"], aliases: ["customs", "customs tower", "registry", "toll tower", "cargo line"],
      link: ["Cargo Quay"],
      unlock: "pv_quays_seen",
      body: [
        "The cargo quay runs from the taverns by the fish market toward the customs tower, and it is one long argument conducted in stamped parchment. Guild clerks in the river-serpent colors of the Gilded Scales move crate to crate with wax tablets, while Port Watch officers walk the line with swords at their hips and spears on their shoulders.",
        "Midway along it stands a long hall of grey stone under a great iron beam-scale. The registry box stands under the customs tower at its end, where the dockmaster's lamp burns in the window. Crane three, on the cargo line, takes day labor."
      ],
      see: ["voss", "dell", "gilded_scales", "port_watch", "weigh_house"]
    },
    {
      id: "weigh_house", category: "places", title: "The Weigh House",
      sub: "The city's scales on the cargo quay",
      tags: ["Quayside", "Trade"], aliases: ["weigh house", "weigh-house", "beam-scale", "scale house", "slate", "price boards"],
      link: ["Weigh House"],
      unlock: "wh_named",
      body: function (s) {
        var out = [
          "A long hall of grey stone midway along the cargo quay, with cart doors wide enough for a laden dray and a great iron beam-scale hung from its gable. Cut into the lintel is the line One Weight for All. Inside are platform scales sunk in the floor, racks of brass weights, and a wall of black boards ruled in columns, one for each good the port handles. A chalkboard by the doors gives tomorrow's weather."
        ];
        if (truthy(s.ch_tax_licence_talk)) {
          out.push("Selling goods by the load here needs a Trade Licence from the Council Hall's tax windows. Without one, the Weighmaster will weigh a cart and no more.");
        }
        return out;
      },
      see: ["odo_farrow", "cargo_quay", "voss", "fishmongers_slip", "scales_head_house", "harbor_quayside", "trade_licence"]
    },
    {
      id: "odo_farrow", category: "people", title: "Odo Farrow",
      sub: "Weighmaster of the Weigh House",
      role: "Weighmaster, the Weigh House",
      link: ["Odo Farrow", "Weighmaster Farrow", "Farrow"],
      tags: ["Quayside", "Trade"], aliases: ["Farrow", "Odo", "weighmaster"],
      unlock: "wh_seen",
      body: [
        "A stout, bald man in a grey coat and a leather apron, with a brass plumb-bob on a cord at his belt and chalk to the elbows, who keeps the great scale from a low platform beside it. He says nothing leaves his floor unweighed and nothing on it is weighed twice."
      ],
      see: ["weigh_house", "voss"]
    },
    {
      id: "iron_wharves", category: "places", title: "The Iron Wharves",
      sub: "The shipwrights' ways",
      tags: ["Iron Wharves", "Gilded Scales"], aliases: ["shipyard", "drydock", "shipwrights", "slipways", "ways"],
      link: ["Iron Wharves"],
      unlock: "pv_drydock_seen",
      body: [
        "Coal smoke, forge-spark, and the ring of caulking mauls announce the yard long before you see it. Behind the shipyard wall the merchant ways climb out of the tide like half-built animals: river barges and ocean hulls stripped to the ribs, steamed planks going down seam by seam under the Gilded Scales' river-serpent standard.",
        "Every hull on the ways has a crew's name chalked on its cradle and a fine written under it."
      ],
      see: ["brant", "hendryk", "gilded_scales", "carrion_compound"]
    },
    {
      id: "pier", category: "places", title: "The Pier",
      sub: "The breakwater to the outer bar",
      tags: ["Pier", "Quayside"], aliases: ["pier", "breakwater", "wreck bell", "bell", "reef", "bar", "jetty"],
      link: ["Wreck-Bell", "wreck-bell"],
      unlock: "pv_pier_seen",
      body: function (s) {
        var out = [
          "A long stone breakwater that runs out over the shoals toward the outer bar. At its head stand a jetty crane and a gallows-frame, and beyond the last stone a bronze bell on the reef counts the surge in slow strokes.",
          "At its landward end a small iron-hooded shrine, the Tide-Well, stands beside the landing stairs.",
          "Names of the lost are scratched into the frame post at every height a hand can reach, with no list and no keeper: whoever loses someone to the bar adds a mark, and whoever passes touches one. Skiffs tie off along the lower stone ladders."
        ];
        if (s.bell_quest_stage === "resolved") {
          out.push("One night wreckers packed the striker with greased wool so the bell could not ring, and waited below the ladder to strip a ketch on the reef. It rang in the end, and the ketch went by.");
          if (s.bell_resolution === "reported") {
            out.push("You left the wreckers' pouch where it lay, and the older watchman tipped the silver into his palm under the lantern.");
          } else if (s.bell_resolution === "pocketed") {
            out.push("You took the wreckers' pouch, five silver marks, under the older watchman's eye. He said only that you rang it, and sent you down to the quay.");
          } else if (s.bell_resolution === "bloodied") {
            out.push("The Watch came along the causeway on the sound of a whistle before the wreckers could finish, and sent you off the stone.");
          }
        } else if (s.bell_quest_stage === "failed") {
          out.push("One night wreckers packed the striker with greased wool so the bell could not ring, and a ketch broke on the reef.");
        } else if (truthy(s.bell_heard_story)) {
          out.push("Watermen say the bell went silent once before, on a night a grain barge broke her back on the reef with nobody on the stone to hear it not ring.");
        }
        return out;
      },
      see: ["harbor_quayside", "wreck_law"]
    },
    {
      id: "fishmongers_slip", category: "places", title: "The Fishmongers' Slip",
      sub: "The fish market landing",
      tags: ["Fishmongers' Slip", "Quayside", "Trade"], aliases: ["slip", "fish market", "smokehouses", "stalls"],
      link: ["Fishmongers' Slip"],
      unlock: "pv_slip_seen",
      body: [
        "A broad ramp of wet granite beside the fish market, sloped so the inshore boats can be hauled up on rollers and sold off the boards. Behind the stalls stand the low black smokehouses, and above them a long net-drying loft with its loading door open to the wind.",
        "The dawn auction is the heart of it, with food stalls gathered around the wet stone."
      ],
      see: ["auction_block", "wenna", "thale", "harbor_quayside"]
    },
    /* ----------------------------------------------------------- PLACES: DISTRICTS */

    {
      id: "dredge_end", category: "places", title: "Dredge-End",
      sub: "The low crowded quarter",
      tags: ["Dredge-End", "Black Oath"], aliases: ["slums", "canals", "silt basin", "terraces", "lanes"],
      link: ["Dredge-End"],
      unlock: function (s) {
        return truthy(s.dredge_end_seen) || truthy(s.cut_seen_market) || truthy(s.cut_seen_gangways) ||
          truthy(s.cut_seen_sheds) || truthy(s.cut_seen_landing) || truthy(s.cut_seen_lamp_stair) ||
          truthy(s.cut_seen_shrine) || truthy(s.cut_seen_lower_steps);
      },
      body: function (s) {
        var out = [
          "The city's paving stops at the drainage cut. Past it the lanes are broken stone and packed cinder, with planks laid over the low patches where the ground gives up. Dredge-End is a low, cramped district of leaning terraces, brick and timber shored together with whatever the river gave back, built close enough that you can cross a lane without raising your voice.",
          "It is Black Oath country. The Watch seldom comes into the quarter on a market day, and trade settles with sharp elbows and quick fingers."
        ];
        if (truthy(s.cut_seen_market)) {
          out.push("<b>Duckboard Market.</b> Along the canal, patched awnings shelter eel-sellers, punts, and a rope-and-oil house. The lane smells of frying eel, lamp oil, and wet rope.");
        }
        if (truthy(s.cut_seen_gangways)) {
          out.push("<b>The upper gangways.</b> Plank-and-cord walkways join the upper storeys. Lookouts with tin whistles watch the lanes, canal, and street mouths from their platforms.");
        }
        if (truthy(s.cut_seen_sheds)) {
          out.push("<b>The boat-sheds and scrap yard.</b> Open sheds face the canal beside a fenced yard of salvaged stone, chain, and plate iron. The scrap dealer buys anything useful from the river or a broken lane.");
        }
        if (truthy(s.cut_seen_landing)) {
          out.push("<b>The dredge landing.</b> At low water, workers haul black spoil from the canal into drying mounds. The made ground beneath the district is laid down a basket at a time.");
        }
        if (truthy(s.cut_seen_lamp_stair)) {
          out.push("<b>Lamp Stair.</b> Above the flood line beneath the seawall, a short stair reaches a row of red-shaded lamps, a pawnbroker and hedge-doctor by day, and a dice cellar and drinking house after dusk.");
        }
        if (truthy(s.cut_seen_lower_steps)) {
          out.push("<b>The lower steps.</b> A seawall stair falls toward the canal and its tide-flooded cellars, some used as flophouses when the water is low.");
        }
        return out;
      },
      see: ["black_oath", "silt_gates", "corve", "alley_shrine", "port_valen"]
    },

    /* ----------------------------------------------- DREDGE-END: THE SEVEN AREAS */

    {
      id: "duckboard_market", category: "places", title: "Duckboard Market",
      sub: "The old market lane along the canal",
      tags: ["Dredge-End"], aliases: ["market", "stalls", "rope-and-oil house", "rope shop", "eel-seller", "awnings"],
      link: ["Duckboard Market"],
      unlock: "cut_seen_market",
      index: false,
      body: function (s) {
        var n = Number(s.cut_rumors_market) || 0;
        var out = [
          "The market lane along the canal: broken stone and packed cinder, with planks laid over the low patches where the ground gives up. Stalls stand under patched oilskin awnings in yellow and red, punts nose in from the canal side, and the lane smells of frying eel, lamp oil and wet rope. At the landward end a rope-and-oil house sells cordage, hooks, lamp oil, tallow and sail patches from behind a half-door, and an outside stair beside it climbs to a shut door on the upper floor."
        ];
        if (n >= 1) {
          out.push("The eel-seller is said to keep a shaved coin under her pan. Hers are the only eels before noon, so the lane buys from her anyway.");
        }
        if (n >= 2) {
          out.push("The rope-and-oil house has a room upstairs with candles burning at all hours, though nobody has seen it rented. The man on the bottom step of the stair calls it stores: rope and oil, not for rent.");
        }
        if (n >= 3) {
          out.push("A tailor's apprentice has had his purse lifted three Marketdays running, and still keeps it in the same pocket.");
        }
        if (truthy(s.hask_associate_joined)) {
          out.push("Hask sent you to the upper floor after dark when he had work for you. He did not say who was waiting upstairs or how the room fits into the Black Oath.");
        }
        if (truthy(s.black_oath_keeper_met)) {
          out.push("Upstairs, a woman handles the night's work from a slate table. She gave no name and did not explain what lies beyond that room.");
        }
        return out;
      },
      see: ["dredge_end", "upper_gangways", "black_oath"]
    },
    {
      id: "upper_gangways", category: "places", title: "Upper Gangways",
      sub: "The upper walkways",
      tags: ["Dredge-End"], aliases: ["gangways", "walkways", "rope bridges", "lookouts", "tin whistles"],
      link: ["Upper Gangways"],
      unlock: "cut_seen_gangways",
      index: false,
      body: function (s) {
        var n = Number(s.cut_rumors_gangways) || 0;
        var out = [
          "Walkways of plank and cord slung between the upper storeys, reached by outside stairs. Lookouts sit on the larger platforms with tin whistles hung at their belts, watching the lanes, the canal and the street mouths. From the corner platform the whole district lies below, and above the seawall the city climbs in terraces to the pale limestone of Civic Heights."
        ];
        if (n >= 1) {
          out.push("The lookouts pass word between landings in whistles, a long, a short, a long, and now and then a plain word across a gap: boat, face, watch. Asked what they watch for, one said boats, faces and the Watch, in that order on a good day.");
        }
        if (n >= 2) {
          out.push("From a window below the walkways a woman's voice goes through a list of amounts while another voice answers yes to each. The counting stopped at one figure, and nobody answered that one.");
        }
        return out;
      },
      see: ["dredge_end", "duckboard_market", "lamp_stair"]
    },
    {
      id: "boat_sheds", category: "places", title: "Boat-Sheds and Scrap Yard",
      sub: "Oar sheds, scrap dealer and smith",
      tags: ["Dredge-End"], aliases: ["boat-sheds", "boat sheds", "scrap yard", "smith", "oars", "chain"],
      unlock: "cut_seen_sheds",
      index: false,
      body: function (s) {
        var n = Number(s.cut_rumors_scrap) || 0;
        var out = [
          "Sheds built out over the canal kerb line the bank with their doors open to the water and racks of half-shaped ash oars under the eaves. The ground between them is trampled cinder scattered with wood shavings. Further along is a fenced scrap yard of salvaged stone, coiled chain and plate iron, and a smith's bench under a lean-to. The smith's hammer carries across the canal."
        ];
        if (n >= 1) {
          out.push("The dealer buys chain, plate, oar-pins and anything with iron in it, and flat stone for paving, because somebody in the quarter is always relaying a lane.");
        }
        if (n >= 2) {
          out.push("Some weeks chain comes in with the dockmaster's mark rasped off it. The dealer weighs it and does not ask.");
        }
        return out;
      },
      see: ["dredge_end", "dredge_landing", "hask"]
    },
    {
      id: "hask", category: "people", title: "Hask",
      sub: "Scrap dealer, the Boat-Sheds Scrap Yard",
      role: "Scrap dealer, Boat-Sheds Scrap Yard (Dredge-End)",
      link: ["Hask"],
      tags: ["Dredge-End"], aliases: ["scrap dealer", "the dealer"],
      // Same rule as Dell (crane three): his name stays hidden behind the same variable
      // that unlocks it in the scrap-yard hub text.
      unlock: "met_hask",
      body: function (s) {
        var out = [
          "A wide, slow man in a greased canvas apron who runs the scrap pen at the boat-sheds, weighing salvaged iron by the pound and watching a seller's hands and boots before he ever looks at a face. Some weeks the chain that comes in has the harbor-master's mark rasped off it, and he pays for it the same as anything else."
        ];
        if (truthy(s.hask_courier_unlocked)) {
          out.push("After enough honest sales, he put your name to a man he does business with, and now sends you out with a satchel of small parcels around the quarter — nothing heavy, nothing that would get you in trouble if you were stopped and asked to open one.");
        }
        if (truthy(s.hask_associate_offer_seen)) {
          out.push("After six clean rounds he finally named the employer: the Black Oath. He said he would put word of a capable runner upstairs.");
        }
        if (truthy(s.hask_associate_joined)) {
          out.push("He has put his own name behind yours. That makes you an associate who may be trusted with named paid work, not a sworn member of the brotherhood.");
        }
        return out;
      },
      see: ["dredge_end", "black_oath"]
    },
    {
      id: "dredge_landing", category: "places", title: "Dredge Landing",
      sub: "Where the canal gives up its spoil",
      tags: ["Dredge-End"], aliases: ["landing", "dredgers", "spoil", "barges", "foreman"],
      link: ["Dredge Landing"],
      unlock: "cut_seen_landing",
      index: false,
      body: function (s) {
        var n = Number(s.cut_rumors_landing) || 0;
        var out = [
          "A wide shelf of hard-packed cinder where the canal widens, with three low barges tied along its edge. Dredgers haul black spoil up in baskets with hooked poles and iron scoops on chains and tip it onto long mounds that dry to a crust on the bank. It can only be worked at low water, and the barges stay tied up in fog or a gale."
        ];
        if (Number(s.cut_labor_day) > 0) {
          out.push("The foreman hires people to work the poles, and cuts a worker loose after a spilled basket.");
        }
        if (n >= 1) {
          out.push("The dredgers pull up iron oar-pins, chain and, once in a while, a single boot.");
        }
        if (n >= 2) {
          out.push("Every basket that comes up goes onto the bank. It is dried, rammed hard and paved over with stone from the canal. The lanes of Dredge-End are made ground, laid down one basket at a time.");
        }
        return out;
      },
      see: ["dredge_end", "boat_sheds", "flooded_steps"]
    },
    {
      id: "lamp_stair", category: "places", title: "Lamp Stair",
      sub: "The red-lamp street under the seawall",
      tags: ["Dredge-End", "Black Oath"], aliases: ["red lamps", "red-lamp street", "blue door", "dice cellar", "pawnbroker", "hedge-doctor", "drinking house"],
      link: ["Lamp Stair"],
      unlock: "cut_seen_lamp_stair",
      index: false,
      body: function (s) {
        var pawn = Number(s.cut_rumors_pawn) || 0;
        var drink = Number(s.cut_rumors_drink) || 0;
        var out = [
          "A flagged street along the foot of the seawall, above the flood line, reached by a short flight of stone steps from the canal. The flags are worn into shallow bowls by a great many feet, and the doors along it are painted blue, green and a red gone brown, each with a red-shaded lamp over it. What is open depends on the hour: a pawnbroker's window and a hedge-doctor's stall by day, and from dusk a dice cellar, an all-night drinking house and the house with the blue door."
        ];
        if (pawn >= 1) {
          out.push("The pawnbroker lends against tools before rings. A man can live without his ring.");
        }
        if (pawn >= 2) {
          out.push("A woman is said to come on Hallowdays with a pouch of temple silver and leave with tincture vials nobody wrote down. The pawnbroker says he does not know her.");
        }
        if (drink >= 1) {
          out.push("A ferryman in the drinking house says the Oath never has to raise a hand. You just wake up owing something you do not remember borrowing.");
        }
        if (drink >= 2) {
          out.push("Two dredgers argued over whether it is worse to owe the Oath or the Scales. The Scales send a clerk, said one. The Oath sends someone you grew up with.");
        }
        return out;
      },
      see: ["dredge_end", "black_oath", "upper_gangways", "corve"]
    },
    {
      id: "corve", category: "places", title: "Widow Corve's",
      sub: "A private house beneath the seawall",
      tags: ["Dredge-End"], aliases: ["the stews", "blue door", "house with the blue door"],
      link: ["Widow Corve's"],
      unlock: "codex_corve",
      body: function (s) {
        var out = [
          "A private house built into the granite base of the seawall on Lamp Stair, marked by a small brass plate reading \"Widow Corve's\" and twin lanterns with deep red bullseye glass over the door. Past the felt curtain, a heated parlor smells of dried lavender, applewood coals and spiced wine, and every woman working the floor does so under the house's own leasehold, not anyone else's.",
          "Regulars say the wine does a man sleeping too many nights running in the same rough cot more good than it ever does his thirst. Whoever holds the leasehold is never seen and never named -- she doesn't need to know a customer's."
        ];
        return out;
      },
      see: ["dredge_end", "sable", "brinna"]
    },
    {
      id: "sable", category: "people", title: "Sable",
      sub: "Companion, Widow Corve's",
      role: "Companion, Widow Corve's (Dredge-End)",
      link: ["Sable"],
      tags: ["Dredge-End"], aliases: ["the pale woman", "white-blonde woman"],
      unlock: "met_corve_sable",
      body: function (s) {
        var out = [
          "A pale, sharp-eyed companion at Widow Corve's, with white-blonde hair cropped cleanly at her jawline and an unhurried, measuring manner. She moves without a sound, and without seeming to try."
        ];
        if (truthy(s.sable_talk_1)) {
          out.push("She grew up on the high-terrace grain lofts of Civic Heights, where her mother worked the drying racks. A girl who spends her childhood crossing cedar rafters fifty feet above a stone floor learns where to put her weight, or she learns what broken ribs feel like.");
        }
        if (truthy(s.sable_talk_2)) {
          out.push("She has no patience for the Patrician Quarter, where she says the merchants steal a purse with a legal writ instead of a knife and still call themselves honest. Down in Dredge-End, at least, nobody pretends to be noble.");
        }
        return out;
      },
      see: ["corve", "brinna", "dredge_end"]
    },
    {
      id: "brinna", category: "people", title: "Brinna",
      sub: "Companion, Widow Corve's",
      role: "Companion, Widow Corve's (Dredge-End)",
      link: ["Brinna"],
      tags: ["Dredge-End"], aliases: ["the half-orc woman"],
      unlock: "met_corve_brinna",
      body: function (s) {
        var out = [
          "A broad-shouldered half-orc companion at Widow Corve's, built with formidable strength but light on her feet, with a wide, tusked smile and a booming, easy laugh."
        ];
        if (truthy(s.brinna_talk_1)) {
          out.push("Her father was a smith in the highland foothills, and she grew up swinging sledges and working the leather bellows. She can still judge the heat of iron by the color of its glow, but she says sitting warm by a stove beats breathing coal smoke all day.");
        }
        if (truthy(s.brinna_talk_2)) {
          out.push("She likes the music and the quiet hours best. Out in the streets, she says, people are shouting, bargaining or reaching for knives; by the hearth at Widow Corve's, they soften up and remember how to laugh without looking over their shoulder.");
        }
        return out;
      },
      see: ["corve", "sable", "dredge_end"]
    },
    {
      id: "alley_shrine", category: "places", title: "Alley Shrine",
      sub: "The tallow arch and the broth line",
      tags: ["Dredge-End"], aliases: ["shrine", "friar", "broth", "tallow arch"],
      link: ["Alley Shrine"],
      unlock: "cut_seen_shrine",
      body: function (s) {
        var n = Number(s.cut_rumors_shrine) || 0;
        var out = [
          "A timber arch black with tallow smoke over a small carved figure in a veil, its face worn smooth by hands, with ALTHEA scratched into its base. Strips of old linen are tied along the arch, and a clay bowl at the figure's feet holds river pebbles and candle stubs. An iron hook holds a broth pot. On Hallowdays a friar in a patched habit of undyed wool ladles thin pea broth to the district's poorest, and the line is kept in order by two broad-shouldered men in boiled leather who stand at the alley mouth with a creased scrap of vellum. The shrine is Saint Althea's, the mender the frontier prays to, and the district keeps it in tallow where the Middle Ward keeps its own saint's shrine in beeswax.",
          "The men at the alley mouth are not friars. The friar feeds whoever is hungry and asks nothing; the men in boiled leather are there to find out who has stopped turning up, and the quiet tap on a shoulder at the back of the line is how a name gets carried up to the room behind the chandler's. The arch and that room have nothing to do with each other, and everyone below the drainage cut would rather you did not put the two together in front of the wrong person."
        ];
        if (n >= 1) {
          out.push("The tin tray is emptier every month. People have no candles to spare, and light one for the ones who did not come back and none for themselves.");
        }
        if (n >= 2) {
          out.push("The arch is older than the lanes. They were built around it, like everything else here that was already sinking. The bishops up the hill sing to Althea's father, an old man said. Down here they still pray to her: she mended things, and he only swears them.");
        }
        if (truthy(s.cut_shrine_gave)) {
          out.push("A woman on the step said the friar does not keep what goes in the bowl. It goes to whoever he has it for that week, and she told you to ask him who.");
        }
        if (truthy(s.shroud_seen)) {
          out.push("A scarred young man once tore the week's dish out of the friar's hands, forty coppers meant for the gravedigger, and broke the clay bowl so the friar could not follow. A dead man lay under a fishing net at the saint's feet while his widow and three children waited on it.");
        }
        if (s.shroud_resolution === "returned" || s.shroud_resolution === "fee") {
          out.push("The bowl has been replaced with a new one, fired lopsided.");
        } else if (s.shroud_resolution === "pocketed" || s.shroud_resolution === "escaped" || s.shroud_resolution === "cold") {
          out.push("A tin cup lashed to the plinth with linen strips stands where the clay bowl used to be.");
        }
        return out;
      },
      see: ["saint_althea", "dredge_end", "black_oath", "anselm"]
    },
    {
      id: "anselm", category: "people", title: "Brother Anselm",
      sub: "Friar of the Alley Shrine",
      role: "Friar, Alley Shrine (Dredge-End)",
      link: ["Brother Anselm", "Anselm"],
      tags: ["Dredge-End"], aliases: ["the friar", "friar"],
      // His name stays hidden until the shrine scene has him say it (met_anselm), which only
      // the "returned" ending and a first phial sale do. The "fee" ending never learns it.
      unlock: "met_anselm",
      body: function (s) {
        var out = [
          "The friar of the Alley Shrine, a man in a patched habit of undyed wool who ladles thin pea broth to the district's poorest on Hallowdays. He answers to Brother Anselm \"on the days the parish remembers it has brothers.\""
        ];
        if (s.shroud_resolution === "returned") {
          out.push("You brought back the purse and the silver knotted in the thieves' rag, and he said it belonged to the saint now and would bury the dead man properly.");
        } else if (s.shroud_resolution === "pocketed") {
          out.push("You told him the trail had gone cold. He thanked you for trying.");
        }
        out.push("He sells one kind of phial: cistern water steeped a month in the dark with angelica and arnica, made for those who go out on the river. A batch takes a full month, so he can spare one at a time.");
        return out;
      },
      see: ["alley_shrine", "saint_althea", "dredge_end"]
    },
    {
      id: "flooded_steps", category: "places", title: "Flooded Lower Steps",
      sub: "The seawall stair and its cellars",
      tags: ["Dredge-End"], aliases: ["lower steps", "cellars", "flophouse", "flophouses", "tide marks"],
      link: ["Flooded Lower Steps"],
      unlock: "cut_seen_lower_steps",
      index: false,
      body: function (s) {
        var n = Number(s.cut_rumors_steps) || 0;
        var out = [
          "A broad flight of stone steps down the side of the seawall into the canal. At low water the lower half stands out of the water, black and hung with green weed, with cellar doors opening off the landings, some boarded and some with a rag hung in the gap. The lower landings are under water when the tide is high, though the upper stair stays dry enough to walk."
        ];
        if (n >= 1) {
          out.push("The cellars are flophouses. Behind one rag-hung door a dozen people sleep in shifts on the same straw, and whoever holds the wooden token at the door gets to sleep.");
        }
        if (n >= 2) {
          out.push("Someone has painted a line on the stair wall at head height, with a date, and a second line above it. The second date is last year. The first line is what the landlord said the water would do.");
        }
        return out;
      },
      see: ["dredge_end", "dredge_landing"]
    },
    {
      id: "middle_ward", category: "places", title: "The Middle Ward",
      sub: "The broad middle of the city",
      tags: ["Middle Ward"], aliases: ["terrace", "second terrace", "conduit square", "craftsmen", "workshops", "trunk road"],
      link: ["Middle Ward"],
      unlock: function (s) {
        return truthy(s.mw_seen) || truthy(s.mw_lantern_seen) || truthy(s.mw_smiths_seen) ||
          truthy(s.mw_lodgings_seen) || truthy(s.mw_wash_seen) || truthy(s.mw_river_gate_seen) ||
          truthy(s.mw_charter_gate_seen) || truthy(s.es_yard_seen);
      },
      body: function (s) {
        var out = [
          "The road climbs in turns from the docks and levels out onto the Second Terrace, the broad shelf of flat ground that holds most of the city, with the lower streets falling away toward the harbor behind it and Civic Heights and the Patrician Quarter rising in tiers ahead. It is the largest ward in Port Valen. Timber buildings lean over narrow lanes beneath steep slate roofs, their lower shutters open as shop counters, and the air smells of cooled iron, brass dust, cedar sawdust and warm caraway bread.",
          "Conduit Square, with its octagonal fountain and four bronze lion-head spouts, is the crossroads: the trunk road that carries the city's traffic runs through it, north-west and east toward the great gates in the landward wall, and down the switchbacks to the harbor. Lanes branch to the Locksmiths' Close, Lantern Lane and Smiths' Row, and Herb-Pounder Close is a dead-end at the head of Lantern Lane. A short way along the trunk road, an inn hangs a white wagon wheel over its door. A communal oven feeds the ward, and a public wash-house with baths stands behind the square."
        ];
        if (truthy(s.mw_rumor_grain)) {
          out.push("Rumor from the baths: a Council grain officer waves unlicensed flour wagons through Conduit Square on Marketdays for a small payment slip, so the licensed drivers end up paying twice, once in fees and once in waiting.");
        }
        if (truthy(s.mw_lantern_seen)) {
          out.push("<b>Lantern Lane.</b> A curving shopping street under timber eaves, where counters sell everyday goods and a horn lantern hangs over every door.");
        }
        if (truthy(s.mw_smiths_seen)) {
          out.push("<b>Smiths' Row.</b> Three open-shed forges share a stone water trough at the lower end of the ward, where harbor iron and coal arrive by wagon.");
        }
        if (truthy(s.mw_lodgings_seen)) {
          out.push("<b>Terrace Lodgings.</b> A boarding house at the end of Locksmiths' Close lets rooms by the week behind a thick door and a locksmith's deadbolt.");
        }
        if (s.dry_lion_resolution === "city_sealed") {
          out.push("A broken unlisted branch beneath Conduit Square was capped to restore the public fountain. The court off Locksmiths' Close lost its only standpipe, and the city crew still has to shore the washed ground.");
        } else if (s.dry_lion_resolution === "hidden_repaired") {
          out.push("A split sleeve beneath Conduit Square was braced and repaired, keeping both the public fountain and the court's standpipe running. The repair is watched closely by the people who depend on it.");
        } else if (s.dry_lion_resolution === "line_registered") {
          out.push("The court's old branch has a ten-day emergency entry on the city maintenance roll. A lead tag at the braced junction marks the inspection that will decide whether the line stays.");
        } else if (s.dry_lion_resolution === "failed") {
          out.push("A split water line undermined the fountain paving and had to be shut. The city is due to shore the street and dig out the broken section.");
        }
        return out;
      },
      see: ["conduit_baths", "marda", "vael", "ambrose", "hollis", "halda", "merrin", "civic_heights"]
    },
    {
      id: "lantern_lane", category: "places", title: "Lantern Lane",
      sub: "The Middle Ward's shopping street",
      tags: ["Middle Ward", "Trade"], aliases: ["shops", "shopping street", "general store", "counters", "stalls"],
      link: ["Lantern Lane"],
      unlock: "mw_lantern_seen",
      index: false,
      body: function (s) {
        var out = [
          "A curving lane that climbs from Conduit Square under deep timber eaves, with an iron bracket for a horn lantern over every shop door. Small shops and open counters line it, with Hollis & Daughters General Goods holding the widest front. At the head of the lane, a gap between two workshops leads into Herb-Pounder Close, where Master Ambrose keeps his still-room."
        ];
        if (truthy(s.mw_hollis_lane_talk)) {
          out.push("The name comes from the lanterns. Every shop keeps one lit over its door from dusk to dawn, and each pays a copper a week to the ward lamp-keeper for the oil. That makes it the best-lit street in the ward at night.");
        }
        return out;
      },
      see: ["hollis", "middle_ward", "civic_heights"]
    },
    {
      id: "smiths_row", category: "places", title: "Smiths' Row",
      sub: "The forges at the ward's lower end",
      tags: ["Middle Ward", "Trade"], aliases: ["smithy", "forges", "smiths yard", "blacksmith", "cooper", "iron"],
      link: ["Smiths' Row"],
      unlock: "mw_smiths_seen",
      index: false,
      body: function (s) {
        var out = [
          "A cobbled yard at the lower end of the Middle Ward, where the harbor road climbs in. Three forges stand under open sheds around a stone water trough, with racks of finished work along the walls. Iron bars and coal come up from the harbor by wagon. A cooper's bench at the far end still makes barrels for the ward."
        ];
        return out;
      },
      see: ["halda", "middle_ward", "vael"]
    },
    {
      id: "conduit_baths", category: "places", title: "The Conduit Wash-House",
      sub: "Laundry yard and public baths",
      tags: ["Middle Ward"], aliases: ["baths", "bathhouse", "laundry", "washing yard", "steam", "soak"],
      link: ["Conduit Wash-House", "Conduit Baths"],
      unlock: "mw_wash_seen",
      body: function (s) {
        var out = [
          "A covered yard behind Conduit Square, where copper tubs sit on charcoal fires under long shed roofs and steam rolls out into the lanes. At the far end a low stone building holds the Conduit Baths, fed by a lead pipe from the conduit. The yard is busiest on Greyday, which is washday."
        ];
        if (truthy(s.mw_merrin_water_talk)) {
          out.push("The water is heated by boilers built into the back wall of Mother Marda's ovens.");
        }
        if ((s.dry_lion_resolution === "failed") && (Number(s.campaign_day) <= Number(s.dry_lion_outage_until_day))) {
          out.push("The baths are temporarily closed while the broken water line is shored and repaired.");
        }
        return out;
      },
      see: ["merrin", "marda", "middle_ward"]
    },
    {
      id: "terrace_lodgings", category: "places", title: "Terrace Lodgings",
      sub: "Rooms in the Locksmiths' Close",
      tags: ["Middle Ward"], aliases: ["lodgings", "rooms", "rent", "boarding house"],
      link: ["Terrace Lodgings"],
      unlock: "mw_lodgings_seen",
      index: false,
      body: [
        "The four-storey limestone front of a boarding house at the end of the Locksmiths' Close, its thick wooden door fitted with a teardrop-shaped knocker. Rooms let by the week, with Mistress Kess collecting the rent and a locksmith's deadbolt on every door."
      ],
      see: ["kess", "vael", "middle_ward"]
    },
    {
      id: "wagoners_rest", category: "places", title: "The Wagoner's Rest",
      sub: "An inn on the trunk road",
      tags: ["Middle Ward"], aliases: ["inn", "wagoner's rest", "stables", "stable yard", "room for the night"],
      link: ["Wagoner's Rest"],
      unlock: "mw_inn_seen",
      body: function (s) {
        var out = [
          "A long two-storey inn of grey stone and dark timber on the trunk road, marked by a white-painted wagon wheel over its door. It has a low beamed hall, rooms above, and behind an archway a cobbled yard with a stable range and a cart shed."
        ];
        if (truthy(s.mw_inn_talk_house)) {
          out.push("Rooms are kept one guest to a key.");
        }
        if (truthy(s.mw_inn_talk_road)) {
          out.push("Its guests are mostly carters, drovers and factors' clerks off the trunk road, and few stay longer than a night.");
        }
        return out;
      },
      see: ["oswin", "middle_ward"]
    },
    {
      id: "oswin", category: "people", title: "Oswin Hale",
      sub: "Keeper of the Wagoner's Rest",
      role: "Innkeeper, the Wagoner's Rest (trunk road)",
      link: ["Oswin Hale", "Oswin"],
      tags: ["Middle Ward"], aliases: ["Oswin", "Hale", "keeper of the inn"],
      unlock: "mw_inn_seen",
      body: function (s) {
        var out = [
          "A heavy man in a leather apron with forearms corded from years on a carter's box, who keeps a slate on his knee and chalks every guest's bed and reckoning himself."
        ];
        if (truthy(s.mw_inn_talk_house)) {
          out.push("He runs his house for the traveler who is there one night and gone the next, and sends anyone staying longer to the landlady in the Locksmiths' Close, who lets by the week.");
        }
        if (truthy(s.mw_inn_talk_road)) {
          out.push("He never sees most of his guests twice, and says that suits him: a house that sees the same faces every night starts to hear the same complaints.");
        }
        return out;
      },
      see: ["wagoners_rest", "kess", "middle_ward"]
    },
    {
      id: "trunk_road", category: "places", title: "The Trunk Road",
      sub: "The city's main road, gate to gate",
      tags: ["Middle Ward"], aliases: ["trunk road", "gate road", "wagon road", "wheelwrights", "wagon yards"],
      link: ["Trunk Road"],
      unlock: "mw_gate_road_seen",
      body: [
        "A broad paved way that crosses the Middle Ward from the River Gate in the north-west to the Charter Gate in the east, meeting Conduit Square at the middle and running on down the switchbacks to the harbor. Wheelwrights, farriers, harness-makers, chandlers and cheap cookshops line it, with wagon yards behind arched entries and the Wagoner's Rest a short way along.",
        "Iron-tired wheels have worn two shallow grooves into the paving. The road belongs to carters, drovers and travelers, and the Watch patrols it in pairs."
      ],
      see: ["river_gate", "charter_gate", "wagoners_rest", "middle_ward"]
    },
    {
      id: "river_gate", category: "places", title: "The River Gate",
      sub: "The north-west gate in the landward wall",
      tags: ["Middle Ward"], aliases: ["river gate", "north-west gate", "west gate", "wicket", "toll-house", "wall levy"],
      link: ["River Gate"],
      unlock: "mw_river_gate_seen",
      body: [
        "The north-west gate in the landward wall: thirty feet of grey blocks, with the trunk road passing through a gatehouse of two round towers. The road beyond turns north along the river cuttings toward the fork where the Grey and the Ashrun meet, with carters' yards and cheap inns outside the wall. Traffic sorts itself into three lanes under the arch: foot to the left, wheels to the right, stamped goods through the center. Watch wardens and Council toll-clerks work the lanes in shifts at every hour."
      ],
      see: ["trunk_road", "charter_gate", "port_watch", "wagon_yard"]
    },
    {
      id: "wagon_yard", category: "places", title: "The Wagon Yard",
      sub: "A carrier's yard outside the River Gate",
      tags: ["Middle Ward", "Trade"], aliases: ["wagon yard", "carters' yard", "carriers' yard", "carter's yard", "ox yard"],
      unlock: "es_yard_seen",
      body: [
        "A broad yard of beaten earth outside the north-west wall, fenced in planks and open to the River Road. A long shed keeps the wagons dry, a lean-to forge and a stone trough serve the teams, and the yard's brand is burned into the flank of every ox.",
        "Caravans for the road are made up here: four or five wagons, oxen in pairs, a lead horse and a wagon master with a slate. They run to Timbermouth by the River Road and, on another day, to Alderford, going round under the wall to the High Grey Road. The Hiring Hall posts the work, and the wagon master pays only those who are in the column when it rolls."
      ],
      see: ["river_gate", "trunk_road", "hiring_hall", "carters_lot_af"]
    },
    {
      id: "charter_gate", category: "places", title: "The Charter Gate",
      sub: "The east gate in the landward wall",
      tags: ["Middle Ward"], aliases: ["charter gate", "east gate", "imperial road", "wicket", "pilgrim hospices"],
      link: ["Charter Gate"],
      unlock: "mw_charter_gate_seen",
      body: [
        "The east gate in the landward wall: newer, higher and faced in pale limestone, with a single great arch, an iron grate in the gallery above and oak leaves hung from the towers. Carved across the arch: By the Old Charter. Keep the Road Clear. Beyond it the imperial road runs east toward the Meridian country, with pilgrim hospices and salt-factors' yards outside the wall.",
        "Watch wardens and Council toll-clerks work the arch in shifts. At night one oak leaf is drawn inward and the traffic narrows beneath lanterns, but the gate remains in use."
      ],
      see: ["trunk_road", "river_gate", "port_watch"]
    },
    {
      id: "cathedral", category: "places", title: "The Cathedral",
      sub: "The Church of the True Sun's chief Valen seat",
      tags: ["Civic Heights", "Faith"], aliases: ["cathedral", "church", "Church of the True Sun", "True Sun", "kettles", "poor-box", "althea chapel", "side chapel"],
      link: [],
      unlock: "cath_seen",
      body: function (s) {
        var out = [
          "The chief Valen seat of the Church of the True Sun is a church of pale limestone above the Council Hall, with three tall arched doors of black oak, two bell towers, and the line The Sun-Father's House. All Oaths Are Sworn in His Sight cut over the middle door. Iron soup kettles stand at the foot of the steps by day, one bowl to a head from First Bell until the pots are empty.",
          "It is open to everyone. The great doors stand open from Morning through Dusk, and at night a small door in one leaf is left unlatched under a lantern while people sleep in the back pews."
        ];
        if (truthy(s.cath_hall_seen)) {
          out.push("Inside, one long hall of limestone pillars runs to a great gilded figure of the Sun-Father in plate armor over the altar. Banners of the great houses hang on the pillars, with brass plates that grow larger the nearer they hang to the altar.");
        }
        if (truthy(s.cath_chapel_seen)) {
          out.push("A small chapel at the end of the north aisle keeps a veiled limestone figure of Saint Althea, with linen strips tied along its rail and river pebbles, pins and candle stubs in a clay bowl. The poor-box stands there, and what is left in it is spent on the kettles. Over the arch is cut: Who Shelters Here Is Not Taken Here.");
        }
        return out;
      },
      see: ["church_true_sun", "sun_father", "saint_althea", "alley_shrine", "sanctuary_charter", "civic_heights"]
    },
    {
      id: "port_watch_hq", category: "places", title: "The Port Watch Headquarters",
      sub: "The Watch's gatehouse and yard beside the Council Hall",
      tags: ["Civic Heights", "Law"], aliases: ["watch yard", "watch headquarters", "watch hq", "guardhouse", "notice board", "duty desk"],
      link: ["Port Watch Headquarters"],
      unlock: "pw_seen",
      body: function (s) {
        var out = [
          "A gatehouse passage beside the Council Hall's west wing, signed Port Watch, with a duty desk, a notice board under the eave and an iron inner gate. Through the bars a cobbled yard runs back to a long two-storey guardhouse of dark stone, sheds full of tagged crates and casks, and a barred stair going down to the cells. The public goes no further than the gatehouse passage."
        ];
        if (truthy(s.pw_talk_rounds)) {
          out.push("The Watch wants hands for the night rounds, paid by the week. The captain draws the rosters herself and signs no one she has not looked at twice.");
        }
        return out;
      },
      see: ["denna_brask", "gerrit_lund", "port_watch", "civic_heights"]
    },
    {
      id: "denna_brask", category: "people", title: "Denna Brask",
      sub: "A captain of the Port Watch",
      role: "Captain, Port Watch (the quays and the lower city)",
      link: ["Denna Brask", "Captain Brask", "Brask"],
      tags: ["Civic Heights", "Law"], aliases: ["Brask", "Denna", "watch captain"],
      unlock: "pw_captain_seen",
      body: function (s) {
        var out = [
          "A short, square woman of about fifty with cropped iron-grey hair, a scar through one eyebrow and a blue-and-brass sash across a boiled-leather coat. She commands the Watch's patrols on the quays and in the lower city. She does not see walk-ups, and comes to the inner gate only for those whose names she knows."
        ];
        return out;
      },
      see: ["port_watch_hq", "port_watch"]
    },
    {
      id: "gerrit_lund", category: "people", title: "Gerrit Lund",
      sub: "Duty sergeant of the Port Watch",
      role: "Duty sergeant, Port Watch",
      link: ["Gerrit Lund", "Sergeant Lund", "Lund"],
      tags: ["Civic Heights", "Law"], aliases: ["Lund", "Gerrit", "duty sergeant"],
      unlock: "pw_desk_seen",
      body: [
        "A heavy man with a drooping moustache and a quill behind his ear, who keeps the duty desk in the gatehouse passage by day. Complaints go to his left and claims to his right, and he wants to hear first if there is blood. He is the public face of the Watch: the captain sees only those she knows."
      ],
      see: ["port_watch_hq"]
    },
    {
      id: "scales_head_house", category: "places", title: "The Gilded Scales Head House",
      sub: "The Scales' seat on Civic Heights",
      tags: ["Civic Heights", "Gilded Scales", "Trade"], aliases: ["head house", "scales head house", "counting floor", "deposits", "dispatch board", "bank"],
      link: ["Gilded Scales Head House"],
      unlock: "ch_head_named",
      body: function (s) {
        var out = [
          "The Gilded Scales' seat in Port Valen, facing the Council Hall across the plaza on Civic Heights. Brass balance-scales hang over its bronze-banded doors and a gilded river-serpent coils along the lintel. Inside, a vaulted counting floor holds four windows: Deposits and Letters, Writs and Registers, Dispatches, and a shuttered Contracts window."
        ];
        if (truthy(s.ch_head_contracts_talk)) {
          out.push("Contracts are let by appointment, to houses the Scales already trust and companies that have left nothing ugly in the Hall's book and nothing owing in the books.");
        }
        return out;
      },
      see: ["maris_quillon", "corwin_ashe", "entry_writs", "gilded_scales", "letters_of_credit", "civic_heights"]
    },
    {
      id: "maris_quillon", category: "people", title: "Maris Quillon",
      sub: "Teller of Deposits and Letters",
      role: "Teller, Gilded Scales head house",
      link: ["Maris Quillon", "Teller Quillon", "Quillon"],
      tags: ["Civic Heights", "Gilded Scales"], aliases: ["Quillon", "Maris", "teller"],
      unlock: "ch_head_seen",
      body: [
        "A lean woman in a black coat with river-serpent cuffs, who keeps the Deposits and Letters counter with a set of nested lead weights lined up beside her scale. She answers without looking up from her ledger, and her pen does not stop."
      ],
      see: ["scales_head_house", "letters_of_credit"]
    },
    {
      id: "corwin_ashe", category: "people", title: "Corwin Ashe",
      sub: "Registrar of Writs and Registers",
      role: "Registrar, Gilded Scales head house",
      link: ["Corwin Ashe", "Registrar Ashe", "Ashe"],
      tags: ["Civic Heights", "Gilded Scales", "Law"], aliases: ["Ashe", "Corwin", "registrar"],
      unlock: "ch_head_writ_seen",
      body: function (s) {
        var out = [
          "A heavyset man in spectacles and a black coat, ink to the wrist, who keeps the Writs and Registers window. A small clerk in city grey sits beside him with the three-masted seal, so every writ he issues carries two seals."
        ];
        if (truthy(s.ch_head_writ_talk)) {
          out.push("He says a name in the book is one the house will answer for, and that drawing steel in the Quarter without good cause gets it struck from the book inside the hour, with the lockup and the shift bell after that.");
        }
        return out;
      },
      see: ["scales_head_house", "entry_writs"]
    },
    {
      id: "entry_writs", category: "lore", title: "The Writs of Entry",
      sub: "Passing the Inner Gate",
      tags: ["Civic Heights", "Patrician Quarter", "Law"], aliases: ["writ", "writs", "day writ", "registered writ", "sealed writ", "inner gate"],
      link: ["Writs of Entry", "Registered Writ", "Day Writ"],
      unlock: "ch_head_writ_seen",
      body: function (s) {
        var out = [
          "The Patrician Quarter admits only holders of a writ from the Gilded Scales head house, carrying both the Scales' seal and the city's three-masted seal. Day Writs admit their holders briefly; Registered Writs enter a name in the book at the Inner Gate."
        ];
        if (truthy(s.ch_head_writ_talk)) {
          out.push("A name in the book that draws steel in the Quarter without good cause is struck from it inside the hour, and the lockup keeps you until the shift bell. The Quarter's house guards make the arrests; the Council only reads about them.");
        }
        return out;
      },
      see: ["scales_head_house", "corwin_ashe", "upper_wharves"]
    },
    {
      id: "upper_wharves", category: "places", title: "The Patrician Quarter",
      sub: "The quarter of the merchant lords",
      tags: ["Patrician Quarter", "Gilded Scales", "Trade"], aliases: ["merchant quarter", "great houses", "estates", "patricians", "inner gate", "avenue", "upper wharves"],
      link: ["Patrician Quarter"],
      unlock: function (s) {
        return truthy(s.upper_wharves_seen) || truthy(s.pq_gate_seen) || truthy(s.pq_inside_seen) ||
          truthy(s.pq_walk_seen) || truthy(s.pq_tailor_seen) || truthy(s.pq_ink_lamp_seen) || truthy(s.pq_bright_setting_seen) || truthy(s.pq_estates_seen);
      },
      body: function (s) {
        var out = [
          "The road climbs above the lower streets to an inner gatehouse of dressed stone, its arch held by house guards in matching surcoats. A bronze plate beside it reads Entry by Sealed Writ Only, and says that writs are sold at the Gilded Scales head house on Civic Heights."
        ];
        if (truthy(s.pq_inside_seen)) {
          out.push("Past the gate the avenue runs straight and wide between the great houses of the merchant lords: pale stone blocks behind iron-studded gates, each with a courtyard, a counting room on the ground floor and the family's rooms above. Walled estates climb the slope behind them, and a stair at the head of the avenue climbs to the Terrace Walk.");
        }
        if (truthy(s.pq_gate_talk_guards)) {
          out.push("The guards wear the quartered livery of all the houses, who share the cost of the gatehouse and its book. The Watch walks the avenue only when a house sends for it.");
        }
        if (truthy(s.pq_gate_talk_book)) {
          out.push("The gate keeps a book of two columns: names that hold a writ, and names turned away with the reason. Nothing is written against anyone for coming without a writ.");
        }
        if (truthy(s.pq_walk_seen)) {
          out.push("<b>The Terrace Walk.</b> A writ-holders' promenade follows the ridge above the Middle Ward, with a stone rail looking out across the harbor, gates, and river country.");
        }
        return out;
      },
      see: ["entry_writs", "scales_head_house", "alys_threnn", "gilt_needle", "ink_and_lamp", "bright_setting", "civic_heights"]
    },
    {
      id: "alys_threnn", category: "people", title: "Alys Threnn",
      sub: "Gate-Captain of the Inner Gate",
      role: "Gate-Captain, Patrician Quarter (house guard)",
      link: ["Alys Threnn", "Captain Threnn", "Threnn"],
      tags: ["Patrician Quarter", "Law"], aliases: ["Threnn", "Alys", "gate-captain"],
      unlock: "pq_gate_seen",
      body: [
        "A tall, weathered woman in a steel-trimmed surcoat, with grey at her temples and a duelist's stillness, who keeps the Inner Gate's book on a slanted desk under the arch. She serves the houses jointly, not the Watch."
      ],
      see: ["upper_wharves", "entry_writs"]
    },
    {
      id: "the_slasher", category: "lore", title: "The Slasher",
      sub: "The killer the city is afraid of",
      tags: ["Port Valen", "Law"], aliases: ["slasher", "the killings", "the murders", "killer"],
      link: ["Slasher"],
      unlock: "slasher_hook_seen",
      body: function (s) {
        var out = [
          "Seven dead in Port Valen, always at night, always in a back lane, always cut up and left where they fell. The Watch took to calling the killer the Slasher because they had nothing better to call him. Varren says every lead the Watch gets goes cold: witnesses leave town, names belong to dead men, doors stand open one day and are bricked up the next."
        ];
        if (s.slasher_resolution === "arrested") {
          out.push("The killer was Captain Bronner Trent of the city militia. He was taken by the Port Watch at the Drainage Cut, with a woman's comb and papers from his victims in his coat.");
        } else if (s.slasher_resolution === "escaped") {
          out.push("The killer was Captain Bronner Trent of the city militia, who burned his own post and escaped into Dredge-End. The Watch have put out a warrant.");
        }
        return out;
      },
      see: ["bronner_trent", "port_watch", "varren"]
    },
    {
      id: "bronner_trent", category: "people", title: "Bronner Trent",
      sub: "Captain of the militia post on the Trunk Road",
      role: "Captain, city militia",
      link: ["Bronner Trent", "Captain Trent", "Trent"],
      tags: ["Middle Ward", "Law"], aliases: ["Trent", "captain", "militia captain"],
      unlock: "slasher_hook_seen",
      body: function (s) {
        var out = [
          "A captain in the city militia with a post on the Trunk Road. Varren says he served through the war, is loud about wanting the killings solved, and has put out word that he wants hands from outside the Watch and the militia."
        ];
        if (truthy(s.slasher_trent_met)) {
          out.push("A broad, barrel-chested man in a boiled-leather coat in the city's colors, with two horn-handled knives at his belt that are cleaner than anything else in his office. He says the Watch leaks, and that Ulrich of Avir is the killer.");
        }
        if (s.slasher_resolution === "arrested") {
          out.push("He murdered at least seven people and kept something from each. He tried to send hired swords and then a stranger into Avir Manor to have Ulrich killed or framed. The Port Watch took him at the Drainage Cut.");
        } else if (s.slasher_resolution === "escaped") {
          out.push("He murdered at least seven people. When he was confronted he set fire to his own post and ran, and he has not been found.");
        }
        return out;
      },
      see: ["the_slasher", "militia_post", "ulrich_of_avir"]
    },
    {
      id: "militia_post", category: "places", title: "The Militia Post",
      sub: "Captain Trent's post on the Trunk Road",
      tags: ["Middle Ward", "Law"], aliases: ["militia post", "the post", "militia"],
      link: [],
      unlock: "slasher_trent_met",
      body: function (s) {
        var out = [
          "A squat stone building wedged between a wheelwright's and a chandler's on the Trunk Road, older than both, with the city's colors on a pole over the door. A counter and a stove in the front room, and Trent's private office at the back with a lantern hung by the door."
        ];
        if (s.slasher_resolution === "arrested" || s.slasher_resolution === "escaped") {
          out.push("It burned to its beams the day Trent ran. The Council is still arguing about who pays for it.");
        }
        return out;
      },
      see: ["bronner_trent", "trunk_road"]
    },
    {
      id: "ulrich_of_avir", category: "people", title: "Ulrich of Avir",
      sub: "Timber and stone merchant, accused",
      role: "Merchant, Patrician Quarter",
      link: ["Ulrich of Avir", "Ulrich", "Lord Ulrich"],
      tags: ["Patrician Quarter", "Trade"], aliases: ["Ulrich", "Avir", "Lord Ulrich"],
      unlock: "slasher_trent_met",
      body: function (s) {
        var out = [
          "A merchant in timber and stone with a house in the Patrician Quarter and enough money that the watch asks his opinion before it asks for its own. Captain Trent named him as the killer."
        ];
        if (truthy(s.slasher_alibi_known) || truthy(s.slasher_alibi_proof)) {
          out.push("He was at Alderford on timber business through the last three killings and came back to the city only afterward. Receipts from the Factor's Hall there put him thirty miles from the lanes.");
        }
        if (truthy(s.slasher_ulrich_met)) {
          out.push("A lean, sharp-featured man in a wine-colored velvet robe, dry and weary. He says Trent has sent men into his house for a month, and that two of his own letters to the militia command were answered by Trent. He says he will not send for the Port Watch over a housebreaker, if the housebreaker carries his proof to Trent.");
        }
        if (s.slasher_resolution === "arrested") {
          out.push("He has been cleared by Trent's arrest. He says he always has use for capable people.");
        }
        return out;
      },
      see: ["bronner_trent", "avir_manor", "the_slasher"]
    },
    {
      id: "avir_manor", category: "places", title: "Avir Manor",
      sub: "Ulrich of Avir's walled estate",
      tags: ["Patrician Quarter"], aliases: ["Avir Manor", "Avir's house", "the green tower"],
      link: ["Avir Manor"],
      unlock: "slasher_manor_seen",
      body: [
        "A walled estate behind the three great houses of the Avenue of Estates, up its own lane under the pines. A long limestone front under slate roofs, clipped hedges around a dry basin, and a balcony along the upper floor. The crest on the gate is a stone tower on a green hill. Four men in house livery walk the grounds in pairs, and there is a kennel behind the kitchen yard."
      ],
      see: ["ulrich_of_avir", "upper_wharves"]
    },
    {
      id: "deacon_vey", category: "people", title: "Deacon Harl Vey",
      sub: "Keeps the oath desk at the Cathedral",
      role: "Deacon, Cathedral of the True Sun",
      link: ["Deacon Harl Vey", "Harl Vey", "Deacon Vey"],
      tags: ["Civic Heights", "Faith"], aliases: ["Vey", "Harl", "deacon"],
      unlock: "met_deacon_vey",
      body: function (s) {
        var out = [
          "A lean man in a dark gold stole mended at the edge, with ink in the creases of his fingers. He keeps the oath desk near the front pews and gives the cathedral's healing rite, the rite closing what is open."
        ];
        if (truthy(s.slasher_kenny_seen)) {
          out.push("He is tending a dying man in the Althea chapel and says the rite cannot reach what is cracked inside a skull. When the militia sent a clerk for the man's name, he gave the name and kept back the man's fevered shouting.");
        }
        return out;
      },
      see: ["cathedral"]
    },
    {
      id: "pq_terrace_walk", category: "places", title: "The Terrace Walk",
      sub: "A promenade on the ridge",
      tags: ["Patrician Quarter"], aliases: ["terrace walk", "promenade", "the walk", "overlook", "lindens"],
      link: ["Terrace Walk"],
      unlock: "pq_walk_seen",
      index: false,
      body: [
        "A long promenade of pale paving along the crest of the ridge above the Middle Ward, with a waist-high stone rail on the outer side, a row of clipped lindens on the inner, and a lamp-standard every tenth pace. From the rail the city falls away in tiers to the bay, and on a clear day the whole of it can be seen: the harbor and its breakwater, the trunk road and the landward wall with its two gates, the river country beyond, and the heights above.",
        "It is open to writ-holders only, and it is where the merchant families walk to be seen."
      ],
      see: ["upper_wharves", "trunk_road", "middle_ward"]
    },
    {
      id: "pq_house_halloran", category: "factions", title: "House Halloran",
      sub: "A great house of the Patrician Quarter",
      tags: ["Patrician Quarter", "Trade"], aliases: ["Halloran", "green gate", "oak leaf"],
      link: ["House Halloran", "Halloran"],
      unlock: "pq_estates_seen",
      body: function (s) {
        var out = [
          "One of the three great houses on the Avenue of Estates: a tall pair of green-painted iron gate leaves, each worked with a gilt oak leaf whose stem coils into a river-serpent."
        ];
        if (truthy(s.pq_seen_halloran)) {
          out.push("The house's business is timber. Barge-poles stand stacked in the yard behind the gate, the bundled tally-sticks at the porter's window are burned with the same oak leaf, and the slate there reads: At home to callers with the Halloran seal.");
        }
        return out;
      },
      see: ["upper_wharves", "pq_house_vantry", "pq_house_ostrand"]
    },
    {
      id: "pq_house_vantry", category: "factions", title: "House Vantry",
      sub: "A great house of the Patrician Quarter",
      tags: ["Patrician Quarter", "Trade"], aliases: ["Vantry", "blue gate", "silver barge"],
      link: ["House Vantry", "Vantry"],
      unlock: "pq_estates_seen",
      body: function (s) {
        var out = [
          "One of the three great houses on the Avenue of Estates: a gate of blue iron trimmed with silver, with a silver barge under sail worked into the lintel, fine enough that the rigging catches the light."
        ];
        if (truthy(s.pq_seen_vantry)) {
          out.push("The house's business is salt. Wagons of sealed sacks are drawn up in the yard behind the gate, with a pale crust of spilled grit on the stones around the wheels. A man sits on a stool by the porter's window, tasting a pinch from a brass pan, weighing the rest and writing the figures on a slate. Under the figures, in chalk: Salt by the cartload. Cured fish by contract.");
          out.push("Most of the fish cured in the city is cured with salt that came through this gate.");
        }
        return out;
      },
      see: ["upper_wharves", "pq_house_halloran", "pq_house_ostrand"]
    },
    {
      id: "pq_house_ostrand", category: "factions", title: "House Ostrand",
      sub: "A great house of the Patrician Quarter",
      tags: ["Patrician Quarter", "Trade"], aliases: ["Ostrand", "black gate", "brass key"],
      link: ["House Ostrand", "Ostrand"],
      unlock: "pq_estates_seen",
      body: function (s) {
        var out = [
          "One of the three great houses on the Avenue of Estates: a gate of black iron hung with a brass key crossed with a quill."
        ];
        if (truthy(s.pq_seen_ostrand)) {
          out.push("The key and quill above the gate have been polished until they are the brightest thing on the avenue. The house lends and insures, and writes the policy on many of the hulls in the roadstead. There is no slate at its porter's window, only a brass plate: By Appointment Only, and under it, smaller: Loans against Cargo. Marine Policies.");
        }
        if (truthy(s.pq_ostrand_gap_spotted)) {
          out.push("For the slow count of about forty the house's side gate stands unwatched while the guard relief crosses the avenue at the bell. Nobody on the stones remarks on it, and the house guards wear the quartered livery of all of them, so there is no one to ask.");
        }
        if (truthy(s.ysolde_ostrand_told)) {
          out.push("The Carrion's Cadre handler, [[ysolde|Ysolde]], carries the house's name. She says the house set its insurance prices from river charts she drew, and that she left over who was allowed to read them.");
        }
        return out;
      },
      see: ["upper_wharves", "pq_house_halloran", "pq_house_vantry", "ysolde"]
    },
    {
      id: "gilt_needle", category: "places", title: "The Gilt Needle",
      sub: "Tailor to the Quarter",
      tags: ["Patrician Quarter", "Trade"], aliases: ["tailor", "tailors shop", "fitting", "clothing"],
      link: ["Gilt Needle"],
      unlock: "pq_tailor_seen",
      body: function (s) {
        var out = [
          "A narrow shop of dark wood and bow glass near the Inner Gate, marked by a gilt needle threaded with red silk. Bolts of cloth lean in racks to the ceiling, and a long cutting table is spread with paper patterns. Everything is cut to the wearer, and finished garments hang along the walls and sit in glass cases."
        ];
        if (truthy(s.pq_tailor_talk_fine)) {
          out.push("The finest pieces are kept apart under the skylight, with a second line of pale stitching in every seam. There is one of each, finished for one wearer, and they cost a great deal more than the rest of the shop.");
        }
        return out;
      },
      see: ["idris_fenwick", "upper_wharves"]
    },
    {
      id: "idris_fenwick", category: "people", title: "Idris Fenwick",
      sub: "Tailor to the Quarter",
      role: "Master tailor, the Gilt Needle",
      link: ["Idris Fenwick", "Master Fenwick", "Fenwick"],
      tags: ["Patrician Quarter"], aliases: ["Fenwick", "Idris", "tailor"],
      unlock: "pq_tailor_seen",
      body: function (s) {
        var out = [
          "A slight, silver-haired man in a dove-grey coat, with a tape measure looped about his neck and pins along his lapel. He says there is no peg in his shop: everything is cut to the wearer."
        ];
        if (truthy(s.pq_tailor_talk_clients)) {
          out.push("He dresses the great houses, their families, their clerks and their guards' officers, and the occasional captain who has done a house a service and wishes to be seen to have done it. To him a coat is a way of saying whose door you came from.");
        }
        if (truthy(s.pq_tailor_talk_fine)) {
          out.push("He never calls it magic. He calls it the second stitch, worked in red-dyed Quarter silk that does not fray, and says a piece finished that way holds only for the one wearer. He will not say where the thread comes from, and he will not do it twice.");
        }
        return out;
      },
      see: ["gilt_needle", "upper_wharves"]
    },
    {
      id: "ink_and_lamp", category: "places", title: "The Ink & Lamp",
      sub: "Bookseller and licensed scrollwork",
      tags: ["Patrician Quarter", "Trade", "Magic"], aliases: ["bookshop", "bookseller", "scrolls", "maps", "books"],
      link: ["Ink & Lamp"],
      unlock: "pq_ink_lamp_seen",
      body: [
        "A narrow bookshop near the Inner Gate, marked by a brass lamp above a window full of books. Road guides, tide tables, house histories, legal books, copied records, and older works fill its dark shelves. A press, ink pots, and folded maps cover the worktable behind the counter.",
        "A three-locked glass cabinet behind the counter is marked Licensed Scrollwork. Aldren Saye examines and copies magical writing there, and says that a bad copy can hurt someone, ruin a room, or take payment for nothing."
      ],
      see: ["aldren_saye", "upper_wharves"]
    },
    {
      id: "aldren_saye", category: "people", title: "Aldren Saye",
      sub: "Bookseller of the Ink & Lamp",
      role: "Bookseller and licensed arcanist, The Ink & Lamp",
      link: ["Aldren Saye", "Aldren", "Saye"],
      tags: ["Patrician Quarter", "Magic"], aliases: ["bookseller", "arcanist", "scrollwork"],
      unlock: "pq_ink_lamp_seen",
      body: [
        "A lean man with close-cropped black hair, a narrow pale scar across one thumb, and ink marked into the side of one finger. He works beneath a brass lens at the back table of the Ink & Lamp, restoring old writing and examining scrolls before he will sell them.",
        "His manner is careful rather than grand. He keeps rare stock behind the counter, asks what a customer needs before putting it in their hands, and insists that a spell on paper has to be tested before it can be trusted."
      ],
      see: ["ink_and_lamp", "upper_wharves"]
    },
    {
      id: "bright_setting", category: "places", title: "The Bright Setting",
      sub: "Jeweler and appraiser to the Quarter",
      tags: ["Patrician Quarter", "Trade"], aliases: ["jeweler", "jewellery", "jewelry", "rings", "chains", "appraiser"],
      link: ["Bright Setting"],
      unlock: "pq_bright_setting_seen",
      body: [
        "A small jeweler's shop near the Inner Gate, marked by a faceted-stone sign. Rings, brooches, chains, carved stones, and worked gold sit one piece to a card in felt-lined glass cases. A rear bench carries fine files, tongs, a charcoal brazier, a balance, and a black touchstone used to test metal.",
        "Cassia Rell makes and repairs jewelry, weighs metal, and assesses a piece's material and condition. She will stand behind a price, but refuses to judge magic or decide who legally owns an object."
      ],
      see: ["cassia_rell", "upper_wharves"]
    },
    {
      id: "cassia_rell", category: "people", title: "Cassia Rell",
      sub: "Jeweler of the Bright Setting",
      role: "Jeweler and appraiser, the Bright Setting",
      link: ["Cassia Rell", "Cassia", "Rell"],
      tags: ["Patrician Quarter", "Trade"], aliases: ["jeweler", "appraiser", "goldsmith"],
      unlock: "pq_bright_setting_seen",
      body: [
        "A broad-shouldered woman with copper-brown skin, cropped black curls, and a magnifying loupe habitually braced before one dark eye. She works from the rear bench of the Bright Setting, where every tool has a fixed place.",
        "Cassia speaks plainly about the limits of her work. She can test metal, inspect stones, repair a setting, and offer a price her shop will stand behind; a magical property or disputed ownership belongs with someone else."
      ],
      see: ["bright_setting", "upper_wharves"]
    },
    {
      id: "civic_heights", category: "places", title: "Civic Heights",
      sub: "The council and the cathedral",
      tags: ["Civic Heights", "Law"], aliases: ["council hall", "tax hall", "courts", "cathedral", "records house"],
      link: ["Civic Heights"],
      unlock: function (s) {
        return truthy(s.civic_heights_seen) || truthy(s.ch_hall_seen) || truthy(s.ch_court_seen) ||
          truthy(s.ch_records_seen) || truthy(s.cath_seen) || truthy(s.pw_seen) || truthy(s.ch_head_seen);
      },
      body: function (s) {
        var out = [
          "The road from the Middle Ward ends at a broad plaza of cut limestone, and the buildings change from timber to stone. The Council Hall stands at its head, tall-windowed and long-winged, with the tax windows and the Hiring Hall in its east wing and the Port Watch headquarters beside its west wing. Painted boards mark the public windows, where people wait beneath the eaves.",
          "The cathedral rises above the Council Hall's roofline on an older foundation, its bells carrying over every district. Charity kitchens cluster around its steps, and people in thin, mended clothes queue there."
        ];
        if (truthy(s.ch_court_seen)) {
          out.push("<b>The Magistrates' Court.</b> The Council Hall's west wing holds a public courtroom, where a raised oak bench faces the witness stand and a low dock beside a barred stair.");
        }
        return out;
      },
      see: ["hiring_hall", "council", "port_watch", "middle_ward"]
    },
    {
      id: "magistrates_court", category: "places", title: "The Magistrates' Court",
      sub: "The courtroom in the Council Hall's west wing",
      tags: ["Civic Heights", "Law"], aliases: ["court", "courts", "courtroom", "magistrates", "magistrate", "dock", "bench"],
      link: ["Magistrates' Court"],
      unlock: "ch_court_seen",
      index: false,
      body: [
        "A tall limestone courtroom behind the west arch of the Council Hall, with a raised bench of dark oak under the city's three-masted seal, a clerk's table, a railed witness stand, and a low railed dock beside a barred door at the top of a narrow stair that goes down into the dark. Rows of public benches face the bar.",
        "It sits from Seventh Bell until noon, and in the afternoon the iron gate across the west arch is drawn shut. Cases are heard in the order they were filed, at the Hiring Hall or at the Watch's duty desk, and anyone may sit on the public benches and listen."
      ],
      see: ["council", "hiring_hall", "port_watch_hq"]
    },
    {
      id: "trade_licence", category: "lore", title: "The Trade Licence",
      sub: "Leave to sell by the load",
      tags: ["Civic Heights", "Trade", "Law"], aliases: ["licence", "license", "trade licence", "tax windows", "long counter", "taxes"],
      link: ["Trade Licence"],
      unlock: "ch_tax_seen",
      body: function (s) {
        var out = [
          "Two tax windows serve the Council Hall's east wing. The long counter, with its long queue in plain coats, sells and renews the Trade Licence, a paper entered on the city's records that lasts a set number of days and can be extended. The side window has its own private door, where clerks in river-serpent colors pass in leather cases and take out folded receipts."
        ];
        if (truthy(s.ch_tax_licence_talk)) {
          out.push("The licence is the Council's leave to sell goods by the load at the Weigh House. Without one, the Weighmaster will weigh a cart and no more, and the holder's name goes on the records.");
        }
        return out;
      },
      see: ["council", "weigh_house", "entry_writs", "hiring_hall"]
    },
    {
      id: "hiring_hall", category: "places", title: "The Hiring Hall",
      sub: "Public contracts in the Council Hall",
      tags: ["Civic Heights", "Law", "Trade"], aliases: ["records house", "contracts", "postings", "hiring", "claims", "wages", "job board", "work"],
      link: ["Hiring Hall"],
      unlock: "ch_records_seen",
      body: function (s) {
        var out = [
          "A long stone hall in the east wing of the Council Hall on the Civic Heights plaza. Hirers post the terms of their contracts on wooden frames along the walls, each sealed by the patron and stamped with the city's three-masted seal. Carved over the lintel: <i>What is not in the records does not exist in the world.</i> Sellswords, guards, drivers and hired hands read the postings here and wait for the Postings, Claims and Seals windows."
        ];
        if (truthy(s.ch_roll_rules_talk)) {
          out.push("In Port Valen a hire is not a hire until both seals are on the posting, the patron's and the city's. The rule is the same for guilds, the Scales and a widow hiring a door-warden. The courts will not enforce a promise that is not posted.");
        }
        if (truthy(s.ch_roll_claims_talk)) {
          out.push("A worker who was not paid files a claim at the Claims window with a copy of the posting. If the terms are posted, the court can order the patron to pay. If they are not posted, there is nothing to file.");
        }
        if (truthy(s.ch_roll_deeds_talk)) {
          out.push("A fourth window, Deeds, stands behind a permanent iron shutter. A house changes hands on the records or not at all, and the window opens when there is a sale to witness.");
        }
        if (truthy(s.ch_seals_talk)) {
          out.push("The Seals window issues the Hall's insignia: a palm-sized brass disc with the wearer's name, rank and the terms of everything they sign worked into the metal. A copy of the shape reads blank. It is the same disc in every kingdom and only its pages differ: each government writes its own rank onto it, and some honor each other's.");
        }
        if (truthy(s.ch_seals_ranks_talk)) {
          out.push("The Scales keep four ranks, and the Hall only works the brass. In order: Open, Bonded, Sealed and Named.");
        }
        return out;
      },
      see: ["tolliver", "civic_heights", "gilded_scales", "letters_of_credit"]
    },
    {
      id: "silt_gates", category: "places", title: "The Silt-Gates",
      sub: "Drainage channels under the slums",
      tags: ["Dredge-End", "Law"], aliases: ["silt gates", "channels", "channel", "drainage", "contraband", "smuggling"],
      link: ["Silt-Gates"],
      unlock: function (s) { return s.silt_gate_quest_stage && s.silt_gate_quest_stage !== "unstarted"; },
      body: function (s) {
        var out = [
          "The canal drainage conduits beneath the Dredge-End slums. The harbor's outer boom chains are locked tight, so the contraband is not coming through the main channel: it slips into the conduits instead. Any patrol the Watch sends into the canals is spotted by rooftop lookouts with tin whistles, and the boatmen dump the crates into ten feet of river sludge before it gets within three hundred paces.",
          "Half the night sergeants working the stretch are said to take weekly hush-money to walk their beats on the far side of the canal when the tide rises."
        ];
        if (s.silt_gate_resolution === "leverage") {
          out.push("You interrupted the drop but did not break the run. The crates stayed on the platform for the tide or the Watch to deal with, and what you carried up the ramp was a strip of wax vellum in the broker's own hand, with a rate written beside each name: six silver marks a Marketday for the north quay.");
          if (truthy(s.kestrel_watch_leverage)) {
            out.push("You took it to [[kestrel|Kestrel]] and not to the dockmaster. She holds the names of the paid sergeants now, and has not used them.");
          }
        }
        return out;
      },
      see: ["voss", "port_watch", "dredge_end", "black_oath"]
    },

    /* ---------------------------------------------- INSTITUTIONS, LAW AND CUSTOM */

    {
      id: "council", category: "factions", title: "The Council of Port Valen",
      sub: "The city's ruling council",
      tags: ["Civic Heights", "Gilded Scales", "Law"], aliases: ["council of factors", "free city", "Free City", "council hall", "plutocracy", "tax hall"],
      link: ["Council of Factors", "Council Hall", "Free City of Port Valen"],
      unlock: "civic_heights_seen",
      body: function (s) {
        var out = [
          "Port Valen calls itself a free city, and its ruling council sits in the Council Hall on Civic Heights, under a bronze balance-scale and the carved words <i>The Free City of Port Valen</i>. Each door on the plaza bears the city's three-masted seal.",
          "Two lines run at the tax windows in the east wing. The long one winds out the door and down the steps. The other is a side window with no line at all, where clerks in river-serpent colors hand in leather cases and take out stamped receipts."
        ];
        if (truthy(s.ch_hall_seen)) {
          out.push("The Council Hall is the one grand civic building on the plaza. Inside its bronze-banded doors a limestone concourse runs the width of the building, with the Hiring Hall through the arch at the east end, an iron-gated arch at the west end, and a stair to an upper floor behind a red cord. It is open from Seventh Bell until the evening horn, and shut on Hallowday.");
        }
        if (truthy(s.ch_court_seen)) {
          out.push("The west arch opens on the magistrates' court, which sits from Seventh Bell until noon; in the afternoon the iron gate across the arch is drawn shut.");
        }
        if (truthy(s.ch_gal_board_seen)) {
          out.push("The Council sits every tenth day, from Noon until the evening horn, and on the next day if the tenth falls on Hallowday. A board at the foot of the stair gives the next sitting, and petitions for a sitting must be filed at the Hiring Hall ten days before it.");
          out.push("Twelve houses sit on the Council of Factors, each by its Factor and a deputy. The Chair of the Council passes to the next house each year, and the First Factor answers to the Council.");
        }
        if (truthy(s.ch_gal_seen)) {
          out.push("A public gallery of dark oak runs around three sides of the round-ended chamber, over a horseshoe of high-backed chairs painted with the crests of the great houses, a long table on a dais, and a great carved balance-scale. A plain chair with no crest stands at the foot of the dais, where a person in a black coat with river-serpent cuffs sits apart from the rest. The public may sit and watch but not speak. Each petitioner at the rail gets a sand-glass, and a person in a heavy chain in the central chair answers with a word, often \"Heard.\"");
        }
        return out;
      },
      see: ["gilded_scales", "civic_heights", "port_watch", "alderford", "trade_licence"]
    },
    {
      id: "auction_block", category: "history", title: "The Auction Block",
      sub: "How the Slip sells its catch",
      tags: ["Fishmongers' Slip", "Trade", "Law"], aliases: ["auction", "block", "warden", "slip-warden", "bidding", "auctioneer", "ring"],
      unlock: "fish_met_wenna",
      body: [
        "Inshore catch goes through the block: boats are hauled up the rollers at first light, their baskets tipped out in a row on the wet stone, and an auctioneer with a hand-bell and a slate cries each lot to a half circle of buyers. It is the slip-warden's rule, and it keeps the boats honest.",
        "It does not keep the buyers honest. When nobody bids, someone has already agreed on the price, and there is no law against nobody wanting a widow's fish."
      ],
      see: ["fishmongers_slip", "wenna", "thale"]
    },
    {
      id: "wreck_law", category: "history", title: "Harbor Wreck Law",
      sub: "Wreck-goods and finder's shares",
      tags: ["Law", "Pier"], aliases: ["wreck-goods", "finder's share", "salvage", "cargo", "casks", "impound"],
      unlock: "codex_wreck_law",
      body: [
        "Untaxed cargo from a vessel wrecked on the outer bar, with no marker and no papers, is wreck-goods under harbor law. The crown takes the cargo and the finder takes a share. The skiff's master takes a fine, and the boat sits in the impound yard until it is paid."
      ],
      see: ["voss", "pier", "port_watch"]
    },
    {
      id: "debtor_crews", category: "history", title: "The Debtor Crews",
      sub: "Bonded labor in the channel",
      tags: ["Gilded Scales", "Law", "Iron Wharves"], aliases: ["debtor", "workhouse", "bonds", "debt", "chained", "interest"],
      unlock: "pv_tavern_rumor_3",
      body: [
        "A tavern story that older men tell as fact: debtor crews chained out in the channel off the Iron Wharves, their bonds held in the Gilded Scales' counting houses and renewed every quarter-day. When the interest comes due, the old man insists, you can hear them singing to the tide."
      ],
      see: ["gilded_scales", "iron_wharves", "orlov", "letters_of_credit"]
    }

  ]);
})();
