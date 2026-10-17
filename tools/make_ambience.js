#!/usr/bin/env node
/*
 * make_ambience.js -- turns the long ambience recordings in /Sounds (an hour of MP3 each, 20 to 60 MB) into small seamless loops in /ambience (about 1 MB each) for the page's sound (to come).
 *
 * For each Sounds/<Name>.mp3 it:
 *   1. reads the MP3 frames in Node (no decoding), and cuts a few candidate windows out of the first part of the file;
 *   2. decodes each window in headless Chrome and picks the CALMEST one (lowest loudness swing, no peaks), so a loop never contains a thunderclap or a shout;
 *   3. crossfades the end of the window into its start (equal power, 6 s), so the loop point has no click and no jump: what plays after the last sample is the material that followed it;
 *   4. levels it to a common loudness (the page sets the volume), encodes it to Opus (WebCodecs, 64 kbps stereo by default) and writes an Ogg Opus file, ambience/<name>.ogg.
 * No encoder library is installed here, so Chrome does the decoding and encoding (as tools/gen_ui_art.js does for images) and this script writes the Ogg container itself.
 *
 * Run:  node tools/make_ambience.js                 every Sounds/*.mp3
 *       node tools/make_ambience.js --only Forest_Day --seconds 120 --kbps 48
 *       node tools/make_ambience.js --force              redo every recording (the default skips a loop that is already cut and newer than its recording)
 *       node tools/make_ambience.js --manifest-only      only rewrite web/mygame/ambience-data.js from the files in /ambience
 * The loop plays with an AudioBufferSourceNode (gapless), not an <audio loop>, which would leave a gap.
 */
const { spawn } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "Sounds");
const OUT = path.join(ROOT, "ambience");
const CHROME = process.env.CHROME || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9342;

const arg = (n, d) => { const i = process.argv.indexOf("--" + n); return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : d; };
// Dense noise (rain, wind, a storm, a blizzard) is the hardest thing for a low-bitrate Opus encode: at 64 kbps it crackles (the user heard it 2026-10-16, on loops cut from 128 kbps MP3s, so the sound had been
// compressed twice). These four get 96 kbps unless --kbps says otherwise; everything else stays at 64.
const NOISE_BEDS = /^weather_(rain|storm|wind|blizzard)$/;
const SECONDS = Number(arg("seconds", 150)), KBPS = Number(arg("kbps", 64)), ONLY = arg("only", ""), FADE = 6, TARGET_RMS = 0.07;

// ---------------------------------------------------------------- MP3 frames (no decoding): enough to cut a time window at a frame boundary
const BR1 = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320], BR2 = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160];
const SR = { 3: [44100, 48000, 32000], 2: [22050, 24000, 16000], 0: [11025, 12000, 8000] };
function mp3Frames(buf) {
  let pos = 0;
  if (buf.length > 10 && buf.toString("latin1", 0, 3) === "ID3") pos = 10 + ((buf[6] & 127) << 21 | (buf[7] & 127) << 14 | (buf[8] & 127) << 7 | (buf[9] & 127));
  const frames = []; let rate = 0, spf = 0;
  const header = (p) => {
    if (p + 4 > buf.length || buf[p] !== 0xFF || (buf[p + 1] & 0xE0) !== 0xE0) return null;
    const ver = (buf[p + 1] >> 3) & 3, layer = (buf[p + 1] >> 1) & 3, bi = (buf[p + 2] >> 4) & 15, si = (buf[p + 2] >> 2) & 3, pad = (buf[p + 2] >> 1) & 1;
    if (ver === 1 || layer !== 1 || bi === 0 || bi === 15 || si === 3) return null;
    const br = (ver === 3 ? BR1 : BR2)[bi] * 1000, sr = SR[ver][si];
    return { len: Math.floor((ver === 3 ? 144 : 72) * br / sr) + pad, sr, spf: ver === 3 ? 1152 : 576 };
  };
  while (pos < buf.length) {
    const h = header(pos);
    if (!h || (pos + h.len + 4 <= buf.length && !header(pos + h.len))) { pos++; continue; }   // a real frame is followed by another
    frames.push([pos, h.len]); rate = h.sr; spf = h.spf; pos += h.len;
  }
  return { frames, rate, spf };
}
const sliceFrames = (buf, m, t0, t1) => {   // the bytes of the frames from t0 to t1 seconds, plus 10 frames of lead-in (the decoder needs them to start cleanly)
  const per = m.spf / m.rate, a = Math.max(0, Math.round(t0 / per) - 10), b = Math.min(m.frames.length, Math.round(t1 / per));
  return { bytes: buf.subarray(m.frames[a][0], m.frames[b - 1][0] + m.frames[b - 1][1]), lead: (Math.round(t0 / per) - a) * per };
};

