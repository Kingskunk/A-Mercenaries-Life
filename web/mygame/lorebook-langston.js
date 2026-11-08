/*
 * LOREBOOK: LANGSTON & THE WESTERN VALE -- the walled market town of Langston, the villages of Barolo, Broadmead, and Fallowmere, and their people.
 *
 * Same entry format as lorebook-data.js (see the header there). This file only adds to window.LOREBOOK, so it must be loaded after lorebook-data.js. Every entry unlocks the moment the player
 * reaches the place or learns the name (the flags the scenes already set), and says only what that first meeting showed. Everything that comes later goes in its own gated paragraph, one fact per
 * flag, so a player who has not reached a scene reads nothing of it. Where a fact depends on a choice, the paragraph says only what that player did.
 *
 * Places: Langston (incorporating Langston Hall, the Pickled Hen, and the Cord & Kettle), Barolo (incorporating the Hall, Red Stave, Market, and Vineyard Roads), Broadmead (incorporating the Hall, Crooked Halter, Longfold Fair, and Remount Yard), Fallowmere (incorporating the Hall, Grey Gander, and Market on the Green), the Sun Temple, and Roi's Grove.
 * People: Mayor Tanya Anathram, Tomlin, Roi Sunderhammer, Solaine, Harlan Vetch, Ansel Reed, Hobart Thring, Odalie Hollowell, Mardred Birchstone, Olof, Dagny Marren, Aubrey Fenn, Ione Brackett, Edric Merrow, and Maybelline.
 * Factions: The Order of Radiant Light, House Veyre, House Durnell, and House Avenel.
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
      tags: ["Langston", "Western Vale", "House Gault", "Trade", "Lodging"],
      aliases: [
        "market square", "fountain", "chapel tower", "wagon bays", "town hall", "Western Vale road",
        "Langston Hall", "the Hall", "contract board", "Pickled Hen", "The Pickled Hen", "inn", "tavern",
        "Cord & Kettle", "The Cord & Kettle", "general store"
      ],
      link: ["Langston", "Langston Hall", "Pickled Hen", "Cord & Kettle"],
      unlock: function (s) { return truthy(s.langston_seen) || truthy(s.langston_arrival_seen); },
      body: function (s) {
        var out = [
          "A compact trading town inside a low stone wall on the wagon road through the [[western_vale|Western Vale]]. Timber-framed houses with jutting upper floors crowd the cobbled streets, and the main street opens into a market square around a weathered stone fountain. Covered stalls and wagon bays stand by the gate.",
          "A broad flight of shallow steps climbs from the square toward the Hall, and a tall chapel tower shows above the roofs beyond it. From the upper lanes the wall gives way to open pasture and fields, with old forest along the southern horizon."
        ];
        if (truthy(s.wol_met_mayor) || Number(s.wol_funeral_day) > 0) {
          out.push("The day you reached it, Langston was burying one of its own: a young woman named [[maybelline|Maybelline]], who had been killed.");
        }
        if (truthy(s.wol_chapter_6_complete)) {
          out.push("Her killer was named before the whole town in the square, and Langston has gone back to its ordinary work.");
        }
        if (truthy(s.lg_hall_seen)) {
          out.push("Langston Hall is a dressed-stone hall on the upper side of the market square beneath the carved arms of [[house_gault|House Gault]]. The public chamber has benches, a long table where Mayor [[anathram|Anathram]] hears petitions, and shuttered counters where town clerks work beside notices of tolls, levies and militia service. A Contract Board hangs by the doors.");
          if (truthy(s.hall_gault_registered)) {
            out.push("The clerks opened a House Gault page on your Insignia, free of charge. The Countess likes to know who is hired in her Vale.");
          }
        }
        if (truthy(s.lg_hen_seen)) {
          out.push("The Pickled Hen is the town's broad timber-framed inn off the market square, marked by its painted sign of a white hen on a green crock. Its common room offers hot lamb stew, ale, dice games, and private rooms looked after by [[harlan_vetch|Harlan Vetch]].");
          if (truthy(s.wol_chapter_1_complete)) {
            out.push("Mayor Anathram arranged for the town to pay for your room and meals at the Hen while you worked for her.");
          }
        }
        if (truthy(s.lg_store_seen)) {
          out.push("The Cord & Kettle is a narrow corner shop just off the market square, with shelves climbing to the ceiling stocked with rope, lanterns, tools and camp supplies kept by [[ansel_reed|Ansel Reed]].");
        }
        return out;
      },
      see: ["western_vale", "house_gault", "barolo", "broadmead", "fallowmere", "anathram", "harlan_vetch", "ansel_reed", "true_sun_temple", "rois_grove"]
    },
    {
      id: "barolo", category: "places", title: "Barolo",
      sub: "A vineyard village on a sheltered rise in the Western Vale",
      tags: ["Barolo", "Western Vale", "House Gault", "Trade"],
      aliases: [
        "Barolo", "vineyard village", "vineyards", "the hill", "Red Stave", "The Red Stave",
        "Village Head's Hall", "Barolo Market", "Vineyard Roads", "the Stave"
      ],
      link: ["Barolo", "The Red Stave", "Red Stave", "Village Head's Hall", "Barolo Market", "Vineyard Roads"],
      unlock: function (s) { return truthy(s.ba_seen) || truthy(s.ba_arrival_seen); },
      body: function (s) {
        var out = [
          "A stone-built village on a sheltered chalk rise east of [[langston|Langston]], surrounded by long terraced lines of vines. It is both a working community of growers and the centre of a wider vineyard country where manors look out across the Western Vale. Whitewashed cottages and stone steadings cluster along narrow paved lanes, and the air smells of earth, vine leaves, fermenting must and woodsmoke.",
          "A stone arch marks the top of the hill track where carts bring grapes down to the presses and freight wagons roll out toward the Vale road."
        ];
        if (truthy(s.ba_hall_seen)) {
          out.push("The Village Head's Hall is a plain stone house near the center of the village. In its public room, [[hobart_thring|Hobart Thring]] hears petitions and records land boundaries, while the village Contract Board hangs beside the door under House Gault's shield.");
        }
        if (truthy(s.ba_rs_seen)) {
          out.push("The Red Stave is the village's two-storey inn with a cobbled court and a stove-warmed hall kept by [[odalie_hollowell|Odalie Hollowell]], serving hot meals, cellar wine, evening dice games, and private rooms upstairs.");
        }
        if (truthy(s.ba_market_seen)) {
          out.push("Barolo Market occupies the paved yard where the village lane meets the road from the arch. Under open canopies, growers, carters and merchants weigh fruit, table grapes and wine casks for shipment across the Vale.");
        }
        if (truthy(s.ba_vr_seen)) {
          out.push("The Vineyard Roads branch from a stone trough into the surrounding slopes: stepped roads, cart lanes and narrow paths running between stone walls, tool huts and seventy-odd family plots.");
        }
        if (truthy(s.ba_know_veyre) || truthy(s.ba_know_durnell) || truthy(s.ba_know_avenel)) {
          out.push("Three prominent families hold the major vineyard estates on the higher ground: [[house_veyre|House Veyre]] in the old stone house at the top, [[house_durnell|House Durnell]] on the cart lane, and [[house_avenel|House Avenel]] in the lower rows.");
        }
        return out;
      },
      see: ["western_vale", "house_gault", "broadmead", "fallowmere", "hobart_thring", "odalie_hollowell", "house_veyre", "house_durnell", "house_avenel", "langston"]
    },
    {
      id: "broadmead", category: "places", title: "Broadmead",
      sub: "A sheep and horse-breeding village in the open downs of the Western Vale",
      tags: ["Broadmead", "Western Vale", "House Gault", "Trade"],
      aliases: [
        "Broadmead", "meadow village", "the downs", "Crooked Halter", "The Crooked Halter",
        "Village Head's Hall", "Longfold Fair", "fairground", "Remount Yard", "the Halter", "Sun Pillar", "the Pillar"
      ],
      link: ["Broadmead", "The Crooked Halter", "Crooked Halter", "Village Head's Hall", "Longfold Fair", "Remount Yard", "Sun Pillar"],
      unlock: function (s) { return truthy(s.bm_seen) || truthy(s.bm_arrival_seen); },
      body: function (s) {
        var out = [
          "A stone-and-thatch village settled on a broad meadow of damp green grass along a shallow stream, under a long, bare down in the [[western_vale|Western Vale]], north-west of [[langston|Langston]]. The village runs along one rutted lane crossed by a humped stone bridge. Fences of every age divide the grass: tall post-and-rail fences with a brand cut deep into every post run around the best meadows, while older dry-stone walls and thorn hedges wander up the slopes toward the open common on the down.",
          "The air smells of wool, hay, wet earth, dung and woodsmoke. Drover tracks connect the village holding pens to the Vale road, where sheep flocks, cattle, and wool carts move toward Langston and the river."
        ];
        if (truthy(s.bm_hall_seen)) {
          out.push("The Village Head's Hall sits at the head of the lane, a long, low house of timber and stone under deep thatch beside the hurdle pens of the petition yard. Inside, [[mardred_birchstone|Mardred Birchstone]] works behind a plank counter beneath a rail of iron brand-marks, settling grazing disputes and recording brands. The village Contract Board hangs beside the study door under a narrow slate roof.");
        }
        if (truthy(s.bm_ch_seen)) {
          out.push("The Crooked Halter is the village's long, low inn near the bridge, with a halter hanging crooked from its bracket. Kept by [[olof|Olof]], its common room has heavy trestle tables, harness hanging from the walls, hot pie off the hearth, bitter downland ale, dice games at night, and simple rooms under the thatch.");
        }
        if (truthy(s.bm_fair_seen)) {
          out.push("Longfold Fair occupies a narrowing fold of the meadow below the village, filled with hurdle pens, an open-sided wool hall with a weigh-master's scale, and stone dairy stalls stacked with cheese wheels. At its far end, a weathered standing stone called the Sun Pillar rises from a low mound, its ancient sun disc worn smooth.");
        }
        if (truthy(s.bm_ry_seen)) {
          out.push("The Remount Yard stands across the stream on a slight rise, behind a wall of dressed grey stone and a shut iron gate. Marked by a tall navy banner bearing a single golden horse, it is a fortified post of [[house_gault|House Gault]] where troopers and grooms under Sergeant [[dagny_marren|Dagny Marren]] train and stable cavalry mounts. The gate remains barred to strangers without business or a writ from [[langston|Langston Hall]].");
        }
        if (truthy(s.bm_hl_asked_holders) || truthy(s.bm_hl_asked_commons) || truthy(s.bm_hl_asked_sides)) {
          out.push("Tension runs quietly through the village: eight or nine tenant families hold leases from Langston Hall to raise the Countess's mares on fenced meadows, while thrice as many common shepherds and dairy folk graze the open downs by ancient custom without a scrap of paper.");
        }
        return out;
      },
      see: ["western_vale", "house_gault", "fallowmere", "mardred_birchstone", "olof", "dagny_marren", "langston", "barolo"]
    },
    {
      id: "fallowmere", category: "places", title: "Fallowmere",
      sub: "A farming village on level land at the western edge of Langston's fields",
      tags: ["Fallowmere", "Western Vale", "House Gault", "Trade"],
      aliases: [
        "Fallowmere", "farming village", "the strips", "village pond", "the pond", "the green",
        "Grey Gander", "The Grey Gander", "Village Head's Hall", "market on the green"
      ],
      link: ["Fallowmere", "The Grey Gander", "Grey Gander", "Village Head's Hall", "market on the green"],
      unlock: function (s) { return truthy(s.fm_seen) || truthy(s.fm_arrival_seen); },
      body: function (s) {
        var out = [
          "A quiet farming village on level farmland at the western edge of [[langston|Langston]]'s fields in the [[western_vale|Western Vale]]. Whitewashed plaster-and-timber cottages with deep thatch ring a wide green around a shallow, reed-fringed pond where a flock of grey geese picks along the bank. At the near side stands a covered well under a shingle roof, and hedged strips of wheat, barley and beans run flat to the horizon.",
          "The village's main work is feeding Langston: farm carts roll out along the lane at first light loaded with grain, beans and greens, and the air smells of hay, wet reeds and woodsmoke."
        ];
        if (truthy(s.fm_hall_seen)) {
          out.push("The Village Head's Hall stands at the head of the lane, a long thatched house with a covered bench beneath a lean-to outside where neighbours wait with boundary disputes. Inside, [[aubrey_fenn|Aubrey Fenn]] keeps the field rolls and the village Contract Board beside the study door.");
        }
        if (truthy(s.fm_gg_seen)) {
          out.push("The Grey Gander is a long, low inn facing the green with a painted goose on an iron bracket and a wide arch leading to its cart yard. Kept by [[ione_brackett|Ione Brackett]], its taproom serves home-brewed barley beer, bean pottage, goose pie, hard rye loaves, and evening dice games for visiting carters.");
        }
        if (truthy(s.fm_market_seen)) {
          out.push("The market on the green consists of trestle tables and a heavy two-pan grain scale on a timber platform between the pond and the lane, where villagers buy and sell grain sacks, beans, vegetables, rope and farm tools under canvas awnings.");
        }
        return out;
      },
      see: ["western_vale", "house_gault", "aubrey_fenn", "ione_brackett", "langston", "barolo", "broadmead"]
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
          "She hears petitions and disputes at the long table in [[langston|Langston Hall]]."
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
      see: ["langston", "house_gault", "roi", "tomlin", "solaine"]
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
          "Langston's herbalist, who was engaged to Maybelline and spoke at her funeral. Tomlin is a handsome man with warm brown eyes, dark hair falling loosely across his brow, and a neatly kept beard. His practical clothes and working gloves suit a man accustomed to the garden and the brewing bench, while his quiet warmth softens an otherwise rugged appearance."
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
          "A bald dwarf druid in rough-spun clothes and animal hides, who sneezes often. He drove a wolf pack off the road when you first came toward Langston and told you to say he had sent you to the [[langston|Pickled Hen]]. He was on his way to a funeral."
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
      role: "Innkeeper, the Pickled Hen (Langston)",
      tags: ["Langston", "Lodging"], aliases: ["innkeeper", "Harlan", "Vetch", "Master Vetch"],
      link: ["Harlan Vetch", "Master Vetch", "Harlan"],
      unlock: "met_harlan_vetch",
      body: function (s) {
        var out = [
          "The aproned, balding innkeeper of the [[langston|Pickled Hen]]. He looks over his common room and its front door in turn, wiping down the plank counter and keeping an eye on who comes in off the square."
        ];
        if (truthy(s.wol_chapter_1_complete)) {
          out.push("Mayor Anathram arranged for the town to pay for your room and meals at the Hen while you worked for her.");
        }
        if (truthy(s.wol_chapter_6_complete)) {
          out.push("He wrote down the accusation in the market square at the mayor's request, because her aide was ill.");
        }
        return out;
      },
      see: ["langston", "anathram"]
    },
    {
      id: "ansel_reed", category: "people", title: "Ansel Reed",
      sub: "Keeper of the Cord & Kettle",
      role: "Storekeeper, the Cord & Kettle (Langston)",
      tags: ["Langston", "Trade"], aliases: ["Ansel", "Reed", "storekeeper", "shopkeeper"],
      link: ["Ansel Reed", "Ansel"],
      unlock: "met_ansel_reed",
      body: function (s) {
        var out = [
          "A broad, greying man who keeps the [[langston|Cord & Kettle]] off Langston's market square. He measures cord against the notches cut into the edge of his counter and tells customers plainly whether he has what they need for the road, the camp, or small repairs."
        ];
        return out;
      },
      see: ["langston"]
    },
    {
      id: "hobart_thring", category: "people", title: "Hobart Thring",
      sub: "Village head of Barolo",
      role: "Village Head, the Village Head's Hall (Barolo)",
      tags: ["Barolo", "House Gault"], aliases: ["Hobart", "Thring", "village head"],
      link: ["Hobart Thring", "Hobart"],
      unlock: function (s) { return truthy(s.ba_know_head) || truthy(s.ba_hl_head_opened); },
      body: function (s) {
        var out = [
          "The village head of [[barolo|Barolo]], a tall, stooped man in his mid-fifties with cropped grey hair and ink soaked into his cuffs. He works at a window table in the Village Head's Hall with a pen in hand, writing down what he hears as he listens because he forgets what has not been recorded.",
          "He was once the clerk to the old village head. When his predecessor died at the table mid-sentence, Hobart was the only one who could read the hand; Mayor [[anathram|Anathram]] confirmed his appointment under the Countess's seal that spring. He is known as slow, fair, and careful with every boundary and contract."
        ];
        if (truthy(s.ba_hl_asked_growers)) {
          out.push("Most of his days are spent settling path disputes and press schedules for the seventy-odd small growers who bring their grapes to the common press.");
        }
        if (truthy(s.ba_know_house_wants)) {
          out.push("He keeps a wary balance among the three big estates: Lady Maelin asks for ancient unwritten rights, Master Cellan hopes for a gentry title beside his name, and Mistress Tressa and her nephew pull between the small growers and family standing.");
        }
        return out;
      },
      see: ["barolo", "house_gault", "odalie_hollowell", "house_veyre", "house_durnell", "house_avenel"]
    },
    {
      id: "odalie_hollowell", category: "people", title: "Odalie Hollowell",
      sub: "Innkeeper of the Red Stave",
      role: "Innkeeper, the Red Stave (Barolo)",
      tags: ["Barolo", "Lodging"], aliases: ["Odalie", "Hollowell", "innkeeper", "the Stave"],
      link: ["Odalie Hollowell", "Odalie"],
      unlock: "met_odalie_hollowell",
      body: function (s) {
        var out = [
          "The round-faced halfling innkeeper of the [[barolo|Red Stave]], with a streak of grey in her auburn braid and forearms stained purple to the elbow from wine. She stands on a wooden step behind the counter so she can see over it, a heavy ring of cellar keys at her hip.",
          "She came up the river road as a cook with her mother's recipes and bought the inn on terms from its previous owner, paying off every coin. She pours for all three manor houses and prides herself on keeping their rivalries outside her doors."
        ];
        if (truthy(s.ba_rs_talk_opened)) {
          out.push("She keeps a sharp eye on the hall, knowing the people who grow the wine, the ones who haul it, and the ones who drink it.");
        }
        return out;
      },
      see: ["barolo", "hobart_thring"]
    },
    {
      id: "mardred_birchstone", category: "people", title: "Mardred Birchstone",
      sub: "Village head of Broadmead",
      role: "Village Head, the Village Head's Hall (Broadmead)",
      tags: ["Broadmead", "House Gault"], aliases: ["Mardred", "Birchstone", "dwarf", "village head"],
      link: ["Mardred Birchstone", "Mardred"],
      unlock: function (s) { return truthy(s.bm_know_head) || truthy(s.bm_hl_opened); },
      body: function (s) {
        var out = [
          "The village head of [[broadmead|Broadmead]], a dwarf woman with thick grey braids who works at the plank counter in the Village Head's Hall, with a big grey drover dog sleeping across the threshold. She settles disputes with blunt, numbered points counted on her fingers, and takes in every visitor with a sharp eye.",
          "She walked cattle and sheep for the yard's buyers for thirty years, between Dunmow and the river, and knows every brand in the Vale. When the previous head retired, every man in the village pointed at her because a head who cannot read a brand can be lied to. She accepted the post under [[house_gault|House Gault]]'s charter to give her worn knees a rest, though she calls a desk the worse trade."
        ];
        if (truthy(s.bm_hl_asked_holders)) {
          out.push("She keeps count of the eight or nine families who raise the Countess's mares, noting they are skilled and careful under the yard's eye, though tired of folk treating the horses as gifts.");
        }
        if (truthy(s.bm_hl_asked_commons)) {
          out.push("She protects the customary rights of the shepherds and common folk whose grandmothers grazed the lower commons before the yard was built.");
        }
        if (truthy(s.bm_hl_asked_sides)) {
          out.push("In confidence she told you the dispute is over fences: every time the Home Meadow is fenced for the mares, the commons lose a strip of spring grazing. With paper on one side and custom on the other, she works to keep both sides believing she is half theirs to prevent a fight.");
        }
        return out;
      },
      see: ["broadmead", "house_gault", "olof", "dagny_marren"]
    },
    {
      id: "olof", category: "people", title: "Olof",
      sub: "Innkeeper of the Crooked Halter",
      role: "Innkeeper, the Crooked Halter (Broadmead)",
      tags: ["Broadmead", "Lodging"], aliases: ["Olof", "half-orc", "innkeeper", "the Halter"],
      link: ["Olof"],
      unlock: "met_olof",
      body: function (s) {
        var out = [
          "The big half-orc innkeeper of the [[broadmead|Crooked Halter]], with small worn tusks, a grey braid over one shoulder, old rope scars across his forearms, and a left leg stretched out stiff from an old injury. He wipes pewter mugs behind a stall-partition bar and slides drinks across without standing up.",
          "He spent twenty-two years on the road as a drover, driving wool to Langston and cattle to the river, until a mare put her hoof through his hip outside Dunmow. Unable to walk the roads, he bought the Halter with his savings and his second-best horse when the previous owner wanted to sit down. He judges people by how they handle dogs and horses."
        ];
        if (truthy(s.bm_ch_talk_opened)) {
          out.push("He describes the villagers as decent folk who do not always agree, and keeps out of their disputes himself.");
        }
        if (truthy(s.bm_ch_asked_sergeant)) {
          out.push("He pointed you toward Sergeant [[dagny_marren|Dagny Marren]] at the Remount Yard, saying she is fair like a good farrier is fair, and trusts her because she speaks to the horse before looking at the rider.");
        }
        return out;
      },
      see: ["broadmead", "mardred_birchstone", "dagny_marren"]
    },
    {
      id: "dagny_marren", category: "people", title: "Dagny Marren",
      sub: "Sergeant of the Remount Yard",
      role: "Sergeant & Horse Trainer, the Remount Yard (Broadmead)",
      tags: ["Broadmead", "House Gault", "Military"], aliases: ["Dagny", "Marren", "Sergeant Marren", "trainer", "sergeant"],
      link: ["Dagny Marren", "Sergeant Marren", "Sergeant Dagny Marren", "Dagny"],
      unlock: function (s) { return truthy(s.bm_know_sergeant) || truthy(s.bm_ry_met); },
      body: function (s) {
        var out = [
          "A human woman of forty-odd who commands the [[broadmead|Remount Yard]] across the stream from Broadmead, managing the Countess's warhorses and schooling mounts under [[house_gault|House Gault]]. She has a quiet, level voice, an old scar through her left eyebrow, and pale lines worn into her palms from years of holding reins. She speaks to a horse before speaking to a person, and counts every foal raised for the yard herself.",
          "The yard's gate remains barred to strangers without business or a writ from [[langston|Langston Hall]]."
        ];
        if (truthy(s.bm_ry_met)) {
          out.push("She rode for Countess Gault for eleven years until a horse fell under her on the ice at Coombe Gap, injuring her knee. When the mayor in Langston needed someone who would sort horses by what they are rather than what they are worth, she was given the yard. She admits she misses riding every morning until she puts a saddle on a young horse.");
        }
        return out;
      },
      see: ["broadmead", "house_gault", "mardred_birchstone", "olof"]
    },
    {
      id: "aubrey_fenn", category: "people", title: "Aubrey Fenn",
      sub: "Village head and surveyor of Fallowmere",
      role: "Village Head & Clerk, the Village Head's Hall (Fallowmere)",
      tags: ["Fallowmere", "House Gault"], aliases: ["Aubrey", "Fenn", "village head", "surveyor"],
      link: ["Aubrey Fenn", "Aubrey"],
      unlock: function (s) { return truthy(s.fm_know_head) || truthy(s.fm_hl_opened); },
      body: function (s) {
        var out = [
          "The village head and sole clerk of [[fallowmere|Fallowmere]], a lean, sunburnt human man in his late thirties with ink-stained cuffs and a surveyor's cord constantly looped around his fingers. He is earnest, anxious, and quick to apologise, speaking in fast, looping sentences that frequently double back on themselves.",
          "He studied surveying in Langston with dreams of drawing grand maps of high ridges and rivers. When his booming father died, the elders found every field roll in Aubrey's hand and asked him to see out the autumn rent; he never left. He keeps the rolls, measures boundary lines with his cord, oversees ditch and road duties, and reports to [[langston|Langston Hall]] under [[house_gault|House Gault]]'s seal."
        ];
        if (truthy(s.fm_hl_asked_village)) {
          out.push("He takes quiet pride in the strips that feed Langston, pointing out that if a strip is out by half an ell, the miller and carter argue and the town goes hungry.");
        }
        if (truthy(s.fm_hl_praised)) {
          out.push("When told the village is lucky to have him, he flushed to his ears in genuine, flustered gratitude.");
        }
        return out;
      },
      see: ["fallowmere", "house_gault", "ione_brackett", "langston"]
    },
    {
      id: "ione_brackett", category: "people", title: "Ione Brackett",
      sub: "Innkeeper of the Grey Gander",
      role: "Innkeeper, the Grey Gander (Fallowmere)",
      tags: ["Fallowmere", "Lodging"], aliases: ["Ione", "Brackett", "half-elf", "innkeeper", "the Gander"],
      link: ["Ione Brackett", "Ione"],
      unlock: "met_ione",
      body: function (s) {
        var out = [
          "The dry, unbothered half-elf innkeeper of the [[fallowmere|Grey Gander]], with grey-streaked hair in a plain knot and scarred forearms from years over the hearth. She polishes pewter mugs in steady, slow circles and addresses customers levelly by their trade before learning their name.",
          "She grew up at the inn as a potgirl after her father, a local reaper, died of a winter illness. The old landlord raised her, kept the taps for another decade, and left her the inn, the cask, and no debts. Her mother was an elven wagon-singer whom Ione brushes off simply as 'passing trade.' She feeds the harvest crews and keeps a peaceful, orderly house."
        ];
        if (truthy(s.fm_gg_asked_dice) || truthy(s.fm_gg_dice_met)) {
          out.push("After dark, she brings down bone dice and a chalked slate from a high shelf for carters and field hands to play small-stakes games by the hearth.");
        }
        return out;
      },
      see: ["fallowmere", "aubrey_fenn"]
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
    },
    {
      id: "house_veyre", category: "factions", title: "House Veyre",
      sub: "An old vineyard estate in Barolo",
      tags: ["Barolo", "Estate", "Western Vale"], aliases: ["Veyre", "Lady Maelin", "Lady Maelin Veyre", "Lucan Veyre", "Lucan", "stone house"],
      link: ["House Veyre", "Lady Maelin", "Lady Maelin Veyre", "Lucan Veyre"],
      unlock: "ba_know_veyre",
      body: function (s) {
        var out = [
          "One of the three major vineyard houses of [[barolo|Barolo]], holding the old stone manor at the crest of the hill. The house is headed by Lady Maelin Veyre, a proud widow who holds strictly to her family's honour and debts."
        ];
        if (truthy(s.ba_know_lucan)) {
          out.push("Her son, Lucan Veyre, is heir to the estate and will take the stone house after her.");
        }
        if (truthy(s.ba_know_house_wants)) {
          out.push("Lady Maelin persistently asks the village head to uphold her family's ancient, unwritten privileges in any dispute that touches her land.");
        }
        return out;
      },
      see: ["barolo", "hobart_thring", "house_durnell", "house_avenel"]
    },
    {
      id: "house_durnell", category: "factions", title: "House Durnell",
      sub: "A prosperous vineyard and freight estate in Barolo",
      tags: ["Barolo", "Estate", "Western Vale", "Trade"], aliases: ["Durnell", "Master Cellan", "Master Cellan Durnell", "Cellan Durnell", "Ressa Durnell", "cart lane yard"],
      link: ["House Durnell", "Cellan Durnell", "Master Cellan", "Ressa Durnell"],
      unlock: "ba_know_durnell",
      body: function (s) {
        var out = [
          "One of the three big houses of [[barolo|Barolo]], seated at the large yard along the cart lane. It is headed by Master Cellan Durnell, who rose from the wagon and freight trade; he is known for paying wages on the day and remembering every favour."
        ];
        if (truthy(s.ba_know_ressa)) {
          out.push("His daughter, Ressa Durnell, oversees the daily work of the yard and its teams.");
        }
        if (truthy(s.ba_know_house_wants)) {
          out.push("Master Cellan quietly seeks social recognition to match his wealth, hoping to see 'landed gentry' written beside his name in the Hall's posting book.");
        }
        return out;
      },
      see: ["barolo", "hobart_thring", "house_veyre", "house_avenel"]
    },
    {
      id: "house_avenel", category: "factions", title: "House Avenel",
      sub: "A longtime vine-growing family in Barolo",
      tags: ["Barolo", "Estate", "Western Vale"], aliases: ["Avenel", "Mistress Tressa", "Mistress Tressa Avenel", "Tressa Avenel", "Garran Avenel", "Garran"],
      link: ["House Avenel", "Tressa Avenel", "Mistress Tressa", "Garran Avenel"],
      unlock: "ba_know_avenel",
      body: function (s) {
        var out = [
          "One of the three principal vineyard houses of [[barolo|Barolo]], holding the farm at the end of the lower lane. Mistress Tressa Avenel grew up among the rows and knows every small grower and their kin by name."
        ];
        if (truthy(s.ba_know_garran)) {
          out.push("Her nephew, Garran Avenel, is the designated heir to the Avenel lands and is eager to see his standing recognized.");
        }
        if (truthy(s.ba_know_house_wants)) {
          out.push("While Mistress Tressa urges the village head to protect the interests of the common growers, Garran continually presses for the advancement of the Avenel name.");
        }
        return out;
      },
      see: ["barolo", "hobart_thring", "house_veyre", "house_durnell"]
    }

  ]);
})();
