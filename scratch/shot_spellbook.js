// Screenshots the sidebar's spellbook section, open and with a spell pinned, so the visual result can
// be checked without a human clicking by hand. Same headless-Chrome-over-CDP approach as the other
// probes. Two shots: the collapsed default, then opened on the cantrip tab with Blade Ward pinned.
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9338;
const root = path.resolve(__dirname, "..");
const target = "file:///" + path.join(root, "play_game.html").replace(/\\/g, "/");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const getJSON = async (p) => (await fetch(`http://127.0.0.1:${PORT}${p}`)).json();
// A throwaway profile, wiped on entry and exit -- the game autosaves to localStorage, so a reused
// profile would boot a previous synthetic character rather than a clean one.
const PROFILE = path.join(os.tmpdir(), "cs-spellbook-shot");
try { fs.rmSync(PROFILE, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); }
catch (e) { /* a previous run's Chrome may still hold it; harmless, it just gets reused */ }

// A warlock mid-fight. Chosen over the wizard because warlocks are the character whose spell set
// actually changed: chill_touch and prestidigitation gained real art in this pass, so this shot is
// what proves those new icons render rather than falling back to initials chips.
const STATE = {
  intake_completed: "true", combat_engaged: "true",
  name: "Thessaly", character_level: "3", class_name: "Warlock",
  character_class: "warlock",
  hp_current: "16", hp_max: "19", armor_class: "15", prof_bonus: "2",
  strength: "10", dexterity: "16", constitution: "14",
  intelligence: "12", wisdom: "11", charisma: "17",
  str_mod_str: "+0", dex_mod_str: "+3", con_mod_str: "+2",
  int_mod_str: "+1", wis_mod_str: "+0", cha_mod_str: "+3",
  // Race cantrips (a Hexblood-style innate) plus the class picks, so one character exercises the
  // merged cantrip list the sidebar builds from all thirteen spell slots at once.
  race_cantrip: "prestidigitation", race_cantrip_desc: "Prestidigitation (Minor Trick)",
  race_cantrip_2: "unseen_servant", race_cantrip_2_desc: "Unseen Servant (Invisible Helper)",
  warlock_cantrip: "eldritch_blast", warlock_cantrip_desc: "Eldritch Blast (1d10 Force, 3 Beams)",
  warlock_cantrip_2: "chill_touch", warlock_cantrip_2_desc: "Chill Touch (1d8 Cold, Weakens)",
  warlock_spell: "hex", warlock_spell_desc: "Hex (1d6 per hit, Hex Bonus)",
  warlock_spell_slots: "2",
  combat_turn_count: 3,
  combat_turn_kind_1: "player", combat_turn_slot_1: 0,
  combat_turn_kind_2: "enemy",  combat_turn_slot_2: 1,
  combat_turn_kind_3: "enemy",  combat_turn_slot_3: 2,
  combat_enemy1_name: "Silt-Lurker", combat_enemy1_hp: "11", combat_enemy1_max_hp: "12",
  combat_enemy1_ac: "12", combat_enemy1_atk_bonus: "4",
  combat_enemy1_dmg_dice_sides: "6", combat_enemy1_dmg_bonus: "2",
  combat_enemy1_strength: "13", combat_enemy1_dexterity: "14",
  combat_enemy1_constitution: "14", combat_enemy1_intelligence: "8",
  combat_enemy1_wisdom: "9", combat_enemy1_charisma: "7",
  combat_enemy2_name: "Carrion Beetle", combat_enemy2_hp: "6", combat_enemy2_max_hp: "9",
  combat_enemy2_ac: "13", combat_enemy2_atk_bonus: "2",
  combat_enemy2_dmg_dice_sides: "6", combat_enemy2_dmg_bonus: "0",
  combat_enemy2_strength: "12", combat_enemy2_dexterity: "12",
  combat_enemy2_constitution: "12", combat_enemy2_intelligence: "4",
  combat_enemy2_wisdom: "10", combat_enemy2_charisma: "6"
};

