// Measures the stat sidebar's header in a real browser: how far the COMBAT badge
// actually sits from the class name, and whether the label is centered inside its
// own box, for a short name and a long two-word-class name.
//
// Headless Chrome over the DevTools protocol, no dependencies (Node's global
// WebSocket is enough) -- the same approach quest/GAMEPLAY_MECHANICS_RULES.md
// describes for the trade/inventory panels, since quicktest and randomtest never
// load the web UI at all.
//
// Written to a file (not node -e) because PowerShell mangles quotes in inline
// scripts, which produced false results before.
const { spawn } = require("child_process");
const path = require("path");
const os = require("os");

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9333;
const root = path.resolve(__dirname, "..");
const target = "file:///" + path.join(root, "play_game.html").replace(/\\/g, "/");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJSON(pathname) {
  const res = await fetch(`http://127.0.0.1:${PORT}${pathname}`);
  return res.json();
}

// Pulls the geometry out of the live sidebar. Ranges are used rather than
// getBoundingClientRect on the elements themselves: the element box includes the
// flex slack and the padding, and what the eye actually judges is the gap between
// the last glyph of the name and the badge's border, and how the badge's own text
// sits inside its border.
const MEASURE = (label, name, level, className) => `(async () => {
  const s = window.stats;
  Object.assign(s, {
    intake_completed: "true",
    combat_engaged: "true",
    combat_turn_count: 0,
    name: ${JSON.stringify(name)},
    character_level: ${JSON.stringify(level)},
    class_name: ${JSON.stringify(className)},
    hp_current: "17", hp_max: "23", armor_class: "17", prof_bonus: "3",
    strength: "14", dexterity: "12", constitution: "15",
    intelligence: "10", wisdom: "13", charisma: "8",
    str_mod_str: "+2", dex_mod_str: "+1", con_mod_str: "+2",
    int_mod_str: "+0", wis_mod_str: "+1", cha_mod_str: "-1"
  });
  const apply = () => Object.assign(window.stats, {
    intake_completed: "true",
    combat_engaged: "true",
    combat_turn_count: 0,
    name: ${JSON.stringify(name)},
    character_level: ${JSON.stringify(level)},
    class_name: ${JSON.stringify(className)},
    hp_current: "17", hp_max: "23", armor_class: "17", prof_bonus: "3",
    strength: "14", dexterity: "12", constitution: "15",
    intelligence: "10", wisdom: "13", charisma: "8",
    str_mod_str: "+2", dex_mod_str: "+1", con_mod_str: "+2",
    int_mod_str: "+0", wis_mod_str: "+1", cha_mod_str: "-1"
  });
  // Poll for a *visible* badge instead of trusting a fixed delay. The scene engine
  // re-initialises window.stats on its first render, which wipes an earlier
  // assign, so re-apply every round and require a non-zero offsetWidth (0 when the
  // sidebar is display:none) before measuring.
  let badge = null, h3 = null, nameSpan = null;
  for (let i = 0; i < 60; i++) {
    apply();
    await new Promise(r => setTimeout(r, 100));
    h3 = document.querySelector("#statSidebar h3");
    badge = h3 && h3.querySelector(".combatBadge");
    // Also require the *requested* name to have reached the DOM: renderStatSidebar
    // only re-renders every 400ms, so a visible badge from the previous case would
    // otherwise satisfy this loop on its first 100ms poll and we'd measure stale text.
    if (badge && badge.offsetWidth > 0 && getComputedStyle(h3).display === "flex" &&
        h3.children[0].textContent.indexOf(${JSON.stringify(name)}) === 0) break;
  }
  if (!h3) return { label: ${JSON.stringify(label)}, error: "no h3" };
  if (!badge) return { label: ${JSON.stringify(label)}, error: "no .combatBadge (not in combat?)" };
  nameSpan = h3.children[0];
  if (badge.offsetWidth === 0) return { label: ${JSON.stringify(label)}, error: "sidebar still hidden (stats re-initialised?)" };
  const cs = (el) => getComputedStyle(el);
  const nameCs = cs(nameSpan), badgeCs = cs(badge), h3Cs = cs(h3);
  const rects = (el) => Array.from(el.getClientRects()).map(r => ({
    left: +r.left.toFixed(1), right: +r.right.toFixed(1), w: +r.width.toFixed(1)
  }));
  // Per-line rects of the *text*, not the element: a block-level flex item reports a
  // single border box from getClientRects(), so only a Range shows whether the name
  // wrapped and how tall the header grew.
  const nameLines = (() => {
    const r = document.createRange();
    r.selectNodeContents(nameSpan);
    return Array.from(r.getClientRects()).map(x => ({
      left: +x.left.toFixed(1), right: +x.right.toFixed(1), w: +x.width.toFixed(1)
    }));
  })();
  const badgeTextRect = (() => {
    const r = document.createRange();
    r.selectNodeContents(badge);
    return r.getBoundingClientRect();
  })();
  const bb = badge.getBoundingClientRect();
  const sidebarInner = document.getElementById("statSidebar").clientWidth - 26;
  return {
    label: ${JSON.stringify(label)},
    nameText: nameSpan.textContent,
    h3_display: h3Cs.display,
    h3_gap: h3Cs.gap,
    h3_flexWrap: h3Cs.flexWrap,
    h3_heightPx: h3.offsetHeight,
    name_flex: nameCs.flex,
    name_minWidth: nameCs.minWidth,
    nameTextLines: nameLines.length,
    nameLineWidths: nameLines.map(l => l.w),
    badge_flex: badgeCs.flex,
    badge_textAlign: badgeCs.textAlign,
    // The three numbers the complaint is really about.
    gapNameTextToBadge: +(bb.left - Math.max(...nameLines.map(l => l.right))).toFixed(1),
    badgePadLeftInside: +(badgeTextRect.left - bb.left).toFixed(1),
    badgePadRightInside: +(bb.right - badgeTextRect.right).toFixed(1),
    badgeBoxWidth: +bb.width.toFixed(1),
    sidebarInnerWidth: sidebarInner,
    rowWidthVsPanel: +(h3.offsetWidth - sidebarInner).toFixed(1),
    overflowsPanel: h3.offsetWidth > sidebarInner,
    matchingRules: (() => {
      const out = [];
      for (const sheet of document.styleSheets) {
        let rules;
        try { rules = sheet.cssRules; } catch (e) { continue; }
        for (const rule of rules) {
          if (!rule.selectorText) continue;
          try {
            if (h3.matches(rule.selectorText)) {
              out.push({ sel: rule.selectorText, css: rule.style.cssText.slice(0, 120) });
            }
          } catch (e) { /* unsupported selector */ }
        }
      }
      return out;
    })()
  };
})()`;


