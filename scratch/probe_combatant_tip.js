// Checks the combat turn-order tooltip (combatantTip in web/mygame/index.html) against the stats the
// game actually holds: that every row shape carries a title, that the six ability scores and the
// AC/Atk/damage values are transcribed exactly, and that the derived modifiers agree with the
// score_to_mod thresholds in startup.txt at every boundary.
//
// Headless Chrome over the DevTools protocol, no dependencies (Node's global WebSocket is enough) --
// the approach quest/GAMEPLAY_MECHANICS_RULES.md documents for the trade/inventory panels, since
// quicktest and randomtest never load the web UI at all.
//
// Written to a file (not node -e) because PowerShell mangles quotes in inline scripts.
const { spawn } = require("child_process");
const path = require("path");
const os = require("os");

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9334;
const root = path.resolve(__dirname, "..");
const target = "file:///" + path.join(root, "play_game.html").replace(/\\/g, "/");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const getJSON = async (p) => (await fetch(`http://127.0.0.1:${PORT}${p}`)).json();

// One fight: player, a living enemy, a downed enemy, and an ally. Ally 1 has only a DEX (startup.txt:1679),
// and slot 0's defaults are untouched, so both no-ability cases are covered.
const FIGHT = {
  intake_completed: "true", combat_engaged: "true",
  name: "Corin", character_level: "3", class_name: "Fighter",
  hp_current: "7", hp_max: "7", armor_class: "12", prof_bonus: "3",
  strength: "14", dexterity: "12", constitution: "15",
  intelligence: "10", wisdom: "13", charisma: "8",
  str_mod_str: "+2", dex_mod_str: "+1", con_mod_str: "+2",
  int_mod_str: "+0", wis_mod_str: "+1", cha_mod_str: "-1",
  combat_turn_count: 4,
  combat_turn_kind_1: "player", combat_turn_slot_1: 0,
  combat_turn_kind_2: "enemy",  combat_turn_slot_2: 1,
  combat_turn_kind_3: "enemy",  combat_turn_slot_3: 2,
  combat_turn_kind_4: "ally",   combat_turn_slot_4: 1,
  // Living enemy: distinctive scores so a transcription slip cannot hide.
  combat_enemy1_name: "Silt-Lurker Lacedon",
  combat_enemy1_hp: "11", combat_enemy1_max_hp: "12",
  combat_enemy1_ac: "12", combat_enemy1_atk_bonus: "4",
  combat_enemy1_dmg_dice_sides: "6", combat_enemy1_dmg_bonus: "2",
  combat_enemy1_strength: "15", combat_enemy1_dexterity: "14",
  combat_enemy1_constitution: "16", combat_enemy1_intelligence: "8",
  combat_enemy1_wisdom: "11", combat_enemy1_charisma: "10",
  // Downed enemy, same shape.
  combat_enemy2_name: "Mire-Rat",
  combat_enemy2_hp: "0", combat_enemy2_max_hp: "7",
  combat_enemy2_ac: "11", combat_enemy2_atk_bonus: "2",
  combat_enemy2_dmg_dice_sides: "4", combat_enemy2_dmg_bonus: "0",
  combat_enemy2_strength: "8", combat_enemy2_dexterity: "16",
  combat_enemy2_constitution: "9", combat_enemy2_intelligence: "3",
  combat_enemy2_wisdom: "12", combat_enemy2_charisma: "6",
  // Ally: only dexterity exists.
  combat_ally1_name: "Lyra",
  combat_ally1_hp: "20", combat_ally1_max_hp: "24",
  combat_ally1_ac: "14", combat_ally1_atk_bonus: "5",
  combat_ally1_dmg_dice_sides: "8", combat_ally1_dmg_bonus: "3",
  combat_ally1_dexterity: "17"
};

