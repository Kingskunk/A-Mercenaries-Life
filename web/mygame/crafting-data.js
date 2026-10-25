/*
 * crafting-data.js -- the recipes the crafting view matches the ingredient boxes against (window.CRAFT_RECIPES, by crafting kind).
 * Written by hand from the matching references in Resources & Quest/; change the table there and here together.
 * A recipe is two ingredients (item ids, in any order), the crafting check's DC, a displayed property, an icon key (item-icons.js) and a one-line result.
 * Cooking is a catalogue for the future Cooking mode. It deliberately uses the same two-ingredient shape as alchemy, but does not make the mode live yet.
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
  ],
  cooking: [
    { id: "salt_roasted_boar", name: "Salt-Roasted Boar", ingredients: ["boar_meat", "salt"], dc: 10, property: "cooked meal", icon: "cooking_salt_roasted_boar",
      summary: "A crisp-edged haunch, roasted over a steady fire and seasoned with coast salt." },
    { id: "onion_seared_venison", name: "Onion-Seared Venison", ingredients: ["venison", "onions"], dc: 10, property: "cooked meal", icon: "cooking_onion_seared_venison",
      summary: "Lean venison seared hard, then finished in the pan with sweetened onions." },
    { id: "hearth_roast_chicken", name: "Hearth-Roast Chicken and Roots", ingredients: ["dressed_chicken", "root_vegetable_bundle"], dc: 11, property: "cooked meal", icon: "cooking_hearth_roast_chicken",
      summary: "A chicken roasted with carrots and turnips until the roots take up the drippings." },
    { id: "riverfish_barley_pie", name: "Riverfish Barley Pie", ingredients: ["fish", "grain"], dc: 11, property: "cooked meal", icon: "cooking_riverfish_barley_pie",
      summary: "Flaked riverfish beneath a coarse barley crust; filling enough for the road." },
    { id: "tomato_riverfish_broth", name: "Tomato Riverfish Broth", ingredients: ["fish", "tomatoes"], dc: 11, property: "cooked meal", icon: "cooking_tomato_riverfish_broth",
      summary: "A bright, briny fish broth made to be eaten hot from the pot." },
    { id: "smoked_sausage_braise", name: "Smoked Sausage and Cabbage Braise", ingredients: ["dried_pork_sausage", "cabbage"], dc: 10, property: "cooked meal", icon: "cooking_smoked_sausage_braise",
      summary: "Cabbage softened slowly with smoked pork, its broth rich enough to sop with bread." },
    { id: "pumpkin_onion_soup", name: "Pumpkin and Onion Soup", ingredients: ["pumpkin", "onions"], dc: 10, property: "cooked meal", icon: "cooking_pumpkin_onion_soup",
      summary: "Sweet pumpkin cooked down with onions into a thick autumn soup." },
    { id: "field_garden_stew", name: "Field-Garden Stew", ingredients: ["root_vegetable_bundle", "cabbage"], dc: 10, property: "cooked meal", icon: "cooking_field_garden_stew",
      summary: "A plain, sustaining stew of cabbage, carrots and turnips." },
    { id: "honeyed_barley_porridge", name: "Honeyed Barley Porridge", ingredients: ["grain", "honey"], dc: 10, property: "cooked meal", icon: "cooking_honeyed_barley_porridge",
      summary: "Soft barley porridge sweetened with dark wild honey." },
    { id: "apple_barley_porridge", name: "Apple Barley Porridge", ingredients: ["grain", "orchard_apple"], dc: 10, property: "cooked meal", icon: "cooking_apple_barley_porridge",
      summary: "Tart orchard apple folded through a pot of barley porridge." },
    { id: "acorn_truffle_pottage", name: "Acorn-Truffle Pottage", ingredients: ["acorn_truffle", "potatoes"], dc: 12, property: "cooked meal", icon: "cooking_acorn_truffle_pottage",
      summary: "A small pot of earthy truffle and potato, worth making while the rare fungus is fresh." },
    { id: "brambleberry_honey_tart", name: "Brambleberry Honey Tart", ingredients: ["brambleberry", "honey"], dc: 12, property: "cooked meal", icon: "cooking_brambleberry_honey_tart",
      summary: "A sharp berry tart glazed with honey from the Longshade's wild bees." }
  ]
};
