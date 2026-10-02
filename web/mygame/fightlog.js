/*
 * FIGHT LOG (2026-10-02) -- a passive recorder for balancing. It watches the live game state the way the battle HUD does and writes one record per fight
 * to the browser's localStorage ("mp_fightlog", newest 500). It never changes game state and never decides a rule; if this file is missing the game is unchanged.
 *
 * One record: when, class and level, allies (a squad fight lists them with their HP), HP at the start and end, the light state (a dungeon's torch or darkness), the enemies at the start (name, HP, AC),
 * every action taken (round, the option's own label text, the player's HP and each enemy's HP just before it), the outcome (victory, rescued, fled,
 * player_died) and how many rounds it ran. Actions are read from the form the moment it is submitted, whether the click came from the HUD or the plain list.
 *
 * Reading it back: window.FightLog.entries(), FightLog.download() (a .json file), FightLog.clear(). The Developer menu's "Export the fight log" option
 * sets stats.fightlog_export_req, which this file turns into a download.
 */
(function () {
  "use strict";
  var KEY = "mp_fightlog", CAP = 500;
  var cur = null;             // the fight in progress
  var wasEngaged = false;

  function s() { return window.stats || {}; }
  function truthy(v) { return v === true || v === "true"; }
  function num(v) { var n = Number(v); return isFinite(n) ? n : 0; }
  function load() { try { return JSON.parse(window.localStorage.getItem(KEY) || "[]"); } catch (e) { return []; } }
  function save(list) { try { window.localStorage.setItem(KEY, JSON.stringify(list.slice(-CAP))); } catch (e) { /* private window or full: the log just stops */ } }

  function enemies() {
    var out = [], n = Math.max(1, num(s().combat_enemy_count));
    for (var i = 1; i <= n; i++) {
      var p = "combat_enemy" + i + "_";
      if (!s()[p + "name"] || s()[p + "name"] === "none") continue;
      out.push({ name: s()[p + "name"], hp: num(s()[p + "hp"]), maxHp: num(s()[p + "max_hp"]), ac: num(s()[p + "ac"]) });
    }
    return out;
  }
  // What the player still had to spend and how far each enemy was when the option was picked (0 Engaged, 1 Close, 2 Mid-Range, 3 Long), so a turn that ended
  // on its own can be read back: it should only ever happen with nothing left to spend.
  function enemyRanges() {
    var out = [], n = Math.max(1, num(s().combat_enemy_count));
    for (var i = 1; i <= n; i++) { var nm = s()["combat_enemy" + i + "_name"]; if (nm && nm !== "none") out.push(num(s()["combat_enemy" + i + "_range"])); }
    return out;
  }
  function enemyHp() { return enemies().map(function (e) { return e.hp; }); }
  // Squad and ally fights: allies are recorded the same way (name, HP, AC), and each action notes their HP too.
  function allies() {
    var out = [], n = num(s().combat_ally_count);
    for (var i = 1; i <= n; i++) {
      var p = "combat_ally" + i + "_";
      if (!s()[p + "name"] || s()[p + "name"] === "none") continue;
      out.push({ name: s()[p + "name"], hp: num(s()[p + "hp"]), maxHp: num(s()[p + "max_hp"]), ac: num(s()[p + "ac"]) });
    }
    return out;
  }
  function allyHp() { return allies().map(function (a) { return a.hp; }); }

  function begin() {
    var st = s();
    cur = {
      at: new Date().toISOString(), cls: st.character_class, level: num(st.character_level), hpStart: num(st.hp_current), hpMax: num(st.hp_max),
      tempHp: num(st.temp_hp), ac: num(st.ac_shown), place: st.death_location_name, day: num(st.campaign_day), time: st.clock_time,
      dark: truthy(st.dg_dark), light: st.dg_light_kind || "none", lightLeft: num(st.dg_light_left), inDungeon: truthy(st.dg_in_run),
      enemies: enemies(), allies: allies(), actions: [], round: 0
    };
  }
  function end() {
    if (!cur) return;
    var st = s();
    cur.outcome = st.combat_outcome || "unknown";
    // The fight's own cleanup has already wiped the allies and may have healed the player, so the end state is the last one seen while the fight ran.
    cur.hpEnd = cur.lastHp;
    cur.alliesEnd = cur.lastAllyHp;
    cur.rounds = cur.round;
    var list = load(); list.push(cur); save(list);
    cur = null;
  }

  function wrapForms() {
    var forms = document.querySelectorAll("#main form");
    for (var i = 0; i < forms.length; i++) {
      var f = forms[i];
      if (f.__fightlogWrapped || typeof f.onsubmit !== "function") continue;
      f.__fightlogWrapped = true;
      (function (form, orig) {
        form.onsubmit = function () {
          try {
            if (cur) {
              var r = form.querySelector("input[type=radio]:checked");
              var lab = r && r.closest("label");
              var txt = lab ? lab.textContent.replace(/\s+/g, " ").trim() : "";
              if (txt) cur.actions.push({ round: cur.round, pick: txt.slice(0, 120), hp: num(s().hp_current), enemyHp: enemyHp(), allyHp: allyHp(),
                  left: { action: num(s().combat_player_actions_left), bonus: num(s().combat_player_bonus_left), move: num(s().combat_player_moves_left) }, range: enemyRanges() });
            }
          } catch (e) { /* never get in the way of the real submit */ }
          return orig.apply(this, arguments);
        };
      })(f, f.onsubmit);
    }
  }

  function download() {
    var blob = new Blob([JSON.stringify(load(), null, 1)], { type: "application/json" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "fightlog.json";
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  function tick() {
    var st = s();
    var on = truthy(st.combat_engaged);
    if (on && !wasEngaged) begin();
    if (!on && wasEngaged) end();
    wasEngaged = on;
    if (on && cur) { cur.round = Math.max(cur.round, num(st.combat_round)); cur.lastHp = num(st.hp_current); cur.lastAllyHp = allyHp(); wrapForms(); }
    if (truthy(st.fightlog_export_req)) { st.fightlog_export_req = false; download(); }
  }

  window.FightLog = { entries: load, download: download, clear: function () { save([]); } };
  window.setInterval(tick, 250);
})();
