# Stopping the sprites (chunk 6, first beat, BUILT 2026-10-20)

**Built as written.** Your answers: no leaving, the third failure is the death screen, the prose stands (nothing else to add). Dubhar's finish is now non-lethal for him only (`combat_nonlethal_slot`), so the Twig Blights keep creature lines. See the rules entries "Stopping the Sprites" and "A Fight Can Mark One Enemy Slot Non-Lethal".

For you to mark up before anything is built. It covers only the beat between **Dubhar going down** and **Dubhar coming to his senses**: the player walks into the sprite war and tries to stop it. **Nothing after the swarms stop is written here** (his waking, the begging, the spare-or-kill choice, who kills him, the clean water, the sprites' second challenge, Bark's fruit and his drop are the beats after this). Prose is written out in the order the player meets it, in the character's own voice. Anything marked *(invented)* is mine. Answer in place under the QUESTIONS at the end; "your call" means use my suggestion.

---

## What I took from you

* **Three approaches, one DC.** Persuasion, Intimidation and Performance, all **DC 13**. The player may try any of them again after a failure, and may switch.
* **The helpers set the roll**, using the same two facts as the fight (the oak saved by the player: `lsf_dryad_friend`; the bear healed: `lsf_bear_healed`):

| Helpers | Every roll |
|---|---|
| Neither | **Disadvantage** |
| One of them | A straight roll |
| Both | **Advantage** |

* **Failures cost the same at every helper level.** Each failure takes **half of the player's remaining HP** (rounded down), **never below 1**: the sprites cannot kill the player until the third failure. **The third failure is death**, the death screen, from the sprites. One success ends it.
* **Casualties follow the failures before the success:** 0 failures = **10%** of both armies dead, 1 = **20%**, 2 = **40%**. The number is **only recorded for now** (`lsf_sprite_dead_pct`). Later it will shape how the sprites in the grove treat the player (a boost or penalty on the checks with them, and rewards), and nothing reads it yet.
* **The clock:** each try is **1 minute** on the grove clock. The roll is made **before** the minute passes, so a Guidance cast ahead still counts for the first try (the roll-before-time rule), and the clock is the only other cost.
* **No grove-clock difficulty.** The 13 does not change with `lsf_grove_mins`.

---

## 1. Where it starts

The fight ends with one line (already built). It now runs straight on into this, with no menu in between, because the war is still going and the player is standing in the middle of the grove.

> The grey-cloaked man goes down, and the twig shapes still standing fall apart into heaps of dead sticks. *(or "...and the thicket falls quiet around him." when no blight was left; both already built)*
>
> Overhead the swarms fight on, louder than before, as if his fall had loosed whatever held them and left only the rage. Small bodies drop through the smoke into the ash. There is one way to end this, and it is to walk into the middle of it and make them listen.

*(There is no way to leave. The player is committed: the choices below repeat until one succeeds or the third failure kills. The back-down-the-trail button is not shown while the war is on. Question 1.)*

---

## 2. The choices *(the same three every time; a button names its skill and the DC)*

* **Shout over the din that their minds are not their own.** *[Persuasion DC 13]*
* **Roar at them to put up their blades.** *[Intimidation DC 13]*
* **Sing to them.** *[Performance DC 13]*

*(The button hint also says "disadvantage" or "advantage" when the helpers earn it, the same way the other hints do.)*

---

## 3. Each try

The player is never asked to choose twice: a pick plays its prose, rolls, and either ends the war or costs HP.

**Persuasion**

> You wade in with your arms spread and shout until your voice cracks. The water is poisoned, you tell them. The man who did it lies senseless in the briar. Every one of you has been made to want what you never wanted. "Look at yourselves!"

**Intimidation**

> You plant your feet under the thickest of the fighting and bellow, loud enough to shake ash off the branches, that the next one to raise a blade will answer to you.

**Performance**

> You draw a breath from the soles of your feet and sing. A long, rising note first, and then a verse as plain as a lullaby, pitched to carry over the shrieking.

**On a pass** *(one for each approach; it ends the war)*

