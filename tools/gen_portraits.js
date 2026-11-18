#!/usr/bin/env node
/*
 * gen_portraits.js -- Batch portrait generator for Lorebook "people" entries.
 *
 * Uses the local MemPalace <-> Perchance image bridge (/rp_image) to generate
 * 512x768 .webp portraits into portraits/<id>.webp.
 *
 * Workflow:
 *   1. Run `node tools/gen_portraits.js --sync` to populate tools/portrait_prompts.json
 *      from web/mygame/lorebook-data.js (preserving any custom prompts you edited).
 *   2. Run `node tools/gen_portraits.js --batch 5` to generate up to 5 missing portraits.
 *   3. Review portraits/*.webp in Explorer. Delete any you dislike and re-run --batch
 *      (it only generates missing files unless --force is passed).
 *   4. Run `node tools/build_app.js` to pack new portraits into dist/.
 *
 * Flags:
 *   --list              Show counts and which people entries are missing portraits
 *   --sync              Update tools/portrait_prompts.json from lorebook-data.js and exit
 *   --batch <N>         Max portraits to generate in this run (default: 5)
 *   --ids <a,b,c>       Only process specific entry IDs
 *   --force             Regenerate even if portraits/<id>.webp already exists
 *   --dry-run           Print the prompts that would be sent without calling /rp_image
 *   --delay <ms>        Pause between jobs in ms (default: 2500)
 *   --server <url>      MemPalace server base URL (default: http://127.0.0.1:5000)
 */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const LORE_PATH = path.join(ROOT, "web", "mygame", "lorebook-data.js");
const PROMPTS_PATH = path.join(__dirname, "portrait_prompts.json");
const PORTRAITS_DIR = path.join(ROOT, "portraits");

const STYLE_PREFIX = "Dark fantasy oil painting portrait of";
const STYLE_SUFFIX =
  "Warm low-key amber lighting, dark moody background, painterly brushwork, rich muted medieval fantasy palette, head and shoulders portrait.";
const DEFAULT_NEGATIVE =
  "low quality, worst quality, blurry, anime, cartoon, 3d render, modern clothes, text, watermark, signature, extra fingers, deformed";

const args = process.argv.slice(2);
function hasFlag(name) { return args.includes(name); }
function optVal(name, fallback) {
  const i = args.indexOf(name);
  return i >= 0 && i + 1 < args.length ? args[i + 1] : fallback;
}

const DO_LIST = hasFlag("--list");
const DO_SYNC = hasFlag("--sync");
const DO_FORCE = hasFlag("--force");
const DRY_RUN = hasFlag("--dry-run");
const BATCH_LIMIT = Math.max(1, parseInt(optVal("--batch", "5"), 10) || 5);
const DELAY_MS = Math.max(0, parseInt(optVal("--delay", "2500"), 10) || 2500);
const SERVER_URL = optVal("--server", "http://127.0.0.1:5000").replace(/\/$/, "");
const ONLY_IDS = optVal("--ids", "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

function loadPeopleFromLorebook() {
  global.window = {};
  require(LORE_PATH);
  const entries = (global.window.LOREBOOK && global.window.LOREBOOK.entries) || [];
  // Proxy that safely evaluates function-based titles/roles/bodies with truthy defaults
  const statsProxy = new Proxy(
    { name: "the mercenary", squad: "vanguard" },
    { get: (t, k) => (k in t ? t[k] : true) }
  );

  return entries
    .filter((e) => e.category === "people" && e.portrait !== false)
    .map((e) => {
      const title = typeof e.title === "function" ? e.title(statsProxy) : e.title || e.id;
      const role = typeof e.role === "function" ? e.role(statsProxy) : e.role || e.sub || "";
      const rawBody = typeof e.body === "function" ? e.body(statsProxy) : e.body || "";
      const bodyArr = Array.isArray(rawBody) ? rawBody : [rawBody];
      const cleanBody = bodyArr
        .join(" ")
        .replace(/\[\[[\w-]+\|([^\]]+)\]\]/g, "$1")
        .replace(/\[\[([\w-]+)\]\]/g, "$1")
        .replace(/<[^>]*>/g, "")
        .replace(/\{\{[^}]+\}\}/g, "")
        .replace(/\s+/g, " ")
        .trim();
      return { id: e.id, title, role, lore: cleanBody };
    });
}

function buildDefaultPrompt(person) {
  // Paragraph 1 is usually role/intro and paragraph 2 holds the physical description;
  // include up to 5 sentences so appearance, skin, hair, eyes, and clothing are captured.
  const sentences = person.lore.match(/[^.!?]+[.!?]+/g) || [person.lore];
  const snippet = sentences.slice(0, 5).join(" ").trim();
  const rolePart = person.role ? `, ${person.role}` : "";
  return `${STYLE_PREFIX} ${person.title}${rolePart}. ${snippet} ${STYLE_SUFFIX}`.replace(/\s+/g, " ").trim();
}

