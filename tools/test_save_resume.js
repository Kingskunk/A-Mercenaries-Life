#!/usr/bin/env node
/*
 * test_save_resume.js — regression test for the label-anchored save/resume
 * fix in web/scene.js and web/util.js.
 *
 * Background: ChoiceScript saves a raw line-number index into the compiled
 * scene file. Editing a scene above the save point shifts what's at that
 * index, so a stale save silently resumes at the wrong content. The fix
 * (see computeResumeAnchor/resolveAnchoredLineNum/resumeFromLabelAnchor in
 * web/scene.js) instead anchors saves to the nearest *label plus a content
 * fingerprint of the exact resume line, re-resolving both against whatever
 * scene text is loaded later. The same anchor is used for *gosub and
 * *gosub_scene return addresses (web/scene.js gosub/gosub_scene/return),
 * which have the identical raw-line-number problem.
 *
 * web/scene.js and web/util.js are plain browser scripts (no module
 * exports), so this loads them into a minimal vm sandbox rather than
 * requiring them directly.
 *
 * Usage:
 *   node tools/test_save_resume.js
 *
 * Exits 0 if every case passes, 1 otherwise.
 */

const vm = require('vm');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const projectRoot = path.resolve(__dirname, '..');

function makeSandbox() {
  const sandbox = {
    console,
    document: { getElementsByTagName: () => [], querySelector: () => null },
    alertify: { log: function () {} },
    navigator: { userAgent: 'node' },
    location: { href: 'http://localhost/' },
  };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);

  // util.js does a bunch of browser/DOM setup at load time that isn't
  // relevant here -- we only need crc32() (used by loadLines) and trim()
  // (used by resolveAnchoredLineNum). Anything past the first error is
  // simply not defined in the sandbox, and unused by the code under test.
  try {
    vm.runInContext(fs.readFileSync(path.join(projectRoot, 'web/util.js'), 'utf8'), sandbox, { filename: 'util.js' });
  } catch (e) {
    // expected -- see comment above
  }
  vm.runInContext(fs.readFileSync(path.join(projectRoot, 'web/scene.js'), 'utf8'), sandbox, { filename: 'scene.js' });
  return sandbox;
}

const sandbox = makeSandbox();

let failures = 0;
function check(name, fn) {
  try {
    fn();
    console.log('  ok - ' + name);
  } catch (e) {
    failures++;
    console.log('  FAIL - ' + name);
    console.log('    ' + e.message);
  }
}

function newScene(name) {
  return new sandbox.Scene(name, {});
}

console.log('visible-page save boundary');
{
  function finishedScene(skipFooter) {
    const scene = newScene('teststory');
    scene.finished = true;
    scene.skipFooter = skipFooter;
    scene.rollbackLineCoverage = function () {};
    return scene;
  }

  check('an internal scene continuation does not write live, temp, or recovery saves', () => {
    const calls = [];
    const scene = finishedScene(true);
    scene.refreshSavedProgress = function () { calls.push('refresh'); };
    scene.save = function (slot) { calls.push('save:' + slot); };
    sandbox.printFooter = function () { calls.push('footer'); };

    scene.printLoop();

    assert.deepStrictEqual(calls, []);
    assert.strictEqual(scene.skipFooter, false);
  });

  check('a completed visible page refreshes recovery state and the temp save once', () => {
    const calls = [];
    const scene = finishedScene(false);
    scene.refreshSavedProgress = function () { calls.push('refresh'); };
    scene.save = function (slot) { calls.push('save:' + slot); };
    sandbox.printFooter = function () { calls.push('footer'); };

    scene.printLoop();

    assert.deepStrictEqual(calls, ['refresh', 'save:temp', 'footer']);
  });
}

console.log('');

