#!/usr/bin/env node
/*
 * check_overworld_map.js -- the overworld's tiles and roads live in web/mygame/overworld-data.js (read by the map panel and, through *script, by the scene). The scene lists NO
 * tiles: the panel writes the tile the player picked into ow_dest and presses one fixed option, so the data file is the only place a tile exists. This checks the data is well formed,
 * so a bad entry cannot crash a journey or strand a tile:
 *   1. every road joins two tiles that exist and has a length, and no road is listed twice;
 *   2. the map is one connected piece (every tile can reach every other);
 *   3. no two tiles sit on one spot, and every tile has a name, a kind (one the panel has a colour for), a region, an info line and a "here" line;
 *   4. tile ids are plain lowercase words (they go into a saved variable), and the scene still offers its Travel and camp options and the startup variables it needs;
 *   5. every route comes with its legs (the scene charges a journey leg by leg), and the legs add up to the route's miles and minutes.
 * Run: node tools/check_overworld_map.js        Exit code 1 if anything disagrees.
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const GAME = path.join(ROOT, "web", "mygame");

global.window = {};
require(path.join(GAME, "overworld-data.js"));
const O = global.window.Overworld;
const scene = fs.readFileSync(path.join(GAME, "scenes", "overworld", "overworld.txt"), "utf8");
const startup = fs.readFileSync(path.join(GAME, "scenes", "startup.txt"), "utf8");
const css = fs.readFileSync(path.join(GAME, "overworldmap.css"), "utf8");

let bad = 0;
function fail(msg) { console.error("  FAIL: " + msg); bad++; }

const ids = Object.keys(O.nodes);
const KINDS = ["city", "town", "road", "hills", "forest"];
const seenEdges = {};
O.edges.forEach((e) => {
  [e[0], e[1]].forEach((id) => { if (!O.nodes[id]) fail("a road joins \"" + id + "\", which is not a tile"); });
  if (!(e[2] > 0)) fail("the road " + e[0] + "-" + e[1] + " has no length");
  const k = [e[0], e[1]].sort().join("-");
  if (seenEdges[k]) fail("the road " + k + " is listed twice"); seenEdges[k] = true;
});
ids.forEach((a) => ids.forEach((b) => { if (!O.route(a, b).ok) fail("no way from " + a + " to " + b); }));
const spots = {};
ids.forEach((id) => {
  const n = O.nodes[id], k = n.x + "," + n.y;
  if (!/^[a-z][a-z0-9_]*$/.test(id)) fail("tile id \"" + id + "\" must be a lowercase word (it is stored in a saved variable)");
  if (spots[k]) fail(id + " and " + spots[k] + " sit on one spot"); spots[k] = id;
  ["name", "kind", "region", "info", "here"].forEach((f) => { if (!n[f]) fail("tile " + id + " has no " + f); });
  if (n.kind && !KINDS.includes(n.kind)) fail("tile " + id + " has kind \"" + n.kind + "\", which the panel has no colour for (" + KINDS.join(", ") + ")");
  if (n.kind && !new RegExp("\\.ow-k-" + n.kind + " \\.ow-dot").test(css)) fail("overworldmap.css has no colour for kind \"" + n.kind + "\"");
});
if (!/\*set ow_pos "[a-z0-9_]+"|\*create ow_pos "([a-z0-9_]+)"/.test(startup)) fail("startup.txt does not create ow_pos");
const start = (startup.match(/^\*create ow_pos "([a-z0-9_]+)"/m) || [])[1];
if (start && !O.nodes[start]) fail("startup.txt starts ow_pos on \"" + start + "\", which is not a tile");
["ow_dest", "ow_trip_ok", "ow_trip_locked", "locked_ow_trip_page_id", "ow_legs", "ow_leg_i", "ow_leg_minutes", "ow_rations_total", "ow_exposure_pct", "ow_can_camp", "ow_camp_ok", "ow_camp_wet", "ow_camp_locked", "locked_ow_camp_page_id", "exposure_camping", "rations_eaten_last"].forEach((v) => { if (!new RegExp("^\\*create " + v + " ", "m").test(startup)) fail("startup.txt does not create " + v); });
if (!/# Travel to the tile you picked on the map\./.test(scene)) fail("overworld.txt has lost its one Travel option (the panel presses it)");
if (!/# Make camp for the night\./.test(scene)) fail("overworld.txt has lost its camp option (the panel presses it)");
ids.forEach((a) => ids.forEach((b) => {
  const r = O.route(a, b);
  if (!r.ok) return;
  const m = r.legs.reduce((t, l) => t + l.miles, 0), t = r.legs.reduce((x, l) => x + l.minutes, 0);
  if (r.legs.length !== r.path.length - 1 || m !== r.miles || t !== r.minutes) fail("the legs of " + a + " to " + b + " do not add up to the route");
}));
if (/\*set ow_dest "/.test(scene)) fail("overworld.txt sets ow_dest by hand: the panel writes it, and the scene lists no tiles");

if (bad) { console.error(bad + " problem(s)"); process.exit(1); }
console.log("overworld map: " + ids.length + " tiles, " + O.edges.length + " roads, data well formed, scene and startup.txt agree. OK.");
