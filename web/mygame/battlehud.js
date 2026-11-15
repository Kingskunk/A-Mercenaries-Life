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
 *
 * Variants: options named "[Base: Variant]" (True Strike: Weapon / True Strike: Radiant) are folded into ONE slot named Base. Pressing it opens
 * a small pop-up of buttons above the slot, one per variant; each presses its own real option. The Classic list shows them as separate lines.
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
  var flyFor = null;      // id of the slot whose variant pop-up is open (True Strike: Weapon / Radiant), or null
  var FLY_ID = "battleHudFly";

  function truthy(v) { return v === true || v === "true"; }
  function num(v) { var n = Number(v); return isFinite(n) ? n : 0; }
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function statsNow() { return window.stats || {}; }
  function slug(name) { return String(name).toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, ""); }

  // The grids of the bar, left to right. Advance and Retreat alone own the tall movement rail; chokepoint
  // commands live on the relevant ally's sidebar card, where they can scale to a larger party.
  var SECTIONS = [
    { id: "action", groups: ["action"], cols: 6 },
    { id: "bonus",  groups: ["bonus", "free"], cols: 4 },
    { id: "other",  groups: ["other"], cols: 4 }
  ];
  // Read, Items and Potions still cost an action, but they are utility menus rather than attacks or spells.
  // Lay their parent buttons out with Flee and End turn without changing their action colouring,
  // availability checks, or the ChoiceScript options their fly-outs submit.
  var UTILITY_ACTIONS = { read: true, items: true, potions: true };
  // The fly-outs that hold items. Each button is its art alone, and its hover card is built from the Pack's own entry for the item (INVENTORY in inventory-data.js).
  var ITEM_MENUS = { potions: "Potion", read: "Scroll", items: "Item", throw: "Thrown", shoot: "Arrow" };
  var MIN_ROWS = 3;       // empty cells fill each grid to at least this many rows
  var KIND = { action: "Action", bonus: "Bonus action", free: "Free", move: "Movement", tactic: "Tactical movement", other: "" };

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
    if (/^(Push forward|Fall back|Trade places|Call .* back|Close the distance|Move )/i.test(t)) {
      var tactical = /^(Trade places|Call .* back)/i.test(t);
      return { group: tactical ? "tactic" : "move", name: /^Push forward/i.test(t) ? "Push forward" : (/^Fall back/i.test(t) ? "Fall back" : (/^Trade places/i.test(t) ? "Trade places" : (/^Call /i.test(t) ? "Call ally back" : "Move"))), blurb: t };
    }
    var name = /^End your turn/i.test(t) ? "End turn" : (/^Break off and run/i.test(t) ? "Flee" : (/^Use an item/i.test(t) ? "Use item" : t.split(/[.,;:]/)[0].slice(0, 24)));
    return { group: "other", name: name, blurb: t };
  }

  function hubItems() {
    // Only the newest form: while ChoiceScript fades a page out, the old one is still in the document beside the new one.
    var forms = document.querySelectorAll("#main form");
    var labels = forms.length ? forms[forms.length - 1].querySelectorAll(".choice label") : [];
    var out = [];
    var hub = false;
    var hosts = {};
    for (var i = 0; i < labels.length; i++) {
      var radio = labels[i].querySelector("input[type=radio]");
      if (!radio || radio.disabled) continue;
      var parsed = parseLabel(labels[i].textContent);
      if (parsed.name === "End turn") hub = true;
      parsed.id = slug(parsed.name);
      // "Base: Variant" -- the variants share one slot (the first one keeps the slot's place in the order).
      var vm = (parsed.group !== "other" && parsed.group !== "move" && parsed.group !== "tactic") ? /^(.+?):\s+(.+)$/.exec(parsed.name) : null;
      if (vm) {
        var baseId = slug(vm[1]);
        var host = hosts[baseId];
        if (!host) {
          host = { id: baseId, group: parsed.group, name: vm[1], blurb: parsed.blurb, radio: radio, variants: [] };
          hosts[baseId] = host;
          out.push(host);
        }
        host.variants.push({ id: parsed.id, label: vm[2], blurb: parsed.blurb, radio: radio });
        continue;
      }
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
    items.forEach(function (it) {
      offered[it.id] = it.radio;
      (it.variants || []).forEach(function (v) { offered[v.id] = v.radio; });
    });
    items.forEach(function (it, i) {
      var at = -1, k;
      for (k = 0; k < seen.length; k++) if (seen[k].id === it.id) { at = k; break; }
      if (at >= 0) { seen[at].blurb = it.blurb; seen[at].group = it.group; if (it.variants) seen[at].variants = it.variants; return; }
      var entry = { id: it.id, group: it.group, name: it.name, blurb: it.blurb, variants: it.variants };
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
    if (e.group === "move") {
      if (e.id === "push_forward") return "Nothing to advance on, the chokepoint is held, or you cannot move now";
      return "You are not in melee reach, or you cannot move now";
    }
    if (e.group === "tactic") return "No ally is holding a chokepoint, or you cannot move now";
    if (e.group === "action" && num(s.combat_player_actions_left) <= 0) return "No action left this turn";
    if (e.group === "bonus" && num(s.combat_player_bonus_left) <= 0) return "No bonus action left this turn";
    if (e.id === "true_strike" && s.weapon_type !== "ranged") return "Out of reach. Close in on an enemy first, with a weapon in hand";
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
    var fly = !!(e.variants && e.variants.length);
    return "<button type=\"button\" class=\"bhud-slot bhud-" + e.group + (on ? "" : " off") + (fly && flyFor === e.id ? " open" : "") + "\" data-bhud=\"" + (fly ? "fly" : "pick") + "\" data-id=\"" + esc(e.id) + "\"" +
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
  // The art is the framed tile for the hand and the kind of weapon in it (ACTION_ICONS primary_melee / primary_ranged / sidearm_melee / sidearm_ranged, gen_action_icons.js);
  // the hover card still says which weapon it is. With no art the button falls back to the word and the glyph it had before.
  function weaponHtml(e, key, label, glyph) {
    var on = !!offered[e.id];
    var st = statsNow();
    var hand = e.id === "sidearm_attack" ? "sidearm" : "primary";
    var kind = (hand === "sidearm" ? st.sidearm_type : st.weapon_type) === "ranged" ? "ranged" : "melee";
    var art = (window.ACTION_ICONS || {})[hand + "_" + kind];
    return "<button type=\"button\" class=\"bhud-weapon bhud-action" + (art ? " art" : "") + (on ? "" : " off") + "\" data-bhud=\"pick\" data-id=\"" + esc(e.id) + "\"" +
      (key ? " data-key=\"" + key + "\"" : "") + (on ? "" : " aria-disabled=\"true\"") + " aria-label=\"" + esc(e.name) + "\">" +
      (key ? "<span class=\"bhud-key\">" + key + "</span>" : "") +
      (art ? "<img class=\"bhud-wart\" src=\"" + art + "\" alt=\"\">"
           : "<span class=\"bhud-wglyph\">" + glyph + "</span><span class=\"bhud-wlabel\">" + label + "</span>") + "</button>";
  }

  function build() {
    var s = statsNow();
    var actions = Math.max(0, num(s.combat_player_actions_left));
    var bonus = Math.max(0, num(s.combat_player_bonus_left));
    var moveLeft = Math.max(0, num(s.combat_player_moves_left));
    var moveMax = Math.max(1, num(s.combat_player_moves_max), moveLeft);
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
        "<div class=\"bhud-budget\"><b>Move</b>" + pips(moveLeft, moveMax, "mov") + "</div>" +
      "</div>";
    // The rail is deliberately only Advance / Retreat. Tactical ally orders are intentionally not rendered in
    // the bar: the companion card in the sidebar owns them, avoiding an ever-growing combat action grid.
    var moves = seen.filter(function (e) { return e.group === "move"; });
    if (moves.length) html += "<div class=\"bhud-moves\">" + moves.map(moveHtml).join("") + "</div>";
    SECTIONS.forEach(function (sec) {
      var rows = seen.filter(function (e) {
        if (UTILITY_ACTIONS[e.id]) return sec.id === "other";
        return sec.groups.indexOf(e.group) >= 0;
      });
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
    // A sidebar ally order must still work in Classic List mode, where the HUD has deliberately put its own
    // buttons away. Find the live ChoiceScript radio by the same parsed id in that case; this executes the
    // original ChoiceScript option, preserving its movement cost and replay lock.
    if (!radio || !document.documentElement.contains(radio)) {
      var forms = document.querySelectorAll("#main form");
      var labels = forms.length ? forms[forms.length - 1].querySelectorAll(".choice label") : [];
      for (var i = 0; i < labels.length; i++) {
        var found = labels[i].querySelector("input[type=radio]"), parsed = parseLabel(labels[i].textContent);
        if (found && slug(parsed.name) === id) { radio = found; break; }
      }
    }
    if (!radio || pressed || !radio.form) return;
    pressed = true;
    closeFly();
    hideTip();
    radio.checked = true;
    if (typeof radio.form.onsubmit === "function") radio.form.onsubmit();
  }

  // Small public seam for sidebar-only ally orders. It does not expose combat rules to JS: it merely presses
  // the live ChoiceScript option above, exactly like an icon in this HUD would.
  window.BattleHud = window.BattleHud || {};
  window.BattleHud.pick = pick;

  /* ---------------------------------------------------------------- variant pop-up */

  function flyEl() {
    var el = document.getElementById(FLY_ID);
    if (!el) {
      el = document.createElement("div");
      el.id = FLY_ID;
      document.body.appendChild(el);
    }
    return el;
  }
  function closeFly() {
    flyFor = null;
    var el = document.getElementById(FLY_ID);
    if (el && el.parentNode) el.parentNode.removeChild(el);
    var open = document.querySelector("#" + HUD_ID + " .bhud-slot.open");
    if (open) open.className = open.className.replace(/\s*\bopen\b/, "");
  }
  // A small row of buttons above the slot, one per variant. It lives on the body, not inside the dock: the dock scrolls and would clip it.
  // Positioned the way the hover card is: measured in viewport pixels, set in CSS pixels, so the screen-fit zoom does not move it.
  function openFly(id) {
    var e = null;
    for (var i = 0; i < seen.length; i++) if (seen[i].id === id) e = seen[i];
    var slot = document.querySelector("#" + HUD_ID + " .bhud-slot[data-id=\"" + id + "\"]");
    if (!e || !e.variants || !e.variants.length || !slot || !offered[id]) return;
    hideTip();
    closeFly();
    flyFor = id;
    slot.className += " open";
    var el = flyEl();
    el.innerHTML = "<div class=\"bfly-title\">" + esc(e.name) + "</div><div class=\"bfly-row\">" + e.variants.map(function (v) {
      var on = !!offered[v.id];
      var icon = variantArt(e, v) || iconFor(e.name);
      // The item menus (Potions, Read, Items, Throw, Shoot) show the art alone: the name and what the item does are on the hover card, the same card the Pack gives it.
      var iconOnly = !!(icon && ITEM_MENUS[e.id]);
      return "<button type=\"button\" class=\"bfly-btn bhud-" + e.group + (iconOnly ? " bfly-icon" : "") + (on ? "" : " off") + "\" data-bhud=\"pick\" data-id=\"" + esc(v.id) + "\" data-parent=\"" + esc(e.id) + "\"" +
        (on ? "" : " aria-disabled=\"true\"") + " aria-label=\"" + esc(v.label) + "\"" + (iconOnly ? "" : " title=\"" + esc(v.blurb) + "\"") + ">" +
        (icon ? "<img class=\"bhud-icon\" src=\"" + icon + "\" alt=\"\">" : "") + (iconOnly ? "" : "<span>" + esc(v.label) + "</span>") + "</button>";
    }).join("") + "</div>";
    el.className = "on";
    var z = window.UI_ZOOM || 1;
    var r = slot.getBoundingClientRect(), fr = el.getBoundingClientRect();
    var left = Math.min(Math.max(8, r.left + r.width / 2 - fr.width / 2), window.innerWidth - fr.width - 8);
    el.style.left = (left / z) + "px";
    el.style.top = (Math.max(8, r.top - fr.height - 8) / z) + "px";
  }
  // Booming Blade's variants are weapons ("Booming Blade: falchion"): each button wears the tile of the hand that weapon is in, the same art as the weapon buttons.
  // Anything else (True Strike: Weapon / Radiant) wears the spell's own icon.
  function variantArt(e, v) {
    // Throw: Grease Flask / Alchemist's Fire ... -- each thrown item wears its own art (ACTION_ICONS throw_<item>), the Throw icon when it has none.
    if (e.id === "throw") return (window.ACTION_ICONS || {})["throw_" + slug(v.label)] || "";
    // Shoot: Fire Arrow / Ice Arrow ... -- each special arrow wears its own art (ACTION_ICONS shoot_<item>).
    if (e.id === "shoot") return (window.ACTION_ICONS || {})["shoot_" + slug(v.label)] || "";
    // Items: Bramble Heart / future unique combat items -- one backpack button, each fly-out choice wearing its own art.
    if (e.id === "items") return (window.ACTION_ICONS || {})["items_" + slug(v.label)] || "";
    // Potions: Potion of Barkskin / Clear-Head Draught ... -- one Potions button, each drinkable wearing its own art (ACTION_ICONS potions_<slug of its title>).
    if (e.id === "potions") return (window.ACTION_ICONS || {})["potions_" + slug(v.label)] || "";
    // Read: Magic Missile Scroll / Bane Scroll ... -- each spell scroll wears its own art (ACTION_ICONS read_<slug of its title>).
    if (e.id === "read") return (window.ACTION_ICONS || {})["read_" + slug(v.label)] || "";
    if (e.id !== "booming_blade") return "";
    var st = statsNow(), art = window.ACTION_ICONS || {}, lab = String(v.label).toLowerCase();
    if (st.weapon && lab === String(st.weapon).toLowerCase()) return art.primary_melee || "";
    if (st.sidearm && lab === String(st.sidearm).toLowerCase()) return art.sidearm_melee || "";
    return "";
  }
  function toggleFly(id) {
    if (flyFor === id) closeFly(); else openFly(id);
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
  // Data-driven hover cards: computed from live window.stats + SPELL_FACTS / ACTION_FACTS / SPELL_REACH, never parsed from choice prose.
  var ATTACK_KIND = { melee: "Melee", finesse: "Finesse melee", reach: "Reach melee", ranged: "Ranged" };
  var REACH_NAME = { touch: "Engaged", short: "Short range", medium: "Mid-range", long: "Long range" };
  var COST_NAME = { action: "Action", bonus: "Bonus action", reaction: "Reaction", free: "Free", move: "Move", minute: "1 minute" };
  var SKILL_STAT = { athletics: "str", stealth: "dex", intimidation: "cha" };

  function signed(n) { return (n >= 0 ? "+" : "") + n; }
  function capFirst(t) { return t ? t.charAt(0).toUpperCase() + t.slice(1) : ""; }
  function ordinal(n) { return n === 1 ? "1st" : (n === 2 ? "2nd" : (n === 3 ? "3rd" : n + "th")); }
  function parseVariantSlot(label) {
    var m = /^(\d+)(?:st|nd|rd|th)?\s+level$/i.exec(String(label || "").trim());
    return m ? parseInt(m[1], 10) : 0;
  }
  function scaleDice(baseDice, extraDice, steps) {
    if (!steps || !extraDice) return baseDice;
    var b = /^(\d+)d(\d+)$/i.exec(baseDice || "");
    var x = /^(\d+)d(\d+)$/i.exec(extraDice || "");
    if (b && x && b[2] === x[2]) return (parseInt(b[1], 10) + parseInt(x[1], 10) * steps) + "d" + b[2];
    return baseDice + " + " + (steps > 1 ? steps + "\u00d7" : "") + extraDice;
  }
  function formatDiceAndMod(dice, flatMod) {
    if (!flatMod) return dice;
    return dice + (flatMod > 0 ? "+" + flatMod : String(flatMod));
  }
  function castingMod(s) {
    var cs = s.casting_stat;
    if (cs === "int" || cs === "cha" || cs === "wis") return num(s[cs + "_mod"]);
    return num(s.spell_damage_mod);
  }
  function spellAttackBonus(s) {
    return num(s.prof_bonus) + castingMod(s);
  }
  function spellSaveDc(s) {
    return s.spell_save_dc != null && isFinite(Number(s.spell_save_dc)) ? num(s.spell_save_dc) : (8 + num(s.prof_bonus) + castingMod(s));
  }
  function cantripStep(scaleObj, level) {
    var hit = null, keys = [5, 11, 17];
    for (var i = 0; i < keys.length; i++) if (level >= keys[i] && scaleObj[keys[i]]) hit = scaleObj[keys[i]];
    return hit;
  }
  function skillBonus(s, skill) {
    var stat = SKILL_STAT[skill];
    var mod = stat ? num(s[stat + "_mod"]) : 0;
    var prof = truthy(s["skill_" + skill]) ? num(s.prof_bonus) : 0;
    var exp = (s.expertise_1 === skill || s.expertise_2 === skill || s.expertise_3 === skill || s.expertise_4 === skill) ? num(s.prof_bonus) : 0;
    var ring = (skill === "athletics" && (s.equipped_ring1_id === "janna_forged_ring" || s.equipped_ring2_id === "janna_forged_ring")) ? 1 : 0;
    return mod + prof + exp + ring;
  }
  function weaponStats(s, pre, opts) {
    opts = opts || {};
    var desc = s[pre + "_desc"], type = s[pre + "_type"], hands = s[pre + "_hands"];
    if (!desc || desc === "None" || desc === "none" || !type || type === "none") return null;
    var strMod = num(s.str_mod), dexMod = num(s.dex_mod);
    var abMod = opts.useCasting ? castingMod(s) : (type === "ranged" ? dexMod : (type === "finesse" ? Math.max(strMod, dexMod) : strMod));
    var magic = num(s[pre + "_magic"]);
    var archery = (type === "ranged" && s.fighting_style === "archery") ? 2 : 0;
    var flimsy = truthy(s[pre + "_flimsy"]) ? -1 : 0;
    var atk = num(s.prof_bonus) + abMod + archery + magic + flimsy;
    var dice = type === "finesse" ? "1d4" : (type === "ranged" ? "1d6" : (hands === "two_handed" ? "1d12" : "1d8"));
    var dueling = (s.fighting_style === "dueling" && type !== "ranged" && hands !== "two_handed") ? 2 : 0;
    var rage = (!opts.ignoreRage && s.character_class === "barbarian" && truthy(s.is_raging) && type !== "ranged" && (type !== "finesse" || strMod > dexMod)) ? num(s.barbarian_rage_damage_bonus) : 0;
    var dmgMod = abMod + dueling + rage + magic;
    var rawDmg = String(s[pre + "_damage"] || "");
    var dmgType = opts.overrideDmgType || ((s[pre + "_damage_type"] && s[pre + "_damage_type"] !== "none") ? s[pre + "_damage_type"] : (rawDmg.split(/\s+/)[1] || ""));
    var range = type === "ranged" ? (REACH_NAME[s[pre + "_reach"] || "long"] || "Long range") : (type === "reach" ? "Engaged or Close" : "Engaged");
    var props = [];
    if (type === "finesse") props.push("Finesse");
    else if (type === "reach") props.push("Reach");
    props.push(hands === "two_handed" ? "Two-handed" : "One-handed");
    if (magic > 0) props.push(signed(magic) + " magic");
    else if (truthy(s[pre + "_magical"])) props.push("Magical");
    if (truthy(s[pre + "_silvered"])) props.push("Silvered");
    if (truthy(s[pre + "_adamantine"])) props.push("Adamantine");
    if (truthy(s[pre + "_flimsy"])) props.push("Flimsy (-1 hit)");
    var notes = [];
    if (s.fighting_style === "close_combat" && type === "ranged") notes.push("+2 dmg at Engaged");
    if (s.character_class === "rogue" && (type === "finesse" || type === "ranged") && num(s.rogue_sneak_dice) > 0) notes.push("+" + num(s.rogue_sneak_dice) + "d6 Sneak Attack");
    if (truthy(s.hex_active)) notes.push("+1d6 necrotic (Hex)");
    if (num(s.favored_foe_target_slot) > 0 && num(s.favored_foe_die_sides) > 0) notes.push("+1d" + num(s.favored_foe_die_sides) + " force (Hunter's Mark)");
    return {
      desc: desc, atk: atk, dice: dice, dmgMod: dmgMod, dmgType: dmgType,
      range: range, props: props, notes: notes,
      dmgExpr: formatDiceAndMod(dice, dmgMod) + (dmgType ? " " + dmgType : "")
    };
  }
  function weaponCard(id) {
    var pre = id === "primary_attack" ? "weapon" : (id === "sidearm_attack" ? "sidearm" : "");
    if (!pre) return "";
    var w = weaponStats(statsNow(), pre);
    if (!w) return "";
    return "<div class=\"bt-name\">" + esc(w.desc) + "</div>" +
      "<div class=\"bt-kind\">" + (pre === "weapon" ? "Primary weapon" : "Sidearm") + " \u00b7 Action</div>" +
      "<div class=\"bt-text\">" + esc(signed(w.atk) + " to hit \u00b7 " + w.dmgExpr) + "</div>" +
      "<div class=\"bt-text\">" + esc(w.props.concat([w.range]).join(" \u00b7 ")) + "</div>" +
      (w.notes.length ? "<div class=\"bt-text\">" + esc(w.notes.join(" \u00b7 ")) + "</div>" : "");
  }
  function spellCard(id, group, variantLabel) {
    var fact = (window.SPELL_FACTS || {})[id];
    if (!fact || !fact.combat) return "";
    var s = statsNow(), c = fact.combat, baseLevel = fact.level || 0;
    var slotLevel = parseVariantSlot(variantLabel) || baseLevel;
    var up = (baseLevel > 0 && slotLevel > baseLevel) ? (slotLevel - baseLevel) : 0;
    var cmod = castingMod(s), lvl = num(s.character_level);
    var title = fact.name + (variantLabel && !parseVariantSlot(variantLabel) ? " (" + variantLabel + ")" : "");
    var kindBits = [COST_NAME[c.cost] || KIND[group] || ""];
    if (slotLevel > 0) kindBits.push(ordinal(slotLevel) + "-level slot");
    if (fact.concentration) kindBits.push("Concentration");
    var mainBits = [], extraNotes = [];

    if (c.attack_kind === "weapon") {
      if (id === "true_strike") {
        var rad = variantLabel ? /radiant/i.test(variantLabel) : false;
        var wt = weaponStats(s, "weapon", { useCasting: true, ignoreRage: true, overrideDmgType: rad ? "radiant" : "" });
        var tsStep = c.cantrip_scale ? cantripStep(c.cantrip_scale, lvl) : null;
        if (wt) {
          var tsDmg = wt.dmgExpr + (tsStep && tsStep.extra_dice ? " + " + tsStep.extra_dice + " radiant" : "");
          mainBits.push(signed(wt.atk) + " to hit", tsDmg, wt.range);
        }
        if (!variantLabel) extraNotes.push("Weapon damage or radiant damage; uses casting ability");
      } else if (id === "booming_blade") {
        var pre = (variantLabel && s.sidearm && slug(variantLabel) === slug(s.sidearm)) ? "sidearm" : "weapon";
        var wb = weaponStats(s, pre);
        var bbStep = c.cantrip_scale ? cantripStep(c.cantrip_scale, lvl) : null;
        var moveDice = (bbStep && bbStep.on_move_dice) || c.base_move_dice || "1d8";
        if (wb) {
          var hitExtra = (bbStep && bbStep.on_hit_dice) ? " + " + bbStep.on_hit_dice + " thunder" : "";
          mainBits.push(signed(wb.atk) + " to hit", wb.dmgExpr + hitExtra, wb.range);
        }
        extraNotes.push("If target moves: " + moveDice + " thunder");
      }
    } else if (c.resolution === "attack") {
      var atkDice = c.damage_dice || "";
      if (up > 0 && c.upcast && c.upcast.damage_dice) atkDice = scaleDice(atkDice, c.upcast.damage_dice, up);
      var atkFlat = (c.add_casting_mod ? cmod : 0) + (id === "eldritch_blast" && truthy(s.inv_agonizing_blast) && num(s.cha_mod) > 0 ? num(s.cha_mod) : 0);
      if (atkDice) {
        var atkDmg = formatDiceAndMod(atkDice, atkFlat) + (c.damage_type ? " " + c.damage_type : "");
        if (c.damage_type === "poison" && s.equipped_armor_id === "poisoners_robes") atkDmg += " (+1d4 Poisoner's Robes)";
        mainBits.push(atkDmg);
      }
      mainBits.push(signed(spellAttackBonus(s)) + " to hit");
      if (id === "eldritch_blast" && truthy(s.inv_repelling_blast)) extraNotes.push("Repelling Blast: pushes Large or smaller 1 step back");
    } else if (c.resolution === "save") {
      var svDice = c.damage_dice || "";
      if (up > 0 && c.upcast && c.upcast.damage_dice) svDice = scaleDice(svDice, c.upcast.damage_dice, up);
      var svFlat = c.add_casting_mod ? cmod : 0;
      if (svDice) mainBits.push(formatDiceAndMod(svDice, svFlat) + (c.damage_type ? " " + c.damage_type : ""));
      if (c.save_ability) mainBits.push(capFirst(c.save_ability) + " save DC " + spellSaveDc(s));
      if (c.half_on_save) mainBits.push("half on a save");
    } else if (c.resolution === "auto") {
      var proj = (c.projectiles || 0) + (up > 0 && c.upcast && c.upcast.projectiles ? c.upcast.projectiles * up : 0);
      var perDart = formatDiceAndMod(c.damage_dice || "1d4", c.damage_flat || 0);
      mainBits.push((proj > 1 ? proj + " \u00d7 (" + perDart + ")" : perDart) + (c.damage_type ? " " + c.damage_type : ""), "Automatic hit");
    } else if (c.resolution === "heal") {
      mainBits.push(formatDiceAndMod(c.heal_dice || "1d4", c.add_casting_mod ? cmod : 0) + " healing");
    } else if (c.resolution === "effect") {
      if (c.temp_hp_dice || c.temp_hp_flat) {
        var thpFlat = (c.temp_hp_flat || 0) + (up > 0 && c.upcast && c.upcast.temp_hp_flat ? c.upcast.temp_hp_flat * up : 0);
        mainBits.push((c.temp_hp_dice ? formatDiceAndMod(c.temp_hp_dice, thpFlat) : String(thpFlat)) + " temp HP");
      }
      if (c.damage_flat && c.damage_type) mainBits.push(c.damage_flat + " " + c.damage_type + " to melee attackers");
    }

    var metaBits = [];
    var rch = fact.reach || (window.SPELL_REACH || {})[id];
    var rangeLabel = REACH_NAME[rch] || (fact.range && REACH_NAME[fact.range]) || "";
    var areaLabel = c.area || "";
    if (!areaLabel && c.upcast && c.upcast.targets) {
      var tCount = 1 + c.upcast.targets * up;
      areaLabel = tCount === 1 ? "1 foe" : "Up to " + tCount + " foes";
    }
    if (rangeLabel && areaLabel && areaLabel.toLowerCase() !== rangeLabel.toLowerCase()) metaBits.push(rangeLabel + " \u00b7 " + areaLabel);
    else if (rangeLabel || areaLabel) metaBits.push(rangeLabel || areaLabel);
    if (c.duration) metaBits.push(c.duration);

    if (c.effect && id !== "true_strike" && id !== "booming_blade" && id !== "armor_of_agathys") extraNotes.push(c.effect);
    var schoolLine = (baseLevel === 0 ? "Cantrip" : ordinal(slotLevel) + "-level") + " \u00b7 " + fact.school;
    return "<div class=\"bt-name\">" + esc(title) + "</div>" +
      "<div class=\"bt-kind\">" + esc(kindBits.filter(Boolean).join(" \u00b7 ")) + "</div>" +
      (mainBits.length ? "<div class=\"bt-text\">" + esc(mainBits.join(" \u00b7 ")) + "</div>" : "") +
      (metaBits.length ? "<div class=\"bt-text\">" + esc(metaBits.join(" \u00b7 ")) + "</div>" : "") +
      extraNotes.map(function (n) { return "<div class=\"bt-text\">" + esc(n) + "</div>"; }).join("") +
      "<div class=\"bt-school\">" + esc(schoolLine) + "</div>";
  }
  function actionCard(e, variantLabel) {
    var a = (window.ACTION_FACTS || {})[e.id];
    if (!a) return "";
    var s = statsNow(), costText = KIND[e.group] || COST_NAME[a.cost] || "";
    var kindBits = [costText, a.kind];
    if (a.uses_stat && a.max_stat && s[a.max_stat] != null) kindBits.push(num(s[a.uses_stat]) + "/" + num(s[a.max_stat]) + " uses");
    var mainBits = [], metaBits = [];
    if (e.id === "arcane_ward") {
      var wl = parseVariantSlot(variantLabel);
      if (wl > 0 && a.ward_per_level) mainBits.push("Restores " + (wl * a.ward_per_level) + " ward HP");
      if (s.arcane_ward_max != null) mainBits.push("Ward: " + num(s.arcane_ward_hp) + "/" + num(s.arcane_ward_max) + " HP");
    } else if (a.resolution === "heal") {
      mainBits.push(formatDiceAndMod(a.heal_dice || "1d10", a.add_level ? num(s.character_level) : 0) + " healing");
    } else if (a.resolution === "check" && a.skill) {
      var sk = skillBonus(s, a.skill);
      var dcText = (a.dc_stat && num(s[a.dc_stat]) > 0) ? " vs. DC " + num(s[a.dc_stat]) : "";
      mainBits.push(capFirst(a.skill) + " " + signed(sk) + dcText);
    } else if (a.attack_kind === "weapon") {
      var wa = weaponStats(s, "weapon");
      if (wa) mainBits.push(signed(wa.atk) + " to hit", wa.dmgExpr, wa.range);
    }
    var eff = a.effect || "";
    if (a.die_stat) eff = eff.replace(/\{die\}/g, "1d" + (num(s[a.die_stat]) || 6));
    if (a.bonus_stat) eff = eff.replace(/\{bonus\}/g, String(num(s[a.bonus_stat])));
    if (e.id === "magical_cunning") {
      var regain = Math.max(1, Math.ceil(num(s.warlock_slots_max) / 2));
      eff = eff.replace(/\{slots\}/g, String(regain)).replace(/\{slot_word\}/g, regain === 1 ? "slot" : "slots");
    }
    var loc = a.reach ? (REACH_NAME[a.reach] || a.reach) : (a.area || "");
    if (loc) metaBits.push(loc);
    if (a.duration) metaBits.push(a.duration);
    var title = a.name + (variantLabel ? " (" + variantLabel + ")" : "");
    return "<div class=\"bt-name\">" + esc(title) + "</div>" +
      "<div class=\"bt-kind\">" + esc(kindBits.filter(Boolean).join(" \u00b7 ")) + "</div>" +
      (mainBits.length ? "<div class=\"bt-text\">" + esc(mainBits.join(" \u00b7 ")) + "</div>" : "") +
      (metaBits.length ? "<div class=\"bt-text\">" + esc(metaBits.join(" \u00b7 ")) + "</div>" : "") +
      (eff ? "<div class=\"bt-text\">" + esc(eff) + "</div>" : "");
  }

  // The Pack's entry for an item named on a button: the names match the Pack's (a leading "The" or "Gnarled" aside), so the card says what the Pack's card says.
  function packItemFor(label) {
    var items = (window.INVENTORY && window.INVENTORY.items) || [], s = statsNow(), want = normName(label), best = null;
    if (!want) return null;
    for (var i = 0; i < items.length; i++) {
      var n = items[i].name, nm;
      try { n = typeof n === "function" ? n(s) : n; } catch (err) { n = ""; }
      nm = normName(String(n || "").replace(/\s*\u00d7\s*\d+$/, ""));
      if (nm === want) return items[i];
      if (!best && want.length >= 5 && (nm.indexOf(want) >= 0 || want.indexOf(nm) >= 0) && nm.length >= 5) best = items[i];
    }
    return best;
  }
  function normName(t) { return String(t || "").toLowerCase().replace(/^the\s+/, "").replace(/[^a-z0-9]+/g, ""); }
  function flyCardHtml(btn) {
    var pid = btn.getAttribute("data-parent"), vid = btn.getAttribute("data-id"), e = null, v = null, i, k;
    for (i = 0; i < seen.length; i++) if (seen[i].id === pid) e = seen[i];
    if (!e || !e.variants) return "";
    for (k = 0; k < e.variants.length; k++) if (e.variants[k].id === vid) v = e.variants[k];
    if (!v) return "";
    var on = !!offered[vid];
    if (!ITEM_MENUS[e.id]) {
      var card = spellCard(e.id, e.group, v.label) || actionCard(e, v.label);
      if (card) return card + (on ? "" : "<div class=\"bt-off\">" + esc(reasonFor({ id: vid, group: e.group })) + "</div>");
    }
    var item = packItemFor(v.label), s = statsNow(), name = v.label, badge = "", desc = "";
    if (item) {
      try {
        var nn = typeof item.name === "function" ? item.name(s) : item.name;
        name = String(nn || v.label).replace(/\s*\u00d7\s*\d+$/, "");
        badge = typeof item.badge === "function" ? item.badge(s) : (item.badge || "");
        desc = typeof item.description === "function" ? item.description(s) : (item.description || "");
      } catch (err) { /* the label alone will do */ }
    }
    return "<div class=\"bt-name\">" + esc(name) + "</div>" +
      "<div class=\"bt-kind\">" + esc([KIND[e.group], ITEM_MENUS[e.id]].filter(Boolean).join(" \u00b7 ")) + "</div>" +
      (badge ? "<div class=\"bt-meta\">" + esc(badge) + "</div>" : "") +
      (desc ? "<div class=\"bt-text\">" + esc(desc) + "</div>" : "") +
      (on ? "" : "<div class=\"bt-off\">" + esc(reasonFor({ id: vid, group: e.group })) + "</div>");
  }

  function showTip(slot) {
    var id = slot.getAttribute("data-id");
    if (slot.classList && slot.classList.contains("bfly-btn")) {
      var fc = flyCardHtml(slot);
      if (!fc) return hideTip();
      var fel = tipEl();
      fel.innerHTML = fc;
      fel.className = "on";
      var fz = window.UI_ZOOM || 1, fr = slot.getBoundingClientRect(), ft = fel.getBoundingClientRect();
      var fleft = Math.min(Math.max(8, fr.left + fr.width / 2 - ft.width / 2), window.innerWidth - ft.width - 8);
      // above the whole fly-out, so its title and its other buttons stay in view
      var fbox = document.getElementById(FLY_ID), fbr = fbox ? fbox.getBoundingClientRect() : fr;
      var ftop = fbr.top - ft.height - 6;
      if (ftop < 8) ftop = fbr.bottom + 6;
      fel.style.left = (fleft / fz) + "px";
      fel.style.top = (ftop / fz) + "px";
      tipFor = id;
      return;
    }
    var e = null;
    for (var i = 0; i < seen.length; i++) if (seen[i].id === id) e = seen[i];
    if (!e || flyFor === id) return;
    var on = !!offered[id];
    var el = tipEl();
    var card = weaponCard(id) || spellCard(id, e.group, "") || actionCard(e, "");
    if (card) {
      el.innerHTML = card + (on ? "" : "<div class=\"bt-off\">" + esc(reasonFor(e)) + "</div>");
    } else {
      el.innerHTML = "<div class=\"bt-name\">" + esc(e.name) + "</div>" +
        (KIND[e.group] ? "<div class=\"bt-kind\">" + KIND[e.group] + "</div>" : "") +
        (on ? "" : "<div class=\"bt-off\">" + esc(reasonFor(e)) + "</div>");
    }
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
    closeFly();
    lastSig = "";
  }

  function idle() {
    var el = document.getElementById(HUD_ID);
    if (!el || el.classList.contains("bhud-idle")) return;
    el.classList.add("bhud-idle");
    el.setAttribute("aria-hidden", "true");
    document.body.classList.remove("battleHudOn");
    hideTip();
    closeFly();
    lastSig = "";   // the next hub page rebuilds the dock
  }

  function scan() {
    var s = statsNow();
    var inFight = truthy(s.combat_engaged);
    if (!inFight) seen = [];
    var items = (inFight && !classic) ? hubItems() : null;
    if (!items && inFight && !classic && document.getElementById(HUD_ID)) {
      // A page between the hub's pages (a spell's targeting, the enemies' turns, a page turning): the dock stays where it is, dimmed and
      // inert, so the story frame and the battle stage above it do not jump down and back up after every click. The plain choice list is
      // shown again (battleHudOn off), because this page's options are not the hub's. The fight's end or the Classic list removes the dock.
      idle();
      return;
    }
    if (!items) {
      // Classic list asked for, or not the hub: put the dock away.
      remove();
      return;
    }
    remember(items);
    var sig = items.map(function (i) { return i.id; }).join("|") + "#" + seen.length + "#" + num(s.combat_player_actions_left) + "/" + num(s.combat_player_bonus_left) + "/" + num(s.combat_player_moves_left) + "/" + (truthy(s.player_oa_used) ? 1 : 0);
    var el = document.getElementById(HUD_ID);
    if (el && sig === lastSig) return;
    if (sig !== lastSig) { pressed = false; closeFly(); } // a new page of options: the old press is over
    if (!el) {
      el = document.createElement("div");
      el.id = HUD_ID;
      document.body.appendChild(el);
    }
    el.innerHTML = build();
    el.classList.remove("bhud-idle");
    el.removeAttribute("aria-hidden");
    document.body.classList.add("battleHudOn");
    lastSig = sig;
    dockHeight();
  }

  var queued = false;
  function queueScan() { if (!queued) { queued = true; window.requestAnimationFrame(function () { queued = false; scan(); }); } }

  document.addEventListener("click", function (ev) {
    var t = ev.target;
    while (t && t !== document && !(t.getAttribute && t.hasAttribute("data-bhud"))) t = t.parentNode;
    if (!t || t === document) { if (flyFor && !(ev.target.closest && ev.target.closest("#" + FLY_ID))) closeFly(); return; }
    var act = t.getAttribute("data-bhud");
    if (act === "fly") toggleFly(t.getAttribute("data-id"));
    else if (flyFor && act !== "pick") closeFly();
    if (act === "pick") pick(t.getAttribute("data-id"));
  });

  function slotOf(el) { return el && el.closest ? el.closest("#" + HUD_ID + " .bhud-slot, #" + HUD_ID + " .bhud-adv, #" + HUD_ID + " .bhud-weapon, #" + FLY_ID + " .bfly-btn") : null; }
  document.addEventListener("mouseover", function (ev) { var sl = slotOf(ev.target); if (sl) showTip(sl); else if (tipFor) hideTip(); });
  document.addEventListener("focusin", function (ev) { var sl = slotOf(ev.target); if (sl) showTip(sl); });
  document.addEventListener("focusout", function () { hideTip(); });

  // Number keys fire the numbered slot, like a real hotbar; C toggles Battle HUD / Classic list.
  document.addEventListener("keydown", function (ev) {
    if (ev.key === "Escape" && flyFor) { closeFly(); return; }
    if (ev.ctrlKey || ev.metaKey || ev.altKey || ev.shiftKey) return;
    if (document.querySelector("dialog[open]")) return;
    var tag = ev.target && ev.target.tagName ? ev.target.tagName.toLowerCase() : "";
    if (tag === "input" || tag === "textarea" || tag === "select") return;
    if ((ev.key === "c" || ev.key === "C") && !ev.repeat) {
      if (truthy(statsNow().combat_engaged) && hubItems()) {
        ev.preventDefault();
        classic = !classic;
        scan();
        return;
      }
    }
    if (!document.body.classList.contains("battleHudOn")) return;
    if (!/^[1-9]$/.test(ev.key)) return;
    var slot = document.querySelector("#" + HUD_ID + " .bhud-slot[data-key=\"" + ev.key + "\"]");
    if (slot) {
      ev.preventDefault();
      if (slot.getAttribute("data-bhud") === "fly") toggleFly(slot.getAttribute("data-id")); else pick(slot.getAttribute("data-id"));
    }
  });
  window.addEventListener("resize", dockHeight);

  function start() {
    if (window.MutationObserver) new MutationObserver(queueScan).observe(document.body, { childList: true, subtree: true });
    window.setInterval(scan, 500);
    scan();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();

  // Extend, not replace: BattleHud.pick (above) is what the sidebar's ally-order buttons press.
  window.BattleHud.scan = scan;
  window.BattleHud.parseLabel = parseLabel;
  window.BattleHud.isClassic = function () { return classic; };   // the battle stage (index.html) stands down with the Classic list
})();