function syncPrompts(people) {
  let existing = {};
  if (fs.existsSync(PROMPTS_PATH)) {
    try {
      existing = JSON.parse(fs.readFileSync(PROMPTS_PATH, "utf8"));
    } catch (err) {
      console.error("Failed to parse existing portrait_prompts.json:", err.message);
      process.exit(1);
    }
  }

  let added = 0;
  const merged = {};
  for (const p of people) {
    const prev = existing[p.id];
    if (prev) {
      merged[p.id] = {
        title: p.title,
        role: p.role,
        prompt: prev.prompt || buildDefaultPrompt(p),
        negativePrompt: prev.negativePrompt || DEFAULT_NEGATIVE,
        resolution: prev.resolution || "512x768",
      };
    } else {
      added++;
      merged[p.id] = {
        title: p.title,
        role: p.role,
        prompt: buildDefaultPrompt(p),
        negativePrompt: DEFAULT_NEGATIVE,
        resolution: "512x768",
      };
    }
  }

  fs.writeFileSync(PROMPTS_PATH, JSON.stringify(merged, null, 2) + "\n", "utf8");
  return { merged, added, total: people.length };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const people = loadPeopleFromLorebook();
  const { merged, added, total } = syncPrompts(people);
  if (added > 0) {
    console.log(`Synced portrait_prompts.json: added ${added} new entries (${total} total).`);
  }
  if (DO_SYNC) return;

  fs.mkdirSync(PORTRAITS_DIR, { recursive: true });

  const withStatus = people.map((p) => {
    const outPath = path.join(PORTRAITS_DIR, `${p.id}.webp`);
    return { ...p, outPath, exists: fs.existsSync(outPath), cfg: merged[p.id] };
  });

  if (DO_LIST) {
    const done = withStatus.filter((x) => x.exists);
    const missing = withStatus.filter((x) => !x.exists);
    console.log(`Portraits: ${done.length}/${withStatus.length} present, ${missing.length} missing.`);
    if (missing.length) {
      console.log("Missing:");
      missing.forEach((m) => console.log(`  - ${m.id} (${m.title})`));
    }
    return;
  }

  let queue = withStatus.filter((x) => (ONLY_IDS.length ? ONLY_IDS.includes(x.id) : true));
  if (!DO_FORCE) {
    queue = queue.filter((x) => !x.exists);
  }
  queue = queue.slice(0, BATCH_LIMIT);

  if (!queue.length) {
    console.log("Nothing to generate! (All matching portraits already exist; use --force to overwrite.)");
    return;
  }

  if (DRY_RUN) {
    console.log(`Dry run (${queue.length} portrait(s)):`);
    for (const item of queue) {
      console.log(`\n[${item.id}] -> ${item.outPath}`);
      console.log(`  prompt: ${item.cfg.prompt}`);
    }
    return;
  }

  // Verify MemPalace server + Perchance tab are connected before starting
  try {
    const stRes = await fetch(`${SERVER_URL}/perchance_bridge/status`);
    if (!stRes.ok) throw new Error(`HTTP ${stRes.status}`);
    const st = await stRes.json();
    if (!st.worker_connected) {
      console.error("Perchance tab is not connected to MemPalace (/perchance_bridge/status reports worker_connected=false).");
      process.exit(1);
    }
  } catch (err) {
    console.error(`Cannot reach MemPalace server at ${SERVER_URL}: ${err.message}`);
    process.exit(1);
  }

  console.log(`Generating ${queue.length} portrait(s) via ${SERVER_URL}/rp_image...\n`);
  let ok = 0;
  let fail = 0;

  for (let i = 0; i < queue.length; i++) {
    const item = queue[i];
    const tag = `[${i + 1}/${queue.length}] ${item.id} (${item.title})`;
    process.stdout.write(`${tag} ... `);
    try {
      const res = await fetch(`${SERVER_URL}/rp_image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: item.cfg.prompt,
          negativePrompt: item.cfg.negativePrompt,
          resolution: item.cfg.resolution || "512x768",
          quality: 85,
          save_path: item.outPath,
          timeout: 100,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.status !== "SUCCESS") {
        throw new Error(data.error || data.reason || `HTTP ${res.status}`);
      }
      console.log(`OK (${data.width}x${data.height}, ${(data.webp_bytes / 1024).toFixed(1)} KB)`);
      ok++;
    } catch (err) {
      console.log(`FAILED (${err.message})`);
      fail++;
    }
    if (i < queue.length - 1 && DELAY_MS > 0) {
      await sleep(DELAY_MS);
    }
  }

  console.log(`\nDone: ${ok} succeeded, ${fail} failed.`);
  if (ok > 0) {
    console.log("Next: review portraits/*.webp, delete any duds, then run `node tools/build_app.js` to pack into dist/.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
