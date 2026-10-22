#!/usr/bin/env node
/*
 * check_city_settlements.js -- walks every town and village service route (notice board, inn, way out) from the settlement's hub through the real pages (tools/scripted_play.js), pressing the hidden
 * step options in order, and reports whether the route could be taken and the minutes it cost. --write saves the minutes to tools/city_settlements_extra.json, which gen_city_settlements.js publishes
 * for the Town card. Each route starts at the settlement's entry label in the morning on a clear day, so what is measured is the route itself.
 */
"use strict";
const fs = require("fs"), path = require("path"), cp = require("child_process");
const reg = require("./gen_city_settlements.js");

const ROOT = path.join(__dirname, "..");
const TMP = path.join(require("os").tmpdir(), "city_settlements_check");
fs.mkdirSync(TMP, { recursive: true });
const WRITE = process.argv.indexOf("--write") >= 0;
function clock(out) { const m = /clock_time = "(\d\d):(\d\d)"/.exec(out); return m ? Number(m[1]) * 60 + Number(m[2]) : null; }

const extras = {}, rows = [];
Object.keys(reg.SETTLEMENTS).forEach(id => {
  const def = reg.SETTLEMENTS[id];
  reg.SERVICES.forEach(svc => {
    const base = { scene: def.startScene, label: def.start, preset: "Vanguard Line Fighter", weather: "Clear", time: "Morning", day: "Ironday", refresh: false,
      stats: { name: "Corin", intake_completed: true, vane_independent_operative: true, pv_re_last_day: 1, campaign_day: 1, met_ysolde: true, met_orlov: true }, watch: ["clock_time"] };
    // A step may leave the scene it starts in, and a script ends there, so the route is walked one step at a time: each run starts where the last one ended (the exit line names the scene and label,
    // a step inside the scene starts at the label it went to) and the minutes are the clock after the last arrival less the clock at the start. The destination's own arrival time counts.
    const run = (scene, label, picks, tag) => {
      const f = path.join(TMP, id + "_" + svc + "_" + tag + ".json");
      fs.writeFileSync(f, JSON.stringify(Object.assign({}, base, { scene: scene, label: label, steps: picks.map(p => ({ pick: p })) })));
      return cp.spawnSync(process.execPath, [path.join(__dirname, "scripted_play.js"), f], { cwd: ROOT, encoding: "utf8", timeout: 90000 }).stdout || "";
    };
    let ok = true, note = "", total = 0, per = [], scene = def.startScene, label = def.start;
    const t0 = clock(run(scene, label, [], "base"));
    def.services[svc].steps.forEach((st, n) => {
      if (!ok) return;
      const before = clock(run(scene, label, [], "b" + n));
      const out = run(scene, label, ["[pvgo:" + st[0] + ":" + st[1] + "]"], "s" + n);
      const err = /ERROR: (.*)/.exec(out) || /EXCEPTION: (.*)/.exec(out);
      if (err) { ok = false; note = (st[0] + ">" + st[1] + ": " + err[1]).slice(0, 110); return; }
      const after = clock(out), ex = /exits to (\S+) (\S+)/.exec(out);
      if (before === null || after === null) { ok = false; note = "no clock"; return; }
      let cost = after - before;
      if (ex) {
        scene = ex[1]; label = ex[2];
        const arrived = clock(run(scene, label, [], "a" + n));   // what the next scene charges on arrival
        if (arrived === null) { ok = false; note = "no clock"; return; }
        cost += arrived - t0;
      } else label = st[1];
      per.push(cost); total += cost;
    });
    if (ok) { (extras[id] = extras[id] || {})[svc] = per; }
    rows.push({ id: id, svc: svc, ok: ok, extra: ok ? total : null, note: note });
  });
});
console.log("settlement".padEnd(14) + "service".padEnd(8) + "route".padEnd(8) + "minutes   note");
rows.forEach(r => console.log(r.id.padEnd(14) + r.svc.padEnd(8) + (r.ok ? "ok" : "FAILED").padEnd(8) + String(r.extra).padEnd(10) + r.note));
const bad = rows.filter(r => !r.ok);
console.log("\n" + rows.length + " routes, " + bad.length + " could not be taken");
if (WRITE) { fs.writeFileSync(path.join(__dirname, "city_settlements_extra.json"), JSON.stringify(extras, null, 1) + "\n"); console.log("wrote tools/city_settlements_extra.json"); }
process.exit(bad.length ? 1 : 0);
