#!/usr/bin/env node
/*
 * lint_weapon_assumption.js — comprehensive equipment & character assumption
 * linter enforcing Section 22 ("Equipment & Character-Agnostic Prose").
 *
 * In A Mercenary's Path, the protagonist's build, weapon type, armor type,
 * shield status, and apparel loadout vary widely across character classes,
 * origins, and equipment choices. Unguarded prose describing the protagonist
 * drawing a sword, angling a shield, wearing plate armor, or pulling up a hood
 * breaks immersion when playing a build that lacks those items.
 *
 * Modules Checked:
 *   1. [WEAPON]: Swords, blades, scabbards, pommels, hilts (requires weapon gate).
 *   2. [SHIELD]: Shields, bucklers, shield rims (requires has_shield / protection style gate).
 *   3. [ARMOR]: Plate armor, breastplates, chainmail hauberks (requires armor_type gate).
 *   4. [APPAREL]: Hoods, cowls, cloaks (requires equipped_<slot>_id gate).
 *   5. [RANGED]: Quivers, arrows, bowstrings (requires bow/ranged gate).
 *   6. [SIDEARM]: Boot-daggers, backup sidearms (requires equipped_sidearm_id gate).
 *   7. [JEWELRY]: Finger rings, neck amulets/pendants (requires equipped_ring/neck gate).
 *   8. [APPAREL_SLOTS]: Gauntlets, bracers, greaves, gloves (requires equipped_hands/feet gate).
 *   9. [MAGIC_FOCUS]: Spellbooks, arcane focuses, component pouches (requires is_caster/class gate).
 *
 * Whitelisting & Suppression:
 *   - Inline comment suppression: Add `*comment lint-ignore: assumption` on the line above/below.
 *   - Automatic idiom exclusion: "to the hilt", "iron grip", "under your belt", etc.
 *   - Verbose mode: Pass `--verbose` to see verified / properly gated uses.
 *   - Strict mode: Pass `--strict` to exit code 1 if unverified violations exist.
 *
 * Usage:
 *   node tools/lint_weapon_assumption.js [path] [--strict] [--verbose]
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const isStrict = args.includes('--strict') || args.includes('--fail');
const isVerbose = args.includes('--verbose') || args.includes('-v');
const targetArg = args.find((a) => !a.startsWith('--') && !a.startsWith('-'));

const target = targetArg
  ? path.resolve(targetArg)
  : path.resolve(__dirname, '..', 'web', 'mygame', 'scenes');

function collectScenes(targetPath) {
  if (!fs.existsSync(targetPath)) return [];
  const stat = fs.statSync(targetPath);
  if (stat.isFile()) return [targetPath];
  return fs
    .readdirSync(targetPath)
    .filter((f) => f.endsWith('.txt') || f.endsWith('.md'))
    .map((f) => path.join(targetPath, f));
}

function indentOf(line) {
  const match = /^(\s*)/.exec(line);
  return match ? match[1].length : 0;
}

function isBlank(line) {
  return line.trim() === '';
}

const EQUIPMENT_RULES = [
  // ── MODULE 1: WEAPON ASSUMPTIONS ─────────────────────────────
  {
    module: 'WEAPON',
    id: 'your-pommel-scabbard',
    regex: /\byour\s+(?:pommel|scabbard|crossguard|quillons)\b/i,
    gates: /\b(?:weapon|weapon_type|equipped_weapon|equipped_mainhand|equipped_sidearm|weapon_hands|weapon_damage_type|has_blade|has_sword|has_dagger|is_ranged|is_caster)\b/i,
    inlineGates: /@\{[^{}]*(?:weapon|weapon_type|equipped_weapon)[^{}]*\|/i,
    desc: 'Assumes protagonist has a pommel/scabbard/crossguard. Non-bladed weapons (quarterstaff, bow, arcane focus) lack these.',
  },
  {
    module: 'WEAPON',
    id: 'your-hilt',
    regex: /\b(?:your\s+hilt|hilt\s+of\s+your\s+(?:weapon|blade|sword))\b/i,
    gates: /\b(?:weapon|weapon_type|equipped_weapon|equipped_mainhand|equipped_sidearm|weapon_hands|weapon_damage_type|has_blade|has_sword|has_dagger|is_ranged|is_caster)\b/i,
    inlineGates: /@\{[^{}]*(?:weapon|weapon_type|equipped_weapon)[^{}]*\|/i,
    desc: 'Assumes protagonist weapon has a sword hilt.',
  },
  {
    module: 'WEAPON',
    id: 'your-blade-sword',
    regex: /\byour\s+(?:sword|blade|rapier|falchion|broadsword|claymore|sabre|saber)\b/i,
    gates: /\b(?:weapon|weapon_type|equipped_weapon|equipped_mainhand|equipped_sidearm|weapon_hands|weapon_damage_type|has_blade|has_sword|has_dagger|is_ranged|is_caster)\b/i,
    inlineGates: /@\{[^{}]*(?:weapon|weapon_type|equipped_weapon)[^{}]*\|/i,
    desc: 'Assumes protagonist is wielding a sword or blade.',
  },
  {
    module: 'WEAPON',
    id: 'draw-sheathe-steel',
    regex: /\b(?:you|you'll|you'd)\s+(?:draw|draws|drawing|drew|unsheathe|unsheathes|unsheathing|sheathe|sheathes|sheathing|slide|sliding)\s+(?:the\s+|your\s+)?(?:sword|blade|steel|scabbard|sheath)\b/i,
    gates: /\b(?:weapon|weapon_type|equipped_weapon|equipped_mainhand|equipped_sidearm|weapon_hands|weapon_damage_type|has_blade|has_sword|has_dagger|is_ranged|is_caster)\b/i,
    inlineGates: /@\{[^{}]*(?:weapon|weapon_type|equipped_weapon)[^{}]*\|/i,
    desc: 'Assumes protagonist is drawing or sheathing a blade/steel.',
  },
  {
    module: 'WEAPON',
    id: 'drawing-sheathing-your',
    regex: /\b(?:drawing|unsheathing|sheathing|sliding)\s+your\s+(?:sword|blade|steel)\b/i,
    gates: /\b(?:weapon|weapon_type|equipped_weapon|equipped_mainhand|equipped_sidearm|weapon_hands|weapon_damage_type|has_blade|has_sword|has_dagger|is_ranged|is_caster)\b/i,
    inlineGates: /@\{[^{}]*(?:weapon|weapon_type|equipped_weapon)[^{}]*\|/i,
    desc: 'Assumes protagonist is drawing or sheathing a blade.',
  },
  {
    module: 'WEAPON',
    id: 'hand-on-pommel-hilt',
    regex: /\b(?:your\s+)?(?:hand|palm|thumb|fingers)\s+(?:rests?|drops?|drifts?|settles?|tightens?|grips?|closes?)\s+(?:on|upon|around|near|against)\s+(?:the|your)\s+(?:pommel|hilt|crossguard)\b/i,
    gates: /\b(?:weapon|weapon_type|equipped_weapon|equipped_mainhand|equipped_sidearm|weapon_hands|weapon_damage_type|has_blade|has_sword|has_dagger|is_ranged|is_caster)\b/i,
    inlineGates: /@\{[^{}]*(?:weapon|weapon_type|equipped_weapon)[^{}]*\|/i,
    desc: 'Assumes protagonist rests hand on a sword pommel/hilt/crossguard.',
  },
  {
    module: 'WEAPON',
    id: 'hand-to-scabbard-hilt',
    regex: /\b(?:hand|palm|thumb)\s+to\s+your\s+(?:pommel|hilt|scabbard|blade)\b/i,
    gates: /\b(?:weapon|weapon_type|equipped_weapon|equipped_mainhand|equipped_sidearm|weapon_hands|weapon_damage_type|has_blade|has_sword|has_dagger|is_ranged|is_caster)\b/i,
    inlineGates: /@\{[^{}]*(?:weapon|weapon_type|equipped_weapon)[^{}]*\|/i,
    desc: 'Assumes protagonist moves hand to their pommel/hilt/scabbard.',
  },

  // ── MODULE 2: SHIELD ASSUMPTIONS ─────────────────────────────
  {
    module: 'SHIELD',
    id: 'shield-assumption',
    regex: /\b(?:your\s+(?:shield|buckler)|angling\s+your\s+shield|behind\s+your\s+shield|plant\s+your\s+shield|rim\s+of\s+your\s+shield|edge\s+of\s+your\s+shield)\b/i,
    gates: /(?:\b(?:has_shield|equipped_shield|shield_equipped)\b|(?:fighter_)?fighting_style\s*=\s*["']protection["'])/i,
    inlineGates: /@\{[^{}]*(?:has_shield|shield)[^{}]*\|/i,
    desc: 'Assumes protagonist is wielding a shield. Two-handed, dual-wielding, ranged, or arcane builds may have no shield.',
  },

  // ── MODULE 3: HEAVY ARMOR ASSUMPTIONS ────────────────────────
  {
    module: 'ARMOR',
    id: 'plate-armor-assumption',
    regex: /\b(?:your\s+(?:breastplate|plate\s+armor|full\s+plate|cuirass|greaves|mail\s+hauberk|chainmail))\b/i,
    gates: /\b(?:armor_type|equipped_armor|equipped_armor_id|has_heavy_armor|has_mail)\b/i,
    inlineGates: /@\{[^{}]*(?:armor_type|equipped_armor)[^{}]*\|/i,
    desc: 'Assumes protagonist is wearing plate, breastplate, or chainmail. Rogues, Barbarians, and Casters may wear leather or cloth.',
  },

  // ── MODULE 4: APPAREL ASSUMPTIONS ────────────────────────────
  {
    module: 'APPAREL',
    id: 'hood-assumption',
    regex: /\b(?:your\s+(?:hood|cowl)|pull\s+(?:up\s+)?your\s+hood|lower\s+your\s+hood|tuck\s+(?:your\s+)?face\s+into\s+your\s+hood)\b/i,
    gates: /\b(?:equipped_head|equipped_head_id|has_hood|has_headgear)\b/i,
    inlineGates: /@\{[^{}]*(?:equipped_head|equipped_head_id)[^{}]*\|/i,
    desc: 'Assumes protagonist is wearing a hood or cowl.',
  },
  {
    module: 'APPAREL',
    id: 'cloak-assumption',
    regex: /\b(?:draw\s+your\s+cloak|wrap\s+your\s+cloak|flinging\s+your\s+cloak|tuck\s+beneath\s+your\s+cloak)\b/i,
    gates: /\b(?:equipped_cloak|equipped_cloak_id|has_cloak)\b/i,
    inlineGates: /@\{[^{}]*(?:equipped_cloak|equipped_cloak_id)[^{}]*\|/i,
    desc: 'Assumes protagonist is wearing a cloak/mantle.',
  },
  {
    module: 'APPAREL',
    id: 'coat-pocket-assumption',
    regex: /\b(?:your|my)\s+(?:coat|jacket|vest|pockets?)\b/i,
    gates: /\b(?:armor_desc\s*=\s*["']Tailored vest["']|equipped_chest)\b/i,
    inlineGates: /@\{[^{}]*(?:armor_desc|equipped_chest)[^{}]*\|/i,
    desc: 'Assumes protagonist is wearing a tailored coat, jacket, vest, or has pockets. Items belong in pouches, satchels, or belts.',
  },

  // ── MODULE 5: RANGED ASSUMPTIONS ─────────────────────────────
  {
    module: 'RANGED',
    id: 'quiver-arrow-assumption',
    regex: /\b(?:reach(?:ing)?\s+for\s+your\s+quiver|draw(?:ing)?\s+an\s+arrow|nock(?:ing)?\s+an\s+arrow|your\s+quiver|your\s+bowstring)\b/i,
    gates: /(?:\b(?:weapon_type|equipped_weapon)\b\s*=\s*["']ranged["']|\bweapon\s*=\s*["']hunting bow["']|\bhas_bow\b|\bhas_quiver\b)/i,
    inlineGates: /@\{[^{}]*(?:weapon|weapon_type|hunting bow)[^{}]*\|/i,
    desc: 'Assumes protagonist has a bow/quiver/arrow. Crossbows use bolt-pouches, and melee builds have none.',
  },

  // ── MODULE 6: SIDEARM ASSUMPTIONS ────────────────────────────
  {
    module: 'SIDEARM',
    id: 'sidearm-boot-dagger-assumption',
    regex: /\b(?:your\s+boot-dagger|dagger\s+from\s+your\s+boot|draw\s+your\s+sidearm|reach\s+for\s+your\s+sidearm|your\s+secondary\s+dagger)\b/i,
    gates: /\b(?:equipped_sidearm|equipped_sidearm_id|has_sidearm|has_dagger|has_boot_dagger)\b/i,
    inlineGates: /@\{[^{}]*(?:equipped_sidearm|equipped_sidearm_id)[^{}]*\|/i,
    desc: 'Assumes protagonist is carrying a sidearm or boot-dagger.',
  },

  // ── MODULE 7: JEWELRY ASSUMPTIONS ────────────────────────────
  {
    module: 'JEWELRY',
    id: 'ring-amulet-assumption',
    regex: /\b(?:the\s+ring\s+on\s+your\s+finger|twist(?:ing)?\s+your\s+ring|amulet\s+(?:at|around)\s+your\s+neck|pendant\s+(?:at|around)\s+your\s+neck)\b/i,
    gates: /\b(?:equipped_ring1|equipped_ring2|equipped_ring1_id|equipped_ring2_id|equipped_neck|equipped_neck_id|has_ring|has_amulet|has_pendant)\b/i,
    inlineGates: /@\{[^{}]*(?:equipped_ring|equipped_neck)[^{}]*\|/i,
    desc: 'Assumes protagonist is wearing a finger ring or neck amulet/pendant.',
  },

  // ── MODULE 8: APPAREL SLOTS ASSUMPTIONS ──────────────────────
  {
    module: 'APPAREL_SLOTS',
    id: 'gauntlets-gloves-assumption',
    regex: /\b(?:your\s+iron\s+gauntlets|your\s+archer\s+bracers|the\s+leather\s+of\s+your\s+gloves|your\s+iron\s+greaves)\b/i,
    gates: /\b(?:equipped_hands|equipped_hands_id|equipped_feet|equipped_feet_id|has_gloves|has_gauntlets|has_bracers)\b/i,
    inlineGates: /@\{[^{}]*(?:equipped_hands|equipped_feet)[^{}]*\|/i,
    desc: 'Assumes protagonist is wearing specific gauntlets, bracers, greaves, or gloves.',
  },

  // ── MODULE 9: MAGIC FOCUS ASSUMPTIONS ────────────────────────
  {
    module: 'MAGIC_FOCUS',
    id: 'spellbook-focus-assumption',
    regex: /\b(?:your\s+spellbook|your\s+arcane\s+focus|channel(?:ing)?\s+through\s+your\s+focus|your\s+component\s+pouch)\b/i,
    gates: /\b(?:is_caster|character_class\s*=\s*["'](?:wizard|warlock|bard|cleric|sorcerer)["']|wizard_spell|warlock_spell|has_spellbook|has_focus)\b/i,
    inlineGates: /@\{[^{}]*(?:is_caster|wizard|warlock|spellbook)[^{}]*\|/i,
    desc: 'Assumes protagonist has a spellbook, arcane focus, or component pouch.',
  },
];

// Whitelist / Backstory Directives: Known backstory or narrative lines that intentionally mention past items
const GLOBAL_WHITELIST = [
  // Disgraced Scion origin backstory prologue (pawned ring before campaign start)
  /pawned your signet ring at a frontier outpost/i,
  // Disgraced Scion intake selection description
  /You button a close-fitted vest under your coat/i,
  // Lyra streetwise advice dialogue in Alderford
  /fishing your pockets out of the muck/i,
];

// Walk backward from match line index to find enclosing conditions
function findEnclosingConditions(lines, matchLineIdx) {
  const conditions = [];
  let threshold = indentOf(lines[matchLineIdx]);
  for (let i = matchLineIdx - 1; i >= 0; i--) {
    const line = lines[i];
    if (isBlank(line)) continue;
    if (/^\s*\*label\b/.test(line)) break;
    const ind = indentOf(line);
    if (ind >= threshold) continue;
    if (/^\s*\*(?:if|elseif|else)\b/.test(line)) {
      conditions.push(line.trim());
      threshold = ind;
      if (threshold === 0) break;
    } else {
      threshold = ind;
      if (threshold === 0) break;
    }
  }
  return conditions;
}

// Check if a line has an inline comment suppression directive (*comment lint-ignore: assumption)
function hasSuppressionDirective(lines, lineIdx) {
  // Check previous line and current line
  for (let offset of [-1, 0, 1]) {
    const idx = lineIdx + offset;
    if (idx >= 0 && idx < lines.length) {
      if (/^\s*\*comment\s+(?:lint-ignore|allow-assumption|suppress-assumption)\b/i.test(lines[idx])) {
        return true;
      }
    }
  }
  return false;
}

function lintFile(file) {
  const text = fs.readFileSync(file, 'utf8');
  const lines = text.split(/\r?\n/);
  const violations = [];
  const reviews = [];

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    if (isBlank(raw)) continue;
    const trimmed = raw.trim();

    // Skip ChoiceScript commands (variable setting, labels, comments)
    if (/^\*/.test(trimmed)) continue;

    // Check inline suppression directive
    if (hasSuppressionDirective(lines, i)) continue;

    // Check global whitelist patterns
    if (GLOBAL_WHITELIST.some((wl) => wl.test(trimmed))) continue;

    for (const rule of EQUIPMENT_RULES) {
      const match = rule.regex.exec(trimmed);
      if (!match) continue;

      // Filter out idioms like "to the hilt" unless "your blade/sword" is present
      if (/\bto\s+the\s+hilt\b/i.test(match[0]) && !/\byour\s+(?:blade|sword|dagger)\b/i.test(trimmed)) {
        continue;
      }

      // Check inline multireplaces on this line
      const inlineGated = rule.inlineGates.test(trimmed);

      // Check enclosing conditions up the indentation tree
      const conditions = findEnclosingConditions(lines, i);
      const ancestorGated = conditions.some((c) => rule.gates.test(c));

      const entry = {
        file,
        line: i + 1,
        module: rule.module,
        rule: rule.id,
        snippet: match[0],
        context: trimmed.slice(0, 100),
        desc: rule.desc,
      };

      if (inlineGated || ancestorGated) {
        reviews.push(entry);
      } else {
        violations.push(entry);
      }
    }
  }

  return { violations, reviews };
}

const files = collectScenes(target);
let allViolations = [];
let allReviews = [];

for (const file of files) {
  const { violations, reviews } = lintFile(file);
  allViolations = allViolations.concat(violations);
  allReviews = allReviews.concat(reviews);
}

console.log(`Scanned ${files.length} file(s).\n`);

if (allViolations.length === 0) {
  console.log('No unverified equipment/character assumption violations found.');
} else {
  console.log(`${allViolations.length} VIOLATION(s) — unverified equipment assumption without enclosing gate:\n`);
  for (const f of allViolations) {
    console.log(`[${f.module}:${f.rule}] ${path.relative(process.cwd(), f.file)}:${f.line}`);
    console.log(`  Match: "${f.snippet}"`);
    console.log(`  Line: ${f.context}`);
    console.log(`  Rule: ${f.desc}`);
    console.log();
  }
}

if (isVerbose && allReviews.length > 0) {
  console.log(`\n${allReviews.length} VERIFIED / PROPERLY GATED USES (--verbose):`);
  for (const f of allReviews) {
    console.log(`  ${path.relative(process.cwd(), f.file)}:${f.line} [${f.module}:${f.rule}] "${f.snippet}"`);
  }
}

if (isStrict && allViolations.length > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
