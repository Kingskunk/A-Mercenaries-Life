/*
 * SPELLBOOK PANEL (2026-11-04) -- the player's spells as an open book, opened from the rail or the B key.
 *
 * WHAT IT READS: nothing of its own. The spells come from window.SPELL_SLOTS (spell-data.js, whose leveled half is generated from
 * tools/spell_book.json) read against window.stats, exactly as the sidebar's Spellbook section does, plus the spells an Eldritch
 * Invocation grants at will. A spell appears the moment it is in a slot, whatever put it there -- a class pick, a racial grant, or a
 * worn item -- so an item that teaches a spell needs no wiring here, and a character with no magic never sees the button.
 *
 * WHAT IT WRITES: nothing. This is a reader. The one action is Cast, and that is handed to the dossier's own one-shot labels through
 * window.OpenDossierAt, the same route the sidebar's Cast button takes, so the slot spend and the replay locks stay in ChoiceScript.
 *
 * STATE: which level tab is showing and which spell is being read, in module scope. They are deliberately NOT in the save: a book
 * left open at Cantrips is not a fact about the character. The panel is rebuilt from the live stats every time it opens.
 *
 * PREPARATION is not built. When it is, the left page keeps the known list and the right page becomes the prepared set; the rule
 * layer belongs in ChoiceScript (a prepared_<id> flag family beside held_ and known_), not here. See tools/spell_book.json.
 */