console.log('save-game resume anchor (checkSum / resumeFromLabelAnchor)');
{
  const original = [
    '*label start',
    'You begin the journey.',
    '*label checkpoint_a',
    '*set gold 10',
    'You reach checkpoint A.',
    '*label checkpoint_b',
    '*set gold 20',
    'You reach checkpoint B, and this is where we will pretend the player saved.',
    '*goto checkpoint_b',
  ].join('\n');

  const scene = newScene('teststory');
  scene.loadLines(original);
  const saveLineNum = 7; // "You reach checkpoint B..."
  const anchor = scene.computeResumeAnchor(saveLineNum);

  check('computeResumeAnchor finds the nearest preceding label', () => {
    // anchor is an object literal created inside the vm sandbox realm, so
    // its prototype differs from this file's Object.prototype -- compare
    // fields individually rather than with deepStrictEqual.
    assert.strictEqual(anchor.label, 'checkpoint_b');
    assert.strictEqual(anchor.offset, 2);
    assert.strictEqual(anchor.lineText, 'You reach checkpoint B, and this is where we will pretend the player saved.');
  });

  function resumeAgainst(editedText) {
    const scene2 = newScene('teststory');
    scene2.loadLines(editedText);
    scene2.savedResumeLabel = anchor.label;
    scene2.savedResumeOffset = anchor.offset;
    scene2.savedResumeLineText = anchor.lineText;
    const recovered = scene2.resumeFromLabelAnchor();
    return { recovered, lineNum: scene2.lineNum, line: scene2.lines[scene2.lineNum] };
  }

  check('edits elsewhere in the file (between checkpoint_a and checkpoint_b) still resolve exactly', () => {
    const edited = [
      '*label start',
      'You begin the journey.',
      '*label checkpoint_a',
      '*set gold 10',
      'You reach checkpoint A.',
      'This is new content the author added while iterating.',
      'Another new paragraph.',
      'A third new line.',
      '*label checkpoint_b',
      '*set gold 20',
      'You reach checkpoint B, and this is where we will pretend the player saved.',
      '*goto checkpoint_b',
    ].join('\n');
    const result = resumeAgainst(edited);
    assert.strictEqual(result.recovered, true);
    assert.strictEqual(result.line, 'You reach checkpoint B, and this is where we will pretend the player saved.');
  });

  check('a renamed/removed anchor label fails closed (no crash, no guess)', () => {
    const edited = [
      '*label start',
      'You begin the journey.',
      '*label checkpoint_a',
      '*set gold 10',
      'You reach checkpoint A.',
      '*label checkpoint_b_renamed',
      '*set gold 20',
      'You reach checkpoint B, renamed.',
      '*goto checkpoint_b_renamed',
    ].join('\n');
    const result = resumeAgainst(edited);
    assert.strictEqual(result.recovered, false);
  });

  check('lines inserted between the label and the save point are found via the nearby search', () => {
    const edited = [
      '*label start',
      'You begin the journey.',
      '*label checkpoint_a',
      '*set gold 10',
      'You reach checkpoint A.',
      '*label checkpoint_b',
      'A brand new line the author inserted right after the label.',
      'Another new paragraph.',
      '*set gold 20',
      'You reach checkpoint B, and this is where we will pretend the player saved.',
      '*goto checkpoint_b',
    ].join('\n');
    const result = resumeAgainst(edited);
    assert.strictEqual(result.recovered, true);
    assert.strictEqual(result.line, 'You reach checkpoint B, and this is where we will pretend the player saved.');
  });

  check('rewording the exact paused-on line falls back to the label, not a full scene restart', () => {
    const edited = [
      '*label start',
      'You begin the journey.',
      '*label checkpoint_a',
      '*set gold 10',
      'You reach checkpoint A.',
      '*label checkpoint_b',
      '*set gold 20',
      'You reach checkpoint B -- rewritten prose, completely different wording now.',
      '*goto checkpoint_b',
    ].join('\n');
    const result = resumeAgainst(edited);
    assert.strictEqual(result.recovered, true);
    assert.strictEqual(result.line, '*label checkpoint_b');
  });
}

