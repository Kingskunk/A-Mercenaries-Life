# Implementation Plan: The Iron Wharves — The Sitting Barge

**Status:** design spec. **Not yet implemented.** As of this document, no code exists for this quest: `port_valen.txt`, `startup.txt`, and `quest/QUESTS.md` are untouched. This file is the build contract for the implementation pass that follows; the ChoiceScript excerpts in §6 are written to be lifted verbatim, and the beat prose in §6 is specified beat-by-beat so the implementation pass writes full text to this outline, not to taste.

**Precedent:** follows `quest/SLIP_THIEVES_PLAN.md` (which follows `quest/RUSTY_ANCHOR_PLAN.md`) in structure and standard. The Anchor postmortem's hard rules are inherited wholesale — nobody is furniture, arithmetic must survive contact, no firearm, no dead-end failure, no un-earned payout.

**Scale, declared up front (per `QUEST_REQUEST_TEMPLATE.md`):** down to earth, **one-shot, not faction-altering**. The player is a fresh arrival in Port Valen doing street-level work. Every payout sits inside Rules §3's 1–5 silver street band, with one in-kind underworld exception priced against §3's dirty-coin rule (§7). No faction reputation moves on any route.

**Names:** the **yard foreman** (grey-braided, already established unnamed at `port_valen.txt:1815`/`1850` — he stays unnamed in scene until a future quest names him, matching the Slip plan's Odo discipline), the **barge master "Corvel"** and his **cousin with the punt** are placeholders. No label or variable embeds a name, so renames are text-only. The **Scales basin clerk is deliberately never named and never directly addressed** — strict subjective POV, §1: the player learns his arithmetic from charter paper, not from the man.

---

## Why this quest exists

1. **It gives the Iron Wharves a quest without building a new POI.** `pv_poi_drydock` (`port_valen.txt:1725–1857`) is the harbor's richest ambient POI and its only one with no interactions — the Slip Thieves plan exists to build the Fishmongers' Slip; this plan exists to give the drydock a reason to be visited twice. Zero new menu lines, zero new scene files, zero `compile.js` changes.
2. **It makes two existing ambient lines playable.** Greyday night already says "heavy coal barges ride low in the yard basin, their night-tenders smoking clay pipes under tarred awnings" (`port_valen.txt:1776–1777`); Tideday day already stages a launch — "launch crews work capstans to ease a freshly caulked river barge off its greased ways into the foaming channel amidst cheers" (`port_valen.txt:1836–1837`). The tell and the deadline are both already on the page; this quest connects them.
3. **It fills a gap between the Slip Thieves (1–2 silver) and Silt-Gate (12–20 silver)** without touching faction rep — the Slip plan explicitly notes nothing sits between Crane Three's wage loop and the municipal contract. This quest's top lawful payout (5 silver, night-skill-hazard rate) is the band ceiling, and its underworld payout is in-kind cargo, not coin.
4. **It practices the Anchor's tide-deadline grammar on a work problem, not a burglary.** The ebb-wait choice (`anchor_ebb_ready`, `port_valen_dredge_end.txt:1063–1085`) is one of the game's best beats; here the same physics runs the other way — waiting for *low* water to reach a seam, racing the *returning* flood.

**What this quest deliberately is not:** not a paper-skim reveal (used twice already — Anchor Layer 3, Slip's count-man; a third would read as a formula). The barge master's overload *is* discoverable, but it is a working man's lie about a load, not a district-wide ledger scheme. Not a Rumor-3 debtor story — that cargo belongs to the Slip plan; the Iron Wharves' chained-hull lore stays untouched here (one unspoken recognition beat, §6.4, never quoted).

---

## The pitch, in one breath

A coal barge tied in the yard basin is sitting a hand lower than her drowned tar-line — her master overloaded her to make a quarter-day payment to the Gilded Scales' counting house, and she has sprung a garboard seam. If she goes down where she lies she fouls the slipway sill and kills the Tideday launch; the foreman wants her lightened and caulked before the flood tide comes back, off any slate he signs, because the yard works under the Scales' river-serpent standard and he cannot be seen paying his own men to touch a charter that might drown.

---

## 1. The organic start — and the badge rule

**The earlier draft of this pitch broke Rules §1 and was fixed before this document was written; the fix is recorded here so it isn't undone at implementation.** The draft had the foreman hire the player *because* they wear a raven badge ("a raven can't be tied to the Scales"). That is faction recognition driving the quest grant — §1's explicit ban, and the exact failure `QUEST_REQUEST_TEMPLATE.md` item 7 exists to prevent. The compliant precedent is Crane Three: Dell hires an **outside hand exempt from the dock crews' turf and solidarity norms** (`QUESTS.md`), a liability-and-logistics reason that never mentions the player's colors.

**As designed:** the foreman's hiring logic is, in his own words — *"Not my men. Any yard hand I put on her signs the yard's name to her, and come quarter-day the clerk reads signatures."* He needs an unattached stranger with no slate in the yard and no wages the Scales can garnish. The badge is irrelevant to the offer. The existing `"Ravens pull"` ambient (`port_valen.txt:1852`) stays untouched as passing color — and the quest path is **identical for squadless players**.

**The trigger (environmental tell, never a noticeboard):** on any visit to `pv_poi_drydock` where `day_of_week = "Greyday"` and `time_period` is Night/Pre-Dawn (or Dusk in rain), the ambient prose gains one conditional beat before the menu-return: the night-tenders at the low barge are not smoking — one is sounding her with a boathook, chalking depth-marks on her post, and the two of them are arguing low and stopping when you get close. The player is offered a `*choice`: *approach the foreman under the customs-gate shelter* / *ask the tenders about the low barge* / *keep walking*. **The offer only exists because the player walked up.** If nobody asks, the foreman hires nobody — his self-preservation never overrides the arithmetic that made him unable to ask his own crew.

**The deadline derives itself from `day_of_week` rather than a new timer** (the Anchor's Forgeday-lien pattern, `port_valen_dredge_end.txt:1043–1046`): the launch is the *next Tideday*, and the work has to happen on a night ebb before then. Greyday → Hallowday → Ironday → Tideday gives the job three days of slack, which is pressure without a countdown mechanic — the same narrative-only deadline the Anchor ships today.

---

## 2. The cast, rebuilt

(Anchor postmortem rule: no victim furniture. Each actor has resources, an arithmetic, and a private ledger.)

### The foreman (established; unnamed in scene)

| As the yard ambient shows him | As designed |
|---|---|
| "Ravens pull," a slate and a nod | A man one drowned barge away from a lockout and a hearing |
| A quest-giver | A liability calculator. He understates the job ("lighter work, wet boots"), pays from a petty slate that answers to nobody, and refuses in advance to write anything down |
| Someone with the Scales' ear | Someone whose entire position exists at the Scales' pleasure — the yard works under their standard, and quarter-day reads signatures |

Design notes: he lies by omission, not invention — everything he says is true, and the seam is worse than he says. He is the only actor in the quest who never once mentions the Scales' name out loud; he calls them "the standard" and "the counting house," and the player who has heard Rumor 3 or visited the Upper Wharves recognizes the shape without being told (continuity §4: recognition, never assertion).

### The barge master — "Corvel" (placeholder)

| As he tells it | As designed |
|---|---|
| An honest riverman done wrong by a bad seam | A small independent coal-hauler who overloaded one cargo to cover two charters, because quarter-day takes both |
| A man whose boat is simply unlucky | A man whose boat is the only asset his debt hasn't reached yet — the counting house holds his charter paper, not his hull |
| A liar when cornered | A liar about small things (the load, the draft, whose coal is whose) and truthful about large ones, because large truths are all he has left to trade |

Design notes: resourceful first, ruined second. His resources: a cargo of wet coal worth real money to somebody, a cousin with a punt, and a charter paper he keeps in an oilskin against his ribs that proves the overload was arithmetic, not greed. He will spend the cargo and the cousin before he spends the paper. **The sounded marks don't lie even when he does** — information integrity, Rules §2/§4: the player only learns the overload truth by reading the chalk depth-marks (`[WIS DC 11]`) or making him show the charter (`[CHA DC 12]` after his first lie is caught), never by deduction asserted for them.

### The basin clerk (never named, never addressed)

* The Scales' man who walks the basin on quarter-day with a brass stamp and a ledger. He exists in this quest as a **silhouette and a signature** — the player sees him exactly once (a dusk walk-past, if the quest is still active), counting hulls.
* His arithmetic: a barge "lost at the bar" pays the guild's loss-book and ruins Corvel at a stroke; a barge *saved* pays the charter and chains him to it for another quarter-day (Rumor 3's shape, unspoken). Neither outcome requires the player to exist. He is pressure, not villain, and the quest never gives him a scene with dialogue — the Anchor's Riker-note engine, inverted: this time the paper is the only voice the faction gets.

### The cousin with the punt (offstage until the riverman route)

One scene, one function: he is the reason the underworld route is physically possible (a night warp-out needs a second hull's line), and he is the reason it is witnessed (the pier's tally-stick watchers count his skiff, `port_valen.txt:1919` — the district remembers, via flag, not rep).

---

## 3. Beat structure (five beats, ~45–60 min total across visits)

### Beat 1 — The tell (`pv_drydock_barge_tell`, inside `pv_poi_drydock`)
Conditional ambient (Greyday night/dusk-rain only, quest stage `"unstarted"` or `"declined_pending"`): the sounding-line argument. Player-initiated approach. Either approach lands the same conversation with different openings: the foreman gives the job in two sentences — the barge, the sill, the launch, "five silver when she's riding her marks again, and no slate gets your name." The tenders' route gets the master's side first (Corvel is *aboard*, sleeping in her cabin, and not fond of questions), then the foreman anyway — one job, two doors into it, per §1's dual-origin rule.

* Stage flips `"unstarted" → "offered"`. The player may decline; declining re-arms the tell on subsequent Greyday nights until accepted or the launch passes (§10.2).
* No time cost beyond the POI's own 15-minute entry — conversation is free (Rules §5).

### Beat 2 — The survey (`pv_drydock_barge_survey`, ~30 min, once)
Corvel's deck at dusk. His lie about the load is the default; the truth is on the post in chalk. One archetype check **decides what the player knows, not whether the quest proceeds** (fail-forward: a failed read leaves the marks unread but the job still on — the foreman's pay doesn't depend on the master's honesty, and the *routes* don't lock until Beat 4):

* **WIS/INT** (`Insight DC 11` / `Investigation DC 11`) — read the depth-marks: her winter waterline is drowned by a full hand. Sets `barge_overload_known true`.
* **CHA** (`Persuasion DC 12`) — catch the lie aloud ("Your coal's riding below her marks, master") and make him show the oilskin charter. Same flag, plus `barge_charter_seen true` — the paper proves the *counting house's* renewal terms caused the overload, which is leverage in Beat 4's riverman route.
* **STR/DEX** — no check; a hands-on survey (sounding the seam by arm and mallet) grants `barge_seam_mapped true`, which grants advantage on the Bilge beat's DEX/STR options. Muscle and finesse learn the *hull*; wits and words learn the *debt*. Both are true knowledge, per Rule of Three.
* **Arcane:** `[Light]` (read the marks in the dark without a lantern anyone can see — also sets the overload flag), `[Thaumaturgy]` (still the water in her bilge for one honest minute — same flag), with the standard 9-slot guard chain and full class/origin coverage.

**The ebb decision lives at the end of this beat:** work the flooded seam tonight at the turn (`barge_ebb_ready false` — more water, more risk, job starts now) or wait for the low water past midnight (`barge_ebb_ready true` — safe floor, but the night is spent and the beat costs hours). Direct reuse of the `anchor_ebb_ready` grammar, inverted stakes: the Anchor's ebb *revealed* the work; this ebb *permits* it.

### Beat 3 — The bilge (`pv_drydock_barge_bilge`, ~30–45 min, the set-piece)
The work beat, five approaches at full archetype parity, each with its own fail-forward:

* **STR** (`Athletics DC 12`) — dunnage relay and pump-pause rhythm; failure still clears her but the last lift tears a knuckle-ridge of caulking loose: 2 HP through `stat_bump_locked` (Crane pattern, `port_valen.txt:1553–1557`), seam caulked but ugly (`barge_seam_ugly true` — one line of aftermath prose, no mechanical tail).
* **DEX** (`Acrobatics DC 13`, advantage if `barge_seam_mapped`) — work the flooded garboard seam from inside, by feel, on the ebb; failure drops the lamp into the bilge and costs the timing advantage — the seam still gets caulked, but at the flood's edge. A *second* DEX failure (only reachable after the lamp-drop, never on a first attempt) arms the grounding fail-forward below — no dead ends.
* **INT** (`Investigation DC 12`) — read her strakes like a shipwright, find the seam's working length before cutting, caulk once instead of twice; failure burns the night on the wrong strake and costs a visit (the job resumes next ebb, `barge_ebb_spent true`).
* **CHA** — there is nobody to talk *past* the player inside a hull; the CHA option in this beat is **commanding the tenders** — they know her lines better than anyone, and one of them will work for a coin the foreman didn't authorize (`Persuasion DC 12`); failure means they decline and stay ashore, and the player works alone (DEX/STR line at disadvantage, job still winnable).
* **Arcane:** `[Mending]` seals the split dunnage plank that's keeping the pump caulk from biting (auto-success on the DEX line's failure path — the cantrip is the recovery), `[Light]` as in Beat 2, `[Mage Hand]` holds the lamp where two hands are needed (DEX line without the lamp-drop risk).

**Fail-forward anchor (the design's signature beat):** if the seam lets go mid-work (the second DEX failure, or a Storm-weather roll inside the beat), she doesn't sink — she **grounds on the sill mud at half-ebb**, settled on her bilge with the tide falling out from under her. New problem, harder fix: the warp-off becomes the whole of the recovery path's problem, the foreman's pay drops to 3 silver ("grounded, not saved — the slate reads what happened"), and nobody drowns. The job stays winnable from the grounding; it is simply worse in every direction, which is what failing forward means here.

### Beat 4 — The ledger morning (`pv_drydock_barge_ledger`, ~20 min, the payoff negotiation)
Whatever happened in the basin, quarter-day is coming and the clerk's walk-past is the moment every route's cost gets priced. This is the choice beat — **five exits** (Rule of Three exceeded deliberately, matching the Anchor and Slip plans' five):

1. **The yard route** — she rides her marks, the foreman pays, no slate gets written.
2. **The riverman route** — Corvel's counter-offer, made aboard at night: help warp her out to his cousin's punt on the ebb and the coal-share is yours, sold at the yard gate by morning.
3. **The company route** — the coal-share gifted freely, carted to the Carrion compound's forges instead of any yard gate.
4. **The clerk's route** — a walk-past conversation the player can start only if `barge_charter_seen` or `barge_overload_known`: nothing is said that could be quoted, but the barge's survey gets quietly rescheduled to after quarter-day, and a purse finds its way to the yard gate.
5. **The walked route** — decline everyone; the tell re-arms; Corvel's arithmetic grinds on without you.

### Beat 5 — The aftermath (`pv_drydock_barge_aftermath`)
State lock, payout, and the district's memory: the launch on Tideday (with or without her fouling the sill, per resolution), the foreman's one-NPC acknowledgment (the §6 street-band perk), the pier watchers' tally (riverman route only), and the clerk's ledger line (clerk's route only). The unspoken Rumor-3 recognition lives here — see §6.4.

---

## 4. Route table — what each exit costs and pays

| Route | Immediate pay | The cost | The future |
|---|---|---|---|
| **Yard** (foreman's silver) | 4–5 silver (3 if grounded), once | Corvel's debt survives; you saved the boat that chains him again next quarter-day — never stated, always visible | The foreman's perk: his nod on future visits, a standing "launch-day hands" offer (§7). The yard's ambients warm one degree. |
| **Riverman** (the coal-share) | In-kind: a share of wet coal sold at the yard gate, **8–10 silver equivalent** (~2× the lawful pay, per §3's dirty-coin rule; priced against Corvel's charter scale in §7 so the arithmetic survives contact) | Foreman grudge flag (`barge_foreman_grudge`); `barge_tally_watched true` — the pier's two tally-stick men counted the cousin's skiff, and their counting is now a district memory | Corvel owes you in kind, not coin; the coal keeps a family warm and a debt unpaid one more quarter-day |
| **Company** (the Carrion) | No coin — `vane_standing +1` (Silt-Gate precedent, `port_valen_dredge_end.txt:759`) | Corvel walks free of clerk and debt, but the clerk eats a charter loss → `barge_scales_grudge true` (flag, not rep — the Scales never learn a name) | The compound's forges burn someone else's charter; a future Scales-facing scene has a file to read |
| **Clerk's** (the purse) | 5 silver, once | The foreman reads the rescheduling for what it is — `barge_foreman_grudge true` if the player took the yard route's pay first; Corvel is saved but knows he was sold, not saved | The clerk's ledger line exists now, in the player's favor — the cheapest purchased silence in the district, and the most conditional |
| **Walked** | 0 | None taken, none owed | The tell re-arms; Corvel's arithmetic grinds on; the launch risks the sill |

**Scale-check correction (caught in this document's own review, per the Anchor postmortem tradition):** the clerk's route as first drafted paid 15–20 silver, which is **outside the declared street band** and above Silt-Gate's smallest municipal figure — the exact oversizing the Anchor draft died of. As designed, the clerk's route pays **5 silver** — the band's ceiling, same as the foreman's best — because what the player is selling is a *rescheduling*, not a vessel: the clerk's arithmetic already won the moment the survey moved past quarter-day, and the purse is the difference between "forget the barge" and "forget it and don't write down that you looked." The 15–20 silver band is municipal-contract territory (Rules §3), and nothing in a single barge's fate is municipal. The temptation to let the dirty route outpay the honest one is the Anchor draft's original sin in miniature; the honest outpay here is the foreman's *perk* and a clean slate, not coin.

---

## 5. `startup.txt` variable block

```choicescript
*comment --- The Sitting Barge (see quest/SITTING_BARGE_PLAN.md) ---
*create barge_quest_stage "unstarted"      *comment "unstarted", "offered", "active", "resolved", "declined_pending"
*create barge_resolution "none"            *comment "none", "yard", "riverman", "company", "clerk", "walked", "grounded_yard"
*create barge_bounty_claimed false         *comment one-time payout guard for the foreman's route
*create barge_share_claimed false          *comment one-time guard for the coal-share sale (riverman/company)
*create barge_clerk_purse_claimed false    *comment one-time guard for the clerk's route
*create barge_offer_declined false         *comment player walked away from the tell; tell re-arms next Greyday
*create barge_overload_known false         *comment WIS/INT/arcane read, or CHA-forced charter
*create barge_charter_seen false           *comment the oilskin paper — riverman-route leverage
*create barge_seam_mapped false            *comment STR/DEX survey — advantage on the bilge beat
*create barge_ebb_ready false              *comment waited for low water vs. worked the turn (anchor_ebb_ready pattern)
*create barge_ebb_spent false              *comment a failed INT line burned a night; job resumes next ebb
*create barge_seam_ugly false              *comment STR failure — caulked but torn; aftermath prose only
*create barge_grounding false              *comment the fail-forward state — grounded on the sill, not sunk
*create barge_foreman_grudge false         *comment riverman route — the yard remembers
*create barge_tally_watched false          *comment the pier's watchers counted the cousin's skiff
*create barge_scales_grudge false          *comment company route — the clerk's ledger ate a loss
*create barge_foreman_perk false           *comment yard route — the standing launch-hands offer, once granted
```

Sixteen creates, all `barge_*`, matching the Slip plan's `slip_*` block conventions (stage/resolution/claimed guards first, then intel flags, then memory flags). Insert after the Anchor's block (after `*create anchor_stew_cap 3`, `startup.txt:247`), before the Crane Three block.

---

## 6. Wiring map & key ChoiceScript

**File placement:** everything lives in `port_valen.txt`, inserted between `pv_poi_drydock`'s closing `*page_break / *goto port_valen_harbor_pois` (~line 1856–1857) and `pv_poi_pier` (~line 1859). **No menu lines are added anywhere** — the quest grows inside the existing drydock POI's visit flow. No new scene file, no `compile.js` change. Ten labels, prefixed `pv_drydock_barge_`:

```
pv_drydock_barge_tell      the conditional tell + approach choice (Beat 1)
pv_drydock_barge_offer     the foreman's two sentences, both openings converge here (Beat 1)
pv_drydock_barge_survey    the deck, the marks, the charter, the ebb decision (Beat 2)
pv_drydock_barge_ebb       the wait-for-ebb interstitial (small, Anchor grammar)
pv_drydock_barge_bilge     the work set-piece, five approaches + grounding fail-forward (Beat 3)
pv_drydock_barge_ledger    the clerk's walk-past + the five exits (Beat 4)
pv_drydock_barge_aftermath state lock, payouts, memory flags, the launch (Beat 5)
pv_drydock_barge_grounding the fail-forward state's own recovery path
pv_drydock_barge_corvel    the riverman's counter-offer scene (reached from ledger)
pv_drydock_barge_perk      the standing launch-hands offer (post-resolution, once)
```

**Unique `time_advance_call_id`s:** `pv_drydock_barge_survey_1`, `pv_drydock_barge_ebb_1`, `pv_drydock_barge_bilge_1`, `pv_drydock_barge_ledger_1` — one per call site, per the calendar convention. The tell itself rides the POI's existing entry cost (conversation is free).

### 6.1 The tell, inside `pv_poi_drydock`

```choicescript
*comment ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*comment THE IRON WHARVES: "THE SITTING BARGE"
*comment Street-tier one-shot (quest/SITTING_BARGE_PLAN.md). Tell is
*comment Greyday night/dusk-rain only; deadline is the next Tideday
*comment launch, derived from day_of_week, never a timer. State:
*comment startup.txt "barge_*" block. Inserted inside pv_poi_drydock
*comment before its closing page_break/harbor_pois goto.
*comment ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*if ((barge_quest_stage = "unstarted") or (barge_quest_stage = "declined_pending"))
  *if (day_of_week = "Greyday")
    *if ((time_period = "Night") or (time_period = "Pre-Dawn") or ((time_period = "Dusk") and (weather = "Rain")))
      *goto pv_drydock_barge_tell
```

*(Implementation note: this `*if` chain sits immediately after `pv_poi_drydock`'s time-advance and death check, before the first-visit prose, so the tell replaces rather than stacks on the standard ambient — a night the tell is available, the tenders are the ambient.)*

### 6.2 The offer (Beat 1's convergent label)

```choicescript
*label pv_drydock_barge_offer
*comment Both approach paths land here. The foreman's hire logic is
*comment liability, never the player's colors — Rules §1, Crane Three
*comment precedent. He does not name the Scales. No offer is made unless
*comment the player made one of the two approaches themselves.
He looks at you the way he looked at the slate — like something that might hold a number.
"Not my men," he says, before you have asked anything. "Any yard hand I put on her signs the yard's name to her, and come quarter-day the clerk reads signatures." A thumb toward the basin, toward the barge sitting a hand below her drowned tar-line. "She's carrying low and there's water where water shouldn't be. Lighten her, find the seam, caulk it, and have her riding her marks before the launch takes the sill. Five silver when she floats right. Three if I have to send a second pair of hands behind you. No slate gets your name either way."
*page_break Take the job, or don't…
*choice
  # Take the job.
    *set barge_quest_stage "active"
    You put out your hand, and he does not take it — he marks something on the slate instead, a mark that is not your name.
    *goto pv_drydock_barge_survey
  # Leave it.
    *set barge_offer_declined true
    *set barge_quest_stage "declined_pending"
    "Suit yourself." He turns back to the basin, and the marks on the post, and the barge that is not riding her marks. The tenders' argument starts up again, quieter than before, the way arguments do when they have learned to wait.
    *goto port_valen_harbor_pois
```

*(A declined offer re-arms the tell on subsequent Greyday nights via the `"declined_pending"` stage in §6.1 — the foreman's problem does not expire because one stranger walked away. On acceptance, the stage flip sits between a `*page_break` and a `*goto` with no bare increment before either pause; the survey label guards on stage, not on a counter.)*

### 6.3 The ebb decision (end of Beat 2)

```choicescript
*comment The anchor_ebb_ready grammar, inverted: the Anchor's ebb revealed
*comment the work; this ebb permits it. Same pattern, new stakes.
*choice
  # Work the flooded seam tonight, at the turn.
    *set barge_ebb_ready false
    "Now, while she's still moving," the master says, which is either courage or arithmetic. The water in her bilge is a hand deep and rising with the flood still making.
    *goto pv_drydock_barge_bilge
  # Wait for the low water past midnight, then go in.
    *set hours_to_pass 3
    *set minutes_to_pass 0
    *set time_advance_call_id "pv_drydock_barge_ebb_1"
    *gosub_scene calendar advance_time
    *gosub_scene calendar recalc_hp_from_neglect
    *if (hp_current <= 0)
      *set death_cause "exhaustion"
      *goto_scene death death_screen
    *set barge_ebb_ready true
    By the low watch the basin has drawn down far enough to show black weed on her garboard strake, and the seam is a dry finger's width of sprung caulking, waiting.
    *goto pv_drydock_barge_bilge
```

### 6.4 POV & continuity notes

* **The Rumor-3 recognition is recognition, never assertion.** One line in the aftermath — the barge riding free at the launch, Corvel waving from her deck, and somewhere in the cheering a voice that isn't cheering — is the entire beat. No NPC is named either way, no resolution is contradicted, and the player who never heard the hearth-side story at the Keel loses nothing (`port_valen.txt:1056–1058` is the only thing it leans on, and it leans without quoting).
* **The foreman never says "Scales."** The clerk is "the clerk," the standard is "the standard," the counting house is "the counting house." A player who has seen the Upper Wharves or holds `gilded_scales_rep > 0` gets the jolt; a player who hasn't gets ominous paper and a brass stamp on a belt.
* **The clerk has no dialogue, ever.** His single appearance (Beat 4's walk-past, quest still active on a later visit) is described, not staged — a silhouette counting hulls, and the player's choice to intercept or let him pass.
* **No codex entry is granted.** The drydock already grants `gilded_scales_rep +1` on first visit (`port_valen.txt:1738–1740`); this quest adds no faction seeds, no codex, no rep — the whole point of the yard route is that the Scales never learn anything happened.
* **Squadless parity:** every foreman line works verbatim for `squad = "none"`; the existing `"Ravens pull"` ambient remains the only badge-aware line in the POI, untouched.

---

## 7. Rewards, scale, and the arithmetic that must survive contact

| Route | Pay | Scale check (Rules §3) |
|---|---|---|
| Yard | 4–5 silver (3 if grounded), once | Inside the street band; night-skill-hazard rate sits at its ceiling, justified by the launch deadline and the wet work. Under half of Silt-Gate's 12-silver floor. |
| Riverman | Coal-share sold at the yard gate, ~8–10 silver equivalent | §3's dirty-coin rule ("double or triple in hush-money") — priced at exactly 2× the lawful route. **The cargo's worth:** Corvel's overloaded hold is a winter's coal for a tenement row; a *share* (a third, minus the cousin's cut) moving at yard-gate rates is 80–100 copper. The plan commits to the arithmetic on the page so the payout can't silently inflate at implementation. |
| Company | 0 coin; `vane_standing +1` | Silt-Gate's company route precedent. The value is standing, and the coal is the *master's* gift, not plunder. |
| Clerk | 5 silver, once | The band's ceiling — see §4's scale-check correction. What's sold is a rescheduling, and the purse is hush, not bounty. |
| Walked | 0 | None owed, none paid. |

**The foreman's perk (yard route)** is the §6 street-band ceiling for world memory: one NPC's standing arrangement — his nod on future drydock visits, and a one-time "launch-day hands" offer (`pv_drydock_barge_perk`) that pays Crane-Three rates for a Tideday-only shift. It is granted once, guarded by `barge_foreman_perk`, and touches no district system. **No faction rep moves on any route**, per the Crane Three rule — the grudge/watched/scales flags are district memory for *future* scenes to read, not reputation deltas.

**Time arithmetic:** the tell is free (rides the POI's 15-min entry); the survey is ~30 min; the ebb wait is 3 hours (it is a *tide*); the bilge is ~30–45 min; the ledger morning is ~20 min. Total across visits: roughly half a day of game time spread over two to three visits, matching the guidelines' time tiers — no beat advances time for conversation, and every advance carries its unique `time_advance_call_id`.

---

## 8. Reuses vs. must-be-built

**Reuses (no new plumbing):**
* `advance_time` / `recalc_hp_from_neglect` / death-screen routing — as every POI does.
* `roll_d20_check` + `advantage` + guidance hints + inline `@{show_stat_hints}` pattern.
* `currency_add` + `currency_txn_locked` (foreman's pay, coal-share sale, clerk's purse — all three ride it).
* `stat_bump_locked` pair for the STR line's 2 HP (Crane pattern, `port_valen.txt:1553–1557`).
* The `anchor_ebb_ready` wait-for-tide grammar (inverted stakes, same shape, `port_valen_dredge_end.txt:1063–1085`).
* The 9-slot cantrip guard chain (copied from `port_valen_dredge_end.txt:288`).
* The day-derived deadline idiom (`port_valen_dredge_end.txt:1043–1046` — "the week has to get there first").
* `pv_poi_drydock`'s existing entry cost, first-visit prose, and weather/day ambient — untouched.

**Must-be-built:**
* Ten labels in `port_valen.txt` (§6's wiring map), roughly 420–500 lines with prose.
* The 16-variable block in `startup.txt` (§5).
* The conditional tell `*if` chain inside `pv_poi_drydock` (§6.1) — the only edit to existing code.
* `quest/QUESTS.md` sync (below).
* No new scene file, no menu lines, no `compile.js`/`verifyFileName` change, no codex entries, no rep writes.

**`quest/QUESTS.md` sync (implementation-time, three edits):**
1. New chapter entry — *"Quest 6: The Sitting Barge — The Iron Wharves"* — after the Crane Three section, with the objective flow, DCs, route table, and variable list from this plan.
2. Harbor POIs table: update the Iron Wharves/drydock row from ambient-only to implemented (the tell, the ebb survey, the grounded-state recovery, the standing perk).
3. Complete Variables Index: append the 16 `barge_*` creates. Add one node to the Chapter 3 mermaid graph.

---

## 9. Compliance checklist

* **Rules §1 — Organic discovery.** The hook is a sounding-line argument between two men who stop talking when you get close — an environmental tell with dual player-initiated doors (foreman or tenders). The foreman's hire logic is liability arithmetic ("the clerk reads signatures"), never the player's badge; the original draft's raven-hire rationale was caught and cut *before* this document shipped, and §1 of this file records the correction so it can't be reintroduced. The clerk is never named until discovered — and is never discovered at all on most routes.
* **Rules §2 — Multi-branching.** Five exits at full archetype parity (STR/DEX/INT/WIS/CHA each own a survey read or a bilge approach; arcane coverage: Light, Thaumaturgy, Mending, Mage Hand, each a real path or a real recovery). Every failure fails forward: the failed read leaves marks unread but the job on; the failed STR line costs HP, not the job; the failed DEX line costs the lamp and the timing; the grounding is a harder job, not a dead one. No check's failure ends the quest.
* **Rules §3 — Low-fantasy economy.** All coin payouts inside the 1–5 silver street band; the underworld route's 2× premium is priced in coal and shown in copper; the company route pays standing, not coin; the clerk's purse is the band ceiling and was *rescaled down from a draft 15–20* in this document's own review (§4). The mercenary dilemma is structural: lawful pay vs. dirty share vs. standing, with a fifth exit that declines all three.
* **Rules §4 — Setting & technology.** Sounding-lines, boathooks, garboard strakes, caulking mauls, grease, capstans, chalk depth-marks, oilskin charter paper, brass stamps. Nothing invented past 1530; no firearms. `node tools/lint_anachronisms.js` before finalizing prose; no weapons are drawn, so `node tools/lint_weapon_assumption.js` should also pass clean. Period-language scrub already applied to the design ("drowned tar-line," not "waterline paint"; "sounded depth-marks," not "load-line"; "marks" as shipwrights say, never a Plimsoll term).
* **Rules §5 — State hygiene.** Every payout rides `currency_txn_locked` behind `barge_*_claimed` once-only guards; the HP cost rides `stat_bump_locked`; every time advance has a unique `time_advance_call_id`; stage transitions sit between page breaks or behind stage-guards, never as bare sets before a pause; the deadline derives from `day_of_week`, adding zero timer state.
* **Rules §6 — Open-world integration.** The quest lives entirely inside an existing POI in the harbor hierarchy, reacts to day-of-week (Greyday tell, Tideday deadline and launch), time-of-day (night ebb), and weather (dusk-rain tell, Storm arming the grounding); memory is proportionate — one NPC perk on the yard route, flags not rep everywhere else.
* **narrative_guidelines §4 — Continuity.** Rumor 3 echoed in shape, never quoted; the Scales never named by the cast who fear them; no absolute claims about the player's history; `gilded_scales_rep`'s existing first-visit seed untouched; the quest contradicts no Silt-Gate, Anchor, or Slip resolution (the clerk here is basin staff, not the Low-Water Box's harbor-master, and the two never share a scene).
* **Replay safety note:** the ebb wait's page owns its own time advance via its unique call id, so the death check after it is unambiguous exhaustion (the 3-hour wet wait, not hunger) — same reasoning as `pv_slip_free_ration`'s comment.

---

## 10. Open decisions (to resolve at implementation start)

1. **Names.** "Corvel" is a placeholder; the foreman is deliberately unnamed (his naming is a future quest's currency, matching the Odo discipline). Recommendation: keep both.
2. **The tell's re-arm window.** Currently every Greyday night until accepted. Alternative: one re-arm only, then the barge sinks offscreen (a district consequence, a darker port). Recommendation: keep re-arming — a quest that removes itself because the player once said "not today" reads as a bug report waiting to happen.
3. **The grounding's recovery path.** Currently its own label (`pv_drydock_barge_grounding`) with a warp-off beat reusing the Beat 3 choice skeleton at raised DCs. Alternative: fold into the bilge label behind the `barge_grounding` flag. Recommendation: keep it separate — the grounding is the quest's signature failure state and deserves its own prose, and a separate label keeps the bilge label's complexity down.
4. **The coal-share sale's venue.** Currently "the yard gate" (openly, at a discount, with the foreman watching if grudge is set). Alternative: the Dredge-End scrap dealers, which crosses into the Slip plan's district. Recommendation: keep the yard gate — the whole quest belongs to the wharves, and the sale's witnesses are the point.
5. **`vane_standing +1` vs. `+2` on the company route.** Silt-Gate's diverted-cargo route (a materially larger gift) pays `+1` (`port_valen_dredge_end.txt:759`). Recommendation: `+1`, matching precedent — a coal-share does not out-pay a crate of tool-steel.
6. **The perk's launch-day shift.** Currently a one-time offer paying Crane-Three rates (4 silver + bonus shape) gated on `day_of_week = "Tideday"`, distinct from Crane Three's own loop. Recommendation: keep it small and once-only — if it proves fun, a future plan can promote it to a second repeatable loop; building that loop now would double-dip the Crane design without its combinatorial text budget.

**Status of this document:** complete. Implementation, when approved, touches exactly three files — `startup.txt` (§5 block), `port_valen.txt` (§6 labels + the §6.1 tell chain inside the existing POI) — plus the `quest/QUESTS.md` sync listed in §8, with `node tools/lint_anachronisms.js` and the repo's quicktest pass as the closing gates. Per the commissioning note, no code has been written yet; this file is the whole of the change.









