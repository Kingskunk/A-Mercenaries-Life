/*
 * CITY TRAVEL (2026-10-21, the user's sidebar Travel button; the "Go to..." list of known places 2026-10-22) -- get around the city from the sidebar, in fewer clicks.
 *
 * The panel owns picking; the scene owns the trip, the way the overworld map and the trade panel work. Nothing here moves the player or charges time: it only presses real options.
 *
 * DISTRICTS. A free-roaming page (the district hubs and their place menus) carries one hidden option whose label starts with the arrow mark and ends with the city's id in brackets:
 * "↦ Walk to the district picked on the sidebar. [port_valen]". While that option is on the newest page, the Travel button is enabled. Picking a district writes its id into the city's
 * destination variable (stats.pv_travel_dest) and presses that option; the scene (port_valen.txt port_valen_walk_picked) checks the pick against the districts that are open and not the one the
 * player stands in, and takes the normal road: the walking time, the exposure, the once-a-day street encounter, arrival at the hub. A pick of the district the player is already in puts them back on
 * its hub, free, as leaving a place does.
 *
 * PLACES. The list of known places (shops, inns, healers, job spots) is a route runner. A place is a list of steps, and each step is a HIDDEN COPY of a real option on a real page, written into the scene files
 * by tools/gen_city_places.js with the same guards and body as the original and a label "⇥ [pvgo:<page>:<target>]". To go to Vael's the runner walks to the district, then on each page presses
 * the copy for the next step. Every hour, every walking cost, every shut shop and first-visit page is the real one, because the pages are the real ones; a route that cannot be taken (the copy is not
 * on the page because the original is not) simply stops and says so. A place is listed only once the player has been there (its "seen" flag), and a Patrician Quarter place is greyed without a writ.
 * Pinned and recent places live in this browser (localStorage), as a convenience; losing them loses nothing.
 *
 * Because the button is enabled only where a scene has offered the walk option, a quest page, a timed job, a conversation or a dungeon cannot be walked away from, and no scene needs a lock.
 * The tables (districts, minutes, places) are generated (tools/gen_city_data.js -> city-data.generated.js) from the scenes themselves, so the card shows what the pages will charge.
 * The hidden options stay on their pages, hidden, even when the sidebar is not shown (a narrow window); the district hubs keep their own visible Travel option for that case.
 */
