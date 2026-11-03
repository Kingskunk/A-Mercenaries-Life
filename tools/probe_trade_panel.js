// probe_trade_panel.js -- headless-Chrome check that a trade is settled INSIDE the open trade panel (2026-11-02, the user: the panel must not force-close on purchase, and the receipt
// belongs in the panel). trade.js confirm -> inventory.js quietRun (window.GameQuietRun) -> choicescript_stats codex_trade_now. For each scenario it puts a character in the place, trades,
// and prints whether the panel stayed open, the receipt line, the coin, the goods and the clock; then it closes the panel (the page behind must rebuild once, the panel must not reopen)
// and reopens it (the receipt must be gone).
// Run (after `node compile.js`):  node tools/probe_trade_panel.js [market|tailor|pawn|<any counter shop>|all]   (CHROME=... if Chrome is not in the usual place).
// It starts its own Chrome profile and stops only its own processes. Set character stats INSIDE the clearScreen callback: something resets them before it.
const { spawn } = require("child_process");
const os = require("os"), path = require("path");
const ROOT = path.resolve(__dirname, "..").split(path.sep).join("/");
const CHROME = process.env.CHROME || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// scene/label to enter, the stats to set, and the cart steps: [tab, row, clicks]
const BASE = { current_district: "langston", clock_hour: 12, clock_minute: 0, time_period: "Midday", day_of_week: "Marketday", street_life: "busy", weather: "Clear", gold: 0, silver: 5, copper: 0, name: "Corin" };
const SCENARIOS = {
  market: { scene: "Langston/market", label: "lg_market_ground", stats: Object.assign({}, BASE, { campaign_day: 10, langston_seen: true }),
    steps: [["buy", "buy:grain", 1, "Bought"], ["sell", "sell:grain", 1, "Sold"]] },
  tailor: { scene: "port_valen/port_valen_upper_wharves", label: "pq_tailor", stats: Object.assign({}, BASE, { campaign_day: 10, current_district: "port_valen_upper_wharves", silver: 9, pq_tailor_seen: true }),
    steps: [["buy", "buy:felt_hat", 1, "Bought felt hat"], ["sell", "sell:felt_hat", 1, "Sold felt hat"]] },
  pawn: { scene: "port_valen/port_valen_dredge_end", label: "cut_pawn_hub", stats: Object.assign({}, BASE, { campaign_day: 10, current_district: "port_valen_dredge_end", has_stiletto: true, cut_pawn_angel_met: true }),
    steps: [["sell", "sell:stiletto", 1, "Sold stiletto"]] },
};

// every counter shop, with the page that opens its panel; "auto" buys the first affordable row, then sells the first sellable row
const SHOP_PAGES = {
  halda: ["port_valen/port_valen_middle_ward", "mw_halda_stock"], ambrose: ["port_valen/port_valen_middle_ward", "mw_ambrose_stock"], hollis: ["port_valen/port_valen_middle_ward", "mw_hollis_stock"],
  vael: ["port_valen/port_valen_middle_ward", "mw_vael_shop"], inklamp: ["port_valen/port_valen_upper_wharves", "pq_ink_lamp_stock"], jeweler: ["port_valen/port_valen_upper_wharves", "pq_bright_gems"],
  works: ["timbermouth/workshops", "tm_works_stock"], tmstore: ["timbermouth/general_store", "tm_store_stock"], tomlin: ["Langston/tomlin_shop", "lg_tshop_stock"],
  lgstore: ["Langston/cord_and_kettle", "lg_store_stock"], afstore: ["alderford/lower_wharf_market", "af_store_stock"], torvald: ["alderford/timber_smithy", "af_smith_floor"],
  trapper: ["longshade/longshade_forest", "lsf_tw_trade"], hideyard: ["timbermouth/ashrun_holt/hide_yard", "ah_hy_trade"],
};
// pages that put a conversation in front of the shop on a first visit: mark them seen so the probe lands on the shop menu
const SEEN = { torvald: { af_smith_seen: true, met_janna: true, met_torvald: true } };
Object.keys(SHOP_PAGES).forEach((k) => {
  SCENARIOS[k] = { scene: SHOP_PAGES[k][0], label: SHOP_PAGES[k][1], auto: true, stats: Object.assign({}, BASE, { campaign_day: 10, gold: 5, silver: 0, raw_hide: 3, has_raw_hide: true }, SEEN[k] || {}) };
});

