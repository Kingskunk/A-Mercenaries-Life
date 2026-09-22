#!/usr/bin/env node
/*
 * lint_thin_places.js — flags location and environment text that renders too short.
 *
 * lint_thin_prose.js only checks what happens after a *choice option is picked; nothing
 * checked the description a player reads when they ARRIVE somewhere. This does. It runs
 * tools/render_hub.js on each hub and point of interest below, across every weather x time x
 * day combination (and every variant of a random pool, via PICKS), counts the words the
 * player actually sees (the [b]...[/b] status banner and formatting tags don't count), and
 * reports the combinations that fall under that entry's minimum.
 *
 * Three kinds of entry, because a hub the player reads once per visit is not the same as a
 * re-entry line printed every time they come back from a sub-location:
 *   hub       a district hub or district intro: min 100 words
 *   poi       a point-of-interest entry (a market, a shrine, a shop lane): min 75 words
 *   reentry   a line printed on every return to a sub-hub or menu: min 35 words
 * (the minimums are the HUB, POI and REENTRY constants below; tune them there). Advisory, like the other linters: it
 * exits 0 and reports, so it can be run at any time. Pass strict=true to exit 1 on any hit.
 *
 * Usage, from the repo root:
 *   node tools/lint_thin_places.js [only=<substring of an entry name>] [strict=true] [show=5]
 *   e.g. node tools/lint_thin_places.js only=harbor
 * A full run renders many combinations and takes a few minutes; use only= to narrow it.
 */
var cp = require('child_process');
var args = {};
process.argv.slice(2).forEach(function (a) { var m = /^(\w+)=(.*)$/.exec(a); if (m) args[m[1]] = m[2]; });
var show = parseInt(args.show || "3", 10);

// name, scene, label, extra stats, kind, minimum words, picks (variants per random pool)
// Minimums come from measuring the game as written (2026-09-21): hubs run 154 to 356 words at
// their thinnest, point-of-interest entries 81 to 185, and re-entry lines 29 to 43.
var HUB = 100, POI = 75, REENTRY = 35;
var ENTRIES = [
  // districts and their hubs
  ["Dredge-End hub",          "port_valen_dredge_end",   "port_valen_dredge_end", {},                              "hub", HUB, 1],
  ["Carrion Compound hub",    "port_valen",              "port_valen_hub",        { port_valen_hub_seen: true },   "hub", HUB, 1],
  ["Harbor intro",            "port_valen",              "port_valen_harbor",     {},                              "hub", HUB, 1],
  ["Middle Ward hub",         "port_valen_middle_ward",  "mw_conduit_square",     {},                              "hub", HUB, 1],
  ["Civic Heights hub",       "port_valen_civic_heights","port_valen_civic_heights", {},                          "hub", HUB, 1],
  ["Upper Wharves hub",       "port_valen_upper_wharves","port_valen_upper_wharves", {},                          "hub", HUB, 1],
  // point-of-interest entries
  ["Dredge-End market",       "port_valen_dredge_end",   "cut_market",            {},                              "poi", POI, 1],
  ["Dredge-End gangways",     "port_valen_dredge_end",   "cut_gangways",          {},                              "poi", POI, 1],
  ["Dredge-End boat-sheds",   "port_valen_dredge_end",   "cut_sheds",             {},                              "poi", POI, 1],
  ["Dredge-End landing",      "port_valen_dredge_end",   "cut_landing",           {},                              "poi", POI, 1],
  ["Dredge-End lamp stair",   "port_valen_dredge_end",   "cut_lamp",              {},                              "poi", POI, 1],
  ["Dredge-End shrine",       "port_valen_dredge_end",   "cut_shrine",            {},                              "poi", POI, 1],
  ["Dredge-End lower steps",  "port_valen_dredge_end",   "cut_steps",             {},                              "poi", POI, 1],
  ["Locksmiths' Close",       "port_valen_middle_ward",  "mw_locksmiths_close",   {},                              "poi", POI, 1],
  ["Lantern Lane",            "port_valen_middle_ward",  "mw_lantern_lane",       {},                              "poi", POI, 1],
  ["Smiths' Row",             "port_valen_middle_ward",  "mw_smiths_row",         {},                              "poi", POI, 1],
  ["Conduit Wash-House",      "port_valen_middle_ward",  "mw_wash_yard",          {},                              "poi", POI, 1],
  ["Harbor quays observe",    "port_valen",              "pv_quays_observe",      {},                              "poi", POI, 1],
  // re-entry lines
  ["Harbor sub-hub line",     "port_valen",              "port_valen_harbor_pois", {},                             "reentry", REENTRY, 4],
  ["Pier menu line",          "port_valen",              "pv_poi_pier_menu",      {},                              "reentry", REENTRY, 3],
  ["Fish slip menu line",     "port_valen",              "pv_poi_fish_slip_menu", {},                              "reentry", REENTRY, 3],
  ["Drydock menu line",       "port_valen",              "pv_poi_drydock_menu",   {},                              "reentry", REENTRY, 3]
];

function wordsOf(block) {
  var body = block.split("OPTIONS")[0];
  var t = body.split("\n").slice(1).join(" ");
  t = t.replace(/\[b\].*?\[\/b\]/g, "").replace(/\[\/?[a-z]+\/?\]/g, "");
  return t.split(/\s+/).filter(Boolean).length;
}

var totalFlagged = 0;
ENTRIES.forEach(function (e) {
  if (args.only && e[0].toLowerCase().indexOf(args.only.toLowerCase()) < 0) return;
  var env = Object.assign({}, process.env, { STATS: JSON.stringify(e[3]) });
  if (e[6] > 1) env.PICKS = String(e[6]);
  var out = cp.spawnSync("node", ["tools/render_hub.js", "", "", "", e[1], e[2]], { env: env, encoding: "utf-8", maxBuffer: 1 << 28 }).stdout || "";
  var blocks = out.split("=== ").slice(1);
  if (!blocks.length) { console.log("!! " + e[0] + ": no output (label missing, or the render failed)"); return; }
  var results = blocks.map(function (b) { return { words: wordsOf(b), head: b.split("\n")[0].split(" | street_life")[0] + (/pick=\d+/.exec(b.split("\n")[0]) ? " " + /pick=\d+/.exec(b.split("\n")[0])[0] : "") }; });
  var min = Math.min.apply(null, results.map(function (r) { return r.words; }));
  var thin = results.filter(function (r) { return r.words < e[5]; }).sort(function (a, b) { return a.words - b.words; });
  console.log((thin.length ? "THIN  " : "ok    ") + e[0] + " [" + e[4] + ", min " + e[5] + "]: thinnest " + min + " words, " + thin.length + " of " + results.length + " renders under the minimum");
  thin.slice(0, show).forEach(function (r) { console.log("        " + r.words + " words: " + r.head); });
  totalFlagged += thin.length;
});
console.log("\n" + (totalFlagged ? totalFlagged + " renders under their minimum (advisory)." : "No renders under their minimums."));
if (args.strict === "true" && totalFlagged) process.exit(1);
