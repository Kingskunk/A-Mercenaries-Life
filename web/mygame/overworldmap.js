/*
 * OVERWORLD MAP (2026-10-07) -- the point-and-click travel map shown on the overworld page.
 *
 * The map owns picking; the scene owns the trip. While the player is on the overworld (stats.ow_on) and the page carries the one Travel option of scenes/overworld/overworld.txt
 * ("Travel to the tile you picked on the map."), this file hides the plain choice list and draws the whole map from overworld-data.js (window.Overworld): drag to pan, wheel or +/-
 * to zoom, click a tile to read its card. Travel (or a double-click on a tile) writes the picked tile into stats.ow_dest and presses that one real option, the way the trade panel writes
 * its cart and presses its hidden settle option. ow_travel then checks the tile against the same data and decides everything (route, clock, hunger, fatigue), so nothing here can grant a
 * trip the data does not allow. The page lists no tiles, so the map can hold fifty tiles or four hundred without the scene changing.
 *
 * It stores nothing: tiles come from the data file, where the player stands from stats.ow_pos, colours from overworldmap.css (one per tile kind), and the "you will be hungry" lines from
 * the game's own meal and rest thresholds, the weather's extra wear (stats.ow_exposure_pct) and the trail rations carried. On a tile that is not a town the card also offers the camp, which
 * presses the scene's "Make camp for the night" option. Moving between tiles should not feel like loading a page, so while the map is up it turns the engine's half-second page-turn animation off
 * (and gives the player's own animation setting back the moment the map goes away), and it redraws in the same frame the new page arrives. A tile may carry an `image` in the data, drawn inside its circle in place of the plain colour. The Map button on the rail and the M key bring
 * the view back to the player. Without this file the overworld page offers only the single Travel option, so a scripted test sets ow_dest by hand.
 */
