/*
 * rp_knowledge_load.js -- loads the roleplay knowledge pools (web/mygame/rp-knowledge/*.js) into a node tool, in the same
 * order as the page: the <script src="rp-knowledge/..."> tags in web/mygame/index.html. Call it after `global.window = global`.
 * Returns the paths loaded. A pool file in the folder that index.html does not load is reported, since the game would miss it.
 */
"use strict";
const fs = require("fs");
const path = require("path");

module.exports = function loadKnowledge(gameDir) {
  const html = fs.readFileSync(path.join(gameDir, "index.html"), "utf8");
  const listed = [];
  const re = /<script[^>]*src=["'](rp-knowledge\/[^"']+)["']/g;
  let m;
  while ((m = re.exec(html))) listed.push(m[1]);
  listed.forEach((rel) => require(path.join(gameDir, rel)));
  const onDisk = fs.readdirSync(path.join(gameDir, "rp-knowledge")).filter((f) => f.endsWith(".js")).map((f) => "rp-knowledge/" + f);
  const missing = onDisk.filter((f) => listed.indexOf(f) === -1);
  return { loaded: listed, notInIndex: missing };
};
