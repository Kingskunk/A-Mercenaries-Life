// Simulates the calendar's weather system for many days and prints the statistics, so the
// tables and the tunable numbers (55% persistence, 80% forecast accuracy, the exposure
// percentages) can be checked against what the real calendar.txt actually does.
// Usage, from the repo root:
//   node tools/sim_weather.js [days=400]
// It advances the real calendar 24 hours at a time (through a virtual *gosub_scene wrapper),
// so any change to calendar.txt is exercised exactly as the game would run it.
var root = process.cwd();
global.require = require;
var fs = require('fs'), vm = require('vm'), path = require('path');
global.fs = fs; global.vm = vm; global.path = path;
function load(f) { vm.runInThisContext(fs.readFileSync(path.join(root, f)), f); }
load("web/scene.js"); load("web/navigator.js"); load("web/util.js"); load("headless.js");
nav = new SceneNavigator(["startup"]);
stats = {};
var VIRTUAL = {
  simday: '*gosub_scene calendar advance_time\n*finish',
  simexposure: '*gosub_scene calendar calc_exposure\n*finish'
};
Scene.prototype.loadScene = function () {
  var file = VIRTUAL[this.name] || slurpFile(root + '/web/mygame/scenes/' + this.name + '.txt');
  this.loadLines(file);
  this.loaded = true;
  if (this.executing) this.execute();
};
Scene.prototype.warning = function () {};
Scene.prototype.ending = function () { this.finished = true; };
Scene.prototype.finish = function () { this.finished = true; };
Scene.prototype.page_break = function () { this.finished = true; };
Scene.prototype.choice = function () { this.paragraph(); this.finished = true; };
function runScene(name) { printed.length = 0; new Scene(name, stats, nav, { debugMode: false }).execute(); }

var days = 400;
process.argv.slice(2).forEach(function (a) { var m = /^days=(\d+)$/.exec(a); if (m) days = +m[1]; });

runScene("startup");
var seq = [];
var forecastHits = 0, forecastTotal = 0, missedFlags = 0, prevTomorrow = null;
var ground = {}, tomorrowSev = {};
var tempBySeason = {};
for (var i = 0; i < days; i++) {
  stats.hours_to_pass = 24; stats.minutes_to_pass = 0; stats.days_to_pass = 0;
  stats.time_advance_call_id = "sim_" + i;
  var forecast = stats.weather_tomorrow;
  runScene("simday");
  if (i > 0) { forecastTotal++; if (stats.weather === forecast) forecastHits++; }
  if (stats.forecast_missed) missedFlags++;
  seq.push({ season: stats.current_season, weather: stats.weather });
  ground[stats.ground_state] = (ground[stats.ground_state] || 0) + 1;
  var bySeason = tempBySeason[stats.current_season] = tempBySeason[stats.current_season] || {};
  bySeason[stats.temperature_band] = (bySeason[stats.temperature_band] || 0) + 1;
}
function count(list, key) { var c = {}; list.forEach(function (x) { c[x[key]] = (c[x[key]] || 0) + 1; }); return c; }
var ws = seq.map(function (x) { return x.weather; });
var same = 0, stormRepeat = 0, stormDays = 0, invalid = 0;
for (var j = 1; j < ws.length; j++) {
  if (ws[j] === ws[j - 1]) same++;
  if ((ws[j - 1] === "Storm" || ws[j - 1] === "Blizzard")) { stormDays++; if (ws[j] === ws[j - 1]) stormRepeat++; }
}
seq.forEach(function (x) {
  var winter = x.season === "Winter";
  if (winter && (x.weather === "Rain" || x.weather === "Fog" || x.weather === "Storm")) invalid++;
  if (!winter && (x.weather === "Snow" || x.weather === "Sleet" || x.weather === "Blizzard")) invalid++;
});
console.log("days simulated:", days);
console.log("weather counts:", JSON.stringify(count(seq, "weather")));
console.log("same as yesterday: " + Math.round(100 * same / (ws.length - 1)) + "%");
console.log("storm/blizzard followed by the same again:", stormRepeat, "of", stormDays);
console.log("forecast held (today == yesterday's forecast): " + Math.round(100 * forecastHits / forecastTotal) + "%  (target ~80%+, a miss can still match by chance)");
console.log("forecast_missed set on:", missedFlags, "days");
console.log("season-invalid days (expect 0):", invalid);
console.log("ground_state days:", JSON.stringify(ground));
console.log("temperature band at the daily sample hour, by season:", JSON.stringify(tempBySeason));

// Exposure table: extra minutes for a set of conditions, per cloak (calendar.txt cloak_traits), and with the oilcloth.
console.log("\nexposure on 60 outdoor minutes (extra minutes counted toward hunger and fatigue):");
var CLOAKS = [["none", "no cloak"], ["camo_cloak", "mottled"], ["weather_cloak", "weather"], ["wool_mantle", "wool"], ["talia_oiled_cloak", "Talia's"]];
var cases = [
  ["mild, clear", { temp_index: 3, weather_severity: 0, weather_wet: false }],
  ["cool, rain", { temp_index: 2, weather_severity: 1, weather_wet: true }],
  ["cold, snow", { temp_index: 1, weather_severity: 1, weather_wet: false }],
  ["freezing, blizzard", { temp_index: 0, weather_severity: 3, weather_wet: false }],
  ["hot, clear", { temp_index: 5, weather_severity: 0, weather_wet: false }]
];
cases.forEach(function (c) {
  var out = [];
  CLOAKS.forEach(function (cl) {
    Object.keys(c[1]).forEach(function (k) { stats[k] = c[1][k]; });
    stats.equipped_cloak_id = cl[0]; stats.exposure_base_mins = 60; stats.exposure_extra_mins = 0;
    stats.has_waxed_oilcloth = false;
    runScene("simexposure");
    var plain = stats.exposure_extra_mins;
    stats.exposure_base_mins = 60; stats.has_waxed_oilcloth = true;
    runScene("simexposure");
    out.push(cl[1] + " " + plain + (Number(stats.exposure_extra_mins) !== Number(plain) ? " (" + stats.exposure_extra_mins + " with oilcloth)" : ""));
  });
  stats.has_waxed_oilcloth = false;
  console.log("  " + c[0] + ": " + out.join(", "));
});

