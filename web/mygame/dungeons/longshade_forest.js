/*
 * The Longshade Forest: the layout the map panel (dungeonmap.js) draws (2026-10-14). Drawn by the user as a sketch (forestdungeon.svg), snapped to this grid, and numbered in the order a walker from the south mouth meets
 * the places; the rooms and junctions are placeholders until they are named. Ids carry the prefix lsf_, so the flags dg_seen_<id>, dg_mark_<id> and dg_done_<id> cannot collide with another dungeon's.
 * Positions are grid cells, east and south positive. kind: "hall" (a trail junction, can be chalked), "room" (named), "exit" (a way in or out). The two exits are the two mouths: the south mouth opens on The Longshade
 * (overworld tile lf) and the east mouth on West Longshade (ua). tools/check_dungeon_map.js compares this file with the scene (scenes/overworld/longshade_forest.txt).
 */
(function () {
  "use strict";
  var DM = window.DungeonMap = window.DungeonMap || {};
  DM.maps = DM.maps || {};
  DM.maps.longshade_forest = {
    title: "The Longshade Forest",
    scene: "overworld/longshade_forest.txt",
    idPrefix: "lsf_",
    labelPrefix: "lsf_n_",
    nodes: {
      lsf_x1: { x: 4, y: 8, kind: "exit", name: "South mouth" },
      lsf_x2: { x: 9, y: 2, kind: "exit", name: "East mouth" },
      lsf_j1: { x: 4, y: 7, kind: "hall" },
      lsf_j2: { x: 4, y: 6, kind: "hall" },
      lsf_j3: { x: 3, y: 6, kind: "hall" },
      lsf_j4: { x: 5, y: 6, kind: "hall" },
      lsf_j5: { x: 1, y: 6, kind: "hall" },
      lsf_j6: { x: 7, y: 6, kind: "hall" },
      lsf_j7: { x: 6, y: 7, kind: "hall" },
      lsf_j8: { x: 0, y: 6, kind: "hall" },
      lsf_j9: { x: 0, y: 5, kind: "hall" },
      lsf_j10: { x: 0, y: 7, kind: "hall" },
      lsf_j11: { x: 8, y: 5, kind: "hall" },
      lsf_j12: { x: 8, y: 4, kind: "hall" },
      lsf_j13: { x: 1, y: 4, kind: "hall" },
      lsf_j14: { x: 8, y: 3, kind: "hall" },
      lsf_j15: { x: 7, y: 4, kind: "hall" },
      lsf_j16: { x: 8, y: 2, kind: "hall" },
      lsf_j17: { x: 3, y: 4, kind: "hall" },
      lsf_j18: { x: 7, y: 2, kind: "hall" },
      lsf_j19: { x: 6, y: 3, kind: "hall" },
      lsf_j20: { x: 5, y: 4, kind: "hall" },
      lsf_j21: { x: 4, y: 3, kind: "hall" },
      lsf_j22: { x: 4, y: 5, kind: "hall" },   // the Middle Path: a straight way north from the first crossroads to Room 10
      lsf_j23: { x: 5, y: 2, kind: "hall" },   // the Cross Trail: a second way into the north, between Room 11 and Room 12
      lsf_j24: { x: 2, y: 5, kind: "hall" },   // the Game Trail: a HIDDEN way between the watchtower and Room 7, there once the tower has been climbed
      lsf_r1: { x: 2, y: 6, kind: "room", name: "Watchtower" },
      lsf_r2: { x: 6, y: 6, kind: "room", name: "The Wallow" },
      lsf_r3: { x: 8, y: 6, kind: "room", name: "Room 3" },
      lsf_r4: { x: 6, y: 8, kind: "room", name: "Hidden Spring" },
      lsf_r5: { x: 0, y: 4, kind: "room", name: "Room 5" },
      lsf_r6: { x: 0, y: 8, kind: "room", name: "Room 6" },
      lsf_r7: { x: 2, y: 4, kind: "room", name: "Room 7" },
      lsf_r8: { x: 6, y: 4, kind: "room", name: "Room 8" },
      lsf_r9: { x: 2, y: 3, kind: "room", name: "Room 9" },
      lsf_r10: { x: 4, y: 4, kind: "room", name: "Room 10" },
      lsf_r11: { x: 6, y: 2, kind: "room", name: "Room 11" },
      lsf_r12: { x: 4, y: 2, kind: "room", name: "Room 12" },
      lsf_r13: { x: 4, y: 1, kind: "room", name: "Room 13" },
      lsf_r14: { x: 4, y: 0, kind: "room", name: "Room 14" },
      lsf_r15: { x: 5, y: 0, kind: "room", name: "Room 15" }
    },
    edges: [["lsf_j2", "lsf_j1"], ["lsf_x1", "lsf_j1"], ["lsf_j2", "lsf_j3"], ["lsf_j2", "lsf_j4"], ["lsf_j4", "lsf_r2"], ["lsf_j3", "lsf_r1"], ["lsf_r1", "lsf_j5"], ["lsf_r2", "lsf_j6"], ["lsf_j6", "lsf_r3"], ["lsf_j5", "lsf_j8"], ["lsf_j8", "lsf_j9"], ["lsf_j9", "lsf_r5"], ["lsf_j8", "lsf_j10"], ["lsf_r6", "lsf_j10"], ["lsf_r10", "lsf_j17"], ["lsf_j17", "lsf_r7"], ["lsf_r7", "lsf_j13"], ["lsf_j13", "lsf_r5"], ["lsf_r7", "lsf_r9"], ["lsf_r12", "lsf_r13"], ["lsf_r13", "lsf_r14"], ["lsf_r14", "lsf_r15"], ["lsf_r2", "lsf_j7"], ["lsf_j7", "lsf_r4", "lsf_spring_reached"], ["lsf_r3", "lsf_j11"], ["lsf_j11", "lsf_j12"], ["lsf_j12", "lsf_j15"], ["lsf_j15", "lsf_r8"], ["lsf_r8", "lsf_j19"], ["lsf_j19", "lsf_r11"], ["lsf_x2", "lsf_j16"], ["lsf_j14", "lsf_j16"], ["lsf_j14", "lsf_j12"], ["lsf_j18", "lsf_j16"], ["lsf_j18", "lsf_r11"], ["lsf_r8", "lsf_j20"], ["lsf_j20", "lsf_r10"], ["lsf_r10", "lsf_j21"], ["lsf_j21", "lsf_r12"],
      // 2026-10-15 (the user approved a rework to break up the single-file corridors): two new through-ways and one hidden one. A third element on an edge is a stat that must be true for the way to exist (here the
      // tower climbed): the map draws it, and walks through it, only then (dungeonmap.js).
      ["lsf_j2", "lsf_j22"], ["lsf_j22", "lsf_r10"], ["lsf_r11", "lsf_j23"], ["lsf_j23", "lsf_r12"],
      ["lsf_r1", "lsf_j24", "lsf_tower_viewed"], ["lsf_j24", "lsf_r7", "lsf_tower_viewed"]]
  };
})();