// ---------------------------------------------------------------- Ogg Opus container
const CRC = (() => { const t = new Uint32Array(256); for (let i = 0; i < 256; i++) { let r = i << 24; for (let j = 0; j < 8; j++) r = (r & 0x80000000) ? ((r << 1) ^ 0x04C11DB7) : (r << 1); t[i] = r >>> 0; } return t; })();
const crc32 = (b) => { let c = 0; for (let i = 0; i < b.length; i++) c = ((c << 8) ^ CRC[((c >>> 24) ^ b[i]) & 255]) >>> 0; return c; };
function oggPage(type, granule, serial, seq, packets) {
  const segs = [];
  packets.forEach((p) => { let n = p.length; while (n >= 255) { segs.push(255); n -= 255; } segs.push(n); });
  if (segs.length > 255) throw new Error("too many segments for one page");
  const head = Buffer.alloc(27 + segs.length);
  head.write("OggS", 0, "latin1"); head[4] = 0; head[5] = type;
  head.writeBigUInt64LE(BigInt(granule), 6); head.writeUInt32LE(serial, 14); head.writeUInt32LE(seq, 18); head.writeUInt32LE(0, 22); head[26] = segs.length;
  segs.forEach((s, i) => { head[27 + i] = s; });
  const page = Buffer.concat([head, ...packets]);
  page.writeUInt32LE(crc32(page), 22);
  return page;
}
// endSamples = how many samples the stream really holds (before the encoder's pre-skip is added): the last page's granule position says so, and a decoder then trims exactly that much,
// so the loop is exactly as long as the audio was and its end meets its start without a skipped or padded stretch
function oggOpus(opusHead, packets, samplesPer, endSamples) {
  const serial = 0x4D455243, pages = []; let seq = 0;
  pages.push(oggPage(0x02, 0, serial, seq++, [opusHead]));
  const vendor = Buffer.from("make_ambience"), tags = Buffer.alloc(8 + 4 + vendor.length + 4);
  tags.write("OpusTags", 0, "latin1"); tags.writeUInt32LE(vendor.length, 8); vendor.copy(tags, 12); tags.writeUInt32LE(0, 12 + vendor.length);
  pages.push(oggPage(0x00, 0, serial, seq++, [tags]));
  const PER = 100;
  for (let i = 0; i < packets.length; i += PER) {
    const chunk = packets.slice(i, i + PER), last = i + PER >= packets.length;
    pages.push(oggPage(last ? 0x04 : 0x00, last ? endSamples + opusHead.readUInt16LE(10) : (i + chunk.length) * samplesPer, serial, seq++, chunk));
  }
  return Buffer.concat(pages);
}

// ---------------------------------------------------------------- the browser side
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function withChrome(fn) {
  const page = "file:///" + path.join(ROOT, "ICONS").replace(/\\/g, "/") + "/UiElements/Frame_mid.png";
  const chrome = spawn(CHROME, ["--headless=new", "--disable-gpu", "--allow-file-access-from-files", "--autoplay-policy=no-user-gesture-required", "--remote-debugging-port=" + PORT, "--no-first-run",
    "--user-data-dir=" + path.join(os.tmpdir(), "cs-ambience-" + Date.now()), page], { stdio: "ignore" });
  let ws = null;
  try {
    let list = null;
    for (let i = 0; i < 40; i++) { await sleep(250); try { list = await (await fetch("http://127.0.0.1:" + PORT + "/json/list")).json(); if (list.some((t) => t.type === "page")) break; } catch (e) {} }
    const target = list && list.find((t) => t.type === "page");
    if (!target) throw new Error("no browser page appeared (is Chrome at " + CHROME + "? set CHROME=...)");
    ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
    let id = 0; const pending = new Map();
    ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
    const evaluate = (expression) => new Promise((res, rej) => {
      const n = ++id;
      pending.set(n, (m) => (m.result && m.result.exceptionDetails) ? rej(new Error(JSON.stringify(m.result.exceptionDetails).slice(0, 600))) : res(m.result.result.value));
      ws.send(JSON.stringify({ id: n, method: "Runtime.evaluate", params: { expression, awaitPromise: true, returnByValue: true } }));
    });
    return await fn(evaluate);
  } finally { if (ws) try { ws.close(); } catch (e) {} chrome.kill(); }
}

