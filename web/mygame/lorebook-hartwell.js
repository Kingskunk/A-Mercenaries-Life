/*
 * LOREBOOK: HARTWELL & OXWORTH -- Oxworth on the open down and the people who run its hall and inn.
 *
 * Same entry format as lorebook-data.js. This file appends to window.LOREBOOK, so it loads after lorebook-data.js.
 * Every entry unlocks when the player reaches the place or learns the person's name, and reveals later facts only when their matching scene flags are set.
 *
 * Places: Oxworth (incorporating The Village Head's Hall, The Yoke & Horn, Oxworth Market, and The Salting & Cattle Yard).
 * People: Bramwell "Bram" Tallow, Sigrin Copperpot.
 */
(function () {
  "use strict";

  var L = window.LOREBOOK;
  if (!L || !L.entries) return;
  function truthy(v) { return v === true || v === "true"; }

  Array.prototype.push.apply(L.entries, [

    /* ------------------------------------------------------------------ PLACES */

    {
      id: "oxworth", category: "places", title: "Oxworth",
      sub: "A cattle and salting village on the open down under Hartwell",
      tags: ["Oxworth", "Hartwell", "Western Vale", "Trade", "Lodging"],
      aliases: [
        "Oxworth", "cattle lane", "The Village Head's Hall", "Village Head's Hall",
        "The Yoke & Horn", "Yoke & Horn", "Oxworth Market",
        "The Salting & Cattle Yard", "Salting & Cattle Yard", "salting shed"
      ],
      link: [
        "Oxworth", "The Village Head's Hall", "Village Head's Hall",
        "The Yoke & Horn", "Yoke & Horn", "Oxworth Market",
        "The Salting & Cattle Yard", "Salting & Cattle Yard"
      ],
      unlock: function (s) { return truthy(s.ox_seen) || truthy(s.ox_arrival_seen); },
      body: function (s) {
        var out = [
          "A squat cattle and herding village on the open down west-northwest of Hartwell, built around a wide, rutted cattle lane rather than a village green. Heavy split-rail holding pens with timber gates and stone troughs flank the approaches, while low cottages of rough fieldstone and dark timber huddle under deep thatch against the downs wind.",
          "At the head of the lane sits a timber-and-turf hall; across from the main pens stand market trestles, an iron beam-scale, a stone salting shed with brick chimneys, and a low stone inn hung with a carved wooden yoke and horn. Woodsmoke, damp hide, cold brine, and cattle hang heavy in the air."
        ];
        if (truthy(s.ox_hall_seen)) {
          if (truthy(s.met_ox_head)) {
            out.push("The Village Head's Hall sits off the lane behind a mud-scraped porch and hitching rail. Inside, [[bram_tallow|Bramwell \"Bram\" Tallow]] works from a scarred oak counter beneath shelves of horn tallies, settling fence claims and overseeing the Contract Board beside the back door.");
          } else {
            out.push("The Village Head's Hall sits off the lane behind a mud-scraped porch and hitching rail. Inside, a broad-shouldered village head handles fence claims at a scarred oak counter beneath shelves of horn tallies, with road postings pinned beside the back door.");
          }
        }
        if (truthy(s.ox_yh_seen)) {
          if (truthy(s.met_sigrin)) {
            out.push("The Yoke & Horn is Oxworth's low stone inn near the crossroads, run by [[sigrin_copperpot|Sigrin Copperpot]]. Its common room serves beef-and-root stew, dark barley ale, private rooms above the stables, and a small cart yard behind the house.");
          } else {
            out.push("The Yoke & Horn is Oxworth's low stone inn near the crossroads. Its common room serves beef-and-root stew, dark barley ale, private rooms above the stables, and a small cart yard behind the house.");
          }
          if (truthy(s.ox_yh_asked_dice) || truthy(s.ox_yh_dice_met)) {
            out.push("After dark, cattlemen and wagoners clear a table by the inn hearth for small-stakes bone dice games while the innkeeper watches the slate.");
          }
        }
        if (truthy(s.ox_market_seen)) {
          out.push("Oxworth Market fills the trampled yard beside the main cattle pens with canvas awnings, scarred butcher's blocks, and a heavy iron beam-scale weighing out salted beef, tallow tubs, raw hides, grain, cloth, and road gear.");
        }
        if (truthy(s.ox_yard_seen)) {
          out.push("The Salting & Cattle Yard pairs a long stone curing shed and stacked oak salt casks with hide-stretching racks and slatted holding pens, hiring steady backs by the half-day to haul salt or mend hurdles.");
        }
        return out;
      },
      see: ["western_vale", "broadmead", "bram_tallow", "sigrin_copperpot"]
    },

    /* ------------------------------------------------------------------ PEOPLE */

    {
      id: "bram_tallow", category: "people", title: "Bramwell \"Bram\" Tallow",
      sub: "Village head of Oxworth",
      role: "Village Head, the Village Head's Hall (Oxworth)",
      tags: ["Oxworth", "Hartwell"],
      aliases: ["Bramwell", "Bram", "Tallow", "village head"],
      link: ["Bramwell Tallow", "Bram Tallow", "Bram"],
      unlock: "met_ox_head",
      body: function (s) {
        var out = [
          "The village head of [[oxworth|Oxworth]], a broad-shouldered, barrel-chested human man in his late fifties with a weathered, wind-reddened face, a heavy square jaw covered in coarse grey stubble, and steady grey eyes. A stiff leather brace wraps his crushed left forearm beneath a buttoned dark wool vest, and a brass-tipped, notched ash stick rests beside his rope-scarred knuckles on the oak counter.",
          "Blunt, steady, and plainspoken without ceremony, he sits in the public hall handling Oxworth's fence disputes, brand counts, and road postings."
        ];
        if (truthy(s.ox_hl_asked_post)) {
          out.push("He ran forty head of cattle on the south ridge for twenty years until an autumn bull crushed his left wrist against a pen rail; when the former village head retired to Esthorpe, Bram passed his grazing lease to his nephew and took the hall seat.");
        }
        if (truthy(s.ox_hl_asked_village)) {
          out.push("As he puts it, Oxworth lives on grass, salt, and bone-grease, curing salted beef and tallow for Hartwell's storehouses and sending raw hides north toward Harwick's tanners.");
        }
        if (truthy(s.ox_hl_asked_herds)) {
          out.push("During spring and autumn cattle drives, much of his morning work goes to walking out to trampled barley strips with a measuring stick and pricing fair damages before herders and grain farmers come to blows.");
        }
        if (truthy(s.ox_hl_asked_dues)) {
          out.push("Quietly, he admits Hartwell's gate collectors sometimes classify borderline Oxworth calves as outsider stock to extract stiffer silver dues before winter, leaving him to haggle back half the overcharge from the road steward.");
        }
        return out;
      },
      see: ["oxworth", "sigrin_copperpot"]
    },

    {
      id: "sigrin_copperpot", category: "people", title: "Sigrin Copperpot",
      sub: "Innkeeper of The Yoke & Horn",
      role: "Innkeeper, The Yoke & Horn (Oxworth)",
      tags: ["Oxworth", "Lodging"],
      aliases: ["Sigrin", "Copperpot", "dwarf", "innkeeper", "Yoke & Horn"],
      link: ["Sigrin Copperpot", "Sigrin"],
      unlock: "met_sigrin",
      body: function (s) {
        var out = [
          "The broad-shouldered, compact dwarf innkeeper of [[oxworth|The Yoke & Horn]] in her early sixties, with a hearty ruddy complexion, a cleft chin, and discerning dark brown eyes that size up strangers like steer ribs. Wearing thick dark-grey hair braided tight in twin plaits behind her ears and a heavy leather-trimmed apron over a green woollen tunic, she keeps an iron key ring and chalk tally slate at her hip, with ink stains on her thumb from counting receipts.",
          "Brisk, practical, and good-humoured without idle chatter, she measures strangers the way a buyer eyes ribs in the pens, yet still sets a dish of pickled turnip slices on the house at a first proper introduction."
        ];
        if (truthy(s.ox_yh_asked_self)) {
          out.push("She came up from the quarry roads twenty years back with her husband, who worked the cattle crushes until a horned steer broke his leg crooked. They spent their savings on the corner stone house, hung a carved yoke and horn over the door, and split the chores: he tends the loft and woodpile while she tends the stewpot and coin.");
        }
        if (truthy(s.ox_yh_asked_work)) {
          out.push("She points steady hands looking for coin across the lane to the salting yard's salt-sacks and cattle hurdles, and travellers hunting road errands up to the Village Head's Hall board.");
        }
        if (truthy(s.ox_yh_asked_dice) || truthy(s.ox_yh_dice_met)) {
          out.push("Once the cattle pens shut at night, she lets wagoners and herders cast small-stakes bone dice by the hearth while watching the slate so nobody slips in a loaded pair.");
        }
        return out;
      },
      see: ["oxworth", "bram_tallow"]
    }

  ]);
})();
