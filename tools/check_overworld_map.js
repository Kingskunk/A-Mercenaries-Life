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

// road events on a solo journey: every row has an id, tile kinds the map knows, territories that exist, and four weights; the scene has a label for it
const travelScene = fs.readFileSync(path.join(GAME, "scenes", "overworld", "travel_events.txt"), "utf8");
const overworldScene = fs.readFileSync(path.join(GAME, "scenes", "overworld", "overworld.txt"), "utf8");
((O.travelEvents || []).concat((O.campEvents || []).map((e) => Object.assign({ camp: true }, e)))).forEach((e) => {
  if (e.ford && !Object.keys(O.nodes).some((k) => O.nodes[k].ford)) fail("road event " + e.id + " needs a ford tile, and no tile has the ford flag");
  if (!/^[a-z_]+$/.test(String(e.id))) fail("a road event has an id that is not plain lowercase words");
  (e.kinds || []).forEach((k) => { if (!["road", "forest", "hills"].includes(k)) fail("road event " + e.id + " lists a tile kind it can never happen on: " + k); });
  (e.territories || []).forEach((t) => { if (!O.territories[t]) fail("road event " + e.id + " names a territory that does not exist: " + t); });
  (e.when || []).forEach((w) => { if (!["day", "dusk", "dark"].includes(w)) fail("road event " + e.id + " has a time of day the planner does not know: " + w); });
  if (!Array.isArray(e.weight) || e.weight.length !== 4 || e.weight.some((w) => !Number.isInteger(w) || w < 0)) fail("road event " + e.id + " needs four whole-number weights, one for each danger from 0 to 3");
  if (!new RegExp("^\\*label te_" + e.id + "\\s*$", "m").test(travelScene)) fail("road event " + e.id + " has no *label te_" + e.id + " in overworld/travel_events.txt");
  if (!overworldScene.includes('ow_event_id = "' + e.id + '"')) fail("road event " + e.id + " is not dispatched in overworld.txt ow_event");
});

