/*
 * names-data.js: the name generator's lists and its one function, NameGen.make.
 *
 * A scene calls it through scenes/names.txt (label name_make). The same race, gender, region and seed always give the
 * same name, so a quest keeps ONE number (a seed) instead of a name string, and asks again whenever it needs the name:
 * on the posting, at the door, at the reward. A page refresh cannot change a name, because nothing here is random.
 *
 *   NameGen.make("human", "f", "port", 1007)  ->  { first: "Marta", last: "Weaver", full: "Marta Weaver" }
 *
 * race    "human" so far. An unknown race throws, so a typo is found while writing, not by a player.
 * gender  "m", "f", or "any" (the seed picks one).
 * region  which surnames are in play: "port" (Port Valen), "marches" (the Grey Marches), "any" (all of them).
 * seed    any whole number. A radiant posting uses its five-day block; a one-off person stores a number once.
 *
 * Names that belong to a named character in the game are never generated: see RESERVED.
 * The lists came from quest/Random Name Generator.md, curated: numbering, duplicates and names that did not fit are cut.
 */
(function (root) {
  "use strict";

  // Every named person the player can already meet, first or last name. The generator skips these.
  var RESERVED = ["Kestrel", "Tolliver", "Ysolde", "Varren", "Vane", "Voss", "Thale", "Elric", "Halda", "Ambrose", "Hollis",
    "Vael", "Lyra", "Karr", "Skell", "Gault"];

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

  var RACES = { human: HUMAN };

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
    Object.keys(data.regions).forEach(function (region) {
      var all = [];
      data.regions[region].forEach(function (group) { all = all.concat(data.surnames[group]); });
      b.surnames[region] = clean(all);
    });
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

  function make(race, gender, region, seed) {
    var b = build(race);
    var sur = b.surnames[region];
    if (!sur) throw new Error("NameGen: unknown region \"" + region + "\". Known: " + Object.keys(b.surnames).join(", "));
    seed = Math.floor(Number(seed)) || 0;
    var g = gender;
    if (g === "any") g = (mix(seed, 3) % 2) ? "f" : "m";
    if (g === "male") g = "m";
    if (g === "female") g = "f";
    if (g !== "m" && g !== "f") throw new Error("NameGen: gender must be \"m\", \"f\" or \"any\", got \"" + gender + "\"");
    var firsts = (g === "m") ? b.male : b.female;
    var first = firsts[mix(seed, 1) % firsts.length];
    var last = sur[mix(seed, 2) % sur.length];
    return { first: first, last: last, full: first + " " + last, gender: g };
  }

  // How many of each, for a quick check that a list did not shrink by mistake.
  function sizes(race) {
    var b = build(race), out = { male: b.male.length, female: b.female.length };
    Object.keys(b.surnames).forEach(function (r) { out["surnames_" + r] = b.surnames[r].length; });
    return out;
  }

  root.NameGen = { make: make, sizes: sizes, RESERVED: RESERVED };
})(typeof window !== "undefined" ? window : global);
