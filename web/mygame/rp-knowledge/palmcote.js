/*
 * RP KNOWLEDGE: PALMCOTE. The olive village's people and places, as its own people know them.
 * Facts from lorebook-hartwell.js and rp-data.js (Short Weight endings). Format: rp-knowledge/registry.js.
 */
(function () {
  function truthy(v) { return v === true || v === "true"; }

  RPKnowledge.pool("palmcote", {
    title: "Palmcote",
    entries: [
      {
        id: "nora_greer", title: "Nora Greer", aliases: ["Nora", "the village head", "the Gathering Hall", "the register"], see: "nora_greer",
        common: "Palmcote's village head, a spare, watchful woman in her late fifties with an ash stick. She keeps the village register at the Gathering Hall at the foot of the lane and hears terrace-wall quarrels there.",
        learned: "Palmcote's village head, a spare, watchful woman in her late fifties with an ash stick. She keeps the village register at the Gathering Hall at the foot of the lane and hears terrace-wall quarrels there. Calm and diplomatic; she settles terrace-wall matters, posts Hartwell's road notices and local errands on the hall's rack, and promises fair dealing to travellers who respect the walls and pay their way."
      },
      {
        id: "odda_pellam", title: "Odda Pellam", aliases: ["Odda", "the Green Branch", "the inn"], see: "odda_pellam",
        common: "Keeps the Green Branch, the inn just above the hall: a stout woman in her sixties with a long grey braid. She bakes the bread, ladles bean-and-olive stew and rents the rooms upstairs. Don't spit olive stones on her tiles."
      },
      {
        id: "house_ferrand", title: "House Ferrand", aliases: ["the big house", "the estate", "the manor", "Ferrand", "the steward", "the pressing house"], see: "house_ferrand",
        common: "The big house: the grey stone manor behind the high wall at the crest. Its burned olive-tree mark is on every cart, lease and scale box. Its people never come down to drink, and the village does not go up.",
        learned: "The noble family who own Palmcote's estate: the manor, the terraces, the leases and the pressing house. They live in Hartwell; an estate steward runs the estate, with a bailiff over the weighing yard."
      },
      {
        id: "bailiff_kelm", title: "Bailiff Kelm", aliases: ["Kelm", "the bailiff", "the scale", "the weights"], see: "bailiff_kelm",
        common: function (s) {
          var t = "The estate's bailiff, a thickset man who weighs the pickers' baskets at the pressing house scale.";
          var e = s.pc_sw_ending;
          if (e === "exposed") {
            if (truthy(s.pc_sw_kelm_dead)) return t + " His brass weights were found bored hollow and packed with lead, cheating every picker. He is dead now, and the estate sent down a new man; the weights are honest.";
            return t + " His brass weights were found bored hollow and packed with lead, cheating every picker, and it came out in front of the whole lane at the Gathering Hall. He is gone; the estate sent down a new man and the weights are honest.";
          }
          if (e === "raided") return t + " He was found dead in the pressing house beside hidden oil casks, his cashbox emptied. The estate steward calls it road robbers.";
          return t + " Pickers grumble that their baskets weigh light at his scale.";
        }
      }
    ]
  });
})();
