/*
 * LOREBOOK: HARTWELL, OXWORTH & PALMCOTE -- the downland and hillside villages under the Viscounty of Hartwell and the people who run their halls and inns.
 *
 * Same entry format as lorebook-data.js. This file appends to window.LOREBOOK, so it loads after lorebook-data.js.
 * Every entry unlocks when the player reaches the place or learns the person's name, and reveals later facts only when their matching scene flags are set.
 *
 * Places: Oxworth (incorporating The Village Head's Hall, The Yoke & Horn, Oxworth Market, and The Salting & Cattle Yard) and Palmcote (incorporating The Gathering Hall, The Green Branch, and Palmcote Market).
 * People: Bramwell "Bram" Tallow, Sigrin Copperpot, Nora Greer, and Odda Pellam.
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
        if (truthy(s.ox_hh_beast_dead)) {
          out.push("A ten-foot armored burrower that dragged down cattle in the south sinkholes was killed outside the outer pens.");
        }
        if (s.ox_hh_ending === "exposed_to_bram") {
          out.push("Hartwell tax collector [[daven_marsh|Daven Marsh]] was caught with double tax books in Oxworth and hauled off in rope by local cattlemen.");
        }
        return out;
      },
      see: ["western_vale", "broadmead", "palmcote", "bram_tallow", "sigrin_copperpot"]
    },

    {
      id: "palmcote", category: "places", title: "Palmcote",
      sub: "An olive-grove village on a sun-facing slope under Hartwell",
      tags: ["Palmcote", "Hartwell", "Trade", "Lodging"],
      aliases: [
        "Palmcote", "olive terraces", "olive groves", "Gathering Hall",
        "The Green Branch", "Green Branch", "Palmcote Market", "house on the hill", "the big house"
      ],
      link: ["Palmcote", "The Green Branch", "Green Branch", "Palmcote Market"],
      unlock: function (s) { return truthy(s.pc_seen) || truthy(s.pc_arrival_seen); },
      body: function (s) {
        var out = [
          "A hillside village climbing a single steep lane on a sheltered, south-facing slope under Hartwell. Low drystone walls hold the earth in stepped terraces planted with thick, knotted olive trees whose leaves show grey-green on top and pale underneath. Pale stone houses under red clay tile roofs sit close to the lane with benches and drying baskets by their doors.",
          "A roofed stone well stands where the lane bends, a flat earth yard holds stacked baskets and carts, and high at the crest behind a tall wall and dark trees rises a large grey stone manor house."
        ];
        if (truthy(s.pc_hall_seen)) {
          if (truthy(s.met_pc_head)) {
            out.push("The Gathering Hall is a wide timber-and-plaster building near the foot of the lane. Inside, village head [[nora_greer|Nora Greer]] works from a heavy trestle table with the leather-bound register, settling terrace-wall matters while road notices from Hartwell and local errands hang on a slatted wooden rack.");
          } else {
            out.push("The Gathering Hall is a wide timber-and-plaster building near the foot of the lane with two heavy trestle tables, an iron stove, and a slatted wooden notice rack holding road postings from Hartwell.");
          }
        }
        if (truthy(s.pc_gb_seen)) {
          if (truthy(s.met_odda)) {
            out.push("The Green Branch sits just above the hall with a leafy bough hung over its door. Run by [[odda_pellam|Odda Pellam]], its long red-tiled room has a clay bread oven built beside the hearth, serving bean-and-olive stew, watered red wine, upstairs rooms, and a cobbled stable yard behind the wall.");
          } else {
            out.push("The Green Branch sits just above the hall with a leafy bough hung over its door, offering hot stew, watered red wine, upstairs rooms, and a cobbled stable yard behind the wall.");
          }
        }
        if (truthy(s.pc_market_seen)) {
          out.push("Palmcote Market occupies a widening of the hillside lane under canvas awnings, where sellers weigh out olives, oil, honey, grain, vegetables, and cloth on counter scales.");
        }
        if (truthy(s.met_house_ferrand)) {
          out.push("The large grey manor at the crest belongs to [[house_ferrand|House Ferrand]], though villagers rarely speak the name aloud.");
        }
        if (s.pc_sw_ending === "exposed") {
          out.push("After [[bailiff_kelm|Bailiff Kelm]]'s rigged weights were exposed at the Gathering Hall, House Ferrand sent down a new man to work the scale.");
        } else if (s.pc_sw_ending === "raided") {
          out.push("Bailiff Kelm was found dead in the stone pressing house above the yard; the estate steward blamed road robbers and quietly hired a replacement.");
        }
        return out;
      },
      see: ["oxworth", "nora_greer", "odda_pellam"]
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
        if (s.ox_hh_ending === "exposed_to_bram") {
          out.push("With [[daven_marsh|Daven Marsh]]'s double tax books in hand, he sent Oxworth cattlemen across the lane to bind Marsh for the Viscountess's road patrol, giving the village hard proof against Hartwell's inflated foreign-stock counts.");
        } else if (truthy(s.ox_hh_bram_goodwill) && truthy(s.ox_hh_daven_dead)) {
          out.push("After Daven Marsh died in the inn's cart yard, you brought Bram the taxman's double books to clear Oxworth's herd counts with Hartwell.");
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
    },

    {
      id: "nora_greer", category: "people", title: "Nora Greer",
      sub: "Village head of Palmcote",
      role: "Village Head, the Gathering Hall (Palmcote)",
      tags: ["Palmcote", "Hartwell"],
      aliases: ["Nora", "Greer", "village head"],
      link: ["Nora Greer"],
      unlock: "met_pc_head",
      body: function (s) {
        var out = [
          "The village head of [[palmcote|Palmcote]], a spare, sun-browned human woman in her late fifties with silver-streaked dark hair pinned tight at the nape of her neck, deep lines around watchful brown eyes, and faint ink stains across her right knuckles. She wears a neat slate-grey wool waistcoat over a cream linen shirt with rolled sleeves, resting a polished ash walking stick against the trestle table beside her knee.",
          "Calm, unhurried, and diplomatic, she sits in the Gathering Hall updating the leather-bound village register, hearing terrace-wall matters, and tending the slatted notice rack of Hartwell road postings and local errands."
        ];
        if (truthy(s.pc_gh_asked_village)) {
          out.push("She explains that Palmcote lives mainly by its olive terraces, supplemented by goats, kitchen plots, and carters coming up from Hartwell, promising fair treatment to travellers who respect the terrace walls and pay their way.");
        }
        if (truthy(s.pc_gh_asked_house)) {
          out.push("When asked about the manor at the crest, she calls it only the house on the hill, held by an old Viscounty family since before her father's time: their estate steward manages pressing-yard leases and harvest carts, while neither side troubles the other's gate.");
        }
        return out;
      },
      see: ["palmcote", "odda_pellam"]
    },

    {
      id: "odda_pellam", category: "people", title: "Odda Pellam",
      sub: "Innkeeper of The Green Branch",
      role: "Innkeeper, The Green Branch (Palmcote)",
      tags: ["Palmcote", "Lodging"],
      aliases: ["Odda", "Pellam", "innkeeper", "Green Branch"],
      link: ["Odda Pellam", "Odda"],
      unlock: "met_odda",
      body: function (s) {
        var out = [
          "The stout, broad-shouldered human innkeeper of [[palmcote|The Green Branch]] in her sixties, with a long grey braid slung over one shoulder, a sun-creased face, and a steady, unhurried gaze. Wearing a heavy linen apron tied high over a plain brown woollen kirtle with flour dried pale along her rolled sleeves and forearms, she bakes loaves in the hearthside clay oven, ladles bean-and-olive stew, and rents out the rooms upstairs."
        ];
        if (truthy(s.pc_gb_asked_village)) {
          out.push("Warm and direct at the counter, she slides newcomers a free dish of dark olives with a warning not to spit stones on her tiles, describing Palmcote as a quiet slope of olive groves and walled beehives hauling baskets down to Hartwell.");
        }
        if (truthy(s.pc_gb_asked_house)) {
          out.push("Asked about the manor above the trees, she lowers her voice and calls it simply the big house: its burned mark sits on every yard cart and its bailiff weighs the pickers' baskets, though its people never drink in her hall and she never climbs their hill.");
        }
        return out;
      },
      see: ["palmcote", "nora_greer"]
    },

    {
      id: "house_ferrand", category: "factions", title: "House Ferrand",
      sub: "The noble house above Palmcote",
      tags: ["Palmcote", "Hartwell"],
      aliases: ["Ferrand", "House Ferrand", "the big house", "house on the hill"],
      link: ["House Ferrand"],
      unlock: "met_house_ferrand",
      body: function (s) {
        var out = [
          "The noble house that owns the estate at [[palmcote|Palmcote]]: the large grey stone house behind the high wall at the crest, the olive terraces, the leases and the pressing house above the yard. Their estate steward runs it, with a bailiff over the weighing yard. Most villagers call the estate simply the big house, though its burned olive-tree crest sits on every yard cart, lease and scale box."
        ];
        if (s.pc_sw_ending === "exposed") {
          out.push("After Bailiff Kelm's rigged weights were exposed before [[nora_greer|Nora Greer]], the estate steward paid Hartwell's fine quietly and sent down a new man to work the scale.");
        } else if (s.pc_sw_ending === "raided") {
          out.push("When Bailiff Kelm turned up dead beside hidden oil casks and missing weights, the estate steward blamed road robbers rather than draw the Viscountess's patrol up the hill.");
        }
        return out;
      },
      see: ["palmcote", "bailiff_kelm", "nora_greer"]
    },

    {
      id: "lina_verner", category: "people", title: "Lina Verner",
      sub: "Olive picker of Palmcote's lower terraces",
      role: "Olive picker, Palmcote",
      tags: ["Palmcote", "Hartwell"],
      aliases: ["Lina", "Verner", "Berta Verner"],
      link: ["Lina Verner", "Lina"],
      unlock: "met_lina_verner",
      body: function (s) {
        var out = [
          "A sun-tanned young human woman in her early twenties with dark braided hair and steady dark eyes, who works the rows of olive trees her sick mother Berta rents at the foot of [[palmcote|Palmcote]]. When [[bailiff_kelm|Bailiff Kelm]] used rigged scale weights to put them behind on the rent and locked her in the pressing house loft, she slipped out with his brass weights and skimmed purse."
        ];
        if (s.pc_sw_ending === "exposed") {
          out.push("With Kelm exposed before [[nora_greer|Nora Greer]], her mother's debt was struck from the village register and she remains in her own place two doors up from her mother's cottage.");
        } else if (s.pc_sw_ending === "raided" || s.pc_sw_ending === "heist") {
          out.push("With her mother's debt note burned to ash and Kelm's grip broken, she remains in her own place two doors up from her mother's cottage" + (truthy(s.pc_sw_lina_cold) ? ", though she turned cold after you took the whole purse she carried out." : "."));
        } else if (s.pc_sw_ending === "blackmail") {
          out.push("After you forced Kelm to burn her mother's debt note under threat of the Viscountess's patrol, she stayed in her own place beside her mother's cottage, free of his reach.");
        } else if (s.pc_sw_ending === "escaped") {
          out.push("You guided her down to a pre-dawn oil cart bound for Hartwell, where she meant to start fresh around the oil yards.");
        } else if (s.pc_sw_ending === "sold_out") {
          out.push("You gave her hiding place to Bailiff Kelm for seven silver marks, and his men dragged her back up the hill.");
        }
        if (Number(s.lv_trysts) > 0 && !truthy(s.pc_sw_lina_cold)) {
          out.push("She lives in her late father's old olive store on the lowest terrace, one whitewashed room with a hearth and a bed in the alcove. Her door is open to you for a meal or a night, and some weeks for more than that.");
        }
        if (truthy(s.pc_sw_lina_close) && !truthy(s.pc_sw_lina_cold)) {
          out.push("The night she hid in your upstairs room at The Green Branch left an unspoken closeness between you.");
        }
        return out;
      },
      see: ["palmcote", "bailiff_kelm", "house_ferrand", "odda_pellam"]
    },

    {
      id: "bailiff_kelm", category: "people", title: "Bailiff Kelm",
      sub: "Yard bailiff for House Ferrand",
      role: "Pressing-yard bailiff, Palmcote",
      tags: ["Palmcote", "Hartwell"],
      aliases: ["Kelm", "bailiff", "pressing house"],
      link: ["Bailiff Kelm", "Kelm"],
      unlock: "met_bailiff_kelm",
      body: function (s) {
        var out = [
          "A thickset human bailiff in his late forties with grey stubble, a heavy jaw, and a dark wool coat smelling of wine and crushed fruit, overseeing [[house_ferrand|House Ferrand]]'s weighing scale and stone pressing house above [[palmcote|Palmcote]]."
        ];
        if (truthy(s.pc_sw_proof_verified)) {
          out.push("He bored out House Ferrand's brass scale weights and packed them with lead shot, so the villagers' baskets weighed light and he could sell the extra oil for himself.");
        }
        if (truthy(s.pc_sw_kelm_dead)) {
          out.push("He died fighting to protect his rigged scales and strongbox.");
        } else if (s.pc_sw_ending === "exposed") {
          out.push("Caught with rigged weights before [[nora_greer|Nora Greer]], he lost his post and the pressing house.");
        } else if (s.pc_sw_ending === "blackmail") {
          out.push("Under threat of the Viscountess's patrol seeing his rigged weights, he burned Berta Verner's debt note and paid five silver marks for his silence.");
        } else if (s.pc_sw_ending === "sold_out" || s.pc_sw_ending === "betrayed_early") {
          out.push("He paid you in silver to hand over Lina Verner and recover his missing box.");
        }
        return out;
      },
      see: ["palmcote", "house_ferrand", "lina_verner", "nora_greer"]
    },

    {
      id: "daven_marsh", category: "people", title: "Daven Marsh",
      sub: "Hartwell cattle buyer and tax collector",
      role: "Cattle buyer & tax collector, Hartwell",
      tags: ["Oxworth", "Hartwell", "Trade"],
      aliases: ["Daven", "Marsh", "tax collector", "cattle buyer"],
      link: ["Daven Marsh"],
      unlock: "met_daven_marsh",
      body: function (s) {
        var out = [
          "A loud, heavy-set human cattle buyer and tax collector out of Hartwell in his early forties, wearing fur-trimmed wool and traveling with two hired drovers. He hired you at [[oxworth|The Yoke & Horn]] to kill an armored beast in the south sinkholes and recover his locked leather saddlebag."
        ];
        if (truthy(s.ox_hh_book_read)) {
          out.push("Inside his saddlebag sat two sets of tax books proving he charged Oxworth herders double as foreign stock and pocketed more than forty silver marks behind Hartwell's back.");
        }
        if (truthy(s.ox_hh_daven_dead)) {
          out.push("He died fighting in the muddy cart yard behind The Yoke & Horn.");
        } else if (s.ox_hh_ending === "exposed_to_bram") {
          out.push("After you gave his double tax books to [[bram_tallow|Bramwell \"Bram\" Tallow]], Oxworth cattlemen bound him for the Hartwell road patrol.");
        } else if (s.ox_hh_ending === "extorted") {
          out.push("You forced him to pay heavily in the cart yard to buy back his crooked tax books before riding back to Hartwell.");
        } else if (s.ox_hh_ending === "paid_clean") {
          out.push("He paid six silver marks once you brought back the beast's jaw and his unopened saddlebag.");
        }
        return out;
      },
      see: ["oxworth", "vera_marsh", "bram_tallow"]
    },

    {
      id: "vera_marsh", category: "people", title: "Vera Marsh",
      sub: "Wife of Daven Marsh, of Hartwell",
      role: "Hartwell townswoman, visiting Oxworth",
      tags: ["Oxworth", "Hartwell"],
      aliases: ["Vera", "Marsh", "Widow Marsh"],
      link: ["Vera Marsh"],
      unlock: "met_vera_marsh",
      body: function (s) {
        var out = [
          "A tall, sharp-eyed human woman in her late twenties wearing dark green wool, married to [[daven_marsh|Daven Marsh]] for his stone house in Hartwell rather than his company. Dragged out to [[oxworth|Oxworth]] while he worked the cattle pens and night dice table, she quietly warned you about the rigged tax books inside his lost saddlebag."
        ];
        if (truthy(s.ox_hh_vera_bedded)) {
          out.push("While her husband threw bone dice downstairs at The Yoke & Horn, she invited you up to his rented room for the night.");
        }
        if (truthy(s.ox_hh_daven_dead)) {
          out.push("After Daven died in the cart yard, she slipped his gold signet ring off his finger and prepared to return to her house in Hartwell as Widow Marsh.");
        } else if (s.ox_hh_ending === "exposed_to_bram") {
          out.push("She watched Oxworth's cattlemen haul Daven away in rope without raising her voice, packing her trunks to return alone to Hartwell.");
        }
        return out;
      },
      see: ["oxworth", "daven_marsh", "sigrin_copperpot"]
    }

  ]);
})();
