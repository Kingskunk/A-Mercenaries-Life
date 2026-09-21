# Plan: Sergeant Varren — Lore & History Expansion (PROSE REVIEW DRAFT)

> **Status:** IMPLEMENTED — Draft D cut per review (Vane's Watch line stays Vane's; Varren keeps :52 deck-rail grunt). A/B/C implemented as drafted.
> **Goal:** Give Varren history and weight without softening him. Opposite problem to Odessa: huge presence, zero backstory.
> **Canon rule (`web/mygame/lorebook-data.js:34-38`):** lorebook may only say what scenes say. Anything new is written as *hearth-talk / what he told you*, and must be added to a scene too if meant true.
> **Voice (`.agents/rules/narrative_guidelines.md`):** second-person subjective POV, no omniscient leaks, no verdict adjectives, physical tells only. Varren shows regard through action (grunt, nod, order), never speeches.

---

## 1. What is canon today (do not contradict)

- **Lorebook now:** `lorebook-data.js:108-121` static 2-para array, `see: ["iron_carrion"]`. No growth. Model is Odessa expansion (`function(s)` with gated paras) and Vane (`:91-106`).
- **First intro:** `company_intake.txt:379-381` — `stalks into the torchlight like an ill-tempered bear. A massive brute with half his face crisscrossed by old siege-scars, he kicks the iron-banded armor barrels onto their sides.` Roar: `Padded doublets and iron in the mud! ... nobody carries dead weight!` Sets `met_varren true` at `:370`.
- **Look (repeated):** massive slab gone thick/hard with age, close-cropped grey stubble, nose broken twice and never set straight, one milk-pale eye that does not track right, scarred jaw, blackened chainmail, spits into mud/grass, flint/gravel voice.
- **Camp hub:** `camp_night.txt:272-426 visit_varren` — under Carrion banner, `one good eye on the black horizon`. Greeting: `Speak, recruit, before I find a shovel and put you to work on the latrines.` Three paths (tactics INT / drill CON / truth CHA) + class/origin shortcuts, all set `prep_varren_drill true` = advantage next morning (`dawn_trial.txt:552-554`).
- **Doctrine (same 5 lines on loop):** keep files tight, feet dry, do not get flanked in the reeds, grease that iron, `Lying's a worse habit than being scared` (`camp_night.txt:335,416`).
- **Human beat (only one):** `camp_night.txt:335` — on `Something to Fight For` / truth success: `scarred jaw works, something like recognition passing behind his one good eye. Most men lie to me about that.` Do not duplicate or explain this elsewhere.
- **Dawn trial:** `dawn_trial.txt:539-610 squad_vanguard` — `You're mine` (no greeting, not a threat), shield-post test, `That's shield-wall work. Fall in.` Class-flavored takes (fighter textbook / barbarian ugly).
- **Battle:** `battle_black_sinks.txt:41,44` — runs Vanguard line himself, `Choke point works both ways, recruit. Whoever holds the ground with their feet dry has the advantage.`
- **Alderford:** `:20-22` march herald (`Fourteen miles... Gilded Scales don't pay for stragglers`), `:51-53` kit inspector, `:623-625` writes Elspeth onto second file roll if `baggage_train` (`fourth grain barge, company kettle`), `:1258` grievances at third watch, `:1279` Vane rebuke for bypassing Varren, `:3806,3814` flotilla muster.
- **Port Valen (best late lines):** `:52` — `River's not much different from a shield wall. Hold your footing, watch the man beside you.` `:4841` — `Two hundred of us marched out of Valen... When the Watch asks who answers for the mess, the name they get is mine.`
- **Systems:** `startup.txt:229,474,771,783` — `varren_respect 0`, `met_varren`, `visited_varren`, `prep_varren_drill`. No `codex_varren`. Meter in recap `camp_night.txt:1112`.
- **Hearth hook:** `battle_black_sinks.txt:1883-1897` lore choice grants `Varren Respect +2` but never mentions Varren. Opportunity, not contradiction.

**Gaps:** no years of service, no origin, no named war for the scars, no Vane-founding link, no Redfort witness, no grievance-queue payoff.

---

## 2. Design — reuse flags, no new flags

