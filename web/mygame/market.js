/*
 * MARKET (2026-10-24, the user's trade-economy design) -- the rules of a merchant's shelf and purse, with no screen code and no ChoiceScript in it, so the trade panel and a node
 * checker (tools/check_market_loops.js) can both run it. Nothing in the game calls it yet.
 *
 * A market is a STATE, not a price list:
 *   stock   how many of each good is on the shelf          (whole units)
 *   purse   the coin the merchant has to pay out           (whole copper)
 *   resv    goods the PLAYER sold, held back from restocking for a while so they can be bought back
 *   day     the campaign day the state was last brought up to date
 * and a DEFINITION (static, data): each good's target stock (its DEPTH: how much the market wants to hold), the share of the price the merchant pays when buying (buyPct), and the
 * merchant's target purse and how fast purse and stock drift back to target.
 *
 * A good's definition may carry its base price (base, copper), and may be sold but not bought (buys: false) or bought but not sold (sells: false) by that merchant.
 *
 * Each good may carry a regional multiplier (mult, default 1: grain is 0.7 on a farm and 1.3 in a town that lacks it). Without one, two markets with the same depth settle at the same
 * price and there is no profit in carrying goods between them; the multiplier is the whole reason a trade route exists.
 *
 * Price of one unit = base * mult * factor(stock, target). The factor is FLAT (1) from half to one and a half times the target, so a merchant sells the first half of its usual shelf at the
 * plain price and takes goods up to half again its usual stock without cutting its offer; beyond that the price climbs (as the shelf empties, to double on an empty one) or falls (as it fills, to
 * 0.6 of the base at twice the target, and on from there more slowly to a floor of a quarter). Every unit bought or sold moves the stock, so the next unit's price moves once the flat zone is left (slippage), and a deep market has a wide flat zone in units. The merchant pays buyPct of the price it would then ASK for the unit,
 * that is at the stock AFTER the unit arrives; that one choice makes a buy and an immediate sell-back at one market lose money at every depth (the checker proves it), and a merchant
 * takes ANY amount: nothing caps what a market will take (the user, 2026-10-24: only the price it pays, as in Mount and Blade); a glut just drives the price down toward the floor, and the merchant's purse is the real limit.
 *
 * Money: the player's payment goes into the purse and the merchant's payout comes out of it, so a cart that buys and sells (a barter) needs the purse to cover only the NET payout. Totals
 * are whole copper and always round in the merchant's favour (a buy rounds up, a sale rounds down), so rounding can never be farmed.
 *
 * A good may also have a flow: whole units a day the market PRODUCES (positive: a farm's grain) or CONSUMES (negative: a town eating it), added before the drift toward target. The
 * drift alone only closes a share of the gap, so a trader who keeps two markets level every day would earn next to nothing; the flow is what a route's income is made of.
 *
 * Time is LAZY: refresh() works out the days since the market was last touched and moves stock and purse toward target in one step (no daily simulation). Goods the player sold stay
 * reserved for BUYBACK_DAYS and are not restocked away.
 *
 * Everything here is deterministic (no dice), so the checker can prove properties. State is a plain object; serialize/parse make it one short string for a saved stat.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.Market = factory();
})(typeof window !== "undefined" ? window : this, function () {
  "use strict";

  var LO = 0.5, HI = 1.5, MIN_F = 0.6, MAX_F = 2.0, KNEE_MULT = 2, FLOOR_F = 0.25, BUYBACK_DAYS = 14, MAX_BUY_PCT = 0.8;

  function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }
  function num(v, d) { var n = Number(v); return isFinite(n) ? n : (d || 0); }

  // The price multiplier at a given stock: 1 anywhere from LO to HI times the target (half to one and a half times what the merchant usually holds), so the first units bought or sold
  // move nothing; below LO it climbs to MAX_F on an empty shelf, and above HI it falls to MIN_F at KNEE_MULT times the target and then more slowly (in proportion to the stock) to FLOOR_F, never refusing. It never rises with stock,
  // which is all the checker's round-trip proof needs.
  function factor(stock, target) {
    var r = stock / target;
    if (r < LO) return Math.min(MAX_F, 1 + (MAX_F - 1) * (LO - r) / LO);
    if (r > KNEE_MULT) return Math.max(FLOOR_F, MIN_F * KNEE_MULT / r);
    if (r > HI) return 1 - (1 - MIN_F) * (r - HI) / (KNEE_MULT - HI);
    return 1;
  }
  // What the merchant asks for one unit when it holds `stock` (before the unit leaves), and what it pays for one unit when the shelf would then hold `stockAfter` (the stock once the unit has arrived).
  function ask(base, stock, target, mult) { return base * (mult || 1) * factor(stock, target); }
  function bid(base, stockAfter, target, buyPct, mult) { return base * (mult || 1) * factor(stockAfter, target) * buyPct; }

  function good(def, id) { return def.goods && def.goods[id] ? def.goods[id] : null; }
  function copyState(st) {
    var o = { day: st.day, purse: st.purse, stock: {}, resv: {} };
    Object.keys(st.stock).forEach(function (k) { o.stock[k] = st.stock[k]; });
    Object.keys(st.resv).forEach(function (k) { o.resv[k] = { qty: st.resv[k].qty, until: st.resv[k].until }; });
    return o;
  }

  // A definition is checked once: a bad number here would make an exploit later.
  function validate(def) {
    var errs = [];
    if (!def || !def.id) errs.push("no id");
    if (!(num(def && def.purseTarget) >= 0)) errs.push("purseTarget");
    Object.keys((def && def.goods) || {}).forEach(function (id) {
      var g = def.goods[id];
      if (!(num(g.target) >= 1)) errs.push(id + ": target must be at least 1");
      if (g.flow !== undefined && !isFinite(Number(g.flow))) errs.push(id + ": flow must be a number");
      if (g.mult !== undefined && !(num(g.mult) > 0)) errs.push(id + ": mult must be above 0");
      if (!(num(g.buyPct, 0.5) > 0 && num(g.buyPct, 0.5) <= MAX_BUY_PCT)) errs.push(id + ": buyPct must be above 0 and at most " + MAX_BUY_PCT);
    });
    return errs;
  }

  function init(def, today) {
    var st = { day: num(today), purse: Math.round(num(def.purseTarget)), stock: {}, resv: {} };
    Object.keys(def.goods || {}).forEach(function (id) {
      var g = def.goods[id];
      st.stock[id] = Math.max(0, Math.round(g.stock0 === undefined ? g.target : g.stock0));
    });
    return st;
  }

  // Bring a market up to `today`: reservations that have run out are dropped, then stock and purse move toward target (a share of the gap that grows with the days).
  function refresh(state, def, today) {
    var st = copyState(state), days = num(today) - st.day;
    if (days <= 0) return st;
    Object.keys(st.resv).forEach(function (id) { if (st.resv[id].until <= today) delete st.resv[id]; });
    var rates = def.regen || {}, sr = clamp(num(rates.stock, 0.1), 0, 1), pr = clamp(num(rates.purse, 0.1), 0, 1);
    var gStock = 1 - Math.pow(1 - sr, days), gPurse = 1 - Math.pow(1 - pr, days);
    Object.keys(def.goods || {}).forEach(function (id) {
      var g = def.goods[id];
      if (g.fixed) return;
      var S = num(st.stock[id]), T = g.target, held = st.resv[id] ? st.resv[id].qty : 0;
      if (g.flow) { S = clamp(S + Math.round(g.flow * days), Math.max(0, held), Math.max(S, Math.ceil(KNEE_MULT * T))); st.stock[id] = S; }
      if (S < T) {
        if (g.restock !== false) st.stock[id] = Math.min(T, S + Math.max(1, Math.round((T - S) * gStock)));
      } else if (S > T) {
        var floor = Math.max(T, held);
        if (S > floor) st.stock[id] = Math.max(floor, S - Math.max(1, Math.round((S - floor) * gStock)));
      }
    });
    var T2 = Math.round(num(def.purseTarget)), gap = T2 - st.purse;
    if (gap !== 0) {
      var step = Math.round(gap * gPurse);
      if (step === 0) step = gap > 0 ? 1 : -1;
      st.purse = gap > 0 ? Math.min(T2, st.purse + step) : Math.max(T2, st.purse + step);
    }
    st.day = today;
    return st;
  }

  // Price a cart: { buy: {id: qty}, sell: {id: qty} } against a market. opts.sellBonusPct raises every payout by that percent (the player's Charisma earns it; it stays safe while the buy-back share times it is under 1). `base` is the base price of a good in copper (a number map or a function). Returns the lines, the totals, and every
  // reason the cart cannot go through (problems); ok is true only with none. Nothing is changed.
  function quote(state, def, cart, base, opts) {
    var bonus = 1 + Math.max(0, num(opts && opts.sellBonusPct)) / 100;
    var basePrice = typeof base === "function" ? base : (base ? function (id) { return num(base[id]); } : function (id) { var g0 = good(def, id); return g0 ? num(g0.base) : 0; });
    var q = { buy: [], sell: [], buyTotal: 0, sellTotal: 0, net: 0, purseAfter: state.purse, ok: true, problems: [] };
    var buyIds = Object.keys((cart && cart.buy) || {}).filter(function (id) { return num(cart.buy[id]) > 0; });
    var sellIds = Object.keys((cart && cart.sell) || {}).filter(function (id) { return num(cart.sell[id]) > 0; });
    function problem(msg) { q.ok = false; q.problems.push(msg); }
    buyIds.forEach(function (id) {
      var g = good(def, id), n = Math.floor(num(cart.buy[id])), b = basePrice(id), S = num(state.stock[id]);
      if (sellIds.indexOf(id) >= 0) { problem(id + ": bought and sold in one cart"); return; }
      if (!g || g.sells === false) { problem(id + ": not traded here"); return; }
      if (n > S) { problem(id + ": only " + S + " on the shelf"); n = S; }
      if (n <= 0) return;
      var sum = 0, first = 0, last = 0, s = S, i;
      for (i = 0; i < n; i++) { var p = g.fixed ? b : ask(b, s, g.target, g.mult); if (i === 0) first = p; last = p; sum += p; s -= 1; }
      var total = Math.ceil(sum - 1e-9);
      q.buy.push({ id: id, qty: n, total: total, first: first, last: last });
      q.buyTotal += total;
    });
    sellIds.forEach(function (id) {
      var g = good(def, id), n = Math.floor(num(cart.sell[id])), b = basePrice(id), S = num(state.stock[id]);
      if (!g || g.buys === false) { problem(id + ": not wanted here"); return; }
      if (n <= 0) return;
      var pct = num(g.buyPct, 0.5), sum = 0, first = 0, last = 0, s = S, i;
      for (i = 0; i < n; i++) { var p = (g.fixed ? b * pct : bid(b, s + 1, g.target, pct, g.mult)) * bonus; if (i === 0) first = p; last = p; sum += p; s += 1; }
      var total = Math.floor(sum + 1e-9);
      if (total <= 0) { problem(id + ": worth nothing at this price"); return; }
      q.sell.push({ id: id, qty: n, total: total, first: first, last: last });
      q.sellTotal += total;
    });
    q.net = q.sellTotal - q.buyTotal;                  // coin the merchant pays out (negative: the player pays)
    q.purseAfter = state.purse - q.net;
    if (q.purseAfter < 0) problem("the purse is short by " + (-q.purseAfter) + " copper");
    return q;
  }

  // Apply a quote that came back ok: stock and purse move, and what the player sold is reserved for buy-back. Returns the new state; the player's coin is the caller's to change by -q.net.
  function commit(state, def, q, today) {
    if (!q || !q.ok) throw new Error("commit of a cart that is not ok");
    var st = copyState(state);
    q.buy.forEach(function (l) {
      st.stock[l.id] = num(st.stock[l.id]) - l.qty;
      if (st.resv[l.id]) { st.resv[l.id].qty -= l.qty; if (st.resv[l.id].qty <= 0) delete st.resv[l.id]; }
    });
    q.sell.forEach(function (l) {
      st.stock[l.id] = num(st.stock[l.id]) + l.qty;
      var r = st.resv[l.id] || { qty: 0, until: 0 };
      r.qty += l.qty; r.until = Math.max(r.until, num(today) + BUYBACK_DAYS);
      st.resv[l.id] = r;
    });
    st.purse = q.purseAfter;
    return st;
  }

  // What the panel shows for one good: the shelf, the buy-back hold, the price now each way and how it compares with the usual price (the base at target stock).
  function describe(state, def, id, base) {
    var g = good(def, id);
    if (!g) return null;
    if (base === undefined) base = num(g.base);
    var S = num(state.stock[id]), f = g.fixed ? 1 : factor(S, g.target), pct = num(g.buyPct, 0.5);
    return { stock: S, target: g.target, held: state.resv[id] ? state.resv[id].qty : 0, askNow: Math.ceil(base * (g.fixed ? 1 : num(g.mult, 1)) * f - 1e-9), bidNow: Math.floor(base * (g.fixed ? 1 : num(g.mult, 1) * factor(S + 1, g.target)) * pct + 1e-9), vsUsual: f > 1.1 ? 1 : (f < 0.9 ? -1 : 0) };
  }

  // One short string for a saved stat: v1|d=<day>|p=<purse>|s=id:qty,id:qty|r=id:qty@until,...
  function serialize(st) {
    var s = Object.keys(st.stock).sort().map(function (k) { return k + ":" + st.stock[k]; }).join(",");
    var r = Object.keys(st.resv).sort().map(function (k) { return k + ":" + st.resv[k].qty + "@" + st.resv[k].until; }).join(",");
    return "v1|d=" + st.day + "|p=" + st.purse + "|s=" + s + "|r=" + r;
  }
  function parse(str) {
    var st = { day: 0, purse: 0, stock: {}, resv: {} };
    String(str || "").split("|").forEach(function (part) {
      var kv = part.split("="), k = kv[0], v = kv.slice(1).join("=");
      if (k === "d") st.day = num(v);
      else if (k === "p") st.purse = num(v);
      else if (k === "s") v.split(",").forEach(function (x) { var a = x.split(":"); if (a[0] && a.length === 2) st.stock[a[0]] = num(a[1]); });
      else if (k === "r") v.split(",").forEach(function (x) { var a = x.split(":"), b = (a[1] || "").split("@"); if (a[0] && b.length === 2) st.resv[a[0]] = { qty: num(b[0]), until: num(b[1]) }; });
    });
    return st;
  }

  return { LO: LO, HI: HI, MIN_F: MIN_F, MAX_F: MAX_F, KNEE_MULT: KNEE_MULT, FLOOR_F: FLOOR_F, BUYBACK_DAYS: BUYBACK_DAYS, MAX_BUY_PCT: MAX_BUY_PCT,
    factor: factor, ask: ask, bid: bid, validate: validate, init: init, refresh: refresh, quote: quote, commit: commit, describe: describe, serialize: serialize, parse: parse };
});
