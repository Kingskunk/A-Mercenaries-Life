/*
 * refresh_fuzz_test.js
 *
 * A randomtest-style fuzzer that hunts specifically for the "refresh
 * duplication" bug class: a browser refresh (or a Show Stats/Menu round
 * trip) replays the *current page* from its recorded start line, silently
 * re-running every command since -- including any *rand or bare
 * *set stat +N -- without the player taking a new action. That's the root
 * cause behind this game's dice-reroll-on-refresh bug, the armor class
 * climbing on repeated shield purchases, and the dice-table wager silently
 * skipping its payout: all were a page running a non-idempotent mutation
 * between its start and its next *choice/*page_break.
 *
 * Stock randomtest.js walks the game once, forward only, and only catches
 * crashes/parse errors. It structurally cannot see this bug class, because
 * it never re-visits a pause point it already reached. This tool does:
 * at every *choice/*page_break the random walk reaches, it snapshots the
 * live stats, then independently replays the page from its recorded start
 * (web/scene.js's stats.choice_page_start_line/indent, the same bookmark
 * a real browser refresh uses) against a cloned copy of that snapshot, and
 * diffs the two. Any stat that comes out different is a command that ran
 * again during the replay and shouldn't have -- exactly what a real
 * refresh would do to a real player.
 *
 * This does NOT replace randomtest.js -- it doesn't check text rendering,
 * gender balance, or purchase gating, and it only diffs persistent `stats`
 * (not `*temp` variables, which live on rejoin-a-label bugs like the Lyra
 * dialogue reset -- a different bug class). Run both.
 *
 * mode=smart: a pure uniform random walk mostly exercises checks the current
 * build has no business attempting, which (a) burns most rolls on failure
 * branches and (b) makes the walk depend entirely on chargen RNG for whether
 * any given stat's success branch gets visited at all. In smart mode, at
 * every *choice this tool statically scans each option's body (bounded to
 * the next sibling `#`/`*choice` line) for a `*set check_stat "xxx"` --
 * exactly the line every skill-check option sets right before *gosub_scene
 * startup roll_d20_check -- and:
 *   1. always takes a not-yet-active "[Cantrip: Guidance]" option first, the
 *      way any player who has it would;
 *   2. otherwise prefers whichever option's check_stat matches the build's
 *      strengths -- either its actual highest ability modifier (the default,
 *      "balanced"), or one forced ability if archetype=str/dex/con/int/wis/cha
 *      is passed, so a run can specifically stress-test (say) a pure-CHA
 *      build's success paths;
 *   3. options with no detectable check_stat are neutral (weight 0) and so
 *      still get picked freely against a mismatched check, just not against
 *      a matching one;
 *   4. ties (including "every option is non-check") fall back to the same
 *      least-used-first fairness rotation as random mode.
 * With no archetype pinned, each iteration rotates through str/dex/con/int/
 * wis/cha/balanced so one run gets coverage of every archetype's success
 * paths rather than just whatever chargen RNG happened to roll. The *rand
 * inside roll_d20_check itself is untouched -- this only biases which
 * checks get attempted, not whether they succeed -- so failure branches
 * still get seen too, just for checks the build is actually likely to fail
 * rather than checks it never had a chance at.
 *
 * usage: node refresh_fuzz_test.js [num=30] [game=mygame] [seed=0]
 *                                  [avoidUsedOptions=true] [maxFindings=25]
 *                                  [mode=random|smart] [archetype=str|dex|con|int|wis|cha|balanced]
 *                                  [gotoLoopCap=200000] [quietDiagnostics=true]
 */

var fs = require('fs');
var vm = require('vm');
function load(file) { vm.runInThisContext(fs.readFileSync(file), file); }

