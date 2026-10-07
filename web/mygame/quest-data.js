/*
 * QUEST LOG DATA -- which quests the stat sidebar lists as "active".
 *
 * Adding a quest = adding one object. The sidebar shows every quest whose `active(stats)`
 * returns true, so several can be live at once. The Lorebook's planned Quests tab will read
 * this same list.
 *
 *   id      unique slug
 *   title   shown in the sidebar
 *   place   the smaller line under the title (where the quest lives)
 *   active  function(stats) -> true while the quest is in progress
 *
 * Quest stage variables are set by the scenes (see quest/QUESTS.md). A quest that is
 * "unstarted", "resolved", "failed" or "declined" is not active and is not listed.
 */
(function () {
  "use strict";

  function truthy(v) { return v === true || v === "true"; }

  window.QUESTLOG = [
    {
      id: "hall_pests", title: "Vermin in the Walls", place: "Hiring Hall job",
      active: function (s) { return s.rj_pest_stage === "active" && Number(s.campaign_day) <= Number(s.rj_pest_until); }
    },
    {
      id: "hall_haul", title: "A House to Be Moved", place: "Hiring Hall job",
      active: function (s) { return s.rj_haul_stage === "active" && Number(s.campaign_day) <= Number(s.rj_haul_until); }
    },
    {
      id: "hall_watch", title: "The Night Watch", place: "Hiring Hall job",
      active: function (s) { return s.rj_watch_stage === "active" && Number(s.campaign_day) <= Number(s.rj_watch_until); }
    },
    {
      id: "hall_perform", title: "Music for an Evening", place: "Hiring Hall job",
      active: function (s) { return s.rj_perf_stage === "active" && Number(s.campaign_day) <= Number(s.rj_perf_until); }
    },
    {
      id: "silt_gate", title: "Silt-Gate Contraband", place: "The Silt-Gates",
      active: function (s) { return s.silt_gate_quest_stage === "active"; }
    },
    {
      id: "dry_lion", title: "The Dry Lion", place: "Middle Ward",
      active: function (s) { return s.dry_lion_quest_stage === "active"; }
    },
    {
      id: "a_key_for_every_door", title: "A Key for Every Door", place: "Middle Ward",
      active: function (s) { return s.a_key_quest_stage === "active"; }
    },
    {
      id: "rotten_rib", title: "The Rotten Rib", place: "Iron Wharves",
      active: function (s) { return s.rotten_rib_quest_stage === "active"; }
    },
    {
      id: "muffled_bell", title: "The Muffled Bell", place: "The Pier",
      active: function (s) { return s.bell_quest_stage === "active"; }
    },
    {
      id: "stolen_shroud", title: "The Stolen Shroud", place: "The Alley Shrine",
      active: function (s) { return s.shroud_quest_stage === "active"; }
    },
    {
      id: "quiet_block", title: "The Quiet Block", place: "Fishmongers' Slip",
      active: function (s) { return s.fish_quest_stage === "active"; }
    },
    {
      id: "toll_register", title: "Toll Register Delivery", place: "Gilded Scales",
      active: function (s) { return truthy(s.found_customs_vellum) && !truthy(s.turned_in_customs_vellum); }
    },
    {
      id: "lyra_errand", title: "Five Silver", place: "Dredge-End & the Compound",
      active: function (s) { return s.lyra_quest_stage === "active"; }
    },
    {
      id: "black_oath_night_list", title: "The Night List", place: "Dredge-End",
      active: function (s) { return s.black_oath_night_list_stage === "active"; }
    }
  ];
})();
