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
    advisedStarters: null, // optional [{ label, prompt }] from manual AI advice
    advisedBeats: null,    // optional [{ label, prompt }] from manual AI advice
    adviseSeq: 0,
    evalSeq: 0,
    evalResult: null,      // optional { rating, hits, misses, summary, fallback, modelLabel }
    evalBypass: false,
    sceneReady: false,     // true once AI emits [ACT_COMPLETE] or player runs /end
    naturalComplete: false,
    boxEl: null,
    handleTurnAction: null,
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
        advisedStarters: Array.isArray(session.advisedStarters) ? session.advisedStarters : null,
        advisedBeats: Array.isArray(session.advisedBeats) ? session.advisedBeats : null,
        evalResult: session.evalResult || null,
        sceneReady: !!session.sceneReady,
        naturalComplete: !!session.naturalComplete,
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

  /**
   * Approximate token count from average BPE/SentencePiece density (~3.8 chars/token).
   * Used by the scaling slicer when Perchance's in-tab tokenizer is outside this frame.
   */
  function estimateTokens(text) {
    var s = String(text || "");
    if (!s) return 0;
    return Math.ceil(s.length / 3.8);
  }

  function isFreeOpenRouterModel(modelId) {
    var mid = String(modelId || "");
    var low = mid.toLowerCase();
    if (low.indexOf(":free") !== -1) return true;
    var list = session.freeModels || [];
    for (var i = 0; i < list.length; i++) {
      if (list[i] && list[i].id === mid) return !!list[i].is_free;
    }
    return false;
  }

  /**
   * Mirror Perchance's SCALING_SLICER / PF_HARD_MAX context ceilings (0.82 safety factor).
   */
  function getTokenBudget(mode, modelId) {
    var isRemote = mode === "openrouter";
    var isFree = isRemote && isFreeOpenRouterModel(modelId);
    var ceiling = isRemote ? (isFree ? 28000 : 18300) : 8415;
    return {
      ceiling: ceiling,
      hardMax: Math.floor(ceiling * 0.82)
    };
  }

  /**
   * Trim the oldest turns one by one only when the full assembled prompt exceeds hardMax.
   * No static turn count: all turns fit unless the active model's token budget is full.
   */
  function fitTurnsToTokenBudget(turns, buildFullPromptFn, opts) {
    var arr = Array.isArray(turns) ? turns : [];
    if (!arr.length) return [];
    var o = opts || {};
    var budget = o.hardMax || getTokenBudget(o.mode, o.modelId).hardMax;
    var minKeep = typeof o.minKeep === "number" ? Math.min(o.minKeep, arr.length) : Math.min(2, arr.length);
    var slice = arr.slice(0);
    while (slice.length > minKeep && estimateTokens(buildFullPromptFn(slice)) > budget) {
      slice.shift();
    }
    return slice;
  }

  function parseRolledProfile(s) {
    if (!s) return null;
    if (typeof window !== "undefined" && window.RP_DATA_HELPERS && window.RP_DATA_HELPERS.parseGenericProfile) {
      return window.RP_DATA_HELPERS.parseGenericProfile(s);
    }
    if (!s.corve_generic_profile || typeof s.corve_generic_profile !== "string") return null;
    try {
      var obj = JSON.parse(s.corve_generic_profile);
      return obj && Array.isArray(obj.kinks) ? obj : null;
    } catch (e) {
      return null;
    }
  }

  function resolveSceneProfile(cfg, s) {
    if (cfg && cfg.profile && Array.isArray(cfg.profile.kinks)) {
      return cfg.profile;
    }
    return parseRolledProfile(s);
  }

  function formatProfileForPrompt(profile) {
    if (!profile) return "";
    var out = [];
    if (Array.isArray(profile.kinks) && profile.kinks.length) {
      out.push("KINKS / FETISHES (she responds with keen heat when engaged cleanly):");
      profile.kinks.forEach(function (k) { out.push("- " + k.label + ": " + k.cue); });
    }
    if (Array.isArray(profile.dislikes) && profile.dislikes.length) {
      out.push("DISLIKES (if triggered, show unmistakable physical resistance or a sharp quiet pushback so the player can adjust):");
      profile.dislikes.forEach(function (d) { out.push("- " + d.label + ": " + d.cue); });
    }
    if (Array.isArray(profile.positiveTraits) && profile.positiveTraits.length) {
      out.push("POSITIVE PERSONALITY TRAITS:");
      profile.positiveTraits.forEach(function (t) { out.push("- " + t.label + ": " + t.cue); });
    }
    if (profile.negativeTrait) {
      out.push("NEGATIVE PERSONALITY TRAIT (navigable friction/quirk):");
      out.push("- " + profile.negativeTrait.label + ": " + profile.negativeTrait.cue);
    }
    return out.join("\n");
  }

  function formatWarmthDuration(rating) {
    var r = Math.max(0, Math.min(20, Math.round(Number(rating) || 0)));
    var totalMin = 640;
    var chaBonus = 1;
    var clearsMalaise = false;
    var tier = "Standard";
    if (r >= 16) {
      tier = "Peak";
      chaBonus = 2;
      clearsMalaise = true;
      totalMin = 840 + ((r - 16) * 30);
    } else if (r >= 11) {
      tier = "Good";
      chaBonus = 1;
      clearsMalaise = true;
      totalMin = 720 + ((r - 11) * 30);
    } else if (r >= 6) {
      tier = "Routine";
      chaBonus = 1;
      totalMin = 480 + ((r - 6) * 30);
    } else if (r >= 1) {
      tier = "Poor";
      chaBonus = 1;
      totalMin = 240;
    }
    var h = Math.floor(totalMin / 60);
    var m = totalMin % 60;
    var label = h + (h === 1 ? " Hour" : " Hours") + (m > 0 ? (" " + m + " Minutes") : "");
    var bonusLabel = "+" + chaBonus + " CHA" + (clearsMalaise ? " · Mind Eased" : "");
    return {
      rating: r,
      tier: tier,
      chaBonus: chaBonus,
      clearsMalaise: clearsMalaise,
      totalMinutes: totalMin,
      label: label,
      bonusLabel: bonusLabel
    };
  }

  // The boon a graded session pays, for the card and the fallback note. A companion can supply cfg.formatBoon(rating) returning
  // { name, rating, tier, label, bonusLabel }; otherwise it is Widow Corve's Carnal Warmth (+CHA, formatWarmthDuration).
  function boonFor(cfg, rating) {
    if (cfg && typeof cfg.formatBoon === "function") return cfg.formatBoon(rating);
    var d = formatWarmthDuration(rating);
    d.name = "Carnal Warmth";
    return d;
  }

  function buildContextBlocks(cfg, s, memBlock) {
    var settingText = evalField(cfg.setting, s);
    var companionText = evalField(cfg.companion, s);
    var personaText = evalField(cfg.persona, s);
    var npcKnowledge = evalField(cfg.npcKnowledge, s);
    var activeProfile = resolveSceneProfile(cfg, s);
    var profileBlock = formatProfileForPrompt(activeProfile);

    var lines = [
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

    if (profileBlock) {
      lines.push(
        "",
        "COMPANION HIDDEN PREFERENCES & TEMPERAMENT (NEVER break character or mention these as game mechanics; reveal them strictly through natural reactions and subtle physical tells):",
        profileBlock
      );
    }

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
    return lines;
  }

  function buildSystemPrompt(cfg, s, memBlock) {
    var hasProfile = !!resolveSceneProfile(cfg, s);
    var lines = [
      "You are narrating an interactive, uncensored roleplay scene inside a gritty low-fantasy RPG.",
      "PERSPECTIVE & VOICE RULES:",
      "- Write strictly in SECOND PERSON PRESENT TENSE ('You...'), matching the opening scene prose.",
      "- Keep the prose grounded, tactile, physical, and sensory.",
      "- Stay strictly faithful to the clothing, materials, and setting established in the scene (do not invent luxury fabrics or props that are not there, and never refer to trousers, shifts, or other garments that have already been taken off).",
      "- Never dictate the player's spoken words, internal thoughts, or involuntary emotional reactions (never tell the player they are trembling, nervous, or overwhelmed; only describe physical sensations and the companion's actions).",
      "- Do NOT write a list of choices at the end, do NOT speak as an AI assistant, and do NOT summarize or rush to the end of the scene unless the player initiates finishing.",
      "- Write 1 to 2 concise, complete paragraphs per response (around 120 to 180 words total) so your last sentence always finishes cleanly without being cut off."
    ];
    if (hasProfile) {
      lines.push(
        "- ATTENTIVE RECIPROCITY: " + (evalField(cfg.reciprocity, s) || "Remember the player is a paying guest she genuinely wants to leave thoroughly spent and satisfied.") + " Her Kinks, Dislikes, and Traits shape HOW she enjoys the encounter and how she responds—they do NOT make her a passive or entitled receiver. She takes active physical initiative with her own hands, mouth, hips, and rhythm to pleasure the player, and rewards the player eagerly whenever they read her cues well.",
        "- LIVE PREFERENCE & DISLIKE CUES: When untouched or between beats, weave subtle physical invitations toward one of her Kinks. STRICT BOUNDARY RULE: If the player triggers one of her Dislikes, she MUST visibly resist right away in-character (stiffen, catch or push their hands off, recoil, or give a sharp quiet warning)—never reward or eagerly escalate through an active Dislike unless they soften or adjust. If the player asks in-character what she wants, let her answer authentically according to her traits (candid if Candid/Bold, teasingly reserved if Guarded/Stubborn).",
        "- PACING & CLIMAX SIGNAL: Do NOT rush to finish early. Do NOT emit the completion tag merely because SHE has climaxed—if she finishes first, she should naturally shift her focus to bringing the player to release too. ONLY append the exact tag [ACT_COMPLETE]. (period outside the bracket) at the very end of your response once the PLAYER ('You') has genuinely reached climax/release and the scene is settling into afterglow (or the player explicitly winds the encounter down)."
      );
    }
    lines.push("");
    return lines.concat(buildContextBlocks(cfg, s, memBlock)).join("\n");
  }

  function buildAdvisorSystemPrompt(cfg, s, memBlock) {
    var hasProfile = !!resolveSceneProfile(cfg, s);
    var lines = [
      "You are an interactive roleplay advisor for the player ('You') in an uncensored, gritty low-fantasy scene.",
      "Based on the room, companion persona, memories, and where the scene stands right now, suggest 4 distinct, immediately playable next actions or spoken lines the player can take next.",
      "VARIETY GUIDELINES:",
      "- Offer 4 noticeably different directions (for example: letting the companion take the lead/reacting to them, a gentle or observant touch, a bolder escalation or physical shift, and a quiet spoken line or question grounded in the scene).",
      "- Keep every option grounded strictly in the physical details, clothing, and tone established in the scene."
    ];
    if (hasProfile) {
      lines.push("- Keep the 4 choices balanced across distinct styles and never name or spoil hidden kink, dislike, or trait labels outright.");
    }
    lines.push(
      "",
      "OUTPUT FORMAT (STRICT):",
      "Output ONLY 4 lines, one option per line, using this exact format:",
      "Short Label || Complete 1-sentence player action or dialogue direction.",
      "- Short Label: 2 to 4 words for a UI button (e.g. 'Trace her collarbone', 'Let her lead', 'Ask about the scar').",
      "- Action direction: 1 concise, vivid sentence under 16 words written for the player's next turn (no preamble, no numbering, no extra commentary).",
      ""
    );
    return lines.concat(buildContextBlocks(cfg, s, memBlock)).join("\n");
  }

  function buildEvaluationSystemPrompt(cfg, s, profile) {
    var lines = [
      "You are a strict, impartial post-scene evaluator for an adult low-fantasy RPG encounter.",
      "Grade how well the player ('You') performed with this companion based strictly on the transcript below and her hidden profile.",
      "ANTI-INFLATION RULE: Do NOT hand out high scores merely for being polite or avoiding Dislikes. Polite routine play that misses her Kinks should land around 8 to 11 total, NOT 16+.",
      "",
      "COMPANION PROFILE TO GRADE AGAINST:",
      formatProfileForPrompt(profile),
      "",
      "SCORE 4 SEPARATE CATEGORIES (OUR CODE SUMS THEM TO 20):",
      "1. KINKS_SCORE (0 to 6): +3 per distinct Kink from her profile genuinely engaged by the player (0 if none, 1-2 if barely brushed, 3 for one clear hit, 6 for two or more distinct Kinks landed).",
      "2. BOUNDARIES_SCORE (0 to 4): 4 if zero Dislikes triggered; 3 if triggered once but the player immediately adjusted; 1-2 if clumsily tripped; 0 if pushed through a Dislike repeatedly.",
      "3. TRAITS_SCORE (0 to 5): How well the player played to her Positive Traits AND navigated her Negative Trait (2-3 = neutral/adequate, 4-5 = actively read and leveraged her temperament).",
      "4. PACING_SCORE (0 to 5): Sensory progression, initiative, and attentiveness across turns (1-2 = rushed or passive, 3 = steady, 4-5 = rich, natural build-up and mutual satisfaction).",
      "",
      "OUTPUT FORMAT (STRICT — KEEP ANY INTERNAL ANALYSIS BRIEF, THEN OUTPUT ONLY THESE 5 LINES AND END EVERY LINE WITH A PERIOD):",
      "KINKS_SCORE: <integer 0-6> | <exact comma-separated Kink labels from her profile that the player genuinely landed, or None>.",
      "BOUNDARIES_SCORE: <integer 0-4> | <exact comma-separated Dislike labels triggered, or Clean>.",
      "TRAITS_SCORE: <integer 0-5> | <brief 1-clause note on how you handled her Positive & Negative Traits>.",
      "PACING_SCORE: <integer 0-5> | <brief 1-clause note on pacing, initiative, and attentiveness>.",
      "SUMMARY: <2 concise sentences addressed directly to 'You' explaining what worked well and where you fell short>."
    ];
    return lines.join("\n");
  }

  function buildEvaluationUserPrompt(sysPrompt, mode, modelId) {
    function assemble(turnsSlice) {
      var historyLines = [];
      if (session.openingText) {
        historyLines.push("OPENING SCENE:\n" + session.openingText);
      }
      historyLines.push("ENCOUNTER TRANSCRIPT:\n" + formatTurnsForPrompt(turnsSlice));
      historyLines.push("TASK: Score the 4 categories strictly using the exact 5-line format (KINKS_SCORE, BOUNDARIES_SCORE, TRAITS_SCORE, PACING_SCORE, SUMMARY). Use exact Kink/Dislike labels from her profile and end every line with a period.");
      return historyLines.join("\n\n");
    }

    var fitted = fitTurnsToTokenBudget(
      session.turns,
      function (slice) { return (sysPrompt ? sysPrompt + "\n\n" : "") + assemble(slice); },
      { mode: mode, modelId: modelId, minKeep: 2 }
    );
    return assemble(fitted);
  }

  function formatTurnsForPrompt(turnsSlice) {
    return turnsSlice.map(function (t) {
      return (t.role === "user" ? "PLAYER ACTION: " : "SCENE CONTINUATION:\n") + t.text;
    }).join("\n\n");
  }

  function buildUserPrompt(playerAction, sysPrompt, mode, modelId) {
    function assemble(turnsSlice) {
      var historyLines = [];
      if (session.openingText) {
        historyLines.push("OPENING SCENE ON PAGE:\n" + session.openingText);
      }
      if (turnsSlice.length > 0) {
        historyLines.push("RECENT TURNS:\n" + formatTurnsForPrompt(turnsSlice));
      }
      historyLines.push("CURRENT PLAYER ACTION / DIRECTION:\n" + playerAction);
      if (turnsSlice.length === 0 && resolveSceneProfile(session.cfg, statsNow())) {
        historyLines.push(
          "Continue the scene immediately in second-person present tense ('You...') for 1-2 paragraphs. In this opening turn, react naturally to the player's physical build/skin and establish her personality (both positive traits and negative quirk) alongside at least one subtle, in-character physical hint toward one of her Kinks:"
        );
      } else if (turnsSlice.length === 0) {
        historyLines.push(
          "Continue the scene immediately in second-person present tense ('You...') for 1-2 paragraphs, reacting naturally to the player's physical build, skin, and appearance in the room:"
        );
      } else {
        historyLines.push("Continue the scene immediately in second-person present tense ('You...') for 1-2 paragraphs:");
      }
      return historyLines.join("\n\n");
    }

    var historyTurns = session.turns.slice(0);
    if (historyTurns.length > 0 && historyTurns[historyTurns.length - 1].role === "user" && historyTurns[historyTurns.length - 1].text === playerAction) {
      historyTurns.pop();
    }

    var fitted = fitTurnsToTokenBudget(
      historyTurns,
      function (slice) { return (sysPrompt ? sysPrompt + "\n\n" : "") + assemble(slice); },
      { mode: mode, modelId: modelId, minKeep: 2 }
    );
    return assemble(fitted);
  }

  function buildAdvisorUserPrompt(sysPrompt, mode, modelId) {
    function assemble(turnsSlice) {
      var historyLines = [];
      if (session.openingText) {
        historyLines.push("OPENING SCENE ON PAGE:\n" + session.openingText);
      }
      if (turnsSlice.length > 0) {
        historyLines.push("CONVERSATION SO FAR:\n" + formatTurnsForPrompt(turnsSlice));
      }
      historyLines.push(
        turnsSlice.length > 0
          ? "TASK: Advise 4 distinct next actions or lines the player can immediately take right after the latest turn."
          : "TASK: Advise 4 distinct opening actions or lines the player can immediately take to begin this scene."
      );
      return historyLines.join("\n\n");
    }

    var fitted = fitTurnsToTokenBudget(
      session.turns,
      function (slice) { return (sysPrompt ? sysPrompt + "\n\n" : "") + assemble(slice); },
      { mode: mode, modelId: modelId, minKeep: 2 }
    );
    return assemble(fitted);
  }

  function parseSceneReadyResponse(rawText) {
    var s = String(rawText || "");
    var actComplete = /\[{1,2}\s*ACT[\s_]+COMPLETE[\s.!]*\]{1,2}/i.test(s);
    var cleaned = s.replace(/\s*\[{1,2}\s*ACT[\s_]+COMPLETE[\s.!]*\]{1,2}[.!\s]*/gi, "\n").trim();
    return { text: cleaned, actComplete: actComplete };
  }

  function shortenChipLabel(promptText) {
    var clean = String(promptText || "").replace(/^["'\u201c\u2018]+|["'\u201d\u2019]+$/g, "").trim();
    var words = clean.split(/\s+/).filter(Boolean);
    if (words.length <= 4) return clean.replace(/[.!?]+$/, "");
    return words.slice(0, 4).join(" ").replace(/[,:;]+$/, "") + "\u2026";
  }

  /**
   * Parse AI-advised lines into [{ label, prompt }] cleanly even when free models
   * emit numbering, bullets, bold markdown, or omit the `||` delimiter.
   */
  function parseAdvisedChoices(rawText) {
    var s = String(rawText || "");
    s = s.replace(/<think>[\s\S]*?<\/think>/gi, "");
    s = s.replace(/```[a-zA-Z]*\n?/g, "").replace(/```/g, "");
    var lines = s.split(/\r?\n/);
    var out = [];
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (!line) continue;
      // Strip leading bullets / numbers like "1.", "1)", "-", "*", "•"
      line = line.replace(/^(?:[-*\u2022]+|\d+[.):])\s*/, "").trim();
      if (!line) continue;
      // Skip conversational preambles
      if (/^(?:here are|sure|certainly|below are|options?:|choices?:)/i.test(line) && line.indexOf("||") === -1) {
        continue;
      }
      var label = "";
      var prompt = "";
      var sepIdx = line.indexOf("||");
      if (sepIdx !== -1) {
        label = line.slice(0, sepIdx).trim();
        prompt = line.slice(sepIdx + 2).trim();
      } else {
        var altMatch = line.match(/^([^|:—-]{2,36})\s*(?:\||—|:)\s+(.{8,})$/);
        if (altMatch) {
          label = altMatch[1].trim();
          prompt = altMatch[2].trim();
        } else {
          prompt = line;
        }
      }
      label = label.replace(/^\*+|\*+$/g, "").replace(/^["']|["']$/g, "").trim();
      prompt = prompt.replace(/^\*+|\*+$/g, "").trim();
      if (!prompt || prompt.length < 6) continue;
      if (!label || label.length > 42) {
        label = shortenChipLabel(prompt);
      }
      out.push({ label: label, prompt: prompt });
      if (out.length >= 4) break;
    }
    return out;
  }

  function matchProfileItems(list, text) {
    if (!Array.isArray(list) || !list.length) return [];
    var norm = String(text || "").toLowerCase();
    if (!norm || /^\s*(none|clean|n\/a|none noted)\.?$/i.test(norm)) return [];
    var matched = [];
    for (var i = 0; i < list.length; i++) {
      var item = list[i];
      var lbl = String(item.label || "").toLowerCase();
      if (!lbl) continue;
      if (norm.indexOf(lbl) >= 0) {
        matched.push(item.id || item.label);
        continue;
      }
      // Also match significant words (e.g., "Slow Edging" for "Slow Edging & Teasing")
      var tokens = lbl.split(/[^a-z0-9]+/).filter(function (w) { return w.length >= 4 && w !== "with" && w !== "from" && w !== "that" && w !== "your"; });
      var hits = 0;
      for (var j = 0; j < tokens.length; j++) {
        if (norm.indexOf(tokens[j]) >= 0) hits++;
      }
      if (tokens.length > 0 && hits >= Math.min(2, tokens.length)) {
        matched.push(item.id || item.label);
      }
    }
    return matched;
  }

  function parseSubScoreLine(line, keyRe, maxVal) {
    var m = line.match(keyRe);
    if (!m) return null;
    var rest = m[1].replace(/^\*+|\*+$/g, "").trim();
    var mNum = rest.match(/^(\d{1,2})(?:\s*(?:\/|out of)\s*\d{1,2})?(?:\s*[|:\-—]\s*(.*))?$/i);
    if (!mNum) return null;
    var val = Math.max(0, Math.min(maxVal, parseInt(mNum[1], 10)));
    var note = (mNum[2] || "").replace(/^\*+|\*+$/g, "").replace(/\.+$/, "").trim();
    return { score: val, max: maxVal, note: note };
  }

  function parseEvaluationResult(rawText, opts) {
    var s = String(rawText || "");
    s = s.replace(/<think>[\s\S]*?<\/think>/gi, "");
    s = s.replace(/```[a-zA-Z]*\n?/g, "").replace(/```/g, "").trim();
    var hits = "";
    var misses = "";
    var summary = "";
    var rating = null;
    var kinksSub = null;
    var boundsSub = null;
    var traitsSub = null;
    var pacingSub = null;
    var activeKey = "";
    var lines = s.split(/\r?\n/);
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim().replace(/^(?:[-*\u2022]+|\d+[.):])\s*/, "").trim();
      if (!line) continue;
      var k = parseSubScoreLine(line, /^(?:\*\*)?KINKS_SCORE(?:\*\*)?\s*[:-]\s*(.*)$/i, 6);
      if (k) { activeKey = "kinks"; kinksSub = k; hits = k.note || "None"; continue; }
      var b = parseSubScoreLine(line, /^(?:\*\*)?BOUNDARIES_SCORE(?:\*\*)?\s*[:-]\s*(.*)$/i, 4);
      if (b) { activeKey = "boundaries"; boundsSub = b; misses = b.note || "Clean"; continue; }
      var t = parseSubScoreLine(line, /^(?:\*\*)?TRAITS_SCORE(?:\*\*)?\s*[:-]\s*(.*)$/i, 5);
      if (t) { activeKey = "traits"; traitsSub = t; continue; }
      var p = parseSubScoreLine(line, /^(?:\*\*)?PACING_SCORE(?:\*\*)?\s*[:-]\s*(.*)$/i, 5);
      if (p) { activeKey = "pacing"; pacingSub = p; continue; }
      var mHits = line.match(/^(?:\*\*)?HITS(?:\*\*)?\s*[:-]\s*(.*)$/i);
      if (mHits) { activeKey = "hits"; hits = mHits[1].replace(/^\*+|\*+$/g, "").trim(); continue; }
      var mMiss = line.match(/^(?:\*\*)?MISSES(?:\*\*)?\s*[:-]\s*(.*)$/i);
      if (mMiss) { activeKey = "misses"; misses = mMiss[1].replace(/^\*+|\*+$/g, "").trim(); continue; }
      var mSum = line.match(/^(?:\*\*)?(?:SUMMARY|REVIEW|VERDICT)(?:\*\*)?\s*[:-]\s*(.*)$/i);
      if (mSum) { activeKey = "summary"; summary = mSum[1].replace(/^\*+|\*+$/g, "").trim(); continue; }
      var mRate = line.match(/^(?:\*\*)?(?:RATING|SCORE|GRADE)(?:\*\*)?\s*[:-]\s*\**\s*(\d{1,2})\s*\**(?:\s*(?:\/|out of)\s*20)?\b/i);
      if (mRate) {
        activeKey = "rating";
        var n = parseInt(mRate[1], 10);
        if (!isNaN(n)) rating = Math.max(1, Math.min(20, n));
        continue;
      }
      if (activeKey === "summary") {
        summary = (summary ? summary + " " : "") + line.replace(/^\*+|\*+$/g, "").trim();
      }
    }

    var breakdown = null;
    var userTurns = opts && typeof opts.userTurns === "number" ? opts.userTurns : null;
    if (kinksSub && boundsSub && traitsSub && pacingSub) {
      var pacingScore = pacingSub.score;
      if (userTurns !== null && userTurns <= 1) pacingScore = Math.min(pacingScore, 1);
      else if (userTurns !== null && userTurns === 2) pacingScore = Math.min(pacingScore, 3);
      var sum = kinksSub.score + boundsSub.score + traitsSub.score + pacingScore;
      if (userTurns !== null && userTurns <= 1) sum = Math.min(sum, 10);
      else if (userTurns !== null && userTurns === 2) sum = Math.min(sum, 14);
      rating = Math.max(1, Math.min(20, sum));
      breakdown = {
        kinks: { score: kinksSub.score, max: 6, note: kinksSub.note },
        boundaries: { score: boundsSub.score, max: 4, note: boundsSub.note },
        traits: { score: traitsSub.score, max: 5, note: traitsSub.note },
        pacing: { score: pacingScore, max: 5, note: pacingSub.note }
      };
    } else {
      if (rating === null) {
        var alt = s.match(/\b(20|1\d|[1-9])\s*(?:\/|out of)\s*20\b/i);
        if (alt) rating = Math.max(1, Math.min(20, parseInt(alt[1], 10)));
      }
      if (rating !== null && userTurns !== null) {
        if (userTurns <= 1) rating = Math.min(rating, 10);
        else if (userTurns === 2) rating = Math.min(rating, 14);
      }
    }

    if (!summary && s && rating !== null) {
      summary = s.replace(/^(?:[-*\u2022]+\s*)?(?:\*\*)?(?:KINKS_SCORE|BOUNDARIES_SCORE|TRAITS_SCORE|PACING_SCORE|HITS|MISSES|RATING|SCORE|GRADE)[^\n]*$/gim, "").trim().slice(0, 360);
    }
    if (rating === null) return null;

    var profile = opts && opts.profile ? opts.profile : null;
    var discoveredKinks = profile ? matchProfileItems(profile.kinks, hits) : [];
    var trippedDislikes = profile ? matchProfileItems(profile.dislikes, misses) : [];

    return {
      rating: rating,
      breakdown: breakdown,
      hits: hits || "None",
      misses: misses || "Clean",
      discoveredKinks: discoveredKinks,
      trippedDislikes: trippedDislikes,
      summary: summary || "Evaluation completed."
    };
  }

  function fetchMemories(threadId, queryText) {
    var baseUrl = getServerUrl();
    if (!baseUrl || !threadId) return Promise.resolve("");
    var s = statsNow();
    var currentDay = Number(s.campaign_day) || 1;
    // s.intimate_encounters counts completed encounters (incremented after the act finishes),
    // so during an active visit past completed visits have order <= s.intimate_encounters.
    var maxVisit = Math.max(0, Number(s.intimate_encounters) || 0);
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

  function resetMemorySessionState() {
    session.active = false;
    session.id = null;
    session.pageId = null;
    session.cfg = null;
    session.openingText = "";
    session.turns = [];
    session.advisedStarters = null;
    session.advisedBeats = null;
    session.adviseSeq += 1;
    session.evalSeq += 1;
    session.evalResult = null;
    session.evalBypass = false;
    session.sceneReady = false;
    session.naturalComplete = false;
    session.triggerEval = null;
    session.handleTurnAction = null;
    session.syncNextBtn = null;
    session.boxEl = null;
    session.busy = false;
  }

  // Called on a genuine new game (see restoreGame() in web/util.js).
  // Clears any active RP session cache and assigns a fresh rp_world_id for the new playthrough
  // WITHOUT wiping other save slots' or other devices' MemPalace rooms on the server!
  RP.resetAll = function () {
    resetMemorySessionState();
    clearActiveSession();
    var s = statsNow();
    s.rp_world_id = "w" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  };

  RP.getServerUrl = getServerUrl;
  RP.estimateTokens = estimateTokens;
  RP.getTokenBudget = getTokenBudget;
  RP.fitTurnsToTokenBudget = fitTurnsToTokenBudget;
  RP.parseAdvisedChoices = parseAdvisedChoices;
  RP.parseEvaluationResult = parseEvaluationResult;
  RP.formatWarmthDuration = formatWarmthDuration;
  RP.boonFor = boonFor;
  RP.resolveSceneProfile = resolveSceneProfile;
  RP.parseSceneReadyResponse = parseSceneReadyResponse;

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

  function renderTurnParagraphs(container, text, cssClass) {
    var paras = String(text || "").split(/\n\s*\n/).map(function (p) { return p.trim(); }).filter(Boolean);
    var created = [];
    paras.forEach(function (paraText) {
      var p;
      // Use window.printParagraph if available so TTSReader's hook automatically receives and queues the new paragraph!
      if (typeof window.printParagraph === "function") {
        p = window.printParagraph(paraText, container);
      } else {
        p = document.createElement("p");
        p.textContent = paraText;
        container.appendChild(p);
      }
      if (p) {
        if (cssClass) p.classList.add(cssClass);
        created.push(p);
      }
    });
    return created;
  }

  function createTurnBlock(role, text, beforeNode) {
    var textEl = liveTextContainer();
    if (!textEl) return null;
    var cssClass = role === "user" ? "rp-player-turn" : "rp-ai-turn";

    var wrap = document.createElement("div");
    wrap.className = "rp-turn";
    wrap.setAttribute("data-role", role);

    var content = document.createElement("div");
    content.className = "rp-turn-content";
    wrap.appendChild(content);

    var actions = document.createElement("div");
    actions.className = "rp-turn-actions";
    actions.innerHTML =
      '<button type="button" class="rp-tbtn" data-tact="edit" title="Edit this message">\u270E</button>' +
      '<button type="button" class="rp-tbtn" data-tact="regen" title="Regenerate AI response from here">\u21BB</button>' +
      '<button type="button" class="rp-tbtn rp-tbtn-del" data-tact="del" title="Delete this message">\u2715</button>';
    wrap.appendChild(actions);

    if (beforeNode && beforeNode.parentNode === textEl) {
      textEl.insertBefore(wrap, beforeNode);
    } else {
      textEl.appendChild(wrap);
    }

    var pEls = renderTurnParagraphs(content, text, cssClass);
    var turnObj = { role: role, text: text, wrap: wrap, content: content, actions: actions, pEls: pEls };
    wrap._rpTurn = turnObj;
    return turnObj;
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
        var maxV = Math.max(0, Number(statsNow().intimate_encounters) || 0);
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
    session.advisedStarters = null;
    session.advisedBeats = null;
    session.adviseSeq += 1;
    session.evalSeq += 1;
    session.evalResult = null;
    session.evalBypass = false;
    session.sceneReady = false;
    session.naturalComplete = false;
    session.triggerEval = null;
    session.handleTurnAction = null;
    session.syncNextBtn = null;
    session.saveMemory = cfg.memory !== false;
    session.busy = false;
    session.openingText = collectOpeningNarrative(textEl, markerParagraph);

    var box = document.createElement("div");
    box.className = "rp-box";
    box.id = "rpConsoleBox";
    session.boxEl = box;

    var title = evalField(cfg.title, s) || "Roleplay Session";
    var subtitle = evalField(cfg.subtitle, s) || "";
    var staticStarters = cfg.starters || [];
    var staticBeats = cfg.beats || DEFAULT_BEATS;
    var hasMem = cfg.memory !== false;

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
        '<div class="rp-typing" hidden>' +
          '<div class="rp-typing-dots"><span></span><span></span><span></span></div>' +
          '<span class="rp-typing-text">Writing response...</span>' +
        '</div>' +
        '<div class="rp-eval-card" hidden></div>' +
        '<div class="rp-composer">' +
          '<div class="rp-starters"></div>' +
          '<div class="rp-beats" style="display:none"></div>' +
          '<textarea class="rp-input" placeholder="Write what you do or say (or click a prompt chip above)..."></textarea>' +
          '<div class="rp-foot">' +
            '<div class="rp-actions-left">' +
              '<button type="button" class="rp-btn rp-btn-primary" data-act="send">Send / Continue</button>' +
              '<button type="button" class="rp-btn rp-btn-advise" data-act="advise" title="Ask the AI to advise context-aware choices for this moment (replaces static chips)">\u2726 Advise</button>' +
            '</div>' +
            '<div class="rp-actions-right">' +
              (hasMem ? '<label class="rp-mem-check" title="When checked, this scene will be distilled into a memory for this companion when you leave"><input type="checkbox" class="rp-save-mem-cb" checked><span>Save as memory</span></label>' : '') +
              '<span class="rp-status">Scene in progress. Type &quot;/end&quot; anytime to wrap up early.</span>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';

    textEl.replaceChild(box, markerParagraph);

    var inputEl = box.querySelector(".rp-input");
    var statusEl = box.querySelector(".rp-status");
    var sendBtn = box.querySelector('[data-act="send"]');
    var adviseBtn = box.querySelector('[data-act="advise"]');
    var modeSel = box.querySelector(".rp-mode-select");
    var modelSel = box.querySelector(".rp-model-select");
    var composerEl = box.querySelector(".rp-composer");
    var evalCardEl = box.querySelector(".rp-eval-card");
    var starterWrap = box.querySelector(".rp-starters");
    var beatsWrap = box.querySelector(".rp-beats");
    var typingEl = box.querySelector(".rp-typing");
    var typingTextEl = box.querySelector(".rp-typing-text");
    var memDrawer = box.querySelector(".rp-mem-drawer");
    var memList = box.querySelector(".rp-mem-list");
    var saveMemCb = box.querySelector(".rp-save-mem-cb");

    function renderChips() {
      if (starterWrap) {
        var useAdvisedStarters = Array.isArray(session.advisedStarters) && session.advisedStarters.length > 0;
        if (useAdvisedStarters) {
          starterWrap.innerHTML =
            '<div class="rp-chips-head">' +
              '<span class="rp-beats-label rp-beats-label-adv">\u2726 Advised Moves</span>' +
              '<button type="button" class="rp-chip rp-chip-reset" data-act="reset-chips" title="Restore the static fallback choices">\u21A9 Default</button>' +
            '</div>' +
            '<div class="rp-starters-grid">' +
              session.advisedStarters.map(function (c) {
                return (
                  '<button type="button" class="rp-chip rp-chip-advised rp-chip-card" data-starter="' + esc(c.prompt) + '" title="' + esc(c.prompt) + '">' +
                    '<span class="rp-card-title">' + esc(c.label) + '</span>' +
                    '<span class="rp-card-desc">' + esc(c.prompt) + '</span>' +
                  '</button>'
                );
              }).join("") +
            '</div>';
        } else {
          starterWrap.innerHTML =
            '<div class="rp-chips-head">' +
              '<span class="rp-beats-label">Opening Moves</span>' +
            '</div>' +
            '<div class="rp-starters-grid">' +
              staticStarters.map(function (st) {
                return (
                  '<button type="button" class="rp-chip rp-chip-card" data-starter="' + esc(st) + '">' +
                    '<span class="rp-card-desc">' + esc(st) + '</span>' +
                  '</button>'
                );
              }).join("") +
            '</div>';
        }
      }

      if (beatsWrap) {
        var useAdvisedBeats = Array.isArray(session.advisedBeats) && session.advisedBeats.length > 0;
        var list = useAdvisedBeats ? session.advisedBeats : staticBeats;
        var heading = useAdvisedBeats
          ? '<span class="rp-beats-label rp-beats-label-adv">\u2726 Advised:</span>'
          : '<span class="rp-beats-label">Next Beat:</span>';
        var chipsHtml = list.map(function (b) {
          var cls = "rp-chip rp-chip-beat" + (useAdvisedBeats ? " rp-chip-advised" : "");
          return '<button type="button" class="' + cls + '" data-beat="' + esc(b.prompt) + '" title="' + esc(b.prompt) + '">' + esc(b.label) + '</button>';
        }).join("");
        var resetHtml = useAdvisedBeats
          ? '<button type="button" class="rp-chip rp-chip-beat rp-chip-reset rp-chip-reset-end" data-act="reset-chips" title="Restore the static fallback choices">\u21A9 Default</button>'
          : "";
        beatsWrap.innerHTML = heading + chipsHtml + resetHtml;
      }
    }

    function updateChipsVisibility() {
      var hasTurns = session.turns.length > 0;
      var hasStarters = (Array.isArray(session.advisedStarters) && session.advisedStarters.length > 0) || staticStarters.length > 0;
      if (starterWrap) starterWrap.style.display = (!hasTurns && hasStarters) ? "" : "none";
      if (beatsWrap) beatsWrap.style.display = hasTurns ? "flex" : "none";
    }

    function syncChoiceScriptNextBtn(nextBtn) {
      var liveBox = document.getElementById("rpConsoleBox");
      if (!liveBox || liveBox !== session.boxEl) return;
      var nb = nextBtn || document.querySelector("#main button.next");
      if (!nb) return;
      var showNext = !session.evalResult && (!!session.sceneReady || !resolveSceneProfile(cfg, statsNow()));
      nb.style.display = showNext ? "" : "none";
      if (showNext) nb.disabled = !!session.busy;
    }
    session.syncNextBtn = syncChoiceScriptNextBtn;

    function updateButtons() {
      sendBtn.disabled = session.busy;
      if (adviseBtn) adviseBtn.disabled = session.busy;
      Array.prototype.forEach.call(box.querySelectorAll(".rp-chip"), function (c) {
        c.disabled = session.busy;
      });
      if (typingEl) typingEl.hidden = !session.busy;
      updateChipsVisibility();
      syncChoiceScriptNextBtn();
    }

    function setStatus(msg) {
      if (statusEl) statusEl.textContent = msg;
    }

    function resolveActiveMode() {
      if (settings.mode === "auto") {
        return session.workerConnected ? "perchance" : "openrouter";
      }
      return settings.mode;
    }

    function dispatchRpGenerate(chosenMode, sysPrompt, buildPromptForMode, maxTokens, actionLabel) {
      var baseUrl = getServerUrl();
      var usrPrompt = buildPromptForMode(chosenMode, settings.model);
      return fetch(baseUrl + "/rp_generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
        body: JSON.stringify({
          mode: chosenMode,
          model: settings.model,
          raw_mode: true,
          max_tokens: maxTokens,
          system: sysPrompt,
          prompt: usrPrompt
        })
      }).then(function (r) { return r.json(); })
        .then(function (res) {
          if (res.status !== "SUCCESS" && settings.mode === "auto" && chosenMode === "perchance") {
            setStatus("Perchance tab asleep — falling back to OpenRouter...");
            if (typingTextEl) typingTextEl.textContent = actionLabel + " (OpenRouter fallback)...";
            var fallbackPrompt = buildPromptForMode("openrouter", settings.model);
            return fetch(baseUrl + "/rp_generate", {
              method: "POST",
              headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
              body: JSON.stringify({
                mode: "openrouter",
                model: settings.model,
                raw_mode: true,
                max_tokens: maxTokens,
                system: sysPrompt,
                prompt: fallbackPrompt
              })
            }).then(function (r2) { return r2.json(); });
          }
          return res;
        });
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
      var maxV = Math.max(0, Number(statsNow().intimate_encounters) || 0);
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

    function renderTagRow(titleText, items, clsName) {
      if (!items || !items.length) return "";
      var pills = items.map(function (it) {
        return '<span class="rp-eval-tag ' + clsName + '" title="' + esc(it.cue || "") + '">' + esc(it.label) + '</span>';
      }).join("");
      return '<div class="rp-eval-row"><span class="rp-eval-row-label">' + esc(titleText) + '</span><div class="rp-eval-tags">' + pills + '</div></div>';
    }

    function renderEvalCard(result, nextBtn) {
      if (!evalCardEl || !result) return;
      var profile = resolveSceneProfile(cfg, statsNow());
      var dur = boonFor(cfg, result.fallback ? 0 : result.rating);
      var scoreText = result.fallback ? "Base Only" : (dur.rating + " / 20 · " + dur.tier);
      var boonText = result.fallback
        ? dur.name + ": " + dur.label + " (grading unavailable)"
        : dur.name + ": " + dur.bonusLabel + " · " + dur.label;

      var subscoresHtml = "";
      if (result.breakdown) {
        var bd = result.breakdown;
        subscoresHtml =
          '<div class="rp-eval-subscores">' +
            '<div class="rp-eval-sub" title="' + esc(bd.kinks.note || "") + '"><span>Kinks</span><strong>' + bd.kinks.score + '/' + bd.kinks.max + '</strong></div>' +
            '<div class="rp-eval-sub" title="' + esc(bd.boundaries.note || "") + '"><span>Boundaries</span><strong>' + bd.boundaries.score + '/' + bd.boundaries.max + '</strong></div>' +
            '<div class="rp-eval-sub" title="' + esc(bd.traits.note || "") + '"><span>Traits</span><strong>' + bd.traits.score + '/' + bd.traits.max + '</strong></div>' +
            '<div class="rp-eval-sub" title="' + esc(bd.pacing.note || "") + '"><span>Pacing</span><strong>' + bd.pacing.score + '/' + bd.pacing.max + '</strong></div>' +
          '</div>';
      }

      var discoveredKinks = Array.isArray(result.discoveredKinks) ? result.discoveredKinks : [];
      var trippedDislikes = Array.isArray(result.trippedDislikes) ? result.trippedDislikes : [];
      var profileHtml = "";
      if (profile) {
        var kinkPills = (profile.kinks || []).map(function (it) {
          var key = it.id || it.label;
          var found = discoveredKinks.indexOf(key) >= 0;
          return found
            ? '<span class="rp-eval-tag rp-eval-tag-hit" title="' + esc(it.cue || "") + '">\u2713 ' + esc(it.label) + '</span>'
            : '<span class="rp-eval-tag rp-eval-tag-unknown" title="Undiscovered preference">? Undiscovered</span>';
        }).join("");

        var trippedItems = (profile.dislikes || []).filter(function (it) {
          return trippedDislikes.indexOf(it.id || it.label) >= 0;
        });
        var dislikePills = trippedItems.length
          ? trippedItems.map(function (it) {
              return '<span class="rp-eval-tag rp-eval-tag-dislike" title="' + esc(it.cue || "") + '">\u2717 ' + esc(it.label) + '</span>';
            }).join("")
          : '<span class="rp-eval-tag rp-eval-tag-clean">\u2713 No Dislikes Tripped</span>';

        var traitsList = [];
        if (Array.isArray(profile.positiveTraits)) {
          profile.positiveTraits.forEach(function (t) { traitsList.push({ label: "+ " + t.label, cue: t.cue }); });
        }
        if (profile.negativeTrait) {
          traitsList.push({ label: "- " + profile.negativeTrait.label, cue: profile.negativeTrait.cue, isNeg: true });
        }
        var traitTagsHtml = traitsList.length
          ? '<div class="rp-eval-row"><span class="rp-eval-row-label">Temperament:</span><div class="rp-eval-tags">' +
              traitsList.map(function (t) {
                return '<span class="rp-eval-tag ' + (t.isNeg ? "rp-eval-tag-neg" : "rp-eval-tag-pos") + '" title="' + esc(t.cue || "") + '">' + esc(t.label) + '</span>';
              }).join("") +
            '</div></div>'
          : "";

        profileHtml =
          '<div class="rp-eval-profile">' +
            '<div class="rp-eval-profile-head">Companion Readout (' + discoveredKinks.length + '/' + (profile.kinks ? profile.kinks.length : 0) + ' Kinks Found)</div>' +
            '<div class="rp-eval-row"><span class="rp-eval-row-label">Kinks:</span><div class="rp-eval-tags">' + kinkPills + '</div></div>' +
            '<div class="rp-eval-row"><span class="rp-eval-row-label">Dislikes:</span><div class="rp-eval-tags">' + dislikePills + '</div></div>' +
            traitTagsHtml +
          '</div>';
      }

      var feedbackLines = [];
      if (result.breakdown) {
        if (result.breakdown.traits.note) feedbackLines.push('<div><strong>Temperament:</strong> ' + esc(result.breakdown.traits.note) + '</div>');
        if (result.breakdown.pacing.note) feedbackLines.push('<div><strong>Pacing:</strong> ' + esc(result.breakdown.pacing.note) + '</div>');
      } else {
        if (result.hits) feedbackLines.push('<div><strong>What landed:</strong> ' + esc(result.hits) + '</div>');
        if (result.misses) feedbackLines.push('<div><strong>Where you slipped:</strong> ' + esc(result.misses) + '</div>');
      }

      evalCardEl.innerHTML =
        '<div class="rp-eval-head">' +
          '<div class="rp-eval-title">\u2726 Post-Scene Review</div>' +
          '<div class="rp-eval-badges">' +
            '<span class="rp-eval-score">' + esc(scoreText) + '</span>' +
            '<span class="rp-eval-boon">' + esc(boonText) + '</span>' +
          '</div>' +
        '</div>' +
        subscoresHtml +
        '<div class="rp-eval-summary">' + esc(result.summary || "") + '</div>' +
        (feedbackLines.length ? '<div class="rp-eval-feedback">' + feedbackLines.join("") + '</div>' : '') +
        profileHtml +
        '<div class="rp-eval-foot">' +
          '<button type="button" class="rp-btn" data-act="resume-rp" title="Return to the scene and keep roleplaying before finishing">\u2190 Continue Roleplay</button>' +
          '<div class="rp-actions-left">' +
            '<button type="button" class="rp-btn rp-btn-advise" data-act="retry-eval" title="Re-run the AI evaluation before continuing (works with any engine or model selected above)">\u21BB Re-evaluate</button>' +
            '<button type="button" class="rp-btn rp-btn-primary" data-act="finish-eval">Continue &amp; Rest \u2192</button>' +
          '</div>' +
        '</div>';

      evalCardEl.hidden = false;
      if (composerEl) composerEl.hidden = true;
      syncChoiceScriptNextBtn(nextBtn);
      if (evalCardEl.scrollIntoView) {
        evalCardEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }

    function runPostSceneEvaluation(nextBtn) {
      if (session.evalResult) {
        renderEvalCard(session.evalResult, nextBtn);
        return;
      }
      if (session.busy) return;
      var profile = resolveSceneProfile(cfg, statsNow());
      if (!profile || session.turns.length === 0) {
        session.evalBypass = true;
        if (nextBtn) nextBtn.click();
        return;
      }

      session.busy = true;
      var mySeq = ++session.evalSeq;
      if (nextBtn) nextBtn.disabled = true;
      updateButtons();

      var chosenMode = resolveActiveMode();
      var waitMsg = "Reviewing encounter (" + (chosenMode === "perchance" ? "Perchance AI" : "OpenRouter") + ")...";
      setStatus(waitMsg);
      if (typingTextEl) typingTextEl.textContent = waitMsg;

      var userTurnsCount = session.turns.filter(function (t) { return t.role === "user"; }).length;
      var evalParseOpts = { userTurns: userTurnsCount, profile: profile };
      var evalSys = buildEvaluationSystemPrompt(cfg, statsNow(), profile);
      dispatchRpGenerate(
        chosenMode,
        evalSys,
        function (m, mid) { return buildEvaluationUserPrompt(evalSys, m, mid); },
        3200,
        "Grading"
      ).then(function (res) {
        if (mySeq !== session.evalSeq) return;
        var parsed = (res && res.status === "SUCCESS" && res.text) ? parseEvaluationResult(res.text, evalParseOpts) : null;
        if (!parsed && settings.mode === "auto" && res && res.mode === "perchance") {
          if (typingTextEl) typingTextEl.textContent = "Retrying grade via OpenRouter...";
          setStatus("Perchance grading unparseable — retrying via OpenRouter...");
          return dispatchRpGenerate(
            "openrouter",
            evalSys,
            function (m, mid) { return buildEvaluationUserPrompt(evalSys, m, mid); },
            3200,
            "Grading"
          ).then(function (res2) {
            if (mySeq !== session.evalSeq) return;
            var parsed2 = (res2 && res2.status === "SUCCESS" && res2.text) ? parseEvaluationResult(res2.text, evalParseOpts) : null;
            finishEvalResponse(res2, parsed2);
          });
        }
        finishEvalResponse(res, parsed);
      }).catch(function (err) {
        if (mySeq !== session.evalSeq) return;
        session.busy = false;
        session.evalResult = {
          rating: 0,
          fallback: true,
          hits: "N/A",
          misses: "N/A",
          summary: "Network error during grading (" + (err && err.message ? err.message : String(err)) + "), so " + boonFor(cfg, 0).name + " keeps its base duration of " + boonFor(cfg, 0).label + "."
        };
        saveActiveSession(inputEl.value);
        updateButtons();
        renderEvalCard(session.evalResult, nextBtn);
      });

      function finishEvalResponse(res, parsed) {
        session.busy = false;
        if (parsed) {
          session.evalResult = parsed;
        } else {
          var errMsg = (res && (res.error || res.reason)) || "Could not parse AI grade";
          var rawSnippet = (res && res.text) ? (" Raw reply: \"" + String(res.text).replace(/\s+/g, " ").trim().slice(0, 140) + "\"") : "";
          session.evalResult = {
            rating: 0,
            fallback: true,
            hits: "N/A",
            misses: "N/A",
            summary: "Grading could not complete (" + errMsg + "), so " + boonFor(cfg, 0).name + " keeps its base duration of " + boonFor(cfg, 0).label + "." + rawSnippet
          };
        }
        saveActiveSession(inputEl.value);
        updateButtons();
        renderEvalCard(session.evalResult, nextBtn);
      }
    }

    session.triggerEval = runPostSceneEvaluation;

    // Restore turns, advised chips, draft, or pending evaluation card if the page was refreshed or returned to from Show Stats / Menu
    var restored = loadActiveSession(sceneId);
    if (restored && Array.isArray(restored.turns) && restored.turns.length > 0) {
      restored.turns.forEach(function (t) {
        var turnObj = createTurnBlock(t.role, t.text, box);
        if (turnObj) session.turns.push(turnObj);
      });
      setStatus("Session restored (" + Math.ceil(session.turns.length / 2) + " exchange(s)).");
    }
    if (restored && Array.isArray(restored.advisedStarters)) {
      session.advisedStarters = restored.advisedStarters;
    }
    if (restored && Array.isArray(restored.advisedBeats)) {
      session.advisedBeats = restored.advisedBeats;
    }
    if (restored && restored.draft) {
      inputEl.value = restored.draft;
    }
    if (restored && typeof restored.saveMemory === "boolean") {
      session.saveMemory = restored.saveMemory;
      if (saveMemCb) saveMemCb.checked = restored.saveMemory;
    }
    if (restored && restored.evalResult) {
      session.evalResult = restored.evalResult;
    }
    if (restored && typeof restored.sceneReady === "boolean") {
      session.sceneReady = restored.sceneReady;
    }
    if (restored && typeof restored.naturalComplete === "boolean") {
      session.naturalComplete = restored.naturalComplete;
    }
    renderChips();
    updateButtons();
    setTimeout(function () { syncChoiceScriptNextBtn(); }, 0);
    if (session.evalResult) {
      renderEvalCard(session.evalResult);
    }

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
      session.busy = true;
      session.adviseSeq += 1;
      session.advisedStarters = null;
      session.advisedBeats = null;
      renderChips();
      updateButtons();

      if (!isReroll && playerText) {
        var userTurn = createTurnBlock("user", playerText, box);
        if (userTurn) session.turns.push(userTurn);
        saveActiveSession(inputEl.value);
      }

      var chosenMode = resolveActiveMode();
      var waitMsg = chosenMode === "perchance" ? "Generating via Perchance AI..." : "Generating via OpenRouter...";
      setStatus(waitMsg);
      if (typingTextEl) typingTextEl.textContent = waitMsg;

      var threadId = resolveThreadId(cfg, statsNow());

      fetchMemories(threadId, playerText || "Continue the scene").then(function (memBlock) {
        var sysPrompt = buildSystemPrompt(cfg, statsNow(), memBlock);
        return dispatchRpGenerate(
          chosenMode,
          sysPrompt,
          function (m, mid) {
            return buildUserPrompt(playerText || "Continue the scene naturally from where it left off.", sysPrompt, m, mid);
          },
          600,
          "Generating"
        );
      }).then(function (res) {
        session.busy = false;
        if (res && res.status === "SUCCESS" && res.text && res.text !== "...") {
          var readyInfo = parseSceneReadyResponse(res.text);
          var aiTextClean = readyInfo.text || res.text;
          var aiTurn = createTurnBlock("ai", aiTextClean, box);
          if (aiTurn) session.turns.push(aiTurn);
          if (readyInfo.actComplete) {
            session.sceneReady = true;
            session.naturalComplete = true;
          }
          saveActiveSession(inputEl.value);
          var engineTag = res.mode === "perchance" ? "Perchance AI" : settings.model.split("/").pop();
          if (readyInfo.actComplete) {
            setStatus("Climax reached (" + engineTag + ") — click \"Rest together\u2026\" below when ready to review & finish.");
          } else {
            setStatus("Turn complete (" + engineTag + ").");
          }
          if (aiTurn && aiTurn.wrap && aiTurn.wrap.scrollIntoView) {
            aiTurn.wrap.scrollIntoView({ behavior: "smooth", block: "nearest" });
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

    function runAdviseChoices() {
      if (session.busy) return;
      session.busy = true;
      var mySeq = ++session.adviseSeq;
      var targetIsStarter = session.turns.length === 0;
      updateButtons();

      var chosenMode = resolveActiveMode();
      var waitMsg = chosenMode === "perchance" ? "Advising choices via Perchance AI..." : "Advising choices via OpenRouter...";
      setStatus(waitMsg);
      if (typingTextEl) typingTextEl.textContent = waitMsg;

      var threadId = resolveThreadId(cfg, statsNow());
      var recentHint = session.turns.slice(-2).map(function (t) { return t.text; }).join(" ").slice(0, 300);

      fetchMemories(threadId, recentHint || "Advise choices for this scene").then(function (memBlock) {
        if (mySeq !== session.adviseSeq) return null;
        var sysPrompt = buildAdvisorSystemPrompt(cfg, statsNow(), memBlock);
        return dispatchRpGenerate(
          chosenMode,
          sysPrompt,
          function (m, mid) {
            return buildAdvisorUserPrompt(sysPrompt, m, mid);
          },
          1400,
          "Advising choices"
        );
      }).then(function (res) {
        if (mySeq !== session.adviseSeq) return;
        session.busy = false;
        if (res && res.status === "SUCCESS" && res.text && res.text !== "...") {
          var choices = parseAdvisedChoices(res.text);
          if (choices.length > 0) {
            if (targetIsStarter) session.advisedStarters = choices;
            else session.advisedBeats = choices;
            renderChips();
            saveActiveSession(inputEl.value);
            var engineLabel = res.mode === "perchance" ? "Perchance AI" : settings.model.split("/").pop();
            setStatus("Advised " + choices.length + " choices (" + engineLabel + "). Click one or press \u21A9 Default.");
          } else {
            setStatus("Could not parse advised choices — keeping static fallback.");
          }
        } else {
          var errMsg = (res && (res.error || res.reason)) || "Advice failed";
          setStatus("Advise error: " + errMsg + " (keeping static fallback).");
        }
        updateButtons();
      }).catch(function (err) {
        if (mySeq !== session.adviseSeq) return;
        session.busy = false;
        setStatus("Network error: " + (err && err.message ? err.message : String(err)) + " (keeping static fallback).");
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
      var actBtn = target.closest ? target.closest("[data-act]") : null;
      if (actBtn) {
        var act = actBtn.getAttribute("data-act");
        if (act === "reset-chips") {
          if (session.busy) return;
          session.adviseSeq += 1;
          session.advisedStarters = null;
          session.advisedBeats = null;
          renderChips();
          saveActiveSession(inputEl.value);
          updateButtons();
          setStatus("Static fallback choices restored.");
          return;
        }
        if (act === "advise") {
          if (session.evalResult) return;
          runAdviseChoices();
          return;
        }
        if (act === "resume-rp") {
          if (session.busy) return;
          session.evalSeq += 1;
          session.evalResult = null;
          session.evalBypass = false;
          session.sceneReady = !!session.naturalComplete;
          if (evalCardEl) {
            evalCardEl.hidden = true;
            evalCardEl.innerHTML = "";
          }
          if (composerEl) composerEl.hidden = false;
          saveActiveSession(inputEl.value);
          updateButtons();
          setStatus(session.sceneReady
            ? "Roleplay resumed. Click \"Rest together\u2026\" below whenever you wish to finish."
            : "Roleplay resumed. Type \"/end\" anytime to wrap up early.");
          if (inputEl && inputEl.focus) inputEl.focus();
          return;
        }
        if (act === "retry-eval") {
          if (session.busy) return;
          session.evalResult = null;
          if (evalCardEl) evalCardEl.hidden = true;
          runPostSceneEvaluation(document.querySelector("#main button.next"));
          return;
        }
        if (act === "finish-eval") {
          var ratingVal = (session.evalResult && !session.evalResult.fallback) ? (Number(session.evalResult.rating) || 0) : 0;
          statsNow().rp_encounter_rating = ratingVal;
          session.evalBypass = true;
          var nextBtn = document.querySelector("#main button.next");
          if (nextBtn) {
            nextBtn.style.display = "";
            nextBtn.disabled = false;
            nextBtn.click();
          }
          return;
        }
      }

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

      if (!actBtn) return;
      var actName = actBtn.getAttribute("data-act");

      if (actName === "send") {
        var val = inputEl.value.trim();
        inputEl.value = "";
        if (/^\/end(?:\s|$)/i.test(val)) {
          if (session.busy || session.evalResult) return;
          session.sceneReady = true;
          saveActiveSession("");
          updateButtons();
          var endNextBtn = document.querySelector("#main button.next");
          if (session.turns.length > 0 && resolveSceneProfile(cfg, statsNow())) {
            runPostSceneEvaluation(endNextBtn);
          } else {
            setStatus("Ended early — click \"Rest together\u2026\" below to continue.");
          }
          return;
        }
        runGeneration(val || "Continue the moment naturally, letting the companion take the lead.", false);
      } else if (actName === "memories") {
        memDrawer.hidden = !memDrawer.hidden;
        if (!memDrawer.hidden) renderMemoriesDrawer();
      } else if (actName === "close-memories") {
        memDrawer.hidden = true;
      } else if (actName === "save-mem") {
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
      } else if (actName === "del-mem") {
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
      }
    });

    // Per-turn hover actions: edit, regenerate from here, or delete ANY individual message
    session.handleTurnAction = function (btn) {
      var wrap = btn.closest(".rp-turn");
      if (!wrap || !wrap._rpTurn) return;
      var turn = wrap._rpTurn;
      var tact = btn.getAttribute("data-tact");

      if (tact === "del") {
        if (session.busy || session.evalResult) return;
        var idx = session.turns.indexOf(turn);
        if (idx !== -1) session.turns.splice(idx, 1);
        if (wrap.parentNode) wrap.parentNode.removeChild(wrap);
        saveActiveSession(inputEl.value);
        updateButtons();
        setStatus("Message deleted.");
      } else if (tact === "regen") {
        if (session.busy || session.evalResult) return;
        var ridx = session.turns.indexOf(turn);
        if (ridx === -1) return;
        var cutFrom = turn.role === "user" ? ridx + 1 : ridx;
        for (var k = session.turns.length - 1; k >= cutFrom; k--) {
          var rem = session.turns.pop();
          if (rem && rem.wrap && rem.wrap.parentNode) rem.wrap.parentNode.removeChild(rem.wrap);
        }
        session.sceneReady = false;
        session.naturalComplete = false;
        saveActiveSession(inputEl.value);
        var promptTurn = session.turns.length ? session.turns[session.turns.length - 1] : null;
        var promptText = (promptTurn && promptTurn.role === "user") ? promptTurn.text : "Continue the moment naturally.";
        runGeneration(promptText, true);
      } else if (tact === "edit") {
        if (session.busy || session.evalResult) return;
        if (wrap.querySelector(".rp-inline-editor")) return;
        turn.content.style.display = "none";
        turn.actions.style.display = "none";

        var editor = document.createElement("div");
        editor.className = "rp-inline-editor";
        editor.innerHTML =
          '<div class="rp-inline-editor-head">Edit ' + (turn.role === "user" ? "Your Message" : "Companion Response") + '</div>' +
          '<textarea class="rp-edit-textarea"></textarea>' +
          '<div class="rp-inline-editor-foot">' +
            '<button type="button" class="rp-btn rp-btn-sm" data-iedit="cancel">\u2715</button>' +
            '<button type="button" class="rp-btn rp-btn-primary rp-btn-sm" data-iedit="save">Save</button>' +
          '</div>';
        var ta = editor.querySelector(".rp-edit-textarea");
        ta.value = turn.text;
        wrap.appendChild(editor);
        ta.focus();

        editor.addEventListener("click", function (eev) {
          var eb = eev.target && eev.target.closest ? eev.target.closest("[data-iedit]") : null;
          if (!eb) return;
          var what = eb.getAttribute("data-iedit");
          if (what === "cancel") {
            editor.remove();
            turn.content.style.display = "";
            turn.actions.style.display = "";
          } else if (what === "save") {
            var updated = ta.value.trim();
            if (!updated) return;
            turn.text = updated;
            turn.content.innerHTML = "";
            turn.pEls = renderTurnParagraphs(turn.content, updated, turn.role === "user" ? "rp-player-turn" : "rp-ai-turn");
            editor.remove();
            turn.content.style.display = "";
            turn.actions.style.display = "";
            saveActiveSession(inputEl.value);
            setStatus("Message updated.");
          }
        });
      }
    };

    if (!textEl._rpTurnActionsWired) {
      textEl._rpTurnActionsWired = true;
      textEl.addEventListener("click", function (ev) {
        var t = ev.target;
        var btn = t && t.closest ? t.closest("[data-tact]") : null;
        if (btn && typeof session.handleTurnAction === "function") {
          session.handleTurnAction(btn);
        }
      });
    }

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
    var inRpUi = inField && (box.contains(t) || !!(t.closest && t.closest(".rp-turn")));
    if (inRpUi) {
      // Handle Enter (without Shift) inside the main RP input textarea to send the turn
      if (tag === "TEXTAREA" && t.classList && t.classList.contains("rp-input") && ev.key === "Enter" && !ev.shiftKey) {
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

  // Intercept ChoiceScript's "Rest together..." (*page_break) button in capture phase when a
  // rolled/static-profile RP console is live in the DOM and has active turns (never block Menu/Restart screens).
  document.addEventListener("click", function (ev) {
    if (!session.active || !session.boxEl || typeof session.triggerEval !== "function") return;
    if (session.evalBypass) return;
    var liveBox = document.getElementById("rpConsoleBox");
    if (!liveBox || liveBox !== session.boxEl) return;
    var nextBtn = ev.target && ev.target.closest ? ev.target.closest("#main button.next") : null;
    if (!nextBtn) return;
    if (!resolveSceneProfile(session.cfg, statsNow()) || session.turns.length === 0) return;
    ev.preventDefault();
    ev.stopPropagation();
    ev.stopImmediatePropagation();
    session.triggerEval(nextBtn);
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
        resetMemorySessionState();
        clearActiveSession();
      }
    }
    if (session.active && document.getElementById("rpConsoleBox") && typeof session.syncNextBtn === "function") {
      session.syncNextBtn();
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
