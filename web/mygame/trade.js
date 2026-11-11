/*
 * TRADE PANEL -- a quality-of-life layer over the shop menus, not a replacement for them.
 *
 * A shop page that supports it tells us so through the game's own state: stats.shop_open names the trade
 * ("halda", "hollis", "tailor", "pawn"), stats.shop_rows lists the buy rows with their live warnings, and the page carries a hidden
 * "settle" option (label starting with the balance-scale mark). While that option is on the page a Trade button
 * appears in the header. The panel collects a cart, writes it into cart_buy_<id> / cart_sell_<id>, and then
 * clicks the hidden option. equipment.txt (shop_begin .. shop_check) re-checks and carries out the trade, so
 * every price, count and coin is decided in ChoiceScript; nothing here can grant what the menus could not.
 * If this file never loads, the racks / sell menus on the page work exactly as before.
 *
 * Static facts (names, retail prices, sell rules, which shop deals in what) come from trade-data.generated.js,
 * written by tools/gen_gear.js from tools/gear_catalog.json. Quantity is a stepper (-/+), not *input_number.
 */
(function () {
  "use strict";

  var TP = window.TradePanel = window.TradePanel || {};
  var MARK = "⚖"; // balance scale: the hidden settle option's label starts with it

  function truthy(v) { return v === true || v === "true"; }
  function num(v) { var n = Number(v); return isFinite(n) ? n : 0; }
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function data() { return window.TRADE_DATA || { items: {}, trades: {} }; }
  function statsNow() { return window.stats || {}; }

  /* ------------------------------------------------------------------ money and counts */

  // 10 copper = 1 silver, 10 silver = 1 gold (100 copper); the same units as the sidebar's Purse row.
  function fmt(copper) {
    copper = Math.max(0, Math.round(copper));
    var g = Math.floor(copper / 100), s = Math.floor((copper % 100) / 10), c = copper % 10, out = [];
    if (g) out.push(g + "g");
    if (s) out.push(s + "s");
    if (c || !out.length) out.push(c + "c");
    return out.join(" ");
  }
  function purse(s) { return num(s.gold) * 100 + num(s.silver) * 10 + num(s.copper); }

  // Copies owned: has_<id> is "at least one", spare_<id> the rest; a counted item (scrap steel) has its own counter.
  function owned(id, s) {
    var it = data().items[id];
    if (!it) return 0;
    if (it.kind === "salvage" && it.sell.countVar) return Math.max(0, num(s[it.sell.countVar]));
    if (!truthy(s["has_" + id])) return 0;
    return 1 + (it.stack ? Math.max(0, num(s["spare_" + id])) : 0);
  }

  // The percent a buyer pays this player above the base price: the game's own number (equipment.txt sell_bonus_percent writes it each time it quotes a price), never worked out here.
  function sellBonus() { return Math.max(0, num(statsNow().sell_bonus_pct)); }

  // What ONE unit fetches from this trade's buyer. Mirrors equipment.txt gear_unit_value (floor of retail * pct, then the sell bonus).
  function unitPrice(id, buyer) {
    var it = data().items[id];
    if (!it) return 0;
    var sl = it.sell;
    var pct = buyer === "smith" ? sl.smith : (buyer === "general" ? sl.general : (buyer === "tailor" ? sl.tailor : (buyer === "jeweler" ? sl.jeweler : sl.pawn)));
    var v = Math.floor((it.retail * pct) / 100);
    if (buyer === "pawn" && sl.pawnFixed > 0) v = sl.pawnFixed;
    if (buyer === "smith" && sl.smithPiece > 0) v = sl.smithPiece;
    if (buyer === "herbalist") v = sl.herbalistPiece > 0 ? sl.herbalistPiece : 0;
    if (buyer === "game") v = sl.gamePiece > 0 ? sl.gamePiece : Math.floor((it.retail * sl.general) / 100);
    var b = sellBonus();
    if (b > 0) v = Math.floor((v * (100 + b) + 50) / 100);   // to the nearest copper, half up, as equipment.txt does
    return v;
  }

  /* ------------------------------------------------------------------ the market pilot (2026-10-24)
   * A merchant listed in PILOT is priced by web/mygame/market.js (finite stock and purse, slippage, buy-back) instead of by the flat prices above. The market is one saved string per merchant
   * (stats.market_<key>); the panel reads it brought up to today, prices the cart against it, and writes the new state only when the trade is confirmed, together with the totals it agreed
   * (market_cost, market_credit, market_on), which equipment.txt shop_check then takes in place of its own. */
  var PILOT = { halda: true, ambrose: true, hollis: true, inklamp: true, vael: true, works: true, tmstore: true, afstore: true, pawn: true, torvald: true, tailor: true, jeweler: true, trapper: true, hideyard: true, tomlin: true, lgstore: true, barley_farm: true, tm_market: true, bw_market: true, ah_market: true, mc_market: true, af_market: true, rv_market: true, wf_market: true, pv_market: true, lg_market: true, fm_market: true, bm_fair: true, ba_market: true };
  function marketOn(trade) { return !!(trade && PILOT[trade.key] && window.Market && window.MARKET_DEFS && window.MARKET_DEFS[trade.key]); }
  // The trade book (stats.trade_seen, "at your last stops", rumors) is about OTHER OPEN MARKETS, never a counter shop's own curated stock (tradebook.js's own words: "what the player remembers of
  // other markets' prices"). marketOn is true for every PILOT shop, counter shops included, so it is not enough on its own: a counter-shop visit must not evict a real market from the remembered 3.
  function isOpenMarket(trade) { return marketOn(trade) && !!window.MARKET_DEFS[trade.key].commodities; }
  function today() { return num(statsNow().campaign_day); }
  // The market's definition for today: the generated one with the season and the makers' shocks applied (web/mygame/world.js). world_seed is a saved stat (0 until the game picks one).
  function marketDef(trade) {
    var def = window.MARKET_DEFS[trade.key];
    return window.World ? window.World.derive(def, today(), num(statsNow().world_seed) || 1) : def;
  }
  function marketState(trade) {
    var def = marketDef(trade), str = String(statsNow()["market_" + trade.key] || "");
    return window.Market.refresh(str ? window.Market.parse(str) : window.Market.init(def, today()), def, today());
  }
  function marketQuote(trade, st, c) { return window.Market.quote(st, marketDef(trade), { buy: c.buy, sell: c.sell }, null, { sellBonusPct: sellBonus() }); }
  // What one unit of a good costs or fetches here right now (the first unit of a cart of one).
  function marketUnit(trade, st, kind, id) {
    var q = marketQuote(trade, st, kind === "buy" ? { buy: (function () { var o = {}; o[id] = 1; return o; })(), sell: {} } : { buy: {}, sell: (function () { var o = {}; o[id] = 1; return o; })() });
    var l = (kind === "buy" ? q.buy : q.sell)[0];
    return l ? l.total : 0;
  }

  // One unit's price for the panel: a cheap good shows a tenth of a copper (so a slip from 2.0c to 2.4c is visible), a dearer one whole coins; a buyer's price rounds up, a seller's down.
  function fmtUnit(v, kind) {
    if (v >= 10) return fmt(kind === "buy" ? Math.ceil(v - 1e-9) : Math.floor(v + 1e-9));
    var t = kind === "buy" ? Math.ceil(v * 10 - 1e-9) / 10 : Math.floor(v * 10 + 1e-9) / 10;
    return (t === Math.floor(t) ? String(t) : t.toFixed(1)) + "c";
  }
  function signed(copper) { return (copper < 0 ? "−" : "+") + fmt(Math.abs(copper)); }
  function ladderOf(mk, kind, id, from, count) { return window.Market.ladder(mk.st, mk.def, id, kind, from, count, { sellBonusPct: sellBonus() }); }

  /* ------------------------------------------------------------------ the trade book (2026-10-24, the user's QoL list)
   * What the player paid for what they hold (stats.trade_basis) and the last prices seen in each market (stats.trade_seen). Both are only ever shown: nothing here changes a price or grants a thing. */
  function parseBasis(str) { var o = {}; String(str || "").split("|").forEach(function (x) { var a = x.split(":"); if (a[0] && a.length === 3) o[a[0]] = { q: num(a[1]), t: num(a[2]) }; }); return o; }
  function serializeBasis(o) { return Object.keys(o).sort().filter(function (k) { return o[k].q > 0; }).map(function (k) { return k + ":" + o[k].q + ":" + Math.round(o[k].t); }).join("|"); }
  // What the player paid, per unit in tenths of a copper, for the units they still hold (never more units than they own).
  function basisFor(id, s) { var b = parseBasis(s.trade_basis)[id]; if (!b) return null; var q = Math.min(b.q, owned(id, s)); return q > 0 ? { q: q, t: b.t } : null; }
  // stats.trade_seen (web/mygame/tradebook.js holds the format and the rules): the book of what the player remembers of other markets, three they visited and three they heard of.
  function TB() { return window.TradeBook; }
  function parseSeen(str) { return TB().parseSeen(str); }
  function serializeSeen(o) { return TB().serializeSeen(o); }
  // Note what this market asks and pays today (one unit each way), as the player has now seen it, as the latest visited stop.
  function remember(trade, mk) {
    if (!mk) return;
    var s = statsNow(), seen = parseSeen(s.trade_seen), p = {};
    trade.def.buy.concat(trade.def.sell).forEach(function (id) {
      if (p[id] !== undefined) return;
      var g = mk.def.goods[id]; if (!g) return;
      var a = (g.sells !== false && num(mk.st.stock[id]) > 0) ? ladderOf(mk, "buy", id, 0, 1)[0] : undefined, b = g.buys !== false ? ladderOf(mk, "sell", id, 0, 1)[0] : undefined;
      p[id] = [a === undefined ? null : Math.round(a * 10), b === undefined ? null : Math.round(b * 10)];
    });
    TB().markVisit(seen, trade.key, today(), p);
    s.trade_seen = serializeSeen(seen);
  }
  // The markets the player stood in most recently before this one (the newest first), or, with heard, the ones they heard of.
  function lastStops(trade, s, n, heard) {
    return TB().stops(parseSeen(s.trade_seen), !!heard, trade.key, 99).filter(function (e) { return data().trades[e.key]; }).slice(0, n).map(function (e) { return { key: e.key, title: TB().placeName(e.key), d: e.d, q: e.q, h: e.h, p: e.p }; });
  }
  function ageText(days) { return days <= 0 ? "today" : days + "d ago"; }
  // The best price the player has seen for a good in ANOTHER market (the lowest ask for a buy row, the highest bid for a sell row), and every one they know of.
  function elsewhere(kind, id, trade, s) {
    var seen = parseSeen(s.trade_seen), all = [], best = null;
    Object.keys(seen).forEach(function (k) {
      if (k === trade.key || !data().trades[k]) return;
      var p = seen[k].p[id]; if (!p) return;
      var v = kind === "buy" ? p[0] : p[1]; if (v === null || v === undefined) return;
      var e = { title: TB().placeName(k), v: v / 10, age: today() - seen[k].d, heard: !!seen[k].h };
      all.push(e); if (!best || (kind === "buy" ? e.v < best.v : e.v > best.v)) best = e;
    });
    all.sort(function (a, b) { return kind === "buy" ? a.v - b.v : b.v - a.v; });
    return { best: best, all: all };
  }

  // What the player has on in the slot an item would fill, so a purchase can be weighed against it. Worn names and stats
  // come off window.stats, and what a piece does (weather cuts, score bonus) from window.GARMENT_HINTS, the same table
  // the game uses. Returns "" when the slot is empty or the item is the one already worn.
  var WEAR_SLOT = { armor: ["equipped_armor_id", "armor_desc"], head: ["equipped_head_id", "head_desc"], cloak: ["equipped_cloak_id", "cloak_desc"],
    hands: ["equipped_hands_id", "hands_desc"], waist: ["equipped_waist_id", "waist_desc"], feet: ["equipped_feet_id", "feet_desc"], neck: ["equipped_neck_id", "neck_desc"] };
  function wearingLine(id, it, s) {
    var out;
    if (it.kind === "weapon") {
      var wd = s.weapon_desc;
      if (!wd || wd === "Unarmed" || s.equipped_weapon_id === id) return "";
      return "Wielding: " + wd + (s.weapon_damage && s.weapon_damage !== "none" ? " — " + s.weapon_damage : "");
    }
    var slot = WEAR_SLOT[it.kind];
    if (!slot) return "";
    var wid = s[slot[0]], name = s[slot[1]];
    if (!name || /^(none|bare)/i.test(String(name)) || wid === id) return "";
    var hint = wid === "hearthstone_talisman" ? "+1 CON, attuned" : ((window.GARMENT_HINTS || {})[wid] || "");
    if (it.kind === "armor") hint = "AC " + s.armor_class + (hint ? "; " + hint : "");
    if (it.kind === "head" && truthy(s.head_is_armor) && num(s.head_ac) > 0) hint = "+" + s.head_ac + " AC" + (hint ? "; " + hint : "");
    out = "Wearing: " + name + " — " + (hint ? hint.replace(/^Weather wear: /, "") : "no bonuses");
    return out;
  }

  var SLOT_VAR = { weapon: "equipped_weapon_id", armor: "equipped_armor_id", head: "equipped_head_id" };
  function isWorn(id, s) {
    var it = data().items[id];
    if (!it) return false;
    if (it.kind === "shield") return truthy(s.shield_equipped);
    if (it.kind === "ring") return s.equipped_ring1_id === id || s.equipped_ring2_id === id;
    var v = SLOT_VAR[it.kind];
    return !!v && s[v] === id;
  }

  /* ------------------------------------------------------------------ what the current page offers */

  function findSettle() {
    var labels = document.querySelectorAll("form label");
    for (var i = 0; i < labels.length; i++) {
      var t = (labels[i].textContent || "").replace(/^\s+/, "");
      if (t.indexOf(MARK) === 0) return labels[i];
    }
    return null;
  }

  function currentTrade() {
    var s = statsNow();
    var key = s.shop_open;
    if (!key || !data().trades[key]) return null;
    return { key: key, def: data().trades[key] };
  }

  function isActive() { return !!(currentTrade() && findSettle()); }

  // stats.shop_rows is "id~warning|id~warning|": the items on sale right now and why each might be a bad idea.
  function buyRows(trade, s) {
    var out = [];
    // An open market lists every good in its trade data (nothing is written per good in its scene); the panel's own stock filter then hides what the shelf lacks.
    if (trade.def.commodities) {
      var P0 = IP();
      trade.def.buy.forEach(function (id) { if (data().items[id]) out.push({ id: id, warn: P0 && P0.overloadNote ? P0.overloadNote(s, id) : "" }); });
      return out;
    }
    String(s.shop_rows || "").split("|").forEach(function (chunk) {
      if (!chunk) return;
      var at = chunk.indexOf("~");
      var id = at < 0 ? chunk : chunk.slice(0, at);
      if (data().items[id] && trade.def.buy.indexOf(id) !== -1) {
        var warn = at < 0 ? "" : chunk.slice(at + 1), P = IP();
        // A good listed without a warning is checked against the load here (the same words equipment.txt gear_warning_text would give).
        if (!warn && P && P.overloadNote) warn = P.overloadNote(s, id);
        out.push({ id: id, warn: warn });
      }
    });
    return out;
  }

  function sellRows(trade, s, st) {
    var out = [];
    trade.def.sell.forEach(function (id) {
      var n = owned(id, s), unit = st ? marketUnit(trade, st, "sell", id) : unitPrice(id, trade.def.buyer);
      // A cheap good can pay nothing for one unit and something for a lot (the sale rounds down a whole line): it stays listed while the whole stack still fetches a copper.
      if (n > 0 && !unit && st) { var lot = {}; lot[id] = n; var lq = marketQuote(trade, st, { buy: {}, sell: lot }); if (lq.ok && lq.sell.length && lq.sell[0].total > 0) { out.push({ id: id, have: n, unit: 0 }); return; } }
      if (n > 0 && unit > 0) out.push({ id: id, have: n, unit: unit });
    });
    return out;
  }

  /* ------------------------------------------------------------------ categories and art */

  // Fine-grained where equipment has a slot, broad where it does not. Commodity
  // goods use the same future-proof trade classes everywhere. A shop only offers
  // filter choices represented by its current Buy or Sell list.
  var CATEGORY_LABEL = {
    weapon: "Weapons", armor: "Body armor", shield: "Shields & off-hand", head: "Headwear",
    cloak: "Cloaks", hands: "Gloves", feet: "Footwear", neck: "Neckwear", ring: "Rings",
    tool: "Tools", consumable: "Consumables", valuable: "Valuables", salvage: "Salvage", other: "Other",
    provisions: "Provisions", raw_material: "Raw materials", worked_material: "Worked materials"
  };
  var CATEGORY_ORDER = ["weapon", "armor", "shield", "head", "cloak", "hands", "feet", "neck", "ring", "tool", "consumable", "valuable", "salvage", "other", "provisions", "raw_material", "worked_material"];
  function categoryOf(it) {
    var kind = String(it && it.kind || "").toLowerCase();
    var group = String(it && it.group || "").toLowerCase();
    if (CATEGORY_LABEL[group]) return group;
    if (kind === "valuable") return "valuable";
    return CATEGORY_LABEL[kind] ? kind : "other";
  }
  /* ------------------------------------------------------------------ finding things (2026-10-25, the user: a long list needs navigating)
   * The rows of one tab are filtered by the search box, the flag chips and the category chip, sorted, and (when sorted by group with no category picked) split under folding group headers.
   * Facts about a row (its first unit's price, how that stands against the usual price, what the player holds and has set aside) are worked out once here and used for all three. */
  var SORTS = {
    buy: [["group", "By category"], ["name", "Name A–Z"], ["low", "Price: low to high"], ["high", "Price: high to low"], ["usual", "Cheapest for its worth"], ["margin", "Best resale margin"], ["perload", "Most value per load"]],
    sell: [["group", "By category"], ["name", "Name A–Z"], ["low", "Price: low to high"], ["high", "Price: high to low"], ["usual", "Best for its worth"], ["profit", "Most profit"], ["perload", "Most value per load"]]
  };
  function flagList(kind, mk) {
    var f = [["cart", "In cart"]];
    if (kind === "buy") { f.push(["own", "I have some"]); if (mk) { f.push(["away", "Resells higher"]); f.push(["usual", "Cheap now"]); } }
    else { f.push(["profit", "Above what I paid"]); if (mk) f.push(["usual", "Pays well"]); }
    return f;
  }
  function rowFacts(trade, mk, kind, r, s) {
    var it = data().items[r.id], g = mk ? mk.def.goods[r.id] : null, price, base;
    if (mk && g) { var l = ladderOf(mk, kind, r.id, 0, 1)[0]; price = l === undefined ? null : l; base = num(g.base); }
    else { price = kind === "buy" ? num(it.retail) : num(r.unit); base = num(it.retail); }
    var bs = basisFor(r.id, s), away = null, w = wt(r.id);
    // what the best other market the player has seen pays for it (the resale value of a good bought here)
    if (kind === "buy" && mk && price !== null) { var el = elsewhere("sell", r.id, trade, s); if (el.best) away = el.best; }
    return { it: it, price: price, ratio: price !== null && base > 0 ? price / base : 1, qty: cart[kind][r.id] || 0, have: owned(r.id, s), profit: kind === "sell" && bs && price !== null ? price - bs.t / 10 : null,
      away: away, margin: away && price > 0 ? (away.v - price) / price : null, resells: !!away && away.v >= price * 1.1 && away.v - price >= 0.2, perLoad: price !== null && w > 0 ? price / w : null, cat: categoryOf(it) };
  }
  function arrange(trade, mk, s, kind, rows) {
    var key = kind === "buy" ? "buy" : "sell", q = String(view.q || "").toLowerCase().replace(/^\s+|\s+$/g, ""), fl = view.flags || {};
    var items = rows.map(function (r) { return { r: r, f: rowFacts(trade, mk, kind, r, s) }; });
    var filtered = !!q || Object.keys(fl).some(function (k) { return fl[k]; });
    var base = items.filter(function (x) {
      var f = x.f, label = (CATEGORY_LABEL[f.cat] || "").toLowerCase();
      if (q && (f.it.title || "").toLowerCase().indexOf(q) < 0 && (f.it.name || "").toLowerCase().indexOf(q) < 0 && label.indexOf(q) < 0) return false;
      if (fl.cart && !f.qty) return false;
      if (fl.own && !f.have) return false;
      if (fl.away && !f.resells) return false;
      if (fl.profit && !(f.profit !== null && f.profit > 0)) return false;
      if (fl.usual && !(kind === "buy" ? f.ratio <= 0.92 : f.ratio >= 1.08)) return false;
      return true;
    });
    var counts = {}, cats = [];
    base.forEach(function (x) { counts[x.f.cat] = (counts[x.f.cat] || 0) + 1; });
    CATEGORY_ORDER.forEach(function (c) { if (counts[c]) cats.push({ key: c, n: counts[c] }); });
    if (view.category && !counts[view.category]) view.category = "";
    var shown = view.category ? base.filter(function (x) { return x.f.cat === view.category; }) : base;
    var order = function (x) { return CATEGORY_ORDER.indexOf(x.f.cat); }, nameOf = function (x) { return String(x.f.it.title || x.f.it.name || ""); };
    var byName = function (a, b) { return nameOf(a).localeCompare(nameOf(b)); };
    var sort = SORTS[key].some(function (o) { return o[0] === view.sort; }) ? view.sort : "group";
    var price = function (x) { return x.f.price === null ? Infinity : x.f.price; };
    shown.sort(function (a, b) {
      if (sort === "name") return byName(a, b);
      if (sort === "low") return price(a) - price(b) || byName(a, b);
      if (sort === "high") return (b.f.price === null ? -1 : b.f.price) - (a.f.price === null ? -1 : a.f.price) || byName(a, b);
      if (sort === "usual") return kind === "buy" ? a.f.ratio - b.f.ratio || byName(a, b) : b.f.ratio - a.f.ratio || byName(a, b);
      if (sort === "profit") return (b.f.profit === null ? -1e9 : b.f.profit) - (a.f.profit === null ? -1e9 : a.f.profit) || byName(a, b);
      if (sort === "margin") return (b.f.margin === null ? -1e9 : b.f.margin) - (a.f.margin === null ? -1e9 : a.f.margin) || byName(a, b);
      if (sort === "perload") return (b.f.perLoad === null ? -1 : b.f.perLoad) - (a.f.perLoad === null ? -1 : a.f.perLoad) || byName(a, b);
      return order(a) - order(b) || byName(a, b);
    });
    var entries = [], grouped = sort === "group" && !view.category && cats.length > 1;
    if (grouped) {
      cats.forEach(function (c) {
        var mine = shown.filter(function (x) { return x.f.cat === c.key; }), inCart = 0;
        mine.forEach(function (x) { inCart += x.f.qty ? 1 : 0; });
        var folded = !filtered && !!view.fold[kind + ":" + c.key];
        entries.push({ head: c.key, n: mine.length, inCart: inCart, folded: folded });
        if (!folded) mine.forEach(function (x) { entries.push(x.r); });
      });
    } else shown.forEach(function (x) { entries.push(x.r); });
    return { entries: entries, cats: cats, all: rows.length, matched: base.length, filtered: filtered, sort: sort };
  }
  function headHtml(h) {
    return '<div class="trd-grouphead' + (h.folded ? " trd-folded" : "") + '" data-fold="' + esc(h.head) + '" role="button" tabindex="0" aria-expanded="' + (!h.folded) + '"><span class="trd-caret">' + (h.folded ? "▸" : "▾") + "</span> " + esc(CATEGORY_LABEL[h.head] || h.head) + " <small>" + h.n + "</small>" + (h.inCart ? ' <small class="trd-incart">' + h.inCart + " in cart</small>" : "") + "</div>";
  }
  function noMatchHtml() { return '<div class="trd-empty">Nothing matches. <button type="button" class="trd-link" data-act="resetfilters">Clear the search and filters</button></div>'; }

  function tradeIcon(id, it) {
    var resolver = window.ItemIconResolver, key = "misc", src = "";
    if (resolver && typeof resolver.keyFor === "function") key = resolver.keyFor(id, it);
    if (resolver && typeof resolver.srcFor === "function") src = resolver.srcFor(key);
    else { var icons = window.ITEM_ICONS || {}; src = icons[key] || icons.misc || ""; }
    return src ? '<img class="trd-icon" alt="" draggable="false" src="' + src + '">' : '<span class="trd-icon trd-icon-none"></span>';
  }

  /* ------------------------------------------------------------------ DOM */

  if (typeof document === "undefined") return; // node tests stop here (mirrors inventory.js)

  var dlg, elReceipt, elTitle, elPurse, elBody, elFoot, elTabs, elControls, elRail, elTools, elSearch, elSort, elFlags, elCats;
  var view = { key: "", tab: "buy", category: "", q: "", sort: "group", flags: {}, fold: {}, receipt: "", pending: false, dirty: false };
  var cart = { buy: {}, sell: {} };
  var reopen = false;
  var confirmedLabel = null; // the settle option we clicked; the old page can linger while ChoiceScript fades it out

  function build() {
    if (dlg) return;
    dlg = document.createElement("dialog");
    dlg.id = "trade";
    dlg.setAttribute("aria-label", "Trade");
    dlg.innerHTML =
      '<div class="trd-head">' +
        '<h2 class="trd-title">Trade</h2>' +
        '<span class="trd-purse"></span><span class="trd-spacer"></span>' +
        '<button type="button" class="trd-close" data-act="close" aria-label="Close trade">×</button>' +
      "</div>" +
      '<div class="trd-controls"><div class="trd-tabs"></div></div>' +
      '<div class="trd-split"><div class="trd-rail">' +
        '<div class="trd-tools"><input type="search" class="trd-search" data-act="search" placeholder="Search goods" aria-label="Search goods" autocomplete="off"><select class="trd-sort" data-act="sort" aria-label="Sort"></select><span class="trd-flags"></span></div>' +
        '<div class="trd-cats"></div>' +
      '</div><div class="trd-right"><div class="trd-body"></div><div class="trd-receipt" role="status" hidden></div><div class="trd-foot"></div></div></div>';
    document.body.appendChild(dlg);
    elTitle = dlg.querySelector(".trd-title");
    elPurse = dlg.querySelector(".trd-purse");
    elControls = dlg.querySelector(".trd-controls");
    elTabs = dlg.querySelector(".trd-tabs");
    elRail = dlg.querySelector(".trd-rail");
    elTools = dlg.querySelector(".trd-tools");
    elSearch = dlg.querySelector(".trd-search");
    elSort = dlg.querySelector(".trd-sort");
    elFlags = dlg.querySelector(".trd-flags");
    elCats = dlg.querySelector(".trd-cats");
    elBody = dlg.querySelector(".trd-body");
    elReceipt = dlg.querySelector(".trd-receipt");
    elFoot = dlg.querySelector(".trd-foot");
    dlg.addEventListener("click", onClick);
    dlg.addEventListener("change", onChange);
    dlg.addEventListener("input", onInput);
    dlg.addEventListener("mouseover", onOver);
    dlg.addEventListener("mousemove", onMove);
    dlg.addEventListener("mouseleave", hideTip);
    // Keep typing from reaching the game's own hotkeys (1-9, J/K...) while this panel is up.
    dlg.addEventListener("keydown", function (ev) {
      ev.stopPropagation();
      // Escape in the search box clears it first; the dialog's native close runs when it is already empty
      if (ev.key === "Escape" && ev.target === elSearch && elSearch.value) { ev.preventDefault(); elSearch.value = ""; view.q = ""; render(); return; }
      if (ev.key === "Escape") return;
      if ((ev.key === "Enter" || ev.key === " ") && ev.target && ev.target.getAttribute && ev.target.hasAttribute("data-fold")) { ev.preventDefault(); toggleFold(ev.target.getAttribute("data-fold")); }
    });
    dlg.addEventListener("mousedown", function (ev) { if (ev.target === dlg) close(); });
    dlg.addEventListener("close", function () {
      view.receipt = "";   // the receipt belongs to the visit: it is gone when the panel closes (the user, 2026-11-02)
      render();
      // A market trade is settled without a page change (confirm, below), so the page behind is stale (the clock moved, coin and goods changed). It is rebuilt ONCE, as the panel closes.
      if (view.dirty) { view.dirty = false; if (typeof window.returnFromStats === "function") window.returnFromStats(); }
    });
  }

  function setQty(kind, id, n, max) {
    n = Math.max(0, Math.min(max, n));
    view.receipt = "";
    if (n) cart[kind][id] = n; else delete cart[kind][id];
  }

  /* ------------------------------------------------------------------ load (2026-10-14)
   * The pack's Load calculation (inventory.js loadOf) is the one source. The cart changes it three ways: what is bought comes on, what is sold goes off, and the coin spent or taken changes
   * what the purse weighs (the purse is always held as the fewest coins). Only shown, never a gate: a trade that overloads is allowed, with the words the shop menus use. */
  function IP() { return window.InventoryPanel && window.InventoryPanel.loadOf ? window.InventoryPanel : null; }
  function wt(id) { var it = data().items[id]; return it ? num(it.weight) : 0; }
  // "you have 14 · 0.4 load" as one unit: it fits on the name's line or drops whole to the next, never split
  function tagsHtml(have, id) { var w = wt(id), p = IP(), bits = []; if (have) bits.push("you have " + have); if (w && p) bits.push(p.fmtLoad(w) + " load"); return bits.length ? '<span class="trd-tags">' + bits.join(" · ") + "</span>" : ""; }
  function cartLoad(t, s) {
    var p = IP(), ld = p ? p.loadOf(s) : null;
    if (!ld) return null;
    var delta = 0;
    Object.keys(cart.buy).forEach(function (id) { delta += wt(id) * cart.buy[id]; });
    Object.keys(cart.sell).forEach(function (id) { delta -= wt(id) * cart.sell[id]; });
    var coinNow = p.coinLoad(t.funds), coinAfter = p.coinLoad(Math.max(0, t.funds + t.credit - t.cost));
    var after = ld.total + delta + (coinAfter - coinNow);
    return { now: ld.total, after: after, capacity: ld.capacity, pct: p.penaltyPct(after, ld.capacity) };
  }

  function totals(trade, s, q) {
    var cost = 0, credit = 0, buying = 0, selling = 0;
    Object.keys(cart.buy).forEach(function (id) {
      cost += data().items[id].retail * cart.buy[id];
      buying += cart.buy[id];
    });
    Object.keys(cart.sell).forEach(function (id) {
      credit += unitPrice(id, trade.def.buyer) * cart.sell[id];
      selling += cart.sell[id];
    });
    if (q) { cost = q.buyTotal; credit = q.sellTotal; }
    var funds = purse(s);
    return { cost: cost, credit: credit, buying: buying, selling: selling, funds: funds, short: Math.max(0, cost - credit - funds) };
  }

  // The most of one good the cart can hold with the market still agreeing to it (stock, room on the shelf and the market's purse and appetite all count); with afford, also only what the player can pay for.
  // Feasibility only gets worse as the amount grows, so this is a binary search: a shelf of 500 costs about ten quotes, not 500. A sale that rounds to nothing is let through (a bigger lot is worth something).
  function marketMax(trade, st, kind, id, hard, afford) {
    var cur = cart[kind][id] || 0, best = cur, funds = purse(statsNow());
    function passable(n) {
      cart[kind][id] = n;
      var q = marketQuote(trade, st, cart);
      if (afford && funds + q.sellTotal < q.buyTotal) return false;
      return q.ok || (kind === "sell" && q.problems.length > 0 && q.problems.every(function (p) { return /worth nothing/.test(p); }));
    }
    if (hard > cur) {
      if (passable(hard)) best = hard;
      else { var lo = cur + 1, hi = hard - 1; while (lo <= hi) { var mid = (lo + hi) >> 1; if (passable(mid)) { best = mid; lo = mid + 1; } else hi = mid - 1; } }
    }
    if (cur) cart[kind][id] = cur; else delete cart[kind][id];
    return Math.max(best, cur);
  }

  // How much more of its purse an open market will spend on one good today (null for a shop, which has no appetite limit).
  function appetiteLeft(mk, id) {
    var d = mk.def, g = d.goods[id];
    if (!d.commodities || !d.appetite || !g || g.fixed) return null;
    var share = g.unstocked ? d.appetite.unstocked : d.appetite.stocked;
    return Math.max(0, Math.floor(share * num(d.purseTarget)) - window.Market.spentToday(mk.st, id));
  }

  // The price column of a market row: what the next unit costs or fetches, a marker when the market is dearer or cheaper than usual, the shelf, and the cart line's total.
  // What the + button would do to the price: the next unit's unrounded price, the average of the cart line, the ladder of the next units, and whether (and when) the price steps.
  function stepInfo(mk, id, kind, qty, line) {
    var lad = ladderOf(mk, kind, id, qty, 40), next = lad.length ? lad[0] : null, info = { next: next, first: null, delta: 0, slip: false, stepAt: 0, tip: "" };
    if (next === null) return info;
    var first = ladderOf(mk, kind, id, 0, 1)[0], r10 = function (v) { return Math.round(v * 10) / 10; };
    // adverse = dearer to buy, lower to sell. 'moved' is a rise or fall of at least 0.2c and 8 percent against the FIRST unit's price.
    var adverse = function (v) { return kind === "buy" ? v > first : v < first; };
    var moved = function (v) { return adverse(v) && Math.abs(r10(v) - r10(first)) >= 0.2 && Math.abs(v - first) / Math.max(0.1, Math.min(v, first)) >= 0.08; };
    info.first = first; info.delta = r10(next) - r10(first);
    if (qty > 0 && moved(next)) info.slip = true;
    if (!info.slip) for (var i = 1; i < lad.length; i++) if (moved(lad[i])) { info.stepAt = qty + 1 + i; break; }
    return info;
  }

  function marketPriceHtml(mk, id, it, line, qty, kind, info, limited) {
    var g = mk.def.goods[id], S = num(mk.st.stock[id]), next = info && info.next !== null ? info.next : null;
    var f = g.fixed ? 1 : window.Market.factor(S, g.target), wr = g.worldRatio || 1, mark = (f > 1.1 || wr > 1.1) ? ' <span class="trd-vs trd-vs-up">▲</span>' : ((f < 0.9 || wr < 0.9) ? ' <span class="trd-vs trd-vs-down">▼</span>' : "");
    var held = mk.st.resv && mk.st.resv[id] ? mk.st.resv[id].qty : 0;
    var shelf = kind === "buy" ? '<small class="trd-stock">' + (S > 0 ? S : "sold out") + (held ? " · " + Math.min(held, S) + " yours" : "") + "</small>"
      : '<small class="trd-stock">' + (g.fixed ? "" : (S > 0 ? S : "none")) + (limited && appetiteLeft(mk, id) !== null ? " · takes " + fmt(appetiteLeft(mk, id)) + " today" : "") + "</small>";
    var head = next === null ? (kind === "buy" ? "sold out" : "—") : (qty > 0 ? '<small class="trd-nextlabel">next</small> ' : "") + fmtUnit(next, kind);
    var avg = line && line.qty > 0 ? '<small class="trd-total">' + line.qty + " for " + fmt(line.total) + (line.qty > 1 ? " · avg " + fmtUnit(line.total / line.qty, kind) : "") + "</small>" : "";
    var bits = [];
    if (info && qty > 0 && Math.abs(info.delta) >= 0.1) bits.push('<span class="' + (info.slip ? "trd-slipnote-bad" : "trd-slipnote") + '">' + (info.delta > 0 ? "+" : "−") + Math.abs(info.delta).toFixed(1) + "c" + "</span>");
    if (info && info.stepAt && info.stepAt - qty <= 40) bits.push('<span class="trd-steps">' + (kind === "buy" ? "rises" : "falls") + " at unit " + info.stepAt + "</span>");
    var note = bits.length ? '<small class="trd-note">' + bits.join(" · ") + "</small>" : "";
    return '<span class="trd-now">' + head + mark + "</span>" + avg + note + shelf;
  }

  // The best price seen in another market, for a row: where, how long ago, and a nudge when it is clearly better there.
  function elsewhereHtml(el, kind, here) {
    if (!el || !el.best) return "";
    var b = el.best, better = here !== null && here !== undefined && (kind === "buy" ? b.v < here * 0.9 : b.v > here * 1.1);
    var when = (b.heard ? "heard " : "") + (b.age <= 0 ? "today" : b.age + "d ago" + (b.age > 20 ? " (old)" : ""));
    return '<div class="trd-known' + (better ? " trd-known-better" : "") + '">' + fmtUnit(b.v, kind) + " · " + esc(b.title) + " · " + when + (better ? (kind === "buy" ? " · cheaper" : " · pays more") : "") + "</div>";
  }

  /* ---- the hover card (2026-10-24): the combatant and condition cards' look (index.html #csTip), built inside the dialog because a modal dialog sits above everything else */
  var tipEl = null;
  function tipNode() { if (!tipEl) { tipEl = document.createElement("div"); tipEl.className = "trd-tip"; dlg.appendChild(tipEl); } return tipEl; }
  function hideTip() { if (tipEl) tipEl.classList.remove("on"); }
  function stray(pct, goodWhenHigh) {
    if (Math.abs(pct) < 2) return '<span class="tNeutral">about the usual</span>';
    var up = pct > 0, good = goodWhenHigh ? up : !up;
    return '<span class="' + (good ? "tGood" : "tBad") + '">' + (up ? "▲ " : "▼ ") + Math.abs(pct) + "% " + (up ? "above" : "below") + "</span>";
  }
  // The one named event (blight, bumper harvest, refugees...) driving this good's price at a tile today, if any: checked at the tile itself and the region ("*"), picked by world.js's own eventsAt.
  function eventWhy(id, tile) {
    if (!tile || !window.World || !window.World.eventsAt) return null;
    var list = window.World.eventsAt(num(statsNow().world_seed) || 1, today(), tile), i, j;
    for (i = 0; i < list.length; i++) for (j = 0; j < list[i].effects.length; j++) if (list[i].effects[j].goods.indexOf(id) >= 0) return list[i].name;
    return null;
  }
  // A short, one-line reason the price is where it is: a live event beats a guess, checked at the market's own tile and the good's biggest nearby maker; otherwise whichever of distance or local
  // demand is pulling harder away from normal. lv is the distance-only level (g.mult with the world's part of it divided back out, same trick trade.js already uses for "its usual rate here").
  function priceWhy(id, g, wr) {
    var maker = null, G = window.WORLD_DATA && g.world && window.WORLD_DATA.goods[id];
    if (G) { var c = G.consumers.filter(function (x) { return x.tile === g.world.tile; })[0], best = 0; if (c) Object.keys(c.s).forEach(function (t) { if (c.s[t] > best) { best = c.s[t]; maker = t; } }); }
    var ev = (maker && eventWhy(id, maker)) || eventWhy(id, g.world && g.world.tile);
    if (ev) return ev;
    var lv = g.mult / (wr || 1), distFar = Math.abs(lv - 1) >= Math.abs(wr - 1);
    if (distFar) return lv > 1 ? "far from the source" : "near the source";
    return wr > 1 ? "the town's own demand" : "a local glut";
  }
  function tipHtml(trade, mk, kind, id) {
    var s = statsNow(), it = data().items[id]; if (!it) return "";
    var g = mk ? mk.def.goods[id] : null, have = owned(id, s), bs = basisFor(id, s), base = g ? num(g.base) : num(it.retail);
    var out = '<div class="tHd">' + esc(it.title) + "</div>";
    out += '<div class="tMeta">Base cost <b>' + fmtUnit(base, "buy") + "</b> · you have <b>" + have + "</b>" + (bs ? " (paid an average " + fmtUnit(bs.t / 10, "buy") + ")" : "") + "</div>";
    if (mk && g) {
      var first = ladderOf(mk, kind, id, 0, 1)[0];
      if (first !== undefined && base > 0) {
        if (kind === "buy") out += '<div class="tRow"><span>Costs now</span><span><b>' + fmtUnit(first, "buy") + "</b> · " + stray(Math.round((first / base - 1) * 100), false) + " base</span></div>";
        else {
          var usual = base * (g.mult / (g.worldRatio || 1)) * num(g.buyPct, 0.5);
          out += '<div class="tRow"><span>Pays now</span><span><b>' + fmtUnit(first, "sell") + "</b> · " + Math.round(first / base * 100) + "% of base</span></div>";
          if (usual > 0) out += '<div class="tRow"><span>Its usual rate here</span><span><b>' + fmtUnit(usual, "sell") + "</b> · now " + stray(Math.round((first / usual - 1) * 100), true) + "</span></div>";
        }
      }
      // why the price is where it is: the world's supply and the shelf
      var wr = g.worldRatio || 1, sf = g.fixed ? 1 : window.Market.factor(num(mk.st.stock[id]), g.target);
      var dearC = kind === "buy" ? "tBad" : "tGood", cheapC = kind === "buy" ? "tGood" : "tBad";
      if (wr > 1.1) out += '<div class="tRow"><span>Supply</span><span class="' + dearC + '">short · higher than usual</span></div>';
      else if (wr < 0.9) out += '<div class="tRow"><span>Supply</span><span class="' + cheapC + '">plentiful · lower than usual</span></div>';
      var lv = g.mult / wr; // the Why row covers BOTH causes (distance alone can push the price a long way with no world-supply swing at all, e.g. a good that is simply far from its source)
      if (wr > 1.1 || wr < 0.9 || lv > 1.1 || lv < 0.9) out += '<div class="tRow"><span>Why</span><span>' + esc(priceWhy(id, g, wr)) + "</span></div>";
      if (!g.fixed) out += '<div class="tRow"><span>' + (kind === "buy" ? "On the shelf" : "Held here") + "</span><span><b>" + num(mk.st.stock[id]) + "</b></span></div>";
      if (sf > 1.1) out += '<div class="tRow"><span>Shelf</span><span class="' + dearC + '">thin</span></div>';
      else if (sf < 0.9) out += '<div class="tRow"><span>Shelf</span><span class="' + cheapC + '">well stocked</span></div>';
      if (kind === "buy") { var rs = elsewhere("sell", id, trade, s).best; if (rs && first !== undefined && rs.v >= first * 1.1) out += '<div class="tRow"><span>Pays more</span><span><b>' + esc(rs.title) + "</b> · " + fmtUnit(rs.v, "sell") + " <i>" + (rs.heard ? "heard " : "") + ageText(rs.age) + "</i></span></div>"; }
      var stops = lastStops(trade, s, 3), heard = lastStops(trade, s, 3, true);
      function stopRows(list, word) {
        list.forEach(function (st) {
          var p = st.p[id], a = p && p[0] !== null && p[0] !== undefined ? fmtUnit(p[0] / 10, "buy") : "—", b = p && p[1] !== null && p[1] !== undefined ? fmtUnit(p[1] / 10, "sell") : "—";
          out += '<div class="tRow"><span>' + esc(st.title) + ' <i>' + word + ageText(today() - st.d) + "</i></span><span>buy " + a + " · sell " + b + "</span></div>";
        });
      }
      out += '<div class="tSub">At your last stops</div>';
      if (!stops.length) out += '<div class="tText">No other market seen yet.</div>';
      stopRows(stops, "");
      if (heard.length) { out += '<div class="tSub">Word on the road</div>'; stopRows(heard, "heard "); }
    }
    return out;
  }
  function placeTip(x, y) {
    var t = tipNode(), r = t.getBoundingClientRect(), vw = window.innerWidth, vh = window.innerHeight, left = x + 16, top = y + 18, z = window.UI_ZOOM || 1;
    if (left + r.width > vw - 8) left = x - r.width - 14;
    if (left < 8) left = 8;
    if (top + r.height > vh - 8) top = y - r.height - 12;
    if (top < 8) top = 8;
    t.style.left = (left / z) + "px"; t.style.top = (top / z) + "px";
  }
  function onOver(ev) {
    var t = ev.target, hit = t && t.closest ? t.closest(".trd-price, .trd-name, .trd-icon") : null, row = hit ? hit.closest(".trd-row[data-tip]") : null;
    if (!row) return hideTip();
    var trade = currentTrade(); if (!trade) return hideTip();
    var bits = row.getAttribute("data-tip").split(":"), mk = marketOn(trade) ? { def: marketDef(trade), st: marketState(trade) } : null, html = tipHtml(trade, mk, bits[0], bits.slice(1).join(":"));
    if (!html) return hideTip();
    var n = tipNode(); n.innerHTML = html; placeTip(ev.clientX, ev.clientY); n.classList.add("on");
  }
  function onMove(ev) { if (tipEl && tipEl.classList.contains("on")) placeTip(ev.clientX, ev.clientY); }

  function renderStepper(kind, id, qty, max, slip, fit) {
    return '<span class="trd-step">' +
      '<button type="button" class="trd-btn" data-step="-1" data-kind="' + kind + '" data-id="' + esc(id) + '" data-max="' + max + '"' + (qty ? "" : " disabled") + ' aria-label="Fewer">−</button>' +
      '<span class="trd-qty' + (qty ? " trd-qty-on" : "") + '">' + qty + "</span>" +
      '<button type="button" class="trd-btn' + (slip ? " trd-btn-slip" : "") + '" data-step="1" data-kind="' + kind + '" data-id="' + esc(id) + '" data-max="' + max + '" data-fit="' + (fit === undefined ? max : fit) + '"' + (qty >= max ? " disabled" : "") + ' aria-label="More">+</button>' +
      "</span>";
  }

  function render() {
    if (!dlg) return;
    var s = statsNow(), trade = currentTrade();
    hideTip();
    if (!trade) { elBody.innerHTML = '<div class="trd-empty">There is nothing to trade here.</div>'; elFoot.innerHTML = ""; elTabs.innerHTML = ""; elControls.style.display = "none"; return; }
    if (view.key !== trade.key) { view.key = trade.key; view.tab = trade.def.buy.length ? "buy" : "sell"; view.category = ""; view.q = ""; view.sort = "group"; view.flags = {}; view.fold = {}; if (elSearch) elSearch.value = ""; cart = { buy: {}, sell: {} }; }

    elTitle.textContent = trade.def.title;
    var mk = marketOn(trade) ? { def: marketDef(trade), st: marketState(trade) } : null;
    elPurse.textContent = "Purse: " + fmt(purse(s)) + (mk ? " · " + trade.def.title + " holds " + fmt(mk.st.purse) : "") + (mk && num(s.trade_profit) ? " · Made from trading: " + signed(num(s.trade_profit)) : "");

    var buys = buyRows(trade, s), sells = sellRows(trade, s, mk && mk.st);
    // An open market (def.commodities) deals in every commodity, so a row shows only while the shelf holds some.
    if (mk) buys = buys.filter(function (r) { var g = mk.def.goods[r.id]; return g && g.sells !== false && (!mk.def.commodities || num(mk.st.stock[r.id]) > 0); });
    // Drop cart entries the state no longer supports (an item sold, coin spent elsewhere, stock changed).
    Object.keys(cart.buy).forEach(function (id) { if (!buys.some(function (r) { return r.id === id; })) delete cart.buy[id]; });
    Object.keys(cart.sell).forEach(function (id) {
      var row = sells.filter(function (r) { return r.id === id; })[0];
      if (!row) delete cart.sell[id]; else if (cart.sell[id] > row.have) cart.sell[id] = row.have;
    });

    var hasBuy = trade.def.buy.length > 0, hasSell = trade.def.sell.length > 0;
    var nBuy = 0, nSell = 0;
    Object.keys(cart.buy).forEach(function (id) { nBuy += cart.buy[id]; });
    Object.keys(cart.sell).forEach(function (id) { nSell += cart.sell[id]; });
    elTabs.style.display = (hasBuy && hasSell) ? "" : "none";
    elTabs.innerHTML = (hasBuy && hasSell)
      ? '<button type="button" class="trd-tab" data-tab="buy" aria-pressed="' + (view.tab === "buy") + '">Buy' + (nBuy ? "<small>" + nBuy + "</small>" : "") + "</button>" +
        '<button type="button" class="trd-tab" data-tab="sell" aria-pressed="' + (view.tab === "sell") + '">Sell' + (nSell ? "<small>" + nSell + "</small>" : "") + "</button>"
      : "";
    if (!hasBuy) view.tab = "sell";
    if (!hasSell) view.tab = "buy";

    // A unique piece (stack false: the magical dress, rings) you already own leaves the shelf until you sell it back, and a shelf never offers more than one of it.
    buys = buys.filter(function (r) { var it = data().items[r.id]; return !(it && !it.stack && it.kind !== "salvage" && owned(r.id, s) > 0); });
    var arranged = arrange(trade, mk, s, view.tab, view.tab === "buy" ? buys : sells);
    if (view.tab === "buy") buys = arranged.entries; else sells = arranged.entries;
    elControls.style.display = (hasBuy && hasSell) ? "" : "none";
    // the tools show once a tab is long enough to need them; the chips whenever there is more than one group
    var showTools = arranged.all > 7 || arranged.filtered;
    elTools.style.display = showTools ? "" : "none";
    if (showTools) {
      if (document.activeElement !== elSearch) elSearch.value = view.q;
      elSort.innerHTML = SORTS[view.tab].map(function (o) { return '<option value="' + o[0] + '"' + (arranged.sort === o[0] ? " selected" : "") + ">" + o[1] + "</option>"; }).join("");
      elFlags.innerHTML = flagList(view.tab, mk).map(function (f) { return '<button type="button" class="trd-chip trd-flag" data-flag="' + f[0] + '" aria-pressed="' + !!view.flags[f[0]] + '">' + f[1] + "</button>"; }).join("");
    }
    elCats.style.display = arranged.cats.length > 1 ? "" : "none";
    elRail.style.display = (showTools || arranged.cats.length > 1) ? "" : "none";
    elCats.innerHTML = arranged.cats.length > 1 ? '<button type="button" class="trd-chip" data-cat="" aria-pressed="' + !view.category + '">All <small>' + arranged.matched + "</small></button>" + arranged.cats.map(function (c) {
      return '<button type="button" class="trd-chip" data-cat="' + c.key + '" aria-pressed="' + (view.category === c.key) + '">' + CATEGORY_LABEL[c.key] + " <small>" + c.n + "</small></button>";
    }).join("") : "";

    var q = mk ? marketQuote(trade, mk.st, cart) : null;
    function lineOf(list, id) { var f = null; (list || []).forEach(function (l) { if (l.id === id) f = l; }); return f; }
    // the profit the book shows on what is in the sell cart that the player bought (units with a known cost only)
    var sumProfit = 0, profitN = 0;
    Object.keys(cart.sell).forEach(function (id) { var bs = basisFor(id, s), qn = cart.sell[id], ln = lineOf(q ? q.sell : [], id); if (!bs || !qn) return; var credit = ln ? ln.total : unitPrice(id, trade.def.buyer) * qn, m = Math.min(qn, bs.q); sumProfit += Math.round(credit * (m / qn) - m * bs.t / 10); profitN += m; });
    var html = "", hints = truthy(s.show_stat_hints);
    if (view.tab === "buy") {
      if (!arranged.all) html = '<div class="trd-empty">Nothing on the racks right now.</div>';
      else if (!buys.length) html = noMatchHtml();
      buys.forEach(function (r) {
        if (r.head) { html += headHtml(r); return; }
        var it = data().items[r.id], have = owned(r.id, s), qty = cart.buy[r.id] || 0;
        var bl = lineOf(q ? q.buy : [], r.id), info = mk ? stepInfo(mk, r.id, "buy", qty, bl) : null;
        var many = it.stack || it.kind === "salvage", bcap = many ? (mk ? num((mk.st.stock || {})[r.id]) : 99) : 1, bmax = mk ? marketMax(trade, mk.st, "buy", r.id, bcap) : bcap, bfit = mk ? marketMax(trade, mk.st, "buy", r.id, bmax, true) : bmax;
        var bs = have ? basisFor(r.id, s) : null, el = mk ? elsewhere("buy", r.id, trade, s) : null;
        html += '<div class="trd-row' + (qty ? " trd-row-on" : "") + '" data-tip="buy:' + esc(r.id) + '">' +
          tradeIcon(r.id, it) +
          '<div class="trd-main">' +
            '<div class="trd-name">' + esc(it.title) + (it.slot ? '<span class="trd-slot">' + esc(it.slot) + "</span>" : "") + tagsHtml(have, r.id) + "</div>" +
            (hints && it.hint ? '<div class="trd-meta">' + esc(it.hint) + "</div>" : "") +
            (r.warn ? '<div class="trd-warn">' + esc(r.warn) + "</div>" : "") +
            (wearingLine(r.id, it, s) ? '<div class="trd-worn">' + esc(wearingLine(r.id, it, s)) + "</div>" : "") +
            (bs ? '<div class="trd-basis">Paid avg ' + fmtUnit(bs.t / 10, "buy") + "</div>" : "") +
            elsewhereHtml(el, "buy", info ? info.next : null) +
          "</div>" +
          '<div class="trd-price">' + (mk ? marketPriceHtml(mk, r.id, it, bl, qty, "buy", info) : fmt(it.retail)) + "</div>" +
          renderStepper("buy", r.id, qty, bmax, info && info.slip, bfit) +
        "</div>";
      });
    } else {
      if (!arranged.all) html = '<div class="trd-empty">You have nothing this buyer wants.</div>';
      else {
        if (sellBonus() > 0) html += '<div class="trd-bonus">Your Charisma earns you ' + sellBonus() + '% more on everything you sell.</div>';
        if (!sells.length) html += noMatchHtml();
      }
      sells.forEach(function (r) {
        if (r.head) { html += headHtml(r); return; }
        var it = data().items[r.id], qty = cart.sell[r.id] || 0, worn = isWorn(r.id, s);
        var sl = lineOf(q ? q.sell : [], r.id), info = mk ? stepInfo(mk, r.id, "sell", qty, sl) : null, bs = basisFor(r.id, s), el = mk ? elsewhere("sell", r.id, trade, s) : null;
        var smax = mk ? marketMax(trade, mk.st, "sell", r.id, r.have) : r.have, limited = !!mk && smax < r.have;
        var basisHtml = "";
        if (bs) {
          var credit = sl ? sl.total : r.unit * qty, m = Math.min(qty, bs.q), prof = qty > 0 ? Math.round(credit * (m / qty) - m * bs.t / 10) : 0;
          basisHtml = '<div class="trd-basis">Paid avg ' + fmtUnit(bs.t / 10, "buy") + (qty > 0 ? ' · <span class="' + (prof >= 0 ? "trd-profit-pos" : "trd-profit-neg") + '">' + signed(prof) + "</span>" : "") + "</div>";
        }
        var note = "";
        if (worn && qty >= r.have && it.kind !== "salvage") note = "Selling your last one puts you back in your starting gear.";
        html += '<div class="trd-row' + (qty ? " trd-row-on" : "") + '" data-tip="sell:' + esc(r.id) + '">' +
          tradeIcon(r.id, it) +
          '<div class="trd-main">' +
            '<div class="trd-name">' + esc(it.title) + (it.slot ? '<span class="trd-slot">' + esc(it.slot) + "</span>" : "") + tagsHtml(r.have, r.id) +
              (worn ? '<span class="trd-badge">worn</span>' : "") + "</div>" +
            (note ? '<div class="trd-warn">' + esc(note) + "</div>" : "") +
            basisHtml +
            elsewhereHtml(el, "sell", info ? info.next : null) +
          "</div>" +
          '<div class="trd-price trd-price-sell">' + (mk ? marketPriceHtml(mk, r.id, it, sl, qty, "sell", info, limited) : fmt(r.unit) + (it.kind === "salvage" ? " each" : "")) + "</div>" +
          renderStepper("sell", r.id, qty, smax, info && info.slip) +
        "</div>";
      });
    }
    elBody.innerHTML = html;

    var t = totals(trade, s, q), lines = "";
    // The footer is a short summary (what the cart costs or fetches, the purse after, the load) beside the buttons; the market's own purse is in the header and the counts are on the tabs.
    if (t.buying) lines += '<div class="trd-line"><span>Buying</span><span>−' + fmt(t.cost) + "</span></div>";
    if (t.selling) lines += '<div class="trd-line"><span>Selling</span><span>+' + fmt(t.credit) + "</span></div>";
    if (t.selling && profitN) lines += '<div class="trd-line trd-line-profit"><span>Profit on the ' + profitN + ' you bought</span><span class="' + (sumProfit >= 0 ? "trd-profit-pos" : "trd-profit-neg") + '">' + signed(sumProfit) + "</span></div>";
    if (!t.buying && !t.selling) lines = '<div class="trd-line trd-line-idle trd-wide"><span>Set some items aside to trade.</span></div>';
    else {
      // 2026-10-25 (the user): a cart the purse cannot cover shows a negative "Purse after" in red instead of a second, full-width "Not enough coin" line that moved the footer; Confirm is disabled the same way.
      var after = t.funds + t.credit - t.cost;
      lines += '<div class="trd-line trd-line-net' + (after < 0 ? " trd-neg" : "") + '"><span>Purse after</span><span>' + (after < 0 ? "−" : "") + fmt(Math.abs(after)) + "</span></div>";
    }
    if (q && !q.ok) lines += '<div class="trd-line trd-line-bad trd-wide"><span>' + esc(q.problems.map(function (p) { var m = /the purse is short by (\d+) copper/.exec(p); return m ? trade.def.title + " cannot pay that much: short " + fmt(Number(m[1])) : p; })[0]) + "</span><span></span></div>";
    var cl = (t.buying || t.selling) ? cartLoad(t, s) : null;
    if (cl) {
      var f = IP().fmtLoad, over = cl.after > cl.capacity;
      lines += '<div class="trd-line trd-line-load' + (over ? " trd-neg" : "") + '"><span>Load</span><span>' + f(cl.now) + " → " + f(cl.after) + " of " + f(cl.capacity) + "</span></div>";
      // 2026-10-25 (the user): going over the limit is shown by the Load line turning red, in its own slot; no second "Over your limit" line.
    }
    var can = (t.buying || t.selling) && !t.short && (!q || q.ok) && !view.pending;
    if (elReceipt) { elReceipt.textContent = view.receipt || ""; elReceipt.hidden = !view.receipt; }
    elFoot.innerHTML = '<div class="trd-sum">' + lines + "</div>" +
      '<div class="trd-actions">' +
        '<button type="button" class="trd-clear" data-act="clear"' + ((t.buying || t.selling) ? "" : " disabled") + ">Clear</button>" +
        '<button type="button" class="trd-confirm" data-act="confirm"' + (can ? "" : " disabled") + ">Confirm trade</button>" +
      "</div>";
  }

  // The counter shops that settle in place too (the user, 2026-11-02: the tailor and the pawnshop first, then every other shop). Each needs its cart-pass label named in choicescript_stats.txt ctn_pass.
  var QUIET_SHOPS = { halda: true, ambrose: true, hollis: true, vael: true, tailor: true, inklamp: true, jeweler: true, pawn: true, works: true, tmstore: true, tomlin: true, lgstore: true, afstore: true, torvald: true, trapper: true, hideyard: true };

  // Settle the cart the panel has just written into the stats, in place: the page behind stays untouched, the result goes in the receipt strip, and the page is rebuilt once when the panel closes.
  function quietSettle() {
    cart = { buy: {}, sell: {} };
    view.pending = true; view.receipt = "";
    render();
    window.GameQuietRun("codex_trade_now", function (ok) {
      var st = statsNow(), msg = String(st.trade_toast || "");
      st.trade_toast = "";
      view.pending = false;
      view.receipt = msg || (ok ? "" : "That did not finish. Try again.");
      view.dirty = true;
      if (dlg && dlg.open) render();
    });
  }

  function confirm() {
    var trade = currentTrade(), settle = findSettle();
    if (!trade || !settle) return;
    var s = statsNow();
    // An open market is settled WITHOUT a page change (2026-11-02, the user: the panel must not force-close on purchase, and the receipt belongs in the panel, as with crafting). ChoiceScript still does
    // all the work (choicescript_stats codex_trade_now, run by inventory.js quietRun); a counter shop keeps the hidden-option route below.
    var quiet = (marketOn(trade) || QUIET_SHOPS[trade.key]) && typeof window.GameQuietRun === "function";
    if (quiet && view.pending) return;
    if (quiet && (s.hunger_stage === "Starving" || s.fatigue_stage === "Collapsing") && num(s.hp_current) <= 2) {
      view.receipt = "You are too starved and spent to bargain for the time it takes without it costing what little you have left. Eat, or sleep, first.";
      render();
      return;
    }
    if (marketOn(trade)) {
      var mkt = marketState(trade), mq = marketQuote(trade, mkt, cart);
      if (!mq.ok || purse(s) + mq.sellTotal < mq.buyTotal) return;
      s["market_" + trade.key] = window.Market.serialize(window.Market.commit(mkt, marketDef(trade), mq, today()));
      s.market_cost = mq.buyTotal; s.market_credit = mq.sellTotal; s.market_on = true;
      // the trade book: what was paid for the units now held, the profit on units sold that had a known cost, and the prices seen here after the trade
      var basis = parseBasis(s.trade_basis), prof = num(s.trade_profit);
      mq.sell.forEach(function (l) { var b = basis[l.id]; if (!b) return; var bq = Math.min(b.q, owned(l.id, s)), m = Math.min(l.qty, bq); if (m > 0) prof += Math.round(l.total * (m / l.qty) - m * b.t / 10); b.q = Math.max(0, bq - l.qty); });
      mq.buy.forEach(function (l) { var b = basis[l.id] || { q: 0, t: 0 }, bq = Math.min(b.q, owned(l.id, s)), nq = bq + l.qty; b.t = (bq * b.t + l.total * 10) / nq; b.q = nq; basis[l.id] = b; });
      s.trade_basis = serializeBasis(basis); s.trade_profit = prof;
      if (isOpenMarket(trade)) remember(trade, { def: marketDef(trade), st: window.Market.parse(s["market_" + trade.key]) });
    }
    // Every cart starts from zero so a stale entry can never ride along; the game clears them again when it settles.
    Object.keys(s).forEach(function (k) { if (k.indexOf("cart_buy_") === 0 || k.indexOf("cart_sell_") === 0) s[k] = 0; });
    Object.keys(cart.buy).forEach(function (id) { if (("cart_buy_" + id) in s) s["cart_buy_" + id] = cart.buy[id]; });
    Object.keys(cart.sell).forEach(function (id) { if (("cart_sell_" + id) in s) s["cart_sell_" + id] = cart.sell[id]; });
    // the goods in the cart, for the shared cart routine (equipment.txt shop_cart_run)
    s.cart_buy_ids = Object.keys(cart.buy).filter(function (id) { return ("cart_buy_" + id) in s && cart.buy[id] > 0; }).map(function (id) { return "|" + id; }).join("");
    s.cart_sell_ids = Object.keys(cart.sell).filter(function (id) { return ("cart_sell_" + id) in s && cart.sell[id] > 0; }).map(function (id) { return "|" + id; }).join("");
    if (s.cart_buy_ids) s.cart_buy_ids += "|";
    if (s.cart_sell_ids) s.cart_sell_ids += "|";
    if (quiet) { quietSettle(); return; }
    var radio = settle.querySelector("input[type=radio]");
    if (!radio) return;
    var form = radio.form;
    cart = { buy: {}, sell: {} };
    reopen = false; // the panel stays closed after a trade (the user, 2026-11-02): the result page and the market page come back clean, and T or the Trade button opens it again
    confirmedLabel = settle;
    close();
    radio.checked = true;
    if (form && typeof form.onsubmit === "function") form.onsubmit();
  }

  function onClick(ev) {
    var t = ev.target;
    while (t && t !== dlg && !(t.getAttribute && (t.hasAttribute("data-act") || t.hasAttribute("data-tab") || t.hasAttribute("data-step") || t.hasAttribute("data-cat") || t.hasAttribute("data-flag") || t.hasAttribute("data-fold")))) t = t.parentNode;
    if (!t || t === dlg) return;
    if (t.hasAttribute("data-tab")) { view.tab = t.getAttribute("data-tab"); view.category = ""; render(); return; }
    if (t.hasAttribute("data-cat")) { view.category = t.getAttribute("data-cat"); render(); return; }
    if (t.hasAttribute("data-flag")) { var fk = t.getAttribute("data-flag"); view.flags[fk] = !view.flags[fk]; render(); return; }
    if (t.hasAttribute("data-fold")) { toggleFold(t.getAttribute("data-fold")); return; }
    if (t.hasAttribute("data-step")) {
      if (t.disabled) return;
      var kind = t.getAttribute("data-kind"), id = t.getAttribute("data-id"), max = num(t.getAttribute("data-max"));
      // Ctrl (or Cmd) on + takes the most that can be afforded (Ctrl on - empties the line); Alt moves ten
      if (ev.ctrlKey || ev.metaKey) setQty(kind, id, t.getAttribute("data-step") === "1" ? num(t.getAttribute("data-fit")) : 0, max);
      else setQty(kind, id, (cart[kind][id] || 0) + num(t.getAttribute("data-step")) * (ev.altKey ? 10 : 1), max);
      render();
      return;
    }
    var act = t.getAttribute("data-act");
    if (act === "close") return close();
    if (act === "clear") { cart = { buy: {}, sell: {} }; view.receipt = ""; render(); return; }
    if (act === "resetfilters") { view.q = ""; view.flags = {}; view.category = ""; if (elSearch) elSearch.value = ""; render(); return; }
    if (act === "confirm") { if (!t.disabled) confirm(); }
  }

  function toggleFold(cat) { var k = view.tab + ":" + cat; view.fold[k] = !view.fold[k]; render(); }
  function onChange(ev) {
    var t = ev.target;
    if (t && t.getAttribute && t.getAttribute("data-act") === "sort") { view.sort = t.value; render(); }
  }
  function onInput(ev) {
    var t = ev.target;
    if (t && t.getAttribute && t.getAttribute("data-act") === "search") { view.q = t.value; render(); }
  }

  function open() {
    if (!isActive()) return;
    build();
    if (dlg.open) return;
    view.receipt = "";
    var tr0 = currentTrade(); if (isOpenMarket(tr0)) remember(tr0, { def: marketDef(tr0), st: marketState(tr0) });
    render();
    if (!dlg.showModal) { window.alert("This browser is too old to show the Trade panel."); return; }
    dlg.showModal();
  }
  function close() { if (dlg && dlg.open) dlg.close(); }
  function toggle() { if (dlg && dlg.open) close(); else open(); }

  TP.open = open;
  TP.close = close;
  TP.toggle = toggle;
  TP.isActive = isActive;
  TP._state = function () { return { reopen: reopen, built: !!dlg, open: !!(dlg && dlg.open) }; };
  TP._tipHtml = function (kind, id) { var tr = currentTrade(); return tr ? tipHtml(tr, marketOn(tr) ? { def: marketDef(tr), st: marketState(tr) } : null, kind, id) : ""; };   // for the browser tests
  TP.title = function () { var t = currentTrade(); return t ? t.def.title : ""; };
  TP.active = isActive;   // citytravel.js leaves T to the trade panel on a page where one is active

  /* ------------------------------------------------------------------ keeping the page in step */

  // The settle option is an implementation detail: hide it while the panel exists, show the Trade button, and
  // (The panel used to reopen itself after every trade; the user found closing it again a nuisance, 2026-11-02, so it now waits for T or the Trade button.)
  var scanQueued = false;

  // style.css rounds the choice box with .choice > div:first-child / :last-child. Hiding the settle row leaves
  // that row as a (hidden) first or last child, so the visible edge loses its border and rounding. Tag the
  // first and last VISIBLE rows so trade.css can draw those edges instead.
  function fixChoiceEdges(box) {
    var rows = box ? box.children : [], first = null, last = null, i;
    for (i = 0; i < rows.length; i++) {
      if (rows[i].style.display === "none") continue;
      if (!first) first = rows[i];
      last = rows[i];
    }
    for (i = 0; i < rows.length; i++) {
      rows[i].classList.toggle("trd-first-visible", rows[i] === first && rows[0] !== first);
      rows[i].classList.toggle("trd-last-visible", rows[i] === last && rows[rows.length - 1] !== last);
    }
  }

  function scan() {
    scanQueued = false;
    var settle = findSettle(), s = statsNow();
    if (settle && settle.parentNode) {
      if (settle.parentNode.style.display !== "none") settle.parentNode.style.display = "none";
      fixChoiceEdges(settle.parentNode.parentNode);
    }
    var active = !!(settle && currentTrade());
    var btn = document.getElementById("tradeButton");
    if (btn) btn.style.display = active ? "" : "none";
    if (!s.shop_open) reopen = false;
    if (active && reopen && settle !== confirmedLabel && !(dlg && dlg.open)) { reopen = false; confirmedLabel = null; open(); }
    if (!active && dlg && dlg.open) close();
    var bar = document.getElementById("invTradeBar");
    if (bar) bar.style.display = active ? "" : "none";
  }
  function queueScan() { if (!scanQueued) { scanQueued = true; window.requestAnimationFrame(scan); } }

  function start() {
    if (window.MutationObserver) new MutationObserver(queueScan).observe(document.body, { childList: true, subtree: true });
    window.setInterval(scan, 700); // safety net: stats can change without touching the DOM
    scan();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();

  // T opens the panel from the game page, like I for the inventory and the lorebook's own keys.
  document.addEventListener("keydown", function (ev) {
    if (ev.ctrlKey || ev.metaKey || ev.altKey) return;
    if (dlg && dlg.open) return;
    var tag = ev.target && ev.target.tagName ? ev.target.tagName.toLowerCase() : "";
    if (tag === "input" || tag === "textarea" || tag === "select") return;
    if (document.querySelector("dialog[open]")) return;
    if ((ev.key === "t" || ev.key === "T") && isActive()) { ev.preventDefault(); open(); }
  });
})();
