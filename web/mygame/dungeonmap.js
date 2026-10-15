/*
 * DUNGEON MAP (2026-10-02) -- the map of a dungeon the player has explored, drawn as SVG from the game's own state. It decides nothing: ChoiceScript writes
 * dg_seen_<node> (the player stood there WITH LIGHT, so a character in the dark does not update it) and dg_mark_<node> (they chalked it), both kept between runs,
 * and this file draws them. What it shows (option C, agreed with the user):
 *   - a place the player has seen is drawn faint (remembered), a place they chalked is drawn solid with a chalk cross;
 *   - a way between two seen places is a line; a way out of a seen place into one not seen yet is a short dashed stub ending in "?";
 *   - the player's own position is ringed while a run is on (stats.dg_in_run).
 * Nothing about an unexplored place is drawn, not even its name, and the picture only grows as the player explores.
 *
 * The LAYOUT of each dungeon (positions in grid cells, east and south positive, and the list of ways between places) is the one thing the map owns that ChoiceScript also knows: the scene files' exits.
 * It lives in web/mygame/dungeons/<id>.js, and tools/check_dungeon_map.js compares it with the scene, so a changed exit that is not changed there fails that check.
 *
 * THE MAP IN THE PAGE (2026-10-14): while a run is on and the page offers moves, the same drawing is shown above the page's options and is the way to move (see "the map in the page" below); the Map button and the M key still open it in a window.
 * Open with the Map button on the rail or the M key. Both are there only while a dungeon run is on (stats.dg_in_run) and something has been mapped; the map itself is kept for the next visit.
 */
