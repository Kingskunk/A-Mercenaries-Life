#!/usr/bin/env node
/*
 * build_app.js -- packs the game as an installable offline web app in dist/ (2026-10-27, the user: play it on an Android tablet, with updates pushed from the PC).
 *
 *   dist/index.html            play_game.html with the app's <head> tags and app/pwa.js added (the game itself is untouched)
 *   dist/ambience/*.ogg        the sound loops the game loads by relative path
 *   dist/scenery/*.webp        the place backdrops, likewise
 *   dist/icons/*.png           app/icons (node tools/gen_app_icons.js makes them from app/icon.svg)
 *   dist/manifest.webmanifest  name, icons and display mode, so the browser offers "Install app"
 *   dist/sw.js                 app/sw.js, unchanged
 *   dist/asset-manifest.json   every file with its hash, and the build id (a hash of all of them); the worker compares it to what it holds and downloads only what changed
 * Wallpaper/, ICONS/ and Sounds/ are the sources the game's tools convert from; they are never shipped.
 *
 * Run: node tools/build_app.js                 compile the game (node compile.js play_game.html), then build dist/
 *      node tools/build_app.js --no-compile    use the play_game.html already built
 *      node tools/build_app.js --src FILE --out DIR   another page and another output folder (tests use this)
 * Then serve dist/ over https: node tools/serve_app.js (see its header), or any static host.
 */
"use strict";
const fs = require("fs"), path = require("path"), crypto = require("crypto"), cp = require("child_process");
const ROOT = path.resolve(__dirname, "..");
const args = process.argv.slice(2);
function opt(name) { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null; }
const SRC = path.resolve(ROOT, opt("--src") || "play_game.html"), OUT = path.resolve(ROOT, opt("--out") || "dist");
const APP = path.join(ROOT, "app");

if (!opt("--src") && args.indexOf("--no-compile") < 0) {
  console.log("compiling the game (node compile.js play_game.html) ...");
  const r = cp.spawnSync(process.execPath, [path.join(ROOT, "compile.js"), "play_game.html"], { cwd: ROOT, stdio: "inherit" });
  if (r.status !== 0) { console.error("build_app: compile failed"); process.exit(1); }
}
if (!fs.existsSync(SRC)) { console.error("build_app: " + SRC + " does not exist"); process.exit(1); }
["icons/icon-192.png", "icons/icon-512.png", "sw.js", "pwa.js"].forEach((f) => { if (!fs.existsSync(path.join(APP, f))) { console.error("build_app: app/" + f + " is missing" + (f.startsWith("icons") ? " (run node tools/gen_app_icons.js)" : "")); process.exit(1); } });

// the output folder is rebuilt whole: nothing stale can ship
if (OUT === ROOT || OUT === path.parse(OUT).root) { console.error("build_app: refusing to clear " + OUT); process.exit(1); }
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

// 1. the page
let html = fs.readFileSync(SRC, "utf8");
const headAt = html.indexOf("<head>"), endAt = html.lastIndexOf("</body>");
if (headAt < 0 || endAt < 0 || html.split("<head>").length !== 2) { console.error("build_app: the page has no single <head> and </body> to add to"); process.exit(1); }
const headTags = [
  '<link rel="manifest" href="manifest.webmanifest">',
  '<meta name="theme-color" content="#12100f">',
  '<meta name="mobile-web-app-capable" content="yes">',
  '<link rel="icon" type="image/png" href="icons/icon-192.png">',
  '<link rel="apple-touch-icon" href="icons/icon-192.png">'
].join("\n");
const pwa = fs.readFileSync(path.join(APP, "pwa.js"), "utf8");
html = html.slice(0, headAt + 6) + "\n" + headTags + "\n" + html.slice(headAt + 6, endAt) + "<script>\n" + pwa + "</script>\n" + html.slice(endAt);
fs.writeFileSync(path.join(OUT, "index.html"), html, "utf8");

// 2. the runtime assets, whole folders (the sources behind them are not shipped)
function copyDir(from, to, exts) {
  if (!fs.existsSync(from)) return 0;
  fs.mkdirSync(to, { recursive: true });
  let n = 0;
  fs.readdirSync(from).forEach((f) => { if (exts.indexOf(path.extname(f).toLowerCase()) >= 0) { fs.copyFileSync(path.join(from, f), path.join(to, f)); n++; } });
  return n;
}
const nSound = copyDir(path.join(ROOT, "ambience"), path.join(OUT, "ambience"), [".ogg"]);
const nArt = copyDir(path.join(ROOT, "scenery"), path.join(OUT, "scenery"), [".webp"]);
copyDir(path.join(APP, "icons"), path.join(OUT, "icons"), [".png"]);
fs.copyFileSync(path.join(APP, "sw.js"), path.join(OUT, "sw.js"));

// 3. the web app manifest
const manifest = {
  name: "Port Valen", short_name: "Port Valen", description: "An RPG in ChoiceScript",
  start_url: "./", scope: "./", id: "./", display: "fullscreen", display_override: ["fullscreen", "standalone"], orientation: "any",
  background_color: "#12100f", theme_color: "#12100f",
  icons: [
    { src: "icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
    { src: "icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    { src: "icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
  ]
};
fs.writeFileSync(path.join(OUT, "manifest.webmanifest"), JSON.stringify(manifest, null, 2) + "\n");

// 4. the asset manifest: every shipped file but the worker and the manifest itself
const files = {};
(function walk(dir, rel) {
  fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1)).forEach((e) => {
    const r = rel ? rel + "/" + e.name : e.name, p = path.join(dir, e.name);
    if (e.isDirectory()) return walk(p, r);
    if (r === "sw.js") return;
    const buf = fs.readFileSync(p);
    files[r] = { h: crypto.createHash("sha1").update(buf).digest("hex").slice(0, 16), s: buf.length };
  });
})(OUT, "");
const core = Object.keys(files).filter((f) => !f.startsWith("ambience/") && !f.startsWith("scenery/"));
const build = crypto.createHash("sha1").update(Object.keys(files).map((f) => f + ":" + files[f].h).join("|")).digest("hex").slice(0, 12);
fs.writeFileSync(path.join(OUT, "asset-manifest.json"), JSON.stringify({ build, core, files }, null, 1) + "\n");

const total = Object.keys(files).reduce((a, f) => a + files[f].s, 0), coreBytes = core.reduce((a, f) => a + files[f].s, 0);
console.log("dist/ built: build " + build + ", " + Object.keys(files).length + " files (" + nSound + " sounds, " + nArt + " backdrops), " + (total / 1048576).toFixed(1) + " MB, of which the game itself " + (coreBytes / 1048576).toFixed(1) + " MB");
