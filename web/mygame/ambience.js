/*
 * AMBIENCE -- the page's background sound follows where the player is, the hour and the weather (2026-10-14).
 *
 * LAYER 1, the place bed: web/mygame/scenery.js works out where the player is (placeNames: an inn, a shop, a dungeon, an overworld tile, a district); SOUND below says which loops each
 *   place plays. A place has a day loop and/or a night loop (the day one fading in through the dawn and out through the dusk, the night one the other way, on the same curve as the
 *   backdrop) or one loop for every hour ("all"). A side with no loop is quiet at that hour.
 * LAYER 2, the weather on top: weather_rain (wet), weather_storm (a storm; the rain loop if there is none), weather_thunder (a storm, over the rain), weather_wind (snow) and
 *   weather_blizzard (a blizzard; the wind loop if there is none). They play where a place bed plays, so rain is not heard in a town shop, and an indoor place (an inn, a shop, a
 *   dungeon that is not open air) hears them muffled. A missing file is skipped, so the layers can be added one at a time.
 * LAYER 3, travel: horseback_travel (hooves) plays on the overworld, on open ground, for a player who has a horse. Weather plays over it.
 * The Black Sinks battle plays siege_with_magic for the Cadre and siege_battle for everyone else.
 *
 * TO ADD SOUND: put Name.mp3 (any length) in /Sounds, run  node tools/make_ambience.js  (it cuts a seamless ~1 MB loop into /ambience and rewrites ambience-data.js), then  node compile.js.
 * A loop's name is its file name in lower case with underscores (Forest_Day.mp3 -> forest_day). Then add the place to SOUND (and a name to ALIAS if the place has several names).
 *
 * Plain <audio> elements, not Web Audio: they stream (a 150 s stereo loop decoded to memory is 57 MB), and they play from file:// where fetch is blocked. Fades are stepped here. Browsers
 * stay silent until the player has clicked or pressed a key once; the first gesture starts everything. The loop point is a seamless crossfade made by the tool, so the one small gap the
 * browser leaves when it restarts the file falls inside dense noise. Volume and mute are kept in localStorage "ambience".
 * CONTROLS (2026-10-15, the user's choice: no button on the rail): the game's Menu > Change settings has "Turn the sound up", "Turn the sound down" and "Mute the sound" (web/ui.js textOptionsMenu calls
 * Ambience.louder / quieter / toggleMute), and the S key toggles mute from anywhere (listed in the keyboard shortcuts). While the read-aloud voice is playing the ambience ducks to about a third of its
 * level and comes back when the voice stops.
 */
