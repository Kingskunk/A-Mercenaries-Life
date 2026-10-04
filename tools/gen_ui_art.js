#!/usr/bin/env node
/*
 * gen_ui_art.js -- shrinks the interface art in ICONS/UiElements to the sizes the game actually draws and writes it to web/mygame/uiart.css as CSS custom
 * properties holding data: URIs (--art-frame, --art-banner, ...). The game ships as ONE html file, so a plain url(../ICONS/...) would 404, and the source
 * images are 2048 px wide and up to 1 MB each; this keeps the whole set to a few hundred KB.
 *
 * No image library is installed here, so the resizing is done by headless Chrome (a canvas draws each image at its target size and exports WebP, which keeps
 * transparency). Chrome is already needed by the browser probes in scratch/. It is launched with --allow-file-access-from-files so the canvas is not tainted by
 * file:// images.
 *
 * To change what is drawn: edit ART below (name, source under ICONS/, target width and height, WebP quality), run this, then `node compile.js`.
 *
 * Run: node tools/gen_ui_art.js            (write)
 *      node tools/gen_ui_art.js --check    (exit 1 if web/mygame/uiart.css is missing a name, or a source file is gone)
 */
const { spawn } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "web", "mygame", "uiart.css");
const CHROME = process.env.CHROME || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9341;

const ART = [
  // name        source (under ICONS/)                    w     h    quality
  ["frame",     "UiElements/Frame_mid.png",              1024, 512, 0.92],   // the ornate bronze frame, stretched around any panel with border-image
  ["banner",    "UiElements/name_bar.png",               640,  160, 0.92],   // the crimson arrow banner for titles
  ["banner2",   "UiElements/name_bar2.png",              512,  128, 0.92],   // the smaller banner for the character name
  ["round",     "UiElements/lil_roundframe_ready.png",   96,   96,  0.92],   // round button frame (rail)
  ["roundbig",  "UiElements/big_roundframe.png",         192,  192, 0.92],   // the portrait ring
  ["hpframe",   "UiElements/Hp_frame.png",               640,  40,  0.92],   // the HP bar casing
  ["slot",      "UiElements/Mini_frame1.png",            96,   96,  0.92],   // HUD slot frame
  ["buttonon",  "UiElements/button_ready_on.png",        192,  96,  0.92],   // crimson button (Level Up)
  ["silhouette", "UiElements/warrior_silhouette_man.png",  320,  640, 0.9],    // the dark figure behind the paper doll in the Inventory
  ["btn2on",    "UiElements/button2_ready_on.png",       128,  128, 0.92],   // square bronze-framed crimson button, stretched tall for the HUD's Advance and Retreat
  ["stone",     "UiElements/mid_background.png",         1280, 640, 0.60],   // the dark stone behind everything (nearly black, so it compresses hard)

  // the left rail's icons, named i_<button>
  ["i_stats",   "Interface/Abilities_Icon.png",          72,   72,  0.92],
  ["i_lore",    "Menu/Spellbook_Menu_Icon.png",          72,   72,  0.92],
  ["i_pack",    "Interface/Equipment_Icon.png",          72,   72,  0.92],
  ["i_trade",   "Interface/Antique Gold Exchange Emblem.png", 72, 72, 0.92],
  ["i_save",    "Menu/Map_Menu_Icon.png",                72,   72,  0.92],
  ["i_menu",    "Menu/Magic_Icon.png",                   72,   72,  0.92],
  ["i_read",    "Interface/Antique Bronze Speaker Emblem.png", 72, 72, 0.92],   // read aloud (the TTS reader)
  ["i_map",     "Item/Miscellaneous_item/Book/Map_World_A_Item_Icon.png", 72, 72, 0.92],   // the dungeon map button

  // the sidebar's portrait ring, named c_<class> (character_class)
  ["c_fighter",   "HUD/Class_Fighter_Plain_Icon.png",    96,   96,  0.92],
  ["c_barbarian", "HUD/Class_Barbarian_Plain_Icon.png",  96,   96,  0.92],
  ["c_bard",      "HUD/Class_Bard_Plain_Icon.png",       96,   96,  0.92],
  ["c_ranger",    "HUD/Class_Ranger_Plain_Icon.png",     96,   96,  0.92],
  ["c_rogue",     "HUD/Class_Rogue_Plain_Icon.png",      96,   96,  0.92],
  ["c_warlock",   "HUD/Class_Warlock_Plain_Icon.png",    96,   96,  0.92],
  ["c_wizard",    "HUD/Class_Wizard_Plain_Icon.png",     96,   96,  0.92]
];

