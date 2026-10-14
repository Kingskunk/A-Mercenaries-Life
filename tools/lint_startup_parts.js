#!/usr/bin/env node
/* lint_startup_parts.js -- startup.txt must equal what web/mygame/scenes/startup_parts/ builds (a *create edited straight into startup.txt would be lost at the next build). */
const b = require("./build_startup.js");
if (b.inSync()) console.log("startup.txt matches startup_parts/. OK.");
else { console.log("startup.txt is NOT what startup_parts/ builds -- edit the part file, then run: node tools/build_startup.js (or copy your edit into the part first, then build)."); process.exitCode = 1; }
