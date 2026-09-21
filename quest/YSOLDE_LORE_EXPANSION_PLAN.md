# Plan: Ysolde Marrow — Lore & History Expansion (PROSE REVIEW DRAFT)

> **Status:** IMPLEMENTED — Drafts A, B, C1, C2 are in the game files; plan kept as record.
> **Goal:** Give Ysolde growth and weight without explaining her away. Unlike Odessa (thin) and Varren (zero backstory), she has the most screen time — problem is static lorebook + told-not-shown prejudice + continuity slips.
> **Canon rule (`web/mygame/lorebook-data.js:34-38`):** lorebook may only say what scenes say. Anything new is written as *hearth-talk / what she told you*, and must be added to a scene too if meant true.
> **Voice (`.agents/rules/narrative_guidelines.md`):** second-person subjective POV, no omniscient leaks, no verdict adjectives, physical tells only. Ysolde speaks low and clinical; regard comes as eased fraction, nod, errand of trust — never warmth speeches.

---

## 1. What is canon today (do not contradict)

- **Lorebook now:** `lorebook-data.js:149-161` static 2-para array, `see: ["iron_carrion"]`. Strongest base of the three (buried-count line, infernal-bloodline description) but zero growth. Model is Odessa/Varren expansions (`function(s)` with gated paras) and Vane (`:91-106`).
- **Intro:** `dawn_trial.txt:683-685` — older woman, even unbroken stride, dark hair streaked iron-grey pulled severe, two small polished obsidian ram horns tight to temples, pale mercury-silver eyes, satchel of scrolls + glass vials (more physician than soldier). Names herself: `Ysolde Marrow... Word doesn't have to travel loud for me to hear it.`
- **Cadre pitch:** `:694` — smallest detachment among 400 (six, seven: austere elven scroll-scribe + horned tiefling novice at embers). `Most of this camp would rather it stayed that way. They fear what they don't understand.` Class-flavored takes (bard/686-688, wizard/689-690, warlock/691-692), then `Show me` test at `:704` with Guidance / restraint / explain-first paths (+8/+2).
- **Refrain (do not dilute):** `You're worth more alive than heroic` (`battle_black_sinks.txt:52`), `we're few enough that we can't afford to lose even one of you` (`dawn_trial.txt:764,782`), `Never forget the cost of what you wield` (`battle_black_sinks.txt:1483` — channeling burns nerves/marrow, fingers seize, heart gives out; Carrion rations power from necessity, not mercy).
- **Battle:** `battle_black_sinks.txt:41` Cadre held at reserve with Ysolde (too few, worth too much); `:52` cadre-gated warning; `:216-220` suppression — raises one hand, murmurs in no known cadence, air bends, bowman folded off wall without raised voice.
- **Bivouac hub:** `:1418-1503` — lantern-lit wagon set apart from the soldiers. Reagent sort (INT, sulfur/marsh-salts, +6/+2), arcane-strain inquiry (+6/+2, success = cost speech, failure = `mysteries are not camp gossip`), beeswax-candle chit (+4, `Disciplined and reliable`). Cadre wrap: warding signals with Kestrel + blade-grease chit to Vanguard (`:1500`, sets `errand_vanguard_unlocked`, `errand_kestrel_unlocked`).
- **Alderford boom puzzle:** `alderford.txt:87,1082-1328` — black marquee by willows (willow-bark reek, charts + brass dividers), imperial boom brief (`soundings stop making sense`, four barges too deep, southern winch, half century of guesswork), vellum hand-off (+4, +2 silver), weir-vault resolutions (Mending / thermal shock / Mage Hand), Vane-courier option.
- **Port Valen:** `:56` barge tent (`wrong about a river than a battlefield`), `:74` sounding work pays off, `:384-390` compound audit (manifests vs tolls vs Watch accounts that disagree, brass stylus, `make them agree before the week is out`), `:458` lamp in contract office auditing toll ledgers.
- **Systems:** `startup.txt:483,797,802` + `ysolde_respect` create — `met_ysolde`, `ysolde_respect 0`, `visited_bivouac_ysolde`, `errand_ysolde_unlocked`, `squad="cadre"`. No `codex_ysolde`. Meter in lorebook + camp recap.

**Gaps:** no origin for horns, no years with Vane, no reason Vane trusts her with scarcest asset, buried-count never spoken, prejudice only told never shown, Marrow surname unexplained (only handler with one), no accounting of why the Cadre is so small or so costly.
---

