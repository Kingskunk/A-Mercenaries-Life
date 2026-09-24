/*
 * TRADE PANEL -- a quality-of-life layer over the shop menus, not a replacement for them.
 *
 * A shop page that supports it tells us so through the game's own state: stats.shop_open names the trade
 * ("halda", "pawn"), stats.shop_rows lists the buy rows with their live warnings, and the page carries a hidden
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

  // What ONE unit fetches from this trade's buyer. Mirrors equipment.txt gear_unit_value (floor of retail * pct).
  function unitPrice(id, buyer) {
    var it = data().items[id];
    if (!it) return 0;
    var sl = it.sell;
    var pct = buyer === "smith" ? sl.smith : sl.pawn;
    var v = Math.floor((it.retail * pct) / 100);
    if (buyer === "pawn" && sl.pawnFixed > 0) v = sl.pawnFixed;
    if (buyer === "smith" && sl.smithPiece > 0) v = sl.smithPiece;
    return v;
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
    String(s.shop_rows || "").split("|").forEach(function (chunk) {
      if (!chunk) return;
      var at = chunk.indexOf("~");
      var id = at < 0 ? chunk : chunk.slice(0, at);
      if (data().items[id] && trade.def.buy.indexOf(id) !== -1) out.push({ id: id, warn: at < 0 ? "" : chunk.slice(at + 1) });
    });
    return out;
  }

  function sellRows(trade, s) {
    var out = [];
    trade.def.sell.forEach(function (id) {
      var n = owned(id, s), unit = unitPrice(id, trade.def.buyer);
      if (n > 0 && unit > 0) out.push({ id: id, have: n, unit: unit });
    });
    return out;
  }

  /* ------------------------------------------------------------------ DOM */

  if (typeof document === "undefined") return; // node tests stop here (mirrors inventory.js)

  var dlg, elTitle, elPurse, elBody, elFoot, elTabs;
  var view = { key: "", tab: "buy" };
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
      '<div class="trd-tabs"></div>' +
      '<div class="trd-body"></div>' +
      '<div class="trd-foot"></div>';
    document.body.appendChild(dlg);
    elTitle = dlg.querySelector(".trd-title");
    elPurse = dlg.querySelector(".trd-purse");
    elTabs = dlg.querySelector(".trd-tabs");
    elBody = dlg.querySelector(".trd-body");
    elFoot = dlg.querySelector(".trd-foot");
    dlg.addEventListener("click", onClick);
    // Keep typing from reaching the game's own hotkeys (1-9, J/K...) while this panel is up.
    dlg.addEventListener("keydown", function (ev) {
      ev.stopPropagation();
      if (ev.key === "Escape") return; // let the dialog's native close run
    });
    dlg.addEventListener("mousedown", function (ev) { if (ev.target === dlg) close(); });
    dlg.addEventListener("close", function () { render(); });
  }

  function setQty(kind, id, n, max) {
    n = Math.max(0, Math.min(max, n));
    if (n) cart[kind][id] = n; else delete cart[kind][id];
  }

  function totals(trade, s) {
    var cost = 0, credit = 0, buying = 0, selling = 0;
    Object.keys(cart.buy).forEach(function (id) {
      cost += data().items[id].retail * cart.buy[id];
      buying += cart.buy[id];
    });
    Object.keys(cart.sell).forEach(function (id) {
      credit += unitPrice(id, trade.def.buyer) * cart.sell[id];
      selling += cart.sell[id];
    });
    var funds = purse(s);
    return { cost: cost, credit: credit, buying: buying, selling: selling, funds: funds, short: Math.max(0, cost - credit - funds) };
  }

  function renderStepper(kind, id, qty, max) {
    return '<span class="trd-step">' +
      '<button type="button" class="trd-btn" data-step="-1" data-kind="' + kind + '" data-id="' + esc(id) + '" data-max="' + max + '"' + (qty ? "" : " disabled") + ' aria-label="Fewer">−</button>' +
      '<span class="trd-qty' + (qty ? " trd-qty-on" : "") + '">' + qty + "</span>" +
      '<button type="button" class="trd-btn" data-step="1" data-kind="' + kind + '" data-id="' + esc(id) + '" data-max="' + max + '"' + (qty >= max ? " disabled" : "") + ' aria-label="More">+</button>' +
      "</span>";
  }

  function render() {
    if (!dlg) return;
    var s = statsNow(), trade = currentTrade();
    if (!trade) { elBody.innerHTML = '<div class="trd-empty">There is nothing to trade here.</div>'; elFoot.innerHTML = ""; elTabs.innerHTML = ""; return; }
    if (view.key !== trade.key) { view.key = trade.key; view.tab = trade.def.buy.length ? "buy" : "sell"; cart = { buy: {}, sell: {} }; }

    elTitle.textContent = trade.def.title;
    elPurse.textContent = "Purse: " + fmt(purse(s));

    var buys = buyRows(trade, s), sells = sellRows(trade, s);
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

    var html = "", hints = truthy(s.show_stat_hints);
    if (view.tab === "buy") {
      if (!buys.length) html = '<div class="trd-empty">Nothing on the racks right now.</div>';
      buys.forEach(function (r) {
        var it = data().items[r.id], have = owned(r.id, s), qty = cart.buy[r.id] || 0;
        html += '<div class="trd-row' + (qty ? " trd-row-on" : "") + '">' +
          '<div class="trd-main">' +
            '<div class="trd-name">' + esc(it.title) + (have ? '<span class="trd-have">you have ' + have + "</span>" : "") + "</div>" +
            (hints && it.hint ? '<div class="trd-meta">' + esc(it.hint) + "</div>" : "") +
            (r.warn ? '<div class="trd-warn">' + esc(r.warn) + "</div>" : "") +
          "</div>" +
          '<div class="trd-price">' + fmt(it.retail) + "</div>" +
          renderStepper("buy", r.id, qty, 20) +
        "</div>";
      });
    } else {
      if (!sells.length) html = '<div class="trd-empty">You have nothing this buyer wants.</div>';
      sells.forEach(function (r) {
        var it = data().items[r.id], qty = cart.sell[r.id] || 0, worn = isWorn(r.id, s);
        var note = "";
        if (worn && qty >= r.have && it.kind !== "salvage") note = "Selling your last one puts you back in your starting gear.";
        html += '<div class="trd-row' + (qty ? " trd-row-on" : "") + '">' +
          '<div class="trd-main">' +
            '<div class="trd-name">' + esc(it.title) + '<span class="trd-have">you have ' + r.have + "</span>" +
              (worn ? '<span class="trd-badge">worn</span>' : "") + "</div>" +
            (note ? '<div class="trd-warn">' + esc(note) + "</div>" : "") +
          "</div>" +
          '<div class="trd-price trd-price-sell">' + fmt(r.unit) + (it.kind === "salvage" ? " each" : "") + "</div>" +
          renderStepper("sell", r.id, qty, r.have) +
        "</div>";
      });
    }
    elBody.innerHTML = html;

    var t = totals(trade, s), lines = "";
    if (t.buying) lines += '<div class="trd-line"><span>Buying ' + t.buying + (t.buying === 1 ? " item" : " items") + '</span><span>−' + fmt(t.cost) + "</span></div>";
    if (t.selling) lines += '<div class="trd-line"><span>Selling ' + t.selling + (t.selling === 1 ? " item" : " items") + '</span><span>+' + fmt(t.credit) + "</span></div>";
    if (!t.buying && !t.selling) lines = '<div class="trd-line trd-line-idle"><span>Set some items aside to trade.</span></div>';
    else if (t.short) lines += '<div class="trd-line trd-line-bad"><span>Not enough coin</span><span>short ' + fmt(t.short) + "</span></div>";
    else lines += '<div class="trd-line trd-line-net"><span>Purse after</span><span>' + fmt(t.funds + t.credit - t.cost) + "</span></div>";
    var can = (t.buying || t.selling) && !t.short;
    elFoot.innerHTML = lines +
      '<div class="trd-actions">' +
        '<button type="button" class="trd-clear" data-act="clear"' + ((t.buying || t.selling) ? "" : " disabled") + ">Clear</button>" +
        '<button type="button" class="trd-confirm" data-act="confirm"' + (can ? "" : " disabled") + ">Confirm trade</button>" +
      "</div>";
  }

  function confirm() {
    var trade = currentTrade(), settle = findSettle();
    if (!trade || !settle) return;
    var s = statsNow();
    // Every cart starts from zero so a stale entry can never ride along; the game clears them again when it settles.
    Object.keys(s).forEach(function (k) { if (k.indexOf("cart_buy_") === 0 || k.indexOf("cart_sell_") === 0) s[k] = 0; });
    Object.keys(cart.buy).forEach(function (id) { if (("cart_buy_" + id) in s) s["cart_buy_" + id] = cart.buy[id]; });
    Object.keys(cart.sell).forEach(function (id) { if (("cart_sell_" + id) in s) s["cart_sell_" + id] = cart.sell[id]; });
    var radio = settle.querySelector("input[type=radio]");
    if (!radio) return;
    var form = radio.form;
    cart = { buy: {}, sell: {} };
    reopen = true;
    confirmedLabel = settle;
    close();
    radio.checked = true;
    if (form && typeof form.onsubmit === "function") form.onsubmit();
  }

  function onClick(ev) {
    var t = ev.target;
    while (t && t !== dlg && !(t.getAttribute && (t.hasAttribute("data-act") || t.hasAttribute("data-tab") || t.hasAttribute("data-step")))) t = t.parentNode;
    if (!t || t === dlg) return;
    if (t.hasAttribute("data-tab")) { view.tab = t.getAttribute("data-tab"); render(); return; }
    if (t.hasAttribute("data-step")) {
      if (t.disabled) return;
      var kind = t.getAttribute("data-kind"), id = t.getAttribute("data-id"), max = num(t.getAttribute("data-max"));
      setQty(kind, id, (cart[kind][id] || 0) + num(t.getAttribute("data-step")), max);
      render();
      return;
    }
    var act = t.getAttribute("data-act");
    if (act === "close") return close();
    if (act === "clear") { cart = { buy: {}, sell: {} }; render(); return; }
    if (act === "confirm") { if (!t.disabled) confirm(); }
  }

  function open() {
    if (!isActive()) return;
    build();
    if (dlg.open) return;
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
  TP.title = function () { var t = currentTrade(); return t ? t.def.title : ""; };

  /* ------------------------------------------------------------------ keeping the page in step */

  // The settle option is an implementation detail: hide it while the panel exists, show the Trade button, and
  // reopen the panel after a trade so several purchases in a row do not need a trip to the header each time.
  var scanQueued = false;
  function scan() {
    scanQueued = false;
    var settle = findSettle(), s = statsNow();
    if (settle && settle.parentNode && settle.parentNode.style.display !== "none") settle.parentNode.style.display = "none";
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
