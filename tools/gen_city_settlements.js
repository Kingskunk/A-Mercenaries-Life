#!/usr/bin/env node
/*
 * gen_city_settlements.js -- the "Town" card of the sidebar (web/mygame/citytravel.js): in any town or village, three buttons that go to the notice board, to the inn and out of the settlement.
 *
 * The user's call (2026-10-22): every settlement has a notice board, an inn (or its stand-in) and a way out to the overworld, so the sidebar can take the player to any of the three from any page of the
 * settlement. It uses the same machinery as the Places list of a city (tools/gen_city_places.js): nothing moves the player and nothing copies a shop's hours. The sidebar presses HIDDEN COPIES of real options.
 *
 *   A service ("board", "inn", "leave") is a route: the options the player would click from the settlement's hub, each given as [page, target, file]: the label of the page that holds the option, the label the
 *   option's last statement goes to, and the scene file. For each step this script writes a hidden copy "⇥ [pvgo:<page>:<target>]" at the end of the same *choice, inside the same guards as the original.
 *
 *   HOME. To start a route from deep inside a settlement (a smithy, an inn, a hall), the sidebar first presses the page's own way back to the hub. So every place menu that already has a plain exit (an option
 *   whose only statements are an optional *set shop_open "" and a *goto to the hub, or to a page that has such an exit itself) also gets a hidden copy "⇥ [pvgo:home:<settlement>]". The list of files that count as
 *   place menus is in the registry: quest pages, event pages, job lots and romance scenes are left out on purpose, so those pages stay un-leavable from the sidebar, as they were.
 *
 * THE CONTRACT. Every settlement must define all three services; this script throws if one is missing or a step finds no option, so a half-built village fails the compile instead of reaching the player.
 * ADDING A SETTLEMENT: one entry in SETTLEMENTS below (its hub page and labels, its place files, the three routes), then `node tools/gen_city_data.js`. The minutes each route costs are measured by
 * tools/check_city_settlements.js --write into tools/city_settlements_extra.json.
 */
"use strict";
const fs = require("fs"), path = require("path");
const core = require("./gen_city_places.js");
const { ind, stripBlocks, optionsOf, cloneLines, SCENES, MARK } = core;

