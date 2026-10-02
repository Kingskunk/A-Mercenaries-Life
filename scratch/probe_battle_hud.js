// Drives the real game in headless Chrome (DevTools protocol, no dependencies) to a live combat hub and checks the Battle HUD.
// Usage: node scratch/probe_battle_hud.js "fragment" "fragment" ...   each fragment picks the first option whose text contains it
// (a number picks that option, 1 = first). After the last pick it reports the HUD and saves scratch/battle_hud.png.
const { spawn } = require("child_process");
const path = require("path");
const os = require("os");
const fs = require("fs");

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9335;
const root = path.resolve(__dirname, "..");
const target = "file:///" + path.join(root, "play_game.html").replace(/\\/g, "/");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const getJSON = async (p) => (await fetch(`http://127.0.0.1:${PORT}${p}`)).json();

const OPTIONS = `(() => Array.from(document.querySelectorAll("#main form .choice label")).map((l, i) => ({ i, t: l.textContent.replace(/\\s+/g, " ").trim(), off: !!(l.querySelector("input") || {}).disabled })))()`;
const PICK = (frag) => `(() => {
  const frag = ${JSON.stringify(frag)};
  const labels = Array.from(document.querySelectorAll("#main form .choice label"));
  let lab = /^\\d+$/.test(frag) ? labels[Number(frag) - 1] : labels.find(l => l.textContent.indexOf(frag) !== -1);
  if (!lab) return "NOT FOUND: " + frag;
  const radio = lab.querySelector("input[type=radio]");
  radio.checked = true;
  radio.form.onsubmit();
  return "picked: " + lab.textContent.replace(/\\s+/g, " ").trim().slice(0, 70);
})()`;
// "Next"-style pages have no radio list, only a button.
const NEXT = `(() => { const b = Array.from(document.querySelectorAll("#main button.next")).pop(); if (!b) return "no next"; b.click(); return "next"; })()`;

