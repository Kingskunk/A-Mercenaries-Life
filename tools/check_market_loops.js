#!/usr/bin/env node
/*
 * check_market_loops.js -- proves the market rules in web/mygame/market.js cannot be farmed (2026-10-24, the user's trade-economy design).
 *
 * It runs the pure market module (no game, no browser) against a set of invented markets and checks, by sweeping the numbers:
 *   1. the price curve and the stat string behave (unit checks);
 *   2. a round trip at ONE market (buy k, sell the same k back at once) never makes money, for every depth, stock level, buy-back share and quantity;
 *   3. a barter cart needs the purse to cover only the net payout, and a short purse refuses the cart;
 *   4. coin is conserved: the player's coin plus every purse is the same after any run of trades, and the only coin that ever enters is the purse refilling with time;
 *   5. between TWO markets (a producer and a consumer) a greedy trader runs out of profit within a finite number of trips at one moment (the gap closes), and nothing goes negative;
 *   6. with days passing between trips the profit per day settles (it does not grow), so there is a bounded income, not a printing press;
 *   7. goods the player sold stay on the shelf for the buy-back period, and a restock does not remove them;
 *   8. a fixed (one-of-a-kind) good keeps its price whatever is done;
 *   9. the REAL merchants (web/mygame/market-data.generated.js): every definition is sound, each merchant asks exactly today's price at its usual stock, a round trip at each loses money,
 *      no merchant can be bought from and sold to at a profit, and thousands of random buy/sell/travel sequences across all the merchants never end in profit once the goods are sold off.
 * It also prints the steady income per day of the best two-market route, so the numbers can be tuned by eye.
 *
 * Run: node tools/check_market_loops.js        (exit code 1 on any failure)
 */
"use strict";
const path = require("path");
const fs = require("fs");
const vm = require("vm");
const M = require(path.join(__dirname, "..", "web", "mygame", "market.js"));
const CR = require("./commodity_range");
const Freight = require("./freight_routes");

let fails = 0, checks = 0;
function ok(cond, msg) { checks++; if (!cond) { fails++; console.log("FAIL: " + msg); } }
function section(name) { console.log("\n-- " + name); }

function makeDef(over) {
  const def = {
    id: "test", purseTarget: 600, regen: { stock: 0.1, purse: 0.1 },
    goods: { salt: { target: 40, buyPct: 0.5 } }
  };
  return Object.assign(def, over || {});
}

// ---------------------------------------------------------------- 1. unit checks
section("price curve and stat string");
ok(Math.abs(M.factor(40, 40) - 1) < 1e-9, "factor at target is 1");
ok(M.factor(0, 40) === M.MAX_F, "factor at empty is the ceiling");
ok(Math.abs(M.factor(80, 40) - M.MIN_F) < 1e-9, "factor at double stock is the knee value");
ok(M.factor(160, 40) < M.MIN_F && M.factor(160, 40) >= M.FLOOR_F && M.factor(100000, 40) === M.FLOOR_F, "past the knee it keeps falling, to a floor, and never refuses");
ok(M.factor(20, 40) === 1 && M.factor(40, 40) === 1 && M.factor(60, 40) === 1, "the price is flat from half to one and a half times the target");
  ok(M.factor(10, 40) > 1 && M.factor(70, 40) < 1 && M.factor(10, 40) > M.factor(19, 40), "it climbs below the flat zone and falls above it");
  let mono = true; for (let sx = 0; sx < 200; sx++) if (M.factor(sx + 1, 40) > M.factor(sx, 40) + 1e-12) mono = false;
  ok(mono, "the factor never rises with stock");
ok(M.validate(makeDef()).length === 0, "a sound definition validates");
ok(M.validate(makeDef({ goods: { a: { target: 0 } } })).length > 0, "a target of 0 is refused");
ok(M.validate(makeDef({ goods: { a: { target: 5, buyPct: 0.95 } } })).length > 0, "a buy-back share above the limit is refused");
{
  const def = makeDef({ goods: { salt: { target: 40 }, hides: { target: 12, stock0: 3 } } });
  let st = M.init(def, 10);
  const q = M.quote(st, def, { sell: { hides: 4 } }, { salt: 4, hides: 20 });
  st = M.commit(st, def, q, 10);
  const back = M.parse(M.serialize(st));
  ok(M.serialize(back) === M.serialize(st) && back.purse === st.purse && back.day === st.day, "the stat string round-trips");
  ok(M.serialize(st).indexOf("hides:7") >= 0 && /r=hides:4@24/.test(M.serialize(st)), "the stat string holds the stock and the buy-back hold");
}

// ---------------------------------------------------------------- 2. round trips at one market never pay
section("round trips at one market");
{
  let worst = -Infinity, cases = 0, worstDesc = "";
  [2, 4, 8, 16, 40, 100].forEach((T) => [0, 0.5, 1, 1.5, 2].forEach((m) => [0.3, 0.5, 0.7, 0.8].forEach((pct) => [1, 3, 10, 100, 1000].forEach((base) => {
    const def = makeDef({ purseTarget: 1e9, goods: { x: { target: T, buyPct: pct } } });
    const S0 = Math.round(T * m), st0 = Object.assign(M.init(def, 0), {});
    st0.stock.x = S0;
    for (let k = 1; k <= Math.min(S0, 60); k++) {
      const buy = M.quote(st0, def, { buy: { x: k } }, { x: base });
      if (!buy.ok) continue;
      const st1 = M.commit(st0, def, buy, 0);
      const sell = M.quote(st1, def, { sell: { x: k } }, { x: base });
      if (!sell.ok) continue;
      const profit = sell.sellTotal - buy.buyTotal;
      cases++;
      if (profit > worst) { worst = profit; worstDesc = "T=" + T + " S0=" + S0 + " pct=" + pct + " base=" + base + " k=" + k; }
    }
  }))));
  ok(worst <= 0, "a round trip at one market lost money in all " + cases + " cases (best result " + worst + " copper at " + worstDesc + ")");
}

// ---------------------------------------------------------------- 3. barter and the purse
section("barter and the purse");
{
  const def = makeDef({ purseTarget: 50, goods: { salt: { target: 40 }, shovel: { target: 4, stock0: 4 } } });
  const st = M.init(def, 0);
  const base = { salt: 10, shovel: 30 };
  const solo = M.quote(st, def, { sell: { salt: 30 } }, base);
  ok(!solo.ok && /purse is short/.test(solo.problems.join()), "selling past the purse is refused (" + solo.sellTotal + " owed, purse 50)");
  const swap = M.quote(st, def, { sell: { salt: 30 }, buy: { shovel: 2 } }, base);
  ok(swap.net === swap.sellTotal - swap.buyTotal, "the net payout is sales less purchases");
  ok(swap.ok === (swap.net <= 50), "a swap needs the purse to cover only the net (" + swap.net + " of 50)");
  const both = M.quote(st, def, { sell: { salt: 2 }, buy: { salt: 2 } }, base);
  ok(!both.ok && /bought and sold/.test(both.problems.join()), "one good cannot be bought and sold in one cart");
  const over = M.quote(st, def, { buy: { shovel: 9 } }, base);
  ok(!over.ok && /only 4 on the shelf/.test(over.problems.join()), "buying more than the shelf holds is refused");
  const cap = M.quote(M.init(makeDef({ purseTarget: 1e6 }), 0), makeDef({ purseTarget: 1e6 }), { sell: { salt: 200 } }, { salt: 10 });
  ok(cap.ok && cap.sell[0].qty === 200 && cap.sell[0].last >= 10 * 0.5 * M.FLOOR_F - 1e-9, "nothing caps what a merchant takes: 200 into a target of 20 are taken at a falling price (" + cap.sellTotal + " copper), floored at the lowest price");
  const dry = M.quote(M.init(makeDef({ purseTarget: 30 }), 0), makeDef({ purseTarget: 30 }), { sell: { salt: 200 } }, { salt: 10 });
  ok(!dry.ok && /purse is short/.test(dry.problems.join()), "the purse is what stops a glut sale");
  ok(M.quote(st, def, { sell: { salt: 1 } }, { salt: 0.4 }).problems.some((p) => /worth nothing/.test(p)), "a sale that rounds to nothing is refused");
}