(function () {
  "use strict";

  var MARK = "↦";   // ↦, the hidden walk option's label starts with it
  var STEP = "⇥";   // ⇥, a hidden step option's label starts with it
  var CT = window.CityTravel = window.CityTravel || {};

  function truthy(v) { return v === true || v === "true"; }
  function num(v) { var n = Number(v); return isFinite(n) ? n : 0; }
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function statsNow() { return window.stats || {}; }
  function data() { return window.CITY_TRAVEL || {}; }

  // The labels of the newest page's choice (while ChoiceScript fades a page out the old one is still in the document beside the new one).
  function newestLabels() {
    if (typeof document === "undefined") return [];
    var forms = document.querySelectorAll("#main form");
    return forms.length ? forms[forms.length - 1].querySelectorAll(".choice label") : [];
  }
  function labelText(l) { return (l.textContent || "").replace(/\s+/g, " ").trim(); }

  // The walk option on the newest page, or null.
  function findWalk() {
    var labels = newestLabels();
    for (var i = 0; i < labels.length; i++) {
      var text = labelText(labels[i]);
      if (text.indexOf(MARK) !== 0) continue;
      var radio = labels[i].querySelector("input[type=radio]"), m = /\[([a-z_]+)(:read)?\]\s*$/.exec(text);
      if (!radio || radio.disabled || !m || !data()[m[1]]) continue;
      // "[port_valen:read]" is the walk option on a page that is only something to read (a board, a result, a reply): the Travel button works there, but it is not free time for Wait and Rest
      return { label: labels[i], radio: radio, city: m[1], read: !!m[2] };
    }
    return null;
  }

  // The hidden copy for one route step ("page:target") on the newest page, or null.
  function findStep(key) {
    var labels = newestLabels(), want = "[pvgo:" + key + "]";
    for (var i = 0; i < labels.length; i++) {
      var text = labelText(labels[i]);
      if (text.indexOf(STEP) !== 0 || text.indexOf(want) < 0) continue;
      var radio = labels[i].querySelector("input[type=radio]");
      if (radio && !radio.disabled) return { label: labels[i], radio: radio };
    }
    return null;
  }

  /* ---------------------------------------------------------------- districts */

  // The districts the player may walk to from here, with the minutes the scene will charge (this district's distance from the origin plus the destination's, as port_valen_travel_to adds them).
  CT.plan = function (cityId, s) {
    var city = data()[cityId];
    if (!city) return null;
    s = s || statsNow();
    var here = String(s[city.hereVar] || ""), origin = 0, hereName = "";
    city.districts.forEach(function (d) { if (d.id === here) { origin = d.dist; hereName = d.name; } });
    var out = [];
    city.districts.forEach(function (d) {
      if (d.id === here) return;
      if (d.open && !truthy(s[d.open])) return;
      out.push({ id: d.id, name: d.name, minutes: origin + d.dist });
    });
    // Standing on one of the district's place pages (not its hub): the way back to the hub is free (port_valen_walk_picked puts the player on the hub of the district they stand in when the pick is that district).
    var hub = null;
    if (here && hereName && typeof document !== "undefined") {
      var onHub = (city.places || []).some(function (p) { return p.district === here && findStep(p.steps[0]); });
      if (!onHub) hub = { id: here, name: hereName };
    }
    return { city: city, here: here, hereName: hereName, hub: hub, list: out };
  };

  // Does the newest page carry the walk option at all? pagegate.js reads this as "an open-world page" for Wait and Rest.
  CT.onPage = function () { var w = findWalk(); return !!w && !w.read; };

  // The town or village the newest page belongs to (the registry is generated by tools/gen_city_settlements.js into window.CITY_SETTLEMENTS): any hidden step copy on the page names it, either directly
  // ("home:<id>", the page's own way back to the hub) or through the keys of the settlement's routes. null on a page that is not part of one.
  function settlements() { return window.CITY_SETTLEMENTS || {}; }
  CT.settlement = function () {
    var labels = newestLabels(), all = settlements();
    for (var i = 0; i < labels.length; i++) {
      var text = labelText(labels[i]);
      if (text.indexOf(STEP) !== 0) continue;
      var m = /\[pvgo:([^\]]+)\]/.exec(text);
      if (!m) continue;
      var h = /^home:(.+)$/.exec(m[1]);
      if (h && all[h[1]]) return { id: h[1], def: all[h[1]] };
      for (var id in all) if (all[id].keys.indexOf(m[1]) >= 0) return { id: id, def: all[id] };
    }
    return null;
  };

  // Is the Travel button usable right now? On a page that carries the walk option (a city: somewhere to walk to) or that belongs to a town or village (a notice board, an inn, the way out); never in a fight.
  CT.available = function () {
    var s = statsNow();
    if (truthy(s.combat_engaged)) return false;
    var w = findWalk();
    if (w && CT.plan(w.city, s) && CT.plan(w.city, s).list.length) return true;
    return !w && !!CT.settlement();
  };

  /* ---------------------------------------------------------------- places */

  // A Patrician Quarter place needs a writ: the same test as port_valen_upper_wharves (a standing registration, today's day writ, or a signed Hall job in the Quarter).
  function writOk(s) {
    var day = num(s.campaign_day);
    if (num(s.patrician_reg_until) >= day || num(s.patrician_day_writ_day) === day) return true;
    if (s.rj_pest_stage === "active" && s.rj_pest_where === "quarter" && day <= num(s.rj_pest_until)) return true;
    if (s.rj_perf_stage === "active" && s.rj_perf_where === "quarter" && day <= num(s.rj_perf_until)) return true;
    return false;
  }

  var KINDS = [["all", "All"], ["shops", "Shops"], ["food", "Food & rest"], ["healing", "Healing"], ["work", "Work"], ["services", "Services"]];
  var KIND_TAG = { shops: "Shop", food: "Food & rest", healing: "Healing", work: "Work", services: "Service" };

  // The places the player knows (has been to), each with the total minutes from here and, when it cannot be taken, the reason.
  CT.places = function (cityId, s) {
    var city = data()[cityId];
    if (!city || !city.places) return [];
    s = s || statsNow();
    var here = String(s[city.hereVar] || ""), origin = 0, dist = {}, names = {}, open = {};
    city.districts.forEach(function (d) { dist[d.id] = d.dist; names[d.id] = d.name; open[d.id] = d.open; if (d.id === here) origin = d.dist; });
    return city.places.filter(function (p) { return truthy(s[p.seen]); }).map(function (p) {
      var off = "", k = startAt(p.steps);   // already standing partway along the route (the Wash Yard on the way to the Baths): only the rest of it costs time
      if (open[p.district] && !truthy(s[open[p.district]])) off = "Not open to you yet";
      else if (p.gate === "writ" && !writOk(s)) off = "Needs a Pass";
      return { id: p.id, name: p.name, district: p.district, districtName: names[p.district] || p.district, kind: p.kind, steps: p.steps, off: off,
        minutes: k > 0 ? (p.stepMin || []).slice(k).reduce(function (a, b) { return a + num(b); }, 0) : (here === p.district ? 0 : origin + (dist[p.district] || 0)) + num(p.extra) };
    });
  };

  /* ---------------------------------------------------------------- pressing real options */

  function pressRadio(radio) {
    if (!radio || !radio.form || !document.documentElement.contains(radio)) return false;
    radio.checked = true;
    if (typeof radio.form.onsubmit === "function") radio.form.onsubmit();
    return true;
  }

  var pressed = false;
  // Writes the picked district where the scene reads it, then presses the one walk option. The scene checks the pick and refuses anything it does not allow.
  CT.go = function (id) {
    var w = findWalk();
    if (!w) return false;
    var plan = CT.plan(w.city);
    if (!plan || !(plan.list.some(function (d) { return d.id === id; }) || (plan.hub && plan.hub.id === id))) return false;
    statsNow()[plan.city.destVar] = id;
    close();
    pressed = false;
    if (!pressed) { pressed = true; pressRadio(w.radio); }
    return true;
  };

  /* ---------------------------------------------------------------- the route runner */

  var run = null;     // {place, i, prevAnimate}
  var KEY = "mercenarysPath.cityPlaces";

  function load() { try { var v = JSON.parse(window.localStorage.getItem(KEY) || "{}"); return { pins: v.pins || [], recent: v.recent || [], tab: v.tab || "" }; } catch (e) { return { pins: [], recent: [], tab: "" }; } }
  function save(v) { try { window.localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) { /* private window: the card works without it */ } }
  function remember(id) { var v = load(); v.recent = [id].concat(v.recent.filter(function (x) { return x !== id; })).slice(0, 4); save(v); }

  function waitFor(cond, ms, cb) {
    var t0 = Date.now();
    (function tick() {
      var v = cond();
      if (v) { cb(v); return; }
      if (Date.now() - t0 > ms) { cb(null); return; }
      window.setTimeout(tick, 50);
    })();
  }

  var busyEl = null;
  function showBusy(text) {
    if (!busyEl) { busyEl = document.createElement("div"); busyEl.id = "ctBusy"; document.body.appendChild(busyEl); }
    busyEl.innerHTML = '<span>' + esc(text) + '</span><small>Esc to stop</small>';
    busyEl.className = "show";
  }
  function hideBusy() { if (busyEl) busyEl.className = ""; }

  function endRun(msg, arrived) {
    if (!run) return;
    var r = run; run = null;
    if (typeof window.animateEnabled !== "undefined") window.animateEnabled = r.prevAnimate;
    hideBusy();
    if (arrived) remember(r.place.id);
    statsNow().spell_cast_toast = msg;
  }

  function nextStep() {
    if (!run) return;
    if (run.i >= run.place.steps.length) {
      // every step pressed: give the last page a moment to draw, then report
      window.setTimeout(function () { if (run) endRun(run.place.done || "You are at " + run.place.name + ".", !run.place.noRecent); }, 150);
      return;
    }
    var key = run.place.steps[run.i];
    waitFor(function () { return findStep(key); }, 2600, function (opt) {
      if (!run) return;
      if (!opt) { endRun("You cannot get to " + run.place.name + " from here right now. It may be shut.", false); return; }
      var before = num(statsNow().page_id);
      run.i++;
      pressRadio(opt.radio);
      waitFor(function () { return num(statsNow().page_id) !== before; }, 3500, function (changed) {
        if (!run) return;
        if (!changed) { endRun("The way to " + run.place.name + " was interrupted.", false); return; }
        window.setTimeout(nextStep, 90);
      });
    });
  }

  // Go to a known place: walk to its district (unless the first step is already on this page), then press each step's copy in turn.
  // A town or village service (the notice board, the inn, the way out): a route from the settlement's hub. If the first step is not on this page, the page's own way back is pressed first, and again
  // if that lands on a page that is itself a step away (an inn's room, a shop's stock counter), up to four times.
  // Where a route can start from THIS page: the last step whose copy is already here (you are standing in the Fleecefold, so the notice board is its second step, not a walk from the hub). -1 if none.
  function startAt(steps) {
    if (typeof document === "undefined") return -1;
    for (var k = steps.length - 1; k >= 0; k--) if (findStep(steps[k])) return k;
    return -1;
  }
  function homeLoop(place, tries) {
    if (!run) return;
    // the page may still be drawing: wait for either the first step or the way home to show up
    waitFor(function () { return startAt(place.steps) >= 0 || findStep("home:" + place.settlement); }, 2600, function (found) {
      if (!run) return;
      var k = startAt(place.steps);
      if (k >= 0) { run.i = k; nextStep(); return; }
      var home = findStep("home:" + place.settlement);
      if (!found || !home || tries >= 4) { endRun("You cannot get to " + place.name + " from here.", false); return; }
      var before = num(statsNow().page_id);
      pressRadio(home.radio);
      waitFor(function () { return num(statsNow().page_id) !== before; }, 3500, function (changed) {
        if (!run) return;
        if (!changed) { endRun("The way to " + place.name + " was interrupted.", false); return; }
        window.setTimeout(function () { homeLoop(place, tries + 1); }, 250);
      });
    });
  }
  CT.goService = function (settlementId, serviceId) {
    if (run) return false;
    var def = settlements()[settlementId], svc = null;
    if (!def) return false;
    def.services.forEach(function (x) { if (x.id === serviceId) svc = x; });
    if (!svc) return false;
    if (svc.seen && !truthy(statsNow()[svc.seen])) return false;
    close();
    run = { place: { id: "svc:" + settlementId + ":" + serviceId, name: svc.name, steps: svc.steps, done: svc.done, settlement: settlementId, noRecent: true }, i: 0, prevAnimate: window.animateEnabled };
    if (typeof window.animateEnabled !== "undefined") window.animateEnabled = false;
    showBusy(serviceId === "leave" ? svc.name + "…" : "Going to " + svc.name + "…");
    homeLoop(run.place, 0);
    return true;
  };

  CT.goPlace = function (id) {
    if (run) return false;
    var w = findWalk();
    if (!w) return false;
    var s = statsNow(), list = CT.places(w.city, s), place = null;
    list.forEach(function (p) { if (p.id === id) place = p; });
    if (!place || place.off) return false;
    close();
    run = { place: place, i: 0, prevAnimate: window.animateEnabled };
    if (typeof window.animateEnabled !== "undefined") window.animateEnabled = false;   // no page-turn fade between the pages the runner passes through
    showBusy("Going to " + place.name + "…");
    var at = startAt(place.steps);
    if (at >= 0) { run.i = at; nextStep(); return true; }
    // not on the district's hub page: walk there (the scene charges the legs, or puts the player back on this district's hub for free)
    var plan = CT.plan(w.city, s), cityData = data()[w.city];
    s[cityData.destVar] = place.district;
    var before = num(s.page_id);
    pressRadio(w.radio);
    waitFor(function () { return num(statsNow().page_id) !== before; }, 3500, function (changed) {
      if (!run) return;
      if (!changed) { endRun("You cannot set off for " + place.name + " from here.", false); return; }
      window.setTimeout(nextStep, 120);
    });
    return true;
  };

  if (typeof document === "undefined") return;   // node tests stop here

  document.addEventListener("keydown", function (ev) {
    if (run && ev.key === "Escape") { ev.preventDefault(); endRun("You stop where you are.", false); }
  }, true);

  /* ---------------------------------------------------------------- the card */

  var dlg, elBody, state = { tab: "places", kind: "all", query: "", open: {} };

  function cityOnPage() { var w = findWalk(); return w ? w.city : null; }

  function build() {
    if (dlg) return;
    dlg = document.createElement("dialog");
    dlg.id = "cityTravel";
    dlg.setAttribute("aria-label", "Travel");
    dlg.innerHTML =
      '<div class="ct-head"><h2 class="ct-title">Go to…</h2><span class="ct-spacer"></span>' +
      '<button type="button" class="ct-close" data-act="close" aria-label="Close travel">×</button></div>' +
      '<div class="ct-tabs"><button type="button" data-tab="places">Places</button><button type="button" data-tab="districts">Districts</button></div>' +
      '<div class="ct-bodybox"></div>' +
      '<div class="ct-foot">The walk takes the time shown. Weather, hunger and the streets still have their say on the way.</div>';
    document.body.appendChild(dlg);
    elBody = dlg.querySelector(".ct-bodybox");
    dlg.addEventListener("click", onClick);
    dlg.addEventListener("input", function (ev) { if (ev.target && ev.target.getAttribute("data-q") !== null) { state.query = ev.target.value; paintList(); } });
    dlg.addEventListener("keydown", onKey);
  }

  function onClick(ev) {
    var t = ev.target;
    if (t === dlg) { close(); return; }
    var btn = t && t.closest ? t.closest("[data-act],[data-dest],[data-place],[data-pin],[data-kind],[data-tab],[data-group],[data-svc]") : null;
    if (!btn) return;
    var act = btn.getAttribute("data-act");
    if (act === "close") { close(); return; }
    var tab = btn.getAttribute("data-tab");
    if (tab) { state.tab = tab; var v = load(); v.tab = tab; save(v); paint(); return; }
    var kind = btn.getAttribute("data-kind");
    if (kind) { state.kind = kind; paint(); return; }
    var grp = btn.getAttribute("data-group");
    if (grp) { state.open[grp] = !isOpen(grp); paintList(); return; }
    var pin = btn.getAttribute("data-pin");
    if (pin) { var q = load(), at = q.pins.indexOf(pin); if (at >= 0) q.pins.splice(at, 1); else q.pins.push(pin); save(q); paint(); return; }
    var svc = btn.getAttribute("data-svc");
    if (svc) { var st = CT.settlement(); if (st) CT.goService(st.id, svc); return; }
    var pl = btn.getAttribute("data-place");
    if (pl) { if (!btn.disabled) CT.goPlace(pl); return; }
    var id = btn.getAttribute("data-dest");
    if (id) CT.go(id);
  }

  // Up and Down move through the places; Enter in the search box takes the first one; with the search box empty, 1 to 4 take the pinned and recent places at the top.
  function onKey(ev) {
    if (ev.key === "ArrowDown" || ev.key === "ArrowUp") {
      var items = Array.prototype.slice.call(dlg.querySelectorAll(".ct-pick:not(:disabled)")), at = items.indexOf(document.activeElement);
      if (!items.length) return;
      ev.preventDefault();
      var next = ev.key === "ArrowDown" ? (at + 1) % items.length : (at <= 0 ? items.length - 1 : at - 1);
      items[next].focus();
      return;
    }
    if (ev.key === "Enter" && ev.target && ev.target.getAttribute && ev.target.getAttribute("data-q") !== null) {
      var first = dlg.querySelector(".ct-list .ct-pick:not(:disabled)");
      if (first) { ev.preventDefault(); first.click(); }
      return;
    }
    if (/^[1-3]$/.test(ev.key) && state.tab === "town") {
      var sv = dlg.querySelectorAll(".ct-svc"), pick = sv[Number(ev.key) - 1];
      if (pick && !pick.disabled) { ev.preventDefault(); pick.click(); }
      return;
    }
    if ((ev.key === "b" || ev.key === "B") && state.tab !== "town" && !(ev.target && ev.target.getAttribute && ev.target.getAttribute("data-q") !== null)) {
      var hb = dlg.querySelector(".ct-hub");
      if (hb) { ev.preventDefault(); hb.click(); }
      return;
    }
    if (/^[1-4]$/.test(ev.key) && state.tab === "places" && !(ev.target && ev.target.getAttribute && ev.target.getAttribute("data-q") !== null && ev.target.value)) {
      var q = dlg.querySelectorAll(".ct-quick .ct-pick:not(:disabled)"), chosen = q[Number(ev.key) - 1];
      if (chosen) { ev.preventDefault(); chosen.click(); }
    }
  }

  function isOpen(group) { return state.open[group] !== undefined ? state.open[group] : false; }

  function rowHtml(p, pinned) {
    var star = '<button type="button" class="ct-star' + (pinned ? " on" : "") + '" data-pin="' + esc(p.id) + '" aria-label="' + (pinned ? "Unpin " : "Pin ") + esc(p.name) + '" title="' + (pinned ? "Unpin" : "Pin to the top") + '">' + (pinned ? "★" : "☆") + '</button>';
    return '<div class="ct-row' + (p.off ? " off" : "") + '"><button type="button" class="ct-pick" data-place="' + esc(p.id) + '"' + (p.off ? " disabled" : "") + '>' +
      '<span class="ct-pname">' + esc(p.name) + '</span><span class="ct-ptag">' + esc(KIND_TAG[p.kind] || p.kind) + '</span>' +
      '<span class="ct-pmin">' + (p.off ? esc(p.off) : p.minutes + ' min') + '</span></button>' + star + '</div>';
  }

  function matches(p) {
    if (state.kind !== "all" && p.kind !== state.kind) return false;
    var q = state.query.trim().toLowerCase();
    if (!q) return true;
    return (p.name + " " + (KIND_TAG[p.kind] || "") + " " + p.districtName).toLowerCase().indexOf(q) >= 0;
  }

  function paintList() {
    var host = dlg.querySelector(".ct-list");
    if (!host) return;
    var cityId = cityOnPage(), s = statsNow();
    if (!cityId) { host.innerHTML = '<div class="ct-empty">There is nowhere to go from here.</div>'; return; }
    var all = CT.places(cityId, s), here = String(s[data()[cityId].hereVar] || ""), v = load();
    var searching = !!state.query.trim() || state.kind !== "all";
    var shown = all.filter(matches);
    if (!shown.length) { host.innerHTML = '<div class="ct-empty">' + (all.length ? "No place matches." : "You have not been anywhere worth listing yet.") + '</div>'; return; }
    var order = []; data()[cityId].districts.forEach(function (d) { order.push(d.id); });
    order.sort(function (a, b) { return (a === here ? -1 : 0) - (b === here ? -1 : 0); });
    var html = "";
    order.forEach(function (d) {
      var group = shown.filter(function (p) { return p.district === d; });
      if (!group.length) return;
      var dn = group[0].districtName, open = searching || d === here || isOpen(d);
      if (state.open[d] !== undefined && !searching) open = state.open[d];
      html += '<div class="ct-group' + (open ? " open" : "") + '"><button type="button" class="ct-gh" data-group="' + esc(d) + '" aria-expanded="' + open + '"><span class="ct-gcar">' + (open ? "▾" : "▸") + '</span><span class="ct-gname">' + esc(dn) + '</span>' +
        (d === here ? '<span class="ct-here">you are here</span>' : '') + '<span class="ct-gcount">' + group.length + '</span></button>';
      if (open) html += '<div class="ct-rows">' + group.map(function (p) { return rowHtml(p, v.pins.indexOf(p.id) >= 0); }).join("") + '</div>';
      html += '</div>';
    });
    host.innerHTML = html;
  }

  // The free way back to the hub of the district the player stands in, on the card's top line (B).
  function hubRow() {
    var w = findWalk(), plan = w ? CT.plan(w.city) : null;
    if (!plan || !plan.hub) return "";
    return '<button type="button" class="ct-hub" data-dest="' + esc(plan.hub.id) + '"><i>B</i><span class="ct-name">Back to ' + esc(plan.hub.name) + '</span><span class="ct-min">no time</span></button>';
  }

  function paintPlaces() {
    var cityId = cityOnPage(), s = statsNow();
    var all = cityId ? CT.places(cityId, s) : [], v = load();
    var byId = {}; all.forEach(function (p) { byId[p.id] = p; });
    var quick = [], seen = {};
    v.pins.forEach(function (id) { if (byId[id] && !seen[id]) { quick.push({ p: byId[id], pin: true }); seen[id] = 1; } });
    v.recent.forEach(function (id) { if (byId[id] && !seen[id] && quick.length < 4) { quick.push({ p: byId[id], pin: false }); seen[id] = 1; } });
    quick = quick.slice(0, 4);
    var html = hubRow();
    if (quick.length) {
      html += '<div class="ct-quick"><span class="ct-qlabel">Quick</span>' + quick.map(function (q, n) {
        return '<button type="button" class="ct-pick ct-chip' + (q.p.off ? " off" : "") + '" data-place="' + esc(q.p.id) + '"' + (q.p.off ? " disabled" : "") + ' title="' + (q.p.off ? esc(q.p.off) : q.p.minutes + " min") + '"><i>' + (n + 1) + '</i>' + (q.pin ? "★ " : "") + esc(q.p.name) + '</button>';
      }).join("") + '</div>';
    }
    html += '<div class="ct-filters">' + KINDS.map(function (k) { return '<button type="button" class="ct-fchip' + (state.kind === k[0] ? " on" : "") + '" data-kind="' + k[0] + '">' + k[1] + '</button>'; }).join("") +
      '</div><div class="ct-search"><input type="search" data-q placeholder="Type to find a place" value="' + esc(state.query) + '" autocomplete="off" aria-label="Find a place"></div><div class="ct-list"></div>';
    elBody.innerHTML = html;
    paintList();
  }

  function paintDistricts() {
    var w = findWalk(), plan = w ? CT.plan(w.city) : null;
    if (!plan) { elBody.innerHTML = '<div class="ct-empty">There is nowhere to go from here.</div>'; return; }
    elBody.innerHTML = '<div class="ct-here-note">' + (plan.hereName ? "You are in " + esc(plan.hereName) + "." : "") + '</div>' + hubRow() + '<div class="ct-dlist">' +
      plan.list.map(function (d) { return '<button type="button" class="ct-dest" data-dest="' + esc(d.id) + '"><span class="ct-name">' + esc(d.name) + '</span><span class="ct-min">' + d.minutes + ' min</span></button>'; }).join("") + '</div>';
  }

  // The Town view: on a page of a town or village, the three things every settlement has.
  function paintTown() {
    var st = CT.settlement();
    if (!st) { elBody.innerHTML = '<div class="ct-empty">There is nowhere to go from here.</div>'; return; }
    elBody.innerHTML = '<div class="ct-here-note">You are in ' + esc(st.def.name) + '.</div><div class="ct-svcs">' + st.def.services.map(function (sv, n) {
      var off = !!sv.seen && !truthy(statsNow()[sv.seen]);   // not found yet: listed, greyed
      var from = Math.max(0, startAt(sv.steps)), mins = 0;      // minutes from where you stand: steps already behind you cost nothing
      for (var q = from; q < sv.steps.length; q++) mins += (sv.stepMin && sv.stepMin[q]) || 0;
      return '<button type="button" class="ct-svc' + (off ? ' off' : '') + '" data-svc="' + esc(sv.id) + '"' + (off ? ' disabled' : '') + '><i>' + (n + 1) + '</i><span class="ct-sname">' + esc(sv.name) + '</span><span class="ct-smin">' + (off ? "You haven't found it yet" : (mins > 0 ? "about " + mins + " min" : "")) + '</span></button>';
    }).join("") + '</div>';
  }

  function paint() {
    dlg.className = state.tab === "town" ? "ct-town" : "";
    var tabs = dlg.querySelectorAll(".ct-tabs button");
    for (var i = 0; i < tabs.length; i++) tabs[i].className = tabs[i].getAttribute("data-tab") === state.tab ? "on" : "";
    if (state.tab === "town") paintTown();
    else if (state.tab === "places") { paintPlaces(); var qi = dlg.querySelector("[data-q]"); if (qi && dlg.open) { var val = qi.value; qi.focus(); qi.setSelectionRange(val.length, val.length); } }
    else paintDistricts();
  }

  function open() {
    if (run || !CT.available()) return;
    build();
    var v = load(), cityId = cityOnPage(), any = cityId ? CT.places(cityId).length > 0 : false;
    state.tab = !findWalk() && CT.settlement() ? "town" : (any ? (v.tab === "districts" ? "districts" : "places") : "districts");
    state.query = ""; state.kind = "all"; state.open = {};
    if (!dlg.open) dlg.showModal();
    paint();
  }
  function close() { if (dlg && dlg.open) dlg.close(); }
  CT.open = open;
  CT.close = close;

  /* ---------------------------------------------------------------- keeping the page in step */

  // style.css rounds the choice box with .choice > div:first-child / :last-child. Hiding the walk and step rows leaves hidden rows at the edges, so tag the first and last VISIBLE rows
  // (citytravel.css draws those edges).
  function fixChoiceEdges(box) {
    var rows = box ? box.children : [], first = null, last = null, i;
    for (i = 0; i < rows.length; i++) {
      if (rows[i].style.display === "none") continue;
      if (!first) first = rows[i];
      last = rows[i];
    }
    for (i = 0; i < rows.length; i++) {
      rows[i].classList.toggle("ct-first-visible", rows[i] === first && rows[0] !== first);
      rows[i].classList.toggle("ct-last-visible", rows[i] === last && rows[rows.length - 1] !== last);
    }
  }

  var scanQueued = false;
  function scan() {
    scanQueued = false;
    var labels = newestLabels(), box = null, hidAny = false;
    for (var i = 0; i < labels.length; i++) {
      var c = (labels[i].textContent || "").replace(/^\s+/, "").charAt(0);
      if ((c === MARK || c === STEP) && labels[i].parentNode) {
        if (labels[i].parentNode.style.display !== "none") labels[i].parentNode.style.display = "none";
        box = labels[i].parentNode.parentNode; hidAny = true;
      }
    }
    if (hidAny) fixChoiceEdges(box);
    if (dlg && dlg.open && !findWalk() && !CT.settlement()) close();
    if (findWalk()) pressed = false;
  }
  function queueScan() { if (!scanQueued) { scanQueued = true; window.requestAnimationFrame(scan); } }

  // T opens the card, like F for Wait and R for Rest. Not while typing, not over another open panel, and not on a page where the trade panel is active (the trade panel keeps T there).
  document.addEventListener("keydown", function (ev) {
    if ((ev.key !== "t" && ev.key !== "T") || ev.ctrlKey || ev.metaKey || ev.altKey || ev.repeat) return;
    var target = ev.target, tag = target && target.tagName ? target.tagName.toLowerCase() : "";
    if (tag === "input" || tag === "textarea" || tag === "select" || (target && target.isContentEditable)) return;
    if (document.querySelector("dialog[open]")) return;
    if (window.TradePanel && window.TradePanel.active && window.TradePanel.active()) return;
    if (!CT.available()) return;
    ev.preventDefault();
    open();
  });

  function start() {
    if (window.MutationObserver) new MutationObserver(queueScan).observe(document.body, { childList: true, subtree: true });
    window.setInterval(scan, 700);   // safety net: stats can change without touching the DOM
    scan();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
