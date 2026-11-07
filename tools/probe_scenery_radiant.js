// probe_scenery_radiant.js -- headless-Chrome check of what backdrop key scenery.js actually paints for the
// radiant posting hub (rh_hub) and the Music for an Evening job (hall_perform), reusing probe_spellbook.js's
// CDP harness. Reads the DOM's live data-scene attribute (the key scenery.js just painted, scenery.js:495),
// which is ground truth -- unlike scripted_play.js, which never loads scenery.js at all.
// Run (after `node compile.js`): node tools/probe_scenery_radiant.js   (CHROME=... if Chrome is not in the usual place)
const { spawn } = require("child_process");
const fs = require("fs"), os = require("os"), path = require("path");
const ROOT = path.resolve(__dirname, "..").split(path.sep).join("/");
const CHROME = process.env.CHROME || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const BASE_STATS = {
  name: "Corin", campaign_day: 5, clock_hour: 18, clock_minute: 0, day_of_week: "Ironday",
  weather: "Clear", weather_severity: 0, weather_wet: false, weather_visibility: "clear",
  current_district: "middle_ward", mw_inn_seen: true, mw_inn_talk_house: true, mw_inn_talk_road: true,
  rj_perf_stage: "active", rj_perf_venue: 1, rj_perf_where: "middle_ward", rj_perf_until: 10,
  rh_from: "road"
};

async function main() {
  const PORT = 9800 + Math.floor(Math.random() * 150);
  const profileDirName = "cs-scenery-" + Date.now();
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

    async function land(sceneName, label, extra) {
      const stats = Object.assign({}, BASE_STATS, extra || {});
      await ev(`(function(){
        clearScreen(function(){
          var s = window.stats, set = ${JSON.stringify(stats)};
          Object.keys(set).forEach(function (k) { s[k] = set[k]; });
          var scene = new Scene(${JSON.stringify(sceneName)}, s, nav, {}); scene.targetLabel = { label: ${JSON.stringify(label)}, origin: "url", originLine: 0 }; scene.execute(); });
        return true; })()`);
      await sleep(2200);
      return ev(`(function(){
        var st = document.querySelectorAll('#scenery .sc-stage');
        for (var i=0;i<st.length;i++) if (st[i].classList.contains('on') && st[i].classList.contains('top')) return st[i].getAttribute('data-scene');
        return null;
      })()`);
    }

    console.log("mw_inn_hall (Wagoner's Rest hall, baseline) ->", await land("port_valen/port_valen_middle_ward", "mw_inn_hall", {}));
    console.log("hall_perform rj_perf_arrive, walked_in=false (posting-hub path) ->", await land("port_valen/radiant/hall_perform", "rj_perf_arrive", { rj_perf_walked_in: false }));
    console.log("hall_perform rj_perf_arrive, walked_in=true (new in-venue shortcut) ->", await land("port_valen/radiant/hall_perform", "rj_perf_arrive", { rj_perf_walked_in: true }));
    console.log("radiant_hub rh_hub, from the Trunk Road ->", await land("port_valen/radiant/radiant_hub", "rh_hub", { rh_from: "road" }));
    console.log("radiant_hub rh_hub, from Patrician Avenue ->", await land("port_valen/radiant/radiant_hub", "rh_hub", { rh_from: "avenue", current_district: "upper_wharves" }));
    console.log("radiant_hub rh_hub, from the Harbor Quayside ->", await land("port_valen/radiant/radiant_hub", "rh_hub", { rh_from: "harbor", current_district: "harbor" }));
  } finally {
    if (ws) try { ws.close(); } catch (e) {}
    try { chrome.kill(); } catch (e) {}
    try { require("child_process").spawnSync("powershell", ["-NoProfile", "-Command", "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | Where-Object { $_.CommandLine -like '*" + profileDirName + "*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }"], { stdio: "ignore" }); } catch (e) {}
  }
}
main().catch((e) => { console.error("FAILED: " + e.message); process.exit(1); });