(function () {
  "use strict";

  var DM = window.DungeonMap = window.DungeonMap || {};

  // The layouts live one per dungeon in web/mygame/dungeons/<id>.js, which add themselves to DM.maps under the value of stats.dg_table. This file never names a dungeon.
  var MAPS = DM.maps = DM.maps || {};

  var CELL = 120;   // SVG units per grid cell
  var lastBounds = null;   // the extent of what svgFor last drew, in SVG units (the in-page map's "All" button fits it)

  function truthy(v) { return v === true || v === "true"; }
  function num(v) { var n = Number(v); return isFinite(n) ? n : 0; }
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function statsNow() { return window.stats || {}; }

  function mapFor(s) { return MAPS[s.dg_table] || null; }
  // An edge may carry a third element, a stat that must be true for the way to exist (a hidden trail revealed by an event): the map neither draws it, nor offers a stub for it, nor walks through it until then.
  function liveEdge(s, e) { return !e[2] || truthy(s[e[2]]); }
  function marked(s, id) { return truthy(s["dg_mark_" + id]); }
  function seen(s, id) { return truthy(s["dg_seen_" + id]) || marked(s, id); }

  // Has the player mapped anything at all in this dungeon?
  DM.hasAny = function () {
    var s = statsNow(), m = mapFor(s);
    if (!m) return false;
    for (var id in m.nodes) if (seen(s, id)) return true;
    return false;
  };
  // Is the map there to open? Only inside a dungeon run, and once something has been mapped: this is what the rail button and the M key follow. dg_in_run is cleared by every
  // way out of a dungeon (dungeon.txt dg_run_end), so the button goes when the player climbs out, while the map itself stays for the next run.
  DM.available = function () { return truthy(statsNow().dg_in_run) && DM.hasAny(); };

  /* ---------------------------------------------------------------- drawing */

  function svgFor(s) {
    var m = mapFor(s);
    if (!m) return "";
    var here = truthy(s.dg_in_run) ? s.dg_pos : "";
    var show = {};
    Object.keys(m.nodes).forEach(function (id) { if (seen(s, id)) show[id] = true; });
    // The place the player stands in is always on the map, so there is always something to click. If it was never mapped (the player has no light to see it by), it is drawn as a plain
    // dot with no name and is not recorded: the map still does not learn a place in the dark.
    var blind = "";
    if (here && m.nodes[here] && !show[here]) { show[here] = true; blind = here; }
    var edgesHtml = "", stubsHtml = "", nodesHtml = "", pts = [];

    m.edges.forEach(function (e) {
      if (!liveEdge(s, e)) return;
      var a = m.nodes[e[0]], b = m.nodes[e[1]], sa = !!show[e[0]], sb = !!show[e[1]];
      if (sa && sb) {
        edgesHtml += '<line class="dm-edge' + (marked(s, e[0]) && marked(s, e[1]) ? " dm-edge-hot" : "") + '" x1="' + a.x * CELL + '" y1="' + a.y * CELL + '" x2="' + b.x * CELL + '" y2="' + b.y * CELL + '"/>';
      } else if (sa || sb) {
        // a way out of a seen place into one the player has not seen: a short dashed stub toward it, ending in a question mark
        var from = sa ? a : b, to = sa ? b : a, toId = sa ? e[1] : e[0];
        var dx = to.x - from.x, dy = to.y - from.y, len = Math.sqrt(dx * dx + dy * dy) || 1;
        var x1 = from.x * CELL, y1 = from.y * CELL, x2 = x1 + (dx / len) * CELL * 0.5, y2 = y1 + (dy / len) * CELL * 0.5;
        stubsHtml += '<g class="dm-stubg" data-node="' + toId + '"><line class="dm-stub" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '"/>' +
          '<circle class="dm-hit" cx="' + (x1 + (dx / len) * CELL * 0.6) + '" cy="' + (y1 + (dy / len) * CELL * 0.6) + '" r="26"/>' +
          '<text class="dm-q" x="' + (x1 + (dx / len) * CELL * 0.66) + '" y="' + (y1 + (dy / len) * CELL * 0.66 + 6) + '" text-anchor="middle">?</text></g>';
        pts.push([x2, y2]);
      }
    });

    Object.keys(show).forEach(function (id) {
      var n = m.nodes[id], kind = id === blind ? "hall" : n.kind, x = n.x * CELL, y = n.y * CELL, hot = marked(s, id), cls = "dm-node dm-" + kind + (hot ? " dm-marked" : " dm-faint") + (here === id ? " dm-here" : "");
      pts.push([x, y]);
      nodesHtml += '<g class="' + cls + '" data-node="' + id + '">';
      if (here === id) nodesHtml += '<circle class="dm-ring" cx="' + x + '" cy="' + y + '" r="' + (kind === "room" ? 34 : 24) + '"/>';
      if (kind === "room") {
        nodesHtml += '<rect x="' + (x - 46) + '" y="' + (y - 20) + '" width="92" height="40" rx="6"/><text x="' + x + '" y="' + (y + 5) + '" text-anchor="middle">' + esc(n.name) + "</text>";
      } else if (kind === "exit") {
        nodesHtml += '<rect x="' + (x - 14) + '" y="' + (y - 14) + '" width="28" height="28" rx="4"/><path class="dm-ladder" d="M' + (x - 5) + " " + (y - 9) + "V" + (y + 9) + "M" + (x + 5) + " " + (y - 9) + "V" + (y + 9) +
          "M" + (x - 5) + " " + (y - 4) + "H" + (x + 5) + "M" + (x - 5) + " " + (y + 4) + "H" + (x + 5) + '"/><text class="dm-label" x="' + x + '" y="' + (y + 30) + '" text-anchor="middle">' + esc(n.name) + "</text>";
      } else {
        nodesHtml += '<circle cx="' + x + '" cy="' + y + '" r="12"/>';
        if (hot) nodesHtml += '<path class="dm-chalk" d="M' + (x - 6) + " " + (y - 6) + "L" + (x + 6) + " " + (y + 6) + "M" + (x + 6) + " " + (y - 6) + "L" + (x - 6) + " " + (y + 6) + '"/>';
      }
      nodesHtml += "</g>";
    });

    if (!pts.length) return "";
    var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    pts.forEach(function (p) { minX = Math.min(minX, p[0]); maxX = Math.max(maxX, p[0]); minY = Math.min(minY, p[1]); maxY = Math.max(maxY, p[1]); });
    lastBounds = { minX: minX, maxX: maxX, minY: minY, maxY: maxY };
    var pad = 80, w = Math.max(maxX - minX + pad * 2, CELL * 4), h = Math.max(maxY - minY + pad * 2, CELL * 2.5);
    var vx = (minX + maxX) / 2 - w / 2, vy = (minY + maxY) / 2 - h / 2;
    return '<svg class="dm-svg" viewBox="' + vx + " " + vy + " " + w + " " + h + '" role="img" aria-label="Map of ' + esc(m.title) + '">' + edgesHtml + stubsHtml + nodesHtml + "</svg>";
  }

  function chalkLine(s) {
    var bundles = truthy(s.has_chalk_sticks) ? 1 + num(s.spare_chalk_sticks) : 0;
    var marks = num(s.dg_chalk_left) + 6 * bundles;
    return "Chalk: " + marks + (marks === 1 ? " mark" : " marks") + " left";
  }

  /* ---------------------------------------------------------------- the window */

  if (typeof document === "undefined") return;
  var dlg;

  function build() {
    if (dlg) return;
    dlg = document.createElement("dialog");
    dlg.id = "dungeonMap";
    dlg.setAttribute("aria-label", "Dungeon map");
    dlg.innerHTML =
      '<div class="dm-head"><h2>Map</h2><span class="dm-title"></span><span class="dm-spacer"></span>' +
        '<button type="button" class="dm-close" data-act="close" aria-label="Close map">×</button></div>' +
      '<div class="dm-body"></div>' +
      '<div class="dm-foot"><span class="dm-legend">' +
        '<span><i class="dm-k dm-k-faint"></i> Remembered</span><span><i class="dm-k dm-k-hot"></i> Chalked</span><span><b class="dm-k-q">?</b> Not tried yet</span><span><i class="dm-k dm-k-here"></i> You are here</span>' +
      '</span><span class="dm-spacer"></span><span class="dm-chalk-left"></span></div>';
    document.body.appendChild(dlg);
    dlg.addEventListener("click", function (ev) {
      var t = ev.target && ev.target.closest ? ev.target.closest("[data-act]") : null;
      if (t && t.getAttribute("data-act") === "close") close();
    });
    dlg.addEventListener("keydown", function (ev) {
      ev.stopPropagation();
      if (ev.key === "m" || ev.key === "M") { ev.preventDefault(); close(); }
    });
    dlg.addEventListener("mousedown", function (ev) { if (ev.target === dlg) close(); });
  }

  function render() {
    var s = statsNow(), m = mapFor(s), svg = svgFor(s);
    dlg.querySelector(".dm-title").textContent = m ? m.title : "";
    dlg.querySelector(".dm-body").innerHTML = svg || '<div class="dm-empty">You have not mapped anything here yet. A place goes on the map when you reach it with a light to see by.</div>';
    dlg.querySelector(".dm-chalk-left").textContent = chalkLine(s);
  }

  function open() {
    build();
    if (dlg.open) return;
    render();
    if (!dlg.showModal) { window.alert("This browser is too old to show the map."); return; }
    dlg.showModal();
  }
  function close() { if (dlg && dlg.open) dlg.close(); }
  function toggle() { if (dlg && dlg.open) close(); else open(); }
  DM.open = open; DM.close = close; DM.toggle = toggle; DM.svgFor = svgFor;   // svgFor is exposed for the tests (tools and browser probes)

  /* ---------------------------------------------------------------- the map in the page (2026-10-14)
   * While a run is on and the page offers moves, the map is drawn above the page's options and is the way to move: a click on a neighbouring place presses that way's own option ("Go north." and
   * so on), and a click on a farther place WALKS there, pressing one step after another along the quickest route through places already mapped. Nothing is written to the game's state: every
   * press is the real option, so the scene runs the step, the light, the roll and the replay lock exactly as it does from the list. The walk stops at once on anything that is not a plain place
   * page (an encounter, a light prompt, a page break, being sent back), on a place whose options include something other than moving, chalking or leaving, and at the destination. The move
   * options are hidden while the map is up (body.dgMapOn); "Classic list" puts them back, and "Show map" returns, like the battle HUD. */
  var PANEL_ID = "dungeonPanel";
  var classic = false, pinnedAt = "", panelSig = "", walk = null, walkTimer = 0, queuedScan = false;
  var DIRS = { north: [0, -1], east: [1, 0], south: [0, 1], west: [-1, 0] };

  function dirWord(a, b) {
    var dx = b.x - a.x, dy = b.y - a.y;
    for (var w in DIRS) if (DIRS[w][0] === dx && DIRS[w][1] === dy) return w;
    return "";
  }
  function neighbours(m, id) {
    var out = [];
    var st = statsNow();
    m.edges.forEach(function (e) {
      if (!liveEdge(st, e)) return;
      var o = e[0] === id ? e[1] : (e[1] === id ? e[0] : null);
      if (o && m.nodes[o]) out.push({ to: o, dir: dirWord(m.nodes[id], m.nodes[o]) });
    });
    return out;
  }
  // The quickest way from one place to another through places the player has mapped (the destination itself may be unmapped, one step out of a mapped place). Returns the ids after the start, or null.
  function route(s, m, from, to) {
    if (from === to) return null;
    var prev = {}, queue = [from]; prev[from] = null;
    while (queue.length) {
      var c = queue.shift();
      if (c === to) break;
      neighbours(m, c).forEach(function (n) {
        if (n.to in prev) return;
        if (n.to !== to && !seen(s, n.to)) return;
        prev[n.to] = c; queue.push(n.to);
      });
    }
    if (!(to in prev)) return null;
    var path = [];
    for (var c2 = to; c2 !== from; c2 = prev[c2]) path.unshift(c2);
    return path;
  }

  // During a page change the engine keeps a faded copy of the old page beside the new one (clearScreen in ui.js: duplicate ids, and it stays up for as long as the transition takes), so every
  // lookup here is scoped to #container1, which holds the live page.
  function liveForm() {
    var f = document.querySelector("#container1 form");
    if (f) return f;
    var forms = document.querySelectorAll("#main form");
    return forms.length ? forms[forms.length - 1] : null;
  }
  function panelEl() { return document.querySelector("#container1 #" + PANEL_ID) || document.getElementById(PANEL_ID); }

  // The page's options sorted into moves (a "Go <direction>" to a neighbouring place on the map) and the rest. null unless this is a dungeon place page with at least one move.
  function scanPage() {
    var s = statsNow(), m = mapFor(s);
    if (!truthy(s.dg_in_run) || !m || !m.nodes[s.dg_pos]) return null;
    var form = liveForm();
    if (!form) return null;
    var labels = form.querySelectorAll(".choice label");
    var here = s.dg_pos, nb = {}, moves = {}, count = 0, interesting = false, chalk = null, leaves = [];
    neighbours(m, here).forEach(function (n) { if (n.dir) nb[n.dir] = n.to; });
    for (var i = 0; i < labels.length; i++) {
      var radio = labels[i].querySelector("input[type=radio]");
      if (!radio || radio.disabled) continue;
      var text = (labels[i].textContent || "").replace(/\s+/g, " ").trim();
      var w = /^Go\b/.test(text) ? /\b(north|east|south|west)\b/i.exec(text) : null;
      var box = labels[i].closest ? (labels[i].closest(".choice > div") || labels[i]) : labels[i];
      if (w && nb[w[1].toLowerCase()]) { moves[nb[w[1].toLowerCase()]] = { radio: radio, box: box }; count++; }
      else if (/^Mark this/.test(text)) chalk = { radio: radio, text: text };
      else if (/^Go (up|down|back out)\b/.test(text)) leaves.push({ radio: radio, text: text });
      else interesting = true;
    }
    return count ? { s: s, m: m, here: here, moves: moves, interesting: interesting, chalk: chalk, leaves: leaves } : null;
  }

  function press(radio) {
    if (!radio || !radio.form || !document.documentElement.contains(radio)) return false;
    radio.checked = true;
    if (typeof radio.form.onsubmit === "function") radio.form.onsubmit();
    return true;
  }

  // Three ways to show a page. "only": nothing to do here but move, chalk or leave, so the map is the whole page and the option list (and its Next button) is put away. "classic": the list, with
  // a small bar to bring the map back; it is the way a page with anything else to do opens (a search, a fight, a choice), so the player sees at once that there is more than moving, and it is
  // also what the "Classic list" button asks for on every page. "list": the player chose Show map on such a page, so the map shows and the list keeps only the other options.
  function modeOf(info) {
    if (classic) return "classic";
    if (info.interesting) return pinnedAt === info.here ? "list" : "classic";
    return "only";
  }

  function panelHtml(info) {
    var s = info.s, mode = modeOf(info);
    if (mode === "classic") return '<div class="dp-head"><span class="dp-title">' + esc(info.m.title) + '</span>' + (!classic && info.interesting ? '<span class="dp-note">There is more to do here than moving.</span>' : "") + '<span class="dp-spacer"></span><button type="button" class="dp-btn" data-act="map">Show map</button></div>';
    var head = '<div class="dp-head"><span class="dp-title">' + esc(info.m.title) + '</span><span class="dp-spacer"></span><span class="dp-chalk-left">' + esc(chalkLine(s)) + "</span>" +
      (info.chalk && !walk ? '<button type="button" class="dp-btn" data-act="chalk">Mark with chalk</button>' : "") +
      (!walk ? info.leaves.map(function (l, i) { return '<button type="button" class="dp-btn dp-leave" data-act="leave" data-i="' + i + '">' + esc(l.text) + "</button>"; }).join("") : "") +
      (walk ? '<button type="button" class="dp-btn dp-stop" data-act="stop">Stop walking</button>' : "") +
      '<button type="button" class="dp-btn" data-act="classic">Classic list</button></div>';
    var hint = walk ? "Walking… the walk stops at anything that needs you." : "Click a place to step or walk there; a ? is a way you have not tried. Drag to pan, scroll or + / - to zoom.";
    var ctl = '<div class="dp-ctl"><button type="button" data-act="zoomin" title="Zoom in" aria-label="Zoom in">+</button><button type="button" data-act="zoomout" title="Zoom out" aria-label="Zoom out">&minus;</button>' +
      '<button type="button" data-act="me" title="Back to you" aria-label="Centre on you">Me</button><button type="button" data-act="all" title="Show everything mapped" aria-label="Show everything mapped">All</button></div>';
    return head + '<div class="dp-mapbox">' + svgFor(s) + ctl + '</div><div class="dp-hint">' + hint + "</div>";
  }

  function panelSignature(info) {
    var s = info.s, bits = [];
    Object.keys(info.m.nodes).forEach(function (id) { bits.push(marked(s, id) ? 2 : (seen(s, id) ? 1 : 0)); });
    return [info.here, bits.join(""), modeOf(info), walk ? walk.path.join(">") : "", info.chalk ? 1 : 0, info.leaves.length, chalkLine(s)].join("#");
  }

  function removePanel() {
    var el = panelEl();
    if (el && el.parentNode) el.parentNode.removeChild(el);
    document.body.classList.remove("dgMapOn");
    document.body.classList.remove("dgMapOnly");
    panelSig = "";
  }

  function scroller(el) {
    for (var e = el.parentElement; e && e !== document.documentElement; e = e.parentElement) {
      var oy = window.getComputedStyle(e).overflowY;
      if ((oy === "auto" || oy === "scroll") && e.scrollHeight > e.clientHeight + 2) return e;
    }
    return null;
  }
  // Once per new page, so the whole map is in view; never on a click on the map, which only redraws the same panel.
  function bringIntoView(el) {
    setTimeout(function () {
      if (!document.documentElement.contains(el)) return;
      var sc = scroller(el), r = el.getBoundingClientRect();
      var top = sc ? sc.getBoundingClientRect().top : 0, bottom = sc ? sc.getBoundingClientRect().bottom : (window.innerHeight || document.documentElement.clientHeight);
      if (r.top >= top && r.bottom <= bottom) return;
      if (sc) sc.scrollTop = Math.max(0, sc.scrollTop + (r.top - top) - 12);
      else window.scrollTo(0, Math.max(0, (window.pageYOffset || document.documentElement.scrollTop || 0) + r.top - 12));
    }, 250);
  }

  function scan() {
    var info = scanPage();
    var el = panelEl();
    if (!info) {
      // not a place page (or the page is still being built): put the panel away, but a walk in progress is judged by walkTick, not here
      if (el || document.body.classList.contains("dgMapOn")) removePanel();
      if (!truthy(statsNow().dg_in_run)) view = null;
      return;
    }
    var sig = panelSignature(info);
    if (el && sig === panelSig) return;
    var fresh = !el;
    if (!el) {
      var f = liveForm();
      if (!f || !f.parentNode) return;
      el = document.createElement("div");
      el.id = PANEL_ID;
      f.parentNode.insertBefore(el, f);
    }
    el.innerHTML = panelHtml(info);
    panelSig = sig;
    var mode = modeOf(info);
    if (mode !== "classic") { followPlayer(info); applyView(); }
    Object.keys(info.moves).forEach(function (id) { if (info.moves[id].box.classList) info.moves[id].box.classList.add("dgMove"); });
    document.body.classList.toggle("dgMapOn", mode !== "classic");
    document.body.classList.toggle("dgMapOnly", mode === "only");
    if (fresh && mode !== "classic") bringIntoView(el);   // a folded map (the small bar) must not drag the page down to itself
  }
  function queueScan() {
    if (queuedScan) return;
    queuedScan = true;
    var run = function () { queuedScan = false; scan(); };
    if (window.requestAnimationFrame) window.requestAnimationFrame(run); else setTimeout(run, 16);
  }


  /* ------------------------------ the view: pan and zoom (the same feel as the overworld map)
   * The panel is a fixed-size window onto the drawing, not a fit of all of it, so the map keeps its size as more is explored. It opens on the player at a comfortable zoom and follows them
   * when they walk toward its edge; drag pans, the wheel and + / - zoom, "Me" centres on the player and "All" shows everything mapped. */
  var MIN_W = 260;
  var view = null, viewTable = "";

  // How wide a stretch of the map the window opens on: about 0.9 screen pixels to an SVG unit, so a wide window shows more of the map at the same size of place and name, between 7 and 14 cells.
  function defaultW() {
    var bx = boxSize(), w = bx ? bx.w / 0.9 : 800;
    return Math.max(CELL * 6, Math.min(CELL * 12, w));
  }
  function nodeXY(m, id) { var n = m.nodes[id]; return n ? { x: n.x * CELL, y: n.y * CELL } : null; }
  function boxSize() {
    var el = panelEl(), sv = el && el.querySelector(".dp-mapbox svg");
    return sv ? { el: sv, w: sv.clientWidth || 600, h: sv.clientHeight || 360 } : null;
  }
  function applyView() {
    var bx = boxSize();
    if (!bx || !view) return;
    var h = view.w * (bx.h / bx.w);
    bx.el.setAttribute("viewBox", (view.cx - view.w / 2) + " " + (view.cy - h / 2) + " " + view.w + " " + h);
  }
  function fitView() {
    var b = lastBounds, bx = boxSize();
    if (!b) return;
    var aspect = bx ? bx.h / bx.w : 0.6;
    view = { cx: (b.minX + b.maxX) / 2, cy: (b.minY + b.maxY) / 2, w: Math.max(b.maxX - b.minX + 200, (b.maxY - b.minY + 200) / aspect, CELL * 3) };
  }
  function zoomAt(factor, px, py) {
    var bx = boxSize();
    if (!bx || !view) return;
    var b = lastBounds, maxW = b ? Math.max((b.maxX - b.minX) * 1.6 + 300, 1000) : 1600;
    var nw = Math.min(maxW, Math.max(MIN_W, view.w * factor)), h = view.w * (bx.h / bx.w);
    var wx = view.cx - view.w / 2 + px * view.w, wy = view.cy - h / 2 + py * h, nh = nw * (bx.h / bx.w);
    view = { cx: wx - px * nw + nw / 2, cy: wy - py * nh + nh / 2, w: nw };
    applyView();
  }
  // Open on the player, and re-centre only when they get near the edge of what is shown (so a pan the player made is not undone by every step).
  function followPlayer(info) {
    var xy = nodeXY(info.m, info.here);
    if (!xy) return;
    if (!view || viewTable !== info.s.dg_table) { view = { cx: xy.x, cy: xy.y, w: defaultW() }; viewTable = info.s.dg_table; return; }
    var bx = boxSize(), h = view.w * ((bx ? bx.h : 360) / (bx ? bx.w : 600)), margin = 70;
    if (xy.x < view.cx - view.w / 2 + margin || xy.x > view.cx + view.w / 2 - margin || xy.y < view.cy - h / 2 + margin || xy.y > view.cy + h / 2 - margin) { view.cx = xy.x; view.cy = xy.y; }
  }

  // Drag to pan. Pointer capture starts only once the pointer has moved a few pixels, so a plain click still reaches the place it landed on.
  var drag = null, dragMoved = false;
  document.addEventListener("pointerdown", function (ev) {
    var bx = boxSize();
    if (!bx || !view || !bx.el.contains(ev.target) || (ev.pointerType === "mouse" && ev.button !== 0)) return;
    drag = { id: ev.pointerId, x: ev.clientX, y: ev.clientY, cx: view.cx, cy: view.cy, moved: false };
    dragMoved = false;
  });
  document.addEventListener("pointermove", function (ev) {
    if (!drag || ev.pointerId !== drag.id) return;
    var bx = boxSize();
    if (!bx || !view) return;
    var dx = ev.clientX - drag.x, dy = ev.clientY - drag.y;
    if (!drag.moved && Math.abs(dx) + Math.abs(dy) < 5) return;
    if (!drag.moved) { drag.moved = true; dragMoved = true; try { bx.el.setPointerCapture(ev.pointerId); } catch (e) { /* not capturable: the drag still works */ } bx.el.classList.add("dragging"); }
    var k = view.w / bx.w;
    view.cx = drag.cx - dx * k; view.cy = drag.cy - dy * k;
    applyView();
  });
  function endDrag(ev) {
    if (!drag || ev.pointerId !== drag.id) return;
    var bx = boxSize();
    drag = null;
    if (bx) { bx.el.classList.remove("dragging"); try { bx.el.releasePointerCapture(ev.pointerId); } catch (e) { /* already released */ } }
  }
  document.addEventListener("pointerup", endDrag);
  document.addEventListener("pointercancel", endDrag);
  document.addEventListener("wheel", function (ev) {
    var bx = boxSize();
    if (!bx || !view || !bx.el.contains(ev.target)) return;
    ev.preventDefault();
    var r = bx.el.getBoundingClientRect();
    zoomAt(ev.deltaY > 0 ? 1.18 : 1 / 1.18, (ev.clientX - r.left) / r.width, (ev.clientY - r.top) / r.height);
  }, { passive: false });

  /* ------------------------------ walking */
  var lastStop = "";   // why the last walk ended (kept for testing)
  function stopWalk(why) {
    lastStop = why || "stopped";
    walk = null;
    if (walkTimer) { clearInterval(walkTimer); walkTimer = 0; }
    panelSig = "";   // redraw without the walking banner
    queueScan();
  }
  function pressStep() {
    var info = scanPage();
    if (!info || !walk) return stopWalk("no place page to press from");
    var mv = info.moves[walk.path[0]];
    if (!mv) return stopWalk("no option for the next step");
    walk.form = mv.radio.form;
    walk.pressedAt = Date.now();
    walk.hold = 0;
    press(mv.radio);
  }
  function walkTick() {
    if (!walk) return;
    var now = Date.now();
    if (walk.hold) { if (now >= walk.hold) { walk.hold = 0; pressStep(); } return; }
    if (now - walk.pressedAt > 4000) return stopWalk("nothing came back");                         // nothing came back
    if (walk.form && document.documentElement.contains(walk.form)) return;       // the old page is still up
    var info = scanPage();
    if (!info) {
      // a page with a break or a choice that is not a place (an encounter, a light prompt): the walk ends here. Otherwise the new page is still being built.
      if (document.querySelector("#container1 button.next") || document.querySelector("#container1 form .choice label")) stopWalk("a page that is not a place");
      return;
    }
    if (info.here !== walk.path[0]) return stopWalk("not where the route said (" + info.here + ")");                           // sent back, or somewhere else
    walk.path.shift();
    // the light failed or the day ended on this step (dungeon.txt dg_step sets these): stop, so the page that says so is read
    if (truthy(info.s.dg_fell_dark) || truthy(info.s.dg_light_out_now)) return stopWalk("the light failed");
    if (!walk.path.length) return stopWalk("arrived");
    if (info.interesting) return stopWalk("a place with something to do");
    walk.hold = now + 220;
    panelSig = ""; queueScan();
  }
  function startWalk(path) {
    if (walkTimer) clearInterval(walkTimer);
    walk = { path: path.slice(), form: null, pressedAt: Date.now(), hold: 0 };
    walkTimer = setInterval(walkTick, 90);
    pressStep();
  }

  function go(id) {
    var info = scanPage();
    if (!info || id === info.here) return;
    var path = route(info.s, info.m, info.here, id);
    if (!path) return;
    if (path.length === 1) { if (walk) stopWalk(); var mv = info.moves[path[0]]; if (mv) press(mv.radio); return; }
    startWalk(path);
  }

  document.addEventListener("click", function (ev) {
    var panel = panelEl();
    if (!panel || !panel.contains(ev.target)) return;
    var act = ev.target.closest ? ev.target.closest("[data-act]") : null;
    if (act) {
      var a = act.getAttribute("data-act");
      if (a === "classic") { var ci = scanPage(); if (ci && ci.interesting && pinnedAt === ci.here) pinnedAt = ""; else classic = true; if (walk) stopWalk(); else { panelSig = ""; queueScan(); } }
      else if (a === "map") { classic = false; var mi0 = scanPage(); if (mi0 && mi0.interesting) pinnedAt = mi0.here; panelSig = ""; queueScan(); }
      else if (a === "leave") { var li = scanPage(), lo = li && li.leaves[Number(act.getAttribute("data-i"))]; if (lo) press(lo.radio); }
      else if (a === "stop") stopWalk();
      else if (a === "zoomin") zoomAt(1 / 1.4, 0.5, 0.5);
      else if (a === "zoomout") zoomAt(1.4, 0.5, 0.5);
      else if (a === "me") { var mi = scanPage(), mxy = mi && nodeXY(mi.m, mi.here); if (mxy && view) { view = { cx: mxy.x, cy: mxy.y, w: defaultW() }; applyView(); } }
      else if (a === "all") { fitView(); applyView(); }
      else if (a === "chalk") { var info = scanPage(); if (info && info.chalk) press(info.chalk.radio); }
      return;
    }
    var node = ev.target.closest ? ev.target.closest("[data-node]") : null;
    if (dragMoved) { dragMoved = false; return; }
    if (node) { if (walk) stopWalk(); go(node.getAttribute("data-node")); }
  });
  document.addEventListener("keydown", function (ev) { if (walk && ev.key === "Escape") stopWalk(); });
  if (window.MutationObserver) new MutationObserver(queueScan).observe(document.documentElement, { childList: true, subtree: true });
  DM.panel = { lastStop: function () { return lastStop; }, walking: function () { return walk ? { path: walk.path.slice(), age: Date.now() - walk.pressedAt, hold: walk.hold } : null; }, scan: scan, route: function (from, to) { var s = statsNow(), m = mapFor(s); return m ? route(s, m, from, to) : null; } };

  function isTextTarget(t) {
    if (!t || !t.tagName) return false;
    var tag = t.tagName.toLowerCase();
    return tag === "textarea" || tag === "select" || t.isContentEditable || (tag === "input" && /^(text|search|number|email|password|url|tel)$/i.test(t.type || "text"));
  }
  document.addEventListener("keydown", function (ev) {
    if (ev.ctrlKey || ev.metaKey || ev.altKey) return;
    if (dlg && dlg.open) return;
    if (isTextTarget(ev.target)) return;
    if (document.querySelector("dialog[open]")) return;
    if ((ev.key === "m" || ev.key === "M") && DM.available()) { ev.preventDefault(); open(); }
  });
})();
