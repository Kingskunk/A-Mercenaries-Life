/*
 * QUEST JOURNAL (2026-11-01, the user's design): the sidebar's quest card had grown past a tooltip once a long quest such as the Wolves of Langston collected a dozen clues. Hovering a quest's name still shows a
 * compact preview (index.html paintQuestCard: the goal and the latest clues, ending "Click for full quest details"); clicking the name opens this panel, which holds the whole history. Escape, the close button and a
 * click outside all close it. It is built from the same quest-data.js entry (window.QUESTLOG) and window.stats as the card, at the moment it opens, so a clue appears only once the player has found it.
 */
(function () {
  "use strict";
  var dlg = null, lastFocus = null;

  function esc(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function qVal(v, s) { return typeof v === "function" ? v(s) : v; }
  function statsNow() { return window.stats || {}; }
  function find(id) {
    var list = window.QUESTLOG || [];
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }
  function ticks(have, need) {
    have = Math.max(0, Math.min(Number(have) || 0, Number(need) || 0)); need = Number(need) || 0;
    if (need <= 0 || need > 8) return "";
    var t = "";
    for (var i = 0; i < need; i++) t += i < have ? "●" : "○";
    return t;
  }

  function build() {
    if (dlg) return;
    dlg = document.createElement("dialog");
    dlg.id = "questJournal";
    dlg.setAttribute("aria-label", "Quest details");
    dlg.addEventListener("click", function (ev) {
      // a click on the dialog's own backdrop lands on the dialog element itself; clicks inside land on its children
      if (ev.target === dlg || (ev.target.getAttribute && ev.target.getAttribute("data-act") === "close")) close();
    });
    document.body.appendChild(dlg);
  }

  function paint(q, s) {
    var giver = qVal(q.giver, s), place = qVal(q.place, s), goal = qVal(q.goal, s), title = qVal(q.title, s);
    var kind = q.group === "job" ? "Hiring Hall job" : "Quest";
    var h = "<div class=\"qj-head\"><div class=\"qj-titles\"><h2>" + esc(title) + "</h2><div class=\"qj-kind\">" + esc(kind) + (place ? " • " + esc(place) : "") + "</div></div>" +
      "<button type=\"button\" class=\"qj-close\" data-act=\"close\" aria-label=\"Close quest details\">×</button></div>";
    h += "<div class=\"qj-top\">";
    if (goal) h += "<p class=\"qj-label\">Current objective</p><div class=\"qj-objective\">" + esc(goal) + "</div>";
    var prog = q.progress ? (q.progress(s) || []) : [];
    prog.forEach(function (p) {
      var have = Math.min(Number(p.have) || 0, Number(p.need) || 0), need = Number(p.need) || 0;
      h += "<div class=\"qj-prog\"><span>" + esc(p.label) + "</span><span class=\"qj-ticks\">" + ticks(p.have, p.need) + "</span><span>" + have + "/" + need + "</span></div>";
    });
    var meta = [];
    if (giver) meta.push("<b>Given by</b> " + esc(giver));
    if (place) meta.push("<b>Location</b> " + esc(place));
    if (meta.length) h += "<p class=\"qj-meta\">" + meta.join("<span class=\"qj-sep\">·</span>") + "</p>";
    h += "</div>";
    var clues = q.clues ? (q.clues(s) || []) : [];
    h += "<div class=\"qj-log\"><p class=\"qj-label\">" + "What you know so far" + "</p>";
    if (clues.length) {
      h += "<ol class=\"qj-timeline\">" + clues.map(function (c, i) {
        return "<li" + (i === clues.length - 1 ? " class=\"qj-latest\"" : "") + ">" + esc(c) + "</li>";
      }).join("") + "</ol>";
    } else h += "<p class=\"qj-empty\">Nothing yet.</p>";
    h += "</div>";
    dlg.innerHTML = h;
  }

  function open(id) {
    var s = statsNow(), q = find(id);
    if (!q) return;
    try { if (!q.active(s)) return; } catch (e) { return; }
    build();
    var tip = document.getElementById("csTip");
    if (tip) tip.classList.remove("on");   // the hover card has done its job
    paint(q, s);
    if (dlg.open) return;
    lastFocus = document.activeElement;
    if (!dlg.showModal) return;
    dlg.showModal();
    var btn = dlg.querySelector(".qj-close");
    if (btn && btn.focus) btn.focus();
  }
  function close() {
    if (dlg && dlg.open) dlg.close();
    if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) { } }
    lastFocus = null;
  }

  window.QuestJournal = { open: open, close: close };

  // The sidebar is rebuilt every few hundred milliseconds, so one listener on the document finds the clicked quest name each time.
  document.addEventListener("click", function (ev) {
    var hot = ev.target && ev.target.closest ? ev.target.closest("#statSidebar .qHot") : null;
    var row = hot && hot.closest ? hot.closest(".qItem[data-quest]") : null;
    if (row) open(row.getAttribute("data-quest"));
  });
})();
