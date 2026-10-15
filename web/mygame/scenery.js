/*
 * SCENERY -- the page's backdrop follows where the player is and what time and weather it is there (a test that grew, 2026-10-14).
 *
 * Reads only the game's own state (window.stats), the same way the sidebar does, so no scene has to know it exists:
 *   where     a place key chosen by the rules below (a dungeon, an overworld terrain, a Port Valen district)
 *   the hour  clock_hour + clock_minute  ->  how much of the DAY picture shows over the NIGHT one (the two pictures are the same view, so blending them reads as the light changing)
 *   weather   weather_wet / weather_cold / weather_visibility / weather (Overcast), and dg_dark for a dungeon with no light.
 *
 * TO ADD A PLACE: put <Name>_Day.png and <Name>_Night.png (the same view) in /Wallpaper and run  node tools/gen_ui_art.js  then  node compile.js.  The key is the name in lower case with
 * underscores ("Silt Conduits_Day.png" -> silt_conduits). A key with no pictures is ignored, so the rules below can name keys that do not exist yet.
 * The pictures are FILES in /scenery (not inside the html, so the page stays small however many places there are): scenery-data.js lists which keys exist, the folder is found at run time
 * (beside play_game.html, or two levels above web/mygame/index.html), and a place's pair is loaded the first time the player is there. To make a place use a picture it does not
 * match by name, add one line to ALIAS. To scene a new kind of place, add a rule to RULES (it returns a key, or nothing to pass).
 *
 * The backdrop sits behind everything (z-index -2); html.hasScenery lets the story panel show through it a little (scenery.css). Turn it off with localStorage "scenery" = "off".
 */
