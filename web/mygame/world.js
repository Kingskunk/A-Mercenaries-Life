/*
 * WORLD (2026-10-24, the user's living-economy design) -- what the world produces and what its settlements eat, day by day, as a pure function of the campaign day and a seed (a saved stat,
 * world_seed). No screen code and no ChoiceScript, so the trade panel and the node checker (tools/check_market_loops.js) both run it. Nothing is saved: the same day and seed always give the
 * same history. The numbers (settlement populations, what a thousand people use in a day, what each maker can turn out) are generated into web/mygame/world-data.generated.js by
 * tools/gen_world.js from tools/market_defs.json; edit those, not this.
 *
 * STEP 1 -- SEASONS AND SHOCKS. A maker's OUTPUT of a good on a day = the good's SEASON curve x a SHOCK.
 *   season   four numbers (spring, summer, autumn, winter; the catalog's commodity.season, scaled so a year averages 1), blended smoothly between the middles of the seasons. The calendar is
 *            12 months of 30 days, three months to a season, and campaign day 1 is the 14th of Scorpio (month 8).
 *   shock    one value per (seed, tile, good, 12-day window), blended smoothly between windows: most windows are ordinary (15 percent either way), a quarter are mild (25 percent), one in ten is
 *            serious (half or half again), a few in a hundred are a crisis (a flooded pit, a blight, a bumper year: 0.1 to 1.9). Slightly more of them go down than up.
 * STEP 2 -- POPULATION AND THE FOOD CYCLE. A settlement is not an island: every settlement EATS (people x what a thousand use of the good in a day, with a seasonal and a windowed shock of its own,
 *   plus its industry: forges eat ore, tanneries eat hides), and the makers feed the whole region. Each maker has a CAPACITY (units a day, set from the region's demand and the maker's tier and size) and its output
 *   is SHARED OUT among every settlement that draws on it, in proportion to what each wants of it (population x use x the settlement's share of draw on that maker) and a little extra pull for a big
 *   settlement (population ^ 0.12: a city outbids a village when there is not enough to go round). So a growing city, a cold winter or a harvest glut moves every market on the same farms, a drop at
 *   a source is felt by the markets that draw on it, soon and strongly by a near one, later and weaker by a far one (output as it was when the goods set out, a travel time ago at 20 miles a day),
 *   and a maker's own market keeps what the others cannot take (a harvest glut stays at the farm).
 *     A maker's OWN settlement is served first (it keeps what it eats; a harvest glut stays at the farm, up to 1.5 times its need): local ratio = output / its own need. What is left goes to the others:
 *     for settlement i and maker m:  ratio = (output - m's own need) x pull(i) / (the pull-weighted draw of every OTHER settlement on m);  supply(i) = the sum over makers of share(i, m) x min(ratio, 1.5) (a glut that outruns the region lowers prices up to half as far again).
 * STEP 3 -- INPUT CHAINS. A refined good's output is (1 - the shares) + each share x the supply of that input at the maker's own tile (iron bars from ore, cloth from wool, leather from hides; the
 *   input's own chain behind it, three deep at most). A shop that works the goods (a smith, a tailor) prices its ware by INPUTS too: its price level is (1 - the shares) + each share x the input's
 *   price ratio (supply ^ -0.8, kept between 0.6 and 2) at the shop's tile.
 * derive() returns a copy of a market definition for one day: each good's price level (mult) scaled by supply ^ -0.8 (0.6 to 2) and its settling shelf (supply) set to the supply. Market.js caps the final
 * ask at 2 times the base price and floors it at half.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.World = factory();
})(typeof window !== "undefined" ? window : this, function () {
  "use strict";

  var YEAR = 360, START_YEARDAY = 7 * 30 + 13;             // campaign day 1 is the 14th of Scorpio, day 224 of the year
  var SEASON_MID = [45, 135, 225, 315];                    // the middle day of spring, summer, autumn and winter
  var TRAVEL_MPD = 20, WINDOW = 12, DEMAND_WINDOW = 20, PRICE_EXP = -0.8, PRICE_MIN = 0.6, PRICE_MAX = 2, SUPPLY_MIN = 0.05, SUPPLY_MAX = 3, EXT_CAP = 1.5, LOCAL_CAP = 1.5;
  var DATA = null, scache = {}, dcache = {}, derived = {}, scount = 0, dcount = 0, dercount = 0;

  function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }
  function num(v, d) { var n = Number(v); return isFinite(n) ? n : (d || 0); }
  function data() { return DATA || (typeof window !== "undefined" ? window.WORLD_DATA : null) || null; }
  function setData(d) { DATA = d; scache = {}; dcache = {}; derived = {}; scount = 0; dcount = 0; dercount = 0; }

  // A small integer hash of a string and numbers, as a number in [0, 1).
  function hash01(str, a, b) {
    var h = 2166136261 >>> 0, i, s = String(str);
    for (i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    h = (h ^ Math.imul(a | 0, 374761393)) >>> 0; h = Math.imul(h ^ (h >>> 15), 2246822519) >>> 0;
    h = (h ^ Math.imul(b | 0, 668265263)) >>> 0; h = Math.imul(h ^ (h >>> 13), 3266489917) >>> 0;
    h = (h ^ (h >>> 16)) >>> 0;
    return h / 4294967296;
  }

  function yearDay(day) { return (((START_YEARDAY + Math.floor(num(day)) - 1) % YEAR) + YEAR) % YEAR; }

  // The season curve of a good on a day, from its four numbers (scaled here so that a year averages 1).
  function seasonMult(season, day) {
    if (!season || season.length !== 4) return 1;
    var mean = (season[0] + season[1] + season[2] + season[3]) / 4 || 1, yd = yearDay(day), i, lo = 3, hi = 0, f;
    for (i = 0; i < 4; i++) if (SEASON_MID[i] <= yd) lo = i;
    hi = (lo + 1) % 4;
    var span = lo === 3 ? (SEASON_MID[0] + YEAR - SEASON_MID[3]) : (SEASON_MID[hi] - SEASON_MID[lo]);
    var from = yd >= SEASON_MID[lo] ? yd - SEASON_MID[lo] : yd + YEAR - SEASON_MID[lo];
    f = clamp(from / span, 0, 1);
    var t = (1 - Math.cos(Math.PI * f)) / 2;
    return (season[lo] + (season[hi] - season[lo]) * t) / mean;
  }

  // The shock value of one 12-day window of a maker: ordinary most of the time, a crisis now and then.
  function windowValue(seed, tile, good, k) {
    var key = seed + ":" + tile + ":" + good;
    var r = hash01(key, k, 1), dir = hash01(key, k, 2), u = hash01(key, k, 3) * 2 - 1, dev;
    if (r < 0.60) dev = 0.15 * Math.abs(u);
    else if (r < 0.85) dev = 0.25;
    else if (r < 0.95) dev = 0.5;
    else if (r < 0.99) dev = 0.75;
    else dev = 0.9;
    if (r < 0.60) return dir < 0.5 ? 1 - dev : 1 + dev;
    return dir < 0.55 ? 1 - dev : 1 + dev;
  }
  function shock(seed, tile, good, day) {
    var w = num(day) / WINDOW, k = Math.floor(w), f = w - k, t = f * f * (3 - 2 * f);
    var a = windowValue(seed, tile, good, k), b = windowValue(seed, tile, good, k + 1);
    return a + (b - a) * t;
  }

  // A settlement's demand shock for one 20-day window (a festival, an army on the road, refugees, a cold snap): small most of the time.
  function demandWindow(seed, tile, good, k) {
    var key = "d" + seed + ":" + tile + ":" + good;
    var r = hash01(key, k, 1), dir = hash01(key, k, 2), u = hash01(key, k, 3) * 2 - 1, dev;
    if (r < 0.80) dev = 0.08 * Math.abs(u); else if (r < 0.95) dev = 0.2; else dev = 0.4;
    return dir < 0.5 ? 1 - dev : 1 + dev;
  }
  function demandShock(seed, tile, good, day) {
    var w = num(day) / DEMAND_WINDOW, k = Math.floor(w), f = w - k, t = f * f * (3 - 2 * f);
    var a = demandWindow(seed, tile, good, k), b = demandWindow(seed, tile, good, k + 1);
    return a + (b - a) * t;
  }

  // What a settlement wants of a good on a day (units a day): its normal demand x the good's seasonal demand curve x its own shock.
  function demandAt(seed, G, c, day) { return c.D * seasonMult(G.dseason, day) * demandShock(seed, c.tile, G.id, day); }

  // The pull-weighted draw of every OTHER settlement on one maker of a good on a day: the sum over settlements of (what each wants of it) x its pull.
  function drawOn(seed, G, makerTile, day) {
    var key = seed + "|" + G.id + "|" + makerTile + "|" + Math.floor(num(day) * 10), hit = dcache[key], sum = 0, i, c, s;
    if (hit !== undefined) return hit;
    for (i = 0; i < G.consumers.length; i++) {
      c = G.consumers[i]; s = c.s[makerTile];
      if (s && c.tile !== makerTile) sum += demandAt(seed, G, c, day) * s * c.pull;
    }
    if (++dcount > 20000) { dcache = {}; dcount = 0; }
    dcache[key] = sum;
    return sum;
  }

  // What one maker turns out of a good on a day: its capacity x the season x the shock, and its inputs if it refines something (1 is normal).
  function outputMult(seed, tile, good, day, depth) {
    var D = data(), G = D && D.goods[good], o;
    o = seasonMult(G ? G.season : null, day) * shock(seed, tile, good, day);
    if (G && G.inputs && (depth || 0) < 3) {
      var f = 1, ig;
      for (ig in G.inputs) if (Object.prototype.hasOwnProperty.call(G.inputs, ig)) f += G.inputs[ig] * (clamp(supplyAt(seed, ig, tile, day, (depth || 0) + 1), SUPPLY_MIN, 1.3) - 1);
      o *= clamp(f, SUPPLY_MIN, 1.3);
    }
    return o;
  }
  // Kept for the checker and older callers: a maker's output multiplier.
  function output(seed, tile, good, day, season, depth) { return outputMult(seed, tile, good, day, depth); }

  // The supply of a good that a settlement feels on a day (1 is enough): the sum over the makers it draws on of its share of them x how much of what it wants of that maker it can get.
  function supplyAt(seed, good, tile, day, depth) {
    var D = data(), G = D && D.goods[good];
    if (!G) return 1;
    var key = seed + "|" + good + "|" + tile + "|" + Math.floor(num(day) * 20) + "|" + (depth || 0), hit = scache[key];
    if (hit !== undefined) return hit;
    var c = null, i, m, sum = 0;
    for (i = 0; i < G.consumers.length; i++) if (G.consumers[i].tile === tile) { c = G.consumers[i]; break; }
    if (c) {
      for (i = 0; i < G.makers.length; i++) {
        m = G.makers[i];
        var s = c.s[m.tile]; if (!s) continue;
        var miles = c.miles[m.tile] || 0;
        var out = m.cap * outputMult(seed, m.tile, good, num(day) - miles / TRAVEL_MPD, depth), ratio;
        if (m.tile === tile) ratio = Math.min(LOCAL_CAP, out / Math.max(1e-9, demandAt(seed, G, c, day) * s));
        else {
          var mc = null, j;
          for (j = 0; j < G.consumers.length; j++) if (G.consumers[j].tile === m.tile) { mc = G.consumers[j]; break; }
          var keep = mc && mc.s[m.tile] ? demandAt(seed, G, mc, day) * mc.s[m.tile] : 0;
          ratio = Math.min(EXT_CAP, Math.max(0, out - keep) * c.pull / Math.max(1e-9, drawOn(seed, G, m.tile, day)));
        }
        sum += s * ratio;
      }
    } else sum = 1;
    sum = clamp(sum, SUPPLY_MIN, SUPPLY_MAX);
    if (++scount > 20000) { scache = {}; scount = 0; }
    scache[key] = sum;
    return sum;
  }

  function ratioOf(supply) { return clamp(Math.pow(supply, PRICE_EXP), PRICE_MIN, PRICE_MAX); }

  // The price level of a ware that is worked from inputs, at a shop's tile: [{good, share}] -> 1 is normal.
  function inputRatio(seed, inputs, tile, day) {
    var f = 1, i;
    for (i = 0; i < inputs.length; i++) f += inputs[i].share * (ratioOf(supplyAt(seed, inputs[i].good, tile, day, 1)) - 1);
    return clamp(f, PRICE_MIN, PRICE_MAX);
  }

  // A copy of a market definition for one day: each good that carries world data gets its price level scaled (mult) and its settling shelf (supply) set; a ware worked from inputs gets its price level
  // from them. Goods without world data are untouched.
  function derive(def, day, seed) {
    var ck = def.id + "|" + Math.floor(num(day)) + "|" + seed;
    if (derived[ck]) return derived[ck];
    var out = {}, goods = {};
    Object.keys(def).forEach(function (k) { out[k] = def[k]; });
    Object.keys(def.goods || {}).forEach(function (id) {
      var g = def.goods[id], c = {};
      Object.keys(g).forEach(function (k) { c[k] = g[k]; });
      if (g.world && !g.fixed) {
        if (g.world.inputs && g.world.inputs.length) {
          var ir = inputRatio(seed, g.world.inputs, g.world.tile, day);
          c.mult = Math.round(num(g.mult, 1) * ir * 1000) / 1000;
          c.worldRatio = Math.round(ir * 1000) / 1000;
        } else {
          var sp = supplyAt(seed, id, g.world.tile, day, 0), ra = ratioOf(sp);
          c.mult = Math.round(num(g.mult, 1) * ra * 1000) / 1000;
          c.supply = Math.round(sp * 1000) / 1000;
          c.worldRatio = Math.round(ra * 1000) / 1000;
        }
      }
      goods[id] = c;
    });
    out.goods = goods;
    if (++dercount > 400) { derived = {}; dercount = 0; }
    derived[ck] = out;
    return out;
  }

  return { YEAR: YEAR, TRAVEL_MPD: TRAVEL_MPD, WINDOW: WINDOW, setData: setData, data: data, yearDay: yearDay, seasonMult: seasonMult, shock: shock, demandShock: demandShock, output: output, outputMult: outputMult,
    supplyAt: supplyAt, drawOn: drawOn, demandAt: demandAt, inputRatio: inputRatio, ratioOf: ratioOf, derive: derive };
});
