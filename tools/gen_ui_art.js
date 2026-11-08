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
 *      node tools/gen_ui_art.js --refresh-png silhouette_fighter ...
 *                                              (embed selected already-sized PNG sources without rebuilding the other art)
 */
const { spawn } = require("child_process");
const fs = require("fs");
const http = require("http");
const os = require("os");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "web", "mygame", "uiart.css");
const CHROME = process.env.CHROME || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
// A fixed debugging port can be held by a stale Chrome helper and leave fetch() waiting forever.
// Give each generator run its own port, and bound every connection probe below.
const PORT = 9300 + Math.floor(Math.random() * 500);

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
  ["silhouette",            "UiElements/warrior_silhouette_man.png",   320, 640, 0.9], // fallback figure behind the Inventory paper doll
  ["silhouette_fighter",    "UiElements/fighter_silhouette_man.png",   320, 640, 0.9],
  ["silhouette_barbarian",  "UiElements/barbarian_silhouette_man.png", 320, 640, 0.9],
  ["silhouette_rogue",      "UiElements/rogue_silhouette_man.png",     320, 640, 0.9],
  ["silhouette_ranger",     "UiElements/ranger_silhouette_man.png",    320, 640, 0.9],
  ["silhouette_bard",       "UiElements/bard_silhouette_man.png",      320, 640, 0.9],
  ["silhouette_wizard",     "UiElements/wizard_silhouette_man_v2.png", 320, 640, 0.9],
  ["silhouette_warlock",    "UiElements/warlock_silhouette_man.png",   320, 640, 0.9],
  ["btn2on",    "UiElements/button2_ready_on.png",       128,  128, 0.92],   // square bronze-framed crimson button, stretched tall for the HUD's Advance and Retreat
  ["stone",     "UiElements/mid_background.png",         1280, 640, 0.60],   // the dark stone behind everything (nearly black, so it compresses hard)
  // The overworld map's sheet (overworldmap.css .ow-mapbox): the map panel is a drawn map on paper, and this is the paper. It does NOT tile: it is one sheet laid over the
  // map and moves with it. It TILES: the world will grow many times over, and one stretched picture would distort, blur and eventually run out, so the sixth field asks for a
  // seamless tile (see the canvas below) and overworldmap.css repeats it at a fixed size in drawn units. The source is in /Wallpaper with the place
  // backdrops (one level above ICONS) because it is a photograph-sized texture, not an interface piece -- but in /Wallpaper/Textures, NOT /Wallpaper itself, because every loose
  // picture in /Wallpaper is read below as a place backdrop and a texture is not a place. Any future texture goes in that folder too.
  ["parchment", "../Wallpaper/Textures/parcment.png",    1300, 1300, 0.80, "mirror"],

  // the left rail's icons, named i_<button>
  ["i_stats",   "Interface/Abilities_Icon.png",          72,   72,  0.92],
  ["i_lore",    "Menu/Spellbook_Menu_Icon.png",          72,   72,  0.92],
  ["i_pack",    "Interface/Equipment_Icon.png",          72,   72,  0.92],
  ["i_trade",   "Interface/Antique Gold Exchange Emblem.png", 72, 72, 0.92],
  ["i_save",    "Menu/Map_Menu_Icon.png",                72,   72,  0.92],
  ["i_menu",    "Menu/Magic_Icon.png",                   72,   72,  0.92],
  ["i_read",    "Interface/Antique Bronze Speaker Emblem.png", 72, 72, 0.92],   // read aloud (the TTS reader)
  ["i_map",     "Item/Miscellaneous_item/Book/Map_World_A_Item_Icon.png", 72, 72, 0.92],   // the dungeon map button
  ["i_spells",  "Interface/Spellbook_Icon.png",          72,   72,  0.92],   // the spellbook button

  // the spellbook panel (web/mygame/spellbook.css), from the Cartography set. book_page is ONE page with its leather spine down the left edge, so the
  // panel draws it twice and mirrors the left copy: the two spines meet in the middle and read as one open book. book_tab is the leather index tab the
  // level orbs sit on, and book_folio is the aged board behind the whole spread.
  ["book_page",  "UiElements/Interface/Cartography/pieces/journal-page.png", 512, 683, 0.84],
  ["book_tab",   "UiElements/Interface/Cartography/pieces/leather-tab.png",  216, 65,  0.90],
  ["book_folio", "UiElements/Interface/Cartography/pieces/map-folio.png",    512, 732, 0.80],
  ["book_clip",  "UiElements/Interface/Cartography/icons/paperclip.png",     64,  64,  0.92],   // marks a spell an ITEM grants: a slip clipped in, not written in
  ["book_seal",  "UiElements/Interface/Cartography/icons/wax-seal.png",      96,  96,  0.90],   // the flourish at the foot of the reading page

  // the sidebar's portrait ring, named c_<class> (character_class)
  ["c_fighter",   "HUD/Class_Fighter_Plain_Icon.png",    96,   96,  0.92],
  ["c_barbarian", "HUD/Class_Barbarian_Plain_Icon.png",  96,   96,  0.92],
  ["c_bard",      "HUD/Class_Bard_Plain_Icon.png",       96,   96,  0.92],
  ["c_ranger",    "HUD/Class_Ranger_Plain_Icon.png",     96,   96,  0.92],
  ["c_rogue",     "HUD/Class_Rogue_Plain_Icon.png",      96,   96,  0.92],
  ["c_warlock",   "HUD/Class_Warlock_Plain_Icon.png",    96,   96,  0.92],
  ["c_wizard",    "HUD/Class_Wizard_Plain_Icon.png",     96,   96,  0.92]
];

