#!/usr/bin/env node
/*
 * rp_memory_test.js -- tests roleplay memory end to end against the real Mempalace server and real models:
 *   1. saves each sample session the way the game does (rp.js commitSessionToMemPalace: same id, transcript, date label,
 *      always OpenRouter, with the --model given), and prints the memory the model wrote and how long it took;
 *   2. checks each planted fact survived into the saved memories (by its words);
 *   3. checks two sessions on one day kept two files, and that loading an earlier save hides the later memory;
 *   4. builds the narrator prompt the game would send later (rp.js buildSystemPrompt, then buildTurnContext with the fetched memories) and asks
 *      the sample's questions, printing each reply and whether it used the memory.
 * It writes to a test room of its own (the character's thread id + "_memtest"), never a real save's room, and deletes
 * that room's files at the end unless --keep is given.
 *
 * Usage:
 *   node tools/rp_memory_test.js <sample file> --model <OpenRouter id> [--server URL] [--narrator openrouter|perchance] [--keep] [--chunk-over N]
 *   node tools/rp_memory_test.js tools/rp_memory_samples/lina_verner.json --model nvidia/nemotron-3-ultra-550b-a55b:free
 *
 * --model is the OpenRouter model that writes the memories (in the game: the one picked in the console's model list) and,
 * with --narrator openrouter, also plays the scene.
 *
 * --chunk-over N notes a transcript part by part once it is longer than N characters (the server's default is 16000),
 * so a sample shorter than that can still test the long-scene path (server.py MEMORY_CHUNK_OVER).
 *
 * Needs the Mempalace server running (default http://localhost:5000) with its OpenRouter key. The narrator defaults to
 * OpenRouter with the memory model; --narrator perchance needs the Perchance tab open. Calls are made one at a time
 * (the server refuses a second OpenRouter call while one is running).
 */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const GAME = path.join(ROOT, "web", "mygame");

const args = process.argv.slice(2);
let sampleFile = null, server = "http://localhost:5000", narrator = "openrouter", narratorModel = null, keep = false, chunkOver = 0;
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === "--server") server = args[++i].replace(/\/+$/, "");
  else if (a === "--narrator") narrator = args[++i];
  else if (a === "--model") narratorModel = args[++i];
  else if (a === "--keep") keep = true;
  else if (a === "--chunk-over") chunkOver = Number(args[++i]) || 0;
  else if (!sampleFile) sampleFile = a;
  else { console.error("Unknown argument: " + a); process.exit(2); }
}
if (!narratorModel) { console.error("Give --model <OpenRouter model id>: the model that writes the memories (and narrates with --narrator openrouter)."); process.exit(2); }
if (!sampleFile) { console.error("Give a sample file, e.g. tools/rp_memory_samples/lina_verner.json"); process.exit(2); }
const sample = JSON.parse(fs.readFileSync(path.resolve(sampleFile), "utf8"));

// ---- the page, stubbed, so rp.js builds exactly what the game builds
const noop = () => {};
const store = {};
global.window = global;
global.localStorage = { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } };
global.document = { body: null, addEventListener: noop, getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
global.MutationObserver = function () { this.observe = noop; this.disconnect = noop; };
global.addEventListener = noop;
require(path.join(__dirname, "rp_knowledge_load.js"))(GAME);
require(path.join(GAME, "rp-data.js"));
require(path.join(GAME, "rp.js"));
const RP = global.RPEngine;

// The save state: startup.txt defaults, then the sample's stats.
const base = {};
fs.readFileSync(path.join(GAME, "scenes", "startup.txt"), "utf8").split(/\r?\n/).forEach((line) => {
  const m = line.match(/^\*create\s+(\w+)\s+(.*)$/);
  if (!m) return;
  let v = m[2].trim();
  if (/^".*"$/.test(v)) v = v.slice(1, -1);
  else if (v === "true" || v === "false") v = v === "true";
  else if (/^-?\d+(\.\d+)?$/.test(v)) v = Number(v);
  base[m[1]] = v;
});
Object.assign(base, sample.stats || {});
const stateAt = (extra) => Object.assign({}, base, extra || {});

const evalField = (v, s) => (typeof v === "function" ? v(s) : v);
const cfgFor = (sceneId, kind) => { const c = Object.assign({}, RP.resolveSceneConfig(sceneId)); if (kind) c.kind = kind; return c; };
const mainCfg = cfgFor(sample.scene);
if (!mainCfg || !mainCfg.id) { console.error("No scene " + sample.scene + " in rp-data.js"); process.exit(2); }
const threadId = (evalField(mainCfg.threadId, base) || "cs_" + mainCfg.id) + "_memtest";

async function post(route, body, timeoutMs) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), timeoutMs || 150000);
  try {
    const r = await fetch(server + route, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal: ctl.signal });
    let j = null;
    try { j = await r.json(); } catch (e) { j = null; }
    return { ok: r.ok, status: r.status, body: j };
  } finally { clearTimeout(timer); }
}
const memories = (s, query) => post("/get_npc_memories", { thread_id: threadId, current_day: Number(s.campaign_day) || 1, max_visit: RP.memoryOrder(s), query: query || "" });
const hr = (t) => console.log("\n" + "=".repeat(8) + " " + t + " " + "=".repeat(Math.max(4, 60 - t.length)));
const has = (text, w) => String(text || "").toLowerCase().indexOf(String(w).toLowerCase()) !== -1;

async function wipe() {
  const r = await memories({ campaign_day: 99999, page_id: 99999999 });
  const all = (r.body && r.body.all) || [];
  for (const m of all) await post("/delete_npc_memory", { thread_id: threadId, id: m.source });
  return all.length;
}

