#!/usr/bin/env node
/*
 * gen_app_icons.js -- renders app/icon.svg to app/icons/icon-192.png and icon-512.png (headless Chrome, as the other art generators do). Run it once, or after changing app/icon.svg; tools/build_app.js
 * copies the PNGs into dist/. The art is full-bleed with everything inside the central 66 percent, so one file serves both the plain and the maskable icon.
 * Run: node tools/gen_app_icons.js
 */
"use strict";
const fs = require("fs"), path = require("path"), cp = require("child_process"), os = require("os"), { pathToFileURL } = require("url");
const ROOT = path.resolve(__dirname, ".."), OUT = path.join(ROOT, "app", "icons");
const svg = fs.readFileSync(path.join(ROOT, "app", "icon.svg"), "utf8");
const CHROME = ["C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe", "/usr/bin/google-chrome", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"].find((p) => fs.existsSync(p));
if (!CHROME) { console.error("gen_app_icons: Chrome not found"); process.exit(1); }
fs.mkdirSync(OUT, { recursive: true });
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "appicon-"));
[192, 512].forEach((n) => {
  const html = path.join(tmp, "i" + n + ".html");
  fs.writeFileSync(html, "<!doctype html><meta charset=utf-8><style>html,body{margin:0;background:#12100f}svg{display:block;width:" + n + "px;height:" + n + "px}</style>" + svg);
  const png = path.join(OUT, "icon-" + n + ".png");
  const r = cp.spawnSync(CHROME, ["--headless=new", "--disable-gpu", "--no-first-run", "--hide-scrollbars", "--user-data-dir=" + path.join(tmp, "p" + n), "--window-size=" + n + "," + n, "--screenshot=" + png, pathToFileURL(html).href], { stdio: "ignore", timeout: 60000 });
  if (!fs.existsSync(png)) { console.error("gen_app_icons: no screenshot for " + n + " (exit " + r.status + ")"); process.exit(1); }
  console.log("wrote " + path.relative(ROOT, png) + " (" + fs.statSync(png).size + " bytes)");
});
try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) { /* the temp folder is only scratch */ }
