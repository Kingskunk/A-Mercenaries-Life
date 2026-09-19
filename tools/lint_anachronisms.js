#!/usr/bin/env node
/*
 * lint_anachronisms.js — flags modern chemical, industrial, engineering,
 * medical, and firearm vocabulary violating Section 14 / Section 24 ("Grounded Economy,
 * Metallurgy & Low-Fantasy Worldbuilding" & "Quest Design Rules").
 *
 * Checks non-command prose/dialogue lines for:
 *   - Firearms, Gunpowder & Artillery: blunderbusses, flintlocks, muskets, pistols, cannons, gunpowder, etc.
 *   - Modern Medicine & Biology: antiseptic, antibiotic, bacteria, sterilization, calories, etc.
 *   - Chemical & Metallurgy terms: "high-carbon", "carbon steel", "titanium", "chemical reaction", etc.
 *   - Industrial/Mechanical terms: "turbine", "steam engine", "drive-cam", "drive-shaft", "flywheel",
 *     "pneumatic", "combustion", "hydraulic assembly", "assembly line", etc.
 *   - Mass Print Media & Electricity: "printing press", "newspaper", "electricity", etc.
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

const defaultTargets = [
  path.resolve(__dirname, '..', 'web', 'mygame', 'scenes'),
  path.resolve(__dirname, '..', 'quest'),
];

const targets = targetArg ? [path.resolve(targetArg)] : defaultTargets;

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
  // Metallurgy & Modern Chemical Terminology (Rule 14 / Section 4.D)
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
    id: 'aluminum',
    regex: /\b(aluminum|aluminium)\b/i,
    desc: 'Modern industrial element (Rule 14).',
  },
  {
    id: 'chemical-reaction',
    regex: /\b(chemical reactions?|chemical compounds?)\b/i,
    desc: 'Modern chemical terminology (Rule 14). Use alchemical reaction, vitriol, or reagent.',
  },
  {
    id: 'calories',
    regex: /\bcalories?\b/i,
    desc: '19th-century thermodynamics/nutritional term (Rule 14 / Section 4.E).',
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
  {
    id: 'plastic-synthetic',
    regex: /\b(plastics?|synthetics?)\b/i,
    desc: 'Modern synthetic materials (Rule 14). Use horn, boiled leather, resin, or pitch.',
  },

  // Mechanical & Industrial Engineering (Rule 14 / Section 4.A)
  {
    id: 'turbine',
    regex: /\bturbines?\b/i,
    desc: '19th-century hydro-engineering term (Rule 14 / Section 4.A). Use waterwheel, mill-wheel, paddle-wheel, or flume.',
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
    desc: 'Modern pressure term (Rule 14 / Section 4.A).',
  },
  {
    id: 'combustion',
    regex: /\bcombustion\b/i,
    desc: 'Modern chemical/engine term (Rule 14 / Section 4.A).',
  },
  {
    id: 'hydraulic-assembly',
    regex: /\bhydraulic assembly\b/i,
    desc: 'Modern hydraulic assembly term (Rule 14 / Section 4.A). Use counterweight winch, weir sluice, or headrace gate.',
  },
  {
    id: 'steam-power',
    regex: /\b(steam ?engines?|locomotives?|railways?|railroads?)\b/i,
    desc: 'Modern steam technology (Section 4.A). Setting relies on waterwheels, windmills, treadwheels, and capstans.',
  },
  {
    id: 'mass-production',
    regex: /\b(assembly lines?|conveyor belts?)\b/i,
    desc: 'Modern mass production (Section 4.A). Craftsmanship is manual or kinetic/water-powered.',
  },

  // Firearms & Gunpowder Artillery (Rule 14 & Section 4.F)
  {
    id: 'firearm',
    regex: /\b(firearms?|blunderbusses?|flintlocks?|matchlocks?|wheellocks?|muskets?|musketeers?|pistols?|shotguns?|rifles?|arquebus(es)?|arquebusiers?|culverins?)\b/i,
    desc: 'Firearm in setting with zero gunpowder (Rule 14 / Section 4.F). Use heavy arbalest, cranequin crossbow, recurve bow, or bodkin quarrel.',
  },
  {
    id: 'gunpowder-artillery',
    regex: /\b(cannons?|cannonballs?|bombards?)\b/i,
    desc: 'Gunpowder artillery in setting with zero gunpowder (Section 4.F). Use ballista, scorpion, catapult, or counterweight trebuchet.',
  },
  {
    id: 'gunpowder-explosives',
    regex: /\b(gunpowder|black ?powder|dynamite|nitroglycerin|tnt)\b/i,
    desc: 'Explosives in setting with zero gunpowder (Rule 14 / Section 4.F).',
  },
  {
    id: 'bullet',
    regex: /\b(bullets?|cartridges?)\b/i,
    desc: 'Modern firearm ammunition (Rule 14 / Section 4.F). Use bolts, quarrels, or bodkins.',
  },

  // Pre-Modern Medicine vs. Modern Clinical Terms (Section 4.E)
  {
    id: 'modern-antiseptic',
    regex: /\b(antiseptics?|antibiotics?|disinfectants?)\b/i,
    desc: 'Modern clinical medicine (Section 4.E). Use vinegar wash, wine soak, aqua vitae, boiled tallow, or herbal wash.',
  },
  {
    id: 'sterilization',
    regex: /\b(steriliz(e|ed|ation|ing))\b/i,
    desc: 'Modern germ-theory sterilization (Section 4.E). Use cleansed, washed, boiled, or cauterized.',
  },
  {
    id: 'microbiology',
    regex: /\b(bacteri(a|al)|microbes?|microscopic|germ theory|cellular biology)\b/i,
    desc: 'Modern microbiological terminology (Section 4.E). Use foul humors, rot, pestilence, miasma, or putrefaction.',
  },

  // Mass Media & Mechanized Printing (Section 4.B)
  {
    id: 'mass-print-media',
    regex: /\b(printing ?press(es)?|newspapers?)\b/i,
    desc: 'Mass mechanized printing (Section 4.B). Documents in setting are hand-scribed, vellum folios, wax-sealed ledgers, or stamped manifests.',
  },

  // Modern Electricity (Section 4.A)
  {
    id: 'electricity',
    regex: /\b(electric(ity|al)?|voltages?|power ?grids?)\b/i,
    desc: 'Modern electrical concepts (Section 4.A).',
  },
];

function isCommand(line, filePath) {
  const t = line.trim();
  if (!t) return true;
  if (t.startsWith('*') || t.startsWith('#')) return true;
  if (filePath && filePath.endsWith('.md')) {
    if (t.startsWith('-') || t.startsWith('>') || t.startsWith('|')) return true;
  }
  return false;
}

const allFiles = [];
for (const t of targets) {
  allFiles.push(...collectFiles(t));
}
// Deduplicate files
const files = [...new Set(allFiles)];
let totalFindings = 0;

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split(/\r?\n/);
  const rel = path.relative(process.cwd(), file);

  lines.forEach((line, idx) => {
    if (isCommand(line, file)) return;

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
