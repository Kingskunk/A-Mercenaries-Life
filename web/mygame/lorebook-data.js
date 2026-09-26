/*
 * LOREBOOK DATA -- every codex entry for A Mercenary's Path lives here.
 *
 * Adding an entry = adding one object to `entries`. Nothing else needs to change:
 * search, filters, the NEW badge and the discovered count all pick it up.
 *
 * Fields
 *   id        unique slug; other entries link to it with [[id|label]] inside body text
 *   category  one of the ids in `categories`
 *   title     shown in the list and as the entry heading
 *   sub       one line under the title in the list (role, or what it is)
 *   role      optional line under the heading in the reader (defaults to sub)
 *   tags      short labels; clicking one filters the list. Also searched.
 *   aliases   extra search words that are not in the text ("Free City", "Oath")
 *   link      exact phrases in the story text that become clickable links to this entry (only
 *             once the entry is unlocked, and only the first mention on each page). Keep these
 *             specific: a full proper name (Port Watch, Gilded Scales), never a common word
 *             ("captain", "tolls", "watch", "oath") and never a phrase that starts with "the",
 *             since "the" is not always capitalised. Generic words could point at the wrong
 *             town once there is more than one.
 *   unlock    game variable name, or an array (any of them), or function(stats) -> bool.
 *             Omit for an entry that is known from the start. Locked entries are invisible.
 *   meter     { stat, label } draws a 0-100 bar from a game variable (a faction rep, a bond).
 *             May also be function(stats) -> that object, or null for no bar.
 *   body      HTML string, array of strings (one paragraph each) or function(stats) -> either.
 *             Inline HTML allowed (<b>, <i>). {{stat_name}} inserts a game variable.
 *   see       ids of related entries; only unlocked ones are shown
 *
 * Text rules still apply: names are only revealed once the player has met them, and prose
 * follows narrative_guidelines.md. This file is loaded before lorebook.js.
 *
 * WRITING AN ENTRY (read before adding or editing one)
 *
 *   Canon first. An entry may only say what the scenes say. Before writing, grep
 *   web/mygame/scenes for the name and check the spelling, numbers, and who says what. Anything
 *   invented for the codex (a rumor, a backstory) must be written as rumor, never as fact, and
 *   should be added to a scene too if it is meant to be true. Fix a contradiction in the scene
 *   and the entry together, never in only one of them.
 *
 *   Shape. One line saying who or what it is. Then two to four sentences of what the player has
 *   seen or been told, with hearsay labelled as hearsay. Then one short line to recognise a person
 *   or place by, not a reprint of the scene's description. Base text about 60-150 words.
 *
 *   Growth. Anything the player learns later goes in its own gated paragraph (a function body
 *   checking the flag that scene sets), one fact per flag, about 60 words each. Write the
 *   outcome, not the menu option: "The commutation was never in the charter", not "Ask him about
 *   the commutation". Do not retell the scene or quote its dialogue.
 *
 *   One home per fact. If another entry already covers it (a speech, a rule, a secret), link with
 *   [[id|label]] or `see` instead of restating it.
 *
 *   Names. Unlock an entry at the moment the player learns the name, and check that the base text
 *   does not name anyone the player may not have met on that route. Give a person's role or
 *   route-dependent detail (Elspeth's whereabouts) its own branch instead of naming every route.
 *
 *   Voice. Plain words a 20-25 year old knows: no trade or period jargon (dubbin, hogshead,
 *   windlass, ashlar, barbel) unless the scene already taught it. No verdict adjectives (grasping,
 *   paranoid, brutal, corrupt) and no inner states; say what the person did and let the player
 *   decide. Do not state the government of Port Valen; the entries show it through details.
 *
 *   Tics to avoid. Repeating the same pet words across entries (arithmetic, stamped, sealed,
 *   ledger), "X, not Y" sentence patterns, heavy em dash use, and "the kind of..." shorthand.
 *
 *   One topic per entry, so no "A & B" titles. People go under People even when they lead a faction.
 */
