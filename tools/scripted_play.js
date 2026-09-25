#!/usr/bin/env node
/*
 * scripted_play.js - plays a path through the REAL game engine from a script and prints what the
 * player would read: the prose of every page, the choices offered, the option picked, page breaks and
 * dice checks. Use it to read how a label or a route plays without opening the .txt scenes, and as
 * the driver for scenario tests.
 *
 * How it works
 *   - It loads the same engine and scene files the game uses (like render_hub.js and randomtest.js).
 *     Only the input handling is replaced: every *choice is answered from the script.
 *   - The character is built by picking one of the game's own dev-menu presets (startup.txt,
 *     dev_jump_menu), so class, stats and cantrips come from real character creation.
 *   - Then the world is overridden (weather, time, day, any variable), and the run starts at a label.
 *   - Math.random is forced, so dice and *rand pools are deterministic: "low" is the minimum roll (a
 *     d20 check fails unless the bonus carries it), "high" is the maximum, "mid" sits in the middle.
 *     A natural 20 always passes and a natural 1 always fails, as in the game.
 *   - The same script always gives the same output, so a viewer can keep a list of picks and re-run it
 *     from the start on every click. That makes it a stateless "play from this label" backend.
 *
 * It shows prose. It does not judge it, lay it out like the game screen, or change any file.
 *
 * Usage, from any folder (it finds the repo from its own location and never changes your working folder):
 *   node tools/scripted_play.js <script.json | ->  [key=value ...] [flags]
 *   node tools/scripted_play.js scene=port_valen_dredge_end label=cut_shrine weather=Clear time=Morning \
 *        day=Hallowday stats='{"cut_shrine_gave":true,"de_savvy":false}' \
 *        picks="Kneel by the friar;Follow what he left behind@high;Step inside the knife@high"
 *   node tools/scripted_play.js --presets              list the character presets
 *   node tools/scripted_play.js --labels=<scene>       list a scene's labels and line numbers
 *   Examples: tools/play_scripts/*.json
 *
 * Script fields (JSON file, "-" for stdin, or key=value on the command line, which override the file):
 *   scene     scene file without .txt (default port_valen)
 *   label     label to start at (required to start mid-scene; omit to start at the top)
 *   preset    text found in a dev-menu option, e.g. "Cadre Battle-Abjurer" (default "Vanguard Line Fighter")
 *   weather   Clear, Overcast, Rain, Fog, Snow, Sleet, Storm or Blizzard
 *   time      Pre-Dawn, Morning, Midday, Afternoon, Dusk or Night (sets the hour and the clock text)
 *   day       Ironday, Tideday, Marketday, Hearthday, Forgeday, Greyday or Hallowday (sets campaign_day)
 *   stats     object of variables set last, so they win over weather/time/day and the preset
 *   rand      the forced roll before the first step that sets its own (default "mid")
 *   steps     [{ "pick": "text in the option" | number (1 = first option), "rand": "low"|"mid"|"high"|0..1,
 *               "whileAvail": true }]  whileAvail repeats the step until its option is gone (attack rounds)
 *   picks     the same steps as one string: "text@high;other text*"  (@word sets rand, a trailing * = whileAvail)
 *   watch     variable names whose final values are reported
 *   refresh   true: after every page, replay it on a copy (what opening Stats and returning does) and
 *             report any variable that changes; a reward or a time advance that is not guarded shows up here
 *   sabotage  variables forced false on the replay copy, to prove the refresh check can see a double apply
 *   game      game folder under web/ (default mygame)
 *
 * Flags: --json (machine-readable events), --raw (keep [b]/[n/] markup), --no-menus (only the picks).
 *
 * Gotchas
 *   - Starting at a label skips everything above it. A *temp declared earlier in the scene (a hub's
 *     de_savvy, cut_day...) does not exist, and the run fails with "Non-existent variable". Give it in stats.
 *   - The run stops when the steps run out, at the menu it reached, and lists that menu's options.
 *   - Forced dice show one branch per run. To see the other branch, change "rand" on that step.
 *
 * As a module: require("./scripted_play.js").play(script) returns { status, text, events, log, exits,
 * errors, stopped, purseDelta, repDelta, hpBefore, hp, s, watch, refreshDiffs, refreshChecks, refreshSkipped }.
 */