// decode a slice (base64 mp3) and return its PCM at 48 kHz with the lead-in dropped; shared by the survey and the final cut
const DECODE = `async function decodeSlice(b64, lead, seconds) {
  const bin = atob(b64), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  const ctx = new AudioContext({ sampleRate: 48000 });
  const ab = await ctx.decodeAudioData(u.buffer); await ctx.close();
  const from = Math.round(lead * 48000), n = Math.min(ab.length - from, Math.round(seconds * 48000)), ch = [];
  for (let c = 0; c < 2; c++) ch.push(ab.getChannelData(Math.min(c, ab.numberOfChannels - 1)).slice(from, from + n));
  return ch;
}`;
const SURVEY = (b64, lead, secs) => `(async () => { ${DECODE}
  const ch = await decodeSlice(${JSON.stringify(b64)}, ${lead}, ${secs});
  const n = ch[0].length, W = 48000, rms = []; let peak = 0, sum = 0;
  for (let s = 0; s + W <= n; s += W) { let a = 0; for (let i = s; i < s + W; i++) { const v = (ch[0][i] + ch[1][i]) / 2; a += v * v; } rms.push(Math.sqrt(a / W)); }
  for (let i = 0; i < n; i++) { peak = Math.max(peak, Math.abs(ch[0][i]), Math.abs(ch[1][i])); }
  const mean = rms.reduce((a, b) => a + b, 0) / rms.length, sd = Math.sqrt(rms.reduce((a, b) => a + (b - mean) * (b - mean), 0) / rms.length);
  return { samples: n, mean, swing: mean ? sd / mean : 9, maxOverMean: mean ? Math.max(...rms) / mean : 9, peak };
})()`;
const CUT = (b64, lead, secs, fade, target, kbps) => `(async () => { ${DECODE}
  const L = ${secs}, X = ${fade}, Xn = X * 48000;
  const src = await decodeSlice(${JSON.stringify(b64)}, ${lead}, L + X + 2);
  // the loop point is where the end meets the start: put it at the calmest spot within a couple of seconds of the length asked for (not on a bird call or a snap), in whole 20 ms packets
  let N = L * 48000, calm = Infinity;
  for (let c = (L - 2) * 48000; c <= (L + 1.5) * 48000 && c + Xn <= src[0].length; c += 960) {
    let m = 0; for (let ch = 0; ch < 2; ch++) for (let i = c - 480; i < c + 480; i++) m += Math.abs(src[ch][i + 1] - src[ch][i]);
    if (m < calm) { calm = m; N = c; }
  }
  if (src[0].length < N + Xn) throw new Error("the window is shorter than the loop needs");
  const out = [];
  for (let c = 0; c < 2; c++) {
    const o = new Float32Array(N), s = src[c];
    for (let t = 0; t < N; t++) o[t] = s[t];
    for (let t = 0; t < Xn; t++) { const w = t / Xn; o[t] = s[t] * Math.sin(w * Math.PI / 2) + s[N + t] * Math.cos(w * Math.PI / 2); }   // the head is faded in from the material that follows the loop end
    out.push(o);
  }
  let a = 0, peak = 0; for (let c = 0; c < 2; c++) for (let t = 0; t < N; t++) { a += out[c][t] * out[c][t]; peak = Math.max(peak, Math.abs(out[c][t])); }
  // Level to the target loudness. A recording with one loud spike (a clink, a rooster) cannot be raised that far without the spike clipping, so the boost is held to a peak of 1.8 and a soft knee
  // (above 0.6, tanh) squeezes the spikes under full scale; the bed itself is untouched.
  const rms = Math.sqrt(a / (2 * N)); let gain = ${target} / (rms || 1); if (peak * gain > 1.8) gain = 1.8 / peak;
  let b2 = 0, knee = 0;
  for (let c = 0; c < 2; c++) for (let t = 0; t < N; t++) { let v = out[c][t] * gain; const m = Math.abs(v); if (m > 0.6) knee++, v = Math.sign(v) * (0.6 + 0.37 * Math.tanh((m - 0.6) / 0.37)); out[c][t] = v; b2 += v * v; }
  const rmsOut = Math.sqrt(b2 / (2 * N));
  const packets = []; let desc = null;
  const enc = new AudioEncoder({ output: (chunk, meta) => { const u = new Uint8Array(chunk.byteLength); chunk.copyTo(u); packets.push(Array.from(u)); if (!desc && meta && meta.decoderConfig && meta.decoderConfig.description) { desc = Array.from(new Uint8Array(meta.decoderConfig.description instanceof ArrayBuffer ? meta.decoderConfig.description : meta.decoderConfig.description.buffer)); } }, error: (e) => { throw e; } });
  enc.configure({ codec: "opus", sampleRate: 48000, numberOfChannels: 2, bitrate: ${kbps} * 1000 });
  const F = 960;
  for (let s = 0; s + F <= N; s += F) {
    const data = new Float32Array(F * 2); data.set(out[0].subarray(s, s + F), 0); data.set(out[1].subarray(s, s + F), F);
    enc.encode(new AudioData({ format: "f32-planar", sampleRate: 48000, numberOfFrames: F, numberOfChannels: 2, timestamp: Math.round(s / 48000 * 1e6), data }));
  }
  await enc.flush(); enc.close();
  return { packets, desc, gain, rms: rmsOut, N, n: packets.length, kneePct: 100 * knee / (2 * N), peakIn: peak };
})()`;
const VERIFY = (b64, secs) => `(async () => {
  const bin = atob(${JSON.stringify(b64)}), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  const ctx = new AudioContext({ sampleRate: 48000 }); const ab = await ctx.decodeAudioData(u.buffer); await ctx.close();
  const n = ab.length, a = ab.getChannelData(0);
  // the seam: how big is the sample-to-sample step across the loop point, compared with the typical step either side of it
  const d = (i, j) => Math.abs(a[j] - a[i]); let typ = 0, cnt = 0;
  for (let i = 1; i < 48000; i++) { typ += d(i - 1, i); cnt++; } for (let i = n - 48000; i < n - 1; i++) { typ += d(i, i + 1); cnt++; }
  typ /= cnt; const seam = d(n - 1, 0);
  let jumpMax = 0; for (let k = 0; k < 480; k++) jumpMax = Math.max(jumpMax, d((n - 240 + k) % n, (n - 239 + k) % n));
  // the same "worst step in a 10 ms window" measured across the middle of the loop, so the seam is compared with how the sound behaves anywhere, not with its average
  const wins = []; for (let c = 48000; c + 480 < n - 48000; c += 96000) { let w = 0; for (let k = 0; k < 480; k++) w = Math.max(w, d(c + k, c + k + 1)); wins.push(w / (typ || 1)); }
  wins.sort((x, y) => x - y);
  return { seconds: n / 48000, channels: ab.numberOfChannels, seamOverTypical: typ ? seam / typ : 0, worstStepAcrossSeamOverTypical: typ ? jumpMax / typ : 0, windowMedian: wins[wins.length >> 1] || 0, windowMax: wins[wins.length - 1] || 0 };
})()`;

