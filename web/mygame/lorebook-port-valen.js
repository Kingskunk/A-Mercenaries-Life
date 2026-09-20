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
      see: ["cargo_quay", "port_watch", "dell"]
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

    /* ------------------------------------------------------------- PEOPLE: THE PIER */

    {
      id: "tobin", category: "people", title: "Tobin",
      sub: "The watcher on the breakwater",
      role: "Keeps the Black Tally's count of boats crossing the bar",
      link: ["Tobin"],
      tags: ["Pier", "Black Tally"], aliases: ["watcher", "chalk", "count"],
      unlock: "bar_asked_who",
      body: [
        "A thin man in a cloak stiff with old salt and a knit cap pulled to his eyebrows, with chalk ground into the creases of his fingers. He chalks a stroke on the base post of the jetty-head crane for every boat that goes over the bar after curfew, and another when it comes back.",
        "He counts for the Black Tally and is not supposed to be seen talking to strangers."
      ],
      see: ["pier", "black_tally", "marl"]
    },
    {
      id: "marl", category: "people", title: "Marl Coyne",
      sub: "Skipper of the Gannet",
      role: "Skipper, river-mouth skiff Gannet",
      link: ["Marl Coyne", "Marl"],
      tags: ["Pier", "Black Tally"], aliases: ["skipper", "Gannet", "skiff"],
      unlock: "bar_asked_out",
      body: function (s) {
        var out = [
          "Skipper of the Gannet, a twenty-foot river-mouth skiff that goes over the bar after curfew with no lamp, and her sister's boy in the bow. Tobin expected her back before the water bottomed out."
        ];
        if (s.bar_resolution === "lawful") {
          out.push("The Watch fined her and impounded the Gannet.");
        } else if (s.bar_resolution === "pragmatic") {
          out.push("The Black Tally's collectors took her and the boy back under its thumb.");
        } else if (s.bar_resolution === "strategic") {
          out.push("The Black Tally's count lists the Gannet lost with all hands. She keeps a skiff on the lowest ladder at the pier, and she owes you a favor.");
        } else if (s.bar_quest_stage === "declined") {
          out.push("The Gannet never came back in.");
        }
        return out;
      },
      see: ["pier", "pip", "tobin", "black_tally"]
    },
    {
      id: "pip", category: "people", title: "Pip",
      sub: "Marl's sister's boy",
      role: "Marl Coyne's nephew",
      link: ["Pip"],
      tags: ["Pier"], aliases: ["boy", "nephew"],
      unlock: "met_pip",
      body: function (s) {
        var out = ["Eleven years old, wrapped in a tarp in the bow of Marl's skiff, and unable to swim a stroke."];
        if (s.bar_resolution === "strategic") {
          out.push("He is learning the sweep. Marl will not let him in the boat unless she is watching, and he asks about you.");
        }
        return out;
      },
      see: ["marl", "pier"]
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

    /* ------------------------------------------------------ PEOPLE: THE RUSTY ANCHOR */

    {
      id: "sal", category: "people", title: "Sal",
      sub: "Keeper of the Rusty Anchor",
      role: "Keeper, The Rusty Anchor (Dredge-End)",
      link: ["Sal"],
      tags: ["Dredge-End"], aliases: ["cleaver", "tavern keeper", "anchor"],
      unlock: "codex_rusty_anchor",
      body: function (s) {
        var out = [
          "A woman broad across the shoulders, her hair gone salt and tied back with sail-twine, her forearms mapped with old rope-burns. She keeps a broad butcher's cleaver buried two inches in the chopping block and does not take her eyes off a stranger until she has measured him."
        ];
        if (truthy(s.anchor_rumor_1)) {
          out.push("Dredge-End says she has held that hull since before the Black Tally started keeping count, and that she neither scares nor pays.");
        }
        return out;
      },
      see: ["rusty_anchor", "dredge_end", "black_tally"]
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
        "A crisp, no-nonsense landlady. One silver mark buys seven days: clean straw, a dry roof, quiet stairs, and Master Vael's deadbolts on every door.",
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
      sub: "Lock-wright, Locksmiths' Close",
      role: "Lock-wright, Vael & Son",
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
      id: "brand", category: "people", title: "Master Brand",
      sub: "Herbalist and physic",
      role: "Herbalist, Brand's Still-Room & Physic (Herb-Pounder Close)",
      link: ["Master Brand"],
      tags: ["Middle Ward"], aliases: ["Brand", "herbalist", "physic", "salve", "still-room"],
      unlock: "mw_herb_seen",
      body: [
        "An elderly herbalist with yellow-stained fingers, who pours pine medicine into small dark glass bottles behind a painted mortar-and-pestle sign. Wicker racks of mountain angelica, wormwood, pine resin and willow bark dry along the close, and two copper stills hiss over charcoal.",
        "The army takes his best willow bark for its field surgeons. What he sells to soldiers is wound salve, bitters, and a warming rub of animal fat with wintergreen, thyme and camphor that they swear by for strained knees and blistered heels."
      ],
      see: ["middle_ward"]
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
      sub: "Port Valen's maritime gateway",
      tags: ["Quayside", "Port Valen"], aliases: ["quayside", "harbor", "docks", "waterfront"],
      link: ["Harbor Quayside"],
      unlock: "port_valen_harbor_seen",
      body: [
        "Port Valen's maritime gateway: stone customs arches, wooden cargo slips, granite wharves, and massive balance cranes jutting out over the estuary swell. Deep-hulled merchant vessels ride at anchor in the outer roadstead, while flat-bottomed river barges and fishing smacks crowd the inner docks.",
        "The quayside holds the Cleaved Keel, the Cargo Quay under the customs tower, the shipwrights' ways of the Iron Wharves, the long pier out to the wreck-bell, and the Fishmongers' Slip. Most of it shuts at dusk."
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
      id: "cargo_quay", category: "places", title: "The Cargo Quay & Customs Tower",
      sub: "The harbor registry",
      tags: ["Quayside", "Law", "Trade"], aliases: ["customs", "customs tower", "registry", "toll tower", "cargo line"],
      link: ["Cargo Quay"],
      unlock: "pv_quays_seen",
      body: [
        "The cargo quay runs from the fish market toward the toll tower, and it is one long argument conducted in stamped parchment. Guild clerks in the river-serpent colors of the Gilded Scales move crate to crate with wax tablets, while Port Watch officers walk the line with cudgels slung but visible.",
        "The registry box stands under the tower, where the dockmaster's lamp burns in the window. Crane three, on the cargo line, takes day labor."
      ],
      see: ["voss", "dell", "gilded_scales", "port_watch"]
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
      id: "pier", category: "places", title: "The Pier & the Wreck-Bell",
      sub: "The breakwater to the outer bar",
      tags: ["Pier", "Quayside"], aliases: ["pier", "breakwater", "wreck bell", "bell", "reef", "bar", "jetty"],
      link: ["Wreck-Bell", "wreck-bell"],
      unlock: "pv_pier_seen",
      body: [
        "A long stone breakwater that runs out over the shoals toward the outer bar. At its head stand a jetty crane and a gallows-frame, and beyond the last stone a bronze bell on the reef counts the surge in slow strokes.",
        "Names of the lost are scratched into the frame post at every height a hand can reach, with no list and no keeper: whoever loses someone to the bar adds a mark, and whoever passes touches one. Skiffs tie off along the lower stone ladders."
      ],
      see: ["tobin", "marl", "harbor_quayside", "wreck_law"]
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
    {
      id: "rusty_anchor", category: "places", title: "The Rusty Anchor",
      sub: "A tavern on three barges",
      tags: ["Dredge-End"], aliases: ["anchor", "tavern", "barges", "cellar hatch"],
      link: ["Rusty Anchor"],
      unlock: "codex_rusty_anchor",
      body: [
        "A tavern built on three old barges tied end to end, so the whole floor rises and dips with the river. It smells of boiling fish heads, wet rope and peat smoke, and carters and wagon drivers sit along the cedar tables with their hands flat on the wood.",
        "Two men in ink-stained leather with long gutting knives watch the door and the cellar hatch instead of the room."
      ],
      see: ["sal", "dredge_end"]
    },

    /* ----------------------------------------------------------- PLACES: DISTRICTS */

    {
      id: "dredge_end", category: "places", title: "Dredge-End",
      sub: "The flooded low district",
      tags: ["Dredge-End", "Black Tally"], aliases: ["slums", "canals", "silt basin", "tenements"],
      link: ["Dredge-End"],
      unlock: "dredge_end_seen",
      body: [
        "The cobblestones give out at the drainage cut, replaced by greased timber duckboards and sunken mud tracks below the river's high-water mark. Dredge-End sits in the city's low silt-basin: rows of waterlogged tenements on black-greased pilings, joined by creaking rope gangways above stagnant canal trenches.",
        "It is Black Tally country. The Watch seldom comes down to the canals on a market day, and trade settles with sharp elbows and quick fingers."
      ],
      see: ["black_tally", "rusty_anchor", "port_valen"]
    },
    {
      id: "middle_ward", category: "places", title: "The Middle Ward",
      sub: "The craft terraces",
      tags: ["Middle Ward"], aliases: ["terrace", "second terrace", "conduit square", "craftsmen", "workshops"],
      link: ["Middle Ward"],
      unlock: "mw_seen",
      body: [
        "The road climbs in turns from the docks and levels out on the broad stone terraces below the limestone cliffs of Civic Heights. Timber buildings lean over narrow lanes beneath steep slate roofs, their lower shutters open as shop counters, and the air smells of cooled iron, brass dust, cedar sawdust and warm caraway bread.",
        "Conduit Square, with its octagonal fountain and four bronze lion-head spouts, is the crossroads. Lanes branch to the Locksmiths' Close, Herb-Pounder Close, Parchmenters' Wynd and the Cooperage Basin, and a communal oven feeds the ward."
      ],
      see: ["terrace_lodgings", "marda", "vael", "brand", "civic_heights"]
    },
    {
      id: "terrace_lodgings", category: "places", title: "Terrace Lodgings",
      sub: "Rooms in the Locksmiths' Close",
      tags: ["Middle Ward"], aliases: ["lodgings", "rooms", "rent", "boarding house"],
      link: ["Terrace Lodgings"],
      unlock: "mw_lodgings_seen",
      body: [
        "The four-storey limestone front of a boarding house at the end of the Locksmiths' Close, its thick wooden door fitted with a teardrop-shaped knocker. Rooms let by the week, with Mistress Kess collecting the rent and a lock-wright's deadbolt on every door."
      ],
      see: ["kess", "vael", "middle_ward"]
    },
    {
      id: "upper_wharves", category: "places", title: "The Upper Wharves",
      sub: "The merchant quarter",
      tags: ["Upper Wharves", "Gilded Scales", "Trade"], aliases: ["merchant quarter", "counting houses", "merchant avenue", "factoring houses"],
      link: ["Upper Wharves"],
      unlock: "upper_wharves_seen",
      body: [
        "The road climbs above the wet streets toward the merchant quarter. Here the paving stones are whole and the gutters swept, and every warehouse door bears a lock large enough to make a statement. Brass scales and gilded river-serpents hang above the counting houses, and liveried guards turn away anyone without a sealed writ.",
        "The counting houses shut behind padlocked grilles on the church calendar, leaving the merchant avenue quiet."
      ],
      see: ["gilded_scales", "letters_of_credit", "civic_heights"]
    },
    {
      id: "civic_heights", category: "places", title: "Civic Heights",
      sub: "The council and the cathedral",
      tags: ["Civic Heights", "Law"], aliases: ["council hall", "tax hall", "courts", "cathedral", "records house"],
      link: ["Civic Heights"],
      unlock: "civic_heights_seen",
      body: [
        "The road from the Middle Ward ends at a broad plaza of cut limestone, and the buildings change from timber to stone. The Council Hall stands at its head, with the tax hall, the records house and the magistrates' courts around the plaza and the Port Watch headquarters beside the courts. Painted boards mark the public windows, where petitioners wait beneath the eaves.",
        "The cathedral rises above the courts on an older foundation, its bells carrying over every district. Charity kitchens cluster around its steps, and the sick and the displaced gather there."
      ],
      see: ["council", "port_watch", "middle_ward"]
    },
    {
      id: "silt_gates", category: "places", title: "The Silt-Gates",
      sub: "Drainage conduits under the slums",
      tags: ["Dredge-End", "Law"], aliases: ["silt gates", "conduits", "flume", "drainage", "contraband", "smuggling"],
      link: ["Silt-Gates"],
      unlock: function (s) { return s.silt_gate_quest_stage && s.silt_gate_quest_stage !== "unstarted"; },
      body: [
        "The canal drainage conduits beneath the Dredge-End slums. The harbor's outer boom chains are locked tight, so the contraband is not coming through the main channel: it slips into the conduits instead. Any patrol the Watch sends into the canals is spotted by rooftop lookouts with tin whistles, and the boatmen dump the crates into ten feet of river sludge before it gets within three hundred paces.",
        "Half the night sergeants working the stretch are said to take weekly hush-money to walk their beats on the far side of the canal when the tide rises."
      ],
      see: ["voss", "port_watch", "dredge_end"]
    },

    /* ---------------------------------------------- INSTITUTIONS, LAW AND CUSTOM */

    {
      id: "council", category: "factions", title: "The Council of Port Valen",
      sub: "The city's ruling council",
      tags: ["Civic Heights", "Gilded Scales", "Law"], aliases: ["council of factors", "free city", "Free City", "council hall", "plutocracy", "tax hall"],
      link: ["Council of Factors", "Council Hall", "Free City of Port Valen"],
      unlock: "civic_heights_seen",
      body: [
        "Port Valen calls itself a free city, and its ruling council sits in the Council Hall on Civic Heights, under a bronze balance-scale and the carved words <i>The Free City of Port Valen</i>. Each door on the plaza bears the city's three-masted seal.",
        "Two lines run at the tax hall. The long one, for householders and small traders, winds out the door and down the steps. The other is a side window with no line at all, where clerks in river-serpent colors hand in leather cases and take out stamped receipts."
      ],
      see: ["gilded_scales", "civic_heights", "port_watch", "alderford"]
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