// Place backdrops (web/mygame/scenery.js): every pair <Name>_Day.png / <Name>_Night.png in /Wallpaper (one level above ICONS) becomes scene_<name>_day and scene_<name>_night, so a new place
// is two files dropped in that folder and this script re-run. The two pictures should be the SAME view by day and by night, so the clock can blend them. The height is 0 = keep the picture's own
// proportions (a width of 1672 px, quality 0.72). A name with spaces or capitals is turned into a plain key: "Silt Conduits_Day.png" -> scene_silt_conduits_day.
// The pictures are NOT inlined into the single html file (each is a few hundred KB): they are written as real files in /scenery, and a small list of which keys exist is written to
// web/mygame/scenery-data.js. scenery.js finds the folder at run time (it sits beside play_game.html, or two levels above web/mygame/index.html) and loads a place's pair when it is first needed.
const SCENERY_DIR = path.join(ROOT, "scenery");
const MANIFEST = path.join(ROOT, "web", "mygame", "scenery-data.js");
const WALL = path.join(ROOT, "Wallpaper");
// These are intentionally always-night standalone scenes, not the missing half of a day/night pair.
const SCENE_SINGLE_OVERRIDES = { "prologue_camp_night.png": "prologue_camp_night", "generic_watch_post_night.png": "generic_watch_post_night" };
// A picture with no _Day / _Night partner (an interior, which looks the same at every hour) is a SINGLE: one file, scenery/<name>.webp, darkened at night by the page.
// The list scenery-data.js holds is {key: "pair" | "single"}.
const SCENE_KINDS = {};
if (fs.existsSync(WALL)) {
  const files = fs.readdirSync(WALL).filter((f) => /\.(png|jpg|jpeg|webp)$/i.test(f));
  const plain = (n) => n.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  const partnered = {};
  files.forEach((f) => {
    const m = /^(.+)_Day\.(png|jpg|jpeg|webp)$/i.exec(f);
    if (!m) return;
    const night = files.find((g) => g.toLowerCase().indexOf((m[1] + "_Night.").toLowerCase()) === 0);
    if (!night) { console.error("  Wallpaper/" + f + " has no " + m[1] + "_Night picture, so it is skipped"); return; }
    const key = plain(m[1]); partnered[f] = partnered[night] = true; SCENE_KINDS[key] = "pair";
    ART.push(["scene_" + key + "_day", "../Wallpaper/" + f, 1672, 0, 0.72]);
    ART.push(["scene_" + key + "_night", "../Wallpaper/" + night, 1672, 0, 0.72]);
  });
  files.forEach((f) => {
    const forcedKey = SCENE_SINGLE_OVERRIDES[f.toLowerCase()];
    if (forcedKey) {
      SCENE_KINDS[forcedKey] = "single";
      ART.push(["scene_" + forcedKey, "../Wallpaper/" + f, 1672, 0, 0.72]);
      return;
    }
    if (partnered[f] || /_(Day|Night)\.[a-z]+$/i.test(f)) return;   // a half of a pair, reported above if its partner is missing
    const key = plain(f.replace(/\.[a-z]+$/i, ""));
    SCENE_KINDS[key] = "single";
    ART.push(["scene_" + key, "../Wallpaper/" + f, 1672, 0, 0.72]);
  });
}

