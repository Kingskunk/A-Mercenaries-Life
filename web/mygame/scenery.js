/*
 * SCENERY -- the page's backdrop follows where the player is and what time and weather it is there (a test that grew, 2026-10-14).
 *
 * Reads only the game's own state (window.stats), the same way the sidebar does, so no scene has to know it exists:
 *   where     placeNames(): the names the rules below give for where the player is (a scene, a shop, a dungeon, an overworld tile, a Port Valen district), most specific first
 *   the hour  clock_hour + clock_minute  ->  how much of the DAY picture shows over the NIGHT one (the two pictures are the same view, so blending them reads as the light changing)
 *   weather   weather_wet / weather_visibility / weather (Overcast): a greyer, dimmer picture and a haze. No rain or snow is drawn (judged not worth the cost, 2026-10-15); the sound carries it. dg_dark dims a dungeon with no light.
 *
 * TO ADD A PLACE: put <Name>_Day.png and <Name>_Night.png (the same view) in /Wallpaper and run  node tools/gen_ui_art.js  then  node compile.js.  The key is the name in lower case with
 * underscores ("Silt Conduits_Day.png" -> silt_conduits). A picture with no partner (an interior, the same at every hour) is a SINGLE: one file, darkened at night by the page.
 * A key with no pictures is ignored, so the rules below can name places that do not exist yet. To make a place wear a picture it does not match by name, add one line to ALIAS
 * (a place name -> a picture key). To name a new kind of place, add it to SCENE_PLACES (by scene file) or to RULES.
 * The pictures are FILES in /scenery (not inside the html, so the page stays small however many places there are): scenery-data.js lists which keys exist, the folder is found at run time
 * (beside play_game.html, or two levels above web/mygame/index.html), and a place's pictures are loaded the first time the player is there.
 *
 * The backdrop sits behind everything (z-index -2); html.hasScenery lets the story panel show through it a little (scenery.css). Turn it off with localStorage "scenery" = "off".
 * web/mygame/ambience.js uses placeNames() too, to choose the sound.
 */
