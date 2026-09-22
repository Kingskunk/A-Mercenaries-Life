# Duckboard Market: Descriptive Text Analysis & Enhancement Plan

> **Source:** `web/mygame/scenes/port_valen_dredge_end.txt` (arrival prose line 27; weather block lines 29–43; time-of-day block lines 45–55; weekday block lines 56–91)
> **Companion design doc:** `quest/DREDGE_END_EXPANSION_PLAN.md` (Sections 3.4 texture pass, 4 tide/weekday rules, 5 place kits)
> **Scope:** Analysis and recommendations only. No source edits in this agent.

---

## 1. Sensory Expansion

### Current State
- **Olfactory:** "smoke from a frying-eel stall" (line 27). Rain variant adds no smell. Fog variant adds no smell. Clear variant adds no smell.
- **Auditory:** "laundry snapping on the gangways," "a smith's hammer keeping time somewhere out of sight" (line 27). Storm variant adds wind/gale. Fog variant adds muffling. Snow variant adds huddling. Night variant adds a whistle and shutter crack.
- **Tactile:** "Every step on the stone rings a little hollow" (line 27) — the only proprioceptive/tactile line in the entire arrival prose. Rain variant adds "sagging shingle roofs" (visual/structural, not tactile to the player). No temperature, humidity, or surface texture is conveyed to the player body.

### Recommendations

#### 1a. Olfactory — Add at least two distinct smell layers per state
The current single smell (frying eel) is the district's olfactory signature for every visit. Per the texture pass in `DREDGE_END_EXPANSION_PLAN.md:191`, the palette should include tar, cedar, lamp oil, and broth. Specific additions:

- **Base/arrival:** Insert "the sharp tang of lamp oil from the chandler's stall" and "the warm, greasy smell of tarred rope" alongside the eel smoke. These are district-constant smells that establish place identity.
- **Rain:** Add "the smell of wet ash and charcoal rising from the heating pots" (charcoal pots are already mentioned in the snow variant but never given a smell). Rain on tarred pilings produces a distinct resinous wet-dog smell — one sentence anchors this.
- **Fog:** Add "the cold, mineral smell of the canal water itself rising with the mist" — fog should smell like the water, not just obscure vision.
- **Clear:** Add "the clean smell of drying laundry and woodsmoke" — clear weather should smell the *least* polluted, creating contrast.
- **Storm:** Add "the salt-brine sting of the estuary wind driving up the cut" — storms bring the sea smell inland.

