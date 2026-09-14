#!/usr/bin/env node
/*
 * lint_anachronisms.js — flags modern chemical, industrial, and engineering
 * vocabulary violating Section 24 ("Technological, Chemical & Period Integrity").
 *
 * Checks non-command prose/dialogue lines for:
 *   - Chemical terms: "high-carbon", "carbon steel", "titanium", "calories", etc.
 *   - Industrial/automotive terms: "turbine", "drive-cam", "drive-shaft", "flywheel",
 *     "cast-iron assembly", "pneumatic", "combustion", etc.
 *   - Smelting anachronisms: "anthracite steel", "coke-smelted", etc.
 *
 * Usage:
 *   node tools/lint_anachronisms.js [path]
 *
 * Report-only: exits 0.
 */

const fs = require('fs');
const path = require('path');

const target = process.argv[2] && !/=/.test(process.argv[2])
  ? path.resolve(process.argv[2])
  : path.resolve(__dirname, '..', 'web', 'mygame', 'scenes');

function collectScenes(target) {
  const stat = fs.statSync(target);
  if (stat.isFile()) return [target];
  return fs
    .readdirSync(target)
    .filter((f) => f.endsWith('.txt'))
    .map((f) => path.join(target, f));
}

const PATTERNS = [
  { id: 'carbon', regex: /\b(high-carbon|carbon steel|carbon rod|carbon content)\b/i, desc: 'Modern chemical terminology (Section 24). Use shear-steel, blister-steel, crucible steel, or tool-steel.' },
  { id: 'turbine', regex: /\bturbines?\b/i, desc: '19th-century hydro-engineering term (Section 24). Use waterwheel, mill-wheel, paddle-wheel, or flume.' },
  { id: 'drive-cam', regex: /\bdrive-cams?\b/i, desc: 'Modern machine phrasing (Section 24). Use trip-cams, wipers, or camshaft.' },
  { id: 'drive-shaft', regex: /\bdrive-shafts?\b/i, desc: 'Modern automotive/machine term (Section 24). Use wheel axle, camshaft, or timber shaft.' },
  { id: 'cast-iron-assembly', regex: /\bcast-iron assembly\b/i, desc: 'Industrial assembly term (Section 24). Use iron gearing, wheel housing, or trip-hammer frame.' },
  { id: 'flywheel', regex: /\bflywheels?\b/i, desc: 'Industrial engine term (Section 24).' },
  { id: 'pneumatic', regex: /\bpneumatic\b/i, desc: 'Modern pressure term (Section 24).' },
  { id: 'combustion', regex: /\bcombustion\b/i, desc: 'Modern chemical/engine term (Section 24).' },
  { id: 'anthracite-steel', regex: /\banthracite steel\b/i, desc: 'Anthracite is a coal, not a metal (Section 24). Use refined crucible steel or pit-coal refined steel.' },
  { id: 'titanium', regex: /\btitanium\b/i, desc: 'Modern chemical element (Section 24).' },
  { id: 'calories', regex: /\bcalories?\b/i, desc: '19th-century thermodynamics/nutritional term (Section 24).' },
];

function isCommand(line) {
  const t = line.trim();
  return t.startsWith('*') || t.startsWith('#');
}

const sceneFiles = collectScenes(target);
let totalFindings = 0;

for (const file of sceneFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split(/\r?\n/);
  const rel = path.relative(process.cwd(), file);

  lines.forEach((line, idx) => {
    if (isCommand(line)) return;

    for (const pat of PATTERNS) {
      const match = line.match(pat.regex);
      if (match) {
        totalFindings++;
        console.log(`[anachronism:${pat.id}] ${rel}:${idx + 1}`);
        console.log(`  Line: ${line.trim()}`);
        console.log(`  Rule: ${pat.desc}`);
        console.log();
      }
    }
  });
}

console.log(`Done. Found ${totalFindings} potential anachronism(s).`);
