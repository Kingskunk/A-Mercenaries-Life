/*
 * PAGE GATE (2026-10-22, the user's call) -- when the sidebar's Wait and Rest buttons (and the F key) may be used.
 *
 * Wait and Rest are an ALLOW-LIST, the way the Travel button is: they work only on a page that says it is open-world free time. A quest page, a radiant job, a conversation, a fight and the
 * whole prologue never say so, so nothing there has to remember a lock. Inside a dungeon the page decides too: only a quiet node (nothing on it but directions, chalk and ways out) allows them
 * (dungeonwait.js). (Before this, Wait was open on every page unless a scene set wait_lock_reason.)
 *
 * A page says it is open-world in one of three ways:
 *   1. It carries the hidden city walk option (citytravel.js): every Port Valen district hub and place menu.
 *   2. It is the overworld map page (overworldmap.js).
 *   3. The scene wrote the page's own number into wait_ok_page (*set wait_ok_page page_id) on the page that offers the menu. page_id goes up every time the player genuinely advances
 *      (scene.js resetPage), so the mark expires by itself on the next page, and survives the Dossier opening over the page (which replays it without advancing). Settlement hubs use this.
 * On top of that: never in a fight, never before the player is on their own (vane_independent_operative: the whole prologue), and never while a scene holds wait_lock_reason (a dungeon run,
 * the escort road), which stays the way a scene refuses with its own words.
 *
 * Each check returns the reason it refuses, or "" when allowed, so the buttons can say why they are grey.
 */
(function () {
  "use strict";

  var PG = window.PageGate = window.PageGate || {};

  function truthy(v) { return v === true || v === "true"; }
  function num(v) { var n = Number(v); return isFinite(n) ? n : 0; }
  function statsNow() { return window.stats || {}; }

  // Does the newest page say it is open-world free time?
  PG.openWorld = function () {
    var s = statsNow();
    if (window.CityTravel && window.CityTravel.onPage && window.CityTravel.onPage()) return true;
    if (window.OverworldMap && window.OverworldMap.available && window.OverworldMap.available()) return true;
    var mark = num(s.wait_ok_page);
    return mark > 0 && mark === num(s.page_id);
  };

  function common(s) {
    if (truthy(s.combat_engaged)) return "Not in the middle of a fight.";
    if (!truthy(s.vane_independent_operative)) return "There is no time to sit idle yet. That comes once you are on your own.";
    var lock = String(s.wait_lock_reason || "");
    if (lock) return lock;
    return "";
  }

  // Inside a dungeon run the page itself decides: a quiet node (only directions on it) carries the hidden wait option and allows both Wait and Rest; any other node allows neither. The dungeon's own
  // wait_lock_reason is not read there (it stays as the words for the rest of the game).
  function inDungeon(s) { return truthy(s.dg_in_run); }
  function quietNode() { return !!(window.DungeonWait && window.DungeonWait.onPage()); }

  PG.waitReason = function () {
    var s = statsNow();
    if (truthy(s.combat_engaged)) return "Not in the middle of a fight.";
    if (inDungeon(s)) return quietNode() ? "" : "You cannot sit idle here. Wait in a quiet passage, where there is nothing to do but move on.";
    var r = common(s);
    if (r) return r;
    if (!PG.openWorld()) return "You cannot sit idle here. Wait from the streets of a district, a town or the road.";
    return "";
  };

  PG.restReason = function () {
    var s = statsNow();
    if (truthy(s.combat_engaged)) return "Not in the middle of a fight.";
    if (inDungeon(s)) return quietNode() ? "" : "You cannot rest here. Rest in a quiet passage, where there is nothing to do but move on.";
    var r = common(s);
    if (r) return r;
    if (!PG.openWorld()) return "You cannot rest here. Rest from the streets of a district, a town or the road.";
    return "";
  };
})();
