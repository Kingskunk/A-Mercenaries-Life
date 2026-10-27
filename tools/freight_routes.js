"use strict";

const path = require("path");
const defs = require("./freight_defs.json");

const ROOT = path.resolve(__dirname, "..");
require(path.join(ROOT, "web", "mygame", "overworld-data.js"));
const OW = global.Overworld;
const cache = new Map();

function context(item) {
  const commodity = item && item.commodity ? item.commodity : {};
  return {
    good: item && item.id ? item.id : "",
    profile: commodity.freight || "standard"
  };
}

function allowed(rule, ctx) {
  if (rule.profiles && rule.profiles.indexOf(ctx.profile) < 0) return false;
  if (rule.goods && rule.goods.indexOf(ctx.good) < 0) return false;
  return true;
}

function addEdge(adj, from, to, miles, days, modeName, rule, ctx) {
  const mode = modeName === "road" ? defs.road : defs.modes[modeName];
  if (!mode || !allowed(mode, ctx) || !allowed(rule, ctx)) return;
  adj[from].push({
    from: from,
    to: to,
    miles: miles,
    days: days,
    mode: modeName,
    group: mode.group,
    cost: miles * mode.costPerMile
  });
}

function graph(ctx, roadOnly) {
  const adj = {};
  Object.keys(OW.nodes).forEach((id) => { adj[id] = []; });
  OW.edges.forEach((edge) => {
    if ((edge[3] || "road") !== "road") return;
    const miles = edge[2];
    const days = miles / defs.road.milesPerDay;
    addEdge(adj, edge[0], edge[1], miles, days, "road", {}, ctx);
    addEdge(adj, edge[1], edge[0], miles, days, "road", {}, ctx);
  });
  if (roadOnly) return adj;
  defs.links.forEach((link) => {
    addEdge(adj, link.from, link.to, link.miles, link.days, link.mode, link, ctx);
    if (link.bothWays) addEdge(adj, link.to, link.from, link.miles, link.days, link.mode, link, ctx);
  });
  return adj;
}

function route(from, to, item, options) {
  const ctx = context(item);
  const roadOnly = !!(options && options.roadOnly);
  const key = [from, to, ctx.good, ctx.profile, roadOnly ? "road" : "all"].join("|");
  if (cache.has(key)) return cache.get(key);
  if (!OW.nodes[from] || !OW.nodes[to]) return { ok: false, path: [], legs: [], costDistance: Infinity, physicalMiles: 0, travelDays: 0, transfers: 0 };
  if (from === to) return { ok: true, path: [from], legs: [], costDistance: 0, physicalMiles: 0, travelDays: 0, transfers: 0 };

  const adj = graph(ctx, roadOnly);
  const start = from + "|";
  const dist = { [start]: 0 };
  const elapsed = { [start]: 0 };
  const state = { [start]: { node: from, group: "" } };
  const prev = {};
  const done = {};
  let finish = "";

  for (;;) {
    let current = "", best = Infinity, bestDays = Infinity;
    Object.keys(dist).forEach((candidate) => {
      if (done[candidate]) return;
      if (dist[candidate] < best || (dist[candidate] === best && elapsed[candidate] < bestDays)) {
        current = candidate;
        best = dist[candidate];
        bestDays = elapsed[candidate];
      }
    });
    if (!current) break;
    if (state[current].node === to) { finish = current; break; }
    done[current] = true;
    adj[state[current].node].forEach((edge) => {
      const transfer = state[current].group && state[current].group !== edge.group ? defs.transferCost : 0;
      const next = edge.to + "|" + edge.group;
      const nextCost = dist[current] + edge.cost + transfer;
      const nextDays = elapsed[current] + edge.days;
      if (dist[next] === undefined || nextCost < dist[next] || (nextCost === dist[next] && nextDays < elapsed[next])) {
        dist[next] = nextCost;
        elapsed[next] = nextDays;
        state[next] = { node: edge.to, group: edge.group };
        prev[next] = { state: current, edge: edge, transfer: transfer > 0 };
      }
    });
  }

  if (!finish) return { ok: false, path: [], legs: [], costDistance: Infinity, physicalMiles: 0, travelDays: 0, transfers: 0 };
  const legs = [];
  let cursor = finish;
  while (cursor !== start) {
    const step = prev[cursor];
    legs.unshift(Object.assign({ transfer: step.transfer }, step.edge));
    cursor = step.state;
  }
  const result = {
    ok: true,
    path: [from].concat(legs.map((leg) => leg.to)),
    legs: legs,
    costDistance: Math.round(dist[finish] * 10000) / 10000,
    physicalMiles: Math.round(legs.reduce((sum, leg) => sum + leg.miles, 0) * 10000) / 10000,
    travelDays: Math.round(elapsed[finish] * 10000) / 10000,
    transfers: legs.filter((leg) => leg.transfer).length
  };
  cache.set(key, result);
  return result;
}

function roadRoute(from, to, item) {
  return route(from, to, item, { roadOnly: true });
}

module.exports = { defs, route, roadRoute };
