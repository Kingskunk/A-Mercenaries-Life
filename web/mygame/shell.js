/*
 * SHELL: the left rail (stage 2 of the interface redesign, 2026-10-02).
 *
 * The page's own button row (Show Stats, Lorebook, Inventory, Trade, Save / Load, Menu, Level Up) sits inside the engine's page container, which the engine copies and
 * animates on every page turn, so it cannot be moved or restyled safely. It stays in the page, hidden (shell.css), and this builds a persistent rail OUTSIDE the
 * containers whose buttons click the real ones. Nothing is duplicated in logic: the real buttons still do everything, and the rail only mirrors their state -- whether
 * each is showing (Trade and Level Up appear and vanish), the Lorebook's unread badge, and "Return" while the dossier or menu is open.
 *
 * Every real button is looked up by id on every click and every poll, never cached, for the reason levelup.js gives: the engine can rebuild the button bar.
 */
(function () {
  "use strict";

  // [real button id, icon key, rail label]
  var ITEMS = [
    ["statsButton", "stats", "Stats"],
    ["lorebookButton", "lore", "Lore"],
    ["inventoryButton", "pack", "Pack"],
    ["tradeButton", "trade", "Trade"],
    ["saveLoadButton", "save", "Save"]
  ];
  var rail = null, entries = [], level = null, menu = null;

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); }

  function realClick(id) {
    var real = document.getElementById(id);
    if (real) real.click();
  }

  function build() {
    rail = document.createElement("nav");
    rail.id = "rail";
    rail.setAttribute("aria-label", "Game menu");
    var html = "";
    ITEMS.forEach(function (it) {
      html += "<button type=\"button\" class=\"rbtn\" data-real=\"" + it[0] + "\" data-i=\"" + it[1] + "\" title=\"" + esc(it[2]) + "\"><i></i><span class=\"rbadge\" hidden></span></button>" +
              "<div class=\"rlabel\" data-for=\"" + it[0] + "\">" + esc(it[2]) + "</div>";
    });
    // Read aloud (the TTS reader in index.html). Its own floating launcher and control strip are hidden (shell.css); these buttons click them, like every other rail
    // button. Read starts the reader, then becomes play / pause; Stop and Settings and a one-line status appear once it is on. Hidden if the reader is not on the page.
    html += "<button type=\"button\" class=\"rbtn\" data-tts=\"read\" data-i=\"read\" title=\"Read this story aloud\" hidden><i></i></button>" +
            "<div class=\"rlabel\" data-tts-label=\"read\" hidden>Read</div>" +
            "<div class=\"rtts\" hidden>" +
              "<button type=\"button\" class=\"rmini\" data-tts=\"stop\" title=\"Stop reading\">&#9632;</button>" +
              "<button type=\"button\" class=\"rmini\" data-tts=\"gear\" title=\"Reader settings\">&#9881;</button>" +
            "</div>" +
            "<div class=\"rlabel rstatus\" data-tts-label=\"status\" hidden></div>";
    // The dungeon map: not a mirror of a page button, it opens dungeonmap.js. Hidden unless a dungeon run is on and something has been mapped (see sync).
    html += "<button type=\"button\" class=\"rbtn\" data-open=\"dungeonmap\" data-i=\"map\" title=\"Map (M)\" hidden><i></i></button>" +
            "<div class=\"rlabel\" data-for=\"dungeonmap\" hidden>Map</div>";
    html += "<div class=\"rspacer\"></div>" +
            "<button type=\"button\" class=\"rlevel\" data-real=\"levelUpButton\" title=\"You have earned a level\" hidden>&#9733;<br>LEVEL<br>UP</button>" +
            "<button type=\"button\" class=\"rbtn\" data-real=\"menuButton\" data-i=\"menu\" title=\"Menu\"><i></i><span class=\"rbadge\" hidden></span></button>" +
            "<div class=\"rlabel\" data-for=\"menuButton\">Menu</div>";
    rail.innerHTML = html;
    document.body.appendChild(rail);
    rail.addEventListener("click", function (ev) {
      var t = ev.target;
      while (t && t !== rail && !(t.getAttribute && (t.getAttribute("data-real") || t.getAttribute("data-open") || t.getAttribute("data-tts")))) t = t.parentNode;
      if (t && t !== rail) {
        if (t.getAttribute("data-tts")) ttsClick(t.getAttribute("data-tts"));
        else if (t.getAttribute("data-open") === "dungeonmap") {
          // The Map button opens whichever map applies where the player is: the dungeon map inside a dungeon run, the overworld map on the overworld (it hides or shows the map there).
          if (window.DungeonMap && window.DungeonMap.available()) window.DungeonMap.toggle();
          else if (window.OverworldMap && window.OverworldMap.available()) window.OverworldMap.toggle();
        }
        else realClick(t.getAttribute("data-real"));
      }
    });
  }

  // The reader is on once its launcher has been clicked (that click hides the launcher); it is playing while its play / pause button shows the pause glyph.
  function ttsState() {
    var launcher = document.getElementById("ttsLauncher");
    if (!launcher) return { present: false, on: false, playing: false, status: "" };
    var pp = document.getElementById("ttsPlayPause"), st = document.getElementById("ttsStatus");
    var r = window.TTSReader;
    return { present: true, on: launcher.style.display === "none", playing: !!pp && pp.textContent.indexOf("❚") >= 0, status: st ? st.textContent : "",
             idle: !!(r && r.isIdle && r.isIdle()) };
  }
  function ttsClick(what) {
    var st = ttsState();
    if (!st.present) return;
    if (what === "read") realClick(st.on ? "ttsPlayPause" : "ttsLauncher");
    // Stop stops; once nothing is playing or queued it becomes the off switch (its glyph turns to a cross).
    else if (what === "stop") { if (st.idle && window.TTSReader.turnOff) window.TTSReader.turnOff(); else realClick("ttsStop"); }
    else if (what === "gear") realClick("ttsGear");
  }
  function setHidden(el, hide) { if (el && el.hidden !== hide) el.hidden = hide; }
  function syncTts() {
    var st = ttsState();
    var btn = rail.querySelector("[data-tts=\"read\"]"), lab = rail.querySelector("[data-tts-label=\"read\"]");
    var minis = rail.querySelector(".rtts"), stat = rail.querySelector("[data-tts-label=\"status\"]");
    setHidden(btn, !st.present); setHidden(lab, !st.present);
    setHidden(minis, !(st.present && st.on)); setHidden(stat, !(st.present && st.on));
    if (!st.present) return;
    btn.classList.toggle("back", st.playing);
    var word = !st.on ? "Read" : (st.playing ? "Pause" : "Play");
    if (lab.textContent !== word) lab.textContent = word;
    var tip = !st.on ? "Read this story aloud" : (st.playing ? "Pause reading" : "Play reading");
    if (btn.getAttribute("title") !== tip) btn.setAttribute("title", tip);
    var stopBtn = rail.querySelector("[data-tts=\"stop\"]");
    var stopGlyph = st.idle ? "✕" : "■", stopTip = st.idle ? "Turn the reader off" : "Stop reading";
    if (stopBtn.textContent !== stopGlyph) stopBtn.textContent = stopGlyph;
    if (stopBtn.getAttribute("title") !== stopTip) stopBtn.setAttribute("title", stopTip);
    if (stat.textContent !== st.status) stat.textContent = st.status;
    if (stat.getAttribute("title") !== st.status) stat.setAttribute("title", st.status);
  }

  // The real button is "showing" unless the page (or a panel script) has display:none'd it. Trade and Level Up start hidden.
  function showing(real) { return !!real && real.style.display !== "none"; }

  function sync() {
    if (!rail) return;
    var s = window.stats || {};
    var btns = rail.querySelectorAll("[data-real]");
    for (var i = 0; i < btns.length; i++) {
      var b = btns[i], id = b.getAttribute("data-real"), real = document.getElementById(id);
      var on = showing(real);
      // The Stats and Menu buttons turn into "Return to the Game" while their screen is open: show it as a lit ring.
      b.classList.toggle("back", !!(real && real.getAttribute("data-return")));
      if (id === "tradeButton" || id === "levelUpButton") {
        if (b.hidden === on) b.hidden = !on;
        var lab = rail.querySelector(".rlabel[data-for=\"" + id + "\"]");
        if (lab && lab.hidden === on) lab.hidden = !on;
      }
      var badge = b.querySelector(".rbadge");
      if (badge) {
        var src = real && real.querySelector(".lb-badge");
        var txt = src ? src.textContent : "";
        if (txt) { if (badge.textContent !== txt) badge.textContent = txt; if (badge.hidden) badge.hidden = false; }
        else if (!badge.hidden) badge.hidden = true;
      }
      // the real button's own title carries the unread count ("3 new lorebook entries"), so the rail shows it too
      var rt = real ? (real.getAttribute("title") || "") : "";
      if (rt && b.getAttribute("title") !== rt) b.setAttribute("title", rt);
    }
    syncTts();
    // the map button shows inside a dungeon run once something has been mapped, and on the overworld
    var mapBtn = rail.querySelector("[data-open=\"dungeonmap\"]"), mapLab = rail.querySelector(".rlabel[data-for=\"dungeonmap\"]");
    var haveMap = !!((window.DungeonMap && window.DungeonMap.available()) || (window.OverworldMap && window.OverworldMap.available()));
    if (mapBtn && mapBtn.hidden === haveMap) mapBtn.hidden = !haveMap;
    if (mapLab && mapLab.hidden === haveMap) mapLab.hidden = !haveMap;
    // room is reserved for the sidebar only while it is showing (it hides itself until the character exists)
    var sb = document.getElementById("statSidebar");
    var side = !!(sb && sb.style.display !== "none");
    if (document.documentElement.classList.contains("hasSidebar") !== side) document.documentElement.classList.toggle("hasSidebar", side);
  }

  var queued = false;
  function queue() { if (!queued) { queued = true; window.requestAnimationFrame(function () { queued = false; sync(); }); } }

  // The window used to scroll, and the browser opened every new page at the top by itself. The story scrolls inside its frame now, and replacing its contents
  // keeps the old scroll position, so every page turn resets it. clearScreen is the engine's single page-turn entry point (ui.js).
  function resetStoryScroll() {
    var m = document.getElementById("main");
    if (m) m.scrollTop = 0;
  }
  function hookPageTurns() {
    var orig = window.clearScreen;
    if (typeof orig !== "function" || orig.__shellHooked) return;
    var wrapped = function () {
      var r = orig.apply(this, arguments);
      resetStoryScroll();
      return r;
    };
    wrapped.__shellHooked = true;
    window.clearScreen = wrapped;
  }

  // Double-clicking a choice takes it (choose and go), so a mouse player does not need the Next button. Single click still only selects; Enter and Space and the
  // Next button are unchanged. The Next button is looked up at the moment, because the engine rebuilds it on every page.
  document.addEventListener("dblclick", function (ev) {
    var row = ev.target && ev.target.closest ? ev.target.closest("#main .choice > div") : null;
    if (!row) return;
    var radio = row.querySelector("input[type=radio]");
    if (!radio || radio.disabled) return;
    radio.checked = true;
    var next = document.querySelector("#main button.next, #main .next");
    if (next) { ev.preventDefault(); next.click(); }
  });

  function start() {
    hookPageTurns();
    build();
    sync();
    if (window.MutationObserver) new MutationObserver(queue).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["style", "data-return", "title"] });
    window.setInterval(sync, 500);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
