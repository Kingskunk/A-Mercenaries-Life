# Duckboard Market: Enhancement Plan (Post-Implementation Assessment)

> **Source:** `web/mygame/scenes/port_valen_dredge_end.txt` (arrival prose line 27; weather block lines 29–43; time-of-day block lines 45–54; weekday block lines 56–91)
> **Status:** Previous sensory/prose/environmental enhancements are already implemented. This plan addresses remaining gaps per the 5 criteria.
> **Critical issue found:** The three conditional blocks (weather, time, weekday) are stacked additively but do not cross-reference each other, producing logical contradictions in certain combinations.

---

## Critical Issue: Logical Contradictions in Stacked Conditionals

The three conditional blocks are additive — a player at Rain + Night reads both the Rain weather block AND the Night time block. Several lines in the time-of-day block are unconditional and contradict non-matching weather states:

| Combination | Weather block says | Time block says | Contradiction |
| :--- | :--- | :--- | :--- |
| Rain + Night | "Rain drums across the sagging shingle roofs" | "The fog has come down with the dark" | It is raining, not foggy |
| Storm + Night | "A driving gale howls through the narrow canal cuts" | "The fog has come down with the dark" | Storm, not fog |
| Blizzard + Night | "A freezing squall drives snow through the water-lanes" | "The fog has come down with the dark" | Blizzard, not fog |
| Clear + Night | "Pale daylight slants between the crowded roofs" | "Beneath the bridges, the canal water is black" | Daylight vs. black water |
| Clear + Dusk | "Pale daylight slants between the crowded roofs" | "The failing dusk light drains from the water" | "Pale daylight" contradicts dusk |

**Fix approach:** Make the time-of-day block's opening lines conditional on weather, or rewrite them to be weather-neutral. Priority is the Night block's fog reference (line 47) and the Clear block's daylight reference (line 40).

---

## 1. Sensory Depth — Remaining Gaps

### Current state (post-implementation)
Olfactory, auditory, and tactile layers have been added to most blocks. The arrival paragraph now has cold/tactile anchoring. Weather blocks have smell, sound, and body sensation. Weekday blocks have reactive NPC details and economic storytelling.

### Remaining gaps

#### 1a. Tactile depth still skews toward temperature
Most tactile additions are about cold/chill ("chilled through the soles," "chill comes up through boots," "damp beads on coat"). Missing tactile dimensions:

- **Texture:** The gangway planks are described as "slick" (Rain) but not in other states. The stone should feel different in each state — dry and rough (Clear), wet and smooth (Rain), icy (Blizzard), soft with moss (Fog).
- **Pressure/weight:** The water's weight is implied but not felt. "The air hangs thick" (arrival) is good but could be stronger in each variant — humidity as physical resistance.
- **Proprioception:** "Every step on the paving rings a little hollow" (arrival) is the only step-feel line. Each weather variant should alter how the ground feels underfoot: "The planks flex and give way to water beneath" (Rain), "The stone is dry and gives firmly" (Clear).

#### 1b. Some weekday blocks have thin sensory layers
- **Tideday else** (line 65): Only visual + one tactile ("cold rises with it"). No smell, no sound beyond the water.
- **Ironday else** (line 85): Only visual + one smell. No tactile, no sound.
- **Greyday else** (line 75): Only visual + one tactile (heat from brazier). No smell beyond smoke.
- **Clear weather** (line 40): Good for sound (gull, creak) but no tactile beyond "air is clean."

#### 1c. The arrival paragraph's tactile anchoring could be deeper
Currently: "The ground is chilled through the soles of your boots" + "Every step on the paving rings a little hollow." Two good lines, but the paragraph could benefit from one more tactile detail about the environment itself — the feel of the air, the resistance of the fog, the weight of the humidity.

### Recommendations

- **Texture variation per state:** Add one surface-tactile line per weather variant (e.g., Clear: "The stone is dry and gives firmly underfoot"; Fog: "The wood is slick with condensation and your fingers leave dark prints on the railings").
- **Fill thin weekday blocks:** Tideday else needs a smell (salt, surge); Ironday else needs a sound (wind, or the quiet of an empty canal); Greyday else needs a tactile detail (the cold of the walls).
- **Add one non-temperature tactile to arrival:** "The air has weight here — you feel it pressing against your chest before you feel it on your skin."

---

