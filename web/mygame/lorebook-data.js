/*
 * LOREBOOK DATA -- every codex entry for A Mercenary's Path lives here.
 *
 * Adding an entry = adding one object to `entries`. Nothing else needs to change:
 * search, filters, the NEW badge and the discovered count all pick it up.
 *
 * Fields
 *   id        unique slug; other entries link to it with [[id|label]] inside body text
 *   category  one of the ids in `categories`
 *   title     shown in the list and as the entry heading
 *   sub       one line under the title in the list (role, or what it is)
 *   role      optional line under the heading in the reader (defaults to sub)
 *   tags      short labels; clicking one filters the list. Also searched.
 *   aliases   extra search words that are not in the text ("Free City", "Tally")
 *   link      exact phrases in the story text that become clickable links to this entry (only
 *             once the entry is unlocked, and only the first mention on each page). Keep these
 *             specific: a full proper name (Port Watch, Gilded Scales), never a common word
 *             ("captain", "tolls", "watch", "tally") and never a phrase that starts with "the",
 *             since "the" is not always capitalised. Generic words could point at the wrong
 *             town once there is more than one.
 *   unlock    game variable name, or an array (any of them), or function(stats) -> bool.
 *             Omit for an entry that is known from the start. Locked entries are invisible.
 *   meter     { stat, label } draws a 0-100 bar from a game variable (a faction rep, a bond).
 *             May also be function(stats) -> that object, or null for no bar.
 *   body      HTML string, array of strings (one paragraph each) or function(stats) -> either.
 *             Inline HTML allowed (<b>, <i>). {{stat_name}} inserts a game variable.
 *   see       ids of related entries; only unlocked ones are shown
 *
 * Text rules still apply: names are only revealed once the player has met them, and prose
 * follows narrative_guidelines.md. This file is loaded before lorebook.js.
 */