var path = require("path"), fs = require("fs"), vm = require("vm");
var ROOT = path.resolve(__dirname, "..");
global.require = require;
global.fs = fs; global.vm = vm; global.path = path;
function load(f) { vm.runInThisContext(fs.readFileSync(path.join(ROOT, f)), f); }
load("web/scene.js"); load("web/navigator.js"); load("web/util.js"); load("headless.js");

nav = new SceneNavigator(["startup"]);
stats = {};
timeout = null;

var GAME = "mygame";
var DEFAULT_PRESET = "Vanguard Line Fighter";

Scene.prototype.loadScene = function () {
  // "simflags" is a virtual scene: it refreshes the derived weather flags the way entering a hub does.
  var file = this.name === "simflags" ? "*gosub_scene calendar update_hub_condition\n*finish"
    : slurpFile(ROOT + "/web/" + GAME + "/scenes/" + this.name + ".txt");
  this.loadLines(file);
  this.loaded = true;
  if (this.executing) this.execute();
};
Scene.prototype.warning = function () {};
Scene.prototype.save = function () {};
Scene.prototype.subscribe = function () {};
Scene.prototype.stat_chart = function () {};
Scene.prototype.ending = function () { this.paragraph(); this.finished = true; };
Scene.prototype.finish = Scene.prototype.autofinish = function () { this.paragraph(); this.finished = true; };

var D = { mode: "boot", steps: [], stepIdx: 0, rand: 0, events: [], log: [], exits: [], errors: [], stopped: null,
  refreshAll: false, sabotage: [], refreshDiffs: [], refreshChecks: 0, refreshSkipped: 0 };

function parseRand(v) {
  if (v === "low") return 0;
  if (v === "high") return 0.9999;
  if (v === "mid") return 0.5;
  return v;
}
Math.random = function () { return D.rand; };

// Moves whatever the engine has printed since the last flush into one "prose" event.
function flush() {
  var text = printed.join("")
    .replace(/<\/p>/g, "\n").replace(/<p>/g, "").replace(/<br>/g, "\n")
    .replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/\n{3,}/g, "\n\n");
  printed.length = 0;
  if (text.trim()) D.events.push({ type: "prose", text: text.trim() });
}

Scene.prototype.choice = function (data, isFakeChoice) {
  var groups = ["choice"];
  if (data) groups = data.split(/ /);
  var allowFallthrough = (isFakeChoice === true) || this.getVar("implicit_control_flow");
  var options = this.parseOptions(this.indent, groups, allowFallthrough);
  var self = this;
  var sel = options.filter(function (o) { return !o.unselectable; });
  var names = sel.map(function (o) { return self.replaceVariables(o.name); });
  this.paragraph();
  if (D.mode === "replay") { this.finished = true; return; }
  flush();
  this.finished = true;
  if (D.mode === "boot") return;
  if (D.refreshAll) refreshCheck(this, "choice");

  // Pick a scripted step. A step with whileAvail stays current for as long as its text is on offer.
  var idx = -1, step = null;
  while (D.stepIdx < D.steps.length) {
    step = D.steps[D.stepIdx];
    idx = typeof step.pick === "number" ? step.pick - 1 : names.findIndex(function (n) { return n.indexOf(step.pick) !== -1; });
    if (idx >= names.length) idx = -1;
    if (idx >= 0) break;
    if (step.whileAvail) { D.stepIdx++; continue; }
    break;
  }
  if (D.stepIdx >= D.steps.length) {
    D.stopped = names;
    D.events.push({ type: "menu", options: names, picked: null });
    D.events.push({ type: "stop", reason: "no more steps" });
    return;
  }
  if (idx < 0) {
    D.errors.push("step " + (D.stepIdx + 1) + ": no option matches '" + step.pick + "'. Offered: " + JSON.stringify(names));
    D.stopped = names;
    D.events.push({ type: "menu", options: names, picked: null });
    D.events.push({ type: "stop", reason: "pick not found" });
    return;
  }
  if (step.rand !== undefined) D.rand = parseRand(step.rand);
  if (!step.whileAvail) D.stepIdx++;
  D.log.push(names[idx]);
  D.events.push({ type: "menu", options: names, picked: idx });

  if (!this.temps._choiceEnds) this.temps._choiceEnds = {};
  for (var i = 0; i < options.length; i++) this.temps._choiceEnds[options[i].line - 1] = allowFallthrough ? this.lineNum : 0;
  var chosen = sel[idx];
  timeout = function () { self.standardResolution(chosen); };
};

