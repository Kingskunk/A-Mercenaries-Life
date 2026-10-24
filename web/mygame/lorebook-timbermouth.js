/*
 * LOREBOOK: TIMBERMOUTH -- the road town up the western arm of the river, north-west of Port Valen (a placeholder entry, 2026-10-07).
 *
 * Same entry format as lorebook-data.js (see the header there). This file only adds to window.LOREBOOK, so it must be loaded after lorebook-data.js. The entry unlocks on
 * timbermouth_seen, set the first time the player reaches the hub (scenes/timbermouth/timbermouth.txt), and says only what the arrival shows: the road town, the signboard, the
 * stacked ash, the Gilded Scales' banner over the Factor's Hall and the six places. Later developments go in a function body gated on the flag that records them, never in the
 * base text. The design record is quest/TIMBERMOUTH_PLAN.md, which is author-only and never loaded.
 */
(function () {
  "use strict";

  var L = window.LOREBOOK;
  if (!L || !L.entries) return;
  function truthy(v) { return v === true || v === "true"; }

  Array.prototype.push.apply(L.entries, [

    {
      id: "timbermouth", category: "places", title: "Timbermouth",
      sub: "A road town at the edge of the Longshade",
      tags: ["Timbermouth", "Gilded Scales", "Trade"], aliases: ["longshade", "longshade ash", "the longshade", "market", "sawmill", "factor's hall"],
      link: ["Timbermouth"],
      unlock: function (s) {
        return truthy(s.timbermouth_seen) || truthy(s.tm_lot_seen) || truthy(s.tm_inn_seen) ||
          truthy(s.tm_works_seen) || truthy(s.tm_store_seen) || truthy(s.tm_hall_seen);
      },
      body: [
        "A road town of timber houses around a paved square, at the edge of the Longshade. Roads lead toward the river, the forest and the farm country, with only gateposts at their mouths.",
        "The Ashrun turns the sawmill below the town, and ranks of graded ash stand beneath open sheds. Workshops, the Market, the Split Pine and the Gilded Scales' Timbermouth Factor's Hall all open from the square."
      ],
      see: ["gilded_scales", "split_pine", "workshops_lane", "marlows_store", "factors_hall_tm"]
    },

    {
      id: "wagon_lot", category: "places", title: "The Wagon Lot",
      sub: "Where caravans for the road are made up, beside the Market",
      tags: ["Timbermouth", "Trade"], aliases: ["wagon lot", "carriers' lot", "wagon side", "the lot"],
      unlock: "tm_lot_seen",
      body: [
        "A fenced lot of trodden earth on the far side of the Market, open to the forest road. Wagons stand in it nose to tail with their oxen picketed at one end, and a lean-to keeps the beasts out of the worst of the weather.",
        "Caravans for Port Valen are made up here, with a wagon master, a slate and a handful of hired hands, and on another day for Alderford, by the farm road to Barleycross and the Crossfield Road, with a night on the upland. The notice for the work is pinned on the board at the Factor's Hall, and the wagon master pays only those who are in the column when it rolls."
      ],
      see: ["factors_hall_tm", "timbermouth", "wagon_yard"]
    },
    {
      id: "split_pine", category: "places", title: "The Split Pine",
      sub: "An inn and stable yard in Timbermouth",
      tags: ["Timbermouth"], aliases: ["split pine inn", "inn", "stables", "stable yard", "room for the night"],
      link: ["Split Pine Inn and Stables", "Split Pine Inn", "Split Pine"],
      unlock: "tm_inn_seen",
      body: function (s) {
        var out = [
          "A long two-storey house of dark timber at the road end of Timbermouth's square, with a split pine trunk standing by the door as its signpost. It offers beds and food, and an arch leads through to a cobbled yard with stalls and a lean-to for wagons."
        ];
        if (truthy(s.tm_inn_talk_house)) {
          out.push("Rooms are kept one guest to a key, with the yard and stalls behind the house.");
        }
        return out;
      },
      see: ["ressa", "timbermouth"]
    },

    {
      id: "ressa", category: "people", title: "Ressa Hale",
      sub: "Keeper of the Split Pine",
      role: "Innkeeper, the Split Pine (Timbermouth)",
      link: ["Ressa Hale", "Ressa"],
      tags: ["Timbermouth"], aliases: ["Ressa", "Hale", "keeper of the inn"],
      unlock: "tm_inn_seen",
      body: function (s) {
        var out = [
          "A broad-shouldered woman with a grey-shot braid and a weathered face, the old scars of rope burns pale along both forearms, who stands behind the plank counter with a ring of keys at her belt. When you met her, she asked whether you needed a bed, food or room in the yard, and told you to mention an animal first."
        ];
        if (truthy(s.tm_inn_talk_brother)) {
          out.push("She and her brother Oswin drove freight along this road together for eleven years before they split it: he keeps the Wagoner's Rest at the Port Valen end, and she keeps the Split Pine at this one. She says her stew is the better.");
        }
        return out;
      },
      see: ["split_pine", "oswin"]
    },

    {
      id: "workshops_lane", category: "places", title: "The Workshops' Lane",
      sub: "Woodworkers' shops in Timbermouth",
      tags: ["Timbermouth"], aliases: ["workshops", "woodworkers' workshops", "roan's wheel shop", "wheelwright", "cooper", "wainwright", "bowyer"],
      link: ["Woodworkers' Workshops", "Roan's Wheel Shop"],
      unlock: "tm_works_seen",
      body: function (s) {
        var out = [
          "A lane of low, open-fronted workshops that runs back from Timbermouth's square beside the sawmill, with each bench set in the light of its doorway and its work hung in the rafters. A wheelwright's shop stands at the head of the lane, with a cooper's, a wainwright's and a bowyer's further down and a small forge at the far end."
        ];
        if (truthy(s.tm_roan_seen)) {
          out.push("The wheelwright's counter at the head of the lane gathers the lane's finished work. Each piece is branded with the bench that made it.");
        }
        return out;
      },
      see: ["edda_roan", "timbermouth"]
    },

    {
      id: "edda_roan", category: "people", title: "Edda Roan",
      sub: "Wheelwright of the Workshops' Lane",
      role: "Wheelwright, Roan's Wheel Shop (Timbermouth)",
      link: ["Edda Roan", "Edda"],
      tags: ["Timbermouth"], aliases: ["Edda", "Roan", "wheelwright"],
      unlock: "tm_roan_seen",
      body: function (s) {
        var out = [
          "A square-built woman with cropped iron-grey hair and two old breaks in her left hand that set crooked. She works at a bench with a half-built wheel clamped before her, and pale curls of fresh wood cling to her apron."
        ];
        if (truthy(s.tm_works_talk_ash)) {
          out.push("She judges ash by sight and by sound: straight grain, run out nowhere, rings close together. Ash that grew fast looks as good as slow-grown wood, she says, and breaks like a carrot under load. She holds a stave to the ear and raps it to hear whether it is sound.");
        }
        return out;
      },
      see: ["workshops_lane", "timbermouth"]
    },

    {
      id: "marlows_store", category: "places", title: "Marlow's General Store",
      sub: "A general store beside Timbermouth's market gate",
      tags: ["Timbermouth"], aliases: ["general store", "marlow's", "general goods"],
      link: ["Marlow's General Store", "Marlow's"],
      unlock: "tm_store_seen",
      body: function (s) {
        return [
          "A deep shop with a plank floor beside the Market's yard gate, under a board reading \"MARLOW. General goods, by weight and measure.\" Coils of rope, lanterns and harness hang from its rafters and walls, sacks of feed and kegs of nails stand on the floor, and a beam-scale hangs over the counter."
        ];
      },
      see: ["marlow", "timbermouth"]
    },

    {
      id: "barleycross", category: "places", title: "Barleycross",
      sub: "A farming village six miles from Timbermouth",
      tags: ["Barleycross", "Timbermouth", "Trade"], aliases: ["farming village", "farm country", "gathering hall", "the lane", "lane market", "common pasture"],
      link: ["Barleycross"],
      unlock: "bc_seen",
      body: function (s) {
        var out = [
          "An unwalled farming village spread around a broad common where four farm roads meet. Some forty farmsteads stand behind their hedges, with barley, oats, roots, hay meadows and pastures running out around them; a brook turns the grain mill at the southern edge, while the timber Gathering Hall faces the common."
        ];
        if (truthy(s.bc_lane_seen)) {
          out.push("The Lane is its one street, running south from the common between farmsteads of every size. By day, households put out watched baskets and crates at their gates, making an open market for farm goods; a traveller can also pay for a hayloft bed.");
        }
        if (truthy(s.bc_pasture_seen)) {
          out.push("The common pasture by the brook holds sheep and cattle, and a row of rail pens where families keep their working horses and mules.");
        }
        return out;
      },
      see: ["wenna_hart", "timbermouth"]
    },

    {
      id: "wenna_hart", category: "people", title: "Wenna Hart",
      sub: "Village head of Barleycross",
      role: "Village head, Barleycross",
      link: ["Wenna Hart"],
      tags: ["Barleycross"], aliases: ["Wenna", "Hart", "village head"],
      unlock: "bc_head_seen",
      body: [
        "A halfling woman in a worn sheepskin waistcoat, usually found on the bench outside the Gathering Hall with a folded packet of household papers across her knee and a cold pipe between her teeth. She says she is village head because nobody else would take it.",
        "Her division is plain: village business belongs in the Hall, while idling belongs by the pond. Both, she says, keep people busy."
      ],
      see: ["barleycross"]
    },
    {
      id: "merel_pellam", category: "people", title: "Merel Pellam",
      sub: "Aldis Pellam's wife",
      role: "Resident, the last cottage on the Barleycross Lane",
      link: ["Merel Pellam"],
      tags: ["Barleycross", "Longshade"], aliases: ["Merel", "Pellam", "Aldis", "end cottage", "overdue peddler"],
      unlock: "peddler_met_wife",
      body: function (s) {
        var out = [
          "Aldis Pellam's wife, who lives with her young daughter in the last cottage on the Barleycross Lane. She held herself steady while seeking word of Aldis, a gatherer who went deep into the Longshade with Marr and Joss to collect plants for Port Valen's apothecaries."
        ];
        if (s.peddler_stage === "active") {
          out.push("She does not expect anyone to bring them back. She wants to know where their journey ended, and whether it was quick.");
        } else if (s.peddler_stage === "resolved") {
          out.push(truthy(s.bc_pouch_returned)
            ? "She has the answer she sought, as well as the leaf-stitched pouch she made for Aldis before he left."
            : "She has the answer she sought about Aldis and the two hands who went with him.");
        }
        return out;
      },
      see: ["barleycross", "wenna_hart"]
    },

    {
      id: "ashrun_holt", category: "places", title: "Ashrun Holt",
      sub: "A forest village on the Ashrun",
      tags: ["Ashrun Holt", "Timbermouth"], aliases: ["forest village", "the holt", "longhouse", "the landing", "charcoal camp", "old ash"],
      link: ["Ashrun Holt"],
      unlock: "ah_seen",
      body: function (s) {
        var out = [
          "A village of log houses with bark roofs, scattered through a clearing in the Longshade where the Ashrun comes out from under the trees. A vast old ash stands at the middle of the clearing, its trunk wound with ribbons, cords and carved tokens, and the long Longhouse stands beside it. The beaten ground between the old ash and the porches is where the village trades: carters from Timbermouth wait along the stream side, and cutters, charcoal burners and trappers lay their goods out on sacking."
        ];
        if (truthy(s.ah_landing_seen)) {
          out.push("Below the houses a gravel shelf on the stream bank is stacked with decks of bark-stripped logs, each deck with its family's mark painted on the cut ends, beside a chute of squared planks leading to a run of ledges.");
        }
        if (truthy(s.ah_clearing_seen)) {
          out.push("A track runs out past the last houses to the charcoal camp, where earth-covered mounds of logs smoulder into charcoal beside a bunkhouse for cutters and travellers.");
        }
        return out;
      },
      see: ["lysa_thorn", "timbermouth"]
    },

    {
      id: "lysa_thorn", category: "people", title: "Lysa Thorn",
      sub: "Speaker of Ashrun Holt",
      role: "Speaker, Ashrun Holt",
      link: ["Lysa Thorn"],
      tags: ["Ashrun Holt"], aliases: ["Lysa", "Thorn", "speaker"],
      unlock: "ah_speaker_seen",
      body: [
        "The speaker at Ashrun Holt's Longhouse: a narrow, upright woman with a long silver-brown braid and resin-dark fingertips, who keeps a flat wooden map case under one arm. When a visitor needs something from the village, she hears it and takes it to the households concerned. She studies the Longhouse's board of knotted cords."
      ],
      see: ["ashrun_holt"]
    },

    {
      id: "factors_hall_tm", category: "places", title: "Timbermouth Factor's Hall",
      sub: "The Gilded Scales' Timbermouth office",
      tags: ["Timbermouth", "Gilded Scales"], aliases: ["factor's hall", "Timbermouth's Factor's Hall", "town hall", "counting house", "insignia", "notice board"],
      link: ["Timbermouth Factor's Hall", "Timbermouth's Factor's Hall"],
      unlock: "tm_hall_seen",
      body: function (s) {
        var out = [
          "Timbermouth's local office in the Gilded Scales' provincial network, and the only stone building on the square: a long, cool hall behind broad steps, under the river-serpent banner. Two clerks in black coats with river-serpent cuffs keep one long counter between them. The senior clerk takes deposits and letters, and the younger one keeps the seals. A schedule over the counter lists deeds and licences by appointment, a notice board by the door carries the forecast, the road notice and the postings, and a closed door at the back is the Town Factor's."
        ];
        if (truthy(s.has_letter_of_credit)) {
          out.push("The counter keeps the same Letters of Credit as the Gilded Scales' head house in Port Valen, so a balance made in one can be drawn in the other.");
        }
        if (truthy(s.has_hall_insignia)) {
          out.push("The younger clerk issues the same brass insignia as Port Valen's Seals window, to anyone who has none, and reads the rank off it when it is shown.");
        }
        return out;
      },
      see: ["letters_of_credit", "gilded_scales", "scales_head_house", "timbermouth"]
    },

    {
      id: "marlow", category: "people", title: "Marlow",
      sub: "Keeper of the general store",
      role: "Storekeeper, Marlow's General Store (Timbermouth)",
      link: ["Marlow"],
      tags: ["Timbermouth"], aliases: ["storekeeper", "shopkeeper"],
      unlock: "tm_marlow_seen",
      body: [
        "A lean man in shirtsleeves with ink on his fingers and a pencil tucked behind each ear, who weighs everything on a hanging scale and finishes a reading before he looks up. He sells by the pound, the yard or the pint."
      ],
      see: ["marlows_store"]
    }

  ]);
})();
