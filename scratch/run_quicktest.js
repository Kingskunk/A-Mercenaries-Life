// Runs quicktest.html in headless Chrome and reports pass/fail, because quicktest is browser-only
// (no Node entry point in quicktest.js) and the repo's own rules require the real engine for combat
// changes. Same CDP approach as the other probes -- no dependencies.
const { spawn } = require("child_process");
const path = require("path");
const os = require("os");

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9338;
const root = path.resolve(__dirname, "..");
const target = "file:///" + path.join(root, "quicktest.html").replace(/\\/g, "/");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const chrome = spawn(CHROME, [
    "--headless=new", `--remote-debugging-port=${PORT}`, "--disable-gpu",
    "--no-first-run", "--no-default-browser-check",
    "--user-data-dir=" + path.join(os.tmpdir(), "cs-quicktest"),
    "--window-size=1280,2400", target
  ], { stdio: "ignore" });

  let ws = null;
  try {
    let list = null;
    for (let i = 0; i < 40; i++) {
      await sleep(250);
      try {
        const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
        list = await res.json();
        if (list.some((t) => t.type === "page" && t.url.startsWith("file:"))) break;
      } catch (e) { /* chrome not up yet */ }
    }
    const page = list && list.find((t) => t.type === "page" && t.url.startsWith("file:"));
    if (!page) throw new Error("no page target");
    ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

    let id = 0;
    const pending = new Map();
    const logs = [];
    ws.onmessage = (ev) => {
      const m = JSON.parse(ev.data);
      if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
      if (m.method === "Runtime.consoleAPICalled") {
        logs.push((m.params.args || []).map((a) => a.value !== undefined ? a.value : (a.description || "")).join(" "));
      }
      if (m.method === "Runtime.exceptionThrown") {
        logs.push("EXCEPTION: " + JSON.stringify(m.params.exceptionDetails.text) + " " +
                  JSON.stringify((m.params.exceptionDetails.exception || {}).description || ""));
      }
    };
    const send = (method, params) => new Promise((res) => {
      const myId = ++id;
      pending.set(myId, res);
      ws.send(JSON.stringify({ id: myId, method, params }));
    });

    await send("Runtime.enable");
    // Quicktest reports into the page; poll the DOM for its own summary text.
    const deadline = Date.now() + 240000;
    let body = "", done = false;
    while (Date.now() < deadline) {
      await sleep(2000);
      const r = await send("Runtime.evaluate", {
        expression: "document.body ? document.body.innerText : ''", returnByValue: true
      });
      body = (r.result && r.result.result && r.result.result.value) || "";
      if (/\bDONE\b|Finished|complete/i.test(body) && body.length > 200) { done = true; break; }
      if (/PASS|FAIL/i.test(body) && !/running/i.test(body) && body.length > 2000) { done = true; break; }
    }
    console.log("=== quicktest output (tail) ===");
    console.log(body.split("\n").slice(-60).join("\n"));
    if (logs.length) {
      console.log("\n=== console (filtered) ===");
      logs.filter((l) => /EXCEPTION|error|Error|fail/i.test(l)).slice(0, 25).forEach((l) => console.log("  " + l));
    }
    console.log("\nreached end: " + done);
    const bad = body.split("\n").filter((l) => /^\s*(FAIL|ERROR)/i.test(l));
    console.log("FAIL/ERROR lines: " + bad.length);
    bad.slice(0, 25).forEach((l) => console.log("  " + l.trim()));
  } finally {
    if (ws) try { ws.close(); } catch (e) {}
    chrome.kill();
  }
})().catch((e) => { console.error("QUICKTEST RUNNER FAILED: " + e.message); process.exit(1); });