## 2. Fixes folded into these drafts (prose-level continuity)

1. **Spectacles slip** — alderford.txt:1083 gives her silver-framed spectacles + aristocratic features; no other scene has them. Draft A keeps spectacles Alderford-gated (chart-table work only), never in field/bivouac description. Do not propagate spectacles into bivouac or battle prose.
2. **Physician satchel vs apothecary kit** — lorebook says like an apothecary's kit, intake says more physician than soldier. Both survive: satchel holds scrolls + vials (physician's carriage, apothecary's contents). Draft A uses physician's leather satchel of scrolls and glass vials once, no second metaphor.
3. **Marrow surname** — only handler with a surname; never explained. Draft C offers one hearth rumor (ledger-name, not bloodline), kept as rumor. Never confirm in lorebook base.
4. **Horns origin** — never state pact, birth, or bargain as fact. Lorebook keeps marks of infernal bloodline (existing wording = observable trait, not history). Any deeper origin stays ungated rumor at most, preferably untouched.
5. **Why Vane trusts her** — never invent a founding scene. Draft A implies through function (scarcest asset, rations from necessity, boom stake, ledger audit), one hearth line implies Vane's arithmetic. No flashback.

---

## 3. DRAFT A — Lorebook replacement (web/mygame/lorebook-data.js id ysolde, lines 149-161)

Keep id, category, title, link, sub, role, tags, aliases, unlock, meter. Change body to function + expand see.

```js
{
  id: "ysolde", category: "people", title: "Ysolde Marrow",
  link: ["Ysolde Marrow", "Ysolde"],
  sub: "Cadre Handler",
  role: "Iron Carrion — Cadre Handler",
  tags: ["Iron Carrion"], aliases: ["Ysolde", "Marrow", "Cadre", "handler"],
  unlock: "met_ysolde",
  meter: { stat: "ysolde_respect", label: "Ysolde's Regard" },
  body: function (s) {
    var out = [
      "The Cadre's handler. She kept the company's small handful of gifted recruits the way other sergeants kept count of rations: exactly, constantly, and with no intention of running short. Six or seven at any time against four hundred soldiers who mostly wished the number were smaller.",
      "<i>An older woman carrying subtle marks of infernal bloodline — small, polished obsidian ram horns sweeping close against dark hair streaked with iron-grey, and pale mercury-silver irises that miss nothing while appearing to look at nothing in particular. A physician's leather satchel of scrolls and glass vials slung across one shoulder, hands steady enough to thread a needle by firelight without looking down.</i>"
    ];
    if (s.squad === "cadre") {
      out.push("Those who marched under her hand knew the terms: worth more alive than heroic, and told so plainly. She rationed the Cadre's workings from necessity, not mercy — raw current through nerves and marrow, fingers that seize, hearts that give out in the mud. Her praise was a dry nod or an errand of trust; her discipline was a hand keeping you out of the arrow-hail until the line truly broke.");
    }
    if (truthy(s.alder_river_chain_cleared)) {
      out.push("At Alderford she spread the sounding charts flat and showed you the blank stretch below the weir: an imperial boom, four barges too deep, half a century of guesswork and a flooded chamber. She staked the flotilla on sounding logs and an operative in the dark until the gorge was clear. Her silver spectacles only ever came out over chart tables.");
    }
    if (truthy(s.visited_bivouac_ysolde)) {
      out.push("By the bivouac lantern she sorted sulfur and marsh-salts by hand and signed supply chits with a swift flourish. Disciplined and reliable earned her ink. Clumsy thumbs earned the back of her hand and an order to leave the crate alone.");
    }
    return out;
  },
  see: ["iron_carrion", "vane", "carrion_founding", "kestrel", "odessa", "port_valen"]
},
```

---

## 4. DRAFT B — Bivouac follow-up (battle_black_sinks.txt after :1483 success, before :1486 goto)

Intent: one quiet question after arcane-strain success, no new DC, no extra respect (already +6 at :1475). Two Cadre questions — one doctrine (why so few, why reserved, what they cost the company), one daily life (what the Cadre actually is to live in). Ends in an order. Failure path untouched (camp-gossip rebuke defines her).

Buried count is no longer spoken here — it stays a lorebook line only (`lorebook-data.js:157`), so it reads as her private accounting rather than a confession.

