#!/usr/bin/env node
/*
 * build_startup.js -- joins web/mygame/scenes/startup_parts/*.txt, in file-name order, into web/mygame/scenes/startup.txt.
 *
 * startup.txt is the one file the game, the ChoiceScript IDE extension and every tool read, and ChoiceScript has no include, so it stays a real file. The PARTS are the
 * source: add a *create to the part that fits its system (or a new NN_name.txt), then run this (compile.js runs it first). Parts are joined byte for byte, nothing added
 * or removed, so a part should end with a newline.
 *
 *   node tools/build_startup.js           write startup.txt if it differs from the parts
 *   node tools/build_startup.js --check   change nothing; exit 1 if startup.txt is not what the parts build (lint_all runs this)
 */
const fs = require("fs");
const path = require("path");
const SCENES = path.resolve(__dirname, "..", "web", "mygame", "scenes");
const DIR = path.join(SCENES, "startup_parts");
const OUT = path.join(SCENES, "startup.txt");

function build() {
  const names = fs.readdirSync(DIR).filter((f) => /^\d\d_.+\.txt$/.test(f)).sort();
  if (!names.length) throw new Error("no parts in " + DIR);
  return Buffer.concat(names.map((f) => fs.readFileSync(path.join(DIR, f))));
}

// true when startup.txt already equals the parts
function inSync() {
  const have = fs.existsSync(OUT) ? fs.readFileSync(OUT) : Buffer.alloc(0);
  return Buffer.compare(build(), have) === 0;
}

// write startup.txt from the parts if it differs; says what it did
function write() {
  const built = build();
  if (inSync()) { console.log("startup.txt is up to date (" + built.length + " bytes)."); return false; }
  fs.writeFileSync(OUT, built);
  console.log("startup.txt rebuilt from startup_parts/ (" + built.length + " bytes).");
  return true;
}

if (require.main === module) {
  if (process.argv.includes("--check")) {
    if (!inSync()) { console.error("startup.txt is not what startup_parts/ builds. Edit the part, then run: node tools/build_startup.js"); process.exit(1); }
    console.log("startup.txt matches startup_parts/ (" + build().length + " bytes).");
  } else write();
}
module.exports = { build, inSync, write };
