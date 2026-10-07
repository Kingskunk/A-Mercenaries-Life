# Sergeant Varren

Drillmaster of the Vanguard and sergeant over the company's common soldiers. A massive, scarred veteran who turns green recruits into soldiers who do not break the shield wall. Hard, short on words, and fond of nobody, though his file is the one thing he never lets fall.

This file gathers everything the game says about him, plus what was built this session. The Redfort numbers and the armory are new; the rest is older. Nothing here is invented beyond the tagged lines.

## In the game now [GAME]

**Appearance:** "a massive slab of a man, gone thick and hard with age rather than soft." Half his face is a crosshatch of old siege-scars that pull his mouth into a permanent, humorless line. Close-cropped grey stubble, a nose broken at least twice and never set straight, and one milk-pale eye that does not track quite right in bad light. Blackened chainmail, spit in the mud, a voice like flint. The intake scene calls him "an ill-tempered bear."

**Manner:** gruff, impatient, exact. Praise is a single grunt or a nod; "remember that stance tomorrow" is as warm as it gets. Calls recruits "greenhorns" and "recruit." He watches with the good eye while the pale one lags.

**Where the player meets him, in order:**
- Intake (`company_intake.txt`): kicks the armor barrels over and roars at the recruits to arm themselves. If the player's origin is Ashbrook (`flashback_village`), it was Varren, at a crossroads waystation, buying bodies for the company "with the Baron's own stolen silver." He slid a bowl of mutton stew and an iron shilling across the table: "Eat, boy. Then put your thumb on the parchment. The Carrion doesn't ask who you killed, and the Baron's dogs don't search our baggage trains." The clerk adds: "Varren likes stacking [dwarves] in the front rank."
- Alderford march (`alderford.txt`): stalks the Vanguard column inspecting weapon frogs and boot-bindings. "Fourteen miles of marsh mud will rot your leather and rust your iron." The sentry at the command tent says he takes company grievances at the third watch. He leads the Vanguard onto the middle pier at the flotilla.
- Camp night (`camp_night.txt`, `visit_varren`): at his fire under the Carrion banner. Respect +6 or +2 depending on how the player answers (reading the causeway, the drill, the truth). Sets `prep_varren_drill`, which gives the dawn trial a stance bonus, and `visited_varren`. His line to a wizard who reads the ground: "Not as dull-witted as you look. Keep your files tight and don't get flanked in the reeds."
- Dawn trial (`dawn_trial.txt`): "You're mine," not a threat, and he sends Vanguard recruits at a practice post with a shield. Respect +6 or +2.
- Black Sinks: checks straps and grips along the Vanguard ranks himself, then drives them up the causeway ("VANGUARD, ADVANCE!"). Afterwards he sends the player on errands to Kestrel and Ysolde, and his guardroom is where the straightened bodkins go.
- Port Valen drill square (`pv_poi_carrion`): Vanguard players train under him. His talk changes with training sessions: "You haven't been on my ground yet", "Your feet are learning, your head isn't there yet", "Better", "Nearly", "That's the yard finished with you."
- Vane's summons (`port_valen_vane_summons`): Vane quotes him ("Varren says you moved a Gilded Scales bailiff off Talia's curing loft"). Hands off to him: "You're off the muster roll, not off Varren's. If you want a second opinion on a fight, or gear from the company stores, find him in the armory shed."
- The armory shed (`pv_poi_armory`, built 2026-10-06): see below.

**Fixed in the lorebook (`lorebook-data.js`, "varren"):**
- Vanguard drillmaster and frontline sergeant who turned green recruits into soldiers, working from the munitions barrels at intake, the banner watch at night and the practice post at dawn.
- `prep_varren_drill`: his doctrine, drilled into every file: keep your files tight, keep your feet dry, do not get flanked in the reeds, keep grease on your iron. He ran the Vanguard line himself before a fight, checking straps and grips.
- Vanguard squad: the terms are front line, shield to shield, "first to bleed and first to get paid for it."
- `varren_advice_told`: four things: keep your feet dry, keep your iron clean and learn to mend it yourself, keep your file tight, and don't be caught on the open side. Everything else is those four things said slower.
- `varren_redfort_told`: forty in his file at the Redfort siege, eleven came out. He won't give the names and drills the next file harder.

