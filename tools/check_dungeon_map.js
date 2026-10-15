#!/usr/bin/env node
/*
 * check_dungeon_map.js -- the map panel (web/mygame/dungeonmap.js) draws in the browser and cannot read a scene, so each dungeon keeps its layout in its own file in
 * web/mygame/dungeons/. That layout and the scene's exits must agree, or the map shows a place connected to somewhere it is not. This compares them, for every file in that folder:
 *   1. the places match: every <labelPrefix><local id> label in the scene is a node on the map (id = idPrefix + local id) and the reverse;
 *   2. the ways match: each exit written in the scene (*set dg_dest "<id>") is an edge on the map and the reverse, and every way works both directions;
 *   3. the layout is a real picture: no two places on one spot, and every way joins neighbouring cells;
 *   4. the direction words in the exit text ("Go north...") agree with where the map puts the place;
 *   5. startup.txt creates dg_seen_<id>, dg_mark_<id> and dg_done_<id> for every place (and the "none" ones);
 *   6. every id carries the dungeon's idPrefix, so two dungeons' flags cannot collide, and no id is claimed by two dungeons;
 *   7. the shared engine (dungeon.txt) and the map panel (dungeonmap.js) name no node of any dungeon;
 *   9. no option that starts with "Go" and names a direction fails to move (the in-page map treats every such option as a move);
 *   8. every option that moves to a neighbouring place starts with "Go" and names its direction, because the in-page map (dungeonmap.js) finds a way's option by that word.
 * Run: node tools/check_dungeon_map.js        Exit code 1 if anything disagrees.
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const GAME = path.join(ROOT, "web", "mygame");
const DUNGEONS = path.join(GAME, "dungeons");

global.window = {};
require(path.join(GAME, "dungeonmap.js"));
const files = fs.existsSync(DUNGEONS) ? fs.readdirSync(DUNGEONS).filter((f) => /\.js$/.test(f)) : [];
files.forEach((f) => require(path.join(DUNGEONS, f)));
const MAPS = global.window.DungeonMap.maps;
const startup = fs.readFileSync(path.join(GAME, "scenes", "startup.txt"), "utf8");

let bad = 0;
function fail(msg) { console.error("  FAIL: " + msg); bad++; }

if (!files.length) fail("no dungeon files in web/mygame/dungeons/");
const claimed = {};

for (const key of Object.keys(MAPS)) {
  const m = MAPS[key];
  console.log("map " + key + " (" + m.scene + ")");
  if (!m.idPrefix || !m.labelPrefix) { fail(key + " has no idPrefix or labelPrefix"); continue; }
  const text = fs.readFileSync(path.join(GAME, "scenes", m.scene), "utf8").replace(/\r\n/g, "\n");
  const lines = text.split("\n");
  const labelRe = new RegExp("^\\*label " + m.labelPrefix + "(\\w+)\\s*$");

  // 6 prefixes and no clashes
  Object.keys(m.nodes).forEach((id) => {
    if (id.indexOf(m.idPrefix) !== 0) fail(id + " does not start with " + m.idPrefix);
    if (claimed[id]) fail(id + " is claimed by both " + claimed[id] + " and " + key); else claimed[id] = key;
  });

  // the scene's places and exits
  const places = {}, sceneEdges = {};
  let cur = null, lastOption = "", lastWasMove = false;
  const goOptions = [];   // every option of a place that starts with "Go" and names a direction, and whether it is a move (it sets dg_dest)
  lines.forEach((ln) => {
    const lab = labelRe.exec(ln);
    if (lab) { cur = m.idPrefix + lab[1]; places[cur] = true; return; }
    if (/^\*label /.test(ln)) { cur = null; return; }
    if (!cur) return;
    const opt = /^\s*# (.*)$/.exec(ln);
    if (opt) {
      lastOption = opt[1]; lastWasMove = false;
      if (/^Go\b/.test(lastOption) && /\b(west|east|north|south)\b/i.test(lastOption)) goOptions.push({ place: cur, text: lastOption, move: false });
      return;
    }
    const dest = /^\s*\*set dg_dest "(\w+)"/.exec(ln);
    if (dest) {
      const to = dest[1];
      if (goOptions.length && goOptions[goOptions.length - 1].text === lastOption) goOptions[goOptions.length - 1].move = true;
      (sceneEdges[cur + ">" + to] = sceneEdges[cur + ">" + to] || []).push(lastOption);
    }
  });

  // 9 an option that reads as a move ("Go north...") but does not move would be pressed by the in-page map as one
  goOptions.forEach((o) => { if (!o.move) fail("\"" + o.text + "\" (" + o.place + ") reads as a move but sets no dg_dest: the in-page map would treat it as one; reword it, or it will be pressed as a move"); });

  // 10 a scene that marks places as seen from afar (the Longshade watchtower's view) names places the map has: a typo would mark a flag no map ever reads
  lines.forEach((ln, i) => {
    const mk = /^\s*\*set dg_seen_(\w+) true/.exec(ln);
    if (mk && mk[1].indexOf(m.idPrefix) === 0 && !m.nodes[mk[1]]) fail("line " + (i + 1) + " marks " + mk[1] + " as seen, which is not a place on the map");
  });

  // 11 a dungeon with a "<prefix>bend_check" label (a quiet-bend list: plain bends make no encounter roll) must list EXACTLY the trail junctions that have two ways (hidden ways count)
  const bendLabel = m.labelPrefix.replace(/n_$/, "") + "bend_check";
  const bi = lines.findIndex((ln) => ln.trim() === "*label " + bendLabel);
  if (bi >= 0) {
    const listed = new Set();
    for (let k = bi + 1; k < lines.length && !/^\*(label|return)/.test(lines[k]); k++) { const mm = /^\*if \(dg_dest = "(\w+)"\)/.exec(lines[k]); if (mm) listed.add(mm[1]); }
    const degree = {}; Object.keys(m.nodes).forEach((id) => (degree[id] = 0)); m.edges.forEach((e) => { degree[e[0]]++; degree[e[1]]++; });
    Object.keys(m.nodes).forEach((id) => {
      const bend = m.nodes[id].kind === "hall" && degree[id] === 2;
      if (bend && !listed.has(id)) fail(id + " is a plain bend (two ways) but is not in " + bendLabel);
      if (!bend && listed.has(id) && m.nodes[id].kind === "hall") fail(id + " is in " + bendLabel + " but is not a plain bend");   // a room or a mouth may be listed too (it is made quiet)
    });
  }

  // 1 places
  Object.keys(places).forEach((id) => { if (!m.nodes[id]) fail("the scene has place " + id + " but the map does not"); });
  Object.keys(m.nodes).forEach((id) => { if (!places[id]) fail("the map has place " + id + " but the scene has no " + m.labelPrefix + id.slice(m.idPrefix.length) + " label"); });

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

  // 8 the in-page map presses a move by its direction word, so every move option must have one (and start with "Go")
  Object.keys(sceneEdges).forEach((k) => {
    sceneEdges[k].forEach((optText) => {
      if (!/^Go\b/.test(optText) || !/\b(west|east|north|south)\b/i.test(optText)) fail("\"" + optText + "\" (" + k.replace(">", " -> ") + ") must start with \"Go\" and name a direction, or the in-page map cannot press it");
    });
  });

  // 5 the flags
  Object.keys(m.nodes).concat(["none"]).forEach((id) => {
    ["seen", "mark", "done"].forEach((pre) => { if (startup.indexOf("*create dg_" + pre + "_" + id + " ") < 0) fail("startup.txt does not create dg_" + pre + "_" + id); });
  });
  console.log("  " + Object.keys(m.nodes).length + " places, " + m.edges.length + " ways");
}

// 7 the shared files name no node
const ids = Object.keys(claimed);
["scenes/dungeon.txt", "dungeonmap.js"].forEach((f) => {
  const body = fs.readFileSync(path.join(GAME, f), "utf8");
  ids.forEach((id) => { if (new RegExp("\\b" + id + "\\b").test(body)) fail(f + " names the node " + id + ": that belongs in the dungeon's own files"); });
});

if (bad) { console.error(bad + " problem(s)"); process.exit(1); }
console.log("OK: every dungeon's map and scene agree");
