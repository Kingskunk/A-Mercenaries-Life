// probe_spellbook.js -- headless-Chrome check that the sidebar's Spellbook section lists EVERY spell a character actually holds (2026-11-04).
//
// WHY: the panel reads a spell id straight out of window.stats by field name, from the list in web/mygame/spell-data.js. That list was hand-written and went
// stale: tools/spell_book.json raised the wizard to 12 slots, the warlock to 6 and the bard to 8, while the list still stopped at slot 3. A bard's fourth and
// fifth verse and a warlock's third pact spell were learned, castable in a scene, and invisible here -- a whole class of bug that no scene test can see,
// because nothing in ChoiceScript reads that list. BOOK_SLOTS is generated now, and this is what proves it from the player's side.
//
// It plays a real character with tools/scripted_play.js (a Dev Hub preset, levelled up through the real level-up), seeds those stats into the real game,
// opens the Spellbook, reads the rows off each level tab, and checks every held spell is on one of them. It also screenshots the open section.
//
// Run (after `node compile.js`):  node tools/probe_spellbook.js [bard2|warlock2|wizard|all]     (CHROME=... if Chrome is not in the usual place)
// It starts its own Chrome profile and stops only its own processes.
const { spawn } = require("child_process");
const fs = require("fs"), os = require("os"), path = require("path");
const ROOT = path.resolve(__dirname, "..").split(path.sep).join("/");
const CHROME = process.env.CHROME || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const play = require("./scripted_play.js").play;

