#!/usr/bin/env node
/*
 * check_insignia.js -- the Contractor's Insignia keeps one page per government (web/mygame/inventory-data.js Insignia). This checks the ladder logic, that the pages do not leak into one another,
 * that every stat a page names is created in startup.txt, and that no scene still bumps a government's job count or sets a rank by hand instead of calling Insignia.credit / register.
 */
const fs = require("fs"), path = require("path"), vm = require("vm");
const ROOT = path.resolve(__dirname, "..");
const GAME = path.join(ROOT, "web", "mygame");
global.window = global;
vm.runInThisContext(fs.readFileSync(path.join(GAME, "inventory-data.js")), "inventory-data.js");
const I = global.Insignia, startup = fs.readFileSync(path.join(GAME, "scenes", "startup.txt"), "utf8");
let failed = 0;
const fail = (m) => { failed++; console.log("FAIL: " + m); };
const eq = (a, b, m) => { if (a !== b) fail(m + " (got " + JSON.stringify(a) + ", want " + JSON.stringify(b) + ")"); };

// the disc and its pages are separate: a hall that sells the disc opens only its own page, and a job finished for a government opens that page if it was never opened
const d = { has_hall_insignia: false, hall_jobs_scales: 0, hall_jobs_gault: 0 };
I.issue(d); I.register(d, "gault");
eq(d.has_hall_insignia, true, "Langston Hall's sale issues the disc"); eq(d.hall_insignia_rank_gault, "listed", "a disc bought in Langston carries the Gault page"); eq(d.hall_insignia_rank_scales, "none", "a disc bought in Langston carries no Scales page");
eq(I.pages(d).length, 1, "that disc lists one page");
I.credit(d, "scales"); eq(d.hall_scales_registered, true, "a Scales job finished on a disc with no Scales page opens the page"); eq(d.hall_insignia_rank_scales, "open", "the opened Scales page starts Open"); eq(d.hall_jobs_scales, 1, "and the job is counted");
const d2 = { has_hall_insignia: true, hall_jobs_scales: 0, hall_jobs_gault: 0 };
I.refresh(d2); eq(d2.hall_insignia_rank_scales, "none", "owning a disc is not a Scales page"); I.register(d2, "scales"); eq(d2.hall_insignia_rank_scales, "open", "a Scales hall opens the page on a disc you already carry");

const s = { has_hall_insignia: false, hall_jobs_scales: 0, hall_jobs_gault: 0 };
I.refresh(s); eq(s.hall_insignia_rank_scales, "none", "unregistered Scales page"); eq(s.hall_insignia_rank_gault, "none", "unregistered Gault page");
I.register(s, "scales"); eq(s.hall_insignia_rank_scales, "open", "registered Scales page"); eq(s.hall_insignia_rank_gault, "none", "registering Scales must not register Gault");
I.credit(s, "scales"); I.credit(s, "scales"); I.credit(s, "scales"); I.credit(s, "scales");
eq(s.hall_jobs_scales, 4, "four Scales credits"); eq(s.hall_insignia_rank_scales, "open", "four Scales jobs are still Open");
I.credit(s, "scales"); eq(s.hall_insignia_rank_scales, "bonded", "five Scales jobs are Bonded");
for (let i = 0; i < 20; i++) I.credit(s, "scales");
eq(s.hall_insignia_rank_scales, "bonded", "many Scales jobs without the Sealed flag stay Bonded"); eq(s.hall_jobs_gault, 0, "Scales credits must not touch the Gault count");
s.hall_scales_sealed = true; I.refresh(s); eq(s.hall_insignia_rank_scales, "sealed", "Sealed once the flag is set");
s.hall_scales_named = true; I.refresh(s); eq(s.hall_insignia_rank_scales, "named", "Named once its flag is set");
eq(s.hall_insignia_rank_gault, "none", "Scales rank must grant nothing in the Vale");
I.register(s, "gault"); eq(s.hall_insignia_rank_gault, "listed", "registered Gault page"); eq(s.hall_jobs_gault, 0, "registering Gault credits no job");
I.credit(s, "gault"); I.credit(s, "gault"); eq(s.hall_insignia_rank_gault, "listed", "two Gault jobs are still Listed");
I.credit(s, "gault"); eq(s.hall_insignia_rank_gault, "proven", "three Gault jobs are Proven");
for (let i = 0; i < 20; i++) I.credit(s, "gault");
eq(s.hall_insignia_rank_gault, "proven", "many Gault jobs without the promotion stay Proven");
s.hall_gault_commissioned = true; I.refresh(s); eq(s.hall_insignia_rank_gault, "proven", "Commissioned cannot skip Vouched");
s.hall_gault_vouched = true; I.refresh(s); eq(s.hall_insignia_rank_gault, "commissioned", "Vouched then the Countess's grant is Commissioned");
eq(s.hall_insignia_rank_scales, "named", "Gault credits must not change the Scales rank");
eq(I.pages({ has_hall_insignia: true, hall_scales_registered: true, hall_jobs_scales: 1 }).length, 1, "an Insignia with one registered page lists one page");
eq(I.pages(s).length, 2, "an Insignia with both pages lists both");

