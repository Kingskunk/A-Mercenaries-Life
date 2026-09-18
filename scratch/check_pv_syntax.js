const fs = require('fs');
const path = require('path');

const pvContent = fs.readFileSync(path.join(__dirname, '../web/mygame/scenes/port_valen.txt'), 'utf8');
const lines = pvContent.split(/\r?\n/);

console.log('Checking parentheses and multireplaces...');
lines.forEach((line, idx) => {
  const lineNum = idx + 1;
  const trimmed = line.trim();
  if (trimmed.startsWith('*comment')) return;

  // Check paren matching
  let open = 0;
  for (let ch of line) {
    if (ch === '(') open++;
    if (ch === ')') open--;
  }
  if (open !== 0) {
    console.log(`Line ${lineNum}: Unbalanced parentheses (${open}): ${line}`);
  }

  // Check @{...} multireplaces
  const mrMatches = line.match(/@\{[^}]*\}/g);
  if (mrMatches) {
    mrMatches.forEach(mr => {
      // Check for nested multireplace
      if (mr.slice(2, -1).includes('@{')) {
        console.log(`Line ${lineNum}: Nested multireplace: ${mr}`);
      }
      // Check for pipe
      if (!mr.includes('|')) {
        console.log(`Line ${lineNum}: Multireplace missing pipe: ${mr}`);
      }
    });
  }
});

console.log('Done checking syntax.');