(function () {
  "use strict";
  var root = document.documentElement, el = null, last = "", off = false, stages = null, cur = -1, curKey = null, goneTimer = [0, 0];
  var FADE_MS = 1300;   // matches the stage's CSS transition in scenery.css, plus a little
  try { off = window.localStorage.getItem("scenery") === "off"; } catch (e) { off = false; }

  // a place name that should wear another key's picture: name -> key (a name that is already a picture key needs no line)
  var ALIAS = {
    longshade_forest: "forest",   // the Longshade Forest dungeon
    woodroad: "overworld_forest_road", // an overworld tile of wooded road
    the_river_road: "overworld_hilly_road", // temporary shared open-road view, until a flat-road backdrop exists
    the_high_grey_road: "overworld_hilly_road",
    marlcross: "village_green",
    barleycross: "village_green",
    ashrun_holt: "village_green",
    port_valen: "city_harbour",
    silt_conduits: "sewer",       // the Silt-Gate channels
    compound: "carrion_compound", // the Carrion compound, where the story starts
    harbor: "city_harbour",
    upper_wharves: "civic_heights",   // the Patrician Quarter: a stand-in (the stately civic square) until it has a picture of its own: Upper_Wharves_Day.png / _Night.png replaces it
    tavern: "generic_tavern_inn"
  };

  // scenes (the file under scenes/, as the engine reports it in stats.sceneName) that are a kind of place of their own
  var SCENE_PLACES = {
    "alderford/drowned_oar": "tavern",
    "timbermouth/split_pine_inn": "tavern",
    "alderford/redvein/red_lantern": "tavern",
    "alderford/whitefold/white_ram": "tavern",
    "port_valen/brinewick/reedhouse": "tavern",
    "alderford/whitefold/fleecefold": "whitefold_fleecefold",
    "timbermouth/ashrun_holt/longhouse": "ashrun_holt_longhouse",
    "port_valen/brinewick/tide_house": "brinewick_tide_house",
    "alderford/factors_hall": "shared_factors_hall",
    "timbermouth/factors_hall": "shared_factors_hall",
    "alderford/redvein/gather_house": "generic_village_gathering_hall",
    "port_valen/marlcross/cross_hall": "generic_village_gathering_hall",
    "alderford/timber_smithy": "generic_workshop_smithy",
    "timbermouth/market": "town_market",
    "alderford/lower_wharf_market": "town_market",
    "alderford/talia_loft": "town_warehouse_loft",
    "prologue/battle_black_sinks": "siege"
  };

  function slug(v) { return String(v || "").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, ""); }

  // the rules, tried in order; each gets the stats and returns the name of where the player is, or nothing
  function tile(s) { var O = window.Overworld; return s.ow_on && O && O.nodes ? O.nodes[s.ow_pos] : null; }
  var RULES = [
    function (s) { return s.sceneName === "overworld/camp" && s.has_camp_kit ? "generic_camp_tent_interior" : undefined; }, // the player-owned solo tent, never a company bivouac
    function (s) { return s.sceneName === "timbermouth/workshops" && s.shop_open === "works" ? "generic_workshop_smithy" : undefined; }, // Roan's enclosed trade bench; the lane remains Timbermouth
    function (s) { return s.shop_open === "halda" ? "generic_workshop_smithy" : undefined; }, // Halda trades from a working forge, not a goods shop
    function (s) { return s.shop_open && s.shop_open !== "trapper" ? "generic_trade_shop" : undefined; }, // shop counters in settlements; the forest trapper stays outdoors
    function (s) { return SCENE_PLACES[s.sceneName]; },                                                // a scene that is a place of its own: an inn, the battle
    function (s) { if (s.shop_open) return "shop"; },                                                  // at a shop's counter
    function (s) { if (s.dg_in_run && s.dg_table && s.dg_table !== "none") return s.dg_table; },       // inside a dungeon: which one
    function (s) { var n = tile(s); return n ? n.name : undefined; },                                  // on the overworld: the tile's name,
    function (s) { var n = tile(s); return n && n.kind === "road" && n.also === "hills" ? "overworld_hilly_road" : undefined; }, // a road through hilly ground
    function (s) { var n = tile(s); return n ? n.kind : undefined; },                                  //   then its kind of ground
    function (s) {                                                                                     // a Port Valen district, but only once the story is in the world:
      // current_district starts at "compound" and is only a remembered default before then, so the title screen, character creation, the prologue and the Developer menu have no district
      var sn = s.sceneName;
      if (!sn || /^(startup|dev_hub|death|prologue\/)/.test(sn)) return;
      return s.current_district;
    }
  ];

  // every place name the rules give for where the player is, most specific first (the sound chooses from the same list)
  // A scene that is a place of its own (an inn, the battle) and a dungeon run stand alone: they never fall through to the district the player last stood in, which is only a stale
  // default there (the Silt-Gate channels are not the compound). A shop and the overworld do fall through to what is around them.
  function placeNames(s) {
    // Developer screens are outside the fiction. Test state deliberately leaves useful world flags behind, so this
    // has to run before EVERY location rule, not merely before the final district fallback below. Combat tests
    // enter combat.txt with *gosub_scene, so they need the same exemption without muting real story combat.
    var sn = String(s.sceneName || "");
    if (/^dev_hub(?:\/|$)/.test(sn) || (sn === "combat" && /^fight_/.test(String(s.dctest_label || "")))) return [];
    var out = [], alone = SCENE_PLACES[s.sceneName] ? 1 : (s.dg_in_run && s.dg_table && s.dg_table !== "none" ? 3 : 0);
    for (var i = 0; i < RULES.length; i++) {
      var name = slug(RULES[i](s)); if (name && out.indexOf(name) < 0) out.push(name);
      if (alone && out.length && i + 1 >= alone) break;
    }
    return out;
  }

  var BASES = ["scenery/", "../../scenery/", "../scenery/"];   // where the folder may be, relative to the page
  var base = null, probing = false, loading = {}, loaded = {};

  function have() { return window.SCENERY_ART || {}; }

  // find the folder by trying to load one known picture from each place it could be
  function findBase() {
    var keys = Object.keys(have());
    if (base || probing || !keys.length) return;
    probing = true;
    var i = 0, k = keys[0], file = k + (have()[k] === "pair" ? "_night" : "") + ".webp";
    (function next() {
      if (i >= BASES.length) { probing = false; return; }
      var b = BASES[i++], img = new Image();
      img.onload = function () { base = b; probing = false; update(); };
      img.onerror = next;
      img.src = b + file;
    })();
  }

  // an absolute address (a relative one inside a custom property would resolve against the stylesheet, not the page)
  function urlOf(key, part) {
    var name = have()[key] === "single" ? key : key + "_" + part;
    var v = (window.SCENERY_V || {})[key];   // a version stamp, so a changed picture is not shown from the browser's cache
    return new URL(base + name + ".webp" + (v ? "?v=" + v : ""), document.baseURI).href;
  }

  // load a place's pictures once; it counts as ready only when all are in, so the backdrop never shows half a pair
  function load(key) {
    if (loaded[key] || loading[key]) return;
    loading[key] = true;
    var parts = have()[key] === "single" ? ["day"] : ["day", "night"], left = parts.length;
    parts.forEach(function (part) {
      var img = new Image();
      img.onload = img.onerror = function () { if (!--left) { loaded[key] = true; loading[key] = false; update(); } };
      img.src = urlOf(key, part);
    });
  }

  // the first place name (or its alias) that has pictures wins. Returns "" while the folder is found and that place's pictures load (the backdrop stays as it was), and null for a place with no picture.
  function sceneKey(s) {
    var names = placeNames(s), H = have();
    for (var i = 0; i < names.length; i++) {
      var key = H[names[i]] ? names[i] : (ALIAS[names[i]] || names[i]);   // a picture named for the place itself beats an alias
      if (!H[key]) continue;
      if (!base) { findBase(); return ""; }          // "" = a place with a picture whose files are still loading: keep showing what is there
      if (!loaded[key]) { load(key); return ""; }
      return key;
    }
    return null;
  }

  function build() {
    el = document.createElement("div");
    el.id = "scenery"; el.setAttribute("aria-hidden", "true");
    // Two stages, each a night layer and a day layer. A background image cannot fade, so a change of place brings the OTHER stage in (with the new place's pictures) over the old one, and the old one
    // goes when the new is fully in. The glow, haze and dim are shared on top.
    var stage = '<div class="sc-stage"><div class="sc-layer sc-night"></div><div class="sc-layer sc-day"></div></div>';
    el.innerHTML = stage + stage + '<div class="sc-glow"></div><div class="sc-haze"></div><div class="sc-dim"></div>';
    stages = el.querySelectorAll(".sc-stage");
    document.body.insertBefore(el, document.body.firstChild);
  }

  function smooth(a, b, x) { var t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); }

  // how much of the day picture shows: 0 at night, 1 by day, rising through the dawn and falling through the dusk
  function daylight(h) { return Math.min(smooth(5, 7.5, h), 1 - smooth(17.5, 20.5, h)); }

  function update() {
    var s = window.stats; if (!s || off || !document.body) { root.classList.remove("hasScenery"); return; }
    var key = sceneKey(s);
    if (key === "") return;                                              // still loading: no change yet
    if (!key) { root.classList.remove("hasScenery"); curKey = null; return; }
    if (!el) build();
    var single = have()[key] === "single";
    var h = (Number(s.clock_hour) || 0) + (Number(s.clock_minute) || 0) / 60;
    var day = daylight(h);
    var wet = !!s.weather_wet, poor = s.weather_visibility === "poor", storm = Number(s.weather_severity) >= 3, over = s.weather === "Overcast";
    var dark = !!(s.dg_in_run && s.dg_dark);
    var shared = {
      "--sc-glow": single ? "0" : (0.55 * Math.sin(Math.PI * Math.max(0.001, Math.min(0.999, day)))).toFixed(3),   // the dawn and dusk warmth, strongest half way
      "--sc-sat": (wet || over || poor ? 0.7 : 1).toFixed(2),
      "--sc-bright": (storm ? 0.62 : wet ? 0.78 : over ? 0.85 : 1).toFixed(2),
      "--sc-haze": poor && !storm ? "0.55" : (over ? "0.15" : "0"),
      "--sc-dim": dark ? "0.55" : (single ? (0.5 * (1 - day)).toFixed(2) : "0")   // a single picture is darkened at night instead of swapped
    };
    var mine = {
      "--sc-img-day": 'url("' + urlOf(key, "day") + '")',
      "--sc-img-night": 'url("' + urlOf(key, "night") + '")',
      "--sc-day": single ? "1" : day.toFixed(3)
    };
    var sig = key + JSON.stringify(shared) + JSON.stringify(mine);
    if (sig === last) return; last = sig;
    var k;
    for (k in shared) if (shared.hasOwnProperty(k)) el.style.setProperty(k, shared[k]);
    function paint(st) { for (var n in mine) if (mine.hasOwnProperty(n)) st.style.setProperty(n, mine[n]); }
    if (key !== curKey) {
      var next = cur === 0 ? 1 : 0;
      if (curKey === null) { stages[0].classList.remove("on", "top"); stages[1].classList.remove("on", "top"); next = 0; }   // from nothing: the whole backdrop is fading in itself
      clearTimeout(goneTimer[next]);
      paint(stages[next]); stages[next].setAttribute("data-scene", key);
      stages[next].classList.add("on", "top");                                    // the new place fades in over the old one...
      if (cur >= 0 && curKey !== null) {
        var old = cur; stages[old].classList.remove("top");
        goneTimer[old] = setTimeout(function () { stages[old].classList.remove("on"); }, FADE_MS);   // ...and the old one leaves once the new is in
      }
      cur = next; curKey = key;
    } else paint(stages[cur]);                                                      // the same place: only the day-and-night blend moves
    root.classList.add("hasScenery");
  }

  function start() { update(); setInterval(update, 1000); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
  window.Scenery = { update: update, daylight: daylight, placeNames: placeNames, key: function () { return window.stats ? sceneKey(window.stats) : null; }, setOff: function (b) { off = !!b; try { window.localStorage.setItem("scenery", b ? "off" : "on"); } catch (e) {} update(); } };
})();
