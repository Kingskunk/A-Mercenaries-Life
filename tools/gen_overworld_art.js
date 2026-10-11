#!/usr/bin/env node
/*
 * gen_overworld_art.js -- turns the hand-drawn SVG art of the overworld map (the Coldspine mountain range) into web/mygame/overworld-art.js, which the map panel reads.
 *
 * WHY. The range used to be a thick line through a few points in overworld-data.js, which you could not shape. Now each feature is a plain .svg file in web/mygame/overworld-art/ that you edit in
 * Inkscape, Figma, Illustrator, or by hand, and this script copies its shapes into a small generated JS file. The game ships as one self-contained HTML file, so the SVG itself cannot be loaded at run
 * time; this is the same arrangement as the generated icon files (gen_spell_icons.js).
 *
 * HOW TO DRAW. Open web/mygame/overworld-art/<name>.svg. Draw ONLY inside the layer called "art" (<g id="art">), as <path> shapes, one per mountain block, and keep the file's own coordinates: 130 SVG
 * units are one map unit, Port Valen is at 0,0, east is +x and SOUTH is +y (the usual SVG way). The layer called "guide" is the towns and roads, drawn faint so you can see where things are; it is locked and
 * is rewritten by `--guide`, so anything you draw in it is lost. A path with class="ridge" is drawn as a thin lighter line (a spine or a crest); any other path is a filled mountain block. Colours, widths and
 * opacity come from overworldmap.css (.ow-f-range), not from the SVG, so one place themes them all. Rectangles, circles and groups with a rotation must be turned into paths first (Inkscape: Path > Object to Path).
 * The shape's name, the card text and the label position stay in overworld-data.js (FEATURES), keyed by the same name as the .svg file.
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
const UNIT = 130;   // SVG units per map unit; overworldmap.js SCALE and the panel's rescale read the "unit" written below

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
    if (/[a-zA-Z]/.test(toks[i])) cmd = toks[i++];
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

function readFeature(file) {
  const name = path.basename(file, ".svg");
  const src = fs.readFileSync(file, "utf8");
  const art = group(src, "art");
  if (!art) { fail(name + ".svg has no <g id=\"art\"> layer"); return null; }
  const inner = src.slice(art.innerStart, art.innerEnd);
  const groupT = attrs(art.tag).transform || "";
  inner.replace(/<(rect|circle|ellipse|line|polygon|polyline|text|image|use)\b/g, (m, tag) => { fail(name + ".svg: the art layer holds a <" + tag + ">; convert it to a path (Inkscape: Path > Object to Path)"); return m; });
  inner.replace(/<g\b[^>]*\btransform="[^"]*"[^>]*>/g, () => { fail(name + ".svg: a group inside the art layer has a transform; ungroup it or apply it (Object > Ungroup)"); return ""; });
  const paths = []; const re = /<path\b([^>]*?)\/?>/g; let t; let minx = Infinity, miny = Infinity, maxx = -Infinity, maxy = -Infinity;
  while ((t = re.exec(inner))) {
    const a = attrs(t[1]);
    if (!a.d) { fail(name + ".svg: a path has no d"); continue; }
    const m = parseTransform((groupT + " " + (a.transform || "")).trim());
    pathPoints(a.d).forEach((p) => { const q = apply(m, p[0], p[1]); minx = Math.min(minx, q[0]); maxx = Math.max(maxx, q[0]); miny = Math.min(miny, q[1]); maxy = Math.max(maxy, q[1]); });
    const e = { d: a.d.replace(/\s+/g, " ").trim() };
    if ((groupT + " " + (a.transform || "")).trim()) e.t = (groupT + " " + (a.transform || "")).trim();
    if (a.class) e.c = a.class.replace(/[^a-z0-9_ -]/gi, "").trim();
    paths.push(e);
  }
  if (!paths.length) { fail(name + ".svg: the art layer has no paths"); return null; }
  if (!Number.isFinite(minx)) { fail(name + ".svg: the art layer's paths have no points"); return null; }
  const r = (v) => Math.round(v * 10) / 10;
  return { name, bbox: [r(minx), r(miny), r(maxx), r(maxy)], paths };
}

// ---------------------------------------------------------------- the guide layer: the tiles and roads, faint, so the art can be drawn in the right place
function guideSvg(bbox) {
  const f = (v) => Math.round(v * 10) / 10;
  let s = "";
  OW.edges.forEach((e) => {
    const a = OW.nodes[e[0]], b = OW.nodes[e[1]], dash = (e[3] && e[3] !== "road") ? " stroke-dasharray=\"3 12\"" : "";
    s += "\n    <line x1=\"" + f(a.x * UNIT) + "\" y1=\"" + f(a.y * UNIT) + "\" x2=\"" + f(b.x * UNIT) + "\" y2=\"" + f(b.y * UNIT) + "\" stroke=\"#8a7b6c\" stroke-width=\"5\" stroke-linecap=\"round\"" + dash + "/>";
  });
  const col = { forest: "#6f9f78", town: "#e0a45e", city: "#e0a45e", village: "#c8b66a", fort: "#b36a6a" };
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
  const feat = readFeature(file);
  const g = group(src, "guide");
  if (!g) { fail(path.basename(file) + " has no <g id=\"guide\"> layer to refresh"); return; }
  src = src.slice(0, g.innerStart) + guideSvg(feat ? feat.bbox : null) + src.slice(g.innerEnd);
  const vb = viewBox(feat);
  src = src.replace(/viewBox="[^"]*"/, "viewBox=\"" + vb.x + " " + vb.y + " " + vb.w + " " + vb.h + "\"").replace(/(<svg\b[^>]*?)\swidth="[^"]*"/, "$1 width=\"" + vb.w + "\"").replace(/(<svg\b[^>]*?)\sheight="[^"]*"/, "$1 height=\"" + vb.h + "\"");
  src = src.replace(/(<rect id="page"[^>]*?)\sx="[^"]*"\sy="[^"]*"\swidth="[^"]*"\sheight="[^"]*"/, "$1 x=\"" + vb.x + "\" y=\"" + vb.y + "\" width=\"" + vb.w + "\" height=\"" + vb.h + "\"");
  fs.writeFileSync(file, src);
}

// ---------------------------------------------------------------- run
if (!fs.existsSync(DIR)) { console.error("no " + path.relative(ROOT, DIR) + " folder"); process.exit(1); }
const files = fs.readdirSync(DIR).filter((f) => f.endsWith(".svg")).sort().map((f) => path.join(DIR, f));
if (doGuide && !checkOnly) files.forEach(refreshGuide);

const features = {};
files.forEach((f) => { const ft = readFeature(f); if (ft) features[ft.name] = { unit: UNIT, bbox: ft.bbox, paths: ft.paths }; });

const body = "/*\n * OVERWORLD ART -- generated by tools/gen_overworld_art.js from web/mygame/overworld-art/*.svg. Do not edit by hand: edit the SVG and run the script. Read by overworldmap.js.\n" +
  " * Each feature: unit (SVG units per map unit), bbox (to keep it in view) and paths ({d, t: a transform, c: a class}).\n */\n" +
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
