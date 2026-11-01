/*
 * fs_retry.js -- makes the build survive Windows' transient file locks (2026-11-01).
 *
 * On this machine the real-time virus scanner (and sometimes a sync tool or an editor) briefly holds a file it has just seen written, so an `open` of play_game.html or of a scene file
 * fails with "UNKNOWN: unknown error, open ..." (errno -4094) or EBUSY and the whole compile stops, though the very next try works. This wraps the synchronous fs calls the build uses so
 * that exact failure is tried again a few times, a moment apart, before it is allowed to throw. Every other error (a missing file, a bad path, a real permission problem) throws at once, so
 * nothing is hidden. Loaded by compile.js, which also hands it to the build's child processes through NODE_OPTIONS.
 */
"use strict";
const fs = require("fs");

if (!fs.__retryWrapped) {
  fs.__retryWrapped = true;
  const TRIES = 8;
  const transient = (e) => !!e && (e.code === "UNKNOWN" || e.code === "EBUSY" || e.errno === -4094);
  const pause = (ms) => { try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); } catch (e) { /* no wait available: retry at once */ } };
  ["openSync", "readFileSync", "writeFileSync", "appendFileSync", "copyFileSync", "renameSync", "unlinkSync", "readdirSync", "statSync", "mkdirSync"].forEach((name) => {
    const orig = fs[name];
    if (typeof orig !== "function") return;
    fs[name] = function () {
      for (let i = 0; ; i++) {
        try { return orig.apply(this, arguments); }
        catch (e) { if (i >= TRIES || !transient(e)) throw e; pause(120 * (i + 1)); }
      }
    };
  });
}
