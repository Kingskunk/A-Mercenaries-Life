#!/usr/bin/env node
/*
 * gen_world.js -- writes web/mygame/world-data.generated.js (window.WORLD_DATA): the numbers web/mygame/world.js runs on, from tools/gear_catalog.json (each commodity's makers, seasons and inputs),
 * the overworld map (road miles between settlements) and tools/market_defs.json ("settlements": populations; "demand": what a thousand people use of a good in a day; "industry": what a
 * settlement's trades eat; "dseason": demand's seasons; "world": the model's parameters).
 *
 * For every commodity (an item with commodity.makers) it works out
 *   (a settlement draws only on makers within the good's reach, the catalog's commodity.reach in road miles; one with no maker in reach is left out and the market there does not stock the good)
 *   consumers   every settlement: its normal demand D (units a day: population / 1000 x the good's use, plus industry, never below minDemand), its pull (population ^ pullExp), and for each maker
 *               the settlement draws on its SHARE s (the maker's reach weight, tier weight / (1 + miles / supplyHalf), over the sum for that settlement) and the miles
 *   store       the good's STOCKPILE time constant in days (the catalog's commodity.store): web/mygame/world.js smooths a maker's output over it (a granary, a salt shed, a timber stack)
 *   makers      each maker's CAPACITY, units a day, never below coverFloor x what the settlements drawing on it want of it, and otherwise: margin x (the total demand of every settlement that can reach a maker) x (tier weight x population ^ capExp) over the sum of that for the good's makers
 * Nothing here is random. Run via node tools/gen_markets.js (which calls this), or alone: node tools/gen_world.js [--check]
 */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "web", "mygame", "world-data.generated.js");

