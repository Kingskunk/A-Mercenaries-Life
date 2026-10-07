/*
 * LOREBOOK: TIMBERMOUTH -- the road town east of Port Valen (a placeholder entry, 2026-10-07).
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

  Array.prototype.push.apply(L.entries, [

    {
      id: "timbermouth", category: "places", title: "Timbermouth",
      sub: "A road town at the edge of the Longshade",
      tags: ["Timbermouth", "Gilded Scales", "Trade"], aliases: ["longshade", "longshade ash", "the longshade", "market", "sawmill", "factor's hall", "split pine"],
      link: ["Timbermouth"],
      unlock: "timbermouth_seen",
      body: [
        "A town of timber houses on a paved square, where the old imperial road comes up out of the lowlands and meets three smaller roads, one from the forest and two from the farm country. It is a quarter of an hour on foot from one end to the other. A signboard at the mouth of the square gives its name.",
        "The forest is the Longshade, and its ash is stacked in long ranks under open sheds, each end-grain stamped with a grade mark and a year. There is no river here: the wells and a spring-fed trough in the square serve the town.",
        "The town works wood and moves it: a sawmill, and a lane of workshops that turn timber into wheels, barrels and doors. The Gilded Scales hold the town from the Factor's Hall, a stone building with their river-serpent banner over its door. The market is a broad trading ground of bays and wagons where goods are sold by the lot or the cartload: graded timber and the pieces made from it, grain, salt, iron, coal, hides and pottery, with farm stalls at its edge. The Split Pine inn keeps beds, a hall and a wagon yard."
      ],
      see: ["gilded_scales"]
    }

  ]);
})();
