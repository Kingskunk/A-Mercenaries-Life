#!/usr/bin/env node
/*
 * lint_anachronisms.js — flags modern chemical, industrial, engineering,
 * and firearm vocabulary violating Section 14 / Section 24 ("Grounded Economy,
 * Metallurgy & Low-Fantasy Worldbuilding" & "Quest Design Rules").
 *
 * Checks non-command prose/dialogue lines for:
 *   - Firearms & Gunpowder: blunderbusses, flintlocks, muskets, pistols, gunpowder, etc.
 *   - Chemical terms: "high-carbon", "carbon steel", "titanium", "calories", "chemical reaction", etc.
 *   - Industrial/automotive terms: "turbine", "drive-cam", "drive-shaft", "flywheel",
 *     "cast-iron assembly", "pneumatic", "combustion", "hydraulic assembly", etc.
 *   - Smelting anachronisms: "anthracite steel", "coke-smelted", etc.
 *
 * Usage:
 *   node tools/lint_anachronisms.js [path] [--strict]
 *
 * Report-only by default (exits 0). Pass --strict to exit 1 on findings.
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const isStrict = args.includes('--strict') || args.includes('--fail');
const targetArg = args.find((a) => !a.startsWith('--'));

const target = targetArg
  ? path.resolve(targetArg)
  : path.resolve(__dirname, '..', 'web', 'mygame', 'scenes');

function collectFiles(targetPath) {
  if (!fs.existsSync(targetPath)) return [];
  const stat = fs.statSync(targetPath);
  if (stat.isFile()) return [targetPath];
  return fs
    .readdirSync(targetPath)
    .filter((f) => f.endsWith('.txt') || f.endsWith('.md'))
    .map((f) => path.join(targetPath, f));
}

const PATTERNS = [
  // Metallurgy & Modern Chemical Terminology (Rule 14)
  {
    id: 'carbon',
    regex: /\b(high-carbon|carbon steel|carbon rod|carbon content)\b/i,
    desc: 'Modern chemical terminology (Rule 14). Use shear-steel, blister-steel, crucible steel, or tool-steel.',
  },
  {
    id: 'titanium',
    regex: /\btitanium\b/i,
    desc: 'Modern chemical element (Rule 14).',
  },
  {
    id: 'chemical-reaction',
    regex: /\b(chemical reactions?|chemical compounds?)\b/i,
    desc: 'Modern chemical terminology (Rule 14). Use alchemical reaction, vitriol, or reagent.',
  },
  {
    id: 'calories',
    regex: /\bcalories?\b/i,
    desc: '19th-century thermodynamics/nutritional term (Rule 14).',
  },
  {
    id: 'coke-smelted',
    regex: /\bcoke-smelt(ed)?\b/i,
    desc: 'Industrial smelting term (Rule 14). Use pit-coal, charcoal, or bloomery hearth.',
  },
  {
    id: 'anthracite-steel',
    regex: /\b(forged )?anthracite steel\b/i,
    desc: 'Anthracite is a coal, not a metal (Rule 14). Use refined crucible steel or pit-coal refined steel.',
  },

  // Mechanical & Industrial Engineering (Rule 14)
  {
    id: 'turbine',
    regex: /\bturbines?\b/i,
    desc: '19th-century hydro-engineering term (Rule 14). Use waterwheel, mill-wheel, paddle-wheel, or flume.',
  },
  {
    id: 'drive-cam',
    regex: /\bdrive-cams?\b/i,
    desc: 'Modern machine phrasing (Rule 14). Use trip-cams, wipers, or camshaft.',
  },
  {
    id: 'drive-shaft',
    regex: /\bdrive-shafts?\b/i,
    desc: 'Modern automotive/machine term (Rule 14). Use wheel axle, camshaft, or timber shaft.',
  },
  {
    id: 'cast-iron-assembly',
    regex: /\bcast-iron assembly\b/i,
    desc: 'Industrial assembly term (Rule 14). Use iron gearing, wheel housing, or trip-hammer frame.',
  },
  {
    id: 'flywheel',
    regex: /\bflywheels?\b/i,
    desc: 'Industrial engine term (Rule 14). Use counterweight ratchet or trundle wheel.',
  },
  {
    id: 'pneumatic',
    regex: /\bpneumatic\b/i,
    desc: 'Modern pressure term (Rule 14).',
  },
  {
    id: 'combustion',
    regex: /\bcombustion\b/i,
    desc: 'Modern chemical/engine term (Rule 14).',
  },
  {
    id: 'hydraulic-assembly',
    regex: /\bhydraulic assembly\b/i,
    desc: 'Modern hydraulic assembly term (Rule 14). Use counterweight winch, weir sluice, or headrace gate.',
  },

  // Firearms & Gunpowder (Rule 14 & Quest Design Rules)
  {
    id: 'firearm',
    regex: /\b(firearms?|blunderbusses?|flintlocks?|matchlocks?|wheellocks?|muskets?|musketeers?|pistols?|shotguns?|rifles?)\b/i,
    desc: 'Firearm in setting with no gunpowder (Rule 14 / Quest Rules). Use heavy arbalest, wall-crossbow, recurve bow, or hand-crossbow.',
  },
  {
    id: 'gunpowder',
    regex: /\b(gunpowder|black ?powder)\b/i,
    desc: 'Gunpowder in setting with no gunpowder (Rule 14 / Quest Rules).',
  },
  {
    id: 'bullet',
    regex: /\b(bullets?|cartridges?)\b/i,
    desc: 'Modern firearm ammunition (Rule 14 / Quest Rules). Use bolts, quarrels, or bodkins.',
  },
];

function isCommand(line) {
  const t = line.trim();
  return t.startsWith('*') || t.startsWith('#');
}

const files = collectFiles(target);
let totalFindings = 0;

for (const file of files) {
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

console.log(`Done. Scanned ${files.length} file(s). Found ${totalFindings} potential anachronism(s).`);

if (isStrict && totalFindings > 0) {
  process.exit(1);
}
