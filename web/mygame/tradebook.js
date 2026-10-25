/*
 * TRADE BOOK (2026-10-25, the user's rumor design) -- what the player remembers of other markets' prices, and the rumors that add to it. No screen code and no ChoiceScript, so the trade panel,
 * equipment.txt (through *script) and the node checks all use it.
 *
 * The book is one saved string, stats.trade_seen: market@day#order[h]:good=ask/bid,... joined by ";" (ask and bid in tenths of a copper, - for none; day may be before day 1; order counts the entries
 * so the highest is the latest; an "h" marks a market the player HEARD of and never stood in). It holds at most WORLD_DATA.rumor.memory.visited visited and .heard heard markets (3 and 3),
 * the newest by order, so what the hover card lists is exactly what is remembered, and everything that reads the book (the "Elsewhere" line, "Resells higher", the margin sort) reads the same six.
 *
 * A RUMOR is a quiet check made once a day at each open market while it is open (equipment.txt market_rumor_check). On a success it teaches the player the prices of the nearest market they hold no
 * data for (road miles, WORLD_DATA.tiles[tile].near), the next nearest when they hold it, and, when they hold every market, it freshens the one with the oldest data. A natural 20 teaches two.
 * The prices are what that market asked and paid some days before (the better the roll, the fresher), worked out from the world model: it is a pure function of the day, so a day before the game
 * began works as well as any other. Nothing in a rumor names a place or a good by hand: the place is the market's own title, the tidbit is the event at that tile or the good whose price level has moved most over the last 30 days, and a new open market takes part with no edit here.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.TradeBook = factory();
})(this, function () {
  "use strict";

  function R() { return typeof window !== "undefined" ? window : globalThis; }
  function num(v, d) { var n = Number(v); return isFinite(n) ? n : (d || 0); }
  function param(name, fallback) { var W = R().WORLD_DATA; return W && W.rumor && W.rumor[name] !== undefined ? W.rumor[name] : fallback; }

  /* ------------------------------------------------------------------ the saved string */
  function parseSeen(str) {
    var o = {};
    String(str || "").split(";").forEach(function (chunk) {
      var m = /^([^@]+)@(-?\d+)#(\d+)(h?):(.*)$/.exec(chunk); if (!m) return;
      var goods = {};
      m[5].split(",").forEach(function (g) { var a = g.split("="); if (!a[0] || a.length < 2) return; var p = a[1].split("/"); goods[a[0]] = [p[0] === "-" ? null : num(p[0]), p[1] === "-" ? null : num(p[1])]; });
      o[m[1]] = { d: num(m[2]), q: num(m[3]), h: m[4] === "h", p: goods };
    });
    return o;
  }
  function serializeSeen(o) {
    return Object.keys(o).sort().map(function (k) {
      return k + "@" + o[k].d + "#" + o[k].q + (o[k].h ? "h" : "") + ":" + Object.keys(o[k].p).sort().map(function (g) { var p = o[k].p[g]; return g + "=" + (p[0] === null ? "-" : p[0]) + "/" + (p[1] === null ? "-" : p[1]); }).join(",");
    }).join(";");
  }
  function top(o) { var t = 0; Object.keys(o).forEach(function (k) { if (o[k].q > t) t = o[k].q; }); return t; }
  // keep the newest few of each kind
  function trim(o) {
    [false, true].forEach(function (heard) {
      var cap = num(param("memory", { visited: 3, heard: 3 })[heard ? "heard" : "visited"], 3);
      var keys = Object.keys(o).filter(function (k) { return !!o[k].h === heard; }).sort(function (a, b) { return o[b].q - o[a].q; });
      keys.slice(cap).forEach(function (k) { delete o[k]; });
    });
    return o;
  }
  // The player stood in this market and saw these prices (p: good -> [ask, bid] in tenths).
  function markVisit(o, key, day, p) { o[key] = { d: day, q: top(o) + 1, h: false, p: p }; return trim(o); }
  // The player heard these prices (a visited market only takes newer prices and keeps its place; a heard one is moved to the front).
  function markHeard(o, key, day, p) {
    if (o[key] && !o[key].h) { if (day >= o[key].d) { o[key].d = day; o[key].p = p; } return o; }
    o[key] = { d: day, q: top(o) + 1, h: true, p: p };
    return trim(o);
  }
  // The newest markets of one kind other than exceptKey, newest first.
  function stops(o, heard, exceptKey, n) {
    return Object.keys(o).filter(function (k) { return k !== exceptKey && !!o[k].h === !!heard; }).sort(function (a, b) { return o[b].q - o[a].q; }).slice(0, n || 99).map(function (k) { return { key: k, d: o[k].d, q: o[k].q, h: o[k].h, p: o[k].p }; });
  }

  /* ------------------------------------------------------------------ places */
  function placeName(key) {
    var t = R().TRADE_DATA && R().TRADE_DATA.trades && R().TRADE_DATA.trades[key];
    return String(t ? t.title : key).replace(/ Market$/, "").replace(/^The /, "the ");
  }
  function openMarkets() { var D = R().MARKET_DEFS || {}; return Object.keys(D).filter(function (k) { return D[k].commodities && D[k].tile; }).sort(); }
  // every open market except fromKey, nearest first by road miles between their tiles (the same tile counts as 0), ties by key
  function nearOrder(fromKey) {
    var D = R().MARKET_DEFS || {}, W = R().WORLD_DATA, from = D[fromKey] && D[fromKey].tile, near = {};
    if (W && W.tiles && W.tiles[from] && W.tiles[from].near) W.tiles[from].near.forEach(function (e) { near[e[0]] = e[1]; });
    return openMarkets().filter(function (k) { return k !== fromKey; }).map(function (k) { var t = D[k].tile, mi = t === from ? 0 : (near[t] === undefined ? 1e9 : near[t]); return { key: k, mi: mi }; })
      .sort(function (a, b) { return a.mi - b.mi || (a.key < b.key ? -1 : 1); });
  }
  // The n markets a rumor teaches: the nearest ones with no entry in the book, then, if there are not enough, the ones with the oldest data (nearest first among equals).
  function choose(o, fromKey, n) {
    var order = nearOrder(fromKey), out = [];
    order.forEach(function (e) { if (out.length < n && !o[e.key]) out.push({ key: e.key, mode: "new" }); });
    if (out.length < n) {
      order.filter(function (e) { return o[e.key] && out.every(function (x) { return x.key !== e.key; }); })
        .sort(function (a, b) { return o[a.key].d - o[b.key].d || a.mi - b.mi; })
        .forEach(function (e) { if (out.length < n) out.push({ key: e.key, mode: "refresh" }); });
    }
    return out;
  }
  // how many days old the heard prices are, from how far the roll beat the DC
  function ageFor(margin) {
    var tbl = param("age", [[5, 0], [1, 2], [0, 3]]);
    for (var i = 0; i < tbl.length; i++) if (margin >= tbl[i][0]) return tbl[i][1];
    return tbl[tbl.length - 1][1];
  }

  /* ------------------------------------------------------------------ prices on a day */
  // The market's prices on a day, as the book stores them. A market the player has traded in uses its saved shelf (and so their trades); one they have not is as untouched as the world leaves it.
  function priceEntry(key, day, stats) {
    var Rt = R(), M = Rt.Market, Wd = Rt.World, def0 = Rt.MARKET_DEFS && Rt.MARKET_DEFS[key]; if (!M || !def0) return {};
    var seed = num(stats.world_seed) || 1, def = Wd ? Wd.derive(def0, day, seed) : def0, saved = String(stats["market_" + key] || ""), st;
    if (saved) { st = M.parse(saved); if (day > st.day) st = M.refresh(st, def, day); } else st = M.refresh(M.init(def, day), def, day);
    var bonus = Math.max(0, num(stats.sell_bonus_pct)), tr = Rt.TRADE_DATA && Rt.TRADE_DATA.trades && Rt.TRADE_DATA.trades[key], p = {}, ids = tr ? tr.buy.concat(tr.sell) : Object.keys(def.goods);
    ids.forEach(function (id) {
      if (p[id] !== undefined) return; var g = def.goods[id]; if (!g) return;
      var a = (g.sells !== false && num(st.stock[id]) > 0) ? M.ladder(st, def, id, "buy", 0, 1, { sellBonusPct: bonus })[0] : undefined, b = g.buys !== false ? M.ladder(st, def, id, "sell", 0, 1, { sellBonusPct: bonus })[0] : undefined;
      p[id] = [a === undefined ? null : Math.round(a * 10), b === undefined ? null : Math.round(b * 10)];
    });
    return p;
  }
  function lowerFirst(s) { s = String(s || ""); return s.charAt(0).toLowerCase() + s.slice(1); }
  function upperFirst(s) { s = String(s || ""); return s.charAt(0).toUpperCase() + s.slice(1); }
  function hashOf(key, day) { var h = 7; String(key).split("").forEach(function (c) { h = (h * 31 + c.charCodeAt(0)) % 9973; }); return h + Math.floor(day); }
  // One thing worth saying about a market on a day, as a finished sentence naming the place, worked out from the data: the event running at its tile, else a good whose price level has moved
  // by the swing over the last 30 days (news is change; a lasting gap, like fish far from the sea, is not), else nothing. Picked by the market and the day, no dice, so a reprint says the same.
  function tidbit(key, day, stats) {
    var Rt = R(), Wd = Rt.World, def0 = Rt.MARKET_DEFS && Rt.MARKET_DEFS[key], seed = num(stats.world_seed) || 1; if (!Wd || !def0) return "";
    var place = placeName(key), h = hashOf(key, day);
    var ev = Wd.eventsAt ? Wd.eventsAt(seed, day, def0.tile).filter(function (e) { return e.phase === "active"; }) : [];
    if (ev.length) return "Word from " + place + " is that " + lowerFirst(ev[0].cause) + ".";
    var def = Wd.derive(def0, day, seed), then = Wd.derive(def0, day - 30, seed), swing = num(param("swing", 0.4)), list = [], items = (Rt.TRADE_DATA && Rt.TRADE_DATA.items) || {};
    Object.keys(def.goods).sort().forEach(function (id) {
      var g = def.goods[id], o = then.goods[id]; if (!items[id] || !o) return;
      var r = num(g.worldRatio, 1), r0 = num(o.worldRatio, 1), move = Math.log((r > 0 ? r : 1) / (r0 > 0 ? r0 : 1));
      if (Math.abs(move) >= Math.log(1 + swing)) list.push({ id: id, move: move });
    });
    if (!list.length) return "";
    var best = list[h % list.length], nm = String(items[best.id].title).toLowerCase(), v = (h >> 1) % 2;
    if (best.move > 0) return v ? "At " + place + ", the price of " + nm + " has gone up." : "Prices for " + nm + " at " + place + " have been climbing.";
    return v ? "At " + place + ", the price of " + nm + " has come down." : "Prices for " + nm + " at " + place + " have been sliding.";
  }

  /* ------------------------------------------------------------------ the daily guard and the rumor itself (called from ChoiceScript through *script) */
  // stats.rumor_log is "market@day;market@day" for today only. Sets stats.rumor_due (true the first time a market asks on a day), stats.rumor_dc, and notes the ask.
  function scriptDue(stats) {
    var day = num(stats.campaign_day), key = String(stats.rumor_key || ""), Rt = R(), def = Rt.MARKET_DEFS && Rt.MARKET_DEFS[key];
    var today = String(stats.rumor_log || "").split(";").filter(function (e) { var m = /^(.+)@(-?\d+)$/.exec(e); return m && num(m[2]) === day; });
    stats.rumor_dc = def && def.rumorDc ? def.rumorDc : 12;
    stats.rumor_due = !!def && def.commodities === true && today.indexOf(key + "@" + day) < 0;
    if (stats.rumor_due) today.push(key + "@" + day);
    stats.rumor_log = today.join(";");
  }
  // After a success: rumor_margin (check total minus DC) and rumor_nat20 are set; learns one market (two on a natural 20) and sets rumor_found, rumor_place, rumor_tidbit and the _2 pair.
  function scriptRun(stats) {
    var day = num(stats.campaign_day), key = String(stats.rumor_key || ""), seen = parseSeen(stats.trade_seen), n = (stats.rumor_nat20 === true || stats.rumor_nat20 === "true") ? 2 : 1;
    var age = ageFor(Math.max(0, num(stats.rumor_margin))), picks = choose(seen, key, n), at = day - age;
    stats.rumor_found = 0; stats.rumor_place = ""; stats.rumor_tidbit = ""; stats.rumor_place_2 = ""; stats.rumor_tidbit_2 = "";
    picks.forEach(function (pk, i) {
      markHeard(seen, pk.key, at, priceEntry(pk.key, at, stats));
      stats["rumor_place" + (i ? "_2" : "")] = placeName(pk.key); stats["rumor_tidbit" + (i ? "_2" : "")] = tidbit(pk.key, at, stats); stats.rumor_found = i + 1;
    });
    stats.trade_seen = serializeSeen(seen);
  }

  return { parseSeen: parseSeen, serializeSeen: serializeSeen, trim: trim, markVisit: markVisit, markHeard: markHeard, stops: stops, top: top, placeName: placeName, openMarkets: openMarkets, nearOrder: nearOrder,
    choose: choose, ageFor: ageFor, priceEntry: priceEntry, tidbit: tidbit, scriptDue: scriptDue, scriptRun: scriptRun };
});