Scene.prototype.page_break = function (buttonName) {
  if (this.screenEmpty) return;
  if (!buttonName) buttonName = "Next";
  buttonName = this.replaceVariables(buttonName);
  this.paragraph();
  this.finished = true;
  if (D.mode === "boot" || D.mode === "replay") return;
  if (D.refreshAll) refreshCheck(this, "page_break");
  flush();
  D.events.push({ type: "page_break", button: buttonName });
  var self = this;
  timeout = function () { self.finished = false; self.resetPage(); };
};

// A *goto_scene out of the run (another scene, the death screen) ends it there and is reported as an exit.
var origGoto = Scene.prototype.goto_scene;
Scene.prototype.goto_scene = function (data, isGosubScene) {
  if (!isGosubScene && D.mode === "replay") { this.finished = true; return; }
  if (!isGosubScene && D.mode === "drive") {
    D.exits.push(data);
    flush();
    D.events.push({ type: "exit", target: data });
    this.finished = true;
    return;
  }
  return origGoto.apply(this, arguments);
};

var IGNORE = { choice_crc: 1, resumeLabel: 1 };
function deep(o) { return JSON.parse(JSON.stringify(o, function (k, v) { return k === "scene" ? undefined : v; })); }
function refreshCheck(sc, where) {
  // What "open the Stats screen, then Return to Game" does: the resume save is rewritten with the CURRENT
  // stats/temps and the page-START line, then the page runs again on top of its own results.
  // A page that began in another scene (it crossed a *gosub_scene into combat and back) cannot be resumed from its
  // start: the engine itself falls back to a mid-command line number there. Same for every fight in the game.
  if (stats.choice_page_start_scene && stats.choice_page_start_scene !== sc.name) { D.refreshSkipped++; return; }
  var snapStats = deep(stats), snapTemps = deep(sc.temps);
  var startScene = stats.choice_page_start_scene || sc.name;
  var line = (typeof stats.choice_page_start_line === "number" && (!stats.choice_page_start_scene || stats.choice_page_start_scene === sc.name)) ? stats.choice_page_start_line : sc.lineNum;
  var indent = (typeof stats.choice_page_start_indent === "number" && (!stats.choice_page_start_scene || stats.choice_page_start_scene === sc.name)) ? stats.choice_page_start_indent : sc.indent;
  var replayStats = deep(snapStats);
  D.sabotage.forEach(function (k) { replayStats[k] = false; });
  var savedPrinted = printed.slice(), savedTimeout = timeout, savedMode = D.mode, savedStats = stats;
  D.mode = "replay"; printed.length = 0; timeout = null; D.refreshChecks++;
  var rs = new Scene(replayStats.sceneName || startScene, replayStats, nav, { debugMode: false });
  rs.temps = deep(snapTemps); rs.lineNum = line; rs.indent = indent;
  try { rs.execute(); } catch (e) { D.refreshDiffs.push(where + " @ " + startScene + ":" + line + ": EXCEPTION " + e.message); }
  D.mode = savedMode; timeout = savedTimeout; stats = savedStats;
  printed.length = 0; Array.prototype.push.apply(printed, savedPrinted);
  Object.keys(snapStats).forEach(function (k) {
    if (IGNORE[k]) return;
    if (JSON.stringify(snapStats[k]) !== JSON.stringify(replayStats[k])) D.refreshDiffs.push(where + " @ " + startScene + ":" + line + ": " + k + " " + JSON.stringify(snapStats[k]) + " -> " + JSON.stringify(replayStats[k]));
  });
}

function runLoop(sc) {
  timeout = null;
  try {
    sc.execute();
    var guard = 0;
    while (timeout && guard++ < 20000) { var fn = timeout; timeout = null; fn(); }
    if (guard >= 20000) D.errors.push("loop guard tripped");
  } catch (e) {
    D.errors.push("EXCEPTION: " + (e && e.message ? e.message : e));
  }
  flush();
}

function resetRun() {
  D.steps = []; D.stepIdx = 0; D.rand = 0; D.events = []; D.log = []; D.exits = []; D.errors = []; D.stopped = null;
  D.refreshAll = false; D.sabotage = []; D.refreshDiffs = []; D.refreshChecks = 0; D.refreshSkipped = 0;
}

