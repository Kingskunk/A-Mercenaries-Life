/*
 * levelup.js - the top-bar Level Up button.
 *
 * The button is only a shortcut and decides nothing. It shows while the game says a level is earned (level_up_ready, kept current by
 * ChoiceScript's refresh_level_up_progress, which every time advance and every district hub entry already runs through calendar.txt
 * update_hub_condition), and clicking it opens the dossier's own Level Up page (choicescript_stats codex_levelup), the same way the
 * Inventory's Rest card opens the Rest menu. The level itself is taken by ChoiceScript (startup.txt do_level_up), never by this file.
 * The same choice is also in the dossier's main menu, so the button may be missing (a fight, the dossier already open, a poll that has
 * not caught up yet) and nothing is lost.
 */
(function () {
  "use strict";

  var LU = window.LevelUp = window.LevelUp || {};

  function statsNow() { return window.stats || {}; }
  function truthy(v) { return v === true || v === "true"; }

  // The dossier is open when the running scene is the stats scene. The Show Stats button's data-return marker is NOT used: closing the
  // dossier from its own menu (Close Dossier & Return) leaves that marker set, so it would hide this button after any dossier visit.
  function dossierOpen() {
    var sc = statsNow().scene;
    return !!(sc && sc.secondaryMode === "stats");
  }

  // Not offered mid-fight (a level cannot be taken between rounds) or while the dossier is already open (its own menu has the choice).
  function canOpen() {
    return !dossierOpen() && !truthy(statsNow().combat_engaged) &&
      typeof window.Scene === "function" && typeof window.clearScreen === "function" && !!window.nav;
  }

  // The element is looked up on every poll, never cached: if the page ever rebuilds the button bar, a cached reference would point at
  // a detached button and the visible one would never change.
  function sync() {
    var btn = document.getElementById("levelUpButton");
    if (!btn) return;
    var show = truthy(statsNow().level_up_ready) && canOpen();
    var want = show ? "" : "none";
    if (btn.style.display !== want) btn.style.display = want;
  }

  LU.open = function () {
    if (!canOpen() || !truthy(statsNow().level_up_ready)) { sync(); return; }
    var scene = new window.Scene("choicescript_stats", window.stats, window.nav, { secondaryMode: "stats", saveSlot: "temp" });
    scene.targetLabel = { label: "codex_levelup", origin: "url", originLine: 0 };
    window.clearScreen(function () {
      if (typeof window.setButtonTitles === "function") window.setButtonTitles();
      scene.execute();
    });
  };
  LU.refresh = sync;

  window.setInterval(sync, 400);
  document.addEventListener("DOMContentLoaded", sync);
})();
