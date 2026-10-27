/*
 * commodity_range.js -- how far a commodity travels and how dear it may get with distance (2026-10-27, the user's design: three ranges, so a new good picks a class, not a mileage).
 * The classes live in tools/market_defs.json "commodity.classes"; a catalog commodity names its class in commodity.range:
 *   local     spoils or is bulky (fish, eggs, game, bread, fruit)   a short reach, and the price never leaves the band
 *   regional  keeps for a while (grain, produce, ore, hides, wool)  a long reach, and the price never leaves the band
 *   far       durable and valuable (salt, furs, cloth, spices)      no reach limit, and the band's top widens with the miles from the nearest maker, to a ceiling
 * commodity.reach (effective freight miles) is still accepted: it overrides the class's reach for that one good. The band itself ("commodity.band": min, max) is the plain price level a good may have anywhere:
 * the shop-wide rule that a short hop never pays double.
 */
"use strict";
function klass(it, CP) {
  const r = it.commodity && it.commodity.range, k = CP.classes && CP.classes[r];
  if (!k) throw new Error((it && it.id) + ": commodity.range must be one of " + Object.keys(CP.classes || {}).join(", ") + " (got " + r + ")");
  return k;
}
// effective freight miles a good travels to be stocked (Infinity: no limit)
function reachOf(it, CP) {
  const c = it.commodity;
  if (c.reach !== undefined && c.reach !== null) return c.reach;
  const k = klass(it, CP);
  return k.reach === undefined || k.reach === null ? Infinity : k.reach;
}
// the dearest price level (times the base) the good may have at a market whose nearest maker is `miles` away
function topOf(it, CP, miles) {
  const k = klass(it, CP), base = CP.band.max, w = k.widen || 0;
  return Math.round(Math.min(k.ceiling === undefined ? base : k.ceiling, base + w * Math.max(0, miles)) * 1000) / 1000;
}
// the dearest the distance level itself can get (the class ceiling; the band's max for a class that does not widen)
function capLevelOf(it, CP) { const k = klass(it, CP); return k.ceiling === undefined ? CP.band.max : k.ceiling; }
module.exports = { reachOf, topOf, capLevelOf, klass };
