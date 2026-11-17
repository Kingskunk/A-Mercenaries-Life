# Backdrop Art Workflow

How a place gets its backdrop picture. It covers the house style, the two ways to make the pictures (with an image tool, and by handing a prompt to the designer), and the steps to register them. `CONTENT_WORKFLOW.md` 1.4 and 2.6 point here for the "Backdrop picture" row.

Nothing here is canon until the designer approves it.

---

## 1. House style (read from the existing backdrops)

Sources studied: `Wallpaper/Oxworth_Salting_Yard_Day.jpg` and `_Night.jpg`, `Village_Green_Day.png`, `Fallowmere_Pond_Green_Day.png`.

- **Look:** realistic and detailed, like a still from a gritty historical drama. It is a photo-real painting with no cartoon outlines and no fantasy glow.
- **Setting:** a pre-industrial English-style countryside. Stone, timber and wattle, thatch or moss-grown tile, packed-earth lanes, drystone and wicker fences.
- **Wear:** everything is used: moss on roofs, leaning posts, mismatched wood, scattered everyday objects (barrels, hides on frames, baskets, a cart, a well). **The ground is dry and neutral.** No wet mud, no puddles, no standing water, and above all no cart-wheel or tyre-like ruts, double parallel tracks or tread marks. The game draws weather itself (a greyer, dimmer picture, with sound), and the ground's wetness comes from the scene prose, so a picture that shows recent rain or a wet season dates itself and contradicts every other weather. A lane is packed earth or gravel with scattered stones, a few faint footpath lines, tufts of grass at the edges, and worn patches, never a rutted road.
- **Palette and light:** muted and natural. Soft overcast daylight is the default, with grey-white sky, olive and ochre greens, brown earth and grey stone. The Village Green and Fallowmere pictures have a little warm sun. Colours are never saturated.
- **Camera: first-person POV (designer, 2026-11-16).** The picture is what the player sees standing in the place, not a landscape painting seen from above. The camera is at standing eye height, about 1.6 m (5 ft 5 in) off the ground, looking level or very slightly up or down. It is never a bird's-eye, hilltop-overlook or drone view, and the horizon sits about mid-frame. Depth comes from near objects at arm's length to a few paces (a fence post, a trough, the lane under your feet), the place at 10 to 30 paces, and a short, hazy distance behind it. Buildings are seen from the street and tower over the frame edges, so rooftops are seen from below, not from above. No view down over a whole village. The lane or path leads the eye in from the bottom of the frame, as if you were about to walk it. Use a natural lens, about 28 to 35 mm, not an ultra-wide or fisheye distortion.
- **People:** none. No figures, no animals as the subject (a few geese in the distance are fine). Life is shown by smoke from chimneys, laundry, carts and tools.
- **Markets and settlement specialties:** A settlement's specialty shapes the scenery, but must not define or monopolize it. A market in a salt, olive, wool, or timber settlement still shows ordinary everyday trade — vegetables, grain, bread, stone, wood, metal, cloth, and provisions — with the local specialty mixed in as one part of the stalls and crates rather than every stall selling the same single commodity.
- **No text:** no signs with legible words, no logos, no watermark, no border.
- **Format:** 16:9 landscape. Existing files are 1376x768 (jpg) or about 1672x941 (png). Make new ones at least 1672x941. PNG preferred.
- **Day and night pair:** the same view. The night picture is the day picture with the light changed, so the two blend into each other as the clock moves. Night is a blue-grey moonlit scene with a few stars, a pale moon haze and warm lamplit windows. The ground stays dry. **Also ask what changes at night besides the sky:** keep the camera, buildings, trees, lane, and permanent fixtures in the exact same place, but clear away daytime-only activity—for example, in a market, clear all food, produce, cloth, jars, baskets, and scales off the trestles and fold or tie down the canvas awnings so goods are not left sitting out overnight.

Interior places (an inn room, a hall) may be a **single** picture with no night partner. The page darkens it at night.

---

## 2. Decide before making

Ask the designer:

- Which place is it, and which existing picture key could it already use? A generic picture (`generic_village_gathering_hall`, `generic_tavern_inn`) is fine for a plain place. A signature place gets its own pair.
- The things that must be in frame, taken from that place's scene prose. The picture may show nothing the prose has not said, and the prose may not name anything the picture does not show.
- Day and night pair, or a single.
- **Sound bed (`web/mygame/ambience.js`):** Tell the designer which existing sound bed the place will use (such as `village`, `tavern`, `langston_hall`, `open_road`, `shop`) and what it plays by day and night, or ask whether the place needs a new sound file in `Sounds/`. Do this when choosing the backdrop so sound is never forgotten.