// A STRING sent to the page, not code Node runs itself -- hence the backticks around the whole IIFE.
// `mode` is "collapsed" | "cantrip" | "l1": the default closed state, the cantrip tab with a spell
// pinned, and the L1 tab. The cantrip shot is the one that matters -- it shows the merged race+class
// cantrip list, including prestidigitation and chill_touch, whose art only landed in this pass.
const SHOT = (mode) => `(async () => {
  const apply = () => Object.assign(window.stats, ${JSON.stringify(STATE)});
  const WANT = ${JSON.stringify(mode)};
  // Pin the synthetic character for the whole shot: the game's 400ms poll re-reads its own state and
  // would otherwise blank the spells again between the click and the capture.
  const applyTimer = setInterval(apply, 100);
  for (let i = 0; i < 60; i++) {
    apply();
    await new Promise(r => setTimeout(r, 100));
    if (document.querySelector("#statSidebar .spellbook")) break;
  }
  const det = document.querySelector("#statSidebar .spellbook");
  if (WANT !== "collapsed") {
    if (!det.open) det.querySelector("summary").click();
    await new Promise(r => setTimeout(r, 400));
    if (WANT === "l1") {
      document.querySelector('#statSidebar [data-spell-tab="1"]').click();
      await new Promise(r => setTimeout(r, 400));
    }
    const pick = WANT === "l1" ? "hex" : "chill_touch";
    const row = document.querySelector('#statSidebar [data-spell="' + pick + '"]');
    if (row && row.getAttribute("aria-pressed") !== "true") row.click();
    await new Promise(r => setTimeout(r, 400));
  } else {
    await new Promise(r => setTimeout(r, 500));
  }
  // Let the icons decode so they are not captured mid-load.
  await Promise.all(Array.from(document.querySelectorAll("#statSidebar .spellbook img")).map(i =>
    i.complete ? true : new Promise(r => { i.onload = r; i.onerror = r; })));
  await new Promise(r => setTimeout(r, 250));
  clearInterval(applyTimer);
  const sb = document.getElementById("statSidebar").getBoundingClientRect();
  return { x: sb.left - 14, y: sb.top - 14, w: sb.width + 28, h: sb.height + 28,
           open: document.querySelector("#statSidebar .spellbook").hasAttribute("open") };
})()`;

(async () => {
  const chrome = spawn(CHROME, [
    "--headless=new", `--remote-debugging-port=${PORT}`, "--disable-gpu",
    "--no-first-run", "--no-default-browser-check",
    "--user-data-dir=" + PROFILE,
    "--force-device-scale-factor=2", "--window-size=1280,1100", target
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
    ws.onmessage = (ev) => {
      const m = JSON.parse(ev.data);
      if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
    };
    const send = (method, params) => new Promise((res) => {
      const myId = ++id;
      pending.set(myId, res);
      ws.send(JSON.stringify({ id: myId, method, params }));
    });

    await sleep(1200);
    const NAMES = { collapsed: "spellbook_collapsed.png", cantrip: "spellbook_open.png", l1: "spellbook_l1.png" };
    for (const mode of ["collapsed", "cantrip", "l1"]) {
      const name = NAMES[mode];
      const r = await send("Runtime.evaluate", {
        expression: SHOT(mode), awaitPromise: true, returnByValue: true
      });
      if (r.result.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails));
      const clip = r.result.result.value;
      console.log("  " + name + ": <details> open = " + clip.open +
                  "  (" + Math.round(clip.w) + "x" + Math.round(clip.h) + " css px)");
      const shot = await send("Page.captureScreenshot", {
        format: "png", clip: { x: clip.x, y: clip.y, width: clip.w, height: clip.h, scale: 2 }
      });
      fs.writeFileSync(path.join(__dirname, name), Buffer.from(shot.result.data, "base64"));
    }
    console.log("wrote " + Object.values(NAMES).join(", "));
  } finally {
    if (ws) try { ws.close(); } catch (e) {}
    // chrome.kill() only signals the launcher, leaving renderer/GPU children behind; they accumulate
    // and then make the next probe attach to a half-dead browser. See probe_spellbook.js.
    try { require("child_process").execSync(`taskkill /PID ${chrome.pid} /T /F`, { stdio: "ignore" }); }
    catch (e) { try { chrome.kill(); } catch (e2) {} }
    // Best effort: Chrome may still be releasing its index files as taskkill returns.
    try { fs.rmSync(PROFILE, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); }
    catch (e) { /* best effort */ }
  }
})().catch((e) => { console.error("SHOT FAILED: " + e.message); process.exit(1); });