// Each scenario is a scripted_play run that ends with the character built, plus the spells the panel MUST show by name.
// "expect" is what the fix is about: spells sitting in a slot above 3, which the old hand-written list could not see.
const SCENARIOS = {
  bard2: {
    what: "Hexblood Bard, level 2 (five verses: slots 1-5 all full)",
    script: {
      scene: "dev_hub", label: "dev_scene_select", preset: "Cadre Combat Skald",
      weather: "Clear", time: "Morning", day: "Ironday",
      steps: [{ pick: "Systems tests" }, { pick: "Test a Combat Fight" }, { pick: "Take Level 2" },
              { pick: "Performance" }, { pick: "Persuasion" }, { pick: "Bane" }]
    },
    expect: ["Comprehend Languages", "Bane"]        // bard_spell_4 and bard_spell_5
  },
  warlock2: {
    what: "Warlock, level 2 (three pact spells)",
    script: {
      scene: "dev_hub", label: "dev_scene_select", preset: "Dread Warlock",
      weather: "Clear", time: "Morning", day: "Ironday",
      // Armor of Shadows is taken on purpose: it grants Mage Armor at will, which this preset holds in NO slot, so the list
      // carries a spell that exists only as an invocation flag and the entry has to say it comes from the pact. (Fiendish
      // Vigor would not test it: the Dread Warlock already has False Life in a slot, so the grant is a duplicate.)
      steps: [{ pick: "Systems tests" }, { pick: "Test a Combat Fight" }, { pick: "Take Level 2" },
              { pick: "Armor of Shadows" }, { pick: "Devil's Sight" }, { pick: "Hellish Rebuke" }]
    },
    expect: ["Hellish Rebuke", "Mage Armor"],       // warlock_spell_3, and the invocation's grant
    origin: { spell: "Mage Armor", match: "pact", clipped: false }
  },
  wizard: {
    what: "Wizard, level 2 (four spells in the book)",
    script: {
      scene: "dev_hub", label: "dev_scene_select", preset: "Force-Weaver",
      weather: "Clear", time: "Morning", day: "Ironday",
      steps: [{ pick: "Systems tests" }, { pick: "Test a Combat Fight" }, { pick: "Take Level 2" }]
    },
    expect: []
  },
  // A spell an ITEM grants (the Officer's Signet Ring's Guidance) must appear like any other, and be marked as clipped in.
  itemspell: {
    what: "Wizard wearing the signet ring (an item's spell is clipped in, not written)",
    script: {
      scene: "dev_hub", label: "dev_scene_select", preset: "Force-Weaver",
      weather: "Clear", time: "Morning", day: "Ironday",
      steps: [{ pick: "Systems tests" }, { pick: "Test a Combat Fight" }]
    },
    extraStats: { item_cantrip: "guidance", item_cantrip_desc: "Guidance, from the Officer's Signet Ring: a soft, murmured working that steadies your hand or sharpens your mind for one task. It lasts only while you wear the ring." },
    expect: ["Guidance"],
    origin: { spell: "Guidance", match: "item", clipped: true }
  },
  // PREPARATION. A wizard whose book holds more than the cap allows: the carried page must offer prepared_max boxes, putting one back
  // must make it uncastable, and carrying another must make that one castable -- all through the real ChoiceScript, not the panel's own state.
  prepare: {
    what: "Wizard carrying a chosen set (the book holds more than the cap)",
    script: {
      scene: "dev_hub", label: "dev_scene_select", preset: "Cadre Force-Weaver",
      weather: "Clear", time: "Morning", day: "Ironday",
      steps: [
        { pick: "Systems tests" }, { pick: "Copy a spell into your spellbook" },
        { pick: "Grant 10 more training" }, { pick: "Mage Armor" }
      ]
    },
    expect: [], carry: true
  },
  // LAYOUT AT THE TOP OF THE GAME. A level-20 wizard with INT 20 prepares int_mod + level = 25 spells, and the rule computes that with no
  // change, so the question is only whether the page can show 25 boxes without looking absurd. prepared_max is seeded directly: this is a
  // layout check, not a rules check.
  prepare20: {
    what: "Level-20 cap (25 boxes) -- does the carried page still hold together?",
    script: {
      scene: "dev_hub", label: "dev_scene_select", preset: "Cadre Force-Weaver",
      weather: "Clear", time: "Morning", day: "Ironday",
      steps: [{ pick: "Systems tests" }, { pick: "Test a Combat Fight" }]
    },
    extraStats: { prepared_max: 25, class_prepares: true },
    expect: [], carry: true, layoutOnly: true
  },
  // THE LOOSE LEAVES. A wizard carrying four scrolls: one they already hold (Magic Missile), one they can afford (Detect Magic, with 10
  // sessions banked), one they cannot yet (Mage Armor once the budget is gone), and one no wizard may learn (Healing Word, which must
  // not appear at all). Copying must write the spell in, spend the training, and leave the scroll in the pack.
  leaves: {
    what: "Wizard with scrolls in the pack (the loose leaves)",
    script: {
      scene: "dev_hub", label: "dev_scene_select", preset: "Cadre Force-Weaver",
      weather: "Clear", time: "Morning", day: "Ironday",
      steps: [{ pick: "Systems tests" }, { pick: "Test a Combat Fight" }]
    },
    extraStats: {
      has_scroll_magic_missile: true, has_scroll_detect_magic: true,
      has_scroll_mage_armor: true, has_scroll_healing_word: true,
      training_sessions: 10, training_spent_on_spells: 0, training_budget_left: 10
    },
    expect: [], leaves: true
  },
  // A character with no magic at all: the rail button and the B key must stay away, so a fighter never meets an empty book.
  fighter: {
    what: "Fighter (no magic: the book must not be offered)",
    script: {
      scene: "dev_hub", label: "dev_scene_select", preset: "Vanguard Line Fighter",
      weather: "Clear", time: "Morning", day: "Ironday",
      steps: [{ pick: "Systems tests" }, { pick: "Test a Combat Fight" }]
    },
    expect: [], noMagic: true
  }
};

// The stats scripted_play ends with, minus the engine's own objects and markers (the save cannot carry them, and the real game makes its own).
function seedStats(s) {
  const out = {};
  Object.keys(s).forEach((k) => {
    const v = s[k];
    if (v === null || typeof v === "object" || typeof v === "function") return;
    if (k === "scene" || k === "sceneName" || k === "choice_user_restored" || k.indexOf("choice_page_start") === 0) return;
    out[k] = v;
  });
  return out;
}

