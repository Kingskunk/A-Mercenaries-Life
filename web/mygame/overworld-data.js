/*
 * overworld-data.js: the overworld map's tiles and roads, and the one function that turns a journey into miles and minutes.
 *
 * The map panel (overworldmap.js) draws from this file, and the scene scenes/overworld/overworld.txt reads it through *script (the same way names.txt reads the name
 * generator), so the map and the trip can never disagree about a distance. Nothing here is random.
 *
 *   Overworld.route("tm", "pv")   ->  { ok: true, path: ["tm","r3","r2","r1","pv"], legs: [{ from:"tm", to:"r3", miles:10, minutes:240 }, ...], miles: 40, minutes: 960 }
 *   Overworld.label("pv", "tm")   ->  "40 miles, about 16 hours of walking"
 *   Overworld.duration(960)       ->  "about 16 hours"
 *   Overworld.span(960)           ->  "about 16 hours of walking"   (only the hours the clock will actually run: a "days of travel" figure was tried and removed 2026-10-07 because it was false, since nothing forces a camp)
 *
 * TERRAIN (2026-10-11, the user's call): a way between two tiles has a terrain, the optional fourth value of its EDGES entry ("road" if left out). A road costs a mile at the usual pace; "overland" (pathless forest
 * and other difficult ground, no road or track) takes TWICE as long a mile, the tabletop rule for difficult terrain; "blocked" cannot be crossed at all, and the route finder never uses it. The route finder picks the
 * way that takes the LEAST TIME, not the fewest miles, so a long road beats a short slog through the trees. A leg carries its terrain and its pace (percent of a road mile), and the clock charges that pace mile by mile.
 *
 * Adding a tile: one entry in NODES and one or more in EDGES here, and nothing else. The scene does not list tiles (the map panel owns picking and writes the tile the player
 * picked into ow_dest), so the world can grow to hundreds of tiles without touching a scene. tools/check_overworld_map.js checks this file is well formed.
 *
 * climate (optional, default 0) is how many steps colder (negative) or hotter (positive) the tile runs than Port Valen. The scene feeds it to climate_shift before it charges the exposure of a leg
 * and before the temperature is read, so a cold night in the uplands costs more than the same night on the coast. It moves temperature only: rain, storms, fog and snow are still one weather for
 * every tile. water (optional) is a short phrase ("the river") for a tile with fresh water at hand; the scene's ow_water flag turns the lye soap on there (equipment.txt water_at_hand).
 * here is the line shown when the player stands on the tile. A tile may also carry hereNight (shown at Night and Pre-Dawn) and hereStorm (shown in dangerous weather, which wins over the
 * night line), so the approach to a town looks different by lamplight or in a gale; overworld.txt ow_here picks one. Each is a plain sentence or two, no people to be named.
 * also (optional) is a second terrain for a tile that is two things at once (a road through hills, wooded hills): one of the same kinds, drawn as a ring of its colour round the tile's own colour, and named
 * on the card ("Forest and hills"). It changes nothing else. kind picks the tile's colour in the panel: "city", "town", "village", "fort", "road", "woodroad", "hills", "forest" (add a kind here and a colour in overworldmap.css). "woodroad" is a made road with the trees close on both sides (the Longshade Edge): for road events and forest events it counts as BOTH a road and a forest (kindIn below), so it meets the stranger, the lamp, the cart and the beasts, and has its own colour so it reads apart from the deep forest.
 * territory (required) is the jurisdiction that holds the tile: an id in TERRITORIES below. Every tile so far belongs to the Valen Reach under the Gilded Scales (the user's call, 2026-10-08). The map card shows its name after the tile's kind ("Road · The Valen Reach"; 2026-10-30, replacing a hand-written region line per tile). It is otherwise data only for now: nothing in the panel or the
 * scenes reads it yet, so it is the place to hang tolls, patrols, escort pay and danger by owner later. A new territory is one entry in TERRITORIES.
 * weather (optional) names a WEATHER_ZONES zone for a tile whose weather is not its territory's (a high pass, a haunted hollow); the territory's own weather: is the normal way.
 * requires (optional) is the name of a saved flag (stats.<name>): until it is true the tile is HIDDEN, not just locked. The map does not draw it or its roads, and route() will neither start, end nor pass through it, so the travel button,
 * the forecast and the scene's own trip check all refuse it (Overworld.isOpen(id) says which). Used for the Deep Longshade, which stays off the map until Bark's quest is done.
 * ford (optional, true): a crossing of running water the road makes here, where a road event (the ford) can happen; the event reads how high the water is from the weather's memory.
 * danger (optional, 0 to 3, default 0) is how rough the LAND is for a caravan before anyone patrols it: 0 safe, 1 uneasy, 2 rough, 3 dangerous. The EFFECTIVE danger is that number plus the patrol of the territory that holds the tile
 * (TERRITORIES below; the Scales' patrol is -1), kept between 0 and 3, and Overworld.dangerOf(id) gives it. The escort (radiant/hall_escort.txt) reads the effective danger for how likely a halt on the tile is to meet an event, which
 * events it can draw (HALT_EVENTS below) and how likely a night in camp there is to be disturbed. patrol (optional) overrides the territory value for a remote pocket that is claimed but not actually patrolled.
 * walk, camp, depart and arrive (optional) are plain text for the caravan escort (radiant/hall_escort.txt), written to read the same in either direction: walk describes the road as the line comes in to
 * this tile, camp is the ground when the line makes camp here, depart is how the line pulls out from here, and arrive is how it comes in when this tile is the end of the road. A road, forest or hills tile needs a walk.
 * walkVia (optional, 2026-10-11) is the same idea for the road as the line comes IN to a tile: an object keyed by the tile the line came from, used instead of walk (Timbermouth and Alderford have two ways in).
 * departVia and arriveVia (optional) are for an end of the road with more than one road out of it (Port Valen, Timbermouth and Alderford have two): an object keyed by the neighbouring tile's id, and it wins over depart/arrive when the line
 * leaves toward, or comes in from, that tile. Port Valen's plain depart/arrive are the River Road ones.
 * x and y are the tile's place on the map in grid units (east and south positive); the panel scales them. They establish the map's geography and readability, not a ruler: an edge's miles are the actual travel distance and can be longer or shorter than its visual span when terrain, detours or route conditions demand it.
 * image (optional) is a picture drawn inside the tile's circle in place of the plain colour, for when the tiles get art: a URL or data: URI, circular crop. None have one yet.
 */
