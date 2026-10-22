#!/usr/bin/env node
/*
 * gen_city_places.js -- the sidebar's "Go to..." list of known places (web/mygame/citytravel.js), made by driving the game's own menus.
 *
 * THE IDEA (2026-10-22, the user's call). The list does not teleport the player and does not copy any shop's hours or walking costs. To go to Vael's, the sidebar walks to the district (the existing walk option),
 * then presses, on each page along the way, a HIDDEN COPY of the real option the player would have clicked: "Locksmiths' Close", then "Step into Vael & Son". The copy sits at the end of the same menu, inside
 * the same *if / *elseif / *else guards as the original, and has the original's exact body, so a shut shop, a closed hour, a quest redirect or a first-visit page all behave as they do by hand, the
 * time is charged by the real pages (one advance_time per page, never two on one page), and a route that cannot be taken simply has no hidden option to press (the sidebar then says so).
 *
 * WHAT THIS SCRIPT DOES, on every run (compile.js runs it):
 *   1. Removes every earlier generated block ("GEN:BEGIN place_steps ...") from the scene files named in the registry.
 *   2. For each distinct step (scene file, page label, target label) in the registry, finds the real option(s) on that page whose last statement is "*goto <target>" (or "*goto_scene <scene> <target>"),
 *      works out the guards around each, and writes a hidden copy at the end of that option's *choice: "# ⇥ [pvgo:<page>:<target>]" with the same guards and body. It throws if a step matches nothing.
 *   3. Writes the places (name, district, kind, seen flag, steps, extra minutes, gate) into city-data.generated.js (through gen_city_data.js), so the card shows only places the player has been to.
 * Edit the registry below, not the generated blocks. A copy is regenerated from its original every run, so editing the original option keeps the copy in step.
 *
 * KINDS (the card's filter chips): shops, food (Food & rest), healing, work, services.
 * EXTRA is the walking time a route adds beyond the district walk, measured by tools/check_city_places.js against the real pages; the card adds the district leg.
 */
"use strict";
const fs = require("fs"), path = require("path");

const SCENES = path.join(__dirname, "..", "web", "mygame", "scenes");
const MARK = "⇥";   // ⇥, a hidden step option's label starts with it