console.log('*gosub_scene return-address anchor (checkSum via return())');
{
  const callerOriginal = [
    '*label caller_start',
    'Some narration before the call.',
    '*gosub_scene otherscene',
    'This is the line right after the gosub_scene call -- the return address.',
    '*label caller_end',
    'The end.',
  ].join('\n');

  const sceneA = newScene('callerscene');
  sceneA.loadLines(callerOriginal);
  const pushLineNum = 2 + 1; // gosub_scene pushes this.lineNum + 1
  const anchor = sceneA.computeResumeAnchor(pushLineNum);
  const frame = {
    name: 'callerscene',
    lineNum: pushLineNum,
    indent: 0,
    resumeLabel: anchor && anchor.label,
    resumeOffset: anchor && anchor.offset,
    resumeLineText: anchor && anchor.lineText,
  };

  check('resolves correctly when the caller scene changed elsewhere before *return runs', () => {
    const callerEdited = [
      '*label caller_start',
      'Some narration before the call.',
      'A brand new line the author added while iterating.',
      'Another new line.',
      '*gosub_scene otherscene',
      'This is the line right after the gosub_scene call -- the return address.',
      '*label caller_end',
      'The end.',
    ].join('\n');

    // Mirrors what return()'s cross-scene branch does: create a fresh Scene,
    // stash the raw lineNum/indent AND the anchor (exactly like a normal
    // save/reload), then let checkSum() -- called here directly since we're
    // bypassing the network load -- sort it out.
    const sceneA2 = newScene('callerscene');
    sceneA2.temps = { choice_crc: sceneA.crc }; // crc snapshot from before the edit
    sceneA2.lineNum = frame.lineNum;
    sceneA2.indent = frame.indent;
    sceneA2.savedResumeLabel = frame.resumeLabel;
    sceneA2.savedResumeOffset = frame.resumeOffset;
    sceneA2.savedResumeLineText = frame.resumeLineText;
    sceneA2.loadLines(callerEdited); // sets sceneA2.crc to the NEW (mismatched) crc

    const ok = sceneA2.checkSum();
    assert.strictEqual(ok, true);
    assert.strictEqual(sceneA2.lines[sceneA2.lineNum], 'This is the line right after the gosub_scene call -- the return address.');
  });

  check('falls back to restarting the scene when the anchor label itself is gone', () => {
    const callerRenamed = [
      '*label caller_start_renamed',
      'Some narration before the call.',
      '*gosub_scene otherscene',
      'This is the line right after the gosub_scene call -- the return address.',
      '*label caller_end',
      'The end.',
    ].join('\n');

    const sceneA3 = newScene('callerscene');
    sceneA3.temps = { choice_crc: sceneA.crc };
    sceneA3.lineNum = frame.lineNum;
    sceneA3.indent = frame.indent;
    sceneA3.savedResumeLabel = frame.resumeLabel;
    sceneA3.savedResumeOffset = frame.resumeOffset;
    sceneA3.savedResumeLineText = frame.resumeLineText;
    sceneA3.loadLines(callerRenamed);

    let backupInvoked = false;
    sandbox.initStore = function () { return false; };
    sandbox.safeTimeout = function (fn) { fn(); };
    sandbox.clearScreen = function (fn) { fn(); };
    sandbox.loadAndRestoreGame = function () { backupInvoked = true; };

    const ok = sceneA3.checkSum();
    assert.strictEqual(ok, false);
    assert.strictEqual(backupInvoked, true);
  });
}

console.log('structural resume validation / return-frame failover');
{
  const scene = newScene('nested');
  scene.loadLines([
    '*label hub',
    '*choice',
    '  # Take the path.',
    '    *set gold +1',
    '*goto hub',
  ].join('\n'));

  check('rejects a restored root position that now points inside an option body', () => {
    assert.strictEqual(scene.isResumePositionStructurallyValid(3, 0), false);
  });

  check('accepts a restored position whose current indentation is reachable', () => {
    assert.strictEqual(scene.isResumePositionStructurallyValid(4, 0), true);
  });

  check('an anchored return whose exact line vanished falls back to its surviving label', () => {
    const frame = {
      lineNum: 3,
      indent: 0,
      resumeLabel: 'hub',
      resumeOffset: 3,
      resumeLineText: 'This old return line no longer exists.',
    };
    assert.strictEqual(scene.resolveReturnFrameLine(frame), scene.labels.hub);
  });

  check('an anchored return never falls back to a plausible raw line after its label is removed', () => {
    const frame = {
      lineNum: 4,
      indent: 0,
      resumeLabel: 'removed_label',
      resumeOffset: 1,
      resumeLineText: '*goto removed_label',
    };
    assert.strictEqual(scene.resolveReturnFrameLine(frame), null);
  });

  check('a legacy unanchored return is accepted only when indentation is structurally safe', () => {
    assert.strictEqual(scene.resolveReturnFrameLine({ lineNum: 4, indent: 0 }), 4);
    assert.strictEqual(scene.resolveReturnFrameLine({ lineNum: 3, indent: 0 }), null);
  });
}

