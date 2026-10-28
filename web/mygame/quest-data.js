/*
 * QUEST LOG DATA -- which quests the stat sidebar lists as "active".
 *
 * Adding a quest = adding one object. The sidebar shows every quest whose `active(stats)`
 * returns true, so several can be live at once. The Lorebook's planned Quests tab will read
 * this same list.
 *
 *   id      unique slug
 *   title   shown in the sidebar (or function(stats) -> text, for an entry that changes with the save)
 *   place   the smaller line under the title (where the quest lives; also may be function(stats))
 *   active  function(stats) -> true while the quest is in progress
 *   levelProgress  optional: true if a successful completion adds to the level-up quest total;
 *                  a short string when a particular successful resolution is required
 *   group     optional: "job" for a Hiring Hall job or a courier parcel, which the sidebar lists under its own heading below the quests
 *   giver     optional: who gave it (text or function(stats)), shown on the hover card
 *   goal      optional: one sentence of what to do next (text or function(stats)), shown on the hover card
 *   progress  optional: function(stats) -> [{label, have, need}], drawn as a progress line under the title and listed on the card
 *   clues     optional: function(stats) -> [text], only what the player has FOUND (never a lead they have not met), listed on the card
 *   insignia  optional: true if finishing it adds to the Contractor's Insignia job count (said on the card)
 *
 * Quest stage variables are set by the scenes (see quest/QUESTS.md). A quest that is
 * "unstarted", "resolved", "failed" or "declined" is not active and is not listed.
 */
