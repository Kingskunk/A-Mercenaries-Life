/*
 * CITY TRAVEL (2026-10-21, the user's sidebar Travel button) -- walk to another district of the city from the sidebar, in fewer clicks.
 *
 * The panel owns picking; the scene owns the trip, the way the overworld map and the trade panel work. A free-roaming page (the district hubs so far) carries one hidden option whose
 * label starts with the arrow mark and ends with the city's id in brackets: "↦ Walk to the district picked on the sidebar. [port_valen]". While that option is on the newest page, the
 * sidebar's Travel button is enabled. Picking a district writes its id into the city's destination variable (stats.pv_travel_dest) and presses that one real option; the scene
 * (port_valen.txt port_valen_walk_picked) checks the pick against the districts that are open and not the one the player stands in, and takes the same road as the travel menu: the
 * walking time, the exposure, the once-a-day street encounter, and arrival at the district's hub. Nothing here can grant a trip the scene does not allow.
 *
 * Because the button is enabled only where a scene has offered the option, a quest page, a timed job, a conversation or a dungeon (which never offer it) cannot be walked away from, and
 * no scene needs a lock. Opting a place in is one hidden option in its menu. The table of districts and the minutes between them is generated (tools/gen_city_data.js ->
 * city-data.generated.js) from the scene's own distances, so the button shows what the scene will charge.
 *
 * The hidden option stays on the page, hidden, even when the sidebar is not shown (a narrow window); the district hubs keep their own visible Travel option for that case.
 */
