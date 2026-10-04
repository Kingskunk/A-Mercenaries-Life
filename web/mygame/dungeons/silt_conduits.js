/*
 * The Silt-Gate Channels: the layout the map panel (dungeonmap.js) draws. One file per dungeon in this folder; each adds itself to window.DungeonMap.maps under the value of stats.dg_table,
 * so the engine never names a dungeon. Ids carry the dungeon's prefix (silt_), so the flags dg_seen_<id>, dg_mark_<id> and dg_done_<id> of two dungeons can never collide.
 * Positions are grid cells, east and south positive. kind: "hall" (a junction, can be chalked), "room" (named), "exit" (a way in or out).
 * tools/check_dungeon_map.js compares this file with the dungeon's scene (the label for place silt_j1 is labelPrefix + "j1", and every *set dg_dest in the scene is an edge here), so a changed exit that is
 * not changed here fails that check. Add a dungeon: a new file here plus one <script> line in index.html.
 */
(function () {
  "use strict";
  var DM = window.DungeonMap = window.DungeonMap || {};
  DM.maps = DM.maps || {};
  DM.maps.silt_conduits = {
    title: "The Silt-Gate Channels",
    scene: "port_valen/port_valen_silt_conduits.txt",
    idPrefix: "silt_",
    labelPrefix: "pvsc_n_",
    nodes: {
      silt_x1: { x: 0, y: 0, kind: "exit", name: "Channel" },
      silt_j1: { x: 1, y: 0, kind: "hall" },
      silt_j2: { x: 2, y: 0, kind: "hall" },
      silt_j3: { x: 3, y: 0, kind: "hall" },
      silt_j5: { x: 4, y: 0, kind: "hall" },
      silt_r1: { x: 1, y: 1, kind: "room", name: "Landing" },
      silt_j4: { x: 2, y: 1, kind: "hall" },
      silt_j6: { x: 3, y: 1, kind: "hall" },
      silt_j7: { x: 4, y: 1, kind: "hall" },
      silt_r2: { x: 3, y: -1, kind: "room", name: "Gate Hall" },
      silt_r3: { x: 4, y: -1, kind: "room", name: "Collapsed Run" },
      silt_x2: { x: 2, y: 2, kind: "exit", name: "Cellar" },
      silt_x3: { x: 3, y: 2, kind: "exit", name: "Cistern" },
      silt_j8: { x: 4, y: 2, kind: "hall" },
      silt_r4: { x: 5, y: 2, kind: "room", name: "Lair" },
      silt_r5: { x: 6, y: 2, kind: "room", name: "Vault" }
    },
    edges: [["silt_x1", "silt_j1"], ["silt_j1", "silt_r1"], ["silt_j1", "silt_j2"], ["silt_j2", "silt_j3"], ["silt_j2", "silt_j4"], ["silt_j3", "silt_r2"], ["silt_j3", "silt_j5"], ["silt_j4", "silt_x2"], ["silt_j4", "silt_j6"], ["silt_j5", "silt_r3"], ["silt_j5", "silt_j7"], ["silt_j6", "silt_x3"], ["silt_j6", "silt_j7"], ["silt_j7", "silt_j8"], ["silt_j8", "silt_r4"], ["silt_r4", "silt_r5"]]
  };
})();
