#!/usr/bin/env node
"use strict";

const catalog = require("./gear_catalog.json");
const Freight = require("./freight_routes");

const items = {};
catalog.items.forEach((item) => { items[item.id] = item; });

let checks = 0;
let failures = 0;
function ok(condition, message) {
  checks++;
  if (!condition) {
    failures++;
    console.log("FAIL: " + message);
  }
}

const limestone = items.limestone;
const timber = items.longshade_timber;
const charcoal = items.charcoal;
const whitefoldToValen = Freight.route("wf", "pv", limestone);
const whitefoldToValenRoad = Freight.roadRoute("wf", "pv", limestone);
const whitefoldToBrinewick = Freight.route("wf", "bw", limestone);
const whitefoldToBrinewickRoad = Freight.roadRoute("wf", "bw", limestone);
const whitefoldToRedvein = Freight.route("wf", "rv", limestone);
const downGrey = Freight.route("af", "pv", limestone);
const upGrey = Freight.route("pv", "af", limestone);
const timberDrive = Freight.route("fo", "tm", timber);
const charcoalRoad = Freight.route("fo", "tm", charcoal);

ok(limestone && limestone.commodity.makers.wf === "major", "Whitefold is limestone's major maker");
ok(limestone.commodity.freight === "bulk", "limestone uses the bulk freight profile");
ok(whitefoldToValen.ok && whitefoldToValen.costDistance < whitefoldToValenRoad.costDistance, "Whitefold to Port Valen is cheaper through the Grey than by road only");
ok(whitefoldToValen.legs.some((leg) => leg.mode === "grey_downstream"), "Whitefold limestone reaches Port Valen on a downstream Grey leg");
ok(whitefoldToBrinewick.ok && whitefoldToBrinewick.costDistance < whitefoldToBrinewickRoad.costDistance, "Whitefold to Brinewick benefits from river and tidal freight");
ok(whitefoldToBrinewick.legs.some((leg) => leg.mode === "tidal_craft") && whitefoldToBrinewick.transfers === 2, "Brinewick's route transfers from wagon to barge to tidal craft");
ok(whitefoldToRedvein.ok && whitefoldToRedvein.legs.every((leg) => leg.mode === "road"), "Whitefold to Redvein remains an overland freight route");
ok(upGrey.costDistance > downGrey.costDistance, "upstream Grey freight costs more than downstream freight");
ok(timberDrive.legs.length === 1 && timberDrive.legs[0].mode === "log_drive" && timberDrive.costDistance < Freight.roadRoute("fo", "tm", timber).costDistance, "Ashrun Holt timber can use the one-way log drive");
ok(charcoalRoad.legs.every((leg) => leg.mode === "road"), "Ashrun charcoal cannot use the timber-only log drive");
ok(Freight.route("tm", "fo", timber).legs.every((leg) => leg.mode === "road"), "the Ashrun log drive cannot run upstream");
ok(whitefoldToValen.travelDays > downGrey.travelDays, "mixed freight keeps actual travel time separate from effective cost distance");

if (failures) {
  console.log("\n" + failures + " of " + checks + " freight checks failed.");
  process.exit(1);
}
console.log("check_freight_routes: " + checks + " checks passed.");
