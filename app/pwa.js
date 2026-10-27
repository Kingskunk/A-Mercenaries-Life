/*
 * pwa.js -- the page's side of the installed app (2026-10-27). tools/build_app.js adds it to dist/index.html; it is not part of the game and does nothing when the game is opened from a file or an
 * insecure address. It registers sw.js, asks the worker to sync (first download, refill, or look for a newer build) on every start and whenever the app comes back to the front, and shows one small
 * card in the corner: the first download's progress, "Update ready" with a Reload button, or a failure. The reload is the player's choice: saving first is the player's to do, and nothing is swapped mid-scene.
 */
(function () {
  "use strict";
  if (!("serviceWorker" in navigator)) return;
  var local = location.hostname === "localhost" || location.hostname === "127.0.0.1";
  if (location.protocol !== "https:" && !local) return;

  var card = null, hideTimer = 0, lastSync = 0, reloading = false;

  function el() {
    if (card) return card;
    card = document.createElement("div");
    card.id = "appUpdateCard";
    card.setAttribute("role", "status");
    card.style.cssText = "position:fixed;left:12px;bottom:12px;z-index:2147483000;max-width:min(92vw,22em);padding:10px 14px;border-radius:10px;border:1px solid #d9a441;background:rgba(18,16,15,.96);color:#eadfc8;font:14px/1.35 system-ui,sans-serif;box-shadow:0 6px 22px rgba(0,0,0,.55);display:none;align-items:center;gap:12px";
    document.body.appendChild(card);
    return card;
  }
  function show(text, button, keep) {
    var c = el();
    clearTimeout(hideTimer);
    c.textContent = "";
    var s = document.createElement("span");
    s.textContent = text;
    c.appendChild(s);
    if (button) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = button.label;
      b.style.cssText = "flex:none;padding:7px 14px;border-radius:8px;border:1px solid #d9a441;background:#2a2320;color:#f2cf7a;font:inherit;font-weight:700;cursor:pointer";
      b.addEventListener("click", button.fn);
      c.appendChild(b);
    }
    c.style.display = "flex";
    if (!keep) hideTimer = setTimeout(function () { c.style.display = "none"; }, 5000);
  }
  function hide() { if (card) card.style.display = "none"; }

  function post(msg) {
    navigator.serviceWorker.ready.then(function (reg) { if (reg.active) reg.active.postMessage(msg); });
  }
  function sync() { lastSync = Date.now(); post({ type: "sync" }); }

  navigator.serviceWorker.addEventListener("message", function (ev) {
    var d = ev.data || {};
    if (d.type === "progress") {
      if (d.done < d.total) show((d.phase === "update" ? "Downloading update " : "Downloading game files ") + Math.floor(100 * d.done / Math.max(1, d.total)) + "%", null, true);
      else if (d.phase === "first") show("Game files saved. It now works offline.");
      else hide();
    } else if (d.type === "update-ready") {
      show("Update ready. Save your game first.", { label: "Reload", fn: function () { post({ type: "apply" }); } }, true);
    } else if (d.type === "applied") {
      if (!reloading) { reloading = true; location.reload(); }
    } else if (d.type === "sync-failed") {
      hide();
    }
  });

  navigator.serviceWorker.register("sw.js").then(function () { sync(); }).catch(function () { /* the game plays without it */ });
  document.addEventListener("visibilitychange", function () { if (document.visibilityState === "visible" && Date.now() - lastSync > 5 * 60 * 1000) sync(); });
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(function () { /* a request only */ });
})();
