#!/usr/bin/env node
/*
 * test_combat.js — Mock combat simulator and transcript generator.
 * Supports:
 *   --enemy=granary_rats (default)
 *   --enemy=silt_lurker
 *   --enemy=rennick_guards
 *   --enemy=all
 *   --num=N (default 10)
 *
 * Usage:
 *   node tools/test_combat.js enemy=silt_lurker num=5
 *   node tools/test_combat.js enemy=rennick_guards num=5
 *   node tools/test_combat.js enemy=all num=3
 */

const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
  const args = { enemy: 'granary_rats', num: 10 };
  for (const raw of argv) {
    const clean = raw.replace(/^--?/, '');
    const eq = clean.indexOf('=');
    if (eq === -1) continue;
    args[clean.slice(0, eq)] = clean.slice(eq + 1);
  }
  args.num = parseInt(args.num, 10) || 10;
  return args;
}

const args = parseArgs(process.argv.slice(2));

// Character presets to test different classes, weapons, and spells
const BUILDS = [
  { name: 'Kwesey the Evoker (Wizard)', class: 'wizard', weapon: 'quarterstaff', weaponType: 'melee', weaponDamageType: 'bludgeoning', hp: 8, maxHp: 8, ac: 12, strMod: 0, dexMod: 2, intMod: 3, cantrip: 'ray_of_frost', spell: 'magic_missile', spellSlots: 2 },
  { name: 'Alden the Pyromancer (Wizard)', class: 'wizard', weapon: 'quarterstaff', weaponType: 'melee', weaponDamageType: 'bludgeoning', hp: 8, maxHp: 8, ac: 12, strMod: 0, dexMod: 1, intMod: 3, cantrip: 'fire_bolt', spell: 'shield', spellSlots: 2 },
  { name: 'Bram the Vanguard (Fighter)', class: 'fighter', weapon: 'broadsword', weaponType: 'melee', weaponDamageType: 'slashing', hp: 12, maxHp: 12, ac: 16, strMod: 3, dexMod: 1, fightingStyle: 'defense', secondWind: 1 },
  { name: 'Theron the Marksman (Fighter)', class: 'fighter', weapon: 'heavy crossbow', weaponType: 'ranged', weaponDamageType: 'piercing', hp: 11, maxHp: 11, ac: 14, strMod: 1, dexMod: 3, secondWind: 1 },
  { name: 'Gorr the Berserker (Barbarian)', class: 'barbarian', weapon: 'greataxe', weaponType: 'melee', weaponDamageType: 'slashing', hp: 14, maxHp: 14, ac: 13, strMod: 3, dexMod: 1, rageUses: 2 },
  { name: 'Lyanna the Hexblade (Warlock)', class: 'warlock', weapon: 'spear', weaponType: 'melee', weaponDamageType: 'piercing', hp: 9, maxHp: 9, ac: 13, strMod: 1, dexMod: 2, chaMod: 3, cantrip: 'eldritch_blast', spell: 'armor_of_agathys', spellSlots: 1 },
  { name: 'Morvath the Grave-Warlock (Warlock)', class: 'warlock', weapon: 'dagger', weaponType: 'finesse', weaponDamageType: 'piercing', hp: 9, maxHp: 9, ac: 12, strMod: 0, dexMod: 2, chaMod: 3, cantrip: 'chill_touch', spell: 'hex', spellSlots: 1 },
  { name: 'Finian the Skald (Bard)', class: 'bard', weapon: 'rapier', weaponType: 'finesse', weaponDamageType: 'piercing', hp: 9, maxHp: 9, ac: 13, strMod: 0, dexMod: 3, chaMod: 3, cantrip: 'vicious_mockery', spell: 'dissonant_whispers', spellSlots: 2 },
  { name: 'Koren the Shadow (Rogue)', class: 'rogue', weapon: 'shortsword', weaponType: 'finesse', weaponDamageType: 'piercing', hp: 9, maxHp: 9, ac: 14, strMod: 0, dexMod: 3 },
  { name: 'Caelen the Scout (Rogue)', class: 'rogue', weapon: 'shortbow', weaponType: 'ranged', weaponDamageType: 'piercing', hp: 9, maxHp: 9, ac: 13, strMod: 0, dexMod: 3 }
];

function rollD(sides) {
  return Math.floor(Math.random() * sides) + 1;
}

