/*
 * sw.js -- the app's service worker (2026-10-27). It keeps the whole game on the device so it plays offline, and it fetches new builds itself instead of waiting for the browser to notice a changed sw.js.
 *
 * The build (tools/build_app.js) writes asset-manifest.json: { build, files: { path: { h: hash, s: bytes } }, core: [paths] }. This file never changes between builds. The pieces:
 *   one cache per build ("cs-<build>") holds that build's files; a small meta cache ("cs-meta") names the CURRENT build (the one being served) and a PENDING one (downloaded whole, waiting for the player).
 *   sync        fetch asset-manifest.json (live, never cached). First run: download every file, core first (the game page, manifest, icons), and name the build current as soon as the core is in, so the game starts
 *               playing offline while the sounds and backdrops are still arriving. Same build: fetch whatever is missing. A newer build: download it into its own cache (files whose hash is unchanged are COPIED from the
 *               current cache, so only what changed travels), and only when every file is in, mark it pending and tell the page. The page offers "Reload"; nothing changes under a player mid-scene.
 *   apply       the pending build becomes current, the old caches go, the page reloads itself.
 * Every request this worker makes carries ngrok-skip-browser-warning, so a free ngrok tunnel's interstitial page is never mistaken for a game file.
 * Audio is answered with 206 range responses cut from the cached file (an <audio> element asks for ranges, and a plain cached 200 breaks seeking and looping on some browsers).
 */
"use strict";

var META = "cs-meta";
var BASE = self.registration.scope;                       // ends with "/": the app may sit at a domain root or under a folder
var HEADERS = { "ngrok-skip-browser-warning": "true" };
var memo = null, syncing = null;

function abs(path) { return new URL(path, BASE).href; }
function cacheName(id) { return "cs-" + id; }
function net(path) { return fetch(new Request(abs(path), { headers: HEADERS, cache: "no-store", credentials: "same-origin" })); }

function readMeta(key) {
  return caches.open(META).then(function (c) { return c.match(abs("__meta/" + key)); }).then(function (r) { return r ? r.json() : null; }).catch(function () { return null; });
}
function writeMeta(key, obj) {
  if (key === "current") memo = obj;
  return caches.open(META).then(function (c) { return c.put(abs("__meta/" + key), new Response(JSON.stringify(obj), { headers: { "Content-Type": "application/json" } })); });
}
function dropMeta(key) { return caches.open(META).then(function (c) { return c.delete(abs("__meta/" + key)); }); }
function current() { return memo ? Promise.resolve(memo) : readMeta("current").then(function (c) { memo = c; return c; }); }

function tell(msg) {
  return self.clients.matchAll({ includeUncontrolled: true }).then(function (list) { list.forEach(function (c) { c.postMessage(msg); }); });
}

// download every file of manifest M into `cache`, first from `oldCache` when the hash matches the old manifest `oldM`, else from the network; four at a time. onCore fires once the core files are all in.
function download(M, cache, oldCache, oldM, phase, onCore) {
  var paths = Object.keys(M.files), core = {}, order = [];
  (M.core || []).forEach(function (p) { core[p] = true; if (M.files[p]) order.push(p); });
  paths.forEach(function (p) { if (!core[p]) order.push(p); });
  var total = order.length, done = 0, coreLeft = order.filter(function (p) { return core[p]; }).length, next = 0, failed = null, lastTold = 0;
  function note(force) { var now = Date.now(); if (force || now - lastTold > 400) { lastTold = now; tell({ type: "progress", phase: phase, done: done, total: total }); } }
  function one(p) {
    return cache.match(abs(p)).then(function (hit) {
      if (hit) return null;
      var oh = oldM && oldM.files && oldM.files[p] && oldM.files[p].h === M.files[p].h;
      return (oh && oldCache ? oldCache.match(abs(p)) : Promise.resolve(null)).then(function (old) {
        if (old) return cache.put(abs(p), old);
        return net(p).then(function (r) { if (!r.ok) throw new Error(p + ": " + r.status); return cache.put(abs(p), r); });
      });
    });
  }
  function worker() {
    if (failed || next >= order.length) return Promise.resolve();
    var p = order[next++];
    return one(p).then(function () {
      done++; note(false);
      if (core[p] && --coreLeft === 0 && onCore) return Promise.resolve(onCore());
    }).then(worker, function (e) { failed = failed || e; });
  }
  var ws = [worker(), worker(), worker(), worker()];
  return Promise.all(ws).then(function () { note(true); if (failed) throw failed; return { total: total }; });
}

