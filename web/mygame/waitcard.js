/*
 * WAIT CARD (2026-10-22, the user's call) -- the sidebar's Wait and Rest outside a dungeon, in two clicks instead of five.
 *
 * Before this, Wait opened the Dossier's Wait menu: press F, pick, read a page of one line of prose, click through, land back in the Dossier, press Q to get back to the page. Now F (or the Wait
 * button) opens this small card over the page; picking a time writes the minutes into stats.wait_total_mins and opens the dossier AT its one-shot label codex_wait_now
 * (choicescript_stats.txt), which waits at once and ends with *finish, so the player is back on the very page they were on, and the one-line result shows as the sidebar's toast. The Rest button
 * does the same with codex_rest_now (an hour's short rest, one click). WHEN either is allowed is pagegate.js's decision; inside a dungeon on a quiet node the dungeon's own card (dungeonwait.js) opens instead.
 *
 * The until-morning, midday, dusk and night minutes are worked out here, the same way the scene's old wait_prep did (07:00, 12:00, 18:00, 21:00); the scene checks every wait again (a fight, a lock, a
 * body too starved to sit it out) and says why in the toast when it refuses.
 */
(function () {
  "use strict";

  var WC = window.WaitCard = window.WaitCard || {};

  function num(v) { var n = Number(v); return isFinite(n) ? n : 0; }
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function statsNow() { return window.stats || {}; }

  // "2 hours 15 min", "45 min": the same wording the scene's report uses.
  function spanText(m) {
    m = Math.max(0, Math.round(m));
    var h = Math.floor(m / 60), r = m % 60;
    return (h ? h + (h === 1 ? " hour" : " hours") : "") + (h && r ? " " : "") + (r ? r + " min" : "");
  }

  // Minutes from now to a clock time (07:00, 12:00, 18:00, 21:00), the next time it comes round; 0 when it is exactly that time now.
  WC.until = function (target, s) {
    s = s || statsNow();
    var now = num(s.clock_hour) * 60 + num(s.clock_minute);
    return (((target - now) % 1440) + 1440) % 1440;
  };

  var FIXED = [[15, "A quarter of an hour"], [30, "Half an hour"], [60, "An hour"], [120, "Two hours"]];
  var TIMES = [[420, "Until morning"], [720, "Until midday"], [1080, "Until dusk"], [1260, "Until night"]];

  // Hands the wait to the scene. openAt is the sidebar's openDossierAt, published by index.html as window.OpenDossierAt.
  WC.go = function (mins) {
    mins = Math.floor(num(mins));
    if (mins <= 0 || mins > 1439) return false;
    if (window.PageGate && window.PageGate.waitReason()) return false;
    if (typeof window.OpenDossierAt !== "function") return false;
    statsNow().wait_total_mins = mins;
    close();
    window.OpenDossierAt("codex_wait_now");
    return true;
  };

  WC.rest = function () {
    if (window.PageGate && window.PageGate.restReason()) return false;
    if (typeof window.OpenDossierAt !== "function") return false;
    window.OpenDossierAt("codex_rest_now");
    return true;
  };

  if (typeof document === "undefined") return;   // node tests stop here

  var dlg, elNow, elList, elHours, elMins;
  function build() {
    if (dlg) return;
    dlg = document.createElement("dialog");
    dlg.id = "waitCard";
    dlg.setAttribute("aria-label", "Wait");
    dlg.innerHTML =
      '<div class="dw-head"><h2 class="dw-title">Wait</h2><span class="dw-spacer"></span><button type="button" class="dw-close" data-act="close" aria-label="Close">×</button></div>' +
      '<div class="dw-note"></div><div class="dw-list"></div>' +
      '<div class="dw-custom"><span>Or</span><input type="number" class="dw-in" data-in="h" min="0" max="23" value="0" aria-label="Hours"><span>h</span>' +
      '<input type="number" class="dw-in" data-in="m" min="0" max="59" value="0" aria-label="Minutes"><span>min</span><button type="button" class="dw-go" data-act="custom">Wait</button></div>' +
      '<div class="dw-foot">Waiting costs the same hunger and tiredness as any other hours, and the weather and the day move on without you.</div>';
    document.body.appendChild(dlg);
    elNow = dlg.querySelector(".dw-note");
    elList = dlg.querySelector(".dw-list");
    elHours = dlg.querySelector('[data-in="h"]');
    elMins = dlg.querySelector('[data-in="m"]');
    dlg.addEventListener("click", function (ev) {
      var t = ev.target;
      if (t === dlg) { close(); return; }
      var btn = t && t.closest ? t.closest("[data-act],[data-mins]") : null;
      if (!btn) return;
      var act = btn.getAttribute("data-act");
      if (act === "close") { close(); return; }
      if (act === "custom") { WC.go(num(elHours.value) * 60 + num(elMins.value)); return; }
      var m = Number(btn.getAttribute("data-mins"));
      if (m) WC.go(m);
    });
    dlg.addEventListener("keydown", function (ev) {
      if (ev.key === "Enter" && ev.target && ev.target.classList && ev.target.classList.contains("dw-in")) { ev.preventDefault(); WC.go(num(elHours.value) * 60 + num(elMins.value)); }
    });
  }

  function paint() {
    var s = statsNow();
    elNow.textContent = "It is " + (s.clock_time || "") + ", " + (s.time_period || "") + ".";
    var html = FIXED.map(function (o) {
      return '<button type="button" class="dw-opt" data-mins="' + o[0] + '"><span class="dw-name">' + esc(o[1]) + '</span><span class="dw-cost"></span></button>';
    }).join("");
    TIMES.forEach(function (o) {
      var m = WC.until(o[0], s);
      if (m > 0) html += '<button type="button" class="dw-opt" data-mins="' + m + '"><span class="dw-name">' + esc(o[1]) + '</span><span class="dw-cost">about ' + esc(spanText(m)) + '</span></button>';
    });
    elList.innerHTML = html;
  }

  function open() {
    if (window.PageGate && window.PageGate.waitReason()) return;
    build();
    paint();
    if (!dlg.open) dlg.showModal();
  }
  function close() { if (dlg && dlg.open) dlg.close(); }
  WC.open = open;
  WC.close = close;

  // R takes the short rest at once, like the Rest button (2026-10-22, the user's call): F is Wait and T is Travel. Not while typing, not over another open panel, and only where the page allows a rest
  // (pagegate.js); the dossier's openDossierAt refuses on its own when the dossier is already open.
  document.addEventListener("keydown", function (ev) {
    if ((ev.key !== "r" && ev.key !== "R") || ev.ctrlKey || ev.metaKey || ev.altKey || ev.repeat) return;
    var target = ev.target, tag = target && target.tagName ? target.tagName.toLowerCase() : "";
    if (tag === "input" || tag === "textarea" || tag === "select" || (target && target.isContentEditable)) return;
    if (document.querySelector("dialog[open]")) return;
    if (window.PageGate && window.PageGate.restReason()) return;
    ev.preventDefault();
    WC.rest();
  });
})();
