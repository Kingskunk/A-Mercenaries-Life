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
 *   aliases   extra search words that are not in the text ("Free City", "Tally")
 *   link      exact phrases in the story text that become clickable links to this entry (only
 *             once the entry is unlocked, and only the first mention on each page). Keep these
 *             specific: a full proper name (Port Watch, Gilded Scales), never a common word
 *             ("captain", "tolls", "watch", "tally") and never a phrase that starts with "the",
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
 */
(function () {
"use strict";

function truthy(v) { return v === true || v === "true"; }

window.LOREBOOK = {
  categories: [
    { id: "people",   label: "People" },
    { id: "factions", label: "Factions" },
    { id: "places",   label: "Places" },
    { id: "history",  label: "History & Law" },
    { id: "lore",     label: "Faith & Folklore" }
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
        return [
          "The cold, calculating commander of the Iron Carrion, and the man who built it. A stern, aloof strategist who treats warfare as a business of ledgers, contracts, and calculated brutality, and who expects the same arithmetic from every soul drawing company pay. He gives his orders in fragments, and he negotiates the company's commissions himself, coin by coin.",
          "Veterans of the hearth-circles say he raised the Carrion out of the wreckage of the Broken Crown War, gathering deserters, runaway bond-servants, and broken soldiers behind a quartered raven banner while the imperial legions were still dissolving across the Marches. He has run it on iron discipline and exact weight of coin ever since, and the men who have served him longest speak of it without much affection and without a single complaint. Surgeon Odessa, ten years under his hand, puts it plainer — in the Carrion a soldier dies of steel or gangrene, never of politics.",
          "Where he learned the trade, nobody in the ranks can settle. The telling among the veterans — never confirmed and never quite denied — is a cashiered imperial officer who traded high rank for the freedom of a mercenary captaincy, and his bearing does nothing to quiet it. <i>\"Tall and immaculately kept in a way that looks almost offensive against the mud of the camp—silver-templed, imperial-cut coat brushed clean, a jeweled signet ring on the hand that signs the contracts, and pale eyes that linger a beat too long pricing a man before they ever bother to judge him.\"</i> Nobody who has asked him straight has gotten a straight answer, and most have stopped asking.",
          "He runs the company from behind the line and from behind a desk: in the field, mounted on dry ground under the raven banner with a brass spyglass, runners waiting on his hand signals; in quarters, a trestle desk of muster rolls and transit waybills with the banner nailed flat to the masonry instead of hung loose. In any town that pays the company, the same house law holds — no private collections, no unsanctioned bloodshed under a patron's colors, and a captain who will not know your name if the law comes asking. Leverage interests him more than glory, and he spends it the way he spends silver: late, deliberately, and only for something the company cannot take."
        ];
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
      body: [
        "Veteran drillmaster and frontline sergeant. A scarred brute responsible for turning green recruits into soldiers who don't break the shield-wall.",
        "<i>\"A massive slab of a man, gone thick and hard with age rather than soft, half his face a crosshatch of old siege-scars that pull his mouth into a permanent, humorless line. Close-cropped grey stubble, a nose broken at least twice and never set straight, and one milk-pale eye that doesn't track quite right in bad light. He turns green recruits into soldiers who don't break the shield-wall, and doesn't much care whether they like him for it.\"</i>"
      ],
      see: ["iron_carrion"]
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
      body: [
        "The Cadre's handler. An older woman who manages the company's small handful of gifted recruits like someone keeping a careful count of the ones she's already buried, and not planning to add to that number.",
        "<i>\"An older woman carrying subtle marks of infernal bloodline—small, polished obsidian ram horns sweeping close against dark hair streaked with iron-grey, and pale mercury-silver irises that miss nothing while appearing to look at nothing in particular. Decades of being eyed sideways by superstitious soldiers have left her with a calm, unhurried wariness that has nothing to do with fear of them and everything to do with fear for them. Hands steady enough to thread a needle by firelight without looking down, a satchel of scrolls and glass vials slung across one shoulder like an apothecary's kit.\"</i>"
      ],
      see: ["iron_carrion"]
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
      body: [
        "The company's gaunt, sharp-tongued field surgeon. Keeps the four hundred patched together with boiled linen, bone-saws, and grim humor.",
        "<i>\"A gaunt, sharp-tongued woman with more scars etched across her fingers and knuckles than most frontline veterans she stitches. Sharp-eyed and unsentimental, she moves between wounded soldiers with waxed thread, boiled linen, and pungent marsh-tinctures. She views warfare not through heroic ballads or tactical maneuvers, but through the mundane, messy reality of torn meat, shattered bone, and septic fever.\"</i>"
      ],
      see: ["iron_carrion"]
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
        "<i>\"A grizzled, broad-shouldered Highland smith with burn-scarred forearms, a notched ear, and a cloud of bitter pipeweed smoke trailing his steps. Having swung sledge for Master Torvald at Alderford before taking the mercenary shilling, he methodically hones company blades and shares hard-earned forgecraft with recruits who respect the steel.\"</i>"
      ],
      see: ["iron_carrion", "torvald", "alderford"]
    },
    {
      id: "elspeth", category: "people", title: "Elspeth",
      link: ["Elspeth"],
      sub: "Your younger sister",
      role: function (s) {
        if (s.elspeth_role === "odessa_apprentice") return "Iron Carrion — Chirurgeon's Assistant & Apprentice, Logistics & Baggage Train";
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
        return [
          "<i>\"Your younger sister and sole surviving kin from the burning of Ashbrook. Resilient, observant, and hardened by weeks of grueling labor in the riverfront salt sheds, she carries the trauma of your family's loss with quiet courage. Whether boiling linen by Surgeon Odessa's table or sheltered under chapel eaves, she trusts your strength and skill to see you both through the Marches.\"</i>",
          "Thinner and paler than when you last saw her in the Marches, but unmistakably kin: " + looks + "."
        ];
      },
      see: ["ashbrook", "saint_althea"]
    },

    /* ------------------------------------------------------ PEOPLE: ALDERFORD */

    {
      id: "talia", category: "people", title: "Talia",
      sub: "Brine-loft holder, Alderford waterfront",
      role: "Brine-loft holder & salter, the riverfront curing bays (Alderford)",
      link: ["Talia"],
      tags: ["Alderford"], aliases: ["salter", "curing loft", "brine", "waterfront"],
      unlock: "met_talia",
      body: function (s) {
        var out = [
          "A slender, green-eyed young woman in a coarse linen apron — the drying loft's senior forewoman and the holder of the four brine-curing lofts on Alderford's waterfront, one of the last independent salters left on the wharf. By the end of a shift her brow is flushed with sweat and dusted with sawdust, and she wipes salt-crust from her hands on the hem of that apron. She renders the tallow-and-neatsfoot dubbin the river trade treats its leather with, keeps the boiling pans and drying racks working with a few hired hands, and has no intention of selling to anyone."
        ];
        if (truthy(s.visited_talia_loft)) {
          out.push("The lofts were her father's. Garrett Vance, Master Salter — he felled the timber and drove the foundation piles thirty winters ago, when Alderford was three timber sheds and a ferry rope, and the salt-steam he breathed for twenty winters hardened his lungs as surely as it cured his catch. Above her hearth hangs his branding hammer, and pinned beside it a curled strip of vellum with a cracked provincial seal: an imperial free-wharf exemption, the paper that keeps her slips her own.");
          out.push("Which is what the cartel is really after. Her slips are the only deep-water staging berths above the gorge locks, and whoever holds them can make every grain barge, timber raft, and supply keel bound for Port Valen pay a private toll or rot at the weir. Downriver, she would be another unbonded tenant working someone else's tubs for copper scraps. Here, the shed is hers.");
        }
        return out;
      },
      see: ["alderford", "rennick", "morzan", "gilded_scales", "sanctuary_charter", "meridian_empire", "grey_river"]
    },
    {
      id: "janna", category: "people", title: "Janna",
      sub: "Journeyman smith, Torvald's forge",
      role: "Journeyman smith & striker, Torvald's Timber Forge & River Ironworks (Alderford)",
      link: ["Janna"],
      tags: ["Alderford"], aliases: ["smith", "journeyman", "striker", "anvil", "forge"],
      unlock: "met_janna",
      body: function (s) {
        var out = [
          "Journeyman smith at Torvald's Timber Forge & River Ironworks, the timber-and-granite workshop built over the mill-race upstream of the weir. Tall, soot-streaked, and bare-armed, she works the trip-hammer and the waterwheel gearing by furnace light, and her hands are as calloused as the anvil's face.",
          "She keeps the shop running while the old dwarf drinks: the racks, the orders, and the deadlines the factor sets. Sixteen barge mooring pins before dawn muster is a normal night's work, and the cost of a missed quota comes out of her hide, not his. Torvald's temper, she says, is blast-furnace slag — loud, hot, and full of sparks, with honest craft underneath once you skim it."
        ];
        if (truthy(s.janna_invitation_open)) {
          out.push("She came down out of the northern foothills beneath the Crags, where she spent her childhood sneaking into the foundry pits to watch the dwarven blast furnaces run white-hot. The Forge-Elders would not hear of a human girl taking an apprentice oath, and Torvald — fresh from his falling-out with the Council over uncertified intake engineering — took her west on one condition: swing a fourteen-pound sledge for ten hours without weeping, and he would teach her the three-beat Crag cadence. The uncertified apprentice hammer she keeps on the rack says the rest of it, its poll stamped with a dwarf mountain anvil beside a lowlander cross-peen.");
          out.push("Highland elders like their stamped parchment and silver ribbons, she says. The river does not care about paper: a mooring pin either holds against a twenty-ton grain barge in a flash surge, or it snaps in half. Hers hold.");
        }
        return out;
      },
      see: ["alderford", "torvald", "rorik", "gilded_scales", "grey_river"]
    },
    {
      id: "torvald", category: "people", title: "Torvald",
      sub: "Master smith & millwright of Alderford",
      role: "Master smith & millwright, Torvald's Timber Forge & River Ironworks (Alderford)",
      link: ["Torvald", "Master Torvald"],
      tags: ["Alderford"], aliases: ["Master Torvald", "Crag Dwarf", "dwarf", "millwright", "forge", "smith"],
      unlock: "met_torvald",
      body: function (s) {
        var out = [
          "The thickset Crag Dwarf behind Torvald's Timber Forge & River Ironworks, the cavernous timber-and-granite workshop built directly over the rushing mill-race upstream of the weir, its soot-blackened signboard swinging over the lintel. Barely five feet tall but wide as an anvil, arms thick as cured ham, a grey beard braided in highland knots and singed with slag, a scarred leather patch over his left eye, and a single bloodshot steel-grey eye that gleams hottest when something in his gearing is about to snap. Grindstones, a trip-hammer, guild-stamped sallets, blades, sapper picks, and extra shields all leave his racks, and his offer to any Carrion customer never varies: lend a hand on the race when the wheel jams, or take your notched steel and sleep in the muck.",
          "His temper is proverbial on the waterfront — all roar and flying sparks, with honest craft underneath once the sparks settle. He roars at Janna from dawn to dusk, kicks the housing of his trip-hammer when the world displeases him, and when a crisis passes he snatches up a clay ale jug and stomps off to the Drowned Oar to drink barley ale with the river skippers, thundering over his shoulder that the factor will have both their hides if the sixteen barge mooring pins aren't finished before dawn muster."
        ];
        if (truthy(s.knows_torvald_sluice_trick)) {
          out.push("Veteran Rorik — who swung sledge for him back in the highland valleys — tells how the two of them framed that timber mill over the Alderford weir, and how Torvald swore he would drown before wading into freezing river muck every time driftwood jammed the wheel. So he rigged an uncertified bypass dog under the intake casing: trip the pawl, and the counterweight backs the gear teeth off to let the river itself flush the jam. He calls it 'preventative drainage' so the guild inspectors can't fine his hide. He was ruthless about rhythm in the old shops, too — two taps to set the angle, one blow to draw the meat, kept to the exact three-count, or you caught hot tongs across your shins.");
        }
        if (truthy(s.discussed_smiths_past)) {
          out.push("He came down out of the Highland Crags after the bailiffs arrived with royal writs and thirty mounted men-at-arms, taxing three marks on every hundredweight of refined crucible steel — a squeeze that left the highland shops unable to buy stone-coal, feed their strikers, or pay the iron ore carters. He took his tools and went downriver, by his own account, to where the water runs free and no baron owns the current. Rorik had no coin to buy a river weir of his own and took the Carrion's silver shilling instead, and these days the two old highlanders close out most evenings side by side at the Drowned Oar's hearth over river ale and bone dice.");
        }
        return out;
      },
      see: ["janna", "rorik", "maura", "alderford", "gilded_scales", "grey_river", "iron_carrion"]
    },
    {
      id: "maura", category: "people", title: "Maura",
      sub: "Keeper of the Drowned Oar",
      role: "Barkeep & keeper of the Drowned Oar Taphouse (Alderford)",
      link: ["Maura"],
      tags: ["Alderford"], aliases: ["barkeep", "barmaid", "Drowned Oar", "taphouse keeper", "wolf-skin vest"],
      unlock: "met_maura",
      body: function (s) {
        var out = [
          "The lean woman in the bleached wolf-skin vest who keeps the Drowned Oar, the long timber taphouse built on cedar piles against the stone wharf embankment. She works the wide oak counter with a linen rag and a soldier's economy — sharp, assessing eyes that take in your road-weary gear and weapons before they ever take in your face, a calm smoky voice, and a grate that never goes cold: thick mutton-and-marrow pottage, river herring cured over peat smoke, spiced cider, herbal bitters, and a distilled spirit she pours in iron-thimble measures with a warning to go careful. She keeps the timber carters from brawling, pays a good song in free drinks, and for anyone bound downriver she has the thirty miles of open water to the capital mapped in her head — a smooth freight highway, she calls it, provided your boots are greased and you stay out of the river skippers' way."
        ];
        if (truthy(s.discussed_maura_past)) {
          out.push("The faded sellsword brand on her throat is the Iron Bull's. She did five campaign seasons with the Iron Bull Free Company down in the border marches, she says, thumbing the blurred ink with a dry smirk, until a crossbow quarrel through her left knee told her it was time to find dry floorboards. Ten years back she bought the timber house off an old barge-carpenter, and she will tell you what the trade taught her: the river is quieter than the shield wall, and nobody shoots at you over the counter — most nights, anyway.");
        }
        if (truthy(s.discussed_alderford_life)) {
          out.push("Her read on Alderford is a veteran's, delivered like a briefing. 'It's loud, damp, and smells of green cedar timber and pickled herring. If your back is broad and your knuckles aren't afraid of blisters, you eat. If you go soft, the river swallows you.' Up on the high limestone ridge the Old Chapel weavers shelter runaway farmhands and border refugees behind sanctuary doors; at the Weir Mill Master Torvald grinds out barge-planks and sharpens half the axes in the province, provided you don't insult his iron; and down at the lower brine sheds Talia and fifty women in oilcloth aprons gut and salt river trout while Factor Morzan and that swaggering swine Rennick invent new tolls for every pint of brine they boil. A hard town, she calls it, but an honest one if you stay clear of the counting house.");
        }
        if (truthy(s.visited_maura_cellar)) {
          out.push("The Drowned Oar sits on the dry stonework of an ancient Meridian flood-conduit, and when three feet of ancient imperial brick collapsed inward under the autumn damp, it opened clean into the flooded drain beneath the town — where something lives in the dark water: a wet, clicking rasp, two yellow eyes behind a collapsed portcullis. She will not bring the Gilded Scales' bailiffs into her vault — they would declare the drain a taxable cartel waterway and seize half her hogsheads — and Vane will not spare swords to kill a cellar rat, so she pays bounty silver out of her own till and keeps the business hers. The crane windlass bolted over the vault hatch is there for hogsheads, but it has hauled a bounty-taker bodily out of the silt too, along with her verdict on the deal: taking a bounty is one thing, throwing your life away is another." + (truthy(s.maura_cellar_cleared) ? " The thing that nested down there is in pieces now. The cellar is quiet for the first time in weeks, and word is already spreading among the carters." : " Whatever it is still scratches at the mortar below, and her advice to the half-hearted has not changed: come back when you mean it."));
        }
        return out;
      },
      see: ["iron_bull", "alderford", "torvald", "rorik", "rennick", "gilded_scales", "grey_river"]
    },
    {
      id: "rennick", category: "people", title: "Rennick",
      sub: "Gilded Scales wharf bailiff",
      role: "Toll bailiff of the Gilded Scales, Alderford wharf district (Alderford)",
      link: ["Rennick", "Master Rennick"],
      tags: ["Alderford"], aliases: ["Master Rennick", "bailiff", "toll bailiff", "dock-guards"],
      unlock: "met_rennick",
      body: function (s) {
        var out = [
          "The Gilded Scales' toll bailiff on the Alderford wharf — a stocky, thick-necked man in a water-stained beaver-fur mantle, a pewter cartel badge at his lapel, a brass-tipped cane and a ledger always at hand, and two dock-guards with iron-banded cudgels at his back. He collects the cartel's tolls and 'shelter taxes' from the curing sheds and the weighing slips, and he collects them the loud way: kick a drying rack into the muck, read the arrears out where every worker can hear, and promise the spillway to anyone who cannot pay tonight.",
          "His trade is arithmetic that always favors the Scales: salt scales shaved a shade light, stamped weigh-slips waved like writs, arrears entered in his ledger that the workers swear were paid in full at the last weigh-in, receipts scrawled in grease-pencil, and coin scooped into an embroidered velvet purse. Up close his bluster is all swagger — 'Boys, put the sellsword in the mud' — but it evaporates the moment real authority walks in: imperial wax on a river charter, four hundred Carrion banners across the mud, the mere words 'command audit.' His parting promise to anyone who squares up to him never varies: this will be settled at the toll office."
        ];
        if (truthy(s.rennick_reported)) {
          out.push("The Scales' counting house is not fooled by him. Name his shaved scales and his skimming to Factor Morzan, and the answer comes back without surprise: 'A little bird already told me my bailiff's scales run light.' The Factor has his own word to have with Rennick — and on the wharf itself, the bailiff's florid face goes the color of curdled milk the instant he understands the threat is real. His swagger stops where the Factor's signature begins: the office he struts through exists at Morzan's pleasure, and he knows the arithmetic of that better than any man on the river.");
        }
        if (truthy(s.visited_talia_loft)) {
          out.push("Talia's verdict, in her loft, names the larger game: 'Rennick wasn't only after my drying tax tonight. The Scales want to choke out every independent salter on the wharf.' The bailiff's false arrears are the tool of it — squeeze the independent lofts until they sell or drown — and Rennick's swagger is just the Scales' strangling hand wearing a pewter badge.");
        }
        return out;
      },
      see: ["gilded_scales", "morzan", "alderford", "talia", "elspeth"]
    },
    {
      id: "morzan", category: "people", title: "Factor Morzan",
      sub: "Factor of the Gilded Scales",
      role: "Guild factor of the Gilded Scales, Alderford counting house (Alderford)",
      link: ["Morzan", "Factor Morzan"],
      tags: ["Alderford"], aliases: ["Factor Morzan", "Morzan", "counting house", "factor"],
      unlock: "met_morzan",
      body: function (s) {
        var out = [
          "The Gilded Scales' factor in Alderford — portly and jowled, wrapped in water-stained beaver furs, a vellum-bound account book never far from his hand, and the frank, assessing stare of a man who has spent his life weighing cargo by eye. He met the Carrion column at the town palisade the day it arrived, flanked by bailiffs in pewter scale badges, took Captain Vane's brass baggage chits with the report that the causeway was cleared and the Sinks prisoners were in the iron cage wagons as contracted — then unrolled a stamped vellum ledger, checked every seal, and signed the company's contract vouchers. Word and wax are his trade; coin only moves when the seals satisfy him.",
          "His counting house squats on the customs slip on blackened ironwood pilings, slate roof shedding drizzle into the churn, and inside it the whole wharf's business is weighed, sealed, and filed: clerks bent over ledgers in the whale-oil glow, brass balance pans clinking against lead standard weights, a vault counter issuing Letters of Credit good in Gold Crowns and redeemable at the cartel's head house in Port Valen's Upper Wharves, and an iron-posted bounty board by the door. Chief Clerk Orlov runs the front of house — spectacles, harried, sizing up every stranger by the state of their boots — while the Factor keeps to the back office: a slice of lamplight, the scratch of a second quill, and no inclination to come out for routine business."
        ];
        if (truthy(s.rennick_reported)) {
          out.push("Report Rennick's skimming and the Factor's response comes without surprise: 'So you're the one. Word reached me a Carrion recruit walked into my own toll district's dispute and settled it without breaking a crate — and had the nerve to invoke my name doing it. A little bird already told me my bailiff's scales run light. Good instinct, chasing that up. I'll be having a word with Rennick myself.'");
        }
        if (truthy(s.knows_granary_problem)) {
          out.push("The audit reaches everywhere. Every sack in the weir granary is pre-chartered river freight, audited by weight at the loading dock; crack a seal to sell five pounds of meal to a soldier and Chief Clerk Orlov docks the difference straight out of the keeper's wage. Torn weave or rodent sign means the batch is uncertified — marked down as dock spoilage and swept into the silt chute by morning, good winter rye condemned by commercial red tape while refugee families up at the Old Chapel boil nettle broth. And when the granary keeper asked the Scales' sergeant for two spearmen against the mire-rats in the undercroft, he was laughed at: the garrison does not do pest clearance, and stamping the request petition would cost two silver marks.");
        }
        if (truthy(s.visited_talia_loft)) {
          out.push("Talia's reading of him is the sharpest: 'If Factor Morzan buys or drowns these lofts, the cartel controls the only deep-water staging slips above the gorge locks. Every grain barge, timber raft, and supply keel heading to Port Valen will have to pay their private toll or rot at the weir.' The curing-shed shakedown and the granary red tape are the same hand tightening, one finger at a time, around the river's throat.");
        }
        return out;
      },
      see: ["gilded_scales", "rennick", "talia", "orlov", "alderford", "letters_of_credit"]
    },
    {
      id: "orlov", category: "people", title: "Chief Clerk Orlov",
      sub: "Chief clerk of the Alderford counting house",
      role: "Chief Clerk, Gilded Scales counting house, Alderford customs slip (Alderford)",
      link: ["Orlov", "Chief Clerk Orlov"],
      tags: ["Alderford"], aliases: ["Chief Clerk Orlov", "Orlov", "clerk"],
      unlock: "met_orlov",
      body: function (s) {
        var out = [
          "The chief clerk of the Gilded Scales' Alderford counting house — a narrow man in ink-stained shirtsleeves behind an oak desk with a tarnished brass nameplate, spectacles pushed up into thinning grey hair, a goose quill tucked behind one ear, and the permanently harried look of a man who has never once caught up on his own paperwork. He sizes up every stranger by the state of their boots before they have said a word, and greets a Carrion contractor accordingly: 'Looking for business, or trading on your own?' — with the assurance that the guild contract is current and in good standing, and the board is open to you same as any contractor.",
          "Everything on the wharf that is weighed, sealed, taxed, or owed passes his quill: the district parish register, the provincial bounty board by the door, the vault floor with its nested lead weights lined up with military precision. He is the counting house's front of house — the Factor signs behind the side door, but it is Orlov's ink that writes the wharf's business, and Orlov's eye on a seal that decides when that door opens."
        ];
        if (truthy(s.asked_ch_commutation)) {
          out.push("Ask him about the chapel's taxes and he pushes his spectacles up his nose, wets a thumb, and drones down the district parish register: 'Saint Althea's parish labor commutation. Quarterly assessment for twenty registered refugee spinners. Four Silver Marks assessed against their wool sales, paid in full to the guild treasury.'" + (truthy(s.found_customs_vellum) ? " And if you have held the Sinks toll register in your own hands, you know what the ledger will not say: under the original Meridian provincial charter, consecrated ecclesiastical ground holds absolute toll immunity. The commutation is not a tax — it is an illegal private levy on the deacon's loom-workers, entered in Orlov's neat ink four times a year." : " It is a cold, calculated arrangement as the ledger tells it: as long as the deacon's wool silver flows into the counting house, the Gilded Scales' bailiffs leave the chapel cloister in peace."));
        }
        if (truthy(s.turned_in_customs_vellum)) {
          out.push("Hand him the Grey Waterway Toll Register and his manner sharpens for the first time. A junior clerk is waved over with a jeweler's loupe and a black touchstone; the three-headed hawk is held to the lamplight, the wax seal's edge tested against the stone, and only then does Orlov rap twice on the side door: 'Factor! The Black Sinks contract — the customs vellum's come in!' What comes back through that door is the closest thing to enthusiasm the counting house shows. The Sinks garrison's old toll register is a thing the Gilded Scales has wanted out of that flooded ruin for three seasons — 'Efficient work,' the Factor says, and the silver is counted onto the counter without further comment.");
        }
        if (truthy(s.discussed_orlov_past)) {
          out.push("He came to the books the way cargo comes to a wharf: signed, weighed, and owned. His ledger-bond was signed at the Gilded Scales head house in Port Valen's Upper Wharves against his father's debts before his beard came in, and the bond sits in a Scales counting house to this day, renewed every quarter-day — the same book-keeping that holds the debtor crews chained out in the channel off the Iron Wharves, if the tavern story is to be believed. The counting house does not need chains for men whose names live in a book; the book is the chain. It is also why the room does not rattle when factors change. 'Morzan is the third factor I have served in this room. The first died of the marsh fever with the ledgers balanced to the copper. The second was recalled upward to the head house — recalled upward, which is how the Scales put a man somewhere he cannot spend money. Factors rotate. Clerks stay. Somebody has to remember which seals are real.'");
        }
        if (truthy(s.discussed_orlov_quills)) {
          out.push("Ask about the scratch of the second quill behind the Factor's door and the harrying stops. 'The Factor keeps his own accounts, as factors do,' he says, laying his pen down like a tool he does not trust his own hands to hold. 'A chief clerk who counts what crosses the counter, and nothing else, keeps his post to a comfortable old age. A chief clerk who wonders about the door's arithmetic wonders his way onto a river barge.' What he offers unprompted is stranger: the head house sends auditors down from the Upper Wharves every quarter, and every quarter the numbers agree to the copper. He says it the way a man reads a tide table — flat, exact, and offering no explanation for why arithmetic that clean needs saying aloud.");
        }
        return out;
      },
      see: ["morzan", "gilded_scales", "saint_althea", "corbel", "debtor_crews", "alderford"]
    },
    {
      id: "corbel", category: "people", title: "Deacon Corbel",
      sub: "Deacon of Saint Althea the Mender",
      role: "Deacon, Chapel of Saint Althea the Mender, Alderford upper ridge (Alderford)",
      link: ["Corbel", "Deacon Corbel"],
      tags: ["Alderford"], aliases: ["Deacon Corbel", "Corbel", "deacon", "priest", "cleric"],
      unlock: "met_corbel",
      body: function (s) {
        var out = [
          "The elderly cleric of the Chapel of Saint Althea the Mender, perched on the granite ridge above the weir — an old man in an undyed wool habit with a carved limestone spindle-cross resting at his chest, thin grey hair, spectacles tied behind his ears with hemp cord, and calm grey eyes that carry the quiet, patient authority of an ordained servant of the cloth. He keeps the parish ledger at the chancel desk, greets the road-worn in a gentle, measured voice, and runs his sanctuary on one rule, kept by custom if not by sign: leave your quarrels on the gravel outside.",
          "He is a mender in both of his saint's senses. Lay your wounds before him and he will set his hand against them and channel Althea's grace until the golden light sinks back into the stone and he steps back faintly winded — three copper bits, or nothing when the parish owes you the courtesy. The poor-chest holds no silver; what little coin the chapel takes in goes straight to the town hearth-tax. What he keeps in plenty is the stone stoup by the door: cold spring water, a resting of fingers on your crown, and a blessing for the road — may the stone hold beneath your tread."
        ];
        if (truthy(s.discussed_chapel_deity)) {
          out.push("His saint is an unfashionable one. In the grand cathedral of Port Valen, the bishops sing of the Sun-Father in his golden armor, smiting dragons and crowning emperors; out in the mud of the border marches, Corbel teaches his flock to pray to the Sun-Father's daughter, Saint Althea of the Shroud — patroness of needle, loom, and herb, the mender of broken cloth and broken flesh. Barge-men and watermen bring river pebbles to her statue's feet before they run the gorge, and in a marches town where no one can buy a master chirurgeon, Corbel says her grace is the only thing standing between a gangrenous wound and a shallow grave.");
        }
        if (truthy(s.discussed_chapel_sanctuary)) {
          out.push("The chapel's peace rests on the ancient Meridian ecclesiastical treaty. Displaced folk who shelter here register for parish labor — spinning wool, mending sacks, maintaining the weir road — and the parish pays a modest commutation fee from its wool sales to the town counting house each quarter. It satisfies the ledger-men and keeps bailiffs like Rennick from dragging indebted families into the debt-dredges; the Scales hold the river trade, the sawmills, and the toll-posts, and to them the refugees drifting in from the border estates look like cheap manual labor for the brine sumps and barge slips. An uneasy compromise, Corbel calls it — but one that keeps the peace.");
        }
        if (truthy(s.corbel_charter_argument)) {
          out.push("And then a clause from a flooded ruin came up the ridge steps: under the original Meridian provincial charter, consecrated ecclesiastical ground holds absolute toll immunity. The commutation was never owed. Corbel tested it the way he tests everything — slowly, with his eyes closed — and then made the only practical choice an old deacon with sixty mouths to feed can make. The chapel keeps paying. The clause is copied fair into the parish charter roll and banked, quiet, where the counting house cannot hear of it — a wall against the day the Scales reach for more than the commutation, and a bailiff looks past the ledger at the cloth itself. Until that day, it is one more secret kept beneath Saint Althea's rafters.");
        }
        return out;
      },
      see: ["saint_althea", "sanctuary_charter", "orlov", "elspeth", "alderford"]
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
        "Port Valen serves as the company's operational home base. The Carrion rents a fortified compound near the Iron Wharves, returning there between contracts to collect pay, repair its equipment, recruit replacements, and negotiate its next commission. It is a headquarters, not a fief: the company owns no land and can be driven elsewhere whenever its contracts or enemies demand it."
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
        "A wealthy, ruthless cartel of river-merchants and guild-masters based in Port Valen's Upper Wharves. They monopolize timber, grain barges, and river toll-gates across the province, enforcing commercial contracts with mercenary iron. A free company is a line in their ledgers like any other expense: hired when iron is needed, paid by the season, and dismissed the moment the road is open.",
        "The cartel is led by a <b>First Factor</b>, a presiding merchant who speaks for the Scales in matters of war, treaty, and city policy. The First Factor answers to the Council of Factors, the ruling council of Port Valen, made up of the senior merchant houses. Beneath them, appointed civic officers manage records, taxes, courts, and the Port Watch. Port Valen holds the old imperial title of a free city and calls itself free because no crown rules it. In practice, whoever controls the purse controls the city."
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
          "The city guard charged with maintaining public peace, patrolling the harbor quays, and manning the stone water-gates. Wearing boiled leather jerkins stamped with the city's three-masted seal, armed with bills, shortbows, and iron-banded cudgels, they walk the beat between foreign crews, dockside brawlers, and Dredge-End cutpurses.",
          "Though sworn to the City Council and the public order, the Watch is under-strength, underpaid, and constantly caught between the demands of the Gilded Scales—who expect immediate protection for merchant cargo—and the realities of a teeming port swollen with refugees and armed sellswords. A veteran watchman values quiet quays, paid bar tabs, and reliable steel far more than abstract civic decrees."
        ];
        if (truthy(s.pv_tavern_rumor_2)) {
          out.push("Four hundred mercenaries now reinforce the Watch's patrol rosters from the Iron Wharves to the lower landing-stairs, under terms the Watch captain read out at the pier: no private collections, no unsanctioned arrests, and no settling old debts under city colors. The porters recite them like a litany neither of them quite believes will hold.");
        }
        return out;
      },
      see: ["gilded_scales", "port_valen", "cargo_quay", "civic_heights", "silt_gates"]
    },
    {
      id: "black_tally", category: "factions", title: "The Black Tally",
      link: ["Black Tally"],
      sub: "Dredge-End's underworld syndicate",
      tags: ["Port Valen", "Underworld"], aliases: ["Tally", "Dredge-End", "syndicate", "loan sharks", "smugglers"],
      unlock: "codex_black_tally",
      meter: { stat: "black_tally_rep", label: "Standing with the Black Tally" },
      body: function (s) {
        var out = [
          "The brutal underworld syndicate of Port Valen's Dredge-End slums. A network of loan sharks, fence houses, and smugglers who enforce blood debts with shivs and river burials."
        ];
        if (truthy(s.pv_tavern_rumor_1)) {
          out.push("Their collectors work the canal bridges with bare knives and no Watch badge. The advice in the taverns: do not flash silver past dark in that quarter, unless you mean to donate it.");
        }
        return out;
      },
      see: ["port_valen", "dredge_end", "tobin", "sal"]
    },
    {
      id: "baron_karr", category: "factions", title: "Baron Aldous Karr",
      link: ["Baron Aldous Karr", "Baron Karr", "Aldous Karr"],
      sub: "Feudal lord of Karr's Keep",
      tags: ["Karr", "Highlands"], aliases: ["Karr", "the Baron"],
      unlock: "codex_baron_karr",
      body: [
        "The grasping, paranoid feudal lord of Karr's Keep. Notorious for ruinous agricultural taxes, violent bailiffs, and an iron grip on his highland tenants."
      ],
      see: ["karrs_keep", "iron_bailiffs", "ashbrook"]
    },
    {
      id: "iron_bailiffs", category: "factions", title: "The Iron Bailiffs",
      link: ["Iron Bailiffs"],
      sub: "Baron Karr's tax collectors",
      tags: ["Karr", "Highlands"], aliases: ["bailiffs", "tax collectors"],
      unlock: "codex_iron_bailiffs",
      body: [
        "Baron Aldous Karr's armed tax collectors and highland enforcers. Hardened thugs in boiled leather and iron kettle-helms who patrol the mountain toll passes, seize tenant harvests, and enforce Karr's extortionate edicts with fire and the noose."
      ],
      see: ["baron_karr", "ashbrook"]
    },
    {
      id: "squatters", category: "factions", title: "The Causeway Squatters & Deserters",
      sub: "The garrison of the Black Sinks gatehouse",
      tags: ["Grey River"], aliases: ["squatters", "deserters", "Black Sinks"],
      unlock: "codex_marsh_squatters",
      body: [
        "A desperate coalition of displaced highland tenants, escaped bond-servants, and army deserters who fortified the Black Sinks toll gatehouse. Driven into the fen by starvation and debt, they fought with scythes, sickles, and fishing spears to hold the causeway before being overwhelmed by the Carrion."
      ],
      see: ["black_sinks"]
    },
    {
      id: "iron_bull", category: "factions", title: "The Iron Bull Free Company",
      link: ["Iron Bull"],
      sub: "A legendary heavy-infantry company",
      tags: ["Mercenaries"], aliases: ["Iron Bull", "Maura", "pike squares"],
      unlock: "codex_iron_bull",
      body: [
        "A legendary heavy-infantry mercenary company renowned across the western provinces for impenetrable pike squares, disciplined wedge charges, and ruthless contract adherence. Famous for holding the southern river crossings during the chaotic aftermath of the Broken Crown War, their ranks were decimated in the grueling campaigns that followed, scattering surviving veterans like Maura into frontier settlements across the Marches."
      ],
      see: ["meridian_empire", "maura"]
    },

    /* ------------------------------------------------------------------ PLACES */

    {
      id: "grey_marches", category: "places", title: "The Grey Marches",
      link: ["Grey Marches"],
      sub: "The frontier borderland",
      tags: ["Regional"], aliases: ["Marches", "frontier", "borderland", "map"],
      body: [
        "A contested, mist-shrouded frontier borderland wedged between coastal trade routes and the rugged northern highlands."
      ],
      see: ["port_valen", "alderford", "black_sinks", "broken_crags", "karrs_keep", "ashbrook", "grey_river"]
    },
    {
      id: "port_valen", category: "places", title: "Port Valen & Dredge-End",
      link: ["Port Valen"],
      sub: "The port capital downriver",
      tags: ["Port Valen"], aliases: ["Port Valen", "Dredge-End", "Upper Wharves", "free city", "Free City", "Council", "capital"],
      unlock: "codex_port_valen",
      body: [
        "The sprawling, corrupt port capital downriver, a free city in the old imperial sense, answerable to no crown. Its Council rules the surrounding towns and villages of the river country, Alderford among them, through tolls, tax contracts, and factors rather than garrisons. While the merchant palaces of the Gilded Scales dominate the Upper Wharves, Dredge-End is a maze of flooded canals, rotting tenements, and Black Tally territory."
      ],
      see: ["gilded_scales", "port_watch", "black_tally", "alderford", "iron_carrion", "harbor_quayside", "dredge_end", "middle_ward", "upper_wharves", "civic_heights", "council"]
    },
    {
      id: "alderford", category: "places", title: "Alderford",
      link: ["Alderford"],
      sub: "The frontier's river weir town & barge port",
      tags: ["Alderford", "Grey River", "Trade"], aliases: ["Alderford", "weir", "waystation", "salt lofts", "brine", "river town", "logging slips"],
      unlock: "codex_alderford",
      meter: { stat: "alderford_rep", label: "Standing in Alderford" },
      body: [
        "A river town built around an ancient imperial limestone weir, where the highland road down from the Crags meets the Grey and the river drops away toward the gorge. Sawmills crowd the bank above the falls; below them stand warehouses, drying sheds, salt lofts, and muddy wharves where the barges tie up to load for the downriver run. The brine trade is the town's spine: catches boiled in the riverfront pans, cured in the lofts above them, and packed downriver by watermen who know every shallow of the gorge.",
        "The stone is older than the town. The weir is legion work — imperial limestone with locks cut through it, and beneath the southern foundation a flooded ashlar chamber where the release gear for a submerged anti-galley boom still sits, its plans carried off by the garrison that withdrew. Everything above the waterline is newer. Thirty winters ago Alderford was three timber sheds and a ferry rope; then the loft piles went into the bank, the pans were fired, and the salt-steam that made the town rich hardened the lungs of the people who worked it.",
        "Port Valen's Council holds Alderford as one of its river towns and has never seen fit to garrison it. The Gilded Scales collect their share through a resident factor and a stamped ledger, with bailiffs on the toll road wearing pewter scale badges, carrying stamped weigh-slips, and weighing goods against lead weights that do not always weigh what they are stamped. What protects the town is paper: free-wharf exemptions sealed under the old provincial charter, sanctuary behind the chapel lintel, and a river charter that still names ten lashes for extorting refugees."
      ],
      see: ["port_valen", "grey_river", "sanctuary_charter", "gilded_scales", "imperial_booms", "meridian_empire", "saint_althea", "iron_carrion"]
    },
    {
      id: "grey_river", category: "places", title: "The Grey River Waterway (The Downriver Run)",
      link: ["Grey River"],
      sub: "Alderford to Port Valen by water",
      tags: ["Grey River"], aliases: ["Grey River", "river gorge", "downriver", "waterway"],
      unlock: "codex_river_gorge",
      body: [
        "A wide, thirty-mile navigable freight highway flowing between limestone bluffs and ancient imperial signal towers from Alderford down to Port Valen. While the steady current provides a smooth downstream run for heavy commercial grain barges and timber scows, the pervasive river damp, freezing autumn spray, and submerged imperial works (like ancient anti-galley booms) require waterproofed gear and seasoned watermen."
      ],
      see: ["alderford", "port_valen", "imperial_booms"]
    },
    {
      id: "black_sinks", category: "places", title: "The Black Sinks Causeway",
      link: ["Black Sinks", "imperial dike-road"],
      sub: "An imperial dike-road gone to rot",
      tags: ["Grey River", "Empire"], aliases: ["Black Sinks", "causeway", "gatehouse", "toll road", "dike-road", "dike road", "imperial causeway"],
      unlock: "codex_black_sinks",
      body: function (s) {
        var out = [
          "An ancient imperial dike-road driven across the Sinks on fitted grey ashlar, engineered wide enough for military freight wagons and left to rot for decades. Sinking peat and seasonal floods have collapsed its outer shoulders, so only the crowned centerline still carries wheels, single file, with waist-deep bog on both flanks. Where the road widens onto an elevated limestone toll apron, a squat stone gatehouse closes the breach — the last chokepoint on the river toll road between the highland Crags and the downriver run."
        ];
        if (!truthy(s.codex_marsh_squatters)) {
          out.push("This autumn the gatehouse is held by deserters and displaced tenants out of the high valleys, with scythes, sickles, and fishing spears, and nowhere else to run. The Gilded Scales bought the road back and handed the contract to the Carrion.");
        } else {
          out.push("The gatehouse stands open. What held it is scattered into the reeds, dead on the flagstones, or riding downriver in the iron cage wagons as contracted, and traffic crosses the causeway again under the Carrion's raven banners.");
        }
        return out;
      },
      see: ["squatters", "gilded_scales", "meridian_empire", "iron_carrion", "grey_river", "alderford"]
    },
    {
      id: "broken_crags", category: "places", title: "The Broken Crags",
      link: ["Broken Crags"],
      sub: "A rugged northern highland region",
      tags: ["Karr", "Highlands"], aliases: ["Crags"],
      unlock: "codex_broken_crags",
      body: [
        "A rugged northern highland region of steep granite ravines, scrub hills, and treacherous rocky terrain that breaks wagon axles. Controlled by Baron Karr's bailiffs, its narrow choke points and heavy morning fog make it a perilous natural ambush corridor for the company's advance."
      ],
      see: ["baron_karr", "iron_bailiffs"]
    },
    {
      id: "karrs_keep", category: "places", title: "Karr's Keep",
      link: ["Karr's Keep"],
      sub: "Seat of Baron Karr's rule",
      tags: ["Karr", "Highlands"], aliases: ["Keep", "fortress"],
      unlock: "codex_karrs_keep",
      body: [
        "A cold, brooding granite fortress perched on the Crags, serving as the seat of Baron Aldous Karr's local rule."
      ],
      see: ["baron_karr", "broken_crags"]
    },
    {
      id: "ashbrook", category: "places", title: "Ashbrook",
      link: ["Ashbrook"],
      sub: "A destroyed tenant-farming village",
      tags: ["Karr", "Highlands"], aliases: ["burning of Ashbrook"],
      unlock: "codex_ashbrook",
      body: [
        "A destitute tenant-farming village in the high valley foothills. Razed to the ground by Baron Karr's bailiffs during a forced grain-tax collection."
      ],
      see: ["baron_karr", "iron_bailiffs", "elspeth"]
    },

    /* --------------------------------------------------------- HISTORY & LAW */

    {
      id: "meridian_empire", category: "history", title: "The Meridian Empire & the Broken Crown War",
      link: ["Meridian Empire", "Broken Crown War"],
      sub: "The Fall of an Empire",
      tags: ["Empire"], aliases: ["Meridian", "empire", "Broken Crown War", "imperial", "war of succession"],
      unlock: "codex_meridian_empire",
      body: [
        "Long before its final collapse, the Meridian Empire was already a dying titan—rotted from within by centuries of bureaucratic decay, warring client kingdoms, regional rebellions, and endless external border conflicts. The colossal ashlar causeways, fortified weirs, and deepwater river booms found across the Marches are the bones of an ancient, monumental civilization that hollowed out long before its legions withdrew.",
        "The <b>Broken Crown War</b> thirty years ago was not the beginning of the fall, but the Empire's final, convulsive death rattle. A catastrophic war of succession fought across the western provinces bled the imperial treasury white, shattered the remaining noble dynasties, and permanently splintered the realm. In the vacuum left behind, the imperial center simply went silent—never formally releasing its frontier holdings, but abandoning them entirely to the elements.",
        "Today, the continent is a fractured patchwork of ruined successor territories, petty warlords, and grasping frontier barons (like Aldous Karr) squabbling over broken provinces, each attempting to carve out petty kingdoms in the shadow of an empire long dead."
      ],
      see: ["imperial_booms", "sanctuary_charter", "baron_karr", "carrion_founding"]
    },
    {
      id: "carrion_founding", category: "history", title: "The Founding of the Iron Carrion",
      sub: "How the company was raised from a broken empire",
      tags: ["Iron Carrion", "Empire"], aliases: ["founding", "Carrion founding", "free company origins"],
      unlock: "codex_meridian_empire",
      body: [
        "The Iron Carrion was raised thirty years ago, while the Meridian Empire's death was still becoming a fact rather than a rumor. The legions that had garrisoned the Grey Marches dissolved where they stood instead of marching home — pay in arrears, orders that never came, officers with nothing left to give them. The provinces they abandoned fell to feuding client lords and frontier barons, and onto the roads went the men the war had finished with: deserters, runaway bond-servants, and soldiers whose colors no longer existed.",
        "The company that took them in was the work of an officer the Empire had finished with, and what he offered them was terms rather than loyalty. Written contract, honest weight of coin, and a discipline harsher than any feudal levy enforced. The motto painted under the raven standard is a soldier's joke about the trade: <i>\"Crows feast where lords bleed.\"</i>",
        "Thirty years on, that shape has not changed. The Carrion raises, pays, and replaces its men by written contract, keeps a rented compound instead of a fief, and negotiates the next commission while the last one is still being paid out. Its veterans measure the company by the only two things it has ever promised: coin weighed honestly, and a contract kept to the letter."
      ],
      see: ["vane", "iron_carrion", "meridian_empire"]
    },
    {
      id: "imperial_booms", category: "history", title: "Submerged Anti-Galley Booms & Imperial Hydraulics",
      link: ["anti-galley booms"],
      sub: "Iron chains in the riverbed",
      tags: ["Empire", "Grey River"], aliases: ["booms", "anti-galley", "winches", "hydraulics"],
      unlock: "codex_imperial_booms",
      body: [
        "Centuries ago, legion hydraulic sappers engineered massive underwater anti-galley iron booms across key choke points along the Grey River. Weighted by counterweight release winches housed in dry ashlar vaults beneath limestone weir foundations, these massive iron chains were built to rip the keels from invading warships. When imperial garrisons withdrew thirty years ago taking their blueprints with them, the submerged booms remained frozen in the riverbed—unnoticed by shallow local skiffs, but lethal obstacles to heavy five-foot-draught deepwater transport barges."
      ],
      see: ["grey_river", "meridian_empire"]
    },
    {
      id: "letters_of_credit", category: "history", title: "Letters of Credit & Provincial Toll Tariffs",
      link: ["Letters of Credit", "Letter of Credit"],
      sub: "How the Scales move money",
      tags: ["Trade", "Law"], aliases: ["credit", "banking", "counting house", "vault", "tariff", "tolls"],
      unlock: "codex_letters_of_credit",
      body: [
        "The commercial banking system engineered by the Gilded Scales to facilitate long-distance river trade without transporting vulnerable iron coin-chests along bandit-infested roads. Merchants and mercenary companies deposit bullion in regional counting houses, receiving wax-sealed, certified vellum drafts redeemable at full value (minus administrative tariff) in any affiliated vault across the province."
      ],
      see: ["gilded_scales"]
    },
    {
      id: "sanctuary_charter", category: "history", title: "Ecclesiastical Sanctuary & Parish Commutation",
      link: ["Parish Commutation"],
      sub: "Church ground the bailiffs cannot enter",
      tags: ["Law", "Faith"], aliases: ["sanctuary", "commutation", "parish", "charter", "chapel"],
      unlock: "codex_sanctuary_charter",
      body: [
        "An enduring legal mechanism dating back to the Old Meridian Provincial Charter. Ecclesiastical grounds hold inviolable sanctuary status: secular bailiffs, merchant factors, and debt enforcers are forbidden under holy law from crossing the chapel lintel to seize laborers or debtors.",
        "In practice, frontier parishes maintain this autonomy through an uneasy commercial compromise known as <i>Parish Commutation</i>—sheltered refugees spin wool, weave cloth, and mend sacks on church looms, allowing the deacon to pay a quarterly fee from textile sales to the city's counting houses to satisfy commercial ledgers."
      ],
      see: ["saint_althea", "meridian_empire", "alderford"]
    },

    /* ------------------------------------------------------ FAITH & FOLKLORE */

    {
      id: "saint_althea", category: "lore", title: "Saint Althea the Mender & the Sun-Father",
      link: ["Saint Althea", "Althea", "Sun-Father"],
      sub: "The frontier's folk saint",
      tags: ["Faith"], aliases: ["Althea", "Sun-Father", "Saint Althea of the Shroud", "pantheon", "prayer"],
      unlock: "codex_saint_althea",
      body: [
        "In the marble cathedrals of Port Valen, high bishops sing choral litanies to the <b>Sun-Father</b> in his golden plate, sovereign deity of imperial emperors, oaths, and high justice. But across the cold mud of the frontier marches, common folk, weavers, and watermen pray to his daughter, <b>Saint Althea of the Shroud</b>.",
        "Revered as the patroness of needle, loom, herb, and bandage, Saint Althea is the divinity of those who mend what secular violence tears apart. Rivermen offer river pebbles polished smooth by the current at her altar before casting off on the downriver run, trusting her grace for safe passage along the waterways."
      ],
      see: ["sanctuary_charter", "weir_knots"]
    },
    {
      id: "the_drowned", category: "lore", title: "The Drowned — {{warlock_patron_title}}",
      sub: "Your patron",
      tags: ["Occult"], aliases: ["patron", "warlock", "pact", "the Drowned"],
      unlock: "codex_the_drowned",
      body: [
        "{{warlock_patron_desc}} You carry a cold, unspoken weight behind your ribs that wasn't there before the Dawn Trial—a debt to something that has not yet named its price."
      ]
    },
    {
      id: "weir_knots", category: "lore", title: "River Folklore & Weir-Knots",
      link: ["weir-knots", "weir-knot"],
      sub: "A waterman's charm",
      tags: ["Folklore", "Grey River"], aliases: ["weir-knot", "talisman", "charm", "flax cord", "river pebbles"],
      unlock: "codex_weir_knots",
      body: [
        "Traditional talismans crafted by river barge skippers and parish weavers. Made from tightly braided flax cord knotted around three river pebbles polished smooth by the current, the weir-knot is a common traveler's charm carried by watermen along the Grey River to stay grounded against the river's cold damp and sudden changes in the current."
      ],
      see: ["saint_althea"]
    },
    {
      id: "silt_lurkers", category: "lore", title: "Silt Lurkers of the Culvert",
      link: ["silt lurkers", "Silt Lurkers", "silt lurker"],
      sub: "Blind predators under the weirs",
      tags: ["Bestiary", "Grey River"], aliases: ["silt lurkers", "lurkers", "creatures", "culvert", "flume", "amphibious"],
      unlock: "codex_silt_lurkers",
      body: [
        "Vicious, blind amphibious predators that infest the subterranean flumes, drainage vaults, and flooded culverts beneath ancient weir foundations. Adapted to total darkness and murky river silt, they hunt in coordinated packs, using needle-sharp teeth, sensory barbels, and sudden subterranean ambushes to drag prey beneath the water."
      ],
      see: ["imperial_booms"]
    }

  ]
};

})();
