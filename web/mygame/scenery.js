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
    port_valen: "port_valen_river_gate", // the overworld node is the River Gate approach, not the quays
    silt_conduits: "sewer",       // the Silt-Gate channels
    compound: "carrion_compound", // the Carrion compound, where the story starts
    harbor: "city_harbour",
    upper_wharves: "civic_heights",   // the Patrician Quarter: a stand-in (the stately civic square) until it has a picture of its own: Upper_Wharves_Day.png / _Night.png replaces it
    tavern: "generic_tavern_inn"
  };

  // scenes (the file under scenes/, as the engine reports it in stats.sceneName) that are a kind of place of their own
  var SCENE_PLACES = {
    "alderford/drowned_oar": "tavern",
    "timbermouth/split_pine_inn": "generic_town_inn",
    "alderford/wagon_lot": "village_stable_yard",
    "timbermouth/wagon_lot": "village_stable_yard",
    "alderford/redvein/red_lantern": "generic_village_inn",
    "alderford/whitefold/white_ram": "generic_village_inn",
    "port_valen/brinewick/reedhouse": "generic_village_inn",
    "port_valen/marlcross/wayfarers_rest": "generic_village_inn",
    "alderford/whitefold/fleecefold": "whitefold_fleecefold",
    "timbermouth/ashrun_holt/longhouse": "ashrun_holt_longhouse",
    "timbermouth/ashrun_holt/ashrun_holt": "ashrun_holt_clearing",
    "timbermouth/ashrun_holt/hide_yard": "ashrun_holt_hide_yard",
    "timbermouth/ashrun_holt/work_yards": "ashrun_holt_work_yards",
    "timbermouth/ashrun_holt/ashrun_house": "generic_village_inn",
    "port_valen/brinewick/tide_house": "brinewick_tide_house",
    "alderford/factors_hall": "shared_factors_hall",
    "timbermouth/factors_hall": "shared_factors_hall",
    "alderford/redvein/gather_house": "generic_village_gathering_hall",
    "port_valen/marlcross/cross_hall": "generic_village_gathering_hall",
    "timbermouth/barleycross/barleycross": "village_green",
    "timbermouth/barleycross/green": "generic_village_gathering_hall",
    "timbermouth/barleycross/lane": "village_green",
    "timbermouth/barleycross/pasture": "generic_village_pasture",
    "alderford/timber_smithy": "generic_workshop_smithy",
    "timbermouth/market": "town_market",
    "alderford/lower_wharf_market": "town_market",
    "alderford/talia_loft": "talia_loft",
    "alderford/janna_alcove": "janna_hearth_alcove",
    "port_valen/radiant/hall_pests": "generic_domestic_cellar",
    "prologue/battle_black_sinks": "siege"
  };

  function slug(v) { return String(v || "").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, ""); }

  // the rules, tried in order; each gets the stats and returns the name of where the player is, or nothing
  function tile(s) { var O = window.Overworld; return s.ow_on && O && O.nodes ? O.nodes[s.ow_pos] : null; }
  var RULES = [
    function (s) { return s.sceneName === "combat" && s.scenery_combat_place ? s.scenery_combat_place : undefined; }, // a temporary combat scene keeps the location it was entered from
    function (s) { return s.sceneName === "prologue/battle_black_sinks" && s.scenery_subplace === "black_sinks_causeway_before" ? "black_sinks_causeway_before" : undefined; }, // the ruined causeway during the prologue assault
    function (s) { return s.sceneName === "prologue/battle_black_sinks" && s.scenery_subplace === "black_sinks_bivouac" ? "black_sinks_captured_gatehouse_bivouac" : undefined; }, // the company holds the captured gatehouse overnight
    function (s) { return s.sceneName === "prologue/alderford" && s.scenery_subplace === "prologue_talia_loft" ? "talia_loft" : undefined; }, // Talia's private curing-loft home
    function (s) { return s.sceneName === "prologue/alderford" && s.scenery_subplace === "prologue_janna_alcove" ? "janna_hearth_alcove" : undefined; }, // Janna's private hearth alcove behind the smithy
    function (s) { return s.ow_on && s.ow_pos === "bs" ? "black_sinks_gilded_scales_toll_fort" : undefined; }, // repaired Gilded Scales toll fort, reached only after the prologue
    function (s) { return s.sceneName === "overworld/camp" && s.has_camp_kit ? "generic_camp_tent_interior" : undefined; }, // the player-owned solo tent, never a company bivouac
    function (s) { return s.sceneName === "timbermouth/workshops" && s.shop_open === "works" ? "generic_workshop_smithy" : undefined; }, // Roan's enclosed trade bench; the lane remains Timbermouth
    function (s) { return s.shop_open === "halda" ? "generic_workshop_smithy" : undefined; }, // Halda trades from a working forge, not a goods shop
    function (s) { return s.sceneName === "port_valen/port_valen_upper_wharves" && s.scenery_subplace === "patrician_inner_gate" ? "patrician_inner_gate" : undefined; }, // the Patrician Quarter's writ gate
    function (s) { return s.sceneName === "port_valen/port_valen_upper_wharves" && s.scenery_subplace === "patrician_avenue" ? "patrician_avenue" : undefined; }, // Avenue of Estates, including its great-house stretch
    function (s) { return s.sceneName === "port_valen/port_valen_upper_wharves" && s.scenery_subplace === "patrician_terrace_walk" ? "patrician_terrace_walk" : undefined; }, // ridge promenade above the city
    function (s) { return s.sceneName === "port_valen/port_valen_upper_wharves" && s.scenery_subplace === "patrician_gilt_needle" ? "patrician_gilt_needle" : undefined; }, // bespoke tailor interior beats the generic shop counter
    function (s) { return s.sceneName === "port_valen/port_valen" && s.scenery_subplace === "port_valen_fishmongers_slip" ? "port_valen_fishmongers_slip" : undefined; }, // western fish landing, stalls, smokehouses and net loft
    function (s) { return s.sceneName === "port_valen/port_valen" && s.scenery_subplace === "port_valen_iron_wharves" ? "port_valen_iron_wharves" : undefined; }, // shipyard ways and Brant's working slip
    function (s) { return s.sceneName === "port_valen/port_valen" && s.scenery_subplace === "port_valen_wreck_bell_pier" ? "port_valen_wreck_bell_pier" : undefined; }, // exposed breakwater and wreck bell
    function (s) { return s.sceneName === "port_valen/port_valen" && s.scenery_subplace === "port_valen_weigh_house" ? "port_valen_weigh_house" : undefined; }, // civic cargo-scale hall
    function (s) { return s.sceneName === "prologue/company_intake" && s.scenery_subplace === "prologue_carrion_compound" ? "carrion_compound" : undefined; }, // Iron Carrion intake and munitions camp
    function (s) { return s.sceneName === "prologue/company_intake" && s.scenery_subplace === "prologue_flashback_village" ? "village_green" : undefined; }, // Ashbrook memory
    function (s) { return s.sceneName === "prologue/company_intake" && s.scenery_subplace === "prologue_flashback_dredge" ? "dredge_end" : undefined; }, // Dredge-End memory
    function (s) { return s.sceneName === "prologue/camp_night" || s.sceneName === "prologue/dawn_trial" ? "carrion_compound" : undefined; }, // company bivouac and dawn trials
    function (s) { return s.sceneName === "prologue/alderford" && s.scenery_subplace === "prologue_alderford_riverfront" ? "alderford" : undefined; }, // prologue Alderford hub and morning muster
    function (s) { return s.sceneName === "prologue/alderford" && s.scenery_subplace === "prologue_curing_sheds" ? "generic_curing_shed" : undefined; }, // Alderford fish-curing shed
    function (s) { return s.sceneName === "prologue/alderford" && s.scenery_subplace === "prologue_cadre_pavilion" ? "carrion_compound" : undefined; }, // Carrion's riverside medical marquee
    function (s) { return s.sceneName === "prologue/alderford" && s.scenery_subplace === "prologue_smithy" ? "generic_workshop_smithy" : undefined; }, // Torvald's waterwheel forge
    function (s) { return s.sceneName === "prologue/alderford" && s.scenery_subplace === "prologue_taphouse" ? "generic_tavern_inn" : undefined; }, // Drowned Oar taproom
    function (s) { return s.sceneName === "prologue/alderford" && s.scenery_subplace === "prologue_counting_house" ? "shared_factors_hall" : undefined; }, // Morzan's factors' hall, not a retail counter
    function (s) { return s.sceneName === "prologue/alderford" && s.scenery_subplace === "prologue_granary" ? "town_warehouse_loft" : undefined; }, // Upper Weir grain store
    function (s) { return s.sceneName === "prologue/alderford" && s.scenery_subplace === "prologue_chapel" ? "saint_althea_chapel" : undefined; }, // Alderford parish chapel
    function (s) { return s.sceneName === "prologue/alderford" && s.scenery_subplace === "prologue_granary_undercroft" ? "generic_warehouse_undercroft" : undefined; }, // flooded warehouse foundation below the Upper Weir Granary
    function (s) { return s.sceneName === "prologue/alderford" && s.scenery_subplace === "prologue_sewer" ? "sewer" : undefined; }, // culvert and grain undercroft
    function (s) { return s.sceneName === "timbermouth/ashrun_holt/longhouse" && s.scenery_subplace === "ashrun_holt_old_ash" ? "ashrun_holt_clearing" : undefined; }, // stepping outside to the ribboned Old Ash
    function (s) { return s.sceneName === "timbermouth/ashrun_holt/ashrun_house" && s.scenery_subplace === "ashrun_holt_inn_room" ? "generic_village_inn_room" : undefined; }, // a plain hired room above the Ashrun House
    function (s) { return s.sceneName === "timbermouth/barleycross/lane" && s.scenery_subplace === "barleycross_hayloft" ? "generic_farm_hayloft" : undefined; }, // paid loft above a Barleycross farmstead
    function (s) { return s.sceneName === "port_valen/radiant/notice_board" && s.cr_origin === "tm" ? "shared_factors_hall" : undefined; }, // Timbermouth's board is inside its Factor's Hall
    function (s) { return s.sceneName === "port_valen/radiant/notice_board" && s.cr_origin === "fv" ? "generic_village_gathering_hall" : undefined; }, // Barleycross's board is inside its village hall
    function (s) { return s.sceneName === "horse_dealer" && s.horse_place === "bc" ? "generic_village_pasture" : undefined; }, // Barleycross's working-horse rail stands at the common pasture
    function (s) { return s.sceneName === "horse_dealer" && s.horse_place === "mw" ? "village_stable_yard" : undefined; }, // Port Valen's dealer works from the Middle Ward yard
    function (s) { return s.shop_open && s.shop_open !== "trapper" ? "generic_trade_shop" : undefined; }, // shop counters in settlements; the forest trapper stays outdoors
    function (s) { return s.sceneName === "port_valen/port_valen_middle_ward" && s.scenery_subplace === "middle_ward_inn_room" ? "generic_town_inn_room" : undefined; }, // Wagoner's Rest guest room and Kess's rented chamber
    function (s) { return s.sceneName === "timbermouth/split_pine_inn" && s.scenery_subplace === "town_inn_room" ? "generic_town_inn_room" : undefined; }, // Split Pine guest room
    function (s) { return s.scenery_subplace === "village_inn_room" && (s.sceneName === "alderford/drowned_oar" || s.sceneName === "alderford/redvein/red_lantern" || s.sceneName === "alderford/whitefold/white_ram" || s.sceneName === "port_valen/brinewick/reedhouse" || s.sceneName === "port_valen/marlcross/wayfarers_rest") ? "generic_village_inn_room" : undefined; }, // village inns and Maura's Drowned Oar rooms
    function (s) { return s.sceneName === "port_valen/port_valen_middle_ward" && s.scenery_subplace === "middle_ward_lodgings" ? "generic_quiet_lodgings" : undefined; }, // Terrace Lodgings' ground-floor entry hall
    function (s) { return s.sceneName === "port_valen/port_valen_middle_ward" && s.scenery_subplace === "middle_ward_tavern" ? "generic_town_inn" : undefined; }, // the Wagoner's Rest hall and rooms
    function (s) { return s.sceneName === "port_valen/port_valen_middle_ward" && s.scenery_subplace === "middle_ward_bakehouse" ? "middle_ward_bakehouse" : undefined; }, // Mother Marda's communal bakehouse
    function (s) { return s.sceneName === "port_valen/port_valen_middle_ward" && s.scenery_subplace === "middle_ward_bathhouse" ? "middle_ward_bathhouse" : undefined; }, // Conduit Baths' tub room
    function (s) { return s.sceneName === "alderford/chapel" ? "saint_althea_chapel" : undefined; }, // Saint Althea's working parish chapel above the weir
    function (s) { return s.sceneName === "port_valen/port_valen_middle_ward" && s.scenery_subplace === "middle_ward_city_street" ? "generic_city_street" : undefined; }, // Trunk Road and Lantern Lane; Conduit Square remains the district view
    function (s) { return s.sceneName === "port_valen/port_valen_dredge_end" && s.scenery_subplace === "dredge_duckboard_market" ? "dredge_duckboard_market" : undefined; }, // market lane and stalls
    function (s) { return s.sceneName === "port_valen/port_valen_dredge_end" && s.scenery_subplace === "dredge_upper_gangways" ? "dredge_upper_gangways" : undefined; }, // elevated tenant walkways
    function (s) { return s.sceneName === "port_valen/port_valen_dredge_end" && s.scenery_subplace === "dredge_boat_sheds" ? "dredge_boat_sheds" : undefined; }, // boatwrights' work-bank and scrap yard
    function (s) { return s.sceneName === "port_valen/port_valen_dredge_end" && s.scenery_subplace === "dredge_lamp_stair" ? "dredge_lamp_stair" : undefined; }, // seawall terrace and its doors
    function (s) { return s.sceneName === "port_valen/port_valen_dredge_end" && s.scenery_subplace === "dredge_flooded_lower_steps" ? "dredge_flooded_lower_steps" : undefined; }, // canal stair and cellar vaults
    function (s) { return s.sceneName === "port_valen/port_valen_dredge_end" && s.scenery_subplace === "dredge_corve_parlor" ? "dredge_corve_parlor" : undefined; }, // Widow Corve's public parlor
    function (s) { return s.sceneName === "port_valen/port_valen_dredge_end" && s.scenery_subplace === "dredge_corve_private_chamber" ? "dredge_corve_private_chamber" : undefined; }, // Widow Corve's private room
    function (s) { return s.sceneName === "port_valen/port_valen_civic_heights" && s.scenery_subplace === "civic_council_hall" ? "civic_council_hall" : undefined; }, // Council Hall concourse
    function (s) { return s.sceneName === "port_valen/port_valen_civic_heights" && s.scenery_subplace === "civic_hiring_hall" ? "civic_hiring_hall" : undefined; }, // Hiring Hall
    function (s) { return s.sceneName === "port_valen/port_valen_civic_heights" && s.scenery_subplace === "civic_gilded_scales" ? "civic_gilded_scales" : undefined; }, // Gilded Scales Head House
    function (s) { return s.sceneName === "port_valen/port_valen_civic_heights" && s.scenery_subplace === "civic_port_watch" ? "civic_port_watch" : undefined; }, // Port Watch headquarters yard
    function (s) { return s.sceneName === "port_valen/port_valen_civic_heights" && s.scenery_subplace === "civic_cathedral_exterior" ? "civic_cathedral_exterior" : undefined; }, // cathedral steps and doors
    function (s) { return s.sceneName === "port_valen/port_valen_civic_heights" && s.scenery_subplace === "civic_cathedral_nave" ? "civic_cathedral_nave" : undefined; }, // cathedral's main hall
    function (s) { return s.sceneName === "port_valen/port_valen_civic_heights" && s.scenery_subplace === "civic_saint_althea_chapel" ? "civic_saint_althea_chapel" : undefined; }, // Saint Althea's side chapel
    function (s) { return s.sceneName === "port_valen/port_valen_civic_heights" && s.scenery_subplace === "civic_tax_windows" ? "civic_tax_windows" : undefined; }, // Council Hall tax windows
    function (s) { return s.sceneName === "port_valen/port_valen_civic_heights" && s.scenery_subplace === "civic_magistrates_court" ? "civic_magistrates_court" : undefined; }, // Magistrates' Court
    function (s) { return s.sceneName === "port_valen/port_valen_civic_heights" && s.scenery_subplace === "civic_council_gallery" ? "civic_council_gallery" : undefined; }, // Council's public gallery
    function (s) { return s.sceneName === "timbermouth/workshops" ? "generic_town_street" : undefined; }, // the outdoor workshops lane
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