Name files `<Name>_Day.png` and `<Name>_Night.png` (or a single `<Name>.png`) in `Wallpaper/`. The key is the lower-case name with underscores (`Palmcote_Olive_Yard_Day.png` becomes `palmcote_olive_yard`).

---

## 3. Path A: an image tool is available

1. **Write the day prompt** from the template in section 5, filled in from the place's scene prose. Quote the prose details that must appear.
2. **Generate the day picture** at 16:9. Make 2 to 4 candidates.
3. **Check each candidate against the style list** in section 1 before showing anything. Reject any shot from above or from a hilltop overlook, with the horizon high or low in the frame, or with rooftops seen from above, as well as any with people, text, bright saturated colour, fantasy glow, a cartoon look, wet mud, puddles or any rut or tyre-like track, single-commodity markets that omit everyday goods, or objects the prose contradicts.
4. **Show the designer the best one or two.** Do not continue until one is picked.
5. **Make the night picture by editing the chosen day image**, not by generating a new scene. Give the tool the day image and the night edit prompt from section 5, and explicitly specify anything that packs up or shuts at night (e.g., cleared market stalls with no goods left out). Reject any night picture where the buildings, trees or the lane have moved.
6. **Save** both to `Wallpaper/` with the names above. Ask before overwriting an existing file.
7. **Register and build** (section 4).

If the tool cannot take an input image for the night edit, use Path B for the night picture and give the designer the exact day picture's file name to attach.

---

## 4. Register and build (either path)

1. Put the files in `Wallpaper/`.
2. `SCENE_PLACES` in `web/mygame/scenery.js`: the scene path and the picture key (`"hartwell/palmcote/palmcote": "palmcote"`). If the picture has a different name, add a line to `ALIAS`.
3. A hub tile name is matched by `ALIAS` as well (`oxworth: "village_green"` is the example), so give the Palmcote tile its own line when the hub gets a picture of its own.
4. **Sound (`web/mygame/ambience.js`):** Add the place key to `ALIAS` pointing at its chosen bed (e.g. `palmcote: "village"`), or add a new `SOUND` entry and run `node tools/make_ambience.js` if a new `.mp3` was placed in `Sounds/`.
5. Run `node tools/gen_ui_art.js --scenery`, which writes `scenery/*.webp` and `scenery-data.js`. Then `node compile.js` (ask the designer first, compiling is their step).
6. Check: open the place and watch the day, dusk and night blend, and listen that the right sound bed plays. A key with no pictures or sound is silently ignored, so a typo shows or plays nothing.

---

## 5. Prompt templates

### 5.1 Day picture

```
A wide 16:9 cinematic landscape of [PLACE]. Realistic, detailed, gritty historical-drama still, photo-real painting, no cartoon outlines, no fantasy glow.
Setting: a pre-industrial English-style countryside village. [KEY DETAILS FROM THE SCENE PROSE: buildings, materials, objects].
Camera: first-person point of view, as if the viewer is standing in the scene at standing eye height (about 1.6 m), looking level, with a natural 28 to 35 mm lens. Not an aerial, overlook or bird's-eye view. Near objects at arm's length to a few paces ([FOREGROUND]), the place itself at 10 to 30 paces ([THE PLACE ITSELF]) and a short hazy distance of [LAND/HILLS] under [SKY]. Buildings are seen from street level and the horizon is about mid-frame. A dry earth lane leads the eye in from the bottom of the frame.
Light and colour: soft natural daylight, muted palette of olive and ochre greens, brown earth, grey stone and weathered wood. Nothing saturated.
Everything is worn and used: moss, leaning posts, scattered everyday objects. Smoke from a chimney. The ground is dry packed earth with a few scattered stones and tufts of grass: no mud, no puddles, no wheel ruts, no tyre or tread tracks, no parallel tracks.
No people. No text, no readable signs, no logo, no watermark, no border.
```

### 5.2 Night picture (edit of the day picture)

```
Use the attached image as the exact scene. Keep the camera, composition, buildings, trees, lane and permanent fixtures in exactly the same place and shape. Change the lighting to night: a deep blue-grey moonlit night with a few faint stars, a pale moon haze in the sky, dark hills, cool shadows. The ground stays dry, with no puddles or reflections. Windows and doorways glow with warm lamplight. [IF APPLICABLE FOR THIS PLACE, STATE WHAT PACKS UP AT NIGHT: e.g., For a market, clear all food, produce, cloth, jars, baskets and scales off the trestle tables so the stalls stand bare or folded/sheeted for the night, leaving only empty tables, stacked empty crates and barrels.] No people, no text, no watermark.
```

