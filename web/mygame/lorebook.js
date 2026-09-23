/*
 * LOREBOOK PANEL -- a searchable, filterable lore reader that replaces the old
 * click-through codex menus. Reads its entries from lorebook-data.js and the live
 * game state from window.stats (the same object the stat sidebar reads), so an entry
 * appears the moment the player earns its unlock variable.
 *
 * Nothing here touches game state or save files. The only thing stored is which
 * entries the player has already opened (localStorage, key "lorebook_seen_v1"), so
 * the NEW badges survive a page reload/resume. That store is reset by resetSeen(),
 * called from web/util.js's restoreGame() only on a genuine new game/"Start Over"
 * (not a resume), so a fresh playthrough sees NEW badges again.
 *
 * Open with the Lorebook button or the L key (search is focused on open). Inside the panel,
 * "/" jumps back to search. "/" is not bound globally because the game already uses it
 * (and "?") to show its keyboard-shortcut list.
 * Tests can use window.LoreBook.core, which has no DOM dependency.
 */
(function () {
  "use strict";

  var LB = window.LoreBook = window.LoreBook || {};
  var SEEN_KEY = "lorebook_seen_v1";

  /* ------------------------------------------------------------------ helpers */

  function truthy(v) { return v === true || v === "true"; }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  // Lower-case, strip tags and accents so "Dredge-End" and "dredge end" both match.
  function fold(s) {
    var t = String(s == null ? "" : s).toLowerCase().replace(/<[^>]*>/g, " ");
    if (t.normalize) t = t.normalize("NFD").replace(/[̀-ͯ]/g, "");
    return t.replace(/[-‐-―]/g, " ");
  }

  /* -------------------------------------------------------------------- core */

  var core = LB.core = {};
  core.truthy = truthy;
  core.fold = fold;

  core.data = function () { return window.LOREBOOK || { categories: [], entries: [] }; };

  core.isUnlocked = function (entry, s) {
    var u = entry.unlock;
    s = s || {};
    if (u === undefined || u === null) return true;
    if (typeof u === "function") return !!u(s);
    if (typeof u === "string") return truthy(s[u]);
    if (Array.isArray(u)) return u.some(function (k) { return truthy(s[k]); });
    return true;
  };

  function fill(str, s) {
    return String(str == null ? "" : str).replace(/\{\{(\w+)\}\}/g, function (m, k) {
      return s[k] === undefined || s[k] === null ? "" : esc(s[k]);
    });
  }

  function evalField(v, s) { return typeof v === "function" ? v(s) : v; }

  // Turns an entry into plain, ready-to-render values for the current game state.
  core.resolve = function (entry, s) {
    s = s || {};
    var body = evalField(entry.body, s);
    var paras = Array.isArray(body) ? body : [body];
    var html = paras.filter(function (p) { return p; }).map(function (p) {
      return "<p>" + fill(p, s) + "</p>";
    }).join("");
    var meter = evalField(entry.meter, s);
    var meterValue = null;
    if (meter && meter.stat) {
      var n = Number(s[meter.stat]);
      meterValue = isNaN(n) ? 0 : Math.max(0, Math.min(100, Math.round(n)));
    }
    var sub = fill(evalField(entry.sub, s) || "", s);
    var role = evalField(entry.role, s);
    return {
      id: entry.id,
      category: entry.category,
      title: fill(evalField(entry.title, s), s),
      sub: sub,
      role: role === undefined ? sub : fill(role, s),
      tags: entry.tags || [],
      aliases: entry.aliases || [],
      html: html,
      meter: meter && meter.stat ? { label: meter.label || "", value: meterValue } : null,
      see: entry.see || []
    };
  };

  core.unlocked = function (s) {
    var out = [];
    core.data().entries.forEach(function (e) {
      if (core.isUnlocked(e, s)) out.push(core.resolve(e, s));
    });
    return out;
  };

  // Higher score = better match. Every search word must be found somewhere.
  core.score = function (r, query) {
    var words = fold(query).split(/\s+/).filter(Boolean);
    if (!words.length) return 1;
    var title = fold(r.title), aliases = fold(r.aliases.join(" | ")), tags = fold(r.tags.join(" | "));
    var sub = fold(r.sub + " " + r.role), body = fold(r.html);
    var total = 0;
    for (var i = 0; i < words.length; i++) {
      var w = words[i], best = 0;
      if (title.indexOf(w) === 0) best = 100;
      else if (title.indexOf(" " + w) !== -1) best = 80;
      else if (title.indexOf(w) !== -1) best = 60;
      else if (aliases.indexOf(w) !== -1) best = 50;
      else if (tags.indexOf(w) !== -1) best = 30;
      else if (sub.indexOf(w) !== -1) best = 20;
      else if (body.indexOf(w) !== -1) best = 5;
      if (!best) return 0;
      total += best;
    }
    return total;
  };

  // Applies category, tag and search filters to the unlocked entries.
  core.filter = function (list, opts) {
    opts = opts || {};
    var q = opts.query || "";
    var out = [];
    list.forEach(function (r) {
      if (opts.category && r.category !== opts.category) return;
      if (opts.tag && r.tags.indexOf(opts.tag) === -1) return;
      var sc = core.score(r, q);
      if (!sc) return;
      out.push({ r: r, score: sc });
    });
    // With a search, best match first. Without one, keep each category together (in the
    // order the data file lists them) and sort by title inside it, so the list groups cleanly.
    var order = {};
    core.data().categories.forEach(function (c, i) { order[c.id] = i; });
    out.sort(function (a, b) {
      if (q) return b.score - a.score || (a.r.title < b.r.title ? -1 : 1);
      var ca = order[a.r.category] === undefined ? 99 : order[a.r.category];
      var cb = order[b.r.category] === undefined ? 99 : order[b.r.category];
      if (ca !== cb) return ca - cb;
      return a.r.title < b.r.title ? -1 : (a.r.title > b.r.title ? 1 : 0);
    });
    return out.map(function (x) { return x.r; });
  };

  /* ---------------------------------------------------------------- story links */

  function escRe(t) { return t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

  // Builds the phrase table for the entries unlocked right now. Longest phrase first, so
  // "Baron Karr" wins over "Karr" and "Port Valen Watch" wins over "Port Valen".
  core.linkTable = function (s) {
    var terms = [], map = {}, titles = {};
    s = s || {};
    core.data().entries.forEach(function (e) {
      if (!e.link || !core.isUnlocked(e, s)) return;
      titles[e.id] = fill(evalField(e.title, s), s).replace(/<[^>]*>/g, "");
      e.link.forEach(function (t) {
        if (t && !map.hasOwnProperty(t)) { map[t] = e.id; terms.push(t); }
      });
    });
    terms.sort(function (a, b) { return b.length - a.length || (a < b ? -1 : 1); });
    var re = terms.length
      ? new RegExp("(^|[^A-Za-z0-9_])(" + terms.map(escRe).join("|") + ")(?![A-Za-z0-9_])", "g")
      : null;
    return { re: re, map: map, titles: titles, sig: terms.join("|") };
  };

  // Splits one piece of text into [{text}] and [{text, id}] parts. Each entry is linked at
  // most once: `linked` holds the ids already linked on this page and is updated in place.
  core.segment = function (text, table, linked) {
    if (!table.re) return [{ text: text }];
    var out = [], last = 0, m;
    table.re.lastIndex = 0;
    while ((m = table.re.exec(text)) !== null) {
      var id = table.map[m[2]];
      if (linked[id]) continue;
      linked[id] = true;
      var start = m.index + m[1].length;
      if (start > last) out.push({ text: text.slice(last, start) });
      out.push({ text: m[2], id: id });
      last = start + m[2].length;
    }
    if (last < text.length) out.push({ text: text.slice(last) });
    return out.length ? out : [{ text: text }];
  };

  /* ----------------------------------------------------------------- seen store */

  function loadSeen() {
    try { return JSON.parse(localStorage.getItem(SEEN_KEY) || "{}") || {}; } catch (e) { return {}; }
  }
  function saveSeen(o) {
    try { localStorage.setItem(SEEN_KEY, JSON.stringify(o)); } catch (e) { /* private mode etc. */ }
  }
  var seen = loadSeen();
  function markSeen(id) {
    if (seen[id]) return;
    seen[id] = 1;
    saveSeen(seen);
  }
  core.unseenCount = function (s) {
    return core.unlocked(s).filter(function (r) { return !seen[r.id]; }).length;
  };

  // Called on a genuine new game (see restoreGame() in web/util.js), not on every
  // reload/resume -- that would spam NEW badges throughout an existing playthrough.
  core.resetSeen = LB.resetSeen = function () {
    seen = {};
    saveSeen(seen);
  };

  /* ---------------------------------------------------------------------- DOM */

  if (typeof document === "undefined") return; // node tests stop here

  var dlg, elSearch, elClear, elChips, elActiveTag, elList, elRead, elBody, elCount, elMarkRead;
  var view = { query: "", category: "", tag: "", selected: "", history: [] };
  var current = [];   // unlocked entries for the state at last render
  var shown = [];     // entries currently in the list, in order

  function statsNow() { return window.stats || {}; }

  function build() {
    if (dlg) return;
    dlg = document.createElement("dialog");
    dlg.id = "lorebook";
    dlg.setAttribute("aria-label", "Lorebook");
    dlg.innerHTML =
      '<div class="lb-head">' +
        '<h2>Lorebook</h2><span class="lb-count"></span><span class="lb-spacer"></span>' +
        '<button type="button" class="lb-textbtn" data-act="links" title="Turn clickable lore names in the story text on or off">Story links: On</button>' +
        '<button type="button" class="lb-textbtn" data-act="markread"><span class="lb-long">Mark all read</span><span class="lb-short">All read</span></button>' +
        '<button type="button" class="lb-close" data-act="close" aria-label="Close lorebook">×</button>' +
      '</div>' +
      '<div class="lb-body" data-view="list">' +
        '<aside class="lb-nav">' +
          '<div class="lb-search">' +
            '<input type="text" id="lbSearch" placeholder="Search names, places, ideas…" ' +
              'autocomplete="off" spellcheck="false" aria-label="Search the lorebook">' +
            '<button type="button" class="lb-clear" data-act="clear" aria-label="Clear search" hidden>×</button>' +
          '</div>' +
          '<div class="lb-chips"></div>' +
          '<div class="lb-activetag" hidden></div>' +
          '<div class="lb-list" role="listbox" aria-label="Lorebook entries"></div>' +
        '</aside>' +
        '<section class="lb-read" aria-live="polite"></section>' +
      '</div>';
    document.body.appendChild(dlg);

    elSearch = dlg.querySelector("#lbSearch");
    elClear = dlg.querySelector(".lb-clear");
    elChips = dlg.querySelector(".lb-chips");
    elActiveTag = dlg.querySelector(".lb-activetag");
    elList = dlg.querySelector(".lb-list");
    elRead = dlg.querySelector(".lb-read");
    elBody = dlg.querySelector(".lb-body");
    elCount = dlg.querySelector(".lb-count");
    elMarkRead = dlg.querySelector('[data-act="markread"]');

    elSearch.addEventListener("input", function () {
      view.query = elSearch.value;
      renderList(true);
    });

    dlg.addEventListener("click", onClick);
    dlg.addEventListener("keydown", onKeydown);
    dlg.addEventListener("keyup", function (ev) { ev.stopPropagation(); });
    // Clicking the dimmed backdrop closes the panel.
    dlg.addEventListener("mousedown", function (ev) { if (ev.target === dlg) close(); });
    dlg.addEventListener("close", refreshBadge);
  }

  function categoryLabel(id) {
    var cats = core.data().categories;
    for (var i = 0; i < cats.length; i++) if (cats[i].id === id) return cats[i].label;
    return id;
  }

  function renderChips() {
    var cats = core.data().categories;
    var counts = {};
    current.forEach(function (r) { counts[r.category] = (counts[r.category] || 0) + 1; });
    var html = '<button type="button" class="lb-chip" data-cat="" aria-pressed="' + (!view.category) + '">All<small>' + current.length + '</small></button>';
    cats.forEach(function (c) {
      if (!counts[c.id]) return;
      html += '<button type="button" class="lb-chip" data-cat="' + esc(c.id) + '" aria-pressed="' + (view.category === c.id) + '">' +
        esc(c.label) + '<small>' + counts[c.id] + '</small></button>';
    });
    elChips.innerHTML = html;
  }

  function renderList(resetSelection) {
    var s = statsNow();
    current = core.unlocked(s);
    var total = core.data().entries.length;
    refreshLinksButton();
    elCount.innerHTML = '<span class="lb-count-full">' + current.length + ' of ' + total + ' discovered</span>' +
      '<span class="lb-count-short">' + current.length + '/' + total + '</span>';
    var unseen = current.filter(function (r) { return !seen[r.id]; }).length;
    elMarkRead.disabled = unseen === 0;

    renderChips();
    elClear.hidden = !view.query;
    if (view.tag) {
      elActiveTag.hidden = false;
      elActiveTag.innerHTML = '<span>Tag: <b>' + esc(view.tag) + '</b></span>' +
        '<button type="button" data-act="cleartag" aria-label="Remove tag filter">×</button>';
    } else {
      elActiveTag.hidden = true;
    }

    shown = core.filter(current, { query: view.query, category: view.category, tag: view.tag });
    var html = "";
    if (!current.length) {
      html = '<div class="lb-empty">Nothing discovered yet. Entries appear here as you meet people and reach places.</div>';
    } else if (!shown.length) {
      html = '<div class="lb-empty">No entries match.</div>';
    } else {
      var lastCat = null;
      shown.forEach(function (r) {
        if (!view.query && !view.category && r.category !== lastCat) {
          lastCat = r.category;
          html += '<div class="lb-group">' + esc(categoryLabel(r.category)) + '</div>';
        }
        html += '<button type="button" class="lb-item" role="option" data-id="' + esc(r.id) + '" aria-selected="' + (r.id === view.selected) + '">' +
          '<span class="lb-item-title">' + esc(r.title) + '</span>' +
          (seen[r.id] ? "" : '<span class="lb-new">NEW</span>') +
          '<span class="lb-item-sub">' + esc(r.sub) + '</span></button>';
      });
    }
    elList.innerHTML = html;

    if (resetSelection && shown.length && view.query) {
      // While typing, keep the reader on the best match.
      select(shown[0].id, { keepView: true, noHistory: true, silent: true });
    } else if (view.selected && !shown.some(function (r) { return r.id === view.selected; })) {
      // The selected entry is filtered out of the list; keep it open in the reader.
    }
  }

  function linkify(html, s) {
    return html.replace(/\[\[([\w-]+)(?:\|([^\]]+))?\]\]/g, function (m, id, label) {
      var hit = current.filter(function (r) { return r.id === id; })[0];
      if (!hit) return esc(label || "");
      return '<a data-id="' + esc(id) + '">' + esc(label || hit.title) + '</a>';
    });
  }

  function renderReader() {
    var r = current.filter(function (x) { return x.id === view.selected; })[0];
    if (!r) {
      elRead.innerHTML =
        '<div class="lb-read-inner"><div class="lb-crumbs"><button type="button" class="lb-mobile-only" data-act="tolist">‹ All entries</button></div>' +
        '<div class="lb-welcome"><p><b>The Lorebook</b> collects what your character has learned.</p>' +
        '<p>Type in the search box to find a name, place or idea, pick a filter, or choose an entry from the list.</p>' +
        '<p><kbd>L</kbd> opens and closes this panel. <kbd>/</kbd> jumps to search. <kbd>↑</kbd> <kbd>↓</kbd> move through the list.</p></div></div>';
      return;
    }
    var html = '<div class="lb-read-inner">';
    html += '<div class="lb-crumbs">' +
      '<button type="button" class="lb-mobile-only" data-act="tolist">‹ All entries</button>' +
      (view.history.length ? '<button type="button" data-act="back">‹ Back</button>' : "") + '</div>';
    html += '<div class="lb-cat">' + esc(categoryLabel(r.category)) + '</div>';
    html += '<h3>' + esc(r.title) + '</h3>';
    if (r.role) html += '<div class="lb-role">' + esc(r.role) + '</div>';
    if (r.tags.length) {
      html += '<div class="lb-tags">' + r.tags.map(function (t) {
        return '<button type="button" class="lb-tag" data-tag="' + esc(t) + '">' + esc(t) + '</button>';
      }).join("") + '</div>';
    }
    if (r.meter) {
      html += '<div class="lb-meter"><div class="lb-meter-row"><span>' + esc(r.meter.label) + '</span><b>' + r.meter.value + '%</b></div>' +
        '<div class="lb-meter-bar"><i style="width:' + r.meter.value + '%"></i></div></div>';
    }
    html += '<div class="lb-text">' + linkify(r.html, statsNow()) + '</div>';
    var links = r.see.map(function (id) {
      return current.filter(function (x) { return x.id === id; })[0];
    }).filter(Boolean);
    if (links.length) {
      html += '<div class="lb-see"><h4>See also</h4><div class="lb-see-list">' + links.map(function (x) {
        return '<button type="button" data-id="' + esc(x.id) + '">' + esc(x.title) + '</button>';
      }).join("") + '</div></div>';
    }
    html += '</div>';
    elRead.innerHTML = html;
    elRead.scrollTop = 0;
  }

  function select(id, opts) {
    opts = opts || {};
    if (view.selected && view.selected !== id && !opts.noHistory) {
      view.history.push(view.selected);
      if (view.history.length > 30) view.history.shift();
    }
    view.selected = id;
    if (!opts.silent) markSeen(id);
    renderReader();
    // Refresh the highlight and NEW tag without rebuilding the whole list.
    var items = elList.querySelectorAll(".lb-item");
    for (var i = 0; i < items.length; i++) {
      var on = items[i].getAttribute("data-id") === id;
      items[i].setAttribute("aria-selected", on ? "true" : "false");
      if (on) {
        var tag = items[i].querySelector(".lb-new");
        if (tag && !opts.silent) tag.parentNode.removeChild(tag);
        if (items[i].scrollIntoView && !opts.keepView) items[i].scrollIntoView({ block: "nearest" });
      }
    }
    elMarkRead.disabled = core.unseenCount(statsNow()) === 0;
    if (!opts.keepView) elBody.setAttribute("data-view", "reader");
    refreshBadge();
  }

  /* ------------------------------------------------------------------- events */

  function onClick(ev) {
    var t = ev.target;
    while (t && t !== dlg && !(t.getAttribute && (t.getAttribute("data-act") || t.getAttribute("data-id") ||
      t.hasAttribute("data-cat") || t.getAttribute("data-tag")))) t = t.parentNode;
    if (!t || t === dlg) return;

    var act = t.getAttribute("data-act");
    if (act === "close") return close();
    if (act === "links") { LB.setLinks(!linksOn()); return; }
    if (act === "markread") {
      current.forEach(function (r) { seen[r.id] = 1; });
      saveSeen(seen);
      renderList(false);
      refreshBadge();
      return;
    }
    if (act === "clear") { view.query = ""; elSearch.value = ""; renderList(false); elSearch.focus(); return; }
    if (act === "cleartag") { view.tag = ""; renderList(false); return; }
    if (act === "tolist") { elBody.setAttribute("data-view", "list"); return; }
    if (act === "back") {
      var prev = view.history.pop();
      if (prev) select(prev, { noHistory: true });
      return;
    }
    if (t.hasAttribute("data-cat")) {
      view.category = t.getAttribute("data-cat");
      renderList(false);
      return;
    }
    if (t.getAttribute("data-tag")) {
      view.tag = t.getAttribute("data-tag");
      view.category = "";
      renderList(false);
      elBody.setAttribute("data-view", "list");
      return;
    }
    var id = t.getAttribute("data-id");
    if (id) {
      ev.preventDefault();
      // Following a link from the reader may target an entry the filters hide.
      if (!shown.some(function (r) { return r.id === id; })) {
        view.query = ""; elSearch.value = ""; view.category = ""; view.tag = "";
        renderList(false);
      }
      select(id);
    }
  }

  function moveSelection(delta) {
    if (!shown.length) return;
    var idx = -1;
    for (var i = 0; i < shown.length; i++) if (shown[i].id === view.selected) idx = i;
    var next = idx === -1 ? (delta > 0 ? 0 : shown.length - 1) : Math.max(0, Math.min(shown.length - 1, idx + delta));
    select(shown[next].id, { noHistory: true });
    var el = elList.querySelector('.lb-item[aria-selected="true"]');
    if (el) el.focus({ preventScroll: true });
  }

  function onKeydown(ev) {
    // The game listens for J, K, Q, W and digits on the whole document. Keep those keys
    // inside the panel so typing a search never turns a page or opens the stats screen.
    ev.stopPropagation();
    var typing = ev.target === elSearch;
    if (ev.key === "Escape" && typing && elSearch.value) {
      ev.preventDefault();
      view.query = ""; elSearch.value = "";
      renderList(false);
      return;
    }
    if ((ev.key === "ArrowDown" || ev.key === "ArrowUp") && !ev.altKey && !ev.ctrlKey && !ev.metaKey) {
      var inReader = elRead.contains(ev.target) && ev.target !== elRead;
      if (inReader && ev.target.tagName !== "BUTTON") return; // let the reader scroll
      ev.preventDefault();
      moveSelection(ev.key === "ArrowDown" ? 1 : -1);
      return;
    }
    if (ev.key === "/" && !typing) {
      ev.preventDefault();
      elBody.setAttribute("data-view", "list");
      elSearch.focus();
      elSearch.select();
      return;
    }
    if ((ev.key === "l" || ev.key === "L") && !typing && !ev.ctrlKey && !ev.metaKey && !ev.altKey) {
      ev.preventDefault();
      close();
    }
  }

  /* -------------------------------------------------------------- open / close */

  function open(id) {
    build();
    if (dlg.open) { if (id) select(id); return; }
    view.query = ""; view.tag = ""; view.history = [];
    elSearch.value = "";
    renderList(false);
    elBody.setAttribute("data-view", "list");
    if (!dlg.showModal) { window.alert("This browser is too old to show the Lorebook."); return; }
    // Body text uses the game's own book font (including the OpenDyslexic option).
    dlg.style.setProperty("--lb-reader-font", window.getComputedStyle(document.body).fontFamily);
    dlg.showModal();
    if (id) {
      view.category = "";
      select(id);
    } else if (view.selected && current.some(function (r) { return r.id === view.selected; })) {
      renderReader();
    } else {
      view.selected = "";
      renderReader();
    }
    // Keep the search box unfocused on touch screens so the keyboard does not cover the list.
    if (window.matchMedia && window.matchMedia("(pointer: coarse)").matches) {
      if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    } else {
      elSearch.focus();
    }
  }

  function close() { if (dlg && dlg.open) dlg.close(); }
  function toggle() { if (dlg && dlg.open) close(); else open(); }

  LB.open = open;
  LB.close = close;
  LB.toggle = toggle;

  /* ------------------------------------------------------------- button badge */

  function refreshBadge() {
    var btn = document.getElementById("lorebookButton");
    if (!btn) return;
    var n = core.unseenCount(statsNow());
    var badge = btn.querySelector(".lb-badge");
    if (n > 0) {
      if (!badge) {
        badge = document.createElement("span");
        badge.className = "lb-badge";
        btn.appendChild(badge);
      }
      if (badge.textContent !== String(n)) badge.textContent = n;
      btn.title = n + " new lorebook " + (n === 1 ? "entry" : "entries");
    } else if (badge) {
      btn.removeChild(badge);
      btn.removeAttribute("title");
    }
  }

  /* ------------------------------------------------------- story links (DOM side) */

  var LINKS_KEY = "lorebook_links_v1"; // stores "off" when the player turns links off
  var linkTimer = null;

  function linksOn() {
    try { return localStorage.getItem(LINKS_KEY) !== "off"; } catch (e) { return true; }
  }
  function setLinksOn(on) {
    try { localStorage.setItem(LINKS_KEY, on ? "on" : "off"); } catch (e) { /* ignore */ }
  }

  function linkTextNodes(p) {
    var walker = document.createTreeWalker(p, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        if (!n.nodeValue || !/\S/.test(n.nodeValue)) return NodeFilter.FILTER_REJECT;
        // Never link inside existing links, bold status banners, or controls.
        for (var a = n.parentNode; a && a !== p; a = a.parentNode) {
          var name = a.nodeName;
          if (name === "A" || name === "B" || name === "STRONG" || name === "BUTTON" || name === "LABEL" ||
              name === "INPUT" || name === "SELECT" || name === "TEXTAREA") return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var nodes = [], n;
    while ((n = walker.nextNode())) nodes.push(n);
    return nodes;
  }

  function linkPass() {
    var host = document.getElementById("text");
    if (!host || !linksOn()) return;
    var table = core.linkTable(statsNow());
    var linked = {};
    var existing = host.querySelectorAll("a.lb-story");
    for (var i = 0; i < existing.length; i++) linked[existing[i].getAttribute("data-lore")] = true;

    for (var c = host.firstChild; c; c = c.nextSibling) {
      if (c.nodeName !== "P" || c._lbSig === table.sig) continue;
      c._lbSig = table.sig;
      linkTextNodes(c).forEach(function (node) {
        var parts = core.segment(node.nodeValue, table, linked);
        if (parts.length === 1 && !parts[0].id) return;
        var frag = document.createDocumentFragment();
        parts.forEach(function (part) {
          if (!part.id) { frag.appendChild(document.createTextNode(part.text)); return; }
          var a = document.createElement("a");
          a.className = "lb-story";
          a.href = "#";
          a.setAttribute("data-lore", part.id);
          a.title = "Lorebook: " + (table.titles[part.id] || "");
          a.textContent = part.text;
          frag.appendChild(a);
        });
        node.parentNode.replaceChild(frag, node);
      });
    }
  }

  function unlinkAll() {
    var host = document.getElementById("text");
    if (!host) return;
    var links = host.querySelectorAll("a.lb-story");
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      a.parentNode.replaceChild(document.createTextNode(a.textContent), a);
    }
    for (var c = host.firstChild; c; c = c.nextSibling) c._lbSig = undefined;
    host.normalize();
  }

  function scheduleLinks() {
    if (linkTimer) return;
    linkTimer = window.setTimeout(function () { linkTimer = null; linkPass(); }, 40);
  }

  function refreshLinksButton() {
    var b = dlg && dlg.querySelector('[data-act="links"]');
    if (b) {
      b.innerHTML = '<span class="lb-long">Story links: </span><span class="lb-short">Links: </span>' + (linksOn() ? "On" : "Off");
      b.setAttribute("aria-pressed", linksOn() ? "true" : "false");
    }
  }

  LB.setLinks = function (on) {
    setLinksOn(!!on);
    if (on) linkPass(); else unlinkAll();
    refreshLinksButton();
  };

  // A click on a story link opens that entry (the panel is modal, so this only fires from the page).
  document.addEventListener("click", function (ev) {
    var a = ev.target && ev.target.closest ? ev.target.closest("a.lb-story") : null;
    if (!a) return;
    ev.preventDefault();
    open(a.getAttribute("data-lore"));
  });

  /* --------------------------------------------------------------- global keys */

  function isTextTarget(t) {
    if (!t || !t.tagName) return false;
    var tag = t.tagName.toLowerCase();
    return tag === "textarea" || tag === "select" || t.isContentEditable ||
      (tag === "input" && /^(text|search|number|email|password|url|tel)$/i.test(t.type || "text"));
  }

  document.addEventListener("keydown", function (ev) {
    if (ev.ctrlKey || ev.metaKey || ev.altKey) return;
    if (dlg && dlg.open) return; // the panel handles its own keys
    if (isTextTarget(ev.target)) return;
    if (document.querySelector("dialog[open]")) return; // another dialog (save/load, shortcuts) is up
    if (ev.key === "l" || ev.key === "L") {
      ev.preventDefault();
      open();
    }
  });

  function start() {
    refreshBadge();
    window.setInterval(refreshBadge, 1500);
    // Link lore names in the story text: react to new paragraphs, and re-check once a second
    // because unlocking an entry (a *set in a scene) does not touch the page by itself.
    var host = document.getElementById("text");
    if (host && window.MutationObserver) new MutationObserver(scheduleLinks).observe(host, { childList: true });
    window.setInterval(linkPass, 1000);
    linkPass();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