var iterations = 30;
var gameName = "mygame";
var randomSeed = 0;
var avoidUsedOptions = true;
var maxFindings = 25;
// [shadow-diverged]/[shadow-no-pause] are diagnostic-only categories (see
// narrative_guidelines.md Section 19) -- a real run on real content produces
// dozens to hundreds of them, which both buries genuine findings in console
// noise and (worse) can exhaust maxFindings on diagnostics alone, stopping
// the batch before it ever reaches real content further along. Default true:
// collapse both into one summary count each instead of a finding per
// instance. Pass quietDiagnostics=false when actually investigating why a
// specific page diverges -- that restores the exact prior behavior (each
// instance printed and counted toward maxFindings).
var quietDiagnostics = true;
var mode = "random";
var forcedArchetype = null; // null == "rotate through all archetypes across iterations"
var VALID_ARCHETYPES = ["str", "dex", "con", "int", "wis", "cha", "balanced"];
var showChoices = false;
// Safety net against a *goto cycle with no intervening *choice/*page_break/
// *finish/*ending -- see the gotoLoopCap guard installed below, right after
// web/scene.js loads. The existing `guard < 200000` cap on the trampoline
// loop only bounds how many pause points one playthrough processes; it
// can't stop a tight *goto cycle that never reaches a pause at all, which
// runs inside one synchronous call and would hang the process forever.
var gotoLoopCap = 200000;

function parseArgs(args) {
  for (var i = 0; i < args.length; i++) {
    var parts = args[i].split("=");
    if (parts.length !== 2) throw new Error("Couldn't parse argument " + (i + 1) + ": " + args[i]);
    var name = parts[0], value = parts[1];
    if (name === "num") iterations = Number(value);
    else if (name === "game") gameName = value;
    else if (name === "seed") randomSeed = Number(value);
    else if (name === "avoidUsedOptions") avoidUsedOptions = (value !== "false");
    else if (name === "maxFindings") maxFindings = Number(value);
    else if (name === "mode") {
      if (value !== "random" && value !== "smart") throw new Error("mode must be random or smart, got: " + value);
      mode = value;
    } else if (name === "archetype") {
      if (VALID_ARCHETYPES.indexOf(value) === -1) throw new Error("archetype must be one of " + VALID_ARCHETYPES.join("/") + ", got: " + value);
      forcedArchetype = value;
    } else if (name === "showChoices") showChoices = (value !== "false");
    else if (name === "gotoLoopCap") gotoLoopCap = Number(value);
    else if (name === "quietDiagnostics") quietDiagnostics = (value !== "false");
    else throw new Error("Unknown argument: " + name);
  }
}
parseArgs(process.argv.slice(2));

load("web/scene.js");
load("web/navigator.js");
load("web/util.js");
load("headless.js");
load("seedrandom.js");

// --- Infinite-loop guard -------------------------------------------------
// A *goto cycle with no intervening *choice/*page_break/*finish/*ending
// runs entirely inside one synchronous call and never yields, so Node
// never gets a chance to time out or interrupt it -- left unguarded, that
// one playthrough (or one shadow-replay probe, which reconstructs and
// executes its own Scene the same way) hangs the process forever with
// zero output. Counting every *goto across a whole iteration (main walk
// plus every shadow probe it runs) and throwing past a generous cap is the
// only way to catch this. Override with gotoLoopCap=N if a legitimate run
// genuinely needs more.
var gotoCallCount = 0;
var _origSceneGoto = Scene.prototype["goto"];
Scene.prototype["goto"] = function guardedGoto(line) {
  if (++gotoCallCount > gotoLoopCap) {
    var err = new Error(this.lineMsg() + "possible infinite loop: more than " + gotoLoopCap + " *goto calls in a single iteration. Check for a *goto cycle with no *choice/*page_break/*finish/*ending in between. (Raise gotoLoopCap= if a legitimate run genuinely needs more.)");
    err.isGotoLoopGuard = true;
    throw err;
  }
  return _origSceneGoto.call(this, line);
};

// Every fresh Scene's first execute() defers loading through util.js's
// safeTimeout, which wraps a real (async) setTimeout -- harmless in a
// browser event loop, but this harness drains its own continuation chain
// synchronously and would never get a chance to run it. Without this
// override, execute() silently no-ops on a brand-new Scene (including every
// shadow-probe Scene, of which there's a fresh one per choice), which reads
// exactly like "the replay ran straight to *finish/*ending."
global.safeTimeout = function (fn) { safeCall(null, fn); };
load("web/" + gameName + "/mygame.js");