// ---------------------------------------------------------------- 4 to 6. two markets: conservation, exhaustion, steady income
function markets() {
  const base = { grain: 6 };
  // a farm grows grain (0.7 of the base price at its usual stock, 12 units a day) and a town lacks it (1.3 of the base, 8 units a day eaten), with the 80 percent buy-back share a trade good gets
  const producer = makeDef({ id: "farm", purseTarget: 400, goods: { grain: { target: 60, stock0: 60, buyPct: 0.8, mult: 0.7, flow: 12 } } });
  const consumer = makeDef({ id: "town", purseTarget: 900, goods: { grain: { target: 60, stock0: 60, buyPct: 0.8, mult: 1.3, flow: -8 } } });
  return { base, producer, consumer };
}
// the best trip right now: buy n from A, sell n to B (whole carts, quotes only)
function bestTrip(A, B, a, b, base, max) {
  let best = null;
  for (let n = 1; n <= max; n++) {
    const qa = M.quote(a, A, { buy: { grain: n } }, base), qb = M.quote(b, B, { sell: { grain: n } }, base);
    if (!qa.ok || !qb.ok) break;
    const profit = qb.sellTotal - qa.buyTotal;
    if (!best || profit > best.profit) best = { n, profit, qa, qb };
  }
  return best;
}
section("two markets: conservation, exhaustion, steady income");
{
  const { base, producer, consumer } = markets();
  let a = M.init(producer, 0), b = M.init(consumer, 0), coin = 0, trips = 0, inflow = 0;
  const total0 = coin + a.purse + b.purse;
  let guard = 0;
  for (;;) {
    const t = bestTrip(producer, consumer, a, b, base, 60);
    if (!t || t.profit <= 0 || ++guard > 200) break;
    a = M.commit(a, producer, t.qa, 0); b = M.commit(b, consumer, t.qb, 0);
    coin += t.qb.sellTotal - t.qa.buyTotal; trips++;
    ok(a.purse >= 0 && b.purse >= 0, "a purse went negative");
    ok(a.stock.grain >= 0 && b.stock.grain >= 0, "a stock went negative");
  }
  ok(guard <= 200, "the greedy trader ran out of profit (" + trips + " trips, " + coin + " copper in all)");
  ok(coin + a.purse + b.purse === total0, "coin is conserved with no days passing (" + (coin + a.purse + b.purse) + " vs " + total0 + ")");
  const left = bestTrip(producer, consumer, a, b, base, 60);
  ok(!left || left.profit <= 0, "no profitable trip is left once the gap has closed");

  // with days passing: the same greedy trader every day for 160 days
  a = M.init(producer, 0); b = M.init(consumer, 0); coin = 0; inflow = 0;
  const startTotal = coin + a.purse + b.purse, perDay = [];
  for (let day = 1; day <= 160; day++) {
    const before = a.purse + b.purse;
    a = M.refresh(a, producer, day); b = M.refresh(b, consumer, day);
    inflow += (a.purse + b.purse) - before;
    let today = 0, g = 0;
    for (;;) {
      const t = bestTrip(producer, consumer, a, b, base, 60);
      if (!t || t.profit <= 0 || ++g > 200) break;
      a = M.commit(a, producer, t.qa, day); b = M.commit(b, consumer, t.qb, day);
      today += t.qb.sellTotal - t.qa.buyTotal; coin += t.qb.sellTotal - t.qa.buyTotal;
    }
    perDay.push(today);
    ok(a.purse >= 0 && b.purse >= 0, "a purse went negative on day " + day);
  }
  ok(coin + a.purse + b.purse === startTotal + inflow, "coin in the system changes only by the purse refilling (conservation over 160 days)");
  const avg = (from, to) => perDay.slice(from, to).reduce((x, y) => x + y, 0) / (to - from);
  const early = avg(20, 60), late = avg(100, 160);
  ok(late <= early * 1.15 + 1, "profit per day settles instead of growing (days 20-60 average " + early.toFixed(1) + ", days 100-160 average " + late.toFixed(1) + ")");
  console.log("   steady income of the best grain route between this farm and this town: about " + late.toFixed(1) + " copper a day (" + (late / 10).toFixed(2) + " silver)");
}

// ---------------------------------------------------------------- 7. buy-back
section("buy-back");
{
  const def = makeDef({ purseTarget: 1e6, goods: { axe: { target: 3, stock0: 3, buyPct: 0.5 } } });
  let st = M.init(def, 0);
  const sell = M.quote(st, def, { sell: { axe: 3 } }, { axe: 100 });
  ok(sell.ok, "a merchant takes goods up to twice its target and past it");
  st = M.commit(st, def, sell, 0);
  ok(st.stock.axe === 6 && st.resv.axe.qty === 3 && st.resv.axe.until === M.BUYBACK_DAYS, "the sold goods join the shelf and are held for " + M.BUYBACK_DAYS + " days");
  const mid = M.refresh(st, def, M.BUYBACK_DAYS - 1);
  ok(mid.stock.axe >= 3 && mid.resv.axe && mid.resv.axe.qty === 3, "a long wait does not restock the held goods away");
  const late = M.refresh(st, def, M.BUYBACK_DAYS);
  ok(!late.resv.axe, "the hold ends after " + M.BUYBACK_DAYS + " days");
  const back = M.quote(st, def, { buy: { axe: 3 } }, { axe: 100 });
  ok(back.ok && back.buyTotal > sell.sellTotal, "buying the goods back costs more than they were sold for (" + back.buyTotal + " vs " + sell.sellTotal + ")");
  const st2 = M.commit(st, def, back, 1);
  ok(!st2.resv.axe, "buying them back clears the hold");
}

// ---------------------------------------------------------------- 7b. production and consumption
section("production and consumption");
{
  const def = makeDef({ purseTarget: 1e6, goods: { grain: { target: 20, stock0: 20, flow: 5 }, ale: { target: 20, stock0: 20, flow: -5 } } });
  const st = M.refresh(M.init(def, 0), def, 3);
  ok(st.stock.grain > 20 && st.stock.ale < 20, "a producer gains stock and a consumer loses it over three days (" + st.stock.grain + ", " + st.stock.ale + ")");
  const long = M.refresh(M.init(def, 0), def, 200);
  ok(long.stock.grain <= M.KNEE_MULT * 20 && long.stock.ale >= 0, "flow never passes twice the target or goes below nothing");
}

// ---------------------------------------------------------------- 8. fixed goods
section("fixed goods");
{
  const def = makeDef({ purseTarget: 1e6, goods: { sword: { target: 1, stock0: 1, fixed: true, buyPct: 0.5 } } });
  let st = M.init(def, 0);
  const b1 = M.quote(st, def, { buy: { sword: 1 } }, { sword: 5000 });
  ok(b1.ok && b1.buyTotal === 5000, "a one-of-a-kind good keeps its list price");
  st = M.commit(st, def, b1, 0);
  const s1 = M.quote(st, def, { sell: { sword: 1 } }, { sword: 5000 });
  ok(s1.ok && s1.sellTotal === 2500, "and is bought back at the usual share, whatever else happened");
  const r = M.refresh(M.commit(st, def, s1, 0), def, 50);
  ok(r.stock.sword === 1, "and is never restocked or decayed");
}

