// check_fast_crc.js -- proves scripted_play.js's fast crc32 gives the engine's own result (web/util.js crc32) on every scene file (2026-11-22).
// Run: node tools/check_fast_crc.js     Exit code 0 when every file agrees.
const fs = require("fs"), path = require("path"), vm = require("vm");
const ROOT = path.resolve(__dirname, "..");
const ctx = {}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, "web/util.js"), "utf8"), ctx);
const T = new Int32Array(256);
for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1); T[n] = c; }
function fast(str) { let crc = 0 ^ (-1); for (let i = 0; i < str.length; i++) crc = (crc >>> 8) ^ T[(crc ^ str.charCodeAt(i)) & 0xFF]; return crc ^ (-1); }
const files = [];
(function walk(d) { fs.readdirSync(d, { withFileTypes: true }).forEach(e => { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (/\.txt$/.test(e.name)) files.push(p); }); })(path.join(ROOT, "web/mygame/scenes"));
let bad = 0;
files.forEach(f => { const s = fs.readFileSync(f, "utf8"); if (ctx.crc32(s) !== fast(s)) { bad++; console.log("DIFFERS " + path.relative(ROOT, f)); } });
["", "a", "é ☃ 𝄞"].forEach(s => { if (ctx.crc32(s) !== fast(s)) { bad++; console.log("DIFFERS on " + JSON.stringify(s)); } });
console.log("check_fast_crc: " + (files.length - bad) + " of " + files.length + " scene files agree" + (bad ? "" : ", and the edge strings"));
process.exit(bad ? 1 : 0);
