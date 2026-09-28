// Restores each hub button to its ORIGINAL wording (trimmed only where it exceeded the 15-word budget)
// and prefixes the cost + name in bold, in the designer's format:
//
//   [b]ACTION[/b][b]Ray of Frost[/b] Loose a beam of numbing cold at ${combat_enemy_epithet}.
//   [b]BONUS ACTION[/b][b]Hex[/b] Lay a baleful eldritch curse upon ${combat_enemy_epithet}.
//
// Runs over whatever the previous two passes produced, matching the CURRENT text. The item buttons keep
// their trailing @{show_stat_hints} conditionals -- those carry real information (+1 STR for 12 hours)
// rather than a cost label, which is now inline at the front and unconditional.
// Run: node scratch/rewrite_choice_labels3.js
"use strict";

var fs = require("fs");
var file = "web/mygame/scenes/combat.txt";
var src = fs.readFileSync(file, "utf8");
var E = "combat_enemy_epithet";

var MAP = [
  ["# [b][Action] Attack[/b]: strike ${" + E + "} with your ${weapon}.",
   "# [b]ACTION[/b][b]Attack with your ${weapon}[/b]."],
  ["# [b][Action] Attack[/b]: strike ${" + E + "} with your ${sidearm}.",
   "# [b]ACTION[/b][b]Attack with your ${sidearm}[/b]."],
  ["# Push forward: (${combat_push_from_name} \u2192 ${combat_push_to_name}) against the nearest enemy.",
   "# Push forward and close the distance on the nearest enemy. (${combat_push_from_name} \u2192 ${combat_push_to_name})"],
  ["# Fall back: (${combat_fall_from_name} \u2192 ${combat_fall_to_name}) from the nearest enemy.",
   "# Fall back and open the distance from the nearest enemy. (${combat_fall_from_name} \u2192 ${combat_fall_to_name})"],
  ["# [b][Action] Dash[/b]: gain an extra move this turn.",
   "# [b]ACTION[/b][b]Dash[/b] Push yourself for extra ground this turn, giving up anything else."],
  ["# [b][Action] Fire Bolt[/b]: hurl a mote of flame at ${" + E + "}.",
   "# [b]ACTION[/b][b]Fire Bolt[/b] Hurl a mote of arcane flame at ${" + E + "}."],
  ["# [b][Action] Ray of Frost[/b]: loose numbing cold at ${" + E + "}.",
   "# [b]ACTION[/b][b]Ray of Frost[/b] Loose a beam of numbing cold at ${" + E + "}."],
  ["# [b][Action] Shocking Grasp[/b]: drive a bolt through ${" + E + "}.",
   "# [b]ACTION[/b][b]Shocking Grasp[/b] Drive a crackling jolt of lightning into ${" + E + "}."],
  ["# [b][Action] Eldritch Blast[/b]: unleash eldritch force at ${" + E + "}.",
   "# [b]ACTION[/b][b]Eldritch Blast[/b] Unleash a crackling beam of eldritch force at ${" + E + "}."],
  ["# [b][Action] Chill Touch[/b]: skeletal cold against ${" + E + "}.",
   "# [b]ACTION[/b][b]Chill Touch[/b] Conjure a skeletal hand of necrotic frost against ${" + E + "}."],
  ["# [b][Action] Vicious Mockery[/b]: a barbed insult at ${" + E + "}.",
   "# [b]ACTION[/b][b]Vicious Mockery[/b] Hurl a barbed, perfectly-aimed insult at ${" + E + "}."],
  ["# [b][Action] Magic Missile[/b]: three unerring darts of force.",
   "# [b]ACTION[/b][b]Magic Missile[/b] Unleash three darts of force, bypassing the defenses of ${" + E + "}."],
  ["# [b][Bonus Action] Hex[/b]: mark ${" + E + "} for deeper wounds.",
   "# [b]BONUS ACTION[/b][b]Hex[/b] Lay a baleful eldritch curse upon ${" + E + "}."],
  ["# [b][Action] Armor of Agathys[/b]: spectral frost that bites back.",
   "# [b]ACTION[/b][b]Armor of Agathys[/b] Sheathe yourself in spectral frost that punishes melee strikes."],
  ["# [b][Action] False Life[/b]: a necromantic buffer of vitality.",
   "# [b]ACTION[/b][b]False Life[/b] Weave a necromantic shroud over your flesh."],
  ["# [b][Action] Dissonant Whispers[/b]: a hideous phrase wracking ${" + E + "}.",
   "# [b]ACTION[/b][b]Dissonant Whispers[/b] A discordant psychic phrase wracks ${" + E + "}."],
  ["# [b][Action] Bane[/b]: sour the aim of every foe still standing.",
   "# [b]ACTION[/b][b]Bane[/b] Sour the aim and nerve of every foe still standing near you."],
  ["# [b][Bonus Action] Healing Word[/b]: a curative syllable for your wounds.",
   "# [b]BONUS ACTION[/b][b]Healing Word[/b] Speak a curative syllable to knit your gashes."],
  ["# [b][Action] Dodge[/b]: +5 AC until your turn ends; you cannot move.",
   "# [b]ACTION[/b][b]Dodge[/b] +5 AC until your turn ends; you cannot move."],
  ["# [b]Shield[/b]: +5 AC, armed against the next hit.",
   "# [b]Shield[/b] Hold the barrier-spell coiled and ready, primed to snap into place."],
  ["# [b][Bonus Action] Second Wind[/b]: grit your teeth and keep going.",
   "# [b]BONUS ACTION[/b][b]Second Wind[/b] Grit your teeth through the pain, and keep going."],
  ["# [b][Bonus Action] Rage[/b]: let the fury take you.",
   "# [b]BONUS ACTION[/b][b]Rage[/b] Let the fury take you."],
  ["# [b][Bonus Action] Blade Ward[/b]: blows land on the sigil, not you.",
   "# [b]BONUS ACTION[/b][b]Blade Ward[/b] Blows land on the sigil, not on you."],
  ["# [b][Action] Disengage[/b]: move without provoking a strike this round.",
   "# [b]ACTION[/b][b]Disengage[/b] Move without provoking a strike for the rest of this round."],
  ["# Break off and run: leave the fight for good.",
   "# Break off and run, out of the fight for good."],
  ["# [b][Action] Rub in the warming liniment[/b].",
   "# [b]ACTION[/b][b]Rub in the warming liniment[/b]."],
  ["# [b][Action] Drink the clear-head draught[/b].",
   "# [b]ACTION[/b][b]Drink the clear-head draught[/b]."],
  ["# [b][Action] Drink the phial of Saint Althea's water[/b].",
   "# [b]ACTION[/b][b]Drink the phial of Saint Althea's water[/b]."]
];

var done = 0, missed = [];
MAP.forEach(function (pair) {
  var full = "    " + pair[0];
  if (src.indexOf(full) === -1) { missed.push(pair[0].slice(0, 72)); return; }
  src = src.replace(full, "    " + pair[1]);
  done++;
});

fs.writeFileSync(file, src, "utf8");
console.log("Rewrote " + done + " of " + MAP.length + " buttons.");
if (missed.length) {
  console.log("NOT MATCHED:");
  missed.forEach(function (m) { console.log("   " + m); });
  process.exitCode = 1;
}