Reuse only (no migration): `met_varren` (unlock), `varren_respect` (meter + warm gating), `visited_varren`, `prep_varren_drill` (doctrine para + dawn advantage proof), `squad = "vanguard"` (line-member branch), `elspeth_role = "baggage_train"` (mentor branch), `spared_gate_squatter` / `origin` untouched.

No new flags. Gate warm lorebook paras on `prep_varren_drill` (earned in camp) and `varren_respect >= 6` equivalent via truthy checks the lorebook already supports — or simply on `prep_varren_drill` + `elspeth_role`. **Reviewer: confirm no new var wanted.**
---

## 3. DRAFT A — Lorebook replacement (web/mygame/lorebook-data.js id varren, lines 108-133)

Keep id, category, title, link, sub, role, tags, aliases, unlock, meter. Change body to function + expand see.

```js
{
  id: "varren", category: "people", title: "Sergeant Varren",
  link: ["Sergeant Varren", "Varren"],
  sub: "Vanguard Drillmaster & Frontline Veteran",
  role: "Iron Carrion — Vanguard Drillmaster & Frontline Veteran",
  tags: ["Iron Carrion"], aliases: ["Varren", "drillmaster"],
  unlock: "met_varren",
  meter: { stat: "varren_respect", label: "Sergeant Varren's Regard" },
  body: function (s) {
    var out = [
      "Vanguard drillmaster and frontline sergeant. He turned green recruits into soldiers who did not break the shield-wall, working from the munitions barrels at intake, the banner watch at night, and the practice post at dawn.",
      "<i>\"A massive slab of a man, gone thick and hard with age rather than soft, half his face a crosshatch of old siege-scars that pull his mouth into a permanent, humorless line. Close-cropped grey stubble, a nose broken at least twice and never set straight, and one milk-pale eye that does not track quite right in bad light. Blackened chainmail, spit in the mud, and a voice like flint.\"</i>"
    ];
    if (truthy(s.prep_varren_drill)) {
      out.push("His doctrine, drilled into every file: keep your files tight, keep your feet dry, do not get flanked in the reeds, and keep grease on your iron. He ran the Vanguard line himself before a fight, checking straps and grips.");
    }
    if (s.squad === "vanguard") {
      out.push("Those who stood in his file knew the terms: front line, shield to shield, first to bleed and first to get paid for it. His praise ran to a single grunt or a nod, and remember that stance tomorrow was as warm as it ever got.");
    }
    if (s.elspeth_role === "baggage_train") {
      out.push("At Alderford he wrote your sister onto the second file's camp roll himself, weighing her mending and harness work as worth two drunken teamsters. She rode the fourth grain barge and ate from the company kettle, treated as crew under his eye, not cargo.");
    }
    return out;
  },
  see: ["iron_carrion", "vane", "carrion_founding", "lyra", "odessa", "port_valen"]
},
```

REVIEWER RESOLUTIONS:
- [x] Each gated para ~40–60 words, trimmed and balanced.
- [x] Cut Alderford Vane rebuke and grievance third-watch reference from doctrine para to prevent premature forward-spoiler leak on Night 1 camp prep.
- [x] Changed Vanguard para to third-person past tense ("Those who stood in his file").
- [x] Corrected baggage-train paragraph to "At Alderford" (reunion location) instead of "On the march to Alderford".
- [x] `see` expansion verified: all 6 IDs exist in live `lorebook-data.js`.

---

## 4. DRAFT B — Camp follow-up (camp_night.txt after :370 success, before :385 page_break)

Intent: one extra beat after tactics success, no new DC, no extra respect (already +6 at :360). Scars get a source in his own mouth, 3-4 lines, ends in an order. Failure path untouched.

