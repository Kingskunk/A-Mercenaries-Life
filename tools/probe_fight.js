#!/usr/bin/env node
// probe_fight.js -- plays a combat play script in the REAL page (headless Chrome) and screenshots the battle screen after every step (2026-11-23).
//
// WHY: tools/scripted_play.js runs the scenes without the page, so it never sees the battle bar, the icons, the battlefield art, the sidebar or the
// tooltips. This runs the same script in the game itself: the character is built exactly as scripted_play builds it (setupStats), the fight starts
// at the script's label, and each step's option is ticked and submitted the way a click on it would be. Page breaks are pressed as they come, as
// scripted_play does. After each step it saves a screenshot, and it reports:
//   - every battle-bar slot drawn with a letter instead of art (no ACTION_ICONS / spell icon entry for it)
//   - JavaScript errors the page threw
//   - the last page's text (so a screenshot can be matched to what happened)
//
// Dice: with "seed" the page uses scripted_play's seeded generator, so the rolls look real; without it, each step's "rand" (or the script's) is a
// fixed value. The page calls Math.random for things the scenes do not (sound, scenery), so the rolls need not match scripted_play's run exactly.
//
// Run:  node tools/probe_fight.js <script.json> [--built] [--out=<dir>] [--hover=<slot name>]
//   default   serves web/mygame/ over http with tools/serve_app.js, so it shows the scenes and js as they are on disk, with no compile
//   --built   opens play_game.html instead (what ships; only as fresh as the last compile)
//   --out     folder for the screenshots (default <tmp>/probe_fight/<script name>)
//   --hover   at the end, hovers the battle-bar slot with this name and screenshots its tooltip card; "css:<selector>" hovers any element instead
//   --open    at the end, clicks the battle-bar slot with this name so its fly-out opens (Throw, Shoot, Potions...), lists its buttons and screenshots it;
//             --open-hover=<text> then hovers the fly-out button whose label holds the text and screenshots its card
// It starts its own Chrome profile and its own server and stops only those processes. CHROME=... if Chrome is not in the usual place.
// PROBE_HTML=1 prints each step's page markup (#text), to see how its spacing is built.
// PROBE_DUMP=1 prints where the page keeps its buttons and text, for when a UI change moves them and the probe stops finding options.
"use strict";
const { spawn, spawnSync } = require("child_process");
const fs = require("fs"), os = require("os"), path = require("path");
const ROOT = path.resolve(__dirname, "..").split(path.sep).join("/");
const CHROME = process.env.CHROME || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const sp = require("./scripted_play.js");

const args = process.argv.slice(2);
const file = args.find((a) => a.indexOf("--") !== 0);
const flag = (n) => { const a = args.find((x) => x === "--" + n || x.indexOf("--" + n + "=") === 0); return a === undefined ? undefined : (a.indexOf("=") < 0 ? true : a.slice(a.indexOf("=") + 1)); };
if (!file) { console.log("Usage: node tools/probe_fight.js <script.json> [--built] [--out=<dir>] [--hover=<slot name>]"); process.exit(0); }
const scn = JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
const NAME = path.basename(file).replace(/\.json$/, "");
const OUT = flag("out") || path.join(os.tmpdir(), "probe_fight", NAME);
const built = !!flag("built");
const hover = flag("hover");
const openSlot = flag("open"), openHover = flag("open-hover");

