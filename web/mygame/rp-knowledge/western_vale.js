/*
 * RP KNOWLEDGE: THE WESTERN VALE. What the Vale's own people know of their lords and country, past the realm pool's
 * entries on its towns. Facts from lorebook-data.js (house_gault, western_vale) and WESTERN_VALE_NOBILITY_PLAN.md.
 * Format: rp-knowledge/registry.js.
 */
RPKnowledge.pool("western_vale", {
  title: "The Western Vale",
  entries: [
    {
      id: "house_gault", title: "House Gault", aliases: ["the Gaults", "the Countess", "Countess Avelina", "Avelina Gault", "the golden horse"], see: "house_gault",
      common: "The great lords of the Vale, at Dunmow. A Countess heads the house now. Their riders pass on the roads now and then, their arms are a golden horse on blue, and the taxes go up to them in the end.",
      learned: "Countess Avelina Gault holds the Vale from Dunmow. Under her are two viscounties, Hartwell under House Falwick and Harwick under House Reyner, and the Crown castles at Carrowmark and Dennholt, sworn to her directly. Gault fields mounted riders and archers, keeps no harbor or fleet, and sends its hemp, wool and wine to the sea on Scales barges. It has no ore of its own, so its iron comes from Stenmark or on Scales wagons.",
      secret: "In the Broken Crown War, the Countess's father promised Baron Karr freedom from Gault's overlordship for his help against the failing Empire. He died in the war, and the peace that followed shorted Karr on the border land the promise implied. Gault's court knows it, never admits it, and keeps the old quarrel as leverage. It is why the border sees skirmishes but never war."
    },
    {
      id: "vale_roads", title: "The Vale roads", aliases: ["Coombe Gap", "Iron Gap", "the wagon road"],
      common: "The Vale's wagons go east to the river through Coombe Gap. North, Iron Gap climbs into the Crags, where the Baron's men take tolls.",
      learned: "Coombe Gap, Gault's road, takes the Vale's wagons east toward the river. Iron Gap climbs north into Stenmark; Carrowmark, a Gault fortress, watches it, and there is no direct trade with Karr: what crosses goes through the Gilded Scales."
    }
  ],
  rumors: {
    valen_reach: { common: "everything in Port Valen costs double, and the Scales would sell their own mothers by weight." },
    port_valen: { common: "everything in Port Valen costs double, and the Scales would sell their own mothers by weight." },
    stenmark: { common: "the Baron's riders would take the seed corn from a dying man." }
  }
});