// A route step: [page label, target label, scene file]. The first step of every route is on the hub page.
function S(page, target, file) { return [page, target, file]; }
const SETTLEMENTS = {
  alderford: {
    name: "Alderford", start: "alderford", startScene: "alderford/alderford", hubFile: "alderford/alderford.txt", hubLabels: ["alderford"],
    files: ["alderford/drowned_oar.txt", "alderford/factors_hall.txt", "alderford/lower_wharf_market.txt", "alderford/timber_smithy.txt", "alderford/chapel.txt"],
    services: {
      board: { name: "Notice board", seen: "af_hall_seen", steps: [S("af_menu", "af_hall", "alderford/alderford.txt"), S("af_hall_floor", "af_hall_board", "alderford/factors_hall.txt")], done: "You are at the notice board." },
      inn: { name: "The Drowned Oar Taphouse", seen: "af_oar_seen", steps: [S("af_menu", "af_oar", "alderford/alderford.txt")], done: "You are at the Drowned Oar." },
      leave: { name: "Leave Alderford", steps: [S("af_menu", "ow_here", "alderford/alderford.txt")], done: "You take the road out of Alderford." }
    }
  },
  timbermouth: {
    name: "Timbermouth", start: "timbermouth", startScene: "timbermouth/timbermouth", hubFile: "timbermouth/timbermouth.txt", hubLabels: ["timbermouth"],
    files: ["timbermouth/factors_hall.txt", "timbermouth/general_store.txt", "timbermouth/split_pine_inn.txt", "timbermouth/workshops.txt"],
    services: {
      board: { name: "Notice board", seen: "tm_hall_seen", steps: [S("tm_menu", "tm_hall", "timbermouth/timbermouth.txt"), S("tm_hall_floor", "tm_hall_board", "timbermouth/factors_hall.txt")], done: "You are at the notice board." },
      inn: { name: "The Split Pine Inn", seen: "tm_inn_seen", steps: [S("tm_menu", "tm_inn", "timbermouth/timbermouth.txt")], done: "You are at the Split Pine Inn." },
      leave: { name: "Leave Timbermouth", steps: [S("tm_menu", "ow_here", "timbermouth/timbermouth.txt")], done: "You take the road out of Timbermouth." }
    }
  },
  brinewick: {
    name: "Brinewick", start: "brinewick", startScene: "port_valen/brinewick/brinewick", hubFile: "port_valen/brinewick/brinewick.txt", hubLabels: ["brinewick"],
    files: ["port_valen/brinewick/reedhouse.txt", "port_valen/brinewick/saltworks.txt", "port_valen/brinewick/tide_house.txt"],
    services: {
      board: { name: "Notice board", seen: "bw_tide_house_seen", steps: [S("brinewick", "bw_tide_house", "port_valen/brinewick/brinewick.txt"), S("bw_tide_house_main", "cr_read", "port_valen/brinewick/tide_house.txt")], done: "You are at the notice board." },
      inn: { name: "The Reedhouse", seen: "bw_reedhouse_seen", steps: [S("brinewick", "bw_reedhouse", "port_valen/brinewick/brinewick.txt")], done: "You are at the Reedhouse." },
      leave: { name: "Leave Brinewick", steps: [S("brinewick", "ow_here", "port_valen/brinewick/brinewick.txt")], done: "You take the bank road out of Brinewick." }
    }
  },
  marlcross: {
    name: "Marlcross", start: "marlcross", startScene: "port_valen/marlcross/marlcross", hubFile: "port_valen/marlcross/marlcross.txt", hubLabels: ["marlcross"],
    files: ["port_valen/marlcross/cross_hall.txt", "port_valen/marlcross/grain_green.txt", "port_valen/marlcross/wayfarers_rest.txt"],
    services: {
      board: { name: "Notice board", seen: "mc_hall_seen", steps: [S("marlcross", "mc_cross_hall", "port_valen/marlcross/marlcross.txt"), S("mc_cross_hall_main", "cr_read", "port_valen/marlcross/cross_hall.txt")], done: "You are at the notice board." },
      inn: { name: "The Wayfarer's Rest", seen: "mc_rest_seen", steps: [S("marlcross", "mc_wayfarers_rest", "port_valen/marlcross/marlcross.txt")], done: "You are at the Wayfarer's Rest." },
      leave: { name: "Leave Marlcross", steps: [S("marlcross", "ow_here", "port_valen/marlcross/marlcross.txt")], done: "You take the High Grey Road out of Marlcross." }
    }
  },
  redvein: {
    name: "Redvein", start: "redvein", startScene: "alderford/redvein/redvein", hubFile: "alderford/redvein/redvein.txt", hubLabels: ["redvein"],
    files: ["alderford/redvein/eastcut.txt", "alderford/redvein/gather_house.txt", "alderford/redvein/red_lantern.txt"],
    services: {
      board: { name: "Notice board", seen: "rv_hall_seen", steps: [S("redvein", "rv_gather_house", "alderford/redvein/redvein.txt"), S("rv_gather_house_main", "cr_read", "alderford/redvein/gather_house.txt")], done: "You are at the notice board." },
      inn: { name: "The Red Lantern", seen: "rv_lantern_seen", steps: [S("redvein", "rv_red_lantern", "alderford/redvein/redvein.txt")], done: "You are at the Red Lantern." },
      leave: { name: "Leave Redvein", steps: [S("redvein", "ow_here", "alderford/redvein/redvein.txt")], done: "You take the Eastcut Road out of Redvein." }
    }
  },
  whitefold: {
    name: "Whitefold", start: "whitefold", startScene: "alderford/whitefold/whitefold", hubFile: "alderford/whitefold/whitefold.txt", hubLabels: ["whitefold"],
    files: ["alderford/whitefold/fleecefold.txt", "alderford/whitefold/stone_yard.txt", "alderford/whitefold/white_ram.txt"],
    services: {
      board: { name: "Notice board", seen: "wf_fold_seen", steps: [S("whitefold", "wf_fleecefold", "alderford/whitefold/whitefold.txt"), S("wf_fleecefold", "cr_read", "alderford/whitefold/fleecefold.txt")], done: "You are at the notice rail." },
      inn: { name: "The White Ram", seen: "wf_ram_seen", steps: [S("whitefold", "wf_white_ram", "alderford/whitefold/whitefold.txt")], done: "You are at the White Ram." },
      leave: { name: "Leave Whitefold", steps: [S("whitefold", "ow_here", "alderford/whitefold/whitefold.txt")], done: "You take the road out of Whitefold." }
    }
  },
  barleycross: {
    name: "Barleycross", start: "barleycross", startScene: "timbermouth/barleycross/barleycross", hubFile: "timbermouth/barleycross/barleycross.txt", hubLabels: ["barleycross"],
    files: ["timbermouth/barleycross/green.txt", "timbermouth/barleycross/lane.txt", "timbermouth/barleycross/pasture.txt"],
    services: {
      board: { name: "Notice board", seen: "bc_hall_seen", steps: [S("barleycross", "bc_green", "timbermouth/barleycross/barleycross.txt"), S("bc_hall", "cr_read", "timbermouth/barleycross/green.txt")], done: "You are at the notice post." },
      // Barleycross has no inn: a farmer lets the loft over his barn for a few coppers, so the Lane's barn is the stand-in
      inn: { name: "The farmer's barn", seen: "bc_lane_seen", steps: [S("barleycross", "bc_lane", "timbermouth/barleycross/barleycross.txt"), S("bc_lane_lane", "bc_lane_barn", "timbermouth/barleycross/lane.txt")], done: "You are at the barn." },
      leave: { name: "Leave Barleycross", steps: [S("barleycross", "ow_here", "timbermouth/barleycross/barleycross.txt")], done: "You take the farm road out of Barleycross." }
    }
  },
  ashrun_holt: {
    name: "Ashrun Holt", start: "ashrun_holt", startScene: "timbermouth/ashrun_holt/ashrun_holt", hubFile: "timbermouth/ashrun_holt/ashrun_holt.txt", hubLabels: ["ashrun_holt"],
    files: ["timbermouth/ashrun_holt/ashrun_house.txt", "timbermouth/ashrun_holt/hide_yard.txt", "timbermouth/ashrun_holt/longhouse.txt", "timbermouth/ashrun_holt/work_yards.txt"],
    services: {
      board: { name: "Board of cords", seen: "ah_speaker_seen", steps: [S("ashrun_holt", "ah_longhouse", "timbermouth/ashrun_holt/ashrun_holt.txt"), S("ah_hall", "cr_read", "timbermouth/ashrun_holt/longhouse.txt")], done: "You are at the board of cords." },
      inn: { name: "Ashrun House", seen: "ah_inn_seen", steps: [S("ashrun_holt", "ah_inn", "timbermouth/ashrun_holt/ashrun_holt.txt")], done: "You are at Ashrun House." },
      leave: { name: "Leave Ashrun Holt", steps: [S("ashrun_holt", "ow_here", "timbermouth/ashrun_holt/ashrun_holt.txt")], done: "You take the forest track out of Ashrun Holt." }
    }
  }
};