console.log('save-schema stamping and migrations');
{
  let repairs = 0;
  sandbox._global = {
    nav: {
      repairStats: function (stats) {
        repairs++;
        if (typeof stats.added_later === 'undefined') stats.added_later = 'default';
      },
    },
  };

  check('new saves carry matching numeric schema versions at both levels', () => {
    const scene = new sandbox.Scene('combat', { save_schema_version: '1' });
    scene.loadLines('*label fight_round_hub\n*choice\n  # Wait.\n    *finish');
    const state = JSON.parse(sandbox.computeCookie(scene.stats, scene.temps, 0, 0));
    assert.strictEqual(state.saveSchemaVersion, 1);
    assert.strictEqual(Number(state.stats.save_schema_version), 1);
  });

  check('an unversioned save receives current defaults without losing player values', () => {
    const state = {
      stats: { sceneName: 'combat', hp_current: 7 },
      lineNum: 0,
      indent: 0,
    };
    const result = sandbox.migrateSaveState(state);
    assert.strictEqual(result.ok, true);
    assert.strictEqual(result.migrated, true);
    assert.strictEqual(result.fromVersion, 0);
    assert.strictEqual(state.saveSchemaVersion, 1);
    assert.strictEqual(state.stats.save_schema_version, 1);
    assert.strictEqual(state.stats.hp_current, 7);
    assert.strictEqual(state.stats.added_later, 'default');
    assert.deepStrictEqual(Object.keys(state.temps), []);
    assert.strictEqual(repairs, 1);
  });

  check('ordered migrations carry a save across several skipped releases', () => {
    const state = { stats: { sceneName: 'combat' }, temps: {} };
    const result = sandbox.runSaveMigrations(state, 3, {
      0: function (s) { s.stats.history = ['zero-to-one']; },
      1: function (s) { s.stats.history.push('one-to-two'); },
      2: function (s) { s.stats.history.push('two-to-three'); },
    });
    assert.strictEqual(result.ok, true);
    assert.strictEqual(state.saveSchemaVersion, 3);
    assert.strictEqual(state.stats.save_schema_version, 3);
    assert.strictEqual(Array.from(state.stats.history).join(','), 'zero-to-one,one-to-two,two-to-three');
  });

  check('a save from a newer build is rejected without being modified', () => {
    const state = {
      saveSchemaVersion: 2,
      stats: { sceneName: 'combat', save_schema_version: 2 },
      temps: {},
    };
    const before = JSON.stringify(state);
    const result = sandbox.migrateSaveState(state);
    assert.strictEqual(result.ok, false);
    assert.strictEqual(result.reason, 'newer_version');
    assert.strictEqual(result.savedVersion, 2);
    assert.strictEqual(JSON.stringify(state), before);
    assert.ok(/Update the game/.test(sandbox.saveMigrationError(result)));
  });

  check('mismatched or fractional schema markers fail closed', () => {
    const mismatch = sandbox.migrateSaveState({
      saveSchemaVersion: 1,
      stats: { sceneName: 'combat', save_schema_version: 0 },
      temps: {},
    });
    assert.strictEqual(mismatch.ok, false);
    assert.strictEqual(mismatch.reason, 'invalid_version');

    const fractional = sandbox.migrateSaveState({
      saveSchemaVersion: 1.5,
      stats: { sceneName: 'combat', save_schema_version: 1.5 },
      temps: {},
    });
    assert.strictEqual(fractional.ok, false);
    assert.strictEqual(fractional.reason, 'invalid_version');
  });
}