(function () {
  "use strict";

  var SB = window.SpellBook = window.SpellBook || {};
  // The level tabs: cantrips plus every spell level the game actually has entries for, and never fewer than four, so the row keeps a
  // stable shape today and grows by itself the day 2nd-level spells (or a level-20 wizard's 9th) are added. Nothing here needs editing
  // for that; spell-data.js carrying one entry at the new level is enough.
  function tabLevels() {
    var top = 4;
    (window.SPELL_DATA || []).forEach(function (sp) { if (sp.level > top) top = sp.level; });
    var out = [];
    for (var i = 0; i <= top; i++) out.push(i);
    return out;
  }
  var dlg = null, tab = 0, picked = null;
  // THE SPREAD IS ALWAYS TWO PAGES (the user, 2026-11-04: they do not play on a phone). There was a one-page-at-a-time mode for narrow
  // screens, with a back arrow and state tracking which leaf was showing; it is gone, and the book is simply the spread.
  // The right page has two jobs for a preparing class: the entry it is reading, and the set carried today. mode says which, and it
  // resets to the reading each time the book is opened. pending is true while a one-shot is in flight, so a double click cannot
  // run two of them; toast is the one-line answer ChoiceScript sent back.
  var mode = "read", pending = false, toast = "", toastSide = "right";

  function esc(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function truthy(v) { return v === true || v === "true"; }
  function statsNow() { return window.stats || {}; }

  // Spells an Eldritch Invocation lets the warlock cast at will. They sit in no slot, so they are read off the inv_ flags
  // character_progression.txt sets. Kept in step with the same list in index.html's sidebar section.
  var INVOCATION_SPELLS = [
    { flag: "inv_armor_of_shadows", id: "mage_armor", desc: "Armor of Shadows: you can cast Mage Armor on yourself at will, without a spell slot. While you wear no armor, your base Armor Class is 13 + your Dexterity modifier." },
    { flag: "inv_fiendish_vigor", id: "false_life", desc: "Fiendish Vigor: you can cast False Life on yourself at will, without a spell slot." },
    { flag: "inv_mask_of_many_faces", id: "disguise_self", desc: "Mask of Many Faces: you can cast Disguise Self at will, without a spell slot." },
    { flag: "inv_otherworldly_leap", id: "jump", desc: "Otherworldly Leap: you can cast Jump on yourself without expending a spell slot." }
  ];

  // Spells that can be cast outside a fight, and the dossier label that does it (choicescript_stats.txt).
  var CASTABLE_OUT_OF_COMBAT = { mage_armor: "codex_cast_now_mage_armor", false_life: "codex_cast_now_false_life", guidance: "codex_cast_now_guidance" };

  function known() {
    var s = statsNow(), slots = window.SPELL_SLOTS || [], out = [], seen = {}, i;
    for (i = 0; i < slots.length; i++) {
      var id = String(s[slots[i]] || "");
      if (!id || id === "none" || seen[id]) continue;
      var meta = window.spellById && window.spellById(id);
      if (!meta) continue;                                  // no spell-data entry: not ours to show
      seen[id] = true;
      // Where it came from. An ITEM's spell is not the character's own working -- it is a slip clipped into the book, and the
      // panel marks it so, because it goes away with the item. (The Officer's Signet Ring's Guidance is the first of these.)
      out.push({ id: id, meta: meta, desc: String(s[slots[i] + "_desc"] || "").trim(),
        source: slots[i] === "item_cantrip" ? "item" : "own", prepared: truthy(s["prepared_" + id]) });
    }
    INVOCATION_SPELLS.forEach(function (g) {
      if (!truthy(s[g.flag]) || seen[g.id]) return;
      var meta = window.spellById && window.spellById(g.id);
      if (!meta) return;
      seen[g.id] = true;
      out.push({ id: g.id, meta: meta, desc: g.desc, source: "pact" });
    });
    return out;
  }

  // The button and the B key are offered only to a character who has some magic, so a fighter never meets an empty book.
  SB.available = function () { return known().length > 0; };

  function art(id, cls) {
    var uri = window.SPELL_ICONS && window.SPELL_ICONS[id];
    if (uri) return "<img class=\"" + cls + "\" src=\"" + uri + "\" alt=\"\">";
    var meta = window.spellById && window.spellById(id);
    var nm = (meta ? meta.name : id).replace(/[^A-Za-z ]/g, "");
    var ini = nm.split(/\s+/).map(function (w) { return w.charAt(0); }).join("").slice(0, 2).toUpperCase();
    return "<span class=\"sb-ini\" aria-hidden=\"true\">" + esc(ini || "?") + "</span>";
  }
  function levelWord(lvl) { return lvl === 0 ? "Cantrips" : "Level " + lvl; }

  // A spell the fight knows gets its range from the fight: tools/spell_catalog.json owns reach, gen_spells.js writes it to
  // window.SPELL_REACH, and this turns that class into the range tiers the combat log already calls them. Only a spell with no
  // combat reach (Self, Touch, an out-of-fight working) falls back to its own `range` in spell-data.js, so the book and the
  // battlefield can never disagree about how far a spell throws.
  var REACH_WORD = { touch: "Engaged only", short: "Close range", medium: "Mid-range", long: "Long range" };
  function rangeOf(meta) {
    var cls = (window.SPELL_REACH || {})[meta.id];
    return (cls && REACH_WORD[cls]) || meta.range || "";
  }

  // A class that prepares chooses a set each morning; every other class simply knows its spells, and the book never shows a box for them.
  // Cantrips are never carried: they are always ready, so they stay off the carried page entirely.
  function prepares() { return truthy(statsNow().class_prepares); }
  function carryMax() { return Number(statsNow().prepared_max) || 0; }
  function carriable(sp) { return sp.meta.level > 0 && sp.source === "own"; }

  // Ask ChoiceScript to carry a spell or put it back. Every rule lives in prepare_set; this only asks, and re-reads the answer.
  // quietRun runs the one-shot without turning the page behind the open book (the same route Craft, Use and the trade panel take).
  function setCarried(id, on) {
    if (pending || !prepares()) return;
    if (!window.GameQuietRun) { toast = "Preparation needs the game page open."; render(); return; }
    var s = statsNow();
    s.prepare_target_id = id;
    s.prepare_target_on = !!on;
    pending = true; toast = ""; toastSide = "right"; render();
    window.GameQuietRun("codex_prepare_now", function () {
      var st = statsNow();
      toast = String(st.spell_cast_toast || "");
      st.spell_cast_toast = "";
      pending = false;
      render();
    });
  }

  // THE LOOSE LEAVES: scrolls in the pack whose spell could be written into this character's book. An item is owned when has_<id> is
  // true (spare_<id> counts the rest), which is the game's own convention, so this needs nothing from inventory.js.
  // Everything here is DISPLAY: copy_spell re-checks the class list, the room in the book and the training banked before writing.
  function looseLeaves() {
    var s = statsNow(), scrolls = window.SPELL_SCROLLS || {}, lists = window.SPELL_LISTS || {}, levels = window.SPELL_LEVELS || {};
    if (!truthy(s.class_copies)) return [];
    var cls = String(s.character_class || ""), budget = Number(s.training_budget_left) || 0, out = [];
    Object.keys(scrolls).forEach(function (id) {
      if (!truthy(s["has_" + scrolls[id]])) return;                       // not carrying that scroll
      if ((lists[id] || []).indexOf(cls) < 0) return;                     // not a working this class can learn
      var meta = window.spellById && window.spellById(id);
      if (!meta) return;
      var cost = (levels[id] || 1) * (window.COPY_COST_PER_LEVEL || 10);
      var why = "";
      if (truthy(s["held_" + id])) why = "Already in your book";
      else if ((Number(s.book_room_left) || 0) < 1 && bookFull()) why = "Your book is full";
      else if (budget < cost) why = "Needs " + cost + " training, you have " + budget;
      out.push({ id: id, meta: meta, cost: cost, why: why });
    });
    return out;
  }
  // The book is full when every slot of this class holds something. book_room_left is only refreshed by the copying check, so the
  // panel works it out from the slots it can already see rather than trusting a stale number.
  function bookFull() {
    var s = statsNow(), cls = String(s.character_class || ""), free = 0;
    (window.BOOK_SLOTS || []).forEach(function (f) {
      if (f.indexOf(cls + "_spell") !== 0) return;
      var v = String(s[f] || "");
      if (!v || v === "none") free++;
    });
    return free < 1;
  }

  function copyLeaf(id) {
    if (pending) return;
    if (!window.GameQuietRun) { toast = "Copying needs the game page open."; toastSide = "left"; render(); return; }
    statsNow().copy_target_id = id;
    pending = true; toast = ""; toastSide = "left"; render();
    window.GameQuietRun("codex_copy_now", function () {
      var st = statsNow();
      toast = String(st.spell_cast_toast || "");
      st.spell_cast_toast = "";
      pending = false;
      render();
    });
  }

  function canOpenDossier() {
    var s = statsNow();
    if (s.scene && s.scene.secondaryMode === "stats") return false;
    return !truthy(s.combat_engaged) && typeof window.Scene === "function" && typeof window.clearScreen === "function" && !!window.nav;
  }

  /* ------------------------------------------------------------------ drawing */

  function render() {
    if (!dlg) return;
    var s = statsNow(), all = known();
    var byLevel = {}, i;
    tabLevels().forEach(function (l) { byLevel[l] = all.filter(function (sp) { return sp.meta.level === l; }); });
    // A tab that has nothing is dimmed, never hidden: the row keeps one shape, so it does not reflow as spells are learned.
    if (!byLevel[tab].length) {
      var lv = tabLevels();
      for (i = 0; i < lv.length; i++) if (byLevel[lv[i]].length) { tab = lv[i]; break; }
    }
    var shown = byLevel[tab] || [];
    if (picked && shown.every(function (sp) { return sp.id !== picked; })) picked = null;
    if (!picked && shown.length) picked = shown[0].id;
    var pick = null;
    for (i = 0; i < shown.length; i++) if (shown[i].id === picked) pick = shown[i];

    var orbs = window.SPELL_TAB_ORBS || {};
    var tabs = tabLevels().map(function (l) {
      var orb = orbs[l] ? "<img src=\"" + orbs[l] + "\" alt=\"\">" : "<span class=\"sb-tabword\">" + (l === 0 ? "C" : l) + "</span>";
      return "<button type=\"button\" class=\"sb-tab" + (byLevel[l].length ? "" : " sb-tabEmpty") + "\" data-tab=\"" + l + "\"" +
             " aria-pressed=\"" + (l === tab) + "\" title=\"" + esc(levelWord(l)) + "\" aria-label=\"" + esc(levelWord(l)) + "\">" +
             (l === 0 ? "<span class=\"sb-tabword\">Cant</span>" : orb) + "</button>";
    }).join("");

    var rows = shown.map(function (sp) {
      var drag = (prepares() && carriable(sp)) ? " draggable=\"true\" data-drag=\"" + esc(sp.id) + "\"" : "";
      var carryCls = (prepares() && carriable(sp)) ? (sp.prepared ? " sb-carried" : " sb-inbook") : "";
      return "<button type=\"button\" class=\"sb-row" + (sp.source === "item" ? " sb-clipped" : "") + carryCls + "\" data-spell=\"" + esc(sp.id) + "\"" + drag + " aria-pressed=\"" + (sp.id === picked) + "\">" +
             art(sp.id, "sb-rowart") +
             "<span class=\"sb-name\">" + esc(sp.meta.name) + "</span>" +
             "<span class=\"sb-leader\" aria-hidden=\"true\"></span>" +
             (sp.meta.schools ? "<span class=\"sb-school\">" + esc(sp.meta.schools) + "</span>" : "") +
             "</button>";
    }).join("");
    // The loose leaves sit under the written spells, on the left page: slips you carry, which you could write in.
    var leaves = looseLeaves();
    var leafHtml = "";
    if (leaves.length) {
      leafHtml = "<div class=\"sb-leaves\"><h4 class=\"sb-leafhead\">Loose leaves</h4>" +
        leaves.map(function (lf) {
          return "<div class=\"sb-leaf" + (lf.why ? " barred" : "") + "\">" +
                   art(lf.id, "sb-leafart") +
                   "<span class=\"sb-leafname\">" + esc(lf.meta.name) + "</span>" +
                   (lf.why
                     ? "<span class=\"sb-leafwhy\">" + esc(lf.why) + "</span>"
                     : "<button type=\"button\" class=\"sb-leafbtn\" data-copy=\"" + esc(lf.id) + "\"" + (pending ? " disabled" : "") +
                       ">Copy in \u00b7 " + lf.cost + "</button>") +
                 "</div>";
        }).join("") + "</div>";
    }

    var left = "<h3 class=\"sb-pagetitle\">" + esc(levelWord(tab)) + "</h3>" +
               (all.length === 0 ? "<div class=\"sb-empty\">This book is empty. You know no workings yet.</div>"
                : shown.length ? "<div class=\"sb-list\">" + rows + "</div>"
                : "<div class=\"sb-empty\">Nothing written at " + esc(levelWord(tab).toLowerCase()) + " yet.</div>") + leafHtml;

    // THE CARRIED PAGE: one box per spell that may be carried today, which is what prepared_max means, so the limit is seen rather than
    // explained. A spell is dragged from the facing page into a box, or clicked; a carried one is clicked to put it back.
    var right;
    if (mode === "carry" && prepares()) {
      var max = carryMax(), held = all.filter(carriable), carried = held.filter(function (sp) { return sp.prepared; });
      var boxes = "", bi;
      for (bi = 0; bi < max; bi++) {
        var inBox = carried[bi];
        boxes += inBox
          ? "<button type=\"button\" class=\"sb-box full\" data-uncarry=\"" + esc(inBox.id) + "\"" + (pending ? " disabled" : "") +
              " title=\"Put " + esc(inBox.meta.name) + " back in the book\">" + art(inBox.id, "sb-boxart") +
              "<span class=\"sb-boxname\">" + esc(inBox.meta.name) + "</span></button>"
          : "<div class=\"sb-box empty\" data-drop=\"1\"><span class=\"sb-boxhint\">empty</span></div>";
      }
      if (!max) boxes = "<div class=\"sb-empty\">You can carry nothing today.</div>";
      var spare = held.filter(function (sp) { return !sp.prepared; });
      right = "<h3 class=\"sb-pagetitle\">Carried today</h3>" +
              "<div class=\"sb-carrycount\">" + carried.length + " of " + max + "</div>" +
              "<div class=\"sb-boxes\">" + boxes + "</div>" +
              (spare.length
                ? "<div class=\"sb-carryhint\">Still in the book: " +
                    spare.map(function (sp) {
                      return "<button type=\"button\" class=\"sb-spare\" data-carry=\"" + esc(sp.id) + "\"" + (pending ? " disabled" : "") +
                             ">" + esc(sp.meta.name) + "</button>";
                    }).join(" ") + "</div>"
                : "<div class=\"sb-carryhint\">Everything in your book is with you.</div>");
    } else if (!pick) {
      right = "<div class=\"sb-empty\">Choose a working from the facing page to read it.</div>";
    } else {
      // Many of the game's _desc fields already open with the spell's own name, so repeating it as a heading would read twice.
      // Many of the game's _desc fields open with the spell's own name, which the heading already says. Some are only the name plus
      // a parenthetical tag ("Disguise Self (Innate Hag Illusion)"); stripping the name leaves bare brackets, so unwrap those too.
      var body = pick.desc || pick.meta.name;
      if (body.indexOf(pick.meta.name) === 0) body = body.slice(pick.meta.name.length).replace(/^[\s.—:-]+/, "");
      if (/^\([^()]*\)$/.test(body)) body = body.slice(1, -1);
      // "Thaumaturgy -- small, innate parlor tricks..." loses its capital when the name comes off, so the sentence gets one back.
      if (body) body = body.charAt(0).toUpperCase() + body.slice(1);
      var castLabel = CASTABLE_OUT_OF_COMBAT[pick.id], castBtn = "";
      if (castLabel) {
        var can = canOpenDossier();
        castBtn = "<button type=\"button\" class=\"sb-cast\" data-cast=\"" + esc(castLabel) + "\"" + (can ? "" : " disabled") + ">" +
                  (can ? "Cast…" : (truthy(s.combat_engaged) ? "Not from here, in a fight" : "Close the dossier to cast")) + "</button>";
      }
      // The reference block. Each line is dropped when the entry has nothing for it, so a spell that has not been written up yet
      // reads as a shorter entry rather than a row of blanks.
      var facts = [["Casting", pick.meta.time], ["Range", rangeOf(pick.meta)], ["Components", pick.meta.components], ["Duration", pick.meta.duration]];
      var block = facts.filter(function (f) { return f[1]; }).map(function (f) {
        return "<div class=\"sb-fact\"><dt>" + esc(f[0]) + "</dt><dd>" + esc(f[1]) + "</dd></div>";
      }).join("");
      // The written entry is preferred over the one-line _desc stat: it is the one that fills a page.
      var prose = pick.meta.text || body || pick.meta.name;
      // A spell that is not the character's own says so, under the entry: it is the item's, and it leaves with the item.
      var origin = pick.source === "item" ? "<div class=\"sb-origin sb-clipped\">Clipped in, not written: this working is the item's, and goes with it.</div>"
                 : pick.source === "pact" ? "<div class=\"sb-origin\">Granted by your pact. It costs you no spell slot.</div>" : "";
      right = "<div class=\"sb-read" + (pick.source === "item" ? " sb-readClipped" : "") + "\">" + art(pick.id, "sb-art") +
                "<h3>" + esc(pick.meta.name) + "</h3>" +
                "<div class=\"sb-meta\">" + esc(levelWord(pick.meta.level)) + (pick.meta.schools ? " · " + esc(pick.meta.schools) : "") + "</div>" +
                (block ? "<dl class=\"sb-facts\">" + block + "</dl>" : "") +
                "<div class=\"sb-body\">" + esc(prose) + "</div>" + origin + castBtn +
              "</div>";
    }
    if (all.length && truthy(s.spells_blocked)) {
      right += "<div class=\"sb-note sb-blocked\">" + esc(String(s.spells_blocked_why || "")) + " Scrolls and what an item grants still work.</div>";
    }

    var who = [s.name, s.class_name].filter(Boolean).join(" · ");

    // PAGE FURNITURE. The foot of each leaf, outside the scrolling sheet so it stays put while the page is read: the left
    // carries the running head (whose book this is, and how much is in it), the right the folio line (which leaf of which
    // level is open), with the wax seal closing the outer corner. It is the bottom third of the spread, which was bare.
    var owner = String(s.name || "").trim();
    var leftFoot = "<div class=\"sb-foot\"><span class=\"sb-runhead\">" +
                     esc(owner ? owner + "'s book" : "A book of workings") + "</span>" +
                     "<span class=\"sb-folio\">" + all.length + (all.length === 1 ? " working" : " workings") + "</span></div>";
    // The folio line says where you are on whichever page the right leaf is showing: an entry within a level, or the carried set.
    var place = pick ? (shown.indexOf(pick) + 1) : 0;
    var carryMode = (mode === "carry" && prepares());
    var footHead = carryMode ? "Carried today" : levelWord(tab);
    var footFolio = carryMode
      ? (all.filter(function (sp) { return carriable(sp) && sp.prepared; }).length + " of " + carryMax())
      : (place ? place + " of " + shown.length : "");
    var rightFoot = "<div class=\"sb-foot\"><span class=\"sb-runhead\">" + esc(footHead) + "</span>" +
                      (footFolio ? "<span class=\"sb-folio\">" + esc(footFolio) + "</span>" : "") +
                    "</div><div class=\"sb-seal\" aria-hidden=\"true\"></div>";

    // The ribbon only appears for a class that prepares; for everyone else the right page is always the reading.
    var ribbon = prepares()
      ? "<div class=\"sb-ribbon\">" +
          "<button type=\"button\" class=\"sb-rib\" data-mode=\"read\" aria-pressed=\"" + (mode !== "carry") + "\">The entry</button>" +
          "<button type=\"button\" class=\"sb-rib\" data-mode=\"carry\" aria-pressed=\"" + (mode === "carry") + "\">Carried (" +
            all.filter(function (sp) { return carriable(sp) && sp.prepared; }).length + "/" + carryMax() + ")</button>" +
        "</div>"
      : "";
    if (toast) {
      if (toastSide === "left") left += "<div class=\"sb-toast\">" + esc(toast) + "</div>";
      else right += "<div class=\"sb-toast\">" + esc(toast) + "</div>";
    }

    dlg.innerHTML =
      "<div class=\"sb-head\"><h2>Spellbook</h2><span class=\"sb-who\">" + esc(who) + "</span>" +
        "<span class=\"sb-spacer\"></span><button type=\"button\" class=\"sb-close\" data-close=\"1\" title=\"Close (Esc)\">×</button></div>" +
      "<div class=\"sb-board\"><div class=\"sb-book\">" +
        "<div class=\"sb-page left\"><div class=\"sb-sheet\">" + left + "</div>" + leftFoot + "</div>" +
        "<div class=\"sb-page right\"><div class=\"sb-sheet\">" + ribbon + right + "</div>" + rightFoot + "</div>" +
        "<div class=\"sb-tabs\">" + tabs + "</div>" +
      "</div></div>";
  }

  /* ------------------------------------------------------------------ the panel */

  function build() {
    dlg = document.createElement("dialog");
    dlg.id = "spellBook";
    document.body.appendChild(dlg);
    // Delegated, because render() replaces everything inside on every click.
    dlg.addEventListener("click", function (ev) {
      var el = ev.target && ev.target.closest
        ? ev.target.closest("[data-tab],[data-spell],[data-cast],[data-close],[data-mode],[data-carry],[data-uncarry],[data-copy]") : null;
      if (!el) return;
      if (el.getAttribute("data-close")) { close(); return; }
      if (el.hasAttribute("data-tab")) { tab = Number(el.getAttribute("data-tab")); picked = null; render(); return; }
      if (el.hasAttribute("data-mode")) { mode = el.getAttribute("data-mode"); toast = ""; render(); return; }
      if (el.hasAttribute("data-copy")) { copyLeaf(el.getAttribute("data-copy")); return; }
      if (el.hasAttribute("data-carry")) { setCarried(el.getAttribute("data-carry"), true); return; }
      if (el.hasAttribute("data-uncarry")) { setCarried(el.getAttribute("data-uncarry"), false); return; }
      if (el.hasAttribute("data-spell")) {
        // While the carried page is open a click on the book carries that spell, which is the no-drag way to do it.
        if (mode === "carry" && prepares()) { setCarried(el.getAttribute("data-spell"), true); return; }
        picked = el.getAttribute("data-spell"); render(); return;
      }
      if (el.hasAttribute("data-cast")) {
        var label = el.getAttribute("data-cast");
        close();
        if (window.OpenDossierAt) window.OpenDossierAt(label);
      }
    });
    dlg.addEventListener("close", function () { mode = "read"; toast = ""; });

    // DRAG AND DROP a spell from the book into a box for the day. Click does the same thing everywhere (a box puts its spell back, a
    // row carries it), because dragging is no good on a touch screen or from a keyboard -- this is the quicker way, not the only way.
    dlg.addEventListener("dragstart", function (ev) {
      var row = ev.target && ev.target.closest ? ev.target.closest("[data-drag]") : null;
      if (!row) return;
      try { ev.dataTransfer.setData("text/plain", row.getAttribute("data-drag")); ev.dataTransfer.effectAllowed = "copy"; } catch (e) {}
    });
    dlg.addEventListener("dragover", function (ev) {
      var box = ev.target && ev.target.closest ? ev.target.closest("[data-drop]") : null;
      if (!box) return;
      ev.preventDefault();
      try { ev.dataTransfer.dropEffect = "copy"; } catch (e) {}
      box.classList.add("over");
    });
    dlg.addEventListener("dragleave", function (ev) {
      var box = ev.target && ev.target.closest ? ev.target.closest("[data-drop]") : null;
      if (box) box.classList.remove("over");
    });
    dlg.addEventListener("drop", function (ev) {
      var box = ev.target && ev.target.closest ? ev.target.closest("[data-drop]") : null;
      if (!box) return;
      ev.preventDefault();
      box.classList.remove("over");
      var id = "";
      try { id = ev.dataTransfer.getData("text/plain"); } catch (e) {}
      if (id) setCarried(id, true);
    });
  }

  function open() {
    if (!SB.available()) return;
    if (!dlg) build();
    mode = "read";
    toast = "";
    render();
    if (!dlg.showModal) { window.alert("This browser is too old to show the spellbook."); return; }
    if (!dlg.open) dlg.showModal();
  }
  function close() { if (dlg && dlg.open) dlg.close(); }
  function toggle() { if (dlg && dlg.open) close(); else open(); }

  SB.open = open; SB.close = close; SB.toggle = toggle;
  SB.known = known;              // the browser probes read this

  // B opens the book, the way L opens the lorebook. It never steals a keystroke from text entry, another open panel, or a fight.
  document.addEventListener("keydown", function (ev) {
    if ((ev.key !== "b" && ev.key !== "B") || ev.ctrlKey || ev.metaKey || ev.altKey || ev.repeat) return;
    var t = ev.target, tag = t && t.tagName ? t.tagName.toLowerCase() : "";
    if (tag === "input" || tag === "textarea" || tag === "select" || (t && t.isContentEditable)) return;
    if (document.querySelector("dialog[open]")) return;
    if (!SB.available()) return;
    ev.preventDefault();
    open();
  });
})();