const checkOnly = process.argv.includes("--check");

function checkSources() {
  let bad = 0;
  for (const a of ART) {
    if (!fs.existsSync(path.join(ROOT, "ICONS", a[1]))) { console.error("  MISSING source: " + a[1]); bad++; }
  }
  return bad;
}

if (checkOnly) {
  let bad = checkSources();
  const css = fs.existsSync(OUT) ? fs.readFileSync(OUT, "utf8") : "";
  for (const a of ART) if (css.indexOf("--art-" + a[0] + ":") < 0) { console.error("  uiart.css lacks --art-" + a[0]); bad++; }
  if (bad) { console.error("uiart.css is STALE or incomplete -- run `node tools/gen_ui_art.js`"); process.exit(1); }
  console.log("uiart.css is up to date (" + ART.length + " images, " + Math.round(css.length / 1024) + " KB)");
  process.exit(0);
}

if (checkSources()) process.exit(1);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const page = "file:///" + path.join(ROOT, "ICONS").replace(/\\/g, "/") + "/UiElements/Frame_mid.png";   // any file:// page to run in
  const chrome = spawn(CHROME, ["--headless=new", "--disable-gpu", "--allow-file-access-from-files", "--remote-debugging-port=" + PORT, "--no-first-run",
    "--user-data-dir=" + path.join(os.tmpdir(), "cs-uiart-" + Date.now()), page], { stdio: "ignore" });
  let ws = null;
  try {
    let list = null;
    for (let i = 0; i < 40; i++) {
      await sleep(250);
      try { list = await (await fetch("http://127.0.0.1:" + PORT + "/json/list")).json(); if (list.some((t) => t.type === "page")) break; } catch (e) {}
    }
    const target = list && list.find((t) => t.type === "page");
    if (!target) throw new Error("no browser page appeared (is Chrome at " + CHROME + "? set CHROME=...)");
    ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
    let id = 0; const pending = new Map();
    ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
    const evaluate = (expression) => new Promise((res, rej) => {
      const n = ++id;
      pending.set(n, (m) => (m.result && m.result.exceptionDetails) ? rej(new Error(JSON.stringify(m.result.exceptionDetails).slice(0, 400))) : res(m.result.result.value));
      ws.send(JSON.stringify({ id: n, method: "Runtime.evaluate", params: { expression, awaitPromise: true, returnByValue: true } }));
    });

    const iconsUrl = "file:///" + path.join(ROOT, "ICONS").replace(/\\/g, "/") + "/";
    const out = {};
    for (const [name, src, w, h, q] of ART) {
      const uri = await evaluate(`new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const c = document.createElement("canvas"); c.width = ${w}; c.height = ${h};
          const g = c.getContext("2d"); g.imageSmoothingQuality = "high"; g.drawImage(img, 0, 0, ${w}, ${h});
          resolve(c.toDataURL("image/webp", ${q}));
        };
        img.onerror = () => reject(new Error("could not load " + ${JSON.stringify(src)}));
        img.src = ${JSON.stringify(iconsUrl + src)};
      })`);
      if (!/^data:image\/webp/.test(uri)) throw new Error(name + ": the browser did not produce a WebP (" + String(uri).slice(0, 30) + ")");
      out[name] = uri;
      console.log("  " + name.padEnd(9) + " " + (w + "x" + h).padEnd(10) + " " + Math.round(uri.length * 0.75 / 1024) + " KB");
    }
    let css = "/*\n * UI ART -- generated by tools/gen_ui_art.js from ICONS/UiElements. Do not edit by hand; edit ART in that script and re-run it.\n * Each --art-<name> is a ready-to-use url(\"data:...\"), so a stylesheet writes e.g.  border-image: var(--art-frame) 55 / 38px stretch;\n */\n:root {\n";
    for (const name of Object.keys(out)) css += "  --art-" + name + ": url(\"" + out[name] + "\");\n";
    css += "}\n";
    fs.writeFileSync(OUT, css);
    console.log("wrote " + path.relative(ROOT, OUT) + " (" + Math.round(css.length / 1024) + " KB)");
  } finally {
    if (ws) try { ws.close(); } catch (e) {}
    chrome.kill();
  }
})().catch((e) => { console.error("FAILED: " + e.message); process.exit(1); });