(function () {
  "use strict";
  var FILES = window.AMBIENCE_FILES || [];
  if (!FILES.length) return;
  var BASES = ["ambience/", "../../ambience/", "../ambience/"];   // where the folder may be, relative to the page
  var FADE = 3;                                                     // seconds for a layer to fade in or out
  var base = null, probing = false, layers = {}, unlocked = false, cfg = { vol: 0.5, mute: false };

  // what each kind of place plays: day (by day), night (at night), all (at every hour). indoor: the weather is muffled there.
  var SOUND = {
    forest:        { day: "forest_day", night: "forest_night" },
    city:          { day: "city_day", night: "city_night" },
    harbor:        { all: "medieval_harbour" },
    dredge_end:    { all: "medieval_slums" },
    village:       { day: "generic_village", night: "generic_village_town_night" },
    woodland:      { day: "woodland_village", night: "generic_village_town_night" },
    shop:          { all: "city_indoor", indoor: true },
    tavern:        { day: "quiet_tavern", night: "crowded_tavern", indoor: true },   // it fills up as the day ends
    silt_conduits: { all: "sewer", indoor: true },
    siege:         { all: "siege_battle" }
  };
  // a place name (from Scenery.placeNames) that plays another kind of place's sound
  var ALIAS = {
    longshade_forest: "forest", woodroad: "forest", forest: "forest",
    compound: "city", middle_ward: "city", civic_heights: "city", upper_wharves: "city", port_valen: "city", city: "city",
    alderford: "village", whitefold: "village", redvein: "village", marlcross: "village", brinewick: "village", barleycross: "village", village: "village",
    timbermouth: "woodland", ashrun_holt: "woodland"
  };
  var OVERWORLD_OPEN = { road: 1, woodroad: 1, hills: 1, forest: 1 };   // ground a rider travels over (not a town, a village or a fort)

  try { var saved = JSON.parse(window.localStorage.getItem("ambience") || "null"); if (saved) cfg = { vol: Math.max(0, Math.min(1, Number(saved.vol))), mute: !!saved.mute }; } catch (e) {}
  if (isNaN(cfg.vol)) cfg.vol = 0.5;
  function save() { try { window.localStorage.setItem("ambience", JSON.stringify(cfg)); } catch (e) {} }
  function has(name) { return FILES.indexOf(name) >= 0; }

  // find the folder by loading the first known file from each place it could be (an audio element loads from file:// where fetch cannot)
  function findBase() {
    if (base || probing) return;
    probing = true;
    var i = 0;
    (function next() {
      if (i >= BASES.length) { probing = false; return; }
      var b = BASES[i++], a = new Audio();
      a.preload = "metadata";
      a.onloadedmetadata = function () { base = b; probing = false; a.src = ""; };
      a.onerror = next;
      a.src = b + FILES[0] + ".ogg";
    })();
  }

  // the place the player is in, for sound: the first name Scenery gives that plays something, as { kind, spec }
  function place(s) {
    var names = window.Scenery && window.Scenery.placeNames ? window.Scenery.placeNames(s) : [];
    for (var i = 0; i < names.length; i++) {
      var kind = ALIAS[names[i]] || names[i], spec = SOUND[kind];
      if (!spec) continue;
      var d = spec.day || spec.all, n = spec.night || spec.all;
      if (has(d) || has(n)) return { kind: kind, spec: spec };
    }
    return null;
  }

  // what each layer should be doing now: name -> 0..1
  function targets(s) {
    var t = {};
    if (cfg.mute || document.hidden || !window.Scenery) return t;
    var p = place(s), d = window.Scenery.daylight((Number(s.clock_hour) || 0) + (Number(s.clock_minute) || 0) / 60);
    function put(name, v) { if (name && has(name) && v > 0) t[name] = Math.max(t[name] || 0, v); }
    if (p) {
      var sp = p.spec, siege = p.kind === "siege";
      if (siege) put(s.squad === "cadre" && has("siege_with_magic") ? "siege_with_magic" : "siege_battle", 1);
      else if (sp.all) put(sp.all, 1);
      else { put(sp.day, d); put(sp.night, 1 - d); }
    }
    // travel: hooves, on open ground on the overworld, for a rider
    var O = window.Overworld, n = s.ow_on && O && O.nodes ? O.nodes[s.ow_pos] : null;
    var riding = !!(n && s.has_horse && OVERWORLD_OPEN[n.kind]);
    if (riding) put("horseback_travel", 0.9);
    // weather: where there is a bed to hear it in, or on open ground; muffled indoors and underground
    if (p || riding) {
      var wet = !!s.weather_wet, cold = !!s.weather_cold && !wet, storm = Number(s.weather_severity) >= 3;
      var indoor = !!(p && p.spec.indoor) || !!(s.dg_in_run && p && p.kind !== "forest" && !p.spec.indoor), k = indoor ? 0.3 : 1;
      if (wet) {
        if (storm && has("weather_storm")) put("weather_storm", 0.9 * k);
        else put("weather_rain", (storm ? 1 : 0.6) * k);
        if (storm) put("weather_thunder", 0.8 * k);   // three minutes of thunder alone, on top of the storm
      }
      if (cold) {
        if (s.weather === "Blizzard" && has("weather_blizzard")) put("weather_blizzard", 0.9 * k);
        else put("weather_wind", (s.weather === "Blizzard" ? 0.9 : 0.35) * k);
      }
    }
    return t;
  }

  function layer(name) {
    var L = layers[name];
    if (!L) {
      var el = new Audio(); el.loop = true; el.preload = "auto"; el.volume = 0; el.src = base + name + ".ogg" + ((window.AMBIENCE_V || {})[name] ? "?v=" + window.AMBIENCE_V[name] : "");
      // Start somewhere in the loop, not always at its beginning, so the same storm or forest is never the same twice. Only when the length is a real number: a server with no partial downloads
      // (the simple test servers, possibly serve.js) makes the browser report an UNKNOWN length (Infinity), and a seek to a random point of that froze the page (found in testing). Once only,
      // in case a seek reloads the file and fires the event again.
      el.addEventListener("loadedmetadata", function () { if (isFinite(el.duration) && el.duration > 20 && el.seekable && el.seekable.length) el.currentTime = Math.random() * (el.duration - 10); }, { once: true });
      L = layers[name] = { el: el, level: 0, target: 0 };
    }
    return L;
  }

  // The read-aloud voice (shell.js reads the same button): while it plays, everything here ducks to DUCK of its level, quickly down and slowly back up, so the voice stays easy to follow.
  var DUCK = 0.33, duck = 1;
  function ttsPlaying() { var pp = document.getElementById("ttsPlayPause"); return !!pp && pp.textContent.indexOf("\u275A") >= 0; }
  function apply(L) { L.el.volume = Math.max(0, Math.min(1, L.level * duck * cfg.vol * cfg.vol)); }   // a squared curve sounds even to the ear

  // every 100 ms each layer steps toward its target, starting when it has something to say and pausing once it has faded out
  function tick() {
    var want = ttsPlaying() ? DUCK : 1;
    duck += Math.max(want < duck ? -0.08 : -0.02, Math.min(want < duck ? 0.08 : 0.02, want - duck));   // 0.5 s down, 2 s back up
    for (var n in layers) if (layers.hasOwnProperty(n)) {
      var L = layers[n], step = 0.1 / FADE;
      L.level += Math.max(-step, Math.min(step, L.target - L.level));
      apply(L);
      if (L.target > 0 && L.el.paused && unlocked) { var p = L.el.play(); if (p && p.catch) p.catch(function () {}); }
      if (L.target === 0 && L.level <= 0.001 && !L.el.paused) L.el.pause();
    }
  }

  function update() {
    var s = window.stats; if (!s || !base) { if (!base) findBase(); return; }
    var want = targets(s), n;
    for (n in want) if (want.hasOwnProperty(n)) layer(n).target = want[n];
    for (n in layers) if (layers.hasOwnProperty(n) && !want.hasOwnProperty(n)) layers[n].target = 0;
  }

  // ---- the first click or key starts the sound (browsers keep a page silent until then)
  function unlock() {
    if (unlocked) return; unlocked = true;
    ["pointerdown", "keydown"].forEach(function (e) { document.removeEventListener(e, unlock, true); });
    tick();
  }
  ["pointerdown", "keydown"].forEach(function (e) { document.addEventListener(e, unlock, true); });

  // ---- the controls: the settings menu (web/ui.js) and the S key call these. Volume moves in steps of 10%.
  var toastEl = null, toastTimer = 0;
  function toast(text) {
    if (!document.body) return;
    if (!toastEl) { toastEl = document.createElement("div"); toastEl.id = "ambToast"; document.body.appendChild(toastEl); }
    toastEl.textContent = text; toastEl.classList.add("on");
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { toastEl.classList.remove("on"); }, 1600);
  }
  function label() { return cfg.mute || cfg.vol === 0 ? "Sound off" : "Sound " + Math.round(cfg.vol * 100) + "%"; }
  function setVol(v) { cfg.vol = Math.max(0, Math.min(1, Math.round(v * 10) / 10)); save(); update(); }
  function louder() { if (cfg.mute) cfg.mute = false; setVol(cfg.vol + 0.1); }
  function quieter() { setVol(cfg.vol - 0.1); }
  function toggleMute() { cfg.mute = !cfg.mute; if (!cfg.mute && cfg.vol === 0) cfg.vol = 0.5; save(); update(); }

  // S mutes and unmutes from anywhere (not while typing, not with a modifier key, not over an open panel)
  document.addEventListener("keydown", function (ev) {
    if ((ev.key !== "s" && ev.key !== "S") || ev.ctrlKey || ev.metaKey || ev.altKey || ev.repeat) return;
    var t = ev.target, tag = t && t.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (t && t.isContentEditable)) return;
    if (document.querySelector("dialog[open]")) return;
    toggleMute(); toast(label());
  });

  function start() {
    findBase();
    setInterval(update, 1000);
    setInterval(tick, 100);
    document.addEventListener("visibilitychange", update);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
  window.Ambience = { available: function () { return FILES.length > 0; }, state: function () { return { vol: cfg.vol, mute: cfg.mute, text: label() }; }, louder: louder, quieter: quieter, toggleMute: toggleMute, update: update, targets: function () { return window.stats ? targets(window.stats) : {}; }, place: function () { return window.stats ? place(window.stats) : null; }, layers: layers, config: cfg };
})();
