// Screenshots the combatant stat card as it actually renders, so the visual result can be checked
// without a human hovering by hand. Same headless-Chrome-over-CDP approach as the other probes.
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9336;
const root = path.resolve(__dirname, "..");
const target = "file:///" + path.join(root, "play_game.html").replace(/\\/g, "/");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const getJSON = async (p) => (await fetch(`http://127.0.0.1:${PORT}${p}`)).json();

// A four-enemy fight so the sidebar and the card are both visible in one shot.
const STATE = {
  intake_completed: "true", combat_engaged: "true",
  name: "Corin", character_level: "3", class_name: "Fighter",
  hp_current: "7", hp_max: "7", armor_class: "12", prof_bonus: "3",
  strength: "14", dexterity: "12", constitution: "15",
  intelligence: "10", wisdom: "13", charisma: "8",
  str_mod_str: "+2", dex_mod_str: "+1", con_mod_str: "+2",
  int_mod_str: "+0", wis_mod_str: "+1", cha_mod_str: "-1",
  combat_turn_count: 5,
  combat_turn_kind_1: "player", combat_turn_slot_1: 0,
  combat_turn_kind_2: "enemy",  combat_turn_slot_2: 1,
  combat_turn_kind_3: "enemy",  combat_turn_slot_3: 2,
  combat_turn_kind_4: "enemy",  combat_turn_slot_4: 3,
  combat_turn_kind_5: "enemy",  combat_turn_slot_5: 4,
  combat_enemy1_name: "Silt-Lurker Lacedon",
  combat_enemy1_hp: "11", combat_enemy1_max_hp: "12",
  combat_enemy1_ac: "12", combat_enemy1_atk_bonus: "4",
  combat_enemy1_dmg_dice_sides: "6", combat_enemy1_dmg_bonus: "2",
  combat_enemy1_strength: "13", combat_enemy1_dexterity: "14",
  combat_enemy1_constitution: "14", combat_enemy1_intelligence: "8",
  combat_enemy1_wisdom: "9", combat_enemy1_charisma: "7",
  combat_enemy2_name: "Carrion Beetle",
  combat_enemy2_hp: "6", combat_enemy2_max_hp: "9",
  combat_enemy2_ac: "13", combat_enemy2_atk_bonus: "2",
  combat_enemy2_dmg_dice_sides: "6", combat_enemy2_dmg_bonus: "0",
  combat_enemy2_strength: "16", combat_enemy2_dexterity: "12",
  combat_enemy2_constitution: "15", combat_enemy2_intelligence: "2",
  combat_enemy2_wisdom: "7", combat_enemy2_charisma: "3",
  combat_enemy3_name: "Marsh Harrier",
  combat_enemy3_hp: "14", combat_enemy3_max_hp: "14",
  combat_enemy3_ac: "14", combat_enemy3_atk_bonus: "5",
  combat_enemy3_dmg_dice_sides: "8", combat_enemy3_dmg_bonus: "3",
  combat_enemy3_strength: "18", combat_enemy3_dexterity: "16",
  combat_enemy3_constitution: "14", combat_enemy3_intelligence: "10",
  combat_enemy3_wisdom: "14", combat_enemy3_charisma: "12",
  combat_enemy4_name: "Fenwalker",
  combat_enemy4_hp: "0", combat_enemy4_max_hp: "21",
  combat_enemy4_ac: "12", combat_enemy4_atk_bonus: "3",
  combat_enemy4_dmg_dice_sides: "10", combat_enemy4_dmg_bonus: "2",
  combat_enemy4_strength: "12", combat_enemy4_dexterity: "12",
  combat_enemy4_constitution: "16", combat_enemy4_intelligence: "6",
  combat_enemy4_wisdom: "13", combat_enemy4_charisma: "5"
};

// A STRING sent to the page, not code Node runs itself -- hence the backticks around the whole IIFE.
const HOVER = `(async () => {
  const apply = () => Object.assign(window.stats, ${JSON.stringify(STATE)});
  let rows = [];
  for (let i = 0; i < 60; i++) {
    apply();
    await new Promise(r => setTimeout(r, 100));
    rows = Array.from(document.querySelectorAll("#statSidebar .turnRow"));
    if (rows.length === 5 && rows.filter(r => r.getAttribute("data-combatant")).length === 4) break;
  }
  const row = Array.from(document.querySelectorAll("#statSidebar .turnRow"))
    .find(r => r.getAttribute("data-combatant") === "enemy:1");
  const b = row.getBoundingClientRect();
  row.dispatchEvent(new MouseEvent("mouseover", {
    bubbles: true, clientX: Math.round(b.left + b.width / 2),
    clientY: Math.round(b.top + b.height / 2), view: window
  }));
  await new Promise(r => setTimeout(r, 400));
  const tip = document.getElementById("csTip").getBoundingClientRect();
  const sb = document.getElementById("statSidebar").getBoundingClientRect();
  return { x: Math.min(tip.left, sb.left) - 14, y: Math.min(tip.top, sb.top) - 14,
           w: Math.max(tip.right, sb.right) - Math.min(tip.left, sb.left) + 28,
           h: Math.max(tip.bottom, sb.bottom) - Math.min(tip.top, sb.top) + 28 };
})()`;

(async () => {
  const chrome = spawn(CHROME, [
    "--headless=new", `--remote-debugging-port=${PORT}`, "--disable-gpu",
    "--no-first-run", "--no-default-browser-check",
    "--user-data-dir=" + path.join(os.tmpdir(), "cs-tip-shot"),
    "--force-device-scale-factor=2", "--window-size=1280,900", target
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
    const r = await send("Runtime.evaluate", { expression: HOVER, awaitPromise: true, returnByValue: true });
    if (r.result.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails));
    const clip = r.result.result.value;
    const shot = await send("Page.captureScreenshot", {
      format: "png", clip: { x: clip.x, y: clip.y, width: clip.w, height: clip.h, scale: 2 }
    });
    const outFile = path.join(__dirname, "stat_card.png");
    fs.writeFileSync(outFile, Buffer.from(shot.result.data, "base64"));
    console.log("wrote " + outFile);
  } finally {
    if (ws) try { ws.close(); } catch (e) {}
    chrome.kill();
  }
})().catch((e) => { console.error("SHOT FAILED: " + e.message); process.exit(1); });