(async () => {
  const chrome = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${PORT}`, "--disable-gpu", "--no-first-run",
    "--no-default-browser-check", "--user-data-dir=" + path.join(os.tmpdir(), "cs-hud-probe-" + Date.now()), "--window-size=" + (process.env.HUD_WINDOW || "1500,1000"), target], { stdio: "ignore" });
  let ws = null;
  try {
    let list = null;
    for (let i = 0; i < 40; i++) {
      await sleep(250);
      try { list = await getJSON("/json/list"); if (list.some((t) => t.type === "page" && t.url.startsWith("file:"))) break; } catch (e) {}
    }
    const page = list && list.find((t) => t.type === "page" && t.url.startsWith("file:"));
    if (!page) throw new Error("no page target");
    ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
    let id = 0; const pending = new Map();
    ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
    const send = (method, params) => new Promise((res) => { const n = ++id; pending.set(n, res); ws.send(JSON.stringify({ id: n, method, params })); });
    const evaluate = async (expr) => {
      const r = await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true });
      if (r.result && r.result.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0, 600));
      return r.result.result.value;
    };
    await evaluate(`new Promise(r => { const t = setInterval(() => { if (window.stats && document.querySelector("#main form")) { clearInterval(t); r(true); } }, 50); setTimeout(() => r(false), 10000); })`);

    const steps = process.argv.slice(2);
    for (const frag of steps) {
      await sleep(700);
      let opts = await evaluate(OPTIONS);
      // The old page lingers while ChoiceScript fades it out: wait until the option that is about to be picked exists.
      for (let k = 0; k < 40 && !/^\d+$/.test(frag) && !opts.some(o => o.t.indexOf(frag) !== -1); k++) { await sleep(250); opts = await evaluate(OPTIONS); }
      if (!opts.length) { console.log("  (no options; " + await evaluate(NEXT) + ")"); await sleep(600); }
      const res = await evaluate(PICK(frag));
      console.log(res);
      if (res.indexOf("NOT FOUND") === 0) { console.log(JSON.stringify(opts.map(o => o.t.slice(0, 90)), null, 1)); break; }
    }
    // Fight intro pages end in Next buttons: press through until the hub (an "End your turn" option) is up.
    for (let k = 0; k < 25; k++) {
      await sleep(600);
      const o = await evaluate(OPTIONS);
      if (o.some(x => x.t.indexOf("End your turn") !== -1)) break;
      if (!o.length) console.log("  next:", await evaluate(NEXT));
    }
    await sleep(900);
    const hud = await evaluate(`(async () => {
      const h = document.getElementById("battleHud");
      const form = document.querySelector("#main form .choice");
      window.scrollTo(0, document.body.scrollHeight);
      await new Promise(r => setTimeout(r, 200));
      const slots = h ? Array.from(h.querySelectorAll(".bhud-slot")) : [];
      const first = slots[0];
      let tip = null;
      if (first) { first.dispatchEvent(new MouseEvent("mouseover", { bubbles: true })); await new Promise(r => setTimeout(r, 100)); const t = document.getElementById("battleHudTip"); tip = t ? t.innerText.replace(/\\n/g, " | ") : null; }
      const text = document.getElementById("text");
      const hr = h ? h.getBoundingClientRect() : null;
      const lastLine = text ? text.getBoundingClientRect().bottom : null;
      return {
        hud: !!h,
        slots: slots.map(t => (t.getAttribute("data-key") || "-") + ":" + t.getAttribute("aria-label") + (t.querySelector("img") ? " [icon]" : "") + (t.classList.contains("off") ? " (off)" : "")),
        dockTop: hr && Math.round(hr.top), dockHeight: hr && Math.round(hr.height), textBottom: lastLine && Math.round(lastLine), viewport: window.innerHeight,
        textClearOfDock: hr ? lastLine <= hr.top + 1 : null,
        classicListHidden: form ? getComputedStyle(form).display === "none" : null,
        tip
      };
    })()`);
    console.log(JSON.stringify(hud, null, 1));
    console.log("SCAN", await evaluate("(function(){ try { window.BattleHud.scan(); return 'ok engaged=' + window.stats.combat_engaged + ' hud=' + !!document.getElementById('battleHud'); } catch (e) { return 'ERR ' + e.message; } })()"));
    console.log("FORMS", JSON.stringify(await evaluate(`Array.from(document.querySelectorAll("#main form")).map(f => ({ n: f.querySelectorAll("label").length, first: (f.querySelector("label")||{textContent:""}).textContent.slice(0,30), vis: f.offsetParent !== null, parent: f.parentNode.id || f.parentNode.className, mainCount: document.querySelectorAll("#main").length }))`)));
    const shot = await send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync(path.join(__dirname, "battle_hud.png"), Buffer.from(shot.result.data, "base64"));
    if (process.env.HUD_RELOAD) {
      const grab = () => evaluate("(() => { const s = window.stats; const o = {}; for (let i = 1; i <= 2; i++) { ['name','hp','range','weapon_type','atk_bonus','dmg_bonus','strength','dexterity','ac'].forEach(k => o['e' + i + '_' + k] = s['combat_enemy' + i + '_' + k]); } o.round = s.combat_round; o.hp = s.hp_current; return o; })()");
      const before = await grab();
      console.log("RELOAD before:", JSON.stringify(before));
      for (let n = 1; n <= Number(process.env.HUD_RELOAD); n++) {
        await send("Page.reload", {});
        await sleep(2500);
        await evaluate("new Promise(r => { const t = setInterval(() => { if (window.stats && window.stats.combat_enemy1_name) { clearInterval(t); r(true); } }, 100); setTimeout(() => r(false), 12000); })");
        await sleep(1500);
        const after = await grab();
        const diffs = Object.keys(before).filter(k => String(before[k]) !== String(after[k])).map(k => k + ": " + before[k] + " -> " + after[k]);
        console.log("RELOAD " + n + ":", diffs.length ? "DIFFERENT " + diffs.join("; ") : "identical");
      }
    }
    if (process.env.HUD_EVAL) console.log("EVAL:", JSON.stringify(await evaluate(process.env.HUD_EVAL)));
    if (process.env.HUD_SHOT) {
      await sleep(1200);
      const shot3 = await send("Page.captureScreenshot", { format: "png", clip: process.env.HUD_CLIP ? (function(c){return {x:c[0],y:c[1],width:c[2],height:c[3],scale:c[4]||1};})(process.env.HUD_CLIP.split(",").map(Number)) : undefined });
      fs.writeFileSync(path.resolve(process.env.HUD_SHOT), Buffer.from(shot3.result.data, "base64"));
      console.log("SHOT:", process.env.HUD_SHOT);
    }
    if (process.env.HUD_PRESS) {
      const out = await evaluate(`(async () => { const t = document.querySelector("#battleHud [data-key='${process.env.HUD_PRESS}']"); if (!t) return "no tile"; const name = t.getAttribute("aria-label"); t.click(); await new Promise(r => setTimeout(r, 1500)); return name + " -> " + document.getElementById("text").innerText.slice(-500); })()`);
      console.log("PRESS:", out);
      const shot2 = await send("Page.captureScreenshot", { format: "png" });
      fs.writeFileSync(path.join(__dirname, "battle_hud_after.png"), Buffer.from(shot2.result.data, "base64"));
    }
  } finally {
    if (ws) try { ws.close(); } catch (e) {}
    chrome.kill();
  }
})().catch((e) => { console.error("PROBE FAILED: " + e.message); process.exit(1); });
