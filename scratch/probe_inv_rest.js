// Measures the pinned Rest card's vertical geometry and screenshots it.
//
// Why measure: .inv-item-main is `align-items: baseline`, and the Rest button carries min-height:44px.
// Baseline alignment lines the button's TEXT baseline up with the "Rest" word's baseline, which pushes
// the tall button's box upward -- so the button rides above the card's top edge and reads as
// "over-centered at the top". This probe reports the button's box against the card's box so the fix
// can be judged by numbers, and captures a shot so it can be judged by eye.
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9342;
const root = path.resolve(__dirname, "..");
const target = "file:///" + path.join(root, "play_game.html").replace(/\\/g, "/");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const getJSON = async (p) => (await fetch("http://127.0.0.1:" + PORT + p)).json();
// A throwaway profile: the game autosaves, so a reused one boots a previous synthetic character.
const PROFILE = path.join(os.tmpdir(), "cs-inv-rest");
const wipe = () => { try { fs.rmSync(PROFILE, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); } catch (e) {} };
wipe();

// A fighter, because a fighter is the class whose Rest badge ("Second Wind 1/2") is non-empty -- that
// badge is the widest thing on the row, so it is the worst case for the alignment bug.
const STATE = {
  intake_completed: "true", combat_engaged: "false",
  name: "Bram", character_level: "3", class_name: "Fighter",
  character_class: "fighter",
  hp_current: "18", hp_max: "21", armor_class: "18", prof_bonus: "2",
  strength: "16", dexterity: "12", constitution: "14",
  intelligence: "10", wisdom: "13", charisma: "8",
  str_mod_str: "+3", dex_mod_str: "+1", con_mod_str: "+2",
  int_mod_str: "+0", wis_mod_str: "+1", cha_mod_str: "-1",
  fighter_second_wind_uses: "1", fighter_second_wind_max: "2"
};

const EXPR = `(async () => {
  const apply = () => Object.assign(window.stats, ${JSON.stringify(STATE)});
  const timer = setInterval(apply, 100);
  for (let i = 0; i < 60; i++) {
    apply();
    await new Promise(r => setTimeout(r, 100));
    if (document.querySelector("#inventory")) break;
  }
  document.getElementById("inventoryButton").click();
  await new Promise(r => setTimeout(r, 600));
  const card = document.querySelector("#inventory .inv-item-pinned");
  if (!card) { clearInterval(timer); return { error: "no pinned Rest card" }; }
  const btn = card.querySelector(".inv-use");
  const name = card.querySelector(".inv-item-name");
  const box = (e) => { const r = e.getBoundingClientRect(); return { top: r.top, bottom: r.bottom, h: r.height }; };
  const c = box(card), b = box(btn), n = box(name);
  const row = card.querySelector(".inv-item-main");
  const desc = card.querySelector(".inv-item-desc");
  const rw = box(row), dw = box(desc);
  const panel = document.getElementById("inventory").getBoundingClientRect();
  // Slot-card metrics for the refresh: how many cards are empty, how many carry a real bonus, and
  // how tall the tallest is. These are the numbers the "quiet the empty state" change is judged on.
  const slots = Array.from(document.querySelectorAll("#inventory .inv-slot"));
  const slotInfo = slots.map(el => {
    const cs = getComputedStyle(el);
    const meta = el.querySelector(".inv-slot-meta:not(.inv-slot-nobonus)");
    return {
      label: (el.querySelector(".inv-slot-label") || {}).textContent || "",
      empty: el.className.indexOf("inv-slot-empty") !== -1,
      noBonus: !!el.querySelector(".inv-slot-nobonus"),
      hasRealBonus: !!meta,
      opacity: Math.round(parseFloat(cs.opacity) * 100) / 100,
      h: Math.round(el.getBoundingClientRect().height)
    };
  });
  const grid = document.querySelector("#inventory .inv-slots").getBoundingClientRect();
  clearInterval(timer);
  return {
    card: c, btn: b, name: n, row: rw, desc: dw,
    // Distance the button's top sits BELOW the card's top border. Positive = inside the card.
    insetTop: Math.round(b.top - c.top),
    // How far the button's vertical centre sits off the card's centre. Negative = rides high.
    btnVsCardCentre: Math.round((b.top + b.bottom) / 2 - (c.top + c.bottom) / 2),
    // Same, against the title row's centre -- this is what the eye actually compares.
    btnVsNameCentre: Math.round((b.top + b.bottom) / 2 - (n.top + n.bottom) / 2),
    rowH: Math.round(rw.h), btnH: Math.round(b.h), cardH: Math.round(c.h),
    slots: slotInfo,
    emptyCount: slotInfo.filter(s => s.empty).length,
    noBonusCount: slotInfo.filter(s => s.noBonus).length,
    buffedCount: slotInfo.filter(s => s.hasRealBonus).length,
    tallest: Math.max.apply(null, slotInfo.map(s => s.h)),
    // Whether the refresh's left accent edge has actually landed on the buffed cards.
    accentEdges: slots.filter(el => {
      const real = el.className.indexOf("inv-slot-buffed") !== -1;
      return real && getComputedStyle(el).borderLeftWidth === "0px";
    }).length,
    grid: { x: Math.round(grid.left), y: Math.round(grid.top), w: Math.round(grid.width), h: Math.round(grid.height) },
    panel: { x: Math.round(panel.left), y: Math.round(panel.top), w: Math.round(panel.width), h: Math.round(panel.height) }
  };
})()`;


