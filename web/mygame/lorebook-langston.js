/*
 * LOREBOOK: LANGSTON -- the walled market town in the Western Vale, its places, and the people of The Wolves of Langston.
 *
 * Same entry format as lorebook-data.js (see the header there). This file only adds to window.LOREBOOK, so it must be loaded after lorebook-data.js. Every entry unlocks the moment the player
 * reaches the place or learns the name (the flags the scenes already set), and says only what that first meeting showed. Everything that comes later goes in its own gated paragraph, one fact per
 * flag, so a player who has not reached a scene reads nothing of it: Roi's illness, the mayor's past, Solaine's curse and her sentence, Tomlin's wounds, the new caretaker. Where a fact depends on
 * a choice (the mayor's evidence kept or burned, Tomlin tended or not, who was accused), the paragraph says only what that player did. Spoilers of the case (who killed Maybelline and why) are
 * never in a base text.
 */
(function () {
  "use strict";

  var L = window.LOREBOOK;
  if (!L || !L.entries) return;
  function truthy(v) { return v === true || v === "true"; }

  Array.prototype.push.apply(L.entries, [

    /* ------------------------------------------------------------------ PLACES */

    {
      id: "langston", category: "places", title: "Langston",
      sub: "A walled market town in the Western Vale",
      tags: ["Langston", "Western Vale"], aliases: ["market square", "fountain", "chapel tower", "wagon bays", "town hall", "Western Vale road"],
      link: ["Langston"],
      unlock: function (s) { return truthy(s.langston_seen) || truthy(s.langston_arrival_seen); },
      body: function (s) {
        var out = [
          "A compact trading town inside a low stone wall on the wagon road through the [[western_vale|Western Vale]]. Timber-framed houses with jutting upper floors crowd the cobbled streets, and the main street opens into a market square around a weathered stone fountain. Covered stalls and wagon bays stand by the gate.",
          "A broad flight of shallow steps climbs from the square toward [[langston_hall|Langston Hall]], and a tall chapel tower shows above the roofs beyond it. From the upper lanes the wall gives way to open pasture and fields, with old forest along the southern horizon."
        ];
        if (truthy(s.wol_met_mayor) || Number(s.wol_funeral_day) > 0) {
          out.push("The day you reached it, Langston was burying one of its own: a young woman named [[maybelline|Maybelline]], who had been killed.");
        }
        if (truthy(s.wol_chapter_6_complete)) {
          out.push("Her killer was named before the whole town in the square, and Langston has gone back to its ordinary work.");
        }
        return out;
      },
      see: ["western_vale", "langston_hall", "pickled_hen", "cord_and_kettle", "anathram"]
    },
    {
      id: "langston_hall", category: "places", title: "Langston Hall",
      sub: "House Gault's hall in Langston",
      tags: ["Langston", "House Gault"], aliases: ["town hall", "the Hall", "contract board", "clerks", "public chamber"],
      link: ["Langston Hall"],
      unlock: "lg_hall_seen",
      body: function (s) {
        var out = [
          "A plain dressed-stone hall on the upper side of the market square, smaller than the buildings around it but heavier built. A weathered carving of the arms of [[house_gault|House Gault]] stands above the oak doors, with a newer tablet naming it the Countess's hall in Langston.",
          "The public chamber has benches, a long table where the mayor hears petitions and disputes, and shuttered counters where the town clerks work. Notices of court days, market tolls, road levies and militia service hang beside them, each with the mayor's mark or the Countess's seal. A Contract Board hangs by the doors. Plain doors at the back lead to the mayor's office, the record rooms and the watch room."
        ];
        if (truthy(s.hall_gault_registered)) {
          out.push("The clerks opened a House Gault page on your Insignia, free of charge. The Countess likes to know who is hired in her Vale.");
        }
        return out;
      },
      see: ["langston", "house_gault", "anathram"]
    },
    {
      id: "pickled_hen", category: "places", title: "The Pickled Hen",
      sub: "An inn off Langston's market square",
      tags: ["Langston", "Lodging"], aliases: ["inn", "common room", "private room", "stew", "tavern"],
      link: ["Pickled Hen"],
      unlock: "lg_hen_seen",
      body: function (s) {
        var out = [
          "A broad timber-framed house just off the market square, with a painted sign of a white hen on the rim of a green preserving crock. A long counter faces rows of close-set tables, a wide hearth fills the back wall, and a narrow stair climbs to the rooms above.",
          "A bowl of lamb and barley stew costs 2 copper bits, a plate of cheese, bread and pickled onions 1, and a private room for a day and a night {{lg_hen_rate_copper}}."
        ];
        if (truthy(s.met_harlan_vetch)) {
          out.push("The innkeeper is [[harlan_vetch|Harlan Vetch]].");
        }
        if (truthy(s.wol_chapter_1_complete)) {
          out.push("Mayor Anathram arranged for the town to pay for your room and two meals here while you worked for her.");
        }
        return out;
      },
      see: ["langston", "harlan_vetch"]
    },
    {
      id: "cord_and_kettle", category: "places", title: "The Cord & Kettle",
      sub: "A general store in Langston",
      tags: ["Langston", "Trade"], aliases: ["general store", "rope", "cord", "lanterns", "camp goods"],
      link: ["Cord & Kettle"],
      unlock: "lg_store_seen",
      body: function (s) {
        var out = [
          "A narrow corner shop just off the market square, with a painted sign of a coil of cord looped through the handle of a black kettle. Shelves climb to the ceiling between dark timber posts, and rope and cord hang by thickness from pegs among the lanterns and pans. It sells goods for the road, the camp and small repairs."
        ];
        if (truthy(s.met_ansel_reed)) {
          out.push("Ansel Reed, a broad greying man, works the counter.");
        }
        return out;
      },
      see: ["langston"]
    },
    {
      id: "true_sun_temple", category: "places", title: "The Sun Temple",
      sub: "The limestone temple on Langston's eastern edge",
      tags: ["Langston", "Faith"], aliases: ["chapel", "chapel tower", "temple", "sun temple", "spire", "rotunda", "mausoleum", "cemetery"],
      link: ["True Sun temple", "True Sun Temple"],
      unlock: "wol_chapter_5_started",
      body: function (s) {
        var out = [
          "A limestone temple with a tall spire topped by a sunburst, on the eastern edge of Langston. Its pale stone is scoured smooth by the weather and stands out against the timber and whitewash around it. In front is a courtyard with an altar left open to the sky, ringed by theater-style seating under a tile roof."
        ];
        {
          out.push("Inside, a round rotunda has benches along its walls, old tapestries high on the stone and a sunburst mosaic in the floor. Passages lead off toward a library, quarters, a dining hall and a kitchen, and a cemetery lies behind. Its door is open at any hour.");
        }
        if (truthy(s.wol_ch5_letter_shown)) {
          out.push("A mausoleum at the center of the cemetery holds an enchanted altar that preserves the dead until their burial.");
        }
        if (truthy(s.wol_chapter_6_complete)) {
          out.push("The cemetery is open to visitors, and fresh flowers keep appearing at Maybelline's grave.");
        }
        if (truthy(s.wol_cleric_met)) {
          out.push("The temple now has a caretaker and two novices. The caretaker gives a healing rite once a day for an offering of 5 copper bits, and a novice sits the night's vigil by the mortuary stair.");
        }
        return out;
      },
      see: ["langston", "order_radiant_light", "veyra_dawn_warden", "edric_merrow", "solaine"]
    },
    {
      id: "rois_grove", category: "places", title: "Roi's Grove",
      sub: "A druid's clearing south-west of Langston",
      tags: ["Langston", "Western Vale"], aliases: ["grove", "the grove", "forest track", "overhang"],
      link: ["Roi's Grove"],
      unlock: "wol_chapter_3_complete",
      body: function (s) {
        var out = [
          "A clearing among old, broad trees, reached from Langston and from the Western Vale road by a seldom-used dirt track. A rock overhang shelters a bed of hides and a ring of blackened stones, and the air smells of leaf litter, bark and green growing things."
        ];
        if (truthy(s.wol_roi_cured)) {
          out.push("[[roi|Roi Sunderhammer]] lives here. On most days he works in or near the clearing, and on some he is away in the forest or at the market.");
        }
        return out;
      },
      see: ["roi", "langston", "western_vale"]
    },

    /* ------------------------------------------------------------------ PEOPLE */

    {
      id: "anathram", category: "people", title: "Mayor Tanya Anathram",
      sub: "Mayor of Langston",
      role: "Mayor of Langston, Langston Hall",
      tags: ["Langston"], aliases: ["mayor", "Tanya", "Anathram", "half-orc", "Buttercup"],
      link: ["Mayor Anathram", "Mayor Tanya Anathram", "Tanya Anathram", "Anathram"],
      unlock: "wol_met_mayor",
      body: function (s) {
        var out = [
          "The mayor of Langston, a half-orc woman in a tailored suit whose Common carries a heavy, guttural Orcish accent. She has a hard stare and little patience for small talk. She introduced herself at Maybelline's funeral, said she might have use for you, and asked you to stay for the service.",
          "She hears petitions and disputes at the long table in [[langston_hall|Langston Hall]]."
        ];
        if (["offered", "active", "complete"].indexOf(String(s.wol_quest_stage)) >= 0) {
          out.push("A very large dog goes with her.");
        }
        if (truthy(s.wol_mayor_dog_trained)) {
          out.push("The dog, Buttercup, is a trained attack and guard dog, not merely an obedient pet.");
        }
        if (truthy(s.wol_chapter_1_complete)) {
          out.push("She hired you to find whoever killed Maybelline: thirty silver marks when the threat is ended or the killer is in her custody, two marks of it paid in advance, and your room and meals at the Pickled Hen paid by the town while you worked.");
        }
        if (truthy(s.wol_ch4_gifts_given)) {
          out.push("In her own house she told you she was once a bandit leader called the Wolf of the Road, and that two men she once rode with had come to Langston to use it against her. She has made a different life here.");
          if (truthy(s.wol_ch4_evidence_kept)) {
            out.push("You kept the poster and the warrant from the Iron Gap constabulary that named her.");
          } else if (truthy(s.wol_ch4_warrant_resolved)) {
            out.push("You left the poster and the warrant to burn in her fire.");
          }
        }
        if (truthy(s.wol_chapter_6_complete) && String(s.wol_ch6_accused) === "mayor") {
          out.push("You named her as Maybelline's killer before the town. She cut your fee.");
        }
        return out;
      },
      see: ["langston_hall", "langston", "roi", "tomlin", "solaine"]
    },
    {
      id: "tomlin", category: "people", title: "Tomlin",
      sub: "Langston's herbalist, Maybelline's fiancé",
      role: "Herbalist, western edge of Langston",
      tags: ["Langston"], aliases: ["herbalist", "workroom", "garden", "cottage", "fiancé", "fiance"],
      link: ["Tomlin"],
      unlock: "wol_met_tomlin",
      body: function (s) {
        var out = [
          "Langston's herbalist, who was engaged to Maybelline and spoke at her funeral. His eyes hold you, and his smile is dazzling even when it is sad."
        ];
        if (Number(s.wol_funeral_day) > 0) {
          out.push("After the funeral he asked how you had known Maybelline and told you to come to his home for whatever you needed.");
        }
        if (truthy(s.wol_chapter_2_complete)) {
          out.push("He lives at the western end of town beside a crowded herb garden. His workroom sells herbs, tonics and scents, and he buys ingredients and the tools of his trade.");
        }
        if (truthy(s.wol_tomlin_affair_seen)) {
          out.push("Days after the funeral he was with another young woman at his cottage.");
        }
        if (truthy(s.wol_tomlin_asked_alibi)) {
          out.push("He says he spent the night Maybelline died at the Pickled Hen, among many who saw him.");
        }
        if (truthy(s.wol_tomlin_philters_given)) {
          out.push("He gave you the flasks of scent he had made as a wedding gift for Maybelline, because he could not bear to keep them.");
        }
        if (truthy(s.wol_chapter_6_complete)) {
          out.push("He was badly torn in the attack that followed the accusation and recovered at his cottage.");
          out.push(truthy(s.wol_ch6_tomlin_tended) ? "You pressed your hands over his wounds in the temple courtyard before help reached him." : "You ran into the temple courtyard after him.");
        }
        return out;
      },
      see: ["langston", "maybelline", "roi", "solaine"]
    },
    {
      id: "roi", category: "people", title: "Roi Sunderhammer",
      sub: "The druid of Langston's grove",
      role: "Druid, assigned to Langston by his circle",
      tags: ["Langston", "Western Vale"], aliases: ["druid", "dwarf", "grove", "polypox"],
      link: ["Roi Sunderhammer", "Roi"],
      unlock: "wol_met_roi",
      body: function (s) {
        var out = [
          "A bald dwarf druid in rough-spun clothes and animal hides, who sneezes often. He drove a wolf pack off the road when you first came toward Langston and told you to say he had sent you to the Pickled Hen. He was on his way to a funeral."
        ];
        if (truthy(s.wol_met_mayor) || Number(s.wol_funeral_day) > 0) {
          out.push("He spoke at Maybelline's funeral. His circle assigned him to Langston, and he acts as its spiritual counsel and its guide among the forces of nature.");
        }
        if (truthy(s.wol_chapter_3_started)) {
          out.push("He lives in [[rois_grove|a grove]] south-west of the town.");
        }
        if (truthy(s.wol_polypox_recipe)) {
          out.push("He was sick with polypox, a disease of shapechangers that loosens their hold on their form and can bring fevers and delirium. The cure is a tea of sage, hornwort and wolfsbane.");
        }
        if (truthy(s.wol_roi_cured)) {
          out.push("You helped him brew the cure, and he is well again.");
        }
        if (truthy(s.wol_roi_silverstar_given)) {
          out.push("He gave you the Silverstar, a brooch with one charge of Remove Curse. He said it was a gift to him from Solaine.");
        }
        if (truthy(s.wol_roi_asked_circle)) {
          out.push("A pack of wolves came down from the hills in the winter, hungry, and took the road for a larder. He has been teaching them otherwise.");
        }
        if (truthy(s.wol_roi_asked_solaine)) {
          out.push("He counted Solaine a friend, and has gone back through every conversation they had.");
        }
        return out;
      },
      see: ["rois_grove", "solaine", "tomlin", "anathram"]
    },
    {
      id: "solaine", category: "people", title: "Solaine",
      sub: "The cleric of Langston's temple",
      role: "Cleric of the Church of the True Sun",
      tags: ["Langston", "Faith"], aliases: ["cleric", "custodian", "Order of Radiant Light"],
      link: ["Solaine"],
      unlock: "wol_met_solaine",
      body: function (s) {
        var out = [
          "A small young human woman in a white robe embroidered with sun motifs. She spoke at Maybelline's funeral, introduced herself as a member of the Church of the True Sun and custodian of Langston's chapel, and led the hymn. Townsfolk greet her with a nod or a gesture of respect."
        ];
        if (truthy(s.wol_chapter_5_started)) {
          out.push("She looks after the [[true_sun_temple|True Sun Temple]] on the eastern edge of town.");
        }
        if (truthy(s.wol_ch5_asked_alone)) {
          out.push("She is the only member of the [[order_radiant_light|Order of Radiant Light]] at the temple. She told you the old magic needs only one caretaker to renew its rites, and that she sees her order only on the pilgrimage to its enclave.");
        }
        if (truthy(s.wol_ch5_asked_tomlin)) {
          out.push("She and Tomlin were lovers. She says she was called back to her order and came home to find him engaged to another.");
        }
        if (truthy(s.wol_ch6_solaine_cured)) {
          out.push("She is a werewolf. She changed before the whole town in the square, carried Tomlin off toward the temple, and the Silverstar broke her curse in the lair beneath it.");
        }
        if (truthy(s.wol_ch6_asked_maybelline)) {
          out.push("In the lair she told you she had killed Maybelline, and gave her reasons.");
        }
        if (truthy(s.wol_cleric_solaine_told) || truthy(s.wol_solaine_notice_read)) {
          out.push("The Hall found her guilty of Maybelline's killing. With the consent of Maybelline's parents and of the Order, she was given into its custody to serve a penance for life in a closed house of the Order, stripped of every office.");
        }
        return out;
      },
      see: ["true_sun_temple", "order_radiant_light", "roi", "tomlin", "maybelline"]
    },
    {
      id: "harlan_vetch", category: "people", title: "Harlan Vetch",
      sub: "Innkeeper of the Pickled Hen",
      tags: ["Langston"], aliases: ["innkeeper", "Harlan", "Vetch"],
      link: ["Harlan Vetch", "Master Vetch"],
      unlock: "met_harlan_vetch",
      body: function (s) {
        var out = [
          "The aproned, balding innkeeper of the [[pickled_hen|Pickled Hen]]. He looks over his common room and its front door in turn."
        ];
        if (truthy(s.wol_chapter_6_complete)) {
          out.push("He wrote down the accusation in the market square at the mayor's request, because her aide was ill.");
        }
        return out;
      },
      see: ["pickled_hen", "anathram"]
    },
    {
      id: "edric_merrow", category: "people", title: "Edric Merrow",
      sub: "The temple's new caretaker",
      role: "Cleric of the Order of Radiant Light, Langston",
      tags: ["Langston", "Faith"], aliases: ["cleric", "caretaker", "Wynne", "Tamsin", "novices"],
      link: ["Edric Merrow", "Cleric Merrow"],
      unlock: "wol_cleric_met",
      body: function (s) {
        var out = [
          "A lean man in a white robe mended at both elbows, with iron-grey hair cut close, who arrived to look after the [[true_sun_temple|True Sun Temple]] for the [[order_radiant_light|Order of Radiant Light]]. He came with two novices: Wynne, who has taken on the burial register, and Tamsin, who sits with the dead. He gives a healing rite once a day for what a visitor can spare, and the temple's doors are open at any hour."
        ];
        if (truthy(s.wol_cleric_asked_temple)) {
          out.push("He says Veyra's ward was weak but holding when he came, and that fourteen burials had never been written down. The Order could spare him two novices and no more. He covers the temple and three villages on the east road, and rides out two days in seven.");
        }
        if (truthy(s.wol_cleric_solaine_told)) {
          out.push("He told you the Order's escort had taken Solaine to its closed house, and that he spoke the dawn rite over her leaving himself.");
        }
        return out;
      },
      see: ["true_sun_temple", "order_radiant_light", "solaine"]
    },
    {
      id: "maybelline", category: "people", title: "Maybelline",
      sub: "A young woman of Langston",
      tags: ["Langston"], aliases: ["funeral", "fiancée", "grave"],
      link: ["Maybelline"],
      unlock: function (s) { return truthy(s.wol_met_mayor) || Number(s.wol_funeral_day) > 0; },
      body: function (s) {
        var out = [
          "A young woman of Langston whose funeral you attended on reaching the town. She was engaged to Tomlin, and her parents spoke at the service. The mourners were told that a killer was out there."
        ];
        if (truthy(s.wol_ep_asked_maybelline) || truthy(s.wol_chapter_6_complete)) {
          out.push("She is buried in the cemetery behind the temple, and fresh flowers keep appearing at her grave.");
        }
        return out;
      },
      see: ["tomlin", "anathram", "langston"]
    },

    /* ------------------------------------------------------------------ FACTIONS */

    {
      id: "order_radiant_light", category: "factions", title: "The Order of Radiant Light",
      sub: "The Church's wardens of Langston's temple",
      tags: ["Faith", "Langston"], aliases: ["Order", "Radiant Order", "enclave", "novices", "wards"],
      link: ["Order of Radiant Light", "Radiant Order"],
      unlock: function (s) { return truthy(s.wol_ch5_asked_temple) || truthy(s.wol_ch5_tapestry_lore) || truthy(s.wol_solaine_hymn_wrong) || truthy(s.wol_cleric_met); },
      body: function (s) {
        var out = [
          "The order of clerics in the [[church_true_sun|Church of the True Sun]] that raised the temple at Langston, long ago, in the name of [[veyra_dawn_warden|Veyra the Dawn-Warden]]. Its sworn keepers renew the rites that hold the dead in their graves."
        ];
        if (truthy(s.wol_ch5_asked_alone)) {
          out.push("The Order has an enclave elsewhere, and its members make pilgrimages to it. Once the temple held a whole community of clerics and acolytes, but by Solaine's day she was the only one.");
        }
        if (truthy(s.wol_cleric_asked_temple)) {
          out.push("The Order sent a cleric and two novices to cover the temple and three villages, with a letter asking Langston for patience. It can spare no more.");
        }
        if (truthy(s.wol_cleric_solaine_told) || truthy(s.wol_solaine_notice_read)) {
          out.push("It took Solaine into its custody for a lifelong penance in a closed house of its own.");
        }
        return out;
      },
      see: ["church_true_sun", "veyra_dawn_warden", "true_sun_temple", "edric_merrow", "solaine"]
    }

  ]);
})();
