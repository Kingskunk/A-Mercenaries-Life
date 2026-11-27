/*
 * RP KNOWLEDGE: HARTWELL. What people of the viscounty town and the villages under it know of each other, past the realm
 * pool's entries on Hartwell, Oxworth and Palmcote. Facts from lorebook-hartwell.js. Format: rp-knowledge/registry.js.
 */
RPKnowledge.pool("hartwell", {
  title: "Hartwell",
  entries: [
    {
      id: "daven_marsh", title: "Daven Marsh", aliases: ["Daven", "the cattle buyer", "the tax collector"], see: "daven_marsh",
      common: function (s) {
        var t = "A loud, heavy-set cattle buyer and tax collector out of Hartwell who works Oxworth's pens with hired drovers.";
        if (s.ox_hh_daven_dead === true || s.ox_hh_daven_dead === "true") return t + " He died in a fight in the Yoke & Horn's cart yard; his widow Vera keeps the buying accounts now.";
        if (s.ox_hh_ending === "exposed_to_bram") return t + " His tax books were found crooked, charging Oxworth herders double, and the cattlemen hauled him to Hartwell in rope.";
        return t;
      }
    }
  ]
});
