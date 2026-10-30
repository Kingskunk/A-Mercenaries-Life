#!/usr/bin/env node
/*
 * check_escort_lines.js -- a regression check for the wagon escort (web/mygame/scenes/port_valen/radiant/hall_escort.txt, caravan_lot.txt and the two town lots).
 *
 * Every wagon line in Overworld CARAVAN_LINES (overworld-data.js) is played through the real engine with tools/scripted_play.js, page by page: the lot in its offer state, the wagon master's offer and the
 * signing, the muster the next morning, a line that left without the player, and the road to the pay (every roll high). Each yard also plays its lot on a day with no line in five skies, and the pay is
 * played at each end of the road, including the House Gault page for a job signed in Langston. The text of every page is compared with tools/escort_snapshots.json.
 *
 * The snapshot was taken from the escort BEFORE it was refactored into a table of yards and lines (2026-10-30), for the first six lines and three yards, and the refactor was kept identical to it: a change that
 * moves a word of those pages fails here. A new town's yard and lines are added to the tables below and to the snapshot with --update, once its pages have been read.
 *
 *   node tools/check_escort_lines.js            compare every scenario with the snapshot
 *   node tools/check_escort_lines.js --update   rewrite the snapshot from the current game (read the diff first)
 *   node tools/check_escort_lines.js --only offer_lg_tm   run scenarios whose name contains this text and show their text
 *
 * Adding a town: add its entry label to ENTRY, its name to NAMES, its lines to LINES (from, to, the weekday it makes up on), and, if its lot is the shared one (caravan_lot.txt), its shared-lot context to SHARED.
 */
const { spawnSync, spawn } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SNAP = path.join(__dirname, "escort_snapshots.json");

const ENTRY = {
  pv: ["port_valen/radiant/hall_escort", "es_arrive"],
  tm: ["timbermouth/wagon_lot", "tm_lot"],
  af: ["alderford/wagon_lot", "af_lot"],
  lg: ["Langston/langston", "lg_lot"],
};
// a yard that uses the shared lot leaves for it as soon as the stub has walked in, so scenarios that run on start in the lot itself, with the context the stub would have set
const SHARED = { lg: { scene: "port_valen/radiant/caravan_lot", label: "cl_main", place: "glot" } };
const NAMES = { pv: "Port Valen", tm: "Timbermouth", af: "Alderford", lg: "Langston" };
const DAYS = ["Ironday", "Tideday", "Marketday", "Hearthday", "Forgeday", "Greyday", "Hallowday"];
const DAY_NUM = {}; DAYS.forEach((d, i) => { DAY_NUM[d] = 8 + i; });   // the second week, so the weekday the calendar works out from campaign_day is the one named
const LINES = [["pv", "tm", "Forgeday"], ["pv", "af", "Marketday"], ["tm", "pv", "Tideday"], ["tm", "af", "Hearthday"], ["af", "pv", "Ironday"], ["af", "tm", "Greyday"], ["tm", "lg", "Ironday"], ["lg", "tm", "Marketday"]];
const PAY_FROM = { pv: "tm", tm: "pv", af: "pv", lg: "tm" };
const nextday = (d) => DAYS[(DAYS.indexOf(d) + 1) % 7];

