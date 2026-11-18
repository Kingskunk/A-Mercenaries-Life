/*
 * RP ENGINE (rp.js) -- mounts an inline roleplay console whenever a ChoiceScript page
 * contains a `[RP_SESSION:<id>]` marker paragraph.
 *
 * Connects to the MemPalace server (`server.py`) for:
 *   1. `/search` and `/bulk_sync` (per-thread vector/keyword memories)
 *   2. `/rp_generate` with `mode: "perchance"` (unrestricted Perchance AI via open tab)
 *      or `mode: "openrouter"` (direct OpenRouter models via `/get_free_models`)
 *   3. Appends player & AI turns as real `<p>` elements in `#text` via `window.printParagraph`
 *      so the built-in Kokoro/Edge TTS Reader automatically reads new turns aloud.
 */
(function () {
  "use strict";

  var RP = window.RPEngine = window.RPEngine || {};
  var STORAGE_KEY = "cs_rp_settings_v1";
  var ACTIVE_SESSION_KEY = "cs_rp_active_session_v1";
  var MARKER_RE = /^\[RP_SESSION:([a-zA-Z0-9_-]+)\]$/;

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function evalField(v, s) {
    return typeof v === "function" ? v(s) : (v || "");
  }

  function statsNow() {
    return window.stats || {};
  }

  function getServerUrl() {
    // Always read live from the Read Aloud (TTS) settings first, or same-origin when served from server.py (:5000 / ngrok), else http://127.0.0.1:5000
    try {
      var ttsInput = typeof document !== "undefined" && document.getElementById("ttsServerUrl");
      if (ttsInput && ttsInput.value && ttsInput.value.trim()) {
        return ttsInput.value.trim().replace(/\/+$/, "");
      }
      var ttsSaved = JSON.parse(localStorage.getItem("tts_reader_settings_v1") || "{}");
      if (ttsSaved && ttsSaved.serverUrl && ttsSaved.serverUrl.trim()) {
        return ttsSaved.serverUrl.trim().replace(/\/+$/, "");
      }
      if (typeof location !== "undefined" && /^https?:/i.test(location.protocol) && location.pathname.indexOf("/game") === 0) {
        return location.origin.replace(/\/+$/, "");
      }
    } catch (e) {}
    return "http://127.0.0.1:5000";
  }

  function loadSettings() {
    var saved = {};
    try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch (e) {}
    return {
      mode: saved.mode || "auto", // "auto" (Perchance if worker connected, else OpenRouter), "perchance", "openrouter"
      model: saved.model || "baidu/ernie-5.5-flash-preview:free"
    };
  }

  var settings = loadSettings();
  function saveSettings() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(settings)); } catch (e) {}
  }

  // Active session state for the current page
  var session = {
    active: false,
    id: null,
    pageId: null,
    cfg: null,
    openingText: "",
    turns: [],        // [{ role: "user" | "ai", text: "...", pEls: [<p>, ...] }]
    saveMemory: true, // whether to distill & save this visit to MemPalace on exit
    busy: false,
    workerConnected: false,
    freeModels: []
  };

  function currentPageKey(sceneId) {
    var s = statsNow();
    return String(sceneId || "") + "::" + String(s.page_id !== undefined ? s.page_id : "") + "::" + String(s.intimate_encounters !== undefined ? s.intimate_encounters : "");
  }

  function saveActiveSession(draftText) {
    if (!session.active || !session.id) return;
    try {
      var cleanTurns = session.turns.map(function (t) {
        return { role: t.role, text: t.text };
      });
      var payload = {
        key: session.pageId,
        id: session.id,
        turns: cleanTurns,
        saveMemory: session.saveMemory !== false,
        draft: typeof draftText === "string" ? draftText : ""
      };
      localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(payload));
    } catch (e) {}
  }

  function loadActiveSession(sceneId) {
    try {
      var raw = localStorage.getItem(ACTIVE_SESSION_KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (!data || data.key !== currentPageKey(sceneId)) return null;
      return data;
    } catch (e) {
      return null;
    }
  }

  function clearActiveSession() {
    try { localStorage.removeItem(ACTIVE_SESSION_KEY); } catch (e) {}
  }

  function truthy(v) { return v === true || v === "true"; }

  function ensureWorldId(s) {
    if (!s.rp_world_id) {
      s.rp_world_id = "w" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    }
    return s.rp_world_id;
  }

  function resolveThreadId(cfg, s) {
    if (!cfg || cfg.memory === false) return null;
    var base = evalField(cfg.threadId, s) || ("cs_" + cfg.id);
    var wid = ensureWorldId(s);
    return base + "_" + wid;
  }

  function getPlayerSummary(cfg, s, hasMemories) {
    var parts = [];
    var knowsName = cfg && (typeof cfg.knowsName === "function" ? cfg.knowsName(s) : truthy(cfg.knowsName));
    if (knowsName && s.name) {
      parts.push("Name: " + s.name);
    } else if (hasMemories) {
      parts.push("Name: Only known if recorded in past memories below; otherwise unknown");
    } else {
      parts.push("Name: Unknown (you have not given your name)");
    }
    if (s.gender) parts.push("Gender: " + s.gender);
    if (s.age_desc) parts.push("Age: " + s.age_desc);
    else if (s.age) parts.push("Age: " + s.age);
    if (s.race_title || s.race) parts.push("Race: " + (s.race_title || s.race));
    if (s.build_desc || s.build) parts.push("Build: " + (s.build_desc || s.build));
    if (s.hair_eyes) parts.push("Hair & Eyes: " + s.hair_eyes);
    if (s.skin_tone) parts.push("Skin: " + s.skin_tone);

    // Physical condition from current vs max HP
    var hpCur = Number(s.hp_current), hpMax = Number(s.hp_max);
    if (hpMax > 0 && isFinite(hpCur)) {
      if (hpCur <= hpMax * 0.4) {
        parts.push("Condition: Visibly battered, bruised, and bloodied from recent fighting");
      } else if (hpCur < hpMax * 0.85) {
        parts.push("Condition: Carrying fresh scrapes and bruises from recent work");
      }
    }

    // Gear: either stripped/laid aside (for intimate scenes with undressed: true, or by default in chambers) or worn
    var undressed = !cfg || cfg.undressed !== false;
    if (undressed) {
      if (s.weapon_prose && s.equipped_weapon_id !== "none") parts.push("Weapon laid nearby: " + s.weapon_prose);
      if (s.armor_prose && s.equipped_armor_id !== "none") parts.push("Armor removed: " + s.armor_prose);
    } else {
      var worn = [];
      if (s.armor_prose && s.equipped_armor_id !== "none") worn.push(s.armor_prose);
      if (s.cloak_prose && s.equipped_cloak_id !== "none") worn.push(s.cloak_prose);
      if (s.head_prose && s.equipped_head_id !== "none") worn.push(s.head_prose);
      if (s.hands_prose && s.equipped_hands_id !== "none") worn.push(s.hands_prose);
      if (s.feet_prose && s.equipped_feet_id !== "none") worn.push(s.feet_prose);
      if (worn.length) parts.push("Wearing: " + worn.join(", "));
      if (s.weapon_prose && s.equipped_weapon_id !== "none") parts.push("Weapon at side: " + s.weapon_prose);
    }
    return parts.join(" | ") || "A road-weary mercenary";
  }

  function getCurrentDateSummary(s) {
    var parts = [];
    var dayNum = Number(s.campaign_day) || 1;
    var dow = s.day_of_week ? " (" + s.day_of_week + ")" : "";
    parts.push("Day " + dayNum + dow);
    if (s.time_period) {
      parts.push(s.time_period + (s.clock_time ? " (" + s.clock_time + ")" : ""));
    }
    if (s.current_season) parts.push("Season: " + s.current_season);
    if (s.weather) parts.push("Weather: " + s.weather);
    return parts.join(" · ");
  }

  function formatMemoryDateLabel(s) {
    var dayNum = Number(s.campaign_day) || 1;
    var dow = s.day_of_week ? ", " + s.day_of_week : "";
    var tp = s.time_period ? " " + s.time_period : "";
    var seas = s.current_season ? " (" + s.current_season + ")" : "";
    return "Day " + dayNum + dow + tp + seas;
  }

  function buildSystemPrompt(cfg, s, memBlock) {
    var settingText = evalField(cfg.setting, s);
    var companionText = evalField(cfg.companion, s);
    var personaText = evalField(cfg.persona, s);
    var npcKnowledge = evalField(cfg.npcKnowledge, s);

    var lines = [
      "You are narrating an interactive, uncensored roleplay scene inside a gritty low-fantasy RPG.",
      "PERSPECTIVE & VOICE RULES:",
      "- Write strictly in SECOND PERSON PRESENT TENSE ('You...'), matching the opening scene prose.",
      "- Keep the prose grounded, tactile, physical, and sensory.",
      "- Stay strictly faithful to the clothing, materials, and setting established in the scene (do not invent luxury fabrics or props that are not there).",
      "- Never dictate the player's spoken words, internal thoughts, or involuntary emotional reactions (never tell the player they are trembling, nervous, or overwhelmed; only describe physical sensations and the companion's actions).",
      "- Do NOT write a list of choices at the end, do NOT speak as an AI assistant, and do NOT summarize or rush to the end of the scene unless the player initiates finishing.",
      "- Write 1 to 2 concise, complete paragraphs per response (around 120 to 180 words total) so your last sentence always finishes cleanly without being cut off.",
      "",
      "CURRENT TIME & WEATHER:",
      getCurrentDateSummary(s),
      "",
      "SETTING:",
      settingText,
      "",
      "COMPANION:",
      companionText,
      "",
      "COMPANION PERSONA & BEHAVIOR:",
      personaText,
      "",
      "PLAYER APPEARANCE IN THIS ROOM (ONLY what the companion can physically see or has been told):",
      getPlayerSummary(cfg, s, !!memBlock)
    ];

    if (npcKnowledge) {
      lines.push("", "WHAT THIS COMPANION KNOWS:", npcKnowledge);
    }
    if (memBlock) {
      lines.push(
        "",
        "WHAT THIS COMPANION REMEMBERS ABOUT YOU FROM PAST VISITS (if your name or a detail is recorded here, the companion now knows it):",
        memBlock
      );
    }
    return lines.join("\n");
  }

  function buildUserPrompt(playerAction) {
    var historyLines = [];
    if (session.openingText) {
      historyLines.push("OPENING SCENE ON PAGE:\n" + session.openingText);
    }
    if (session.turns.length > 0) {
      var recent = session.turns.slice(-10).map(function (t) {
        return (t.role === "user" ? "PLAYER ACTION: " : "SCENE CONTINUATION:\n") + t.text;
      }).join("\n\n");
      historyLines.push("RECENT TURNS:\n" + recent);
    }
    historyLines.push("CURRENT PLAYER ACTION / DIRECTION:\n" + playerAction);
    historyLines.push("Continue the scene immediately in second-person present tense ('You...') for 1-2 paragraphs:");
    return historyLines.join("\n\n");
  }

  function fetchMemories(threadId, queryText) {
    var baseUrl = getServerUrl();
    if (!baseUrl || !threadId) return Promise.resolve("");
    var s = statsNow();
    var currentDay = Number(s.campaign_day) || 1;
    // During an active encounter, s.intimate_encounters has already been incremented by 1 for THIS visit,
    // so past completed visits have order <= (intimate_encounters - 1).
    var maxVisit = Math.max(0, (Number(s.intimate_encounters) || 1) - 1);
    return fetch(baseUrl + "/get_npc_memories", {
      method: "POST",
      headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
      body: JSON.stringify({
        thread_id: threadId,
        current_day: currentDay,
        max_visit: maxVisit,
        query: queryText || ""
      })
    }).then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (!d || !Array.isArray(d.memories) || !d.memories.length) return "";
        return d.memories.map(function (m) { return "- " + m.content; }).join("\n");
      })
      .catch(function () { return ""; });
  }

  function commitSessionToMemPalace() {
    var baseUrl = getServerUrl();
    if (!baseUrl || !session.cfg || session.cfg.memory === false || session.saveMemory === false || session.turns.length === 0) return;
    var s = statsNow();
    var threadId = resolveThreadId(session.cfg, s);
    if (!threadId) return;
    var transcript = session.turns.map(function (t) {
      return (t.role === "user" ? "Player: " : "Scene: ") + t.text;
    }).join("\n\n");
    var visitNum = Number(s.intimate_encounters) || 1;
    var dayNum = Number(s.campaign_day) || 1;
    var memId = "msg_" + visitNum + "_day" + dayNum + "_rp";
    var npcName = evalField(session.cfg.npcName, s) || evalField(session.cfg.title, s).split("—")[0].trim() || "the companion";
    var locName = evalField(session.cfg.title, s) || "the scene";
    var dateLabel = formatMemoryDateLabel(s);
    fetch(baseUrl + "/append_memory", {
      method: "POST",
      headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
      body: JSON.stringify({
        thread_id: threadId,
        id: memId,
        text: transcript.slice(0, 3500),
        distill: true,
        npc_name: npcName,
        location: locName,
        date_label: dateLabel,
        mode: settings.mode,
        model: settings.model
      })
    }).catch(function () {});
  }

  // Called on a genuine new game (see restoreGame() in web/util.js).
  // Clears any active RP session cache and assigns a fresh rp_world_id for the new playthrough
  // WITHOUT wiping other save slots' or other devices' MemPalace rooms on the server!
  RP.resetAll = function () {
    clearActiveSession();
    var s = statsNow();
    s.rp_world_id = "w" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  };

  if (typeof document === "undefined") return; // node tests stop here

  function liveTextContainer() {
    var c1 = document.querySelector("#container1 #text");
    if (c1) return c1;
    var texts = document.querySelectorAll("#text");
    return texts.length ? texts[texts.length - 1] : null;
  }

  function collectOpeningNarrative(textEl, stopNode) {
    var ps = textEl.querySelectorAll("p");
    var out = [];
    for (var i = 0; i < ps.length; i++) {
      if (ps[i] === stopNode) break;
      var t = (ps[i].textContent || "").replace(/\s+/g, " ").trim();
      if (!t || t.charAt(0) === "\u25C8" || (t.charAt(0) === "[" && t.charAt(t.length - 1) === "]")) continue;
      out.push(t);
    }
    return out.join("\n\n");
  }

  function insertStoryParagraphs(text, cssClass, beforeNode) {
    var textEl = liveTextContainer();
    if (!textEl) return [];
    var paras = String(text || "").split(/\n\s*\n/).map(function (p) { return p.trim(); }).filter(Boolean);
    var created = [];
    paras.forEach(function (paraText) {
      var p;
      // Use window.printParagraph if available so TTSReader's hook automatically receives and queues the new paragraph!
      if (typeof window.printParagraph === "function") {
        p = window.printParagraph(paraText, textEl);
      } else {
        p = document.createElement("p");
        p.textContent = paraText;
        textEl.appendChild(p);
      }
      if (p) {
        if (cssClass) p.classList.add(cssClass);
        if (beforeNode && beforeNode.parentNode === textEl) {
          textEl.insertBefore(p, beforeNode);
        }
        created.push(p);
      }
    });
    return created;
  }

  function checkServerAndModels(box) {
    var dot = box.querySelector(".rp-dot");
    var badgeText = box.querySelector(".rp-badge-text");
    var modelSelect = box.querySelector(".rp-model-select");
    var memBtn = box.querySelector('[data-act="memories"]');
    var baseUrl = getServerUrl();
    if (!baseUrl) {
      dot.className = "rp-dot bad";
      badgeText.textContent = "No Server URL";
      return;
    }

    fetch(baseUrl + "/perchance_bridge/status", {
      headers: { "ngrok-skip-browser-warning": "true" }
    }).then(function (r) { return r.ok ? r.json() : null; })
      .then(function (st) {
        if (!st) throw new Error("Unreachable");
        session.workerConnected = !!st.worker_connected;
        if (session.workerConnected) {
          dot.className = "rp-dot ok";
          badgeText.textContent = "Perchance AI Ready";
        } else {
          dot.className = "rp-dot warn";
          badgeText.textContent = "OpenRouter Ready (Perchance tab closed)";
        }
      })
      .catch(function () {
        dot.className = "rp-dot bad";
        badgeText.textContent = "MemPalace Offline";
      });

    fetch(baseUrl + "/get_free_models", {
      headers: { "ngrok-skip-browser-warning": "true" }
    }).then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        if (!data || !Array.isArray(data.models) || !modelSelect) return;
        session.freeModels = data.models;
        var html = "";
        data.models.forEach(function (m) {
          var sel = m.id === settings.model ? " selected" : "";
          html += '<option value="' + esc(m.id) + '"' + sel + '>' + esc(m.name || m.id) + '</option>';
        });
        if (html) modelSelect.innerHTML = html;
      })
      .catch(function () {});

    if (memBtn && session.cfg && session.cfg.memory !== false) {
      var threadId = resolveThreadId(session.cfg, statsNow());
      if (threadId) {
        var maxV = Math.max(0, (Number(statsNow().intimate_encounters) || 1) - 1);
        fetch(baseUrl + "/get_npc_memories", {
          method: "POST",
          headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
          body: JSON.stringify({ thread_id: threadId, current_day: Number(statsNow().campaign_day) || 1, max_visit: maxV })
        }).then(function (r) { return r.ok ? r.json() : null; })
          .then(function (d) {
            var count = (d && Array.isArray(d.all)) ? d.all.length : 0;
            memBtn.textContent = "Memories (" + count + ")";
          })
          .catch(function () {});
      }
    }
  }

  var DEFAULT_BEATS = [
    { label: "\u25B8 Let them lead", prompt: "Continue the moment naturally, letting the companion take the lead." },
    { label: "Slow & unhurried", prompt: "Slow the pace down, savoring the touch and taking your time." },
    { label: "More urgent", prompt: "Tighten your grip and quicken the rhythm with deeper intensity." },
    { label: "Shift position", prompt: "Shift position, guiding the companion into a new angle." }
  ];

  function mountConsole(markerParagraph, sceneId) {
    var cfg = (window.RP_DATA || {})[sceneId];
    if (!cfg) return;
    var textEl = markerParagraph.parentNode;
    if (!textEl) return;

    var s = statsNow();
    session.active = true;
    session.id = sceneId;
    session.pageId = currentPageKey(sceneId);
    session.cfg = cfg;
    session.turns = [];
    session.saveMemory = cfg.memory !== false;
    session.busy = false;
    session.openingText = collectOpeningNarrative(textEl, markerParagraph);

    var box = document.createElement("div");
    box.className = "rp-box";
    box.id = "rpConsoleBox";

    var title = evalField(cfg.title, s) || "Roleplay Session";
    var subtitle = evalField(cfg.subtitle, s) || "";
    var starters = cfg.starters || [];
    var beats = cfg.beats || DEFAULT_BEATS;
    var hasMem = cfg.memory !== false;

    var startersHtml = starters.map(function (st) {
      return '<button type="button" class="rp-chip" data-starter="' + esc(st) + '">' + esc(st) + '</button>';
    }).join("");

    var beatsHtml = '<span class="rp-beats-label">Next Beat:</span>' + beats.map(function (b) {
      return '<button type="button" class="rp-chip rp-chip-beat" data-beat="' + esc(b.prompt) + '">' + esc(b.label) + '</button>';
    }).join("");

    box.innerHTML =
      '<div class="rp-head">' +
        '<div class="rp-title-wrap">' +
          '<div class="rp-title">\u25C8 ' + esc(title) + '</div>' +
          (subtitle ? '<div class="rp-sub">' + esc(subtitle) + '</div>' : '') +
        '</div>' +
        '<div class="rp-controls">' +
          '<span class="rp-badge" title="Connection status to MemPalace & Perchance">' +
            '<span class="rp-dot"></span><span class="rp-badge-text">Checking...</span>' +
          '</span>' +
          (hasMem ? '<button type="button" class="rp-btn rp-btn-sm" data-act="memories" title="View or edit what this companion remembers about you">Memories (0)</button>' : '') +
          '<select class="rp-select rp-mode-select" title="Choose AI Engine">' +
            '<option value="auto"' + (settings.mode === "auto" ? " selected" : "") + '>Auto (Perchance \u2192 OpenRouter)</option>' +
            '<option value="perchance"' + (settings.mode === "perchance" ? " selected" : "") + '>Perchance AI (Unrestricted)</option>' +
            '<option value="openrouter"' + (settings.mode === "openrouter" ? " selected" : "") + '>OpenRouter Free Models</option>' +
          '</select>' +
          '<select class="rp-select rp-model-select" title="OpenRouter Model"' + (settings.mode === "perchance" ? ' style="display:none"' : '') + '>' +
            '<option value="' + esc(settings.model) + '">' + esc(settings.model.split("/").pop()) + '</option>' +
          '</select>' +
        '</div>' +
      '</div>' +
      '<div class="rp-body">' +
        '<div class="rp-drawer rp-mem-drawer" hidden>' +
          '<div class="rp-drawer-head">' +
            '<span>Companion Memories</span>' +
            '<button type="button" class="rp-btn rp-btn-sm" data-act="close-memories">\u00D7 Close</button>' +
          '</div>' +
          '<div class="rp-mem-list"></div>' +
        '</div>' +
        '<div class="rp-drawer rp-edit-drawer" hidden>' +
          '<div class="rp-drawer-head">' +
            '<span>Edit Last Response</span>' +
            '<button type="button" class="rp-btn rp-btn-sm" data-act="cancel-edit">\u00D7 Cancel</button>' +
          '</div>' +
          '<textarea class="rp-edit-textarea"></textarea>' +
          '<div class="rp-actions-left">' +
            '<button type="button" class="rp-btn rp-btn-primary rp-btn-sm" data-act="save-edit">Save Changes</button>' +
          '</div>' +
        '</div>' +
        '<div class="rp-typing" hidden>' +
          '<div class="rp-typing-dots"><span></span><span></span><span></span></div>' +
          '<span class="rp-typing-text">Writing response...</span>' +
        '</div>' +
        (startersHtml ? '<div class="rp-starters">' + startersHtml + '</div>' : '') +
        '<div class="rp-beats" style="display:none">' + beatsHtml + '</div>' +
        '<textarea class="rp-input" placeholder="Write what you do or say (or click a prompt chip above)..."></textarea>' +
        '<div class="rp-foot">' +
          '<div class="rp-actions-left">' +
            '<button type="button" class="rp-btn rp-btn-primary" data-act="send">Send / Continue</button>' +
            '<button type="button" class="rp-btn" data-act="edit" disabled title="Edit the last turn text in-place">\u270E Edit</button>' +
            '<button type="button" class="rp-btn" data-act="reroll" disabled title="Regenerate the last AI response">\u21BB Reroll</button>' +
            '<button type="button" class="rp-btn" data-act="undo" disabled title="Remove the last exchange">\u232B Undo</button>' +
          '</div>' +
          '<div class="rp-actions-right">' +
            (hasMem ? '<label class="rp-mem-check" title="When checked, this scene will be distilled into a memory for this companion when you leave"><input type="checkbox" class="rp-save-mem-cb" checked><span>Save as memory</span></label>' : '') +
            '<span class="rp-status">Ready. Click "Rest together\u2026" below whenever you wish to finish.</span>' +
          '</div>' +
        '</div>' +
      '</div>';

    textEl.replaceChild(box, markerParagraph);

    var inputEl = box.querySelector(".rp-input");
    var statusEl = box.querySelector(".rp-status");
    var sendBtn = box.querySelector('[data-act="send"]');
    var editBtn = box.querySelector('[data-act="edit"]');
    var rerollBtn = box.querySelector('[data-act="reroll"]');
    var undoBtn = box.querySelector('[data-act="undo"]');
    var modeSel = box.querySelector(".rp-mode-select");
    var modelSel = box.querySelector(".rp-model-select");
    var starterWrap = box.querySelector(".rp-starters");
    var beatsWrap = box.querySelector(".rp-beats");
    var typingEl = box.querySelector(".rp-typing");
    var typingTextEl = box.querySelector(".rp-typing-text");
    var editDrawer = box.querySelector(".rp-edit-drawer");
    var editArea = box.querySelector(".rp-edit-textarea");
    var memDrawer = box.querySelector(".rp-mem-drawer");
    var memList = box.querySelector(".rp-mem-list");
    var saveMemCb = box.querySelector(".rp-save-mem-cb");

    function updateChipsVisibility() {
      var hasTurns = session.turns.length > 0;
      if (starterWrap) starterWrap.style.display = hasTurns ? "none" : "";
      if (beatsWrap) beatsWrap.style.display = hasTurns ? "flex" : "none";
    }

    function updateButtons() {
      var hasTurns = session.turns.length > 0;
      sendBtn.disabled = session.busy;
      if (editBtn) editBtn.disabled = session.busy || !hasTurns;
      rerollBtn.disabled = session.busy || !hasTurns;
      undoBtn.disabled = session.busy || !hasTurns;
      Array.prototype.forEach.call(box.querySelectorAll(".rp-chip"), function (c) {
        c.disabled = session.busy;
      });
      if (typingEl) typingEl.hidden = !session.busy;
      updateChipsVisibility();
    }

    function setStatus(msg) {
      if (statusEl) statusEl.textContent = msg;
    }

    function renderMemoriesDrawer() {
      if (!memList) return;
      var threadId = resolveThreadId(cfg, statsNow());
      var baseUrl = getServerUrl();
      if (!threadId || !baseUrl) {
        memList.innerHTML = '<div class="rp-status">No persistent memory room for this scene.</div>';
        return;
      }
      memList.innerHTML = '<div class="rp-status">Loading memories...</div>';
      var maxV = Math.max(0, (Number(statsNow().intimate_encounters) || 1) - 1);
      fetch(baseUrl + "/get_npc_memories", {
        method: "POST",
        headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
        body: JSON.stringify({ thread_id: threadId, current_day: Number(statsNow().campaign_day) || 1, max_visit: maxV })
      }).then(function (r) { return r.ok ? r.json() : null; })
        .then(function (d) {
          var items = (d && Array.isArray(d.all)) ? d.all : [];
          var memBtn = box.querySelector('[data-act="memories"]');
          if (memBtn) memBtn.textContent = "Memories (" + items.length + ")";
          if (!items.length) {
            memList.innerHTML = '<div class="rp-status">No past memories recorded with this companion yet. Memories are distilled and saved when you finish a visit.</div>';
            return;
          }
          memList.innerHTML = items.map(function (m, idx) {
            var label = m.order ? ("Visit #" + m.order) : ("Memory #" + (idx + 1));
            if (m.saved_day) label += " · Day " + m.saved_day;
            return (
              '<div class="rp-mem-item" data-mem-id="' + esc(m.source) + '">' +
                '<div class="rp-mem-meta">' +
                  '<span>' + esc(label) + '</span>' +
                  '<div class="rp-actions-left">' +
                    '<button type="button" class="rp-btn rp-btn-sm" data-act="save-mem" data-id="' + esc(m.source) + '">Save</button>' +
                    '<button type="button" class="rp-btn rp-btn-sm" data-act="del-mem" data-id="' + esc(m.source) + '">Delete</button>' +
                  '</div>' +
                '</div>' +
                '<textarea class="rp-mem-textarea">' + esc(m.content) + '</textarea>' +
              '</div>'
            );
          }).join("");
        })
        .catch(function () {
          memList.innerHTML = '<div class="rp-status">Could not reach MemPalace server.</div>';
        });
    }

    // Restore turns and draft if the page was refreshed or returned to from Show Stats / Menu
    var restored = loadActiveSession(sceneId);
    if (restored && Array.isArray(restored.turns) && restored.turns.length > 0) {
      restored.turns.forEach(function (t) {
        var css = t.role === "user" ? "rp-player-turn" : "rp-ai-turn";
        var pEls = insertStoryParagraphs(t.text, css, box);
        session.turns.push({ role: t.role, text: t.text, pEls: pEls });
      });
      setStatus("Session restored (" + Math.ceil(session.turns.length / 2) + " exchange(s)).");
    }
    if (restored && restored.draft) {
      inputEl.value = restored.draft;
    }
    if (restored && typeof restored.saveMemory === "boolean") {
      session.saveMemory = restored.saveMemory;
      if (saveMemCb) saveMemCb.checked = restored.saveMemory;
    }
    updateButtons();

    if (saveMemCb) {
      saveMemCb.addEventListener("change", function () {
        session.saveMemory = !!saveMemCb.checked;
        saveActiveSession(inputEl.value);
        setStatus(session.saveMemory ? "This visit will be saved to memory on exit." : "Memory saving off for this visit.");
      });
    }

    inputEl.addEventListener("input", function () {
      saveActiveSession(inputEl.value);
    });

    function runGeneration(playerText, isReroll) {
      if (session.busy) return;
      editDrawer.hidden = true;
      session.busy = true;
      updateButtons();

      if (!isReroll && playerText) {
        var userPEls = insertStoryParagraphs(playerText, "rp-player-turn", box);
        session.turns.push({ role: "user", text: playerText, pEls: userPEls });
        saveActiveSession(inputEl.value);
      }

      var chosenMode = settings.mode;
      if (chosenMode === "auto") {
        chosenMode = session.workerConnected ? "perchance" : "openrouter";
      }

      var waitMsg = chosenMode === "perchance" ? "Generating via Perchance AI..." : "Generating via OpenRouter...";
      setStatus(waitMsg);
      if (typingTextEl) typingTextEl.textContent = waitMsg;

      var threadId = resolveThreadId(cfg, statsNow());

      fetchMemories(threadId, playerText || "Continue the scene").then(function (memBlock) {
        var sysPrompt = buildSystemPrompt(cfg, statsNow(), memBlock);
        var usrPrompt = buildUserPrompt(playerText || "Continue the scene naturally from where it left off.");
        var baseUrl = getServerUrl();

        return fetch(baseUrl + "/rp_generate", {
          method: "POST",
          headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
          body: JSON.stringify({
            mode: chosenMode,
            model: settings.model,
            raw_mode: true,
            max_tokens: 600,
            system: sysPrompt,
            prompt: usrPrompt
          })
        }).then(function (r) { return r.json(); })
          .then(function (res) {
            if (res.status !== "SUCCESS" && settings.mode === "auto" && chosenMode === "perchance") {
              setStatus("Perchance tab asleep — falling back to OpenRouter...");
              if (typingTextEl) typingTextEl.textContent = "Falling back to OpenRouter...";
              return fetch(baseUrl + "/rp_generate", {
                method: "POST",
                headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
                body: JSON.stringify({
                  mode: "openrouter",
                  model: settings.model,
                  raw_mode: true,
                  max_tokens: 600,
                  system: sysPrompt,
                  prompt: usrPrompt
                })
              }).then(function (r2) { return r2.json(); });
            }
            return res;
          });
      }).then(function (res) {
        session.busy = false;
        if (res && res.status === "SUCCESS" && res.text && res.text !== "...") {
          var aiPEls = insertStoryParagraphs(res.text, "rp-ai-turn", box);
          session.turns.push({ role: "ai", text: res.text, pEls: aiPEls });
          saveActiveSession(inputEl.value);
          setStatus("Turn complete (" + (res.mode === "perchance" ? "Perchance AI" : settings.model.split("/").pop()) + ").");
          if (aiPEls.length && aiPEls[0].scrollIntoView) {
            aiPEls[0].scrollIntoView({ behavior: "smooth", block: "nearest" });
          }
        } else {
          var errMsg = (res && (res.error || res.reason)) || "Generation failed";
          setStatus("Error: " + errMsg + " (try another model or check Perchance tab).");
        }
        updateButtons();
      }).catch(function (err) {
        session.busy = false;
        setStatus("Network error: " + (err && err.message ? err.message : String(err)));
        updateButtons();
      });
    }

    modeSel.addEventListener("change", function () {
      settings.mode = modeSel.value;
      modelSel.style.display = settings.mode === "perchance" ? "none" : "";
      saveSettings();
    });

    modelSel.addEventListener("change", function () {
      settings.model = modelSel.value;
      saveSettings();
    });

    box.addEventListener("click", function (ev) {
      var target = ev.target;
      var starterBtn = target.closest ? target.closest("[data-starter]") : null;
      if (starterBtn && !session.busy) {
        var stText = starterBtn.getAttribute("data-starter");
        inputEl.value = "";
        runGeneration(stText, false);
        return;
      }

      var beatBtn = target.closest ? target.closest("[data-beat]") : null;
      if (beatBtn && !session.busy) {
        var bText = beatBtn.getAttribute("data-beat");
        runGeneration(bText, false);
        return;
      }

      var actBtn = target.closest ? target.closest("[data-act]") : null;
      if (!actBtn) return;
      var act = actBtn.getAttribute("data-act");

      if (act === "send") {
        var val = inputEl.value.trim();
        inputEl.value = "";
        runGeneration(val || "Continue the moment naturally, letting the companion take the lead.", false);
      } else if (act === "edit") {
        if (session.busy || !session.turns.length) return;
        var lastTurn = session.turns[session.turns.length - 1];
        editArea.value = lastTurn.text;
        editDrawer.hidden = !editDrawer.hidden;
        if (!editDrawer.hidden) editArea.focus();
      } else if (act === "cancel-edit") {
        editDrawer.hidden = true;
      } else if (act === "save-edit") {
        if (!session.turns.length) { editDrawer.hidden = true; return; }
        var newText = editArea.value.trim();
        if (!newText) return;
        var turnToEdit = session.turns[session.turns.length - 1];
        var anchorNode = (turnToEdit.pEls && turnToEdit.pEls[0]) ? turnToEdit.pEls[0] : box;
        var cssClass = turnToEdit.role === "user" ? "rp-player-turn" : "rp-ai-turn";
        var newPEls = insertStoryParagraphs(newText, cssClass, anchorNode);
        (turnToEdit.pEls || []).forEach(function (el) { if (el.parentNode) el.parentNode.removeChild(el); });
        turnToEdit.text = newText;
        turnToEdit.pEls = newPEls;
        saveActiveSession(inputEl.value);
        editDrawer.hidden = true;
        setStatus("Last turn updated.");
      } else if (act === "memories") {
        memDrawer.hidden = !memDrawer.hidden;
        if (!memDrawer.hidden) renderMemoriesDrawer();
      } else if (act === "close-memories") {
        memDrawer.hidden = true;
      } else if (act === "save-mem") {
        var memId = actBtn.getAttribute("data-id");
        var itemEl = actBtn.closest(".rp-mem-item");
        var ta = itemEl ? itemEl.querySelector(".rp-mem-textarea") : null;
        var threadId = resolveThreadId(cfg, statsNow());
        if (!memId || !ta || !threadId) return;
        actBtn.disabled = true;
        actBtn.textContent = "Saving...";
        fetch(getServerUrl() + "/append_memory", {
          method: "POST",
          headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
          body: JSON.stringify({ thread_id: threadId, id: memId, text: ta.value.trim(), distill: false })
        }).then(function () {
          actBtn.disabled = false;
          actBtn.textContent = "Saved \u2713";
          setTimeout(function () { actBtn.textContent = "Save"; }, 1500);
        }).catch(function () {
          actBtn.disabled = false;
          actBtn.textContent = "Error";
        });
      } else if (act === "del-mem") {
        var delId = actBtn.getAttribute("data-id");
        var delThreadId = resolveThreadId(cfg, statsNow());
        if (!delId || !delThreadId) return;
        actBtn.disabled = true;
        fetch(getServerUrl() + "/delete_npc_memory", {
          method: "POST",
          headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
          body: JSON.stringify({ thread_id: delThreadId, id: delId })
        }).then(function () {
          renderMemoriesDrawer();
        }).catch(function () {
          actBtn.disabled = false;
        });
      } else if (act === "reroll") {
        if (session.busy || !session.turns.length) return;
        editDrawer.hidden = true;
        if (session.turns[session.turns.length - 1].role === "ai") {
          var poppedAi = session.turns.pop();
          (poppedAi.pEls || []).forEach(function (el) { if (el.parentNode) el.parentNode.removeChild(el); });
        }
        var lastUser = session.turns.length && session.turns[session.turns.length - 1].role === "user"
          ? session.turns[session.turns.length - 1].text
          : "Continue the moment naturally.";
        runGeneration(lastUser, true);
      } else if (act === "undo") {
        if (session.busy || !session.turns.length) return;
        editDrawer.hidden = true;
        if (session.turns[session.turns.length - 1].role === "ai") {
          var aiTurn = session.turns.pop();
          (aiTurn.pEls || []).forEach(function (el) { if (el.parentNode) el.parentNode.removeChild(el); });
        }
        if (session.turns.length && session.turns[session.turns.length - 1].role === "user") {
          var userTurn = session.turns.pop();
          (userTurn.pEls || []).forEach(function (el) { if (el.parentNode) el.parentNode.removeChild(el); });
          inputEl.value = userTurn.text;
        }
        saveActiveSession(inputEl.value);
        updateButtons();
        setStatus("Last exchange undone.");
      }
    });

    checkServerAndModels(box);
  }

  // While an RP console is mounted on the live page (#rpConsoleBox), block ui.js's global
  // shortcuts (especially Space, which otherwise clicks "Rest together..." and ends the
  // scene early, plus hotkeys like Q/V/E/W/digits when typing in the textarea).
  document.addEventListener("keydown", function (ev) {
    var box = document.getElementById("rpConsoleBox");
    if (!box) return;
    var t = ev.target;
    var tag = t && t.tagName ? t.tagName.toUpperCase() : "";
    var inField = (tag === "TEXTAREA" || tag === "INPUT" || tag === "SELECT" || (t && t.isContentEditable));
    if (inField && box.contains(t)) {
      // Handle Enter (without Shift) inside the RP textarea to send the turn
      if (tag === "TEXTAREA" && ev.key === "Enter" && !ev.shiftKey) {
        ev.preventDefault();
        ev.stopImmediatePropagation();
        var sendBtn = box.querySelector('[data-act="send"]');
        if (sendBtn && !sendBtn.disabled) sendBtn.click();
        return;
      }
      // Let the user type spaces, letters, numbers, and symbols freely without triggering ui.js
      ev.stopImmediatePropagation();
      return;
    }
    // Even if focus is outside the textarea on an active RP page, prevent Space from clicking Next ("Rest together...")
    if (ev.key === " " || ev.key === "Spacebar") {
      if (tag !== "BUTTON" && tag !== "A") {
        ev.preventDefault();
        ev.stopImmediatePropagation();
      }
    }
  }, true);

  function scanForMarker() {
    var textEl = liveTextContainer();
    if (!textEl) return;
    // If we moved to a normal story page where rp_active_scene is "none" (e.g. after clicking "Rest together...")
    // and not in the temporary stats/menu view, commit the finished session once to MemPalace (if memory: true)
    // and clear the persisted active session buffer.
    var s = statsNow();
    if (s && s.name && !s.rp_world_id) {
      ensureWorldId(s);
    }
    var isSecondary = s.scene && s.scene.secondaryMode === "stats";
    if (!isSecondary && (!s.rp_active_scene || s.rp_active_scene === "none") && !document.getElementById("rpConsoleBox")) {
      if (session.active) {
        commitSessionToMemPalace();
        session.active = false;
        session.turns = [];
        clearActiveSession();
      }
    }
    var ps = textEl.querySelectorAll("p");
    for (var i = 0; i < ps.length; i++) {
      var raw = (ps[i].textContent || "").trim();
      var m = MARKER_RE.exec(raw);
      if (m) {
        mountConsole(ps[i], m[1]);
        return;
      }
    }
  }

  var obs = new MutationObserver(function () {
    scanForMarker();
  });
  if (document.body) {
    obs.observe(document.body, { childList: true, subtree: true });
  } else {
    window.addEventListener("DOMContentLoaded", function () {
      obs.observe(document.body, { childList: true, subtree: true });
      scanForMarker();
    });
  }
})();
