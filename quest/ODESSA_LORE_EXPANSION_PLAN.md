# Plan: Surgeon Odessa — Lore & History Expansion (PROSE REVIEW DRAFT)

> **Status:** IMPLEMENTED — prose approved with reviewer edits applied. Game files updated; plan kept as record.
> **Goal:** Give Odessa the same depth as Vane / Varren / Kestrel / Ysolde without breaking canon.
> **Canon rule (`web/mygame/lorebook-data.js:34-38`):** lorebook may only say what scenes say. Anything new is written as *rumor / what she told you*, and must be added to a scene too if meant true.
> **Voice (`.agents/rules/narrative_guidelines.md`):** second-person subjective POV, no omniscient leaks, no verdict adjectives, physical tells only.

---

## 1. What is canon today (do not contradict)

- **Backstory dump (only one):** `battle_black_sinks.txt:1772` — `Ten years under Captain Vane. Ran an apothecary in the high city before a tax-bailiff burned it for unpaid levies. Vane offered forty silver marks a season and promised no lord would ever tell me who I could or couldn't treat.` Creed: `a soldier dies of steel or gangrene — never of politics` (echoed `lorebook-data.js:102`).
- **Look / kit (3 scenes):** `camp_night.txt:835` lean sharp-featured woman, lanolin+iodine apron, dark hair pinned with carved bone bodkin, scarred fingers, waxed thread, iron knife. `battle_black_sinks.txt:1657-1661` crates, vinegar + sulfur + willow bark + grain spirits, bone-needles in rainwater, raspy flat drawl. `alderford.txt:606-608` sorting needles, pulse-check: `Hands don't shake… boils linen, brews fever tea, keeps head down when arrows fly`.
- **Role:** `Iron Carrion — Company Surgeon & Field Medic, Logistics & Baggage Train` (`lorebook-data.js:168`). Wagon → crates → hospital transport / barge (`alderford.txt:602, 3811`).
- **Systems:** `startup.txt:233,471,766,773,787,806` — `odessa_respect 0`, `met_odessa`, `codex_odessa`, `visited_odessa_night`, `visited_bivouac_odessa`, `prep_odessa_salve` (camphor-fat tin). Meter in lorebook + `camp_night.txt:1115`.
- **Magic attitude:** Healing Word (`:1694-1700`) earns `Sit by the fire, bard. Your drink is on me.` Prestidigitation (`:1718-1722`): `Now that is actual magic… flashy bastards in the Cadre blow up trees and expect me to stitch what's left.`
- **Mentor:** `alderford.txt:593-610, 1077-1080, 3810-3811` — Elspeth as `odessa_apprentice`, folding linen / steeping willow-bark wash.
- **Hearth hook:** `battle_black_sinks.txt:1822` — `a quarter to Odessa's vinegar barrels`.
- **Lorebook now:** `lorebook-data.js:165-177` static 2-para array, `see: ["iron_carrion"]`. Model is Vane (`:91-106`) 4-para `function(s)` with gated `if (truthy(s.met_odessa))`.

**Gaps:** no surname, no named high city, no date, no Redfort link, no Port Valen payoff, no Elspeth-progress beat.

---

## 2. Design — reuse flags, one optional new flag

Reuse only (no migration): `met_odessa` (unlock), `codex_odessa` (base visibility), `odessa_respect` (meter + warm gating), `elspeth_role = "odessa_apprentice"` (mentor branch), `prep_odessa_salve` (method para), `visited_odessa_night` / `visited_bivouac_odessa` (tellings differ).

Optional new (only if you want follow-up to gate lorebook):

- `odessa_confided` (bool, default false) — set true on bivouac success `Ask her plainly…` (`battle_black_sinks.txt ~1770`). Gates lorebook para 3. Alternative: gate on `odessa_respect >= 6`, skip new var. **Reviewer: pick one.**

No surname, no named city, no dates. `high city` stays lower-case as spoken (suggests Port Valen Civic Heights per `port_valen.txt:1948`, never stated — keep rumor).
---

## 3. DRAFT A — Lorebook replacement (web/mygame/lorebook-data.js id odessa, lines 164-177)

