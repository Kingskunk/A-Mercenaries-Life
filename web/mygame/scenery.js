/*
 * SCENERY -- the page's backdrop follows where the player is and what time and weather it is there (a test that grew, 2026-10-14).
 *
 * Reads only the game's own state (window.stats), the same way the sidebar does, so no scene has to know it exists. The dossier is an overlay, not a place: while it is open, it keeps the backdrop it inherited from the story beneath it.
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
  var FADE_MS = 320;    // matches the quick stage transition in scenery.css, plus a little
  try { off = window.localStorage.getItem("scenery") === "off"; } catch (e) { off = false; }
  // Diagnostic-only toggle (localStorage "sceneryEffects" = "off"): freezes the glow/haze/dim/saturation/brightness
  // layer at neutral values but leaves the backdrop image and the day/night crossfade alone, to tell apart a
  // flicker caused by the picture/place logic from one caused by the lighting overlay riding on top of it.
  var effectsOff = false;
  try { effectsOff = window.localStorage.getItem("sceneryEffects") === "off"; } catch (e) { effectsOff = false; }

  // a place name that should wear another key's picture: name -> key (a name that is already a picture key needs no line)
  var ALIAS = {
    longshade_forest: "forest",   // the Longshade Forest dungeon
    woodroad: "overworld_forest_road", // an overworld tile of wooded road
    the_river_road: "overworld_hilly_road", // temporary shared open-road view, until a flat-road backdrop exists
    the_high_grey_road: "overworld_hilly_road",
    the_northwest_road: "western_vale_road", // Langston's north-western road crosses the same open grassland (2026-11-02, the user: it was missing the Western Vale road's picture)
    marlcross: "village_green",
    barleycross: "village_green",
    ashrun_holt: "ashrun_holt_clearing", // match the Ashrun Holt overworld tile to its entered clearing
    fallowmere: "fallowmere_pond_green", // Fallowmere overworld tile uses the village pond green view
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
    "overworld/valen_reach_alyndra": "generic_tavern_inn",
    "timbermouth/split_pine_inn": "generic_town_inn",
    "Langston/pickled_hen": "generic_town_inn",
    "Langston/cord_and_kettle": "generic_trade_shop",
    "Langston/market": "town_market",
    "Langston/tomlin_cottage": "tomlin_cottage",
    "Langston/tomlin_shop": "tomlin_herbalist_workroom",
    "Langston/langston_hall": "langston_hall",
    "Langston/barolo/barolo": "barolo",
    "Langston/barolo/village_heads_hall": "barolo_village_heads_hall",
    "Langston/barolo/market": "barolo_market",
    "Langston/barolo/vineyard_roads": "barolo_vineyard_roads",
    "Langston/broadmead/broadmead": "broadmead",
    "Langston/broadmead/crooked_halter": "the_crooked_halter",
    "Langston/broadmead/remount_yard": "remount_yard",
    "Langston/broadmead/village_heads_hall": "broadmead_villageheadhall",
    "Langston/broadmead/longfold_fair": "longfold_fair_sun_pillar",
    "Langston/fallowmere/fallowmere": "fallowmere_pond_green",
    "Langston/fallowmere/grey_gander": "fallowmere_grey_gander",
    "Langston/fallowmere/village_heads_hall": "generic_village_gathering_hall",
    "Langston/fallowmere/market": "fallowmere_market",
    // Only a fallback: the dg_in_run RULES entry above (each dungeon's own rooms) matches first and wins
    // whenever a run is actually under way. This is what shows during the walk-in/out line, before dg_run_begin
    // has set dg_in_run (every entry calls dg_time -- a time advance, which can itself trigger the hub-condition
    // refresh -- before dg_run_begin right after it) and after dg_run_end clears it, instead of the district
    // fallback (longshade/longshade_forest, port_valen_silt_conduits: same *goto_scene-only shape, same gap).
    "longshade/longshade_forest": "longshade_forest",
    "port_valen/port_valen_silt_conduits": "silt_conduits",
    "alderford/wagon_lot": "river_carters_lot",
    "timbermouth/wagon_lot": "timber_wagon_lot",
    "port_valen/radiant/caravan_lot": "vale_gate_wagon_lot",
    "alderford/redvein/red_lantern": "generic_village_inn",
    "alderford/whitefold/white_ram": "generic_village_inn",
    "Langston/barolo/red_stave": "barolo_red_stave",
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
    "overworld/river_transport": "grey_river_barge",
    "prologue/battle_black_sinks": "siege"
  };

  // These files are rule libraries entered with *gosub_scene, rather than places the player can enter.
  // ChoiceScript temporarily writes their filename to stats.sceneName while they run.  If the scenery
  // refresh happens in that small window, resolving them as locations falls through to the remembered
  // district and briefly paints an exterior over the actual room.  They inherit the nearest real caller
  // from ChoiceScript's own return stack instead.
  var CONTEXT_CHILD_SCENES = {
    calendar: 1, economy: 1, character_buffs: 1, character_progression: 1, character_stats: 1,
    combat_ai: 1, combat_dice: 1, combat_movement: 1, combat_prose: 1, combat_spells: 1,
    combat_types: 1, dice_engine: 1, equipment: 1, crafting: 1, names: 1,
    // dungeon.txt is a shared step/time/dark-check library every dungeon file *gosub_scenes into (dg_run_begin
    // on entry, dg_step/dg_time/dg_dark_check while walking); no RULES entry ever keys off sceneName === "dungeon"
    // itself -- real in-run art comes from dg_in_run/dg_table/scenery_subplace, set by the caller before the
    // gosub either way -- so masking it back to the real dungeon file it was called from (never the player
    // standing in "dungeon" itself) only closes the entry-setup gap (dg_run_begin sets dg_in_run partway through
    // its OWN body, so the moment it's entered dg_in_run briefly still reads false) without changing anything
    // a real run already shows.
    dungeon: 1
  };

  function slug(v) { return String(v || "").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, ""); }

  function storyContext(s, subscenes) {
    // A helper can itself briefly *gosub_scene into an ORDINARY story scene purely for bookkeeping -- e.g.
    // character_progression.txt's refresh_quests_finished tallies the quest pool by calling each quest file's
    // own count_finished_<place> label in turn (prologue/alderford, port_valen/port_valen, longshade_forest...).
    // That real scene's name is correctly NOT in CONTEXT_CHILD_SCENES (the player does visit it for real), so
    // checking only the current sceneName misses this: the fix also looks at who called it. The immediate
    // caller (the end of the stack) being a known helper is proof this "visit" is the helper's own detour, not
    // the player standing there, so the walk below still applies and finds the real place beneath it all.
    var topCaller = subscenes.length ? String(subscenes[subscenes.length - 1].name || "") : "";
    if (!CONTEXT_CHILD_SCENES[String(s.sceneName || "")] && !CONTEXT_CHILD_SCENES[topCaller]) return s;
    for (var i = subscenes.length - 1; i >= 0; i--) {
      var caller = String(subscenes[i].name || "");
      if (caller && !CONTEXT_CHILD_SCENES[caller]) {
        var inherited = Object.create(s);
        inherited.sceneName = caller;
        return inherited;
      }
    }
    return s;
  }

  function isStatsOverlay(s, subscenes) {
    if (String(s.sceneName || "") === "choicescript_stats") return true;
    for (var i = 0; i < subscenes.length; i++) {
      if (String(subscenes[i].name || "") === "choicescript_stats") return true;
    }
    return false;
  }

  // the rules, tried in order; each gets the stats and returns the name of where the player is, or nothing
  function tile(s) { var O = window.Overworld; return s.ow_on && O && O.nodes ? O.nodes[s.ow_pos] : null; }
  function escortTile(s) { var O = window.Overworld; return s.sceneName === "port_valen/radiant/hall_escort" && (s.rj_escort_road || s.rj_escort_stage === "done") && O && O.nodes ? O.nodes[s.es_leg_to] : null; }
  var ESCORT_YARD_PLACES = { pv: "city_wagon_yard", tm: "timber_wagon_lot", af: "river_carters_lot", lg: "vale_gate_wagon_lot" };
  // The trade panel's shop_open names an OPEN MARKET (a lane, a green, a trading ground: web/mygame/market-data.generated.js, commodities) outdoors, not a shop counter, and the stat stays set
  // when the player walks on, so it must never choose the shop interior picture or the "shop" place.
  function counterShop(s) { var D = window.MARKET_DEFS; return !!(s.shop_open && !(D && D[s.shop_open] && D[s.shop_open].commodities)); }
  var BLACK_OATH_PLACES = {
    black_oath_upstairs_room: "black_oath_upstairs_room",
    dredge_boat_sheds: "dredge_boat_sheds",
    dredge_flooded_lower_steps: "dredge_flooded_lower_steps",
    dredge_lamp_stair: "dredge_lamp_stair"
  };
  var RULES = [
    function (s) { return s.sceneName === "combat" && s.scenery_combat_place ? s.scenery_combat_place : undefined; }, // a temporary combat scene keeps the location it was entered from
    function (s) { return s.dg_in_run && s.dg_table === "longshade_forest" && s.scenery_subplace ? s.scenery_subplace : undefined; }, // Longshade's landmark rooms and the Burning Grove's state variants; ordinary trails fall through to the forest pair
    function (s) { return s.sceneName === "Langston/wolves_of_langston_chapter_1" && s.scenery_subplace ? s.scenery_subplace : undefined; }, // Chapter 1 moves between the forest road, Langston streets, the Pickled Hen funeral and the mayor's office
    function (s) { return s.sceneName === "Langston/wolves_of_langston_chapter_2" && s.scenery_subplace ? s.scenery_subplace : undefined; }, // Chapter 2 moves from Langston's streets to Tomlin's cottage and workroom
    function (s) { return (s.sceneName === "Langston/wolves_of_langston_chapter_6" || s.sceneName === "Langston/wolves_of_langston_epilogue") && s.scenery_subplace ? s.scenery_subplace : undefined; }, // Chapter 6 moves between the Hen's table, the mayor's office, the town square, the temple's crimson courtyard and rotunda, the undercroft and the werewolf's lair
    function (s) { return (s.sceneName === "Langston/wolves_of_langston_chapter_5" || s.sceneName === "Langston/true_sun_temple") && s.scenery_subplace ? s.scenery_subplace : undefined; }, // Chapter 5 moves between the temple's exterior, rotunda, library, quarters, kitchen, cemetery and mausoleum
    function (s) { return (s.sceneName === "Langston/wolves_of_langston_chapter_4" || s.sceneName === "Langston/westwood") && s.scenery_subplace ? s.scenery_subplace : undefined; }, // Chapter 4 moves between the mayor's office, the western woods, the nymph's clearing, the bandit camp and the mayor's house
    function (s) { return (s.sceneName === "Langston/wolves_of_langston_chapter_3" || s.sceneName === "Langston/roi_grove") && s.scenery_subplace ? s.scenery_subplace : undefined; }, // Chapter 3 moves from the forest track to the clearing, Roi's grove and the home under his rock
    function (s) { return s.sceneName === "prologue/battle_black_sinks" && s.scenery_subplace === "black_sinks_causeway_before" ? "black_sinks_causeway_before" : undefined; }, // the ruined causeway during the prologue assault
    function (s) { return s.sceneName === "prologue/battle_black_sinks" && s.scenery_subplace === "black_sinks_bivouac" ? "black_sinks_captured_gatehouse_bivouac" : undefined; }, // the company holds the captured gatehouse overnight
    function (s) { return s.sceneName === "alderford/whitefold/the_weight_of_the_road" && s.weight_road_quest_stage !== "reckoning" && s.weight_road_quest_stage !== "resolved" && s.weight_road_quest_stage !== "failed" ? "whitefold_cut_road_collapse" : undefined; }, // the Cut Road emergency, investigation, wall reading and repair; the Fleecefold reckoning keeps the village backdrop until it has its own art
    function (s) { return s.scenery_subplace === "vane_contract_office" ? "vane_contract_office" : undefined; }, // Captain Vane's compact contract and dispatch office
    function (s) { return s.sceneName === "port_valen/varren_quests/varren_errand" && s.scenery_subplace === "varren_armory_shed" ? "varren_armory_shed" : undefined; }, // Varren's armory and its offer/report pages (port_valen/port_valen's own visits are covered by its passthrough rule below)
    function (s) { return s.sceneName === "port_valen/varren_quests/varren_errand" && s.scenery_subplace === "middle_ward_tavern" ? "generic_town_inn" : undefined; }, // Oswin's questions at the Wagoner's Rest should keep the inn backdrop
    function (s) { return s.sceneName === "port_valen/radiant/hall_perform" && s.rj_perf_venue === 1 ? "generic_town_inn" : undefined; }, // Wagoner's Rest common room
    function (s) { return s.sceneName === "port_valen/radiant/hall_perform" && s.rj_perf_venue === 2 ? "generic_tavern_inn" : undefined; }, // Cleaved Keel taproom
    function (s) { return s.sceneName === "port_valen/radiant/hall_perform" && s.rj_perf_venue === 3 ? "port_valen_private_supper" : undefined; }, // Middle Ward private supper
    function (s) { return s.sceneName === "port_valen/radiant/hall_perform" && s.rj_perf_venue === 4 ? "port_valen_wedding_hall" : undefined; }, // hired wedding hall
    function (s) { return s.sceneName === "port_valen/radiant/hall_perform" && s.rj_perf_venue === 5 ? "port_valen_patrician_gala_salon" : undefined; }, // Patrician Quarter gala salon
    function (s) { if (s.sceneName !== "port_valen/radiant/radiant_hub") return undefined; if (s.rh_from === "avenue") return "patrician_avenue"; if (s.rh_from === "harbor") return "city_harbour"; return "generic_city_street"; }, // the posting hub is read standing exactly where the player already was (the Trunk Road, the Avenue or the Quayside), never a place of its own
    function (s) { return s.sceneName === "port_valen/radiant/hall_haul" ? "port_valen_middle_ward_house_move" : undefined; }, // the Middle Ward house, stairs, lane and waiting handcart
    function (s) { return s.sceneName === "port_valen/radiant/hall_watch" ? "port_valen_cargo_warehouse_watch" : undefined; }, // the Cargo Quay warehouse through all three night-watch stretches
    function (s) { return s.sceneName === "port_valen/radiant/hall_pests" && s.rj_pest_in_cellar ? "generic_domestic_cellar" : undefined; }, // after the player commits to entering the infested cellar or back room
    function (s) { return s.sceneName === "port_valen/radiant/hall_pests" && s.rj_pest_where === "quarter" ? "patrician_avenue" : undefined; }, // the townhouse approach before entering and after leaving
    function (s) { return s.sceneName === "port_valen/radiant/hall_pests" && s.rj_pest_where !== "quarter" ? "middle_ward" : undefined; }, // the ordinary house approach before entering and after leaving
    function (s) { return s.sceneName === "port_valen/radiant/hall_escort" && ((!s.rj_escort_road && s.rj_escort_stage !== "done") || (s.rj_escort_road && Number(s.es_next_leg) === 0)) ? ESCORT_YARD_PLACES[s.es_start] : undefined; }, // each town's signing/muster yard, and the column's first pull out
    function (s) { var n = escortTile(s); return n ? n.name : undefined; }, // the current road, named camp ground or destination
    function (s) { var n = escortTile(s); return n && n.kind === "road" && n.also === "hills" ? "overworld_hilly_road" : undefined; }, // an unnamed hilly road stretch
    function (s) { var n = escortTile(s); return n ? n.kind : undefined; }, // plain road, wooded road, village or town fallback
    function (s) { return s.sceneName === "prologue/alderford" && s.scenery_subplace === "prologue_talia_loft" ? "talia_loft" : undefined; }, // Talia's private curing-loft home
    function (s) { return s.sceneName === "prologue/alderford" && s.scenery_subplace === "prologue_janna_alcove" ? "janna_hearth_alcove" : undefined; }, // Janna's private hearth alcove behind the smithy
    function (s) { return s.ow_on && s.ow_pos === "bs" ? "black_sinks_gilded_scales_toll_fort" : undefined; }, // repaired Gilded Scales toll fort, reached only after the prologue
    function (s) { return s.ow_on && s.ow_pos === "rg" ? "rois_grove" : undefined; }, // Roi's Grove overworld tile uses its wildflower clearing and rock-overhang home
    function (s) { return s.sceneName === "overworld/camp" && s.has_camp_kit ? "generic_camp_tent_interior" : undefined; }, // the player-owned solo tent, never a company bivouac
    function (s) { return s.sceneName === "timbermouth/workshops" && s.shop_open === "works" ? "generic_workshop_smithy" : undefined; }, // Roan's enclosed trade bench; the lane remains Timbermouth
    function (s) { return s.sceneName === "alderford/timber_smithy" && s.shop_open === "torvald" ? "generic_workshop_smithy" : undefined; }, // Torvald trades from the Timber Smithy's waterwheel forge, not a generic shop counter
    function (s) { return s.sceneName === "port_valen/port_valen_middle_ward" && s.scenery_subplace === "middle_ward_halda_forge" && s.shop_open === "halda" ? "generic_workshop_smithy" : undefined; }, // Halda trades from a working forge, not a goods shop
    function (s) { return s.sceneName === "port_valen/port_valen_upper_wharves" && s.scenery_subplace === "patrician_inner_gate" ? "patrician_inner_gate" : undefined; }, // the Patrician Quarter's writ gate
    function (s) { return s.sceneName === "port_valen/port_valen_upper_wharves" && s.scenery_subplace === "patrician_avenue" ? "patrician_avenue" : undefined; }, // Avenue of Estates, including its great-house stretch
    function (s) { return s.sceneName === "port_valen/port_valen_upper_wharves" && s.scenery_subplace === "patrician_terrace_walk" ? "patrician_terrace_walk" : undefined; }, // ridge promenade above the city
    function (s) { return s.sceneName === "port_valen/port_valen_upper_wharves" && s.scenery_subplace === "patrician_gilt_needle" ? "patrician_gilt_needle" : undefined; }, // bespoke tailor interior beats the generic shop counter
    function (s) { return s.sceneName === "prologue/company_intake" && s.scenery_subplace === "prologue_carrion_compound" ? "carrion_compound" : undefined; }, // Iron Carrion intake and munitions camp
    function (s) { return s.sceneName === "prologue/company_intake" && s.scenery_subplace === "prologue_flashback_village" ? "village_green" : undefined; }, // Ashbrook memory
    function (s) { return s.sceneName === "prologue/company_intake" && s.scenery_subplace === "prologue_flashback_dredge" ? "dredge_end" : undefined; }, // Dredge-End memory
    function (s) { return s.sceneName === "prologue/camp_night" ? "prologue_camp_night" : undefined; }, // the always-night company bivouac has its own standalone art
    function (s) { return s.sceneName === "prologue/dawn_trial" || s.sceneName === "prologue/class_select" ? "carrion_compound" : undefined; }, // the compound's dawn trials and class selection
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
    function (s) { return s.sceneName === "port_valen/radiant/hall_courier" && s.cr_origin === "lg" ? "langston_hall" : undefined; }, // Langston's shared courier-posting pages remain at the Contract Board inside Langston Hall
    function (s) { return s.sceneName === "horse_dealer" && s.horse_place === "bc" ? "generic_village_pasture" : undefined; }, // Barleycross's working-horse rail stands at the common pasture
    function (s) { return s.sceneName === "horse_dealer" && s.horse_place === "mw" ? "village_stable_yard" : undefined; }, // Port Valen's dealer works from the Middle Ward yard
    function (s) { return s.sceneName === "Langston/tomlin_shop" ? "tomlin_herbalist_workroom" : undefined; }, // Tomlin's workroom keeps its own picture while the trade panel is open (it has a bespoke interior, so the generic open-counter picture below must not take over)
    function (s) { return counterShop(s) && s.shop_open !== "trapper" && s.shop_open !== "halda" ? "generic_trade_shop_open" : undefined; }, // unobstructed shop counters; Halda has a scoped forge rule above and the forest trapper stays outdoors
    function (s) { return s.sceneName === "port_valen/port_valen_middle_ward" && s.scenery_subplace === "middle_ward_inn_room" ? "generic_town_inn_room" : undefined; }, // Wagoner's Rest guest room and Kess's rented chamber
    function (s) { return s.sceneName === "timbermouth/split_pine_inn" && s.scenery_subplace === "town_inn_room" ? "generic_town_inn_room" : undefined; }, // Split Pine guest room
    function (s) { return s.sceneName === "Langston/pickled_hen" && s.scenery_subplace === "pickled_hen_room" ? "generic_town_inn_room" : undefined; }, // Pickled Hen guest room
    function (s) { return s.scenery_subplace === "village_inn_room" && (s.sceneName === "alderford/drowned_oar" || s.sceneName === "alderford/redvein/red_lantern" || s.sceneName === "alderford/whitefold/white_ram" || s.sceneName === "Langston/barolo/red_stave" || s.sceneName === "Langston/broadmead/crooked_halter" || s.sceneName === "port_valen/brinewick/reedhouse" || s.sceneName === "Langston/fallowmere/grey_gander" || s.sceneName === "port_valen/marlcross/wayfarers_rest") ? "generic_village_inn_room" : undefined; }, // village inns and Maura's Drowned Oar rooms
    function (s) { return s.sceneName === "Langston/fallowmere/grey_gander" && s.scenery_subplace === "fallowmere_grey_gander_yard" ? "village_stable_yard" : undefined; }, // the Grey Gander's open cart yard (the taproom keeps its own picture)
    function (s) { return s.sceneName === "Langston/broadmead/crooked_halter" && s.scenery_subplace === "broadmead_crooked_halter_yard" ? "village_stable_yard" : undefined; }, // the Crooked Halter's open stable yard (the common room keeps its own picture)
    function (s) { return s.sceneName === "Langston/barolo/red_stave" && s.scenery_subplace === "barolo_red_stave_court" ? "village_stable_yard" : undefined; }, // the Red Stave's open stable court (the hall keeps its own picture; the rented room is the village inn room above)
    function (s) { return s.sceneName === "port_valen/brinewick/reedhouse" && s.scenery_subplace === "reedhouse_stable_yard" ? "village_stable_yard" : undefined; }, // the Reedhouse's raised stable yard (the hall keeps its own picture)
    function (s) { return s.sceneName === "timbermouth/split_pine_inn" && s.scenery_subplace === "tm_inn_yard" ? "generic_town_stable" : undefined; }, // the Split Pine's larger wagon-and-stall yard uses the shared town stable view
    function (s) { return s.sceneName === "alderford/drowned_oar" && s.scenery_subplace === "af_oar_stable_yard" ? "generic_town_stable" : undefined; }, // the Drowned Oar's raised stable court above the lower wharf
    function (s) { return s.sceneName === "port_valen/port_valen" && s.scenery_subplace ? s.scenery_subplace : undefined; }, // trusts any subplace this scene sets directly as a picture key; add new interior/exterior beats there with no scenery.js change
    function (s) { return s.sceneName === "alderford/redvein/red_lantern" && s.scenery_subplace === "village_stable_yard" ? "village_stable_yard" : undefined; },
    function (s) { return s.sceneName === "alderford/whitefold/white_ram" && s.scenery_subplace === "village_stable_yard" ? "village_stable_yard" : undefined; },
    function (s) { return s.sceneName === "port_valen/marlcross/wayfarers_rest" && s.scenery_subplace === "wayfarers_rest_stable_yard" ? "village_stable_yard" : undefined; }, // the Wayfarer's Rest stable yard (the hall keeps its own picture)
    function (s) { return s.sceneName === "port_valen/port_valen_middle_ward" && s.scenery_subplace === "middle_ward_lodgings" ? "generic_quiet_lodgings" : undefined; }, // Terrace Lodgings' ground-floor entry hall
    function (s) { return s.sceneName === "port_valen/port_valen_middle_ward" && s.scenery_subplace === "middle_ward_tavern" ? "generic_town_inn" : undefined; }, // the Wagoner's Rest hall and rooms
    function (s) { return s.sceneName === "port_valen/port_valen_middle_ward" && s.scenery_subplace === "middle_ward_bakehouse" ? "middle_ward_bakehouse" : undefined; }, // Mother Marda's communal bakehouse
    function (s) { return s.sceneName === "port_valen/port_valen_middle_ward" && s.scenery_subplace === "middle_ward_bathhouse" ? "middle_ward_bathhouse" : undefined; }, // Conduit Baths' tub room
    function (s) { return s.sceneName === "alderford/chapel" ? "saint_althea_chapel" : undefined; }, // Saint Althea's working parish chapel above the weir
    function (s) { return s.sceneName === "port_valen/port_valen_middle_ward" && s.scenery_subplace === "middle_ward_city_street" ? "generic_city_street" : undefined; }, // Trunk Road and Lantern Lane; Conduit Square remains the district view
    function (s) { return s.sceneName === "port_valen/black_oath/black_oath_night_list" ? BLACK_OATH_PLACES[s.scenery_subplace] : undefined; }, // the handler's upstairs room and the Night List's three existing Dredge-End stops
    function (s) { return s.sceneName === "port_valen/port_valen_dredge_end" && s.scenery_subplace === "dredge_duckboard_market" ? "dredge_duckboard_market" : undefined; }, // market lane and stalls
    function (s) { return s.sceneName === "port_valen/port_valen_dredge_end" && s.scenery_subplace === "dredge_upper_gangways" ? "dredge_upper_gangways" : undefined; }, // elevated tenant walkways
    function (s) { return s.sceneName === "port_valen/port_valen_dredge_end" && s.scenery_subplace === "dredge_boat_sheds" ? "dredge_boat_sheds" : undefined; }, // boatwrights' work-bank and scrap yard
    function (s) { return s.sceneName === "port_valen/port_valen_dredge_end" && s.scenery_subplace === "dredge_lamp_stair" ? "dredge_lamp_stair" : undefined; }, // seawall terrace and its doors
    function (s) { return s.sceneName === "port_valen/port_valen_dredge_end" && s.scenery_subplace === "black_lantern_floor" ? "black_lantern" : undefined; }, // the Black Lantern's dice ring and card table
    function (s) { return s.sceneName === "port_valen/port_valen_dredge_end" && s.scenery_subplace === "black_lantern_back" ? "black_lantern_back" : undefined; }, // the Black Lantern's back room
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
    function (s) { if (counterShop(s)) return "shop"; },                                                  // at a shop's counter
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
    // A Dev Hub combat fixture sets this explicitly before entering combat.txt.  Do not infer any fiction
    // from the current or recently visited scene while it remains true.
    if (s.scenery_suppressed) return [];
    // Dev Hub choices also call reusable mechanics libraries such as character_stats.txt with *gosub_scene.
    // The child scene temporarily becomes sceneName, and would otherwise fall through to the initial
    // "compound" district before it returns. The call stack is the durable indication that it is still a
    // non-fiction developer flow.
    var subscenes = s.choice_subscene_stack || [];
    for (var si = 0; si < subscenes.length; si++) {
      if (/^dev_hub(?:\/|$)/.test(String(subscenes[si].name || ""))) return [];
    }
    // Developer screens are outside the fiction. Test state deliberately leaves useful world flags behind, so this
    // has to run before EVERY location rule, not merely before the final district fallback below. Combat tests
    // enter combat.txt with *gosub_scene, so they need the same exemption without muting real story combat.
    var sn = String(s.sceneName || "");
    if (/^dev_hub(?:\/|$)/.test(sn) || (sn === "combat" && /^fight_/.test(String(s.dctest_label || "")))) return [];
    // Mechanics helpers have no world location of their own.  Keep their caller's backdrop during the
    // transaction/calculation, including nested helpers such as economy -> calendar -> character_buffs.
    s = storyContext(s, subscenes);
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

  // Load and decode a place's pictures before assigning them to the full-screen CSS layers.  A WebP's network
  // load may finish well before its first decode; waiting here lets the old backdrop remain stable instead of
  // making the first frame of a new scene hitch while Chrome decodes two large images.
  // It counts as ready only when all parts are in, so the backdrop never shows half a pair.
  function load(key) {
    if (loaded[key] || loading[key]) return;
    loading[key] = true;
    var parts = have()[key] === "single" ? ["day"] : ["day", "night"], left = parts.length;
    parts.forEach(function (part) {
      var img = new Image();
      var done = false;
      function ready() {
        if (done) return;
        done = true;
        if (!--left) { loaded[key] = true; loading[key] = false; update(); }
      }
      img.onload = function () {
        var decoding = null;
        try { decoding = img.decode && img.decode(); } catch (e) { decoding = null; }
        if (decoding && decoding.then) decoding.then(ready, ready);
        else ready();
      };
      img.onerror = ready;
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
    // Two stages, each a night layer and a day layer plus its OWN glow, haze and dim. A background image cannot fade, so a change of place brings the OTHER stage in (with the new place's pictures and
    // its own lighting) over the old one, and the old one goes when the new is fully in. Each stage keeps its own look (2026-11-02): while the old place fades out it must not pick up the new place's fog,
    // dimming or colour, and the incoming stage must not slide from whatever lighting it held last (so a place never fades in as the wrong time of day).
    var stage = '<div class="sc-stage"><div class="sc-layer sc-night"></div><div class="sc-layer sc-day"></div><div class="sc-glow"></div><div class="sc-haze"></div><div class="sc-dim"></div></div>';
    el.innerHTML = stage + stage;
    stages = el.querySelectorAll(".sc-stage");
    document.body.insertBefore(el, document.body.firstChild);
  }

  function smooth(a, b, x) { var t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); }

  // how much of the day picture shows: 0 at night, 1 by day, rising through the dawn and falling through the dusk
  function daylight(h) { return Math.min(smooth(5, 7.5, h), 1 - smooth(17.5, 20.5, h)); }

  function update() {
    var s = window.stats; if (!s || off || !document.body) {
      root.classList.remove("hasScenery");
      // A disabled or unavailable backdrop must not retain a signature that says it is still painted.
      // Otherwise turning scenery back on can return early below and leave the page permanently blank.
      last = "";
      return;
    }
    // A scene handoff (*goto_scene, *gosub_scene, and the *return back) sets stats.sceneName the instant the new
    // Scene object is built, but that scene's own lines -- including its *set scenery_subplace -- only run after
    // an async callback (web/scene.js loadScene/loadSceneFast). The 1-second poll below can land inside that gap,
    // reading a sceneName paired with the OLD scenery_subplace and briefly painting the wrong place or nothing at
    // all. screenEmpty is cleared only once the live scene actually prints a paragraph, so it is a ready-made
    // signal that nothing it just set has taken effect yet; a silent *gosub_scene library (economy, calendar,
    // dice_engine) never prints at all, so this also covers the whole length of a gambling round's wager/time-advance
    // calls, reinforcing storyContext() below rather than replacing it.
    if (s.scene && s.scene.screenEmpty) return;
    // choicescript_stats is the dossier overlay. Re-resolving that bookkeeping scene would fall through to a
    // stale district (or no place) and replace the view the player was just standing in. Reuse the displayed
    // key instead; the lighting below still reads the current clock, so waiting through dusk changes the view.
    var key = isStatsOverlay(s, s.choice_subscene_stack || []) ? curKey : sceneKey(s);
    if (key === "") return;                                              // still loading: no change yet
    if (!key) {
      // Developer and other deliberately scenery-free pages must not leave a previously painted stage
      // (usually the pre-story Carrion Compound) available to fade back in during a ChoiceScript redraw.
      // Clear both stages and suppress the outgoing opacity transition for this one blank state.
      if (el) {
        el.classList.add("scenery-cleared");
        for (var i = 0; i < stages.length; i++) {
          clearTimeout(goneTimer[i]);
          stages[i].classList.remove("on", "top");
          stages[i].removeAttribute("data-scene");
        }
      }
      root.classList.remove("hasScenery");
      curKey = null;
      // We have deliberately removed the image.  Clear the render signature too: returning to the same
      // backdrop at the same hour/weather must restore it rather than being treated as a no-op.
      last = "";
      return;
    }
    if (!el) build();
    el.classList.remove("scenery-cleared");
    var single = have()[key] === "single";
    var h = (Number(s.clock_hour) || 0) + (Number(s.clock_minute) || 0) / 60;
    var day = daylight(h);
    var wet = !!s.weather_wet, poor = s.weather_visibility === "poor", storm = Number(s.weather_severity) >= 3, over = s.weather === "Overcast";
    var dark = !!(s.dg_in_run && s.dg_dark);
    var shared = effectsOff ? { "--sc-glow": "0", "--sc-sat": "1", "--sc-bright": "1", "--sc-haze": "0", "--sc-dim": "0" } : {
      "--sc-glow": single ? "0" : (0.55 * Math.sin(Math.PI * Math.max(0.001, Math.min(0.999, day)))).toFixed(3),   // the dawn and dusk warmth, strongest half way
      "--sc-sat": (wet || over || poor ? 0.7 : 1).toFixed(2),
      "--sc-bright": (storm ? 0.62 : wet ? 0.78 : over ? 0.85 : 1).toFixed(2),
      "--sc-haze": poor && !storm ? "0.55" : (over ? "0.15" : "0"),
      "--sc-dim": dark ? "0.55" : (single ? (0.5 * (1 - day)).toFixed(2) : "0")   // a single picture is darkened at night instead of swapped
    };
    var blend = { "--sc-day": single ? "1" : day.toFixed(3) };
    // The pictures themselves (the url()s behind background-image) are a pure function of key + its version stamp,
    // so they are IDENTICAL on every call that does not change place. Rewriting a custom property that feeds a
    // background-image with its own unchanged value still makes Chrome re-touch that paint, which is visible as a
    // flicker on a page that repaints often for an unrelated reason (dice rounds re-run this every ~15 game-minutes
    // purely because the day/night blend ticks). Only set these when a stage is actually taking on a new place.
    var pictures = {
      "--sc-img-day": 'url("' + urlOf(key, "day") + '")',
      "--sc-img-night": 'url("' + urlOf(key, "night") + '")'
    };
    var sig = key + JSON.stringify(shared) + JSON.stringify(blend);
    if (sig === last) return; last = sig;
    // the lighting (shared) and the day/night blend (blend) both belong to one stage, so a place that is fading out keeps the look it had
    function paint(st) {
      var n;
      for (n in shared) if (shared.hasOwnProperty(n)) st.style.setProperty(n, shared[n]);
      for (n in blend) if (blend.hasOwnProperty(n)) st.style.setProperty(n, blend[n]);
    }
    function paintPictures(st) {
      var n;
      for (n in pictures) if (pictures.hasOwnProperty(n)) st.style.setProperty(n, pictures[n]);
    }
    if (key !== curKey) {
      var next = cur === 0 ? 1 : 0;
      if (curKey === null) { stages[0].classList.remove("on", "top"); stages[1].classList.remove("on", "top"); next = 0; }   // from nothing: the whole backdrop is fading in itself
      clearTimeout(goneTimer[next]);
      // Paint the incoming stage with its transitions off, so its day/night blend, colour and haze start at their final values instead of sliding there from the last place it showed.
      var inc = stages[next];
      inc.classList.add("sc-instant");
      paint(inc); paintPictures(inc); inc.setAttribute("data-scene", key);
      void inc.offsetWidth;                                                         // commit those values before anything is allowed to animate
      inc.classList.add("on", "top");                                             // the new place fades in over the old one...
      var settle = function () { inc.classList.remove("sc-instant"); };
      if (window.requestAnimationFrame) window.requestAnimationFrame(function () { window.requestAnimationFrame(settle); }); else setTimeout(settle, 60);
      if (cur >= 0 && curKey !== null) {
        var old = cur; stages[old].classList.remove("top");
        goneTimer[old] = setTimeout(function () { stages[old].classList.remove("on"); }, FADE_MS);   // ...and the old one leaves once the new is in
      }
      cur = next; curKey = key;
    } else paint(stages[cur]);                                                      // the same place: only the day-and-night blend moves
    root.classList.add("hasScenery");
  }

  // ChoiceScript redraws a page synchronously after a choice.  Polling once a second was enough for weather and
  // clock changes, but it made a new backdrop visibly arrive up to a second after the new prose.  Queue exactly
  // one refresh for the next paint after the engine prints the page; the interval remains for passive changes.
  var updateQueued = false;
  function requestUpdate() {
    if (updateQueued) return;
    updateQueued = true;
    var run = function () { updateQueued = false; update(); };
    if (window.requestAnimationFrame) window.requestAnimationFrame(run);
    else setTimeout(run, 0);
  }
  function hookPageRender() {
    var original = window.printParagraph;
    if (typeof original !== "function" || original._sceneryHooked) return;
    function wrappedPrintParagraph(msg, parent) {
      var result = original.apply(this, arguments);
      requestUpdate();
      return result;
    }
    wrappedPrintParagraph._sceneryHooked = true;
    window.printParagraph = wrappedPrintParagraph;
  }
  function start() { hookPageRender(); update(); setInterval(update, 1000); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
  window.Scenery = {
    update: update, daylight: daylight, placeNames: placeNames,
    key: function () { return window.stats ? sceneKey(window.stats) : null; },
    setOff: function (b) { off = !!b; try { window.localStorage.setItem("scenery", b ? "off" : "on"); } catch (e) { } update(); },
    getEffectsOff: function () { return effectsOff; },
    setEffectsOff: function (b) {
      effectsOff = !!b;
      try { window.localStorage.setItem("sceneryEffects", b ? "off" : "on"); } catch (e) { }
      last = "";   // force the next update() to repaint even if key/clock/weather haven't moved
      update();
    }
  };
})();