(async function main() {
  try {
    const h = await fetch(server + "/health");
    if (!h.ok) throw new Error("status " + h.status);
  } catch (e) {
    console.error("The Mempalace server is not answering at " + server + " (" + e.message + "). Start it (start_server.bat) and run again.");
    process.exit(2);
  }
  console.log("Server " + server + " · test room " + threadId + " · memory model " + narratorModel + " · narrator " + narrator + (narrator === "openrouter" ? " " + narratorModel : ""));
  const stale = await wipe();
  if (stale) console.log("(cleared " + stale + " file(s) left in the test room by an earlier run)");

  let failures = 0;
  const saved = [];

  // 1. Save each session as the game does.
  for (const sess of sample.sessions) {
    const s = stateAt({ page_id: sess.page_id, campaign_day: sess.campaign_day, time_period: sess.time_period || base.time_period });
    const cfg = cfgFor(sess.scene || sample.scene, sess.kind);
    const transcript = sess.turns.map(([role, text]) => (role === "user" ? "Player: " : "Scene: ") + text).join("\n\n");
    const memId = "msg_" + Math.max(1, RP.memoryOrder(s)) + "_day" + (Number(s.campaign_day) || 1) + "_" + String(cfg.id || "rp").replace(/[^A-Za-z0-9_]/g, "");
    const body = {
      thread_id: threadId, id: memId, text: RP.memoryTranscript(transcript), distill: true,
      npc_name: evalField(cfg.npcName, s) || "the companion", location: evalField(cfg.title, s) || "the scene",
      date_label: RP.formatMemoryDateLabel(s), mode: "openrouter", model: narratorModel, timeout: 120,
      player_name: RP.companionKnowsName(cfg, s) ? String(s.name || "") : ""
    };
    if (chunkOver) body.chunk_over = chunkOver;
    hr("save: " + sess.label);
    const t0 = Date.now();
    // A long scene is noted part by part before the memory is written (two model calls in a row), so up to 5 minutes.
    const r = await post("/append_memory", body, 300000);
    const secs = ((Date.now() - t0) / 1000).toFixed(1);
    if (r.body && r.body.status === "success") {
      console.log(memId + " · " + secs + "s · " + r.body.memory.length + " characters\n" + r.body.memory);
      saved.push(r.body.memory);
    } else {
      failures++;
      console.log("NOT SAVED after " + secs + "s: HTTP " + r.status + " " + JSON.stringify(r.body));
    }
  }

  // 2. Did the facts survive?
  hr("facts kept in the saved memories");
  const allText = saved.join(" ");
  (sample.facts || []).forEach((f) => {
    const hit = f.words.some((w) => has(allText, w));
    if (!hit) failures++;
    console.log((hit ? "  kept    " : "  LOST    ") + f.fact);
  });

  // 3. Files and the rewind guard.
  hr("files and rewind");
  const later = stateAt(sample.later);
  const all = ((await memories(later)).body || {}).all || [];
  const expectFiles = sample.sessions.length;
  console.log("  " + all.length + " file(s) for " + expectFiles + " session(s): " + all.map((m) => m.source).join(", ") + (all.length === expectFiles ? "" : "   <- expected " + expectFiles));
  if (all.length !== expectFiles) failures++;
  if (sample.rewind) {
    const back = ((await memories(stateAt({ page_id: sample.rewind.page_id, campaign_day: sample.later.campaign_day }))).body || {}).memories || [];
    const okBack = back.length === sample.rewind.expect_sessions;
    if (!okBack) failures++;
    console.log("  an earlier save (page " + sample.rewind.page_id + ") sees " + back.length + " memory(ies)" + (okBack ? "" : "   <- expected " + sample.rewind.expect_sessions));
  }

  // 4. Later: does the narrator use them?
  for (const q of sample.questions || []) {
    const memBlock = RP.formatMemoryBlock((await memories(later, q.say)).body);
    // As the game sends it: the system message for the visit, then the turn's context (memories, knowledge) before the action.
    const sys = RP.buildSystemPrompt(mainCfg, later);
    const turnCtx = RP.buildTurnContext(mainCfg, later, memBlock, [q.say]);
    const prompt = (turnCtx ? turnCtx + "\n\n" : "") + "CURRENT PLAYER ACTION / DIRECTION:\n" + q.say + "\n\nContinue the scene immediately in second-person present tense ('You...') for 1-2 paragraphs:";
    hr("ask: " + q.why);
    if (q === sample.questions[0]) console.log("[memories sent]\n" + memBlock + "\n");
    console.log("> " + q.say);
    const t0 = Date.now();
    let r;
    try {
      r = await post("/rp_generate", { mode: narrator, model: narratorModel, raw_mode: true, max_tokens: 1500, timeout: 90, system: sys, prompt: prompt }, 120000);
    } catch (e) {
      r = { ok: false, status: 0, body: { error: e.name === "AbortError" ? "no answer in 120s" : String(e.message || e) } };
    }
    const secs = ((Date.now() - t0) / 1000).toFixed(1);
    const text = r.body && r.body.text;
    if (!text) { failures++; console.log("NO REPLY after " + secs + "s: HTTP " + r.status + " " + JSON.stringify(r.body).slice(0, 300)); continue; }
    console.log(text.trim() + "\n(" + secs + "s)");
    const missed = q.expect.filter((w) => !has(text, w));
    console.log(missed.length ? "  did not mention: " + missed.join(", ") : "  used the memory: " + q.expect.join(", "));
  }

  hr("done");
  if (!keep) console.log("Deleted " + (await wipe()) + " test file(s)."); else console.log("Kept the test room " + threadId + ".");
  console.log(failures ? failures + " problem(s) (a missed word in a reply is shown but not counted)." : "No problems in saving, facts, files or rewind.");
  process.exit(failures ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
