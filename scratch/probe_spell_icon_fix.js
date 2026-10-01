// Live-browser check that the three previously-art-less spells now render a REAL <img> in the sidebar
// spellbook rather than an initials chip -- and that the browser actually DECODES each one (an <img> in
// the DOM is not proof the art is valid; a broken data URI still yields an img element).
//
// These three are alarm / detect_magic / jump -- all obtainable in play via dawn_trial.txt
// (wizard_spell / bard_spell / bard_spell_2). One character holding all three is synthetic but legal:
// it only exercises the sidebar's read-every-SPELL_SLOTS list, which is what we are testing.
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9341;
const root = path.resolve(__dirname, "..");
const target = "file:///" + path.join(root, "play_game.html").replace(/\\/g, "/");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Throwaway profile: the game autosaves to localStorage, so a reused profile would boot with a previous
// synthetic character instead of a clean one.
const PROFILE = path.join(os.tmpdir(), "cs-spell-icon-fix");
try { fs.rmSync(PROFILE, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); }
catch (e) { /* a previous Chrome may still hold it; harmless, it just gets reused */ }

const TARGET_SPELLS = ["alarm", "detect_magic", "jump"];

const WIZARD = {
  intake_completed: "true", combat_engaged: "false",
  name: "Verity", character_level: "3", class_name: "Wizard",
  character_class: "wizard", hp_current: "14", hp_max: "18",
  armor_class: "15", prof_bonus: "2",
  strength: "10", dexterity: "14", constitution: "12",
  intelligence: "16", wisdom: "10", charisma: "12",
  str_mod_str: "+0", dex_mod_str: "+2", con_mod_str: "+1",
  int_mod_str: "+3", wis_mod_str: "+0", cha_mod_str: "+1",
  // One per spell slot, so all three land under different slot names the sidebar reads.
  wizard_spell: "alarm",     wizard_spell_desc: "Alarm (Warded Ground, Alert)",
  bard_spell: "detect_magic", bard_spell_desc: "Detect Magic (Sense Enchantment)",
  bard_spell_2: "jump",      bard_spell_2_desc: "Jump (Long Stride)",
  wizard_spell_slots: "2"
};

