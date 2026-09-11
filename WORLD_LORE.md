# World Lore Reference — The Carrion Company

Developer-facing canon for the setting above the local, already-established geography (Ashbrook, Port Valen, Karr's Keep, the Black Sinks). Player-facing reveals stay gated behind the codex's Progressive Discovery pattern (`[??? UNDISCOVERED]` until unlocked in-fiction) per the narrative guidelines — this doc is the source of truth for what's *true*, not what's currently visible to the player.

## Quick Answer

The player is currently on **the Black Sinks Causeway**, in **the Grey Marches** — a frontier region that is nominally still part of **the Meridian Empire**, but which the Empire has not actually governed, taxed, or garrisoned in about thirty years. There is no duke, king, or emperor with real authority on the ground here. The only powers that matter locally are Baron Aldous Karr (Ashbrook/the highlands), the Gilded Scales merchant cartel (Port Valen and the river trade), the Black Tally (Port Valen's underworld), and free companies like the Iron Carrion who get hired to do what no crown's army does anymore.

## The Meridian Empire

A once-dominant imperial power whose core provinces lie far to the west, beyond the Marches. It still exists, still has an emperor/court, and still nominally claims the Grey Marches on its old charters and maps — but its real reach has been shrinking for a generation, and the Marches sit past the edge of where it currently bothers, or can afford, to enforce that claim.

**The Salt Marches War** (fought ~30 years ago, in a distant coastal salt-flat region — a different place from the Grey Marches, despite the similar name) was the Empire's last major internal war: a succession/civil conflict that bled its treasury and armies white. In the aftermath, rather than formally releasing its distant, unprofitable frontier holdings, the Empire simply stopped administering them — no new governors sent, no tax collectors, no garrisons replaced as they thinned. The Grey Marches is one of those quietly abandoned holdings: still "imperial" on paper, ownerless in practice.

This is the origin of the Iron Carrion's motto, literally: *"they answer to no crown and hold no land"* isn't defiance of a present authority — it's a description of a vacuum. There's a crown, technically. It just isn't here, and hasn't been for a long time.

**Captain Joshua Vane** fits into this directly: he was an imperial officer, plausibly one who served through the Salt Marches War itself. When the Empire drew down afterward, officers holding frontier postings like the Grey Marches garrison were either recalled to the shrinking core or simply not renewed. Vane wasn't disgraced or court-martialed in the dramatic sense the "cashiered" rumor implies — he was let go, one administrative stroke among thousands, and instead of disbanding his remaining soldiers, he kept them together and went into business for himself. That's the Iron Carrion's founding, thirty years ago.

## The Grey Marches — Administrative Reality

- **On old imperial maps:** an easternmost frontier province of the Meridian Empire.
- **In practice:** self-governed by whoever holds local power, with no higher authority to appeal to, answer to, or be checked by.
- **Baron Aldous Karr** holds Karr's Keep and rules the highland tenants (Ashbrook included) under an old imperial patent that nobody above him has enforced, renewed, or audited in decades — which is exactly why his tyranny goes unchecked. There's no crown court to appeal a bad baron to anymore.
- **Port Valen** was originally built as an imperial customs port. With no imperial customs office left to run it, it has become a de facto free city: the Gilded Scales cartel collects the river tolls and trade taxes the Crown used to, and enforces its own contracts with hired iron (the Carrion included) instead of imperial law.
- **The Black Tally** fills the criminal-justice vacuum the same way the Gilded Scales fills the commercial one — Port Valen has no magistrate with real teeth, so debts get collected by shivs instead of courts.
- **Free companies** (the Iron Carrion, and presumably others) exist because there's no standing imperial army out here to fight anyone's wars, clear anyone's roads, or put down anyone's uprisings. Whoever has coin hires steel instead.

## Scale (for completeness, lightly used)

The Meridian Empire sits on a larger continent; no continent name has been committed to canon yet, and doesn't need to be until a scene actually requires the player to think past the Marches' borders. Don't invent one ad hoc in scene prose — flag it here first if a scene needs it.

## Progressive Discovery — What's Locked vs. Visible

Consistent with narrative_guidelines.md §1 (Progressive Codex Discovery):

- **Always visible (ambient framing, no specific secret):** "the Grey Marches" as a place name, "a contested... frontier borderland," the Iron Carrion's "answer to no crown" motto, the name "Salt Marches War" as the company's founding event.
- **Locked until unlocked (`codex_meridian_empire`):** what the Salt Marches War actually was, that the Marches are nominally imperial territory, why no one enforces law here, and the real shape of Vane's backstory. Currently set `true` automatically only for the **Disgraced Scion** origin (their family held their lands *of* the old imperial patent — they'd know this as a basic fact of their own disinherited birthright). Ashbrook Survivor and Port Valen Outlaw start with this locked; they have no natural reason to know imperial administrative history yet.

## Open Hooks (not committed — flag for a decision before writing into them)

These are directions the lore supports but nothing has been written toward yet:

- A future scene where Vane's real history surfaces (a campfire conversation once `vane_standing` is high enough, an old imperial insignia found on his gear, etc.) — natural place to unlock `codex_meridian_empire` for the other two origins.
- The Empire reasserting interest in the Marches (a tax collector, a governor, a levy notice) as a mid-game complication — would reintroduce a "real" crown into a story that's currently defined by its absence, so worth deciding deliberately rather than backing into it.
- Whether the Salt Marches (the war's location) ever becomes a place the story actually visits, given the name is currently doing double duty as "distinct place" and "the thing everyone just calls the war."
