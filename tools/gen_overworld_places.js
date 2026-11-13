#!/usr/bin/env node
/*
 * gen_overworld_places.js -- lets you create, move, connect and disconnect overworld map tiles by drawing in Inkscape, the same way
 * gen_overworld_art.js already lets you draw mountains and forests. Reads the "places" layer of web/mygame/overworld-art/worldmap.svg
 * and writes the positions and roads it finds into web/mygame/overworld-data.js.
 *
 * WHY. Picking x/y by hand in overworld-data.js and guessing whether a point lands on drawn water or a mountain is slow and error-prone.
 * Drawing it and seeing it against the real art is not. The "guide" layer (faint reference dots and lines, auto-regenerated, locked, the
 * same as always) is read-only -- it shows you where everything CURRENTLY is so you can draw relative to it. The "places" layer is yours:
 * draw a circle for a new or moved tile, or move one that is already there; draw a line between two circles (yours or a "guide" reference
 * dot) for a road. Nothing you draw there is ever overwritten.
 *
 * DRAWING A TILE. Draw a circle anywhere on open ground. Open Object Properties (Ctrl+Shift+O):
 *   Label         the name shown on the map, e.g. "Dunmow"
 *   Title         the kind: city, town, village, fort or road
 *   Description   first line  ID: xy        the tile's internal id (two or three letters, must match an existing id to move that tile,
 *                                            or be new to create one)
 *                 optional    Territory: gault   Danger: 1   Climate: -1   (left out = unchanged for an existing tile, or a sensible
 *                                            default for a new one)
 * Moving an existing tile: draw (or move) a circle with that tile's ID and its new position; its x and y are updated in overworld-data.js
 * and nothing else about it changes. A brand-new ID gets a new NODES entry with placeholder, environment-only text (see
 * feedback_overworld_text_environment_only in the user's memory) for you or Claude to rewrite properly afterward.
 *
 * DRAWING A ROAD. Draw a straight line (the Line tool, or a 2-point path) with each end ON a circle's centre -- either one you just drew,
 * or one of the faint "guide" reference dots for a tile that already exists elsewhere on the map. Object Properties, Description:
 *   Miles: 8                 required
 *   Terrain: overland        optional (road, overland, track or blocked; road if left out)
 * DISCONNECTING a road: delete its line and run the script again.
 *
 * Every road whose BOTH ends are tiles that have ever been drawn in "places" lives in the GEN:BEGIN places / GEN:END places block in
 * overworld-data.js's EDGES array, fully rewritten each run from what is currently drawn -- so deleting or redrawing a line is enough,
 * you never edit that block by hand. Every other road (hand-written, forest overland links, hidden quest roads and so on) is untouched.
 *
 * Run: node tools/gen_overworld_places.js            (write the positions and roads found in "places" into overworld-data.js)
 *      node tools/gen_overworld_places.js --guide    (first redraw the "guide" reference layer from the current tiles, then write)
 *      node tools/gen_overworld_places.js --check    (verify overworld-data.js already matches "places"; non-writing; exit 1 if not)
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const GAME = path.join(ROOT, "web", "mygame");
const SVG = path.join(GAME, "overworld-art", "worldmap.svg");
const DATA = path.join(GAME, "overworld-data.js");
const UNIT = 130;
const KINDS = ["city", "town", "village", "fort", "road"];
const TERRAINS = ["road", "overland", "track", "blocked"];
const SNAP = 0.18; // map units a line's end may sit from a circle's centre and still count as touching it (about a mile or so in this region)

const checkOnly = process.argv.includes("--check");
const doGuide = process.argv.includes("--guide");
let bad = 0;
function fail(msg) { console.error("  PROBLEM: " + msg); bad++; }

global.window = global;
require(DATA);
const OW = global.Overworld;

// ---------------------------------------------------------------- small SVG helpers (same approach as gen_overworld_art.js)
function attrs(tag) { const o = {}; const re = /([\w:-]+)\s*=\s*"([^"]*)"/g; let t; while ((t = re.exec(tag))) o[t[1]] = t[2]; return o; }
function parseTransform(str, where) {
  let m = [1, 0, 0, 1, 0, 0];
  if (!str) return m;
  const re = /(\w+)\s*\(([^)]*)\)/g; let t;
  while ((t = re.exec(str))) {
    const n = t[2].split(/[\s,]+/).filter(Boolean).map(Number);
    let k;
    if (t[1] === "translate") k = [1, 0, 0, 1, n[0] || 0, n[1] || 0];
    else if (t[1] === "scale") k = [n[0], 0, 0, n.length > 1 ? n[1] : n[0], 0, 0];
    else if (t[1] === "matrix" && n.length === 6) k = n;
    else if (t[1] === "rotate") {
      const rad = (n[0] || 0) * Math.PI / 180, cosv = Math.cos(rad), sinv = Math.sin(rad);
      const cx = n.length >= 3 ? n[1] : 0, cy = n.length >= 3 ? n[2] : 0;
      k = [cosv, sinv, -sinv, cosv, cx - cosv * cx + sinv * cy, cy - sinv * cx - cosv * cy];
    }
    else { fail((where || "an element") + "'s transform \"" + t[1] + "\" is not supported in the places layer (translate, scale and matrix are, or rotate) -- in Inkscape, use Object > Transform > Move, or just drag it, instead of skewing it"); k = [1, 0, 0, 1, 0, 0]; }
    m = [m[0] * k[0] + m[2] * k[1], m[1] * k[0] + m[3] * k[1], m[0] * k[2] + m[2] * k[3], m[1] * k[2] + m[3] * k[3], m[0] * k[4] + m[2] * k[5] + m[4], m[1] * k[4] + m[3] * k[5] + m[5]];
  }
  return m;
}
function apply(m, x, y) { return [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]]; }
function childText(inner, tag) {
  const re = /<(\/?)([a-zA-Z][\w:-]*)([^>]*?)(\/?)>/g;
  let t, depth = 0;
  while ((t = re.exec(inner))) {
    const closing = t[1] === "/", selfClose = t[4] === "/";
    if (t[2] === tag && !closing && depth === 0) {
      if (selfClose) return "";
      const end = inner.indexOf("</" + tag + ">", re.lastIndex);
      if (end < 0) return "";
      return inner.slice(re.lastIndex, end)
        .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/&apos;/g, "'").replace(/&amp;/g, "&")
        .trim();
    }
    if (closing) depth--; else if (!selfClose) depth++;
  }
  return "";
}
function group(src, id) {
  const open = new RegExp("<g\\b[^>]*\\bid=\"" + id + "\"[^>]*>").exec(src);
  if (!open) return null;
  let depth = 1, pos = open.index + open[0].length; const re = /<(\/?)g\b[^>]*?(\/?)>/g; re.lastIndex = pos; let t;
  while ((t = re.exec(src))) { if (t[2] === "/") continue; depth += t[1] ? -1 : 1; if (depth === 0) return { start: open.index, innerStart: pos, innerEnd: t.index, end: re.lastIndex, tag: open[0] }; }
  return null;
}
function elements(inner, tags) {
  // every element whose tag is in `tags`, at any depth, with its own transform chain accumulated from ancestor <g transform="...">
  const out = [];
  const stack = [[1, 0, 0, 1, 0, 0]];
  const re = /<(\/?)([a-zA-Z][\w:-]*)((?:\s+[\w:-]+\s*=\s*"[^"]*")*)\s*(\/?)>/g;
  let t;
  while ((t = re.exec(inner))) {
    const closing = t[1] === "/", tag = t[2], a = attrs(t[3]), selfClose = t[4] === "/";
    if (closing) { if (stack.length > 1) stack.pop(); continue; }
    const where = a.id ? ("<" + tag + " id=\"" + a.id + "\">") :
      (a.cx !== undefined ? ("a circle near local (" + a.cx + ", " + a.cy + ")") :
      (a.x1 !== undefined ? ("a line near local (" + a.x1 + ", " + a.y1 + ")") : ("a <" + tag + ">")));
    const m = parseTransform(a.transform || "", where);
    const cur = stack[stack.length - 1];
    const combined = [cur[0] * m[0] + cur[2] * m[1], cur[1] * m[0] + cur[3] * m[1], cur[0] * m[2] + cur[2] * m[3], cur[1] * m[2] + cur[3] * m[3], cur[0] * m[4] + cur[2] * m[5] + cur[4], cur[1] * m[4] + cur[3] * m[5] + cur[5]];
    if (tags.indexOf(tag) >= 0) {
      let innerHtml = "";
      if (!selfClose) {
        const end = inner.indexOf("</" + tag + ">", re.lastIndex);
        innerHtml = end < 0 ? "" : inner.slice(re.lastIndex, end);
      }
      out.push({ tag, a, m: combined, inner: innerHtml });
    }
    if (!selfClose && tag !== tags.find((x) => x === tag) || !selfClose) {
      // push the (possibly identity) transform for any element that can contain children we care about
      if (!selfClose) stack.push(combined);
    }
  }
  return out;
}

// ---------------------------------------------------------------- read the "places" layer
const svgSrc = fs.readFileSync(SVG, "utf8");
const placesG = group(svgSrc, "places");
if (!placesG) { console.error("worldmap.svg has no <g id=\"places\"> layer -- see the comment at the top of this script to add one"); process.exit(1); }
const placesInner = svgSrc.slice(placesG.innerStart, placesG.innerEnd);

const drawnNodes = {}; // id -> { name, kind, x, y, territory, danger, climate, where }
const nodePositions = []; // [id, x, y] for every node, drawn or already in overworld-data.js, for edge-matching

elements(placesInner, ["circle"]).forEach((el) => {
  const a = el.a;
  const [x, y] = apply(el.m, Number(a.cx) || 0, Number(a.cy) || 0);
  const mx = x / UNIT, my = y / UNIT;
  const name = a["inkscape:label"] || a.label || "";
  const kind = childText(el.inner, "title").toLowerCase().trim();
  const desc = childText(el.inner, "desc");
  const where = "a circle at roughly (" + Math.round(mx * 10) / 10 + ", " + Math.round(my * 10) / 10 + ")";
  if (!name) { fail(where + " has no Label (Ctrl+Shift+O) -- that is the name shown on the map"); return; }
  if (!kind) { fail(where + " (\"" + name + "\") has no Title -- it must be one of " + KINDS.join(", ")); return; }
  if (KINDS.indexOf(kind) < 0) { fail(where + " (\"" + name + "\")'s Title is \"" + kind + "\", not one of " + KINDS.join(", ")); return; }
  let id = "", territory, danger, climate;
  desc.split(/\r?\n/).forEach((row) => {
    const v = row.trim();
    if (!v) return;
    let m = /^id\s*:\s*([a-z0-9]+)\s*$/i.exec(v);
    if (m) { id = m[1].toLowerCase(); return; }
    m = /^territory\s*:\s*(\w+)\s*$/i.exec(v);
    if (m) { territory = m[1]; return; }
    m = /^danger\s*:\s*(\d+)\s*$/i.exec(v);
    if (m) { danger = Number(m[1]); return; }
    m = /^climate\s*:\s*(-?\d+)\s*$/i.exec(v);
    if (m) { climate = Number(m[1]); return; }
  });
  if (!id) { fail(where + " (\"" + name + "\") has no \"ID: xy\" line in its Description"); return; }
  if (drawnNodes[id]) { fail("two circles in the places layer both give \"ID: " + id + "\" (\"" + drawnNodes[id].name + "\" and \"" + name + "\"); ids must be unique"); return; }
  drawnNodes[id] = { name, kind, x: mx, y: my, territory, danger, climate, where: where + " (\"" + name + "\")" };
});

if (bad) { if (!checkOnly) process.exit(1); }

// every node's position, drawn or already on the map (drawn ones win, so moving a circle moves the tile even before the file is rewritten)
Object.keys(OW.nodes).forEach((id) => nodePositions.push([id, OW.nodes[id].x, OW.nodes[id].y]));
Object.keys(drawnNodes).forEach((id) => {
  const existing = nodePositions.findIndex((p) => p[0] === id);
  const n = drawnNodes[id];
  if (existing >= 0) nodePositions[existing] = [id, n.x, n.y];
  else nodePositions.push([id, n.x, n.y]);
});

function nearestNodeInfo(mx, my) {
  let best = null, bestD = Infinity;
  nodePositions.forEach(([id, x, y]) => {
    const d = Math.hypot(x - mx, y - my);
    if (d < bestD) { bestD = d; best = id; }
  });
  return { id: best, dist: bestD };
}
function nearestNode(mx, my) {
  const n = nearestNodeInfo(mx, my);
  return n.dist <= SNAP ? n.id : null;
}

// a straight-line path as Inkscape's line/pencil tools save it: "M"/"m" then one or more "L"/"l" (or implicit-repeat) coordinate pairs,
// each absolute (M/L) or relative to the running point (m/l) -- we only need the first and last point, straight or bent.
function pathEndpoints(d) {
  const tokens = (d || "").match(/[MmLlHhVvCcSsQqTtAaZz]|-?\d*\.?\d+(?:e-?\d+)?/g);
  if (!tokens) return null;
  let i = 0, cmd = null, cx = 0, cy = 0, first = true, start = null, last = null;
  while (i < tokens.length) {
    const t = tokens[i];
    if (/^[A-Za-z]$/.test(t)) { cmd = t; i++; continue; }
    if (!cmd) return null;
    const letter = cmd.toLowerCase();
    if (letter !== "m" && letter !== "l") return null; // curves etc: not a plain straight line, bail out
    const rel = cmd === letter;
    const x = Number(tokens[i]), y = Number(tokens[i + 1]);
    i += 2;
    if (first) { cx = x; cy = y; first = false; start = [cx, cy]; }
    else { if (rel) { cx += x; cy += y; } else { cx = x; cy = y; } last = [cx, cy]; }
  }
  return start ? [start, last || start] : null;
}

// ---------------------------------------------------------------- read the roads: a <line>, or a 2-point <path>, each end on a tile
const drawnEdges = []; // [idA, idB, miles, terrain]
function readEdgeEnds(x1, y1, x2, y2, m, where) {
  const [ax, ay] = apply(m, x1, y1), [bx, by] = apply(m, x2, y2);
  const amx = ax / UNIT, amy = ay / UNIT, bmx = bx / UNIT, bmy = by / UNIT;
  const a = nearestNode(amx, amy), b = nearestNode(bmx, bmy);
  if (!a || !b) {
    const describe = (mx, my, hit) => {
      if (hit) return null;
      const n = nearestNodeInfo(mx, my);
      const name = (OW.nodes[n.id] || drawnNodes[n.id] || {}).name || n.id;
      return "its end at (" + (Math.round(mx * 10) / 10) + ", " + (Math.round(my * 10) / 10) + ") is " + (Math.round(n.dist * 100) / 100) + " map units from \"" + name + "\" (" + n.id + "), more than the " + SNAP + " snap -- drag that end onto " + name + "'s centre";
    };
    fail(where + ": " + [describe(amx, amy, a), describe(bmx, bmy, b)].filter(Boolean).join("; and "));
    return null;
  }
  if (a === b) { fail(where + " starts and ends on the same tile (\"" + a + "\")"); return null; }
  return [a, b];
}
elements(placesInner, ["line", "path"]).forEach((el) => {
  const a = el.a;
  let ends = null;
  const label = a["inkscape:label"] || a.id || ("a <" + el.tag + ">");
  const where = "the road " + label;
  if (el.tag === "line") {
    ends = readEdgeEnds(Number(a.x1) || 0, Number(a.y1) || 0, Number(a.x2) || 0, Number(a.y2) || 0, el.m, where);
  } else {
    const pts = pathEndpoints(a.d || "");
    if (!pts) { fail(where + " (a path) does not look like a straight line (M/m then L/l) -- draw it with the Line tool instead"); return; }
    ends = readEdgeEnds(pts[0][0], pts[0][1], pts[1][0], pts[1][1], el.m, where);
  }
  if (!ends) return;
  const desc = childText(el.inner, "desc");
  let miles = null, terrain = null;
  desc.split(/\r?\n/).forEach((row) => {
    const v = row.trim();
    if (!v) return;
    let m = /^miles\s*:\s*(\d+(?:\.\d+)?)\s*$/i.exec(v);
    if (m) { miles = Number(m[1]); return; }
    m = /^terrain\s*:\s*(\w+)\s*$/i.exec(v);
    if (m) { terrain = m[1].toLowerCase(); return; }
  });
  const pair = ends[0] + "-" + ends[1];
  if (miles === null) { fail(where + " (" + pair + ") has no \"Miles: n\" line in its Description"); return; }
  if (terrain && TERRAINS.indexOf(terrain) < 0) { fail(where + " (" + pair + ")'s Terrain is \"" + terrain + "\", not one of " + TERRAINS.join(", ")); return; }
  drawnEdges.push([ends[0], ends[1], miles, terrain && terrain !== "road" ? terrain : null]);
});

if (bad) process.exit(1);

// ---------------------------------------------------------------- the guide layer: unchanged behaviour, every current tile and road, faint and locked
function guideSvg() {
  const f = (v) => Math.round(v * 10) / 10;
  let s = "";
  OW.edges.forEach((e) => {
    const na = nodePositions.find((p) => p[0] === e[0]), nb = nodePositions.find((p) => p[0] === e[1]);
    if (!na || !nb) return;
    const dash = (e[3] && e[3] !== "road") ? " stroke-dasharray=\"3 12\"" : "";
    s += "\n    <line x1=\"" + f(na[1] * UNIT) + "\" y1=\"" + f(na[2] * UNIT) + "\" x2=\"" + f(nb[1] * UNIT) + "\" y2=\"" + f(nb[2] * UNIT) + "\" stroke=\"#8a7b6c\" stroke-width=\"5\" stroke-linecap=\"round\"" + dash + "/>";
  });
  const col = { forest: "#6f9f78", woodroad: "#8c9a5c", town: "#e0a45e", city: "#e0a45e", village: "#c8b66a", fort: "#b36a6a" };
  nodePositions.forEach(([id, x, y]) => {
    const n = OW.nodes[id] || drawnNodes[id];
    const r = n.kind === "city" ? 26 : (n.kind === "town" ? 22 : ((n.kind === "village" || n.kind === "fort") ? 18 : 14));
    s += "\n    <circle cx=\"" + f(x * UNIT) + "\" cy=\"" + f(y * UNIT) + "\" r=\"" + r + "\" fill=\"" + (col[n.kind] || "#a39d93") + "\"/>";
    s += "\n    <text x=\"" + f(x * UNIT) + "\" y=\"" + f(y * UNIT + r + 20) + "\" fill=\"#d8cfc0\" font-family=\"sans-serif\" font-size=\"15\" text-anchor=\"middle\">" + String(n.name).replace(/&/g, "&amp;") + "</text>";
  });
  return s + "\n  ";
}
if (doGuide && !checkOnly) {
  const g = group(svgSrc, "guide");
  if (!g) { fail("worldmap.svg has no <g id=\"guide\"> layer to refresh"); }
  else fs.writeFileSync(SVG, svgSrc.slice(0, g.innerStart) + guideSvg() + svgSrc.slice(g.innerEnd));
}

// ---------------------------------------------------------------- write overworld-data.js: patch drawn tiles' x/y in place, append brand-new ones, and
// replace the GEN:BEGIN places / GEN:END places block in EDGES with every road whose both ends were ever drawn in "places"
let dataSrc = fs.readFileSync(DATA, "utf8");
const originalData = dataSrc;

Object.keys(drawnNodes).forEach((id) => {
  const n = drawnNodes[id];
  const re = new RegExp("(\\b" + id + ":\\s*\\{\\s*name:\\s*\")[^\"]*(\",\\s*kind:\\s*\")[^\"]*(\",\\s*x:\\s*)-?[\\d.]+(,\\s*y:\\s*)-?[\\d.]+(,)");
  if (re.test(dataSrc)) {
    dataSrc = dataSrc.replace(re, (m, p1, p2, p3, p4, p5) => p1 + n.name + p2 + n.kind + p3 + n.x + p4 + n.y + p5);
  } else {
    // a brand-new id: append a stub just before NODES' closing "};" -- environment-only placeholder text, flagged for a real pass
    const marker = /\r?\n(\s*)\};\s*\r?\n\s*\r?\n\s*\/\/ Each way between two tiles/;
    const mm = marker.exec(dataSrc);
    if (!mm) { fail("could not find where NODES closes in overworld-data.js to add the new tile \"" + id + "\" -- add it by hand this once"); return; }
    const indent = mm[1];
    // the entry right before this point needs a trailing comma -- it won't have one if it used to be NODES' last key
    let insertAt = mm.index, j = insertAt;
    while (j > 0 && /\s/.test(dataSrc[j - 1])) j--;
    if (dataSrc[j - 1] === "}") { dataSrc = dataSrc.slice(0, j) + "," + dataSrc.slice(j); insertAt++; }
    const territory = n.territory || "gault";
    const danger = n.danger != null ? n.danger : 1;
    const climateLine = n.climate != null ? ("\n" + indent + "  climate: " + n.climate + ",") : "";
    // a road tile is a junction, not a place a caravan escort stops -- it needs walk text (check_overworld_map.js requires it for kind "road")
    const walkLine = n.kind === "road" ? ("\n" + indent + "  walk: \"The road runs on through open ground here.\",") : "";
    const stub = "\n" + indent + "// AUTO-STUB from the places layer (tools/gen_overworld_places.js) -- placeholder text, environment only; rewrite before this tile matters to play.\n" +
      indent + id + ": {\n" +
      indent + "  name: \"" + n.name + "\", kind: \"" + n.kind + "\", x: " + n.x + ", y: " + n.y + ",\n" +
      indent + "  territory: \"" + territory + "\",\n" +
      indent + "  danger: " + danger + "," + climateLine + walkLine + "\n" +
      indent + "  info: \"A small " + n.kind + " on open ground.\",\n" +
      indent + "  here: \"A small " + n.kind + " stands here.\"\n" +
      indent + "},";
    dataSrc = dataSrc.slice(0, insertAt) + stub + dataSrc.slice(insertAt);
  }
});

const genBlock = drawnEdges.map((e) => "    [\"" + e[0] + "\", \"" + e[1] + "\", " + e[2] + (e[3] ? ", \"" + e[3] + "\"" : "") + "],").join("\n");
const genRe = /(\/\/ GEN:BEGIN places\r?\n)([\s\S]*?)(\r?\n\s*\/\/ GEN:END places)/;
if (genRe.test(dataSrc)) {
  dataSrc = dataSrc.replace(genRe, (m, head, _old, tail) => head + genBlock + tail);
} else {
  fail("overworld-data.js has no \"// GEN:BEGIN places\" / \"// GEN:END places\" markers in EDGES -- add an empty pair once, this script only ever rewrites what is between them");
}

if (bad) process.exit(1);

if (checkOnly) {
  if (dataSrc !== originalData) { console.error("overworld-data.js does not match the places layer -- run `node tools/gen_overworld_places.js`"); process.exit(1); }
  console.log("overworld-data.js matches the places layer (" + Object.keys(drawnNodes).length + " tile(s), " + drawnEdges.length + " road(s) drawn)");
} else {
  fs.writeFileSync(DATA, dataSrc);
  console.log("gen_overworld_places: " + Object.keys(drawnNodes).length + " tile(s) and " + drawnEdges.length + " road(s) read from the places layer; wrote " + path.relative(ROOT, DATA));
}
