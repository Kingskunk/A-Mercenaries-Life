// probe_scenery_click.js -- like probe_scenery_radiant.js, but drives the REAL *goto_scene transition by
// clicking the actual rendered choice (radio + form submit) instead of injecting a Scene() directly at the
// target label. This exercises the async scene-handoff gap scenery.js's own comment describes (sceneName
// updates before the new scene's lines run), which a direct injection skips over entirely.
const { spawn } = require("child_process");
const fs = require("fs"), os = require("os"), path = require("path");
const ROOT = path.resolve(__dirname, "..").split(path.sep).join("/");
const CHROME = process.env.CHROME || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const PORT = 9800 + Math.floor(Math.random() * 150);
  const profileDirName = "cs-scenery-click-" + Date.now();
  const chrome = spawn(CHROME, ["--headless=new", "--disable-gpu", "--allow-file-access-from-files", "--remote-debugging-port=" + PORT, "--no-first-run", "--window-size=1500,1000",
    "--user-data-dir=" + path.join(os.tmpdir(), profileDirName), "file:///" + ROOT + "/play_game.html"], { stdio: "ignore" });
  let ws = null;
  try {
    let list = null;
    for (let i = 0; i < 60; i++) { await sleep(250); try { list = await (await fetch("http://127.0.0.1:" + PORT + "/json/list")).json(); if (list.some((t) => t.type === "page")) break; } catch (e) {} }
    const target = list && list.find((t) => t.type === "page");
    if (!target) throw new Error("no page");
    ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((res2, rej) => { ws.onopen = res2; ws.onerror = rej; });
    let id = 0; const pending = new Map();
    ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
    const ev = (expression) => new Promise((res2, rej) => {
      const n = ++id;
      pending.set(n, (m) => (m.result && m.result.exceptionDetails) ? rej(new Error(JSON.stringify(m.result.exceptionDetails).slice(0, 800))) : res2(m.result.result.value));
      ws.send(JSON.stringify({ id: n, method: "Runtime.evaluate", params: { expression, awaitPromise: true, returnByValue: true } }));
    });
    for (let i = 0; i < 80; i++) { await sleep(300); try { if (await ev("!!(window.stats && window.Scene && window.nav)")) break; } catch (e) {} }
    await sleep(2000);

    const stats = {
      name: "Corin", campaign_day: 5, clock_hour: 18, clock_minute: 0, day_of_week: "Ironday",
      weather: "Clear", weather_severity: 0, weather_wet: false, weather_visibility: "clear",
      current_district: "middle_ward", mw_gate_road_seen: true, time_period: "Dusk",
      rj_perf_stage: "active", rj_perf_venue: 1, rj_perf_where: "middle_ward", rj_perf_until: 10,
      rh_from: "road"
    };
    await ev(`(function(){
      clearScreen(function(){
        var s = window.stats, set = ${JSON.stringify(stats)};
        Object.keys(set).forEach(function (k) { s[k] = set[k]; });
        var scene = new Scene("port_valen/radiant/radiant_hub", s, nav, {}); scene.targetLabel = { label: "rh_hub", origin: "url", originLine: 0 }; scene.execute(); });
      return true; })()`);
    await sleep(2200);

    const backdropKey = () => ev(`(function(){
      var st = document.querySelectorAll('#scenery .sc-stage');
      for (var i=0;i<st.length;i++) if (st[i].classList.contains('on') && st[i].classList.contains('top')) return st[i].getAttribute('data-scene');
      return null;
    })()`);

    console.log("after landing on rh_hub ->", await backdropKey());
    console.log("sceneName ->", await ev("window.stats.sceneName"));

    // Find and click the "The evening" choice by its visible text, then submit the form -- a real click, same as a player's.
    const clicked = await ev(`(function(){
      var labels = document.querySelectorAll('#main form .choice label');
      for (var i=0;i<labels.length;i++) {
        if (/The evening/.test(labels[i].textContent)) { labels[i].click(); var f = labels[i].closest('form'); if (f.requestSubmit) f.requestSubmit(); else f.submit(); return labels[i].textContent.trim(); }
      }
      return null;
    })()`);
    console.log("clicked choice ->", clicked);
    await sleep(200);
    console.log("immediately after click, sceneName ->", await ev("window.stats.sceneName"));
    console.log("immediately after click, backdrop ->", await backdropKey());
    await sleep(600);
    console.log("+0.6s sceneName ->", await ev("window.stats.sceneName"), " backdrop ->", await backdropKey());
    await sleep(1200);
    console.log("+1.8s sceneName ->", await ev("window.stats.sceneName"), " backdrop ->", await backdropKey());
    await sleep(2000);
    console.log("+3.8s sceneName ->", await ev("window.stats.sceneName"), " backdrop ->", await backdropKey());
    const bodyText = await ev("document.getElementById('main') ? document.getElementById('main').innerText.slice(0,300) : ''");
    console.log("page text now:\\n" + bodyText);
  } finally {
    if (ws) try { ws.close(); } catch (e) {}
    try { chrome.kill(); } catch (e) {}
    try { require("child_process").spawnSync("powershell", ["-NoProfile", "-Command", "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | Where-Object { $_.CommandLine -like '*" + profileDirName + "*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }"], { stdio: "ignore" }); } catch (e) {}
  }
}
main().catch((e) => { console.error("FAILED: " + e.message); process.exit(1); });