// The registry. steps: [page, target] pairs along the route, after the district walk; file: the scene file (relative to scenes/) that holds the page.
const P = {
  harbor: "port_valen/port_valen.txt", compound: "port_valen/port_valen.txt", civic_heights: "port_valen/port_valen_civic_heights.txt", upper_wharves: "port_valen/port_valen_upper_wharves.txt",
  dredge_end: "port_valen/port_valen_dredge_end.txt", middle_ward: "port_valen/port_valen_middle_ward.txt"
};
const HUB = { harbor: "port_valen_harbor_pois", compound: "port_valen_hub", civic_heights: "port_valen_civic_heights", upper_wharves: "pq_avenue", dredge_end: "port_valen_dredge_end", middle_ward: "mw_conduit_square" };
function place(id, name, district, kind, seen, steps, extra) {
  return { id: id, name: name, district: district, kind: kind, seen: seen, file: P[district], steps: steps, extra: extra || 0, gate: district === "upper_wharves" ? "writ" : "" };
}
const PLACES = {
  port_valen: [
    // Harbor Quayside
    place("cleaved_keel", "The Cleaved Keel", "harbor", "food", "pv_tavern_seen", [[HUB.harbor, "pv_poi_tavern"]]),
    place("fish_slip", "Fishmongers' Slip", "harbor", "shops", "pv_slip_seen", [[HUB.harbor, "pv_poi_fish_slip"]]),
    place("weigh_house", "The Weigh House", "harbor", "services", "wh_named", [[HUB.harbor, "pv_wh_door"]]),
    place("cargo_quay", "Cargo Quay", "harbor", "work", "pv_quays_seen", [[HUB.harbor, "pv_poi_quays"]]),
    // The Carrion Compound
    place("armory", "The Armory Shed", "compound", "services", "port_valen_hub_seen", [[HUB.compound, "pv_poi_armory"]]),
    place("drill_square", "The Drill Square", "compound", "services", "port_valen_hub_seen", [[HUB.compound, "pv_poi_carrion"]]),
    // Civic Heights
    place("hiring_hall", "The Hiring Hall", "civic_heights", "work", "ch_records_seen", [[HUB.civic_heights, "pv_ch_hall_door"], ["pv_ch_hall_inside", "pv_ch_records_inside"]]),
    place("head_house", "The Gilded Scales Head House", "civic_heights", "services", "ch_head_named", [[HUB.civic_heights, "pv_ch_head_door"]]),
    place("watch_yard", "The Watch Yard", "civic_heights", "services", "pw_seen", [[HUB.civic_heights, "pv_ch_watch"]]),
    place("deacon_vey", "The Cathedral: Deacon Vey", "civic_heights", "healing", "cath_seen", [[HUB.civic_heights, "pv_ch_cath"], ["pv_ch_cath_menu", "pv_ch_cath_hall"], ["pv_ch_cath_hall_menu", "pv_ch_cath_vey"]]),
    // The Patrician Quarter (a writ)
    place("gilt_needle", "The Gilt Needle", "upper_wharves", "shops", "pq_tailor_seen", [[HUB.upper_wharves, "pq_tailor"]]),
    place("ink_and_lamp", "The Ink & Lamp", "upper_wharves", "shops", "pq_ink_lamp_seen", [[HUB.upper_wharves, "pq_ink_lamp"]]),
    place("bright_setting", "The Bright Setting", "upper_wharves", "shops", "pq_bright_setting_seen", [[HUB.upper_wharves, "pq_bright_setting"]]),
    // Dredge-End
    place("duckboard_market", "Duckboard Market", "dredge_end", "shops", "cut_seen_market", [[HUB.dredge_end, "cut_market"]]),
    place("boat_sheds", "Boat-Sheds and Scrap Yard", "dredge_end", "shops", "cut_seen_sheds", [[HUB.dredge_end, "cut_sheds"]]),
    place("dredge_landing", "Dredge Landing", "dredge_end", "work", "cut_seen_landing", [[HUB.dredge_end, "cut_landing"]]),
    place("alley_shrine", "The Alley Shrine", "dredge_end", "healing", "cut_seen_shrine", [[HUB.dredge_end, "cut_shrine"]]),
    // Lamp Stair, where the Hedge-Doctor works: his own option is the treatment (it pays and heals at once), so the list takes the player to the street and leaves the choice to them
    place("hedge_doctor", "Lamp Stair: the Hedge-Doctor", "dredge_end", "healing", "cut_seen_lamp_stair", [[HUB.dredge_end, "cut_lamp"]]),
    place("pawnbroker", "The Pawnbroker's Window", "dredge_end", "shops", "cut_seen_lamp_stair", [[HUB.dredge_end, "cut_lamp"], ["cut_lamp_hub", "cut_pawn"]]),
    place("drinking_house", "The Drinking House", "dredge_end", "food", "cut_seen_lamp_stair", [[HUB.dredge_end, "cut_lamp"], ["cut_lamp_hub", "cut_drink"]]),
    place("widow_corve", "Widow Corve's", "dredge_end", "services", "cut_seen_lamp_stair", [[HUB.dredge_end, "cut_lamp"], ["cut_lamp_hub", "cut_corve"]]),
    // The Middle Ward
    place("vael_and_son", "Vael & Son", "middle_ward", "shops", "mw_vael_seen", [[HUB.middle_ward, "mw_locksmiths_close"], ["mw_locksmiths_close", "mw_vael_shop"]]),
    place("conduit_baths", "The Conduit Baths", "middle_ward", "services", "mw_baths_seen", [[HUB.middle_ward, "mw_locksmiths_close"], ["mw_locksmiths_close", "mw_wash_yard"], ["mw_wash_yard", "mw_baths_inside"]]),
    place("terrace_lodgings", "Terrace Lodgings", "middle_ward", "food", "mw_lodgings_seen", [[HUB.middle_ward, "mw_locksmiths_close"], ["mw_locksmiths_close", "mw_lodgings_entry"]]),
    place("wagoners_rest", "The Wagoner's Rest", "middle_ward", "food", "mw_inn_seen", [[HUB.middle_ward, "mw_gate_road"], ["mw_gate_road", "mw_inn_hall"]]),
    place("bakehouse", "Mother Marda's Bakehouse", "middle_ward", "food", "mw_bakehouse_seen", [[HUB.middle_ward, "mw_bakehouse_walk"]]),
    place("hollis_store", "Hollis & Daughters", "middle_ward", "shops", "mw_store_seen", [[HUB.middle_ward, "mw_lantern_lane"], ["mw_lantern_lane", "mw_hollis_store"]]),
    place("ambrose_stillroom", "Ambrose's Still-Room", "middle_ward", "shops", "mw_herb_seen", [[HUB.middle_ward, "mw_lantern_lane"], ["mw_lantern_lane", "mw_herb_close"]]),
    place("halda_forge", "Halda's Forge", "middle_ward", "shops", "mw_forge_seen", [[HUB.middle_ward, "mw_gate_road"], ["mw_gate_road", "mw_smiths_row"], ["mw_smiths_row", "mw_smiths_forge"]])
  ]
};

