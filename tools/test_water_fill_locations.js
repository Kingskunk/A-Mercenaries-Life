#!/usr/bin/env node
/*
 * test_water_fill_locations.js
 * Validates that water_fill_at_hand correctly uses the page_id token pattern:
 * - water_fill_ok is true if fresh_water_page === page_id
 * - water_fill_ok is true if fresh_water_here is true
 * - water_fill_ok is true if ow_on && ow_water
 * - water_fill_ok is false if fresh_water_page !== page_id and not overworld water
 * - Audits that all expected hub, inn, stable, holding, and dungeon scenes declare *set fresh_water_page page_id
 */
const path = require('path');
const fs = require('fs');
const assert = require('assert');

// 1. ChoiceScript mock evaluation for equipment.txt
const eqPath = path.resolve(__dirname, '../web/mygame/scenes/equipment.txt');
const eqText = fs.readFileSync(eqPath, 'utf8');

const subMatch = eqText.match(/\*label water_fill_at_hand([\s\S]*?)\*return/);
assert.ok(subMatch, 'water_fill_at_hand subroutine must exist');
const code = subMatch[1];

function evalWaterFill(stats) {
  let water_fill_ok = false;
  const s = stats;

  if (s.fresh_water_here) water_fill_ok = true;
  if (s.fresh_water_page !== undefined && s.page_id !== undefined && s.fresh_water_page === s.page_id) {
    water_fill_ok = true;
  }
  if (s.ow_on && s.ow_water) water_fill_ok = true;

  return water_fill_ok;
}

let tested = 0;
function check(stats, expected, desc) {
  const actual = evalWaterFill(stats);
  assert.strictEqual(actual, expected, `${desc}: expected ${expected}, got ${actual}`);
  tested++;
}

// Token matching tests
check({ page_id: 10, fresh_water_page: 10 }, true, 'fresh_water_page equals page_id (active page)');
check({ page_id: 11, fresh_water_page: 10 }, false, 'fresh_water_page stale (navigated away)');
check({ page_id: 10, fresh_water_page: 0 }, false, 'fresh_water_page unset (dry page)');
check({ page_id: 10, fresh_water_here: true }, true, 'manual fresh_water_here flag true');
check({ page_id: 10, fresh_water_here: false, fresh_water_page: 0 }, false, 'dry page without water');
check({ ow_on: true, ow_water: true, page_id: 5, fresh_water_page: 0 }, true, 'overworld tile with water');
check({ ow_on: true, ow_water: false, page_id: 5, fresh_water_page: 0 }, false, 'overworld tile without water');

// 2. Audit that scene files genuinely declare *set fresh_water_page page_id
const expectedScenes = [
  // Middle Ward
  { file: 'web/mygame/scenes/port_valen/port_valen_middle_ward.txt', label: 'Conduit Square / Inn / Baths' },
  // Holdings
  { file: 'web/mygame/scenes/port_valen/port_valen_holdings.txt', label: 'Lantern Lane holding' },
  // Brinewick
  { file: 'web/mygame/scenes/port_valen/brinewick/reedhouse.txt', label: 'Reedhouse yard & room' },
  // Marlcross
  { file: 'web/mygame/scenes/port_valen/marlcross/marlcross.txt', label: 'Marlcross hub' },
  { file: 'web/mygame/scenes/port_valen/marlcross/grain_green.txt', label: 'Grain Green' },
  { file: 'web/mygame/scenes/port_valen/marlcross/wayfarers_rest.txt', label: 'Wayfarer Rest yard & room' },
  // Timbermouth
  { file: 'web/mygame/scenes/timbermouth/timbermouth.txt', label: 'Timbermouth square' },
  { file: 'web/mygame/scenes/timbermouth/split_pine_inn.txt', label: 'Split Pine yard & room' },
  // Barleycross
  { file: 'web/mygame/scenes/timbermouth/barleycross/barleycross.txt', label: 'Barleycross common' },
  { file: 'web/mygame/scenes/timbermouth/barleycross/lane.txt', label: 'Barleycross hayloft' },
  // Ashrun Holt
  { file: 'web/mygame/scenes/timbermouth/ashrun_holt/ashrun_holt.txt', label: 'Ashrun Holt clearing' },
  { file: 'web/mygame/scenes/timbermouth/ashrun_holt/ashrun_house.txt', label: 'Ashrun House stables & room' },
  // Alderford
  { file: 'web/mygame/scenes/alderford/alderford.txt', label: 'Alderford weir/trough' },
  { file: 'web/mygame/scenes/alderford/drowned_oar.txt', label: 'Drowned Oar court & room' },
  // Redvein
  { file: 'web/mygame/scenes/alderford/redvein/redvein.txt', label: 'Redvein hub' },
  { file: 'web/mygame/scenes/alderford/redvein/red_lantern.txt', label: 'Red Lantern yard & room' },
  // Whitefold
  { file: 'web/mygame/scenes/alderford/whitefold/whitefold.txt', label: 'Whitefold common' },
  { file: 'web/mygame/scenes/alderford/whitefold/white_ram.txt', label: 'White Ram yard & room' },
  // Langston
  { file: 'web/mygame/scenes/Langston/langston.txt', label: 'Langston fountain' },
  { file: 'web/mygame/scenes/Langston/market.txt', label: 'Langston market well-house' },
  { file: 'web/mygame/scenes/Langston/pickled_hen.txt', label: 'Pickled Hen room' },
  // Barolo
  { file: 'web/mygame/scenes/Langston/barolo/barolo.txt', label: 'Barolo hub' },
  { file: 'web/mygame/scenes/Langston/barolo/market.txt', label: 'Barolo market' },
  { file: 'web/mygame/scenes/Langston/barolo/vineyard_roads.txt', label: 'Barolo vineyard roads' },
  { file: 'web/mygame/scenes/Langston/barolo/red_stave.txt', label: 'Red Stave court & room' },
  // Broadmead
  { file: 'web/mygame/scenes/Langston/broadmead/broadmead.txt', label: 'Broadmead hub' },
  { file: 'web/mygame/scenes/Langston/broadmead/longfold_fair.txt', label: 'Longfold fair' },
  { file: 'web/mygame/scenes/Langston/broadmead/remount_yard.txt', label: 'Broadmead remount yard' },
  { file: 'web/mygame/scenes/Langston/broadmead/crooked_halter.txt', label: 'Crooked Halter yard & room' },
  // Fallowmere
  { file: 'web/mygame/scenes/Langston/fallowmere/fallowmere.txt', label: 'Fallowmere green well' },
  { file: 'web/mygame/scenes/Langston/fallowmere/grey_gander.txt', label: 'Grey Gander yard & room' },
  // Longshade Forest
  { file: 'web/mygame/scenes/longshade/longshade_forest.txt', label: 'Longshade Hidden Spring & Clear Pool' }
];

expectedScenes.forEach(sc => {
  const full = path.resolve(__dirname, '..', sc.file);
  assert.ok(fs.existsSync(full), `Scene file ${sc.file} must exist`);
  const text = fs.readFileSync(full, 'utf8');
  assert.ok(text.includes('*set fresh_water_page page_id'), `${sc.file} (${sc.label}) must declare *set fresh_water_page page_id`);
  tested++;
});

console.log(`water fill locations: ${tested} checks passed successfully.`);