// Builds a character by picking a dev-menu preset. With no preset, returns the menu's option texts instead.
function newGame(preset) {
  resetRun();
  stats = {};
  printed.length = 0;
  D.mode = "boot";
  var boot = new Scene("startup", stats, nav, { debugMode: false });
  timeout = null;
  boot.execute();
  printed.length = 0;
  D.mode = "drive"; D.steps = preset ? [{ pick: preset }] : [];
  var dev = new Scene("startup", stats, nav, { debugMode: false });
  dev.targetLabel = { label: "dev_jump_menu", origin: "startup", originLine: 0 };
  runLoop(dev);
  if (!preset) return D.stopped || [];
  if (D.errors.length) throw new Error("preset '" + preset + "' failed: " + D.errors.join("; ") + " (list them with --presets)");
  return null;
}

var DAYS = ["Ironday", "Tideday", "Marketday", "Hearthday", "Forgeday", "Greyday", "Hallowday"];
var HOURS = { "Pre-Dawn": 5, "Morning": 9, "Midday": 12, "Afternoon": 15, "Dusk": 19, "Night": 23 };
var WEATHERS = ["Clear", "Overcast", "Rain", "Fog", "Snow", "Sleet", "Storm", "Blizzard"];

// weather / time / day shorthands become the variables the calendar reads.
function worldFromShorthands(scn) {
  var w = {};
  if (scn.weather !== undefined) {
    if (WEATHERS.indexOf(scn.weather) < 0) throw new Error("weather must be one of " + WEATHERS.join(", "));
    w.weather = scn.weather;
  }
  if (scn.time !== undefined) {
    if (!(scn.time in HOURS)) throw new Error("time must be one of " + Object.keys(HOURS).join(", "));
    w.time_period = scn.time; w.clock_hour = HOURS[scn.time]; w.clock_minute = 0;
    w.clock_time = (HOURS[scn.time] < 10 ? "0" : "") + HOURS[scn.time] + ":00";
  }
  if (scn.day !== undefined) {
    if (DAYS.indexOf(scn.day) < 0) throw new Error("day must be one of " + DAYS.join(", "));
    w.day_of_week = scn.day; w.campaign_day = 1 + DAYS.indexOf(scn.day);
  }
  return w;
}

function purse() { return (+stats.gold * 100) + (+stats.silver * 10) + (+stats.copper); }

function play(scn) {
  GAME = scn.game || "mygame";
  newGame(scn.preset || DEFAULT_PRESET);
  var world = worldFromShorthands(scn);
  Object.keys(world).forEach(function (k) { stats[k] = world[k]; });
  if (Object.keys(world).length) {
    // Recompute the derived weather flags (street_life, visibility...) from the new weather and time.
    D.mode = "boot"; printed.length = 0;
    new Scene("simflags", stats, nav, { debugMode: false }).execute();
    printed.length = 0;
  }
  Object.keys(scn.stats || {}).forEach(function (k) { stats[k] = scn.stats[k]; });
  var purseBefore = purse(), repBefore = stats.port_watch_rep, hpBefore = stats.hp_current;
  resetRun();
  D.mode = "drive"; D.steps = scn.steps || []; D.rand = parseRand(scn.rand0 !== undefined ? scn.rand0 : (scn.rand !== undefined ? scn.rand : "mid"));
  D.refreshAll = !!scn.refresh; D.sabotage = scn.sabotage || [];
  var sc = new Scene(scn.scene || "port_valen", stats, nav, { debugMode: false });
  if (scn.label) sc.targetLabel = { label: scn.label, origin: "startup", originLine: 0 };
  runLoop(sc);

  var last = D.events[D.events.length - 1];
  var status = D.errors.length ? "error" : !last ? "finished" : last.type === "stop" ? "menu" : last.type === "exit" ? "exit" : "finished";
  var watch = {};
  (scn.watch || []).forEach(function (k) { watch[k] = stats[k]; });
  return {
    status: status, text: plainTranscript(D.events), events: D.events.slice(), log: D.log.slice(), exits: D.exits.slice(),
    errors: D.errors.slice(), stopped: D.stopped, purseDelta: purse() - purseBefore, repDelta: stats.port_watch_rep - repBefore,
    hpBefore: hpBefore, hp: stats.hp_current, s: stats, watch: watch,
    refreshDiffs: D.refreshDiffs.slice(), refreshChecks: D.refreshChecks, refreshSkipped: D.refreshSkipped
  };
}