const ind = s => s.match(/^ */)[0].length;
function key(page, target) { return page + ":" + target; }
function label(page, target) { return MARK + " [pvgo:" + key(page, target) + "]"; }

// Removes every earlier generated place_steps block from the text lines.
function stripBlocks(L) {
  const out = []; let skipping = false;
  for (let i = 0; i < L.length; i++) {
    const t = L[i].trim();
    if (/^\*comment GEN:BEGIN place_steps\b/.test(t)) { skipping = true; continue; }
    if (skipping) { if (/^\*comment GEN:END place_steps\b/.test(t)) skipping = false; continue; }
    out.push(L[i]);
  }
  return out;
}

// Parses the *choice blocks of one label region and returns, for each option, its guards (the *if / *elseif / *else branches around it) and its block.
function optionsOf(L, pageLabel, file) {
  const li = L.findIndex(l => l.trim() === "*label " + pageLabel);
  if (li < 0) throw new Error(file + ": no label " + pageLabel);
  let end = L.length; for (let q = li + 1; q < L.length; q++) if (/^\*label /.test(L[q])) { end = q; break; }
  const found = [];
  for (let k = li; k < end; k++) {
    if (!/^\s*\*choice\b/.test(L[k])) continue;
    const ci = ind(L[k]);
    let last = k, j = k + 1;
    const stack = [];   // if-groups: {indent, branches: [{type, expr}]}
    const opts = [];
    for (; j < end && (L[j].trim() === "" || ind(L[j]) > ci); j++) {
      const t = L[j].trim(); if (t === "") continue;
      last = j;
      if (/^\*comment/.test(t)) continue;
      const i = ind(L[j]);
      let m;
      if ((m = /^\*if\s+(.*)$/.exec(t))) { while (stack.length && stack[stack.length - 1].indent >= i) stack.pop(); stack.push({ indent: i, branches: [{ type: "if", expr: m[1] }] }); continue; }
      if ((m = /^\*elseif\s+(.*)$/.exec(t))) { while (stack.length && stack[stack.length - 1].indent > i) stack.pop(); const g = stack[stack.length - 1]; if (g && g.indent === i) g.branches.push({ type: "elseif", expr: m[1] }); continue; }
      if (/^\*else\s*$/.test(t)) { while (stack.length && stack[stack.length - 1].indent > i) stack.pop(); const g = stack[stack.length - 1]; if (g && g.indent === i) g.branches.push({ type: "else", expr: "" }); continue; }
      while (stack.length && stack[stack.length - 1].indent >= i) stack.pop();
      if (/^# /.test(t)) {
        // the option's block: this line and the deeper lines after it
        let e = j + 1; while (e < end && (L[e].trim() === "" || ind(L[e]) > i)) e++;
        const body = L.slice(j + 1, e);
        const guards = [];
        stack.forEach(g => {
          const cur = g.branches.length - 1;
          for (let b = 0; b < cur; b++) if (g.branches[b].type !== "else") guards.push("not(" + g.branches[b].expr + ")");
          if (g.branches[cur].type !== "else") guards.push(g.branches[cur].expr);
        });
        // the option's last statement at its own depth must be a *goto
        const kids = body.filter(x => x.trim() !== "" && !/^\s*\*comment/.test(x) && ind(x) === i + 2);
        const lastKid = kids.length ? kids[kids.length - 1].trim() : "";
        let target = "";
        let gm = /^\*goto\s+(\S+)\s*$/.exec(lastKid); if (gm) target = gm[1];
        gm = /^\*goto_scene\s+(\S+)\s+(\S+)\s*$/.exec(lastKid); if (gm) target = gm[2];
        opts.push({ line: j, indent: i, header: t, body: body.filter((x, n) => n < body.length), end: e, target: target, guards: guards });
      }
    }
    found.push({ choiceLine: k, endLine: last, indent: ci, opts: opts });
  }
  return found;
}

