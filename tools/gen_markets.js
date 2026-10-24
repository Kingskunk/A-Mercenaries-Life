#!/usr/bin/env node
/*
 * gen_markets.js -- writes web/mygame/market-data.generated.js (window.MARKET_DEFS): one market definition per merchant, from tools/market_defs.json (the hand-written numbers) and the shop data
 * the trade panel already uses (web/mygame/trade-data.generated.js, itself generated from tools/gear_catalog.json). Every definition is checked with Market.validate.
 *
 * How a good's numbers are worked out (2026-10-24):
 *   base     the retail price; a counted good with no retail (a hide, an herb) uses what the merchant pays today divided by 0.5, so that a unit sells for exactly today's price at the usual stock
 *   buyPct   what the merchant pays today (trade.js unitPrice's formula, without the player's sell bonus) over the base, at most 0.8; a merchant that pays nothing for a good does not buy it
 *   buys     false when the merchant pays nothing for it;  sells  false when it is not on the merchant's shelf (not in its buy list)
 *   target   tools/market_defs.json kindDepth x priceTiers x the merchant's depthMult, never below minDepth (the standard depth of a good: how much of it the merchant wants to hold)
 *   stock0   the target (a merchant starts at its usual stock)
 *   fixed    a one-of-a-kind good: not stackable and not a counted salvage or ingredient (the shop rules already sell it once only); it never moves
 * Per-merchant overrides for a single good go in market_defs.json under merchants.<id>.goods.<item>.
 *
 * OPEN MARKETS AND COMMODITIES (2026-10-24, the user): a merchant with "commodities": true and a "tile" (a village lane, a town's trading ground) deals in every item tagged item.commodity in
 * tools/gear_catalog.json, each with the places that make it (makers: tile id -> "major" or "minor"). Nothing is listed per market: a new trade good is one tagged item, a new market one entry with
 * its tile. Everything below comes from the road MILES between the market's tile and each maker (web/mygame/overworld-data.js), with the numbers in market_defs.json "commodity":
 *   price level   the lowest, over the makers, of (cost at the source: major 0.8, minor 1.0) + perMile x miles, never above capLevel; it is the good's regional multiplier (mult) at this market
 *   supply        the sum over makers of (weight: major 1, minor 0.25) x 1 / (1 + miles / supplyHalf), so a maker's goods reach a market in smaller and smaller share the further away it is but never stop: the share of a usual shelf the market holds and restocks to
 *   supplied      supply >= minSupply: the shelf starts full at target = the standard depth x supply, and restocks. Otherwise the market makes nothing of it and nothing reaches it: it starts at 0 on the
 *                 shelf, never restocks, uses the little it is sold slowly (flow), and pays a shortage price for it
 *   buys          every commodity, at buyShare of the price (the market's own share)

 *
 * Run: node tools/gen_markets.js            (write, and print the report)
 *      node tools/gen_markets.js --check    (non-writing; exit 1 if the file is stale)
 */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "web", "mygame", "market-data.generated.js");
const M = require(path.join(ROOT, "web", "mygame", "market.js"));
const defs = JSON.parse(fs.readFileSync(path.join(__dirname, "market_defs.json"), "utf8"));

const OW = (require(path.join(ROOT, "web", "mygame", "overworld-data.js")), global.Overworld);
const CATALOG = JSON.parse(fs.readFileSync(path.join(__dirname, "gear_catalog.json"), "utf8"));
const CAT = {};
CATALOG.items.forEach((it) => { CAT[it.id] = it; });
const CP = defs.commodity;
function miles(a, b) { if (a === b) return 0; const r = OW.route(a, b); return r && r.ok ? r.miles : Infinity; }

const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(ROOT, "web", "mygame", "trade-data.generated.js"), "utf8"), sandbox);
const TRADE = sandbox.window.TRADE_DATA;

// what ONE unit fetches from this trade's buyer today (trade.js unitPrice, without the sell bonus)
function unitPrice(id, buyer, share) {
  const it = TRADE.items[id];
  if (!it) return 0;
  if (buyer === "market") return it.retail * (share || 0.8);   // not floored: the market rounds a whole line, not a unit (a 1 copper egg is worth 0.8)
  const sl = it.sell;
  const pct = buyer === "smith" ? sl.smith : (buyer === "general" ? sl.general : (buyer === "tailor" ? sl.tailor : (buyer === "jeweler" ? sl.jeweler : sl.pawn)));
  let v = Math.floor((it.retail * pct) / 100);
  if (buyer === "pawn" && sl.pawnFixed > 0) v = sl.pawnFixed;
  if (buyer === "smith" && sl.smithPiece > 0) v = sl.smithPiece;
  if (buyer === "herbalist") v = sl.herbalistPiece > 0 ? sl.herbalistPiece : 0;
  if (buyer === "game") v = sl.gamePiece > 0 ? sl.gamePiece : Math.floor((it.retail * sl.general) / 100);
  return v;
}
function tierMult(base) {
  for (const t of defs.priceTiers) if (base <= t.upTo) return t.mult;
  return 1;
}