const SERVICES = ["board", "inn", "leave"];

function readLines(file) { return fs.readFileSync(path.join(SCENES, file), "utf8").replace(/\r\n/g, "\n").split("\n"); }
function labelsOf(L) { const out = []; L.forEach(l => { const m = /^\*label (\S+)/.exec(l); if (m) out.push(m[1]); }); return out; }

// Is the option plain: its only statements are an optional *set shop_open "" and the final *goto (no prose, no other state)?
function plainBody(opt) {
  const kids = opt.body.filter(x => x.trim() !== "" && !/^\s*\*comment/.test(x) && ind(x) === opt.indent + 2).map(x => x.trim());
  if (!kids.length || kids.length > 2) return false;
  return kids.slice(0, -1).every(k => k === '*set shop_open ""') && /^\*goto(_scene)?\s/.test(kids[kids.length - 1]);
}

// How many plain exits a page is from the hub: the hub's own labels are 0, a page with a plain exit to a page of distance n is n + 1 (the shortest wins), until nothing changes. A "way home" option is
// a plain exit to a page CLOSER to the hub than the page it is on, so an option that goes up to a room or down a cellar stair (further away) is never taken for one.
function homeLevels(def, files) {
  const level = new Map(def.hubLabels.map(h => [h, 0]));
  const cache = {};
  files.forEach(f => { cache[f] = stripBlocks(readLines(f)); });
  let changed = true;
  while (changed) {
    changed = false;
    files.forEach(f => {
      const L = cache[f];
      labelsOf(L).forEach(lab => {
        if (def.hubLabels.indexOf(lab) >= 0) return;
        let best = level.has(lab) ? level.get(lab) : Infinity;
        optionsOf(L, lab, f).forEach(b => b.opts.forEach(o => { if (plainBody(o) && level.has(o.target) && level.get(o.target) + 1 < best) best = level.get(o.target) + 1; }));
        if (best !== Infinity && best !== level.get(lab)) { level.set(lab, best); changed = true; }
      });
    });
  }
  return level;
}

