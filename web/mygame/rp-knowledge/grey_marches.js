/*
 * RP KNOWLEDGE: THE GREY MARCHES (kingdom-wide pool). What people living in the Marches know of this kingdom, its four
 * regions/duchies, and its places. Characters from other kingdoms do not include this pool (they only share a future
 * continent-level pool unless traveled). Inside this kingdom pool:
 *   - Capitals & realm-wide facts (Port Valen, Dunmow, the four regions): no commonIn — known across the whole kingdom.
 *   - Major road/market towns (Alderford, Timbermouth, Langston, Hartwell, Brandreth, Gryke): commonIn includes
 *     "grey_marches" plus their own region/local pools — known at common level across the kingdom, and upgraded to
 *     learned for learned characters of their own region/town.
 *   - Small villages & hamlets (Barleycross, Ashrun Holt, Redvein, Oxworth, Palmcote, etc.): commonIn lists only their
 *     own region/local pools — unknown outside their region unless a character has grey_marches: "learned".
 * Format: rp-knowledge/registry.js.
 */
RPKnowledge.pool("grey_marches", {
  title: "The Grey Marches",
  entries: [

    /* ------------------------------------------------------------------ THE REALM */

    {
      id: "grey_marches", title: "The Grey Marches", aliases: ["the Marches", "the frontier", "the borderland"], see: "grey_marches",
      common: "The frontier country between the coast and the northern highlands, split by the Grey River, which runs south to Port Valen. Four powers hold it: the Gaults at Dunmow (grain, hemp, horses), the Scales in Port Valen (money, barges, tolls), the Baron up in the Crags (iron) and the warlord in the bog (peat). None of them can close a road without going short.",
      learned: "The frontier country between the coastal routes and the northern highlands: highland valleys north of the Grey River, downland and farms west of it, peat bog and reed flats east of it. Countess Avelina Gault holds the Western Vale from Dunmow; the Gilded Scales' Council of Factors governs the Valen Reach from the free city of Port Valen; Baron Aldous Karr holds Stenmark under the southern Crags; Warlord Skell holds the Great Sedge from Gryke. Iron, grain and fuel tie them together: each holds something the others need. Most titles rest on imperial patents nobody has renewed since the legions left."
    },
    {
      id: "grey_river", title: "The Grey River", aliases: ["the Grey", "the river"], see: "grey_river",
      common: "The great river of the Marches, running south to Port Valen and the sea. Barges and tolls on it belong to the Scales.",
      learned: "The river that splits the Marches, running south from the weir at Alderford to Port Valen, where it meets the Ashrun and spreads into the estuary. The Gilded Scales hold its barges and toll-gates."
    },
    {
      id: "meridian_empire", title: "The Meridian Empire", aliases: ["the Empire", "the legions", "imperial"], see: "meridian_empire",
      common: "The Empire ruled here once. Its legions left about thirty years ago and never came back. The great stone causeways, weirs and river booms are what it left.",
      learned: "The Empire was failing for centuries before it fell: bureaucratic rot, warring client kingdoms, rebellions and border wars. Its legions withdrew thirty years ago and its center went silent without ever giving up its frontier holdings. The continent is now a patchwork of successor territories and petty warlords."
    },
    {
      id: "broken_crown_war", title: "The Broken Crown War", aliases: ["the old war", "the war"], see: "broken_crown_war",
      common: "The old war folk still curse, about thirty years back, when the Empire was coming apart.",
      learned: "A war of succession fought across the western provinces thirty years ago. It drained the imperial treasury, broke the last noble dynasties and split the realm for good. It did not start the Empire's fall; it was the last blow."
    },

    /* ------------------------------------------------------------------ THE FOUR REGIONS */

    {
      id: "western_vale", title: "The Western Vale", aliases: ["the Vale", "the Gaults", "Gault country"], see: "western_vale",
      common: "The open farm country west of the Grey River: grain, hemp, vineyards, sheep and horses. The Gaults rule it from Dunmow, a walled city on a lake.",
      learned: "Open grassland and river-fed farms west of the Grey, with market towns such as Fallowfield and Langston. House Gault rules it from Dunmow on Azure Lake. Coombe Gap leads east to the river; Iron Gap climbs north into Baron Karr's Crags."
    },
    {
      id: "valen_reach", title: "The Valen Reach", aliases: ["the Reach", "the Scales", "the free city"], see: "valen_reach",
      common: "The river country run from Port Valen. The Scales, the merchants there, run the river trade and the tolls, and their clerks and factors are everywhere along it.",
      learned: "The river territory governed from Port Valen, a free city since the Old Charter of Meridian. It has no king or hereditary ruler: the Gilded Scales' Council of Factors governs through factors, customs houses, toll collectors and courts. Formal documents style it the Free City of Port Valen and the Valen Reach."
    },
    {
      id: "stenmark", title: "Stenmark", aliases: ["the Crags", "the Highland Crags", "Baron", "Karr", "the highlands"], see: "stenmark",
      common: "The high valleys and passes up in the Crags, where the iron comes from. The Baron there is a hard man, and his tax riders take grain by force.",
      learned: "Baron Aldous Karr's barony in the southern Crags, a range of steep granite ravines: high valleys, passes and forges, with Karr's Keep above the market town of Brandreth. His guards hold the roads south through Black Pike Gate and west through Iron Gap. His steel tax has emptied some of the highland shops."
    },
    {
      id: "great_sedge", title: "The Great Sedge", aliases: ["the Sedge", "the bog", "the fen", "the warlord", "Skell"], see: "great_sedge",
      common: "The bog country east of the causeway: peat, reeds, eels and black water. A warlord holds it, and only the fen people know the dry paths.",
      learned: "Peat bog, reed beds and black meres east of the causeway. Warlord Skell holds it from Gryke, an old legion fort sinking into the fen, and takes tribute in peat, eels and spearmen. Its towns stand on piles; its brushwood tracks are known only to the fen people."
    },

    /* ------------------------------------------------------------------ THE VALEN REACH */

    {
      id: "port_valen", title: "Port Valen", aliases: ["Valen", "the port", "the city"], see: "port_valen",
      common: "The big port city where the Grey River meets the sea, full of ships, sellswords and Scales money. It climbs the slope behind its harbor in grey stone terraces, rich at the top and poor down by the canal.",
      learned: "A free city since the Old Charter of Meridian, where the Grey and the Ashrun meet and spread into the estuary. From Civic Heights its Council and factors administer the whole Reach. It runs down in layers: the Heights and the Patrician Quarter, the workshops of the Middle Ward, the harbor quays, and Dredge-End by the canal, old, poor and run by the Black Oath."
    },
    {
      id: "alderford", title: "Alderford", aliases: ["the weir"], see: "alderford", commonIn: ["grey_marches", "valen_reach", "stenmark"],
      common: "A river town at the old imperial weir where the highland road meets the head of the Grey. Sawmills, curing lofts and barges loading salt fish for the run downriver.",
      learned: "A small salt-and-plank town built around an imperial limestone weir at the head of the Grey, where the highland road comes down from the Crags. Salt comes up the High Grey Road from Valen; the river catch is cured and packed into firkins for the barges. The Scales' barges and freight rates carry the power there, not the town."
    },
    {
      id: "whitefold", title: "Whitefold", aliases: [], see: "whitefold", commonIn: ["valen_reach"],
      common: "A sheep-and-quarry village at the southern foot of the Coldspine, north of Alderford: fold yards and lambing sheds, and lime kilns under a pale quarry face.",
      learned: "Low stone steadings on the pale ground under the Coldspine, where the Limestone Cut road meets the foothill road to Redvein. Its work is split between the flocks, baled at the shared Fleecefold, and the quarry's cut stone and lime."
    },
    {
      id: "redvein", title: "Redvein", aliases: [], see: "redvein", commonIn: ["valen_reach"],
      common: "A mining village in the Coldspine foothills north of Alderford, under red spoil heaps. Ore goes down to Alderford by wagon.",
      learned: "A mining village in a fold of the Coldspine's southern foothills on the Eastcut Road. Ore is sorted, weighed and sold at the yard before the mine mouths; the Gather House handles its public business and the Red Lantern is its inn."
    },
    {
      id: "timbermouth", title: "Timbermouth", aliases: [], see: "timbermouth", commonIn: ["grey_marches", "valen_reach"],
      common: "A timber road town at the edge of the Longshade forest, on the Ashrun. Sawmill, ash timber and a Scales factor's hall.",
      learned: "A road town of timber houses around a paved square at the edge of the Longshade, with roads toward the river, the forest and the farm country. The Ashrun turns its sawmill, graded ash stands under open sheds, and the Gilded Scales keep a factor's hall on the square."
    },
    {
      id: "barleycross", title: "Barleycross", aliases: [], see: "barleycross", commonIn: ["valen_reach"],
      common: "A farming village near Timbermouth where four farm roads meet: barley, oats, hay and a grain mill on the brook.",
      learned: "An unwalled village of some forty farmsteads around a broad common, with a grain mill on the brook and a timber Gathering Hall. Households sell farm goods from baskets at their gates."
    },
    {
      id: "ashrun_holt", title: "Ashrun Holt", aliases: ["the Holt"], see: "ashrun_holt", commonIn: ["valen_reach"],
      common: "A village of log houses in a clearing in the Longshade, where cutters, charcoal burners and trappers live. A great old ash hung with ribbons stands at its middle.",
      learned: "A village of log houses in a clearing in the Longshade, where cutters, charcoal burners and trappers live. A great old ash hung with ribbons stands at its middle. A forest village where the Ashrun comes out from under the trees. Families stack marked log decks on the stream bank and send timber down to Timbermouth; carters wait by the stream to buy."
    },
    {
      id: "longshade", title: "The Longshade", aliases: ["the forest"], see: "longshade", commonIn: ["valen_reach"],
      common: "The great dark forest west of Timbermouth, where the Ashrun begins. Folk keep to its edge.",
      learned: "A vast, dense forest of pine, oak and ash fed by the Ashrun's headwaters. Cutters, charcoal burners and trappers work its outer edge around Ashrun Holt; few go deep under the canopy."
    },
    {
      id: "brinewick", title: "Brinewick", aliases: [], see: "brinewick", commonIn: ["valen_reach"],
      common: "A salt village out on the tidal flats, inside an earth bank: brine beds and peat-fired pan sheds.",
      learned: "A village inside an earthen bank where the road meets the tidal flats. It makes salt by standing brine in shallow beds and boiling it in peat-fired pan sheds; salt and fish trade at its loading slip, and the raised Tide House is its refuge and council room."
    },
    {
      id: "marlcross", title: "Marlcross", aliases: ["the Milling Fair"], see: "marlcross", commonIn: ["valen_reach"],
      common: "A rye village on the eastern high ground where the High Grey Road meets three farm tracks. Its yearly Milling Fair is known for pies, prizes and a very public contest.",
      learned: "A rye village on the eastern high ground where the High Grey Road meets three farm tracks. Its yearly Milling Fair is known for pies, prizes and a very public contest. A village around an old stone cross and the Cross Hall. Its rye is weighed on the Grain Green and goes on to the drying floors, the windmill and raised storehouses."
    },
    {
      id: "black_sinks", title: "The Black Sinks Causeway", aliases: ["the causeway", "the Black Sinks", "the Sinks"], see: "black_sinks", commonIn: ["valen_reach", "great_sedge"],
      common: "The old imperial road across the Sinks, between the bog and the range: the only ground there that still carries wheels.",
      learned: "An imperial dike-road across the Sinks with a squat gatehouse at its eastern end. The Iron Carrion company took the gatehouse for Valen and holds it."
    },

    /* ------------------------------------------------------------------ THE WESTERN VALE */

    {
      id: "dunmow", title: "Dunmow", aliases: ["Azure Lake"], see: "house_gault",
      common: "The Gaults' walled city, on the shore of a great lake in the west of the Vale.",
      learned: "House Gault's walled seat on the shore of Azure Lake, with a wood along the lake's southwest side. Gault kept its storehouses shut and its gates manned when the legions left, and has held it since."
    },
    {
      id: "langston", title: "Langston", aliases: ["Langston Hall"], see: "langston", commonIn: ["grey_marches", "western_vale"],
      common: "A walled market town on the Vale's wagon road, with a market square, a fountain and a hall up the steps.",
      learned: "A walled trading town on the Vale's wagon road, held directly by the Countess rather than any viscount; Gault's arms hang over Langston Hall, where the mayor hears disputes. The villages of Fallowmere, Barolo and Broadmead lie around it."
    },
    {
      id: "fallowmere", title: "Fallowmere", aliases: [], see: "fallowmere", commonIn: ["western_vale", "fallowmere"],
      common: "A quiet farming village west of Langston's fields, around a green and a goose pond. Its carts feed Langston with grain, beans and greens.",
      learned: "A village of whitewashed, thatched cottages on level farmland at the western edge of Langston's fields. Aubrey Fenn is its village head; the Grey Gander is its inn."
    },
    {
      id: "barolo", title: "Barolo", aliases: [], see: "barolo", commonIn: ["western_vale", "barolo"],
      common: "The wine village on a chalk rise east of Langston, among terraces of vines, with manor houses looking out over the Vale.",
      learned: "A stone-built village of growers and the centre of a wider vineyard country, east of Langston. Three houses dominate it: Veyre at the old manor on the crest, Durnell with its freight yard, and Avenel at the lower farm. Hobart Thring is its village head; the Red Stave is its inn."
    },
    {
      id: "broadmead", title: "Broadmead", aliases: [], see: "broadmead", commonIn: ["western_vale"],
      common: "A sheep and cattle village on a damp meadow under a bare down, north-west of Langston. Drovers move flocks and wool carts from it to the Vale road.",
      learned: "A stone-and-thatch village along one lane and a humped bridge, its meadows cut up by fences of every age: branded post-and-rail around the best grass, older walls and hedges up toward the common on the down. Who may graze where is a running quarrel there."
    },
    {
      id: "hartwell", title: "Hartwell", aliases: ["the Viscountess", "Viscountess Odile", "Odile Falwick", "the patrol"], commonIn: ["grey_marches", "western_vale", "hartwell"],
      common: "The town where the villages under it sell their olives, oil, cattle and hides. The Viscountess Odile Falwick governs it, and her patrol rides the roads around it. Above her are the Gaults at Dunmow.",
      learned: "The viscounty town, seat of Viscountess Odile Falwick of House Falwick, who answers to Countess Avelina Gault. The downland and hillside villages under it, Oxworth and Palmcote among them, send their goods to its storehouses and markets. Minor noble houses with estates in those villages, such as House Ferrand, live in Hartwell, not on their land."
    },
    {
      id: "oxworth", title: "Oxworth", aliases: ["the cattle village", "the salting yard", "Yoke & Horn"], see: "oxworth", commonIn: ["western_vale", "hartwell", "oxworth"],
      common: "The cattle village on the open down west of Hartwell: holding pens, a salting shed and an inn called the Yoke & Horn. It lives on grass, salt and tallow.",
      learned: "A cattle and salting village on the down west-northwest of Hartwell, built around a rutted cattle lane. Bram Tallow, the village head, keeps the hall; Sigrin Copperpot keeps the Yoke & Horn. It cures salted beef and tallow for Hartwell's storehouses."
    },
    {
      id: "palmcote", title: "Palmcote", aliases: ["the olive village"], see: "palmcote", commonIn: ["western_vale", "hartwell", "palmcote"],
      common: "The olive village on a sunny slope above Hartwell: one steep lane of pale stone houses and terraces of olive trees all round. Everyone there picks, carts or presses olives.",
      learned: "A hillside olive village under Hartwell, a single steep lane with drystone terraces. Nora Greer is its village head. House Ferrand owns the estate at the crest: the terraces, the leases and the pressing house."
    },

    /* ------------------------------------------------------------------ STENMARK AND THE SEDGE */

    {
      id: "brandreth", title: "Brandreth", aliases: ["Karr's Keep"], see: "karrs_keep", commonIn: ["grey_marches", "stenmark"],
      common: "Stenmark's market town, under Karr's Keep, the Baron's granite fortress in the Crags.",
      learned: "Stenmark's market town, under Karr's Keep. Karr's guards hold the roads south through Black Pike Gate and west through Iron Gap."
    },
    {
      id: "ashbrook", title: "Ashbrook", aliases: [], see: "ashbrook", commonIn: ["stenmark"],
      common: "A poor tenant-farming village in the high valleys. The Baron's riders burned it when his tax collectors came for the grain, salting cellars and all.",
      learned: "A tenant village in the high valley foothills, burned by Karr's riders while his collectors seized the grain tax by force. It is the example people give of the Baron's tax."
    },
    {
      id: "gryke", title: "Gryke", aliases: ["the sinking fort"], see: "great_sedge", commonIn: ["grey_marches", "great_sedge"],
      common: "The warlord's seat: an old legion fort out in the fen, slowly sinking into it.",
      learned: "The warlord's seat: an old legion fort out in the fen, slowly sinking into it. The legion fort whose garrison dissolved where it stood thirty years ago. Skell took command of the ruins and holds the Sedge from there."
    }
  ]
});
