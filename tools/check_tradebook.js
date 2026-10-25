#!/usr/bin/env node
/*
 * check_tradebook.js -- the rules of web/mygame/tradebook.js (the trade book and rumors, 2026-10-25): the saved format, the three-and-three memory, which market a rumor teaches, how old the news is,
 * the once-a-day guard, and that every open market takes part with no hand-written entry. Run: node tools/check_tradebook.js        Exit code 1 if a rule breaks.
 */
"use strict";
const path = require("path");
const assert = require("assert");
const G = path.join(__dirname, "..", "web", "mygame") + path.sep;
global.window = global;
["market-data.generated.js", "world-data.generated.js", "trade-data.generated.js"].forEach((f) => require(G + f));
global.Market = require(G + "market.js"); global.World = require(G + "world.js"); if (global.World.setData) global.World.setData(global.WORLD_DATA);
const TB = require(G + "tradebook.js");
let n = 0;
function ok(c, m) { assert.ok(c, m); n++; }

// the format round-trips, including a day before the game and the heard mark
{
  const o = { a_market: { d: -2, q: 1, h: true, p: { grain: [12, 10], salt: [null, 31] } }, b_market: { d: 14, q: 2, h: false, p: { grain: [15, null] } } };
  const back = TB.parseSeen(TB.serializeSeen(o));
  ok(JSON.stringify(back) === JSON.stringify(o), "round trip " + TB.serializeSeen(o));
}
// memory: three visited and three heard, newest kept, the two kinds never crowd each other out
{
  const o = {};
  for (let i = 1; i <= 8; i++) TB.markVisit(o, "v" + i, i, { x: [1, 1] });
  for (let i = 1; i <= 5; i++) TB.markHeard(o, "h" + i, i, { x: [1, 1] });
  const v = Object.keys(o).filter((k) => !o[k].h).sort(), h = Object.keys(o).filter((k) => o[k].h).sort();
  ok(v.join() === "v6,v7,v8", "three newest visited: " + v);
  ok(h.join() === "h3,h4,h5", "three newest heard: " + h);
  // a heard market the player then visits is a visited one (and the oldest visited makes room)
  TB.markVisit(o, "h4", 20, { x: [2, 2] });
  ok(!o.h4.h && Object.keys(o).filter((k) => !o[k].h).length === 3 && !o.v6, "visiting a heard market promotes it and pushes out the oldest visited");
  // a rumor never turns a visited market into a heard one, and only brings newer prices
  TB.markHeard(o, "h4", 19, { x: [9, 9] }); ok(o.h4.p.x[0] === 2 && !o.h4.h, "an older rumor leaves a visited market alone");
}
// which market a rumor teaches
{
  const keys = TB.openMarkets(); ok(keys.length >= 9, "the open markets: " + keys.length);
  const from = "barley_farm", order = TB.nearOrder(from).map((e) => e.key);
  ok(order.indexOf(from) < 0 && order.length === keys.length - 1, "nearOrder leaves out the market itself");
  const o = {};
  const first = TB.choose(o, from, 1)[0]; ok(first.key === order[0] && first.mode === "new", "the nearest unknown market first");
  o[order[0]] = { d: 5, q: 1, h: false, p: {} };
  ok(TB.choose(o, from, 1)[0].key === order[1], "a market already in the book is skipped for the next nearest");
  const two = TB.choose(o, from, 2); ok(two.length === 2 && two[0].key !== two[1].key, "two distinct markets for a natural 20");
  // every market known: the oldest data is freshened
  const all = {}; order.forEach((k, i) => { all[k] = { d: 10 + i, q: i + 1, h: false, p: {} }; });
  all[order[3]].d = 1;
  const r = TB.choose(all, from, 1)[0]; ok(r.key === order[3] && r.mode === "refresh", "with every market known the oldest is freshened: " + r.key);
}
// how old the news is
ok(TB.ageFor(0) === 3 && TB.ageFor(1) === 2 && TB.ageFor(4) === 2 && TB.ageFor(5) === 0 && TB.ageFor(11) === 0, "age table: 0 -> 3, 1-4 -> 2, 5+ -> 0");
// the daily guard: once a day per market
{
  const st = { campaign_day: 14, rumor_key: "barley_farm", rumor_log: "" };
  TB.scriptDue(st); ok(st.rumor_due === true && st.rumor_dc === 10, "village DC 10, due the first time");
  TB.scriptDue(st); ok(st.rumor_due === false, "not due again the same day");
  st.rumor_key = "tm_market"; TB.scriptDue(st); ok(st.rumor_due === true && st.rumor_dc === 12, "another market is its own roll, town DC 12");
  st.rumor_key = "pv_market"; TB.scriptDue(st); ok(st.rumor_dc === 14, "city DC 14");
  st.campaign_day = 15; st.rumor_key = "barley_farm"; TB.scriptDue(st); ok(st.rumor_due === true && st.rumor_log === "barley_farm@15", "next day rolls again and the log holds only today");
  st.rumor_key = "af_store"; TB.scriptDue(st); ok(st.rumor_due === false, "a place that is not an open market never rolls");
}
// a rumor teaches prices from before the game began, for every good the market trades, and names nothing by hand
{
  const st = { campaign_day: 1, world_seed: 4242, trade_seen: "", rumor_key: "tm_market", rumor_margin: 0, rumor_nat20: false };
  TB.scriptRun(st);
  const book = TB.parseSeen(st.trade_seen), k = Object.keys(book)[0];
  ok(st.rumor_found === 1 && book[k].h && book[k].d === -2, "day 1, just meeting the DC: three-day-old news, stamped day -2");
  ok(Object.keys(book[k].p).length >= 20 && book[k].p.grain[0] > 0, "prices for the market's goods");
  ok(st.rumor_place.length > 0 && !/Market$/.test(st.rumor_place), "the place is the market's own title: " + st.rumor_place);
  const st2 = { campaign_day: 30, world_seed: 4242, trade_seen: "", rumor_key: "tm_market", rumor_margin: 7, rumor_nat20: true };
  TB.scriptRun(st2); const b2 = TB.parseSeen(st2.trade_seen);
  ok(st2.rumor_found === 2 && Object.keys(b2).length === 2 && Object.keys(b2).every((x) => b2[x].d === 30), "a natural 20 and a margin of 7: two markets, today's prices");
  ok(JSON.stringify(TB.parseSeen(st.trade_seen)) === JSON.stringify(book), "the string it writes reads back the same");
}
// the tidbit comes from the data (an event if one runs at the tile, else the good furthest from its usual price)
{
  const st = { world_seed: 4242 }; let seen = 0, said = 0;
  for (let d = 1; d <= 720; d += 3) TB.openMarkets().forEach((mk) => { seen++; const t = TB.tidbit(mk, d, st); if (t) said++; if (t) ok(/^[A-Z].*\.$/.test(t) && !/undefined/.test(t), "tidbit is a finished sentence: " + t); });
  ok(said > 0 && said < seen, "some markets have something to say and some do not (" + said + " of " + seen + ")");
}
console.log("tradebook: " + n + " checks passed");