console.log('rolling safe autosaves');
{
  const memory = {};
  sandbox._global = { pseudoSave: {} };
  sandbox.safeTimeout = function (fn) { fn(); };
  sandbox.safeCall = function (ctx, fn) { fn.call(ctx); };
  sandbox.safeCallback = function (fn) { return fn || function () {}; };
  const fakeStore = {
    set: function (key, value, callback) {
      memory[key] = value;
      if (callback) callback();
    },
    get: function (key, callback) {
      callback(Object.prototype.hasOwnProperty.call(memory, key), memory[key]);
    },
  };
  sandbox.store = fakeStore;
  sandbox.initStore = function () { return fakeStore; };
  sandbox.jsonParse = JSON.parse;

  check('keeps the newest three distinct successfully rendered snapshots', () => {
    sandbox.recordSafeAutosave('A');
    sandbox.recordSafeAutosave('B');
    sandbox.recordSafeAutosave('C');
    sandbox.recordSafeAutosave('D');
    assert.strictEqual(sandbox._global.pseudoSave.autosafe1, 'D');
    assert.strictEqual(sandbox._global.pseudoSave.autosafe2, 'C');
    assert.strictEqual(sandbox._global.pseudoSave.autosafe3, 'B');
  });

  check('does not fill the history with duplicate refreshes', () => {
    sandbox.recordSafeAutosave('D');
    assert.strictEqual(sandbox._global.pseudoSave.autosafe1, 'D');
    assert.strictEqual(sandbox._global.pseudoSave.autosafe2, 'C');
    assert.strictEqual(sandbox._global.pseudoSave.autosafe3, 'B');
  });

  check('automatic recovery skips a corrupt snapshot and loads the next valid one', () => {
    sandbox._global.pseudoSave.autosafe1 = '{bad json';
    sandbox._global.pseudoSave.autosafe2 = JSON.stringify({ stats: { sceneName: 'combat' }, temps: {}, lineNum: 0, indent: 0 });
    let restored = null;
    let fellBack = false;
    sandbox.clearScreen = function (fn) { fn(); };
    sandbox.restoreGame = function (state) { restored = state; };
    sandbox.loadNextSafeAutosave(function () { fellBack = true; });
    assert.strictEqual(fellBack, false);
    assert.ok(restored);
    assert.strictEqual(restored.stats.sceneName, 'combat');
    sandbox.markSafeAutosaveRecoverySucceeded();
  });

  check('automatic recovery skips a snapshot written by a newer game build', () => {
    sandbox._global.pseudoSave.autosafe1 = JSON.stringify({
      saveSchemaVersion: 2,
      stats: { sceneName: 'combat', save_schema_version: 2 },
      temps: {},
      lineNum: 0,
      indent: 0,
    });
    sandbox._global.pseudoSave.autosafe2 = JSON.stringify({
      saveSchemaVersion: 1,
      stats: { sceneName: 'port_valen/port_valen', save_schema_version: 1 },
      temps: {},
      lineNum: 0,
      indent: 0,
    });
    let restored = null;
    sandbox.restoreGame = function (state) { restored = state; };
    sandbox.loadNextSafeAutosave(function () {});
    assert.ok(restored);
    assert.strictEqual(restored.stats.sceneName, 'port_valen/port_valen');
    sandbox.markSafeAutosaveRecoverySucceeded();
  });

  check('falls through the rolling history to the explicit semantic checkpoint', () => {
    sandbox._global.pseudoSave.autosafe1 = '{bad json';
    sandbox._global.pseudoSave.autosafe2 = '';
    sandbox._global.pseudoSave.autosafe3 = JSON.stringify({ stats: {}, temps: {}, lineNum: 0, indent: 0 });
    sandbox._global.pseudoSave.autosafe_checkpoint = JSON.stringify({
      stats: { sceneName: 'combat' },
      temps: {},
      lineNum: 42,
      indent: 0,
      resumeLabel: 'fight_round_hub',
      resumeOffset: 12,
    });
    let restored = null;
    let fellBack = false;
    sandbox.restoreGame = function (state) { restored = state; };
    sandbox.loadNextSafeAutosave(function () { fellBack = true; });
    assert.strictEqual(fellBack, false);
    assert.ok(restored);
    assert.strictEqual(restored.resumeLabel, 'fight_round_hub');
    sandbox.markSafeAutosaveRecoverySucceeded();
  });

  check('uses the chapter fallback when every automatic recovery slot is unusable', () => {
    sandbox._global.pseudoSave.autosafe1 = '';
    sandbox._global.pseudoSave.autosafe2 = '';
    sandbox._global.pseudoSave.autosafe3 = '{bad json';
    sandbox._global.pseudoSave.autosafe_checkpoint = '';
    let fellBack = false;
    sandbox.loadNextSafeAutosave(function () { fellBack = true; });
    assert.strictEqual(fellBack, true);
    sandbox.markSafeAutosaveRecoverySucceeded();
  });
}

console.log('');
if (failures) {
  console.log(failures + ' check(s) failed.');
  process.exit(1);
} else {
  console.log('All checks passed.');
  process.exit(0);
}