// ---------------------------------------------------------------- 9. the real merchants
section("the real merchants");
{
  const file = path.join(__dirname, "..", "web", "mygame", "market-data.generated.js");
  const sandbox = { window: {} };
  vm.runInNewContext(fs.readFileSync(file, "utf8"), sandbox);
  const DEFS = sandbox.window.MARKET_DEFS, ids = Object.keys(DEFS);
  ok(ids.length > 0, "the generated file holds markets");
  ids.forEach((mid) => { const e = M.validate(DEFS[mid]); ok(e.length === 0, mid + " validates" + (e.length ? ": " + e.join("; ") : "")); });
  let atTarget = 0, rt = 0, rtWorst = -Infinity, rtDesc = "";
  ids.forEach((mid) => {
    const def = DEFS[mid], st0 = M.init(def, 0);
    st0.purse = 1e9;
    Object.keys(def.goods).forEach((gid) => {
      const g = def.goods[gid];
      if (g.sells !== false && !g.fixed) {
        const q = M.quote(st0, def, { buy: { [gid]: 1 } }, null);
        if (q.ok) { atTarget++; ok(q.buyTotal === Math.ceil(g.base * (g.mult || 1) - 1e-9), mid + "/" + gid + " asks the retail price at its usual stock (" + q.buyTotal + " vs " + g.base + ")"); }
      }
      if (g.sells !== false && g.buys !== false) {
        for (let k = 1; k <= Math.min(st0.stock[gid], 30); k++) {
          const b = M.quote(st0, def, { buy: { [gid]: k } }, null);
          if (!b.ok) break;
          const st1 = M.commit(st0, def, b, 0), sq = M.quote(st1, def, { sell: { [gid]: k } }, null);
          if (!sq.ok) continue;
          const profit = sq.sellTotal - b.buyTotal; rt++;
          if (profit > rtWorst) { rtWorst = profit; rtDesc = mid + "/" + gid + " k=" + k; }
        }
      }
    });
  });
  ok(rtWorst <= 0, "a round trip lost money at every real merchant, " + rt + " cases (best " + rtWorst + " at " + rtDesc + ")");
  console.log("   " + atTarget + " goods checked at their usual stock");

  // a player's sell bonus raises every payout; the market stays safe only while buyPct x (1 + bonus) is under 1 at the dearest depth
  const maxPct = Math.max.apply(null, ids.map((m) => Math.max.apply(null, Object.keys(DEFS[m].goods).map((g) => DEFS[m].goods[g].buyPct || 0))));
  console.log("   the highest buy-back share in use is " + maxPct + ", so a sell bonus up to " + Math.floor((1 / maxPct - 1) * 100) + " percent cannot turn a round trip into a profit");

  // purse sanity: can each merchant pay for at least two of its dearest goods?
  ids.forEach((mid) => {
    const def = DEFS[mid]; let dear = 0, dearId = "";
    Object.keys(def.goods).forEach((gid) => { const g = def.goods[gid]; if (g.buys === false) return; const p = g.base * (g.buyPct || 0.5); if (p > dear) { dear = p; dearId = gid; } });
    if (def.purseTarget < dear * 2) console.log("   note: " + mid + "'s purse (" + def.purseTarget + ") could not pay for two " + dearId + " (" + Math.round(dear) + " each)");
  });

  // random closed cycles: buy and sell goods anywhere, then sell what is left; money must not rise
  function rng(seed) { let a = seed >>> 0; return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const rand = rng(20261024);
  // Shops are checked across each other (no loop may make money). An OPEN market (commodities) is checked on its own: carrying a good between two of them earns the gap in their price levels
  // on purpose (the distance model; that profit is bounded by what the shelf, purse and slippage allow, and is printed below).
  const byGood = {};
  ids.filter((mid) => !DEFS[mid].commodities).forEach((mid) => Object.keys(DEFS[mid].goods).forEach((gid) => { (byGood[gid] = byGood[gid] || []).push(mid); }));
  const groups = Object.keys(byGood).map((gid) => ({ gid: gid, where: byGood[gid] }));
  ids.filter((mid) => DEFS[mid].commodities).forEach((mid) => Object.keys(DEFS[mid].goods).forEach((gid) => { groups.push({ gid: gid, where: [mid] }); }));
  let seqs = 0, worst = -Infinity, worstDesc = "", coinLeak = 0;
  groups.forEach((grp) => {
    const gid = grp.gid, where = grp.where; if (where.length < 1) return;
    for (let t = 0; t < 40; t++) {
      const st = {}; ids.forEach((m) => { st[m] = M.init(DEFS[m], 0); });
      let money = 0, have = 0, day = 0;
      for (let step = 0; step < 14; step++) {
        const m = where[Math.floor(rand() * where.length)], def = DEFS[m], r = rand();
        if (r < 0.15) { day += 1 + Math.floor(rand() * 20); ids.forEach((x) => { st[x] = M.refresh(st[x], DEFS[x], day); }); continue; }
        const n = 1 + Math.floor(rand() * 12);
        if (r < 0.6) { const q = M.quote(st[m], def, { buy: { [gid]: n } }, null); if (q.ok && q.buy.length) { st[m] = M.commit(st[m], def, q, day); money -= q.buyTotal; have += q.buy[0].qty; } }
        else if (have > 0) { const q = M.quote(st[m], def, { sell: { [gid]: Math.min(n, have) } }, null); if (q.ok && q.sell.length) { st[m] = M.commit(st[m], def, q, day); money += q.sellTotal; have -= q.sell[0].qty; } }
      }
      // sell what is left to whoever pays most
      while (have > 0) {
        let best = null;
        where.forEach((m) => { const q = M.quote(st[m], DEFS[m], { sell: { [gid]: 1 } }, null); if (q.ok && q.sell.length && (!best || q.sellTotal > best.q.sellTotal)) best = { m: m, q: q }; });
        if (!best) break;
        st[best.m] = M.commit(st[best.m], DEFS[best.m], best.q, day); money += best.q.sellTotal; have -= 1;
      }
      if (have === 0) { seqs++; if (money > worst) { worst = money; worstDesc = gid + " seq " + t; } }
    }
  });
  ok(worst <= 0, "no random closed buy and sell cycle across the real merchants made money, " + seqs + " cycles (best " + worst + " copper at " + worstDesc + ")");
  console.log("   " + seqs + " random closed cycles run, best result " + worst + " copper");
  // the best first-unit margin of carrying one commodity from one open market to another (buy at the first's ask, sell at the second's bid)
  const open = ids.filter((mid) => DEFS[mid].commodities);
  let bestRoute = { m: 0 };
  open.forEach((a) => open.forEach((b) => { if (a === b) return; Object.keys(DEFS[a].goods).forEach((gid) => {
    const buy = M.quote(M.init(DEFS[a], 0), DEFS[a], { buy: { [gid]: 1 } }, null), sell = M.quote(M.init(DEFS[b], 0), DEFS[b], { sell: { [gid]: 1 } }, null);
    if (buy.ok && buy.buy.length && sell.ok && sell.sell.length) { const m = sell.sellTotal - buy.buyTotal; if (m > bestRoute.m) bestRoute = { m: m, desc: gid + " " + a + " to " + b }; }
  }); }));
  console.log("   best first-unit route margin between open markets: " + bestRoute.m + " copper" + (bestRoute.desc ? " (" + bestRoute.desc + ")" : ""));
  ok(bestRoute.m <= 12, "no commodity carries more than 12 copper a unit between two open markets on the current map (" + bestRoute.m + ")");
}

// ---------------------------------------------------------------- 10. open markets and commodities (the distance model)
section("commodities and distance");
{
  const cat = JSON.parse(fs.readFileSync(path.join(__dirname, "gear_catalog.json"), "utf8"));
  const defsJson = JSON.parse(fs.readFileSync(path.join(__dirname, "market_defs.json"), "utf8"));
  const CP = defsJson.commodity;
  const sandbox = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, "..", "web", "mygame", "market-data.generated.js"), "utf8"), sandbox);
  const DEFS = sandbox.window.MARKET_DEFS;
  require(path.join(__dirname, "..", "web", "mygame", "overworld-data.js"));
  const OW = global.Overworld;
  const commodities = cat.items.filter((it) => it.commodity);
  ok(commodities.length > 0, commodities.length + " commodities are tagged");
  commodities.forEach((it) => {
    const tiles = Object.keys(it.commodity.makers);
    ok(tiles.length > 0 && tiles.every((t) => OW.nodes[t] && (it.commodity.makers[t] === "major" || it.commodity.makers[t] === "minor")), it.id + " has makers on real map tiles (" + tiles.join(",") + ")");
    ok(!it.commodity.freight || Freight.defs.profiles.indexOf(it.commodity.freight) >= 0, it.id + " has a known freight profile");
    ok(it.retail > 0, it.id + " has a base price");
  });
  const open = Object.keys(DEFS).filter((m) => DEFS[m].commodities);
  ok(open.length >= 2, "open markets exist (" + open.join(", ") + ")");
  open.forEach((mid) => {
    const def = DEFS[mid], tile = defsJson.merchants[mid].tile;
    commodities.forEach((it) => {
      const g = def.goods[it.id];
      if (!g) { const tr = cat.trades.find((t) => t.name === mid); ok(!!(tr && (tr.excludeCommodities || []).indexOf(it.id) >= 0), mid + " deals in " + it.id + " (or the catalog leaves it off that floor on purpose)"); return; }
      let level = CR.capLevelOf(it, CP), inReach = 0;
      Object.keys(it.commodity.makers).forEach((t) => { const route = Freight.route(t, tile, it), d = route.ok ? route.costDistance : Infinity; if (d > CR.reachOf(it, CP)) return; inReach++; level = Math.min(level, CP.cost[it.commodity.makers[t]] + CP.perMile * d); });
      if (!inReach) { ok(g.unstocked === true && g.sells === false && g.buys !== false && !g.world, mid + "/" + it.id + ": no maker within " + CR.reachOf(it, CP) + " miles, so it is not stocked and the market pays no premium for it"); return; }
      ok(g.buys !== false && g.sells !== false && Math.abs(g.mult - level) < 0.001 && g.mult >= CP.cost.major - 1e-9 && g.mult <= CR.capLevelOf(it, CP) + 1e-9, mid + "/" + it.id + ": bought here, price level " + g.mult + " is the nearest maker's cost plus freight distance (makers within reach only)");
      if (g.restock === false) ok(g.stock0 === 0 && g.flow < 0, mid + "/" + it.id + ": a good with no supply starts empty and is used up, never restocked");
    });
  });
  const byId = {}; commodities.forEach((it) => { byId[it.id] = it; });
  const limestone = byId.limestone;
  const wfPv = Freight.route("wf", "pv", limestone), wfPvRoad = Freight.roadRoute("wf", "pv", limestone);
  const wfBw = Freight.route("wf", "bw", limestone), wfBwRoad = Freight.roadRoute("wf", "bw", limestone);
  ok(limestone && limestone.commodity.makers.wf === "major" && limestone.commodity.freight === "bulk", "limestone is a bulk commodity made at Whitefold");
  ok(wfPv.costDistance < wfPvRoad.costDistance && wfPv.legs.some((leg) => leg.mode === "grey_downstream"), "Whitefold limestone reaches Port Valen more cheaply through the Grey");
  ok(wfBw.costDistance < wfBwRoad.costDistance && wfBw.legs.some((leg) => leg.mode === "tidal_craft"), "Whitefold limestone reaches Brinewick through Grey and tidal freight");
  ok(Freight.route("pv", "af", limestone).costDistance > Freight.route("af", "pv", limestone).costDistance, "upstream Grey freight costs more than downstream freight");
  ok(Freight.route("fo", "tm", byId.longshade_timber).legs.some((leg) => leg.mode === "log_drive") && Freight.route("fo", "tm", byId.charcoal).legs.every((leg) => leg.mode === "road"), "the Ashrun log drive carries timber but not charcoal");
}

