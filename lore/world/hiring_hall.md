# The Hiring Hall and the Hall Insignia

Port Valen's public place for hires, in the east wing of the Council Hall on Civic Heights (formerly "the Open Roll"; renamed 2026-10-06). Clerk Tolliver keeps the Postings window. The Seals window issues the insignia. Claims and Deeds are the other two.

## In the game now [GAME]

- The postings on the wall are paper forms: posting number, both seals, kind of work, pay, term, and where to apply. One standing posting (the Watch patrol) and one per weekday. `pv_ch_roll_read` in `port_valen_civic_heights.txt`.
- The Seals window (`pv_ch_seals`) has two talks, one flag each: what the insignia does (`ch_seals_talk`) and the four rank names (`ch_seals_ranks_talk`). Both feed the "hiring_hall" lorebook entry.
- The rule: a hire is not a hire until both seals, the patron's and the city's, are on the posting.
- The Ironday posting is now an ordinary yard job. It used to name Clerk Elric and the Rotten Rib oak.

## Decided with the user 2026-10-06, not built [AGREED]

- **The insignia:** a palm-sized brass disc, called "brass" on the street. The wearer's name, rank, and the terms of everything they sign are enchanted into the metal. A reader (a stone, a spell, a gate's device) tells what it says. A copy of the shape reads blank. It is not stamped or written: the Seals window's enchanter works the brass. The name "insignia" was chosen over Pathfinder's Badge (a game brand) and Sovereign Crest (a free city has no sovereign, and "crest" already means house heraldry here).
- **Magic is ordinary here.** The world leans high magic. The soldiers who touch their brow when the Cadre passes are individual superstition, not the city's view.
- **Sold by the Seals clerk,** as a one-time licence fee, when a player signs their first posting. The city issues it; nobody else does, Vane included. The amount is not set.
- **Four ranks, kept by the Gilded Scales:** Open, Bonded, Sealed, Named, in that order. Names only. What each rank does is undecided. Four is the Scales' number, not a rule everywhere: other kingdoms may have more ranks or fewer.
- **Signing a posting** means pressing the insignia to the posting's frame, and the terms are written into it. Claims then reads the terms straight off the brass instead of a paper copy.
- **Writs:** the player still buys the Patrician Quarter entry writ (Day or Registered). An insignia is a place to hold the permission so it can be scanned: the clerk asks whether the player has one, and writing the permission onto the insignia is easier than handing over paper. The Inner Gate reads it from the insignia.
- **The device is universal.** It is one disc in every kingdom, like a passport with different pages. Each government writes its own rank onto it, and some governments recognize each other's ranks.

## The first radiant job: Vermin in the House [GAME]

Written and wired 2026-10-06. The job is `web/mygame/scenes/port_valen/radiant/hall_pests.txt`. It is reached from the wall in the Hiring Hall.

- **One job, two tables.** Where: a Middle Ward house most of the time, a Patrician Quarter house rarely (about one block in eight). What: giant rats (two) or a giant snake. The posting says only "vermin in the walls" and names the place, so the creature is a surprise.
- **Picked by the five-day block,** with no random roll and no stored state, so a refresh never changes it. A posting is on the wall the first three days of a block, once per block, at most three jobs in two weeks.
- **The insignia is sold at the Seals window** for 1 silver mark (the clerk's one-time licence fee) and appears in the inventory as "Hall Insignia", rank Open. Signing a posting means pressing it to the frame: `pv_ch_roll_sign`.
- **A signed job stays open three days** (`rj_pest_until`). While it is open, a "Your posting" button appears on the Trunk Road (Middle Ward) and on the Patrician Avenue (Quarter). It opens the posting hub (`radiant/radiant_hub.txt`), which lists the signed job and routes to that job's own file; a new job adds one block there. A Quarter job counts as admission at the Inner Gate (the guard reads it off the insignia), and a finished one ends it with a walk-out.
- **Three ways in:** a stealth check (DC 12) for a surprise round, with random terrain for the fight; a flat DC 10 check plus proficiency bonus to clear the house without a fight (Guidance does not help, through the dice engine's `check_no_guidance` flag); or leave, which is free and keeps the job open. A failed stealth loses only the surprise. A failed clean solve starts the fight with the creature first.
- **The patron is a generated person** (the name generator, `names.txt`): race from the place's mix, gender, name and a visible look, all from the block seed, so the wall, the door and the payment show the same person. Ten buildings (six Middle Ward, four Quarter) are separate rolls; each building's paragraph says what the person is doing, and the look never names a trade. The posting gives the name and the kind of house, never a street.
- **The patron pays at the door:** 4 silver. Finishing writes a job onto the Port Valen page: the counter `hall_jobs_scales`, one counter per government.

## The second radiant job: A House to Be Moved [GAME]

Written and wired 2026-10-07. The job is `web/mygame/scenes/port_valen/radiant/hall_haul.txt`; it is reached from "Your posting" on the Trunk Road through the posting hub (`radiant_hub.txt`).

- **Posting:** up on days 3 and 4 of each five-day block (the vermin job holds days 0 to 2), so the board always has exactly one real job; first posting is block 1, as with the vermin job. Term two days (`rj_haul_until`); it then undoes itself, no penalty. The Greyday flavor posting (0367) is gone, replaced by this job.
- **The work:** three loads, a heavy one, an awkward one and a fragile one, in any order, each with three approaches (muscle, plan, finesse), one check each (DC 10 for the approach that suits the load, 12 and 14 for the others). The player may leave between loads. A failed load breaks something and earns no bonus; it never fails the job.
- **Pay is by the hour worked:** 1 copper an hour (muscle takes one hour, plan two, finesse three), plus 2 copper for each load delivered whole (changed 2026-10-07 from a breakage dock, so the checks earn pay and do not only protect it), plus a hot meal on the patron's back step that clears Hunger. A haul is worth 3 to 15 copper and a meal, by design a small job. Roll first, then the page's one time advance, so Guidance counts.
- **The patron and house** use the name generator the same way as the vermin job (race from the Middle Ward's mix, name, a look that never names a trade); the house is one of four, the item of each load one of two, all separate rolls from the block seed.

## Board rules, decided with the user 2026-10-07 [AGREED]

- **A player may hold several signed jobs at once.** Managing the time is the player's skill, so there is no one-job limit.
- **Every job has a term.** When it runs out it undoes itself: no penalty, no message, and the job is simply gone. The board's pool puts a fresh posting up in its own time. (Pests: three days; each job's lapse is one line in `radiant_hub.txt` `rh_check`.)
- **The board shows at most three real jobs at a time.** Flavor postings do not count and will go as real jobs replace them.
- **Each settlement has its own board of three.** Alderford and Timbermouth, once they run, post their own local jobs; the Hiring Hall's Port Valen counter is the Port Valen page's only.
- **Job types after the vermin job, easiest first:** hauling, night watch (one Cargo Quay warehouse first), escort (needs the roads out), bard (needs a performing mechanic). The three duplicate postings fold in: the seasoning yard watch becomes a second night-watch site, and the Timbermouth escort a second destination.

## Not built yet

Any rank above Open, and anything that reads the counter. The wall's other postings are still read-only flavor. The writ variants (a writ written into the insignia instead of a vellum slip) are not done. The Inner Gate captain's first greeting still says "your writ is in order" to a player who came in on a job alone.

## Open questions

- Which quest is the first signed posting, and so the first to need an insignia. The user plans radiant quests for the postings.
- Whether a rank can be lost, and what a Claims complaint costs. Not important right now.
- What each rank does, and how a rank rises. Not important right now.
- The licence fee amount (the user suggested 1 silver mark).
