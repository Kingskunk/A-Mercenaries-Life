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
 *   (The quest panel shows no rewards or level-up credit before they are earned, the user 2026-11-01, so there is no levelProgress or insignia field.)
 *   group     optional: "job" for a Hiring Hall job or a courier parcel, which the sidebar lists under its own heading below the quests
 *   giver     optional: who gave it (text or function(stats)), shown on the hover card
 *   goal      optional: one sentence of what to do next (text or function(stats)), shown on the hover card
 *   progress  optional: function(stats) -> [{label, have, need}], drawn as a progress line under the title and listed on the card
 *   clues     optional: function(stats) -> [text], only what the player has FOUND (never a lead they have not met), listed on the card
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
      // One entry for every wagon line (Overworld CARAVAN_LINES): the title names the destination the line gave (rj_escort_dest_name, set when the work is taken), so a new town or line needs no entry here.
      id: "hall_escort", title: function (s) { return "Wagon Escort to " + s.rj_escort_dest_name; }, place: escortPlace,
      active: function (s) { return s.rj_escort_stage === "active" && (truthy(s.rj_escort_road) || Number(s.campaign_day) <= Number(s.rj_escort_until)); }
    },
    courierEntry(1), courierEntry(2), courierEntry(3),
    {
      // Ambrose's Deep-Wood Order (port_valen/port_valen_middle_ward.txt, 2026-10-19): shadefern and acorn truffle from the Old Grove, brought in at one time. Not a Hall job. Every delivered order counts toward level progress (the user), and a seasonal repeat is gone when its season ends.
      id: "ambrose_order", title: "Ambrose's Deep-Wood Order",
      giver: "Master Ambrose, the Still-Room in Herb-Pounder Close",
      place: function (s) { return "Port Valen · Herb-Pounder Close" + (truthy(s.amb_repeat) ? " · this season only" : ""); },
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
        var g = {
          emergency: "Save what you can at the broken wall on the Limestone Cut road.",
          investigation: "Gather the accounts of Whitefold's people and bring them back to Edda Cale.",
          wall: "Read what the broken wall shows and prepare for the repair.",
          repair: "Choose what Whitefold gives up to repair the road.",
          reckoning: "Attend the Common's meeting at the Fleecefold."
        };
        return g[s.weight_road_quest_stage] || "";
      },
      active: function (s) { return ["emergency", "investigation", "wall", "repair", "reckoning"].indexOf(s.weight_road_quest_stage) >= 0; }
    },
    {
      // Personal-use adaptation, built one chapter at a time under Langston/. Chapter 1 ends with Tomlin as the first lead.
      id: "wolves_of_langston", title: "The Wolves of Langston",
      giver: "Mayor Tanya Anathram, Langston meeting hall",
      place: "Langston",
      goal: function (s) {
        if (s.wol_quest_stage === "asked" || s.wol_quest_stage === "offered") return "Call on Mayor Anathram at Langston Hall during the day and hear her terms.";
        if (truthy(s.wol_chapter_6_complete)) return truthy(s.wol_ep_seen) ? "The contract is finished." : "The contract is finished. The mayor and Roi have an account of what followed whenever you call at Langston Hall.";
        if (truthy(s.wol_ch6_solaine_cured)) return "Return to the town hall with the mayor and Roi. Solaine's curse is broken.";
        if (["chase", "courtyard", "temple", "chamber", "lair", "talk", "fight", "yield"].indexOf(String(s.wol_chapter_6_checkpoint)) >= 0) return "Stop Solaine beneath the True Sun temple. The Silverstar can break her curse.";
        if (["square", "evidence", "transform"].indexOf(String(s.wol_chapter_6_checkpoint)) >= 0) return "Make your accusation in the town square.";
        if (truthy(s.wol_ch6_ready)) return "Tell Mayor Anathram at Langston Hall when you are ready to make the accusation. Prepare first: the Cord & Kettle is the last shop before the town gathers.";
        if (truthy(s.wol_ch6_summoned)) return "Tell Mayor Anathram at Langston Hall when you are ready to make the accusation.";
        if (truthy(s.wol_chapter_5_complete)) return "Wait for word from Mayor Anathram; Langston's hub will bring it once a new day begins, and she may be waiting at the Pickled Hen.";
        if (truthy(s.wol_ch5_corpse_fought)) return "Tell Mayor Anathram that Maybelline's body rose in the True Sun cemetery.";
        if (truthy(s.wol_ch5_letter_shown)) return "Examine Maybelline's body in the mausoleum of the True Sun temple's cemetery. Solaine has given way.";
        if (truthy(s.wol_ch4_letter_read)) return "Visit Langston's chapel and examine Maybelline's body before the burial. Solaine expects you; show the mayor's letter if there is any trouble.";
        if (truthy(s.wol_chapter_4_complete)) return "Wait for word from Mayor Anathram; Langston's hub will bring it once a new day begins.";
        if (truthy(s.wol_ch4_warrant_found)) return "Take the warrant from the bandit camp to Mayor Anathram.";
        if (truthy(s.wol_ch4_map_given)) return "Search the woods west of Langston for the bandit camp the mayor circled on your map.";
        if (truthy(s.wol_ch3_note_read) || truthy(s.wol_hall_called)) return "Call at Langston Hall: the mayor has sent word of a new lead.";
        if (truthy(s.wol_roi_cured)) return "Return to Langston; the mayor may have word for you.";
        if (truthy(s.wol_polypox_recipe)) return "Bring Roi Sunderhammer sage, hornwort and wolfsbane so he can brew his cure, from the woods with him or from Tomlin in Langston.";
        if (Number(s.wol_chapter) === 3) return "Follow the track southwest of Langston into the druid's grove and speak with Roi Sunderhammer.";
        if (Number(s.wol_chapter) === 2) return "Speak with Tomlin at his herb garden on the western edge of Langston.";
        return "Find what killed Maybelline inside Langston's wall.";
      },
      // In the order the player meets them (chapter by chapter), so the quest card's "Latest" and the Quest Journal's timeline end on the newest finding.
      clues: function (s) {
        var c = [];
        if (truthy(s.wol_tomlin_crowd_hint)) c.push("Several townspeople treat Tomlin's attention as something contested, even during Maybelline's funeral.");
        if (truthy(s.wol_tomlin_relief_hint)) c.push("Tomlin's grief looked genuine, but relief showed through it for a moment.");
        if (truthy(s.wol_roi_change_seen)) c.push("Roi's face briefly took on canine features when he sneezed.");
        if (truthy(s.wol_roi_magic_suspected)) c.push("Roi's druidic shape is answering an illness or curse without his consent.");
        if (truthy(s.wol_wolf_hair_found)) c.push("The coarse hair you found on the track crumbled into a shimmer like light on moving water.");
        if (s.wol_wolf_choice === "called_out") c.push("Something huge snarled \"He's mine!\" from the bank above the track to Roi's grove.");
        if (truthy(s.wol_roi_cured)) c.push("Roi Sunderhammer, the druid of the grove, was shifting into a wolf against his will: polypox, a shapechangers' disease. Tea of sage, hornwort and wolfsbane cured it.");
        if (truthy(s.wol_roi_sick_new_moon)) c.push("Roi first felt unwell around the new moon, two weeks before the full moon of Maybelline's death.");
        if (truthy(s.wol_roi_claw_not_scrapling)) c.push("Roi says Maybelline was mauled by beasts much larger than a scrapling.");
        if (truthy(s.wol_roi_night_gap)) c.push("Roi honestly cannot remember where he was the night Maybelline died.");
        if (truthy(s.wol_ch4_map_given)) c.push("Mayor Anathram sent you after two strangers blamed for missing livestock and valuables. She thinks they may be tied to Maybelline's death.");
        if (truthy(s.wol_ch4_nymph_herb_man)) c.push("A nymph in the western woods says a handsome man from the town gathers herbs there and watches her \"like prey\".");
        if (truthy(s.wol_ch4_nymph_asked_strange)) c.push("The trees have reported some strange creature wandering the land. They use the words \"beast\" and \"person\" for it interchangeably.");
        if (truthy(s.wol_ch4_unrelated_known)) c.push("Nothing about Maybelline's death fits two strangers on the road, and the mayor knows it.");
        if (s.wol_ch4_bandits_outcome) c.push("Mayor Anathram is the Wolf of the Road, an outlaw once wanted for killing a constable at Iron Gap. Two of her old band, Horace and Titch, tried to blackmail her at her house.");
        if (truthy(s.wol_ch4_warrant_found)) c.push("The bandits' camp held a Iron Gap warrant for the Wolf of the Road, wanted for killing a constable: three gold crowns for her whereabouts and thirty for her capture, dead or alive.");
        if (truthy(s.wol_ch4_letter_read)) c.push("Mayor Anathram wrote that Maybelline will be buried soon, and that Solaine of the Church of the True Sun has been told to expect you at the chapel.");
        if (s.wol_ch5_tome_state === "read") c.push("A black tome in Solaine's library, Turning from the Light, covers turning from a sun deity, infernal pacts, autopsies and making undead servants. A scrap marking one page reads \"This one.\" and shows how to destroy zombies, ghouls and vampires.");
        if (s.wol_ch5_tome_state === "pictures") c.push("A black tome in Solaine's library has illustrations of dark moon symbols, cruel tools and animated corpses; a scrap reading \"This one.\" marks the page on the walking dead.");
        if (truthy(s.wol_ch5_letter_granted)) c.push("A letter to Tomlin, hidden in Solaine's Compendium of Curses on the page for lycanthropy, tells of a changed woman whose darkness will not forgive \"her\". It stops mid-sentence.");
        if (truthy(s.wol_ch5_door_scratched)) c.push("The latch on Solaine's door is scratched and bent, as if by claws or tools in an unpracticed strong hand.");
        if (truthy(s.wol_ch5_wardrobe_seen)) c.push("One of Solaine's robes has been torn at the seams and restitched.");
        if (truthy(s.wol_ch5_ribbon_granted)) c.push("A blood-stained lavender silk ribbon lay behind the wardrobe in Solaine's room, with little dust on it.");
        if (truthy(s.wol_ch5_vestments_granted)) c.push("Burnt holy vestments, restitched and spotted with blood, were in the temple kitchen's stove.");
        if (truthy(s.wol_ch5_larder_done)) c.push("The temple larder holds fresh raw meat with small, ragged bite marks.");
        if (truthy(s.wol_ch5_tapestry_lore)) c.push("The temple's tapestries show an ancient order of sun worshippers who raised the tower to hold back undead; as long as one of them stays present and dedicated to the light, the area is sanctified and the dead stay in their graves.");
        if (truthy(s.wol_ch5_indent_amulet)) c.push("A sunburst-shaped indent in the rotunda floor fits an amulet like the one Solaine wore at the funeral. Pressing it flashes with radiant magic and then seals; it needs a key or object.");
        if (truthy(s.wol_ch5_asked_tomlin)) c.push("Solaine and Tomlin were lovers; she returned from a pilgrimage to find him betrothed to Maybelline.");
        if (truthy(s.wol_ch5_asked_temple)) c.push("Solaine says the temple's consecration, kept by one member of the Order of Radiant Light at a time, keeps Langston's dead in their graves. Roi is its counterpart in the wood.");
        if (truthy(s.wol_ch5_grave_seen)) c.push("A grave in the True Sun cemetery was dug open in great haste, or by some huge beast, and left with its shrouded body exposed.");
        if (truthy(s.wol_ch5_marks_seen)) c.push("Maybelline's body was mauled by something larger than most forest beasts: broad, deep claw marks, crisscrossed in a rage.");
        if (truthy(s.wol_ch5_daisies_seen)) c.push("The bouquet in Maybelline's hands was daisies tagged \"Rest well, Maybelline\" in Tomlin's careful hand, crushed as if squeezed too tight.");
        if (truthy(s.wol_ch5_corpse_fought)) c.push("Maybelline's body rose in the mausoleum and attacked. It had to be destroyed a second time. Solaine says this cannot happen while one of the Order of Radiant Light keeps the temple.");
        if (truthy(s.wol_ch5_corpse_fought) && truthy(s.wol_chapter_5_complete)) c.push("Mayor Anathram ordered the militia to guard the graveyard after dark and had a proclamation posted announcing the accusation of Maybelline's murderer.");
        if (truthy(s.wol_solaine_hymn_wrong)) c.push("The hymn Solaine attributed to the Book of Passing is not in that book.");
        if (truthy(s.wol_solaine_tomlin_hint)) c.push("Solaine and Tomlin concealed a familiarity older than the funeral.");
        if (truthy(s.wol_mayor_history_wrong)) c.push("Mayor Anathram's account of the Battle of Iron Gap contains serious errors.");
        if (truthy(s.wol_mayor_dog_trained)) c.push("Buttercup is a trained attack and guard dog, not merely an obedient pet.");
        return c;
      },
      // "asked": the mayor asked the player to call at her office; "offered": she briefed them and they declined for now; "active": the contract is taken
      active: function (s) { return s.wol_quest_stage === "active" || s.wol_quest_stage === "asked" || s.wol_quest_stage === "offered"; }
    },
    {
      id: "hale_ring",
      title: function (s) { return (truthy(s.hale_ring_cassia_spoken) || truthy(s.hale_ring_oswin_spoken)) ? "Ressa Hale's Ring" : "A Ring on the River Road"; },
      giver: function (s) { return truthy(s.hale_ring_cassia_spoken) ? "Cassia Rell, the Bright Setting" : "A ring found on the River Road"; },
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
      giver: "Ysolde Ostrand, the Carrion Compound",
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
    },
    {
      id: "black_oath_short_purse", title: "The Short Purse",
      giver: function (s) { return truthy(s.black_oath_mara_named) ? "Mara Vey" : "The Woman Upstairs"; },
      place: function (s) { return truthy(s.short_purse_clue_derry) ? "Dredge-End · Lamp Stair" : "Dredge-End · Boat-Sheds"; },
      goal: function (s) {
        if (truthy(s.short_purse_clue_derry)) return "Track down young Derry at Lamp Stair and find what he did with the coppers.";
        return "Find where the twenty-four coppers from the boat-shed slip fund went.";
      },
      clues: function (s) {
        var c = [];
        if (truthy(s.short_purse_clue_wire)) c.push("The tin's lock was slipped open with an oiled copper wire, not smashed.");
        else if (truthy(s.short_purse_clue_lock)) c.push("The tin's lock was not forced; whoever took the coin had a tool or a key, and knew where the box was kept.");
        if (truthy(s.short_purse_clue_derry)) c.push("Young Derry, Joram's apprentice, took the coppers and bolted toward Lamp Stair clutching his coat.");
        if (truthy(s.short_purse_clue_orren)) c.push("Orren threatened Derry with chains and debtor hulks over the boat earlier today.");
        return c;
      },
      active: function (s) { return s.short_purse_stage === "active"; }
    },
    {
      id: "innocent_smile", title: "The Innocent Smile", place: "Valen Reach",
      giver: "Alyndra, the Wanderer",
      goal: function (s) { return "Meet Alyndra at first light and travel the coastal bluffs to the Imperial vault." },
      clues: function (s) {
        var c = [];
        if (truthy(s.aly_monologue)) c.push("Alyndra gave you a tragic tale that sounded like it's been praticed to perfection.");
        if (truthy(s.aly_knife_work)) c.push("Despite her innocent demeanor, Alyndra is skilled with a knife and possess a duelist rapier.");
        if (truthy(s.aly_hands)) c.push("You suspect that Alyndra has lived a much tougher life than she initially informed you about.");
        if (truthy(s.aly_gear_prepared)) c.push("Despite her claims of being a former barmaid with only a few months on the road, she carries her gear with the unthinking economy of someone much more experienced.");
        return c;
      },
      active: function (s) { return s.aly_quest_stage === "active"; }
    }

  ];

  // Hiring Hall jobs and courier parcels are listed under their own heading.
  window.QUESTLOG.forEach(function (q) {
    if (/^(hall_|courier_)/.test(q.id)) { q.group = "job"; }
  });
})();