// the list of loops the page may play (web/mygame/ambience-data.js), rewritten from what is in /ambience
const MANIFEST = path.join(ROOT, "web", "mygame", "ambience-data.js");
function writeManifest() {
  const names = fs.existsSync(OUT) ? fs.readdirSync(OUT).filter((f) => /\.ogg$/i.test(f)).map((f) => f.replace(/\.ogg$/i, "")).sort() : [];
  const ver = {}; names.forEach((n) => { ver[n] = Math.floor(fs.statSync(path.join(OUT, n + ".ogg")).mtimeMs / 1000).toString(36); });   // a version stamp per loop, so a changed loop is not played from the browser's cache
  fs.writeFileSync(MANIFEST, "/* GENERATED by tools/make_ambience.js: the loops in /ambience that ambience.js may play, and a version stamp for each. Do not edit. */\nwindow.AMBIENCE_FILES = " + JSON.stringify(names) + ";\nwindow.AMBIENCE_V = " + JSON.stringify(ver) + ";\n");
  console.log("wrote " + path.relative(ROOT, MANIFEST) + " (" + names.length + " loop(s))");
}

// ---------------------------------------------------------------- main
(async () => {
  if (process.argv.includes("--manifest-only")) { writeManifest(); return; }
  if (process.argv.includes("--check")) {   // exit 1 if a recording in /Sounds has no loop in /ambience or is newer than its loop (node compile.js runs this, then the tool itself if so)
    const stale = fs.existsSync(SRC) ? fs.readdirSync(SRC).filter((f) => /\.mp3$/i.test(f)).filter((f) => {
      const key = f.replace(/\.mp3$/i, "").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, ""), o = path.join(OUT, key + ".ogg");
      return !fs.existsSync(o) || fs.statSync(o).mtimeMs < fs.statSync(path.join(SRC, f)).mtimeMs;
    }) : [];
    if (stale.length) { console.log("sounds to cut: " + stale.join(", ")); process.exit(1); }
    console.log("ambience is up to date"); return;
  }
  if (!fs.existsSync(SRC)) { console.error("no Sounds folder"); process.exit(1); }
  const files = fs.readdirSync(SRC).filter((f) => /\.mp3$/i.test(f) && (!ONLY || f.toLowerCase().indexOf(ONLY.toLowerCase()) === 0));
  if (!files.length) { console.error("no matching Sounds/*.mp3"); process.exit(1); }
  fs.mkdirSync(OUT, { recursive: true });
  await withChrome(async (evaluate) => {
    for (const f of files) {
      const key = f.replace(/\.mp3$/i, "").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
      // a loop that is already cut and newer than its recording is left alone (so adding one recording does not redo the rest); --force redoes everything, and --only always redoes what it names
      const outFile0 = path.join(OUT, key + ".ogg");
      if (!process.argv.includes("--force") && !ONLY && fs.existsSync(outFile0) && fs.statSync(outFile0).mtimeMs > fs.statSync(path.join(SRC, f)).mtimeMs) { console.log(f + ": up to date, skipped"); continue; }
      const buf = fs.readFileSync(path.join(SRC, f)), m = mp3Frames(buf);
      const total = m.frames.length * m.spf / m.rate;
      console.log(f + ": " + (buf.length / 1048576).toFixed(1) + " MB, " + Math.round(total / 60) + " min, " + m.rate + " Hz, " + (buf.length * 8 / total / 1000).toFixed(0) + " kbps");
      // candidate windows, from 1 minute in (past any intro) across the recording; each long enough for the loop and its crossfade
      // A short recording (under 6 minutes, such as a 3 minute rain loop) has no intro to skip and little to choose from: it starts at 1 s, and the loop is as long as the recording allows (at most
      // SECONDS) with the crossfade and a margin left over. A long one starts a minute in.
      const first = total > 360 ? 60 : 1, secs = Math.min(SECONDS, Math.floor(total - first - FADE - 3));
      if (secs < 30) { console.log("  too short to make a loop (" + Math.round(total) + " s), skipped"); continue; }
      const need = secs + FADE + 2, cands = [];
      for (let k = 0; k < 8; k++) { const t0 = first + k * Math.max(1, Math.min(300, (total - need - first) / 8)); if (t0 + need < total) cands.push(t0); }
      if (!cands.length) cands.push(first);
      let best = null;
      for (const t0 of cands) {
        const s = sliceFrames(buf, m, t0, t0 + need);
        const st = await evaluate(SURVEY(s.bytes.toString("base64"), s.lead, need - 1));
        const score = st.swing + 0.15 * st.maxOverMean + (st.peak > 0.98 ? 1 : 0);
        console.log("  window at " + Math.round(t0) + " s: swing " + st.swing.toFixed(2) + ", loudest second " + st.maxOverMean.toFixed(2) + "x the average, peak " + st.peak.toFixed(2));
        if (!best || score < best.score) best = { t0, score, s };
      }
      console.log("  using the window at " + Math.round(best.t0) + " s");
      const r = await evaluate(CUT(best.s.bytes.toString("base64"), best.s.lead, secs, FADE, TARGET_RMS, process.argv.includes("--kbps") ? KBPS : (NOISE_BEDS.test(key) ? 96 : KBPS)));
      const head = Buffer.from(r.desc && r.desc.length >= 19 ? r.desc : [0x4F, 0x70, 0x75, 0x73, 0x48, 0x65, 0x61, 0x64, 1, 2, 0x38, 0x01, 0x80, 0xBB, 0, 0, 0, 0, 0]);
      const pre = head.readUInt16LE(10);
      if (r.n * 960 < r.N + pre) throw new Error("the encoder gave fewer packets (" + r.n + ") than the loop needs");
      const ogg = oggOpus(head, r.packets.map((p) => Buffer.from(p)), 960, r.N);
      const outFile = path.join(OUT, key + ".ogg");
      fs.writeFileSync(outFile, ogg);
      const v = await evaluate(VERIFY(ogg.toString("base64"), SECONDS));
      writeManifest();
      console.log("  gain x" + r.gain.toFixed(1) + ", input peak " + r.peakIn.toFixed(2) + ", " + r.kneePct.toFixed(3) + "% of samples squeezed by the limiter");
      console.log("  wrote ambience/" + key + ".ogg  " + (ogg.length / 1048576).toFixed(2) + " MB, " + v.seconds.toFixed(1) + " s, " + v.channels + " ch; level " + r.rms.toFixed(3) + " RMS; seam step " + v.seamOverTypical.toFixed(1) + "x a normal step (worst step within 5 ms of it " + v.worstStepAcrossSeamOverTypical.toFixed(1) + "x; the same measure elsewhere in the loop: median " + v.windowMedian.toFixed(1) + "x, largest " + v.windowMax.toFixed(1) + "x)");
    }
  });
})().catch((e) => { console.error("FAILED: " + e.message); process.exit(1); });
