const fs = require('fs');
const path = require('path');

const pvContent = fs.readFileSync(path.join(__dirname, '../web/mygame/scenes/port_valen.txt'), 'utf8');
const lines = pvContent.split(/\r?\n/);

const names = ['Maret', 'Cutter', 'Voss', 'Dell', 'Rilla', 'Varren', 'Lyra', 'Kestrel', 'Ysolde', 'Elspeth', 'Vane'];

names.forEach(name => {
  console.log(`\n--- Mentions of ${name} ---`);
  let count = 0;
  lines.forEach((line, idx) => {
    if (line.includes(name) && !line.trim().startsWith('*comment')) {
      count++;
      if (count <= 5) {
        console.log(`  Line ${idx + 1}: ${line.trim()}`);
      }
    }
  });
  console.log(`  Total mentions: ${count}`);
});