async function run(name) {
  const sc = SCENARIOS[name];
  console.log("== " + name + ": " + sc.what);

  // 1. Build the character in the real engine, out of the browser.
  const res = play(sc.script);
  if (res.error) { console.log("  FAIL scripted_play: " + res.error); return 1; }
  const stats = Object.assign(seedStats(res.s), sc.extraStats || {});

  // What the character actually holds, read off the same slot list the panel uses -- the question is whether the panel SHOWS all of it.
  const slotSrc = fs.readFileSync(path.join(ROOT, "web", "mygame", "spell-data.js"), "utf8");
  const win = {};
  new Function("window", slotSrc)(win);
  const held = (win.SPELL_SLOTS || []).map((f) => String(stats[f] || "")).filter((id) => id && id !== "none");
  const heldNames = held.map((id) => (win.spellById(id) || { name: id }).name);
  const wantNames = heldNames.concat(sc.expect.filter((n) => heldNames.indexOf(n) < 0));
  console.log("  holds (" + wantNames.length + "): " + wantNames.join(", "));

  // 2. Put those stats in the real game and read the panel.
  const PORT = 9800 + Math.floor(Math.random() * 150);
  const profileDirName = "cs-spellbook-" + Date.now();
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
    await new Promise((res2, rej) => { ws.onopen = res2; ws.onerror = rej; });
    let id = 0; const pending = new Map();
    ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
    const ev = (expression) => new Promise((res2, rej) => {
      const n = ++id;
      pending.set(n, (m) => (m.result && m.result.exceptionDetails) ? rej(new Error(JSON.stringify(m.result.exceptionDetails).slice(0, 600))) : res2(m.result.result.value));
      ws.send(JSON.stringify({ id: n, method: "Runtime.evaluate", params: { expression, awaitPromise: true, returnByValue: true } }));
    });
    const cmd = (method, params) => new Promise((res2, rej) => {
      const n = ++id;
      pending.set(n, (m) => (m.error ? rej(new Error(JSON.stringify(m.error))) : res2(m.result)));
      ws.send(JSON.stringify({ id: n, method, params: params || {} }));
    });
    for (let i = 0; i < 80; i++) { await sleep(300); try { if (await ev("!!(window.stats && window.Scene && window.nav && window.SPELL_SLOTS)")) break; } catch (e) {} }
    await sleep(4000);

    // Stats are set inside the clearScreen callback: something resets them before it (see probe_trade_panel.js).
    await ev(`(function(){
      clearScreen(function(){
        var s = window.stats, set = ${JSON.stringify(stats)};
        Object.keys(set).forEach(function (k) { s[k] = set[k]; });
        var scene = new Scene("dev_hub", s, nav, {}); scene.targetLabel = { label: "dev_scene_select", origin: "url", originLine: 0 }; scene.execute(); });
      return true; })()`);
    await sleep(2500);

    if (sc.noMagic) {
      check("the character really knows nothing", held.length === 0, held.join(", "));
      check("SpellBook.available() is false", (await ev("!!(window.SpellBook && window.SpellBook.available())")) === false);
      check("the rail does NOT offer the button", await ev("(function(){var b=document.querySelector('#rail [data-open=\"spellbook\"]'); return !b || b.hidden;})()"));
      await ev("(function(){ document.dispatchEvent(new KeyboardEvent('keydown', { key: 'b', bubbles: true })); })()");
      await sleep(500);
      check("the B key does not open it either", await ev("(function(){var d=document.getElementById('spellBook'); return !d || !d.open;})()"));
      return fails;
    }

    // The sidebar redraws every 400ms from module state, so the section is opened by clicking its own summary, as a player does.
    const summary = await ev("(function(){var s=document.querySelector('#statSidebar .spellbook > summary'); if(!s) return ''; s.click(); return s.textContent;})()");
    check("the Spellbook section is on the sidebar", !!summary, summary);
    if (!summary) return 1;
    await sleep(700);

    // Every level tab's rows, so a spell filed under any tab counts as shown.
    const shown = await ev(`(function(){
      var tabs = document.querySelectorAll('#statSidebar .spellTab'), out = [];
      function rows(){ var r = document.querySelectorAll('#statSidebar .spellRow .spellName'); for (var i=0;i<r.length;i++) out.push(r[i].textContent.trim()); }
      rows();
      for (var t=0;t<tabs.length;t++) { tabs[t].click(); rows(); }
      var seen = {}; return out.filter(function(n){ if (seen[n]) return false; seen[n]=true; return true; }).join("|");
    })()`);
    const shownList = shown ? shown.split("|") : [];
    console.log("  panel shows (" + shownList.length + "): " + shownList.join(", "));

    const missing = wantNames.filter((n) => shownList.indexOf(n) < 0);
    check("every spell the character holds is listed", missing.length === 0, missing.length ? "missing: " + missing.join(", ") : "all " + wantNames.length);
    const count = Number((/\((\d+)\)/.exec(summary) || [])[1] || 0);
    check("the section's own count matches the rows", count === shownList.length, count + " in the summary, " + shownList.length + " rows");

    // A look at it, since a count can pass while the section renders wrong.
    const png = path.join(os.tmpdir(), "spellbook_" + name + ".png");
    const shot = await cmd("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync(png, Buffer.from(shot.data, "base64"));
    console.log("  screenshot: " + png);

    // ---- the book panel on the rail (spellbook.js), the same spells in the open-book reader
    check("the rail offers the Spellbook button", await ev("(function(){var b=document.querySelector('#rail [data-open=\"spellbook\"]'); return !!b && !b.hidden;})()"));
    await ev("document.querySelector('#rail [data-open=\"spellbook\"]').click()");
    await sleep(900);
    check("the book opens", await ev("(function(){var d=document.getElementById('spellBook'); return !!d && d.open;})()"));
    // The book re-renders synchronously on every click, so a cached NodeList is detached after the first one: re-query each tab by index.
    const bookShown = await ev(`(function(){
      var out = [], n = document.querySelectorAll('#spellBook .sb-tab').length;
      function rows(){ var r = document.querySelectorAll('#spellBook .sb-row .sb-name'); for (var i=0;i<r.length;i++) out.push(r[i].textContent.trim()); }
      rows();
      for (var t=0;t<n;t++) { var tabs = document.querySelectorAll('#spellBook .sb-tab'); if (tabs[t]) { tabs[t].click(); rows(); } }
      var seen = {}; return out.filter(function(x){ if (seen[x]) return false; seen[x]=true; return true; }).join("|");
    })()`);
    const bookList = bookShown ? bookShown.split("|") : [];
    const bookMissing = wantNames.filter((n) => bookList.indexOf(n) < 0);
    check("the book lists every spell too", bookMissing.length === 0, bookMissing.length ? "missing: " + bookMissing.join(", ") : "all " + wantNames.length);
    // A spell that is not the character's own: an item's (clipped in) or a pact grant. The entry must say where it came from.
    if (sc.origin) {
      const got = await ev(`(function(){
        var n = document.querySelectorAll('#spellBook .sb-tab').length;
        for (var i=0;i<n;i++) {
          var t = document.querySelectorAll('#spellBook .sb-tab'); if (t[i]) t[i].click();
          var rows = document.querySelectorAll('#spellBook .sb-row');
          for (var j=0;j<rows.length;j++) {
            var nm = rows[j].querySelector('.sb-name');
            if (nm && nm.textContent.trim() === ${JSON.stringify(sc.origin.spell)}) { rows[j].click(); return (document.querySelector('#spellBook .sb-row[aria-pressed="true"]').className || "") + "||" + ((document.querySelector('#spellBook .sb-origin') || {}).textContent || ""); }
          }
        }
        return "||";
      })()`);
      const cls = got.split("||")[0], note = got.split("||")[1];
      check(sc.origin.spell + ": the row is " + (sc.origin.clipped ? "clipped" : "not clipped"), /sb-clipped/.test(cls || "") === sc.origin.clipped, cls);
      check(sc.origin.spell + ": the entry says where it came from", new RegExp(sc.origin.match, "i").test(note || ""), note);
    }

    // Open the FULLEST tab and read a spell off it, so the screenshot shows the book working rather than a near-empty spread.
    await ev(`(function(){
      var best = -1, bestN = -1, n = document.querySelectorAll('#spellBook .sb-tab').length;
      for (var i=0;i<n;i++) {
        var t = document.querySelectorAll('#spellBook .sb-tab'); if (!t[i]) continue;
        t[i].click();
        var c = document.querySelectorAll('#spellBook .sb-row').length;
        if (c > bestN) { bestN = c; best = i; }
      }
      var t2 = document.querySelectorAll('#spellBook .sb-tab'); if (t2[best]) t2[best].click();
      var r = document.querySelector('#spellBook .sb-row'); if (r) r.click();
    })()`);
    if (sc.leaves) {
      const rows = await ev("Array.prototype.map.call(document.querySelectorAll('#spellBook .sb-leaf'), function(r){ var b=r.querySelector('[data-copy]'); var w=r.querySelector('.sb-leafwhy'); return r.querySelector('.sb-leafname').textContent.trim() + '|' + (b ? 'COPY' : (w ? w.textContent.trim() : '?')); }).join('; ')");
      console.log("  loose leaves: " + rows);
      check("a scroll no wizard may learn is not offered", rows.indexOf("Healing Word") < 0, rows);
      check("a scroll already in the book says so", /Magic Missile\|Already in your book/.test(rows), rows);
      check("an affordable scroll offers the copy", /Detect Magic\|COPY/.test(rows), rows);

      const before = await ev("Number(window.stats.training_budget_left)");
      await ev("document.querySelector('#spellBook .sb-leaf [data-copy=\"detect_magic\"]').click()");
      await sleep(2600);
      check("Detect Magic is written into the book", await ev("!!window.stats.held_detect_magic"),
        "held=" + await ev("String(window.stats.held_detect_magic)"));
      check("the training was spent", (await ev("Number(window.stats.training_budget_left)")) === before - 10,
        before + " -> " + await ev("String(window.stats.training_budget_left)"));
      check("the scroll is still in the pack", await ev("!!window.stats.has_scroll_detect_magic"));
      const after = await ev("Array.prototype.map.call(document.querySelectorAll('#spellBook .sb-leaf'), function(r){ var b=r.querySelector('[data-copy]'); var w=r.querySelector('.sb-leafwhy'); return r.querySelector('.sb-leafname').textContent.trim() + '|' + (b ? 'COPY' : (w ? w.textContent.trim() : '?')); }).join('; ')");
      console.log("  after copying: " + after);
      check("with the training gone, the rest say what they need", /Mage Armor\|Needs 10 training, you have 0/.test(after), after);
    }

    // A class that does not prepare must never see the carried page: it knows its spells and casts them all.
    const ribbon = await ev("!!document.querySelector('#spellBook .sb-rib')");
    const classPrepares = await ev("!!window.stats.class_prepares");
    check("the carried page is offered only to a class that prepares", ribbon === classPrepares,
      "ribbon=" + ribbon + " class_prepares=" + classPrepares);

    if (sc.carry) {
      // The ribbon is only drawn for a class that prepares; the carried page is behind it.
      check("the ribbon offers the carried set", await ev("!!document.querySelector('#spellBook .sb-rib[data-mode=\"carry\"]')"));
      await ev("document.querySelector('#spellBook .sb-rib[data-mode=\"carry\"]').click()");
      await sleep(600);
      const max = await ev("Number(window.stats.prepared_max)");
      const boxes = await ev("document.querySelectorAll('#spellBook .sb-box').length");
      check("there is one box per spell that may be carried", boxes === max, boxes + " boxes, prepared_max " + max);
      if (sc.layoutOnly) {
        const h = await ev("(function(){var b=document.querySelector('#spellBook .sb-boxes'); return b?Math.round(b.getBoundingClientRect().height):0;})()");
        const sheet = await ev("(function(){var b=document.querySelector('#spellBook .sb-page.right .sb-sheet'); return b?Math.round(b.clientHeight):0;})()");
        const dlgH = await ev("(function(){var d=document.getElementById('spellBook'); return d?Math.round(d.getBoundingClientRect().height):0;})()");
        const bookH = await ev("(function(){var b=document.querySelector('#spellBook .sb-book'); return b?Math.round(b.getBoundingClientRect().height):0;})()");
        console.log("  boxes column " + h + "px | right sheet " + sheet + "px | book " + bookH + "px | dialog " + dlgH + "px");
        check("the book stays inside the panel", bookH <= dlgH + 2, bookH + "px of book in a " + dlgH + "px panel");
        check("the boxes scroll inside the page rather than stretching it", sheet <= dlgH, "sheet " + sheet + "px");
        const png20 = path.join(os.tmpdir(), "book_" + name + ".png");
        const shot20 = await cmd("Page.captureScreenshot", { format: "png" });
        fs.writeFileSync(png20, Buffer.from(shot20.data, "base64"));
        console.log("  screenshot: " + png20);
        return fails;
      }
      const fullBefore = await ev("document.querySelectorAll('#spellBook .sb-box.full').length");
      const spare = await ev("(function(){var b=document.querySelector('#spellBook .sb-spare'); return b?b.getAttribute('data-carry'):'';})()");
      check("a spell in the book is waiting to be carried", !!spare, spare);

      // Put one back: it must stop being castable, in the real stats.
      const firstId = await ev("(function(){var b=document.querySelector('#spellBook .sb-box.full'); return b?b.getAttribute('data-uncarry'):'';})()");
      await ev("document.querySelector('#spellBook .sb-box.full').click()");
      await sleep(2200);
      check("putting one back frees a box", (await ev("document.querySelectorAll('#spellBook .sb-box.full').length")) === fullBefore - 1);
      check(firstId + " is no longer castable", (await ev("!!window.stats['known_' + " + JSON.stringify(firstId) + "]")) === false,
        "known_" + firstId + "=" + await ev("String(window.stats['known_' + " + JSON.stringify(firstId) + "])"));

      // Carry the one that was stuck in the book: it must become castable.
      await ev("(function(){var b=document.querySelector('#spellBook .sb-spare[data-carry=' + JSON.stringify(" + JSON.stringify(spare) + ") + ']'); if(b) b.click(); else { var a=document.querySelector('#spellBook .sb-spare'); if(a) a.click(); } })()");
      await sleep(2200);
      check(spare + " is castable once carried", await ev("!!window.stats['known_' + " + JSON.stringify(spare) + "]"),
        "known_" + spare + "=" + await ev("String(window.stats['known_' + " + JSON.stringify(spare) + "])"));
      check("the cap is still not exceeded", (await ev("Number(window.stats.prepared_count)")) <= max,
        (await ev("String(window.stats.prepared_count)")) + " of " + max);
    }

    // Where a scenario is about an entry's origin, leave THAT entry open, so the screenshot shows the clip and its note.
    if (sc.carry) {
      await ev("(function(){var b=document.querySelector('#spellBook .sb-rib[data-mode=\"carry\"]'); if(b) b.click();})()");
      await sleep(500);
    }
    if (sc.origin) {
      await ev(`(function(){
        var n = document.querySelectorAll('#spellBook .sb-tab').length;
        for (var i=0;i<n;i++) {
          var t = document.querySelectorAll('#spellBook .sb-tab'); if (t[i]) t[i].click();
          var rows = document.querySelectorAll('#spellBook .sb-row');
          for (var j=0;j<rows.length;j++) { var nm = rows[j].querySelector('.sb-name'); if (nm && nm.textContent.trim() === ${JSON.stringify(sc.origin.spell)}) { rows[j].click(); return; } }
        }
      })()`);
    }
    await sleep(600);
    // A carry scenario leaves the carried set on the facing page on purpose, so there is no entry open to check.
    if (!sc.carry) check("the facing page is reading a spell", await ev("!!document.querySelector('#spellBook .sb-read h3')"), await ev("(function(){var h=document.querySelector('#spellBook .sb-read h3'); return h?h.textContent:'';})()"));
    const bpng = path.join(os.tmpdir(), "book_" + name + ".png");
    const bshot = await cmd("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync(bpng, Buffer.from(bshot.data, "base64"));
    console.log("  book screenshot: " + bpng);
  } finally {
    if (ws) try { ws.close(); } catch (e) {}
    try { chrome.kill(); } catch (e) {}
    try { require("child_process").spawnSync("powershell", ["-NoProfile", "-Command", "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | Where-Object { $_.CommandLine -like '*" + profileDirName + "*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }"], { stdio: "ignore" }); } catch (e) {}
  }
  return fails;
}

(async () => {
  const which = process.argv[2] || "bard2";
  const names = which === "all" ? Object.keys(SCENARIOS) : [which];
  let fails = 0;
  for (const n of names) { if (!SCENARIOS[n]) { console.error("unknown scenario " + n); process.exit(1); } fails += await run(n); }
  console.log(fails ? fails + " check(s) FAILED" : "all checks passed");
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error("FAILED: " + e.message); process.exit(1); });
