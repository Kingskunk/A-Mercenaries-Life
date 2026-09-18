const fs = require('fs');
const path = require('path');

// Test that pv_crane_shift_str and pv_crane_shift_cha are now completely clean of multiple advance_time calls on a single page
const pvContent = fs.readFileSync(path.join(__dirname, '../web/mygame/scenes/port_valen.txt'), 'utf8');

console.log('Checking advance_time occurrences on crane shift...');
const lines = pvContent.split(/\r?\n/);
let inCha = false;
let chaAdvances = 0;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('*label pv_crane_shift_cha')) {
    inCha = true;
  }
  if (inCha && line.includes('*label pv_crane_shift_resolve')) {
    inCha = false;
  }
  if (inCha && line.includes('*gosub_scene calendar advance_time')) {
    chaAdvances++;
  }
}
console.log(`advance_time calls in pv_crane_shift_cha: ${chaAdvances} (expected: 1)`);
if (chaAdvances === 1) {
  console.log('SUCCESS: pv_crane_shift_cha has exactly 1 advance_time call.');
} else {
  console.error('FAILURE: Unexpected number of advance_time calls in pv_crane_shift_cha.');
}

let inStr = false;
let strSetsHpDirectly = false;
let strSetsNeglectDebt = false;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('*label pv_crane_shift_str')) {
    inStr = true;
  }
  if (inStr && line.includes('*label pv_crane_shift_dex')) {
    inStr = false;
  }
  if (inStr && line.includes('*set hp_current -')) {
    strSetsHpDirectly = true;
  }
  if (inStr && line.includes('*set neglect_damage_fatigue + 2')) {
    strSetsNeglectDebt = true;
  }
}
console.log(`pv_crane_shift_str sets hp_current directly: ${strSetsHpDirectly} (expected: false)`);
console.log(`pv_crane_shift_str sets neglect_damage_fatigue: ${strSetsNeglectDebt} (expected: true)`);
