/*
 * INVENTORY PANEL -- an always-current view of equipped loadout and carried gear, with
 * in-panel swapping for anything that doesn't need attunement's CON/HP-max cascade (see
 * equipment-panel.js's header comment for that scope line and why it's drawn there).
 * Reads its catalog from inventory-data.js and live game state from window.stats (the
 * same object the stat sidebar and lorebook read), so it never goes stale; writes go
 * through EquipmentEngine (equipment-panel.js), never directly.
 *
 * Every equip control only ever offers the ids EquipmentEngine's catalog actually knows
 * about (from equipment.txt) AND that the player currently has access to -- "none" (or
 * "no shield equipped"), whatever's already equipped (even a class-starting loadout item
 * with no matching Satchel entry), and anything in the Satchel whose `equip.slot`
 * matches this slot. Attunement management (the Hearthstone Talisman) stays in the
 * Dossier's Equipment menu -- see inventory-data.js's item entry for why.
 *
 * Open with the Inventory button or the I key.
 */
(function () {
  "use strict";

  var INV = window.InventoryPanel = window.InventoryPanel || {};

  function truthy(v) { return v === true || v === "true"; }
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function evalField(v, s) { return typeof v === "function" ? v(s) : v; }

  function data() { return window.INVENTORY || { categories: [], equippedSlots: [], items: [] }; }

  function isOwned(item, s) {
    var o = item.owned;
    if (o === undefined || o === null) return true;
    if (typeof o === "function") return !!o(s);
    return truthy(s[o]);
  }

  // Turns a catalog entry into plain, ready-to-render values for the current game state.
  function resolve(item, s) {
    return {
      id: item.id,
      category: item.category,
      name: evalField(item.name, s),
      description: evalField(item.description, s),
      badge: evalField(item.badge, s) || ""
    };
  }

  function owned(s) {
    var out = [];
    data().items.forEach(function (item) {
      if (isOwned(item, s)) out.push(resolve(item, s));
    });
    return out;
  }

  /* ---------------------------------------------------------------- equipped slots */

  // Each shape knows how to turn a slot descriptor + live stats into {desc, meta, empty}.
  // "empty" governs the dimmed/placeholder styling for a slot with nothing worn.
  var EMPTY_DESCS = { "Bare head": 1, "None": 1, "Bare finger": 1, "Bare throat": 1, "Bare feet": 1, "none": 1 };

  function renderSlotValue(slot, s) {
    var desc = slot.desc ? (s[slot.desc] == null ? "" : String(s[slot.desc])) : "";
    var empty = !!EMPTY_DESCS[desc];
    var meta = "";
    if (slot.shape === "weapon") {
      var dmg = slot.dmg ? s[slot.dmg] : "";
      if (dmg && dmg !== "none") meta = String(dmg);
    } else if (slot.shape === "armor") {
      var ac = slot.ac ? s[slot.ac] : null;
      if (ac !== null && ac !== undefined && ac !== "") meta = "AC " + ac;
    } else if (slot.shape === "headwear") {
      if (truthy(s[slot.isArmor]) && Number(s[slot.ac]) > 0) meta = "+" + s[slot.ac] + " AC";
    } else if (slot.shape === "shield") {
      var hasShield = truthy(s.has_shield);
      var shieldOn = truthy(s.shield_equipped);
      desc = hasShield ? "Limestone Boss Shield" : "No shield carried";
      empty = !hasShield || !shieldOn;
      meta = hasShield ? (shieldOn ? "Equipped, +2 AC" : "Stowed") : "";
    }
    return { desc: desc, meta: meta, empty: empty };
  }

  // Every catalog id for this bucket that the player currently owns (via a Satchel
  // item's `equip.slot`), regardless of category filters -- the swap dropdown always
  // offers every eligible owned item, independent of whichever chip is selected below.
  function ownedIdsForBucket(bucket, s) {
    var ids = [];
    data().items.forEach(function (item) {
      if (item.equip && item.equip.slot === bucket && item.equip.id && isOwned(item, s)) {
        ids.push(item.equip.id);
      }
    });
    return ids;
  }

  // Builds the <option> list for one id-based slot: whatever's currently equipped
  // (even an unowned class-starting choice, so the dropdown never opens on a value
  // that isn't one of its own options) + this slot's `always` id(s) (the menu's own
  // "switch back to starting/origin-default" option) + every owned alternative.
  // Deliberately never offers "none"/unequip -- see inventory-data.js's header comment
  // on `swappable` for why that's a narrative-only state in the real menu, not
  // something a dropdown here should be able to reach.
  function buildSlotOptions(slot, currentId, s) {
    var ids = [];
    function add(id) { if (id && ids.indexOf(id) === -1) ids.push(id); }
    add(currentId);
    if (slot.always) evalField(slot.always, s).forEach(add);
    ownedIdsForBucket(slot.bucket, s).forEach(add);
    return ids.map(function (id) {
      return { id: id, label: window.EquipmentEngine.describeOption(slot.bucket, id) };
    });
  }

  function renderSlotControl(slot, s) {
    var EQ = window.EquipmentEngine;
    if (!EQ || !slot.swappable) return "";
    if (slot.bucket === "shield") {
      if (!truthy(s.has_shield)) return "";
      var twoHanded = s.weapon_hands === "two_handed";
      var on = truthy(s.shield_equipped);
      return '<button type="button" class="inv-slot-toggle" data-shield-toggle' +
        (twoHanded ? " disabled" : "") + ">" +
        (twoHanded ? "Can't carry — weapon needs both hands" : (on ? "Unequip Shield" : "Equip Shield")) +
        "</button>";
    }
    var currentId = EQ.getEquippedId(slot.bucket, slot.ringSlot);
    var options = buildSlotOptions(slot, currentId, s);
    if (options.length < 2) return ""; // nothing to swap to
    var html = '<select class="inv-slot-select" data-bucket="' + esc(slot.bucket) + '"' +
      (slot.ringSlot ? ' data-ring-slot="' + esc(slot.ringSlot) + '"' : "") + ">";
    options.forEach(function (opt) {
      html += '<option value="' + esc(opt.id) + '"' + (opt.id === currentId ? " selected" : "") + ">" +
        esc(opt.label) + "</option>";
    });
    html += "</select>";
    return html;
  }

  function renderEquippedSlots(s) {
    var slots = data().equippedSlots;
    var html = "";
    slots.forEach(function (slot) {
      var v = renderSlotValue(slot, s);
      html += '<div class="inv-slot' + (v.empty ? " inv-slot-empty" : "") + '">' +
        '<div class="inv-slot-label">' + esc(slot.label) + "</div>" +
        '<div class="inv-slot-desc">' + esc(v.desc) + "</div>" +
        (v.meta ? '<div class="inv-slot-meta">' + esc(v.meta) + "</div>" : "") +
        renderSlotControl(slot, s) +
        "</div>";
    });
    if (window.EquipmentEngine && s.equipped_sidearm_id && s.equipped_sidearm_id !== "none") {
      html += '<button type="button" class="inv-swap-sidearm" data-swap-sidearm>⇄ Swap Weapon &amp; Sidearm</button>';
    }
    return html;
  }

  /* ---------------------------------------------------------------------- DOM */

  if (typeof document === "undefined") return; // node tests stop here (mirrors lorebook.js)

  var dlg, elChips, elList, elCount, elSlots;
  var view = { category: "" };

  function statsNow() { return window.stats || {}; }

  function build() {
    if (dlg) return;
    dlg = document.createElement("dialog");
    dlg.id = "inventory";
    dlg.setAttribute("aria-label", "Inventory");
    dlg.innerHTML =
      '<div class="inv-head">' +
        "<h2>Inventory</h2>" +
        '<span class="inv-count"></span><span class="inv-spacer"></span>' +
        '<button type="button" class="inv-close" data-act="close" aria-label="Close inventory">×</button>' +
      "</div>" +
      '<div class="inv-body">' +
        '<section class="inv-section">' +
          '<h3 class="inv-section-title">Equipped Loadout</h3>' +
          '<div class="inv-slots"></div>' +
        "</section>" +
        '<section class="inv-section">' +
          '<h3 class="inv-section-title">Carried Gear &amp; Satchel</h3>' +
          '<div class="inv-chips"></div>' +
          '<div class="inv-list"></div>' +
        "</section>" +
      "</div>";
    document.body.appendChild(dlg);

    elSlots = dlg.querySelector(".inv-slots");
    elChips = dlg.querySelector(".inv-chips");
    elList = dlg.querySelector(".inv-list");
    elCount = dlg.querySelector(".inv-count");

    dlg.addEventListener("click", onClick);
    dlg.addEventListener("change", onChange);
    // Stop typing/keys from leaking to the game's own global hotkeys (J/K/Q/W/1-9)
    // while this panel is open, but still handle I here ourselves -- a listener on
    // document would never see it, since this one already stopped its propagation.
    dlg.addEventListener("keydown", function (ev) {
      ev.stopPropagation();
      // A <select>'s native dropdown uses letter keys for type-ahead (jump to the next
      // option starting with that letter) -- don't let closing-on-I steal that.
      if (isTextTarget(ev.target)) return;
      if ((ev.key === "i" || ev.key === "I") && !ev.ctrlKey && !ev.metaKey && !ev.altKey) {
        ev.preventDefault();
        close();
      }
    });
    dlg.addEventListener("mousedown", function (ev) { if (ev.target === dlg) close(); });
  }

  function categoryLabel(id) {
    var cats = data().categories;
    for (var i = 0; i < cats.length; i++) if (cats[i].id === id) return cats[i].label;
    return id;
  }

  function renderChips(current) {
    var counts = {};
    current.forEach(function (r) { counts[r.category] = (counts[r.category] || 0) + 1; });
    var html = '<button type="button" class="inv-chip" data-cat="" aria-pressed="' + (!view.category) + '">All<small>' +
      current.length + "</small></button>";
    data().categories.forEach(function (c) {
      if (!counts[c.id]) return;
      html += '<button type="button" class="inv-chip" data-cat="' + esc(c.id) + '" aria-pressed="' + (view.category === c.id) + '">' +
        esc(c.label) + "<small>" + counts[c.id] + "</small></button>";
    });
    elChips.innerHTML = html;
  }

  function render() {
    var s = statsNow();
    elSlots.innerHTML = renderEquippedSlots(s);

    var current = owned(s);
    elCount.textContent = current.length + (current.length === 1 ? " item carried" : " items carried");
    renderChips(current);

    var shown = view.category ? current.filter(function (r) { return r.category === view.category; }) : current;
    var html = "";
    if (!current.length) {
      html = '<div class="inv-empty">Your satchel holds only dry trail rations, flint and steel, and basic road gear.</div>';
    } else if (!shown.length) {
      html = '<div class="inv-empty">Nothing in this category.</div>';
    } else {
      var lastCat = null;
      shown.forEach(function (r) {
        if (!view.category && r.category !== lastCat) {
          lastCat = r.category;
          html += '<div class="inv-group">' + esc(categoryLabel(r.category)) + "</div>";
        }
        html += '<div class="inv-item">' +
          '<div class="inv-item-main">' +
            '<span class="inv-item-name">' + esc(r.name) + "</span>" +
            (r.badge ? '<span class="inv-item-badge">' + esc(r.badge) + "</span>" : "") +
          "</div>" +
          (r.description ? '<div class="inv-item-desc">' + esc(r.description) + "</div>" : "") +
          "</div>";
      });
    }
    elList.innerHTML = html;
  }

  function onClick(ev) {
    var t = ev.target;
    while (t && t !== dlg && !(t.getAttribute && (t.getAttribute("data-act") || t.hasAttribute("data-cat") ||
      t.hasAttribute("data-shield-toggle") || t.hasAttribute("data-swap-sidearm")))) t = t.parentNode;
    if (!t || t === dlg) return;
    var act = t.getAttribute("data-act");
    if (act === "close") return close();
    if (t.hasAttribute("data-cat")) {
      view.category = t.getAttribute("data-cat");
      render();
      return;
    }
    if (t.hasAttribute("data-shield-toggle")) {
      if (t.disabled) return;
      window.EquipmentEngine.equipItem("shield");
      render();
      return;
    }
    if (t.hasAttribute("data-swap-sidearm")) {
      window.EquipmentEngine.swapSidearm();
      render();
    }
  }

  function onChange(ev) {
    var t = ev.target;
    if (!t.hasAttribute || !t.hasAttribute("data-bucket")) return;
    var bucket = t.getAttribute("data-bucket");
    var ringSlot = t.getAttribute("data-ring-slot") || undefined;
    window.EquipmentEngine.equipItem(bucket, t.value, ringSlot);
    render();
  }

  function open() {
    build();
    if (dlg.open) return;
    view.category = "";
    render();
    if (!dlg.showModal) { window.alert("This browser is too old to show the Inventory."); return; }
    dlg.showModal();
  }

  function close() { if (dlg && dlg.open) dlg.close(); }
  function toggle() { if (dlg && dlg.open) close(); else open(); }

  INV.open = open;
  INV.close = close;
  INV.toggle = toggle;

  /* --------------------------------------------------------------- global keys */

  function isTextTarget(t) {
    if (!t || !t.tagName) return false;
    var tag = t.tagName.toLowerCase();
    return tag === "textarea" || tag === "select" || t.isContentEditable ||
      (tag === "input" && /^(text|search|number|email|password|url|tel)$/i.test(t.type || "text"));
  }

  document.addEventListener("keydown", function (ev) {
    if (ev.ctrlKey || ev.metaKey || ev.altKey) return;
    if (dlg && dlg.open) return; // the dialog's own listener handles I while it's open
    if (isTextTarget(ev.target)) return;
    if (document.querySelector("dialog[open]")) return; // another dialog (save/load, lorebook) is up
    if (ev.key === "i" || ev.key === "I") {
      ev.preventDefault();
      open();
    }
  });
})();
