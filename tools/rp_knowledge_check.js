#!/usr/bin/env node
/*
 * rp_knowledge_check.js -- checks the roleplay knowledge pools (web/mygame/rp-knowledge/*.js) and shows what a character can
 * reach. Offline: no server, no AI model. Plan: Resources & Quest/RP_KNOWLEDGE_PLAN.md.
 *
 *   node tools/rp_knowledge_check.js
 *       checks every pool and every character's `knowledge` (rp-data.js RP_CHARACTERS); exits 1 on a problem.
 *   node tools/rp_knowledge_check.js <character or scene id> [--set flag=value ...] [--say "<line>"]
 *       lists every entry the character can reach, with the pool, the standing and the text they would get, and the
 *       rumors beside it. --set gives story flags (texts and `when` follow the story). --say shows what would be sent for
 *       that line (keyword matches only; tools/rp_knowledge_search.js adds the ones found by meaning).
 *
 * Problems: an entry id used twice, an entry with no text at all, a text with an em dash, a rumor or skip naming an entry
 * no pool has, a character naming a pool that does not exist or a standing that is not common, learned or insider, and a
 * pool file that index.html does not load.
 */
"use strict";
const path = require("path");
const GAME = path.join(path.resolve(__dirname, ".."), "web", "mygame");

const args = process.argv.slice(2);
let who = "", say = "";
const flags = {};
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === "--say") say = args[++i];
  else if (a === "--set") { const kv = String(args[++i] || "").split("="); flags[kv[0]] = kv.slice(1).join("="); }
  else if (!who) who = a;
  else { console.error("Unknown argument: " + a); process.exit(2); }
}
const readValue = (v) => (v === "true" ? true : v === "false" ? false : /^-?\d+(\.\d+)?$/.test(v) ? Number(v) : v);
Object.keys(flags).forEach((k) => { flags[k] = readValue(flags[k]); });

const noop = () => {};
global.window = global;
global.localStorage = { getItem: () => null, setItem: noop, removeItem: noop };
global.document = { body: null, addEventListener: noop, getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
global.MutationObserver = function () { this.observe = noop; this.disconnect = noop; };
global.addEventListener = noop;
const load = require(path.join(__dirname, "rp_knowledge_load.js"))(GAME);
require(path.join(GAME, "rp-data.js"));
require(path.join(GAME, "rp.js"));
const RP = global.RPEngine;
const K = global.RPKnowledge || { pools: {} };
const chars = global.RP_CHARACTERS || {};
const text = (v, s) => { try { return String((typeof v === "function" ? v(s || {}) : v) || "").trim(); } catch (e) { return "(error: " + e.message + ")"; } };

if (who) {
  const cfg = chars[who] || RP.resolveSceneConfig(who);
  if (!cfg) { console.error("No character or scene '" + who + "'. Characters: " + Object.keys(chars).join(", ")); process.exit(2); }
  if (!cfg.knowledge) { console.log(who + " has no `knowledge`: it reaches nothing."); process.exit(0); }
  console.log(who + " reaches: " + Object.keys(cfg.knowledge.pools || {}).map((p) => p + " (" + cfg.knowledge.pools[p] + ")").join(", ") + (Object.keys(flags).length ? "   flags: " + JSON.stringify(flags) : ""));
  const reach = RP.knowledgeReach(cfg, flags);
  Object.keys(reach).sort((a, b) => (reach[a].pool + a).localeCompare(reach[b].pool + b)).forEach((id) => {
    const r = reach[id];
    console.log("\n" + id + (r.hearsay ? "  [hearsay only]" : "  [" + r.pool + ", " + r.standing + "]"));
    if (r.text) console.log("  " + r.text);
    r.rumors.forEach((x) => console.log("  folk say: " + x));
    if (r.own) console.log("  own version: " + r.own);
  });
  console.log("\n" + Object.keys(reach).length + " entries in reach.");
  if (say) {
    const sent = RP.knowledgeMatches(cfg, flags, [say], []);
    console.log("\n--say \"" + say + "\" sends: " + (sent.length ? sent.map((m) => m.id + " (on '" + m.hit + "')").join(", ") : "nothing"));
  }
  process.exit(0);
}

// ---- check everything
const problems = [];
const ids = {};
Object.keys(K.pools).forEach((pid) => {
  const pool = K.pools[pid];
  (pool.entries || []).forEach((e) => {
    if (!e || !e.id) { problems.push(pid + ": an entry without an id"); return; }
    if (ids[e.id]) problems.push("entry id '" + e.id + "' is in both " + ids[e.id] + " and " + pid);
    ids[e.id] = pid;
    if (!e.title) problems.push(pid + "/" + e.id + ": no title");
    const texts = ["common", "learned", "secret"].map((k) => text(e[k], {}));
    if (!texts.some(Boolean) && typeof e.common !== "function" && typeof e.learned !== "function") problems.push(pid + "/" + e.id + ": no common, learned or secret text");
    ["common", "learned", "secret"].forEach((k, i) => { if (/—/.test(texts[i])) problems.push(pid + "/" + e.id + "." + k + ": em dash"); });
    (e.commonIn || []).forEach((cp) => { if (!K.pools[cp]) problems.push(pid + "/" + e.id + ": commonIn names pool '" + cp + "', which does not exist"); });
  });
});
Object.keys(K.pools).forEach((pid) => {
  Object.keys(K.pools[pid].rumors || {}).forEach((eid) => { if (!ids[eid]) problems.push(pid + ": rumor about '" + eid + "', which no pool has"); });
});
const STANDINGS = ["common", "learned", "insider"];
Object.keys(chars).forEach((cid) => {
  const k = chars[cid].knowledge;
  if (!k) return;
  Object.keys(k.pools || {}).forEach((pid) => {
    if (!K.pools[pid]) problems.push(cid + ": pool '" + pid + "' does not exist");
    if (STANDINGS.indexOf(k.pools[pid]) === -1) problems.push(cid + ": pool '" + pid + "' has standing '" + k.pools[pid] + "' (common, learned or insider)");
  });
  Object.keys(k.rumors || {}).forEach((eid) => { if (!ids[eid]) problems.push(cid + ": own rumor about '" + eid + "', which no pool has"); });
  (k.skip || []).forEach((eid) => { if (!ids[eid]) problems.push(cid + ": skips '" + eid + "', which no pool has"); });
  if (chars[cid].lore) problems.push(cid + ": still has the old `lore` scope, which rp.js no longer reads");
});
load.notInIndex.forEach((f) => problems.push(f + " is not loaded by web/mygame/index.html"));

const withK = Object.keys(chars).filter((c) => chars[c].knowledge);
console.log(Object.keys(K.pools).length + " pools, " + Object.keys(ids).length + " entries; " + withK.length + " character(s) with knowledge: " + withK.join(", "));
if (problems.length) {
  console.log(problems.length + " problem(s):");
  problems.forEach((p) => console.log("  - " + p));
  process.exit(1);
}
console.log("No problems found.");
