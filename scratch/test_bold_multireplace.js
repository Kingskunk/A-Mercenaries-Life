// Renders the ACTUAL shipped harbour-menu button text (read straight out of
// port_valen.txt) through the real engine, for both values of wh_named, and
// reports what the browser would receive. Also renders hand-written variants of
// the same line for comparison.
//
// Run:  node tests/suite.js tests/qunit.js web/scene.js web/util.js headless.js scratch/test_bold_multireplace.js

// Compares the two ways of combining [b] with an @{cond a|b} conditional in a
// choice button, for both values of the condition. The difference that matters
// is the NOT-YET-NAMED case: bold should mark a real name, and before the player
// has read the lintel there is no name, so nothing should be bold.
//
// Run:  node tests/suite.js tests/qunit.js web\scene.js web\util.js headless.js scratch/test_bold_multireplace.js

var capturedOptions = null;
function printOptions(groups, options, callback) {
  capturedOptions = options.map(function (o) { return o.name; });
  if (callback) callback(0);
}

function renderChoice(buttonLine, stats) {
  printed = [];
  capturedOptions = null;
  var scene = new Scene("test", stats || {});
  scene.loadLines("*choice\n  # " + buttonLine + "\n    *goto end\n*label end\ndone");
  scene.execute();
  return capturedOptions;
}

function show(label, buttonLine, stats) {
  var out;
  try {
    out = renderChoice(buttonLine, stats);
  } catch (e) {
    console.log("    " + label + " -> THREW: " + e.message);
    return;
  }
  var joined = JSON.stringify(out);
  var leaked = joined.indexOf("@{") !== -1;
  console.log("    " + label + " -> " + (leaked ? "LEAKS RAW @{: " : "ok          : ") + joined);
}

// Which branch's text sits inside the bold run? Strips [b]/[/b] and reports
// whether the NAME (or, unnamed, the description) is the bolded span.
function boldedSpan(buttonLine, stats) {
  var out = renderChoice(buttonLine, stats);
  if (!out) return "(threw)";
  var s = out[0];
  var m = s.match(/^\[b\]([\s\S]*?)\[\/b\]/);
  return m ? JSON.stringify(m[1]) : "(nothing bold)";
}

var WRAP = "[b]@{wh_named The Weigh House|the long grey hall under the iron beam-scale}[/b]: the city's scales. [~5 min]";
var PERBRANCH = "[b]@{wh_named The Weigh House[/b]|[/b]The long grey hall under the iron beam-scale}: the city's scales. [~5 min]";
var SCALES = "[b]@{ch_head_named The Gilded Scales Head House[/b]|[/b]the tall house with the brass scales}. [~5 min]";
var TERRACE = "[b]@{pq_walk_seen The Terrace Walk[/b]|[/b]the promenade}. [~10 min]";

module("bold + conditional in a choice button");

var passed = 0, failed = 0;

test("two spellings, both condition values", function () {
  try {
  console.log("    A) tags wrap the whole conditional:");
  show("   A named  ", WRAP, { wh_named: true });
  show("   A unnamed", WRAP, { wh_named: false });
  console.log("      bolded: named=" + boldedSpan(WRAP, { wh_named: true }) +
              "  unnamed=" + boldedSpan(WRAP, { wh_named: false }));

  console.log("    B) tags sit inside the branches (per-branch close):");
  show("   B named  ", PERBRANCH, { wh_named: true });
  show("   B unnamed", PERBRANCH, { wh_named: false });
  console.log("      bolded: named=" + boldedSpan(PERBRANCH, { wh_named: true }) +
              "  unnamed=" + boldedSpan(PERBRANCH, { wh_named: false }));

  console.log("    C) Civic Heights Scales button, as shipped (per-branch, no tail):");
  show("   C named  ", SCALES, { ch_head_named: true });
  show("   C unnamed", SCALES, { ch_head_named: false });
  console.log("      bolded: named=" + boldedSpan(SCALES, { ch_head_named: true }) +
              "  unnamed=" + boldedSpan(SCALES, { ch_head_named: false }));

  // The rule the conditional buttons must all satisfy: the named branch bolds
  // exactly the name; the unnamed branch bolds nothing at all.
  var cases = [
    ["Civic Heights Scales", SCALES, "ch_head_named", "The Gilded Scales Head House"],
    ["Patrician Quarter Terrace Walk", TERRACE, "pq_walk_seen", "The Terrace Walk"],
  ];
  cases.forEach(function (c) {
    show("   " + c[0] + " named  ", c[1], (function () { var o = {}; o[c[2]] = true; return o; })());
    show("   " + c[0] + " unnamed", c[1], (function () { var o = {}; o[c[2]] = false; return o; })());
    var named = boldedSpan(c[1], (function () { var o = {}; o[c[2]] = true; return o; })());
    var unnamed = boldedSpan(c[1], (function () { var o = {}; o[c[2]] = false; return o; })());
    var ok = named === JSON.stringify(c[3]) && unnamed === '""';
    console.log("    -> bolds the name only when known: " + (ok ? "yes" : "NO") +
                "   (named=" + named + " unnamed=" + unnamed + ")");
    if (ok) { passed++; } else { failed++; }
  });
  } catch (e) {
    failed++;
    console.log("    EXCEPTION: " + (e && e.stack ? e.stack.split("\n").slice(0, 4).join(" | ") : e));
  }
  console.log("    ---- " + passed + " passed, " + failed + " failed ----");
});