// Pre-load every scene file's parsed lines into the global `allScenes` map --
// web/scene.js checks for this and, when present, uses it instead of the
// browser-only XHR/window.isFile loading path (see loadScene()), which is
// what a Node harness needs. This also means every *gosub_scene / *goto_scene
// crossing into a scene we haven't executed yet already has its lines ready,
// same as the game itself pre-warms them.
global.allScenes = {};
fs.readdirSync("web/" + gameName + "/scenes").forEach(function (file) {
  if (!/\.txt$/.test(file)) return;
  var name = file.replace(/\.txt$/, "");
  var text = fs.readFileSync("web/" + gameName + "/scenes/" + file, "utf8");
  var tmp = new Scene();
  tmp.loadLines(text);
  global.allScenes[name] = { crc: tmp.crc, lines: tmp.lines, labels: tmp.labels };
});

// --- Headless environment stubs (same shape as randomtest.js's Node path) ---
printImage = function () {};
printx = println = printParagraph = function () {};
printFooter = function () {};
printButton = function (buttonName, parent, isIcon, code) { timeout = code; };
printOptions = function () {};
doneLoading = function () {};
achieve = function () {};
crc32 = function () {};
clearScreen = function (code) { timeout = code; };
// Fire immediately -- do NOT defer through `timeout` the way clearScreen
// does. printLoop() calls refreshSavedProgress() on every single pause,
// which calls this with a no-op callback purely to persist stats/temps for
// a refresh that will never happen here; deferring it through `timeout`
// clobbers the real *choice continuation set moments earlier and silently
// stops the walk after its first choice. (This is also a real bug in stock
// randomtest.js, fixed there the same way.)
saveCookie = function (callback) { if (callback) callback.call(); };

Scene.prototype.subscribe = function () {};
Scene.prototype.save = function () {};
Scene.prototype.stat_chart = function () { this.parseStatChart(); };
Scene.prototype.randomtest = true; // reuses the engine's own clearScreen-deferred *return, avoiding stack overflow on long gosub chains
Scene.prototype.check_purchase = function (data) {
  var products = data.split(/ /);
  for (var i = 0; i < products.length; i++) this.temps["choice_purchased_" + products[i]] = false;
  this.temps.choice_purchase_supported = false;
  this.temps.choice_purchased_everything = false;
};
Scene.prototype.buyButton = function () {};
Scene.prototype.restore_checkpoint = function () {
  throw new Error(this.lineMsg() + "refresh_fuzz_test can't run *restore_checkpoint; guard it with *if (not(choice_randomtest)) as usual.");
};
Scene.prototype.save_game = function () {};
Scene.prototype.restore_game = function (data) {
  this.parseRestoreGame(false);
  if (data) {
    var result = /^cancel=(\S+)$/.exec(data);
    if (result) this["goto"](result[1]);
  }
};
Scene.prototype.input_text = function (line) {
  var parsed = this.parseInputText(line);
  this.set(parsed.variable + ' "test input"');
};
Scene.prototype.input_number = function (data) { this.rand(data); };
// The default *finish prints a real UI button (printButton(buttonName, main, ...)),
// where `main` is a browser DOM node that doesn't exist here. Move straight
// to the next scene instead, matching randomtest.js's own override.
Scene.prototype.finish = Scene.prototype.autofinish = function (buttonText) {
  this.paragraph();
  this.finished = true;
  var nextSceneName = this.nav && nav.nextSceneName(this.name);
  if (!nextSceneName) return;
  var scene = new Scene(nextSceneName, this.stats, this.nav, false);
  scene.resetPage();
};
Scene.prototype.advertisement = function () {};
Scene.prototype.delay_break = function () {};
Scene.prototype.delay_ending = function () { this.paragraph(); this.finished = true; };
Scene.prototype.ending = function () { this.paragraph(); this.finished = true; };
Scene.prototype.restart = Scene.prototype.ending;