Gate verified: `alder_river_chain_cleared` is set on ALL three Alderford resolutions (magic :1293, Vane-courier :1306, mundane :1319) — safe lorebook gate.

```choicescript
      Ysolde sets down a vial of amber oil, studying you with solemn composure. "A soldier expends muscle and blood," she says quietly. "When a practitioner weaves a working under arrow fire, they channel raw current through their own nerves and marrow. Hold it too long, and your fingers seize; push it too far, and your heart gives out in the mud. That is why the Carrion rations the Cadre's power—not out of mercy, but out of necessity." She nods slowly. "Never forget the cost of what you wield."

      *choice
        # "Why is the Cadre the smallest?"
          Her quill comes to rest on the ledger and stays there.

          "Because we are the slowest thing in this company to make," she says. "A sergeant can turn a dockhand into a spearman in a season. Point him at the enemy and let fear do the rest. A working takes years, teaching a mind to hold steady while a pike comes at the face. You can drill a body. A mind holds or it doesn't, and you learn which under fire."

          She turns the vial so its label faces the light. "Most of this camp thinks the Cadre stands back because we are precious. We stand back because a working that can turn a fight is the first thing an enemy spends arrows on. By proportion, no trade in this company dies faster than ours. So Vane keeps us in reserve until the shields start to give."

          "Six of us. Seven, if the next one I test is worth taking." Her eyes come back to you. "Keep your head clear, and I keep my count."
          *goto bivouac_cadre_wrapup
        # "Does the rest of the company always keep its distance from the Cadre?"
          "Quiet rations, a wagon set apart from the rest, and every eye in camp sliding past you at muster," she says. "The soldiers think we whisper to devils. What we do is measure sulfur to the grain and write down which workings the company can afford to spend." She caps the vial with a soft click. "It is lonely work. It keeps you alive longer than heroic work."
          *goto bivouac_cadre_wrapup
```

Mechanics: zero respect here (already +6 at :1475). Time already paid (:1506 +35 min). No page_break inside; outer wrapup handles it.

REVIEWER RESOLUTIONS:
- [x] Option 1 replaced per review. `"How many have you buried, Handler?"` cut — it echoed Varren's `bury the first files I drilled` (`camp_night.txt:371`) and nobody calls her Handler in canon. Buried count stays lorebook-only (`lorebook-data.js:157`).
- [x] Option 1 is now `"Why is the Cadre the smallest?"` — doctrine answer: slowest trade to make, targeted first, heaviest losses by proportion, held at reserve until the line breaks. Reuses only canon: smallest of four hundred / six or seven (`dawn_trial.txt:694`), reserve line (`battle_black_sinks.txt:41,216`), alive-not-heroic (`:52`), rations from necessity (`:1483`).
- [x] Second option prompt reworked: `"Does the rest of the company always keep its distance from the Cadre?"` — reads organically for both Cadre squad members and visiting Vanguard/Scout errand runners without feeling like an outsider asking what the player's own unit is like.
- [x] R1 — KEPT canon: `By proportion, no trade in this company dies faster than ours.` Firmly anchors her clinical protective doctrine.
- [x] R2 — Overlap check: Option 1 is training and casualty structure; Option 2 is daily life and camp isolation. Both sit cleanly around the :1483 speech.
- [x] R3 — Lorebook doctrine flag: Kept scene-only to prevent bloating Draft A.
- [x] R4 — Option 1 length trimmed: Cut "and the man beside him is screaming" to sharpen cadence.
- [x] Both options kept: Gives player agency between tactical doctrine and daily social reality.
- [x] `stylus` precedent check and fix applied.
- [x] `line soldier` / `common soldier` sweep applied.
- [x] `line` battle-line sweep applied.
- [x] Second `line` sweep applied.
- [x] `reserve line` repetition avoided.

---

## 5. DRAFT C — Shown prejudice + Marrow rumor (bivouac wagon + hearth, two small inserts)

**C1 — Shown beat (bivouac_cadre arrival, battle_black_sinks.txt near :1418-1426):** currently the fear is only narrated. One observed moment when arriving at the Cadre's wagon, no new choice:

```choicescript
  A soldier hauling a bandage crate gives the Cadre's wagon a wide berth, thumb pressed to his brow against ill luck. He does not look at Ysolde. She watches him pass without comment and turns back to her satchel.
```

