/*
 * names-data.js: the name generator's lists and its one function, NameGen.make.
 *
 * A scene calls it through scenes/names.txt (label name_make). The same race, gender, region and seed always give the
 * same name, so a quest keeps ONE number (a seed) instead of a name string, and asks again whenever it needs the name:
 * on the posting, at the door, at the reward. A page refresh cannot change a name, because nothing here is random.
 *
 *   NameGen.make("human", "f", "port", 1007)  ->  { first: "Marta", last: "Weaver", full: "Marta Weaver" }
 *
 * race    "human", "dwarf", "elf", "halfling", "half_orc", "half_elf" or "tiefling". An unknown race throws, so a typo is found while
 *         writing, not by a player. Half-orcs have a single name and no surname.
 * gender  "m", "f", or "any" (the seed picks one).
 * region  which surnames are in play: "port" (Port Valen), "marches" (the Grey Marches), "any" (all of them). Only humans have
 *         regional surnames; every other race has one list, so any region works for them.
 * seed    any whole number. A radiant posting uses its five-day block; a one-off person stores a number once.
 *
 * Two more calls go with it:
 *   NameGen.pickRace(seed, "middle_ward")   a race for one person, weighted by the place ("middle_ward", "quarter", "docks")
 *   NameGen.look("dwarf", "f", seed, "clothes hands")   (the last argument is optional: details to leave out)
 *   ... returns                              { phrase: "a stocky dwarven woman", detail: "with iron-grey braids pinned up",
 *                                              full: "A stocky dwarven woman with iron-grey braids pinned up" }
 *   NameGen.roll(seed, salt, 6)               a whole number 0-5, one more independent choice (a building, a creature)
 * The same seed gives the same person from all three, so a quest keeps one number for the name, the race and the look.
 *
 * Names that belong to a named character in the game are never generated: see RESERVED.
 * The lists came from quest/Random Name Generator.md, curated: numbering, duplicates and names that did not fit are cut.
 */