function signed(f, t, until, pos) {
  return { name: "Corin", rj_escort_stage: "active", rj_escort_from: f, rj_escort_to: t, rj_escort_until: until, rj_escort_block: 2, es_start: f,
    rj_escort_master: "Bram Hale", rj_escort_look: "A heavy man", rj_escort_sex: "m", rj_escort_pos: pos || "" };
}
function scenarios() {
  const out = {};
  const put = (name, d) => { out[name] = Object.assign({ preset: "Scout Company Rogue", refresh: true }, d); };
  const HE = "port_valen/radiant/hall_escort";
  LINES.forEach(([f, t, dow]) => {
    const tag = f + "_" + t, D = DAY_NUM[dow];
    let scene = ENTRY[f][0], label = ENTRY[f][1], pre = {};
    if (SHARED[f]) { scene = SHARED[f].scene; label = SHARED[f].label; pre = { es_start: f, es_ctx_dow: dow, es_place: SHARED[f].place, es_end: t }; }
    // the lot in its offer state (the run ends when the player speaks to the master and the escort scene takes over)
    put("view_" + tag, { scene, label, weather: "Clear", time: "Morning", day: dow, stats: Object.assign({ name: "Corin", campaign_day: D }, pre),
      steps: [{ pick: "Speak to the wagon master" }],
      watch: ["es_start", "es_end", "es_place", "es_ctx_fee_text", "es_ctx_dow", "es_ctx_dest_name", "es_ctx_opens", "es_ctx_place_text", "clock_time"] });
    // the offer, from the escort scene: ask about the road twice, then take the work
    put("offer_" + tag, { scene: HE, label: "es_test_offer", weather: "Clear", time: "Morning", day: dow, stats: { name: "Corin", campaign_day: D, es_start: f, wx_zone: "reach" },
      steps: [{ pick: "Ask what the road is like" }, { pick: "Ask what the road is like" }, { pick: "Take the work" }],
      watch: ["rj_escort_stage", "rj_escort_from", "rj_escort_to", "rj_escort_until", "rj_escort_dest_name", "rj_escort_opens", "rj_escort_place_text", "rj_escort_master", "rj_escort_look", "rj_escort_sex", "es_start", "es_end", "es_place", "es_ctx_fee_text", "es_ctx_dow", "clock_time"] });
    // the next morning: report and take a place in the line
    const m = Object.assign(signed(f, t, D + 1), { campaign_day: D + 1, clock_hour: 7, clock_minute: 40, rj_escort_dest_name: NAMES[t], rj_escort_opens: "the Market opens", rj_escort_place_text: "the lot" });
    put("muster_" + tag, { scene: HE, label: "es_muster", weather: "Clear", time: "Morning", day: nextday(dow), stats: m, steps: [{ pick: "Walk at the tail" }],
      watch: ["rj_escort_stage", "rj_escort_pos", "rj_escort_road", "es_cur_leg", "clock_time"] });
    // too late: the line has gone
    const x = Object.assign(signed(f, t, D + 1), { campaign_day: D + 1, clock_hour: 10, clock_minute: 0, rj_escort_dest_name: NAMES[t], rj_escort_opens: "the Market opens", rj_escort_place_text: "the lot", es_start: f });
    put("missed_" + tag, { scene: HE, label: "es_test_missed", weather: "Clear", time: "Midday", day: nextday(dow), stats: x, steps: [], watch: ["rj_escort_stage", "clock_time"] });
    // the road: fourteen stretches, every roll high
    const r = Object.assign(signed(f, t, D + 1, "rear"), { campaign_day: D + 1, clock_hour: 7, clock_minute: 40, rj_escort_dest_name: NAMES[t], rj_escort_opens: "the Market opens", rj_escort_place_text: "the lot" });
    put("road_" + tag, { scene: HE, label: "es_pull_out", weather: "Clear", time: "Morning", day: nextday(dow), stats: r,
      steps: Array.from({ length: 14 }, () => ({ pick: 1, rand: "high" })), watch: ["rj_escort_lost", "rj_escort_stage", "es_cur_leg", "clock_hour", "ow_pos"] });
  });
  // the pay at each end of the road
  Object.keys(PAY_FROM).forEach((t) => {
    const f = PAY_FROM[t];
    const st = Object.assign(signed(f, t, 13, "head"), { campaign_day: 13, clock_hour: 16, clock_minute: 0, rj_escort_dest_name: NAMES[t], rj_escort_cur: 3, rj_escort_lost: 1, rj_escort_road: true, hall_scales_registered: true, has_hall_insignia: true, hall_jobs_scales: 4 });
    put("pay_at_" + t, { scene: HE, label: "es_pay", weather: "Clear", time: "Afternoon", day: "Greyday", stats: st, steps: [], watch: ["rj_escort_stage", "hall_jobs_scales", "hall_insignia_rank_scales", "ow_pos", "copper", "silver"] });
  });
  // a job signed in Langston credits the House Gault page wherever it is paid; one signed in Timbermouth and paid in Langston still credits the Gilded Scales
  const g = Object.assign(signed("lg", "tm", 13, "head"), { campaign_day: 13, clock_hour: 16, clock_minute: 0, rj_escort_dest_name: "Timbermouth", rj_escort_cur: 3, rj_escort_lost: 0, rj_escort_road: true, rj_escort_gov: "gault",
    hall_scales_registered: true, has_hall_insignia: true, hall_gault_registered: true, hall_jobs_scales: 4, hall_jobs_gault: 2, hall_insignia_rank_gault: "listed" });
  put("pay_gault_lg_tm", { scene: HE, label: "es_pay", weather: "Clear", time: "Afternoon", day: "Greyday", stats: g, steps: [], watch: ["rj_escort_stage", "hall_jobs_scales", "hall_jobs_gault", "hall_insignia_rank_gault", "hall_insignia_rank_scales", "ow_pos"] });
  const s = Object.assign(signed("tm", "lg", 13, "head"), { campaign_day: 13, clock_hour: 16, clock_minute: 0, rj_escort_dest_name: "Langston", rj_escort_cur: 3, rj_escort_lost: 0, rj_escort_road: true, rj_escort_gov: "scales", wx_zone: "vale",
    hall_scales_registered: true, has_hall_insignia: true, hall_gault_registered: true, hall_jobs_scales: 4, hall_jobs_gault: 2 });
  put("pay_scales_tm_lg", { scene: HE, label: "es_pay", weather: "Clear", time: "Afternoon", day: "Greyday", stats: s, steps: [], watch: ["rj_escort_stage", "hall_jobs_scales", "hall_jobs_gault", "hall_insignia_rank_scales", "ow_pos"] });
  // a road that crosses the border swaps the weather zone as the line walks into it
  const w = Object.assign(signed("tm", "lg", 9, "rear"), { campaign_day: 9, clock_hour: 7, clock_minute: 40, rj_escort_dest_name: "Langston", rj_escort_opens: "the Market opens", rj_escort_place_text: "the lot", wx_zone: "reach", weather_tomorrow: "Rain" });
  put("road_crosses_border_tm_lg", { scene: HE, label: "es_pull_out", weather: "Rain", time: "Morning", day: "Greyday", stats: w,
    steps: Array.from({ length: 14 }, () => ({ pick: 1, rand: "high" })), watch: ["wx_zone", "rj_escort_stage", "ow_pos"] });
  // each yard on a day with no line, in five skies
  Object.keys(ENTRY).forEach((y) => {
    let scene = ENTRY[y][0], label = ENTRY[y][1], pre = {};
    if (SHARED[y]) { scene = SHARED[y].scene; label = SHARED[y].label; pre = { es_start: y, es_ctx_dow: LINES.filter((l) => l[0] === y)[0][2], es_place: SHARED[y].place, es_end: LINES.filter((l) => l[0] === y)[0][1] }; }
    [["Clear", "Morning", {}], ["Rain", "Midday", {}], ["Clear", "Dusk", { rain_streak: 3 }], ["Storm", "Afternoon", {}], ["Fog", "Morning", {}]].forEach(([wx, tm, extra], i) => {
      put("idle_" + y + "_" + i, { scene, label, weather: wx, time: tm, day: "Hallowday", stats: Object.assign({ name: "Corin", campaign_day: 14 }, extra, pre), steps: [{ pick: "about work" }], watch: ["clock_time"] });
    });
  });
  return out;
}

