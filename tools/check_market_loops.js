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
    ok(it.retail > 0, it.id + " has a base price");
  });
  const open = Object.keys(DEFS).filter((m) => DEFS[m].commodities);
  ok(open.length >= 2, "open markets exist (" + open.join(", ") + ")");
  open.forEach((mid) => {
    const def = DEFS[mid], tile = defsJson.merchants[mid].tile;
    commodities.forEach((it) => {
      const g = def.goods[it.id];
      if (!g) { ok(false, mid + " deals in " + it.id); return; }
      let level = CP.capLevel;
      Object.keys(it.commodity.makers).forEach((t) => { const d = tile === t ? 0 : OW.route(tile, t).miles; level = Math.min(level, CP.cost[it.commodity.makers[t]] + CP.perMile * d); });
      ok(g.buys !== false && g.sells !== false && Math.abs(g.mult - level) < 0.001 && g.mult >= CP.cost.major - 1e-9 && g.mult <= CP.capLevel + 1e-9, mid + "/" + it.id + ": bought here, price level " + g.mult + " is the nearest maker's cost plus the miles");
      if (g.restock === false) ok(g.stock0 === 0 && g.flow < 0, mid + "/" + it.id + ": a good with no supply starts empty and is used up, never restocked");
    });
  });
}

console.log("\n" + checks + " checks, " + fails + " failed");
process.exit(fails ? 1 : 0);
