/*
 * scrollkeys.js -- two keys for the left hand, for jumping a long page without reaching for Home and End (the user's call, 2026-10-18):
 *   A  scroll the story to its top          D  scroll the story to its bottom
 *   Shift+A and Shift+D do the same for the right-hand stat sidebar (#statSidebar), which has a scroll bar of its own.
 * The story does not scroll the page: html and body are overflow hidden, and the text scrolls inside #main, which is why the browser's own Home and End only work while the pointer or focus is over it.
 * Like the engine's own keys (web/ui.js) these are ignored while typing in a text box (not while a choice's radio button has focus, which it always does), with Ctrl, Alt or Cmd held, and while a panel (a dialog) is open. The battle hotbar uses the number keys, so nothing clashes.
 */
(function () {
  "use strict";
  function jump(el, top) {
    if (!el || el.scrollHeight <= el.clientHeight) return false;
    el.scrollTo({ top: top ? 0 : el.scrollHeight, behavior: "instant" });
    return true;
  }
  document.addEventListener("keydown", function (ev) {
    var k = ev.key;
    if (k !== "a" && k !== "A" && k !== "d" && k !== "D") return;
    if (ev.ctrlKey || ev.metaKey || ev.altKey || ev.repeat) return;
    var t = ev.target, tag = t && t.tagName;
    if (tag === "TEXTAREA" || tag === "SELECT" || (t && t.isContentEditable)) return;
    if (tag === "INPUT" && /^(text|search|number|email|password|url|tel)$/i.test(t.type)) return;
    if (document.querySelector("dialog[open]")) return;
    var top = (k === "a" || k === "A");
    if (jump(document.getElementById(ev.shiftKey ? "statSidebar" : "main"), top)) ev.preventDefault();
  });
})();