const INSPECT = `(async () => {
  const blank = () => {
    Object.keys(window.stats).forEach(k => {
      if (/^((race|warlock|wizard|bard)_(cantrip|spell)(_[23])?)(_desc)?$/.test(k)) {
        window.stats[k] = /_desc$/.test(k) ? "" : "none";
      }
    });
  };
  const apply = () => { blank(); Object.assign(window.stats, ${JSON.stringify(WIZARD)}); };
  // Re-pin for the whole inspection: the game's own 400ms poll re-reads saved state and would clobber
  // anything set after the loop breaks.
  const applyTimer = setInterval(apply, 100);
  for (let i = 0; i < 60; i++) {
    apply();
    await new Promise(r => setTimeout(r, 100));
    if (document.querySelector("#statSidebar .spellbook")) break;
  }
  await new Promise(r => setTimeout(r, 300));

  const d0 = document.querySelector("#statSidebar .spellbook");
  if (d0 && !d0.hasAttribute("open")) { d0.querySelector("summary").click(); await new Promise(r => setTimeout(r, 250)); }

  // All three target spells are level 1, so switch to the L1 tab.
  const t1 = document.querySelector('#statSidebar [data-spell-tab="1"]');
  if (t1 && t1.getAttribute("aria-pressed") !== "true") { t1.click(); await new Promise(r => setTimeout(r, 300)); }

  const det = document.querySelector("#statSidebar .spellbook");
  if (!det) { clearInterval(applyTimer); return { error: "no .spellbook rendered" }; }

  // Per-row: real art or initials chip -- the distinction the whole fix is about.
  const rowArt = Array.from(det.querySelectorAll("[data-spell]")).map(r => {
    const img = r.querySelector("img"), chip = r.querySelector(".spellInitials");
    return { spell: r.getAttribute("data-spell"), kind: img ? "img" : (chip ? "chip" : "NONE"),
             label: r.textContent.trim().slice(0, 40) };
  });

  // Icons must DECODE, not merely exist in the DOM. naturalWidth > 0 is the real proof.
  const imgs = Array.from(det.querySelectorAll("img"));
  const decoded = await Promise.all(imgs.map(img =>
    (img.complete && img.naturalWidth > 0)
      ? true
      : new Promise(res => { img.onload = () => res(true); img.onerror = () => res(false); })
  ));

  const chipsLeft = det.querySelectorAll(".spellInitials").length;
  clearInterval(applyTimer);
  await new Promise(r => setTimeout(r, 400));
  return {
    rows: rowArt,
    imgsTotal: imgs.length,
    imgsDecoded: decoded.filter(Boolean).length,
    chipsLeft: chipsLeft,
    tabPressed: Array.from(det.querySelectorAll("[data-spell-tab]"))
      .filter(t => t.getAttribute("aria-pressed") === "true").map(t => t.getAttribute("data-spell-tab"))
  };
})()`;
(async () => {
  if (!fs.existsSync(CHROME)) {
    console.error("Chrome not found at " + CHROME + " -- cannot run live check");
    process.exit(2);
  }
  const chrome = spawn(CHROME, [
    "--headless=new", `--remote-debugging-port=${PORT}`, "--disable-gpu",
    "--no-first-run", "--no-default-browser-check",
    "--user-data-dir=" + PROFILE, target
  ], { stdio: "ignore" });

  let ws = null, failures = 0;
  try {
    let list = null;
    for (let i = 0; i < 40; i++) {
      await sleep(250);
      try {
        list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
        if (list.some((t) => t.type === "page" && t.url.startsWith("file:"))) break;
      } catch (e) { /* chrome not up yet */ }
    }
    const page = list && list.find((t) => t.type === "page" && t.url.startsWith("file:"));
    if (!page) throw new Error("no page target");
    ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
    let id = 0; const pending = new Map();
    ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
    const send = (method, params) => new Promise((res) => { const myId = ++id; pending.set(myId, res); ws.send(JSON.stringify({ id: myId, method, params })); });

    for (let i = 0; i < 30; i++) {
      const r = await send("Runtime.evaluate", { expression: "!!document.querySelector('#statSidebar')", returnByValue: true });
      if (r.result && r.result.result && r.result.result.value) break;
      await sleep(250);
    }

    const r = await send("Runtime.evaluate", { expression: INSPECT, awaitPromise: true, returnByValue: true });
    if (r.result && r.result.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails));
    const out = r.result.result.value;

    if (out.error) { console.error("  FAIL " + out.error); failures++; }
    else {
      console.log("L1 tab active: " + JSON.stringify(out.tabPressed));
      console.log("rows rendered: " + out.rows.length);
      console.log("\n  spell          kind   label");
      for (const row of out.rows) console.log("  " + row.spell.padEnd(14) + row.kind.padEnd(6) + row.label);

      console.log("\nimgs: " + out.imgsTotal + " total, " + out.imgsDecoded + " decoded by the browser");
      console.log("initials chips remaining: " + out.chipsLeft);

      for (const sp of TARGET_SPELLS) {
        const row = out.rows.find((x) => x.spell === sp);
        if (!row) { console.log("  FAIL " + sp + ": no row rendered"); failures++; }
        else if (row.kind !== "img") { console.log("  FAIL " + sp + ": rendered as " + row.kind + ", expected img"); failures++; }
        else console.log("  ok   " + sp + ": real <img>");
      }
      if (out.imgsDecoded !== out.imgsTotal) { console.log("  FAIL some images failed to decode"); failures++; }
      if (out.chipsLeft !== 0) { console.log("  FAIL initials chip still present"); failures++; }
    }
  } catch (e) {
    console.error("  ERROR " + e.message);
    failures++;
  } finally {
    try { if (ws) ws.close(); } catch (e) { /* ignore */ }
    chrome.kill();
  }

  console.log(failures ? "\nFAILED (" + failures + ")" : "\nLIVE BROWSER CHECK PASSED");
  process.exit(failures ? 1 : 0);
})();