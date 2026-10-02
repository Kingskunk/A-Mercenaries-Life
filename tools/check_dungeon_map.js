#!/usr/bin/env node
/*
 * check_dungeon_map.js -- the map panel (web/mygame/dungeonmap.js) keeps its own copy of a dungeon's layout, because it draws in the browser and cannot read the scene.
 * That copy and the scene's exits must agree, or the map shows a place connected to somewhere it is not. This compares them, for every map in dungeonmap.js:
 *   1. the places match: every pvsc_n_<id> label in the scene is a node on the map and the reverse;
 *   2. the ways match: each exit written in the scene (*set dg_dest "<id>") is an edge on the map and the reverse, and every way works both directions;
 *   3. the layout is a real picture: no two places on one spot, and every way joins neighbouring cells;
 *   4. the direction words in the exit text ("Go north...") agree with where the map puts the place;
 *   5. startup.txt creates dg_seen_<id> and dg_mark_<id> for every place (and the "none" pair).
 * Run: node tools/check_dungeon_map.js        Exit code 1 if anything disagrees.
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const GAME = path.join(ROOT, "web", "mygame");

global.window = {};
require(path.join(GAME, "dungeonmap.js"));
const MAPS = global.window.DungeonMap.maps;
const startup = fs.readFileSync(path.join(GAME, "scenes", "startup.txt"), "utf8");

let bad = 0;
function fail(msg) { console.error("  FAIL: " + msg); bad++; }

for (const key of Object.keys(MAPS)) {
  const m = MAPS[key];
  console.log("map " + key + " (" + m.scene + ")");
  const text = fs.readFileSync(path.join(GAME, "scenes", m.scene), "utf8").replace(/\r\n/g, "\n");
  const lines = text.split("\n");

  // the scene's places and exits
  const places = {}, sceneEdges = {};
  let cur = null, lastOption = "";
  lines.forEach((ln) => {
    const lab = /^\*label pvsc_n_(\w+)\s*$/.exec(ln);
    if (lab) { cur = lab[1]; places[cur] = true; return; }
    if (/^\*label /.test(ln)) { cur = null; return; }
    if (!cur) return;
    const opt = /^\s*# (.*)$/.exec(ln);
    if (opt) { lastOption = opt[1]; return; }
    const dest = /^\s*\*set dg_dest "(\w+)"/.exec(ln);
    if (dest) {
      const to = dest[1];
      (sceneEdges[cur + ">" + to] = sceneEdges[cur + ">" + to] || []).push(lastOption);
    }
  });

  // 1 places
  Object.keys(places).forEach((id) => { if (!m.nodes[id]) fail("the scene has place " + id + " but the map does not"); });
  Object.keys(m.nodes).forEach((id) => { if (!places[id]) fail("the map has place " + id + " but the scene has no pvsc_n_" + id + " label"); });

  // 2 ways, both directions
  const mapEdges = {};
  m.edges.forEach((e) => { mapEdges[e[0] + ">" + e[1]] = true; mapEdges[e[1] + ">" + e[0]] = true; });
  Object.keys(sceneEdges).forEach((k) => {
    const [a, b] = k.split(">");
    if (!mapEdges[k]) fail("the scene lets you go " + a + " -> " + b + " but the map has no way between them");
    if (!sceneEdges[b + ">" + a]) fail("the scene lets you go " + a + " -> " + b + " but not back (" + b + " -> " + a + ")");
  });
  Object.keys(mapEdges).forEach((k) => { if (!sceneEdges[k]) fail("the map joins " + k.replace(">", " and ") + " but the scene has no exit " + k.replace(">", " -> ")); });

  // 3 a real picture
  const spot = {};
  Object.keys(m.nodes).forEach((id) => {
    const n = m.nodes[id], at = n.x + "," + n.y;
    if (spot[at]) fail(id + " and " + spot[at] + " are both at " + at); else spot[at] = id;
  });
  m.edges.forEach((e) => {
    const a = m.nodes[e[0]], b = m.nodes[e[1]];
    if (!a || !b) { fail("edge " + e.join("-") + " names a place that is not on the map"); return; }
    if (Math.abs(a.x - b.x) + Math.abs(a.y - b.y) !== 1) fail("the way " + e.join("-") + " does not join neighbouring cells");
  });

  // 4 direction words
  const WORDS = { west: [-1, 0], east: [1, 0], north: [0, -1], south: [0, 1] };
  Object.keys(sceneEdges).forEach((k) => {
    const [a, b] = k.split(">"), na = m.nodes[a], nb = m.nodes[b];
    if (!na || !nb) return;
    sceneEdges[k].forEach((optText) => {
      const w = /\b(west|east|north|south)\b/i.exec(optText);
      if (!w) return;
      const d = WORDS[w[1].toLowerCase()];
      if (nb.x - na.x !== d[0] || nb.y - na.y !== d[1]) fail("\"" + optText + "\" (" + a + " -> " + b + ") says " + w[1] + " but the map puts " + b + " " + (nb.x - na.x) + "," + (nb.y - na.y) + " from " + a);
    });
  });

  // 5 the flags
  Object.keys(m.nodes).concat(["none"]).forEach((id) => {
    ["seen", "mark"].forEach((pre) => { if (startup.indexOf("*create dg_" + pre + "_" + id + " ") < 0) fail("startup.txt does not create dg_" + pre + "_" + id); });
  });
  console.log("  " + Object.keys(m.nodes).length + " places, " + m.edges.length + " ways");
}

if (bad) { console.error(bad + " problem(s)"); process.exit(1); }
console.log("OK: the map and the scene agree");