(function () {
  "use strict";

  function truthy(v) { return v === true || v === "true"; }

  // The season, as the game counts it for Ambrose's order and the Old Grove: year x 4 + season, three months a season (calendar.txt).
  function ambSeason(s) { return Number(s.calendar_year) * 4 + Math.floor((Number(s.calendar_month_num) - 1) / 3); }
  // The second line of a Hiring Hall job: where to go, then how long is left. Every job keeps its last day in rj_<job>_until; the term is the days up to and including it.
  var WARDS = { middle_ward: "Middle Ward", quarter: "Patrician Quarter", docks: "Harbor Quayside" };
  function daysLeft(s, until) {
    var left = Number(until) - Number(s.campaign_day) + 1;
    return left === 1 ? "last day" : left + " days left";
  }
  function hallPlace(job, ward, extra) {
    return function (s) {
      var w = typeof ward === "function" ? ward(s) : ward;
      var place = String(s["rj_" + job + "_place"]); return place.charAt(0).toUpperCase() + place.slice(1) + " · " + WARDS[w] + (extra ? " · " + extra : "") + " · " + daysLeft(s, s["rj_" + job + "_until"]);
    };
  }
  // The wagon job: before the caravan rolls the place to be and when; once it is on the road, where it is going.
  function escortPlace(s) {
    if (truthy(s.rj_escort_road)) return "On the road to " + s.rj_escort_dest_name;
    var yard = String(s.rj_escort_place_text); yard = yard.charAt(0).toUpperCase() + yard.slice(1);
    return yard + " · rolls two hours after " + s.rj_escort_opens + (Number(s.campaign_day) >= Number(s.rj_escort_until) ? " this morning" : " tomorrow");
  }

  // The courier's satchel (port_valen/radiant/hall_courier.txt): one entry per slot, naming who the parcel is for and where to take it, so the sidebar says where to go. Not a quest and not toward levelling.
  function courierEntry(n) {
    var p = "crs" + n + "_";
    return {
      id: "courier_" + n,
      title: function (s) { return "Courier: " + s[p + "who"]; },
      place: function (s) {
        var left = Number(s[p + "until"]) - Number(s.campaign_day) + 1;
        return s[p + "to_name"] + ", " + s[p + "place"] + " · " + (left === 1 ? "last day" : left + " days left");
      },
      active: function (s) { return truthy(s[p + "on"]) && Number(s.campaign_day) <= Number(s[p + "until"]); }
    };
  }

  window.QUESTLOG = [
    {
      id: "hall_pests", title: "Vermin in the Walls", place: hallPlace("pest", function (s) { return s.rj_pest_where; }),
      active: function (s) { return s.rj_pest_stage === "active" && Number(s.campaign_day) <= Number(s.rj_pest_until); }
    },
    {
      id: "hall_haul", title: "A House to Be Moved", place: hallPlace("haul", "middle_ward"),
      active: function (s) { return s.rj_haul_stage === "active" && Number(s.campaign_day) <= Number(s.rj_haul_until); }
    },
    {
      id: "hall_watch", title: "The Night Watch", place: hallPlace("watch", "docks", "signs on at dusk"),
      active: function (s) { return s.rj_watch_stage === "active" && Number(s.campaign_day) <= Number(s.rj_watch_until); }
    },
    {
      id: "hall_perform", title: "Music for an Evening", place: hallPlace("perf", function (s) { return s.rj_perf_where; }, "starts at dusk"),
      active: function (s) { return s.rj_perf_stage === "active" && Number(s.campaign_day) <= Number(s.rj_perf_until); }
    },
    {
      id: "hall_escort_tm", title: "Wagon Escort to Timbermouth", place: escortPlace,
      active: function (s) { return s.rj_escort_stage === "active" && s.rj_escort_to === "tm" && (truthy(s.rj_escort_road) || Number(s.campaign_day) <= Number(s.rj_escort_until)); }
    },
    {
      id: "hall_escort_pv", title: "Wagon Escort to Port Valen", place: escortPlace,
      active: function (s) { return s.rj_escort_stage === "active" && s.rj_escort_to === "pv" && s.rj_escort_from === "tm" && (truthy(s.rj_escort_road) || Number(s.campaign_day) <= Number(s.rj_escort_until)); }
    },
    {
      id: "hall_escort_af", title: "Wagon Escort to Alderford", place: escortPlace,
      active: function (s) { return s.rj_escort_stage === "active" && s.rj_escort_to === "af" && (truthy(s.rj_escort_road) || Number(s.campaign_day) <= Number(s.rj_escort_until)); }
    },
    {
      id: "hall_escort_pv_af", title: "Wagon Escort to Port Valen", place: escortPlace,
      active: function (s) { return s.rj_escort_stage === "active" && s.rj_escort_to === "pv" && s.rj_escort_from === "af" && (truthy(s.rj_escort_road) || Number(s.campaign_day) <= Number(s.rj_escort_until)); }
    },
    courierEntry(1), courierEntry(2), courierEntry(3),
    {
      // Ambrose's Deep-Wood Order (port_valen/port_valen_middle_ward.txt, 2026-10-19): shadefern and acorn truffle from the Old Grove, brought in at one time. Not a Hall job. Every delivered order counts toward level progress (the user), and a seasonal repeat is gone when its season ends.
      id: "ambrose_order", title: "Ambrose's Deep-Wood Order",
      giver: "Master Ambrose, the Still-Room in Herb-Pounder Close",
      place: function (s) { return "Port Valen · Herb-Pounder Close" + (truthy(s.amb_repeat) ? " · this season only" : ""); },
      levelProgress: true,
      goal: function (s) { return "Bring him " + s.amb_need_fern + " shadefern and " + s.amb_need_truffle + " acorn truffle, cut clean and wrapped dry, all at one time."; },
      progress: function (s) { return [{ label: "Shadefern", have: Number(s.shadefern) || 0, need: Number(s.amb_need_fern) || 0 }, { label: "Acorn truffle", have: Number(s.acorn_truffle) || 0, need: Number(s.amb_need_truffle) || 0 }]; },
      clues: function (s) {
        var c = [];
        if (truthy(s.amb_q_where)) c.push("They grow in the deepest part of the Longshade, among the oldest trees.");
        if (truthy(s.amb_q_why)) c.push("He cannot buy them in the city.");
        return c;
      },
      active: function (s) { return s.amb_order_stage === "active" && (!truthy(s.amb_repeat) || Number(s.amb_order_season) === ambSeason(s)); }
    },
    {
      // Bark's quest (longshade/longshade_forest.txt, 2026-10-19; quest/Bark's Quest and the Burning Tree.md): taken from Bark in the Longshade, in progress until it is finished or the player walks away from the burning grove (lsf_bark_failed, which also clears lsf_bark_accepted). A finished or failed quest simply leaves the list.
      id: "bark_poisoned_water", title: "The Troubled Water",
      giver: "Bark, the old tree in the Longshade",
      place: "Longshade Forest · northwest of the Hazel Clearing",
      goal: function (s) {
        if (truthy(s.lsf_corruption_cleared)) return "Return to Bark in his glade.";
        if (truthy(s.lsf_grove_seen) && s.lsf_tree_state === "burning") return "Put out the burning oak in the grove.";
        if (truthy(s.lsf_grove_seen)) return "Find out what is poisoning the water.";
        return "Follow the stream northwest and find what is poisoning the water.";
      },
      clues: function (s) {
        var c = [];
        if (truthy(s.lsf_corruption_found)) c.push("The pool at the head of the path is poisoned. Drinking it clouds the mind.");
        if (truthy(s.lsf_grove_seen)) c.push("At the end of the stream a great oak is burning, and two swarms of sprites are at war over it.");
        if (truthy(s.lsf_dubhar_felt)) c.push("Something in the grove was watching you.");
        return c;
      },
      active: function (s) { return truthy(s.lsf_bark_accepted) && !truthy(s.lsf_bark_failed) && !truthy(s.lsf_bark_reward); }
    },
    {
      // The Overdue Peddler (timbermouth/barleycross/overdue_peddler.txt, 2026-10-19): taken on a job board with the Contractor's Insignia, briefed and paid at the wife's cottage. No term. Counts toward the level-2 pool and on the insignia.
      id: "overdue_peddler", title: "Word of Aldis Pellam",
      giver: "Merel Pellam, the last cottage on the Barleycross Lane",
      place: function (s) { return truthy(s.dg_seen_lsf_r12) ? "Barleycross · tell Merel Pellam what you found" : "Barleycross · the last cottage on the Lane"; },
      goal: function (s) { return truthy(s.dg_seen_lsf_r12) ? "Tell Merel Pellam what became of her husband." : "Learn what became of Aldis Pellam in the Longshade, and tell his wife."; },
      clues: function (s) {
        var c = [];
        if (truthy(s.peddler_met_wife)) c.push("Aldis gathered plants in the Longshade to sell in Port Valen, with two hired guards.");
        if (truthy(s.peddler_lead_inn)) c.push("The woman at the Ashrun House saw him go into the forest at first light.");
        if (truthy(s.peddler_lead_odile)) c.push("Odile and Bram heard something scream near the middle of the forest.");
        if (truthy(s.lsf_camp_read)) c.push("A big cat wrecked a camp in the forest, and someone there fought back.");
        if (truthy(s.has_pellam_pouch)) c.push("You hold a leaf-stitched pouch from the camp.");
        if (truthy(s.dg_seen_lsf_r12)) c.push("You found the three of them in a clearing.");
        if (truthy(s.lsf_dead_buried)) c.push("You buried them there, under stones.");
        return c;
      },
      insignia: true,
      levelProgress: true,
      active: function (s) { return s.peddler_stage === "active"; }
    },
    {
      // The Weight of the Road (alderford/whitefold/the_weight_of_the_road.txt): offered on a clear, wet morning when the Whitefold road wall collapses; the player offers their services to Edda Cale. Counts toward the level-2 pool only once a successful repair is carried through the Common's reckoning, and on the insignia.
      id: "weight_road", title: "The Weight of the Road",
      giver: "Edda Cale, Commonwarden of Whitefold",
      place: "Whitefold · the Limestone Cut road",
      clues: function (s) {
        var c = [];
        if (truthy(s.weight_road_hessa_reviewed)) c.push("Hessa says the wall had been left open since the thaw, and calls the heavy loads ordinary variation.");
        if (truthy(s.weight_road_hessa_evidence)) c.push("Hessa's notebook carries one extra block against cart after cart that the clean dispatch tally leaves out.");
        if (truthy(s.weight_road_nerin_reviewed)) c.push("Nerin says the quarry's spoil closed the high sheep track, so the upper flocks have come down the Cut road since the thaw.");
        if (truthy(s.weight_road_nerin_evidence)) c.push("The penned sheep carry quarry dust and ditch mud from three upper folds that never share a lane.");
        if (truthy(s.weight_road_perrin_evidence)) c.push("Perrin saw road crewmen wheel a handcart of the stone stacked beside the Cut road toward the lambing shelter, before Edda came in wanting stew for the crew.");
        if (truthy(s.weight_road_edda_evidence)) c.push("Edda admits she told the road crew to take the stacked stone for the lambing shelter, and meant the Common to replace it.");
        else if (["wall", "repair", "reckoning"].indexOf(s.weight_road_quest_stage) >= 0) c.push("The Common's road papers record the wall's winter opening and the stone stacked beside it, but not what became of that stone.");
        if (truthy(s.weight_road_read_ditch)) c.push("The drain's uphill mouth was packed to the top with mud, dung and wool.");
        if (truthy(s.weight_road_read_courses)) c.push("The rows around the drain were laid short, with no long stones reaching back to hold the face.");
        if (truthy(s.weight_road_read_fill)) c.push("The road fill was soaked through, and the loaded carts' ruts ran deepest right over the drain.");
        if (truthy(s.weight_road_failure_chain_known)) c.push("No one thing brought the wall down: loose rows, a fouled drain, soaked fill and a heavy cart together did.");
        if (truthy(s.weight_road_contract_seen)) c.push("The weir order: sixty squared blocks due at the Factor's Hall nine days from then, or Whitefold pays thirty silver marks and the cost of buying the stone elsewhere.");
        return c;
      },
      goal: function (s) {
        var g = { emergency: "Save what you can at the broken wall on the Limestone Cut road.",
          investigation: "Gather the accounts of Whitefold's people and bring them back to Edda Cale.",
          wall: "Read what the broken wall shows and prepare for the repair.",
          repair: "Choose what Whitefold gives up to repair the road.",
          reckoning: "Attend the Common's meeting at the Fleecefold." };
        return g[s.weight_road_quest_stage] || "";
      },
      insignia: true,
      levelProgress: "Counts toward level progress when a successful repair is carried through the Common's reckoning.",
      active: function (s) { return ["emergency", "investigation", "wall", "repair", "reckoning"].indexOf(s.weight_road_quest_stage) >= 0; }
    },
    {
      id: "hale_ring", title: "The Hale Ring",
      giver: function (s) { return truthy(s.hale_ring_cassia_spoken) ? "Cassia Rell, the Bright Setting" : "A ring found on the River Road"; },
      levelProgress: "Counts toward level progress when returned to Ressa Hale.",
      place: function (s) { return (truthy(s.hale_ring_cassia_spoken) || truthy(s.hale_ring_oswin_spoken)) ? "Timbermouth · the Split Pine" : "Port Valen · the Bright Setting"; },
      goal: function (s) { return (truthy(s.hale_ring_cassia_spoken) || truthy(s.hale_ring_oswin_spoken)) ? "Return Ressa Hale's ring to her at the Split Pine in Timbermouth." : "Show the gold ring engraved R. H. to Cassia Rell at the Bright Setting."; },
      clues: function (s) {
        var c = ["The inside of the gold band is engraved R. H."];
        if (truthy(s.hale_ring_cut_known)) c.push("Its small diamond has an unusually deliberate cut, not common market work.");
        if (truthy(s.hale_ring_cassia_spoken)) c.push("Cassia Rell says the ring belongs to Ressa Hale of the Split Pine. It was made from her parents' old jewellery.");
        if (truthy(s.hale_ring_oswin_spoken)) c.push("Oswin Hale recognizes the old seam in the ring and says Ressa lost it on their last freight run together.");
        return c;
      },
      active: function (s) { return truthy(s.has_ressa_hale_ring) && (s.hale_ring_stage === "found" || s.hale_ring_stage === "owner_known"); }
    },
    {
      id: "varren_errand", title: "Varren's Errand", place: "Port Valen",
      giver: "Sergeant Varren, the Carrion Compound",
      levelProgress: "Counts toward level progress on a successful resolution.",
      goal: function (s) {
        if ((s.slasher_quest_stage === "resolved" || s.slasher_quest_stage === "failed") && !truthy(s.slasher_reported)) return "Return to Sergeant Varren at the Carrion Compound and report what happened.";
        if (!truthy(s.slasher_trent_met)) return "Speak with Captain Bronner Trent at the militia post on the Trunk Road.";
        if (truthy(s.slasher_alibi_known)) return "Follow the evidence from the militia post and decide what it proves.";
        return "Follow the leads from Captain Trent's post and find out who is behind the killings.";
      },
      clues: function (s) {
        var c = [];
        if (truthy(s.slasher_trent_met)) c.push("Captain Trent says Ulrich of Avir is responsible for the killings.");
        if (truthy(s.slasher_alibi_known)) c.push("Accounts place Ulrich in Alderford during the most recent killings.");
        if (truthy(s.slasher_survivor_known)) c.push("A wounded mercenary connected to the case is being tended in the Althea chapel.");
        return c;
      },
      active: function (s) { return s.slasher_quest_stage === "active" || ((s.slasher_quest_stage === "resolved" || s.slasher_quest_stage === "failed") && !truthy(s.slasher_reported)); }
    },
    {
      id: "silt_gate", title: "Silt-Gate Contraband", place: "The Silt-Gates",
      levelProgress: true,
      active: function (s) { return s.silt_gate_quest_stage === "active"; }
    },
    {
      id: "dry_lion", title: "The Dry Lion", place: "Middle Ward",
      levelProgress: true,
      active: function (s) { return s.dry_lion_quest_stage === "active"; }
    },
    {
      id: "a_key_for_every_door", title: "A Key for Every Door", place: "Middle Ward",
      levelProgress: true,
      active: function (s) { return s.a_key_quest_stage === "active"; }
    },
    {
      id: "rotten_rib", title: "The Rotten Rib", place: "Iron Wharves",
      giver: "Ysolde Ostrand, the Carrion Compound",
      levelProgress: true,
      goal: function (s) {
        if (!truthy(s.has_rotten_rib_splinter)) return "Speak with the shipwright at Slipway Two about the delayed timber.";
        return "Find proof of what happened to the heartwood meant for Slipway Two.";
      },
      clues: function (s) {
        var c = [];
        if (truthy(s.has_rotten_rib_splinter)) c.push("The timber in the ship's fourth rib is fresh-cut spruce, not cured heartwood.");
        if (truthy(s.rotten_rib_ledger_clue)) c.push("Bay Four's papers show the heartwood was cleared for Slipway Two, but the bay is empty.");
        return c;
      },
      active: function (s) { return s.rotten_rib_quest_stage === "active"; }
    },
    {
      id: "muffled_bell", title: "The Muffled Bell", place: "The Pier",
      levelProgress: true,
      active: function (s) { return s.bell_quest_stage === "active"; }
    },
    {
      id: "stolen_shroud", title: "The Stolen Shroud", place: "The Alley Shrine",
      levelProgress: true,
      active: function (s) { return s.shroud_quest_stage === "active"; }
    },
    {
      id: "quiet_block", title: "The Quiet Block", place: "Fishmongers' Slip",
      levelProgress: true,
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
      levelProgress: true,
      active: function (s) { return s.black_oath_night_list_stage === "active"; }
    }
  ];

  // Hiring Hall jobs and courier parcels are listed under their own heading, and each finished one counts on the insignia.
  window.QUESTLOG.forEach(function (q) {
    if (/^(hall_|courier_)/.test(q.id)) { q.group = "job"; q.insignia = true; }
  });
})();