(function () {
  "use strict";

  function truthy(v) { return v === true || v === "true"; }

  window.LOREBOOK = {
    categories: [
      { id: "people", label: "People" },
      { id: "factions", label: "Factions" },
      { id: "places", label: "Places" },
      { id: "history", label: "History & Law" },
      { id: "lore", label: "Faith & Folklore" }
    ],

    entries: [

      /* ------------------------------------------------------------------ PEOPLE */

      {
        id: "vane", category: "people", title: "Captain Joshua Vane",
        link: ["Captain Joshua Vane", "Captain Vane", "Joshua Vane", "Vane"],
        sub: "Founding Captain of the Iron Carrion",
        role: "Iron Carrion — Company Commander",
        tags: ["Iron Carrion"], aliases: ["Vane", "Joshua Vane", "captain", "commander", "founding captain"],
        meter: function (s) { return truthy(s.met_vane) ? { stat: "vane_standing", label: "Captain Vane's Regard" } : null; },
        body: function (s) {
          if (!truthy(s.met_vane)) {
            return ["The aloof commander of the Iron Carrion. You have only seen his black raven pavilion from afar."];
          }
          var out = [
            "The cold, calculating commander of the Iron Carrion, and the man who built it. A stern, aloof strategist who treats warfare as a business of ledgers, contracts, and calculated brutality, and who expects the same arithmetic from every soul drawing company pay. He gives his orders in fragments, and he negotiates the company's commissions himself, coin by coin.",
            "Veterans of the hearth-circles say he raised the Carrion out of the wreckage of the Broken Crown War, gathering deserters, runaway bond-servants, and broken soldiers behind a quartered raven banner while the imperial legions were still dissolving across the Marches. He has run it on iron discipline and exact weight of coin ever since, and the men who have served him longest speak of it without much affection and without a single complaint.",
            "Where he learned the trade, nobody in the ranks can settle. The telling among the veterans — never confirmed and never quite denied — is a cashiered imperial officer who traded high rank for the freedom of a mercenary captaincy, and his bearing does nothing to quiet it. <i>\"Tall and immaculately kept in a way that looks almost offensive against the mud of the camp—silver-templed, imperial-cut coat brushed clean, a jeweled signet ring on the hand that signs the contracts, and pale eyes that linger a beat too long pricing a man before they ever bother to judge him.\"</i> Nobody who has asked him straight has gotten a straight answer, and most have stopped asking.",
            "He runs the company from behind the line and from behind a desk: in the field, mounted on dry ground under the raven banner with a brass spyglass, runners waiting on his hand signals; in quarters, a trestle desk of muster rolls and transit waybills with the banner nailed flat to the masonry instead of hung loose. In any town that pays the company, the same house law holds — no private collections, no unsanctioned bloodshed under a patron's colors, and a captain who will not know your name if the law comes asking. Leverage interests him more than glory, and he spends it the way he spends silver: late, deliberately, and only for something the company cannot take."
          ];
          if (truthy(s.met_odessa)) {
            out[1] += " Surgeon Odessa, ten years under his hand, puts it plainer: in the Carrion a soldier dies of steel or gangrene, never of politics.";
          }
          return out;
        },
        see: ["iron_carrion", "carrion_founding", "meridian_empire", "gilded_scales", "varren", "kestrel", "ysolde", "odessa", "port_valen", "carrion_compound"]
      },
      {
        id: "varren", category: "people", title: "Sergeant Varren",
        link: ["Sergeant Varren", "Varren"],
        sub: "Vanguard Drillmaster & Frontline Veteran",
        role: "Iron Carrion — Vanguard Drillmaster & Frontline Veteran",
        tags: ["Iron Carrion"], aliases: ["Varren", "drillmaster"],
        unlock: "met_varren",
        meter: { stat: "varren_respect", label: "Sergeant Varren's Regard" },
        body: function (s) {
          var out = [
            "Vanguard drillmaster and frontline sergeant. He turned green recruits into soldiers who did not break the shield-wall, working from the munitions barrels at intake, the banner watch at night, and the practice post at dawn.",
            "<i>\"A massive slab of a man, gone thick and hard with age rather than soft, half his face a crosshatch of old siege-scars that pull his mouth into a permanent, humorless line. Close-cropped grey stubble, a nose broken at least twice and never set straight, and one milk-pale eye that does not track quite right in bad light. Blackened chainmail, spit in the mud, and a voice like flint.\"</i>"
          ];
          if (truthy(s.prep_varren_drill)) {
            out.push("His doctrine, drilled into every file: keep your files tight, keep your feet dry, do not get flanked in the reeds, and keep grease on your iron. He ran the Vanguard line himself before a fight, checking straps and grips.");
          }
          if (s.squad === "vanguard") {
            out.push("Those who stood in his file knew the terms: front line, shield to shield, first to bleed and first to get paid for it. His praise ran to a single grunt or a nod, and remember that stance tomorrow was as warm as it ever got.");
          }
          if (s.elspeth_role === "baggage_train") {
            out.push("At Alderford he wrote your sister onto the second file's camp roll himself, weighing her mending and harness work as worth two drunken teamsters. She rode the fourth grain barge and ate from the company kettle, treated as crew under his eye, not cargo.");
          }
          return out;
        },
        see: ["iron_carrion", "vane", "carrion_founding", "lyra", "odessa", "port_valen"]
      },
      {
        id: "kestrel", category: "people", title: "Kestrel",
        link: ["Kestrel"],
        sub: "Scout Company Commander",
        role: "Iron Carrion — Scout Company Commander",
        tags: ["Iron Carrion"], aliases: ["scouts", "Scout Company"],
        unlock: "met_kestrel",
        meter: { stat: "kestrel_respect", label: "Kestrel's Regard" },
        body: [
          "Scout Company's commander. Lean, weathered, and near-silent, she runs the smallest armed company in camp on trust earned the hard way and answers to no rank but her own reputation.",
          "<i>\"Lean, weathered, and somewhere past sixty winters—though the keen stillness in her pale moss-green eyes and her untiring stride through the marsh betray none of it. Tapered half-elven ears sit tucked beneath a close-fitting coif of greased leather, dark hair cropped short and greying at the temples, and a long skinning knife worn plain at her hip with no ornament worth mentioning. She goes by one name and no formal rank, commanding the scouts on trust earned the hard way across decades of fen warfare. Watches everyone, including her own recruits, before they ever realize they're being watched.\"</i>"
        ],
        see: ["iron_carrion"]
      },
      {
        id: "ysolde", category: "people", title: "Ysolde Marrow",
        link: ["Ysolde Marrow", "Ysolde"],
        sub: "Cadre Handler",
        role: "Iron Carrion — Cadre Handler",
        tags: ["Iron Carrion"], aliases: ["Ysolde", "Marrow", "Cadre", "handler"],
        unlock: "met_ysolde",
        meter: { stat: "ysolde_respect", label: "Ysolde's Regard" },
        body: function (s) {
          var out = [
            "The Cadre's handler. She kept the company's small handful of gifted recruits the way other sergeants kept count of rations: exactly, constantly, and with no intention of running short. Six or seven at any time against four hundred soldiers who mostly wished the number were smaller.",
            "<i>\"An older woman carrying subtle marks of infernal bloodline—small, polished obsidian ram horns sweeping close against dark hair streaked with iron-grey, and pale mercury-silver irises that miss nothing while appearing to look at nothing in particular. A physician's leather satchel of scrolls and glass vials slung across one shoulder, hands steady enough to thread a needle by firelight without looking down.\"</i>"
          ];
          if (s.squad === "cadre") {
            out.push("Those who marched under her hand knew the terms: worth more alive than heroic, and told so plainly. She rationed the Cadre's workings from necessity, not mercy—raw current through nerves and marrow, fingers that seize, hearts that give out in the mud. Her praise was a dry nod or an errand of trust; her discipline was a hand keeping you out of the arrow-hail until the line truly broke.");
          }
          if (truthy(s.alder_river_chain_cleared)) {
            out.push("At Alderford she spread the sounding charts flat and showed you the blank stretch below the weir: an imperial boom, four barges too deep, half a century of guesswork and a flooded chamber. She staked the flotilla on sounding logs and an operative in the dark until the gorge was clear. Her silver spectacles only ever came out over chart tables.");
          }
          if (truthy(s.visited_bivouac_ysolde)) {
            out.push("By the bivouac lantern she sorted sulfur and marsh-salts by hand and signed supply chits with a swift flourish. Disciplined and reliable earned her ink. Clumsy thumbs earned a firm gesture back and an order to leave the crate alone.");
          }
          return out;
        },
        see: ["iron_carrion", "vane", "carrion_founding", "kestrel", "odessa", "port_valen"]
      },
      {
        id: "lyra", category: "people", title: "Lyra",
        link: ["Lyra"],
        sub: "Vanguard Scout & Recurve Archer, Rookie Cohort",
        role: "Iron Carrion — Vanguard Scout & Recurve Archer, Rookie Cohort",
        tags: ["Iron Carrion"], aliases: ["archer", "rookie"],
        unlock: "met_lyra",
        meter: { stat: "lyra_bond", label: "Comradeship with Lyra" },
        body: [
          "A fellow rookie who claimed her recurve bow beside you at the munitions cart. Sharp-eyed, guarded, and determined to survive her first campaign under the Carrion.",
          "<i>\"Lean and sharp-featured, raven-dark hair tied back in rough cord that never quite stays neat, with quick, watchful eyes that catch every movement in a room before settling on you. Quiet scars along both forearms that she's never once explained. A downriver survivor who took the iron shilling to outrun starvation—guarded, lethal with a shortbow, and watching your back whether you asked her to or not.\"</i>"
        ],
        see: ["iron_carrion"]
      },
      {
        id: "odessa", category: "people", title: "Surgeon Odessa",
        link: ["Surgeon Odessa", "Odessa"],
        sub: "Company Surgeon & Field Medic",
        role: "Iron Carrion — Company Surgeon & Field Medic, Logistics & Baggage Train",
        tags: ["Iron Carrion"], aliases: ["Odessa", "surgeon", "medic", "healer"],
        unlock: "met_odessa",
        meter: { stat: "odessa_respect", label: "Surgeon Odessa's Regard" },
        body: function (s) {
          var out = [
            "The company's field surgeon. She kept the four hundred patched together with boiled linen, bone needles, and waxed thread, working from a triage wagon on the march and a pair of overturned munitions crates behind the line.",
            "<i>\"A gaunt, sharp-featured woman with more scars across her fingers and knuckles than most of the frontline veterans she stitches. Dark hair pulled back severe and pinned with a carved bone bodkin, leather apron stained with lanolin and iodine, small iron knife at her belt for shearing thread. Sharp-eyed and unsentimental, she prices every wound in linen, vinegar, and time.\"</i>"
          ];
          if (truthy(s.codex_odessa)) {
            out.push("What she told you at the Black Sinks, knotting thread with her teeth: ten years under Captain Vane. Before that she kept an apothecary in the high city until a tax-bailiff burned it for unpaid levies. Vane offered forty silver marks a season and one promise — no lord would ever tell her who she could or could not treat.");
          }
          if (truthy(s.prep_odessa_salve)) {
            out.push("The tin she pressed into your hands at the triage cart: camphor fat, rubbed into the joints to seal out the damp and boot-chafe on a long march, and to ward off marsh sickness. Dirty water, she told you, kills more soldiers than steel.");
          }
          if (s.elspeth_role === "odessa_apprentice") {
            out.push("At Alderford your sister boiled linen at her table, folded bandage strips, and steeped willow-bark wash under her eye. Odessa fed her from the company kettle and bedded her on the hospital transport. Her test was short: hands that do not shake, eyes that stay clear, and sense enough to keep her head down when arrows fly.");
          }
          return out;
        },
        see: ["iron_carrion", "vane", "elspeth", "alderford", "port_valen"]
      },
      {
        id: "rorik", category: "people", title: "Veteran Rorik",
        link: ["Veteran Rorik", "Rorik"],
        sub: "Munitions Armorer & Sapper Veteran",
        role: "Iron Carrion — Munitions Armorer & Sapper Veteran, Munitions Train",
        tags: ["Iron Carrion"], aliases: ["Rorik", "armorer", "smith", "sapper"],
        unlock: "met_rorik",
        meter: { stat: "rorik_regard", label: "Comradeship with Rorik" },
        body: [
          "A grizzled Highland smith and munitions armorer who keeps the company's steel honed at the baggage wagons.",
          "<i>\"A grizzled, broad-shouldered Highland smith with burn-scarred forearms, a notched ear, and a cloud of bitter pipeweed smoke trailing his steps. Having swung sledge for Master Torvald back in the Highland Crags, and helped him frame his mill at Alderford, before taking the mercenary shilling, he methodically hones company blades and shares hard-earned forgecraft with recruits who respect the steel.\"</i>"
        ],
        see: ["iron_carrion", "torvald", "alderford"]
      },
      {
        id: "elspeth", category: "people", title: "Elspeth",
        link: ["Elspeth"],
        sub: "Your younger sister",
        role: function (s) {
          if (s.elspeth_role === "odessa_apprentice") return "Iron Carrion — Surgeon's Assistant & Apprentice, Logistics & Baggage Train";
          if (s.elspeth_role === "baggage_train") return "Iron Carrion — Camp Seamstress & Carter, Baggage Train";
          if (s.elspeth_role === "chapel_sanctuary") return "Alderford — Weaver Novice, Ecclesiastical Sanctuary (Upper Chapel)";
          return "";
        },
        tags: ["Family"], aliases: ["sister", "kin", "Ashbrook"],
        unlock: "elspeth_safe",
        meter: { stat: "elspeth_bond", label: "Sibling Bond with Elspeth" },
        body: function (s) {
          var race = s.race, looks;
          if (race === "tiefling") looks = "small curling ram-horns budding beneath her dark fringe, glowing eyes, and the salt-crusted tail she keeps wrapped tightly around her waist beneath her linen apron";
          else if (race === "half_orc") looks = "a strong jawline, small lower tusks, and green-tinted skin gone pale with exhaustion and soot";
          else if (race === "elf") looks = "delicate, tapered ears peeking beneath her coarse linen cowl and almond eyes";
          else if (race === "dwarf") looks = "sturdy dwarven shoulders, thick braided hair, and work-scarred hands";
          else if (race === "halfling") looks = "a nimble, compact frame barely chest-high to the brine vats and round cheeks hollowed by weeks of meager rations";
          else if (race === "hexblood") looks = "cool, grey-toned skin, subtle elder-braids, and eerie, calm irises";
          else looks = "dark hair dusted with coarse salt and valley-born eyes";
          var where;
          if (s.elspeth_role === "odessa_apprentice") where = "boiling linen at Surgeon Odessa's table";
          else if (s.elspeth_role === "baggage_train") where = "mending and carting with the baggage train";
          else if (s.elspeth_role === "chapel_sanctuary") where = "sheltered with the weavers under the chapel eaves";
          else where = "wherever you have left her";
          return [
            "<i>\"Your younger sister and sole surviving kin from the burning of Ashbrook. Resilient, observant, and hardened by weeks of grueling labor in the riverfront salt sheds, she carries the trauma of your family's loss with quiet courage. Whether " + where + ", she trusts your strength and skill to see you both through the Marches.\"</i>",
            "Thinner and paler than when you last saw her in the Marches, but unmistakably kin: " + looks + "."
          ];
        },
        see: ["ashbrook", "saint_althea"]
      },

      /* ------------------------------------------------------ PEOPLE: ALDERFORD */

      {
        id: "talia", category: "people", title: "Talia",
        sub: "Brine-loft holder, Alderford waterfront",
        role: "Brine-loft holder & salter, the riverfront curing bays",
        link: ["Talia"],
        tags: ["Alderford"], aliases: ["salter", "curing loft", "brine", "waterfront"],
        unlock: "met_talia",
        body: function (s) {
          var out = [
            "Forewoman of the four brine-curing lofts on Alderford's waterfront, and one of the last independent salters left on the wharf. She is a slender young woman with green eyes, in a coarse linen apron, and by the end of a shift her brow is flushed with sweat and dusted with sawdust. She makes the tallow-and-oil grease the river trade rubs into its leather, runs the boiling pans and drying racks with veteran cutters like Maren and a crew of local women, and has no intention of selling to anyone."
          ];
          if (truthy(s.visited_talia_loft)) {
            var fatherInfo = "The lofts were her father's. Franklin Parker, Master Salter, felled the timber and drove the foundation piles thirty winters ago, when Alderford was three timber sheds and a ferry rope.";
            if (truthy(s.discussed_talia_craft)) {
              fatherInfo += " He breathed the salt-steam for twenty winters and it hardened his lungs. His branding hammer hangs above her hearth.";
            }
            if (truthy(s.discussed_talia_exemption)) {
              fatherInfo += " Pinned beside it hangs a curled strip of parchment with a cracked provincial seal: an imperial free-wharf exemption, the paper that keeps her slips her own.";
            }
            out.push(fatherInfo);
          }
          if (truthy(s.discussed_talia_exemption)) {
            out.push("The Scales want those slips. They are the only deep-water berths above the gorge locks, and whoever holds them can make every grain barge, timber raft, and supply boat bound for Port Valen pay a private toll or wait at the weir. Without them she would be another tenant working someone else's tubs. 'Rennick wasn't only after my drying tax tonight,' she says. 'The Scales want to choke out every independent salter on the wharf.'");
          }
          return out;
        },
        see: ["maren", "alderford", "rennick", "morzan", "gilded_scales", "sanctuary_charter", "meridian_empire", "grey_river"]
      },
      {
        id: "maren", category: "people", title: "Maren",
        sub: "Senior salt-cutter, Alderford curing lofts",
        role: "Senior salt-cutter & journeywoman, the riverfront curing bays",
        link: ["Maren"],
        tags: ["Alderford"], aliases: ["cutter", "salt-cutter", "journeywoman", "elder cutter"],
        unlock: "met_maren",
        body: [
          "A wiry, grey-haired salt-cutter in a brine-bleached apron, her forearms covered in old knife nicks and salt burns. She cut fish beside Talia's father, Garrett, for twenty winters, and knows these vats better than anyone on the river.",
          "Gravel-voiced and protective of the lofts, she knows every water gate, drying rack, and salt ratio on the lower wharf. Talia handles the accounts, the leather grease, and the guild factors. Maren runs the cutting floor with a curved gutting knife and refuses to be short-weighed by Gilded Scales weigh-masters."
        ],
        see: ["talia", "alderford", "rennick", "gilded_scales"]
      },
      {
        id: "janna", category: "people", title: "Janna",
        sub: "Journeyman smith, Torvald's forge",
        role: "Journeyman smith & striker, Torvald's Timber Forge & River Ironworks",
        link: ["Janna"],
        tags: ["Alderford"], aliases: ["smith", "journeyman", "striker", "anvil", "forge"],
        unlock: "met_janna",
        body: function (s) {
          var out = [
            "Journeyman smith at Torvald's Timber Forge & River Ironworks, the timber-and-granite workshop over the mill-race upstream of the weir. She is tall, soot-streaked, and bare-armed, and she works the trip-hammer and waterwheel gears by furnace light, with hands as calloused as the anvil's face.",
            "She keeps the shop running while the old dwarf drinks: the racks, the orders, and the deadlines the factor sets. Sixteen barge mooring pins before dawn muster is a normal night's work, and a missed quota comes out of her pay, not his."
          ];
          if (truthy(s.discussed_janna_temper)) {
            out[1] += " Torvald's temper, she says, is like furnace slag: loud, hot, and full of sparks, with honest craft underneath once you skim it.";
          }
          if (truthy(s.discussed_janna_cadence)) {
            out.push("She grew up in the northern foothills under the Crags, sneaking into the foundry pits to watch the dwarven furnaces run white-hot. The Forge-Elders would not give a human girl an apprentice oath. Torvald, fresh from a falling-out with their council over uncertified intake engineering, took her west on one condition: swing a fourteen-pound sledge for ten hours without weeping, and he would teach her the three-beat Crag cadence. The apprentice hammer she keeps on the rack is stamped with a dwarf's mountain anvil beside a lowlander's mark.");
          }
          if (truthy(s.discussed_janna_pride)) {
            out.push("Highland elders like their stamped parchment, she says. The river does not care about paper. A mooring pin either holds against a twenty-ton grain barge in a flash surge or it snaps in half, and hers hold.");
          }
          return out;
        },
        see: ["alderford", "torvald", "rorik", "gilded_scales", "grey_river"]
      },
      {
        id: "torvald", category: "people", title: "Torvald",
        sub: "Master smith & millwright of Alderford",
        role: "Master smith & millwright, Torvald's Timber Forge & River Ironworks",
        link: ["Torvald", "Master Torvald"],
        tags: ["Alderford"], aliases: ["Master Torvald", "Crag Dwarf", "dwarf", "millwright", "forge", "smith"],
        unlock: "met_torvald",
        body: function (s) {
          var out = [
            "The Crag Dwarf behind Torvald's Timber Forge & River Ironworks, a timber-and-granite workshop built over the mill-race above the weir, with a soot-blackened signboard swinging over the door. He is barely five feet tall and wide as an anvil, with arms thick as cured ham, a grey beard braided in highland knots and singed with slag, a scarred leather patch over his left eye, and a bloodshot steel-grey right eye. Grindstones, guild-stamped helmets, blades, digging picks, and extra shields leave his racks. His offer to any Carrion customer never changes: lend a hand on the race when the wheel jams, or take your notched steel and sleep in the muck.",
            "His temper is famous on the waterfront: all roar and flying sparks. He shouts at Janna from dawn to dusk and kicks the housing of his trip-hammer when the world displeases him. When a crisis passes he grabs a clay ale jug and stomps off to the Drowned Oar to drink barley ale with the river skippers, shouting over his shoulder that the factor will have both their hides if the sixteen barge mooring pins aren't finished before dawn muster."
          ];
          if (truthy(s.knows_torvald_sluice_trick)) {
            out.push("Veteran Rorik, who swung sledge for him back in the Highland Crags, tells how the two of them framed the timber mill over the Alderford weir. Torvald swore he would drown before wading into freezing muck every time driftwood jammed the wheel, so he hid a bypass under the intake casing. Trip the catch and a counterweight backs the gear teeth off, and the river flushes the jam itself. He calls it 'preventative drainage' so the guild inspectors cannot fine him. His rule in the old shops was two taps to set the angle and one blow to draw the metal, kept to an exact three-count, or you caught hot tongs across your shins.");
          }
          if (truthy(s.discussed_smiths_past)) {
            out.push("He left the Highland Crags after the bailiffs came with the baron's writs and thirty mounted men-at-arms, taxing three marks on every hundredweight of refined steel. The highland shops could no longer buy coal, feed their hammer-men, or pay the ore carters. He took his tools down to the river, by his own account, where the water runs free and no baron owns the current. Rorik had no coin to buy a weir of his own and took the Carrion's silver shilling instead. These days the two old highlanders close out most evenings side by side at the Drowned Oar's hearth over river ale and bone dice.");
          }
          return out;
        },
        see: ["janna", "rorik", "maura", "alderford", "gilded_scales", "grey_river", "iron_carrion", "iron_bailiffs", "broken_crags"]
      },
      {
        id: "maura", category: "people", title: "Maura",
        sub: "Keeper of the Drowned Oar",
        role: "Barkeep & keeper of the Drowned Oar Taphouse",
        link: ["Maura"],
        tags: ["Alderford"], aliases: ["barkeep", "barmaid", "Drowned Oar", "taphouse keeper", "wolf-skin vest"],
        unlock: "met_maura",
        body: function (s) {
          var out = [
            "The lean woman in the bleached wolf-skin vest who keeps the Drowned Oar, the long timber taphouse built on cedar piles against the stone wharf wall. She works the wide oak counter with a linen rag, and her sharp eyes take in your road-weary gear before they take in your face. Her voice is calm and smoky, and her grate never goes cold: mutton-and-marrow pottage, river herring cured over peat smoke, spiced cider, herbal bitters, and a strong spirit she pours in small iron measures with a warning to go careful.",
            "She keeps the timber carters from brawling and pays a good song in free drinks. For anyone bound downriver she has the thirty miles of open water to the capital mapped in her head. A smooth freight highway, she calls it, provided your boots are greased and you stay out of the river skippers' way."
          ];
          if (truthy(s.discussed_maura_past)) {
            out.push("The faded brand on her throat is the Iron Bull's. She did five campaign seasons with the Iron Bull Free Company in the border marches, she says, thumbing the blurred ink with a dry smirk, until a crossbow bolt through her left knee told her to find dry floorboards. She bought the timber house from an old barge-carpenter ten years ago. The river is quieter than the shield wall, she says, and nobody shoots at you over the counter, most nights anyway.");
          }
          if (truthy(s.discussed_alderford_life)) {
            out.push("Her read on Alderford comes like a briefing. 'It's loud, damp, and smells of green cedar timber and pickled herring. If your back is broad and your knuckles aren't afraid of blisters, you eat. If you go soft, the river swallows you.' A hard town, she calls it, but an honest one if you stay clear of the counting house.");
          }
          if (truthy(s.visited_maura_cellar)) {
            out.push("The Drowned Oar sits on the old stonework of a Meridian flood drain. When three feet of imperial brick collapsed inward under the autumn damp, the wall opened into the flooded drain beneath the town, and something lives in the dark water: a wet, clicking rasp and two yellow eyes behind a collapsed gate. Maura will not bring the Gilded Scales' bailiffs into her vault. They would call the drain a taxable cartel waterway and seize half her barrels. Vane will not spare swords to kill a cellar rat. So she pays bounty silver from her own till and keeps the business hers. The crane winch over the vault hatch is there for barrels, but it has hauled a bounty-taker out of the silt too, and her verdict on the deal is that taking a bounty is one thing and throwing your life away is another.");
            out.push(truthy(s.maura_cellar_cleared)
              ? "The thing that nested down there is dead. The cellar is quiet for the first time in weeks, and word is already spreading among the carters."
              : "Whatever it is still scratches at the mortar below. Her advice to the half-hearted has not changed: come back when you mean it.");
          }
          return out;
        },
        see: ["iron_bull", "alderford", "torvald", "rorik", "rennick", "gilded_scales", "grey_river", "silt_lurkers"]
      },
      {
        id: "rennick", category: "people", title: "Rennick",
        sub: "Gilded Scales wharf bailiff",
        role: "Toll bailiff of the Gilded Scales, Alderford wharf district",
        link: ["Rennick", "Master Rennick"],
        tags: ["Alderford"], aliases: ["Master Rennick", "bailiff", "toll bailiff", "dock-guards"],
        unlock: "met_rennick",
        body: function (s) {
          var out = [
            "The Gilded Scales' toll bailiff on the Alderford wharf: a stocky, thick-necked man in a water-stained beaver-fur mantle, with a pewter cartel badge at his lapel, a brass-tipped cane, a ledger always at hand, and two dock-guards with iron-banded clubs at his back. He collects the cartel's tolls and 'shelter taxes' from the curing sheds and the weighing slips, and he does it loudly. He kicks a drying rack into the muck, reads the arrears out where every worker can hear, and promises the spillway to anyone who cannot pay tonight.",
            "The numbers always favor the Scales. Salt is weighed a shade light, stamped weigh-slips are waved like writs, debts appear in his ledger that the workers swear were paid in full at the last weigh-in, and coin goes into an embroidered velvet purse. Up close he backs down as soon as real authority shows: imperial wax on a river charter, four hundred Carrion banners across the mud, the words 'command audit.' His parting line to anyone who squares up to him never varies: this will be settled at the toll office."
          ];
          if (truthy(s.rennick_reported)) {
            out.push("Report his light scales to Factor Morzan and the answer comes back without surprise. Morzan already knew, and means to have a word with him. Rennick's power ends where the Factor's signature begins, and the office he struts through exists at Morzan's pleasure.");
          }
          if (truthy(s.visited_talia_loft)) {
            out.push("Talia sees the false debts as a tool. Squeeze the independent lofts until they sell or drown, and the cartel takes the wharf.");
          }
          return out;
        },
        see: ["gilded_scales", "morzan", "alderford", "talia", "elspeth"]
      },
      {
        id: "morzan", category: "people", title: "Factor Morzan",
        sub: "Factor of the Gilded Scales",
        role: "Guild factor of the Gilded Scales, Alderford counting house",
        link: ["Morzan", "Factor Morzan"],
        tags: ["Alderford"], aliases: ["Factor Morzan", "Morzan", "counting house", "factor"],
        unlock: "met_morzan",
        body: function (s) {
          var out = [
            "The Gilded Scales' factor in Alderford: portly and jowled, wrapped in water-stained beaver furs, with a parchment-bound account book never far from his hand and the frank, assessing stare of a man who has spent his life weighing cargo by eye. He met the Carrion column at the town palisade the day it arrived, flanked by bailiffs in pewter scale badges. He took Captain Vane's brass baggage chits, reported that the causeway was cleared and the Sinks prisoners were in the iron cage wagons as contracted, then unrolled a stamped ledger, checked every seal, and signed the company's contract vouchers. Coin only moves when the seals satisfy him.",
            "His counting house sits on the customs slip on blackened ironwood pilings. Inside, the whole wharf's business is weighed, sealed, and filed: clerks at their desks, brass balance pans clinking against lead weights, a vault counter issuing Letters of Credit good in Gold Crowns at the cartel's head house on Port Valen's Civic Heights, and an iron-posted bounty board by the door. Chief Clerk Orlov runs the front of the house. The Factor keeps to the back office and has no inclination to come out for routine business."
          ];
          if (truthy(s.rennick_reported)) {
            out.push("Report Rennick's skimming and the Factor answers: 'So you're the one. Word reached me a Carrion recruit walked into my own toll district's dispute and settled it without breaking a crate, and had the nerve to invoke my name doing it. A little bird already told me my bailiff's scales run light. Good instinct, chasing that up. I'll be having a word with Rennick myself.'");
          }
          if (truthy(s.knows_granary_problem)) {
            out.push("His audit reaches the grain too. Uncertified sacks are written off as dock spoilage, and a request for two spearmen against the granary rats would cost two silver marks in stamp fees. See [[bran|Overseer Bran]].");
          }
          if (truthy(s.visited_talia_loft)) {
            out.push("Talia's reading of him is the sharpest: if he buys or drowns her lofts, the cartel holds every deep-water berth above the gorge locks. The curing-shed shakedown and the granary red tape are one hand tightening around the river's throat. See [[talia|Talia]].");
          }
          return out;
        },
        see: ["gilded_scales", "rennick", "talia", "bran", "orlov", "alderford", "letters_of_credit"]
      },
      {
        id: "orlov", category: "people", title: "Chief Clerk Orlov",
        sub: "Chief clerk of the Alderford counting house",
        role: "Chief Clerk, Gilded Scales counting house, Alderford customs slip",
        link: ["Orlov", "Chief Clerk Orlov"],
        tags: ["Alderford"], aliases: ["Chief Clerk Orlov", "Orlov", "clerk"],
        unlock: "met_orlov",
        body: function (s) {
          var out = [
            "Chief clerk of the Gilded Scales' Alderford counting house: a narrow man in ink-stained shirtsleeves behind an oak desk with a tarnished brass nameplate, spectacles pushed up into thinning grey hair, a goose quill behind one ear. He looks harried and behind on his own paperwork, and he sizes up every stranger by the state of their boots. He greets a Carrion contractor with the news that the guild contract is current and the board is open to you like any other contractor's.",
            "Everything on the wharf that is weighed, sealed, taxed, or owed passes through his quill: the district parish register, the bounty board by the door, the vault floor with its rows of lead weights. The Factor signs behind the side door, but Orlov writes the wharf's business."
          ];
          if (truthy(s.asked_ch_commutation)) {
            out.push("Asked about the chapel's taxes, he reads from the parish register: 'Saint Althea's parish labor commutation. Quarterly assessment for twenty registered refugee spinners. Four Silver Marks assessed against their wool sales, paid in full to the guild treasury.' As long as the deacon's wool silver reaches the counting house, the Scales' bailiffs leave the chapel cloister alone." + (truthy(s.found_customs_vellum) ? " The Sinks toll register says the commutation was never owed. See [[sanctuary_charter|the chapel's sanctuary]]." : ""));
          }
          if (truthy(s.turned_in_customs_vellum)) {
            out.push("He gave the Grey Waterway Toll Register a closer look than anything else that crosses his desk. A junior clerk brought a jeweler's loupe and a black touchstone, the three-headed hawk was held to the lamplight, and the wax seal's edge was tested against the stone before Orlov rapped twice on the side door: 'Factor! The Black Sinks contract, the customs vellum's come in!' The Scales had wanted that register out of the flooded ruin for three seasons. 'Efficient work,' the Factor said, and the silver was counted onto the counter without further comment.");
          }
          if (truthy(s.discussed_orlov_past)) {
            out.push("His debt bond was signed at the Gilded Scales head house on Port Valen's Civic Heights against his father's debts before his beard came in, and it is renewed every quarter-day. The tavern story says the same books hold the debtor crews in the channel off the Iron Wharves. The counting house does not need chains for men whose names live in a book. 'Morzan is the third factor I have served in this room. The first died of marsh fever with the ledgers balanced to the copper. The second was recalled upward to the head house, which is how the Scales put a man somewhere he cannot spend money. Factors rotate. Clerks stay. Somebody has to remember which seals are real.'");
          }
          if (truthy(s.discussed_orlov_quills)) {
            out.push("Asked about the second quill scratching behind the Factor's door, he lays his pen down with exaggerated care. 'The Factor keeps his own accounts, as factors do. A chief clerk who counts what crosses the counter keeps his post to a comfortable old age. A chief clerk who wonders about the door wonders his way onto a river barge.' Unprompted, he adds that the head house sends auditors down from Civic Heights every quarter, and every quarter the books agree to the copper. He says it flat and exact, like a man reading a tide table.");
          }
          return out;
        },
        see: ["morzan", "gilded_scales", "saint_althea", "sanctuary_charter", "corbel", "debtor_crews", "alderford"]
      },
      {
        id: "corbel", category: "people", title: "Deacon Corbel",
        sub: "Deacon of Saint Althea the Mender",
        role: "Deacon, Chapel of Saint Althea the Mender, Alderford upper ridge",
        link: ["Corbel", "Deacon Corbel"],
        tags: ["Alderford"], aliases: ["Deacon Corbel", "Corbel", "deacon", "priest", "cleric"],
        unlock: "met_corbel",
        body: function (s) {
          var out = [
            "The elderly cleric of the Chapel of Saint Althea the Mender, on the granite ridge above the weir. He wears an undyed wool habit with a carved limestone spindle-cross at his chest, and has thin grey hair, spectacles tied behind his ears with hemp cord, and calm grey eyes. He keeps the parish ledger at the chancel desk, greets the road-worn in a gentle, measured voice, and runs his sanctuary on one rule, kept by custom and not by any sign: leave your quarrels on the gravel outside.",
            "He is a mender in both of his saint's senses. Lay a wound before him and he sets his hand against it and channels Althea's grace until the golden light sinks back into the stone and he steps back, a little winded. It costs three copper bits, or nothing when the parish owes you a courtesy. The poor-chest holds no silver, since what little the chapel takes in goes to the town hearth-tax. What he keeps in plenty is the stone stoup by the door: cold spring water, fingers resting on your crown, and a blessing for the road. May the stone hold beneath your tread."
          ];
          if (truthy(s.discussed_chapel_deity)) {
            out.push("He teaches his flock to pray to Saint Althea, while the bishops in Port Valen's grand cathedral sing of her father, the Sun-Father. See [[saint_althea|Saint Althea]]. In a marches town where no one can buy a master surgeon, he says her grace is all that stands between a gangrenous wound and a shallow grave.");
          }
          if (truthy(s.discussed_chapel_sanctuary)) {
            out.push("Displaced folk who shelter here register for parish labor: spinning wool, mending sacks, keeping up the weir road. The Scales hold the river trade, the sawmills, and the toll posts, and to them refugees from the border estates look like cheap labor for the brine sumps and barge slips. Corbel pays the commutation to keep bailiffs like Rennick from dragging indebted families into the debt-dredges. An uneasy compromise, he calls it, but it keeps the peace. See [[sanctuary_charter|the chapel's sanctuary]].");
          }
          if (truthy(s.corbel_charter_argument)) {
            out.push("A clause from a flooded ruin then came up the ridge steps: consecrated ground owes no tolls, so the commutation was never owed. Corbel tested it slowly, with his eyes closed, and made the only practical choice an old deacon with sixty mouths to feed can make. The chapel keeps paying. The clause is copied fair into the parish charter roll and kept where the counting house cannot hear of it, a wall against the day the Scales reach for more than the commutation.");
          }
          return out;
        },
        see: ["saint_althea", "sanctuary_charter", "orlov", "elspeth", "alderford"]
      },
      {
        id: "bran", category: "people", title: "Overseer Bran",
        sub: "Keeper of the Upper Weir Granary",
        role: "Granary overseer, the Upper Weir Granary",
        link: ["Bran", "Overseer Bran"],
        tags: ["Alderford"], aliases: ["Overseer Bran", "Bran", "granary", "keeper", "grain"],
        unlock: "met_bran",
        body: function (s) {
          var out = [
            "Overseer of the Upper Weir Granary, the grain warehouse above the weir where the town's winter rye waits on the Scales' freight schedule. He is a tired, big-boned man in a leather apron dusted with chalk flour, with a chalk-board always within reach and chalk seals on every sack on the racks. He gives newcomers a cautious look that lingers on their gear. His spine has ached too long to carry thirty pounds without cost, though his hands remember heavier loads."
          ];
          if (truthy(s.discussed_granary_rations)) {
            out.push("Nothing in the loft is for sale. Every bin is river freight bound for Port Valen, weighed at the loading dock. If he cracks a seal to sell five pounds of meal to a soldier, the difference comes out of his month's wage at Chief Clerk Orlov's quill. He tells a hungry squad so without anger: for hot bread, go see Maura at the Drowned Oar or try the company kettles.");
          }
          if (truthy(s.knows_granary_problem)) {
            out.push("His trouble is the undercroft. Black mire-rats, driven up out of the riverbank mud by the autumn high water and fat as badgers on swamp carrion, are tearing through the winter flour sacks below the bins. If they chew through to the lower rye, the whole loft spoils before the first freeze. He went to the Gilded Scales for help and was laughed at: the garrison guards toll-sledges and the customs wharf, and a two-silver filing fee buys the privilege of having a request read. So he posted a notice and offered fifteen copper from his own pouch to anyone with the stomach for foul work in the dark.");
          }
          if (truthy(s.discussed_bran_past)) {
            out.push("For twenty-two years he was master of the Patient Heron, a grain barge on the Grey. He loaded at the weir, ran the gorge, and tied up at the Port Valen quays with the hold dry and the count true. Two autumns ago a swell in the gorge shifted a wheat cargo and spoiled the hold from the keel boards up. The Scales' weigh-masters condemned the share, and every seal they stamped was true. Spoiled grain is bonded grain, and bonded grain that fails takes the boat with it. He signed his last paper as a boat owner and his first as a hired floor-keeper in the same season. He keeps his chalk honest now because it is the one thing on the loft floor that is still entirely his.");
          }
          if (truthy(s.quest_chapel_flour_offered)) {
            out.push("Sacks with torn weave or rodent sign count as uncertified. Factor Morzan marks them dock spoilage, and by morning the clerks sweep them into the silt chute. For seasons Bran has carried those condemned sweepings up the cliff stairs to the weavers at the Old Chapel, ahead of the morning count. Their families are boiling nettle broth and need sound rye more than the silt chute does. The Scales would ask questions if they caught him, and this year his spine has quit carrying the argument. So the favor he offers you is a thirty-pound sack of sound rye and a warning to move quietly.");
          }
          return out;
        },
        see: ["morzan", "orlov", "corbel", "alderford"]
      },

      /* ------------------------------------------------------------ PEOPLE: KARR */

      {
        id: "baron_karr", category: "people", title: "Baron Aldous Karr",
        link: ["Baron Aldous Karr", "Baron Karr", "Aldous Karr"],
        sub: "Feudal lord of Karr's Keep",
        tags: ["Karr", "Highlands"], aliases: ["Karr", "the Baron", "Baron of Stenmark"],
        unlock: "codex_baron_karr",
        body: function (s) {
          var out = [
            "Feudal lord of Karr's Keep in the Highland Crags. His bailiffs collect a grain tax from his highland tenants by force, and they burned Ashbrook during one such collection. Notices bearing his seal offer standing rewards for runaway bond-servants and deserters from his estates."
          ];
          if (truthy(s.codex_stenmark)) {
            out.push("His title is Baron of [[stenmark|Stenmark]], the valleys and passes under the southern Crags. Like most titles in the Marches, it rests on an imperial patent that nobody has renewed since the legions left. He keeps it with the Iron Bailiffs, who hold the toll gates on both roads out, and he taxes what crosses them: the tenants' grain in autumn and refined steel by the hundredweight all year.");
          }
          return out;
        },
        see: ["stenmark", "karrs_keep", "iron_bailiffs", "ashbrook", "broken_crags", "house_gault", "skell"]
      },
      {
        id: "skell", category: "people", title: "Warlord Skell",
        link: ["Warlord Skell", "Skell"],
        sub: "Master of the Great Sedge",
        role: "Warlord of the Great Sedge, holder of Gryke",
        tags: ["Sedge"], aliases: ["Skell", "warlord", "Gryke", "Sinking Keep", "fen lord"],
        unlock: "codex_warlord_skell",
        body: function (s) {
          var out = [
            "The warlord who holds the [[great_sedge|Great Sedge]] from Gryke, an old legion fort in the fen that is slowly sinking into it. The legion there dissolved where it stood, as the others did, and its garrison stayed on. Skell is said to have been a sergeant in it.",
            "Skell takes tribute in peat, eels and spearmen, since the fen has no coin to give. Outsiders cross the Sedge by brushwood tracks that only Skell's people can find, and the Black Sinks causeway runs along the edge of it."
          ];
          if (truthy(s.silt_gate_full_intel) || truthy(s.has_silt_gate_payout_slip)) {
            out.push("The peat-spiritus that the Black Oath runs in through the Silt-Gates is a fen drink, made in the Sedge's towns and paid out to Skell in casks.");
          }
          return out;
        },
        see: ["great_sedge", "black_sinks", "silt_gates", "black_oath", "grey_marches", "meridian_empire"]
      },

      /* ---------------------------------------------------------------- FACTIONS */

      {
        id: "iron_carrion", category: "factions", title: "The Iron Carrion",
        link: ["Iron Carrion", "Carrion Company"],
        sub: "Free company hierarchy & command",
        tags: ["Iron Carrion"], aliases: ["Carrion", "company", "chain of command", "the 400"],
        body: [
          "<i>\"Crows feast where lords bleed.\"</i>",
          "Founded thirty years ago in the ashes of the Broken Crown War, the Iron Carrion is a four-hundred-man free company of veteran sellswords, runaway bond-servants, and disgraced soldiers. They answer to no crown and hold no land. Their loyalty lasts as long as a patron's coin purse holds weight.",
          "Port Valen is the company's home base. The Carrion rents a fortified compound near the Iron Wharves and returns there between contracts to collect pay, repair its equipment, recruit replacements, and negotiate its next commission. The company owns none of it and can be driven elsewhere whenever its contracts or enemies demand."
        ],
        see: ["vane", "carrion_founding", "varren", "kestrel", "ysolde", "odessa", "lyra", "rorik", "port_valen", "carrion_compound"]
      },
      {
        id: "gilded_scales", category: "factions", title: "The Gilded Scales",
        link: ["Gilded Scales"],
        sub: "Merchant cartel and paymasters",
        tags: ["Port Valen", "Trade"], aliases: ["Scales", "First Factor", "Council of Factors", "cartel", "factors", "free city", "Free City", "plutocracy"],
        unlock: "codex_gilded_scales",
        meter: { stat: "gilded_scales_rep", label: "Standing with the Gilded Scales" },
        body: [
          "A cartel of river merchants and guild-masters based in Port Valen, with its head house on Civic Heights beside the Council Hall and its merchant houses' estates in the Patrician Quarter. They hold the timber trade, the grain barges, and the river toll-gates across the province, and they enforce their contracts with hired iron. A free company is a line in their ledgers like any other expense: hired when iron is needed, paid by the season, and dismissed the moment the road is open.",
          "The cartel is led by a <b>First Factor</b>, who speaks for the Scales on war, treaty, and city policy. The First Factor answers to the Council of Factors, the ruling council of Port Valen, made up of the senior merchant houses. Below them, appointed officers run records, taxes, courts, and the Port Watch. Port Valen holds the old imperial title of a free city, and no crown rules it."
        ],
        see: ["port_valen", "port_watch", "letters_of_credit", "alderford", "council", "upper_wharves", "debtor_crews"]
      },
      {
        id: "port_watch", category: "factions", title: "The Port Valen Watch",
        link: ["Port Valen Watch", "Port Watch"],
        sub: "The city guard",
        tags: ["Port Valen", "Law"], aliases: ["Port Watch", "Watch", "city guard", "watchmen"],
        unlock: "codex_port_watch",
        meter: { stat: "port_watch_rep", label: "Standing with the Port Watch" },
        body: function (s) {
          var out = [
            "The city guard, charged with keeping the peace, patrolling the harbor quays, and manning the stone water-gates. They wear boiled leather jerkins stamped with the city's three-masted seal, carry bills, shortbows, and iron-banded cudgels, and walk the beat between foreign crews, dockside brawlers, and Dredge-End cutpurses.",
            "They are sworn to the City Council and the public order, but the Watch is under-strength and underpaid. It is pulled between the Gilded Scales, who expect immediate protection for merchant cargo, and a crowded port full of refugees and armed sellswords."
          ];
          if (truthy(s.pv_tavern_rumor_2)) {
            out.push("Four hundred mercenaries now reinforce the Watch's patrol rosters from the Iron Wharves to the lower landing-stairs, under terms the Watch captain read out at the pier: no private collections, no unsanctioned arrests, and no settling old debts under city colors. The porters recite them like a litany neither of them quite believes will hold.");
          }
          return out;
        },
        see: ["gilded_scales", "port_valen", "cargo_quay", "civic_heights", "silt_gates", "port_watch_hq"]
      },
      {
        id: "black_oath", category: "factions", title: "The Black Oath",
        link: ["Black Oath"],
        sub: "Dredge-End's sworn brotherhood",
        tags: ["Port Valen", "Underworld"], aliases: ["Oath", "Dredge-End", "brotherhood", "oath-breakers", "smugglers"],
        unlock: "codex_black_oath",
        meter: { stat: "black_oath_rep", label: "Standing with the Black Oath" },
        body: function (s) {
          var out = [
            "The sworn brotherhood of the flooded quarter. Down here they say it began as a burial club: puntmen and dredgers paying into a common purse so their drowned got a grave and their families ate. The oaths are sworn at the shrine, and the roll of sworn names is kept there still.",
            "Swear to it and it feeds you when the water takes your boat. Break it and it finds you, and there is no buying your way clear, only the work you said you would do. It holds what the Watch does not reach: the punt berths, the eel-traps, the night barges, and the narrow alleys. The city above leaves it alone, and in exchange the waterfront does not boil over."
          ];
          if (truthy(s.pv_tavern_rumor_1)) {
            out.push("Their men work the canal footbridges with bare knives and no Watch badge, reading the faces that come past. The advice along the quays is simple: do not flash silver past dark in that quarter, unless you mean to donate it.");
          }
          if (truthy(s.silt_gate_full_intel) || truthy(s.has_silt_gate_payout_slip)) {
            out.push("Their smuggling lines penetrate the city's seawall through the storm flap-valves at the Silt-Gates, moving un-stamped highland shear-steel and illicit peat-spiritus right under the quays by paying off Harbor Watch sergeants six silver marks a week.");
          }
          return out;
        },
        see: ["port_valen", "dredge_end", "gilded_scales", "port_watch", "alley_shrine"]
      },
      {
        id: "iron_bailiffs", category: "factions", title: "The Iron Bailiffs",
        link: ["Iron Bailiffs"],
        sub: "Baron Karr's tax collectors",
        tags: ["Karr", "Highlands"], aliases: ["bailiffs", "tax collectors"],
        unlock: "codex_iron_bailiffs",
        body: function (s) {
          var out = [
            "Baron Aldous Karr's armed tax collectors and highland enforcers. They wear boiled leather and iron kettle-helms, hold the mountain toll passes, seize tenant harvests, and enforce Karr's edicts with fire and the noose. They also seize contraband along the border."
          ];
          if (truthy(s.codex_stenmark)) {
            out.push("Two tolls close Stenmark, and the bailiffs man both: Black Pike Gate on the south road and Iron Gap on the west. Everything the barony sells goes out through one of them, and everything it cannot grow comes in through the other.");
          }
          return out;
        },
        see: ["baron_karr", "stenmark", "ashbrook", "torvald"]
      },
      {
        id: "house_gault", category: "factions", title: "House Gault",
        link: ["House Gault", "Gault"],
        sub: "Lords of the Western Vale",
        tags: ["Western Vale"], aliases: ["Gault", "Dunmow", "lord of Dunmow", "riders", "cavalry", "Western Vale"],
        unlock: "codex_house_gault",
        body: [
          "The noble house that holds the [[western_vale|Western Vale]] from its walled seat at Dunmow. When the legions left, Gault kept its granaries shut and its gates manned, and it has held Dunmow ever since. It fields mounted riders and archers, who are at home on the open downs and far less so in forest or bog. Coombe Gap, the road that takes the vale's wagons east toward the river, is Gault's.",
          "Gault keeps no harbor and no fleet, so its grain and cloth reach the sea on Scales barges or not at all."
        ],
        see: ["western_vale", "stenmark", "grey_marches", "meridian_empire"]
      },
      {
        id: "squatters", category: "factions", title: "The Causeway Squatters",
        sub: "The garrison of the Black Sinks gatehouse",
        tags: ["Grey River"], aliases: ["squatters", "deserters", "Black Sinks"],
        unlock: "codex_marsh_squatters",
        body: [
          "Displaced highland tenants, escaped bond-servants, and army deserters who fortified the Black Sinks toll gatehouse. Starvation and debt had driven them into the fen. They held the causeway with scythes, sickles, and fishing spears until the Carrion overran them."
        ],
        see: ["black_sinks"]
      },
      {
        id: "iron_bull", category: "factions", title: "The Iron Bull Free Company",
        link: ["Iron Bull"],
        sub: "A heavy-infantry company",
        tags: ["Mercenaries"], aliases: ["Iron Bull", "Maura", "pike squares"],
        unlock: "codex_iron_bull",
        body: [
          "A heavy-infantry mercenary company known across the western provinces for its pike squares, wedge charges, and strict adherence to its contracts. It held the southern river crossings in the chaos after the Broken Crown War. The campaigns that followed cut its ranks down, and the survivors, veterans like Maura, scattered into frontier settlements across the Marches."
        ],
        see: ["meridian_empire", "broken_crown_war", "maura"]
      },

      /* ------------------------------------------------------------------ PLACES */

      {
        id: "grey_marches", category: "places", title: "The Grey Marches",
        link: ["Grey Marches"],
        sub: "The frontier borderland",
        tags: ["Regional", "Trade"], aliases: ["Marches", "frontier", "borderland", "map", "regions", "economy", "trade", "goods", "powers"],
        body: function (s) {
          var out = [
            "A misty frontier borderland between the coastal trade routes and the northern highlands. Three kinds of country meet around one river: steep highland valleys in the north, chalk downland and farm country to the west, and peat bog and reed flats to the east. The Grey River runs down between them to Port Valen.",
            "<b>Trade.</b> No part of the Marches feeds itself. The highlands have iron and coal and too little grain. The farm country has grain, hemp and horses and no iron. The bogs have fuel, eels and reeds, and no salt or timber. Salt comes in from the coast. Port Valen takes what the rest can spare and pays for it in coin."
          ];
          var held = [];
          if (truthy(s.codex_stenmark)) {
            held.push("In the north, Baron Karr holds the high valleys and passes of [[stenmark|Stenmark]], and with them the iron.");
          }
          if (truthy(s.codex_house_gault)) {
            held.push("West of the river, [[house_gault|House Gault]] holds the [[western_vale|Western Vale]] from Dunmow, and with it the grain.");
          }
          if (truthy(s.codex_warlord_skell)) {
            held.push("East of the causeway, [[skell|Warlord Skell]] holds the [[great_sedge|Great Sedge]] from the sinking fort at Gryke, and with it the fuel and the paths through the bog.");
          }
          if (held.length) { out.push(held.join(" ")); }
          if (held.length === 3) {
            out.push("Each of the three holds something the other two need: the iron, the grain, and the fuel. Each also needs something the others hold, so none of them can close a road without going short.");
          }
          return out;
        },
        see: ["port_valen", "alderford", "black_sinks", "broken_crags", "stenmark", "karrs_keep", "ashbrook", "house_gault", "western_vale", "skell", "great_sedge", "grey_river"]
      },
      {
        id: "port_valen", category: "places", title: "Port Valen",
        link: ["Port Valen"],
        sub: "The port capital downriver",
        tags: ["Port Valen"], aliases: ["Port Valen", "Dredge-End", "Patrician Quarter", "free city", "Free City", "Council", "capital"],
        unlock: "codex_port_valen",
        body: [
          "The sprawling port capital downriver, a free city in the old imperial sense, answerable to no crown. Its Council rules the surrounding towns and villages of the river country, Alderford among them, through tolls, tax contracts, and factors instead of garrisons. The merchant palaces of the Gilded Scales stand in the Patrician Quarter. Dredge-End is a maze of flooded canals and rotting tenements, and Black Oath territory.",
          "<b>Trade.</b> Port Valen builds ships and salts fish, and makes little else that it needs. Coal, timber and iron come down to it from the highlands, bread grain, canvas and rope from the farm country, and peat from the bogs. It pays in coin, in credit and in foreign freight. Everything the Marches sells to the wider world leaves through its harbor, so the city can afford to wait on any one road and cannot afford to lose them all."
        ],
        see: ["gilded_scales", "port_watch", "black_oath", "alderford", "iron_carrion", "harbor_quayside", "dredge_end", "middle_ward", "upper_wharves", "civic_heights", "council", "grey_marches"]
      },
      {
        id: "alderford", category: "places", title: "Alderford",
        link: ["Alderford"],
        sub: "The frontier's river weir town & barge port",
        tags: ["Alderford", "Grey River", "Trade"], aliases: ["Alderford", "weir", "waystation", "salt lofts", "brine", "river town", "logging slips"],
        unlock: "codex_alderford",
        meter: { stat: "alderford_rep", label: "Standing in Alderford" },
        body: [
          "A river town built around an old imperial limestone weir, where the highland road down from the Crags reaches the head of the Grey and the river drops away toward the gorge. Sawmills crowd the bank above the falls. Below them stand warehouses, drying sheds, salt lofts, and muddy wharves where the barges tie up to load for the downriver run. The brine trade is the town's spine: catches boiled in the riverfront pans, cured in the lofts above them, and packed downriver by watermen who know every shallow of the gorge.",
          "The stone is older than the town. The weir is legion work, imperial limestone with locks cut through it. Beneath the southern foundation is a flooded stone chamber where the release gear for a submerged anti-galley boom still sits, its plans carried off by the garrison that withdrew. Everything above the waterline is newer. Thirty winters ago Alderford was three timber sheds and a ferry rope. Then the loft piles went into the bank, the pans were fired, and the salt-steam that made the town rich hardened the lungs of the people who worked it.",
          "Port Valen's Council holds Alderford as its river town and has never seen fit to garrison it. The Gilded Scales collect their share through a resident factor and a stamped ledger, with bailiffs on the toll road who wear pewter scale badges and weigh goods against lead weights that do not always weigh what they are stamped. What protects the town is paper: free-wharf exemptions sealed under the old provincial charter, sanctuary behind the chapel lintel, and a river charter that still names ten lashes for extorting refugees.",
          "<b>Trade.</b> Alderford grows nothing. It makes salt, salted river fish, sawn timber and barge planks, and sends them downriver on Scales barges. Its winter rye comes in on carts from the western farm country, the iron for its forges comes down the highland road, and the peat under its brine pans comes across the Black Sinks from the eastern bogs. The Scales weigh and toll what comes in and what goes out."
        ],
        see: ["port_valen", "grey_river", "sanctuary_charter", "gilded_scales", "imperial_booms", "meridian_empire", "saint_althea", "iron_carrion", "grey_marches"]
      },
      {
        id: "grey_river", category: "places", title: "The Grey River",
        link: ["Grey River"],
        sub: "Alderford to Port Valen by water",
        tags: ["Grey River"], aliases: ["Grey River", "river gorge", "downriver", "waterway", "downriver run"],
        unlock: "codex_river_gorge",
        body: [
          "A wide, navigable river running thirty miles between limestone bluffs and old imperial signal towers from Alderford down to Port Valen. It begins at the Alderford weir, where the hill streams gather into one channel. Above the weir there is only the highland road, with no barge water and no river town. The steady current makes a smooth downstream run for heavy grain barges and timber scows. The river damp, freezing autumn spray, and submerged imperial works like the anti-galley booms call for waterproofed gear and experienced watermen.",
          "<b>Trade.</b> Downstream, the current carries a loaded barge from Alderford to Port Valen in a day. Upstream, the crew has to pole against it for days. So grain, salt, timber and coal ride down, and only light goods come back up: coin, cloth and finished wares. Barge owners fill the empty run home with whatever will pay a fee, and the Scales toll the river at both ends."
        ],
        see: ["alderford", "port_valen", "imperial_booms", "grey_marches"]
      },
      {
        id: "black_sinks", category: "places", title: "The Black Sinks Causeway",
        link: ["Black Sinks", "imperial dike-road"],
        sub: "An imperial road gone to rot",
        tags: ["Grey River", "Empire"], aliases: ["Black Sinks", "causeway", "gatehouse", "toll road", "dike-road", "dike road", "imperial causeway"],
        unlock: "codex_black_sinks",
        body: function (s) {
          var out = [
            "An old imperial road built up on a dike across the Sinks, laid in fitted grey stone and wide enough for military freight wagons, then left to rot for decades. Sinking peat and seasonal floods have collapsed its outer edges, so only the raised center still carries wheels, single file, with waist-deep bog on both sides. Where the road widens onto a raised limestone platform, a squat stone gatehouse blocks the way. It is the last chokepoint on the toll road between the highland Crags and the Alderford weir."
          ];
          if (!truthy(s.codex_marsh_squatters)) {
            out.push("This autumn the gatehouse is held by deserters and displaced tenants out of the high valleys, with scythes, sickles, and fishing spears, and nowhere else to run. The Gilded Scales bought the road back and handed the contract to the Carrion.");
          } else {
            out.push("The gatehouse stands open. What held it is scattered into the reeds, dead on the flagstones, or riding downriver in the iron cage wagons as contracted, and traffic crosses the causeway again under the Carrion's raven banners.");
          }
          out.push("<b>Trade.</b> Nothing is made on the causeway. It is a toll station on the only dry road between the highlands and the river, so highland steel, coal and timber pass over it going south, and peat from the eastern bogs comes in over it. When the gatehouse is held, both streams stop at once, which is why the Scales paid to have it cleared.");
          return out;
        },
        see: ["squatters", "gilded_scales", "meridian_empire", "iron_carrion", "grey_river", "alderford", "grey_marches", "great_sedge", "stenmark"]
      },
      {
        id: "broken_crags", category: "places", title: "The Highland Crags",
        link: ["Highland Crags", "High Crags"],
        sub: "A rugged northern highland region",
        tags: ["Karr", "Highlands"], aliases: ["Crags", "Broken Crags"],
        unlock: "codex_broken_crags",
        body: function (s) {
          var out = [
            "A northern highland region of steep granite ravines and scrub hills, hard on wagon axles. Baron Karr's bailiffs control it. Its narrow choke points and heavy morning fog make it good ground for an ambush against the company's advance."
          ];
          if (truthy(s.codex_stenmark)) {
            out.push("The Crags are the range. The southern valleys and passes under them are Karr's barony of [[stenmark|Stenmark]], and the furnaces lie deeper in.");
          }
          return out;
        },
        see: ["baron_karr", "stenmark", "iron_bailiffs", "torvald"]
      },
      {
        id: "stenmark", category: "places", title: "Stenmark",
        link: ["Stenmark"],
        sub: "Baron Karr's barony in the Crags",
        tags: ["Karr", "Highlands", "Trade"], aliases: ["barony", "Barony of Stenmark", "highland estates", "Karr's lands", "Brandreth", "Black Pike Gate", "Iron Gap", "iron", "steel", "coal", "Forge-Elders"],
        unlock: "codex_stenmark",
        body: function (s) {
          var out = [
            "The barony Baron Karr holds in the southern Crags: the valleys under the mountain face, the passes above them, and the forges in the deep valleys beyond. [[karrs_keep|Karr's Keep]] is the seat. Brandreth is the one market town, where the grain tax is measured out. Two roads leave it. The south road runs through Black Pike Gate and down to the Black Sinks. The west road climbs to Iron Gap and drops into the farm country beyond.",
            "<b>Trade.</b> The Crags make pig iron, shear-steel, stone-coal, hard timber and upland wool. The valleys cannot feed the men who work them. Oats and barley ripen in a short summer, rye fails in a wet one, and the barony buys grain every year that it cannot grow. It buys salt, cloth and rope as well. Iron and coal pay for all of it, and both must go south through the Black Sinks to reach a buyer. The Baron holds the north end of that road and the Gilded Scales hold the south end, so neither can move iron without the other. The Crag Forge-Elders' Council certifies the iron and keeps the deep furnaces going, and the bailiffs hold the roads the iron travels on."
          ];
          if (truthy(s.discussed_smiths_past)) {
            out.push("The steel tax has emptied some of the highland shops. [[torvald|Torvald]] left over it: by his own account, the shops could no longer buy coal, feed their hammer-men or pay the ore carters.");
          }
          return out;
        },
        see: ["baron_karr", "karrs_keep", "iron_bailiffs", "broken_crags", "ashbrook", "torvald", "house_gault", "great_sedge", "black_sinks", "grey_marches"]
      },
      {
        id: "karrs_keep", category: "places", title: "Karr's Keep",
        link: ["Karr's Keep"],
        sub: "Seat of Baron Karr's rule",
        tags: ["Karr", "Highlands"], aliases: ["Keep", "fortress"],
        unlock: "codex_karrs_keep",
        body: function (s) {
          var out = [
            "A granite fortress perched in the Crags, the seat of Baron Aldous Karr's rule."
          ];
          if (truthy(s.codex_stenmark)) {
            out.push("It stands above Brandreth, in the barony of [[stenmark|Stenmark]].");
          }
          return out;
        },
        see: ["baron_karr", "stenmark", "broken_crags"]
      },
      {
        id: "ashbrook", category: "places", title: "Ashbrook",
        link: ["Ashbrook"],
        sub: "A destroyed tenant-farming village",
        tags: ["Karr", "Highlands"], aliases: ["burning of Ashbrook"],
        unlock: "codex_ashbrook",
        body: [
          "A poor tenant-farming village in the high valley foothills. Baron Karr's bailiffs burned it while collecting the grain tax by force, communal salting cellars and all."
        ],
        see: ["baron_karr", "iron_bailiffs", "stenmark", "elspeth"]
      },

      /* --------------------------------------------- PLACES: THE VALE AND THE SEDGE */

      {
        id: "western_vale", category: "places", title: "The Western Vale",
        link: ["Western Vale"],
        sub: "The farm country west of the river",
        tags: ["Western Vale", "Trade"], aliases: ["Vale", "the vale", "Dunmow", "Fallowfield", "Coombe Gap", "downs", "chalk downs", "farm country", "grain", "wheat", "hemp", "canvas", "horses"],
        unlock: "codex_western_vale",
        body: function (s) {
          var karr = truthy(s.codex_baron_karr) ? "Baron Karr's" : "the highland lord's";
          var lord = truthy(s.codex_house_gault) ? "[[house_gault|House Gault]]" : "A noble house";
          return [
            "Long chalk downland and river-fed farm country west of the Grey, with old forest along its southern edge. " + lord + " rules it from Dunmow. Fallowfield and the smaller market towns sit in the wheat land, and the villages of the downs run sheep. Two roads leave it. Coombe Gap takes carts east toward the river. Iron Gap climbs north into the Crags and " + karr + " tolls.",
            "<b>Trade.</b> The vale is where the Marches' bread comes from. It grows the wheat and rye that feed Port Valen's ovens, and it sends out flax and hemp for canvas and rope, bacon fattened on acorns in the forest, pitch and tar from the pines, and horses bred on the downs. It has no iron and no coal. Plow blades, horseshoes and spearheads come down through Iron Gap, and the price is set at the gate. Salt comes in from the coast. The downs' own wool is short and coarse and mostly stays in the vale's cloth halls, and the fine wool that Port Valen buys comes from the Crags. Everything the vale sells to the coast goes down the river on Scales barges, at the Scales' freight rate."
          ];
        },
        see: ["house_gault", "stenmark", "grey_river", "grey_marches", "port_valen"]
      },
      {
        id: "great_sedge", category: "places", title: "The Great Sedge",
        link: ["Great Sedge"],
        sub: "The bog country east of the causeway",
        tags: ["Sedge", "Trade"], aliases: ["Sedge", "Gryke", "Sedgefleet", "Wulverston", "bog", "fen", "peat", "eels", "reeds", "bog-iron", "peat-spiritus"],
        unlock: "codex_great_sedge",
        body: function (s) {
          var warlord = truthy(s.codex_warlord_skell) ? "[[skell|Warlord Skell]]" : "A warlord";
          var out = [
            "A wide country of peat bog, reed beds and black meres, cut by slow channels and dotted with islands of firm ground. Waist-deep mud lies under most of what looks solid, and a wagon sinks to the axle within a dozen paces. " + warlord + " holds it from Gryke, an old fort that is sinking into the fen. The towns are small and built on piles. Sedgefleet is where the eel boats and peat barges load, and Wulverston, in the south, has the bog-iron works. The only dry ways through are woven brushwood tracks laid across the mud, and only the fen people know where they run.",
            "<b>Trade.</b> The Sedge's staple is peat, cut, dried and stacked by the cartload. Port Valen's taprooms and tenements burn it beside their coal, and so do the salt-boilers on the coast. The fen also sends out smoked eels, wildfowl, reed thatch, and soft bog-iron for nails and cheap tools. Nothing grows well here and there is no timber, so grain, salt and sawn wood all come in. Without salt the eels rot in a week, so the boats that carry peat out bring salt back."
          ];
          if (truthy(s.silt_gate_full_intel) || truthy(s.has_silt_gate_payout_slip)) {
            out.push("The fen towns also make a rough spirit called peat-spiritus. What reaches Port Valen comes in un-stamped with the Black Oath's smugglers, through the Silt-Gates.");
          }
          return out;
        },
        see: ["skell", "black_sinks", "silt_gates", "grey_marches", "port_valen"]
      },

      /* --------------------------------------------------------- HISTORY & LAW */

      {
        id: "meridian_empire", category: "history", title: "The Meridian Empire",
        link: ["Meridian Empire"],
        sub: "The Fall of an Empire",
        tags: ["Empire"], aliases: ["Meridian", "empire", "imperial"],
        unlock: "codex_meridian_empire",
        body: [
          "Long before its collapse, the Meridian Empire was already failing, worn down by centuries of bureaucratic rot, warring client kingdoms, regional rebellions, and border wars. The huge stone causeways, fortified weirs, and river booms across the Marches are what it left behind. Its legions withdrew thirty years ago, and its center went silent without ever formally giving up its frontier holdings.",
          "Today the continent is a patchwork of ruined successor territories, and petty warlords, each carving a small kingdom out of the wreckage."
        ],
        see: ["broken_crown_war", "imperial_booms", "sanctuary_charter", "baron_karr", "house_gault", "skell", "carrion_founding"]
      },
      {
        id: "broken_crown_war", category: "history", title: "The Broken Crown War",
        link: ["Broken Crown War"],
        sub: "The war that finished the Empire",
        tags: ["Empire"], aliases: ["war of succession", "Broken Crown"],
        unlock: "codex_meridian_empire",
        body: [
          "A war of succession fought across the western provinces thirty years ago. It drained the imperial treasury, broke the last noble dynasties, and split the realm for good. It did not start the Empire's fall. It was the last blow."
        ],
        see: ["meridian_empire", "carrion_founding", "iron_bull"]
      },
      {
        id: "carrion_founding", category: "history", title: "The Founding of the Iron Carrion",
        sub: "How the company was raised from a broken empire",
        tags: ["Iron Carrion", "Empire"], aliases: ["founding", "Carrion founding", "free company origins"],
        unlock: "codex_meridian_empire",
        body: [
          "The Iron Carrion was raised thirty years ago, while the Meridian Empire's death was still becoming a fact rather than a rumor. The legions that had garrisoned the Grey Marches dissolved where they stood instead of marching home: pay in arrears, orders that never came, officers with nothing left to give them. The provinces they abandoned fell to feuding client lords and frontier barons, and onto the roads went the men the war had finished with: deserters, runaway bond-servants, and soldiers whose colors no longer existed.",
          "The company that took them in was the work of [[vane|Captain Vane]]. He offered terms: a written contract, honest weight of coin, and a discipline harsher than any feudal levy enforced. Where he came from is a tale the veterans tell in different ways. The motto painted under the raven standard is a soldier's joke about the trade: <i>\"Crows feast where lords bleed.\"</i>",
          "Thirty years on, that shape has not changed. The Carrion raises, pays, and replaces its men by written contract, keeps a rented compound instead of a fief, and negotiates the next commission while the last one is still being paid out. Its veterans measure the company by the only two things it has ever promised: coin weighed honestly, and a contract kept to the letter."
        ],
        see: ["vane", "iron_carrion", "meridian_empire", "broken_crown_war"]
      },
      {
        id: "imperial_booms", category: "history", title: "The Anti-Galley Booms",
        link: ["anti-galley booms"],
        sub: "Iron chains in the riverbed",
        tags: ["Empire", "Grey River"], aliases: ["booms", "anti-galley", "winches", "hydraulics", "imperial hydraulics"],
        unlock: "codex_imperial_booms",
        body: [
          "Centuries ago, legion engineers stretched heavy iron chains across the Grey River's narrow points to rip the keels out of invading warships. Counterweight winches in dry stone vaults beneath the weir foundations raise and drop them. When the imperial garrisons withdrew thirty years ago they took the plans with them, and the chains stayed in the riverbed. Small local skiffs pass over them unnoticed, but they can catch a heavy barge that sits five feet deep in the water."
        ],
        see: ["grey_river", "meridian_empire"]
      },
      {
        id: "letters_of_credit", category: "history", title: "Letters of Credit",
        link: ["Letters of Credit", "Letter of Credit"],
        sub: "How the Scales move money",
        tags: ["Trade", "Law"], aliases: ["credit", "banking", "counting house", "vault", "tariff", "tolls"],
        unlock: "codex_letters_of_credit",
        body: [
          "The Gilded Scales' banking system, built so river trade can move without iron-bound coin chests on roads full of bandits. Merchants and mercenary companies leave silver at a regional counting house and receive a wax-sealed parchment draft. Any allied vault in the province pays it out in full, minus a fee."
        ],
        see: ["gilded_scales"]
      },
      {
        id: "sanctuary_charter", category: "history", title: "The Chapel's Sanctuary",
        link: ["Parish Commutation"],
        sub: "Church ground the bailiffs cannot enter",
        tags: ["Law", "Faith"], aliases: ["sanctuary", "commutation", "parish", "charter", "chapel", "ecclesiastical"],
        unlock: "codex_sanctuary_charter",
        body: function (s) {
          var out = [
            "An old rule from the Meridian provincial charter. Church ground is sanctuary: bailiffs, merchant factors, and debt-collectors may not cross the chapel lintel to seize the people sheltering behind it.",
            "In practice, frontier parishes keep the peace with a payment called <i>Parish Commutation</i>. Sheltered refugees spin wool, weave cloth, and mend sacks on the church looms, and the deacon pays a quarterly fee from the wool sales to the town counting house. The deacon calls it an uneasy compromise: it satisfies the counting-house men and keeps the bailiffs from dragging families into the debt-dredges."
          ];
          if (truthy(s.found_customs_vellum)) {
            out.push("The Sinks toll register holds a second clause of the same charter: consecrated ground owes no tolls at all. The commutation is not in the charter and never was. It is a levy the Scales added themselves.");
          }
          return out;
        },
        see: ["saint_althea", "meridian_empire", "alderford", "corbel", "orlov"]
      },

      /* ------------------------------------------------------ FAITH & FOLKLORE */

      {
        id: "saint_althea", category: "lore", title: "Saint Althea the Mender",
        link: ["Saint Althea", "Althea"],
        sub: "The frontier's folk saint",
        tags: ["Faith"], aliases: ["Althea", "Saint Althea of the Shroud", "prayer"],
        unlock: "codex_saint_althea",
        body: [
          "Across the cold mud of the frontier marches, common folk, weavers, and watermen pray to <b>Saint Althea of the Shroud</b>, the daughter of the Sun-Father. She is the patroness of needle, loom, herb, and bandage, the saint of those who mend what violence tears apart. Rivermen leave river pebbles polished smooth by the current at her altar before they cast off on the downriver run, and trust her for safe passage."
        ],
        see: ["sun_father", "sanctuary_charter", "weir_knots", "corbel", "alley_shrine"]
      },
      {
        id: "sun_father", category: "lore", title: "The Sun-Father",
        link: ["Sun-Father"],
        sub: "The god of emperors and oaths",
        tags: ["Faith"], aliases: ["Sun-Father", "pantheon", "bishops", "cathedral"],
        unlock: "codex_saint_althea",
        body: [
          "In the great limestone cathedral of Port Valen, high bishops sing choral litanies to the <b>Sun-Father</b> in his golden plate. He is the sovereign god of emperors, oaths, and high justice. Out in the marches, common folk pray to his daughter, Saint Althea, instead."
        ],
        see: ["saint_althea"]
      },
      {
        id: "the_drowned", category: "lore", title: "The Drowned — {{warlock_patron_title}}",
        sub: "Your patron",
        tags: ["Occult"], aliases: ["patron", "warlock", "pact", "the Drowned"],
        unlock: "codex_the_drowned",
        body: [
          "{{warlock_patron_desc}} You carry a cold, unspoken weight behind your ribs that wasn't there before the Dawn Trial, a debt to something that has not yet named its price."
        ]
      },
      {
        id: "weir_knots", category: "lore", title: "Weir-Knots",
        link: ["weir-knots", "weir-knot"],
        sub: "A waterman's charm",
        tags: ["Folklore", "Grey River"], aliases: ["weir-knot", "talisman", "charm", "flax cord", "river pebbles"],
        unlock: "codex_weir_knots",
        body: [
          "A traveler's charm made by river barge skippers and parish weavers: flax cord braided tight around three river pebbles polished smooth by the current. Watermen along the Grey carry one to stay steady against the river's cold damp and sudden changes in the current."
        ],
        see: ["saint_althea"]
      },
      {
        id: "silt_lurkers", category: "lore", title: "Silt Lurkers of the Culvert",
        link: ["silt lurkers", "Silt Lurkers", "silt lurker"],
        sub: "Something in the drains under the weirs",
        tags: ["Bestiary", "Grey River"], aliases: ["silt lurkers", "lurkers", "creatures", "culvert", "drain", "amphibious"],
        unlock: "codex_silt_lurkers",
        body: function (s) {
          var out = [
            "Something nests in the flooded brick drains under Alderford's old weir works. Its sign is a wet, clicking rasp like claws dragging over stone, and a pair of yellow eyes that open in the dark. Maura found one in the drain beneath the Drowned Oar."
          ];
          if (truthy(s.maura_cellar_cleared)) {
            out.push("The one under the Drowned Oar is dead.");
          }
          return out;
        },
        see: ["imperial_booms", "maura"]
      }

    ]
  };

})();
