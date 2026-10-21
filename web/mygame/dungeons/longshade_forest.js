/*
 * The Longshade Forest: the layout the map panel (dungeonmap.js) draws. Drawn by the user as a sketch (2026-10-14), then reworked on 2026-10-15 at the user's request because the grid made it three rectangles: the places now
 * sit off the grid so the trails wander (the map draws a straight line between any two points), the small loops were cut so there are branches and dead ends, and the north is two spurs of a hallway and a room each. Ids carry the
 * prefix lsf_, so the flags dg_seen_<id>, dg_mark_<id> and dg_done_<id> cannot collide with another dungeon's.
 * Positions are grid cells, east and south positive, and may be fractions. A prose option that names a compass direction (Go east) must still point roughly that way on this map. kind: "hall" (a trail junction, can be chalked),
 * "room" (named), "exit" (a way in or out). The two exits are the two mouths: the south mouth opens on The Longshade (overworld tile lf) and the east mouth on West Longshade (ua). An edge with a third element is HIDDEN until that
 * stat is true (dungeonmap.js liveEdge). tools/check_dungeon_map.js compares this file with the scene (scenes/longshade/longshade_forest.txt).
 */
(function () {
  "use strict";
  var DM = window.DungeonMap = window.DungeonMap || {};
  DM.maps = DM.maps || {};
  DM.maps.longshade_forest = {
    title: "The Longshade Forest",
    scene: "longshade/longshade_forest.txt",
    idPrefix: "lsf_",
    labelPrefix: "lsf_n_",
    nodes: {
      lsf_x1: { x: 5.2, y: 9, kind: "exit", name: "South mouth" },
      lsf_x2: { x: 11, y: 1.5, kind: "exit", name: "East mouth" },
      lsf_j1: { x: 5.2, y: 8, kind: "hall" },
      lsf_j2: { x: 5.2, y: 7, kind: "hall" },
      lsf_j3: { x: 4.1, y: 7, kind: "hall" },
      lsf_j4: { x: 6.2, y: 6.7, kind: "hall" },
      lsf_j5: { x: 1.7, y: 6.7, kind: "hall" },
      lsf_j6: { x: 8.3, y: 6.9, kind: "hall" },
      lsf_j7: { x: 7.4, y: 7.6, kind: "hall" },
      lsf_j8: { x: 0.5, y: 6.1, kind: "hall" },
      lsf_j9: { x: 0.2, y: 4.8, kind: "hall" },
      lsf_j10: { x: 0.3, y: 7.4, kind: "hall" },
      lsf_j11: { x: 9.4, y: 5.5, kind: "hall" },
      lsf_j12: { x: 9.8, y: 4.4, kind: "hall" },
      lsf_j13: { x: 2.2, y: 3.3, kind: "hall" },
      lsf_j14: { x: 10.1, y: 3.2, kind: "hall" },
      lsf_j15: { x: 8.6, y: 4.8, kind: "hall" },
      lsf_j16: { x: 10, y: 2, kind: "hall" },
      lsf_j18: { x: 9.1, y: 2.2, kind: "hall" },
      lsf_j21: { x: 5.3, y: 3.5, kind: "hall" },
      lsf_j22: { x: 5.4, y: 5.9, kind: "hall" },   // the Middle Path: a straight way north from the first crossroads to Room 10
      lsf_j23: { x: 7, y: 2.7, kind: "hall" },   // the Cross Trail: the way between Room 11 and Room 12
      lsf_j24: { x: 3.2, y: 5.2, kind: "hall" },   // the Game Trail: a HIDDEN way between the watchtower and Room 7, there once the tower has been climbed
      lsf_j25: { x: 4.9, y: 1.2, kind: "hall" },   // the hallway to Room 13, the end of a north spur
      lsf_j26: { x: 6.7, y: 1.3, kind: "hall" },   // the hallway to Room 14, the end of a north spur
      lsf_j27: { x: 2.7, y: 1.4, kind: "hall" },   // the hallway to Room 15, a dead end
      lsf_r1: { x: 2.9, y: 6.5, kind: "room", name: "Watchtower" },
      lsf_r2: { x: 7.1, y: 6.3, kind: "room", name: "The Wallow" },
      lsf_r3: { x: 9.5, y: 6.6, kind: "room", name: "Circle of Ferns" },
      lsf_r4: { x: 7.7, y: 8.6, kind: "room", name: "Hidden Spring" },
      lsf_r5: { x: 0.7, y: 3.7, kind: "room", name: "Lightning Oak" },
      lsf_r6: { x: 0.7, y: 8.6, kind: "room", name: "Room 6" },
      lsf_r7: { x: 3.4, y: 3.9, kind: "room", name: "Hazel Clearing" },
      lsf_r8: { x: 7.4, y: 4.5, kind: "room", name: "Bark's Glade" },
      lsf_r9: { x: 3.6, y: 2.4, kind: "room", name: "The Clear Pool" },
      lsf_r10: { x: 5.7, y: 4.7, kind: "room", name: "The Wrecked Camp" },
      lsf_r11: { x: 8.1, y: 2.4, kind: "room", name: "The Bee Tree" },
      lsf_r12: { x: 5.8, y: 2.3, kind: "room", name: "The Trampled Clearing" },
      lsf_r13: { x: 4.5, y: 0.1, kind: "room", name: "The Root Hollow" },
      lsf_r14: { x: 7.5, y: 0.2, kind: "room", name: "The Panther's Tree" },
      lsf_r15: { x: 3.5, y: 0.4, kind: "room", name: "The Burning Grove" }
    },
    edges: [["lsf_x1", "lsf_j1"], ["lsf_j1", "lsf_j2"], ["lsf_j2", "lsf_j3"], ["lsf_j3", "lsf_r1"], ["lsf_r1", "lsf_j5"], ["lsf_j5", "lsf_j8"], ["lsf_j8", "lsf_j9"], ["lsf_j9", "lsf_r5"], ["lsf_j8", "lsf_j10"], ["lsf_j10", "lsf_r6"], ["lsf_r5", "lsf_j13"], ["lsf_j13", "lsf_r7"], ["lsf_r7", "lsf_r9", "lsf_bark_accepted"], ["lsf_r9", "lsf_j27"], ["lsf_j27", "lsf_r15"], ["lsf_j2", "lsf_j22"], ["lsf_j22", "lsf_r10"], ["lsf_r10", "lsf_j21"], ["lsf_j21", "lsf_r12"], ["lsf_r12", "lsf_j25"], ["lsf_j25", "lsf_r13"], ["lsf_r12", "lsf_j26"], ["lsf_j26", "lsf_r14"], ["lsf_r12", "lsf_j23"], ["lsf_j23", "lsf_r11"], ["lsf_r11", "lsf_j18"], ["lsf_j18", "lsf_j16"], ["lsf_j16", "lsf_x2"], ["lsf_j16", "lsf_j14"], ["lsf_j14", "lsf_j12"], ["lsf_j12", "lsf_j15", "lsf_glade_open"], ["lsf_j15", "lsf_r8", "lsf_glade_open"], ["lsf_j12", "lsf_j11"], ["lsf_j11", "lsf_r3"], ["lsf_r3", "lsf_j6"], ["lsf_j6", "lsf_r2"], ["lsf_r2", "lsf_j4"], ["lsf_j4", "lsf_j2"], ["lsf_r2", "lsf_j7"],
      ["lsf_r1", "lsf_j24", "lsf_tower_viewed"], ["lsf_j24", "lsf_r7", "lsf_tower_viewed"], ["lsf_j7", "lsf_r4", "lsf_spring_reached"]]
  };
})();