// Spells finisher definitions
const finishRayOfFrost = [
  `The pale ray strikes deep into its flank, rime rushing outward in jagged crystals until its limbs lock rigid and it topples over with a brittle crack.`,
  `Bitter cold surges through every vessel at once—it freezes mid-motion, then topples over like brittle ice.`,
  `The numbing freeze claims its heart in a single shuddering heartbeat, leaving a frost-crusted husk in its place.`
];
const finishFireBolt = [
  `The arcane fire punches through its chest in a blinding flash, incinerating what was left of its vitality in a shower of smoldering sparks.`,
  `A violent bloom of flame sears through its flank—it collapses motionless with a hiss of steam and charred ash.`,
  `The searing mote erupts with furnace heat, scorching straight through flesh and bone before dropping it motionless to the ground.`
];
const finishEldritchBlast = [
  `The violet beam detonates against its torso with concussive thunder, hurling the broken body backward across the floor.`,
  `Pure eldritch force punches through like a siege engine's bolt, shattering whatever was holding it together all at once.`,
  `A violent pressure wave fractures the air—the concussive impact lifts it off its feet and drops it motionless in the shadows.`
];
const finishChillTouch = [
  `The spectral hand squeezes tight around its throat, drawing out the last motes of warmth in a pallid wisp of necrotic vapor as it collapses.`,
  `Grey necrosis spreads instantly from the ghostly grip, leaving the withered form to drop lifeless where it stands.`,
  `The grave-chill pulls the pulse clean out of its veins, dropping it rigid with skin turned the color of ash.`
];
const finishViciousMockery = [
  `The razor-sharp insult cuts deeper than steel, rupturing its cognitive will until its knees buckle and it slumps lifelessly.`,
  `The cruel cadence resonates behind its eyes like a hammer on glass, shattering its nervous focus until it collapses motionless.`,
  `Your barbed words tear through whatever scrap of spirit sustained it, and it crumples to the floor without another twitch.`
];
const finishMagicMissile = [
  `All three glowing force-darts strike the same vital point in rapid succession, puncturing through hide and bone to drop it dead.`,
  `The arcane missiles curve unerringly through the gloom and slam home with dull thuds, snuffing out its life in an instant.`,
  `The force darts bore clean through its defenses, leaving smoking blue punctures as it collapses limp against the stones.`
];
const finishSlashing = [
  `You step into the arc and bring the edge down in a violent cleave—the heavy steel bites clean through bone and sinew with a sickening crunch and a gush of dark blood.`,
  `You pivot hard, putting your full weight behind the stroke. The honed iron shears through meat and muscle, nearly hewing the limb free before it collapses in a spray of scarlet.`,
  `A brutal, downward chop splits straight through the shoulder. You wrench the notched iron free with a wet tearing sound, leaving it to crumple lifelessly into the pooling blood.`,
  `The cutting edge takes it across the throat in a savage stroke—arterial crimson coats your knuckles as it claws blindly at the open ruin before dropping limp.`,
  `You drive the heavy blade deep into its flank with all your strength, carving through hide and organ until its breath leaves it in a bloody, bubbling rasp.`
];
const finishBludgeoning = [
  `You drive the weighted iron ferrule straight into its temple with sickening momentum—the wet crack of fracturing bone rings out as its skull gives way and its frame drops like an unstrung puppet.`,
  `A brutal two-handed sweep takes it square across the ribs, shattering bone inward with a concussive crunch that drives all air from its lungs in a bloody spray.`,
  `You plant your back foot and thrust the blunt end hard into its sternum, caving in the chest with a dull, sickening thud that stops its heart on the spot.`,
  `The crushing blow lands with brutal leverage, snapping its neck sideways with a sharp, dry fracture before it crashes dead to the stones.`,
  `You bring the heavy wood around in an overhand smash that caves in its shoulder and spine, driving it down in a motionless, broken heap.`
];
const finishPiercing = [
  `You step inside its guard and drive the point upward beneath the ribcage, burying steel to the crossguard. You twist the iron once before ripping it free in a heavy surge of dark blood.`,
  `A lightning-fast thrust punches clean through its throat—it clutches at the iron in choking disbelief as red froth spills over your fingers, legs folding under it.`,
  `You catch its arm, pull its weight off-balance, and ram the cold point straight through the eye-socket, dropping it instantly without another sound.`,
  `The point finds the seam in its defenses and drives all the way through lung and heart. A wet gasp escapes its lips as you kick the carcass off your blade.`,
  `You drive the spike deep into its spine at the base of the neck—it goes rigid in a single violent tremor before collapsing entirely limp.`
];
const finishRanged = [
  `The heavy iron quarrel punches straight through its breastbone with a dull, hollow thud, pinning its lungs and dropping it in a spray of crimson.`,
  `You track its frantic movement and loose on the exhale—the broadhead takes it clean through the eye, snapping its head back violently before its knees buckle.`,
  `The missile strikes with devastating kinetic punch, tearing through its throat and embedding deep into the woodwork behind as the carcass slides down limp.`,
  `A clinical, center-mass shot drives deep into its vitals, the iron head exiting between its shoulder blades as it collapses with a wet, ragged gasp.`,
  `You loose from close range—the iron broadhead shatters through collar and spine, killing all forward momentum in an instant as it crumples lifeless.`
];

// Non-lethal finisher pools (brawls / guard fights)
const finishNonlethalSlashing = [
  `You flip your grip in a smooth, practiced motion and slam the heavy iron pommel square into his jaw—his eyes roll back and he crumples unconscious into the cedar sawdust.`,
  `You arrest the lethal arc mid-swing and strike with the flat of the heavy blade across his temple. The ringing blow drops him instantly limp to the floorboards.`,
  `A brutal pommel-strike to his sternum knocks the breath clean out of him; he doubles over, drops his weapon, and collapses gasping and defeated into the grime.`,
  `You step inside his guard, wrench his weapon free with your crossguard, and drive a savage elbow into his collarbone that puts him flat on his back, clutching his shoulder in agony.`,
  `You sweep the flat of the iron hard into his lead knee and shove him back—he crashes sprawling into an empty curing bench, dazed and unable to rise.`
];
const finishNonlethalBludgeoning = [
  `A concussive crack from the haft catches him square across the jaw—his knees give out beneath him and he drops limp into the sawdust.`,
  `You drive the blunt end of the weapon hard into his solar plexus. The air explodes from his lungs in a choked rasp as he folds up and crashes unconscious to the boards.`,
  `A sharp, snapping strike across his collarbone shatters his stance, knocking him sideways into a salt vat where he slumps groaning in surrender.`,
  `You sweep his legs out from under him and plant the heavy wood across his chest, pinning him breathless to the floor until he throws up his hands in defeat.`,
  `An overhand strike with the shaft catches him across the shoulder, driving him down onto both knees with the fight battered completely out of him.`
];
const finishNonlethalPiercing = [
  `You feint with the point, step past his clumsy swing, and bring the weighted hilt down hard behind his ear, dropping him cold into the dirt.`,
  `You hook his wrist, wrenching the cudgel from his hand with a sharp twist, and drive your knee hard into his gut to send him gasping to the floor.`,
  `A vicious strike with the crossguard catches him across the bridge of his nose—he stumbles back, clutching his face in dazed surrender as his knees buckle.`,
  `You trap his lead arm and slam him backward over a salting trough, the breath knocking out of him as he slumps motionless in defeat.`,
  `You drive a short, heavy pommel-blow to his ribs that cracks his guard wide open, sending him crashing down into a stack of cedar staves.`
];
const finishNonlethalRanged = [
  `You loose on a low trajectory—the quarrel clips the guard's knee, sending him crashing hard onto the floorboards with all the fight knocked clean out of him.`,
  `Your shot punches clean through the guard's forearm bracer, shattering his grip on his cudgel and driving him stumbling back into a curing bench, groaning in defeat.`,
  `The missile pins the heavy wool of the guard's sleeve to a cedar upright with jarring force, spinning him around before he collapses dazed into an empty salt bin.`,
  `A precise shot grazes his shoulder with concussive force, spinning him off-balance and sending him crashing headfirst into an empty firkin, where he lies motionless.`,
  `Your shot splinters the cudgel in the guard's grip, the shockwave numbing his arm and dropping him to his knees in stunned surrender.`
];
const finishNonlethalRayOfFrost = [
  `The pale ray numbs his limbs to the bone—his legs lock rigid with bitter frost and he topples over into the sawdust, shivering violently and unable to fight.`,
  `Rime washes over the guard's shoulders with concussive chill, sapping all strength from his arms until his cudgel clatters to the floor and he sinks down shivering.`,
  `The bitter cold stops the guard's charge dead in its tracks, dropping him to his knees in the brine, teeth chattering too violently to rise.`
];
const finishNonlethalFireBolt = [
  `The concussive heat of the fire-mote blasts the cudgel from the guard's smoking grip, throwing him backward into a curing bench where he slumps unconscious.`,
  `The searing flash detonates at the guard's feet, knocking him off his stride and sending him crashing hard against the timber wall, dazed and defeated.`,
  `A scorching blast of superheated air knocks the wind completely out of him, dropping him to his knees clutching his singed collar in surrender.`
];
const finishNonlethalEldritchBlast = [
  `A concussive shockwave of arcane force lifts him clean off his boots, slamming him into a stack of brine barrels where he slumps out cold.`,
  `The force bolt punches into his chest like a battering ram, knocking all breath from his lungs as he crashes unconscious to the cedar boards.`,
  `Pure kinetic thunder catches him mid-stride, hurling him sideways across the shed into stunned, motionless defeat.`
];
const finishNonlethalChillTouch = [
  `The spectral grip drains the warmth and vigor from his limbs, leaving him too weak to stand as he collapses limp into the sawdust.`,
  `A sudden wave of numbing grave-chill saps all strength from his frame, dropping him to the floorboards shivering and exhausted.`,
  `The icy touch numbs his hands to lead; his cudgel falls from limp fingers as he sinks down in complete surrender.`
];
const finishNonlethalViciousMockery = [
  `The stinging psychic insult breaks his nerve completely—he drops his cudgel with a groan of despair and slumps against the wall, head in hands.`,
  `The cruel cadence rings behind his eyes with unbearable pressure, driving him down to both knees clutching his pounding skull in defeat.`,
  `The barbed words shatter whatever bluster he had left, leaving him trembling and defeated in the gloomy shed.`
];
const finishNonlethalMagicMissile = [
  `Three glowing darts of force strike his chest with concussive thuds, knocking him flat on his back where he lies stunned and breathless.`,
  `The force missiles impact in rapid succession, bowling him backward into an empty cedar crate and knocking him cold.`,
  `Arcane force punches into his shoulders, spinning him around and dropping him limp to the brine-soaked floor.`
];