function presets() { return newGame(null); }

// ------------------------------------------------------------------ output

// The compact transcript scenario tests search: prose, the option picked, page breaks and exits. Markup kept.
function plainTranscript(events) {
  var out = [];
  events.forEach(function (e) {
    if (e.type === "prose") out.push(e.text);
    else if (e.type === "menu" && e.picked !== null) out.push("> " + e.options[e.picked].replace(/\s+/g, " ").slice(0, 110));
    else if (e.type === "page_break") out.push("[PAGE BREAK: " + e.button + "]");
    else if (e.type === "exit") out.push("[GOTO_SCENE: " + e.target + "]");
    else if (e.type === "stop" && e.reason === "no more steps") out.push("[STOP: no more steps; options offered]");
  });
  return out.join("\n");
}

function stripMarkup(t) {
  return t.replace(/\[n\/\]/g, "\n").replace(/\[\/?(b|i|u|c)\]/g, "").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}
function rollsIn(text) {
  var rolls = [], re = /\[b\]\[🎲 ([^\]]+)\]\[\/b\]/g, m;
  while ((m = re.exec(text))) rolls.push(m[1]);
  return rolls;
}
var KNOWN_ENGINE_DIFF = /^page_break @ combat:\d+: check_dc "11" -> "10"$/;

function errorHints(errors) {
  var hints = [];
  errors.forEach(function (e) {
    var m = /Non-existent variable '(\w+)'/.exec(e);
    if (m) hints.push("'" + m[1] + "' does not exist. Starting at a label skips the *temp lines above it; give it in stats, e.g. \"stats\": { \"" + m[1] + "\": false }.");
  });
  return hints;
}

function formatText(scn, r, opts) {
  var clean = opts.raw ? function (t) { return t; } : stripMarkup;
  var out = [];
  out.push("=== " + (scn.scene || "port_valen") + (scn.label ? " : " + scn.label : "") + " | " + (scn.preset || DEFAULT_PRESET) +
    [scn.weather, scn.time, scn.day].filter(Boolean).map(function (x) { return " | " + x; }).join(""));
  out.push("");
  r.events.forEach(function (e) {
    if (e.type === "prose") out.push(clean(e.text), "");
    else if (e.type === "menu") {
      if (opts.menus || e.picked === null) {
        out.push("  Choices:");
        e.options.forEach(function (o, i) { out.push("  " + (e.picked === i ? "> " : "  ") + (i + 1) + ". " + o.replace(/\s+/g, " ")); });
      } else out.push("> " + e.options[e.picked].replace(/\s+/g, " "));
      out.push("");
    }
    else if (e.type === "page_break") out.push("--- page break: " + e.button + " ---", "");
    else if (e.type === "exit") out.push("--- leaves the scene: " + e.target + " ---", "");
    else if (e.type === "stop") out.push("--- stopped: " + e.reason + " ---", "");
  });
  var known = r.refreshDiffs.filter(function (d) { return KNOWN_ENGINE_DIFF.test(d); });
  var diffs = r.refreshDiffs.filter(function (d) { return !KNOWN_ENGINE_DIFF.test(d); });
  out.push("Result: " + r.status + " | coin " + (r.purseDelta >= 0 ? "+" : "") + r.purseDelta + " copper | HP " + r.hpBefore + " -> " + r.hp +
    (r.exits.length ? " | exits to " + r.exits.join(", ") : ""));
  Object.keys(r.watch).forEach(function (k) { out.push("  " + k + " = " + JSON.stringify(r.watch[k])); });
  if (scn.refresh) {
    out.push("Refresh check: " + r.refreshChecks + " pages replayed, " + r.refreshSkipped + " skipped (started in another scene), " + diffs.length + " differences" + (known.length ? " (+" + known.length + " known engine difference)" : ""));
    diffs.slice(0, 12).forEach(function (d) { out.push("  - " + d); });
  }
  r.errors.forEach(function (e) { out.push("ERROR: " + e); });
  errorHints(r.errors).forEach(function (h) { out.push("  hint: " + h); });
  return out.join("\n");
}