### 5.3 One-line style anchor (to paste ahead of any prompt)

```
Realistic gritty historical-drama still, pre-industrial English-style countryside, muted natural palette, soft overcast or low light, worn weathered textures, first-person standing eye-height view (about 1.6 m, 28 to 35 mm lens, not aerial), 16:9, no people, no text, no watermark.
```

---

## 6. Path B: no image tool, prompts for the designer

Give the designer all of this together, and nothing else:

1. **The place** and what it is for, in one line.
2. **The day prompt** (5.1, filled in).
3. **The night prompt** (5.2), plus the instruction: "Generate the day picture first. Then attach it and run the night prompt as an image edit, so both pictures show the same view."
4. **The file names** to save them as and the folder (`Wallpaper/`).
5. **The pass list**: no people, no readable text, same view in both, at least 1672x941.

Then wait. When the designer says the files are in, do section 4.

If their tool cannot edit an image, offer a fallback: generate the night picture from the same prompt with the lighting words changed and a fixed seed, and warn that the two views may not match. The designer decides whether to accept that.

---

## 7. Palmcote: ready-to-use prompts

Place details come from `palmcote.txt` (place layer). The tile is `pc`, so it gets its own pair, key `palmcote`. The gathering hall, inn and olive yard are decided when each place is built.

### 7.1 Palmcote hub, day (`Palmcote_Day.png`)

```
A wide 16:9 cinematic landscape of a small hillside olive-grove village. Realistic, detailed, gritty historical-drama still, photo-real painting, no cartoon outlines, no fantasy glow.
Setting: a pre-industrial English-style countryside village on a steep south-facing slope. A single steep dirt lane climbs the hill between houses of pale stone with red clay tile roofs, stepping up one above another, each with a bench by the door and a wall of drying baskets. Low drystone terrace walls hold the hillside in terraces, every terrace planted with old olive trees with thick knotted trunks and grey-green leaves. Near the foot of the lane, a long building with a wide porch with a plain notice board beside its door. Just above it, a low inn with a green leafy branch hung over the door. Where the lane bends, a round stone well under a small tiled roof with a rope and wooden bucket. A flat yard of beaten earth with stacked wicker baskets, a row of wooden carts and a small stall with clay jars. At the very top of the hill, behind a high stone wall and a line of dark cypress-like trees, a large grey stone manor house with many windows, seen small and far away.
Camera: first-person point of view, as if the viewer is standing on the lane at standing eye height (about 1.6 m), looking up the slope with a natural 28 to 35 mm lens. Not an aerial, overlook or bird's-eye view, with the horizon about mid-frame. Foreground of a dry lane edge and a stone wall within arm's reach, the village houses and the well at 10 to 30 paces rising up the slope, and the small manor high above the terraces, partly hidden by trees, under a soft overcast sky. The lane leads the eye up the hill from the bottom of the frame.
Light and colour: soft natural daylight with a little warm sun breaking through, muted palette of silver-green olive leaves, ochre earth, grey and cream stone and weathered wood. Nothing saturated.
Everything is worn and used: moss on the walls, leaning posts, scattered baskets. Thin smoke from a chimney. The lane is dry packed earth and gravel with scattered stones, tufts of grass at its edges and a few faint footpath lines: no mud, no puddles, no wheel ruts, no tyre or tread tracks, no parallel tracks.
No people. No text, no readable signs, no logo, no watermark, no border.
```

### 7.2 Palmcote hub, night (`Palmcote_Night.png`)

Attach `Palmcote_Day.png` and use the night edit prompt from 5.2. Add this line to it: "The inn and a few house windows glow warm. A single lamp burns by the well. The manor at the top of the hill shows a few small lit windows."

---

## 8. Decisions (designer, 2026-11-16)

- Palmcote reads muted and English-looking, like the other villages. The olive terraces and clay tile stay, but the colours do not.
- The manor is in view on the hub picture, small and far away.
- The designer approves every candidate before it is used.
- **Rut and wet-ground ban (designer, 2026-11-16).** Existing backdrops show wet tyre-like ruts in nearly every village. New pictures must not, and the ones that do are a separate clean-up the designer has not asked for yet.
- **First-person POV (designer, 2026-11-16).** The Palmcote hub pair was made before this rule and is a raised three-quarter view of the village. It stays for now. Every picture after it follows section 1's camera rule. Redoing the hub in first person is the designer's call.
