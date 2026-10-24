/*
 * crafting-data.js -- the recipes the crafting view matches the ingredient boxes against (window.CRAFT_RECIPES, by crafting kind).
 * Written by hand from Resources & Quest/ALCHEMY_CRAFTING_REFERENCE.md ("Standard crafting table"); change the table there and here together.
 * A recipe is two ingredients (item ids, in any order), the crafting check's DC, the shared alchemy property, an icon key (item-icons.js) and a one-line result.
 * The potions are not items yet: until they are, the crafting view only names what the boxes would make.
 */
window.CRAFT_RECIPES = {
  alchemy: [
    { id: "mending_draught", name: "Mending Draught", ingredients: ["sluice_moss", "glowmold"], dc: 15, property: "mend", icon: "potion_mending",
      summary: "The next proper sleep restores 2 extra HP." },
    { id: "brine_antivenom", name: "Brine Antivenom", ingredients: ["sluice_moss", "brinecap"], dc: 15, property: "resist_poison", icon: "potion_antivenom",
      summary: "For 4 hours: resistance to poison damage and advantage on saves against poison." },
    { id: "tidebreath_elixir", name: "Tidebreath Elixir", ingredients: ["brinecap", "pale_crackroot"], dc: 16, property: "hold_breath", icon: "potion_tidebreath",
      summary: "Ten minutes of held breath for one submerged route or dive." },
    { id: "darksight_tonic", name: "Darksight Tonic", ingredients: ["pale_crackroot", "cistern_spores"], dc: 18, property: "keen_sight", icon: "potion_darksight",
      summary: "For 4 hours: the dark no longer hampers sight if you have no darkvision." },
    { id: "fortifying_tonic", name: "Fortifying Tonic", ingredients: ["glowmold", "cistern_spores"], dc: 18, property: "fortify_health", icon: "potion_fortifying",
      summary: "Gain 4 temporary HP." },
    { id: "restful_balsam", name: "Restful Balsam", ingredients: ["silverleaf", "oakheart_balsam"], dc: 15, property: "mend_rest", icon: "potion_restful",
      summary: "The next proper sleep leaves you Well Rested for 12 hours: +1 to non-combat INT and WIS checks." },
    { id: "clearhead_tea", name: "Clearhead Tea", ingredients: ["silverleaf", "brambleberry"], dc: 16, property: "clear_mind", icon: "potion_clearhead",
      summary: "Clears a clouded mind, then +2 to your next INT or WIS check within 4 hours." },
    { id: "winterward_tea", name: "Winterward Tea", ingredients: ["oakheart_balsam", "shadefern"], dc: 16, property: "resist_cold", icon: "potion_winterward",
      summary: "For 4 hours: cold exposure is cut by half." },
    { id: "surestep_cordial", name: "Surestep Cordial", ingredients: ["acorn_truffle", "brambleberry"], dc: 17, property: "surefooted", icon: "potion_surestep",
      summary: "For 8 hours: +3 to footing checks on slick stone, fords, wet timber and loose scree." }
  ]
};
