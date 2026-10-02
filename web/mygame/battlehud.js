/*
 * BATTLE HUD (prototype) -- a hotbar docked under the story during a fight, not a replacement for the combat hub.
 *
 * Same contract as the trade panel: ChoiceScript stays the rules engine. While a fight is on and the page carries the combat hub (an option
 * reading "End your turn"), this file hides the plain choice list and shows the options that are on the page as slots in a bar pinned to the
 * bottom of the window. Pressing a slot ticks the matching real radio button and submits the real form, so every gate, slot spend, replay
 * lock and roll is still decided in combat.txt. If this file never loads, or the "Classic list" toggle is on, the page works as before.
 *
 * Layout memory: the hub hides an action the moment it cannot be taken, which would make the bar jump. So every action seen during this
 * fight keeps its slot; one the hub is not offering right now is drawn dimmed, with the reason on hover, and cannot be pressed.
 *
 * Nothing is tagged in the engine yet, so slots are identified by reading each label: "[ACTION] [Name] blurb", "[BONUS ACTION]",
 * "[NO ACTION]" / "[NO COST]", or a bare "[Name] blurb" (Shield, Hellish Rebuke); anything else is Move / Other by its opening words.
 */
(function () {
  "use strict";

  var HUD_ID = "battleHud";
  var TIP_ID = "battleHudTip";
  var classic = false;    // "Classic list" toggle: show the plain choice list again
  var pressed = false;    // a slot was pressed and the old page has not gone yet
  var lastSig = "";
  var seen = [];          // every action seen this fight, in hub order: {id, group, name, blurb}
  var offered = {};       // id -> radio, for the options on the page right now
  var tipFor = null;

  function truthy(v) { return v === true || v === "true"; }
  function num(v) { var n = Number(v); return isFinite(n) ? n : 0; }
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function statsNow() { return window.stats || {}; }
  function slug(name) { return String(name).toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, ""); }

  // The grids of the bar, left to right (columns per row). Movement is not a grid: Advance and Retreat stand beside them as tall buttons.
  var SECTIONS = [
    { id: "action", groups: ["action"], cols: 6 },
    { id: "bonus",  groups: ["bonus", "free"], cols: 4 },
    { id: "other",  groups: ["other"], cols: 4 }
  ];
  var MIN_ROWS = 3;       // empty cells fill each grid to at least this many rows
  var KIND = { action: "Action", bonus: "Bonus action", free: "Free", move: "Movement", other: "" };

  function iconFor(name) {
    var key = slug(name);
    return (window.SPELL_ICONS || {})[key] || (window.ACTION_ICONS || {})[key] || "";
  }

  // Reads one option label into {group, name, blurb}. The label text is the rendered page text, so [b] has already become bold and the
  // literal square brackets remain.
  function parseLabel(raw) {
    var t = String(raw || "").replace(/\s+/g, " ").replace(/^\s+|\s+$/g, "");
    var m = /^\[(ACTION|BONUS ACTION|NO ACTION|NO COST)\]\s*\[([^\]]+)\]\s*(.*)$/.exec(t);
    if (m) {
      var g = m[1] === "ACTION" ? "action" : (m[1] === "BONUS ACTION" ? "bonus" : "free");
      return { group: g, name: m[2], blurb: m[3] };
    }
    m = /^\[([^\]]+)\]\s*(.*)$/.exec(t);
    if (m) return { group: "free", name: m[1], blurb: m[2] };
    if (/^(Push forward|Fall back|Close the distance|Move )/i.test(t)) return { group: "move", name: /^Push forward/i.test(t) ? "Push forward" : (/^Fall back/i.test(t) ? "Fall back" : "Move"), blurb: t };
    var name = /^End your turn/i.test(t) ? "End turn" : (/^Break off and run/i.test(t) ? "Flee" : (/^Use an item/i.test(t) ? "Use item" : t.split(/[.,;:]/)[0].slice(0, 24)));
    return { group: "other", name: name, blurb: t };
  }

  function hubItems() {
    // Only the newest form: while ChoiceScript fades a page out, the old one is still in the document beside the new one.
    var forms = document.querySelectorAll("#main form");
    var labels = forms.length ? forms[forms.length - 1].querySelectorAll(".choice label") : [];
    var out = [];
    var hub = false;
    for (var i = 0; i < labels.length; i++) {
      var radio = labels[i].querySelector("input[type=radio]");
      if (!radio || radio.disabled) continue;
      var parsed = parseLabel(labels[i].textContent);
      if (parsed.name === "End turn") hub = true;
      parsed.id = slug(parsed.name);
      // The drawn weapon and the sidearm swap places when the sidearm is used, so their names move; their buttons do not.
      var st = statsNow();
      if (parsed.group === "action" && st.weapon && parsed.name === "Attack with your " + st.weapon) parsed.id = "primary_attack";
      else if (parsed.group === "action" && st.sidearm && parsed.name === "Attack with your " + st.sidearm) parsed.id = "sidearm_attack";
      parsed.radio = radio;
      out.push(parsed);
    }
    return hub ? out : null;
  }

  // Folds the page's current options into the remembered list. A new action goes in just before the next already-known option that
  // follows it on the page, so it lands where the hub itself puts it; otherwise it goes on the end.
  function remember(items) {
    // Advance and Retreat always have their places, offered or not.
    if (!seen.length) {
      seen.push({ id: "push_forward", group: "move", name: "Push forward", blurb: "Close the distance on the nearest enemy." });
      seen.push({ id: "fall_back", group: "move", name: "Fall back", blurb: "Open the distance from the nearest enemy." });
    }
    var st = statsNow();
    [["primary_attack", st.weapon], ["sidearm_attack", st.sidearm]].forEach(function (w) {
      var e = null;
      for (var k = 0; k < seen.length; k++) if (seen[k].id === w[0]) e = seen[k];
      if (!e) { e = { id: w[0], group: "action", name: "", blurb: "" }; seen.push(e); }
      if (w[1] && w[1] !== "none") e.name = "Attack with your " + w[1];
    });
    offered = {};
    items.forEach(function (it) { offered[it.id] = it.radio; });
    items.forEach(function (it, i) {
      var at = -1, k;
      for (k = 0; k < seen.length; k++) if (seen[k].id === it.id) { at = k; break; }
      if (at >= 0) { seen[at].blurb = it.blurb; seen[at].group = it.group; return; }
      var entry = { id: it.id, group: it.group, name: it.name, blurb: it.blurb };
      var before = -1;
      for (var j = i + 1; j < items.length && before < 0; j++) {
        for (k = 0; k < seen.length; k++) if (seen[k].id === items[j].id) { before = k; break; }
      }
      if (before >= 0) seen.splice(before, 0, entry); else seen.push(entry);
    });
    ensureGhosts();
  }

  // Spells that are not fight-long but should still hold a slot while they cannot be cast (Mage Armor lasts a day, so at the start of a fight it is
  // usually already up and the hub never offers it). Added once, at the end of the Actions, when the character has it and the hub is not showing it.
  function ensureGhosts() {
    var st = statsNow();
    if (!(truthy(st.known_mage_armor) || truthy(st.inv_armor_of_shadows))) return;
    for (var k = 0; k < seen.length; k++) if (seen[k].id === "mage_armor") return;
    seen.push({ id: "mage_armor", group: "action", name: "Mage Armor", blurb: "Lay a ward of unseen force over yourself: base AC 13 + Dexterity for 24 hours, while you wear no armor." });
  }

  // Why a remembered action is not on the page right now. Best effort from the turn budget; the hub's own gates are the truth.
  function reasonFor(e) {
    var s = statsNow();
    if (e.id === "mage_armor") {
      if (num(s.mage_armor_minutes_left) > 0) return "The ward is already on you (about " + Math.ceil(num(s.mage_armor_minutes_left) / 60) + " hours left)";
      if (s.armor_type && s.armor_type !== "cloth") return "You are wearing armor, which the ward cannot sit over";
      if (truthy(s.head_is_armor)) return "Your helmet counts as armor, which the ward cannot sit over";
    }
    if (e.group === "move") return e.id === "push_forward" ? "Nothing to advance on, or you cannot move now" : "You are not in melee reach, or you cannot move now";
    if (e.group === "action" && num(s.combat_player_actions_left) <= 0) return "No action left this turn";
    if (e.group === "bonus" && num(s.combat_player_bonus_left) <= 0) return "No bonus action left this turn";
    // A melee weapon can only strike an enemy in reach; fights now open at Close range, so this is the usual reason on the first turn.
    if ((e.id === "primary_attack" || e.id === "sidearm_attack") && (e.id === "primary_attack" ? s.weapon_type : s.sidearm_type) !== "ranged") return "Out of reach. Advance (free movement) to close in, then strike";
    if (e.group === "free" && truthy(s.player_oa_used) && /shield|rebuke/.test(e.id)) return "Reaction already used this round";
    return "Not available right now";
  }

  function pips(n, max, cls) {
    var h = "";
    for (var i = 0; i < max; i++) h += "<span class=\"bhud-pip " + cls + (i < n ? " on" : "") + "\"></span>";
    return h;
  }

  function slotHtml(e, key) {
    var on = !!offered[e.id];
    var icon = iconFor(e.name);
    return "<button type=\"button\" class=\"bhud-slot bhud-" + e.group + (on ? "" : " off") + "\" data-bhud=\"pick\" data-id=\"" + esc(e.id) + "\"" +
      (key ? " data-key=\"" + key + "\"" : "") + (on ? "" : " aria-disabled=\"true\"") + " aria-label=\"" + esc(e.name) + "\">" +
      (key ? "<span class=\"bhud-key\">" + key + "</span>" : "") +
      (icon ? "<img class=\"bhud-icon\" src=\"" + icon + "\" alt=\"\">" : "<span class=\"bhud-glyph\">" + esc((e.name.match(/[A-Za-z0-9]/) || ["?"])[0]) + "</span>") +
      "</button>";
  }

  // Advance / Retreat: tall, narrow, stacked, lettered top to bottom like the reference bar's ADV / DIS.
  function moveHtml(e) {
    var on = !!offered[e.id];
    var word = /^Push forward/i.test(e.name) ? "ADV" : (/^Fall back/i.test(e.name) ? "RET" : "MOVE");
    return "<button type=\"button\" class=\"bhud-adv bhud-move" + (on ? "" : " off") + "\" data-bhud=\"pick\" data-id=\"" + esc(e.id) + "\"" +
      (on ? "" : " aria-disabled=\"true\"") + " aria-label=\"" + esc(e.name) + "\"><span>" + word + "</span></button>";
  }

  // The two dedicated weapon buttons, above the turn budget: the weapon in hand, and the sidearm.
  function weaponHtml(e, key, label, glyph) {
    var on = !!offered[e.id];
    return "<button type=\"button\" class=\"bhud-weapon bhud-action" + (on ? "" : " off") + "\" data-bhud=\"pick\" data-id=\"" + esc(e.id) + "\"" +
      (key ? " data-key=\"" + key + "\"" : "") + (on ? "" : " aria-disabled=\"true\"") + " aria-label=\"" + esc(e.name) + "\">" +
      (key ? "<span class=\"bhud-key\">" + key + "</span>" : "") +
      "<span class=\"bhud-wglyph\">" + glyph + "</span><span class=\"bhud-wlabel\">" + label + "</span></button>";
  }

  function build() {
    var s = statsNow();
    var actions = Math.max(0, num(s.combat_player_actions_left));
    var bonus = Math.max(0, num(s.combat_player_bonus_left));
    var pos = 0;
    var primary = null, sidearm = null;
    seen.forEach(function (e) { if (e.id === "primary_attack") primary = e; else if (e.id === "sidearm_attack") sidearm = e; });
    var hasSidearm = !!(s.equipped_sidearm_id && s.equipped_sidearm_id !== "none" && sidearm && sidearm.name);
    var html = "<div class=\"bhud-bar\">" +
      "<div class=\"bhud-side\">" +
        "<div class=\"bhud-weapons\">" +
          (primary && primary.name ? weaponHtml(primary, ++pos, "Primary", "&#9876;&#65039;") : "") +
          (hasSidearm ? weaponHtml(sidearm, ++pos, "Sidearm", "&#128481;&#65039;") : "") +
        "</div>" +
        "<div class=\"bhud-budget\"><b>Action</b>" + pips(actions, Math.max(1, actions), "act") + "</div>" +
        "<div class=\"bhud-budget\"><b>Bonus</b>" + pips(bonus, Math.max(1, bonus), "bon") + "</div>" +
        "<button type=\"button\" class=\"bhud-toggle\" data-bhud=\"classic\">Classic list</button>" +
      "</div>";
    var moves = seen.filter(function (e) { return e.group === "move"; });
    if (moves.length) html += "<div class=\"bhud-moves\">" + moves.map(moveHtml).join("") + "</div>";
    SECTIONS.forEach(function (sec) {
      var rows = seen.filter(function (e) { return sec.groups.indexOf(e.group) >= 0; });
      rows = rows.filter(function (e) { return e.id !== "primary_attack" && e.id !== "sidearm_attack"; });
      if (!rows.length) return;
      var cells = Math.max(sec.cols * MIN_ROWS, Math.ceil(rows.length / sec.cols) * sec.cols);
      html += "<div class=\"bhud-section\"><div class=\"bhud-grid\" style=\"grid-template-columns: repeat(" + sec.cols + ", var(--bh-slot-size))\">";
      for (var i = 0; i < cells; i++) {
        if (i < rows.length) { pos++; html += slotHtml(rows[i], pos <= 9 ? pos : ""); }
        else html += "<span class=\"bhud-empty\"></span>";
      }
      html += "</div></div>";
    });
    return html + "</div>";
  }

  function pick(id) {
    var radio = offered[id];
    if (!radio || pressed || !radio.form) return;
    pressed = true;
    hideTip();
    radio.checked = true;
    if (typeof radio.form.onsubmit === "function") radio.form.onsubmit();
  }

  /* ---------------------------------------------------------------- hover card */

  function tipEl() {
    var el = document.getElementById(TIP_ID);
    if (!el) {
      el = document.createElement("div");
      el.id = TIP_ID;
      document.body.appendChild(el);
    }
    return el;
  }
  function hideTip() { var el = document.getElementById(TIP_ID); if (el) el.className = ""; tipFor = null; }
  // The card for the Primary and Sidearm buttons: what is actually in that hand. The weapon_* and sidearm_* variables are written by equipment.txt
  // (the description, the damage with its type, melee/finesse/ranged, one or two hands), so this only formats them.
  var ATTACK_KIND = { melee: "Melee", finesse: "Finesse melee", ranged: "Ranged" };
  function weaponCard(id) {
    var s = statsNow(), pre = id === "primary_attack" ? "weapon" : (id === "sidearm_attack" ? "sidearm" : "");
    if (!pre) return "";
    var desc = s[pre + "_desc"], dmg = s[pre + "_damage"], type = s[pre + "_type"], hands = s[pre + "_hands"];
    if (!desc || desc === "None" || desc === "none") return "";
    var bits = [];
    if (dmg && dmg !== "none") bits.push("Damage: " + dmg);
    if (type && ATTACK_KIND[type]) bits.push(ATTACK_KIND[type]);
    if (hands) bits.push(hands === "two_handed" ? "Two-handed" : "One-handed");
    return "<div class=\"bt-name\">" + esc(desc) + "</div>" +
      "<div class=\"bt-kind\">" + (pre === "weapon" ? "Primary weapon" : "Sidearm") + "</div>" +
      (bits.length ? "<div class=\"bt-text\">" + esc(bits.join(" · ")) + "</div>" : "");
  }

  function showTip(slot) {
    var id = slot.getAttribute("data-id");
    var e = null;
    for (var i = 0; i < seen.length; i++) if (seen[i].id === id) e = seen[i];
    if (!e) return;
    var on = !!offered[id];
    var el = tipEl();
    var wc = weaponCard(id);
    if (wc) {
      el.innerHTML = wc + (on ? "" : "<div class=\"bt-off\">" + esc(reasonFor(e)) + "</div>");
    } else
    el.innerHTML = "<div class=\"bt-name\">" + esc(e.name) + "</div>" +
      (KIND[e.group] ? "<div class=\"bt-kind\">" + KIND[e.group] + "</div>" : "") +
      (e.blurb && e.blurb.replace(/[^A-Za-z]/g, "").length > 2 && e.blurb !== e.name ? "<div class=\"bt-text\">" + esc(e.blurb) + "</div>" : "") +
      (on ? "" : "<div class=\"bt-off\">" + esc(reasonFor(e)) + "</div>");
    el.className = "on";
    // Rects are in viewport pixels; the card is positioned in CSS pixels, which the screen-fit zoom (index.html, window.UI_ZOOM) scales. So measure
    // everything in viewport pixels, then divide by the zoom to set left/top.
    var z = window.UI_ZOOM || 1;
    var r = slot.getBoundingClientRect(), tr = el.getBoundingClientRect();
    var left = Math.min(Math.max(8, r.left + r.width / 2 - tr.width / 2), window.innerWidth - tr.width - 8);
    el.style.left = (left / z) + "px";
    el.style.top = (Math.max(8, r.top - tr.height - 10) / z) + "px";
    tipFor = id;
  }

  /* ---------------------------------------------------------------- page wiring */

  function dockHeight() {
    var el = document.getElementById(HUD_ID);
    document.documentElement.style.setProperty("--bhud-h", (el ? el.offsetHeight : 0) + "px");
  }

  function remove() {
    var el = document.getElementById(HUD_ID);
    if (el && el.parentNode) el.parentNode.removeChild(el);
    document.body.classList.remove("battleHudOn");
    document.documentElement.style.setProperty("--bhud-h", "0px");
    hideTip();
    lastSig = "";
  }

  function scan() {
    var s = statsNow();
    var inFight = truthy(s.combat_engaged);
    if (!inFight) seen = [];
    var items = (inFight && !classic) ? hubItems() : null;
    if (!items) {
      // Classic list asked for, or not the hub: put the dock away. When classic, leave a small way back.
      remove();
      var back = document.getElementById("battleHudBack");
      var wantBack = classic && inFight && hubItems();
      if (wantBack && !back) {
        back = document.createElement("button");
        back.id = "battleHudBack";
        back.type = "button";
        back.textContent = "Battle HUD";
        back.setAttribute("data-bhud", "hud");
        var form = document.querySelector("#main form");
        if (form) form.parentNode.insertBefore(back, form);
      } else if (!wantBack && back && back.parentNode) back.parentNode.removeChild(back);
      return;
    }
    var back2 = document.getElementById("battleHudBack");
    if (back2 && back2.parentNode) back2.parentNode.removeChild(back2);
    remember(items);
    var sig = items.map(function (i) { return i.id; }).join("|") + "#" + seen.length + "#" + num(s.combat_player_actions_left) + "/" + num(s.combat_player_bonus_left) + "/" + (truthy(s.player_oa_used) ? 1 : 0);
    var el = document.getElementById(HUD_ID);
    if (el && sig === lastSig) return;
    if (sig !== lastSig) pressed = false; // a new page of options: the old press is over
    if (!el) {
      el = document.createElement("div");
      el.id = HUD_ID;
      document.body.appendChild(el);
    }
    el.innerHTML = build();
    document.body.classList.add("battleHudOn");
    lastSig = sig;
    dockHeight();
  }

  var queued = false;
  function queueScan() { if (!queued) { queued = true; window.requestAnimationFrame(function () { queued = false; scan(); }); } }

  document.addEventListener("click", function (ev) {
    var t = ev.target;
    while (t && t !== document && !(t.getAttribute && t.hasAttribute("data-bhud"))) t = t.parentNode;
    if (!t || t === document) return;
    var act = t.getAttribute("data-bhud");
    if (act === "pick") pick(t.getAttribute("data-id"));
    else if (act === "classic") { classic = true; scan(); }
    else if (act === "hud") { classic = false; scan(); }
  });

  function slotOf(el) { return el && el.closest ? el.closest("#" + HUD_ID + " .bhud-slot, #" + HUD_ID + " .bhud-adv, #" + HUD_ID + " .bhud-weapon") : null; }
  document.addEventListener("mouseover", function (ev) { var sl = slotOf(ev.target); if (sl) showTip(sl); else if (tipFor) hideTip(); });
  document.addEventListener("focusin", function (ev) { var sl = slotOf(ev.target); if (sl) showTip(sl); });
  document.addEventListener("focusout", function () { hideTip(); });

  // Number keys fire the numbered slot, like a real hotbar.
  document.addEventListener("keydown", function (ev) {
    if (ev.ctrlKey || ev.metaKey || ev.altKey || ev.shiftKey) return;
    if (!document.body.classList.contains("battleHudOn")) return;
    if (document.querySelector("dialog[open]")) return;
    var tag = ev.target && ev.target.tagName ? ev.target.tagName.toLowerCase() : "";
    if (tag === "input" || tag === "textarea" || tag === "select") return;
    if (!/^[1-9]$/.test(ev.key)) return;
    var slot = document.querySelector("#" + HUD_ID + " .bhud-slot[data-key=\"" + ev.key + "\"]");
    if (slot) { ev.preventDefault(); pick(slot.getAttribute("data-id")); }
  });
  window.addEventListener("resize", dockHeight);

  function start() {
    if (window.MutationObserver) new MutationObserver(queueScan).observe(document.body, { childList: true, subtree: true });
    window.setInterval(scan, 500);
    scan();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();

  window.BattleHud = { scan: scan, parseLabel: parseLabel };
})();