function getEncounterConfig(enemyKey, weapon) {
  if (enemyKey === 'silt_lurker') {
    return {
      title: 'Maura\'s Cellar: Silt-Lurker Lacedon',
      victoryProse: 'Silence returns to the culvert drain, the black water settling still around the carcass. You drag it up onto a dry ledge of collapsed brick, torch guttering, chest heaving in the cold mineral air.',
      rescueProse: 'A blow you don\'t fully see connects, and your legs go out from under you into the freezing silt. Above, you hear Maura swear and the heavy scrape of the old crane windlass.',
      enemies: [
        { name: 'Silt-Lurker Lacedon', epithet: 'the creature', hp: 12, maxHp: 12, ac: 12, atk: 4, dmgSides: 6, dmgBonus: 2, slot: 1 }
      ],
      weaponHitsMelee: [
        `You drive your ${weapon} home. The strike bites deep into water-logged muscle, and the creature thrashes back with a strangled screech.`,
        `You wait for its lunge to overextend, then step inside its reach and bring your ${weapon} across in a short, vicious arc—black blood clouds the water as it recoils.`,
        `You catch its first strike on instinct, twisting your weight past its claws, and drive your ${weapon} in hard along its flank. The creature convulses, hissing through a mouthful of broken teeth.`,
        `You drive your ${weapon} across its submerged shoulder, tearing through water-logged hide and drawing a violent lash of its tail.`,
        `You time the surge of the current and strike true, your ${weapon} biting deep into its neck before it can submerge.`
      ],
      weaponMissesMelee: [
        `Your ${weapon} scrapes off wet scale and old chitin, throwing you half a step off balance in the current.`,
        `You lunge, but the current drags at your legs, and your ${weapon} bites nothing but black water.`,
        `The creature twists aside at the last instant, and your ${weapon} carves an empty arc through torchlit spray.`,
        `The lacedon thrashes in a spray of brackish foam, and your ${weapon} glances harmlessly off a mortared culvert arch.`,
        `A sudden swirl of muddy silt obscures your vision, and your strike cuts empty air above the waterline.`
      ],
      weaponHitsRanged: [
        `Your shot punches into the creature's flank with a wet thud, and it recoils with a furious hiss, black water churning around the wound.`,
        `You track its motion through the murk and loose on the turn—the missile catches the creature mid-lunge, sending it skidding backward through the churned foam.`,
        `Timing the current's pull, you put the shot square into its exposed throat as it surfaces. It reels back, hissing, clawing at the wound.`,
        `The shot skims the dark surface and takes the creature between the shoulders, pinning its movement for a crucial second.`,
        `You loose straight down into the ripple as it dives—the missile strikes home, and black ichor boils to the surface.`
      ],
      weaponMissesRanged: [
        `Your shot goes wide, vanishing into the black water with barely a ripple.`,
        `The creature dips beneath a wave of churned silt just as you loose, and your shot passes clean through empty water.`,
        `Your aim wavers on the shifting current, and the shot skips off a submerged stone short of its mark.`,
        `A sudden burst of spray from the culvert flume knocks your aim aside, the shot embedding into an ancient ceiling brick.`,
        `The creature dives beneath the silt line just as your bowstring sings, leaving only churning bubbles in its wake.`
      ],
      slotHits: [
        [
          `The thing surges out of the dark water in a wet lunge, ragged claws raking for your ribs.`,
          `It closes the gap in a single thrashing lunge, catching you off-balance against the current before you can set your feet.`,
          `It comes up beneath you where the torchlight doesn't reach, claws finding purchase before you can twist away.`,
          `The lacedon whips its tail through the murky water, knocking your footing askew as cold claws rake your thigh.`,
          `A sudden surge of black water heralds its strike as jagged teeth clamp down hard against your forearm.`
        ]
      ],
      slotMisses: [
        [
          `It lunges out of the water, but you're already moving, and the claws rake nothing but torchlit air.`,
          `You throw your weight back as it surges up out of the murk, and its claws rake past a hair's breadth from your throat.`,
          `It misjudges the current's drag, overshooting, and you sidestep into the space it just vacated.`,
          `It lunges with dripping jaws, but you shove off a submerged masonry pillar, letting the creature snap shut on empty current.`,
          `The lacedon overreaches on its leap, thrashing against an iron grate as you pull your guard clear.`
        ]
      ]
    };
  } else if (enemyKey === 'rennick_guards') {
    return {
      title: 'Curing Shed: Rennick\'s Dock-Guards',
      isNonlethal: true,
      victoryProse: 'With the bailiffs driven off, silence returns to the salt shed save for the drip of fish brine and the soft crying of the workers.',
      rescueProse: 'A cudgel catches you solid across the ribs and your legs buckle, the shed tilting sideways as rough hands haul you away.',
      enemies: [
        { name: 'Rennick\'s Dock-Guard (Left)', epithet: 'the left guard', hp: 8, maxHp: 8, ac: 12, atk: 2, dmgSides: 4, dmgBonus: 0, slot: 1 },
        { name: 'Rennick\'s Dock-Guard (Right)', epithet: 'the right guard', hp: 8, maxHp: 8, ac: 12, atk: 2, dmgSides: 4, dmgBonus: 0, slot: 2 }
      ],
      weaponHitsMelee: [
        `Your ${weapon} connects solidly, and the guard staggers back with a pained grunt, boots skidding on the wet floorboards.`,
        `You close the distance in a single step and bring your ${weapon} around hard—the guard doubles over with the breath knocked clean out of him, clutching bruised ribs.`,
        `You catch the guard mid-swing and turn his own momentum against him, your ${weapon} connecting solid enough to drop him back a full step, cursing.`,
        `You sidestep his clumsy rush and drive your ${weapon} into his flank, knocking him sideways into a salt trough.`,
        `A crisp, snapping strike catches him across the collarbone, sending him stumbling back through the fish crates.`
      ],
      weaponMissesMelee: [
        `Your ${weapon} whistles past as the guard twists aside, cursing through gritted teeth.`,
        `You commit to the strike, but the guard reads it early and rolls his shoulder clear, your ${weapon} finding nothing but damp air.`,
        `The guard backpedals into a stack of brine barrels, and your ${weapon} falls short by a hand's width.`,
        `He knocks your strike aside with the heavy iron ferrule of his cudgel, sneering through clenched teeth.`,
        `A slippery patch of brine underfoot robs your strike of purchase, your ${weapon} falling short of his jaw.`
      ],
      weaponHitsRanged: [
        `Your shot punches into the guard's shoulder, throwing his footing off balance as he collides with a split-cedar drying rack.`,
        `You lead the guard's stumbling retreat and put the shot square into him before he can find his footing, driving him back with a pained curse.`,
        `The shot catches him mid-shout, snapping his head back and dropping him a step, cursing through the pain.`,
        `Your shot drives through his forearm guard, forcing him to drop his cudgel to the floorboards with a sharp cry.`,
        `You loose on a low trajectory—the missile grazes his thigh, spoiling his charge and spinning him half around.`
      ],
      weaponMissesRanged: [
        `Your shot skips off an overhead timber as the guard ducks aside with a sharp curse.`,
        `The guard ducks behind a swinging drying rack just as you loose, and the shot buries itself in wet cedar instead.`,
        `Your shot goes wide as the guard lunges sideways, cursing, putting a stack of firkins between you.`,
        `He ducks behind a heavy salt vat, the shot thudding harmlessly into brine-soaked cedar.`,
        `Dense smoke from the peat hearth drifts between you, and your shot skips off the iron hoop of a fish firkin.`
      ],
      slotHits: [
        [
          `The guard on your left drives a cudgel into you, the iron-banded head glancing off with a dull, ringing thud.`,
          `The guard on your left closes fast and gets his cudgel in low, catching you across the ribs before you can turn to meet him.`,
          `The guard on your left feints high, then drives the cudgel in beneath your guard with jarring force.`,
          `The left guard bull-rushes you with his shoulder, following up with a brutal kidney check from his cudgel.`,
          `A sweeping backhand swing from the left guard catches you across the chest, knocking the wind from your lungs.`
        ],
        [
          `The other guard closes from your right and lands a solid blow with his own cudgel, iron-banded wood cracking across your shoulder.`,
          `The guard on your right times his strike to your footing, catching you along the collarbone before you can pull back.`,
          `The guard on your right drives in low and fast, iron-banded wood catching you hard across the hip.`,
          `The right guard corners you against a salting bench, driving the butt of his cudgel hard into your ribs.`,
          `The right guard feints low and snaps the iron-shod wood upward, catching your shoulder in a jarring shock of pain.`
        ]
      ],
      slotMisses: [
        [
          `The guard on your left swings wide, splintering a drying rack instead of your ribs.`,
          `The guard on your left overcommits to the swing, and you slip aside as the cudgel shatters an empty curing bench behind you.`,
          `You read the guard on your left a half-second early and step inside his swing, the cudgel whistling wide over your shoulder.`,
          `The left guard swings a heavy downward chop, but you duck beneath the arc as the cudgel splinters an empty fish box.`,
          `The left guard attempts to hook your ankle with his boot, but you keep your balance and pivot out of his reach.`
        ],
        [
          `The guard on your right lunges in, but his swing goes wide and buries the cudgel in a stack of empty firkins instead.`,
          `The guard on your right telegraphs the swing, and you twist clear as the cudgel gouges deep into a heavy cedar post.`,
          `You catch the guard on your right's wrist mid-swing, throwing the blow wide into the salt-crusted floorboards.`,
          `The right guard tries to pin your arm against the wall, but you wrench free before his club can land.`,
          `The right guard slips on wet fish scales as he commits to his swing, stumbling past you into the shadows.`
        ]
      ]
    };
  }

  // Default: granary_rats
  return {
    title: 'Upper Weir Granary Undercroft: 3 Black Mire-Rats',
    victoryProse: 'Silence settles over the cold undercroft, broken only by the steady vibration of the weir flume outside. You climb back up into the warm loft, dusting grey flour chaff from your boots and cloak.',
    rescueProse: 'A sudden lunge from the dark knocks you back against the stone pier, and you scramble backward up the stairs—just as Bran throws open the hatch and hauls you bodily up into the dry light.',
    enemies: [
      { name: 'Black Mire-Rat (Lead)', epithet: 'the lead mire-rat', hp: 4, maxHp: 4, ac: 9, atk: 2, dmgSides: 4, dmgBonus: 0, slot: 1 },
      { name: 'Black Mire-Rat (Flank)', epithet: 'the flanking mire-rat', hp: 4, maxHp: 4, ac: 9, atk: 2, dmgSides: 4, dmgBonus: 0, slot: 2 },
      { name: 'Black Mire-Rat (Rafters)', epithet: 'the third mire-rat', hp: 4, maxHp: 4, ac: 9, atk: 2, dmgSides: 4, dmgBonus: 0, slot: 3 }
    ],
    weaponHitsMelee: [
      `Your ${weapon} catches one of the mire-rats mid-scramble across a toppled grain crate, and it drops among the spilled barley with a final, wet twitch.`,
      `You track the scrabbling motion in the gloom and bring your ${weapon} down fast—one of the mire-rats goes still in the flour dust.`,
      `You plant your feet and let the mire-rat come to you, your ${weapon} catching it clean as it leaps, dropping it into the meal-chaff.`,
      `Your ${weapon} sweeps low along the stone flags, catching a mire-rat as it darts from behind a flour sack.`,
      `You pin the screeching beast to the floorboards with a fast, decisive downward strike of your ${weapon}.`
    ],
    weaponMissesMelee: [
      `Your ${weapon} splits a stack of dry cedar staves instead, and the mire-rats scatter through the settling flour dust before darting back in.`,
      `You swing at a blur of motion that isn't there anymore, your ${weapon} thudding into an empty grain bin.`,
      `The mire-rat darts under a fallen flour crate before your ${weapon} can find it, vanishing back into the dark piers.`,
      `The mire-rat scrambles up a cedar upright and leaps over your head, your ${weapon} shaving splinters from the post.`,
      `A cloud of disturbed oat chaff stings your eyes, and your strike thuds into a sack of coarse grain instead.`
    ],
    weaponHitsRanged: [
      `Your shot finds one of the mire-rats mid-scramble across a toppled grain sack, pinning it against the stone foundation pier.`,
      `You track the scrabbling motion and loose on the turn—the shot catches one of the mire-rats clean, dropping it among the spilled rye.`,
      `You wait for a clear line between the burlap sacks and put the shot through, dropping the creature instantly among the spilled barley.`,
      `Your shot pins the mire-rat mid-leap, driving it into an overturned barrel of rye.`,
      `You lead the creature's frantic zig-zag across the undercroft and strike it clean through the chest.`
    ],
    weaponMissesRanged: [
      `Your shot skips off a stone foundation pier instead, and the mire-rats scatter through the settling dust before darting back in.`,
      `The mire-rat vanishes behind a grain bin just as you loose, and the shot buries itself in old cedar instead.`,
      `Your shot goes wide in the cramped undercroft, skittering off a stone wall and burying itself in a heap of damp sacking.`,
      `The mire-rat darts beneath an iron-bound grain hopper, and your shot ricochets off the stone footing.`,
      `The flume's heavy thrum shakes your release just enough to send the missile wide into a pile of rotting straw.`
    ],
    slotHits: [
      [
        `The lead mire-rat gets a claw in, a thin scratch of pain through the meal-dust and gloom.`,
        `The lead mire-rat springs from a gap in the stone foundations and catches your forearm before you can pull it clear.`,
        `The lead mire-rat darts between your boots and sinks in at the ankle, quick and vicious.`,
        `The lead mire-rat darts from beneath a floor joist and sinks its incisors into the meat of your palm.`,
        `The lead mire-rat lunges straight forward, its claws tearing a sharp welt across your forearm before you tear it away.`
      ],
      [
        `The flanking mire-rat darts in low and catches your calf, needle teeth finding purchase through your leggings.`,
        `The flanking mire-rat comes at you from the side while you're still recovering, teeth grazing your wrist.`,
        `The flanking mire-rat leaps from a toppled oat crate and lands a bite before you can turn to meet it.`,
        `The flanking mire-rat springs from a high sack of rye, landing across your shoulder and raking at your neck.`,
        `A low strike from the flanking mire-rat catches the back of your knee, needle teeth drawing a sharp hiss of pain.`
      ],
      [
        `The third mire-rat drops from the rafters above and sinks in hard before you can shake it loose.`,
        `The third mire-rat comes at you from behind while the others hold your attention, teeth finding your shoulder.`,
        `The third mire-rat scrabbles across a burlap sack and leaps, catching you across the back of the hand.`,
        `The third mire-rat bursts from a torn burlap bag and buries its teeth in your hip.`,
        `A frantic rush from the third mire-rat catches your off-hand, its sharp claws tearing your skin.`
      ]
    ],
    slotMisses: [
      [
        `The lead mire-rat lunges for your boot and gets nothing but a mouthful of hardened leather.`,
        `The lead mire-rat springs for your hand, and you snatch it back just in time, the teeth clicking shut on empty air.`,
        `The lead mire-rat scrabbles up your leg, but you kick your heel back hard, shaking it loose to tumble into the dust.`,
        `The lead mire-rat snaps at your fingers, but you smack it away with the flat of your guard.`,
        `The lead mire-rat scrabbles against the slick stone flags, failing to find purchase for its leap.`
      ],
      [
        `The flanking mire-rat scrabbles up a fallen crate and lunges, missing by a hand's width and thudding into the stone.`,
        `The flanking mire-rat lunges for your calf, and you kick it clear before the teeth can close.`,
        `The flanking mire-rat darts in from the side, but you're already turning, and it skids past into a pile of loose grain.`,
        `The flanking mire-rat tries to flank you through the meal bins, but you slam the lid shut on its snout.`,
        `The flanking mire-rat darts between your boots, but you stomp down hard, forcing it to scramble back into the dark.`
      ],
      [
        `The third mire-rat snaps at your wrist from the shadows, but you snatch your hand back in time, the teeth clicking shut on empty air.`,
        `The third mire-rat drops from a foundation ledge, and you twist clear just as it lands where you'd been standing.`,
        `The third mire-rat lunges out of the dark, and you catch it mid-air with a forearm, sending it tumbling into the dust.`,
        `The third mire-rat leaps from an archway, but you swat it out of the air mid-flight.`,
        `The third mire-rat hesitates at the edge of the lantern light, hissing in frustration as you turn to face it.`
      ]
    ]
  };
}