(async () => {
  const chrome = spawn(CHROME, [
    "--headless=new",
    `--remote-debugging-port=${PORT}`,
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    "--user-data-dir=" + path.join(os.tmpdir(), "cs-sidebar-probe"),
    "--window-size=1280,900",
    target
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
    if (!page) throw new Error("no page target appeared; is play_game.html reachable?");

    ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

    let id = 0;
    const pending = new Map();
    ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
    };
    const send = (method, params) => new Promise((res) => {
      const myId = ++id;
      pending.set(myId, res);
      ws.send(JSON.stringify({ id: myId, method, params }));
    });

    const evaluate = async (expression) => {
      const r = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
      if (r.result && r.result.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails));
      return r.result.result.value;
    };

    const ready = await evaluate(`new Promise(r => {
      if (window.stats) return r(true);
      const t = setInterval(() => { if (window.stats) { clearInterval(t); r(true); } }, 50);
      setTimeout(() => { clearInterval(t); r(false); }, 8000);
    })`);
    if (!ready) throw new Error("window.stats never appeared on the page");

    const cases = [
      ["short name", "Corin", "3", "Fighter"],
      ["long name + two-word class", "Wolfgang the Third", "12", "Battle-Mage"]
    ];
    for (const [label, name, level, cls] of cases) {
      const out = await evaluate(MEASURE(label, name, level, cls));
      console.log("\n=== " + label + " ===");
      console.log(JSON.stringify(out, null, 2));
    }
  } finally {
    if (ws) try { ws.close(); } catch (e) {}
    chrome.kill();
  }
})().catch((e) => { console.error("PROBE FAILED: " + e.message); process.exit(1); });