* **Persuasion:** Something in the swarm hitches. A green sprite lowers her blade and stares at her own hand, then at the thorn-brown one she had been about to cut. "We were not..." she says, in a voice no bigger than a bell. The words run through both swarms like a wind.
* **Intimidation:** The din dies from the edges inward. Blades drop, and both swarms hang in the smoke, staring at the thing that shouted. For the first time since you came, you can hear the embers ticking in the black oak.
* **Performance:** The verse climbs, and the shrieking thins under it. One by one the sprites stop where they hang to listen, until the last wingbeat falters and both swarms drift down onto the branches, quiet as roosting birds.

**On a miss** *(the same for all three, after the approach's own lines above)*

> Both swarms turn on you at once, a hail of tiny blades and thorns and furious small faces. You stagger out of the cloud with your arms over your head, bleeding from a hundred scratches. They have already forgotten you.

> **[🩸 Scratched raw: -N HP | HP: x / y]**

*(N is half the HP the player had, rounded down, and never enough to leave them below 1. At 1 HP no more can be taken and the line reads "-0"; the strike still counts.)*

**On the third miss:**

> The cloud closes over you. You see a wall of wings, then a wall of knives, and then you see nothing.

*(The death screen, location "The Burning Grove", cause "the sprites in the grove".)*

---

## 4. When the war stops: how many are gone

One paragraph, picked by the failures before the success. It then records `lsf_sprite_dead_pct`.

* **No failures, 10%:** The smoke thins. Here and there a small body lies still in the ash, perhaps one in ten of them. The rest hover and stare at their own hands as if they had never seen them.
* **One failure, 20%:** The smoke thins, and the ash is dotted with small bodies, about one in five of them. The living drift among them, silent, turning them over.
* **Two failures, 40%:** The smoke thins on a grim count. Two in every five of them lie in the ash, green and thorn-brown together, and the living hang over them in a silence worse than the shrieking.

*(The war has ended. The scene then returns to the grove menu with nothing new on it: **his waking is the next beat and is not written**. Until then the player can leave by the trail, which is a placeholder, as in the earlier chunks.)*

---

## 5. New state

`lsf_sprites_stopped` (the war is over), `lsf_sprite_fails` (0 to 2 before the success), `lsf_sprite_dead_pct` (10, 20 or 40). The old `lsf_sprites_tried`, `lsf_sprites_watch_tried`, `lsf_sprites_watched` and `lsf_sprite_cost` from the commented-out version are no longer used. I would delete the commented-out Watch / Step between / Shout block when this is built.

Replay safety: each pick's HP loss and failure count sit inside one page lock, and the roll comes before the minute passes.

---

## 6. For the beat after this *(not written; just so I read you right)*

Once the sprites settle, he stirs, begs for his life and promises to leave and never come back. The player can spare or kill him. **If spared:** it is a toss-up, by random chance, whether the **sprites or the dryad** kill him anyway. *(My earlier note in the main quest file said only the dryad, and that the bonus with her drops from +5 and advantage to advantage alone. I will apply your newer version and keep her reaction as it was unless you say otherwise.)* The poison ends with his death either way. All of that comes in its own review file.

---

## QUESTIONS

**1. No leaving.** The player is in the middle of a war with no way out until they succeed or die. I would not show the back-down-the-trail button until the swarms stop. OK?

Your answer:

**2. Dying.** The third failure goes straight to the death screen as written. OK?

Your answer:

**3. Dubhar's last blow.** He is meant to be unconscious, but the fight's finishing line is the ordinary lethal one for the player's weapon (a "drops" or a worse line for a bow). Switching the fight to the "beaten into surrender" lines would soften it for him, **but it would also give the Twig Blights an "unconscious" finish, which is wrong for plants.** My suggestion is to leave the lethal lines for now and decide it with the mercy beat. OK, or do you want the softer lines?

Your answer:

**4. The prose.** The three approaches, the passes, the miss, and the three casualty paragraphs. Keep, change or rewrite?

Your answer:

**5. Anything else you want added, cut or changed?**

Your answer:
