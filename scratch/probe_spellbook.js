// Verifies the sidebar's spellbook proof-of-concept section: present and collapsed by default, the tab
// row listing only the character's known workings, the generated icons actually decoding, the
// no-art initials fallback, tab/click behaviour -- and that it mutates NOTHING in window.stats.
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9337;
const root = path.resolve(__dirname, "..");
const target = "file:///" + path.join(root, "play_game.html").replace(/\\/g, "/");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// A throwaway profile, wiped on the way out. The game autosaves to localStorage, so a reused profile
// would hand the next run a previous synthetic character instead of a clean boot.
const PROFILE = path.join(os.tmpdir(), "cs-spellbook");
try { fs.rmSync(PROFILE, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); }
catch (e) { /* a previous run's Chrome may still hold it; harmless, it just gets reused */ }

// The Cadre Battle-Abjurer preset: Guidance, Ray of Frost, Blade Ward (cantrips) + Shield (L1).
const WIZARD = {
  intake_completed: "true", combat_engaged: "false",
  name: "Aelion", character_level: "3", class_name: "Wizard",
  character_class: "wizard", hp_current: "14", hp_max: "18",
  armor_class: "15", prof_bonus: "2",
  strength: "10", dexterity: "14", constitution: "12",
  intelligence: "16", wisdom: "10", charisma: "12",
  str_mod_str: "+0", dex_mod_str: "+2", con_mod_str: "+1",
  int_mod_str: "+3", wis_mod_str: "+0", cha_mod_str: "+1",
  wizard_cantrip: "guidance", wizard_cantrip_desc: "Guidance (+1d4 Check Bonus)",
  wizard_cantrip_2: "ray_of_frost", wizard_cantrip_2_desc: "Ray of Frost (1d8 Cold, Slows Target)",
  wizard_cantrip_3: "blade_ward", wizard_cantrip_3_desc: "Blade Ward (Resist Bludgeoning/Piercing/Slashing, Bonus Action - House Rule)",
  wizard_spell: "shield", wizard_spell_desc: "Shield (+5 AC Reaction)",
  wizard_spell_slots: "2"
};
// A fighter: every spell stat stays "none", so the section should say so rather than hiding itself.
const FIGHTER = {
  intake_completed: "true", combat_engaged: "false",
  name: "Varren", character_level: "3", class_name: "Fighter",
  character_class: "fighter", hp_current: "20", hp_max: "26",
  armor_class: "18", prof_bonus: "2",
  strength: "16", dexterity: "12", constitution: "16",
  intelligence: "8", wisdom: "10", charisma: "8",
  str_mod_str: "+3", dex_mod_str: "+1", con_mod_str: "+3",
  int_mod_str: "-1", wis_mod_str: "+0", cha_mod_str: "-1"
};
// A warlock, to exercise spells whose icons the generator had to resolve through the library's fuzzy
// matcher (eldritch_blast, hex, armor_of_agathys, unseen_servant) rather than by exact name. The last
// two art-less spells -- unseen_servant and, via a warlock slot, prestidigitation -- are included on
// purpose, to prove the initials-chip fallback still renders a readable row with no image at all.
const WARLOCK = {
  intake_completed: "true", combat_engaged: "false",
  name: "Thessaly", character_level: "3", class_name: "Warlock",
  character_class: "warlock", hp_current: "16", hp_max: "19",
  armor_class: "15", prof_bonus: "2",
  strength: "10", dexterity: "16", constitution: "14",
  intelligence: "12", wisdom: "11", charisma: "17",
  str_mod_str: "+0", dex_mod_str: "+3", con_mod_str: "+2",
  int_mod_str: "+1", wis_mod_str: "+0", cha_mod_str: "+3",
  warlock_cantrip: "eldritch_blast", warlock_cantrip_desc: "Eldritch Blast (1d10 Force, 3 Beams)",
  warlock_cantrip_2: "chill_touch", warlock_cantrip_2_desc: "Chill Touch (1d8 Cold, Disadvantage)",
  warlock_spell: "armor_of_agathys", warlock_spell_desc: "Armor of Agathys (Temp HP, Retaliate)",
  race_cantrip: "prestidigitation", race_cantrip_desc: "Prestidigitation (Minor Trick)",
  race_cantrip_2: "unseen_servant", race_cantrip_2_desc: "Unseen Servant (Invisible Helper)",
  warlock_spell_slots: "2"
};