// ---------------------------------------------------------------- 11. the world: seasons and shocks (web/mygame/world.js)
section("the world: seasons and shocks");
{
  const W = require(path.join(__dirname, "..", "web", "mygame", "world.js"));
  const wsb = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, "..", "web", "mygame", "world-data.generated.js"), "utf8"), wsb);
  const WD = wsb.window.WORLD_DATA;
  W.setData(WD);
  const sandbox = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, "..", "web", "mygame", "market-data.generated.js"), "utf8"), sandbox);
  const DEFS = sandbox.window.MARKET_DEFS, open = Object.keys(DEFS).filter((m) => DEFS[m].commodities);
  const cat = JSON.parse(fs.readFileSync(path.join(__dirname, "gear_catalog.json"), "utf8"));
  const CP = JSON.parse(fs.readFileSync(path.join(__dirname, "market_defs.json"), "utf8")).commodity;
  // determinism and range of one maker's output
  ok(W.output(7, "rv", "iron_ore", 123.4, [1, 1, 1, 1]) === W.output(7, "rv", "iron_ore", 123.4, [1, 1, 1, 1]), "the same seed, tile, good and day always give the same output");
  ok(W.output(7, "rv", "iron_ore", 50, [1, 1, 1, 1]) !== W.output(8, "rv", "iron_ore", 50, [1, 1, 1, 1]) || W.output(7, "rv", "iron_ore", 90, [1, 1, 1, 1]) !== W.output(8, "rv", "iron_ore", 90, [1, 1, 1, 1]), "a different seed gives a different history");
  let lo = Infinity, hi = -Infinity, sum = 0, n = 0, crisis = 0, bad = 0, good = 0;
  for (let seed = 1; seed <= 20; seed++) for (let d = 1; d <= 720; d++) { const v = W.shock(seed, "fv", "grain", d); lo = Math.min(lo, v); hi = Math.max(hi, v); sum += v; n++; if (v < 0.4) crisis++; if (v < 0.75) bad++; if (v > 1.25) good++; }
  ok(lo >= 0.05 && hi <= 2.0, "a shock stays between 0.05 and 2 (" + lo.toFixed(2) + " to " + hi.toFixed(2) + ")");
  ok(Math.abs(sum / n - 1) < 0.06, "shocks average out near 1 over many years (" + (sum / n).toFixed(3) + ")");
  console.log("   a maker is below 0.75 on " + (100 * bad / n).toFixed(0) + " percent of days, above 1.25 on " + (100 * good / n).toFixed(0) + " percent, in crisis (below 0.4) on " + (100 * crisis / n).toFixed(1) + " percent");
  ok(crisis / n < 0.08 && bad / n < 0.4, "shortages are real but not the rule");
  // seasons: a year averages 1 and never jumps
  cat.items.filter((it) => it.commodity).forEach((it) => {
    let ys = 0, jump = 0, prev = null;
    for (let d = 1; d <= 360; d++) { const v = W.seasonMult(it.commodity.season, d); ys += v; if (prev !== null) jump = Math.max(jump, Math.abs(v - prev)); prev = v; }
    ok(Math.abs(ys / 360 - 1) < 0.04 && jump < 0.1, it.id + ": a season curve averages " + (ys / 360).toFixed(2) + " with no daily jump over " + jump.toFixed(3));
  });
  // derived definitions: sound, in range, and still unable to turn a round trip into a profit
  let worstRt = -Infinity, cases = 0, minLevel = Infinity, maxLevel = 0;
  [1, 40, 95, 150, 215, 300].forEach((day) => Object.keys(DEFS).forEach((mid) => {
    const def = W.derive(DEFS[mid], day, 4242);
    ok(M.validate(def).length === 0, mid + " derived for day " + day + " validates");
    Object.keys(def.goods).forEach((gid) => {
      const g = def.goods[gid], g0 = DEFS[mid].goods[gid];
      if (g.worldRatio !== undefined) { minLevel = Math.min(minLevel, g.mult); maxLevel = Math.max(maxLevel, g.mult / (g.hi || CP.band.max)); }
      const st = M.init(def, day); st.purse = 1e9;
      [1, 3, 9].forEach((k) => { const b = M.quote(st, def, { buy: { [gid]: k } }, null); if (!b.ok || !b.buy.length) return; const q = b.buy[0].qty; const st2 = M.commit(st, def, b, day); const sl = M.quote(st2, def, { sell: { [gid]: q } }, null); if (!sl.ok || !sl.sell.length) return; cases++; worstRt = Math.max(worstRt, sl.sellTotal - b.buyTotal); });
    });
  }));
  ok(worstRt <= 0, "a round trip loses money at every merchant on every sampled day, " + cases + " cases (best " + worstRt + ")");
  ok(minLevel >= CP.band.min - 1e-9 && maxLevel <= 1 + 1e-9, "the world keeps a price level inside the band, " + CP.band.min + " times the base up to its own top (lowest " + minLevel.toFixed(2) + ", highest " + maxLevel.toFixed(2) + " of its top)");
  // the band: no ask is ever above its good's top (1.5 times the base; a far good's widens), with the world and an empty shelf together
  let capBreaks = 0, capCases = 0, capWorst = 0;
  for (let seed = 1; seed <= 8; seed++) for (let day = 5; day <= 360; day += 25) Object.keys(DEFS).forEach((mid) => {
    const def = W.derive(DEFS[mid], day, seed), st = M.init(def, day); st.purse = 1e9;
    Object.keys(def.goods).forEach((gid) => {
      const g = def.goods[gid]; if (g.fixed || g.sells === false) return;
      st.stock[gid] = 1; const b = M.quote(st, def, { buy: { [gid]: 1 } }, null); if (!b.ok || !b.buy.length) return;
      capCases++; capWorst = Math.max(capWorst, b.buyTotal / g.base); if (b.buyTotal > Math.ceil((g.hi || CP.band.max) * g.base)) capBreaks++;
    });
  });
  ok(capBreaks === 0, "no ask in " + capCases + " cases is above the top of its band (worst " + capWorst.toFixed(2) + " times, rounding up)");
  ok(M.ask(8, 0, 10, 1.9) <= 8 * CP.band.max + 1e-9 && M.bid(8, 0, 10, 0.8, 1.9) <= 8 * CP.band.max * 0.8 + 1e-9, "the ask and the payout are both capped at the top of the band (" + CP.band.max + " times the base price)");
  ok(M.ask(8, 500, 10, 0.5) >= 8 * CP.band.min - 1e-9 && M.bid(8, 500, 10, 0.8, 0.5) >= 8 * CP.band.min * 0.8 - 1e-9, "and neither falls below the bottom of it (" + CP.band.min + " times), so a glut never prices a pumpkin at nothing");
  // a far good's own top widens with the miles (tools/commodity_range.js): a salt 600 miles from its maker may reach the ceiling, never more; a local good never leaves the band at any distance
  const salt = { commodity: { range: "far" } }, fish = { commodity: { range: "local" } };
  ok(CR.topOf(salt, CP, 0) === CP.band.max && CR.topOf(salt, CP, 300) > CP.band.max && CR.topOf(salt, CP, 600) === CP.classes.far.ceiling && CR.topOf(salt, CP, 6000) === CP.classes.far.ceiling, "a far good's top widens with the miles from its nearest maker, to the ceiling (" + CR.topOf(salt, CP, 300) + " at 300 miles, " + CR.topOf(salt, CP, 600) + " at 600)");
  ok(CR.topOf(fish, CP, 6000) === CP.band.max && CR.reachOf(fish, CP) === CP.classes.local.reach && CR.reachOf(salt, CP) === Infinity, "a local good keeps to the band at any distance, and only a far good has no reach limit");
  ok(M.ask(8, 0, 10, 3, CR.topOf(salt, CP, 600)) <= 8 * CP.classes.far.ceiling + 1e-9 && M.ask(8, 0, 10, 3, CR.topOf(salt, CP, 600)) > 8 * CP.band.max, "the market honours a good's own top: a far shortage may pass the band, never the ceiling");
  // chains: a mine's bad spell thins the bars at the forge and lifts the smith's price a few days later
  let lowBar = 0, lowN = 0, highBar = 0, highN = 0, lowAxe = 0, highAxe = 0, axeMin = Infinity, axeMax = 0;
  for (let seed = 1; seed <= 40; seed++) for (let day = 10; day <= 360; day += 4) {
    // the ore Alderford's forges get (its own makers keep their own first, so a maker's market does not show a poor spell until it is deep), and the bars Port Valen gets three days on
    const ore = W.supplyAt(seed, "iron_ore", "af", day), bar = W.supplyAt(seed, "iron_bar", "pv", day + 3), axe = W.derive(DEFS.halda, day + 3, seed).goods.timber_axe;
    axeMin = Math.min(axeMin, axe.worldRatio); axeMax = Math.max(axeMax, axe.worldRatio);
    if (ore < 0.85) { lowBar += bar; lowAxe += axe.worldRatio; lowN++; } else if (ore > 0.99) { highBar += bar; highAxe += axe.worldRatio; highN++; }
  }
  ok(lowN > 20 && highN > 20 && lowBar / lowN < highBar / highN - 0.01, "iron bars reach Port Valen thinner after a poor spell of ore at Alderford (" + (lowBar / lowN).toFixed(3) + " after poor ore, " + (highBar / highN).toFixed(3) + " after enough; " + lowN + " and " + highN + " days)");
  ok(lowAxe / lowN > highAxe / highN, "Halda's axe is dearer after a poor spell at the mine (" + (lowAxe / lowN).toFixed(3) + " against " + (highAxe / highN).toFixed(3) + ")");
  ok(axeMin >= 0.6 - 1e-9 && axeMax <= 2 + 1e-9, "a smith's price level from its inputs stays between 0.6 and 2 (" + axeMin.toFixed(2) + " to " + axeMax.toFixed(2) + ")");
  // population and the food cycle (step 2): settlements eat, the makers feed the whole region, a maker's own settlement is served first
  const tiles = Object.keys(WD.tiles);
  ok(tiles.length >= 9 && tiles.every((t) => WD.tiles[t].pop > 0), tiles.length + " settlements have populations (" + tiles.map((t) => WD.tiles[t].name + " " + WD.tiles[t].pop).join(", ") + ")");
  let dataOk = true;
  Object.keys(WD.goods).forEach((id) => { const G = WD.goods[id]; if (!G.makers.length || G.makers.some((m) => !(m.cap > 0)) || G.consumers.length > tiles.length || G.consumers.some((c) => Math.abs(Object.keys(c.s).reduce((a, k) => a + c.s[k], 0) - 1) > 0.002 || !(c.D > 0))) dataOk = false; });
  ok(dataOk, "every commodity has makers with a capacity, and every settlement eats it and draws shares from its makers that sum to 1");
  function yearAvg(good, tile, seeds) { let t = 0, c = 0; for (let seed = 1; seed <= seeds; seed++) for (let d = 5; d <= 360; d += 5) { t += W.supplyAt(seed, good, tile, d); c++; } return t / c; }
  const farm = yearAvg("grain", "fv", 12), mine = yearAvg("grain", "rv", 12), city = yearAvg("grain", "pv", 12);
  ok(farm > mine + 0.05, "a farm village is better supplied with grain (" + farm.toFixed(2) + ") than a mining village that grows none (" + mine.toFixed(2) + ")");
  ok(city > mine, "a city outbids a village for the grain that is short (" + city.toFixed(2) + " against " + mine.toFixed(2) + ")");
  // competition: a growing city takes more of the same farms and its smaller neighbours get less
  const saved = JSON.parse(JSON.stringify(WD)), bigger = JSON.parse(JSON.stringify(WD));
  bigger.goods.grain.consumers.forEach((c) => { if (c.tile === "pv") c.D *= 1.4; });
  const before = yearAvg("grain", "rv", 12); W.setData(bigger); const after = yearAvg("grain", "rv", 12); W.setData(saved);
  ok(after < before - 0.005, "when Port Valen's demand for grain grows by 40 percent, a village drawing on the same farms is worse supplied (" + before.toFixed(3) + " to " + after.toFixed(3) + ")");
  // a maker's own settlement keeps what it eats before it ships any
  const lowOut = JSON.parse(JSON.stringify(WD)); lowOut.goods.grain.makers.forEach((m) => { if (m.tile === "fv") m.cap *= 0.1; });
  const fvOwn = yearAvg("grain", "fv", 12); W.setData(lowOut); const fvLow = yearAvg("grain", "fv", 12), pvLow = yearAvg("grain", "pv", 12); W.setData(saved);
  ok(fvLow >= fvOwn - 0.02 && pvLow < city - 0.1, "when Barleycross turns out a tenth as much grain it still feeds itself first (" + fvLow.toFixed(2) + " against " + fvOwn.toFixed(2) + ") and the shortage lands on Port Valen (" + pvLow.toFixed(2) + " against " + city.toFixed(2) + ")");
  // distance: a crisis at the source is felt more by a market close to it than by a far one (averaged over many days)
  let nearDev = 0, farDev = 0, cnt = 0;
  for (let seed = 1; seed <= 30; seed++) for (let d = 10; d <= 360; d += 5) { const near = W.derive(DEFS.rv_market, d, seed).goods.iron_ore, far = W.derive(DEFS.tm_market, d, seed).goods.iron_ore; nearDev += Math.abs(near.supply - 1); farDev += Math.abs(far.supply - 1); cnt++; }
  ok(nearDev / cnt > farDev / cnt, "iron ore supply swings more at Redvein (" + (nearDev / cnt).toFixed(3) + ") than at Timbermouth (" + (farDev / cnt).toFixed(3) + "), where it is cushioned by distance and other makers");
  // the best first-unit margin between two open markets over many days (the trade the shocks create)
  let bestM = 0, bestD = "";
  for (let seed = 1; seed <= 6; seed++) for (let d = 10; d <= 360; d += 10) {
    const defs = {}; open.forEach((mid) => { defs[mid] = W.derive(DEFS[mid], d, seed); });
    open.forEach((a) => open.forEach((b) => { if (a === b) return; Object.keys(defs[a].goods).forEach((gid) => {
      if (!defs[b].goods[gid]) return;
      const buy = M.quote(M.init(defs[a], d), defs[a], { buy: { [gid]: 1 } }, null), sell = M.quote(M.init(defs[b], d), defs[b], { sell: { [gid]: 1 } }, null);
      if (buy.ok && buy.buy.length && sell.ok && sell.sell.length) { const m = sell.sellTotal - buy.buyTotal; if (m > bestM) { bestM = m; bestD = gid + " " + a + " to " + b + " day " + d + " seed " + seed; } }
    }); }));
  }
  console.log("   best first-unit route margin over the sampled days: " + bestM + " copper (" + bestD + ")");
  ok(bestM <= 30, "no commodity carries more than 30 copper a unit between two open markets on the sampled days (" + bestM + ")");
}