(function () {
"use strict";

function truthy(v) { return v === true || v === "true"; }

window.LOREBOOK = {
  categories: [
    { id: "people",   label: "People" },
    { id: "factions", label: "Factions" },
    { id: "places",   label: "Places" },
    { id: "history",  label: "History & Law" },
    { id: "lore",     label: "Faith & Folklore" }
  ],

  entries: [

    /* ------------------------------------------------------------------ PEOPLE */

    {
      id: "vane", category: "people", title: "Captain Joshua Vane",
      link: ["Captain Joshua Vane", "Captain Vane", "Joshua Vane", "Vane"],
      sub: "Company Commander",
      role: "Iron Carrion — Company Commander",
      tags: ["Iron Carrion"], aliases: ["Vane", "Joshua Vane", "captain", "commander"],
      meter: function (s) { return truthy(s.met_vane) ? { stat: "vane_standing", label: "Captain Vane's Regard" } : null; },
      body: function (s) {
        if (!truthy(s.met_vane)) {
          return ["The aloof commander of the Iron Carrion. You have only seen his black raven pavilion from afar."];
        }
        return [
          "The cold, calculating commander of the 400. A stern, aloof strategist who treats warfare as a business of ledgers, contracts, and calculated brutality. Rumored among the veterans to be a cashiered imperial officer who traded high rank for the freedom of a mercenary captaincy.",
          "<i>\"Tall and immaculately kept in a way that looks almost offensive against the mud of the camp—silver-templed, imperial-cut coat brushed clean of a single speck of the filth everyone else wades through, and pale eyes that linger a beat too long pricing a man before they ever bother to judge him. Rumored to be a cashiered imperial officer who traded high rank for the freedom of a mercenary captaincy, though nobody who's asked him directly has gotten a straight answer. Treats war as a business of ledgers, contracts, and calculated brutality, in roughly that order.\"</i>"
        ];
      },
      see: ["iron_carrion"]
    },
    {
      id: "varren", category: "people", title: "Sergeant Varren",
      link: ["Sergeant Varren", "Varren"],
      sub: "Vanguard Drillmaster & Frontline Veteran",
      role: "Iron Carrion — Vanguard Drillmaster & Frontline Veteran",
      tags: ["Iron Carrion"], aliases: ["Varren", "drillmaster"],
      unlock: "met_varren",
      meter: { stat: "varren_respect", label: "Sergeant Varren's Regard" },
      body: [
        "Veteran drillmaster and frontline sergeant. A scarred brute responsible for turning green recruits into soldiers who don't break the shield-wall.",
        "<i>\"A massive slab of a man, gone thick and hard with age rather than soft, half his face a crosshatch of old siege-scars that pull his mouth into a permanent, humorless line. Close-cropped grey stubble, a nose broken at least twice and never set straight, and one milk-pale eye that doesn't track quite right in bad light. He turns green recruits into soldiers who don't break the shield-wall, and doesn't much care whether they like him for it.\"</i>"
      ],
      see: ["iron_carrion"]
    },
    {
      id: "kestrel", category: "people", title: "Kestrel",
      link: ["Kestrel"],
      sub: "Scout Company Commander",
      role: "Iron Carrion — Scout Company Commander",
      tags: ["Iron Carrion"], aliases: ["scouts", "Scout Company"],
      unlock: "met_kestrel",
      meter: { stat: "kestrel_respect", label: "Kestrel's Regard" },
      body: [
        "Scout Company's commander. Lean, weathered, and near-silent, she runs the smallest armed company in camp on trust earned the hard way and answers to no rank but her own reputation.",
        "<i>\"Lean, weathered, and somewhere past sixty winters—though the keen stillness in her pale moss-green eyes and her untiring stride through the marsh betray none of it. Tapered half-elven ears sit tucked beneath a close-fitting coif of greased leather, dark hair cropped short and greying at the temples, and a long skinning knife worn plain at her hip with no ornament worth mentioning. She goes by one name and no formal rank, commanding the scouts on trust earned the hard way across decades of fen warfare. Watches everyone, including her own recruits, before they ever realize they're being watched.\"</i>"
      ],
      see: ["iron_carrion"]
    },
    {
      id: "ysolde", category: "people", title: "Ysolde Marrow",
      link: ["Ysolde Marrow", "Ysolde"],
      sub: "Cadre Handler",
      role: "Iron Carrion — Cadre Handler",
      tags: ["Iron Carrion"], aliases: ["Ysolde", "Marrow", "Cadre", "handler"],
      unlock: "met_ysolde",
      meter: { stat: "ysolde_respect", label: "Ysolde's Regard" },
      body: [
        "The Cadre's handler. An older woman who manages the company's small handful of gifted recruits like someone keeping a careful count of the ones she's already buried, and not planning to add to that number.",
        "<i>\"An older woman carrying subtle marks of infernal bloodline—small, polished obsidian ram horns sweeping close against dark hair streaked with iron-grey, and pale mercury-silver irises that miss nothing while appearing to look at nothing in particular. Decades of being eyed sideways by superstitious soldiers have left her with a calm, unhurried wariness that has nothing to do with fear of them and everything to do with fear for them. Hands steady enough to thread a needle by firelight without looking down, a satchel of scrolls and glass vials slung across one shoulder like an apothecary's kit.\"</i>"
      ],
      see: ["iron_carrion"]
    },
    {
      id: "lyra", category: "people", title: "Lyra",
      link: ["Lyra"],
      sub: "Vanguard Scout & Recurve Archer, Rookie Cohort",
      role: "Iron Carrion — Vanguard Scout & Recurve Archer, Rookie Cohort",
      tags: ["Iron Carrion"], aliases: ["archer", "rookie"],
      unlock: "met_lyra",
      meter: { stat: "lyra_bond", label: "Comradeship with Lyra" },
      body: [
        "A fellow rookie who claimed her recurve bow beside you at the munitions cart. Sharp-eyed, guarded, and determined to survive her first campaign under the Carrion.",
        "<i>\"Lean and sharp-featured, raven-dark hair tied back in rough cord that never quite stays neat, with quick, watchful eyes that catch every movement in a room before settling on you. Quiet scars along both forearms that she's never once explained. A downriver survivor who took the iron shilling to outrun starvation—guarded, lethal with a shortbow, and watching your back whether you asked her to or not.\"</i>"
      ],
      see: ["iron_carrion"]
    },
    {
      id: "odessa", category: "people", title: "Surgeon Odessa",
      link: ["Surgeon Odessa", "Odessa"],
      sub: "Company Surgeon & Field Medic",
      role: "Iron Carrion — Company Surgeon & Field Medic, Logistics & Baggage Train",
      tags: ["Iron Carrion"], aliases: ["Odessa", "surgeon", "medic", "healer"],
      unlock: "met_odessa",
      meter: { stat: "odessa_respect", label: "Surgeon Odessa's Regard" },
      body: [
        "The company's gaunt, sharp-tongued field surgeon. Keeps the four hundred patched together with boiled linen, bone-saws, and grim humor.",
        "<i>\"A gaunt, sharp-tongued woman with more scars etched across her fingers and knuckles than most frontline veterans she stitches. Sharp-eyed and unsentimental, she moves between wounded soldiers with waxed thread, boiled linen, and pungent marsh-tinctures. She views warfare not through heroic ballads or tactical maneuvers, but through the mundane, messy reality of torn meat, shattered bone, and septic fever.\"</i>"
      ],
      see: ["iron_carrion"]
    },
    {
      id: "rorik", category: "people", title: "Veteran Rorik",
      link: ["Veteran Rorik", "Rorik"],
      sub: "Munitions Armorer & Sapper Veteran",
      role: "Iron Carrion — Munitions Armorer & Sapper Veteran, Munitions Train",
      tags: ["Iron Carrion"], aliases: ["Rorik", "armorer", "smith", "sapper"],
      unlock: "met_rorik",
      meter: { stat: "rorik_regard", label: "Comradeship with Rorik" },
      body: [
        "A grizzled Highland smith and munitions armorer who keeps the company's steel honed at the baggage wagons.",
        "<i>\"A grizzled, broad-shouldered Highland smith with burn-scarred forearms, a notched ear, and a cloud of bitter pipeweed smoke trailing his steps. Having swung sledge for Master Torvald at Alderford before taking the mercenary shilling, he methodically hones company blades and shares hard-earned forgecraft with recruits who respect the steel.\"</i>"
      ],
      see: ["iron_carrion", "alderford"]
    },
    {
      id: "elspeth", category: "people", title: "Elspeth",
      link: ["Elspeth"],
      sub: "Your younger sister",
      role: function (s) {
        if (s.elspeth_role === "odessa_apprentice") return "Iron Carrion — Chirurgeon's Assistant & Apprentice, Logistics & Baggage Train";
        if (s.elspeth_role === "baggage_train") return "Iron Carrion — Camp Seamstress & Carter, Baggage Train";
        if (s.elspeth_role === "chapel_sanctuary") return "Alderford — Weaver Novice, Ecclesiastical Sanctuary (Upper Chapel)";
        return "";
      },
      tags: ["Family"], aliases: ["sister", "kin", "Ashbrook"],
      unlock: "elspeth_safe",
      meter: { stat: "elspeth_bond", label: "Sibling Bond with Elspeth" },
      body: [
        "<i>\"Your younger sister and sole surviving kin from the burning of Ashbrook. Resilient, observant, and hardened by weeks of grueling labor in the riverfront salt sheds, she carries the trauma of your family's loss with quiet courage. Whether boiling linen by Surgeon Odessa's table or sheltered under chapel eaves, she trusts your strength and skill to see you both through the Marches.\"</i>"
      ],
      see: ["ashbrook", "saint_althea"]
    },

    /* ---------------------------------------------------------------- FACTIONS */

    {
      id: "iron_carrion", category: "factions", title: "The Iron Carrion",
      link: ["Iron Carrion", "Carrion Company"],
      sub: "Free company hierarchy & command",
      tags: ["Iron Carrion"], aliases: ["Carrion", "company", "chain of command", "the 400"],
      body: [
        "<i>\"Crows feast where lords bleed.\"</i>",
        "Founded thirty years ago in the ashes of the Broken Crown War, the Iron Carrion is a four-hundred-man free company of veteran sellswords, runaway bond-servants, and disgraced soldiers. They answer to no crown and hold no land. Their loyalty lasts as long as a patron's coin purse holds weight.",
        "Port Valen serves as the company's operational home base. The Carrion rents a fortified compound near the Iron Wharves, returning there between contracts to collect pay, repair its equipment, recruit replacements, and negotiate its next commission. It is a headquarters, not a fief: the company owns no land and can be driven elsewhere whenever its contracts or enemies demand it."
      ],
      see: ["vane", "varren", "kestrel", "ysolde", "odessa", "lyra", "rorik", "port_valen"]
    },
    {
      id: "gilded_scales", category: "factions", title: "The Gilded Scales",
      link: ["Gilded Scales"],
      sub: "Merchant cartel and paymasters",
      tags: ["Port Valen", "Trade"], aliases: ["Scales", "First Factor", "Council of Factors", "cartel", "factors", "free city", "Free City", "plutocracy"],
      unlock: "codex_gilded_scales",
      meter: { stat: "gilded_scales_rep", label: "Standing with the Gilded Scales" },
      body: [
        "A wealthy, ruthless cartel of river-merchants and guild-masters based in Port Valen's Upper Wharves. They monopolize timber, grain barges, and river toll-gates across the province, enforcing commercial contracts with mercenary iron. They are the Carrion's current paymasters.",
        "The cartel is led by a <b>First Factor</b>, a presiding merchant who speaks for the Scales in matters of war, treaty, and city policy. The First Factor answers to the Council of Factors, the ruling council of Port Valen, made up of the senior merchant houses. Beneath them, appointed civic officers manage records, taxes, courts, and the Port Watch. Port Valen holds the old imperial title of a free city and calls itself free because no crown rules it. In practice, whoever controls the purse controls the city."
      ],
      see: ["port_valen", "port_watch", "letters_of_credit", "alderford"]
    },
    {
      id: "port_watch", category: "factions", title: "The Port Valen Watch",
      link: ["Port Valen Watch", "Port Watch"],
      sub: "The city guard",
      tags: ["Port Valen", "Law"], aliases: ["Port Watch", "Watch", "city guard", "watchmen"],
      unlock: "codex_port_watch",
      meter: { stat: "port_watch_rep", label: "Standing with the Port Watch" },
      body: [
        "The city guard charged with maintaining public peace, patrolling the harbor quays, and manning the stone water-gates. Wearing boiled leather jerkins stamped with the city's three-masted seal, armed with bills, shortbows, and iron-banded cudgels, they walk the beat between foreign crews, dockside brawlers, and Dredge-End cutpurses.",
        "Though sworn to the City Council and the public order, the Watch is under-strength, underpaid, and constantly caught between the demands of the Gilded Scales—who expect immediate protection for merchant cargo—and the realities of a teeming port swollen with refugees and armed sellswords. A veteran watchman values quiet quays, paid bar tabs, and reliable steel far more than abstract civic decrees."
      ],
      see: ["gilded_scales", "port_valen"]
    },
    {
      id: "black_tally", category: "factions", title: "The Black Tally",
      link: ["Black Tally"],
      sub: "Dredge-End's underworld syndicate",
      tags: ["Port Valen", "Underworld"], aliases: ["Tally", "Dredge-End", "syndicate", "loan sharks", "smugglers"],
      unlock: "codex_black_tally",
      meter: { stat: "black_tally_rep", label: "Standing with the Black Tally" },
      body: [
        "The brutal underworld syndicate of Port Valen's Dredge-End slums. A network of loan sharks, fence houses, and smugglers who enforce blood debts with shivs and river burials."
      ],
      see: ["port_valen"]
    },
    {
      id: "baron_karr", category: "factions", title: "Baron Aldous Karr",
      link: ["Baron Aldous Karr", "Baron Karr", "Aldous Karr"],
      sub: "Feudal lord of Karr's Keep",
      tags: ["Karr", "Highlands"], aliases: ["Karr", "the Baron"],
      unlock: "codex_baron_karr",
      body: [
        "The grasping, paranoid feudal lord of Karr's Keep. Notorious for ruinous agricultural taxes, violent bailiffs, and an iron grip on his highland tenants."
      ],
      see: ["karrs_keep", "iron_bailiffs", "ashbrook"]
    },
    {
      id: "iron_bailiffs", category: "factions", title: "The Iron Bailiffs",
      link: ["Iron Bailiffs"],
      sub: "Baron Karr's tax collectors",
      tags: ["Karr", "Highlands"], aliases: ["bailiffs", "tax collectors"],
      unlock: "codex_iron_bailiffs",
      body: [
        "Baron Aldous Karr's armed tax collectors and highland enforcers. Hardened thugs in boiled leather and iron kettle-helms who patrol the mountain toll passes, seize tenant harvests, and enforce Karr's extortionate edicts with fire and the noose."
      ],
      see: ["baron_karr", "ashbrook"]
    },
    {
      id: "squatters", category: "factions", title: "The Causeway Squatters & Deserters",
      sub: "The garrison of the Black Sinks gatehouse",
      tags: ["Grey River"], aliases: ["squatters", "deserters", "Black Sinks"],
      unlock: "codex_marsh_squatters",
      body: [
        "A desperate coalition of displaced highland tenants, escaped bond-servants, and army deserters who fortified the Black Sinks toll gatehouse. Driven into the fen by starvation and debt, they fought with scythes, sickles, and fishing spears to hold the causeway before being overwhelmed by the Carrion."
      ],
      see: ["black_sinks"]
    },
    {
      id: "iron_bull", category: "factions", title: "The Iron Bull Free Company",
      link: ["Iron Bull"],
      sub: "A legendary heavy-infantry company",
      tags: ["Mercenaries"], aliases: ["Iron Bull", "Maura", "pike squares"],
      unlock: "codex_iron_bull",
      body: [
        "A legendary heavy-infantry mercenary company renowned across the western provinces for impenetrable pike squares, disciplined wedge charges, and ruthless contract adherence. Famous for holding the southern river crossings during the chaotic aftermath of the Broken Crown War, their ranks were decimated in the grueling campaigns that followed, scattering surviving veterans like Maura into frontier settlements across the Marches."
      ],
      see: ["meridian_empire"]
    },

    /* ------------------------------------------------------------------ PLACES */

    {
      id: "grey_marches", category: "places", title: "The Grey Marches",
      link: ["Grey Marches"],
      sub: "The frontier borderland",
      tags: ["Regional"], aliases: ["Marches", "frontier", "borderland", "map"],
      body: [
        "A contested, mist-shrouded frontier borderland wedged between coastal trade routes and the rugged northern highlands."
      ],
      see: ["port_valen", "alderford", "black_sinks", "broken_crags", "karrs_keep", "ashbrook", "grey_river"]
    },
    {
      id: "port_valen", category: "places", title: "Port Valen & Dredge-End",
      link: ["Port Valen", "Dredge-End"],
      sub: "The port capital downriver",
      tags: ["Port Valen"], aliases: ["Port Valen", "Dredge-End", "Upper Wharves", "free city", "Free City", "Council", "capital"],
      unlock: "codex_port_valen",
      body: [
        "The sprawling, corrupt port capital downriver, a free city in the old imperial sense, answerable to no crown. Its Council rules the surrounding towns and villages of the river country, Alderford among them, through tolls, tax contracts, and factors rather than garrisons. While the merchant palaces of the Gilded Scales dominate the Upper Wharves, Dredge-End is a maze of flooded canals, rotting tenements, and Black Tally territory."
      ],
      see: ["gilded_scales", "port_watch", "black_tally", "alderford", "iron_carrion"]
    },
    {
      id: "alderford", category: "places", title: "Alderford River Weir & Waystation",
      link: ["Alderford"],
      sub: "The frontier's primary river port",
      tags: ["Alderford", "Grey River"], aliases: ["Alderford", "weir", "waystation"],
      unlock: "codex_alderford",
      meter: { stat: "alderford_rep", label: "Standing in Alderford" },
      body: [
        "The frontier's primary river port built around an ancient imperial limestone weir. Sawmills, brine curing lofts, and heavy timber wharves connect the highland road to the downstream river gorge toward Port Valen, whose Council holds it as one of its river towns."
      ],
      see: ["port_valen", "grey_river", "sanctuary_charter", "gilded_scales"]
    },
    {
      id: "grey_river", category: "places", title: "The Grey River Waterway (The Downriver Run)",
      link: ["Grey River"],
      sub: "Alderford to Port Valen by water",
      tags: ["Grey River"], aliases: ["Grey River", "river gorge", "downriver", "waterway"],
      unlock: "codex_river_gorge",
      body: [
        "A wide, thirty-mile navigable freight highway flowing between limestone bluffs and ancient imperial signal towers from Alderford down to Port Valen. While the steady current provides a smooth downstream run for heavy commercial grain barges and timber scows, the pervasive river damp, freezing autumn spray, and submerged imperial works (like ancient anti-galley booms) require waterproofed gear and seasoned watermen."
      ],
      see: ["alderford", "port_valen", "imperial_booms"]
    },
    {
      id: "black_sinks", category: "places", title: "The Black Sinks Causeway",
      link: ["Black Sinks"],
      sub: "A flooded marsh choke point",
      tags: ["Grey River"], aliases: ["Black Sinks", "causeway", "gatehouse", "toll road"],
      unlock: "codex_black_sinks",
      body: [
        "A flooded, miserable marshland choke point along the main river toll road. Desperate deserters and displaced squatters have seized the gatehouse, prompting the Gilded Scales to hire the Carrion for clearance."
      ],
      see: ["squatters", "gilded_scales"]
    },
    {
      id: "broken_crags", category: "places", title: "The Broken Crags",
      link: ["Broken Crags"],
      sub: "A rugged northern highland region",
      tags: ["Karr", "Highlands"], aliases: ["Crags"],
      unlock: "codex_broken_crags",
      body: [
        "A rugged northern highland region of steep granite ravines, scrub hills, and treacherous rocky terrain that breaks wagon axles. Controlled by Baron Karr's bailiffs, its narrow choke points and heavy morning fog make it a perilous natural ambush corridor for the company's advance."
      ],
      see: ["baron_karr", "iron_bailiffs"]
    },
    {
      id: "karrs_keep", category: "places", title: "Karr's Keep",
      link: ["Karr's Keep"],
      sub: "Seat of Baron Karr's rule",
      tags: ["Karr", "Highlands"], aliases: ["Keep", "fortress"],
      unlock: "codex_karrs_keep",
      body: [
        "A cold, brooding granite fortress perched on the Crags, serving as the seat of Baron Aldous Karr's local rule."
      ],
      see: ["baron_karr", "broken_crags"]
    },
    {
      id: "ashbrook", category: "places", title: "Ashbrook",
      link: ["Ashbrook"],
      sub: "A destroyed tenant-farming village",
      tags: ["Karr", "Highlands"], aliases: ["burning of Ashbrook"],
      unlock: "codex_ashbrook",
      body: [
        "A destitute tenant-farming village in the high valley foothills. Razed to the ground by Baron Karr's bailiffs during a forced grain-tax collection."
      ],
      see: ["baron_karr", "iron_bailiffs", "elspeth"]
    },

    /* --------------------------------------------------------- HISTORY & LAW */

    {
      id: "meridian_empire", category: "history", title: "The Meridian Empire & the Broken Crown War",
      link: ["Meridian Empire", "Broken Crown War"],
      sub: "The Fall of an Empire",
      tags: ["Empire"], aliases: ["Meridian", "empire", "Broken Crown War", "imperial", "war of succession"],
      unlock: "codex_meridian_empire",
      body: [
        "Long before its final collapse, the Meridian Empire was already a dying titan—rotted from within by centuries of bureaucratic decay, warring client kingdoms, regional rebellions, and endless external border conflicts. The colossal ashlar causeways, fortified weirs, and deepwater river booms found across the Marches are the bones of an ancient, monumental civilization that hollowed out long before its legions withdrew.",
        "The <b>Broken Crown War</b> thirty years ago was not the beginning of the fall, but the Empire's final, convulsive death rattle. A catastrophic war of succession fought across the western provinces bled the imperial treasury white, shattered the remaining noble dynasties, and permanently splintered the realm. In the vacuum left behind, the imperial center simply went silent—never formally releasing its frontier holdings, but abandoning them entirely to the elements.",
        "Today, the continent is a fractured patchwork of ruined successor territories, petty warlords, and grasping frontier barons (like Aldous Karr) squabbling over broken provinces, each attempting to carve out petty kingdoms in the shadow of an empire long dead."
      ],
      see: ["imperial_booms", "sanctuary_charter", "baron_karr"]
    },
    {
      id: "imperial_booms", category: "history", title: "Submerged Anti-Galley Booms & Imperial Hydraulics",
      link: ["anti-galley booms"],
      sub: "Iron chains in the riverbed",
      tags: ["Empire", "Grey River"], aliases: ["booms", "anti-galley", "winches", "hydraulics"],
      unlock: "codex_imperial_booms",
      body: [
        "Centuries ago, legion hydraulic sappers engineered massive underwater anti-galley iron booms across key choke points along the Grey River. Weighted by counterweight release winches housed in dry ashlar vaults beneath limestone weir foundations, these massive iron chains were built to rip the keels from invading warships. When imperial garrisons withdrew thirty years ago taking their blueprints with them, the submerged booms remained frozen in the riverbed—unnoticed by shallow local skiffs, but lethal obstacles to heavy five-foot-draught deepwater transport barges."
      ],
      see: ["grey_river", "meridian_empire"]
    },
    {
      id: "letters_of_credit", category: "history", title: "Letters of Credit & Provincial Toll Tariffs",
      link: ["Letters of Credit", "Letter of Credit"],
      sub: "How the Scales move money",
      tags: ["Trade", "Law"], aliases: ["credit", "banking", "counting house", "vault", "tariff", "tolls"],
      unlock: "codex_letters_of_credit",
      body: [
        "The commercial banking system engineered by the Gilded Scales to facilitate long-distance river trade without transporting vulnerable iron coin-chests along bandit-infested roads. Merchants and mercenary companies deposit bullion in regional counting houses, receiving wax-sealed, certified vellum drafts redeemable at full value (minus administrative tariff) in any affiliated vault across the province."
      ],
      see: ["gilded_scales"]
    },
    {
      id: "sanctuary_charter", category: "history", title: "Ecclesiastical Sanctuary & Parish Commutation",
      link: ["Parish Commutation"],
      sub: "Church ground the bailiffs cannot enter",
      tags: ["Law", "Faith"], aliases: ["sanctuary", "commutation", "parish", "charter", "chapel"],
      unlock: "codex_sanctuary_charter",
      body: [
        "An enduring legal mechanism dating back to the Old Meridian Provincial Charter. Ecclesiastical grounds hold inviolable sanctuary status: secular bailiffs, merchant factors, and debt enforcers are forbidden under holy law from crossing the chapel lintel to seize laborers or debtors.",
        "In practice, frontier parishes maintain this autonomy through an uneasy commercial compromise known as <i>Parish Commutation</i>—sheltered refugees spin wool, weave cloth, and mend sacks on church looms, allowing the deacon to pay a quarterly fee from textile sales to the city's counting houses to satisfy commercial ledgers."
      ],
      see: ["saint_althea", "meridian_empire", "alderford"]
    },

    /* ------------------------------------------------------ FAITH & FOLKLORE */

    {
      id: "saint_althea", category: "lore", title: "Saint Althea the Mender & the Sun-Father",
      link: ["Saint Althea", "Althea", "Sun-Father"],
      sub: "The frontier's folk saint",
      tags: ["Faith"], aliases: ["Althea", "Sun-Father", "Saint Althea of the Shroud", "pantheon", "prayer"],
      unlock: "codex_saint_althea",
      body: [
        "In the marble cathedrals of Port Valen, high bishops sing choral litanies to the <b>Sun-Father</b> in his golden plate, sovereign deity of imperial emperors, oaths, and high justice. But across the cold mud of the frontier marches, common folk, weavers, and watermen pray to his daughter, <b>Saint Althea of the Shroud</b>.",
        "Revered as the patroness of needle, loom, herb, and bandage, Saint Althea is the divinity of those who mend what secular violence tears apart. Rivermen offer river pebbles polished smooth by the current at her altar before casting off on the downriver run, trusting her grace for safe passage along the waterways."
      ],
      see: ["sanctuary_charter", "weir_knots"]
    },
    {
      id: "the_drowned", category: "lore", title: "The Drowned — {{warlock_patron_title}}",
      sub: "Your patron",
      tags: ["Occult"], aliases: ["patron", "warlock", "pact", "the Drowned"],
      unlock: "codex_the_drowned",
      body: [
        "{{warlock_patron_desc}} You carry a cold, unspoken weight behind your ribs that wasn't there before the Dawn Trial—a debt to something that has not yet named its price."
      ]
    },
    {
      id: "weir_knots", category: "lore", title: "River Folklore & Weir-Knots",
      link: ["weir-knots", "weir-knot"],
      sub: "A waterman's charm",
      tags: ["Folklore", "Grey River"], aliases: ["weir-knot", "talisman", "charm", "flax cord", "river pebbles"],
      unlock: "codex_weir_knots",
      body: [
        "Traditional talismans crafted by river barge skippers and parish weavers. Made from tightly braided flax cord knotted around three river pebbles polished smooth by the current, the weir-knot is a common traveler's charm carried by watermen along the Grey River to stay grounded against the river's cold damp and sudden changes in the current."
      ],
      see: ["saint_althea"]
    },
    {
      id: "silt_lurkers", category: "lore", title: "Silt Lurkers of the Culvert",
      link: ["silt lurkers", "Silt Lurkers", "silt lurker"],
      sub: "Blind predators under the weirs",
      tags: ["Bestiary", "Grey River"], aliases: ["silt lurkers", "lurkers", "creatures", "culvert", "flume", "amphibious"],
      unlock: "codex_silt_lurkers",
      body: [
        "Vicious, blind amphibious predators that infest the subterranean flumes, drainage vaults, and flooded culverts beneath ancient weir foundations. Adapted to total darkness and murky river silt, they hunt in coordinated packs, using needle-sharp teeth, sensory barbels, and sudden subterranean ambushes to drag prey beneath the water."
      ],
      see: ["imperial_booms"]
    }

  ]
};

})();