(function () {
  "use strict";
  var root = document.documentElement, el = null, last = "", off = false;
  try { off = window.localStorage.getItem("scenery") === "off"; } catch (e) { off = false; }

  // a dungeon, overworld terrain or district that should wear another key's picture: name -> key
  var ALIAS = {
    longshade_forest: "forest",   // the Longshade Forest dungeon
    woodroad: "forest"            // an overworld tile of wooded road
  };

  // the rules, tried in order; each gets the stats and returns the name of where the player is, or nothing
  var RULES = [
    function (s) { if (s.dg_in_run && s.dg_table && s.dg_table !== "none") return s.dg_table; },                                  // inside a dungeon: which one
    function (s) {                                                                                                                  // on the overworld: the terrain of the tile
      var O = window.Overworld, n = s.ow_on && O && O.nodes ? O.nodes[s.ow_pos] : null;
      return n ? n.kind : undefined;
    },
    function (s) { if (s.current_district) return s.current_district; }                                                            // a Port Valen district
  ];

  var BASES = ["scenery/", "../../scenery/", "../scenery/"];   // where the folder may be, relative to the page
  var base = null, probing = false, loading = {}, loaded = {};

  // find the folder by trying to load one known picture from each place it could be
  function findBase() {
    var keys = window.SCENERY_ART || [];
    if (base || probing || !keys.length) return;
    probing = true;
    var i = 0, file = keys[0] + "_night.webp";
    (function next() {
      if (i >= BASES.length) { probing = false; return; }
      var b = BASES[i++], img = new Image();
      img.onload = function () { base = b; probing = false; update(); };
      img.onerror = next;
      img.src = b + file;
    })();
  }

  // an absolute address (a relative one inside a custom property would resolve against the stylesheet, not the page)
  function urlOf(key, part) { return new URL(base + key + "_" + part + ".webp", document.baseURI).href; }

  // load a place's pair once; it counts as ready only when both are in, so the backdrop never shows half a pair
  function load(key) {
    if (loaded[key] || loading[key]) return;
    loading[key] = true;
    var left = 2;
    ["day", "night"].forEach(function (part) {
      var img = new Image();
      img.onload = img.onerror = function () { if (!--left) { loaded[key] = true; loading[key] = false; update(); } };
      img.src = urlOf(key, part);
    });
  }

  function slug(v) { return String(v || "").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, ""); }

  // every place name the rules give for where the player is, in rule order, with its alias applied (the sound uses this too: web/mygame/ambience.js)
  function placeKeys(s) {
    var out = [];
    for (var i = 0; i < RULES.length; i++) { var name = slug(RULES[i](s)); if (name) out.push(ALIAS[name] || name); }
    return out;
  }

  // the first rule whose name (or its alias) has a picture pair wins; null until the folder is found and that pair is loaded
  function sceneKey(s) {
    var have = window.SCENERY_ART || [];
    for (var i = 0; i < RULES.length; i++) {
      var name = slug(RULES[i](s)); if (!name) continue;
      var key = ALIAS[name] || name;
      if (have.indexOf(key) < 0) continue;
      if (!base) { findBase(); return null; }
      if (!loaded[key]) { load(key); return null; }
      return key;
    }
    return null;
  }

  function build() {
    el = document.createElement("div");
    el.id = "scenery"; el.setAttribute("aria-hidden", "true");
    el.innerHTML = '<div class="sc-layer sc-night"></div><div class="sc-layer sc-day"></div><div class="sc-glow"></div><div class="sc-haze"></div><div class="sc-rain"></div><div class="sc-snow"></div><div class="sc-dim"></div>';
    document.body.insertBefore(el, document.body.firstChild);
  }

  function smooth(a, b, x) { var t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); }

  // how much of the day picture shows: 0 at night, 1 by day, rising through the dawn and falling through the dusk
  function daylight(h) { return Math.min(smooth(5, 7.5, h), 1 - smooth(17.5, 20.5, h)); }

  function update() {
    var s = window.stats; if (!s || off || !document.body) { root.classList.remove("hasScenery"); return; }
    var key = sceneKey(s);
    if (!key) { root.classList.remove("hasScenery"); return; }
    if (!el) build();
    var h = (Number(s.clock_hour) || 0) + (Number(s.clock_minute) || 0) / 60;
    var day = daylight(h);
    var wet = !!s.weather_wet, cold = !!s.weather_cold && !wet, poor = s.weather_visibility === "poor", storm = Number(s.weather_severity) >= 3, over = s.weather === "Overcast";
    var dark = !!(s.dg_in_run && s.dg_dark);
    var v = {
      "--sc-img-day": 'url("' + urlOf(key, "day") + '")',
      "--sc-img-night": 'url("' + urlOf(key, "night") + '")',
      "--sc-day": day.toFixed(3),
      "--sc-glow": (0.55 * Math.sin(Math.PI * Math.max(0.001, Math.min(0.999, day)))).toFixed(3),   // the dawn and dusk warmth, strongest half way
      "--sc-sat": (wet || over || poor ? 0.7 : 1).toFixed(2),
      "--sc-bright": (storm ? 0.62 : wet ? 0.78 : over ? 0.85 : 1).toFixed(2),
      "--sc-haze": poor && !storm ? "0.55" : (over ? "0.15" : "0"),
      "--sc-rain": wet ? (storm ? "0.75" : "0.45") : "0",
      "--sc-snow": cold ? "0.7" : "0",
      "--sc-dim": dark ? "0.55" : "0"
    };
    var sig = key + JSON.stringify(v);
    if (sig === last) return; last = sig;
    el.setAttribute("data-scene", key);
    for (var k in v) if (v.hasOwnProperty(k)) el.style.setProperty(k, v[k]);
    root.classList.add("hasScenery");
  }

  function start() { update(); setInterval(update, 1000); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
  window.Scenery = { update: update, daylight: daylight, placeKeys: placeKeys, key: function () { return window.stats ? sceneKey(window.stats) : null; }, setOff: function (b) { off = !!b; try { window.localStorage.setItem("scenery", b ? "off" : "on"); } catch (e) {} update(); } };
})();
