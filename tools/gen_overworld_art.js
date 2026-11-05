#!/usr/bin/env node
/*
 * gen_overworld_art.js -- turns the hand-drawn SVG art of the overworld map (the Coldspine mountain range) into web/mygame/overworld-art.js, which the map panel reads.
 *
 * WHY. The range used to be a thick line through a few points in overworld-data.js, which you could not shape. Now each feature is a plain .svg file in web/mygame/overworld-art/ that you edit in
 * Inkscape, Figma, Illustrator, or by hand, and this script copies its shapes into a small generated JS file. The game ships as one self-contained HTML file, so the SVG itself cannot be loaded at run
 * time; this is the same arrangement as the generated icon files (gen_spell_icons.js).
 *
 * HOW TO DRAW. Open a file in web/mygame/overworld-art/. EVERY top-level layer or group in it that has a name is one feature, and that NAME is what overworld-data.js points at: a layer called
 * "Longshade Forest" becomes the feature "longshade-forest". So one map file holds as many features as you like, a layer each, which is how you want to draw -- the wood, the borders and the range
 * apart from one another and separately hidden. Draw as <path> shapes and keep the file's own coordinates: 130 SVG
 * units are one map unit, Port Valen is at 0,0, east is +x and SOUTH is +y (the usual SVG way). The layer called "guide" is the towns and roads, drawn faint so you can see where things are; it is locked and
 * is rewritten by `--guide`, so anything you draw in it is lost. A path with class="ridge" is drawn as a thin lighter line (a spine or a crest); any other path is a filled mountain block. Colours and
 * opacity come from overworldmap.css (.ow-f-range), not from the SVG, so one place themes them all; width does too, UNLESS a feature's Description overrides it with a "Width: n" line.
 * The shape's name, kind and card come from the layer's own Object Properties (Ctrl+Shift+O): Label is the name, Title is the kind, and Description is the card -- with three lines read as
 * settings rather than text: "Travel: ..." is the line under the card, "Label: x,y" fixes the name's drawn position, "Width: n" fixes its line thickness. Rectangles, circles and groups with a
 * rotation must be turned into paths first (Inkscape: Path > Object to Path).
 *
 * STAMPS. Trees, peaks and hills are not drawn freehand: web/mygame/overworld-art/_stamps.svg is a sheet of glyphs to copy from, and it explains how to place them.
 * A file in this folder whose name begins with "_" is a working file of that sort and is skipped by this script.
 *
 * Run: node tools/gen_overworld_art.js            (write overworld-art.js from the SVGs)
 *      node tools/gen_overworld_art.js --guide    (first redraw the guide layer of each SVG from the current tiles, then write)
 *      node tools/gen_overworld_art.js --check    (verify overworld-art.js is current; non-writing; exit 1 if stale or an SVG is bad)
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const GAME = path.join(ROOT, "web", "mygame");
const DIR = path.join(GAME, "overworld-art");
const OUT = path.join(GAME, "overworld-art.js");
const UNIT = 130;
// The kinds a feature may be, as typed into Inkscape's Title box. Each one has a colour and a line style in overworldmap.css (.ow-f-<kind>); a kind that is not here would
// draw in the neutral fallback and look merely wrong, with nothing said, so an unknown one is named out loud instead. Adding a kind means a rule in that file and a word here.
const KINDS = ["forest", "range", "hills", "marsh", "water", "coast", "river", "border", "area"];   // SVG units per map unit; overworldmap.js SCALE and the panel's rescale read the "unit" written below

const checkOnly = process.argv.includes("--check");
const doGuide = process.argv.includes("--guide");
let bad = 0;
function fail(msg) { console.error("  PROBLEM: " + msg); bad++; }

// ---------------------------------------------------------------- the tiles, for the guide layer and to size the page
global.window = global;
require(path.join(GAME, "overworld-data.js"));
const OW = global.Overworld;

// ---------------------------------------------------------------- transforms: translate, scale and matrix only (a rotation or skew would make the bounding box a guess)
function parseTransform(str) {
  let m = [1, 0, 0, 1, 0, 0];
  if (!str) return m;
  const re = /(\w+)\s*\(([^)]*)\)/g; let t;
  while ((t = re.exec(str))) {
    const n = t[2].split(/[\s,]+/).filter(Boolean).map(Number);
    let k;
    if (t[1] === "translate") k = [1, 0, 0, 1, n[0] || 0, n[1] || 0];
    else if (t[1] === "scale") k = [n[0], 0, 0, n.length > 1 ? n[1] : n[0], 0, 0];
    else if (t[1] === "matrix" && n.length === 6) k = n;
    else { fail("a transform \"" + t[1] + "\" is not supported (translate, scale and matrix are); ungroup or apply it (Inkscape: Object > Transform, then Path > Object to Path)"); k = [1, 0, 0, 1, 0, 0]; }
    if (k.some((v) => !Number.isFinite(v))) { fail("a transform has a value that is not a number"); k = [1, 0, 0, 1, 0, 0]; }
    m = [m[0] * k[0] + m[2] * k[1], m[1] * k[0] + m[3] * k[1], m[0] * k[2] + m[2] * k[3], m[1] * k[2] + m[3] * k[3], m[0] * k[4] + m[2] * k[5] + m[4], m[1] * k[4] + m[3] * k[5] + m[5]];
  }
  return m;
}
function apply(m, x, y) { return [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]]; }

// ---------------------------------------------------------------- a path's bounding box, from its points and control points (a safe over-estimate: the panel only uses it to keep the range in view)
function pathPoints(d) {
  const toks = d.match(/[a-zA-Z]|-?\d*\.?\d+(?:e[-+]?\d+)?/g) || [];
  const pts = []; let i = 0, cmd = "", x = 0, y = 0, sx = 0, sy = 0;
  const num = () => { const v = Number(toks[i++]); if (!Number.isFinite(v)) { fail("a path has a value that is not a number"); return 0; } return v; };
  while (i < toks.length) {
    if (/^[a-zA-Z]$/.test(toks[i])) cmd = toks[i++];
    const rel = cmd === cmd.toLowerCase(), C = cmd.toUpperCase();
    const P = (px, py) => { const q = rel ? [x + px, y + py] : [px, py]; return q; };
    if (C === "Z") { x = sx; y = sy; continue; }
    if (C === "M" || C === "L" || C === "T") { const q = P(num(), num()); x = q[0]; y = q[1]; pts.push(q); if (C === "M") { sx = x; sy = y; cmd = rel ? "l" : "L"; } }
    else if (C === "H") { const v = num(); x = rel ? x + v : v; pts.push([x, y]); }
    else if (C === "V") { const v = num(); y = rel ? y + v : v; pts.push([x, y]); }
    else if (C === "C") { const a = P(num(), num()), b = P(num(), num()), q = P(num(), num()); pts.push(a, b, q); x = q[0]; y = q[1]; }
    else if (C === "S" || C === "Q") { const a = P(num(), num()), q = P(num(), num()); pts.push(a, q); x = q[0]; y = q[1]; }
    else if (C === "A") { const rx = num(), ry = num(); num(); num(); num(); const q = P(num(), num()); pts.push([q[0] - rx, q[1] - ry], [q[0] + rx, q[1] + ry], q); x = q[0]; y = q[1]; }
    else { fail("a path uses the command \"" + cmd + "\", which is not an SVG path command"); break; }
  }
  return pts;
}

// ---------------------------------------------------------------- one SVG file: its art layer
function group(src, id) {
  const open = new RegExp("<g\\b[^>]*\\bid=\"" + id + "\"[^>]*>").exec(src);
  if (!open) return null;
  let depth = 1, pos = open.index + open[0].length; const re = /<(\/?)g\b[^>]*?(\/?)>/g; re.lastIndex = pos; let t;
  while ((t = re.exec(src))) { if (t[2] === "/") continue; depth += t[1] ? -1 : 1; if (depth === 0) return { start: open.index, innerStart: pos, innerEnd: t.index, end: re.lastIndex, tag: open[0] }; }
  return null;
}
function attrs(tag) { const o = {}; const re = /([\w:-]+)\s*=\s*"([^"]*)"/g; let t; while ((t = re.exec(tag))) o[t[1]] = t[2]; return o; }

// Every top-level LAYER OR GROUP that carries a label is a feature of its own, named by that label: "Longshade Forest" becomes the key "longshade-forest", which
// overworld-data.js FEATURES points at with its "art" field. A group counts as much as a layer, because Inkscape makes a group when you select some shapes and press
// Ctrl+G, and that is the natural way to pen one wood and then another. The layer whose id is "guide" is the tool's own and is never a feature. Anything loose at the
// top of the file, outside every group, belongs to no feature and is reported rather than silently dropped.
// The text of the first <title> / <desc> that is a DIRECT child of a group. Inkscape writes the Object Properties "Title" and "Description" boxes there, and it writes
// them inside the shape they belong to as well, so depth has to be counted or a single labelled path would speak for the whole wood.
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
    if (selfClose || closing && false) continue;
    if (closing) depth--; else depth++;
  }
  return "";
}

// Where the feature's name is drawn. Nobody should have to pick coordinates, so the spot is found here: the place that is furthest from every tile WHILE STILL SITTING ON
// the drawn shape. Both halves matter. Without the first, the name lands on top of a town and neither can be read; without the second, a long thin thing like a mountain
// range puts its name in the emptiest corner of its bounding box, which is off the range entirely -- a bounding box is not a shape. Vertical distance to a tile counts for
// more than horizontal, because a name is wide and shallow and what it collides with is the tile's own label slung underneath it. The whole name has to fit inside the
// bounding box too, or it hangs off the end. A shape too small for its name falls back to its middle, and a Description line "Label: x,y" overrides all of this.
function placeLabel(bbox, name, pts) {
  const half = String(name).length * 7 + 12, vh = 26;
  const mid = [(bbox[0] + bbox[2]) / 2 / UNIT, (bbox[1] + bbox[3]) / 2 / UNIT];
  const round = (p) => [Math.round(p[0] * 100) / 100, Math.round(p[1] * 100) / 100];
  if (bbox[2] - bbox[0] < half * 2 || bbox[3] - bbox[1] < vh * 2) return round(mid);
  const tiles = Object.keys(OW.nodes).map((id) => ({ x: OW.nodes[id].x * UNIT, y: OW.nodes[id].y * UNIT }));
 const ON = 110;         // how near a drawn point a candidate must be to count as standing on the feature
  const ENOUGH = 260;     // clearance past this buys nothing: a name 300 units from the nearest town is no more readable than one 260 away,
                          // so the score stops rewarding it and the pull toward the middle decides instead
  let cx = 0, cy = 0; pts.forEach((q) => { cx += q[0]; cy += q[1]; }); cx /= pts.length; cy /= pts.length;
  let best = null, fallback = null;
  for (let x = bbox[0] + half; x <= bbox[2] - half; x += 6) {
    for (let y = bbox[1] + vh; y <= bbox[3] - vh; y += 6) {
      let on = Infinity;
      for (let i = 0; i < pts.length; i++) { const dx = pts[i][0] - x, dy = pts[i][1] - y; const d2 = dx * dx + dy * dy; if (d2 < on) { on = d2; if (on < 400) break; } }
      on = Math.sqrt(on);
      let d = Infinity;
      tiles.forEach((t) => { const dx = t.x - x, dy = (t.y - y) * 2.2; d = Math.min(d, Math.sqrt(dx * dx + dy * dy)); });
      // the score: clear of the towns, but drawn back toward the middle of the shape, or a long thin thing like a range puts its name in whichever
      // far tail happens to have no towns near it -- on the shape, and in a corner nobody looks at
      const score = Math.min(d, ENOUGH) - 0.25 * Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy));
      if (!fallback || score > fallback.d) fallback = { x, y, d: score };
      if (on > ON) continue;
      if (!best || score > best.d) best = { x, y, d: score };
    }
  }
  const pick = best || fallback;
  return pick ? round([pick.x / UNIT, pick.y / UNIT]) : round(mid);
}

function slug(label) { return String(label).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""); }

// The top-level <g> elements of an SVG, in order, with their label and their contents.
function topGroups(src) {
  const out = [];
  const re = /<g\b([^>]*?)(\/?)>/g;
  let t, depth = 0, open = null;
  while ((t = re.exec(src))) {
    if (t[2] === "/") continue;                       // <g/>, empty
    if (depth === 0) { open = { a: attrs(t[1]), innerStart: re.lastIndex, start: t.index }; }
    depth++;
    // walk to the matching close, counting nested <g>
    const re2 = /<(\/?)g\b[^>]*?(\/?)>/g; re2.lastIndex = re.lastIndex;
    let t2, d = 1;
    while ((t2 = re2.exec(src))) {
      if (t2[2] === "/") continue;
      d += t2[1] ? -1 : 1;
      if (d === 0) break;
    }
    if (!t2) break;
    if (depth === 1) out.push({ a: open.a, innerStart: open.innerStart, innerEnd: t2.index });
    depth = 0;
    re.lastIndex = re2.lastIndex;
  }
  return out;
}

function readFeatures(file) {
  const base = path.basename(file);
  const src = fs.readFileSync(file, "utf8");
  const found = [];

  // a path that is not inside any group at all: almost always something dropped on the page by accident, and it would vanish without a word
  let loose = 0, depth = 0;
  const scan = /<(\/?)(g|path)\b([^>]*?)(\/?)>/g; let t;
  while ((t = scan.exec(src))) {
    if (t[2] === "g") { if (t[4] !== "/") depth += t[1] ? -1 : 1; continue; }
    if (depth === 0) loose++;
  }
  if (loose) console.log("  NOTE  " + base + ": " + loose + " path(s) lie outside every layer and group, so they are in no feature. Select them and press Ctrl+G, or move them into the right layer.");

  topGroups(src).forEach((g) => {
    const label = g.a["inkscape:label"] || g.a.label || "";
    if (g.a.id === "guide") return;                   // the tool's own layer of towns and roads
    // SCENERY. Not everything drawn on a map is a thing you can ask about: waves on the open sea, a few trees along a road, a scatter of rocks. A group with NO name, or
    // one whose name begins with "_", is drawn and nothing more -- no card, no hover, no name lettered across it, no place in the legend. The two routes are the accident
    // and the intention: an unnamed group is usually a stray Ctrl+G, so it says so and carries on rather than stopping the build, while a leading underscore is someone
    // saying "this is only decoration" in the one way the rest of this folder already means it (a file named _something is skipped the same way).
    const decor = !label || label.charAt(0) === "_";
    if (!label) console.log("  NOTE  " + base + ": a group (id \"" + (g.a.id || "?") + "\") has no name, so it is drawn as scenery: no card and nothing to click. Name it in Ctrl+Shift+O if it should be a feature.");
    const key = slug(label) || slug("scenery-" + (g.a.id || Math.random().toString(36).slice(2)));
    if (!key) { fail(base + ": the group named \"" + label + "\" gives an empty name once reduced to letters and digits."); return; }
    const inner = src.slice(g.innerStart, g.innerEnd);
    const groupT = g.a.transform || "";
    const where = base + " / \"" + label + "\"";
    inner.replace(/<(rect|circle|ellipse|line|polygon|polyline|text|image|use)\b/g, (m, tag) => { fail(where + " holds a <" + tag + ">; convert it to a path (Inkscape: Path > Object to Path)"); return m; });
    inner.replace(/<g\b[^>]*\btransform="[^"]*"[^>]*>/g, () => { fail(where + ": a group inside it has a transform; ungroup it or apply it (Object > Ungroup)"); return ""; });
    const paths = [], pts = []; const re = /<path\b([^>]*?)\/?>/g; let p; let minx = Infinity, miny = Infinity, maxx = -Infinity, maxy = -Infinity;
    while ((p = re.exec(inner))) {
      const a = attrs(p[1]);
      if (!a.d) { fail(where + ": a path has no d"); continue; }
      const m = parseTransform((groupT + " " + (a.transform || "")).trim());
      pathPoints(a.d).forEach((q0) => { const q = apply(m, q0[0], q0[1]); pts.push(q); minx = Math.min(minx, q[0]); maxx = Math.max(maxx, q[0]); miny = Math.min(miny, q[1]); maxy = Math.max(maxy, q[1]); });
      const e = { d: a.d.replace(/\s+/g, " ").trim() };
      if ((groupT + " " + (a.transform || "")).trim()) e.t = (groupT + " " + (a.transform || "")).trim();
      if (a.class) e.c = a.class.replace(/[^a-z0-9_ -]/gi, "").trim();
      paths.push(e);
    }
    if (!paths.length) { fail(where + " has no paths in it"); return; }
    if (!Number.isFinite(minx)) { fail(where + ": its paths have no points"); return; }
    const r = (v) => Math.round(v * 10) / 10;
    const bbox = [r(minx), r(miny), r(maxx), r(maxy)];
    // Object Properties (Ctrl+Shift+O): Label is the name on the map, Title is the kind, Description is the card.
    let kind = childText(inner, "title").toLowerCase().replace(/[^a-z0-9]+/g, "");
    if (!kind) { kind = "area"; if (!decor) console.log("  NOTE  " + where + " has no Title, so it is drawn as a plain area. Ctrl+Shift+O and put its kind there (" + KINDS.join(", ") + ")."); }
    else if (KINDS.indexOf(kind) < 0) {
      console.log("  NOTE  " + where + ": its Title says \"" + kind + "\", which is not a kind, so it is drawn as a plain area. The Title is WHAT IT IS (one of: " + KINDS.join(", ") + ");");
      console.log("        the Label is what it is CALLED. If this is a wood, its Title should be \"forest\" and its Label \"" + label + "\".");
      kind = "area";
    }
    const desc = childText(inner, "desc");
    // Three lines in the Description box are read as settings rather than card text: "Travel: ..." is the line under the card, "Label: x,y" fixes the name's position instead
    // of placeLabel() guessing it, and "Width: n" fixes the line's thickness instead of the kind's own default in overworldmap.css (.ow-f-coast and so on). All three are
    // optional; leave them out and the automatic behaviour applies. Everything else in the box is the card text itself.
    let info = "", line = "", over = null, width = undefined;
    desc.split(/\r?\n/).forEach((row) => {
      const v = row.trim();
      if (!v) return;
      let m = /^travel\s*:\s*(.+)$/i.exec(v);
      if (m) { line = m[1].trim(); return; }
      m = /^label\s*:\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*$/i.exec(v);
      if (m) { over = [Number(m[1]), Number(m[2])]; return; }
      m = /^width\s*:\s*([\d.]+)\s*$/i.exec(v);
      if (m) { width = Number(m[1]); return; }
      info += (info ? " " : "") + v;
    });
    found.push({ key, label: decor ? "" : label, file: base, bbox, paths, kind, info, line, width, decor, at: decor ? null : (over || placeLabel(bbox, label, pts)) });
  });

  if (!found.length) fail(base + " holds no named layer or group to draw. Name the layer in Inkscape's Objects panel; that name becomes the feature.");
  return found;
}

// ---------------------------------------------------------------- the guide layer: the tiles and roads, faint, so the art can be drawn in the right place
function guideSvg(bbox) {
  const f = (v) => Math.round(v * 10) / 10;
  let s = "";
  OW.edges.forEach((e) => {
    const a = OW.nodes[e[0]], b = OW.nodes[e[1]], dash = (e[3] && e[3] !== "road") ? " stroke-dasharray=\"3 12\"" : "";
    s += "\n    <line x1=\"" + f(a.x * UNIT) + "\" y1=\"" + f(a.y * UNIT) + "\" x2=\"" + f(b.x * UNIT) + "\" y2=\"" + f(b.y * UNIT) + "\" stroke=\"#8a7b6c\" stroke-width=\"5\" stroke-linecap=\"round\"" + dash + "/>";
  });
  const col = { forest: "#6f9f78", woodroad: "#8c9a5c", town: "#e0a45e", city: "#e0a45e", village: "#c8b66a", fort: "#b36a6a" };
  Object.keys(OW.nodes).forEach((id) => {
    const n = OW.nodes[id], r = n.kind === "city" ? 26 : (n.kind === "town" ? 22 : ((n.kind === "village" || n.kind === "fort") ? 18 : 14));
    s += "\n    <circle cx=\"" + f(n.x * UNIT) + "\" cy=\"" + f(n.y * UNIT) + "\" r=\"" + r + "\" fill=\"" + (col[n.kind] || "#a39d93") + "\"/>";
    s += "\n    <text x=\"" + f(n.x * UNIT) + "\" y=\"" + f(n.y * UNIT + r + 20) + "\" fill=\"#d8cfc0\" font-family=\"sans-serif\" font-size=\"15\" text-anchor=\"middle\">" + n.name.replace(/&/g, "&amp;") + "</text>";
  });
  return s + "\n  ";
}
function viewBox(feat) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  Object.keys(OW.nodes).forEach((id) => { const n = OW.nodes[id]; x0 = Math.min(x0, n.x * UNIT); x1 = Math.max(x1, n.x * UNIT); y0 = Math.min(y0, n.y * UNIT); y1 = Math.max(y1, n.y * UNIT); });
  if (feat) { x0 = Math.min(x0, feat.bbox[0]); y0 = Math.min(y0, feat.bbox[1]); x1 = Math.max(x1, feat.bbox[2]); y1 = Math.max(y1, feat.bbox[3]); }
  x0 = Math.floor((x0 - 140) / 10) * 10; y0 = Math.floor((y0 - 100) / 10) * 10; x1 = Math.ceil((x1 + 140) / 10) * 10; y1 = Math.ceil((y1 + 120) / 10) * 10;
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}
function refreshGuide(file) {
  let src = fs.readFileSync(file, "utf8");
  const feats = readFeatures(file);
  const g = group(src, "guide");
  if (!g) { fail(path.basename(file) + " has no <g id=\"guide\"> layer to refresh"); return; }
  // the page has to hold every feature in the file, not just the first
  let box = null;
  feats.forEach((ft) => {
    box = box ? [Math.min(box[0], ft.bbox[0]), Math.min(box[1], ft.bbox[1]), Math.max(box[2], ft.bbox[2]), Math.max(box[3], ft.bbox[3])] : ft.bbox.slice();
  });
  src = src.slice(0, g.innerStart) + guideSvg(box) + src.slice(g.innerEnd);
  const vb = viewBox(box ? { bbox: box } : null);
  src = src.replace(/viewBox="[^"]*"/, "viewBox=\"" + vb.x + " " + vb.y + " " + vb.w + " " + vb.h + "\"").replace(/(<svg\b[^>]*?)\swidth="[^"]*"/, "$1 width=\"" + vb.w + "\"").replace(/(<svg\b[^>]*?)\sheight="[^"]*"/, "$1 height=\"" + vb.h + "\"");
  src = src.replace(/(<rect id="page"[^>]*?)\sx="[^"]*"\sy="[^"]*"\swidth="[^"]*"\sheight="[^"]*"/, "$1 x=\"" + vb.x + "\" y=\"" + vb.y + "\" width=\"" + vb.w + "\" height=\"" + vb.h + "\"");
  fs.writeFileSync(file, src);
}

// ---------------------------------------------------------------- run
if (!fs.existsSync(DIR)) { console.error("no " + path.relative(ROOT, DIR) + " folder"); process.exit(1); }
// A name beginning with "_" is not a feature: it is a working file kept beside the art, such as _stamps.svg, the sheet of glyphs the features are stamped from.
// Those are skipped entirely -- not read, not checked, never written into overworld-art.js -- so they may hold text, circles, groups and anything else an editor likes.
const files = fs.readdirSync(DIR).filter((f) => f.endsWith(".svg") && f.charAt(0) !== "_").sort().map((f) => path.join(DIR, f));
if (doGuide && !checkOnly) files.forEach(refreshGuide);

const features = {};
const seen = {};
files.forEach((f) => {
  readFeatures(f).forEach((ft) => {
    if (seen[ft.key]) { fail("two layers are both named \"" + (ft.label || ft.key) + "\" (" + seen[ft.key] + " and " + ft.file + "); one of them needs a different name"); return; }
    seen[ft.key] = ft.file;
    features[ft.key] = { unit: UNIT, name: ft.label, kind: ft.kind, info: ft.info, line: ft.line, label: ft.at, width: ft.width, decor: ft.decor, bbox: ft.bbox, paths: ft.paths };
  });
});

const body = "/*\n * OVERWORLD ART -- generated by tools/gen_overworld_art.js from web/mygame/overworld-art/*.svg. Do not edit by hand: edit the SVG and run the script. Read by overworldmap.js.\n" +
  " * Each feature: its name, kind, card text and where its name is drawn, all taken from the layer in Inkscape, plus unit (SVG units per map unit), bbox and paths.\n */\n" +
  "window.OVERWORLD_ART = " + JSON.stringify(features) + ";\n";

if (checkOnly) {
  const cur = fs.existsSync(OUT) ? fs.readFileSync(OUT, "utf8").replace(/\r\n/g, "\n") : "";
  if (cur !== body || bad) { console.error("overworld-art.js is STALE or an SVG is bad -- run `node tools/gen_overworld_art.js`"); process.exit(1); }
  console.log("overworld-art.js is up to date (" + Object.keys(features).length + " feature(s))");
} else {
  if (bad) process.exit(1);
  fs.writeFileSync(OUT, body);
  console.log("wrote " + path.relative(ROOT, OUT) + ": " + Object.keys(features).length + " feature(s), " + Object.keys(features).reduce((n, k) => n + features[k].paths.length, 0) + " path(s)");
}