// ---------------------------------------------------------------- 12. reach, need and appetite (what a far or small market pays for a good it does not need)
section("reach, need and appetite");
{
  const mkDef = (goods, extra) => Object.assign({ id: "t", purseTarget: 1000, regen: { stock: 0.2, purse: 0.1 }, commodities: true, appetite: { stocked: 0.1, unstocked: 0.03 }, goods: goods }, extra || {});
  const g = (o) => Object.assign({ base: 10, target: 40, stock0: 40, buyPct: 0.8, mult: 1 }, o);
  // the premium on what a market PAYS is scaled by need; what it CHARGES is not
  const dep = mkDef({ staple: g({ stock0: 0, mult: 1.6, worldRatio: 1.6, need: 1 }), luxury: g({ stock0: 0, mult: 1.6, worldRatio: 1.6, need: 0.2 }) });
  const st = M.init(dep, 0); st.purse = 1e9;
  const pay = (id) => M.quote(st, dep, { sell: { [id]: 1 } }, null).sellTotal, charge = (id) => M.quote(Object.assign({}, st, { stock: { staple: 5, luxury: 5 } }), dep, { buy: { [id]: 1 } }, null).buyTotal;
  ok(pay("luxury") < pay("staple"), "a short market pays less for a good it needs little (" + pay("luxury") + " copper) than for one it needs (" + pay("staple") + ")");
  ok(pay("staple") <= 20 * 0.8 + 1e-9 && pay("luxury") >= 5 * 0.8 - 1e-9, "and the payout stays between the bottom and the top of the band");
  ok(charge("luxury") === charge("staple"), "while what the market CHARGES for a short good is the same whatever it needs (" + charge("luxury") + " copper)");
  // an unstocked good pays no premium at all
  const dun = mkDef({ wool: g({ stock0: 0, target: 3, unstocked: true, sells: false, need: 0.4 }) }), stu = M.init(dun, 0); stu.purse = 1e9;
  const qu = M.quote(stu, dun, { sell: { wool: 1 } }, null);
  ok(qu.ok && qu.sellTotal <= 10 * 0.8 + 1e-9, "a market with no stock of a good pays no shortage premium for it (" + qu.sellTotal + " copper for a base price of 10)");
  ok(!M.quote(stu, dun, { buy: { wool: 1 } }, null).ok, "and it has nothing to sell");
  // appetite: a market spends only a share of its purse on one good a day
  const dap = mkDef({ iron: g({ stock0: 40, target: 40 }) }); let sap = M.init(dap, 5); sap.purse = 1e9;
  const big = M.quote(sap, dap, { sell: { iron: 60 } }, null);
  ok(!big.ok && /will spend only/.test(big.problems.join()), "a market refuses to spend more than its share of the purse on one good in a day (" + big.problems.join("; ") + ")");
  let fit = 0; for (let n = 1; n <= 60; n++) { const q1 = M.quote(sap, dap, { sell: { iron: n } }, null); if (q1.ok) fit = n; else break; }
  ok(fit > 0 && fit < 60, "a lot that fits the day's appetite goes through (" + fit + " units)");
  const q2 = M.quote(sap, dap, { sell: { iron: fit } }, null); sap = M.commit(sap, dap, q2, 5);
  ok(!M.quote(sap, dap, { sell: { iron: fit } }, null).ok, "the same lot is refused later that day, after the appetite has been used");
  const rt = M.parse(M.serialize(sap));
  ok(M.spentToday(rt, "iron") === M.spentToday(sap, "iron") && M.spentToday(rt, "iron") > 0, "what was spent today survives the saved string (" + M.spentToday(rt, "iron") + " copper)");
  const nextDay = M.refresh(rt, dap, 6); nextDay.purse = 1e9;
  ok(M.spentToday(nextDay, "iron") === 0 && M.quote(nextDay, dap, { sell: { iron: fit } }, null).ok, "and the appetite is back the next day");
  // the real markets: a hunter's load still fits (ten hides at the smallest village market), a trader's cartload of cloth does not
  const real = DEFS_REAL();
  function DEFS_REAL() { const sbx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(__dirname, "..", "web", "mygame", "market-data.generated.js"), "utf8"), sbx); return sbx.window.MARKET_DEFS; }
  const ash = real.ah_market, sa = M.init(ash, 3); sa.purse = 1e9;
  ok(M.quote(sa, ash, { sell: { raw_hide: 10 } }, null).ok, "a hunter's ten hides fit Ashrun Holt's daily appetite for hides");
  ok(!M.quote(sa, ash, { sell: { wool_cloth: 40 } }, null).ok, "but forty bolts of cloth in a day do not (a village market of " + ash.purseTarget + " copper)");
  // the panel's price ladder is the quote, unit by unit: its sum rounds to the quote's total (the trade panel's live next-unit price is built on it)
  let ladOk = 0, ladBad = 0;
  ["barley_farm", "pv_market", "rv_market", "halda"].forEach((mid) => [3, 9, 17].forEach((day) => {
    const def = require(path.join(__dirname, "..", "web", "mygame", "world.js")).derive(real[mid], day, 7), stl = M.init(def, day); stl.purse = 1e9;
    Object.keys(def.goods).slice(0, 14).forEach((gid) => [1, 4, 9].forEach((n) => {
      const b = M.quote(stl, def, { buy: { [gid]: n } }, null), sl = M.quote(stl, def, { sell: { [gid]: n } }, null);
      if (b.ok && b.buy.length) { const sum = M.ladder(stl, def, gid, "buy", 0, b.buy[0].qty).reduce((a, v) => a + v, 0); if (Math.ceil(sum - 1e-9) === b.buyTotal) ladOk++; else ladBad++; }
      if (sl.ok && sl.sell.length) { const sum = M.ladder(stl, def, gid, "sell", 0, sl.sell[0].qty).reduce((a, v) => a + v, 0); if (Math.floor(sum + 1e-9) === sl.sellTotal) ladOk++; else ladBad++; }
    }));
  }));
  ok(ladBad === 0 && ladOk > 100, "the price ladder adds up to the quote in every case (" + ladOk + " cases)");
  const stp = M.init(mkDef({ x: g({ target: 10, stock0: 10, buyPct: 0.8 }) }), 1);
  const lb = M.ladder(stp, mkDef({ x: g({ target: 10, stock0: 10, buyPct: 0.8 }) }), "x", "buy", 0, 12), ls = M.ladder(stp, mkDef({ x: g({ target: 10, stock0: 10, buyPct: 0.8 }) }), "x", "sell", 0, 12);
  ok(lb.length === 10 && lb.every((v, i) => i === 0 || v >= lb[i - 1] - 1e-9), "buying draws the shelf down, so each next unit costs the same or more (" + lb.slice(0, 4).map((v) => v.toFixed(2)).join(", ") + " ...)");
  ok(ls.every((v, i) => i === 0 || v <= ls[i - 1] + 1e-9), "and selling piles the shelf up, so each next unit pays the same or less (" + ls.slice(0, 4).map((v) => v.toFixed(2)).join(", ") + " ...)");
}