function sync() {
  if (syncing) return syncing;
  syncing = net("asset-manifest.json").then(function (r) {
    if (!r.ok) throw new Error("manifest " + r.status);
    return r.json();
  }).then(function (M) {
    if (!M || !M.files || !M.build) throw new Error("bad manifest");
    return Promise.all([readMeta("current"), readMeta("pending")]).then(function (st) {
      var cur = st[0], pend = st[1];
      if (!cur) {                                                       // first run
        return caches.open(cacheName(M.build)).then(function (cache) {
          return download(M, cache, null, null, "first", function () { return writeMeta("current", { id: M.build, manifest: M }).then(function () { return tell({ type: "core-ready", build: M.build }); }); });
        }).then(function () { return tell({ type: "offline-ready", build: M.build }); });
      }
      if (cur.id === M.build) {                                         // same build: top up anything the browser dropped
        return caches.open(cacheName(cur.id)).then(function (cache) { return download(M, cache, null, null, "refill"); });
      }
      if (pend && pend.id === M.build) return tell({ type: "update-ready", build: M.build });
      return Promise.all([caches.open(cacheName(M.build)), caches.open(cacheName(cur.id))]).then(function (cs) {   // a newer build
        return download(M, cs[0], cs[1], cur.manifest, "update").then(function () {
          return writeMeta("pending", { id: M.build, manifest: M }).then(function () { return tell({ type: "update-ready", build: M.build }); });
        });
      });
    });
  }).catch(function (e) { return tell({ type: "sync-failed", why: String(e && e.message || e) }); }).then(function () { syncing = null; });
  return syncing;
}

function apply() {
  return readMeta("pending").then(function (p) {
    if (!p) return tell({ type: "applied", build: (memo && memo.id) || null });
    return writeMeta("current", p).then(function () { return dropMeta("pending"); }).then(function () { return caches.keys(); }).then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== META && k !== cacheName(p.id); }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return tell({ type: "applied", build: p.id }); });
  });
}

function ranged(req, res) {
  var h = req.headers.get("range"), m = h && /^bytes=(\d*)-(\d*)$/.exec(h);
  if (!m) return res;
  return res.blob().then(function (b) {
    var size = b.size, start = m[1] === "" ? Math.max(0, size - Number(m[2])) : Number(m[1]), end = m[1] === "" || m[2] === "" ? size - 1 : Math.min(Number(m[2]), size - 1);
    if (start > end || start >= size) return new Response(null, { status: 416, headers: { "Content-Range": "bytes */" + size } });
    return new Response(b.slice(start, end + 1), { status: 206, headers: { "Content-Type": res.headers.get("Content-Type") || b.type || "application/octet-stream", "Content-Range": "bytes " + start + "-" + end + "/" + size, "Content-Length": String(end - start + 1), "Accept-Ranges": "bytes" } });
  });
}

function serve(req, rel) {
  return current().then(function (cur) {
    if (cur && cur.manifest.files[rel]) {
      return caches.open(cacheName(cur.id)).then(function (c) { return c.match(abs(rel)); }).then(function (hit) { if (hit) return ranged(req, hit); return fallback(req, rel, cur); });
    }
    return fallback(req, rel, cur);
  });
}
function fallback(req, rel, cur) {
  return fetch(req).catch(function (e) {
    if (cur && req.mode === "navigate") return caches.open(cacheName(cur.id)).then(function (c) { return c.match(abs("index.html")); }).then(function (hit) { if (hit) return hit; throw e; });
    throw e;
  });
}

self.addEventListener("install", function () { self.skipWaiting(); });
self.addEventListener("activate", function (ev) { ev.waitUntil(self.clients.claim().then(function () { return sync(); })); });
self.addEventListener("message", function (ev) {
  var d = ev.data || {};
  if (d.type === "sync") ev.waitUntil(sync());
  else if (d.type === "apply") ev.waitUntil(apply());
});
self.addEventListener("fetch", function (ev) {
  var req = ev.request;
  if (req.method !== "GET" || req.url.indexOf(BASE) !== 0) return;
  var rel = req.url.slice(BASE.length).split("#")[0].split("?")[0];
  if (req.mode === "navigate" && (rel === "" || rel === "index.html")) rel = "index.html";
  if (rel === "sw.js" || rel === "asset-manifest.json" || rel.indexOf("__meta/") === 0) return;
  ev.respondWith(serve(req, rel));
});