async function run(name) {
  const sc = SCENARIOS[name];
  const PORT = 9800 + Math.floor(Math.random() * 150);
  const profileDirName = "cs-tradetest-" + Date.now();
  const chrome = spawn(CHROME, ["--headless=new", "--disable-gpu", "--allow-file-access-from-files", "--remote-debugging-port=" + PORT, "--no-first-run", "--window-size=1500,1000",
    "--user-data-dir=" + path.join(os.tmpdir(), profileDirName), "file:///" + ROOT + "/play_game.html"], { stdio: "ignore" });
  let ws = null, fails = 0;
  const check = (label, ok, detail) => { console.log((ok ? "  ok   " : "  FAIL ") + label + (detail !== undefined ? "  [" + detail + "]" : "")); if (!ok) fails++; };
  try {
    let list = null;
    for (let i = 0; i < 60; i++) { await sleep(250); try { list = await (await fetch("http://127.0.0.1:" + PORT + "/json/list")).json(); if (list.some((t) => t.type === "page")) break; } catch (e) {} }
    const target = list && list.find((t) => t.type === "page");
    if (!target) throw new Error("no page");
    ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
    let id = 0; const pending = new Map();
    ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
    const ev = (expression) => new Promise((res, rej) => {
      const n = ++id;
      pending.set(n, (m) => (m.result && m.result.exceptionDetails) ? rej(new Error(JSON.stringify(m.result.exceptionDetails).slice(0, 600))) : res(m.result.result.value));
      ws.send(JSON.stringify({ id: n, method: "Runtime.evaluate", params: { expression, awaitPromise: true, returnByValue: true } }));
    });
    for (let i = 0; i < 80; i++) { await sleep(300); try { if (await ev("!!(window.stats && window.Scene && window.nav && window.TradePanel && window.GameQuietRun)")) break; } catch (e) {} }
    await sleep(4000);
    console.log("== " + name);
    await ev(`(function(){
      clearScreen(function(){
        var s = window.stats, set = ${JSON.stringify(sc.stats)};
        Object.keys(set).forEach(function (k) { s[k] = set[k]; });
        var scene = new Scene(${JSON.stringify(sc.scene)}, s, nav, {}); scene.targetLabel = { label: ${JSON.stringify(sc.label)}, origin: "url", originLine: 0 }; scene.execute(); });
      return true; })()`);
    await sleep(2500);
    const active = await ev("window.TradePanel.isActive()");
    check("trade is active on the page", active, await ev("window.stats.shop_open"));
    if (!active) {
      console.log("  page text: " + JSON.stringify(await ev("document.getElementById('text').innerText.slice(0,260)")));
      console.log("  options: " + JSON.stringify(await ev("Array.prototype.map.call(document.querySelectorAll('#options label, .choice label'), function(x){return x.textContent.trim().slice(0,40);})")));
      return 1;
    }
    await ev("window.TradePanel.open()");
    await sleep(800);
    check("panel opens", await ev("document.getElementById('trade').open"));
    const coin = () => ev("window.stats.gold*100 + window.stats.silver*10 + window.stats.copper");
    const receipt = () => ev("(function(){var r=document.querySelector('#trade .trd-receipt'); return r.hidden ? '' : r.textContent;})()");
    let last = await coin();
    if (sc.auto) {
      const tabsHave = await ev("Array.prototype.map.call(document.querySelectorAll('#trade [data-tab]'), function(t){return t.getAttribute('data-tab');}).join(',')");
      for (const [tab, expect] of [["buy", "Bought"], ["sell", "Sold"]]) {
        if (tabsHave.split(",").indexOf(tab) < 0) { console.log("  (no " + tab + " tab)"); continue; }
        await ev(`(function(){ var tabs = document.querySelectorAll('#trade [data-tab]'); for (var i=0;i<tabs.length;i++) if (tabs[i].getAttribute('data-tab')===${JSON.stringify(tab)}) tabs[i].click(); })()`);
        await sleep(300);
        const row = await ev(`(function(){ var rows = document.querySelectorAll('#trade .trd-row'); for (var i=0;i<rows.length;i++) { var b = rows[i].querySelector('button[data-step="1"]'); if (b && !b.disabled && String(rows[i].getAttribute('data-tip')).indexOf(${JSON.stringify(tab + ":")}) === 0) { b.click(); return rows[i].getAttribute('data-tip'); } } return ""; })()`);
        if (!row) { console.log("  (nothing to " + tab + ")"); continue; }
        await sleep(300);
        const can = await ev("!document.querySelector('#trade [data-act=confirm]').disabled");
        if (!can) { check(tab + " " + row + ": Confirm is enabled", false); continue; }
        await ev("document.querySelector('#trade [data-act=confirm]').click()");
        await sleep(2500);
        const rc = await receipt(), now = await coin();
        check(tab + " " + row + ": panel stays open", await ev("document.getElementById('trade').open"));
        check(tab + " " + row + ": receipt in the panel", rc.indexOf(expect) === 0, rc);
        check(tab + " " + row + ": coin moved the right way", tab === "buy" ? now < last : now > last, last + " -> " + now);
        last = now;
      }
    }
    for (const [tab, row, n, expect] of (sc.steps || [])) {
      await ev(`(function(){ var tabs = document.querySelectorAll('#trade [data-tab]'); for (var i=0;i<tabs.length;i++) if (tabs[i].getAttribute('data-tab')===${JSON.stringify(tab)}) tabs[i].click(); })()`);
      await sleep(300);
      for (let k = 0; k < n; k++) {
        const r = await ev(`(function(){ var b = document.querySelector('#trade .trd-row[data-tip="${row}"] button[data-step="1"]'); if (!b) return "missing"; b.click(); return "ok"; })()`);
        if (r !== "ok") check("row " + row + " has a + button", false, r);
        await sleep(200);
      }
      await ev("document.querySelector('#trade [data-act=confirm]').click()");
      await sleep(2500);
      const rc = await receipt(), now = await coin();
      check(tab + " " + row + ": panel stays open", await ev("document.getElementById('trade').open"));
      check(tab + " " + row + ": receipt in the panel", rc.indexOf(expect) === 0, rc);
      check(tab + " " + row + ": coin moved the right way", tab === "buy" ? now < last : now > last, last + " -> " + now);
      last = now;
    }
    await ev("window.TradePanel.close()");
    await sleep(2500);
    check("closing leaves the panel closed", !(await ev("document.getElementById('trade').open")));
    await ev("window.TradePanel.open()");
    await sleep(800);
    check("the receipt is gone when the panel is opened again", (await receipt()) === "", await receipt());
  } finally {
    if (ws) try { ws.close(); } catch (e) {}
    try { chrome.kill(); } catch (e) {}
    try { require("child_process").spawnSync("powershell", ["-NoProfile", "-Command", "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | Where-Object { $_.CommandLine -like '*" + profileDirName + "*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }"], { stdio: "ignore" }); } catch (e) {}
  }
  return fails;
}

(async () => {
  const which = process.argv[2] || "market";
  const names = which === "all" ? Object.keys(SCENARIOS) : [which];
  let fails = 0;
  for (const n of names) { if (!SCENARIOS[n]) { console.error("unknown scenario " + n); process.exit(1); } fails += await run(n); }
  console.log(fails ? fails + " check(s) FAILED" : "all checks passed");
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error("FAILED: " + e.message); process.exit(1); });