function build() {
  const defs = JSON.parse(fs.readFileSync(path.join(__dirname, "market_defs.json"), "utf8"));
  const CAT = {}; JSON.parse(fs.readFileSync(path.join(__dirname, "gear_catalog.json"), "utf8")).items.forEach((it) => { CAT[it.id] = it; });
  require(path.join(ROOT, "web", "mygame", "overworld-data.js"));
  const OW = global.Overworld;
  const P = defs.world, CP = defs.commodity, S = {};
  Object.keys(defs.settlements).forEach((k) => { if (k[0] !== "_") S[k] = defs.settlements[k]; });
  const miles = (a, b) => { if (a === b) return 0; const r = OW.route(a, b); return r && r.ok ? r.miles : Infinity; };
  const r4 = (v) => Math.round(v * 10000) / 10000;
  const data = { params: { margin: P.margin, pullExp: P.pullExp, capExp: P.capExp }, tiles: {}, goods: {} };
  const report = [], problems = [];
  Object.keys(S).forEach((t) => { if (!OW.nodes[t]) problems.push("settlement " + t + " is not on the map"); data.tiles[t] = { name: S[t].name, anon: S[t].anon || "a settlement", pop: S[t].pop, pull: r4(Math.pow(S[t].pop / 1000, P.pullExp)) }; });
  Object.keys(CAT).forEach((id) => {
    const it = CAT[id]; if (!it.commodity) return;
    const mk = it.commodity.makers, makerTiles = Object.keys(mk);
    const G = { id: id, season: it.commodity.season || [1, 1, 1, 1], dseason: defs.dseason[id] || [1, 1, 1, 1], makers: [], consumers: [] };
    if (it.commodity.inputs) G.inputs = it.commodity.inputs;
    if (it.commodity.store) G.store = it.commodity.store;
    makerTiles.forEach((t) => { if (!S[t]) problems.push(id + ": maker tile " + t + " has no settlement entry"); });
    // consumers
    Object.keys(S).forEach((t) => {
      const per = (defs.demand[id] || 0) * S[t].pop / 1000, ind = (defs.industry[t] && defs.industry[t][id]) || 0;
      const D = Math.max(P.minDemand, per + ind);
      const w = {}, d = {}; let sw = 0;
      makerTiles.forEach((m) => { const mi = miles(t, m); if (!isFinite(mi) || mi > (it.commodity.reach || Infinity)) return; d[m] = Math.round(mi * 10) / 10; w[m] = CP.weight[mk[m]] / (1 + mi / CP.supplyHalf); sw += w[m]; });
      if (sw <= 0) return;
      const s = {}; Object.keys(w).forEach((m) => { s[m] = r4(w[m] / sw); });
      G.consumers.push({ tile: t, D: Math.round(D * 100) / 100, pull: data.tiles[t].pull, s: s, miles: d });
    });
    // capacities
    const Dtot = G.consumers.reduce((a, c) => a + c.D, 0);
    const cw = makerTiles.map((m) => CP.weight[mk[m]] * Math.pow(S[m] ? S[m].pop : 100, P.capExp)), cws = cw.reduce((a, b) => a + b, 0);
    makerTiles.forEach((m, i) => {
      // never less than coverFloor x what the settlements that draw on this maker want of it, so a settlement whose only maker in reach is a small one is not starved for ever
      const cover = G.consumers.reduce((a, c) => a + (c.s[m] ? c.D * c.s[m] : 0), 0);
      G.makers.push({ tile: m, tier: mk[m], cap: Math.round(Math.max(P.margin * Dtot * cw[i] / cws, P.coverFloor * cover) * 100) / 100 });
    });
    data.goods[id] = G;
  });
  // long named events (market_defs.json "events"): copied as they are, after a check that every tile and good they name exists and that a length stays within 30 to 90 days
  const EV = defs.events, evKinds = EV.kinds.concat(EV.regional);
  evKinds.forEach((k) => {
    k.tiles.forEach((t) => { if (t !== "*" && !S[t]) problems.push("event " + k.id + ": tile " + t + " is not a settlement"); });
    k.effects.forEach((e) => e.goods.forEach((g) => { if (!CAT[g] || !CAT[g].commodity) problems.push("event " + k.id + ": " + g + " is not a commodity"); }));
    if (!(k.days[0] >= 30 && k.days[1] <= 90 && k.days[0] <= k.days[1])) problems.push("event " + k.id + ": days must lie within 30 to 90");
    k.effects.forEach((e) => { if (!(e.mag[0] > 0 && e.mag[0] <= e.mag[1])) problems.push("event " + k.id + ": bad magnitude range"); });
  });
  data.events = { spacing: EV.spacing, regionalSpacing: EV.regionalSpacing, envelope: EV.envelope, kinds: evKinds };
  return { data, report, problems, defs };
}

function body(data) {
  return "/*\n * GENERATED by tools/gen_world.js from tools/market_defs.json, tools/gear_catalog.json and the overworld map -- edit those, not this file.\n * The numbers web/mygame/world.js runs on: settlement populations, each commodity's makers (capacity) and consumers (demand, pull, draw shares).\n */\nwindow.WORLD_DATA = " + JSON.stringify(data) + ";\n";
}

if (require.main === module) {
  const b = build();
  if (b.problems.length) { console.error("gen_world: problems:\n  " + b.problems.join("\n  ")); process.exit(1); }
  const text = body(b.data);
  if (process.argv.indexOf("--check") >= 0) {
    const have = fs.existsSync(OUT) ? fs.readFileSync(OUT, "utf8").replace(/\r\n/g, "\n") : "";
    if (have !== text) { console.error("gen_world: world-data.generated.js is stale. Run: node tools/gen_world.js"); process.exit(1); }
    console.log("gen_world: up to date (" + Object.keys(b.data.goods).length + " goods, " + Object.keys(b.data.tiles).length + " settlements).");
  } else {
    fs.writeFileSync(OUT, text);
    console.log("gen_world: wrote " + path.relative(ROOT, OUT) + " (" + Object.keys(b.data.goods).length + " goods, " + Object.keys(b.data.tiles).length + " settlements)");
  }
}
module.exports = { build, body, OUT };
