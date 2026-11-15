/*
 * ACTION FACTS -- combat facts for non-spell actions, class features, and maneuvers on the Battle HUD.
 * Mirrors the SPELL_FACTS structure generated from tools/spell_book.json so battlehud.js renders
 * computed hover cards uniformly without parsing ChoiceScript option prose.
 */
(function () {
  "use strict";

  var ACTION_FACTS = {
    bardic_inspiration: {
      name: "Bardic Inspiration",
      kind: "Class feature",
      cost: "bonus",
      resolution: "effect",
      die_stat: "bard_inspiration_die_sides",
      uses_stat: "bard_inspiration_uses",
      max_stat: "bard_inspiration_max",
      duration: "Until used",
      area: "Self or living ally",
      effect: "Grant a {die} inspiration die to turn a failed roll"
    },
    second_wind: {
      name: "Second Wind",
      kind: "Class feature",
      cost: "bonus",
      resolution: "heal",
      heal_dice: "1d10",
      add_level: true,
      uses_stat: "fighter_second_wind_uses",
      max_stat: "fighter_second_wind_max",
      duration: "Instantaneous",
      area: "Self",
      effect: "Regain hit points"
    },
    action_surge: {
      name: "Action Surge",
      kind: "Class feature",
      cost: "free",
      resolution: "effect",
      uses_stat: "fighter_action_surge_uses",
      max_stat: "fighter_action_surge_max",
      duration: "This turn",
      area: "Self",
      effect: "+1 additional action this turn"
    },
    rage: {
      name: "Rage",
      kind: "Class feature",
      cost: "bonus",
      resolution: "effect",
      bonus_stat: "barbarian_rage_damage_bonus",
      uses_stat: "barbarian_rage_uses",
      max_stat: "barbarian_rage_max",
      duration: "Until fight ends or incapacitated",
      area: "Self",
      effect: "+{bonus} damage on Strength melee hits; resistance to bludgeoning, piercing, and slashing"
    },
    arcane_ward: {
      name: "Arcane Ward",
      kind: "Class feature",
      cost: "bonus",
      resolution: "effect",
      ward_per_level: 2,
      duration: "Until ward is depleted or long rest",
      area: "Self",
      effect: "Expend a spell slot to restore ward HP"
    },
    magical_cunning: {
      name: "Magical Cunning",
      kind: "Class feature",
      cost: "bonus",
      resolution: "effect",
      duration: "Instantaneous",
      area: "Self",
      effect: "Regain {slots} Pact Magic {slot_word} once per long rest"
    },
    reckless_attack: {
      name: "Reckless Attack",
      kind: "Class feature",
      cost: "free",
      resolution: "effect",
      duration: "Until your next turn",
      area: "Self",
      effect: "Advantage on Strength attacks this turn; enemy attacks against you also have advantage"
    },
    dual_shot: {
      name: "Dual Shot",
      kind: "Fighting Style",
      cost: "action",
      resolution: "attack",
      attack_kind: "weapon",
      duration: "Instantaneous",
      area: "Two foes in weapon range",
      effect: "Two ranged weapon shots at disadvantage"
    },
    shove: {
      name: "Shove",
      kind: "Combat maneuver",
      cost: "action",
      resolution: "check",
      skill: "athletics",
      reach: "touch",
      duration: "Instantaneous",
      effect: "Athletics check vs. 10 + target's higher STR/DEX mod; pushes target 1 step to Close"
    },
    dash: {
      name: "Dash",
      kind: "Standard action",
      cost: "action",
      cunning_bonus: true,
      resolution: "effect",
      duration: "This turn",
      area: "Self",
      effect: "+1 extra move this turn"
    },
    dodge: {
      name: "Dodge",
      kind: "Standard action",
      cost: "action",
      resolution: "effect",
      duration: "Until your next turn",
      area: "Self",
      effect: "+5 AC; you cannot move this turn"
    },
    hide: {
      name: "Hide",
      kind: "Standard action",
      cost: "action",
      cunning_bonus: true,
      resolution: "check",
      skill: "stealth",
      dc_stat: "combat_hide_dc_value",
      duration: "Until spotted or next attack",
      area: "Self",
      effect: "Your next attack has advantage on a success"
    },
    intimidate: {
      name: "Intimidate",
      kind: "Standard action",
      cost: "action",
      resolution: "check",
      skill: "intimidation",
      dc_stat: "combat_intim_dc",
      duration: "Instantaneous",
      effect: "Forces a morale check on the target on a success"
    },
    disengage: {
      name: "Disengage",
      kind: "Standard action",
      cost: "action",
      cunning_bonus: true,
      resolution: "effect",
      duration: "Rest of this round",
      area: "Self",
      effect: "Movement does not provoke opportunity attacks this round"
    },
    swap_weapons: {
      name: "Swap Weapons",
      kind: "Combat action",
      cost: "free",
      resolution: "effect",
      duration: "Instantaneous",
      area: "Self",
      effect: "Swap your primary weapon and sidearm"
    },
    push_forward: {
      name: "Push forward",
      kind: "Movement",
      cost: "move",
      resolution: "effect",
      duration: "Instantaneous",
      effect: "Close 1 step toward the nearest foe (or step past an engaged foe; leaving reach provokes an opportunity attack unless Disengaged)"
    },
    fall_back: {
      name: "Fall back",
      kind: "Movement",
      cost: "move",
      resolution: "effect",
      duration: "Instantaneous",
      effect: "Move 1 step back (leaving reach provokes an opportunity attack unless Disengaged)"
    },
    trade_places: {
      name: "Trade places",
      kind: "Tactical movement",
      cost: "move",
      resolution: "effect",
      duration: "Instantaneous",
      effect: "Swap into the chokepoint while your ally steps back to Close"
    },
    call_ally_back: {
      name: "Call ally back",
      kind: "Tactical movement",
      cost: "move",
      resolution: "effect",
      duration: "Instantaneous",
      effect: "Call your ally out of the chokepoint to Close"
    },
    flee: {
      name: "Break off and run",
      kind: "Movement",
      cost: "move",
      resolution: "effect",
      duration: "Instantaneous",
      effect: "Flee the fight (leaving reach provokes an opportunity attack)"
    },
    use_item: {
      name: "Use item",
      kind: "Satchel",
      cost: "action",
      resolution: "effect",
      duration: "Instantaneous",
      effect: "Open your satchel to use a consumable item"
    },
    end_turn: {
      name: "End turn",
      kind: "Turn control",
      cost: "free",
      resolution: "effect",
      duration: "Instantaneous",
      effect: "End your turn and pass to the next combatant"
    },
    read: {
      name: "Read Scroll",
      kind: "Spell scrolls",
      cost: "action",
      resolution: "effect",
      duration: "Varies by scroll",
      effect: "Cast a spell from a scroll in your pack without a slot"
    },
    throw: {
      name: "Throw",
      kind: "Thrown items",
      cost: "action",
      resolution: "effect",
      reach: "medium",
      duration: "Varies by item",
      effect: "Hurl a flask or jug at a foe up to Mid-Range"
    },
    potions: {
      name: "Potions",
      kind: "Consumables",
      cost: "action",
      resolution: "effect",
      duration: "Varies by potion",
      area: "Self",
      effect: "Drink a potion or tonic from your pack"
    },
    items: {
      name: "Items",
      kind: "Special items",
      cost: "action",
      resolution: "effect",
      duration: "Varies by item",
      effect: "Use a special combat item"
    },
    shoot: {
      name: "Shoot Special Arrow",
      kind: "Ammunition",
      cost: "action",
      resolution: "attack",
      attack_kind: "weapon",
      duration: "Instantaneous",
      effect: "Loose a special arrow with your bow"
    }
  };

  window.ACTION_FACTS = ACTION_FACTS;
})();
