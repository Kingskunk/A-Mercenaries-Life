// probe_overworld_map.js -- headless-Chrome screenshot of the overworld travel map, for looking at how the drawn map READS (2026-11-04).
//
// WHY: the map panel is the one piece of the game whose whole point is how it looks -- the parchment sheet, the ink the roads and
// names are drawn in, the marks for the kinds of place. No scene test can see any of that. This stands a character on a tile,
// opens the real page in the real game, and saves a picture of the map at a few zooms.
//
// Run:  node tools/probe_overworld_map.js [tile] [--out=<dir>] [--dev]        (CHROME=... if Chrome is not in the usual place)
//         --dev   the loose files, no compile.js first: the loop for drawing map art
//         without it, the built play_game.html, so `node compile.js` first
// It starts its own Chrome profile and stops only its own processes.
const { spawn } = require("child_process");
const fs = require("fs"), os = require("os"), path = require("path");
const ROOT = path.resolve(__dirname, "..").split(path.sep).join("/");
const CHROME = process.env.CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const play = require("./scripted_play.js").play;

const tile = (process.argv[2] && process.argv[2].indexOf("--") !== 0) ? process.argv[2] : "lg";
const outArg = process.argv.find((a) => a.indexOf("--out=") === 0);
// --dev reads the loose js and css straight from web/mygame/ instead of the built play_game.html, so the loop for ART is: edit the SVG, run gen_overworld_art.js, run
// this -- with no compile.js, which is the slow step. It has to go over http: opened as a file://, web/mygame/index.html asks the person to grant the folder first and
// never reaches the game, so --dev starts tools/serve_app.js on the repo and stops it again at the end. Use the built page for anything the build itself touches.
const dev = process.argv.includes("--dev");
const DEV_PORT = 8300 + Math.floor(Math.random() * 200);
const OUT = outArg ? outArg.slice(6) : path.join(os.tmpdir(), "ow-map");

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const res = play({
    scene: "overworld/overworld", label: "ow_here", preset: "Scout Company Rogue",
    weather: "Clear", time: "Morning", day: "Ironday",
    stats: { name: "Corin", campaign_day: 4, ow_pos: tile }, steps: []
  });
  if (res.error) { console.log("FAIL scripted_play: " + res.error); process.exit(1); }
  const stats = {};
  Object.keys(res.s).forEach((k) => {
    const v = res.s[k];
    if (v === null || typeof v === "object" || typeof v === "function") return;
    if (k === "scene" || k === "sceneName" || k === "choice_user_restored" || k.indexOf("choice_page_start") === 0) return;
    stats[k] = v;
  });

  var server = null, page = "file:///" + ROOT + "/play_game.html";
  if (dev) {
    server = spawn(process.execPath, [path.join(ROOT, "tools", "serve_app.js"), ROOT, String(DEV_PORT)], { stdio: "ignore" });
    page = "http://127.0.0.1:" + DEV_PORT + "/web/mygame/index.html";
    await sleep(900);
    console.log("  dev: serving the folder on " + DEV_PORT + " (no compile.js in this loop)");
  }
  const PORT = 9800 + Math.floor(Math.random() * 150);
  const chrome = spawn(CHROME, ["--headless=new", "--disable-gpu", "--allow-file-access-from-files", "--remote-debugging-port=" + PORT,
    "--no-first-run", "--window-size=1500,1100", "--user-data-dir=" + path.join(os.tmpdir(), "cs-owmap-" + Date.now()),
    page], { stdio: "ignore" });
  let ws = null;
  try {
    let list = null;
    for (let i = 0; i < 60; i++) { await sleep(250); try { list = await (await fetch("http://127.0.0.1:" + PORT + "/json/list")).json(); if (list.some((t) => t.type === "page")) break; } catch (e) {} }
    const target = list && list.find((t) => t.type === "page");
    if (!target) throw new Error("no page");
    ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
    let id = 0; const pending = new Map();
    ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
    const ev = (expression) => new Promise((r, j) => {
      const n = ++id;
      pending.set(n, (m) => (m.result && m.result.exceptionDetails) ? j(new Error(JSON.stringify(m.result.exceptionDetails).slice(0, 600))) : r(m.result.result.value));
      ws.send(JSON.stringify({ id: n, method: "Runtime.evaluate", params: { expression, awaitPromise: true, returnByValue: true } }));
    });
    const cmd = (method, params) => new Promise((r, j) => {
      const n = ++id;
      pending.set(n, (m) => (m.error ? j(new Error(JSON.stringify(m.error))) : r(m.result)));
      ws.send(JSON.stringify({ id: n, method, params: params || {} }));
    });
    for (let i = 0; i < 80; i++) { await sleep(300); try { if (await ev("!!(window.stats && window.Scene && window.nav)")) break; } catch (e) {} }
    await sleep(3500);

    // Stats are set inside the clearScreen callback: something resets them before it (the same dance as probe_spellbook.js).
    await ev(`(function(){
      clearScreen(function(){
        var s = window.stats, set = ${JSON.stringify(stats)};
        Object.keys(set).forEach(function (k) { s[k] = set[k]; });
        var scene = new Scene("overworld/overworld", s, nav, {});
        scene.targetLabel = { label: "ow_here", origin: "url", originLine: 0 }; scene.execute(); });
      return true; })()`);
    await sleep(3000);

    const up = await ev("!!document.querySelector('#overworldMap .ow-svg')");
    if (!up) { console.log("FAIL the map panel did not open"); process.exit(1); }
    console.log("tile " + tile + ": " + await ev("(document.querySelector('#overworldMap .ow-card-head')||{}).textContent || ''"));

    const shot = async (name) => {
      const box = await ev("(function(){var r=document.getElementById('overworldMap').getBoundingClientRect();return JSON.stringify({x:Math.round(r.left),y:Math.round(r.top),width:Math.round(r.width),height:Math.round(r.height)});})()");
      const clip = Object.assign(JSON.parse(box), { scale: 2 });
      const png = await cmd("Page.captureScreenshot", { format: "png", clip, captureBeyondViewport: true });
      const file = path.join(OUT, name + ".png");
      fs.writeFileSync(file, Buffer.from(png.data, "base64"));
      console.log("  " + file);
    };
    await ev("document.getElementById('overworldMap').scrollIntoView({block:'center'}); true");
    await sleep(600);
    await shot("map_" + tile + "_open");
    // zoomed in two steps, to see the ink and the paper at the scale the player reads names at
    await ev("(function(){var b=document.querySelector('[data-ow-act=zoomin]'); b.click(); b.click(); return true;})()");
    await sleep(900);
    await shot("map_" + tile + "_near");
    // zoomed all the way out (the All button): the view where the sheet used to run out and show the dark behind it
    await ev("document.querySelector('[data-ow-act=fit]').click(); true");
    await sleep(900);
    await shot("map_" + tile + "_all");
    // hovering a drawn feature, then clicking one: the wash must stay invisible for the first and appear only for the second
    await ev("document.querySelector('[data-ow-act=zoomin]').click(); true");
    await sleep(700);
    const feat = await ev("(function(){var all=[].slice.call(document.querySelectorAll('[data-ow-feature]')); var g=all.filter(function(e){return e.querySelector('path.wash');})[0]||all[0]; if(!g) return null; var p=g.querySelector('path:not(.wash)'); if(!p) return null; var r=p.getBoundingClientRect(); return JSON.stringify({x:Math.round(r.left+r.width/2),y:Math.round(r.top+r.height/2),id:g.getAttribute('data-ow-feature')});})()");
    if (feat) {
      const f0 = JSON.parse(feat);
      await cmd("Input.dispatchMouseEvent", { type: "mouseMoved", x: f0.x, y: f0.y });
      await sleep(600);
      await shot("map_" + tile + "_hover_" + f0.id);
      await cmd("Input.dispatchMouseEvent", { type: "mousePressed", x: f0.x, y: f0.y, button: "left", clickCount: 1 });
      await cmd("Input.dispatchMouseEvent", { type: "mouseReleased", x: f0.x, y: f0.y, button: "left", clickCount: 1 });
      await sleep(800);
      await shot("map_" + tile + "_clicked_" + f0.id);
    } else { console.log("  (no drawn feature in view to hover)"); }
  } finally {
    if (ws) try { ws.close(); } catch (e) {}
    try { process.kill(chrome.pid); } catch (e) {}
    if (server) try { process.kill(server.pid); } catch (e) {}
  }
}
main().catch((e) => { console.log("FAIL " + e.message); process.exit(1); });
