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

console.log('');
if (failures) {
  console.log(failures + ' check(s) failed.');
  process.exit(1);
} else {
  console.log('All checks passed.');
  process.exit(0);
}
