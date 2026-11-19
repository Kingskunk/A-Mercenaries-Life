/*
 * SPELL DATA -- the castable-spell list the sidebar's spellbook section renders, and the single
 * source of truth for which spells exist.
 *
 * Deliberately hand-maintained, NOT a scan of ICONS/: the art library holds ~7,200 files covering all
 * of D&D 5e, while this game implements around thirty. Listing them here means (a) the sidebar only
 * ever offers things that can actually happen, and (b) adding art to ICONS/ never silently changes what
 * the UI shows. `tools/gen_spell_icons.js` reads the `id` fields of this file to decide which icons to
 * inline, so a spell added here with no matching art simply falls back to an initials chip.
 *
 * `level` is the 5e spell level, used to pick which tab orb the entry files under (0 = cantrip). These
 * are the levels the game actually offers in its pools: a cantrip (0) or a 1st-level spell, so levels
 * 2+ have no entries yet and their tabs render dimmed rather than hidden -- the tab row keeps a stable
 * shape so it does not reflow when a character learns something.
 *
 * `name` is the display label; the sidebar's own `_desc` stat (bard_cantrip_desc and friends) is
 * preferred over `desc` when present, since it carries the game's own longer prose.
 *
 * THE ENTRY FIELDS (2026-11-04) are what the spellbook panel prints as a reference page: `time` (casting
 * time), `range`, `components`, `duration` and `text`. They were added because the book gives a spell a
 * whole page and the one-line `_desc` left it almost empty.
 *   - `range` is OMITTED for any spell the combat engine knows: tools/spell_book.json owns reach, and
 *     spellbook.js reads it from window.SPELL_REACH so the book can never disagree with the fight. Only
 *     spells with no combat reach (Self, Touch, out-of-fight workings) carry a range here.
 *   - `duration` and the numbers in `text` follow THIS GAME where it departs from the books: False Life
 *     lasts 12 hours (the user's decision, so it is worth casting before a day's work) and Hex runs ten
 *     rounds. Do not "correct" these back to the rulebook.
 *   - `text` is written as a reference entry, not as narration: what the working is, then what it does.
 *
 * Open with the Spellbook section in the sidebar, or the S key; the full book is the rail's Spells button, or B.
 */