// what a scene asks a page instead of naming a government
const q = { has_hall_insignia: true, hall_scales_registered: false, hall_gault_registered: false, hall_jobs_scales: 0, hall_jobs_gault: 0 };
eq(I.canTake(q, "scales"), true, "any disc may take a Gilded Scales board's work"); eq(I.canTake(q, "gault"), false, "a disc with no Gault page may not take House Gault's work");
q.hall_gault_registered = true; eq(I.canTake(q, "gault"), true, "a Gault page may take House Gault's work");
eq(I.canTake({ has_hall_insignia: false }, "scales"), false, "no disc, no Scales work");
eq(typeof I.needText("gault"), "string", "House Gault has a need text"); eq(I.needText("nowhere"), I.needText("scales"), "an unknown government reads as the Gilded Scales");
eq(I.line({ hall_jobs_gault: 1 }, "gault"), "Insignia: House Gault page, 1 job finished", "the credit line of one job"); eq(I.line({ hall_jobs_scales: 5 }, "scales"), "Insignia: Port Valen page, 5 jobs finished", "the credit line of five jobs");
const c = { has_hall_insignia: true, hall_gault_registered: true, hall_jobs_gault: 0, cr_credit_gault: 0 };
I.courierDelivered(c, "gault"); eq(c.cr_credit_gault, 1, "one delivery counts one"); eq(c.hall_jobs_gault, 0, "one delivery finishes no job"); eq(I.courierLine(c, "gault"), "Insignia: courier work, 1 of 3 deliveries toward the next job on the House Gault page", "the count line");
I.courierDelivered(c, "gault"); I.courierDelivered(c, "gault"); eq(c.cr_credit_gault, 0, "the third delivery resets the count"); eq(c.hall_jobs_gault, 1, "the third delivery finishes one job"); eq(I.courierLine(c, "gault"), "Insignia: House Gault page, 1 job finished", "the line after a set");

// every stat a page names must be created in startup.txt
const created = (v) => new RegExp("^\\*create " + v + " ", "m").test(startup);
I.ids().forEach((id) => {
  ["hall_jobs_" + id, "hall_insignia_rank_" + id, "cr_credit_" + id, "hall_" + id + "_registered"].forEach((v) => { if (!created(v)) fail("startup.txt does not create " + v); });
});
["cr_need_text", "cr_dgov", "cr_credit_line", "es_credit_line", "cr_gov", "cr_can"].forEach((v) => { if (!created(v)) fail("startup.txt does not create " + v); });
["has_hall_insignia", "hall_scales_registered", "hall_gault_registered", "hall_gault_vouched", "hall_gault_commissioned", "hall_scales_sealed", "hall_scales_named"].forEach((v) => { if (!created(v)) fail("startup.txt does not create " + v); });

// no scene bumps a count or sets a rank by hand
function walk(dir, out) { fs.readdirSync(dir, { withFileTypes: true }).forEach((e) => { const p = path.join(dir, e.name); if (e.isDirectory()) walk(p, out); else if (/\.txt$/.test(e.name)) out.push(p); }); return out; }
walk(path.join(GAME, "scenes"), []).forEach((f) => {
  if (/startup\.txt$/.test(f) || /startup_parts/.test(f.split(path.sep).join("/"))) return;
  fs.readFileSync(f, "utf8").split(/\r?\n/).forEach((line, i) => {
    if (/^\s*\*set\s+hall_jobs_[a-z]+\s*[+-]/.test(line)) fail(path.relative(ROOT, f) + ":" + (i + 1) + " bumps a job count by hand; call Insignia.credit: " + line.trim());
    if (/^\s*\*set\s+hall_insignia_rank/.test(line)) fail(path.relative(ROOT, f) + ":" + (i + 1) + " sets a rank by hand; ranks are derived (Insignia.refresh): " + line.trim());
    if (/(cr_gov|cd_gov|cr_dgov|rj_escort_gov)\s*=\s*"/.test(line) && !/^\s*\*(comment|set|script)/.test(line)) fail(path.relative(ROOT, f) + ":" + (i + 1) + " branches on a government by name; ask the page (Insignia.canTake / needText / line / courierLine): " + line.trim());
    if (/hall_insignia_rank\b(?!_)/.test(line)) fail(path.relative(ROOT, f) + ":" + (i + 1) + " still reads the old single hall_insignia_rank: " + line.trim());
  });
});
console.log(failed ? "check_insignia: " + failed + " problem(s)" : "check_insignia: OK (" + I.ids().join(", ") + ")");
process.exit(failed ? 1 : 0);