(function (root) {
  "use strict";

  // 24 minutes a mile (2.5 mph, short breaks included): a day's march is 20 miles in 8 hours of walking, the 8-hour travel day of the tabletop rules and about what a loaded walker manages on a
  // road. Set at the user's call (2026-10-07), who preferred the realistic pace to a padded one. A camp on the road (overworld.txt ow_camp) is where the rest of the day goes; walking the whole
  // 40 miles to Timbermouth without a camp is 16 hours on your feet, and the tiles are 10 miles (4 hours) apart so a camp falls after a sensible day's walk (two tiles, 20 miles).
  var MINUTES_PER_MILE = 24;
  var DUSK_MINUTES_PER_MILE = 30;
  var DARK_MINUTES_PER_MILE = 48;
  // On a horse (stats.has_horse): the same three paces, halved in daylight and at dusk, and half again in the dark, where a horse still picks its way. calendar.txt travel_step reads the same numbers.
  var MOUNT_MINUTES_PER_MILE = 12;
  var MOUNT_DUSK_MINUTES_PER_MILE = 15;
  var MOUNT_DARK_MINUTES_PER_MILE = 24;
  var DAYLIGHT_START = 420; // 07:00, when calendar.txt changes Pre-Dawn to Morning
  var DUSK_START = 1080;    // 18:00
  var NIGHT_START = 1260;   // 21:00

  // Which way north lies on the map as it is drawn, in degrees clockwise from straight up the screen (0 = north is up). The map panel draws a compass from this and lets the player turn the map
  // in quarter turns, the compass turning with it. It changes nothing about the tiles or distances. The map is laid out with north up (geography settled 2026-10-08, the user's call: the Grey
  // River comes down to the city from a fork in the north, shaped like a Y: Alderford lies up the east arm (the Grey proper) and Timbermouth up the west arm (the Ashrun). The River Road leaves Port Valen by the River Gate, follows the river north to the fork, and runs
  // north-north-west toward Timbermouth. The High Grey Road is a separate north-east branch from the Charter Gate, climbing the high ground on the Grey's eastern side. The Crossfield Road runs north-west from Alderford through Barleycross to Timbermouth, carrying forest goods, grain and finished wares without sending every load down to Port Valen first. The Longshade node is dense interior forest between Timbermouth, Ashrun Holt and Longshade Edge: its map links are player travel connections, not roads or regularly used trails. North of Alderford, the Coldspine runs east and west across the whole of the north, with few passes fit for wagons or an army and a fort in each. Its southern foothills hold Redvein and Whitefold; the Splitjaw Ravines are a dead-end approach into its lower face. Its last low spur comes down toward the Black Sinks, and the narrow ground between that spur and the marsh is the only practical freight way east.
  var NORTH = 0;

  // Who holds the land. Add a territory here and give its tiles its id.
  // patrol shifts the danger of every tile the territory holds (see danger above): a negative number is a patrolled road, a positive one a lawless one. The Scales keep the river road patrolled.
  var TERRITORIES = {
    scales: { name: "The Valen Reach", ruler: "The Gilded Scales", patrol: -1, weather: "reach", government: "scales" },
    // The Western Vale (2026-10-29): House Gault's country, west of Fellgate. Unpatrolled by the Scales, so no shift either way for now.
    gault: { name: "The Western Vale", ruler: "House Gault", patrol: 0, weather: "vale", government: "gault" }
  };

  // WEATHER ZONES (2026-10-30, the user's call: separate weather for the Western Vale, built to take more regions and other planes later). A zone is a place that has its own weather: today's, tomorrow's
  // forecast and the rain and dry streaks (the globals weather, weather_tomorrow, forecast_missed, rain_streak, dry_streak). The zone the player is in lives in those globals, which is why the 78 scenes that read
  // the weather never change; every other zone the player has been to is parked in stats.wx_slots (JSON) and swapped in by weatherSync. A territory names its zone (weather:), a tile may override it (weather:
  // on the tile, for a high pass or a haunted hollow), and a place that is not a tile (a town the player is walking about in) gets one from DISTRICT_ZONE below. profile names the rules that roll the zone's
  // days: "temperate" is the season tables in calendar.txt roll_weather. A new profile (a wetter Vale, a plane that never rolls, a plane with weather names of its own) needs a branch there, an entry in
  // WEATHER_PROFILES and, for a new weather name, a line in calendar.txt update_weather_flags (the wet, cold and severity it means); the checker fails a zone that names a profile not listed.
  // To add a region: one entry here, and point its territory's weather at it. To put the player in a zone by hand (a portal, a plane): set stats.wx_force_zone to its id ("" to stop).
  // temperate: the season tables as they are. open_country (2026-10-30, the Western Vale: level grassland, chalk rises, vineyards and horse pastures, no coast, marsh or river fog): the same tables, then about a
  // third of the rain days turn overcast and most of the fog turns clear (calendar.txt roll_weather); storms and snow are left as they are.
  var WEATHER_PROFILES = ["temperate", "open_country"];
  var WEATHER_ZONES = {
    reach: { name: "The Valen Reach", profile: "temperate" },
    vale: { name: "The Western Vale", profile: "open_country" }
  };
  var DEFAULT_WEATHER_ZONE = "reach";
  // A district (stats.current_district) the player is in while NOT on the overworld, where it is not the default zone. Langston is a town, not a tile; a Vale dungeon or farm would be listed here too.
  var DISTRICT_ZONE = { langston: "vale", barolo: "vale", broadmead: "vale", fallowmere: "vale" };
  // The fields a zone owns: its key in a parked slot -> the stat it is swapped with.
  var WEATHER_FIELDS = { weather: "weather", tomorrow: "weather_tomorrow", missed: "forecast_missed", rain: "rain_streak", dry: "dry_streak" };

  // "track" (2026-10-30, the user's sketch of Roi's Grove): a seldom-used dirt road, walked at road pace but drawn dotted on the map, so it reads as a lesser way than the wagon road.
  // How each terrain walks, as a percent of a road mile's time. "blocked" has no pace: it is never walked. name is what the map card calls the ground.
  var TERRAIN = {
    road: { name: "road", pace: 100 },
    overland: { name: "pathless forest", pace: 200 },
    track: { name: "dirt track", pace: 100 },
    blocked: { name: "impassable ground", pace: 0 }
  };

  // FEATURES are things drawn on the map under the tiles that are not tiles and are not walked: a mountain range today. A feature has a name, a colour class (kind, styled as .ow-f-<kind> in
  // overworldmap.css), a label position (map units, the name is drawn upright whatever way the map is turned), the text of its card and `art`: the name of a hand-drawn SVG in
  // web/mygame/overworld-art/<art>.svg, which tools/gen_overworld_art.js turns into overworld-art.js (read it for how to draw). Clicking a feature in the panel shows its card; nothing routes through one.
  // Added 2026-10-11 from the user's drawing: the Coldspine runs east and west across the north with a gap, where Stonewatch stands, due north of the Crossfield Road, and its last low spur turns south at the
  // east end toward the Black Sinks.
  var FEATURES = [
    {
      id: "coldspine", name: "The Coldspine", kind: "range", art: "coldspine", label: [-1.5, -5.18],
      info: "A broken mountain barrier that runs east and west across the whole north, between the Highlands and the lowlands the Gilded Scales hold. Its southern foothills hold the mines and quarries of Redvein and Whitefold, and its last low spur turns south to the Black Sinks. In the west the range bends away to the north, past Langston, into country no road reaches.",
      line: "Closed to travel on foot. The one way over it is the pass at Stonewatch."
    }
  ];

  var NODES = {
    pv: {
      name: "Port Valen", kind: "city", x: 0.0, y: 0.0,
      territory: "scales",
      danger: 1,
      depart: "The head of the column lurches forward, ox by ox, and the wagons take up the weight of their loads with a groan of axles. The yard's gate swings shut behind the tail wagon, and the River Road bends away north along the cuttings above the Grey, paved and rutted and wide enough for two wagons to pass.",
      walk: "The paving runs smooth and well kept, rutted by wagon wheels, with the grey city wall growing ahead.",
      arrive: "The caravan comes down the last of the cuttings to the carters' yards outside the River Gate, where the grey wall rises above the fences and the gate stands open on the city.",
      departVia: { ar1: "The head of the column lurches forward, ox by ox, and the wagons take up the weight of their loads with a groan of axles. The yard's gate swings shut behind the tail wagon, and the line turns east along the carters' track under the grey outer face of the wall, past the salt-factors' yards and the pilgrim hospices outside the Charter Gate, to where the old paving of the High Grey Road climbs away to the north-east." },
      arriveVia: { ar1: "The caravan comes down off the high ground by the old paving, past the hospices and the salt-factors' yards outside the Charter Gate, and along the carters' track under the grey wall to the yards outside the River Gate, where the fences close in and the gate stands open on the city." },
      info: "The free port and the Gilded Scales' seat. The Greybridge crosses the river above the tidal reach, linking the city to the west-bank River Road.",
      here: "The city's wall stands behind you, and the river road runs north from the River Gate along the cuttings of the Grey."
    },
    r1: {
      name: "The River Road", kind: "road", x: -0.72, y: -0.74,
      territory: "scales",
      danger: 1,
      walk: "The paved road runs along the cuttings above the Grey, wide enough for two wagons to pass, with the river sliding by below it.",
      info: "The Grey River road, paved and well kept this close to the city, with salt and wine wagons on it, running along the cuttings above the river.",
      here: "The road runs straight and paved along the cuttings, rutted by wagon wheels, with the Grey River below it."
    },
    r2: {
      name: "Ashrun Mouth", kind: "road", x: -0.83, y: -1.83,
      territory: "scales",
      danger: 2,
      walk: "The cuttings climb and fall, the river shows between the trees and goes again, and the road comes down to a place where two rivers meet.",
      camp: "The Ashrun comes down from the west over a bar of grey stones and winds its brown water into the green of the Grey for a stretch before the two run as one. The road keeps to the bank, with flat ground beside it and the shingle running down to the water.",
      water: "the river",
      ford: true,
      info: "The road runs along the bank here, where the Ashrun comes down from the west and meets the Grey River. The two make one river, and the road runs alongside",
      here: "The river runs broad and slow beside the road, and the Ashrun comes in from the west over a bar of grey stones, its brown water running beside the clearer water of the Grey for a stretch before the two run as one. A track branches off up the Ashrun's bank into the trees, and a rougher road climbs away north-east across the middle country toward the Crossfield Road."
    },
    // The Ashrun Cutoff (the user, 2026-11-01): the middle of the road from Ashrun Mouth to the Crossfield Road, a tile of its own so the long road is not one straight line. Position read off the user's drawing; the prose is mine.
    ac: {
      name: "The Ashrun Cutoff", kind: "road", also: "hills", x: -0.61, y: -2.72,
      territory: "scales",
      danger: 2,
      climate: -1,
      walk: "The cutoff is a narrow carters' road over rough pasture and low, stony rises, its ruts half grown over where only a few wagons pass in a week.",
      camp: "A hollow behind a ragged hawthorn hedge keeps the wind off a small camp. There is a spring a short way down the slope, and the road is empty in both directions.",
      water: "a spring",
      info: "The middle of the cutoff, where the road from Ashrun Mouth crosses open country with no village for miles. Carters use it to save the long way round by the river or through Timbermouth.",
      here: "The road runs over open upland of rough grass and scattered thorn, with a stone marker leaning at a bend and no roof in sight. Ashrun Mouth lies a long walk south-west, and the Crossfield Road a long walk to the north-east.",
      hereNight: "The cutoff is a pale scar of road in the dark, with the thorn hedges standing black on either side and not a light anywhere.",
      hereStorm: "Rain drives across the open upland and runs down the ruts in brown streams. The hawthorn hedges give a little shelter, and the road ahead is a darker line in the weather."
    },
    ar1: {
      name: "The High Grey Road", kind: "road", x: 0.82, y: -0.66,
      territory: "scales",
      danger: 1,
      walk: "The old imperial paving runs across open cuttings between the eastern gate and the high ground, patched where the grain wagons have worn it down, with the Grey a distant grey line below the slope.",
      camp: "The wagons pull off the old paving onto a trampled verge where other lines have camped before, with a stone trough at its edge and the cuttings falling away toward the grey line of the Grey. The wind comes across open ground, and the lights of the city show faintly behind.",
      info: "The first stretch of the High Grey Road: old paving, repaired where the Scales' grain wagons have worn it down, leading north-east from the Charter Gate.",
      here: "The road runs north-east through open cuttings, its old paving patched with newer stone. The Grey shows far below between the folds of the land."
    },
    ar2: {
      name: "Greybank Rise", kind: "road", also: "hills", x: 0.32, y: -1.68,
      territory: "scales",
      danger: 2,
      climate: -1,
      walk: "The road runs along the long shoulder above the Grey. Low stone markers keep the wagons to the firm ground where the old paving has broken into packed gravel.",
      camp: "A low shelf above the river gives enough level ground for a small camp. The road lies open to the wind, but the Grey can be heard below and the stone markers keep the track clear by daylight.",
      water: "the Grey River",
      info: "A high stretch of the High Grey Road, where the old paving climbs above the Grey and the colder upland air begins.",
      here: "The road climbs above the Grey on a broad, stony shoulder. A worn track drops to a shingle inlet below, where the river is a dark line under the bank, and the wind has a colder edge than it did near Port Valen."
    },
    // Map connection only for now. Alderford's prologue scene is not a returnable town scene,
    // so overworld.txt deliberately has no "Go into Alderford" branch until its own town scene exists.
    af: {
      name: "Alderford", kind: "town", x: 0.88, y: -2.72,
      territory: "scales",
      danger: 1,
      climate: -1,
      walk: "The road tops the last of the high ground and runs on along the shoulder to a timber palisade, with the roar of the weir rising ahead.",
      depart: "The line pulls out from the carters' lot by the lower wharf lane, the oxen leaning into their yokes and the wagons groaning behind them, and climbs the steep street past the Factor's Hall to the palisade gate. The High Grey Road drops away south over the high ground, and the roar of the weir falls behind the tail wagon.",
      arrive: "The caravan labours up the last of the grade to the palisade gate and rolls down the steep street into Alderford, with the weir loud below and the mill smoke drifting across the road, and the wagons turn in at the carters' lot beside the Lower Wharf Market.",
      departVia: { cf: "The line pulls out from the carters' lot by the lower wharf lane, the oxen leaning into their yokes and the wagons groaning behind them, and climbs the steep street past the Factor's Hall to the palisade gate. The Crossfield Road runs away west over the open upland, and the roar of the weir falls behind the tail wagon." },
      arriveVia: { cf: "The caravan comes in off the upland road to the palisade gate and rolls down the steep street into Alderford, with the weir loud below and the mill smoke drifting across the road, and the wagons turn in at the carters' lot beside the Lower Wharf Market." },
      walkVia: { cf: "The upland road dips toward the Grey, and the sound of the weir comes up to meet it. The palisade of Alderford shows ahead above the slope, with the mill smoke leaning over it." },
      info: "A river town at the old imperial limestone weir, thirty miles up the Grey from Port Valen. The High Grey Road reaches it from the south over the high ground.",
      here: "Alderford stands ahead around the old limestone weir, with timber wharves below the falls and sawmill roofs and smoke climbing the bank above them.",
      hereNight: "Alderford's wharf lamps shine below the dark line of the weir, while the town's smoke and rooflines fade into the cold above the river.",
      hereStorm: "Spray rises from the weir and the road has turned slick with rain. Alderford's wharves and mill roofs show only in brief, pale intervals through the weather."
    },
    cf: {
      name: "The Crossfield Road", kind: "road", also: "hills", x: -0.25, y: -3.72,
      territory: "scales",
      danger: 2,
      climate: -1,
      walk: "The Crossfield Road runs over open upland between hedged fields and low stony rises. Its packed surface is deeply rutted by timber wagons going east and grain carts going west, with no settlement close enough to shelter either line.",
      camp: "A broad verge beside an old stone field wall gives a wagon line room to pull off the road. There is no wood nearby, but a shallow ditch holds enough rainwater for animals after wet weather.",
      info: "The cross-country road between Alderford and Timbermouth. It runs ten miles east to the weir town and eight miles north-west to Barleycross, carrying seasoned ash, charcoal and wagon parts toward Alderford, and salt, ironwork, cured fish and cloth back toward the forest country. A rougher road runs seven miles south-west to the Ashrun Cutoff and on to Ashrun Mouth.",
      here: "The road crosses open upland between low field walls and patches of rough pasture. Wheel ruts run hard and deep through the pale soil, with Alderford's hills behind one way and the farm country rising toward the other.",
      hereNight: "The Crossfield Road is a pair of dark ruts between low walls and empty fields. Far off, a window or a cart lantern shows briefly and is gone behind a fold of ground.",
      hereStorm: "Rain sweeps unchecked across the upland and fills the road ruts to their rims. The field walls offer little shelter, and the track is only a darker line through the weather."
    },
    rv: {
      name: "Redvein", kind: "village", also: "hills", x: 1.1, y: -3.62,
      territory: "scales",
      danger: 2,
      climate: -1,
      walk: "The Eastcut Road climbs the broken southern foot of the Coldspine, where red spoil has been tipped along the slopes. Low stone markers keep the wagons to firmer ground above the drop toward the Grey.",
      camp: "A shelf below an old spoil heap gives enough level ground for a small camp. The hills are open to the wind, but a low wall of waste stone breaks it on the road side.",
      depart: "The wagons pull out from Redvein's scale yard, turn onto the Eastcut Road and begin the long descent toward Alderford, their empty beds rattling over the stone.",
      arrive: "The road climbs through the last red cut in the foothills before Redvein's cottages and pit sheds come into view above the wagons.",
      info: "A mining village on the cold southern foot of the Coldspine, eight miles from Alderford. Red iron ore and lead-bearing stone go south by wagon to the town's iron yard; food, tools and timber props come back up the Eastcut Road.",
      here: "Low stone cottages stand among red spoil heaps on the broken southern foot of the Coldspine. Beyond them, the dark mouths of the Eastcut lie under timber shelters, and a wagon road drops south toward the Grey.",
      hereNight: "A few lamps burn in Redvein's low windows. One steady light marks the pit yard, while the red spoil heaps are only darker shapes against the hillside.",
      hereStorm: "Rain or snow sweeps across the exposed hillside. Redvein's cottages huddle below the pit sheds, and the road has become a dark, slick cut between the heaps."
    },
    // Map connection only for now. Whitefold's village scenes will be built in a later pass.
    wf: {
      name: "Whitefold", kind: "village", also: "hills", x: 2.54, y: -3.56,
      territory: "scales",
      danger: 1,
      climate: -2,
      info: "A limestone and sheep village on the southern foot of the Coldspine. Quarry stone, lime and upland wool travel south by cart through Limestone Cut; grain, salt and finished goods come back from Alderford.",
      here: "Pale quarry faces rise behind a scatter of stone roofs and sheep folds. Covered stone yards and low lime kilns sit against the foothills, while carts wait on the hard ground below.",
      hereNight: "A few lamps burn among Whitefold's stone roofs, and the lime kilns show as dull red points beneath the black mass of the Coldspine.",
      hereStorm: "Rain or snow has washed the quarry faces pale and turned the yards to slurry. Whitefold's roofs and sheep folds huddle at the foot of the dark range."
    },
    // Map-only wilderness node. The ravines run into the southern face of the Coldspine and end there; they are not a route through the range.
    sj: {
      name: "The Splitjaw Ravines", kind: "hills", x: 2.68, y: -2.85,
      territory: "scales",
      danger: 3,
      patrol: 0,
      climate: -2,
      walk: "A goat path leaves Whitefold's outer pasture and climbs between split limestone walls. It soon breaks into loose shale, thorn and narrow gullies where a cart could never pass and a person must pick each foothold.",
      camp: "A shallow shelf below an overhang gives a little cover from the wind. Loose shale lies thick beneath it, and the gullies leave no clear view beyond the nearest bend.",
      info: "A dead-end maze of limestone gullies, loose shale and old prospect cuts in the lower southern face of the Coldspine, four difficult miles from Whitefold. The ravines narrow into scree and broken stone beneath the range; they do not cross it.",
      here: "Broken limestone walls rise close around a floor of shale and thorn. Old prospect cuts disappear into the gullies, and the path from Whitefold is already hard to pick out behind you.",
      hereNight: "The ravines hold the darkness long before the open ground does. Water ticks from the stone, and loose shale shifts somewhere beyond the nearest bend.",
      hereStorm: "Rain runs white over the limestone and gathers beneath the shale. The gullies are slick, loud with water and almost impossible to read."
    },
    lc: {
      name: "Limestone Cut", kind: "road", also: "hills", x: 1.73, y: -2.50,
      territory: "scales",
      danger: 1,
      climate: -1,
      walk: "The road crosses a narrow cut through pale limestone under the foot of the Coldspine's eastern spur, where an old cart track from the grain country joins the toll road between Alderford and the Black Sinks.",
      camp: "A level patch of rough grass lies behind a low limestone bank beside the junction. A stone trough holds rainwater, and the cut gives a little shelter from the open hills.",
      info: "A road junction on the last dry high ground before the Black Sinks. The toll road runs seven miles west to Alderford and seven miles east to the gatehouse; cart roads go south to Marlcross and north into the Coldspine foothills. The narrow gap between the spur and the marsh is the only practical wagon route east.",
      here: "Pale walls of cut limestone rise on either side of the road junction. A weathered marker points west toward Alderford, east toward the Black Sinks, north toward the grain country and north-east toward the foothills. The ground falls away into wetter, reed-filled country beyond the eastern road.",
      hereNight: "The cut is dark between its pale stone walls. A single road marker catches the starlight, while the three tracks disappear into the hills and low ground beyond.",
      hereStorm: "Rain runs down the limestone walls and gathers in the wheel ruts at the junction. The road marker is blurred by the weather, and the eastern track vanishes into driven mist."
    },
    bs: {
      name: "Black Sinks Gatehouse", kind: "fort", x: 2.58, y: -2.28,
      territory: "scales",
      danger: 0,
      climate: -1,
      walk: "The toll road leaves the last low spur of the Coldspine for a raised strip of old stone, with black water and dead reeds spreading away on both sides toward the gatehouse.",
      depart: "The gate opens after the last wagon has been checked, and the road rises away from the marsh toward Alderford between the drainage ditches.",
      arrive: "The old stone gatehouse stands ahead behind a new timber palisade, its open gate facing the narrow causeway and the road from Alderford.",
      info: "A Gilded Scales border fort at the eastern end of the Black Sinks Causeway, fourteen miles east-southeast of Alderford. Here the last low spur of the Coldspine meets the marsh, pinching all wagon traffic into one raised road. Scales militia check cargo, toll papers and wagons before they pass to the eastern border tracks.",
      here: "The old stone gatehouse stands inside a new timber palisade where the last low spur of the Coldspine ends above the black water and dead reeds. A pair of raised barriers divide the road into narrow wagon lanes, and the Scales' black-and-gold banner hangs above the open gate.",
      hereNight: "Lanterns burn over the gatehouse lanes and along the palisade. Beyond them, the Black Sinks are a flat darkness broken only by the pale line of the causeway.",
      hereStorm: "Rain drives across the raised stone and the marsh beyond it. The gatehouse barriers are down, and the lamps over the wagon lanes show only as blurred yellow patches."
    },
    // Road-connected village tiles only. Their future place scenes are deliberately not built yet.
    bw: {
      name: "Brinewick", kind: "village", x: -1.58, y: -0.42,
      territory: "scales",
      danger: 1,
      info: "A low salt-working village on the western tidal flats. Peat-fired brine sheds and drying racks supply Valen's curing trade; grain comes from the raised fields inland.",
      here: "Low sheds and chimney stacks stand among the ditches of the tidal flats. White salt crusts the pan walls, and peat smoke lies close over the reeds.",
      hereNight: "Brinewick's furnace windows burn low beyond the reed beds, with salt smoke and the tide's slow wash carrying through the dark.",
      hereStorm: "The flats have disappeared under driven rain and tidewater. Brinewick's sheds stand dark and low behind their earthen banks."
    },
    mc: {
      name: "Marlcross", kind: "village", x: 1.72, y: -1.18,
      territory: "scales",
      danger: 1,
      info: "A rye-and-milling village on the eastern high ground: the surrounding high fields feed its Grain Green, windmill, drying floors, and raised stores before the harvest goes on toward Port Valen.",
      here: "Rye runs over the gentler slopes around a windmill, threshing sheds, and raised grain stores. Pale marl shows in the banks where the farm tracks have cut through the soil.",
      hereNight: "Marlcross is a few square windows beyond the dark rye fields, with the mill's sails still against the stars and a dog barking from the grain sheds.",
      hereStorm: "Rain flattens the rye and turns the farm tracks through Marlcross to pale, clinging mud. The mill has its sails furled and every storehouse door shut."
    },
    r3: {
      name: "Longshade Edge", kind: "woodroad", also: "hills", x: -1.67, y: -2.5,
      territory: "scales",
      danger: 2,
      walk: "The road runs through wooded hills, climbing or falling in long slow steps. The paving is broken stone, and the stone gives way to packed earth with a rut down either side, with the forest close on the far side, dark and near.",
      climate: -1,
      info: "The road climbs through wooded hills along the edge of the Longshade, with wagon tracks turning off into the trees.",
      here: "The road climbs between wooded slopes, its paving broken and patched, with the forest standing close on its far side, dark under its trees, and wagon tracks turning off into it."
    },
    // Map connection only for now. This is dense interior forest, not a settlement or a road junction.
    lf: {
      name: "The Longshade", kind: "forest", x: -2.86, y: -2.76,
      territory: "scales",
      danger: 3,
      climate: -1,
      water: "a forest spring",
      walk: "The forest closes around you in ash, pine and thorn. There is no maintained way through it: only animal runs, old cuts in the undergrowth and brief stretches of firmer ground before the trees swallow them again.",
      camp: "A dry hollow beside a cold spring gives enough room for a small camp, though the trees crowd close beyond it. Wet deadfall is plentiful; sound does not carry far here.",
      info: "The thick interior of the Longshade, six miles from Timbermouth, Ashrun Holt and Longshade Edge by difficult overland travel. No road crosses this ground, and most people have no reason to enter it beyond the nearest trees.",
      here: "Tall ash and pine stand close enough to make a dim roof overhead, with thorn and fallen limbs thick between their trunks. A cold spring runs through a moss-lined hollow before disappearing under the roots.",
      hereNight: "The Longshade is black beneath its canopy. Branches close over the little starlight above, and the spring is heard before it is seen among the trees.",
      hereStorm: "Rain rattles through the high branches and turns the leaf mould black with water. The trees fade into the moving grey, and the spring has spilled across the hollow."
    },
    tm: {
      name: "Timbermouth", kind: "town", x: -2.0, y: -3.46,
      territory: "scales",
      danger: 1,
      depart: "The line pulls out from the road end past the squat stone watch post, the oxen leaning into their yokes and the wagons groaning behind them, and the clearing falls away behind the tail wagon as the road enters the trees.",
      departVia: { le: "The line pulls out from the wagon lot beside the Market, the oxen leaning into their yokes and the wagons groaning behind them, and takes the narrow northern road out of the clearing between the last stacked ranks of ash and the first thorn. The sawmill's whine falls away behind the tail wagon, and the trees close in on both sides.", fv: "The line pulls out from the wagon lot beside the Market, the oxen leaning into their yokes and the wagons groaning behind them, and turns off the main street onto the farm road, past the last stacked ranks of ash. The sawmill's whine falls away behind the tail wagon, and the hedged fields of the farm country open ahead." },
      walkVia: { le: "The narrow road runs down between close ash and thorn, and then the trees thin and the long clearing opens ahead, with smoke over it and the whine of the saw frame carrying up the road.", fv: "The farm road runs down between hedges and ditches, and then the fields give way to stacked ash and the long clearing opens ahead, with smoke over it and the whine of the saw frame carrying up the road." },
      walk: "The road runs down out of the hills and the forest closes in on both sides, and then the trees thin and the sky opens, and the road runs straight into a long clearing with smoke over it.",
      arrive: "The caravan comes down off the last of the hill into the clearing at the road's end, where a squat stone watch post stands beside the road and the roofs of Timbermouth rise beyond it.",
      arriveVia: { le: "The caravan comes down the narrow northern road through ash and thorn into the clearing, with the sawmill's whine rising ahead, and the wagons turn in at the wagon lot beside the Market.", fv: "The caravan comes in along the farm road from Barleycross, between the stacked ranks of ash and the first shingled roofs, with the saw frame's thin whine rising ahead, and the wagons turn in at the wagon lot beside the Market." },
      info: "A road town at the mouth of the Longshade, up from the Grey River, where three smaller roads meet the road from the river.",
      here: "The road comes out of the trees onto cleared ground, and Timbermouth lies ahead at the mouth of the forest: grey shingled roofs, long ranks of stacked ash on the near side, and a thread of smoke over the sawmill. The thin whine of the saw frame carries up the road, and the smell of cut pine comes with it.",
      hereNight: "Timbermouth is a low scatter of lamplight at the mouth of the forest. A single lantern burns at the road end, and the stacked ash behind it is only a darker dark. The saw frame is silent, and the smell of cut pine hangs in the cold air.",
      hereStorm: "Timbermouth stands ahead with its shutters closed and its shed roofs streaming, and the saw frame is still. A lantern swings at the road end, throwing a little yellow light across the wet paving."
    },
    // The two satellite villages (quest/TIMBERMOUTH_PLAN.md section 4), added 2026-10-07 as map tiles only: no place scenes yet, so there is no way into either from the road until they are built.
    // Names are provisional and invented. A village is smaller than a town: no camping on it (it has its own barns and roofs), and its own entry option comes with its scene.
    fv: {
      name: "Barleycross", kind: "village", x: -1.36, y: -4.06,
      territory: "scales",
      danger: 1,
      walk: "The road runs between low hedged fields of barley and oats, with a ditch on either side, and the sails of a grain mill turn slowly ahead where the farm roads meet.",
      camp: "A farmer's headland beside the road, trampled by earlier lines and ringed by hedge, with a stone trough at the gate. The mill stands dark against the sky, and the village keeps its dogs close and its gates shut.",
      info: "A farming village at a crossing of farm roads, six miles from Timbermouth. It feeds the town: barley, oats, root vegetables, hay, milk, eggs, pigs and poultry, and it raises mules and working horses.",
      here: "Low fields of barley and oats spread out on either side of the road, divided by hedges and ditches, and a cluster of thatched and shingled roofs stands at the crossing ahead, with the sails of a grain mill turning slowly beyond them. The air smells of cut hay and manure.",
      hereNight: "Barleycross is a few lit windows in the dark of the fields, with a dog barking somewhere among the farms and the smell of hay on the cold air.",
      hereStorm: "Barleycross lies low under the rain, the fields flat and sodden on either side of the road and every shutter closed against the wind."
    },
    fo: {
      name: "Ashrun Holt", kind: "village", x: -2.94, y: -3.9,
      territory: "scales",
      danger: 2,
      water: "the Ashrun",
      info: "A forest village in a clearing where the Ashrun runs out from under the trees, nine miles from Timbermouth. It lives by the Longshade: cutters, sawyers and charcoal burners.",
      here: "The road narrows to a track between the trunks, and the village opens in a clearing where the Ashrun comes down out of the trees: low log houses with bark roofs, logs stacked in long ranks, and blue charcoal smoke hanging under the canopy. The air smells of resin and wet bark, and the sound of axes carries from somewhere deeper in.",
      hereNight: "Ashrun Holt is a handful of red windows in the dark under the trees, with a charcoal burner's fire glowing low beyond the last house and the Ashrun loud in the silence.",
      hereStorm: "The forest roars over the village, and the Ashrun is brown and loud in its bed. Every house is shut, and the bark roofs steam under the rain."
    },
    // Stonewatch (2026-10-11, the user picked the name): the fort in the gap of the Coldspine, due north of the Crossfield Road, where the one wagon road to the Highlands passes under its walls. Map tile only for now.
    // Everything in its text is invented to fit the Black Sinks gatehouse beside it in kind (a Scales border fort, militia, a toll check); the Highlands beyond are not on the map yet.
    sw: {
      name: "Stonewatch", kind: "fort", x: 0.01, y: -4.52,
      territory: "scales",
      danger: 1,
      climate: -1,
      walk: "The road leaves the farm country and climbs between stony slopes, where the trees give way to scree and the wind has an edge, toward a dark wall of stone across the way.",
      depart: "The gate opens once the last wagon has been counted, and the road drops from the pass between the scree slopes toward the farm country and the Crossfield Road.",
      arrive: "The road climbs the last switchbacks to the gap, and Stonewatch stands across it: a grey stone fort built across the width of the road, its gate open and its walls running up the slopes on either side.",
      info: "A Gilded Scales fort built across the one gap in the Coldspine that wagons can use, ten miles north of the Crossfield Road. Everything that travels between the Highlands and the lowlands passes under its walls, and Scales militia check cargo, toll papers and travellers before they let it through.",
      here: "A grey stone fort stands across the gap, its walls running up the scree slopes on either side until the mountain itself closes them in. The road passes through a single gate with a barrier across it, and the Scales' black-and-gold banner hangs over the wall above.",
      hereNight: "Torches burn along the wall walks and over the gate, and the pass beyond is a black wedge between the slopes. The wind comes down off the high ground with the cold of snow in it.",
      hereStorm: "Rain or sleet drives down the pass and rattles on the fort's walls. The gate is shut, the barrier is down, and the torches over it gutter in the wind."
    },
    // The forest round Ashrun Holt (2026-10-11, the user's sketch), renamed 2026-10-14: West Longshade is plain pathless forest west of the village (a stony feeder brook runs through it); Upper Longshade, to the north under the first slopes of the Coldspine, is where
    // the Ashrun rises; and Northeast Longshade is where the timber road from Timbermouth enters the trees. The last two are "woodroad" tiles (a rutted road with the trees close on both sides), joined to each other and to Timbermouth by road; everything else
    // here is joined by pathless ways. The ids (ua, ln, le) are saved in the player's state and kept from the earlier names. The Old Ash and the Charcoal Camp are inside the village's own clearing, so they are not here.
    ua: {
      name: "West Longshade", kind: "forest", x: -3.81, y: -3.9,
      territory: "scales",
      danger: 3,
      climate: -1,
      water: "a feeder brook",
      walk: "The ground lifts and the trees close in, and there is no path: the way keeps to a stony brook, picking a line over wet roots and along its gravel bars.",
      camp: "A gravel bar under an overhang of ash roots gives flat, dry ground a few steps from the water. The brook is loud enough to cover any sound, including your own.",
      info: "Thick forest west of Ashrun Holt, cut by a stony feeder brook of the Ashrun. There is no road, only the gravel bars and the hunters' blazes cut into the bark.",
      here: "A brook runs shallow and loud over grey stones between banks of moss and root, with the forest crowding close on both sides. A few trunks carry old blazes cut at the height of a man's shoulder, nearly healed over.",
      hereNight: "The brook is the only sound under the trees, and the dark between the trunks is complete. The pale gravel bars show faintly where the water has worn them.",
      hereStorm: "Rain drives down through the branches and the brook runs brown and fast over its stones, loud enough to drown the wind. Every bar of gravel is under water."
    },
    ln: {
      name: "Upper Longshade", kind: "woodroad", x: -3.0, y: -4.66,
      territory: "scales",
      danger: 2,
      climate: -1,
      water: "the Ashrun",
      walk: "The road climbs out of the lower forest on packed earth and root, rutted by timber sledges, with the Ashrun heard before it is seen: a cold, fast stream coming down from the foothills beside the way.",
      camp: "A flat shelf above the road where a timber sledge has turned, with dry ground under an ash and the young Ashrun running cold a few steps below.",
      info: "The upper end of the Longshade, where the Ashrun rises in springs under the first slopes of the Coldspine. A rutted timber road runs through it, with the trees close on both sides.",
      here: "A rutted timber road runs through tall ash and pine, the trees close on both sides and the young Ashrun showing in the gaps, small and fast and cold from its springs. Above the crowns the first grey slope of the Coldspine shows.",
      hereNight: "The road is a pale rut between black trunks, and the stream beside it is the only sound. Cold air comes down off the slopes.",
      hereStorm: "Rain drums down through the branches and the road is a trough of brown water. The young Ashrun runs loud and swollen beside it."
    },
    le: {
      name: "Northeast Longshade", kind: "woodroad", x: -2.2, y: -4.25,
      territory: "scales",
      danger: 2,
      climate: -1,
      walk: "A narrow road leaves the Timbermouth clearing and runs north between close ash and thorn, packed earth underfoot and old corduroy of split logs where the ground is wet.",
      camp: "A level patch among the roots of a fallen pine, screened by thorn on every side. Sound does not carry far here.",
      info: "A forest road north of Timbermouth, past the Barleycross fields where the farmland gives out. It runs on through close trees toward the upper end of the Longshade.",
      here: "A narrow road of packed earth runs through ash and thorn, the trees close on both sides and the light coming down green and dim. Old ruts hold standing water, and fallen limbs lie at the verges, furred with moss.",
      hereNight: "The trees close out the stars, and the road is a faint pale line between black walls. The forest is a dark held in by sound: the creak of limbs, the drip of water, the slow rustle of leaves.",
      hereStorm: "Wind drives through the crowns and rain follows it, drumming down through the branches. The ruts fill and run, and the road is a shallow stream between the trees."
    },
    // Fellgate (2026-10-29, the user's sketch and name): the Scales' border fort at the western end of the Longshade, where the forest runs up against the foot of the Coldspine. Map tile only for now (the user will make its picture; no scene).
    // It is the frontier post against the lowland lordship to the west; the user's call is that the place and its siting say why it is there, so no text names that neighbour. The text is invented to match Stonewatch and the Black Sinks gatehouse in kind.
    fg: {
      name: "Fellgate", kind: "fort", x: -4.0, y: -4.7,
      territory: "scales",
      danger: 1,
      climate: -1,
      walk: "The timber road leaves the upper forest and climbs west along the foot of the mountain, with the ash and pine thinning on the left hand and bare grey slope rising on the right, toward a dark wall of stone across the way.",
      depart: "The gate opens once the last wagon has been counted, and the timber road runs back east between the mountain's foot and the trees toward Upper Longshade.",
      arrive: "The road comes out of the last of the trees, and Fellgate stands ahead where forest and mountain meet: a grey stone fort across the way, its gate open, its walls running down into the trees on one side and up the scree on the other.",
      info: "A Gilded Scales fort at the western end of the Longshade, where the forest runs up against the foot of the Coldspine and the only ground a wagon can use is a narrow strip between trees and stone. The timber road ends under its walls, and Scales militia hold the gate and check travellers before they go on west.",
      here: "A grey stone fort stands across the narrow strip between the forest and the mountain, its walls running down into the trees on one side and up the scree on the other. The gate faces west, a barrier lies across the road beneath it, and the Scales' black-and-gold banner hangs above the wall.",
      hereNight: "Torches burn along the wall walks and over the gate. The forest behind the fort is a black mass, and the mountain above it is a darker dark against the stars.",
      hereStorm: "Rain drives in under the trees and sheets down the scree. The gate is shut, the barrier is down, and the torches over it gutter in the wind."
    },
    // The Deep Longshade (2026-10-29, the user's sketch): the way to Flùràlainn's Grove (dungeon room lsf_r15). It is HIDDEN, not just locked, until Bark's quest is done (lsf_dubhar_dead), so nothing on the map hints at the
    // grove before then: see requires above. Its ways are timed from the dungeon, ten minutes a step: nine steps from the south mouth (The Longshade) and sixteen from the east mouth (West Longshade), so 2 and 3 miles of pathless forest.
    dl: {
      name: "Deep Longshade", kind: "forest", x: -3.9, y: -2.6,
      requires: "lsf_dubhar_dead",
      territory: "scales",
      danger: 2,
      climate: -1,
      water: "a clear stream",
      walk: "The way follows deer runs and the low places between great roots, over moss and leaf mould, under trunks that two people together could not reach round.",
      camp: "A hollow among the roots of an old ash, floored with dry leaf mould and screened by ferns, with a clear stream running a few steps away.",
      info: "The oldest part of the Longshade, where the trees stand wide apart and the canopy closes high overhead. A clear stream runs through it to Flùràlainn's Grove.",
      here: "The oldest trees stand wide apart here, their trunks broad as cottage walls and their crowns closed overhead into one green roof. Moss and leaf mould cover the ground, and a clear stream runs between the roots.",
      hereNight: "The deep wood is black and still beneath the old crowns. The stream is heard running over its stones, and now and then a pale light drifts between the trunks and goes out.",
      hereStorm: "Rain runs down the great trunks in sheets and drips through the high crowns. The stream has risen and talks loudly among the roots."
    },
    // Roi's Grove (2026-10-30, the user's sketch): a forest tile south-west of Langston, joined to the town and to Western Vale Road by seldom-used dirt tracks. It is HIDDEN until the visit to Tomlin is done
    // (wol_chapter_2_complete), the same way the Deep Longshade is hidden: see requires above. Map tile and tracks only; no scene yet. Position and lengths are read off the sketch at about six miles to a grid unit. The
    // prose is invented to that sketch and says nothing about what stands in the grove.
    rg: {
      name: "Roi's Grove", kind: "forest", x: -6.43, y: -5.57,
      requires: "wol_chapter_2_complete",
      territory: "gault",
      danger: 0,
      climate: -1,
      water: "a stream",
      walk: "The track is two ruts and a strip of grass, hardly more than a farm lane, and it narrows to a footpath where the trees close in.",
      camp: "A patch of level ground beside the track under old trees, with leaf litter underfoot and a stream within earshot.",
      info: "A grove of old trees south-west of Langston, off the Western Vale's wagon road. Seldom-used dirt tracks run to it from the town and from Western Vale Road.",
      here: "Old trees stand close around a patch of open ground, and the seldom-used track runs out between them. The air smells of leaf litter and wet bark, and the vale's fields lie out of sight behind the trunks.",
      hereNight: "The grove is dark under its trees. Leaves move overhead, a stream runs somewhere nearby, and the track is only a paler strip between the trunks.",
      hereStorm: "Rain hammers the canopy and drips through in heavy drops. The ruts of the track have filled with water, and the trunks creak in the wind."
    },
    // Westwood (2026-10-31, the user's call: west of Langston, because they want the north kept free for later plans): the woodland the mayor circles on her map in Chapter 4, with the nymph's clearing and the bandit camp inside it. HIDDEN until the
    // mayor hands over the map (wol_ch4_map_given), like Roi's Grove. The name is a plain working title (the nymph is only a passing meeting, so nothing on the tile names her). The position (about six miles from the town) and the prose are invented.
    ww: {
      name: "Westwood", kind: "forest", x: -6.95, y: -6.45,
      requires: "wol_ch4_map_given",
      territory: "gault",
      danger: 1,
      climate: -1,
      water: "a stream",
      walk: "The forest paths leave the farm fields as a footpath between hedgerow oaks, then wind among old trunks where the last of the farm tracks give out.",
      camp: "A level spot between two broad roots, with dry leaf litter underfoot and a stream within earshot.",
      info: "A stretch of woodland west of Langston, past the last farm fields. Foot paths run in from the town, and the mayor has marked a patch of it on a map.",
      here: "Old oaks and ash stand around a footpath that runs west from the fields. Leaves move overhead, and a stream runs somewhere off through the trunks.",
      hereNight: "The wood is dark under its crowns. Water runs somewhere nearby, small things move in the leaf litter, and the footpath is a paler line between the trunks.",
      hereStorm: "Rain hammers through the leaves and drips off every branch. The footpath has turned to mud, and the trunks creak in the wind."
    },
    // The Western Vale (2026-10-29, the user's sketch): the road west out of Fellgate leaves the Valen Reach and crosses into House Gault's country, a level land of grass and tilled fields. Western Vale Road is the one road tile between the
    // fort and Langston, and Langston is a walled market town. Both are invented here to the sketch (the 8-mile lengths are the user's sketch at about six miles to a grid unit, the text matches the plan's Chapter 1 road and town). Map tiles only: the
    // town's entry button is not wired yet (Langston/langston.txt lg_arrive is the label it will enter at).
    wv: {
      name: "Western Vale Road", kind: "road", x: -5.26, y: -5.4,
      territory: "gault",
      danger: 1,
      climate: -1,
      walk: "West of the fort the way drops out of the foothills onto a maintained wagon road of chalk and packed earth, running straight across open grassland between hedgerows and the margins of tilled fields.",
      camp: "A wide verge where wagons pull off beside a field gate, with a hedgerow on the windward side and a ditch of clear water along the road.",
      water: "a roadside ditch",
      info: "The wagon road across the Western Vale, kept up by House Gault: chalk and earth, hedged on both sides, with grassland and fields to the horizon. It runs from the foot of the Coldspine, past Fellgate's western gate, to Langston.",
      here: "A chalk-and-earth wagon road runs west across level grassland, hedged on both sides, with tilled fields beyond the hedges and the old forest a dark line far to the south. The Coldspine stands behind you.",
      hereNight: "The pale road runs on between black hedgerows under a wide sky. The fields are quiet, and far ahead a few lights mark a town.",
      hereStorm: "Rain sweeps across the open grass and the chalk road turns to slick white mud. The hedgerows toss, and the level ground lies open to the wind."
    },
    lg: {
      name: "Langston", kind: "town", x: -6.0, y: -6.47,
      territory: "gault",
      danger: 0,
      climate: -1,
      depart: "The militia wave the line through the gate, and the wagons rattle out over the cobbles onto the chalk road, turning east toward the foot of the mountains.",
      arrive: "The road runs on across the fields to a low stone wall, where the gate stands open and town militia keep the arch. Behind the wall, close-set timber houses climb toward a chapel tower.",
      info: "A prosperous walled market town in House Gault's Western Vale, among open grassland and fertile fields, with the old forest along the southern horizon. Hemp, wool, wine and horses come in on its wagon road.",
      here: "Langston's low stone wall stands across the fields, its gate open to the wagon road. Timber houses crowd behind it, and a stone chapel tower rises above their steep roofs.",
      hereNight: "Lamps burn at the gate and along the cobbled street behind it, and the town's walls are a dark line against the stars. Two militia keep the arch.",
      hereStorm: "Rain streams off the steep roofs and the gate is crowded with wagons waiting under the arch. The chapel tower is a grey shape in the squall."
    },
    // PLACEHOLDERS north and north-west of Langston (the user, 2026-11-01): a road tile and a village tile, positions read off the user's drawing (grey circle = the road, olive circle = the village). The names and the prose are mine and
    // are stand-ins, to be renamed and written when these places are built; nothing is built there yet, so each is a map connection only (no "Go into" branch in overworld.txt).
    nw: {
      name: "The Northwest Road", kind: "road", x: -7.08, y: -7.2,
      territory: "gault",
      danger: 2,
      climate: -1,
      walk: "The road leaves Langston's fields and runs north-west over rough grassland, a narrow carters' way kept up by House Gault's levy and little used beyond the town.",
      camp: "A flat shoulder of grass beside a field wall gives room for a small camp, with the road empty in both directions.",
      info: "A road leaving Langston to the north-west, over open grassland. Few travellers use it, and little is known of where it leads.",
      here: "The road runs over open grassland between low stone walls, with Langston behind and nothing ahead but the long line of the grass.",
      hereNight: "The road is a pale line between dark walls, and Langston's lamps have sunk out of sight behind the rise.",
      hereStorm: "Rain sweeps over the open grassland and the road runs with water between its walls. There is no shelter in sight."
    },
    nv: {
      name: "Barolo", kind: "village", x: -6.29, y: -7.55,
      territory: "gault",
      danger: 1,
      climate: -1,
      walk: "The track climbs north out of Langston's fields onto a low pale hill, where hedged lanes run between orchards and the first rows of vines.",
      info: "A vineyard village north of Langston, on one of the Vale's few real slopes. Its wine is sold in small casks in Langston's market.",
      here: "Rows of vines run down a sunny pale hillside around the village roofs, with orchards, hedges and beehives between them. The open Vale spreads away below, dotted with the roofs of country manors.",
      hereNight: "A few window lamps show among the dark rows of vines, and the air smells of crushed grapes and cool earth.",
      hereStorm: "Rain drives across the slope and runs off the village roofs. The vine rows stream with water, the lanes between the hedges are small brooks, and every door is shut."
    },
    // Two more villages north-west of the road tile (the user, 2026-11-01, two gold circles), joined to it and to each other as drawn. The first is Broadmead (2026-11-02, the former placeholder Thornby; the user's pick, the village is in Langston/broadmead/broadmead.txt); the second is Fallowmere, which the user turned into a generic farming village (2026-11-02, the Barleycross and Marlcross model: mixed arable that feeds Langston) and which has no places or board yet.
    bm: {
      name: "Broadmead", kind: "village", x: -7.79, y: -8.56,
      territory: "gault",
      danger: 1,
      climate: -1,
      walk: "The road climbs north-west over rough grazing, then a pasture lane turns off between stone walls and drops toward a broad, damp meadow.",
      info: "A village of shepherds and horse-keepers on a broad river meadow, far out on Langston's north-western road. Its wool and cheese reach Langston's market, and some of the Countess's horses are said to be raised there.",
      here: "A stream winds through a broad damp meadow below a long bare down. Thatched and slate roofs line a rutted lane beside the water, and fences of every age divide the grass.",
      hereNight: "A few window lamps show along the lane, and the long down is a black line against the stars. Somewhere in the dark the stream murmurs over stones.",
      hereStorm: "Rain sweeps off the down and the lane runs brown with water. The sheep have crowded against the lee of the walls, and every door is shut."
    },
    fm: {
      name: "Fallowmere", kind: "village", x: -8.4, y: -7.27,
      territory: "gault",
      danger: 1,
      climate: -1,
      walk: "The road runs west across level farmland, between hedged strips of wheat, barley and beans, toward a cluster of roofs round a village pond.",
      info: "A farming village on the western edge of Langston's farmland. Its wheat, barley, beans and vegetables go to Langston's market, and its carts are on the road most mornings.",
      here: "Hedged strips of wheat, barley and beans run out from a cluster of thatched roofs round a village pond, where geese pick along the bank. Haystacks and kitchen gardens stand among the houses, and a cart or two waits in the lane.",
      hereNight: "A few lit windows show round the dark pond, and a dog barks from a farmyard. The fields lie quiet, and the air smells of hay and cold water.",
      hereStorm: "Rain beats on the strips and fills the ruts in the lane. The pond is dimpled and brown, the geese have gone, and every shutter is closed."
    }
  };

  // Each way between two tiles, in miles. Every way works both directions.
  var EDGES = [
    ["pv", "r1", 10],
    ["r1", "r2", 10],
    ["pv", "ar1", 10],
    ["ar1", "ar2", 10],
    ["ar2", "af", 10],
    ["r1", "bw", 6],
    ["ar1", "mc", 6],
    ["af", "cf", 10],
    ["cf", "sw", 10],
    ["cf", "fv", 8],
    ["af", "rv", 8],
    ["rv", "wf", 9],
    ["af", "lc", 7],
    ["lc", "wf", 8],
    // The Splitjaw is a dead-end mountain approach, not a road and not a pass through the Coldspine.
    ["wf", "sj", 4, "overland"],
    ["lc", "bs", 7],
    ["mc", "lc", 10],
    ["r2", "r3", 10],
    // The Ashrun Cutoff (the user, 2026-11-01): a road from Ashrun Mouth north-east across the middle of the map to the Crossfield Road, so the centre is not empty. 14 miles in all, my number from the drawn length, in two halves of seven round a tile at the middle (the user drew a circular node there).
    ["r2", "ac", 7],
    ["ac", "cf", 7],
    // Forest links are map travel connections, not roads or maintained tracks: overland, twice the time a road mile takes.
    ["r3", "lf", 6, "overland"],
    ["lf", "tm", 6, "overland"],
    ["lf", "fo", 6, "overland"],
    ["r3", "tm", 10],
    ["tm", "fv", 6],
    ["tm", "fo", 9],
    // The forest round Ashrun Holt (the user's sketch): the village to each of three tiles, West Longshade to Upper Longshade, and West Longshade back to the Longshade, all pathless; the timber road below is the exception.
    ["fo", "ua", 6, "overland"],
    ["fo", "ln", 5, "overland"],
    ["fo", "le", 5, "overland"],
    ["ua", "ln", 7, "overland"],
    // The timber road: Timbermouth to Northeast Longshade to Upper Longshade (both woodroad tiles), a real road, not pathless.
    ["tm", "le", 5],
    ["ln", "le", 5],
    ["ua", "lf", 10, "overland"],
    // Fellgate: the timber road runs on west from Upper Longshade to the fort (a real road, so it can be supplied); West Longshade to the fort is pathless forest.
    ["fg", "ln", 6],
    ["fg", "ua", 5, "overland"],
    // The Deep Longshade (hidden until its quest is done): two and three miles of pathless forest, from the dungeon's own step counts to the grove.
    ["dl", "lf", 2, "overland"],
    ["dl", "ua", 3, "overland"],
    // The Western Vale (the user's sketch): Fellgate's western gate, along the wagon road to Langston.
    ["fg", "wv", 8],
    ["wv", "lg", 8],
    // Roi's Grove (hidden until the visit to Tomlin is done): a seldom-used dirt track to Langston and another to Western Vale Road.
    ["lg", "rg", 6, "track"],
    // Westwood (hidden until the mayor's map is in hand): forest paths from Langston's west side.
    ["lg", "ww", 6, "track"],
    // The placeholder road to the north-west and village to the north (the user, 2026-11-01): real roads, 8 and 7 miles (my numbers; pulled in to about 70% of the drawn distance at the user's request, 2026-11-01).
    ["lg", "nw", 8],
    ["lg", "nv", 7],
    // The roads drawn between the new places (the user, 2026-11-01): Barolo to the road tile, and the road tile to Broadmead and Fallowmere, which join each other; miles from the drawn lengths (my numbers).
    ["nw", "nv", 5],
    ["nw", "bm", 10],
    ["bm", "fm", 9],
    ["fm", "nw", 8],
    // The small forest trails drawn through Westwood (the user, 2026-11-01): from the road tile down to Westwood, and on to Roi's Grove (both hidden until their flags are set, like the tracks to them).
    ["nw", "ww", 5, "track"],
    ["ww", "rg", 6, "track"],
    ["rg", "wv", 7, "track"]
  ];

  // Is a tile on the map yet? A tile with a requires (the name of a saved flag) is hidden, and cannot be routed to or through, until that flag is true. Read from the live stats, so it opens the moment the flag is set.
  function isOpen(id) {
    var n = NODES[id];
    if (!n) return false;
    if (!n.requires) return true;
    var v = (root.stats || {})[n.requires];
    return v === true || v === "true";
  }

  var adj = {};
  Object.keys(NODES).forEach(function (id) { adj[id] = []; });
  EDGES.forEach(function (e) {
    var terrain = e[3] || "road", T = TERRAIN[terrain];
    if (!T || !(T.pace > 0)) return;   // a blocked way is drawn on the map but never walked
    adj[e[0]].push({ to: e[1], miles: e[2], terrain: terrain, pace: T.pace });
    adj[e[1]].push({ to: e[0], miles: e[2], terrain: terrain, pace: T.pace });
  });

  // The QUICKEST way from one tile to another (by time, so a mile of pathless forest counts double), by Dijkstra: the map is tiny, so a plain scan is enough.
  function route(from, to) {
    if (!isOpen(from) || !isOpen(to)) return { ok: false, path: [], legs: [], miles: 0, minutes: 0 };
    var dist = {}, prev = {}, done = {};
    Object.keys(NODES).forEach(function (id) { dist[id] = Infinity; });
    dist[from] = 0;
    for (; ;) {
      var cur = null, best = Infinity;
      Object.keys(dist).forEach(function (id) { if (!done[id] && dist[id] < best) { best = dist[id]; cur = id; } });
      if (cur === null || cur === to) break;
      done[cur] = true;
      adj[cur].forEach(function (n) {
        if (!isOpen(n.to)) return;
        var d = dist[cur] + n.miles * n.pace;
        if (d < dist[n.to]) { dist[n.to] = d; prev[n.to] = cur; }
      });
    }
    if (dist[to] === Infinity) return { ok: false, path: [], legs: [], miles: 0, minutes: 0 };
    var path = [to];
    while (path[0] !== from) path.unshift(prev[path[0]]);
    // one entry per road walked, so a journey can be charged leg by leg (the weather changes while you walk)
    var legs = [], miles = 0, minutes = 0;
    for (var i = 0; i < path.length - 1; i++) {
      var m = 0, pace = 100, terrain = "road";
      // the cheapest way between the two tiles, if a pair were ever joined twice
      var bestCost = Infinity;
      adj[path[i]].forEach(function (n) { if (n.to === path[i + 1] && n.miles * n.pace < bestCost) { bestCost = n.miles * n.pace; m = n.miles; pace = n.pace; terrain = n.terrain; } });
      var mins = Math.round(m * MINUTES_PER_MILE * pace / 100);
      legs.push({ from: path[i], to: path[i + 1], miles: m, pace: pace, terrain: terrain, minutes: mins });
      miles += m; minutes += mins;
    }
    return { ok: true, path: path, legs: legs, miles: miles, minutes: minutes };
  }

  // "about 12 hours", "about a day", "about a day and a half", "about 2 days".
  function duration(minutes) {
    var hours = Math.round(minutes / 60);
    if (hours < 1) return "under an hour";
    if (hours < 24) return "about " + hours + (hours === 1 ? " hour" : " hours");
    var halfDays = Math.round(hours / 12);   // in half days
    if (halfDays === 2) return "about a day";
    if (halfDays === 3) return "about a day and a half";
    if (halfDays % 2 === 0) return "about " + (halfDays / 2) + " days";
    return "about " + ((halfDays - 1) / 2) + " and a half days";
  }

  // The walking time, which is what the clock will run. A "days of travel" figure was tried (2026-10-07) and removed: it assumed a camp after every 8 hours, and nothing forces one, so
  // it would have promised a time the game does not take. The player decides where to camp.
  function span(minutes) {
    return duration(minutes) + " of walking";
  }

  function label(from, to) {
    var r = route(from, to);
    if (!r.ok) return "";
    if (from === to) return "you are here";
    return r.miles + " miles, " + span(r.minutes);
  }

  // The same pure route forecast used by the map card and overworld.txt. It walks a mile at a
  // time so a route can change pace exactly when it crosses dusk, night or dawn. Darkness needs
  // a usable light; poor visibility forces the same roadside halt. A halt waits until 07:00 and
  // then the route continues, so picking a far tile never silently ignores the night.
  function travelPlan(from, to, startMinute, hasNightLight, poorVisibility, mounted) {
    var r = route(from, to);
    if (!r.ok) return { ok: false, miles: 0, walkMinutes: 0, haltMinutes: 0, minutes: 0, nightMiles: 0, duskMiles: 0, nightStops: 0, arrivalMinute: 0, arrivalDayOffset: 0 };
    var t = Math.max(0, Math.floor(Number(startMinute) || 0)) % 1440;
    var dayOffset = 0, walk = 0, halt = 0, nightMiles = 0, duskMiles = 0, stops = 0, ends = [];
    function advance(n) { t += n; while (t >= 1440) { t -= 1440; dayOffset++; } }
    for (var i = 0; i < r.legs.length; i++) {
      for (var m = 0; m < r.legs[i].miles; m++) {
        var dark = (t >= NIGHT_START || t < DAYLIGHT_START);
        if (dark && (!hasNightLight || poorVisibility)) {
          var wait = (DAYLIGHT_START - t + 1440) % 1440;
          if (wait === 0) wait = 1440;
          halt += wait; stops++; advance(wait);
          continue;
        }
        var pace = dark ? (mounted ? MOUNT_DARK_MINUTES_PER_MILE : DARK_MINUTES_PER_MILE) : (t >= DUSK_START ? (mounted ? MOUNT_DUSK_MINUTES_PER_MILE : DUSK_MINUTES_PER_MILE) : (mounted ? MOUNT_MINUTES_PER_MILE : MINUTES_PER_MILE));
        // the terrain of this leg: a mile of pathless forest takes twice the time (calendar.txt travel_step applies the same percent, so the forecast and the trip agree)
        pace = Math.round(pace * (r.legs[i].pace || 100) / 100);
        if (dark) nightMiles++;
        else if (t >= DUSK_START) duskMiles++;
        walk += pace; advance(pace);
      }
      ends.push(t);
    }
    return { mounted: !!mounted, ends: ends, ok: true, miles: r.miles, walkMinutes: walk, haltMinutes: halt, minutes: walk + halt, nightMiles: nightMiles, duskMiles: duskMiles, nightStops: stops, arrivalMinute: t, arrivalDayOffset: dayOffset };
  }


  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  // THE CARAVAN ESCORT'S ROAD (radiant/hall_escort.txt). Pure functions of the route, the tile data, the clock and a seed, so a refresh replays them to the same answer and nothing here is random.
  // A caravan walks at CONVOY_PACE minutes a mile, rolls out at 09:00 and camps when the next leg would end after 20:00. A job is at most CONVOY_MAX_LEGS legs (about four days).
  // A STRETCH is the walk from where the line stands to its next stop: a halt event, a camp or the end of the road. The quiet legs in between are folded into the one stretch.
  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  var CONVOY_PACE = 30;
  var CONVOY_MAX_LEGS = 7;
  var CAMP_BY = 1200;        // minutes past midnight (20:00): a leg that would end after this means the line camps first
  var HALT_MINUTES = 30;     // what a halt event costs the clock
  var HALT_CHANCE = [25, 50, 75, 100];   // percent, by tile danger 0 to 3, that a halt on an eligible tile meets an event
  // Halt events. code is the label number in hall_escort.txt (1 mud_wheel, 2 balky_ox, 5 fallen_tree, 6 bandits, 7 stranded_traveller, 8 cracked_axle, 9 warden_check); kinds are the tile kinds it can happen on; weight is by tile danger 0 to 3 (0 = cannot happen).
  // A row is the picker's whole knowledge of an event: a new event is one row here and one label in the scene. What a failed roll costs is the event's own business (a sunk wheel loses goods, bandits at the
  // highest danger can come to blows): not every roll is a fight.
  var HALT_EVENTS = [
    { code: 1, id: "mud_wheel",   kinds: ["road"],                    weight: [4, 4, 4, 4] },
    { code: 2, id: "balky_ox",    kinds: ["road", "hills"],           weight: [4, 4, 4, 4] },
    { code: 5, id: "fallen_tree", kinds: ["forest", "hills"],         weight: [4, 4, 4, 4] },
    { code: 6, id: "bandits",     kinds: ["road", "forest", "hills"], weight: [0, 2, 4, 6] },
    { code: 7, id: "stranded_traveller", kinds: ["road", "forest", "hills"], weight: [2, 3, 3, 3] },
    { code: 8, id: "cracked_axle",       kinds: ["road", "forest", "hills"], weight: [3, 3, 3, 3] },
    { code: 9, id: "warden_check",       kinds: ["road"],                    weight: [4, 3, 2, 0] }
  ];
  function hash100(seed, salt) {
    var h = (Math.floor(seed) * 2654435761 + Math.floor(salt) * 40503 + 12345) >>> 0;
    h ^= h >>> 15; h = Math.imul(h, 2246822519) >>> 0; h ^= h >>> 13; h = Math.imul(h, 3266489917) >>> 0; h ^= h >>> 16;
    return (h >>> 0) % 10000;
  }
  // The effective danger of a tile: its own number plus its territory's patrol, kept between 0 and 3.
  function dangerOf(n) {
    var raw = Math.floor(Number(n && n.danger) || 0), t = n && TERRITORIES[n.territory], shift = n && n.patrol !== undefined ? Math.floor(Number(n.patrol) || 0) : Math.floor(Number(t && t.patrol) || 0), d = raw + shift;
    return d < 0 ? 0 : d > 3 ? 3 : d;
  }
  // A "woodroad" (a road under close trees) matches an event row that lists either "road" or "forest".
  function kindIn(list, kind) { return list.indexOf(kind) >= 0 || (kind === "woodroad" && (list.indexOf("road") >= 0 || list.indexOf("forest") >= 0)); }
  function haltEligible(n) { return n.kind === "road" || n.kind === "woodroad" || n.kind === "forest" || n.kind === "hills"; }
  function pickHalt(n, seed, salt) {
    var d = dangerOf(n), rows = HALT_EVENTS.filter(function (e) { return kindIn(e.kinds, n.kind) && e.weight[d] > 0; });
    var total = rows.reduce(function (a, e) { return a + e.weight[d]; }, 0);
    if (!total) return 0;
    var r = hash100(seed, salt) % total;
    for (var i = 0; i < rows.length; i++) { if (r < rows[i].weight[d]) return rows[i].code; r -= rows[i].weight[d]; }
    return rows[rows.length - 1].code;
  }
  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  // ROAD EVENTS ON A SOLO JOURNEY (scenes/overworld/overworld.txt ow_travel, scenes/overworld/travel_events.txt). Pure functions of the route, the tile data, the day and a seed, so a refresh replays them.
  // A journey that meets an event STOPS on that tile: the walk ends there, the event plays, and the player is back on the map with the rest of the trip still picked (stats.ow_goal). At most one event
  // every TRAVEL_COOLDOWN_DAYS days, so it stays a rare thing. A tile can host one only if its kind is road, forest or hills (never a town) and the event's own row allows its kind and territory.
  // A row: id (the label in travel_events.txt is te_<id>), kinds (tile kinds), territories (tile territories it can happen in; empty means any), weight by effective danger 0 to 3 (0 means never at that
  // danger, so a row with all zeros can only be forced), and dev:true for a row only the developer menu forces. A new event is one row here and one label there.
  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  var TRAVEL_COOLDOWN_DAYS = 3;
  var TRAVEL_CHANCE = [4, 8, 14, 22];   // percent, by effective danger of the tile a leg ends on, that the leg ends in an event (once the cooldown is over); a safe road still meets the odd stranger
  // when: the light the walker meets it in, "day", "dusk" or "dark" (the time the leg ENDS at, worked out by travelPlan); leave it out for any time. A forced test event ignores it.
  var TRAVEL_EVENTS = [
    { id: "stub", kinds: ["road", "forest", "hills"], territories: [], weight: [0, 0, 0, 0], dev: true },
    { id: "stranded_cart", kinds: ["road", "hills"], territories: [], weight: [3, 3, 3, 3], when: ["day"] },
    { id: "lamp_out", kinds: ["road", "forest", "hills"], territories: [], weight: [3, 3, 3, 3], when: ["dusk", "dark"] },
    { id: "caught_animal", kinds: ["road", "forest", "hills"], territories: [], weight: [2, 2, 2, 2], when: ["day", "dusk"] },
    { id: "lost_traveller", kinds: ["forest", "hills"], territories: [], weight: [2, 2, 2, 2], when: ["day", "dusk"] },
    { id: "ford", kinds: ["road"], territories: [], weight: [3, 3, 3, 3], when: ["day", "dusk"], ford: true },
    { id: "bandits", kinds: ["road", "forest", "hills"], territories: [], weight: [0, 1, 2, 4] },
    { id: "night_beasts", kinds: ["road", "forest", "hills"], territories: [], weight: [1, 2, 3, 4], when: ["dark"] }
  ];
  // The Hale Ring is a one-time personal quest, not part of the repeatable event weights above. It gets a plain 5% roll whenever a solo journey reaches one of Ressa and Oswin's former freight-road nodes in daylight or at dusk. The caller only asks for this while its quest stage is "none".
  var HALE_RING_TILES = ["r1", "r2", "r3"];
  function periodOf(t) { t = ((Math.floor(t) % 1440) + 1440) % 1440; return (t >= NIGHT_START || t < DAYLIGHT_START) ? "dark" : (t >= DUSK_START ? "dusk" : "day"); }
  function pickTravel(n, seed, salt, force, period) {
    var d = dangerOf(n), rows = TRAVEL_EVENTS.filter(function (e) {
      if (force) return e.id === force && (!e.ford || n.ford);
      return kindIn(e.kinds, n.kind) && (!e.territories.length || e.territories.indexOf(n.territory) >= 0) && (!e.when || e.when.indexOf(period) >= 0) && (!e.ford || n.ford) && e.weight[d] > 0;
    });
    if (!rows.length) return "";
    if (force) return rows[0].id;
    var total = rows.reduce(function (a, e) { return a + e.weight[d]; }, 0), r = hash100(seed, salt) % total;
    for (var i = 0; i < rows.length; i++) { if (r < rows[i].weight[d]) return rows[i].id; r -= rows[i].weight[d]; }
    return rows[rows.length - 1].id;
  }
  // THE WOLVES OF LANGSTON (the user's design, 2026-11-01): a month or two into the campaign (a day rolled between 30 and 60, wol_start_day), the first journey that ends at Langston in daylight or at dusk is met on the road by the wolves, and Chapter 1 begins at wol_ch1_start
  // (the label's own entry contract: a world hook after road travel). Not a random event: it fires the first time the day has come, once. due is wol_ch1_due (the quest is unstarted and the day has come), worked out in ChoiceScript (wolves_of_langston_chapter_1.txt wol_ch1_due_check).
  // A journey that would end after dark does not trigger it: the player stops for the night first and the next arrival does.
  function wolvesStartPlan(from, to, startMinute, hasNightLight, poorVisibility, mounted, due) {
    if (!due || String(to) !== "lg") return null;
    var legs = route(from, to).legs || [];
    if (!legs.length || legs[legs.length - 1].to !== "lg") return null;
    var ends = (travelPlan(from, to, Number(startMinute) || 0, hasNightLight !== false, !!poorVisibility, !!mounted).ends) || [];
    var period = periodOf(ends[legs.length - 1] === undefined ? 0 : ends[legs.length - 1]);
    if (period === "dark") return null;
    return { id: "wolves_start", tile: "lg", leg: legs.length };
  }
  function haleRingPlan(from, to, seed, force, startMinute, hasNightLight, poorVisibility, mounted) {
    force = String(force || "");
    if (force && force !== "hale_ring") return null;
    var legs = route(from, to).legs || [];
    var ends = (travelPlan(from, to, Number(startMinute) || 0, hasNightLight !== false, !!poorVisibility, !!mounted).ends) || [];
    for (var i = 0; i < legs.length; i++) {
      if (HALE_RING_TILES.indexOf(legs[i].to) < 0) continue;
      var period = periodOf(ends[i] === undefined ? 0 : ends[i]);
      if (!force && period !== "day" && period !== "dusk") continue;
      if (force || (hash100(seed, 850 + i) % 100) < 5) return { id: "hale_ring", tile: legs[i].to, leg: i + 1 };
    }
    return null;
  }
  // Does the trip from -> to meet an event, and where? Returns { id, tile, leg } (tile is the tile the walk ends on, leg its number) or null. seed is any whole number the page keeps fixed (the day and the clock);
  // day and lastDay are the campaign days now and of the last event (the cooldown); force is an event id the developer menu asks for (it ignores the chance and the cooldown, and takes the first eligible tile).
  // startMinute, hasNightLight and poorVisibility are what travelPlan needs to say when each leg ends, so an event can be one that belongs to that hour (a lamp gone out is a dusk or a night event).
  function travelEventPlan(from, to, seed, day, lastDay, force, startMinute, hasNightLight, poorVisibility, mounted) {
    var legs = route(from, to).legs || [];
    var ends = (travelPlan(from, to, Number(startMinute) || 0, hasNightLight !== false, !!poorVisibility, !!mounted).ends) || [];
    force = String(force || "");
    if (!force && Number(lastDay) > 0 && Number(day) - Number(lastDay) < TRAVEL_COOLDOWN_DAYS) return null;   // a lastDay of 0 means no event yet
    for (var i = 0; i < legs.length; i++) {
      var n = NODES[legs[i].to];
      if (!haltEligible(n)) continue;
      if (!force && (hash100(seed, 300 + i) % 100) >= TRAVEL_CHANCE[dangerOf(n)]) continue;
      var id = pickTravel(n, seed, 400 + i, force, periodOf(ends[i] === undefined ? 0 : ends[i]));
      if (id) return { id: id, tile: legs[i].to, leg: i + 1 };
    }
    return null;
  }
  // CAMP EVENTS (scenes/overworld/overworld.txt ow_camp_pre, travel_events.txt): a stranger at a solo camp, in the last of the light or the dark. Planned once per camp with campEventPlan, from the same seed and the same
  // cooldown as a road event (ow_event_last_day), and not on every camp: CAMP_CHANCE percent by the danger of the tile. A row is the same as a road event's (id, kinds, territories, weight by danger, when).
  var CAMP_CHANCE = [6, 8, 12, 16];
  var CAMP_EVENTS = [
    { id: "share_fire", kinds: ["road", "forest", "hills"], territories: [], weight: [2, 2, 2, 2], when: ["dusk", "dark"] }
  ];
  function campEventPlan(pos, seed, day, lastDay, force, nowMinute) {
    var n = NODES[pos];
    force = String(force || "");
    if (!n) return null;
    if (force) { var f = CAMP_EVENTS.filter(function (e) { return e.id === force; })[0]; return f ? { id: f.id } : null; }
    if (Number(lastDay) > 0 && Number(day) - Number(lastDay) < TRAVEL_COOLDOWN_DAYS) return null;
    if (!haltEligible(n)) return null;
    var d = dangerOf(n), per = periodOf(nowMinute);
    if ((hash100(seed, 500) % 100) >= CAMP_CHANCE[d]) return null;
    var rows = CAMP_EVENTS.filter(function (e) { return kindIn(e.kinds, n.kind) && (!e.territories.length || e.territories.indexOf(n.territory) >= 0) && (!e.when || e.when.indexOf(per) >= 0) && e.weight[d] > 0; });
    var total = rows.reduce(function (a, e) { return a + e.weight[d]; }, 0);
    if (!total) return null;
    var r = hash100(seed, 501) % total;
    for (var i = 0; i < rows.length; i++) { if (r < rows[i].weight[d]) return { id: rows[i].id }; r -= rows[i].weight[d]; }
    return { id: rows[rows.length - 1].id };
  }
  // The night in camp: 0 quiet, 3 the oxen spook, 4 a sneak thief. A rougher camp is more likely to be disturbed (the thief band grows with danger).
  function convoyNight(seed, salt, danger) {
    var d = Math.max(0, Math.min(3, Math.floor(Number(danger) || 0)));
    var roll = hash100(seed, salt) % 100, thief = 10 + 10 * d;
    if (roll < thief) return 4;
    if (roll < thief + 25) return 3;
    return 0;
  }
  // From leg startLeg of the route, walk until the next stop. nowMin is the clock in minutes past midnight, haltedToday is true when a halt event has already happened today (one a day at most).
  function convoyPlan(from, to, startLeg, nowMin, seed, haltedToday, pace) {
    var r = route(from, to), legs = r.legs || [];
    pace = pace || CONVOY_PACE;
    var i = startLeg, t = nowMin, mins = 0, miles = 0, walk = [], stop = "", haltEv = 0, act2 = "go";
    while (i < legs.length) {
      var L = legs[i], n = NODES[L.to], lm = L.miles * pace;
      t += lm; mins += lm; miles += L.miles; i++;
      var wtext = (n.walkVia && n.walkVia[L.from]) || n.walk;
      if (wtext && walk.length < 3) walk.push(wtext);
      if (i >= legs.length) { stop = "pay"; break; }
      var nm = legs[i].miles * pace;
      if (t + nm > CAMP_BY) { stop = "camp"; break; }
      if (!haltedToday && haltEligible(n) && (hash100(seed, 100 + i) % 100) < HALT_CHANCE[dangerOf(n)]) {
        var ev = pickHalt(n, seed, 200 + i);
        if (ev) { stop = "beat"; haltEv = ev; act2 = (t + HALT_MINUTES + nm) <= CAMP_BY ? "go" : "camp"; break; }
      }
    }
    var first = legs[startLeg], last = legs[i - 1];
    return { endLeg: i, miles: miles, minutes: mins, walk: walk.join(" "), stop: stop, haltEv: haltEv, act2: act2, phase: nowMin < 660 ? "morning" : "afternoon",
             fromName: first ? NODES[first.from].name : "", toName: last ? NODES[last.to].name : "" };
  }
  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  // THE COURIER BOARD (radiant/hall_courier.txt). A courier carries a letter, a sealed contract or a small parcel to a named person at another place and walks it there on the free map: nothing here moves the
  // player. The board is a pure function of the origin tile and the day, so a refresh shows the same postings, and it names no tile: any tile of a kind in COURIER_DEST_WEIGHT can receive a parcel, so a
  // new village is one NODES entry (and, if you like, one COURIER_TILES line for where letters are left) and it is on the board. Nearer places come up more often, villages more than towns, towns more than forts.
  // Pay is about half a copper bit a mile with a floor (halved on 2026-10-12: a satchel of three could be chained endlessly and out-earned the Hall's own jobs); the term is the days the walk takes at 20 miles a day plus two. Higher grades of work (valuables, a longer term, more pay) are for the higher Insignia
  // ranks, which are not built yet: a posting carries a `grade` (always 1 for now) so they can slot in without changing its shape.
  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  var COURIER_KINDS = [
    { id: "letter", item: "a sealed letter", rate: 4, min: 2, weight: 50 },
    { id: "parcel", item: "a small parcel", rate: 5, min: 3, weight: 30 },
    { id: "contract", item: "a sealed contract", rate: 6, min: 4, weight: 20 }
  ];   // rate is tenths of a copper bit a mile; min is the floor in copper bits
  var COURIER_DEST_WEIGHT = { village: 3, town: 2, fort: 1, city: 1 };
  // Where in a tile a letter is left (place), and the people there (setting: names-data.js's mix of races; region: its surnames). All optional: a kind has defaults.
  var COURIER_TILES = {
    pv: { place: "the River Gate", setting: "middle_ward", region: "port" },
    fv: { place: "the Gathering Hall", setting: "village" },
    fo: { place: "the Longhouse", setting: "forest_village" },
    mc: { place: "the Cross Hall", setting: "village" },
    bw: { place: "the Tide House", setting: "village", region: "port" },
    rv: { place: "the Gather House", setting: "village" },
    wf: { place: "the Stone Yard", setting: "village" },
    tm: { place: "the Factor's Hall" },
    af: { place: "the Factor's Hall" },
    bs: { place: "the gatehouse" },
    sw: { place: "the gate" },
    fg: { place: "the gate" },
    lg: { place: "the town hall", setting: "town", region: "any" },
    nv: { place: "the Village Head's Hall", setting: "village", region: "marches" },   // Barolo (2026-11-02): its Contract Board is in the Village Head's Hall (Langston/barolo/village_heads_hall.txt ba_hall_board); the village count [0, 2]
    bm: { place: "the Village Head's Hall", setting: "village", region: "marches" },   // Broadmead (2026-11-02): its Contract Board is in the Village Head's Hall (Langston/broadmead/village_heads_hall.txt bm_hall_board); the village count [0, 2]
    fm: { place: "the Village Head's Hall", setting: "village", region: "marches" }   // Fallowmere (2026-11-02): its thin Contract Board is in the Village Head's Hall (Langston/fallowmere/village_heads_hall.txt fm_hall_board); the village count [0, 2]
  };
  // count is how many postings a board shows on a given day, rolled between the two numbers from the day and the origin (so a refresh and a return visit show the same board): a city is busiest and a village is
  // sometimes empty (the user's call, 2026-10-11). A COURIER_TILES entry may give its own count: [min, max].
  var COURIER_DEFAULTS = {
    village: { place: "the village", setting: "village", region: "marches", count: [0, 2] },
    town: { place: "the town", setting: "town", region: "marches", count: [1, 3] },
    fort: { place: "the gate", setting: "town", region: "marches", count: [0, 0] },
    city: { place: "the city", setting: "middle_ward", region: "port", count: [2, 3] }
  };
  function courierTile(id) {
    var n = NODES[id], t = COURIER_TILES[id] || {}, d = COURIER_DEFAULTS[n.kind] || COURIER_DEFAULTS.village;
    return { place: t.place || d.place, setting: t.setting || d.setting, region: t.region || d.region, count: t.count || d.count };
  }
  function courierSeed(origin, day) {
    var base = Math.floor(Number(day) || 0) * 977;
    for (var c = 0; c < String(origin).length; c++) base += String(origin).charCodeAt(c) * 31;
    return base;
  }
  // how many postings this origin's board shows today
  function courierCount(origin, day) {
    var n = courierTile(origin).count, lo = n[0], hi = n[1];
    return lo + (hi > lo ? hash100(courierSeed(origin, day), 300) % (hi - lo + 1) : 0);
  }
  // count postings for the origin on this day: [{ n, to, toName, miles, kind, item, fee, term, grade, seed, place, setting, region, no }]
  function courierPostings(origin, day, count) {
    var base = courierSeed(origin, day);
    if (count == null) count = courierCount(origin, day);
    var cands = [];
    Object.keys(NODES).forEach(function (id) {
      var w = COURIER_DEST_WEIGHT[NODES[id].kind];
      if (!w || id === origin) return;
      var r = route(origin, id);
      if (!r.ok) return;
      cands.push({ id: id, miles: r.miles, weight: w * Math.max(1, 70 - r.miles) });
    });
    var out = [];
    for (var i = 0; i < count && cands.length; i++) {
      var sum = 0; cands.forEach(function (q) { sum += q.weight; });
      var at = hash100(base, 100 + i) / 10000 * sum, k = 0;
      while (k < cands.length - 1 && at >= cands[k].weight) { at -= cands[k].weight; k++; }
      var d = cands.splice(k, 1)[0];
      var ksum = 0; COURIER_KINDS.forEach(function (q) { ksum += q.weight; });
      var kat = hash100(base, 200 + i) / 10000 * ksum, kk = 0;
      while (kk < COURIER_KINDS.length - 1 && kat >= COURIER_KINDS[kk].weight) { kat -= COURIER_KINDS[kk].weight; kk++; }
      var K = COURIER_KINDS[kk], tile = courierTile(d.id);
      out.push({ n: i + 1, to: d.id, toName: NODES[d.id].name, miles: d.miles, kind: K.id, item: K.item, grade: 1,
        fee: Math.max(K.min, Math.round(d.miles * K.rate / 10)), term: Math.ceil(d.miles / 20) + 2,
        seed: base * 10 + i + 1, place: tile.place, setting: tile.setting, region: tile.region, no: 7000 + (Math.floor(Number(day) || 0) * 3 + i) });
    }
    return out;
  }

  // 10 copper bits make a silver mark, 10 silver marks a gold crown.
  function coinText(copper) {
    var f = Math.max(0, Math.floor(Number(copper) || 0)), g = Math.floor(f / 100), s = Math.floor((f % 100) / 10), c = f % 10, parts = [];
    if (g) parts.push(g + (g === 1 ? " Gold Crown" : " Gold Crowns"));
    if (s) parts.push(s + (s === 1 ? " Silver Mark" : " Silver Marks"));
    if (c) parts.push(c + (c === 1 ? " Copper Bit" : " Copper Bits"));
    return parts.join(", ") || "nothing";
  }
  // The fee, in copper: three quarters of a copper bit a mile if nothing is lost; if some of the beats (halts and nights) went wrong the share that held, but never under a third; nothing if every one did.
  function convoyFee(miles, beats, lost) {
    var full = Math.floor(Number(miles) * 3 / 4);
    beats = Math.max(0, Math.floor(Number(beats) || 0)); lost = Math.max(0, Math.floor(Number(lost) || 0));
    if (lost <= 0) return full;
    if (lost >= beats) return 0;
    return Math.max(Math.floor(full * (beats - lost) / beats), Math.floor(full / 3));
  }

  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  // THE CARAVAN YARDS AND LINES (radiant/hall_escort.txt), 2026-10-30. A YARD is a place where a wagon line is made up and signed: the Port Valen wagon yard, the Timbermouth lot, the Alderford carters' lot. A LINE
  // is one route a yard runs on one day of the week (prose never names the day), told with the opening phrase the master uses, the place text and the road talk. The road itself is not here: the caravan walks
  // the legs of Overworld.route(from, to), and its prose comes from the tiles' walk, camp, depart and arrive fields. To add a town: one entry in CARAVAN_YARDS (place is the key hall_escort.txt es_back and es_missed
  // answer to, seed and setting make the wagon master's face, one seed per yard so nobody stands at two), one entry per line it runs in CARAVAN_LINES (a yard's FIRST line is what its master describes on a
  // day with no line), and the labels that bring the player in and out (see es_back, es_arrive_at and the town's own lot scene). A line that runs on the same day of the week as another line of its yard is a
  // mistake: the yard would offer only one of them. A yard with its own lot scene (the Timbermouth lot, the Alderford carters' lot, Port Valen's yard) needs only the five fields above; a yard that uses the shared lot
  // scene (port_valen/radiant/caravan_lot.txt, place "glot") adds the words that scene prints: heading, placeLong (the first paragraph), endName ("gate end"), roadWord, horizon, leaveText (the choice that walks
  // back, with its minutes) and the hand's reply (idle) and the page for a missed line (missed). notice is the line as a sheet on a board (hall_escort.txt es_set_line copies it to es_ctx_notice); postingNo is the number a board that numbers by line gives it (Port Valen's Hiring Hall), the others number by week.
  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  var CARAVAN_YARDS = {
    pv: { place: "yard", seed: 5000, setting: "middle_ward" },
    tm: { place: "lot", seed: 6000, setting: "town" },
    af: { place: "alot", seed: 7000, setting: "town" },
    lg: { place: "glot", seed: 8000, setting: "town", walkMinutes: 5,
      heading: "THE WAGON LOT", endName: "gate end", roadWord: "chalk road", horizon: "the pale line of the fields", leaveText: "Walk back to the square. [~5 min]",
      placeLong: "Just outside Langston's gate, a long lot of trodden chalk has been fenced off with rails and opened onto the wagon road. Wagons stand in it nose to tail, with ox yokes and spare wheels hung from the rails and a picket line of beasts running down one end. Hemp bales and bundles of wool wait along the fence under tarps, and the ground is churned to a pale slurry wherever the carts turn. The air smells of dung, wet wool, hemp and hot iron.",
      idle: "The hand sets the bucket down and wipes his hands on his apron. \"Nothing making up today,\" he says. \"The carriers go when they have goods. The Contract Board at the Hall carries the posting when one is open, and the wagon master pays only the ones who walk with the column.\"",
      missed: "The lot is nearly empty. A few hands rake straw under the lean-to, and a long double rut leads out past the last rail and away along the chalk road. A hand tells you the caravan pulled out this morning without you, and that the wagon master pays only the ones who walk with the column." }
  };
  var CARAVAN_LINES = [
    { from: "pv", to: "tm", dow: "Forgeday", postingNo: "0381",
      notice: "Sealed: a coal and iron carrier and the City. Work: wagon escort to Timbermouth. Pay: the fee named at the yard. Term: two days out. Apply: the wagon yard.",
      opens: "the gate opens",
      placeText: "the wagon yard outside the River Gate",
      roadTalk: "tips a hand toward the north-west. \"River road to the fork, then up the west bank. The first night is the Ashrun's mouth, with water and flat ground. After that the road climbs, and the forest comes down to the edge. Carriers lose what they lose on the second day, when the wagons are tired and the road is narrow.\"" },
    { from: "pv", to: "af", dow: "Marketday", postingNo: "0340",
      notice: "Sealed: a carters' company and the City. Work: wagon escort to Alderford. Pay: the fee named at the yard. Term: two days out. Apply: the wagon yard.",
      opens: "the gate opens",
      placeText: "the wagon yard outside the River Gate",
      roadTalk: "tips a hand toward the east. \"Round under the wall to the Charter Gate and up the old paving. The first night is on the High Grey Road, on the verge past the trough, with the wind and no cover. The second day is the climb to the weir, and Alderford is at the top of it. Mind the drop on the Rise.\"" },
    { from: "tm", to: "pv", dow: "Tideday",
      notice: "Sealed: a carriers' company and the City. Work: wagon escort to Port Valen. Pay: the fee named at the lot. Term: two days out. Apply: the wagon lot, beside the Market.",
      opens: "the Market opens",
      placeText: "the wagon lot beside the Market in Timbermouth",
      roadTalk: "tips a hand toward the south-east. \"Down off the hills by the west bank, then the river road to the fork and the cuttings to the city. The first night is the Ashrun's mouth, with water and flat ground. The second day is the easy one, if the first went well.\"" },
    { from: "tm", to: "af", dow: "Hearthday",
      notice: "Sealed: a carriers' company and the City. Work: wagon escort to Alderford. Pay: the fee named at the lot. Term: two days out. Apply: the wagon lot, beside the Market.",
      opens: "the Market opens",
      placeText: "the wagon lot beside the Market in Timbermouth",
      roadTalk: "tips a hand toward the north-east. \"Out by the farm road to Barleycross, then the Crossfield Road east over the uplands. The first night is on the verge by the old field wall, with water in the ditch and no wood. The second day is the long pull down to the weir, and Alderford sits above it. Carriers lose what they lose on the upland, where the ruts are deep and the wind has nothing to stop it.\"" },
    { from: "tm", to: "lg", dow: "Ironday",
      notice: "Sealed: a carriers' company and the City. Work: wagon escort to Langston. Pay: the fee named at the lot. Term: two days out. Apply: the wagon lot, beside the Market.",
      opens: "the Market opens",
      placeText: "the wagon lot beside the Market in Timbermouth",
      roadTalk: "tips a hand toward the north. \"Out by the narrow road through the ash and thorn, then up along the Ashrun under the foot of the mountain. The first night is at Fellgate, under the fort's wall, with a trough in the yard and a gate that shuts. The second day is the straight chalk road across the Vale, with hedges and tilled fields on both hands, and Langston sits at the end of it behind its low wall. Carriers lose what they lose on the first day, in the thin air under the mountain, where the road climbs and the wind comes down off the scree.\"" },
    { from: "af", to: "pv", dow: "Ironday",
      notice: "Sealed: a carriers' company and the City. Work: wagon escort to Port Valen. Pay: the fee named at the lot. Term: two days out. Apply: the carters' lot, beside the Lower Wharf Market.",
      opens: "the Market opens",
      placeText: "the carters' lot beside the Lower Wharf Market in Alderford",
      roadTalk: "tips a hand toward the south. \"Up out of the weir by the palisade gate and down the High Grey Road, over the Rise, with the Grey on your right hand. The first night is on the verge past the trough, with the wind and no cover. The second day is all downhill, if the first went well.\"" },
    { from: "af", to: "tm", dow: "Greyday",
      notice: "Sealed: a carriers' company and the City. Work: wagon escort to Timbermouth. Pay: the fee named at the lot. Term: two days out. Apply: the carters' lot, beside the Lower Wharf Market.",
      opens: "the Market opens",
      placeText: "the carters' lot beside the Lower Wharf Market in Alderford",
      roadTalk: "tips a hand toward the north-west. \"Out by the palisade gate and west over the upland on the Crossfield Road, with the ruts deep under a loaded wagon. The first night is at Barleycross, on a farmer's headland by the road, with a trough at the gate and the village dogs for company. The second day is the short way in, down the farm road to Timbermouth, and the saw frame will be the first thing you hear.\"" },
    { from: "lg", to: "tm", dow: "Marketday",
      notice: "Sealed: a carriers' company and Langston Hall. Work: wagon escort to Timbermouth. Pay: the fee named at the lot. Term: two days out. Apply: the wagon lot, outside the gate.",
      opens: "the gate opens",
      placeText: "the wagon lot outside Langston's gate",
      roadTalk: "tips a hand toward the east. \"East along the chalk road, straight across the Vale, to Fellgate and the foot of the mountain. The first night is under the fort's wall, with a trough in the yard and a gate that shuts. The second day is the timber road down through the Longshade, with the Ashrun running beside it, and Timbermouth is the clearing at the end. Carriers lose what they lose on the second day, when the wagons are tired and the forest comes down to the edge of the road.\"" }
  ];
  function caravanYard(id) { return CARAVAN_YARDS[id] || CARAVAN_YARDS.pv; }
  // The line a yard runs on this day of the week, or its first when it runs none, with the facts hall_escort.txt es_set_line copies into the es_ctx_* stats.
  // Whether a yard's lot has anything for the player today: a line of CARAVAN_LINES making up on today's weekday while no job is taken, or a job taken here that has not yet ridden. The one rule the towns' lot doors, the
  // Town card's grey, and the notice boards' lot links all read (the hand-written weekday lists it replaced went stale when the Timbermouth to Langston line was added).
  function lotShows(s, from) {
    if (String(s.rj_escort_stage) === "active") return String(s.rj_escort_from) === from && Number(s.campaign_day) <= Number(s.rj_escort_until);
    return CARAVAN_LINES.some(function (l) { return l.from === from && l.dow === String(s.day_of_week); });
  }
  function caravanLine(from, dow) {
    var mine = CARAVAN_LINES.filter(function (l) { return l.from === from; });
    var line = mine.filter(function (l) { return l.dow === dow; })[0] || mine[0];
    if (!line) return null;
    var r = route(line.from, line.to);
    return { from: line.from, to: line.to, place: caravanYard(from).place, destName: NODES[line.to].name, opens: line.opens, dow: line.dow, placeText: line.placeText, roadTalk: line.roadTalk, notice: line.notice, postingNo: line.postingNo || "",
             miles: r.miles, feeText: coinText(convoyFee(r.miles, 0, 0)) };
  }

  // The government whose Insignia page a job taken at this tile credits (inventory-data.js Insignia ids): the id its territory names. Anything unknown credits the Gilded Scales, as every job did before the Vale.
  function governmentOf(id) {
    var n = NODES[id], t = n && TERRITORIES[n.territory];
    return (t && t.government) || "scales";
  }

  // The zone a tile is in: the tile's own weather, else its territory's, else the default (a typo falls back to the default; the checker catches it).
  function weatherZoneOfTile(id) {
    var n = NODES[id], t = n && TERRITORIES[n.territory], z = (n && n.weather) || (t && t.weather);
    return WEATHER_ZONES[z] ? z : DEFAULT_WEATHER_ZONE;
  }
  // The zone the player is in now, from the state: a forced zone (a portal or plane) first, then the tile on the overworld, then the district they are in. tileId asks about another tile (a leg of a journey).
  function weatherZoneOf(stats, tileId) {
    if (tileId) return weatherZoneOfTile(tileId);
    var forced = String(stats.wx_force_zone || "");
    if (forced && WEATHER_ZONES[forced]) return forced;
    // a caravan on the road is in the zone of the leg it is walking (es_w_node, set before each leg by hall_escort.txt es_walk), not of the town it left
    if (stats.rj_escort_road && stats.es_w_node) return weatherZoneOfTile(String(stats.es_w_node));
    if (stats.ow_on) return weatherZoneOfTile(stats.ow_pos);
    var z = DISTRICT_ZONE[String(stats.current_district || "")];
    return WEATHER_ZONES[z] ? z : DEFAULT_WEATHER_ZONE;
  }
  // Moves the player's weather to the zone they are in. A no-op, safe to call at any time and as often as you like, when the zone has not changed. Otherwise the zone being left is parked in
  // stats.wx_slots and the one being entered is loaded. A zone entered for the first time has no slot: nothing is rolled here (no randomness, so a page that runs it again from a save comes out the same),
  // the globals keep the weather the player brought across for the moment and stats.wx_fresh is set. calendar.txt update_weather_flags sees it and rolls that zone's first days (a fresh today and tomorrow by
  // its profile, no streaks) before it derives the weather flags, so the first arrival is not the weather the player walked in with. The caller refreshes the flags with update_weather_flags.
  function weatherSync(stats, tileId) {
    var to = weatherZoneOf(stats, tileId), from = WEATHER_ZONES[stats.wx_zone] ? String(stats.wx_zone) : DEFAULT_WEATHER_ZONE;
    if (to === from) { stats.wx_zone = from; return false; }
    var slots = {}, k;
    try { slots = JSON.parse(stats.wx_slots || "{}") || {}; } catch (e) { slots = {}; }
    var leaving = {};
    for (k in WEATHER_FIELDS) leaving[k] = stats[WEATHER_FIELDS[k]];
    slots[from] = leaving;
    if (slots[to]) { for (k in WEATHER_FIELDS) if (slots[to][k] !== undefined) stats[WEATHER_FIELDS[k]] = slots[to][k]; }
    else stats.wx_fresh = true;
    delete slots[to];
    stats.wx_zone = to;
    stats.wx_profile = WEATHER_ZONES[to].profile;
    stats.wx_slots = JSON.stringify(slots);
    return true;
  }

  // THE DAILY ROLL FOR THE ZONES THE PLAYER IS NOT IN (calendar.txt advance_time). The roll itself stays in ChoiceScript (*rand, so a saved page replays the same); these three only move the weather
  // in and out of the globals so the same wx_day_step can roll each zone. weatherRollBegin holds the player's zone aside and queues the parked ones; weatherRollNext parks the zone just rolled, loads the
  // next queued one (wx_more true, wx_profile its profile) or, when none are left, puts the player's own weather back (wx_more false). Both are safe to call with nothing parked.
  function parseJSON(text, fallback) { try { var v = JSON.parse(text); return v === null || v === undefined ? fallback : v; } catch (e) { return fallback; } }
  function readWeather(stats) { var out = {}, k; for (k in WEATHER_FIELDS) out[k] = stats[WEATHER_FIELDS[k]]; return out; }
  function writeWeather(stats, from) { for (var k in WEATHER_FIELDS) if (from[k] !== undefined) stats[WEATHER_FIELDS[k]] = from[k]; }
  function weatherRollBegin(stats) {
    var slots = parseJSON(stats.wx_slots, {});
    stats.wx_hold = JSON.stringify({ zone: stats.wx_zone, weather: readWeather(stats) });
    stats.wx_queue = JSON.stringify(Object.keys(slots));
    stats.wx_cur = "";
    stats.wx_more = false;
  }
  function weatherRollNext(stats) {
    var slots = parseJSON(stats.wx_slots, {}), queue = parseJSON(stats.wx_queue, []), next = null;
    if (stats.wx_cur) { slots[stats.wx_cur] = readWeather(stats); stats.wx_cur = ""; }
    while (queue.length && !next) { next = queue.shift(); if (!slots[next] || !WEATHER_ZONES[next]) next = null; }
    if (next) {
      writeWeather(stats, slots[next]);
      stats.wx_cur = next;
      stats.wx_profile = WEATHER_ZONES[next].profile;
      stats.wx_more = true;
    } else {
      var hold = parseJSON(stats.wx_hold, null);
      if (hold) { writeWeather(stats, hold.weather); stats.wx_profile = (WEATHER_ZONES[hold.zone] || WEATHER_ZONES[DEFAULT_WEATHER_ZONE]).profile; }
      stats.wx_hold = "";
      stats.wx_more = false;
    }
    stats.wx_slots = JSON.stringify(slots);
    stats.wx_queue = JSON.stringify(queue);
  }

  root.Overworld = { weatherZones: WEATHER_ZONES, weatherProfiles: WEATHER_PROFILES, weatherFields: WEATHER_FIELDS, districtZone: DISTRICT_ZONE, defaultWeatherZone: DEFAULT_WEATHER_ZONE, weatherZoneOf: weatherZoneOf, weatherSync: weatherSync, governmentOf: governmentOf, caravanLine: caravanLine, lotShows: lotShows, caravanYard: caravanYard, caravanYards: CARAVAN_YARDS, caravanLines: CARAVAN_LINES, weatherRollBegin: weatherRollBegin, weatherRollNext: weatherRollNext, isOpen: isOpen, courierCount: courierCount, courierPostings: courierPostings, courierTile: courierTile, haleRingPlan: haleRingPlan, wolvesStartPlan: wolvesStartPlan, MINUTES_PER_MILE: MINUTES_PER_MILE, features: FEATURES, terrains: TERRAIN, nodes: NODES, edges: EDGES, territories: TERRITORIES, convoyPlan: convoyPlan, convoyNight: convoyNight, convoyFee: convoyFee, coinText: coinText, convoyMaxLegs: CONVOY_MAX_LEGS, dangerOf: function (id) { return dangerOf(NODES[id]); }, mountMinutesPerMile: MOUNT_MINUTES_PER_MILE, convoyPace: CONVOY_PACE, haltEvents: HALT_EVENTS, travelEventPlan: travelEventPlan, travelEvents: TRAVEL_EVENTS, campEventPlan: campEventPlan, campEvents: CAMP_EVENTS, campChance: CAMP_CHANCE, travelCooldownDays: TRAVEL_COOLDOWN_DAYS, travelChance: TRAVEL_CHANCE, route: route, duration: duration, span: span, label: label, travelPlan: travelPlan, north: NORTH };
})(typeof window !== "undefined" ? window : global);
