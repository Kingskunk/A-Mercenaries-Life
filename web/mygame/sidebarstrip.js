/*
 * SIDEBAR STRIP (2026-10-27, the user: hide the stat sidebar to free its column, and keep a compact card in the banner row).
 *
 * The sidebar (#statSidebar, drawn by index.html's renderStatSidebar) is a fixed column; the story reserves its width (--side-w) while it shows. This module adds:
 *   - a way to fold it away: the round portrait at the top of the sidebar (index.html puts data-ss-collapse on it) turns on html.sbHidden, remembered in localStorage;
 *   - a strip beside the place banner, drawn outside the page containers (the engine copies and animates those on every page turn, so nothing can live inside them), showing what the player needs to see
 *     out of combat: hunger, fatigue and hygiene as pills, the time, day and date, the period and weather, the purse, Wait / Rest / Travel, the spellbook for a caster, and the button that opens the sidebar again;
 *   - on a narrow window (the same 1100px line index.html hides the sidebar at, where it used to be missing altogether) the sidebar opens as a drawer over the story instead of a docked column.
 * In a fight on a wide window the sidebar comes back by itself (it holds the turn order); folding it while the fight lasts is allowed, and the fight's end returns to the player's choice.
 *
 * Nothing here has game logic. The values are read from window.stats (the same fields the sidebar reads); Wait / Rest / Travel click the sidebar's own buttons (they exist in the DOM even while it is hidden, and the
 * sidebar's click handler does the work and decides whether each is allowed: their disabled state and tooltip are mirrored); the spellbook button opens the sidebar and its spellbook.
 */
