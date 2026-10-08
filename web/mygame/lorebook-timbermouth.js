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
      unlock: "timbermouth_seen",
      body: [
        "A town of timber houses on a paved square, where the road from the river comes up out of the lowlands and meets three smaller roads, one from the forest and two from the farm country. It is a quarter of an hour on foot from one end to the other. A signboard at the mouth of the square gives its name.",
        "The forest is the Longshade, and its ash is stacked in long ranks under open sheds, each end-grain stamped with a grade mark and a year. The town has no wall, only gateposts at the mouth of each road. The Ashrun, a stony stream no wider than a road, comes down out of the forest past the sawmill and turns its wheel. It is too shallow for anything but loose logs, which are driven down it in the spring melt on their way to the Grey River, so nothing else travels by water here; the wells and a spring-fed trough in the square serve the town.",
        "The town works wood and moves it: a sawmill, and a lane of workshops that turn timber into wheels, barrels and doors. The Gilded Scales hold the town from the Factor's Hall, a stone building with their river-serpent banner over its door. The market is a broad trading ground of bays and wagons where goods are sold by the lot or the cartload: graded timber and the pieces made from it, grain, salt, iron, coal, hides and pottery, with farm stalls at its edge, and a general store beside its gate sells rope, lamp oil, hardware and food for the road. The Split Pine inn keeps beds, a hall and a wagon yard."
      ],
      see: ["gilded_scales", "split_pine", "workshops_lane", "marlows_store", "factors_hall_tm"]
    },

    {
      id: "wagon_lot", category: "places", title: "The Wagon Lot",
      sub: "Where lines for the road are made up, beside the Market",
      tags: ["Timbermouth", "Trade"], aliases: ["wagon lot", "carriers' lot", "wagon side", "the lot"],
      unlock: "tm_lot_seen",
      body: [
        "A fenced lot of trodden earth on the far side of the Market, open to the forest road. Wagons stand in it nose to tail with their oxen picketed at one end, and a lean-to keeps the beasts out of the worst of the weather.",
        "Lines for Port Valen are made up here, with a master, a slate and a handful of hired hands. The notice for the work is pinned on the board at the Factor's Hall, and the master pays only those who are in the line when it rolls."
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
          "A long two-storey house of dark timber at the road end of Timbermouth's square, with a split pine trunk standing by the door as its signpost. It lets rooms at " + (s.tm_inn_rate_copper || 4) + " copper bits for a day and a night, and keeps a hot pot on from first light until the last wagon is in: stew at two copper bits, a plate of bread, cheese and pickled onion at one. Behind it an arch leads to a cobbled yard with a range of stalls and a lean-to for wagons."
        ];
        if (truthy(s.tm_inn_talk_house)) {
          out.push("One guest to a room. The key is yours for a full day from the hour you pay, to sleep in as often as you like and to carry out and back, and whatever is left in a room when the day is up is sold on the first of the month.");
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
          "A broad-shouldered woman with a grey-shot braid and a weathered face, the old scars of rope burns pale along both forearms, who stands behind the plank counter with a ring of keys at her belt. She asks where a traveller is bound, and what they carry, before anything else, and tells them to say so first if they have a beast."
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
          out.push("The wheelwright's counter at the head of the lane is where the whole lane's finished goods are sold: Longshade ash staves, spears, shortbows and clogs. Each piece is branded with the bench that made it, and the counter buys them back at half the price it asks.");
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
          "A deep shop with a plank floor beside the Market's yard gate, under a board reading \"MARLOW. General goods, by weight and measure.\" Coils of rope, lanterns and harness hang from its rafters and walls, sacks of feed and kegs of nails stand on the floor, and a beam-scale hangs over the counter. It sells the same ordinary goods as Hollis & Daughters in Port Valen (rope, torches, lamp oil, lanterns, a repair kit, chalk, blankets, oilcloth, lye soap and trail food) and buys them back at half the price it asks."
        ];
      },
      see: ["marlow", "timbermouth"]
    },

    {
      id: "barleycross", category: "places", title: "Barleycross",
      sub: "A farming village off the Timbermouth road",
      tags: ["Barleycross", "Timbermouth"], aliases: ["farming village", "farm country", "gathering hall", "farm row", "common pasture"],
      link: ["Barleycross"],
      unlock: "bc_seen",
      body: function (s) {
        var out = [
          "A farming village with no wall, spread over a wide common where four farm roads cross: thirty or forty farmsteads standing back behind their hedges, with barley, oats, roots, hay meadows and pastures running out around them, and a grain mill on the brook at the village's edge. The plain timber Gathering Hall stands on the common's eastern side."
        ];
        if (truthy(s.bc_lane_seen)) {
          out.push("The Lane is the village's one street, running south from the common with a farmstead on each side, some large and some small. A household will let a traveller a hayloft bed for a copper bit.");
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
        "A halfling woman, round and brown-faced, with short iron-grey curls and a worn sheepskin waistcoat, who sits on the bench outside the Gathering Hall with a tally stick longer than her forearm across her knee and a cold pipe in her teeth. She says she is village head because nobody else would take it."
      ],
      see: ["barleycross"]
    },

    {
      id: "ashrun_holt", category: "places", title: "Ashrun Holt",
      sub: "A forest village on the Ashrun",
      tags: ["Ashrun Holt", "Timbermouth"], aliases: ["forest village", "the holt", "longhouse", "the landing", "charcoal camp", "old ash"],
      link: ["Ashrun Holt"],
      unlock: "ah_seen",
      body: function (s) {
        var out = [
          "A village of log houses with bark roofs, scattered through a clearing in the Longshade where the Ashrun comes out from under the trees. A vast old ash stands at the middle of the clearing, its trunk wound with ribbons, cords and carved tokens, and the long Longhouse stands beside it."
        ];
        if (truthy(s.ah_landing_seen)) {
          out.push("Below the houses a gravel shelf on the stream bank is stacked with decks of bark-stripped logs, each deck with its family's mark painted on the cut ends, beside a chute of squared planks leading to a run of ledges.");
        }
        if (truthy(s.ah_clearing_seen)) {
          out.push("A track runs out past the last houses to the charcoal camp, where earth-covered mounds of logs smoulder for days into charcoal, with a bunkhouse where a cutter or traveller can rent a bunk for a copper bit.");
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
        "A narrow, upright woman with a long silver-brown braid and resin-dark fingertips, who keeps a flat wooden map case under one arm. She speaks for the Holt, listening to everyone and deciding nothing alone, and keeps the hall's board of knotted cords."
      ],
      see: ["ashrun_holt"]
    },

    {
      id: "factors_hall_tm", category: "places", title: "The Factor's Hall",
      sub: "The Gilded Scales' hall in Timbermouth",
      tags: ["Timbermouth", "Gilded Scales"], aliases: ["factor's hall", "town hall", "counting house", "insignia", "notice board"],
      link: ["Factor's Hall", "Timbermouth's Factor's Hall"],
      unlock: "tm_hall_seen",
      body: function (s) {
        var out = [
          "The only stone building on Timbermouth's square: a long, cool hall behind broad steps, under the Gilded Scales' river-serpent banner. Two clerks in black coats with river-serpent cuffs keep one long counter between them. The senior clerk takes deposits and letters, and the younger one keeps the seals. A schedule over the counter lists deeds and licences by appointment, a notice board by the door carries the forecast, the road notice and the postings, and a closed door at the back is the Factor's."
        ];
        if (truthy(s.has_letter_of_credit)) {
          out.push("The counter keeps the same Letters of Credit as the Gilded Scales' head house in Port Valen, so a balance made in one can be drawn in the other.");
        }
        if (truthy(s.has_hall_insignia)) {
          out.push("The younger clerk issues the same brass Hall insignia as Port Valen's Seals window, to anyone who has none, and reads the rank off it when it is shown.");
        }
        return out;
      },
      see: ["letters_of_credit", "gilded_scales", "timbermouth"]
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