(function () {
  "use strict";

  var OW = window.Overworld;
  if (!OW) return;

  var PANEL_ID = "overworldMap";
  var KIND_NAME = { city: "City", town: "Town", village: "Village", fort: "Fort", road: "Road", woodroad: "Wooded road", hills: "Hills", forest: "Forest" };
  var FEATURE_KIND = { range: "Mountain range" };
  var SCALE = 130;          // SVG units per map unit
  var MIN_W = 220;          // closest zoom: this many SVG units across
  var FAR_W = 1500;         // past this width the names of tiles you are not on or selecting are hidden
  var selected = null;      // the tile whose card is showing (null: the tile the player stands on)
  var selectedFeature = null;   // the drawn feature (a mountain range) whose card is showing, instead of a tile's; null for none
  var lastPos = null;       // where the player stood when the view was last placed: a move to a new tile clears the selection and recentres
  var lastSig = "";
  var pressed = false;      // Travel was pressed and the old page has not gone yet
  var view = null;          // { cx, cy, w }: the middle of the picture and how many SVG units wide it shows
  var drag = null;          // an unfinished drag or click
  var rot = 0;              // quarter turns the player has turned the map, clockwise (0 to 3), kept between visits
  try { rot = (Number(window.localStorage.getItem("owMapRot2")) || 0) % 4; } catch (e) { rot = 0; }
  var userAnimate = null;   // the player's own page-turn animation setting, kept while the map has it switched off (null: not switched off)

  function truthy(v) { return v === true || v === "true"; }
  function num(v) { var n = Number(v); return isFinite(n) ? n : 0; }
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function statsNow() { return window.stats || {}; }
  // Can the walker keep going after dark? A lit lantern or torch does it, and so does seeing in the dark (race darkvision, Devil's Sight or the Night-Eye Ring). The worn rings are read here, not
  // from sees_in_dark, because the inventory panel swaps rings without running any ChoiceScript. The scene's trip script (overworld.txt ow_travel) must say the same thing. Poor visibility still halts everyone.
  function nightLight(s) { return (truthy(s.has_hooded_lantern) && truthy(s.has_lamp_oil)) || (truthy(s.has_pitch_torch) && truthy(s.has_tinderbox)) || truthy(s.race_darkvision) || truthy(s.inv_devils_sight) || s.equipped_ring1_id === "night_eye_ring" || s.equipped_ring2_id === "night_eye_ring"; }
  function clockText(m) { m = ((Math.floor(m) % 1440) + 1440) % 1440; return (m < 600 ? "0" : "") + Math.floor(m / 60) + ":" + (m % 60 < 10 ? "0" : "") + (m % 60); }
  function suffix(d) { return (d % 10 === 1 && d !== 11) ? "st" : (d % 10 === 2 && d !== 12) ? "nd" : (d % 10 === 3 && d !== 13) ? "rd" : "th"; }
  function arrivalDate(s, plusDays) {
    var names = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
    var lengths = [30, 31, 32, 31, 31, 31, 31, 30, 30, 28, 30, 30];
    var d = num(s.calendar_day), m = num(s.calendar_month_num), y = num(s.calendar_year);
    for (var i = 0; i < plusDays; i++) { d++; if (d > lengths[m - 1]) { d = 1; m++; if (m > 12) { m = 1; y++; } } }
    return d + suffix(d) + " of " + names[m - 1] + ", " + y + " IR";
  }
  function travelPlan(from, to) {
    var s = statsNow(), now = num(s.clock_hour) * 60 + num(s.clock_minute);
    return OW.travelPlan(from, to, now, nightLight(s), String(s.weather_visibility) === "poor", truthy(s.has_horse));
  }

  // Where a tile is drawn: its map position turned by the quarter turns the player chose. Only positions turn; names and numbers stay upright.
  function P(n) {
    var x = n.x, y = n.y, t;
    for (var i = 0; i < rot; i++) { t = x; x = -y; y = t; }
    return { x: x * SCALE, y: y * SCALE };
  }

  // The options the scene may offer on the newest page: the one Travel option, a way into the town the player stands in, and the camp. Only the newest form: while ChoiceScript fades a page
  // out, the old one is still in the document beside the new one.
  function scanOptions() {
    var forms = document.querySelectorAll("#main form");
    var labels = forms.length ? forms[forms.length - 1].querySelectorAll(".choice label") : [];
    var travel = null, enter = null, camp = null, dawn = null, deliver = [];
    for (var i = 0; i < labels.length; i++) {
      var radio = labels[i].querySelector("input[type=radio]");
      if (!radio || radio.disabled) continue;
      var text = (labels[i].textContent || "").replace(/\s+/g, " ").trim();
      if (/^Travel to the tile you picked/.test(text)) travel = radio;
      else if (/^Make camp/.test(text)) camp = radio;
      else if (/^Go (in|into|back)\b/.test(text)) enter = { radio: radio, text: text };
      else if (/^Deliver /.test(text)) deliver.push({ radio: radio, text: text });   // a courier's parcel for this tile (radiant/hall_courier.txt): one button each, none for a tile nobody wrote
    }
    return travel ? { travel: travel, enter: enter, camp: camp, dawn: dawn, deliver: deliver } : null;
  }

  function available() { return truthy(statsNow().ow_on) && !!scanOptions(); }

  // What the walk will do to you, from the game's own numbers (calendar.txt): hunger and fatigue clocks run faster in bad weather and cold (ow_exposure_pct, what the weather and the gear
  // add right now, a percent), hungry past 18 hours since a meal, starving past 36; exhausted past 20 hours since rest, collapsing past 40; and a trail ration is eaten for you whenever the
  // meal clock reaches 18 hours (advance_time), one per further 18 hours, until they run out. The weather can change on a long walk, so this is the weather of the moment, not a promise.
  function outlook(minutes) {
    var s = statsNow(), pct = num(s.ow_exposure_pct), burn = Math.round(minutes * (100 + pct) / 100), meal = num(s.minutes_since_meal), rest = num(s.minutes_since_rest) + burn;
    var have = truthy(s.has_trail_rations) ? 1 + num(s.spare_trail_rations) : 0, eaten = 0, lines = [];
    if (have > 0 && truthy(s.vane_independent_operative)) {
      var first = meal < 1080 ? 1080 - meal : 0;
      if (burn >= first) {
        eaten = Math.min(1 + Math.floor((burn - first) / 1080), have);
        meal = burn - (first + (eaten - 1) * 1080);
      } else meal += burn;
    } else meal += burn;
    var parts = [];
    if (meal > 2160) parts.push("starving"); else if (meal > 1080) parts.push("hungry");
    if (rest > 2400) parts.push("collapsing"); else if (rest > 1200) parts.push("exhausted");
    if (parts.length) lines.push("You will be " + parts.join(" and ") + " by the time you get there.");
    if (eaten > 0) lines.push("You will eat " + (eaten === 1 ? "a trail ration" : eaten + " trail rations") + " on the way.");
    if (pct > 0) lines.push("Weather and cold wear you down about " + pct + "% faster on the road.");
    return lines;
  }

  /* ---------------------------------------------------------------- the view: pan and zoom */

  function bounds() {
    var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    Object.keys(OW.nodes).forEach(function (id) {
      var n = OW.nodes[id];
      var p = P(n);
      minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
      minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
    });
    // a drawn feature (a mountain range) stays in view with the tiles: the corners of its art's box, in map units, turned like a tile
    (OW.features || []).forEach(function (f) {
      var art = (window.OVERWORLD_ART || {})[f.art];
      if (!art) return;
      [[art.bbox[0], art.bbox[1]], [art.bbox[2], art.bbox[1]], [art.bbox[0], art.bbox[3]], [art.bbox[2], art.bbox[3]]].forEach(function (c) {
        var p = P({ x: c[0] / art.unit, y: c[1] / art.unit });
        minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
        minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
      });
    });
    return { minX: minX, maxX: maxX, minY: minY, maxY: maxY };
  }

  function box() { var el = document.getElementById(PANEL_ID); var s = el && el.querySelector(".ow-svg"); return s ? { el: s, w: s.clientWidth || 600, h: s.clientHeight || 300 } : null; }

  // The whole map in view, or at most a comfortable stretch of it for a big one.
  function fit() {
    var b = bounds(), bx = box(), aspect = bx ? bx.h / bx.w : 0.5;
    var w = Math.max(b.maxX - b.minX + 200, (b.maxY - b.minY + 200) / aspect, 420);
    view = { cx: (b.minX + b.maxX) / 2, cy: (b.minY + b.maxY) / 2, w: w };
  }

  // A small map shows whole; a big one opens on the player at a comfortable zoom.
  function centerOnMe() {
    var n = OW.nodes[statsNow().ow_pos];
    if (!n) return;
    var b = bounds(), full = Math.max(b.maxX - b.minX + 200, 420);
    if (full <= 1000) { fit(); return; }
    var pn = P(n);
    view = { cx: pn.x, cy: pn.y, w: 760 };
  }

  function applyView() {
    var bx = box();
    if (!bx || !view) return;
    var h = view.w * (bx.h / bx.w);
    bx.el.setAttribute("viewBox", (view.cx - view.w / 2) + " " + (view.cy - h / 2) + " " + view.w + " " + h);
    var far = view.w > FAR_W;
    if (bx.el.classList.contains("ow-far") !== far) bx.el.classList.toggle("ow-far", far);
  }

  function zoomAt(factor, px, py) {
    var bx = box();
    if (!bx || !view) return;
    var b = bounds(), maxW = Math.max((b.maxX - b.minX + 200) * 1.6, 1200);
    var nw = Math.min(maxW, Math.max(MIN_W, view.w * factor)), h = view.w * (bx.h / bx.w);
    // keep the point under the cursor where it is: (px, py) are 0..1 across the picture
    var wx = view.cx - view.w / 2 + px * view.w, wy = view.cy - h / 2 + py * h;
    var nh = nw * (bx.h / bx.w);
    view = { cx: wx - px * nw + nw / 2, cy: wy - py * nh + nh / 2, w: nw };
    applyView();
  }

  /* ---------------------------------------------------------------- drawing */

  function svg(here, sel) {
    var ids = Object.keys(OW.nodes), onRoute = {}, defs = "";
    if (sel && sel !== here) {
      var r = OW.route(here, sel);
      for (var i = 0; i < r.path.length - 1; i++) { onRoute[r.path[i] + ">" + r.path[i + 1]] = true; onRoute[r.path[i + 1] + ">" + r.path[i]] = true; }
    }
    var out = "";
    // Features first, so the roads and tiles sit on top of them. The art is drawn in its own units (130 to a map unit), so the group scales it to the panel and turns it with the map (a quarter turn
    // is rotate(90), the same turn P() gives a tile); the paths come straight from the SVG file (tools/gen_overworld_art.js). The name sits on the range, upright.
    (OW.features || []).forEach(function (f) {
      var art = (window.OVERWORLD_ART || {})[f.art];
      if (!art) return;
      out += "<g class=\"ow-feature ow-f-" + esc(f.kind) + (selectedFeature === f.id ? " ow-feature-sel" : "") + "\" data-ow-feature=\"" + esc(f.id) + "\" tabindex=\"0\" role=\"button\" aria-label=\"" + esc(f.name) + "\" transform=\"rotate(" + (90 * rot) + ") scale(" + (SCALE / art.unit) + ")\">" +
        art.paths.map(function (p) { return "<path d=\"" + esc(p.d) + "\"" + (p.c ? " class=\"" + esc(p.c) + "\"" : "") + (p.t ? " transform=\"" + esc(p.t) + "\"" : "") + "/>"; }).join("") + "</g>";
      if (f.label) { var lp = P({ x: f.label[0], y: f.label[1] }); out += "<text class=\"ow-feature-name\" x=\"" + lp.x + "\" y=\"" + lp.y + "\" text-anchor=\"middle\">" + esc(f.name) + "</text>"; }
    });
    // Rectangles the "10 mi" labels must keep clear of: every town circle and every name (as drawn below), then the labels already placed.
    var taken = [];
    ids.forEach(function (id) {
      var n = OW.nodes[id], pp = P(n), big = n.kind === "city" ? 26 : (n.kind === "town" ? 22 : ((n.kind === "village" || n.kind === "fort") ? 18 : 15)), half = String(n.name).length * 4.6 + 6;
      taken.push([pp.x - big - 9, pp.y - big - 9, pp.x + big + 9, pp.y + big + 9]);
      taken.push([pp.x - half, pp.y + big + 4, pp.x + half, pp.y + big + 28]);
    });
    function hits(r) { return taken.some(function (t) { return r[0] < t[2] && r[2] > t[0] && r[1] < t[3] && r[3] > t[1]; }); }
    OW.edges.forEach(function (e) {
      var a = OW.nodes[e[0]], b = OW.nodes[e[1]], hot = onRoute[e[0] + ">" + e[1]];
      var pa = P(a), pb = P(b), terrain = e[3] || "road";
      out += "<line class=\"ow-edge" + (terrain !== "road" ? " ow-edge-" + terrain : "") + (hot ? " ow-edge-route" : "") + "\" x1=\"" + pa.x + "\" y1=\"" + pa.y + "\" x2=\"" + pb.x + "\" y2=\"" + pb.y + "\"/>";
      // Try the middle of the leg first, then other spots along it, above the line and then below. A near-vertical leg can have no clear vertical position at all, so its last candidates move out to either side of the line.
      var label = String(e[2]) + " mi", w = label.length * 4.2 + 4, pick = null;
      [0.5, 0.4, 0.6, 0.3, 0.7, 0.25, 0.75].some(function (t) {
        return [-14, 22].some(function (dy) {
          var mx = pa.x + (pb.x - pa.x) * t, my = pa.y + (pb.y - pa.y) * t + dy, r = [mx - w, my - 13, mx + w, my + 4];
          if (hits(r)) return false;
          pick = { x: mx, y: my, r: r };
          return true;
        });
      });
      if (!pick) {
        var vx = pb.x - pa.x, vy = pb.y - pa.y, len = Math.sqrt(vx * vx + vy * vy);
        if (len) {
          [0.5, 0.6, 0.7, 0.4, 0.3].some(function (t) {
            return [-24, 24, -38, 38].some(function (side) {
              var mx = pa.x + vx * t - vy * side / len, my = pa.y + vy * t + vx * side / len, r = [mx - w, my - 13, mx + w, my + 4];
              if (hits(r)) return false;
              pick = { x: mx, y: my, r: r };
              return true;
            });
          });
        }
      }
      if (!pick) { var fx = (pa.x + pb.x) / 2, fy = (pa.y + pb.y) / 2 - 14; pick = { x: fx, y: fy, r: [fx - w, fy - 13, fx + w, fy + 4] }; }
      taken.push(pick.r);
      out += "<text class=\"ow-miles\" x=\"" + pick.x + "\" y=\"" + pick.y + "\" text-anchor=\"middle\">" + label + "</text>";
    });
    ids.forEach(function (id, k) {
      var n = OW.nodes[id], pp = P(n), x = pp.x, y = pp.y, big = n.kind === "city" ? 26 : (n.kind === "town" ? 22 : ((n.kind === "village" || n.kind === "fort") ? 18 : 15));
      out += "<g class=\"ow-node ow-k-" + esc(n.kind) + (id === here ? " ow-here" : "") + (id === sel ? " ow-sel" : "") + "\" data-ow-tile=\"" + esc(id) + "\" tabindex=\"0\" role=\"button\" aria-label=\"" + esc(n.name) + "\">";
      if (id === here) out += "<circle class=\"ow-ring\" cx=\"" + x + "\" cy=\"" + y + "\" r=\"" + (big + 9) + "\"/>";
      if (id === sel && id !== here) out += "<circle class=\"ow-selring\" cx=\"" + x + "\" cy=\"" + y + "\" r=\"" + (big + 7) + "\"/>";
      out += "<circle class=\"ow-dot\" cx=\"" + x + "\" cy=\"" + y + "\" r=\"" + big + "\"/>";
      if (n.also && KIND_NAME[n.also]) out += "<circle class=\"ow-alsoring ow-a-" + esc(n.also) + "\" cx=\"" + x + "\" cy=\"" + y + "\" r=\"" + (big + 4) + "\"/>";
      if (n.image) {
        // a picture in the circle, cropped round, over the colour (which stays as the edge and the fallback)
        defs += "<clipPath id=\"ow-clip-" + k + "\"><circle cx=\"" + x + "\" cy=\"" + y + "\" r=\"" + (big - 1.5) + "\"/></clipPath>";
        out += "<image class=\"ow-img\" href=\"" + esc(n.image) + "\" x=\"" + (x - big) + "\" y=\"" + (y - big) + "\" width=\"" + big * 2 + "\" height=\"" + big * 2 + "\" preserveAspectRatio=\"xMidYMid slice\" clip-path=\"url(#ow-clip-" + k + ")\"/>";
      }
      out += "<text class=\"ow-name\" x=\"" + x + "\" y=\"" + (y + big + 20) + "\" text-anchor=\"middle\">" + esc(n.name) + "</text></g>";
    });
    return "<svg class=\"ow-svg\" role=\"img\" aria-label=\"Map of the road\"><defs>" + defs + "</defs>" + out + "</svg>";
  }

  // The card for a drawn feature: what it is, and the one line that says what it means for travel. No travel button: nothing routes through one.
  function featureCard(f) {
    var html = "<div class=\"ow-card\">";
    html += "<div class=\"ow-card-head\"><i class=\"ow-key ow-f-" + esc(f.kind) + "-key\"></i><b>" + esc(f.name) + "</b></div>";
    html += "<div class=\"ow-card-sub\">" + esc(FEATURE_KIND[f.kind] || f.kind) + "</div>";
    if (f.info) html += "<p>" + esc(f.info) + "</p>";
    if (f.line) html += "<div class=\"ow-card-warn\">" + esc(f.line) + "</div>";
    html += "<button type=\"button\" class=\"ow-btn\" data-ow-act=\"unpick\">Back to where I stand</button>";
    return html + "</div>";
  }
  function featureById(id) { var r = null; (OW.features || []).forEach(function (f) { if (f.id === id) r = f; }); return r; }

  function card(here, sel, opts) {
    var show = sel || here, n = OW.nodes[show], html = "<div class=\"ow-card\">";
    html += "<div class=\"ow-card-head\"><i class=\"ow-key ow-k-" + esc(n.kind) + "\"></i><b>" + esc(n.name) + "</b></div>";
    html += "<div class=\"ow-card-sub\">" + esc((KIND_NAME[n.kind] || n.kind) + (n.also && KIND_NAME[n.also] ? " and " + KIND_NAME[n.also].toLowerCase() : "")) + " &middot; " + esc(n.region) + "</div>";
    html += "<p>" + esc(n.info) + "</p>";
    if (n.water) html += "<div class=\"ow-card-line\">Fresh water here: " + esc(n.water) + ".</div>";
    if (show === here) {
      html += "<div class=\"ow-card-line\">You are here.</div>";
      if (opts.enter) html += "<button type=\"button\" class=\"ow-btn\" data-ow-act=\"enter\">" + esc(opts.enter.text.replace(/\.$/, "")) + "</button>";
      (opts.deliver || []).forEach(function (d, i) { html += "<button type=\"button\" class=\"ow-btn ow-deliver\" data-ow-act=\"deliver\" data-ow-i=\"" + i + "\">" + esc(d.text.replace(/\.$/, "")) + "</button>"; });
      if (opts.camp) html += "<div class=\"ow-card-line\">Make camp here to sleep, rest, eat or drill.</div><button type=\"button\" class=\"ow-btn\" data-ow-act=\"camp\">Make camp</button>";
      if (opts.dawn) html += "<button type=\"button\" class=\"ow-btn\" data-ow-act=\"dawn\">" + esc(opts.dawn.text.replace(/^Make camp and /, "").replace(/\.\s*(\[~?)/, " $1").replace(/^s/, "S")) + "</button>";
    } else {
      var r = OW.route(here, show);
      if (r.ok) {
        var plan = travelPlan(here, show);
        html += "<div class=\"ow-card-line\"><b>" + r.miles + " miles</b>, " + esc(OW.duration(plan.minutes)) + " total" + (plan.mounted ? ", riding" : "") + ".</div>";
        // ground that is not road, by terrain: how far it runs and how much slower it is (a mile of it takes this many road miles' time)
        var rough = {};
        r.legs.forEach(function (l) { if (l.terrain && l.terrain !== "road") rough[l.terrain] = (rough[l.terrain] || 0) + l.miles; });
        Object.keys(rough).forEach(function (t) {
          var T = (OW.terrains || {})[t] || { name: t, pace: 100 };
          html += "<div class=\"ow-card-warn\">" + rough[t] + " mile" + (rough[t] === 1 ? "" : "s") + " of " + esc(T.name) + ": " + (T.pace === 200 ? "twice as slow as a road" : (T.pace + "% of a road mile's time")) + ".</div>";
        });
        html += "<div class=\"ow-card-line\"><b>Estimated arrival:</b> " + esc(arrivalDate(statsNow(), plan.arrivalDayOffset) + " at " + clockText(plan.arrivalMinute)) + ".</div>";
        if (plan.duskMiles) html += "<div class=\"ow-card-warn\">" + plan.duskMiles + " mile" + (plan.duskMiles === 1 ? "" : "s") + " at dusk: slower pace.</div>";
        if (plan.nightMiles) html += "<div class=\"ow-card-warn\">" + plan.nightMiles + " mile" + (plan.nightMiles === 1 ? "" : "s") + " in darkness: slow night pace.</div>";
        if (plan.nightStops) html += "<div class=\"ow-card-warn\">Roadside halt until daylight " + (plan.nightStops === 1 ? "is" : "are") + " expected" + (nightLight(statsNow()) ? " because visibility is poor." : "; bring a lit lantern or torch to continue after dark.") + "</div>";
        outlook(plan.minutes).forEach(function (w) { html += "<div class=\"ow-card-warn\">" + esc(w) + "</div>"; });
        html += "<button type=\"button\" class=\"ow-btn ow-go\" data-ow-act=\"go\">Travel to " + esc(n.name) + "</button>";
      } else {
        html += "<div class=\"ow-card-warn\">There is no road from here to " + esc(n.name) + ".</div>";
      }
    }
    return html + "</div>";
  }

  function legend() {
    return "<div class=\"ow-legend\">" + Object.keys(KIND_NAME).map(function (k) { return "<span><i class=\"ow-key ow-k-" + k + "\"></i> " + KIND_NAME[k] + "</span>"; }).join("") +
      "<span class=\"ow-spacer\"></span><span class=\"ow-hint\">Drag to move, scroll to zoom, click a tile and press Space to travel.</span></div>";
  }

  // A compass in the corner: the needle points to north, from the map's own bearing (Overworld.north) and the quarter turns the player has made.
  function compass() {
    var a = ((Number(OW.north) || 0) + rot * 90) % 360;
    return "<div class=\"ow-compass\" title=\"North\" aria-label=\"Compass, north is marked N\"><svg viewBox=\"-36 -36 72 72\" width=\"58\" height=\"58\"><circle r=\"25\" class=\"ow-comp-ring\"/><g transform=\"rotate(" + a + ")\"><polygon points=\"0,-21 6,2 0,-3 -6,2\" class=\"ow-comp-n\"/><polygon points=\"0,21 5,2 0,5 -5,2\" class=\"ow-comp-s\"/><text class=\"ow-comp-t\" text-anchor=\"middle\" dominant-baseline=\"central\" transform=\"translate(0,-31) rotate(" + (-a) + ")\">N</text></g></svg></div>";
  }

  function controls() {
    return "<div class=\"ow-ctl\"><button type=\"button\" data-ow-act=\"zoomin\" title=\"Zoom in\" aria-label=\"Zoom in\">+</button><button type=\"button\" data-ow-act=\"zoomout\" title=\"Zoom out\" aria-label=\"Zoom out\">&minus;</button>" +
      "<button type=\"button\" data-ow-act=\"rotate\" title=\"Turn the map a quarter turn\" aria-label=\"Turn the map\">&#8635;</button><button type=\"button\" data-ow-act=\"center\" title=\"Back to you (M)\" aria-label=\"Centre on you\">Me</button><button type=\"button\" data-ow-act=\"fit\" title=\"Show the whole map\" aria-label=\"Show the whole map\">All</button></div>";
  }

  function build(opts) {
    var here = statsNow().ow_pos;
    if (!OW.nodes[here]) return "";
    var sel = selected && OW.nodes[selected] ? selected : null;
    var feat = selectedFeature ? featureById(selectedFeature) : null;
    return "<div class=\"ow-main\"><div class=\"ow-mapbox\">" + svg(here, sel) + compass() + controls() + "</div>" + (feat ? featureCard(feat) : card(here, sel, opts)) + "</div>" + legend();
  }

  /* ---------------------------------------------------------------- no page-turn while travelling */

  // The engine cross-fades each page for half a second (ui.js, window.animateEnabled). On the overworld that reads as loading a page for every move, so it is off from the first Travel press
  // until the player leaves the map, and then the player's own setting is put back. Pressing "go into town" restores it first, so that page-turn plays as normal.
  function quiet(on) {
    if (on) {
      if (userAnimate === null) userAnimate = window.animateEnabled;
      window.animateEnabled = false;
    } else if (userAnimate !== null) {
      window.animateEnabled = userAnimate;
      userAnimate = null;
    }
  }

  /* ---------------------------------------------------------------- pressing the real option */

  function press(radio) {
    if (!radio || pressed || !radio.form || !document.documentElement.contains(radio)) return;
    pressed = true;
    radio.checked = true;
    if (typeof radio.form.onsubmit === "function") radio.form.onsubmit();
  }

  // Writes the picked tile where the scene reads it, then presses the one Travel option. The scene checks the tile against the data and refuses anything it does not allow.
  function travel(id) {
    var o = scanOptions();
    if (!o || !OW.nodes[id] || id === statsNow().ow_pos) return;
    statsNow().ow_dest = id;
    quiet(true);
    press(o.travel);
  }

  /* ---------------------------------------------------------------- page wiring */

  function remove() {
    var el = document.getElementById(PANEL_ID);
    if (el && el.parentNode) el.parentNode.removeChild(el);
    document.body.classList.remove("owMapOn");
    lastSig = "";
  }

  function scan() {
    var s = statsNow(), opts = truthy(s.ow_on) ? scanOptions() : null;
    if (!opts) {
      remove();
      // Between two overworld pages the new form has not arrived yet for a moment: that is not leaving the map, so the animation stays off. Only ow_on turning false gives it back.
      if (!truthy(s.ow_on)) { selected = null; selectedFeature = null; lastPos = null; view = null; quiet(false); }
      return;
    }
    var moved = s.ow_pos !== lastPos;
    if (moved) {
      // a move clears the selection; the view stays where the player had it (zoom and all) unless the new tile would be off the edge of it
      // an interrupted trip (a road event stopped it) keeps its goal picked, so continuing is one click
      var goal = String(s.ow_goal || "none");
      selected = (goal !== "none" && goal !== s.ow_pos && OW.nodes[goal]) ? goal : null; selectedFeature = null; lastPos = s.ow_pos;
      var np = OW.nodes[s.ow_pos], bx0 = box();
      if (!view || !np || !bx0) view = null;
      else {
        var h0 = view.w * (bx0.h / bx0.w), pnp = P(np), mx = pnp.x, my = pnp.y;
        if (mx < view.cx - view.w / 2 + 60 || mx > view.cx + view.w / 2 - 60 || my < view.cy - h0 / 2 + 60 || my > view.cy + h0 / 2 - 60) { view.cx = mx; view.cy = my; }
      }
    }
    var sig = [s.ow_pos, selected, selectedFeature, opts.enter ? opts.enter.text : "", (opts.deliver || []).map(function (d) { return d.text; }).join("|"), num(s.minutes_since_meal), num(s.minutes_since_rest), rot, num(s.ow_exposure_pct), truthy(s.has_trail_rations) ? 1 + num(s.spare_trail_rations) : 0, opts.camp ? "camp" : "", opts.dawn ? opts.dawn.text : "", Object.keys(OW.nodes).length].join("|");
    var el = document.getElementById(PANEL_ID);
    if (el && sig === lastSig) return;
    if (sig !== lastSig) pressed = false; // a new page of options: the old press is over
    var fresh = false;
    if (!el) {
      fresh = true;
      el = document.createElement("div");
      el.id = PANEL_ID;
      var forms = document.querySelectorAll("#main form"), f = forms.length ? forms[forms.length - 1] : null;
      if (!f || !f.parentNode) return;
      f.parentNode.insertBefore(el, f);
    }
    el.innerHTML = build(opts);
    document.body.classList.add("owMapOn");
    lastSig = sig;
    if (!view) centerOnMe();
    applyView();
    if (fresh) bringIntoView();
  }

  // A new overworld page opens scrolled to the top, with the place and weather text above the map, so the lower half of the map is off screen. Once per new page (never on a tile click, zoom or pan, which
  // only redraw the same panel), scroll so the map's top edge sits just under the top of the visible area; the text above is one scroll up. The page scrolls inside #main, not the window, so the visible area
  // is that of the nearest scrolling ancestor. Waits a moment because the page change itself resets the scroll position.
  function scroller(el) {
    for (var e = el.parentElement; e && e !== document.documentElement; e = e.parentElement) {
      var oy = window.getComputedStyle(e).overflowY;
      if ((oy === "auto" || oy === "scroll") && e.scrollHeight > e.clientHeight + 2) return e;
    }
    return null;
  }
  function bringIntoView() {
    setTimeout(function () {
      var el = document.getElementById(PANEL_ID);
      if (!el) return;
      var sc = scroller(el), r = el.getBoundingClientRect();
      var top = sc ? sc.getBoundingClientRect().top : 0, bottom = sc ? sc.getBoundingClientRect().bottom : (window.innerHeight || document.documentElement.clientHeight);
      if (r.top >= top && r.bottom <= bottom) return;   // already all in view
      if (sc) sc.scrollTop = Math.max(0, sc.scrollTop + (r.top - top) - 12);
      else window.scrollTo(0, Math.max(0, (window.pageYOffset || document.documentElement.scrollTop || 0) + r.top - 12));
    }, 250);
  }

  function toggle() { centerOnMe(); applyView(); }

  function tileOf(el) { return el && el.closest ? el.closest("[data-ow-tile]") : null; }
  function featureOf(el) { return el && el.closest ? el.closest("[data-ow-feature]") : null; }
  function inPanel(el) { var p = document.getElementById(PANEL_ID); return !!(p && el && p.contains(el)); }

  // Drag to pan: a pointer that goes down on the picture and moves more than a few pixels is a drag; one that does not is a click, on the tile it went down on.
  document.addEventListener("pointerdown", function (ev) {
    if (ev.button !== 0 || !inPanel(ev.target)) return;
    var bx = box();
    if (!bx || !bx.el.contains(ev.target) || ev.target.closest("[data-ow-act]")) return;
    drag = { x: ev.clientX, y: ev.clientY, cx: view.cx, cy: view.cy, tile: tileOf(ev.target), feature: tileOf(ev.target) ? null : featureOf(ev.target), moved: false, id: ev.pointerId };
    try { bx.el.setPointerCapture(ev.pointerId); } catch (e) {}
  });
  document.addEventListener("pointermove", function (ev) {
    if (!drag || ev.pointerId !== drag.id) return;
    var bx = box();
    if (!bx || !view) return;
    var dx = ev.clientX - drag.x, dy = ev.clientY - drag.y;
    if (!drag.moved && Math.abs(dx) + Math.abs(dy) < 5) return;
    drag.moved = true;
    bx.el.classList.add("dragging");
    var k = view.w / bx.w;
    view.cx = drag.cx - dx * k; view.cy = drag.cy - dy * k;
    applyView();
  });
  function endDrag(ev) {
    if (!drag || ev.pointerId !== drag.id) return;
    var d = drag, bx = box();
    drag = null;
    if (bx) { bx.el.classList.remove("dragging"); try { bx.el.releasePointerCapture(ev.pointerId); } catch (e) {} }
    if (!d.moved && d.tile) { selected = d.tile.getAttribute("data-ow-tile"); selectedFeature = null; scan(); }
    else if (!d.moved && d.feature) { selectedFeature = d.feature.getAttribute("data-ow-feature"); selected = null; scan(); }
    else if (!d.moved && selectedFeature) { selectedFeature = null; scan(); }   // a click on bare map puts the feature's card away
  }
  document.addEventListener("pointerup", endDrag);
  document.addEventListener("pointercancel", endDrag);

  document.addEventListener("wheel", function (ev) {
    var bx = box();
    if (!bx || !inPanel(ev.target) || !bx.el.contains(ev.target)) return;
    ev.preventDefault();
    var r = bx.el.getBoundingClientRect();
    zoomAt(ev.deltaY > 0 ? 1.18 : 1 / 1.18, (ev.clientX - r.left) / r.width, (ev.clientY - r.top) / r.height);
  }, { passive: false });

  document.addEventListener("click", function (ev) {
    var t = ev.target && ev.target.closest ? ev.target.closest("[data-ow-act]") : null;
    if (!t || !inPanel(t)) return;
    var act = t.getAttribute("data-ow-act"), o = scanOptions();
    if (act === "go") { var sel = selected && OW.nodes[selected] ? selected : null; if (sel) travel(sel); }
    else if (act === "enter") { if (o && o.enter) { quiet(false); press(o.enter.radio); } }
    else if (act === "camp") { if (o && o.camp) { quiet(true); press(o.camp); } }
    else if (act === "deliver") { var di = Number(t.getAttribute("data-ow-i")); if (o && o.deliver && o.deliver[di]) { quiet(true); press(o.deliver[di].radio); } }
    else if (act === "dawn") { if (o && o.dawn) { quiet(true); press(o.dawn.radio); } }
    else if (act === "zoomin") zoomAt(1 / 1.4, 0.5, 0.5);
    else if (act === "zoomout") zoomAt(1.4, 0.5, 0.5);
    else if (act === "rotate") { rot = (rot + 1) % 4; try { window.localStorage.setItem("owMapRot2", String(rot)); } catch (e2) {} view = null; lastSig = ""; scan(); }
    else if (act === "center") toggle();
    else if (act === "unpick") { selectedFeature = null; selected = null; scan(); }
    else if (act === "fit") { fit(); applyView(); }
  });
  document.addEventListener("dblclick", function (ev) {
    var tile = tileOf(ev.target);
    if (tile && inPanel(tile)) travel(tile.getAttribute("data-ow-tile"));
  });
  document.addEventListener("keydown", function (ev) {
    if (ev.ctrlKey || ev.metaKey || ev.altKey) return;
    var tag = ev.target && ev.target.tagName ? ev.target.tagName.toLowerCase() : "";
    if (tag === "input" || tag === "textarea" || tag === "select" || (ev.target && ev.target.isContentEditable)) return;
    if (document.querySelector("dialog[open]")) return;
    if ((ev.key === "Enter" || ev.key === " ") && tileOf(ev.target) && inPanel(ev.target)) {
      ev.preventDefault(); selected = tileOf(ev.target).getAttribute("data-ow-tile"); selectedFeature = null; scan(); return;
    }
    if ((ev.key === "Enter" || ev.key === " ") && !tileOf(ev.target) && featureOf(ev.target) && inPanel(ev.target)) {
      ev.preventDefault(); selectedFeature = featureOf(ev.target).getAttribute("data-ow-feature"); selected = null; scan(); return;
    }
    if ((ev.key === "m" || ev.key === "M") && available()) { ev.preventDefault(); toggle(); }
  });
  // Space is Travel while the map is up: pick a tile, tap Space. It runs in the capture phase so ui.js's own Space ("press the checked option, then Next") never sees the key; with no tile
  // picked it does nothing at all (the real Next button is hidden under the map, and a bare Space must not poke it). A focused button keeps its own Space, so +/-/Me/All still work.
  document.addEventListener("keydown", function (ev) {
    if (ev.key !== " " || ev.ctrlKey || ev.metaKey || ev.altKey || ev.shiftKey) return;
    if (!document.getElementById(PANEL_ID) || !document.body.classList.contains("owMapOn")) return;
    var tag = ev.target && ev.target.tagName ? ev.target.tagName.toLowerCase() : "";
    if (tag === "input" || tag === "textarea" || tag === "select" || tag === "button" || tag === "a" || (ev.target && ev.target.isContentEditable)) return;
    if (document.querySelector("dialog[open]")) return;
    ev.preventDefault(); ev.stopImmediatePropagation();
    if (ev.repeat) return; // holding Space must not set off a second trip
    var tile = tileOf(ev.target), sel = selected && OW.nodes[selected] ? selected : null;
    if (tile && inPanel(tile) && tile.getAttribute("data-ow-tile") !== sel) { selected = tile.getAttribute("data-ow-tile"); scan(); return; }
    if (sel) travel(sel);
  }, true);
  window.addEventListener("resize", function () { applyView(); });

  window.OverworldMap = { available: available, toggle: toggle, scan: scan };

  function start() {
    // Not queued to the next frame: a mutation observer's callback runs before the browser paints, so the new page's map is drawn in the same frame the new page appears.
    if (window.MutationObserver) new MutationObserver(function () { scan(); }).observe(document.body, { childList: true, subtree: true });
    window.setInterval(scan, 500);
    scan();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