(async () => {
  const chrome = spawn(CHROME, [
    "--headless=new", `--remote-debugging-port=${PORT}`, "--disable-gpu",
    "--no-first-run", "--no-default-browser-check",
    "--user-data-dir=" + PROFILE, "--force-device-scale-factor=2",
    "--window-size=1280,1100", target
  ], { stdio: "ignore" });
  let ws = null;
  try {
    let list = null;
    for (let i = 0; i < 40; i++) {
      await sleep(250);
      try {
        list = await getJSON("/json/list");
        if (list.some((t) => t.type === "page" && t.url.startsWith("file:"))) break;
      } catch (e) { /* chrome not up yet */ }
    }
    const page = list && list.find((t) => t.type === "page" && t.url.startsWith("file:"));
    if (!page) throw new Error("no page target appeared");
    ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
    let id = 0;
    const pending = new Map();
    ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
    const send = (method, params) => new Promise((res) => { const myId = ++id; pending.set(myId, res); ws.send(JSON.stringify({ id: myId, method, params })); });
    await sleep(1200);

    const r = await send("Runtime.evaluate", { expression: EXPR, awaitPromise: true, returnByValue: true });
    if (r.result.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails));
    const m = r.result.result.value;
    if (m.error) throw new Error(m.error);

    // A label so before/after pairs can be compared side by side: node probe_inv_rest.js before
    const TAG = process.argv[2] ? "-" + process.argv[2] : "";
    console.log("Rest card: " + m.cardH + " px tall; title row " + m.rowH + " px; button " + m.btnH + " px");
    console.log("  button top inset from card top : " + m.insetTop + " px   (negative = spills out of the card)");
    console.log("  button centre vs TITLE row     : " + m.btnVsNameCentre + " px   (<0 = rides high vs the text)");
    console.log("  button centre vs WHOLE card     : " + m.btnVsCardCentre + " px   (<0 = rides high vs the card)");
    console.log("");
    if (m.insetTop < 0) console.log("  -> BUG: the button spills out of the card by " + (-m.insetTop) + " px.");
    else console.log("  -> OK: the button is fully inside the card.");
    if (Math.abs(m.btnVsCardCentre) > 3) {
      console.log("  -> NOT centred on the card: sits " + m.btnVsCardCentre + " px off centre.");
    } else {
      console.log("  -> centred on the card.");
    }

    console.log("");
    console.log("Equipped grid: " + m.slots.length + " cards, tallest " + m.tallest + " px");
    console.log("  empty slots        : " + m.emptyCount + "   (opacity " +
      (m.slots.filter(function (s) { return s.empty; }).map(function (s) { return s.opacity; })[0] || "n/a") + ")");
    console.log("  'No bonuses' lines : " + m.noBonusCount);
    console.log("  cards with a bonus : " + m.buffedCount);
    console.log("  buffed cards still missing their accent edge: " + m.accentEdges);
    if (m.accentEdges) console.log("  -> BUG: the accent edge is not applying.");
    console.log("");
    m.slots.forEach(function (s) {
      console.log("   " + (s.label || "?").padEnd(16) +
        (s.empty ? "empty" : s.hasRealBonus ? "BONUS" : "plain").padEnd(7) +
        s.h + "px  opacity " + s.opacity);
    });

    const shot = await send("Page.captureScreenshot", {
      format: "png",
      clip: { x: m.panel.x, y: m.panel.y, width: m.panel.w, height: Math.min(m.panel.h, 760), scale: 2 }
    });
    fs.writeFileSync(path.join(__dirname, "inventory_rest" + TAG + ".png"), Buffer.from(shot.result.data, "base64"));
    console.log("\nwrote inventory_rest" + TAG + ".png");

    // A second shot cropped to just the equipped grid -- that is the part the refresh changes, and
    // cropping it keeps the before/after comparison about the cards rather than the whole panel.
    const gridShot = await send("Page.captureScreenshot", {
      format: "png",
      clip: { x: m.grid.x - 8, y: m.grid.y - 8, width: m.grid.w + 16, height: m.grid.h + 16, scale: 2 }
    });
    fs.writeFileSync(path.join(__dirname, "inventory_loadout" + TAG + ".png"), Buffer.from(gridShot.result.data, "base64"));
    console.log("wrote inventory_loadout" + TAG + ".png (" + m.grid.w + "x" + m.grid.h + " css px)");

    // The button was re-parented out of .inv-item-main to become a grid child, so prove the delegated
    // click still reaches it: click Rest… and confirm the panel dismisses and hands off to the dossier.
    const click = await send("Runtime.evaluate", {
      expression: `(async () => {
        document.querySelector("#inventory .inv-item-pinned .inv-use").click();
        await new Promise(r => setTimeout(r, 600));
        const panel = document.getElementById("inventory");
        const txt = (document.getElementById("text") || document.body).textContent || "";
        return { invVisible: !!panel && getComputedStyle(panel).display !== "none",
                 sample: txt.replace(/\\s+/g, " ").slice(0, 120) };
      })()`, awaitPromise: true, returnByValue: true
    });
    const c = click.result.result.value;
    console.log("click Rest… -> panel " + (c.invVisible ? "still visible" : "dismissed, handed off to the dossier"));
    console.log("            -> page text: " + c.sample);

    // The refresh is the first pass to add motion to this panel, so the OS "reduce motion" opt-out
    // has to be proven rather than assumed -- a stylesheet rule that silently fails to match is
    // invisible in a screenshot. Reopen the panel, emulate reduce, and read the computed values back.
    await send("Emulation.setEmulatedMedia", {
      features: [{ name: "prefers-reduced-motion", value: "reduce" }]
    });
    const rm = await send("Runtime.evaluate", {
      expression: `(() => {
        document.getElementById("inventoryButton").click();
        const slot = document.querySelector("#inventory .inv-slot");
        const btn = document.querySelector("#inventory .inv-item-pinned .inv-use");
        const cs = getComputedStyle(slot);
        return {
          slotTransition: cs.transitionDuration,
          slotTransform: cs.transform,
          btnTransition: getComputedStyle(btn).transitionDuration,
          // Colours must be untouched by the opt-out -- the panel should not look broken.
          emptyOpacity: getComputedStyle(document.querySelector("#inventory .inv-slot-empty")).opacity,
          buffedEdge: getComputedStyle(document.querySelector("#inventory .inv-slot-buffed")).borderLeftColor
        };
      })()`, returnByValue: true
    });
    const rmv = rm.result.result.value;
    const noMotion = rmv.slotTransition === "0s" && rmv.slotTransform === "none" && rmv.btnTransition === "0s";
    console.log("");
    console.log("reduced-motion opt-out:");
    console.log("  slot transition " + rmv.slotTransition + ", transform " + rmv.slotTransform + ", Rest button " + rmv.btnTransition);
    console.log("  empty opacity " + rmv.emptyOpacity + ", buffed edge " + rmv.buffedEdge + "  (both should be unchanged)");
    console.log("  -> " + (noMotion ? "PASS: motion suppressed" : "FAIL: something is still animating"));
    if (!noMotion) process.exitCode = 1;

    // Night mode repaints the whole palette, and a dashed 45%-opacity outline is exactly the sort of
    // thing that disappears against a dark background. Screenshot it and judge it by eye.
    const night = await send("Runtime.evaluate", {
      expression: `(() => { changeBackgroundColor("black");
        return { on: document.body.classList.contains("nightmode") }; })()`,
      returnByValue: true
    });
    if (!night.result.result.value.on) throw new Error("could not enter night mode");
    await sleep(300);
    const nshot = await send("Page.captureScreenshot", {
      format: "png",
      clip: { x: m.grid.x - 8, y: m.grid.y - 8, width: m.grid.w + 16, height: m.grid.h + 16, scale: 2 }
    });
    fs.writeFileSync(path.join(__dirname, "inventory_loadout-night.png"), Buffer.from(nshot.result.data, "base64"));
    console.log("  wrote inventory_loadout-night.png");
  } finally {
    if (ws) try { ws.close(); } catch (e) {}
    try { require("child_process").execSync("taskkill /PID " + chrome.pid + " /T /F", { stdio: "ignore" }); }
    catch (e) { try { chrome.kill(); } catch (e2) {} }
    wipe();
  }
})().catch((e) => { console.error("PROBE FAILED: " + e.message); process.exit(1); });