// Independent re-implementation of the score_to_mod table, read straight off startup.txt:3250-3287,
// used to cross-check the sidebar's copy across every threshold boundary.
const EXPECTED_MODS = { 0: -5, 1: -5, 2: -4, 3: -4, 4: -3, 5: -3, 6: -2, 7: -2, 8: -1, 9: -1, 10: 0, 11: 0,
  12: 1, 13: 1, 14: 2, 15: 2, 16: 3, 17: 3, 18: 4, 19: 4, 20: 5, 21: 5, 22: 6, 23: 6, 24: 7, 25: 7,
  26: 8, 27: 8, 28: 9, 29: 9, 30: 10, 31: 10, 32: 10 };

// A second, wider fight used only by the modifier sweep: the player plus all SIX enemy slots, so one
// render pass can carry six different scores at once. FIGHT above has only two enemy positions, which
// is why the sweep needs its own turn order.
const SWEEP = { intake_completed: "true", combat_engaged: "true",
  name: "Corin", character_level: "3", class_name: "Fighter",
  hp_current: "7", hp_max: "7", armor_class: "12", prof_bonus: "3",
  strength: "14", dexterity: "12", constitution: "15",
  intelligence: "10", wisdom: "13", charisma: "8",
  str_mod_str: "+2", dex_mod_str: "+1", con_mod_str: "+2",
  int_mod_str: "+0", wis_mod_str: "+1", cha_mod_str: "-1",
  combat_turn_count: 7 };
for (let k = 1; k <= 7; k++) {
  SWEEP["combat_turn_kind_" + k] = k === 1 ? "player" : "enemy";
  SWEEP["combat_turn_slot_" + k] = k === 1 ? 0 : k - 1;
}

// Drives the real hover path: synthesises a mouseover on a row, then reads the styled card (#csTip)
// that appears, so this checks the actual UI rather than an attribute string.
const HOVER = `(async () => {
  const apply = () => Object.assign(window.stats, ${JSON.stringify(FIGHT)});
  let rows = [];
  for (let i = 0; i < 60; i++) {
    apply();
    await new Promise(r => setTimeout(r, 100));
    rows = Array.from(document.querySelectorAll("#statSidebar .turnRow"));
    if (rows.length === 4 && rows.filter(r => r.getAttribute("data-combatant")).length === 3) break;
  }
  const living = rows.find(r => r.tagName === "BUTTON");
  const box = living.getBoundingClientRect();
  const cx = Math.round(box.left + box.width / 2), cy = Math.round(box.top + box.height / 2);
  const fire = (type, x, y) => living.dispatchEvent(new MouseEvent(type, {
    bubbles: true, clientX: x, clientY: y, view: window
  }));
  fire("mouseover", cx, cy);
  await new Promise(r => setTimeout(r, 120));
  const tip = document.getElementById("csTip");
  const cs = tip ? getComputedStyle(tip) : null;
  const grid = tip ? tip.querySelector(".tGrid") : null;
  const cells = grid ? Array.from(grid.children) : [];
  const gcs = grid ? getComputedStyle(grid) : null;
  const out = {
    rowCount: rows.length,
    rows: rows.map(r => ({
      tag: r.tagName,
      combatant: r.getAttribute("data-combatant"),
      dead: r.className.indexOf("turnRowDead") !== -1,
      self: r.className.indexOf("turnRowSelf") !== -1,
      cursor: getComputedStyle(r).cursor
    })),
    tipExists: !!tip,
    tipOn: tip ? tip.className.indexOf("on") !== -1 : false,
    tipText: tip ? tip.innerText.replace(/\\n/g, " | ") : null,
    tipBg: cs ? cs.backgroundColor : null,
    tipBorder: cs ? cs.borderTopColor + " " + cs.borderTopWidth + " / radius " + cs.borderTopLeftRadius : null,
    tipPointerEvents: cs ? cs.pointerEvents : null,
    tipParent: tip ? tip.parentElement.tagName + "#" + tip.parentElement.id : null,
    tipPos: cs ? cs.position + " z=" + cs.zIndex : null,
    gridDisplay: gcs ? gcs.display : null,
    gridCols: gcs ? gcs.gridTemplateColumns : null,
    gridCellCount: cells.length,
    gridCellTops: cells.map(c => Math.round(c.getBoundingClientRect().top)),
    gridCellLefts: cells.map(c => Math.round(c.getBoundingClientRect().left)),
    modClasses: cells.map(c => { const i = c.querySelector("i"); return i ? i.className : null; }),
    // Every ability cell must be one of three rows x two columns.
    layoutIs3x2: cells.length === 6 &&
      new Set(cells.map(c => Math.round(c.getBoundingClientRect().top))).size === 3 &&
      new Set(cells.map(c => Math.round(c.getBoundingClientRect().left))).size === 2
  };
  // Now move the pointer off the panel and confirm the card goes away.
  fire("mouseover", cx, cy);
  document.getElementById("statSidebar").dispatchEvent(new MouseEvent("mouseleave", { bubbles: false }));
  await new Promise(r => setTimeout(r, 60));
  out.tipOnAfterLeave = tip ? tip.className.indexOf("on") !== -1 : null;
  return out;
})()`;


