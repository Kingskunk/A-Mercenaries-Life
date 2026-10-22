/*
 * DUNGEON WAIT (2026-10-22, the user's call) -- waiting inside a dungeon, only on a quiet node.
 *
 * The same pattern as the Travel button (citytravel.js): the panel owns picking, the scene owns the wait. Every dungeon node page carries one hidden option, "⏳ Wait a while. [dungeon_wait]".
 * On a QUIET node, a page with nothing on it but directions, chalk and ways out (the test the dungeon map uses to fold itself, DungeonMap.quiet), the sidebar's Wait button (and F) open a
 * small card instead of the Wait menu: 15 minutes, 30 minutes or an hour. Picking one writes dg_wait_mins and presses the hidden option; the scene (dungeon.txt dg_wait) runs the clock, burns
 * the light and rolls its one encounter, and the dungeon's own wait label handles the result exactly as it handles a step. A node with anything to do on it carries the option too, but this
 * file reports "not here" (onPage false) for it, so PageGate (pagegate.js) refuses Wait and Rest there. The scene's cap (dg_wait_cap, two hours a run) is shown here and enforced there.
 */
(function () {
  "use strict";

  var MARK = "⏳";   // ⏳, the hidden option's label starts with it
  var DW = window.DungeonWait = window.DungeonWait || {};

  function truthy(v) { return v === true || v === "true"; }
  function num(v) { var n = Number(v); return isFinite(n) ? n : 0; }
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function statsNow() { return window.stats || {}; }

  // The live page's form: the engine keeps a faded copy of the old page beside the new one during a page change, so look in the live container first (as dungeonmap.js does).
  function liveForm() {
    if (typeof document === "undefined") return null;
    var f = document.querySelector("#container1 form");
    if (f) return f;
    var forms = document.querySelectorAll("#main form");
    return forms.length ? forms[forms.length - 1] : null;
  }

  function findWait() {
    var form = liveForm();
    var labels = form ? form.querySelectorAll(".choice label") : [];
    for (var i = 0; i < labels.length; i++) {
      var text = (labels[i].textContent || "").replace(/\s+/g, " ").trim();
      if (text.indexOf(MARK) !== 0 || !/\[dungeon_wait\]\s*$/.test(text)) continue;
      var radio = labels[i].querySelector("input[type=radio]");
      if (radio && !radio.disabled) return { label: labels[i], radio: radio };
    }
    return null;
  }

  // Is the page a quiet node that offers a wait? (Inside a dungeon run, the option is on the page and nothing but directions, chalk and ways out is.)
  DW.onPage = function () {
    if (!truthy(statsNow().dg_in_run) || truthy(statsNow().combat_engaged)) return false;
    if (!findWait()) return false;
    return !!(window.DungeonMap && window.DungeonMap.quiet && window.DungeonMap.quiet());
  };

  DW.remaining = function () { var s = statsNow(); return Math.max(0, num(s.dg_wait_cap) - num(s.dg_wait_total)); };

  // Does the light burn for this character? Not with darkvision, the Light cantrip, or no light lit (the scene decides; this only words the card).
  function burns(s) { return !truthy(s.sees_in_dark) && !truthy(s.known_light) && num(s.dg_light_left) > 0; }

  var pressed = false;
  function press(radio) {
    if (!radio || pressed || !radio.form || !document.documentElement.contains(radio)) return;
    pressed = true;
    radio.checked = true;
    if (typeof radio.form.onsubmit === "function") radio.form.onsubmit();
  }

  DW.go = function (mins) {
    var w = findWait();
    if (!w || !DW.onPage() || (mins !== 15 && mins !== 30 && mins !== 60) || mins > DW.remaining()) return false;
    statsNow().dg_wait_mins = mins;
    close();
    pressed = false;
    press(w.radio);
    return true;
  };

  if (typeof document === "undefined") return;   // node tests stop here

  var dlg, elList, elNote;
  function build() {
    if (dlg) return;
    dlg = document.createElement("dialog");
    dlg.id = "dungeonWait";
    dlg.setAttribute("aria-label", "Wait");
    dlg.innerHTML =
      '<div class="dw-head"><h2 class="dw-title">Wait here</h2><span class="dw-spacer"></span><button type="button" class="dw-close" data-act="close" aria-label="Close">×</button></div>' +
      '<div class="dw-note"></div><div class="dw-list"></div>' +
      '<div class="dw-foot">Time passes and a light burns while you sit, and the place may find you. The longest you can sit in one visit is two hours.</div>';
    document.body.appendChild(dlg);
    elNote = dlg.querySelector(".dw-note");
    elList = dlg.querySelector(".dw-list");
    dlg.addEventListener("click", function (ev) {
      var t = ev.target;
      if (t === dlg) { close(); return; }
      var btn = t && t.closest ? t.closest("[data-act],[data-mins]") : null;
      if (!btn) return;
      if (btn.getAttribute("data-act") === "close") { close(); return; }
      var m = Number(btn.getAttribute("data-mins"));
      if (m && !btn.disabled) DW.go(m);
    });
  }

  function paint() {
    var s = statsNow(), left = DW.remaining(), lit = burns(s);
    elNote.textContent = left > 0 ? "You can still sit " + left + " minutes on this visit." : "You have sat here as long as you can.";
    elList.innerHTML = [[15, "A quarter of an hour"], [30, "Half an hour"], [60, "An hour"]].map(function (o) {
      var steps = o[0] / 15;
      return '<button type="button" class="dw-opt" data-mins="' + o[0] + '"' + (o[0] > left ? " disabled" : "") + '><span class="dw-name">' + esc(o[1]) + '</span><span class="dw-cost">' + (lit ? steps + (steps === 1 ? " step of light" : " steps of light") : "") + '</span></button>';
    }).join("");
  }

  function open() {
    if (!DW.onPage()) return;
    build();
    paint();
    if (!dlg.open) dlg.showModal();
  }
  function close() { if (dlg && dlg.open) dlg.close(); }
  DW.open = open;
  DW.close = close;

  // The hidden option stays hidden on every page; the dialog closes when the page stops being a quiet node (after a wait, a step, an encounter).
  var scanQueued = false;
  function scan() {
    scanQueued = false;
    var w = findWait();
    if (w && w.label.parentNode && w.label.parentNode.style.display !== "none") w.label.parentNode.style.display = "none";
    if (dlg && dlg.open && !DW.onPage()) close();
    if (w) pressed = false;
  }
  function queueScan() { if (!scanQueued) { scanQueued = true; window.requestAnimationFrame(scan); } }
  function start() {
    if (window.MutationObserver) new MutationObserver(queueScan).observe(document.body, { childList: true, subtree: true });
    window.setInterval(scan, 700);
    scan();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
