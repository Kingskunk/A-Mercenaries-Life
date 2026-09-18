const fs = require('fs');
const path = require('path');

const portValenPath = path.join(__dirname, '../web/mygame/scenes/port_valen.txt');
const startupPath = path.join(__dirname, '../web/mygame/scenes/startup.txt');

const pvContent = fs.readFileSync(portValenPath, 'utf8');
const startupContent = fs.readFileSync(startupPath, 'utf8');

const pvLines = pvContent.split(/\r?\n/);
const startupLines = startupContent.split(/\r?\n/);

console.log('=== AUDITING PORT_VALEN.TXT ===');
console.log(`Total lines: ${pvLines.length}`);

// 1. Collect all *create in startup
const createdVars = new Set();
for (const line of startupLines) {
  const match = line.match(/^\s*\*create\s+([a-zA-Z0-9_]+)/);
  if (match) {
    createdVars.add(match[1]);
  }
}

// 2. Collect all labels and *temp in port_valen
const labels = new Set();
const tempVars = new Set();
for (let i = 0; i < pvLines.length; i++) {
  const line = pvLines[i];
  const labelMatch = line.match(/^\s*\*label\s+([a-zA-Z0-9_]+)/);
  if (labelMatch) labels.add(labelMatch[1]);
  const tempMatch = line.match(/^\s*\*temp\s+([a-zA-Z0-9_]+)/);
  if (tempMatch) tempVars.add(tempMatch[1]);
}

// 3. Check gotos and gosubs within port_valen
const brokenGotos = [];
for (let i = 0; i < pvLines.length; i++) {
  const line = pvLines[i];
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

// 4. Check variables used in *set, *if, *elseif, ${...}
const unknownVars = [];
const varRegex = /[a-zA-Z_][a-zA-Z0-9_]*/g;
const systemKeywords = new Set([
  'if', 'elseif', 'else', 'choice', 'selectable_if', 'set', 'goto', 'gosub', 'gosub_scene',
  'goto_scene', 'return', 'finish', 'page_break', 'line_break', 'comment', 'temp', 'create',
  'rand', 'print', 'show_stat_hints', 'true', 'false', 'and', 'or', 'not', 'modulo', 'round'
]);

for (let i = 0; i < pvLines.length; i++) {
  const line = pvLines[i];
  const trimmed = line.trim();
  if (trimmed.startsWith('*comment')) continue;

  // check *set var
  const setMatch = trimmed.match(/^\*set\s+([a-zA-Z0-9_]+)/);
  if (setMatch) {
    const v = setMatch[1];
    if (!createdVars.has(v) && !tempVars.has(v)) {
      unknownVars.push({ line: i + 1, var: v, reason: '*set unknown var', text: line });
    }
  }

  // check *rand var
  const randMatch = trimmed.match(/^\*rand\s+([a-zA-Z0-9_]+)/);
  if (randMatch) {
    const v = randMatch[1];
    if (!createdVars.has(v) && !tempVars.has(v)) {
      unknownVars.push({ line: i + 1, var: v, reason: '*rand unknown var', text: line });
    }
  }
}
console.log(`Unknown variable assignments: ${unknownVars.length}`);
unknownVars.forEach(u => console.log(`  Line ${u.line}: ${u.var} (${u.reason}) -> ${u.text.trim()}`));

// 5. Look for *set var -1 (decrement shorthand vs literal)
const setNegatives = [];
for (let i = 0; i < pvLines.length; i++) {
  const line = pvLines[i];
  if (line.match(/^\s*\*set\s+[a-zA-Z0-9_]+\s+-\s*\d+/)) {
    setNegatives.push({ line: i + 1, text: line.trim() });
  }
}
console.log(`*set var -N found (check if decrement intended or literal): ${setNegatives.length}`);
setNegatives.forEach(s => console.log(`  Line ${s.line}: ${s.text}`));

// 6. Look for page boundaries vs advance_time calls without page_break/choice
console.log('\nChecking advance_time sequences...');
let lastAdvanceTimeLine = -1;
let lastPageBreakOrChoice = -1;
for (let i = 0; i < pvLines.length; i++) {
  const line = pvLines[i].trim();
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