function runOne(name, def, cb) {
  const file = path.join(os.tmpdir(), "escort_" + process.pid + "_" + name + ".json");
  fs.writeFileSync(file, JSON.stringify(def));
  const child = spawn(process.execPath, [path.join(ROOT, "tools", "scripted_play.js"), file], { cwd: ROOT });
  let text = "";
  child.stdout.on("data", (d) => { text += d; });
  child.stderr.on("data", (d) => { text += d; });
  child.on("close", () => { try { fs.unlinkSync(file); } catch (e) {} cb(text); });
}

function main() {
  const update = process.argv.includes("--update"), oi = process.argv.indexOf("--only"), only = oi >= 0 ? process.argv[oi + 1] : "";
  const all = scenarios(), names = Object.keys(all).filter((n) => !only || n.indexOf(only) >= 0);
  const snap = fs.existsSync(SNAP) ? JSON.parse(fs.readFileSync(SNAP, "utf8")) : {};
  const got = {};
  let next = 0, running = 0, done = 0;
  const pump = () => {
    while (running < 6 && next < names.length) {
      const n = names[next++]; running++;
      runOne(n, all[n], (text) => { got[n] = text; running--; done++; if (done === names.length) finish(names, got, snap, update, only); else pump(); });
    }
  };
  if (!names.length) { console.log("no scenario matches"); process.exit(1); }
  pump();
}

function finish(names, got, snap, update, only) {
  if (only) { names.forEach((n) => console.log("=== " + n + "\n" + got[n])); return; }
  if (update) {
    const keep = {}; Object.keys(got).sort().forEach((n) => { keep[n] = got[n]; });
    fs.writeFileSync(SNAP, JSON.stringify(keep, null, 1) + "\n");
    console.log("check_escort_lines: snapshot rewritten (" + names.length + " scenarios)");
    return;
  }
  let bad = 0;
  names.forEach((n) => {
    if (/ERROR|EXCEPTION/.test(got[n])) { bad++; console.log("FAIL " + n + ": the scenario hit an error\n" + got[n].split("\n").filter((l) => /ERROR|EXCEPTION/.test(l)).join("\n")); return; }
    if (snap[n] === undefined) { bad++; console.log("FAIL " + n + ": not in the snapshot (run with --update once its pages have been read)"); return; }
    if (snap[n] !== got[n]) {
      bad++;
      const a = snap[n].split("\n"), b = got[n].split("\n");
      let i = 0; while (i < a.length && i < b.length && a[i] === b[i]) i++;
      console.log("FAIL " + n + ": the text changed at line " + (i + 1) + "\n  was: " + (a[i] || "(end)").slice(0, 220) + "\n  now: " + (b[i] || "(end)").slice(0, 220));
    }
  });
  Object.keys(snap).forEach((n) => { if (names.indexOf(n) < 0) { bad++; console.log("FAIL " + n + ": in the snapshot but no longer a scenario"); } });
  console.log(bad ? "check_escort_lines: " + bad + " problem(s)" : "check_escort_lines: OK (" + names.length + " scenarios match the snapshot)");
  process.exit(bad ? 1 : 0);
}
main();
