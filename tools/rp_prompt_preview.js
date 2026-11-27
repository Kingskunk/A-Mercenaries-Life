#!/usr/bin/env node
/*
 * rp_prompt_preview.js -- prints the exact prompt a roleplay session would send to the AI, without calling OpenRouter,
 * Perchance or the memory server. Use it to read a new or changed companion before testing it live: clothing that does
 * not match, a section that came out empty, "undefined" where a flag was missing, the wrong order.
 *
 * It loads the game's own web/mygame/rp-data.js and rp.js (with the page stubbed out), so it shows what rp.js really builds:
 * the scene merged with its character (RP_CHARACTERS), every section in order.
 *
 * The save state: every variable's starting value from web/mygame/scenes/startup.txt, then a play script's "stats" if
 * --script is given, then a JSON file (--stats), then key=value pairs on the command line (last wins). Values read as
 * numbers, true/false or text.
 *
 * Usage:
 *   node tools/rp_prompt_preview.js <scene id> [options] [key=value ...]
 *   node tools/rp_prompt_preview.js --list
 *
 *   --advisor        the suggestion helper's prompt instead of the narrator's
 *   --eval           the post-scene grader's prompt
 *   --script <file>  take the save state from a play script's "stats" (and its "time" and "weather")
 *   --stats <file>   a JSON object of variables
 *   --kind <kind>    play the scene as another kind (rp.js SCENE_KINDS, e.g. talk) to read that kind's prompt
 *   --say "<text>"   what the player just said or did; the knowledge lookup reads it (rp.js knowledgeMatches)
 *   --last "<text>"  the companion's last reply, read by the knowledge lookup after --say
 *   --memory "<text>" stands in for a memory the server would return this turn
 *   --hits id,id     stands in for knowledge entries the server found by meaning this turn (rp_knowledge_search.js shows real ones)
 *
 * The output has two parts: the system message (the same for the whole visit, so it can be cached) and this turn's
 * context (knowledge, calendar or coin when they come up, memories), which goes in the user message before the player's action.
 *
 * Example:
 *   node tools/rp_prompt_preview.js lina_verner time_period=Dusk pc_sw_ending=heist pc_sw_lina_close=true lv_trysts=2
 *
 * Checks (printed after the prompt; the exit code is 1 when any is found):
 *   - the words undefined, null, NaN or [object Object] in the prompt (a missing variable or a field that is not text)
 *   - a section heading with nothing under it
 *   - a scene that names a character RP_CHARACTERS does not have, or a kind rp.js SCENE_KINDS does not have
 */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const GAME = path.join(ROOT, "web", "mygame");

// ---- arguments
const args = process.argv.slice(2);
let sceneId = null, mode = "system", scriptFile = null, statsFile = null, list = false, kindOverride = null, say = "", last = "", memory = "", hits = [];
const pairs = {};
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === "--list") list = true;
  else if (a === "--advisor") mode = "advisor";
  else if (a === "--eval") mode = "eval";
  else if (a === "--script") scriptFile = args[++i];
  else if (a === "--stats") statsFile = args[++i];
  else if (a === "--kind") kindOverride = args[++i];
  else if (a === "--say") say = args[++i];
  else if (a === "--last") last = args[++i];
  else if (a === "--memory") memory = args[++i];
  else if (a === "--hits") hits = args[++i].split(",").map((x) => x.trim()).filter(Boolean);
  else if (/^[A-Za-z_][\w]*=/.test(a)) { const k = a.slice(0, a.indexOf("=")); pairs[k] = a.slice(a.indexOf("=") + 1); }
  else if (!sceneId) sceneId = a;
  else { console.error("Unknown argument: " + a); process.exit(2); }
}

function readValue(v) {
  if (typeof v !== "string") return v;
  if (v === "true") return true;
  if (v === "false") return false;
  if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v);
  return v;
}

