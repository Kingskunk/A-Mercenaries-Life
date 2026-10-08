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
 * Adding a tile: one entry in NODES and one or more in EDGES here, and nothing else. The scene does not list tiles (the map panel owns picking and writes the tile the player
 * picked into ow_dest), so the world can grow to hundreds of tiles without touching a scene. tools/check_overworld_map.js checks this file is well formed.
 *
 * climate (optional, default 0) is how many steps colder (negative) or hotter (positive) the tile runs than Port Valen. The scene feeds it to climate_shift before it charges the exposure of a leg
 * and before the temperature is read, so a cold night in the uplands costs more than the same night on the coast. It moves temperature only: rain, storms, fog and snow are still one weather for
 * every tile. water (optional) is a short phrase ("the river") for a tile with fresh water at hand; the scene's ow_water flag turns the lye soap on there (equipment.txt water_at_hand).
 * here is the line shown when the player stands on the tile. A tile may also carry hereNight (shown at Night and Pre-Dawn) and hereStorm (shown in dangerous weather, which wins over the
 * night line), so the approach to a town looks different by lamplight or in a gale; overworld.txt ow_here picks one. Each is a plain sentence or two, no people to be named.
 * also (optional) is a second terrain for a tile that is two things at once (a road through hills, wooded hills): one of the same kinds, drawn as a ring of its colour round the tile's own colour, and named
 * on the card ("Forest and hills"). It changes nothing else. kind picks the tile's colour in the panel: "city", "town", "village", "road", "hills", "forest" (add a kind here and a colour in overworldmap.css).
 * territory (required) is who holds the tile: an id in TERRITORIES below. Every tile so far belongs to the Gilded Scales (the user's call, 2026-10-08). It is data only for now: nothing in the panel or the
 * scenes reads it yet, so it is the place to hang tolls, patrols, escort pay and danger by owner later. A new territory is one entry in TERRITORIES.
 * walk, camp, depart and arrive (optional) are plain text for the caravan escort (radiant/hall_escort.txt), written to read the same in either direction: walk describes the road as the line comes in to
 * this tile, camp is the ground when the line makes camp here, depart is how the line pulls out from here, and arrive is how it comes in when this tile is the end of the road. A road, forest or hills tile needs a walk.
 * x and y are the tile's place on the map in grid units (east and south positive); the panel scales them.
 * image (optional) is a picture drawn inside the tile's circle in place of the plain colour, for when the tiles get art: a URL or data: URI, circular crop. None have one yet.
 */
(function (root) {
  "use strict";

  // 24 minutes a mile (2.5 mph, short breaks included): a day's march is 20 miles in 8 hours of walking, the 8-hour travel day of the tabletop rules and about what a loaded walker manages on a
  // road. Set at the user's call (2026-10-07), who preferred the realistic pace to a padded one. A camp on the road (overworld.txt ow_camp) is where the rest of the day goes; walking the whole
  // 40 miles to Timbermouth without a camp is 16 hours on your feet, and the tiles are 10 miles (4 hours) apart so a camp falls after a sensible day's walk (two tiles, 20 miles).
  var MINUTES_PER_MILE = 24;

  // Which way north lies on the map as it is drawn, in degrees clockwise from straight up the screen (0 = north is up). The map panel draws a compass from this and lets the player turn the map
  // in quarter turns, the compass turning with it. It changes nothing about the tiles or distances. The map is laid out with north up (geography settled 2026-10-08, the user's call: the Grey
  // River comes down to the city from a fork in the north, shaped like a Y: Alderford lies up the east arm (the Grey proper) and Timbermouth up the west arm (the Ashrun), so the road to Timbermouth leaves Port Valen by the River Gate, follows the river north to the fork, and runs
  // north-north-west, drawn running up the screen with a slight lean to the left; the Charter Gate's old imperial road runs east, away from it).
  var NORTH = 0;

  // Who holds the land. Add a territory here and give its tiles its id.
  var TERRITORIES = {
    scales: { name: "The Gilded Scales" }
  };

  var NODES = {
    pv: {
      name: "Port Valen", kind: "city", x: 0.0, y: 0.0, region: "The coast",
      territory: "scales",
      depart: "The gate end of the line lurches forward, ox by ox, and the wagons take up the weight of their loads with a groan of axles. The yard's gate swings shut behind the tail wagon, and the River Road bends away north along the cuttings above the Grey, paved and rutted and wide enough for two wagons to pass.",
      walk: "The paving runs smooth and well kept, rutted by wagon wheels, with the Grey slow beside it and the grey city wall growing ahead.",
      arrive: "The line comes down the last of the cuttings to the carters' yards outside the River Gate, where the grey wall rises above the fences and the gate stands open on the city.",
      info: "The free port and the Gilded Scales' seat. The River Gate opens onto the Grey River road, which runs north along the river.",
      here: "The city's wall stands behind you, and the river road runs north from the River Gate along the cuttings of the Grey."
    },
    r1: {
      name: "The River Road", kind: "road", x: -0.72, y: -0.74, region: "The river cuttings",
      territory: "scales",
      walk: "The paved road runs along the cuttings above the Grey, wide enough for two wagons to pass, with the river sliding by below it.",
      info: "The Grey River road, paved and well kept this close to the city, with salt and wine wagons on it, running along the cuttings above the river.",
      here: "The road runs straight and paved along the cuttings, rutted by wagon wheels, with the Grey River below it."
    },
    r2: {
      name: "Ashrun Mouth", kind: "road", x: -0.83, y: -1.83, region: "The river fork",
      territory: "scales",
      walk: "The cuttings climb and fall, the river shows between the trees and goes again, and the road comes down to a place where two rivers meet.",
      camp: "The Ashrun comes down from the west over a bar of grey stones and winds its brown water into the green of the Grey for a stretch before the two run as one. The road keeps to the bank, with flat ground beside it and the shingle running down to the water.",
      water: "the river",
      info: "The road runs along the bank here, where the Ashrun comes down from the west and meets the Grey River. The two make one river, and the road runs alongside",
      here: "The river runs broad and slow beside the road, and the Ashrun comes in from the west over a bar of grey stones, its brown water running beside the clearer water of the Grey for a stretch before the two run as one. A track branches off up the Ashrun's bank into the trees."
    },
    r3: {
      name: "Longshade Edge", kind: "forest", also: "hills", x: -1.67, y: -2.5, region: "The edge of the Longshade",
      territory: "scales",
      walk: "The road runs through wooded hills, climbing or falling in long slow steps. The paving is broken stone, and the stone gives way to packed earth with a rut down either side, with the forest close on the far side, dark and near.",
      climate: -1,
      info: "The road climbs through wooded hills along the edge of the Longshade, with wagon tracks turning off into the trees.",
      here: "The road climbs between wooded slopes, its paving broken and patched, with the forest standing close on its far side, dark under its trees, and wagon tracks turning off into it."
    },
    tm: {
      name: "Timbermouth", kind: "town", x: -2.0, y: -3.46, region: "The Longshade",
      territory: "scales",
      depart: "The line pulls out from the road end past the squat stone watch post, the oxen leaning into their yokes and the wagons groaning behind them, and the clearing falls away behind the tail wagon as the road enters the trees.",
      walk: "The road runs down out of the hills and the forest closes in on both sides, and then the trees thin and the sky opens, and the road runs straight into a long clearing with smoke over it.",
      arrive: "The line comes down off the last of the hill into the clearing at the road's end, where a squat stone watch post stands beside the road and the roofs of Timbermouth rise beyond it.",
      info: "A road town at the mouth of the Longshade, up from the Grey River, where three smaller roads meet the road from the river.",
      here: "The road comes out of the trees onto cleared ground, and Timbermouth lies ahead at the mouth of the forest: grey shingled roofs, long ranks of stacked ash on the near side, and a thread of smoke over the sawmill. The thin whine of the saw frame carries up the road, and the smell of cut pine comes with it.",
      hereNight: "Timbermouth is a low scatter of lamplight at the mouth of the forest. A single lantern burns at the road end, and the stacked ash behind it is only a darker dark. The saw frame is silent, and the smell of cut pine hangs in the cold air.",
      hereStorm: "Timbermouth stands ahead with its shutters closed and its shed roofs streaming, and the saw frame is still. A lantern swings at the road end, throwing a little yellow light across the wet paving."
    },
    // The two satellite villages (quest/TIMBERMOUTH_PLAN.md section 4), added 2026-10-07 as map tiles only: no place scenes yet, so there is no way into either from the road until they are built.
    // Names are provisional and invented. A village is smaller than a town: no camping on it (it has its own barns and roofs), and its own entry option comes with its scene.
    fv: {
      name: "Barleycross", kind: "village", x: -1.36, y: -4.06, region: "The farm country",
      territory: "scales",
      info: "A farming village at a crossing of farm roads, six miles from Timbermouth. It feeds the town: barley, oats, root vegetables, hay, milk, eggs, pigs and poultry, and it raises mules and working horses.",
      here: "Low fields of barley and oats spread out on either side of the road, divided by hedges and ditches, and a cluster of thatched and shingled roofs stands at the crossing ahead, with the sails of a grain mill turning slowly beyond them. The air smells of cut hay and manure.",
      hereNight: "Barleycross is a few lit windows in the dark of the fields, with a dog barking somewhere among the farms and the smell of hay on the cold air.",
      hereStorm: "Barleycross lies low under the rain, the fields flat and sodden on either side of the road and every shutter closed against the wind."
    },
    fo: {
      name: "Ashrun Holt", kind: "village", x: -2.94, y: -3.9, region: "The Longshade",
      territory: "scales",
      water: "the Ashrun",
      info: "A forest village in a clearing where the Ashrun runs out from under the trees, nine miles from Timbermouth. It lives by the Longshade: cutters, sawyers and charcoal burners.",
      here: "The road narrows to a track between the trunks, and the village opens in a clearing where the Ashrun comes down out of the trees: low log houses with bark roofs, logs stacked in long ranks, and blue charcoal smoke hanging under the canopy. The air smells of resin and wet bark, and the sound of axes carries from somewhere deeper in.",
      hereNight: "Ashrun Holt is a handful of red windows in the dark under the trees, with a charcoal burner's fire glowing low beyond the last house and the Ashrun loud in the silence.",
      hereStorm: "The forest roars over the village, and the Ashrun is brown and loud in its bed. Every house is shut, and the bark roofs steam under the rain."
    }
  };

  // Each way between two tiles, in miles. Every way works both directions.
  var EDGES = [
    ["pv", "r1", 10],
    ["r1", "r2", 10],
    ["r2", "r3", 10],
    ["r3", "tm", 10],
    ["tm", "fv", 6],
    ["tm", "fo", 9]
  ];

  var adj = {};
  Object.keys(NODES).forEach(function (id) { adj[id] = []; });
  EDGES.forEach(function (e) {
    adj[e[0]].push({ to: e[1], miles: e[2] });
    adj[e[1]].push({ to: e[0], miles: e[2] });
  });

  // The shortest way from one tile to another (by miles), by Dijkstra: the map is tiny, so a plain scan is enough.
  function route(from, to) {
    if (!NODES[from] || !NODES[to]) return { ok: false, path: [], legs: [], miles: 0, minutes: 0 };
    var dist = {}, prev = {}, done = {};
    Object.keys(NODES).forEach(function (id) { dist[id] = Infinity; });
    dist[from] = 0;
    for (; ;) {
      var cur = null, best = Infinity;
      Object.keys(dist).forEach(function (id) { if (!done[id] && dist[id] < best) { best = dist[id]; cur = id; } });
      if (cur === null || cur === to) break;
      done[cur] = true;
      adj[cur].forEach(function (n) {
        var d = dist[cur] + n.miles;
        if (d < dist[n.to]) { dist[n.to] = d; prev[n.to] = cur; }
      });
    }
    if (dist[to] === Infinity) return { ok: false, path: [], legs: [], miles: 0, minutes: 0 };
    var path = [to];
    while (path[0] !== from) path.unshift(prev[path[0]]);
    // one entry per road walked, so a journey can be charged leg by leg (the weather changes while you walk)
    var legs = [];
    for (var i = 0; i < path.length - 1; i++) {
      var m = 0;
      adj[path[i]].forEach(function (n) { if (n.to === path[i + 1]) m = n.miles; });
      legs.push({ from: path[i], to: path[i + 1], miles: m, minutes: m * MINUTES_PER_MILE });
    }
    return { ok: true, path: path, legs: legs, miles: dist[to], minutes: dist[to] * MINUTES_PER_MILE };
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

  root.Overworld = { MINUTES_PER_MILE: MINUTES_PER_MILE, nodes: NODES, edges: EDGES, territories: TERRITORIES, route: route, duration: duration, span: span, label: label, north: NORTH };
})(typeof window !== "undefined" ? window : global);
