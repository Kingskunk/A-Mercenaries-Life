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
 * Open with the Map button on the rail (it appears once something has been mapped) or the M key.
 */
(function () {
  "use strict";

  var DM = window.DungeonMap = window.DungeonMap || {};

  // The layouts live one per dungeon in web/mygame/dungeons/<id>.js, which add themselves to DM.maps under the value of stats.dg_table. This file never names a dungeon.
  var MAPS = DM.maps = DM.maps || {};

  var CELL = 120;   // SVG units per grid cell

  function truthy(v) { return v === true || v === "true"; }
  function num(v) { var n = Number(v); return isFinite(n) ? n : 0; }
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function statsNow() { return window.stats || {}; }

  function mapFor(s) { return MAPS[s.dg_table] || null; }
  function marked(s, id) { return truthy(s["dg_mark_" + id]); }
  function seen(s, id) { return truthy(s["dg_seen_" + id]) || marked(s, id); }

  // Has the player mapped anything at all? (The rail button appears then.)
  DM.hasAny = function () {
    var s = statsNow(), m = mapFor(s);
    if (!m) return false;
    for (var id in m.nodes) if (seen(s, id)) return true;
    return false;
  };

  /* ---------------------------------------------------------------- drawing */

  function svgFor(s) {
    var m = mapFor(s);
    if (!m) return "";
    var here = truthy(s.dg_in_run) ? s.dg_pos : "";
    var show = {};
    Object.keys(m.nodes).forEach(function (id) { if (seen(s, id)) show[id] = true; });
    var edgesHtml = "", stubsHtml = "", nodesHtml = "", pts = [];

    m.edges.forEach(function (e) {
      var a = m.nodes[e[0]], b = m.nodes[e[1]], sa = !!show[e[0]], sb = !!show[e[1]];
      if (sa && sb) {
        edgesHtml += '<line class="dm-edge' + (marked(s, e[0]) && marked(s, e[1]) ? " dm-edge-hot" : "") + '" x1="' + a.x * CELL + '" y1="' + a.y * CELL + '" x2="' + b.x * CELL + '" y2="' + b.y * CELL + '"/>';
      } else if (sa || sb) {
        // a way out of a seen place into one the player has not seen: a short dashed stub toward it, ending in a question mark
        var from = sa ? a : b, to = sa ? b : a;
        var dx = to.x - from.x, dy = to.y - from.y, len = Math.sqrt(dx * dx + dy * dy) || 1;
        var x1 = from.x * CELL, y1 = from.y * CELL, x2 = x1 + (dx / len) * CELL * 0.5, y2 = y1 + (dy / len) * CELL * 0.5;
        stubsHtml += '<line class="dm-stub" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '"/>' +
          '<text class="dm-q" x="' + (x1 + (dx / len) * CELL * 0.66) + '" y="' + (y1 + (dy / len) * CELL * 0.66 + 6) + '" text-anchor="middle">?</text>';
        pts.push([x2, y2]);
      }
    });

    Object.keys(show).forEach(function (id) {
      var n = m.nodes[id], x = n.x * CELL, y = n.y * CELL, hot = marked(s, id), cls = "dm-node dm-" + n.kind + (hot ? " dm-marked" : " dm-faint") + (here === id ? " dm-here" : "");
      pts.push([x, y]);
      nodesHtml += '<g class="' + cls + '" data-node="' + id + '">';
      if (here === id) nodesHtml += '<circle class="dm-ring" cx="' + x + '" cy="' + y + '" r="' + (n.kind === "room" ? 34 : 24) + '"/>';
      if (n.kind === "room") {
        nodesHtml += '<rect x="' + (x - 46) + '" y="' + (y - 20) + '" width="92" height="40" rx="6"/><text x="' + x + '" y="' + (y + 5) + '" text-anchor="middle">' + esc(n.name) + "</text>";
      } else if (n.kind === "exit") {
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
  DM.open = open; DM.close = close; DM.toggle = toggle;

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
    if ((ev.key === "m" || ev.key === "M") && DM.hasAny()) { ev.preventDefault(); open(); }
  });
})();