// ---------------------------------------------------------------- 13. stockpiles (the stored average of a maker's output)
section("stockpiles");
{
  const W = require(path.join(__dirname, "..", "web", "mygame", "world.js"));
  const wsb = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(__dirname, "..", "web", "mygame", "world-data.generated.js"), "utf8"), wsb);
  const WD = wsb.window.WORLD_DATA; W.setData(WD);
  const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length, sd = (a) => { const m = mean(a); return Math.sqrt(mean(a.map((v) => (v - m) * (v - m)))); };
  const grainSeason = WD.goods.grain.season, raw = (d) => W.seasonMult(grainSeason, d), tau = WD.goods.grain.store;
  const days = Array.from({ length: 360 }, (_, i) => 360 + i + 1), sm = days.map((d) => W.smooth(raw, d, tau)), rw = days.map(raw);
  ok(Math.abs(mean(sm) - mean(rw)) < 0.03, "storing a good gives back what was put in: a year averages " + mean(sm).toFixed(3) + " smoothed and " + mean(rw).toFixed(3) + " raw");
  ok(sd(sm) < 0.7 * sd(rw), "a granary (grain, " + tau + " days) flattens the seasons: spread " + sd(sm).toFixed(2) + " against " + sd(rw).toFixed(2) + " raw");
  const peak = (arr) => days[arr.indexOf(Math.max.apply(null, arr))];
  ok(peak(sm) > peak(rw) + 20 || (peak(sm) < peak(rw) - 300), "and the glut is released into the lean season: the smoothed peak comes at day " + peak(sm) + " against the harvest at " + peak(rw));
  const dip = (len, t) => { const fn = (d) => (d >= 1000 && d < 1000 + len) ? 0.2 : 1; let lo = 1; for (let d = 1000; d < 1000 + len + 200; d += 3) lo = Math.min(lo, W.smooth(fn, d, t)); return lo; };
  ok(dip(12, 45) > 0.7, "a fortnight's crisis at the source is cushioned by the sheds: the supply dips only to " + dip(12, 45).toFixed(2) + " of normal");
  ok(dip(90, 45) < 0.45, "but a 90-day one drains them: " + dip(90, 45).toFixed(2) + " of normal");
  const fnLong = (d) => (d >= 1000 && d < 1090) ? 0.3 : 1; const after = W.smooth(fnLong, 1090 + 30, 45), later = W.smooth(fnLong, 1090 + 150, 45);
  ok(after < 0.9 && later > 0.97, "and the stores stay thin after it ends (" + after.toFixed(2) + " a month later) and recover (" + later.toFixed(2) + " five months on)");
  // real goods: every storable good is steadier than its raw output, a perishable is not smoothed at all, and the average is the same whatever order it is asked in
  let steady = true, perish = true, nS = 0, nP = 0;
  Object.keys(WD.goods).forEach((id) => { const G = WD.goods[id], tile = G.makers[0].tile; const rr = [], ss = [];
    for (let d = 20; d <= 740; d += 4) { rr.push(W.rawOutput(11, tile, id, d, 0)); ss.push(W.outputMult(11, tile, id, d, 0)); }
    if (G.store > 6) { nS++; if (!(sd(ss) < sd(rr))) steady = false; } else { nP++; if (Math.abs(sd(ss) - sd(rr)) > 1e-9) perish = false; } });
  ok(steady && nS > 15, nS + " storable goods are steadier than their raw output");
  ok(perish && nP >= 4, nP + " perishable goods (fresh fish, eggs, bread, meat, tomatoes) are not smoothed at all");
  const v1 = W.outputMult(5, "fv", "grain", 200.5, 0); W.setData(WD); W.outputMult(5, "fv", "grain", 33, 0); const v2 = W.outputMult(5, "fv", "grain", 200.5, 0);
  ok(v1 === v2, "the stored average is the same whatever order it is asked in");
}

