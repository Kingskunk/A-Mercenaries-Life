const fs = require('fs');
const path = require('path');

const dredgeEndPath = path.join(__dirname, '../web/mygame/scenes/port_valen_dredge_end.txt');
const startupPath = path.join(__dirname, '../web/mygame/scenes/startup.txt');

const deContent = fs.readFileSync(dredgeEndPath, 'utf8');
const startupContent = fs.readFileSync(startupPath, 'utf8');

const deLines = deContent.split(/\r?\n/);
const startupLines = startupContent.split(/\r?\n/);

console.log('=== AUDITING PORT_VALEN_DREDGE_END.TXT ===');
console.log(`Total lines: ${deLines.length}`);

// 1. Collect all *create in startup
const createdVars = new Set();
for (const line of startupLines) {
  const match = line.match(/^\s*\*create\s+([a-zA-Z0-9_]+)/);
  if (match) {
    createdVars.add(match[1]);
  }
}

// 2. Collect all labels and *temp in dredge_end
const labels = new Set();
const tempVars = new Set();
for (let i = 0; i < deLines.length; i++) {
  const line = deLines[i];
  const labelMatch = line.match(/^\s*\*label\s+([a-zA-Z0-9_]+)/);
  if (labelMatch) labels.add(labelMatch[1]);
  const tempMatch = line.match(/^\s*\*temp\s+([a-zA-Z0-9_]+)/);
  if (tempMatch) tempVars.add(tempMatch[1]);
}

// 3. Check gotos and gosubs within dredge_end
const brokenGotos = [];
for (let i = 0; i < deLines.length; i++) {
  const line = deLines[i];
  const gotoMatch = line.match(/^\s*\*goto\s+([a-zA-Z0-9_]+)/);
  if (gotoMatch) {
    const target = gotoMatch[1];
    if (!labels.has(target)) {
      brokenGotos.push({ line: i + 1, target, text: line });
    }
  }
  const gosubMatch = line.match(/^\s*\*gosub\s+([a-zA-Z0-9_]+)/);
  if (gosubMatch) {
    const target = gosubMatch[1];
    if (!labels.has(target)) {
      brokenGotos.push({ line: i + 1, target: `gosub:${target}`, text: line });
    }
  }
}
console.log(`Broken internal *goto/*gosub targets: ${brokenGotos.length}`);
brokenGotos.forEach(b => console.log(`  Line ${b.line}: ${b.text}`));

// 4. Check variables used in *set, *rand
const unknownVars = [];
for (let i = 0; i < deLines.length; i++) {
  const line = deLines[i];
  const trimmed = line.trim();
  if (trimmed.startsWith('*comment')) continue;

  const setMatch = trimmed.match(/^\*set\s+([a-zA-Z0-9_]+)/);
  if (setMatch) {
    const v = setMatch[1];
    if (!createdVars.has(v) && !tempVars.has(v)) {
      unknownVars.push({ line: i + 1, var: v, reason: '*set unknown var', text: line });
    }
  }
}
console.log(`Unknown variable assignments: ${unknownVars.length}`);
unknownVars.forEach(u => console.log(`  Line ${u.line}: ${u.var} (${u.reason}) -> ${u.text.trim()}`));

// 5. Look for unguarded relative increments/decrements (+N, -N)
console.log('\nChecking relative mutations (+N, -N)...');
const unguardedMutations = [];
let insideLock = false;
let lockPageVar = '';
for (let i = 0; i < deLines.length; i++) {
  const line = deLines[i].trim();
  if (line.startsWith('*comment')) continue;

  const mutMatch = line.match(/^\*set\s+([a-zA-Z0-9_]+)\s+([+-]\s*\d+|\+[a-zA-Z0-9_]+)/);
  if (mutMatch) {
    const varName = mutMatch[1];
    // Exclude loop counters / internal temp variables
    if (!tempVars.has(varName)) {
      console.log(`  Line ${i + 1}: *set ${varName} ${mutMatch[2]}`);
    }
  }
}

// 6. Look for page boundaries vs advance_time calls without page_break/choice
console.log('\nChecking advance_time sequences...');
let lastAdvanceTimeLine = -1;
let lastPageBreakOrChoice = -1;
for (let i = 0; i < deLines.length; i++) {
  const line = deLines[i].trim();
  if (line.startsWith('*page_break') || line.startsWith('*choice')) {
    lastPageBreakOrChoice = i + 1;
    lastAdvanceTimeLine = -1;
  }
  if (line.includes('*gosub_scene calendar advance_time')) {
    if (lastAdvanceTimeLine !== -1) {
      console.log(`  WARNING: Multiple advance_time calls on same page: line ${lastAdvanceTimeLine} and line ${i + 1} (last page boundary: line ${lastPageBreakOrChoice})`);
    }
    lastAdvanceTimeLine = i + 1;
  }
}
