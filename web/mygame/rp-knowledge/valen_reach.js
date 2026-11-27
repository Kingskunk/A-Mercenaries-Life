/*
 * RP KNOWLEDGE: THE VALEN REACH. What the Reach's own people know of the Scales and Port Valen's quarters, past the realm
 * pool's entries on the Reach's towns. Dredge-End has its own local pool. Facts from lorebook-data.js and
 * lorebook-port-valen.js. Format: rp-knowledge/registry.js.
 */
RPKnowledge.pool("valen_reach", {
  title: "The Valen Reach",
  entries: [
    {
      id: "gilded_scales", title: "The Gilded Scales", aliases: ["the Council", "Council of Factors", "First Factor", "factors"], see: "gilded_scales",
      common: "The merchants who run Port Valen and the river: the timber, the grain barges and the toll-gates. Their clerks and factors are everywhere along the Reach, and the Council of Factors sits on the Heights.",
      learned: "A cartel of river merchants and guild-masters with its head house on Civic Heights. A First Factor speaks for it on war, treaty and city policy, answering to the Council of Factors, the senior merchant houses that rule Port Valen. Appointed officers under them run records, taxes, courts and the Port Watch. Through the Council they fund the city's war charter."
    },
    {
      id: "civic_heights", title: "Civic Heights", aliases: ["the Heights", "the Council Hall", "the cathedral", "the Magistrates' Court", "the Hiring Hall", "the Port Watch"], see: "civic_heights",
      common: "The top of the city: a limestone plaza with the Council Hall, the tax windows, the Hiring Hall, the Port Watch and the magistrates' court. The cathedral's bells carry over every district, and charity kitchens feed the poor on its steps.",
      learned: "The top of the city: a limestone plaza with the Council Hall, the tax windows, the Hiring Hall, the Port Watch and the magistrates' court. The cathedral's bells carry over every district, and charity kitchens feed the poor on its steps. The Council Hall's east wing holds the tax windows and the Hiring Hall, its west wing the public Magistrates' Court, with the Port Watch headquarters beside it. The Gilded Scales' head house stands beside the Council Hall."
    },
    {
      id: "patrician_quarter", title: "The Patrician Quarter", aliases: ["the merchant houses"], see: "patrician_quarter",
      common: "Where the rich live, beside the Heights: the merchant houses' townhouses and estates, and shops too dear for ordinary folk.",
      learned: "The estates of the senior merchant houses that sit on the Council of Factors, with the fine tailor, bookseller and jeweler that serve them."
    },
    {
      id: "middle_ward", title: "The Middle Ward", aliases: ["Conduit Square", "Smiths' Row", "Lantern Lane", "the Second Terrace"], see: "middle_ward",
      common: "The biggest ward in the city, on the broad terrace between the docks and the Heights: timber shops over narrow lanes, smiths, workshops, wagon yards and bakeries. Conduit Square with its lion fountain is the crossroads.",
      learned: "The biggest ward in the city, on the broad terrace between the docks and the Heights: timber shops over narrow lanes, smiths, workshops, wagon yards and bakeries. Conduit Square with its lion fountain is the crossroads. Most of the city stands on the Second Terrace. The trunk road runs through Conduit Square and out of the city by the River Gate and the Charter Gate; Smiths' Row and the wagon yards serve the road trade."
    },
    {
      id: "harbor_quayside", title: "The harbor quays", aliases: ["the Quayside", "the quays", "the docks", "the Cargo Quay", "the Weigh House", "the Cleaved Keel", "the Fishmongers' Slip"], see: "harbor_quayside",
      common: "One long line of stone and timber along the estuary: the fish market, low taverns like the Cleaved Keel, the Cargo Quay with its great cranes and the Weigh House, the customs tower, the shipyards and the breakwater.",
      learned: "One long line of stone and timber along the estuary: the fish market, low taverns like the Cleaved Keel, the Cargo Quay with its great cranes and the Weigh House, the customs tower, the shipyards and the breakwater. Merchant ships ride in the outer roadstead while barges and fishing smacks crowd the inner docks. Every cargo is weighed and taxed at the Weigh House under the customs tower; the harbor's outer boom chains close the main channel."
    }
  ]
});