const INSPECT = (state) => `(async () => {
  // Blank every spell stat FIRST, then apply this state's own. Stats are sticky once written, so a
  // fighter inspected after a wizard would otherwise still show the wizard's cantrips -- which is
  // correct engine behaviour and a bug in the test, not in the UI.
  const blank = () => {
    Object.keys(window.stats).forEach(k => {
      if (/^((race|warlock|wizard|bard)_(cantrip|spell)(_[23])?)(_desc)?$/.test(k)) {
        window.stats[k] = /_desc$/.test(k) ? "" : "none";
      }
    });
  };
  const apply = () => { blank(); Object.assign(window.stats, ${JSON.stringify(state)}); };
  // Keep re-applying for the WHOLE inspection, not just until the section first appears. The game's
  // own 400ms poll re-reads its own saved state and will otherwise clobber anything set after the
  // loop breaks -- which showed up as wizard_spell silently reverting to "none" and the L1 tab
  // coming up empty. One interval keeps the synthetic character pinned until the test is done with it.
  const applyTimer = setInterval(apply, 100);
  for (let i = 0; i < 60; i++) {
    apply();
    await new Promise(r => setTimeout(r, 100));
    if (document.querySelector("#statSidebar .spellbook")) break;
  }
  await new Promise(r => setTimeout(r, 300));
  // Each INSPECT call is a fresh character, so it must start from the spellbook's DEFAULT state
  // (collapsed, on the cantrip tab). Those two values are module state in the page and survive from
  // the previous character -- otherwise the warlock inherits "open, L1 tab" from the wizard and its
  // cantrip tab never gets inspected. Deliberately clicking rather than poking internals: this also
  // exercises the real user path back to the default view.
  const d0 = document.querySelector("#statSidebar .spellbook");
  if (d0 && d0.hasAttribute("open")) {
    d0.querySelector("summary").click();
    await new Promise(r => setTimeout(r, 250));
  }
  const d1 = document.querySelector("#statSidebar .spellbook");
  const t0 = d1 && d1.querySelector('[data-spell-tab="0"]');
  if (t0 && t0.getAttribute("aria-pressed") !== "true") {
    t0.click();
    await new Promise(r => setTimeout(r, 250));
  }
  const det = document.querySelector("#statSidebar .spellbook");
  if (!det) return { error: "no .spellbook rendered" };
  // Snapshot the spell-relevant stats, to prove the section changed none of them.
  const snap = () => Object.keys(window.stats)
    .filter(k => /_((cantrip|spell)(_[23])?)(_desc)?$/.test(k))
    .sort().map(k => k + "=" + window.stats[k]).join("|");
  const before = snap();
  // Counting distinct vertical offsets tells us how many LINES the flex row actually wrapped onto.
  // A wrapped tab row looks fine in code but silently doubles the spellbook's height in play.
  const rowCount = (d) => new Set(Array.from(d.querySelectorAll("[data-spell-tab]"))
    .map(t => Math.round(t.getBoundingClientRect().top))).size;
  const readTabs = (d) => Array.from(d.querySelectorAll("[data-spell-tab]")).map(t => ({
    lvl: t.getAttribute("data-spell-tab"),
    empty: t.className.indexOf("spellTabEmpty") !== -1,
    pressed: t.getAttribute("aria-pressed"),
    hasOrb: !!t.querySelector("img"),
    // Numbered tabs are orb-only, so the accessible name has to come from aria-label, not text.
    name: (t.getAttribute("aria-label") || t.textContent).trim()
  }));
  const out = {
    open: det.hasAttribute("open"),
    summary: det.querySelector("summary") ? det.querySelector("summary").textContent.trim() : null,
    tabs: readTabs(det),
    tabRows: rowCount(det),
    rows: Array.from(det.querySelectorAll("[data-spell]")).map(r => r.getAttribute("data-spell")),
    // Per-row: does this spell have real art, or is it on the initials-chip fallback? This is what
    // distinguishes "the generator resolved the icon" from "the row rendered but silently chipped".
    rowArt: Array.from(det.querySelectorAll("[data-spell]")).map(r => {
      const img = r.querySelector("img"), chip = r.querySelector(".spellInitials");
      return r.getAttribute("data-spell") + ":" + (img ? "img" : (chip ? "chip:" + chip.textContent.trim() : "NONE"));
    }),
    hasInitials: det.querySelectorAll(".spellInitials").length,
    imgs: det.querySelectorAll("img").length,
    note: (det.querySelector(".spellNote") || {}).textContent || null,
    emptyText: (det.querySelector(".spellEmpty") || {}).textContent || null
  };
  // The sidebar's innerHTML is replaced every 400ms, so an element grabbed now can be detached by
  // the time the next statement runs -- a click on a detached node does nothing and the assertion
  // downstream fails for a reason that has nothing to do with the UI. Re-query and retry until the
  // expected condition actually holds (or we give up), which also makes the waits deterministic.
  const clickUntil = async (selector, test, tries) => {
    for (let i = 0; i < (tries || 12); i++) {
      const el = document.querySelector(selector);
      if (el) el.click();
      await new Promise(r => setTimeout(r, 120));
      if (!test || test()) return true;
    }
    return false;
  };
  const openNow = () => {
    const d = document.querySelector("#statSidebar .spellbook");
    return !!d && d.hasAttribute("open");
  };
  const tabNow = (lvl) => {
    const d = document.querySelector("#statSidebar .spellbook");
    if (!d) return false;
    const t = d.querySelector('[data-spell-tab="' + lvl + '"]');
    return !!t && t.getAttribute("aria-pressed") === "true";
  };

  await clickUntil("#statSidebar .spellbook > summary", openNow);
  out.openedAfterClick = openNow();
  await clickUntil('#statSidebar [data-spell-tab="1"]', () => tabNow(1));
  out.rowsAfterTab = Array.from(document.querySelectorAll("#statSidebar [data-spell]"))
    .map(r => r.getAttribute("data-spell"));
  // Same img-vs-chip breakdown for whichever tab is now showing, so the L1 tab's icons are checked
  // too -- shield is a level-1 spell and lives there, not on the cantrip tab.
  out.rowArtAfterTab = Array.from(document.querySelectorAll("#statSidebar [data-spell]")).map(r => {
    const img = r.querySelector("img"), chip = r.querySelector(".spellInitials");
    return r.getAttribute("data-spell") + ":" + (img ? "img" : (chip ? "chip:" + chip.textContent.trim() : "NONE"));
  });
  out.tabsAfterSwitch = readTabs(document.querySelector("#statSidebar .spellbook"));
  const detailNow = () => {
    const d = document.querySelector("#statSidebar .spellbook");
    return !!(d && d.querySelector(".spellDetail"));
  };
  // Pin whichever spell is on the visible tab, re-querying each attempt for the same reason as above.
  await clickUntil("#statSidebar [data-spell]", detailNow);
  const det2 = document.querySelector("#statSidebar .spellbook");
  out.detailShown = !!det2.querySelector(".spellDetail");
  out.detailText = det2.querySelector(".spellDetail") ? det2.querySelector(".spellDetail").textContent.trim() : null;
  out.pinnedPressed = Array.from(det2.querySelectorAll("[data-spell]"))
    .map(r => r.getAttribute("data-spell") + ":" + r.getAttribute("aria-pressed"));
  // Icons must DECODE, not merely exist in the DOM.
  out.imgsLoaded = await Promise.all(Array.from(det2.querySelectorAll("img")).map(img =>
    (img.complete && img.naturalWidth > 0) ? true : new Promise(res => {
      img.onload = () => res(true); img.onerror = () => res(false);
    })));
  // Stop pinning the synthetic character BEFORE the no-mutation check, or the interval itself would
  // be the thing writing to window.stats. Everything above (open, tab, pin) has already happened by
  // now, so this still proves the section's own click handlers never wrote a stat.
  clearInterval(applyTimer);
  await new Promise(r => setTimeout(r, 500));   // let any final poll settle first
  out.statsUnchanged = (snap() === before);
  return out;
})()`;