(function () {
  "use strict";

  var MARK = "↦";   // ↦, the hidden walk option's label starts with it
  var CT = window.CityTravel = window.CityTravel || {};

  function truthy(v) { return v === true || v === "true"; }
  function num(v) { var n = Number(v); return isFinite(n) ? n : 0; }
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function statsNow() { return window.stats || {}; }
  function data() { return window.CITY_TRAVEL || {}; }

  // The walk option on the newest page (while ChoiceScript fades a page out the old one is still in the document beside the new one), or null.
  function findWalk() {
    if (typeof document === "undefined") return null;
    var forms = document.querySelectorAll("#main form");
    var labels = forms.length ? forms[forms.length - 1].querySelectorAll(".choice label") : [];
    for (var i = 0; i < labels.length; i++) {
      var text = (labels[i].textContent || "").replace(/\s+/g, " ").trim();
      if (text.indexOf(MARK) !== 0) continue;
      var radio = labels[i].querySelector("input[type=radio]"), m = /\[([a-z_]+)\]\s*$/.exec(text);
      if (!radio || radio.disabled || !m || !data()[m[1]]) continue;
      return { label: labels[i], radio: radio, city: m[1] };
    }
    return null;
  }

  // The districts the player may walk to from here, with the minutes the scene will charge (this district's distance from the origin plus the destination's, as port_valen_travel_to adds them).
  CT.plan = function (cityId, s) {
    var city = data()[cityId];
    if (!city) return null;
    s = s || statsNow();
    var here = String(s[city.hereVar] || ""), origin = 0, hereName = "";
    city.districts.forEach(function (d) { if (d.id === here) { origin = d.dist; hereName = d.name; } });
    var out = [];
    city.districts.forEach(function (d) {
      if (d.id === here) return;
      if (d.open && !truthy(s[d.open])) return;
      out.push({ id: d.id, name: d.name, minutes: origin + d.dist });
    });
    return { city: city, here: here, hereName: hereName, list: out };
  };

  // Does the newest page carry the walk option at all? pagegate.js reads this as "an open-world page" for Wait and Rest.
  CT.onPage = function () { return !!findWalk(); };

  // Is the Travel button usable right now? Only on a page that carries the walk option, and never in a fight.
  CT.available = function () {
    var s = statsNow();
    if (truthy(s.combat_engaged)) return false;
    var w = findWalk();
    return !!(w && CT.plan(w.city, s) && CT.plan(w.city, s).list.length);
  };

  /* ---------------------------------------------------------------- pressing the real option */

  var pressed = false;
  function press(radio) {
    if (!radio || pressed || !radio.form || !document.documentElement.contains(radio)) return;
    pressed = true;
    radio.checked = true;
    if (typeof radio.form.onsubmit === "function") radio.form.onsubmit();
  }

  // Writes the picked district where the scene reads it, then presses the one walk option. The scene checks the pick and refuses anything it does not allow.
  CT.go = function (id) {
    var w = findWalk();
    if (!w) return false;
    var plan = CT.plan(w.city);
    if (!plan || !plan.list.some(function (d) { return d.id === id; })) return false;
    statsNow()[plan.city.destVar] = id;
    close();
    pressed = false;
    press(w.radio);
    return true;
  };

  /* ---------------------------------------------------------------- the card */

  if (typeof document === "undefined") return;   // node tests stop here

  var dlg, elList, elHere;
  function build() {
    if (dlg) return;
    dlg = document.createElement("dialog");
    dlg.id = "cityTravel";
    dlg.setAttribute("aria-label", "Travel");
    dlg.innerHTML =
      '<div class="ct-head"><h2 class="ct-title">Walk where?</h2><span class="ct-spacer"></span>' +
      '<button type="button" class="ct-close" data-act="close" aria-label="Close travel">×</button></div>' +
      '<div class="ct-here"></div><div class="ct-list"></div>' +
      '<div class="ct-foot">The walk takes the time shown. Weather, hunger and the streets still have their say on the way.</div>';
    document.body.appendChild(dlg);
    elHere = dlg.querySelector(".ct-here");
    elList = dlg.querySelector(".ct-list");
    dlg.addEventListener("click", function (ev) {
      var t = ev.target;
      if (t === dlg) { close(); return; }
      var btn = t && t.closest ? t.closest("[data-act],[data-dest]") : null;
      if (!btn) return;
      if (btn.getAttribute("data-act") === "close") { close(); return; }
      var id = btn.getAttribute("data-dest");
      if (id) CT.go(id);
    });
  }

  function paint() {
    var w = findWalk();
    var plan = w ? CT.plan(w.city) : null;
    if (!plan) { close(); return; }
    elHere.textContent = plan.hereName ? "You are in " + plan.hereName + "." : "";
    elList.innerHTML = plan.list.map(function (d) {
      return '<button type="button" class="ct-dest" data-dest="' + esc(d.id) + '"><span class="ct-name">' + esc(d.name) + '</span><span class="ct-min">' + d.minutes + ' min</span></button>';
    }).join("");
  }

  function open() {
    if (!CT.available()) return;
    build();
    paint();
    if (!dlg.open) dlg.showModal();
  }
  function close() { if (dlg && dlg.open) dlg.close(); }
  CT.open = open;
  CT.close = close;

  /* ---------------------------------------------------------------- keeping the page in step */

  // style.css rounds the choice box with .choice > div:first-child / :last-child. Hiding the walk row can leave a hidden row at an edge, so tag the first and last VISIBLE rows (citytravel.css draws those edges).
  function fixChoiceEdges(box) {
    var rows = box ? box.children : [], first = null, last = null, i;
    for (i = 0; i < rows.length; i++) {
      if (rows[i].style.display === "none") continue;
      if (!first) first = rows[i];
      last = rows[i];
    }
    for (i = 0; i < rows.length; i++) {
      rows[i].classList.toggle("ct-first-visible", rows[i] === first && rows[0] !== first);
      rows[i].classList.toggle("ct-last-visible", rows[i] === last && rows[rows.length - 1] !== last);
    }
  }

  var scanQueued = false;
  function scan() {
    scanQueued = false;
    var w = findWalk();
    if (w && w.label.parentNode) {
      if (w.label.parentNode.style.display !== "none") w.label.parentNode.style.display = "none";
      fixChoiceEdges(w.label.parentNode.parentNode);
    }
    if (!w && dlg && dlg.open) close();
    if (w) pressed = false;
  }
  function queueScan() { if (!scanQueued) { scanQueued = true; window.requestAnimationFrame(scan); } }

  // T opens the card, like F for Wait. Not while typing, not over another open panel, and not on a page where the trade panel is active (the trade panel keeps T there).
  document.addEventListener("keydown", function (ev) {
    if ((ev.key !== "t" && ev.key !== "T") || ev.ctrlKey || ev.metaKey || ev.altKey || ev.repeat) return;
    var target = ev.target, tag = target && target.tagName ? target.tagName.toLowerCase() : "";
    if (tag === "input" || tag === "textarea" || tag === "select" || (target && target.isContentEditable)) return;
    if (document.querySelector("dialog[open]")) return;
    if (window.TradePanel && window.TradePanel.active && window.TradePanel.active()) return;
    if (!CT.available()) return;
    ev.preventDefault();
    open();
  });

  function start() {
    if (window.MutationObserver) new MutationObserver(queueScan).observe(document.body, { childList: true, subtree: true });
    window.setInterval(scan, 700);   // safety net: stats can change without touching the DOM
    scan();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