(function (root) {
  "use strict";

  // Every named person the player can already meet, first or last name. The generator skips these.
  var RESERVED = ["Kestrel", "Tolliver", "Ysolde", "Varren", "Vane", "Voss", "Thale", "Elric", "Halda", "Ambrose", "Hollis",
    "Vael", "Lyra", "Karr", "Skell", "Gault", "Rorik", "Odessa", "Bran", "Brant", "Hendryk", "Torvald", "Janna", "Maura",
    "Talia", "Morzan", "Rennick", "Farrow", "Marda", "Corwen", "Oswin", "Maret"];

  var HUMAN = {
    male: [
      "Ander", "Darvin", "Grigor", "Malark", "Renne", "Anton", "Dorn", "Gunner", "Marcon", "Romero", "Bor", "Elijah", "Gunthar",
      "Menard", "Taman", "Borivik", "Gaillard", "Jandar", "Otmar", "Tedric", "Bran", "Garrison", "Janko", "Pieron", "Toldek",
      "Carsten", "Geth", "Khemed", "Ramas", "Warrick", "Colan", "Gorstag", "Lander", "Ramoth", "Winston",
      "Darion", "Alistair", "Garrett", "Bram", "Cedric", "Eric", "Felix", "Gideon", "Hugo", "Kenneth", "Lucas", "Myles", "Nolan",
      "Orin", "Quentin", "Raymond", "Silas", "Tristram", "Ulric", "Vance", "Walter", "Yorick", "Alden", "Beric", "Cassian",
      "Edmund", "Francis", "Gavin", "Hal", "Idris", "Julian", "Kellan", "Leif", "Merrick", "Nash", "Owen", "Pascal", "Roland",
      "Soren", "Tobin", "Urban", "Vaughn", "Wade"
    ],
    female: [
      "Angeline", "Dona", "Kathleen", "Maira", "Atala", "Elena", "Kaya", "Marta", "Priska", "Betha", "Esvele", "Keri", "Maura",
      "Rena", "Cefrey", "Fara", "Miri", "Rose", "Celia", "Jasmal", "Kethra", "Narla", "Urtha", "Chloris", "Joscelyn", "Leoba",
      "Olma", "Violet", "Clara", "Joy", "Livvi", "Patience",
      "Ada", "Bianca", "Cora", "Daphne", "Evangeline", "Freya", "Greta", "Hannah", "Iona", "Katherina", "Lucinda", "Marceline",
      "Nadine", "Odette", "Phoebe", "Rae", "Ramona", "Sabrina", "Tallulah", "Ursuline", "Vivian", "Winona", "Yvotte", "Zada",
      "Amity", "Bryn", "Cassia", "Dove", "Fay", "Gemma", "Hope", "Jewell", "Lark", "Maren", "Pearl", "Raven", "Sage", "Tove",
      "Vesper", "Winter", "Amara", "Linnea", "Corina", "Rosalind", "Saffron", "Tressa"
    ],
    surnames: {
      // Named for a trade. Port Valen is full of them.
      trade: ["Baker", "Carver", "Fisher", "Glover", "Joiner", "Mason", "Reeve", "Shepherd", "Tanner", "Weaver", "Fletcher",
        "Mercer", "Hunter", "Locke", "Knight", "Palmer", "Keller", "Jager"],
      // Named for a place on the ground: a ford, a hill, a lake.
      place: ["Bell", "Camp", "Dell", "Edge", "Ford", "Glen", "Hill", "Isle", "Kirk", "Lake", "Moor", "Park", "Shaw", "Trent",
        "Vale", "West", "York", "Cross", "Brook", "Upton", "Underhill", "Barrow", "Caldwell", "Galloway", "Holloway", "Langdon",
        "Oakley", "Whitfield", "Yardley", "Newhouse", "Elmsworth", "Eastbound", "Davenport", "Pemberton", "Ashworth", "Oakes"],
      // Plain family names, some from far shores. A port town has plenty of both.
      plain: ["Agosto", "Chernin", "Pashar", "Baveg", "Jenor", "Kilon", "Rhasser", "Bersk", "Dotsk", "Rodod", "Heno", "Helder",
        "Nocram", "Starag", "Rein", "Bekham", "Adler", "Castellan", "Vandermeer", "Zimmerman", "Zeiler", "Yeager", "Sinclair",
        "Lawson", "Jennings", "Ingram", "Randal", "Garret", "Naylor", "Ross", "Owen", "Quincy", "Quirk", "Albright", "Thorne",
        "Young", "Sterling", "Ivory", "Joy", "Drake", "Vance", "Winter"],
      // Joined words: older, harder names, the kind the Marches keep.
      compound: ["Brightman", "Eaglecut", "Lowguard", "Sagebane", "Amberfall", "Brightwood", "Evenwood", "Ashfallow", "Buckman",
        "Tallstag", "Barleymight", "Tarrenblade", "Underwitch", "Dawnridge", "Valor", "Lightspear", "Yellowbird", "Blackwood",
        "Everhart", "Foxglove", "Hawthorne", "Ironwood", "Morningstar", "Nightshade", "Ravenscroft", "Duskryn", "Caskhorn",
        "Queller"]
    },
    // Which surname groups each region draws from. A group listed once is one share of the pool, so lists are weighted by size.
    regions: {
      port: ["trade", "place", "plain"],
      marches: ["compound", "place", "trade"],
      any: ["trade", "place", "plain", "compound"]
    }
  };

  // Dwarves: a given name and a clan name.
  var DWARF = {
    male: ["Adrik", "Darrak", "Grammin", "Morgran", "Thoradin", "Alberich", "Delg", "Grenmar", "Orsik", "Baern", "Eberk", "Harbek",
      "Oskar", "Tordek", "Barendd", "Einkil", "Hardur", "Rangrim", "Traubon", "Brottor", "Fargrim", "Kildrak", "Regmus", "Ulfgar",
      "Flint", "Magdar", "Rurik", "Veit", "Gardain", "Melram", "Taklinn", "Vondal"],
    female: ["Amber", "Eldeth", "Hlin", "Ketsyl", "Riswynn", "Artin", "Eldille", "Jynra", "Kristryd", "Sannl", "Audhild", "Falkrunn",
      "Ingva", "Lasros", "Torbera", "Bardryn", "Finellin", "Kathra", "Liftrasa", "Tordelle", "Bellinn", "Gunnloda", "Karra", "Lyswin",
      "Torgga", "Dagnal", "Gurdis", "Katleen", "Mardred", "Tyssael", "Diesa", "Helja", "Ketris", "Redrielle", "Ungart"],
    surnames: { clan: ["Axebreaker", "Frostbeard", "Junipkil", "Oathseeker", "Stormhammer", "Balderk", "Frosthammer", "Kraghammer",
      "Redjaw", "Stormreaver", "Gorunn", "Kragjaw", "Rockbreaker", "Strakeln", "Birchstone", "Gritsword", "Loderr", "Rockhammer",
      "Torunn", "Brawnanvil", "Holderhek", "Lutgehr", "Rumnaheim", "Underbane", "Dankil", "Ironfist", "Silverbeard", "Undershield",
      "Fireforge", "Ironjaw", "Mountainhall", "Stormbreaker"] },
    regions: { any: ["clan"] }
  };

  // Elves: a given name and a family name.
  var ELF = {
    male: ["Adran", "Berrian", "Faelar", "Laucian", "Riardon", "Aelar", "Carric", "Gaelin", "Lysanthir", "Rolen", "Aien", "Delmuth",
      "Galinndan", "Mindartis", "Soveliss", "Aramil", "Elwin", "Hadarai", "Paelias", "Thamior", "Arranis", "Enialis", "Heian",
      "Paeral", "Tharivol", "Aust", "Erdan", "Himo", "Peren", "Theren", "Beiro", "Erevan", "Immeral", "Quarion", "Varis"],
    female: ["Adrie", "Birel", "Ielenia", "Meriele", "Shannairra", "Althaea", "Caelynn", "Jelenneth", "Shava", "Anastrianna",
      "Drusilia", "Kaylin", "Naivara", "Sharia", "Andraste", "Enna", "Quelenna", "Silaqui", "Antinua", "Esta", "Quillathe", "Soora",
      "Ava", "Faylen", "Leshanna", "Saria", "Thia", "Bethrynna", "Felosial", "Lia", "Sariel", "Valanthe"],
    surnames: { family: ["Ashgrove", "Gemblossom", "Moonbrook", "Oakstaff", "Starflower", "Gemflower", "Moonsnow", "Riverbreeze",
      "Stillhawk", "Dawnhorn", "Goldbrook", "Moonwhisper", "Runemaster", "Sunweaver", "Diamonddew", "Goldpetal", "Nightbreeze",
      "Silverfrond", "Windstar", "Echorn", "Greencloak", "Nightmeadow", "Silverhand", "Windwalker", "Eroth", "Irian", "Nightwing",
      "Silverspear", "Yhendorn", "Everlove", "Melruth", "Oakenpetal", "Slenderbow", "Yrindae"] },
    regions: { any: ["family"] }
  };

  // Halflings: a given name and a family name.
  var HALFLING = {
    male: ["Ander", "Arlos", "Barver", "Cade", "Corrin", "Eldon", "Erhorn", "Errich", "Faldon", "Finnan", "Garret", "Kaswan",
      "Lindal", "Linton", "Lyle", "Merric", "Milo", "Norwrick", "Orios", "Osborn", "Pankin", "Panner", "Perrin", "Reed", "Roscoe",
      "Tegin", "Wellby"],
    female: ["Andry", "Anwyn", "Bree", "Breelle", "Bremia", "Callie", "Chenda", "Cora", "Diana", "Euphemia", "Faymia", "Jillian",
      "Jaysica", "Kella", "Lavinia", "Ledove", "Lidda", "Merla", "Nedda", "Paela", "Portia", "Seraphina", "Shaena", "Trym", "Vani",
      "Verna"],
    surnames: { family: ["Brushgather", "Goodbarrel", "Greenbottle", "Highhill", "Hilltopple", "Leagallow", "Tealeaf", "Thorngage",
      "Tosscobble", "Underbough", "Feathershine", "Humblesun", "Hazelstream", "Ironflow", "Palebranch", "Raindraft", "Sunvale",
      "Turnvale", "Earthflower", "Cinderspark", "Starthorn"] },
    regions: { any: ["family"] }
  };

  // Half-orcs: a single name, no surname.
  var HALF_ORC = {
    male: ["Dench", "Gell", "Holg", "Krusk", "Shump", "Feng", "Henk", "Imsh", "Ront", "Thokk", "Argran", "Braak", "Brok", "Brulog",
      "Brug", "Cagak", "Drull", "Gorgrim", "Gorrdic", "Grul", "Grulnash", "Grumthak", "Karnok", "Kashek", "Khorerg", "Khormud",
      "Krug", "Kurnok", "Mhurren", "Olof", "Orm", "Ovak", "Shlob", "Threnak", "Tushok", "Urgak", "Vrekha", "Volen", "Wraog", "Yorg"],
    female: ["Baggi", "Engong", "Sutha", "Emen", "Myev", "Ownka", "Vola", "Yevelda", "Aeka", "Alavara", "Amlorna", "Arha", "Ashga",
      "Bilga", "Brakka", "Fynara", "Kansif", "Kavalin", "Lurka", "Neega", "Rhorui", "Tylvanya", "Ushara", "Voranika", "Xilvara",
      "Zarkoth", "Theldra", "Grix", "Shana", "Kalla", "Drusa", "Korra", "Mazoga", "Azra", "Bolka", "Graia", "Hilda", "Mogra", "Raska",
      "Svala", "Tula", "Vraka", "Yvaine", "Zora", "Bragga"],
    surnames: null
  };

  // Half-elves: a given name, and a family name that may sound like either side of the family.
  var HALF_ELF = {
    male: ["Adran", "Aelin", "Aramil", "Arannis", "Aust", "Berrian", "Brewster", "Caleb", "Callion", "Danal", "Davros", "Edmond",
      "Elenion", "Erion", "Fallon", "Fenn", "Galen", "Genn", "Halvar", "Heward", "Iban", "Ilamin", "Jandar", "Kellan", "Kendal",
      "Liam", "Lorin", "Merrick", "Myastan", "Nathan", "Orvyn", "Penn", "Radley", "Rayner", "Ryalis", "Sammel", "Tam", "Taran", "Ulf",
      "Uveth", "Vesper", "William", "Wyn", "Yorick"],
    female: ["Adrie", "Aelestra", "Althaea", "Amaris", "Beth", "Caelynn", "Catrin", "Cora", "Delia", "Dara", "Elen", "Elenora",
      "Enna", "Erryn", "Faelael", "Farrah", "Gwyneth", "Gwendolyn", "Hanna", "Hesper", "Ilana", "Iole", "Jael", "Jane", "Kaela",
      "Katia", "Liana", "Lia", "Marissa", "Meredith", "Naivara", "Nuala", "Opal", "Orla", "Piper", "Penelope", "Quill", "Quinn",
      "Raina", "Roslyn", "Seria", "Shana", "Tarynn", "Tessa", "Vadania", "Varda", "Willow"],
    surnames: { family: ["Amastacia", "Ashmere", "Autumnwood", "Balder", "Beech", "Blackwood", "Brightwood", "Brook", "Carrow",
      "Castellan", "Chase", "Clearwater", "Coldwater", "Cooper", "Copperleaf", "Correl", "Crest", "Crow", "Dale", "Darken", "Dawn",
      "Dawnsinger", "Dew", "Dewdrop", "Drake", "Dusk", "Duskwalker", "Dwyer", "Everbloom", "Everhart", "Fairwind", "Falcon", "Fern",
      "Finch", "Forest", "Fox", "Frost", "Galanodel", "Gale", "Goldleaf", "Green", "Greenwood", "Hale", "Hall", "Hart", "Hawk",
      "Hawthorn", "Heath", "Heron", "Hill", "Holos", "Honey", "Horn", "Hunter", "Illian", "Jewell", "Keryndal", "Lake", "Leaf",
      "Leagreen", "Lockwood", "Lyari", "Marsh", "Meadow", "Mill", "Moonbrook", "Moonleaf", "Moor", "Morely", "Morningstar", "Moss",
      "Naylor", "Needle", "Oak", "Palmer", "Parker", "Quorindel", "Rain", "River", "Rose", "Silverstrand", "Starmere", "Sunbrook",
      "Swift", "Vaelora"] },
    regions: { any: ["family"] }
  };

  // Tieflings: a given name and a family name of the old, grave kind. The edgier entries in the source table are left out.
  var TIEFLING = {
    male: ["Akmenos", "Amnon", "Damakos", "Kairon", "Leucis", "Melech", "Pelaios", "Therai", "Cairos", "Ekemon", "Iados", "Morthos",
      "Barakas", "Damian", "Erebus", "Malakor", "Mordai", "Theron", "Zargon", "Balthazar", "Draven", "Fornax", "Kallrak", "Lucian",
      "Malphas", "Samael", "Azazel", "Dante", "Fenris", "Magnus", "Qadir"],
    female: ["Akta", "Bryseis", "Criella", "Farideh", "Iridessa", "Kallista", "Orianna", "Rieta", "Anakis", "Lerissa", "Nymessa",
      "Phelaia", "Valerei", "Zari", "Bellona", "Calliope", "Damia", "Fira", "Giselle", "Hecate", "Isolde", "Kira", "Morana", "Ophelia",
      "Pandora", "Vespera", "Xenia", "Zephyra", "Ashara", "Corvina", "Ursa", "Yara"],
    surnames: { virtue: ["Ashen", "Cinder", "Emberfall", "Grimwood", "Hollow", "Quietude", "Sorrow", "Umbral", "Obsidian", "Pallid",
      "Mourn", "Zeal"] },
    regions: { any: ["virtue"] }
  };

  var RACES = { human: HUMAN, dwarf: DWARF, elf: ELF, halfling: HALFLING, half_orc: HALF_ORC, half_elf: HALF_ELF, tiefling: TIEFLING };

  function reservedSet() {
    var set = {};
    for (var i = 0; i < RESERVED.length; i++) set[RESERVED[i].toLowerCase()] = true;
    return set;
  }
  var reserved = reservedSet();

  function clean(list) {
    var seen = {}, out = [];
    for (var i = 0; i < list.length; i++) {
      var key = list[i].toLowerCase();
      if (seen[key] || reserved[key]) continue;
      seen[key] = true;
      out.push(list[i]);
    }
    return out;
  }

  // The finished lists, built once: reserved and repeated names removed.
  var built = {};
  function build(race) {
    if (built[race]) return built[race];
    var data = RACES[race];
    if (!data) throw new Error("NameGen: unknown race \"" + race + "\". Known: " + Object.keys(RACES).join(", "));
    var b = { male: clean(data.male), female: clean(data.female), surnames: {} };
    if (data.surnames) {
      Object.keys(data.regions).forEach(function (region) {
        var all = [];
        data.regions[region].forEach(function (group) { all = all.concat(data.surnames[group]); });
        b.surnames[region] = clean(all);
      });
    }
    built[race] = b;
    return b;
  }

  // A small integer hash. Same seed and salt, same number, on every browser and every refresh.
  function mix(seed, salt) {
    var h = Math.imul((seed | 0) ^ Math.imul(salt + 1, 0x9E3779B1), 0x85EBCA6B);
    h ^= h >>> 13;
    h = Math.imul(h, 0xC2B2AE35);
    h ^= h >>> 16;
    return h >>> 0;
  }

  // "m", "f" or "any" (the seed picks) to "m" or "f". make() and look() both use this, so one seed is one person.
  function resolveGender(gender, seed) {
    var g = gender;
    if (g === "any") g = (mix(seed, 3) % 2) ? "f" : "m";
    if (g === "male") g = "m";
    if (g === "female") g = "f";
    if (g !== "m" && g !== "f") throw new Error("NameGen: gender must be \"m\", \"f\" or \"any\", got \"" + gender + "\"");
    return g;
  }

  function make(race, gender, region, seed) {
    var b = build(race);
    // A race with no surnames (the half-orcs) gives a single name. A race with one surname list of its own ("any") uses it for
    // every region, so a quest can ask for a region without knowing which races have regional surnames.
    var noSurname = Object.keys(b.surnames).length === 0;
    var sur = b.surnames[region] || (Object.keys(b.surnames).length === 1 ? b.surnames.any : undefined);
    if (!noSurname && !sur) throw new Error("NameGen: unknown region \"" + region + "\" for " + race + ". Known: " + Object.keys(b.surnames).join(", "));
    seed = Math.floor(Number(seed)) || 0;
    var g = resolveGender(gender, seed);
    var firsts = (g === "m") ? b.male : b.female;
    var first = firsts[mix(seed, 1) % firsts.length];
    var last = noSurname ? "" : sur[mix(seed, 2) % sur.length];
    return { first: first, last: last, full: last ? first + " " + last : first, gender: g };
  }

  // ---- Who lives where: the mix of races a place has. Weights are shares of a hundred (they need not add up to 100). ----
  var RACE_WEIGHTS = {
    middle_ward: { human: 70, halfling: 8, dwarf: 8, half_elf: 5, elf: 3, half_orc: 3, tiefling: 3 },
    quarter:     { human: 78, elf: 6, half_elf: 5, dwarf: 4, tiefling: 4, halfling: 2, half_orc: 1 },
    docks:       { human: 62, half_orc: 10, dwarf: 8, halfling: 6, tiefling: 6, half_elf: 5, elf: 3 }
  };

  // The race of one person, from a place and a seed. The same place and seed always give the same race.
  function pickRace(seed, setting) {
    var weights = RACE_WEIGHTS[setting];
    if (!weights) throw new Error("NameGen: unknown setting \"" + setting + "\". Known: " + Object.keys(RACE_WEIGHTS).join(", "));
    var names = Object.keys(weights), total = 0, i;
    for (i = 0; i < names.length; i++) total += weights[names[i]];
    var roll = mix(Math.floor(Number(seed)) || 0, 5) % total;
    for (i = 0; i < names.length; i++) {
      if (roll < weights[names[i]]) return names[i];
      roll -= weights[names[i]];
    }
    return names[0];
  }

  // ---- What the player can see of a person: build and a visible detail, never a job. ----
  // adj      one word or short phrase for build or age: "a stocky dwarven woman"
  // marks    a detail either gender can have, written to follow the person: "...woman with braids pinned up"
  // male / female   details only that gender takes (a beard, a braid). Merged with marks for that gender.
  // kind     the race word in the noun: "dwarven" -> "dwarven woman". Humans have none.
  // Details are things you see: a scar, a ring, a tusk, a shawl. Anything that would name a trade (an apron, a hammer, a
  // ledger) belongs to the building's own description, which knows what the person is doing.
  var LOOKS = {
    human: {
      kind: "",
      adj: ["lean", "heavyset", "weathered", "young", "stooped", "broad-shouldered", "wiry", "grey-haired", "short", "tall",
        "tired-looking", "round-faced"],
      marks: ["with a scar through one eyebrow", "with dark hair tied back with a cord", "with a gap between the front teeth",
        "with red, chapped hands", "with grey-streaked hair cut short", "with freckled forearms",
        "with a nose that has been broken once and set badly", "with a squint that deepens when you speak",
        "in a patched coat", "in a good wool coat gone shiny at the elbows", "with a shawl pinned at the throat"],
      male: ["with a short beard gone patchy at the jaw", "with a heavy moustache", "with stubble and a split lip"],
      female: ["with a long braid over one shoulder", "with her hair pinned up under a scarf"]
    },
    dwarf: {
      kind: "dwarven",
      adj: ["stocky", "broad", "heavy-browed", "short and square", "weathered", "thick-fingered", "barrel-chested"],
      marks: ["with iron-grey braids pinned up", "with a scarred, soot-dark knuckle", "with a nose flattened and healed crooked",
        "with a brass ring in one ear", "with deep-set eyes that rarely blink", "with a flat cap pulled low"],
      male: ["with a braided beard tucked into the belt", "with a beard shot with grey and tied in two"],
      female: ["with her braids coiled and pinned with bone pins", "with a short, thick plait down the back"]
    },
    elf: {
      kind: "elven",
      adj: ["lean", "long-limbed", "slight", "narrow-faced", "pale", "tall and spare"],
      marks: ["with pointed ears showing through straight dark hair", "with ears notched at the tips",
        "with grey eyes that rarely settle", "with long fingers and a stillness that is a little off",
        "with hair so pale it looks wet", "with a face that gives away nothing"],
      male: ["with hair cut to the jaw", "with a thin, clean-shaven face"],
      female: ["with hair in one long plait", "with her hair held back by a single bone pin"]
    },
    halfling: {
      kind: "halfling",
      adj: ["small", "round-faced", "bright-eyed", "compact", "sturdy", "ruddy"],
      marks: ["with curly hair going to grey", "with a quick, wide smile", "in a coat cut down to fit",
        "standing no higher than your ribs", "with big, clever hands"],
      male: ["with mutton-chop whiskers", "with a clean-shaven, dimpled chin"],
      female: ["with a mop of dark curls", "with her sleeves rolled to the elbow"]
    },
    half_orc: {
      kind: "half-orc",
      adj: ["broad", "heavy-set", "tall", "scarred", "heavy-jawed", "thick-necked"],
      marks: ["with lower tusks showing past the lip", "with one tusk snapped short", "with a grey-green cast to the skin",
        "with ears notched by an old fight", "with small, watchful eyes", "with a jaw like a shovel"],
      male: ["with a shaved head and a ridged scalp", "with a chin beard braided in a single tail"],
      female: ["with her hair shaved on one side", "with a thick braid wrapped around the head"]
    },
    half_elf: {
      kind: "half-elf",
      adj: ["lean", "fine-boned", "tall", "tanned", "easy-looking"],
      marks: ["with ears just pointed at the tips", "with eyes an odd shade between green and brown",
        "with dark hair worn loose", "with a face that looks younger than the hands"],
      male: ["with a day's stubble", "with hair tied back at the neck"],
      female: ["with a single braid threaded with a green ribbon", "with her hair cropped short"]
    },
    tiefling: {
      kind: "tiefling",
      adj: ["tall", "lean", "sharp-featured", "dark-eyed", "straight-backed"],
      marks: ["with small horns curving back from the brow", "with skin the colour of old wine",
        "with eyes that are solid amber", "with ridged horns filed short", "with a tail that twitches against the boot",
        "with a collar buttoned to the chin"],
      male: ["with a trimmed beard and horns swept back", "with hair cropped close around the horns"],
      female: ["with her horns wrapped in a dark cloth", "with her hair worn long over one horn"]
    }
  };

  // "a stocky dwarven woman" plus "with iron-grey braids pinned up". The same race, gender and seed always give the same
  // person, and the gender resolves the way make() resolves it, so a name and a look made from one seed describe one person.
  // A look can leave out the details a scene has already covered. skip is a string of words: "clothes" drops details that describe
  // what the person wears, "hands" drops details about hands, forearms and fingers (the scene has them holding something).
  var CLOTHES = /^in |\bcoat\b|\bcap\b|\bscarf\b|\bshawl\b|\bcollar\b|\bcloth\b|\bribbon\b|\bsleeves\b/;
  var HANDS = /\bhands?\b|\bforearms?\b|\bknuckles?\b|\bfingers\b|\bsleeves\b/;
  function look(race, gender, seed, skip) {
    var data = LOOKS[race];
    if (!data) throw new Error("NameGen: no look for race \"" + race + "\". Known: " + Object.keys(LOOKS).join(", "));
    seed = Math.floor(Number(seed)) || 0;
    var g = resolveGender(gender, seed);
    var marks = data.marks.concat(g === "m" ? data.male : data.female);
    skip = String(skip || "");
    if (/clothes/.test(skip)) marks = marks.filter(function (m) { return !CLOTHES.test(m); });
    if (/hands/.test(skip)) marks = marks.filter(function (m) { return !HANDS.test(m); });
    var adj = data.adj[mix(seed, 6) % data.adj.length];
    var detail = marks[mix(seed, 7) % marks.length];
    var noun = (data.kind ? data.kind + " " : "") + (g === "m" ? "man" : "woman");
    var article = /^[aeiou]/i.test(adj) ? "an" : "a";
    var phrase = article + " " + adj + " " + noun;
    return { phrase: phrase, detail: detail, full: phrase.charAt(0).toUpperCase() + phrase.slice(1) + " " + detail, gender: g };
  }

  // One more independent choice from the same seed: a whole number from 0 to n-1. The salt keeps different choices apart (the
  // building and the creature of one posting use two salts, so they do not rise and fall together).
  function roll(seed, salt, n) {
    return mix(Math.floor(Number(seed)) || 0, Math.floor(Number(salt)) || 0) % Math.max(1, Math.floor(Number(n)) || 1);
  }

  // How many of each, for a quick check that a list did not shrink by mistake.
  function sizes(race) {
    var b = build(race), out = { male: b.male.length, female: b.female.length };
    Object.keys(b.surnames).forEach(function (r) { out["surnames_" + r] = b.surnames[r].length; });
    return out;
  }

  root.NameGen = { make: make, look: look, pickRace: pickRace, roll: roll, sizes: sizes, races: function () { return Object.keys(RACES); }, settings: function () { return Object.keys(RACE_WEIGHTS); }, RESERVED: RESERVED };
})(typeof window !== "undefined" ? window : global);