#### 1b. Auditory — Diversify beyond the two constant sounds
The smith and laundry are good anchors but never vary. The weekday blocks already have richer ambient sound (eel-seller shouting, ferryman calling, friar's broth line), but the arrival prose and weather blocks are sonically flat.

- **Base/arrival:** Add one transient sound: "a gull's cry from the rooftops" or "the dull thud of a crate landing on a timber platform somewhere out of sight." This gives the ear something to track as movement.
- **Rain:** Beyond the drumming on roofs, add "the quick percussion of boot-heels on wet stone" — rain changes *how people move*, and that change should be heard.
- **Fog:** The current "muffling footsteps" is good but one-dimensional. Add "the distant, directionless clang of a shutter bolt sliding home" — fog makes sounds come from nowhere, so metallic sounds (iron on iron) are perfect because they carry through moisture.
- **Clear:** Add "the creak of a footbridge under its own weight in the stillness" — quiet weather reveals structural sounds that weather masks.
- **Storm:** The gale is described but the water's sound is missing. Add "the chop of the canal against the pilings, a steady knocking that rises to match the wind."

#### 1c. Tactile — This is the largest gap. Add body-centered sensation.
Only one tactile line exists in the entire scene. The player character's physical relationship to the environment is almost entirely visual.

- **Base/arrival:** Expand "Every step on the stone rings a little hollow" into two beats: the hollow resonance *and* the sensation of the stone itself — "the stone is cold through the soles of your boots, and each step rings a little hollow." Cold is the missing tactile anchor for a district below the high-water line.
- **Rain:** Add "the rain finds the gap at your collar and sits there, cold and patient" — rain in a shanty district doesn't stay overhead; it finds the player. Also, "the gangway planks swell and go slick underfoot" (tactile surface change).
- **Fog:** Add "the fog beads on your coat and does not shake off" — humidity as a tactile experience on the body.
- **Snow/Sleet:** Already mentions "cold grey slush" but only as a visual of the ground. Add "the cold comes up through your boots and stays there" — ground cold conducting into the body.
- **Storm:** Add "the wind presses against you, shoving your balance sideways on the gangway" — wind as a physical force, not just a sound.
- **General:** Humidity should be a recurring tactile motif. In a district below the high-water line, the air itself has weight. One sentence per variant about "the air hanging thick" or "the damp settling on the skin" would unify the tactile layer.

---

## 2. Conditional Logic Refinement

### Current State
Three independent conditional blocks: weather (7 branches), time-of-day (3 branches), weekday (8 branches). They are stacked — weather is evaluated first, then time-of-day, then weekday. This means:
- Weather and time-of-day never interact (a Rainy Night reads the same as a Rainy Morning except for the time-of-day block's content, which doesn't reference weather).
- Weekday and weather never interact (a Marketday in Fog reads the same as a Hearthday in Fog).
- The `wisdom >= 13` or `origin = "outlaw"` check is applied uniformly across all time-of-day and weekday branches, creating a binary "criminal insight" layer that doesn't vary by other conditions.

### Recommendations

#### 2a. Create cross-condition combinations for key moments
The most impactful combinations to write explicitly:

- **Dusk + Rain:** The failing light and rain together should create a specific atmosphere — "the rain dims the lanterns to smears of yellow, and the canal swallows the last of the daylight before it can be seen." Dusk already drains light; rain accelerates it. The transition should feel like the district *goes dark faster* than expected.
- **Night + Fog:** "The fog eats the lanterns whole. The footbridge lamps are not lamps anymore — they are suggestions." Night fog is more disorienting than day fog because there's no ambient light to contrast against.
- **Marketday + Clear:** The market should feel *louder* in clear weather — "the eel-seller's voice carries further when there's no wind to steal it." Clear weather amplifies human sound.
- **Greyday + Rain:** The district's most oppressive combination — "the grey light and the grey rain become one thing, and the lanes between the tenements look like the inside of a cloud." This is the district's nadir and should feel like it.
- **Hearthday + Clear:** "The clean evening light shows the district at its most ordinary — the washing is dry, the coals are out, and the only sound is the water in the cut." Hearthday quiet is different from Greyday quiet; one is restful, the other is oppressive.

#### 2b. Add a transition sentence at the top of each conditional block
Currently the blocks jump directly into their content. A single bridging sentence that references the *previous* state would smooth the transitions:

- Before the weather block: "The weather today is [weather]." → Too mechanical. Instead, weave it into the arrival prose: the arrival paragraph already sets the scene, so the weather block should open with something like "Above, the sky is [doing weather thing]." This makes the transition from the static arrival prose feel like the eye lifting.
- Before the time-of-day block: The time block currently starts with "Beneath the bridges" or "As dusk settles" — these are good but could reference the weather: "The rain hasn't let up, and dusk has come on without warning" (Rain + Dusk).

#### 2c. Vary the `wisdom/origin` check by context
Currently the check is identical everywhere. Consider:
- **Night + Rain:** Even a non-outlaw character should feel the district is less safe in rain at night — the "else" branch could note "the water-streets are quieter than they should be, and the silence has a watchful quality" rather than just "no sign of the Port Watch."
- **Marketday:** The "else" branch (non-outlaw) already has good life. But the "if" branch could note that even on Marketday, the *weather* changes what's visible — rain on Marketday means the wharf boys work slower, fog means the eel-seller can't see to short her scale.

---

## 3. Character and Interaction

### Current State
NPCs appear only in the weekday-specific branches and are purely scenic: eel-seller, wharf boys, tailor's apprentice, friar, ferryman, collector's runner, smith, scrap dealer, debt-writ man, rooftop runner, cellar-bosses, canal fence, acolyte, boatman, laundry woman. They perform one action and never react to the player, each other, or the environment dynamically. The district feels populated but not *alive*.

### Recommendations

#### 3a. Add "background pulse" NPCs that appear in multiple states
Create 2–3 recurring minor NPCs who appear across different time/weather/weekday combinations with small, consistent behaviors that change:

- **The Silt-Cat (a district child):** Appears in clear weather sitting on a piling pulling a line for minnows. Appears in rain huddled under the market awning, stealing a strip of eel from the seller. Appears at night sitting on the footbridge watching the dark water. Never speaks to the player but is a constant — the player recognizes "the silt-cat" from one visit to the next. This creates a sense of continuity without requiring dialogue.
- **The Barge-Watcher (an old dredger):** Appears at the Dredge Landing or lower steps in low water, propping a barge against the current with one oar. In rain, he pulls his tarp higher. At night, he's gone — his shift ended hours ago. On Forgeday, he's at the smith's instead. His presence signals the tide schedule without exposition.
- **The Canal-Runner (a young woman):** Appears on the Upper Gangways in clear weather, moving between tenements with a message or a parcel. In fog, she stops — you can hear her hesitating at a junction, then turning back. On Greyday, she's running something she shouldn't be (the rooftop runner from the current Greyday prose, but now she appears in clear weather too, just walking normally). Her behavior changes with conditions, making the gangways feel occupied.

#### 3b. Add one reactive environmental moment per weekday block
Currently the weekday blocks describe what NPCs are doing but none of them *react* to the district's state. Add one line per weekday where an NPC responds to the weather or time:

- **Marketday + Rain:** "The eel-seller pulls her awning tighter and curses the rain in three dialects."
- **Tideday + Fog:** "The diver surfaces from the flooded flophouse, blinking at the fog, and takes a long time deciding which way is up."
- **Hallowday + Clear:** "The friar's broth line is longer than usual — the cold morning has driven the poor out of their stilts and into the shrine's shelter."
- **Ironday + Storm:** "The collector's runner has taken shelter under the bridge arch, his wax tablet on his knee, waiting for the wind to ease."

#### 3c. Add a "living district" detail that changes between visits
One small detail that is different on subsequent visits creates the illusion of a district that continues existing without the player:

- A broken shutter that is repaired or worsens.
- A new chalk mark on a door (Hobb's door, already established).
- A dog that appears/disappears (a stray that the district feeds).
- A stack of salvage that grows or shrinks at the scrap platform.

These can be tracked with simple bool/int flags and referenced in one line of the arrival prose.

---

## 4. Prose and Rhythm

### Current State
The arrival paragraph (line 27) is a single 80-word sentence followed by shorter fragments. The structure is:
1. One long sentence establishing geography (27 words)
2. One long sentence establishing the district's position (14 words)
3. One long sentence listing sensory details (40+ words)
4. One short sentence (7 words)

The weekday/time/weather blocks are well-written individually but share a flat rhythm: each is 2–4 sentences of similar length, each ending on a concrete detail.

### Recommendations

#### 4a. Vary sentence length in the arrival paragraph
The current paragraph is almost entirely long sentences. The effect is a steady, breathless accumulation — good for density but poor for rhythm. Break it:

- Short sentence after the long geographic one: "Below it, the water is always close." (This creates a pause before the sensory list.)
- Short sentence after the sensory list: "The district breathes around you." or simply "Every step on the stone rings a little hollow." (Move this to its own line for emphasis.)
- The sensory list sentence should be broken into two: one for what you see, one for what you hear/smell. "The lanes above are loud and colored" is doing both visual and auditory work in one clause. Split: "The lanes above are loud — laundry snapping on the gangways, a smith's hammer keeping time somewhere out of sight — and colored: oilskin awnings patched in yellow and red, smoke from a frying-eel stall."

#### 4b. Use punctuation as pacing tool in the conditional blocks
The weather and weekday blocks use mostly periods. Introduce:
- **Em dashes** for interrupting details that speed the reader up: "Rain drums across the sagging shingle roofs — a sound like a hundred fingernails on old linen — sending streams of brown runoff..."
- **Semicolons** for parallel observations: "The fog sits trapped between the leaning buildings; the footbridge lamps burn low; and the water-streets give no sign of the Port Watch."
- **Fragments** for emphasis at the end of a block: "Cold grey slush slicks the plank-walks. And everywhere, the smell of charcoal."

#### 4c. Vary the opening of each conditional branch
Currently the weather block opens with the weather noun ("Rain drums...", "A driving gale...", "Thick river fog..."). The weekday block opens with the day name or a time reference. To improve rhythm:

- **Weather:** Open with the *effect* rather than the cause. Instead of "Rain drums across the sagging shingle roofs," try "The shingle roofs drum under the rain." Instead of "Thick river fog sits trapped," try "The fog has come, and it does not plan to leave." This shifts the prose from meteorological report to lived experience.
- **Weekday:** Open with the *district's mood* rather than the day. Instead of "The Port Watch doesn't come down to the canals on Marketday," try "Marketday, and the canals belong to the traders." Instead of "Grey light lies flat on the leaning walls," try "Greyday. The light has no opinion."

#### 4d. The "else" (overcast) block needs stronger prose
Line 43: "A flat, leaden sky presses down over the district, and a cold, close air settles between the crowded rooftops." This is the most generic line in the entire conditional system — it reads like placeholder weather prose. It should be rewritten to feel specific to Dredge-End: "The sky is a single grey sheet, and the air between the rooftops has stopped moving. Even the gulls have gone somewhere else."

---

## 5. Environmental Storytelling

### Current State
The current prose establishes the district as poor, damp, and lawless but does not imply *why* or *how long*. There are no artifacts of history, no evidence of economic forces, no signs of the district's relationship to the city above. The weekday blocks add some socio-economic texture (debt collectors, the Black Tally's collectors, the friar's charity) but only on specific days.

### Recommendations

#### 5a. Add one "built by whom" detail to the arrival prose
The district's construction tells its economic story. Add one line about the quality of the building:

- "The tenements are not built — they are *assembled*, from salvage and second-hand timber, and you can see where each wall was added after the last." This implies a district built by people who couldn't afford to build properly, expanded incrementally, never planned.
- Alternative: "Some of the pilings are stone, some are timber, and at least two are old ship's ribs — the district has been growing for longer than anyone keeps records of."

#### 5b. Add one "who is leaving / who is staying" detail
Economic state is revealed by movement. Add one detail per time-of-day that shows who has gone and who remains:

- **Day:** "A cart has been abandoned on the lane, its wheel still turning slowly in the current." — someone left in a hurry, or couldn't afford to fix the axle.
- **Dusk:** "The upper windows go dark in order, from the canal side inward — the families closest to the water leave first." — a hierarchy of who can afford to leave the damp.
- **Night:** "One window on the third landing stays lit, and a shape moves behind it — someone who works the night shift, or someone who cannot sleep in the damp." — either economic or social, both tell a story.

#### 5c. Add one "the city above doesn't care" detail
The district's relationship to the city is a major story element (the Black Tally, the Watch staying off the duckboards, the Silt-Gate contraband). One small detail in the arrival prose would ground this:

- "The city's paving stops at the drainage cut" already does this, but it could be deepened: "The city's paving stops at the drainage cut, and so does its concern. Past it, no one has swept the lanes in living memory."
- Or: "A city surveyor's marker — a chiseled cross in the stone — sits at the edge of the paving, half-sunk. Someone measured this district once and decided it wasn't worth the ink to finish."

#### 5d. Add one "this was different once" detail
History needs at least one ghost in the prose:

- "The gangway railings are smooth where a thousand hands have gripped them, but the wood beneath is soft — this wood has been here a long time, and it is slowly giving up." — implies the district was built to last and is now failing.
- "One of the tenement doors is painted green. The paint is the original color; the door has been repainted four times since, and the green shows through at the edges." — someone keeps trying to maintain something, which is a more hopeful story than pure decay.
- "The canal wall has a brick in it that is clearly from a older building — a doorway, set sideways, with a keystone that reads a name no one in the district remembers." — the district was built on top of something else.

#### 5e. Use the weekday cycle as economic storytelling
The current weekday descriptions are good but could be sharpened to show economic forces:

- **Marketday:** The eel-seller shorting her scale is already economic storytelling (she cheats because she's poor). Add one more: "The prices are the same as last Marketday, but the portions are smaller, and everyone knows it."
- **Forgeday:** The scrap dealer and smith are working, but add: "The scrap dealer counts his chain by the weight, and today there is less than yesterday." — economic decline over time.
- **Ironday:** The collector's runner checking names is already debt collection, but add: "The list is shorter than it was last Ironday. Some names have been struck through in a hand that is not the runner's." — people have already defaulted or died.
- **Hearthday:** "The district empties early, and the ones who stay home stay because they have nowhere else to go." — Hearthday rest is not a luxury; it's a necessity.

---

## Summary of Priority Actions

| Priority | Action | Section | Effort |
| :--- | :--- | :--- | :--- |
| **High** | Add tactile/body sensations (cold, wet, humidity) to every conditional branch | §1c | Medium |
| **High** | Write 3–4 cross-condition combinations (Dusk+Rain, Night+Fog, Greyday+Rain, Marketday+Clear) | §2a | Medium |
| **High** | Add 2–3 recurring background NPCs with state-dependent behavior | §3a | Medium-High |
| **High** | Break the arrival paragraph's long-sentence rhythm with short lines and dashes | §4a, §4b | Low |
| **Medium** | Add 2+ olfactory layers per state (smell is the weakest sense currently) | §1a | Low-Medium |
| **Medium** | Add 1 "history ghost" and 1 "city above doesn't care" detail to arrival prose | §5a, §5c | Low |
| **Medium** | Rewrite the overcast "else" block (currently the weakest prose in the system) | §4d | Low |
| **Medium** | Add reactive NPC moments (NPCs responding to weather/time) to each weekday block | §3b | Medium |
| **Low** | Add economic-decline details to weekday blocks (shrinking portions, fewer names) | §5e | Low |
| **Low** | Add "built by whom" and "who is leaving" details to arrival prose | §5a, §5b | Low |

---

## Cross-Reference with Design Plan

These recommendations align with and extend the texture pass described in `DREDGE_END_EXPANSION_PLAN.md` §3.4:
- The texture pass addresses **color and word variety** (reducing mud-word stacking). This analysis addresses **sensory dimension** (adding smell, touch, and body-centered sensation the texture pass does not cover).
- The design plan's palette table (§3.4) lists "frying eel, tar, cedar shavings, lamp oil, boiling washing, broth" as smells — these should be distributed across the conditional branches, not concentrated in the arrival paragraph.
- The design plan's "dry places" lever (§3.4) should be reflected in tactile prose: dry stone, dry wood, dry air vs. wet stone, wet wood, wet air.
- The design plan's ambient NPC table (§1, p. 25) is the source material for §3a above — the recurring NPCs should be drawn from these existing ambient figures, not new ones.