(async () => {
  const chrome = spawn(CHROME, [
    "--headless=new", `--remote-debugging-port=${PORT}`, "--disable-gpu",
    "--no-first-run", "--no-default-browser-check",
    "--user-data-dir=" + path.join(os.tmpdir(), "cs-tip-probe"),
    "--window-size=1280,900", target
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

    const out = await evaluate(HOVER);
    console.log(JSON.stringify(out, null, 2));

    // ── assertions ──
    let fail = 0;
    const ok = (cond, msg) => { console.log((cond ? "  PASS  " : "  FAIL  ") + msg); if (!cond) fail++; };
    // innerText collapses the gaps between the label/score/mod <b>/<s>/<i>, because that spacing is
    // CSS margin rather than text -- so compare with whitespace stripped out.
    const T = (out.tipText || "").replace(/\s+/g, "");
    const has = (sub) => T.indexOf(sub.replace(/\s+/g, "")) !== -1;

    console.log("\n=== assertions ===");
    ok(out.rowCount === 4, "all 4 turn rows rendered (got " + out.rowCount + ")");
    ok(out.rows.filter((r) => !r.self).every((r) => r.combatant),
       "every combatant row carries data-combatant");
    ok(out.rows.filter((r) => !r.self).every((r) => r.cursor === "help"),
       "combatant rows show cursor:help (got " + out.rows.map((r) => r.cursor).join(",") + ")");
    ok(!out.rows.find((r) => r.self).combatant, "player's own row gets no card (already on the sidebar)");
    ok(!!out.rows.find((r) => r.dead).combatant, "downed enemy row still carries a card");

    // The card is a real, styled DOM element -- the whole point of replacing the native tooltip.
    ok(out.tipExists, "#csTip element created on hover");
    ok(out.tipOn, "card is visible (.on) after mouseover");
    ok(out.tipParent.indexOf("BODY") === 0, "card lives on <body>, not inside the re-rendered sidebar (got " + out.tipParent + ")");
    ok(out.tipBg === "rgb(33, 28, 25)", "card has the dark background, not the browser's default (got " + out.tipBg + ")");
    ok(/7px/.test(out.tipBorder || ""), "card has rounded corners (got " + out.tipBorder + ")");
    ok(/rgba?\(161, 43, 43/.test(out.tipBorder || ""), "card has the rust accent border (got " + out.tipBorder + ")");
    ok(out.tipPointerEvents === "none", "card is pointer-events:none so the row keeps its hover");
    ok(/fixed/.test(out.tipPos || ""), "card is position:fixed (" + out.tipPos + ")");
    ok(!out.tipOnAfterLeave, "card hides on mouseleave");

    // Content, read from the rendered card.
    ok(has("Silt-Lurker Lacedon"), "card shows the combatant's name");
    ok(has("AC 12"), "card: AC 12 transcribed");
    ok(has("Atk +4"), "card: Atk +4 (signed)");
    ok(has("DMG 1d6+2"), "card: damage as 1d6+2");
    ok(has("STR 15 (+2)"), "card: STR 15 (+2)");
    ok(has("DEX 14 (+2)"), "card: DEX 14 (+2)");
    ok(has("CON 16 (+3)"), "card: CON 16 (+3)");
    ok(has("INT 8 (-1)"), "card: INT 8 (-1) (negative mod)");
    ok(has("WIS 11 (+0)"), "card: WIS 11 (+0)");
    ok(has("CHA 10 (+0)"), "card: CHA 10 (+0)");

    // The layout the user asked for: a real 2-column grid, 3 rows, columns aligned.
    ok(out.gridDisplay === "grid", "abilities use CSS grid, not space padding (got " + out.gridDisplay + ")");
    ok(out.gridCellCount === 6, "six ability cells (got " + out.gridCellCount + ")");
    ok(out.layoutIs3x2, "grid resolves to 3 rows x 2 columns (tops " + out.gridCellTops.join("/") +
       ", lefts " + out.gridCellLefts.join("/") + ")");
    // The two cells on each row must share a left edge -- i.e. the columns really line up.
    ok(out.gridCellLefts[0] === out.gridCellLefts[2] && out.gridCellLefts[2] === out.gridCellLefts[4],
       "left column shares one left edge across all 3 rows");
    ok(out.gridCellLefts[1] === out.gridCellLefts[3] && out.gridCellLefts[3] === out.gridCellLefts[5],
       "right column shares one left edge across all 3 rows");
    ok(out.gridCellTops[0] === out.gridCellTops[1] && out.gridCellTops[2] === out.gridCellTops[3] &&
       out.gridCellTops[4] === out.gridCellTops[5], "each row's two cells are vertically aligned");
    // Modifiers are colour-coded by sign.
    ok(JSON.stringify(out.modClasses) ===
       JSON.stringify(["pos","pos","pos","neg","zero","zero"]),
       "modifier classes are signed (pos/pos/pos/neg/zero/zero -> " + out.modClasses.join(",") + ")");

    // Table-driven check of the modifier: put a different score on each of the six enemy slots'
    // STR, re-render, and compare every rendered "(+N)" against EXPECTED_MODS. This walks the
    // whole 1-30 range (6 scores per pass) instead of spot-checking a few hardcoded strings, so a
    // wrong threshold anywhere in the sidebar's copy of score_to_mod shows up as a diff.
    console.log("\n=== modifier table sweep (STR per enemy slot, vs EXPECTED_MODS) ===");
    const SCORES = [];
    for (let n = 0; n <= 32; n++) SCORES.push(n);
    const modResults = await evaluate(`(async () => {
      const out = [];
      const KEYS = ["strength","dexterity","constitution","intelligence","wisdom","charisma"];
      for (let base = 0; base < ${SCORES.length}; base += 6) {
        const chunk = ${JSON.stringify(SCORES)}.slice(base, base + 6);
        // Reset to the sweep's turn order FIRST, then stamp this chunk's scores on top -- doing it
        // the other way round clobbers them with the base fight's values and every row reads back
        // as the wrong score.
        Object.assign(window.stats, ${JSON.stringify(SWEEP)});
        chunk.forEach((n, i) => {
          const slot = i + 1;
          for (const k of KEYS) window.stats["combat_enemy" + slot + "_" + k] = String(n);
          // A unique AC per slot is how a row is identified below: the tooltip deliberately does
          // NOT repeat the combatant's name, so matching on the name finds nothing.
          window.stats["combat_enemy" + slot + "_ac"] = 100 + slot;
          window.stats["combat_enemy" + slot + "_atk_bonus"] = 0;
          window.stats["combat_enemy" + slot + "_dmg_dice_sides"] = 4;
          window.stats["combat_enemy" + slot + "_dmg_bonus"] = 0;
          window.stats["combat_enemy" + slot + "_hp"] = "5";
          window.stats["combat_enemy" + slot + "_max_hp"] = "5";
          window.stats["combat_enemy" + slot + "_name"] = "Slot" + slot;
        });
        await new Promise(r => setTimeout(r, 700));
        for (let i = 0; i < chunk.length; i++) {
          const slot = i + 1;
          const n = chunk[i];
          // Re-query the row every time: renderStatSidebar rebuilds the rows every 400ms, and a
          // MouseEvent dispatched on a DETACHED node never bubbles up to the delegated listener
          // on #statSidebar, so a rows array captured earlier in this loop goes silently stale.
          const row = Array.from(document.querySelectorAll("#statSidebar .turnRow"))
            .find(r => r.getAttribute("data-combatant") === "enemy:" + slot);
          if (!row) { out.push({ n: n, slot: slot, score: null, str: null, note: "no row" }); continue; }
          const b = row.getBoundingClientRect();
          row.dispatchEvent(new MouseEvent("mouseover", {
            bubbles: true, clientX: Math.round(b.left + b.width / 2),
            clientY: Math.round(b.top + b.height / 2), view: window
          }));
          await new Promise(r => setTimeout(r, 30));
          const cell = document.querySelector("#csTip .tGrid .tAb");
          const tipEl = document.getElementById("csTip");
          const txt = cell ? cell.textContent : "";
          // DOUBLE backslashes are required: this whole block is a JS template literal, and a
          // single \s or \d there is eaten by the template parser, sending the browser a literal
          // /s*/ regex that can never match.
          const m = txt.match(/^([A-Z]+)\\s*(\\d+)\\s*\\(([-+]?\\d+)\\)$/);
          out.push({ n: n, slot: slot, score: m ? m[2] : null, str: m ? m[3] : null,
            diag: tipEl ? (tipEl.className + " grid=" + !!tipEl.querySelector(".tGrid") +
                           " cells=" + tipEl.querySelectorAll(".tAb").length +
                           " text=" + JSON.stringify(tipEl.innerText.slice(0, 60))) : "NO CARD ELEMENT" });
        }
      }
      return out;
    })()`);
    let modBad = 0;
    for (const r of modResults) {
      const want = EXPECTED_MODS[r.n];
      const wantStr = (want >= 0 ? "+" : "") + want;
      // Score 10 across all six abilities is indistinguishable from the declared defaults
      // (startup.txt:1356-1361), which abilitiesRolled deliberately treats as "never rolled" and
      // suppresses -- so there is correctly no ability line to read here. That is the guard
      // working, not a failure; every OTHER score must render and match.
      if (r.n === 10) {
        if (r.str !== null) {
          console.log("  FAIL  score 10 should suppress the ability line (all-defaults guard), got " + r.str);
          modBad++;
        }
        continue;
      }
      if (String(r.score) !== String(r.n)) {
        console.log("  FAIL  slot " + r.slot + ": expected score " + r.n + " rendered as " + r.score +
                    (r.diag ? "  [" + r.diag + "]" : ""));
        modBad++;
      } else if (r.str !== wantStr) {
        console.log("  FAIL  score " + r.n + " -> rendered " + JSON.stringify(r.str) + ", expected " + wantStr);
        modBad++;
      }
    }
    ok(modBad === 0, "every score 0-32 maps to the same modifier as score_to_mod, " +
       "and the all-defaults 10 correctly shows no ability line (" +
       modResults.length + " cases, " + modBad + " mismatches)");

    console.log("\n" + (fail === 0 ? "ALL PASS" : fail + " FAILURE(S)"));
    process.exitCode = fail === 0 ? 0 : 1;
  } finally {
    if (ws) try { ws.close(); } catch (e) {}
    chrome.kill();
  }
})().catch((e) => { console.error("PROBE FAILED: " + e.message); process.exit(1); });