const checkOnly = process.argv.includes("--check");
const refreshAt = process.argv.indexOf("--refresh-png");
// --scenery: only the place backdrops (the UI art in uiart.css is left alone), and only those whose source picture in /Wallpaper is newer than the copy in /scenery. node compile.js runs
// `gen_ui_art.js --scenery --check` and, if it says stale, `gen_ui_art.js --scenery`, so changing a picture in /Wallpaper and compiling is all it takes. --force redoes every picture.
const SCENERY_ONLY = process.argv.includes("--scenery"), FORCE = process.argv.includes("--force");
const sceneStale = (a) => {
  const dst = path.join(SCENERY_DIR, a[0].slice(6) + ".webp"), src = path.join(ROOT, "ICONS", a[1]);
  return !fs.existsSync(dst) || (fs.existsSync(src) && fs.statSync(dst).mtimeMs < fs.statSync(src).mtimeMs);
};

// the list of backdrops the page may show, and a version stamp for each (the newest of its files, in base 36) that scenery.js adds to the address, so a browser never shows an old copy of a changed picture
function writeManifest() {
  const ver = {};
  Object.keys(SCENE_KINDS).forEach((k) => {
    const names = SCENE_KINDS[k] === "single" ? [k] : [k + "_day", k + "_night"];
    let t = 0; names.forEach((n) => { const f = path.join(SCENERY_DIR, n + ".webp"); if (fs.existsSync(f)) t = Math.max(t, Math.floor(fs.statSync(f).mtimeMs / 1000)); });
    ver[k] = t.toString(36);
  });
  fs.writeFileSync(MANIFEST, "/* GENERATED by tools/gen_ui_art.js: the place backdrops in /scenery, each a day-and-night pair or a single picture, and a version stamp for each (scenery.js reads it). Do not edit. */\nwindow.SCENERY_ART = " + JSON.stringify(SCENE_KINDS) + ";\nwindow.SCENERY_V = " + JSON.stringify(ver) + ";\n");
  console.log("wrote " + path.relative(ROOT, MANIFEST) + " (" + Object.keys(SCENE_KINDS).length + " place(s))");
}

function checkSources() {
  let bad = 0;
  for (const a of ART) {
    if (!fs.existsSync(path.join(ROOT, "ICONS", a[1]))) { console.error("  MISSING source: " + a[1]); bad++; }
  }
  return bad;
}

// Targeted refresh for already-sized transparent PNGs. This mirrors item-icons' refresh path and is useful when only a few UI assets changed: it preserves every
// unrelated generated variable and does not require launching the headless-browser resizer.
if (refreshAt >= 0) {
  const keys = process.argv.slice(refreshAt + 1), byName = Object.fromEntries(ART.map((a) => [a[0], a]));
  let css = fs.existsSync(OUT) ? fs.readFileSync(OUT, "utf8") : "", bad = 0;
  if (!keys.length) { console.error("--refresh-png needs at least one ART name"); process.exit(1); }
  if (!css) { console.error("uiart.css is missing; run the full generator first"); process.exit(1); }
  for (const key of keys) {
    const art = byName[key], src = art && path.join(ROOT, "ICONS", art[1]);
    if (!art) { console.error("unknown UI art key: " + key); bad++; continue; }
    if (path.extname(src).toLowerCase() !== ".png" || !fs.existsSync(src)) { console.error(key + " does not resolve to a PNG source"); bad++; continue; }
    const decl = "  --art-" + key + ": url(\"data:image/png;base64," + fs.readFileSync(src).toString("base64") + "\");";
    const re = new RegExp("^\\s*--art-" + key + ":.*;$", "m");
    if (re.test(css)) css = css.replace(re, decl);
    else css = css.replace(/\n}\s*$/, "\n" + decl + "\n}\n");
  }
  if (bad) process.exit(1);
  fs.writeFileSync(OUT, css);
  console.log("refreshed " + keys.length + " PNG UI assets in " + path.relative(ROOT, OUT));
  process.exit(0);
}

