const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('Testing camp wash options in overworld/camp.txt...');

const campPath = path.join(__dirname, '..', 'web', 'mygame', 'scenes', 'overworld', 'camp.txt');
const campText = fs.readFileSync(campPath, 'utf8');

// Verify temp variables declared
assert(campText.includes('*temp cp_wash_recent (minutes_since_wash < 360)'), 'cp_wash_recent defined');
assert(campText.includes('*temp cp_wash_has_jug ((has_water_jug) and (jug_full >= 1))'), 'cp_wash_has_jug defined');
assert(campText.includes('*temp cp_wash_stream_ok false'), 'cp_wash_stream_ok defined');
assert(campText.includes('*temp cp_wash_jug_ok false'), 'cp_wash_jug_ok defined');

// Verify choice options
assert(campText.includes('# Wash with soap at ${ow_water_name}. [~5 min]'), 'Stream wash choice option exists');
assert(campText.includes('# Wash using 1 water jug. [~5 min]'), 'Jug wash choice option exists');
assert(!campText.includes('sponge wash'), 'Must NOT contain sponge wash');

// Verify closures
assert(campText.includes('# Wash with soap at ${ow_water_name}: you washed not long ago.'), 'Stream recent closure choice exists');
assert(campText.includes('# Wash with soap at ${ow_water_name}: you have no soap.'), 'Stream no soap closure choice exists');
assert(campText.includes('# Wash using 1 water jug: you washed not long ago.'), 'Jug recent closure choice exists');
assert(campText.includes('# Wash using 1 water jug: you have no soap.'), 'Jug no soap closure choice exists');
assert(campText.includes('# Wash with soap: there is no water near this camp and your jugs are empty.'), 'No water + jugs empty closure exists');
assert(campText.includes('# Wash with soap: there is no water near this camp.'), 'No water closure exists');

// Verify labels
assert(campText.includes('*label camp_wash_stream'), 'camp_wash_stream label exists');
assert(campText.includes('*label camp_wash_jug'), 'camp_wash_jug label exists');
assert(campText.includes('*label camp_wash_closed_recent'), 'camp_wash_closed_recent label exists');
assert(campText.includes('*label camp_wash_closed_no_soap'), 'camp_wash_closed_no_soap label exists');
assert(campText.includes('*label camp_wash_closed_no_water'), 'camp_wash_closed_no_water label exists');

// Verify actions spend soap, reset wash clock, set hygiene stage
assert(campText.includes('*gosub_scene equipment spend_consumable "lye_soap"'), 'spends lye_soap');
assert(campText.includes('*set minutes_since_wash 0'), 'resets minutes_since_wash');
assert(campText.includes('*set hygiene_stage "Clean"'), 'sets hygiene_stage to Clean');
assert(campText.includes('*set jug_full (jug_full - 1)'), 'decrements jug_full');
assert(campText.includes('*set time_advance_call_id "camp_wash_stream_1"'), 'time advance call id for stream wash');
assert(campText.includes('*set time_advance_call_id "camp_wash_jug_1"'), 'time advance call id for jug wash');

console.log('camp wash checks: ALL PASSED!');

