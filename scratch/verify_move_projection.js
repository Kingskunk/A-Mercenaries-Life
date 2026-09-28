// Verifies the movement projection added to combat_movement_check_loop (combat.txt, 2026-09-28)
// agrees with fight_pick_nearest_target, which remains the authority that performs the move.
// Both routines below are transcribed line-for-line from those labels; the test asserts the tier the
// Push Forward / Fall Back button text promises is the tier the move actually acts on.
//
// Run: node scratch/verify_move_projection.js
"use strict";

// --- verbatim transcription of fight_pick_nearest_target (combat.txt:849-891) -----------------
// Returns the slot it would select, or 0 if none is eligible. The `chosen`-clearing *else has no
// bearing on WHICH slot is picked, so it is modelled as a no-op here.
function pickNearest(direction, count, hp, range, chosen) {
  var active = 0;
  if (chosen > 0) {
    if (chosen <= count && hp[chosen] > 0) {
      var cr = range[chosen];
      if ((direction === "push" && cr > 0) || (direction === "fallback" && cr < 3)) {
        active = chosen;
      }
    }
  }
  if (active === 0) {
    var best = 0;
    for (var i = 1; i <= count; i++) {
      if (hp[i] > 0) {
        var r = range[i];
        var ok = (direction === "push" && r > 0) || (direction === "fallback" && r < 3);
        if (ok) {
          if (active === 0 || r < best) { active = i; best = r; }
        }
      }
    }
  }
  return active;
}

// --- verbatim transcription of the projection (combat.txt:1328-1376) --------------------------
// Returns the tier the move will act on, or 4 (= the "nothing eligible" sentinel) when the option
// is gated off entirely.
function projectTier(direction, count, hp, range, chosen) {
  var v = 4, lock = false;
  if (chosen > 0) {
    if (chosen <= count && hp[chosen] > 0) {
      var cr = range[chosen];
      if (direction === "push") {
        if (cr > 0) { v = cr; lock = true; }
      } else {
        if (cr < 3) { v = cr; lock = true; }
      }
    }
  }
  for (var i = 1; i <= count; i++) {
    if (hp[i] > 0) {
      var r = range[i];
      if (direction === "push") {
        if (r > 0) {
          if (lock === false && (v === 4 || r < v)) { v = r; }
        }
      } else {
        if (r < 3) {
          if (lock === false && (v === 4 || r < v)) { v = r; }
        }
      }
    }
  }
  return v;
}

// --- exhaustive comparison -------------------------------------------------------------------
var TIER = ["Engaged", "Close", "Mid-Range", "Long Range"];
var checked = 0, failures = [];

for (var count = 1; count <= 3; count++) {
  var slots = Math.pow(5, count);            // 0-3 tier + "down" per slot
  for (var enc = 0; enc < slots; enc++) {
    var range = [], hp = [], rest = enc;
    for (var s = 0; s < count; s++) {
      var v = rest % 5; rest = Math.floor(rest / 5);
      hp[s + 1] = v === 4 ? 0 : 1;            // v === 4 encodes a downed slot
      range[s + 1] = v === 4 ? 0 : v;
    }
    for (var chosen = 0; chosen <= count + 1; chosen++) {
      for (var d = 0; d < 2; d++) {
        var dir = d === 0 ? "push" : "fallback";
        var slot = pickNearest(dir, count, hp, range, chosen);
        var proj = projectTier(dir, count, hp, range, chosen);
        var actual = slot === 0 ? 4 : range[slot];
        checked++;
        if (proj !== actual) {
          failures.push({
            dir: dir, chosen: chosen, picked: slot, projected: proj, actual: actual,
            state: range.map(function (r, k) { return "s" + (k + 1) + "=" + (hp[k + 1] ? r : "down"); }).join(" ")
          });
        }
      }
    }
  }
}

console.log("States compared: " + checked);
if (failures.length === 0) {
  console.log("PASS - projected tier matches fight_pick_nearest_target in every state.");
} else {
  console.log("FAIL - " + failures.length + " mismatch(es):");
  failures.slice(0, 12).forEach(function (f) {
    console.log("  " + f.dir + " chosen=" + f.chosen + " [" + f.state + "]" +
      " -> picked slot " + f.picked +
      ", projected '" + (f.projected < 4 ? TIER[f.projected] : "none") + "'" +
      " but actual '" + (f.actual < 4 ? TIER[f.actual] : "none") + "'");
  });
  process.exitCode = 1;
}