(function () {
  "use strict";

  var KEY = "sidebar_folded";
  var NARROW = window.matchMedia ? window.matchMedia("(max-width: 1100px)") : { matches: false };
  var html = document.documentElement;
  var strip = null, lastStrip = "", folded = false, drawer = false, combatDismissed = false, wasCombat = false;

  try { folded = window.localStorage.getItem(KEY) === "1"; } catch (e) { /* no storage: the sidebar simply shows */ }

  function isTruthy(v) { return v === true || v === "true"; }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); }
  function save() { try { window.localStorage.setItem(KEY, folded ? "1" : "0"); } catch (e) { /* the choice lasts until the page closes */ } }
  function zoom() { return window.UI_ZOOM || 1; }

  // ---- the pieces of the strip ----------------------------------------------------------------------------------------------------------
  // hunger, fatigue and hygiene, with the same stages and warn/bad rules as the sidebar's chips (index.html condChip), only for the player who is loose in Port Valen
  function needPill(stage, warn, bad) {
    var cls = stage === bad ? " bad" : (stage === warn ? " warn" : "");
    return "<span class=\"ssCond" + cls + "\">" + esc(stage) + "</span>";
  }
  function pillsHtml(s) {
    var out = "";
    if (isTruthy(s.vane_independent_operative)) {
      out += needPill(String(s.hunger_stage || ""), "Hungry", "Starving") +
             needPill(isTruthy(s.well_rested_active) ? "Well Rested" : String(s.fatigue_stage || ""), "Exhausted", "Collapsing") +
             needPill(String(s.hygiene_stage || ""), "Grubby", "Foul");
    }
    // health shows only when the player is hurt (the full sidebar has the bar)
    var hp = Number(s.hp_current), max = Number(s.hp_max);
    if (isFinite(hp) && isFinite(max) && max > 0 && hp < max) out += "<span class=\"ssCond " + (hp * 3 <= max ? "bad" : "warn") + "\">HP " + hp + "/" + max + "</span>";
    if (isTruthy(s.combat_engaged)) out += "<span class=\"ssCond bad\">Combat</span>";
    return out;
  }
  function purseText(s) {
    var g = Number(s.gold) || 0, si = Number(s.silver) || 0, c = Number(s.copper) || 0, t = "";
    if (g) t += g + "g ";
    if (si) t += si + "s ";
    if (c || !t) t += c + "c";
    return t.replace(/\s+$/, "");
  }
  function realBtn(attr) { return document.querySelector("#statSidebar [" + attr + "]"); }
  function proxyBtn(label, attr, key) {
    var real = realBtn(attr), off = !real || real.disabled;
    var tip = real ? (real.getAttribute("title") || "") : "Not available right now.";
    return "<button type=\"button\" class=\"ssBtn\" data-ss-proxy=\"" + key + "\" title=\"" + esc(tip) + "\"" + (off ? " disabled" : "") + ">" + label + "</button>";
  }
  function stripHtml(s) {
    var date = String(s.calendar_date || "").split(",")[0], day = s.day_of_week ? String(s.day_of_week) : "";
    var dayLine = (day && date) ? day + ", " + date : (day || date);
    // the spellbook button is for a player who has spells: the sidebar's own summary reads "Spellbook (4)"
    var sum = document.querySelector("#statSidebar .spellbook > summary"), spells = !!sum && (Number((/\((\d+)\)/.exec(sum.textContent) || [])[1]) || 0) > 0;
    return "<span class=\"ssWhen\"><span class=\"ssNow\"><b>" + esc(s.clock_time || "") + "</b><span class=\"ssPer\">" + esc((s.time_period ? " · " + s.time_period : "") + (s.weather ? " · " + s.weather : "")) + "</span></span><small class=\"ssDate\">" + esc(dayLine) + "</small></span>" +
      "<span class=\"ssConds\">" + pillsHtml(s) + "</span>" +
      "<span class=\"ssPurse\" title=\"Your purse\">" + esc(purseText(s)) + "</span>" +
      "<span class=\"ssBtns\">" + proxyBtn("Wait", "data-wait-open", "wait") + proxyBtn("Rest", "data-rest-open", "rest") + proxyBtn("Travel", "data-travel-open", "travel") +
      (spells ? "<button type=\"button\" class=\"ssBtn\" data-ss-spells=\"1\" title=\"Open the spellbook\">Spells</button>" : "") +
      "<button type=\"button\" class=\"ssBtn ssOpen\" data-ss-expand=\"1\" title=\"Show the full sidebar\" aria-label=\"Show the full sidebar\">«</button></span>";
  }

  function build() {
    strip = document.createElement("div");
    strip.id = "sbStrip";
    strip.setAttribute("role", "group");
    strip.setAttribute("aria-label", "Status");
    document.body.appendChild(strip);
  }

  // ---- state ------------------------------------------------------------------------------------------------------------------------------
  function sync() {
    if (!strip) build();
    var s = window.stats || {};
    var charOn = !!(s.intake_completed && s.intake_completed !== "false");
    var wide = !NARROW.matches;
    var combat = isTruthy(s.combat_engaged);
    if (combat && !wasCombat) combatDismissed = false;
    if (!combat && wasCombat) combatDismissed = false;
    wasCombat = combat;

    // the sidebar is folded away when the player chose that (and it is not a fight they have not dismissed), and always on a narrow window (where it is a drawer, opened on request)
    var away = wide ? (folded && !(combat && !combatDismissed)) : true;
    if (!wide && !charOn) drawer = false;
    html.classList.toggle("sbHidden", charOn && wide && away);
    html.classList.toggle("sbDrawer", charOn && !wide && drawer);
    var showStrip = charOn && away;   // in a fight the sidebar is up by itself (away is false), unless the player folded it: then the strip is the way back
    html.classList.toggle("sbStripOn", showStrip);
    if (showStrip) place(s); else if (strip.style.display !== "none") strip.style.display = "none";
  }

  // line the strip up in the banner row: right of the place banner, to the right edge of the header, over the story column (positions are CSS pixels inside the zoomed page)
  function place(s) {
    var hdrs = document.querySelectorAll("#header"), hdr = hdrs.length ? hdrs[hdrs.length - 1] : null;
    var ban = hdr ? hdr.querySelector("h1.gameTitle") : null;
    if (!hdr || !ban) { strip.style.display = "none"; return; }
    var z = zoom(), h = hdr.getBoundingClientRect(), b = ban.getBoundingClientRect();
    if (!h.width || !b.width) { strip.style.display = "none"; return; }
    var left = (b.right + 14) / z, right = h.right / z, avail = right - left;
    if (avail < 150) { strip.style.display = "none"; return; }
    var size = avail >= 640 ? "full" : (avail >= 500 ? "mid" : "tight");
    var markup = stripHtml(s);
    if (markup !== lastStrip) { strip.innerHTML = markup; lastStrip = markup; }
    if (strip.getAttribute("data-size") !== size) strip.setAttribute("data-size", size);
    var top = (b.top + b.height / 2) / z - 24;
    strip.style.cssText = "display:flex;left:" + Math.round(left) + "px;width:" + Math.round(avail) + "px;top:" + Math.round(top) + "px";
  }

  function expand() {
    if (NARROW.matches) drawer = true; else { folded = false; combatDismissed = false; save(); }
    sync();
  }
  function collapse() {
    if (NARROW.matches) drawer = false; else { folded = true; combatDismissed = true; save(); }
    sync();
  }

  document.addEventListener("click", function (ev) {
    var t = ev.target && ev.target.closest ? ev.target : null;
    if (!t) return;
    var b;
    if ((b = t.closest("[data-ss-expand]"))) { expand(); return; }
    if ((b = t.closest("[data-ss-collapse]"))) { collapse(); return; }
    if ((b = t.closest("[data-ss-proxy]"))) {
      var attr = { wait: "data-wait-open", rest: "data-rest-open", travel: "data-travel-open" }[b.getAttribute("data-ss-proxy")], real = attr ? realBtn(attr) : null;
      if (real && !real.disabled) real.click();
      return;
    }
    if ((b = t.closest("[data-ss-spells]"))) {
      expand();
      // the spellbook is a <details> the sidebar toggles from its summary: open it (once the sidebar has been drawn showing) and bring it into view
      window.setTimeout(function () {
        var sum = document.querySelector("#statSidebar .spellbook > summary"), det = sum && sum.parentNode;
        if (sum && det && !det.hasAttribute("open")) sum.click();
        var box = document.querySelector("#statSidebar .sbSpells");
        if (box && box.scrollIntoView) box.scrollIntoView({ block: "nearest" });
      }, 60);
      return;
    }
    // a drawer closes when the story is tapped
    if (drawer && NARROW.matches && !t.closest("#statSidebar")) { drawer = false; sync(); }
  });

  // the portrait is a button for the keyboard too
  document.addEventListener("keydown", function (ev) {
    if ((ev.key === "Enter" || ev.key === " ") && ev.target && ev.target.matches && ev.target.matches("#statSidebar .sbRing[data-ss-collapse]")) { ev.preventDefault(); collapse(); }
  });

  window.addEventListener("resize", sync);
  if (NARROW.addEventListener) NARROW.addEventListener("change", sync);
  window.setInterval(sync, 400);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", sync); else sync();

  window.SidebarStrip = { expand: expand, collapse: collapse, isFolded: function () { return folded; } };
})();