(async () => {
  const chrome = spawn(CHROME, [
    "--headless=new", `--remote-debugging-port=${PORT}`, "--disable-gpu",
    "--no-first-run", "--no-default-browser-check",
    "--user-data-dir=" + PROFILE, target
  ], { stdio: "ignore" });
  let ws = null;
  try {
    let list = null;
    for (let i = 0; i < 40; i++) {
      await sleep(250);
      try {
        list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
        if (list.some((t) => t.type === "page" && t.url.startsWith("file:"))) break;
      } catch (e) { /* chrome not up */ }
    }
    const page = list && list.find((t) => t.type === "page" && t.url.startsWith("file:"));
    if (!page) throw new Error("no page target");
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
    if (!ready) throw new Error("window.stats never appeared");

    const wiz = await evaluate(INSPECT(WIZARD));
    console.log("=== wizard (3 cantrips + 1 L1 spell) ===");
    console.log(JSON.stringify(wiz, null, 2));
    // Manifest-level check: every spell the game can know should have an icon inlined. This is the
    // assertion that would have caught chill_touch going missing, rather than it only surfacing when
    // a warlock happened to be the character under test.
    const manifest = await evaluate(`(() => {
      const ids = (window.SPELL_DATA || []).map(s => s.id);
      const withIcon = ids.filter(id => !!(window.SPELL_ICONS && window.SPELL_ICONS[id]));
      const missing = ids.filter(id => !(window.SPELL_ICONS && window.SPELL_ICONS[id]));
      // Confirm each inlined icon is a real, decodable data: URI rather than just a present string.
      return new Promise(res => {
        const imgs = withIcon.map(id => new Promise(ok => {
          const im = new Image();
          im.onload = () => ok({ id, ok: true, w: im.naturalWidth });
          im.onerror = () => ok({ id, ok: false });
          im.src = window.SPELL_ICONS[id];
        }));
        Promise.all(imgs).then(r => res({ total: ids.length, missing, decoded: r }));
      });
    })()`);
    console.log("\n=== icon manifest: " + manifest.total + " spells ===");
    if (manifest.missing.length) {
      console.log("  no icon: " + manifest.missing.join(", "));
    } else {
      console.log("  all " + manifest.total + " spells have an inlined icon");
    }
    const badDecode = manifest.decoded.filter((d) => !d.ok);
    console.log("  decoded " + manifest.decoded.length + "/" + manifest.total +
                (badDecode.length ? ", FAILED: " + badDecode.map((d) => d.id).join(", ") : ", all OK"));
    const warlock = await evaluate(INSPECT(WARLOCK));
    console.log("\n=== warlock (fuzzy-resolved icons + 2 art-less spells) ===");
    console.log(JSON.stringify(warlock, null, 2));
    const fig = await evaluate(INSPECT(FIGHTER));
    console.log("\n=== fighter (no magic) ===");
    console.log(JSON.stringify(fig, null, 2));

    let fail = 0;
    const ok = (c, m) => { console.log((c ? "  PASS  " : "  FAIL  ") + m); if (!c) fail++; };
    console.log("\n=== assertions ===");
    // Icon completeness first: if the manifest is short, the per-character checks below are measuring
    // a character that only happens to know spells that do have art.
    ok(manifest.missing.length === 0,
       "every spell in SPELL_DATA has an inlined icon (" + manifest.missing.length + " missing" +
       (manifest.missing.length ? ": " + manifest.missing.join(", ") : "") + ")");
    ok(badDecode.length === 0,
       "every inlined icon is a decodable data: URI (" + manifest.decoded.length + " checked)");
    ok(manifest.decoded.length === manifest.total,
       "one decoded image per spell (" + manifest.decoded.length + " of " + manifest.total + ")");
    ok(wiz.error === undefined, "section rendered for a wizard (" + (wiz.error || "ok") + ")");
    ok(wiz.open === false, "collapsed by default (open=" + wiz.open + ")");
    ok(wiz.summary === "Spellbook (4)", "summary counts 4 known workings: " + wiz.summary);
    ok(wiz.tabs.length === 5, "five tabs (cantrip, L1..L4); got " + wiz.tabs.length);
    ok(wiz.tabs.every((t) => t.hasOrb), "every tab carries a level orb image");
    ok(wiz.tabs.filter((t) => t.empty).length === 3,
       "L2, L3 and L4 dimmed as empty; got " + wiz.tabs.filter((t) => t.empty).length);
    // The fifth tab only fits because numbered tabs dropped their redundant "Ln" text (the orb already
    // shows the numeral) and tightened their padding. If either regresses, the row wraps to 2 lines
    // and silently doubles the spellbook's height -- so the row is measured, not eyeballed.
    ok(wiz.tabRows === 1, "all five tabs stay on ONE row; got " + wiz.tabRows);
    ok(wiz.rows.join(",") === "guidance,ray_of_frost,blade_ward",
       "cantrip tab lists exactly the 3 known cantrips in slot order: " + wiz.rows.join(","));
    ok(wiz.imgs === 8, "5 tab orbs + 3 spell icons render; got " + wiz.imgs + " images");
    ok(wiz.hasInitials === 0, "all 3 wizard spells have real art, so no initials chip is needed");
    ok(wiz.rowArt.every((r) => r.indexOf(":img") !== -1),
       "each wizard row carries a real icon: " + wiz.rowArt.join(" "));
    ok(wiz.openedAfterClick === true, "clicking the summary opens it, and it survives the 400ms rebuild");
    ok(wiz.rowsAfterTab.join(",") === "shield", "L1 tab shows only the L1 spell: " + wiz.rowsAfterTab.join(","));
    ok(wiz.rowArtAfterTab && wiz.rowArtAfterTab.indexOf("shield:img") !== -1,
       "shield resolved to its OWN icon, not Fire_Shield: " + (wiz.rowArtAfterTab || "?").join(" "));
    ok(wiz.tabsAfterSwitch[1].pressed === "true" && wiz.tabsAfterSwitch[0].pressed === "false",
       "L1 takes aria-pressed, cantrip releases it");
    ok(wiz.detailShown === true, "clicking a spell pins a detail line");
    ok(/Shield/.test(wiz.detailText || ""), "detail shows the name: " + (wiz.detailText || "").slice(0, 50));
    // The game's _desc fields already begin with the spell name, so the panel must NOT also print a
    // bold heading -- "Blade Ward Blade Ward (...)" was the first render.
    ok(!/Blade Ward Blade Ward/.test(wiz.detailText || "") &&
       !/Shield Shield/.test(wiz.detailText || ""),
       "detail does not duplicate the spell name: " + (wiz.detailText || "").slice(0, 46));
    ok(/^Shield \(\+5 AC Reaction\)/.test(wiz.detailText || ""),
       "detail leads with the description itself: " + (wiz.detailText || "").slice(0, 46));
    ok(/AC Reaction/.test(wiz.detailText || ""), "detail reuses the game's own _desc prose");
    ok(/read-only preview/.test(wiz.detailText || ""), "detail is labelled read-only");
    ok(wiz.pinnedPressed.some((p) => p === "shield:true"), "the pinned row reads as pressed");
    ok(wiz.imgsLoaded.length > 0 && wiz.imgsLoaded.every(Boolean),
       "every icon DECODES (naturalWidth>0): " + JSON.stringify(wiz.imgsLoaded));
    ok(wiz.statsUnchanged === true, "NO spell stat mutated by opening, tabbing or clicking");

    // ── warlock: the fuzzy-resolved icons, plus the spells with no art in the library ──
    ok(warlock.error === undefined, "section rendered for a warlock (" + (warlock.error || "ok") + ")");
    ok(warlock.summary === "Spellbook (5)",
       "warlock's 5 workings across class + race slots are all listed: " + warlock.summary);
    ok(warlock.rows.join(",") === "prestidigitation,eldritch_blast,chill_touch",
       "cantrip tab merges race cantrips with class cantrips in slot order: " + warlock.rows.join(","));
    ok(warlock.rowArt.indexOf("eldritch_blast:img") !== -1,
       "eldritch_blast (exact-name match) has real art");
    // Every spell the game can know now has real art, including these two, which arrived as .DDS and
    // were converted to webp. Assert on the IMAGE specifically: the initials-chip fallback renders an
    // equally readable row, so "the row exists" would pass even if the icon silently went missing.
    ok(warlock.rowArt.indexOf("prestidigitation:img") !== -1,
       "prestidigitation (converted from DDS) has real art: " + warlock.rowArt.join(" "));
    ok(warlock.rowArt.indexOf("chill_touch:img") !== -1,
       "chill_touch (stands in with Chilling Hand art) has real art: " + warlock.rowArt.join(" "));
    ok(warlock.rowArt.indexOf("eldritch_blast:img") !== -1,
       "eldritch_blast (exact-name match) has real art");
    ok(warlock.hasInitials === 0,
       "no warlock spell falls back to an initials chip; got " + warlock.hasInitials);
    ok(warlock.rowArtAfterTab && warlock.rowArtAfterTab.indexOf("armor_of_agathys:img") !== -1,
       "armor_of_agathys resolved through the British 'Armour' spelling: " +
       (warlock.rowArtAfterTab || "?").join(" "));
    ok(warlock.imgsLoaded.length > 0 && warlock.imgsLoaded.every(Boolean),
       "every warlock icon DECODES: " + JSON.stringify(warlock.imgsLoaded));
    ok(warlock.statsUnchanged === true, "warlock: no stats mutated");

    ok(fig.error === undefined, "section still renders for a fighter (no class gating)");
    ok((fig.rows || []).length === 0, "fighter sees no spell rows");
    ok(/No workings known/.test(fig.emptyText || ""), "fighter gets an honest empty note: " + (fig.emptyText || ""));
    ok(fig.hasInitials === 0, "fighter: no spell icon chips either");
    ok(fig.imgs === 5, "fighter still gets the 5 tab orbs, so the tab row keeps its shape: " + fig.imgs);
    ok(fig.statsUnchanged === true, "fighter: no stats mutated");
    console.log("\n" + (fail === 0 ? "ALL PASS" : fail + " FAILURE(S)"));
    process.exitCode = fail === 0 ? 0 : 1;
  } finally {
    if (ws) try { ws.close(); } catch (e) {}
    // chrome.kill() only signals the launcher process, so its renderer/GPU children survive and
    // accumulate (~20+ orphaned processes after a few runs) -- which then makes the NEXT probe attach
    // to a half-dead browser and fail in confusing, order-dependent ways. taskkill /T takes down the
    // whole tree at once.
    try { require("child_process").execSync(`taskkill /PID ${chrome.pid} /T /F`, { stdio: "ignore" }); }
    catch (e) { try { chrome.kill(); } catch (e2) {} }
    // The game autosaves to localStorage (amp_save_v1_slot_N), so this probe's synthetic wizard ends
    // up in the profile. That is harmless HERE -- the profile is wiped on every run -- but leaving a
    // save behind is how a later probe ends up rendering a stale character and failing confusingly.
    // Chrome can still be releasing its index files as taskkill returns, so EPERM here is expected
    // and must not fail the run; the next run's startup wipe will collect it.
    try { fs.rmSync(PROFILE, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); }
    catch (e) { /* best effort */ }
  }
})().catch((e) => { console.error("PROBE FAILED: " + e.message); process.exit(1); });