require(path.join(GAME, "overworld-art.js"));
const ART = global.window.OVERWORLD_ART || {};
(O.features || []).forEach((f) => {
  if (!f.id || !f.name || !f.kind || !f.info) fail("a map feature has no id, name, kind or info (the card text)");
  if (!/^[a-z]+$/.test(f.kind) || !new RegExp("\\.ow-f-" + f.kind + "\\b").test(css)) fail("feature " + f.id + " has kind \"" + f.kind + "\", which overworldmap.css has no .ow-f- colour for");
  const art = ART[f.art];
  if (!art) fail("feature " + f.id + " has art \"" + f.art + "\", which is not in overworld-art.js (draw web/mygame/overworld-art/" + f.art + ".svg and run node tools/gen_overworld_art.js)");
  else if (!art.paths || !art.paths.length || !(art.unit > 0) || !Array.isArray(art.bbox) || art.bbox.length !== 4 || !art.bbox.every(Number.isFinite)) fail("the art of feature " + f.id + " has no paths, no unit or no bounding box");
  if (!Array.isArray(f.label) || f.label.length !== 2 || !f.label.every(Number.isFinite)) fail("feature " + f.id + " has a label that is not [x, y]");
});
const ids = Object.keys(O.nodes);
ids.forEach((id) => { const n = O.nodes[id]; if (n.ford !== undefined && (n.ford !== true || n.kind !== "road")) fail("tile " + id + " has a ford flag that is not true, or is not on a road tile"); });
const KINDS = ["city", "town", "village", "fort", "road", "hills", "forest"];
const seenEdges = {};
O.edges.forEach((e) => {
  [e[0], e[1]].forEach((id) => { if (!O.nodes[id]) fail("a road joins \"" + id + "\", which is not a tile"); });
  if (!(e[2] > 0)) fail("the road " + e[0] + "-" + e[1] + " has no length");
  if (e[3] !== undefined && !(O.terrains && O.terrains[e[3]])) fail("the way " + e[0] + "-" + e[1] + " has terrain \"" + e[3] + "\", which is not in TERRAIN (" + Object.keys(O.terrains || {}).join(", ") + ")");
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
  if (n.climate !== undefined && !(Number.isInteger(n.climate) && n.climate >= -3 && n.climate <= 3)) fail("tile " + id + " has a climate that is not a whole number from -3 to 3");
  ["hereNight", "hereStorm"].forEach((f) => { if (n[f] !== undefined && !(typeof n[f] === "string" && n[f])) fail("tile " + id + " has a " + f + " that is not a sentence"); });
  if (n.also !== undefined && (!KINDS.includes(n.also) || n.also === n.kind)) fail("tile " + id + " has an \"also\" of \"" + n.also + "\", which must be a different kind from " + KINDS.join(", "));
  if (n.water !== undefined && !(typeof n.water === "string" && n.water)) fail("tile " + id + " has a water that is not a short phrase");
  if (["road", "forest", "hills"].includes(n.kind) && !n.walk) fail("tile " + id + " is a " + n.kind + " tile with no walk text, which the caravan escort prints when the line comes in");
  if (n.danger !== undefined && !(Number.isInteger(n.danger) && n.danger >= 0 && n.danger <= 3)) fail("tile " + id + " has a danger of " + n.danger + ", which must be a whole number from 0 to 3");
  if (O.territories && O.territories[n.territory] && O.territories[n.territory].patrol !== undefined && !(Number.isInteger(O.territories[n.territory].patrol) && Math.abs(O.territories[n.territory].patrol) <= 3)) fail("territory " + n.territory + " has a patrol that is not a whole number from -3 to 3");
  if (!n.territory || !(O.territories && O.territories[n.territory])) fail("tile " + id + " has territory \"" + n.territory + "\", which is not in TERRITORIES");
  if (n.kind && !KINDS.includes(n.kind)) fail("tile " + id + " has kind \"" + n.kind + "\", which the panel has no colour for (" + KINDS.join(", ") + ")");
  if (n.kind && !new RegExp("\\.ow-k-" + n.kind + " \\.ow-dot").test(css)) fail("overworldmap.css has no colour for kind \"" + n.kind + "\"");
});
if (!/\*set ow_pos "[a-z0-9_]+"|\*create ow_pos "([a-z0-9_]+)"/.test(startup)) fail("startup.txt does not create ow_pos");
const start = (startup.match(/^\*create ow_pos "([a-z0-9_]+)"/m) || [])[1];
if (start && !O.nodes[start]) fail("startup.txt starts ow_pos on \"" + start + "\", which is not a tile");
["ow_dest", "ow_trip_ok", "ow_trip_locked", "locked_ow_trip_page_id", "ow_legs", "ow_leg_i", "ow_leg_minutes", "ow_leg_pace", "ow_rations_total", "ow_exposure_pct", "ow_can_camp", "ow_camp_ok", "ow_camp_mode", "ow_camp_minutes", "ow_dawn_ok", "ow_dawn_hours", "ow_camp_wet", "ow_camp_locked", "locked_ow_camp_page_id", "exposure_camping", "rations_eaten_last", "ow_water", "climate_shift"].forEach((v) => { if (!new RegExp("^\\*create " + v + " ", "m").test(startup)) fail("startup.txt does not create " + v); });
if (!/# Travel to the tile you picked on the map\./.test(scene)) fail("overworld.txt has lost its one Travel option (the panel presses it)");
if (!/# Make camp\./.test(scene)) fail("overworld.txt has lost its camp option (the panel presses it)");
ids.forEach((a) => ids.forEach((b) => {
  const r = O.route(a, b);
  if (!r.ok) return;
  const m = r.legs.reduce((t, l) => t + l.miles, 0), t = r.legs.reduce((x, l) => x + l.minutes, 0);
  if (r.legs.length !== r.path.length - 1 || m !== r.miles || t !== r.minutes) fail("the legs of " + a + " to " + b + " do not add up to the route");
}));
if (!/# Deliver \$\{crs1_item\}/.test(scene)) fail("overworld.txt has lost its courier Deliver options (the panel offers them as buttons; radiant/hall_courier.txt)");
if (/\*set ow_dest "/.test(scene)) fail("overworld.txt sets ow_dest by hand: the panel writes it, and the scene lists no tiles");

if (bad) { console.error(bad + " problem(s)"); process.exit(1); }
console.log("overworld map: " + ids.length + " tiles, " + O.edges.length + " roads, data well formed, scene and startup.txt agree. OK.");