if (checkOnly) {
  let bad = checkSources();
  const css = fs.existsSync(OUT) ? fs.readFileSync(OUT, "utf8") : "";
  const man = fs.existsSync(MANIFEST) ? fs.readFileSync(MANIFEST, "utf8") : "";
  let scenes = 0;
  for (const a of ART) {
    if (a[0].indexOf("scene_") === 0) {
      scenes++;
      if (!fs.existsSync(path.join(SCENERY_DIR, a[0].slice(6) + ".webp"))) { console.error("  scenery/" + a[0].slice(6) + ".webp is missing"); bad++; }
      else if (sceneStale(a)) { console.error("  scenery/" + a[0].slice(6) + ".webp is older than its picture in Wallpaper/"); bad++; }
      continue;
    }
    if (!SCENERY_ONLY && css.indexOf("--art-" + a[0] + ":") < 0) { console.error("  uiart.css lacks --art-" + a[0]); bad++; }
  }
  Object.keys(SCENE_KINDS).forEach((k) => { if (man.indexOf("\"" + k + "\"") < 0) { console.error("  scenery-data.js lacks " + k); bad++; } });
  if (bad) { console.error("uiart.css or the scenery files are STALE or incomplete -- run `node tools/gen_ui_art.js`"); process.exit(1); }
  console.log("uiart.css is up to date (" + (ART.length - scenes) + " images, " + Math.round(css.length / 1024) + " KB) and " + Object.keys(SCENE_KINDS).length + " scenery place(s) are in /scenery");
  process.exit(0);
}

if (checkSources()) process.exit(1);

// what to do: every picture, or in --scenery mode only the backdrops, and of those only the stale ones (unless --force)
const todo = ART.filter((a) => !SCENERY_ONLY || a[0].indexOf("scene_") === 0).filter((a) => a[0].indexOf("scene_") !== 0 || FORCE || sceneStale(a));
if (SCENERY_ONLY && !todo.length) { writeManifest(); console.log("scenery is up to date"); process.exit(0); }

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const getJson = (url, timeoutMs) => new Promise((resolve, reject) => {
  const req = http.get(url, (res) => {
    let body = "";
    res.setEncoding("utf8");
    res.on("data", (chunk) => { body += chunk; });
    res.on("end", () => { try { resolve(JSON.parse(body)); } catch (e) { reject(e); } });
  });
  req.setTimeout(timeoutMs, () => req.destroy(new Error("debug endpoint timeout")));
  req.on("error", reject);
});

