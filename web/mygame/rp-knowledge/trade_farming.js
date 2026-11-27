/*
 * RP KNOWLEDGE: TRADE, FARMING. What working farm folk know of the land and its work, wherever they live.
 * Kept general: a place's own crops and customs go in its local pool. Format: rp-knowledge/registry.js.
 */
RPKnowledge.pool("trade.farming", {
  title: "Farming",
  entries: [
    {
      id: "tenant_rent", title: "Rent and leases", aliases: ["rent", "the lease", "tenant", "debt note", "the landlord"],
      common: "Most farm folk rent their land from an estate on a lease. Rent is paid in a share of the crop, weighed at the estate's scale, and a bad year means a debt note to the landlord. Lose the lease and the family loses its living.",
      learned: "Estates let land on written leases and take rent as a share of the crop, weighed at their own scale. Shortfalls become debt notes, and a landlord who holds enough of them can take the lease back."
    },
    {
      id: "terraces", title: "Terraces and walls", aliases: ["terrace", "drystone wall", "the walls"],
      common: "Hillside fields are held up by drystone walls in steps. A fallen wall loses a season's earth, so keeping them up is everyone's work, and quarrels over them go to the village head."
    },
    {
      id: "olive_work", title: "Olives", aliases: ["olive", "olives", "picking", "pressing", "oil", "the press"],
      common: "Olives are picked into baskets, carried to the press and crushed for oil; the best oil comes from fruit pressed fast. Picking is long, stooping work for the whole family, and the oil is sold down in the market towns."
    }
  ]
});
