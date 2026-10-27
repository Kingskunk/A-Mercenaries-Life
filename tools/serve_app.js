#!/usr/bin/env node
/*
 * serve_app.js -- serves dist/ (tools/build_app.js) as a static site, for testing on this PC and for putting behind a tunnel (2026-10-27).
 *   node tools/serve_app.js [dir] [port]        defaults: dist, 8088; listens on 127.0.0.1 only
 * It answers byte-range requests (the sound loops), compresses text (the game page is 14 MB of it), and sends ETags, with no-cache on everything so a rebuilt dist/ is picked up at once.
 * An installed app needs https: localhost counts as secure for testing here, and the tunnel (ngrok) provides https for the tablet. To publish through a tunnel that is already pointing at another server,
 * either run this on its own port with its own tunnel, or add dist/ as a static folder to that server (see Resources & Quest/APP_PACKAGING.md).
 */
"use strict";
const http = require("http"), fs = require("fs"), path = require("path"), zlib = require("zlib"), crypto = require("crypto");
const DIR = path.resolve(process.argv[2] || path.join(__dirname, "..", "dist")), PORT = Number(process.argv[3] || 8088);
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".json": "application/json; charset=utf-8", ".webmanifest": "application/manifest+json", ".css": "text/css; charset=utf-8",
  ".png": "image/png", ".webp": "image/webp", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".ogg": "audio/ogg", ".mp3": "audio/mpeg", ".txt": "text/plain; charset=utf-8" };
const TEXT = { ".html": 1, ".js": 1, ".json": 1, ".webmanifest": 1, ".css": 1, ".svg": 1, ".txt": 1 };
const zcache = new Map();   // path -> { m, buf } : the gzip of a text file, kept until the file changes

http.createServer((req, res) => {
  if (process.env.APP_LOG) console.log("GET " + req.url + (req.headers.range ? " [" + req.headers.range + "]" : ""));
  let rel;
  try { rel = decodeURIComponent(new URL(req.url, "http://x").pathname); } catch (e) { res.writeHead(400); return res.end(); }
  let file = path.normalize(path.join(DIR, rel));
  if (file !== DIR && file.indexOf(DIR + path.sep) !== 0) { res.writeHead(403); return res.end(); }
  fs.stat(file, (err, st) => {
    if (!err && st.isDirectory()) { file = path.join(file, "index.html"); return fs.stat(file, (e2, s2) => send(req, res, file, e2 ? null : s2)); }
    send(req, res, file, err ? null : st);
  });
}).listen(PORT, "127.0.0.1", () => console.log("serving " + DIR + " at http://localhost:" + PORT + "/"));

function send(req, res, file, st) {
  if (!st || !st.isFile()) { res.writeHead(404, { "Content-Type": "text/plain" }); return res.end("not found"); }
  const ext = path.extname(file).toLowerCase(), type = TYPES[ext] || "application/octet-stream";
  const etag = '"' + st.size.toString(16) + "-" + Math.floor(st.mtimeMs).toString(16) + '"';
  const head = { "Content-Type": type, "ETag": etag, "Cache-Control": "no-cache", "Accept-Ranges": "bytes" };
  if (path.basename(file) === "sw.js") head["Service-Worker-Allowed"] = "/";
  if (req.headers["if-none-match"] === etag) { res.writeHead(304, head); return res.end(); }
  const range = req.headers.range && /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
  if (range) {
    const size = st.size, start = range[1] === "" ? Math.max(0, size - Number(range[2])) : Number(range[1]), end = range[1] === "" || range[2] === "" ? size - 1 : Math.min(Number(range[2]), size - 1);
    if (start > end || start >= size) { res.writeHead(416, { "Content-Range": "bytes */" + size }); return res.end(); }
    res.writeHead(206, Object.assign(head, { "Content-Range": "bytes " + start + "-" + end + "/" + size, "Content-Length": end - start + 1 }));
    return fs.createReadStream(file, { start, end }).pipe(res);
  }
  if (TEXT[ext] && /\bgzip\b/.test(req.headers["accept-encoding"] || "") && st.size > 1024) {
    const hit = zcache.get(file);
    if (hit && hit.m === st.mtimeMs) return zsend(res, head, hit.buf);
    return fs.readFile(file, (e, buf) => {
      if (e) { res.writeHead(500); return res.end(); }
      zlib.gzip(buf, { level: 6 }, (e2, z) => { if (e2) { res.writeHead(500); return res.end(); } zcache.set(file, { m: st.mtimeMs, buf: z }); zsend(res, head, z); });
    });
  }
  res.writeHead(200, Object.assign(head, { "Content-Length": st.size }));
  fs.createReadStream(file).pipe(res);
}
function zsend(res, head, buf) { res.writeHead(200, Object.assign(head, { "Content-Encoding": "gzip", "Vary": "Accept-Encoding", "Content-Length": buf.length })); res.end(buf); }