## 2. Narrative Flow — Remaining Gaps

### Current state
The three conditional blocks are stacked: weather → time-of-day → weekday. Each block adds to the scene independently. The arrival paragraph sets the base, then each conditional layer adds detail.

### Remaining gaps

#### 2a. No bridge between arrival paragraph and weather block
The arrival paragraph ends with "Every step on the paving rings a little hollow." The very next line is `*if (weather = "Rain")`. There is no narrative transition — the eye drops from the arrival prose into a conditional block without a moment of pause or refocusing.

**Fix:** The weather block's first line should feel like a natural continuation of the arrival prose, not a separate paragraph. Since the arrival already mentions "the air hangs thick," the weather block should feel like the air is about to change. One approach: make the weather block's first line reference the sky/atmosphere established in the arrival (e.g., "Above, the sky has darkened" → then specific weather).

#### 2b. Time-of-day block doesn't reference weather state
The Night block (line 47) starts with "Beneath the bridges, the canal water is black" regardless of whether it's raining, foggy, stormy, or clear. The Dusk block (line 52) starts with "The failing dusk light drains from the water" regardless of conditions. These are time-specific but not weather-aware.

**Fix:** Add one weather-reference phrase to each time-of-day opening. For example:
- Night + any weather: "Beneath the bridges, the canal water is black" → "Beneath the bridges, the canal water is black and [weather-specific quality]"
- Dusk + any weather: "The failing dusk light drains from the water" → "The failing dusk light drains from the water, [weather-modified]"

#### 2c. Weekday block doesn't reference time or weather
The weekday blocks start with day-specific content (Marketday, Tideday, etc.) but don't acknowledge the time of day or weather. A Marketday at Night reads the same Marketday content as Marketday at Morning.

**Fix:** Add one time/weather-reference phrase to each weekday opening. This is especially important for:
- Hearthday (line 89/91): "Hearthday empties the water-lanes early" — this implies evening, but it appears at all times.
- Marketday (line 58/60): Marketday content at Night doesn't make sense — stalls would be closed.

---

## 3. Variable Integration — Remaining Gaps

### Current state
The three conditional blocks operate independently. The `wisdom >= 13` / `origin = "outlaw"` check creates a binary split in every time-of-day and weekday branch. Cross-condition references exist only for Rain ("if it has rained this morning").

### Remaining gaps

#### 3a. The Night block's fog reference is unconditionally wrong (see Critical Issue above)
Line 47: "The fog has come down with the dark" appears in ALL Night scenarios, including Rain + Night, Storm + Night, Blizzard + Night, and Clear + Night. This is the most important fix in this plan.

**Fix options:**
- **Option A (recommended):** Rewrite line 47 to be weather-neutral: "Beneath the bridges, the canal water is black and the darkness is total." Then let the weather block handle the specific atmospheric condition (rain, fog, storm, etc.).
- **Option B:** Make the fog reference conditional: `*if (weather = "Fog") The fog has come down with the dark... *else The darkness is total...`

#### 3b. The Clear weather block's "Pale daylight" contradicts Night time (see Critical Issue above)
Line 40: "Pale daylight slants between the crowded roofs" appears when weather = Clear, regardless of time. At Night + Clear, the player reads both "Pale daylight slants" and "canal water is black."

**Fix:** Rewrite line 40 to be time-neutral: "Light filters between the crowded roofs, thin and clean" (works for day) or "The sky is clear between the crowded roofs, and the air is cold" (works for night).

#### 3c. "If it has rained this morning" only handles Rain
Several blocks reference rain specifically ("if it has rained this morning," "if it has rained, the linen is heavier"). But if the weather is Storm, Fog, Snow, or Blizzard, these references don't make sense — it's not raining, it's doing something else.

**Fix:** Generalize the references:
- "if it has rained this morning" → "if the weather has been wet this morning" (covers Rain, Storm, Snow)
- "if it has rained, the linen is heavier" → "if the surge has been high, the linen is heavier" (covers Rain, Storm, Tideday)
- Or: make the references weather-specific with `*if (weather = "Rain")` nested inside the weekday block.

#### 3d. The wisdom/origin check doesn't vary by other conditions
The `wisdom >= 13` / `origin = "outlaw"` check produces identical structural splits in every branch. A player with wisdom 15 reading Marketday + Rain + Night gets the same "criminal insight" branch as a player with wisdom 15 reading Hearthday + Clear + Morning. The content doesn't vary by weather or time.