function formatJson(scn, r) {
  var events = r.events.map(function (e) {
    if (e.type !== "prose") return e;
    return { type: "prose", text: e.text, rolls: rollsIn(e.text) };
  });
  return JSON.stringify({
    status: r.status, events: events, stopped: r.stopped, exits: r.exits, errors: r.errors, hints: errorHints(r.errors),
    purseDelta: r.purseDelta, hp: { before: r.hpBefore, after: r.hp }, watch: r.watch,
    refresh: scn.refresh ? { checks: r.refreshChecks, skipped: r.refreshSkipped,
      differences: r.refreshDiffs.filter(function (d) { return !KNOWN_ENGINE_DIFF.test(d); }),
      knownEngineDifferences: r.refreshDiffs.filter(function (d) { return KNOWN_ENGINE_DIFF.test(d); }) } : undefined
  }, null, 2);
}

// ------------------------------------------------------------------ command line

// "Kneel by the friar;Follow the trail@high;Attack with your@high*" -> steps
function parsePicks(s) {
  return s.split(";").map(function (p) { return p.trim(); }).filter(Boolean).map(function (p) {
    var m = /^(.*?)(?:@([\w.]+))?(\*)?$/.exec(p);
    var step = { pick: /^\d+$/.test(m[1]) ? parseInt(m[1], 10) : m[1] };
    if (m[2]) step.rand = /^[\d.]+$/.test(m[2]) ? parseFloat(m[2]) : m[2];
    if (m[3]) step.whileAvail = true;
    return step;
  });
}

function main(argv) {
  var flags = {}, kv = {}, file = null;
  argv.forEach(function (a) {
    var f = /^--([\w-]+)(?:=(.*))?$/.exec(a);
    if (f) { flags[f[1]] = f[2] === undefined ? true : f[2]; return; }
    var m = /^(\w+)=([\s\S]*)$/.exec(a);
    if (m) { kv[m[1]] = m[2]; return; }
    file = a;
  });
  if (flags.help || (!file && !Object.keys(kv).length && !flags.presets && !flags.labels)) {
    console.log("Usage: node tools/scripted_play.js <script.json | -> [key=value ...] [--json] [--raw] [--no-menus]\n" +
      "       node tools/scripted_play.js --presets | --labels=<scene>\nSee the header of this file for every field.");
    return 0;
  }
  if (flags.presets) {
    var names = presets();
    if (flags.json) console.log(JSON.stringify(names, null, 2)); else names.forEach(function (n) { console.log(n.replace(/\s+/g, " ")); });
    return 0;
  }
  if (flags.labels) {
    var text = fs.readFileSync(path.join(ROOT, "web", flags.game || "mygame", "scenes", flags.labels + ".txt"), "utf8").split(/\r?\n/);
    var labels = [];
    text.forEach(function (l, i) { var m = /^\*label\s+(\S+)/.exec(l); if (m) labels.push({ label: m[1], line: i + 1 }); });
    if (flags.json) console.log(JSON.stringify(labels, null, 2)); else labels.forEach(function (l) { console.log(l.label + "  (line " + l.line + ")"); });
    return 0;
  }

  var scn = {};
  if (file) {
    var src = file === "-" ? fs.readFileSync(0, "utf8") : fs.readFileSync(path.resolve(file), "utf8");
    scn = JSON.parse(src);
  }
  Object.keys(kv).forEach(function (k) {
    var v = kv[k];
    if (k === "stats" || k === "steps") scn[k] = JSON.parse(v);
    else if (k === "picks") scn.steps = parsePicks(v);
    else if (k === "watch" || k === "sabotage") scn[k] = v.split(",").map(function (x) { return x.trim(); }).filter(Boolean);
    else if (k === "refresh") scn.refresh = v === "true";
    else scn[k] = v;
  });
  var r = play(scn);
  console.log(flags.json ? formatJson(scn, r) : formatText(scn, r, { raw: !!flags.raw, menus: !flags["no-menus"] }));
  var bad = r.errors.length || r.refreshDiffs.some(function (d) { return !KNOWN_ENGINE_DIFF.test(d); });
  return bad ? 1 : 0;
}

module.exports = { play: play, presets: presets, parsePicks: parsePicks, formatText: formatText, formatJson: formatJson };

if (require.main === module) {
  var code;
  try { code = main(process.argv.slice(2)); } catch (e) { console.error("scripted_play: " + e.message); code = 2; }
  process.exit(code);
}
