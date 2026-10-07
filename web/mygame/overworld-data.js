/*
 * overworld-data.js: the overworld map's tiles and roads, and the one function that turns a journey into miles and minutes.
 *
 * The map panel (overworldmap.js) draws from this file, and the scene scenes/overworld/overworld.txt reads it through *script (the same way names.txt reads the name
 * generator), so the map and the trip can never disagree about a distance. Nothing here is random.
 *
 *   Overworld.route("tm", "pv")   ->  { ok: true, path: ["tm","r3","r2","r1","pv"], legs: [{ from:"tm", to:"r3", miles:10, minutes:360 }, ...], miles: 40, minutes: 1440 }
 *   Overworld.label("pv", "tm")   ->  "40 miles, about a day on foot"
 *   Overworld.duration(1440)      ->  "about a day"
 *
 * Adding a tile: one entry in NODES and one or more in EDGES here, and nothing else. The scene does not list tiles (the map panel owns picking and writes the tile the player
 * picked into ow_dest), so the world can grow to hundreds of tiles without touching a scene. tools/check_overworld_map.js checks this file is well formed.
 *
 * kind picks the tile's colour in the panel: "city", "town", "road", "hills", "forest" (add a kind here and a colour in overworldmap.css).
 * x and y are the tile's place on the map in grid units (east and south positive); the panel scales them.
 * image (optional) is a picture drawn inside the tile's circle in place of the plain colour, for when the tiles get art: a URL or data: URI, circular crop. None have one yet.
 */
(function (root) {
  "use strict";

  // A day's march is 20 miles in 12 hours of walking: 36 minutes a mile. The other half of the day is for eating and sleeping, which a camp on the road (overworld.txt ow_camp) takes;
  // walking 40 miles without a camp is 24 hours on your feet.
  var MINUTES_PER_MILE = 36;

  var NODES = {
    pv: {
      name: "Port Valen", kind: "city", x: 0, y: 0, region: "The coast",
      info: "The free port and the Gilded Scales' seat. The Charter Gate opens onto the old imperial road east.",
      here: "The city's wall stands behind you, and the old road runs east from the Charter Gate."
    },
    r1: {
      name: "The Lower Road", kind: "road", x: 1, y: -0.25, region: "The lowland road",
      info: "The old imperial road, paved and well kept this close to the city, with salt and wine wagons on it.",
      here: "The old road runs straight and paved here, rutted by wagon wheels."
    },
    r2: {
      name: "The Climb", kind: "hills", x: 2, y: 0.2, region: "The eastern uplands",
      info: "The road climbs into wooded uplands here, and the paving grows more worn.",
      here: "The road climbs between wooded slopes, its paving broken and patched."
    },
    r3: {
      name: "The Forest Edge", kind: "forest", x: 3, y: -0.2, region: "The edge of the Longshade",
      info: "The road runs along the edge of the Longshade, with wagon tracks turning off into the trees.",
      here: "The forest stands close on the road's far side, dark under its trees, and wagon tracks turn off into it."
    },
    tm: {
      name: "Timbermouth", kind: "town", x: 4, y: 0, region: "The Longshade",
      info: "A road town at the western mouth of the Longshade, where three smaller roads meet the old imperial road.",
      here: "The town's roofs and stacked timber stand ahead, at the mouth of the forest."
    }
  };

  // Each way between two tiles, in miles. Every way works both directions.
  var EDGES = [
    ["pv", "r1", 10],
    ["r1", "r2", 10],
    ["r2", "r3", 10],
    ["r3", "tm", 10]
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
    for (;;) {
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

  function label(from, to) {
    var r = route(from, to);
    if (!r.ok) return "";
    if (from === to) return "you are here";
    return r.miles + " miles, " + duration(r.minutes) + " on foot";
  }

  root.Overworld = { MINUTES_PER_MILE: MINUTES_PER_MILE, nodes: NODES, edges: EDGES, route: route, duration: duration, label: label };
})(typeof window !== "undefined" ? window : global);