function runMockFight(fightNum, build, enemyKey) {
  const enc = getEncounterConfig(enemyKey, build.weapon);
  console.log(`\n======================================================================`);
  console.log(`FIGHT #${fightNum}: ${build.name} vs ${enc.title}`);
  console.log(`======================================================================`);

  let hp = build.hp;
  const maxHp = build.maxHp;
  let tempHp = 0;
  let isRaging = false;
  let rageUses = build.rageUses || 0;
  let secondWindUses = build.secondWind || 0;
  let spellSlots = build.spellSlots || 0;
  let shieldArmed = false;
  let hexActive = false;
  let agathysActive = false;
  let enemyDisadvantage = false;

  const enemies = enc.enemies.map(e => ({ ...e }));
  let round = 1;
  const weapon = build.weapon;

  while (round <= 10) {
    const living = enemies.filter(e => e.hp > 0);
    if (living.length === 0) break;
    if (hp <= 1) break;

    console.log(`\n[⚔️ Round ${round}]`);
    for (const e of enemies) {
      console.log(`[${e.name}: HP ${Math.max(0, e.hp)}/${e.maxHp}${e.hp <= 0 ? ' (Down)' : ''} (AC ${e.ac})]`);
    }
    console.log(`[You: HP ${hp}/${maxHp}${tempHp > 0 ? ' (+' + tempHp + ' Temp HP)' : ''} (AC ${build.ac})]`);
    if (shieldArmed) console.log(`[✨ Shield Armed — will trigger on the next hit]`);
    if (hexActive) console.log(`[🔮 Hex Active — +1d6 Necrotic Damage on all hits]`);
    if (agathysActive) console.log(`[❄️ Armor of Agathys Active — ${tempHp} Temp HP | 5 Cold Damage Retaliation]`);

    const target = living[0];

    // Player action
    let playerAction = 'attack';
    if (build.cantrip) playerAction = 'cantrip';
    if (build.spell && spellSlots > 0 && Math.random() > 0.5) playerAction = 'spell';
    if (build.class === 'barbarian' && !isRaging && rageUses > 0) playerAction = 'rage';
    if (build.class === 'fighter' && secondWindUses > 0 && hp <= Math.floor(maxHp / 2)) playerAction = 'second_wind';

    if (playerAction === 'rage') {
      isRaging = true;
      rageUses--;
      console.log(`\n> [Rage] A hot, roaring pressure floods your chest, dulling the pain and the fear to nothing at all.`);
    } else if (playerAction === 'second_wind') {
      secondWindUses--;
      const heal = rollD(10) + 1;
      hp = Math.min(maxHp, hp + heal);
      console.log(`\n> [Second Wind] A surge of stubborn discipline steadies your breathing. [🩸 Hit Points: ${hp} / ${maxHp}]`);
    } else if (playerAction === 'spell' && build.spell === 'armor_of_agathys') {
      spellSlots--;
      agathysActive = true;
      tempHp = 5;
      console.log(`\n> [Spell: Armor of Agathys] A brittle casing of translucent rime coats your harness. [🛡️ Armor of Agathys: +5 Temp HP | 5 Cold Damage Retaliation on Hits]`);
    } else if (playerAction === 'spell' && build.spell === 'hex') {
      spellSlots--;
      hexActive = true;
      console.log(`\n> [Spell: Hex] Dark, spectral runes flare briefly across ${target.epithet}. [🔮 Hex Active — +1d6 Necrotic Damage on all hits]`);
    } else if (playerAction === 'spell' && build.spell === 'shield' && !shieldArmed) {
      shieldArmed = true;
      console.log(`\n> [Spell: Shield] You hold the barrier-spell coiled and ready. [✨ Shield Readied — will trigger automatically on the next hit]`);
    } else if (playerAction === 'spell' && build.spell === 'magic_missile') {
      spellSlots--;
      const dmg = (rollD(4) + 1) + (rollD(4) + 1) + (rollD(4) + 1);
      target.hp -= dmg;
      console.log(`\n> [Spell: Magic Missile]`);
      if (target.hp <= 0) {
        if (enc.isNonlethal) {
          console.log(finishNonlethalMagicMissile[Math.floor(Math.random() * finishNonlethalMagicMissile.length)]);
        } else {
          console.log(finishMagicMissile[Math.floor(Math.random() * finishMagicMissile.length)]);
        }
        console.log(`[💀 ${target.name} Defeated: ${dmg} Force damage]`);
      } else {
        console.log(`Three glowing force darts burst from your fingertips, curving unerringly to slam home.`);
        console.log(`[✨ Magic Missile: Automatic Hit | ${dmg} Force damage]`);
      }
    } else if (playerAction === 'spell' && build.spell === 'dissonant_whispers') {
      spellSlots--;
      const roll = rollD(20);
      const saveSuccess = (roll + 1) >= 12;
      let dmg = rollD(6) + rollD(6) + rollD(6);
      if (saveSuccess) dmg = Math.floor(dmg / 2);
      target.hp -= dmg;
      console.log(`\n> [Spell: Dissonant Whispers]`);
      if (target.hp <= 0) {
        if (enc.isNonlethal) {
          console.log(`The discordant screech behind his eyes overwhelms his senses—he drops his weapon and collapses in defeat.`);
        } else {
          console.log(`The discordant psychic agony shatters its mind from the inside out—it gasps once and goes limp.`);
        }
        console.log(`[💀 ${target.name} Defeated: ${dmg} Psychic Damage]`);
      } else if (!saveSuccess) {
        console.log(`You whisper a jarring, dissonant phrase. ${target.epithet} clutches its skull in agony.`);
        console.log(`[🧠 Dissonant Whispers: Failed Save | ${dmg} Psychic Damage]`);
      } else {
        console.log(`The phrase reverberates through the space, but ${target.epithet} recoils just enough to weather the assault.`);
        console.log(`[🧠 Dissonant Whispers: Saved | Half Damage: ${dmg} Psychic Damage]`);
      }
    } else if (playerAction === 'cantrip') {
      const d20 = rollD(20);
      const statMod = build.intMod || build.chaMod || 0;
      const hit = (d20 + statMod + 2) >= target.ac;
      console.log(`\n> [Cantrip: ${build.cantrip}] (Roll: ${d20} + ${statMod + 2} vs AC ${target.ac})`);

      if (hit) {
        let dmg = 0;
        if (build.cantrip === 'ray_of_frost') dmg = rollD(8);
        else if (build.cantrip === 'fire_bolt') dmg = rollD(10);
        else if (build.cantrip === 'eldritch_blast') dmg = rollD(10);
        else if (build.cantrip === 'chill_touch') dmg = rollD(8);
        else if (build.cantrip === 'vicious_mockery') dmg = rollD(4);

        if (hexActive) dmg += rollD(6);
        target.hp -= dmg;

        if (target.hp <= 0) {
          if (enc.isNonlethal) {
            if (build.cantrip === 'ray_of_frost') console.log(finishNonlethalRayOfFrost[Math.floor(Math.random() * finishNonlethalRayOfFrost.length)]);
            else if (build.cantrip === 'fire_bolt') console.log(finishNonlethalFireBolt[Math.floor(Math.random() * finishNonlethalFireBolt.length)]);
            else if (build.cantrip === 'eldritch_blast') console.log(finishNonlethalEldritchBlast[Math.floor(Math.random() * finishNonlethalEldritchBlast.length)]);
            else if (build.cantrip === 'chill_touch') console.log(finishNonlethalChillTouch[Math.floor(Math.random() * finishNonlethalChillTouch.length)]);
            else if (build.cantrip === 'vicious_mockery') console.log(finishNonlethalViciousMockery[Math.floor(Math.random() * finishNonlethalViciousMockery.length)]);
          } else {
            if (build.cantrip === 'ray_of_frost') console.log(finishRayOfFrost[Math.floor(Math.random() * finishRayOfFrost.length)]);
            else if (build.cantrip === 'fire_bolt') console.log(finishFireBolt[Math.floor(Math.random() * finishFireBolt.length)]);
            else if (build.cantrip === 'eldritch_blast') console.log(finishEldritchBlast[Math.floor(Math.random() * finishEldritchBlast.length)]);
            else if (build.cantrip === 'chill_touch') console.log(finishChillTouch[Math.floor(Math.random() * finishChillTouch.length)]);
            else if (build.cantrip === 'vicious_mockery') console.log(finishViciousMockery[Math.floor(Math.random() * finishViciousMockery.length)]);
          }
          console.log(`[💀 ${target.name} Defeated: ${dmg} Damage]`);
        } else {
          if (build.cantrip === 'ray_of_frost') {
            enemyDisadvantage = true;
            console.log(`A pale ray of unnatural cold catches ${target.epithet} square on, rime crackling across the impact.`);
            console.log(`[❄️ Ray of Frost: Hit | ${dmg} Cold damage | ⚠️ Slowed — disadvantage on its next attack]`);
          } else if (build.cantrip === 'fire_bolt') {
            console.log(`A searing bead of fire streaks from your fingers, striking ${target.epithet} with a violent burst of sparks.`);
            console.log(`[🔥 Fire Bolt: Hit | ${dmg} Fire damage]`);
          } else if (build.cantrip === 'eldritch_blast') {
            console.log(`A jagged streak of violet force slams into ${target.epithet} with the concussive boom of shattered timber.`);
            console.log(`[✨ Eldritch Blast: Hit | ${dmg} Force damage]`);
          } else if (build.cantrip === 'chill_touch') {
            console.log(`A ghostly hand wreathed in necrotic mist closes around ${target.epithet}, sapping warmth.`);
            console.log(`[💀 Chill Touch: Hit | ${dmg} Necrotic damage]`);
          } else if (build.cantrip === 'vicious_mockery') {
            enemyDisadvantage = true;
            console.log(`Your cutting cadence lands with surgical precision against ${target.epithet}—its balance and nerve falter.`);
            console.log(`[🎭 Vicious Mockery: Hit | ${dmg} Psychic damage | ⚠️ Rattled — disadvantage on its next attack]`);
          }
        }
      } else {
        if (build.cantrip === 'ray_of_frost') console.log(`The ray splashes past, freezing nothing but the damp air.\n[💨 Miss]`);
        else if (build.cantrip === 'fire_bolt') console.log(`The mote of fire streaks wide, scorching nothing but empty air.\n[💨 Miss]`);
        else if (build.cantrip === 'eldritch_blast') console.log(`The beam tears past and shatters against whatever's standing behind it.\n[💨 Miss]`);
        else if (build.cantrip === 'chill_touch') console.log(`The spectral hand dissolves into harmless mist a hair's breadth short.\n[💨 Miss]`);
        else if (build.cantrip === 'vicious_mockery') console.log(`Whatever passes for pride in ${target.epithet} shrugs the insult off.\n[💨 Resisted]`);
      }
    } else {
      // Weapon attack
      const d20 = rollD(20);
      const statMod = build.weaponType === 'ranged' ? build.dexMod : (build.weaponType === 'finesse' ? Math.max(build.strMod, build.dexMod) : build.strMod);
      const hit = (d20 + statMod + 2) >= target.ac;
      console.log(`\n> [Weapon: ${weapon}] (Roll: ${d20} + ${statMod + 2} vs AC ${target.ac})`);

      if (hit) {
        let dmg = rollD(build.weaponType === 'ranged' ? 8 : 8) + statMod;
        if (isRaging) dmg += 2;
        if (hexActive) dmg += rollD(6);
        target.hp -= dmg;

        if (target.hp <= 0) {
          let pool = finishSlashing;
          if (enc.isNonlethal) {
            if (build.weaponType === 'ranged') pool = finishNonlethalRanged;
            else if (build.weaponDamageType === 'slashing') pool = finishNonlethalSlashing;
            else if (build.weaponDamageType === 'bludgeoning') pool = finishNonlethalBludgeoning;
            else if (build.weaponDamageType === 'piercing') pool = finishNonlethalPiercing;
          } else {
            if (build.weaponType === 'ranged') pool = finishRanged;
            else if (build.weaponDamageType === 'slashing') pool = finishSlashing;
            else if (build.weaponDamageType === 'bludgeoning') pool = finishBludgeoning;
            else if (build.weaponDamageType === 'piercing') pool = finishPiercing;
          }
          console.log(pool[Math.floor(Math.random() * pool.length)]);
          console.log(`[💀 ${target.name} Defeated: ${dmg} Damage]`);
        } else {
          const hits = build.weaponType === 'ranged' ? enc.weaponHitsRanged : enc.weaponHitsMelee;
          console.log(hits[Math.floor(Math.random() * hits.length)]);
          console.log(`[⚔️ Hit: ${dmg} damage]`);
        }
      } else {
        const misses = build.weaponType === 'ranged' ? enc.weaponMissesRanged : enc.weaponMissesMelee;
        console.log(misses[Math.floor(Math.random() * misses.length)]);
        console.log(`[💨 Miss]`);
      }
    }

    // Check if all dead after player action
    if (enemies.filter(e => e.hp > 0).length === 0) {
      console.log(`\n======================================================================`);
      console.log(`VICTORY! All opponents defeated in Round ${round}!`);
      console.log(enc.victoryProse);
      console.log(`======================================================================`);
      return;
    }

    // Enemy Turn: Each living enemy attacks
    for (const enemy of enemies) {
      if (enemy.hp <= 0) continue;

      let d20 = rollD(20);
      if (enemyDisadvantage) {
        const d20b = rollD(20);
        d20 = Math.min(d20, d20b);
      }

      let enemyHit = (d20 + enemy.atk) >= (build.ac + (build.fightingStyle === 'defense' ? 1 : 0));
      let dmg = rollD(enemy.dmgSides) + enemy.dmgBonus;
      if (isRaging) dmg = Math.floor(dmg / 2);

      console.log(''); // newline spacing per enemy

      if (shieldArmed) {
        if (enemyHit) {
          if ((d20 + enemy.atk) < (build.ac + 5)) {
            enemyHit = false;
            shieldArmed = false;
            console.log(`A shimmering lattice of force flares to life around you on pure reflex, deflecting the strike a hair's breadth away.`);
            console.log(`[✨ Shield Holds | 💨 ${enemy.name} Misses]`);
          } else {
            shieldArmed = false;
            console.log(`A shimmering lattice of force flares to life around you on pure reflex, but the blow crashes through it anyway, striking home regardless.`);
            console.log(`[✨ Shield Broken Through | 🩸 ${enemy.name} Hits: ${dmg} damage | HP: ${hp} / ${maxHp}]`);
          }
        }
      }

      if (!shieldArmed && enemyHit) {
        const slotIdx = enemy.slot - 1;
        const hits = enc.slotHits[slotIdx] || enc.slotHits[0];
        console.log(hits[Math.floor(Math.random() * hits.length)]);

        if (agathysActive) {
          enemy.hp -= 5;
          if (tempHp <= dmg) {
            agathysActive = false;
            tempHp = 0;
            console.log(`As the blow lands, your frost-sheathe shatters violently in a burst of crystalline rime, driving shards of biting cold deep into ${enemy.epithet}!`);
            console.log(`[❄️ Armor of Agathys: 5 Cold Damage dealt to ${enemy.name} | Frost Armor Shattered]`);
          } else {
            tempHp -= dmg;
            console.log(`As the blow lands, the rime holding across your harness pulses with bitter frost, biting into ${enemy.epithet} while your armor holds!`);
            console.log(`[❄️ Armor of Agathys: 5 Cold Damage dealt to ${enemy.name} | ${tempHp} Temp HP remaining]`);
          }
          if (enemy.hp <= 0) {
            console.log(`Spectral frost surges backward along its strike, leaving it frozen rigid as it collapses to the floor.`);
            console.log(`[💀 ${enemy.name} Defeated — Killed by Its Own Strike]`);
          }
        }

        if (tempHp > 0) {
          const absorbed = Math.min(tempHp, dmg);
          tempHp -= absorbed;
          dmg -= absorbed;
        }
        hp -= dmg;
        console.log(`[🩸 ${enemy.name} Hits: ${dmg} damage | HP: ${hp} / ${maxHp}]`);

        if (hp <= 1) {
          console.log(`\n======================================================================`);
          console.log(`RESCUED! (HP dropped to 1)`);
          console.log(enc.rescueProse);
          console.log(`======================================================================`);
          return;
        }
      } else if (!enemyHit && !shieldArmed) {
        const slotIdx = enemy.slot - 1;
        const misses = enc.slotMisses[slotIdx] || enc.slotMisses[0];
        console.log(misses[Math.floor(Math.random() * misses.length)]);
        console.log(`[💨 ${enemy.name} Misses]`);
      }
    }

    enemyDisadvantage = false;
    round++;
  }
}

// Run test fights
if (args.enemy === 'all') {
  console.log('\n>>> TESTING SILT-LURKER ENCOUNTER <<<');
  for (let i = 0; i < args.num; i++) {
    runMockFight(i + 1, BUILDS[i % BUILDS.length], 'silt_lurker');
  }
  console.log('\n>>> TESTING RENNICK GUARDS ENCOUNTER <<<');
  for (let i = 0; i < args.num; i++) {
    runMockFight(i + 1, BUILDS[i % BUILDS.length], 'rennick_guards');
  }
  console.log('\n>>> TESTING GRANARY RATS ENCOUNTER <<<');
  for (let i = 0; i < args.num; i++) {
    runMockFight(i + 1, BUILDS[i % BUILDS.length], 'granary_rats');
  }
} else {
  for (let i = 0; i < args.num; i++) {
    runMockFight(i + 1, BUILDS[i % BUILDS.length], args.enemy);
  }
}