// Builds the text lines of one hidden copy.
function cloneLines(opt, page, target, base) {
  const out = []; let pad = base;
  opt.guards.forEach(g => {
    // a negated or positive expression: keep the original's own text; a bare "(x)" or "x and y" works after *if
    out.push(" ".repeat(pad) + "*if " + (/^not\(/.test(g) ? "(" + g + ")" : g));
    pad += 2;
  });
  out.push(" ".repeat(pad) + "# " + label(page, target));
  const shift = pad + 2 - (opt.indent + 2);
  opt.body.forEach(b => { if (b.trim() === "") return; out.push(" ".repeat(Math.max(0, ind(b) + shift)) + b.trim()); });
  return out;
}

// Rewrites one scene file: strips old blocks, then appends the hidden copies at the end of the right *choice blocks. Returns {step key -> count of copies made}.
function applyFile(file, steps, dry) {
  const p = path.join(SCENES, file);
  const raw = fs.readFileSync(p, "utf8"), crlf = raw.includes("\r\n");
  let L = stripBlocks(raw.replace(/\r\n/g, "\n").split("\n"));
  // gather the insertions (choiceEndLine -> lines), keyed by file position, then insert bottom-up
  const ins = {}; const counts = {};
  steps.forEach(st => {
    const page = st[0], target = st[1], k = key(page, target);
    const blocks = optionsOf(L, page, file);
    let n = 0;
    blocks.forEach(b => {
      const hits = b.opts.filter(o => o.target === target && !/^# ⇥/.test(o.header));
      hits.forEach(o => {
        const lines = cloneLines(o, page, target, b.indent + 2);
        (ins[b.endLine] = ins[b.endLine] || []).push({ k: k, page: page, lines: lines });
        n++;
      });
    });
    counts[k] = n;
    if (n === 0) throw new Error(file + ": no option on page " + page + " ends in a goto to " + target);
  });
  Object.keys(ins).map(Number).sort((a, b) => b - a).forEach(endLine => {
    const groups = ins[endLine];
    const pad = " ".repeat(ind(L[endLine]) > 0 ? Math.min(ind(L[endLine]), 4) : 2);
    const block = ["*comment GEN:BEGIN place_steps " + groups.map(g => g.k).join(" ") + " -- generated by tools/gen_city_places.js from its registry; edit the registry, not this block"];
    groups.forEach(g => g.lines.forEach(l => block.push(l)));
    block.push("*comment GEN:END place_steps " + groups.map(g => g.k).join(" "));
    // indent the markers like the choice's options
    const choiceIndent = (() => { for (let q = endLine; q >= 0; q--) if (/^\s*\*choice\b/.test(L[q])) return ind(L[q]); return 0; })();
    const fixed = block.map((l, n) => (n === 0 || n === block.length - 1) ? " ".repeat(choiceIndent + 2) + l : l);
    L.splice(endLine + 1, 0, ...fixed);
  });
  const out = L.join("\n");
  if (!dry) fs.writeFileSync(p, crlf ? out.replace(/\n/g, "\r\n") : out);
  return counts;
}

// All steps of the registry grouped by file.
function stepsByFile(city) {
  const by = {};
  (PLACES[city] || []).forEach(pl => pl.steps.forEach(st => { const f = pl.file; (by[f] = by[f] || []); if (!by[f].some(x => x[0] === st[0] && x[1] === st[1])) by[f].push(st); }));
  return by;
}

// Entry point used by gen_city_data.js and compile.js: edits the scene files and returns the places for the published data.
function run(city, opts) {
  opts = opts || {};
  const by = stepsByFile(city);
  const total = {};
  Object.keys(by).forEach(f => {
    // place steps live in several files only when the district's pages do; the file of a step is the file of its place, except a place's later steps, which are in the same file by construction
    Object.assign(total, applyFile(f, by[f], !!opts.dry));
  });
  // the minutes each route adds beyond the district walk, measured against the real pages by tools/check_city_places.js --write
  let measured = {}; try { measured = JSON.parse(fs.readFileSync(path.join(__dirname, "city_places_extra.json"), "utf8")); } catch (e) { /* not measured yet */ }
  return (PLACES[city] || []).map(pl => ({
    id: pl.id, name: pl.name, district: pl.district, kind: pl.kind, seen: pl.seen, gate: pl.gate, extra: measured[pl.id] !== undefined ? [].concat(measured[pl.id]).reduce((a, b) => a + b, 0) : pl.extra, stepMin: measured[pl.id] !== undefined ? [].concat(measured[pl.id]) : [pl.extra],
    steps: pl.steps.map(st => key(st[0], st[1]))
  }));
}

module.exports = { run: run, PLACES: PLACES, MARK: MARK, label: label, key: key, ind: ind, stripBlocks: stripBlocks, optionsOf: optionsOf, cloneLines: cloneLines, SCENES: SCENES };

if (require.main === module) {
  const res = run("port_valen", { dry: process.argv.indexOf("--dry") >= 0 });
  console.log("gen_city_places: " + res.length + " places, steps checked against the real options" + (process.argv.indexOf("--dry") >= 0 ? " (dry run)" : "; hidden copies written"));
}
