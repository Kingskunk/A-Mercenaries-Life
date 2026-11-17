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
  var tipSlot = null;     // the slot element the card is showing for
  var tipTimer = null;    // pending switch from the name alone to the full card
  var TIP_FULL_MS = 1100; // hover this long before the full card opens (2026-11-15, the user): the name shows at once, so a passing pointer does not cover the field
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
    { id: "bonus", groups: ["bonus", "free"], cols: 4 },
    { id: "other", groups: ["other"], cols: 4 }
  ];
  // Read, Items and Potions still cost an action, but they are utility menus rather than attacks or spells.
  // Lay their parent buttons out with Flee and End turn without changing their action colouring,
  // availability checks, or the ChoiceScript options their fly-outs submit.
  var UTILITY_ACTIONS = { read: true, items: true, potions: true };
  // The fly-outs that hold items. Each button is its art alone, and its hover card is built from the Pack's own entry for the item (INVENTORY in inventory-data.js).
  var ITEM_MENUS = { potions: "Potion", read: "Scroll", items: "Item", throw: "Thrown", shoot: "Arrow" };
  var MIN_ROWS = 3;       // empty cells fill each grid to at least this many rows
  var KIND = { action: "Action", bonus: "Bonus action", free: "Free", move: "Movement", tactic: "Tactical movement", other: "" };

  // Reason texts keyed by combat_why_* codes emitted by fight_round_hub (combat.txt). Short factual phrases only, zero control hints.
  var REASON_TEXT = {
    armor: "Untrained armor blocks spells",
    no_slot_1: "No 1st-level slot left",
    no_slot_2: "No 2nd-level slot left",
    no_slot: "No spell slot left",
    no_hm_resource: "No Favored Enemy use or 1st-level slot left",
    no_favored_use: "No Favored Enemy use left",
    no_free_use: "Free cast already used",
    cannot_see: "You cannot see a target",
    no_engaged_foe: "No foe is Engaged",
    already_active: "Already active",
    already_armed: "Already armed",
    already_marked: "Target is already marked",
    already_frightened: "Target is already Frightened",
    already_paralyzed: "Every foe it can hold is already Paralyzed",
    not_humanoid: "No humanoid foe to hold",
    already_greased: "Target's ground is already greased",
    already_temp_hp: "Already have temporary hit points",
    nothing_burning: "No fire to spread",
    wearing_armor: "Cannot cast while wearing armor",
    no_hurt_target: "Nobody needs healing",
    no_valid_weapon: "No eligible weapon equipped",
    out_of_reach: "Out of reach",
    no_action: "No action left this turn",
    no_bonus: "No bonus action left this turn",
    no_reaction: "Reaction already used this round"
  };
  var WHY_RANK = [
    "armor", "no_slot_1", "no_slot_2", "no_slot", "no_hm_resource", "no_favored_use", "no_free_use",
    "cannot_see", "no_engaged_foe", "already_active", "already_armed", "already_marked",
    "already_frightened", "not_humanoid", "already_paralyzed", "already_greased", "already_temp_hp", "nothing_burning", "wearing_armor", "no_hurt_target",
    "no_valid_weapon", "out_of_reach", "no_action", "no_bonus", "no_reaction"
  ];
  // Canonical fight_round_hub option order so seeded unoffered spells land where the hub places them once offered.
  var HUB_ORDER = [
    "primary_attack", "shoot", "booming_blade", "true_strike", "bardic_inspiration",
    "swap_weapons", "reckless_attack", "dual_shot", "sidearm_attack", "shove",
    "push_forward", "fall_back", "dash",
    "control_flames", "blade_ward", "fire_bolt", "ray_of_frost", "ray_of_sickness",
    "shocking_grasp", "eldritch_blast", "chill_touch", "vicious_mockery", "poison_spray",
    "magic_missile", "hex", "armor_of_agathys", "mage_armor", "false_life",
    "dissonant_whispers", "cause_fear", "blindness", "hold_person", "shatter", "scorching_ray", "grease", "burning_hands",
    "thunderwave", "arms_of_hadar", "bane", "healing_word", "cure_wounds",
    "read", "dodge", "intimidate", "hide",
    "shield", "hellish_rebuke", "absorb_elements", "second_wind", "hunters_mark",
    "ensnaring_strike", "action_surge", "rage", "arcane_ward", "magical_cunning",
    "throw", "potions", "items", "flee", "end_turn"
  ];
  var HUB_RANK = {};
  HUB_ORDER.forEach(function (id, idx) { HUB_RANK[id] = idx; });

  // Magic Missile's darts at a slot level, from the spell data (spell-data.js SPELL_FACTS): the base count plus
  // one per level above the first. The two blurbs below use it so a new level never needs a typed number.
  var NUM_WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
  function dartWord(level) {
    var f = window.SPELL_FACTS && window.SPELL_FACTS.magic_missile && window.SPELL_FACTS.magic_missile.combat;
    var n = f ? num(f.projectiles) + num(f.upcast && f.upcast.projectiles) * (level - 1) : 0;
    return n > 0 && n < NUM_WORDS.length ? NUM_WORDS[n] : String(n);
  }

  // Spells seeded from turn 1 when their combat_why_* scene temp is present and not "unowned".
  var SEED_SPELLS = [
    {
      id: "booming_blade", group: "action", name: "Booming Blade", blurb: "Swing with thunder drawn tight along it.",
      getVariants: function (s) {
        var out = [];
        if (s.weapon && s.weapon !== "none" && (!s.equipped_weapon_id || s.equipped_weapon_id !== "none")) {
          out.push({ id: "booming_blade_" + slug(s.weapon), label: s.weapon, whyKey: "combat_why_booming_blade", blurb: "Strike with your " + s.weapon + " and wrap the target in booming energy." });
        } else if (readWhyTemp("combat_why_booming_blade") !== null) {
          out.push({ id: "booming_blade_weapon", label: "Weapon", whyKey: "combat_why_booming_blade", blurb: "Strike with a melee weapon and wrap the target in booming energy." });
        }
        if (s.sidearm && s.sidearm !== "none" && (!s.equipped_sidearm_id || s.equipped_sidearm_id !== "none") && readWhyTemp("combat_why_booming_blade_side") !== null) {
          out.push({ id: "booming_blade_" + slug(s.sidearm), label: s.sidearm, whyKey: "combat_why_booming_blade_side", blurb: "Strike with your " + s.sidearm + " and wrap the target in booming energy." });
        }
        return out;
      }
    },
    {
      id: "true_strike", group: "action", name: "True Strike", blurb: "Strike using your casting ability.",
      variants: [
        { id: "true_strike_weapon", label: "Weapon", whyKey: "combat_why_true_strike", blurb: "Strike using your casting ability for the weapon's own damage." },
        { id: "true_strike_radiant", label: "Radiant", whyKey: "combat_why_true_strike", blurb: "Strike using your casting ability, dealing radiant damage." }
      ]
    },
    { id: "control_flames", group: "action", name: "Control Flames", whyKey: "combat_why_control_flames", blurb: "Spread the fire on a burning foe to the others on its tile." },
    { id: "blade_ward", group: "action", name: "Blade Ward", whyKey: "combat_why_blade_ward", blurb: "Trace a shifting ward that spoils incoming attacks." },
    { id: "fire_bolt", group: "action", name: "Fire Bolt", whyKey: "combat_why_fire_bolt", blurb: "Hurl a mote of arcane flame." },
    { id: "ray_of_frost", group: "action", name: "Ray of Frost", whyKey: "combat_why_ray_of_frost", blurb: "Loose a beam of numbing cold." },
    {
      id: "ray_of_sickness", group: "action", name: "Ray of Sickness", blurb: "Loose a sickly green ray of poison.",
      variants: [
        { id: "ray_of_sickness_1st_level", label: "1st level", whyKey: "combat_why_ray_of_sickness", blurb: "Loose a sickly green ray of poison." },
        { id: "ray_of_sickness_2nd_level", label: "2nd level", whyKey: "combat_why_ray_of_sickness_2", blurb: "An empowered ray of poison: 3d8 instead of 2d8." }
      ]
    },
    { id: "shocking_grasp", group: "action", name: "Shocking Grasp", whyKey: "combat_why_shocking_grasp", blurb: "Drive a crackling jolt of lightning into a nearby foe." },
    { id: "eldritch_blast", group: "action", name: "Eldritch Blast", whyKey: "combat_why_eldritch_blast", blurb: "Unleash a crackling beam of eldritch force." },
    { id: "chill_touch", group: "action", name: "Chill Touch", whyKey: "combat_why_chill_touch", blurb: "Conjure a skeletal hand of necrotic frost." },
    { id: "vicious_mockery", group: "action", name: "Vicious Mockery", whyKey: "combat_why_vicious_mockery", blurb: "Hurl a barbed, perfectly-aimed insult." },
    { id: "poison_spray", group: "action", name: "Poison Spray", whyKey: "combat_why_poison_spray", blurb: "Fling a bitter puff of poison at the nearest foe." },
    {
      id: "magic_missile", group: "action", name: "Magic Missile", blurb: "Loose darts of force at targets you choose.",
      variants: [
        { id: "magic_missile_1st_level", label: "1st level", whyKey: "combat_why_magic_missile", blurb: "Loose " + dartWord(1) + " darts of force at targets you choose in the sidebar." },
        { id: "magic_missile_2nd_level", label: "2nd level", whyKey: "combat_why_magic_missile_2", blurb: "Loose " + dartWord(2) + " darts of force, spending a 2nd-level slot." }
      ]
    },
    { id: "hex", group: "bonus", name: "Hex", whyKey: "combat_why_hex", blurb: "Lay a baleful eldritch curse upon a foe." },
    { id: "armor_of_agathys", group: "action", name: "Armor of Agathys", whyKey: "combat_why_armor_of_agathys", blurb: "Sheathe yourself in spectral frost that punishes melee strikes." },
    { id: "mage_armor", group: "action", name: "Mage Armor", whyKey: "combat_why_mage_armor", blurb: "Lay a ward of unseen force over yourself: base AC 13 + Dexterity for 24 hours, while you wear no armor." },
    {
      id: "false_life", group: "action", name: "False Life", blurb: "Weave a necromantic shroud over your flesh.",
      variants: [
        { id: "false_life_1st_level", label: "1st level", whyKey: "combat_why_false_life", blurb: "Weave a necromantic shroud over your flesh: 1d4 + 4 temporary hit points for 12 hours." },
        { id: "false_life_2nd_level", label: "2nd level", whyKey: "combat_why_false_life_2", blurb: "An empowered shroud: 1d4 + 9 temporary hit points for 12 hours." }
      ]
    },
    {
      id: "dissonant_whispers", group: "action", name: "Dissonant Whispers", blurb: "A discordant psychic phrase wracks a foe.",
      variants: [
        { id: "dissonant_whispers_1st_level", label: "1st level", whyKey: "combat_why_dissonant_whispers", blurb: "A discordant psychic phrase wracks a foe." },
        { id: "dissonant_whispers_2nd_level", label: "2nd level", whyKey: "combat_why_dissonant_whispers_2", blurb: "An empowered phrase: 4d6 instead of 3d6." }
      ]
    },
    {
      id: "cause_fear", group: "action", name: "Cause Fear", blurb: "Plant a whispered dread in a foe.",
      variants: [
        { id: "cause_fear_1st_level", label: "1st level", whyKey: "combat_why_cause_fear", blurb: "Plant a whispered dread in a foe." },
        { id: "cause_fear_2nd_level", label: "2nd level", whyKey: "combat_why_cause_fear_2", blurb: "Plant a whispered dread in up to two creatures you choose in the sidebar." }
      ]
    },
    { id: "blindness", group: "action", name: "Blindness", whyKey: "combat_why_blindness", blurb: "Strike a foe blind." },
    { id: "scorching_ray", group: "action", name: "Scorching Ray", whyKey: "combat_why_scorching_ray", blurb: "Fling rays of fire, each at a foe you choose." },
    { id: "hold_person", group: "action", name: "Hold Person", whyKey: "combat_why_hold_person", blurb: "Lock one person rigid where they stand." },
    { id: "shatter", group: "action", name: "Shatter", whyKey: "combat_why_shatter", blurb: "Burst a crack of sound over a foe and every foe beside them." },
    { id: "grease", group: "action", name: "Grease", whyKey: "combat_why_grease", blurb: "Slick the ground under a foe and whatever is standing with it." },
    {
      id: "burning_hands", group: "action", name: "Burning Hands", blurb: "A thin sheet of flame washes over whatever stands too close.",
      variants: [
        { id: "burning_hands_1st_level", label: "1st level", whyKey: "combat_why_burning_hands", blurb: "A thin sheet of flame washes over whatever stands too close." },
        { id: "burning_hands_2nd_level", label: "2nd level", whyKey: "combat_why_burning_hands_2", blurb: "An empowered sheet of flame: 4d6 instead of 3d6." }
      ]
    },
    {
      id: "thunderwave", group: "action", name: "Thunderwave", blurb: "A wave of thunder rolls out from you and throws back whatever stands too close.",
      variants: [
        { id: "thunderwave_1st_level", label: "1st level", whyKey: "combat_why_thunderwave", blurb: "A wave of thunder rolls out from you and throws back whatever stands too close." },
        { id: "thunderwave_2nd_level", label: "2nd level", whyKey: "combat_why_thunderwave_2", blurb: "An empowered wave of thunder: 3d8 instead of 2d8." }
      ]
    },
    { id: "arms_of_hadar", group: "action", name: "Arms of Hadar", whyKey: "combat_why_arms_of_hadar", blurb: "Black arms lash every foe within reach, and what they catch cannot strike back." },
    { id: "bane", group: "action", name: "Bane", whyKey: "combat_why_bane", blurb: "Sour the aim and nerve of every foe still standing near you." },
    { id: "healing_word", group: "bonus", name: "Healing Word", whyKey: "combat_why_healing_word", blurb: "Speak a curative word across the fight." },
    { id: "cure_wounds", group: "action", name: "Cure Wounds", whyKey: "combat_why_cure_wounds", blurb: "Lay a hand on a wound and knit it closed with magic." },
    { id: "shield", group: "free", name: "Shield", whyKey: "combat_why_shield", blurb: "Hold the barrier-spell ready to snap into place when it can deflect a hit." },
    { id: "hellish_rebuke", group: "free", name: "Hellish Rebuke", whyKey: "combat_why_hellish_rebuke", blurb: "Hold a vengeful retort ready, to scorch whoever next wounds you." },
    { id: "absorb_elements", group: "free", name: "Absorb Elements", whyKey: "combat_why_absorb_elements", blurb: "Hold a ward ready, to turn an element's own force back into your next blow." },
    { id: "hunters_mark", group: "bonus", name: "Hunter's Mark", whyKey: "combat_why_hunters_mark", blurb: "Mark a foe as your quarry." },
    { id: "ensnaring_strike", group: "bonus", name: "Ensnaring Strike", whyKey: "combat_why_ensnaring_strike", blurb: "Your next weapon hit calls up thorned vines that bind the target." }
  ];
  var WHY_KEYS = {};
  SEED_SPELLS.forEach(function (sp) {
    if (sp.whyKey) WHY_KEYS[sp.id] = sp.whyKey;
    if (sp.variants) sp.variants.forEach(function (v) { WHY_KEYS[v.id] = v.whyKey; });
  });
  function seedVariants(sp) {
    if (!sp) return null;
    if (typeof sp.getVariants === "function") return sp.getVariants(statsNow());
    return sp.variants || null;
  }
  function whyKeyFor(id, parentId) {
    if (WHY_KEYS[id]) return WHY_KEYS[id];
    var parents = parentId ? [seedById(parentId)] : SEED_SPELLS;
    for (var i = 0; i < parents.length; i++) {
      var vars = seedVariants(parents[i]);
      if (!vars) continue;
      for (var j = 0; j < vars.length; j++) if (vars[j].id === id) return vars[j].whyKey;
    }
    return null;
  }
  function sceneTemps() {
    var s = statsNow();
    return (s.scene && s.scene.temps) ? s.scene.temps : null;
  }
  function readWhyTemp(key) {
    var t = sceneTemps();
    if (!t || !Object.prototype.hasOwnProperty.call(t, key)) return null;
    var v = t[key];
    if (v == null || v === "unowned") return null;
    return String(v);
  }
  function seedById(id) {
    for (var i = 0; i < SEED_SPELLS.length; i++) if (SEED_SPELLS[i].id === id) return SEED_SPELLS[i];
    return null;
  }

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

  function activeVariantsFor(seed, liveVariants) {
    var liveMap = {};
    (liveVariants || []).forEach(function (v) { liveMap[v.id] = v; });
    var out = [];
    (seedVariants(seed) || []).forEach(function (sv) {
      var live = liveMap[sv.id];
      var code = readWhyTemp(sv.whyKey);
      if (live || code !== null) {
        out.push({
          id: sv.id,
          label: live ? live.label : sv.label,
          blurb: live ? live.blurb : sv.blurb,
          radio: live ? live.radio : null
        });
      }
    });
    return out;
  }

  function insertSeen(entry, followingItems) {
    var rank = HUB_RANK.hasOwnProperty(entry.id) ? HUB_RANK[entry.id] : -1;
    var k;
    if (rank >= 0) {
      for (k = 0; k < seen.length; k++) {
        var r = HUB_RANK.hasOwnProperty(seen[k].id) ? HUB_RANK[seen[k].id] : -1;
        if (r > rank) { seen.splice(k, 0, entry); return; }
      }
    }
    if (followingItems) {
      for (var j = 0; j < followingItems.length; j++) {
        for (k = 0; k < seen.length; k++) if (seen[k].id === followingItems[j].id) { seen.splice(k, 0, entry); return; }
      }
    }
    seen.push(entry);
  }

  // Folds the page's current options into the remembered list. Seeded spells with a live combat_why_* temp sit in exact hub order
  // from turn one even before they can be cast; everything else keeps its hub splice position.
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
      var seed = seedById(it.id);
      var variants = seedVariants(seed) ? activeVariantsFor(seed, it.variants) : it.variants;
      for (k = 0; k < seen.length; k++) if (seen[k].id === it.id) { at = k; break; }
      if (at >= 0) { seen[at].blurb = it.blurb; seen[at].group = it.group; if (variants) seen[at].variants = variants; return; }
      insertSeen({ id: it.id, group: it.group, name: it.name, blurb: it.blurb, variants: variants }, items.slice(i + 1));
    });
    SEED_SPELLS.forEach(function (sp) {
      var at = -1;
      for (var k = 0; k < seen.length; k++) if (seen[k].id === sp.id) { at = k; break; }
      if (seedVariants(sp)) {
        var vars = activeVariantsFor(sp, at >= 0 ? seen[at].variants : []);
        if (!vars.length) return;
        if (at >= 0) { seen[at].variants = vars; return; }
        insertSeen({ id: sp.id, group: sp.group, name: sp.name, blurb: vars[0].blurb, variants: vars }, null);
      } else if (readWhyTemp(sp.whyKey) !== null) {
        if (at >= 0) return;
        insertSeen({ id: sp.id, group: sp.group, name: sp.name, blurb: sp.blurb }, null);
      }
    });
  }

  function whyForSlot(e) {
    var sp = seedById(e.id);
    var spVars = seedVariants(sp);
    if (spVars) {
      var codes = [];
      spVars.forEach(function (v) {
        var c = readWhyTemp(v.whyKey);
        if (c !== null && c !== "") codes.push(c);
      });
      if (!codes.length) return null;
      if (codes.length > 1 && codes.every(function (c) { return c === "no_slot_1" || c === "no_slot_2"; })) return "no_slot";
      var best = codes[0], bestRank = WHY_RANK.indexOf(best);
      for (var i = 1; i < codes.length; i++) {
        var r = WHY_RANK.indexOf(codes[i]);
        if (r > bestRank) { best = codes[i]; bestRank = r; }
      }
      return best;
    }
    var key = whyKeyFor(e.id, e.parentId);
    if (!key) return null;
    var code = readWhyTemp(key);
    return (code && code !== "") ? code : null;
  }

  // Why a remembered action is not on the page right now. Prefers live combat_why_* scene temps for spells, falling back to non-spell slot guesses.
  function reasonFor(e) {
    var code = whyForSlot(e);
    if (code) return REASON_TEXT[code] || code;
    var s = statsNow();
    if (e.group === "move") {
      if (e.id === "push_forward") return "Nothing to advance on, the chokepoint is held, or you cannot move now";
      return "You are not in melee reach, or you cannot move now";
    }
    if (e.group === "tactic") return "No ally is holding a chokepoint, or you cannot move now";
    if (e.group === "action" && num(s.combat_player_actions_left) <= 0) return "No action left this turn";
    if (e.group === "bonus" && num(s.combat_player_bonus_left) <= 0) return "No bonus action left this turn";
    // A melee weapon can only strike an enemy in reach; fights now open at Close range, so this is the usual reason on the first turn.
    if ((e.id === "primary_attack" || e.id === "sidearm_attack") && (e.id === "primary_attack" ? s.weapon_type : s.sidearm_type) !== "ranged") return "Out of reach. Advance (free movement) to close in, then strike";
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
    if (!e || !e.variants || !e.variants.length || !slot) return;
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
        (on ? "" : " aria-disabled=\"true\"") + " aria-label=\"" + esc(v.label) + "\"" + ">" +   // no title attribute: the browser drew its own plain tooltip (the option's blurb) beside the styled card
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
  function hideTip() { var el = document.getElementById(TIP_ID); if (el) el.className = ""; tipFor = null; tipSlot = null; if (tipTimer) { clearTimeout(tipTimer); tipTimer = null; } }
  // Pointer or focus arrived on a slot: the name at once, the full card after TIP_FULL_MS on the same slot. Moving about inside one slot restarts nothing.
  function hoverTip(slot) {
    if (slot === tipSlot) return;
    hideTip();
    showTip(slot, false);
    if (!tipFor) return;
    tipSlot = slot;
    tipTimer = setTimeout(function () {
      tipTimer = null;
      if (tipSlot === slot && document.body.contains(slot)) showTip(slot, true);
    }, TIP_FULL_MS);
  }
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
      if (card) return card + (on ? "" : "<div class=\"bt-off\">" + esc(reasonFor({ id: vid, group: e.group, parentId: pid })) + "</div>");
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

  function showTip(slot, full) {
    var id = slot.getAttribute("data-id");
    if (slot.classList && slot.classList.contains("bfly-btn")) {
      var fc = flyCardHtml(slot);
      if (!fc) return hideTip();
      var fel = tipEl();
      fel.innerHTML = fc;
      fel.className = full ? "on full" : "on";
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
        // No facts recorded for this action yet (a new option): fall back to the option's own blurb, so the card is never just a name.
        (e.blurb && e.blurb.replace(/[^A-Za-z]/g, "").length > 2 && e.blurb !== e.name ? "<div class=\"bt-text\">" + esc(e.blurb) + "</div>" : "") +
        (on ? "" : "<div class=\"bt-off\">" + esc(reasonFor(e)) + "</div>");
    }
    el.className = full ? "on full" : "on";
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
    var temps = sceneTemps(), whySig = [];
    if (temps) {
      var seenKeys = {};
      Object.keys(WHY_KEYS).forEach(function (k) { seenKeys[WHY_KEYS[k]] = true; });
      SEED_SPELLS.forEach(function (sp) {
        var vars = seedVariants(sp);
        if (vars) vars.forEach(function (v) { if (v.whyKey) seenKeys[v.whyKey] = true; });
      });
      seenKeys.combat_why_booming_blade = true;
      seenKeys.combat_why_booming_blade_side = true;
      Object.keys(seenKeys).sort().forEach(function (tk) {
        if (temps[tk] != null && temps[tk] !== "unowned") whySig.push(tk + "=" + temps[tk]);
      });
    }
    var sig = items.map(function (i) { return i.id; }).join("|") + "#" + seen.length + "#" + num(s.combat_player_actions_left) + "/" + num(s.combat_player_bonus_left) + "/" + num(s.combat_player_moves_left) + "/" + (truthy(s.player_oa_used) ? 1 : 0) + "#" + whySig.join(",");
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
  document.addEventListener("mouseover", function (ev) { var sl = slotOf(ev.target); if (sl) hoverTip(sl); else if (tipFor) hideTip(); });
  document.addEventListener("focusin", function (ev) { var sl = slotOf(ev.target); if (sl) hoverTip(sl); });
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