const out = {}, report = [], problems = [], commodityReport = [];
Object.keys(defs.merchants).forEach((mid) => {
  const m = defs.merchants[mid], tr = TRADE.trades[mid];
  if (!tr) { problems.push(mid + ": no such trade in trade-data"); return; }
  const ids = Array.from(new Set([].concat(tr.buy || [], tr.sell || [])));
  const goods = {};
  ids.forEach((id) => {
    const it = TRADE.items[id];
    if (!it) { problems.push(mid + "/" + id + ": no such item"); return; }
    const sells = (tr.buy || []).indexOf(id) >= 0;
    const unit = (tr.sell || []).indexOf(id) >= 0 ? unitPrice(id, tr.buyer, m.buyShare) : 0;
    const base = it.retail > 0 ? it.retail : Math.max(1, unit * 2);
    const counted = it.kind === "salvage" || it.kind === "ingredient";
    const fixed = it.stack === false && !counted && (defs.ordinary || []).indexOf(id) < 0;
    let target = Math.round((defs.kindDepth[it.kind] || 6) * tierMult(base) * (m.depthMult || 1));
    target = Math.max(defs.minDepth, target);
    const g = { base: base, target: fixed ? 1 : target, stock0: fixed ? (sells ? 1 : 0) : target, buyPct: 0.5, mult: defs.defaults.mult };
    if (unit > 0) g.buyPct = Math.min(M.MAX_BUY_PCT, Math.round((unit / base) * 1000) / 1000);
    if (unit <= 0) g.buys = false;
    if (!sells) g.sells = false;
    if (fixed) g.fixed = true;
    if (m.commodities && CAT[id] && CAT[id].commodity) {
      const mk = CAT[id].commodity.makers, bt = target;
      let supply = 0, level = CP.capLevel;
      Object.keys(mk).forEach((tile) => {
        if (!OW.nodes[tile]) problems.push(id + ": maker tile " + tile + " is not on the map");
        const d = miles(m.tile, tile);
        supply += CP.weight[mk[tile]] / (1 + d / CP.supplyHalf);
        level = Math.min(level, CP.cost[mk[tile]] + CP.perMile * d);
      });
      const supplied = supply >= CP.minSupply;
      const t2 = Math.max(defs.minDepth, Math.round(bt * (supplied ? supply : CP.unsuppliedShare)));
      delete g.buys; delete g.sells;
      g.mult = Math.round(level * 1000) / 1000; g.target = t2; g.stock0 = supplied ? t2 : 0; g.buyPct = Math.min(M.MAX_BUY_PCT, m.buyShare || 0.8);
      if (!supplied) { g.restock = false; g.flow = -Math.round(t2 * CP.useRate * 100) / 100; }
      commodityReport.push({ mid: mid, id: id, level: g.mult, supply: Math.round(supply * 100) / 100, target: t2, supplied: supplied });
    }
    const over = (m.goods && m.goods[id]) || {};
    Object.keys(over).forEach((k) => { g[k] = over[k]; });
    goods[id] = g;
    if (unit > 0 && !fixed && !m.commodities) report.push({ mid: mid, id: id, unit: unit, firstNow: Math.floor(base * M.factor(g.target + 1, g.target) * g.buyPct * (g.mult || 1) + 1e-9), target: g.target });
  });
  const def = { id: mid, title: tr.title, tier: m.tier, purseTarget: m.purse, regen: m.regen || defs.defaults.regen, goods: goods };
  if (m.commodities) def.commodities = true;
  const errs = M.validate(def);
  if (errs.length) problems.push(mid + ": " + errs.join("; "));
  out[mid] = def;
});

const body = "/*\n * GENERATED by tools/gen_markets.js from tools/market_defs.json and web/mygame/trade-data.generated.js -- edit those, not this file.\n * One market definition per merchant (see web/mygame/market.js for what the numbers mean).\n */\nwindow.MARKET_DEFS = " + JSON.stringify(out, null, 1) + ";\n";

if (problems.length) { console.error("gen_markets: problems:\n  " + problems.join("\n  ")); process.exit(1); }
if (process.argv.indexOf("--check") >= 0) {
  const have = fs.existsSync(OUT) ? fs.readFileSync(OUT, "utf8") : "";
  if (have.replace(/\r\n/g, "\n") !== body) { console.error("gen_markets: market-data.generated.js is stale. Run: node tools/gen_markets.js"); process.exit(1); }
  console.log("gen_markets: up to date (" + Object.keys(out).length + " markets).");
  process.exit(0);
}
fs.writeFileSync(OUT, body);
commodityReport.forEach((r) => { if (process.argv.indexOf("--commodities") >= 0) console.log("  " + (r.mid + "/" + r.id).padEnd(34) + "level " + String(r.level).padEnd(6) + "supply " + String(r.supply).padEnd(6) + (r.supplied ? "shelf " + r.target : "none (shortage)")); });
const goodsN = Object.keys(out).reduce((n, k) => n + Object.keys(out[k].goods).length, 0);
console.log("gen_markets: wrote " + path.relative(ROOT, OUT) + " (" + Object.keys(out).length + " markets, " + goodsN + " goods)");
// the cost of the model: the first unit a merchant buys pays a little under today's price (the payout is priced at the stock AFTER the unit arrives)
const worst = report.map((r) => ({ r: r, d: 1 - (r.firstNow / r.unit) })).filter((x) => x.r.unit >= 5).sort((a, b) => b.d - a.d).slice(0, 8);
console.log("largest drop in what the FIRST unit fetches, against today's price (goods paying 5 copper or more):");
worst.forEach((x) => console.log("  " + (x.r.mid + "/" + x.r.id).padEnd(34) + "today " + String(x.r.unit).padEnd(6) + "first unit " + String(x.r.firstNow).padEnd(6) + "(-" + Math.round(x.d * 100) + "%, depth " + x.r.target + ")"));