**The armory shed (new this session):**
- A long timber shed against the seawall. Spear racks, mail on pegs, a brine trough, a grindstone behind a plank partition with an apprentice armorer, and a bench of straps, buckles and a half-mended shield rim.
- Staffed: a corporal with a notched tally-board at the door. Varren sits at the bench mending a shield rim. Open to every squad after the morning drill (Afternoon and Dusk); out on the drill square in the morning; shut at night.
- Talks, one flag each, no regard changes or rewards: advice (`varren_advice_told`, reads the camp-night visit back), Alderford (`varren_alderford_told`, currently only the Maura's cellar callback: "That's how much I hate cellars"), Redfort (`varren_redfort_told`, needs regard 10).
- He mends gear by hand, as any veteran does, and is not a smith. The armorer behind the partition does anything that needs a fire.

**Regard sources** (`varren_respect`): the camp-night fire (+6 or +2), the dice game (+4), the gear-dressing with Rorik (+2 each), the dawn trial (Vanguard only, +6 or +2), and two Sinks bivouac events (+2 each). Totals not computed; the Redfort threshold of 10 looks reachable for anyone who goes to his fire.

## What is established about his life

- **Redfort:** a winter siege of about three months. The ground froze so they couldn't dig, they couldn't light fires because the enemy would range the siege engines on the smoke, and by the end they were boiling harness leather. The Baron's steward haggled over the siege bounty while it went on. Forty of Varren's file went in; eleven came out [GAME, built this session]. He never says the names.
- **Odessa:** the company surgeon cut the rot from a pike-veteran's leg at Redfort with a boiled nail-knife and the last of the spirits (bivouac gossip, `battle_black_sinks.txt`).
- **The archer's brother:** a Scout archer says "Varren drilled my brother's file before Redfort. Brother came home. Half his file did not. Sergeant never speaks the names. He just drills the next file harder." That is the source of the "never speaks the names" line [GAME].
- **Three files, one marched (shown in the armory):** he drilled three files for the Redfort siege and marched only one into the trench himself, the forty. The archer's brother was in one of the other two, which lost half. That reconciles the two numbers.
- **Vane at Redfort (shown in the armory):** Redfort was a company contract. The Baron's steward haggled the bounty down the whole winter, and Vane paid the file out of the company chest anyway; the Baron's coin came three months late. That is why Varren follows him. It matches the bivouac gossip: "Vane might be cold as well-water, but his coin-weights are honest."
- **Ashbrook:** he recruits at roadside waystations and does not ask what a recruit has done. For players from Ashbrook, he is the first person to feed them after the Baron's bailiffs burned the village.
- **Before the Carrion:** nothing is written, and that is deliberate. He is about mid-fifties, and "siege-scars" fit Redfort.

## Deliberately unwritten [AGREED]

Decided with the user 2026-10-06, not yet shown in any scene:
- **The baron at Redfort is Baron Karr.** Karr's steward shorted the company at Redfort. Years later Varren buys recruits at Ashbrook "with the Baron's own stolen silver", which reads as quiet payback. The scenes only say "the Baron", so Karr is not named to the player yet.
- **The rank anchor:** Vane once asked him to be named his second, and he refused: "A sergeant stands where his file can see him." He is still among the three who would take command if Vane fell.
- **Company structure:** below Vane there are no officers. Varren, Ysolde and Kestrel head the three units (Vanguard, Cadre, Scouts) and are the only people close to Vane in rank. If Vane died, one of them would take the company. "Sergeant" is his title, not a lower rank than theirs.

Still unwritten: where he was born, whether he served anyone before the company, his family, and what he does after Redfort.

## Reveal ladder

1. Intake and the march: manner and presence.
2. Camp-night fire: his doctrine, and how he sizes a recruit up.
3. Dawn trial: "You're mine."
4. Drill square (Vanguard players): the sessions talk.
5. Armory, any regard: the four things. The Alderford callback.
6. Armory, regard 10: Redfort.
7. **Not written:** anything past Redfort. His assignments to the player (quests), the Watch, and whatever he thinks of the contract with the city.

## Voice

Flint. Short sentences. Practical images from gear and ground ("Rust doesn't care that you're tired"). Dry humor that arrives as a deadpan reply, not a joke ("That's how much I hate cellars"). Silences are part of the speech: a hammer that does not fall, a pause before the number. Contractions always. He never explains a feeling; he gives an order or hands over a buckle ("Hand me that buckle... Now we're doing something useful").

Examples that work:
- "Keep your iron clean. Rust doesn't care that you're tired."
- "That's the one that kills you."
- "Everything else is just finding more expensive ways to learn them."
- "I remember them. That's enough."
- "Sergeant who doesn't hear things usually ends up surprised. I don't like surprises."

## Relationships

- **Vane:** his captain. Varren reports on recruits to him and Vane quotes him back. He saw Vane keep faith at Redfort when the Baron did not. Varren refused to be named Vane's second.
- **Ysolde and Kestrel:** the other two unit heads, his equals in rank. No rank sits between any of the three and Vane.
- **The Vanguard:** his file. "First to bleed and first to get paid for it."
- **Lyra:** a Vanguard archer in his file; he puts the Vanguard on wharf duty at dawn.
- **Kestrel:** he sends the Vanguard's dispatch board and arrow bundle out to her skiff. No friction written.
- **Ysolde:** no direct line.
- **Odessa:** the surgeon who cut a pikeman's leg at Redfort, so she was there too.
- **The Watch:** the company's four hundred soldiers reinforce the Watch's patrol rosters, under Captain Brask's terms (no private collections, no unsanctioned arrests, no settling old debts under city colors). Varren's file is the one on the street.
- **The player:** `varren_respect`. He likes people who ask about the ground and keep their feet dry.

## Quest direction (nothing decided)

The user wants Varren's work to be soldier-focused: the Watch, possible fights, and unsolved crimes the Watch cannot solve that are valuable to the Company. The first errand would be planted by Vane's summons and handed over in the armory, small, with a bigger job only if the player asks. Chosen so far: none. Rejected: the watchman killed in an alley behind a tavern. Other ideas mentioned in discussion, not chosen: patrols ambushed on the lower landing-stairs, stolen armory weapons surfacing in Dredge-End, and the string of murders the Watch suspects is magic (`quest/Quest.md`).

## Open questions

- Whether to name Karr to the player in the Redfort talk, or leave "the Baron."
- The armory's Alderford talk has only the Maura's cellar callback plus a Sinks fallback (spared or not spared the deserter). The river boom, mooring pins, the Rennick bailiff and the chapel grain were cut.
- Where he was born and who he served before the company.