Keep id, category, title, link, sub, role, tags, aliases, unlock, meter. Change body to function + expand see.

```js
{
  id: "odessa", category: "people", title: "Surgeon Odessa",
  link: ["Surgeon Odessa", "Odessa"],
  sub: "Company Surgeon & Field Medic",
  role: "Iron Carrion — Company Surgeon & Field Medic, Logistics & Baggage Train",
  tags: ["Iron Carrion"], aliases: ["Odessa", "surgeon", "medic", "healer"],
  unlock: "met_odessa",
  meter: { stat: "odessa_respect", label: "Surgeon Odessa's Regard" },
  body: function (s) {
    var out = [
      "The company's field surgeon. She kept the four hundred patched together with boiled linen, bone needles, and waxed thread, working from a triage wagon on the march and a pair of overturned munitions crates behind the line.",
      "<i>\"A gaunt, sharp-featured woman with more scars across her fingers and knuckles than most of the frontline veterans she stitches. Dark hair pulled back severe and pinned with a carved bone bodkin, leather apron stained with lanolin and iodine, small iron knife at her belt for shearing thread. Sharp-eyed and unsentimental, she prices every wound in linen, vinegar, and time.\"</i>"
    ];
    if (truthy(s.codex_odessa)) {
      out.push("What she told you at the Black Sinks, stitching one-handed without looking up: ten years under Captain Vane. Before that she kept an apothecary in the high city until a tax-bailiff burned it for unpaid levies. Vane offered forty silver marks a season and one promise — no lord would ever tell her who she could or could not treat. The veterans by the hearth tell the pay the same way: half to the Captain's wagon, a quarter to Odessa's vinegar barrels.");
    }
    if (truthy(s.prep_odessa_salve)) {
      out.push("Her method, learned at her table: snap bodkin shafts before drawing them through, wash in boiled water and never ditch runoff, boil the linen clean, and rub camphor fat into joints against damp and boot-chafe. Steel kills fast, she says. Marsh fever kills slow.");
    }
    if (s.elspeth_role === "odessa_apprentice") {
      out.push("At Alderford your sister boiled linen at her table, folded bandage strips, and steeped willow-bark wash under her eye. Odessa fed her from the company kettle and bedded her on the hospital transport. Her test was short: hands that do not shake, eyes that stay clear, and sense enough to keep her head down when arrows fly.");
    }
    return out;
  },
  see: ["iron_carrion", "vane", "elspeth", "alderford", "port_valen"]
},
```

REVIEWER RESOLUTIONS:
- [x] Each gated para ~40–60 words, trimmed and balanced.
- [x] Gated backstory paragraph cleanly on `codex_odessa`, moving `*set codex_odessa true` exclusively to the Black Sinks backstory dialogue to prevent Night 1 timeline leaks.
- [x] Corrected apprentice paragraph to "At Alderford" (reunion location) instead of "On the march".
- [x] `see` expansion verified: all 5 IDs exist in live `lorebook-data.js`.

---

## 4. DRAFT B — Bivouac follow-up (battle_black_sinks.txt after :1774, before :1789 goto)

Intent: one extra beat after success, no new DC, no extra respect grind. Failure path untouched (her camp-tales / drunkards line defines her).

```choicescript
      She glances at you sideways. "Keep your wits sharp, recruit. Steel kills fast, but the marsh fever kills slow. Wash your wounds in boiled water, not ditch-runoff, and you might actually live to see your contract pay out."

      *choice
        # "That apothecary — was it worth losing?"
          Odessa ties off the stitch with her teeth and lays the needle flat in the boiled water before she answers.

          "Every jar labelled in my own hand," she says. "Willow bark, feverfew, blue poppy for the worst nights. The bailiff chalked the door for levies the lane said were already paid. When I could not pay twice, he put a torch to the shutters to teach the lane a lesson."

          She picks up the next needle. "I spent three days watching the ashes cool before Vane's column rode through. He didn't offer pity. He offered clean water, a wagon, and work for two hands that didn't shake. I took the iron shilling and never looked north again."
          *goto bivouac_odessa_done
        # "Ten years — why stay with the Carrion?"
          "Because the pay weighs true," she says, "and because the rule never changed. In the high city a surgeon asks whose coin, whose house, whose priest before they thread a needle. Here, a puncture is a puncture. Vane keeps his contracts and I keep my table. That's worth ten years in the mud."
          *goto bivouac_odessa_done
```

