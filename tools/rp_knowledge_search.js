#!/usr/bin/env node
/*
 * rp_knowledge_search.js -- the semantic half of roleplay knowledge (rp.js fetchKnowledgeHits, server.py /sync_knowledge and /search_knowledge).
 * Talks only to the local Mempalace server; no AI model is called, so it costs nothing and cannot trip a rate limit.
 * Still, one query at a time: the search runs the mempalace command on that PC.
 *
 *   node tools/rp_knowledge_search.js --sync
 *       sends every knowledge pool entry (as rp.js exportKnowledgeEntries builds it) to the server's knowledge room, then
 *       waits for the mining to finish. Does nothing when the server already has this version.
 *   node tools/rp_knowledge_search.js "<what the player says>" [--scene lina_verner] [--threshold 0.45]
 *       prints every hit with its score (threshold 0, so you see the near misses too), marks the ones that clear the
 *       threshold, and the ones the scene's character may use (knowledgeMatches with their reach), as the game would send them.
 *
 * Options: --server URL (default http://localhost:5000).
 */
"use strict";
const fs = require("fs");
const path = require("path");
const GAME = path.join(path.resolve(__dirname, ".."), "web", "mygame");

const args = process.argv.slice(2);
let server = "http://localhost:5000", sync = false, query = "", scene = "lina_verner", threshold = null;
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === "--server") server = args[++i].replace(/\/+$/, "");
  else if (a === "--sync") sync = true;
  else if (a === "--scene") scene = args[++i];
  else if (a === "--threshold") threshold = Number(args[++i]);
  else if (!query) query = a;
  else { console.error("Unknown argument: " + a); process.exit(2); }
}

const noop = () => {};
global.window = global;
global.localStorage = { getItem: () => null, setItem: noop, removeItem: noop };
global.document = { body: null, addEventListener: noop, getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
global.MutationObserver = function () { this.observe = noop; this.disconnect = noop; };
global.addEventListener = noop;
require(path.join(__dirname, "rp_knowledge_load.js"))(GAME);
require(path.join(GAME, "rp-data.js"));
require(path.join(GAME, "rp.js"));
const RP = global.RPEngine;
if (threshold === null) threshold = RP.KNOWLEDGE_SEMANTIC_THRESHOLD;

async function post(route, body) {
  const r = await fetch(server + route, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  return r.json();
}

(async function main() {
  if (sync) {
    const entries = RP.exportKnowledgeEntries();
    const version = RP.knowledgeVersion(entries);
    let d = await post("/sync_knowledge", { version });
    if (d.current) { console.log("The server already has these knowledge entries (" + entries.length + " entries, version " + version + ")."); return; }
    d = await post("/sync_knowledge", { version, entries });
    console.log("Sent " + entries.length + " entries (version " + version + "); the server wrote " + d.written + " and is mining...");
    const t0 = Date.now();
    for (;;) {
      await new Promise((r) => setTimeout(r, 3000));
      d = await post("/sync_knowledge", { version });
      if (d.current) { console.log("Mined in " + Math.round((Date.now() - t0) / 1000) + "s."); return; }
      if (!d.mining) { console.log("Mining stopped but the version was not recorded: check the server console."); process.exit(1); }
      if (Date.now() - t0 > 600000) { console.log("Still mining after 10 minutes; giving up waiting."); process.exit(1); }
    }
  }
  if (!query) { console.error("Give a query, or --sync. See the header of this file."); process.exit(2); }
  const t0 = Date.now();
  const d = await post("/search_knowledge", { query, limit: 10, threshold: 0 });
  const ms = Date.now() - t0;
  if (!d.ready) { console.log("The knowledge room is not ready (missing or mining). Run with --sync first."); process.exit(1); }
  console.log("\"" + query + "\" (" + ms + " ms)");
  (d.hits || []).forEach((h) => console.log("  " + (h.score >= threshold ? "PASS " : "     ") + h.score.toFixed(3) + "  " + h.id));
  const passing = (d.hits || []).filter((h) => h.score >= threshold).map((h) => h.id);
  const cfg = RP.resolveSceneConfig(scene);
  if (cfg && cfg.knowledge) {
    const s = {};
    const sent = RP.knowledgeMatches(cfg, s, [query], passing);
    console.log("Threshold " + threshold + ". " + scene + " would get: " + (sent.length ? sent.map((m) => m.id + (m.reach.hearsay ? " [hearsay]" : " [" + m.reach.pool + ", " + m.reach.standing + "]") + " (" + m.hit + ")").join(", ") : "nothing"));
  }
})().catch((e) => { console.error("Server not answering at " + server + ": " + e.message); process.exit(2); });
