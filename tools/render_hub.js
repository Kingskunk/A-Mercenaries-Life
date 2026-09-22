// Renders a district hub (intro text + menu options) for every weather x time x day
// combination, so the prose can be read for contradictions. Quicktest only proves the
// code runs; this shows what the player would actually see.
// Usage, from the repo root:
//   node tools/render_hub.js [weather] [time] [day] [scene] [label]
//   e.g. node tools/render_hub.js Blizzard Midday Marketday
// STATS='{...}' (JSON) sets extra variables, e.g. current_district or *_seen flags.
// PICKS=4 renders every combination once per random variant: *rand is replaced by a fixed
// sequence, so a pool of up to four variants is shown exhaustively instead of at random.
// Any of the first three may be omitted (or "") to sweep all values. scene and label
// default to Dredge-End's hub. Set SAVVY=1 to render as a wisdom-14 character.
var root = process.cwd();
global.require = require;
var fs = require('fs'), vm = require('vm'), path = require('path');
global.fs = fs; global.vm = vm; global.path = path;
function load(f) { vm.runInThisContext(fs.readFileSync(path.join(root, f)), f); }
load("web/scene.js"); load("web/navigator.js"); load("web/util.js"); load("headless.js");
nav = new SceneNavigator(["startup"]);
stats = {};
Scene.prototype.loadScene = function () {
  // "simflags" is a virtual scene: refresh the derived weather flags the way a real hub entry
  // would, so labels that don't call update_hub_condition themselves still see fresh flags.
  var file = this.name == 'simflags' ? '*gosub_scene calendar update_hub_condition\n*finish'
    : slurpFile(root + '/web/mygame/scenes/' + this.name + '.txt');
  this.loadLines(file);
  this.loaded = true;
  if (this.executing) this.execute();
};
Scene.prototype.warning = function () {};
var captured = null;
Scene.prototype.ending = function () { this.finished = true; };
Scene.prototype.finish = function () { this.finished = true; };
Scene.prototype.choice = function (data, fake) {
  var groups = ["choice"];
  var opts = this.parseOptions(this.indent, groups, true);
  var names = [];
  (function walk(list) { list.forEach(function (o) { if (!o.unselectable) names.push(o.name); }); })(opts);
  captured.options = names;
  this.paragraph();
  this.finished = true;
};
Scene.prototype.page_break = function () { this.paragraph(); this.finished = true; };

// STATS='{"current_district":"harbor","port_valen_hub_seen":true}' sets any extra variables.
var extra = process.env.STATS ? JSON.parse(process.env.STATS) : {};
function run(sceneName, label, overrides, more) {
  printed.length = 0;
  captured = { options: [] };
  var sc = new Scene(sceneName, stats, nav, { debugMode: false });
  if (label) sc.targetLabel = { label: label, origin: "startup", originLine: 0 };
  Object.keys(overrides || {}).forEach(function (k) { stats[k] = overrides[k]; });
  Object.keys(more || {}).forEach(function (k) { stats[k] = more[k]; });
  if (sceneName != "startup") {
    var pre = new Scene("simflags", stats, nav, { debugMode: false });
    pre.execute();
    captured = { options: [] };
  }
  sc.execute();
  return captured;
}
// build stats from startup
run("startup");
var W = ["Clear", "Overcast", "Rain", "Fog", "Snow", "Sleet", "Storm", "Blizzard"];
var T = { "Pre-Dawn": 5, "Morning": 9, "Midday": 12, "Afternoon": 15, "Dusk": 19, "Night": 23 };
// calendar.txt derives day_of_week from campaign_day on every advance_time, so labels that
// advance time first need a matching campaign_day or the weekday gets overwritten.
var D_CAL = ["Ironday", "Tideday", "Marketday", "Hearthday", "Forgeday", "Greyday", "Hallowday"];
var D = ["Marketday", "Tideday", "Hallowday", "Greyday", "Forgeday", "Ironday", "Hearthday"];
var fw = process.argv[2], ft = process.argv[3], fd = process.argv[4];
var PICKS = process.env.PICKS ? Math.max(1, parseInt(process.env.PICKS, 10)) : 0;
var pickIndex = 0;
if (PICKS) Math.random = function () { return (pickIndex + 0.5) / PICKS; };
var scene = process.argv[5] || "port_valen_dredge_end";
var label = process.argv[6] || "port_valen_dredge_end";
W.forEach(function (w) {
  Object.keys(T).forEach(function (t) {
    D.forEach(function (d) {
      if ((fw && fw != w) || (ft && ft != t) || (fd && fd != d)) return;
      for (pickIndex = 0; pickIndex < (PICKS || 1); pickIndex++) {
      var res = run(scene, label, {
        weather: w, day_of_week: d, campaign_day: 1 + D_CAL.indexOf(d), clock_hour: T[t], clock_minute: 0, time_period: t,
        clock_time: (T[t] < 10 ? "0" : "") + T[t] + ":00",
        wisdom: process.env.SAVVY ? 14 : 10
      }, extra);
      var text = printed.join("").replace(/<\/?p>/g, "\n").replace(/<br>/g, "\n").replace(/\n{2,}/g, "\n");
      console.log("=== " + w + " / " + t + " / " + d + " | street_life=" + stats.street_life + " sev=" + stats.weather_severity + " vis=" + stats.weather_visibility + (PICKS ? " | pick=" + (pickIndex + 1) : ""));
      console.log(text);
      console.log("OPTIONS: " + res.options.join(" | "));
      }
    });
  });
});