Mechanics: no respect bump here (already +6 at :1764). Sets `codex_odessa true` inside `check_success` to unlock lorebook paragraph. Time cost already paid (:1814 +30 min). `bivouac_odessa_done` handles the `*page_break`.

REVIEWER RESOLUTIONS:
- [x] Trimmed two rooms setup to focus on the hand-labelled jars and burnt shutters.
- [x] Phrased tax dispute as "levies the lane said were already paid" to keep in-fiction perspective.
- [x] Replaced repetitive Vane offer in Option 1 with watching the ashes cool and taking the iron shilling.
- [x] Replaced repeated "Steel or gangrene" in Option 2 with "whose priest before they thread a needle / a puncture is a puncture / worth ten years in the mud".
- [x] Silent-nod third option cut to keep the choice focused on her history.

---

## 5. DRAFT C — Hearth rumor (veterans circle, battle_black_sinks.txt near :1834)

One line to plant, not a new choice. Insert after crossbowman vinegar-barrels joke:

```choicescript
  A scarred crossbowman spits into the embers, shaking his head. "Four hundred silver marks from the Gilded Scales," he snorts. "Half of it goes to the Captain's wagon, a quarter to Odessa's vinegar barrels, and by the time the pay-chest opens in Port Valen, we'll be lucky to see a few shillings each."

  "And glad to pay it," a grey-bearded pikeman mutters without looking up from his tin mug. "Redfort. Half the trench gangrened before the first snow thawed. She cut the rot out of my leg with a boiled nail-knife and poured the last of the spirits over it. I walked out; couldn't say the same for the rest of my file."
```

Full context: answers the crossbowman's complaint with field-surgery reality, without repeating the following veteran's "Three months eating frozen mule-leather" phrasing.

---

## 6. DRAFT D — Elspeth progress beat (alderford.txt near :3811)

Placed in `alderford.txt` hospital-transport farewell beat:

```choicescript
*if (elspeth_role = "odessa_apprentice")
  Near the hospital transport barge, Elspeth folds a stack of boiled linen into even strips, her fingers quick and sure beneath a clean wool apron, a bundle of dried willow bark waiting at her elbow for grinding. Odessa checks the fold with one blunt fingertip and gives a single short nod. "Better. Even edges hold the wound. Uneven ones breed fever." Elspeth catches your eye through the morning mist with a proud, tired smile—safe, fed, and learning a craft that keeps people alive.
```

---

## 7. Implementation checklist

- [x] web/mygame/lorebook-data.js — replace odessa entry with Draft A (function body + see). Fixed comma splice and reunion location.
- [x] web/mygame/scenes/camp_night.txt — remove early `codex_odessa` set on Night 1 triage visit.
- [x] web/mygame/scenes/battle_black_sinks.txt — remove early `codex_odessa` on bivouac arrival; set `codex_odessa` on confiding backstory; tighten Option 1 and Option 2 to eliminate repetitive punchlines.
- [x] battle_black_sinks.txt hearth — insert Draft C pikeman line without adjacent mule-leather echo.
- [x] alderford.txt — Draft D implemented in farewell muster (:3811).
- [x] Run quicktest + lint_anachronisms + lint_prose_tics — all pass. compile.js regenerated play_game.html/output.html.
- [x] Vane entry: no change — already cites Odessa.

---

## 8. Resolved Open Questions & Review Checklist

1. **Surname:** None — Surgeon Odessa / one name like Kestrel. Preserves canon integrity.
2. **Name the high city:** Kept lower-case "high city" as spoken; lorebook preserves subjective tellings.
3. **`codex_odessa` gating:** Repurposed existing `codex_odessa` specifically for the Black Sinks backstory dialogue, removing it from generic meeting blocks to avoid `startup.txt` schema churn.
4. **Dialogue cadence:** Tightened Options 1 and 2 to stop repeating setup lines verbatim.
5. **Prose Echo Elimination:** Resolved back-to-back campfire repetition of "Three months eating frozen mule-leather".