// Full kits, and regions: the same 60 outdoor minutes under a whole worn set (garment_traits in equipment.txt), at Port
// Valen's own extremes and at two regional ones (temp_extreme steps beyond freezing or hot, from climate_shift).
console.log("\nfull kits on 60 outdoor minutes (each part is a percent cut, summed over every worn slot, capped at 90):");
var KITS = [
  ["bare", {}],
  ["winter kit", { equipped_cloak_id: "winter_cloak", equipped_head_id: "fur_cap", equipped_hands_id: "lined_gloves", equipped_feet_id: "winter_boots", equipped_neck_id: "wool_muffler" }],
  ["storm kit", { equipped_cloak_id: "storm_cape", equipped_head_id: "felt_hat", equipped_feet_id: "waxed_boots" }],
  ["summer kit", { equipped_cloak_id: "summer_duster", equipped_head_id: "felt_hat" }],
  ["winter cloak in the heat", { equipped_cloak_id: "winter_cloak" }]
];
var SLOTS = ["equipped_armor_id", "equipped_head_id", "equipped_cloak_id", "equipped_hands_id", "equipped_waist_id", "equipped_feet_id", "equipped_neck_id"];
var REGIONS = [
  ["Port Valen freezing blizzard", { temp_index: 0, weather_severity: 3, weather_wet: false, temp_extreme: 0 }],
  ["arctic: 2 steps past freezing", { temp_index: 0, weather_severity: 3, weather_wet: false, temp_extreme: -2 }],
  ["Port Valen hot, clear", { temp_index: 5, weather_severity: 0, weather_wet: false, temp_extreme: 0 }],
  ["desert: 2 steps past hot", { temp_index: 5, weather_severity: 0, weather_wet: false, temp_extreme: 2 }]
];
REGIONS.forEach(function (r) {
  var out = [];
  KITS.forEach(function (k) {
    SLOTS.forEach(function (sl) { stats[sl] = "none"; });
    Object.keys(k[1]).forEach(function (sl) { stats[sl] = k[1][sl]; });
    Object.keys(r[1]).forEach(function (key) { stats[key] = r[1][key]; });
    stats.exposure_base_mins = 60; stats.exposure_extra_mins = 0; stats.has_waxed_oilcloth = false;
    runScene("simexposure");
    out.push(k[0] + " " + stats.exposure_extra_mins);
  });
  console.log("  " + r[0] + ": " + out.join(", "));
});
stats.temp_extreme = 0; SLOTS.forEach(function (sl) { stats[sl] = "none"; });

// Clock check: exposure must speed up the hunger and fatigue clocks but not the game clock,
// and must not leak into the next advance_time call.
Object.keys({ temp_index: 0, weather_severity: 3, weather_wet: false }).forEach(function (k) { stats[k] = { temp_index: 0, weather_severity: 3, weather_wet: false }[k]; });
stats.equipped_cloak_id = "none";
stats.vane_independent_operative = true;
stats.minutes_since_meal = 0; stats.minutes_since_rest = 0; stats.minutes_since_wash = 0;
stats.clock_hour = 10; stats.clock_minute = 0;
stats.hours_to_pass = 0; stats.minutes_to_pass = 60; stats.days_to_pass = 0;
stats.exposure_base_mins = 60; stats.exposure_extra_mins = 0;
VIRTUAL.simexposureday = '*gosub_scene calendar calc_exposure\n*gosub_scene calendar advance_time\n*finish';
stats.time_advance_call_id = "sim_exposure_clock_1";
runScene("simexposureday");
var okClock = stats.clock_hour === 11 && stats.clock_minute === 0;
var okMeal = stats.minutes_since_meal === 120 && stats.minutes_since_rest === 120;
var okWash = Number(stats.minutes_since_wash) === 60;   // weather wear must not make you dirtier
var okReset = Number(stats.exposure_extra_mins) === 0 && Number(stats.exposure_base_mins) === 0;
console.log("\nexposure clock check: game clock " + stats.clock_hour + ":" + (stats.clock_minute < 10 ? "0" : "") + stats.clock_minute +
  " (expect 11:00) " + (okClock ? "OK" : "FAIL") + ", meal/rest clocks " + stats.minutes_since_meal + "/" + stats.minutes_since_rest +
  " (expect 120/120) " + (okMeal ? "OK" : "FAIL") + ", wash clock " + stats.minutes_since_wash + " (expect 60) " + (okWash ? "OK" : "FAIL") + ", inputs cleared " + (okReset ? "OK" : "FAIL (base " + stats.exposure_base_mins + ", extra " + stats.exposure_extra_mins + ")"));