// ---------------------------------------------------------------- 14. long named events
section("long named events");
{
  const W = require(path.join(__dirname, "..", "web", "mygame", "world.js"));
  const wsb = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(__dirname, "..", "web", "mygame", "world-data.generated.js"), "utf8"), wsb);
  const WD = wsb.window.WORLD_DATA; W.setData(WD);
  const E = WD.events, tiles = Object.keys(WD.tiles), allTiles = tiles.concat(["*"]);
  ok(E.kinds.length >= 15 && E.kinds.every((k) => k.days[0] >= 30 && k.days[1] <= 90), E.kinds.length + " kinds of event, every one 30 to 90 days long");
  const kinds = E.kinds.reduce((o, k) => { o[k.id] = k; return o; }, {});
  // the schedule: lengths, gaps, seasons, rate
  let bad = 0, gapBad = 0, seasonBad = 0, count = 0, tileYears = 0; const SEEDS = [1, 2, 3, 4, 5, 6, 7, 8];
  SEEDS.forEach((seed) => allTiles.forEach((t) => {
    const list = W.eventList(seed, t, 360 * 8), sp = t === "*" ? E.regionalSpacing : E.spacing; let prev = null;
    list.filter((ev) => ev.start < 360 * 8).forEach((ev) => {
      const k = kinds[ev.kind]; count++;
      if (ev.dur < k.days[0] || ev.dur > k.days[1] || ev.mags.some((m, i) => m < k.effects[i].mag[0] - 1e-9 || m > k.effects[i].mag[1] + 1e-9)) bad++;
      if (prev && ev.start < prev.end + prev.aftermath + sp.min) gapBad++;
      if (k.season && k.season[0] <= k.season[1]) { const yd = W.yearDay(ev.start); const hi = k.season[1] + Math.ceil((k.season[1] - k.season[0] + 1) * 0.5); if (yd < k.season[0] || yd > hi) seasonBad++; }
      prev = ev;
    });
    if (t !== "*") tileYears += 8;
  }));
  ok(bad === 0, "every event's length and size lie inside its kind's ranges (" + count + " events over " + SEEDS.length + " seeds and 8 years)");
  ok(gapBad === 0, "events at one tile never overlap, and each waits at least the minimum gap (and its aftermath) after the last");
  ok(seasonBad === 0, "a seasonal event (a forest fire in summer, a harvest in autumn) starts in its season");
  let perTile = 0; SEEDS.forEach((seed) => tiles.forEach((t) => { perTile += W.eventList(seed, t, 360 * 8).filter((ev) => ev.start < 360 * 8).length; }));
  const rate = perTile / tileYears;
  ok(rate > 0.5 && rate < 1.1, "a settlement has about one event every year or two (" + rate.toFixed(2) + " a year)");
  let anyDays = 0, totalDays = 0; SEEDS.slice(0, 4).forEach((seed) => { for (let d = 1; d <= 360 * 4; d += 3) { totalDays++; if (W.eventsAt(seed, d).some((e) => e.phase === "active")) anyDays++; } });
  console.log("   somewhere in the region an event is under way on " + (100 * anyDays / totalDays).toFixed(0) + " percent of days");
  ok(anyDays / totalDays > 0.3 && anyDays / totalDays < 0.95, "there is usually something going on somewhere but never everything at once");
  ok(JSON.stringify(W.eventList(5, "rv", 1500)) === JSON.stringify(W.eventList(5, "rv", 1500)) && JSON.stringify(W.eventList(5, "rv", 1500)) !== JSON.stringify(W.eventList(6, "rv", 1500)), "the same seed gives the same events and another seed gives others");
  const sample = W.eventsAt(3, 400).slice(0, 2).map((e) => e.name + " at " + e.place + " (" + e.cause + ")").join("; ");
  // anything a rumor can say about where or why stays anonymous: no settlement names, no war, no faction
  const names = tiles.map((t) => WD.tiles[t].name.toLowerCase());
  let leak = 0; SEEDS.slice(0, 3).forEach((seed) => { for (let d = 1; d <= 1500; d += 7) W.eventsAt(seed, d).forEach((e) => { const txt = (e.name + " " + e.cause + " " + e.place).toLowerCase(); if (names.some((n) => txt.indexOf(n) >= 0) || /\bwar\b|warfare|the scales|garrison/.test(txt)) leak++; }); });
  ok(leak === 0, "no event line names a settlement, a faction or a war (" + E.kinds.map((k) => k.name).join(", ") + ")");
  console.log("   for example, day 400 of seed 3: " + (sample || "nothing"));
  // find a particular event and its effect against the same day with the events switched off
  function find(kind, tile) { for (let seed = 1; seed <= 40; seed++) { const ev = W.eventList(seed, tile, 360 * 6).find((e) => e.kind === kind && e.start > 60); if (ev) return { seed, ev }; } return null; }
  function onOff(seed, fn) { W.setEvents(true); const on = fn(); W.setEvents(false); const off = fn(); W.setEvents(true); return { on, off }; }
  const bl = find("blight", "fv"), mid = bl.ev.start + Math.floor(bl.ev.dur * 0.6);
  const r1 = onOff(bl.seed, () => W.rawOutput(bl.seed, "fv", "grain", mid, 0));
  ok(r1.on < r1.off * 0.7, "a blight at Barleycross cuts its grain output (" + r1.on.toFixed(2) + " against " + r1.off.toFixed(2) + " without it)");
  const r2 = onOff(bl.seed, () => W.supplyAt(bl.seed, "grain", "pv", mid + 20));
  ok(r2.on < r2.off - 0.02, "and Port Valen, which draws on those farms, is worse supplied some weeks in (" + r2.on.toFixed(2) + " against " + r2.off.toFixed(2) + ")");
  const r3 = onOff(bl.seed, () => W.rawOutput(bl.seed, "fv", "grain", bl.ev.end + 60, 0));
  ok(r3.on < r3.off - 0.05 && bl.ev.aftermath > 0, "the blight's aftermath lowers the output for months after it ends (" + r3.on.toFixed(2) + " against " + r3.off.toFixed(2) + ", two months on)");
  const r4 = onOff(bl.seed, () => W.rawOutput(bl.seed, "fv", "farm_eggs", mid, 0));
  ok(Math.abs(r4.on - r4.off) < 1e-9, "and it leaves the goods it does not name alone (eggs are untouched)");
  const bh = find("bumper_harvest", "mc"), bm = bh.ev.start + Math.floor(bh.ev.dur * 0.6), r5 = onOff(bh.seed, () => W.rawOutput(bh.seed, "mc", "grain", bm, 0));
  ok(r5.on > r5.off * 1.3, "a bumper harvest at Marlcross raises its grain output (" + r5.on.toFixed(2) + " against " + r5.off.toFixed(2) + ")");
  const bd = find("bandit_road", "af"), dm = bd.ev.start + Math.floor(bd.ev.dur * 0.6);
  const x1 = onOff(bd.seed, () => W.supplyAt(bd.seed, "iron_bar", "pv", dm + 3)), x2 = onOff(bd.seed, () => W.supplyAt(bd.seed, "iron_bar", "af", dm + 3));
  ok(x1.on < x1.off - 0.02 && Math.abs(x2.on - x2.off) < 1e-9, "a held road at Alderford starves Port Valen of bars (" + x1.on.toFixed(2) + " against " + x1.off.toFixed(2) + ") but Alderford keeps what it eats");
  const lv = find("stores_levy", "pv"), lm = lv.ev.start + Math.floor(lv.ev.dur * 0.6);
  const d1 = onOff(lv.seed, () => W.supplyAt(lv.seed, "iron_bar", "pv", lm)), d2 = onOff(lv.seed, () => W.supplyAt(lv.seed, "iron_bar", "tm", lm));
  ok(d1.on < d1.off - 0.02, "a levy on stores at the port city leaves it short of bars (" + d1.on.toFixed(2) + " against " + d1.off.toFixed(2) + ")");
  ok(d2.on <= d2.off + 1e-9, "and the towns drawing on the same forges get no more because of it (" + d2.on.toFixed(3) + " against " + d2.off.toFixed(3) + ")");
  const hw = (() => { for (let seed = 1; seed <= 20; seed++) { const ev = W.eventList(seed, "*", 360 * 6).find((e) => e.kind === "hard_winter"); if (ev) return { seed, ev }; } return null; })();
  const hm = hw.ev.start + Math.floor(hw.ev.dur * 0.5), w1 = onOff(hw.seed, () => W.demandAt(hw.seed, WD.goods.charcoal, WD.goods.charcoal.consumers.find((c) => c.tile === "tm"), hm));
  ok(w1.on > w1.off * 1.2 && W.yearDay(hw.ev.start) >= 270, "a hard winter (which starts in winter) raises the demand for fuel across the region (" + w1.on.toFixed(1) + " against " + w1.off.toFixed(1) + " a day at Timbermouth)");
  // nothing breaks: the world ratio, and the derived definitions, stay inside their ranges with the events on
  let lo = Infinity, hi = 0;
  const DEFS = (() => { const sb2 = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(__dirname, "..", "web", "mygame", "market-data.generated.js"), "utf8"), sb2); return sb2.window.MARKET_DEFS; })();
  [2, 5].forEach((seed) => [60, 150, 240, 330, 420, 500, 640].forEach((day) => Object.keys(DEFS).forEach((mid) => { const def = W.derive(DEFS[mid], day, seed); Object.keys(def.goods).forEach((gid) => { const g = def.goods[gid]; if (g.worldRatio !== undefined) { lo = Math.min(lo, g.worldRatio); hi = Math.max(hi, g.worldRatio); } }); })));
  ok(lo >= 0.6 - 1e-9 && hi <= 2 + 1e-9, "with the events on, the world's price level stays between 0.6 and 2 (" + lo.toFixed(2) + " to " + hi.toFixed(2) + ")");
}

console.log("\n" + checks + " checks, " + fails + " failed");
process.exit(fails ? 1 : 0);