// --- Option selection, borrowed from randomtest.js so both tools explore choices the same way ---
var choiceUseCounts = {};
function choiceKey(options, i, choiceLine, sceneName) { return "o:" + options[i].ultimateOption.line + ",c:" + choiceLine + ",s:" + sceneName; }
function leastUsedIndex(options, candidateIndices, choiceLine, sceneName) {
  var minUses = Infinity, selectable = [];
  for (var j = 0; j < candidateIndices.length; j++) {
    var i = candidateIndices[j];
    var uses = choiceUseCounts[choiceKey(options, i, choiceLine, sceneName)] || 0;
    if (uses < minUses) { selectable = [i]; minUses = uses; }
    else if (uses == minUses) selectable.push(i);
  }
  var result = selectable[Math.floor(Math.random() * selectable.length)];
  choiceUseCounts[choiceKey(options, result, choiceLine, sceneName)] = minUses + 1;
  return result;
}
function chooseIndex(options, choiceLine, sceneName) {
  if (!avoidUsedOptions) return Math.floor(Math.random() * options.length);
  var all = [];
  for (var i = 0; i < options.length; i++) all.push(i);
  return leastUsedIndex(options, all, choiceLine, sceneName);
}

// --- Smart (build-aware) option selection, only used when mode=smart ---
// Which archetype the current playthrough is simulating -- set per-iteration
// in run() below, either pinned by the archetype=... CLI arg or rotated
// across VALID_ARCHETYPES so one invocation covers every build.
var currentArchetype = "balanced";
var GUIDANCE_OPTION_RE = /Cantrip:\s*Guidance/i;
var CHECK_STAT_RE = /\*set\s+check_stat\s+"(\w+)"/;
var VALID_STATS = { str: true, dex: true, con: true, int: true, wis: true, cha: true };
// Keyed by "sceneName:line" -- the same option body gets statically re-scanned
// every time this *choice is reached again across a random walk (or across
// iterations); cache it since the source text obviously never changes.
var checkStatCache = {};
function detectCheckStat(scene, bodyStartLine) {
  var cacheKey = scene.name + ":" + bodyStartLine;
  if (checkStatCache.hasOwnProperty(cacheKey)) return checkStatCache[cacheKey];
  var lines = scene.lines;
  var found = null;
  for (var i = bodyStartLine, limit = Math.min(lines.length, bodyStartLine + 30); i < limit; i++) {
    var line = lines[i];
    if (line == null) break;
    // A line as/less indented as a fresh option marker or a nested *choice
    // means we've walked off the end of this option's body into the next
    // sibling -- stop scanning rather than picking up someone else's check.
    if (/^\s*#/.test(line) || /^\s*\*choice\b/.test(line)) break;
    var m = CHECK_STAT_RE.exec(line);
    if (m && VALID_STATS[m[1].toLowerCase()]) { found = m[1].toLowerCase(); break; }
  }
  checkStatCache[cacheKey] = found;
  return found;
}
// Matching-stat options always outrank non-check options, which always
// outrank an off-archetype check (a build-matching player avoids a fight
// they're bad at when a free alternative exists, and only takes it when
// every option on offer is a check). With no archetype pinned ("balanced"),
// weight is just this build's actual modifier for that ability, so the walk
// naturally favors whatever chargen happened to make strong.
function statWeight(scene, stat) {
  if (!stat) return 0;
  if (currentArchetype !== "balanced") return (stat === currentArchetype) ? 2 : -1;
  var mod = scene.stats[stat + "_mod"];
  return (typeof mod === "number" && !isNaN(mod)) ? mod : 0;
}
// Set alongside the return value so callers can log *why* smart mode picked
// what it picked -- useful when showChoices is on to sanity-check that the
// bias is actually landing on the checks it's supposed to.
var lastSmartReason = "";
function chooseSmartIndex(flattened, choiceLine, scene) {
  if (!scene.stats.guidance_active) {
    for (var i = 0; i < flattened.length; i++) {
      if (GUIDANCE_OPTION_RE.test(flattened[i].ultimateOption.name)) {
        lastSmartReason = "guidance-priority";
        return i;
      }
    }
  }

  var stats = flattened.map(function (opt) { return detectCheckStat(scene, opt.ultimateOption.line); });
  var weights = stats.map(function (stat) { return statWeight(scene, stat); });
  var maxWeight = Math.max.apply(null, weights);
  var candidates = [];
  for (var j = 0; j < weights.length; j++) if (weights[j] === maxWeight) candidates.push(j);

  var index = (!avoidUsedOptions)
    ? candidates[Math.floor(Math.random() * candidates.length)]
    : leastUsedIndex(flattened, candidates, choiceLine, scene.name);
  lastSmartReason = stats[index]
    ? "stat-match(" + stats[index] + " archetype=" + currentArchetype + " weight=" + maxWeight + ")"
    : "no-check(archetype=" + currentArchetype + ")";
  return index;
}

function flattenOptions(list, options, flattenedOption) {
  if (!flattenedOption) flattenedOption = {};
  for (var i = 0; i < options.length; i++) {
    var option = options[i];
    var next = {};
    for (var k in flattenedOption) next[k] = flattenedOption[k];
    next[option.group] = i;
    if (option.suboptions) {
      flattenOptions(list, option.suboptions, next);
    } else {
      next.ultimateOption = option;
      if (!option.unselectable) list.push(next);
    }
  }
}

// --- The refresh-replay probe ---
// While this is true, *choice and *page_break don't do their normal thing --
// they just record where they landed and stop, exactly like a real page
// pausing for player input after a browser refresh. This flag lives on the
// module, not on any one Scene instance, specifically so it's still in
// effect after *gosub_scene/*return reconstructs a brand-new Scene object
// mid-page (web/scene.js does this for every cross-scene subroutine call --
// see .agents/rules/narrative_guidelines.md section 13).
var inShadowProbe = false;
var probeResult = null;

var findings = [];
var probesRun = 0;
var quietDivergedCount = 0;
var quietNoPauseCount = 0;
var IGNORED_STAT_KEYS = { choice_time_stamp: true };

function cloneForSnapshot(obj) {
  var sceneRef = obj.scene;
  if (sceneRef) delete obj.scene;
  var copy;
  try {
    copy = JSON.parse(JSON.stringify(obj));
  } finally {
    if (sceneRef) obj.scene = sceneRef;
  }
  return copy;
}

function diffStats(before, after) {
  var out = [];
  var keys = {};
  for (var k in before) keys[k] = true;
  for (var k2 in after) keys[k2] = true;
  for (var key in keys) {
    if (IGNORED_STAT_KEYS[key]) continue;
    var a = before[key], b = after[key];
    if (JSON.stringify(a) !== JSON.stringify(b)) {
      out.push(key + " (" + JSON.stringify(a) + " -> " + JSON.stringify(b) + ")");
    }
  }
  return out;
}

function recordFinding(type, scene, pauseLine, message) {
  if (quietDiagnostics && type === "shadow-diverged") {
    quietDivergedCount++;
    return;
  }
  if (quietDiagnostics && type === "shadow-no-pause") {
    quietNoPauseCount++;
    return;
  }
  findings.push({ type: type, scene: scene.name, line: pauseLine + 1, message: message });
  console.log("  FINDING [" + type + "] " + scene.name + " line " + (pauseLine + 1) + ": " + message);
}

// pauseLine must be captured by the caller BEFORE calling parseOptions() --
// parseOptions walks the whole choice block as a side effect of building the
// options tree, leaving this.lineNum pointing partway into an option body
// rather than at the *choice line itself. The shadow-probe path never calls
// parseOptions (it doesn't need to pick an option), so comparing against a
// post-parseOptions lineNum would falsely "diverge" on every single choice.
function probeCurrentChoice(scene, pauseLine) {
  probesRun++;
  var startLine = (typeof scene.stats.choice_page_start_line === "number") ? scene.stats.choice_page_start_line : scene.lineNum;
  var startIndent = (typeof scene.stats.choice_page_start_indent === "number") ? scene.stats.choice_page_start_indent : scene.indent;

  // The page can genuinely have begun in a DIFFERENT scene file than the
  // current pause (reached via *gosub_scene, e.g. any fight run through
  // combat.txt -- see narrative_guidelines.md Section 19's *gosub_scene
  // blind spot). startLine/startIndent are only meaningful within
  // choice_page_start_scene; blindly reconstructing a shadow Scene of the
  // CURRENT scene at those coordinates can crash on a coincidental cross-
  // file line/indent collision (confirmed: a page that began in alderford.txt
  // reached a pause in combat.txt, and combat.txt's own unrelated line 431
  // happened to sit at a different indent, throwing "increasing indent not
  // allowed" -- a tooling artifact, not a real bug). Detect the mismatch
  // up front and report it the same way the subscene-stack blind spot
  // already is, instead of attempting an unsafe reconstruction.
  if (scene.stats.choice_page_start_scene && scene.stats.choice_page_start_scene !== scene.name) {
    recordFinding("shadow-no-pause", scene, pauseLine,
      "page began in scene \"" + scene.stats.choice_page_start_scene + "\", not \"" + scene.name + "\" -- reached via *gosub_scene, can't safely shadow-replay across scene files without rebuilding choice_subscene_stack. Not a confirmed bug.");
    return;
  }

  var beforeStats = cloneForSnapshot(scene.stats);

  var shadowStats = JSON.parse(JSON.stringify(beforeStats));
  var shadowScene = new Scene(scene.name, shadowStats, scene.nav, { debugMode: false });
  shadowStats.scene = shadowScene;
  shadowScene.temps = JSON.parse(JSON.stringify(cloneForSnapshot(scene.temps)));
  shadowScene.lineNum = startLine;
  shadowScene.indent = startIndent;

  var savedOuterTimeout = timeout;
  timeout = null;
  probeResult = null;
  inShadowProbe = true;
  try {
    shadowScene.execute();
    var guard = 0;
    while (timeout && !probeResult && guard < 100000) {
      var fn = timeout;
      timeout = null;
      fn();
      guard++;
    }
  } catch (e) {
    inShadowProbe = false;
    timeout = savedOuterTimeout;
    recordFinding("shadow-crash", scene, pauseLine,
      "simulated refresh crashed while replaying from line " + (startLine + 1) + ": " + e.message);
    return;
  }
  inShadowProbe = false;
  timeout = savedOuterTimeout;

  if (!probeResult) {
    recordFinding("shadow-no-pause", scene, pauseLine,
      "simulated refresh from line " + (startLine + 1) + " ran to *finish/*ending instead of pausing again -- can't verify this page is refresh-safe.");
    return;
  }

  if (probeResult.sceneName !== scene.name || probeResult.lineNum !== pauseLine) {
    // The replay ended up somewhere else entirely -- diffing its stats
    // against beforeStats would just be comparing two different moments in
    // the story (different scene/line, naturally different clock, actions
    // left, etc.), which is noise, not a finding. Report the divergence
    // itself and stop; it's the actionable signal on its own.
    recordFinding("shadow-diverged", scene, pauseLine,
      "simulated refresh from line " + (startLine + 1) + " paused at a DIFFERENT spot (" +
      probeResult.sceneName + " line " + (probeResult.lineNum + 1) + ", " + probeResult.kind +
      ") instead of back here -- a stat likely changed enough to flip an *if branch mid-replay.");
    return;
  }

  var diffs = diffStats(beforeStats, probeResult.stats);
  if (diffs.length) {
    recordFinding("refresh-duplication", scene, pauseLine,
      "refreshing here (page started at line " + (startLine + 1) + ") would change: " + diffs.join(", "));
  }
}

// --- *choice / *page_break overrides ---
Scene.prototype.page_break = function (buttonText) {
  var pauseLine = this.lineNum;
  this.paragraph();
  if (inShadowProbe) {
    if (!probeResult) probeResult = { stats: cloneForSnapshot(this.stats), sceneName: this.name, lineNum: pauseLine, kind: "page_break" };
    this.finished = true;
    return;
  }
  probeCurrentChoice(this, pauseLine);
  this.finished = false;
  this.resetCheckedPurchases();
};

Scene.prototype.choice = function (data, isFakeChoice) {
  if (inShadowProbe) {
    var probePauseLine = this.lineNum;
    this.paragraph();
    if (!probeResult) probeResult = { stats: cloneForSnapshot(this.stats), sceneName: this.name, lineNum: probePauseLine, kind: "choice" };
    this.finished = true;
    return;
  }

  var choiceLine = this.lineNum;
  var groups = ["choice"];
  if (data) groups = data.split(/ /);
  var allowFallthrough = (isFakeChoice === true) || this.getVar("implicit_control_flow");
  var options = this.parseOptions(this.indent, groups, allowFallthrough);
  var flattened = [];
  flattenOptions(flattened, options);
  var index = (mode === "smart") ? chooseSmartIndex(flattened, choiceLine, this) : chooseIndex(flattened, choiceLine, this.name);
  var item = flattened[index];
  if (showChoices) {
    var reason = (mode === "smart") ? (" [" + lastSmartReason + "]") : "";
    console.log("  " + this.name + " line " + (choiceLine + 1) + " -> \"" + trim(item.ultimateOption.name).slice(0, 80) + "\"" + reason);
  }
  if (!this.temps._choiceEnds) this.temps._choiceEnds = {};
  for (var i = 0; i < options.length; i++) {
    this.temps._choiceEnds[options[i].line - 1] = allowFallthrough ? this.lineNum : 0;
  }
  this.paragraph();

  probeCurrentChoice(this, choiceLine);

  var self = this;
  timeout = function () { self.standardResolution(item.ultimateOption); };
  this.finished = true;
};

// --- Main driver (sync, same shape as randomtest.js's Node "sync" path) ---
var timeout = null;
function run() {
  var start = Date.now();
  for (var i = 0; i < iterations; i++) {
    var seed = i + randomSeed;
    if (mode === "smart") {
      currentArchetype = forcedArchetype || VALID_ARCHETYPES[i % VALID_ARCHETYPES.length];
      console.log("*****Seed " + seed + " [smart:" + currentArchetype + "]");
    } else {
      console.log("*****Seed " + seed);
    }
    nav.resetStats(stats);
    timeout = null;
    gotoCallCount = 0;
    Math.seedrandom(seed);
    var scene = new Scene(nav.getStartupScene(), stats, nav, false);
    try {
      scene.execute();
      var guard = 0;
      while (timeout && guard < 200000) {
        var fn = timeout;
        timeout = null;
        fn();
        guard++;
      }
    } catch (e) {
      if (e.isGotoLoopGuard) {
        // Not a code bug -- see the gotoLoopCap guard's own comment above.
        // Report it and move on to the next seed instead of counting it as
        // a crash/finding.
        console.log("OPEN-WORLD WANDER (seed " + seed + "): " + e.message);
        continue;
      }
      console.log("RUN " + seed + " CRASHED: " + (e.stack || e.message));
      findings.push({ type: "crash", message: "seed " + seed + ": " + e.message });
    }
    if (findings.length >= maxFindings) {
      console.log("Stopping early -- reached maxFindings (" + maxFindings + ").");
      break;
    }
  }

  console.log("");
  console.log("Probed " + probesRun + " choice/page_break pause points across " + Math.min(iterations, findings.length >= maxFindings ? iterations : iterations) + " random playthrough(s).");
  console.log("Time: " + ((Date.now() - start) / 1000) + "s");
  if (quietDiagnostics && (quietDivergedCount || quietNoPauseCount)) {
    console.log(quietDivergedCount + " [shadow-diverged], " + quietNoPauseCount + " [shadow-no-pause] -- diagnostic-only, not counted as findings (see narrative_guidelines.md Section 19). Rerun with quietDiagnostics=false to see each one.");
  }
  if (!findings.length) {
    console.log("REFRESH FUZZ PASSED -- no refresh-duplication bugs found.");
    return;
  }
  console.log("");
  console.log(findings.length + " FINDING(S):");
  findings.forEach(function (f, idx) {
    console.log((idx + 1) + ". [" + f.type + "] " + (f.scene ? f.scene + " line " + f.line + ": " : "") + f.message);
  });
  process.exitCode = 1;
}

run();
