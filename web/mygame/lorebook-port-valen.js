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
        "The standard stake is four copper bits. His copper is as good as any porter's, and he says so."
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
          "An old shipwright in a tar-stained leather apron who works Slipway Two, moving along the ribs of a seventy-foot merchant hull with a short-handled iron mallet and listening to each note. His apprentices call him Master Brant, and they fear the factor's fines."
        ];
        if (truthy(s.has_rotten_rib_splinter)) {
          out.push("Under his mallet the third rib rings clean iron and the fourth gives back a flat, sodden thud. The oak in Bay Four's delivery was green, and he wants somebody to know it before the ship is launched on it.");
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
      body: [
        "The clerk who runs the yard office up on stilts behind the sawpits. Every load that passes through the yard gets his initials. Brant's warning about the yard: whatever sits still too long grows legs."
      ],
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
      body: [
        "A buyer in good leather gloves who owns two of the Slip's smokehouses. The other two buyers eat at his table, and when he lifts two fingers to the brim of his cap, nobody bids against him.",
        "There is no law against nobody wanting a widow's fish, and the slip-warden says so."
      ],
      see: ["wenna", "auction_block", "fishmongers_slip"]
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
        "A crisp, no-nonsense landlady. Two silver marks buy seven days: clean straw, a dry roof, quiet stairs, and Master Vael's deadbolts on every door.",
        "No blood in her hallway, no thieves under her rafters, and no Watchmen asking questions, so long as the coin hits the tin on time."
      ],
      see: ["terrace_lodgings", "vael", "middle_ward"]
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
      id: "vael", category: "people", title: "Master Vael",
      sub: "Locksmith, Locksmiths' Close",
      role: "Locksmith, Vael & Son",
      link: ["Master Vael"],
      tags: ["Middle Ward"], aliases: ["Vael", "locksmith", "locks", "keys"],
      unlock: "met_vael",
      body: [
        "A lean craftsman with measuring tools tucked into his leather apron and fine brass dust on his knuckles, who files brass pieces inside a heavy lock and tests it with a crisp snick. His sign reads: Locks Warranted Against Pick and Wedge. Replacement Keys: Three Copper Bits.",
        "The deadbolts on every door at Terrace Lodgings are his work."
      ],
      see: ["kess", "terrace_lodgings", "middle_ward"]
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
      see: ["lantern_lane", "middle_ward", "vael", "marda", "ambrose", "kess"]
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
        if (truthy(s.mw_halda_trade_talk)) {
          out.push("She pays for old steel by weight and by edge: sound steel by the pound, and more for a good edge. Rust she can grind off, but she will not mend cracked steel. It goes in the scrap bin at scrap price, and she says so to your face. What she sells comes with the same promise: a straight edge and no hidden flaws, or you bring it back.");
        }
        if (truthy(s.mw_halda_mend_talk)) {
          out.push("She mends blades, helmets, tools and cartwheel rims, and mail by the link. A bent helmet she knocks straight, and a split shield she sends to the carpenter. Anything cracked through the middle she will not touch.");
        }
        if (truthy(s.mw_halda_steel_talk)) {
          out.push("The best steel in the country came out of the Highland Crags, and hardly any of it comes down now. Karr's bailiffs taxed the Crag forges half out of business, and the smiths who could leave did. She has heard that a Crag dwarf set up at the weir in Alderford.");
        }
        if (truthy(s.mw_rumor_steel)) {
          out.push("Rumor from the baths: half a wagon-load of Crag steel is sitting in a shed in Alderford, and no carter will haul it down while the bailiffs work the highway.");
        }
        return out;
      },
      see: ["smiths_row", "middle_ward", "iron_bailiffs", "broken_crags", "torvald"]
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
          "A tall, thin woman in a spotless grey apron, with hands red and cracked from lye. She keeps the Conduit Baths from a small desk inside the door, where three copper bits buy a soak, a warm towel, and a cake of lavender soap. Whatever a visitor carries that cuts, crushes, or shoots goes on the rack by the door until they leave."
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
      sub: "Clerk of the Open Roll",
      role: "Clerk, Postings window, the Open Roll (the Council Hall)",
      link: ["Clerk Tolliver"],
      tags: ["Civic Heights", "Law"], aliases: ["Tolliver", "clerk", "roll clerk", "postings"],
      unlock: "ch_records_seen",
      body: function (s) {
        var out = [
          "A broad-shouldered clerk in a dark grey coat and a matching cap, with a straight back and the flat, carrying voice of a man who reads other people's terms aloud all day. He keeps the Postings window at the Open Roll. Reading the wall is free. Signing costs."
        ];
        if (truthy(s.ch_roll_rules_talk)) {
          out.push("To him the Roll is the law and not a courtesy, and the words carved over the lintel are there so nobody can say they did not see them.");
        }
        if (truthy(s.ch_roll_claims_talk)) {
          out.push("He has a low opinion of people who reach the Claims window without reading the wall first. Most of them, he says, did not.");
        }
        return out;
      },
      see: ["open_roll", "civic_heights"]
    },

    /* ------------------------------------------------------------- PLACES: THE CITY */

    {
      id: "carrion_compound", category: "places", title: "The Carrion Compound",
      sub: "The company's rented home base",
      tags: ["Port Valen", "Iron Carrion"], aliases: ["compound", "barracks", "mess", "headquarters"],
      link: ["Carrion Compound"],
      unlock: "port_valen_hub_seen",
      body: [
        "The fortified compound the Iron Carrion rents near the Iron Wharves. The company returns here between contracts to collect pay, repair equipment, and recruit replacements. Recruits sleep on bedrolls in the barracks, and the company mess serves plain fare from the stores awning.",
        "It is a headquarters, not a fief. The company owns no land and can be driven elsewhere whenever its contracts or enemies demand it."
      ],
      see: ["iron_carrion", "vane", "iron_wharves"]
    },
    {
      id: "harbor_quayside", category: "places", title: "Harbor Quayside",
      sub: "The waterfront",
      tags: ["Quayside", "Port Valen"], aliases: ["quayside", "harbor", "docks", "waterfront"],
      link: ["Harbor Quayside"],
      unlock: "port_valen_harbor_seen",
      body: [
        "One long line of stone and timber along the estuary: the fish market's granite ramp and the low wooden taverns at the western end, the cargo quay with its slips and massive balance cranes, a squat customs tower where the road down from the terraces meets the quay gate, then the shipyard wall and a long stone breakwater running out toward the bar. Deep-hulled merchant vessels ride at anchor in the outer roadstead, while flat-bottomed river barges and fishing smacks crowd the inner docks.",
        "From west to east the quayside holds the Fishmongers' Slip, the Cleaved Keel, the Cargo Quay with its long grey hall under an iron beam-scale and the customs tower at its end, the shipwrights' ways of the Iron Wharves, and the long pier out to the wreck-bell. Most of it shuts at dusk."
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
        "The cargo quay runs from the taverns by the fish market toward the customs tower, and it is one long argument conducted in stamped parchment. Guild clerks in the river-serpent colors of the Gilded Scales move crate to crate with wax tablets, while Port Watch officers walk the line with cudgels slung but visible.",
        "Midway along it stands a long hall of grey stone under a great iron beam-scale. The registry box stands under the customs tower at its end, where the dockmaster's lamp burns in the window. Crane three, on the cargo line, takes day labor."
      ],
      see: ["voss", "dell", "gilded_scales", "port_watch", "weigh_house"]
    },
    {
      id: "weigh_house", category: "places", title: "The Weigh House",
      sub: "The city's scales on the cargo quay",
      tags: ["Quayside", "Trade"], aliases: ["weigh house", "weigh-house", "beam-scale", "scale house", "slate", "price boards"],
      link: ["The Weigh House", "Weigh House"],
      unlock: "wh_named",
      body: function (s) {
        var out = [
          "A long hall of grey stone midway along the cargo quay, with cart doors wide enough for a laden dray and a great iron beam-scale hung from its gable. Cut into the lintel is the line One Weight for All. Inside are platform scales sunk in the floor, racks of brass weights, and a wall of black boards ruled in columns, one for each good the port handles.",
          "It opens at Seventh Bell, stays open in bad weather, and shuts at the evening horn and on Hallowday. A chalkboard on a post by the doors gives tomorrow's weather."
        ];
        if (truthy(s.wh_floor_talk)) {
          out.push("Goods are weighed here by the load, on the city's standard weights, before they are bought or sold, and a load on a cart may be brought to the scale. Fresh fish is not weighed here: the Fishmongers' Slip keeps its own market.");
        }
        if (truthy(s.wh_slate_talk)) {
          out.push("Wet wool and wet grain weigh heavier than dry, so a merchant who knows tomorrow's weather knows what his load will weigh. The same forecast is pinned to the board at the Gilded Scales head house on Civic Heights.");
        }
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
      body: function (s) {
        var out = [
          "A stout, bald man in a grey coat and a leather apron, with a brass plumb-bob on a cord at his belt and chalk to the elbows, who keeps the great scale from a low platform beside it. He says nothing leaves his floor unweighed and nothing on it is weighed twice."
        ];
        if (truthy(s.wh_hull_talk)) {
          out.push("He leaves hulls, papers and duties to the Dockmaster at the customs tower and weighs what comes off them.");
        }
        return out;
      },
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
        "Every hull on the ways has a crew's name chalked on its cradle and a fine written under it. The yard gate is chained at dusk and in a storm."
      ],
      see: ["brant", "hendryk", "gilded_scales", "carrion_compound"]
    },
    {
      id: "pier", category: "places", title: "The Pier",
      sub: "The breakwater to the outer bar",
      tags: ["Pier", "Quayside"], aliases: ["pier", "breakwater", "wreck bell", "bell", "reef", "bar", "jetty"],
      link: ["Wreck-Bell", "wreck-bell"],
      unlock: "pv_pier_seen",
      body: [
        "A long stone breakwater that runs out over the shoals toward the outer bar. At its head stand a jetty crane and a gallows-frame, and beyond the last stone a bronze bell on the reef counts the surge in slow strokes.",
        "At its landward end a small iron-hooded shrine, the Tide-Well, stands beside the landing stairs.",
        "Names of the lost are scratched into the frame post at every height a hand can reach, with no list and no keeper: whoever loses someone to the bar adds a mark, and whoever passes touches one. Skiffs tie off along the lower stone ladders."
      ],
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
        "The market is open from before dawn through the afternoon, and shuts at dusk and in a storm. The dawn auction is the heart of it, with fried smelt, oysters and fish-and-onion pasties for sale at the stalls."
      ],
      see: ["auction_block", "wenna", "thale", "harbor_quayside"]
    },
    /* ----------------------------------------------------------- PLACES: DISTRICTS */

    {
      id: "dredge_end", category: "places", title: "Dredge-End",
      sub: "The flooded low district",
      tags: ["Dredge-End", "Black Oath"], aliases: ["slums", "canals", "silt basin", "tenements"],
      link: ["Dredge-End"],
      unlock: "dredge_end_seen",
      body: function (s) {
        var out = [
          "The city's paving stops at the drainage cut. Past it the lanes are broken stone and packed cinder, with planks laid over the low patches where the ground gives up. Dredge-End sits under the river's high-water line, its tenements standing on tarred pilings with rope gangways strung between them.",
          "It is Black Oath country. The Watch seldom comes down to the canals on a market day, and trade settles with sharp elbows and quick fingers."
        ];
        return out;
      },
      see: ["black_oath", "silt_gates", "duckboard_market", "upper_gangways", "boat_sheds", "dredge_landing", "lamp_stair", "corve", "alley_shrine", "flooded_steps", "port_valen"]
    },

    /* ----------------------------------------------- DREDGE-END: THE SEVEN AREAS */

    {
      id: "duckboard_market", category: "places", title: "Duckboard Market",
      sub: "The market lane along the water-lane",
      tags: ["Dredge-End"], aliases: ["market", "stalls", "chandler", "eel-seller", "awnings"],
      link: ["Duckboard Market"],
      unlock: "cut_seen_market",
      body: function (s) {
        var n = Number(s.cut_rumors_market) || 0;
        var out = [
          "The market lane along the water-lane: broken stone and packed cinder, with planks laid over the low patches where the water comes up. Stalls stand under patched oilskin awnings in yellow and red, punts nose in from the canal side, and the lane smells of frying eel, lamp oil and wet rope. At the landward end a chandler's shop sells wax, rope and lamp oil from behind a half-door, and an outside stair beside it climbs to a shut door on the upper floor."
        ];
        if (n >= 1) {
          out.push("The eel-seller is said to keep a shaved coin under her pan. Hers are the only eels before noon, so the lane buys from her anyway.");
        }
        if (n >= 2) {
          out.push("The chandler's upper room is said to have candles burning in it at all hours and has never been seen rented. The man on the bottom step of the stair calls it stores: wax and paper, not for rent.");
        }
        if (n >= 3) {
          out.push("A tailor's apprentice has had his purse lifted three Marketdays running, and still keeps it in the same pocket.");
        }
        return out;
      },
      see: ["dredge_end", "upper_gangways", "black_oath"]
    },
    {
      id: "upper_gangways", category: "places", title: "Upper Gangways",
      sub: "Rope bridges over the trenches",
      tags: ["Dredge-End"], aliases: ["gangways", "rope bridges", "landings", "lookouts", "tin whistles"],
      link: ["Upper Gangways"],
      unlock: "cut_seen_gangways",
      body: function (s) {
        var n = Number(s.cut_rumors_gangways) || 0;
        var out = [
          "Walkways of plank and cord that run from stilt landing to stilt landing above the trenches, reached by ladder-stairs through the tenements' back walls. Lookouts sit on the larger landings with tin whistles hung at their belts, watching the lanes, the water-lane and the footbridge. From the lookout landing the whole district lies below, and above the seawall the city climbs in terraces to the pale limestone of Civic Heights."
        ];
        if (n >= 1) {
          out.push("The lookouts pass word between landings in whistles, a long, a short, a long, and now and then a plain word across a gap: boat, face, watch. Asked what they watch for, one said boats, faces and the Watch, in that order on a good day.");
        }
        if (n >= 2) {
          out.push("From a window below the gangways a woman's voice goes through a list of amounts while another voice answers yes to each. The counting stopped at one figure, and nobody answered that one.");
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
      body: function (s) {
        var n = Number(s.cut_rumors_scrap) || 0;
        var out = [
          "Sheds on stilts line the canal with their doors open to the water and racks of half-shaped ash oars under the eaves. The ground between them is trampled cinder scattered with wood shavings. Further along is a fenced scrap yard of salvaged stone, coiled chain and plate iron, and a smith's bench under a lean-to. On Forgeday the yard is busy with chain coming off punts, and the smith's hammer carries across the canal."
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
        return out;
      },
      see: ["boat_sheds", "dredge_end"]
    },
    {
      id: "dredge_landing", category: "places", title: "Dredge Landing",
      sub: "Where the canal gives up its spoil",
      tags: ["Dredge-End"], aliases: ["landing", "dredgers", "spoil", "barges", "foreman"],
      link: ["Dredge Landing"],
      unlock: "cut_seen_landing",
      body: function (s) {
        var n = Number(s.cut_rumors_landing) || 0;
        var out = [
          "A wide shelf of hard-packed cinder where the canal widens, with three low barges tied along its edge. Dredgers haul black spoil up in baskets with hooked poles and iron scoops on chains and tip it onto long mounds that dry to a crust on the bank. It can only be worked at low water."
        ];
        if (Number(s.cut_labor_day) > 0) {
          out.push("The foreman pays a few copper marks for four hours on the poles, and less for a spilled basket.");
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
          "A private house built into the granite base of the seawall on Lamp Stair, marked by a small brass plate reading \"Widow Corve's\" and twin lanterns with deep red bullseye glass burning over the door. It keeps dusk-to-pre-dawn hours and stands barred through the day. Past the felt curtain, a heated parlor smells of dried lavender, applewood coals and spiced wine, and every woman working the floor does so under the house's own leasehold, not anyone else's.",
          "A mug of hot wine by the stove costs little and buys company for the evening; an hour upstairs with one of the parlor's regulars costs more. Regulars say the wine does a man sleeping too many nights running in the same rough cot more good than it ever does his thirst. Whoever holds the leasehold is never seen and never named -- she doesn't need to know a customer's."
        ];
        return out;
      },
      see: ["dredge_end", "lamp_stair", "sable", "brinna"]
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
          "A timber arch black with tallow smoke over a small carved figure in a veil, its face worn smooth by hands, with ALTHEA scratched into its base. Strips of old linen are tied along the arch, and a clay bowl at the figure's feet holds river pebbles and candle stubs. An iron hook holds a broth pot. On Hallowdays a friar in a patched habit of undyed wool ladles thin pea broth to the district's poorest, while men in boiled leather stand at the alley mouth checking faces against a roll of names. The shrine is Saint Althea's, the mender the frontier prays to, and the district keeps it in tallow where the Middle Ward keeps its own saint's shrine in beeswax."
        ];
        if (n >= 1) {
          out.push("The tin tray is emptier every month. People have no candles to spare, and light one for the ones who did not come back and none for themselves.");
        }
        if (n >= 2) {
          out.push("The arch is older than the lanes. They were built around it, like everything else here that was already sinking. The bishops up the hill sing to Althea's father, an old man said. Down here they still pray to her: she mended things, and he only swears them.");
        }
        if (truthy(s.cut_shrine_gave)) {
          out.push("A woman on the step said the friar does not keep what goes in the bowl. It goes to whoever is on the list that week, and she told you to ask him who.");
        }
        return out;
      },
      see: ["saint_althea", "dredge_end", "black_oath"]
    },
    {
      id: "flooded_steps", category: "places", title: "Flooded Lower Steps",
      sub: "The seawall stair and its cellars",
      tags: ["Dredge-End"], aliases: ["lower steps", "cellars", "flophouse", "flophouses", "tide marks"],
      link: ["Flooded Lower Steps"],
      unlock: "cut_seen_lower_steps",
      body: function (s) {
        var n = Number(s.cut_rumors_steps) || 0;
        var out = [
          "A broad flight of stone steps down the side of the seawall into the canal. At low water the lower half stands out of the water, black and hung with green weed, with cellar doors opening off the landings, some boarded and some with a rag hung in the gap. It is under water when the tide is high."
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
      unlock: "mw_seen",
      body: function (s) {
        var out = [
          "The road climbs in turns from the docks and levels out onto the Second Terrace, the broad shelf of flat ground that holds most of the city, with the lower streets falling away toward the harbor behind it and Civic Heights and the Patrician Quarter rising in tiers ahead. It is the largest ward in Port Valen. Timber buildings lean over narrow lanes beneath steep slate roofs, their lower shutters open as shop counters, and the air smells of cooled iron, brass dust, cedar sawdust and warm caraway bread.",
          "Conduit Square, with its octagonal fountain and four bronze lion-head spouts, is the crossroads: the trunk road that carries the city's traffic runs through it, east and west toward the great gates in the landward wall, and down the switchbacks to the harbor. Lanes branch to the Locksmiths' Close, Lantern Lane and Smiths' Row, and Herb-Pounder Close is a dead-end at the head of Lantern Lane. A short way along the trunk road, an inn hangs a white wagon wheel over its door. A communal oven feeds the ward, and a public wash-house with baths stands behind the square."
        ];
        if (truthy(s.mw_rumor_grain)) {
          out.push("Rumor from the baths: a Council grain officer waves unlicensed flour wagons through Conduit Square on Marketdays for a small payment slip, so the licensed drivers end up paying twice, once in fees and once in waiting.");
        }
        return out;
      },
      see: ["lantern_lane", "smiths_row", "conduit_baths", "terrace_lodgings", "marda", "vael", "ambrose", "hollis", "halda", "merrin", "civic_heights"]
    },
    {
      id: "lantern_lane", category: "places", title: "Lantern Lane",
      sub: "The Middle Ward's shopping street",
      tags: ["Middle Ward", "Trade"], aliases: ["shops", "shopping street", "general store", "counters", "stalls"],
      link: ["Lantern Lane"],
      unlock: "mw_lantern_seen",
      body: function (s) {
        var out = [
          "A curving lane that climbs from Conduit Square under deep timber eaves, with an iron bracket for a horn lantern over every shop door. Rope, tin pans, blankets, cloth, boots, candles, lamp oil, paper and ink are sold from small shops and open counters. Hollis & Daughters General Goods has the widest front. At the head of the lane, a gap between two workshops leads into Herb-Pounder Close, where Master Ambrose keeps his still-room.",
          "The shops open in daylight and close at dusk. On the holy day and in a blizzard the shutters stay barred."
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
      body: function (s) {
        var out = [
          "A cobbled yard at the lower end of the Middle Ward, where the harbor road climbs in. Three forges stand under open sheds around a stone water trough, with racks of finished blades, helmets and tools along the walls. Iron bars and coal come up from the harbor by wagon. A cooper's bench at the far end still makes barrels for the ward.",
          "The forges work in daylight and bank their fires at dusk. On the holy day and in a blizzard the sheds stay barred."
        ];
        if (truthy(s.mw_halda_forges_talk)) {
          out.push("Three forges, three masters, one water trough. Halda does edges, the middle shed does wheel rims and nails, and the far one hammers out tin pots and tools for the ward's trades.");
        }
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
          "A covered yard behind Conduit Square, where copper tubs sit on charcoal fires under long shed roofs and steam rolls out into the lanes. At the far end a low stone building holds the Conduit Baths, fed by a lead pipe from the conduit. A soak costs three copper bits, with a warm towel and scented soap.",
          "The yard is busiest on Greyday, which is washday. It stays open into the evening for people coming off work, and it is closed at night and on the holy day."
        ];
        if (truthy(s.mw_merrin_water_talk)) {
          out.push("The water is heated by boilers built into the back wall of Mother Marda's ovens.");
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
      body: [
        "The four-storey limestone front of a boarding house at the end of the Locksmiths' Close, its thick wooden door fitted with a teardrop-shaped knocker. Rooms let by the week, with Mistress Kess collecting the rent and a locksmith's deadbolt on every door."
      ],
      see: ["kess", "vael", "middle_ward"]
    },
    {
      id: "wagoners_rest", category: "places", title: "The Wagoner's Rest",
      sub: "An inn on the trunk road",
      tags: ["Middle Ward"], aliases: ["inn", "wagoner's rest", "stables", "stable yard", "room for the night"],
      link: ["The Wagoner's Rest", "Wagoner's Rest"],
      unlock: "mw_inn_seen",
      body: function (s) {
        var out = [
          "A long two-storey inn of grey stone and dark timber on the trunk road, marked by a white-painted wagon wheel over its door. It lets rooms by the night for " + (s.mw_inn_rate_copper || 5) + " copper bits, with a low beamed hall, a stair to the rooms above, and behind an archway a cobbled yard with a stable range and a cart shed."
        ];
        if (truthy(s.mw_inn_talk_house)) {
          out.push("One guest to a room. The key is yours until you leave by the front door or wake in the morning, and anything left behind goes to the cathedral's poor-box.");
        }
        if (truthy(s.mw_inn_talk_road)) {
          out.push("Its guests are mostly carters, drovers and factors' clerks off the trunk road, and few stay longer than a night.");
        }
        return out;
      },
      see: ["oswin", "terrace_lodgings", "middle_ward"]
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
      link: ["Trunk Road", "the trunk road"],
      unlock: "mw_gate_road_seen",
      body: [
        "A broad paved way that crosses the Middle Ward from the River Gate in the west to the Charter Gate in the east, meeting Conduit Square at the middle and running on down the switchbacks to the harbor. Wheelwrights, farriers, harness-makers, chandlers and cheap cookshops line it, with wagon yards behind arched entries and the Wagoner's Rest a short way along.",
        "Iron-tired wheels have worn two shallow grooves into the paving. The road belongs to carters, drovers and travelers, and the Watch patrols it in pairs."
      ],
      see: ["river_gate", "charter_gate", "wagoners_rest", "middle_ward"]
    },
    {
      id: "river_gate", category: "places", title: "The River Gate",
      sub: "The west gate in the landward wall",
      tags: ["Middle Ward"], aliases: ["river gate", "west gate", "wicket", "toll-house", "wall levy"],
      link: ["River Gate", "the River Gate"],
      unlock: "mw_river_gate_seen",
      body: function (s) {
        var out = [
          "The west gate in the landward wall: thirty feet of grey blocks, with the trunk road passing through a gatehouse of two round towers. The road beyond runs west along the river cuttings toward the Grey River, with carters' yards and cheap inns outside the wall. Traffic sorts itself into three lanes under the arch: foot to the left, wheels to the right, stamped goods through the center."
        ];
        if (truthy(s.mw_river_talk_lanes)) {
          out.push("A stamp is a Gilded Scales seal on the bill of lading, and stamped goods skip the weighing. Everyone else waits for a Council officer's measuring rod, which takes its cut off the top of the load as the wall levy.");
        }
        if (truthy(s.mw_river_talk_bell)) {
          out.push("The great leaves shut at the night bell and open at first bell. A wicket in the left-hand leaf stays open for anyone with a reason to be out or in, and the clerk behind it decides what counts.");
        }
        return out;
      },
      see: ["cobb_tarrow", "trunk_road", "charter_gate", "port_watch"]
    },
    {
      id: "charter_gate", category: "places", title: "The Charter Gate",
      sub: "The east gate in the landward wall",
      tags: ["Middle Ward"], aliases: ["charter gate", "east gate", "imperial road", "wicket", "pilgrim hospices"],
      link: ["Charter Gate", "the Charter Gate"],
      unlock: "mw_charter_gate_seen",
      body: function (s) {
        var out = [
          "The east gate in the landward wall: newer, higher and faced in pale limestone, with a single great arch, an iron grate in the gallery above and oak leaves hung from the towers. Carved across the arch: By the Old Charter. Open at First Bell, Shut at the Night Bell. Beyond it the imperial road runs east toward the Meridian country, with pilgrim hospices and salt-factors' yards outside the wall."
        ];
        if (truthy(s.mw_charter_talk_charter)) {
          out.push("The gate is Port Valen's own by the old charter. No crown sends a garrison, and no crown sends money for the wall either, so the Council bills whoever comes under the arch.");
        }
        if (truthy(s.mw_charter_talk_pilgrims)) {
          out.push("On feast days much of the road is pilgrims bound for the cathedral, who keep to the left-hand lane. The hospices outside the wall take in those who arrive after the bell.");
        }
        return out;
      },
      see: ["ilse_dornwell", "trunk_road", "river_gate", "port_watch"]
    },
    {
      id: "cobb_tarrow", category: "people", title: "Cobb Tarrow",
      sub: "Warden of the River Gate",
      role: "Wall warden, River Gate (Port Watch)",
      link: ["Cobb Tarrow", "Warden Tarrow", "Tarrow"],
      tags: ["Middle Ward", "Law"], aliases: ["Tarrow", "Cobb", "wall warden"],
      unlock: "mw_river_gate_seen",
      body: [
        "A stocky Watch warden with a broken nose and a tally-stick, who stands at the foot of the left-hand tower and keeps the three lanes straight. He says the contents of the wagons are the clerks' business, not his."
      ],
      see: ["river_gate", "port_watch"]
    },
    {
      id: "ilse_dornwell", category: "people", title: "Ilse Dornwell",
      sub: "Warden of the Charter Gate",
      role: "Wall warden, Charter Gate (Port Watch)",
      link: ["Ilse Dornwell", "Warden Dornwell", "Dornwell"],
      tags: ["Middle Ward", "Law"], aliases: ["Dornwell", "Ilse", "wall warden"],
      unlock: "mw_charter_gate_seen",
      body: [
        "A tall, grey-eyed woman in a blue-and-brass surcoat who stands under the arch with a writ-board on her arm and reads every traveler as they come. She leaves the pilgrims their lane and their songs, and keeps the salt wagons to the right."
      ],
      see: ["charter_gate", "port_watch"]
    },
    {
      id: "cathedral", category: "places", title: "The Cathedral",
      sub: "The Sun-Father's house above the Council Hall",
      tags: ["Civic Heights", "Faith"], aliases: ["cathedral", "church", "kettles", "poor-box", "althea chapel", "side chapel"],
      link: ["The Cathedral", "the cathedral"],
      unlock: "cath_seen",
      body: function (s) {
        var out = [
          "A church of pale limestone above the Council Hall, with three tall arched doors of black oak, two bell towers, and the line The Sun-Father's House. All Oaths Are Sworn in His Sight cut over the middle door. Iron soup kettles stand at the foot of the steps by day, one bowl to a head from First Bell until the pots are empty.",
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
      see: ["sun_father", "saint_althea", "alley_shrine", "sanctuary_charter", "civic_heights"]
    },
    {
      id: "port_watch_hq", category: "places", title: "The Port Watch Headquarters",
      sub: "The Watch's gatehouse and yard beside the Council Hall",
      tags: ["Civic Heights", "Law"], aliases: ["watch yard", "watch headquarters", "watch hq", "guardhouse", "notice board", "duty desk"],
      link: ["Port Watch Headquarters", "the Watch yard", "Watch yard"],
      unlock: "pw_seen",
      body: function (s) {
        var out = [
          "A gatehouse passage beside the Council Hall's west wing, signed Port Watch, with a duty desk, a notice board under the eave and an iron inner gate. Through the bars a cobbled yard runs back to a long two-storey guardhouse of dark stone, sheds full of tagged crates and casks, and a barred stair going down to the cells.",
          "The public goes no further than the gatehouse passage. The desk is kept from Morning through Afternoon, and after that only a hatch in the gatehouse wall stays open."
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
      link: ["Gilded Scales Head House", "the head house", "head house"],
      unlock: "ch_head_named",
      body: function (s) {
        var out = [
          "The Gilded Scales' seat in Port Valen, facing the Council Hall across the plaza on Civic Heights. Brass balance-scales hang over its bronze-banded doors and a gilded river-serpent coils along the lintel. Inside, a vaulted counting floor holds four windows: Deposits and Letters, Writs and Registers, Dispatches, and a shuttered Contracts window.",
          "It opens at Seventh Bell, shuts at the evening horn, and stays closed on Hallowday."
        ];
        if (truthy(s.ch_head_contracts_talk)) {
          out.push("Contracts are let by appointment, to houses the Scales already trust and companies that have left nothing ugly on the Roll and nothing owing in the books.");
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
          out.push("He says a registered name is a name the house will answer for, and that a registered name which draws steel in the Patrician Quarter is struck from the book the same hour.");
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
          "The Patrician Quarter admits only the holders of a writ, bought at the Gilded Scales head house and carrying both the Scales' seal and the city's three-masted seal. A Day Writ costs " + (s.patrician_day_price_silver || 1) + " silver mark and is good for the rest of the day it is bought. A Registered Writ costs " + (s.patrician_reg_price_silver || 8) + " silver marks, is good for " + (s.patrician_reg_days || 30) + " days, and enters the holder's name in the book at the Inner Gate."
        ];
        if (truthy(s.ch_head_writ_talk)) {
          out.push("A registered name that draws steel in the Quarter is struck from the book the same hour. The Council likes its neighbors quiet.");
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
      unlock: "upper_wharves_seen",
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
        return out;
      },
      see: ["entry_writs", "scales_head_house", "alys_threnn", "pq_terrace_walk", "gilt_needle", "civic_heights"]
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
      id: "pq_terrace_walk", category: "places", title: "The Terrace Walk",
      sub: "A promenade on the ridge",
      tags: ["Patrician Quarter"], aliases: ["terrace walk", "promenade", "the walk", "overlook", "lindens"],
      link: ["Terrace Walk", "the Terrace Walk"],
      unlock: "pq_walk_seen",
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
      unlock: "pq_seen_halloran",
      body: [
        "A house whose business is timber. Its gate is green-painted iron under a gilt oak leaf coiled with a river-serpent, and barge-poles stand stacked in the yard behind it. The porter's slate reads: At home to callers with the Halloran seal."
      ],
      see: ["upper_wharves", "pq_house_vantry", "pq_house_ostrand"]
    },
    {
      id: "pq_house_vantry", category: "factions", title: "House Vantry",
      sub: "A great house of the Patrician Quarter",
      tags: ["Patrician Quarter", "Trade"], aliases: ["Vantry", "blue gate", "silver barge"],
      link: ["House Vantry", "Vantry"],
      unlock: "pq_seen_vantry",
      body: [
        "A house whose business is grain and warehousing. Its gate is blue iron trimmed with silver, with a silver barge under sail worked into the lintel, and wagons of sealed sacks stand in the yard behind it while a clerk weighs samples at the porter's window."
      ],
      see: ["upper_wharves", "pq_house_halloran", "pq_house_ostrand"]
    },
    {
      id: "pq_house_ostrand", category: "factions", title: "House Ostrand",
      sub: "A great house of the Patrician Quarter",
      tags: ["Patrician Quarter", "Trade"], aliases: ["Ostrand", "black gate", "brass key"],
      link: ["House Ostrand", "Ostrand"],
      unlock: "pq_seen_ostrand",
      body: [
        "A house that lends and insures, and writes the policy on many of the hulls in the roadstead. Its gate is black iron under a brass key crossed with a quill, and the plate at the porter's window reads: By Appointment Only."
      ],
      see: ["upper_wharves", "pq_house_halloran", "pq_house_vantry"]
    },
    {
      id: "gilt_needle", category: "places", title: "The Gilt Needle",
      sub: "Tailor to the Quarter",
      tags: ["Patrician Quarter", "Trade"], aliases: ["tailor", "tailors shop", "fitting", "clothing"],
      link: ["The Gilt Needle", "Gilt Needle"],
      unlock: "pq_tailor_seen",
      body: [
        "A narrow shop of dark wood and bow glass near the Inner Gate, marked by a gilt needle threaded with red silk. Bolts of cloth lean in racks to the ceiling, and a long cutting table is spread with paper patterns. Everything is cut to the wearer, and fittings are by appointment.",
        "Cloaks, belts, gloves and boots for the new season lie half cut on the table, not yet ready to sell."
      ],
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
        return out;
      },
      see: ["gilt_needle", "upper_wharves"]
    },
    {
      id: "civic_heights", category: "places", title: "Civic Heights",
      sub: "The council and the cathedral",
      tags: ["Civic Heights", "Law"], aliases: ["council hall", "tax hall", "courts", "cathedral", "records house"],
      link: ["Civic Heights"],
      unlock: "civic_heights_seen",
      body: [
        "The road from the Middle Ward ends at a broad plaza of cut limestone, and the buildings change from timber to stone. The Council Hall stands at its head, tall-windowed and long-winged, with the tax windows and the Open Roll in its east wing and the Port Watch headquarters beside its west wing. Painted boards mark the public windows, where people wait beneath the eaves.",
        "The cathedral rises above the Council Hall's roofline on an older foundation, its bells carrying over every district. Charity kitchens cluster around its steps, and people in thin, mended clothes queue there."
      ],
      see: ["open_roll", "council", "port_watch", "middle_ward"]
    },
    {
      id: "magistrates_court", category: "places", title: "The Magistrates' Court",
      sub: "The courtroom in the Council Hall's west wing",
      tags: ["Civic Heights", "Law"], aliases: ["court", "courts", "courtroom", "magistrates", "magistrate", "dock", "bench"],
      link: ["Magistrates' Court", "the courts"],
      unlock: "ch_court_seen",
      body: [
        "A tall limestone courtroom behind the west arch of the Council Hall, with a raised bench of dark oak under the city's three-masted seal, a clerk's table, a railed witness stand, and a low railed dock beside a barred door at the top of a narrow stair that goes down into the dark. Rows of public benches face the bar.",
        "It sits from Seventh Bell until noon, and in the afternoon the iron gate across the west arch is drawn shut. Cases are heard in the order they were filed, at the Open Roll or at the Watch's duty desk, and anyone may sit on the public benches and listen."
      ],
      see: ["council", "open_roll", "port_watch_hq"]
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
      see: ["council", "weigh_house", "entry_writs", "open_roll"]
    },
    {
      id: "open_roll", category: "places", title: "The Open Roll",
      sub: "Public contracts in the Council Hall",
      tags: ["Civic Heights", "Law", "Trade"], aliases: ["records house", "contracts", "postings", "hiring", "claims", "wages", "job board", "work"],
      link: ["Open Roll"],
      unlock: "ch_records_seen",
      body: function (s) {
        var out = [
          "A long stone hall in the east wing of the Council Hall on the Civic Heights plaza. Hirers post the terms of their contracts on wooden frames along the walls, each sealed by the patron and stamped with the city's three-masted seal. Carved over the lintel: <i>What is not in the records does not exist in the world.</i> Sellswords, guards, drivers and hired hands read the postings here and wait for the Postings, Claims and Seals windows.",
          "The hall is open by day and shuts when the evening horn sounds and on the holy day."
        ];
        if (truthy(s.ch_roll_rules_talk)) {
          out.push("In Port Valen a hire is not a hire until both seals are on the Roll, the patron's and the city's. The rule is the same for guilds, the Scales and a widow hiring a door-warden. The courts will not enforce a promise that is not posted.");
        }
        if (truthy(s.ch_roll_claims_talk)) {
          out.push("A worker who was not paid files a claim at the Claims window with a copy of the posting. If the terms are on the Roll, the court can order the patron to pay, and the city takes its fee out of what it wins back. If they are not on the Roll, there is nothing to file.");
        }
        if (truthy(s.ch_roll_deeds_talk)) {
          out.push("A fourth window, Deeds, stands behind a permanent iron shutter. A house changes hands on the records or not at all, and the window opens when there is a sale to witness.");
        }
        return out;
      },
      see: ["tolliver", "civic_heights", "gilded_scales", "letters_of_credit"]
    },
    {
      id: "silt_gates", category: "places", title: "The Silt-Gates",
      sub: "Drainage conduits under the slums",
      tags: ["Dredge-End", "Law"], aliases: ["silt gates", "conduits", "channel", "drainage", "contraband", "smuggling"],
      link: ["Silt-Gates"],
      unlock: function (s) { return s.silt_gate_quest_stage && s.silt_gate_quest_stage !== "unstarted"; },
      body: function (s) {
        var out = [
          "The canal drainage conduits beneath the Dredge-End slums. The harbor's outer boom chains are locked tight, so the contraband is not coming through the main channel: it slips into the conduits instead. Any patrol the Watch sends into the canals is spotted by rooftop lookouts with tin whistles, and the boatmen dump the crates into ten feet of river sludge before it gets within three hundred paces.",
          "Half the night sergeants working the stretch are said to take weekly hush-money to walk their beats on the far side of the canal when the tide rises."
        ];
        var res = s.silt_gate_resolution;
        if (res === "watch_seized") {
          out.push("You bound the broker and his porters at the mooring rings and hauled four crates of highland shear-steel and the jugs of peat-spiritus up the ramp on a hand-barrow. The whole un-stamped cargo went to the Quayside customs house, and the run through the Silt-Gates was broken.");
        } else if (res === "hush_money") {
          out.push("You took twenty-five silver marks from the broker and let the run through. The porters took their barrows into the canal cellar tunnels and the punt slipped back out through the water-gate.");
        } else if (res === "leverage") {
          out.push("You interrupted the drop but did not break the run. The crates stayed on the platform for the tide or the Watch to deal with, and what you carried up the ramp was a strip of wax vellum in the broker's own hand, with a rate written beside each name: six silver marks a Marketday for the north quay.");
        } else if (res === "failed") {
          out.push("The night went against you. The run went back on the water by the next tide, and the broker now knows your face.");
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
          out.push("The Council Hall is the one grand civic building on the plaza. Inside its bronze-banded doors a limestone concourse runs the width of the building, with the Open Roll through the arch at the east end, an iron-gated arch at the west end, and a stair to an upper floor behind a red cord. It is open from Seventh Bell until the evening horn, and shut on Hallowday.");
        }
        if (truthy(s.ch_court_seen)) {
          out.push("The west arch opens on the magistrates' court, which sits from Seventh Bell until noon; in the afternoon the iron gate across the arch is drawn shut.");
        }
        if (truthy(s.ch_gal_board_seen)) {
          out.push("The Council sits every tenth day, from Noon until the evening horn, and on the next day if the tenth falls on Hallowday. A board at the foot of the stair gives the next sitting, and petitions for a sitting must be on the Roll ten days before it.");
          out.push("Twelve houses sit on the Council of Factors, each by its Factor and a deputy. The Chair of the Council passes to the next house each year, and the First Factor answers to the Council.");
        }
        if (truthy(s.ch_gal_seen)) {
          out.push("A public gallery of dark oak runs around three sides of the round-ended chamber, over a horseshoe of high-backed chairs painted with the crests of the great houses, a long table on a dais, and a great carved balance-scale. A plain chair with no crest stands at the foot of the dais, where a person in a black coat with river-serpent cuffs sits apart from the rest. The public may sit and watch but not speak. Each petitioner at the rail gets a sand-glass, and a person in a heavy chain in the central chair answers with a word, often \"Heard.\"");
        }
        return out;
      },
      see: ["gilded_scales", "civic_heights", "port_watch", "alderford", "trade_licence", "magistrates_court"]
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