function randValue(v) { return v === "low" ? 0 : v === "high" ? 0.9999 : v === "mid" || v === undefined ? 0.5 : Number(v); }

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  fs.readdirSync(OUT).filter((f) => /\.png$/.test(f)).forEach((f) => fs.unlinkSync(path.join(OUT, f)));

  // 1. The starting character and world, as scripted_play makes them.
  const all = sp.setupStats(scn), stats = {};
  Object.keys(all).forEach((k) => {
    const v = all[k];
    if (v === null || typeof v === "object" || typeof v === "function") return;
    if (k === "scene" || k === "sceneName" || k === "choice_user_restored" || k.indexOf("choice_page_start") === 0) return;
    stats[k] = v;
  });

  // 2. The page: served from disk (default) or the built bundle.
  const tag = "cs-probefight-" + Date.now();
  let server = null, page = "file:///" + ROOT + "/play_game.html";
  if (!built) {
    const DEV_PORT = 8300 + Math.floor(Math.random() * 200);
    server = spawn(process.execPath, [path.join(ROOT, "tools", "serve_app.js"), ROOT, String(DEV_PORT)], { stdio: "ignore" });
    page = "http://127.0.0.1:" + DEV_PORT + "/web/mygame/index.html";
    await sleep(900);
  }
  const PORT = 9800 + Math.floor(Math.random() * 150);
  const chrome = spawn(CHROME, ["--headless=new", "--disable-gpu", "--allow-file-access-from-files", "--remote-debugging-port=" + PORT, "--no-first-run",
    "--window-size=1600,1000", "--mute-audio", "--user-data-dir=" + path.join(os.tmpdir(), tag), page], { stdio: "ignore" });
  let ws = null, problems = 0;
  const jsErrors = [];
  try {
    let list = null;
    for (let i = 0; i < 60; i++) { await sleep(250); try { list = await (await fetch("http://127.0.0.1:" + PORT + "/json/list")).json(); if (list.some((t) => t.type === "page")) break; } catch (e) {} }
    const target = list && list.find((t) => t.type === "page");
    if (!target) throw new Error("Chrome gave no page");
    ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
    let id = 0; const pending = new Map();
    ws.onmessage = (e) => {
      const m = JSON.parse(e.data);
      if (m.method === "Runtime.exceptionThrown") { const d = m.params.exceptionDetails; jsErrors.push(((d.exception && d.exception.description) || d.text || "").split("\n")[0] + (d.url ? " (" + d.url.split("/").pop() + ":" + d.lineNumber + ")" : "")); }
      if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
    };
    const cmd = (method, params) => new Promise((res, rej) => { const n = ++id; pending.set(n, (m) => (m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result))); ws.send(JSON.stringify({ id: n, method, params: params || {} })); });
    const ev = async (expression) => { const r = await cmd("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails).slice(0, 500)); return r.result.value; };
    await cmd("Runtime.enable");
    // The game's own first page must be drawn before the fight is started, or it draws over it.
    for (let i = 0; i < 120; i++) { await sleep(300); try { if (await ev("!!(window.stats && window.Scene && window.nav && document.querySelectorAll('#main form .choice label, #main form button').length)")) break; } catch (e) {} }
    await sleep(800);

    // Dice in the page.
    if (scn.seed !== undefined) {
      await ev(`(function(){ var a = ${Number(scn.seed) >>> 0}; Math.random = function(){ a = (a + 0x6D2B79F5) | 0; var t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; return true; })()`);
    }
    const setRand = (v) => scn.seed !== undefined ? Promise.resolve() : ev("(function(){ var v = " + randValue(v) + "; Math.random = function(){ return v; }; return true; })()");
    await setRand(scn.rand);

    // Start the script's scene at its label, with its stats (set inside clearScreen's callback: something resets them before it, see probe_trade_panel.js).
    await ev(`(function(){
      clearScreen(function(){
        var s = window.stats, set = ${JSON.stringify(stats)};
        Object.keys(set).forEach(function (k) { s[k] = set[k]; });
        var scene = new Scene(${JSON.stringify(scn.scene || "port_valen/port_valen")}, s, nav, {});
        ${scn.label ? "scene.targetLabel = { label: " + JSON.stringify(scn.label) + ", origin: 'url', originLine: 0 };" : ""}
        scene.execute(); });
      return true; })()`);

    // What is on screen: the option labels, or a lone page-break button.
    const READ = `(function(){
      var labels = Array.prototype.slice.call(document.querySelectorAll('#main form .choice label'));
      var btn = document.querySelector('#main form button, #main form input[type=submit], #main button.next');
      return { options: labels.map(function(l){ return l.textContent.replace(/\\s+/g,' ').trim(); }), button: btn ? (btn.textContent || btn.value || '').trim() : '' };
    })()`;
    // Every #main's text (the page can hold more than one), for change detection and the closing read.
    // innerText reads empty here (the page is drawn through a transition), so the text is gathered from the paragraphs, choices and button.
    const MAINTEXT = "Array.prototype.map.call(document.querySelectorAll('#main #text > *, #main form .choice label, #main button'), function(m){ return m.textContent.replace(/\\s+/g, ' ').trim(); }).filter(Boolean).join('\\n')";
    const pageSig = () => ev("(function(){ var t = " + MAINTEXT + "; return t.length + ':' + t.slice(-200); })()");
    // A page is drawn when it has changed, carries a menu or a button, and has stopped changing.
    const waitChange = async (before) => {
      for (let i = 0; i < 80; i++) { await sleep(150); const now = await pageSig(); if (now && now !== before) break; }
      let prev = "";
      for (let i = 0; i < 40; i++) { await sleep(200); const now = await pageSig(); const r = await ev(READ); if (now === prev && (r.options.length || r.button)) break; prev = now; }
      await sleep(400);
    };
    const shot = async (label) => {
      const f = path.join(OUT, label + ".png");
      const r = await cmd("Page.captureScreenshot", { format: "png" });
      fs.writeFileSync(f, Buffer.from(r.data, "base64"));
      return f;
    };
    const pressNext = async () => { const before = await pageSig(); await ev("(function(){ var b = document.querySelector('#main form button, #main form input[type=submit], #main button.next'); if (b) b.click(); return !!b; })()"); await waitChange(before); };
    const choose = async (text) => {
      const before = await pageSig();
      const ok = await ev(`(function(){
        var t = ${JSON.stringify(text)}, labels = document.querySelectorAll('#main form .choice label');
        for (var i = 0; i < labels.length; i++) {
          if (typeof t === 'number' ? i === t - 1 : labels[i].textContent.replace(/\\s+/g,' ').indexOf(t) !== -1) {
            labels[i].click(); var f = labels[i].closest('form'); if (f.requestSubmit) f.requestSubmit(); else f.submit(); return true;
          }
        }
        return false; })()`);
      if (ok) await waitChange(before);
      return ok;
    };
    // Page breaks are pressed until a menu shows, as scripted_play does.
    const toMenu = async () => { for (let i = 0; i < 12; i++) { const s = await ev(READ); if (s.options.length || !s.button) return s; await pressNext(); } return ev(READ); };

    // A big scene (combat.txt) takes a while to fetch and parse: wait until the opening page is gone.
    for (let i = 0; i < 120; i++) { await sleep(250); const s0 = await ev(READ); if (!s0.options.some((o) => /show me the numbers/.test(o))) break; }
    await sleep(700);
    console.log("== " + NAME + (built ? " (play_game.html)" : " (web/mygame, served from disk)"));
    let shots = [await shot("00_start")];
    const steps = scn.steps || [];
    let n = 0;
    for (let si = 0; si < steps.length; si++) {
      const st = steps[si];
      if (st.absent || st.pick === undefined) continue;
      let s = await toMenu();
      const want = st.pick;
      const has = () => s.options.some((o, i) => typeof want === "number" ? i === want - 1 : o.indexOf(want) !== -1);
      if (!has()) {
        if (st.optional || st.whileAvail) continue;
        console.log("  stopped: no option matches '" + want + "'. On screen: " + (s.options.length ? s.options.map((o) => o.slice(0, 50)).join(" | ") : "(no options" + (s.button ? "; button '" + s.button + "'" : "") + ")"));
        if (process.env.PROBE_DUMP) console.log(await ev("(document.getElementById('main')||document.body).innerHTML.slice(0, 3000)"));
        problems++; break;
      }
      let reps = 0;
      do {
        await setRand(st.rand !== undefined ? st.rand : scn.rand);
        // A step's "set" (as scripted_play): stats changed just before the pick.
        if (st.set) await ev("(function(o){ for (var k in o) window.stats[k] = o[k]; })(" + JSON.stringify(st.set) + ")");
        await choose(want);
        n++;
        shots.push(await shot(String(n).padStart(2, "0") + "_" + String(want).replace(/[^A-Za-z0-9]+/g, "_").slice(0, 30)));
        console.log("  step " + n + ": " + want + "  (round " + (await ev("String(window.stats.combat_round)")) + ")");
        if (process.env.PROBE_HTML) console.log(await ev("(function(){ var t = document.querySelectorAll('#main #text'); return t.length ? t[t.length - 1].innerHTML : ''; })()"));
        s = await toMenu();
      } while (st.whileAvail && has() && ++reps < 30);
    }

    // The battle bar: slots drawn with a letter because they have no art.
    const bar = await ev(`(function(){
      var hud = document.getElementById('battleHud');
      if (!hud || !hud.getBoundingClientRect().height) return { shown: false, noArt: [], slots: 0 };
      var slots = hud.querySelectorAll('.bhud-slot'), no = [];
      for (var i = 0; i < slots.length; i++) if (slots[i].querySelector('.bhud-glyph')) no.push(slots[i].getAttribute('aria-label'));
      return { shown: true, noArt: no, slots: slots.length };
    })()`);
    if (!bar.shown) console.log("  battle bar: not on screen at the end");
    else {
      console.log("  battle bar: " + bar.slots + " slot(s)" + (bar.noArt.length ? ", " + bar.noArt.length + " with no art: " + bar.noArt.join(", ") : ", all with art"));
    }

    const hoverCss = hover && hover.indexOf("css:") === 0 ? hover.slice(4) : null;
    if (hover && (bar.shown || hoverCss)) {
      const sel = hoverCss ? JSON.stringify(hoverCss) : `'#battleHud .bhud-slot[aria-label*=' + JSON.stringify(${JSON.stringify(hover)}) + ']'`;
      const box = await ev(`(function(){ var s = document.querySelector(${sel}); if (!s) return null; var r = s.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
      if (!box) { console.log("  hover: no slot named '" + hover + "'"); problems++; }
      else {
        await cmd("Input.dispatchMouseEvent", { type: "mouseMoved", x: box.x, y: box.y });
        await sleep(1600);
        shots.push(await shot("zz_hover_" + String(hover).replace(/[^A-Za-z0-9]+/g, "_")));
      }
    }

    // --open (2026-11-25): click a battle-bar slot so its fly-out opens (Throw, Shoot, Potions...), screenshot it, and with --open-hover hover one of its buttons for the card.
    if (openSlot && bar.shown) {
      const osel = `'#battleHud .bhud-slot[aria-label*=' + JSON.stringify(${JSON.stringify(openSlot)}) + ']'`;
      const obox = await ev(`(function(){ var s = document.querySelector(${osel}); if (!s) return null; var r = s.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
      if (!obox) { console.log("  open: no slot named '" + openSlot + "'"); problems++; }
      else {
        await cmd("Input.dispatchMouseEvent", { type: "mouseMoved", x: obox.x, y: obox.y });
        await cmd("Input.dispatchMouseEvent", { type: "mousePressed", x: obox.x, y: obox.y, button: "left", clickCount: 1 });
        await cmd("Input.dispatchMouseEvent", { type: "mouseReleased", x: obox.x, y: obox.y, button: "left", clickCount: 1 });
        await sleep(900);
        const fly = await ev(`(function(){ var f = document.getElementById(${JSON.stringify("battleHudFly")}); if (!f || !/on/.test(f.className)) return null; var b = f.querySelectorAll('.bfly-btn'), out = []; for (var i = 0; i < b.length; i++) out.push(b[i].getAttribute('aria-label') + (b[i].querySelector('img') ? '' : ' (no art)')); return out; })()`);
        console.log("  open '" + openSlot + "': " + (fly ? fly.join(" | ") : "no fly-out opened"));
        shots.push(await shot("zz_open_" + String(openSlot).replace(/[^A-Za-z0-9]+/g, "_")));
        if (openHover && fly) {
          const hbox = await ev(`(function(){ var b = document.querySelectorAll('#' + ${JSON.stringify("battleHudFly")} + ' .bfly-btn'); for (var i = 0; i < b.length; i++) if ((b[i].getAttribute('aria-label') || '').indexOf(${JSON.stringify(String(openHover))}) >= 0) { var r = b[i].getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; } return null; })()`);
          if (!hbox) { console.log("  open-hover: no fly-out button with '" + openHover + "'"); problems++; }
          else {
            await cmd("Input.dispatchMouseEvent", { type: "mouseMoved", x: hbox.x, y: hbox.y });
            await sleep(1600);
            shots.push(await shot("zz_openhover_" + String(openHover).replace(/[^A-Za-z0-9]+/g, "_")));
          }
        }
      }
    }

    const last = await ev("(function(){ return (" + MAINTEXT + ").split('\\n').filter(function(l){ return l.trim(); }).slice(-14).join('\\n'); })()");
    if (process.env.PROBE_DUMP) console.log(await ev(`(function(){
      var out = ['#main count ' + document.querySelectorAll('#main').length];
      var all = document.querySelectorAll('button, input[type=submit]');
      for (var i = 0; i < all.length; i++) { var b = all[i]; var t = (b.textContent || b.value || '').trim(); if (/hold|next|continue/i.test(t)) { var p = b, chain = []; while (p && chain.length < 6) { chain.push(p.tagName + (p.id ? '#' + p.id : '') + (p.className && typeof p.className === 'string' ? '.' + p.className.split(' ').join('.') : '')); p = p.parentElement; } out.push('button "' + t + '": ' + chain.join(' < ')); } }
      var w = document.evaluate("//*[contains(text(),'Beast')]", document, null, 7, null);
      for (var j = 0; j < Math.min(w.snapshotLength, 4); j++) { var e = w.snapshotItem(j), c = [], q = e; while (q && c.length < 5) { c.push(q.tagName + (q.id ? '#' + q.id : '')); q = q.parentElement; } out.push('text in ' + c.join(' < ')); }
      return out.join('\\n'); })()`));
    console.log("  last page (end):\n" + last.split("\n").map((l) => "    " + l.slice(0, 160)).join("\n"));
    if (jsErrors.length) { problems += jsErrors.length; console.log("  page errors (" + jsErrors.length + "):"); jsErrors.slice(0, 8).forEach((e) => console.log("    " + e)); }
    else console.log("  page errors: none");
    console.log("  screenshots (" + shots.length + "): " + OUT);
  } finally {
    if (ws) try { ws.close(); } catch (e) {}
    try { chrome.kill(); } catch (e) {}
    if (server) try { server.kill(); } catch (e) {}
    try { spawnSync("powershell", ["-NoProfile", "-Command", "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | Where-Object { $_.CommandLine -like '*" + tag + "*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }"], { stdio: "ignore" }); } catch (e) {}
  }
  return problems;
}

main().then((p) => process.exit(p ? 1 : 0)).catch((e) => { console.error("probe_fight: " + e.message); process.exit(2); });
