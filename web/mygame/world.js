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
 * STOCKPILES (2026-10-24, the user): a good that keeps (grain, salt, iron, timber, cloth) is held in store, so what reaches the markets is not what the makers turn out TODAY but a running average of it: an
 * exponentially weighted average over the last few time constants (the catalog's commodity.store, days). A harvest glut is stored and released into the lean season, a short shock (a flooded shaft for
 * a fortnight) is cushioned by what is in the sheds, and a LONG one drains them and bites, then lingers (a blight in autumn thins the winter and the spring after it). The average is taken on a 6-day
 * grid and interpolated, so it is cheap and the same on every call. A perishable (fresh fish, eggs, bread, meat, tomatoes) has a time constant of a few days and is as volatile as ever.
 * LONG NAMED EVENTS (2026-10-24, the user): on top of the seasons and the 12-day shocks, each settlement has a string of events of 30 to 90 days, about one every year or two, each with a kind (a blight,
 * a flooded shaft, a forest fire, a strike, a bandit-held road, a levy on stores, a hard winter for the whole region: market_defs.json "events"), a length, a size, a cause and a place, all fixed by the seed. An
 * event ramps in over six days and out over ten; a blight, a murrain or a fire leaves an AFTERMATH (the output stays lowered by a third of the dip for months, fading) so it reaches into the next season.
 * Its effect is on what the makers of the named goods at that tile turn out (so it passes through the stockpile average, the distance delay and the input chains like any other output), on what the tile's
 * makers SEND OUT to other settlements (a held road: the tile keeps what it eats), or on what the settlement WANTS (a levy, refugees, a cold snap). eventsAt() lists what is going on, for the rumors; its place
 * is an ANONYMOUS description ("a hill village", "the port city"), never a name (the user, 2026-10-24).
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
  var TRAVEL_MPD = 20, WINDOW = 12, DEMAND_WINDOW = 20, PRICE_EXP = -0.8, PRICE_MIN = 0.75, PRICE_MAX = 1.5, SUPPLY_MIN = 0.05, SUPPLY_MAX = 3, EXT_CAP = 1.5, LOCAL_CAP = 1.5;
  var STEP = 6;
  var EVENTS_ON = true, evcache = {};
  var DATA = null, scache = {}, dcache = {}, derived = {}, scount = 0, dcount = 0, dercount = 0, rcache = {}, rcount = 0, ecache = {}, ecount = 0;

  function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }
  function num(v, d) { var n = Number(v); return isFinite(n) ? n : (d || 0); }
  function data() { return DATA || (typeof window !== "undefined" ? window.WORLD_DATA : null) || null; }
  function setData(d) { DATA = d; scache = {}; dcache = {}; derived = {}; scount = 0; dcount = 0; dercount = 0; rcache = {}; rcount = 0; ecache = {}; ecount = 0; evcache = {}; }
  // The events can be switched off to see what they do (the checker).
  function setEvents(on) { EVENTS_ON = !!on; scache = {}; dcache = {}; derived = {}; scount = 0; dcount = 0; dercount = 0; rcache = {}; rcount = 0; ecache = {}; ecount = 0; }

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
  function demandAt(seed, G, c, day) { return c.D * seasonMult(G.dseason, day) * demandShock(seed, c.tile, G.id, day) * eventMult(seed, c.tile, G.id, day, "demand"); }

  /* ---- long named events ---- */
  // The kinds a tile may have ('*' is the whole region), by weight.
  function kindsFor(tile) {
    var D = data(), E = D && D.events, out = [];
    if (!E) return out;
    E.kinds.forEach(function (k) { if (k.tiles.indexOf(tile) >= 0 || (tile === "*" && k.tiles.indexOf("*") >= 0)) out.push(k); });
    return out;
  }
  // The string of events of one tile, built one after another from the seed and remembered: each starts after the gap that follows the end (and aftermath) of the one before, inside its kind's season.
  function eventList(seed, tile, upto) {
    var D = data(), E = D && D.events, key = seed + "|" + tile, rec = evcache[key];
    if (!E) return [];
    var kinds = kindsFor(tile); if (!kinds.length) return [];
    if (!rec) rec = evcache[key] = { list: [], next: null, n: 0 };
    var sp = tile === "*" ? E.regionalSpacing : E.spacing, skey = "ev:" + seed + ":" + tile;
    while (rec.next === null || rec.next <= upto) {
      var n = rec.n, at = rec.next === null ? 20 + Math.floor(hash01(skey, n, 1) * (sp.min + (sp.max - sp.min) / 2)) : rec.next;
      var wsum = 0, i; kinds.forEach(function (k) { wsum += k.weight; });
      var r = hash01(skey, n, 2) * wsum, kind = kinds[0]; for (i = 0; i < kinds.length; i++) { if (r < kinds[i].weight) { kind = kinds[i]; break; } r -= kinds[i].weight; }
      var start = at;
      if (kind.season) {
        var yd = yearDay(start), a = kind.season[0], b = kind.season[1];
        if (yd < a || yd > b) start += ((a - yd + YEAR) % YEAR);
        start += Math.floor(hash01(skey, n, 3) * Math.max(1, b - a + 1) * 0.5);
      }
      var dur = kind.days[0] + Math.floor(hash01(skey, n, 4) * (kind.days[1] - kind.days[0] + 1));
      var mags = kind.effects.map(function (e, j) { return Math.round((e.mag[0] + (e.mag[1] - e.mag[0]) * hash01(skey, n, 10 + j)) * 1000) / 1000; });
      var after = kind.aftermath ? kind.aftermath.days : 0;
      rec.list.push({ id: tile + "#" + n, kind: kind.id, name: kind.name, cause: kind.cause, tile: tile, start: start, end: start + dur, dur: dur, mags: mags, aftermath: after, afterFrac: kind.aftermath ? kind.aftermath.frac : 0, effects: kind.effects });
      rec.n = n + 1;
      rec.next = start + dur + after + sp.min + Math.floor(hash01(skey, n, 5) * (sp.max - sp.min + 1));
    }
    return rec.list;
  }
  // How far an event has taken hold on a day: 1 at its peak, ramping in and out; and the aftermath fade (1 just after it ends, 0 when it is over).
  function envelopeOf(ev, day) {
    var E = data().events.envelope;
    if (day >= ev.start && day < ev.end) return { e: Math.max(0, Math.min(1, (day - ev.start + 1) / E.rise, (ev.end - day) / E.fall)), after: 0 };
    if (ev.aftermath && day >= ev.end && day < ev.end + ev.aftermath) return { e: 0, after: 1 - (day - ev.end) / ev.aftermath };
    return null;
  }
  // The multiplier on one good at one tile from the events of one type on a day: output, export or demand (1 is normal).
  function eventMult(seed, tile, good, day, type) {
    if (!EVENTS_ON || !data() || !data().events) return 1;
    var m = 1, t, tiles = [tile, "*"], i, j, ev, env, list;
    for (t = 0; t < 2; t++) {
      list = eventList(seed, tiles[t], num(day) + 1);
      for (i = 0; i < list.length; i++) {
        ev = list[i]; if (ev.start > day + 1) break;
        env = envelopeOf(ev, day); if (!env) continue;
        for (j = 0; j < ev.effects.length; j++) {
          if (ev.effects[j].type !== type || ev.effects[j].goods.indexOf(good) < 0) continue;
          m *= env.e > 0 ? 1 + (ev.mags[j] - 1) * env.e : 1 + (ev.mags[j] - 1) * ev.afterFrac * env.after;
        }
      }
    }
    return m;
  }
  // What is going on on a day: every event in progress (and every aftermath still fading) anywhere, with its cause and place, newest first; for the rumors and the notice boards. Pass a tile to see only its own and the region's.
  function eventsAt(seed, day, tile) {
    var D = data(), out = [], tiles, t, list, i, env;
    if (!D || !D.events) return out;
    tiles = tile ? [tile, "*"] : Object.keys(D.tiles).concat(["*"]);
    tiles.forEach(function (tl) { list = eventList(seed, tl, num(day) + 1); for (i = 0; i < list.length; i++) { if (list[i].start > day) break; env = envelopeOf(list[i], day); if (env) out.push({ id: list[i].id, kind: list[i].kind, name: list[i].name, cause: list[i].cause, tile: list[i].tile, place: list[i].tile === "*" ? "the whole region" : (D.tiles[list[i].tile] ? D.tiles[list[i].tile].anon : "a settlement"), start: list[i].start, end: list[i].end, day: day, phase: env.after ? "aftermath" : "active", strength: env.after ? env.after * list[i].afterFrac : env.e, effects: list[i].effects.map(function (e, j) { return { type: e.type, goods: e.goods, mag: list[i].mags[j] }; }) }); } });
    out.sort(function (a, b) { return b.start - a.start; });
    return out;
  }

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

  // What one maker turns out of a good on one exact day: the season x the shock, and its inputs if it refines something (1 is normal).
  function rawOutput(seed, tile, good, day, depth) {
    var D = data(), G = D && D.goods[good], o;
    o = seasonMult(G ? G.season : null, day) * shock(seed, tile, good, day) * eventMult(seed, tile, good, day, "output");
    if (G && G.inputs && (depth || 0) < 3) {
      var f = 1, ig;
      for (ig in G.inputs) if (Object.prototype.hasOwnProperty.call(G.inputs, ig)) f += G.inputs[ig] * (clamp(supplyAt(seed, ig, tile, day, (depth || 0) + 1), SUPPLY_MIN, 1.3) - 1);
      o *= clamp(f, SUPPLY_MIN, 1.3);
    }
    return o;
  }
  // The same on a day of the 6-day grid, remembered.
  function rawGrid(seed, tile, good, g, depth) {
    var key = seed + "|" + tile + "|" + good + "|" + g + "|" + (depth || 0), hit = rcache[key];
    if (hit !== undefined) return hit;
    var v = rawOutput(seed, tile, good, g * STEP, depth);
    if (++rcount > 30000) { rcache = {}; rcount = 0; }
    rcache[key] = v;
    return v;
  }
  // The stockpile average at grid day g: the output of the last three time constants, weighted by exp(-age / tau).
  function emaGrid(seed, tile, good, g, tau, depth) {
    var key = seed + "|" + tile + "|" + good + "|" + g + "|" + (depth || 0), hit = ecache[key];
    if (hit !== undefined) return hit;
    var n = Math.min(Math.ceil(3 * tau / STEP), 60), sum = 0, wsum = 0, k, w;
    for (k = 0; k <= n; k++) { w = Math.exp(-k * STEP / tau); sum += w * rawGrid(seed, tile, good, g - k, depth); wsum += w; }
    var v = sum / wsum;
    if (++ecount > 30000) { ecache = {}; ecount = 0; }
    ecache[key] = v;
    return v;
  }
  // What reaches the markets from one maker on a day: its output after the stockpile (1 is normal).
  function outputMult(seed, tile, good, day, depth) {
    var D = data(), G = D && D.goods[good], tau = G && G.store;
    if (!tau || tau <= STEP) return rawOutput(seed, tile, good, day, depth);
    var g = Math.floor(num(day) / STEP), f = num(day) / STEP - g, e0 = emaGrid(seed, tile, good, g, tau, depth), e1 = emaGrid(seed, tile, good, g + 1, tau, depth);
    return e0 + (e1 - e0) * f;
  }
  // A stockpile average of ANY series (for the checker): fn(day) smoothed over the last three time constants with the same weights.
  function smooth(fn, day, tau) {
    var n = Math.min(Math.ceil(3 * tau / STEP), 60), sum = 0, wsum = 0, k, w;
    for (k = 0; k <= n; k++) { w = Math.exp(-k * STEP / tau); sum += w * fn(day - k * STEP); wsum += w; }
    return sum / wsum;
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
          ratio = Math.min(EXT_CAP, Math.max(0, out - keep) * c.pull / Math.max(1e-9, drawOn(seed, G, m.tile, day))) * eventMult(seed, m.tile, good, num(day) - miles / TRAVEL_MPD, "export");
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
      if (g.world && !g.fixed && !g.unstocked) {
        if (g.world.inputs && g.world.inputs.length) {
          var ir = inputRatio(seed, g.world.inputs, g.world.tile, day);
          c.mult = Math.round(num(g.mult, 1) * ir * 1000) / 1000;
          c.worldRatio = Math.round(ir * 1000) / 1000;
        } else {
          // The price band (2026-10-27, the user: a day's walk from a chicken farm must not pay double): the good's FINAL level here, the distance level times the world's scarcity ratio, stays between
          // PRICE_MIN and PRICE_MAX of the base (a far good's own top, g.hi, widens with the miles to its nearest maker: tools/commodity_range.js). Both parts used to multiply freely, and a market at the edge of a good's reach was charged for its distance twice (the road miles, then the thin shelf).
          // worldRatio is kept as the final level over the distance level, so the buy-back's shortage damping (market.js bid) still sees what the world did.
          var sp = supplyAt(seed, id, g.world.tile, day, 0), ra = ratioOf(sp), lv = num(g.mult, 1), fin = clamp(lv * ra, PRICE_MIN, g.hi || PRICE_MAX);
          c.mult = Math.round(fin * 1000) / 1000;
          c.supply = Math.round(sp * 1000) / 1000;
          c.worldRatio = Math.round(fin / lv * 1000) / 1000;
        }
      }
      goods[id] = c;
    });
    out.goods = goods;
    if (++dercount > 400) { derived = {}; dercount = 0; }
    derived[ck] = out;
    return out;
  }

  return { YEAR: YEAR, TRAVEL_MPD: TRAVEL_MPD, WINDOW: WINDOW, setData: setData, data: data, yearDay: yearDay, seasonMult: seasonMult, shock: shock, demandShock: demandShock, setEvents: setEvents, eventsAt: eventsAt, eventList: eventList, eventMult: eventMult, output: output, outputMult: outputMult, rawOutput: rawOutput, smooth: smooth,
    supplyAt: supplyAt, drawOn: drawOn, demandAt: demandAt, inputRatio: inputRatio, ratioOf: ratioOf, derive: derive };
});