```choicescript
      "Not as dull-witted as you look," Varren grunts, tracing a line in the mud with his boot heel. "The causeway is a narrow choke with waist-deep bog on both flanks. The Gilded Scales hired us because their merchant wagons can't force the gatehouse. Keep your files tight, plant your feet, and don't get flanked in the reeds."

      *choice
        # "That eye, Sergeant — siege work?"
          Varren's good eye stays on the horizon a long moment before it flicks to you.

          "Two sieges before Vane found me," he says. "First one taught me to keep my head down. Second one taught me the man beside me matters more than the wall in front of me." He spits into the mud. "That is the whole of the drill, recruit. Hold your footing and watch the man beside you."
          *page_break Leave the Sergeant to his watch...
          *goto varren_done
        # "How long have you served under Vane?"
          "Long enough to bury the first files I drilled," he says, flat. "Long enough to know greenhorns die of loose feet and loud mouths before they ever die of steel." He jerks his chin at your boots. "Grease that iron and get to your bedroll. We march within the hour."
          *page_break Leave the Sergeant to his watch...
          *goto varren_done
```

Mechanics: zero respect here (already +6 at :360). Time already paid (:433 +25 min). Both branches include `*page_break Leave the Sergeant to his watch...` so dialogue pauses properly before advancing to `varren_done` and returning to `camp_hub`.

REVIEWER RESOLUTIONS:
- [x] "Two sieges before Vane" kept clean and grounded without names or dates.
- [x] Option 2 prompt finalized to `"How long have you served under Vane?"` and text to `"first files I drilled"` / `"before they ever die of steel"`.
- [x] Both options kept for player agency (wound history vs service history).
- [x] Added missing `*page_break` before `*goto varren_done` to prevent ChoiceScript flow bug where camp hub dumped onto the same page.

---

## 5. DRAFT C — Hearth witness line (battle_black_sinks.txt near :1895 lore success)

Insertion inside existing WIS success, after Vane-forging sentence, before baggage-train observation:

```choicescript
      A younger archer nurses her mug and jerks her chin toward the guardroom door. "Varren drilled my brother's file before Redfort," she says, quiet. "Brother came home. Half his file did not. Sergeant never speaks the names. He just drills the next file harder."
```

Full context: sits between the Empire/Vane paragraph and the When the talk turns to tomorrow's march line at :1897. Names Varren in the reward that already grants +2, without myth in his own mouth. Uses "never speaks the names" per review.

---

## 6. DRAFT D — Port Valen accountability beat (CUT per review)

Draft D cut per review — Vane's `port_valen.txt:4841` Watch line stays Vane's; Varren keeps `:52` deck-rail grunt. No `port_valen.txt` change needed.

---

## 7. Guardrails — what NOT to do

- No surname, no origin village, no named siege, no dates, no years-of-service number.
- No dead-family mirror. His one recognition beat (camp_night.txt:335) stays unexplained.
- No self-mythologizing. History from hearth-talk or lorebook-as-telling, never Varren speeches about himself.
- No extra respect economy. Follow-up zero; hearth already +2; doctrine gates on earned prep_varren_drill.
- No softening verbs: no smiles warmly, nods kindly, eyes soften. Grunt, nod once, jaw works, eye narrows.

---

## 8. Implementation checklist

- [x] web/mygame/lorebook-data.js — replace varren entry with Draft A (function body + see). Fixed timeline spoiler and reunion location.
- [x] web/mygame/scenes/camp_night.txt — insert Draft B follow-up with proper `*page_break` transitions.
- [x] battle_black_sinks.txt hearth — insert Draft C line inside lore success ("never speaks the names").
- [x] Draft D CUT per review — Vane's `port_valen.txt:4841` Watch line stays Vane's; Varren keeps `:52` deck-rail grunt.
- [x] Run quicktest + lint_anachronisms + lint_prose_tics, grep varren, verify see ids exist.
- [x] Vane / iron_carrion entries: no change.

---

## 9. Resolved Open Questions & Review Checklist

1. **Two sieges:** KEPT clean ("Two sieges before Vane found me") without named dates or places.
2. **Third-person past tense:** CONFIRMED throughout Draft A ("Those who stood in his file").
3. **Bivouac/Camp follow-up options:** KEPT BOTH with dedicated page breaks.
4. **"never speaks the names":** CONFIRMED and implemented in `battle_black_sinks.txt`.
5. **Draft D:** CUT per review to preserve Vane's ownership of company-level watch accountability.
6. **Timeline & Factual Integrity:** Cut Alderford grievance quote from Night 1 lorebook doctrine; fixed baggage-train reunion text to "At Alderford".
