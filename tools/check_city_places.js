#!/usr/bin/env node
/*
 * check_city_places.js -- walks every route in tools/gen_city_places.js's registry through the real pages (tools/scripted_play.js), pressing the hidden step options in order, and reports for each
 * place whether the route could be taken and how many minutes it cost beyond the district walk. Run with --write to save the measured minutes to tools/city_places_extra.json, which
 * gen_city_places.js publishes as each place's "extra" (the card shows district walk + extra). Run it again after changing a route or a walking time.
 *
 * Each route starts at the district's arrival label in the morning, on a clear day, with the districts open, the writ held, a hurt character (the Hedge-Doctor only offers himself to the wounded)
 * and every place marked as seen, so what is measured is the route itself. A place that opens only at night (the Drinking House) is tried at night.
 */
"use strict";
const fs = require("fs"), path = require("path"), cp = require("child_process");
const reg = require("./gen_city_places.js");

const ROOT = path.join(__dirname, "..");
const TMP = path.join(require("os").tmpdir(), "city_places_check");
fs.mkdirSync(TMP, { recursive: true });
const ARRIVE = { harbor: "port_valen_harbor", compound: "port_valen_hub", civic_heights: "port_valen_civic_heights", upper_wharves: "port_valen_upper_wharves", dredge_end: "port_valen_dredge_end_arrive", middle_ward: "port_valen_middle_ward" };
const SCENE = { "port_valen/port_valen.txt": "port_valen/port_valen", "port_valen/port_valen_civic_heights.txt": "port_valen/port_valen_civic_heights", "port_valen/port_valen_upper_wharves.txt": "port_valen/port_valen_upper_wharves",
  "port_valen/port_valen_dredge_end.txt": "port_valen/port_valen_dredge_end", "port_valen/port_valen_middle_ward.txt": "port_valen/port_valen_middle_ward" };
const NIGHT = { drinking_house: true };
const AFTERNOON = { armory: true };   // Varren is out on the drill square until the afternoon
const WRITE = process.argv.indexOf("--write") >= 0;

function clock(out) { const m = /clock_time = "(\d\d):(\d\d)"/.exec(out); return m ? Number(m[1]) * 60 + Number(m[2]) : null; }

const results = []; const extras = {};
reg.PLACES.port_valen.forEach(pl => {
  const stats = { name: "Corin", intake_completed: true, vane_independent_operative: true, civic_heights_open: true, upper_wharves_open: true, dredge_end_open: true, middle_ward_open: true,
    patrician_reg_until: 99, pv_re_last_day: 1, campaign_day: 1, met_ysolde: true, hp_current: 3, hp_max: 12, port_valen_hub_seen: true, level_up_sessions_needed: 5 };
  stats[pl.seen] = true;
  const base = { scene: SCENE[pl.file], label: ARRIVE[pl.district], preset: "Vanguard Line Fighter", weather: "Clear", time: NIGHT[pl.id] ? "Night" : (AFTERNOON[pl.id] ? "Afternoon" : "Morning"), day: "Ironday", refresh: false, stats: stats, watch: ["clock_time"] };
  const steps = pl.steps.map(st => ({ pick: "[pvgo:" + st[0] + ":" + st[1] + "]" }));
  // the start time, to measure against: run the same script with no steps
  const f0 = path.join(TMP, pl.id + "_0.json"), f1 = path.join(TMP, pl.id + "_1.json");
  fs.writeFileSync(f0, JSON.stringify(Object.assign({}, base, { steps: [] })));
  fs.writeFileSync(f1, JSON.stringify(Object.assign({}, base, { steps: steps })));
  const run = f => cp.spawnSync(process.execPath, [path.join(__dirname, "scripted_play.js"), f], { cwd: ROOT, encoding: "utf8", timeout: 90000 });
  const a = run(f0), b = run(f1);
  const t0 = clock(a.stdout || ""), t1 = clock(b.stdout || "");
  const err = /ERROR: (.*)/.exec(b.stdout || "");
  const ok = !err && t0 !== null && t1 !== null;
  const extra = ok ? t1 - t0 : null;
  // the minutes each step costs on its own (the card starts a route from whichever step is already on the page): the clock after each prefix of the route
  const clocks = [t0];
  for (let n = 1; ok && n < steps.length; n++) {
    const fp = path.join(TMP, pl.id + "_p" + n + ".json");
    fs.writeFileSync(fp, JSON.stringify(Object.assign({}, base, { steps: steps.slice(0, n) })));
    clocks.push(clock(run(fp).stdout || ""));
  }
  clocks.push(t1);
  const per = clocks.slice(1).map((c, i) => c - clocks[i]);
  if (ok) extras[pl.id] = per;
  results.push({ id: pl.id, name: pl.name, ok: ok, extra: extra, registry: pl.extra, note: err ? err[1].slice(0, 110) : "" });
});
console.log("place".padEnd(20) + "route".padEnd(8) + "extra min".padEnd(11) + "registry".padEnd(9) + "note");
results.forEach(r => console.log(r.id.padEnd(20) + (r.ok ? "ok" : "FAILED").padEnd(8) + String(r.extra).padEnd(11) + String(r.registry).padEnd(9) + r.note));
const bad = results.filter(r => !r.ok), diff = results.filter(r => r.ok && r.extra !== r.registry);
console.log("\n" + results.length + " routes, " + bad.length + " could not be taken, " + diff.length + " differ from the registry's minutes");
if (WRITE) { fs.writeFileSync(path.join(__dirname, "city_places_extra.json"), JSON.stringify(extras, null, 1) + "\n"); console.log("wrote tools/city_places_extra.json"); }
process.exit(bad.length ? 1 : 0);