// ---- the page, stubbed: rp.js only needs these to load; nothing here runs a session
const noop = () => {};
const store = {};
global.window = global;
global.localStorage = { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } };
global.document = { body: null, addEventListener: noop, getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
global.MutationObserver = function () { this.observe = noop; this.disconnect = noop; };
global.addEventListener = noop;

// The knowledge pools first (rp.js reads window.RPKnowledge for knowledge on demand), in the page's order.
require(path.join(__dirname, "rp_knowledge_load.js"))(GAME);
require(path.join(GAME, "rp-data.js"));
require(path.join(GAME, "rp.js"));
const RP = global.RPEngine;
if (!RP || !RP.buildSystemPrompt) { console.error("rp.js did not expose buildSystemPrompt (RPEngine)."); process.exit(2); }

if (list) {
  const chars = global.RP_CHARACTERS || {};
  Object.keys(global.RP_DATA || {}).forEach((id) => {
    const sc = global.RP_DATA[id];
    const who = sc.character ? (chars[sc.character] ? sc.character : sc.character + " (MISSING)") : "(no character)";
    const kind = sc.kind || "intimate";
    console.log(id.padEnd(22) + " " + kind.padEnd(10) + " " + who + (RP.SCENE_KINDS[kind] ? "" : "   <- unknown kind"));
  });
  process.exit(0);
}
if (!sceneId) { console.error("Give a scene id, or --list. See the header of this file."); process.exit(2); }

// ---- the save state
const s = {};
const startup = fs.readFileSync(path.join(GAME, "scenes", "startup.txt"), "utf8").split(/\r?\n/);
startup.forEach((line) => {
  const m = line.match(/^\*create\s+(\w+)\s+(.*)$/);
  if (!m) return;
  let v = m[2].trim();
  if (/^".*"$/.test(v)) v = v.slice(1, -1);
  else v = readValue(v);
  s[m[1]] = v;
});
if (scriptFile) {
  const sc = JSON.parse(fs.readFileSync(path.resolve(scriptFile), "utf8"));
  Object.assign(s, sc.stats || {});
  if (sc.time) s.time_period = sc.time;
  if (sc.weather) s.weather = sc.weather;
  if (sc.day) s.day_of_week = sc.day;
}
if (statsFile) Object.assign(s, JSON.parse(fs.readFileSync(path.resolve(statsFile), "utf8")));
Object.keys(pairs).forEach((k) => { s[k] = readValue(pairs[k]); });
global.stats = s;

// ---- build
const cfg = RP.resolveSceneConfig(sceneId);
if (!cfg) { console.error("No scene '" + sceneId + "' in rp-data.js RP_DATA. Try --list."); process.exit(2); }
const problems = [];
const scene = global.RP_DATA[sceneId];
if (kindOverride) cfg.kind = kindOverride;
if (!RP.sceneKind(cfg)) problems.push("kind '" + cfg.kind + "' is not in rp.js SCENE_KINDS (" + Object.keys(RP.SCENE_KINDS).join(", ") + ")");
if (scene.character && !(global.RP_CHARACTERS || {})[scene.character]) problems.push("scene names character '" + scene.character + "', which RP_CHARACTERS does not have");
// An anonymous scene with no fixed profile (corve_generic) gets a random one rolled on the page before the session
// (port_valen_dredge_end.txt cut_corve_encounter: ensureGenericProfile); roll one here the same way.
if (RP.sceneKind(cfg) && RP.sceneKind(cfg).grader && !RP.resolveSceneProfile(cfg, s) && global.RP_DATA_HELPERS && global.RP_DATA_HELPERS.ensureGenericProfile) {
  global.RP_DATA_HELPERS.ensureGenericProfile(s);
  console.log("(no fixed profile: rolled a random one, as the game does for this scene)\n");
}

const focus = [say, last].filter(Boolean);
const knowledgePulled = RP.knowledgeMatches(cfg, s, focus, hits);
let prompt;
if (mode === "eval" && !RP.resolveSceneProfile(cfg, s)) { console.log("A " + (cfg.kind || "intimate") + " scene has no grader: nothing is graded after it."); process.exit(problems.length ? 1 : 0); }
if (mode === "advisor") prompt = RP.buildAdvisorSystemPrompt(cfg, s);
else if (mode === "eval") prompt = RP.buildEvaluationSystemPrompt(cfg, s, RP.resolveSceneProfile(cfg, s));
else prompt = RP.buildSystemPrompt(cfg, s);
// The turn's context goes in the user message (rp.js buildTurnContext), so the system message stays cacheable.
const turnCtx = mode === "eval" ? "" : RP.buildTurnContext(cfg, s, memory ? "- " + memory : "", focus, hits);

console.log("======== SYSTEM MESSAGE (the same all visit) ========");
console.log(prompt);
if (mode !== "eval") {
  console.log("\n======== THIS TURN'S CONTEXT (user message, after the conversation, before the player's action) ========");
  console.log(turnCtx || "(nothing this turn)");
}

// ---- checks
const lines = (prompt + "\n\n" + turnCtx).split("\n");
lines.forEach((line, i) => {
  const bad = line.match(/\b(undefined|NaN)\b|\bnull\b|\[object Object\]/);
  if (bad) problems.push("line " + (i + 1) + ": '" + bad[0] + "' in: " + line.slice(0, 120));
  if (/^[A-Z][A-Z &'()\-:,/]+:\s*$/.test(line) && (i + 1 >= lines.length || lines[i + 1].trim() === "")) problems.push("line " + (i + 1) + ": empty section: " + line);
});
console.log("\n" + "-".repeat(60));
if (cfg.knowledge) console.log("Knowledge pulled" + (focus.length ? "" : " (no --say given)") + ": " + (knowledgePulled.length ? knowledgePulled.map((m) => m.id + (m.reach.hearsay ? " [hearsay]" : " [" + m.reach.pool + ", " + m.reach.standing + "]") + " on '" + m.hit + "'").join(", ") : "none"));
console.log("Scene " + sceneId + " (" + (cfg.kind || "intimate") + ")" + (scene.character ? " + character " + scene.character : "") + " · " + mode + " prompt · system about " + RP.estimateTokens(prompt) + " tokens" + (mode === "eval" ? "" : ", this turn's context about " + (turnCtx ? RP.estimateTokens(turnCtx) : 0) + " tokens"));
if (problems.length) {
  console.log(problems.length + " problem(s):");
  problems.forEach((p) => console.log("  - " + p));
  process.exit(1);
}
console.log("No problems found.");