**Fix (low priority, enhancement):** For key branches, add one line that references the weather/time context within the wisdom branch. For example, the Night + Rain + wisdom branch could note something the rain reveals that wouldn't be visible in clear weather.

---

## 4. Prose Quality — Remaining Gaps

### Current state
The prose has been elevated from the original flat descriptions to more evocative writing. Em dashes are used for pacing. Openings are varied. The overcast block has been rewritten. The arrival paragraph has varied rhythm.

### Remaining gaps

#### 4a. Some additions are functional but not evocative
These lines read as if/then conditions rather than narrative prose:
- Line 58: "if it has rained this morning she pulls the awning tighter and curses in three dialects" — good detail, but "if it has rained this morning" reads like a condition, not a narrative transition.
- Line 63: "If it has fogged this morning, he works slower, pausing to feel the water with his free hand" — same issue.
- Line 65: "if it has rained, the linen is heavier than it should be and she curses the weight" — same.
- Line 73: "If it has rained, the sound of the pounding carries differently, wet and final" — same.
- Line 78: "If it has rained, the smith's striker works slower, the damp making the iron harder to move" — same.

**Fix:** Rewrite these as narrative observations rather than conditional statements. Instead of "if it has rained this morning she pulls the awning tighter," try "she pulls the awning tighter against the wet — it's been raining since before dawn, and the awning is all that stands between her eels and the sky." This embeds the condition in the narrative rather than stating it.

#### 4b. Some sensory lines are generic
- Line 60: "The smell of eel and steam hangs over the lanes" — generic smell description. Could be more specific: "The smell of eel and steam hangs over the lanes like a second awning."
- Line 85: "The smell of drying linen and canal water mixes in the air, and neither overpowers the other" — the "neither overpowers the other" construction is analytical, not evocative. Try: "The smell of drying linen and canal water share the air, and you can't tell where one ends and the other begins."
- Line 80: "The smell of hot iron and char mixes with the canal smell, and neither is pleasant" — same analytical construction.

#### 4c. The Hearthday blocks could use stronger prose
Lines 89/91 are functional but lack the evocative quality of the best lines in the text. "The boats drift because no one is paying them to move" (line 89) is excellent. But "Smoke curls thick from tenement chimneys — cheap coal, not peat" (line 91) could be more sensory: "Smoke curls thick from tenement chimneys — the wrong kind of smoke, the kind that smells of coal not peat, the kind that sticks to your coat."

---

## 5. Logical Consistency — Remaining Gaps

### Current state
The environmental changes are mostly logically sound. Weather affects the terrain (slick planks, swollen gangways). Time affects the light (dusk, night darkness). Weekday affects the crowd (Marketday busy, Hearthday empty). But the three systems don't interact.

### Remaining gaps

#### 5a. Weather × Time interactions are not handled (see Critical Issue above)
The Night block's fog reference and the Clear block's daylight reference are the most visible contradictions, but there are subtler ones:

- **Clear + Night:** "Pale daylight slants" + "canal water is black" — the sky is clear (implying stars/moon) but the water is described as black (implying no light). If it's a clear night, the water should reflect moonlight, not be pitch black.
- **Storm + Dusk:** "A driving gale howls" (Storm weather) + "The failing dusk light drains from the water" (Dusk time) — the storm would make dusk darker faster, but the Dusk block doesn't reference this.
- **Fog + Day:** "The fog has come, and it does not plan to leave" (Fog weather) + Daytime weekday content — fog during the day is different from fog at night, but the weekday blocks don't distinguish.

#### 5b. The "morning" assumption in conditional references
Several references say "this morning" or "if it has rained this morning" — but the text doesn't track whether it's morning, afternoon, or evening within a given time period. If it's a Rainy Afternoon, "if it has rained this morning" might be true (the rain started this morning and continued) or misleading (it's been raining all day, not just this morning).

**Fix:** Change "this morning" to "already" or "still" — temporal references that work at any time: "if it's still raining" or "the rain has been falling since before dawn."

#### 5c. The Blizzard + Clear contradiction
If weather = Blizzard, the Blizzard block describes heavy snow. If the same scene also has Clear weather... wait, Blizzard and Clear are separate weather values, so they can't coexist. This is fine — the weather values are mutually exclusive. But the Blizzard block (line 38) says "A freezing squall drives snow through the water-lanes" while the Clear block (line 40) says "Pale daylight slants between the crowded roofs." These are different weather states and can't occur simultaneously, so there's no contradiction. This is confirmed as fine.