// Writes the hidden copies of one settlement into one file. stepsHere: [page, target] pairs for this file; withHome: add the "home" copies.
function applyFile(id, def, file, stepsHere, home, dry) {
  const p = path.join(SCENES, file);
  const raw = fs.readFileSync(p, "utf8"), crlf = raw.includes("\r\n");
  const L = stripBlocks(raw.replace(/\r\n/g, "\n").split("\n"));
  const ins = {}; let made = 0;
  const add = (b, k, lines) => { (ins[b.endLine] = ins[b.endLine] || []).push({ k: k, lines: lines }); made++; };
  stepsHere.forEach(st => {
    const page = st[0], target = st[1];
    let n = 0;
    optionsOf(L, page, file).forEach(b => {
      b.opts.filter(o => o.target === target).forEach(o => { add(b, page + ":" + target, cloneLines(o, page, target, b.indent + 2)); n++; });
    });
    if (n === 0) throw new Error(file + ": settlement " + id + ": no option on page " + page + " ends in a goto to " + target);
  });
  if (home) {
    labelsOf(L).forEach(lab => {
      optionsOf(L, lab, file).forEach(b => {
        b.opts.filter(o => plainBody(o) && home.has(o.target) && home.has(lab) && home.get(o.target) < home.get(lab)).forEach(o => add(b, "home:" + id, cloneLines(o, "home", id, b.indent + 2)));
      });
    });
  }
  Object.keys(ins).map(Number).sort((a, b) => b - a).forEach(endLine => {
    const groups = ins[endLine];
    const choiceIndent = (() => { for (let q = endLine; q >= 0; q--) if (/^\s*\*choice\b/.test(L[q])) return ind(L[q]); return 0; })();
    const block = ["*comment GEN:BEGIN place_steps " + groups.map(g => g.k).join(" ") + " -- generated by tools/gen_city_settlements.js from its registry; edit the registry, not this block"];
    groups.forEach(g => g.lines.forEach(l => block.push(l)));
    block.push("*comment GEN:END place_steps " + groups.map(g => g.k).join(" "));
    L.splice(endLine + 1, 0, ...block.map((l, n) => (n === 0 || n === block.length - 1) ? " ".repeat(choiceIndent + 2) + l : l));
  });
  const out = L.join("\n");
  if (!dry) fs.writeFileSync(p, crlf ? out.replace(/\n/g, "\r\n") : out);
  return made;
}

function run(opts) {
  opts = opts || {};
  let measured = {}; try { measured = JSON.parse(fs.readFileSync(path.join(__dirname, "city_settlements_extra.json"), "utf8")); } catch (e) { /* not measured yet */ }
  const out = {};
  Object.keys(SETTLEMENTS).forEach(id => {
    const def = SETTLEMENTS[id];
    SERVICES.forEach(s => { if (!def.services[s] || !def.services[s].steps || !def.services[s].steps.length) throw new Error("settlement " + id + " has no " + s + " (every settlement needs a notice board, an inn and a way out)"); });
    // files: the place files, the hub's file and every file a route passes through
    const files = new Set([def.hubFile].concat(def.files));
    SERVICES.forEach(s => def.services[s].steps.forEach(st => files.add(st[2])));
    const home = homeLevels(def, def.files.concat([def.hubFile]));
    const keys = new Set();
    files.forEach(f => {
      const stepsHere = [];
      SERVICES.forEach(s => def.services[s].steps.forEach(st => { if (st[2] === f && !stepsHere.some(x => x[0] === st[0] && x[1] === st[1])) stepsHere.push([st[0], st[1]]); }));
      applyFile(id, def, f, stepsHere, def.files.indexOf(f) >= 0 || f === def.hubFile ? home : null, !!opts.dry);
    });
    const services = SERVICES.map(s => {
      def.services[s].steps.forEach(st => keys.add(st[0] + ":" + st[1]));
      if (s !== "leave" && !def.services[s].seen) throw new Error("settlement " + id + " " + s + " has no seen flag (the Town card greys it until the player has been there)");
      return { id: s, name: def.services[s].name, seen: def.services[s].seen || "", done: def.services[s].done, steps: def.services[s].steps.map(st => st[0] + ":" + st[1]), stepMin: (measured[id] && measured[id][s]) ? measured[id][s] : def.services[s].steps.map(() => 0) };
    });
    out[id] = { name: def.name, keys: Array.from(keys), services: services };
  });
  return out;
}

module.exports = { run: run, SETTLEMENTS: SETTLEMENTS, SERVICES: SERVICES };

if (require.main === module) {
  const res = run({ dry: process.argv.indexOf("--dry") >= 0 });
  console.log("gen_city_settlements: " + Object.keys(res).length + " settlements, three services each" + (process.argv.indexOf("--dry") >= 0 ? " (dry run)" : "; hidden copies written"));
}