(function () {
  "use strict";

  var SPELL_DATA = [
    // ── Cantrips (level 0) ──
    { id: "blade_ward", name: "Blade Ward", level: 0, schools: "Abjuration",
      time: "Action", range: "Self", components: "V, S", duration: "Concentration, a minute",
      text: "A shifting ward of force traced in the air. While you concentrate, any creature that makes an attack roll against you subtracts 1d4 from the roll." },
    { id: "booming_blade", name: "Booming Blade", level: 0, schools: "Evocation",
      time: "Action", range: "Your weapon's reach", components: "S, weapon", duration: "One round",
      text: "You strike with your weapon and leave the air around the target humming with stored thunder. The blow lands as a normal melee attack; if the target then moves, the hum breaks and deals 1d8 thunder damage. At higher levels the blow itself carries thunder and the break hits harder." },
    { id: "chill_touch", name: "Chill Touch", level: 0, schools: "Necromancy",
      time: "Action", components: "V, S", duration: "Instantaneous",
      text: "A skeletal, ghostly hand of grasping cold that saps warmth and strength from whatever it grips: a ranged spell attack for 1d8 necrotic damage." },
    { id: "eldritch_blast", name: "Eldritch Blast", level: 0, schools: "Evocation",
      time: "Action", components: "V, S", duration: "Instantaneous",
      text: "A crackling bolt of raw force that answers when you reach for it, more instinct than spell. The signature weapon of your pact, the surest sign of what you have become, and the one working you will never run short of." },
    { id: "fire_bolt", name: "Fire Bolt", level: 0, schools: "Evocation",
      time: "Action", components: "V, S", duration: "Instantaneous",
      text: "A small, precise mote of fire flung on command: a ranged spell attack for 1d10 fire damage. It lights any spilled grease it lands in, and it costs nothing to throw again, and again." },
    { id: "guidance", name: "Guidance", level: 0, schools: "Divination",
      time: "Action", range: "Touch", components: "V, S", duration: "Concentration, a minute",
      text: "A soft, murmured focusing working that steadies your hand or sharpens your mind for one task, if you have breath enough to speak it before you act. Cast it ahead of the attempt, not after." },
    { id: "light", name: "Light", level: 0, schools: "Evocation",
      time: "Action", range: "Touch", components: "V", duration: "An hour",
      text: "A small, steady radiance kindled at will, bright as a torch and immune to wind, rain, or a guttering wick. Laid on something you carry, or on something you leave behind to mark the way back out." },
    { id: "mage_hand", name: "Mage Hand", level: 0, schools: "Conjuration",
      time: "Action", range: "Near", components: "V, S", duration: "A minute",
      text: "A spectral, disembodied hand that can lift, carry, or fumble with small objects at a distance. It cannot fight, and it has no strength to speak of, but it reaches where an arm will not." },
    { id: "message", name: "Message", level: 0, schools: "Transmutation",
      time: "Action", range: "Far", components: "V, S", duration: "One round",
      text: "A whispered word that travels straight into one chosen listener's ear from well across a room, or a battlefield line. They may whisper back, and nobody between you hears either of you." },
    { id: "mending", name: "Mending", level: 0, schools: "Transmutation",
      time: "A minute", range: "Touch", components: "V, S", duration: "Instantaneous",
      text: "A slow, tactile working that seals clean breaks, torn leather, or snapped cord with a touch, making ruined gear serviceable again. It will not mend what was never whole, and it cannot heal flesh." },
    { id: "minor_illusion", name: "Minor Illusion", level: 0, schools: "Illusion",
      time: "Action", range: "Near", components: "S", duration: "A minute",
      text: "A small false sound or image conjured from nothing, useful for a distraction, a lie, or a moment's cover when steel is not the answer. It makes no heat, no smell and no weight, and a hand passes straight through it." },
    { id: "prestidigitation", name: "Prestidigitation", level: 0, schools: "Conjuration",
      time: "Action", range: "Near", components: "V, S", duration: "Up to an hour",
      text: "Small, showy magic tricks: harmless sparks, colored smoke, minor sensory flourishes. Not dangerous, but proof beyond doubt that the working is real—it cleans, soils, chills, warms and flavours in equal measure." },
    { id: "ray_of_frost", name: "Ray of Frost", level: 0, schools: "Evocation",
      time: "Action", components: "V, S", duration: "Instantaneous",
      text: "A thin, pale ray of unnatural cold that saps warmth and slows whatever it strikes. The chill stays in the limbs, so a struck target closes on you more slowly, and that buys a caster the one thing they always want." },
    { id: "shocking_grasp", name: "Shocking Grasp", level: 0, schools: "Evocation",
      time: "Action", components: "V, S", duration: "Instantaneous",
      text: "A jolt of violent, crackling lightning channeled through your palm, bypassing metal armor and leaving its victim stunned and unable to react. You must be close enough to lay a hand on them." },
    { id: "true_strike", name: "True Strike", level: 0, schools: "Divination",
      time: "Action", range: "Your weapon's reach", components: "S, weapon", duration: "Instantaneous",
      text: "Guided by a flash of insight, you strike with the weapon in your hand. The attack uses your spellcasting ability for both the roll and the damage, and the blow lands as the weapon's own kind of harm or as radiant light, whichever you choose." },
    { id: "vicious_mockery", name: "Vicious Mockery", level: 0, schools: "Enchantment",
      time: "Action", components: "V", duration: "One round",
      text: "A cruel, perfectly-aimed insult that rattles its target enough to genuinely throw off their next strike. It deals 1d4 psychic damage, and their following attack comes at disadvantage—the words have to be heard and understood to land." },
    { id: "thaumaturgy", name: "Thaumaturgy", level: 0, schools: "Transmutation",
      time: "Action", range: "Near", components: "V", duration: "Up to a minute",
      text: "Small, innate parlor tricks of infernal blood: your voice booms, your eyes flash, doors slam and flames gutter at your word. It frightens the credulous and proves nothing to anyone else." },
    { id: "control_flames", name: "Control Flames", level: 0, schools: "Transmutation",
      time: "Action", range: "Far", components: "S", duration: "Instant, or an hour",
      text: "A gesture that takes hold of a fire you did not light. You can swell it, smother it, change its colour, or hold a shape in it. It must already be burning, and it will not take hold of anything larger than a hearth." },
    { id: "poison_spray", name: "Poison Spray", level: 0, schools: "Necromancy",
      time: "Action", components: "V, S", duration: "Instantaneous",
      text: "A puff of noxious gas flung from the palm at a nearby foe. The target makes a Constitution save or takes 1d12 poison damage, and nothing at all happens on a success: a heavy die with an all-or-nothing throw behind it." },
    // ── 1st-level spells ──
    { id: "absorb_elements", name: "Absorb Elements", level: 1, schools: "Abjuration",
      time: "Reaction, when struck by acid, cold, fire, lightning or thunder", range: "Self", components: "S", duration: "One round",
      text: "A reflex ward held coiled, ready the instant acid, cold, fire, lightning or thunder reaches you. It turns half the blow's force aside and leaves the rest clinging to your hand, ready to ride along on your very next blow." },
    { id: "alarm", name: "Alarm", level: 1, schools: "Abjuration",
      time: "A minute (ritual)", range: "Near", components: "V, S", duration: "Eight hours",
      text: "A quiet ward laid over a doorway or a stretch of ground, silent to everyone but you the instant it is crossed. It does not stop what comes through—it only means you are not asleep when it does." },
    { id: "arms_of_hadar", name: "Arms of Hadar", level: 1, schools: "Conjuration",
      time: "Action", range: "Self, all around", components: "V, S", duration: "Instantaneous",
      text: "Black, cold arms of force burst out around you and lash every foe within reach. Those they catch cannot answer you until their next turn—a spell for when you are surrounded, not for picking a target." },
    { id: "armor_of_agathys", name: "Armor of Agathys", level: 1, schools: "Abjuration",
      time: "Action", range: "Self", components: "V, S", duration: "While its temporary hit points last",
      text: "A spectral rime of frost sheathes your skin. It grants 5 temporary hit points, and while any of them remain, a creature that lands a melee blow on you takes 5 cold damage in return." },
    { id: "bane", name: "Bane", level: 1, schools: "Enchantment",
      time: "Action", components: "V, S", duration: "Concentration, a minute",
      text: "A thread of ill luck you can loop around up to three throats at once, souring every blow and every plea they try to make afterward. Each one that fails to shake it off strikes and saves worse while you hold the thread." },
    { id: "burning_hands", name: "Burning Hands", level: 1, schools: "Evocation",
      time: "Action", components: "V, S", duration: "Instantaneous",
      text: "A thin sheet of flame that leaps from your spread fingers and washes over everything close enough to touch. What fails to flinch away in time carries the burn with it; what braces takes the heat and little more." },
    { id: "cause_fear", name: "Cause Fear", level: 1, schools: "Necromancy",
      time: "Action", components: "V", duration: "Concentration, a minute",
      text: "A whispered dread planted straight into one mind. The target is frightened for as long as the fear holds: its blows come with disadvantage, and it will not willingly come closer. The mindless shrug it off entirely." },
    { id: "charm_person", name: "Charm Person", level: 1, schools: "Enchantment",
      time: "Action", range: "Near", components: "V, S", duration: "An hour",
      text: "A warm, persuasive undertone woven into your words that makes a listener want, quite genuinely, to see things your way. They know afterward that you charmed them, which is usually the problem." },
    { id: "comprehend_languages", name: "Comprehend Languages", level: 1, schools: "Divination",
      time: "Action (ritual)", range: "Self", components: "V, S", duration: "An hour",
      text: "For a short while, every language spoken or written around you becomes as plain as your own tongue. It reads meaning, not cipher: a code stays a code, and a word nobody has spoken aloud stays silent." },
    { id: "cure_wounds", name: "Cure Wounds", level: 1, schools: "Abjuration",
      time: "Action", range: "Touch", components: "V, S", duration: "Instantaneous",
      text: "A hand laid on a wound and held there while the flesh closes under it. It mends far more than a word shouted across a room, and it asks far more in return: your whole action, and standing close enough to touch." },
    { id: "detect_magic", name: "Detect Magic", level: 1, schools: "Divination",
      time: "Action (ritual)", range: "Self, all around", components: "V, S", duration: "Concentration, ten minutes",
      text: "A moment's focus, and every working nearby—wards, curses, blessings—reveals itself to your sight as a shimmer only you can see. Stone and lead hide it; most doors do not, which makes it as useful before a room as inside one." },
    { id: "disguise_self", name: "Disguise Self", level: 1, schools: "Illusion",
      time: "Action", range: "Self", components: "V, S", duration: "An hour",
      text: "A verse under your breath, and your face and voice blur into someone else's for as long as you need them to. The change is only seen and heard—a hand laid on you finds you unchanged." },
    { id: "dissonant_whispers", name: "Dissonant Whispers", level: 1, schools: "Enchantment",
      time: "Action", components: "V", duration: "Instantaneous",
      text: "A whispered dissonance planted directly in someone's mind, ugly enough that they flinch and recoil before they understand why. It wounds, and a target that fails to hold its nerve breaks away from you." },
    { id: "ensnaring_strike", name: "Ensnaring Strike", level: 1, schools: "Conjuration",
      time: "Bonus action", range: "Self", components: "V", duration: "Concentration, a minute",
      text: "Thorned vines burst from your next weapon blow and bind whoever fails to tear free. Held fast, they can neither close with you nor get away, and the thorns work at them for as long as your concentration holds." },
    { id: "false_life", name: "False Life", level: 1, schools: "Necromancy",
      time: "Action", range: "Self", components: "V, S", duration: "Twelve hours",
      text: "A dark surge of unholy vitality drawn straight from the damp earth, granting a temporary shield of extra hit points. It lasts the better part of a day, so it is worth speaking before the work starts rather than once the blades are out." },
    { id: "feather_fall", name: "Feather Fall", level: 1, schools: "Transmutation",
      time: "Reaction, as you fall", range: "Far", components: "V", duration: "A minute",
      text: "Spoken in the moment the floor leaves you. Up to five falling creatures drift down like ash and take nothing from the landing. It has to be cast as you fall, so it answers the shaft you did not see, not the one you did." },
    { id: "grease", name: "Grease", level: 1, schools: "Conjuration",
      time: "Action", components: "V, S", duration: "Six rounds",
      text: "A patch of slick, caustic grease conjured across the ground where you point it. Whatever is standing there when it appears must keep its footing or go down, and every step taken in the slick afterward is a gamble." },
    { id: "healing_word", name: "Healing Word", level: 1, schools: "Evocation",
      time: "Bonus action", range: "Far", components: "V", duration: "Instantaneous",
      text: "A single, sharp word of command that knits a wound shut and puts fight back into a dying comrade's eyes. It mends little, but it mends it from across the room, and it still leaves you your action." },
    { id: "hellish_rebuke", name: "Hellish Rebuke", level: 1, schools: "Evocation",
      time: "Reaction, when wounded", range: "Far", components: "V, S", duration: "Instantaneous",
      text: "A vengeful retort held ready, so whoever next wounds you answers for it in hellfire, burned in the moment they hurt you. You must be hurt first for it to answer at all: a poor opening, and a fine reply." },
    { id: "hex", name: "Hex", level: 1, schools: "Enchantment",
      time: "Bonus action", components: "V, S", duration: "Ten rounds",
      text: "A murmured curse bound to one target for ten rounds. Each attack-roll hit against it deals another 1d6 necrotic damage, and if it falls you can move the curse to someone else with a bonus action." },
    { id: "hunters_mark", name: "Hunter's Mark", level: 1, schools: "Divination",
      time: "Bonus action", components: "V", duration: "Concentration, a minute",
      text: "You pick your quarry out of the field and your eye stays on it. Each weapon hit on that one target deals an extra 1d6 force damage while the mark holds; if the quarry falls, you can move the mark to another." },
    { id: "identify", name: "Identify", level: 1, schools: "Divination",
      time: "A minute (ritual)", range: "Touch", components: "V, S", duration: "Instantaneous",
      text: "An unhurried reading of an object's making, which gives up what it does and what it would take to wake it. A curse hides from this—it tells you what a thing is for, not what it wants." },
    { id: "jump", name: "Jump", level: 1, schools: "Transmutation",
      time: "Bonus action", range: "Touch", components: "V, S", duration: "A minute",
      text: "A word and a touch, and a stride carries three times as far as it should. It does nothing for the landing, and nothing for the run-up you still need: a long drop at the far end is still a long drop." },
    { id: "mage_armor", name: "Mage Armor", level: 1, schools: "Abjuration",
      time: "Action", range: "Self", components: "V, S", duration: "A day",
      text: "An unseen sheath of force laid over your own body, setting Armor Class to 13 plus the Dexterity modifier. It sits only on someone wearing no armor, a helmet included, and it lasts a full day, so speak it before you set out." },
    { id: "magic_missile", name: "Magic Missile", level: 1, schools: "Evocation",
      time: "Action", components: "V, S", duration: "Instantaneous",
      text: "Three darts of pure force that leave your hand and simply arrive. They never miss and never roll to hit, which makes this the working for finishing something nearly down, or for reaching what you could not otherwise strike." },
    { id: "ray_of_sickness", name: "Ray of Sickness", level: 1, schools: "Necromancy",
      time: "Action", components: "V, S", duration: "Instantaneous",
      text: "A sickly green ray of raw poison that leaves whatever it strikes nauseated and reeling long after the light fades, too slow and sick to answer the blow that follows." },
    { id: "shield", name: "Shield", level: 1, schools: "Abjuration",
      time: "Reaction, when struck", range: "Self", components: "V, S", duration: "One round",
      text: "An invisible barrier snapped into place between you and a blow already on its way. Your Armor Class jumps until your next turn, often enough to turn the hit that caused you to cast it." },
    { id: "speak_with_animals", name: "Speak with Animals", level: 1, schools: "Divination",
      time: "Action (ritual)", range: "Self", components: "V, S", duration: "Ten minutes",
      text: "For a short while, every beast's chatter and posture resolves into something close enough to words. They answer as beasts do—what they saw, what frightened them, what smelled of food." },
    { id: "thunderwave", name: "Thunderwave", level: 1, schools: "Evocation",
      time: "Action", range: "Self, all around", components: "V, S", duration: "Instantaneous",
      text: "A wave of thunderous force rolls out from you in every direction, hard enough to lift what it catches off its feet. It wounds what stands close and throws it back a step; what braces for it takes the noise and holds its ground." },
    { id: "unseen_servant", name: "Unseen Servant", level: 1, schools: "Conjuration",
      time: "Action (ritual)", range: "Far", components: "V, S", duration: "An hour",
      text: "An invisible, mindless force you can summon to fetch, carry, clean, or open things at your spoken command. It has no wits and no courage: it will not fight, and it cannot be ordered to." },

    // ── 2nd-level spells ───────────────────────────────────────────────
    { id: "blindness", name: "Blindness", level: 2, schools: "Transmutation",
      time: "Action", components: "V", duration: "A minute",
      text: "A sudden dark that drops over one foe's eyes. While it lasts, their blows swing blind with disadvantage and every strike against them comes easier, until their body fights the working off." },
    { id: "web", name: "Web", level: 2, schools: "Conjuration",
      time: "Action", components: "V, S, M", duration: "Concentration, up to an hour",
      text: "A mass of thick, sticky strands that spills over one spot and clings to everything standing there. Anything caught is stuck fast until it tears free, and the webbing slows whoever walks through it for as long as you hold the spell." },
    { id: "hold_person", name: "Hold Person", level: 2, schools: "Enchantment",
      time: "Action", components: "V, S, M", duration: "Concentration, a minute",
      text: "A binding word that seizes every muscle of one person and locks them in place. While the hold lasts they lose their turns and every blow against them comes easier, until their will breaks it. It takes hold only of people, never beasts or the dead." },
    { id: "shatter", name: "Shatter", level: 2, schools: "Evocation",
      time: "Action", components: "V, S, M", duration: "Instantaneous",
      text: "A painfully loud crack of sound that bursts around one foe and rattles everything standing with them. What braces takes the edge of the noise; what fails takes the full force, and things built rather than born take it worst." },
    { id: "scorching_ray", name: "Scorching Ray", level: 2, schools: "Evocation",
      time: "Action", components: "V, S", duration: "Instantaneous",
      text: "Three thin lines of fire that leave your hand together and split in the air. Each ray is aimed on its own, at one foe or several, and each one hits or misses by itself." }
  ];

  // The stat fields that can hold a spell id. The sidebar reads all of them rather than branching on
  // class, so a character shows one combined list however their magic was acquired (a Hexblood's innate
  // race_cantrip_2 sits alongside their class picks, exactly as combat reads it). Order barely matters:
  // the panel files each entry under its spell level's tab, so these only set the order within one tab.
  //
  // CANTRIP_SLOTS is hand-written: a cantrip is not a book slot, it is one fixed field per source
  // (the race, an item, the class's picks at creation), so there is nothing to generate from.
  var CANTRIP_SLOTS = [
    "race_cantrip", "race_cantrip_2", "item_cantrip",
    "warlock_cantrip", "warlock_cantrip_2",
    "wizard_cantrip", "wizard_cantrip_2", "wizard_cantrip_3",
    "bard_cantrip", "bard_cantrip_2"
  ];

  // BOOK_SLOTS is every leveled-spell slot of every casting class. It used to be hand-written here and
  // silently went stale: tools/spell_book.json raised the wizard to 12 slots, the warlock to 6 and the
  // bard to 8, while this list still stopped at slot 3, so a bard's fourth and fifth verse and a
  // warlock's third pact spell were learned and castable but invisible in the panel. It is generated
  // now, from the same file learn_spell and the *create block come from, so it cannot drift again.
  // Run: node tools/gen_spell_book.js      Never edit inside the block.
  // GEN:BEGIN spell_book_js_slots
  var BOOK_SLOTS = [
    "wizard_spell", "wizard_spell_2", "wizard_spell_3", "wizard_spell_4", "wizard_spell_5", "wizard_spell_6", "wizard_spell_7", "wizard_spell_8", "wizard_spell_9", "wizard_spell_10", "wizard_spell_11", "wizard_spell_12",
    "warlock_spell", "warlock_spell_2", "warlock_spell_3", "warlock_spell_4", "warlock_spell_5", "warlock_spell_6",
    "bard_spell", "bard_spell_2", "bard_spell_3", "bard_spell_4", "bard_spell_5", "bard_spell_6", "bard_spell_7", "bard_spell_8",
    "ranger_spell", "ranger_spell_2", "ranger_spell_3"
  ];
  // GEN:END spell_book_js_slots

  // COPYING A SCROLL INTO THE BOOK: what the spellbook panel needs to show which of the scrolls in a pack could be written in, and what
  // each would cost in training. Display only -- copy_spell (character_progression.txt) re-checks every rule before anything is written.
  // Generated from tools/spell_book.json and tools/gear_catalog.json. Run: node tools/gen_spell_book.js      Never edit inside the block.
  // GEN:BEGIN spell_book_js_copy
  // Which classes may learn each spell, from tools/spell_book.json. The pick menus and the copying rule read the same lists.
  var SPELL_LISTS = {
      "absorb_elements": ["wizard","ranger"],
    "ray_of_sickness": ["wizard"],
    "alarm": ["wizard","ranger"],
    "arms_of_hadar": ["warlock"],
    "hellish_rebuke": ["warlock"],
    "cause_fear": ["wizard","warlock"],
    "armor_of_agathys": ["warlock"],
    "bane": ["bard"],
    "charm_person": ["bard"],
    "comprehend_languages": ["wizard","warlock","bard"],
    "cure_wounds": ["bard","ranger"],
    "detect_magic": ["wizard","bard","ranger"],
    "disguise_self": ["bard"],
    "dissonant_whispers": ["bard"],
    "false_life": ["wizard","warlock"],
    "feather_fall": ["wizard"],
    "grease": ["wizard"],
    "healing_word": ["bard"],
    "hex": ["warlock"],
    "ensnaring_strike": ["ranger"],
    "hunters_mark": ["ranger"],
    "identify": ["wizard"],
    "jump": ["wizard","ranger"],
    "mage_armor": ["wizard"],
    "magic_missile": ["wizard"],
    "shield": ["wizard"],
    "speak_with_animals": ["bard","ranger"],
    "burning_hands": ["wizard"],
    "thunderwave": ["wizard","bard"],
    "unseen_servant": ["warlock"],
    "blindness": ["bard","wizard"],
    "hold_person": ["wizard","bard","warlock"],
    "web": ["wizard"],
    "shatter": ["wizard","bard","warlock"],
    "scorching_ray": ["wizard"]
    };
  var SPELL_LEVELS = {
      "absorb_elements": 1,
    "ray_of_sickness": 1,
    "alarm": 1,
    "arms_of_hadar": 1,
    "hellish_rebuke": 1,
    "cause_fear": 1,
    "armor_of_agathys": 1,
    "bane": 1,
    "charm_person": 1,
    "comprehend_languages": 1,
    "cure_wounds": 1,
    "detect_magic": 1,
    "disguise_self": 1,
    "dissonant_whispers": 1,
    "false_life": 1,
    "feather_fall": 1,
    "grease": 1,
    "healing_word": 1,
    "hex": 1,
    "ensnaring_strike": 1,
    "hunters_mark": 1,
    "identify": 1,
    "jump": 1,
    "mage_armor": 1,
    "magic_missile": 1,
    "shield": 1,
    "speak_with_animals": 1,
    "burning_hands": 1,
    "thunderwave": 1,
    "unseen_servant": 1,
    "blindness": 2,
    "hold_person": 2,
    "web": 2,
    "shatter": 2,
    "scorching_ray": 2
    };
  var SPELL_CONCENTRATION = {
      "blade_ward": true,
    "cause_fear": true,
    "bane": true,
    "hex": true,
    "ensnaring_strike": true,
    "hunters_mark": true,
    "hold_person": true,
    "web": true
    };
  // Combat facts and schools generated from tools/spell_book.json (cantrips + learnable).
  var SPELL_FACTS = {
      "blade_ward": {"name":"Blade Ward","level":0,"school":"Abjuration","concentration":true,"combat":{"cost":"action","slot_level":0,"resolution":"effect","duration":"Up to 10 rounds","area":"Self","effect":"-1d4 to enemy attack rolls against you","target":"self"}},
    "fire_bolt": {"name":"Fire Bolt","level":0,"school":"Evocation","range":"ranged","reach":"long","combat":{"cost":"action","slot_level":0,"resolution":"attack","attack_kind":"ranged_spell","damage_dice":"1d10","cantrip_scale":{"5":{"damage_dice":"2d10"},"11":{"damage_dice":"3d10"},"17":{"damage_dice":"4d10"}},"damage_type":"fire","add_casting_mod":false,"duration":"Instantaneous","target":"one","npc_lines":true}},
    "ray_of_frost": {"name":"Ray of Frost","level":0,"school":"Evocation","range":"ranged","reach":"medium","combat":{"cost":"action","slot_level":0,"resolution":"attack","attack_kind":"ranged_spell","damage_dice":"1d8","cantrip_scale":{"5":{"damage_dice":"2d8"},"11":{"damage_dice":"3d8"},"17":{"damage_dice":"4d8"}},"damage_type":"cold","add_casting_mod":false,"duration":"Instantaneous","effect":"Slowed: target cannot Dash on its next turn","target":"one","condition":"slowed","npc_lines":true}},
    "eldritch_blast": {"name":"Eldritch Blast","level":0,"school":"Evocation","range":"ranged","reach":"long","combat":{"cost":"action","slot_level":0,"resolution":"attack","attack_kind":"ranged_spell","damage_dice":"1d10","projectiles":1,"cantrip_scale":{"5":{"projectiles":2},"11":{"projectiles":3},"17":{"projectiles":4}},"damage_type":"force","add_casting_mod":false,"duration":"Instantaneous","target":"one","npc_lines":true}},
    "chill_touch": {"name":"Chill Touch","level":0,"school":"Necromancy","range":"ranged","reach":"medium","combat":{"cost":"action","slot_level":0,"resolution":"attack","attack_kind":"ranged_spell","damage_dice":"1d8","cantrip_scale":{"5":{"damage_dice":"2d8"},"11":{"damage_dice":"3d8"},"17":{"damage_dice":"4d8"}},"damage_type":"necrotic","add_casting_mod":false,"duration":"Instantaneous","target":"one","npc_lines":true}},
    "vicious_mockery": {"name":"Vicious Mockery","level":0,"school":"Enchantment","range":"ranged","reach":"medium","combat":{"cost":"action","slot_level":0,"resolution":"save","save_ability":"wisdom","half_on_save":false,"damage_dice":"1d4","cantrip_scale":{"5":{"damage_dice":"2d4"},"11":{"damage_dice":"3d4"},"17":{"damage_dice":"4d4"}},"damage_type":"psychic","add_casting_mod":false,"duration":"1 round","effect":"Target has disadvantage on its next attack","target":"one"}},
    "poison_spray": {"name":"Poison Spray","level":0,"school":"Necromancy","range":"ranged","reach":"medium","combat":{"cost":"action","slot_level":0,"resolution":"save","save_ability":"constitution","half_on_save":false,"damage_dice":"1d12","cantrip_scale":{"5":{"damage_dice":"2d12"},"11":{"damage_dice":"3d12"},"17":{"damage_dice":"4d12"}},"damage_type":"poison","add_casting_mod":false,"duration":"Instantaneous","target":"one","npc_lines":true}},
    "shocking_grasp": {"name":"Shocking Grasp","level":0,"school":"Evocation","range":"touch","reach":"touch","combat":{"cost":"action","slot_level":0,"resolution":"attack","attack_kind":"melee_spell","damage_dice":"1d8","cantrip_scale":{"5":{"damage_dice":"2d8"},"11":{"damage_dice":"3d8"},"17":{"damage_dice":"4d8"}},"damage_type":"lightning","add_casting_mod":false,"duration":"Instantaneous","effect":"Target cannot take reactions this round; advantage vs. metal armor","target":"one","npc_lines":true}},
    "booming_blade": {"name":"Booming Blade","level":0,"school":"Evocation","combat":{"cost":"action","slot_level":0,"resolution":"effect","attack_kind":"weapon","damage_type":"thunder","duration":"1 round","cantrip_scale":{"5":{"on_hit_dice":"1d8","on_move_dice":"2d8"},"11":{"on_hit_dice":"2d8","on_move_dice":"3d8"},"17":{"on_hit_dice":"3d8","on_move_dice":"4d8"}},"base_move_dice":"1d8","effect":"Melee weapon attack; sheathes target in thunder that bursts if it moves"}},
    "true_strike": {"name":"True Strike","level":0,"school":"Divination","combat":{"cost":"action","slot_level":0,"resolution":"effect","attack_kind":"weapon","add_casting_mod":true,"duration":"Instantaneous","cantrip_scale":{"5":{"extra_dice":"1d6"},"11":{"extra_dice":"2d6"},"17":{"extra_dice":"3d6"}},"effect":"Weapon attack using casting ability"}},
    "control_flames": {"name":"Control Flames","level":0,"school":"Transmutation","combat":{"cost":"action","slot_level":0,"resolution":"effect","duration":"Instantaneous","effect":"Spread fire from a burning foe to others on its tile"}},
    "absorb_elements": {"name":"Absorb Elements","level":1,"school":"Abjuration","combat":{"cost":"reaction","slot_level":1,"resolution":"effect","damage_dice":"1d6","upcast":{"damage_dice":"1d6"},"duration":"1 round","area":"Self","effect":"Resists triggering acid/cold/fire/lightning/thunder hit and adds +1d6 to next melee hit","target":"self"}},
    "ray_of_sickness": {"name":"Ray of Sickness","level":1,"school":"Necromancy","range":"ranged","reach":"medium","combat":{"cost":"action","slot_level":1,"resolution":"attack","attack_kind":"ranged_spell","damage_dice":"2d8","damage_type":"poison","add_casting_mod":false,"upcast":{"damage_dice":"1d8"},"duration":"Instantaneous","effect":"Poisoned: disadvantage on next attack","target":"one","npc_lines":true}},
    "alarm": {"name":"Alarm","level":1,"school":"Abjuration","combat":{"cost":"minute","slot_level":1,"resolution":"effect","duration":"8 hours","area":"Near","effect":"Alerts you when the warded threshold is crossed"}},
    "arms_of_hadar": {"name":"Arms of Hadar","level":1,"school":"Conjuration","reach":"touch","combat":{"cost":"action","slot_level":1,"resolution":"save","save_ability":"strength","half_on_save":true,"damage_dice":"2d6","damage_type":"necrotic","add_casting_mod":false,"upcast":{"damage_dice":"1d6"},"duration":"Instantaneous","area":"All engaged foes","effect":"Failed targets lose reactions this round","target":"engaged"}},
    "hellish_rebuke": {"name":"Hellish Rebuke","level":1,"school":"Evocation","combat":{"cost":"reaction","slot_level":1,"resolution":"save","save_ability":"dexterity","half_on_save":true,"damage_dice":"2d10","damage_type":"fire","add_casting_mod":false,"upcast":{"damage_dice":"1d10"},"duration":"Instantaneous","effect":"Scorches the attacker when you take damage","target":"one"}},
    "cause_fear": {"name":"Cause Fear","level":1,"school":"Necromancy","concentration":true,"range":"ranged","reach":"medium","combat":{"cost":"action","slot_level":1,"resolution":"save","save_ability":"wisdom","upcast":{"targets":1},"duration":"Up to 10 rounds","effect":"Frightened: disadvantage on attacks and will not move closer","target":"one","condition":"frightened"}},
    "armor_of_agathys": {"name":"Armor of Agathys","level":1,"school":"Abjuration","combat":{"cost":"action","slot_level":1,"resolution":"effect","temp_hp_flat":5,"damage_flat":5,"damage_type":"cold","upcast":{"temp_hp_flat":5,"damage_flat":5},"duration":"While temp HP lasts","area":"Self","effect":"5 cold damage to melee attackers while temp HP lasts","target":"self"}},
    "bane": {"name":"Bane","level":1,"school":"Enchantment","concentration":true,"range":"ranged","reach":"medium","combat":{"cost":"action","slot_level":1,"resolution":"save","save_ability":"charisma","targets":3,"upcast":{"targets":1},"duration":"Up to 10 rounds","area":"Up to 3 foes","effect":"Target subtracts 1d4 from attacks and saves","target":"several"}},
    "charm_person": {"name":"Charm Person","level":1,"school":"Enchantment","combat":{"cost":"action","slot_level":1,"resolution":"save","save_ability":"wisdom","duration":"1 hour","area":"Near","effect":"Target regards you as friendly until harmed or spell ends","target":"one"}},
    "comprehend_languages": {"name":"Comprehend Languages","level":1,"school":"Divination","combat":{"cost":"action","slot_level":1,"resolution":"effect","duration":"1 hour","area":"Self","effect":"Understand spoken and written languages"}},
    "cure_wounds": {"name":"Cure Wounds","level":1,"school":"Abjuration","reach":"touch","combat":{"cost":"action","slot_level":1,"resolution":"heal","heal_dice":"2d8","add_casting_mod":true,"upcast":{"damage_dice":"2d8"},"duration":"Instantaneous","area":"Self or engaged ally","target":"ally"}},
    "detect_magic": {"name":"Detect Magic","level":1,"school":"Divination","combat":{"cost":"action","slot_level":1,"resolution":"effect","duration":"Up to 10 minutes","area":"Self","effect":"Sense nearby magical workings"}},
    "disguise_self": {"name":"Disguise Self","level":1,"school":"Illusion","combat":{"cost":"action","slot_level":1,"resolution":"effect","duration":"1 hour","area":"Self","effect":"Illusory change of face, voice, and dress"}},
    "dissonant_whispers": {"name":"Dissonant Whispers","level":1,"school":"Enchantment","range":"ranged","reach":"medium","combat":{"cost":"action","slot_level":1,"resolution":"save","save_ability":"wisdom","half_on_save":true,"damage_dice":"3d6","damage_type":"psychic","add_casting_mod":true,"upcast":{"damage_dice":"1d6"},"duration":"Instantaneous","effect":"On a failed save, target uses its reaction to move 1 step away (provokes opportunity attacks)","target":"one"}},
    "false_life": {"name":"False Life","level":1,"school":"Necromancy","combat":{"cost":"action","slot_level":1,"resolution":"effect","temp_hp_dice":"1d4","temp_hp_flat":4,"upcast":{"temp_hp_flat":5},"duration":"12 hours","area":"Self","effect":"Temporary HP (does not stack)","target":"self"}},
    "feather_fall": {"name":"Feather Fall","level":1,"school":"Transmutation","combat":{"cost":"reaction","slot_level":1,"resolution":"effect","duration":"1 minute","area":"Far","effect":"Slow fall; negates falling damage"}},
    "grease": {"name":"Grease","level":1,"school":"Conjuration","range":"ranged","reach":"medium","combat":{"cost":"action","slot_level":1,"resolution":"save","save_ability":"dexterity","duration":"6 rounds (3 moves)","area":"Target band","effect":"Prone on fail; DC 10 DEX check to move; advantage on fire attacks","target":"spot"}},
    "healing_word": {"name":"Healing Word","level":1,"school":"Abjuration","reach":"long","combat":{"cost":"bonus","slot_level":1,"resolution":"heal","heal_dice":"2d4","add_casting_mod":true,"upcast":{"damage_dice":"2d4"},"duration":"Instantaneous","area":"Self or ally (far)","target":"ally"}},
    "hex": {"name":"Hex","level":1,"school":"Enchantment","concentration":true,"range":"ranged","reach":"medium","combat":{"cost":"bonus","slot_level":1,"resolution":"effect","damage_dice":"1d6","damage_type":"necrotic","duration":"Up to 10 rounds","effect":"+1d6 necrotic on your attack-roll hits; movable as bonus action when target falls","target":"one"}},
    "ensnaring_strike": {"name":"Ensnaring Strike","level":1,"school":"Conjuration","concentration":true,"combat":{"cost":"bonus","slot_level":1,"resolution":"effect","save_ability":"strength","damage_dice":"1d6","damage_type":"piercing","duration":"Up to 10 rounds","effect":"Next weapon hit forces STR save (Large+ advantage) or Restrained: 1d6 piercing/turn & advantage against it"}},
    "hunters_mark": {"name":"Hunter's Mark","level":1,"school":"Divination","concentration":true,"range":"ranged","reach":"medium","combat":{"cost":"bonus","slot_level":1,"resolution":"effect","damage_dice":"1d6","damage_type":"force","duration":"Up to 10 rounds","effect":"+1d6 force on your weapon hits; movable as bonus action when target falls","target":"one"}},
    "identify": {"name":"Identify","level":1,"school":"Divination","combat":{"cost":"minute","slot_level":1,"resolution":"effect","duration":"Instantaneous","area":"Touch","effect":"Reveal an item or object properties"}},
    "jump": {"name":"Jump","level":1,"school":"Transmutation","combat":{"cost":"bonus","slot_level":1,"resolution":"effect","duration":"1 minute","area":"Touch","effect":"Triple jump distance"}},
    "mage_armor": {"name":"Mage Armor","level":1,"school":"Abjuration","combat":{"cost":"action","slot_level":1,"resolution":"effect","duration":"24 hours","area":"Self (unarmored)","effect":"Base AC 13 + DEX modifier","target":"self"}},
    "magic_missile": {"name":"Magic Missile","level":1,"school":"Evocation","range":"ranged","reach":"long","combat":{"cost":"action","slot_level":1,"resolution":"auto","damage_dice":"1d4","damage_flat":1,"damage_type":"force","projectiles":3,"upcast":{"projectiles":1},"add_casting_mod":false,"duration":"Instantaneous","target":"one"}},
    "shield": {"name":"Shield","level":1,"school":"Abjuration","combat":{"cost":"reaction","slot_level":1,"resolution":"effect","duration":"1 round","area":"Self","effect":"+5 AC vs. a hit that it can deflect, until start of your next turn","target":"self"}},
    "speak_with_animals": {"name":"Speak with Animals","level":1,"school":"Divination","combat":{"cost":"action","slot_level":1,"resolution":"effect","duration":"10 minutes","area":"Self","effect":"Understand and speak with beasts"}},
    "burning_hands": {"name":"Burning Hands","level":1,"school":"Evocation","reach":"touch","combat":{"cost":"action","slot_level":1,"resolution":"save","save_ability":"dexterity","half_on_save":true,"damage_dice":"3d6","damage_type":"fire","add_casting_mod":false,"upcast":{"damage_dice":"1d6"},"duration":"Instantaneous","area":"All engaged foes","target":"engaged","npc_lines":true}},
    "thunderwave": {"name":"Thunderwave","level":1,"school":"Evocation","reach":"touch","combat":{"cost":"action","slot_level":1,"resolution":"save","save_ability":"constitution","half_on_save":true,"damage_dice":"2d8","damage_type":"thunder","add_casting_mod":false,"upcast":{"damage_dice":"1d8"},"duration":"Instantaneous","area":"All engaged foes","effect":"Pushes Large or smaller targets 1 step back on failed save","target":"engaged"}},
    "unseen_servant": {"name":"Unseen Servant","level":1,"school":"Conjuration","combat":{"cost":"action","slot_level":1,"resolution":"effect","duration":"1 hour","area":"Far","effect":"Invisible mindless force for simple tasks"}},
    "blindness": {"name":"Blindness","level":2,"school":"Necromancy","range":"ranged","reach":"long","combat":{"cost":"action","slot_level":2,"resolution":"save","save_ability":"constitution","duration":"Up to 10 rounds","effect":"Blinded: disadvantage on attacks, attacks against have advantage; repeats save end of turn","target":"one","condition":"blinded","npc_lines":true}},
    "hold_person": {"name":"Hold Person","level":2,"school":"Enchantment","concentration":true,"range":"ranged","reach":"medium","combat":{"cost":"action","slot_level":2,"resolution":"save","save_ability":"wisdom","upcast":{"targets":1},"duration":"Up to 10 rounds","effect":"Paralyzed: loses its turns, attacks against it have advantage, fails Strength and Dexterity saves; humanoids only","target":"one","condition":"paralyzed","only_type":"humanoid"}},
    "web": {"name":"Web","level":2,"school":"Conjuration","concentration":true,"range":"ranged","reach":"medium","combat":{"cost":"action","slot_level":2,"resolution":"save","save_ability":"dexterity","duration":"While you concentrate","area":"The target's spot, as a lasting patch of difficult terrain","effect":"Restrained on a failed Dexterity save, when cast and when a foe starts its turn in the webs or walks into them; a Strength check against your spell DC tears free","target":"spot","condition":"restrained"}},
    "shatter": {"name":"Shatter","level":2,"school":"Evocation","range":"ranged","reach":"medium","combat":{"cost":"action","slot_level":2,"resolution":"save","save_ability":"constitution","half_on_save":true,"damage_dice":"3d8","damage_type":"thunder","add_casting_mod":false,"upcast":{"damage_dice":"1d8"},"duration":"Instantaneous","area":"The target and every foe at its spot","effect":"Constructs have disadvantage on the save","target":"spot"}},
    "scorching_ray": {"name":"Scorching Ray","level":2,"school":"Evocation","range":"ranged","reach":"long","combat":{"cost":"action","slot_level":2,"resolution":"attack","attack_kind":"ranged_spell","damage_dice":"2d6","damage_type":"fire","add_casting_mod":false,"projectiles":3,"upcast":{"projectiles":1},"duration":"Instantaneous","target":"one","npc_lines":true}}
    };
  // A scroll an item grants, keyed by the spell it carries (from tools/gear_catalog.json effect.spell). A spell with no scroll
  // simply never appears among the loose leaves.
  var SPELL_SCROLLS = {
      "bane": "scroll_bane",
    "burning_hands": "scroll_burning_hands",
    "charm_person": "scroll_charm_person",
    "detect_magic": "scroll_detect_magic",
    "false_life": "scroll_false_life",
    "grease": "scroll_grease",
    "healing_word": "scroll_healing_word",
    "hold_person": "scroll_hold_person",
    "jump": "scroll_jump",
    "mage_armor": "scroll_mage_armor",
    "magic_missile": "scroll_magic_missile",
    "remove_curse": "scroll_remove_curse",
    "scorching_ray": "scroll_scorching_ray",
    "shatter": "scroll_shatter",
    "speak_with_animals": "scroll_speak_with_animals",
    "thunderwave": "scroll_thunderwave",
    "web": "scroll_web"
    };
  var COPY_COST_PER_LEVEL = 10;
  var COPY_CLASSES = ["wizard"];
  // GEN:END spell_book_js_copy

  var SPELL_SLOTS = CANTRIP_SLOTS.concat(BOOK_SLOTS);

  var byId = {};
  SPELL_DATA.forEach(function (sp) { byId[sp.id] = sp; });

  window.SPELL_DATA = SPELL_DATA;
  window.SPELL_SLOTS = SPELL_SLOTS;
  // The two halves are published as well: equipment-panel.js recomputes known_<id> from the slots and
  // must not keep a second list of its own (it kept one, and it went stale the same way).
  window.CANTRIP_SLOTS = CANTRIP_SLOTS;
  window.BOOK_SLOTS = BOOK_SLOTS;
  window.SPELL_LISTS = SPELL_LISTS;
  window.SPELL_LEVELS = SPELL_LEVELS;
  window.SPELL_CONCENTRATION = SPELL_CONCENTRATION;
  window.SPELL_FACTS = SPELL_FACTS;
  window.SPELL_SCROLLS = SPELL_SCROLLS;
  window.COPY_COST_PER_LEVEL = COPY_COST_PER_LEVEL;
  window.COPY_CLASSES = COPY_CLASSES;
  window.spellById = function (id) { return byId[id] || null; };
})();