#### 5d. The Dusk time period is ambiguous
Dusk is treated as a separate time period (between Day and Night). The Dusk block (lines 52-54) describes failing light. But the weekday block is inside the `else` of the time-of-day block (i.e., it runs when time_period is NOT Night/Pre-Dawn/Dusk — i.e., it's Day). So Dusk + Marketday reads the Dusk block, not the Marketday block. This means weekday-specific content never appears at Dusk.

**This is a structural issue:** Dusk is a time period that gets its own block, so weekday content is skipped at Dusk. If the design intends for weekday content to also appear at Dusk (with Dusk lighting), the structure needs to change. If Dusk is intentionally separate, this should be documented.

---

## Priority Actions

| Priority | Action | Criterion | Effort |
| :--- | :--- | :--- | :--- |
| **Critical** | Fix Night block's unconditional fog reference (line 47) — make weather-neutral or conditional | Logical Consistency | Low |
| **Critical** | Fix Clear block's "Pale daylight" (line 40) — make time-neutral | Logical Consistency | Low |
| **High** | Generalize "if it has rained this morning" references to cover all wet weather | Variable Integration | Medium |
| **High** | Rewrite conditional "if it has rained" prose as narrative observations | Prose Quality | Medium |
| **High** | Add weather/time reference phrases to time-of-day and weekday openings | Narrative Flow, Variable Integration | Medium |
| **Medium** | Add non-temperature tactile details (texture, pressure, proprioception) to thin blocks | Sensory Depth | Medium |
| **Medium** | Fill sensory gaps in Tideday else, Ironday else, Greyday else | Sensory Depth | Low |
| **Medium** | Replace generic sensory lines with more specific alternatives | Prose Quality | Low |
| **Low** | Add one non-temperature tactile detail to arrival paragraph | Sensory Depth | Low |
| **Low** | Document Dusk + weekday structural gap (Dusk gets its own block, weekday content skipped) | Logical Consistency | Low |

---

## Cross-Reference with Design Plan

These recommendations extend the texture pass in `DREDGE_END_EXPANSION_PLAN.md` §3.4 and the conditional structure in §4:
- §3.4's palette table should be the source for the texture/tactile additions in §1a
- §4.1's `tide_state` derivation should be used to make the time-of-day block weather-aware (once `tide_state` is implemented)
- §4.2's "What the tide changes" table (per-area low/high water differences) should inform the weekday block's environmental details
  - The critical fog/daylight contradictions are not addressed in the design plan and must be fixed before the district can be considered logically consistent

---

## Dependency and Risk Assessment

### Variable Dependencies

| Variable | Defined In | Values | Handled By | Status |
| :--- | :--- | :--- | :--- | :--- |
| `weather` | `calendar.txt:56-98` | Clear, Overcast, Snow, Sleet, Blizzard, Rain, Fog, Storm | Scene `*if` chain (7 explicit + 1 else) | All values handled |
| `time_period` | `calendar.txt:377-387` | Pre-Dawn, Morning, Midday, Afternoon, Dusk, Night | Scene `*if` chain (Night/Pre-Dawn, Dusk, else) | All values handled |
| `day_of_week` | `calendar.txt:348-360` | Ironday, Tideday, Marketday, Hearthday, Forgeday, Greyday, Hallowday | Scene `*if` chain (6 explicit + 1 else) | All values handled |
| `wisdom` | `startup.txt` | Integer | Scene `*if` checks | Used in existing checks |
| `origin` | `startup.txt` | String | Scene `*if` checks | Used in existing checks |
| `tide_state` | Not implemented | N/A | N/A | Not required for current changes |

No new variables are needed for any proposed prose change.

### Cross-File Dependencies

| File | Relationship | Action Required |
| :--- | :--- | :--- |
| `lorebook-port-valen.js:598` | `dredge_end` lorebook entry contains pre-retcon arrival prose ("The city's clean paving stops...") | Must update to match scene prose and ideally add sensory details |
| `lorebook-port-valen.js:631` | `duckboard_market` lorebook entry — consistent with scene prose and design palette | No action needed |
| `calendar.txt` | Defines `weather`, `time_period`, `day_of_week` | No changes needed |
| `startup.txt` | Creates `dredge_end_seen`, `dredge_end_open` | No changes needed |
| `port_valen.txt` | Travel logic to Dredge-End | No changes needed |
| `quest/DREDGE_END_EXPANSION_PLAN.md` | Design reference | No changes needed |

### Risk Assessment

| Risk | Severity | Likelihood | Mitigation |
| :--- | :--- | :--- | :--- |
| Logical contradictions (Night+Fog, Night+Storm, Night+Blizzard, Clear+Night) | HIGH | Certain (every non-matching combination) | Fix Night block line 47 and Clear block line 40 before implementation |
| Lorebook inconsistency (dredge_end entry uses old prose) | MEDIUM | Certain (discovered on any lorebook check) | Update `lorebook-port-valen.js:598` alongside scene changes |
| Compile failure | LOW | Very low (prose-only changes) | Re-run `node compile.js` after all edits |
| Lint regression (vocab overuse, thin prose) | LOW-MEDIUM | Moderate (new prose adds word frequency) | Re-run all lint tools after all edits |
| Dusk structural gap (weekday content skipped at Dusk) | MEDIUM | Certain (by design, not a bug) | Design decision required — see Open Questions |
| `tide_state` not implemented | LOW | N/A (not required) | Create in `startup.txt` before implementing design plan §4 |

### Open Questions — Resolved Recommendations

**1. Dusk + Weekday content → Weekday block should also run at Dusk.**

The design plan §4.1 defines Dusk as **low water** (Morning, Midday, Afternoon, Dusk), and §4.2 shows that areas have weekday-specific behavior at low water (Duckboard Market busy, Dredge Landing working, etc.). The current structure puts Dusk in its own time-of-day block, which means weekday content never appears at Dusk — contradicting the design plan's own tide table.

**Recommended approach**: Separate the weekday block from the Day `else` branch and make it run for both Day and Dusk. The Dusk block stays as-is (failing light, lanterns, vendors pulling canvas). At Dusk, the player reads both the Dusk atmosphere AND the weekday content, stacked additively — the same way weather and time currently stack.

Concrete restructure of the time-of-day section:

```
*if ((time_period = "Night") or (time_period = "Pre-Dawn"))
  [Night content — unchanged]
*elseif (time_period = "Dusk")
  [Dusk atmosphere — unchanged]
*if (((time_period = "Morning") or (time_period = "Midday")) or (time_period = "Afternoon") or (time_period = "Dusk"))
  *if (day_of_week = "Marketday")
    [Weekday content — unchanged]
  ...
```

This preserves all existing content, adds weekday content at Dusk without duplication, and matches the design plan's tide table. Night and Pre-Dawn remain weekday-free (high water = district asleep).

**2. Lorebook update scope → Match scene prose + palette, stay brief.**

The design plan §6.2 states: "The `dredge_end` entry keeps its base facts, but its text follows the same palette." The lorebook entry at `lorebook-port-valen.js:598` currently uses the pre-retcon arrival prose ("The city's **clean** paving stops...").

**Recommended approach**: Update the lorebook's first paragraph to match the scene's arrival prose (retcon fix: "The city's paving stops..." not "clean paving"), and ensure it follows the same sensory palette (colors, sounds, smells from §3.4). Do NOT add the full conditional depth — the lorebook is a static summary, not a conditional scene. One paragraph of geographic description with the same palette is sufficient.

**3. Weather x Time nesting depth → Weather-neutral text (confirmed).**

Option (a) — making the Night block's fog reference and Clear block's daylight reference weather/time-neutral — is the recommended approach. The weather block already handles the specific atmospheric condition; the time-of-day block should provide universal temporal context (darkness, failing light) without contradicting the weather.

---

## Readiness Verdict

**The plan is ready for implementation.** All three open questions have been resolved with specific recommendations. The two previously-blocked items now have clear fixes:

1. **Night block fog reference** (line 47): Make weather-neutral (e.g., "The darkness is total, and the canal water is black").
2. **Clear block daylight reference** (line 40): Make time-neutral (e.g., "The sky is clear between the crowded roofs").
3. **Dusk structural gap**: Restructure the weekday block to run for both Day and Dusk (see §Open Questions #1).

Remaining changes are low-risk prose edits in a single file with no new variables or commands.