Placement & Code Flow Fix:
In `battle_black_sinks.txt:1419-1426`, fix the existing ChoiceScript flow bug where `*if (not(met_ysolde))` sets `met_ysolde true` and then the subsequent `*if (met_ysolde)` also fires immediately. Change `*if (met_ysolde)` to `*else`.
Place C1 directly after the arrival branch so **all** players (Cadre, Vanguard, Scout) see the soldier avoiding the wagon on their visit. (Cadre players already have `met_ysolde = true` from `dawn_trial.txt`, so gating C1 behind `not(met_ysolde)` would have hidden it from the Cadre player who lives it).

**C2 — Marrow rumor (hearth lore success, battle_black_sinks.txt near :1895):** one line inside existing WIS success, ledger-name not bloodline:

```choicescript
  A scribe's apprentice by the fire turns a muster roll toward the light. "Marrow," he says, squinting at the handler's signature. "Signed neat as a ledger clerk. The old hands say Vane hired her for her count before her craft — she keeps the Cadre's rations, vials, and names to the grain."
```

Why: explains the surname as function (counting marrow-deep costs / signing muster rolls), keeps horns origin untouched, implies Vane's arithmetic without flashback. Trimmed "and tells him which workings the company can afford" to avoid unrealistic insider overreach from a campfire apprentice.

---

## 6. Guardrails — what NOT to do

- No horns origin (no pact, birth, bargain, price). Observable trait only.
- No Marrow confirmation. Rumor in hearth-talk at most; lorebook base never explains it.
- No founding scene with Vane. Trust implied through rations / wagon / boom stake / audit, never flashback.
- No spectacles outside Alderford chart table. Do not touch bivouac/battle descriptions.
- No extra respect economy. Follow-up zero; bivouac hub already +6/+2/+4; Alderford already +4/+2.
- No warmth verbs: no smiles warmly, eyes soften, voice trembles. Eases fractionally, nods slowly, caps vial, thumb rests — action only.

---

## 7. Implementation checklist (after prose approved)

- [x] web/mygame/lorebook-data.js — replace ysolde entry with Draft A (function body + see array). Gate bivouac para on `visited_bivouac_ysolde`.
- [x] web/mygame/scenes/battle_black_sinks.txt — insert Draft B follow-up (zero respect, existing goto) + C1 shown beat (with `*if (not(met_ysolde))` / `*else` fix).
- [x] web/mygame/scenes/battle_black_sinks.txt hearth — insert C2 Marrow line inside lore success.
- [x] Run quicktest + lint_anachronisms + lint_prose_tics, grep ysolde, verify see ids + alder_river_chain_cleared gate.
- [x] Vane / iron_carrion entries: no change.

---

## 8. Resolved Open Questions & Review Checklist

1. **Spectacles line:** KEPT in Alderford paragraph. Explains why spectacles appear over charts in `alderford.txt` without allowing them to leak into muddy bivouac or combat scenes.
2. **Third-person past tense:** CONFIRMED throughout Draft A ("Those who marched under her hand"). Aligns with Varren and Odessa.
3. **Bivouac follow-up options:** KEPT BOTH (Option 1 = doctrine/reserve casualty math; Option 2 = daily isolation/prejudice).
4. **Authority-to-say-no:** CUT. Avoids ungrounded Vane-contract stretch.
5. **Marrow rumor wording:** RESOLVED with trimmed apprentice dialogue ending at "names to the grain".
6. **Cadre squad paragraph:** Scrubbed of premature references to Port Valen ledgers or unassigned Black Sinks bivouac errands to preserve strict subjective POV.
7. **Alderford resolution alignment:** Neutralized wording ("until the gorge was clear") so it remains accurate whether the player cleared the weir mechanism personally or delivered the soundings directly to Captain Vane.

### Final Verification Checks:
- [x] Each gated para ~50–65 words.
- [x] Spectacles line placed only inside Alderford para.
- [x] Cadre para in third-person past tense with zero forward continuity leaks.
- [x] Bivouac para gated on `visited_bivouac_ysolde` (accessible by all squads).
- [x] Alderford para gated on `alder_river_chain_cleared` (verified on magic, prybar, picks, and Vane courier paths).
- [x] All 6 IDs in `see` array verified in live `lorebook-data.js` (`iron_carrion`, `vane`, `carrion_founding`, `kestrel`, `odessa`, `port_valen`).