(async () => {
  // Node's fetch/AbortSignal handles may be unref'ed on Windows; keep the process alive until the browser conversion and cleanup have genuinely finished.
  const keepAlive = setInterval(() => {}, 1000);
  const page = "file:///" + path.join(ROOT, "ICONS").replace(/\\/g, "/") + "/UiElements/Frame_mid.png";   // any file:// page to run in
  const chrome = spawn(CHROME, ["--headless=new", "--disable-gpu", "--no-sandbox", "--disable-dev-shm-usage", "--allow-file-access-from-files", "--remote-debugging-port=" + PORT, "--no-first-run",
    "--user-data-dir=" + path.join(os.tmpdir(), "cs-uiart-" + Date.now()), page], { stdio: "ignore" });
  let ws = null;
  try {
    let list = null;
    for (let i = 0; i < 40; i++) {
      await sleep(250);
      try { list = await getJson("http://127.0.0.1:" + PORT + "/json/list", 500); if (list.some((t) => t.type === "page")) break; } catch (e) {}
    }
    const target = list && list.find((t) => t.type === "page");
    if (!target) throw new Error("no browser page appeared (is Chrome at " + CHROME + "? set CHROME=...)");
    ws = new WebSocket(target.webSocketDebuggerUrl);
    await Promise.race([
      new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; }),
      sleep(5000).then(() => { throw new Error("browser debugging WebSocket did not open"); })
    ]);
    let id = 0; const pending = new Map();
    ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
    const evaluate = (expression) => new Promise((res, rej) => {
      const n = ++id;
      pending.set(n, (m) => (m.result && m.result.exceptionDetails) ? rej(new Error(JSON.stringify(m.result.exceptionDetails).slice(0, 400))) : res(m.result.result.value));
      ws.send(JSON.stringify({ id: n, method: "Runtime.evaluate", params: { expression, awaitPromise: true, returnByValue: true } }));
    });

    const iconsUrl = "file:///" + path.join(ROOT, "ICONS").replace(/\\/g, "/") + "/";
    const out = {};
    for (const [name, src, w, h, q, mode] of todo) {
      const uri = await evaluate(`new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const H = ${h} || Math.round(img.naturalHeight * ${w} / img.naturalWidth);
          const c = document.createElement("canvas"); c.width = ${w}; c.height = H;
          const g = c.getContext("2d"); g.imageSmoothingQuality = "high";
          if (${mode === "mirror"}) {
            // A SEAMLESS tile out of a picture that is not one: the middle square of the source is drawn into the top-left quarter, then mirrored across and down.
            // Mirrored edges always meet without a seam, whatever the picture, and the price -- the tile is symmetrical about its own middle -- cannot be read on a
            // texture with no features in it. So a tiling sheet needs no specially made art and no hand retouching.
            const s = Math.min(img.naturalWidth, img.naturalHeight);
            const sx = (img.naturalWidth - s) / 2, sy = (img.naturalHeight - s) / 2;
            const hw = ${w} / 2, hh = H / 2;
            g.drawImage(img, sx, sy, s, s, 0, 0, hw, hh);
            g.save(); g.translate(${w}, 0); g.scale(-1, 1); g.drawImage(c, 0, 0, hw, hh, 0, 0, hw, hh); g.restore();
            g.save(); g.translate(0, H); g.scale(1, -1); g.drawImage(c, 0, 0, ${w}, hh, 0, 0, ${w}, hh); g.restore();
          } else {
            g.drawImage(img, 0, 0, ${w}, H);
          }
          resolve(c.toDataURL("image/webp", ${q}));
        };
        img.onerror = () => reject(new Error("could not load " + ${JSON.stringify(src)}));
        img.src = ${JSON.stringify(iconsUrl + src)};
      })`);
      if (!/^data:image\/webp/.test(uri)) throw new Error(name + ": the browser did not produce a WebP (" + String(uri).slice(0, 30) + ")");
      if (name.indexOf("scene_") === 0) {
        fs.mkdirSync(SCENERY_DIR, { recursive: true });
        fs.writeFileSync(path.join(SCENERY_DIR, name.slice(6) + ".webp"), Buffer.from(uri.split(",")[1], "base64"));
        console.log("  " + name.padEnd(9) + " -> scenery/" + name.slice(6) + ".webp  " + Math.round(uri.length * 0.75 / 1024) + " KB");
        continue;
      }
      out[name] = uri;
      console.log("  " + name.padEnd(9) + " " + (w + "x" + (h || "auto")).padEnd(10) + " " + Math.round(uri.length * 0.75 / 1024) + " KB");
    }
    let css = "/*\n * UI ART -- generated by tools/gen_ui_art.js from ICONS/UiElements. Do not edit by hand; edit ART in that script and re-run it.\n * Each --art-<name> is a ready-to-use url(\"data:...\"), so a stylesheet writes e.g.  border-image: var(--art-frame) 55 / 38px stretch;\n */\n:root {\n";
    for (const name of Object.keys(out)) css += "  --art-" + name + ": url(\"" + out[name] + "\");\n";
    css += "}\n";
    if (!SCENERY_ONLY) fs.writeFileSync(OUT, css);
    writeManifest();
    if (!SCENERY_ONLY) console.log("wrote " + path.relative(ROOT, OUT) + " (" + Math.round(css.length / 1024) + " KB)");
  } finally {
    clearInterval(keepAlive);
    if (ws) try { ws.close(); } catch (e) {}
    chrome.kill();
  }
})().catch((e) => { console.error("FAILED: " + e.message); process.exit(1); });
